//REACT
import { useEffect, useRef, useState, useMemo, Fragment, ReactNode, Dispatch, SetStateAction } from "react"
import { useAuth } from "../../../AuthContext"
import { useTranslation } from "react-i18next"
import { useSession } from "../../../SessionContext"
import { useLocation, useNavigate } from "react-router-dom"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { motion, isValidMotionProp, AnimatePresence } from 'framer-motion'
import { Text, Box, Flex, Button, Textarea, Skeleton, Tooltip, IconButton, chakra, shouldForwardProp, Icon, Switch, Radio, Spinner } from "@chakra-ui/react"
//PYTHON CODE EDITOR
import CodeMirror from "@uiw/react-codemirror"
import { python } from "@codemirror/lang-python"
import { oneDark } from "@codemirror/theme-one-dark"
//COMPONENTS
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import EditText from "../../Components/Reusable/EditText"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import CustomSelect from "../../Components/Reusable/CustomSelect"
import SectionSelector from "../../Components/Reusable/SectionSelector"
import VariableTypeChanger from "../../Components/Reusable/VariableTypeChanger"
import IconsPicker from "../../Components/Reusable/IconsPicker"
import '../../Components/styles.css'
//FUNCTIONS
import copyToClipboard from "../../Functions/copyTextToClipboard"
import useOutsideClick from "../../Functions/clickOutside"
import parseMessageToBold from "../../Functions/parseToBold"
//ICONS
import { IconType } from "react-icons"

import { FaPlus, FaCircleExclamation ,FaCircleQuestion, FaCircleDot, FaCode  } from "react-icons/fa6"
import { FaCheckCircle, FaTimesCircle, FaEdit } from "react-icons/fa"
import { IoIosArrowDown, IoIosArrowBack,  } from "react-icons/io"
import { IoWarning, IoSettingsSharp } from "react-icons/io5"
import { BsTrash3Fill, BsClipboard2Check } from "react-icons/bs"
import { RxCross2 } from "react-icons/rx"
import { PiSidebarSimpleBold } from "react-icons/pi"
import { AiOutlineCheckCircle, AiOutlineCalendar } from "react-icons/ai"
import { MdOutlineFormatListBulleted } from "react-icons/md"
import { FiHash, FiType } from "react-icons/fi"
import { TbMathFunction } from "react-icons/tb"
import { HiTrash } from "react-icons/hi2"
//TYPING
import { FunctionsData, FunctionTableData, ConfigProps } from "../../Constants/typing"
import { useAuth0 } from "@auth0/auth0-react"
//COMPONENTS
import Tilda from "./Tilda"
  
const tryData = {is_active:false, uuid:'', icon:'',name:'Hola', description:'Hola'}

const TildaMain = () => {
    const { t } = useTranslation('settings')
    const location = useLocation().pathname

    const scrollRef = useRef<HTMLDivElement>(null)
    const [currentSection, setCurrentSection] = useState<'functions' | 'configurations'>('functions')

    //CREATE NEW FUNCTION OR EDITING ONE
    const [editFunctionUuid, setEditFunctionUuid] = useState<string | null>(location.split('/')[2] ? location.split('/')[2]: null)

    //TILDA DATA
    const [configData, setConfigData] = useState<ConfigProps[] | null>(null)
    const [selectedIndex, setSelectedIndex] = useState<number>(-2)

    return (<> 
        <Flex flexDir={'column'} height={'100vh'} width={'calc(100vw - 55px)'}  p='2vw'> 
            <Box> 
                <Flex justifyContent={'space-between'} alignItems={'end'}> 
                    <Box> 
                        <Text mb='2vh' fontSize={'1.4em'} fontWeight={'medium'}>{t('WebConfig')}</Text>
                        <SectionSelector selectedSection={currentSection} sections={['functions','configurations']} sectionsMap={{'functions':[t('functions'), <FaCode/>],'configurations':[t('configurations'), <IoSettingsSharp/>]}} onChange={(section) => setCurrentSection(section)}/>
                    </Box>
                    <Flex gap='12px'>
                        {currentSection === 'functions' ?
                        <Button size='sm' variant={'main'} leftIcon={<FaPlus/>} onClick={() => setEditFunctionUuid('-1')}>{t('CreateFunction')}</Button>
                    :
                        <Button size='sm' variant={'main'} leftIcon={<FaPlus/>} onClick={() => {setSelectedIndex(-1)}}>{t('CreateConfig')}</Button>

                    }
                     </Flex>
                </Flex>
                <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh'  />
            </Box>
            <Box ref={scrollRef}  style={{paddingBottom:'3vh', paddingTop:'3vh', flex:1, overflow:'scroll'}}> 
                {currentSection === 'functions' ? <Functions editFunctionUuid={editFunctionUuid} setEditFunctionUuid={setEditFunctionUuid}/>:<Tilda configData={configData} setConfigData={setConfigData} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} scrollRef={scrollRef}/>}
            </Box>
        </Flex>

     </>)
}

export default TildaMain

 
//TYPING  
interface FunctionResultType {
    run_successful:boolean
    result:{outputs:{[key:string]:string}, motherstructure_updates:{[key:string]:string}, errors:{message: string, line: number, timestamp: string, arguments: {name: string, type: string, value: any}[]}[]}
    error_message:string 
    error_line:number
}
  
