/* 
    DOMINO LOADING ICON (INITIAL CHARGE)
*/

//FRONT
import { Flex } from '@chakra-ui/react'
import loadingAnimation from './lottie-2.json'
import Lottie from 'lottie-react'

//MAIN FUNCTION
const LoadingIcon = () => {
    return (
        <Flex width="100%" height="100%" justifyContent="center" alignItems="center" bg="gray.50">
            <Lottie animationData={loadingAnimation} loop={true} style={{ width: 100, height: 100 }}/>
        </Flex>
    )
}

export default LoadingIcon










