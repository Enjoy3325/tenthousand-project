import { getErrorMessage, useForms } from './useForms'

import { Link } from 'react-router-dom'

export function HomePage() {
	const { forms, isLoading, error } = useForms()
	return (
    
		<>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {getErrorMessage(error)}</p>}
      <div>
			<div>
				<h1>My Forms</h1>
        {forms.length > 0 &&
        <div>
				<Link to='/forms/new'>Create new form</Link>
      </div>
}
			</div>

			{!isLoading && !error && (
				<>
					{forms.length === 0 ? (
						<p>
							No forms yet. <Link to='/forms/new'>Create your first form</Link>
						</p>
					) : (
						<ul>
							{forms.map(form => (
								<li key={form.id}>
									<h3>{form.title}</h3>
									{form.description && <p>{form.description}</p>}
									<Link to={`/forms/${form.id}/fill`}>Fill form</Link>
									{' | '}
									<Link to={`/forms/${form.id}/responses`}>View Responses</Link>
								</li>
							))}
						</ul>
					)}
				</>
			)}
      </div>
		</>
	)
}
