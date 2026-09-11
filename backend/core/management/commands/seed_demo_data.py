"""
Seed demo data for PS 26032 (Farmer Procurement System).

Run with: python manage.py seed_demo_data

Safe to re-run: it clears its own previously-seeded rows (identified by the
DEMO- centre code prefix and 7000000xxx farmer phone prefix) before creating
fresh ones. It never touches real/non-seed data.

Test farmer login credentials (all share the same password), via POST /api/auth/login/:
    Password: Demo@1234
    Phones:   7000000001 .. 7000000008

Test officer login credentials, via POST /api/auth/officer-login/ (username + password):
    Username: officer1
    Password: Officer@1234
"""

import random
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Booking, Farmer, ProcurementCentre, Slot

User = get_user_model()

DEMO_PASSWORD = 'Demo@1234'
PHONE_PREFIX = '70000000'

OFFICER_USERNAME = 'officer1'
OFFICER_PASSWORD = 'Officer@1234'

CENTRES = [
    dict(code='DEMO-PB01', name='Ludhiana Grain Procurement Centre — Demo', district='Ludhiana', state='Punjab'),
    dict(code='DEMO-PB02', name='Amritsar Grain Procurement Centre — Demo', district='Amritsar', state='Punjab'),
    dict(code='DEMO-MP01', name='Indore Grain Procurement Centre — Demo', district='Indore', state='Madhya Pradesh'),
    dict(code='DEMO-MP02', name='Ujjain Grain Procurement Centre — Demo', district='Ujjain', state='Madhya Pradesh'),
    dict(code='DEMO-RJ01', name='Kota Grain Procurement Centre — Demo', district='Kota', state='Rajasthan'),
]

FARMERS = [
    dict(phone='7000000001', full_name='Ramesh Singh', village='Sultanpur', district='Ludhiana', state='Punjab'),
    dict(phone='7000000002', full_name='Gurpreet Kaur', village='Chheharta', district='Amritsar', state='Punjab'),
    dict(phone='7000000003', full_name='Mohan Patel', village='Rajendra Nagar', district='Indore', state='Madhya Pradesh'),
    dict(phone='7000000004', full_name='Sunita Verma', village='Nagda', district='Ujjain', state='Madhya Pradesh'),
    dict(phone='7000000005', full_name='Devi Lal', village='Ramganj Mandi', district='Kota', state='Rajasthan'),
    dict(phone='7000000006', full_name='Kamla Devi', village='Sultanpur', district='Ludhiana', state='Punjab'),
    dict(phone='7000000007', full_name='Suresh Yadav', village='Sanwer', district='Indore', state='Madhya Pradesh'),
    dict(phone='7000000008', full_name='Pooja Meena', village='Baran Road', district='Kota', state='Rajasthan'),
]

TIME_WINDOWS = [
    ('08:00', '10:00'),
    ('11:00', '13:00'),
    ('14:00', '16:00'),
]

SLOT_DAYS_AHEAD = 14


