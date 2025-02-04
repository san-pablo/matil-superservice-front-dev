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
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
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
import { FaPlus, FaSitemap, FaCode, FaRegFaceGrin, FaHand, FaRegFileLines, FaRegFaceLaughWink, FaRegFaceMeh, FaCircleDot } from "react-icons/fa6"
import { HiTrash } from "react-icons/hi2"
import { RiBookMarkedFill } from "react-icons/ri"
import { PiListBulletsBold } from "react-icons/pi"
//TYPING
import { MatildaConfigProps, FunctionTableData, ConfigProps } from "../../../Constants/typing"
   
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

const TildaConfig = ({setConfigsData}:{setConfigsData:Dispatch<SetStateAction<ConfigProps[]>>}) => {

    //TRANSLATION CONSTANT
    const auth = useAuth()
    const location = useLocation().pathname
    const navigate = useNavigate()
    const {  getAccessTokenSilently } = useAuth0()
    const { t } = useTranslation('settings')
    const operationTypesDict = {'user_id':['eq', 'neq',  'exists'], 'team_uuid':['eq', 'neq',  'exists'], 'channel_type':['eq', 'neq', 'exists'], 'title':['eq', 'neq', 'exists'], 'theme':['eq', 'neq', 'exists'], 'urgency_rating':['eq', 'neq', 'leq', 'geq', 'exists'], 'status':['eq', 'neq'], 'unseen_changes':['eq', 'exists'], 'tags':['contains', 'ncontains', 'exists'], 'is_matilda_engaged':['eq', 'exists'],'is_csat_offered':['eq', 'exists'],
    'contact_business_id':['eq', 'neq',  'exists'], 'name':['eq', 'neq', 'contains', 'ncontains', 'exists'], 'language':['eq', 'neq',  'exists'], 'rating':['eq','neq', 'leq', 'geq', 'exists'], 'notes':['eq', 'neq', 'contains', 'ncontains', 'exists'], 'labels':['contains', 'ncontains', 'exists'],
    'domain':['eq', 'neq', 'contains', 'ncontains', 'exists'], 'hours_since_created':['eq', 'neq', 'leq', 'geq',  'exists'], 'hours_since_updated':['eq', 'neq', 'leq', 'geq',   'exists']
    }
    const typesMap = {'bool':['eq', 'exists'], 'int':['eq','neq', 'leq', 'geq', 'exists'], 'float':['eq','neq', 'leq', 'geq', 'exists'],'str': ['eq', 'neq', 'contains', 'ncontains', 'exists'], 'timestamp':['eq', 'neq', 'leq', 'geq',  'exists']}
    
    
    const newConfig:MatildaConfigProps = {
        uuid:'',
        name:t('NewConfig'),
        description:t('NewConfig'),

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
        contact_filters:{logic:'AND', groups:[]},
        contact_business_filters:{logic:'AND', groups:[]},
        transfer_to:'',

        delay_response:false,
        minimum_seconds_to_respond: 0,
        maximum_seconds_to_respond: 5,
    }
    const configUuid:string = location.split('/')[location.split('/').length - 1]
    const sectionsMap:{[key:string]:[string, ReactElement]} = {'mood':[t('mood'), <FaRegFaceGrin/>], 'instructions':[t('instructions'), <FaSitemap/>], 'functions':[t('functions'), <FaCode/>], 'knowledge':[t('knowledge'), <RiBookMarkedFill/>] }
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
            await fetchData({endpoint:`${auth.authData.organizationId}/admin/help_centers`, auth,  getAccessTokenSilently, setValue:setHelpCentersData})
            await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions`, auth,  getAccessTokenSilently, setValue:setFunctionsData})

            if (configUuid === 'new') {
                setConfigDict(newConfig)
                configDictRef.current = newConfig
            }
            else  {
               const response =  await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations/${configUuid}`,  getAccessTokenSilently, setValue:setConfigDict, auth})
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
    determineBoxStyle({buttonRef:emojiButtonRef, setBoxStyle, boxPosition:'right', changeVariable:emojiVisible})

    const handleEmojiClick = (emojiObject: EmojiClickData, event: any) => {
        if (!configDict?.allowed_emojis) setConfigDict(prev => ({...prev as MatildaConfigProps, allowed_emojis:[emojiObject.emoji]}))
        if (!configDict?.allowed_emojis.includes(emojiObject.emoji)) setConfigDict(prev => ({...prev as MatildaConfigProps, allowed_emojis: [...prev?.allowed_emojis as string[], emojiObject.emoji]}))
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
        if (configUuid === 'new') {
            const response =  await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations`,  getAccessTokenSilently,method:'post', requestForm:configDict as MatildaConfigProps, auth, toastMessages:{works:t('CorrectCreatedConfig'), failed:t('FailedCreatedConfig')}})
            if (response?.status === 200 && configDict) {
                navigate('/settings/tilda/all-configs')
            }
        }
        else {
            const response =  await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations/${configDict?.uuid}`, method:'put', getAccessTokenSilently,  requestForm:configDict as MatildaConfigProps, auth, toastMessages:{works:t('CorrectEditedConfig'), failed:t('FailedEditedConfig')}})
            if (response?.status === 200 && configDict) {
                configDictRef.current = configDict
            }
        }
        setWaitingSend(false)
    }

    //ADD HELP CENTER BOX
    const AddHelpCenter = () => {
        const addHelpCenter = async (id:string) => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations/${configDict?.uuid}/help_centers/${id}`, getAccessTokenSilently, method:'post', auth, toastMessages:{works:t('CorrectAddedHelpCenter'), failed:t('FailedAddedHelpCenter')}})
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
                    <Flex gap='15px' alignItems={'center'} cursor={'pointer'} _hover={{bg:'brand.gray_2'}} p='10px' borderTopColor={'gray.200'}borderTopWidth={'1px'} key={`add-channel-${index}`} onClick={() => addHelpCenter(cha.id)} > 
                        <Text  flex='1'  minWidth={0}  fontSize={'.9em'} fontWeight={'medium'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{cha.name}</Text>
                        <Text flex='1'  color='gray.600'fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>/{cha.id}</Text>
                        <Flex flex='1'  alignItems={'center'} gap='7px'>
                            <Box w='8px' h='8px' borderRadius={'50%'} bg={cha?.is_live?'#68D391':'#ECC94B'}/>
                            <Text fontSize={'.9em'}>{cha.is_live?t('Live'):t('NoLive')}</Text>
                        </Flex>
                    </Flex>
                ))}</>}
                <Box h='1px' bg='gray.200' w='100%'/>
            </Box>
        </>)
    }

    //ADD HELP CENTER BOX
    const AddFunctions = () => {
        const addFunction= async (id:string) => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations/${configDict?.uuid}/functions/${id}`, getAccessTokenSilently, method:'post', auth, toastMessages:{works:t('CorrectAddedFunction'), failed:t('FailedAddedFunction')}})
            if (response?.status === 200) setConfigDict((prev) => ({...prev as MatildaConfigProps, functions_uuids:[...prev?.functions_uuids || [], id]}))
            setShowAddFunctions(false)
        }

        const filteredFunctions = (functionsData || []).filter(func => {return !configDict?.functions_uuids?.some(id => id === func.uuid)})
        return (<> 
            <Box p='15px' > 
                <Text  fontSize='1.2em' fontWeight={'medium'}>{t('AddConfig')}</Text>
            </Box>
            <Box p='15px'  overflow={'scroll'} flexDir={'row-reverse'}>
                {filteredFunctions?.length === 0 ? <Text fontSize={'.9em'}>{t('NoFunctions')}</Text>:<>
                {filteredFunctions.map((cha, index) => (
                 <Flex gap='15px' alignItems={'center'} cursor={'pointer'} _hover={{bg:'brand.gray_2'}} p='10px' borderTopColor={'gray.200'}borderTopWidth={'1px'} key={`add-channel-${index}`} onClick={() => addFunction(cha.uuid)} > 

                        <Text  flex='1'  minWidth={0} fontSize={'.9em'}  fontWeight={'medium'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{cha.name}</Text>
                        <Text flex='1' color='gray.600'fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{cha.description}</Text>
                        <Flex flex='1'  alignItems={'center'} gap='7px'>
                            <Box w='8px' h='8px' borderRadius={'50%'} bg={cha?.is_active?'#68D391':'#ECC94B'}/>
                            <Text fontSize={'.9em'}>{cha.is_active?t('Active'):t('Inactive')}</Text>
                        </Flex>
                    </Flex>
                ))}</>}
                <Box h='1px' bg='gray.200' w='100%'/>
            </Box>
        </>)
    }

    const onExitAction = () => {
        if (configUuid === 'new' || (JSON.stringify(configDict) === JSON.stringify(configDictRef.current))) navigate('/settings/tilda/all-configs')
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
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/admin/settings/matilda_configurations/${configDict?.uuid}/help_centers/${configDict?.help_centers_ids?.[deleteHelpCenterIndex as number]}`,  getAccessTokenSilently, method: 'delete', setWaiting: setWaitingDelete, auth, toastMessages: {works: t('CorrectDeletedHelpCenter'), failed: t('FailedDeletedHelpCenter')}})
            if (response?.status === 200) {
                setConfigDict(prev => ({...prev as MatildaConfigProps, help_centers_ids:newList}))
                setDeleteHelpCenterIndex(null)
            }
        }

        //FRONT
        return(<>
            <Box p='15px' > 
                <Text  fontSize={'1.2em'} fontWeight={'medium'}>{parseMessageToBold(t('ConfirmDeleteHelpCenter', {name:helpCentersData?.find(element => element.id === configDict?.help_centers_ids?.[deleteHelpCenterIndex as number])?.name}))}</Text>
                <Text mt='2vh' fontSize={'.8em'}  color='gray.600'>{t('ConfirmDeleteHelpCenterDes')}</Text>
            </Box>
            <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='brand.hover_gray' borderTopWidth={'1px'} borderTopColor={'brand.gray_2'}>
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
            const newList = (configDict?.functions_uuids || [])?.filter((_, index) => index !== deleteFunctionIndex)
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/admin/settings/matilda_configurations/${configDict?.uuid}/functions/${configDict?.functions_uuids?.[deleteFunctionIndex as number]}`, getAccessTokenSilently,  method: 'delete', setWaiting: setWaitingDelete, auth, toastMessages: {works: t('CorrectDeletedFunction'), failed: t('FailedDeletedFunction')}})
            if (response?.status === 200) {
                setConfigDict(prev => ({...prev as MatildaConfigProps, functions_uuids:newList}))
                setDeleteFunctionIndex(null)
            }
        }

        //FRONT
        return(<>
            <Box p='15px' > 
                <Text  fontSize={'1.2em'} fontWeight={'medium'}>{parseMessageToBold(t('ConfirmDeleteFunction', {name:functionsData?.find(element => element.uuid === configDict?.functions_uuids?.[deleteFunctionIndex as number])?.name}))}</Text>
                <Text mt='2vh' fontSize={'.8em'}  color='gray.600'>{t('ConfirmDeleteFunctionDes')}</Text>
            </Box>

            <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='brand.hover_gray' borderTopWidth={'1px'} borderTopColor={'brand.gray_2'}>
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
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/admin/settings/matilda_configurations/${configDict?.uuid}`,  getAccessTokenSilently, method: 'delete', setWaiting: setWaitingDelete, auth, toastMessages: {works: t('CorrectDeletedConfiguration'), failed: t('FailedDeletedConfiguration')}})
            setWaitingDelete(false)
            if (response?.status === 200) {
                setConfigsData((prev) => prev.filter((con) => con.uuid !== configUuid))
                navigate('/settings/tilda/all-configs')
            }
            else setShowDelete(false)
        }

        //FRONT
        return(<>
            <Box p='15px' maxW={'500px'}> 
 
                <Text fontSize={'1.2em'}>{parseMessageToBold(t('ConfirmDeleteConfiguration', {name:configDict?.name}))}</Text>
                <Text mt='2vh' fontSize={'.8em'}  color='gray.600'>{t('DeleteConfigurationWarning')}</Text>
            </Box>
                <Flex p='15px' mt='2vh' gap='15px'w='100%' flexDir={'row-reverse'} borderTopColor={'brand.gray_2'} borderTopWidth={'1px'} bg='brand.hover_gray'>
                    <Button  size='sm' variant={'delete'} onClick={deleteFunction}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                    <Button  size='sm' variant={'common'}onClick={() => setDeleteHelpCenterIndex(null)}>{t('Cancel')}</Button>
                </Flex>
  
        </>)
    }
    const duplicateConfig = async() => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations`, getAccessTokenSilently, auth, method:'post', requestForm:{...configDict, uuid:'', name:configDict?.name + ' ' + t('Copy')}, toastMessages:{'works':t('CorrectCopiedChannel'), 'failed':t('FailedCopiedChannel')}})
        if (response?.status === 200) {
            const newConfigElement = {uuid: response.data.uuid, channels_ids: [], description: configDict?.description || '', name: configDict?.name +  t('Copy')}
            setConfigsData((prev) => [...prev, newConfigElement])
            navigate(`/settings/tilda/config/${response.data.uuid}`)  
        }
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
                <MotionBox initial={{opacity:0, y:15}}  animate={{opacity:1, y:0}} transition={{ duration: '.2'}}     h={'90vh'} w='49.72vh' onMouseDown={(e) => e.stopPropagation()} bg='white' overflow={'hidden'} borderRadius={'1.5rem'} shadow={'xl'} position={'absolute'}  borderColor='gray.200' borderWidth='7px' zIndex={111}  >
                    <TestChat configurationId={testConfigId?.id || ''} configurationName={testConfigId?.name || ''}/>
                </MotionBox>
            </MotionBox>
        </Portal> 
    </>), [testConfigId])


