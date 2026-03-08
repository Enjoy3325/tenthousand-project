import { describe, expect, it } from 'vitest'

import type { BuilderQuestion } from '../../forms/formBuilderSlice'
import { QuestionType } from '../../../app/api/generated'

// ─── Copies of pure functions from hooks ──────────────────────────────
// (If you move validateForm and validateAnswers to separate files, the tests
//  will import them directly. For now, we are duplicating them for demonstration purposes.)

const MIN_OPTIONS_FOR_CHOICE = 2

function validateForm(title: string, questions: BuilderQuestion[]): string[] {
	const titleErrors = title.trim() ? [] : ['Form title is required']

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

type Answers = Record<string, string | string[]>

interface MockForm {
	questions: Array<{
		id: string
		text: string
		required: boolean
		type: QuestionType
	}>
}

function validateAnswers(form: MockForm, answers: Answers): string[] {
	const errors: string[] = []

	form.questions.forEach(q => {
		if (!q.required) return
		const answer = answers[q.id]

		if (q.type === QuestionType.Checkbox) {
			if (!Array.isArray(answer) || answer.length === 0) {
				errors.push(`"${q.text}": at least one option must be selected`)
			}
		} else if (typeof answer !== 'string' || !answer.trim()) {
				errors.push(`"${q.text}": answer is required`)
		}
	})

	return errors
}

type RawAnswer = { questionId: string; value: string }

function buildAnswerMap(answers: RawAnswer[]): Record<string, RawAnswer> {
	return answers.reduce<Record<string, RawAnswer>>((acc, answer) => {
		acc[answer.questionId] = answer
		return acc
	}, {})
}

function formatDate(iso: string): string {
	return new Date(iso).toLocaleString()
}

// ─── Helpers ─────────────────────────────────────────────────
function makeQuestion(
	overrides: Partial<BuilderQuestion> = {},
): BuilderQuestion {
	return {
		id: 'q1',
		text: 'Test question',
		type: QuestionType.Text,
		required: false,
		order: 0,
		options: [],
		...overrides,
	}
}

// ─── validateForm ────────────────────────────────────────────
describe('validateForm', () => {
	it('returns an error if title is empty', () => {
		const errors = validateForm('', [])
		expect(errors).toContain('Form title is required')
	})

	it('returns an error if title only has whitespace', () => {
		const errors = validateForm('   ', [])
		expect(errors).toContain('Form title is required')
	})

	it('returns no error if title is filled', () => {
		const errors = validateForm('My Form', [])
		expect(errors).toHaveLength(0)
	})

	it('returns an error if question text is empty', () => {
		const q = makeQuestion({ text: '' })
		const errors = validateForm('My Form', [q])
		expect(errors).toContain('Question 1: text is required')
	})

	it('returns an error if MultipleChoice has no options', () => {
		const q = makeQuestion({ type: QuestionType.MultipleChoice, options: [] })
		const errors = validateForm('My Form', [q])
		expect(errors).toContain('Question 1: at least 2 options are required')
	})

	it('returns an error if MultipleChoice has only 1 option', () => {
		const q = makeQuestion({
			type: QuestionType.MultipleChoice,
			options: [{ id: 'o1', label: 'Option A' }],
		})
		const errors = validateForm('My Form', [q])
		expect(errors).toContain('Question 1: at least 2 options are required')
	})

	it('returns no error if MultipleChoice has 2+ options', () => {
		const q = makeQuestion({
			type: QuestionType.MultipleChoice,
			options: [
				{ id: 'o1', label: 'Option A' },
				{ id: 'o2', label: 'Option B' },
			],
		})
		const errors = validateForm('My Form', [q])
		expect(errors).toHaveLength(0)
	})

	it('returns an error if Checkbox has no options', () => {
		const q = makeQuestion({ type: QuestionType.Checkbox, options: [] })
		const errors = validateForm('My Form', [q])
		expect(errors).toContain('Question 1: at least 2 options are required')
	})

	it('Text and Date questions do not require options.', () => {
		const questions = [
			makeQuestion({ id: 'q1', type: QuestionType.Text }),
			makeQuestion({ id: 'q2', type: QuestionType.Date }),
		]
		const errors = validateForm('My Form', questions)
		expect(errors).toHaveLength(0)
	})

	it('collects errors from several questions', () => {
		const questions = [
			makeQuestion({ id: 'q1', text: '' }),
			makeQuestion({ id: 'q2', text: '' }),
		]
		const errors = validateForm('My Form', questions)
		expect(errors).toHaveLength(2)
		expect(errors[0]).toContain('Question 1')
		expect(errors[1]).toContain('Question 2')
	})
})

// ─── validateAnswers ─────────────────────────────────────────
describe('validateAnswers', () => {
	const form: MockForm = {
		questions: [
			{ id: 'q1', text: 'Name?', required: true, type: QuestionType.Text },
			{ id: 'q2', text: 'Age?', required: false, type: QuestionType.Text },
			{
				id: 'q3',
				text: 'Colors?',
				required: true,
				type: QuestionType.Checkbox,
			},
		],
	}

	it('There are no errors if all required fields are filled in.', () => {
		const answers: Answers = {
			q1: 'Alice',
			q3: ['Red', 'Blue'],
		}
		expect(validateAnswers(form, answers)).toHaveLength(0)
	})

	it('returns an error if required Text is empty', () => {
		const answers: Answers = { q1: '', q3: ['Red'] }
		const errors = validateAnswers(form, answers)
		expect(errors).toContain('"Name?": answer is required')
	})

	it('returns an error if required Text only has whitespace', () => {
		const answers: Answers = { q1: '   ', q3: ['Red'] }
		const errors = validateAnswers(form, answers)
		expect(errors).toContain('"Name?": answer is required')
	})

	it('does not validate optional questions', () => {
		const answers: Answers = { q1: 'Alice', q3: ['Red'] }
		// q2 is not filled but required: false — no errors expected
		expect(validateAnswers(form, answers)).toHaveLength(0)
	})

	it('returns an error if required Checkbox is an empty array', () => {
		const answers: Answers = { q1: 'Alice', q3: [] }
		const errors = validateAnswers(form, answers)
		expect(errors).toContain('"Colors?": at least one option must be selected')
	})

	it('returns an error if required Checkbox is not filled at all', () => {
		const answers: Answers = { q1: 'Alice' }
		const errors = validateAnswers(form, answers)
		expect(errors).toContain('"Colors?": at least one option must be selected')
	})

	it('accepts Checkbox with one selected option', () => {
		const answers: Answers = { q1: 'Alice', q3: ['Red'] }
		expect(validateAnswers(form, answers)).toHaveLength(0)
	})
})

// ─── buildAnswerMap ──────────────────────────────────────────
describe('buildAnswerMap', () => {
	it('builds a dictionary based on questionId', () => {
		const answers: RawAnswer[] = [
			{ questionId: 'q1', value: 'Alice' },
			{ questionId: 'q2', value: 'Blue' },
		]
		const map = buildAnswerMap(answers)
		expect(map['q1']).toEqual({ questionId: 'q1', value: 'Alice' })
		expect(map['q2']).toEqual({ questionId: 'q2', value: 'Blue' })
	})

	it('returns an empty object for an empty array', () => {
		expect(buildAnswerMap([])).toEqual({})
	})

	it('O(1) access — questionId that does not exist returns undefined', () => {
		const map = buildAnswerMap([{ questionId: 'q1', value: 'x' }])
		expect(map['q99']).toBeUndefined()
	})

	it('last duplicate overwrites previous one', () => {
		const answers: RawAnswer[] = [
			{ questionId: 'q1', value: 'first' },
			{ questionId: 'q1', value: 'second' },
		]
		const map = buildAnswerMap(answers)
		expect(map['q1'].value).toBe('second')
	})
})

// ─── formatDate ──────────────────────────────────────────────
describe('formatDate', () => {
	it('returns a string (does not throw an error))', () => {
		const result = formatDate('2024-01-15T10:30:00.000Z')
		expect(typeof result).toBe('string')
		expect(result.length).toBeGreaterThan(0)
	})

	it('returns "Invalid Date" for an invalid date', () => {
		const result = formatDate('not-a-date')
		expect(result).toBe('Invalid Date')
	})
})
