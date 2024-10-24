
//REACT
import  {useState, useEffect} from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Icon, Skeleton } from "@chakra-ui/react"
//ICONS
import { FaDatabase, FaFileLines } from "react-icons/fa6"
import { BsPeopleFill } from "react-icons/bs"
import { FaTicket } from "react-icons/fa6"
//FUNTIONS
import formatFileSize from '../../../Functions/formatFileSize'
import timeStampToDate from '../../../Functions/timeStampToString'

//TYPING
interface OrganizationData  {
    'name': string
    'timestamp_created': string
    'is_active': boolean
    'current_active_users':number
    'max_users': number
    'processed_conversations_this_month':number
    'max_conversations_per_month': number
    'data_storage_capacity': number
    'data_storage_used': number
    'file_storage_capacity': number
    'file_storage_used': number
}

//MAIN FUNCTION
function Data () {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('settings')
    const t_formats  = useTranslation('formats').t

    //BOOLEAN FOR WAIT THE INFO
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)

    //ORGANIZATION DATA
    const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null)

    //FETCH NEW DATA WHEN THE VIEEW CHANGE
    useEffect(() => {
        fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/organization`, setValue:setOrganizationData, setWaiting:setWaitingInfo,auth:auth})
        document.title = `${t('Settings')} - ${t('Data')} - ${auth.authData.organizationId} - Matil`
    }, [])

    return(
    <Box>
        <Flex alignItems={'center'} justifyContent={'space-between'}> 
            <Flex alignItems={'center'} gap='15px'> 

                <Skeleton isLoaded={!waitingInfo}> 
                    <Text fontSize={'1.6em'} fontWeight={'medium'}>{organizationData?.name}</Text>
                </Skeleton>
                <Skeleton isLoaded={!waitingInfo}> 
                    <Box mt='-10px' display="inline-flex" fontSize='.8em'  py='1px' px='5px' fontWeight={'medium'} color={organizationData?.is_active?'green.600':'red.600'}  bg={organizationData?.is_active?'green.100':'red.100'} borderRadius={'.7rem'}> 
                        <Text>{organizationData?.is_active?t('Active'):t('Inactive')}</Text>
                    </Box>
                </Skeleton>
            </Flex>
            
            <Skeleton isLoaded={!waitingInfo}> 
                <Text color='gray.600'>{t('CreatedAt', {date:timeStampToDate((organizationData?.timestamp_created || ''), t_formats)})} </Text>
            </Skeleton>
        </Flex>
        <Text color='gray.600' fontSize={'.9em'}>{t('DataDes')}</Text>

        <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='5vh'/>

        <Text fontSize={'1.4em'}  fontWeight={'medium'}>{t('PlanLimitations')}</Text>
        <Flex gap='30px' mt='2vh'  > 
        <Skeleton isLoaded={!waitingInfo}> 
            <Box   p='20px' minW={'20vw'} borderWidth={'1px'} bg='brand.gray_2' borderColor={'gray.200'} shadow={'md'} borderRadius={'.5rem'}>
                <Flex alignItems={'center'} gap='10px' color='gray.600'>
                    <Icon as={BsPeopleFill}/>
                    <Text fontWeight={'medium'}>{t('Users')}</Text>
                </Flex>
                <Text mt='1vh' fontWeight={'medium'} fontSize={'1.4em'}>{t('ActiveUsers', {count:organizationData?.current_active_users})}</Text>
                <Text mt='1vh'  color='gray.600' fontWeight={'medium'}>{t('LimitUsers', {count:organizationData?.current_active_users, max:organizationData?.max_users})}</Text>
            </Box>
        </Skeleton>

        <Skeleton isLoaded={!waitingInfo}> 
            <Box p='20px'  minW={'20vw'}  borderWidth={'1px'} bg='brand.gray_2' borderColor={'gray.200'} shadow={'md'} borderRadius={'.5rem'}>
                <Flex alignItems={'center'} gap='10px' color='gray.600'>
                    <Icon as={FaTicket}/>
                    <Text fontWeight={'medium'}>{t('MatildaConversations')}</Text>
                </Flex>
                <Text mt='1vh' fontWeight={'medium'} fontSize={'1.4em'}>{t('MatildaWork', {count:organizationData?.processed_conversations_this_month})}</Text>
                <Text mt='1vh'  color='gray.600' fontWeight={'medium'}>{t('LimitMatilda', {count:organizationData?.processed_conversations_this_month, max:organizationData?.max_conversations_per_month || '1.000.000'})}</Text>
            </Box>
        </Skeleton>

        </Flex>

        <Text fontSize={'1.4em'} mt='5vh' fontWeight={'medium'}>{t('StoreUse')}</Text>
        <Flex gap='30px' mt='2vh'  > 
            <Skeleton isLoaded={!waitingInfo}> 
                <Box p='20px'  minW={'20vw'}borderWidth={'1px'} bg='brand.gray_2' borderColor={'gray.200'} shadow={'md'}  borderRadius={'.5rem'}>
                    <Flex alignItems={'center'} gap='10px' color='gray.600'>
                        <Icon as={FaDatabase}/>
                        <Text fontWeight={'medium'}>{t('DataStore')}</Text>
                    </Flex>
                    <Text mt='1vh' fontWeight={'medium'} fontSize={'1.4em'}>{t('DataStoreUse', {size:formatFileSize(organizationData?.data_storage_used || 0)})}</Text>
                    <Text mt='1vh'  color='gray.600' fontWeight={'medium'}>{t('DataStoreLimit', {size:formatFileSize(organizationData?.data_storage_used || 0), max:formatFileSize(organizationData?.data_storage_capacity || 0)})}</Text>
                </Box>
            </Skeleton>

            <Skeleton isLoaded={!waitingInfo}> 
                <Box p='20px' borderWidth={'1px'} bg='brand.gray_2' borderColor={'gray.200'} shadow={'md'} minW={'20vw'}  borderRadius={'.5rem'}>
                    <Flex alignItems={'center'} gap='10px' color='gray.600'>
                        <Icon as={FaFileLines}/>
                        <Text fontWeight={'medium'}>{t('FileStore')}</Text>
                    </Flex>
                    <Text mt='1vh' fontWeight={'medium'} fontSize={'1.4em'}>{t('FileStoreUse', {size:formatFileSize(organizationData?.file_storage_used || 0)})}</Text>
                    <Text mt='1vh'  color='gray.600' fontWeight={'medium'}>{t('FileStoreLimit', {size:formatFileSize(organizationData?.file_storage_used || 0), max:formatFileSize(organizationData?.file_storage_capacity || 0)})}</Text>
                </Box>
            </Skeleton>
        </Flex>
    </Box>
 
    )
}

export default Data