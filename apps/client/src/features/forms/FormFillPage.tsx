import { FormFiller } from './FormFiller'
import { PageLayout } from '../../components/layout/PageLayout'
import { Spinner } from '../../components/ui/Spinner'
import { useLoadForm } from './useLoadForm'

export function FormFillPage() {
	const { form, isLoading, error } = useLoadForm()

	if (isLoading) {
		return (
			<PageLayout>
				<Spinner fullPage />
			</PageLayout>
		)
	}

	if (error) {
		return (
			<PageLayout>
				<div className='alert alert--error' role='alert'>
					Failed to load form.
				</div>
			</PageLayout>
		)
	}

	if (!form) {
		return (
			<PageLayout>
				<div className='alert alert--error' role='alert'>
					Form not found.
				</div>
			</PageLayout>
		)
	}

	return (
		<PageLayout>
			<FormFiller form={form} />
		</PageLayout>
	)
}
