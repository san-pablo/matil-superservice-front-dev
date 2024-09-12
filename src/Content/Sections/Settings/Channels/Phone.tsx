//REACT
import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../../../AuthContext"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Skeleton, Flex, Button, NumberInput, NumberInputField, IconButton } from "@chakra-ui/react"
//COMPONENTS
import ChannelInfo from "./Components/Channelnfo"
import ConfirmBox from "../../../Components/Reusable/ConfirmBox"
import FacebookLoginButton from "./SignUp-Buttons/FacebookLoginButton"
import GetMatildaConfig from "./GetMatildaConfig"
import EditText from "../../../Components/Reusable/EditText"
import SaveData from "./Components/SaveData"
//ICONS
import { FaPlus } from "react-icons/fa6"
import { AiFillAudio } from "react-icons/ai"
import { IoIosArrowDown } from "react-icons/io"
//TYPING
import { configProps } from "../../../Constants/typing"
 
//MAIN FUNCTION
function Phone () {

    //AUTH CONSTANT
    const auth = useAuth()

    //WAIT INFO BOOLEAN
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    //BOOLEAN FOR CREATING AN ACCOUNT
    const [showCreateAccount, setShowCreateAccount] = useState<boolean>(false)

    //DATA
    const [data, setData]  =useState<any[]>([{
        'configuration':{'are_outbound_calls_enabled':true, 'waiting_agent_audio':'', 'is_voicemail_enabled':true, 'is_return_call_enabled':true, 'is_call_overflow_enabled':true, 'overflow_number':'34692274144', 'is_call_recording_enabled':false},
        'credentials': {phone_number: "34692274144"},
        'display_id': "+34 692 27 41 44",
        'id': "334444493094553",
        'is_active': true,
        'matilda_configuration': {business_day_end: 19, business_day_start: 10},
        'name': "Ulanka"}])

    const dataRef = useRef<any>([{
        'configuration':{'are_outbound_calls_enabled':true, 'waiting_agent_audio':'', 'is_voicemail_enabled':true, 'is_return_call_enabled':true, 'is_call_overflow_enabled':true, 'overflow_number':'34692274144', 'is_call_recording_enabled':false},
        'credentials': {phone_number: "34692274144"},
        'display_id': "+34 692 27 41 44",
        'id': "334444493094553",
        'is_active': true,
        'matilda_configuration': {business_day_end: 19, business_day_start: 10},
        'name': "Ulanka"}])
      
    //FETCH DATA
    useEffect(() => {
        document.title = `Canales - Teléfono - ${auth.authData.organizationName} - Matil`
        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/whatsapp`,  setValue: setData, auth})   
            if (response?.status === 200) dataRef.current = response.data
        }
        fetchInitialData()
    }, [])

    const callNewWhatsapp = async() => {
        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/whatsapp`,  setValue: setData, auth})
        setShowCreateAccount(false)
    }

     const CreateNewAccount = () => {
        const [name, setName] = useState<string>('')
       
        return(
        <Box p='15px'> 
            <Text fontWeight={'medium'} fontSize={'.9em'}>Nombre de la cuenta</Text>
            <Box mb='2vh' mt='1vh'> 
                <EditText placeholder="Cuenta de Whatsapp" value={name} setValue={setName} hideInput={false}/>
            </Box>
            <FacebookLoginButton name={name} loadDataFunc={() => callNewWhatsapp()}/>
        </Box>)
     }
 
    const sendConfigDict = async (index:number) => {
        setWaitingSend(true)
        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/whatsapp`, method:'put', requestForm:data[index], auth, toastMessages:{'works':'Configuración actualizado con éxito', 'failed':'Hubo un error al actualizar la información'}})
        if (response?.status === 200) dataRef.current = data
        setWaitingSend(false)

    }

    const handleNameChange = (index:number, value:string) => {
        const updatedData = data.map((bot, i) =>i === index ? { ...bot, name: value } : bot)
        setData(updatedData)
    }
 
    const updateData = (newConfig:configProps, index:number) => {
        setData(prevData => {
            const newData = [...prevData]
            newData[index] = {...newData[index], matilda_configuration: newConfig}
            return newData}
        )
    }

    const handleCheckboxChange = (key: any, index:number, value: boolean) => {
        let currentData = [...data]
        currentData[index].configuration[key] = value
        setData(currentData)
    }

//SELECT A FILE
const handleFileSelect = async (e: any) => {

    const files = e.target.files
    const maxFileSize = 10 * 1024 * 1024
    if (files) {
        const selectedFilesArray = Array.from(files) as File[]
     }
    }

    return(<>
    <input id='selectAudio' type="file" style={{display:'none'}} onChange={(e) => { handleFileSelect(e) }} accept="audio/*"/>
    {showCreateAccount && 
        <ConfirmBox setShowBox={setShowCreateAccount} isSectionWithoutHeader={true}>
           <CreateNewAccount/>
        </ConfirmBox>}

        <SaveData data={data} setData={setData} dataRef={dataRef} channel="phone"/>
        <Box> 
            <Flex justifyContent={'space-between'}> 
                <Text fontSize={'1.4em'} fontWeight={'medium'}>Lineas activas (Teléfono)</Text>
                <Button whiteSpace='nowrap'  minWidth='auto' size='sm' leftIcon={<FaPlus/>} onClick={() =>setShowCreateAccount(true)}>Crear Linea</Button>
            </Flex>            
            <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh' mb='4vh'/>
        </Box>
        <Skeleton isLoaded={dataRef.current !== null && data !== null}> 
                {data.length === 0 ? <Text mt='3vh'>{auth.authData.organizationName} no tiene lineas de teléfono activas</Text>:
                <> 
                {data.map((bot, index) => (
                <Box bg='white' p='1vw' key={`whatsapp-channel-${index}`} borderRadius={'.7rem'} mt={index === 0?'':'8vh'} boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.1)'} > 
                    <Flex justifyContent={'space-between'} > 
                        <Box width={'100%'} maxWidth={'600px'}> 
                            <EditText value={bot.name} maxLength={100} nameInput={true} size='md'fontSize='1.5em'  setValue={(value:string) => handleNameChange(index, value)}/>
                        </Box>
                    </Flex>
                    <Box height={'1px'} mt='2vh'mb='2vh' width={'100%'} bg='gray.300'/>
                    <Flex px='7px' key={`whatsapp-${index}`} width={'100%'} gap='5vw'> 
                        <Box flex='1'> 
                            <ChannelInfo value={bot.credentials.phone_number} title="Teléfono" description="Número de teléfono de la cuenta"/>
                        </Box>
                        <Box flex='1'> 
                            
                            <Flex alignItems={'center'} mt='1vh' justifyContent={'space-between'}> 
                                <Text fontWeight={'medium'} fontSize={'1.2em'}>Configuración de la linea</Text>
                                <IconButton isRound bg='transparent' size='sm' onClick={()=>{}} aria-label="show-client" icon={<IoIosArrowDown size={'16px'} className={true ? "rotate-icon-down" : "rotate-icon-up" }/>}/>
                            </Flex>
                            <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh' mb='1vh' />

                            <Text fontWeight={'medium'}>Mensaje de espera</Text>
                            <Text mb='1vh' fontSize={'.8em'} color='gray.500'>Se reproducirá este mensaje mientras se esté buscando a un agente.</Text>
                            
                            <Flex alignItems={'center'} gap='15px'> 
                                <audio controls src={''}>
                                    Tu navegador no soporta el elemento de audio.
                                </audio>
                                <IconButton onClick={() => document.getElementById('selectAudio')?.click()} aria-label="push-audio" icon={<AiFillAudio/>} size='sm'/>
                            </Flex>

                            <Text mt='4vh' fontWeight={'medium'}>Permitir llamadas salientes</Text>
                            <Text mb='1vh' fontSize={'.8em'} color='gray.500'>Los agentes pueden hacer llamadas salientes a los clientes desde este número.</Text>
                            <Flex mt='1vh' gap='10px'>
                                <Button size='sm' onClick={(e) => handleCheckboxChange('are_outbound_calls_enabled', index, true)} bg={bot.configuration?.are_outbound_calls_enabled?'brand.gradient_blue':'gray.100'} color={bot.configuration?.answer_inmediately?'white':'black'} _hover={{bg:bot.configuration?.answer_inmediately?'brand.gradient_blue_hover':'gray.200'}}>Llamadas salientes permitidas</Button>
                                <Button  size='sm' onClick={(e) => handleCheckboxChange('are_outbound_calls_enabled',index,  false)} bg={!bot.configuration?.are_outbound_calls_enabled?'brand.gradient_blue':'gray.100'} color={!bot.configuration?.answer_inmediately?'white':'black'} _hover={{bg:!bot.configuration?.answer_inmediately?'brand.gradient_blue_hover':'gray.200'}}>Sólo llamadas de entrada</Button>
                            </Flex>

                            {bot.configuration?.are_outbound_calls_enabled && <>
                                <Text  fontSize={'.9em'} mt='2vh'>Botón para indicar la devolución de una llamada</Text>
                            
                            </>}
                     
                            <Text mt='4vh' fontWeight={'medium'}>Buzón de voz</Text>
                            <Text mb='1vh' fontSize={'.8em'} color='gray.500'>Enviar las llamadas al buzón de voz cuando las personas que llaman presionan 1 y cuando los agentes no están disponibles.</Text>
                            <Flex mt='1vh' gap='10px'>
                                <Button size='sm' onClick={(e) => handleCheckboxChange('is_voicemail_enabled', index, true)} bg={bot.configuration?.is_voicemail_enabled?'brand.gradient_blue':'gray.100'} color={bot.configuration?.is_voicemail_enabled?'white':'black'} _hover={{bg:bot.configuration?.is_voicemail_enabled?'brand.gradient_blue_hover':'gray.200'}}>Activo</Button>
                                <Button  size='sm' onClick={(e) => handleCheckboxChange('is_voicemail_enabled',index,  false)} bg={!bot.configuration?.is_voicemail_enabled?'brand.gradient_blue':'gray.100'} color={!bot.configuration?.is_voicemail_enabled?'white':'black'} _hover={{bg:!bot.configuration?.is_voicemail_enabled?'brand.gradient_blue_hover':'gray.200'}}>Desactivado</Button>
                            </Flex>

                            <Text mt='4vh' fontWeight={'medium'}>Redirección de llamadas</Text>
                            <Text mb='1vh' fontSize={'.8em'} color='gray.500'>Redirigir las llamadas a un tercero fuera del horario laboral definido.</Text>
                            <Flex mt='1vh' gap='10px'>
                                <Button size='sm' onClick={(e) => handleCheckboxChange('is_call_overflow_enabled', index, true)} bg={bot.configuration?.is_call_overflow_enabled?'brand.gradient_blue':'gray.100'} color={bot.configuration?.is_call_overflow_enabled?'white':'black'} _hover={{bg:bot.configuration?.is_call_overflow_enabled?'brand.gradient_blue_hover':'gray.200'}}>Redirigir</Button>
                                <Button  size='sm' onClick={(e) => handleCheckboxChange('is_call_overflow_enabled',index,  false)} bg={!bot.configuration?.is_call_overflow_enabled?'brand.gradient_blue':'gray.100'} color={!bot.configuration?.is_call_overflow_enabled?'white':'black'} _hover={{bg:!bot.configuration?.is_call_overflow_enabled?'brand.gradient_blue_hover':'gray.200'}}>No redirigir</Button>
                            </Flex>

                            {bot.configuration?.is_call_overflow_enabled && <>
                                <Text  fontSize={'.9em'} mt='2vh'>Número al que redirigir</Text>
                                <NumberInput size='sm' value={''} onChange={() => {}}>
                                    <NumberInputField  fontSize={'.9em'} borderRadius='.5rem'   borderColor={'gray.300'} _hover={{ border: '1px solid #CBD5E0' }} _focus={{ borderColor: 'rgb(77, 144, 254)', borderWidth: '2px', px:'6px' }} px='7px' />
                                </NumberInput>
                            </>}

                            <Text mt='4vh' fontWeight={'medium'}>Grabación de llamadas y consentimiento</Text>
                            <Text mb='1vh' fontSize={'.8em'} color='gray.500'>Activar la grabación automática de las llamadas entrantes y salientes o permita que las personas que llaman presionen 3 para aceptar o no aceptar las grabaciones (solo llamadas entrantes).</Text>
                            <Flex mt='1vh' gap='10px'>
                                <Button size='sm' onClick={(e) => handleCheckboxChange('is_call_recording_enabled', index, true)} bg={bot.configuration?.is_call_recording_enabled?'brand.gradient_blue':'gray.100'} color={bot.configuration?.is_call_recording_enabled?'white':'black'} _hover={{bg:bot.configuration?.is_call_recording_enabled?'brand.gradient_blue_hover':'gray.200'}}>Grabar llamadas</Button>
                                <Button  size='sm' onClick={(e) => handleCheckboxChange('is_call_recording_enabled',index,  false)} bg={!bot.configuration?.is_call_recording_enabled?'brand.gradient_blue':'gray.100'} color={!bot.configuration?.is_call_recording_enabled?'white':'black'} _hover={{bg:!bot.configuration?.is_call_recording_enabled?'brand.gradient_blue_hover':'gray.200'}}>No grabar llamadas</Button>
                            </Flex>
                         
                            <Flex mt='6vh' alignItems={'center'} justifyContent={'space-between'}> 
                                <Text fontWeight={'medium'} fontSize={'1.2em'}>Configuración de Matilda</Text>
                                <IconButton isRound bg='transparent' size='sm' onClick={()=>{}} aria-label="show-client" icon={<IoIosArrowDown size={'16px'} className={true ? "rotate-icon-down" : "rotate-icon-up" }/>}/>
                            </Flex>
                            <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh' mb='1vh' />
                            <GetMatildaConfig isPhone={true} configDict={bot.matilda_configuration} updateData={updateData} configIndex={index}/>
                        </Box>                        
                    </Flex>
                    </Box>
                ))} 
                </>}
      
        </Skeleton>
       
    </>)
}

export default Phone