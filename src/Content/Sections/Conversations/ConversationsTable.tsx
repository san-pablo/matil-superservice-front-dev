/*
  MAIN CONVERSATIONS FUNCTION (/conversations)
*/

//REACT
import { useState, useEffect, useRef,useMemo,lazy, useCallback, Dispatch, SetStateAction, Suspense, CSSProperties } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../../AuthContext" 
import { useSession } from "../../../SessionContext"
import { useTranslation } from 'react-i18next'
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import fetchData from "../../API/fetchData"
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
//FRONT
import { Flex, Box, Text, Icon, Button, IconButton, Skeleton, Tooltip, Portal, chakra, shouldForwardProp, Avatar,Image, useEditableState } from '@chakra-ui/react'
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
//COMPONENTS
import ActionsButton from "./ActionsButton"
import Table from "../../Components/Reusable/Table"
import StateMap from "../../Components/Reusable/StateMap"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import CustomCheckbox from "../../Components/Reusable/CheckBox"
import FilterButton from "../../Components/Reusable/FilterButton"
import SearchSection from "../../Components/Reusable/SearchSection"
import EditText from "../../Components/Reusable/EditText"
import FilterManager from "../../Components/Reusable/ManageFilters"
//FUNCTIONS
import DetermineConversationViews from "../../MangeData/DetermineConversationViews"
import timeStampToDate from "../../Functions/timeStampToString"
import timeAgo from "../../Functions/timeAgo"
import showToast from "../../Components/Reusable/ToastNotification"
import useOutsideClick from "../../Functions/clickOutside"
import parseMessageToBold from "../../Functions/parseToBold"
import determineBoxStyle from "../../Functions/determineBoxStyle"
//ICONS
import { MdDeselect } from "react-icons/md"
import { FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaRegEdit, FaEye, FaPlus } from 'react-icons/fa'
import { FaArrowRotateLeft, FaMagnifyingGlass, FaTable } from "react-icons/fa6"
import { BiEditAlt } from "react-icons/bi"
import { HiTrash } from "react-icons/hi2"
import { PiSidebarSimpleBold } from "react-icons/pi"
import { TbLayoutSidebarFilled } from "react-icons/tb"
import { IoIosArrowDown } from "react-icons/io"
import { BsThreeDots, BsThreeDotsVertical } from "react-icons/bs"
import { RiEditFill } from "react-icons/ri";
//TYPING
import { Conversations, ConversationColumn, ViewDefinitionType, ConversationsTableProps,  logosMap, defaultViewsType, Channels  } from "../../Constants/typing"
//SECTION
const ConversationResponse = lazy(() => import('./ConversationResponse'))

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//TYPING
type Status = 'new' | 'open' | 'solved' | 'pending' | 'closed'
const validStatuses: Status[] = ['new', 'open', 'solved', 'pending', 'closed']
type boxPosition = {top?:number, bottom?:number, left:number, name:string} | null

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
     else if (column === 'user_id' || column === 'created_by')  {
        const selectedUser = auth?.authData?.users?.[element as string | number]
        return  (
            <Flex fontSize={'.9em'} alignItems={'center'} gap='5px'> 
                {selectedUser?.profile_picture ? <Image src={selectedUser?.profile_picture } h='14px' w='14px' alt={selectedUser.name} /> :
                <Avatar h='16px' w='16px' size={'xs'} name={selectedUser?.name}/> }
                <Text fontSize={'.9em'} fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} >{element === 'matilda' ?'Matilda':element === 'no_user' ? t('NoAgent'):selectedUser?.name}</Text>
            </Flex>
        ) 
    }
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
    else if (column === 'team_uuid') {
        const selectedTeam = auth.authData.teams.find((team) => team.uuid === element)
        return ( <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{selectedTeam ? `${selectedTeam?.emoji} ${selectedTeam?.name}` :t('NoTeam')}</Text>)
    }
    else if (column === 'theme_uuid') {
        const selectedTheme = auth.authData.conversation_themes.find((team) => team.uuid === element)
        return ( <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{selectedTheme ? `${selectedTheme?.emoji} ${selectedTheme?.name}` :t('NoTheme')}</Text>)
    }
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
    else return ( <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>)
}

