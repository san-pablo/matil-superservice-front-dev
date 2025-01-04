//REACT
import { useState, useEffect, lazy } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../AuthContext"
import { useSession } from "../../../SessionContext"
import { useLocation, useNavigate } from "react-router-dom"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { motion, isValidMotionProp } from 'framer-motion'
import { Flex, Box, Text, Button, IconButton, Skeleton, Tooltip, chakra, shouldForwardProp } from '@chakra-ui/react'
//COMPONENTS
import EditText from "../../Components/Reusable/EditText"
import FilterButton from "../../Components/Reusable/FilterButton"
import Table from "../../Components/Reusable/Table"
//FUNCTIONS
import timeStampToDate from "../../Functions/timeStampToString"
import timeAgo from "../../Functions/timeAgo"
//ICONS
import { IconType } from "react-icons"
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io"
import { PiDesktopTowerFill } from "react-icons/pi"
import { FaFilter, FaPhone } from "react-icons/fa"
import { IoMdMail, IoLogoWhatsapp } from "react-icons/io"
import { IoChatboxEllipses, IoLogoGoogle } from "react-icons/io5"
import { AiFillInstagram } from "react-icons/ai"
import { FaCloud } from "react-icons/fa6"
//TYPING
import { Clients, Channels,  ClientColumn, languagesFlags } from "../../Constants/typing"
import { useAuth0 } from "@auth0/auth0-react"
//SECTION
const Client = lazy(() => import('./Client'))
  
//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

interface ClientsFilters {
    page_index:number
    channel_types:Channels[]
    search?:string
    sort_by?:ClientColumn
    order?:'asc' | 'desc'
}

//GET THE CELL STYLE
const CellStyle = ({ column, element }:{column:string, element:any}) => {
     
    //TRANSLATION
    const { t } = useTranslation('clients')
    const t_formats = useTranslation('formats').t

    if (column === 'created_at' ||  column === 'last_interaction_at' )  
    return(
        <Tooltip label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
            <Text whiteSpace={'nowrap'} fontSize={'.9em'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    else if (column === 'labels') {
        return(<> 
        <Flex minH={'35px'} alignItems={'center'}> 
        {element === ''? <Text>-</Text>:
            <Flex gap='5px' flexWrap={'wrap'}>
                {element.split(',').map((label:string, index:number) => (
                    <Flex  bg='brand.gray_2'borderColor={'gray.300'} borderWidth={'1px'} p='4px' borderRadius={'.5rem'} fontSize={'.8em'} key={`client-label-${index}`}>
                        <Text>{label}</Text>
                    </Flex>
                ))}
            </Flex>
        }
        </Flex>
    </>)
    }
    else if (column === 'language') {
        return(
        <Flex gap='5px' fontSize={'.9em'}  alignItems={'center'}>
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][0]:'No detectado'}</Text>
            <Text fontSize={'.8em'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][1]:'🏴󠁥󠁳󠁣󠁴󠁿'}</Text>
        </Flex>)
    }   
    else if (column === 'is_blocked') return <Text color={element?'red':'black'}>{element?t('is_blocked'):t('Active')}</Text>  
    else return ( <Text fontSize={'.9em'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={column === 'name'?'medium':'normal'}  overflow={'hidden'} >{element === ''?'-':element}</Text>)
}


