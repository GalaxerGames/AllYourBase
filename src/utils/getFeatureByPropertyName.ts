import { PolygonByTimeAndUser } from '@/hooks/usePolygonsData'
import { MapboxGeoJSONFeature } from 'mapbox-gl'

export default function getFeatureByPropertyName(
  feature: MapboxGeoJSONFeature,
  owned: PolygonByTimeAndUser[],
  rest: PolygonByTimeAndUser[]
) {
  const id = feature.properties?.id
  switch (feature.source) {
    case 'enemy':
      const f = rest.find((x) => x.polygonID === id)
      return { owner: f?.owner ?? '', time: f?.time ?? 0 }
    case 'owned':
      const o = owned.find((x) => x.polygonID === id)
      return { owner: 'You', time: o?.time ?? 0 }
    case 'neutral':
    default:
      return { owner: 'No one', time: 0 }
  }
}
