import Map from '@/components/Map'
import { EAS_SCHEMA_UIDs } from '@/consts'
import getPolygonsData from '@/lib/getPolygonsData'
import { ZERO_ADDRESS } from '@ethereum-attestation-service/eas-sdk'

export default async function Home() {
  const data = await getPolygonsData(EAS_SCHEMA_UIDs.end, ZERO_ADDRESS)

  return <Map data={data?.rest} />
}
