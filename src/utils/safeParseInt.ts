export function safeParseInt(str: string) {
	return !isNaN(parseFloat(str)) && isFinite(+str) ? +str : null
}
