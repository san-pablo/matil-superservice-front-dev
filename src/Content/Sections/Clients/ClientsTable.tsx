//REACT
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../../AuthContext"
import { useSession } from "../../../SessionContext"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Box, Text, Button, IconButton, Skeleton } from '@chakra-ui/react'
//COMPONENTS
import EditText from "../../Components/EditText"
import AccionesButton from "../Tickets/ActionsButton"
import FilterButton from "../../Components/FilterButton"
import Table from "./Table"
//ICONS
import { FaMagnifyingGlass } from "react-icons/fa6" 
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io"
import { PiDesktopTowerFill } from "react-icons/pi"
//TYPING
import { Clients, Channels,  ClientColumn, logosMap, HeaderSectionType } from "../../Constants/typing"
 
interface ClientsFilters {
    page_index:number
    channel_types:Channels[]
    search?:string
    sort_by?:ClientColumn
    order?:'asc' | 'desc'
}

//MAIN FUNCTION
function ClientsTable ({addHeaderSection}:{addHeaderSection:HeaderSectionType}) {

    //AUTH CONSTANT
    const auth = useAuth()
    const session = useSession()

    //CONTAINER REF
    const containerRef = useRef<HTMLDivElement>(null)

    //BOOLEAN FOR WAIT THE INFO
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)

    //SELECT DATA LOGIC
    const [clients, setClients] = useState<Clients | null>(null)
    const [filters, setFilters] = useState<ClientsFilters>({page_index:1, channel_types:[]})

    //FETCH DATA ON FIRST RENDER
    useEffect(() => {
        document.title = `Clientes - ${auth.authData.organizationName} - Matil`
        localStorage.setItem('currentSection', `clients`)

        const fetchClientsData = async() => {
            if (session.sessionData.clientsTable) {
                setClients(session.sessionData.clientsTable.data)
                setFilters(session.sessionData.clientsTable.filters)
                setWaitingInfo(false)
            }
            else {
                const clientResponse = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/clients`, setValue:setClients, setWaiting:setWaitingInfo, params:{page_index:1},auth:auth})
                if (clientResponse?.status === 200) session.dispatch({type:'UPDATE_CLIENTS_TABLE',payload:{data:clientResponse?.data, filters}})
            }
        }    
        fetchClientsData()
    }, [])
 
    //FETCH NEW DATA ON FILTERS CHANGE
    const fetchClientDataWithFilter = async (filters:{page_index:number, channel_types:Channels[], sort_by?:ClientColumn, search?:string, order?:'asc' | 'desc'}) => {
        setFilters(filters)
        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/clients`, setValue:setClients, setWaiting:setWaitingInfo, params:filters, auth})
        if (response?.status === 200) {            
            session.dispatch({ type: 'UPDATE_CLIENTS_TABLE', payload: {data:response.data, filters:filters} })
         }
    }

    //SELECT CHANNELS LOGIC
    const toggleChannelsList = (element: Channels) => {
        const channelsList = filters.channel_types
        if (channelsList.includes(element)) setFilters({...filters, channel_types: channelsList.filter(e => e !== element)})
        else setFilters({...filters, channel_types: [...channelsList, element]})
    }

    //FRONT
    return(
        <Box bg='white' height={'calc(100vh - 60px)'} maxW={'calc(100vw - 60px)'} overflowX={'scroll'} p='2vw'>
    
            <Flex justifyContent={'space-between'} alignItems={'end'}> 
                <Text fontWeight={'medium'} fontSize={'1.5em'}>Clientes</Text>
                <AccionesButton items={clients ? clients.page_data:[]} view={null} section={'clients'}/>
             </Flex>
            <Flex justifyContent={'space-between'} alignItems={'end'} gap='20px'  > 
                <Flex gap='20px' alignItems={'center'} mt='3vh' flex='1' ref={containerRef} px='4px' overflowX={'scroll'}>
                    <Box minW='200px' width={'300px'} alignItems={'center'} >
                        <EditText value={filters.search} setValue={(value:string) => setFilters({...filters, search:value})} searchInput={true}/>
                    </Box> 
       
                    <FilterButton selectList={Object.keys(logosMap)} selectedElements={filters.channel_types} setSelectedElements={(element) => toggleChannelsList(element as Channels)} icon={PiDesktopTowerFill} filter='channels'/>
                </Flex>
                <Button whiteSpace='nowrap'  minWidth='auto'leftIcon={<FaMagnifyingGlass/>} size='sm' onClick={() => fetchClientDataWithFilter({...filters,page_index:1})}>Aplicar filtros</Button>
            </Flex>
            <Box bg={'gray.200'} height={'1px'} mt='3vh' mb='3vh' width='100%'/>

            <Skeleton isLoaded={!waitingInfo}> 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{clients?.total_clients} Cliente{clients?.total_clients == 1 ? '':'s'}</Text>
            </Skeleton>
            
            {/*TABLA*/}
            <Box> 
                <Flex p='10px' alignItems={'center'} justifyContent={'end'} gap='10px' flexDir={'row-reverse'}>
                    <IconButton isRound size='xs' aria-label='next-page' icon={<IoIosArrowForward />} isDisabled={filters.page_index >= Math.floor((clients?.total_clients || 0)/ 50)} onClick={() => fetchClientDataWithFilter({...filters,page_index:filters.page_index + 1})}/>
                    <Text fontWeight={'medium'} fontSize={'.9em'} color='gray.600'>Página {filters.page_index}</Text>
                    <IconButton isRound size='xs' aria-label='next-page' icon={<IoIosArrowBack />} isDisabled={filters.page_index === 1} onClick={() => fetchClientDataWithFilter({...filters,page_index:filters.page_index - 1})}/>
                </Flex>
            
                <Skeleton isLoaded={!waitingInfo}> 
                    <Table data={clients?.page_data} updateData={fetchClientDataWithFilter} filters={filters}   maxWidth={'calc(96vw - 60px)'}/>
                </Skeleton>
            </Box>
    
        </Box>
        )
}

export default ClientsTable

 