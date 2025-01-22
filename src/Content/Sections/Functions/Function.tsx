//REACT
import { useEffect, useRef, useState, useMemo, Fragment, ReactNode, Dispatch, SetStateAction, ReactElement } from "react"
import { useAuth } from "../../../AuthContext"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { motion, isValidMotionProp } from 'framer-motion'
import { Text, Box, Flex, Button, Skeleton, IconButton, chakra, shouldForwardProp, Icon, Switch, Spinner } from "@chakra-ui/react"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
//PYTHON CODE EDITOR
import CodeMirror from "@uiw/react-codemirror"
import { python } from "@codemirror/lang-python"
import { oneDark } from "@codemirror/theme-one-dark"
//COMPONENTS
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import EditText from "../../Components/Reusable/EditText"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import SectionSelector from "../../Components/Reusable/SectionSelector"
import VariableTypeChanger from "../../Components/Reusable/VariableTypeChanger"
import CollapsableSection from "../../Components/Reusable/CollapsableSection"
import ActionsButton from "../../Components/Reusable/ActionsButton"
import '../../Components/styles.css'
//FUNCTIONS
import parseMessageToBold from "../../Functions/parseToBold"
import parseNumber from "../../Functions/parseNumbers"
//ICONS
import { FaPlus } from "react-icons/fa6"
import { FaCheckCircle, FaTimesCircle, FaEdit } from "react-icons/fa"
import { IoIosArrowDown,  } from "react-icons/io"
import { IoChatbubbleEllipses } from "react-icons/io5"
import { BsThreeDotsVertical } from "react-icons/bs"
import { RxCross2 } from "react-icons/rx"
import { PiSidebarSimpleBold } from "react-icons/pi"
import { AiOutlineCheckCircle, AiOutlineCalendar } from "react-icons/ai"
import { FiHash, FiType } from "react-icons/fi"
import { HiTrash } from "react-icons/hi2"
import { TbMathFunction } from "react-icons/tb"
import { MdOutlineFormatListBulleted } from "react-icons/md"
//TYPING
import { FunctionsData, ConfigProps } from "../../Constants/typing"
  
//TYPING  
interface FunctionResultType {
    run_successful:boolean
    result:{outputs:{[key:string]:string}, motherstructure_updates:{[key:string]:string}, errors:{message: string, line: number, timestamp: string, arguments: {name: string, type: string, value: any}[]}[]}
    error_message:string 
    error_line:number
}
interface LogsType  {
    function_uuid: string
    occurred_at: string
    successful: boolean
    execution_time_ms: number
    memory_usage_kb: number
    result: any
    arguments:any
}
interface ErrorsType {
    function_uuid: string
    occurred_at: string
    uuid:string
    description: string
    line:number
    arguments:any
}
  
type parameterType = {confirm: boolean, description:string, name: string, required: boolean, type: string, default:any, enum:any[]}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})
 

 //BOX FOR ADDING, EDITING AND DELETE A FUNCTION