//MEMOIZED ACTIONS BUTTON
const memoizedActionsButton = useMemo(() => (<ActionsButton deleteAction={() => setShowDelete(true)} copyAction={duplicateConfig} />), [configDict])


console.log(configDict)
return(   
    <>
    {testConfigId && memoizedTestChat}
    {showAddHelpCenters && memoizedAddHelpCenter}
    {showAddFunctions && memoizedAddFunctions}
    {deleteHelpCenterIndex !== null && memoizedDeleteHelpCenter}
    {deleteFunctionIndex !== null && memoizedDeleteFunction}
    {showDelete && memoizedDeleteConfig}

    <Box px='2vw' pt='2vh'> 
        <Skeleton  isLoaded={(configDict !== null)}> 
            <EditText  placeholder={t('name')}  value={configDict?.name} setValue={(value) => setConfigDict(prev => ({...prev as MatildaConfigProps, name:value}))} className={'title-textarea-collections'}/>
        </Skeleton>
        <Flex justifyContent={'space-between'}> 
            <Box h='40px' > 
                <SectionSelector notSection selectedSection={currentSection} sections={Object.keys(sectionsMap)} sectionsMap={sectionsMap}  onChange={(sec) => setCurrentSection(sec as any) }/>  
            </Box>
            <Flex gap='12px'>
                {memoizedActionsButton}
                <Button variant={configUuid !== 'new'?'main':'common'} size='sm' onClick={saveConfig} isDisabled={configDict?.name === ''  || ((JSON.stringify(configDict) === JSON.stringify(configDictRef.current)))}>{waitingSend?<LoadingIconButton/>:configUuid === 'new'? t('CreateConfig'):t('SaveChanges')}</Button> 
            </Flex>
        </Flex>
        <Box bg='gray.200' h='1px' w='100%'/>
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
                                            <Flex transition={'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out,box-shadow 0.2s ease-in-out'} onClick={() => setConfigDict((prev) => ({...prev as MatildaConfigProps, tone:cha}))} p='10px' borderRadius={'.5rem'} gap='10px' cursor={'ponter'} alignItems={'center'} color={configDict?.tone === cha ? 'brand.text_blue':'black'} boxShadow={ configDict?.tone  === cha  ? '0 0 0 2px rgb(59, 90, 246)' : ''} _hover={{bg:'brand.gray_2'}} border={configDict?.tone  === cha  ? '1px solid rgb(59, 90, 246)': '1px solid #E2E8F0'}>
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
                                        <Box position={'fixed'} pointerEvents={emojiVisible?'auto':'none'} marginTop={'10px'} marginBottom={'10px'} top={boxStyle.top} bottom={boxStyle.bottom}left={boxStyle.left}  transition='opacity 0.2s ease-in-out' opacity={emojiVisible ? 1:0} zIndex={1000} ref={emojiBoxRef}> 
                                            <EmojiPicker onEmojiClick={handleEmojiClick}  open={emojiVisible} allowExpandReactions={false}/>
                                        </Box>

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
                                        {(configDict?.allow_agent_transfer && configDict?.direct_transfer) && <>

                                            <EditStr placeholder={`${t('Message')}...`} title={t('BusinessHourMessage')} value={configDict?.business_hours_agent_transfer_message} setValue={(value) => setConfigDict(prev => ({ ...prev as MatildaConfigProps, 'business_hours_agent_transfer_message': value }))}/>
                                            <Box mt='1vh'> 
                                                <EditStr placeholder={`${t('Message')}...`} title={t('NotBusinessHourMessage')} value={configDict?.non_business_hours_agent_transfer_message} setValue={(value) => setConfigDict(prev => ({ ...prev as MatildaConfigProps, 'non_business_hours_agent_transfer_message': value }))}/>
                                            </Box>
                                        </>}
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
                                    {configDict?.conversation_filters && <FilterManager excludedFields={['contacts', 'contact_businesses']} filters={configDict?.conversation_filters} setFilters={(filters) => setConfigDict(prev => ({...prev as any, conversation_filters:filters}))} operationTypesDict={operationTypesDict} typesMap={typesMap} scrollRef={containerRef}/>}
 
                                    <Text mt='3vh' mb='1vh'  fontWeight={'semibold'} >{t('ContactConditions')}</Text>
                                    {configDict?.contact_filters && <FilterManager excludedFields={['conversations', 'contact_businesses']} filters={configDict?.contact_filters} setFilters={(filters) => setConfigDict(prev => ({...prev as any, contact_filters:filters}))} operationTypesDict={operationTypesDict} typesMap={typesMap} scrollRef={containerRef}/>}
 
                                    <Text mt='3vh' mb='1vh'  fontWeight={'semibold'} >{t('BusinessConditions')}</Text>
                                    {configDict?.contact_business_filters && <FilterManager excludedFields={['conversations', 'contacts']} filters={configDict?.contact_business_filters} setFilters={(filters) => setConfigDict(prev => ({...prev as any, contact_business_filters:filters}))} operationTypesDict={operationTypesDict} typesMap={typesMap} scrollRef={containerRef}/>}
 
                                </>)

                            case 'functions':
                                return (<>
    
                                    {configDict?.functions_uuids?.length !== 0 && <Flex mb='2vh' gap='15px' alignItems={'center'} justifyContent={'space-between'}> 
                                        <Text   fontWeight={'semibold'} >{t('AvailableFunctions')}</Text>
                                       <Button variant={'main'} minW={0} display={'inline-flex'} leftIcon={<FaPlus/>} isDisabled={configDict?.functions_uuids?.length === functionsData?.length || configUuid === 'new'} onClick={() => setShowAddFunctions(true)} size='sm' >{t('AddFunctions')}</Button>
                                    </Flex>}
                                        {configDict?.functions_uuids?.length === 0 ? 
                                        <Flex  flexDir={'column'}> 
                                            <Box maxW='400px'  > 
                                                <Text fontSize={'.9em'} color='gray.600'>{t('NoFunctionsSelected')}</Text>
                                                <Button mt='3vh' w='100%' variant={'main'} minW={0} display={'inline-flex'} leftIcon={<FaPlus/>} isDisabled={configDict?.functions_uuids.length === functionsData?.length || configUuid === 'new'} onClick={() => setShowAddFunctions(true)} size='sm' >{t('AddFirstFunction')}</Button>
                                            </Box> 
                                        </Flex>
                                        : 
                                            <>
                                            {configDict?.functions_uuids?.map((id, index) => (
                                                <Flex alignItems={'center'} key={`funciton-${index}`}   py='10px' borderBottomColor={'gray.200'} borderBottomWidth={'1px'} borderTopColor={'gray.200'} borderTopWidth={index === 0 ?'1px':''} justifyContent={'space-between'}> 
                                                    <Box  flex='1'  > 
                                                        <Text _hover={{color:'brand.text_blue'}} onClick={() => window.open(`${window.location.origin}/functions/function/${id}`, '_blank')} cursor={'pointer'} fontSize={'.9em'} fontWeight={'medium'}  >{functionsData?.find(element => element.uuid === id)?.name}</Text>
                                                        <Text whiteSpace={'normal'} color='gray.600'fontSize={'.8em'} >{functionsData?.find(element => element.uuid === id)?.description}</Text>
                                                    </Box>
                                                    <IconButton size={'sm'} color={'red.600'} bg='transparent' variant={'delete'} _hover={{bg:'red.100'}} icon={<HiTrash size={'20px'}/>} aria-label="delete-row" onClick={(e) => {e.stopPropagation() ;setDeleteFunctionIndex(index)}}/>
                                                </Flex>
                                            ))} 
                                        </>}
                                        <Box> 
                                         </Box>
                                        { configUuid === 'new' && <Text mt='.5vh' fontSize={'.8em'} color='red'>{t('SaveFunctionWarning')}</Text>}
                                </>)

                            case 'knowledge':
                                return (<>

 
                                    <Flex mb='2vh' gap='15px' alignItems={'center'} justifyContent={'space-between'}> 
                                        <Text   fontWeight={'semibold'} >{t('HelpCentersToUse')}</Text>
                                        {configDict?.help_centers_ids?.length !== 0 && <Button variant={'main'}  leftIcon={<FaPlus/>} isDisabled={configDict?.help_centers_ids?.length === helpCentersData?.length ||  configUuid === 'new'}  onClick={() => setShowAddHelpCenters(true)} size='sm' >{t('AddHelpCenters')}</Button>}
                                    </Flex>

                                    <EditBool title={t('UseHelpCenter')} description={t('UseHelpCenterDes')} value={configDict?.allow_sources || false} setValue={(value) => setConfigDict((prev) => ({...prev as MatildaConfigProps, allow_sources:value}))}/>
                                    <Box mt='2vh'>       
                                        {configDict?.allow_sources && <> 
                                            {configDict?.help_centers_ids?.length === 0 ?   
                                            <Flex  flexDir={'column'}> 
                                                <Box maxW='400px'  > 
                                                    <Text fontSize={'.9em'} color='gray.600'>{t('NoHelpCenterSelected')}</Text>
                                                    <Button variant={'main'} mt='3vh' w='100%' leftIcon={<FaPlus/>} isDisabled={configDict?.help_centers_ids.length === helpCentersData?.length ||  configUuid === 'new'}  onClick={() => setShowAddHelpCenters(true)} size='sm' >{t('AddHelpCenters')}</Button>
                                                </Box> 
                                            </Flex> : 
                                            <>
                                            {configDict?.help_centers_ids?.map((center, index) => (
                                                <Flex alignItems={'center'} key={`help-center-${index}`} py='10px' borderBottomColor={'gray.200'} borderBottomWidth={'1px'} borderTopColor={'gray.200'} borderTopWidth={index === 0 ?'1px':''} justifyContent={'space-between'}> 
                                                    <Box flex='1' > 
                                                        <Text _hover={{color:'brand.text_blue'}} onClick={() => window.open(`${window.location.origin}/settings/help-centers/help-center/${center}`, '_blank')} cursor={'pointer'}  fontSize={'.9em'}  fontWeight={'medium'} >{helpCentersData?.find(element => element.id === center)?.name}</Text>
                                                        <Text color='gray.600'fontSize={'.8em'} >{center}</Text>
                                                    </Box>
                                                    <IconButton size={'sm'} color={'red.600'} bg='transparent' variant={'delete'} _hover={{bg:'red.100'}} icon={<HiTrash size={'20px'}/>} aria-label="delete-row" onClick={() => setDeleteHelpCenterIndex(index)}/>
                                                </Flex>
                                            ))} 
                                        </>
                                        }
                                    
                                         { configUuid === 'new' && <Text mt='.5vh' fontSize={'.8em'} color='red'>{t('SaveHelpCenterWarning')}</Text>}
                                        </>}
                                    </Box>  
                                </>)


                        default: 
                            return <></>
                    }
                            
                })()}
            </Flex>
        <Flex flex='1' alignItems={'center'} justifyContent={'center'}> 
            <Box width='360px' height='650px' onMouseDown={(e) => e.stopPropagation()} bg='white' overflow={'hidden'} borderRadius={'1.5rem'} shadow={'xl'} position={'absolute'}  borderColor='gray.200' borderWidth='7px' zIndex={111}  >
            <TestChat configurationId={configUuid} configurationName={configDict?.name || ''}/>
            </Box>
        </Flex>
    </Flex>


    </>)
}

export default TildaConfig