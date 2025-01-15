
//REACT
import  {useState, useEffect, useRef, useMemo, Dispatch, SetStateAction, CSSProperties, ReactElement } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
import { useSession } from '../../../../SessionContext'
import { useAuth0 } from '@auth0/auth0-react'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, IconButton, Icon, Button, Skeleton, chakra, shouldForwardProp, Portal, Switch, NumberInput, NumberInputField, NumberInputStepper, NumberDecrementStepper, NumberIncrementStepper, Radio } from "@chakra-ui/react"
import '../../../Components/styles.css'
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion'
//COMPONENTS
import EditText from '../../../Components/Reusable/EditText'
import ConfirmBox from '../../../Components/Reusable/ConfirmBox'
import SectionSelector from '../../../Components/Reusable/SectionSelector'
import SaveChanges from '../../../Components/Reusable/SaveChanges'
import ActionsButton from '../../../Components/Reusable/ActionsButton'
import { EditStr, EditColor, EditImage, EditInt } from '../../../Components/Reusable/EditSettings'
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
//FUNCTIONS
import copyToClipboard from '../../../Functions/copyTextToClipboard'
import useOutsideClick from '../../../Functions/clickOutside'
import determineBoxStyle from '../../../Functions/determineBoxStyle'
import parseMessageToBold from '../../../Functions/parseToBold'
//ICONS
import { RxCross2 } from 'react-icons/rx'
import { IoIosArrowDown, IoIosChatboxes, IoIosArrowBack } from 'react-icons/io'
import { FaPlus , FaCode, FaPaintbrush, FaHouse, FaRobot } from 'react-icons/fa6'
import { MdContentCopy } from 'react-icons/md'
import { IoChatbubbleEllipses, IoConstruct } from "react-icons/io5"
import { BiTargetLock } from "react-icons/bi"
import { TbMessageFilled } from "react-icons/tb"
import { BsPersonLinesFill } from "react-icons/bs"
import { FaListUl } from "react-icons/fa"
//TYPING
import { ChannelsType, ConfigProps, languagesFlags } from '../../../Constants/typing'
import { useLocation, useNavigate } from 'react-router-dom'
import { BsThreeDots } from 'react-icons/bs'
import { HiTrash } from 'react-icons/hi2'

//TYPING
type sectionKeys = 'allowed_urls' | 'allowed_devices' | 'show_incoming_messages' | 'lure_by_seconds' | 'seconds_to_lure_in' | 'lure_by_click' | 'reference_to_lure_in' | 'pages_references' | 'initial_message' | 'options'
interface SectionType  {
    allowed_urls:string[]
    allowed_devices:string[]
    lure_by_seconds:boolean 
    seconds_to_lure_in:number 
    lure_by_click:boolean 
    show_incoming_messages:boolean,
    reference_to_lure_in:string 
    pages_references:{[key:string]:string}
    initial_message:{[key:string]:string} 
    options:{[key:string]:string[]}
}

