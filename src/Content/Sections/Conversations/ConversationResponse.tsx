/*
    SHOW CONVERSATION INFO IN CONVERSATION SECTION. CONTAINS ALL THE FUNCTIONALITY OF THE CONVERSATION (/conversation/conversation/{conversation_id})
*/

//REACT
import { useState, useRef, useEffect, Dispatch, SetStateAction, Fragment, ChangeEvent, memo, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../../AuthContext"
import { useSession } from "../../../SessionContext"
import DOMPurify from "dompurify"
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Box, Text, Avatar, Icon, Skeleton, Button, IconButton, Tooltip, Textarea, Link, Image, NumberInput, NumberInputField, chakra, shouldForwardProp, useDisclosure, Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion'
import '../../Components/styles.css'
//COMPONENTS
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import TextEditor from "./TextEditor"
import CustomSelect from "../../Components/Reusable/CustomSelect"
import ConfirmBox from "../../Components/Reusable/ConfirmBox" 
import Countdown from "../../Components/Once/CountDown"
import GradientBox from "../../Components/Once/Wave2"
import CustomAttributes from "../../Components/Reusable/CustomAttributes"
//FUNCTIONS
import timeAgo from "../../Functions/timeAgo"
import useOutsideClick from "../../Functions/clickOutside"
import formatFileSize from "../../Functions/formatFileSize"
import downloadFile from "../../Functions/downloadFile"
import timeStampToDate from "../../Functions/timeStampToString"
//ICONS
import { IoIosArrowDown } from "react-icons/io"
import { BsPersonFill, BsThreeDotsVertical,  } from "react-icons/bs"
import { MdFileDownload, } from 'react-icons/md'
import { HiTrash, HiDatabase, HiMenuAlt1 } from "react-icons/hi"
import { TbArrowMerge } from "react-icons/tb"

import { FaClockRotateLeft } from "react-icons/fa6"
import { HiOutlinePaperClip } from "react-icons/hi"
//TYPING
import { ClientData, statesMap, ConversationsData, Conversations, contactDicRegex, ContactChannel, MessagesData, languagesFlags, DeleteHeaderSectionType, ConversationColumn } from "../../Constants/typing"
   
//TYPING
interface RespuestaProps {
    conversationData:ConversationsData | null 
    setConversationData: Dispatch<SetStateAction<ConversationsData | null>>
    messagesList:MessagesData | null
    setMessagesList:Dispatch<SetStateAction<MessagesData | null>>
    clientConversations:Conversations | null
    setClientConversations:Dispatch<SetStateAction<Conversations | null>> | null
    clientData: ClientData | null
    setClientData:Dispatch<SetStateAction<ClientData | null>>
    clientId:number
    deleteHeaderSection: DeleteHeaderSectionType
    socket:any
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
function ConversationResponse ( {conversationData, setClientConversations, clientConversations, setConversationData, messagesList, setMessagesList, clientData, setClientData, clientId, deleteHeaderSection, socket }:RespuestaProps) {

    //TRANSLATION
    const { t } = useTranslation('conversations')
    const t_clients = useTranslation('clients').t
    const t_formats = useTranslation('formats').t

    //CONSTANTS
    const auth = useAuth()
    const session = useSession()
    const navigate = useNavigate()
       
    //SIDE PANEL CONSTANTS FOR MAPPING SELECTORS
    let usersDict:{[key:number]:string} = {}
    if (auth.authData.users) Object.keys(auth.authData?.users).map((key:any) => {if (auth?.authData?.users) usersDict[key] = auth?.authData?.users[key].name})
    usersDict[0] = t('NoAgent')
    usersDict[-1] = 'Matilda'
    let themesDict:{[key:number]:string} = {}
    if (auth.authData?.users) Object.keys(auth.authData?.users).map((key:any) => {if (auth?.authData?.users) themesDict[key] = auth?.authData?.users[key].name})
    const ratingMapDic = {0:`${t('Priority_0')} (0)`, 1:`${t('Priority_1')} (1)`, 2:`${t('Priority_2')} (2)`, 3:`${t('Priority_3')} (3)`, 4:`${t('Priority_4')} (4)`}
    const ratingsList: number[] = Object.keys(ratingMapDic).map(key => parseInt(key))
   
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
    useEffect(() => {if (messageQueue.current.length > 0) processQueue()}, [messagesList])
    
     //BOOLEAN FOR MERGE A CONVERSATION
    const [showMerge, setShowMerge] = useState(false)


    //WIDTH OF CLIENT BOX
    const [clientBoxWidth, setClientBoxWidth] = useState(360)
    const sendBoxWidth = `calc(100vw - 55px - 280px - ${clientBoxWidth}px)`

    //BOOLEAN FOR SHOW CONTACT INFO
    const [showContactoInfo, setShowContactoInfo] = useState<boolean>(false) 
   
    //DEFINE THE EDIT DATA AND THE REFS
    const [conversationDataEdit, setConversationDataEdit] = useState<ConversationsData | null>(conversationData)
    const [clientDataEdit, setClientDataEdit] = useState<ClientData | null>(clientData)

    const conversationDataRef = useRef<ConversationsData | null>(conversationData)
    const clientDataRef = useRef<ClientData | null>(clientData) 
    useEffect(() => {
        conversationDataRef.current = conversationData
        clientDataRef.current = clientData
        setConversationDataEdit(conversationData)
        setClientDataEdit(clientData)
    }, [conversationData, clientData])

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

            if ( data.new_data.id === conversationDataRef?.current?.id) setConversationData(data.new_data)
            if (data.contact_id === clientDataRef.current?.id && setClientConversations) {
                setClientConversations(prev => {
                    if (!prev) return prev
                    const elementToAdd = {created_at:data.new_data.created_at, id:data.new_data.id, local_id:data.new_data.local_id, status:data.new_data.status, title:data.new_data.title, updated_at:data.new_data.updated_at }
                    let updatedPageData
                    if (data.is_new) updatedPageData = [elementToAdd, ...prev.page_data]
                    else updatedPageData = prev.page_data.map(con =>con.id === data.new_data.id ? elementToAdd : con)
                    return {...prev, total_conversations: data.is_new ? prev.total_conversations + 1 : prev.total_conversations, page_data: updatedPageData}
                  })
            }
        })

        //UPDATE A CONVERSATIOPN MESSAGE
        socket.current.on('conversation_messages', (data:any) => {
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
    const handleInputNotesChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setClientDataEdit(prevData => prevData ? ({ ...prevData, notes:DOMPurify.sanitize(event.target.value)}) as ClientData : null)           
    }
    useEffect(() =>{if (clientDataEdit) adjustTextareaHeight(textareaNotasRef.current)}, [clientDataEdit?.notes])

    //UPDATE DATA ON CHANGE
    const updateData = async(section:'conversation' | 'client', newData?:ConversationsData | null) => {       
        const compareData = newData?newData:conversationDataEdit as ConversationsData
        if (section === 'conversation' && JSON.stringify(conversationDataRef.current) !== JSON.stringify(compareData)){
            fetchData({endpoint:`${auth.authData.organizationId}/conversations/${conversationData?.id}`, auth:auth, requestForm:compareData, method:'put', toastMessages:{'works':t('ConversationUpdated', {id:conversationData?.id}),'failed':t('UpdatedFailed')}})
            setConversationData(compareData)
        }
        else if (section === 'client' && JSON.stringify(clientDataRef.current) !== JSON.stringify(clientDataEdit)){
            fetchData({endpoint:`${auth.authData.organizationId}/contacts/${clientData?.id}`, auth:auth, requestForm:clientDataEdit || {}, method:'put', toastMessages:{'works':t_clients('ClientUpdated', {id:clientData?.id}),'failed':t('UpdatedFailed')} })
            setClientData(clientData)
        }
    }

    //UPDATE ASSIGNED USER
    const updateSelector = (key:ConversationColumn, item:number | string) => {
        const newConversationData = {...conversationDataEdit as ConversationsData, [key]:item}
        updateData('conversation', newConversationData)
        if (conversationDataEdit) setConversationDataEdit({...conversationDataEdit, [key]:item})
    }

    //UPDATE A CISTOM ATTRIBUTE
    const updateCustomAttributes = (attributeName:string, newValue:any) => {
        const newConversationData = { ...conversationDataEdit } as ConversationsData
        if (newConversationData.custom_attributes) {
            const updatedCustomAttributes = {...newConversationData.custom_attributes}
            updatedCustomAttributes[attributeName] = newValue
            newConversationData.custom_attributes = updatedCustomAttributes
        }
        updateData('conversation', newConversationData)
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
            let conversationText = `${t('Conversation')} #${conversationDataEdit?.local_id} (${auth.authData.organizationName})\n\n`

            messagesList.messages.forEach(con => {
                const sender = (con.sender_type === -3?t('SystemMessage'):con.sender_type === -2?t('InternalNote'):con.sender_type === -1?'Matilda':con.sender_type === 0?clientDataEdit?.name:auth.authData?.users?.[con.sender_type].name) || ''
                conversationText += `${sender}: ${WriteMessages(con.type, con.content)}\n\n`
            })
            messagesList.scheduled_messages.forEach(con => {
                conversationText += `Matilda: ${WriteMessages(con.type, con.content)}\n\n`
            })

            const blob = new Blob([conversationText], { type: 'text/plain' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `conversation_${conversationDataEdit?.local_id}.txt`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
        
    }

    //TAKE THE CONTROL OF A CONVERSATION
    const takeConversationControl = () => {
        updateSelector('user_id', auth.authData?.userId || -1 )
        fetchData({endpoint:`${auth.authData.organizationId}/conversations/${conversationDataEdit?.id}/cancel_scheduled_messages`, method:'post', auth})
    }

    //COMPONENT FOR DELETING A CONVERSATION
    const DeleteComponent = ({t}:{t:any}) => {
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)
        const deleteConversation= async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/bin`, requestForm:{conversation_ids:[conversationData?.id], days_until_deletion:30}, setWaiting:setWaitingDelete, auth:auth, method:'post', toastMessages:{'works':t('ConversationDeleted'),'failed':t('ConversationDeletedFailed')}})
            if (response?.status === 200) {
                session.dispatch({type:'DELETE_VIEW_FROM_CONVERSATION_LIST'})
                session.dispatch({type:'EDIT_HEADER_SECTION_CONVERSATION', payload:{new_data:conversationDataEdit, is_new:false, is_deleted:true, auth}})
                const responseOrg = await fetchData({endpoint:`${auth.authData.organizationId}/user`, auth})
                auth.setAuthData({views: responseOrg?.data})
                deleteHeaderSection({ description: '', code: conversationDataRef?.current?.id as number, local_id:conversationDataRef?.current?.local_id, type: 'conversation'})
                setShowConfirmDelete(false)
            }
        }

        //BOX FOR CONFIRM THE DELETE
        return(<>
            <Box p='20px'> 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ConfirmDelete')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Text >{t('ConfirmDeleteQuestion')}</Text>
            </Box>
            <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                <Button  size='sm'  bg='red.100' color='red.600' _hover={{bg:'red.200'}} onClick={deleteConversation}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                <Button  size='sm' _hover={{color:'blue.400'}}  onClick={()=>setShowConfirmDelete(false)}>{t('Cancel')}</Button>
            </Flex>
        </>)
    }

 
    //COPONENT FOR RENDERING THE MESSAGES
    const MessagesContent = () => {
        return (<>
                {(messagesList === null ) ? <> {Array.from({ length: 8 }).map((_, index) => (<Skeleton key={`skeleton-${index}`} height="1em" mt='10px' />))}</>
                : 
                <>
                    {messagesList.messages.map((con:any, index:number) => (               
                    <Box  mt={'5vh'} key={`message-${index}`} ref={index === (messagesList?.messages.length || 0) - 1 ? lastMessageRef : null}> 
                        <MessageComponent con={con} sender={(con.sender_type === -3?'':con.sender_type === -2?t('InternalNote'):con.sender_type === -1?'Matilda':con.sender_type === 0?clientDataEdit?.name:auth.authData?.users?.[parseInt(con.sender_type)].name) || ''} navigate={navigate}/>
                    </Box>))}

                    {messagesList.scheduled_messages.map((con:any, index:number) =>(
                        <Box  mt={'5vh'} gap='10px'  key={`scheduled-message-${index}`} ref={index === (messagesList?.messages.length || 0) - 1 ? lastMessageRef : null}> 
                            <MessageComponent con={con} isScheduled={true} navigate={navigate} sender={'Matilda'} />
                        </Box>)
                    )}
                </>}           
       
        </>)
    }

    //MEMOIZED BOXES
   const memoizedDeleteBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowConfirmDelete}> 
            <DeleteComponent t={t}/>
        </ConfirmBox>
    ), [showConfirmDelete])
    const memoizedMergeBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowMerge}> 
            <MergeBox t={t} conversationData={conversationDataEdit} clientName={clientDataEdit?.name || t('NoClient')} setShowMerge={setShowMerge}/>
        </ConfirmBox>
    ), [showMerge])
   

    //FRONT
    return(<> 
 
        <Flex height={'calc(100vh - 120px)'} ref={scrollRef1} maxW={'calc(100vw - 55px)'}>
            <Box position={'relative'}  p='2vw' bg='#f1f1f1' overflow={'scroll'}   width={'280px'}   borderRightWidth={'1px'} borderRightColor='gray.200' >
                <Text mb='.5vh'fontWeight={'medium'} fontSize='.9em' >{t('theme')}</Text>
                <Skeleton isLoaded={conversationDataEdit !== null}>
                    <CustomSelect  isDisabled={conversationDataEdit?.user_id === -1 ||conversationDataEdit?.status === 'closed'} containerRef={scrollRef1}  selectedItem={conversationDataEdit?.theme} options={auth.authData?.conversation_themes || []} setSelectedItem={(value) => updateSelector('theme',value)} hide={false} />
                </Skeleton>

                <Text mb='.5vh'fontWeight={'medium'} fontSize='.9em' mt='2vh' >{t('user_id')}</Text>
                <Skeleton isLoaded={conversationDataEdit !== null}>
                    <CustomSelect isDisabled={conversationDataEdit?.user_id === -1 ||conversationDataEdit?.status === 'closed'}  containerRef={scrollRef1}  selectedItem={conversationDataEdit?.user_id} options={Object.keys(usersDict).map(key => parseInt(key))} labelsMap={usersDict} setSelectedItem={(value) => updateSelector('user_id',value)} hide={false} />
                </Skeleton>

                <Text mb='.5vh' fontWeight={'medium'}fontSize='.9em'  mt='2vh'>{t('urgency_rating')}</Text>
                <Skeleton isLoaded={conversationDataEdit !== null}>
                    <CustomSelect isDisabled={conversationDataEdit?.user_id === -1 ||conversationDataEdit?.status === 'closed'}  containerRef={scrollRef1}  selectedItem={conversationDataEdit?.urgency_rating} options={ratingsList} labelsMap={ratingMapDic} setSelectedItem={(value) => updateSelector('urgency_rating',value)} hide={false} />
                </Skeleton>
                
                <Text mb='.5vh'fontWeight={'medium'} mt='2vh' fontSize='.9em'>{t('created_at')}</Text>
                <Skeleton isLoaded={conversationDataEdit !== null}>
                    <Text fontSize={'.9em'}>{timeAgo(conversationDataEdit?.created_at, t_formats)}</Text>
                </Skeleton>
     
                <Text mb='.5vh'fontWeight={'medium'} mt='2vh' fontSize='.9em'>{t('updated_at')}</Text>
                <Skeleton isLoaded={conversationDataEdit !== null}>
                    <Text fontSize={'.9em'}>{timeAgo(conversationDataEdit?.updated_at, t_formats)}</Text>
                </Skeleton>

                <Skeleton isLoaded={conversationDataEdit !== null}>
                    <CustomAttributes  disabled={conversationDataEdit?.user_id === -1 ||conversationDataEdit?.status === 'closed'}   motherstructureType="conversation" customAttributes={conversationDataEdit?.custom_attributes || []} updateCustomAttributes={updateCustomAttributes}/>
                </Skeleton>
            </Box>

            <MotionBox initial={{ width: sendBoxWidth  }} animate={{ width: sendBoxWidth}} exit={{ width: sendBoxWidth }} transition={{ duration: '.2' }}  
              width={sendBoxWidth}    overflowY={'hidden'}  borderRightWidth={'1px'} borderRightColor='gray.200' >
                <Flex height={'calc(100vh - 120px)'} position='relative' flexDir={'column'}> 
                  
                     <Flex justifyContent={'space-between'} alignItems={'center'} height={'50px'} px='20px'>
                        <Skeleton isLoaded={conversationDataEdit !== null}>
                            <Text fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{conversationDataEdit?.title}</Text>
                        </Skeleton>
                        <Box  position={'relative'}> 
                            <IconButton ref={settingsButtonRef} aria-label='conver-settings' icon={<BsThreeDotsVertical/>} size='sm' isRound bg='transparent'  _hover={{bg:'brand.gray_1'}}  onClick={() => {setShowSettings(!showSettings)}}/>
                            <AnimatePresence> 
                                {showSettings && 
                                <MotionBox initial={{ opacity: 0, marginTop: -5 }} animate={{ opacity: 1, marginTop: 5 }}  exit={{ opacity: 0,marginTop: -5}} transition={{ duration: '.2', ease: 'easeOut'}}
                                maxH='40vh' right={0} overflow={'scroll'} top='100%' gap='10px' ref={settingsBoxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.300'}>
                                 
                                    <Flex  px='15px' py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'brand.hover_gray'}} onClick={() => {setShowMerge(true);setShowSettings(false)}}>
                                        <Icon color='gray.600'  boxSize={'15px'} as={TbArrowMerge }/>
                                        <Text whiteSpace={'nowrap'}>{t('MergeConversation')}</Text>
                                    </Flex>
                                    <Flex  px='15px' py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'brand.hover_gray'}} onClick={() => {exportConversation(messagesList);setShowSettings(false)}}>
                                        <Icon color='gray.600'  boxSize={'15px'} as={HiMenuAlt1}/>
                                        <Text whiteSpace={'nowrap'}>{t('ExportConversation')}</Text>
                                    </Flex>
                                    <Flex  onClick={() => {setShowSettings(false) ;setShowConfirmDelete(true)}}  px='15px' py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'brand.hover_gray'}}>
                                        <Icon color='gray.600' boxSize={'15px'} as={HiTrash}/>
                                        <Text whiteSpace={'nowrap'}>{t('Delete')}</Text>
                                    </Flex>
                                </MotionBox>}   
                            </AnimatePresence>                 
                        </Box>                
                    </Flex>  
                    <Box position={'relative'} flex='1' overflow={'hidden'} width={'100%'} px='20px' bg={ conversationDataEdit?.status !== 'closed'?'transparent':'gray.200'} backdropBlur='10px'  >

                        {(conversationDataEdit?.user_id === -1 && conversationDataEdit.status !== 'closed') ? 
                             <GradientBox scrollRef={scrollRef}> 
                                <MessagesContent/>
                            </GradientBox> 
                        :
                        <Box ref={scrollRef} position={'relative'} flex='1'   width={'100%'} px='20px' overflow={'scroll'}  height={'calc(100% - 20px)'}  >
                            <MessagesContent/>
                        </Box>}
                    </Box>
                    {(conversationDataEdit) && <TextEditor conversationData={conversationDataEdit as ConversationsData} updateData={updateData} takeConversationControl={takeConversationControl}  deleteHeaderSection={deleteHeaderSection} clientName={clientDataEdit?.name}/>}

                </Flex>
            </MotionBox>
            
            <MotionBox width={clientBoxWidth + 'px'}  overflowY={'scroll'} initial={{ width: clientBoxWidth + 'px' }} animate={{ width: clientBoxWidth + 'px' }} exit={{ width: clientBoxWidth + 'px' }} transition={{ duration: '.2'}} 
                bg='brand.gray_2' py='2vw' px={clientBoxWidth === 360 ?'2vw':'8px'} ref={scrollRef2} overflowX={'hidden'}>
 
                <AnimatePresence>
                    {clientBoxWidth === 360 ?<> 
                  
                    <MotionBox whiteSpace={'nowrap'} overflow={'hidden'} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}  transition={{ duration: '.3' }} > 
                             
                            <Flex justifyContent={'space-between'} mb='2vh' alignItems={'center'}> 
                                <Flex flex='1'   minW={0}     gap='15px' alignItems={'center'}>
                                    <Avatar name={clientDataEdit?.name} size='sm'/>
                                    <Skeleton  minW={0}   isLoaded={clientDataEdit !== null}>
                                        <Text fontSize={'1.1em'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} fontWeight={'medium'}>{clientDataEdit?.name}</Text>
                                    </Skeleton>
                                </Flex>
                                <Flex alignItems={'center'}> 
                                    <IconButton isRound variant={'common'} size='sm' onClick={()=>setShowContactoInfo(!showContactoInfo)} aria-label="show-client" icon={<IoIosArrowDown size={'16px'} className={showContactoInfo ? "rotate-icon-down" : "rotate-icon-up" }/>}/>
                                    <Tooltip label={t('HideClient')}  hasArrow={true} placement='left' color='black' bg='white' borderRadius='.4rem' fontSize='.75em' p='5px'>
                                        <Flex justifyContent='center' alignItems='center' width={'36px'} height={'36px'}  cursor='pointer' borderRadius='.4rem' color='gray.600' _hover={{bg:'brand.blue_hover', color:'brand.text_blue'  }} onClick={() => setClientBoxWidth(50)}>
                                            <Icon as={BsPersonFill} boxSize='18px'/>
                                        </Flex>
                                    </Tooltip>
                                </Flex>
                            </Flex>
                            
                            <motion.div initial={false} animate={{height:showContactoInfo?0:'auto' }} exit={{height:showContactoInfo?'auto':0 }} transition={{duration:.2}} style={{overflow:'hidden', padding:'5px', maxHeight:1000}}> 
                                <Skeleton isLoaded={clientDataEdit !== null}>
                                    {clientDataEdit && <>
                                    {Object.keys(clientDataEdit).map((con, index) => (
                                            <Fragment key={`contact-map-${index}`}>
                                                {((Object.keys(contactDicRegex).includes(con)) && clientDataEdit[con as ContactChannel]&& clientDataEdit[con as ContactChannel] !== '') &&
                                                    <Flex fontSize='.9em' mt='1vh' alignItems={'center'} gap='10px' key={`contact-type-${index}`}> 
                                                        <Box width={'70px'}> 
                                                            <Text fontWeight={'medium'} color='gray'>{t_clients(con)}</Text>
                                                        </Box>
                                                        <Box flex='1' minW={0}> 
                                                            <Text textOverflow={'ellipsis'} overflow={'hidden'} whiteSpace={'nowrap'}>{clientDataEdit[con as ContactChannel]}</Text>
                                                        </Box>
                                                </Flex>}
                                            </Fragment>
                                        ))}
                                    </>}
                                </Skeleton>
                                <Skeleton isLoaded={clientDataEdit !== null}>
                                <Flex mt='2vh' alignItems={'center'}fontSize='.9em' gap='10px'  > 
                                    <Box width={'70px'}   > 
                                        <Text  fontWeight={'medium'} color='gray' >{t_clients('language')}</Text>
                                    </Box>
                                    <Box flex='1' > 
                                        <Text textOverflow={'ellipsis'} overflow={'hidden'} whiteSpace={'nowrap'}>{(clientDataEdit?.language && clientDataEdit?.language in languagesFlags) ? languagesFlags[clientDataEdit?.language][0] + ' ' + languagesFlags[clientDataEdit?.language][1]:'No detectado'}</Text>
                                    </Box>
                                </Flex>
                                </Skeleton>
                                <Skeleton isLoaded={clientDataEdit !== null}>
                                    <Flex fontSize='.9em' gap='10px' mt='2vh'>
                                        <Box width='70px'> 
                                            <Text  fontWeight={'medium'} color='gray' mt='7px' >{t_clients('notes')}</Text>
                                        </Box>
                                        <Textarea  maxLength={500} height={'auto'} onBlur={() => updateData('client')} minHeight={'37px'} ref={textareaNotasRef} placeholder={`${t_clients('notes')}...`} maxH='300px' value={clientDataEdit?.notes} onChange={handleInputNotesChange} p='8px'  resize={'none'} borderRadius='.5rem' rows={1} fontSize={'.9em'}  borderColor='transparent' _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "brand.text_blue", borderWidth: "2px"}}/>
                                     </Flex>
                                </Skeleton>

                            </motion.div>
                    
                        <Box width={'100%'} mt='3vh' mb='3vh' height={'1px'} bg='gray.300'/>
                        <Text fontWeight={'medium'} fontSize={'1.1em'}>{t('Conversations')}</Text>
                        <Skeleton isLoaded={clientDataEdit !== null}>
                            <Box mt='2vh' position={'relative'}> 
                                    {clientConversations && <>
                                    {clientConversations.page_data.map((con, index) => (
                                        <Box position={'relative'} key={`conversations-${index}`} onClick={() => {navigate(`/conversations/conversation/${con.id}`)}}  p='10px' borderRadius={'.3rem'} cursor={'pointer'} bg={conversationDataEdit?.id === con.id ? 'white':'transparent'} _hover={{bg:conversationDataEdit?.id  === con.id ?'white':'brand.blue_hover'}}>
                                            
                                            {index !== clientConversations.page_data.length - 1 && <Box position={'absolute'} height={'calc(100%)'} mt='10px' ml='4px'  width={'2px'} bg='gray.400' zIndex={1}/>}

                                            <Flex alignItems={'center'}  gap='20px'> 
                                                <Box borderRadius={'.2rem'}  bg={statesMap[con.status as 'new' | 'open' | 'pending' | 'solved' | 'closed'][1]} zIndex={10} height={'10px'} width='10px' />
                                           
                                                <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} fontSize={'.9em'}>{con.title ? con.title:t('NoDescription')}</Text>
                                            </Flex>
                                            <Box ml='30px' >
                                                <Text mt='5px' fontSize={'.8em'} color='gray' whiteSpace={'nowrap'} >{timeAgo(con.created_at as string, t_formats)}</Text>
                                                <Text  mt='5px'  fontSize={'.8em'}><span style={{fontWeight:'500'}}>{t('status')}</span> {t(con.status as string)}</Text>
                                            </Box>
                                        </Box>
                                    ))}
                                </>}
                            </Box>
                        </Skeleton>
                    </MotionBox>
                    </>:
                    <MotionBox initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}  transition={{ duration: '.3'}} > 
                       <Tooltip label={t('ExpandClient')}  hasArrow={true} placement='left' bg='black'  borderRadius='.4rem' fontSize='.75em' p='5px'>
                            <Flex justifyContent='center' alignItems='center' width={'36px'} height={'36px'}  cursor='pointer' borderRadius='.4rem' color='gray.700' _hover={{bg:'blue.50', color:'blue.300'  }} onClick={() => setClientBoxWidth(360)}>
                                <Icon as={BsPersonFill} boxSize='18px'/>
                            </Flex>
                        </Tooltip>
                    </MotionBox>
                    }
                </AnimatePresence>
            </MotionBox>
        </Flex>
        
        {showConfirmDelete && memoizedDeleteBox}   
        {showMerge && memoizedMergeBox }
    </>)
}

export default ConversationResponse


//COMPONENT FOR SHOWING THE CORREPONDING STYLE OF A MESSAGE
const ShowMessages = ({type, content}:{type:string, content:any}) => {
    
    
    //MAIL OR PLAIN
    if (type === 'plain' || type === 'email') {
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
        const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/
        const boldRegex = /\*\*(.*?)\*\*/
  
        // Creamos una nueva expresión regular combinada
        const combinedRegex = new RegExp(`(${emailRegex.source}|${urlRegex.source}|${boldRegex.source})`, 'gi');
        
        // Dividimos el contenido del texto utilizando la expresión regular combinada
        let parts = content.text.split(combinedRegex);
    
        // Filtramos los elementos undefined de la lista resultante
        parts = parts.filter((part:any) => part !== undefined && part !== '');
        
        parts = parts.reduce((acc:any, part:string, index:number, array:any) => {
          if (boldRegex.test(part) && index < array.length - 1 && part.replace(/\*\*/g, '') === array[index + 1]) {
            acc.push(part)
            array.splice(index + 1, 1)
          } 
          else acc.push(part)
          return acc
        }, [])
  
          return (<> 
              <span style={{ wordBreak: 'break-word'}}>
                  {parts.map((part:string, index:number) => {
                      if (emailRegex.test(part)) {
                          return (
                              <a key={index} href={`mailto:${part}`} style={{ color: '#1a73e8', wordBreak: 'break-all', whiteSpace: 'pre-line' }}>{part}</a>)
                      } else if (urlRegex.test(part)) {
                           return (
                              <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#1a73e8', wordBreak: 'break-all', whiteSpace: 'pre-line' }}>{part}</a>)
                      }
                       else if (boldRegex.test(part)) {
                        const boldText = part.replace(/\*\*/g, '')
                        return <span style={{fontWeight:500}} key={index}>{boldText}</span>
                      } 
                   
                      else return <span key={index}>
                        {part.split('\n').map((line, i) => (
                            <Fragment key={i}>
                                {i > 0 && <br />}
                                {line.startsWith('#')?<><span style={{fontWeight:'500'}}>{line.replace(/^#+\s*/, '')}</span> <br /></>:line}
                            </Fragment>
                        ))}
                    </span>
                })}
              </span>
              {(content?.sources && content?.sources.length > 0) && 
              <div style={{marginTop:'10px'}}>
              <span style={{fontWeight:'500'}} >Fuentes</span>
                {content.sources.map((source:{title:string, uuid:string, help_center_id:string}, index:number) => (
                    <Flex key={`source-${index}`} cursor={'pointer'} alignItems={'center'} justifyContent={'space-between'} p='5px' borderRadius={'.5rem'} _hover={{bg:'brand.gray_1'}} onClick={() => window.open(`https://www.help.matil.ai/${source.help_center_id}/article/${source.uuid}`, '_blank')} >
                        <span>{source.title}</span>
                        <svg viewBox="0 0 512 512"width="12"  height="12" style={{transform:'rotate(-90deg)'}}  fill="currentColor" ><path d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path></svg>
                    </Flex>
                ))}
              </div>}
          </>)
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
        const { isOpen, onOpen, onClose } = useDisclosure()
        const [selectedImage, setSelectedImage] = useState<string | null>(null)
      
        const handleImageClick = (url:string) => {
          setSelectedImage(url)
          onOpen()
        }
      
        return (<>
            <Image maxWidth="50%"  cursor="pointer"  src={content.url}  onClick={() => handleImageClick(content.url)}/>
                <Modal isOpen={isOpen} onClose={onClose} size="full"   closeOnOverlayClick={true}>
                <ModalOverlay />
                <ModalContent bg="white" onClick={onClose} boxShadow="none">
                    <ModalCloseButton />
                    <ModalBody display="flex" justifyContent="center" alignItems="center">
                    <Image   cursor="zoom-in" onClick={(e) => e.stopPropagation()} src={selectedImage as string} maxWidth="60vw" maxHeight="90vh" />
                    </ModalBody>
                </ModalContent>
                <style>{`
                        .zoom-image {
                        transition: transform 0.3s ease; /* Animación suave */
                        }
                        .zoom-image:hover {
                        transform: scale(1.1); /* Ampliar imagen al hacer hover */
                        }
                    `}</style>
            </Modal>
        </>)
    }
  
    //DOC LINK (PDF, FILE, VIDEO)
    else if (type === 'pdf' || type === 'file' || type === 'video') {
      return (
        <Flex alignItems={'center'} gap='20px' bg='gray.100' borderColor={'gray.300'} cursor='pointer' borderWidth={'1px'} display='inline-flex' p='10px' borderRadius={'.5em'} onClick={() => downloadFile(content.url)} className='components-container' flexDirection='row'>
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
            <Flex alignItems={'center'} bg='gray.100' borderColor={'gray.300'} cursor='pointer' borderWidth={'1px'} display='inline-flex' p='10px' borderRadius={'.5em'} className='components-container' flexDirection='row'>
            <Flex flexDirection='column' mt='-1'>
              <Text fontSize={'1.1em'}>{content.file_name}</Text>
              <audio controls src={content.url}>
                Tu navegador no soporta el elemento de audio.
              </audio>
            </Flex>
          </Flex>
        )
    }
    
    return null
}

