import type { BuilderQuestion, UpdateQuestionPatch } from './formBuilderSlice'
import {
	MAX_OPTIONS_PER_QUESTION,
	MAX_QUESTIONS,
	MIN_OPTIONS_FOR_CHOICE,
	MIN_QUESTIONS,
} from '../../constant'
import { QuestionType, useCreateFormMutation } from '../../app/api/generated'
import {
	addOption,
	addQuestion,
	removeOption,
	removeQuestion,
	resetBuilder,
	selectDescription,
	selectHasUnsavedChanges,
	selectQuestions,
	selectTitle,
	setDescription,
	setTitle,
	updateOption,
	updateQuestion,
} from './formBuilderSlice'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useCallback, useEffect, useState } from 'react'

import type { ChangeEvent } from 'react'
import type { QuestionInput } from '../../app/api/generated'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

//  Validation logic for the form builder

function validateForm(title: string, questions: BuilderQuestion[]): string[] {
	const titleErrors = !title.trim() ? ['Form title is required'] : []

	const questionErrors = questions.reduce<string[]>((acc, q, i) => {
		if (!q.text.trim()) {
			acc.push(`Question ${i + 1}: text is required`)
		}

		if (
			(q.type === QuestionType.MultipleChoice ||
				q.type === QuestionType.Checkbox) &&
			(!q.options || q.options.length < MIN_OPTIONS_FOR_CHOICE)
		) {
			acc.push(`Question ${i + 1}: at least 2 options are required`)
		}

		return acc
	}, [])

	return [...titleErrors, ...questionErrors]
}
function toQuestionInputs(questions: BuilderQuestion[]): QuestionInput[] {
	return questions.map(q => ({
		text: q.text,
		type: q.type,
		required: q.required,
		order: q.order,
		options:
			q.options.length > 0 ? q.options.map(o => ({ label: o.label })) : null,
	}))
}

export function useFormBuilder() {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()

	// Write state from Redux
	const title = useAppSelector(selectTitle)
	const description = useAppSelector(selectDescription)
	const questions = useAppSelector(selectQuestions)
	const hasUnsavedChanges = useAppSelector(selectHasUnsavedChanges)

	// RTK Query generates a mutation to create a form
	const [createForm, { isLoading, error }] = useCreateFormMutation()
	const [saveError, setSaveError] = useState<string | null>(null)

	// ─── Side effects — toast notifications ───
	useEffect(() => {
		if (saveError) toast.error(saveError)
	}, [saveError])

	useEffect(() => {
		if (error) toast.error('Server error. Please try again.')
	}, [error])

	// ─── Warn before leaving with unsaved changes ───
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasUnsavedChanges) e.preventDefault()
		}
		window.addEventListener('beforeunload', handleBeforeUnload)
		return () => window.removeEventListener('beforeunload', handleBeforeUnload)
	}, [hasUnsavedChanges])

	// Save form
	const handleSave = useCallback(async (): Promise<void> => {
		const errors = validateForm(title, questions)
		if (errors.length > 0) {
			throw new Error(errors.join('\n'))
		}

		const result = await createForm({
			title,
			description: description || null,
			questions: toQuestionInputs(questions),
		}).unwrap() // .unwrap() — throws an error if the request failed

		dispatch(resetBuilder())
		navigate(`/forms/${result.createForm.id}/fill`)
	}, [title, description, questions, createForm, dispatch, navigate])

	const onSave = useCallback(async (): Promise<void> => {
		setSaveError(null)
		try {
			await handleSave()
		} catch (err) {
			setSaveError(err instanceof Error ? err.message : 'Failed to save form')
		}
	}, [handleSave])

	// ─── Input handlers — ChangeEvent ───
	const handleTitleChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => dispatch(setTitle(e.target.value)),
		[dispatch],
	)

	const handleDescriptionChange = useCallback(
		(e: ChangeEvent<HTMLTextAreaElement>) =>
			dispatch(setDescription(e.target.value)),
		[dispatch],
	)

	const handleTypeChange = useCallback(
		(e: ChangeEvent<HTMLSelectElement>, questionId: string) => {
			dispatch(
				updateQuestion({
					id: questionId,
					patch: { type: e.target.value as QuestionType },
				}),
			)
		},
		[dispatch],
	)

	const handleQuestionTextChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>, questionId: string) => {
			dispatch(
				updateQuestion({ id: questionId, patch: { text: e.target.value } }),
			)
		},
		[dispatch],
	)

	const handleRequiredChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>, questionId: string) => {
			dispatch(
				updateQuestion({
					id: questionId,
					patch: { required: e.target.checked },
				}),
			)
		},
		[dispatch],
	)

	const handleOptionChange = useCallback(
		(
			e: ChangeEvent<HTMLInputElement>,
			questionId: string,
			optionId: string,
		) => {
			dispatch(updateOption({ questionId, optionId, label: e.target.value }))
		},
		[dispatch],
	)
	const handleAddQuestion = useCallback(() => {
		if (questions.length < MAX_QUESTIONS) {
			dispatch(addQuestion())
		}
	}, [dispatch, questions.length])

	const handleRemoveQuestion = useCallback(
		(id: string) => dispatch(removeQuestion(id)),
		[dispatch],
	)

	const handleAddOption = useCallback(
		(questionId: string) => {
			const question = questions.find(q => q.id === questionId)
			if (question && question.options.length < MAX_OPTIONS_PER_QUESTION) {
				dispatch(addOption(questionId))
			}
		},
		[dispatch, questions],
	)

	const handleRemoveOption = useCallback(
		(questionId: string, optionId: string) =>
			dispatch(removeOption({ questionId, optionId })),
		[dispatch],
	)

	const handleReset = useCallback(() => dispatch(resetBuilder()), [dispatch])

	return {
		// State
		title,
		description,
		questions,
		hasUnsavedChanges,
		isLoading,
		error,
		saveError,
		canAddQuestion: questions.length < MAX_QUESTIONS,

		// Input handlers
		handleTitleChange,
		handleDescriptionChange,
		handleTypeChange,
		handleQuestionTextChange,
		handleRequiredChange,
		handleOptionChange,

		// Actions
		onSave,
		handleAddQuestion,
		handleRemoveQuestion,
		handleAddOption,
		handleRemoveOption,
		handleReset,
	}
}
