type UnknownMap = Map<unknown, unknown>
export type MapKey<T extends UnknownMap> = T extends Map<infer K, unknown> ? K : never
export type MapValue<T extends UnknownMap> = T extends Map<unknown, infer V> ? V : never
export type MapTypes<T extends UnknownMap> = T extends Map<infer K, infer V> ? { key: K, value: V } : never