//MAIN FUNCTION
function ClientsTable ({socket}:{socket:any}) {

    //AUTH CONSTANT
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()
    const session = useSession()
    const location = useLocation().pathname
    const navigate = useNavigate()
    const { t } = useTranslation('clients')
    const columnsClientsMap:{[key:string]:[string, number]} = {name: [t('name'), 200], contact: [t('contact'), 150], labels: [t('labels'), 350], last_interaction_at: [t('last_interaction_at'), 180], created_at: [t('created_at'), 150], rating: [t('rating'), 60], language: [t('language'), 150], notes: [t('notes'), 350],  is_blocked: [t('is_blocked'), 150]}
    const logosMap:{[key in Channels]: [string, IconType]} = { 
        'email':[ t('email'), IoMdMail],
        'voip':[ t('voip'), FaCloud],
        'whatsapp':[ t('whatsapp'), IoLogoWhatsapp ], 
        'webchat':[ t('webchat'), IoChatboxEllipses], 
        'google_business':[ t('google_business'), IoLogoGoogle],
        'instagram': [t('instagram'), AiFillInstagram], 
        'phone':[ t('phone'), FaPhone]
    }

    //EXPAND CLIENT
    const [expandClient, setExpandClient] = useState<boolean>(false)
    useEffect(() => {setExpandClient(location.split('/')[location.split('/').length - 1] === 'clients')},[location])

    //BOOLEAN FOR WAIT THE INFO
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)

    //SELECT DATA LOGIC
    const [clients, setClients] = useState<Clients | null>(null)
    const [filters, setFilters] = useState<ClientsFilters>({page_index:1, channel_types:[]})
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)

    //FETCH DATA ON FIRST RENDER
    useEffect(() => {
        document.title = `${t('Clients')} - ${auth.authData.organizationName} - Matil`
        localStorage.setItem('currentSection', `clients`)

        const fetchClientsData = async() => {
            if (session.sessionData.clientsTable) {
                setClients(session.sessionData.clientsTable.data)
                setFilters(session.sessionData.clientsTable.filters)
                setSelectedIndex(session.sessionData.clientsTable.selectedIndex)
                setWaitingInfo(false)
            }
            else {
                const clientResponse = await fetchData({endpoint:`${auth.authData.organizationId}/contacts`, setValue:setClients,getAccessTokenSilently, setWaiting:setWaitingInfo, params:{page_index:1},auth:auth})
                if (clientResponse?.status === 200) session.dispatch({type:'UPDATE_CLIENTS_TABLE',payload:{data:clientResponse?.data, filters, selectedIndex:-1}})
            }
        }    
        fetchClientsData()
    }, [])


    //SORT LOGIC
    const requestSort = (key: string) => {
        const direction = (filters?.sort_by === key && filters?.order === 'asc') ? 'desc' : 'asc';
        fetchClientDataWithFilter({...filters, sort_by: key as ClientColumn, order: direction as 'asc' | 'desc'})
    }
    const getSortIcon = (key: string) => {
        if (filters?.sort_by === key) { 
            if (filters?.order === 'asc') return true
            else return false
        }
        else return null    
    }

    const clickRow = (client:any, index:number) => {
        session.dispatch({type:'UPDATE_CLIENTS_TABLE_SELECTED_ITEM', payload:{index}})
        navigate(`${client.id}`)
    }

   

    //FETCH NEW DATA ON FILTERS CHANGE
    const fetchClientDataWithFilter = async (filters:{page_index:number, channel_types:Channels[], sort_by?:ClientColumn, search?:string, order?:'asc' | 'desc'}) => {
        setFilters(filters)
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/contacts`, getAccessTokenSilently,setValue:setClients, setWaiting:setWaitingInfo, params:filters, auth})
        if (response?.status === 200) {            
            session.dispatch({ type: 'UPDATE_CLIENTS_TABLE', payload: {data:response.data, filters:filters, selectedIndex} })
         }
    }

    //SELECT CHANNELS LOGIC
    const toggleChannelsList = (element: Channels) => {
        const channelsList = filters?.channel_types
        if (channelsList.includes(element)) setFilters({...filters, channel_types: channelsList.filter(e => e !== element)})
        else setFilters({...filters, channel_types: [...channelsList, element]})
    }

    const clientBoxWidth = expandClient ? Math.min(window.innerWidth * 0.6, window.innerWidth - 500) - 200 : Math.min(window.innerWidth * 0.6, window.innerWidth - 500)

    //FRONT
    return(
        <>  
        <MotionBox width={clientBoxWidth + 'px'}  overflowY={'scroll'} initial={{ width: clientBoxWidth + 'px', opacity: expandClient?1:0}} animate={{ width: clientBoxWidth + 'px',  opacity: expandClient?0:1  }} exit={{ width: clientBoxWidth + 'px',  opacity: expandClient?1:0}} transition={{ duration: '.2'}} 
        bg='white' top={0} boxShadow="-4px 0 6px -2px rgba(0, 0, 0, 0.1)" right={0} pointerEvents={expandClient ?'none':'auto'} height={'100vh'}  p={expandClient ?'1vw':'0'} overflowX={'hidden'} position='absolute' zIndex={100} overflow={'hidden'} >
            <Client socket={socket}/> 
        </MotionBox>
  
        <Box height={'100%'} width={'calc(98vw - 55px)'} overflowX={'scroll'} overflowY={'hidden'} >
    
            <Flex gap='15px'  > 
                <Box width={'300px'}> 
                    <EditText filterData={(text:string) => {fetchClientDataWithFilter({...filters, search:text})}} value={filters?.search} setValue={(value) => setFilters(prev => ({...prev, search:value}))} searchInput={true}/>
                </Box>
                <FilterButton selectList={Object.keys(logosMap)} itemsMap={logosMap} selectedElements={filters?.channel_types} setSelectedElements={(element) => toggleChannelsList(element as Channels)} icon={PiDesktopTowerFill} initialMessage={t('ClientsFilterMessage')}/>
                <Button leftIcon={<FaFilter/>} fontSize={'.9em'} size='sm' variant={'common'}  onClick={() => fetchClientDataWithFilter({...filters, page_index:1})}>{t('ApplyFilters')}</Button>
            </Flex>

            <Flex mt='1vh'  justifyContent={'space-between'} alignItems={'center'}> 
                <Skeleton  isLoaded={!waitingInfo} >
                    <Text fontWeight={'medium'} color='gray.600' > {t('ClientsCount', {count:clients?.total_contacts})}</Text> 
                </Skeleton>
                <Flex  mb='1vh' alignItems={'center'} justifyContent={'end'} gap='10px' flexDir={'row-reverse'}>
                    <IconButton isRound size='xs'  variant={'common'}  aria-label='next-page' icon={<IoIosArrowForward />} isDisabled={filters?.page_index > Math.floor((clients?.total_contacts || 0)/ 25)} onClick={() => fetchClientDataWithFilter({...filters,page_index:filters?.page_index + 1})}/>
                    <Text fontWeight={'medium'} fontSize={'.8em'} color='gray.600'>{t('Page')} {filters?.page_index}</Text>
                    <IconButton isRound size='xs' variant={'common'} aria-label='next-page' icon={<IoIosArrowBack />} isDisabled={filters?.page_index === 1} onClick={() => fetchClientDataWithFilter({...filters,page_index:filters?.page_index - 1})}/>
                </Flex>
            </Flex>

 
            <Table data={clients?.page_data || []} CellStyle={CellStyle} noDataMessage={t('NoClients')} columnsMap={columnsClientsMap} requestSort={requestSort} getSortIcon={getSortIcon} onClickRow={clickRow} excludedKeys={['id', 'contact_business_id', 'phone_number', 'email_address', 'instagram_username', 'webchat_uuid', 'google_business_review_id']}  currentIndex={selectedIndex} />
 
        </Box>
        </>)
}

export default ClientsTable

 