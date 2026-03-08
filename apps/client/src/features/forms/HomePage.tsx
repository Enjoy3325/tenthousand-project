import { getErrorMessage, useForms } from './useForms'

import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/Emptystate'
import { PageLayout } from '../../components/layout/PageLayout'
import { Spinner } from '../../components/ui/Spinner'
import { useNavigate } from 'react-router-dom'

export function HomePage() {
	const { forms, isLoading, error } = useForms()
	const navigate = useNavigate()

	if (isLoading) {
		return (
			<PageLayout>
				<Spinner fullPage />
			</PageLayout>
		)
	}

	if (error) {
		return (
			<PageLayout>
				<div className='alert alert--error' role='alert'>
					{getErrorMessage(error)}
				</div>
			</PageLayout>
		)
	}
	return (
		<PageLayout>
			<div className='home-header'>
				<div>
					<h1>My Forms</h1>
					{forms.length > 0 && (
						<Button variant='primary' onClick={() => navigate('/forms/new')}>
							Create new form
						</Button>
					)}
				</div>

				{!isLoading && !error && (
					<>
						{forms.length === 0 ? (
							<EmptyState
								icon='📝'
								title='No forms yet'
								description='Create your first form to start collecting responses.'
								action={
									<Button
										variant='primary'
										size='lg'
										onClick={() => navigate('/forms/new')}
									>
										Create your first form
									</Button>
								}
							/>
						) : (
							<ul className='forms-grid'>
								{forms.map(form => (
									<li key={form.id} className='form-card'>
										<h3 className='form-card__title'>{form.title}</h3>
										{form.description && (
											<p className='form-card__description'>
												{form.description}
											</p>
										)}
										<div className='form-card__wrapper'>
											<div className='form-card__actions'>
												<Button
													variant='primary'
													size='sm'
													onClick={() => navigate(`/forms/${form.id}/fill`)}
												>
													{''}
													Fill form
												</Button>
											</div>
											<div className='form-card__actions'>
												<Button
													variant='secondary'
													size='sm'
													onClick={() =>
														navigate(`/forms/${form.id}/responses`)
													}
												>
													{''}
													View Responses
												</Button>
											</div>
										</div>
									</li>
								))}
							</ul>
						)}
					</>
				)}
			</div>
		</PageLayout>
	)
}
