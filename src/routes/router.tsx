import { createBrowserRouter } from 'react-router-dom'
import RuneTablet from '~/components/RuneTablet'
import HomePage from './Home'
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
		element: <RuneTablet />
	}
])
