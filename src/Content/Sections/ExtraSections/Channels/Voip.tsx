//REACT
import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Skeleton, Flex, Button,NumberInput, NumberInputField, NumberDecrementStepper, NumberInputStepper, NumberIncrementStepper,IconButton, Switch, Tooltip } from "@chakra-ui/react"
//COMPONENTS
import ChannelInfo from "./Components/Channelnfo"
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
import EditText from "../../../Components/Reusable/EditText"
import Table from "../../../Components/Reusable/Table"
import SaveChanges from "../../../Components/Reusable/SaveChanges"
//ICONS
import { BsTrash3Fill } from "react-icons/bs"
import { HiTrash } from "react-icons/hi2"
//TYPING
import { ConfigProps } from '../../../Constants/typing'
import { IoIosArrowBack } from "react-icons/io"
import { FaPlus } from "react-icons/fa"
import { useAuth0 } from "@auth0/auth0-react"

interface VoipProps { 
    id:string
    display_id:string
    credentials:{}
    configuration: {
    voice_engine:string    
    voice_id:string    
    maximum_inactivity_seconds:number    
    silence_duration_ms:number
    threshold:number    
    use_acceptance_utterances:boolean
    acceptance_utterances:string[]
    use_waiting_utterances:boolean  
    waiting_utterances:string[]
    allow_speech_interruption:boolean
    enable_transcription:boolean
    }
}
const CellStyle = ({column, element}:{column:string, element:any}) => {return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>}