type parameterType = {confirm: boolean, description:string, name: string, required: boolean, type: string, default:any, enum:any[]}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//MAIN FUNCTION
const Functions = ({editFunctionUuid, setEditFunctionUuid}:{editFunctionUuid:string | null, setEditFunctionUuid:Dispatch<SetStateAction<string | null>>}) => {

    //CONSTANTS
    const { t } = useTranslation('settings')
    const { getAccessTokenSilently } = useAuth0()
    const auth = useAuth()
    const session = useSession() 

    //FUNCTIONS DATA
    const [functionsData, setFunctionsData] = useState<FunctionTableData[] | null>(null)

    //FILTER LOGIC
    const [text, setText] = useState<string>('')
    const [filteredFunctions, setFilteredFunctions] = useState<FunctionTableData[]>([])
    useEffect(() => {
    const filterUserData = () => {
        if (functionsData) {
            const filtered = functionsData.filter(flow =>
                flow.name.toLowerCase().includes(text.toLowerCase()) ||
                flow.description.toLowerCase().includes(text.toLowerCase()) || 
                flow.uuid.toLowerCase().includes(text.toLowerCase())
            )
            setFilteredFunctions(filtered)
        }
    }
    filterUserData()
    }, [text, functionsData])

    //FETCH NEW DATA WHEN THE VIEW CHANGE
    useEffect(() => {        
        document.title = `${t('Functions')} - ${auth.authData.organizationName} - Matil`
        localStorage.setItem('currentSection', 'functions')
        const fetchInitialData = async() => {
            if (session.sessionData.functionsData) setFunctionsData(session.sessionData.functionsData)
            else {
                const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions`,getAccessTokenSilently, setValue:setFunctionsData, auth})
                if (response?.status === 200) session.dispatch({type:'UPDATE_FUNCTIONS',payload:{data:response?.data}})
            }
        }
        fetchInitialData()
    }, [])
    
    const onSaveFunction = async(action: 'go-back' | 'delete') => {
        setEditFunctionUuid(null)  
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions`, getAccessTokenSilently,setValue:setFunctionsData, auth})
    }

   return(<>
    
 
    {editFunctionUuid ?<EditFunctionBox selectedUuid={editFunctionUuid} setselectedUuid={setEditFunctionUuid} onSaveFunction={onSaveFunction} setFunctionsData={setFunctionsData}/>: 
    <>
        {functionsData?.length === 0 ? 
            <Flex height={'100%'} top={0} left={0} width={'100%'} alignItems={'center'} justifyContent={'center'}> 
                <Box maxW={'580px'} textAlign={'center'}> 
                    <Text fontWeight={'medium'} fontSize={'2em'} mb='2vh'>{t('NoFunctions')}</Text>               
                    <Button  variant={'main'} leftIcon={<FaPlus/>} onClick={() => setEditFunctionUuid('-1')}>{t('CreateFunction')}</Button>
                </Box>
            </Flex> 
            :

            <Flex  flexWrap={'wrap'} gap='32px'  >
                {(functionsData ? functionsData: [tryData, tryData, tryData])?.map((func, index) => (
                    <Skeleton isLoaded={functionsData !== null} style={{borderRadius:'1rem'}}> 
                        <Box p='20px' overflow={'hidden'}  width={'400px'}  onClick={() => setEditFunctionUuid(func.uuid)} cursor={'pointer'} borderWidth={'1px'} key={`help-center-${index}`} transition={'box-shadow 0.3s ease-in-out'} _hover={{shadow:'lg'}} shadow={'sm'} borderRadius={'1rem'}>
                            <Flex gap='15px'>
                                <IconsPicker disabled selectedIcon={func?.icon || 'FaCode'} setSelectedIcon={() => {}}/> 
                                <Box flex='1'> 
                                <Text fontWeight={'medium'}  w='295px' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} fontSize={'1.2em'}>{func.name}</Text>
                                    <Text color='gray.600' w='295px' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  fontSize={'.9em'}>{func.description?func.description:t('NoDescription')}</Text>
                                </Box>
                            </Flex>                       
                            <Flex mt='1vh' alignItems={'center'}  gap='5px'>
                                <Icon color={func?.is_active?'#68D391':'#ECC94B'} as={FaCircleDot}/>
                                <Text mt='2px'>{func.is_active?t('LiveTilda'):t('NoLiveTilda')}</Text>
                            </Flex>
                        </Box>
                    </Skeleton>
                ))}
            </Flex> 
        }   
    </>
         
 
        }
    </>)
}

 //BOX FOR ADDING, EDITING AND DELETE A FUNCTION
