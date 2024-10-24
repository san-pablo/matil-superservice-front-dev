//PREACT COMPACT
import { useState, useEffect, useRef, Fragment } from 'react'
//STYLES
import './styles.css'
import { io } from 'socket.io-client'
//FUNCTIONS
import downloadFile from '../../../Functions/downloadFile'
import formatFileSize from '../../../Functions/formatFileSize'
import timeAgo from '../../../Functions/timeAgo'
import timeStampToDate from '../../../Functions/timeStampToString'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
 
//TYPING
type ConversationType = {conversation_id:string, created_at:string, theme:string, pending:boolean}
type MessagesTypes = 'plain' | 'html' | 'vector_retrieval' | 'options' | 'csat_survey' | 'rated' | 'location' | 'product' | 'pdf' | 'site' | 'image' | 'video' | 'file' | 'not_supported'
type ClientMessages = 'plain' | 'rated' | 'pdf' | 'image' | 'file'
interface MessageProps {
  sender_type: number
  type: MessagesTypes
  content: any
  timestamp: string
}
 
//MAIN FUNCTION PROPS
interface ChatBotProps {
    cahtId:string
    orgId:number
}

interface SurveyConfigProps {
  score_message: string
  ask_for_comments: boolean
  comment_message: string
  comment_placeholder: string
  thank_you_message: string
  background_color:[string, string]
  text_color:string
  buttons_background_color:[string, string]
  buttons_text_color:string
}

