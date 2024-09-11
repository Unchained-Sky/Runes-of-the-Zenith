import { type ForwardedRef, type MutableRefObject } from 'react'

export default function testForwardRef<T>(ref: ForwardedRef<T>): ref is MutableRefObject<T> {
	if (!ref) return false
	return Object.hasOwn(ref, 'current')
}
