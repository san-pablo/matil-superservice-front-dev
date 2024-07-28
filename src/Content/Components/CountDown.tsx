/* 
    COUNTDOWN COMPONENT TO PUT IN THE SCHEDULED MESSAGES
*/

//REACT
import { useEffect, useState } from 'react'
//FRONT
import { Text } from '@chakra-ui/react'
//FUNCTIONS
import timeUntil from '../Functions/timeUntil'

//MAIN FUNCTION
const Countdown = ({ timestamp }: {timestamp:string}) => {
  const [timeLeft, setTimeLeft] = useState(timeUntil(timestamp))

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft(timeUntil(timestamp))
    }, 1000)
    return () => clearInterval(intervalId)
  }, [timestamp])

  return <Text color='blue.500' fontSize={'.8em'}>Envío {timeLeft}</Text>
}

export default Countdown
