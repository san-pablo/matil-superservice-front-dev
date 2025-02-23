import { useState, useRef, useEffect, Dispatch, SetStateAction, Fragment, memo, useMemo } from "react"
import { useAuth } from "../../../AuthContext"
 import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import { useAuth0 } from "@auth0/auth0-react"

//FRONT
import { Flex, Box, Text, Icon, Avatar, Button, Skeleton, Tooltip, chakra, shouldForwardProp, IconButton } from '@chakra-ui/react'
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion'
//FETCH DATA
import fetchData from "../../API/fetchData"
//COMPONENTS
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import Table from "../../Components/Reusable/Table"
import EditText from "../../Components/Reusable/EditText"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import CustomAttributes from "../../Components/Reusable/CustomAttributes"
import CollapsableSection from "../../Components/Reusable/CollapsableSection"
import TagEditor from "../../Components/Reusable/TagEditor"
import CustomSelect from "../../Components/Reusable/CustomSelect"
import MatildaSVG from "../../Components/Reusable/MatildaSvg"
import ActionsBox from "../../Components/Reusable/ActionsBox"
import RenderIcon from "../../Components/Reusable/RenderIcon"
import RenderSectionPath from "../../Components/Reusable/RenderSectionPath"
//FUNCTIONS
import useOutsideClick from "../../Functions/clickOutside"
import timeAgo from "../../Functions/timeAgo"
import timeStampToDate from "../../Functions/timeStampToString"
import parseMessageToBold from "../../Functions/parseToBold"
//ICONS
import { FaPlus, FaArrowRight } from "react-icons/fa6"
import { TbArrowMerge, TbKey } from 'react-icons/tb'
import { MdBlock } from "react-icons/md"
import { FaExclamationCircle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa'
import { BsThreeDotsVertical } from "react-icons/bs"
import { HiTrash } from "react-icons/hi2"
//TYPING
import { ClientData, Conversations, ViewDefinitionType, contactDicRegex, ContactChannel, Channels, logosMap, languagesFlags, ContactBusinessesTable, ConversationColumn, Clients } from "../../Constants/typing"
  
//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})
 

//GET THE CELL STYLE
const CellStyle = ({column, element, row}:{column:string, element:any, row?:any}) => {

    const auth = useAuth()
    const { t } = useTranslation('conversations')
    const t_formats = useTranslation('formats').t
  

    if (column === 'local_id') return  <Text fontSize={'.9em'} color='text_gray' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>#{element}</Text>
    else if (column === 'user_id' || column === 'created_by')  {
        const selectedUser = useMemo(() => auth?.authData?.users?.find(user => user.id === element), [element, auth])
        return  (
            <Flex fontSize={'.9em'} alignItems={'center'} gap='5px'> 
                {element === 'matilda' ? 
                    <MatildaSVG/>
                :<> 
                {selectedUser?.icon.data ? <RenderIcon icon={selectedUser.icon} size={14}/> :<Avatar h='16px' w='16px' size={'xs'} name={selectedUser?.name || ''}/> }
                </>}
                <Text fontSize={'.9em'} fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} >{element ? element === 'matilda' ?'Tilda':element === 'no_user' ? t('NoAgent'):selectedUser?.name:t('NoAgent')}</Text>
            </Flex>
        ) 
    }
    else if (column === 'unseen_changes') 
        return(
        <Flex fontSize={'.9em'} color={element?'red':'green'} alignItems={'center'} gap='5px'> 
            <Icon as={element?FaExclamationCircle:FaCheckCircle} />
            <Text>{element?t('NotRead'):t('Any')}</Text>
        </Flex>)
    
    else if (column === 'created_at' || column === 'updated_at' || column === 'solved_at' || column === 'closed_at' || column === 'move_to_bin_at') {
        return(
        <Tooltip  label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.5rem' fontSize='.8em' p='6px'> 
            <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    }
     
    else if (column === 'deletion_scheduled_at') return <Text fontSize={'.9em'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeStampToDate(element as string, t_formats)}</Text>
    else if (column === 'channel_type') {
        return(
        <Flex fontSize={'.9em'} gap='4px' alignItems={'center'}>
            <Icon color='text_gray' as={typeof element === 'string' && element in logosMap ?logosMap[element as Channels][0]:FaInfoCircle}/>
            <Text >{t(element as string)}</Text>
         </Flex>)
    }     
    else if (column === 'call_duration') return ( <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element?t('Duration', {seconds:element}):''}</Text>)
    else if (column === 'team_id') {
        const selectedTeam = useMemo(() => auth.authData.teams.find((team) => team.id === element), [element, auth])
        return ( <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{selectedTeam ? `${selectedTeam?.icon.data} ${selectedTeam?.name}` :t('NoTeam')}</Text>)
    }
    else if (column === 'theme_id') {
        const selectedTheme = useMemo(() => auth.authData.themes.find((theme) => theme.id === element), [element, auth]);
        return ( <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{selectedTheme ? `${selectedTheme?.icon.data}  ${selectedTheme?.name}` :t('NoTheme')}</Text>)
    }
    else if (column === 'tags') {
        const tags = auth.authData.tags
        return (
            <Flex minH={'35px'} alignItems={'center'}> 
                {element.length === 0? <Text>-</Text>:
                    <Flex gap='5px' flexWrap={'wrap'}>
                        {element.map((label:string, index:number) => (
                            <Flex  bg='gray_1' borderWidth={'1px'} p='4px' borderRadius={'.5rem'} fontSize={'.8em'} key={`client-label-${index}`}>
                                <Text>{tags?.find(tag => tag.id === label)?.name}</Text>
                            </Flex>
                        ))}
                    </Flex>
                }
            </Flex>
        )
    }
    else if (column === 'title') return ( <Text fontSize={'.9em'} flex='1'  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element ? element: t('NoTitle')}</Text>)
      else return <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} >{element}</Text>
}