//MAIN FUNCTION
function Voip () {
 
    //AUTH CONSTANT
    const auth = useAuth()
    const  { t } = useTranslation('settings')
    const { getAccessTokenSilently } = useAuth0()

    //CHANNELS LIST
    const [channelsList, setChannelsList] = useState<null | any[]>(null)

    //WAITING BOOLEANS FOR CREATING AN ACCOUNT
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    //DATA
    const [data, setData]  = useState<VoipProps | null>(null)
    const dataRef = useRef<VoipProps | null>(null)
      
    //MATILDA CONFIGURATION+
    const configIdRef = useRef<string>('')
    const [selectedConfigId, setSelectedConfigId] = useState<string>('')
    const [configData, setConfigData] = useState<ConfigProps[] | null>(null)

    //FETCH DATA
    const fetchInitialData = async() => {
        await fetchData({endpoint:`${auth.authData.organizationId}/settings/matilda_configurations`, setValue:setConfigData, getAccessTokenSilently, auth})
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/channels`, getAccessTokenSilently, auth})
        if (response?.status === 200){
          let voipChannels:any[] = []
          response.data.map((cha:any) => {if (cha.channel_type === 'voip')  voipChannels.push(cha)})

          if (voipChannels) {
            if (voipChannels.length === 1) {
                const responseMail = await fetchData({endpoint:`${auth.authData.organizationId}/settings/channels/${voipChannels[0].id}`,  setValue: setData, getAccessTokenSilently, auth})
                if (responseMail?.status === 200) {
                    dataRef.current = responseMail.data
                    setSelectedConfigId(responseMail.data.matilda_configuration_id)
                    configIdRef.current = responseMail.data.matilda_configuration_id
                }
            }
            setChannelsList(voipChannels)
          }
        }
    }
    useEffect(() => {
        document.title = `${t('Channels')} - Whatsapp - ${auth.authData.organizationName} - Matil`
        fetchInitialData()
      }, [])
  

    const saveChanges = async () => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/channels/${dataRef?.current?.id}`, setValue:setWaitingSend, setWaiting:setWaitingSend, auth,getAccessTokenSilently, method:'put', requestForm:{...data, matilda_configuration_id:selectedConfigId}, toastMessages:{'works':t('CorrectUpdatedInfo'), 'failed':t('FailedUpdatedInfo')}})
        if (response?.status === 200) {
            configIdRef.current = selectedConfigId
            dataRef.current = data
        }
    }

    const selectChannel = async (id:string) => {
        const responseMail = await fetchData({endpoint:`${auth.authData.organizationId}/settings/channels/${id}`,  setValue: setData,getAccessTokenSilently, auth})
        if (responseMail?.status === 200) {
            dataRef.current = responseMail.data
            setSelectedConfigId(responseMail.data.matilda_configuration_id)
            configIdRef.current = responseMail.data.matilda_configuration_id
        }
    } 

    return(<>

 
        <Box> 
            <Flex justifyContent={'space-between'}> 
            <Flex gap='20px' alignItems={'center'}> 
                {(channelsList !== null && channelsList.length > 0 && data !== null)  && <Tooltip label={t('GoBackChannels')}  placement='bottom' hasArrow bg='black'  color='white'  borderRadius='.4rem' fontSize='.75em' p='4px'> 
                    <IconButton aria-label='go-back' size='sm' bg='transparent' border='none' onClick={() => {setData(null)}} icon={<IoIosArrowBack size='20px'/>}/>
                </Tooltip>}
                <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('voip')}</Text>
            </Flex>
            {(channelsList !== null && channelsList.length > 0 && data !== null) && <Button variant={'delete_section'} leftIcon={<BsTrash3Fill/>} size='sm'>{t('DeleteAccount')}</Button>}
            </Flex>       
            <Box height={'1px'} width={'100%'} bg='border_color' mt='1vh' />
        </Box>
      
     
        {(data === null) ?
            <Box flex='1'> 
            <Skeleton isLoaded={ channelsList !== null}>
                <Flex  mt='5vh' justifyContent={'space-between'} alignItems={'end'}>
                    <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ActiveAccount', {count:channelsList?.length})}</Text>
                    <Flex gap='10px'> 
                    <Button variant={'common'} size={'sm'} leftIcon={<FaPlus/>} onClick={() => setData(null)}>{t('CreatAccount')}</Button>
                </Flex> 
            </Flex>
                <Table data={channelsList || []} CellStyle={CellStyle} excludedKeys={[ 'id', 'channel_type']} onClickRow={(row) => selectChannel(row.id)} columnsMap={{'name':[t('Name'), 300], 'display_id':[t('Account'), 300], 'is_active':[t('ActiveChannel'), 100]}} noDataMessage='' />
            </Skeleton>
            </Box>
        :
        <>
                <SaveChanges data={data} setData={setData} dataRef={dataRef} data2={selectedConfigId} dataRef2={configIdRef} setData2={setSelectedConfigId} onSaveFunc={saveChanges} areNullEnabled />

            <Flex flex='1' overflow={'hidden'} width={'100%'} gap='5vw'> 
                <Box flex='1' pt='4vh' overflow={'scroll'}> 
                    <Skeleton isLoaded={data !== null}> 
                        <ChannelInfo value={data?.configuration.voice_engine || ''} title={t('Engine')} description={t('EngineDes')}/>
                        <ChannelInfo value={data?.configuration.voice_id || ''} title={t('AccountId')} description={t('AccountIdDes')}/>
                   
                        <EditNumber inputType={'int'} value={data.configuration.maximum_inactivity_seconds} setValue={(val) => setData(prev => ({...prev as VoipProps ,configuration:{...(prev as VoipProps).configuration, maximum_inactivity_seconds:val}}))} title={t('InactivitySeconds')} description={t('InactivitySecondsDes')} min={0} max={30}  step={1}/>
                        <Box mt='1vh'> 
                            <EditNumber inputType={'int'} value={data.configuration.silence_duration_ms} setValue={(val) => setData(prev => ({...prev as VoipProps, configuration:{...(prev as VoipProps).configuration, silence_duration_ms:val}}))} title={t('SilenceDuration')} description={t('SilenceDurationDes')} min={0} max={10000}  step={100}/>
                        </Box>
                        <Box mt='1vh'> 
                            <EditNumber inputType={'float'} value={data.configuration.threshold} setValue={(val) => setData(prev => ({...prev as VoipProps,configuration:{...(prev as VoipProps).configuration, threshold:val}}))} title={t('Threshold')} description={t('ThresholdDes')} min={0} max={1} step={0.1}/>
                        </Box>

                        <Flex mt='2vh' gap='8px' alignItems={'center'}>
                            <Switch isChecked={data.configuration.allow_speech_interruption}  onChange={(e) => setData(prev => ({...prev as VoipProps, configuration:{...(prev as VoipProps).configuration,allow_speech_interruption:e.target.checked}}))}/>
                            <Text fontWeight={'medium'}>{t('AllowInterruption')}</Text>
                        </Flex>
                        <Text mb='1vh' color='text_gray' fontSize={'.9em'}>{t('AllowInterruptionDes')}</Text>

                        <Flex mt='2vh' gap='8px' alignItems={'center'}>
                            <Switch isChecked={data.configuration.enable_transcription}  onChange={(e) => setData(prev => ({...prev as VoipProps, configuration:{...(prev as VoipProps).configuration,enable_transcription:e.target.checked}}))}/>
                            <Text fontWeight={'medium'}>{t('EnableTranscription')}</Text>
                        </Flex>
                        <Text mb='1vh' color='text_gray' fontSize={'.9em'}>{t('EnableTranscriptionDes')}</Text>


                        <Flex mt='2vh' gap='8px' alignItems={'center'}>
                            <Switch isChecked={data.configuration.use_acceptance_utterances}  onChange={(e) => setData(prev => ({...prev as VoipProps, configuration:{...(prev as VoipProps).configuration,use_acceptance_utterances:e.target.checked}}))}/>
                            <Text fontWeight={'medium'}>{t('UseAcceptanceUtterances')}</Text>
                        </Flex>
                        <Text mb='1vh' color='text_gray' fontSize={'.9em'}>{t('UseAcceptanceUtterancesDes')}</Text>
                        {data.configuration.use_acceptance_utterances &&<StrList title={t('AcceptanceUtterances')}  values={data.configuration.acceptance_utterances} setValues={(val:string[]) =>  setData(prev => ({...prev as VoipProps, configuration:{...(prev as VoipProps).configuration,acceptance_utterances:val}}))}/>}
                        
                        <Flex  mt='2vh' gap='8px' alignItems={'center'}>
                            <Switch isChecked={data.configuration.use_waiting_utterances}  onChange={(e) => setData(prev => ({...prev as VoipProps,configuration:{...(prev as VoipProps).configuration,use_waiting_utterances:e.target.checked}}))}/>
                            <Text fontWeight={'medium'}>{t('UseWaitingUtterances')}</Text>
                        </Flex>
                        <Text mb='1vh'  color='text_gray' fontSize={'.9em'}>{t('UseWaitingUtterancesDes')}</Text>
                        {data.configuration.use_waiting_utterances && <StrList title={t('WaitingUtterances')} values={data.configuration.waiting_utterances} setValues={(val:string[]) =>  setData(prev => ({...prev as VoipProps, configuration:{...(prev as VoipProps).configuration,waiting_utterances:val}}))}/>}
                    </Skeleton>
                </Box>
                <Box flex='1' pt='4vh' overflow={'scroll'}> 
                    <Skeleton isLoaded={configData !== null}> 
                        <Text  fontWeight={'medium'}>{t('SelectedConfig')}</Text>
                        {configData?.map((config, index) => (
                            <Box transition={'box-shadow 0.3s ease-in-out'} _hover={{shadow:'md'}}  mt='2vh' key={`config-${index}`} bg={selectedConfigId === config.id?'rgba(59, 90, 246, 0.25)':'gray.50'} onClick={() => setSelectedConfigId(config.id)} borderColor={'border_color'} borderWidth={'1px'} borderRadius={'.5rem'} p='15px' cursor={'pointer'}>
                                <Text fontSize={'.9em'} fontWeight={'medium'}>{config.name}</Text>
                                <Text fontSize={'.8em'} color='text_gray'>{config.description}</Text>
                            </Box> 
                        ))}
                    </Skeleton>
                </Box>                        
            </Flex>  
             
        </>}
   
    </>)
}

