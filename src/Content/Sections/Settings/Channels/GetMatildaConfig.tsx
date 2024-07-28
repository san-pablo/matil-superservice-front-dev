//REACT
import { Dispatch, SetStateAction } from "react"
//FRONT
import { Text, Box, Flex, Button, NumberInput, NumberInputField } from "@chakra-ui/react"
//ICONS
import EditText from "../../../Components/EditText"
//TYPING
import { configProps } from "../../../Constants/typing"
 

const GetMatildaConfig = ({configDict, setConfigDict, updateData, configIndex, isPhone = false}:{configDict:configProps | null, setConfigDict?:Dispatch<SetStateAction<configProps | null>>, updateData?: (configDict: configProps, index:number) => void, configIndex?:number, isPhone?:boolean}) => {

    const labelsDict:{[key:string]:any} = {
        answer_inmediately:'Responder inmediatamente',
        business_day_end:'Hora de fin',
        business_day_start:'Hora de inicio',
        business_days:'Días laborables',
        is_matilda_enabled:'Estado de Matilda',
        is_restricted_to_business_days:'Restrigir respuestas a días laborables',
        maximum_seconds_to_respond:'Máximo de segundos en responder',
        minimum_seconds_to_respond:'Mínimo de segundos en responder',
        notify_about_agent_transfer:'Notificar de la transferencia a un agente',
        agent_transfer_message:'Mensaje de transferencia al agente',
        out_of_business_agent_transfer_message:'Mensaje de transferencia al agente (fuera del horario laboral)',
        ask_for_requirement_confirmation: 'Confirmar requisitos' 
    }
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
   
        <Text mt='2vh' fontWeight={'medium'}>Utilización de la IA</Text>
        <Text mb='1vh' fontSize={'.8em'} color='gray.500'>Activa o desactiva el asistente de IA Matilda.</Text>
        <Flex mt='1vh' gap='10px'>
            <Button size='sm' onClick={(e) => handleCheckboxChange('is_matilda_enabled', true)} bg={configDict?.is_matilda_enabled?'brand.gradient_blue':'gray.100'} color={configDict?.is_matilda_enabled?'white':'black'} _hover={{bg:configDict?.is_matilda_enabled?'brand.gradient_blue_hover':'gray.200'}}>Activada</Button>
            <Button size='sm' onClick={(e) => handleCheckboxChange('is_matilda_enabled', false)} bg={!configDict?.is_matilda_enabled?'brand.gradient_blue':'gray.100'} color={!configDict?.is_matilda_enabled?'white':'black'} _hover={{bg:!configDict?.is_matilda_enabled?'brand.gradient_blue_hover':'gray.200'}}>Desactivada</Button>
        </Flex>

 
        {configDict?.is_matilda_enabled && <>
            {!isPhone && <> 
                <Text mt='4vh' fontWeight={'medium'}>Tiempo de respuesta</Text>
                <Text mb='1vh' fontSize={'.8em'} color='gray.500'>Configura el tiempo que tarda Matilda en responder a los mensajes.</Text>
                <Flex mt='1vh' gap='10px'>
                    <Button size='sm' onClick={(e) => handleCheckboxChange('answer_inmediately', true)} bg={configDict?.answer_inmediately?'brand.gradient_blue':'gray.100'} color={configDict?.answer_inmediately?'white':'black'} _hover={{bg:configDict?.answer_inmediately?'brand.gradient_blue_hover':'gray.200'}}>Responder instantáneamente</Button>
                    <Button  size='sm' onClick={(e) => handleCheckboxChange('answer_inmediately', false)} bg={!configDict?.answer_inmediately?'brand.gradient_blue':'gray.100'} color={!configDict?.answer_inmediately?'white':'black'} _hover={{bg:!configDict?.answer_inmediately?'brand.gradient_blue_hover':'gray.200'}}>Configuración avanzada</Button>
                </Flex>

 
                {!configDict.answer_inmediately && 
                    <Flex gap='20px'> 
                        <Box> 
                            <Text mt='2vh' fontSize={'.9em'}>{labelsDict.minimum_seconds_to_respond}</Text>
                            <NumberInput size='sm' value={configDict?.['minimum_seconds_to_respond'] || 0} onChange={(valueString) => handleNumberChange('minimum_seconds_to_respond', valueString)} min={1} max={labelsDict.maximum_seconds_to_respond}>
                                <NumberInputField  fontSize={'.9em'} borderRadius='.5rem'   borderColor={'gray.300'} _hover={{ border: '1px solid #CBD5E0' }} _focus={{ borderColor: 'rgb(77, 144, 254)', borderWidth: '2px', px:'6px' }} px='7px' />
                            </NumberInput>
                        </Box>
                        <Box>
                            <Text fontSize={'.9em'} mt='2vh'>{labelsDict.maximum_seconds_to_respond}</Text>
                            <NumberInput size='sm' value={configDict?.['maximum_seconds_to_respond'] || 0} onChange={(valueString) => handleNumberChange('maximum_seconds_to_respond', valueString)} min={labelsDict.minimum_seconds_to_respond} max={14400}>
                                <NumberInputField  fontSize={'.9em'} borderRadius='.5rem'   borderColor={'gray.300'} _hover={{ border: '1px solid #CBD5E0' }} _focus={{ borderColor: 'rgb(77, 144, 254)', borderWidth: '2px', px:'6px' }} px='7px' />
                            </NumberInput>
                        </Box>
                    </Flex>}
            </>}


  
            <Text mt='4vh' fontWeight={'medium'}>Días laborables</Text>
            <Text mb='1vh'  fontSize={'.8em'} color='gray.500'>Configura los días y horas en los que Matilda responderá a los mensajes.</Text>
            <Flex mt='1vh' gap='10px'>
                <Button size='sm' onClick={(e) => handleCheckboxChange('is_restricted_to_business_days', true)} bg={configDict?.is_restricted_to_business_days?'brand.gradient_blue':'gray.100'} color={configDict.is_restricted_to_business_days?'white':'black'} _hover={{bg:configDict.is_restricted_to_business_days?'brand.gradient_blue_hover':'gray.200'}}>Contestar sólo días laborables</Button>
                <Button  size='sm' onClick={(e) => handleCheckboxChange('is_restricted_to_business_days', false)} bg={!configDict?.is_restricted_to_business_days?'brand.gradient_blue':'gray.100'} color={!configDict.is_restricted_to_business_days?'white':'black'} _hover={{bg:!configDict.is_restricted_to_business_days?'brand.gradient_blue_hover':'gray.200'}}>Contestar siempre</Button>
            </Flex>

            {configDict.is_restricted_to_business_days && <><Text mt='2vh' mb='1vh' fontSize={'.9em'}>{labelsDict.business_days}</Text>
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
                    <Text fontSize={'.9em'} mt='2vh'>{labelsDict.business_day_start}</Text>
                    <Box minW='150px'> 
                        <EditText type={'time'} hideInput={false} value={`${Math.floor(configDict?.['business_day_start'] || 0).toString().padStart(2, '0')}:${(((configDict?.['business_day_start'] || 0) % 1) * 60).toFixed(0).toString().padStart(2, '0')}`}  setValue={(value) => handleSelectChange('business_day_start', value)}/>
                    </Box>
                </Box>
                <Box> 
                    <Text fontSize={'.9em'} mt='2vh' >{labelsDict.business_day_end}</Text>
                    <Box minW='150px' > 
                        <EditText type={'time'} hideInput={false} value={`${Math.floor(configDict?.['business_day_end'] || 0).toString().padStart(2, '0')}:${(((configDict?.['business_day_end'] || 0)% 1) * 60).toFixed(0).toString().padStart(2, '0')}`} setValue={(value) => handleSelectChange('business_day_end', value)}/>
                    </Box>
                </Box>
            </Flex>
            </>}

        {!isPhone && <> 
            <Text mt='4vh' fontWeight={'medium'}>Transferencia a un agente</Text>
            <Text mb='1vh' fontSize={'.8em'} color='gray.500' >Configura las notificaciones y mensajes cuando Matilda transfiere una conversación a un agente humano.</Text>
            <Flex mt='1vh' gap='10px'>
                <Button size='sm' onClick={(e) => handleCheckboxChange('notify_about_agent_transfer', true)} bg={configDict?.notify_about_agent_transfer?'brand.gradient_blue':'gray.100'} color={configDict?.notify_about_agent_transfer?'white':'black'} _hover={{bg:configDict?.notify_about_agent_transfer?'brand.gradient_blue_hover':'gray.200'}}>Notificar al cliente</Button>
                <Button  size='sm' onClick={(e) => handleCheckboxChange('notify_about_agent_transfer', false)} bg={!configDict?.notify_about_agent_transfer?'brand.gradient_blue':'gray.100'} color={!configDict?.notify_about_agent_transfer?'white':'black'} _hover={{bg:!configDict?.notify_about_agent_transfer?'brand.gradient_blue_hover':'gray.200'}}>No notificar</Button>
            </Flex>

            <Text mt='2vh' fontSize={'.9em'}>{labelsDict.agent_transfer_message}</Text>
            <Box maxW={'550px'} mt='.5vh'> 
                <EditText hideInput={false} value={`${configDict?.['agent_transfer_message']}`} setValue={(value) => handleTextChange('agent_transfer_message', value)}/>
            </Box>

            <Text mt='2vh' fontSize={'.9em'}>{labelsDict.out_of_business_agent_transfer_message}</Text>
            <Box maxW={'550px'} mt='.5vh'> 
                <EditText hideInput={false} value={`${configDict?.['out_of_business_agent_transfer_message']}`} setValue={(value) => handleTextChange('out_of_business_agent_transfer_message', value)}/>
            </Box>

            <Text mt='4vh' fontWeight={'medium'}>Confirmar requisitos</Text>
            <Text mb='1vh' fontSize={'.8em'} color='gray.500'>Configura si Matilda debe pedir confirmación de requisitos especificados.</Text>
            <Flex mt='1vh' gap='10px'>
                <Button  size='sm'  onClick={(e) => handleCheckboxChange('ask_for_requirement_confirmation', true)}  bg={configDict?.ask_for_requirement_confirmation ? 'brand.gradient_blue' : 'gray.100'}  color={configDict?.ask_for_requirement_confirmation ? 'white' : 'black'}  _hover={{ bg: configDict?.ask_for_requirement_confirmation ? 'brand.gradient_blue_hover' : 'gray.200' }}>Confirmar</Button>
                <Button size='sm'  onClick={(e) => handleCheckboxChange('ask_for_requirement_confirmation', false)} bg={!configDict?.ask_for_requirement_confirmation ? 'brand.gradient_blue' : 'gray.100'} color={!configDict?.ask_for_requirement_confirmation ? 'white' : 'black'}  _hover={{ bg: !configDict?.ask_for_requirement_confirmation ? 'brand.gradient_blue_hover' : 'gray.200' }}>No confirmar</Button>
            </Flex>
        </>}
        </>}


    
    </Box>)
}

export default GetMatildaConfig