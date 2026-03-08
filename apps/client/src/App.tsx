import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { FormBuilderPage } from './features/forms/FormBuilderPage'
import { FormFillPage } from './features/forms/FormFillPage'
import { FormResponsesPage } from './features/responses/FormResponsesPage'
import { HomePage } from './features/forms/HomePage'
import { NotFoundPage } from './features/notFound/NotFoundPage'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from './app/store'

export default function App() {
	return (
		<Provider store={store}>
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<HomePage />} />
					<Route path='/forms/new' element={<FormBuilderPage />} />
					<Route path='/forms/:id/fill' element={<FormFillPage />} />
					<Route path='/forms/:id/responses' element={<FormResponsesPage />} />
					<Route path='*' element={<NotFoundPage />} />
				</Routes>
				<Toaster
					position='top-right'
					toastOptions={{
						duration: 4000,
						style: {
							fontFamily: 'Inter, sans-serif',
							fontSize: '0.875rem',
							background: '#fafaf8',
							color: '#1a1916',
							border: '1px solid #e2e0d8',
							borderRadius: '8px',
							boxShadow: '0 2px 8px rgba(26,25,22,0.08)',
						},
						success: {
							iconTheme: { primary: '#2a7a4b', secondary: '#fafaf8' },
						},
						error: {
							iconTheme: { primary: '#c0392b', secondary: '#fafaf8' },
						},
					}}
				/>
			</BrowserRouter>
		</Provider>
	)
}