export default Voip


interface EditNumberType {
    inputType:'int' | 'float'
    title:string
    description?:string
    value:number
    setValue:(num:number) => void
    min?:number
    max?:number
    showStepper?:boolean
    step?:number
}
const EditNumber = ({inputType, title, description, value, setValue, min, max, showStepper = true, step }: EditNumberType) => {


    const [currentValue, setCurrentValue] = useState<string>(String(value)) 
    const handleBlur = () => { 
        if (currentValue !== String(value)) {
            const normalizedValueString = currentValue?.replace(',', '.')
            if (normalizedValueString ) {
                 if (inputType === 'int') setValue(parseInt(normalizedValueString))
                else if (inputType === 'float') return setValue(parseFloat(normalizedValueString))
            }
        }
   } 

    return (<> 
        <Text fontWeight={'medium'}>{title}</Text>
        {description && <Text  color={'text_gray'} fontSize={'.9em'}>{description}</Text>}
        <NumberInput   step={step} width={'200px'} size='sm' mt='.5vh' value={currentValue} onBlur={handleBlur} onChange={(value) => setCurrentValue(value) } min={min} max={max}>
            <NumberInputField      fontSize={'.9em'} borderRadius='.5rem'   borderColor={'border_color'} _hover={{ border: '1px solid #CBD5E0' }} _focus={{ borderColor: 'rgba(59, 90, 246)', borderWidth: '2px', px:'6px' }} px='7px' />
                {showStepper && <> <NumberInputStepper _focus={{ borderColor: 'rgba(59, 90, 246)'}}>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper></>}
        </NumberInput>
        </>)
}


