
//REACT
import  {useState, useEffect, useRef, useMemo, Dispatch, SetStateAction, CSSProperties } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
import { useAuth0 } from '@auth0/auth0-react'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, IconButton, Image, Icon, Button, Skeleton, chakra, shouldForwardProp, Portal, Switch, NumberInput, NumberInputField, NumberInputStepper, NumberDecrementStepper, NumberIncrementStepper, Tooltip } from "@chakra-ui/react"
import '../../../Components/styles.css'
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion'
//COMPONENTS
import EditText from '../../../Components/Reusable/EditText'
import ImageUpload from '../../../Components/Reusable/ImageUpload'
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
import ColorPicker from '../../../Components/Once/ColorPicker'
import ConfirmBox from '../../../Components/Reusable/ConfirmBox'
import SectionSelector from '../../../Components/Reusable/SectionSelector'
import SaveChanges from '../../../Components/Reusable/SaveChanges'
import Table from '../../../Components/Reusable/Table'
//FUNCTIONS
import copyToClipboard from '../../../Functions/copyTextToClipboard'
import useOutsideClick from '../../../Functions/clickOutside'
import determineBoxStyle from '../../../Functions/determineBoxStyle'
import timeAgo from '../../../Functions/timeAgo'
//ICONS
import { RxCross2 } from 'react-icons/rx'
import { IoIosArrowDown, IoMdArrowRoundForward, IoIosChatboxes, IoIosArrowBack } from 'react-icons/io'
import { FaPlus , FaCode, FaPaintbrush, FaHouse, FaRobot } from 'react-icons/fa6'
import { MdContentCopy } from 'react-icons/md'
import { IoChatbubbleEllipses } from "react-icons/io5";
import { BiTargetLock } from "react-icons/bi"
import { TbMessageFilled } from "react-icons/tb"
import { FaListUl } from "react-icons/fa"
//TYPING
import { ConfigProps, languagesFlags } from '../../../Constants/typing'
import CustomSelect from '../../../Components/Reusable/CustomSelect'
  
