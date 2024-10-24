import { redirect } from '@remix-run/react'

export function isNumberParam(param: string = '', headers: Headers, onFailRedirectTo: `/${string}` = '/') {
	const number = !isNaN(parseFloat(param)) && isFinite(+param) ? +param : null
	if (!number) throw redirect(onFailRedirectTo, { headers })
	return number
}
