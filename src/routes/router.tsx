import { createBrowserRouter } from 'react-router-dom'
import HomePage from './Home'
import RuneTabletPage from './RuneTablet'
import TalentsPage from './Talents'

export const router = createBrowserRouter([
	{
		path: '/',
		element: <HomePage />
	},
	{
		path: '/talents',
		element: <TalentsPage />
	},
	{
		path: '/rune-tablet',
		element: <RuneTabletPage />
	}
])
