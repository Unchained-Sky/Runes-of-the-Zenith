type Split<S extends string, D extends string> =
	string extends S
		? string[]
		: S extends ''
			? []
			: S extends `${infer T}${D}${infer U}`
				? [T, ...Split<U, D>]
				: [S]

export function split<S extends string, D extends string>(string: S, splitter: D) {
	return string.split(splitter) as Split<S, D>
}