const handleSendSurveyMessage = async (surveyData: { csat_score: number, csat_comments: string }, conversationId:string) => {
    try {
        const response = await fetch(`https://api.matil.ai/v1/surveys/csat/${conversationId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(surveyData)
        })  
        if (!response.ok) throw new Error('Error en la solicitud PUT')
    } 
    catch (error) {console.log('Error al enviar la encuesta:', error)}
}

const calculateBorderRadius = (isBotMessage:boolean, isPreviousMessageBot:boolean, isNextMessageBot:boolean, isLastMessage:boolean ) => {
    const firstBorder = (isBotMessage && isPreviousMessageBot) ? 2 : 7
    const secondBorder = (!isBotMessage && !isPreviousMessageBot) ? 2 : 7
    const thirdBorder = isLastMessage ? 7 : (!isBotMessage && !isNextMessageBot) ? 2 : 7
    const fourthBorder = isLastMessage ? 7 : (isBotMessage && isNextMessageBot) ? 2 : 7
  
    return `.${firstBorder}rem .${secondBorder}rem .${thirdBorder}rem .${fourthBorder}rem`
  }
  
// MAIN FUNCTION
function Chatbot ({cahtId, orgId}:ChatBotProps) {
   
    
    const t_formats = useTranslation('formats').t
    const auth = useAuth()
    const customInfo = {
        welcome_message:'Hola',
        company_name: auth.authData.organizationName,
        company_logo: '',
        header_background: ['string', 'string'],
        header_color: 'white',
        chat_avatar: '/images/matil.svg',
        client_background: ['string', 'string'],
        client_color: 'white',
        options: []
    }
  // FUNCTION FOR RENDER THE MESSAGES, DEPENDING ON THE TYPE
  const ShowMessage = ({type, content}:{type:MessagesTypes, content:any}) => {
 
    // Regular expressions for emails and URLs
    if (type === 'plain') {

      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
      const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/
      const boldRegex = /\*\*(.*?)\*\*/

      // Creamos una nueva expresión regular combinada
      const combinedRegex = new RegExp(`(${emailRegex.source}|${urlRegex.source}|${boldRegex.source})`, 'gi');
      
      // Dividimos el contenido del texto utilizando la expresión regular combinada
      let parts = content.text.split(combinedRegex);
  
      // Filtramos los elementos undefined de la lista resultante
      parts = parts.filter((part:any) => part !== undefined && part !== '');
      
      parts = parts.reduce((acc:any, part:string, index:number, array:any) => {
        if (boldRegex.test(part) && index < array.length - 1 && part.replace(/\*\*/g, '') === array[index + 1]) {
          acc.push(part)
          array.splice(index + 1, 1)
        } 
        else acc.push(part)
        return acc
      }, [])

        return (<> 
            <span style={{ wordBreak: 'break-word'}}>
                {parts.map((part:string, index:number) => {
                    if (emailRegex.test(part)) {
                        return (
                            <a key={index} href={`mailto:${part}`} style={{ color: '#1a73e8', wordBreak: 'break-all', whiteSpace: 'pre-line' }}>{part}</a>)
                    } else if (urlRegex.test(part)) {
                         return (
                            <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#1a73e8', wordBreak: 'break-all', whiteSpace: 'pre-line' }}>{part}</a>)
                    }
                     else if (boldRegex.test(part)) {
                      const boldText = part.replace(/\*\*/g, '')
                      return <span style={{fontWeight:500}} key={index}>{boldText}</span>
                    } else return <span key={index}>
                      {part.split('\n').map((line, i) => (
                          <Fragment key={i}>
                              {i > 0 && <br />}
                              {line}
                          </Fragment>
                      ))}
                  </span>
              })}
            </span>
            {(content?.sources && content?.sources.length > 0) && 
            <div style={{marginTop:'10px'}}>
            <span style={{fontWeight:'500'}} >Fuentes</span>
              {content.sources.map((source:{title:string, uuid:string, help_center_id:string}, index:number) => (
                  <div key={`source-${index}`} className={'vector-source'}  onClick={() => window.open(`https://www.help.matil.ai/${source.help_center_id}/article/${source.uuid}`, '_blank')} >
                      <span>{source.title}</span>
                      <svg viewBox="0 0 512 512"width="12"  height="12" style={{transform:'rotate(-90deg)'}}  fill="currentColor" ><path d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path></svg>
                  </div>
              ))}
            </div>}
        </>)
    }

    //RATING
    else if (type === 'csat_survey') return (<> 
    
    <div style={{width:'64vw',  overflow:'hidden', position:'relative', display:'flex', justifyContent:'center', alignItems:'center', height:'33vw'}}>
      <div style={{width:'100%', padding:'0 3px 0 3px'}}> 
        <Stars surveyConfig={content} handleSendMessage={handleSendSurveyMessage} conversationId={content.conversation_uuid} currentScore={content.score} currentComment={content.comments} />
      </div>
    </div>
    </>)
    //LOCATION
    else if (type === 'location') return (
      <div className="components-container">
          <h4 className="location-name">{content.name}</h4>
          <p className="location-address">{content.address}</p>
          <a href={`https://www.google.com/maps/search/?api=1&query=${content.latitude},${content.longitude}`} target="_blank" rel="noopener noreferrer" className="location-map-link">Ver ubicación en el mapa</a>
      </div>
    )

   //PRODUCT
   else if (type === 'product') return (
    <div>
      <img src={content.url} alt={content.name} className="product-image"/>
      <span className='location-address'>{content.name}</span>
      <h4 className="location-name">{(content.price).toLocaleString('es-ES', {minimumFractionDigitis:0, maximiumFractionDigits:2})} €</h4>
        <a href={content.site_link} target="_blank" rel="noopener noreferrer" className="location-map-link">Ver en la tienda</a>
    </div>
  )

  //SITE LINK
  else if (type === 'site') return <a href={content.site_link} target="_blank" rel="noopener noreferrer" className="location-map-link">{content.url}</a>

  //IMAGE
  else if (type === 'image') return (<img style={{maxWidth:'100%', height:content.url.endsWith('svg')?'200px':''}} src={content.url} alt="image" />)

  //DOC LINK (PDF, FILE, VIDEO)
  else if (type === 'pdf' || type === 'file' || type === 'video') {
      
    let path = 'M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V304H176c-35.3 0-64 28.7-64 64V512H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM176 352h32c30.9 0 56 25.1 56 56s-25.1 56-56 56H192v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V448 368c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24H192v48h16zm96-80h32c26.5 0 48 21.5 48 48v64c0 26.5-21.5 48-48 48H304c-8.8 0-16-7.2-16-16V368c0-8.8 7.2-16 16-16zm32 128c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H320v96h16zm80-112c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v32h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v48c0 8.8-7.2 16-16 16s-16-7.2-16-16V432 368z'
    if (type === 'file') path = 'M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z'
    if (type === 'video') path = 'M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM64 288c0-17.7 14.3-32 32-32h96c17.7 0 32 14.3 32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V288zM300.9 397.9L256 368V304l44.9-29.9c2-1.3 4.4-2.1 6.8-2.1c6.8 0 12.3 5.5 12.3 12.3V387.7c0 6.8-5.5 12.3-12.3 12.3c-2.4 0-4.8-.7-6.8-2.1z'

    return (
        <div onClick={() => downloadFile(content.url)} className='components-container' style={{flexDirection:'row', color: customInfo?.client_color, gap:'7px', cursor:'pointer'}}>
          <svg viewBox="0 0 512 512" width="20" height="20" style={{fill:  customInfo?.client_color,}}>
              <path d={path}/>
          </svg>
          <div style={{ display: 'flex', color: customInfo?.client_color,flexDirection: 'column', marginTop:'-4px' }}> 
            <span style={{ fontSize:'.95em'}}  >{content.file_name}</span>
            <span style={{ fontWeight:300, fontSize:'.85em'}} >{formatFileSize(content.file_size)}</span>
          </div>
        </div>
       )
    }
     else return null
  }
  
  //Mensaje inicial y mensajes
  const [messages, setMessages] = useState<MessageProps[]>([])
 
  // IS BOT WRITTING
  const [isBotWriting, setIsBotWriting] = useState<boolean>(false)
   
  // INPUT REF, SCROLL REF AND SMOOTH SCROLL EFFECT
  const inputRef= useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (scrollRef.current) {
        const scrollableElement = scrollRef.current
        scrollableElement.scrollTo({ top: scrollableElement.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  //SELECT A FILE
  const handleFileSelect = async (e: any) => {
    const files = e.target.files
    const maxFileSize = 2 * 1024 * 1024

     if (files) {
      const selectedFilesArray = Array.from(files)
      const file = selectedFilesArray[0] as File

      if (file.size > maxFileSize) return

      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      let messageType: ClientMessages = 'file'

      if (fileExtension === 'pdf') messageType = 'pdf'
      else if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'gif') messageType = 'image'

      //handleSendMessage(file, messageType)
    }
  }

  // TEXTAREA COMPONENT
  const TextAreaContainer = () => {
    const [inputValue, setInputValue] = useState<string>('')
    function resizeTextarea( e:any ) {
      setInputValue(e.target.value)
      e.target.style.height = 'auto'
      e.target.style.height = e.target.scrollHeight + 'px'
    }

     //Enviar el texto a través del input y resizear la text area
    const handleKeyDown = (event: any) => {
      if (event.key === 'Enter' && !isBotWriting) {
        event.preventDefault()
        if (inputValue.trim() !== '') {
          //handleSendMessage(inputValue, 'plain')
        }
      }}

    return (          
    <div style={{height:'8vh', padding:'10px 20px 10px 20px', gap:'10px', display:'flex', alignItems:'center', justifyContent:'start'}}  >
        <div style={{display:'flex', position:'relative',flexGrow:'1', alignItems:'center', minHeight:'40px'}} > 
        <button   id="fileButton"  className="clip-btn"  onClick={() => {if (!isBotWriting) {const input = document.getElementById('selectFile'); if (input) input.click()}}}>
            <svg viewBox="0 0 24 24"   width="16" height="16" style={{fill: 'black'}}><path d="M19.187 3.588a2.75 2.75 0 0 0-3.889 0L5.575 13.31a4.5 4.5 0 0 0 6.364 6.364l8.662-8.662a.75.75 0 0 1 1.061 1.06L13 20.735a6 6 0 0 1-8.485-8.485l9.723-9.723a4.247 4.247 0 0 1 4.124-1.139 4.247 4.247 0 0 1 3.025 3.025 4.247 4.247 0 0 1-1.139 4.124l-9.193 9.193a2.64 2.64 0 0 1-1.858.779 2.626 2.626 0 0 1-1.854-.779c-.196-.196-.338-.47-.43-.726a2.822 2.822 0 0 1-.168-.946c0-.7.284-1.373.775-1.864l8.132-8.131a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734l-8.131 8.132a1.148 1.148 0 0 0-.336.803c.003.204.053.405.146.587.01.018.018.028.02.032.22.215.501.332.786.332.29 0 .58-.121.798-.34l9.192-9.192a2.75 2.75 0 0 0 0-3.89Z"></path></svg>
          </button> 
            <textarea maxLength={1000} ref={inputRef} disabled={isBotWriting} className="text-area"  id="autoresizingTextarea" placeholder="Escribe un mensaje..." onKeyDown={handleKeyDown}  rows={1} onChange={resizeTextarea}/>
            <button className="send-btn"  style={{padding:'4px', alignItems:'center', width:"22px", height:"22px", justifyContent:'center', background:inputValue === ''?'#A0AEC0':'black',position: 'absolute', right: '9px', top:'9px' }} disabled={isBotWriting || inputValue === ''} onClick={() => {}} >
                <svg viewBox="0 0 390 480" width="13" height="13" style={{fill: customInfo?.header_color}}>
                    <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/>
                </svg>
            </button>
        </div>
      </div>)
  }

  
  //MESSAGES TO SHOW
  const showMessages = [{ sender_type: -1, type:'plain', content:{text:customInfo?.welcome_message || ''}, timestamp: messages.length > 0 ? messages[0].timestamp : new Date(new Date().getTime() - 2 * 60 * 60 * 1000).toISOString()}].concat(messages.filter(message => message.type !== 'options'))
 
   //MAIN FRONT
  return (  
    <> 
      <input id='selectFile' type="file" style={{display:'none'}}  onChange={(e)=>{handleFileSelect(e)}} accept=".pdf, .doc, .docx, image/*" />
      <div ref={scrollRef} style={{height:'77vh', fontWeight:400,  fontSize:'1.1em', padding:'5% 4%', overflow:'scroll'}} >
          
          {showMessages.map((message, index)=>{

          const isNextMessageBot = showMessages[index + 1] ? showMessages[index + 1].sender_type !== 0 : false
          const isPreviousMessageBot = showMessages[index - 1] ? showMessages[index - 1].sender_type !== 0 : false
          const isLastMessage = index === showMessages.length - 1 
          
          const calcBorderRadius  = calculateBorderRadius(message.sender_type !== 0,isPreviousMessageBot, isNextMessageBot, isLastMessage)
          const diaMensajeActual = new Date(message.timestamp).getDate()
          const diaMensajeAnterior = index > 0 ? new Date(showMessages[index - 1].timestamp).getDate() : 10;
          const mostrarBarraNuevoDia = diaMensajeAnterior !== null && diaMensajeActual !== diaMensajeAnterior;

          return(<div>
            
            { mostrarBarraNuevoDia && <div style={{marginTop:index > 0?'15px':'0px',fontSize:'.8em', color:'#718096', textAlign: 'center' }}>{timeStampToDate(message.timestamp, t_formats)}</div>}
            <div style={{ marginTop: index === 0 ? '0px' : (( ((message.sender_type === 0) && (showMessages[index - 1].sender_type === 0)) ||((message.sender_type !== 0) && (showMessages[index - 1].sender_type !== 0)))  ? '3px':'15px')}}> 
            
            {(!isPreviousMessageBot && message.sender_type !== 0) && <span style={{fontSize:'.75em',color:'#718096', marginLeft:'35px'}}>{customInfo?.company_name}</span>}
            
            <div style={{gap:'10px', display:'flex', width:'100%', alignItems:'end', flexDirection:message.sender_type !== 0 ? 'row':'row-reverse'}}  key={`message-${index}`}  >
                {(message.sender_type !== 0 && !isNextMessageBot)&& 
                <div style={{marginBottom:'18px'}}><img alt='chatLogo' src={customInfo?.chat_avatar} width='20px'/></div>}
                <div style={{maxWidth:'82%',display:'flex',flexDirection:'column',alignItems:'end', animation:index > 1 ?message.sender_type !== 0? 'expandFromLeft 0.5s ease-out' : 'expandFromRight 0.5s ease-out':'none'}}> 
                  <div style={{ marginLeft:(message.sender_type !== 0 && !isNextMessageBot)?'0':'30px', wordBreak: 'break-word', fontSize:'.9em', overflowWrap: 'break-word', background:message.sender_type !== 0?'#EDF2F7':`linear-gradient(to right, ${customInfo?.client_background?customInfo.client_background[0]:'green'},${customInfo?.client_background?customInfo.client_background[1]:'green'})`, color:message.sender_type !== 0?'black':customInfo?.client_color,  padding:'8px', borderRadius:calcBorderRadius}}>
                      <ShowMessage type={message.type as MessagesTypes} content={message.content}/>
                  </div>
                  {(( (message.sender_type != 0 && !isNextMessageBot) || (message.sender_type === 0 && isNextMessageBot) )) && <span style={{color:'#718096', marginTop:'5px',fontSize:'.7em',fontWeight:300}}>{timeAgo(message.timestamp, t_formats)}</span>}
                </div>
            </div>

          </div>
          </div>)
          })}


        {(messages.length === 0 ) && 
          <div style={{display:'flex', marginTop:'15px', gap:'5px', flexWrap:'wrap', flexDirection:'row-reverse', paddingLeft:'10%'}}  > 
              {customInfo?.options&&
                <>
                  {customInfo?.options.map((option:string, index:number) => (
                  <div style={{cursor:'pointer', fontSize:'.9em', alignItems:'center', justifyContent:'center', background:`linear-gradient(to right, ${customInfo?.header_background?customInfo.header_background[0]:'green'},${customInfo?.header_background?customInfo.header_background[1]:'green'})`, padding:'8px', borderRadius:'2rem' }}  key={`option-${index}`}  onClick={() => {}}>
                      <span style={{color:customInfo?.client_color, whiteSpace:'nowrap'}}>{option}</span>
                  </div>
                ))}
              </>}
        </div>}


        {(messages.length > 0 && messages[messages.length - 1].type === 'options') && 
          <div style={{display:'flex', marginTop:'15px', gap:'5px', flexWrap:'wrap', flexDirection:'row-reverse', paddingLeft:'10%'}}  > 
              {customInfo?.options&&
                <>
                  {messages[messages.length - 1].content.map((option:string, index:number) => (
                  <div style={{cursor:'pointer', fontSize:'.9em', alignItems:'center', justifyContent:'center', background:`linear-gradient(to right, ${customInfo?.header_background?customInfo.header_background[0]:'green'},${customInfo?.header_background?customInfo.header_background[1]:'green'})`, padding:'8px', borderRadius:'2rem' }}  key={`option-${index}`}  onClick={() => {}}>
                      <span style={{ color:customInfo?.client_color, whiteSpace:'nowrap'}}>{option}</span>
                  </div>
                ))}
              </>}
        </div>}


        {isBotWriting &&<div> 
          <div style={{display:'flex',  marginTop:'15px', gap:'10px',  width:'100%', alignItems:'end' }}>
              <img alt='chatLogo' src={customInfo?.chat_avatar} width='20px'/>
              <div style={{maxWidth:'82%', background:'#eeeeee', animation: 'expandFromLeft 0.5s ease-out',color:'black', padding:'8px', borderRadius:'.7rem'}} >
                  <div className="writing-animation">
                      <span className="bounce-dot"></span>
                      <span className="bounce-dot"></span>
                      <span className="bounce-dot"></span>
                  </div>
                </div>
              </div>
          </div>}
      </div>
      <TextAreaContainer/>
      <div style={{height:'4vh', fontSize:'.85em',color:'#718096',gap:'5px', fontWeight:300, justifyContent:'center', display:'flex', alignItems:'center'}}  >
          <img alt='MATIL' src={'/Isotipo.svg'} height="15px" />
          <span className={'matil-text'} onClick={() => window.open('https://www.matil.ai', '_blank')}>MATIL</span>
      </div>
 
    </>)}

export default Chatbot  

// RATING COMPONEN
const Stars = ({surveyConfig, handleSendMessage, conversationId, currentScore, currentComment}:{surveyConfig:SurveyConfigProps, handleSendMessage:(surveyData:{csat_score: number, csat_comments: string}, conversationId:string) => void, conversationId:string, currentScore:number | null, currentComment:string | null}) => {
  
  //STAR RATING
  const [stars, setStars] = useState<number>(currentScore?currentScore:0)
  const sended = useRef(false)
  const starClass = (num:number) => {
    if (num === stars && num === 1) return 'highlighted-one'
    if (stars === 5) return 'highlighted-five'
    return num <= stars ? 'highlighted' : ''
  }

  //COMMENT TEXT
  const [commentMessage, setCommentMessage] = useState<string>(currentComment?currentComment:'')

  //SHOW COMMENTS
  const [showComments, setShowComments] = useState<boolean>(currentScore !== null)

  //SHOW THANK YPU MESSAGE
  const [showThankYou, setShowThankYou] = useState<boolean>(currentComment !== null)

  //SEND THE SURVEY
  useEffect(() => {if (showComments) sended.current = true}, [showComments])
  const onClickSend = (message:{csat_score:number, csat_comments:string})  => {
      handleSendMessage(message, conversationId)
      setStars(message.csat_score)
      if (!showComments) {
          if (surveyConfig.ask_for_comments) setShowComments(true)
          else setShowThankYou(true)
      }
      else setShowThankYou(true)
  }

  //GP BACK AND FORWARD BUTTONS
  const GoButtons = () => {

      return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px'}}>
          <button onClick={() => setShowComments(false)} disabled={showComments === false } style={{ background:(showComments === false)?'#CBD5E0':`linear-gradient(to right, ${surveyConfig.buttons_background_color[0]}, ${surveyConfig.buttons_background_color[1]})`, color:surveyConfig.buttons_text_color,
              display: 'flex', height:'18px', width:'18px', alignItems: 'center', justifyContent: 'center', padding: '5px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-left">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
          </button>
      
          <button onClick={() => setShowComments(true)} disabled={showComments === true || !(showComments === false && stars !== 0)} style={{ background:(showComments === true || !(showComments === false && stars !== 0))?'#CBD5E0':`linear-gradient(to right, ${surveyConfig.buttons_background_color[0]}, ${surveyConfig.buttons_background_color[1]})`, color:surveyConfig.buttons_text_color,
               display: 'flex',  height:'18px', width:'18px', alignItems: 'center', justifyContent: 'center', padding: '5px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-right">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
          </button>
      </div>
      )
  }
  
  return (
    <div style={{display:'flex', alignItems:'center', position:'relative', justifyContent:'center'}} > 
      <div className={`${showComments ? 'animate-stars' : stars !==  0? 'animate-stars-inverse':''}`} style={{  width:'100%', position: 'absolute' }}> 
          <span style={{fontWeight:400, fontSize:'1em', color:surveyConfig.text_color}}>{surveyConfig.score_message}</span>
          <div className='stars'>
              {[5, 4, 3, 2, 1].map(num => (
                  <div key={`start-${num}`}>
                      <input className={`star star-${num}`}id={`star-${num}`} type="radio" name="star" onChange={() => {onClickSend({csat_score:num, csat_comments:''})}}/>
                      <label className={`star star-${num} ${starClass(num)}`} htmlFor={`star-${num}`}>
                          <svg viewBox="0 0 576 512" width="25" height="25"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z "></path></svg>
                      </label>
                  </div>
              ))}
          </div>
          <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', marginTop:'5px'}}>
              <GoButtons/>
          </div>
      </div>


      <div className={`comment-box ${showThankYou?'animate-stars' :showComments ? 'animate-comments' : sended.current ?'animate-comments-inverse':''}`}  style={{width:'100%', position:'absolute'}}>
          <span style={{fontWeight:400, fontSize:'.9em', color:surveyConfig.text_color}}>{surveyConfig.comment_message}</span>
          <textarea className={'textarea-stars'} placeholder={surveyConfig.comment_placeholder}  value={commentMessage}   onChange={(e) => setCommentMessage((e.target as HTMLTextAreaElement).value)}/>
          <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', marginTop:'5px'}}>
              <GoButtons/>
              <button onClick={() => onClickSend({csat_score:stars, csat_comments:commentMessage})} style={{background:`linear-gradient(to right, ${surveyConfig.buttons_background_color[0]}, ${surveyConfig.buttons_background_color[1]})`, color:surveyConfig.buttons_text_color, padding:'5px',  fontSize:'.75em', borderRadius:'5px', border:'none'}}>Enviar</button>
          </div>
      </div>


      {showThankYou && (
          <div className={`comment-box ${showComments ? 'animate-comments' : ''}`} style={{textAlign:'center'}}>
              <span style={{fontWeight:400, fontSize:'1.2em', color:surveyConfig.text_color}}>{surveyConfig.thank_you_message}</span>
          </div>
      )}
   </div>
  )
}