//COMPONENT FOR GETTING A MESSAGE STYLE DEPENDING ON THE TYPE, SENDER AND CHANNEL
const MessageComponent = memo(({con, navigate, sender, isScheduled = false}:{con:any, navigate:any, sender:string, isScheduled?:boolean}) => {

    const t_formats = useTranslation('formats').t

    const [showAttachments, setShowAttachments] = useState<boolean>(false)
    
    return(<>
    {isScheduled ?  <>  
        {con.timestamp >= new Date().toISOString() && 
            <Flex gap='10px'  mb='1vh'>
                <Box width={'25px'} height={'25px'} className='hover-effect'  > 
                    <Image src="/images/matil.svg"  /> 
                </Box>
                <Box width={'100%'} > 
                    <Flex gap='10px' alignItems={'center'} justifyContent={'space-between'}> 
                        <Text  fontWeight={'medium'}>Matilda</Text>
                            <Flex gap='5px'> 
                            <Icon color='blue.400' as={FaClockRotateLeft}/>
                            <Countdown timestamp={con.timestamp}/>
                        </Flex>
                    </Flex>
                    <Box mt='10px' borderColor={'blue.100'} borderWidth={'1px'}  borderRadius={'.3rem'} bg={'blue.50'} p={'10px'} width={'100%'}> 
                        <ShowMessages  content={con.content} type={con.type}/>
                    </Box>
                </Box>
            </Flex>
            }</>
            :
            <Flex fontSize='.9em' gap='10px'  >
                {con.sender_type === -3 ?
                    <Flex width={'100%'} py='10px' px='5px' gap='15px' alignItems={'center'}>
                        <Box height={'1px'} width={'100%'} bg='gray.300'/>
                         <GetSystemMessage message={con.content} navigate={navigate}/>
                        <Box height={'1px'} width={'100%'} bg='gray.300'/>
                    </Flex>
                :
                <>
                    {con.sender_type === -1 ? 
                        <Box width={'25px'} height={'25px'} className='hover-effect'  > 
                            <Image src="/images/matil.svg"  /> 
                        </Box>
                        :
                        <Avatar width={'25px'} height={'25px'} size='xs' name={sender}/>
                    }
                    <Box  width={'calc(100% - 35px)'}> 
                         <Flex mb='1vh' justifyContent={'space-between'}> 
                            <Flex gap='30px' alignItems={'center'}> 
                                <Text fontWeight={'medium'}>{sender}</Text>
                                {(con.content.attachments && con.content.attachments.length > 0)&& 
                                    <Flex gap='5px' onClick={() => setShowAttachments(!showAttachments)} cursor={'pointer'} alignItems={'center'} _hover={{bg:'underline'}}>
                                        <Icon as={HiOutlinePaperClip}/>
                                        <Text>{con.content.attachments.length} adjunto{con.content.attachments.length === 1 ? '':'s'}</Text>
                                        <IoIosArrowDown className={showAttachments ? "rotate-icon-up" : "rotate-icon-down"}/>
                                    </Flex>
                                }
                            </Flex>
                            <Text fontWeight={'medium'} color='gray.600' fontSize={'.85em'} whiteSpace={'nowrap'}>{timeAgo(con.timestamp, t_formats)}</Text>
                        </Flex>
 
                        <Box borderColor={con.sender_type === -2?'yellow.200':''} mt={con.sender_type === -2?'10px':''} borderWidth={con.sender_type === -2?'1px':''}  borderRadius={'.3rem'} bg={con.sender_type === -2?'yellow.100':''} p={con.sender_type === -2?'10px':'0'} width={'100%'}>
                            {showAttachments && 
                                <>
                                {con.content.attachments.map((file:{file_name:string, url:string, size:number}, index:number) => (
                                    <Flex maxW='600px' onClick={() => downloadFile(file.url)} mt='.5vh' cursor={'pointer'} key={`attachment-message-${index}`} _hover={{bg:'gray.200'}} justifyContent={'space-between'} p='5px' bg='gray.100' borderRadius={'.5em'} borderWidth={'1px'}>
                                        <Text flex='1' minW={0}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{file.file_name}</Text>
                                        <Text fontSize={'.9em'}>{formatFileSize(file.size || 0)}</Text>
                                    </Flex>
                                ))}
                                </>} 
                            <ShowMessages  content={con.content} type={con.type}/>
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
                if (message.description.is_primary_conversation) return <Text whiteSpace={'nowrap'}>{t('PrimaryConversation',{conversation_1:message.description.local_conversation_id})}</Text>
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
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/conversations/merge/${selectedConversationId}/${conversationData?.local_id}`,  method:'put',  auth: auth})
            if (response?.status === 200) {
                const conResponse = await fetchData({endpoint: `${auth.authData.organizationId}/conversations/${conversationData?.id}`, requestForm:{...conversationData, status:'closed'},  method:'put',  auth: auth, toastMessages:{'works':t('ConversationMerged'),'failed':t('ConversationMergedFailed')}})
                setWaitingConfirmMerge(false)
                setShowConfirmMerge(false)
                setShowMerge(false)
            }
            else {
                setErrorMessage(t('NoFoundConversation', {id:selectedConversationId}))
                setWaitingConfirmMerge(false)
                setShowConfirmMerge(false)
            }
        }

        return(<>
             <Box p='15px'> 
                    <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ConfirmMerge')}</Text>
                    <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                    <Text>{t('ConfirmMergeQuestion_1')} <span style={{fontWeight:'500'}}>#{conversationData?.local_id}</span> {t('ConfirmMergeQuestion_2')} <span style={{fontWeight:'500'}}>#{selectedConversationId}?</span></Text>
                </Box>
                <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                    <Button  size='sm' bg={'blackAlpha.800'} _hover={{bg:'blackAlpha.900'}} color={'white'} onClick={confirmMerge}>{waitingConfirmMerge?<LoadingIconButton/>:t('Merge')}</Button>
                    <Button  _hover={{color:'blue.400'}} size='sm' onClick={() => setShowConfirmMerge(false)}>{t('Cancel')}</Button>
                </Flex>
                </>
        )
    }
    //FUNCTION FOR MERGE
    

    return(<>
        
        {showConfirmMerge &&
            <ConfirmBox setShowBox={setShowConfirmMerge}> 
                <ConfirmComponent/>
        </ConfirmBox>}

            <Box p='20px'> 
            <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('MergeConversation')}</Text>
            <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>  
            <Box p='10px' boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} borderRadius={'.5rem'} bg='gray.200' borderColor={'gray.300'} borderWidth={'1px'}> 
                <Flex gap='30px' alignItems={'center'}> 
                    <Flex minW='60px' alignItems={'center'} justifyContent={'center'} p='15px' display={'inline-flex'} bg='blackAlpha.800' borderRadius={'.5em'} >
                        <Text color={'gray.200'} fontWeight={'medium'} fontSize={'1.1em'}>#{conversationData?.local_id}</Text>
                    </Flex>
                    <Box> 
                        <Text color='gray.600'>{timeStampToDate((conversationData?.created_at || ''),t_formats)}, {clientName}</Text>
                        <Text  fontWeight={'medium'}>{conversationData?.title || t('NoTitle')}</Text>
                    </Box>
                </Flex>
            </Box>
            <Text mt='4vh' mb='.5vh' fontWeight={'medium'}>{t('IDMerge')}</Text>
            <NumberInput width={'150px'} defaultValue={0}  min={0} max={1000000} size='sm' value={selectedConversationId} onChange={(value) => setSelectedConversationId(value)} clampValueOnBlur={false}>
                <NumberInputField  borderRadius='.7rem'  p='7px' _focus={{  p:'6px',borderColor: "rgb(77, 144, 254)", borderWidth: "2px" }} />
            </NumberInput>
            {errorMessage && <Text mt='.5vh' color='red' fontSize={'.9em'}>{errorMessage}</Text>}
        </Box>
        
        <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
            <Button  size='sm' bg='blackAlpha.800' color='white' _hover={{bg:'blackAlpha.900'}}  isDisabled={selectedConversationId === null} onClick={()=>setShowConfirmMerge(true)}>{t('Merge')}</Button>
            <Button  size='sm' _hover={{color:'blue.400'}} onClick={() => setShowMerge(false)}>{t('Cancel')}</Button>
        </Flex>
    </>)

}