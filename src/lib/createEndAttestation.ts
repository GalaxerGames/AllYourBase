import { easAddress, easUIDs } from '@/consts'
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import { Signer } from 'ethers'

export default async function createEndAttestation(
  address: `0x${string}`,
  lat: string,
  long: string,
  timeInZone: number,
  signer: Signer,
  startAttestationRef: string
) {
  const EASContractAddress = easAddress.baseGoerli //TODO make dynamic

  const eas = new EAS(EASContractAddress)

  eas.connect(signer)

  const schemaEncoder = new SchemaEncoder(
    'address ADDRESS, string LATITUDE, string LONGITUDE, bytes32 TIME_IN_ZONE'
  )

  const encodedData = schemaEncoder.encodeData([
    { name: 'ADDRESS', value: address, type: 'address' },
    { name: 'LATITUDE', value: lat, type: 'string' },
    { name: 'LONGITUDE', value: long, type: 'string' },
    { name: 'TIME_IN_ZONE', value: timeInZone, type: 'bytes32' },
  ])

  return await eas.attest({
    schema: easUIDs.end,
    data: {
      recipient: easUIDs.start,
      data: encodedData,
      refUID: startAttestationRef,
    },
  })
}
