//REACT
import { Dispatch, SetStateAction } from "react"
import { useTranslation } from "react-i18next"
//FRONT
import { Text, Box, Flex, Button, NumberInput, NumberInputField } from "@chakra-ui/react"
//ICONS
import EditText from "../../../Components/Reusable/EditText"
//TYPING
import { configProps } from "../../../Constants/typing"
  

const GetMatildaConfig = ({configDict, setConfigDict, updateData, configIndex, isPhone = false}:{configDict:configProps | null, setConfigDict?:Dispatch<SetStateAction<configProps | null>>, updateData?: (configDict: configProps, index:number) => void, configIndex?:number, isPhone?:boolean}) => {

    //TRANSLATION CONSTANT
    const { t } = useTranslation('settings')

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
 
return(   
   <Box mt='2vh' >
   
        <Text mt='2vh' fontWeight={'medium'}>{t('IAUse')}</Text>
        <Text mb='1vh' fontSize={'.8em'} color='gray.500'>{t('IAUse')}</Text>
        <Flex mt='1vh' gap='10px'>
            <Button size='sm' onClick={(e) => handleCheckboxChange('is_matilda_enabled', true)} bg={configDict?.is_matilda_enabled?'brand.gradient_blue':'gray.100'} color={configDict?.is_matilda_enabled?'white':'black'} _hover={{bg:configDict?.is_matilda_enabled?'brand.gradient_blue_hover':'gray.200'}}>{t('Active')}</Button>
            <Button size='sm' onClick={(e) => handleCheckboxChange('is_matilda_enabled', false)} bg={!configDict?.is_matilda_enabled?'brand.gradient_blue':'gray.100'} color={!configDict?.is_matilda_enabled?'white':'black'} _hover={{bg:!configDict?.is_matilda_enabled?'brand.gradient_blue_hover':'gray.200'}}>{t('Inactive')}</Button>
        </Flex>

 
        {configDict?.is_matilda_enabled && <>
            {!isPhone && <> 
                <Text mt='4vh' fontWeight={'medium'}>{t('ResponseTime')}</Text>
                <Text mb='1vh' fontSize={'.8em'} color='gray.500'>{t('ResponseTimeDes')}</Text>
                <Flex mt='1vh' gap='10px'>
                    <Button size='sm' onClick={(e) => handleCheckboxChange('answer_inmediately', true)} bg={configDict?.answer_inmediately?'brand.gradient_blue':'gray.100'} color={configDict?.answer_inmediately?'white':'black'} _hover={{bg:configDict?.answer_inmediately?'brand.gradient_blue_hover':'gray.200'}}>{t('InstantResponse')}</Button>
                    <Button  size='sm' onClick={(e) => handleCheckboxChange('answer_inmediately', false)} bg={!configDict?.answer_inmediately?'brand.gradient_blue':'gray.100'} color={!configDict?.answer_inmediately?'white':'black'} _hover={{bg:!configDict?.answer_inmediately?'brand.gradient_blue_hover':'gray.200'}}>{t('AdvancedConfig')}</Button>
                </Flex>

 
                {!configDict.answer_inmediately && 
                    <Flex gap='20px'> 
                        <Box> 
                            <Text mt='2vh' fontSize={'.9em'}>{t('minimum_seconds_to_respond')}</Text>
                            <NumberInput size='sm' value={configDict?.['minimum_seconds_to_respond'] || 0} onChange={(valueString) => handleNumberChange('minimum_seconds_to_respond', valueString)} min={1} max={parseInt(configDict.maximum_seconds_to_respond)}>
                                <NumberInputField  fontSize={'.9em'} borderRadius='.5rem'   borderColor={'gray.300'} _hover={{ border: '1px solid #CBD5E0' }} _focus={{ borderColor: 'rgb(77, 144, 254)', borderWidth: '2px', px:'6px' }} px='7px' />
                            </NumberInput>
                        </Box>
                        <Box>
                            <Text fontSize={'.9em'} mt='2vh'>{t('maximum_seconds_to_respond')}</Text>
                            <NumberInput size='sm' value={configDict?.['maximum_seconds_to_respond'] || 0} onChange={(valueString) => handleNumberChange('maximum_seconds_to_respond', valueString)} min={parseInt(configDict.minimum_seconds_to_respond)} max={14400}>
                                <NumberInputField  fontSize={'.9em'} borderRadius='.5rem'   borderColor={'gray.300'} _hover={{ border: '1px solid #CBD5E0' }} _focus={{ borderColor: 'rgb(77, 144, 254)', borderWidth: '2px', px:'6px' }} px='7px' />
                            </NumberInput>
                        </Box>
                    </Flex>}
            </>}
  
            <Text mt='4vh' fontWeight={'medium'}>{t('WorksDays')}</Text>
            <Text mb='1vh'  fontSize={'.8em'} color='gray.500'>{t('WorksDaysDes')}</Text>
            <Flex mt='1vh' gap='10px'>
                <Button size='sm' onClick={(e) => handleCheckboxChange('is_restricted_to_business_days', true)} bg={configDict?.is_restricted_to_business_days?'brand.gradient_blue':'gray.100'} color={configDict.is_restricted_to_business_days?'white':'black'} _hover={{bg:configDict.is_restricted_to_business_days?'brand.gradient_blue_hover':'gray.200'}}>{t('OnlyAnswerWorkDays')}</Button>
                <Button  size='sm' onClick={(e) => handleCheckboxChange('is_restricted_to_business_days', false)} bg={!configDict?.is_restricted_to_business_days?'brand.gradient_blue':'gray.100'} color={!configDict.is_restricted_to_business_days?'white':'black'} _hover={{bg:!configDict.is_restricted_to_business_days?'brand.gradient_blue_hover':'gray.200'}}>{t('AnswerAlways')}</Button>
            </Flex>

            {configDict.is_restricted_to_business_days && <><Text mt='2vh' mb='1vh' fontSize={'.9em'}>{t('business_days')}</Text>
            <Flex gap='10px'>
                {weekDaysList.map((weekday, index) => {
                    return (
                    <Flex bg={configDict.business_days?.includes(( index )) ? 'gray.200' : 'transparent'} _hover={{bg:configDict?.business_days?.includes((index)) ? 'gray.300' : 'gray.100'}} onClick={() => toggleDaySelection(index)} cursor='pointer' borderWidth={'1px'} borderColor={'gray.200'}  borderRadius='full' key={`weekdays-${index}`} width='30px' height={'30px'} justifyContent={'center'} alignItems={'center'}>
                        <Text fontWeight={'medium'} fontSize={'.8em'}>{weekday}</Text>
                    </Flex>)
            })}
            </Flex>
            <Flex gap='20px'> 
                <Box> 
                    <Text fontSize={'.9em'} mt='2vh'>{t('business_day_start')}</Text>
                    <Box minW='150px'> 
                        <EditText type={'time'} hideInput={false} value={`${Math.floor(configDict?.['business_day_start'] || 0).toString().padStart(2, '0')}:${(((configDict?.['business_day_start'] || 0) % 1) * 60).toFixed(0).toString().padStart(2, '0')}`}  setValue={(value) => handleSelectChange('business_day_start', value)}/>
                    </Box>
                </Box>
                <Box> 
                    <Text fontSize={'.9em'} mt='2vh' >{t('business_day_end')}</Text>
                    <Box minW='150px' > 
                        <EditText type={'time'} hideInput={false} value={`${Math.floor(configDict?.['business_day_end'] || 0).toString().padStart(2, '0')}:${(((configDict?.['business_day_end'] || 0)% 1) * 60).toFixed(0).toString().padStart(2, '0')}`} setValue={(value) => handleSelectChange('business_day_end', value)}/>
                    </Box>
                </Box>
            </Flex>
            </>}

        {!isPhone && <> 
            <Text mt='4vh' fontWeight={'medium'}>{t('AgentTransfer')}</Text>
            <Text mb='1vh' fontSize={'.8em'} color='gray.500' >{t('AgentTransferDes')}</Text>
            <Flex mt='1vh' gap='10px'>
                <Button size='sm' onClick={(e) => handleCheckboxChange('notify_about_agent_transfer', true)} bg={configDict?.notify_about_agent_transfer?'brand.gradient_blue':'gray.100'} color={configDict?.notify_about_agent_transfer?'white':'black'} _hover={{bg:configDict?.notify_about_agent_transfer?'brand.gradient_blue_hover':'gray.200'}}>{t('NotifyClient')}</Button>
                <Button  size='sm' onClick={(e) => handleCheckboxChange('notify_about_agent_transfer', false)} bg={!configDict?.notify_about_agent_transfer?'brand.gradient_blue':'gray.100'} color={!configDict?.notify_about_agent_transfer?'white':'black'} _hover={{bg:!configDict?.notify_about_agent_transfer?'brand.gradient_blue_hover':'gray.200'}}>{t('NoNotify')}</Button>
            </Flex>

            <Text mt='2vh' fontSize={'.9em'}>{t('agent_transfer_message')}</Text>
            <Box maxW={'550px'} mt='.5vh'> 
                <EditText hideInput={false} value={`${configDict?.['agent_transfer_message']}`} setValue={(value) => handleTextChange('agent_transfer_message', value)}/>
            </Box>

            <Text mt='2vh' fontSize={'.9em'}>{t('out_of_business_agent_transfer_message')}</Text>
            <Box maxW={'550px'} mt='.5vh'> 
                <EditText hideInput={false} value={`${configDict?.['out_of_business_agent_transfer_message']}`} setValue={(value) => handleTextChange('out_of_business_agent_transfer_message', value)}/>
            </Box>

            <Text mt='4vh' fontWeight={'medium'}>{t('ConfirmInfo')}</Text>
            <Text mb='1vh' fontSize={'.8em'} color='gray.500'>{t('ConfirmInfoDes')}</Text>
            <Flex mt='1vh' gap='10px'>
                <Button  size='sm'  onClick={(e) => handleCheckboxChange('ask_for_requirement_confirmation', true)}  bg={configDict?.ask_for_requirement_confirmation ? 'brand.gradient_blue' : 'gray.100'}  color={configDict?.ask_for_requirement_confirmation ? 'white' : 'black'}  _hover={{ bg: configDict?.ask_for_requirement_confirmation ? 'brand.gradient_blue_hover' : 'gray.200' }}>{t('Confirm')}</Button>
                <Button size='sm'  onClick={(e) => handleCheckboxChange('ask_for_requirement_confirmation', false)} bg={!configDict?.ask_for_requirement_confirmation ? 'brand.gradient_blue' : 'gray.100'} color={!configDict?.ask_for_requirement_confirmation ? 'white' : 'black'}  _hover={{ bg: !configDict?.ask_for_requirement_confirmation ? 'brand.gradient_blue_hover' : 'gray.200' }}>{t('NoConfirm')}</Button>
            </Flex>
        </>}
        </>}


    
    </Box>)
}

export default GetMatildaConfig