interface EditStrListType {
    title:string
    description?:string
    values:string[]
    setValues:(num:string[]) => void
    
}
const StrList = ({title, description, values, setValues}:EditStrListType) => {

    const { t } = useTranslation('settings')
    
     //ADD AND DELETE OPTIONS
     const addOption = (newOption:string) => {
        const valuesCopy = [...values]
        const newValues = [...valuesCopy, newOption]
        setValues(newValues)
    }
    const removeOption = (index:number) => {
        const valuesCopy = [...values]
        const newValues = valuesCopy.filter((_, i) => i !== index)
        console.log(newValues)
        setValues(newValues)
    }

    //ADD SHORTCUT COMPONENT
    const AddOptionComponent = () => {
        const [newOption, setNewOption] = useState<string>('')
        return(
        <Box mt='1vh' maxW={'90%'}>
            <EditText placeholder={`${t('Add')}...`}  value={newOption} updateData={() => {if (newOption !== '') addOption(newOption)}} setValue={setNewOption} hideInput={true} />
        </Box>)
    }

    return (<>
    <Text fontWeight={'medium'}>{title}</Text>
    {description && <Text  color={'text_gray'} fontSize={'.9em'}>{description}</Text>}
    <Box width={'100%'} mt='2vh' > 
        {values?.map((option, index) => (
            <Flex maxW={'90%'} key={`option-${index}`} mt={index === 0?'0':'1vh'} justifyContent={'space-between'}  shadow='sm' p='5px' borderRadius='.5rem' borderColor="border_color" borderWidth="1px"  bg='gray.50'>
                <Text fontSize={'.9em'}>{option}</Text>
                <IconButton color={'red'} onClick={() => removeOption(index)} aria-label="remove-option" icon={<HiTrash  size='15px'/>} size="xs" border='none' bg='transparent'  />
            </Flex>
        ))}
        <AddOptionComponent/>       
    </Box>
</>)

}