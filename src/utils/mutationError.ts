import { notifications } from '@mantine/notifications'

export const mutationError = (error: Error, title: string) => {
	console.error(error)
	notifications.show({
		title,
		color: 'red',
		message: error.message
	})
}
