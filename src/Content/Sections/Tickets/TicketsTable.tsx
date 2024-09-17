/*
  MAIN TICKETS FUNCTION (/tickets)
*/

//REACT
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../../AuthContext" 
import { useSession } from "../../../SessionContext"
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from "../../API/fetchData"
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
//FRONT
import { Flex, Box, Text, Icon, Button, IconButton, Skeleton, Tooltip } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
//COMPONENTS
import ActionsButton from "./ActionsButton"
import EditText from "../../Components/Reusable/EditText"
import Table from "../../Components/Reusable/Table"
import StateMap from "../../Components/Reusable/StateMap"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
//FUNCTIONS
import DetermineTicketViews from "../../MangeData/DetermineTicketViews"
import timeStampToDate from "../../Functions/timeStampToString"
import timeAgo from "../../Functions/timeAgo"
import showToast from "../../Components/ToastNotification"
//ICONS
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io"
import { BsTrash3Fill } from "react-icons/bs"
import { MdDeselect } from "react-icons/md"
import { FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaRegEdit } from 'react-icons/fa'
import { FaArrowRotateLeft, FaFilter } from "react-icons/fa6"
import { BiEditAlt } from "react-icons/bi"
//TYPING
import { Tickets, TicketColumn, Views, ViewType, TicketsTableProps, logosMap, Channels  } from "../../Constants/typing"
 
//TYPING
interface TicketFilters {
    page_index:number
    sort_by?:TicketColumn | 'not_selected'
    search?:string, 
    order?:'asc' | 'desc'
}
type Status = 'new' | 'open' | 'solved' | 'pending' | 'closed'
const validStatuses: Status[] = ['new', 'open', 'solved', 'pending', 'closed']

//FUNCTION FOR GET THE FIRST VIEW
const getFirstView = (views:Views) => {
    if ('private_views' in views && views.private_views.length > 0) return {type:'private', index:0, name:views.private_views[0].name}
    else if ('shared_views' in views && views.shared_views.length > 0) return {type:'shared', index:0, name:views.shared_views[0].name}
}

//ALERT LEVEL COMPONENT
const AlertLevel = ({t,  rating }:{t:any, rating:number}) => {
    const getAlertDetails = (rating:number) => {
        switch (rating) {
            case 0:
                return { color: 'green.500', icon: FaCheckCircle, label: `${t('Priority_0')} (0)` }
            case 1:
                return { color: 'yellow.500', icon: FaInfoCircle, label: `${t('Priority_1')} (1)` }
            case 2:
                return { color: 'orange.500', icon: FaExclamationTriangle, label: `${t('Priority_2')} (2)` }
            case 3:
                return { color: 'red.500', icon: FaExclamationCircle, label: `${t('Priority_3')} (3)` }
            case 4:
                return { color: 'red.700', icon: FaExclamationCircle, label: `${t('Priority_4')} (4)` }
            default:
                return { color: 'green.500', icon: FaCheckCircle, label: `${t('Priority_0')} (0)` }
        }
    }
    const { color, icon, label } = getAlertDetails(rating)
    return (
        <Flex gap='10px' alignItems="center">
            <Icon as={icon} color={color}/>
            <Text color={color} fontWeight={'medium'}>
                {label}
            </Text>
        </Flex>
    )
} 

