/** The large token number. Used on the confirmation slip and the tracker. */
export default function TokenPlate({ tokenNumber, caption = 'Your token', hindiCaption = 'आपका टोकन', size = 'lg' }) {
  return (
    <div className={`border-2 border-brand-800 bg-brand-800 px-5 text-center text-white ${size === 'lg' ? 'py-5' : 'py-3'}`}>
      <p className="text-sm font-medium text-white/80">
        {caption}{' '}
        {hindiCaption ? <span className="ml-2">{hindiCaption}</span> : null}
      </p>
      <p className={`font-bold tnum leading-none ${size === 'lg' ? 'mt-2 text-[56px]' : 'mt-1 text-4xl'}`}>
        #{tokenNumber}
      </p>
    </div>
  )
}
