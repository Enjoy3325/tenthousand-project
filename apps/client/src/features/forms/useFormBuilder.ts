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

import type { QuestionInput } from '../../app/api/generated'
import { useNavigate } from 'react-router-dom'

//  Validation logic for the form builder

function validateForm(title: string, questions: BuilderQuestion[]): string[] {
	const errors: string[] = []

	if (!title.trim()) {
		errors.push('Form title is required')
	}

	questions.forEach((q, i) => {
		if (!q.text.trim()) {
			errors.push(`Question ${i + 1}: text is required`)
		}
		if (
			(q.type === QuestionType.MultipleChoice ||
				q.type === QuestionType.Checkbox) &&
			q.options.length < MIN_OPTIONS_FOR_CHOICE
		) {
			errors.push(`Question ${i + 1}: at least 2 options are required`)
		}
	})

	return errors
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

	// Warn user before leaving page with unsaved changes
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasUnsavedChanges) {
				e.preventDefault()
			}
		}
		window.addEventListener('beforeunload', handleBeforeUnload)
		return () => window.removeEventListener('beforeunload', handleBeforeUnload)
	}, [hasUnsavedChanges])

	return {
		// State
		title,
		description,
		questions,
		hasUnsavedChanges,
		isLoading,
		error,
		saveError,
		onSave,
		canAddQuestion: questions.length < MAX_QUESTIONS,
		// Actions — simply dispatch actions in Redux
		setTitle: (value: string) => dispatch(setTitle(value)),
		setDescription: (value: string) => dispatch(setDescription(value)),
		addQuestion: () => {
			if (questions.length > MIN_QUESTIONS && questions.length < MAX_QUESTIONS) {
				dispatch(addQuestion())
			}
		},
		removeQuestion: (id: string) => dispatch(removeQuestion(id)),
		updateQuestion: (id: string, patch: UpdateQuestionPatch) =>
			dispatch(updateQuestion({ id, patch })),
		addOption: (questionId: string) => {
			const question = questions.find(q => q.id === questionId)
			if (question && question.options.length < MAX_OPTIONS_PER_QUESTION) {
				dispatch(addOption(questionId))
			}
		},
		updateOption: (questionId: string, optionId: string, label: string) =>
			dispatch(updateOption({ questionId, optionId, label })),
		removeOption: (questionId: string, optionId: string) =>
			dispatch(removeOption({ questionId, optionId })),
		handleSave,
		handleReset: () => dispatch(resetBuilder()),
	}
}
