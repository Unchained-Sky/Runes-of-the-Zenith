export const capitalise = <T extends string>(s: T) => (s.length > 1 ? ((s[0] as string).toUpperCase() + s.slice(1)) : s) as Capitalize<typeof s>

export type TitleCase<T extends string> = Capitalize<Lowercase<T>>

export const titleCase = <T extends string>(s: T) => (s.length > 1 ? ((s[0] as string).toUpperCase() + s.toLowerCase().slice(1)) : s) as TitleCase<typeof s>
