import eslintConfig from '@unchainedsky/eslint-config'
export default [
	...eslintConfig,
	{
		ignores: [
			'.sst/*',
			'build/*'
		]
	}
]