//MAIN FUNCTION
function ConversationsTable({socket}:{socket:any}) {

    //CONSTANTS
    const { t } = useTranslation('conversations')
    const t_formats = useTranslation('formats').t
    const { getAccessTokenSilently } = useAuth0()
    const auth = useAuth()
    const session= useSession()
    const navigate = useNavigate()
    const tableRef = useRef<HTMLDivElement>(null)
    const location = useLocation()
    const currentSearch = location.search
    const columnsConversationsMap:{[key in ConversationColumn]:[string, number]} = {local_id: [t('local_id'), 50], status:  [t('status'), 100], channel_type: [t('channel_type'), 100], theme_uuid:  [t('theme'), 200], team_uuid:[t('Team'), 150], tags:[t('tags'), 200], user_id: [t('user_id'), 200], created_at: [t('created_at'), 150],updated_at: [t('updated_at'), 180], solved_at: [t('solved_at'), 150],closed_at: [t('closed_at'), 150],title: [t('title'), 300], unseen_changes: [t('unseen_changes'), 200],  call_status: [t('call_status'), 150], call_duration: [t('call_duration'), 150], }
    const defaultViewsDict:{[key in defaultViewsType]:ViewDefinitionType} = {
        'my_inbox':{uuid:'my_inbox', name:'my_inbox', emoji:'', filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'user_id', op:'eq', val:auth.authData.userId }] }]} },
        'created_by_me':{uuid:'created_by_me', name:'created_by_me', emoji:'', filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'created_by', op:'eq', val:auth.authData.userId }] }]} },
        'bin':{uuid:'bin', name:'bin', emoji:'', filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'user_id', op:'eq', val:'{user_id}' }] }]} },
        'mentions':{uuid:'mentions', emoji:'', name:'mentions', filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'user_id', op:'eq', val:'{user_id}'}] }]}},
        'all':{uuid:'all', emoji:'', name:'all', filters:{logic:'AND', groups:[]}},
        'unassigned':{uuid:'unassigned', name:'unassigned', emoji:'', filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'user_id', op:'eq', val:'no_user' }] }]}},
        'matilda':{uuid:'matilda', emoji:'',name:'matilda', filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'user_id', op:'eq', val:'matilda' }] }]}},
    }

    //REFS 
    const conversationContainerRef = useRef<HTMLDivElement>(null)
    const tableContainerRef = useRef<HTMLDivElement>(null)
    const changeViewButtonRef = useRef<HTMLDivElement>(null)
    useOutsideClick({ref1:conversationContainerRef,  ref2:tableContainerRef, ref3:changeViewButtonRef,  onOutsideClick:() => navigate(`/conversations${currentSearch}`)})

    //TABLE SECTION
    const [isConversationOpened,setIsConversationOpened] = useState<boolean>(location.pathname.split('/')[location.pathname.split('/').length - 2] === 'conversation')
    const [selectedTableSection, setSelectedTabelSection] = useState<'table' | 'list'>('table')
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        params.set('view', 'table')
        navigate(`${location.pathname}?view=${'table'}`)
    }, [])
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const view = params.get('view')
        setSelectedTabelSection(view as any)
        setIsConversationOpened(location.pathname.split('/')[location.pathname.split('/').length - 2] === 'conversation' || view === 'list')
    }, [location.search, location.pathname])

    //SHOW SEARCH SECTION
    const [showSearch, setShowSearch] = useState<boolean>(false)

    //SHOW AND HIDE VIEWS
    const [hideViews, setHideViews] = useState<boolean>(false)

    //WAIT INFO AND FORCE TH REUPDATE OF THE TABLE ON DELETE
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)
    const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

    //CONVERSATION DATA AND SELECTED VIEW
    const [conversations, setConversations] = useState<Conversations | null>(null)
    const conversationsRef = useRef(conversations);
    useEffect(() => {conversationsRef.current = conversations}, [conversations])

    //VIEWS LOGIC
    const [selectedView, setSelectedView] = useState<{type:string, view:ViewDefinitionType}>((localStorage.getItem('currentConversationSection') && JSON.parse(localStorage.getItem('currentConversationSection') as string)) || {type:'std', view:defaultViewsDict.my_inbox})
    const selectedViewRef = useRef<{type:string, view:ViewDefinitionType}>({type:'std', view:defaultViewsDict.my_inbox})
    useEffect(() => {selectedViewRef.current = selectedView},[selectedView])

    //TABLE LOGIC
    const allConversationsIdsRef = useRef<number[]>([])
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
 
    //PAGE INDEX AND STATUS FILTEER
    const isRetrievingData = useRef<boolean>(false)
    const [pageIndex, setPageIndex ] = useState<number>(1) 
    const pageIndexRef = useRef<number>(1) 
    useEffect(() => {pageIndexRef.current = pageIndex}, [pageIndex])
    const [statusFilter, setStatusFilter] = useState<string[]>([])
    const toggleChannelsList = (element: Channels) => {
        const statusList = statusFilter
        if (statusList.includes(element)) setStatusFilter(statusList.filter(e => e !== element))
        else setStatusFilter([...statusList, element])
    }

    //SOCKET FOR RELOADING VIEWS ON A NEW CONVERSATION
    useEffect(() => {
        localStorage.setItem('currentSection', 'conversations')
        socket?.current.on('conversation', (data:any) => {
             const editTable = async () => {

                    const currentCount = auth.authData?.views?.count as {std:{[key:string]:number}, teams:{[key:string]:number}, custom:{[key:string]:number}}

                     const incrementCount = (category: 'std' | 'teams' | 'custom', type: 'substract' | 'sum', uuid: string) => {
                        if (currentCount?.[category]?.[uuid]) {
                            if (type === 'sum') currentCount[category][uuid] = (currentCount?.[category]?.[uuid] || 0) + 1
                            else currentCount[category][uuid] = (currentCount?.[category]?.[uuid] || 0) - 1
                        }
                    }
                      
                    const updateCounts = (previousViews: any[], newViews: any[], category: 'std' | 'teams' | 'custom') => {
                        for (const view of previousViews) {incrementCount(category, 'substract', view.uuid)}
                        for (const view of newViews) {incrementCount(category, 'sum', view.uuid)}
                    }
                      
                      
                    //EDIT STD VIEWS
                    const defaultViews = Object.values(defaultViewsDict)
                    const previousStdViews = DetermineConversationViews(data?.previous_data, defaultViews, auth.authData?.userId || '')
                    const newStdViews = DetermineConversationViews(data?.new_data, defaultViews, auth.authData?.userId || '')
                    updateCounts(previousStdViews, newStdViews, 'std')

                     //EDIT TEAMS VIEWS
                    const teamsViews = auth.authData.teams.map((team) => {return {uuid:team.uuid, name:team.name, emoji:team.emoji, filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'team_uuid', op:'eq', val:team.uuid }] }]}} as ViewDefinitionType } )
                    const previousTeamViews = DetermineConversationViews(data?.previous_data, teamsViews, auth.authData?.userId || '')
                    const newTeamViews = DetermineConversationViews(data?.new_data, teamsViews, auth.authData?.userId || '')
                    updateCounts(previousTeamViews, newTeamViews, 'teams')
                    
                    //EDIT CUSTOM VIEWS
                    const previousViews = DetermineConversationViews(data?.previous_data, auth.authData.views?.definitions as ViewDefinitionType[], auth.authData?.userId || '')
                    const newViews = DetermineConversationViews(data?.new_data, auth.authData.views?.definitions as ViewDefinitionType[], auth.authData?.userId || '')
                    updateCounts(previousViews, newViews, 'custom')

                     auth.setAuthData({views:{...auth.authData.views as any, count: currentCount}})
                    const combinedViews = [...previousStdViews, ...newStdViews, ...previousTeamViews, ...newTeamViews, ...previousViews, ...newViews]
                    
                     for (const view of combinedViews) {
                        if (view === selectedViewRef.current.view.uuid) {
                            isRetrievingData.current = true
                            const newData = data.new_data
                            delete newData.messages
                            delete newData.scheduled_messages
                            delete newData.state
                            console.log(newData)
                            setConversations((prevConversations) => ({...prevConversations as Conversations, page_data: (prevConversations as Conversations)?.page_data.map((conversation) =>conversation.id === data.new_data.id ? newData : conversation)}) )
                            isRetrievingData.current = false
                            break
                        }
                    }
            }
            editTable()
        })
    },[JSON.stringify(auth.authData.organizationId)])

    useEffect(() => {if (location.pathname.endsWith('conversations')) document.title = `${t('Conversations')} - ${selectedView.view?.name} - ${auth.authData.organizationName} - Matil`},[selectedView, location])
   
    //FETCH NEW DATA WHEN THE VIEW CHANGE
    useEffect(() => {
        setSelectedElements([])
        const fetchConversationData = async() => {

            //CLEAR THE FILTERS
            setPageIndex(1)
            setSelectedIndex(-1)
                
            //CALL THE BIN
            if (selectedView.type === 'deleted') {
                const response1 = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/bin`, getAccessTokenSilently, setValue:setConversations, setWaiting:setWaitingInfo, params:{page_index:1}, auth})
            }
            //CALL A NORMAL CONVERSATIONS VIEW
            else {
                const response2 = await fetchData({endpoint:`${auth.authData.organizationId}/conversations`, getAccessTokenSilently, setValue:setConversations, setWaiting:setWaitingInfo, params:{page_index:1, filters:selectedView.view?.filters}, auth})
            }
        
        }
        fetchConversationData()
    }, [selectedView])

    //NAVIGATE TO THE CLICKED CONVERSATIONS AND SHOW IT IN THE HEADER
    const [selectedElements, setSelectedElements] = useState<number[]>([])
    const handleClickRow  = (row:ConversationsTableProps, index:number) => {
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
        const direction = (selectedView?.view.sort?.column === key && selectedView?.view.sort.order === 'asc') ? 'desc' : 'asc'
        setSelectedView(prev => ({...prev, sort:{column:key as ConversationColumn, order:direction}}))
    }
    const getSortIcon = (key: string) => {
        if (selectedView?.view?.sort?.column === key) { 
            if (selectedView?.view?.sort.order === 'asc') return true
            else return false
        }
        else return null    
    }
    const handleCheckboxChange = useCallback((element:number, isChecked:boolean) => {
        if (selectedElements && setSelectedElements) {
            if (isChecked)setSelectedElements(prevElements=> [...prevElements, element])
            else setSelectedElements(prevElements => prevElements.filter(el => el !== element))
        }
    }, [selectedElements, setSelectedElements])
    
    //SHORTCUTS DEFINITION
    useEffect(() => {
        const handleKeyDown = (event:KeyboardEvent) => {
              switch (event.code) {           
                case 'Escape':
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
    const fetchConversationsDataWithFilter = async (pageIndex:number | null) => {
        setSelectedElements([])
        //CHOOSE CONFIGURATION DEPENDING ON ITS BIN OR A NORMAL VIEW
        let endpoint = `${auth.authData.organizationId}/conversations`
        if (selectedView.type === 'deleted') {endpoint = `${auth.authData.organizationId}/conversations/bin`}
        
        //API CALL
        const response = await fetchData({endpoint, getAccessTokenSilently, params:{page_index:pageIndex?pageIndex:pageIndexRef.current, filters:selectedView.view?.filters}, auth})
         if (response?.status === 200) {
            setConversations(prev => ({...prev as any, page_data: [...prev?.page_data as any[], ...response.data.page_data]}) )
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
    
    //COMPONENT FOR CONFIRM A CONVERSATIONS DELETION
    const memoizedConfirmDeleteBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowConfirmDelete}> 
            <ConfirmDeleteBox />
        </ConfirmBox>
    ), [showConfirmDelete])
 
  

    //COMPONENTS WIDTHS
    const tableWidthHideView =`calc(100vw - 45px)`  
    const tableWidthShowView =`calc(100vw - 45px - 220px)`  
    const listWidthHideView =`calc(100vw - 45px - ${Math.min(window.innerWidth * 0.6, window.innerWidth - 500)}px)`  
    const listWidthShowView =`calc(100vw - 45px - ${Math.min(window.innerWidth * 0.6, window.innerWidth - 500)}px - 220px)`  

    //FRONT
    return(<>
          
            {/* SHOW SEARCH SECTION */}
            {showSearch && <SearchSection selectedSection="conversations" hideSideBar={hideViews} setHideSideBar={setHideViews}/>}

            {/* CONFIRM THE DELETION OF BIN CONVERSATIONS */}
            {showConfirmDelete && memoizedConfirmDeleteBox}

            {/* CHANGE VIEW BUTTON */}
            <Box position='fixed' ref={changeViewButtonRef} zIndex={100} bottom={(selectedElements.length !== 0 && selectedTableSection === 'table') ? 'calc(60px + 1vw)':'1vw'} left={hideViews?'calc(45px + 2vw)':'calc(45px +  220px + 2vw)'}transition={'left 0.2s ease-in-out, bottom .1s ease-in-out'}> 
                 <ChangeViewButton selectedTableSection={selectedTableSection}/>
            </Box>

            {/* ACTIONS AND SHOW TABLE */}
            <Suspense fallback={<></>}>    
                <AnimatePresence>
                    {(isConversationOpened ) && 
                    <MotionBox ref={conversationContainerRef} overflowY={'scroll'} w={Math.min(window.innerWidth * 0.6, window.innerWidth - 500)} initial={{ right: -25  + 'px', opacity: isConversationOpened ||selectedTableSection === 'list'?0:1}} animate={{ right: 0,  opacity: isConversationOpened ||selectedTableSection === 'list'?1:0  }} exit={{ right:-25 ,  opacity: isConversationOpened ||selectedTableSection === 'list'?0:1}} transition={{ duration: '.125', ease: 'easeOut'}} 
                    bg='white' top={0} minHeight="100vh" maxHeight="100vh" boxShadow={"-4px 0 6px -2px rgba(0, 0, 0, 0.1)"} borderLeftColor={'gray.200'} borderLeftWidth={'1px'} right={0} pointerEvents={isConversationOpened ||selectedTableSection === 'list' ?'auto':'none'} height={'100vh'}   position='absolute' zIndex={100} overflow={'hidden'} >
                            <ConversationResponse socket={socket} fetchConversationsDataWithFilter={fetchConversationsDataWithFilter} />
                    </MotionBox>}
                </AnimatePresence>
            </Suspense>
            
            {/* SECTION */}
            <Flex position={'relative'} width={'calc(100vw - 45px)'} bg='brand.hover_gray' height={'100vh'}> 
 
                {/* VIEWS SELECTION */}
                <ViewsSideBar hideViews={hideViews} setShowSearch={setShowSearch} selectedView={selectedView} setSelectedView={setSelectedView} isRetrievingData={isRetrievingData.current}/>

                {/* ACTIONS AND SHOW TABLE */}
                <AnimatePresence >

                    {selectedTableSection === 'list' ?
                           <MotionBox key="list-section" initial={{opacity:0}} animate={{opacity:1}}  exit={{opacity:0}}  transition={{ duration: '.2',  ease: 'easeInOut'}} > 
                           <Flex h='100vh' bg='brand.hover_gray' flexDir={'column'} width={hideViews ? listWidthHideView:listWidthShowView} transition={'width ease-in-out .2s'} >
   
                               <Flex px='1vw' pt='2vh' justifyContent={'space-between'} gap='15px'>
                                   <Flex flex={1} gap='10px' alignItems={'center'}> 
                                       <Tooltip  label={t('HideViews')}  placement='right'  bg='white' color='black'  borderRadius='.5rem' fontSize='.7em' p='6px'> 
                                           <IconButton bg='transparent'  _hover={{bg:'brand.gray_1', color:'brand.text_blue'}} icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'18px'}/>} variant={'common'}  h='28px' w='28px' aria-label="create-function" size='xs' onClick={() => setHideViews(prev => (!prev))} />
                                       </Tooltip>
                                       <Text flex='1' minW={0} fontWeight={'medium'} fontSize={'1.2em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}> <Box as="span" mr="1">{selectedView?.view.emoji}</Box> {selectedView.type === 'std' ? t(selectedView?.view.name):selectedView?.view.name}</Text>
                                   </Flex>
                               </Flex>
                               <Flex px='1vw' mb='1vh' height={'20px'}  mt='2vh' alignItems={'end'} justifyContent={'space-between'}  > 
   
                                   <Skeleton isLoaded={!waitingInfo} >
                                       <Text  whiteSpace={'nowrap'}  fontWeight={'medium'} color='gray.600' > {t('ConversationsCount', {count:(conversations?.total_items || 0)})}</Text> 
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
                                       <Skeleton key={`conversation-${index}`} isLoaded={!waitingInfo}> 
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
                    :
                    <MotionBox key="table-section" initial={{opacity:0}}  animate={{opacity:1}} exit={{opacity:0}}   transition={{ duration: '0.2',  ease: 'easeInOut'}} > 
                        <Flex bg='brand.hover_gray' h='100vh' flexDir={'column'} width={hideViews ? tableWidthHideView:tableWidthShowView} minW={hideViews ? tableWidthHideView:tableWidthShowView} transition={'width ease-in-out .2s, min-width ease-in-out .2s'} right={0}   position="absolute" top={0} >
                            
                            <Flex px='2vw' pt='2vh' justifyContent={'space-between'} gap='15px'>
                                <Flex flex={1} gap='10px' alignItems={'center'}> 
                                    <Tooltip  label={t('HideViews')}  placement='right'  bg='white' color='black'  borderRadius='.5rem' fontSize='.7em' p='6px'> 
                                        <IconButton bg='transparent' _hover={{bg:'brand.gray_1', color:'brand.text_blue'}} icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'18px'}/>} variant={'common'}  h='28px' w='28px' aria-label="create-function" size='xs' onClick={() => setHideViews(prev => (!prev))} />
                                    </Tooltip>
                                    <Text flex='1' minW={0} fontWeight={'medium'} fontSize={'1.2em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}> <Box as="span" mr="1">{selectedView?.view.emoji}</Box> {selectedView.type === 'std' ? t(selectedView?.view.name):selectedView?.view.name}</Text>
                                </Flex>
                                <ActionsButton items={conversations?.page_data} view={selectedView} section={'conversations'} />
                            </Flex>
                                        
                            <Flex px='2vw' mb='2vh' mt='2vh' ref={tableRef}  alignItems={'end'} justifyContent={'space-between'}  > 
                                <FilterButton   selectedElements={statusFilter} setSelectedElements={(element) => toggleChannelsList(element as Channels)} selectedSection="status"/>
                            </Flex>
                            
                            <Box ref={tableContainerRef}> 
                                <Table onFinishScroll={() => fetchConversationsDataWithFilter(pageIndex + 1)} numberOfItems={conversations?.total_items} height={selectedElements.length > 0 ? window.innerHeight * 0.98   - (tableRef.current?.getBoundingClientRect().bottom || 0) - 85 - window.innerWidth * 0.02:undefined } data={conversations?.page_data} CellStyle={CellStyle} noDataMessage={t('NoConversations')} requestSort={requestSort} getSortIcon={getSortIcon} columnsMap={columnsConversationsMap} 
                                excludedKeys={['id', 'uuid', 'conversation_id', 'contact_id',  'state', 'is_matilda_engaged', 'organization_id',  'call_sid', 'call_url', 'channel_id', 'cdas' ] } onClickRow={handleClickRow} selectedElements={selectedElements} setSelectedElements={setSelectedElements} onSelectAllElements={() => {}} currentIndex={selectedIndex} waitingInfo={waitingInfo}/>
                            </Box>
                        </Flex>
                    </MotionBox> 

                    }
                </AnimatePresence>

                {/* SHOW TABLE ACTIONS*/}
                <AnimatePresence> 
                    {(selectedElements.length > 0 && selectedTableSection === 'table') && 
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
            </Flex>
        </>)
}

export default ConversationsTable

//BUTTON FOR CHANCING BETWEEN TABLE AND LIST VIEW
const ChangeViewButton = ({selectedTableSection}:{selectedTableSection:'list' | 'table'}) => {

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
                            <Flex bg='transparent' color={isSelected ? 'black' : 'gray.600'} _hover={{ color: 'brand.text_blue' }} px='12px' py='4px'>
                                <Icon boxSize={section === 'list'?'18px':'16px'} as={(sectionsMap as any)[section]}/>
                            </Flex>
                        </Flex>
                    )
                })}
            </Flex>
        </>
    )
}

//VIEWS SIDEBAR
const ViewsSideBar = ({hideViews, setShowSearch, selectedView, setSelectedView, isRetrievingData}:{hideViews:boolean, setShowSearch:Dispatch<SetStateAction<boolean>>,selectedView:{type:string, view:ViewDefinitionType},setSelectedView:Dispatch<SetStateAction<{type:string, view:ViewDefinitionType}>> ,isRetrievingData:boolean}) => {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('conversations')
    const { getAccessTokenSilently } = useAuth0()
    const defaultViewsDict:{[key in defaultViewsType]:ViewDefinitionType} = {
        'my_inbox':{uuid:'my_inbox', name:'my_inbox', emoji:'', filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'user_id', op:'eq', val:auth.authData.userId }] }]} },
        'created_by_me':{uuid:'created_by_me', name:'created_by_me', emoji:'', filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'created_by', op:'eq', val:auth.authData.userId }] }]} },
        'bin':{uuid:'bin', name:'bin', emoji:'', filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'user_id', op:'eq', val:'{user_id}' }] }]} },
        'mentions':{uuid:'mentions', emoji:'', name:'mentions', filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'user_id', op:'eq', val:'{user_id}'}] }]}},
        'all':{uuid:'all', emoji:'', name:'all', filters:{logic:'AND', groups:[]}},
        'unassigned':{uuid:'unassigned', name:'unassigned', emoji:'', filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'user_id', op:'eq', val:'no_user' }] }]}},
        'matilda':{uuid:'matilda', emoji:'',name:'matilda', filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'user_id', op:'eq', val:'matilda' }] }]}},
    }
    //EDIT VIEWS FOLDERS ORDER 
    const viewsButtonRef = useRef<HTMLButtonElement>(null)
    const viewsBoxRef = useRef<HTMLDivElement>(null)
    const [showEditViews, setShowEditViews] = useState<boolean>(false)
    const [showCreateFolder, setShowCreateFolder] = useState<boolean>(false)
    useOutsideClick({ref1:viewsButtonRef, ref2:viewsBoxRef, onOutsideClick:setShowEditViews})
    const updateViewOrder = async (action:'edit' | 'delete' | 'add', type: 'std' | 'folder' | 'custom', name:string, value:boolean) => {        
        let newViewConfig:any
        const currentOrder = auth.authData.views?.configuration as any

        if (action === 'edit') {
            if (type === 'std') {
                const stdIndex = (currentOrder?.std || []).findIndex((folder:any) => folder.name === name)
                if (stdIndex !== -1) (currentOrder.std || [])[stdIndex].show = value
                else return
            }
            else if (type === 'folder') {
                const folderIndex = currentOrder.folders.findIndex((folder:any) => folder.name === name)
                if (folderIndex !== -1) currentOrder.folders[folderIndex].show = value
                else return
            }
        }
        else if (action === 'delete') {
            currentOrder.folders = currentOrder.folders?.filter((folder:any) => folder.name !== name) || [];
        }
        else if (action === 'add') {
            currentOrder.folders = [...currentOrder.folders, {name, show:value, content:[]}]
        }
        setShowEditViews(false)
        console.log(currentOrder)
        auth.setAuthData({views:{...auth.authData.views as any, configuration:currentOrder }})
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/user/views_configuration`,  method:'put', getAccessTokenSilently,   requestForm:{views_configuration:currentOrder}, auth})
    }   

    //FOLDERS LOGIC
    const [openedFolders, setOpenedFolders] = useState<string[]>(auth.authData.views?.definitions?.map((def) => {return def.name}) || [])
    const toggleFolders = (element: string) => {
        const currentOpenedFolders = openedFolders
        if (currentOpenedFolders.includes(element)) setOpenedFolders(currentOpenedFolders.filter(e => e !== element))
        else setOpenedFolders([...currentOpenedFolders, element])
    }
    const [dragEnabled, setDragEnabled] = useState<{ [key: string]: boolean }>({})
    const activateDrag = (index: number) => {setDragEnabled((prev) => ({ ...prev, [index]: true }))}
    const onDragEnd = async (result:any) => {
        if (!result.destination) return
        const items = auth.authData.views?.configuration.folders || []
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)
        
        auth.setAuthData({views:{...auth.authData.views as any, configuration:{...auth.authData.views?.configuration as any, folders:items} }})
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/user/views_configuration`,  method:'put', getAccessTokenSilently,  requestForm:{views_configuration:{...auth.authData.views?.configuration as any, folders:items}}, auth})
    }

    //CREATE NEW VIEWS FOLDER
    const CreateFolderBox = () => {

        const [name, setName] = useState<string>('')
       
        return (
            <Box p='15px'>  
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('CreateFolder')}</Text>
                <Text mt='2vh' mb='2vh' color='gray.600' fontSize={'.8em'}>{t('CreateFolderWarning')}</Text>

                <EditText placeholder={t('Name')} hideInput={false} value={name} setValue={(value:string) => setName(value)}/>
                <Flex mt='3vh' gap='15px' flexDir={'row-reverse'}>
                    <Button  size='sm'variant={'main'} onClick={() => {setShowCreateFolder(false);updateViewOrder('add', 'folder', name, true)}}>{t('CreateFolder')}</Button>
                    <Button  size='sm'variant={'common'} onClick={() => setShowCreateFolder(false)}>{t('Cancel')}</Button>
                </Flex>
            </Box>  
        )
    }

    //MEMOIZED CREATE NEW VIEWS FOLDER
    const memoizedCreateFolderBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowCreateFolder}> 
            <CreateFolderBox />
        </ConfirmBox>
    ), [showCreateFolder])
   

    return (<>

        {/* SHOW CREATE NEW FOLDER */}
        {showCreateFolder && memoizedCreateFolderBox}
 
        {/* SHOW SEARCH SECTION */}
        <AnimatePresence>
            {showEditViews && 
            <Portal> 
                <MotionBox ref={viewsBoxRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                style={{ transformOrigin: 'bottom left' }}  minW='190px'  position='absolute' bg='white' p='10px' left={`${(viewsButtonRef.current?.getBoundingClientRect().right || 0) + 10}px`} bottom={window.innerHeight - (viewsButtonRef.current?.getBoundingClientRect().bottom || 0)} zIndex={100000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='gray.200' borderWidth='1px' borderRadius='.5rem'>
                    <Text fontSize={'.8em'} mb='1vh' fontWeight={'medium'}>{t('InboxFolders')}</Text>
                    {auth.authData.views?.configuration.std.filter(view => view.name !== 'bin').map((folder, index) => (
                        <Flex key={`view-${index}`} alignItems={'center'} color={folder.show ? 'brand.text_blue':'gray.600'} gap='10px' bg={'transparent'}  justifyContent='space-between' onClick={() => updateViewOrder('edit', 'std', folder.name, !folder.show)} _hover={{bg:'brand.gray_2'}}   fontSize={'.8em'} cursor={'pointer'} borderRadius={'.5rem'} p='6px'>
                            <Text fontWeight={'medium'} transition={'transform .1s ease-in-out'}   transformOrigin="left center" whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{t(folder.name)}</Text>
                            <Icon as={FaEye}/>
                        </Flex>
                    ))}
                    <Box mt='2vh' mb='2vh' bg='gray.200' h='1px' w='100%'/>

                    <Text fontSize={'.8em'} mb='1vh' fontWeight={'medium'}>{t('Folders')}</Text>
                    <Flex alignItems={'center'}   color={auth.authData.views?.configuration.folders.find(folder => folder.name === 'views')?.show ? 'brand.text_blue':'gray.600'}  gap='10px' bg={'transparent'}  justifyContent='space-between'  onClick={() => updateViewOrder('edit', 'folder', 'views', !auth.authData.views?.configuration.folders.find(folder => folder.name === 'views')?.show )} _hover={{bg:'brand.gray_2'}}   fontSize={'.8em'} cursor={'pointer'} borderRadius={'.5rem'} p='6px'>
                        <Text fontWeight={'medium'} transition={'transform .1s ease-in-out'} transformOrigin="left center" whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{t('views')}</Text>
                        <Icon as={FaEye}/>
                    </Flex>
                    <Flex alignItems={'center'}  color={auth.authData.views?.configuration.folders.find(folder => folder.name === 'teams')?.show ? 'brand.text_blue':'gray.600'} gap='10px' bg={'transparent'}  justifyContent='space-between'  onClick={() => updateViewOrder('edit', 'folder', 'teams', !auth.authData.views?.configuration.folders.find(folder => folder.name === 'teams')?.show)} _hover={{bg:'brand.gray_2'}}   fontSize={'.8em'} cursor={'pointer'} borderRadius={'.5rem'} p='6px'>
                        <Text fontWeight={'medium'}  transition={'transform .1s ease-in-out'} transformOrigin="left center" whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{t('teams')}</Text>
                        <Icon as={FaEye}/>
                    </Flex>
                    
                    {(auth.authData.views?.configuration.folders.filter(view => (view.name !== 'teams' && view.name !== 'views'))?.length || 0) > 0 && <>
                    <Box mt='2vh' mb='2vh' bg='gray.200' h='1px' w='100%'/>
                    <Text fontSize={'.8em'} fontWeight={'medium'}>{t('CustomFolders')}</Text>
                    {auth.authData.views?.configuration.folders.filter(view => (view.name !== 'teams' && view.name !== 'views')).map((folder, index) => (
                        <Flex alignItems={'center'}  gap='10px' bg={'transparent'}  justifyContent='space-between' key={`shared-view-${index}`} onClick={() => updateViewOrder('edit', 'folder', folder.name, !folder.show)} _hover={{bg:'brand.gray_2'}}   fontSize={'.8em'} cursor={'pointer'} borderRadius={'.5rem'} p='6px'>
                            <Text  transition={'transform .1s ease-in-out'}   transformOrigin="left center" whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{folder.name}</Text>
                            <Icon color={folder.show ? 'brand.text_blue':'gray.600'} as={FaEye}/>
                        </Flex>
                    ))}
                    </>}

                    <Box mt='2vh' mb='2vh' bg='gray.200' h='1px' w='100%'/>

                    <Flex gap='10px'   alignItems={'center'} cursor={'pointer'} _hover={{color:'brand.text_blue'}} onClick={() => {setShowCreateFolder(true); setShowEditViews(false)}}>
                        <Button w='100%' bg='transparent' variant={'common'} size='xs' leftIcon={<FaPlus/>}>{t('CreateFolder')}</Button>
                    </Flex>

                </MotionBox>
            </Portal>}
        </AnimatePresence>
        
        <Flex zIndex={10} overflow={'hidden'}borderRightColor={'gray.200'} borderRightWidth={'1px'}  width={hideViews ? 0:220}transition={'width ease-in-out .2s'}  gap='20px' py='2vh' flexDir={'column'} justifyContent={'space-between'} >
            <Flex justifyContent={'space-between'} w='calc(220px)' flexDir={'column'} flex='1' minH={0}>  
                
                <Box px='1vw' > 
                    <Flex  alignItems={'center'} justifyContent={'space-between'}> 
                        <Text  fontWeight={'semibold'} fontSize={'1.2em'}>{t('Inbox')}</Text>
                        <IconButton bg='transparent' _hover={{bg:'brand.gray_1', color:'brand.text_blue'}} onClick={() => setShowSearch(true)} borderColor={'gray.200'} borderWidth={'1px'} variant={'common'}  h='28px' w='28px' aria-label="create-function" size='xs'>
                        <Tooltip  label={t('Search') + '...'}  placement='right'  bg='white' color='black'  borderRadius='.5rem' fontSize='.7em' p='6px'> 
                            <Box display="flex" h='100%' w='100%' alignItems="center" justifyContent="center" transition="transform .5s ease-in-out"  _hover={{}} >
                                <FaMagnifyingGlass size="14px" />
                            </Box>
                        </Tooltip>
                        </IconButton>
                    </Flex>
                    <Box h='1px' w='100%' bg='gray.300' mt='2vh' mb='2vh'/>
                </Box>

                <Box height={'100px'} flex='1' overflow={'scroll'}  px='1vw'>
                    {auth.authData.views?.configuration.std.filter(view => view.name !== 'bin').map((view, index) => {
                        const isSelected = selectedView.type === 'std' && selectedView.view.uuid === view.name
                        return (<> 
                            {view.show && 
                                <Flex gap='10px'  borderColor={isSelected ? 'gray.200':'transparent'}  fontWeight={isSelected? 'medium':'normal'} bg={isSelected?'white':'transparent'}  transition={isSelected?'box-shadow .2s ease-in-out, border-color .2s ease-in-out, background-color .2s ease-in-out':'box-shadow .2s ease-out, border-color .2s ease-out, background-color .2s ease-out'}    boxShadow={isSelected ? '0 0 3px 0px rgba(0, 0, 0, 0.1)':''} borderWidth={'1px'}  justifyContent='space-between' key={`shed-view-${index}`} onClick={() => {if (!isRetrievingData) setSelectedView({type:'std', view:defaultViewsDict[view.name] }); localStorage.setItem('currentView', JSON.stringify({index:index, type:'shared', name:view.name}))}} _hover={{bg:isSelected?'white':'brand.gray_2'}}   fontSize={'.9em'} cursor={'pointer'} borderRadius={'.5rem'} p='6px'>
                                    <Text  transition={'transform .1s ease-in-out'}   transformOrigin="left center" transform={isSelected?'scale(1.02)':'scale(1)'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}   overflow={'hidden'}>{t(view.name)}</Text>
                                    <Text fontWeight={'medium'}>{auth.authData.views?.count?.std?.[view.name as any] || 0}</Text>
                                </Flex>
                            }</>)
                        })}  

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="columns" direction="vertical">
                                {(provided) => (
                                    <Box ref={provided.innerRef} {...provided.droppableProps} >
                                        {auth.authData.views?.configuration.folders.map((folder, index) => {
                                            return (<> 
                                                {folder.show && 
                                                    <Draggable  isDragDisabled={!dragEnabled[index]} key={`view-${index}`} draggableId={`column-view-${index}`} index={index}>
                                                        {(provided, snapshot) => (
                                                            <Box mt='1vh' ref={provided.innerRef}  {...provided.draggableProps} {...provided.dragHandleProps}> 
                                                                <ViewFolder  activateDrag={() => activateDrag(index)} section={folder.name} childrenViews={folder?.content || []} isOpened={openedFolders.includes(folder.name)} setIsOpened={toggleFolders} selectedView={selectedView} setSelectedView={setSelectedView}/>
                                                            </Box>
                                                        )}
                                                    </Draggable>
                                                }</>)
                                            })} 
                                        {provided.placeholder}
                                    </Box>
                                )}
                            </Droppable>
                        </DragDropContext>                               
                </Box>
            </Flex>
            <Box px='1vw'  w='220px'>
                <Flex gap='10px' color='red' boxShadow={selectedView.type === 'deleted' ?'0 0 3px 0px rgba(0, 0, 0, 0.1)':''} borderWidth={'1px'} borderColor={selectedView.type === 'deleted' ? 'gray.200':'transparent'} justifyContent='space-between'  onClick={() => {if (!isRetrievingData) setSelectedView({type:'deleted', view:{uuid:'bin', name:t('Trash'), emoji:'', filters:{logic:'AND', groups:[]}}} ); localStorage.setItem('currentView', JSON.stringify({type:'deleted', view:{uuid:'bin', name:t('Trash'), emoji:'', filters:{logic:'AND', groups:[]}}}))}} _hover={{bg:selectedView.type === 'deleted'? 'white':'brand.gray_2'}}  bg={selectedView.type === 'deleted'?'white':'transparent'}   transition={selectedView.type === 'deleted'?'box-shadow .2s ease-in-out, border-color .2s ease-in-out, background-color .2s ease-in-out':'box-shadow .2s ease-out, border-color .2s ease-out, background-color .2s ease-out'}  fontWeight={selectedView.type === 'deleted'?  'medium':'normal'}fontSize={'.9em'} cursor={'pointer'} borderRadius={'.5rem'} p='6px'>
                    <Flex gap='10px' alignItems={'center'}> 
                        <Icon boxSize={'15px'} as={HiTrash}/>
                            <Text mt='2px' transition={'transform .1s ease-in-out'}   transformOrigin="left center" transform={selectedView.type === 'deleted' ?'scale(1.02)':'scale(1)'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}   overflow={'hidden'}>{t('Trash')}</Text>
                        </Flex>
                    <Text>{auth.authData.views?.count?.std['bin'] || 0}</Text>
                </Flex>
                <Box width={'100%'} mt='2vh' mb='2vh' height={'1px'} bg='gray.300' />
                <Button ref={viewsButtonRef} justifyContent={'start'} size='sm'variant={'common'} fontSize={'.9em'}  onClick={() => {setShowEditViews(true)}} leftIcon={<FaRegEdit/>} bg='transparent'>{t('EditViews')}</Button>
            </Box>
        </Flex>
    </>)
}

//COMPONENT OF A FOLDER
const ViewFolder = ({section, isOpened, setIsOpened, childrenViews, selectedView, setSelectedView, activateDrag}:{section:string, isOpened:boolean, setIsOpened:(section:string) => void, childrenViews:string[], selectedView:{type:string, view:ViewDefinitionType}, setSelectedView:Dispatch<SetStateAction<{type:string, view:ViewDefinitionType}>>, activateDrag:() => void}) => {
        
    //CONSTANTS
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()
    const { t } = useTranslation('conversations')
  
    //SETTINGS BUTTON REF
    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null) 
    useOutsideClick({ref1:boxRef, onOutsideClick:(value:boolean) => {setShowEdit(false)}})

    const [showEdit, setShowEdit] = useState<boolean>(false)
    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef, setBoxStyle, boxPosition:'none', changeVariable:showEdit})

    //CREATE OR EDIT VIEW 
    const [viewUuid, setViewUuid] = useState<string | null>(null)

    //IS HOVERING
    const [isHovering, setIsHovering] = useState<boolean>(false)
 
    //DETERMINE THE TOOLS BOX POSOTION
   
    //EDIT FUNCTIONS ORDER
    const [dragEnabled, setDragEnabled] = useState<{ [key: string]: boolean }>({})
    const activateChildrenDrag = (index: number) => {setDragEnabled((prev) => ({ ...prev, [index]: true }))}
    const onDragEnd = async (result: any) => {
        if (!result.destination) return
        const folders = auth.authData.views?.configuration.folders || []
        const folderIndex = folders.findIndex(folder => folder.name === section)
        if (folderIndex === -1) return
        const items = [...folders[folderIndex].content]

        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)
        const updatedFolders = folders.map((folder, index) =>index === folderIndex ? { ...folder, content: items } : folder)
        auth.setAuthData({views: {...auth.authData.views as any, configuration: {...auth.authData.views?.configuration as any, folders: updatedFolders} }})
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/user/views_configuration`,  method:'put', getAccessTokenSilently,  requestForm:{views_configuration:{...auth.authData.views?.configuration as any, folders: updatedFolders} }, auth})
    }
    
    //MEMOIZED CREATE NEW VIEWS FOLDER
    const memoizedEditViewBox = useMemo(() => (
        <ConfirmBox setShowBox={(b:boolean) => setViewUuid(null)}> 
            <EditViewBox section={section} viewUuid={viewUuid} setViewUuid={setViewUuid}/>
        </ConfirmBox>
    ), [viewUuid])


    const EditFolderBox = ( ) => {
        
        const viewContentIndex = auth.authData.views?.configuration.folders.findIndex((folder:any) => folder.name === section) as number
        const viewContent = auth.authData.views?.configuration.folders[viewContentIndex]?.content
        
        //ADD OR DELETE VIEW VISIBILITY
        const editView = async(id:string) => {

            const newFolders = auth.authData.views?.configuration.folders.map((view, index) => {
                if (index === viewContentIndex) {
                  const isInContent = view.content.includes(id)
                  const updatedContent = isInContent ? view.content.filter((item: any) => item !== id): [...view.content, id]
                  return { ...view, content: updatedContent }
                }
                return view
              })
            
            const newConfig = {...auth.authData.views?.configuration, folders:newFolders}

            console.log(newConfig)
            auth.setAuthData({views:{...auth.authData.views as any, configuration:newConfig }})
            setShowEdit(false)

            const responseViewsOrder = await fetchData({endpoint:`${auth.authData.organizationId}/user/views_configuration`,  method:'put', getAccessTokenSilently,  requestForm:{views_configuration:newConfig}, auth})
        }
        return (
            <AnimatePresence> 
            <Portal>
            <MotionBox  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                  style={{ transformOrigin: boxStyle.top ? 'top left':'bottom left' }} top={boxStyle.top} bottom={boxStyle.bottom} left={boxStyle.right} width={'200px'} maxH='40vh' overflow={'scroll'} gap='10px' p='10px' ref={boxRef} fontSize={'.9em'} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)'  bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.5rem'} borderWidth={'1px'} borderColor={'gray.200'}>
                    
                    {auth.authData.views?.definitions.length === 0 ? <Text fontSize={'.8em'} color='gray.600'>{t('NoViews')}</Text>:<> 
                        {auth.authData.views?.definitions.map((view, index) => {
                         
                        const viewStatus = viewContent?.find(viewToFind => viewToFind === view.uuid)

                        return (
                        <Flex  key={`view-${index}`} alignItems={'center'} color={viewStatus ? 'brand.text_blue':'gray.600'} gap='10px' bg={'transparent'}  justifyContent='space-between' onClick={() => editView(view.uuid)} _hover={{bg:'brand.gray_2'}}   fontSize={'.8em'} cursor={'pointer'} borderRadius={'.5rem'} p='6px'>
                            <Text fontWeight={'medium'} transition={'transform .1s ease-in-out'}   transformOrigin="left center" whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{view.emoji} {view.name}</Text>
                            <Icon as={FaEye}/>
                        </Flex>)
                        })}
                </>}
                <Box mt='1vh' mb='1vh' bg='gray.200' h='1px' w='100%'/>
                <Flex gap='10px'   alignItems={'center'} cursor={'pointer'} _hover={{color:'brand.text_blue'}} onClick={() => {setShowEdit(false);setViewUuid('-1')}}>
                    <Button w='100%' bg='transparent' variant={'common'} size='xs' leftIcon={<FaPlus/>}>{t('CreateView')}</Button>
                </Flex>
            </MotionBox>
        </Portal>
        </AnimatePresence>)
    }

    //MEMOIZED EDIT FOLDER BOX
    const memoizedEditFolderBox = useMemo(() => (<EditFolderBox />), [showEdit])

    return (<>

        {/* SHOW SEARCH SECTION */}
        {showEdit && memoizedEditFolderBox}
        {viewUuid && memoizedEditViewBox}

        {/* FOLDER */}
        <Flex  position={'relative'}  gap="10px" justifyContent={'space-between'} p="5px"   cursor="pointer" alignItems="center" borderRadius=".5rem" onMouseLeave={() => setIsHovering(false)} onMouseEnter={() => setIsHovering(true)}>
            
            <Flex onClick={(e) => {e.stopPropagation();activateDrag()}} alignItems={'center'} justifyContent={'center'} position='absolute' h='100%' w='10px' left={'-5px'} top={0} cursor={'move'} opacity={isHovering?1:0} transition={'opacity .2s ease-in-out'}>
                <Icon as={BsThreeDotsVertical} boxSize={'12px'}/>
            </Flex>

            <Flex flex='1' gap="10px" alignContent={'center'}> 
                <Text fontWeight={'medium'}  fontSize={'.9em'}   transformOrigin="left center" whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{(section === 'teams' || section === 'views') ? t(section):section}</Text>
            </Flex>
            <Box width={'15px'} ref={buttonRef}   onClick={(e) => {e.stopPropagation();setShowEdit(true) }}> 
                { (isHovering ) && <> {section === 'views' ? <FaPlus size='12px'/>:<BsThreeDots size='15px'/>} </>} 
            </Box>
            <Box width={'15px'}> 
                <IoIosArrowDown size={'13px'} onClick={() => setIsOpened(section)} className={isOpened ? "rotate-icon-up" : "rotate-icon-down"}/>
            </Box>
        </Flex>
        
        {/* FOLDER CHILDREN */}
        <motion.div initial={{height:isOpened?'auto':0}} animate={{height:isOpened?0:'auto' }} exit={{height:isOpened?'auto':0 }} transition={{duration:.2}} style={{overflow:(!isOpened)?'auto':'hidden', maxHeight:1000}}>           
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="columns" direction="vertical">
                    {(provided) => (
                        <Box ref={provided.innerRef} {...provided.droppableProps} >
                            {(section === 'teams'? auth.authData.teams.map((team) => {return team.uuid}) :childrenViews).map((element, index) => {

                                    let viewToSelect:any
                                    const isTeam = section === 'teams'
                                    if (isTeam) {
                                        const team = auth.authData.teams.find((team) => team.uuid === element) as any
                                        viewToSelect = {uuid:team.uuid, name:team.name, emoji:team.emoji, filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'team_uuid', op:'eq', val:team.uuid }] }]}}
                                    }
                                    else {
                                        const view = auth.authData.views?.definitions.find((view) => view.uuid === element) as any
                                        viewToSelect = {uuid:view.uuid, name:view.name, emoji:view.emoji, filters:view?.filters }
                                    }
                                    const isSelected = selectedView.view.uuid === element || selectedView.view.uuid === element

                                    return (<> 
                                           
                                        <Draggable  isDragDisabled={!dragEnabled[index]}  key={`viedww-${index}`} draggableId={`column-viwew-${index}`} index={index}>
                                            {(provided, snapshot) => (
                                                <Box ref={provided.innerRef}  {...provided.draggableProps} {...provided.dragHandleProps} >
                                                    <FolderChildren viewToSelect={viewToSelect} count={auth.authData.views?.count?.[(isTeam ? 'teams':'custom')]?.[viewToSelect.uuid] || 0} index={index} isSelected={isSelected} activateChildreDrag={activateChildrenDrag} setSelectedView={setSelectedView} section={section}/>
                                                </Box>
                                                )}
                                        </Draggable>
                                        
                                    </>)
                                    })}
                            {provided.placeholder}
                        </Box>
                    )}
                </Droppable>
            </DragDropContext>
        
        </motion.div>
    </>)
}

