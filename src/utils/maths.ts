export const roundToPrecision = (x: number, precision = 1) => {
	const y = +x + (precision / 2)
	return y - (y % precision)
}

export function normalDistributionSkew(min: number, max: number, skew: number) {
	let u = 0, v = 0
	while (u === 0) u = Math.random()
	while (v === 0) v = Math.random()
	let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)

	num = num / 10.0 + 0.5
	if (num > 1 || num < 0) return normalDistributionSkew(min, max, skew)
	num **= skew
	num *= max - min
	num += min
	return roundToPrecision(num)
}

export function generateGaussianRandom(max: number, mean: number, min = 0, stddev = 12) {
	let u = 0, v = 0
	while (u === 0) u = Math.random()
	while (v === 0) v = Math.random()
	const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
	const out = z * stddev + mean
	if (out < min || out > max) return generateGaussianRandom(max, mean, min, stddev)
	return roundToPrecision(out)
}
