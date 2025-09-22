import { Box, Button, Group } from '@mantine/core'
import { ErrorComponent, Link, rootRouteId, useMatch, useRouter, type ErrorComponentProps } from '@tanstack/react-router'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
	const router = useRouter()
	const isRoot = useMatch({
		strict: false,
		select: state => state.id === rootRouteId
	})

	console.error('DefaultCatchBoundary Error:', error)

	return (
		<Box>
			<ErrorComponent error={error} />
			<Group>
				<Button
					onClick={() => void router.invalidate()}
				>
					Try Again
				</Button>
				{
					isRoot
						? (
							<Button component={Link}to='/'>
								Home
							</Button>
						)
						: (
							<Button
								component={Link}
								to='/'
								onClick={event => {
									event.preventDefault()
									window.history.back()
								}}
							>
								Go Back
							</Button>
						)
				}
			</Group>
		</Box>
	)
}
