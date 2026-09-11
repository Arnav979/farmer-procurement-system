from datetime import date

from django.db import transaction
from django.utils import timezone
from rest_framework import generics, mixins, status
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Booking, Procurement, ProcurementCentre, QueueEntry, Slot
from .permissions import IsFarmerUser, IsOfficerUser
from .serializers import (
    BookingCreateSerializer,
    BookingSerializer,
    FarmerRegistrationSerializer,
    FarmerSerializer,
    PhoneTokenObtainPairSerializer,
    ProcurementCentreSerializer,
    ProcurementCreateSerializer,
    ProcurementSerializer,
    QueueEntryOfficerSerializer,
    QueueEntrySerializer,
    SlotSerializer,
)


class FarmerRegistrationView(generics.CreateAPIView):
    serializer_class = FarmerRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        farmer = serializer.save()
        return Response(FarmerSerializer(farmer).data, status=status.HTTP_201_CREATED)


class PhoneTokenObtainPairView(TokenObtainPairView):
    serializer_class = PhoneTokenObtainPairSerializer
    permission_classes = [AllowAny]


class MeView(generics.RetrieveAPIView):
    serializer_class = FarmerSerializer
    permission_classes = [IsFarmerUser]

    def get_object(self):
        return self.request.user.farmer


class ProcurementCentreViewSet(mixins.ListModelMixin, GenericViewSet):
    queryset = ProcurementCentre.objects.filter(is_active=True).order_by('name')
    serializer_class = ProcurementCentreSerializer
    permission_classes = [IsFarmerUser]

    @action(detail=True, methods=['get'], url_path='slots')
    def slots(self, request, pk=None):
        centre = self.get_object()
        slots = centre.slots.filter(status=Slot.OPEN)
        date_param = request.query_params.get('date')
        if date_param:
            slots = slots.filter(date=date_param)
        slots = slots.order_by('date', 'start_time')
        return Response(SlotSerializer(slots, many=True).data)

    @action(detail=True, methods=['get'], url_path='queue', permission_classes=[IsOfficerUser])
    def queue(self, request, pk=None):
        centre = self.get_object()
        entries = QueueEntry.objects.filter(
            booking__slot__centre=centre, booking__slot__date=date.today()
        ).select_related('booking__farmer', 'booking__slot__centre').order_by('token_number')
        return Response(QueueEntryOfficerSerializer(entries, many=True).data)

    @action(detail=True, methods=['post'], url_path='queue/call-next', permission_classes=[IsOfficerUser])
    def call_next(self, request, pk=None):
        centre = self.get_object()
        with transaction.atomic():
            entry = QueueEntry.objects.select_for_update().filter(
                booking__slot__centre=centre, booking__slot__date=date.today(), status=QueueEntry.WAITING,
            ).order_by('token_number').first()
            if entry is None:
                return Response({'detail': 'No farmers waiting in the queue.'})
            entry.status = QueueEntry.CALLED
            entry.called_at = timezone.now()
            entry.save(update_fields=['status', 'called_at'])
        return Response(QueueEntryOfficerSerializer(entry).data)


class BookingViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.RetrieveModelMixin, GenericViewSet):
    permission_classes = [IsFarmerUser]

    def get_queryset(self):
        queryset = Booking.objects.select_related('slot', 'slot__centre').order_by('-booked_at')
        if self.action == 'record_procurement':
            return queryset
        return queryset.filter(farmer=self.request.user.farmer)

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save(farmer=request.user.farmer)
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], url_path='cancel')
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status != Booking.BOOKED:
            return Response(
                {'detail': 'Only bookings with status BOOKED can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = Booking.CANCELLED
        booking.save(update_fields=['status'])
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['post'], url_path='check-in')
    def check_in(self, request, pk=None):
        booking = self.get_object()

        existing = getattr(booking, 'queue_entry', None)
        if existing:
            return Response(QueueEntrySerializer(existing).data)

        if booking.status != Booking.BOOKED:
            return Response(
                {'detail': 'Only bookings with status BOOKED can check in.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = date.today()
        slot_date = booking.slot.date
        if slot_date > today:
            return Response(
                {'detail': f'Check-in is not open yet; this slot is on {slot_date}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if slot_date < today:
            return Response(
                {'detail': f'Check-in has closed; this slot was on {slot_date}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            existing_tokens = list(
                QueueEntry.objects.select_for_update().filter(
                    booking__slot__centre_id=booking.slot.centre_id, booking__slot__date=slot_date,
                ).values_list('token_number', flat=True)
            )
            token_number = (max(existing_tokens) if existing_tokens else 0) + 1
            entry = QueueEntry.objects.create(booking=booking, token_number=token_number, status=QueueEntry.WAITING)

        return Response(QueueEntrySerializer(entry).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='procurement', permission_classes=[IsOfficerUser])
    def record_procurement(self, request, pk=None):
        booking = self.get_object()

        existing = getattr(booking, 'procurement', None)
        if existing:
            return Response(ProcurementSerializer(existing).data)

        queue_entry = getattr(booking, 'queue_entry', None)
        if queue_entry is None or queue_entry.status != QueueEntry.SERVED:
            return Response(
                {'detail': 'Procurement can only be recorded after the farmer has been SERVED in the queue.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ProcurementCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            procurement = Procurement.objects.create(
                booking=booking,
                commodity=data['commodity'],
                quantity_kg=data['quantity_kg'],
                rate_per_kg=data['rate_per_kg'],
                total_amount=data['quantity_kg'] * data['rate_per_kg'],
                status=Procurement.COMPLETED,
                payment_status=Procurement.PAYMENT_PENDING,
                procured_at=timezone.now(),
            )
            booking.status = Booking.COMPLETED
            booking.save(update_fields=['status'])

        return Response(ProcurementSerializer(procurement).data, status=status.HTTP_201_CREATED)


class ProcurementViewSet(GenericViewSet):
    queryset = Procurement.objects.select_related('booking__farmer', 'booking__slot__centre')
    serializer_class = ProcurementSerializer
    permission_classes = [IsOfficerUser]

    @action(detail=True, methods=['patch'], url_path='mark-paid')
    def mark_paid(self, request, pk=None):
        procurement = self.get_object()
        if procurement.payment_status != Procurement.PAYMENT_PENDING:
            return Response(
                {'detail': 'Only a PENDING payment can be marked as PAID.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Mock DBT credit: no real payment gateway integration, just a manual status flip.
        procurement.payment_status = Procurement.PAYMENT_PAID
        procurement.save(update_fields=['payment_status'])
        return Response(ProcurementSerializer(procurement).data)


class QueueEntryViewSet(GenericViewSet):
    queryset = QueueEntry.objects.select_related('booking__farmer', 'booking__slot__centre')
    serializer_class = QueueEntryOfficerSerializer
    permission_classes = [IsOfficerUser]

    @action(detail=True, methods=['get'], url_path='status', permission_classes=[IsFarmerUser])
    def status_(self, request, pk=None):
        entry = self.get_object()
        if entry.booking.farmer_id != request.user.farmer.id:
            raise NotFound('No queue entry found.')
        return Response(QueueEntrySerializer(entry).data)

    @action(detail=True, methods=['patch'], url_path='serve')
    def serve(self, request, pk=None):
        entry = self.get_object()
        if entry.status != QueueEntry.CALLED:
            return Response(
                {'detail': 'Only a CALLED entry can be marked as SERVING.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        entry.status = QueueEntry.SERVING
        entry.save(update_fields=['status'])
        return Response(QueueEntryOfficerSerializer(entry).data)

    @action(detail=True, methods=['patch'], url_path='complete')
    def complete(self, request, pk=None):
        entry = self.get_object()
        if entry.status != QueueEntry.SERVING:
            return Response(
                {'detail': 'Only a SERVING entry can be marked as SERVED.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        entry.status = QueueEntry.SERVED
        entry.served_at = timezone.now()
        entry.save(update_fields=['status', 'served_at'])
        return Response(QueueEntryOfficerSerializer(entry).data)

    @action(detail=True, methods=['patch'], url_path='skip')
    def skip(self, request, pk=None):
        entry = self.get_object()
        if entry.status not in (QueueEntry.WAITING, QueueEntry.CALLED):
            return Response(
                {'detail': 'Only a WAITING or CALLED entry can be skipped.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        entry.status = QueueEntry.SKIPPED
        entry.save(update_fields=['status'])
        return Response(QueueEntryOfficerSerializer(entry).data)
