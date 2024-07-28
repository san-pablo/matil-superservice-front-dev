
//REACT
import  {useState, useEffect} from 'react'
import { useAuth } from '../../../../AuthContext'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Icon, Skeleton } from "@chakra-ui/react"
//ICONS
import { FaDatabase, FaFileLines } from "react-icons/fa6"
//FUNTIONS
import formatFileSize from '../../../Functions/formatFileSize'
import timeStampToDate from '../../../Functions/timeStampToString'
interface OrganizationData  {
    'name': string
    'timestamp_created': string
    'is_active': boolean
    'current_active_users':number
    'max_users': number
    'processed_tickets_this_month':number
    'max_tickets_per_month': number
    'data_storage_capacity': number
    'data_storage_used': number
    'file_storage_capacity': number
    'file_storage_used': number
}

function Data () {

    //CONSTANTS
    const auth = useAuth()

    //BOOLEAN FOR WAIT THE INFO
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)

    //ORGANIZATION DATA
    const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null)

    //FETCH NEW DATA WHEN THE VIEEW CHANGE
    useEffect(() => {
        fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/organization`, setValue:setOrganizationData, setWaiting:setWaitingInfo,auth:auth})
        document.title = `Cuenta - Datos - ${auth.authData.organizationId} - Matil`
    }, [])

    return(
    <>
 
        <Flex alignItems={'center'} justifyContent={'space-between'}> 
            <Flex alignItems={'center'} gap='15px'> 

                <Skeleton isLoaded={!waitingInfo}> 
                    <Text fontSize={'1.6em'} fontWeight={'medium'}>{organizationData?.name}</Text>
                </Skeleton>
                <Skeleton isLoaded={!waitingInfo}> 
                    <Box mt='-10px' display="inline-flex" fontSize='.8em' borderColor={organizationData?.is_active?'green.500':'red.600'} borderWidth={'1px'} py='1px' px='5px' fontWeight={'medium'} color='white'  bg={organizationData?.is_active?'green.400':'red.500'} borderRadius={'.7rem'}> 
                        <Text>{organizationData?.is_active?'Activa':'Desactivada'}</Text>
                    </Box>
                </Skeleton>
            </Flex>
            
            <Skeleton isLoaded={!waitingInfo}> 
                <Text color='gray.600'>Creada el {timeStampToDate(organizationData?.timestamp_created || '')}</Text>
            </Skeleton>
        </Flex>
        <Text color='gray.600' fontSize={'.9em'}>Conoce los detalles y estadísticas de tu organización.</Text>

        <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='5vh'/>

        <Text fontSize={'1.4em'}  fontWeight={'medium'}>Limitaciones del plan</Text>
        <Flex gap='30px' mt='2vh'  > 
        <Skeleton isLoaded={!waitingInfo}> 
            <Box bg='gray.50' p='20px' minW={'20vw'} borderWidth={'1px'} borderColor={'gray.300'} borderRadius={'.5rem'}>
                <Flex alignItems={'center'} gap='10px' color='gray.600'>
                    <Icon as={FaDatabase}/>
                    <Text fontWeight={'medium'}>Usuarios</Text>
                </Flex>
                <Text mt='1vh' fontWeight={'medium'} fontSize={'1.4em'}>Hay {organizationData?.current_active_users} usuarios activos</Text>
                <Text mt='1vh'  color='gray.600' fontWeight={'medium'}>{organizationData?.current_active_users} de {organizationData?.max_users} usuarios</Text>
            </Box>
        </Skeleton>

        <Skeleton isLoaded={!waitingInfo}> 
            <Box p='20px'  bg='gray.50' minW={'20vw'}  borderWidth={'1px'} borderColor={'gray.300'} borderRadius={'.5rem'}>
                <Flex alignItems={'center'} gap='10px' color='gray.600'>
                    <Icon as={FaFileLines}/>
                    <Text fontWeight={'medium'}>Tickets gesitonados por Matilda este mes</Text>
                </Flex>
                <Text mt='1vh' fontWeight={'medium'} fontSize={'1.4em'}>Matilda ha gestionado {organizationData?.processed_tickets_this_month} tickets</Text>
                <Text mt='1vh'  color='gray.600' fontWeight={'medium'}>{organizationData?.processed_tickets_this_month} de {organizationData?.max_tickets_per_month || '1.000.000'} tickets gestionados por Matilda</Text>
            </Box>
        </Skeleton>

        </Flex>

        <Text fontSize={'1.4em'} mt='5vh' fontWeight={'medium'}>Uso del almacenamiento</Text>
        <Flex gap='30px' mt='2vh'  > 
            <Skeleton isLoaded={!waitingInfo}> 
                <Box p='20px'  bg='gray.50' minW={'20vw'} borderWidth={'1px'} borderColor={'gray.300'} borderRadius={'.5rem'}>
                    <Flex alignItems={'center'} gap='10px' color='gray.600'>
                        <Icon as={FaDatabase}/>
                        <Text fontWeight={'medium'}>Almacenamiento de datos</Text>
                    </Flex>
                    <Text mt='1vh' fontWeight={'medium'} fontSize={'1.4em'}>Se han usado {formatFileSize(organizationData?.data_storage_used || 0)}</Text>
                    <Text mt='1vh'  color='gray.600' fontWeight={'medium'}>{formatFileSize(organizationData?.data_storage_used || 0)} de {formatFileSize(organizationData?.data_storage_capacity || 0)}</Text>
                </Box>
            </Skeleton>

            <Skeleton isLoaded={!waitingInfo}> 
                <Box p='20px'   bg='gray.50'minW={'20vw'}  borderWidth={'1px'} borderColor={'gray.300'} borderRadius={'.5rem'}>
                    <Flex alignItems={'center'} gap='10px' color='gray.600'>
                        <Icon as={FaFileLines}/>
                        <Text fontWeight={'medium'}>Almacenamiento de archivos</Text>
                    </Flex>
                    <Text mt='1vh' fontWeight={'medium'} fontSize={'1.4em'}>Se han usado {formatFileSize(organizationData?.file_storage_used || 0)}</Text>
                    <Text mt='1vh'  color='gray.600' fontWeight={'medium'}>{formatFileSize(organizationData?.file_storage_used || 0)} de {formatFileSize(organizationData?.file_storage_capacity || 0)}</Text>
                </Box>
            </Skeleton>
        </Flex>
    </>
 
    )
}

export default Data