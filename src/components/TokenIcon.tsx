import { Box, Image, Pill, Text, ThemeIcon, Tooltip } from '@mantine/core'
import { useTokenQuery } from '~/hooks/data/useTokenQuery'
import { type TabletopHeroData } from '~/routes/tabletop/-hooks/tabletopData/useTabletopHeroes'
import { type Enums } from '~/supabase/databaseTypes'

type TokenIconProps = {
	token: TabletopHeroData['tokens'][number]
}

const getTokenColour = (alignment: Enums<'token_alignment'>) => {
	switch (alignment) {
		case 'POSITIVE':
			return 'green'
		case 'NEUTRAL':
			return 'yellow'
		case 'NEGATIVE':
			return 'red'
	}
}

export default function TokenIcon({ token }: TokenIconProps) {
	const tokensData = useTokenQuery()

	const tokenData = tokensData[token.name]
	if (!tokenData) throw new Error(`Token ${token.name} not found`)

	return (
		<Tooltip
			key={tokenData.name}
			label={(
				<Box>
					<Text fw='bold'>{tokenData.name}</Text>
					<Text>{tokenData.extraData.description}</Text>
				</Box>
			)}
		>
			<Box pos='relative' id={`token-${token.name}`}>
				<ThemeIcon
					variant='light'
					color={getTokenColour(tokenData.alignment)}
					size='xl'
				>
					<Image src={`/tokenIcon/${tokenData.extraData.image}`} />
				</ThemeIcon>
				<Pill pos='absolute' bottom={0} right={-4}>{token.amount}</Pill>
			</Box>
		</Tooltip>
	)
}
