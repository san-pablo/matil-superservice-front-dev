//REACT
import { Dispatch, SetStateAction, useState, ChangeEvent } from "react"
import DOMPurify from "dompurify"
//FRONT
import { Box, Text, Flex, Button, Textarea } from '@chakra-ui/react'


const SendFeedBack = ({setShowFeedback}:{setShowFeedback:Dispatch<SetStateAction<boolean>>}) => {

    const [feedbackText, setFeedbackText] = useState<string>('')
    const feedBackChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setFeedbackText(event.target.value)           
    }

    const sendFeedback = () => {

    }
    return(<>
       <Box p='20px' maxW='60vw'>
            <Text fontSize={'1.2em'} fontWeight={'medium'}>Feedback de usuarios</Text>    
            <Text mt='1vh' fontSize={'0.9em'} color='gray.600'>Queremos ofrecerte la mejor experiencia posible. Si encuentras algún fallo, tienes sugerencias para mejorar, quejas sobre el servicio o cualquier otra recomendación, no dudes en hacérnoslo saber.</Text>        
        </Box>
        <Box borderBottomColor={'gray.200'} borderTopColor={'gray.200'}  borderWidth={'1px 0 1px 0'}  p='20px' overflowY={'scroll'}> 
             <Textarea  maxLength={500}  minHeight={'200px'} placeholder="Deja aquí tu mensaje..." maxH='300px' value={feedbackText} onChange={feedBackChange} p='8px'  resize={'none'} borderRadius='.5rem' rows={1} fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "rgb(77, 144, 254)", borderWidth: "2px"}}/>

        </Box>
        <Flex p='20px' flexDir={'row-reverse'} gap='15px' alignItems={'center'}> 
            <Button  size='sm' bg='brand.gradient_blue' color={'white'} _hover={{bg:'brand.gradient_blue_hover'}} onClick={sendFeedback}>Enviar</Button>
            <Button  size='sm' onClick={()=>setShowFeedback(false)}>Cancelar</Button>
        </Flex>

    </>)
}

export default SendFeedBack