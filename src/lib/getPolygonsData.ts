import GET_EAS_ATTESTATIONS from '@/queries/GET_EAS_ATTESTATIONS.query'
import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'

export type EndAttestation = [
  {
    name: 'ADDRESS'
    type: 'address'
    signature: 'address ADDRESS'
    value: {
      name: 'ADDRESS'
      type: 'address'
      value: `0x${string}`
    }
  },
  {
    name: 'LATITUDE'
    type: 'string'
    signature: 'string LATITUDE'
    value: {
      name: 'LATITUDE'
      type: 'string'
      value: string
    }
  },
  {
    name: 'LONGITUDE'
    type: 'string'
    signature: 'string LONGITUDE'
    value: {
      name: 'LONGITUDE'
      type: 'string'
      value: string
    }
  },
  {
    name: 'POLYGONID'
    type: 'string'
    signature: 'string POLYGONID'
    value: {
      name: 'POLYGONID'
      type: 'string'
      value: string
    }
  },
  {
    name: 'TIME_IN_ZONE'
    type: 'uint256'
    signature: 'uint256 TIME_IN_ZONE'
    value: {
      name: 'TIME_IN_ZONE'
      type: 'uint256'
      value: {
        type: 'BigNumber'
        hex: '0xd9'
      }
    }
  }
]

export default function getPolygonsData(
  schemaId: string,
  ownerAddress: `0x${string}`
) {
  const { data: rawData } = useSuspenseQuery<{
    attestations: { decodedDataJson: string }[]
  }>(GET_EAS_ATTESTATIONS, {
    variables: {
      schemaId: schemaId,
    },
  })

  const data: EndAttestation[] = rawData?.attestations.map((x) =>
    JSON.parse(x.decodedDataJson)
  )

  if (!data) return { owned: undefined, rest: undefined }

  // filter data to a set of polygon IDS with the max TIME_IN_ZONE

  const owned: EndAttestation[] = data.filter(
    (x) => x[0].value.value === ownerAddress
  )

  const rest = data.filter((x) => x[0].value.value !== ownerAddress)

  return { owned, rest }
}
