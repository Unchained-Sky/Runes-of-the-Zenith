import { createBrowserRouter } from 'react-router-dom'
import RuneTablet from '~/RuneTablet'
import Talents from '~/TalentTree'
import HomePage from './Home'

export const router = createBrowserRouter([
	{
		path: '/',
		element: <HomePage />
	},
	{
		path: '/talents',
		element: <Talents />
	},
	{
		path: '/rune-tablet',
		element: <RuneTablet />
	}
])
