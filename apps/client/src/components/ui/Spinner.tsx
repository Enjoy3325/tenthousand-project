import { ClipLoader } from 'react-spinners'

interface SpinnerProps {
  readonly size?: number
  readonly fullPage?: boolean
  readonly label?: string
}

export function Spinner({ size = 32, fullPage = false, label = 'Loading...' }: SpinnerProps) {
  const loader = (
    <ClipLoader
      size={size}
      color="var(--clr-accent)"
      speedMultiplier={0.8}
      aria-label={label}
    />
  )

  if (fullPage) {
    return (
      <div className="loading" role="status" aria-live="polite">
        {loader}
        <span>{label}</span>
      </div>
    )
  }

  return loader
}