import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { GetFormQuery } from '../../app/api/generated'
import type { SerializedError } from '@reduxjs/toolkit'
import { useGetFormQuery } from '../../app/api/generated'
import { useParams } from 'react-router-dom'

type Form = NonNullable<GetFormQuery['form']>

interface UseLoadFormReturn {
	form: Form | null
	isLoading: boolean
	error: FetchBaseQueryError | SerializedError | undefined
}

export function useLoadForm(): UseLoadFormReturn {
	const { id } = useParams<{ id: string }>()
	const { data, isLoading, error } = useGetFormQuery({ id: id! })

	return {
		form: data?.form ?? null,
		isLoading,
		error,
	}
}
