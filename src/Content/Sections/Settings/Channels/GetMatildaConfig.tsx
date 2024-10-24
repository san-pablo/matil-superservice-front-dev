//REACT
import { Dispatch, SetStateAction, useRef, useState, CSSProperties, RefObject } from "react"
import { useTranslation } from "react-i18next"
//FRONT
import { Text, Box, Flex, Button, NumberInput, NumberInputField, Switch, Icon, chakra, shouldForwardProp, IconButton } from "@chakra-ui/react"
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { motion, isValidMotionProp } from 'framer-motion'
//COMPONENTS
import EditText from "../../../Components/Reusable/EditText"
import EditStructure from "../../../Components/Reusable/EditStructure"
//FUNCTIONS
import useOutsideClick from "../../../Functions/clickOutside"
import determineBoxStyle from "../../../Functions/determineBoxStyle"
//ICONS
import { RxCross2 } from "react-icons/rx"
import { FaPlus } from "react-icons/fa6"
//TYPING
import { configProps, FieldAction } from "../../../Constants/typing"
   
//MOTION BOX

const GetMatildaConfig = ({configDict, setConfigDict, updateData, configIndex, isPhone = false, scrollRef}:{configDict:configProps | null, setConfigDict?:Dispatch<SetStateAction<configProps | null>>, updateData?: (configDict: configProps, index:number) => void, configIndex?:number, isPhone?:boolean, scrollRef:RefObject<HTMLDivElement>}) => {

    //TRANSLATION CONSTANT
    const { t } = useTranslation('settings')
    const operationTypesDict = {'user_id':['eq', 'neq',  'exists'], 'group_id':['eq', 'neq',  'exists'], 'channel_type':['eq', 'neq', 'exists'], 'title':['eq', 'neq', 'exists'], 'theme':['eq', 'neq', 'exists'], 'urgency_rating':['eq', 'neq', 'leq', 'geq', 'exists'], 'status':['eq', 'neq'], 'unseen_changes':['eq', 'exists'], 'tags':['contains', 'ncontains', 'exists'], 'is_matilda_engaged':['eq', 'exists'],'is_csat_offered':['eq', 'exists'],
    'contact_business_id':['eq', 'neq',  'exists'], 'name':['eq', 'neq', 'contains', 'ncontains', 'exists'], 'language':['eq', 'neq',  'exists'], 'rating':['eq','neq', 'leq', 'geq', 'exists'], 'notes':['eq', 'neq', 'contains', 'ncontains', 'exists'], 'labels':['contains', 'ncontains', 'exists'],
    'domain':['eq', 'neq', 'contains', 'ncontains', 'exists'], 'hours_since_created':['eq', 'neq', 'leq', 'geq',  'exists'], 'hours_since_updated':['eq', 'neq', 'leq', 'geq',   'exists']
    }
    const typesMap = {'bool':['eq', 'exists'], 'int':['eq','neq', 'leq', 'geq', 'exists'], 'float':['eq','neq', 'leq', 'geq', 'exists'],'str': ['eq', 'neq', 'contains', 'ncontains', 'exists'], 'timestamp':['eq', 'neq', 'leq', 'geq',  'exists']}

    //SELECT EMOJIS
    const emojiBoxRef = useRef<HTMLDivElement>(null)
    const emojiButtonRef = useRef<HTMLButtonElement>(null)
    const [emojiVisible, setEmojiVisible] = useState<boolean>(false)
    useOutsideClick({ref1:emojiBoxRef, ref2:emojiButtonRef, onOutsideClick:setEmojiVisible})

    //BOX POSITION LOGIC, TO SHOW IT UP OR DOWN OF THE INPUT, DEPENDING ON THE POSITION
    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef:emojiButtonRef, setBoxStyle, boxPosition:'right', changeVariable:emojiVisible})

     const handleEmojiClick = (emojiObject: EmojiClickData, event: any) => {
        if (!configDict?.allowed_emojis.includes(emojiObject.emoji)) {
            if (setConfigDict) setConfigDict(prev => ({...prev as configProps, allowed_emojis: [...prev?.allowed_emojis as string[], emojiObject.emoji]}))
            else if (updateData) updateData({ ...configDict as configProps, allowed_emojis: [...configDict?.allowed_emojis as string[], emojiObject.emoji]}, configIndex as number)
        }
    }
    const deleteEmoji = (index: number) => {
        if (setConfigDict) setConfigDict(prev => ({...prev as configProps, allowed_emojis: (prev?.allowed_emojis || []).filter((_, i) => i !== index)}))
        else if (updateData) updateData({...configDict as configProps, allowed_emojis: (configDict?.allowed_emojis || []).filter((_, i) => i !== index)}, configIndex as number)
    }
    
    //LABELS DICT
    const weekDaysList = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
 
    const handleCheckboxChange = (key: any, value: boolean) => {
        if (setConfigDict) setConfigDict(prev => ({...prev as configProps, [key]: value}))
        else if (updateData) updateData({ ...configDict as configProps, [key]: value }, configIndex as number)
    }
    const handleNumberChange = (key:any,value: string) => {
        if (setConfigDict)setConfigDict(prev => ({ ...prev as configProps, [key]: parseInt(value)}))
        else if (updateData) updateData({ ...configDict as configProps, [key]: parseInt(value)}, configIndex as number)
    }
    const handleSelectChange = (key: any, value: string) => {
        const [hours, minutes] = value.split(':').map(Number)
        const timeValue = hours + minutes / 60
        if (setConfigDict)setConfigDict(prev => ({ ...prev as configProps, [key]: timeValue }))
        else if (updateData) updateData({ ...configDict as configProps, [key]: timeValue }, configIndex as number)
    }
    const handleTextChange = (key: any, value: string) => {
        if (setConfigDict)setConfigDict(prev => ({ ...prev as configProps, [key]: value }))
        else if (updateData) updateData({ ...configDict as configProps, [key]: value }, configIndex as number)
    }
    const toggleDaySelection = (dayIndex: number) => {

        if (configDict) {
            if (setConfigDict) {
                setConfigDict((prev:any) => {
                    if (prev.business_days && prev.business_days.includes(dayIndex)) {
                        const newBusinessDays = prev.business_days.filter((d: number) => d !== dayIndex)
                         return { ...prev, business_days: newBusinessDays}
                    } else if (prev.business_days) {
                        const newBusinessDays = [...(prev.business_days || []), dayIndex].sort()
                        return { ...prev, business_days: newBusinessDays}
                    }
                })
            }
            else if (updateData) {
                if (configDict.business_days && configDict.business_days.includes(dayIndex)) {
                    const newBusinessDays = configDict.business_days.filter((d: number) => d !== dayIndex)
                    if (updateData) updateData({ ...configDict, business_days: newBusinessDays }, configIndex as number)
                } else if (configDict.business_days) {
                    const newBusinessDays = [...(configDict.business_days || []), dayIndex].sort()
                    if (updateData) updateData({ ...configDict, business_days: newBusinessDays }, configIndex as number)
                }
            }
        }
    }
 
    const addElement = (type: 'contact_all_conditions' | 'contact_any_conditions') => {
        const newElement = {motherstructure:'contact', is_customizable:false, name:'name', op:'eq', value:''}

        if (setConfigDict){ setConfigDict((prev) => {
            if (prev) return { ...prev , [type]: [...prev?.[type] || [], newElement]}
            else return prev
        })
     }
    }
    //DELETE A CONDITION OR AN ACTION
    const removeElement = (type: 'contact_all_conditions' | 'contact_any_conditions', index: number ) => {
        if (setConfigDict) {
            setConfigDict((prev) => {
                if (prev) {
                    const conditionList = [...prev[type]]
                    const updatedConditionList = [...conditionList.slice(0, index), ...conditionList.slice(index + 1)]
                    return {...prev, [type]: updatedConditionList}  
                }
                else return prev
            })
        }
    }
    //EDIT A CONDITION OR AN ACTION
    const editElement = (type:'contact_all_conditions' | 'contact_any_conditions' , index:number, updatedCondition:FieldAction) => {
        if (setConfigDict) setConfigDict((prev) => {
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

return(   
   <Box >
        <Flex gap='10px' alignItems={'center'}>
            <Switch isChecked={configDict?.is_matilda_enabled} onChange={(e) => handleCheckboxChange('is_matilda_enabled', e.target.checked)}/>
            <Text fontWeight={'medium'}>{t('IAUse')}</Text>  
        </Flex>
        <Text fontSize={'.8em'} color='gray.600'>{t('IAUseDes')}</Text>

    
        {configDict?.is_matilda_enabled && <>

      
            <Text fontSize={'.9em'} mt='2vh' fontWeight={'medium'}>{t('Tone')}</Text>
            <Text fontSize={'.8em'} mb='.5vh' color='gray.600'>{t('ToneDes')}</Text>
            <EditText placeholder={`${t('Tone')}...`} hideInput={false} value={configDict.tone}  setValue={(value) => handleTextChange('tone', value)}/>
            
            <Flex gap='10px' mt='2vh' alignItems={'center'}>
                <Switch isChecked={configDict?.ask_if_intention_is_not_clear} onChange={(e) => handleCheckboxChange('ask_if_intention_is_not_clear', e.target.checked)}/>
                <Text fontSize={'.9em'} fontWeight={'medium'}>{t('AskIfIntention')}</Text>
            </Flex>
            <Text mt='2vh' fontSize={'.9em'} fontWeight={'medium'}>{t('AvailableEmojis')}</Text>
            <Text fontSize={'.8em'} color='gray.600'>{t('AddEmojiDes')}</Text>

            <Flex maxH='20vh' overflow={'scroll'} wrap={'wrap'} py='5px' gap='7px' mt='.5vh'>
                {configDict.allowed_emojis.map((emoji, index) => (
                  <EmojiComponent key={`emoji-${index}`} emoji={emoji} index={index}/>
                ))}
             </Flex>
             <Button ref={emojiButtonRef} onClick={() => setEmojiVisible(!emojiVisible)} variant={'common'} size='xs' mt='1vh' leftIcon={<FaPlus/>}>{t('AddEmoji')}</Button>

             
            <Box position={'fixed'} pointerEvents={emojiVisible?'auto':'none'} marginTop={'10px'} marginBottom={'10px'} top={boxStyle.top} bottom={boxStyle.bottom}right={boxStyle.right}  transition='opacity 0.2s ease-in-out' opacity={emojiVisible ? 1:0} zIndex={1000} ref={emojiBoxRef}> 
                <EmojiPicker onEmojiClick={handleEmojiClick}  open={emojiVisible} allowExpandReactions={false}/>
            </Box>
             
            {!isPhone && <> 
                <Flex gap='10px' mt='4vh' alignItems={'center'}>
                    <Switch isChecked={configDict?.answer_inmediately} onChange={(e) => handleCheckboxChange('answer_inmediately', e.target.checked)}/>
                    <Text fontWeight={'medium'}>{t('AnswerInmediatly')}</Text>
                </Flex>
                <Text fontSize={'.8em'} color='gray.600'>{t('AnswerInmediatlyDes')}</Text>
 
                {!configDict.answer_inmediately && 
                    <Flex gap='20px' mt='1vh'> 
                        <Box> 
                            <Text fontWeight={'medium'} fontSize={'.9em'}>{t('minimum_seconds_to_respond')}</Text>
                            <NumberInput size='sm' mt='.5vh' value={configDict?.['minimum_seconds_to_respond'] || 0} onChange={(valueString) => handleNumberChange('minimum_seconds_to_respond', valueString)} min={0} max={configDict.maximum_seconds_to_respond}>
                                <NumberInputField  fontSize={'.9em'} borderRadius='.5rem'   borderColor={'gray.300'} _hover={{ border: '1px solid #CBD5E0' }} _focus={{ borderColor: 'rgb(77, 144, 254)', borderWidth: '2px', px:'6px' }} px='7px' />
                            </NumberInput>
                        </Box>
                        <Box>
                            <Text fontSize={'.9em'} fontWeight={'medium'}  >{t('maximum_seconds_to_respond')}</Text>
                            <NumberInput size='sm' mt='.5vh' value={configDict?.['maximum_seconds_to_respond'] || 0} onChange={(valueString) => handleNumberChange('maximum_seconds_to_respond', valueString)} min={configDict.minimum_seconds_to_respond} max={14400}>
                                <NumberInputField fontSize={'.9em'} borderRadius='.5rem'   borderColor={'gray.300'} _hover={{ border: '1px solid #CBD5E0' }} _focus={{ borderColor: 'rgb(77, 144, 254)', borderWidth: '2px', px:'6px' }} px='7px' />
                            </NumberInput>
                        </Box>
                    </Flex>}
            </>}
  
            <Flex gap='10px' mt='4vh' alignItems={'center'}>
                <Switch isChecked={configDict?.is_restricted_to_business_days} onChange={(e) => handleCheckboxChange('is_restricted_to_business_days', e.target.checked)}/>
                <Text fontWeight={'medium'}>{t('OnlyAnswerWorkDays')}</Text>
            </Flex>
            <Text fontSize={'.8em'} color='gray.600'>{t('OnlyAnswerWorkDaysDes')}</Text>

            {configDict.is_restricted_to_business_days && <>
            <Text mt='1vh' mb='.5vh' fontWeight={'medium'} fontSize={'.9em'}>{t('business_days')}</Text>
            <Flex gap='10px'>
                {weekDaysList.map((weekday, index) => {
                    return (
                    <Flex bg={configDict.business_days?.includes(( index )) ? 'gray.200' : 'transparent'} _hover={{bg:configDict?.business_days?.includes((index)) ? 'gray.300' : 'gray.100'}} onClick={() => toggleDaySelection(index)} cursor='pointer' borderWidth={'1px'} borderColor={'gray.200'}  borderRadius='full' key={`weekdays-${index}`} width='30px' height={'30px'} justifyContent={'center'} alignItems={'center'}>
                        <Text fontWeight={'medium'} fontSize={'.8em'}>{weekday}</Text>
                    </Flex>)
                })}
            </Flex>
            <Flex fontWeight={'medium'} gap='20px'  mt='1vh'> 
                <Box> 
                    <Text fontSize={'.9em'}>{t('business_day_start')}</Text>
                    <Box minW='150px'> 
                        <EditText type={'time'} hideInput={false} value={`${Math.floor(configDict?.['business_day_start'] || 0).toString().padStart(2, '0')}:${(((configDict?.['business_day_start'] || 0) % 1) * 60).toFixed(0).toString().padStart(2, '0')}`}  setValue={(value) => handleSelectChange('business_day_start', value)}/>
                    </Box>
                </Box>
                <Box> 
                    <Text fontSize={'.9em'}>{t('business_day_end')}</Text>
                    <Box minW='150px' > 
                        <EditText type={'time'} hideInput={false} value={`${Math.floor(configDict?.['business_day_end'] || 0).toString().padStart(2, '0')}:${(((configDict?.['business_day_end'] || 0)% 1) * 60).toFixed(0).toString().padStart(2, '0')}`} setValue={(value) => handleSelectChange('business_day_end', value)}/>
                    </Box>
                </Box>
            </Flex>
            </>}

        {!isPhone && <> 
            <Flex gap='10px' mt='4vh' alignItems={'center'}>
                <Switch isChecked={configDict?.notify_about_agent_transfer} onChange={(e) => handleCheckboxChange('notify_about_agent_transfer', e.target.checked)}/>
                <Text  fontWeight={'medium'}>{t('AgentTransfer')}</Text>
            </Flex>
            <Text fontSize={'.8em'} color='gray.600'>{t('AgentTransferDes')}</Text>
            
            {configDict?.notify_about_agent_transfer && <>

            <Text mt='1vh' fontWeight={'medium'} fontSize={'.9em'}>{t('agent_transfer_message')}</Text>
            <Box  mt='.3vh'> 
                <EditText hideInput={false} value={`${configDict?.['agent_transfer_message']}`} setValue={(value) => handleTextChange('agent_transfer_message', value)}/>
            </Box>

            <Text mt='1.5vh' fontWeight={'medium'}  fontSize={'.9em'}>{t('out_of_business_agent_transfer_message')}</Text>
            <Box  mt='.3vh'> 
                <EditText hideInput={false} value={`${configDict?.['out_of_business_agent_transfer_message']}`} setValue={(value) => handleTextChange('out_of_business_agent_transfer_message', value)}/>
            </Box>
            </>}


            <Flex gap='10px' mt='4vh' alignItems={'center'}>
                <Switch isChecked={configDict?.allow_variable_confirmation} onChange={(e) => handleCheckboxChange('allow_variable_confirmation', e.target.checked)}/>
                <Text  fontWeight={'medium'}>{t('ConfirmInfo')}</Text>
            </Flex>
            <Text fontSize={'.8em'} color='gray.600'>{t('ConfirmInfoDes')}</Text>
        
            <Text mt='4vh' fontWeight={'medium'} >{t('ContactConditions')}</Text>
            <Text mt='1.5vh' fontWeight={'medium'}  fontSize={'.9em'}>{t('contact_all_conditions')}</Text>
            {(configDict?.contact_all_conditions || []).map((condition, index) => (
                    <Flex  key={`all-automation-${index}`} mt='2vh' gap='10px'>
                    <Box flex={'1'}> 
                        <EditStructure excludedFields={['conversation', 'contact_business'] }  data={condition} setData={(newCondition) => {editElement('contact_all_conditions', index, newCondition)}} scrollRef={scrollRef} operationTypesDict={operationTypesDict} typesMap={typesMap}/>
                    </Box>
                    <IconButton bg='transaprent' border='none' color='red' size='sm' _hover={{bg:'gray.200'}} icon={<RxCross2/>} aria-label='delete-all-condition' onClick={() => removeElement('contact_all_conditions', index)}/>
                    </Flex>
            ))}
            <Button mt='2vh' variant={'common'}  leftIcon={<FaPlus/>} size='xs'  onClick={() => addElement('contact_all_conditions')}>{t('AddCondition')}</Button>
            
            <Text mt='1.5vh' fontWeight={'medium'}  fontSize={'.9em'}>{t('contact_any_conditions')}</Text>
            {(configDict?.contact_any_conditions || []).map((condition, index) => (
                    <Flex  key={`all-automation-${index}`} mt='2vh' gap='10px'>
                    <Box flex={'1'}> 
                        <EditStructure excludedFields={['conversation', 'contact_business'] } data={condition} setData={(newCondition) => {editElement('contact_any_conditions', index, newCondition)}} scrollRef={scrollRef} operationTypesDict={operationTypesDict} typesMap={typesMap}/>
                    </Box>
                    <IconButton bg='transaprent' border='none' color='red' size='sm' _hover={{bg:'gray.200'}} icon={<RxCross2/>} aria-label='delete-any-condition' onClick={() => removeElement('contact_any_conditions', index)}/>
                    </Flex>
            ))}
            <Button mt='2vh' variant={'common'}  leftIcon={<FaPlus/>} size='xs'  onClick={() => addElement('contact_any_conditions')}>{t('AddCondition')}</Button>
            

 
        </>}
        </>}


    
    </Box>)
}

export default GetMatildaConfig