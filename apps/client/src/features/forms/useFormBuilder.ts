import type { BuilderQuestion, UpdateQuestionPatch } from './formBuilderSlice'
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

import type { QuestionInput } from '../../app/api/generated'
import { useCallback } from 'react'
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
      (q.type === QuestionType.MultipleChoice || q.type === QuestionType.Checkbox) &&
      q.options.length < 2
    ) {
      errors.push(`Question ${i + 1}: at least 2 options are required`)
    }
  })

  return errors
}

function toQuestionInputs(questions: BuilderQuestion[]): QuestionInput[] {
  return questions.map((q) => ({
    text: q.text,
    type: q.type,
    required: q.required,
    order: q.order,
    options: q.options.length > 0
      ? q.options.map((o) => ({ label: o.label }))
      : null,
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
    }).unwrap()  // .unwrap() — throws an error if the request failed

    dispatch(resetBuilder())
    navigate(`/forms/${result.createForm.id}/fill`)
  }, [title, description, questions, createForm, dispatch, navigate])

  return {
    // State
    title,
    description,
    questions,
    hasUnsavedChanges,
    isLoading,
    error,
    // Actions — simply dispatch actions in Redux
    setTitle: (v: string) => dispatch(setTitle(v)),
    setDescription: (v: string) => dispatch(setDescription(v)),
    addQuestion: () => dispatch(addQuestion()),
    removeQuestion: (id: string) => dispatch(removeQuestion(id)),
    updateQuestion: (id: string, patch: UpdateQuestionPatch) =>
  dispatch(updateQuestion({ id, patch })),
    addOption: (questionId: string) => dispatch(addOption(questionId)),
    updateOption: (questionId: string, optionId: string, label: string) =>
      dispatch(updateOption({ questionId, optionId, label })),
    removeOption: (questionId: string, optionId: string) =>
      dispatch(removeOption({ questionId, optionId })),
    handleSave,
    handleReset: () => dispatch(resetBuilder()),
  }
}