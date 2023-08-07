import { Dispatch, MutableRefObject, SetStateAction, useEffect } from 'react'
import { clearInterval, setInterval } from 'timers'

type TimerProps = {
  time: number
  setTime: Dispatch<SetStateAction<number>>
  intervalRef: MutableRefObject<NodeJS.Timeout | null>
}

const Timer: React.FC<TimerProps> = ({ time, setTime, intervalRef }) => {
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      setTime((prev) => prev + 1)
    }, 1000)

    return () => {
      clearInterval(intervalRef.current as NodeJS.Timeout)
    }
  }, [])

  return (
    <div className="flex gap-5 items-center justify-center">
      <h1 className="text-xl font-semibold">{time}s</h1>
    </div>
  )
}
export default Timer
