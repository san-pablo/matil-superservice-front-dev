//REACT
import { useRef, useState, CSSProperties, useEffect, useMemo, ReactElement, Dispatch, SetStateAction } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../../AuthContext"
import { useAuth0 } from "@auth0/auth0-react"
import { useLocation, useNavigate } from "react-router-dom"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { motion, isValidMotionProp } from 'framer-motion'
import { Text, Box, Flex, Button, Icon, Skeleton, IconButton, Portal, chakra, shouldForwardProp } from "@chakra-ui/react"
//COMPONENTS
import EditText from "../../../Components/Reusable/EditText"
import ConfirmBox from "../../../Components/Reusable/ConfirmBox"
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
import TestChat from "./TestChat"
import SectionSelector from "../../../Components/Reusable/SectionSelector"
import ActionsButton from "../../../Components/Reusable/ActionsButton"
import VariableTypeChanger from "../../../Components/Reusable/VariableTypeChanger"
import { EditBool, EditStr } from "../../../Components/Reusable/EditSettings"
import FilterManager from "../../../Components/Reusable/ManageFilters"
//FUNCTIONS
import useOutsideClick from "../../../Functions/clickOutside"
import determineBoxStyle from "../../../Functions/determineBoxStyle"
import parseMessageToBold from "../../../Functions/parseToBold"
//ICONS
import { IconType } from "react-icons"
import { RxCross2 } from "react-icons/rx"
import { FaPlus, FaSitemap, FaCode, FaRegFaceGrin, FaHand, FaRegFileLines, FaRegFaceLaughWink, FaRegFaceMeh } from "react-icons/fa6"
import { HiTrash } from "react-icons/hi2"
import { FaBook } from "react-icons/fa6" 
import { BsStars } from "react-icons/bs"
import { PiListBulletsBold } from "react-icons/pi"
//TYPING
import { MatildaConfigProps, FunctionTableData, ConfigProps } from "../../../Constants/typing"
import IconsPicker from "../../../Components/Reusable/IconsPicker"
   
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

