import type { GetFormQuery } from '../../app/api/generated'
import { QuestionType } from '../../app/api/generated'
import { useFormFiller } from './useFormFiller'

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
		setAnswer,
		toggleCheckbox,
		handleSubmit,
		isFormValid,
		resetForm,
	} = useFormFiller(form)

	// Success state — after submit
	if (isSubmitted) {
		return (
			<div>
				<h2>Response submitted!</h2>
				<button onClick={resetForm}>Fill again</button>
			</div>
		)
	}

	return (
		<div>
			<h1>{form.title}</h1>
			{form.description && <p>{form.description}</p>}

			{/* Validation errors */}
			{validationErrors.length > 0 && (
				<ul style={{ color: 'red' }}>
					{validationErrors.map(err => (
						<li key={err}>{err}</li>
					))}
				</ul>
			)}

			{/* Questions */}
			{form.questions.map(question => (
				<div key={question.id}>
					<p>
						{question.text}
						{question.required && <span style={{ color: 'red' }}> *</span>}
					</p>

					{/* Text input */}
					{question.type === QuestionType.Text && (
						<input
							type='text'
							value={(answers[question.id] as string) ?? ''}
							onChange={e => setAnswer(question.id, e.target.value)}
						/>
					)}

					{/* Date input */}
					{question.type === QuestionType.Date && (
						<input
							type='date'
							value={(answers[question.id] as string) ?? ''}
							onChange={e => setAnswer(question.id, e.target.value)}
						/>
					)}

					{/* Multiple choice — radio buttons */}
					{question.type === QuestionType.MultipleChoice && (
						<div>
							{question.options?.map(option => (
								<label key={option.id}>
									<input
										type='radio'
										name={question.id}
										value={option.label}
										checked={(answers[question.id] as string) === option.label}
										onChange={() => setAnswer(question.id, option.label)}
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
								<label key={option.id}>
									<input
										type='checkbox'
										checked={
											Array.isArray(answers[question.id]) &&
											(answers[question.id] as string[]).includes(option.label)
										}
										onChange={() => toggleCheckbox(question.id, option.label)}
									/>
									{option.label}
								</label>
							))}
						</div>
					)}
				</div>
			))}

			{/* Submit button */}
			<button onClick={handleSubmit} disabled={isLoading || !isFormValid}>
				{isLoading ? 'Submitting...' : 'Submit'}
			</button>
		</div>
	)
}
