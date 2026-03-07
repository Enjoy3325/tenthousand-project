import { QuestionType, useSubmitResponseMutation } from '../../app/api/generated'
import { useCallback, useState } from 'react'

import type { GetFormQuery } from '../../app/api/generated'

// Form comes from RTK Query cache — no need for Redux slice
type Form = NonNullable<GetFormQuery['form']>
type Answers = Record<string, string | string[]>

// ─── Pure validation function — easy to test ──────────────────────────────────

function validateAnswers(form: Form, answers: Answers): string[] {
  const errors: string[] = []

  form.questions.forEach((q) => {
    if (!q.required) return

    const answer = answers[q.id]
    const isCheckbox = q.type === QuestionType.Checkbox

    if (isCheckbox) {
      if (!Array.isArray(answer) || answer.length === 0) {
        errors.push(`"${q.text}": at least one option must be selected`)
      }
    } else {
      if (typeof answer !== 'string' || !answer.trim()) {
        errors.push(`"${q.text}": answer is required`)
      }
    }
  })

  return errors
}

// ─── Hook ───

export function useFormFiller(form: Form) {
  // Local state
  const [answers, setAnswers] = useState<Answers>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [submitResponse, { isLoading, error }] = useSubmitResponseMutation()

  // Set answer for a single question
  const setAnswer = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value.trim() }))
  }, [])

  // Toggle checkbox option
  const toggleCheckbox = useCallback((questionId: string, option: string) => {
    setAnswers((prev) => {
      const current = prev[questionId]
      const arr: string[] = Array.isArray(current) ? current : []
      const next = arr.includes(option)
        ? arr.filter((v) => v !== option)
        : [...arr, option]
      return { ...prev, [questionId]: next }
    })
  }, [])

  // Submit form
  const handleSubmit = useCallback(async (): Promise<void> => {
    const errors = validateAnswers(form, answers)
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors([])

    const answerInputs = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value: Array.isArray(value) ? value.join(',') : value,
    }))

    await submitResponse({ formId: form.id, answers: answerInputs }).unwrap()
    setIsSubmitted(true)
    setAnswers({})
  }, [form, answers, submitResponse])

  // Reset form state — for "Clear form" button
const resetForm = useCallback(() => {
  setAnswers({})
  setValidationErrors([])
  setIsSubmitted(false)
}, [])

  return {
    answers,
    validationErrors,
    isSubmitted,
    isLoading,
    error,
    setAnswer,
    toggleCheckbox,
    handleSubmit,
    resetForm,
  }
}