
//REACT
import  { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Icon, Skeleton, Textarea,Button } from "@chakra-ui/react"
//COMPONENTS
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
//ICONS
import { FaDatabase, FaFileLines } from "react-icons/fa6"
import { BsPeopleFill } from "react-icons/bs"
import { FaTicket } from "react-icons/fa6"
//FUNTIONS
import formatFileSize from '../../../Functions/formatFileSize'
import timeStampToDate from '../../../Functions/timeStampToString'
import { useAuth0 } from '@auth0/auth0-react'

//TYPING
interface OrganizationData  {
    description:string
    name: string
    timestamp_created: string
    is_active: boolean
    current_active_users:number
    max_users: number
    processed_conversations_this_month:number
    max_conversations_per_month: number
    data_storage_capacity: number
    data_storage_used: number
    file_storage_capacity: number
    file_storage_used: number
}

//MAIN FUNCTION
function Data () {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('settings')
    const t_formats  = useTranslation('formats').t
    const {  getAccessTokenSilently } = useAuth0()

    //BOOLEAN FOR WAIT THE INFO
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)

    //ORGANIZATION DATA
    const orgDataRef = useRef<OrganizationData | null>(null)
    const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null)

    //FETCH NEW DATA WHEN THE VIEEW CHANGE
    useEffect(() => {
        const fetchInitialData = async () => {
            const response = await fetchData({ getAccessTokenSilently, endpoint:`${auth.authData.organizationId}/admin/settings/organization`, setValue:setOrganizationData, setWaiting:setWaitingInfo,auth:auth})
            if (response?.status === 200 ) orgDataRef.current = response.data
        }
        document.title = `${t('Settings')} - ${t('Data')} - ${auth.authData.organizationName} - Matil`
        fetchInitialData()
    }, [])

    return(
    <Box p='2vw' py='2vh'> 
        <Flex alignItems={'center'} gap='15px'>
            <Skeleton isLoaded={!waitingInfo}> 
                <Text fontSize={'1.2em'} fontWeight={'medium'}>{organizationData?.name}</Text>
            </Skeleton>
            <Skeleton isLoaded={!waitingInfo}> 
                <Box display="inline-flex" fontSize='.8em'  py='1px' px='5px' fontWeight={'medium'} color={organizationData?.is_active?'green.600':'red.600'}  bg={organizationData?.is_active?'green.100':'red.100'} borderRadius={'.7rem'}> 
                    <Text fontSize={'.9em'}>{organizationData?.is_active?t('Active'):t('Inactive')}</Text>
                </Box>
            </Skeleton>
        </Flex>
        
        <Flex justifyContent={'space-between'}> 
            <Text color='gray.600' fontSize={'.8em'}>{t('DataDes')}</Text>
            <Skeleton isLoaded={!waitingInfo}> 
                <Text color='gray.600' fontSize={'.8em'}>{t('CreatedAt', {date:timeStampToDate((organizationData?.timestamp_created || ''), t_formats)})} </Text>
            </Skeleton>
        </Flex>

        <Box width='100%' bg='gray.200' height='1px' mt='2vh' mb='2vh'/>

        <Box flex='1'>
           
            <Text fontSize={'1.2em'}  fontWeight={'medium'}>{t('PlanLimitations')}</Text>
            <Flex gap='30px' mt='2vh'  > 
                <Skeleton isLoaded={!waitingInfo}> 
                    <Box   p='20px' minW={'20vw'} borderWidth={'1px'} bg='white' borderColor={'gray.200'} shadow={'md'} borderRadius={'.5rem'}>
                        <Flex alignItems={'center'} gap='10px' color='gray.600'>
                            <Icon as={BsPeopleFill}/>
                            <Text fontWeight={'medium'}>{t('Users')}</Text>
                        </Flex>
                        <Text mt='1vh' fontWeight={'medium'} fontSize={'1.2em'}>{t('ActiveUsers', {count:organizationData?.current_active_users})}</Text>
                        <Text mt='1vh'  color='gray.600' fontWeight={'medium'}>{t('LimitUsers', {count:organizationData?.current_active_users, max:organizationData?.max_users})}</Text>
                    </Box>
                </Skeleton>

                <Skeleton isLoaded={!waitingInfo}> 
                    <Box p='20px'  minW={'20vw'}  borderWidth={'1px'} bg='white' borderColor={'gray.200'} shadow={'md'} borderRadius={'.5rem'}>
                        <Flex alignItems={'center'} gap='10px' color='gray.600'>
                            <Icon as={FaTicket}/>
                            <Text fontWeight={'medium'}>{t('MatildaConversations')}</Text>
                        </Flex>
                        <Text mt='1vh' fontWeight={'medium'} fontSize={'1.2em'}>{t('MatildaWork', {count:organizationData?.processed_conversations_this_month})}</Text>
                        <Text mt='1vh'  color='gray.600' fontWeight={'medium'}>{t('LimitMatilda', {count:organizationData?.processed_conversations_this_month, max:organizationData?.max_conversations_per_month || '1.000.000'})}</Text>
                    </Box>
                </Skeleton>
            </Flex>

            <Text fontSize={'1.2em'} mt='5vh' fontWeight={'medium'}>{t('StoreUse')}</Text>
            <Flex gap='30px' mt='2vh'  > 
                <Skeleton isLoaded={!waitingInfo}> 
                    <Box p='20px'  minW={'20vw'}borderWidth={'1px'} bg='white' borderColor={'gray.200'} shadow={'md'}  borderRadius={'.5rem'}>
                        <Flex alignItems={'center'} gap='10px' color='gray.600'>
                            <Icon as={FaDatabase}/>
                            <Text fontWeight={'medium'}>{t('DataStore')}</Text>
                        </Flex>
                        <Text mt='1vh' fontWeight={'medium'} fontSize={'1.2em'}>{t('DataStoreUse', {size:formatFileSize(organizationData?.data_storage_used || 0)})}</Text>
                        <Text mt='1vh'  color='gray.600' fontWeight={'medium'}>{t('DataStoreLimit', {size:formatFileSize(organizationData?.data_storage_used || 0), max:formatFileSize(organizationData?.data_storage_capacity || 0)})}</Text>
                    </Box>
                </Skeleton>

                <Skeleton isLoaded={!waitingInfo}> 
                    <Box p='20px' borderWidth={'1px'} bg='white' borderColor={'gray.200'} shadow={'md'} minW={'20vw'}  borderRadius={'.5rem'}>
                        <Flex alignItems={'center'} gap='10px' color='gray.600'>
                            <Icon as={FaFileLines}/>
                            <Text fontWeight={'medium'}>{t('FileStore')}</Text>
                        </Flex>
                        <Text mt='1vh' fontWeight={'medium'} fontSize={'1.2em'}>{t('FileStoreUse', {size:formatFileSize(organizationData?.file_storage_used || 0)})}</Text>
                        <Text mt='1vh'  color='gray.600' fontWeight={'medium'}>{t('FileStoreLimit', {size:formatFileSize(organizationData?.file_storage_used || 0), max:formatFileSize(organizationData?.file_storage_capacity || 0)})}</Text>
                    </Box>
                </Skeleton>
            </Flex>
        </Box>
    </Box>
 
    )
}

export default Data