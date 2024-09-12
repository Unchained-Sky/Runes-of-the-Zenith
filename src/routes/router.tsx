import { createBrowserRouter } from 'react-router-dom'
import RuneTablet from '~/RT/index'
import Talents from '~/TT/index'
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
