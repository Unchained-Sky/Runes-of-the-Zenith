import { writeFile } from 'node:fs/promises'
import { generateGaussianRandom } from '~/utils/damageCalculation'

const results: Record<number, number> = {}
const n = 10_000_000
const mean = 75
const stddev = 12
const min = 0
const max = 151

for (let i = min; i <= max; i += 1) results[i] = 0

for (let i = 0; i < n; i += 1) {
	const randomNumber = generateGaussianRandom(max, mean, min, stddev)
	if (!results[randomNumber]) results[randomNumber] = 0
	results[randomNumber] += 1
}

const parsedData = Object.entries(results).map(([key, value]) => ({ damage: +key, count: value, percentage: (value / n) * 100 }))

const tsOut = `/* oxlint-disable */
export const TEST_DATA = ${JSON.stringify(parsedData)}`

void writeFile('./scripts/chart/damageData.ts', tsOut)
	.catch(console.error)
	.then(() => console.log('Done!'))
