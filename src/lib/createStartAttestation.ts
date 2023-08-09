import { easAddress, easUIDs } from '@/consts'
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
  const EASContractAddress = easAddress.baseGoerli //TODO make dynamic

  const eas = new EAS(EASContractAddress)

  eas.connect(signer)

  const schemaEncoder = new SchemaEncoder(
    'address ADDRESS, string POLYGONID, string LATITUDE, string LONGITUDE'
  )

  const encodedData = schemaEncoder.encodeData([
    { name: 'ADDRESS', value: address, type: 'address' },
    { name: 'POLYGONID', value: polygonID, type: 'string' },
    { name: 'LATITUDE', value: lat, type: 'string' },
    { name: 'LONGITUDE', value: long, type: 'string' },
  ])

  const tx = await eas.attest({
    schema: easUIDs.start,
    data: {
      recipient: zeroAddress,
      data: encodedData,
      expirationTime: 0n,
      revocable: false,
    },
  })

  return await tx.wait()
}
