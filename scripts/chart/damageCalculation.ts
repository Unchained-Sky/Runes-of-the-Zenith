import { writeFile } from 'node:fs/promises'

const results: Record<number, number> = {}
const n = 10_000_000
const mean = 75
const stddev = 12
const min = 0
const max = 151
const step = 1

function generateGaussianRandom(mean = 0, stddev = 1) {
	let u = 0,
		v = 0
	while (u === 0) u = Math.random()
	while (v === 0) v = Math.random()
	const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
	const out = z * stddev + mean
	if (out < min || out > max) return generateGaussianRandom(mean, stddev)
	return out
}

const round_to_precision = (x: number, precision: number) => {
	const y = +x + (precision / 2)
	return y - (y % precision)
}

for (let j = min; j < max; j += step) {
	results[j] = 0
}

for (let i = 0; i < n; i += step) {
	const rand_num = generateGaussianRandom(mean, stddev)
	const rounded = round_to_precision(rand_num, step)
	if (!results[rounded]) results[rounded] = 0
	results[rounded] += 1
}

const parsedData = Object.entries(results).map(([key, value]) => ({ damage: +key, count: value, percentage: (value / n) * 100 }))

const tsOut = `
/* oxlint-disable */
export const TEST_DATA = ${JSON.stringify(parsedData)}
`

void writeFile('./damageData.ts', tsOut)
	.catch(console.error)
	.then(() => console.log('Done!'))