//CHILDREN OF EACH FOLDER
const FolderChildren = ({viewToSelect, index, count, isSelected, activateChildreDrag, setSelectedView, section }:{viewToSelect:ViewDefinitionType, count:number, index:number, isSelected:boolean, activateChildreDrag:(index:number) => void, setSelectedView:Dispatch<SetStateAction<{type:string, view:ViewDefinitionType}>>, section:string}) => {
    
    const [isHovering, setIsHovering] = useState<boolean>(false)

    const [viewUuid, setViewUuid] = useState<string | null>(null)

     //MEMOIZED CREATE NEW VIEWS FOLDER
     const memoizedEditViewBox = useMemo(() => (
        <ConfirmBox setShowBox={(b:boolean) => setViewUuid(null)}> 
            <EditViewBox section={section} viewUuid={viewUuid} setViewUuid={setViewUuid}/>
        </ConfirmBox>
    ), [viewUuid])


    return (<> 
        {viewUuid && memoizedEditViewBox}
        <Flex alignItems={'center'} onMouseLeave={() => setIsHovering(false)} onMouseEnter={() => setIsHovering(true)} position={'relative'} gap='10px' borderColor={isSelected ? 'gray.200':'transparent'} fontWeight={isSelected? 'medium':'normal'} bg={isSelected?'white':'transparent'}  transition={isSelected?'box-shadow .2s ease-in-out, border-color .2s ease-in-out, background-color .2s ease-in-out':'box-shadow .2s ease-out, border-color .2s ease-out, background-color .2s ease-out'}    boxShadow={isSelected ? '0 0 3px 0px rgba(0, 0, 0, 0.1)':''} borderWidth={'1px'}  justifyContent='space-between' onClick={() => {setSelectedView({type:section, view:viewToSelect }); localStorage.setItem('currentView', JSON.stringify({type:section, view:viewToSelect } ))}} _hover={{bg:isSelected?'white':'brand.gray_2'}}   fontSize={'.9em'} cursor={'pointer'} borderRadius={'.5rem'} p='6px'>
                <Flex onClick={(e) => {e.stopPropagation();activateChildreDrag(index)}} alignItems={'center'} justifyContent={'center'} position='absolute' h='100%' w='5px' left={0} top={0} cursor={'move'} opacity={isHovering?1:0} transition={'opacity .2s ease-in-out'}>
                    <Icon as={BsThreeDotsVertical} boxSize={'12px'}/>
                </Flex>
                <Text flex='1'   transition={'transform .1s ease-in-out'}   transformOrigin="left center" transform={isSelected?'scale(1.02)':'scale(1)'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}   overflow={'hidden'}>{viewToSelect.emoji} {viewToSelect.name}</Text>
                <Box width={'15px'} onClick={(e) => {e.stopPropagation();setViewUuid(viewToSelect.uuid) }}> 
                    { (isHovering ) && <> <RiEditFill size='12px'/> </>} 
                </Box>
                <Text color='gray.600' fontWeight={'medium'}>{count}</Text>
        </Flex>
    </>)
}

