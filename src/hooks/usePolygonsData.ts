import GET_EAS_ATTESTATIONS from '@/queries/GET_EAS_ATTESTATIONS.query'
import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { fromHex } from 'viem'

type EndAttestation = [
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

export type PolygonByTimeAndUser = {
  polygonID: string
  owner: `0x${string}`
  time: number
}

export default function usePolygonsData(
  schemaId: string,
  ownerAddress: `0x${string}`
) {
  const owned: PolygonByTimeAndUser[] = []
  const rest: PolygonByTimeAndUser[] = []

  const { data: rawData, refetch } = useSuspenseQuery<{
    attestations: { decodedDataJson: string }[]
  }>(GET_EAS_ATTESTATIONS, {
    variables: {
      schemaId: schemaId,
    },
    queryKey: 'polygons',
    fetchPolicy: 'no-cache',
    context: {
      fetchOptions: {
        next: { revalidate: 5 },
      },
    },
  })

  const data: EndAttestation[] = rawData?.attestations.map((x) =>
    JSON.parse(x.decodedDataJson)
  )

  if (!data) return { owned, rest }

  // filter data to a set of polygon IDS with the max TIME_IN_ZONE
  const bestTimePolygons = new Map<
    string,
    { time: number; owner: `0x${string}` }
  >()
  data.forEach((attestation) => {
    const newVal = fromHex(attestation[4].value.value.hex, 'number')
    if (
      newVal > (bestTimePolygons.get(attestation[3].value.value)?.time ?? 0)
    ) {
      bestTimePolygons.set(attestation[3].value.value, {
        time: newVal,
        owner: attestation[0].value.value,
      })
    }
  })

  for (const [k, v] of bestTimePolygons.entries()) {
    if (v.owner === ownerAddress) {
      owned.push({ polygonID: k, owner: v.owner, time: v.time })
    } else {
      rest.push({ polygonID: k, owner: v.owner, time: v.time })
    }
  }

  return { owned, rest, refetch }
}
