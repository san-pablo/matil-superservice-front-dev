/*
    MAKE THE STATUS SYMBOL
*/

//FRONT
import { Box, Text } from '@chakra-ui/react'
//TYPING
import { statesMap } from '../Constants/typing'

//MAIN FUNCTION
const StateMap = ({state}:{state:'new' | 'open' |'solved' | 'pending' | 'closed'}) => {
   
    return(
    <Box display="inline-flex" fontSize='.9em' borderColor={statesMap[state][2]} borderWidth={'1px'} py='1px' px='5px' fontWeight={'medium'} color='white'  bg={statesMap[state][1]} borderRadius={'.7rem'}> 
        <Text>{statesMap[state][0]}</Text>
    </Box>
    )

}

export default StateMap