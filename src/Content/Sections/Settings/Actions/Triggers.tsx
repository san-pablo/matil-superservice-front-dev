
//REACT
import  { useState, useEffect, useRef, Dispatch, SetStateAction, useMemo, RefObject } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
import { useAuth0 } from '@auth0/auth0-react'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Button, Skeleton, IconButton, Textarea, Icon, SliderMark, Slider, SliderFilledTrack, SliderTrack, SliderThumb } from "@chakra-ui/react"
//COMPONENTS
import CodeMirror from "@uiw/react-codemirror"
import { html } from "@codemirror/lang-html"
import { oneDark } from "@codemirror/theme-one-dark"
import EditText from '../../../Components/Reusable/EditText'
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
import ConfirmBox from '../../../Components/Reusable/ConfirmBox'
import EditStructure from '../../../Components/Reusable/EditStructure'
import FilterManager from '../../../Components/Reusable/ManageFilters'
import CustomSelect from '../../../Components/Reusable/CustomSelect'
import Table from '../../../Components/Reusable/Table'
import VariableTypeChanger from '../../../Components/Reusable/VariableTypeChanger'
import SaveChanges from '../../../Components/Reusable/SaveChanges'
//FUNCTIONS
import parseMessageToBold from '../../../Functions/parseToBold'
//ICONS
import { IoIosArrowForward } from "react-icons/io"
import { FaPlus } from 'react-icons/fa6'
import { HiTrash } from 'react-icons/hi2'
//TYPING 
import { ActionDataType, ActionsType, } from '../../../Constants/typing'
  

//CELL STYLE
const CellStyle = ({column, element}:{column:string, element:any}) => {return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>}

//MAIN FUNCTION
function Triggers ({scrollRef}:{scrollRef:RefObject<HTMLDivElement>}) {

    //AUTH CONSTANT
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()
    const { t } = useTranslation('settings')
    const newTrigger:ActionDataType = {
        name: t('NewTrigger'),
        description: '',
        filters:{logic:'AND', groups:[]},  
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
            const response  = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/triggers`, getAccessTokenSilently,setValue:setTriggerData, auth})
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
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/admin/settings/triggers`,getAccessTokenSilently, requestForm: newTriggers, method: 'put', setWaiting: setWaitingDelete, auth, toastMessages: {works: t('CorrectDeletedTrigger'), failed: t('FailedDeletedTrigger')}})
            if (response?.status === 200) {
                setTriggerData(newTriggers as ActionDataType[])
                setTriggerToDeleteIndex(null)
            }
        }

        //FRONT
        return(<>
            <Box p='20px' > 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ConfirmDelete')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Text >{parseMessageToBold(t('ConfirmDeleteTrigger', {name:triggerData?.[triggerToDeleteIndex as number].name}))}</Text>
            </Box>
            <Flex bg='gray.50' borderTopColor={'gray.200'} borderTopWidth={'1px'} p='20px' gap='10px' flexDir={'row-reverse'}>
                <Button  size='sm' variant={'delete'} onClick={deleteTrigger}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                <Button  size='sm' variant={'common'}onClick={() => setTriggerToDeleteIndex(null)}>{t('Cancel')}</Button>
            </Flex>
        </>)
    }

    //DELETE BOX
    const memoizedDeleteBox = useMemo(() => (
        <ConfirmBox setShowBox={(b:boolean) => setTriggerToDeleteIndex(null)}> 
            <DeleteComponent/>
        </ConfirmBox>
    ), [triggerToDeleteIndex])
    
    //FRONT
    return(<>
        {triggerToDeleteIndex !== null && memoizedDeleteBox}
        {(selectedIndex >= -1 && triggerData !==  null) ? <EditTrigger triggerData={selectedIndex === -1 ?newTrigger :triggerData?.[selectedIndex] as ActionDataType} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex}  allTriggers={triggerData} setAllTriggers={setTriggerData} scrollRef={scrollRef}/>:<>

        <Box px='2vw' py='2vh'> 
            <Flex justifyContent={'space-between'} alignItems={'end'}> 
                <Box> 
                    <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('Triggers')}</Text>
                    <Text color='gray.600' fontSize={'.9em'}>{t('TriggersDes')}</Text>
                </Box>
                <Button size='sm' variant={'main'} leftIcon={<FaPlus/>} onClick={() => {setSelectedIndex(-1)}}>{t('CreateTrigger')}</Button>

            </Flex>
            <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='3vh'/>
            
            <Box width={'350px'}> 
                <EditText value={text} setValue={setText} searchInput={true}/>
            </Box>

            <Flex  mt='2vh' justifyContent={'space-between'} alignItems={'end'}>
                <Skeleton isLoaded={triggerData !== null}> 
                    <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('TriggersCount', {count:triggerData?.length})}</Text>
                </Skeleton>
             
            </Flex>
            <Skeleton isLoaded={triggerData !== null}> 
                <Table data={filteredTriggerData} CellStyle={CellStyle} columnsMap={{'name':[t('Name'), 150], 'description':[t('Description'), 350]}} noDataMessage={t('NoTriggers')} excludedKeys={['all_conditions', 'any_conditions', 'actions']} onClickRow={(row, index) => setSelectedIndex(index)} deletableFunction={(row:any, index:number) => setTriggerToDeleteIndex(index)}/>  
            </Skeleton>
        </Box> 
        </>}
    </>)
}