interface ChatBotData  {
    welcome_message:{[key:string]:string}
    chat_position:'right' | 'left'
    actions_color:string
    messages_opacity:number | string
    bot_name:string
    mesh_colors:[string, string]
    ai_message:{[key:string]:string}
    header_background: [string, string]
    header_color: string
    chat_avatar: string
    client_background: [string, string]
    client_color: string
    options: {[key:string]:string[]}
    sections: SectionType[]
}
 
 
//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//MAIN FUNCTION
function Chatbot ({setChannelsData}:{setChannelsData:Dispatch<SetStateAction<ChannelsType[]>>}) {

    //CONSTANTS
    const { getAccessTokenSilently } = useAuth0()
    const auth = useAuth()
    const location = useLocation().pathname
    const session = useSession()
    const navigate = useNavigate()
    const { t, i18n } = useTranslation('settings')
    const [channelDict, setChannelDict] = useState<any>(null)

    //REF FOR ALL THE COLOR PICKER CONTAINERS
    const containerRef = useRef<HTMLDivElement>(null)

    const newSection = {
        allowed_urls:[],
        allowed_devices:['mobile', 'desktop'],
        lure_by_seconds:false, 
        seconds_to_lure_in:0,
        lure_by_click:false, 
        reference_to_lure_in:'', 
        show_incoming_messages:true,
        pages_references:{},
        initial_message:{[i18n.language.toLocaleUpperCase()]:''},
        options:{[i18n.language.toLocaleUpperCase()]:[]},
    }
    
    const channelId = location.split('/')[location.split('/').length - 1]

    //CURRENT EXPANDED SECTION
    const sectionsMap:{[key:string]:[string, ReactElement]} = {'tilda':[t('tilda'), <FaRobot/>], 'elements':[t('elements'), <IoConstruct/>], 'colors':[t('colors'), <FaPaintbrush/>], 'texts':[t('texts'), <BsPersonLinesFill/>], 'sections':[t('sections'), <FaListUl/>]}
    const [currentSection, setCurrentSection] = useState<'tilda' | 'elements' | 'colors' | 'texts' | 'sections'>('tilda')

    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false) 


    //SELECTED LANGUAGE 
    const [selectedLanguage, setSelectedLanguage] = useState<string>(i18n.language.toLocaleUpperCase())

    //SHOW CODE BOX
    const [showCode, setShowCode] = useState<boolean>(false)

    //FIXED AND CHANGING CHATBOT DATA
    const chatbotDataRef = useRef<ChatBotData | null>(null)
    const [chatBotData, setChatBotData] = useState<ChatBotData | null>(null)

    //MATILDA CONFIGURATION
    const configIdRef = useRef<string | null>(null)
    const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null)
    const [configData, setConfigData] = useState<ConfigProps[] | null>(null)

    //BOOLEAN FOR SHOW THE CHAT
    const [expandedIndex, setExpandedIndex] = useState<number>(-1)

    //FILES FOR AVATAR AND LOGO
    const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined)

  

    const getPreSignedUrl = async (file:File) => {
        const response = await fetchData({endpoint: `${auth.authData.organizationId}/chatbot/s3_pre_signed_url`, getAccessTokenSilently, method:'post', auth:auth, requestForm: { file_name: file.name}})   
        if (response?.status === 200) {
            const responseUpload = await fetch(response.data.upload_url, {method: "PUT", headers: {}, body: file})
            if (responseUpload.ok) {
                return response.data.access_url as string
            }
            else return ''
        }
        else return ''
    }

    //ADD OPTIONS LOGIC
    const addOption = (newOption:string) => {setChatBotData(prev => ({...prev as ChatBotData, options: {...(prev as ChatBotData).options, [selectedLanguage]:[...prev?.options[selectedLanguage] || [], newOption]}}))}
    const removeOption = (index:number) => {setChatBotData(prev => ({...prev as ChatBotData, options: {...(prev as ChatBotData).options, [selectedLanguage]:(prev?.options[selectedLanguage] || []).filter((_, i) => i !== index)}}))}
    const AddOptionComponent = () => {

        const [showAddOption, setShowAddOption] = useState<boolean>(false)
        const [newOption, setNewOption] = useState<string>('')

        return(<Box mt='1vh'>
            {!showAddOption && 
            <Flex flexDir={'row-reverse'}>
                <Button variant={'common'} leftIcon={<FaPlus/>} size='xs' onClick={() => setShowAddOption(!showAddOption)}>{t('AddShortcutWeb')}</Button>
            </Flex>}
            {showAddOption && 
            <Flex> 
                <EditText value={newOption} updateData={(text:string | undefined) => {if (text === '') setShowAddOption(false);else addOption(text as string)}} setValue={setNewOption} hideInput={false} focusOnOpen={true}/>
            </Flex>}
        </Box>)
    }

    //FETCH NEW DATA WHEN THE VIEW CHANGE
    useEffect(() => {
        document.title = `${t('Channels')} - ${t('Web')} - ${auth.authData.organizationName} - Matil`
        const fetchInitialData = async() => {
            await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations`, getAccessTokenSilently, setValue:setConfigData, auth})
            const responseChat = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels/${channelId}`,setValue:setChannelDict, getAccessTokenSilently, auth, })
            if (responseChat?.status === 200) { 
                
                chatbotDataRef.current = JSON.parse(JSON.stringify(responseChat.data.configuration))
                setChatBotData({...responseChat.data.configuration})
                configIdRef.current = responseChat.data.matilda_configuration_uuid
                setSelectedConfigId(responseChat.data.matilda_configuration_uuid)
            }
        }
        fetchInitialData()
    }, [])

    
    //DUPPLICATE WEBCHAT
    const duplicateChannel = async() => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels/webchat`, getAccessTokenSilently, auth, method:'post', requestForm:{name:channelDict.name + ' ' + t('Copy'),  configuration:chatBotData}, toastMessages:{'works':t('CorrectCopiedChannel'), 'failed':t('FailedCopiedChannel')}})
        if (response?.status === 200) {
            const newChannel = {id: response.data.id, uuid: response.data.id, display_id: `webchat_${response.data.id}`, name: channelDict.name + ' ' + t('Copy'), channel_type: 'webchat', is_active: true}
            setChannelsData((prevChannels) => [...prevChannels, newChannel])
            const updatedChannels = [...session.sessionData.additionalData.channels || [], newChannel]
            session.dispatch({type:'ADD_CHANNELS', payload:updatedChannels})
            navigate(`/settings/channels/webchat/${response.data.id}`)
        
        }
    }

    // SEND THE CHATBOT CONFIGURATION
    const sendChatBotCofig = async() => {
        let chatAvatar = chatbotDataRef.current?.chat_avatar 
        if (avatarFile) chatAvatar = await getPreSignedUrl(avatarFile)
        const opacity = typeof(chatBotData?.messages_opacity) === 'number' ? chatBotData?.messages_opacity:parseFloat(chatBotData?.messages_opacity || '0.5')
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels/${channelId}`, getAccessTokenSilently, auth, method:'put', requestForm:{...channelDict, configuration:{...chatBotData, chat_avatar:chatAvatar, messages_opacity:opacity}, matilda_configuration_uuid:selectedConfigId}, toastMessages:{'works':t('CorrectUpdatedInfo'), 'failed':t('FailedUpdatedInfo')}})
        if (response?.status === 200) {
            configIdRef.current = selectedConfigId
            chatbotDataRef.current = JSON.parse(JSON.stringify(chatBotData))
        }
    }

    //SHIOW CODE BOX
    const memoizedShowCodeBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowCode}> 
            <Box p='15px'>
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('InsertCode')}</Text>
                <Text  mb='2vh' fontSize={'.9em'} color='gray.600'>{t('InsertCodeDes')}</Text>
                <Flex p='15px' gap='20px'   borderRadius={'.5rem'} bg='brand.gray_2'>
                    <Text flex='1' color='gray.600' fontSize={'.7em'}>{`<script defer src="https://chat-widget-matlil.s3.eu-west-3.amazonaws.com/insert.js?organization_id=${auth.authData.organizationId}&chatbot_id=${channelDict?.id}" id="matil-chat-widget"></script>`}</Text>
                </Flex>
                <Button onClick={() => {setShowCode(false);copyToClipboard(`<script defer src="https://chat-widget-matlil.s3.eu-west-3.amazonaws.com/insert.js?organization_id=${auth.authData.organizationId}&chatbot_id=${channelDict?.id}" id="matil-chat-widget"></script>`, t('CorrectCopiedCode'))}} leftIcon={<MdContentCopy/>} size='sm' variant={'common'} mt='2vh'>{t('CopyCode')}</Button>
            </Box>  
        </ConfirmBox>
    ), [showCode])

    const [waitingDelete, setWaitingDelete] = useState<boolean>(false) 

    const memoizedDeleteBox = useMemo(() => {

        const handleDeleteChannel= async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/${channelId}`, getAccessTokenSilently, setWaiting:setWaitingDelete, method:'delete', auth, toastMessages:{'works':t('CorrectDeletedChannel'), 'failed':t('FailedDeletedChannel')}})
            if (response?.status == 200) {
                setChannelsData((prevChannels) => prevChannels.filter((channel) => channel.id !== channelId))
                const updatedChannels = (session.sessionData.additionalData.channels || []).filter((channel) => channel.id !== channelId)
                session.dispatch({type:'ADD_CHANNELS', payload:updatedChannels})
                navigate('/settings/channels/all-channels')   
            }
        }
    
        return (
        <ConfirmBox setShowBox={setShowConfirmDelete}> 
                <Box p='15px'> 
                    <Text fontSize={'1.2em'}>{parseMessageToBold(t('DeleteChannelAnswer', {name:channelDict?.name}))}</Text>
                    <Text mt='2vh' fontSize={'.8em'}  color='gray.600'>{t('DeleteChannelWarning')}</Text>
                    <Flex  mt='2vh' gap='15px' flexDir={'row-reverse'}>
                        <Button size='sm' variant={'delete'}onClick={handleDeleteChannel}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                        <Button  size='sm' variant={'common'} onClick={() => setShowConfirmDelete(false)}>{t('Cancel')}</Button>
                    </Flex>
                </Box>
            </ConfirmBox>)
    }, [showConfirmDelete])

    //MEMOIZED ACTIONS BUTTON
    const memoizedActionsButton = useMemo(() => (<ActionsButton deleteAction={() => setShowConfirmDelete(true)} copyAction={duplicateChannel} />), [channelDict, chatBotData])

    return(<>

        {showConfirmDelete && memoizedDeleteBox}
        {showCode && memoizedShowCodeBox}
        
        <SaveChanges data={chatBotData} setData={setChatBotData} dataRef={chatbotDataRef} data2={selectedConfigId} dataRef2={configIdRef} setData2={setSelectedConfigId} onSaveFunc={sendChatBotCofig}  />
        <Box px='2vw' pt='2vh'> 
            <Skeleton  isLoaded={(chatBotData !== null)}> 
                <Text fontSize={'1.2em'} fontWeight={'medium'}>{channelDict?.name || ''}</Text>
            </Skeleton>
            
            <Flex justifyContent={'space-between'}> 

                <Box h='40px' > 
                    <SectionSelector notSection selectedSection={currentSection} sections={Object.keys(sectionsMap)} sectionsMap={sectionsMap}  onChange={(sec) => setCurrentSection(sec as any) }/>  
                 </Box>
                <Flex gap='12px'>
                    {memoizedActionsButton}
                    <Button leftIcon={<IoChatbubbleEllipses/>}  onClick={() => window.open(`https://main.d1pm9d6glnzyf9.amplifyapp.com?organization_id=${auth.authData.organizationId}&webchat_uuid=${channelDict?.id}`, '_blank')} size='sm' variant={'main'}>{t('TryWeb')}</Button>  
                    <Button leftIcon={<FaCode/>} onClick={() => setShowCode(true)} size='sm' variant={'main'}>{t('ShowCode')}</Button>  
                </Flex>
            </Flex>
            <Box bg='gray.200' h='1px' w='100%'/>


        </Box>

        <Flex flex='1' overflow={'hidden'} pr='2vw' ref={containerRef} position='relative'> 
            <Flex flex='1'  pt='3vh'  height={'100%'} px='2vw' overflow={'scroll'}> 
                <Skeleton style={{flex:1}} isLoaded={chatBotData !== null}> 

                {(() => {
                    switch (currentSection) {
                        case 'tilda':
                            return (<>
                              <Skeleton isLoaded={configData !== null}> 
                                    <Text fontWeight={'semibold'} >{t('SelectedConfig')}</Text>
                                    {configData?.map((config, index) => (
                                        <Box transition={'box-shadow 0.2s ease-in-out'} _hover={{shadow:'md'}}  mt='1vh' key={`config-${index}`} bg={selectedConfigId === config.uuid?'brand.gray_2':'white'} onClick={() => setSelectedConfigId(config.uuid)} borderColor={'gray.200'} borderWidth={'1px'} borderRadius={'.5rem'} p='15px' cursor={'pointer'}>
                                            <Text fontSize={'.9em'} fontWeight={'medium'}>{config.name}</Text>
                                            <Text fontSize={'.8em'} color='gray.600'>{config.description}</Text>
                                        </Box> 
                                    ))}
                                </Skeleton>
                                </>)

                        case 'elements':
                            return (<>
                            
                                <Text fontWeight={'semibold'}>{t('AiAssitant')}</Text>
                                <Box mt='1vh' maxW={'250px'}> 
                                    <EditStr title={t('BotName')} description={t('BotNameDes')} placeholder={t('Tilda')} value={chatBotData?.bot_name || ''} setValue={(value) => setChatBotData(prev => ({...prev as ChatBotData, bot_name:value}))}/>
                                </Box>
                                <Box mt='1vh'> 
                                    <EditImage title={t('Avatar')} description={t('AvatarDes')} value={chatBotData?.chat_avatar || ''} setValue={(value:any) => setChatBotData(prev => ({...prev as ChatBotData, chat_avatar:value}))}/>
                                </Box>


                                <Text mt='3vh' fontWeight={'semibold'}>{t('ChatPosition')}</Text>
                                <Flex mt='3vh'> 
                                    <Flex gap='10px' cursor={'pointer'}  alignItems={'center'} onClick={(e) => setChatBotData({...chatBotData as ChatBotData, 'chat_position':'left'})}> 
                                        <Text fontSize={'.9em'}>{t('Left')}</Text>
                                        <Icon  boxSize={'20px'} color={chatBotData?.chat_position === 'left' ? 'brand.text_blue':''} as={BsThreeDots}/>
                                        <Flex  height={'20px'} borderRadius={'50%'} width={'20px'}  bg={chatBotData?.chat_position === 'left' ? 'brand.text_blue':''} alignItems={'center'} justifyContent={'center'}  borderColor={'gray.300'} borderWidth={'1px'}>
                                            <Box borderRadius={'50%'} bg='white' h='7px' w='7px'/>
                                        </Flex>

                                    </Flex>                        
                                    <svg width="183" height="105" viewBox="0 0 122 70" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M108 63.5H109.5V62V5C109.5 3.067 107.933 1.5 106 1.5H16C14.067 1.5 12.5 3.067 12.5 5V62V63.5H14H108Z" fill="white"></path><path d="M108 63.5H109.5V62V5C109.5 3.067 107.933 1.5 106 1.5H16C14.067 1.5 12.5 3.067 12.5 5V62V63.5H14H108Z" stroke="#0D1726" stroke-width="3"></path><path d="M0 65H122V68C122 69.1046 121.105 70 120 70H2C0.895428 70 0 69.1046 0 68V65Z" fill="#ACB8CB"></path><path d="M54 65H72V65C72 66.1046 71.1046 67 70 67H56C54.8954 67 54 66.1046 54 65V65Z" fill="#8796AF"></path><rect width="100" height="28" transform="translate(11 21)" fill="white"></rect></svg>
                                    <Flex gap='10px' cursor={'pointer'} alignItems={'center'} onClick={(e) => setChatBotData({...chatBotData as ChatBotData, 'chat_position':'right'})}> 
                                        <Flex  height={'20px'} borderRadius={'50%'} width={'20px'}  bg={chatBotData?.chat_position === 'right' ? 'brand.text_blue':''} alignItems={'center'} justifyContent={'center'}  borderColor={'gray.300'} borderWidth={'1px'}>
                                            <Box borderRadius={'50%'} bg='white' h='7px' w='7px'/>
                                        </Flex>
                                        <Icon boxSize={'20px'} color={chatBotData?.chat_position === 'right' ? 'brand.text_blue':''} as={BsThreeDots}/>
                                        <Text fontSize={'.9em'}>{t('Right')}</Text>
                                    </Flex>      
                                </Flex>  
                                
                                <Text fontWeight={'semibold'} mt='3vh'>{t('Others')}</Text>
                                <Box mt='1vh'> 
                                    <EditInt title={t('MessageOpacity')} description={t('MessageOpacityDes')} value={chatBotData?.messages_opacity || ''} setValue={(value:any) => setChatBotData(prev => ({...prev as ChatBotData, messages_opacity:value}))} unit='' min={0.3} max={1}/>
                                </Box>

                                </>)
                        case 'colors':
                            return (<>
                                    
                                    <Text fontWeight={'semibold'}>{t('Header')}</Text>
                                    <Box mt='1vh'> 
                                        <EditColor isGradient title={t('BackgroundColor')} description={t('BackgroundColorDes')} value={chatBotData?.header_background || ''} containerRef={containerRef} setValue={(value) => setChatBotData(prev => ({...prev as ChatBotData, header_background:value as any}))}/>
                                    </Box>
                                    <Box mt='1vh'> 
                                        <EditColor title={t('TextColor')} description={t('TextColorDes')} value={chatBotData?.header_color || ''} containerRef={containerRef} setValue={(value) => setChatBotData(prev => ({...prev as ChatBotData, header_color:value as any}))}/>
                                    </Box>

                                    <Text mt='3vh' fontWeight={'semibold'}>{t('Messages')}</Text>
                                    <Box mt='1vh'> 
                                        <EditColor isGradient title={t('BackgroundColorMessages')} description={t('BackgroundColorMessagesDes')} value={chatBotData?.client_background || ''} containerRef={containerRef} setValue={(value) => setChatBotData(prev => ({...prev as ChatBotData, client_background:value as any}))}/>
                                    </Box>
                                    <Box mt='1vh'> 
                                        <EditColor title={t('TextColorMessages')} description={t('TextColorMessagesDes')} value={chatBotData?.client_color || ''} containerRef={containerRef} setValue={(value) => setChatBotData(prev => ({...prev as ChatBotData, client_color:value as any}))}/>
                                    </Box>
                                    
                                    <Text mt='3vh' fontWeight={'semibold'}>{t('Others')}</Text>
                                    <Box mt='1vh'> 
                                        <EditColor isGradient title={t('MeshColors')} description={t('MeshColorsDes')} value={chatBotData?.mesh_colors || ''} containerRef={containerRef} setValue={(value) => setChatBotData(prev => ({...prev as ChatBotData, mesh_colors:value as any}))}/>
                                    </Box>
                                    <Box mt='1vh'> 
                                        <EditColor title={t('ActionsColorChat')} description={t('ActionsColorChatDes')} value={chatBotData?.actions_color || ''} containerRef={containerRef} setValue={(value) => setChatBotData(prev => ({...prev as ChatBotData, actions_color:value as any}))}/>
                                    </Box>
                                   
                                </>)
                        case 'texts':
                            return (<>
                              
                                <Text mb='1vh' fontWeight={'semibold'}>{t('SelectLanguage')}</Text>

                                <ChangeLanguage variant={'styles'} selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} chatBotData={chatBotData} setChatBotData={setChatBotData} />
                                <Box mt='3vh'> 
                                    <EditStr title={t('TildaMessage')} description={t('TildaMessageDes')} value={chatBotData?.ai_message?.[selectedLanguage] || ''} setValue={(value) => setChatBotData(prev => ({...prev as ChatBotData, ai_message:{...(prev as ChatBotData).ai_message, [selectedLanguage]:value}}))}/>
                                </Box>
                                <Box mt='1vh'> 
                                    <EditStr title={t('WelcomeMessage')} description={t('WelcomeMessageDes')} value={chatBotData?.welcome_message?.[selectedLanguage] || ''} setValue={(value) => setChatBotData(prev => ({...prev as ChatBotData, welcome_message:{...(prev as ChatBotData).welcome_message, [selectedLanguage]:value}}))}/>
                                </Box>

                                <Text fontWeight={'medium'} mt='1vh' fontSize={'.9em'}>{t('Shortcuts')}</Text>
                                <Box width={'100%'} mt='1vh'> 
                                    {(chatBotData?.options[selectedLanguage] || []).map((option, urlIndex) => (
                                        <Flex key={`option-${urlIndex}`} mt={urlIndex === 0?'0':'1vh'} justifyContent={'space-between'} alignItems={'center'} p='5px' borderRadius=".5em" borderColor="gray.200" borderWidth="1px" bg="brand.hover_gray">
                                            <Text fontSize={'.9em'}>{option}</Text>
                                            <IconButton onClick={() => removeOption(urlIndex)} aria-label="remove-option" icon={<HiTrash  size='15px'/>} variant={'delete'} size="xs" border='none' bg='transparent'  />
                                        </Flex>
                                    ))}
                                </Box> 
                                <AddOptionComponent/>
                                
                                </>)
                        case 'sections':
                            return (<>
                                    {chatBotData?.sections.map((section, index) => (
                                        <EditSection key={`section-${index}`} chatBotData={chatBotData} setChatBotData={setChatBotData} index={index} expandedIndex={expandedIndex} setExpandedIndex={setExpandedIndex}/>
                                    ))}
                                    <Button size='sm' mt='4vh' leftIcon={<FaPlus/>} variant={'common'} onClick={() => setChatBotData(prev => ({...prev as ChatBotData, sections:[...(chatBotData as ChatBotData).sections, newSection]}))}>{t('AddSection')}</Button>
                                </>)
                        default:
                            return <></>
                    }
                })()}
                    
                </Skeleton>
            </Flex>
            <Box  flex='1'   height={'calc(100%)'} py='3vh'> 
                <ShowChatBox chatBotData={chatBotData} selectedLanguage={selectedLanguage}/>
            </Box>
        </Flex>     
        </>   
       )
}

