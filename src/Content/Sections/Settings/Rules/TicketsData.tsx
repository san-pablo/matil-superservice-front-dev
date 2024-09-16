//REACT
import { useEffect, useRef, useState } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Flex, Button, NumberInput, NumberInputField, Skeleton, Switch } from "@chakra-ui/react"
//COMPONENTS
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
  
interface TicketsConfigProps {
    solved_to_closed_days: 0
    no_activity_to_closed_days: number
    auto_move_to_bin_closed: boolean
    closed_to_bin_days: number
    auto_delete_bin: boolean
    bin_to_deleted_days:number
}

const TicketsData = () => {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('settings')

    //BOOLEAN FOR WAITING THE UPLOAD
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    //TICKETS DATA
    const ticketDataRef = useRef<TicketsConfigProps | null>(null)
    const [ticketsData, setTicketsData] = useState<TicketsConfigProps | null>(null)

    //FETCH NEW DATA WHEN THE VIEEW CHANGE
    useEffect(() => {        
        document.title = `${t('Settings')} - ${t('Tickets')} - ${auth.authData.organizationId} - Matil`
        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/data`, setValue:setTicketsData, auth})
            if (response?.status === 200) ticketDataRef.current = response.data
        }
        fetchInitialData()
     }, [])

    //FUNCTION FOR EDITING EACH KEY
    const handleEditKey = (key:keyof(TicketsConfigProps), value:boolean | number) => {if (ticketsData) setTicketsData(prev => ({...prev as TicketsConfigProps, [key]:value}))}

    //FUNCTION FOR SEND A NEW CONFIGURATION
    const sendNewTicketData = async() => {
        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/data`, method:'put', requestForm:ticketsData as TicketsConfigProps, setValue:setTicketsData, setWaiting:setWaitingSend, auth, toastMessages:{works:'Configuración de los tockets guardada con éxito', failed:'Hubo un error al guardar la configuración de los tickets'}})
        if (response?.status === 200) ticketDataRef.current = ticketsData
    }
 
return(<>

    <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('Tickets')}</Text>
    <Text color='gray.600' fontSize={'.9em'}>{t('TicketsDes')}</Text>

    <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='3vh'/>

    <Skeleton isLoaded={ticketsData !== null} width={'100%'} maxW={'1000px'} minW={'500px'}> 

        <Text fontWeight={'medium'}>{t('DaysToClose')}</Text>
        <Text mb='.5vh' fontSize={'.8em'} color='gray.600'>{t('DaysToCloseDes')}</Text>
        <Box maxW={'350px'}> 
            <NumberInput size='sm' value={ticketsData?.solved_to_closed_days} onChange={(valueString) => handleEditKey('solved_to_closed_days', parseInt(valueString))} min={1} max={360}>
                <NumberInputField  fontSize={'.9em'} borderRadius='.5rem'   borderColor={'gray.300'} _hover={{ border: '1px solid #CBD5E0' }} _focus={{ borderColor: 'rgb(77, 144, 254)', borderWidth: '2px', px:'6px' }} px='7px' />
            </NumberInput>
        </Box>

        <Text mt='3vh' fontWeight={'medium'}>{t('InactivityDaysToClose')}</Text>
        <Text mb='.5vh' fontSize={'.8em'} color='gray.600'>{t('InactivityDaysToCloseDes')}</Text>
        <Box maxW={'350px'}> 
            <NumberInput size='sm' value={ticketsData?.no_activity_to_closed_days} onChange={(valueString) => handleEditKey('no_activity_to_closed_days', parseInt(valueString))} min={1} max={360}>
                <NumberInputField  fontSize={'.9em'} borderRadius='.5rem'   borderColor={'gray.300'} _hover={{ border: '1px solid #CBD5E0' }} _focus={{ borderColor: 'rgb(77, 144, 254)', borderWidth: '2px', px:'6px' }} px='7px' />
            </NumberInput>
        </Box>

 
        <Flex mt='3vh' gap='10px'alignItems={'center'}>
            <Switch isChecked={ticketsData?.auto_move_to_bin_closed} onChange={(e) => handleEditKey('auto_move_to_bin_closed', e.target.checked)}/>
            <Text fontWeight={'medium'}>{t('MoveTrash')}</Text>  
        </Flex>  
        <Text mt='.5vh' fontSize={'.8em'} color='gray.600'>{t('MoveTrashDes')}</Text>

        {ticketsData?.auto_move_to_bin_closed && <>   
            <Text mt='3vh' fontWeight={'medium'}>{t('DaysToDelete')}</Text>
            <Text   mb='.5vh' fontSize={'.8em'} color='gray.600'>{t('DaysToDelete')}</Text>
            <Box maxW={'350px'}> 
                <NumberInput size='sm' value={ticketsData?.closed_to_bin_days} onChange={(valueString) => handleEditKey('closed_to_bin_days', parseInt(valueString))} min={1} max={360}>
                    <NumberInputField  fontSize={'.9em'} borderRadius='.5rem'   borderColor={'gray.300'} _hover={{ border: '1px solid #CBD5E0' }} _focus={{ borderColor: 'rgb(77, 144, 254)', borderWidth: '2px', px:'6px' }} px='7px' />
                </NumberInput>
            </Box>
        </>}

        <Flex mt='3vh' gap='10px'alignItems={'center'}>
            <Switch isChecked={ticketsData?.auto_delete_bin} onChange={(e) => handleEditKey('auto_delete_bin', e.target.checked)}/>
            <Text fontWeight={'medium'}>{t('DeleteBinTickets')}</Text>  
        </Flex>  
        <Text mt='.5vh' fontSize={'.8em'} color='gray.600'>{t('MoveTrashDes')}</Text>

        {ticketsData?.auto_delete_bin && <>   
            <Text mt='3vh' fontWeight={'medium'}>{t('DaysToDeleteBin')}</Text>
            <Text mb='.5vh' fontSize={'.8em'} color='gray.600'>{t('DaysToDeleteBinDes')}</Text>
            <Box maxW={'350px'}> 
                <NumberInput size='sm' value={ticketsData?.bin_to_deleted_days} onChange={(valueString) => handleEditKey('bin_to_deleted_days', parseInt(valueString))} min={1} max={360}>
                    <NumberInputField  fontSize={'.9em'} borderRadius='.5rem'   borderColor={'gray.300'} _hover={{ border: '1px solid #CBD5E0' }} _focus={{ borderColor: 'rgb(77, 144, 254)', borderWidth: '2px', px:'6px' }} px='7px' />
                </NumberInput>
            </Box>
        </>}

        <Box width={'100%'} mt='3vh' mb='3vh' height={'1px'} bg='gray.300'/>
        <Flex flexDir={'row-reverse'}> 
            <Button onClick={sendNewTicketData} isDisabled={JSON.stringify(ticketsData) === JSON.stringify(ticketDataRef.current)}>{waitingSend?<LoadingIconButton/>:'Guardar cambios'}</Button>
        </Flex>
    </Skeleton></>)
}

export default TicketsData