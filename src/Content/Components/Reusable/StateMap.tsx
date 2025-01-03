/*
    MAKE THE STATUS SYMBOL
*/

//TRANSLATION
import { useTranslation } from 'react-i18next'
//FRONT
import { Box, Text } from '@chakra-ui/react'
//TYPING
import { statesMap } from '../../Constants/typing'

//MAIN FUNCTION
const StateMap = ({state, mini}:{state:'new' | 'open' |'solved' | 'pending' | 'closed' | 'ongoing' | 'completed', mini?:boolean}) => {
   
    //CONSTANTS
    const { t } = useTranslation('conversations')
    
    //FRONT
    return(
    <Box boxShadow={`1px 1px 1px rgba(0, 0, 0, 0.15)`} display="inline-flex" fontSize={mini ? '.7em':'.9em'} py={mini ? '1px':'2px'} px={mini ? '6px':'8px'} fontWeight={'medium'} color='white'  bg={statesMap[state][0]} borderRadius={'.7rem'}> 
        <Text color={statesMap[state][1]}>{t(state)}</Text>
    </Box>
    )

}

export default StateMap 