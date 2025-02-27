/*
    SHOW CONVERSATION INFO IN CONVERSATION SECTION. CONTAINS ALL THE FUNCTIONALITY OF THE CONVERSATION (/conversation/conversation/{conversation_id})
*/

//REACT
import { useState, useRef, useEffect, Dispatch, SetStateAction, Fragment, memo, useMemo, ReactElement } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../../AuthContext"
import { useTranslation } from 'react-i18next'
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Box, Text, Avatar, Icon, Skeleton, Button, IconButton, Link, Image,chakra, shouldForwardProp, Stack, SkeletonCircle, Tooltip } from '@chakra-ui/react'
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion'
import '../../Components/styles.css'
//COMPONENTS
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import TextEditor from "./TextEditor"
import CustomSelect from "../../Components/Reusable/CustomSelect"
import ConfirmBox from "../../Components/Reusable/ConfirmBox" 
import Countdown from "../../Components/Once/CountDown"
import CustomAttributes from "../../Components/Reusable/CustomAttributes"
import EditText from "../../Components/Reusable/EditText"
import SectionSelector from "../../Components/Reusable/SectionSelector"
import TagEditor from "../../Components/Reusable/TagEditor"
import CollapsableSection from "../../Components/Reusable/CollapsableSection"
import ActionsBox from "../../Components/Reusable/ActionsBox"
import RenderSectionPath from "../../Components/Reusable/RenderSectionPath"
//FUNCTIONS
import timeAgo from "../../Functions/timeAgo"
import useOutsideClick from "../../Functions/clickOutside"
import formatFileSize from "../../Functions/formatFileSize"
import downloadFile from "../../Functions/downloadFile"
import timeStampToDate from "../../Functions/timeStampToString"
import parseMessageToBold from "../../Functions/parseToBold"
//ICONS
import { IoIosArrowDown } from "react-icons/io"
import { BsThreeDotsVertical, BsStars } from "react-icons/bs"
import { MdFileDownload, } from 'react-icons/md'
import { HiTrash, HiMenuAlt1 } from "react-icons/hi"
import { TbArrowMerge } from "react-icons/tb"
import { AiFillAudio } from "react-icons/ai"
import { FaClockRotateLeft, FaLockOpen, FaLock } from "react-icons/fa6"
import { HiOutlinePaperClip } from "react-icons/hi"
import { PiSidebarSimpleBold } from "react-icons/pi"
import { FaExternalLinkAlt } from "react-icons/fa"
import { VscBellDot } from "react-icons/vsc";


//TYPING
import { ClientData, Conversations, ConversationsData, contactDicRegex, ContactChannel, MessagesData, languagesFlags, ConversationColumn, ConversationsTableProps, ViewDefinitionType } from "../../Constants/typing" 
import RenderIcon from "../../Components/Reusable/RenderIcon"
    
