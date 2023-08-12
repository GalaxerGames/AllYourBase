import { EAS_ADDRESS, EAS_SCHEMA_UIDs } from '@/consts'
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import { Signer } from 'ethers'
import { zeroAddress } from 'viem'

export default async function createEndAttestation(
  address: `0x${string}`,
  lat: string,
  long: string,
  timeInZone: number,
  signer: Signer,
  startAttestationUID: string,
  polygonID: string
) {
  const EASContractAddress = EAS_ADDRESS.baseGoerli //TODO make dynamic

  const eas = new EAS(EASContractAddress)

  eas.connect(signer)

  const schemaEncoder = new SchemaEncoder(
    'address ADDRESS, string LATITUDE, string LONGITUDE, string POLYGONID, uint256 TIME_IN_ZONE'
  )

  const encodedData = schemaEncoder.encodeData([
    { name: 'ADDRESS', value: address, type: 'address' },
    { name: 'LATITUDE', value: lat, type: 'string' },
    { name: 'LONGITUDE', value: long, type: 'string' },
    { name: 'POLYGONID', value: polygonID, type: 'string' },
    { name: 'TIME_IN_ZONE', value: timeInZone, type: 'uint256' },
  ])

  const tx = await eas.attest({
    schema: EAS_SCHEMA_UIDs.end,
    data: {
      recipient: zeroAddress,
      data: encodedData,
      refUID: startAttestationUID,
      expirationTime: 0n,
      revocable: false,
    },
  })

  return await tx.wait()
}
