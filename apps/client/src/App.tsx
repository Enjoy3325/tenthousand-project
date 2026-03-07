import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { FormBuilderPage } from './features/forms/FormBuilderPage'
import { FormFillPage } from './features/forms/FormFillPage'
import { FormResponsesPage } from './features/responses/FormResponsesPage'
import { HomePage } from './features/forms/HomePage'
import { Provider } from 'react-redux'
import { store } from './app/store'

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/forms/new" element={<FormBuilderPage />} />
          <Route path="/forms/:id/fill" element={<FormFillPage />} />
          <Route path="/forms/:id/responses" element={<FormResponsesPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}
