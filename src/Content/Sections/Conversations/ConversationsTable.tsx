/*
  MAIN CONVERSATIONS FUNCTION (/conversations)
*/

//REACT
import { useState, useEffect, useRef,useMemo,lazy, useCallback, Dispatch, SetStateAction, Suspense } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../../AuthContext" 
import { useSession } from "../../../SessionContext"
import { useTranslation } from 'react-i18next'
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import fetchData from "../../API/fetchData"
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
//FRONT
import { Flex, Box, Text, Icon, Button, IconButton, Skeleton, Tooltip, Portal, chakra, shouldForwardProp, Spinner } from '@chakra-ui/react'
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion'
//COMPONENTS
import ActionsButton from "./ActionsButton"
import Table from "../../Components/Reusable/Table"
import StateMap from "../../Components/Reusable/StateMap"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import CustomCheckbox from "../../Components/Reusable/CheckBox"
//FUNCTIONS
import DetermineConversationViews from "../../MangeData/DetermineConversationViews"
import timeStampToDate from "../../Functions/timeStampToString"
import timeAgo from "../../Functions/timeAgo"
import showToast from "../../Components/Reusable/ToastNotification"
import useOutsideClick from "../../Functions/clickOutside"
import parseMessageToBold from "../../Functions/parseToBold"
//ICONS
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io"
import { MdDeselect } from "react-icons/md"
import { FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaRegEdit } from 'react-icons/fa'
import { FaArrowRotateLeft, FaMagnifyingGlass, FaPlus, FaTable } from "react-icons/fa6"
import { BiEditAlt } from "react-icons/bi"
import { HiTrash } from "react-icons/hi2"
import { PiSidebarSimpleBold } from "react-icons/pi"
import { TbLayoutSidebarFilled } from "react-icons/tb"
//TYPING
import { Conversations, ConversationColumn, Views, ViewType, ConversationsTableProps, logosMap, Channels, statesMap  } from "../../Constants/typing"
  

const ConversationResponse = lazy(() => import('./ConversationResponse'))

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

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

    if (column === 'local_id') return  <Text fontSize={'.9em'} color='gray.600' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>#{element}</Text>
     else if (column === 'user_id')  return  <Text fontSize={'.9em'} fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element === 'matilda' ?'Matilda':element === 'no_user' ? t('NoAgent'):(auth?.authData?.users?.[element as string | number]?.name || t('NoAgent')) }</Text>
    else if (column === 'unseen_changes') 
        return(
        <Flex fontSize={'.9em'} color={element?'red':'green'} alignItems={'center'} gap='5px'> 
            <Icon as={element?FaExclamationCircle:FaCheckCircle} />
            <Text>{element?t('NotRead'):t('Any')}</Text>
        </Flex>)
    
    else if (column === 'status' && typeof element === 'string' && validStatuses.includes(element as Status)) return  <StateMap state={element as Status}/>
    else if (column === 'urgency_rating' && typeof element === 'number') {return <AlertLevel t={t} rating={element}/>}
    else if (column === 'created_at' || column === 'updated_at' || column === 'solved_at' || column === 'closed_at') {
        return(
        <Tooltip  label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.5rem' fontSize='.8em' p='6px'> 
            <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    }
    else if (column === 'deletion_date'  && typeof element === 'string' ) return <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeStampToDate(element, t_formats)}</Text>
    else if (column === 'channel_type') {
        return(
        <Flex fontSize={'.9em'} gap='7px' alignItems={'center'}>
            <Icon color='gray.600' as={typeof element === 'string' && element in logosMap ?logosMap[element as Channels][0]:FaInfoCircle}/>
            <Text >{t(element as string)}</Text>
         </Flex>)
    }     
    else if (column === 'call_duration') return ( <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element?t('Duration', {seconds:element}):''}</Text>)
    
    else return ( <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>)
}

