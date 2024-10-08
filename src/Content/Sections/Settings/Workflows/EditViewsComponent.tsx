//REACT
import  { useState, useRef, useEffect, RefObject } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
//FRONT
import { Flex, Text, Box, IconButton, Button, NumberInput, NumberInputField } from "@chakra-ui/react"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
//COMPONENTS
import EditText from '../../../Components/Reusable/EditText'
import CustomSelect from '../../../Components/Reusable/CustomSelect'
//ICONS
import { FaPlus } from 'react-icons/fa6'
import { RxCross2 } from 'react-icons/rx'
//FUNCTIONS
import useOutsideClick from '../../../Functions/clickOutside'
//TYPING
import { View, TicketColumn } from '../../../Constants/typing'
   
//MAIN FUNCTION
function EditViewComponent ({scrollRef, viewData, editViewData}:{scrollRef:RefObject<HTMLDivElement>, viewData:View, editViewData:(view:View) => void}) {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('settings')

    //CONSTANTS FOR MAPPING THE COLUMS
    const columnsMap: { [key in TicketColumn]: [string, string] } = {
        id: [t('id'), "🔢"],
        local_id: [t('local_id'), "🔢"],
        user_id: [t('user_id'), "🎧"],
        channel_type: [t('channel_type'), "💬"],
        created_at: [t('created_at'), "📅"],
        updated_at: [t('updated_at'), "🔄"],
        solved_at: [t('solved_at'), "✅"],
        closed_at: [t('closed_at'), "🚪"],
        title: [t('title'), "📝"],
        subject: [t('subject'), "📚"],
        urgency_rating: [t('urgency_rating'), "⚠️"],
        status: [t('status'), "📊"],
        deletion_date: [t('deletion_date'), "❌"],
        unseen_changes: [t('unseen_changes'), "👀"]
      }
      
    let usersMap:{[key:string]:string} = {}
    for (let key in auth.authData.users) {if (auth.authData.users.hasOwnProperty(key)) usersMap[key] = auth.authData.users[key].name + ' ' +  auth.authData.users[key].surname}
    usersMap['0'] = t('NoAgent')
    usersMap['-1'] = 'Matilda'
    usersMap['{user_id}'] = usersMap[auth.authData?.userId || '-1']
    delete usersMap[auth.authData?.userId || '-1']
    const datesMap = {'{today}':t('Today'), '{yesterday}':t('Yesterday'), '{start_of_week}':t('WeeStart'),'{start_of_month}':t('StartMonth')}
    const columns: TicketColumn[] = Object.keys(columnsMap) as TicketColumn[]

    //SELECTED VIEW
    const [selectedView, setSelectedView] = useState<View>(viewData)  
    useEffect(() => editViewData(selectedView) , [selectedView])

     //ADD CONDITIONS LOGIC
    function handleConditionChange(index: number, key: 'column' | 'operation_type' | 'value', value: any, type: 'all_conditions' | 'any_conditions'): void {
        if (key === 'column') {const columnValue = value as TicketColumn}
        const newConditions = [...selectedView[type]];
        newConditions[index][key] = value
        setSelectedView({ ...selectedView, [type]: newConditions })
    }

    const addCondition = (type: 'all_conditions' | 'any_conditions') => {
        const freeColumns = columns.filter(column => !selectedView[type].map(item => item.column).includes(column))
        const newConditions = [...selectedView[type], { column: freeColumns[0], operation_type: 'geq', value: '' }]
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
    const [columnsToSelect, setColumnsToSelect] = useState<TicketColumn[]>(columns.filter(column => !selectedView.columns.includes(column)))
    useEffect(() => {setColumnsToSelect(columns.filter(column => !selectedView.columns.includes(column)))}, [selectedView])
    useOutsideClick({ref1:columnBox, ref2:columnButtonRef, onOutsideClick:(b:boolean) => {setAddColumBox(null)}})
    const handleShowColumnBox = () => {
        if (addColumnBox) setAddColumBox(null)
        else if (columnButtonRef?.current) setAddColumBox({bottom:window.innerHeight - columnButtonRef.current.getBoundingClientRect().top, left:columnButtonRef.current.getBoundingClientRect().left})
    }
    const addColumn = (column:TicketColumn) => {
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
    const handleOrderChange = (value:TicketColumn | 'asc' | 'desc' ,  type:'column' | 'order') => {
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

    //INEQUALITY TYPE DEPENDING ON THE COLUMN
    const columnInequalities = {'id':['leq', 'geq'], 'local_id':['leq', 'geq'], 'user_id':['eq', 'neq'], 'channel_type':['eq', 'neq'], 'created_at':['geq', 'leq', 'eq'], 'deletion_date':['geq', 'leq', 'eq'], 'updated_at':['geq', 'leq', 'eq'], 'solved_at':['geq', 'leq', 'eq'], 'urgency_rating': ['geq', 'leq', 'eq'], 'status': ['neq', 'eq'], 'subject':['eq', 'neq'], 'closed_at':['geq', 'leq', 'eq'], 'language':['eq', 'neq'], 'title':['geq', 'leq'], 'unseen_changes':['geq', 'leq'],}
    const inequialitiesMap = {'geq':'Mayor que', 'leq':'Menor que', 'eq':'Igual que', 'neq':'Distinto de'}
    
    //SELECTOR COMPONENTE, DEPENDING ON THR COLUMN
    const GetInputComponent = ({ condition, index, type, scrollRef }:{condition:{column:TicketColumn, value:any, operation_type:'geq'|'leq'|'eq'}, index:number,type: 'all_conditions' | 'any_conditions', scrollRef:RefObject<HTMLDivElement> }) => {
        
        const channelsMap = {'whatsapp':'Whatsapp', 'mail':t('Mail'), 'webchat':t('Web'),'instagram':'Instagram','google-business':'Google Business'}
        const urgencyMap:{[key:number]:string} = {0:`${t('Low')} (0)`, 1:`${t('Medium')} (0)`, 2:`${t('High')} (0)`, 3:`${t('VeryHigh')} (0)`, 4:`${t('Urgent')} (0)`}
        const statesMap = {'new':t('new'), 'open':t('open'),'pending':t('pending'),'solved':t('solved'), 'closed':t('closed')}
 
        switch(condition.column) {
            case 'id':
            case 'local_id':
                return <NumberInput value={condition.value} onChange={(value) => handleConditionChange(index, 'value', parseInt(value), type)} min={1} max={1000000} clampValueOnBlur={false} >
                            <NumberInputField borderRadius='.5rem'  fontSize={'.9em'} height={'37px'}  borderColor={'gray.300'} _hover={{ border:'1px solid #CBD5E0'}} _focus={{ px:'11px', borderColor: "rgb(77, 144, 254)", borderWidth: "2px" }} px='12px' />
                        </NumberInput>
            case 'user_id':
                return <CustomSelect containerRef={scrollRef} hide={false} selectedItem={condition.value} setSelectedItem={(value) => handleConditionChange(index, 'value', value, type)} options={Object.keys(usersMap)} labelsMap={usersMap}/>
            case 'channel_type':
                return <CustomSelect containerRef={scrollRef} hide={false} selectedItem={condition.value} setSelectedItem={(value) => handleConditionChange(index, 'value', value, type)} options={Object.keys(channelsMap)} labelsMap={channelsMap}/>
            case 'created_at':
            case 'deletion_date':
            case 'updated_at':
            case 'solved_at':
                return <CustomSelect containerRef={scrollRef} hide={false} selectedItem={condition.value} setSelectedItem={(value) => handleConditionChange(index, 'value', value, type)} options={Object.keys(datesMap)} labelsMap={datesMap}/>
            case 'subject':
                return <CustomSelect containerRef={scrollRef} hide={false} selectedItem={condition.value} setSelectedItem={(value) => handleConditionChange(index, 'value', value, type)} options={auth?.authData?.ticket_subjects || []}/>
            case 'urgency_rating':
                return <CustomSelect containerRef={scrollRef} hide={false} selectedItem={condition.value} setSelectedItem={(value) => handleConditionChange(index, 'value', value, type)} options={Object.keys(urgencyMap)} labelsMap={urgencyMap}/>
            case 'status':
                return <CustomSelect containerRef={scrollRef} hide={false} selectedItem={condition.value} setSelectedItem={(value) => handleConditionChange(index, 'value', value, type)} options={['new', 'open', 'pending', 'solved', 'closed']} labelsMap={statesMap}/>
            default:
                return <EditText value={condition.value} setValue={(value) => handleConditionChange(index, 'value', value, type)} hideInput={false} />
        }
    }
          
    return(<>
    <Flex height={'100%'}   width={'100%'} flexDir={'column'}> 
        <Box flex='1' overflow={'scroll'} py='2px'> 
             
                <Text fontWeight={'medium'} fontSize={'1.1em'}>{t('Conditions')}</Text>

                <Text mt='1vh' mb='1vh' color='gray.600' >{t('AllConditions')}</Text>
                {selectedView.all_conditions && selectedView.all_conditions.map((condition, index) => (
                    <Flex mt='.5vh'  key={`all-conditions-${index}`} alignItems='center' gap='20px'>
                        <Box flex='2'> 
                            <CustomSelect containerRef={scrollRef} hide={false} selectedItem={columnsMap[condition.column][0] as TicketColumn} setSelectedItem={(value:TicketColumn) => handleConditionChange(index, 'column', value, 'all_conditions')} options={columns.filter(column => column !== 'id')}iconsMap={columnsMap}/>
                        </Box>
                        <Box flex='1'>
                            <CustomSelect containerRef={scrollRef} labelsMap={inequialitiesMap} hide={false} selectedItem={condition.operation_type} setSelectedItem={(value:string) => handleConditionChange(index, 'operation_type', value, 'all_conditions')} options={columnInequalities[condition.column]}/>
                        </Box>
                        <Box flex='2'>
                            {GetInputComponent({condition, index, type:'all_conditions', scrollRef})}
                        </Box>
                        <IconButton bg='transaprent' border='none' size='sm' _hover={{bg:'gray.200'}} icon={<RxCross2/>} aria-label='delete-all-condition' onClick={() => removeCondition(index, 'all_conditions')}/>
                    </Flex>
                ))}
                <Button variant={'common'} size='sm' mt='2vh' leftIcon={<FaPlus/>}  isDisabled={selectedView.all_conditions.length === columns.length}   onClick={() => addCondition('all_conditions')}>{t('AddCondition')}</Button>

                <Text mt='3vh' mb='1vh'color='gray.600'>{t('AnyConditions')}</Text>
                {selectedView.any_conditions &&selectedView.any_conditions.map((condition, index) => (
                    <Flex mt='.5vh' key={`any-conditions-${index}`}  alignItems='center' gap='20px'>
                        <Box flex='2'> 
                            <CustomSelect  containerRef={scrollRef} hide={false} selectedItem={columnsMap[condition.column][0] as TicketColumn} setSelectedItem={(value:TicketColumn) => handleConditionChange(index, 'column', value, 'any_conditions')} options={columns} iconsMap={columnsMap}/>
                        </Box>
                        <Box flex='1'>
                            <CustomSelect containerRef={scrollRef} labelsMap={inequialitiesMap} hide={false} selectedItem={condition.operation_type} setSelectedItem={(value:string) => handleConditionChange(index, 'operation_type', value, 'any_conditions')} options={columnInequalities[condition.column]}/>
                        </Box>
                        <Box flex='2'>
                            {GetInputComponent({condition, index, type:'any_conditions', scrollRef})}
                        </Box>
                        <IconButton bg='transparent' border='none' size='sm' _hover={{bg:'gray.200'}} icon={<RxCross2/>} aria-label='delete-all-condition' onClick={() => removeCondition(index, 'any_conditions')}/>
                    </Flex>
                ))}
                <Button variant={'common'} mt='2vh'  leftIcon={<FaPlus/>} size='sm' isDisabled={(selectedView.any_conditions && selectedView.any_conditions.length === columns.length)} onClick={() => addCondition('any_conditions')}>{t('AddCondition')}</Button>

                <Text mt='3vh' mb='1vh' fontWeight={'medium'}>{t('VisibleColumns')}</Text>
               
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="columns" direction="vertical">
                        {(provided) => (
                            <Box ref={provided.innerRef} {...provided.droppableProps} >
                                {selectedView.columns.map((column, index) => (
                                    <Draggable  key={`column-view-${index}`} draggableId={`column-view-${index}`} index={index}>
                                        {(provided, snapshot) => (
                                            <Flex ref={provided.innerRef} alignItems="center" gap='20px' width='40%'  {...provided.draggableProps} {...provided.dragHandleProps}   boxShadow={snapshot.isDragging?'0 4px 8px rgba(0, 0, 0, 0.3)':'none'}  flex='1' minW='300px' justifyContent={'space-between'}  mt='.5vh' bg='brand.gray_2' borderRadius={'.5rem'} borderColor='gray.00' borderWidth={'1px'} p='5px'>
                                                <Flex gap='10px'> 
                                                    <Text fontWeight={'medium'} fontSize={'.9em'}>{columnsMap[column][0]}</Text>
                                                </Flex>
                                                <IconButton bg='transaprent' border='none' color='red.600' size='xs' _hover={{bg:'gray.200', color:'red.700'}} icon={<RxCross2/>} aria-label='delete-all-condition' onClick={() => removeColumn(index)}/>
                                         </Flex>)}
                                    </Draggable>
                                ))}  
                            {provided.placeholder}
                            </Box>
                        )}
                        
                    </Droppable>
                </DragDropContext>
                <Button variant={'common'} ref={columnButtonRef} size='sm' mt='2vh' leftIcon={<FaPlus/>} isDisabled={columns.length === selectedView.columns.length} onClick={handleShowColumnBox}>{t('AddColumn')}</Button>

                <Text mt='3vh' mb='1vh' fontWeight={'medium'}>{t('SortBy')}</Text>
                <Flex gap='40px' width={'60%'} minW={'600px'}> 
                    <Box flex='1'> 
                        <CustomSelect containerRef={scrollRef} hide={false} selectedItem={columnsMap[selectedView.order_by.column][0] as TicketColumn} setSelectedItem={(value:TicketColumn) => handleOrderChange(value, 'column')} options={columns.filter(column => column !== 'local_id')} iconsMap={columnsMap}/>
                    </Box>
                    <Flex gap='5px'>
                        <Button size='sm' bg={selectedView.order_by.order === 'asc'?'brand.black_button':'none'} color={selectedView.order_by.order === 'asc'?'white':'none'} _hover={{bg:selectedView.order_by.order === 'asc'?'brand.black_button_hover':'brand.gray_1', color:selectedView.order_by.order === 'asc'?'white':'blue.400'}}  onClick={() => handleOrderChange('asc', 'order')}>{t('Up')}</Button>
                        <Button size='sm'   bg={selectedView.order_by.order  !== 'asc'?'brand.black_button':'none'} color={selectedView.order_by.order !== 'asc'?'white':'none'} _hover={{bg:selectedView.order_by.order !== 'asc'?'brand.black_button_hover':'brand.gray_1', color:selectedView.order_by.order !== 'asc'?'white':'blue.400'}}  onClick={() => handleOrderChange('desc', 'order')}>{t('Down')}</Button>
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


 