//TYPING
interface ConversationResponseProps {
    socket:any 
    conId?:string
    sideBarWidth:number
    sectionsPath:string[]
    sectionsPathMap:{[key:string]:{icon:{type:'image' | 'emoji' | 'icon', data:string}, name:string}}
    selectedView?:ViewDefinitionType
}
interface MergeBoxProps {
    t:any
    conversationData:ConversationsData | null
    clientName:string
    setShowMerge: Dispatch<SetStateAction<boolean>>
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//MAIN FUNCTION
function ConversationResponse ({socket, conId, sectionsPath, sectionsPathMap, selectedView, sideBarWidth}: ConversationResponseProps) {

    //TRANSLATION
    const { t } = useTranslation('conversations')
    const { getAccessTokenSilently } = useAuth0()
    const t_clients = useTranslation('clients').t
    const location = useLocation()
    const t_formats = useTranslation('formats').t
    const params = new URLSearchParams(useLocation().search);
    const view = params.get('view')

    //CONSTANTS
    const auth = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const isExpanded = searchParams.get("v") === "expanded"
       
    //SIDE PANEL CONSTANTS FOR MAPPING SELECTORS
    console.log(auth.authData.users)
    let usersDict:{[key:string]:[string, ReactElement]} = {}
    if (auth.authData.users) auth.authData?.users.map((user:any) => {if (auth?.authData?.users) usersDict[user.id] = [user.name, user?.icon?.data ? <RenderIcon icon={user.icon} size={16}/>:<Avatar bg='white' color={'black'} borderColor={'border_color'} borderWidth={'1px'} h='16px' w='16px' size={'xs'} name={user?.name}/> ]})
    usersDict['no_user'] = [t('NoAgent'), <Avatar h='14px' w='14px' size={'xs'} borderWidth={'1px'} />]
    usersDict['matilda'] = ['Tilda', <Image src={'/images/matil.svg'} mr='2px' h='12px' w='12px' alt={'matilda'} />]

    let themesDict:{[key:string]:[string, string]} = {}
    auth.authData?.themes.map((theme:any) => {themesDict[theme.id] = [theme.name, theme.emoji]})

    let teamsDict:{[key:string]:[string, string]} = {}
    auth.authData?.teams.map((team:any) => {teamsDict[team.id] = [team.name, team.emoji]})
   
    //SCROLL REFS
    const scrollRef1 = useRef<HTMLDivElement>(null)
    const scrollRef2 = useRef<HTMLDivElement>(null)
  
    //MESSAGES QUEUE
    const messageQueue = useRef<any[]>([])
    const processQueue = () => {
        if (messageQueue.current.length > 0) {
            const { newMessage, type } = messageQueue.current.shift()
            updateMessagesList(newMessage, type)
        }
    }

    //EXPAND SECTIONS
    const [sectionsExpanded, setSectionsExpanded] = useState<string[]>(['info', 'tags', 'custom-attributes'])
    const onSectionExpand = (section: string) => {
        setSectionsExpanded((prevSections) => {
        if (prevSections.includes(section)) return prevSections.filter((s) => s !== section)
        else return [...prevSections, section]
        })
    }
     
    //WAIT NEW INFO
    const [waitingInfo, setWaitingInfo] = useState<boolean>(false)

    //ALL CONVERSATION DATA
    const [conversationData, setConversationData] = useState<ConversationsData | null>(null)
    const conversationDataRef = useRef<ConversationsData | null>(conversationData)
    
    //GET CONVERSATIONS INFO
    const [messagesList, setMessagesList] = useState<MessagesData | null>(null)

    //SAVE USER INFO
    const [clientData, setClientData] = useState<ClientData | null>(null)
    const clientDataRef = useRef<ClientData | null>(clientData) 
   
    const [clientConversations, setClientConversations] = useState<Conversations | null>(null)

     //REQUEST CONVERSATIONS, CONVERSATIONS AND CLIENT INFO
    useEffect(() => { 
       const loadData = async () => {
        
        localStorage.setItem('currentSection', location.pathname)
 
        //CALL THE API AND REQUEST (CONVERSATION DATA, CONTACT BUSINESS, CLIENT DATA, CLIENT CONVERSATION AND CONTACT BUSINESS)
        if (!location.pathname.endsWith('conversations')) {
        
            //prevCurrentIndex.current = selectedIndex
            setWaitingInfo(true)
            //setConversations((prevConversations) => ({...prevConversations,page_data: (prevConversations?.page_data || []).map((conversation) => conversation.id === conId ? {...conversation, unseen_changes:false}: conversation)}))  

            const conversationResponse = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/${conId}`, getAccessTokenSilently,setValue:setConversationData, auth, setRef:conversationDataRef})
            if (conversationResponse?.status === 200) {
                const data = conversationResponse?.data

                document.title = `${t('Conversation')} #${data.local_id} - ${auth.authData.organizationName} - Matil`
    
                if (socket.current) socket.current.emit(JSON.stringify({event: 'open_conversation', data:{id:conversationResponse?.data.conversation_id, organization_id: auth.authData.organizationId}}))
                
                if (data) {
                    setMessagesList({messages: conversationResponse.data.messages, scheduled_messages:conversationResponse.data.scheduled_messages})
                    const clientResponse = await fetchData({endpoint:`${auth.authData.organizationId}/persons/${conversationResponse?.data?.person_id}`,getAccessTokenSilently, setValue:setClientData, auth })
                    if (clientResponse?.status === 200)
                    {
                        const conversationsResponse = await fetchData({endpoint:`${auth.authData.organizationId}/conversations`, params:{page_index:1, filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'person_id', op:'eq', val:conversationResponse?.data?.person_id}] }]} }, getAccessTokenSilently, setValue:setClientConversations, auth })
                        setWaitingInfo(false)                        
                    }
                }
            }   
         }
      }
      loadData()
    }, [location])

    useEffect(() => {if (messageQueue.current.length > 0) processQueue()}, [messagesList])

    const [selectedDataSection, setSelectedDataSection] = useState<'client' | 'data'>('data')

    //BOOLEAN FOR MERGE A CONVERSATION
     const [showMerge, setShowMerge] = useState<boolean>(false)

    //WIDTH OF CLIENT BOX
    const containerWidth = isExpanded ? window.innerWidth - sideBarWidth : Math.min(window.innerWidth * 0.6, window.innerWidth - 275 - 240)
    const [clientBoxWidth, setClientBoxWidth] = useState(containerWidth / 2)
    
 
    //SHOW SETTINGS LOGIC
    const [showSettings, setShowSettings] = useState<boolean>(false)
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)
    
    //SETTINGS LOGIC
    const settingsButtonRef = useRef<HTMLButtonElement>(null)
    const settingsBoxRef = useRef<HTMLDivElement>(null)
    useOutsideClick({ref1:settingsButtonRef, ref2:settingsBoxRef,onOutsideClick:setShowSettings })    
  
    //UPDATE MESSAGES ON A NEW SOCKET ENTRY
    const updateMessagesList = (newMessage:any, type:'message'| 'scheduled-new' | 'scheduled-canceled' ) => {

        if (type === 'message' && newMessage.id === conversationDataRef?.current?.id) {
             setMessagesList((prev: MessagesData | null) => {
                if (prev === null) {return null}
                return {...prev, messages: [...prev.messages, ...newMessage.new_messages],  scheduled_messages: []}}
            )
        }
        else if (type === 'scheduled-new' && newMessage.id === conversationDataRef?.current?.id) {
            setMessagesList((prev: MessagesData | null) => {
                if (prev === null) {return null}
                return {...prev, scheduled_messages: newMessage.new_messages}}
            )
        } 
        else if (type === 'scheduled-canceled' && newMessage.id === conversationDataRef?.current?.id) {
            setMessagesList((prev: MessagesData | null) => {
                if (prev === null) { return null }
                return {...prev, scheduled_messages: []}
            })
        } 
    }

    //WEBSOCKET ACTIONS, THEY TRIGEGR ONLY IF THE USER IS INSIDE THE SECTION
    useEffect(() => {

        //UPDATE TICKERT DATA
        socket.current.on('conversation', (data:any) => {

            fetchData({endpoint:`${auth.authData.organizationId}/conversations/${conversationDataRef?.current?.id}/see`, auth, getAccessTokenSilently})

            if (data.new_data.id === conversationDataRef?.current?.id) setConversationData(data.new_data)
            if (data.person_id === clientDataRef.current?.id && setClientConversations) {
                setClientConversations(prev => {
                    if (!prev) return prev
                    const elementToAdd = {created_at:data.new_data.created_at, id:data.new_data.id, local_id:data.new_data.local_id, status:data.new_data.status, title:data.new_data.title, updated_at:data.new_data.updated_at }
                    let updatedPageData
                    if (data.is_new) updatedPageData = [elementToAdd, ...prev.page_data]
                    else updatedPageData = prev.page_data.map(con =>con.id === data.new_data.id ? elementToAdd : con)
                    return {...prev, total_items: data.is_new ? prev.total_items + 1 : prev.total_items, page_data: updatedPageData}
                  })
            }
        })

        //UPDATE A CONVERSATIOPN MESSAGE
        socket.current.on('conversation_messages', (data:any) => {
            console.log('HOAL')
            console.log(data)
             data.new_messages.forEach((msg: any) => { msg.sender_type = data.sender_type })
            messageQueue.current.push({ newMessage: data, type: 'message' })
            if (messageQueue.current.length === 1) processQueue()
        })

        //RECEIVE A NEW SCHEDULED MESSAGE
        socket.current.on('conversation_scheduled_messages', (data:any) => {
            messageQueue.current.push({ newMessage: data, type: 'scheduled-new' });
            if (messageQueue.current.length === 1) processQueue()
         })

        //SCHEDULED MESSAGE CANCELED
        socket.current.on('conversation_canceled_scheduled_messages', (data:any) => {
            messageQueue.current.push({ newMessage: data, type: 'scheduled-canceled' });
            if (messageQueue.current.length === 1) processQueue()
        })
    }, [])

    //NOTES CHANGE
    const textareaNotasRef = useRef<HTMLTextAreaElement>(null)
    const adjustTextareaHeight = (textarea:any) => {
        if (!textarea) return
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
    }
  
    useEffect(() =>{adjustTextareaHeight(textareaNotasRef.current)}, [clientData?.notes])

    //UPDATE DATA ON CHANGE
    const updateData = async(section:'conversation' | 'client', updatedKey:string, newData?:any) => {       
        
         
        if (section === 'conversation' && JSON.stringify(conversationDataRef.current) !== JSON.stringify({...conversationData, [updatedKey]:newData})){
            fetchData({endpoint:`${auth.authData.organizationId}/conversations/${conversationData?.id}`, auth:auth,getAccessTokenSilently, requestForm:{[updatedKey]:newData}, method:'put', toastMessages:{'works':t('ConversationUpdated', {id:conversationData?.id}),'failed':t('UpdatedFailed')}})
            setConversationData({...conversationData, [updatedKey]:newData})
        }
        else if (section === 'client' && JSON.stringify(clientDataRef.current) !== JSON.stringify({...clientData, [updatedKey]:newData})){
            fetchData({endpoint:`${auth.authData.organizationId}/contacts/${clientData?.id}`, auth:auth, requestForm:{[updatedKey]:newData}, getAccessTokenSilently, method:'put', toastMessages:{'works':t_clients('ClientUpdated', {id:clientData?.id}),'failed':t('UpdatedFailed')} })
            setClientData({...clientData, [updatedKey]:newData})
        }
    }

    //UPDATE A CISTOM ATTRIBUTE
    const updateCustomAttributes = (attributeName:string, newValue:any) => {
        const updatedCustomAttributes = {...conversationData.cdas}
        updatedCustomAttributes[attributeName] = newValue
        updateData('conversation', 'cdas',  updatedCustomAttributes)
     }

    //SCROLLING TO LAST MESSAGE LOGIC
    const scrollRef = useRef<HTMLDivElement>(null)
    const scrollRefGradient = useRef<HTMLDivElement>(null)
    const lastMessageRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (lastMessageRef.current) {
                if (scrollRef.current)scrollRef.current.scroll({top: lastMessageRef.current.offsetTop + lastMessageRef.current.offsetHeight - scrollRef.current.offsetHeight + 50, behavior: 'smooth'})
                if (scrollRefGradient.current) scrollRefGradient.current.scroll({top: lastMessageRef.current.offsetTop + lastMessageRef.current.offsetHeight - scrollRefGradient.current.offsetHeight + 50, behavior: 'smooth'})
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [messagesList])

    //TAKE THE CONTROL OF A CONVERSATION
    const exportConversation = (messagesList:MessagesData | null) => {

        const WriteMessages = (type:string, content:any) => {
            if (type === 'plain' || type === 'email' || type === 'site') return content.text
            else if (type === 'options') return t('OptionsMessage')
            else if (type === 'image') return t('ImageMessage')
            else if (type === 'pdf' || type === 'file' || type === 'video' || type === 'audio') return t('FileMessage')       
            else if (type === 'system') {
                switch (content.event) {
                    case 'merge':
                       return t('MergedMessage')
                    case 'agent_transfer':
                        return t('AgentTransferMessage')
                    case 'solved':
                        return t('SolvedMessage')
                    case 'closed':
                        return t('ClosedMessage')
                }
            }  
        }

        if (messagesList) {
            let conversationText = `${t('Conversation')} #${conversationData?.local_id} (${auth.authData.organizationName})\n\n`

            messagesList.messages.forEach(con => {
 
                
                const sender = (con.sender_type === 'system'?t('SystemMessage'):con.type === 'internal_note'?t('InternalNote'):con.sender_type === 'matilda'?'Tilda':con.sender_type === 'contact'?clientData?.name:auth?.authData?.users?.find(user => user.id === con.sender_type)) || ''
                conversationText += `${sender}: ${WriteMessages(con.type, con.content)}\n\n`
            })
            messagesList.scheduled_messages.forEach(con => {
                conversationText += `Tilda: ${WriteMessages(con.type, con.content)}\n\n`
            })

            const blob = new Blob([conversationText], { type: 'text/plain' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `conversation_${conversationData?.local_id}.txt`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
        
    }

    //TAKE THE CONTROL OF A CONVERSATION
    const takeConversationControl = () => {
        updateData('conversation', 'is_matilda_engaged', false )
        fetchData({endpoint:`${auth.authData.organizationId}/conversations/${conversationData?.id}/cancel_scheduled_messages`,getAccessTokenSilently, method:'post', auth})
    }

    const deleteConversation= async() => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/${conversationData?.id}`, getAccessTokenSilently, auth, method:'delete', toastMessages:{'works':t('ConversationDeleted'),'failed':t('ConversationDeletedFailed')}})
        if (response?.status === 200) navigate(-1)

        setShowConfirmDelete(false)

    }
    const closeConversation = async () => {
        navigate('/conversations')
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/conversations`, method:'put',  requestForm:{is_closed:true}, getAccessTokenSilently, auth,  params:{filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'id', op:'in', val:[conversationData.id]}]}] }} })   
    }

    console.log(auth.authData.users)
 
    //COPONENT FOR RENDERING THE MESSAGES
    const MessagesContent = () => {

        console.log(messagesList)
         return (<>
                {(messagesList !== null ) &&
                <>
                    {messagesList.messages.map((con:any, index:number) => (               
                    <Box  mt={'5vh'} key={`message-${index}`} ref={index === (messagesList?.messages.length || 0) - 1 ? lastMessageRef : null}> 
                        <MessageComponent conId={conversationData?.id || -1} con={con} sender={(con.sender_type === 'system'?'':con.type === 'internal_note'?t('InternalNote'):con.sender_type === 'matilda'?'Tilda':con.sender_type === 'person'?clientData?.name:auth.authData?.users?.find(user => user.id === con.sender_id)?.name) || ''} navigate={navigate}/>
                    </Box>))}

                    {messagesList.scheduled_messages.map((con:any, index:number) =>(
                        <Box  mt={'5vh'} gap='10px'  key={`scheduled-message-${index}`} ref={index === (messagesList?.messages.length || 0) - 1 ? lastMessageRef : null}> 
                            <MessageComponent con={con} isScheduled={true} navigate={navigate} sender={'Tilda'} />
                        </Box>)
                    )}
                </>}           
       
        </>)
    }
 
    const memoizedMergeBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowMerge}> 
            <MergeBox t={t} conversationData={conversationData} clientName={clientData?.name || t('NoClient')} setShowMerge={setShowMerge} />
        </ConfirmBox>
    ), [showMerge])
     
   
    const memoizedMessagesContent = useMemo(() => (<MessagesContent/>), [messagesList, clientData])
    const isMatilda = conversationData?.is_matilda_engaged  &&  conversationData?.status !== 'closed' &&conversationData?.call_status !== 'completed'
    
    //FRONT
    return(<> 
        <ActionsBox showBox={showConfirmDelete} setShowBox={setShowConfirmDelete} type="delete" title={t('DeleteConversationName', {name:conversationData?.title || ''})} des={t('DeleteConversationDes')} actionFunction={deleteConversation} buttonTitle={t('DeleteConversation')}/>
        <Flex height={'100vh'} ref={scrollRef1} w={containerWidth} >

            {(location.pathname.split('/')[location.pathname.split('/').length - 1] === 'conversations' && view === 'list' )? 
            <Flex h='100%' w='100%' justifyContent={'center'} alignItems={'center'}>
                <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('NoConversationSelected')}</Text>
            </Flex>
            :<> 
            <Box w='100%' borderRightColor={'border_color'} borderRightWidth={'1px'}>
                <Flex height="100vh" position="relative" flexDir="column" overflow="hidden" className={isMatilda?'fondoAnimado':''}>
                    {isMatilda && <div className="gradient-box"/>}

                    <Flex bg='white'   borderBottomColor={'border_color'} borderBottomWidth={'1px'} gap='1vw' justifyContent={'space-between'} alignItems={'center'} h='50px' px='1vw'>
                        <Flex alignItems={'center'} >
                            {isExpanded &&<RenderSectionPath sectionsPath={sectionsPath} sectionsPathMap={sectionsPathMap} selectedView={selectedView}/>}
                            <Skeleton isLoaded={conversationData !== null && !waitingInfo} style={{minWidth:'300px', fontSize:'1em', marginTop:'7px'}}> 
                                <EditText placeholder={t('Title') + '...'} value={conversationData?.title} setValue={(value:string) => updateData('conversation', 'title', value)} className="title-textarea"/>
                            </Skeleton>
                        </Flex>
                        
                    
                        <Flex gap='10px'> 
                            <Box position={'relative'}> 
                                <IconButton ref={settingsButtonRef} aria-label='conver-settings' icon={<BsThreeDotsVertical/>} size='sm'  variant={'common'}  color={showSettings ? 'text_blue':'black'} bg={showSettings ? 'gray_1':'gray_2' }  onClick={() => {setShowSettings(!showSettings)}}/>
                                <AnimatePresence> 
                                {showSettings && 
                                    <MotionBox initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '.1', ease: 'easeOut'}}
                                    maxH='40vh'p='8px'  style={{ transformOrigin: 'top right' }}  mt='5px' right={0} overflow={'scroll'} top='100%' gap='10px' ref={settingsBoxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.1)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.5rem'} borderWidth={'1px'} borderColor={'border_color'}>
                                
                                    {conversationData?.call_url && 
                                    <Flex px='7px' py='5px'  borderRadius={'.5rem'} cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'gray_2'}} onClick={() => {setShowSettings(false)}}>
                                        <Icon color='text_gray'  boxSize={'15px'} as={AiFillAudio}/>
                                        <Text whiteSpace={'nowrap'}>{t('Audio')}</Text>
                                    </Flex>}

                                    <Flex   px='7px' py='5px'  borderRadius={'.5rem'} cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'gray_2'}} onClick={() => {setShowMerge(true);setShowSettings(false)}}>
                                        <Icon color='text_gray'  boxSize={'15px'} as={TbArrowMerge }/>
                                        <Text whiteSpace={'nowrap'}>{t('MergeConversation')}</Text>
                                    </Flex>
                                    <Flex   px='7px' py='5px'  borderRadius={'.5rem'} cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'gray_2'}} onClick={() => {exportConversation(messagesList);setShowSettings(false)}}>
                                        <Icon color='text_gray'  boxSize={'15px'} as={HiMenuAlt1}/>
                                        <Text whiteSpace={'nowrap'}>{t('ExportConversation')}</Text>
                                    </Flex>
                                    <Flex  color='red' onClick={() => {setShowSettings(false) ;setShowConfirmDelete(true)}}   px='7px' py='5px'  borderRadius={'.5rem'} cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'red.100'}}>
                                        <Icon boxSize={'15px'} as={HiTrash}/>
                                        <Text whiteSpace={'nowrap'}>{t('Delete')}</Text>
                                    </Flex>
                                </MotionBox>}   
                                </AnimatePresence>                 
                            </Box>    

                            <Tooltip  label={t('MarkAsUnseen')}  placement='top'  hasArrow bg='white' color='black'  borderRadius='.5rem' fontSize='.8em' p='6px'> 
                                <IconButton  aria-label='mark-data' icon={<VscBellDot size='18px' />} size='sm'  variant={'common'}  onClick={() => {navigate(-1); updateData('conversation', 'unseen_changes', true)}} />
                            </Tooltip>
        
                            {!conversationData?.is_closed &&  
                            <Tooltip  label={t('CloseConversation')}  placement='top' hasArrow  bg='white' color='black'  borderRadius='.5rem' fontSize='.8em' p='6px'> 
                                <IconButton  aria-label='close-con' icon={<FaLock size='14px' />} size='sm'  variant={'main'}  onClick={closeConversation}/>
                            </Tooltip>}

                            <Tooltip  label={t('HideViews')}  placement='top' hasArrow bg='white' color='black'  borderRadius='.5rem' fontSize='.8em' p='6px'> 
                                <IconButton  aria-label='expand-data' icon={<PiSidebarSimpleBold size='18px' />} size='sm'  variant={'common'} bg='transparent'  onClick={() => {if (clientBoxWidth === 0) setClientBoxWidth(containerWidth / 2);else setClientBoxWidth(0)}}/>
                            </Tooltip>
                        </Flex>     
                    </Flex>  

                    <Box position={'relative'} flex='1' overflow={'hidden'} width={'100%'} px='20px'   >
                        <Box ref={scrollRef} position={'relative'} flex='1'   width={'100%'} p='0 0px 50px 0px' overflow={'scroll'}  height={'calc(100%)'}   >
                            {(messagesList === null || clientData === null || conversationData === null || waitingInfo)  ? 
                            <Stack spacing={4} p={4} width="100%">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                    <Flex gap="10px" key={`skeleton-message-${index}`}>
                                        <SkeletonCircle size="30px" />
                                        <Box width="calc(100% - 35px)">
                                            <Flex mb="1vh" fontSize=".9em" justifyContent="space-between">
                                            <Flex gap="30px" alignItems="center">
                                                <Skeleton borderRadius={'.5rem'} height="15px" width="100px" />
                                                <Flex gap="5px" alignItems="center">
                                                </Flex>
                                            </Flex>
                                            <Skeleton borderRadius={'.5rem'}  height="15px" width="70px" />
                                            </Flex>
                                            <Box  mt="10px" borderRadius=".3rem" >
                                                <Skeleton borderRadius={'.5rem'}  height="13px" />
                                            <Skeleton borderRadius={'.5rem'}  height="11px" width="80%" mt="5px" />
                                            </Box>
                                        </Box>
                                    </Flex>
                            ))}
                            </Stack>

                            :  
                            <Skeleton size="10" isLoaded={messagesList !== null  && !waitingInfo}>
                            {memoizedMessagesContent}
                            </Skeleton>
                            }
                        </Box>
                    </Box>
                    {(conversationData) && <TextEditor conversationData={conversationData as ConversationsData} clientName={clientData?.name}/>}
                </Flex>
            </Box>
            
            <MotionBox   width={clientBoxWidth + 'px'} initial={{ width: clientBoxWidth + 'px', opacity:clientBoxWidth === 0?1:0 }} animate={{ width: clientBoxWidth + 'px', opacity:clientBoxWidth === 0?0:1 }} exit={{ width: clientBoxWidth + 'px', opacity:clientBoxWidth === 0?1:0 }} transition={{ duration: '.2'}} 
                bg='white' h='100vh' ref={scrollRef2} overflow={'hidden'}>

                <MotionBox whiteSpace={'nowrap'} display={'flex'} flexDir={'column'} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}  transition={{ duration: '.3' }} > 
                        
                    <Flex h='50px'  borderBottomColor={'border_color'} borderBottomWidth={'1px'} px='1vw' >
                        <SectionSelector notSection selectedSection={selectedDataSection} sections={['data', 'client']} onChange={(value) => setSelectedDataSection(value)} sectionsMap={{'data':[t('ConversationData'), <></>], 'client':[t('ClientData'),  <></>]}}/>
                    </Flex>
                    <Box h='calc(100vh - 50px)' overflow={'hidden'}> 
                        {selectedDataSection === 'data' ? 
                            <MotionBox h='100%' overflow={'scroll'} position='relative' px='1vw' whiteSpace={'nowrap'} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}  transition={{ duration: '.3' }} > 
                                
                                {(conversationData?.is_matilda_engaged && conversationData.status !== 'closed') && 
                                <Flex  flexDir={'column'} mt='-10vh' justifyContent={'center'} alignItems={'center'}   bg="linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.9))"   top={0} left={0} h='100%' w ='100%' position='absolute' zIndex={1000}>
                                    <svg width="0" height="0">
                                        <defs>
                                            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" style={{ stopColor: 'rgba(0, 102, 204, 0.8)', stopOpacity: 1 }} />
                                                <stop offset="100%" style={{ stopColor: 'rgba(102, 51, 255, 0.7)', stopOpacity: 1 }} />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <Icon fill="url(#gradient2)" as={BsStars} boxSize={'40px'}/>
                                    <Flex mt='2vh' gap='10px' alignItems={'end'}> 
                                        <Text bgGradient={"linear(to-r, rgba(0, 102, 204, 0.8), rgba(102, 51, 255, 0.7))"} bgClip="text"  color={'transparent'} fontWeight={'medium'} fontSize={'1.2em'} >{t('ConversationByMatilda')}</Text>
                                    </Flex>
                                    <Button mt='2vh' h='40px'px='50px' opacity={0.8} bgGradient={"linear(to-r, rgba(0, 102, 204), rgba(102, 51, 255))"} _hover={{opacity:0.9}} leftIcon={<FaLockOpen/>} onClick={takeConversationControl} variant={'main'}  size='md'>{t('TakeControl')}</Button>
                        
                                </Flex>}
                                
                                <Flex mt='2vh' alignItems={'center'} gap='10px'> 
                                    <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} flex='1'fontWeight={'medium'} fontSize='.8em' color='text_gray' >{t('user_id')}</Text>
                                    <Skeleton isLoaded={conversationData !== null && !waitingInfo} style={{flex:2}}>
                                        <CustomSelect fontSize='.8em'  isDisabled={conversationData?.user_id === 'matilda' ||conversationData?.status === 'closed'}  containerRef={scrollRef1}  selectedItem={conversationData?.user_id} options={Object.keys(usersDict).map(key => key)} iconsMap={usersDict} setSelectedItem={(value) => updateData('conversation', 'user_id',value as string)} />
                                    </Skeleton>
                                </Flex>

                                <Flex mt='2vh' alignItems={'center'} gap='10px'> 
                                    <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} flex='1'fontWeight={'medium'} fontSize='.8em' color='text_gray' >{t('Team')}</Text>
                                    <Skeleton isLoaded={conversationData !== null && !waitingInfo} style={{flex:2}}>
                                        <CustomSelect isDisabled={conversationData?.user_id === 'matilda' ||conversationData?.status === 'closed'}  containerRef={scrollRef1}  selectedItem={conversationData?.team_id} options={Object.keys(teamsDict).map(key => key)} iconsMap={teamsDict} setSelectedItem={(value) => updateData('conversation', 'team_id',value as string)} hide />
                                    </Skeleton>
                                </Flex>
                    

                                <CollapsableSection mt='3vh' section={'info'} isExpanded={sectionsExpanded.includes('info')} onSectionExpand={onSectionExpand} sectionsMap={{'info':t('Info'), 'tags':t('Tags'), 'custom-attributes':t('CustomAttributes')}}> 

                                    <Flex mt='2vh' alignItems={'center'} gap='10px'> 
                                        <Text  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  flex='1' fontWeight={'medium'} fontSize='.8em' color='text_gray' >{t('theme')}</Text>
                                        <Skeleton isLoaded={conversationData !== null && !waitingInfo} style={{flex:2}}>
                                            <CustomSelect  isDisabled={conversationData?.user_id === 'matilda' ||conversationData?.status === 'closed'} containerRef={scrollRef1}  selectedItem={conversationData?.theme_id} options={auth.authData?.themes.map(theme => {return theme.id}) || []} iconsMap={themesDict} setSelectedItem={(value) => updateData('conversation', 'theme_id',value as string)} hide />
                                        </Skeleton>
                                    </Flex>

                                    <Flex mt='2vh' alignItems={'center'} gap='10px'> 
                                        <Text  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  flex='1' fontWeight={'medium'} fontSize='.8em' color='text_gray' >{t('created_at')}</Text>
                                        <Skeleton isLoaded={conversationData !== null && !waitingInfo} style={{flex:2, padding:'7px'}}>
                                            <Text ml='7px' fontSize={'.8em'}>{timeAgo(conversationData?.created_at, t_formats)}</Text>
                                        </Skeleton>
                                    </Flex>

                                    <Flex mt='2vh' alignItems={'center'} gap='10px'> 
                                        <Text  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  flex='1' fontWeight={'medium'} fontSize='.8em' color='text_gray' >{t('updated_at')}</Text>
                                        <Skeleton isLoaded={conversationData !== null && !waitingInfo} style={{flex:2, padding:'7px'}}>
                                            <Text ml='7px' fontSize={'.8em'}>{timeAgo(conversationData?.updated_at, t_formats)}</Text>
                                        </Skeleton>
                                    </Flex>
                                </CollapsableSection>

                                <CollapsableSection mt='3vh' section={'tags'} isExpanded={sectionsExpanded.includes('tags')} onSectionExpand={onSectionExpand} sectionsMap={{'info':t('Info'), 'tags':t('Tags'), 'custom-attributes':t('CustomAttributes')}}> 
                                    <Skeleton style={{marginTop:'2vh'}} isLoaded={clientData !== null && !waitingInfo}>
                                        <TagEditor section={'conversations'} data={conversationData}  setData={setConversationData}/>
                                    </Skeleton>
                                </CollapsableSection>

                                <CollapsableSection mt='3vh'  section={'custom-attributes'} isExpanded={sectionsExpanded.includes('custom-attributes')} onSectionExpand={onSectionExpand} sectionsMap={{'info':t('Info'), 'tags':t('Tags'), 'custom-attributes':t('CustomAttributes')}}> 
                                    <Skeleton style={{marginTop:'2vh'}} isLoaded={clientData !== null && !waitingInfo}>
                                        <CustomAttributes disabled={conversationData?.user_id === 'matilda' ||conversationData?.status === 'closed'} motherstructureId={conversationData?.id || 0}   motherstructureType="conversations" customAttributes={conversationData?.cdas || []} updateCustomAttributes={updateCustomAttributes}/>
                                    </Skeleton>
                                
                                </CollapsableSection>

                            </MotionBox>
                        :
                            <MotionBox px='1vw' pb='2vh' display={'flex'} h='100%' flexDir={'column'} whiteSpace={'nowrap'} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}  transition={{ duration: '.3' }} > 

                                <Flex w='100%' mt='3vh' justifyContent={'space-between'} mb='3vh' alignItems={'center'}> 
                                    <Flex flex='1'   minW={0}   w='100%'  gap='10px' alignItems={'center'}>
                                        <Skeleton  style={{borderRadius:'50%'}}   isLoaded={clientData !== null  && !waitingInfo}>
                                            <Avatar name={clientData?.name} size='xs'/>
                                        </Skeleton>

                                        <Skeleton  minW={0}   isLoaded={clientData !== null  && !waitingInfo}>
                                            <Flex transition={'color .2s ease-in-out'} alignItems={'center'} gap='10px' cursor={'pointer'} _hover={{color:'text_blue'}} onClick={() => navigate(`//${clientData?.id}`)}> 
                                                <Text flex='1' fontSize={'.9em'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} fontWeight={'medium'}>{clientData?.name}</Text>
                                                <Icon boxSize={'14px'} as={FaExternalLinkAlt}/>
                                            </Flex>
                                        </Skeleton>
                                    </Flex>
                                </Flex>
                                
                                {clientData && <>
                                {Object.keys(clientData).map((con, index) => (
                                        <Fragment key={`contact-map-${index}`}>
                                            {((Object.keys(contactDicRegex).includes(con)) && clientData[con as ContactChannel]&& clientData[con as ContactChannel] !== '') &&
                                                <Flex fontSize='.8em' mt='1vh' alignItems={'center'} gap='10px' key={`contact-type-${index}`}> 
                                                    <Skeleton  style={{flex:1}}  isLoaded={clientData !== null && !waitingInfo}>
                                                        <Text py='7px' whiteSpace={'nowrap'} flex='1' textOverflow={'ellipsis'} overflow={'hidden'}  fontWeight={'medium'} color='text_gray'>{t_clients(con)}</Text>
                                                    </Skeleton>
                                                    <Skeleton style={{flex:2, minWidth:0}} isLoaded={clientData !== null && !waitingInfo}>
                                                        <Box py='7px' minW={0}> 
                                                            <Text ml='7px'textOverflow={'ellipsis'} overflow={'hidden'} whiteSpace={'nowrap'}>{clientData[con as ContactChannel]}</Text>
                                                        </Box>
                                                    </Skeleton>

                                                </Flex>}
                                        </Fragment>
                                    ))}
                                </>}
                            
                                
                                <Flex mt='2vh' alignItems={'center'}fontSize='.8em' gap='10px'  > 
                                    <Text flex='1' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  fontWeight={'medium'} color='text_gray' >{t_clients('language')}</Text>
                                    <Skeleton isLoaded={clientData !== null && !waitingInfo} style={{flex:2}}>
                                        <Text ml='7px' textOverflow={'ellipsis'} overflow={'hidden'} whiteSpace={'nowrap'}>{(clientData?.language && clientData?.language in languagesFlags) ? languagesFlags[clientData?.language][0] + ' ' + languagesFlags[clientData?.language][1]:'No detectado'}</Text>
                                    </Skeleton>
                                </Flex>
                            
                                <Flex mt='2vh' alignItems={'center'}  gap='10px'  > 
                                    <Text flex='1' fontSize='.8em' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  fontWeight={'medium'} color='text_gray'>{t_clients('notes')}</Text>
                                    <Skeleton isLoaded={clientData !== null && !waitingInfo} style={{flex:2}}>
                                        <EditText placeholder={t_clients('notes') + '...'} value={clientData?.notes} setValue={(value:string) => setClientData(prevData => prevData ? ({ ...prevData, notes:value}) as ClientData : null)}/>
                                    </Skeleton>
                                </Flex>

                                <Text mt='5vh' fontSize={'.9em'} fontWeight={'medium'}>{t('ClientConversations')}</Text>
                                <Box mt='2vh' position={'relative'} style={{flex:1, overflow:'scroll'}}> 
                            
                                        {(clientConversations?.page_data || [{id:'', title:'', status:'new', updated_at:'', theme_id:''},{id:'', title:'',status:'new',  updated_at:'', theme_id:''},{id:'', title:'',status:'new',  updated_at:'', theme_id:''} ]).map((con, index) => 
                                        
                                        {
                                            const selectedTheme =  auth.authData.themes.find((theme) => theme.id === con.theme_id)
                                            return (
                                            <Skeleton isLoaded={clientData !== null && !waitingInfo}>
                                                <Box position={'relative'}  key={`conversations-${index}`}  onClick={() => {navigate(`/conversations/conversation/${con.id}`)}} boxShadow={conversationData?.id  === con.id  ?'0 0 3px 0px rgba(0, 0, 0, 0.1)':''} borderWidth={'1px'} borderColor={conversationData?.id  === con.id ? 'border_color':'transparent'} justifyContent='space-between'   _hover={{bg:'hover_gray'}}   transition={conversationData?.id  === con.id?'box-shadow .2s ease-in-out, border-color .2s ease-in-out, background-color .2s ease-in-out':'box-shadow .2s ease-out, border-color .2s ease-out, background-color .2s ease-out'}    cursor={'pointer'} borderRadius={'.5rem'} p='10px'>
                                                    {index !== (clientConversations?.page_data?.length || 0)  - 1 && <Box position={'absolute'} height={'calc(100%)'} mt='10px' ml='4px'  width={'2px'} bg='gray.400' zIndex={1}/>}
                                                    <Flex alignItems={'center'}  gap='10px'> 
                                                        <Box borderRadius={'.2rem'}  bg={con.status === 'open' ? 'red':'green'} zIndex={10} height={'10px'} width='10px' />
                                                        <Text flex='1' whiteSpace={'nowrap'} fontWeight={conversationData?.id  === con.id ?'medium':'normal'}  transition={'transform .1s ease-in-out'}   transformOrigin="left center" transform={conversationData?.id  === con.id ?'scale(1.02)':'scale(1)'} textOverflow={'ellipsis'} overflow={'hidden'} fontSize={'.8em'}>{con.title ? con.title:t('NoDescription')}</Text>
                                                    </Flex>
                                        
                                                    <Flex ml='20px' justifyContent={'space-between'} alignItems={'end'}>
                                                        <Text fontSize={'.8em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{selectedTheme ? `${selectedTheme?.icon.data}  ${selectedTheme?.name}` :t('NoTheme')}</Text>

                                                        <Text mt='5px' fontSize={'.8em'} color='gray' whiteSpace={'nowrap'} >{timeAgo(con.updated_at as string, t_formats)}</Text>
                                                    </Flex>                                      
                                                </Box>
                                            </Skeleton>
                                        )
                                    })}
                        
                                </Box>
                            </MotionBox>
                        }
                    </Box>
        
                </MotionBox>            
            </MotionBox>
            </>}
        </Flex>
        
         {showMerge && memoizedMergeBox}
     </>)
}

