import {
	QuestionType,
	useGetFormQuery,
	useSubmitResponseMutation,
} from '../../app/api/generated'
import { useCallback, useEffect, useState } from 'react'

import type { ChangeEvent } from 'react'
import type { GetFormQuery } from '../../app/api/generated'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'

// Form comes from RTK Query cache — no need for Redux slice
type Form = NonNullable<GetFormQuery['form']>
type Answers = Record<string, string | string[]>

// ─── Hook to fill out a form ───

export function useFormFill() {
	const { id } = useParams<{ id: string }>()
	const { data, isLoading, error } = useGetFormQuery({ id: id! })

	return {
		form: data?.form ?? null,
		isLoading,
		error,
	}
}

// ─── Pure validation function — easy to test ────

function validateAnswers(form: Form, answers: Answers): string[] {
	const errors: string[] = []

	form.questions.forEach(q => {
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
	const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
	const [submitError, setSubmitError] = useState<string | null>(null)

useEffect(() => {
  if (!submitError) return
  toast.error(submitError)
}, [submitError])

	const [submitResponse, { isLoading, error }] = useSubmitResponseMutation()

	// Set answer for a single question
	const setAnswer = useCallback((questionId: string, value: string) => {
		setAnswers(prev => ({ ...prev, [questionId]: value.trim() }))
	}, [])

	// Toggle checkbox option
	const toggleCheckbox = useCallback((questionId: string, option: string) => {
		setAnswers(prev => {
			const current = prev[questionId]
			const arr: string[] = Array.isArray(current) ? current : []
			const next = arr.includes(option)
				? arr.filter(value => value !== option)
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
		setSubmitError(null)

try {
      const answerInputs = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value: Array.isArray(value) ? value.join(',') : value,
      }))

      await submitResponse({ formId: form.id, answers: answerInputs }).unwrap()

      setIsSubmitted(true)
      setAnswers({})
      toast.success('Response submitted!')
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to submit form'
      )
    }
	}, [form, answers, submitResponse])

  // handlers
  const handleTextChange = useCallback((e: ChangeEvent<HTMLInputElement>, questionId: string) => {
    setAnswer(questionId, e.target.value)
  }, [setAnswer])

  const handleDateChange = useCallback((e: ChangeEvent<HTMLInputElement>, questionId: string) => {  
    setAnswer(questionId, e.target.value)
  }, [setAnswer])

  const handleRadioChange = useCallback((questionId: string, option: string) => {
    setAnswer(questionId, option)
  }, [setAnswer])

  const handleCheckboxChange = useCallback((questionId: string, option: string) => {    
    toggleCheckbox(questionId, option)
  }, [toggleCheckbox])

const handleReset = useCallback(() => {
    setAnswers({})
    setValidationErrors([])
    setIsSubmitted(false)
  }, [])

	// Checks whether all required questions have been filled in

	const isFormValid = form.questions
		.filter(q => q.required)
		.every(q => {
			const answer = answers[q.id]
			if (Array.isArray(answer)) return answer.length > 0
			return typeof answer === 'string' && answer.trim().length > 0
		})

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
		isFormValid,
		useFormFill,
    handleTextChange,
    handleDateChange,
    handleRadioChange,
    handleCheckboxChange,
    handleReset,
	}
}
