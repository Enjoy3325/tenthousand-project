import { QuestionType } from '../../app/api/generated'
import { useFormBuilder } from './useFormBuilder'

export function FormBuilderPage() {
	const {
		title,
		description,
		questions,
		hasUnsavedChanges,
		isLoading,
		error,
		saveError,
		onSave,
		setTitle,
		setDescription,
		addQuestion,
		removeQuestion,
		updateQuestion,
		addOption,
		updateOption,
		removeOption,
	} = useFormBuilder()

	return (
		<div>
			<h1>New Form</h1>

			{/* Form title and description */}
			<div>
				<input
					type='text'
					placeholder='Form title'
					value={title}
					onChange={e => setTitle(e.target.value)}
				/>
				<textarea
					placeholder='Form description (optional)'
					value={description}
					onChange={e => setDescription(e.target.value)}
				/>
			</div>

			{/* Questions list */}
			<div>
				{questions.map((question, index) => (
					<div key={question.id}>
						<input
							type='text'
							placeholder={`Question ${index + 1}`}
							value={question.text}
							onChange={e =>
								updateQuestion(question.id, { text: e.target.value })
							}
						/>

						{/* Question type selector */}
						<select
							value={question.type}
							onChange={e =>
								updateQuestion(question.id, {
									type: e.target.value as QuestionType,
								})
							}
						>
							<option value={QuestionType.Text}>Text</option>
							<option value={QuestionType.MultipleChoice}>
								Multiple Choice
							</option>
							<option value={QuestionType.Checkbox}>Checkbox</option>
							<option value={QuestionType.Date}>Date</option>
						</select>

						{/* Required toggle */}
						<label>
							<input
								type='checkbox'
								checked={question.required}
								onChange={e =>
									updateQuestion(question.id, { required: e.target.checked })
								}
							/>
							<span>Required</span>
						</label>

						{/* Options for Multiple Choice and Checkbox */}
						{(question.type === QuestionType.MultipleChoice ||
							question.type === QuestionType.Checkbox) && (
							<div>
								{question.options.map(option => (
									<div key={option.id}>
										<input
											type='text'
											placeholder='Option label'
											value={option.label}
											onChange={e =>
												updateOption(question.id, option.id, e.target.value)
											}
										/>
										<button
											onClick={() => removeOption(question.id, option.id)}
										>
											Remove option
										</button>
									</div>
								))}
								<button onClick={() => addOption(question.id)}>
									Add option
								</button>
							</div>
						)}

						<button onClick={() => removeQuestion(question.id)}>
							Remove question
						</button>
					</div>
				))}
			</div>

			{/* Add question button */}
			<button onClick={addQuestion}>Add question</button>

			{/* Errors */}
			{saveError && <p style={{ color: 'red' }}>{saveError}</p>}
			{error && <p style={{ color: 'red' }}>Server error</p>}

			{/* Save button */}
			{hasUnsavedChanges && (
				<p style={{ color: 'orange' }}>You have unsaved changes</p>
			)}
			<button onClick={onSave} disabled={isLoading || !title.trim()}>
				{isLoading ? 'Saving...' : 'Save form'}
			</button>
		</div>
	)
}