export default Chatbot


const EditSection = ({chatBotData, setChatBotData, index, expandedIndex, setExpandedIndex}:{chatBotData:ChatBotData, setChatBotData:Dispatch<SetStateAction<ChatBotData | null>>,  index:number, expandedIndex:number, setExpandedIndex:Dispatch<SetStateAction<number>>}) => {

    //CONSTANTS
    const { t, i18n } = useTranslation('settings')
    const section = chatBotData.sections[index]
    const isExpanded = expandedIndex === index

    // IS HOVERING SECTION
    const [isHovering, setIsHovering] = useState<boolean>(false)

    const [selectedLanguage, setSelectedLanguage] = useState<string>(i18n.language.toLocaleUpperCase())
    const editData = (type:'edit' | 'delete',  keyToEdit:sectionKeys, value: any) => {
       
        setChatBotData(prev => { 
            if (prev) {
                let newSections = prev.sections 
                if (type === 'edit' && index !== undefined) newSections[index] = {...newSections[index], [keyToEdit]:value}
                else if (type === 'delete' && index !== undefined) newSections.splice(index, 1)
                return {...prev, sections:newSections}
            }
            
            else return prev
        })
        
    }

    const AddOptionComponent = ({keyToEdit}:{keyToEdit:'allowed_urls' | 'options'}) => {

        const [showAddOption, setShowAddOption] = useState<boolean>(false)
        const [newOption, setNewOption] = useState<string>('')

        const editOption = (text:string) => {
            if (keyToEdit === 'allowed_urls') editData('edit', 'allowed_urls', [...section.allowed_urls, text])
            else  editData('edit', 'options', {...section.options, [selectedLanguage]: [...section.options[selectedLanguage], text]})
        }
        return(<Box mt='1vh'>
            {!showAddOption && 
            <Flex flexDir={'row-reverse'}>
                <Button variant={'common'} leftIcon={<FaPlus/>} size='xs' onClick={() => setShowAddOption(!showAddOption)}>{keyToEdit === 'allowed_urls'?t('AddUrl'):t('AddShortcutWeb')}</Button>
            </Flex>}
            {showAddOption && 
            <Flex> 
                <EditText value={newOption} updateData={(text:string | undefined) => {if (text === '') setShowAddOption(false);else editOption(text as string)}} setValue={setNewOption} hideInput={false} focusOnOpen={true}/>
            </Flex>}
        </Box>)
    }

    return (
    <Box p='20px'  bg={(isExpanded || isHovering) ?'white':'#FDFDFD'}  width={'100%'} mb='3vh'  borderWidth={'1px'} borderColor={(isExpanded || isHovering) ? 'brand.text_blue':'gray.300'} borderRadius={'.5rem'} shadow={(isExpanded || isHovering)?'md':'sm'} transition={'box-shadow 0.3s ease-in-out, background-color 0.3s ease-in-out,border-color 0.3s ease-in-out'} onMouseEnter={() => setIsHovering(true)}  onMouseLeave={() => setIsHovering(false)}  >
        
        <Box alignItems={'center'} justifyContent={'space-between'}  >

            <Flex cursor={'pointer'} alignItems={'center'} justifyContent={'space-between'} onClick={() => setExpandedIndex(index === expandedIndex ? -1:index)}> 
                <Text fontWeight={'medium'}>{t('AllowedUrls')}</Text>
                <IoIosArrowDown color={(isExpanded || isHovering) ? 'rgb(59, 90, 246)':'gray.600'} className={isExpanded ? "rotate-icon-up" : "rotate-icon-down"}/>
            </Flex>
            <Text fontSize={'.8em'} color='gray.600'>{t('AllowedUrlsDes')}</Text>
            <Box width={'100%'} mt='2vh'> 
                {section?.allowed_urls.map((option, index2) => (
                    <Flex key={`option-${index2}`} mt={index2 === 0?'0':'1vh'} justifyContent={'space-between'} alignItems={'center'} p='5px' borderRadius=".5em" borderColor="gray.200" borderWidth="1px" bg="brand.gray_2">
                        <Text fontSize={'.9em'}>{option}</Text>
                        <IconButton onClick={() => editData('edit', 'allowed_urls', section.allowed_urls.filter((_, i) => i !== index2))} aria-label="remove-option" icon={<RxCross2  size='15px'/>} color={'red'} size="xs" border='none' bg='transparent'  />
                    </Flex>
                ))}
            </Box> 
            <AddOptionComponent keyToEdit={'allowed_urls'}/>
        </Box>

        <motion.div initial={false} animate={{height:isExpanded?'auto':0}} exit={{height:isExpanded?0:'auto'}} transition={{duration:.3}} style={{overflow:'hidden'}} >           


            <Flex gap='8px' alignItems={'center'} mt='2vh'>
                <Switch isChecked={section.show_incoming_messages}  onChange={(e) => editData('edit', 'show_incoming_messages',e.target.checked)} />
                <Text fontWeight={'medium'} fontSize={'.9em'}>{t('ActivateFloatingMessages')}</Text>
            </Flex>
            <Text mt='.5vh' fontSize={'.8em'} color='gray.600'>{t('ActivateFloatingMessagesDes')}</Text>

            <Text fontWeight={'medium'}  mt='2vh'>{t('ShowMessages')}</Text>
            <Flex gap='8px' alignItems={'center'} mt='2vh'>
                <Switch isChecked={section.lure_by_seconds}  onChange={(e) => editData('edit', 'lure_by_seconds',e.target.checked)} />
                <Text fontWeight={'medium'} fontSize={'.9em'}>{t('ShowEnterMessage')}</Text>
            </Flex>
            <Text mt='.5vh' fontSize={'.8em'} color='gray.600'>{t('ShowEnterMessageDes')}</Text>
            {section.lure_by_seconds && <>
                <Text fontWeight={'medium'} mt='1vh' fontSize={'.9em'}>{t('SecondsToShow')}</Text>
                
                <NumberInput width={'200px'} size='sm' mt='.5vh' value={section?.seconds_to_lure_in} onChange={(val) => {if (parseInt(val) < 61)  editData('edit', 'seconds_to_lure_in', parseInt(val))} } min={0} max={60}>
                    <NumberInputField  fontSize={'.9em'} borderRadius='.5rem'   borderColor={'gray.300'} _hover={{ border: '1px solid #CBD5E0' }} _focus={{ borderColor: 'brand.text_blue', borderWidth: '2px', px:'6px' }} px='7px' />
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
            </>}

            <Flex gap='8px' alignItems={'center'} mt='2vh'>
                <Switch isChecked={section.lure_by_click}  onChange={(e) => editData('edit', 'lure_by_click',e.target.checked)} />
                <Text fontWeight={'medium'} fontSize={'.9em'}>{t('ShowOnClick')}</Text>
            </Flex>
            <Text mt='.5vh' fontSize={'.8em'} color='gray.600'>{t('ShowOnClickDes')}</Text>
            {section.lure_by_click && <>
                <Text mt='1vh' fontSize={'.9em'}><span style={{fontWeight:500}}>{t('Element')}:</span> {section.reference_to_lure_in}</Text>
                <Button mt='1vh' size='sm' variant='common' onClick={() => {}} leftIcon={<BiTargetLock/>}>{t('SelectElement')}</Button>
            </>}
                
            {(section.lure_by_click || section.lure_by_seconds) && <>
                <Text fontWeight={'medium'}  mt='2vh'>{t('MessagesOptions')}</Text>
                <Box mt='1vh'> 
                    <ChangeLanguage variant={'section'} selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} chatBotData={chatBotData} setChatBotData={setChatBotData} index={index}/>
                </Box>
                <Text fontWeight={'medium'} fontSize={'.9em'}   mt='2vh'>{t('WelcomeMessage')}</Text>
                <Text fontSize={'.8em'} color='gray.600'>{t('WelcomeMessageDes')}</Text>
                <Box width='100%' mt='1vh'> 
                    <EditText hideInput={false} value={section?.initial_message[selectedLanguage]} setValue={(value) => editData('edit', 'initial_message', {...section.initial_message, [selectedLanguage]:value})}/>
                </Box>
                
                <Text fontWeight={'medium'}   fontSize={'.9em'} mt='2vh'>{t('Shortcuts')}</Text>
                <Text fontSize={'.8em'} color='gray.600'>{t('ShortcutWebsDes')}</Text>
                <Box width={'100%'} mt='2vh'> 
                    {section?.options[selectedLanguage].map((option, index3) => (
                        <Flex key={`option-${index3}`} mt={index3 === 0?'0':'1vh'} justifyContent={'space-between'} alignItems={'center'} p='5px' borderRadius=".5em" borderColor="gray.200" borderWidth="1px" bg="brand.gray_2">
                            <Text fontSize={'.9em'}>{option}</Text>
                            <IconButton onClick={() => editData('edit', 'options', {...section.options,[selectedLanguage]: section.options[selectedLanguage].filter((option, optionIndex) => optionIndex !== index3)})} aria-label="remove-option" icon={<RxCross2  size='15px'/>} color={'red'} size="xs" border='none' bg='transparent'  />
                        </Flex>
                    ))}
                </Box> 

                <AddOptionComponent keyToEdit={'options'}/>
            
            </>}
        </motion.div>
    </Box>
    )
}
const ChangeLanguage = ({variant, selectedLanguage, setSelectedLanguage, chatBotData, setChatBotData, index}:{variant:'section' | 'styles', selectedLanguage:string, setSelectedLanguage:Dispatch<SetStateAction<string>>, chatBotData:ChatBotData | null, setChatBotData:Dispatch<SetStateAction<ChatBotData | null>>, index?:number}) => {

    const { t } = useTranslation('settings')
    const sectionsMap = {}
 
    const languagesDict = (variant === 'section' ? chatBotData?.sections[index as number].initial_message :chatBotData?.welcome_message)
    Object.keys( languagesDict || {}).map((lang) => {(sectionsMap as any)[lang] = [languagesFlags[lang][0],<Box>{languagesFlags[lang][1]}</Box>]})

    //SHOW LANGUAGES 
    const buttonRef = useRef<HTMLButtonElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)

    //BOOLEAN TO CONTROL THE VISIBILITY OF THE LIST AND CLOSE ON OUTSIDE CLICK
    const [showList, setShowList] = useState<boolean>(false)
    useOutsideClick({ref1:buttonRef, ref2:boxRef, onOutsideClick:setShowList})

    //BOX POSITION LOGIC, TO SHOW IT UP OR DOWN OF THE INPUT, DEPENDING ON THE POSITION
    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef, setBoxStyle, boxPosition:'none', changeVariable:showList})

    const excludedKeys = Object.keys(languagesDict || {});

    const editLanguage = (lang:string) => {
        if (variant === 'section') {
            setChatBotData(prev => prev ? ({...prev,
                sections: prev.sections.map((section, i) => 
                    i === index 
                        ? { ...section, initial_message: { ...section.initial_message, [lang]: ''},options: { ...section.options, [lang]: [] }}: section
                )
            }) : prev)
            
        }
        else {
            setChatBotData(prev => ({...prev as ChatBotData, welcome_message:{...prev?.welcome_message, [lang]:'' }, options:{...prev?.options, [lang]: []} }))
        }
    }
    return (<>
        <Flex gap='12px' alignItems={'end'}> 
            <SectionSelector size='xs' selectedSection={selectedLanguage} sections={Object.keys(languagesDict|| {})} sectionsMap={sectionsMap} onChange={(lang:string) => setSelectedLanguage(lang)}/>  
            <Button ref={buttonRef} variant='common' size='xs' leftIcon={<FaPlus/>} onClick={() => setShowList(true)}>{t('AddLanguage')}</Button>
        </Flex> 
        <AnimatePresence> 
          {showList && 
            <Portal> 
                <MotionBox id="custom-portal"  ref={boxRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                    style={{ transformOrigin:'top left'}} maxH={'60vh'} mt='10px' mb='10px' bg='white' boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} borderRadius={'.5rem'} zIndex={100000000} overflow={'scroll'} left={boxStyle.left  || undefined} right={boxStyle.right  || undefined} top={boxStyle.top || undefined}  bottom={boxStyle.bottom ||undefined} position='fixed' >
                    {Object.keys(languagesFlags).filter(item => !excludedKeys.includes(item)).map((lang, index) => (
                        <Flex key={`lang-${index}`} px='10px'  py='7px' cursor={'pointer'} justifyContent={'space-between'} alignItems={'center'} _hover={{bg:'brand.hover_gray'}} onClick={() => {setShowList(false); editLanguage(lang)}}>
                            <Text>{languagesFlags[lang][1]} {languagesFlags[lang][0]}</Text>
                        </Flex>
                    ))}
                </MotionBox>
            </Portal>}
        </AnimatePresence>
    </>)
}

