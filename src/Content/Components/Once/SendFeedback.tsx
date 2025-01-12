/* 
    SEND FEEDBACK COMPONENT
*/

//REACT
import { Dispatch, SetStateAction, useState, ChangeEvent } from "react"
import { useTranslation } from "react-i18next"
//FRONT
import { Box, Text, Flex, Button, Textarea } from '@chakra-ui/react'

//MAIN FUNCTION
const SendFeedBack = ({setShowFeedback}:{setShowFeedback:Dispatch<SetStateAction<boolean>>}) => {

    //CONSTANTS
    const { t } = useTranslation('main')

    //REXT
    const [feedbackText, setFeedbackText] = useState<string>('')

    const sendFeedback = () => {

    }
    return(<>
       <Box p='20px 20px 0px 20px' maxW='60vw'>
            <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('UsersFeedback')}</Text>    
            <Text mt='.5vh' fontSize={'.8em'} color='gray.600'>{t('UsersFeedbackDes')}</Text>  
            <Box w='100%' h='1px' bg='gray.200' mt='2vh' mb='2vh'/>      
        </Box>
        <Box px='20px' overflowY={'scroll'}> 
             <Textarea  maxLength={500}  minHeight={'200px'} placeholder={t('FeedbackPlaceholder')} maxH='300px' value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} p='8px'  resize={'none'} borderRadius='.5rem' rows={1} fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "brand.text_blue", borderWidth: "2px"}}/>
        </Box>
        <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
            <Button variant={'main'}  size='sm' onClick={sendFeedback}>{t('Send')}</Button>
            <Button  variant={'common'} size='sm' onClick={()=>setShowFeedback(false)}>{t('Cancel')}</Button>
        </Flex>

    </>)
}

export default SendFeedBack