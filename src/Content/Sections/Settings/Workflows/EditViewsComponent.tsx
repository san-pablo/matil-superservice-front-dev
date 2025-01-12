//REACT
import  { useState, useRef, useEffect, RefObject, CSSProperties } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
import { useSession } from '../../../../SessionContext'
//FRONT
import { Flex, Text, Box, IconButton, Button, chakra, shouldForwardProp, Icon, Portal, Radio } from "@chakra-ui/react"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { motion, isValidMotionProp, AnimatePresence } from 'framer-motion'
//COMPONENTS
import CustomSelect from '../../../Components/Reusable/CustomSelect'
import VariableTypeChanger from '../../../Components/Reusable/VariableTypeChanger'
//FUNCTIONS
import useOutsideClick from '../../../Functions/clickOutside'
import determineBoxStyle from '../../../Functions/determineBoxStyle'
//ICONS
import { RxCross2 } from 'react-icons/rx'
import { FaPlus, FaArrowDown, FaArrowUp } from 'react-icons/fa6'
import { HiTrash } from 'react-icons/hi2'
//TYPING
import { View, ConversationColumn, Condition } from '../../../Constants/typing'

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)}) 

 
//MAIN FUNCTION
function EditViewComponent ({scrollRef, viewData, editViewData}:{scrollRef:RefObject<HTMLDivElement>, viewData:View, editViewData:(view:View) => void}) {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('settings')

    //CONSTANTS FOR MAPPING THE COLUMS
    const columnsMap: { [key in ConversationColumn]: [string, string] } = {
        id: [t('id'), "🔢"],
        local_id: [t('local_id'), "🔢"],
        user_id: [t('user_id'), "🎧"],
        channel_type: [t('channel_type'), "💬"],
        created_at: [t('created_at'), "📅"],
        updated_at: [t('updated_at'), "🔄"],
        solved_at: [t('solved_at'), "✅"],
        closed_at: [t('closed_at'), "🚪"],
        title: [t('title'), "📝"],
        theme: [t('theme'), "📚"],
        urgency_rating: [t('urgency_rating'), "⚠️"],
        status: [t('status'), "📊"],
        deletion_scheduled_at: [t('deletion_date'), "❌"],
        unseen_changes: [t('unseen_changes'), "👀"],
        call_status: [t('call_status'), "📞"],
        call_duration: [t('call_duration'), "⏳"],

      }
       
    let usersMap:{[key:string]:string} = {}
    for (let key in auth.authData.users) {if (auth.authData.users.hasOwnProperty(key)) usersMap[key] = auth.authData.users[key].name + ' ' +  auth.authData.users[key].surname}
    usersMap['no_user'] = t('NoAgent')
    usersMap['matilda'] = 'Matilda'
    usersMap['{user_id}'] = usersMap[auth.authData?.userId || 'matilda']
    delete usersMap[auth.authData?.userId || '-1']
    const datesMap = {'{today}':t('Today'), '{yesterday}':t('Yesterday'), '{start_of_week}':t('WeekStart'),'{start_of_month}':t('StartMonth')}
    const columns: ConversationColumn[] = Object.keys(columnsMap) as ConversationColumn[]

     //SELECTED VIEW
    const [selectedView, setSelectedView] = useState<View>(viewData)  
    useEffect(() => {editViewData(selectedView)} , [selectedView])
    useEffect(() => {if (viewData !== selectedView) setSelectedView(viewData)}, [viewData])


     //ADD CONDITIONS LOGIC
    function handleConditionChange(index: number, value: Condition, type: 'all_conditions' | 'any_conditions'): void {
        const newConditions = [...selectedView[type]]
        newConditions[index] = value
        setSelectedView({ ...selectedView, [type]: newConditions })
    }

    const addCondition = (type: 'all_conditions' | 'any_conditions') => {
        const freeColumns = columns.filter(column => !(selectedView?.[type] || []).map(item => item.column).includes(column))
        const newConditions = [...(selectedView?.[type] || []), { column: freeColumns[0], operation_type: 'geq', value: '' }]
        setSelectedView({ ...selectedView, [type]: newConditions })
    }
    const removeCondition = (index:number, type:'all_conditions' | 'any_conditions') => {
        const newConditions = [...selectedView[type]]
        newConditions.splice(index, 1)
        setSelectedView({ ...selectedView, [type]: newConditions })
    }
      
    //EDIT VISIBLE COLUMNS LOGIC
    const columnBox = useRef<HTMLDivElement>(null)
    const columnButtonRef = useRef<HTMLButtonElement>(null)
    const [addColumnBox, setAddColumBox] = useState<{bottom:number, left:number} | null>(null)
    const [columnsToSelect, setColumnsToSelect] = useState<ConversationColumn[]>(columns.filter(column => !selectedView.columns.includes(column)))
    useEffect(() => {setColumnsToSelect(columns.filter(column => !selectedView.columns.includes(column)))}, [selectedView])
    useOutsideClick({ref1:columnBox, ref2:columnButtonRef, onOutsideClick:(b:boolean) => {setAddColumBox(null)}})
    const handleShowColumnBox = () => {
        if (addColumnBox) setAddColumBox(null)
        else if (columnButtonRef?.current) setAddColumBox({bottom:window.innerHeight - columnButtonRef.current.getBoundingClientRect().top, left:columnButtonRef.current.getBoundingClientRect().left})
    }
    const addColumn = (column:ConversationColumn) => {
        setSelectedView({ ...selectedView, columns: [...selectedView.columns, column] })
        setAddColumBox(null)
    }
    const removeColumn = (index: number) => {
        const newColumns = [...selectedView.columns];
        newColumns.splice(index, 1);
        setSelectedView({ ...selectedView, columns: newColumns })
    }
    const onDragEnd = (result:any) => {
        if (!result.destination) return
        const items = Array.from(selectedView.columns)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)
        setSelectedView({ ...selectedView, columns: items })
      }
      

    //CHANGE ORDER LOGIC
    const handleOrderChange = (value:ConversationColumn | 'asc' | 'desc' ,  type:'column' | 'order') => {
    const newOrder = {...selectedView.order_by}
        if (type === 'order') {
            newOrder.order = value
            setSelectedView({ ...selectedView, order_by: newOrder })
        }
        else if (value !== 'asc' && value !== 'desc') {
            newOrder.column = value
            setSelectedView({ ...selectedView, order_by: newOrder })
        }
    }

    console.log(selectedView)

    
    return(<>
    <Flex height={'100%'}   width={'100%'} flexDir={'column'}> 
        <Box flex='1' overflow={'scroll'} py='2px'> 
             
               
            <Text fontWeight={'medium'} fontSize={'1.1em'} >{t('Conditions')}</Text>

            <Flex gap='30px' mt='1.5vh'> 
                <Box flex='1'> 
                    <Text fontSize={'.9em'} fontWeight={'medium'}>{t('AllConditionsAut')}</Text>
                    <Text fontSize={'.8em'} color='gray.600'>{t('AllConditionsAutDes')}</Text>

                    <Flex flexWrap={'wrap'} gap='10px' mt='2vh'> 
                        {(selectedView?.all_conditions || []).map((condition, index) => (<> 
                            <Flex alignItems={'center'}  key={`all-automation-${index}`}  gap='10px'>
                                <Box flex={'1'}> 
                                    <EditCondition deleteFunc={() => removeCondition(index, 'all_conditions')}  scrollRef={scrollRef}  typesMap={columnsMap} data={condition} setData={(newCondition) => {handleConditionChange(index, newCondition, 'all_conditions')}} />
                                </Box>
                            </Flex>
                            {index < selectedView.all_conditions.length -1 && <Flex bg='brand.gray_2' p='7px' borderRadius={'.5rem'} fontWeight={'medium'}>{t('AND')}</Flex>}
                        </>))}
                        <IconButton variant={'common'} aria-label='add' icon={<FaPlus/>} size='sm'  onClick={() => addCondition('all_conditions')}/>

                    </Flex>
                 </Box>

                <Box flex='1'> 
                    <Text fontSize={'.9em'}  fontWeight={'medium'}>{t('AnyConditionsAut')}</Text>
                    <Text fontSize={'.8em'} color='gray.600'>{t('AnyConditionsAutDes')}</Text>

                    <Flex flexWrap={'wrap'} gap='10px' mt='2vh'> 

                    {(selectedView?.any_conditions || []).map((condition, index) => (<> 
                        <Flex  alignItems={'center'} key={`any-automation-${index}`} gap='10px'>
                            <Box flex={'1'}> 
                                <EditCondition deleteFunc={() => removeCondition(index, 'any_conditions')}  scrollRef={scrollRef} typesMap={columnsMap} data={condition} setData={(newCondition) => {handleConditionChange(index, newCondition, 'any_conditions')}}  />
                            </Box>
                         </Flex>
                        {index < selectedView.any_conditions.length -1 && <Flex bg='brand.gray_2' p='7px' borderRadius={'.5rem'} fontWeight={'medium'}>{t('OR')}</Flex>}
                        </>
                    ))}
                    <IconButton variant={'common'} aria-label='add' icon={<FaPlus/>} size='sm'  onClick={() => addCondition('any_conditions')}/>
                    </Flex>

                </Box>
            </Flex>


                <Text mt='3vh' mb='1vh' fontWeight={'medium'}>{t('VisibleColumns')}</Text>
               
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="columns" direction="vertical">
                        {(provided) => (
                            <Box ref={provided.innerRef} {...provided.droppableProps} >
                                {selectedView.columns.map((column, index) => (
                                    <Draggable  key={`column-view-${index}`} draggableId={`column-view-${index}`} index={index}>
                                        {(provided, snapshot) => (
                                            <Flex maxW={'500px'} ref={provided.innerRef} alignItems="center" gap='20px'  {...provided.draggableProps} {...provided.dragHandleProps}   boxShadow={snapshot.isDragging?'0 4px 8px rgba(0, 0, 0, 0.3)':'none'}  flex='1' minW='300px' justifyContent={'space-between'}  mt='.8vh' bg='brand.gray_2' borderRadius={'.5rem'}  p='6px'>
                                                <Flex gap='10px'> 
                                                    <Text fontWeight={'medium'} fontSize={'.9em'}>{columnsMap[column][0]}</Text>
                                                </Flex>
                                                <IconButton bg='transaprent' variant={'delete'} size='xs'  icon={<HiTrash/>} aria-label='delete-all-condition' onClick={() => removeColumn(index)}/>
                                         </Flex>)}
                                    </Draggable>
                                ))}  
                            {provided.placeholder}
                            </Box>
                        )}
                    </Droppable>
                </DragDropContext>
                <Flex flexDir={'row-reverse'} maxW={'500px'}> 
                    <Button variant={'common'} ref={columnButtonRef} size='xs' mt='2vh' leftIcon={<FaPlus/>} isDisabled={columns.length === selectedView.columns.length} onClick={handleShowColumnBox}>{t('AddColumn')}</Button>
                </Flex>
                <Text mt='3vh' mb='1vh' fontWeight={'medium'}>{t('SortBy')}</Text>
                <Flex gap='40px' alignItems={'end'}> 
                    <Box flex='1' maxW={'500px'}> 
                        <CustomSelect variant='styled' containerRef={scrollRef} hide={false} selectedItem={columnsMap[selectedView.order_by.column][0] as ConversationColumn} setSelectedItem={(value:ConversationColumn) => handleOrderChange(value, 'column')} options={columns.filter(column => column !== 'local_id')} iconsMap={columnsMap}/>
                    </Box>
                    <Flex gap='15px'>
                        <Button leftIcon={<FaArrowUp/>} size='sm' variant={selectedView.order_by.order === 'asc'?'main':'common'}  onClick={() => handleOrderChange('asc', 'order')}>{t('Up')}</Button>
                        <Button leftIcon={<FaArrowDown/>} size='sm' variant={selectedView.order_by.order  !== 'asc'?'main':'common'}  onClick={() => handleOrderChange('desc', 'order')}>{t('Down')}</Button>
                    </Flex>
                </Flex>
        </Box>

        {addColumnBox &&
        <Box minW={columnButtonRef.current?.getBoundingClientRect().width} ref={columnBox} overflow={'scroll'} maxH={window.innerHeight - addColumnBox.bottom - 30} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.13)' left={addColumnBox.left} bottom={addColumnBox.bottom + 5} fontSize={'.8em'} background='white' borderRadius='.3rem' borderWidth='1px' borderColor='gray.200' zIndex={5} position='fixed'  >
            {columnsToSelect.filter(column => column !== 'id').map((column, index) => (
                <Flex key={`select-column-${index}`} px='15px' py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'brand.hover_gray'}} onClick={() => addColumn(column)}>
                    <Text>{columnsMap[column][1]}</Text>
                    <Text >{columnsMap[column][0]}</Text>
                </Flex>
            ))}
         </Box>}
    </Flex> 
    </>)
}

