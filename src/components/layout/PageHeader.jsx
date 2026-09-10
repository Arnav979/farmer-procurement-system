import { Link } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'

export default function PageHeader({ title, hindiTitle, description, back, actions, meta, className = '' }) {
  return (
    <div className={`mb-5 ${className}`}>
      {back ? (
        <Link
          to={back.to}
          className="print-hide mb-3 inline-flex items-center gap-1.5 text-[15px] font-medium text-brand-700 hover:underline"
        >
          <Icon name="arrow-left" className="h-4 w-4" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-ink sm:text-[28px]">
            {title}{' '}
            {hindiTitle ? <span className="ml-3 text-lg font-medium text-muted">{hindiTitle}</span> : null}
          </h1>
          {description ? <p className="mt-1.5 text-[15px] text-muted">{description}</p> : null}
          {meta ? <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div> : null}
        </div>
        {actions ? <div className="print-hide flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}
