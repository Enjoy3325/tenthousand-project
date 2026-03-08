import { Button } from '../../components/ui/Button'
import { PageLayout } from '../../components/layout/PageLayout'
import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
	const navigate = useNavigate()
	return (
		<PageLayout>
			<div className='not-found' role='main'>
				<div className='not-found__code' aria-label='Error 404'>
					404
				</div>
				<h2 className='not-found__title'>Page not found</h2>
				<p>
					The page you&apos;re looking for doesn&apos;t exist or has been moved.
				</p>
				<div className='not-found__actions'>
					<Button variant='primary' size='lg' onClick={() => navigate('/')}>
						Back to Home
					</Button>
				</div>
			</div>
		</PageLayout>
	)
}