//MAIN FUNCTION
function ConversationsTable({socket}:{socket:any}) {

     //TRANSLATION
    const { t } = useTranslation('conversations')
    const t_formats = useTranslation('formats').t
    const { getAccessTokenSilently } = useAuth0()

    //CONSTANTS
    const auth = useAuth()
    const session= useSession()
    const navigate = useNavigate()
     const tableRef = useRef<HTMLDivElement>(null)
    const location = useLocation()
    const currentSearch = location.search

    const conversationContainerRef = useRef<HTMLDivElement>(null)
    const tableContainerRef = useRef<HTMLDivElement>(null)
    const changeViewButtonRef = useRef<HTMLDivElement>(null)
    useOutsideClick({ref1:conversationContainerRef,  ref2:tableContainerRef, ref3:changeViewButtonRef,  onOutsideClick:() => navigate(`/conversations${currentSearch}`)})


    //TABLE MAPPING
    const columnsConversationsMap:{[key in ConversationColumn]:[string, number]} = {id: [t('id'), 50], local_id: [t('local_id'), 50], status:  [t('status'), 100], channel_type: [t('channel_type'), 100], theme:  [t('theme'), 200], user_id: [t('user_id'), 200], created_at: [t('created_at'), 150],updated_at: [t('updated_at'), 180], solved_at: [t('solved_at'), 150],closed_at: [t('closed_at'), 150],title: [t('title'), 300], urgency_rating: [t('urgency_rating'), 130], deletion_scheduled_at: [t('deletion_date'), 180], unseen_changes: [t('unseen_changes'), 200],  call_status: [t('call_status'), 150], call_duration: [t('call_duration'), 150], }
    
    const [isConversationOpened,setIsConversationOpened] = useState<boolean>(location.pathname.split('/')[location.pathname.split('/').length - 2] === 'conversation')
   

    //WAITING NEW CONVERSATIONS ON LIST
    const debounce = (func:any, delay:any) => {
        let timeout:any;
        return (...args:any) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        }
    }
    
    {/*
    const listRef = useRef<HTMLDivElement>(null);
 
    const handleScroll = () => {
        if (listRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = listRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 10 && !waitingInfoList) {
                setWaitingInfoList(true)
                fetchConversationsDataScroll().finally(() => {
                    setWaitingInfoList(false)
                })
            }
        }
    }

    const fetchConversationsDataScroll = async () => {

         if ( Math.floor((conversationsRef.current?.page_data.length || 0)/ 25)  <= Math.floor((conversationsRef.current?.total_conversations || 0)/ 25)) {
            
            //APPLY FILTERS 
            const selectedFilters = {...filters, page_index:Math.floor((conversationsRef.current?.page_data.length || 0)/ 25) + 1}

            //CHOOSE CONFIGURATION DEPENDING ON ITS BIN OR A NORMAL VIEW
            let endpoint = `${auth.authData.organizationId}/conversations`
            let viewsToSend:{view_type:string, view_index:number} | {} = {view_type:selectedView.type, view_index:selectedView.index}
            if (selectedView.type === 'deleted') {endpoint = `${auth.authData.organizationId}/conversations/bin`;viewsToSend = {}}
            
            //API CALL
            const response = await fetchData({endpoint, getAccessTokenSilently, params:{...viewsToSend, ...selectedFilters}, auth})
            if (response?.status === 200) {
                setConversations(prev => ({...prev as Conversations, page_data:[...prev?.page_data || [], ...response.data.page_data]} ))
            }
        }
    }
    
    useEffect(() => {
        const listElement = listRef.current
        const debounceScroll = debounce(handleScroll, 300)
         if (listElement ) {
             listElement.addEventListener('scroll', debounceScroll);
        }
        return () => {
            const listElement = listRef.current;
            if (listElement) {
                listElement.removeEventListener('scroll', debounceScroll)
            }
         }
    }, [])
    */}
 
    const [selectedTableSection, setSelectedTabelSection] = useState<'table' | 'list'>('table')
 
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        params.set('view', 'table')
        navigate(`${location.pathname}?view=${'table'}`)
    }, [])

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const view = params.get('view')
        console.log(view)
        setSelectedTabelSection(view as any)
        setIsConversationOpened(location.pathname.split('/')[location.pathname.split('/').length - 2] === 'conversation' || view === 'list')

    }, [location.search, location.pathname])

   

    const [hideViews, setHideViews] = useState<boolean>(false)

    //WAIT INFO AND FORCE TH REUPDATE OF THE TABLE ON DELETE
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)
    const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

    //CONVERSATION DATA AND SELECTED VIEW
    const [conversations, setConversations] = useState<Conversations | null>(null)
    const conversationsRef = useRef(conversations);
    useEffect(() => {
        conversationsRef.current = conversations;
    }, [conversations])

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

        localStorage.setItem('currentSection', 'conversations')

        setSelectedView(localStorage.getItem('currentView') && JSON.parse(localStorage.getItem('currentView') as string) || getFirstView(auth.authData.views as Views))

        socket?.current.on('conversation', (data:any) => {
            const editTable = async () => {
                    const previousViews = DetermineConversationViews(data?.previous_data, auth.authData.views as Views, auth.authData?.userId || '')
                    const newViews = DetermineConversationViews(data?.new_data, auth.authData.views as Views, auth.authData?.userId || '')

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

    useEffect(() => {if (location.pathname.endsWith('conversations')) document.title = `${t('Conversations')} - ${selectedView.name} - ${auth.authData.organizationName} - Matil`},[selectedView, location])
   
    //FETCH NEW DATA WHEN THE VIEW CHANGE
    useEffect(() => {

        setSelectedElements([])
        const fetchConversationData = async() => {

            //FIND IF THE SECTION IS OPENED
            const conversationsList = session.sessionData.conversationsTable
            const foundCon = conversationsList.find(con => con.view.view_type === selectedView.type && con.view.view_index === selectedView.index)

            //SECTION FOUND
            if (foundCon){
                setConversations(foundCon.data)
                setFilters(foundCon?.filters || {page_index:1})
                setSelectedIndex((foundCon.selectedIndex === null || foundCon.selectedIndex === undefined)?-1 : foundCon.selectedIndex )
                setWaitingInfo(false)
            } 

            //SECTION NOT FOUND (FETCH THE DATA)
            else {
                //CLEAR THE FILTERS
                setFilters({page_index:1})
                setSelectedIndex(-1)
                 
                //CALL THE BIN
                if (selectedView.type === 'deleted') {
                    const response1 = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/bin`, getAccessTokenSilently, setValue:setConversations, setWaiting:setWaitingInfo, params:{page_index:1}, auth})
                    if (response1?.status === 200) {      
                        const newConversations:{data:ConversationsTableProps[] | null, view:{view_type:'shared' | 'private' | 'deleted', view_index:number}, selectedIndex:number, filters:ConversationFilters} = 
                        {data:response1.data, view: {view_type: selectedView.type, view_index: selectedView.index}, filters: {page_index:1}, selectedIndex:-1}
                        session.dispatch({ type: 'UPDATE_CONVERSATIONS_TABLE', payload: newConversations })
                    }
                }

                //CALL A NORMAL CONVERSATIONS VIEW
                else {
                    const response2 = await fetchData({endpoint:`${auth.authData.organizationId}/conversations`, getAccessTokenSilently, setValue:setConversations, setWaiting:setWaitingInfo, params:{page_index:1, view_type:selectedView.type, view_index:selectedView.index}, auth})
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
        navigate(`/conversations/conversation/${row.id}${currentSearch}`)
        setSelectedIndex(index) 
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
    const handleCheckboxChange = useCallback((element:number, isChecked:boolean) => {
        if (selectedElements && setSelectedElements) {
            if (isChecked) {
                setSelectedElements(prevElements=> [...prevElements, element])
            }
            else setSelectedElements(prevElements => prevElements.filter(el => el !== element))
        }
    }, [selectedElements, setSelectedElements])
    


    //GET ALL CONVERSATIONS IDS
    const getAllConversationsIds = async () => {
        if (selectedElements.length >= (conversations?.page_data?.length || 0)) setSelectedElements([])
        else {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/all_conversation_ids`,  params:{page_index:filters.page_index, view_type:selectedView.type === 'deleted'?'bin':selectedView.type, view_index:selectedView.index}, getAccessTokenSilently, auth})
            if (response?.status === 200) {
                allConversationsIdsRef.current === response.data
                setSelectedElements( Array.from({ length: response.data.total_conversations }, (v, i) => i ))
            }
        }
    }

    useEffect(() => {
        const handleKeyDown = (event:KeyboardEvent) => {
              switch (event.code) {           
                case 'Escape':
                    console.log(currentSearch)
                    if (!location.pathname.endsWith('conversations')) navigate(`/conversations${currentSearch}`)
                    break        
                default:
                  break
              }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    },[location, currentSearch])

 
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
        const response = await fetchData({endpoint, setValue:setConversations, setWaiting:setWaitingInfo, getAccessTokenSilently, params:{...viewsToSend, ...selectedFilters}, auth})
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
        await fetchData({endpoint:`${auth.authData.organizationId}/conversations/bin/restore`,  getAccessTokenSilently, auth, method:'post', requestForm:{conversation_ids:allConversationsIdsRef.current},toastMessages:{'works':t('ConversationsRecovered'),'failed':('ConversationsRecoveredFailed')}})
        const responseOrg = await fetchData({endpoint:`${auth.authData.organizationId}/user`,  getAccessTokenSilently,auth})
        auth.setAuthData({views: responseOrg?.data})
        fetchConversationsDataWithFilter(null)
        setSelectedElements([])
    }

    //DELETE A CONVERSATIONS FUNCTION
    const deleteConversations = async() => {
        session.dispatch({type:'DELETE_VIEW_FROM_CONVERSATIONS_LIST'})

        const response = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/bin`, setWaiting:setWaitingDelete, getAccessTokenSilently, auth, method:'post', requestForm:{conversation_ids:allConversationsIdsRef.current, days_until_deletion:30},toastMessages:{'works':t('ConversationsTrash'),'failed':t('ConversationsTrashFailed')}})
        if (response?.status === 200) {
            const responseOrg = await fetchData({endpoint:`${auth.authData.organizationId}/user`, getAccessTokenSilently, auth})
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
                const response = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/bin/delete`, getAccessTokenSilently,  setWaiting:setShowWaitingDeletePermanently, auth:auth, method:'post', requestForm:{conversation_ids:allConversationsIdsRef.current},toastMessages:{'works':t('ConversationsDeleted'),'failed':t('ConversationsDeletedFailed')}})
                const responseOrg = await fetchData({endpoint:`${auth.authData.organizationId}/user`,  getAccessTokenSilently,auth})
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
            <Button size='sm' variant='delete' onClick={deleteConversationsPermanently}>{showWaitingDeletePermanently?<LoadingIconButton/>:t('Delete')}</Button>
            <Button size='sm' variant={'common'} onClick={() => setShowConfirmDelete(false)}>{t('Cancel')}</Button>
        </Flex>
    </>)
    }

    const memoizedConfirmDeleteBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowConfirmDelete}> 
            <ConfirmDeleteBox />
        </ConfirmBox>
    ), [showConfirmDelete])

    const tableWidthHideView =`calc(100vw - 45px)`  
    const tableWidthShowView =`calc(100vw - 45px - 220px)`  

    const listWidthHideView =`calc(100vw - 45px - ${Math.min(window.innerWidth * 0.6, window.innerWidth - 500)}px)`  
    const listWidthShowView =`calc(100vw - 45px - ${Math.min(window.innerWidth * 0.6, window.innerWidth - 500)}px - 220px)`  

     
     //FRONT
    return(<>
            <Box position='fixed' ref={changeViewButtonRef} zIndex={100} bottom={selectedElements.length === 0 ? '1vw':'calc(60px + 1vw)'} left={hideViews?'calc(45px + 2vw)':'calc(45px +  220px + 2vw)'}transition={'left 0.2s ease-in-out, bottom .1s ease-in-out'}> 
                 <ChangeViewButton selectedTableSection={selectedTableSection} setSelectedTabelSection={setSelectedTabelSection} firstId={conversations?.page_data?.[0]?.id || -1}/>
            </Box>

            <Suspense fallback={<></>}>    
                <AnimatePresence>
                    {(isConversationOpened ) && 
                    <MotionBox ref={conversationContainerRef} overflowY={'scroll'} w={Math.min(window.innerWidth * 0.6, window.innerWidth - 500)} initial={{ right: -25  + 'px', opacity: isConversationOpened ||selectedTableSection === 'list'?0:1}} animate={{ right: 0,  opacity: isConversationOpened ||selectedTableSection === 'list'?1:0  }} exit={{ right:-25 ,  opacity: isConversationOpened ||selectedTableSection === 'list'?0:1}} transition={{ duration: '.125', ease: 'easeOut'}} 
                    bg='white' top={0} minHeight="100vh" maxHeight="100vh" boxShadow={"-4px 0 6px -2px rgba(0, 0, 0, 0.1)"} borderLeftColor={'gray.200'} borderLeftWidth={'1px'} right={0} pointerEvents={isConversationOpened ||selectedTableSection === 'list' ?'auto':'none'} height={'100vh'}   position='absolute' zIndex={100} overflow={'hidden'} >
                            <ConversationResponse socket={socket} fetchConversationsDataWithFilter={fetchConversationsDataWithFilter} />
                    </MotionBox>}
                </AnimatePresence>
            </Suspense>
            
            {showConfirmDelete && memoizedConfirmDeleteBox}


            <Flex position={'relative'} width={'calc(100vw - 45px)'} bg='brand.hover_gray' height={'100vh'}> 
 
                     {/*VIEWS SELECTION*/}
                    <Flex zIndex={10} overflow={'hidden'}borderRightColor={'gray.200'} borderRightWidth={'1px'}  width={hideViews ? 0:220}transition={'width ease-in-out .2s'}  gap='20px' py='2vh' flexDir={'column'} justifyContent={'space-between'} >
                        <Flex justifyContent={'space-between'} w='calc(220px)' flexDir={'column'} flex='1' minH={0}>  
                            
                            <Box px='1vw' > 
                                <Flex  alignItems={'center'} justifyContent={'space-between'}> 
                                    <Text  fontWeight={'semibold'} fontSize={'1.2em'}>{t('Inbox')}</Text>
                                    <IconButton bg='transparent' _hover={{bg:'brand.gray_1', color:'brand.text_blue'}} borderColor={'gray.200'} borderWidth={'1px'} variant={'common'}  h='28px' w='28px' aria-label="create-function" size='xs'>
                                    <Tooltip  label={t('Search') + '...'}  placement='right'  bg='white' color='black'  borderRadius='.5rem' fontSize='.7em' p='6px'> 
                                        <Box display="flex" h='100%' w='100%' alignItems="center" justifyContent="center" transition="transform .5s ease-in-out"  _hover={{ transform: "rotate(90deg)" }} >
                                            <FaMagnifyingGlass size="14px" />
                                        </Box>
                                    </Tooltip>

                                    </IconButton>
                                </Flex>
                                <Box h='1px' w='100%' bg='gray.300' mt='2vh' mb='2vh'/>
                            </Box>

                            <Box height={'100px'} flex='1' overflow={'scroll'}  px='1vw'>
                                
                                    <Text  fontWeight={'medium'} mb='1vh'>{t('PrivateViews')}</Text>
                                    
                                        <Box mb='4vh'> 
                                        {(auth.authData.views && 'private_views' in auth.authData.views && auth.authData.views.private_views.length > 0 ) ? <>

                                        {auth.authData.views.private_views.map((view, index) => {
                                            const isSelected = selectedView.index === index && selectedView.type === 'private'
                                            return(
                                                <Flex gap='10px' borderColor={isSelected ? 'gray.200':'transparent'}  fontWeight={isSelected? 'medium':'normal'} bg={isSelected?'white':'transparent'}  transition={isSelected?'box-shadow .2s ease-in-out, border-color .2s ease-in-out, background-color .2s ease-in-out':'box-shadow .2s ease-out, border-color .2s ease-out, background-color .2s ease-out'}    boxShadow={isSelected ? '0 0 3px 0px rgba(0, 0, 0, 0.1)':''} borderWidth={'1px'}  justifyContent='space-between' key={`shared-view-${index}`} onClick={() => {if (!isRetrievingData.current) setSelectedView({index:index, type:'private', name:(view?.name || '')}); localStorage.setItem('currentView', JSON.stringify({index:index, type:'shared', name:view.name}))}} _hover={{bg:isSelected?'white':'brand.gray_2'}}   fontSize={'.9em'} cursor={'pointer'} borderRadius={'.5rem'} p='6px'>
                                                    <Text  transition={'transform .1s ease-in-out'}   transformOrigin="left center" transform={isSelected?'scale(1.02)':'scale(1)'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}   overflow={'hidden'}>{view.name}</Text>
                                                    <Text>{auth.authData.views?.number_of_conversations_per_private_view?.[index] || 0}</Text>
                                                </Flex>
                                                )
                                        })}
                                        </> :
                                        <> 
                                            <Button w='100%'  onClick={() => navigate(`/settings/workflows/edit-views/edit`)} leftIcon={<FaPlus/>} bg='transparent' borderColor={'gray.300'} borderWidth={'1px'} variant={'common'} size='xs'>{t('CreatePrivateView')}</Button>
                                        </>
                                        }
                                    </Box>
                                    
                    
                                {(auth.authData.views && 'shared_views' in auth.authData.views && auth.authData.views.shared_views.length > 0 ) &&   <>
                                    <Text fontWeight={'medium'} mb='1vh' >{t('PublicViews')}</Text>
                                    <Box> 
                                        {auth.authData.views.shared_views.map((view, index) => {
                                        const isSelected = selectedView.index === index && selectedView.type === 'shared'
                                        return(
                                            <Flex gap='10px' bg={isSelected?'white':'transparent'}  transition={isSelected?'box-shadow .2s ease-in-out, border-color .2s ease-in-out, background-color .2s ease-in-out':'box-shadow .2s ease-out, border-color .2s ease-out, background-color .2s ease-out'}   boxShadow={isSelected ? '0 0 3px 0px rgba(0, 0, 0, 0.1)':''} borderWidth={'1px'} borderColor={isSelected ? 'gray.200':'transparent'} justifyContent='space-between' key={`shared-view-${index}`} onClick={() => {if (!isRetrievingData.current) setSelectedView({index:index, type:'shared', name:(view?.name || '')}); localStorage.setItem('currentView', JSON.stringify({index:index, type:'shared', name:view.name}))}} _hover={{bg:isSelected?'white':'brand.gray_2'}}fontWeight={isSelected? 'medium':'normal'}fontSize={'.9em'} cursor={'pointer'} borderRadius={'.5rem'} p='6px'>
                                                <Text  transition={'transform .1s ease-in-out'}   transformOrigin="left center" transform={isSelected?'scale(1.02)':'scale(1)'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}   overflow={'hidden'}>{view.name}</Text>
                                                <Text>{auth.authData.views?.number_of_conversations_per_shared_view?.[index] || 0}</Text>
                                            </Flex>
                                            )
                                        })}
                                    </Box>
                                </>}
                            </Box>
                        </Flex>
                        <Box px='1vw'  w='220px'>
                            
                            <Flex gap='10px' color='red' boxShadow={selectedView.type === 'deleted' ?'0 0 3px 0px rgba(0, 0, 0, 0.1)':''} borderWidth={'1px'} borderColor={selectedView.type === 'deleted' ? 'gray.200':'transparent'} justifyContent='space-between'  onClick={() => {if (!isRetrievingData.current) setSelectedView({index:0, type:'deleted', name:t('Trash')}); localStorage.setItem('currentView', JSON.stringify({index:0, type:'deleted', name:t('Trash')}))}} _hover={{bg:selectedView.type === 'deleted'? 'white':'brand.gray_2'}}  bg={selectedView.type === 'deleted'?'white':'transparent'}   transition={selectedView.type === 'deleted'?'box-shadow .2s ease-in-out, border-color .2s ease-in-out, background-color .2s ease-in-out':'box-shadow .2s ease-out, border-color .2s ease-out, background-color .2s ease-out'}  fontWeight={selectedView.type === 'deleted'?  'medium':'normal'}fontSize={'.9em'} cursor={'pointer'} borderRadius={'.5rem'} p='6px'>
                                <Flex gap='10px' alignItems={'center'}> 
                                    <Icon boxSize={'15px'} as={HiTrash}/>
                                    <Text mt='2px' transition={'transform .1s ease-in-out'}   transformOrigin="left center" transform={selectedView.type === 'deleted' ?'scale(1.02)':'scale(1)'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}   overflow={'hidden'}>{t('Trash')}</Text>
                                    </Flex>
                                <Text>{auth.authData.views?.number_of_conversations_in_bin || 0}</Text>
                            </Flex>

                            <Box width={'100%'} mt='2vh' mb='2vh' height={'1px'} bg='gray.300' />
                            <Button w='100%' justifyContent={'start'} size='sm'variant={'common'} fontSize={'.9em'}  onClick={() => navigate(`/settings/workflows/edit-views`)} leftIcon={<FaRegEdit/>} bg='transparent'>{t('EditViews')}</Button>
                            
                        </Box>
                    </Flex>
 

                {/* ACTIONS AND SHOW TABLE */}
                <AnimatePresence >

                    {selectedTableSection === 'table' ?<>
                    <MotionBox key="table-section" initial={{opacity:0}}  animate={{opacity:1}} exit={{opacity:0}}   transition={{ duration: '0.2',  ease: 'easeInOut'}} > 
                        <Flex bg='brand.hover_gray' h='100vh' flexDir={'column'} width={hideViews ? tableWidthHideView:tableWidthShowView} minW={hideViews ? tableWidthHideView:tableWidthShowView} transition={'width ease-in-out .2s, min-width ease-in-out .2s'} right={0}   position="absolute" top={0} >
                            
                            <Flex px='2vw' pt='2vh' justifyContent={'space-between'} gap='10px'>
                                <Flex flex={1} gap='10px' alignItems={'center'}> 
                                    <Tooltip  label={t('HideViews')}  placement='right'  bg='white' color='black'  borderRadius='.5rem' fontSize='.7em' p='6px'> 
                                        <IconButton bg='transparent' _hover={{bg:'brand.gray_1', color:'brand.text_blue'}} icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'18px'}/>} variant={'common'}  h='28px' w='28px' aria-label="create-function" size='xs' onClick={() => setHideViews(prev => (!prev))} />
                                    </Tooltip>
                                    <Text flex='1' minW={0} fontWeight={'medium'} fontSize={'1.2em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{selectedView.name}</Text>
                                </Flex>
                                <ActionsButton items={conversations?.page_data} view={selectedView} section={'conversations'} />
                            </Flex>
                                        
                            <Flex px='2vw' mb='1vh' height={'20px'} ref={tableRef} mt='2vh' alignItems={'end'} justifyContent={'space-between'}  > 
                                <Skeleton isLoaded={!waitingInfo} >
                                    <Text  whiteSpace={'nowrap'}  fontWeight={'medium'} color='gray.600' > {t('ConversationsCount', {count:(conversations?.total_conversations || 0)})}</Text> 
                                </Skeleton>

                                <AnimatePresence> 
                                
                                
                                    <MotionBox display={'flex'} alignItems={'center'}  gap='10px' flexDir={'row-reverse'} pointerEvents={isConversationOpened?'none':'auto'} width={isConversationOpened?0:'100%'} initial={{opacity:isConversationOpened?1:0 }} animate={{opacity:isConversationOpened?0:1}} exit={{opacity:isConversationOpened?1:0}} overflow={'hidden'}  transition={{ duration: '0.2', delay:'.3' }} >
                                        <IconButton size='xs'isRound  variant='common'  aria-label='next-page' icon={<IoIosArrowForward />} isDisabled={filters.page_index > Math.floor((conversations?.total_conversations || 0)/ 25)} onClick={() => fetchConversationsDataWithFilter({...filters,page_index:filters.page_index + 1})}/>
                                        <Text fontWeight={'medium'} fontSize={'.8em'} color='gray.600'>{t('Page')} {filters.page_index}</Text>
                                        <IconButton size='xs' isRound variant='common' aria-label='next-page' icon={<IoIosArrowBack />} isDisabled={filters.page_index === 1} onClick={() => fetchConversationsDataWithFilter({...filters,page_index:filters.page_index - 1})}/>
                                    </MotionBox>
                                </AnimatePresence> 
                            </Flex>
                            
                            <Box ref={tableContainerRef}> 
                            <Table height={selectedElements.length > 0 ? window.innerHeight * 0.98   - (tableRef.current?.getBoundingClientRect().bottom || 0) - 85 - window.innerWidth * 0.02:undefined } data={conversations?.page_data} CellStyle={CellStyle} noDataMessage={t('NoConversations')} requestSort={requestSort} getSortIcon={getSortIcon} columnsMap={columnsConversationsMap} excludedKeys={['id', 'conversation_id', 'contact_id',  'is_matilda_engaged', 'state', 'organization_id',  'call_sid', 'call_url', 'channel_id', 'custom_attributes', ] } onClickRow={handleClickRow} selectedElements={selectedElements} setSelectedElements={setSelectedElements} onSelectAllElements={getAllConversationsIds} currentIndex={selectedIndex} waitingInfo={waitingInfo}/>
                            </Box>
                        </Flex>
                          
                        <AnimatePresence> 
                          {(selectedElements.length > 0) && 
                          <Portal> 
                              <motion.div initial={{bottom:-200}} animate={{bottom:0}} exit={{bottom:-200}} transition={{duration:.1,ease:'easeOut' }} style={{backgroundColor:'white',display:'flex', borderTop:'1px solid #E2E8F0',transition:'width ease-in-out .2s', justifyContent:'space-between', alignItems:'center',padding:'0 2vw 0 2vw', height:'60px', right:0, gap:'20px',position:'fixed',overflow:'scroll', width:hideViews ? tableWidthHideView:tableWidthShowView}}>
                                  <Flex gap='1vw' alignItems={'center'}> 
                                      <Text whiteSpace={'nowrap'} fontWeight={'medium'} fontSize={'.8em'}>{t('ConversationsCount', {count:selectedElements.length})}</Text>
                                      <Button color='brand.text_blue' onClick={() => setSelectedElements([])} size='xs' bg='transparent' borderColor={'transparent'}  variant={'common'}  leftIcon={<MdDeselect/>}>{t('DeSelect')}</Button> 
                                      {selectedView.type === 'deleted' ? 
                                          <Button  fontWeight={'medium'} color='brand.text_blue'  size='xs' bg='transparent' borderColor={'transparent'} variant={'common'} leftIcon={<FaArrowRotateLeft/>} onClick={recoverConversations}>{t('Recover')}</Button>
                                      :
                                          <> {selectedElements.length <= 1 && <Button  fontWeight={'medium'} color='brand.text_blue' onClick={() => navigate(`/conversations/conversation/${conversations?.page_data[selectedElements[0]].id}${currentSearch}`)}size='xs' bg='transparent' borderColor={'transparent'}  variant={'common'}  leftIcon={<BiEditAlt/>}>{t('Edit')}</Button>}</>
                                      } 
                                      <Button  fontWeight={'medium'} size='xs'onClick={() => {if (selectedView.type === 'deleted') setShowConfirmDelete(true);else{deleteConversations()}}} bg='transparent' borderColor={'transparent'} variant='delete' leftIcon={<HiTrash/>}>{waitingDelete?<LoadingIconButton/>:selectedView.type === 'deleted'?t('Delete'):t('MoveToBin')}</Button>
                                  </Flex>
                                  <Button sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }} size='xs' variant='delete' onClick={() => setSelectedElements([])} >{t('Cancel')}</Button>
                              </motion.div>
                          </Portal>}
                        </AnimatePresence>
                    </MotionBox>
                    </>
                    :
                     <MotionBox key="list-section" initial={{opacity:0}} animate={{opacity:1}}  exit={{opacity:0}}  transition={{ duration: '.2',  ease: 'easeInOut'}} > 
                        <Flex h='100vh' bg='brand.hover_gray' flexDir={'column'} width={hideViews ? listWidthHideView:listWidthShowView} transition={'width ease-in-out .2s'} >

                            <Flex px='1vw' pt='2vh' justifyContent={'space-between'} gap='10px'>
                                <Flex flex={1} gap='10px' alignItems={'center'}> 
                                    <Tooltip  label={t('HideViews')}  placement='right'  bg='white' color='black'  borderRadius='.5rem' fontSize='.7em' p='6px'> 
                                        <IconButton bg='transparent' _hover={{bg:'brand.gray_1', color:'brand.text_blue'}} icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'18px'}/>} variant={'common'}  h='28px' w='28px' aria-label="create-function" size='xs' onClick={() => setHideViews(prev => (!prev))} />
                                    </Tooltip>
                                    <Text flex='1' minW={0} fontWeight={'medium'} fontSize={'1.2em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{selectedView.name}</Text>
                                </Flex>
                            </Flex>
                            <Flex px='1vw' mb='1vh' height={'20px'}  mt='2vh' alignItems={'end'} justifyContent={'space-between'}  > 

                                <Skeleton isLoaded={!waitingInfo} >
                                    <Text  whiteSpace={'nowrap'}  fontWeight={'medium'} color='gray.600' > {t('ConversationsCount', {count:(conversations?.total_conversations || 0)})}</Text> 
                                </Skeleton>

                                <Flex alignItems={'center'} gap='10px' flexDir={'row-reverse'} overflow={'hidden'}  >
                                    <Tooltip  label={t('Delete')}  placement='top' hasArrow bg='white' color='black'  borderRadius='0.3rem' fontSize='.8em' p='6px'> 
                                        <IconButton size='xs' opacity={selectedElements.length === 0 ? 0:1} pointerEvents={selectedElements.length === 0 ? 'none':'auto'} variant='delete'  aria-label='delete' icon={<HiTrash  size={'16px'}/>} onClick={() => {if (selectedView.type === 'deleted') setShowConfirmDelete(true);else{deleteConversations()}}} />
                                    </Tooltip>
                                    <Tooltip  label={t('DeSelect')}  placement='top' hasArrow bg='white' color='black'  borderRadius='0.3rem' fontSize='.8em' p='6px'> 
                                        <IconButton size='xs'  opacity={selectedElements.length === 0 ? 0:1}  pointerEvents={selectedElements.length === 0 ? 'none':'auto'} variant='common'  aria-label='deselect' icon={<MdDeselect size={'16px'}/>} onClick={() => setSelectedElements([])} />
                                    </Tooltip>
                                </Flex>
                            </Flex>
                        
                                        
                            <Box flex='1' overflow={'scroll'} px='1vw'> 
                                {conversations?.page_data.map((con, index) => {
                                    const isSelected = parseInt(location.pathname.split('/')[location.pathname.split('/').length - 1]) === con.id
                                    return (
                                    <Skeleton isLoaded={!waitingInfo}> 
                                        <Box w={`calc(${hideViews ? listWidthHideView:listWidthShowView}  - 2vw)`} position={'relative'} key={`conversations-${index}`} onClick={() => {navigate(`/conversations/conversation/${con.id}${currentSearch}`)}}  p='10px' borderRadius={'.5rem'} cursor={'pointer'}  bg={ isSelected?'white':'transparent'}   transition={isSelected?'box-shadow .2s ease-in-out, border-color .2s ease-in-out, background-color .2s ease-in-out':'box-shadow .2s ease-out, border-color .2s ease-out, background-color .2s ease-out'}    boxShadow={isSelected ? '0 0 3px 0px rgba(0, 0, 0, 0.1)':''} borderWidth={'1px'} borderColor={isSelected ? 'gray.200':'transparent'}   _hover={{bg:isSelected?'white':'brand.hover_gray_white', borderColor:'gray.200'}}>
                                            <Flex alignItems={'center'} gap='10px'> 
                                                <Flex w='18px'  onClick={(e) => e.stopPropagation()}> 
                                                    <CustomCheckbox id={`checkbox-${index}`}   isChecked={selectedElements.includes(index)} onChange={() => handleCheckboxChange(index, !selectedElements.includes(index))} />
                                                </Flex>
                                                <Text mt='-6px' transition={'transform .1s ease-in-out'}   transformOrigin="left center" transform={isSelected?'scale(1.02)':'scale(1)'} maxWidth="100%"  flex='1' textOverflow={'ellipsis'} overflow={'hidden'}   whiteSpace={'nowrap'} fontWeight={parseInt(location.pathname.split('/')[location.pathname.split('/').length - 1])  === con.id ?'medium':'normal'} fontSize={'.8em'}>{con.title ? con.title:t('NoDescription')}</Text>
                                            </Flex>
                                    
                                            <Flex ml='28px' justifyContent={'space-between'} alignItems={'end'}>
                                                <StateMap mini state={con.status as Status}/>
                                                <Text mt='5px' fontSize={'.8em'} color='gray' whiteSpace={'nowrap'} >{timeAgo(con.updated_at as string, t_formats)}</Text>
                                            </Flex>                                      
                                        </Box>
                                    </Skeleton>)
                                    })}
                            </Box>
                        </Flex>
                    </MotionBox>
                  

                    }
                </AnimatePresence>

        
        </Flex>

        
        </>)
}

