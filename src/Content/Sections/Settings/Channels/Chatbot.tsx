
//REACT
import  {useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../../AuthContext'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, IconButton, Image, Icon, Button, Skeleton, Radio } from "@chakra-ui/react"
import '../../../Components/styles.css'
import { motion, AnimatePresence } from 'framer-motion'
//COMPONENTS
import EditText from '../../../Components/EditText'
import ImageUpload from '../../../Components/ImageUpload'
import LoadingIconButton from '../../../Components/LoadingIconButton'
import ColorPicker from '../../../Components/ColorPicker'
import GetMatildaConfig from './GetMatildaConfig'
//FUNCTIONS
import timeStampToDate from '../../../Functions/timeStampToString'
//ICONS
import { RxCross2 } from 'react-icons/rx'
import { IoIosArrowDown, IoMdArrowRoundForward } from 'react-icons/io'
import { PiChatsBold } from "react-icons/pi"
import { FaPlus } from 'react-icons/fa6'
 
//TYPING
import { configProps } from '../../../Constants/typing'

//TYPING
interface ChatBotData  {
    'welcome_message':string
    'chat_position':'right' | 'left'
    'company_name': string
    'company_logo': string
    'header_background': [string, string]
    'header_color': string
    'chat_avatar': string
    'client_background': [string, string]
    'client_color': string
    'options': string[]
  }

const MotionBox = motion(Box)

//MAIN FUNCTION
function Chatbot () {

    //CONSTANTS
    const auth = useAuth()

    //REF FOR ALL THE COLOR PICKER CONTAINERS
    const containerRef = useRef<HTMLDivElement>(null)

    //FIXED AND CHANGING CHATBOT DATA
    const chatbotDataRef = useRef<ChatBotData | null>(null)
    const [chatBotData, setChatBotData] = useState<ChatBotData | null>(null)

    //MATILDA CONFIGURATION
    const matildaConfigRef = useRef<configProps | null>(null)
    const [matildaConfig, setMatildaConfig] = useState<configProps | null>(null)

     //BOOLEAN FOR WAIT THE DATA
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)

    //BOOLEAN FOR WAIT THE NEW INFO  message.sender_type !== 0 ? (isNextMessageBot && isLastMessageBot)? '.2rem .7rem .7rem .2rem' : isNextMessageBot?'.7rem .7rem .7rem .2rem': isLastMessageBot ? '.2rem .7rem .7rem .7rem':'.7rem' : (!isNextMessageBot && !isLastMessageBot && !isLastMessage)? '.7rem .2rem .2rem .7rem' : (isNextMessageBot || isLastMessage)?'.7rem .2rem .7rem .7rem':'.7rem .7rem .2rem .7rem'}}SEND
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    //BOOLENA FOR SHOW THE CHAT
    const [showChat, setShowChat] = useState<boolean>(false)

    //FILES FOR AVATAR AND LOGO
    const [logoFile, setLogoFile] = useState<File | undefined>(undefined)
    const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined)

    //UPDATE AN IMAGE
    const handleImageUpdate = (key: keyof ChatBotData, file: File | undefined) => {
        if (key === 'company_logo') setLogoFile(file)
        else setAvatarFile(file)

        setChatBotData((prevData) => ({
          ...prevData as ChatBotData,
          [key]: file ? URL.createObjectURL(file) : ''
        }))
      }

    const getPreSignedUrl = async (file:File) => {
        const response = await fetchData({endpoint: `superservice/${auth.authData.organizationId}/chatbot/s3_pre_signed_url`, method:'post', auth:auth, requestForm: { file_name: file.name}})   
        if (response?.status === 200) {
            const responseUpload = await fetch(response.data.upload_url, {method: "PUT", headers: {}, body: file})
            if (responseUpload.ok) {
                return response.data.access_url as string
            }
            else return ''
        }
        else return ''
    }

    //ADD OPTIONS LOGIC
    const addOption = (newOption:string) => {setChatBotData(prev => ({...prev as ChatBotData, options: [...prev?.options || [], newOption]}))}
    const removeOption = (index:number) => {setChatBotData(prev => ({...prev as ChatBotData, options: (prev?.options || []).filter((_, i) => i !== index)}))}
    const AddOptionComponent = () => {

        const [showAddOption, setShowAddOption] = useState<boolean>(false)
        const [newOption, setNewOption] = useState<string>('')

        return(<Box mt='1vh'>
            {!showAddOption && <Flex   flexDir={'row-reverse'}>
                <Button leftIcon={<FaPlus/>} size='xs' onClick={() => setShowAddOption(!showAddOption)}>Añadir atajo</Button>
            </Flex>}
            {showAddOption && 
            <Flex> 
                <EditText value={newOption} updateData={() => {if (newOption === '') setShowAddOption(false);else addOption(newOption)}} setValue={setNewOption} hideInput={false} focusOnOpen={true}/>
            </Flex>}
        </Box>)
    }

 

    //FETCH NEW DATA WHEN THE VIEW CHANGE
    useEffect(() => {
        const fetchInitialData = async() => {
            const fetchedData = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/chatbot`, setWaiting:setWaitingInfo, auth})
            if (fetchedData?.status === 200 && fetchedData?.data){
                setChatBotData(fetchedData.data.chatbot_configuration)
                chatbotDataRef.current = fetchedData.data.chatbot_configuration
                setMatildaConfig(fetchedData.data.matilda_configuration)
                matildaConfigRef.current = fetchedData.data.matilda_configuration
            }
        }
        fetchInitialData()
        document.title = `Canales - Chatbot - ${auth.authData.organizationName} - Matil`
     }, [])


    // SEND THE CHATBOT CONFIGURATION
    const sendChatBotCofig = async() => {
        let companyLogo = chatbotDataRef.current?.company_logo 
        let chatAvatar = chatbotDataRef.current?.chat_avatar 
        if (logoFile) companyLogo = await getPreSignedUrl(logoFile)
        if (avatarFile) chatAvatar = await getPreSignedUrl(avatarFile)

        fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/chatbot`, setValue:setWaitingSend, setWaiting:setWaitingSend, auth:auth, method:'put', requestForm:{chatbot_configuration:{...chatBotData, company_logo:companyLogo, chat_avatar:chatAvatar}, matilda_configuration:matildaConfig}, toastMessages:{'works':'Información del chat modificada con éxito', 'failed':'Error al modificar la información'}})
        chatbotDataRef.current = chatBotData
        matildaConfigRef.current = matildaConfig
    }
    return(<>

    
        <Flex justifyContent={'space-between'}> 
            <Text fontSize={'1.4em'} fontWeight={'medium'}>Configuración del Chatbot (Chat Web)</Text>
            <Button size='sm'  isDisabled={(JSON.stringify(chatbotDataRef.current) === JSON.stringify(chatBotData)) && (JSON.stringify(matildaConfigRef.current) === JSON.stringify(matildaConfig))} onClick={sendChatBotCofig}>{waitingSend?<LoadingIconButton/>:'Guardar cambios'}</Button>
        </Flex>            
        <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh' mb='2vh'/>
    
        <Skeleton isLoaded={!waitingInfo}> 
            <Flex flexDir={'column'} > 
                <Flex gap='80px' flex='1' overflow={'scroll'} ref={containerRef} px='2px' > 
                    <Box flex='1' > 

                    <Text fontWeight={'medium'}>Nombre de la compañía</Text>
                    <Text fontSize={'.8em'} color='gray.500'>Nombre que aparecerá en el encabezado</Text>
                    <Box width='300px' mt='1vh'> 
                        <EditText hideInput={false} value={chatBotData?.company_name} setValue={(value) => setChatBotData({...chatBotData as ChatBotData, company_name:value})}/>
                    </Box>

                    <Text fontWeight={'medium'} mt='2vh'>Logo de la compañía</Text>
                    <Text fontSize={'.8em'} color='gray.500'>Se situará a la izquierda del nombre de la compañía, en el encabezado. Utilice un archivo JPG, PNG o GIF de menos de 100 KB. 50px por 50px es lo ideal.</Text>
                    <Box width='300px' mt='1vh'> 
                        <ImageUpload id={0} initialImage={chatBotData?.company_logo} onImageUpdate={(file) => handleImageUpdate('company_logo', file as File)}/>
                    </Box>

                    <Text fontWeight={'medium'} mt='2vh'>Posición del chat</Text>
                    <Text fontSize={'.8em'} color='gray.500'>El chat y el botón se alinearán en el borde izquierdo o derecho de la página web final, según tu elección.</Text>
                    <Flex gap='30px' mt='1vh'>
                        <Flex   bg={chatBotData?.chat_position === 'left' ? 'blue.50':'gray.50'}cursor={'pointer'} alignItems={'end'} borderColor={'gray.200'} borderWidth={'1px'} borderRadius={'.7em'} p='10px' height={'150px'} flex='1' onClick={(e) => setChatBotData({...chatBotData as ChatBotData, 'chat_position':'left'})} >
                            <Flex flexDir={'column'} >
                                <Box height={'80px'} borderRadius={'.5em'} width={'50px'}  bg='gray.200' alignItems={'end'}  borderColor={'gray.300'} borderWidth={'1px'} />
                                <Box mt='5px' height={'20px'} borderRadius={'50%'} width={'20px'}  bg='gray.200' alignItems={'end'}  borderColor={'gray.300'} borderWidth={'1px'} />
                             </Flex>
                        </Flex>
        
                        <Flex bg={chatBotData?.chat_position === 'right' ? 'blue.50':'gray.50'} cursor={'pointer'} alignItems={'end'} justifyContent={'end'}  borderColor={'gray.200'} borderWidth={'1px'} borderRadius={'.7em'} p='10px' height={'150px'} flex='1' onClick={(e) => setChatBotData({...chatBotData as ChatBotData, 'chat_position':'right'})} >
                            <Flex alignItems={'end'} flexDir={'column'}>
                         
                                <Flex alignItems={'end'} flexDir={'column'} >
                                    <Box height={'80px'} borderRadius={'.5em'} width={'50px'}  bg='gray.200' alignItems={'end'}  borderColor={'gray.300'} borderWidth={'1px'} />
                                    <Box mt='5px' height={'20px'} borderRadius={'50%'} width={'20px'}  bg='gray.200' alignItems={'end'}  borderColor={'gray.300'} borderWidth={'1px'} />
                                </Flex>
                            </Flex>                     
                        </Flex>
                    </Flex>

                    <Text fontWeight={'medium'}  mt='2vh'>Mensaje de bienvenida</Text>
                    <Text fontSize={'.8em'} color='gray.500'>Mensaje inicial que le aprecerá al usario cada vez que abra una nuevo conversación</Text>
                    <Box width='100%' mt='1vh'> 
                        <EditText hideInput={false} value={chatBotData?.welcome_message} setValue={(value) => setChatBotData({...chatBotData as ChatBotData, welcome_message:value})}/>
                    </Box>

                    <Text fontWeight={'medium'} mt='2vh'>Color del fondo</Text>
                    <Text fontSize={'.8em'} color='gray.500'>El fondo del encabezado y del botón para desplegar el chat serán de este color. Se recomienda utilizar el color de la marca.</Text>
                    <Flex mt='1vh' alignItems={'center'} gap='10px'> 
                        <Box flex='1' > 
                            <ColorPicker containerRef={containerRef} color={chatBotData?.header_background[0]} 
                            setColor={(value) => {
                                const newHeaderBackground = [...(chatBotData as ChatBotData)?.header_background]
                                newHeaderBackground[0] = value
                                setChatBotData({ ...chatBotData as ChatBotData, header_background: newHeaderBackground as [string, string]  })
                            }}/>
                        </Box>
                        <Icon boxSize={'25px'} color='gray.400'  as={IoMdArrowRoundForward}/>
                        <Box flex='1' > 
                            <ColorPicker containerRef={containerRef} color={chatBotData?.header_background[1]} 
                            setColor={(value) => {
                                const newHeaderBackground = [...(chatBotData as ChatBotData)?.header_background]
                                newHeaderBackground[1] = value
                                setChatBotData({ ...chatBotData as ChatBotData, header_background: newHeaderBackground as [string, string]})
                            }}/>
                        </Box>
                    </Flex>

                    <Text fontWeight={'medium'} mt='2vh'>Color del texto</Text>
                    <Text fontSize={'.8em'} color='gray.500'>El texto del encabezado y el icono del botón para desplegar el chat serán de este color. Se recomienda que haya cierto contraste con el color de fondo, para que el texto sea legible.</Text>
                    <Box width='300px' mt='1vh'> 
                        <ColorPicker containerRef={containerRef} color={chatBotData?.header_color} setColor={(value) => setChatBotData({...chatBotData as ChatBotData, header_color:value})}/>
                    </Box>

                    <Text fontWeight={'medium'} mt='2vh'>Avatar del chat</Text>
                    <Text fontSize={'.8em'} color='gray.500'>En caso de no escoger ningún avatar, se utilizará el predeterminado de MATIL. Utilice un archivo JPG, PNG o GIF de menos de 100 KB. 50px por 50px es lo ideal.</Text>
                    <Box width='300px' mt='1vh'> 
                        <ImageUpload id={1} initialImage={chatBotData?.chat_avatar} onImageUpdate={(file) => handleImageUpdate('chat_avatar', file as File)}/>
                    </Box>

                    <Text fontWeight={'medium'} mt='2vh'>Color de fondo de los mensajes</Text>
                    <Text fontSize={'.8em'} color='gray.500'>Se aplicará a los mensajes que mande el usuario y a los atajos.</Text>
                    <Flex mt='1vh' alignItems={'center'} gap='10px'> 
                        <Box flex='1' > 
                            <ColorPicker containerRef={containerRef} color={chatBotData?.client_background[0]} 
                            setColor={(value) => {
                                const newHeaderBackground = [...(chatBotData as ChatBotData)?.header_background]
                                newHeaderBackground[0] = value
                                setChatBotData({ ...chatBotData as ChatBotData, client_background: newHeaderBackground as [string, string]})
                            }}/>
                        </Box>
                        <Icon boxSize={'25px'} color='gray.400'  as={IoMdArrowRoundForward}/>
                        <Box flex='1' > 
                            <ColorPicker containerRef={containerRef} color={chatBotData?.client_background[1]} 
                            setColor={(value) => {
                                const newHeaderBackground = [...(chatBotData as ChatBotData)?.header_background]
                                newHeaderBackground[1] = value
                                setChatBotData({ ...chatBotData as ChatBotData, client_background: newHeaderBackground as [string, string]  })
                            }}/>
                        </Box>
                    </Flex>

                    <Text fontWeight={'medium'} mt='2vh'>Color del texto de los mensajes</Text>
                    <Text fontSize={'.8em'} color='gray.500'>Se aplicará a los mensajes que mande el usuario y a los atajos.</Text>
                    <Box width='300px' mt='1vh'> 
                        <ColorPicker containerRef={containerRef} color={chatBotData?.client_color} setColor={(value) => setChatBotData({...chatBotData as ChatBotData, client_color:value})}/>
                    </Box>

                    <Text fontWeight={'medium'} mt='2vh'>Atajos</Text>
                    <Text fontSize={'.8em'} color='gray.500'>Opciones que estarán presentes al inciar una conversación con un usuario.</Text>
                    <Box width={'100%'} mt='2vh'> 
                        {chatBotData?.options.map((option, index) => (
                            <Flex key={`option-${index}`} mt={index === 0?'0':'1vh'} justifyContent={'space-between'} alignItems={'center'} p='5px' borderRadius=".5em" borderColor="gray.300" borderWidth="1px" bg="gray.50">
                                <Text fontSize={'.9em'}>{option}</Text>
                                <IconButton onClick={() => removeOption(index)} aria-label="remove-option" icon={<RxCross2  size='15px'/>} size="xs" border='none' bg='transparent'  />
                            </Flex>
                        ))}
                    </Box>
                    <AddOptionComponent/>
                    <Box height={'5vh'}/>
                    </Box>
                    <Box flex='1' bg='white'> 
                        <GetMatildaConfig configDict={matildaConfig} setConfigDict={setMatildaConfig}/>
                    </Box>
                </Flex>        
            </Flex>
        </Skeleton>


        {!waitingInfo &&<>
         <Flex zIndex={1000} style={showChat ? { animation: 'bounceButton 0.6s forwards' } : {}} onClick={() => setShowChat(!showChat)} alignItems={'center'} height={'67px'} width={'67px'} justifyContent={'center'} borderRadius={'full'} bg={`linear-gradient(to right, ${chatBotData?.header_background[0]},${chatBotData?.header_background[1]})`} color={chatBotData?.header_color} position={'fixed'} bottom='2vh' right='2vh' boxShadow={'2px 4px 10px rgba(0, 0, 0, 0.35)'}>
         
            <Box position="relative" width="27px" height="27px">
                <MotionBox initial={{ y: 0 }} animate={{ y: showChat ? -60 : 0 }} transition={{ duration: .2 }}> 
                    <Icon as={PiChatsBold} color='white' boxSize="27px"/>
                </MotionBox>
                <MotionBox initial={{ y: -60 }} animate={{ y: showChat ? -32 : 60 }} transition={{ duration: .2 }}> 
                    <Icon as={IoIosArrowDown} boxSize="27px" position="absolute"/>
                </MotionBox>
            </Box>        
        </Flex> 

        <AnimatePresence> 
                {showChat && 
                    <MotionBox  transition={{ duration: 0.2,  ease: [0.0, 0.9, 0.9, 1.0],   opacity: {duration: 0.2 }, scale: {duration: 0.2,  ease: [0.0, 0.9, 0.9, 1.0]}}} overflow={'hidden'} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)'  borderRadius={'1rem'} initial={{bottom:'-300px', opacity:0}} animate={{bottom:'90px', opacity:1}} exit={{bottom:'-300px', opacity:0}} position={'fixed'} bg='white' width='360px' height='650px' right='2vh' maxHeight='calc(100vh - 104px)' >
                        <ChatbotComponent customInfo={chatBotData as ChatBotData}/>
                    </MotionBox>}
        </AnimatePresence>
        </>}
    </>)
}