class Command(BaseCommand):
    help = 'Seed demo data for PS 26032 (centres, slots, farmers, bookings). Safe to re-run.'

    def handle(self, *args, **options):
        random.seed(42)
        with transaction.atomic():
            self._clear_existing()
            centres = self._create_centres()
            slots_by_centre = self._create_slots(centres)
            farmers = self._create_farmers()
            bookings = self._create_bookings(farmers, slots_by_centre)
            officer = self._create_officer()

        self._print_summary(centres, slots_by_centre, farmers, bookings, officer)

    def _clear_existing(self):
        self.stdout.write('Clearing existing demo data (DEMO- centres, 7000000xxx farmers, officer1)...')
        deleted_users, _ = User.objects.filter(username__startswith=PHONE_PREFIX).delete()
        deleted_centres, _ = ProcurementCentre.objects.filter(code__startswith='DEMO-').delete()
        deleted_officer, _ = User.objects.filter(username=OFFICER_USERNAME).delete()
        self.stdout.write(
            f'  Removed {deleted_users} user-linked row(s), {deleted_centres} centre-linked row(s), '
            f'{deleted_officer} officer row(s).'
        )

    def _create_centres(self):
        centres = []
        for c in CENTRES:
            centre = ProcurementCentre.objects.create(
                name=c['name'],
                code=c['code'],
                address=f"Mandi Road, {c['district']}",
                district=c['district'],
                state=c['state'],
                daily_capacity=random.randint(100, 300),
                contact_number=f'01{random.randint(100000000, 999999999)}',
                is_active=True,
            )
            centres.append(centre)
        return centres

    def _create_slots(self, centres):
        slots_by_centre = {}
        today = date.today()
        for centre in centres:
            centre_slots = []
            for day_offset in range(1, SLOT_DAYS_AHEAD + 1):
                slot_date = today + timedelta(days=day_offset)
                for start_str, end_str in TIME_WINDOWS:
                    roll = random.random()
                    if roll < 0.1:
                        status = Slot.CLOSED
                    elif roll < 0.2:
                        status = Slot.FULL
                    else:
                        status = Slot.OPEN
                    slot = Slot.objects.create(
                        centre=centre,
                        date=slot_date,
                        start_time=start_str,
                        end_time=end_str,
                        capacity=random.randint(15, 30),
                        status=status,
                    )
                    centre_slots.append(slot)
            slots_by_centre[centre.code] = centre_slots
        return slots_by_centre

    def _create_farmers(self):
        farmers = []
        for f in FARMERS:
            user = User.objects.create_user(username=f['phone'], password=DEMO_PASSWORD)
            farmer = Farmer.objects.create(
                user=user,
                full_name=f['full_name'],
                phone_number=f['phone'],
                village=f['village'],
                district=f['district'],
                state=f['state'],
                is_verified=True,
            )
            farmers.append(farmer)
        return farmers

    def _create_bookings(self, farmers, slots_by_centre):
        def open_slot(centre_code, index):
            slot = slots_by_centre[centre_code][index]
            slot.status = Slot.OPEN
            slot.save(update_fields=['status'])
            return slot

        plan = [
            (farmers[0], open_slot('DEMO-PB01', 0), Booking.BOOKED),
            (farmers[1], open_slot('DEMO-PB02', 1), Booking.BOOKED),
            (farmers[2], open_slot('DEMO-MP01', 3), Booking.COMPLETED),
            (farmers[3], open_slot('DEMO-MP01', 4), Booking.CANCELLED),
            (farmers[4], open_slot('DEMO-RJ01', 2), Booking.BOOKED),
            (farmers[5], open_slot('DEMO-PB01', 6), Booking.COMPLETED),
            (farmers[6], open_slot('DEMO-MP02', 5), Booking.CANCELLED),
            (farmers[7], open_slot('DEMO-PB02', 7), Booking.BOOKED),
        ]

        bookings = []
        for i, (farmer, slot, status) in enumerate(plan, start=1):
            booking = Booking.objects.create(
                farmer=farmer,
                slot=slot,
                reference_code=f'DEMO-BK-{i:03d}',
                status=status,
                expected_quantity_kg=random.choice(['50.00', '80.00', '120.00', '150.00']),
            )
            bookings.append(booking)
        return bookings

    def _create_officer(self):
        return User.objects.create_user(
            username=OFFICER_USERNAME,
            password=OFFICER_PASSWORD,
            is_staff=True,
            first_name='Demo Officer',
        )

    def _print_summary(self, centres, slots_by_centre, farmers, bookings, officer):
        total_slots = sum(len(s) for s in slots_by_centre.values())
        self.stdout.write(self.style.SUCCESS('\nSeed complete.'))
        self.stdout.write(f'  Centres:  {len(centres)}')
        self.stdout.write(f'  Slots:    {total_slots}')
        self.stdout.write(f'  Farmers:  {len(farmers)}')
        self.stdout.write(f'  Bookings: {len(bookings)}')
        self.stdout.write('  Officers: 1')

        self.stdout.write('\nTest farmer logins (POST /api/auth/login/, all share the same password):')
        self.stdout.write(f'  Password: {DEMO_PASSWORD}')
        for f in FARMERS:
            self.stdout.write(f"  {f['phone']}  ({f['full_name']})")

        self.stdout.write('\nTest officer login (POST /api/auth/officer-login/, username + password):')
        self.stdout.write(f'  Username: {officer.username}')
        self.stdout.write(f'  Password: {OFFICER_PASSWORD}')
