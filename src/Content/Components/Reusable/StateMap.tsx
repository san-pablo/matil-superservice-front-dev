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
    <Box display="inline-flex" fontSize={mini ? '.7em':'.8em'} py={mini ? '1px':'3px'} px={mini ? '6px':'8px'} fontWeight={'medium'} color='white'  bg={statesMap?.[state]?.[0] || ''} borderRadius={'.7rem'}> 
        <Text color={'black'}>{t(state)}</Text>
    </Box>
    )

}

export default StateMap 