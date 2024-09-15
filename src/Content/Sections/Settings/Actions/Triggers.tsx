
//REACT
import  { useState, useEffect, useRef, Dispatch, SetStateAction, useMemo } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Button, Skeleton, Tooltip, IconButton, Textarea } from "@chakra-ui/react"
//COMPONENTS
import CodeMirror from "@uiw/react-codemirror"
import { html } from "@codemirror/lang-html"
import { oneDark } from "@codemirror/theme-one-dark"
import EditText from '../../../Components/Reusable/EditText'
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
import ConfirmBox from '../../../Components/Reusable/ConfirmBox'
import EditStructure from '../../../Components/Reusable/EditStructure'
import CustomSelect from '../../../Components/Reusable/CustomSelect'
import VariableTypeChanger from '../../../Components/Reusable/VariableTypeChanger'
//ICONS
import { BsTrash3Fill } from "react-icons/bs"
import { FaPlus } from 'react-icons/fa6'
import { IoIosArrowBack } from 'react-icons/io'
import { RxCross2 } from 'react-icons/rx'
//TYPING 
import { FieldAction, ActionsType } from '../../../Constants/typing'
import Table from '../../../Components/Reusable/Table'

//TYPING
interface AutomationData  {
    name: string,
    description: string,
    all_conditions:FieldAction[]
    any_conditions:FieldAction[]
    actions:{type:ActionsType, content:any}[]
}

const CellStyle = ({column, element}:{column:string, element:any}) => {return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>}

