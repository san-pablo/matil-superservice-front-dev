/*
    MAIN CLIENT FUNCTION (clients/client/{contact_id} or conversations/conversation/{conversation_id}/client)
*/

import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent, Dispatch, SetStateAction, Fragment, lazy, Suspense, useMemo } from "react"
import { useAuth } from "../../../AuthContext"
import { useSession } from "../../../SessionContext"
import { useLocation, useNavigate } from "react-router-dom"
import DOMPurify from 'dompurify'
import { useTranslation } from 'react-i18next'
//FRONT
import { Flex, Box, Text, Icon, Textarea, Avatar, Button, Skeleton, IconButton, Tooltip, chakra, shouldForwardProp } from '@chakra-ui/react'
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion'
//FETCH DATA
import fetchData from "../../API/fetchData"
//COMPONENTS
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import CustomSelect from "../../Components/Reusable/CustomSelect"
import Table from "../../Components/Reusable/Table"
import EditText from "../../Components/Reusable/EditText"
import ConfirmmBox from "../../Components/Reusable/ConfirmBox"
import CreateBusiness from "../Businesses/CreateBusiness" 
import StateMap from "../../Components/Reusable/StateMap"
import CustomAttributes from "../../Components/Reusable/CustomAttributes"
//FUNCTIONS
import useOutsideClick from "../../Functions/clickOutside"
import timeAgo from "../../Functions/timeAgo"
import timeStampToDate from "../../Functions/timeStampToString"
import parseMessageToBold from "../../Functions/parseToBold"
//ICONS
import { FaPlus, FaArrowRight, FaBuilding } from "react-icons/fa6"
import { RxCross2 } from "react-icons/rx"
import { BsPersonFill } from "react-icons/bs"
import { TbArrowMerge, TbKey } from 'react-icons/tb'
import { MdBlock } from "react-icons/md"
import { FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa'
import { IoIosArrowForward, IoIosArrowBack, IoIosArrowDown } from "react-icons/io"
//TYPING
import { ClientData, Conversations, contactDicRegex, ContactChannel, Channels, logosMap, HeaderSectionType, DeleteHeaderSectionType, languagesFlags, ContactBusinessesTable, ConversationColumn, Clients } from "../../Constants/typing"
import showToast from "../../Components/Reusable/ToastNotification"
 
//COMPONENTS    
const Business = lazy(() => import('../Businesses/Business'))

//TYPING
interface ClientProps {
    comesFromConversation:boolean
    addHeaderSection:HeaderSectionType
    deleteHeaderSection: DeleteHeaderSectionType
    clientData?:ClientData | null
    setClientData?:Dispatch<SetStateAction<ClientData | null>>
    clientConversations?:Conversations | null
    setClientConversations?:Dispatch<SetStateAction<Conversations | null>>
    businessData?:ContactBusinessesTable | null
    setBusinessData?:Dispatch<SetStateAction<ContactBusinessesTable | null>>
    businessClients?:Clients | null
    setBusinessClients?:Dispatch<SetStateAction<Clients | null>>
    socket:any
}
type Status = 'new' | 'open' | 'solved' | 'pending' | 'closed'
const validStatuses: Status[] = ['new', 'open', 'solved', 'pending', 'closed']

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})
 
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
    else if (column === 'user_id') return  <Text fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element === -1 ?'Matilda':element === 0 ? t('NoAgent'):(auth?.authData?.users?.[element as string | number].name || '')}</Text>
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
function Client ({comesFromConversation,  socket, addHeaderSection, deleteHeaderSection, clientData, setClientData, clientConversations, setClientConversations, businessData, setBusinessData, businessClients, setBusinessClients}: ClientProps) {
    
    //TRANSLATION
    const { t } = useTranslation('clients')
    const t_conver = useTranslation('conversations').t
    const t_formats = useTranslation('formats').t

    //CONSTANTS
    const auth = useAuth()
    const session = useSession()
    const location = useLocation().pathname
    const navigate = useNavigate()
    let languagesMap:any = {}
    for (const key in languagesFlags) {
        if (languagesFlags.hasOwnProperty(key)) {
            const values = languagesFlags[key]
            languagesMap[key] = values[0]
        }
    }

    //TABLE MAPPING
    const columnsConversationsMap:{[key in ConversationColumn]:[string, number]} = {id: [t_conver('id'), 50], local_id: [t_conver('local_id'), 50], status:  [t_conver('status'), 100], channel_type: [t_conver('channel_type'), 150], theme:  [t_conver('theme'), 200], user_id: [t_conver('user_id'), 200], created_at: [t_conver('created_at'), 150],updated_at: [t_conver('updated_at'), 150], solved_at: [t_conver('solved_at'), 150],closed_at: [t_conver('closed_at'), 150],title: [t_conver('title'), 300], urgency_rating: [t_conver('urgency_rating'), 130], deletion_date: [t_conver('deletion_date'), 180], unseen_changes: [t_conver('unseen_changes'), 200]}
    
    //WEBSOCKET ACTIONS, THEY TRIGEGR ONLY IF THE USER IS INSIDE THE SECTION
    useEffect(() =>  {
        socket?.current.on('client', (data:any) => {
            if (data.data.id === clientDataEditRef.current?.id) {
                if (setClientData) setClientData(data.data)
                else setClientDataEdit(data.data)
            }
        })

        socket?.current.on('conversation', (data:any) => {
            if (data.contact_id === clientDataEditRef.current?.id && !setClientConversations) {
                setClientConversationsEdit(prev => {
                    if (!prev) return prev
                    const elementToAdd = {created_at:data.new_data.created_at, id:data.new_data.id, local_id:data.new_data.local_id, status:data.new_data.status, title:data.new_data.title, updated_at:data.new_data.updated_at }
                    let updatedPageData
                    if (data.is_new) updatedPageData = [elementToAdd, ...prev.page_data]
                    else updatedPageData = prev.page_data.map(con => con.id === data.new_data.id ? elementToAdd : con)
                    return {
                      ...prev,
                      total_conversations: data.is_new ? prev.total_conversations + 1 : prev.total_conversations,
                      page_data: updatedPageData,
                    }
                  })
            }
        })
        
        },[])

    //SCROLL REFS
    const scrollRef1 = useRef<HTMLDivElement>(null)

    //MERGE LOGIC
    const [showMerge, setShowMerge] = useState<boolean>(false)
    
    //BLOCK LOGIC 
    const [showBlock, setShowBlock] = useState<boolean>(false)

    //SHOW ADD BUSINESS BOOLEAN
    const [showAddBusiness, setShowAddBusiness] = useState<boolean>(false)

    //CLIENT DATA
    const [clientDataEdit, setClientDataEdit] = useState<ClientData | null>(comesFromConversation ? clientData ?? null : null)
    const clientDataEditRef = useRef<ClientData | null>(comesFromConversation ? clientData ?? null : null)
    useEffect(() => {
        if (clientData) {
            clientDataEditRef.current = clientData
            setClientDataEdit(clientData)
        }
    }, [clientData])

    //CONVERSATION DATA
    const [clientConversationsEdit, setClientConversationsEdit] = useState<Conversations | null>(comesFromConversation ? clientConversations ?? null : null)
    useEffect(() => {
        if (clientConversations) setClientConversationsEdit(clientConversations)
    }, [clientConversations])
    const [conversationsFilters, setConversationsFilters ] = useState<{page_index:number, sort_by?:ConversationColumn | 'not_selected', search?:string, order?:'asc' | 'desc'}>({page_index:1}) 
   
    //BUSINESS DATA
    const [businessDataEdit, setBusinessDataEdit] = useState<ContactBusinessesTable | null>(comesFromConversation ? businessData ?? null : null)
   
    //BUSINESS CLIENTS
    const [businessClientsEdit, setBusinessClientsEdit] = useState<Clients | null>(comesFromConversation ? businessClients ?? null : null)

    //CHANGE SECTION AND CREATE CONTACT BUSINESS LOGIC (INLY IF COMES FROM CLIENT TABLE)
    const [clientSection, setClientSection ] = useState<'business' | 'client'>('client')
  
    //REQUEST CLIENT, CONVERSATIONS AND CLIENT INFO
    useEffect(() => { 
        const loadData = async () => {

            //ONLY CALL IF IT COMES FROM CLIENTS TABLE
            if (!comesFromConversation) {

                //FIND IF THERE IS A CLIENT IN HEADER SECTIONS
                const clientId = parseInt(location.split('/')[location.split('/').length - 1])
                const headerSectionsData = session.sessionData.headerSectionsData
                const clientElement = headerSectionsData.find(value => value.id === clientId && value.type === 'client')
                    
                //SET THE TITLE AND THE CURRETN SECTION IN LOCAL S
                document.title = `Cliente: ${clientId} - ${auth.authData.organizationName} - Matil`
                localStorage.setItem('currentSection', `clients/client/${clientId}`)
                
                //CHANGE THE INFORMATION IF ITS A HEADER SECTION
                if (clientElement?.data?.clientData) {
                    setClientDataEdit(clientElement.data.clientData)
                    clientDataEditRef.current = clientElement.data.clientData

                    if (clientElement.data.clientConversations) setClientConversationsEdit(clientElement.data.clientConversations)
                    else {
                        const reponse = await fetchData({endpoint:`${auth.authData.organizationId}/conversations`, params:{page_index:1, view_index:0,view_type:'', retrieve_exclusively_for_client:true, contact_id:clientId}, setValue:setClientConversationsEdit, auth })         
                        session.dispatch({type:'UPDATE_HEADER_SECTIONS',payload:{action:'add', data:{id:clientId, type:'client', data:{...clientElement.data ,clientConversations:reponse?.data}}}})
                    }

                     setBusinessDataEdit(clientElement.data.businessData)
                    setBusinessClientsEdit(clientElement.data.businessClients)
                }
                
                //CALL THE API AND REQUEST (CLIENT DATA, CLIENT CONVERSATIONS AND CONTACT BUSINESS)
                else {
                    const clientResponse = await fetchData({endpoint:`${auth.authData.organizationId}/contacts/${clientId}`, setValue:setClientDataEdit,  auth})
                     
                    if (clientResponse?.status === 200) {
                        addHeaderSection(clientResponse.data.name , clientResponse.data.id, 'client')
                        clientDataEditRef.current = clientResponse.data

                        const conversationsResponse = await fetchData({endpoint:`${auth.authData.organizationId}/conversations`, params:{page_index:1, view_index:0,view_type:'', retrieve_exclusively_for_client:true, contact_id:clientId}, setValue:setClientConversationsEdit, auth })         
                        
                        let businessDict:ContactBusinessesTable = {id:-1, domain: '',name:'', notes: '', labels:'', created_at:'', last_interaction_at:''}
                        if (clientResponse.data.contact_business_id && clientResponse.data.contact_business_id !== -1)  {
                            const businessResponse = await fetchData({endpoint:`${auth.authData.organizationId}/contact_businesses/${clientResponse.data.contact_business_id}`, setValue:setBusinessDataEdit, auth })
                            businessDict = businessResponse?.data
                        }
                        else setBusinessDataEdit(businessDict)
                        if (conversationsResponse?.status === 200) {
                            session.dispatch({type:'UPDATE_HEADER_SECTIONS',payload:{action:'add', data:{id:clientId, type:'client', data:{clientData:clientResponse.data, clientConversations:conversationsResponse?.data, businessData:businessDict}}}})
                        }
                    }
                    else navigate('/clients')
                }
            }
        }
        loadData()
    }, [location])

    //UPDATE CLIENT CONVERSATIONS TABLE
    const updateTable = async(applied_filters:{page_index:number, sort_by?:ConversationColumn | 'not_selected', search?:string, order?:'asc' | 'desc'} | null) => {

        const filtersToSend = applied_filters?applied_filters:{page_index:1}

        const conversationsResponse = await fetchData({endpoint:`${auth.authData.organizationId}/conversations`, params:{view_index:0,view_type:'', retrieve_exclusively_for_client:true, contact_id:clientDataEdit?.id, ...filtersToSend}, setValue:setClientConversationsEdit, auth })         
        if (conversationsResponse?.status == 200) {
            setClientConversationsEdit(conversationsResponse?.data)
            setConversationsFilters(filtersToSend)
            session.dispatch({type:'UPDATE_HEADER_SECTIONS',payload:{action:'add', data:{clientConversations:conversationsResponse?.data}}})
        }
    }
  
    //TRIGGER UPDATE DATA ON CHANGES
    const updateData = async(newData?:ClientData | null) => {

        const compareData = newData ? newData : clientDataEdit as ClientData
        if (JSON.stringify(clientDataEditRef.current) !== JSON.stringify(compareData)){
            const updateResponse = await fetchData({endpoint:`${auth.authData.organizationId}/contacts/${compareData?.id}`, auth:auth, requestForm:compareData, method:'put', toastMessages:{'works':`El cliente /{${clientDataEdit?.name}}/ se actualizó correctamente.`,'failed':`Hubo un problema al actualizar la información.`}})
            if (updateResponse?.status === 200) {
                clientDataEditRef.current = compareData
                if (comesFromConversation && setClientData) setClientData(compareData)
                else setClientDataEdit(compareData)
            }
        }
    }

    //ADD NEW CHANNEL LOGIC
    const addNewChannelBoxRef = useRef<HTMLDivElement>(null)
    const addNewChannelButtonRef = useRef<HTMLDivElement>(null)
    const [showAddNewChannel, setShowAddNewChannel] = useState<boolean>(false) 
    useOutsideClick({ref1:addNewChannelBoxRef, ref2:addNewChannelButtonRef, onOutsideClick:setShowAddNewChannel})
    const addNewChannel = (key:ContactChannel) => {
        setShowAddNewChannel(false)
        setClientDataEdit(prevData => prevData ? ({ ...prevData, [key]: '-' }) as ClientData : null)
    }

    //NOTES WRITTING AND RESIZING LOGIC
    const textareaNotasRef = useRef<HTMLTextAreaElement>(null)
    const adjustTextareaHeight = (textarea:any) => {
        if (!textarea) return
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
    }
    const handleInputNotasChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setClientDataEdit(prevData => prevData ? ({ ...prevData, notes:DOMPurify.sanitize(event.target.value)}) as ClientData : null)

    }
    useEffect(() =>{if (clientDataEdit) adjustTextareaHeight(textareaNotasRef.current)}, [clientDataEdit?.notes])

    //TAGS LOGIC
    const [inputValue, setInputValue] = useState<string>('')
    const handleKeyDown = (event:KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          const newTag = inputValue.trim()
          if (newTag) {
            let newClientData:ClientData | null = null
            if (clientDataEdit) {
                const labelsArray = clientDataEdit.labels ? clientDataEdit.labels.split(',') : []
                labelsArray.push(newTag)
                newClientData = { ...clientDataEdit, labels: labelsArray.join(',') }
            }
            updateData(newClientData)
            setClientDataEdit(newClientData)
            setInputValue('')
          }
        }
      } 
    const removeTag = (index: number) => {
        let newClientData:ClientData | null = null
        if (clientDataEdit && clientDataEdit.labels) {
            const labelsArray = clientDataEdit.labels.split(',')
            labelsArray.splice(index, 1)
            newClientData = { ...clientDataEdit, labels: labelsArray.join(',') }
          }
        setClientDataEdit(newClientData)
        updateData(newClientData)
    }
        
    //UPDATE LANGUAGE
    const updateLanguage = (element:string) => {
        const newClientData = {...clientDataEdit as ClientData, language:element}
        updateData(newClientData)
        if (clientDataEdit) setClientDataEdit(newClientData)
    }

    //CHANGE NAME
    const handelChangeName = (value:string) => {
        if (clientDataEdit) setClientDataEdit(prevData => prevData ? ({ ...prevData, name:value}) as ClientData : null)
    }

    //CHANGE CHANNEL DATA
    const handleChangeChannel = (value: string, channel: ContactChannel) => {

        if (clientDataEdit) {
            setClientDataEdit(prevData => {
                if (prevData) {
                    const currentValue = prevData[channel]
                    const newValue = currentValue === '-' && value.trim() !== '' ? value.slice(1) : value
                    if (value === '') updateData({...prevData, [channel]: ''} )    
                    return { ...prevData, [channel]: newValue } as ClientData
                }
                return null
            })
        }
     }

    //EDIT THE BUSINESS DATA, WHEN CREATE A NEW ONE
    const handleCreateContactBusiness = (new_data:ContactBusinessesTable) => {
        setBusinessDataEdit(new_data)
        updateData({...clientDataEdit as ClientData, contact_business_id:new_data.id})
        session.dispatch({type:'EDIT_CONTACT_BUSINESS',payload:{data:new_data, id:clientDataEdit?.id}})
    }

    //UPDATE CUSTOMATRIBUTES
    const updateCustomAttributes = ( attributeName:string, newValue:any) => {

        const newClientData = { ...clientDataEdit } as ClientData;
        if (newClientData.custom_attributes) {
            const updatedCustomAttributes = {...newClientData.custom_attributes}
            updatedCustomAttributes[attributeName] = newValue
            newClientData.custom_attributes = updatedCustomAttributes
        }
        updateData(newClientData)
        if (clientDataEdit) setClientDataEdit(newClientData)
    }
    
    //COMPONENT FOR SEARCH A CONTACT BUSONESS
    const SearchBusiness = () => {
        //REFS
        const buttonRef = useRef<HTMLDivElement>(null)
        const boxRef = useRef<HTMLDivElement>(null)
        const [showSearch, setShowSearch] = useState(false)
        
        const [text, setText] = useState<string>('')
        const [showResults, setShowResults] = useState<boolean>(false)
        const [elementsList, setElementsList] = useState<any>([])
        const [waitingResults, setWaitingResults] = useState<boolean>(false)

        //BOOLEAN TO CONTROL THE VISIBILITY OF THE LIST AND CLOSE ON OUTSIDE CLICK
        useOutsideClick({ref1:buttonRef, ref2:boxRef, containerRef:scrollRef1, onOutsideClick:setShowSearch})
    
        useEffect(() => {
            if (text === '') {setWaitingResults(false);setShowResults(false);return}
            
            else {
                setWaitingResults(true)
                const timeoutId = setTimeout(async () => {
 
                const response = await fetchData({endpoint: `${auth.authData.organizationId}/contact_businesses`, setValue:setElementsList, auth, params: { page_index: 1, search: text }})
                if (response?.status === 200) {setShowResults(true);setWaitingResults(false)}
                else {setShowResults(false);setWaitingResults(false)}
                }, 500)
                return () => clearTimeout(timeoutId)
            }
        }, [text])
    
 
 
     return (
         <Box position={'relative'}>
            <Flex bg={'transaprent'} cursor={'pointer'} alignItems={'center'} onClick={() => setShowSearch(!showSearch)} ref={buttonRef} height={'37px'} fontSize={'.9em'}  border={showSearch ? "3px solid rgb(59, 90, 246)":"1px solid #CBD5E0"} justifyContent={'space-between'} px={showSearch?'5px':'7px'} py={showSearch ? "5px" : "7px"} borderRadius='.5rem' _hover={{border:showSearch?'3px solid rgb(59, 90, 246)':'1px solid #CBD5E0'}}>
                <Text>{businessDataEdit?.name}</Text>
                 <IoIosArrowDown className={showSearch ? "rotate-icon-up" : "rotate-icon-down"}/>
            </Flex>
            
            <AnimatePresence> 
                {showSearch && 
                <MotionBox initial={{ opacity: 5, marginTop: -5 }} animate={{ opacity: 1, marginTop: 5 }}  exit={{ opacity: 0,marginTop:-5}} transition={{ duration: '0.2',  ease: 'easeOut'}}
                 maxH='30vh' overflow={'scroll'} width='100%' gap='10px' ref={boxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000} position={'absolute'} right={0} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.300'}>
                    <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Buscar..." style={{border:'none', outline:'none', background:'transparent', padding:'10px'}}/>
                    <Box height={'1px'} width={'100%'} bg='gray.200'/>
                   
                    {(showResults && 'page_data' in elementsList) ? <>
                        <Box maxH='30vh'>
                            {elementsList.page_data.length === 0? 
                            <Box p='15px'><Text fontSize={'.9em'} color='gray.600'>{waitingResults?<LoadingIconButton/>:'No hay ninguna coincidencia'}</Text></Box>
                            :<> {elementsList.page_data.map((business:ContactBusinessesTable, index:number) => (
                                <Flex _hover={{bg:'gray.50'}} cursor={'pointer'} alignItems={'center'} onClick={() => {setText('');handleCreateContactBusiness(business);setShowResults(false)}} key={`user-${index}`} p='10px' gap='10px' >
                                    <Icon boxSize={'12px'} color='gray.700' as={FaBuilding}/>
                                    <Box>
                                        <Text fontSize={'.9em'}>{business.name}</Text>
                                    </Box>
                                </Flex>
                            ))}</>}
                        </Box>
                      
                    </>:<Box p='15px'><Text fontSize={'.9em'} color='gray.600'>{waitingResults?<LoadingIconButton/>:t('NoCoincidence')}</Text></Box>}
                    <Box height={'1px'} width={'100%'} bg='gray.200'/>
                        <Flex _hover={{bg:'gray.50'}} cursor={'pointer'} alignItems={'center'} onClick={() => {setText('');setShowResults(false);setShowAddBusiness(true)}}  p='10px' gap='15px' >
                            <Icon boxSize={'12px'} color='gray.700' as={FaPlus}/>
                            <Box>
                                <Text fontSize={'.9em'}>{t('CreateNewBusiness')}</Text>
                            </Box>
                        </Flex>
                </MotionBox>} 
            </AnimatePresence>
         </Box>
     )
    }


    //COMPONENT FOR BLOCKING A CLIENT
    const BlockComponent = () => {

        const [waitingConfirmBlock, setWaitingConfirmBlock] = useState<boolean>(false)

        const blockClient = async() => {
            updateData({...clientDataEditRef.current as ClientData, is_blocked:true})
            showToast({message:'Cliente bloqueado con éxito'})
            setShowBlock(false)
        }

        return(<> 
            <Box p='20px'> 
            <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ConfirmBlock')}</Text>
            <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
            <Text>{parseMessageToBold(t('BlockClient', {name_id:`#${clientDataEdit?.id} ${clientDataEdit?.name}`}))}</Text>
        </Box>
        <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
            <Button  size='sm'variant={'delete'} onClick={blockClient}>{waitingConfirmBlock?<LoadingIconButton/>:t('Block')}</Button>
            <Button  size='sm' variant={'common'} onClick={() => setShowBlock(false)}>{t('Cancel')}</Button>
        </Flex>
        </>)
    }

    const memoizedAddBusiness = useMemo(() => (
        <ConfirmmBox setShowBox={setShowAddBusiness}> 
            <CreateBusiness setShowBox={setShowAddBusiness} actionTrigger={(data:any) => handleCreateContactBusiness(data)}/>
        </ConfirmmBox>
    ), [showAddBusiness])

    const memoizedMergeBox = useMemo(() => (
        <ConfirmmBox setShowBox={setShowMerge}> 
            <MergeBox clientData={clientDataEdit} setShowMerge={setShowMerge} deleteHeaderSection={deleteHeaderSection}/>
        </ConfirmmBox>
    ), [showMerge])


    const memoizedBlockBox = useMemo(() => (
        <ConfirmmBox setShowBox={setShowBlock}> 
            <BlockComponent/>
        </ConfirmmBox>
    ), [showBlock])


    return(
     
    <Suspense fallback={<></>} >    

        {!comesFromConversation && 
            <Flex px='30px' height='60px' bg='#e8e8e8' borderBottomWidth={'1px'} borderBottomColor='gray.200' flex='1' alignItems={'center'} >
                <Flex borderRadius={'.3rem'} height={'70%'}  alignItems={'center'} borderWidth={'1px 1px 1px 1px'}  borderColor='gray.300'> 
                    
                    <Flex alignItems='center' gap='6px'  onClick={() => {if (businessDataEdit?.id !== -1) setClientSection('business')}} cursor={'pointer'}  bg={clientSection === 'business' ?  'gray.300':'transparent' } height={'100%'}  borderRightWidth={'1px'} borderRightColor='gray.300'  px={{md:'10px',lg:'20px'}}> 
                        <Icon as={FaBuilding} boxSize={'14px'} />
                        <Skeleton isLoaded={businessDataEdit !== null}> <Text whiteSpace={'nowrap'} fontSize={{md:'.8em',lg:'1em'}}>{businessDataEdit?.id === -1?t('NoBusiness'):businessDataEdit?.name}</Text></Skeleton>
                    </Flex> 
                    <Flex alignItems='center' gap='6px' onClick={() => setClientSection('client')}  cursor={'pointer'} bg={clientSection === 'client'?'brand.blue_hover':'transparent'} height={'100%'} px={{md:'10px',lg:'20px'}}> 
                        <Icon as={BsPersonFill} boxSize={'17px'} />
                        <Skeleton isLoaded={clientDataEdit !== null}> 
                            <Text whiteSpace={'nowrap'} fontSize={{md:'.8em',lg:'1em'}} >{clientDataEdit?.name === ''? t('WebClient'):clientDataEdit?.name}</Text>
                        </Skeleton>
                    </Flex>
                </Flex>
        </Flex>}

        {showAddBusiness && memoizedAddBusiness}


        {clientSection === 'client'?
         <>
            <Flex height={'calc(100vh - 120px)'}  width={'100%'}>
                <Box ref={scrollRef1} p='2vw' width={'280px'} bg='#f1f1f1' borderRightWidth={'1px'} borderRightColor='gray.200' overflow={'scroll'}  >
                    <Skeleton isLoaded={clientData !== null}> 
                        {Object.keys(clientDataEdit || {}).map((con, index) => (
                        <Fragment key={`channel-${index}`}> 
                            {(Object.keys(contactDicRegex).includes(con)) && clientDataEdit?.[con as ContactChannel] && clientDataEdit?.[con as ContactChannel] !== '' &&
                                <Flex mt='1vh' alignItems={'center'} gap='10px' key={`contact_type-2-${index}`}> 
                                    <Box width={'70px'}> 
                                        <Text fontSize='.8em' fontWeight={'medium'} >{contactDicRegex[con as ContactChannel][0]}</Text>
                                    </Box>
                                    <Box flex='1'> 
                                        <EditText fontSize={'.8em'} updateData={updateData} focusOnOpen={clientDataEdit?.[con as ContactChannel] === '-'} maxLength={contactDicRegex[con as ContactChannel][2]} regex={contactDicRegex[con as ContactChannel][1]} value={clientDataEdit?.[con as ContactChannel]} setValue={(value:string) => handleChangeChannel(value, con as ContactChannel)} />
                                    </Box>
                                </Flex>}
                        </Fragment>))}
                    </Skeleton>
                    <Box position={'relative'}> 
                        <Flex ref={addNewChannelButtonRef} mt='2vh'  alignItems={'center'} gap='7px' color={'brand.text_blue'} _hover={{opacity:0.8}}  cursor={'pointer'}>
                            <Icon as={FaPlus} boxSize={'11px'} />
                            <Text fontWeight={'medium'} fontSize={'.85em'} onClick={() => setShowAddNewChannel(!showAddNewChannel)}>{t('AddContact')}</Text>
                        </Flex>
                        {showAddNewChannel && 
                            <MotionBox initial={{ opacity: 0, height:0}} animate={{ opacity: 1, height:'auto' }}  transition={{ duration: '0.15',  ease: 'easeOut'}}
                             maxH={'40vh'} overflowY={'scroll'} mt='5px' position='absolute' ref={addNewChannelBoxRef} bg='white'  zIndex={1000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='gray.300' borderWidth='1px' borderRadius='.5rem'>         
                                {Object.keys(contactDicRegex).map((con, index) => (
                                <Fragment key={`select-channel-${index}`}> 
                                    {(clientDataEdit?.[con as ContactChannel] === null || clientDataEdit?.[con as ContactChannel] === '')&&
                                        <Flex color='gray.600' fontSize={'.9em'} onClick={() => addNewChannel(con as ContactChannel)} key={`channels-${index}`}  px='15px' py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'gray.100'}}>
                                            <Icon as={logosMap[contactDicRegex[con as ContactChannel][3]][0]}/>
                                            <Text>{t(contactDicRegex[con as ContactChannel][3])}</Text>
                                        </Flex>
                                    }
                                </Fragment>))}
                            </MotionBox>
                        }
                    </Box>
                    <Box width={'100%'} mt='2vh' mb='2vh' height={'1px'} bg='gray.300'/>
                   
                    <Text mb='.5vh'fontWeight={'medium'} mt='2vh' fontSize='.9em'>{t('contact_business_id')}</Text>
                    <Skeleton isLoaded={clientDataEdit !== null}>
                        <SearchBusiness/>
                    </Skeleton>

                    <Text mb='.5vh'fontWeight={'medium'} mt='2vh' fontSize='.9em'>{t('language')}</Text>
                    <Skeleton isLoaded={clientDataEdit !== null}>
                        <CustomSelect labelsMap={languagesMap} containerRef={scrollRef1} selectedItem={clientDataEdit?.language}  setSelectedItem={updateLanguage} options={Object.keys(languagesMap)} hide={false} />
                    </Skeleton>

                    <Text mb='.5vh'fontWeight={'medium'} mt='2vh' fontSize='.9em'>{t('labels')}</Text>
                    <Skeleton isLoaded={clientDataEdit !== null}>
                        <Box flex='1'> 
                            <Box   minHeight="30px" maxH="300px" border="1px solid #CBD5E0"   p="5px" _focusWithin={{ borderColor:'transparent', boxShadow:'0 0 0 2px rgb(59, 90, 246)'}} borderRadius=".5rem" overflow="auto" display="flex" flexWrap="wrap" alignItems="center" onKeyDown={handleKeyDown}  tabIndex={0}>
                                {clientDataEdit?.labels === '' ? <></>:
                                <> 
                                    {((clientDataEdit?.labels || '').split(',')).map((label, index) => (
                                        <Flex key={`label-${index}`} borderRadius=".4rem" p='4px' fontSize={'.75em'} alignItems={'center'} m="1"bg='brand.gray_1' borderWidth={'1px'} borderColor={'gray.300'} gap='5px'>
                                            <Text>{label}</Text>
                                            <Icon as={RxCross2} onClick={() => removeTag(index)} cursor={'pointer'} />
                                        </Flex>
                                    ))}
                                </>
                                }
                                <Textarea  maxLength={20} p='5px'  resize={'none'} borderRadius='.5rem' rows={1} fontSize={'.9em'}  borderColor='transparent' borderWidth='0px' _hover={{borderColor:'transparent',borderWidth:'0px'}} focusBorderColor={'transparent'}  value={inputValue}  onChange={(event) => {setInputValue(event.target.value)}}/>
                            </Box>
                        </Box>                    
                    </Skeleton>
                   
                    <Text mb='.5vh'fontWeight={'medium'} mt='2vh' fontSize='.9em'>{t('notes')}</Text>
                    <Skeleton isLoaded={clientDataEdit !== null}>
                        <Textarea  maxLength={1000} onBlur={() => updateData()} minHeight={'37px'} placeholder="Notas..." maxH='300px' value={clientDataEdit?.notes} ref={textareaNotasRef} onChange={handleInputNotasChange} size='sm' p='10px'  resize={'none'} borderRadius='.5rem' rows={1} fontSize={'.9em'}  borderColor='#CBD5E0'_focus={{p:'9px',borderColor: "brand.text_blue", borderWidth: "2px"}}/>
                    </Skeleton>

                    <Text mb='.5vh'fontWeight={'medium'} mt='2vh' fontSize='.9em'>{t('created_at')}</Text>
                    <Skeleton isLoaded={clientDataEdit !== null}>
                           <Text fontSize={'.9em'}>{timeAgo(clientDataEdit?.created_at, t_formats)}</Text>
                    </Skeleton>
                   
                    <Text mb='.5vh'fontWeight={'medium'} mt='2vh' fontSize='.9em'>{t('last_interaction_at')}</Text>
                    <Skeleton isLoaded={clientDataEdit !== null}>
                           <Text fontSize={'.9em'}>{timeAgo(clientDataEdit?.last_interaction_at, t_formats)}</Text>
                    </Skeleton>

                    <Skeleton isLoaded={clientDataEdit !== null}>
                        <CustomAttributes motherstructureType="contact" customAttributes={clientDataEdit?.custom_attributes || {}} updateCustomAttributes={updateCustomAttributes}/>
                    </Skeleton>

                </Box>

                <Box bg='white' p='2vw' width="calc(100vw - 335px)" overflow={'scroll'}>
                <Flex gap='3vw' justifyContent={'space-between'}> 
                    <Flex  flex='1' gap='20px'  alignItems={'center'}>
                        <Avatar />
                        <Skeleton width={'100%'} isLoaded={clientDataEdit !== null}> 
                            <EditText nameInput={true} size='md' maxLength={70} updateData={updateData} value={clientDataEdit?.name === ''? t('WebClient'):clientDataEdit?.name} setValue={handelChangeName}/>
                        </Skeleton>
                    </Flex>
                    <Flex alignItems={'center'} gap='10px'>
                        <Button variant={'common'}  leftIcon={clientDataEdit?.is_blocked?<TbKey/>:<MdBlock/>} onClick={() => {if (!clientDataEdit?.is_blocked) setShowBlock(true); else updateData({...clientDataEditRef.current as ClientData, is_blocked:false})}} color={clientDataEdit?.is_blocked?'black':'red'} fontSize={'1em'} size='sm' fontWeight={'medium'}  _hover={{color:clientDataEdit?.is_blocked?'blue.500':'red.600'}}>{clientDataEdit?.is_blocked?'Desbloquear':'Bloquear'}</Button>
                        <Button leftIcon={<TbArrowMerge/>}  size='sm' variant={'common'} onClick={() => setShowMerge(true)}>{t('Merge')}</Button>
                    </Flex>
                </Flex>
                <Box width={'100%'} mt='3vh' mb='3vh' height={'1px'} bg='gray.300'/>
                <Flex alignItems={'end'} justifyContent={'space-between'} >
                    <Skeleton isLoaded={clientDataEdit !== null}> 
                        <Text fontWeight={'medium'} color='gray.600'>{t('Conversations', {count:clientConversationsEdit?.page_data.length})}</Text>
                    </Skeleton>
                    <Flex alignItems={'center'}  gap='10px' flexDir={'row-reverse'}>
                        <IconButton isRound size='xs' variant={'common'} aria-label='next-page' icon={<IoIosArrowForward />} isDisabled={conversationsFilters.page_index > Math.floor((clientConversationsEdit?.total_conversations || 0)/ 25)} onClick={() => updateTable({...conversationsFilters,page_index:conversationsFilters.page_index + 1})}/>
                        <Text fontWeight={'medium'} fontSize={'.9em'} color='gray.600'>{t('Page')} {conversationsFilters.page_index}</Text>
                        <IconButton isRound size='xs' variant={'common'} aria-label='next-page' icon={<IoIosArrowBack />} isDisabled={conversationsFilters.page_index === 1} onClick={() => updateTable({...conversationsFilters,page_index:conversationsFilters.page_index - 1})}/>
                    </Flex>
                </Flex>

                <Skeleton isLoaded={clientConversationsEdit !== null}> 
                    <Table data={clientConversationsEdit?.page_data || []} CellStyle={CellStyle} noDataMessage={t('NoConversations')} columnsMap={columnsConversationsMap} excludedKeys={['id', 'conversation_id', 'contact_id',  'is_matilda_engaged']} onClickRow={(row:any, index:number) => {navigate(`/conversations/conversation/${row.id}`)}}/>
                </Skeleton>
                </Box>
            </Flex>

            {showMerge && memoizedMergeBox}
            {showBlock && memoizedBlockBox}
        </>:
        <> 
            {!comesFromConversation && <Business  socket={socket} comesFromConversation={true} businessData={businessData ? businessData:businessDataEdit} setBusinessData={setBusinessData? setBusinessData:setBusinessDataEdit} businessClients={businessClients?businessClients:businessClientsEdit} setBusinessClients={setBusinessClients?setBusinessClients:setBusinessClientsEdit}  addHeaderSection={addHeaderSection}/>}
        </>}
        
    </Suspense>)
    }

