import { useEthersSigner } from '@/hooks/useEthersSigner'
import createEndAttestation from '@/lib/createEndAttestation'
import createStartAttestation from '@/lib/createStartAttestation'
import { useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import Timer from './Timer'
import { toast } from 'sonner'
import { ApolloQueryResult, OperationVariables } from '@apollo/client'

type ActionButtonProps = {
  currentFeature: GeoJSON.Feature<GeoJSON.Geometry>
  userLatitute: number
  userLongitude: number
  refetch:
    | ((variables?: Partial<OperationVariables> | undefined) => Promise<
        ApolloQueryResult<{
          attestations: {
            decodedDataJson: string
          }[]
        }>
      >)
    | undefined
}

const ActionButton: React.FC<ActionButtonProps> = ({
  currentFeature,
  userLatitute,
  userLongitude,
  refetch,
}) => {
  const { address } = useAccount()
  const signer = useEthersSigner()
  const [currentAttestation, setCurrentAttestation] = useState<
    string | undefined
  >()
  const [time, setTime] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const start = async () => {
    if (!address || !signer || !currentFeature?.id)
      return toast.error('Problem occured, please try again.')

    try {
      setCurrentAttestation(undefined)
      setTime(0)
      const startAttestationID = await createStartAttestation(
        address,
        userLatitute.toString(),
        userLongitude.toString(),
        signer,
        currentFeature.id.toString()
      )

      setCurrentAttestation(startAttestationID)
    } catch (error) {
      toast.error(
        'Problem trying to make the attestation. \nPlease try again later.'
      )
    }
  }

  const end = async () => {
    if (!address || !signer || !currentAttestation || !currentFeature?.id)
      return toast.error('Problem occured, please try again.')

    try {
      await createEndAttestation(
        address,
        userLatitute.toString(),
        userLongitude.toString(),
        time,
        signer,
        currentAttestation,
        currentFeature.id.toString()
      )

      setCurrentAttestation(undefined)
      clearInterval(intervalRef.current as NodeJS.Timeout)
      if (!!refetch) {
        refetch()
      }
    } catch (error) {
      toast.error(
        'Problem trying to make the attestation. \nPlease try again later.'
      )
    }
  }

  return (
    <div className="flex gap-10 items-center justify-center">
      {currentAttestation && (
        <Timer intervalRef={intervalRef} time={time} setTime={setTime} />
      )}
      <button
        className="px-3 py-1 rounded text-white bg-yellow-600"
        onClick={currentAttestation ? end : start}
      >
        {currentAttestation ? 'END' : 'START'}
      </button>
    </div>
  )
}
export default ActionButton
