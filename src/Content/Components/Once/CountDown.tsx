/* 
    COUNTDOWN COMPONENT TO PUT IN THE SCHEDULED MESSAGES
*/

//REACT
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
//FRONT
import { Text } from '@chakra-ui/react'
//FUNCTIONS
import timeUntil from '../../Functions/timeUntil'
 
//MAIN FUNCTION
const Countdown = ({ timestamp }: {timestamp:string}) => {

  const { t } = useTranslation('formats')
  const [timeLeft, setTimeLeft] = useState(timeUntil(timestamp, t))

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft(timeUntil(timestamp, t))
    }, 1000)
    return () => clearInterval(intervalId)
  }, [timestamp])

  return <Text color='blue.500' fontSize={'.8em'}>Envío {timeLeft}</Text>
}

export default Countdown