export default ConversationResponse


//COMPONENT FOR SHOWING THE CORREPONDING STYLE OF A MESSAGE
const ShowMessages = ({type, content, conId}:{type:string, content:any, conId?:number}) => {
    
    const navigate = useNavigate()
    const { t } = useTranslation('conversations')
    //MAIL OR PLAIN
    if (type === 'plain' || type === 'email' || type === 'internal_note') {
        
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
        const urlRegex = /\[(.*?)\]\((https?:\/\/[^\s/$.?#].[^\s]*)\)/
        const boldRegex = /\*\*(.*?)\*\*/
        
        // Creamos una nueva expresión regular combinada
        const combinedRegex = new RegExp(`(${emailRegex.source}|${urlRegex.source}|${boldRegex.source})`, 'gi');
        
        // Dividimos el contenido del texto utilizando la expresión regular combinada
        const cleanedText = (content?.text || '').replace(/{>>\s*(.*?)\s*<<}/, '$1')
        let parts = cleanedText.split(combinedRegex)
    
        // Filtramos los elementos undefined de la lista resultante
        parts = parts.filter((part:any) => part !== undefined && part !== '')
        
        parts = parts.reduce((acc:any, part:string, index:number, array:any) => {
          if (boldRegex.test(part) && index < array.length - 1 && (part || '')?.replace(/\*\*/g, '') === array[index + 1]) {
            acc.push(part)
            array.splice(index + 1, 1)
          } 
          else acc.push(part)
          return acc
        }, [])
  
        let skipCount = 0
          return (<> 
              <span style={{ wordBreak: 'break-word'}}>
                  {parts.map((part:string, index:number) => {
  
                      if (skipCount > 0) {
                        skipCount--
                        return null
                      }
  
                      if (emailRegex.test(part)) {
                          return (
                              <a key={index} href={`mailto:${part}`} style={{ color: '#1a73e8', wordBreak: 'break-all', whiteSpace: 'pre-line' }}>{part}</a>)
                      } else if (urlRegex.test(part)) {
                          const match = part.match(/\[(.*?)\]\((https?:\/\/[^\s/$.?#].[^\s]*)\)/);
                          if (match) {
                            const displayText = match[1]
                            const url = match[2]
                            skipCount = 2
                            return (
                              <a key={index} href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#1a73e8', wordBreak: 'break-all', whiteSpace: 'pre-line' }}>
                                {displayText}
                              </a>
                            )
                          }
                      }
                       else if (boldRegex.test(part)) {
                        const boldText = (part || '')?.replace(/\*\*/g, '')
                        return <span style={{fontWeight:500}} key={index}>{boldText}</span>
                      } else return <span key={index}>
                        {part.split('\n').map((line, i) => (
                            <Fragment key={i}>
                                {i > 0 && <br />}
                                {line.startsWith('#')?<><span style={{fontWeight:'500'}}>{(line || '')?.replace(/^#+\s*/, '')}</span> <br /></>:line}
                            </Fragment>
                        ))}
                    </span>
                })}
              </span>
              {(content?.sources && content?.sources.length > 0) && 
              <div style={{marginTop:'10px'}}>
              <span style={{fontWeight:'500'}} >{t('Sources')}</span>
                {content.sources.map((source:{title:string, id:string, help_center_id:string}, index:number) => (
                    <Flex key={`source-${index}`} cursor={'pointer'} alignItems={'center'} justifyContent={'space-between'} p='5px' borderRadius={'.5rem'} _hover={{bg:'gray_1'}} onClick={() => window.open(`https://www.help.matil.ai/${source.help_center_id}/article/${source.id}`, '_blank')} >
                        <span>{source.title}</span>
                        <svg viewBox="0 0 512 512"width="12"  height="12" style={{transform:'rotate(-90deg)'}}  fill="currentColor" ><path d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path></svg>
                    </Flex>
                ))}
              </div>}
          </>)
    }

    else if (type === 'function_call') {
        const [isExpanded, setIsExpanded] = useState<boolean>(false)

        const parseJson = (str:any) => {
             if (typeof str === 'string') {
                const parsedData = JSON.parse(str)
                return parsedData.replace(/\\u[\dA-F]{4}/gi, (match:any) => String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))).replace(/\\/g, '')
            }
            else return JSON.stringify(str)
        }
        return (
        <Box  >
            <Flex cursor={'pointer'}  onClick={() => setIsExpanded(prev => !prev)}  justifyContent={'space-between'} > 
                <Box> 
                    <Text fontWeight={'medium'} fontSize={'1.125em'}>{t('FunctionCall')} <span style={{cursor:'pointer', color:'rgb(59, 90, 246)'}}  onClick={() => navigate(`/functions/function/${content.id}`)}>{content.name}</span></Text>
                    <Text mt='7px' whiteSpace={'break-word'} wordBreak={'break-word'} overflowWrap={'break-word'}><span style={{fontWeight:500}}> {t('Arguments')}:</span> {content.arguments}</Text>
                 </Box>
               <IoIosArrowDown cursor={'pointer'} color={'text_gray'} className={isExpanded ? "rotate-icon-up" : "rotate-icon-down"}/>
            </Flex>
            <motion.div initial={false} animate={{height:isExpanded?'auto':0, opacity:isExpanded?1:0 }}  transition={{duration:.2}} style={{overflow:isExpanded?'visible':'hidden'}}>           
                 <Text fontSize={'.9em'}  mt='7px'><span style={{fontWeight:500}}> {t('Output')}:</span> {parseJson(content.output)}</Text>
            </motion.div>
        </Box>)
    }
    //CHAT OPTIONS
    else if (type === 'options') return (<> 
         {content.map((element:string, index:number) => ( 
            <Flex mt='.7vh' maxW='400px' bg='blue.50' borderColor={'blue.100'} key={`options-${index}`} p='5px' borderRadius={'.5rem'} borderWidth={'1px'} >
                <Text>{element}</Text>
            </Flex>
         ))}
    </> )

    //SITE LINK
    else if (type === 'site') return <Link href={content.site_link} isExternal>{content.url}</Link>;

    //IMAGE LINK
    else if (type === 'image') {
        const [isOpen, setIsOpen] = useState(false);
        const [selectedImage, setSelectedImage] = useState<string | null>(null)
      
        const handleImageClick = (url:string) => {
          setSelectedImage(url)
          setIsOpen(true)
        }
      
        return (
        <>
            <Image maxWidth="50%"   cursor="pointer"  src={content.url}  onClick={() => handleImageClick(content.url)}/>
            <CustomModal isOpen={isOpen} onClose={() => setIsOpen(false)} imageUrl={selectedImage as string} />
        </>)
    }
  
    //DOC LINK (PDF, FILE, VIDEO)
    else if (type === 'pdf' || type === 'file' || type === 'video') {
      return (
        <Flex alignItems={'center'} gap='20px' bg='gray_2' borderColor={'border_color'} borderWidth={'1px'}  cursor='pointer' display='inline-flex' p='10px' borderRadius={'.5em'} onClick={() => downloadFile(content.url)} className='components-container' flexDirection='row'>
          <Icon as={MdFileDownload} viewBox="0 0 512 512" boxSize={5}/>
          <Flex flexDirection='column' mt='-1'>
            <Text fontSize={'1.1em'}>{content.file_name}</Text>
            <Text fontWeight='300' fontSize='0.8em' >{formatFileSize(content.file_size)}</Text>
          </Flex>
        </Flex>
        )
      }

    //AUDIO LINK
    else if (type === 'audio') {       
        return (
            <Flex alignItems={'center'}  cursor='pointer' bg='gray_2' borderColor={'border_color'} borderWidth={'1px'}  display='inline-flex' p='10px' borderRadius={'.5em'} className='components-container' flexDirection='row'>
            <Flex flexDirection='column' mt='-1'>
              <Text fontSize={'1.1em'}>{content.file_name}</Text>
              <audio controls src={content.url}>
                {t('NoAudioSupport')}
              </audio>
            </Flex>
          </Flex>
        )
    }
    
    return null
}

//COMPONENT FOR GETTING A MESSAGE STYLE DEPENDING ON THE TYPE, SENDER AND CHANNEL
const MessageComponent = memo(({con, navigate, sender, isScheduled = false, conId}:{con:any, navigate:any, sender:string, isScheduled?:boolean, conId?:number}) => {

    const t_formats = useTranslation('formats').t
     const [showAttachments, setShowAttachments] = useState<boolean>(false)
    
    const memoizedImage = useMemo(() => {
 
        return (<> 
        <Box width={'18px'} height={'18px'} className='hover-effect'  > 
            <Image  src="/images/matil.svg" alt="Tilda" style={{ transition: 'filter 0.3s ease'}} /> 
        </Box>
    </>)},[])

    return(<>
       <svg width="0" height="0">
        <defs>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(0, 102, 204, 0.8)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(102, 51, 255, 0.7)', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
    </svg>
    {isScheduled ?  <>  
        {con.timestamp >= new Date().toISOString() && 
            <Flex gap='10px'  mb='1vh'>
                <Box width={'25px'} height={'25px'} className='hover-effect'  > 
                    {memoizedImage} 
                </Box>
                <Box width={'100%'} > 
                    <Flex gap='10px' alignItems={'center'} justifyContent={'space-between'}> 
                        <Text  fontWeight={'medium'}>Tilda</Text>
                            <Flex gap='5px'> 
                            <Icon color='blue.400' as={FaClockRotateLeft}/>
                            <Countdown timestamp={con.timestamp}/>
                        </Flex>
                    </Flex>
                    <Box mt='10px' fontSize={'.9em'}  borderColor={'blue.100'} borderWidth={'1px'}  borderRadius={'.3rem'} bg={'blue.50'} p={'10px'} width={'100%'}> 
                        <ShowMessages  content={con.content} type={con.type}/>
                    </Box>
                </Box>
            </Flex>
            }</>
            :
            <Flex  gap='10px'  >
                {con.sender_type === 'system' ?
                    <Flex fontSize={'.9em'}  width={'100%'} py='10px' px='5px' gap='15px' alignItems={'center'}>
                        <Box height={'1px'} width={'100%'} bg='border_color'/>
                         <GetSystemMessage message={con.content} navigate={navigate}/>
                        <Box height={'1px'} width={'100%'} bg='border_color'/>
                    </Flex>
                :
                <>
                    {(con.sender_type === 'matilda') ? 
                        <>{con.type === 'function_call' ? <Icon  fill="url(#gradient2)" as={BsStars} boxSize={'22px'}/> : memoizedImage}</>
                        :
                        <Avatar width={'20px'} height={'20px'} size='xs' name={sender}/>
                    }
                   
                    <Box  width={con.type !== 'function_call' ? 'calc(100% - 35px)':'100%'}> 
                        
                        {con.type !== 'function_call'  && 
                        <Flex mb='1vh' fontSize={'.9em'}  justifyContent={'space-between'}> 
                            <Flex gap='30px' alignItems={'center'}> 
                                <Text   fontWeight={'medium'}>{con.type === 'function_call'? t_formats('FunctionCall'):sender}</Text>
                                {(con.content.attachments && con.content.attachments.length > 0)&& 
                                    <Flex gap='5px' onClick={() => setShowAttachments(!showAttachments)} cursor={'pointer'} alignItems={'center'} _hover={{bg:'underline'}}>
                                        <Icon as={HiOutlinePaperClip}/>
                                        <Text>{t_formats('Attached', {count:con.content.attachments.length})}</Text>
                                        <IoIosArrowDown className={showAttachments ? "rotate-icon-up" : "rotate-icon-down"}/>
                                    </Flex>
                                }
                            </Flex>
                            <Text fontWeight={'medium'} color='text_gray' fontSize={'.8em'} whiteSpace={'nowrap'}>{timeAgo(con.timestamp, t_formats)}</Text>
                        </Flex>}
                        <Box borderColor={con.type === 'function_call'? 'border_color':con.type === 'internal_note'?'yellow.200':''} mt={(con.type === 'internal_note')?'10px':''} borderWidth={(con.type === 'internal_note')?'1px':''}  borderRadius={'.3rem'} bg={con.type === 'function_call'?'transparent':con.type === 'internal_note'?'yellow.100':''} p={(con.type === 'internal_note')?'10px':'0'} width={'100%'}>
                            {showAttachments && 
                                <>
                                {con.content.attachments.map((file:{file_name:string, url:string, size:number}, index:number) => (
                                    <Flex maxW='600px' onClick={() => downloadFile(file.url)} mt='.5vh' cursor={'pointer'} key={`attachment-message-${index}`} _hover={{bg:'border_color'}} justifyContent={'space-between'} p='5px' bg='gray.100' borderRadius={'.5em'} borderWidth={'1px'}>
                                        <Text flex='1' minW={0}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{file.file_name}</Text>
                                        <Text fontSize={'.9em'}>{formatFileSize(file.size || 0)}</Text>
                                    </Flex>
                                ))}
                                </>} 
                            <Box fontSize={'.8em'}> 
                            <ShowMessages  content={con.content} type={con.type} conId={conId}/>
                            </Box>
                        </Box>
                     
                    </Box>
                </>} 
            </Flex>
        }
</>)})
    
//COMPONENT FOR SHOWING A SYSTEM MESSAGE
const GetSystemMessage = ({ message, navigate }: { message:  {event: string; description?: {is_primary_conversation?: boolean, conversation_id: number, local_conversation_id:number}}, navigate:any }): JSX.Element => {
    
    const { t } = useTranslation('conversations')
    switch (message.event) {
        case 'merge':
            if (message.description && typeof message.description.is_primary_conversation !== 'undefined' && typeof message.description.conversation_id !== 'undefined') {
                if (message.description.is_primary_conversation) return <Text whiteSpace={'nowrap'}>{parseMessageToBold(t('PrimaryConversation',{conversation_1:message.description.local_conversation_id}))}</Text>
                else return <Text  whiteSpace={'nowrap'}>{t('ConversationMergedMessage')} <span onClick={() => navigate(`/conversations/conversation/${message?.description?.conversation_id}`)} style={{cursor:'pointer', fontWeight: '500',  color:'blue'  }}>{t('Conversation')} #{message.description.local_conversation_id}</span>.</Text>
            }
            return <Text  whiteSpace={'nowrap'}>{t('NoInfo')}</Text>
        case 'agent_transfer':
            return <Text  whiteSpace={'nowrap'}>{t('AgentTransfer')}</Text>
        case 'solved':
            return <Text  whiteSpace={'nowrap'}>{t('SolvedConversation')}</Text>
        case 'closed':
            return <Text  whiteSpace={'nowrap'}>{t('ClosedConversation')}</Text>
        default:
            return <Text whiteSpace={'nowrap'}>{t('NoSystemMessage')}</Text>
    }
}
//MERGING CONVERSATIONS COMPONENT
const MergeBox = ({t, conversationData, clientName, setShowMerge}:MergeBoxProps) => {

    //AUTH CONSTANT
    const auth = useAuth()
    const t_formats = useTranslation('formats').t
    const navigate = useNavigate()
    const { getAccessTokenSilently } = useAuth0()
    const location = useLocation()

    //SHOW CONFIRM
    const [showConfirmMerge, setShowConfirmMerge] = useState<boolean>(false)
    
    //ID VARIABLE
    const [selectedConversationId, setSelectedConversationId] = useState<string>('0')

    //ERROR MESSAGE
    const [errorMessage, setErrorMessage] = useState<string>('')
    
    const ConfirmComponent = () => {
        //BOOLEAN FOR WAIT THE MERGE
        const [waitingConfirmMerge, setWaitingConfirmMerge] = useState<boolean>(false)
        const confirmMerge = async () => {
            setWaitingConfirmMerge(true)
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/conversations/merge/${selectedConversationId}/${conversationData?.local_id}`,  getAccessTokenSilently, method:'put',  auth: auth})
            if (response?.status === 200) {
                const conResponse = await fetchData({endpoint: `${auth.authData.organizationId}/conversations/${conversationData?.id}`, getAccessTokenSilently,requestForm:{...conversationData, status:'closed'},  method:'put',  auth: auth, toastMessages:{'works':t('ConversationMerged'),'failed':t('ConversationMergedFailed')}})
                setWaitingConfirmMerge(false)
                setShowConfirmMerge(false)
                setShowMerge(false)
                navigate(`/conversations${location.search}`)
            }
            else {
                setErrorMessage(t('NoFoundConversation', {id:selectedConversationId}))
                setWaitingConfirmMerge(false)
                setShowConfirmMerge(false)
            }
        }

        return(
             <Box p='15px'> 
                    <Text fontSize={'1.2em'}>{parseMessageToBold(t('ConfirmMergeQuestion', {id1:conversationData?.local_id, id2:selectedConversationId}))}</Text>
                    <Text fontSize={'.8em'}>{t('ConfirmWarning')}</Text>
          
                <Flex mt='2vh' gap='15px' flexDir={'row-reverse'}>
                    <Button  size='sm' variant={'main'} onClick={confirmMerge}>{waitingConfirmMerge?<LoadingIconButton/>:t('Merge')}</Button>
                    <Button  variant={'common'} size='sm' onClick={() => setShowConfirmMerge(false)}>{t('Cancel')}</Button>
                </Flex>
            </Box>
        )
    }

    const memoizedConfirmBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowMerge}> 
            <ConfirmComponent/>
        </ConfirmBox>
    ), [showConfirmMerge])
     
    
    //FUNCTION FOR MERGE
    return(<>
        
        {showConfirmMerge && memoizedConfirmBox}
   
        <Box p='15px'> 
            <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('MergeConversation')}</Text>
            
            <Box mt='2vh' p='10px' boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} borderRadius={'.5rem'}  borderColor={'border_color'} borderWidth={'1px'}> 
                <Flex gap='30px' alignItems={'center'}> 
                    <Flex minW='60px' alignItems={'center'} justifyContent={'center'} p='15px' display={'inline-flex'} bg='blackAlpha.800' borderRadius={'.5em'} >
                        <Text color='white' fontWeight={'medium'} fontSize={'1.1em'}>#{conversationData?.local_id}</Text>
                    </Flex>
                    <Box> 
                        <Text fontSize={'.8em'} color='text_gray'>{timeStampToDate((conversationData?.created_at || ''),t_formats)}, {clientName}</Text>
                        <Text fontSize={'.8em'} fontWeight={'medium'}>{conversationData?.title || t('NoTitle')}</Text>
                    </Box>
                </Flex>
            </Box>
            <Text mt='2vh' fontSize={'.8em'} mb='.5vh' fontWeight={'medium'}>{t('IDMerge')}</Text>
            <Flex alignItems={'center'} gap='5px'> 
                <Text fontSize={'.9em'}> #</Text>
                <Box maxW={'200px'}> 
                    <EditText hideInput={false} placeholder="33" value={selectedConversationId} setValue={(value) => setSelectedConversationId(value)} regex={/^-?\d+(\.\d+)?$/}/>
                </Box>
            </Flex>
            {errorMessage && <Text mt='.5vh' color='red' fontSize={'.9em'}>{errorMessage}</Text>}
 
        
            <Flex   mt='2vh' gap='15px' flexDir={'row-reverse'}>
                <Button  size='sm' variant={'main'}  disabled={!/^-?\d+(\.\d+)?$/.test(selectedConversationId)} isDisabled={selectedConversationId === null} onClick={()=>setShowConfirmMerge(true)}>{t('Merge')}</Button>
                <Button  size='sm' variant={'common'} onClick={() => setShowMerge(false)}>{t('Cancel')}</Button>
            </Flex>
        </Box>
    </>)

}

//CUSTOM MODAL FOR IMAGES
const CustomModal = ({ isOpen, onClose, imageUrl }: { isOpen: boolean; onClose: () => void; imageUrl: string }) => {
    if (!isOpen) return null;
  
    return (
      <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} position="fixed" top={0} left={0} width="100vw" height="100vh" display="flex" justifyContent="center" alignItems="center" zIndex={100000000000000} bg="rgba(0,0,0,0.5)"  onClick={onClose} >
        <MotionBox initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} bg='white' borderRadius="md" padding="1rem" position="relative" onClick={(e) => e.stopPropagation()} >
           <Image src={imageUrl} maxWidth="60vw" maxHeight="90vh" cursor="zoom-in" />
        </MotionBox>
      </MotionBox>
    )
  }