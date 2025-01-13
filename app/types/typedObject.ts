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

type Merge<T1, T2> = Omit<T1, keyof T2> & T2

type MergeArrayOfObjects<
	TArr extends readonly object[],
	T1 = object
> = TArr extends [
	infer T2 extends object,
	...infer TRest extends object[]
] ? MergeArrayOfObjects<TRest, Merge<T1, T2>>
	: T1

export const typedObject = {
	keys: <T extends object>(object: T): ObjectKeys<T> => Object.keys(object) as ObjectKeys<T>,
	entries: <T extends object>(object: T) => Object.entries(object) as unknown as ReadonlyArray<Entry<T>>,
	fromEntries: <const T extends ReadonlyArray<readonly [PropertyKey, unknown]>>(
		entries: T
	): { [K in T[number]as K[0]]: K[1] } => {
		return Object.fromEntries(entries) as { [K in T[number]as K[0]]: K[1] }
	},
	assign: <TArr extends readonly object[]>(...objects: TArr) => Object.assign({}, ...objects) as MergeArrayOfObjects<TArr>,
	omit: <T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
		const omitKeys = new Set(keys as string[])
		return Object.fromEntries(
			Object.entries(obj).filter(([key]) => !omitKeys.has(key))
		) as Omit<T, K>
	},
	pick: <T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]) => {
		return Object.fromEntries(
			keys
				.filter(key => key in obj)
				.map(key => [key, obj[key]])
		) as Pick<T, K>
	}
} as const
