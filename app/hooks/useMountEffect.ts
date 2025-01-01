import { type EffectCallback, useEffect } from 'react'

export default function useMountEffect(func: EffectCallback) {
	useEffect(func, [func])
}
