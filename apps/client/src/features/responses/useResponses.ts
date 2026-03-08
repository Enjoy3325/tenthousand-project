import type { GetFormQuery, GetResponsesQuery } from '../../app/api/generated'
import { useGetFormQuery, useGetResponsesQuery } from '../../app/api/generated'

import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { SerializedError } from '@reduxjs/toolkit'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

type Form = NonNullable<GetFormQuery['form']>
type RawResponse = GetResponsesQuery['responses'][number]
type RawAnswer = RawResponse['answers'][number]

// ─── Enriched types ───

export interface MappedAnswer {
	readonly questionId: string
	readonly value: string | null
}

export interface MappedResponse {
	readonly id: string
	readonly shortId: string
	readonly submittedAt: string
	readonly answersByQuestionId: Record<string, RawAnswer>
}

// ─── Pure helpers ───

function formatDate(iso: string): string {
	return new Date(iso).toLocaleString()
}

function buildAnswerMap(answers: RawAnswer[]): Record<string, RawAnswer> {
	return answers.reduce<Record<string, RawAnswer>>((acc, answer) => {
		acc[answer.questionId] = answer
		return acc
	}, {})
}

// ─── Hook ───

interface UseResponsesReturn {
	form: Form | null
	responses: MappedResponse[]
	isLoading: boolean
	error: FetchBaseQueryError | SerializedError | undefined
}

export function useResponses(): UseResponsesReturn {
	const { id } = useParams<{ id: string }>()

	const {
		data: formData,
		isLoading: formLoading,
		error: formError,
	} = useGetFormQuery({ id: id! })

	const {
		data: responsesData,
		isLoading: responsesLoading,
		error: responsesError,
	} = useGetResponsesQuery({ formId: id! })

	const responses = useMemo<MappedResponse[]>(() => {
		const raw = responsesData?.responses ?? []
		return raw.map(response => ({
			id: response.id,
			shortId: response.id.slice(0, 8),
			submittedAt: formatDate(response.submittedAt),
			answersByQuestionId: buildAnswerMap(response.answers),
		}))
	}, [responsesData?.responses])

	return {
		form: formData?.form ?? null,
		responses,
		isLoading: formLoading || responsesLoading,
		error: formError ?? responsesError,
	}
}