//EDIT A VIEW OR ADDING A NEW ONE
const EditViewBox = ({section,  viewUuid, setViewUuid}:{section:string, viewUuid:string | null, setViewUuid:Dispatch<SetStateAction<string | null>>}) => {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('conversations')
    const {getAccessTokenSilently} = useAuth0()
    const scrollRef = useRef<HTMLDivElement>(null)
    const operationTypesDict = {'user_id':['eq', 'neq',  'exists'], 'team_uuid':['eq', 'neq',  'exists'], 'channel_type':['eq', 'neq', 'exists'], 'theme':['eq', 'neq', 'exists'], 'urgency_rating':['eq', 'neq', 'leq', 'geq', 'exists'], 'status':['eq', 'neq'], 'unseen_changes':['eq', 'exists'], 'tags':['contains', 'ncontains', 'exists'], 'is_matilda_engaged':['eq', 'exists'],'is_csat_offered':['eq', 'exists'],}

    //CREATE VIEW 
    const [waitignCreate, setWaitingCreate] = useState<boolean>(false)

    //SELECTED VIEW
    const selectedView = auth.authData.views?.definitions.find((view) => view.uuid === viewUuid) 
    const [viewToEdit, setViewToEdit] = useState<ViewDefinitionType>(viewUuid === '-1' ? {uuid:'', name:'', emoji:'', sort:{column:'local_id', order:'desc'}, filters:{logic:'AND', groups:[]}} : selectedView as ViewDefinitionType)

    //REFS
    const emojiButtonRef = useRef<HTMLDivElement>(null)
    const emojiBoxRef = useRef<HTMLDivElement>(null)
    const [emojiVisible, setEmojiVisible] = useState<boolean>(false)
    useOutsideClick({ref1:emojiButtonRef, ref2:emojiBoxRef, onOutsideClick:setEmojiVisible})
    const handleEmojiClick = (emojiObject: EmojiClickData) => {setViewToEdit(prev => ({...prev, emoji:emojiObject.emoji}))}

    //CREATE OR EDIT A VIEW
    const createNewView = async () => {

        setWaitingCreate(true)
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/views${viewUuid === '-1' ? '':`/${viewToEdit.uuid}`}`,  method:viewUuid === '-1' ? 'post':'put', getAccessTokenSilently, requestForm:viewToEdit, auth})
        if (response?.status === 200) {

            const folders = auth.authData?.views?.configuration.folders as {name:string, show:boolean, content:string[]}[]
            const currentFolderIndex = folders.findIndex((folder => folder.name === section))

            
            const newContent = [...folders?.[currentFolderIndex as number]?.content as any, response.data.uuid]
            const newViewConfig = {...auth.authData?.views?.configuration as any, folders: folders.map((folder, index) =>index === currentFolderIndex? { ...folder, content: newContent }: folder),}
            
            const newDefinitions = (viewUuid === '-1') ? [...auth.authData.views?.definitions as any, {...viewToEdit, uuid:response.data.uuid}] : auth.authData.views?.definitions.map(def => def.uuid === viewUuid ? { ...viewToEdit } : def)
            
            if (viewUuid === '-1') {
                const responseViewsOrder = await fetchData({endpoint:`${auth.authData.organizationId}/user/views_configuration`,  method:'put', getAccessTokenSilently,  requestForm:{views_configuration:newViewConfig}, auth})
                auth.setAuthData({views:{...auth.authData.views as any, definitions:newDefinitions, configuration:newViewConfig }})
            }
            else auth.setAuthData({views:{...auth.authData.views as any, definitions:newDefinitions }})

        }
        setWaitingCreate(false)
        setViewUuid(null)
    }

    return (<> 
        <Box p='15px' ref={scrollRef}>  
            <Text fontWeight={'medium'} fontSize={'1.2em'}>{viewUuid === '-1' ?t('CreateView'):t('EditView')}</Text>
            <Text mt='2vh' mb='2vh' color='gray.600' fontSize={'.8em'}>{t('CreateViewWarning')}</Text>

            <Flex mt='2vh' alignItems={'center'} gap='10px'> 
                <Flex cursor={'pointer'} ref={emojiButtonRef} onClick={() => setEmojiVisible(true)} alignItems={'center'} justifyContent={'center'} width={'32px'} height={'32px'} borderWidth={'1px'} borderColor={'gray.200'} borderRadius={'.5rem'}> 
                    {viewToEdit.emoji ? <Text fontSize={'.9em'}>{viewToEdit.emoji}</Text>:<Icon boxSize={'.9em'} as={FaEye}/>}
                </Flex>
                <Box maxW='350px'> 
                <EditText placeholder={t('Name')} hideInput={false} value={viewToEdit.name} setValue={(value:string) => setViewToEdit(prev => ({...prev, name:value}))}/>
                </Box>
            </Flex>

            <Text mt='2vh' mb='1vh' fontSize={'.8em'} fontWeight={'medium'}>{t('Filters')}</Text>
            <FilterManager filters={viewToEdit.filters} setFilters={(filters) => setViewToEdit(prev => ({...prev, filters}))} operationTypesDict={operationTypesDict} typesMap={{}} excludedFields={['contacts', 'contact_businesses', 'custom']} scrollRef={scrollRef}/>
            
            <Text mt='2vh' fontSize={'.8em'} fontWeight={'medium'}>{t('OrderBy')}</Text>
            
            <Flex mt='2vh' gap='15px' flexDir={'row-reverse'}>
                <Button  size='sm'variant={'main'} onClick={() => createNewView()}>{waitignCreate? <LoadingIconButton/>:viewUuid === '-1' ?t('CreateView'):t('EditView')}</Button>
                <Button  size='sm'variant={'common'} onClick={() => setViewUuid(null)}>{t('Cancel')}</Button>
            </Flex>
        </Box>  

        {emojiVisible && 
        <Portal> 
            <Box onClick={(e) => e.stopPropagation()} position={'fixed'} zIndex={1000000} pointerEvents={emojiVisible?'auto':'none'} transition='opacity 0.2s ease-in-out' opacity={emojiVisible ? 1:0} top={`${((emojiButtonRef?.current?.getBoundingClientRect().bottom || 0)+ 5)}px`} left={`${(emojiButtonRef?.current?.getBoundingClientRect().left || 0)}px`}  ref={emojiBoxRef}> 
                <EmojiPicker open={emojiVisible} onEmojiClick={handleEmojiClick}  allowExpandReactions={false}/>
            </Box>
        </Portal>}
    </>)
}