const ShowChatBox = ({chatBotData, selectedLanguage}:{chatBotData:ChatBotData | null, selectedLanguage:string}) => {
    
    const { t } = useTranslation('settings')
    const [selectedView, setSelectedView] = useState<'initial' | 'conversations' | 'conversation' | 'messages' >('initial')

    const [testUrl, setTestUrl] = useState<string>('')
    return (
                 
        <Flex flexDir={'column'} h='100%' borderRadius={'.7rem'}  flex='1' bg='brand.gray_2' position={'relative'}  overflow={'scroll'}> 
            
            <Flex py='2vh' px='2vh' flexDir={'column'} alignItems={chatBotData?.chat_position === 'right' ?'end':'start'} flex='1'  overflow={'scroll'}> 
                <Skeleton isLoaded={(chatBotData !== null)}> 
                    <Box borderRadius={'1rem'}   fontSize={'.9em'} boxShadow={'1px 0px 10px rgba(0, 0, 0, 0.15)'} overflow={'hidden'}  width='360px' height='650px' right={chatBotData?.chat_position === 'right' ?'1vh':undefined} left={chatBotData?.chat_position === 'right' ?undefined:'1vh'}  >
                        <ChatbotComponent  customInfo={chatBotData as ChatBotData} selectedLanguage={selectedLanguage}/>
                    </Box>
                </Skeleton>
                <Skeleton isLoaded={(chatBotData !== null)}> 
                    <Flex zIndex={1000}  alignItems={'center'} height={'60px'} width={'60px'} mt='17px' justifyContent={'center'} borderRadius={'full'} bg={`linear-gradient(to right, ${chatBotData?.header_background[0]},${chatBotData?.header_background[1]})`} color={chatBotData?.header_color} position={'relative'}  boxShadow={'2px 4px 10px rgba(0, 0, 0, 0.35)'}>
                        <svg id="eueRKQmJ52v1"  width="30px" height="30px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" project-id="847d15a69af94049ac0fcf158a2d9a69" export-id="427884388972410d94762b7146bf1dbb" ><path d="M50,0.00001c27.6,0,50,22.4,50,50s-22.4,50-50,50c-.00115,0-25.68772,0-25.68887,0-2.8277,0-5.12-2.23858-5.12-5c0-.09963.00298-.19859.00887-.29678v-4.06893c.00018-.01249.00028-.025.00028-.03753s-.00009-.02504-.00028-.03753v-.0765c-.00079-.00069-.00158-.00138-.00237-.00207-.03221-.70466-.35614-1.33324-.85385-1.7678-.00002-.00042-.00004-.00084-.00006-.00126-.01181-.00971-.02362-.01942-.03542-.02914-.01264-.01063-.02539-.02113-.03824-.03152C7.10408,79.43894,0,65.57196,0,50C0,22.4,22.4,0,50,0v.00001Zm-25,40l-3.53553,6.46447L15,50.00001l6.46447,3.53553L25,60.00001l3.53553-6.46447L35,50.00001l-6.46447-3.53553L25,40.00001Zm25,0l-3.53553,6.46447L40,50.00001l6.46447,3.53553L50,60.00001l3.53553-6.46447L60,50.00001l-6.46447-3.53553L50,40.00001Zm25,0l-3.53553,6.46447L65,50.00001l6.46447,3.53553L75,60.00001l3.53553-6.46447L85,50.00001l-6.46447-3.53553L75,40.00001Z" fill="currentColor"/></svg>
                    </Flex>
                </Skeleton>
            </Flex>

        </Flex>
    )
} 

