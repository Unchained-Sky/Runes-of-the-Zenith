type ObjectKeys<T> = T extends object
	? (keyof T)[]
	: T extends number
		? []
		: T extends Array<unknown> | string
			? string[]
			: never

type TupleEntry<T extends readonly unknown[], I extends unknown[] = [], R = never> = T extends readonly [
	infer Head,
	...infer Tail
]
	? TupleEntry<Tail, [...I, unknown], R | [`${I['length']}`, Head]>
	: R

type ObjectEntry<T extends object> = T extends object
	? { [K in keyof T]: [K, Required<T>[K]] }[keyof T] extends infer E
		? E extends [infer K, infer V]
			? K extends string | number
				? [`${K}`, V]
				: never
			: never
		: never
	: never

type Entry<T extends object> = T extends readonly [unknown, ...unknown[]]
	? TupleEntry<T>
	: T extends ReadonlyArray<infer U>
		? [`${number}`, U]
		: ObjectEntry<T>

export const typedObject = {
	keys: <T extends object>(object: T): ObjectKeys<T> => Object.keys(object) as ObjectKeys<T>,
	entries: <T extends object>(object: T) => Object.entries(object) as unknown as ReadonlyArray<Entry<T>>,
	fromEntries: <const T extends ReadonlyArray<readonly [PropertyKey, unknown]>>(
		entries: T
	): { [K in T[number] as K[0]]: K[1] } => {
		return Object.fromEntries(entries) as { [K in T[number] as K[0]]: K[1] }
	}
} as const
