/*
  MAIN CONVERSATIONS FUNCTION (/conversations)
*/

//REACT
import { useState, useEffect, useRef,useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../../AuthContext" 
import { useSession } from "../../../SessionContext"
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from "../../API/fetchData"
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
//FRONT
import { Flex, Box, Text, Icon, Button, IconButton, Skeleton, Tooltip, Portal } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
//COMPONENTS
import ActionsButton from "./ActionsButton"
import EditText from "../../Components/Reusable/EditText"
import Table from "../../Components/Reusable/Table"
import StateMap from "../../Components/Reusable/StateMap"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
//FUNCTIONS
import DetermineConversationViews from "../../MangeData/DetermineConversationViews"
import timeStampToDate from "../../Functions/timeStampToString"
import timeAgo from "../../Functions/timeAgo"
import showToast from "../../Components/Reusable/ToastNotification"
import parseMessageToBold from "../../Functions/parseToBold"
//ICONS
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io"
import { BsTrash3Fill } from "react-icons/bs"
import { MdDeselect } from "react-icons/md"
import { FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaRegEdit } from 'react-icons/fa'
import { FaArrowRotateLeft, FaFilter } from "react-icons/fa6"
import { BiEditAlt } from "react-icons/bi"
//TYPING
import { Conversations, ConversationColumn, Views, ViewType, ConversationsTableProps, logosMap, Channels  } from "../../Constants/typing"
 
//TYPING
interface ConversationFilters {
    page_index:number
    sort_by?:ConversationColumn | 'not_selected'
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
    const { t } = useTranslation('conversations')
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
function ConversationsTable({socket}:{socket:any}) {

    //TRANSLATION
    const { t } = useTranslation('conversations')

    //CONSTANTS
    const auth = useAuth()
    const session= useSession()
    const navigate = useNavigate()
    const tableRef = useRef<HTMLDivElement>(null)
    
    //TABLE MAPPING
    const columnsConversationsMap:{[key in ConversationColumn]:[string, number]} = {id: [t('id'), 50], local_id: [t('local_id'), 50], status:  [t('status'), 100], channel_type: [t('channel_type'), 150], theme:  [t('theme'), 200], user_id: [t('user_id'), 200], created_at: [t('created_at'), 150],updated_at: [t('updated_at'), 180], solved_at: [t('solved_at'), 150],closed_at: [t('closed_at'), 150],title: [t('title'), 300], urgency_rating: [t('urgency_rating'), 130], deletion_date: [t('deletion_date'), 180], unseen_changes: [t('unseen_changes'), 200]}
    
    //WAIT INFO AND FORCE TH REUPDATE OF THE TABLE ON DELETE
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)
    const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

    //CONVERSATION DATA AND SELECTED VIEW
    const [conversations, setConversations] = useState<Conversations | null>(null)
    const [selectedView, setSelectedView] = useState<ViewType>((localStorage.getItem('currentView') && JSON.parse(localStorage.getItem('currentView') as string)) || getFirstView(auth.authData.views as Views))
    const allConversationsIdsRef = useRef<number[]>([])
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
 
    //SHOW FILTERS AND FILTERS INFO
    const isRetrievingData = useRef<boolean>(false)
    const [filters, setFilters ] = useState<ConversationFilters>({page_index:1, search:''}) 
    const filtersRef = useRef<ConversationFilters>({page_index:1, search:''}) 
    useEffect(() => {filtersRef.current = filters}, [filters])


    //SOCKET FOR RELOADING VIEWS ON A NEW CONVERSATION
    useEffect(() => {

        document.title = `${t('Conversations')} - ${selectedView.name} - ${auth.authData.organizationName} - Matil`
        localStorage.setItem('currentSection', 'conversations')

        setSelectedView(localStorage.getItem('currentView') && JSON.parse(localStorage.getItem('currentView') as string) || getFirstView(auth.authData.views as Views))

        socket?.current.on('conversation', (data:any) => {
            const editTable = async () => {
                    const previousViews = DetermineConversationViews(data?.previous_data, auth.authData.views as Views, auth.authData?.userId || -1)
                    const newViews = DetermineConversationViews(data?.new_data, auth.authData.views as Views, auth.authData?.userId || -1)

                    const combinedViews = previousViews.concat(newViews)

                    for (const view of combinedViews) {
                        if (view.view_type === selectedView.type && view.view_index === selectedView.index) {
                            isRetrievingData.current = true
                            await fetchConversationsDataWithFilter(null)
                            isRetrievingData.current = false
                            break
                        }
                    }
            }
            editTable()
        })
    },[JSON.stringify(auth.authData.organizationId)])

    //FETCH NEW DATA WHEN THE VIEW CHANGE
    useEffect(() => {
        const fetchConversationData = async() => {

            //FIND IF THE SECTION IS OPENED
            const conversationsList = session.sessionData.conversationsTable
            const foundCon = conversationsList.find(con => con.view.view_type === selectedView.type && con.view.view_index === selectedView.index)

            //SECTION FOUND
            if (foundCon){
                setConversations(foundCon.data)
                setFilters(foundCon?.filters || {page_index:1})
                setSelectedIndex(foundCon.selectedIndex || -1)
                setWaitingInfo(false)
            } 

            //SECTION NOT FOUND (FETCH THE DATA)
            else {
                //CLEAR THE FILTERS
                setFilters({page_index:1})
                setSelectedIndex(-1)
                 
                //CALL THE BIN
                if (selectedView.type === 'deleted') {
                    const response1 = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/bin`, setValue:setConversations, setWaiting:setWaitingInfo, params:{page_index:1}, auth})
                    if (response1?.status === 200) {      
                        const newConversations:{data:ConversationsTableProps[] | null, view:{view_type:'shared' | 'private' | 'deleted', view_index:number}, selectedIndex:number, filters:ConversationFilters} = 
                        {data:response1.data, view: {view_type: selectedView.type, view_index: selectedView.index}, filters: {page_index:1}, selectedIndex:-1}
                        session.dispatch({ type: 'UPDATE_CONVERSATIONS_TABLE', payload: newConversations })
                    }
                }

                //CALL A NORMAL CONVERSATIONS VIEW
                else {
                    const response2 = await fetchData({endpoint:`${auth.authData.organizationId}/conversations`, setValue:setConversations, setWaiting:setWaitingInfo, params:{page_index:1, view_type:selectedView.type, view_index:selectedView.index}, auth})
                    if (response2?.status === 200) {
                        const newConversation:{data:ConversationsTableProps[] | null, view:{view_type:'shared' | 'private' | 'deleted', view_index:number}, selectedIndex:number, filters:ConversationFilters} = 
                        {data:response2.data, view: {view_type: selectedView.type, view_index: selectedView.index}, selectedIndex:-1, filters: {page_index:1}}
                        session.dispatch({ type: 'UPDATE_CONVERSATIONS_TABLE', payload: newConversation })
                    }
                }
            }
        }
        fetchConversationData()
    }, [selectedView])

   
   
     //NAVIGATE TO THE CLICKED CONVERSATIONS AND SHOW IT IN THE HEADER
    const [selectedElements, setSelectedElements] = useState<number[]>([])
    const handleClickRow  = (row:ConversationsTableProps, index:number) => {
        session.dispatch({type:'UPDATE_CONVERSATIONS_TABLE_SELECTED_ITEM', payload:{view:{view_type:selectedView?.type, view_index:selectedView?.index}, index}})
        if (selectedView?.type === 'deleted') {showToast({message:t('NoTrash'), type:'failed'});return}
        navigate(`/conversations/conversation/${row.id}`) 
    }

    //GET ALL CONVERSATIONS IDS
    useEffect(() => {
        const idsList = selectedElements.map(index => (conversations?.page_data?.[index]?.id || 0))
        allConversationsIdsRef.current = idsList
    },[selectedElements])


    //SORT LOGIC
    const requestSort = (key: string) => {
        const direction = (filters.sort_by === key && filters.order === 'asc') ? 'desc' : 'asc';
        fetchConversationsDataWithFilter({...filters, sort_by: key as ConversationColumn, order: direction as 'asc' | 'desc'})
     }
    const getSortIcon = (key: string) => {
        if (filters.sort_by === key) { 
            if (filters.order === 'asc') return true
            else return false
        }
        else return null    
    }

    //GET ALL CONVERSATIONS IDS
    const getAllConversationsIds = async () => {
        if (selectedElements.length >= (conversations?.page_data?.length || 0)) setSelectedElements([])
        else {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/all_conversation_ids`,  params:{page_index:filters.page_index, view_type:selectedView.type === 'deleted'?'bin':selectedView.type, view_index:selectedView.index}, auth})
            if (response?.status === 200) {
                allConversationsIdsRef.current === response.data
                setSelectedElements( Array.from({ length: response.data.total_conversations }, (v, i) => i ))
            }
        }
    }

    //DELETE AND RECOVER CONVERSATIONS LOGIC
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)


    //FETCH NEW DATA ON FILTERS CHANGE
    const fetchConversationsDataWithFilter = async (applied_filters:{page_index:number, sort_by?:ConversationColumn | 'not_selected', search?:string, order?:'asc' | 'desc'} | null) => {
        
        setSelectedElements([])
        //APPLY FILTERS
        let selectedFilters:ConversationFilters
        if (applied_filters === null) selectedFilters = filtersRef.current
        else {
            selectedFilters = {...filters, ...applied_filters}
            setFilters(filters)
        }

        //CHOOSE CONFIGURATION DEPENDING ON ITS BIN OR A NORMAL VIEW
        let endpoint = `${auth.authData.organizationId}/conversations`
        let viewsToSend:{view_type:string, view_index:number} | {} = {view_type:selectedView.type, view_index:selectedView.index}
        if (selectedView.type === 'deleted') {endpoint = `${auth.authData.organizationId}/conversations/bin`;viewsToSend = {}}
        
        //API CALL
        const response = await fetchData({endpoint, setValue:setConversations, setWaiting:setWaitingInfo, params:{...viewsToSend, ...selectedFilters}, auth})
        if (response?.status === 200) {
            setFilters(selectedFilters)
            const newConversation:{data:ConversationsTableProps[] | null, view:{view_type:'shared' | 'private' | 'deleted', view_index:number}, selectedIndex:number, filters:{page_index:number, sort_by?:ConversationColumn | 'not_selected', search?:string, order?:'asc' | 'desc'}} = 
            {data:response.data, view: {view_type: selectedView.type, view_index: selectedView.index}, selectedIndex:-1, filters: selectedFilters}
            session.dispatch({ type: 'UPDATE_CONVERSATIONS_TABLE', payload: newConversation })
         }
    }
    
    //RECOVER CONVERSATIONS FUNCTION
    const recoverConversations = async() => { 
        session.dispatch({type:'DELETE_VIEW_FROM_CONVERSATIONS_LIST'})
        await fetchData({endpoint:`${auth.authData.organizationId}/conversations/bin/restore`,  auth, method:'post', requestForm:{conversation_ids:allConversationsIdsRef.current},toastMessages:{'works':t('ConversationsRecovered'),'failed':('ConversationsRecoveredFailed')}})
        const responseOrg = await fetchData({endpoint:`${auth.authData.organizationId}/user`, auth})
        auth.setAuthData({views: responseOrg?.data})
        fetchConversationsDataWithFilter(null)
        setSelectedElements([])
    }

    //DELETE A CONVERSATIONS FUNCTION
    const deleteConversations = async() => {
        session.dispatch({type:'DELETE_VIEW_FROM_CONVERSATIONS_LIST'})

        const response = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/bin`, setWaiting:setWaitingDelete, auth, method:'post', requestForm:{conversation_ids:allConversationsIdsRef.current, days_until_deletion:30},toastMessages:{'works':t('ConversationsTrash'),'failed':t('ConversationsTrashFailed')}})
        if (response?.status === 200) {
            const responseOrg = await fetchData({endpoint:`${auth.authData.organizationId}/user`, auth})
            auth.setAuthData({views: responseOrg?.data})
        }
        setShowConfirmDelete(false)
        fetchConversationsDataWithFilter(null)
        setSelectedElements([])
    }

    //COMPONENT FOR DELETING CONVERSATIONS
    const ConfirmDeleteBox = () => {
    
        const [showWaitingDeletePermanently, setShowWaitingDeletePermanently] = useState<boolean>(false)
        const deleteConversationsPermanently = async() => {
            if (selectedView.type === 'deleted') {
                const response = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/bin/delete`,  setWaiting:setShowWaitingDeletePermanently, auth:auth, method:'post', requestForm:{conversation_ids:allConversationsIdsRef.current},toastMessages:{'works':t('ConversationsDeleted'),'failed':t('ConversationsDeletedFailed')}})
                const responseOrg = await fetchData({endpoint:`${auth.authData.organizationId}/user`, auth})
                auth.setAuthData({views: responseOrg?.data})
                fetchConversationsDataWithFilter(null)
                setSelectedElements([])
                setShowConfirmDelete(false)
            }
        }
        return(<>
        <Box p='20px'> 
            <Text fontWeight={'medium'} fontSize={'1.2em'}>{'Confirmar eliminación'}</Text>
            <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
            <Text >{parseMessageToBold(t('DeleteWarning'))}</Text>
        </Box>
        <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
            <Button  size='sm' color='red' _hover={{color:'red.600', bg:'gray.200'}} onClick={deleteConversationsPermanently}>{showWaitingDeletePermanently?<LoadingIconButton/>:t('Delete')}</Button>
            <Button  size='sm' onClick={() => setShowConfirmDelete(false)}>{t('Cancel')}</Button>
        </Flex>
    </>)
    }

    const memoizedConfirmDeleteBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowConfirmDelete}> 
            <ConfirmDeleteBox />
        </ConfirmBox>
    ), [showConfirmDelete])

    //FRONT
    return(<> 
        <Flex height={'calc(100vh - 60px)'} color='black' width={'calc(100vw - 55px)'} >
    
            {/*VIEWS SELECTION*/}
            <Flex zIndex={100}  px='1vw' gap='20px' py='2vh' bg='#f1f1f1' width={'280px'} flexDir={'column'} justifyContent={'space-between'} borderRightWidth={'1px'} borderRightColor='gray.200' >
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
                                        <Flex gap='10px' justifyContent='space-between' key={`private-view-${index}`} onClick={() => {if (!isRetrievingData.current) setSelectedView({index:index, type:'private', name:(view?.name || '')});localStorage.setItem('currentView', JSON.stringify({index:index, type:'private', name:view.name}))}}   _hover={{bg:isSelected? 'white':'brand.blue_hover'}} bg={isSelected? 'white':'transparent'} fontWeight={isSelected? 'medium':'normal'} fontSize={'1em'} cursor={'pointer'} borderRadius={'.5rem'} p='10px'>
                                            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{view.name}</Text>
                                            <Text>{auth.authData.views?.number_of_conversations_per_private_view?.[index] || 0}</Text>
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
                                    <Flex gap='10px' justifyContent='space-between' key={`shared-view-${index}`} onClick={() => {if (!isRetrievingData.current) setSelectedView({index:index, type:'shared', name:(view?.name || '')}); localStorage.setItem('currentView', JSON.stringify({index:index, type:'shared', name:view.name}))}} _hover={{bg:isSelected? 'white':'brand.blue_hover'}} bg={isSelected? 'white':'transparent'} fontWeight={isSelected? 'medium':'normal'}fontSize={'1em'} cursor={'pointer'} borderRadius={'.5rem'} p='10px'>
                                        <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{view.name}</Text>
                                        <Text>{auth.authData.views?.number_of_conversations_per_shared_view?.[index] || 0}</Text>
                                    </Flex>
                                    )
                                })}
                            </Box>
                        </>}
                    </Box>
                </Flex>
                <Box>
                    <Flex  color='red' onClick={() => {if (!isRetrievingData.current) setSelectedView({index:0, type:'deleted', name:'Papelera'}); localStorage.setItem('currentView', JSON.stringify({index:0, type:'deleted', name:'Papelera'}))}} justifyContent={'space-between'} _hover={{bg:selectedView.type === 'deleted'? 'white':'brand.blue_hover'}} bg={selectedView.type === 'deleted'? 'white':'transparent'} fontWeight={selectedView.type === 'deleted'? 'medium':'normal'}fontSize={'1em'} cursor={'pointer'} borderRadius={'.5rem'} p='8px'>
                        <Flex gap='10px' alignItems={'center'}> 
                            <Icon boxSize={'12px'} as={BsTrash3Fill}/>
                            <Text mt='2px' >{t('Trash')}</Text>
                        </Flex>
                        <Text>{auth.authData.views?.number_of_conversations_in_bin || 0}</Text>
                    </Flex>

                    <Box width={'100%'} mt='2vh' mb='2vh' height={'1px'} bg='gray.300' />
                    <Flex mb='1vh' height={'25px'} onClick={() => navigate(`/settings/workflows/edit-views/edit/${selectedView.type}/${selectedView.index}`)} color='brand.text_blue' alignItems={'center'} mt='2vh' gap='7px' cursor={'pointer'} _hover={{textDecor:'underline'}}> 
                        <Text fontSize={'.9em'} ml='7px'>{t('EditViews')}</Text>
                        <Icon as={FaRegEdit} boxSize={'13px'}/>
                    </Flex>
                </Box>
            </Flex>

            {/* ACTIONS AND SHOW TABLE */}
            <Box p='2vw' width={'calc(100vw - 335px)'}>
                <Flex justifyContent={'space-between'} gap='10px'>
                    <Text flex='1' minW={0} fontWeight={'medium'} fontSize={'1.5em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{selectedView.name}</Text>
                    <ActionsButton items={conversations?.page_data} view={selectedView} section={'conversations'} />
                </Flex>
                               
                <Flex gap='15px' mt='2vh'> 
                        <Box width={'350px'}> 
                            <EditText value={filters?.search || ''} setValue={(value) => setFilters(prev => ({...prev, search:value}))} searchInput={true}/>
                        </Box>
                        <Button variant='common' size='sm' leftIcon={<FaFilter/>}  onClick={() => fetchConversationsDataWithFilter(filters)}>{t('ApplyFilters')}</Button>
                    </Flex>
                    
                <Flex mt='2vh'  justifyContent={'space-between'} alignItems={'end'} > 
                    <Skeleton isLoaded={!waitingInfo} >
                        <Text fontWeight={'medium'} color='gray.600' fontSize={'1.2em'}> {t('ConversationsCount', {count:(conversations?.total_conversations || 0)})}</Text> 
                    </Skeleton>
                    <Flex alignItems={'center'} justifyContent={'end'} gap='10px' flexDir={'row-reverse'}>
                        <IconButton isRound size='xs'  variant='common'  aria-label='next-page' icon={<IoIosArrowForward />} isDisabled={filters.page_index > Math.floor((conversations?.total_conversations || 0)/ 25)} onClick={() => fetchConversationsDataWithFilter({...filters,page_index:filters.page_index + 1})}/>
                        <Text fontWeight={'medium'} fontSize={'.9em'} color='gray.600'>{t('Page')} {filters.page_index}</Text>
                        <IconButton isRound size='xs' variant='common' aria-label='next-page' icon={<IoIosArrowBack />} isDisabled={filters.page_index === 1} onClick={() => fetchConversationsDataWithFilter({...filters,page_index:filters.page_index - 1})}/>
                    </Flex>
                </Flex>
                
                <Skeleton ref={tableRef} isLoaded={!waitingInfo}>
                    <Table height={selectedElements.length > 0 ?window.innerHeight - (tableRef.current?.getBoundingClientRect().top || 0) - 150:undefined } data={(conversations?.page_data || [])} CellStyle={CellStyle} noDataMessage={t('NoConversations')} requestSort={requestSort} getSortIcon={getSortIcon} columnsMap={columnsConversationsMap} excludedKeys={['id', 'conversation_id', 'contact_id',  'is_matilda_engaged']} onClickRow={handleClickRow} selectedElements={selectedElements} setSelectedElements={setSelectedElements} onSelectAllElements={getAllConversationsIds} currentIndex={selectedIndex}/> 
                </Skeleton >             
            </Box>

            <AnimatePresence> 
                {selectedElements.length > 0 && 
                <Portal> 
                    <motion.div initial={{bottom:-200}} animate={{bottom:0}} exit={{bottom:-200}} transition={{duration:.2}} style={{backgroundColor:'#F7FAFC',display:'flex', justifyContent:'space-between', alignItems:'center',padding:'0 2vw 0 2vw', height:'80px', left:'335px', gap:'20px',position:'fixed',  borderTop:' 1px solid #E2E8F0', overflow:'scroll', width:`calc(100vw - 335px)`}}>
                        <Flex gap='1vw' alignItems={'center'}> 
                            <Text whiteSpace={'nowrap'} fontWeight={'medium'}>{t('ConversationsCount', {count:conversations?.total_conversations})}</Text>
                            <Button  fontWeight={'medium'} color='brand.text_blue' onClick={() => setSelectedElements([])} size='sm' bg='transparent' borderColor={'transparent'}  _hover={{bg:'gray.100'}} leftIcon={<MdDeselect/>}>{t('DeSelect')}</Button> 
                            {selectedView.type === 'deleted' ? 
                                <Button  fontWeight={'medium'} color='brand.text_blue'  size='sm' bg='transparent' borderColor={'transparent'} _hover={{bg:'gray.100'}} leftIcon={<FaArrowRotateLeft/>} onClick={recoverConversations}>{t('Recover')}</Button>
                            :
                                <> {selectedElements.length <= 1 && <Button  fontWeight={'medium'} color='brand.text_blue' onClick={() => navigate(`/conversations/conversation/${selectedElements[0]}`)} size='sm' bg='transparent' borderColor={'transparent'}  _hover={{bg:'gray.100'}} leftIcon={<BiEditAlt/>}>{t('Edit')}</Button>}</>
                            } 
                            <Button  fontWeight={'medium'} size='sm' onClick={() => {if (selectedView.type === 'deleted') setShowConfirmDelete(true);else{deleteConversations()}}} bg='transparent' borderColor={'transparent'} color='red.500' _hover={{bg:'gray.100', color:'red.700'}}leftIcon={<BsTrash3Fill/>}>{waitingDelete?<LoadingIconButton/>:selectedView.type === 'deleted'?t('Delete'):t('MoveToBin')}</Button>
                        </Flex>
                        <Button sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }} size='sm' variant='delete' onClick={() => setSelectedElements([])} >{t('Cancel')}</Button>
                    </motion.div>
                </Portal>}
            </AnimatePresence>
        </Flex>
        
 

        {showConfirmDelete && memoizedConfirmDeleteBox}
        
        </>)
}

export default ConversationsTable

 