export default ConversationsTable

 

const ChangeViewButton = ({selectedTableSection, setSelectedTabelSection, firstId}:{selectedTableSection:'list' | 'table',setSelectedTabelSection:Dispatch<SetStateAction<'list' | 'table'>>, firstId:number}) => {

    const navigate = useNavigate()
    const sectionsMap = {'list':TbLayoutSidebarFilled, 'table':FaTable}
    const [indicatorStyle, setIndicatorStyle] = useState<{ width: number, left: number }>({ width: 0, left: 0 })

    useEffect(() => {
        const selectedButton = document.getElementById(`section-btn-${selectedTableSection}`)
        if (selectedButton) {
            const { offsetWidth, offsetLeft } = selectedButton
            setIndicatorStyle({ width: offsetWidth, left: offsetLeft })
        }
    }, [selectedTableSection])

    const changeView = (newView:'list' | 'table') => {
        const params = new URLSearchParams(location.search)
        params.set('view', newView)
        navigate(`${location.pathname}?view=${newView}`)
    }



    return (<>
            <Flex position='relative' bg='white' boxShadow={'lg'} borderRadius={'2rem'} p='4px' borderWidth={'1px'} borderColor={'gray.200'}>
            <Flex position='absolute' height='calc(100% - 8px)' bg='brand.gray_1' borderRadius={'2rem'} transition={'all 0.3s ease'} style={{width: `${indicatorStyle.width}px`, left: `${indicatorStyle.left}px`}}/>
            
            {['table', 'list'].map((section, index) => {
                    const isSelected = selectedTableSection === section
                    return (
                        <Flex zIndex={10} alignItems={'center'} color={'black'} key={`secciones-${index}`} id={`section-btn-${section}`} onClick={() => { changeView(section as 'table' | 'list')}}>
                            <Flex bg='transparent' color={isSelected ? 'brand.text_blue' : 'gray.600'} _hover={{ color: 'brand.text_blue' }} px='12px' py='4px'>
                                <Icon boxSize={section === 'list'?'18px':'16px'} as={(sectionsMap as any)[section]}/>
                            </Flex>
                        </Flex>
                    )
                })}
            </Flex>
        </>
    )
}
