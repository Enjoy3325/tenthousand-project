import { FormFiller } from './FormFiller'
import { useLoadForm } from './useLoadForm'

export function FormFillPage() {
	const { form, isLoading, error } = useLoadForm()

	if (isLoading) return <div>Loading...</div>
	if (error) return <div>Error occurred</div>
	if (!form) return <div>Form not found</div>

	return <FormFiller form={form} />
}