//GET THE CELL STYLE
const CellStyle = ({column, element}:{column:string, element:any}) => {

    const auth = useAuth()
    const { t } = useTranslation('tickets')
    const t_formats = useTranslation('formats').t

    if (column === 'local_id') return  <Text color='gray' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>#{element}</Text>
    else if (column === 'user_id')  return  <Text fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element === -1 ?'Matilda':element === 0 ? t('NoAgent'):(auth?.authData?.users?.[element as string | number].name || '')}</Text>
    else if (column === 'unseen_changes') 
        return(
        <Flex color={element?'red':'green'} alignItems={'center'} gap='5px'> 
            <Icon as={element?FaExclamationCircle:FaCheckCircle} />
            <Text>{element?t('NotRead'):t('Any')}</Text>
        </Flex>)
    
    else if (column === 'status' && typeof element === 'string' && validStatuses.includes(element as Status)) return  <StateMap state={element as Status}/>
    else if (column === 'urgency_rating' && typeof element === 'number') {return <AlertLevel t={t} rating={element}/>}
    else if (column === 'created_at' || column === 'updated_at' || column === 'solved_at' || column === 'closed_at') {
        return(
        <Tooltip  label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    }
    else if (column === 'deletion_date'  && typeof element === 'string' ) return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeStampToDate(element, t_formats)}</Text>
    else if (column === 'channel_type') {
        return(
        <Flex gap='7px' alignItems={'center'}>
            <Icon color='gray.600' as={typeof element === 'string' && element in logosMap ?logosMap[element as Channels][0]:FaInfoCircle}/>
            <Text >{t(element as string)}</Text>
         </Flex>)
    }     
    else return ( <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>)
}

 
//MAIN FUNCTION
function TicketsTable({socket}:{socket:any}) {

    //TRANSLATION
    const { t } = useTranslation('tickets')

    //CONSTANTS
    const auth = useAuth()
    const session= useSession()
    const navigate = useNavigate()
    const tableRef = useRef<HTMLDivElement>(null)
    
    //TABLE MAPPING
    const columnsTicketsMap:{[key in TicketColumn]:[string, number]} = {id: [t('id'), 50], local_id: [t('local_id'), 50], status:  [t('status'), 100], channel_type: [t('channel_type'), 150], subject:  [t('subject'), 200], user_id: [t('user_id'), 200], created_at: [t('created_at'), 150],updated_at: [t('updated_at'), 150], solved_at: [t('solved_at'), 150],closed_at: [t('closed_at'), 150],title: [t('title'), 300], urgency_rating: [t('urgency_rating'), 130], deletion_date: [t('deletion_date'), 180], unseen_changes: [t('unseen_changes'), 200]}
    
    //WAIT INFO AND FORCE TH REUPDATE OF THE TABLE ON DELETE
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)
    const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

    //TICKET DATA AND SELECTED VIEW
    const [tickets, setTickets] = useState<Tickets | null>(null)
    const [selectedView, setSelectedView] = useState<ViewType>((localStorage.getItem('currentView') && JSON.parse(localStorage.getItem('currentView') as string)) || getFirstView(auth.authData.views as Views))
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
 
    //SOCKET FOR RELOADING VIEWS ON A NEW TICKET
    useEffect(() => {

        document.title = `Tickets - ${selectedView.name} - ${auth.authData.organizationName} - Matil`
        localStorage.setItem('currentSection', 'tickets')

        setSelectedView(localStorage.getItem('currentView') && JSON.parse(localStorage.getItem('currentView') as string) || getFirstView(auth.authData.views as Views))

        socket?.current.on('ticket', (data:any) => {
            
                const previousViews = DetermineTicketViews(data?.previous_data, auth.authData.views as Views, auth.authData?.userId || -1)
                const newViews = DetermineTicketViews(data?.new_data, auth.authData.views as Views, auth.authData?.userId || -1)
                
                const combinedViews = previousViews.concat(newViews)

                for (const view of combinedViews) {
                  if (view.view_type === selectedView.type && view.view_index === selectedView.index) {
                    fetchTicketDataWithFilter(null)
                    break
                  }
            }
        })
    },[JSON.stringify(auth.authData.organizationId)])

    //FETCH NEW DATA WHEN THE VIEW CHANGE
    useEffect(() => {
        const fetchTicketData = async() => {

            //FIND IF THE SECTION IS OPENED
            const ticketsList = session.sessionData.ticketsTable
            const foundTicket = ticketsList.find(ticket => ticket.view.view_type === selectedView.type && ticket.view.view_index === selectedView.index)

            //SECTION FOUND
            if (foundTicket){
                setTickets(foundTicket.data)
                setFilters(foundTicket.filters)
                setSelectedIndex(foundTicket.selectedIndex || -1)
                setWaitingInfo(false)
            } 

            //SECTION NOT FOUND (FETCH THE DATA)
            else {

                //CLEAR THE FILTERS
                setFilters({page_index:1})
                setSelectedIndex(-1)
                
                //CALL THE BIN
                if (selectedView.type === 'deleted') {
                    const response1 = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/tickets/bin`, setValue:setTickets, setWaiting:setWaitingInfo, params:{page_index:1}, auth})
                    if (response1?.status === 200) {      
                        const newTicket:{data:TicketsTableProps[] | null, view:{view_type:'shared' | 'private' | 'deleted', view_index:number}, selectedIndex:number, filters:TicketFilters} = 
                        {data:response1.data, view: {view_type: selectedView.type, view_index: selectedView.index}, filters: {page_index:1}, selectedIndex:-1}
                        session.dispatch({ type: 'UPDATE_TICKETS_TABLE', payload: newTicket })
                    }
                }

                //CALL A NORMAL TICKET VIEW
                else {
                    const response2 = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/tickets`, setValue:setTickets, setWaiting:setWaitingInfo, params:{page_index:1, view_type:selectedView.type, view_index:selectedView.index}, auth})
                    if (response2?.status === 200) {
                        const newTicket:{data:TicketsTableProps[] | null, view:{view_type:'shared' | 'private' | 'deleted', view_index:number}, selectedIndex:number, filters:TicketFilters} = 
                        {data:response2.data, view: {view_type: selectedView.type, view_index: selectedView.index}, selectedIndex:-1, filters: {page_index:1}}
                        session.dispatch({ type: 'UPDATE_TICKETS_TABLE', payload: newTicket })
                    }
                }
            }
        }
        fetchTicketData()
    }, [selectedView])

    //SHOW FILTERS AND FILTERS INFO
    const [filters, setFilters ] = useState<TicketFilters>({page_index:1}) 

     //NAVIGATE TO THE CLICKED TICKET AND SHOW IT IN THE HEADER
    const [selectedElements, setSelectedElements] = useState<number[]>([])
    const handleClickRow  = (row:TicketsTableProps, index:number) => {
        session.dispatch({type:'UPDATE_TICKETS_TABLE_SELECTED_ITEM', payload:{view:{view_type:selectedView?.type, view_index:selectedView?.index}, index}})
        if (selectedView?.type === 'deleted') {showToast({message:t('NoTrash'), type:'failed'});return}
        navigate(`/tickets/ticket/${row.id}`) 
    }

    //SORT LOGIC
    const requestSort = (key: string) => {
        const direction = (filters.sort_by === key && filters.order === 'asc') ? 'desc' : 'asc';
        fetchTicketDataWithFilter({...filters, sort_by: key as TicketColumn, order: direction as 'asc' | 'desc'})
     }

    //DELETE AND RECOVER TICKETS LOGIC
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)


    //FETCH NEW DATA ON FILTERS CHANGE
    const fetchTicketDataWithFilter = async (applied_filters:{page_index:number, sort_by?:TicketColumn | 'not_selected', search?:string, order?:'asc' | 'desc'} | null) => {
        
        //APPLY FILTERS
        let selectedFilters:TicketFilters
        if (applied_filters === null) selectedFilters = filters
        else {
            selectedFilters = {...filters, ...applied_filters}
            setFilters(filters)
        }

        //CHOOSE CONFIGURATION DEPENDING ON ITS BIN OR A NORMAL VIEW
        let endpoint = `superservice/${auth.authData.organizationId}/tickets`
        let viewsToSend:{view_type:string, view_index:number} | {} = {view_type:selectedView.type, view_index:selectedView.index}
        if (selectedView.type === 'deleted') {endpoint = `superservice/${auth.authData.organizationId}/tickets/bin`;viewsToSend = {}}
        
        //API CALL
        const response = await fetchData({endpoint, setValue:setTickets, setWaiting:setWaitingInfo, params:{...viewsToSend, ...selectedFilters}, auth})
        if (response?.status === 200) {
            setFilters(selectedFilters)
            const newTicket:{data:TicketsTableProps[] | null, view:{view_type:'shared' | 'private' | 'deleted', view_index:number}, selectedIndex:number, filters:{page_index:number, sort_by?:TicketColumn | 'not_selected', search?:string, order?:'asc' | 'desc'}} = 
            {data:response.data, view: {view_type: selectedView.type, view_index: selectedView.index}, selectedIndex:-1, filters: selectedFilters}
            session.dispatch({ type: 'UPDATE_TICKETS_TABLE', payload: newTicket })
         }
    }
    
    //RECOVER TICKETS FUNCTION
    const recoverTickets = async() => {
        session.dispatch({type:'DELETE_VIEW_FROM_TICKET_LIST'})
        await fetchData({endpoint:`superservice/${auth.authData.organizationId}/tickets/bin/restore`,  auth, method:'post', requestForm:{ticket_ids:selectedElements},toastMessages:{'works':t('TicketsRecovered'),'failed':('TicketsRecoveredFailed')}})
        const responseOrg = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/user`, auth})
        auth.setAuthData({views: responseOrg?.data})
        fetchTicketDataWithFilter(null)
        setSelectedElements([])
    }

    //DELETE A TICKET FUNCTION
    const deleteTickets = async() => {
        session.dispatch({type:'DELETE_VIEW_FROM_TICKET_LIST'})
        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/tickets/bin`, setWaiting:setWaitingDelete, auth, method:'post', requestForm:{ticket_ids:selectedElements, days_until_deletion:30},toastMessages:{'works':t('TicketsTrash'),'failed':t('TicketsTrashFailed')}})
        if (response?.status === 200) {
            const responseOrg = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/user`, auth})
            auth.setAuthData({views: responseOrg?.data})
        }
        setShowConfirmDelete(false)
        fetchTicketDataWithFilter(null)
        setSelectedElements([])
    }


    //COMPONENT FOR DELETING TICKETS
    const ConfirmDeleteBox = () => {
    
        const [showWaitingDeletePermanently, setShowWaitingDeletePermanently] = useState<boolean>(false)
        const deleteTicketsPermanently = async() => {
            if (selectedView.type === 'deleted') {
                const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/tickets/bin/delete`,  setWaiting:setShowWaitingDeletePermanently, auth:auth, method:'post', requestForm:{ticket_ids:selectedElements},toastMessages:{'works':t('TicketsDeleted'),'failed':t('TicketsDeletedFailed')}})
                const responseOrg = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/user`, auth})
                auth.setAuthData({views: responseOrg?.data})
                fetchTicketDataWithFilter(null)
                setSelectedElements([])
            }
        }
        return(<>
        <Box p='15px'> 
            <Text fontWeight={'medium'} fontSize={'1.2em'}>{'Confirmar eliminación'}</Text>
            <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
            <Text >{t('DeleteWarning')}</Text>
        </Box>
        <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
            <Button  size='sm' color='red' _hover={{color:'red.600', bg:'gray.200'}} onClick={deleteTicketsPermanently}>{showWaitingDeletePermanently?<LoadingIconButton/>:t('Delete')}</Button>
            <Button  size='sm' onClick={() => setShowConfirmDelete(false)}>{t('Cancel')}</Button>
        </Flex>
    </>)
    }

    //FRONT
    return(<> 
        <Flex height={'calc(100vh - 60px)'} color='black' width={'100%'} >
    
            {/*VIEWS SELECTION*/}
            <Flex zIndex={100}  px='1vw' gap='20px' py='2vh' bg='gray.50' width={'320px'} flexDir={'column'} justifyContent={'space-between'} borderRightWidth={'1px'} borderRightColor='gray.200' >
                <Flex justifyContent={'space-between'} flexDir={'column'} flex='1' minH={0}>  
                    <Box> 
                        <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('Views')}</Text>
                        <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                    </Box>
                    <Box height={'100px'} flex='1' overflow={'scroll'}>
                        {(auth.authData.views && 'private_views' in auth.authData.views && auth.authData.views.private_views.length > 0 ) && <>
                            <Text fontSize='1.1em' fontWeight={'medium'} mb='1vh'>{t('PrivateViews')}</Text>
                            <Box mb='4vh'> 
                                {auth.authData.views.private_views.map((view, index) => {
                                    const isSelected = selectedView.index === index && selectedView.type === 'private'
                                    return(
                                        <Flex justifyContent='space-between' key={`private-view-${index}`} onClick={() => {setSelectedView({index:index, type:'private', name:(view?.name || '')});localStorage.setItem('currentView', JSON.stringify({index:index, type:'private', name:view.name}))}}   _hover={{bg:isSelected?'blue.100':'gray.200'}} bg={isSelected? 'blue.100':'transparent'} fontWeight={isSelected? 'medium':'normal'} fontSize={'1em'} cursor={'pointer'} borderRadius={'.5rem'} p='10px'>
                                            <Text>{view.name}</Text>
                                            <Text>{auth.authData.views?.number_of_tickets_per_private_view?.[index] || 0}</Text>
                                        </Flex>
                                        )
                                })}
                            </Box>
                        </>}
                        {(auth.authData.views && 'shared_views' in auth.authData.views && auth.authData.views.shared_views.length > 0 ) &&   <>
                            <Text fontSize='1.1em' fontWeight={'medium'} mb='1vh' >{t('PublicViews')}</Text>
                            <Box> 
                                {auth.authData.views.shared_views.map((view, index) => {
                                const isSelected = selectedView.index === index && selectedView.type === 'shared'
                                return(
                                    <Flex justifyContent='space-between' key={`shared-view-${index}`} onClick={() => {setSelectedView({index:index, type:'shared', name:(view?.name || '')}); localStorage.setItem('currentView', JSON.stringify({index:index, type:'shared', name:view.name}))}} _hover={{bg:isSelected?'blue.100':'gray.200'}} bg={isSelected? 'blue.100':'transparent'} fontWeight={isSelected? 'medium':'normal'}fontSize={'1em'} cursor={'pointer'} borderRadius={'.5rem'} p='10px'>
                                        <Text>{view.name}</Text>
                                        <Text>{auth.authData.views?.number_of_tickets_per_shared_view?.[index] || 0}</Text>
                                    </Flex>
                                    )
                                })}
                            </Box>
                        </>}
                    </Box>
                </Flex>

                <Box>
                    <Flex  color='red' onClick={() => {setSelectedView({index:0, type:'deleted', name:'Papelera'}); localStorage.setItem('currentView', JSON.stringify({index:0, type:'deleted', name:'Papelera'}))}} justifyContent={'space-between'} _hover={{bg:selectedView.type === 'deleted'?'blue.100':'gray.200'}} bg={selectedView.type === 'deleted'? 'blue.100':'transparent'} fontWeight={selectedView.type === 'deleted'? 'medium':'normal'}fontSize={'1em'} cursor={'pointer'} borderRadius={'.5rem'} p='8px'>
                        <Flex gap='10px' alignItems={'center'}> 
                            <Icon boxSize={'12px'} as={BsTrash3Fill}/>
                            <Text mt='2px' >{t('Trash')}</Text>
                        </Flex>
                        <Text>{auth.authData.views?.number_of_tickets_in_bin || 0}</Text>
                    </Flex>

                    <Box width={'100%'} mt='2vh' mb='2vh' height={'1px'} bg='gray.300' />
                    <Flex mb='1vh' height={'25px'} onClick={() => navigate('/settings/people/edit-views')} color='blue.600' alignItems={'center'} mt='2vh' gap='7px' cursor={'pointer'} _hover={{color:'blue.700', textDecor:'underline'}}> 
                        <Text fontSize={'.9em'} ml='7px'>{t('EditViews')}</Text>
                        <Icon as={FaRegEdit} boxSize={'13px'}/>
                    </Flex>
                </Box>
            </Flex>

            {/* ACTIONS AND SHOW TABLE */}
            <Box p='2vw' width={'calc(100vw - 380px)'}bg='white'>
                <Flex justifyContent={'space-between'} gap='10px'>
                    <Text flex='1' minW={0} fontWeight={'medium'} fontSize={'1.5em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{selectedView.name}</Text>
                    <ActionsButton items={tickets?.page_data} view={selectedView} section={'tickets'} />
                </Flex>
                               
                <Flex gap='15px' mt='2vh'> 
                        <Box width={'350px'}> 
                            <EditText value={filters.search} setValue={(value) => setFilters(prev => ({...prev, search:value}))} searchInput={true}/>
                        </Box>
                        <Button _hover={{color:'blue.500'}} leftIcon={<FaFilter/>} size='sm' onClick={() => fetchTicketDataWithFilter(filters)}>{t('ApplyFilters')}</Button>
                    </Flex>
                    
                <Flex mt='2vh'  justifyContent={'space-between'} alignItems={'center'}> 
                    <Skeleton isLoaded={!waitingInfo} >
                        <Text fontWeight={'medium'} color='gray.600' fontSize={'1.2em'}> {t('TicketsCount', {count:tickets?.total_tickets})}</Text> 
                    </Skeleton>
                    <Flex alignItems={'center'} justifyContent={'end'} gap='10px' flexDir={'row-reverse'}>
                        <IconButton isRound size='xs' aria-label='next-page' icon={<IoIosArrowForward />} isDisabled={filters.page_index > Math.floor((tickets?.total_tickets || 0)/ 25)} onClick={() => fetchTicketDataWithFilter({...filters,page_index:filters.page_index + 1})}/>
                        <Text fontWeight={'medium'} fontSize={'.9em'} color='gray.600'>{t('Page')} {filters.page_index}</Text>
                        <IconButton isRound size='xs' aria-label='next-page' icon={<IoIosArrowBack />} isDisabled={filters.page_index === 1} onClick={() => fetchTicketDataWithFilter({...filters,page_index:filters.page_index - 1})}/>
                    </Flex>
                </Flex>
                
                <Skeleton ref={tableRef} isLoaded={!waitingInfo}>
                    <Table height={(tableRef.current?.getBoundingClientRect().top || 0) - (selectedElements.length > 0 ? 300:window.innerWidth * 0.02)} data={(tickets?.page_data || [])} CellStyle={CellStyle} noDataMessage={t('NoTickets')} requestSort={requestSort} columnsMap={columnsTicketsMap} excludedKeys={['id', 'conversation_id', 'end_client_id',  'is_matilda_engaged']} onClickRow={handleClickRow} selectedElements={selectedElements} setSelectedElements={setSelectedElements} onSelectAllElements={() => {}} currentIndex={selectedIndex}/> 
                </Skeleton >             
              
            </Box>

            <AnimatePresence> 
                {selectedElements.length > 0 && 
                <motion.div initial={{bottom:-200}} animate={{bottom:0}} exit={{bottom:-200}} transition={{duration:.2}} style={{backgroundColor:'#F7FAFC',display:'flex', justifyContent:'space-between', alignItems:'center',padding:'0 2vw 0 2vw', height:'80px', left:'380px', gap:'20px',position:'fixed',  borderTop:' 1px solid #E2E8F0', overflow:'scroll', width:`calc(100vw - 380px)`}}>
                    <Flex gap='1vw' alignItems={'center'}> 
                        <Text whiteSpace={'nowrap'} fontWeight={'medium'}>{selectedElements.length} ticket{selectedElements.length > 1 ? 's':''}</Text>
                        <Button onClick={() => setSelectedElements([])} size='sm' bg='transparent' borderColor={'transparent'} color='blue.400' _hover={{bg:'gray.100', color:'blue.500'}} leftIcon={<MdDeselect/>}>{t('DeSelect')}</Button> 
                        {selectedView.type === 'deleted' ? 
                            <Button  size='sm' bg='transparent' borderColor={'transparent'} color='blue.400' _hover={{bg:'gray.100', color:'blue.500'}} leftIcon={<FaArrowRotateLeft/>} onClick={recoverTickets}>{t('Recover')}</Button>
                        :
                            <> {selectedElements.length <= 1 && <Button onClick={() => `/tickets/ticket/${selectedElements[0]}`} size='sm' bg='transparent' borderColor={'transparent'} color='blue.400' _hover={{bg:'gray.100', color:'blue.500'}} leftIcon={<BiEditAlt/>}>{t('Edit')}</Button>}</>
                        } 
                        <Button size='sm' onClick={() => {if (selectedView.type === 'deleted') setShowConfirmDelete(true);else{deleteTickets()}}} bg='transparent' borderColor={'transparent'} color='red.500' _hover={{bg:'gray.100', color:'red.700'}}leftIcon={<BsTrash3Fill/>}>{waitingDelete?<LoadingIconButton/>:selectedView.type === 'deleted'?t('Delete'):t('MoveToBin')}</Button>
                    </Flex>
                    <Button sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }} size='sm' color='red' onClick={() => setSelectedElements([])} _hover={{color:'red.700'}}>{t('Cancel')}</Button>
                </motion.div>}
            </AnimatePresence>
        </Flex>
        
 

        {showConfirmDelete && 
        <ConfirmBox setShowBox={setShowConfirmDelete}> 
            <ConfirmDeleteBox/>
        </ConfirmBox>}
        
        </>)
}

export default TicketsTable

 