const CellStyle = ({column, element}:{column:string, element:any}) => {return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>}

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
function Chatbot () {

    //CONSTANTS
    const { getAccessTokenSilently } = useAuth0()
    const auth = useAuth()
    const { t, i18n } = useTranslation('settings')
    const [channelDict, setChannelDict] = useState<any>(null)

    //REF FOR ALL THE COLOR PICKER CONTAINERS
    const containerRef = useRef<HTMLDivElement>(null)
    const matildaScrollRef = useRef<HTMLDivElement>(null)

    const defaultChatbotConfig:ChatBotData = {
        welcome_message:{},
        chat_position:'right',
        mesh_colors: ['#3399ff', '#0066cc'],
        actions_color:'#0066cc',
        messages_opacity:0.5,
        ai_message:{},
        bot_name:'Tilda',
        header_background: ['#3399ff', '#0066cc'],
        header_color: '#FFFFFF',
        chat_avatar: '',
        client_background: ['#3399ff', '#0066cc'],
        client_color: '#FFFFFF',
        options: {},
        sections: []
    }
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
    

    //CHANNELS LIST
    const [channelId, setChannelId] = useState<string | null>(null)
    const [channelsList, setChannelsList] = useState<any>([])
    

    //BOOLEAN FOR CREATING A NEW WEBCHAT
    const [waitingCreate, setWaitingCreate] = useState<boolean>(false)

    //CURRENT EXPANDED SECTION
    const [currentSection, setCurrentSection] = useState<'styles' | 'sections'>('styles')

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

    //UPDATE AN IMAGE
    const handleImageUpdate = (key: keyof ChatBotData, file: File | undefined) => {
        setAvatarFile(file)
        setChatBotData((prevData) => ({
          ...prevData as ChatBotData,
          [key]: file ? URL.createObjectURL(file) : ''
        }))
      }

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
            const response = await fetchData({getAccessTokenSilently, endpoint:`${auth.authData.organizationId}/admin/settings/channels`, auth})

                if (response?.status === 200){
  
                    const channels = response.data.filter((cha: any) => cha.channel_type === 'webchat').map((cha: any) => cha);
                    setChannelsList(channels)
                    if (channels.length === 1) {
                        let chatChannel:any 
                        channels.map((cha:any) => {if (cha.channel_type === 'webchat')  chatChannel = cha})
                        setChannelDict(chatChannel)
                    }
                    else setSelectedConfigId('-1')
                    
            }
        }
        fetchInitialData()
    }, [])

    useEffect(() => {
        const fetchChatData = async() => {
            if (channelDict !== null) {
                const responseChat = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels/${channelDict.id}`, getAccessTokenSilently, auth, })
                if (responseChat?.status === 200) { 

                    let chatChannel:any
                    channelsList.map((cha:any) => {if (cha.id === channelDict.id) chatChannel = cha})
                    setChannelDict(chatChannel)

                    chatbotDataRef.current = JSON.parse(JSON.stringify(responseChat.data.configuration))
                    setChatBotData({...responseChat.data.configuration})
                    configIdRef.current = responseChat.data.matilda_configuration_uuid
                    setSelectedConfigId(responseChat.data.matilda_configuration_uuid)

                }
            }
        }
        fetchChatData()
    }, [channelDict])

     // SEND THE CHATBOT CONFIGURATION
    const sendChatBotCofig = async() => {
        let chatAvatar = chatbotDataRef.current?.chat_avatar 
        if (avatarFile) chatAvatar = await getPreSignedUrl(avatarFile)
        const opacity = typeof(chatBotData?.messages_opacity) === 'number' ? chatBotData?.messages_opacity:parseFloat(chatBotData?.messages_opacity || '0.5')
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels/${channelDict.id}`, getAccessTokenSilently, auth, method:'put', requestForm:{...channelDict, configuration:{...chatBotData, chat_avatar:chatAvatar, messages_opacity:opacity}, matilda_configuration_uuid:selectedConfigId}, toastMessages:{'works':t('CorrectUpdatedInfo'), 'failed':t('FailedUpdatedInfo')}})
        if (response?.status === 200) {
            configIdRef.current = selectedConfigId
            chatbotDataRef.current = JSON.parse(JSON.stringify(chatBotData))
        }
    }

    //SHIOW CODE BOX
    const memoizedShowCodeBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowCode}> 
            <Box p='20px'>
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('InsertCode')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Text  mb='2vh' fontSize={'.9em'} color='gray.600'>{t('InsertCodeDes')}</Text>
                <Flex p='15px' gap='20px'  borderColor={'gray.300'}borderWidth={'1px'} borderRadius={'.5rem'} bg='brand.gray_2'>
                    <Text flex='1' color='gray.600' fontSize={'.7em'}>{`<script defer src="https://chat-widget-matlil.s3.eu-west-3.amazonaws.com/insert.js?organization_id=${auth.authData.organizationId}&chatbot_id=${channelDict?.id}" id="matil-chat-widget"></script>`}</Text>
                </Flex>
                <Button onClick={() => {setShowCode(false);copyToClipboard(`<script defer src="https://chat-widget-matlil.s3.eu-west-3.amazonaws.com/insert.js?organization_id=${auth.authData.organizationId}&chatbot_id=${channelDict?.id}" id="matil-chat-widget"></script>`, t('CorrectCopiedCode'))}} leftIcon={<MdContentCopy/>} size='sm' variant={'common'} mt='2vh'>{t('CopyCode')}</Button>
            </Box>  
        </ConfirmBox>
    ), [showCode])

 
    const createChatbot = async() => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels/webchat`, setWaiting:setWaitingCreate,getAccessTokenSilently, auth, method:'post', requestForm:{name:t('NewChat'),  configuration:defaultChatbotConfig}, toastMessages:{'works':t('CorrectUpdatedInfo'), 'failed':t('FailedUpdatedInfo')}})
        if (response?.status === 200) {
            setSelectedConfigId(response.data)
            configIdRef.current = response.data
            chatbotDataRef.current = JSON.parse(JSON.stringify(defaultChatbotConfig))
            setChatBotData({
                welcome_message:{},
                chat_position:'right',
                mesh_colors: ['#3399ff', '#0066cc'],
                actions_color:'#0066cc',
                messages_opacity:0.5,
                ai_message:{},
                bot_name:'Tilda',
                header_background: ['#3399ff', '#0066cc'],
                header_color: '#FFFFFF',
                chat_avatar: '',
                client_background: ['#3399ff', '#0066cc'],
                client_color: '#FFFFFF',
                options: {},
                sections: []
            })
        }

    }


    return(<>

        {showCode && memoizedShowCodeBox}
         
        
        {channelDict === null ? 

            <>
            {channelsList.length === 0 ?
            <Flex height={'100%'} top={0} left={0} width={'100%'} position={'absolute'} alignItems={'center'} justifyContent={'center'}> 
                <Box maxW={'580px'} textAlign={'center'}> 
                <Text fontWeight={'medium'} fontSize={'2em'} mb='2vh'>{t('CreateChatbot')}</Text>               
                <Text fontSize={'1em'} color={'gray.600'} mb='2vh'>{t('CreateChatbotDes')}</Text>               
                <Button  onClick={createChatbot} size='lg' leftIcon={<FaRobot/>} bg={'linear-gradient(to right, #3399ff,#0066cc)'} _hover={{bg:'linear-gradient(to right, #3399ff,#0066cc)', opacity:1}} opacity={0.8} color='#fff'>
                    {waitingCreate ? <LoadingIconButton/>: t('CreateChatbotButton')}
                    </Button>
                </Box>
            </Flex>
            :<>
            <Box> 
            <Flex justifyContent={'space-between'} alignItems={'end'}> 
                <Text mb='2vh' fontSize={'1.4em'} fontWeight={'medium'}>{t('Web')}</Text>
              
                <Flex gap='12px'>
                    <Button leftIcon={<FaPlus/>} onClick={createChatbot} size='sm' variant={'main'}>{t('CreateChatbotButton')}</Button>  
                </Flex>
            </Flex>
            <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh'  />
            </Box>
            <Flex flex='1' pt='4vh' overflow={'hidden'}  ref={containerRef}   gap='80px'position='relative'> 
                <Table data={channelsList} CellStyle={CellStyle} excludedKeys={['uuid',' id', 'channel_type']} onClickRow={(row) => setChannelDict(row)} columnsMap={{'name':[t('Name'), 300], 'display_id':[t('Account'), 300], is_active:[t('Active'), 100]}} noDataMessage='' />
            </Flex>
            </>
            }
            </>
            :<>
                <SaveChanges data={chatBotData} setData={setChatBotData} dataRef={chatbotDataRef} data2={selectedConfigId} dataRef2={configIdRef} setData2={setSelectedConfigId} onSaveFunc={sendChatBotCofig}  />
                <Box> 
                    <Flex justifyContent={'space-between'} alignItems={'end'}> 
                        <Skeleton  isLoaded={(chatBotData !== null)}> 
                            <Flex  mb='2vh'  alignItems={'center'} gap='10px'> 
                                <Tooltip label={t('GoBackChannels')}  placement='bottom' hasArrow bg='black'  color='white'  borderRadius='.4rem' fontSize='.75em' p='4px'> 
                                    <IconButton aria-label='go-back' size='sm' bg='transparent' border='none' onClick={() => setChannelDict(null)} icon={<IoIosArrowBack size='20px'/>}/>
                                </Tooltip>
                                <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('Web')}</Text>
                            </Flex>
                            <SectionSelector selectedSection={currentSection} sections={['styles','sections']} sectionsMap={{'styles':[t('styles'), <FaPaintbrush/>],'sections':[t('sections'), <FaListUl/>]}} onChange={() => setCurrentSection(prev => (prev === 'sections'?'styles':'sections'))}/>
                        </Skeleton>
                        <Flex gap='12px'>
                            <Button leftIcon={<IoChatbubbleEllipses/>}  onClick={() => window.open(`https://main.d1pm9d6glnzyf9.amplifyapp.com?organization_id=${auth.authData.organizationId}&webchat_uuid=${channelDict?.id}`, '_blank')} size='sm' variant={'main'}>{t('TryWeb')}</Button>  
                            <Button leftIcon={<FaCode/>} onClick={() => setShowCode(true)} size='sm' variant={'main'}>{t('ShowCode')}</Button>  
                        </Flex>
                    </Flex>
                    <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh'  />
                </Box>
                <Flex flex='1' pt='4vh' overflow={'hidden'}  ref={containerRef}   gap='80px'position='relative'> 
                    <Flex flex='1' height={'100%'} overflow={'scroll'}> 
                        <Skeleton style={{flex:1}} isLoaded={chatBotData !== null}> 
                            {currentSection === 'styles' ? <> 
              
                            <Text fontWeight={'medium'} mt='2vh'>{t('ChatPosition')}</Text>
                            <Text fontSize={'.8em'} color='gray.600'>{t('ChatPositionDes')}</Text>
                            <Flex gap='30px' mt='1vh'>
                                <Flex   bg={chatBotData?.chat_position === 'left' ? 'blue.50':'gray.50'}cursor={'pointer'} alignItems={'end'} borderColor={'gray.200'} borderWidth={'1px'} borderRadius={'.7em'} p='10px' height={'150px'} flex='1' onClick={(e) => setChatBotData({...chatBotData as ChatBotData, 'chat_position':'left'})} >
                                    <Flex flexDir={'column'} >
                                        <Box height={'80px'} borderRadius={'.5em'} width={'50px'}  bg='gray.200' alignItems={'end'}  borderColor={'gray.300'} borderWidth={'1px'} />
                                        <Box mt='5px' height={'20px'} borderRadius={'50%'} width={'20px'}  bg='gray.200' alignItems={'end'}  borderColor={'gray.300'} borderWidth={'1px'} />
                                    </Flex>
                                </Flex>
                                <Flex bg={chatBotData?.chat_position === 'right' ? 'blue.50':'gray.50'} cursor={'pointer'} alignItems={'end'} justifyContent={'end'}  borderColor={'gray.200'} borderWidth={'1px'} borderRadius={'.7em'} p='10px' height={'150px'} flex='1' onClick={(e) => setChatBotData({...chatBotData as ChatBotData, 'chat_position':'right'})} >
                                    <Flex alignItems={'end'} flexDir={'column'}>
                                        <Flex alignItems={'end'} flexDir={'column'} >
                                            <Box height={'80px'} borderRadius={'.5em'} width={'50px'}  bg='gray.200' alignItems={'end'}  borderColor={'gray.300'} borderWidth={'1px'} />
                                            <Box mt='5px' height={'20px'} borderRadius={'50%'} width={'20px'}  bg='gray.200' alignItems={'end'}  borderColor={'gray.300'} borderWidth={'1px'} />
                                        </Flex>
                                    </Flex>                     
                                </Flex>
                            </Flex>
 
                            <Text fontWeight={'medium'} mt='2vh'>{t('BackgroundColor')}</Text>
                            <Text fontSize={'.8em'} color='gray.600'>{t('BackgroundColor')}</Text>
                            <Flex mt='1vh' alignItems={'center'} gap='10px'> 
                                <Box flex='1' > 
                                    <ColorPicker containerRef={containerRef} color={chatBotData?.header_background[0]} 
                                    setColor={(value) => {
                                        setChatBotData({ ...chatBotData as ChatBotData, header_background: [ value, chatBotData?.header_background[1] || '']  })
                                    }}/>
                                </Box>
                                <Icon boxSize={'25px'} color='gray.400'  as={IoMdArrowRoundForward}/>
                                <Box flex='1' > 
                                    <ColorPicker containerRef={containerRef} color={chatBotData?.header_background[1]} 
                                    setColor={(value) => {
                                        setChatBotData({ ...chatBotData as ChatBotData, header_background: [ chatBotData?.header_background[0] || '', value]  })
                                    }}/>
                                </Box>
                            </Flex>

                            <Text fontWeight={'medium'} mt='2vh'>{t('TextColor')}</Text>
                            <Text fontSize={'.8em'} color='gray.600'>{t('TextColorDes')}</Text>
                            <Box width='300px' mt='1vh'> 
                                <ColorPicker containerRef={containerRef} color={chatBotData?.header_color} setColor={(value) => setChatBotData({...chatBotData as ChatBotData, header_color:value})}/>
                            </Box>

                            <Text fontWeight={'medium'} mt='2vh'>{t('ActionsColorChat')}</Text>
                            <Text fontSize={'.8em'} color='gray.600'>{t('ActionsColorChatDes')}</Text>
                            <Box width='300px' mt='1vh'> 
                                <ColorPicker containerRef={containerRef} color={chatBotData?.actions_color} setColor={(value) => setChatBotData({...chatBotData as ChatBotData, actions_color:value})}/>
                            </Box>

                            <Text fontWeight={'medium'}  mt='2vh'>{t('BotName')}</Text>
                            <Text fontSize={'.8em'} color='gray.600'>{t('BotNameDes')}</Text>
                            <Box width='100%' mt='1vh'> 
                                <EditText hideInput={false} value={chatBotData?.bot_name || ''} setValue={(value) => setChatBotData(prev => ({...prev as ChatBotData, bot_name:value}))}/>
                            </Box>

                            <Text fontWeight={'medium'} mt='2vh'>{t('Avatar')}</Text>
                            <Text fontSize={'.8em'} color='gray.600'>{t('AvatarDes')}</Text>
                            <Box width='300px' mt='1vh'> 
                                <ImageUpload id={1} initialImage={chatBotData?.chat_avatar} onImageUpdate={(file) => handleImageUpdate('chat_avatar', file as File)}/>
                            </Box>

                            <Text fontWeight={'medium'} mt='2vh'>{t('MessageOpacity')}</Text>
                            <Text fontSize={'.8em'} color='gray.600'>{t('MessageOpacityDes')}</Text>
                            <Box width='200px' mt='1vh'> 
                                <NumberInput size='sm' step={0.1}  mt='.5vh' value={chatBotData?.messages_opacity} onChange={(val) =>  setChatBotData(prev => ({...prev as ChatBotData, messages_opacity:val} )) } min={0.3} max={1}>
                                    <NumberInputField  fontSize={'.9em'} borderRadius='.5rem'   borderColor={'gray.300'} _hover={{ border: '1px solid #CBD5E0' }} _focus={{ borderColor: 'brand.text_blue', borderWidth: '2px', px:'6px' }} px='7px' />
                                        <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </Box>

                            <Text fontWeight={'medium'} mt='2vh'>{t('BackgroundColorMessages')}</Text>
                            <Text fontSize={'.8em'} color='gray.600'>{t('BackgroundColorMessagesDes')}</Text>
                            <Flex mt='1vh' alignItems={'center'} gap='10px'> 
                                <Box flex='1' > 
                                    <ColorPicker containerRef={containerRef} color={chatBotData?.client_background[0]} 
                                    setColor={(value) => {
                                        setChatBotData({ ...chatBotData as ChatBotData, client_background: [value, chatBotData?.client_background[1] || '']})
                                    }}/>
                                </Box>
                                <Icon boxSize={'25px'} color='gray.400'  as={IoMdArrowRoundForward}/>
                                <Box flex='1' > 
                                    <ColorPicker containerRef={containerRef} color={chatBotData?.client_background[1]} 
                                    setColor={(value) => {
                                        setChatBotData({ ...chatBotData as ChatBotData, client_background: [ chatBotData?.client_background[0] || '', value]  })
                                    }}/>
                                </Box>
                            </Flex>

                            <Text fontWeight={'medium'} mt='2vh'>{t('TextColorMessages')}</Text>
                            <Text fontSize={'.8em'} color='gray.600'>{t('TextColorMessagesDes')}</Text>
                            <Box width='300px' mt='1vh'> 
                                <ColorPicker containerRef={containerRef} color={chatBotData?.client_color} setColor={(value) => setChatBotData({...chatBotData as ChatBotData, client_color:value})}/>
                            </Box>


                            <Text fontWeight={'medium'} mt='2vh'>{t('MeshColors')}</Text>
                            <Text fontSize={'.8em'} color='gray.600'>{t('MeshColorsDes')}</Text>
                            <Flex mt='1vh' alignItems={'center'} gap='10px'> 
                                <Box flex='1' > 
                                    <ColorPicker containerRef={containerRef} color={chatBotData?.mesh_colors[0]} 
                                    setColor={(value) => {
                                        setChatBotData({ ...chatBotData as ChatBotData, mesh_colors: [value, chatBotData?.mesh_colors[1] || '']})
                                    }}/>
                                </Box>
                                <Icon boxSize={'25px'} color='gray.400'  as={IoMdArrowRoundForward}/>
                                <Box flex='1' > 
                                    <ColorPicker containerRef={containerRef} color={chatBotData?.mesh_colors[1]} 
                                    setColor={(value) => {
                                        setChatBotData({ ...chatBotData as ChatBotData, mesh_colors: [ chatBotData?.mesh_colors[0] || '', value]  })
                                    }}/>
                                </Box>
                            </Flex>


                            <Text fontWeight={'medium'}  mt='2vh'>{t('MessagesOptions')}</Text>
                            <Box mt='1vh'> 
                                <ChangeLanguage variant={'styles'} selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} chatBotData={chatBotData} setChatBotData={setChatBotData} />
                            </Box>
                            
                            <Text fontWeight={'medium'}  mt='2vh'>{t('TildaMessage')}</Text>
                            <Text fontSize={'.8em'} color='gray.600'>{t('TildaMessageDes')}</Text>
                            <Box width='100%' mt='1vh'> 
                                <EditText hideInput={false} value={chatBotData?.ai_message?.[selectedLanguage] || ''} setValue={(value) => setChatBotData(prev => ({...prev as ChatBotData, ai_message:{...(prev as ChatBotData).ai_message, [selectedLanguage]:value}}))}/>
                            </Box>

                            <Text fontWeight={'medium'}  mt='2vh'>{t('WelcomeMessage')}</Text>
                            <Text fontSize={'.8em'} color='gray.600'>{t('WelcomeMessageDes')}</Text>
                            <Box width='100%' mt='1vh'> 
                                <EditText hideInput={false} value={chatBotData?.welcome_message[selectedLanguage] || ''} setValue={(value) => setChatBotData(prev => ({...prev as ChatBotData, welcome_message:{...(prev as ChatBotData).welcome_message, [selectedLanguage]:value}}))}/>
                            </Box>

                            <Text fontWeight={'medium'} mt='2vh'>{t('Shortcuts')}</Text>
                            <Text fontSize={'.8em'} color='gray.600'>{t('ShortcutWebsDes')}</Text>
                            <Box width={'100%'} mt='2vh'> 
                                {(chatBotData?.options[selectedLanguage] || []).map((option, urlIndex) => (
                                    <Flex key={`option-${urlIndex}`} mt={urlIndex === 0?'0':'1vh'} justifyContent={'space-between'} alignItems={'center'} p='5px' borderRadius=".5em" borderColor="gray.200" borderWidth="1px" bg="brand.gray_2">
                                        <Text fontSize={'.9em'}>{option}</Text>
                                        <IconButton onClick={() => removeOption(urlIndex)} aria-label="remove-option" icon={<RxCross2  size='15px'/>} color={'red'} size="xs" border='none' bg='transparent'  />
                                    </Flex>
                                ))}
                            </Box> 
                            <AddOptionComponent/>
                            <Box flex='1' pt='4vh' ref={matildaScrollRef}  overflow={'scroll'}> 
                                <Skeleton isLoaded={configData !== null}> 
                                <Text  fontWeight={'medium'}>{t('SelectedConfig')}</Text>
                                {configData?.map((config, index) => (
                                    <Box transition={'box-shadow 0.3s ease-in-out'} _hover={{shadow:'md'}}  mt='2vh' key={`config-${index}`} bg={selectedConfigId === config.uuid?'rgba(59, 90, 246, 0.25)':'gray.50'} onClick={() => setSelectedConfigId(config.uuid)} borderColor={'gray.200'} borderWidth={'1px'} borderRadius={'.5rem'} p='15px' cursor={'pointer'}>
                                        <Text fontSize={'.9em'} fontWeight={'medium'}>{config.name}</Text>
                                        <Text fontSize={'.8em'} color='gray.600'>{config.description}</Text>
                                    </Box> 
                                ))}
                                </Skeleton>
                            </Box>

                            <Box height={'5vh'}/>
                            </>
                            :
                            <>
                                {chatBotData?.sections.map((section, index) => (
                                    <EditSection key={`section-${index}`} chatBotData={chatBotData} setChatBotData={setChatBotData} index={index} expandedIndex={expandedIndex} setExpandedIndex={setExpandedIndex}/>
                                ))}
                                <Button size='sm' mt='4vh' leftIcon={<FaPlus/>} variant={'common'} onClick={() => setChatBotData(prev => ({...prev as ChatBotData, sections:[...(chatBotData as ChatBotData).sections, newSection]}))}>{t('AddSection')}</Button>
                            </>
                            }
                        </Skeleton>
                    </Flex>
                    <ShowChatBox chatBotData={chatBotData} selectedLanguage={selectedLanguage}/>
                </Flex>     
                </>   
        } 
    </>)
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
                 
        <Flex flexDir={'column'} borderRadius={'.7rem'} flex='1' bg='brand.gray_2' position={'relative'}  overflow={'scroll'}> 
            <Flex borderBottomWidth={'1px'} justifyContent={'space-between'} borderBottomColor={'gray.300'} p='1vw' alignItems={'center'} gap='32px'> 
                <Box w={'200px'}> 
                    <CustomSelect variant='title' hide={false} options={['initial',  'conversation']} selectedItem={selectedView} setSelectedItem={(value) => setSelectedView(value)} iconsMap={{'initial':[t('initial'),FaHouse], 'conversations':[t('conversations'),FaListUl], 'conversation':[t('conversation'),IoIosChatboxes], 'messages':[t('messages'),TbMessageFilled]}}/>
                </Box>
                <Box w={'200px'}> 
                    <EditText value={testUrl} setValue={setTestUrl} />
                </Box>
                
             </Flex>
            <Flex py='2vh' px='2vh' flexDir={'column'} alignItems={chatBotData?.chat_position === 'right' ?'end':'start'} flex='1'  overflow={'scroll'}> 
                <Skeleton isLoaded={(chatBotData !== null)}> 
                    <Box borderRadius={'1rem'}  fontSize={'.9em'} boxShadow={'1px 0px 10px rgba(0, 0, 0, 0.15)'} overflow={'hidden'}  bg='white' width='360px' height='650px' right={chatBotData?.chat_position === 'right' ?'1vh':undefined} left={chatBotData?.chat_position === 'right' ?undefined:'1vh'}  >
                        <Main selectedView={selectedView} chatBotData={chatBotData as ChatBotData} selectedLanguage={selectedLanguage}/>
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


