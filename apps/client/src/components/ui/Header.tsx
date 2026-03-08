import './Header.scss'

import { useLocation, useNavigate } from 'react-router-dom'

import { Button } from './Button'

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header className="header">
      <div className="header__inner">

        <div className="header__left">
          {isHome ? (
            <span className="header__logo">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="16" height="16" rx="4" fill="var(--clr-accent)" />
                <path d="M6 7h8M6 10h5M6 13h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              FormLite
            </span>
          ) : (
            <Button
            variant="ghost"
            icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>}
              size = 'md'
              className="header__back"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              Back
            </Button>
          )}
        </div>

        <div className="header__right" />
      </div>
    </header>
  )
}