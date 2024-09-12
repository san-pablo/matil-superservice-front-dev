//REACT
import { useEffect, useRef, useState, useMemo } from "react"
import { useAuth } from "../../../AuthContext"
import { useTranslation } from "react-i18next"
import { useSession } from "../../../SessionContext"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Text, Box, Flex, Button, Textarea, Skeleton, Tooltip, IconButton, NumberInput, NumberInputField } from "@chakra-ui/react"
//PYTHON CODE EDITOR
import CodeMirror from "@uiw/react-codemirror"
import { python } from "@codemirror/lang-python"
import { oneDark } from "@codemirror/theme-one-dark"
//COMPONENTS
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import EditText from "../../Components/Reusable/EditText"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import CustomSelect from "../../Components/Reusable/CustomSelect"
import Table from "../../Components/Reusable/Table"
import '../../Components/styles.css'
//FUNCTIONS
import copyToClipboard from "../../Functions/copyTextToClipboard"
//ICONS
import { FaPlus } from "react-icons/fa6"
import { IoIosArrowBack,IoIosArrowDown } from "react-icons/io"
import { BsTrash3Fill, BsClipboard2Check } from "react-icons/bs"
import { RxCross2 } from "react-icons/rx"
//TYPING
import { FunctionsData } from "../../Constants/typing"
import { useLocation } from "react-router-dom"

//TYPING
type variables = 'bool' | 'int' | 'float' | 'str' | 'timestamp'

interface FunctionType { 
    name: string
    description: string
    actions: {}
    arguments: {name: string, type: string, default: any}[]
    outputs: {name: string, type: string, default: any}[]
    code: string
    errors: {message: string, line: number, timestamp: string, arguments: {name: string, type: string, value: any}[]}[] 
  }
  
const CellStyle = ({ column, element }:{column:string, element:any}) => {
    return ( <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>)
}

//MAIN FUNCTION
const Functions = () => {

    //CONSTANTS
    const { t } = useTranslation('settings')
    const auth = useAuth()
    const session = useSession()
    const location = useLocation().pathname
    const functionsDataMap:{[key:string]:[string, number]} = {uuid:[t('Id'), 200], name:[t('name'), 200], description:[t('description'), 300], number_of_errors:[t('NumberErrors'), 100]} 

    //CREATE NEW FUNCTION OR EDITING ONE
    const [editFunctionUuid, setEditFunctionUuid] = useState<string | null>(location.split('/')[3]?location.split('/')[3] :null)

    //TICKETS DATA
    const [functionsData, setFunctionsData] = useState<FunctionsData[] | null>(null)

    //FETCH NEW DATA WHEN THE VIEW CHANGE
    useEffect(() => {        
        document.title = `${t('Functions')} - ${auth.authData.organizationName} - Matil`
        const fetchInitialData = async() => {
            if (session.sessionData.flowsFunctions.functions) setFunctionsData(session.sessionData.flowsFunctions.functions)
            else {
                const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/functions`, setValue:setFunctionsData, auth})
                if (response?.status === 200) session.dispatch({type:'UPDATE_FUNCTIONS',payload:{data:response?.data}})
            }
        }
        fetchInitialData()
    }, [])
    
    const onSaveFunction = async(action:'save' | 'go-back') => {
        if (action === 'go-back') setEditFunctionUuid(null)
        else {const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/functions`, setValue:setFunctionsData, auth})}
        setEditFunctionUuid(null)
    }

   return(<>
    
    {editFunctionUuid ?<EditFunctionBox selectedUuid={editFunctionUuid} onSaveFunction={onSaveFunction}/>: 
    <Box height={'100%'} width={'100%'} p='2vw'> 

        <Flex justifyContent={'space-between'} alignItems={'end'}> 
            <Box> 
                <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('Functions')}</Text>
                <Text color='gray.600' fontSize={'.9em'}>{t('FunctionsDes')}</Text>
            </Box>
            <Button  leftIcon={<FaPlus/>} onClick={() => setEditFunctionUuid('-1')}>{t('CreateFunction')}</Button>
        </Flex>
        <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='5vh'/>

        <Skeleton isLoaded={functionsData !== null}> 
            <Text mb='2vh' fontWeight={'medium'} fontSize={'1.2em'}>{t('functionsCount', {count:functionsData?.length})}</Text>
        </Skeleton>

        <Skeleton isLoaded={functionsData !== null}> 
            <Table data={functionsData?functionsData:[]} CellStyle={CellStyle} noDataMessage={t('NoFunctions')} columnsMap={functionsDataMap} onClickRow={(value:any, index:number) => setEditFunctionUuid(value.uuid)}/>
        </Skeleton>
    </Box>
    }
    </>)
}