interface PersonProps {
    socket:any 
    personId?:string
    sectionsPath:string[]
    sectionsPathMap:{[key:string]:{icon:{type:'image' | 'emoji' | 'icon', data:string}, name:string}}
    selectedView?:ViewDefinitionType
    sideBarWidth:number
}



//MAIN FUNCTION
function Person ( {personId, socket, sectionsPath, sectionsPathMap, selectedView, sideBarWidth}: PersonProps) {
    
    //CONSTANTS
    const { t } = useTranslation('clients')
    const t_con = useTranslation('conversations').t
    const t_formats = useTranslation('formats').t
    const { getAccessTokenSilently } = useAuth0() 
    const auth = useAuth()
    const location = useLocation().pathname
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const isExpanded = searchParams.get("v") === "expanded"

    //TABLE MAPPING
    const columnsConversationsMap:{[key in ConversationColumn]:[string, number]} = {local_id: [t_con('local_id'), 50],  user_id: [t_con('user_id'), 100], title: [t_con('title'), 300], theme_id:  [t_con('theme'), 200],  team_id:[t_con('Team'), 150], created_at: [t_con('created_at'), 150],updated_at: [t_con('updated_at'), 150], solved_at: [t_con('solved_at'), 150], channel_type: [t_con('channel_type'), 120], tags:[t_con('tags'), 200], closed_at: [t_con('closed_at'), 150],unseen_changes: [t_con('unseen_changes'), 150], deletion_scheduled_at:[t_con('deletion_scheduled_at'), 150],  move_to_bin_at:[t_con('move_to_bin_at'), 150], call_status: [t_con('call_status'), 150], call_duration: [t_con('call_duration'), 150], created_by:[t_con('created_by'), 200],}

    //WAIT NEW INFO
    const [waitingInfo, setWaitingInfo] = useState<boolean>(false)

    //WEBSOCKET ACTIONS, THEY TRIGEGR ONLY IF THE USER IS INSIDE THE SECTION
    useEffect(() =>  {
        socket?.current.on('client', (data:any) => {
            if (data.data.id === clientDataEditRef.current?.id) {
                setClientDataEdit(data.data)
            }
        })

        socket?.current.on('conversation', (data:any) => {
            if (data.contact_id === clientDataEditRef.current?.id ) {
                setClientConversationsEdit(prev => {
                    if (!prev) return prev
                    const elementToAdd = {created_at:data.new_data.created_at, id:data.new_data.id, local_id:data.new_data.local_id, status:data.new_data.status, title:data.new_data.title, updated_at:data.new_data.updated_at }
                    let updatedPageData
                    if (data.is_new) updatedPageData = [elementToAdd, ...prev.page_data]
                    else updatedPageData = prev.page_data.map(con => con.id === data.new_data.id ? elementToAdd : con)
                    return {
                      ...prev,
                      total_items: data.is_new ? prev.total_items + 1 : prev.total_items,
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

    //CLIENT DATA
    const [clientDataEdit, setClientDataEdit] = useState<ClientData | null>(null)
    const clientDataEditRef = useRef<ClientData | null>(null)
 
    //CONVERSATION DATA
    const [clientConversationsEdit, setClientConversationsEdit] = useState<Conversations | null>(null)
    
    //EXPAND SECTIONS
    const [sectionsExpanded, setSectionsExpanded] = useState<string[]>(['contact', 'info', 'custom-attributes'])
    const onSectionExpand = (section: string) => {
        setSectionsExpanded((prevSections) => {
        if (prevSections.includes(section)) return prevSections.filter((s) => s !== section)
        else return [...prevSections, section]
        })
    }
      
    //REQUEST CLIENT, CONVERSATIONS AND CLIENT INFO
    useEffect(() => { 
        const loadData = async () => {
                //FIND IF THERE IS A CLIENT IN HEADER SECTIONS
                       
                //SET THE TITLE AND THE CURRETN SECTION IN LOCAL S
                document.title = `${t('Client')}: ${personId} - ${auth.authData.organizationName} - Matil`
                 
                setWaitingInfo(true)
                //CALL THE API AND REQUEST (CLIENT DATA, CLIENT CONVERSATIONS AND CONTACT BUSINESS)
                if (!location.endsWith('clients')) {
                    const clientResponse = await fetchData({endpoint:`${auth.authData.organizationId}/persons/${personId}`,getAccessTokenSilently, setValue:setClientDataEdit,  auth})
                     
                    if (clientResponse?.status === 200) {
                        clientDataEditRef.current = clientResponse.data

                        const conversatiosResponse = await fetchData({endpoint:`${auth.authData.organizationId}/conversations`,getAccessTokenSilently, params:{page_index:1, filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'person_id', op:'eq', val:personId}] }]}}, setValue:setClientConversationsEdit, auth })         
                      
                    }
                 setWaitingInfo(false)
             }
        }
        loadData()
    }, [location])
 
    //TRIGGER UPDATE DATA ON CHANGES
    const updateData = async(updatedKey:string, newData?:any) => {       
        fetchData({endpoint:`${auth.authData.organizationId}/businesses/${clientDataEdit.id}`, auth, getAccessTokenSilently, requestForm:{[updatedKey]:newData}, method:'put' })
        setClientDataEdit( prev => ({...prev, [updatedKey]:newData}))
    }

    //UPDATE A CISTOM ATTRIBUTE
    const updateCustomAttributes = (attributeName:string, newValue:any) => {
        const updatedCustomAttributes = {...clientDataEdit.cdas}
        updatedCustomAttributes[attributeName] = newValue
        updateData('cdas',  updatedCustomAttributes)
    }

    //SHOW ACTIONNS BUTTON
    const settingsButtonRef = useRef<HTMLButtonElement>(null)
    const settingsBoxRef = useRef<HTMLDivElement>(null)
    const [showSettings, setShowSettings] = useState<boolean>(false)
    useOutsideClick({ref1:settingsButtonRef, ref2:settingsBoxRef, onOutsideClick:() => setShowSettings(false)})

    //DELETE A CLIENT 
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)

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
    useEffect(() =>{if (clientDataEdit) adjustTextareaHeight(textareaNotasRef.current)}, [clientDataEdit?.notes])
 
    //CHANGE CHANNEL DATA
    const handleChangeChannel = (value: string, channel: ContactChannel) => {
        if (clientDataEdit) {
            setClientDataEdit(prevData => {
                if (prevData) {
                    const currentValue = prevData[channel]
                    const newValue = currentValue === '-' && value.trim() !== '' ? value.slice(1) : value
                    //if (value === '') updateData({...prevData, [channel]: ''} )    
                    return { ...prevData, [channel]: newValue } as ClientData
                }
                return null
            })
        }
     }
 
    const deleteClient = async() => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/persons/${clientDataEdit.id}`, method:'delete', getAccessTokenSilently, auth})
        const responseOrg = await fetchData({endpoint:`${auth.authData.organizationId}/user`, getAccessTokenSilently,  auth})
        if (response?.status === 200 && responseOrg.status === 200) navigate('contacts/clients')
    }


 
    //MEMOIZED MERGE BOX
    const memoizedMergeBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowMerge}> 
            <MergeBox clientData={clientDataEdit} setShowMerge={setShowMerge} />
        </ConfirmBox>
    ), [showMerge])

    return(
     
    <>    
        {showMerge && memoizedMergeBox}
        <ActionsBox showBox={showConfirmDelete} setShowBox={setShowConfirmDelete} title={t('DeleteClient', {name:clientDataEdit?.name})} type="delete" buttonTitle={t('Delete')} actionFunction={deleteClient} des={t('DeleteClientDes')}/>
        <ActionsBox showBox={showBlock} setShowBox={setShowBlock} title={t('BlockClient', {name:clientDataEdit?.name})} type="delete" buttonTitle={t('Block')} actionFunction={() => updateData('is_blocked', true)} des={t('BlockDes')}/>
        
        <Flex flexDir={'column'} height={'100vh'}   width={'100%'}>
        
            <Flex borderBottomWidth={'1px'} alignItems={'center'} borderBottomColor={'border_color'} h='50px' px='1vw'  gap='3vw' justifyContent={'space-between'}> 
            

                <Flex alignItems={'center'} flex='1'>
                    {isExpanded &&<RenderSectionPath sectionsPath={sectionsPath} sectionsPathMap={sectionsPathMap} selectedView={selectedView}/>}
                    <Skeleton style={{borderRadius:'50%'}} isLoaded={clientDataEdit !== null && !waitingInfo}> 
                        <Avatar size='xs' name={clientDataEdit?.name}/>
                    </Skeleton>
                    <Skeleton isLoaded={clientDataEdit !== null && !waitingInfo} style={{flex:1, fontSize:'.8em'}}> 
                        <EditText placeholder={t('Name') + '...'} value={clientDataEdit?.name} setValue={(value:string) => updateData('name', value)} className="title-textarea"/>
                    </Skeleton>
                </Flex>
              
                <Box position={'relative'}> 
                    <IconButton ref={settingsButtonRef} aria-label='conver-settings' icon={<BsThreeDotsVertical/>} size='sm'  variant={'common'} color={showSettings ? 'text_blue':'black'} bg={showSettings ? 'gray_1':'transparent' } onClick={() => {setShowSettings(!showSettings)}}/>
                    <AnimatePresence> 
                        {showSettings && 
                        <MotionBox initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '.1', ease: 'easeOut'}}
                        maxH='40vh'p='8px'  style={{ transformOrigin: 'top right' }}  mt='5px' right={0} overflow={'scroll'} top='100%' gap='10px' ref={settingsBoxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.1)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.5rem'} borderWidth={'1px'} borderColor={'border_color'}>
                            <Flex   px='7px' py='5px'  borderRadius={'.5rem'} cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'gray_2'}} onClick={() => {setShowMerge(true);setShowSettings(false)}}>
                                <Icon color='text_gray'  boxSize={'15px'} as={TbArrowMerge }/>
                                <Text whiteSpace={'nowrap'}>{t('Merge')}</Text>
                            </Flex>
                            <Flex   px='7px' py='5px'  borderRadius={'.5rem'} cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'gray_2'}} onClick={() => {if (!clientDataEdit?.is_blocked) setShowBlock(true); else updateData('is_blocked', false)}}>
                                <Icon color='text_gray'  boxSize={'15px'} as={clientDataEdit?.is_blocked?TbKey:MdBlock}/>
                                <Text whiteSpace={'nowrap'}>{clientDataEdit?.is_blocked?t('Deblock'):t('Block')}</Text>
                            </Flex>
                            <Flex  color='red' onClick={() => {setShowSettings(false) ;setShowConfirmDelete(true)}}   px='7px' py='5px'  borderRadius={'.5rem'} cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'red.100'}}>
                                <Icon boxSize={'15px'} as={HiTrash}/>
                                <Text whiteSpace={'nowrap'}>{t('Delete')}</Text>
                            </Flex>
                        </MotionBox>}   
                    </AnimatePresence>                 
                </Box>   
            </Flex>
        

            <Flex flex='1' > 
                <Box flex='1' py='2vh'  ref={scrollRef1} px='1vw' borderRightColor={'border_color'} borderRightWidth={'1px'}  overflow={'scroll'}  >
                    <CollapsableSection section={'contact'} isExpanded={sectionsExpanded.includes('contact')} onSectionExpand={onSectionExpand} sectionsMap={{'contact':t('ContactData'), 'info':t('Info'),'tags':t('Tags'), 'custom-attributes':t('CustomAttributes')}}> 
                             
                        {Object.keys(clientDataEdit || {}).map((con, index) => (
                        <Fragment key={`channel-${index}`}> 
                            {(Object.keys(contactDicRegex).includes(con)) && clientDataEdit?.[con as ContactChannel] && clientDataEdit?.[con as ContactChannel] !== '' &&
                                <Flex mt='1vh' alignItems={'center'} gap='10px' key={`contact_type-2-${index}`}> 
                                    <Skeleton  style={{flex:1}}  isLoaded={clientDataEdit !== null && !waitingInfo}>

                                    <Text fontSize='.8em' whiteSpace={'nowrap'} flex='1' textOverflow={'ellipsis'} overflow={'hidden'}  fontWeight={'medium'} color='text_gray'>{t(con)}</Text>
                                    </Skeleton>
                                    <Skeleton style={{flex:2}} isLoaded={clientDataEdit !== null && !waitingInfo}>
                                        <EditText fontSize={'.8em'} updateData={(text:string | undefined) => updateData(con, text)}  focusOnOpen={clientDataEdit?.[con as ContactChannel] === '-'} maxLength={contactDicRegex[con as ContactChannel][1]} regex={contactDicRegex[con as ContactChannel][0]} value={clientDataEdit?.[con as ContactChannel]} setValue={(value:string) => handleChangeChannel(value, con as ContactChannel)} />
                                    </Skeleton>
                                </Flex>
                                }
                        </Fragment>))}

                        <Box position={'relative'}> 
                            <Flex ref={addNewChannelButtonRef} mt='2vh'  alignItems={'center'} gap='7px' color={'text_blue'} _hover={{opacity:0.8}}  cursor={'pointer'}>
                                <Icon as={FaPlus} boxSize={'12px'} />
                                <Text fontWeight={'medium'} fontSize={'.85em'} onClick={() => setShowAddNewChannel(!showAddNewChannel)}>{t('AddContact')}</Text>
                            </Flex>
                            {showAddNewChannel && 
                                <MotionBox initial={{ opacity: 0, height:0}} animate={{ opacity: 1, height:'auto' }}  transition={{ duration: '0.15',  ease: 'easeOut'}}
                                    maxH={'40vh'} overflowY={'scroll'} mt='5px' position='absolute' ref={addNewChannelBoxRef} bg='white'  zIndex={1000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='border_color' borderWidth='1px' borderRadius='.5rem'>         
                                    {Object.keys(contactDicRegex).map((con, index) => (
                                    <Fragment key={`select-channel-${index}`}> 
                                        {(clientDataEdit?.[con as ContactChannel] === null || clientDataEdit?.[con as ContactChannel] === '')&&
                                            <Flex color='text_gray' fontSize={'.9em'} onClick={() => addNewChannel(con as ContactChannel)} key={`channels-${index}`}  px='15px' py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'gray_2'}}>
                                                <Icon as={logosMap[contactDicRegex[con as ContactChannel][2]][0]}/>
                                                <Text>{t(contactDicRegex[con as ContactChannel][2])}</Text>
                                            </Flex>
                                        }
                                    </Fragment>))}
                                </MotionBox>
                            }
                        </Box>
                    </CollapsableSection>

                    <CollapsableSection mt='3vh' section={'info'} isExpanded={sectionsExpanded.includes('info')} onSectionExpand={onSectionExpand} sectionsMap={{'contact':t('ContactData'), 'info':t('Info'), 'tags':t('Tags'), 'custom-attributes':t('CustomAttributes')}}> 
                        <Flex mt='2vh' alignItems={'center'} gap='10px' > 
                            <Text fontSize='.8em' whiteSpace={'nowrap'} flex='1' textOverflow={'ellipsis'} overflow={'hidden'}  fontWeight={'medium'} color='text_gray'>{t('contact_business_id')}</Text>
                            <Skeleton isLoaded={clientDataEdit !== null  && !waitingInfo} style={{flex:2}}> 
                                <CustomSelect  selectedItem={clientDataEdit?.business_id || ''} customImport={'business_id'} onlyOneSelect  setSelectedItem={(value:any) => updateData( 'contact_business_id', value)} options={[]} labelsMap={{}}/>
                            </Skeleton>
                        </Flex>

                
                        <Flex mt='1vh' alignItems={'center'} gap='10px' > 
                            <Text fontSize='.8em' whiteSpace={'nowrap'} flex='1' textOverflow={'ellipsis'} overflow={'hidden'}  fontWeight={'medium'} color='text_gray'>{t('language')}</Text>
                            <Skeleton isLoaded={clientDataEdit !== null  && !waitingInfo} style={{flex:2}}> 
                                <Text p='7px'  fontSize={'.8em'} flex={'2'}>{languagesFlags?.[clientDataEdit?.language]?.[1]} {languagesFlags?.[clientDataEdit?.language]?.[0]}</Text>
                            </Skeleton>
                        </Flex>

                        
                        <Flex mt='2vh' alignItems={'center'}  gap='10px'  > 
                            <Text flex='1' fontSize='.8em' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  fontWeight={'medium'} color='text_gray'>{t('notes')}</Text>
                            <Skeleton isLoaded={clientDataEdit !== null  && !waitingInfo} style={{flex:2}}>
                                <EditText placeholder={t('notes') + '...'} value={clientDataEdit?.notes} setValue={(value:string) => setClientDataEdit(prevData => prevData ? ({ ...prevData, notes:value}) as ClientData : null)           }/>
                            </Skeleton>
                        </Flex>
                        

                        <Flex mt='2vh' alignItems={'center'}  gap='10px'  > 
                            <Text flex='1' fontSize='.8em' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  fontWeight={'medium'} color='text_gray'>{t('created_at')}</Text>
                            <Skeleton isLoaded={clientDataEdit !== null  && !waitingInfo} style={{flex:2}}> 
                                <Text flex='2' p='7px'fontSize={'.8em'}>{timeAgo(clientDataEdit?.created_at, t_formats)}</Text>
                            </Skeleton>
                        </Flex>

                        <Flex mt='2vh' alignItems={'center'}  gap='10px'  > 
                            <Text flex='1' fontSize='.8em' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  fontWeight={'medium'} color='text_gray'>{t('last_interaction_at')}</Text>
                            <Skeleton isLoaded={clientDataEdit !== null  && !waitingInfo} style={{flex:2}}>
                                <Text flex='2' p='7px' fontSize={'.8em'}>{timeAgo(clientDataEdit?.last_interaction_at, t_formats)}</Text>
                            </Skeleton>
                        </Flex>
                    </CollapsableSection>

                    <CollapsableSection mt='3vh' section={'tags'} isExpanded={sectionsExpanded.includes('tags')} onSectionExpand={onSectionExpand} sectionsMap={{'contact':t('ContactData'), 'info':t('Info'), 'tags':t('Tags'), 'custom-attributes':t('CustomAttributes')}}> 
                        <Skeleton style={{marginTop:'2vh'}} isLoaded={clientDataEdit !== null && !waitingInfo}>
                        <TagEditor section={'businesses'} data={clientDataEdit}  setData={setClientDataEdit}/>

                        </Skeleton>
                    </CollapsableSection>

                    <CollapsableSection mt='3vh' section={'custom-attributes'} isExpanded={sectionsExpanded.includes('custom-attributes')} onSectionExpand={onSectionExpand} sectionsMap={{'contact':t('ContactData'),'tags':t('Tags'), 'info':t('Info'), 'custom-attributes':t('CustomAttributes')}}> 
                        <Skeleton style={{marginTop:'2vh'}} isLoaded={clientDataEdit !== null && !waitingInfo}>
                            <CustomAttributes motherstructureType="persons" motherstructureId={clientDataEdit?.id || 0}  customAttributes={clientDataEdit?.cdas || {}} updateCustomAttributes={updateCustomAttributes}/>
                        </Skeleton>
                    </CollapsableSection>
                </Box>
                
                <Flex flex='2' overflow={'hidden'} py='2vh'  flexDir={'column'} px='1vw'> 
                    <Flex mb='1vh' justifyContent={'space-between'} >
                        <Skeleton isLoaded={clientDataEdit !== null && !waitingInfo}> 
                            <Text fontWeight={'medium'} color='text_gray'>{t('Conversations', {count:clientConversationsEdit?.page_data.length})}</Text>
                        </Skeleton>
                      
                    </Flex>
                    <Table waitingInfo={waitingInfo} numberOfItems={clientConversationsEdit?.total_items || 0} data={clientConversationsEdit?.page_data || []} CellStyle={CellStyle} noDataMessage={t('NoConversations')} columnsMap={columnsConversationsMap} excludedKeys={['id', 'conversation_id', 'contact_id',  'state', 'is_matilda_engaged', 'organization_id',  'call_sid', 'call_url', 'channel_id', 'cdas' ] }  onClickRow={(row:any, index:number) => {navigate(`/conversations/conversation/${row.id}`)}}/>
                </Flex>
            </Flex>
        </Flex>
    </>)
    }

export default Person

interface MergeBoxProps {
    clientData:ClientData | null
    setShowMerge: Dispatch<SetStateAction<boolean>>
 }

const MergeBox = ({clientData, setShowMerge}:MergeBoxProps) => {

    //AUTH CONSTANT
    const { t } = useTranslation('clients')
    const { getAccessTokenSilently } = useAuth0()
    const auth = useAuth()
    const navigate = useNavigate()

    //SHOW CONFIRM
    const [showConfirmMerge, setShowConfirmMerge] = useState<boolean>(false)
 
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
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/persons`, setValue:setElementsList, getAccessTokenSilently, auth, params: { page_index: 1, query: text, filters:{logic:'AND', groups:[]} }})
            if (response?.status === 200) {setShowResults(true);setWaitingResult(false)}
            else {setShowResults(false);setWaitingResult(false)}
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [text])
    
    //CONFIRM MERGE BOX
    const ConfirmMergeBox = () => {

        const [waitingConfirmMerge, setWaitingConfirmMerge] = useState<boolean>(false)

        const confirmMerge = async () => {
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/persons/merge/${clientData?.id}/${selectedClient?.id}`, getAccessTokenSilently, method:'put', setWaiting:setWaitingConfirmMerge, params: { new_name:clientData?.name}, auth: auth, toastMessages:{'works':`${clientData?.name} y ${selectedClient?.name} se han fusionado correctamente`,'failed':'Hubo un fallo al fusionar los clientes'}})
            if (response?.status === 200) {
                navigate('/contacts/clients')
                setShowConfirmMerge(false)
                setShowMerge(false)
            }
        }

        return (
        <Box p='15px'> 
        <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ConfirmMerge')}</Text>
        <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='border_color'/>
        <Text fontSize={'.9em'}>{parseMessageToBold(t('MergeUsersConfirm', {user_1:clientData?.name,user_2:selectedClient?.name}))}</Text>

        <Flex mt='2vh' gap='15px' flexDir={'row-reverse'} >
            <Button  size='sm' variant='main' onClick={confirmMerge}>{waitingConfirmMerge?<LoadingIconButton/>:'Fusionar'}</Button>
            <Button  size='sm' variant={'common'} onClick={()=>setShowConfirmMerge(false)}>{t('Cancel')}</Button>
        </Flex>
        </Box>
        )
    }

    const memoizedConfirmBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowConfirmMerge}> 
            <ConfirmMergeBox/>
        </ConfirmBox>
    ), [showConfirmMerge])

    return(<>
            <Box p='15px'> 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('MergeUser')}</Text>
                 
                {showConfirmMerge ? <>{memoizedConfirmBox}</>
                :
                <> 
                <Text mb='1vh' mt='2vh' fontSize={'.9em'} fontWeight={'medium'}>{t('SearchToMerge')}</Text>
                <Box position={'relative'}> 
                    <EditText waitingResult={waitingResult} value={text} setValue={setText} searchInput={true}/>
                
                    {(showResults && 'page_data' in elementsList) && 
                        <Box  maxH='30vh' overflow={'scroll'} width='100%' gap='10px' ref={boxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.3)'} bg='white' zIndex={100000} className={'slide-down'} position={'absolute'} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'border_color'}>
                            {elementsList.page_data.length === 0? 
                            <Box p='15px'><Text>{t('NoCoincidence')}</Text></Box>
                            :<> {elementsList.page_data.map((client:ClientData, index:number) => (
                                <Flex _hover={{bg:'gray_2'}} cursor={'pointer'} alignItems={'center'} onClick={() => {setText('');setSelectedClient({id:client.id, name:client.name});setShowResults(false)}} key={`user-${index}`} p='10px' gap='15px' >
                                    <Avatar size='xs' name={client.name}/>
                                    <Box>
                                        <Text fontWeight={'medium'}>{client.name}</Text>
                                    </Box>
                                </Flex>
                            ))}</>}
                        </Box>}

                </Box>

                <Flex mt='20vh' justifyContent={'center'} gap='20px' alignItems={'center'}>
                    <Flex alignItems={'center'} p='10px' gap='15px' boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.1)'}  borderColor={'border_color'} borderWidth='1px' borderRadius={'.5rem'}>
                        <Avatar name={clientData?.name} size='sm'/>
                        <Box>
                            <Text fontWeight={'medium'}>{clientData?.name}</Text>
                        </Box>
                    </Flex>
                    <Icon as={FaArrowRight} boxSize={'25px'}/>
                    {selectedClient === null ? <Text fontSize={'.9em'} width={'150px'} textAlign={'center'}>{t('SelectMergeClient')}</Text>
                    :<Flex alignItems={'center'} p='10px' gap='15px' boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.1)'}  borderColor={'border_color'} borderWidth='1px' borderRadius={'.5rem'}>
                        <Avatar size='sm' name={selectedClient?.name}/>
                        <Box>
                            <Text fontWeight={'medium'}>{selectedClient?.name}</Text>
                        </Box>
                    </Flex>}
                </Flex>
                </>}
          
          
            <Flex mt='2vh' gap='15px' flexDir={'row-reverse'} >
                <Button  size='sm'variant='main' isDisabled={selectedClient === null} onClick={()=>setShowConfirmMerge(true)}>{showConfirmMerge?t('ConfirmAndMerge'):t('Merge')}</Button>
                <Button  size='sm'   variant={'common'} onClick={()=>setShowMerge(false)}>{t('Cancel')}</Button>
            </Flex>
            </Box>
        </>
    )
}

