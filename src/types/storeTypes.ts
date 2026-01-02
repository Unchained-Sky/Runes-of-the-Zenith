import { type StateCreator, type StoreMutatorIdentifier } from 'zustand'

export type DevTools = ['zustand/devtools', never]

export type SubscribeWithSelector = ['zustand/subscribeWithSelector', never]

export type Persist<T = unknown> = ['zustand/persist', T]

export type Slice<
	Store extends CurrentSlice,
	CurrentSlice extends object,
	Middleware extends [StoreMutatorIdentifier, unknown][] = [DevTools, Persist]
> = StateCreator<Store, Middleware, [], CurrentSlice>

export const createActionName = <T extends object>(storeName: string) =>
	(actionName: keyof T | `${keyof T & string}/${string}`): [false, string] => [
		false,
		`${storeName}/${actionName.toString()}`
	]

const projectName = 'rotz'
export const persistStoreName = (storeName: string) => `${projectName}-${storeName}`
