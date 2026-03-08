import { Button } from '../../components/ui/Button'
import type { GetFormQuery } from '../../app/api/generated'
import { QuestionType } from '../../app/api/generated'
import { useFormFiller } from './useFormFiller'
import { useNavigate } from 'react-router-dom'

type Form = NonNullable<GetFormQuery['form']>

interface Props {
	readonly form: Form
}

export function FormFiller({ form }: Props) {
	const {
		answers,
		validationErrors,
		isSubmitted,
		isLoading,
		// setAnswer,
		// toggleCheckbox,
		handleSubmit,
		handleTextChange,
		handleDateChange,
		handleRadioChange,
		handleCheckboxChange,
		isFormValid,
		// handleReset,
	} = useFormFiller(form)

	const navigate = useNavigate()
	// Success state — after submit
	if (isSubmitted) {
		return (
			<div className='success-card'>
				<div className='success-card__icon' aria-hidden='true'>
					✅
				</div>
				<h2>Response submitted!</h2>
				<p>Thank you for filling out the form.</p>
				<Button variant='primary' onClick={() => navigate('/')}>
					Home
				</Button>
			</div>
		)
	}

	return (
		<>
			<div className='filler__header'>
				<h1>{form.title}</h1>
				{form.description && <p>{form.description}</p>}
			</div>
			{/* Validation errors */}
			{validationErrors.length > 0 && (
				<div className='alert alert--error' role='alert'>
					<ul className='alert__list'>
						{validationErrors.map(err => (
							<li key={err}>{err}</li>
						))}
					</ul>
				</div>
			)}

			{/* Questions */}
			<div className='questions-fill-list'>
				{form.questions.map(question => (
					<div key={question.id} className='question-fill-card'>
						<p className='question-fill-card__text'>
							{question.text}
							{question.required && (
								<span className='required-star' aria-hidden='true'>
									{' '}
									*
								</span>
							)}
						</p>

						{/* Text input */}
						{question.type === QuestionType.Text && (
							<input
								type='text'
								value={(answers[question.id] as string) ?? ''}
								onChange={e => handleTextChange(e, question.id)}
							/>
						)}

						{/* Date input */}
						{question.type === QuestionType.Date && (
							<input
								type='date'
								value={(answers[question.id] as string) ?? ''}
								onChange={e => handleDateChange(e, question.id)}
							/>
						)}

						{/* Multiple choice — radio buttons */}
						{question.type === QuestionType.MultipleChoice && (
							<div>
								{question.options?.map(option => (
									<label key={option.id} className='check-label'>
										<input
											type='radio'
											name={question.id}
											value={option.label}
											checked={
												(answers[question.id] as string) === option.label
											}
											onChange={() =>
												handleRadioChange(question.id, option.label)
											}
										/>
										{option.label}
									</label>
								))}
							</div>
						)}

						{/* Checkbox */}
						{question.type === QuestionType.Checkbox && (
							<div>
								{question.options?.map(option => (
									<label key={option.id} className='check-label'>
										<input
											type='checkbox'
											checked={
												Array.isArray(answers[question.id]) &&
												(answers[question.id] as string[]).includes(
													option.label,
												)
											}
											onChange={() =>
												handleCheckboxChange(question.id, option.label)
											}
										/>
										{option.label}
									</label>
								))}
							</div>
						)}
					</div>
				))}
			</div>
			{/* Submit button */}
			<div className='filler__submit'>
				<Button
					variant='primary'
					size='lg'
					loading={isLoading}
					disabled={!isFormValid}
					onClick={handleSubmit}
				>
					Submit
				</Button>
			</div>
		</>
	)
}
