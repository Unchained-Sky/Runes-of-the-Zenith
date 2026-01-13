type IntSize = {
	name: string
	floor: number
	ceil: number
}

export const int2 = {
	name: 'smallint',
	floor: -32768,
	ceil: 32767
} satisfies IntSize

export const int4 = {
	name: 'integer',
	floor: -2147483648,
	ceil: 2147483647
} satisfies IntSize

export const int8 = {
	name: 'bigint',
	floor: -Infinity,
	ceil: Infinity
	// floor: -9223372036854775808,
	// ceil: 9223372036854775807
} satisfies IntSize
