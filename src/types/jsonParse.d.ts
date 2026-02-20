interface JSON {
	parse(
		text: string,
		// oxlint-disable-next-line typescript/no-explicit-any
		reviver?: (this: any, key: string, value: any) => any,
	): unknown
}
