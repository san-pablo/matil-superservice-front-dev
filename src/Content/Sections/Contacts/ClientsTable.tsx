//REACT
import { useState, useEffect, lazy, Dispatch, SetStateAction, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../AuthContext"
import { useSession } from "../../../SessionContext"
import { useLocation, useNavigate } from "react-router-dom"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { motion, isValidMotionProp, AnimatePresence } from 'framer-motion'
import { Flex, Box, Text, Button, IconButton, Skeleton, Tooltip, chakra, shouldForwardProp } from '@chakra-ui/react'
//COMPONENTS
import EditText from "../../Components/Reusable/EditText"
import FilterButton from "../../Components/Reusable/FilterButton"
import Table from "../../Components/Reusable/Table"
//FUNCTIONS
import timeStampToDate from "../../Functions/timeStampToString"
import timeAgo from "../../Functions/timeAgo"
import useOutsideClick from "../../Functions/clickOutside"
//ICONS
import { IconType } from "react-icons"
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io"
import { PiDesktopTowerFill } from "react-icons/pi"
import { FaFilter, FaPhone } from "react-icons/fa"
import { IoMdMail, IoLogoWhatsapp } from "react-icons/io"
import { IoChatboxEllipses, IoLogoGoogle } from "react-icons/io5"
import { AiFillInstagram } from "react-icons/ai"
import { FaCloud } from "react-icons/fa6"
import { PiSidebarSimpleBold } from "react-icons/pi"
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
        <Tooltip label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='.8em' p='6px'> 
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
function ClientsTable ({socket, setHideViews}:{socket:any, setHideViews:Dispatch<SetStateAction<boolean>>}) {

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
    useEffect(() => {setExpandClient(location.split('/')[location.split('/').length - 2] !== 'clients')},[location])


    //BOOLEAN FOR WAIT THE INFO
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)

    //SELECT DATA LOGIC
    const [clients, setClients] = useState<Clients | null>(null)
    const [filters, setFilters] = useState<ClientsFilters>({page_index:1, channel_types:[]})
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)

    //FETCH DATA ON FIRST RENDER
    useEffect(() => {document.title = `${t('Clients')} - ${auth.authData.organizationName} - Matil`},[location]) 
    useEffect(() => {
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


    //HIDE CLIENTE LOGIC
    const conversationContainerRef = useRef<HTMLDivElement>(null)
    const tableContainerRef = useRef<HTMLDivElement>(null)
    useOutsideClick({ref1:conversationContainerRef,  ref2:tableContainerRef,  onOutsideClick:() => navigate(`/contacts/clients`)})
    useEffect(() => {
        const handleKeyDown = (event:KeyboardEvent) => {
              switch (event.code) {           
                case 'Escape':
                    if (!location.endsWith('clients')) navigate(`/contacts/clients`)
                    break        
                default:
                  break
              }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => {window.removeEventListener('keydown', handleKeyDown)}
    },[location])

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
        setSelectedIndex(index)
    }
    
    //FETCH NEW DATA ON FILTERS CHANGE
    const fetchClientDataWithFilter = async (selectedFilters?:{page_index:number, channel_types:Channels[], sort_by?:ClientColumn, search?:string, order?:'asc' | 'desc'}) => {
        let filtersToFetch:{page_index:number, channel_types:Channels[], sort_by?:ClientColumn, search?:string, order?:'asc' | 'desc'} | null = null

        if (selectedFilters) { 
            filtersToFetch = selectedFilters
            setFilters(selectedFilters)
        }
        else filtersToFetch = filters
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/contacts`, getAccessTokenSilently,setValue:setClients, setWaiting:setWaitingInfo, params:filtersToFetch, auth})
        if (response?.status === 200) {            
            session.dispatch({ type: 'UPDATE_CLIENTS_TABLE', payload: {data:response.data, filters:filtersToFetch, selectedIndex} })
         }
    }

    //SELECT CHANNELS LOGIC
    const toggleChannelsList = (element: Channels) => {
        const channelsList = filters?.channel_types
        if (channelsList.includes(element)) setFilters({...filters, channel_types: channelsList.filter(e => e !== element)})
        else setFilters({...filters, channel_types: [...channelsList, element]})
    }


    //FRONT
    return(
        <>  
        <AnimatePresence> 
            {!expandClient && <MotionBox  ref={conversationContainerRef} overflowY={'scroll'} w={Math.min(window.innerWidth * 0.6, window.innerWidth - 500)} initial={{ right: -25  + 'px', opacity: expandClient?1:0}} animate={{ right: 0,  opacity: expandClient?0:1  }} exit={{ right:-25 ,  opacity: expandClient?1:0}} transition={{ duration: '.125', ease: 'easeOut'}} 
            bg='white' top={0}     minHeight="100vh" maxHeight="100vh" boxShadow="-4px 0 6px -2px rgba(0, 0, 0, 0.1)" right={0} pointerEvents={expandClient ?'none':'auto'} height={'100vh'}   position='absolute' zIndex={100} overflow={'hidden'} >
                <Client socket={socket} fetchClientDataWithFilter={fetchClientDataWithFilter}/> 
            </MotionBox>}
        </AnimatePresence>
  
        <Box height={'100%'} width={'100%'} overflowX={'scroll'} overflowY={'hidden'} >
    
            <Flex flex={1} gap='10px' alignItems={'center'}> 
                <Tooltip  label={t('HideSidebar')}  placement='right'  bg='white' color='black'  borderRadius='.5rem' fontSize='.7em' p='6px'> 
                    <IconButton bg='transparent' _hover={{bg:'brand.gray_1', color:'brand.text_blue'}} icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'18px'}/>} variant={'common'}  h='28px' w='28px' aria-label="hide-sidebar" size='xs' onClick={() => setHideViews(prev => (!prev))} />
                </Tooltip>
                <Text flex='1' minW={0} fontWeight={'medium'} fontSize={'1.2em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{t('Clients')}</Text>
            </Flex>
    
            <Flex gap='15px' mt='1vh'  > 
                <FilterButton selectList={Object.keys(logosMap)} itemsMap={logosMap} selectedElements={filters?.channel_types} setSelectedElements={(element) => toggleChannelsList(element as Channels)}  icon={PiDesktopTowerFill} initialMessage={t('ClientsFilterMessage')}/>
             </Flex>

            <Flex mt='1vh'  justifyContent={'space-between'} alignItems={'center'}> 
                <Skeleton  isLoaded={!waitingInfo} >
                    <Text fontWeight={'medium'} color='gray.600' > {t('ClientsCount', {count:clients?.total_contacts})}</Text> 
                </Skeleton>
            </Flex>

            <Box mt='1vh' ref={tableContainerRef}> 
            <Table data={clients?.page_data || []} CellStyle={CellStyle} noDataMessage={t('NoClients')} columnsMap={columnsClientsMap} requestSort={requestSort} getSortIcon={getSortIcon} onClickRow={clickRow} excludedKeys={['id', 'contact_business_id', 'phone_number', 'email_address', 'instagram_username', 'webchat_uuid', 'google_business_review_id']} waitingInfo={waitingInfo} currentIndex={selectedIndex} />
            </Box>
        </Box>
        </>)
}

export default ClientsTable

 