import { Button } from './Button'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface SuccessCardProps {
  readonly formTitle: string
  readonly submittedAt: Date
  readonly action?: ReactNode
}

// toLocaleString does not support milliseconds — we add them manually
// padStart(3, '0') ensures always 3 digits: 5 → '005', 48 → '048', 483 → '483'
// Output: "03/15/2026, 14:32:07.483"
function formatDateTime(date: Date): string {
  const base = date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const ms = date.getMilliseconds().toString().padStart(2, '0')
  return `${base}.${ms}`
}

export function SuccessCard({ formTitle, submittedAt, action }: SuccessCardProps) {
  const navigate = useNavigate()

  return (
    <div className='success-card' role='status'>
      <div className='success-card__icon' aria-hidden='true'>✅</div>
      <h2 className='success-card__title'>Response Submitted!</h2>
      <p className='success-card__subtitle'>
        Your response has been saved successfully.
      </p>
      <div className='success-card__meta'>
        <p className='success-card__form-name'>{formTitle}</p>
        <p className='success-card__time'>
          Submitted at {formatDateTime(submittedAt)}
        </p>
      </div>
      {action ?? (
        <Button variant='primary' onClick={() => navigate('/')}>
          Back to Home
        </Button>
      )}
    </div>
  )
}