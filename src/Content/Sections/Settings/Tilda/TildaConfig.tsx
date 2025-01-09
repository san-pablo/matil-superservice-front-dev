//REACT
import { useRef, useState, CSSProperties, RefObject, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../../AuthContext"
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { motion, isValidMotionProp } from 'framer-motion'
import { Text, Box, Flex, Button, NumberInput, NumberInputField, Switch, Icon, Skeleton, Textarea, IconButton, Portal, chakra, shouldForwardProp,Tooltip } from "@chakra-ui/react"
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
//COMPONENTS
import EditText from "../../../Components/Reusable/EditText"
import EditStructure from "../../../Components/Reusable/EditStructure"
import ConfirmBox from "../../../Components/Reusable/ConfirmBox"
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
import TestChat from "./TestChat"
//FUNCTIONS
import useOutsideClick from "../../../Functions/clickOutside"
import determineBoxStyle from "../../../Functions/determineBoxStyle"
import parseMessageToBold from "../../../Functions/parseToBold"
//ICONS
import { RxCross2 } from "react-icons/rx"
import { FaPlus } from "react-icons/fa6"
import { PiChatsBold } from "react-icons/pi"
import { HiTrash } from "react-icons/hi2"
import { IoIosArrowBack } from "react-icons/io"
//TYPING
import { MatildaConfigProps, FieldAction, FunctionTableData } from "../../../Constants/typing"
import { useLocation, useNavigate } from "react-router-dom"
 
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

const TildaConfig = ({scrollRef}:{scrollRef:RefObject<HTMLDivElement>}) => {

    //TRANSLATION CONSTANT
    const auth = useAuth()
    const location = useLocation().pathname
    const navigate = useNavigate()
    const {  getAccessTokenSilently } = useAuth0()
    const { t } = useTranslation('settings')
    const operationTypesDict = {'user_id':['eq', 'neq',  'exists'], 'group_id':['eq', 'neq',  'exists'], 'channel_type':['eq', 'neq', 'exists'], 'title':['eq', 'neq', 'exists'], 'theme':['eq', 'neq', 'exists'], 'urgency_rating':['eq', 'neq', 'leq', 'geq', 'exists'], 'status':['eq', 'neq'], 'unseen_changes':['eq', 'exists'], 'tags':['contains', 'ncontains', 'exists'], 'is_matilda_engaged':['eq', 'exists'],'is_csat_offered':['eq', 'exists'],
    'contact_business_id':['eq', 'neq',  'exists'], 'name':['eq', 'neq', 'contains', 'ncontains', 'exists'], 'language':['eq', 'neq',  'exists'], 'rating':['eq','neq', 'leq', 'geq', 'exists'], 'notes':['eq', 'neq', 'contains', 'ncontains', 'exists'], 'labels':['contains', 'ncontains', 'exists'],
    'domain':['eq', 'neq', 'contains', 'ncontains', 'exists'], 'hours_since_created':['eq', 'neq', 'leq', 'geq',  'exists'], 'hours_since_updated':['eq', 'neq', 'leq', 'geq',   'exists']
    }
    const typesMap = {'bool':['eq', 'exists'], 'int':['eq','neq', 'leq', 'geq', 'exists'], 'float':['eq','neq', 'leq', 'geq', 'exists'],'str': ['eq', 'neq', 'contains', 'ncontains', 'exists'], 'timestamp':['eq', 'neq', 'leq', 'geq',  'exists']}

    const newConfig:MatildaConfigProps = {
        uuid:'',
        name:t('NewConfig'),
        description:t('NewConfig'),

        base_system_prompt:'', 
        introduce_assistant:true, 
        assistant_name:'Tilda', 

        tone: '',
        allowed_emojis: [],
        allow_agent_transfer:true,
        business_hours_agent_transfer_message:'',
        non_business_hours_agent_transfer_message:'',
        allow_sources:true, 
        help_center_id:'', 
        all_conditions: [],
        any_conditions: [],

        delay_response:false,
        minimum_seconds_to_respond: 0,
        maximum_seconds_to_respond: 5,

        channel_ids:[],
        functions_uuids:[],
        help_centers_ids:[]
    }

    const configUuid:string = location.split('/')[location.split('/').length - 1]

    //WAITING BOOLEAN
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    const [showDelete, setShowDelete] = useState<boolean>(false)
    const [testConfigId, setTestConfigId] = useState<{id:string, name:string} | null>(null)

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
  
    const addElement = (type: 'all_conditions' | 'any_conditions') => {
        const newElement = {motherstructure:'contact', is_customizable:false, name:'name', op:'eq', value:''}
       setConfigDict((prev) => {
            if (prev) return { ...prev , [type]: [...prev?.[type] || [], newElement]}
            else return prev
        })
    }
    //DELETE A CONDITION OR AN ACTION
    const removeElement = (type: 'all_conditions' | 'any_conditions', index: number) => {
        setConfigDict((prev) => {
            if (!prev) return prev; // Si no hay estado previo, simplemente lo devolvemos
    
            return {
                ...prev, // Copiar el estado previo
                [type]: prev[type].filter((_, i) => i !== index), // Crear una nueva lista sin el elemento en `index`
            };
        });
    };
    
    //EDIT A CONDITION OR AN ACTION
    const editElement = (type:'all_conditions' | 'any_conditions' , index:number, updatedCondition:FieldAction) => {
       setConfigDict((prev) => {
            if (prev) {
                const lastConditionList = [...prev[type]]
                const updatedConditionList = [...lastConditionList.slice(0, index), updatedCondition, ...lastConditionList.slice(index + 1)]
                return {...prev, [type]: updatedConditionList}
            }
            else return prev
        })
    }

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

        const filteredHelpCenters = (helpCentersData || []).filter(helpCenter => {return !configDict?.help_centers_ids.some(id => id === helpCenter.id)})
        return (<> 
            <Box p='20px' > 
                <Text  fontSize='1.4em' fontWeight={'medium'}>{t('AddConfig')}</Text>
            </Box>
            <Box p='20px'  overflow={'scroll'} flexDir={'row-reverse'}  borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                {filteredHelpCenters?.length === 0 ? <Text>{t('NoAvailableHelpCenters')}</Text>:<>
                {filteredHelpCenters.map((cha, index) => (
                    <Box cursor={'pointer'} _hover={{bg:'brand.blue_hover'}} p='10px' borderRadius={'.7rem'} key={`add-channel-${index}`} onClick={() => addHelpCenter(cha.id)} > 
                        <Text   minWidth={0}  fontWeight={'medium'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{cha.name}</Text>
                        <Text  color='gray.600'fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{cha.id}</Text>
                    </Box>
                ))}</>}
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

        const filteredFunctions = (functionsData || []).filter(func => {return !configDict?.functions_uuids.some(id => id === func.uuid)})
        return (<> 
            <Box p='20px' > 
                <Text  fontSize='1.4em' fontWeight={'medium'}>{t('AddConfig')}</Text>
            </Box>
            <Box p='20px'  overflow={'scroll'} flexDir={'row-reverse'}  borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                {filteredFunctions?.length === 0 ? <Text>{t('NoFunctions')}</Text>:<>
                {filteredFunctions.map((cha, index) => (
                    <Box cursor={'pointer'} _hover={{bg:'brand.blue_hover'}} p='10px' borderRadius={'.7rem'} key={`add-channel-${index}`} onClick={() => addFunction(cha.uuid)} > 
                        <Text   minWidth={0}  fontWeight={'medium'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{cha.name}</Text>
                        <Text  color='gray.600'fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{cha.description}</Text>
                    </Box>
                ))}</>}
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
            <Box p='20px' > 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ConfirmDelete')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Text >{parseMessageToBold(t('ConfirmDeleteHelpCenter', {name:helpCentersData?.find(element => element.id === configDict?.help_centers_ids?.[deleteHelpCenterIndex as number])?.name}))}</Text>
            </Box>
            <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
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
            <Box p='20px' > 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ConfirmDelete')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Text >{parseMessageToBold(t('ConfirmDeleteFunction', {name:functionsData?.find(element => element.uuid === configDict?.functions_uuids?.[deleteFunctionIndex as number])?.name}))}</Text>
            </Box>
            <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                <Button  size='sm' variant={'delete'} onClick={deleteComponent}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                <Button  size='sm' variant={'common'}onClick={() => setDeleteHelpCenterIndex(null)}>{t('Cancel')}</Button>
            </Flex>
        </>)
    }

    //DELETE HELP CENTER COMPONENT
    const DeleteConfigComponent = () => {

        //WAITING DELETION
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

        //FUNCTION FOR DELETING AN AUTOMATION
        const deleteFunction= async () => {
            setWaitingDelete(true)
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/admin/settings/matilda_configurations/${configDict?.uuid}`,  getAccessTokenSilently, method: 'delete', setWaiting: setWaitingDelete, auth, toastMessages: {works: t('CorrectDeletedConfiguration'), failed: t('FailedDeletedConfiguration')}})
            setWaitingDelete(false)
            if (response?.status === 200) {
                navigate('/settings/tilda/all-configs')
            }
            else setShowDelete(false)
        }

        //FRONT
        return(<>
            <Box p='20px' > 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ConfirmDelete')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Text >{parseMessageToBold(t('ConfirmDeleteConfiguration', {name:configDict?.name}))}</Text>
            </Box>
            <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                <Button  size='sm' variant={'delete'} onClick={deleteFunction}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                <Button  size='sm' variant={'common'}onClick={() => setDeleteHelpCenterIndex(null)}>{t('Cancel')}</Button>
            </Flex>
        </>)
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

return(   
    <>
    {testConfigId && memoizedTestChat}

    {showAddHelpCenters && memoizedAddHelpCenter}
    {showAddFunctions && memoizedAddFunctions}
    {deleteHelpCenterIndex !== null && memoizedDeleteHelpCenter}
    {deleteFunctionIndex !== null && memoizedDeleteFunction}
    {showDelete && memoizedDeleteConfig}

    
    <Flex flexDir={'column'}  position='absolute' width={'calc(100vw - 55px)'} height={'100vh'} top={0} left={0} bg='white'>

        <Flex px='2vw' gap='2vw' height={'70px'} alignItems={'center'} justifyContent={'space-between'}  borderBottomWidth={'1px'} borderBottomColor={'gray.200'}>
            <Flex flex={1} gap='20px' alignItems={'center'}> 
                <Tooltip label={t('GoBack')}  placement='bottom' hasArrow bg='black'  color='white'  borderRadius='.4rem' fontSize='.75em' p='4px'> 
                    <IconButton aria-label='go-back' size='sm' variant={'common'} bg='transparent' onClick={onExitAction} icon={<IoIosArrowBack size='20px'/>}/>
                </Tooltip>
                <EditText  placeholder={t('name')}  value={configDict?.name} setValue={(value) => setConfigDict(prev => ({...prev as MatildaConfigProps, name:value}))} className={'title-textarea-collections'}/>

            </Flex>

            <Flex gap='15px'>
                {configUuid !== 'new'  && <Button leftIcon={<HiTrash/>} variant={'delete'} size='sm' onClick={() => setShowDelete(true)}>{t('Delete')}</Button>}
                {configUuid !== 'new' && <Button leftIcon={<PiChatsBold/>}  onClick={(e) => {e.stopPropagation();setTestConfigId({id:configDict?.uuid || '', name:configDict?.name || ''})}} size='sm' variant={'main'}>{t('TestChat')}</Button>}  
                <Button variant={configUuid !== 'new'?'main':'common'} size='sm' onClick={saveConfig} isDisabled={configDict?.name === ''  || ((JSON.stringify(configDict) === JSON.stringify(configDictRef.current)))}>{waitingSend?<LoadingIconButton/>:configUuid === 'new'? t('CreateConfig'):t('SaveChanges')}</Button> 
            </Flex>
        </Flex>
        <Flex flex='1' pb='5vh' p='2vw' overflow={'scroll'}  width={'100%'}>
                
            <Skeleton style={{ flex: 1}} isLoaded={configDict !== null && helpCentersData !== null}> 
              
            <Box pb='5vh' > 
                <Text fontSize={'1.2em'} mb='.5vh'  fontWeight={'semibold'}>{t('Description')}</Text>
                <Textarea maxW={'500px'} resize={'none'} maxLength={2000} height={'auto'} placeholder={`${t('Description')}...`} maxH='300px' value={configDict?.description} onChange={(e) => setConfigDict((prev) => ({...prev as MatildaConfigProps, description:e.target.value}))} p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "brand.text_blue", borderWidth: "2px"}}/>

                <Text fontSize={'1.2em'} mt='3vh'  fontWeight={'semibold'}>{t('TildaMood')}</Text>

                <Flex gap='10px' mt='1vh' alignItems={'center'}>
                    <Switch isChecked={configDict?.introduce_assistant} onChange={(e) => handleCheckboxChange('introduce_assistant', e.target.checked)}/>
                    <Text fontWeight={'medium'}>{t('IntroduceAssitant')}</Text>
                </Flex>
                <Text fontSize={'.8em'} color='gray.600'>{t('IntroduceAssitantDes')}</Text>


                {configDict?.introduce_assistant && <> 
                <Text fontSize={'.9em'} mt='1vh' fontWeight={'medium'}>{t('AssitantName')}</Text>
                <Text fontSize={'.8em'} mb='.5vh' color='gray.600'>{t('AssitantNameDes')}</Text>
                <Box maxW='500px'> 
                    <EditText placeholder={`${t('AssitantName')}...`}  hideInput={false} value={configDict?.assistant_name}  setValue={(value) => setConfigDict(prev => ({ ...prev as MatildaConfigProps, 'assistant_name': value }))}/>
                </Box></>}

                <Text fontSize={'.9em'} mt='1vh' fontWeight={'medium'}>{t('Tone')}</Text>
                <Text fontSize={'.8em'} mb='.5vh' color='gray.600'>{t('ToneDes')}</Text>
                <Box maxW='500px'> 
                    <EditText placeholder={`${t('Tone')}...`} hideInput={false} value={configDict?.tone}  setValue={(value) => setConfigDict(prev => ({ ...prev as MatildaConfigProps, 'tone': value }))}/>
                </Box>

                <Text fontSize={'.9em'} mt='2vh' fontWeight={'medium'}>{t('Prompt')}</Text>
                <Text fontSize={'.8em'} mb='.5vh' color='gray.600'>{t('PromptDes')}</Text>
                <Textarea maxW={'500px'} resize={'none'} maxLength={2000} height={'auto'} placeholder={`${t('Description')}...`} maxH='300px' value={configDict?.base_system_prompt} onChange={(e) => setConfigDict((prev) => ({...prev as MatildaConfigProps, base_system_prompt:e.target.value}))} p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "brand.text_blue", borderWidth: "2px"}}/>
                    
                <Text mt='2vh' fontSize={'.9em'} fontWeight={'medium'}>{t('AvailableEmojis')}</Text>
                <Text fontSize={'.8em'} color='gray.600'>{t('AddEmojiDes')}</Text>
                <Flex maxH='20vh' overflow={'scroll'} wrap={'wrap'} py='5px' gap='7px' mt='.5vh'>
                    {(configDict?.allowed_emojis || []).map((emoji, index) => (
                        <EmojiComponent key={`emoji-${index}`} emoji={emoji} index={index}/>
                    ))}
                    </Flex>
                    <Button ref={emojiButtonRef} onClick={() => setEmojiVisible(!emojiVisible)} variant={'common'} size='xs' mt='1vh' leftIcon={<FaPlus/>}>{t('AddEmoji')}</Button>
                <Box position={'fixed'} pointerEvents={emojiVisible?'auto':'none'} marginTop={'10px'} marginBottom={'10px'} top={boxStyle.top} bottom={boxStyle.bottom}right={boxStyle.right}  transition='opacity 0.2s ease-in-out' opacity={emojiVisible ? 1:0} zIndex={1000} ref={emojiBoxRef}> 
                    <EmojiPicker onEmojiClick={handleEmojiClick}  open={emojiVisible} allowExpandReactions={false}/>
                </Box>

                <Text fontSize={'1.2em'} mt='3vh'  fontWeight={'semibold'}>{t('Instructions')}</Text>
                <Flex gap='10px' mt='1vh' alignItems={'center'}>
                    <Switch isChecked={configDict?.allow_agent_transfer} onChange={(e) => handleCheckboxChange('allow_agent_transfer', e.target.checked)}/>
                    <Text fontWeight={'medium'}>{t('AllowAgentTransfer')}</Text>
                </Flex>
                {configDict?.allow_agent_transfer && 
                <Box maxW={'500px'}>
                    <Text mb='.5vh' fontSize={'.9em'} mt='1vh' fontWeight={'medium'}>{t('BusinessHourMessage')}</Text>
                    <EditText placeholder={`${t('Message')}...`} hideInput={false} value={configDict?.business_hours_agent_transfer_message} setValue={(value) => setConfigDict(prev => ({ ...prev as MatildaConfigProps, 'business_hours_agent_transfer_message': value }))} />
                    <Text mb='.5vh' fontSize={'.9em'} mt='1vh' fontWeight={'medium'}>{t('NotBusinessHourMessage')}</Text>
                    <EditText placeholder={`${t('Message')}...`} hideInput={false} value={configDict?.non_business_hours_agent_transfer_message} setValue={(value) => setConfigDict(prev => ({ ...prev as MatildaConfigProps, 'non_business_hours_agent_transfer_message': value }))} />
                </Box>}

                <Flex gap='10px' mt='2vh' alignItems={'center'}>
                    <Switch isChecked={!configDict?.delay_response} onChange={(e) => handleCheckboxChange('delay_response', !e.target.checked)}/>
                    <Text fontWeight={'medium'}>{t('AnswerInmediatly')}</Text>
                </Flex>
                <Text fontSize={'.8em'} color='gray.600'>{t('AnswerInmediatlyDes')}</Text>

                {configDict?.delay_response && 
                    <Flex gap='20px' mt='1vh'> 
                        <Box> 
                            <Text fontWeight={'medium'} fontSize={'.9em'}>{t('minimum_seconds_to_respond')}</Text>
                            <NumberInput size='sm' mt='.5vh' value={configDict?.minimum_seconds_to_respond || 0}  onChange={(valueString) => setConfigDict(prev => ({ ...prev as MatildaConfigProps, 'minimum_seconds_to_respond': parseInt(valueString)}))} min={0} max={configDict.maximum_seconds_to_respond}>
                                <NumberInputField  fontSize={'.9em'} borderRadius='.5rem'   borderColor={'gray.300'} _hover={{ border: '1px solid #CBD5E0' }} _focus={{ borderColor: 'brand.text_blue', borderWidth: '2px', px:'6px' }} px='7px' />
                            </NumberInput>
                        </Box>
                        <Box>
                            <Text fontSize={'.9em'} fontWeight={'medium'}  >{t('maximum_seconds_to_respond')}</Text>
                            <NumberInput size='sm' mt='.5vh' value={configDict?.maximum_seconds_to_respond || 0} onChange={(valueString) => setConfigDict(prev => ({ ...prev as MatildaConfigProps, 'maximum_seconds_to_respond': parseInt(valueString)}))}  min={configDict.minimum_seconds_to_respond} max={14400}>
                                <NumberInputField fontSize={'.9em'} borderRadius='.5rem'   borderColor={'gray.300'} _hover={{ border: '1px solid #CBD5E0' }} _focus={{ borderColor: 'brand.text_blue', borderWidth: '2px', px:'6px' }} px='7px' />
                            </NumberInput>
                        </Box>
                    </Flex>}
                    

                <Text mt='2vh' fontWeight={'medium'} >{t('ContactConditions')}</Text>
         
                <Box flex='1'> 
                    <Text mt='2vh' fontSize={'.9em'} fontWeight={'medium'}>{t('contact_all_conditions')}</Text>

                    <Flex flexWrap={'wrap'} gap='10px' mt='1vh'> 
                        {configDict?.all_conditions.map((condition, index) => (<> 
                            <Flex alignItems={'center'}  key={`all-automation-${index}`}  gap='10px'>
                                <Box flex={'1'}> 
                                    <EditStructure excludedFields={['conversation', 'contact_business']} deleteFunc={() => removeElement('all_conditions', index)} typesMap={typesMap} data={condition} setData={(newCondition) => {editElement('all_conditions', index, newCondition)}} scrollRef={scrollRef} operationTypesDict={operationTypesDict}/>
                                </Box>
                            </Flex>
                            {index < configDict?.all_conditions.length -1 && <Flex bg='brand.gray_2' p='7px' borderRadius={'.5rem'} fontWeight={'medium'}>{t('AND')}</Flex>}
                        </>))}
                        <IconButton variant={'common'} aria-label='add' icon={<FaPlus/>} size='sm'  onClick={() => addElement('all_conditions')}/>

                    </Flex>
                </Box>

                <Box flex='1'> 
                    <Text  mt='2vh'  fontSize={'.9em'}  fontWeight={'medium'}>{t('contact_any_conditions')}</Text>

                    <Flex flexWrap={'wrap'} gap='10px' mt='1vh'> 

                    {configDict?.any_conditions.map((condition, index) => (<> 
                        <Flex  alignItems={'center'} key={`any-automation-${index}`} gap='10px'>
                            <Box flex={'1'}> 
                                <EditStructure excludedFields={['conversation', 'contact_business']} deleteFunc={() => removeElement('any_conditions', index)} typesMap={typesMap} data={condition} setData={(newCondition) => {editElement('any_conditions', index, newCondition)}} scrollRef={scrollRef} operationTypesDict={operationTypesDict}/>
                            </Box>
                        </Flex>
                        {index < configDict?.any_conditions.length -1 && <Flex bg='brand.gray_2' p='7px' borderRadius={'.5rem'} fontWeight={'medium'}>{t('OR')}</Flex>}
                        </>
                    ))}
                    <IconButton variant={'common'} aria-label='add' icon={<FaPlus/>} size='sm'  onClick={() => addElement('any_conditions')}/>
                    </Flex>
                </Box>

                </Box>
            </Skeleton>
            <Skeleton style={{ flex: 1}} isLoaded={configDict !== null && helpCentersData !== null}>
                
                <Text fontSize={'1.2em'}   fontWeight={'semibold'}>{t('Knowledge')}</Text>

                <Text  mt='2vh' mb='2vh' fontWeight={'medium'} >{t('AvailableFunctions')}</Text>
                {configDict?.functions_uuids?.length === 0 ? <Text>{t('NoFunctions')}</Text> : 
                    <>
                    {configDict?.functions_uuids?.map((id, index) => (
                        <Flex alignItems={'center'} key={`funciton-${index}`} py='10px' borderBottomColor={'gray.200'} borderBottomWidth={'1px'} borderTopColor={'gray.200'} borderTopWidth={index === 0 ?'1px':''} justifyContent={'space-between'}> 
                            <Box  flex='1'  > 
                                <Text fontSize={'.9em'} fontWeight={'medium'} >{functionsData?.find(element => element.uuid === id)?.name}</Text>
                                <Text whiteSpace={'normal'} color='gray.600'fontSize={'.8em'} >{functionsData?.find(element => element.uuid === id)?.description}</Text>
                            </Box>
                            <IconButton size={'sm'} color={'red.600'} bg='transparent' variant={'delete'} _hover={{bg:'red.100'}} icon={<HiTrash size={'20px'}/>} aria-label="delete-row" onClick={() => setDeleteFunctionIndex(index)}/>
                        </Flex>
                    ))} 
                </>}
                <Button variant={'common'} leftIcon={<FaPlus/>} isDisabled={configDict?.functions_uuids.length === functionsData?.length || configUuid === 'new'} onClick={() => setShowAddFunctions(true)} size='sm' mt='2vh'>{t('AddFunctions')}</Button>
                { configUuid === 'new' && <Text mt='.5vh' fontSize={'.8em'} color='red'>{t('SaveFunctionWarning')}</Text>}


                 <Flex gap='10px' mt='3vh' alignItems={'center'}>
                    <Switch isChecked={configDict?.allow_sources} onChange={(e) => handleCheckboxChange('allow_sources', e.target.checked)}/>
                    <Text fontWeight={'medium'}>{t('UseHelpCenter')}</Text>
                </Flex>
                <Text fontSize={'.8em'} color='gray.600'>{t('UseHelpCenterDes')}</Text>


                {configDict?.allow_sources && <> 
                <Text  mt='2vh' mb='2vh' fontWeight={'medium'}  >{t('HelpCentersToUse')}</Text>
                    {configDict?.help_centers_ids?.length === 0 ? <Text>{t('NoHelpCenters')}</Text> : 
                    <>
                    {configDict?.help_centers_ids?.map((center, index) => (
                        <Flex alignItems={'center'} key={`help-center-${index}`} py='10px' borderBottomColor={'gray.200'} borderBottomWidth={'1px'} borderTopColor={'gray.200'} borderTopWidth={index === 0 ?'1px':''} justifyContent={'space-between'}> 
                            <Box flex='1' > 
                                <Text  fontSize={'.9em'}  fontWeight={'medium'} >{helpCentersData?.find(element => element.id === center)?.name}</Text>
                                <Text color='gray.600'fontSize={'.8em'} >{center}</Text>
                            </Box>
                            <IconButton size={'sm'} color={'red.600'} bg='transparent' variant={'delete'} _hover={{bg:'red.100'}} icon={<HiTrash size={'20px'}/>} aria-label="delete-row" onClick={() => setDeleteHelpCenterIndex(index)}/>
                        </Flex>
                    ))} 
                </>
                }
                <Button variant={'common'} leftIcon={<FaPlus/>} isDisabled={configDict?.help_centers_ids.length === helpCentersData?.length ||  configUuid === 'new'}  onClick={() => setShowAddHelpCenters(true)} size='sm' mt='2vh'>{t('AddHelpCenters')}</Button>
                { configUuid === 'new' && <Text mt='.5vh' fontSize={'.8em'} color='red'>{t('SaveHelpCenterWarning')}</Text>}
                </>}

            </Skeleton>

        </Flex>

    </Flex>
       
    </>)
}

export default TildaConfig