const ChatbotComponent = ({customInfo, selectedLanguage}:{customInfo:ChatBotData,selectedLanguage:string}) => {
    
    const { t } = useTranslation('settings')
    const showMessages = customInfo?.welcome_message[selectedLanguage] ? [{sender_type:'matilda', timestamp: new Date().toISOString() , text:customInfo?.welcome_message[selectedLanguage] } ]:[]

    // TEXTAREA COMPONENT
    const TextAreaContainer = () => {
        return (          
        <div style={{height:'65px', padding:'0px 4% 0px 4%',width:'100%', display:'flex', flexDirection:'column', alignItems:'center'}}  >
        
        <div style={{ width:'100%', marginTop:'-23px',  position:'relative', alignItems:'center', minHeight:'46px'}} > 
            <textarea disabled maxLength={1000}  className="text-area"  id="autoresizingTextarea" placeholder={t('WriteMessage')} rows={1}/>
            <button id="fileButton"  className="clip-btn"  >
              <svg viewBox="0 0 512 512"   width="18" height="18" style={{fill: 'currentColor'}}><path d="M364.2 83.8c-24.4-24.4-64-24.4-88.4 0l-184 184c-42.1 42.1-42.1 110.3 0 152.4s110.3 42.1 152.4 0l152-152c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-152 152c-64 64-167.6 64-231.6 0s-64-167.6 0-231.6l184-184c46.3-46.3 121.3-46.3 167.6 0s46.3 121.3 0 167.6l-176 176c-28.6 28.6-75 28.6-103.6 0s-28.6-75 0-103.6l144-144c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-144 144c-6.7 6.7-6.7 17.7 0 24.4s17.7 6.7 24.4 0l176-176c24.4-24.4 24.4-64 0-88.4z"></path></svg>
            </button> 
           <button className="send-btn"  style={{padding:'7px', alignItems:'center', width:"28px", height:"28px", justifyContent:'center', background:customInfo?.actions_color || 'black',position: 'absolute', right: '10px', bottom:'10px' }} >
                <svg preserveAspectRatio="xMidYMid"viewBox="0 0 390 480" width="14" height="14"  style={{fill: 'white'}}>
                    <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/>
                </svg>
            </button>
        </div>

          <div style={{ flex:'1', display:'flex', gap:'5px', alignItems:'center'}} onClick={() => window.open('https://www.matil.ai/contact', '_blank')}> 
            <img alt='MATIL' src={'/images/matil-simple-gradient.svg'} height="14px" width={'14px'} />
            <span className={'matil-text'}  >matil</span>
          </div>
      </div>)
    }

    const calculateBorderRadius = (isBotMessage:boolean, isPreviousMessageBot:boolean, isNextMessageBot:boolean, isLastMessage:boolean ) => {
        const firstBorder = (isBotMessage && isPreviousMessageBot) ? 2 : 7
        const secondBorder = (!isBotMessage && !isPreviousMessageBot) ? 2 : 7
        const thirdBorder = isLastMessage ? 7 : (!isBotMessage && !isNextMessageBot) ? 2 : 7
        const fourthBorder = isLastMessage ? 7 : (isBotMessage && isNextMessageBot) ? 2 : 7
        
        return `.${firstBorder}rem .${secondBorder}rem .${thirdBorder}rem .${fourthBorder}rem`
        }

 
    return(
    <div style={{zIndex:2, backgroundColor:'white',  height:'100%', width:'100%', backgroundImage:`radial-gradient(circle at 100% 110%, ${customInfo?.mesh_colors?.[0]} 0px, transparent 60%), radial-gradient(circle at 0% 130%, ${customInfo?.mesh_colors?.[1]} 0px, transparent 50%)`, }}>  
       <div style={{zIndex:1000000000000}} className={`button-hover`}>
            <svg viewBox="0 0 20 20" width="22"  height="22"  ><path d="M3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 13a1 1 0 011-1h10a1 1 0 110 2H4a1 1 0 01-1-1z"></path></svg>
        </div>

        <div style={{height:'545px',fontWeight:400,  fontSize:'1.1em', padding:'10px', overflow:'scroll'}} >
          
            <div style={{width:'100%', display:'flex', marginBottom:'20px', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                    <img alt='chatLogo' src={customInfo?.chat_avatar} width='40px'/>
                   
                  <span style={{marginTop:'5px', fontWeight:500}}>{customInfo?.bot_name || 'Tilda'}{t('AiAssistant')}</span>
                <span style={{fontSize:`1em`}}>{customInfo?.ai_message?.[selectedLanguage] || ''}</span>
              </div>

          {showMessages.map((message, index)=>{

          const isNextMessageBot = showMessages[index + 1] ? showMessages[index + 1].sender_type !== 'contact' : false
          const isPreviousMessageBot = showMessages[index - 1] ? showMessages[index - 1].sender_type !== 'contact' : false
          const isLastMessage = index === showMessages.length - 1 
          
          const calcBorderRadius  = calculateBorderRadius(message.sender_type !== 'contact',isPreviousMessageBot, isNextMessageBot, isLastMessage)
          const diaMensajeActual = new Date(message.timestamp).getDate()

          const diaMensajeAnterior = index > 0 ? new Date(showMessages[index - 1].timestamp).getDate() : 10;

          return(
          <div>  
            <div style={{ marginTop: index === 0 ? '0px' : (( ((message.sender_type === 'contact') && (showMessages[index - 1].sender_type === 'contact')) ||((message.sender_type !== 'contact') && (showMessages[index - 1].sender_type !== 'contact')))  ? '3px':'15px')}}> 
            
             
            <div  style={{gap:'10px', display:'flex', width:'100%', alignItems:'end', flexDirection:message.sender_type !== 'contact' ? 'row':'row-reverse'}}  key={`message-${index}`}  >
                <div style={{maxWidth:'82%',display:'flex',flexDirection:'column',alignItems:'end'}}> 
                    <div style={{ wordBreak: 'break-word', overflowWrap: 'break-word', background:message.sender_type !== 'contact'?`rgba(237, 242, 247, ${customInfo?.messages_opacity ?customInfo?.messages_opacity:0.5 })`:`linear-gradient(to right, ${customInfo?.client_background?customInfo.client_background[0]:'green'},${customInfo?.client_background?customInfo.client_background[1]:'green'})`, color:message.sender_type !== 'contact'?'black':customInfo?.client_color,  padding:'14px', borderRadius:calcBorderRadius}}>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                        {message.sender_type !== 'contact'  && 
                            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px'}}>
                            <img alt='chatLogo' src={customInfo?.chat_avatar} width='20px'/>
                            <span style={{fontWeight:400}}>{`${customInfo?.bot_name || 'Tilda'}${t('AiAssistant')}`}</span>
                            </div>}
                        </div>
            

                        <span style={{fontSize:'.9em'}}>{message.text}</span>
                    </div>
                </div>
            </div>
          </div>
          </div>)
          })}
        <div style={{display:'flex', marginTop:'15px', gap:'5px', flexWrap:'wrap', flexDirection:'row-reverse', paddingLeft:'10%'}}  > 
            {customInfo?.options&&
            <>
                {(customInfo?.options?.[selectedLanguage] || []).map((option:string, index:number) => (
                   <div className={'option-component'} style={{cursor:'pointer',  fontSize:'.9em', alignItems:'center', justifyContent:'center',  background:`linear-gradient(to right, ${customInfo?.client_background?customInfo.header_background[0]:'green'},${customInfo?.client_background?customInfo.header_background[1]:'green'})`, padding:'10px', borderRadius:'12px'}}  key={`option-${index}`}>
                   <span style={{ color:customInfo?.client_color, whiteSpace:'nowrap' }}>{option}</span>
                 </div>
            ))}
            </>}
        </div>

 
      </div>
      <TextAreaContainer/>
   
    </div>  
 
    )
}



 
