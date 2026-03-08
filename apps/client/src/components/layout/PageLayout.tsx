import './PageLayout.scss'

import { Header } from '../ui/Header'
import type { ReactNode } from 'react'

interface PageLayoutProps {
	readonly children: ReactNode
	readonly wide?: boolean
}

export function PageLayout({ children, wide = false }: PageLayoutProps) {
	return (
		<div className='layout'>
			<Header />
			<div className={wide ? 'page-wide' : 'page'}>{children}</div>
		</div>
	)
}