export default Functions


 //BOX FOR ADDING, EDITING AND DELETE A FUNCTION
const EditFunctionBox = ({selectedUuid, onSaveFunction }:{selectedUuid:string, onSaveFunction:(action:'save' | 'go-back') => void}) => {   

    //CONSTATNS
    const { t } = useTranslation('settings')
    const auth = useAuth()
    const variablesMap:{[key in variables]:string} = {'bool':t('bool'), 'int':t('int'), 'float':t('float'), 'str':t('str'), 'timestamp':t('timestamp')}
    const boolDict = {"True":t('true'), "False":t('false')}
    const datesMap = {'{today}':t('today'), '{yesterday}':t('yesterday'), '{start_of_week}':t('start_of_week'),'{start_of_month}':t('start_of_month')}

    //TEXT REF
    //BUTTON REF
    const testButtonRef = useRef<HTMLButtonElement>(null)
    const codeBoxRef = useRef<HTMLDivElement>(null) 
    const newFunction:FunctionType = {
        name:t('NewFunction'),
        description:'',
        actions:{},
        arguments:[],
        outputs:[],
        code:'',
        errors:[]
    }
   
    //SHOW MORE INFO BOX
    const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false)

    //FUNCTION DATA
    const [functionData, setFunctionData] = useState<FunctionType | null>(null)

    //FETCH FUNCTION DATA
    useEffect(() => {        
        const fetchInitialData = async() => {
            if (selectedUuid === '-1') setFunctionData(newFunction)
            else {
                const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/functions/${selectedUuid}`, setValue:setFunctionData, auth})
                console.log(response?.data)
            }
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
        const isNew = selectedUuid === '-1' 
        let response
        if (isNew) {
            response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/functions`, setWaiting:setWaitingEdit, method:'post', requestForm:functionData as FunctionType, auth, toastMessages:{'works':t('CorrectAddedFunction'), 'failed':t('FailedAddedFunction')}})
         }
        else response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/functions/${selectedUuid}`, setWaiting:setWaitingEdit, method:'put', requestForm:functionData as FunctionType, auth, toastMessages:{'works':t('CorrectEditedFunction'), 'failed':t('FailedEditedFunction')}})

        if (response?.status == 200) onSaveFunction('save')          
    }

    //DELETE A FUNCTION
    const handleDeleteFunctions= async() => {
        setWaitingDelete(true)
        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/functions/${selectedUuid}`, setWaiting:setWaitingDelete, method:'delete', auth, toastMessages:{'works':t('CorrectDeletedFunctions'), 'failed':t('FailedDeletedFunctions')}})
        if (response?.status == 200) onSaveFunction('save')   
    }

    //EDIT FUNCTION DATA
    const editFunctionData = (keyToEdit:string ,value:string, type?:'add' | 'delete' | 'edit', index?:number, secondKey?:'name' | 'type' | 'default' ) => {
        setFunctionData(prev => {
            if (!prev) return prev
            const updatedFunction = { ...prev }
        
            if (type === 'add' || type === 'edit') {
                const listKey = keyToEdit as 'arguments' | 'outputs'
                const list = updatedFunction[listKey]
                if (index!== undefined && secondKey !== undefined && index >= 0 && index < list.length) list[index] = { ...list[index], [secondKey]: value }
                else if (type === 'add') list.push({name: '', type: 'bool', default: 'True'})
                updatedFunction[listKey] = list
            } 
            else if (type === 'delete' && index !== undefined) {
              const listKey = keyToEdit as 'arguments' | 'outputs'
              const list = updatedFunction[listKey]
              if (index >= 0 && index < list.length) {
                list.splice(index, 1)
                updatedFunction[listKey] = list
              }
            } 
            else updatedFunction[keyToEdit as 'name' | 'description' | 'code'  ] = value
            
            return { ...prev, updatedFunction }
          })
    }

    const testFunction = async () => {
        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/functions/${selectedUuid}/run`, method:'post',  auth, requestForm:{numero_pedido:'500045555', numero_telefono:'656306361'}})
    }
    
    //BOX FOR CONFIRMING THE DELETION OF A FUNCTION
    const memoizedDeleteBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowConfirmDelete} isSectionWithoutHeader={true}> 
                <Box p='15px'> 
                    <Text width={'400px'}  fontWeight={'medium'}>{t('DeleteFunction')}</Text>
                </Box>
                <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                    <Button size='sm' color='red' _hover={{color:'red.600', bg:'gray.200'}} onClick={handleDeleteFunctions}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                    <Button size='sm' onClick={() => setShowConfirmDelete(false)}>{t('Cancel')}</Button>
                </Flex>
            </ConfirmBox>
    ), [showConfirmDelete])

   
    const codeBoxHeight =  (window.innerHeight - window.innerWidth * 0.02) - (testButtonRef.current?.getBoundingClientRect().bottom || 1000 )
    //FRONT
    return(<>
        {showConfirmDelete && memoizedDeleteBox}
        <Skeleton isLoaded={functionData !== null}> 
            <Box height={'calc(100vh - 60px)'} bg='white' width={'100%'} p='2vw' position='relative'> 

                <Box minW={'500px'}  p='10px' left={'1vw'}  top='1vw' zIndex={100} position={'absolute'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} maxH={'calc(100vh - 10vw)'} overflow={'scroll'} bg='white' borderRadius={'.5rem'}  > 
                    <Flex flex={1} gap='20px' alignItems={'center'}> 
                        <Tooltip label={'Atrás'}  placement='bottom' hasArrow bg='black'  color='white'  borderRadius='.4rem' fontSize='.75em' p='4px'> 
                            <IconButton aria-label='go-back' size='sm' bg='transparent' border='none' onClick={() => onSaveFunction('go-back')} icon={<IoIosArrowBack size='20px'/>}/>
                        </Tooltip>
                        <Box flex={1}> 
                            <EditText nameInput={true} size='md' value={functionData?.name} setValue={(value) =>editFunctionData('name', value)}/>
                        </Box>
                        <Button leftIcon={<IoIosArrowDown className={!showMoreInfo ? "rotate-icon-up" : "rotate-icon-down"}/>} size='sm' bg='transparent' borderColor={'transparent'} borderWidth={'1px'} onClick={() => setShowMoreInfo(!showMoreInfo)}>{t('SeeMoreData')}</Button>
                    </Flex>

                    {showMoreInfo && 
                        <Box p='15px'>
                            <Text  mt='3vh' mb='.5vh' fontWeight={'medium'}>{t('Description')}</Text>
                            <Textarea maxW={'1000px'} resize={'none'} maxLength={2000} height={'auto'} placeholder={`${t('DescriptionPlaceholder')}...`}  value={functionData?.description} onChange={(e) => editFunctionData('description', e.target.value)} p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "rgb(77, 144, 254)", borderWidth: "2px"}}/>
                            <Flex  mt='4vh' gap='2vw'  justifyContent={'space-between'} > 
                                <Box flex='1'>
                                    <Text mb='.5vh' fontWeight={'medium'}>{t('Arguments')}</Text>
                                    {functionData?.arguments.map((arg, index) => (
                                        <Flex mt='.5vh'  key={`argument-${index}`} alignItems='center' gap='10px'>
                                        <Box flex='2'> 
                                            <EditText hideInput={false} value={arg.name} setValue={(value) => editFunctionData('arguments', value, 'edit', index, 'name')}/>
                                        </Box>
                                        <Box flex='1'>
                                                <CustomSelect hide={false} selectedItem={arg.type} setSelectedItem={(value) => editFunctionData('arguments', value, 'edit', index, 'type')} options={Object.keys(variablesMap)} labelsMap={variablesMap}/>
                                        </Box>
                                        <Box flex='2'>
                                            {(() => {switch(arg.type) {
                                                case 'bool':
                                                    return <CustomSelect hide={false} selectedItem={arg.default} setSelectedItem={(value) => editFunctionData('arguments', value, 'edit', index, 'default')}  options={Object.keys(boolDict)} labelsMap={boolDict}/>
                                                case 'int':
                                                case 'float': return (
                                                    <NumberInput value={arg.default || undefined} onChange={(value) => editFunctionData('arguments', value, 'edit', index, 'default')} min={1} max={1000000} clampValueOnBlur={false} >
                                                        <NumberInputField borderRadius='.5rem'  fontSize={'.9em'} height={'37px'}  borderColor={'gray.300'} _hover={{ border:'1px solid #CBD5E0'}} _focus={{ px:'11px', borderColor: "rgb(77, 144, 254)", borderWidth: "2px" }} px='12px' />
                                                    </NumberInput>)              
                                                case 'str':
                                                        return <EditText value={arg.default || undefined} setValue={(value) => editFunctionData('arguments', value, 'edit', index, 'default')} hideInput={false} />
                                                case 'timestamp':
                                                    return <CustomSelect hide={false} selectedItem={arg.default}  setSelectedItem={(value) => editFunctionData('arguments', value, 'edit', index, 'default')}  options={Object.keys(datesMap)} labelsMap={datesMap}/>
                                            }})()}                                   
                                            </Box>
                                        <IconButton bg='transaprent' border='none' size='sm' _hover={{bg:'gray.200'}} icon={<RxCross2/>} aria-label='delete-all-condition' onClick={() => editFunctionData('arguments', '', 'delete', index)}/>
                                    </Flex>
                                    ))}
                                    <Button size='sm' mt='2vh' leftIcon={<FaPlus/>}  onClick={() => editFunctionData('arguments', '', 'add')}>{t('AddArgument')}</Button>

                                </Box>
                                <Box flex='1'>
                                <Text mb='.5vh' fontWeight={'medium'}>{t('Outputs')}</Text>
                                {functionData?.outputs.map((arg, index) => (
                                    <Flex mt='.5vh'  key={`argument-${index}`} alignItems='center' gap='10px'>
                                    <Box flex='2'> 
                                        <EditText hideInput={false} value={arg.name} setValue={(value) => editFunctionData('outputs', value, 'edit', index, 'name')}/>
                                    </Box>
                                    <Box flex='1'>
                                            <CustomSelect hide={false} selectedItem={arg.type} setSelectedItem={(value) => editFunctionData('outputs', value, 'edit', index, 'type')} options={Object.keys(variablesMap)} labelsMap={variablesMap}/>
                                    </Box>
                                    <Box flex='2'>
                                        {(() => {switch(arg.type) {
                                            case 'bool':
                                                return <CustomSelect hide={false} selectedItem={arg.default} setSelectedItem={(value) => editFunctionData('outputs', value, 'edit', index, 'default')}  options={Object.keys(boolDict)} labelsMap={boolDict}/>
                                            case 'int':
                                            case 'float': return (
                                                <NumberInput value={arg.default || undefined} onChange={(value) => editFunctionData('outputs', value, 'edit', index, 'default')} min={1} max={1000000} clampValueOnBlur={false} >
                                                    <NumberInputField borderRadius='.5rem'  fontSize={'.9em'} height={'37px'}  borderColor={'gray.300'} _hover={{ border:'1px solid #CBD5E0'}} _focus={{ px:'11px', borderColor: "rgb(77, 144, 254)", borderWidth: "2px" }} px='12px' />
                                                </NumberInput>)              
                                            case 'str':
                                                    return <EditText value={arg.default || undefined} setValue={(value) => editFunctionData('outputs', value, 'edit', index, 'default')} hideInput={false} />
                                            case 'timestamp':
                                                return <CustomSelect hide={false} selectedItem={arg.default}  setSelectedItem={(value) => editFunctionData('outputs', value, 'edit', index, 'default')}  options={Object.keys(datesMap)} labelsMap={datesMap}/>
                                        }})()}                                   
                                        </Box>
                                    <IconButton bg='transaprent' border='none' size='sm' _hover={{bg:'gray.200'}} icon={<RxCross2/>} aria-label='delete-all-condition' onClick={() => editFunctionData('outputs', '', 'delete', index)}/>
                                </Flex>
                                ))}
                                <Button size='sm' mt='2vh' leftIcon={<FaPlus/>}  onClick={() => editFunctionData('outputs', '', 'add')}>{t('AddOutput')}</Button>

                            </Box>
                        </Flex>
                        </Box>}
                </Box>

                <Box flex='1' > 
                    <Flex  gap='2vw' justifyContent={'space-between'} flexDir={'row-reverse'} alignItems={'center'}>     
                        <Flex gap='20px'> 
                            {selectedUuid !== '-1' && <Button  color='red' leftIcon={<BsTrash3Fill/>} onClick={() => setShowConfirmDelete(true)}>{t('DeleteFunction')}</Button>}
                            <Button  isDisabled={functionData?.name=== '' || functionData?.code === ''} onClick={() => handleEditFunctions()}>{waitingEdit?<LoadingIconButton/>:t('SaveChanges')}</Button>
                         </Flex>
                    </Flex>

                    <Flex gap='2vw' mt='4vh'>    
                        <Box  width='60%'> 
                            <Flex justifyContent={'space-between'} alignItems={'center'}> 
                                <Text  mb='.5vh' fontWeight={'medium'}>{t('Code')}</Text>
                                <Button ref={testButtonRef} size='sm' onClick={() => testFunction()} color='white' _hover={{bg:'brand.gradient_blue_hover'}} bg='brand.gradient_blue'> {t('Test')}</Button>
                            </Flex>
                            <Box  mt='1vh' width='100%' height={'100%'} ref={codeBoxRef}> 
                                <CodeMirror value={functionData?.code} maxHeight={`${codeBoxHeight}px`} extensions={[python()]} onChange={(value) => editFunctionData('code', value)} theme={oneDark}/>
                            </Box>
                        </Box>

                        <Box flex='1'> 
                            <Text fontWeight={'medium'}   mb='2vh'>{t('Errors')}</Text>
                            {functionData?.errors.length === 0 ?<Text>{t('NoErrors')}</Text>:
                            <Box overflow={'scroll'} maxH={'80vh'} borderColor={'gray.300'} borderWidth={'1px'} borderRadius={'.5rem'}>
                                {functionData?.errors.map((error, index) => (
                                        <Flex bg={index % 2 === 0?'gray.100':'gray.50'} p='15px' alignItems={'center'} key={`error-${index}`} justifyContent={'space-between'} gap='30px'>
                                            <Box flex='1' gap='30px' >
                                                <Flex gap='10px'> 
                                                    <Text whiteSpace={'nowrap'} fontWeight={'medium'}>{error.timestamp}</Text>
                                                    <Box> 
                                                        <Text>{error.message}</Text>
                                                        <Text color='red'>[{t('ErrorLine', {line:error.line})}] {error.arguments.map((arg, argIndex) => (<span>{t('ErrorArgument', {name:arg.name, type:arg.type, value:arg.value})}{argIndex === error.arguments.length - 1 ?'':', '}</span>))} </Text>
                                                    </Box>
                                                </Flex>
                                            </Box>        
                                            <Tooltip label={t('CopyError')}  placement='top' hasArrow bg='black' color='white'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                                                <IconButton size='xs' onClick={() => copyToClipboard(error.message)}  aria-label={'copy-invitation-code'} icon={<BsClipboard2Check/>}/>
                                            </Tooltip>
                                        </Flex>
                                    ))} 
                            </Box>}
                        </Box>

                    </Flex>    
                
                </Box>
                
            </Box>
        </Skeleton>
    </>)
}  
