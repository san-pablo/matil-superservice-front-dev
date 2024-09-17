
//REACT
import  { useState, useEffect, useRef, Dispatch, SetStateAction, useMemo } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Button, Skeleton, Tooltip, IconButton, Textarea, Icon } from "@chakra-ui/react"
//COMPONENTS
import CodeMirror from "@uiw/react-codemirror"
import { html } from "@codemirror/lang-html"
import { oneDark } from "@codemirror/theme-one-dark"
import EditText from '../../../Components/Reusable/EditText'
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
import ConfirmBox from '../../../Components/Reusable/ConfirmBox'
import EditStructure from '../../../Components/Reusable/EditStructure'
import CustomSelect from '../../../Components/Reusable/CustomSelect'
import Table from '../../../Components/Reusable/Table'
import VariableTypeChanger from '../../../Components/Reusable/VariableTypeChanger'
//FUNCTIONS
import parseMessageToBold from '../../../Functions/parseToBold'
//ICONS
import { IoIosArrowForward } from "react-icons/io"
import { FaPlus } from 'react-icons/fa6'
import { IoIosArrowBack } from 'react-icons/io'
import { RxCross2 } from 'react-icons/rx'
//TYPING 
import { ActionDataType, ActionsType, FieldAction } from '../../../Constants/typing'
 
 
const CellStyle = ({column, element}:{column:string, element:any}) => {return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>}

//MAIN FUNCTION
function Triggers () {

    //AUTH CONSTANT
    const auth = useAuth()
    const { t } = useTranslation('settings')
    const newTrigger:ActionDataType = {
        name: t('NewTrigger'),
        description: '',
        all_conditions:[],
        any_conditions:[],
        actions:[]
    }
    
    //TRIGERS DATA
    const [triggerData, setTriggerData] = useState<ActionDataType[] | null>(null)

    //SELECTED GROUP
    const [selectedIndex, setSelectedIndex] = useState<number>(-2)

    //TRIGGER TO DELETE 
    const [triggerToDeleteIndex, setTriggerToDeleteIndex] = useState<number | null>(null)
    
    //FILTER TRIGGER DATA
    const [text, setText]  =useState<string>('')
    const [filteredTriggerData, setFilteredTriggerData] = useState<ActionDataType[]>([])
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
        }
        document.title = `${t('Settings')} - ${t('Triggers')} - ${auth.authData.organizationName} - Matil`
        fetchTriggerData()
    }, [])


    //FUNCTION FOR DELETING THE TRIGGER
    const DeleteComponent = () => {

        //WAITING DELETION
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

        //FUNCTION FOR DELETING AN AUTOMATION
        const deleteTrigger= async () => {

            setWaitingDelete(true)
            const newTriggers = triggerData?.filter((_, index) => index !== triggerToDeleteIndex)
            const response = await fetchData({endpoint: `superservice/${auth.authData.organizationId}/admin/settings/triggers`, requestForm: newTriggers, method: 'put', setWaiting: setWaitingDelete, auth, toastMessages: {works: t('CorrectDeletedTrigger'), failed: t('FailedDeletedTrigger')}})
            if (response?.status === 200) {
                setTriggerData(newTriggers as ActionDataType[])
                setSelectedIndex(-2)
            }
        }

        //FRONT
        return(<>
            <Box p='20px' > 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ConfirmDelete')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Text >{parseMessageToBold(t('ConfirmDeleteTrigger', {name:triggerData?.[triggerToDeleteIndex as number].name}))}</Text>
            </Box>
            <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                <Button  size='sm' color='red.600' bg='red.100' _hover={{bg:'red.200'}} onClick={deleteTrigger}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                <Button  size='sm' _hover={{color:'blue.500'}} onClick={() => setTriggerToDeleteIndex(null)}>{t('Cancel')}</Button>
            </Flex>
        </>)
    }

    //DELETE BOX
    const memoizedDeleteBox = useMemo(() => (
        <ConfirmBox isSectionWithoutHeader setShowBox={(b:boolean) => setTriggerToDeleteIndex(null)}> 
            <DeleteComponent/>
        </ConfirmBox>
    ), [triggerToDeleteIndex])


    //FRONT
    return(<>
        {triggerToDeleteIndex !== null && memoizedDeleteBox}
        {(selectedIndex >= -1 && triggerData !==  null) ? <EditTrigger triggerData={selectedIndex === -1 ?newTrigger :triggerData?.[selectedIndex] as ActionDataType} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex}  allTriggers={triggerData} setAllTriggers={setTriggerData}/>:<>
        <Flex justifyContent={'space-between'} alignItems={'end'}> 
            <Box> 
                <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('Triggers')}</Text>
                <Text color='gray.600' fontSize={'.9em'}>{t('TriggersDes')}</Text>
            </Box>
        </Flex>
        <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='3vh'/>
        
        <Box width={'350px'}> 
            <EditText value={text} setValue={setText} searchInput={true}/>
        </Box>

        <Flex  mt='2vh' justifyContent={'space-between'} alignItems={'end'}>
            <Skeleton isLoaded={triggerData !== null}> 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('TriggersCount', {count:triggerData?.length})}</Text>
            </Skeleton>
            <Flex gap='10px'> 
                <Button size='sm' leftIcon={<FaPlus/>} onClick={() => {setSelectedIndex(-1)}}>{t('CreateTrigger')}</Button>
            </Flex> 
        </Flex>
        <Skeleton isLoaded={triggerData !== null}> 
            <Table data={filteredTriggerData} CellStyle={CellStyle} columnsMap={{'name':[t('Name'), 150], 'description':[t('Description'), 350]}} noDataMessage={t('NoTriggers')} onClickRow={(row, index) => setSelectedIndex(index)} deletableFunction={(row:any, index:number) => setTriggerToDeleteIndex(index)}/>  
        </Skeleton>
        </>}
    </>)
}

