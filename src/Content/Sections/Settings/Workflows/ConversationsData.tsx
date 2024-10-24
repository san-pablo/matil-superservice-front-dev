//REACT
import { useEffect, useRef, useState } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../../API/fetchData"
import VariableTypeChanger from "../../../Components/Reusable/VariableTypeChanger"
//FRONT
import { Text, Box, Flex, Button, NumberInput, NumberInputField, Skeleton, Switch } from "@chakra-ui/react"
//COMPONENTS
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
  
interface ConversationsConfigProps {
    solved_to_closed_days: 0
    no_activity_to_closed_days: number
    auto_move_to_bin_closed: boolean
    closed_to_bin_days: number
    auto_delete_bin: boolean
    bin_to_deleted_days:number
}

const ConversationsData = () => {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('settings')

    //BOOLEAN FOR WAITING THE UPLOAD
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    //CONVERSATIONS DATA
    const conversationsDataRef = useRef<ConversationsConfigProps | null>(null)
    const [conversationsData, setConversationsData] = useState<ConversationsConfigProps | null>(null)

    //FETCH NEW DATA WHEN THE VIEEW CHANGE
    useEffect(() => {        
        document.title = `${t('Settings')} - ${t('Conversations')} - ${auth.authData.organizationId} - Matil`
        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/data`, setValue:setConversationsData, auth})
            if (response?.status === 200) conversationsDataRef.current = response.data
        }
        fetchInitialData()
     }, [])

    //FUNCTION FOR EDITING EACH KEY
    const handleEditKey = (key:keyof(ConversationsConfigProps), value:boolean | number) => {if (conversationsData) setConversationsData(prev => ({...prev as ConversationsConfigProps, [key]:value}))}

    //FUNCTION FOR SEND A NEW CONFIGURATION
    const sendNewConversationData = async() => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/data`, method:'put', requestForm:conversationsData as ConversationsConfigProps, setValue:setConversationsData, setWaiting:setWaitingSend, auth, toastMessages:{works:t('CorrectEditedConversation'), failed:t('FailedEditedConversation')}})
        if (response?.status === 200) conversationsDataRef.current = conversationsData
    }
    
 
return(<>

    <Box> 
        <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('Conversations')}</Text>
        <Text color='gray.600' fontSize={'.9em'}>{t('ConversationsDes')}</Text>
        <Box width='100%' bg='gray.300' height='1px' mt='2vh'  maxW={'1000px'}/>
    </Box>
   
    <Box overflow={'scroll'} flex='1' pb='2vh'  pt='3vh'> 
        <Skeleton   isLoaded={conversationsData !== null} width={'100%'} maxW={'1000px'} minW={'500px'}> 
            <Text fontWeight={'medium'}>{t('DaysToClose')}</Text>
            <Text mb='.5vh' fontSize={'.8em'} color='gray.600'>{t('DaysToCloseDes')}</Text>
            <Box maxW={'350px'}px='2px'> 
                <VariableTypeChanger customType inputType="int" value={conversationsData?.solved_to_closed_days} setValue={(valueString) => handleEditKey('solved_to_closed_days', parseInt(valueString))}  min={0} max={30} />
            </Box>

            <Text mt='3vh' fontWeight={'medium'}>{t('InactivityDaysToClose')}</Text>
            <Text mb='.5vh' fontSize={'.8em'} color='gray.600'>{t('InactivityDaysToCloseDes')}</Text>
            <Box maxW={'350px'}px='2px'> 
                <VariableTypeChanger customType inputType="int" value={conversationsData?.no_activity_to_closed_days} setValue={(valueString) => handleEditKey('no_activity_to_closed_days', parseInt(valueString))}  min={0} max={30} />
            </Box>

            <Flex mt='3vh' gap='10px'alignItems={'center'}>
                <Switch isChecked={conversationsData?.auto_move_to_bin_closed} onChange={(e) => handleEditKey('auto_move_to_bin_closed', e.target.checked)}/>
                <Text fontWeight={'medium'}>{t('MoveTrash')}</Text>  
            </Flex>  
            <Text mt='.5vh' fontSize={'.8em'} color='gray.600'>{t('MoveTrashDes')}</Text>

            {conversationsData?.auto_move_to_bin_closed && <>   
                <Text mt='3vh' fontWeight={'medium'}>{t('DaysToDelete')}</Text>
                <Text   mb='.5vh' fontSize={'.8em'} color='gray.600'>{t('DaysToDelete')}</Text>
                <Box maxW={'350px'}px='2px'> 
                    <VariableTypeChanger customType inputType="int" value={conversationsData?.closed_to_bin_days} setValue={(valueString) => handleEditKey('closed_to_bin_days', parseInt(valueString))}  min={0} max={30} />
                </Box>
             
            </>}

            <Flex mt='3vh' gap='10px'alignItems={'center'}>
                <Switch isChecked={conversationsData?.auto_delete_bin} onChange={(e) => handleEditKey('auto_delete_bin', e.target.checked)}/>
                <Text fontWeight={'medium'}>{t('DeleteBinConversations')}</Text>  
            </Flex>  
            <Text mt='.5vh' fontSize={'.8em'} color='gray.600'>{t('MoveTrashDes')}</Text>

            {conversationsData?.auto_delete_bin && <>   
                <Text mt='3vh' fontWeight={'medium'}>{t('DaysToDeleteBin')}</Text>
                <Text mb='.5vh' fontSize={'.8em'} color='gray.600'>{t('DaysToDeleteBinDes')}</Text>
                <Box maxW={'350px'}px='2px'> 
                    <VariableTypeChanger customType inputType="int" value={conversationsData?.bin_to_deleted_days} setValue={(valueString) => handleEditKey('bin_to_deleted_days', parseInt(valueString))}  min={0} max={30} />
                </Box>
            </>}   
        </Skeleton>
    </Box>
    <Box> 
        <Box width={'100%'} mt='2vh' mb='2vh' height={'1px'} bg='gray.300'  maxW={'1000px'}/>
        <Flex flexDir={'row-reverse'}  maxW={'1000px'}> 
            <Button variant={'common'} onClick={sendNewConversationData} isDisabled={JSON.stringify(conversationsData) === JSON.stringify(conversationsDataRef.current)}>{waitingSend?<LoadingIconButton/>:t('SaveChanges')}</Button>
        </Flex>
    </Box>
    </>)
}

export default ConversationsData

