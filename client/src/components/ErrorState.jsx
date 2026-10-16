import { CircleAlert, RotateCw } from 'lucide-react'

export default function ErrorState({
  title = "Couldn't load this",
  description = 'Check that the backend is running, then try again.',
  onRetry,
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-card border border-line bg-paper px-6 py-14 text-center"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <CircleAlert size={24} aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-sm text-muted">{description}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          <RotateCw size={15} aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  )
}
