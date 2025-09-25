import { TextInput, rem } from '@mantine/core'
import { useMapEditStore } from '../-hooks/useMapEditStore'

type MapTitleProps = {
	loaderMapName: string
}

export default function MapTitle({ loaderMapName }: MapTitleProps) {
	const mapName = useMapEditStore(state => state.mapName)
	const updateMapName = useMapEditStore(state => state.updateMapName)

	return (
		<TextInput
			pb='sm'
			maw={rem(300)}
			maxLength={32}
			placeholder={loaderMapName}
			value={mapName ?? ''}
			onChange={event => updateMapName(event.currentTarget.value || null)}
		/>
	)
}