const Main = ({selectedView, chatBotData, selectedLanguage}:{selectedView:'initial' | 'conversations' | 'conversation' | 'messages', chatBotData:ChatBotData | null, selectedLanguage:string}) => {

    //PUBLIC URL
    const t_formats = useTranslation('formats').t

    const i18n = useTranslation('formats').i18n

    const chatDict = {
        'ES': ['Nueva conversación', 'No hay conversaciones guardadas', 'Conversaciones'],
        'EN': ['New conversation', 'No saved conversations', 'Conversations'],
        'FR': ['Nouvelle conversation', 'Aucune conversation enregistrée', 'Conversations']
    }
    const clientLanguage: string = i18n.language.toLocaleUpperCase()
    const language = (chatDict as any)[clientLanguage] ? clientLanguage : 'EN'      
   
    const conversationId = selectedView === 'conversation'

    const sortedConversations = [{conversation_id:'', created_at:'', theme:`${t_formats('Conversation')} 1`, pending:false},{conversation_id:'', created_at:'', theme:`${t_formats('Conversation')} 2`, pending:false},{conversation_id:'', created_at:'', theme:`${t_formats('Conversation')} 3`, pending:false},{conversation_id:'', created_at:'', theme:`${t_formats('Conversation')} 4`, pending:false},{conversation_id:'', created_at:'', theme:`${t_formats('Conversation')} 5`, pending:false}]
    //MODIFIED CONVERSATIONS
    return(
    
    <div style={{ display:'flex', height:'100%',  position:'relative',flexDirection:'column'}} >  

        <div style={{height:'10%', background:`linear-gradient(to right, ${chatBotData?.header_background[0]},${chatBotData?.header_background[1]})`, display:'flex', alignItems:'center', padding:'0 4%', justifyContent:'space-between', zIndex:10}} > 
            <div style={{display:'flex', gap:'3%', flex:'1', alignItems:'center', justifyContent:conversationId?'flex-start':'center'}}>
            
                {conversationId ? 
                <div className={'fade-in'} style={{ display:'flex',  alignItems:'center', flexDirection:'row', gap:'5px'}} > 
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', padding:'10px', background:'transparent', cursor:'pointer'}}>
                        <svg viewBox="0 0 512 512" width="20"  height="20"  style={{fill: chatBotData?.header_color, cursor:'pointer'}}><path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"></path></svg>
                    </div>
                    <div style={{display:'flex', alignItems:'center', flexDirection:'row', gap:'15px'}}>    
                        <img src={chatBotData?.chat_avatar} height="25px" width="25px" />
                        <span style={{color:chatBotData?.header_color, fontWeight:500,  whiteSpace: 'nowrap',textOverflow: 'ellipsis', fontSize:'1.4em' }} >{''}</span>
                    </div>
                </div>
                :
                <span className={'fade-in'} style={{color:chatBotData?.header_color, fontWeight:500,  fontSize: '1.2em', whiteSpace: 'nowrap',textOverflow: 'ellipsis'}} >{(chatDict as any)[language][2]}</span>
                }
            </div>         
        </div>

   

      
        {conversationId && <div > 
            <ChatbotComponent customInfo={chatBotData as ChatBotData} selectedLanguage={selectedLanguage}/>
        </div>}
         

        {!conversationId && <div className={`conversation-container ${conversationId ? 'slide-out' : 'slide-in'}`}>
            {sortedConversations.length === 0 ?   
            <span style={{marginTop:'5%', color:'#4A5568', marginLeft:'20px', fontWeight:'medium', fontSize:'1.2em'}}>{(chatDict as any)[language][1]}</span>
            :<> {sortedConversations.map((con, index) => (
                <>
                    <div  key={`conversation-${index}`} className='conversation' >
                        <div style={{display:'flex',flexDirection:'column',  flex: '1', minWidth: 0}}>
                            <div  style={{display:'flex',flexDirection:'row', gap:'20px', alignItems:'center',  flex: '1', minWidth: 0}}>
                                <span style={{whiteSpace: 'nowrap',overflow: 'hidden',textOverflow: 'ellipsis', fontSize:'1.1em'}} >{con.theme?con.theme:'Sin tema'}</span>
                                {con.pending &&<svg width="7" height="7" viewBox="0 0 15 15"  style={{ flexShrink: 0 }}><circle cx="7" cy="7" r="7" fill="red" /></svg>}
                            </div>
                            <span style={{ color:'#666', fontSize:'.9em'}}>{timeAgo(con.created_at, t_formats)}</span>
                        </div>
                        <svg viewBox="0 0 512 512" width="12"  style={{fill: 'black'}} height="12"><path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"></path></svg>
                    </div>
                    <div className='conversation-divider'/>
                </>
            ))}</>
            }
        </div>}

        {!conversationId && <button className={`bottom-button ${conversationId ? 'slide-out' : 'slide-in'}`} style={{color: chatBotData?.header_color,background:`linear-gradient(to right, ${chatBotData?.header_background[0]},${chatBotData?.header_background[1]})`}}>
            {(chatDict as any)[language][0]}
            <svg viewBox="0 0 512 512" width="12"  style={{fill: chatBotData?.header_color}} height="12"><path d="M476.59 227.05l-.16-.07L49.35 49.84A23.56 23.56 0 0027.14 52 24.65 24.65 0 0016 72.59v113.29a24 24 0 0019.52 23.57l232.93 43.07a4 4 0 010 7.86L35.53 303.45A24 24 0 0016 327v113.31A23.57 23.57 0 0026.59 460a23.94 23.94 0 0013.22 4 24.55 24.55 0 009.52-1.93L476.4 285.94l.19-.09a32 32 0 000-58.8z"></path></svg>
        </button>}
 
    
    </div>
 
    
    )
}


