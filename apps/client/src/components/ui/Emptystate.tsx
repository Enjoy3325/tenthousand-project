import type { ReactNode } from 'react'

interface EmptyStateProps {
	readonly icon?: string
	readonly title: string
	readonly description?: string
	readonly action?: ReactNode
}

export function EmptyState({
	icon = '📋',
	title,
	description,
	action,
}: EmptyStateProps) {
	return (
		<div className='empty-state' role='status'>
			<div className='empty-state__icon' aria-hidden='true'>
				{icon}
			</div>
			<h2>{title}</h2>
			{description && <p>{description}</p>}
			{action && <div>{action}</div>}
		</div>
	)
}