const EditFunctionBox = ({selectedUuid, setselectedUuid, onSaveFunction, setFunctionsData}:{selectedUuid:string, setselectedUuid:Dispatch<SetStateAction<string | null>>, onSaveFunction:(action: 'go-back' | 'delete') => void, setFunctionsData:Dispatch<SetStateAction<FunctionTableData[] | null>>}) => {   

    //CONSTATNS
    const { t } = useTranslation('settings')
    const auth = useAuth()
    const location = useLocation().pathname
    const navigate = useNavigate()
    const { getAccessTokenSilently } = useAuth0()
    const pythonRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/

    //BUTTON REF
    const errorButtonRef = useRef<HTMLButtonElement>(null)
    const errorBoxRef = useRef<HTMLDivElement>(null)

    const newFunction:FunctionsData = {
        uuid:'-1',
        name:t('NewFunction'),
        is_active:false,
        description:'',
        parameters:[],
        code:'',
        errors:[],
        matilda_configurations_uuids:[]
    }

    //SHOW NOT SAVED DATA WARNING
    const [showNoSaveWarning, setShowNoSaveWarning] = useState<boolean>(false)

    //SHOW TEST FUNCTION
    const [showTestFunction, setShowTestFunction] = useState<boolean>(false)

    //SHOW TEST FUNCTION
    const [channeslData, setChannelsData] = useState<any[] | null>(null)
    const [showAddChannels, setShowAddChannels] = useState<boolean>(false)

    //CODE BOX WIDHT
    const [clientBoxWidth, setClientBoxWidth] = useState(500)
     
    //SHOW ERRORS
    const [showErrors, setShowErrros] = useState<boolean>(false)
    useOutsideClick({ref1:errorButtonRef, ref2:errorBoxRef, onOutsideClick:setShowErrros})

    //SHOW MORE INFO BOX
    const [sectionsExpanded, setSectionsExpanded] = useState<string[]>(['Parameters', 'TildaActive', 'ActiveChannels' ])

    const onSectionExpand = (section: string) => {
        setSectionsExpanded((prevSections) => {
          if (prevSections.includes(section))return prevSections.filter((s) => s !== section)
          else return [...prevSections, section]
        })
    }

    //FUNCTION DATA
    const functionDataRef = useRef<FunctionsData | null>(null)
    const [functionData, setFunctionData] = useState<FunctionsData | null>(null)
    const [selectedParameter, setSelectedParameter] = useState<number | null>(null)

    //CONFIGURATIONS DATA
    const [internalChannelsData, setInternalChannelsData] = useState<ConfigProps[] | null>(channeslData)

    //FETCH FUNCTION DATA
    useEffect(() => {      

        const fetchInitialData = async() => {
            if (selectedUuid === '-1') {setFunctionData(newFunction);functionDataRef.current = newFunction}
            else {
                const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/${selectedUuid}`, getAccessTokenSilently,setValue:setFunctionData, auth, setRef:functionDataRef})
            }
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations`, getAccessTokenSilently,auth, setValue:setInternalChannelsData})
        }
        fetchInitialData()
    }, [])

    //BOOLEAN FOR WAITIGN THE EDIT
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false) 
    const [waitingEdit, setWaitingEdit] = useState<boolean>(false)
    const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

    //EDIT AND ADD NEW FUNCTION
    const handleEditFunctions = async() => {
        setWaitingEdit(true)
        const isNew = functionData?.uuid === '-1' 
        if (isNew) {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions`, setWaiting:setWaitingEdit, getAccessTokenSilently, method:'post', requestForm:functionData as FunctionsData, auth, toastMessages:{'works':t('CorrectAddedFunction'), 'failed':t('FailedAddedFunction')}})  
            if (response?.status === 200) {
                setselectedUuid(null)
                setFunctionsData(prev => ([...prev as FunctionTableData[], {uuid:response.data.uuid, name:functionData.name, number_of_errors:0, description:functionData.description, is_active:functionData.is_active, icon:''}]))
            }          
        }
        else {
            const response2 = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/${functionData?.uuid}`, getAccessTokenSilently,setWaiting:setWaitingEdit, method:'put', requestForm:functionData as FunctionsData, auth, toastMessages:{'works':t('CorrectEditedFunction'), 'failed':t('FailedEditedFunction')}})
            if (functionData && response2?.status === 200) {
                functionDataRef.current = functionData   
                setFunctionsData(prev => ([...prev as FunctionTableData[], {uuid:functionData.uuid, name:functionData.name, number_of_errors:0, description:functionData.description, is_active:functionData.is_active, icon:''}]))
            }   
        }   
    }

    //DELETE A FUNCTION
    const handleDeleteFunctions= async() => {
        setWaitingDelete(true)
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/${selectedUuid}`, getAccessTokenSilently, setWaiting:setWaitingDelete, method:'delete', auth, toastMessages:{'works':t('CorrectDeletedFunctions'), 'failed':t('FailedDeletedFunctions')}})
        if (response?.status == 200) onSaveFunction('delete')   
    }

    //EDIT FUNCTION DATA
    const editFunctionData = (keyToEdit:'parameters' ,value:any, type?:'add' | 'delete' | 'edit', index?:number ) => {

        setFunctionData(prev => {
            if (!prev) return prev
            const updatedFunction = { ...prev as FunctionsData }
        
            const list = updatedFunction[keyToEdit as 'parameters']
            
            if (keyToEdit === 'parameters' || keyToEdit === 'channels_basic_data') {
                if (type === 'add') {
                  list.push(value)
                } else if (type === 'edit' && index !== undefined && index >= 0 && index < list.length) {
                  list[index] = value
                } else if (type === 'delete' && index !== undefined && index >= 0 && index < list.length) {
                  list.splice(index, 1)
                }
                updatedFunction[keyToEdit] = list as any
              }

            return updatedFunction
          })
    }

    //BOX FOR CONFIRMING THE DELETION OF A FUNCTION
    const memoizedDeleteBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowConfirmDelete}> 
                <Box p='15px'> 
                    <Text fontSize={'1.2em'}   fontWeight={'medium'}>{t('DeleteFunction')}</Text>
                    <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh' mb='1vh'/>
                    <Text>{parseMessageToBold(t('DeleteFunctionAnswer', {name:functionData?.name}))}</Text>
                </Box>
                 
                <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                    <Button size='sm' variant={'delete'}onClick={handleDeleteFunctions}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                    <Button  size='sm' variant={'common'} onClick={() => setShowConfirmDelete(false)}>{t('Cancel')}</Button>
                </Flex>
            </ConfirmBox>
    ), [showConfirmDelete])

    //TEST BOX
    const TestFunction = () => {

        //FUNCTION TESTED
        const [functionResult, setFunctionResult] = useState<FunctionResultType | null>(null)

        const TestParameters = () => {

            //WAITNG FUNCTION EXECUTION AND RESPONSE
            const [waitingTest, setWaitingTest] = useState<boolean>(false)

            //SELCETED ARGS
            const [selectedArgs, setSelectedArgs] = useState<{confirm: boolean, description:string, name: string, required: boolean, type: string, default:any, enum:any[]  }[]>(functionData?.parameters || [])

            //EDIT FUNCTION ARGS
            const editSelectedArgs = (value:any, index:number) => {
                console.log(value)
                setSelectedArgs(prev => {
                    const updatedArgs = [...prev]
                    updatedArgs[index] = {...updatedArgs[index], default:value}
                    return updatedArgs
                }) 
            }

            //SEND A FUNCTION TO TEST
            const testFunction = async () => {
                const requestDict = selectedArgs.reduce((acc: Record<string, any>, curr) => {
                    acc[curr.name] = curr.default
                    return acc  
                }, {} as Record<string, any>)
            
                const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/${selectedUuid}/run`, method:'post', getAccessTokenSilently, setWaiting:setWaitingTest, setValue:setFunctionResult,  auth, requestForm:requestDict})
                if (response?.status === 200) setFunctionData(prev => ({...prev as FunctionsData, errors: (response.data?.result?.errors || [])})) 
            }

            return(<>
                <Box p='20px'> 
                    <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('SelectFunctionArgs')}</Text>
                    <Text color='gray.600' fontSize={'.9em'}>{t('SelectFunctionArgsDes')}</Text>
                    <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                    {selectedArgs.map((arg, index) => (
                    <Fragment key={`arg-${index}`}>
                        <Text fontWeight={'medium'} mt='1vh' mb='.5vh'>{arg.name}</Text>
                        <Box flex='2'>
                            <VariableTypeChanger customType inputType={arg.type} value={arg.default} setValue={(value) => editSelectedArgs(value, index)}/>
                        </Box>
                    </Fragment>))}
                </Box>
                <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                    <Button size='sm' variant={'main'} onClick={testFunction}>{waitingTest?<LoadingIconButton/>:t('Test')}</Button>
                    <Button size='sm'  variant={'common'} onClick={() => setShowTestFunction(false)}>{t('Cancel')}</Button>
                </Flex>
            </>)
        }

        const memoizedFunctionResult = useMemo(() => (<> 
            {functionResult && 
                <ConfirmBox upPosition setShowBox={setShowTestFunction} > 
                    <Box p='15px'> 
                        <Text fontSize={'1.2em'}   fontWeight={'medium'}>{t('FunctionResult')}</Text>
                        <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh' mb='1vh'/>
                        {functionResult.run_successful ? <>
                            <Flex gap='10px' alignItems={'center'} mb='1vh'> 
                                <Icon as={FaCheckCircle} color={'green'}/>
                                <Text fontWeight={'medium'}>{t('RunSuccessefully')}</Text>
                            </Flex>
                            <Text fontWeight={'medium'}>{t('OutputsReturned')}</Text>
                            <Text>{JSON.stringify(functionResult.result)}</Text>
                         
                        </>:<> 
                        <Flex gap='10px' alignItems={'center'} mb='1vh'> 
                            <Icon as={FaTimesCircle} color={'red'}/>
                            <Text>{t('RunError')}</Text>
                        </Flex>
                        <Text color='red' fontSize={'.8em'}>{functionResult.error_message}</Text>
                        <Text fontSize={'.8em'} mt='.5vh' color='red'>[{t('ErrorLine', {line:functionResult.error_line})}]</Text>
                        </>}
                    </Box>
                 
                    <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                        <Button size='sm' variant={'common'} onClick={() => setShowTestFunction(false)}>{t('Accept')}</Button>
                    </Flex>
                </ConfirmBox>
                }
            </>), [functionResult])
            
        const memoizedTest = useMemo(() => (
            <ConfirmBox  setShowBox={setShowTestFunction}> 
                <TestParameters/>
            </ConfirmBox>
                
        ), [functionResult])
            
        return (<>{functionResult ? memoizedFunctionResult:memoizedTest}</>)
    }
   
    //ADD CHANEL BOX
    const AddChannels = () => {
       
        const addChannel = async (channel:any) => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations/${channel.uuid}/functions/${functionData?.uuid}`, method:'post', auth, getAccessTokenSilently, toastMessages:{works:t('CorrectAddedChannel'), failed:t('FailedAddedChannel')}})
            if (response?.status === 200) setFunctionData((prev) => ({...prev as FunctionsData, matilda_configurations_uuids:[...prev?.matilda_configurations_uuids || [], channel.uuid]}))
            setShowAddChannels(false)
        }

        const filteredChannels = (internalChannelsData || []).filter(internalChannel => {return !functionData?.matilda_configurations_uuids.some(basicChannel => basicChannel === internalChannel.uuid)})

        return (<> 
            <Box p='20px' > 
                <Text  fontSize='1.4em' fontWeight={'medium'}>{t('AddConfig')}</Text>
            </Box>
            <Box p='20px'  overflow={'scroll'} flexDir={'row-reverse'}  borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                {internalChannelsData === null? <Flex justifyContent={'center'}> <Spinner/></Flex>:
                <Skeleton isLoaded={internalChannelsData !== null}> 
                    {filteredChannels?.length === 0 ? <Text>{t('NoAvailableConfigs')}</Text>:<>
                    {filteredChannels.map((cha, index) => (
                        <Box cursor={'pointer'} _hover={{bg:'brand.blue_hover'}} p='10px' borderRadius={'.7rem'} key={`add-channel-${index}`} onClick={() => addChannel(cha)} > 
                            <Text   minWidth={0}  fontWeight={'medium'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{cha.name}</Text>
                            <Text  color='gray.600'fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{cha.description}</Text>
                        </Box>
                    ))}</>}
                </Skeleton>
                }
            </Box>
        </>)
    }
 
    //ACTION ON EXIT
    const onExitAction = () => {
        if (location.split('/')[2]) navigate(`/conversations/conversation/${location.split('/')[3]}`)
        if (JSON.stringify(functionData) !== JSON.stringify(functionDataRef.current) && functionData?.code !== '' && pythonRegex.test(functionData?.name || '')) setShowNoSaveWarning(true)
        else onSaveFunction('go-back')
    }   

    const memoizedNoSavedWarning = useMemo(() => (<> 
        <ConfirmBox setShowBox={setShowNoSaveWarning} > 
            <Box p='20px' > 
                <Text fontWeight={'medium'}>{t('NoSavedChanges')}</Text>
                <Text mt={'.5vh'}>{t('NoSavedChangeAnswer')}</Text>
            </Box>
            <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                <Button  size='sm' variant={'main'} onClick={() => {handleEditFunctions();onSaveFunction('go-back')}}>{waitingEdit?<LoadingIconButton/>:t('SaveAndExit')}</Button>
                <Button  size='sm'variant={'delete'} onClick={() => onSaveFunction('go-back')}>{t('NoSave')}</Button>
            </Flex>
        </ConfirmBox>    
    </>), [showNoSaveWarning])

    //MEMOIZED TEST BOX COMPONENT
    const memoizedTestFunction = useMemo(() => (<>{showTestFunction && <TestFunction/>}</>), [showTestFunction])

    //MEMOIZED ADD PARAMETER COMPONENT
    const memoizedAddParameter= useMemo(() => (<> 
        <ConfirmBox  setShowBox={(b:boolean) => setSelectedParameter(null)} > 
            <CreateVariable variableData={functionData?.parameters?.[selectedParameter as number] as parameterType} index={selectedParameter as number} setIndex={setSelectedParameter} editFunctionData={editFunctionData}/>
        </ConfirmBox>
    </>), [selectedParameter])

    //MEMOIZED ADD CHANNEL COMPONENT
    const memoizedAddChannel= useMemo(() => (<> 
        <ConfirmBox  setShowBox={setShowAddChannels} > 
            <AddChannels/>
        </ConfirmBox>
    </>), [showAddChannels])

    const codeBoxHeight =  (window.innerHeight * 0.99 - window.innerWidth * 0.04) - 70
    const sendBoxWidth = `calc(100vw - 55px - ${clientBoxWidth}px)`

    //FRONT
    return(<>
        {selectedParameter !== null && memoizedAddParameter}
        {showNoSaveWarning && memoizedNoSavedWarning}
        {showConfirmDelete && memoizedDeleteBox}
        {showAddChannels && memoizedAddChannel}

        <Flex flex='1' position='absolute' width={'calc(100vw - 55px)'} height={'100vh'} top={0} left={0} bg='white'>
            <MotionBox   initial={{ width: sendBoxWidth  }} animate={{ width: sendBoxWidth}} exit={{ width: sendBoxWidth }} transition={{ duration: '.2' }}  
            width={sendBoxWidth} overflowY={'hidden'}  borderRightWidth={'1px'} borderRightColor='gray.200' >
                <Flex px='2vw' gap='2vw' height={'70px'} alignItems={'center'} justifyContent={'space-between'}  borderBottomWidth={'1px'} borderBottomColor={'gray.200'}>

                    <Flex flex={1} gap='20px' alignItems={'center'}> 
                        <Tooltip label={t('GoBack')}  placement='bottom' hasArrow bg='black'  color='white'  borderRadius='.4rem' fontSize='.75em' p='4px'> 
                            <IconButton aria-label='go-back' size='sm' variant={'common'} bg='transparent' onClick={onExitAction} icon={<IoIosArrowBack size='20px'/>}/>
                        </Tooltip>

                        <EditText  regex={pythonRegex} placeholder={t('name')}  value={functionData?.name} setValue={(value) => setFunctionData(prev => ({...prev as FunctionsData, name:value}))} className={'title-textarea-collections'}/>
                    </Flex>
                    
                    <Flex gap='15px'>
                        {selectedUuid !== '-1' && <Button leftIcon={<BsTrash3Fill/>} variant={'delete'}  size='sm' onClick={() => setShowConfirmDelete(true)}>{t('Delete')}</Button>}
                        <Button variant={'common'} size='sm' onClick={() => setShowTestFunction(true)}>{t('Test')}</Button>
                        <Button variant={'main'} size='sm' isDisabled={JSON.stringify(functionData) === JSON.stringify(functionDataRef.current) || functionData?.code === '' || !pythonRegex.test(functionData?.name || '')} onClick={handleEditFunctions}>{waitingEdit?<LoadingIconButton/>:selectedUuid !== '-1'?t('SaveChanges'):t('CreateFunction')}</Button>
                        {clientBoxWidth === 0 && <IconButton aria-label="open-tab" variant={'common'} bg='transparent' size='sm' icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'20px'}/>} onClick={() =>setClientBoxWidth(400)}/>}
                    </Flex>
                </Flex>
                <Flex width={'100%'} height={'100%'} justifyContent={'center'} overflow={'scroll'} >
                    <Box p='2vw'  width={'100%'} height={'100%'}  >
                        <Skeleton isLoaded={functionData !== null} style={{overflow:'hidden'}}> 
                            <CodeMirror value={functionData?.code} maxHeight={`${codeBoxHeight}px`} extensions={[python()]} onChange={(value) => setFunctionData(prev => ({...prev as FunctionsData, code:value}))} theme={oneDark}/>
                        </Skeleton>
                    </Box>
                </Flex>
            </MotionBox>
            <MotionBox width={clientBoxWidth + 'px'}  whiteSpace={'nowrap'} initial={{ width: clientBoxWidth + 'px' }} animate={{ width: clientBoxWidth + 'px' }} exit={{ width: clientBoxWidth + 'px' }} transition={{ duration: '.2'}}> 
                <Flex p='2vh' height={'70px'} justifyContent={'space-between'} alignItems={'center'} borderBottomWidth={'1px'} borderBottomColor={'gray.200'}>
                    <Text fontSize={'1.5em'} fontWeight={'medium'}>{t('FunctionData')}</Text>
                    <IconButton aria-label="close-tab" variant={'common'} bg='transparent' size='sm' icon={<RxCross2 size={'20px'}/>} onClick={() =>setClientBoxWidth(0)}/>
                </Flex>
                <Box p='2vh' pb='10vh' height={'100%'} overflow={'scroll'}> 
                    <Text fontWeight={'semibold'}  fontSize={'.9em'}>{t('Description').toLocaleUpperCase()}</Text>
                    <Textarea maxW={'500px'} mt='.5vh' resize={'none'} maxLength={2000} height={'auto'} placeholder={`${t('Description')}...`} maxH='300px' value={functionData?.description} onChange={(e) => setFunctionData((prev) => ({...prev as FunctionsData, description:e.target.value}))} p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "brand.text_blue", borderWidth: "2px"}}/>
                    <CollapsableSection section={'Parameters'} isExpanded={sectionsExpanded.includes('Parameters')} onSectionExpand={onSectionExpand}> 
                        <Skeleton isLoaded={functionData !== null}> 
                            {(functionData?.parameters || []).map((param, index) => (
                                <Fragment key={`parameter-${index}`}> 
                                    <ParameterBox variableData={param} index={index} setIndex={setSelectedParameter} editFunctionData={editFunctionData}/>
                                    {index !== (functionData?.parameters?.length || 0) - 1 && <Box height={'1px'} width={'100%'} bg='gray.200' mt='1vh' mb='1vh'/>}
                                </Fragment>
                            ))}
                            <Button variant={'common'} leftIcon={<FaPlus/>} onClick={() => setSelectedParameter(-1)} size='sm' mt='2vh'>{t('AddParameter')}</Button>
                        </Skeleton>

                    </CollapsableSection>

                    <CollapsableSection section={'TildaActive'} isExpanded={sectionsExpanded.includes('TildaActive')} onSectionExpand={onSectionExpand}> 
                        <Flex gap='8px' mt='1vh'  alignItems={'center'}>
                            <Switch isChecked={functionData?.is_active}  onChange={(e) => setFunctionData(prev => ({...prev as FunctionsData, is_active:e.target.checked}))} />
                            <Text mt='.5vh' fontWeight={'medium'} >{t('AvailableTilda')}</Text>
                        </Flex>
                        <Text color='gray.600'whiteSpace='pre-wrap' fontSize={'.9em'}>{t('AvailableTildaDes')}</Text>
                    </CollapsableSection>

                    <CollapsableSection section={'ActiveChannels'} isExpanded={sectionsExpanded.includes('ActiveChannels')} onSectionExpand={onSectionExpand}> 
                        <Skeleton isLoaded={functionData !== null && internalChannelsData !== null}> 
                            {(functionData?.matilda_configurations_uuids || []).map((cha, index) => (
                                <Flex  gap='10px' mt='12px' key={`channel-${index}`} alignItems={'start'}> 
                                    <Box mt='-2px' flex='1' > 
                                        <Flex gap='10px' alignItems='center'> 
                                            <Text   minWidth={0}  fontWeight={'medium'} fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{internalChannelsData?.find(element => element.uuid === cha)?.name}</Text>
                                        </Flex> 
                                        <Text width={'190px'} color='gray.600'fontSize={'.8em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{cha}</Text>
                                    </Box>
                                </Flex>
                            ))}
                        </Skeleton>
                        <Button variant={'common'} isDisabled={functionData?.uuid === '-1'} leftIcon={<FaPlus/>} onClick={() => setShowAddChannels(true)} size='sm' mt='2vh'>{t('AddConfig')}</Button>
                        {functionData?.uuid === '-1' && <Text mt='1vh' color='red' fontSize={'.8em'}>{t('SaveChannelsWarning')}</Text>}
                    </CollapsableSection>
                </Box>
            </MotionBox>
        </Flex>
            
        {(functionData?.errors?.length || 0) > 0 &&
            <Box position={'absolute'} right={'2vw'} bottom={'2vw'}  > 
                <Box position='relative'> 
                    {!showErrors && <Button  shadow='xl' ref={errorButtonRef} bg="red.500" leftIcon={<IoWarning/>} color='white' _hover={{ bg:'red.600'}} onClick={() => setShowErrros(true)}>{t('ErrorsCount', {count:functionData?.errors.length})}</Button>}
                    
                    <AnimatePresence> 
                        {showErrors && 
                        <MotionBox initial={{ opacity: 0, marginBottom:-10 }} animate={{ opacity: 1, marginBottom: 0}}  exit={{ opacity: 0,bottom: -10}} transition={{ duration: '.2', ease: 'easeOut'}}
                            right={'2vw'} width={'700px'} maxWidth={'40vw'}  bottom={'2vw'} maxH='80vh' gap='10px' boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000}   position={'fixed'} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.300'}>
                            <Flex p='15px' justifyContent={'space-between'}> 
                                <Text fontSize={'1.1em'} fontWeight={'medium'}>{t('Errors')}</Text>
                                <IconButton isRound bg='transparent' size='sm' onClick={()=>setShowErrros(false)} aria-label="show-client" icon={<IoIosArrowDown size={'16px'}/>}/>
                            </Flex>

                            {functionData?.errors.map((error, index) => (
                                <Flex bg={index % 2 === 0?'gray.100':'gray.50'} p='15px' alignItems={'center'} key={`error-${index}`} justifyContent={'space-between'} gap='10px'>
                                    <Box flex='1' gap='30px' >
                                        <Flex gap='10px'> 
                                            <Text textOverflow={'ellipsis'} fontSize={'.9em'} whiteSpace={'nowrap'} fontWeight={'medium'}>{error.timestamp}</Text>
                                            <Box fontSize={'.8em'}> 
                                                <Text>{error.message}</Text>
                                                <Text color='red'>[{t('ErrorLine', {line:error.line})}] {Object.keys(error.arguments).map((arg, argIndex) => (<span>{t('ErrorArgument', {name:arg, value:error.arguments[arg as any]})}{argIndex === error.arguments.length - 1 ?'':', '}</span>))} </Text>
                                            </Box>
                                        </Flex>
                                    </Box>        
                                    <Tooltip label={t('CopyError')}  placement='top' hasArrow bg='black' color='white'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                                        <IconButton size='xs' onClick={() => copyToClipboard(error.message, t('CorrectCopiedError'))}  aria-label={'copy-invitation-code'} icon={<BsClipboard2Check/>}/>
                                    </Tooltip>
                                </Flex>
                            ))} 
                        </MotionBox>}
                    </AnimatePresence>
                </Box>
            </Box>
        }

        {memoizedTestFunction}
 
    </>)
}  

const CollapsableSection = ({ section, isExpanded, onSectionExpand, children}:{section:string, isExpanded:boolean, onSectionExpand:(key:string) => void ,children:ReactNode}) => {

    const { t } = useTranslation('settings')
 
    return (
        <Box py='3vh' borderBottomColor={'gray.200'} borderBottomWidth={'1px'}> 
            <Flex cursor={'pointer'} alignItems={'center'} justifyContent={'space-between'} onClick={() => onSectionExpand(section)}>
                <Text fontWeight={'semibold'}  fontSize={'.9em'}>{t(section).toLocaleUpperCase()}</Text>
                <IoIosArrowDown color={'gray.600'} className={isExpanded ? "rotate-icon-up" : "rotate-icon-down"}/>
            </Flex>
            <motion.div initial={false}  animate={{height:isExpanded?'auto':0, opacity:isExpanded?1:0 }} exit={{height:isExpanded?0:'auto',  opacity:isExpanded?0:1 }} transition={{duration:.2}} style={{overflow:isExpanded?'visible':'hidden'}}>           
                {children}
            </motion.div>
        </Box>
    )
}
 
//CREATING A VARIABLE
 const CreateVariable = ({variableData,  index, setIndex, editFunctionData}:{variableData:parameterType | undefined, index:number, setIndex:Dispatch<SetStateAction<number | null>>, editFunctionData:(keyToEdit:'parameters' ,value:any, type?:'add' | 'delete' | 'edit', index?:number, secondKey?:'name' | 'type' | 'default' | 'required' | 'confirm' | 'is_active' | '' ) => void }) => {

    const { t } = useTranslation('settings')
    const variablesMap:{[key:string]:string} = {'boolean':t('bool'), 'integer':t('int'), 'number':t('float'), 'string':t('str'), 'timestamp':t('timestamp'), 'list':t('list')}

    const [currentVariable, setCurrentVariable] = useState<parameterType>((index === -1 || variableData === undefined)?{name:'', type:'boolean', description:'', default:false, required:false, confirm:false, enum:[]}:variableData)
    const [currentExample, setCurrentExample] = useState<any>('')

    const editList = (action:'add' | 'delete', index?:number) => {
        if (action === 'add') {
            setCurrentVariable((prev) => ({...prev, enum:[...(prev?.enum || []), currentExample]}))
            setCurrentExample('')
        }
        else if (action === 'delete' && index !== undefined) setCurrentVariable((prev) => ({...prev, enum: prev.enum.filter((_, i) => i !== index)}))
        
    }
    const sendVariable = () => {
        editFunctionData('parameters', currentVariable, index === -1 ? 'add':'edit', index)
        setIndex(null)
    }
    return (<> 
        <Box p='25px' minW={'600px'}>

            <Text  fontWeight={'medium'} mb='.5vh'>{t('Name')}</Text>
            <EditText  maxLength={70} hideInput={false}  value={currentVariable.name} placeholder={`${t('Name')}...`} setValue={(value) => setCurrentVariable((prev) => ({...prev, name:value})) }/>
            
            <Text mb='.5vh' mt='1.5vh' fontWeight={'medium'}>{t('Description')}</Text>
            <Textarea maxLength={2000} height={'auto'} placeholder={`${t('Description')}...`} maxH='300px' value={currentVariable.description} onChange={(e) => setCurrentVariable((prev) => ({...prev, description:e.target.value}))} p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "brand.text_blue", borderWidth: "2px"}}/>
            
            <Text mb='.5vh' mt='1.5vh' fontWeight={'medium'}>{t('Type')}</Text>
            <CustomSelect hide={false} selectedItem={currentVariable.type} setSelectedItem={(value) => setCurrentVariable((prev) => ({...prev, type:value, enum:[], default:null}))} options={Object.keys(variablesMap)} labelsMap={variablesMap}/>
         
            <Text  mt='1.5vh' mb='.5vh' fontWeight={'medium'}>{t('DefaultValue')}</Text>
            <VariableTypeChanger customType inputType={currentVariable.type} value={currentVariable.default} setValue={(value) => setCurrentVariable((prev) => ({...prev, default:value}))}/>

            <Text  mt='1.5vh' fontWeight={'medium'}>{t('AllowedValues')}</Text>
            <Flex flexWrap="wrap" gap='5px' mt='.5vh' alignItems="center" >
                {(!currentVariable?.enum || currentVariable?.enum?.length === 0)?<Text fontSize={'.9em'}>{t('NoValues')}</Text>:
                currentVariable.enum.map((variable, index) => (
                    <Flex key={`vallue-${index}`} borderRadius=".4rem" p='5px' fontSize={'.75em'} alignItems={'center'} m="1" bg='gray.100' shadow={'sm'} borderColor={'gray.300'} borderWidth={'1px'} gap='5px'>
                        <Text>{t(variable)}</Text>
                        <Icon as={RxCross2} onClick={() => editList('delete', index)} cursor={'pointer'} />
                    </Flex>
                ))}
            </Flex>     
            <Flex mt='1vh' gap='20px' alignItems={'center'}> 
                <Box flex='1'> 
                    <VariableTypeChanger customType inputType={currentVariable.type} value={currentExample} setValue={(value) => setCurrentExample(value)}/>
                </Box>
                <Button isDisabled={currentExample === ''} leftIcon={<FaPlus/>} variant={'common'} size='sm' onClick={() => editList('add')}>{t('Add')}</Button>
            </Flex>

            <Flex mt='3vh' gap='10px'alignItems={'center'}>
                <Switch isChecked={currentVariable.required} onChange={(e) => setCurrentVariable((prev) => ({...prev, required:e.target.checked}))}/>
                <Text fontWeight={'medium'}>{t('Required')}</Text>  
            </Flex>  

            <Flex mt='3vh' gap='10px'alignItems={'center'}>
                <Switch isChecked={currentVariable.confirm} onChange={(e) => setCurrentVariable((prev) => ({...prev, confirm:e.target.checked}))}/>
                <Text fontWeight={'medium'}>{t('AskConfirmation')}</Text>  
            </Flex>  
        </Box>
 
        <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
            <Button variant={'main'}  isDisabled={currentVariable.name === '' || (index !== -1 && JSON.stringify(variableData) === JSON.stringify(currentVariable))} size='sm' onClick={sendVariable}>{index === -1 ? t('CreateParameter'): t('SaveParameter')}</Button>
            <Button variant={'common'}  size='sm' onClick={() => setIndex(null)}>{t('Cancel')}</Button>
        </Flex>
        
    </>)
}
 
const ParameterBox = ({variableData,  index, setIndex, editFunctionData}:{variableData:parameterType, index:number, setIndex:Dispatch<SetStateAction<number | null>>, editFunctionData:(keyToEdit:'parameters' ,value:any, type?:'add' | 'delete' | 'edit', index?:number, secondKey?:'name' | 'type' | 'default' | 'required' | 'confirm' | 'is_active' | '' ) => void }) => {
    
    //TRANSLATION
    const { t }  = useTranslation('settings')

    //MAPPING CONSTANTS
    const variablesMap:{[key:string]:[string, IconType]} = {'boolean':[t('bool'),AiOutlineCheckCircle ], 'integer':[t('int'), FiHash], 'number':[t('float'), TbMathFunction], 'string':[t('str'), FiType], 'timestamp':[t('timestamp'), AiOutlineCalendar], 'list':[t('list'), MdOutlineFormatListBulleted]}
 
    return (
        <Box position={'relative'}  w={'100%'} cursor={'pointer'} mt={'1.5vh'} >
            <Flex alignItems={'center'} justifyContent={'space-between'} gap='10px'> 
                <Flex  gap='5px' alignItems={'center'} >
                    <Text fontWeight={'medium'}  fontSize={'1em'} >{variableData.name} <span style={{fontSize:'.8em'}}>({variablesMap[variableData.type][0]})</span></Text>
                    -
                    <Flex gap='5px' fontSize={'.9em'} color={variableData?.required?'red':'orange'}justifyContent={'space-between'} alignItems={'center'}>
                        <Text flex={1}>{variableData?.required?t('RequiredParam'):t('NoRequiredParam')}</Text>
                        <Icon as={variableData.required?FaCircleExclamation:FaCircleQuestion} />
                    </Flex>
                </Flex>
                <Flex gap='5px'> 
                    <IconButton size='xs' variant={'common'} icon={<FaEdit/>}  onClick={() => setIndex(index)} aria-label="edit-param"/>
                    <IconButton size='xs' variant={'delete'} onClick={() => editFunctionData('parameters', null, 'delete', index)} icon={<HiTrash/>} aria-label="delete-param"/>
                </Flex>
            </Flex>
            
            <Text flex={1} mt='.5vh' whiteSpace='pre-wrap'fontSize={'.8em'} color='gray.600'>{variableData.description === ''?t('NoDescription'):variableData.description }</Text>
            <Text flex={1} mt='.5vh' fontSize={'.9em'} fontWeight={500} >{t('ConfirmRequest')}: <span > {(variableData.confirm?t('YES'):t('NO')).toLocaleUpperCase()}</span></Text>

            <Text flex={1} mt='.5vh' fontSize={'.9em'} ><span style={{fontWeight:500}} > {t('DefaultValue')}:</span> {variableData.default?variableData.default:'-'}</Text>

            {variableData.enum && 
            <Flex  mt='.5vh' gap='5px' justifyContent={'space-between'}>
                <Box flex='1'>
                    <Text fontSize={'.9em'}  fontWeight={'medium'} flex={1}>{t('AllowedValues')}</Text>
                    <Text color='gray.600' fontSize={'.8em'} flex={1}>{variableData.enum.length === 0?t('NoValues'):variableData.enum.map((value, index) => (<span key={`value-${index}`}>{t(value)} {index < (variableData?.enum || []).length - 1 && ' - '}</span>))}</Text>
                </Box>
            </Flex>}
            
        </Box>
        )
}


