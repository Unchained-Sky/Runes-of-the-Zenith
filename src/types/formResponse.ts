export type FormResponse<T = unknown> = {
	error: true
	message: string
} | {
	error: false
	message: string
	data?: T
}
