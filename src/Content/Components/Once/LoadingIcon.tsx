//FRONT
import { Flex } from '@chakra-ui/react'
//LOTIE
import loadingAnimation from './lottie.json'
import Lottie from 'lottie-react'

//MAIN FUNCTION
const LoadingIcon = () => {
    return (
        <Flex width="100%" height="100%" justifyContent="center" alignItems="center" bg="clear_white">
            <Lottie animationData={loadingAnimation} loop={true} style={{ width: 100, height: 100 }}/>
        </Flex>
    )
}

export default LoadingIcon