//COMPONENT FOR EDITING AUTOMATIONS
const EditTrigger = ({triggerData, selectedIndex, setSelectedIndex, allTriggers, setAllTriggers, scrollRef }:{triggerData:ActionDataType, selectedIndex:number, setSelectedIndex:Dispatch<SetStateAction<number >>,allTriggers:ActionDataType[], setAllTriggers:Dispatch<SetStateAction<ActionDataType[] | null>>, scrollRef:RefObject<HTMLDivElement>}) => {

    //CONSTANTS
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()
    const { t } = useTranslation('settings')

    //BOOLEAN FOR WAIT TO THE SEND GROUP
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

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

        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/triggers`, requestForm:newAutomations, method:'put',getAccessTokenSilently, setWaiting:setWaitingSend, auth, toastMessages:{works:selectedIndex === -1?t('CorrectCreatedTrigger'):t('CorrectUpdatedTrigger'), failed: selectedIndex === -1?t('FailedCreatedTrigger'):t('FailedUpdatedTrigger')}})
        if (response?.status === 200) {
            setSelectedIndex(-2)
            setAllTriggers(newAutomations)
        }
    }
 
 
    const editActions = (index:number, actionType:ActionsType, actionKey?:string, value?:any) => {
        
        const getDefaultContent = (selectedAction:ActionsType) => {
            switch (selectedAction) {
                case 'email_csat':
                    return {content:'', probability:50}
                case 'whatsapp_csat':
                    return {header:'', body:'', footer:'', cta:'', probability:50}
                case 'webchat_csat':
                    return {probability:50}
                case 'agent_email_notification':
                    return {user_id:'matilda', notification_message:''}
                case 'motherstructure_update':
                    return {motherstructure:'conversation', is_customizable:false, name:'user_id', operation:'eq', value:'matilda'}
            }
        }

        setCurrentAutomationData((prev) => {
            const lastAction = [...prev.actions]
            let updatedAction
            if (actionKey)  {
                if (actionType === 'motherstructure_update') updatedAction = {...lastAction[index], arguments: value}
                else updatedAction = {...lastAction[index], arguments: {...(lastAction[index] as {type:ActionsType, arguments:any}).arguments, [actionKey]:value}}
            }
            else updatedAction = {...lastAction[index], 'type': actionType, arguments:getDefaultContent(actionType)}

            const updatedConditionList = [...lastAction.slice(0, index), updatedAction, ...lastAction.slice(index + 1)]
            return {...prev, actions: updatedConditionList}
        })
    }
    const addActionsElement = () => {
        const newElement = {type:'email_csat', arguments:{content:'',  probability:50}}
        setCurrentAutomationData((prev) => ({ ...prev, actions: [...prev.actions as any, newElement]}))
    }
    const removeActionsElement = (index: number ) => {
        setCurrentAutomationData((prev) => {
        const conditionList = [...prev.actions]
        const updatedConditionList = [...conditionList.slice(0, index), ...conditionList.slice(index + 1)]
        return {...prev, actions: updatedConditionList}  
        })
    }
    
    //ACTIONS MAPPING
    const actionsList:ActionsType[] = ['email_csat', 'whatsapp_csat', 'webchat_csat', 'agent_email_notification', 'motherstructure_update']
    const actionsMap:{[key in ActionsType]:string} = {'email_csat':t('email_csat'), 'whatsapp_csat':t('whatsapp_csat'), 'webchat_csat':t('webchat_csat'), 'agent_email_notification':t('agent_email_notification'), 'motherstructure_update':t('motherstructure_update')}
    const operationTypesDict = {'user_id':['eq', 'neq',  'exists'], 'group_id':['eq', 'neq',  'exists'], 'channel_type':['eq', 'neq', 'exists'], 'title':['eq', 'neq', 'exists'], 'theme':['eq', 'neq', 'exists'], 'urgency_rating':['eq', 'neq', 'leq', 'geq', 'exists'], 'status':['eq', 'neq'], 'unseen_changes':['eq', 'exists'], 'tags':['contains', 'ncontains', 'exists'], 'is_matilda_engaged':['eq', 'exists'],'is_csat_offered':['eq', 'exists'],
    'contact_business_id':['eq', 'neq',  'exists'], 'name':['eq', 'neq', 'contains', 'ncontains', 'exists'], 'language':['eq', 'neq',  'exists'], 'rating':['eq','neq', 'leq', 'geq', 'exists'], 'notes':['eq', 'neq', 'contains', 'ncontains', 'exists'], 'labels':['contains', 'ncontains', 'exists'],
    'domain':['eq', 'neq', 'contains', 'ncontains', 'exists'], 'hours_since_created':['eq', 'neq', 'leq', 'geq',  'exists'], 'hours_since_updated':['eq', 'neq', 'leq', 'geq',   'exists']
    }
    const typesMap = {'bool':['eq', 'exists'], 'int':['eq','neq', 'leq', 'geq', 'exists'], 'float':['eq','neq', 'leq', 'geq', 'exists'],'str': ['eq', 'neq', 'contains', 'ncontains', 'exists'], 'timestamp':['eq', 'neq', 'leq', 'geq',  'exists']}

    //FRONT
    return (<>

        <SaveChanges data={currentAutomationData}  disabled={selectedIndex === -1}  setData={setCurrentAutomationData} dataRef={automationDataRef} onSaveFunc={sendTrigger}/>


        <Box px='2vw' py='2vh'> 
            <Flex alignItems={'end'} justifyContent={'space-between'}>
                <Flex fontWeight={'medium'} fontSize={'1.4em'} gap='10px' alignItems={'center'}> 
                    <Text onClick={() => setSelectedIndex(-2)}  color='brand.text_blue' cursor={'pointer'}>{t('Triggers')}</Text>
                    <Icon as={IoIosArrowForward}/>
                    <Text>{currentAutomationData.name}</Text>
                </Flex>
                {selectedIndex === -1 && <Button variant={'main'} onClick={sendTrigger} size={'sm'} leftIcon={<FaPlus/>}>{waitingSend ? <LoadingIconButton/>: t('Create')}</Button>}
            </Flex>
            <Box width='100%' bg='gray.300' height='1px' mt='2vh'/>

            <Box flex='1' overflow={'scroll'} pt='3vh' > 
                <Text mb='.5vh' fontSize={'1.1em'}  fontWeight={'medium'}>{t('Name')}</Text>
                <Box maxW='500px'> 
                    <EditText  value={currentAutomationData.name} setValue={(value) => {setCurrentAutomationData((prev) => ({...prev, name:value}))}} hideInput={false}/>
                </Box>

                <Text fontSize={'1.1em'} mt='3vh' mb='.5vh'  fontWeight={'medium'}>{t('Description')}</Text>
                <Textarea maxW={'500px'} resize={'none'} maxLength={2000} height={'auto'} placeholder={`${t('Description')}...`} maxH='300px' value={currentAutomationData.description} onChange={(e) => setCurrentAutomationData((prev) => ({...prev, description:e.target.value}))} p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "brand.text_blue", borderWidth: "2px"}}/>

                <Text fontWeight={'medium'} fontSize={'1.1em'} mt='3vh'>{t('Conditions')}</Text>
                <Text fontSize={'.8em'} color='gray.600'>{t('ConditionsDes')}</Text>
                <FilterManager filters={currentAutomationData.filters} setFilters={(filters) => setCurrentAutomationData(prev => ({...prev, filters}))} operationTypesDict={operationTypesDict} typesMap={typesMap} scrollRef={scrollRef} />
           

                <Text fontWeight={'medium'} fontSize={'1.1em'} mt='3vh'>{t('ActionsToDo')}</Text>
                <Text fontSize={'.8em'} color='gray.600'>{t('ActionsToDoDes')}</Text>

                {currentAutomationData.actions.map((action, index) => (
                    <Box shadow='md' maxW={'1000px'} mt='2vh'  borderColor={'gray.200'} borderWidth={'1px'} p='15px' borderRadius={'.5rem'} key={`arg-${index}`}>

                        <Flex alignItems={'center'} justifyContent={'space-between'}> 
                            <Text mb='.3vh' fontSize={'.9em'} fontWeight={'medium'}>{t('ActionType')}</Text>
                            <Button size='xs' leftIcon={<HiTrash/>} variant='delete'  onClick={() => removeActionsElement(index)}>{t('Delete')}</Button>
                        </Flex>
                        <Box maxW='350px' mb='2vh'> 
                            <CustomSelect containerRef={scrollRef} hide={false} selectedItem={action.type} setSelectedItem={(value) => {editActions(index, value)}} options={actionsList} labelsMap={actionsMap} />
                        </Box>
                        {(() => {
                            switch (action.type){
                                case 'email_csat':
                                    return (<>
                                        <Text mb='.5vh' fontSize={'.9em'} fontWeight={'medium'}>{t('EditTemplate')}</Text>
                                        <CodeMirror value={action.arguments.content} height="100%" maxHeight={`300px`} extensions={[html()]} onChange={(value) => editActions(index, 'email_csat', 'content', value)} theme={oneDark}/>
                                        <Text mt='3vh' mb='.5vh' fontSize={'.9em'} fontWeight={'medium'}>{t('CSATProbability')}</Text>
                                        <Text fontSize={'.8em'} color='gray.600'>{t('CSATProbabilityDes')}</Text>
                                        <Slider value={action.arguments.probability} mb='1vh' mt='5vh' aria-label='slider-ex-6' onChange={(value) => editActions(index, 'email_csat', 'probability', value)}>
                                            <SliderMark borderRadius={'.3em'} value={action.arguments.probability} textAlign='center' bg='blackAlpha.800' color='white' mt='-10' ml='-5' w='12'>
                                                {action.arguments.probability} %
                                            </SliderMark>
                                            <SliderMark ml='-4' value={25} mt='1vh' fontWeight={'medium'}>25%</SliderMark>
                                            <SliderMark ml='-4' value={50} mt='1vh'  fontWeight={'medium'}>50%</SliderMark>
                                            <SliderMark ml='-4' value={75} mt='1vh'  fontWeight={'medium'}>75%</SliderMark>
                                        
                                            <SliderTrack>
                                                <SliderFilledTrack  bg="brand.text_blue"/>
                                            </SliderTrack>
                                            <SliderThumb />
                                        </Slider>
                                    </>)
                                case 'whatsapp_csat':
                                    return (<>
                                    <Box maxW={'600px'}>
                                        <Text fontSize={'.9em'} fontWeight={'medium'}>{t('Header')}</Text>
                                        <EditText placeholder={t('HeaderPlaceholder')} value={action.arguments.header} setValue={(value) => editActions( index, 'whatsapp_csat', 'header', value)} hideInput={false}/>
                                        <Text mt='1vh' fontSize={'.9em'} fontWeight={'medium'}>{t('Body')}</Text>
                                        <EditText placeholder={t('BodyPlaceholder')}  value={action.arguments.body} setValue={(value) => editActions( index, 'whatsapp_csat', 'body', value)}hideInput={false}/>
                                        <Text mt='1vh' fontSize={'.9em'} fontWeight={'medium'}>{t('Footer')}</Text>
                                        <EditText placeholder={t('FooterPlaceholder')}  value={action.arguments.footer}setValue={(value) => editActions( index, 'whatsapp_csat', 'footer', value)}hideInput={false}/>
                                        <Text mt='1vh'  fontSize={'.9em'} fontWeight={'medium'}>{t('CTA')}</Text>
                                        <EditText placeholder={t('CTAPlaceholder')}  value={action.arguments.cta} setValue={(value) => editActions( index, 'whatsapp_csat', 'cta', value)} hideInput={false}/>
                                    </Box>
                                        <Text fontSize={'.8em'} color='gray.600'>{t('CSATProbabilityDes')}</Text>
                                        <Slider  value={action.arguments.probability} mb='1vh' mt='5vh' aria-label='slider-ex-6' onChange={(value) => editActions(index, 'whatsapp_csat', 'probability', value)}>
                                            <SliderMark ml='-4'value={25} mt='1vh' fontWeight={'medium'}>25%</SliderMark>
                                            <SliderMark ml='-4'value={50} mt='1vh'  fontWeight={'medium'}>50%</SliderMark>
                                            <SliderMark ml='-4'value={75}mt='1vh'  fontWeight={'medium'}>75%</SliderMark>
                                            <SliderMark borderRadius={'.3em'} value={action.arguments.probability} textAlign='center' bg='blackAlpha.800' color='white' mt='-10' ml='-5' w='12'>
                                                {action.arguments.probability} %
                                            </SliderMark>
                                            <SliderTrack>
                                                <SliderFilledTrack  bg="brand.text_blue"/>
                                            </SliderTrack>
                                            <SliderThumb />
                                        </Slider>
                                        </>)
                                case 'webchat_csat':
                                    return <>
                                        <Text fontSize={'.8em'} color='gray.600'>{t('CSATProbabilityDes')}</Text>
                                        <Slider  value={action.arguments.probability} mb='1vh' mt='5vh' aria-label='slider-ex-6' onChange={(value) => editActions(index, 'webchat_csat', 'probability', value)}>
                                            <SliderMark ml='-4'value={25} mt='1vh' fontWeight={'medium'}>25%</SliderMark>
                                            <SliderMark ml='-4'value={50} mt='1vh'  fontWeight={'medium'}>50%</SliderMark>
                                            <SliderMark ml='-4'value={75}mt='1vh'  fontWeight={'medium'}>75%</SliderMark>
                                            <SliderMark ml='-6'borderRadius={'.3em'} value={action.arguments.probability} textAlign='center' bg='blackAlpha.800' color='white' mt='-10' w='12'>
                                                {action.arguments.probability} %
                                            </SliderMark>
                                            <SliderTrack>
                                                <SliderFilledTrack  bg="brand.text_blue"/>
                                            </SliderTrack>
                                            <SliderThumb />
                                        </Slider>
                                        </>
                                case 'agent_email_notification':
                                    return (
                                        <>
                                            <Text mb='.5vh' fontSize={'.9em'} fontWeight={'medium'}>{t('AgentToNotify')}</Text>
                                            <VariableTypeChanger inputType={'user_id'} value={action.arguments.user_id} setValue={(value) => editActions( index, 'agent_email_notification', 'header', value)}/>
                                            <Text mt='1vh'  mb='.5vh' fontSize={'.9em'} fontWeight={'medium'}>{t('Message')}</Text>
                                            <Textarea resize={'none'} maxLength={2000} height={'auto'} placeholder={`${t('Message')}...`} maxH='300px' value={action.arguments.notification_message} onChange={(e) => editActions( index, 'agent_email_notification', 'notification_message', e.target.value) } p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "rgb(77, 144, 254)", borderWidth: "2px"}}/>
                                        </>
                                    )
                                    
                                case 'motherstructure_update':
                                    {
                                        const operationTypesDict = {'user_id':['set'], 'group_id':['set'], 'channel_type':['set'], 'title':['set', 'concatenate'], 'theme':['set'], 'urgency_rating':['set', 'add', 'substract'], 'status':['set'], 'unseen_changes':['set'], 'tags':['append', 'remove'], 'is_matilda_engaged':['set'],'is_csat_offered':['set'],
                                        'contact_business_id':['set'], 'name':['set', 'concatenate'], 'language':['set'], 'rating':['set', 'add', 'substract'], 'notes':['set', 'concatenate'], 'labels':['append', 'remove'],
                                        'domain':['set', 'concatenate']
                                        }
                                        const typesMap2 = {'bool':['set'], 'int':['set', 'add', 'substract'], 'float':['set', 'add', 'substract'],'str': ['set', 'concatenate'], 'timestamp':['set', 'add', 'substract']}

                                        return (<EditStructure data={action.arguments} setData={(newCondition) => {editActions(index, 'motherstructure_update', 'new', newCondition)}} scrollRef={scrollRef} operationTypesDict={operationTypesDict} typesMap={typesMap2}/>)
                                    }
                            }
                        })()}
                    </Box>
                ))}

                <Button variant={'common'} mt='2vh' display={'inline-flex'} leftIcon={<FaPlus/>} size='sm' onClick={() => addActionsElement()}>{t('AddAction')}</Button>
            </Box>
        </Box>


       
    </>)
}

export default Triggers