const TildaConfig = () => {

    //TRANSLATION CONSTANT
    const auth = useAuth()
    const location = useLocation().pathname
    const navigate = useNavigate()
    const {  getAccessTokenSilently } = useAuth0()
    const { t } = useTranslation('settings')
    
    const newConfig:MatildaConfigProps = {
        id:'',
        name:t('NewConfig'),
        description:t('NewConfig'),
        sources_description:'',

        introduce_assistant:true, 
        assistant_name:'Tilda', 

        tone: '',
        allowed_emojis: [],
        allow_agent_transfer:true,
        direct_transfer:true,
        business_hours_agent_transfer_message:'',
        non_business_hours_agent_transfer_message:'',
        allow_sources:true, 
 
        conversation_filters:{logic:'AND', groups:[]},
        person_filters:{logic:'AND', groups:[]},
        business_filters:{logic:'AND', groups:[]},
        transfer_to:'',

        delay_response:false,
        minimum_seconds_to_respond: 0,
        maximum_seconds_to_respond: 5,
    }
    const configId:string = location.split('/')[location.split('/').length - 1]
    const sectionsMap:{[key:string]:[string, ReactElement]} = {'mood':[t('mood'), <FaRegFaceGrin/>], 'instructions':[t('instructions'), <FaSitemap/>], 'functions':[t('functions'), <FaCode/>], 'knowledge':[t('knowledge'), <FaBook/>] }
    const moodsDict:{[key:string]:[string, IconType]} = {'friendly':[t('tilda'), FaHand], 'neutral':[t('neutral'), FaRegFaceMeh], 'professional':[t('professional'), FaRegFileLines], 'sarcastic':[t('sarcastic'), FaRegFaceLaughWink], 'factual':[t('factual'), PiListBulletsBold]}

    const containerRef = useRef<HTMLDivElement>(null)

    //WAITING BOOLEAN
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    const [showDelete, setShowDelete] = useState<boolean>(false)
    const [testConfigId, setTestConfigId] = useState<{id:string, name:string} | null>(null)

    //SELECTED SECTIONS
    const [currentSection, setCurrentSection] = useState<'mood' | 'instructions' | 'functions' | 'knowledge' >('mood')
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)

    //CONFIG DATA
    const configDictRef = useRef<MatildaConfigProps | null>(null)
    const [configDict, setConfigDict] = useState<MatildaConfigProps | null>(null)

    //FUNCTIONS AND HEP CENTERS DATA
    const [showAddFunctions, setShowAddFunctions] = useState<boolean>(false)
    const [showAddHelpCenters, setShowAddHelpCenters] = useState<boolean>(false)
    const [functionsData, setFunctionsData] = useState<FunctionTableData[] | null>(null)
    const [helpCentersData, setHelpCentersData] = useState<{id: string, name: string, is_live: boolean}[] | null>(null)
    const [deleteFunctionIndex, setDeleteFunctionIndex] = useState<number | null>(null )
    const [deleteHelpCenterIndex, setDeleteHelpCenterIndex] = useState<number | null>(null)
 
    //FETCH INITIAL DATA
    useEffect(() => {
        const fetchInitialData = async () => {
            await fetchData({endpoint:`${auth.authData.organizationId}/help_centers`, auth,  getAccessTokenSilently, setValue:setHelpCentersData})
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/functions`,getAccessTokenSilently,  auth, params:{page_index:1, sort:{column:'name', order:'desc'}, filters:{logic:'AND', groups:[]} } })       
            if (response?.status == 200) setFunctionsData(response.data.page_data)

            if (configId === 'new') {
                setConfigDict(newConfig)
                configDictRef.current = newConfig
            }
            else  {
               const response =  await fetchData({endpoint:`${auth.authData.organizationId}/settings/matilda_configurations/${configId}`,  getAccessTokenSilently, setValue:setConfigDict, auth})
               if (response?.status === 200) configDictRef.current = response.data
            }
        }
        document.title = `${t('Settings')} - ${t('MatildaConfigs')} - ${auth.authData.organizationName} - Matil`
        fetchInitialData()
    }, [location])


    //SELECT EMOJIS
    const emojiBoxRef = useRef<HTMLDivElement>(null)
    const emojiButtonRef = useRef<HTMLButtonElement>(null)
    const [emojiVisible, setEmojiVisible] = useState<boolean>(false)
    useOutsideClick({ref1:emojiBoxRef, ref2:emojiButtonRef, onOutsideClick:setEmojiVisible})

    //BOX POSITION LOGIC, TO SHOW IT UP OR DOWN OF THE INPUT, DEPENDING ON THE POSITION
    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef:emojiButtonRef, setBoxStyle,  changeVariable:emojiVisible})

    const handleEmojiClick = (emoji:any) => {
        if (!configDict?.allowed_emojis) setConfigDict(prev => ({...prev as MatildaConfigProps, allowed_emojis:[emoji]}))
        if (!configDict?.allowed_emojis.includes(emoji)) setConfigDict(prev => ({...prev as MatildaConfigProps, allowed_emojis: [...prev?.allowed_emojis as string[], emoji]}))
    }
    const deleteEmoji = (index: number) => {setConfigDict(prev => ({...prev as MatildaConfigProps, allowed_emojis: (prev?.allowed_emojis || []).filter((_, i) => i !== index)}))}
    const handleCheckboxChange = (key: any, value: boolean) => {setConfigDict(prev => ({...prev as MatildaConfigProps, [key]: value}))}
  
  
   

    //EMOJI COMPONENT
    const EmojiComponent = ({emoji, index}:{emoji:string, index:number}) => {
        const [isHovering, setIsHovering] = useState<boolean>(false)
        return (
        <Flex key={`emoji-${index}`}  onClick={() => deleteEmoji(index)} borderRadius=".4rem" cursor={'pointer'} width={'35px'} height={'35px'} boxShadow={'0 0 3px 1px rgba(0, 0, 0, 0.15)'} fontSize={'.75em'} alignItems={'center'} justifyContent={'center'} borderColor={'gray.100'} borderWidth={'1px'} gap='5px' onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            {isHovering ?
            <Icon boxSize={'20px'} color='red' as={RxCross2} cursor={'pointer'} />:
            <Text fontSize={'1.5em'}>{emoji}</Text>
            }
        </Flex>)
    } 

     //SAVE CONFIG
    const saveConfig = async() => {
        setWaitingSend(true)
        if (configId === 'new') {
            const response =  await fetchData({endpoint:`${auth.authData.organizationId}/settings/matilda_configurations`,  getAccessTokenSilently,method:'post', requestForm:configDict as MatildaConfigProps, auth, toastMessages:{works:t('CorrectCreatedConfig'), failed:t('FailedCreatedConfig')}})
            if (response?.status === 200 && configDict) {
                navigate('/settings/tilda/all-configs')
            }
        }
        else {
            const response =  await fetchData({endpoint:`${auth.authData.organizationId}/settings/matilda_configurations/${configDict?.id}`, method:'put', getAccessTokenSilently,  requestForm:configDict as MatildaConfigProps, auth, toastMessages:{works:t('CorrectEditedConfig'), failed:t('FailedEditedConfig')}})
            if (response?.status === 200 && configDict) {
                configDictRef.current = configDict
            }
        }
        setWaitingSend(false)
    }

    //ADD HELP CENTER BOX
    const AddHelpCenter = () => {
        const addHelpCenter = async (id:string) => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/matilda_configurations/${configDict?.id}/help_centers/${id}`, getAccessTokenSilently, method:'post', auth, toastMessages:{works:t('CorrectAddedHelpCenter'), failed:t('FailedAddedHelpCenter')}})
            if (response?.status === 200) setConfigDict((prev) => ({...prev as MatildaConfigProps, help_centers_ids:[...prev?.help_centers_ids || [], id]}))
            setShowAddHelpCenters(false)
        }

        const filteredHelpCenters = (helpCentersData || []).filter(helpCenter => {return !configDict?.help_centers_ids?.some(id => id === helpCenter.id)})
        return (<> 
            <Box p='15px' > 
                <Text  fontSize='1.2em' fontWeight={'medium'}>{t('AddHelpCenter')}</Text>
            </Box>
            <Box p='15px'   overflow={'scroll'} flexDir={'row-reverse'} >
                {filteredHelpCenters?.length === 0 ? <Text>{t('NoAvailableHelpCenters')}</Text>:<>
                {filteredHelpCenters.map((cha, index) => (
                    <Flex gap='15px' alignItems={'center'} cursor={'pointer'} _hover={{bg:'gray_2'}} p='10px' borderTopColor={'border_color'}borderTopWidth={'1px'} key={`add-channel-${index}`} onClick={() => addHelpCenter(cha.id)} > 
                        <Text  flex='1'  minWidth={0}  fontSize={'.9em'} fontWeight={'medium'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{cha.name}</Text>
                        <Text flex='1'  color='text_gray'fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>/{cha.id}</Text>
                        <Flex flex='1'  alignItems={'center'} gap='7px'>
                            <Box w='8px' h='8px' borderRadius={'50%'} bg={cha?.is_live?'#68D391':'#ECC94B'}/>
                            <Text fontSize={'.9em'}>{cha.is_live?t('Live'):t('NoLive')}</Text>
                        </Flex>
                    </Flex>
                ))}</>}
                <Box h='1px' bg='border_color' w='100%'/>
            </Box>
        </>)
    }

    //ADD HELP CENTER BOX
    const AddFunctions = () => {
        const addFunction= async (id:string) => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/matilda_configurations/${configDict?.id}/functions/${id}`, getAccessTokenSilently, method:'post', auth, toastMessages:{works:t('CorrectAddedFunction'), failed:t('FailedAddedFunction')}})
            if (response?.status === 200) setConfigDict((prev) => ({...prev as MatildaConfigProps, functions_ids:[...prev?.functions_ids || [], id]}))
            setShowAddFunctions(false)
        }

        const filteredFunctions = (functionsData || []).filter(func => {return !configDict?.functions_ids?.some(id => id === func.id)})
        return (<> 
            <Box p='15px' > 
                <Text  fontSize='1.2em' fontWeight={'medium'}>{t('AddConfig')}</Text>
            </Box>
            <Box p='15px'  overflow={'scroll'} flexDir={'row-reverse'}>
                {filteredFunctions?.length === 0 ? <Text fontSize={'.9em'}>{t('NoFunctions')}</Text>:<>
                {filteredFunctions.map((cha, index) => (
                 <Flex gap='15px' alignItems={'center'} cursor={'pointer'} _hover={{bg:'gray_2'}} p='10px' borderTopColor={'border_color'}borderTopWidth={'1px'} key={`add-channel-${index}`} onClick={() => addFunction(cha.id)} > 

                        <Text  flex='1'  minWidth={0} fontSize={'.9em'}  fontWeight={'medium'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{cha.name}</Text>
                        <Text flex='1' color='text_gray'fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{cha.description}</Text>
                        <Flex flex='1'  alignItems={'center'} gap='7px'>
                            <Box w='8px' h='8px' borderRadius={'50%'} bg={cha?.is_active?'#68D391':'#ECC94B'}/>
                            <Text fontSize={'.9em'}>{cha.is_active?t('Active'):t('Inactive')}</Text>
                        </Flex>
                    </Flex>
                ))}</>}
                <Box h='1px' bg='border_color' w='100%'/>
            </Box>
        </>)
    }

    const onExitAction = () => {
        if (configId === 'new' || (JSON.stringify(configDict) === JSON.stringify(configDictRef.current))) navigate('/settings/tilda/all-configs')
        else navigate('/settings/tilda/all-configs')
         
    }  

    //DELETE HELP CENTER COMPONENT
    const DeleteHelpCenterComponent = () => {

        //WAITING DELETION
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

        //FUNCTION FOR DELETING AN AUTOMATION
        const deleteComponent = async () => {
            setWaitingDelete(true)
            const newList = (configDict?.help_centers_ids || [])?.filter((_, index) => index !== deleteHelpCenterIndex)
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/settings/matilda_configurations/${configDict?.id}/help_centers/${configDict?.help_centers_ids?.[deleteHelpCenterIndex as number]}`,  getAccessTokenSilently, method: 'delete', setWaiting: setWaitingDelete, auth, toastMessages: {works: t('CorrectDeletedHelpCenter'), failed: t('FailedDeletedHelpCenter')}})
            if (response?.status === 200) {
                setConfigDict(prev => ({...prev as MatildaConfigProps, help_centers_ids:newList}))
                setDeleteHelpCenterIndex(null)
            }
        }

        //FRONT
        return(<>
            <Box p='15px' > 
                <Text  fontSize={'1.2em'} fontWeight={'medium'}>{parseMessageToBold(t('ConfirmDeleteHelpCenter', {name:helpCentersData?.find(element => element.id === configDict?.help_centers_ids?.[deleteHelpCenterIndex as number])?.name}))}</Text>
                <Text mt='2vh' fontSize={'.8em'}  color='text_gray'>{t('ConfirmDeleteHelpCenterDes')}</Text>
            </Box>
            <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='hover_gray' borderTopWidth={'1px'} borderTopColor={'gray_2'}>
                <Button  size='sm' variant={'delete'} onClick={deleteComponent}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                <Button  size='sm' variant={'common'}onClick={() => setDeleteHelpCenterIndex(null)}>{t('Cancel')}</Button>
            </Flex>
        </>)
    }

    //DELETE FUNCTION COMPONENT
    const DeleteFunctionComponent = () => {

        //WAITING DELETION
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

        //FUNCTION FOR DELETING AN AUTOMATION
        const deleteComponent = async () => {
            setWaitingDelete(true)
            const newList = (configDict?.functions_ids || [])?.filter((_, index) => index !== deleteFunctionIndex)
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/settings/matilda_configurations/${configDict?.id}/functions/${configDict?.functions_ids?.[deleteFunctionIndex as number]}`, getAccessTokenSilently,  method: 'delete', setWaiting: setWaitingDelete, auth, toastMessages: {works: t('CorrectDeletedFunction'), failed: t('FailedDeletedFunction')}})
            if (response?.status === 200) {
                setConfigDict(prev => ({...prev as MatildaConfigProps, functions_ids:newList}))
                setDeleteFunctionIndex(null)
            }
        }

        //FRONT
        return(<>
            <Box p='15px' > 
                <Text  fontSize={'1.2em'} fontWeight={'medium'}>{parseMessageToBold(t('ConfirmDeleteFunction', {name:functionsData?.find(element => element.id === configDict?.functions_ids?.[deleteFunctionIndex as number])?.name}))}</Text>
                <Text mt='2vh' fontSize={'.8em'}  color='text_gray'>{t('ConfirmDeleteFunctionDes')}</Text>
            </Box>

            <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='hover_gray' borderTopWidth={'1px'} borderTopColor={'gray_2'}>
                <Button  size='sm' variant={'delete'} onClick={deleteComponent}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                <Button  size='sm' variant={'common'}onClick={() => setDeleteHelpCenterIndex(null)}>{t('Cancel')}</Button>
            </Flex>
        </>)
    }

    //DELETE CONFIGURATION COMPONENT
    const DeleteConfigComponent = () => {

        //WAITING DELETION
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

        //FUNCTION FOR DELETING AN AUTOMATION
        const deleteFunction= async () => {
            setWaitingDelete(true)
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/settings/matilda_configurations/${configDict?.id}`,  getAccessTokenSilently, method: 'delete', setWaiting: setWaitingDelete, auth, toastMessages: {works: t('CorrectDeletedConfiguration'), failed: t('FailedDeletedConfiguration')}})
            setWaitingDelete(false)
            if (response?.status === 200) {
                navigate('/settings/tilda/all-configs')
            }
            else setShowDelete(false)
        }

        //FRONT
        return(<>
            <Box p='15px' maxW={'500px'}> 
 
                <Text fontSize={'1.2em'}>{parseMessageToBold(t('ConfirmDeleteConfiguration', {name:configDict?.name}))}</Text>
                <Text mt='2vh' fontSize={'.8em'}  color='text_gray'>{t('DeleteConfigurationWarning')}</Text>
            </Box>
                <Flex p='15px' mt='2vh' gap='15px'w='100%' flexDir={'row-reverse'} borderTopColor={'gray_2'} borderTopWidth={'1px'} bg='hover_gray'>
                    <Button  size='sm' variant={'delete'} onClick={deleteFunction}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                    <Button  size='sm' variant={'common'}onClick={() => setDeleteHelpCenterIndex(null)}>{t('Cancel')}</Button>
                </Flex>
  
        </>)
    }
    const duplicateConfig = async() => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/matilda_configurations`, getAccessTokenSilently, auth, method:'post', requestForm:{...configDict, id:'', name:configDict?.name + ' ' + t('Copy')}, toastMessages:{'works':t('CorrectCopiedChannel'), 'failed':t('FailedCopiedChannel')}})
        if (response?.status === 200) {
            const newConfigElement = {id: response.data.id, channels_ids: [] as string[], description: configDict?.description || '', name: configDict?.name +  t('Copy')}
            navigate(`/settings/tilda/config/${response.data.id}`)  
        }
    }

    const [waitingAIGeneration, setWaitingAIGeneration] = useState<boolean>(false)
    const AIGeneration = async() => {
        const response = await fetchData({endpoint: `${auth.authData.organizationId}/settings/matilda_configurations/generate_sources_description`, getAccessTokenSilently,  method: 'post', setWaiting: setWaitingAIGeneration, auth})
        if (response?.status === 200 ) setConfigDict(prev => ({...prev as MatildaConfigProps, sources_description:response.data.sources_description}))
    }

    //MEMOIZED DELETE CONFIG
    const memoizedDeleteConfig = useMemo(() => (<> 
        <ConfirmBox  setShowBox={setShowDelete} > 
            <DeleteConfigComponent/>
        </ConfirmBox>
    </>), [showDelete])

    //MEMOIZED ADD HELP CENTERS COMPONENT
    const memoizedAddHelpCenter = useMemo(() => (<> 
        <ConfirmBox  setShowBox={setShowAddHelpCenters} > 
            <AddHelpCenter/>
        </ConfirmBox>
    </>), [showAddHelpCenters])

      //MEMOIZED ADD FUNCTIONS COMPONENT
      const memoizedAddFunctions= useMemo(() => (<> 
        <ConfirmBox  setShowBox={setShowAddFunctions} > 
            <AddFunctions/>
        </ConfirmBox>
    </>), [showAddFunctions])


    //MEMOIZED ADD HELP CENTERS COMPONENT
    const memoizedDeleteHelpCenter = useMemo(() => (<> 
        <ConfirmBox  setShowBox={(b:boolean) => setDeleteHelpCenterIndex(null)} > 
            <DeleteHelpCenterComponent/>
        </ConfirmBox>
    </>), [deleteHelpCenterIndex])


    //MEMOIZED ADD HELP CENTERS COMPONENT
    const memoizedDeleteFunction = useMemo(() => (<> 
        <ConfirmBox  setShowBox={(b:boolean) => setDeleteFunctionIndex(null)} > 
            <DeleteFunctionComponent/>
        </ConfirmBox>
    </>), [deleteFunctionIndex])

    const memoizedTestChat = useMemo(() => (<> 
        <Portal> 
            <MotionBox initial={{opacity:0}}  animate={{opacity:1}} display={'flex'} exit={{opacity:0}} transition={{ duration: '.2' }} onMouseDown={() => setTestConfigId(null)} backdropFilter= 'blur(1px)' position='fixed' alignItems='center'justifyContent='center' top={0} left={0} width='100vw' height='100vh' bg='rgba(0, 0, 0, 0.3)' zIndex= {10000}>
                <MotionBox initial={{opacity:0, y:15}}  animate={{opacity:1, y:0}} transition={{ duration: '.2'}}     h={'90vh'} w='49.72vh' onMouseDown={(e) => e.stopPropagation()} bg='white' overflow={'hidden'} borderRadius={'1.5rem'} shadow={'xl'} position={'absolute'}  borderColor='border_color' borderWidth='7px' zIndex={111}  >
                    <TestChat configurationId={testConfigId?.id || ''} configurationName={testConfigId?.name || ''}/>
                </MotionBox>
            </MotionBox>
        </Portal> 
    </>), [testConfigId])


//MEMOIZED ACTIONS BUTTON
const memoizedActionsButton = useMemo(() => (<ActionsButton deleteAction={() => setShowDelete(true)} copyAction={duplicateConfig} />), [configDict])

return(   
    <>
    {testConfigId && memoizedTestChat}
    {showAddHelpCenters && memoizedAddHelpCenter}
    {showAddFunctions && memoizedAddFunctions}
    {deleteHelpCenterIndex !== null && memoizedDeleteHelpCenter}
    {deleteFunctionIndex !== null && memoizedDeleteFunction}
    {showDelete && memoizedDeleteConfig}

    <Box px='2vw' pt='2vh'> 
        <Flex justifyContent={'space-between'} > 
            <Skeleton  isLoaded={(configDict !== null)}> 
                <EditText  placeholder={t('name')}  value={configDict?.name} setValue={(value) => setConfigDict(prev => ({...prev as MatildaConfigProps, name:value}))} className={'title-textarea-collections'}/>
            </Skeleton>
            <Flex gap='12px'>
                {memoizedActionsButton}
                <Button variant={configId !== 'new'?'main':'common'} size='sm' onClick={saveConfig} isDisabled={configDict?.name === ''  || ((JSON.stringify(configDict) === JSON.stringify(configDictRef.current)))}>{waitingSend?<LoadingIconButton/>:configId === 'new'? t('CreateConfig'):t('SaveChanges')}</Button> 
            </Flex>
        </Flex>
        <Flex justifyContent={'space-between'}> 
            <Box h='40px' > 
                <SectionSelector notSection selectedSection={currentSection} sections={Object.keys(sectionsMap)} sectionsMap={sectionsMap}  onChange={(sec) => setCurrentSection(sec as any) }/>  
            </Box>
            
        </Flex>
        <Box bg='border_color' h='1px' w='100%'/>
    </Box>

    <Flex flex='1' overflow={'hidden'}  ref={containerRef} position='relative'> 
            <Flex flexDir={'column'} flex='1'  pt='3vh'  height={'100%'} px='2vw' overflow={'scroll'}>             
                {(() => {
                    switch (currentSection) {
                        case 'mood':
                            return (
                                <>
                                <Text mb='.5vh'  fontWeight={'semibold'}>{t('Description')}</Text>
                                <Skeleton isLoaded={configDict !== null}> 
                                    <EditText hideInput={false} isTextArea maxLength={2000} placeholder={`${t('Description')}...`} value={configDict?.description} setValue={(value) => setConfigDict((prev) => ({...prev as MatildaConfigProps, description:value}))}/>
                                </Skeleton> 

                                <Text  mt='3vh' fontWeight={'semibold'}>{t('Presentation')}</Text>
                                <Skeleton isLoaded={configDict !== null} style={{marginTop:'1vh'}}> 
                                    <EditBool title={t('IntroduceAssitant')} description={t('IntroduceAssitantDes')} value={configDict?.introduce_assistant || false} setValue={(value) => setConfigDict((prev) => ({...prev as MatildaConfigProps, introduce_assistant:value}))}/>
                                </Skeleton> 

    
                                <Skeleton isLoaded={configDict !== null} style={{marginTop:'1vh', maxWidth:'350px'}}> 
                                    {configDict?.introduce_assistant && <EditStr placeholder={`${t('AssitantName')}...`} title={t('AssitantName')} description={t('AssitantNameDes')} value={configDict?.assistant_name} setValue={(value) => setConfigDict(prev => ({ ...prev as MatildaConfigProps, 'assistant_name': value }))}/>}
                                </Skeleton> 

                                <Text  mt='3vh' fontWeight={'semibold'}>{t('Personality')}</Text>
                                <Flex   flexWrap={'wrap'} gap='10px'>
                                    {Object.keys(moodsDict).map((cha, index) => (
                                        <Skeleton key={`channel-${index}`} isLoaded={configDict !== null} style={{marginTop:'1vh'}}> 
                                            <Flex transition={'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out,box-shadow 0.2s ease-in-out'} onClick={() => setConfigDict((prev) => ({...prev as MatildaConfigProps, tone:cha}))} p='10px' borderRadius={'.5rem'} gap='10px' cursor={'ponter'} alignItems={'center'} color={configDict?.tone === cha ? 'text_blue':'black'} boxShadow={ configDict?.tone  === cha  ? '0 0 0 2px rgb(59, 90, 246)' : ''} _hover={{bg:'gray_2'}} border={configDict?.tone  === cha  ? '1px solid rgb(59, 90, 246)': '1px solid #E2E8F0'}>
                                                <Icon as={moodsDict[cha][1]}/>
                                                <Text fontSize={'.9em'}>{moodsDict[cha][0]}</Text>
                                            </Flex>
                                        </Skeleton>
                                    ))}
                                </Flex>

                                <Text mt='3vh' fontSize={'.9em'} fontWeight={'semibold'}>{t('AvailableEmojis')}</Text>
                                <Skeleton isLoaded={configDict !== null} style={{marginTop:'1vh'}}> 
                                    <Flex maxH='20vh' overflow={'scroll'} wrap={'wrap'} py='5px' gap='7px' mt='.5vh'>
                                        {(configDict?.allowed_emojis || []).map((emoji, index) => (
                                            <EmojiComponent key={`emoji-${index}`} emoji={emoji} index={index}/>
                                        ))}
                                        </Flex>
                                        <Button ref={emojiButtonRef} onClick={() => setEmojiVisible(!emojiVisible)} variant={'common'} size='xs' mt='1vh' leftIcon={<FaPlus/>}>{t('AddEmoji')}</Button>
                                        <IconsPicker selectedEmoji={''} excludedSections={['icon','upload']} onSelectEmoji={handleEmojiClick}/>


                                </Skeleton> 

                                </>
                            )
                        case 'instructions':
                            return (<>

                                <Text fontWeight={'semibold'}>{t('Responses')}</Text>                
                                
                                <Box mt='1vh'> 
                                    <EditBool title={t('AllowAgentTransfer')} description={t('AllowAgentTransferDes')} value={configDict?.allow_agent_transfer || false} setValue={(value) => setConfigDict((prev) => ({...prev as MatildaConfigProps, allow_agent_transfer:value}))}/>
                                </Box>

                                <Box mt='1vh'> 
                                    <EditBool title={t('DirectTransfer')} description={t('DirectTransferDes')} value={configDict?.direct_transfer || false} setValue={(value) => setConfigDict((prev) => ({...prev as MatildaConfigProps, direct_transfer:value}))}/>
                                </Box>

                                <Box mt='1vh' mb='1vh'> 

                                    <EditStr placeholder={`${t('Message')}...`} title={t('BusinessHourMessage')} value={configDict?.business_hours_agent_transfer_message} setValue={(value) => setConfigDict(prev => ({ ...prev as MatildaConfigProps, 'business_hours_agent_transfer_message': value }))}/>
                                    <Box mt='1vh'> 
                                        <EditStr placeholder={`${t('Message')}...`} title={t('NotBusinessHourMessage')} value={configDict?.non_business_hours_agent_transfer_message} setValue={(value) => setConfigDict(prev => ({ ...prev as MatildaConfigProps, 'non_business_hours_agent_transfer_message': value }))}/>
                                    </Box>
                
                                </Box>
                                
                                <EditBool title={t('AnswerInmediatly')} description={t('AnswerInmediatlyDes')} value={configDict?.delay_response || false} setValue={(value) => setConfigDict((prev) => ({...prev as MatildaConfigProps, delay_response:value}))}/>
                                {configDict?.delay_response && 
                                    <Flex gap='20px' mt='1vh'> 
                                        <Box> 
                                            <Text fontWeight={'medium'} fontSize={'.8em'}>{t('minimum_seconds_to_respond')}</Text>
                                            <VariableTypeChanger customType inputType={'float'} max={configDict.maximum_seconds_to_respond} min={0} value={configDict?.minimum_seconds_to_respond || 0} setValue={(value) => setConfigDict(prev => ({ ...prev as MatildaConfigProps, 'minimum_seconds_to_respond':value}))} />
                                        </Box>
                                        <Box> 
                                            <Text fontWeight={'medium'} fontSize={'.8em'}>{t('minimum_seconds_to_respond')}</Text>
                                            <VariableTypeChanger  customType inputType={'number'} max={60} min={configDict?.minimum_seconds_to_respond} value={configDict?.maximum_seconds_to_respond || 0} setValue={(value) => setConfigDict(prev => ({ ...prev as MatildaConfigProps, 'maximum_seconds_to_respond':value}))} />
                                        </Box>
                                    </Flex>}

                                <Text mt='3vh' mb='1vh' fontWeight={'semibold'} >{t('ConversationConditions')}</Text>
                                {configDict?.conversation_filters && <FilterManager excludedFields={['contacts', 'contact_businesses']} filters={configDict?.conversation_filters} setFilters={(filters) => setConfigDict(prev => ({...prev as any, conversation_filters:filters}))}  scrollRef={containerRef}/>}

                                <Text mt='3vh' mb='1vh'  fontWeight={'semibold'} >{t('ClientConditions')}</Text>
                                {configDict?.person_filters && <FilterManager excludedFields={['conversations', 'contact_businesses']} filters={configDict?.person_filters} setFilters={(filters) => setConfigDict(prev => ({...prev as any, contact_filters:filters}))}  scrollRef={containerRef}/>}

                                <Text mt='3vh' mb='1vh'  fontWeight={'semibold'} >{t('BusinessConditions')}</Text>
                                {configDict?.business_filters && <FilterManager excludedFields={['conversations', 'contacts']} filters={configDict?.business_filters} setFilters={(filters) => setConfigDict(prev => ({...prev as any, contact_business_filters:filters}))} scrollRef={containerRef}/>}

                            </>)

                        case 'functions':
                            return (<>

                                {configDict?.functions_ids?.length !== 0 && <Flex mb='2vh' gap='15px' alignItems={'center'} justifyContent={'space-between'}> 
                                    <Text   fontWeight={'semibold'} >{t('AvailableFunctions')}</Text>
                                    <Button variant={'main'} minW={0} display={'inline-flex'} leftIcon={<FaPlus/>} isDisabled={configDict?.functions_ids?.length === functionsData?.length || configId === 'new'} onClick={() => setShowAddFunctions(true)} size='xs' >{t('AddFunctions')}</Button>
                                </Flex>}
                                    {configDict?.functions_ids?.length === 0 ? 
                                    <Flex  flexDir={'column'}> 
                                        <Box maxW='400px'  > 
                                            <Text fontSize={'.9em'} color='text_gray'>{t('NoFunctionsSelected')}</Text>
                                            <Button mt='3vh' w='100%' variant={'main'} minW={0} display={'inline-flex'} leftIcon={<FaPlus/>} isDisabled={configDict?.functions_ids.length === functionsData?.length || configId === 'new'} onClick={() => setShowAddFunctions(true)} size='sm' >{t('AddFirstFunction')}</Button>
                                        </Box> 
                                    </Flex>
                                    : 
                                        <>
                                        {configDict?.functions_ids?.map((id, index) => (
                                            <Flex alignItems={'center'} key={`funciton-${index}`}   py='10px' borderBottomColor={'border_color'} borderBottomWidth={'1px'} borderTopColor={'border_color'} borderTopWidth={index === 0 ?'1px':''} justifyContent={'space-between'}> 
                                                <Box  flex='1'  > 
                                                    <Text _hover={{color:'text_blue'}} onClick={() => window.open(`${window.location.origin}/functions/function/${id}`, '_blank')} cursor={'pointer'} fontSize={'.9em'} fontWeight={'medium'}  >{functionsData?.find(element => element.id === id)?.name}</Text>
                                                    <Text whiteSpace={'normal'} color='text_gray'fontSize={'.8em'} >{functionsData?.find(element => element.id === id)?.description}</Text>
                                                </Box>
                                                <IconButton size={'sm'} color={'red.600'} bg='transparent' variant={'delete'} _hover={{bg:'red.100'}} icon={<HiTrash size={'20px'}/>} aria-label="delete-row" onClick={(e) => {e.stopPropagation() ;setDeleteFunctionIndex(index)}}/>
                                            </Flex>
                                        ))} 
                                    </>}
                                    <Box> 
                                        </Box>
                                    { configId === 'new' && <Text mt='.5vh' fontSize={'.8em'} color='red'>{t('SaveFunctionWarning')}</Text>}
                            </>)

                        case 'knowledge':
                            return (<>


                                <Flex   mb='1vh'  alignItems={'center'} justifyContent={'space-between'}> 
                                    <Text  fontWeight={'semibold'}>{t('SourcesDescription')}</Text>
                                    <Button color='white' onClick={AIGeneration} leftIcon={<BsStars/>} size='xs' opacity={0.8} bgGradient={"linear(to-r, rgba(0, 102, 204), rgba(102, 51, 255))"} _hover={{opacity:0.9}}>{waitingAIGeneration ? <LoadingIconButton/>:t('AiGenerate')}</Button>
                                </Flex>
                                <Skeleton isLoaded={configDict !== null}> 
                                    <EditText hideInput={false} isTextArea maxLength={2000} placeholder={`${t('SourcesDescription')}...`} value={configDict?.sources_description} setValue={(value) => setConfigDict((prev) => ({...prev as MatildaConfigProps, sources_description:value}))}/>
                                </Skeleton>

                                <Flex mb='2vh' mt='3vh' gap='15px' alignItems={'center'} justifyContent={'space-between'}> 
                                    <Text   fontWeight={'semibold'} >{t('HelpCentersToUse')}</Text>
                                    {configDict?.help_centers_ids?.length !== 0 && <Button variant={'main'}  leftIcon={<FaPlus/>} isDisabled={configDict?.help_centers_ids?.length === helpCentersData?.length ||  configId === 'new'}  onClick={() => setShowAddHelpCenters(true)} size='xs' >{t('AddHelpCenters')}</Button>}
                                </Flex>

                                <EditBool title={t('UseHelpCenter')} description={t('UseHelpCenterDes')} value={configDict?.allow_sources || false} setValue={(value) => setConfigDict((prev) => ({...prev as MatildaConfigProps, allow_sources:value}))}/>
                                <Box mt='2vh'>       
                                    {configDict?.allow_sources && <> 
                                        {configDict?.help_centers_ids?.length === 0 ?   
                                        <Flex  flexDir={'column'}> 
                                            <Box maxW='400px'  > 
                                                <Text fontSize={'.9em'} color='text_gray'>{t('NoHelpCenterSelected')}</Text>
                                                <Button variant={'main'} mt='3vh' w='100%' leftIcon={<FaPlus/>} isDisabled={configDict?.help_centers_ids.length === helpCentersData?.length ||  configId === 'new'}  onClick={() => setShowAddHelpCenters(true)} size='sm' >{t('AddHelpCenters')}</Button>
                                            </Box> 
                                        </Flex> : 
                                        <>
                                        {configDict?.help_centers_ids?.map((center, index) => (
                                            <Flex alignItems={'center'} key={`help-center-${index}`} py='10px' borderBottomColor={'border_color'} borderBottomWidth={'1px'} borderTopColor={'border_color'} borderTopWidth={index === 0 ?'1px':''} justifyContent={'space-between'}> 
                                                <Box flex='1' > 
                                                    <Text _hover={{color:'text_blue'}} onClick={() => window.open(`${window.location.origin}/settings/help-centers/help-center/${center}`, '_blank')} cursor={'pointer'}  fontSize={'.9em'}  fontWeight={'medium'} >{helpCentersData?.find(element => element.id === center)?.name}</Text>
                                                    <Text color='text_gray'fontSize={'.8em'} >{center}</Text>
                                                </Box>
                                                <IconButton size={'sm'} color={'red.600'} bg='transparent' variant={'delete'} _hover={{bg:'red.100'}} icon={<HiTrash size={'20px'}/>} aria-label="delete-row" onClick={() => setDeleteHelpCenterIndex(index)}/>
                                            </Flex>
                                        ))} 
                                    </>
                                    }
                                
                                        { configId === 'new' && <Text mt='.5vh' fontSize={'.8em'} color='red'>{t('SaveHelpCenterWarning')}</Text>}
                                    </>}
                                </Box>  
                            </>)


                        default: 
                            return <></>
                    }
                            
                })()}
            </Flex>
        <Flex flex='1' alignItems={'center'} justifyContent={'center'}> 
            <Box width='360px' height='650px' onMouseDown={(e) => e.stopPropagation()} bg='white' overflow={'hidden'} borderRadius={'1.5rem'} shadow={'xl'} position={'absolute'}  borderColor='border_color' borderWidth='7px' zIndex={111}  >
            <TestChat configurationId={configId} configurationName={configDict?.name || ''}/>
            </Box>
        </Flex>
    </Flex>


    </>)
}

export default TildaConfig