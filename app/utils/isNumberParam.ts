import { redirect } from '@remix-run/react'

export function safeParseInt(str: string) {
	return !isNaN(parseFloat(str)) && isFinite(+str) ? +str : null
}

export function isNumberParam(param: string = '', headers: Headers, onFailRedirectTo: `/${string}` = '/') {
	const number = safeParseInt(param)
	if (!number) throw redirect(onFailRedirectTo, { headers })
	return number
}