const Function = ({setHideFunctions}:{setHideFunctions:Dispatch<SetStateAction<boolean>>}) => {   

    //CONSTATNS
    const { t } = useTranslation('settings')
    const auth = useAuth()
    const location = useLocation().pathname
    const navigate = useNavigate()
    const { getAccessTokenSilently } = useAuth0()
    const pythonRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/
 
    const selectedUuid = location.split('/')[location.split('/').length - 1] === 'new' ? '-1': location.split('/')[location.split('/').length - 1]
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

    // CURRENT SECTIO SIDEBAR
    const [currentSectionSideBar, setCurrentSectionSideBar ] = useState<'data' | 'errors' | 'logs'>('data')

    //SHOW NOT SAVED DATA WARNING
    const [showNoSaveWarning, setShowNoSaveWarning] = useState<boolean>(false)

    //SHOW TEST FUNCTION
    const [showTestFunction, setShowTestFunction] = useState<boolean>(false)

    //SHOW TEST FUNCTION
    const [channeslData, setChannelsData] = useState<any[] | null>(null)
    const [showAddChannels, setShowAddChannels] = useState<boolean>(false)

    //CODE BOX WIDHT
    const [clientBoxWidth, setClientBoxWidth] = useState(400)
     
 
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
    const [waitingInfo, setWaitingInfo] = useState<boolean>(false)

    // LOGS AND ERRORS DATA
    const [errors, setErrors] = useState<{errors:ErrorsType[]}>({errors:[]}) 
    const [errorSelectedArgs, setErrorSelectedArgs] = useState<{uuid:string, args:any} | null>(null)

    const [logs, setLogs] = useState<{logs:LogsType[]}>({logs:[]}) 
    


    //SELECT PARAMETERS
    const [selectedParameter, setSelectedParameter] = useState<number | null>(null)

    //CONFIGURATIONS DATA
    const [internalChannelsData, setInternalChannelsData] = useState<ConfigProps[] | null>(channeslData)

    //FETCH FUNCTION DATA
    useEffect(() => {      

        const fetchInitialData = async() => {
            if (selectedUuid === '-1') {setFunctionData(newFunction);functionDataRef.current = newFunction}
            else {
                const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/${selectedUuid}`, getAccessTokenSilently,setValue:setFunctionData, auth, setRef:functionDataRef})
                const responseErrors = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/errors`, params:{function_uuid:selectedUuid}, getAccessTokenSilently,setValue:setErrors, auth})
                const responseLogs = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/logs`, params:{function_uuid:selectedUuid}, getAccessTokenSilently,setValue:setLogs, auth})

            }
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations`, getAccessTokenSilently,auth, setValue:setInternalChannelsData})
        }
        fetchInitialData()
    }, [location])

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
           
        }
        else {
            const response2 = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/${functionData?.uuid}`, getAccessTokenSilently,setWaiting:setWaitingEdit, method:'put', requestForm:functionData as FunctionsData, auth, toastMessages:{'works':t('CorrectEditedFunction'), 'failed':t('FailedEditedFunction')}})
            if (functionData && response2?.status === 200) {
                functionDataRef.current = functionData   
             }   
        }   
    }

    //DELETE A FUNCTION
    const handleDeleteFunctions= async() => {
        setWaitingDelete(true)
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/${selectedUuid}`, getAccessTokenSilently, setWaiting:setWaitingDelete, method:'delete', auth, toastMessages:{'works':t('CorrectDeletedFunctions'), 'failed':t('FailedDeletedFunctions')}})
        if (response?.status == 200) navigate('/functions')   
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

 
    //EDIT FUNCTIONS ORDER
    const onDragEnd = (result:any) => {
        if (!result.destination) return
        const items = Array.from(functionData?.parameters || [])
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)
        setFunctionData(prev => ({...prev as FunctionsData, parameters:items}))
     }

    //ACTION ON EXIT
    const onExitAction = () => {
        if (location.split('/')[2]) navigate(`/conversations/conversation/${location.split('/')[3]}`)
        if (JSON.stringify(functionData) !== JSON.stringify(functionDataRef.current) && functionData?.code !== '' && pythonRegex.test(functionData?.name || '')) setShowNoSaveWarning(true)
        else navigate('/functions')
    }   

 
    //TEST BOX
    const TestFunction = ({}) => {

        //FUNCTION TESTED
        const [functionResult, setFunctionResult] = useState<FunctionResultType | null>(null)

        const TestParameters = () => {

            //WAITNG FUNCTION EXECUTION AND RESPONSE
            const [waitingTest, setWaitingTest] = useState<boolean>(false)

            //SELCETED ARGS
            const [selectedArgs, setSelectedArgs] = useState<{confirm: boolean, description:string, name: string, required: boolean, type: string, default:any, enum:any[]  }[]>(functionData?.parameters || [])

            //EDIT FUNCTION ARGS
            const editSelectedArgs = (value:any, index:number) => {
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
                    <Text color='gray.600' fontSize={'.8em'}>{t('SelectFunctionArgsDes')}</Text>
                    <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                    {selectedArgs.map((arg, index) => (
                    <Fragment key={`arg-${index}`}>
                        <Text fontWeight={'medium'} mt='1vh' fontSize={'.9em'} mb='.5vh'>{arg.name}</Text>
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
            <Box p='15px' > 
                <Text fontWeight={'medium'}>{t('AddConfig')}</Text>
            </Box>
            <Box p='15px'  overflow={'scroll'} flexDir={'row-reverse'}  borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                {internalChannelsData === null? <Flex justifyContent={'center'}> <Spinner/></Flex>:
                <Skeleton isLoaded={internalChannelsData !== null}> 
                    {filteredChannels?.length === 0 ? <Text fontSize={'.9em'} color='gray.600'>{t('NoAvailableConfigs')}</Text>:<>
                    {filteredChannels.map((cha, index) => (
                        <Box cursor={'pointer'} _hover={{bg:'brand.gray_2'}} p='10px' borderRadius={'.5rem'} key={`add-channel-${index}`} onClick={() => addChannel(cha)} > 
                            <Text  fontSize={'.9em'}  minWidth={0}  fontWeight={'medium'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{cha.name}</Text>
                            <Text  color='gray.600'fontSize={'.8em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{cha.description}</Text>
                        </Box>
                    ))}</>}
                </Skeleton>
                }
            </Box>
        </>)
    }
 

    const TestFunctionFromError = () => {
        const [functionResult, setFunctionResult] = useState<FunctionResultType | null>(null)
        const [waitingTest, setWaitingTest] = useState<boolean>(true)
        const testFunction = async () => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/${selectedUuid}/run`, method:'post', getAccessTokenSilently, setWaiting:setWaitingTest, setValue:setFunctionResult,  auth, requestForm:errorSelectedArgs?.args})
            if (response?.status === 200) {
                const responseDeleteErrors = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/errors/${errorSelectedArgs?.uuid}`,method:'delete', getAccessTokenSilently, auth})
                const responseErrors = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/errors`, params:{function_uuid:selectedUuid}, getAccessTokenSilently,setValue:setErrors, auth})
                const responseLogs = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/logs`, params:{function_uuid:selectedUuid}, getAccessTokenSilently,setValue:setLogs, auth})
            }
        }
        useEffect(() => {testFunction()}, [])

        return (<> 
                <Box p='15px'> 
                    <Text fontSize={'1.2em'}   fontWeight={'medium'}>{t('FunctionResult')}</Text>
                    <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh' mb='1vh'/>
                </Box>
                        {(functionResult) ?<>
                            <Box px='15px'> 
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
                            <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                                <Button size='sm' variant={'common'} onClick={() => setErrorSelectedArgs(null)}>{t('Accept')}</Button>
                            </Flex>
                            </>
                        :
                        <Flex w='100%' p='15px' h='20vh' justifyContent={'center'} alignItems={'center'}> 
                            <Spinner/>
                        </Flex>
                        }
               
                  
                    
        </>)
    }

    // BOX FOR EXITING WITH NO SAVED DATA
    const memoizedNoSavedWarning = useMemo(() => (<> 
        <ConfirmBox setShowBox={setShowNoSaveWarning} > 
            <Box p='20px' > 
                <Text fontWeight={'medium'}>{t('NoSavedChanges')}</Text>
                <Text mt={'.5vh'}>{t('NoSavedChangeAnswer')}</Text>
           
                <Flex mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                    <Button  size='sm' variant={'main'} onClick={() => {handleEditFunctions();navigate('/functions')}}>{waitingEdit?<LoadingIconButton/>:t('SaveAndExit')}</Button>
                    <Button  size='sm'variant={'delete'} onClick={() => navigate('/functions')}>{t('NoSave')}</Button>
                </Flex>
            </Box>
        </ConfirmBox>    
    </>), [showNoSaveWarning])

    //BOX FOR CONFIRMING THE DELETION OF A FUNCTION
    const memoizedDeleteBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowConfirmDelete}> 
                <Box p='15px'> 
                    <Text fontSize={'1.2em'}>{parseMessageToBold(t('DeleteFunctionAnswer', {name:functionData?.name}))}</Text>
                    <Text fontSize={'.8em'} mt='2vh' color='gray.600'  fontWeight={'medium'}>{t('DeleteFunctionWarning')}</Text>
                 </Box>
                 
                <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} >
                    <Button size='sm' variant={'delete'}onClick={handleDeleteFunctions}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                    <Button  size='sm' variant={'common'} onClick={() => setShowConfirmDelete(false)}>{t('Cancel')}</Button>
                </Flex>
            </ConfirmBox>
    ), [showConfirmDelete])


    //MEMOIZED TEST BOX COMPONENT
    const memoizedTestFunction = useMemo(() => (<>{showTestFunction && <TestFunction/>}</>), [showTestFunction])

    //MEMOIZED TEST FUNCTION WITH ARGS
    const memoizedTestFunctionFromError= useMemo(() => (<> 
        {errorSelectedArgs && <ConfirmBox  setShowBox={() => setErrorSelectedArgs(null)} > 
            <TestFunctionFromError/>
        </ConfirmBox>}
    </>), [errorSelectedArgs])



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

    //MEMOIZED ACTIONS BUTTON
    const memoizedActionsButton = useMemo(() => (<ActionsButton deleteAction={() => setShowConfirmDelete(true)} copyAction={() => {}} />), [])

    const sendBoxWidth = `calc(100vw - 45px - ${clientBoxWidth}px)`

     //FRONT
    return(<>
        {memoizedTestFunctionFromError}
        {selectedParameter !== null && memoizedAddParameter}
        {showNoSaveWarning && memoizedNoSavedWarning}
        {showConfirmDelete && memoizedDeleteBox}
        {showAddChannels && memoizedAddChannel}

        <Flex flex='1'  width={'100%'} height={'100vh'} top={0} left={0} bg='white'>
            <MotionBox   initial={{ width: sendBoxWidth  }} animate={{ width: sendBoxWidth}} exit={{ width: sendBoxWidth }} transition={{ duration: '.2' }}  
                width={sendBoxWidth} overflowY={'hidden'}  borderRightWidth={'1px'} borderRightColor='gray.200' >
                
                <Flex px='1vw' gap='2vw' height={'60px'} alignItems={'center'} justifyContent={'space-between'}  borderBottomWidth={'1px'} borderBottomColor={'gray.200'}>
                    <Flex flex={1} gap='10px' alignItems={'center'}> 
                        <IconButton  aria-label="open-tab" variant={'common'} bg='transparent' size='sm' icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'18px'}/>}  h='28px' w='28px'  onClick={() =>setHideFunctions(prev => (!prev))}/>
                        <Skeleton isLoaded={functionData !== null && !waitingInfo} style={{marginTop:'7px'}}> 

                            <EditText  regex={pythonRegex} placeholder={t('name')}  value={functionData?.name} setValue={(value) => setFunctionData(prev => ({...prev as FunctionsData, name:value}))} className={'title-textarea-collections'}/>
                        </Skeleton>
                    </Flex>
                    
                    <Flex gap='10px'>                        
                        {selectedUuid !== '-1' && memoizedActionsButton}
                        <Button variant={'common'} size='sm' leftIcon={<IoChatbubbleEllipses/>} onClick={() => setShowTestFunction(true)}>{t('Test')}</Button>
                         <Button  variant={'main'} size='sm' isDisabled={JSON.stringify(functionData) === JSON.stringify(functionDataRef.current) || functionData?.code === '' || !pythonRegex.test(functionData?.name || '')} onClick={handleEditFunctions}>{waitingEdit?<LoadingIconButton/>:selectedUuid !== '-1'?t('SaveChanges'):t('CreateFunction')}</Button>
                        {clientBoxWidth === 0 && <IconButton  aria-label="open-tab" variant={'common'} bg='transparent' size='sm' icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'18px'}/>}  h='28px' w='28px'  onClick={() =>setClientBoxWidth(400)}/>}
                    </Flex>
                </Flex>

                <Flex width={'100%'} height={'100%'} justifyContent={'center'} overflow={'scroll'} >
                    <Box  width={'100%'} height={'100%'}  >
                        <Skeleton isLoaded={functionData !== null} style={{overflow:'hidden'}}> 
                            <CodeMirror value={functionData?.code} height={`${window.innerHeight - 60}px`} extensions={[python()]} onChange={(value) => setFunctionData(prev => ({...prev as FunctionsData, code:value}))} theme={oneDark}/>
                        </Skeleton>
                    </Box>
                </Flex>
            </MotionBox>

            <MotionBox display={'flex'} maxW={400}  flexDir={'column'} h='100vh' width={clientBoxWidth + 'px'}  whiteSpace={'nowrap'} initial={{ width: clientBoxWidth + 'px' }} animate={{ width: clientBoxWidth + 'px' }} exit={{ width: clientBoxWidth + 'px' }} transition={{ duration: '.2'}}> 
                <Box w='400px' maxW='400px'> 
                <Flex  px='1vw'  height={'60px'} justifyContent={'space-between'} alignItems={'center'} borderBottomWidth={'1px'} borderBottomColor={'gray.200'}>
                    <SectionSelector sections={['data', 'errors', 'logs']} sectionsMap={{'data':[t('Data'), <></>], 'errors':[t('Errors') + ` [${errors?.errors?.length}]`, <></>], 'logs':[t('Logs') + ` [${logs?.logs?.length}]`,<> </>]}} selectedSection={currentSectionSideBar} onChange={(value) => setCurrentSectionSideBar(value)} notSection/>
                      <IconButton aria-label="close-tab" variant={'common'} bg='transparent' size='sm' icon={<RxCross2 size={'20px'}/>} onClick={() =>setClientBoxWidth(0)}/>
                </Flex>
                <Box flex='1'   pb='10vh' height={'100%'} overflow={'scroll'}> 
             
                    {currentSectionSideBar === 'data' ? 
                    <> 
                    <Box p='1vw'> 
                    <Text mb='.5vh' fontWeight={'semibold'}  fontSize={'.9em'}>{t('Description')}</Text>
                    <EditText  maxLength={2000} hideInput={false} isTextArea placeholder={`${t('Description')}...`}  value={functionData?.description} setValue={(value) => setFunctionData((prev) => ({...prev as FunctionsData, description:value}))}/>

                    <CollapsableSection mt='3vh' sectionsMap={{'Parameters':t('Parameters'), 'TildaActive':t('TildaActive'), 'ActiveChannels':t('ActiveChannels')}} section={'Parameters'} isExpanded={sectionsExpanded.includes('Parameters')} onSectionExpand={onSectionExpand}> 
                        <Skeleton isLoaded={functionData !== null}> 
                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="columns" direction="vertical">
                                        {(provided) => (
                                            <Box ref={provided.innerRef} {...provided.droppableProps} >
                                                {(functionData?.parameters || []).map((param, index) => (
                                                    <Draggable  key={`column-view-${index}`} draggableId={`column-view-${index}`} index={index}>
                                                        {(provided, snapshot) => (
                                                            <Box mt='1vh' boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.1)'} borderWidth={'1px'} borderColor={'gray.200'} borderRadius={'.5rem'} p='10px' ref={provided.innerRef}  {...provided.draggableProps} {...provided.dragHandleProps}     >
                                                                <ParameterBox variableData={param} index={index} setIndex={setSelectedParameter} editFunctionData={editFunctionData}/>
                                                             </Box>)}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </Box>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                         </Skeleton>
                         <Button variant={'common'} leftIcon={<FaPlus/>} onClick={() => setSelectedParameter(-1)} size='xs' mt='2vh'>{t('AddParameter')}</Button>

                    </CollapsableSection>

                    <CollapsableSection mt='3vh' sectionsMap={{'Parameters':t('Parameters'), 'TildaActive':t('TildaActive'), 'ActiveChannels':t('ActiveChannels')}} section={'TildaActive'} isExpanded={sectionsExpanded.includes('TildaActive')} onSectionExpand={onSectionExpand}> 
                        <Flex gap='8px' mt='1vh'  alignItems={'center'}>
                            <Switch isChecked={functionData?.is_active}  onChange={(e) => setFunctionData(prev => ({...prev as FunctionsData, is_active:e.target.checked}))} />
                            <Text mt='.5vh' fontSize={'.9em'} fontWeight={'medium'} >{t('AvailableTilda')}</Text>
                        </Flex>
                        <Text color='gray.600' whiteSpace='pre-wrap' fontSize={'.8em'}>{t('AvailableTildaDes')}</Text>

                         {functionData?.is_active && <>
                        <Text mt='3vh' fontWeight={'medium'} fontSize={'.9em'}>{t('ActiveChannels')}</Text>

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
                        <Button variant={'common'} isDisabled={functionData?.uuid === '-1'} leftIcon={<FaPlus/>} onClick={() => setShowAddChannels(true)} size='xs' mt='2vh'>{t('AddConfig')}</Button>
                        {functionData?.uuid === '-1' && <Text mt='1vh' color='red' fontSize={'.8em'}>{t('SaveChannelsWarning')}</Text>}
                        
                        </>}
                    </CollapsableSection>
                    </Box>
                    </>
                    : <>
                        {currentSectionSideBar === 'errors' ?  
                        <>
                            <Box px='1vw' pt='1vw' w='400px' > 
                                <Text whiteSpace={'normal'}   fontSize={'.8em'} color='gray.600'>{t('ReproduceErrorWarning')}</Text>
                                <Text mt='2vh' mb='1vh' fontWeight={'semibold'}>{t('Errors')}</Text>
                            </Box>
                            {(errors?.errors || []).map((error, index) => (
                                <ErrorBox error={error} key={`error-${index}`} onClickError={(args) => {setErrorSelectedArgs(args)}}/>
                            ))}
                        </>
                        :
                        <>
                            <Box px='1vw' pt='1vw' > 
                                 <Text mb='1vh' fontWeight={'semibold'}>{t('Logs')}</Text>
                            </Box>
                          {(logs.logs || []).map((log, index) => (
                                <LogBox log={log} key={`error-${index}`}/>
                            ))}
                        </>
                        }

                        </>
                    }
                </Box>
                </Box>
            </MotionBox>
        </Flex>
    

        {memoizedTestFunction}
 
    </>)
}  

export default Function


const ErrorBox = ({error, onClickError}:{error:ErrorsType, onClickError:(args:{uuid:string, args:any}) => void}) => {

    const { t } = useTranslation('settings')
    const [expandDescription, setExpandDescription] = useState<boolean>(true)
    
    return (
    <Box  px='1vw' _hover={{bg:'brand.gray_2'}} cursor={'ponter'}   w='100%'  onClick={() => onClickError({uuid:error.uuid, args:error.arguments})}>
        <Flex pt='10px' cursor={'pointer'} onClick={() => setExpandDescription(!expandDescription) } justifyContent={'space-between'} alignItems={'center'}>
            <Flex fontSize={'.8em'} alignItems={'center'} gap='10px'> 
                <Text >{error.occurred_at}</Text>
                <Text   color='red'>Error: {t('Line')} {error.line}</Text>
             </Flex>
         </Flex>
        <Box py='10px'> 
            <Text whiteSpace={'wrap'}fontSize={'.8em'} color={'gray.600'}>{error.description}</Text>
        </Box>
        <Box h='1px' w='100%' bg='gray.200' />
        
    </Box>)
}

const LogBox = ({log}:{log:LogsType}) => {

    const { t, i18n } = useTranslation('settings')
    const [expandDescription, setExpandDescription] = useState<boolean>(false)
    
    return (
        <Box  px='1vw' _hover={{bg:'brand.gray_2'}}     w='100%' >
            <Box pt='10px'  cursor={'pointer'}  onClick={() => setExpandDescription(!expandDescription) }> 
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                    <Flex fontSize={'.8em'} alignItems={'center'} gap='10px'> 
                        <Text >{log.occurred_at}</Text>
                        <Text   color={log.successful ?'green':'red'}>{log.successful ? t('RunSuccessful'):'Error'}</Text>
                    </Flex>
                    <IoIosArrowDown  className={expandDescription ? "rotate-icon-up" : "rotate-icon-down"}/>

                </Flex>
                <Text mt='5px' whiteSpace={'wrap'}fontSize={'.8em'}><span style={{fontWeight:500}}>{t('ExecutionTime')}:</span> {parseNumber(i18n, log.execution_time_ms)} ms, <span style={{fontWeight:500}}>{t('MemoryUsage')}:</span> {parseNumber(i18n, log.memory_usage_kb)} KB</Text>
            </Box>
            <Box py='7px'> 
                 <div className={`expandable-container ${expandDescription ? 'expanded' : 'collapsed'}`} style={{ overflow: expandDescription ? 'visible' : 'hidden',   transition: expandDescription ?'max-height .2s ease-in-out, opacity 0.2s ease-in-out': 'max-height .2s ease-out, opacity 0.2s ease-out'}}>      
                    <Text mt='3px' whiteSpace={'wrap'}fontSize={'.7em'} color='gray.600'><span style={{fontWeight:600}}> {t('ArgumentsLog')}:</span> {JSON.stringify(log.arguments)}</Text>
                    <Text mt='10px' whiteSpace={'wrap'}fontSize={'.7em'} color='gray.600'><span style={{fontWeight:600}}> {t('Result')}:</span> {JSON.stringify(log.result)}</Text>
                </div>
            </Box>
            <Box h='1px' w='100%' bg='gray.200' />
            
        </Box>

  )
}

//CREATING A VARIABLE
const CreateVariable = ({variableData,  index, setIndex, editFunctionData}:{variableData:parameterType | undefined, index:number, setIndex:Dispatch<SetStateAction<number | null>>, editFunctionData:(keyToEdit:'parameters' ,value:any, type?:'add' | 'delete' | 'edit', index?:number, secondKey?:'name' | 'type' | 'default' | 'required' | 'confirm' | 'is_active' | '' ) => void }) => {

    const { t } = useTranslation('settings')
    const variablesMap:{[key:string]:[string, ReactElement]} = {'boolean':[t('bool'), <AiOutlineCheckCircle/>], 'integer':[t('int'), <FiHash/>], 'number':[t('float'), <TbMathFunction/>], 'string':[t('str'), <FiType/>], 'timestamp':[t('timestamp'), <AiOutlineCalendar/>], 'list':[t('list'), <MdOutlineFormatListBulleted/>]}

    const [currentVariable, setCurrentVariable] = useState<parameterType>((index === -1 || variableData === undefined)?{name:'', type:'boolean', description:'', default:false, required:false, confirm:false, enum:[]}:variableData)
    const [currentExample, setCurrentExample] = useState<any>('')

    useEffect(() => {setCurrentExample(''), setCurrentVariable((prev) => ({...prev, enum:[], default:''}))}, [currentVariable.type])

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
        <Box p='15px' minW={'400px'}>

            <Text fontSize={'.8em'} fontWeight={'medium'} mb='.5vh'>{t('Name')}</Text>
            <EditText  maxLength={70} hideInput={false}  value={currentVariable.name} placeholder={`${t('Name')}...`} setValue={(value) => setCurrentVariable((prev) => ({...prev, name:value})) }/>
           
            <Text  fontSize={'.8em'} mb='.5vh' mt='1.5vh' fontWeight={'medium'}>{t('Description')}</Text>
            <EditText  maxLength={70} isTextArea hideInput={false}   value={currentVariable.description} placeholder={`${t('Description')}...`} setValue={(value) => setCurrentVariable((prev) => ({...prev, description:value})) }/>
        
            <Text fontSize={'.8em'}  mb='.5vh' mt='1.5vh' fontWeight={'medium'}>{t('Type')}</Text>
            <SectionSelector size='xs' onChange={(value) => setCurrentVariable((prev) => ({...prev, type:value, enum:[], default:null}))} selectedSection={currentVariable.type} sections={Object.keys(variablesMap)} sectionsMap={ variablesMap}/>

            <Text fontSize={'.8em'}  mt='1.5vh' mb='.5vh' fontWeight={'medium'}>{t('DefaultValue')}</Text>
            <Box maxW={'300px'}> 
                <VariableTypeChanger customType inputType={currentVariable.type} value={currentVariable.default} setValue={(value) => setCurrentVariable((prev) => ({...prev, default:value}))}/>
            </Box>
            
            <Text fontSize={'.8em'}   mt='1.5vh' fontWeight={'medium'}>{t('AllowedValues')}</Text>
            <Flex flexWrap="wrap" gap='5px' mt='.5vh' alignItems="center" >
                {(!currentVariable?.enum || currentVariable?.enum?.length === 0)?<Text fontSize={'.75em'}>{t('NoValues')}</Text>:
                currentVariable.enum.map((variable, index) => (
                    <Flex key={`value-${index}`} borderRadius=".4rem" p='5px' fontSize={'.75em'} alignItems={'center'}  bg='brand.gray_1'  shadow={'sm'} gap='5px'>
                        <Text>{t(variable)}</Text>
                        <Icon as={RxCross2} onClick={() => editList('delete', index)} cursor={'pointer'} />
                    </Flex>
                ))}
            </Flex>     

            <Flex mt='1vh' gap='20px' alignItems={'end'}> 
                <Box w={'300px'}> 
                    <VariableTypeChanger customType inputType={currentVariable.type} value={currentExample} setValue={(value) => setCurrentExample(value)}/>
                </Box>
                <Button isDisabled={currentExample === ''} leftIcon={<FaPlus/>} variant={'common'} size='xs' onClick={() => editList('add')}>{t('Add')}</Button>
            </Flex>

            <Flex mt='3vh' gap='10px'alignItems={'center'}>
                <Switch isChecked={currentVariable.required} onChange={(e) => setCurrentVariable((prev) => ({...prev, required:e.target.checked}))}/>
                <Text fontSize={'.8em'}  fontWeight={'medium'}>{t('Required')}</Text>  
            </Flex>  

            <Flex mt='3vh' gap='10px'alignItems={'center'}>
                <Switch isChecked={currentVariable.confirm} onChange={(e) => setCurrentVariable((prev) => ({...prev, confirm:e.target.checked}))}/>
                <Text fontSize={'.8em'} fontWeight={'medium'}>{t('AskConfirmation')}</Text>  
            </Flex>  
        </Box>
 
        <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} >
            <Button variant={'main'}  isDisabled={currentVariable.name === '' || (index !== -1 && JSON.stringify(variableData) === JSON.stringify(currentVariable))} size='sm' onClick={sendVariable}>{index === -1 ? t('CreateParameter'): t('SaveParameter')}</Button>
            <Button variant={'common'}  size='sm' onClick={() => setIndex(null)}>{t('Cancel')}</Button>
        </Flex>
        
    </>)
}
 