//COMPONENT FOR EDITING AUTOMATIONS
const EditTrigger = ({triggerData, selectedIndex, setSelectedIndex, allTriggers, setAllTriggers }:{triggerData:ActionDataType, selectedIndex:number, setSelectedIndex:Dispatch<SetStateAction<number >>,allTriggers:ActionDataType[], setAllTriggers:Dispatch<SetStateAction<ActionDataType[] | null>>}) => {

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
    const automationDataRef = useRef<ActionDataType>(triggerData)
    const [currentAutomationData, setCurrentAutomationData] = useState<ActionDataType>(triggerData)

    //SEND AUTOMATION
    const sendTrigger = async () => {
        setWaitingSend(true)
        let newAutomations:ActionDataType[]
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
    const editElement = (type:'all_conditions' | 'any_conditions' | 'actions', index:number, updatedCondition:FieldAction) => {
        setCurrentAutomationData((prev) => {
            const lastConditionList = [...prev[type]]
            const updatedConditionList = [...lastConditionList.slice(0, index), updatedCondition, ...lastConditionList.slice(index + 1)]
            return {...prev, [type]: updatedConditionList}
        })
    }
    const editElement2 = (type:'all_conditions' | 'any_conditions' | 'actions', index:number, keyToEdit:'type' | 'content' | 'motherstructure' | 'is_customizable' | 'name' | 'op' | 'value', value:any, actionKey?:string) => {
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
 
    //FRONT
    return (<>
    <Flex height={'100%'} minH='90vh' width={'100%'} flexDir={'column'}> 
        <Box flex='1'  py='2vh'> 
            <Flex fontWeight={'medium'} fontSize={'1.4em'} gap='10px' alignItems={'center'}> 
                <Text onClick={() => setSelectedIndex(-2)} color='blue.500' cursor={'pointer'}>{t('Triggers')}</Text>
                <Icon as={IoIosArrowForward}/>
                <Text>{triggerData.name}</Text>
            </Flex>
            <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='3vh'/>

            <Text mb='.5vh' fontSize={'1.1em'}  fontWeight={'medium'}>{t('Name')}</Text>
            <Box maxW='500px'> 
                 <EditText  value={currentAutomationData.name} setValue={(value) => {setCurrentAutomationData((prev) => ({...prev, name:value}))}} hideInput={false}/>
            </Box>

            <Text fontSize={'1.1em'} mt='3vh' mb='.5vh'  fontWeight={'medium'}>{t('Description')}</Text>
            <Textarea maxW={'500px'} resize={'none'} maxLength={2000} height={'auto'} placeholder={`${t('Description')}...`} maxH='300px' value={currentAutomationData.description} onChange={(e) => setCurrentAutomationData((prev) => ({...prev, description:e.target.value}))} p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "rgb(77, 144, 254)", borderWidth: "2px"}}/>

            <Text fontWeight={'medium'} fontSize={'1.1em'} mt='3vh'>{t('Conditions')}</Text>
            <Text fontSize={'.8em'} color='gray.600'>{t('ConditionsDes')}</Text>

            <Flex gap='30px' mt='1.5vh'> 
                <Box flex='1'> 
                    <Text fontSize={'.9em'} fontWeight={'medium'}>{t('AllConditionsAut')}</Text>
                    <Text fontSize={'.8em'} color='gray.600'>{t('AllConditionsAutDes')}</Text>

                    {currentAutomationData.all_conditions.map((condition, index) => (
                        <Flex mt='2vh' gap='10px'>
                            <Box flex={'1'}> 
                            <EditStructure data={condition} setData={(newCondition) => {editElement('all_conditions', index, newCondition)}} scrollRef={scrollRef} operationTypesDict={operationTypesDict}/>
                            </Box>
                           <IconButton bg='transaprent' border='none' color='red' size='sm' _hover={{bg:'gray.200'}} icon={<RxCross2/>} aria-label='delete-all-condition' onClick={() => removeElement('all_conditions', index)}/>
                         </Flex>
                    ))}
                    <Button mt='2vh'  leftIcon={<FaPlus/>} size='sm'  onClick={() => addElement('all_conditions')}>{t('AddCondition')}</Button>
                </Box>

                <Box flex='1'> 
                    <Text fontSize={'.9em'}  fontWeight={'medium'}>{t('AnyConditionsAut')}</Text>
                    <Text fontSize={'.8em'} color='gray.600'>{t('AnyConditionsAutDes')}</Text>

                    {currentAutomationData.any_conditions.map((condition, index) => (
                        <Flex mt='2vh' gap='10px'>
                            <Box flex={'1'}> 
                                <EditStructure data={condition} setData={(newCondition) => {editElement('any_conditions', index, newCondition)}} scrollRef={scrollRef} operationTypesDict={operationTypesDict}/>
                            </Box>
                            <IconButton bg='transparent' border='none' color='red' size='sm' _hover={{bg:'gray.200'}} icon={<RxCross2/>} aria-label='delete-any-condition' onClick={() => removeElement('any_conditions', index)}/>
                        </Flex>
                    ))}
                    <Button mt='2vh' display={'inline-flex'} leftIcon={<FaPlus/>} size='sm' onClick={() => addElement('any_conditions')}>{t('AddCondition')}</Button>
                </Box>
            </Flex>

            <Text fontWeight={'medium'} fontSize={'1.1em'} mt='3vh'>{t('ActionsToDo')}</Text>
            {currentAutomationData.actions.map((action, index) => (
                <Box  overflow={'scroll'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} borderRadius={'.5em'} mt='2vh' p='15px'>
                    <Flex alignItems={'center'} justifyContent={'space-between'}> 
                        <Text mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('ActionType')}</Text>
                        <IconButton bg='transaprent' border='none' color='red' size='sm' _hover={{bg:'gray.200'}} icon={<RxCross2/>} aria-label='delete-all-condition' onClick={() => removeElement('actions', index)}/>
                    </Flex>
                    <Box maxW='500px'> 
                        <CustomSelect containerRef={scrollRef} hide={false} selectedItem={action.type} setSelectedItem={(value) => {editElement2('actions', index, 'type', value )}} options={actionsList} labelsMap={actionsMap} />
                    </Box>
                    <Text  mt='2vh' mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('ActionConfiguration')}</Text>
                    {(() => {
                           switch (action.type){
                            case 'email_csat':
                                return (<>
                                    <Text mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('EditTemplate')}</Text>
                                    <CodeMirror value={action.content.content} height="100%" maxHeight={`300px`} extensions={[html()]} onChange={(value) => editElement2('actions', index, 'content', value, 'content')} theme={oneDark}
                                        />
                                </>)
                            case 'whatsapp_csat':
                                return <>
                                <Text mb='.5'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('Header')}</Text>
                                <EditText placeholder={t('HeaderPlaceholder')} value={action.content.header} setValue={(value) => editElement2('actions', index, 'content', value, 'header')} hideInput={false}/>
                                <Text mt='1vh' mb='.5vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('Body')}</Text>
                                <EditText placeholder={t('BodyPlaceholder')}  value={action.content.body} setValue={(value) => editElement2('actions', index, 'content', value, 'body')} hideInput={false}/>
                                <Text mt='1vh' mb='.5vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('Footer')}</Text>
                                <EditText placeholder={t('FooterPlaceholder')}  value={action.content.footer} setValue={(value) => editElement2('actions', index, 'content', value, 'footer')} hideInput={false}/>
                                <Text mt='1vh' mb='.5vh' color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('CTA')}</Text>
                                <EditText placeholder={t('CTAPlaceholder')}  value={action.content.cta} setValue={(value) => editElement2('actions', index, 'content', value, 'cta')} hideInput={false}/>
                                </>
                            case 'webchat_csat':
                                return <Text>{t('NoConfig')}</Text>
                            case 'agent_email_notification':
                                return (
                                    <Flex gap='30px'>
                                        <Box flex='1'> 
                                            <Text mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('AgentToNotify')}</Text>
                                            <VariableTypeChanger inputType={'user_id'} value={action.content.user_id} setValue={(value) => editElement2('actions', index, 'content', value, 'user_id')}/>
                                        </Box>
                                        <Box flex='2'> 
                                            <Text mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('Message')}</Text>
                                            <Textarea resize={'none'} maxLength={2000} height={'auto'} placeholder={`${t('Message')}...`} maxH='300px' value={action.content.notification_message} onChange={(e) => editElement2('actions', index, 'content', e.target.value, 'notification_message') } p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "rgb(77, 144, 254)", borderWidth: "2px"}}/>
                                        </Box>
                                    </Flex>
                                )
                                
                            case 'motherstructure_update':
                                {
                                    const operationTypesDict = {'user_id':['set'], 'group_id':['set'], 'channel_type':['set'], 'title':['set', 'concatenate'], 'subject':['set'], 'urgency_rating':['set', 'add', 'substract'], 'status':['set'], 'unseen_changes':['set'], 'tags':['append', 'remove'], 'is_matilda_engaged':['set'],'is_satisfaction_offered':['set'],
                                    'contact_business_id':['set'], 'name':['set', 'concatenate'], 'language':['set'], 'rating':['set', 'add', 'substract'], 'notes':['set', 'concatenate'], 'labels':['append', 'remove'],
                                    'domain':['set', 'concatenate']
                                    }
                                    return (<EditStructure data={action.content} setData={(newCondition) => {editElement('actions', index, newCondition)}} scrollRef={scrollRef} operationTypesDict={operationTypesDict}/>)
                                }
                
                        }
                    })()}
                </Box>
            ))}
            <Button mt='2vh' display={'inline-flex'} leftIcon={<FaPlus/>} size='sm' onClick={() => addElement('actions')}>{t('AddAction')}</Button>

        </Box>
        <Button size='sm'  onClick={sendTrigger} isDisabled={currentAutomationData.name === ''  || currentAutomationData.actions.length === 0 || ((JSON.stringify(currentAutomationData) === JSON.stringify(automationDataRef.current)))}>{waitingSend?<LoadingIconButton/>:t('SaveChanges')}</Button> 

    </Flex>
    </>)
}

export default Triggers