import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { GetFormsQuery } from '../../app/api/generated'
import type { SerializedError } from '@reduxjs/toolkit'
import { useGetFormsQuery } from '../../app/api/generated'

type Form = GetFormsQuery['forms'][number]

interface UseFormsReturn {
  forms: Form[]
  isLoading: boolean
  error: FetchBaseQueryError | SerializedError | undefined
}

export function useForms(): UseFormsReturn {
  const { data, isLoading, error } = useGetFormsQuery()
  return {
    forms: data?.forms ?? [],
    isLoading,
    error,
  }
}

  export function getErrorMessage(error: UseFormsReturn['error']): string {
  if (!error) return ''
  if ('message' in error) return error.message?.toString() ?? 'An error occurred!'

  return 'Something went wrong!'                 
  }