const ParameterBox = ({variableData,  index, setIndex, editFunctionData}:{variableData:parameterType, index:number, setIndex:Dispatch<SetStateAction<number | null>>, editFunctionData:(keyToEdit:'parameters' ,value:any, type?:'add' | 'delete' | 'edit', index?:number, secondKey?:'name' | 'type' | 'default' | 'required' | 'confirm' | 'is_active' | '' ) => void }) => {
    
    //TRANSLATION
    const { t }  = useTranslation('settings')

    //MAPPING CONSTANTS
    const variablesMap:{[key:string]:[string, string]} = {'boolean': ['bool', 'green'], 'integer': ['int', 'blue'], 'number': ['float', 'purple'], 'string': ['str', 'orange'],        'timestamp': ['timestamp', 'teal'], 'list': ['list', 'red']}
    
    //IS HOVERING
    const [isHovering, setIsHovering] = useState<boolean>(false)

    return (
        <Box position={'relative'}  w={'100%'} cursor={'pointer'} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} >
             <Icon opacity={isHovering?1:0} transition={'opacity 0.2s ease-in-out'} pointerEvents={'none'} as={BsThreeDotsVertical} position={'absolute'} left={'-12px'} top={'4px'}/>
         
            <Flex alignItems={'center'} justifyContent={'space-between'} gap='10px'> 
                <Flex  gap='5px' alignItems={'center'} >
                    <Text fontWeight={'medium'}  fontSize={'.9em'}>{variableData.name}{variableData.required ? ':':'?: '} <span style={{color:variablesMap[variableData.type][1]}}>{variablesMap[variableData.type][0]}</span> {variableData.required ? '':'='} <span style={{color:'#2B6CB0'}}>{!variableData.required ? variableData.default === null ? 'null':String(variableData.default):''}</span></Text>
                </Flex>
                <Flex gap='5px'> 
                    <IconButton size='xs' variant={'common'} icon={<FaEdit/>}  onClick={() => setIndex(index)} aria-label="edit-param"/>
                    <IconButton size='xs' variant={'delete'} onClick={() => editFunctionData('parameters', null, 'delete', index)} icon={<HiTrash/>} aria-label="delete-param"/>
                </Flex>
            </Flex>
            
            <Text flex={1} mt='.5vh' whiteSpace={'break-spaces'} fontSize={'.75em'} color='gray.600'>{variableData.description === ''?t('NoDescription'):variableData.description }</Text>
            
            {variableData.enum && 
            <Flex  mt='.5vh' gap='5px' justifyContent={'space-between'}>
                <Box flex='1'>
                    <Text fontSize={'.8em'} flex={1}><span style={{fontWeight:500}}> {t('AllowedValues')}</span> <span style={{color:'#4A5568'}}>{variableData.enum.length === 0?t('NoValues'):variableData.enum.map((value, index) => (<span key={`value-${index}`} >{t(value)} {index < (variableData?.enum || []).length - 1 && ', '}</span>))}</span></Text>
                </Box>
            </Flex>}
        </Box>
        )
}