//MAIN FUNCTION
function Triggers () {

    //AUTH CONSTANT
    const auth = useAuth()
    const { t } = useTranslation('settings')
    const newTrigger:AutomationData = {
        name: t('NewTrigger'),
        description: '',
        all_conditions:[],
        any_conditions:[],
        actions:[]
    }
    
    //TRIGERS DATA
    const [triggerData, setTriggerData] = useState<AutomationData[] | null>(null)

    //SELECTED GROUP
    const [selectedIndex, setSelectedIndex] = useState<number>(-2)

    //FILTER TRIGGER DATA
    const [text, setText]  =useState<string>('')
    const [filteredTriggerData, setFilteredTriggerData] = useState<AutomationData[]>([])
    useEffect(() => {
        const filterUserData = () => {
            if (triggerData) {
                const filtered = triggerData.filter(user =>
                    user.name.toLowerCase().includes(text.toLowerCase()) ||
                    user.description.toLowerCase().includes(text.toLowerCase()) 
                  )
                setFilteredTriggerData(filtered)
            }
        }
        filterUserData()
    }, [text, triggerData])

    //FETCH INITIAL DATA
    useEffect(() => {
        const fetchTriggerData = async () => {
            const response  = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/triggers`, setValue:setTriggerData, auth})
            console.log(response?.data)
        }
        document.title = `${t('Actions')} - ${t('Triggers')} - ${auth.authData.organizationName} - Matil`
        fetchTriggerData()
    }, [])

    //FRONT
    return(<>
        {(selectedIndex >= -1 && triggerData !==  null) ? <EditTrigger triggerData={selectedIndex === -1 ?newTrigger :triggerData?.[selectedIndex] as AutomationData} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex}  allTriggers={triggerData} setAllTriggers={setTriggerData}/>:<>
        <Flex justifyContent={'space-between'} alignItems={'end'}> 
            <Box> 
                <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('Triggers')}</Text>
                <Text color='gray.600' fontSize={'.9em'}>{t('TriggersDes')}</Text>
            </Box>
            <Button leftIcon={<FaPlus/>} onClick={() => {setSelectedIndex(-1)}}>{t('CreateTrigger')}</Button>
        </Flex>

        <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='5vh'/>
        <Skeleton isLoaded={triggerData !== null}> 
            <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('TriggersCount', {count:triggerData?.length})}</Text>
        </Skeleton>
 
        <Flex  mt='2vh'justifyContent={'space-between'} alignItems={'end'}>
            <Skeleton isLoaded={triggerData !== null}> 
                <Box width={'350px'}> 
                    <EditText value={text} setValue={setText} searchInput={true}/>
                </Box>
            </Skeleton>
            <Flex gap='10px'> 
                <Button size='sm' leftIcon={<FaPlus/>} onClick={() => {setSelectedIndex(-1)}}>{t('CreateTrigger')}</Button>
            </Flex> 
        </Flex>
        <Skeleton mt='2vh' isLoaded={triggerData !== null}> 
            <Table data={filteredTriggerData} CellStyle={CellStyle} columnsMap={{'name':[t('Name'), 150], 'description':[t('Desription'), 350]}} noDataMessage={t('NoTriggers')} onClickRow={(row, index) => setSelectedIndex(index)} />  
        </Skeleton>
        </>}
    </>)
}

//COMPONENT FOR EDITING AUTOMATIONS
const EditTrigger = ({triggerData, selectedIndex, setSelectedIndex, allTriggers, setAllTriggers }:{triggerData:AutomationData, selectedIndex:number, setSelectedIndex:Dispatch<SetStateAction<number >>,allTriggers:AutomationData[], setAllTriggers:Dispatch<SetStateAction<AutomationData[] | null>>}) => {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('settings')

    //BOX SCROLL REF
    const scrollRef = useRef<HTMLDivElement>(null)

    //BOOLEAN FOR WAIT TO THE SEND GROUP
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    //BOOLEAN SHOWING DELETE BOX
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)

    //GROUP DATA
    const automationDataRef = useRef<AutomationData>(triggerData)
    const [currentAutomationData, setCurrentAutomationData] = useState<AutomationData>(triggerData)

    //SEND AUTOMATION
    const sendTrigger = async () => {
        setWaitingSend(true)
        let newAutomations:AutomationData[]
        if (selectedIndex === -1) newAutomations = [...allTriggers, currentAutomationData]
        else {
            const updatedAutomations = [...allTriggers]
            updatedAutomations[selectedIndex] = currentAutomationData
            newAutomations = updatedAutomations
        }

        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/triggers`, requestForm:newAutomations, method:'put', setWaiting:setWaitingSend, auth, toastMessages:{works:selectedIndex === -1?t('CorrectCreatedTrigger'):t('CorrectUpdatedTrigger'), failed: selectedIndex === -1?t('FailedCreatedTrigger'):t('FailedUpdatedTrigger')}})
        if (response?.status === 200) {
            setSelectedIndex(-2)
            setAllTriggers(newAutomations)
        }
    }
 
    //ADD A CONDITION OR AN ACTION
    const addElement = (type: 'all_conditions' | 'any_conditions' | 'actions') => {
        const newElement = type === 'actions' ? {type:'email_csat', content:{content:''}}:{motherstructure:'ticket', is_customizable:false, name:'user_id', op:'eq', value:-1}
        setCurrentAutomationData((prev) => ({ ...prev, [type]: [...prev[type],newElement]}))
    }
    //DELETE A CONDITION OR AN ACTION
    const removeElement = (type: 'all_conditions' | 'any_conditions' | 'actions' , index: number ) => {
        setCurrentAutomationData((prev) => {
        const conditionList = [...prev[type]]
        const updatedConditionList = [...conditionList.slice(0, index), ...conditionList.slice(index + 1)]
        return {...prev, [type]: updatedConditionList}  
        })
    }
    //EDIT A CONDITION OR AN ACTION
    const editElement = (type:'all_conditions' | 'any_conditions' | 'actions', index:number, keyToEdit:'type' | 'content' | 'motherstructure' | 'is_customizable' | 'name' | 'op' | 'value', value:any, actionKey?:string) => {
        setCurrentAutomationData((prev) => {
            const lastConditionList = [...prev[type]]

            let updatedCondition
            if (actionKey) updatedCondition = {...lastConditionList[index], content: {...(lastConditionList[index] as {type:ActionsType, content:any}).content, [actionKey]:value}}
            else updatedCondition = {...lastConditionList[index], [keyToEdit]: value}

            const updatedConditionList = [...lastConditionList.slice(0, index), updatedCondition, ...lastConditionList.slice(index + 1)]
            return {...prev, [type]: updatedConditionList}
        })
    }

    //ACTIONS MAPPING
    const actionsList:ActionsType[] = ['email_csat', 'whatsapp_csat', 'webchat_csat', 'agent_email_notification', 'motherstructure_update']
    const actionsMap:{[key in ActionsType]:string} = {'email_csat':t('email_csat'), 'whatsapp_csat':t('whatsapp_csat'), 'webchat_csat':t('webchat_csat'), 'agent_email_notification':t('agent_email_notification'), 'motherstructure_update':t('motherstructure_update')}
    const operationTypesDict = {'user_id':['eq', 'neq',  'exists'], 'group_id':['eq', 'neq',  'exists'], 'channel_type':['eq', 'neq', 'exists'], 'title':['eq', 'neq', 'exists'], 'subject':['eq', 'neq', 'exists'], 'urgency_rating':['eq', 'neq', 'leq', 'geq', 'exists'], 'status':['eq', 'neq'], 'unseen_changes':['eq', 'exists'], 'tags':['contains', 'ncontains', 'exists'], 'is_matilda_engaged':['eq', 'exists'],'is_satisfaction_offered':['eq', 'exists'],
    'contact_business_id':['eq', 'neq',  'exists'], 'name':['eq', 'neq', 'contains', 'ncontains', 'exists'], 'language':['eq', 'neq',  'exists'], 'rating':['eq','neq', 'leq', 'geq', 'exists'], 'notes':['eq', 'neq', 'contains', 'ncontains', 'exists'], 'labels':['contains', 'ncontains', 'exists'],
    'domain':['eq', 'neq', 'contains', 'ncontains', 'exists'], 'hours_since_created':['eq', 'neq', 'leq', 'geq',  'exists'], 'hours_since_updated':['eq', 'neq', 'leq', 'geq',   'exists']
    }

    //FUNCTION FOR DELETING THE TRIGGER
    const DeleteComponent = () => {

        //WAITING DELETION
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

        //FUNCTION FOR DELETING AN AUTOMATION
        const deleteTrigger= async () => {
            setWaitingDelete(true)
            let newAutomations: AutomationData[]
            if (selectedIndex === -1) return
            else newAutomations = allTriggers.filter((_, index) => index !== selectedIndex)
        
            const response = await fetchData({endpoint: `superservice/${auth.authData.organizationId}/admin/settings/triggers`, requestForm: newAutomations, method: 'put', setWaiting: setWaitingDelete, auth, toastMessages: {works: t('CorrectDeletedTrigger'), failed: t('FailedDeletedTrigger')}})
            if (response?.status === 200) {
                setAllTriggers(newAutomations)
                setSelectedIndex(-2)
            }
        }

        //FRONT
        return(<>
            <Box p='15px'> 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ConfirmDelete')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Text >{t('ConfirmDeleteTrigger')}</Text>
            </Box>
            <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                <Button  size='sm' colorScheme='red' onClick={deleteTrigger}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                <Button  size='sm' onClick={()=>setShowConfirmDelete(false)}>{t('Cancel')}</Button>
            </Flex>
        </>)
    }

    //DELETE BOX
    const memoizedDeleteBox = useMemo(() => (
        <ConfirmBox isSectionWithoutHeader setShowBox={setShowConfirmDelete}> 
            <DeleteComponent/>
        </ConfirmBox>
    ), [showConfirmDelete])

    //FRONT
    return (<>
    {showConfirmDelete && memoizedDeleteBox}
    <Flex height={'100%'} minH='90vh' width={'100%'} flexDir={'column'}> 
        <Box flex='1'  py='2vh'> 
            <Flex justifyContent={'space-between'} alignItems={'center'}> 
                <Flex gap='20px' alignItems={'center'}> 
                    <Tooltip label={'Atrás'}  placement='bottom' hasArrow bg='black'  color='white'  borderRadius='.4rem' fontSize='.75em' p='4px'> 
                        <IconButton aria-label='go-back' size='sm' bg='transparent' border='none' onClick={() => setSelectedIndex(-2)} icon={<IoIosArrowBack size='20px'/>}/>
                    </Tooltip>
                    <Box minW='500px'> 
                        <EditText nameInput={true} size='md' value={currentAutomationData.name} setValue={(value) => {setCurrentAutomationData((prev) => ({...prev, name:value}))}}/>
                    </Box>
                </Flex>
                <Flex gap='20px'> 
                    {selectedIndex !== -1 && <Button size='sm'  color='red' leftIcon={<BsTrash3Fill/>} onClick={() => setShowConfirmDelete(true)}>{t('DeleteTrigger')}</Button>}
                    <Button size='sm'  onClick={sendTrigger} isDisabled={currentAutomationData.name === ''  || currentAutomationData.actions.length === 0 || ((JSON.stringify(currentAutomationData) === JSON.stringify(automationDataRef.current)))}>{waitingSend?<LoadingIconButton/>:t('SaveChanges')}</Button>
                </Flex>
            </Flex>
            <Text fontSize={'1.1em'} mt='2vh' mb='1vh'  fontWeight={'medium'}>{t('Description')}</Text>
            <Textarea resize={'none'} maxLength={2000} height={'auto'} placeholder={`${t('Description')}...`} maxH='300px' value={currentAutomationData.description} onChange={(e) => setCurrentAutomationData((prev) => ({...prev, description:e.target.value}))} p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "rgb(77, 144, 254)", borderWidth: "2px"}}/>

            <Text fontWeight={'medium'} fontSize={'1.1em'} mt='3vh'>{t('Conditions')}</Text>
            <Text mt='1vh' mb='1vh' color='gray.600' >{t('AllConditionsAut')}</Text>
            {currentAutomationData.all_conditions.map((condition, index) => (
                <Box position={'relative'} overflow={'scroll'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} borderRadius={'.5em'} mt='2vh' p='15px'>
                    <Box position={'absolute'} top={'15px'} right={'15px'}> 
                        <IconButton bg='transaprent' border='none' color='red' size='sm' _hover={{bg:'gray.200'}} icon={<RxCross2/>} aria-label='delete-all-condition' onClick={() => removeElement('all_conditions', index)}/>
                    </Box>
                    <EditStructure data={condition} setData={(structure, value) => {editElement('all_conditions', index, structure, value)}} scrollRef={scrollRef} operationTypesDict={operationTypesDict}/>
                </Box>
            ))}
            <Button mt='2vh'  leftIcon={<FaPlus/>} size='sm'  onClick={() => addElement('all_conditions')}>{t('AddCondition')}</Button>

            <Text mt='3vh' mb='1vh'color='gray.600'>{t('AnyConditionsAut')}</Text>
            {currentAutomationData.any_conditions.map((condition, index) => (
                <Box position={'relative'} overflow={'scroll'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} borderRadius={'.5em'} mt='2vh' p='15px'>
                    <Box position={'absolute'} top={'15px'} right={'15px'}> 
                        <IconButton bg='transparent' border='none' color='red' size='sm' _hover={{bg:'gray.200'}} icon={<RxCross2/>} aria-label='delete-any-condition' onClick={() => removeElement('any_conditions', index)}/>
                    </Box>
                    <EditStructure data={condition} setData={(structure, value) => {editElement('any_conditions', index, structure, value)}} scrollRef={scrollRef} operationTypesDict={operationTypesDict}/>
                </Box>
            ))}
            <Button mt='2vh' display={'inline-flex'} leftIcon={<FaPlus/>} size='sm' onClick={() => addElement('any_conditions')}>{t('AddCondition')}</Button>

            <Text fontWeight={'medium'} fontSize={'1.1em'} mt='3vh'>{t('ActionsToDo')}</Text>
            {currentAutomationData.actions.map((action, index) => (
                <Box  overflow={'scroll'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} borderRadius={'.5em'} mt='2vh' p='15px'>
                    <Flex alignItems={'center'} justifyContent={'space-between'}> 
                        <Text mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('ActionType')}</Text>
                        <IconButton bg='transaprent' border='none' color='red' size='sm' _hover={{bg:'gray.200'}} icon={<RxCross2/>} aria-label='delete-all-condition' onClick={() => removeElement('actions', index)}/>
                    </Flex>
                    <Box maxW='500px'> 
                        <CustomSelect containerRef={scrollRef} hide={false} selectedItem={action.type} setSelectedItem={(value) => {editElement('actions', index, 'type', value )}} options={actionsList} labelsMap={actionsMap} />
                    </Box>
                    <Text  mt='2vh' mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('ActionConfiguration')}</Text>
                    {(() => {
                           switch (action.type){
                            case 'email_csat':
                                return (<>
                                    <Text mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('EditTemplate')}</Text>
                                    <CodeMirror value={action.content.content} height="100%" maxHeight={`300px`} extensions={[html()]} onChange={(value) => editElement('actions', index, 'content', value, 'content')} theme={oneDark}
                                        />
                                </>)
                            case 'whatsapp_csat':
                                return <>
                                <Text mb='.5'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('Header')}</Text>
                                <EditText placeholder={t('HeaderPlaceholder')} value={action.content.header} setValue={(value) => editElement('actions', index, 'content', value, 'header')} hideInput={false}/>
                                <Text mt='1vh' mb='.5vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('Body')}</Text>
                                <EditText placeholder={t('BodyPlaceholder')}  value={action.content.body} setValue={(value) => editElement('actions', index, 'content', value, 'body')} hideInput={false}/>
                                <Text mt='1vh' mb='.5vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('Footer')}</Text>
                                <EditText placeholder={t('FooterPlaceholder')}  value={action.content.footer} setValue={(value) => editElement('actions', index, 'content', value, 'footer')} hideInput={false}/>
                                <Text mt='1vh' mb='.5vh' color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('CTA')}</Text>
                                <EditText placeholder={t('CTAPlaceholder')}  value={action.content.cta} setValue={(value) => editElement('actions', index, 'content', value, 'cta')} hideInput={false}/>
                                </>
                            case 'webchat_csat':
                                return <Text>{t('NoConfig')}</Text>
                            case 'agent_email_notification':
                                return (
                                    <Flex gap='30px'>
                                        <Box flex='1'> 
                                            <Text mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('AgentToNotify')}</Text>
                                            <VariableTypeChanger inputType={'user_id'} value={action.content.user_id} setValue={(value) => editElement('actions', index, 'content', value, 'user_id')}/>
                                        </Box>
                                        <Box flex='2'> 
                                            <Text mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('Message')}</Text>
                                            <Textarea resize={'none'} maxLength={2000} height={'auto'} placeholder={`${t('Message')}...`} maxH='300px' value={action.content.notification_message} onChange={(e) => editElement('actions', index, 'content', e.target.value, 'notification_message') } p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "rgb(77, 144, 254)", borderWidth: "2px"}}/>
                                        </Box>
                                    </Flex>
                                )
                                
                            case 'motherstructure_update':
                                {
                                    const operationTypesDict = {'user_id':['set'], 'group_id':['set'], 'channel_type':['set'], 'title':['set', 'concatenate'], 'subject':['set'], 'urgency_rating':['set', 'add', 'substract'], 'status':['set'], 'unseen_changes':['set'], 'tags':['append', 'remove'], 'is_matilda_engaged':['set'],'is_satisfaction_offered':['set'],
                                    'contact_business_id':['set'], 'name':['set', 'concatenate'], 'language':['set'], 'rating':['set', 'add', 'substract'], 'notes':['set', 'concatenate'], 'labels':['append', 'remove'],
                                    'domain':['set', 'concatenate']
                                    }
                                    return (<EditStructure data={action.content} setData={(structure, value) => {editElement('actions', index, 'content', value, structure)}} scrollRef={scrollRef} operationTypesDict={operationTypesDict}/>)
                                }
                
                        }
                    })()}
                </Box>
            ))}
            <Button mt='2vh' display={'inline-flex'} leftIcon={<FaPlus/>} size='sm' onClick={() => addElement('actions')}>{t('AddAction')}</Button>

        </Box>

    </Flex>
    </>)
}

export default Triggers