export default EditViewComponent


const EditCondition = ({data, setData, typesMap, scrollRef, deleteFunc}:{data:Condition, setData:(newData:Condition) => void, typesMap:{[key:string]:string[]}, scrollRef:RefObject<HTMLDivElement> ,  deleteFunc?:() => void}) => {

    //TRANSLATION
    const auth = useAuth()
    const session = useSession()
    const t_con = useTranslation('conversations').t
   
    const operationTypesDict:{[key:string]:string[]} = {'id':['leq', 'geq'], 'local_id':['leq', 'geq'], 'user_id':['eq', 'neq'], 'channel_type':['eq', 'neq'], 'created_at':['geq', 'leq', 'eq'], 'deletion_date':['geq', 'leq', 'eq'], 'updated_at':['geq', 'leq', 'eq'], 'solved_at':['geq', 'leq', 'eq'], 'urgency_rating': ['geq', 'leq', 'eq'], 'status': ['neq', 'eq'], 'theme':['eq', 'neq'], 'closed_at':['geq', 'leq', 'eq'], 'language':['eq', 'neq'], 'title':['geq', 'leq'], 'unseen_changes':['eq'],}
    
    //TRANSLATION
    const { t } = useTranslation('settings')
    const operationLabelsMap = {'set':t('set'), 'add':t('add'), 'substract':t('substract'), 'concatenate':t('concatenate'), 'append':t('append'), 'remove':t('remove'), 'eq':t('eq'), 'exists':t('exists'), 'neq':t('neq'), 'leq':t('leq'), 'geq':t('geq'), 'in':t('in'), 'nin':t('nin'), 'contains':t('contains'), 'ncontains':t('ncontains')}
    const columnsTypes =  Object.keys(operationTypesDict)
    let labelsMap:{[key:string]:string} = {}
    columnsTypes.map((column) => {labelsMap[column] = t(column)})
    
    //GET CUSTOM ATTRIBUTES
    const getOperationsByType = (type:string) => {
        switch (type) {
            case 'bool':
                return ['eq', 'neq']
            case 'int':
            case 'float':
            case 'timestamp':
                return ['geq', 'leq', 'eq'];
            case 'str':
                return ['eq', 'neq', 'contains', 'ncontains'];
            default:
                return []
        }
    }

     //GET CUSTOM ATTRIBUTES
    ((auth.authData?.customAttributes as any).conversation  || []).map((attribute:any) => {
        const { name, type } = attribute
        const operations = getOperationsByType(type)
        if (operations.length > 0) {
            operationTypesDict[name] = operations
            labelsMap[name] = name
        }
    })
    
    //IS HOVERING
    const [isHovering, setIsHovering] = useState<boolean>(false)

    //BOOLEAN TO CONTROL THE VISIBILITY OF THE LIST AND CLOSE ON OUTSIDE CLICK
    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const [showList, setShowList] = useState<boolean>(false)
    useOutsideClick({ref1:buttonRef, ref2:boxRef, containerRef:scrollRef, onOutsideClick:setShowList})

    //BOX POSITION LOGIC, TO SHOW IT UP OR DOWN OF THE INPUT, DEPENDING ON THE POSITION
    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef, setBoxStyle, boxPosition:'none', changeVariable:showList})

    const getValue = (inputType:string, value:any) => {
        switch(inputType) {
            case 'user_id':
                {
                    let usersDict:{[key:string]:string} = {}
                    if (auth.authData.users) Object.keys(auth.authData?.users).map((key:any) => {if (auth?.authData?.users) usersDict[key] = auth?.authData?.users[key].name})
                    usersDict['no_user'] = t('NoAgent')
                    usersDict['matilda'] = 'Matilda'
                    return usersDict[value]
                }
       
            case 'channel_id':
                const channels = session?.sessionData?.additionalData?.channels || []
                return channels?.find(channel => channel?.id === value)?.name || ''
    
            case 'urgency_rating':
                const ratingMapDic = {0:`${t('Priority_0')} (0)`, 1:`${t('Priority_1')} (1)`, 2:`${t('Priority_2')} (2)`, 3:`${t('Priority_3')} (3)`, 4:`${t('Priority_4')} (4)`}
                return (ratingMapDic as any)[value]
            
            case 'status':
                const statusMapDic = {'new':t_con('new'), 'open':t_con('open'), solved:t_con('solved'), 'pending':t_con('pending'), 'closed':t_con('closed')}
                return (statusMapDic as any)[value] 
            case 'unseen_changes':
                return value?t('true'):t('false')

            case 'created_at':
            case 'updated_at':
            case 'solved_at':
            case 'deletion_date':
            case 'closed_at':
            case 'channel_type':
                return t(value)
            default: 
                {   
                    const attributeType =  (auth.authData?.customAttributes as any).conversation.find((attr:any) => attr.name === data.column)?.type
                    if (attributeType === 'bool') return value?t('true'):t('false')
                    else if (attributeType === 'timestamp') return t(value)
                    else return value
                }
             }
        }

   return(
        <>
            <Flex display={'inline-flex'} position={'relative'} ref={buttonRef} p='7px' borderRadius={'.5rem'} bg='brand.gray_2' cursor={'pointer'} alignItems={'center'} justifyContent={'space-between'} _hover={{color:'brand.text_blue'}} onClick={()=> setShowList(true)} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
               
                <Text fontWeight={'medium'} fontSize={'.9em'}>{labelsMap[data?.column]} {(operationLabelsMap as any)[data.operation_type as string]?.toLocaleLowerCase()} {getValue(data?.column, data?.value)}</Text>
                {isHovering && 
                    <Flex alignItems={'center'} justifyContent={'center'} bg={'brand.gray_2'} backdropFilter="blur(1px)"  px='5px' position={'absolute'} right={'7px'} > 
                    <Icon boxSize={'16px'} as={RxCross2} onClick={(e) => {e.stopPropagation(); if (deleteFunc) deleteFunc()}}/>
                </Flex>}

            </Flex>
            <AnimatePresence> 
                {showList && 
                    <Portal>
                        <MotionBox initial={{ opacity: 0, marginTop:-10, marginBottom:-10 }} animate={{ opacity: 1, marginTop: 0,marginBottom:0 }}  exit={{ opacity: 0,marginTop:-10,marginBottom:-10}} transition={{ duration: '.2', ease: 'easeOut'}}
                        top={boxStyle.top}  onClick={(e) => e.stopPropagation()}  bottom={boxStyle.bottom} marginTop='10px' marginBottom='10px' left={boxStyle.left} width={boxStyle.width} minW={'300px'} maxW={'500px'} maxH='40vh' overflow={'scroll'} gap='10px' ref={boxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.5rem'} >
                            <Box p='15px' alignItems={'center'} gap='10px' >
                                <Box mb='2vh' flex='1'> 
                    
                                <CustomSelect  containerRef={scrollRef} hide={false} selectedItem={data.column} setSelectedItem={(value:ConversationColumn) => setData({...data, column:value, is_customizable:!columnsTypes.includes(value)})} options={Object.keys(operationTypesDict).filter(column => column !== 'id') as ConversationColumn[]} labelsMap={labelsMap as any}/>
                                </Box>
                                {((operationTypesDict[data.column as keyof typeof operationTypesDict] || [])).map((op, opIndex) => (
                                    <Box mt='1vh' key={`operation-${opIndex}`}>
                                        <Flex mb='.5vh'   gap='10px' alignItems={'center'}>
                                            <Radio isChecked={data.operation_type === op}  onClick={() => setData({...data, 'operation_type':op})}/>
                                            <Text fontWeight={'medium'} color='gray.600' fontSize={'.9em'}>{(operationLabelsMap as any)[op as string]}</Text>
                                        </Flex>
                                        {data.operation_type === op && 
                                        <Box ml='30px'>
                                            <VariableTypeChanger customType={!columnsTypes.includes(data.column)} inputType={columnsTypes.includes(data.column)? data.column : (auth.authData?.customAttributes as any).conversation.find((attr:any) => attr.name === data.column)?.type || 'default'} value={data.value} setValue={(value) => setData({...data, 'value':value})} operation={data.operation_type}/>
                                        </Box>}
                                    </Box>
                                ))}
                            </Box>
                            <Flex py='10px' justifyContent={'center'} borderTopColor={'gray.200'} borderTopWidth={'1px'}>
                                <Text cursor={'pointer'} _hover={{color:'rgb(59, 90, 246, 0.9)'}} onClick={() => setShowList(false)} fontWeight={'medium'} color='brand.text_blue'>{t('Ready')}</Text>
                            </Flex>
                        </MotionBox>
                    </Portal>}
            </AnimatePresence> 
        </>)
}