export default Chatbot

const ChatbotComponent = ({customInfo}:{customInfo:ChatBotData}) => {

    const messages = [{sender_type:-1, timestamp: new Date().toISOString() , text:customInfo?.welcome_message }, ]
  // TEXTAREA COMPONENT
  const TextAreaContainer = () => {
    return (          
    <div style={{height:'8vh', padding:'10px 20px 10px 20px', gap:'10px', display:'flex', alignItems:'center', justifyContent:'start'}}  >
        <div style={{display:'flex', position:'relative',flexGrow:'1', alignItems:'center', minHeight:'40px'}} > 
        <button id="fileButton" className="clip-btn"  onClick={() => {const input = document.getElementById('selectFile'); if (input) input.click()}}
          onMouseOver={() => {const btn = document.getElementById('fileButton');if (btn) btn.style.background = '#EDF2F7'}}
          onMouseOut={() => {const btn = document.getElementById('fileButton');if (btn) btn.style.background = 'white'}}>
            <svg viewBox="0 0 24 24"   width="16" height="16" style={{fill: 'black'}}><path d="M19.187 3.588a2.75 2.75 0 0 0-3.889 0L5.575 13.31a4.5 4.5 0 0 0 6.364 6.364l8.662-8.662a.75.75 0 0 1 1.061 1.06L13 20.735a6 6 0 0 1-8.485-8.485l9.723-9.723a4.247 4.247 0 0 1 4.124-1.139 4.247 4.247 0 0 1 3.025 3.025 4.247 4.247 0 0 1-1.139 4.124l-9.193 9.193a2.64 2.64 0 0 1-1.858.779 2.626 2.626 0 0 1-1.854-.779c-.196-.196-.338-.47-.43-.726a2.822 2.822 0 0 1-.168-.946c0-.7.284-1.373.775-1.864l8.132-8.131a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734l-8.131 8.132a1.148 1.148 0 0 0-.336.803c.003.204.053.405.146.587.01.018.018.028.02.032.22.215.501.332.786.332.29 0 .58-.121.798-.34l9.192-9.192a2.75 2.75 0 0 0 0-3.89Z"></path></svg>
          </button> 
            <textarea disabled className="text-area"  id="autoresizingTextarea" placeholder="Escribe un mensaje..."   rows={1} />
            <button className="send-btn"  style={{padding:'4px', alignItems:'center', justifyContent:'center', position: 'absolute', right: '6px', top:'10px' }} disabled  >
                <svg viewBox="0 0 350 480" width="13" height="13" style={{fill: 'white'}}>
                    <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/>
                </svg>
            </button>
        </div>     
      </div>)
  }

  return(<>     
   <div style={{ display:'flex',height:'100%',flexDirection:'column'}} >  
        <div style={{height:'7%', background:`linear-gradient(to right, ${customInfo?.header_background[0]},${customInfo?.header_background[1]})`, display:'flex', alignItems:'end', padding:'0 4%', justifyContent:'space-between', zIndex:10}} > 
            <div style={{display:'flex', gap:'3%', flex:'1', alignItems:'end', justifyContent:'flex-start'}}>

                <div style={{display:'flex', alignItems:'end', flexDirection:'row', gap:'30px'}}> 
                     <div style={{display:'flex', alignItems:'center', flexDirection:'row', gap:'15px'}}>    
                        <Image src={customInfo?.company_logo}  alt='companyLogo' boxSize="20px" objectFit="cover"  />
                         <span style={{color:customInfo?.header_color, fontWeight:500,  whiteSpace: 'nowrap',textOverflow: 'ellipsis', fontSize:'1.2em' }} >{customInfo?.company_name}</span>
                    </div>
                </div>
                 
            </div>
        </div>

        <div style={{width:'100%', height:'5%', overflow:'hidden', lineHeight:0, transform:'rotate(180deg)', marginTop:'-1vh'}}>
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <defs>
                    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: customInfo?.header_background[1], stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: customInfo?.header_background[0], stopOpacity: 1 }} />
                    </linearGradient>
                </defs>
                <path d="M0,50 C150,125 350,25 500,50 L500,150 L0,150 Z" fill="url(#waveGradient)"></path>
            </svg>
        </div>

      <div style={{height:'77%', fontWeight:400,  fontSize:'.9em', padding:'5% 4%', overflow:'scroll'}} >
          
          {messages.map((message, index)=>{

          const isNextMessageBot = messages[index + 1] ? messages[index + 1].sender_type !== 0 : false
          const isLastMessageBot = messages[index - 1] ? messages[index - 1].sender_type !== 0 : false
          const isLastMessage = index === messages.length - 1 
    
          const diaMensajeActual = new Date(message.timestamp).getDate();
          const diaMensajeAnterior = index > 0 ? new Date(messages[index - 1].timestamp).getDate() : 10;
          const mostrarBarraNuevoDia = diaMensajeAnterior !== null && diaMensajeActual !== diaMensajeAnterior;

          return(<div key={`message-${index}`}>
            {mostrarBarraNuevoDia && <div style={{marginTop:index>0?'15px':'0px',fontSize:'.7em', color:'#718096', textAlign: 'center' }}>{timeStampToDate(message.timestamp)}</div>}
            <div style={{ marginTop: index === 0 ? '0px' : (message.sender_type === messages[index - 1].sender_type? '3px':'15px')}}> 
            
            {(!isLastMessageBot && message.sender_type !== 0) && <span style={{fontSize:'.75em',color:'#718096', marginLeft:'35px'}}>{customInfo?.company_name}</span>}
            
            <div style={{gap:'10px', display:'flex', width:'100%', alignItems:'end', flexDirection:message.sender_type !== 0 ? 'row':'row-reverse'}}  key={`message-${index}`}  >
                {(message.sender_type !== 0 && !isNextMessageBot)&& <div style={{marginBottom:index > 1?'18px':'0'}}><img alt='chatLogo' src={customInfo?.chat_avatar} width='20px'/></div>}
                <div style={{maxWidth:'82%',display:'flex',flexDirection:'column',alignItems:'end', animation:index > 1 ?message.sender_type !== 0? 'expandFromLeft 0.5s ease-out' : 'expandFromRight 0.5s ease-out':'none'}}> 
                  <div style={{ marginLeft:(message.sender_type !== 0 && !isNextMessageBot)?'0':'30px', background:message.sender_type !== 0?'#EDF2F7':`linear-gradient(to right, ${customInfo?.client_background?customInfo.client_background[0]:'green'},${customInfo?.client_background?customInfo.client_background[1]:'green'})`, color:message.sender_type !== 0?'black':customInfo?.client_color,  padding:'8px', borderRadius: message.sender_type !== 0 ? (isNextMessageBot && isLastMessageBot)? '.2rem .7rem .7rem .2rem' : isNextMessageBot?'.7rem .7rem .7rem .2rem': isLastMessageBot ? '.2rem .7rem .7rem .7rem':'.7rem' : (!isNextMessageBot && !isLastMessageBot && !isLastMessage)? '.7rem .2rem .2rem .7rem' : (isNextMessageBot || isLastMessage)?'.7rem .2rem .7rem .7rem':'.7rem .7rem .2rem .7rem'}}>
                      {message.text}
                  </div>
                  {(((message.sender_type !== 0 && !isNextMessageBot) ||  !(message.sender_type !== 0) || isLastMessage) && index > 1) && <span style={{color:'#718096', marginTop:'5px',fontSize:'.7em',fontWeight:300}}>{formatearHora(message.timestamp)}</span>}
                </div>
            </div>

          </div>
          </div>)
          })}

          <div style={{display:'flex', marginTop:'15px', gap:'5px', flexWrap:'wrap', flexDirection:'row-reverse',justifyContent:'end'}}  > 
                {customInfo?.options&&
                    <>
                    {customInfo?.options.map((option:string, index:number) => (
                    <div style={{cursor:'pointer',  alignItems:'center', justifyContent:'center', background:`linear-gradient(to right, ${customInfo?.client_background?customInfo.client_background[0]:'green'},${customInfo?.client_background?customInfo.client_background[1]:'green'})`, padding:'8px', borderRadius:'2rem' }}  key={`option-${index}`} >
                        <span style={{ fontSize:'.9em',color:customInfo?.client_color}}>{option}</span>
                    </div>
                    ))}
                </>}
            </div>
      </div>

        <TextAreaContainer/>
    
      <div style={{height:'4%', fontSize:'.75em',color:'#718096',gap:'5px', fontWeight:300, justifyContent:'center', display:'flex', alignItems:'center'}}  >
            <Image src={'/images/Isotipo.svg'} alt='MATIL'  boxSize="10px" objectFit="cover"  />
          
          <span className={'matil-text'} onClick={() => window.open('https://www.matil.es', '_blank')}>MATIL</span>
      </div>
     
    </div> 
 </>)
}

const formatearHora = (timestamp:string) => {
    const fecha = new Date(timestamp);
    const hora = fecha.getHours();
    const minutos = fecha.getMinutes();
    const formatoHora = hora < 10 ? `0${hora}` : hora;
    const formatoMinutos = minutos < 10 ? `0${minutos}` : minutos;
    return `${formatoHora}:${formatoMinutos}`
}