import { EAS_ADDRESS, EAS_SCHEMA_UIDs } from '@/consts'
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import { Signer } from 'ethers'
import { zeroAddress } from 'viem'

export default async function createStartAttestation(
  address: `0x${string}`,
  lat: string,
  long: string,
  signer: Signer,
  polygonID: string
) {
  const EASContractAddress = EAS_ADDRESS.baseGoerli //TODO make dynamic

  const eas = new EAS(EASContractAddress)

  eas.connect(signer)

  const schemaEncoder = new SchemaEncoder(
    'address ADDRESS,  string LATITUDE, string LONGITUDE, string POLYGONID'
  )

  const encodedData = schemaEncoder.encodeData([
    { name: 'ADDRESS', value: address, type: 'address' },
    { name: 'LATITUDE', value: lat, type: 'string' },
    { name: 'LONGITUDE', value: long, type: 'string' },
    { name: 'POLYGONID', value: polygonID, type: 'string' },
  ])

  const tx = await eas.attest({
    schema: EAS_SCHEMA_UIDs.start,
    data: {
      recipient: zeroAddress,
      data: encodedData,
      expirationTime: 0n,
      revocable: false,
    },
  })

  return await tx.wait()
}
