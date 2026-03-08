import { EmptyState } from '../../components/ui/Emptystate'
import { Link } from 'react-router-dom'
import { PageLayout } from '../../components/layout/PageLayout'
import { Spinner } from '../../components/ui/Spinner'
import { useResponses } from './useResponses'

export function FormResponsesPage() {
	const { form, responses, isLoading, error } = useResponses()

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
					Failed to load responses.
				</div>
			</PageLayout>
		)
	}

	if (!form) {
		return (
			<PageLayout>
				<div className='alert alert--error' role='alert'>
					Form not found.
				</div>
			</PageLayout>
		)
	}
	return (
		<PageLayout>
			<div className='responses-header'>
				<h1>Responses: {form.title}</h1>
				<span className='tag'>
					{responses.length} response{responses.length === 1 ? '' : 's'}
				</span>
				<Link to='/'>Back to forms</Link>

				{responses.length === 0 ? (
					<EmptyState
						icon='📭'
						title='No responses yet'
						description='Share the form link to start collecting responses.'
					/>
				) : (
					responses.map(response => (
						<div key={response.id} className='response-card'>
							<div className='response-card__header'>
								<span>#{response.shortId}</span>
								<span>{response.submittedAt}</span>
							</div>
							<div className='response-card__answers'>
								{form.questions.map(question => {
									const answer = response.answersByQuestionId[question.id]
									return (
										<div key={question.id} className='answer-row'>
											<div className='answer-row__question'>
												{question.text}
											</div>
											{answer?.value ? (
												<div className='answer-row__value'>{answer.value}</div>
											) : (
												<div className='answer-row__empty'>—</div>
											)}
										</div>
									)
								})}
							</div>
						</div>
					))
				)}
			</div>
		</PageLayout>
	)
}
