import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import Mantine from './components/Mantine.tsx'
import { router } from './routes/router.tsx'

const root = document.getElementById('root')

if (!root) throw new Error('Root not found')

createRoot(root).render(
	<StrictMode>
		<Mantine>
			<RouterProvider router={router} />
		</Mantine>
	</StrictMode>
)
