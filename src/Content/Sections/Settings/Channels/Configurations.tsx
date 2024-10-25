//REACT
import { Dispatch, SetStateAction, useRef, useState, CSSProperties, RefObject, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../../AuthContext"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Flex, Button, NumberInput, NumberInputField, Switch, Icon, Skeleton, Textarea, IconButton, Tooltip, Radio } from "@chakra-ui/react"
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
//COMPONENTS
import EditText from "../../../Components/Reusable/EditText"
import EditStructure from "../../../Components/Reusable/EditStructure"
import ConfirmBox from "../../../Components/Reusable/ConfirmBox"
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
import Table from "../../../Components/Reusable/Table"
//FUNCTIONS
import useOutsideClick from "../../../Functions/clickOutside"
import determineBoxStyle from "../../../Functions/determineBoxStyle"
import parseMessageToBold from "../../../Functions/parseToBold"
//ICONS
import { RxCross2 } from "react-icons/rx"
import { FaPlus } from "react-icons/fa6"
import { IoIosArrowForward } from "react-icons/io"
import { HiTrash } from "react-icons/hi2"
//TYPING
import { MatildaConfigProps, FieldAction, Channels, logosMap, FunctionTableData } from "../../../Constants/typing"
   
//TYPING
interface ConfigProps { 
    uuid:string 
    name:string 
    description:string 
    channels_ids:string[]
}
 
//MAIN FUNCTION
function Configurations ({scrollRef}:{scrollRef:RefObject<HTMLDivElement>}) {

    //AUTH CONSTANT
    const auth = useAuth()
    const { t } = useTranslation('settings')
    
    
    //CONFIG TABLE DATA
    const [configData, setConfigData] = useState<ConfigProps[] | null>(null)

    //CHANNELS BASIC DATA
    const [channelsData, setChannelsData] = useState< {id: string, uuid: string, display_id: string, name: string, channel_type: Channels, is_active: string}[] | null>(null)

    //SELECTED GROUP
    const [selectedIndex, setSelectedIndex] = useState<number>(-2)

    //TRIGGER TO DELETE 
    const [configToDeleteIndex, setConfigToDeleteIndex] = useState<number | null>(null)
    
    //FETCH INITIAL DATA
    useEffect(() => {
        const fetchTriggerData = async () => {
            const response  = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations`, setValue:setConfigData, auth})
            const responseChannels  = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels`, setValue:setChannelsData, auth})
        }
        document.title = `${t('Settings')} - ${t('MatildaConfigs')} - ${auth.authData.organizationName} - Matil`
        fetchTriggerData()
    }, [])

    //FILTER TRIGGER DATA
    const [text, setText] = useState<string>('')
    const [filteredConfigData, setFilteredConfigData] = useState<ConfigProps[]>([])
    useEffect(() => {
        const filterUserData = () => {
            if (configData) {
                const filtered = configData.filter(user =>
                    user.name.toLowerCase().includes(text.toLowerCase()) ||
                    user.description.toLowerCase().includes(text.toLowerCase()) 
                  )
                  setFilteredConfigData(filtered)
            }
        }
        filterUserData()
    }, [text, configData])

    //FUNCTION FOR DELETING THE TRIGGER
    const DeleteComponent = () => {

        //WAITING DELETION
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

        //FUNCTION FOR DELETING AN AUTOMATION
        const deleteTrigger= async () => {
            setWaitingDelete(true)
            const newData = configData?.filter((_, index) => index !== configToDeleteIndex) as ConfigProps[]
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/admin/settings/matilda_configurations/${configData?.[configToDeleteIndex as number]?.uuid}`, method: 'delete', setWaiting: setWaitingDelete, auth, toastMessages: {works: t('CorrectDeletedConfiguration'), failed: t('FailedDeletedConfiguration')}})
            if (response?.status === 200) {
                setConfigData(newData)
                setConfigToDeleteIndex(null)
            }
        }

        //FRONT
        return(<>
            <Box p='20px' > 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ConfirmDelete')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Text >{parseMessageToBold(t('ConfirmDeleteConfig', {name:configData?.[configToDeleteIndex as number].name}))}</Text>
            </Box>
            <Flex bg='gray.50' p='20px' gap='10px' flexDir={'row-reverse'}>
                <Button  size='sm' variant={'delete'} onClick={deleteTrigger}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                <Button  size='sm' variant={'common'}onClick={() => setConfigToDeleteIndex(null)}>{t('Cancel')}</Button>
            </Flex>
        </>)
    }

    //DELETE BOX
    const memoizedDeleteBox = useMemo(() => (
        <ConfirmBox setShowBox={(b:boolean) => setConfigToDeleteIndex(null)}> 
            <DeleteComponent/>
        </ConfirmBox>
    ), [configToDeleteIndex])

    //GET THE CELL STYLES
    const CellStyles = ({column, element}:{column:string, element:any}) => {
        switch (column) {
            case 'name':
            case 'description':
                return <Text whiteSpace={'nowrap'} fontWeight={column === 'name'?'medium':'normal'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>
            case 'channels_ids':
                 const  filteredChannels = channelsData?.filter(channel => element.includes(channel.id)) || []
                return ( <>
                    {filteredChannels.length === 0 ? <Text>-</Text>
                    :<Flex gap='20px'>
                        {filteredChannels.map((channel:{id: string, uuid: string, display_id: string, name: string, channel_type: Channels, is_active: string}, index:number) => ( 
                            <Tooltip key={`channel-${index}`} label={channel.name}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                                <Flex  alignItems={'center'}> 
                                <Icon boxSize={'14px'} as={logosMap[channel.channel_type][0]}/>
                                </Flex>
                            </Tooltip>
                        ))}
                    </Flex>}
                </>)
                
            default:
                return <></>
        }
    }
    

    //FRONT
    return(<>
        {configToDeleteIndex !== null && memoizedDeleteBox}
        {(selectedIndex >= -1 && configData !==  null) ? <GetMatildaConfig configIndex={selectedIndex as number} setConfigIndex={setSelectedIndex}  allConfigs={configData} setAllConfigs={setConfigData} scrollRef={scrollRef}/>:<>
        
        <Box> 
            <Flex justifyContent={'space-between'} alignItems={'end'}> 
                <Box> 
                    <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('MatildaConfigs')}</Text>
                    <Text color='gray.600' fontSize={'.9em'}>{t('MatildaConfigsDes')}</Text>
                </Box>
            </Flex>
            <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='3vh'/>
            <Box width={'350px'}> 
                <EditText value={text} setValue={setText} searchInput={true}/>
            </Box>
            <Flex  mt='2vh' justifyContent={'space-between'} alignItems={'end'}>
                <Skeleton isLoaded={configData !== null && channelsData !== null }> 
                    <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ConfigCount', {count:configData?.length})}</Text>
                </Skeleton>
                <Flex gap='10px'> 
                    <Button size='sm' variant={'common'} leftIcon={<FaPlus/>} onClick={() => {setSelectedIndex(-1)}}>{t('CreateConfig')}</Button>
                </Flex> 
            </Flex>
            <Skeleton isLoaded={configData !== null && channelsData !== null }> 
                <Table data={filteredConfigData} CellStyle={CellStyles} columnsMap={{'name':[t('Name'), 150], 'description':[t('Description'), 350], 'channels_ids':[t('Channels'), 150]}}  excludedKeys={['uuid']} noDataMessage={t('NoConfigs')} onClickRow={(row:any, index:number) => setSelectedIndex(index)} deletableFunction={(row:any, index:number) => setConfigToDeleteIndex(index)}/>  
            </Skeleton>
        </Box>
        </>}
    </>)
}

export default Configurations

const GetMatildaConfig = ({allConfigs, setAllConfigs, configIndex, setConfigIndex, scrollRef}:{allConfigs:ConfigProps[] , setAllConfigs:Dispatch<SetStateAction<ConfigProps[] | null>>, configIndex:number, setConfigIndex:Dispatch<SetStateAction<number>>, scrollRef:RefObject<HTMLDivElement>}) => {

    //TRANSLATION CONSTANT
    const auth = useAuth()
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

    //WAITING BOOLEAN
    const [waitingSend, setWaitingSend] = useState<boolean>(false)
    
   
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
            await fetchData({endpoint:`${auth.authData.organizationId}/admin/help_centers`, auth, setValue:setHelpCentersData})
            await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions`, auth, setValue:setFunctionsData})

            if (configIndex === -1) {
                setConfigDict(newConfig)
                configDictRef.current = newConfig
            }
            else  {
               const response =  await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations/${allConfigs?.[configIndex]?.uuid}`, setValue:setConfigDict, auth})
                if (response?.status === 200) configDictRef.current = response.data
            }
        }
        document.title = `${t('Settings')} - ${t('MatildaConfigs')} - ${auth.authData.organizationName} - Matil`
        fetchInitialData()
    }, [])


    //SELECT EMOJIS
    const emojiBoxRef = useRef<HTMLDivElement>(null)
    const emojiButtonRef = useRef<HTMLButtonElement>(null)
    const [emojiVisible, setEmojiVisible] = useState<boolean>(false)
    useOutsideClick({ref1:emojiBoxRef, ref2:emojiButtonRef, onOutsideClick:setEmojiVisible})

    //BOX POSITION LOGIC, TO SHOW IT UP OR DOWN OF THE INPUT, DEPENDING ON THE POSITION
    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef:emojiButtonRef, setBoxStyle, boxPosition:'right', changeVariable:emojiVisible})

    const handleEmojiClick = (emojiObject: EmojiClickData, event: any) => {
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
    const removeElement = (type: 'all_conditions' | 'any_conditions', index: number ) => {
        setConfigDict((prev) => {
            if (prev) {
                const conditionList = [...prev[type]]
                const updatedConditionList = [...conditionList.slice(0, index), ...conditionList.slice(index + 1)]
                return {...prev, [type]: updatedConditionList}  
            }
            else return prev
        })
    }
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
        if (configIndex === -1) {
            const response =  await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations`, method:'post', requestForm:configDict as MatildaConfigProps, auth, toastMessages:{works:t('CorrectCreatedConfig'), failed:t('FailedCreatedConfig')}})
            if (response?.status === 200 && configDict) {
                setAllConfigs(prev => ([...prev as ConfigProps[], {uuid:response.data.uuid, name:configDict.name, description:configDict.description,channels_ids:configDict.channel_ids}]))
                setConfigIndex(-2)
            }
        }
        else {
            const response =  await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations/${configDict?.uuid}`, method:'put', requestForm:configDict as MatildaConfigProps, auth, toastMessages:{works:t('CorrectEditedConfig'), failed:t('FailedEditedConfig')}})
            if (response?.status === 200 && configDict) {
                configDictRef.current = configDict
                setAllConfigs((prev) => (prev || []).map((config) =>config.uuid === configDict.uuid? {...config, name: configDict.name,description: configDict.description}: config))        
            }
        }
        setWaitingSend(false)
    }

    //ADD HELP CENTER BOX
    const AddHelpCenter = () => {
        const addHelpCenter = async (id:string) => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations/${configDict?.uuid}/help_centers/${id}`, method:'post', auth, toastMessages:{works:t('CorrectAddedHelpCenter'), failed:t('FailedAddedHelpCenter')}})
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
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations/${configDict?.uuid}/functions/${id}`, method:'post', auth, toastMessages:{works:t('CorrectAddedFunction'), failed:t('FailedAddedFunction')}})
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

    //DELETE HELP CENTER COMPONENT
    const DeleteHelpCenterComponent = () => {

        //WAITING DELETION
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

        //FUNCTION FOR DELETING AN AUTOMATION
        const deleteComponent = async () => {
            setWaitingDelete(true)
            const newList = (configDict?.help_centers_ids || [])?.filter((_, index) => index !== deleteHelpCenterIndex)
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/admin/settings/matilda_configurations/${configDict?.uuid}/help_centers/${configDict?.help_centers_ids?.[deleteHelpCenterIndex as number]}`,  method: 'delete', setWaiting: setWaitingDelete, auth, toastMessages: {works: t('CorrectDeletedHelpCenter'), failed: t('FailedDeletedHelpCenter')}})
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
            <Flex bg='gray.50' p='20px' gap='10px' flexDir={'row-reverse'}>
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
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/admin/settings/matilda_configurations/${configDict?.uuid}/functions/${configDict?.functions_uuids?.[deleteFunctionIndex as number]}`,  method: 'delete', setWaiting: setWaitingDelete, auth, toastMessages: {works: t('CorrectDeletedFunction'), failed: t('FailedDeletedFunction')}})
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
            <Flex bg='gray.50' p='20px' gap='10px' flexDir={'row-reverse'}>
                <Button  size='sm' variant={'delete'} onClick={deleteComponent}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                <Button  size='sm' variant={'common'}onClick={() => setDeleteHelpCenterIndex(null)}>{t('Cancel')}</Button>
            </Flex>
        </>)
    }

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

return(   
    <>
    {showAddHelpCenters && memoizedAddHelpCenter}
    {showAddFunctions && memoizedAddFunctions}
    {deleteHelpCenterIndex !== null && memoizedDeleteHelpCenter}
    {deleteFunctionIndex !== null && memoizedDeleteFunction}
    
        <Box> 
            <Flex fontWeight={'medium'} fontSize={'1.4em'} gap='10px' alignItems={'center'}> 
                <Text onClick={() => setConfigIndex(-2)} color='brand.text_blue' cursor={'pointer'}>{t('MatildaConfigs')}</Text>
                <Icon as={IoIosArrowForward}/>
                <Text>{configDict?.name}</Text>
            </Flex>
            <Box width='100%' bg='gray.300' height='1px' mt='2vh'/>
        </Box>

        <Flex flex='1' overflow={'scroll'} pt='3vh' gap='50px'> 
            <Skeleton style={{flex:'1'}} isLoaded={configDict !== null && helpCentersData !== null}> 
            <Text mb='.5vh' fontSize={'1.2em'}  fontWeight={'semibold'}>{t('Name')}</Text>
            <Box maxW='500px'> 
                <EditText  value={configDict?.name || ''} setValue={(value) => {setConfigDict((prev) => ({...prev as MatildaConfigProps, name:value}))}} hideInput={false}/>
            </Box>

            <Text fontSize={'1.2em'} mt='2vh' mb='.5vh'  fontWeight={'semibold'}>{t('Description')}</Text>
            <Textarea maxW={'500px'} resize={'none'} maxLength={2000} height={'auto'} placeholder={`${t('Description')}...`} maxH='300px' value={configDict?.description} onChange={(e) => setConfigDict((prev) => ({...prev as MatildaConfigProps, description:e.target.value}))} p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "brand.text_blue", borderWidth: "2px"}}/>

            <Text fontSize={'1.2em'} mt='3vh'  fontWeight={'semibold'}>{t('TildaMood')}</Text>

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
                    <Text mt='1vh' fontWeight={'medium'}  fontSize={'.9em'}>{t('contact_all_conditions')}</Text>
                    {(configDict?.all_conditions || []).map((condition, index) => (
                            <Flex  key={`all-automation-${index}`} mt='1vh' gap='10px'>
                                <Box flex={'1'}> 
                                    <EditStructure excludedFields={['conversation', 'contact_business'] }  data={condition} setData={(newCondition) => {editElement('all_conditions', index, newCondition)}} scrollRef={scrollRef} operationTypesDict={operationTypesDict} typesMap={typesMap}/>
                                </Box>
                                <IconButton size={'sm'} color={'red.600'} bg='transparent' variant={'delete'} _hover={{bg:'red.100'}} icon={<HiTrash size={'20px'}/>} aria-label="delete-row" onClick={() => removeElement('all_conditions', index)}/>
                            </Flex>
                    ))}
                    <Button mt='1vh' variant={'common'}  leftIcon={<FaPlus/>} size='xs'  onClick={() => addElement('all_conditions')}>{t('AddCondition')}</Button>
                </Box>
                <Box flex='1'> 
                    <Text mt='2vh' fontWeight={'medium'}  fontSize={'.9em'}>{t('contact_any_conditions')}</Text>
                    {(configDict?.any_conditions || []).map((condition, index) => (
                            <Flex  key={`all-automation-${index}`} mt='1vh' gap='10px'>
                                <Box flex={'1'}> 
                                    <EditStructure excludedFields={['conversation', 'contact_business'] } data={condition} setData={(newCondition) => {editElement('any_conditions', index, newCondition)}} scrollRef={scrollRef} operationTypesDict={operationTypesDict} typesMap={typesMap}/>
                                </Box>
                                <IconButton size={'sm'} color={'red.600'} bg='transparent' variant={'delete'} _hover={{bg:'red.100'}} icon={<HiTrash size={'20px'}/>} aria-label="delete-row" onClick={() => removeElement('any_conditions', index)}/>
                            </Flex>
                    ))}
                    <Button mt='1vh' variant={'common'}  leftIcon={<FaPlus/>} size='xs'  onClick={() => addElement('any_conditions')}>{t('AddCondition')}</Button>  
                </Box>
 
            </Skeleton>
            <Skeleton style={{flex:'1'}} isLoaded={configDict !== null && helpCentersData !== null}>
                <Text fontSize={'1.2em'}  fontWeight={'semibold'}>{t('Knowledge')}</Text>
                <Flex gap='10px' mt='2vh' alignItems={'center'}>
                    <Switch isChecked={configDict?.allow_sources} onChange={(e) => handleCheckboxChange('allow_sources', e.target.checked)}/>
                    <Text fontWeight={'medium'}>{t('UseHelpCenter')}</Text>
                </Flex>
                <Text fontSize={'.8em'} color='gray.600'>{t('UseHelpCenterDes')}</Text>
                <Text  mt='2vh' mb='2vh' fontWeight={'medium'}  >{t('HelpCentersToUse')}</Text>
                    {helpCentersData?.length === 0 ? <Text>{t('NoHelpCenters')}</Text> : 
                    <>
                    {configDict?.help_centers_ids?.map((center, index) => (
                        <Flex alignItems={'center'} key={`help-center-${index}`} py='10px' borderBottomColor={'gray.200'} borderBottomWidth={'1px'} borderTopColor={'gray.200'} borderTopWidth={index === 0 ?'1px':''} justifyContent={'space-between'}> 
                            <Box flex='1' > 
                                <Text  fontSize={'.9em'}  fontWeight={'medium'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{helpCentersData?.find(element => element.id === center)?.name}</Text>
                                <Text color='gray.600'fontSize={'.8em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{center}</Text>
                            </Box>
                            <IconButton size={'sm'} color={'red.600'} bg='transparent' variant={'delete'} _hover={{bg:'red.100'}} icon={<HiTrash size={'20px'}/>} aria-label="delete-row" onClick={() => setDeleteHelpCenterIndex(index)}/>
                        </Flex>
                    ))} 
                </>
                }
                <Button variant={'common'} leftIcon={<FaPlus/>} isDisabled={configDict?.help_centers_ids.length === helpCentersData?.length}  onClick={() => setShowAddHelpCenters(true)} size='sm' mt='2vh'>{t('AddHelpCenters')}</Button>

                <Text mt='3vh' mb='2vh' fontWeight={'medium'} >{t('AvailableFunctions')}</Text>
                {configDict?.functions_uuids?.length === 0 ? <Text>{t('NoFunctions')}</Text> : 
                    <>
                    {configDict?.functions_uuids?.map((id, index) => (
                        <Flex alignItems={'center'} key={`funciton-${index}`} py='10px' borderBottomColor={'gray.200'} borderBottomWidth={'1px'} borderTopColor={'gray.200'} borderTopWidth={index === 0 ?'1px':''} justifyContent={'space-between'}> 
                            <Box  flex='1' > 
                                <Text fontSize={'.9em'} fontWeight={'medium'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{functionsData?.find(element => element.uuid === id)?.name}</Text>
                                <Text color='gray.600'fontSize={'.8em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{functionsData?.find(element => element.uuid === id)?.description}</Text>
                            </Box>
                            <IconButton size={'sm'} color={'red.600'} bg='transparent' variant={'delete'} _hover={{bg:'red.100'}} icon={<HiTrash size={'20px'}/>} aria-label="delete-row" onClick={() => setDeleteFunctionIndex(index)}/>
                        </Flex>
                    ))} 
                </>}
                <Button variant={'common'} leftIcon={<FaPlus/>} isDisabled={configDict?.functions_uuids.length === functionsData?.length} onClick={() => setShowAddFunctions(true)} size='sm' mt='2vh'>{t('AddFunctions')}</Button>

            </Skeleton>

        </Flex>

        <Box> 
            <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='2vh'/>
            <Flex flexDir={'row-reverse'}> 
                <Button variant={'common'} onClick={saveConfig} isDisabled={configDict?.name === ''  || ((JSON.stringify(configDict) === JSON.stringify(configDictRef.current)))}>{waitingSend?<LoadingIconButton/>:t('SaveChanges')}</Button> 
            </Flex>
        </Box>
    </>)
}

