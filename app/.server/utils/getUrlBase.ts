export default function getUrlBase() {
	const isServer = typeof window === 'undefined'
	if (!isServer) throw new Error('getUrlBase() must be used on the server')

	const port = parseInt(process.env.PORT ?? '5173')
	let url = process.env.BASE_URL ?? `http://localhost:${port}/`
	url = url.startsWith('http') ? url : `https://${url}`
	url = url.endsWith('/') ? url.slice(0, -1) : url
	return url
}
