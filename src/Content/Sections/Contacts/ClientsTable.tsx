//REACT
import { useState, useEffect, lazy, Dispatch, SetStateAction, useRef, ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../AuthContext"
import { useSession } from "../../../SessionContext"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { motion, isValidMotionProp, AnimatePresence } from 'framer-motion'
import { Flex, Box, Text, Button, IconButton, Skeleton, Tooltip, chakra, shouldForwardProp } from '@chakra-ui/react'
//COMPONENTS
import ActionsButton from "../Conversations/ActionsButton"
import Table from "../../Components/Reusable/Table"
//FUNCTIONS
import timeStampToDate from "../../Functions/timeStampToString"
import timeAgo from "../../Functions/timeAgo"
import useOutsideClick from "../../Functions/clickOutside"
//ICONS
import { IoSend } from "react-icons/io5"
import { FaPlus } from "react-icons/fa"
import { PiSidebarSimpleBold } from "react-icons/pi"
//TYPING
import { Clients,languagesFlags, FilterType } from "../../Constants/typing"
 //SECTION
const Client = lazy(() => import('./Client'))
  
//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})


//GET THE CELL STYLE
const CellStyle = ({ column, element }:{column:string, element:any}) => {
     
    //TRANSLATION
    const { t } = useTranslation('clients')
    const auth = useAuth()
    const t_formats = useTranslation('formats').t

    if (column === 'created_at' ||  column === 'last_interaction_at' )  
    return(
        <Tooltip label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='.8em' p='6px'> 
            <Text whiteSpace={'nowrap'} fontSize={'.9em'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    else if (column === 'tags') {
        const tags = auth.authData.tags
        return (
            <Flex minH={'35px'} alignItems={'center'}> 
                {element.length === 0? <Text>-</Text>:
                    <Flex gap='5px' flexWrap={'wrap'}>
                        {element.map((label:string, index:number) => (
                            <Flex  bg='brand.gray_1' borderWidth={'1px'} p='4px' borderRadius={'.5rem'} fontSize={'.8em'} key={`client-label-${index}`}>
                                <Text>{tags?.find(tag => tag.uuid === label)?.name}</Text>
                            </Flex>
                        ))}
                    </Flex>
                }
            </Flex>
        )
    }
    else if (column === 'language') {
        return(
        <Flex gap='5px' fontSize={'.9em'}  alignItems={'center'}>
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][0]:'No detectado'}</Text>
            <Text fontSize={'.8em'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][1]:'🏴󠁥󠁳󠁣󠁴󠁿'}</Text>
        </Flex>)
    }   
    else if (column === 'is_blocked') return <Text color={element?'red':'black'}>{element?t('is_blocked'):t('Active')}</Text>  
    else return ( <Text fontSize={'.9em'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={column === 'name'?'medium':'normal'}  overflow={'hidden'} >{element?element:'-'}</Text>)
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
    const columnsClientsMap:{[key:string]:[string, number]} = {name: [t('name'), 200], contact: [t('contact'), 150], tags: [t('tags'), 350], last_interaction_at: [t('last_interaction_at'), 180], created_at: [t('created_at'), 150], rating: [t('rating'), 60], language: [t('language'), 150], notes: [t('notes'), 350],  is_blocked: [t('is_blocked'), 150], instagram_followers:[t('instagram_followers'), 100]}

    //EXPAND CLIENT
    const [expandClient, setExpandClient] = useState<boolean>(false)
    useEffect(() => {setExpandClient(location.split('/')[location.split('/').length - 2] !== 'clients')},[location])


    //BOOLEAN FOR WAIT THE INFO
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)

    //SELECT DATA LOGIC
    const [clients, setClients] = useState<Clients | null>(null)
    const [tableFilters, setTableFilters] = useState<{page_index: number, sort?:{column:string, order:'asc' | 'desc'}}>({page_index:1})
    const [filters, setFilters] = useState<FilterType>({logic:'AND', groups:[]})
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)

    //FETCH DATA ON FIRST RENDER
    useEffect(() => {document.title = `${t('Clients')} - ${auth.authData.organizationName} - Matil`},[location]) 
    useEffect(() => {
        localStorage.setItem('currentSection', `clients`)
        const fetchClientsData = async() => {
            const clientResponse = await fetchData({endpoint:`${auth.authData.organizationId}/contacts`, setValue:setClients,getAccessTokenSilently, setWaiting:setWaitingInfo, params:{page_index:1, filters}, auth})
            if (clientResponse?.status === 200) session.dispatch({type:'UPDATE_CLIENTS_TABLE',payload:{data:clientResponse?.data, filters, selectedIndex:-1}})
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


    //NAVIGATE TO A CLIENT
    const clickRow = (client:any, index:number) => {
        navigate(`${client.id}`)
        setSelectedIndex(index)
    }

    //SORT LOGIC
    const requestSort = (key: string) => {
        const direction = (tableFilters?.sort?.column === key && tableFilters?.sort.order === 'asc') ? 'desc' : 'asc'
         fetchClientDataWithFilter(null, {...tableFilters, sort:{column:key, order:direction} })
    }
    const getSortIcon = (key: string) => {
        if (tableFilters?.sort?.column === key) { 
            if (tableFilters?.sort.order === 'asc') return true
            else return false
        }
        else return null    
    }
 
    //FETCH NEW DATA ON FILTERS CHANGE
    const fetchClientDataWithFilter = async (selectedFilters:FilterType | null, selectedTableFilters:{page_index: number, sort?:{column:string, order:'asc' | 'desc'}} | null, callMoreElements = false) => {
        let currentTableFilters
        let currentFilters
        if (selectedFilters) {
            currentFilters = selectedFilters
            setFilters(selectedFilters)
        }
        else currentFilters = filters
        if (selectedTableFilters) {
            currentTableFilters = selectedTableFilters
            setTableFilters(selectedTableFilters)
        }
        else currentTableFilters = tableFilters

        const callDict:any = {endpoint:`${auth.authData.organizationId}/contacts`, getAccessTokenSilently,setValue:setClients, params:{filters:currentFilters, ...currentTableFilters}, auth}
        if (!callMoreElements) callDict.setWaiting = setWaitingInfo
        await fetchData(callDict)
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
                <Button size={'sm'} variant={'main'} leftIcon={<FaPlus/>}>{t('CreateClient')}</Button>
            </Flex>     
            <Flex mt='2vh'> 
             </Flex>
             
            <Flex gap='20px' mt='2vh' alignItems={'center'} > 
                <Skeleton  isLoaded={!waitingInfo} >
                    <Text fontWeight={'medium'} color='gray.600' > {t('ClientsCount', {count:clients?.total_items})}</Text> 
                </Skeleton>
                <Button leftIcon={<IoSend/>} size='sm' variant={'common'} >{t('NewMessage')}</Button>
                <ActionsButton items={clients?.page_data} section={'contacts'} view={null}/>
            </Flex>
 
 
            <Box mt='2vh' ref={tableContainerRef}> 
                <Table data={clients?.page_data || []} CellStyle={CellStyle} noDataMessage={t('NoClients')} columnsMap={columnsClientsMap} requestSort={requestSort} getSortIcon={getSortIcon} onClickRow={clickRow} excludedKeys={['id', 'contact_business_id', 'cdas', 'organization_id', 'phone_number', 'email_address', 'instagram_username', 'webchat_uuid', 'google_business_review_id']} onFinishScroll={() => fetchClientDataWithFilter(null, {...tableFilters, page_index:tableFilters.page_index + 1}, true)}  waitingInfo={waitingInfo} currentIndex={selectedIndex} />
            </Box>
        </Box>
        </>)
}

export default ClientsTable

 