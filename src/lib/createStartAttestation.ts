import { easAddress, easUIDs } from '@/consts'
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import { Signer } from 'ethers'

export default async function createStartAttestation(
  address: `0x${string}`,
  lat: string,
  long: string,
  signer: Signer
) {
  const EASContractAddress = easAddress.baseGoerli //TODO make dynamic

  const eas = new EAS(EASContractAddress)

  eas.connect(signer)

  const schemaEncoder = new SchemaEncoder(
    'address ADDRESS,string LATITUDE,string LONGITUDE'
  )

  const encodedData = schemaEncoder.encodeData([
    { name: 'ADDRESS', value: address, type: 'address' },
    { name: 'LATITUDE', value: lat, type: 'string' },
    { name: 'LONGITUDE', value: long, type: 'string' },
  ])

  const tx = await eas.attest({
    schema: easUIDs.start,
    data: {
      recipient: address,
      data: encodedData,
    },
  })

  return await tx.wait()
}