export default Client


 
interface MergeBoxProps {
    clientData:ClientData | null
    setShowMerge: Dispatch<SetStateAction<boolean>>
    deleteHeaderSection: DeleteHeaderSectionType
}

const MergeBox = ({clientData, setShowMerge, deleteHeaderSection}:MergeBoxProps) => {

    //AUTH CONSTANT
    const { t } = useTranslation('clients')

    const auth = useAuth()
    const session = useSession()
    const navigate = useNavigate()

    //SHOW CONFIRM
    const [showConfirmMerge, setShowConfirmMerge] = useState<boolean>(false)
    const [waitingConfirmMerge, setWaitingConfirmMerge] = useState<boolean>(false)

    //SHOW BOX ON WRITE TEXT AND FIND COINCIDENCE, MAKING CALLS TO CLIENTS ENDPOINT
    const [waitingResult, setWaitingResult] = useState<boolean>(false)
    const boxRef = useRef<HTMLDivElement>(null) 
    
    useOutsideClick({ref1:boxRef, onOutsideClick:(b:boolean) => {setText('')}})
    const [text, setText] = useState<string>('')
    const [showResults, setShowResults] = useState<boolean>(false)
    const [elementsList, setElementsList] = useState<any>([])
    const [selectedClient, setSelectedClient] = useState<{name:string, id:number} | null>(null)
    
    useEffect(() => {
        if (text === '') {setWaitingResult(false);setShowResults(false);return}
            const timeoutId = setTimeout(async () => {
            setWaitingResult(true)
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/contacts`, setValue:setElementsList, auth:auth, params: { page_index: 1, search: text }})
            if (response?.status === 200) {setShowResults(true);setWaitingResult(false)}
            else {setShowResults(false);setWaitingResult(false)}
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [text])


    const confirmMerge = async () => {
        const response = await fetchData({endpoint: `${auth.authData.organizationId}/contacts/merge/${clientData?.id}/${selectedClient?.id}`, method:'put', setWaiting:setWaitingConfirmMerge, params: { new_name:clientData?.name}, auth: auth, toastMessages:{'works':`${clientData?.name} y ${selectedClient?.name} se han fusionado correctamente`,'failed':'Hubo un fallo al fusionar los clientes'}})
        if (response?.status === 200) {
            session.dispatch({type:'DELETE_VIEW_FROM_CLIENT_LIST'})
            deleteHeaderSection({code:clientData?.id || 0, type:'client', description:'' })
            navigate('/clients')
        }
    }

     return(<>
            <Box p='20px'> 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('MergeUser')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>  
                
                {showConfirmMerge ? 
                <ConfirmmBox setShowBox={setShowConfirmMerge}> 
                    <Box p='15px'> 
                        <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ConfirmMerge')}</Text>
                        <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                        <Text>{parseMessageToBold(t('MergeUsersConfirm', {user_1:clientData?.name,user_2:selectedClient?.name}))}</Text>
                    </Box>
                    <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                        <Button  size='sm' variant='main' onClick={confirmMerge}>{waitingConfirmMerge?<LoadingIconButton/>:'Fusionar'}</Button>
                        <Button  size='sm' variant={'common'} onClick={()=>setShowConfirmMerge(false)}>{t('Cancel')}</Button>
                    </Flex>
                </ConfirmmBox>
                :
                <> 
                <Text mb='1vh' fontWeight={'medium'}>{t('SearchToMerge')}</Text>
                <Box position={'relative'}> 
                    <EditText waitingResult={waitingResult} value={text} setValue={setText} searchInput={true}/>
                
                    {(showResults && 'page_data' in elementsList) && 
                        <Box  maxH='30vh' overflow={'scroll'} width='100%' gap='10px' ref={boxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.3)'} bg='white' zIndex={100000} className={'slide-down'} position={'absolute'} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.200'}>
                            {elementsList.page_data.length === 0? 
                            <Box p='15px'><Text>{t('NoCoincidence')}</Text></Box>
                            :<> {elementsList.page_data.map((client:ClientData, index:number) => (
                                <Flex _hover={{bg:'gray.50'}} cursor={'pointer'} alignItems={'center'} onClick={() => {setText('');setSelectedClient({id:client.id, name:client.name});setShowResults(false)}} key={`user-${index}`} p='10px' gap='15px' >
                                    <Avatar size='xs' name={client.name}/>
                                    <Box>
                                        <Text fontWeight={'medium'}>{client.name}</Text>
                                    </Box>
                                </Flex>
                            ))}</>}
                        </Box>}

                </Box>

                <Flex mt='20vh' justifyContent={'center'} gap='20px' alignItems={'center'}>
                    <Flex alignItems={'center'} p='10px' gap='15px' bg='gray.50' borderColor={'gray.300'} borderWidth='1px' borderRadius={'.5rem'}>
                        <Avatar size='sm'/>
                        <Box>
                            <Text fontWeight={'medium'}>{clientData?.name}</Text>
                        </Box>
                    </Flex>
                    <Icon as={FaArrowRight} boxSize={'25px'}/>
                    {selectedClient === null ? <Text fontSize={'.9em'} width={'150px'} textAlign={'center'}>{t('SelectMergeClient')}</Text>
                    :<Flex alignItems={'center'} p='10px' gap='15px' bg='gray.50' borderColor={'gray.300'} borderWidth='1px' borderRadius={'.5rem'}>
                        <Avatar size='sm'/>
                        <Box>
                            <Text fontWeight={'medium'}>{selectedClient?.name}</Text>
                        </Box>
                    </Flex>}
                </Flex>
                </>}
            </Box>
          
            <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                <Button  size='sm'variant='main' isDisabled={selectedClient === null} onClick={()=>setShowConfirmMerge(true)}>{showConfirmMerge?t('ConfirmAndMerge'):t('Merge')}</Button>
                <Button  size='sm'   variant={'common'} onClick={()=>setShowMerge(false)}>{t('Cancel')}</Button>
            </Flex>
        </>
    )
}