const ChatbotComponent = ({customInfo, selectedLanguage}:{customInfo:ChatBotData,selectedLanguage:string}) => {
    
    const { t } = useTranslation('settings')
    const t_formats = useTranslation('formats').t
    const i18n = useTranslation('formats').i18n
    const showMessages = customInfo?.welcome_message[selectedLanguage] ? [{sender_type:'matilda', timestamp: new Date().toISOString() , text:customInfo?.welcome_message[selectedLanguage] } ]:[]

    // TEXTAREA COMPONENT
    const TextAreaContainer = () => {
        return (          
        <div style={{height:'52px', padding:'10px 20px 10px 20px', gap:'10px', display:'flex', alignItems:'center', justifyContent:'start'}}  >
            <div style={{display:'flex', position:'relative',flexGrow:'1', alignItems:'center', minHeight:'40px'}} > 
            <button id="fileButton" className="clip-btn"  onClick={() => {const input = document.getElementById('selectFile'); if (input) input.click()}}
            onMouseOver={() => {const btn = document.getElementById('fileButton');if (btn) btn.style.background = '#EDF2F7'}}
            onMouseOut={() => {const btn = document.getElementById('fileButton');if (btn) btn.style.background = 'white'}}>
                <svg viewBox="0 0 24 24"   width="16" height="16" style={{fill: 'black'}}><path d="M19.187 3.588a2.75 2.75 0 0 0-3.889 0L5.575 13.31a4.5 4.5 0 0 0 6.364 6.364l8.662-8.662a.75.75 0 0 1 1.061 1.06L13 20.735a6 6 0 0 1-8.485-8.485l9.723-9.723a4.247 4.247 0 0 1 4.124-1.139 4.247 4.247 0 0 1 3.025 3.025 4.247 4.247 0 0 1-1.139 4.124l-9.193 9.193a2.64 2.64 0 0 1-1.858.779 2.626 2.626 0 0 1-1.854-.779c-.196-.196-.338-.47-.43-.726a2.822 2.822 0 0 1-.168-.946c0-.7.284-1.373.775-1.864l8.132-8.131a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734l-8.131 8.132a1.148 1.148 0 0 0-.336.803c.003.204.053.405.146.587.01.018.018.028.02.032.22.215.501.332.786.332.29 0 .58-.121.798-.34l9.192-9.192a2.75 2.75 0 0 0 0-3.89Z"></path></svg>
            </button> 
                <textarea disabled placeholder={t('WriteMessage')} className="text-area"  id="autoresizingTextarea"   rows={1} />
                <button className="send-btn"  style={{padding:'4px', alignItems:'center', justifyContent:'center', position: 'absolute', right: '6px', top:'10px' }} disabled  >
                    <svg viewBox="0 0 350 480" width="13" height="13" style={{fill: 'white'}}>
                        <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/>
                    </svg>
                </button>
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

    const parseTimestampAsUTC = (timestamp:string) => {
        const isoFormattedTimestamp = timestamp.replace(' ', 'T') + (timestamp.endsWith('Z')?'':'Z')
        return isoFormattedTimestamp
        }
    const formatearHora = (timestamp: string, locale:string = 'en') => {
        const fecha = new Date(parseTimestampAsUTC(timestamp));
        return fecha.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }
    const formatearFecha = (timestamp: string, locale: string = 'en') => {
        const fecha = new Date(parseTimestampAsUTC(timestamp));
        return fecha.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
      }
          
    return(<>     
        <div  style={{height:'490px',fontWeight:400,  fontSize:'1.1em', padding:'33px 4%', overflow:'scroll'}} >
          
          {showMessages.map((message, index)=>{

          const isNextMessageBot = showMessages[index + 1] ? showMessages[index + 1].sender_type !== 'contact' : false
          const isPreviousMessageBot = showMessages[index - 1] ? showMessages[index - 1].sender_type !== 'contact' : false
          const isLastMessage = index === showMessages.length - 1 
          
          const calcBorderRadius  = calculateBorderRadius(message.sender_type !== 'contact',isPreviousMessageBot, isNextMessageBot, isLastMessage)
          const diaMensajeActual = new Date(message.timestamp).getDate()

          const diaMensajeAnterior = index > 0 ? new Date(showMessages[index - 1].timestamp).getDate() : 10;
          const mostrarBarraNuevoDia = diaMensajeAnterior !== null && diaMensajeActual !== diaMensajeAnterior;

          return(
          <div>  
            { mostrarBarraNuevoDia && <div style={{marginTop:index > 0?'15px':'0px',fontSize:'.8em', color:'#718096', textAlign: 'center' }}>{formatearFecha(message.timestamp,  i18n.language)}</div>}
            <div style={{ marginTop: index === 0 ? '0px' : (( ((message.sender_type === 'contact') && (showMessages[index - 1].sender_type === 'contact')) ||((message.sender_type !== 'contact') && (showMessages[index - 1].sender_type !== 'contact')))  ? '3px':'15px')}}> 
            
            {(!isPreviousMessageBot && message.sender_type !== 'contact') && <span style={{fontSize:'.75em',color:'#718096', marginLeft:'35px'}}>{''}</span>}
            
            <div style={{gap:'10px', display:'flex', width:'100%', alignItems:'end', flexDirection:message.sender_type !== 'contact' ? 'row':'row-reverse'}}  key={`message-${index}`}  >
                {(message.sender_type !== 'contact' && !isNextMessageBot)&& 
                
                <div style={{marginBottom:'18px'}}><img alt='chatLogo' width={'20px'} height={'20px'} src={customInfo?.chat_avatar}/></div>}
                <div style={{maxWidth:'82%',display:'flex',flexDirection:'column',alignItems:'end', animation:index > 1 ?message.sender_type !== 'contact'? 'expandFromLeft 0.5s ease-out' : 'expandFromRight 0.5s ease-out':'none'}}> 
                  <div style={{ marginLeft:(message.sender_type !== 'contact' && !isNextMessageBot)?'0':'30px', wordBreak: 'break-word', fontSize:'.9em', overflowWrap: 'break-word', background:message.sender_type !== 'contact'?'#EDF2F7':`linear-gradient(to right, ${customInfo?.client_background?customInfo.client_background[0]:'green'},${customInfo?.client_background?customInfo.client_background[1]:'green'})`, color:message.sender_type !== 'contact'?'black':customInfo?.client_color,  padding:'8px', borderRadius:calcBorderRadius}}>
                    <span style={{ wordBreak: 'break-word'}}>
                        {message.text}
                    </span>
                  </div>
                  {(( (message.sender_type != 'contact' && !isNextMessageBot) || (message.sender_type === 'contact' && isNextMessageBot) )) && <span style={{color:'#718096', marginTop:'5px',fontSize:'.7em',fontWeight:300}}>{formatearHora(message.timestamp, i18n.language)}</span>}
                </div>
            </div>

          </div>
          </div>)
          })}
        <div style={{display:'flex', marginTop:'15px', gap:'5px', flexWrap:'wrap', flexDirection:'row-reverse', paddingLeft:'10%'}}  > 
            {customInfo?.options&&
            <>
                {(customInfo?.options?.[selectedLanguage] || []).map((option:string, index:number) => (
                <div style={{cursor:'pointer', fontSize:'.9em', alignItems:'center', justifyContent:'center', background:`linear-gradient(to right, ${customInfo?.header_background?customInfo.header_background[0]:'green'},${customInfo?.header_background?customInfo.header_background[1]:'green'})`, padding:'8px', borderRadius:'2rem' }}  key={`option-${index}`}  >
                    <span style={{color:customInfo?.client_color, whiteSpace:'nowrap'}}>{option}</span>
                </div>
            ))}
            </>}
        </div>

        
        <div className='gradient' style={{color:'#718096',gap:'5px', justifyContent:'center', display:'flex', alignItems:'center'}}  >
            <div style={{ display:'inline-flex', height:'15px', gap:'5px', justifyContent:'center', alignItems:'center', cursor:'pointer'}} onClick={() => window.open('https://www.matil.ai/contact', '_blank')} className={'icon-container'}> 
                <img alt='MATIL' src={'/images/matil-simple-gradient.png'} width={'14px'}  />
                <span className={'matil-text'} >matil</span>
            </div>
        </div> 
      </div>
      <TextAreaContainer/>
   
 
    </>)
}



 
