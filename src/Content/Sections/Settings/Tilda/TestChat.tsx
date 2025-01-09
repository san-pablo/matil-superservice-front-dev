

//REACT
import { useState, useRef, Fragment, useEffect } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
import { useAuth0 } from '@auth0/auth0-react'
//FETCH DATA
import fetchData from '../../../API/fetchData'
//FRONT
import { Flex, Box, Text } from '@chakra-ui/react'
//FUNCTIONS
import formatFileSize from '../../../Functions/formatFileSize'
import '../../../Components/styles.css'
 
const TestChat = ({configurationId, configurationName}:{configurationId:string, configurationName:string}) => {

  //CONSTANTS
  const auth = useAuth()
  const { t } = useTranslation('flows')
  const { getAccessTokenSilently } = useAuth0()

  //MESSAGES
  const conversationRef = useRef<any>(null)
  const [waitingMessage, setWaitingMessage] = useState<boolean>(false)
  const [messages, setMessages] = useState<{type:string, content:any, sent_by:'business' | 'client'}[]>([])


  
  //EDIT TEXT
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (scrollRef.current) {
        const scrollableElement = scrollRef.current
        scrollableElement.scrollTo({ top: scrollableElement.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  //SEND A MESSAGE
  const sendMessage = async (content:string | File, type:string) => {

      //GET PRESINGED URL
      const getPreSignedUrl = async (file: File) => {
        const url = `https://api.matil.ai/v1/${auth.authData.organizationId}/chatbot/s3_pre_signed_url`

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({file_name: file.name})
            })
            const responseData = await response.json()
            if (response.ok) {
              const responseUpload = await fetch(responseData.upload_url, {method: "PUT", headers: {}, body: file})
              if (responseUpload.ok) return {url: responseData.access_url, file_name: file.name, file_size:file.size}
            }
          else  new Error('Failed to upload file.')
          }
      catch (error) {return null}}
    
      
    let file_content:any
    if (type === 'plain') {
      file_content = {text:content}
      setMessages(prev => [...prev, { sent_by: 'client', type, content:file_content }])
    }

    else if (typeof(content) !== 'string') {
        file_content = await getPreSignedUrl(content)
        setMessages(prev => [...prev, { sent_by: 'client', type, content:file_content }])
      }

    setWaitingMessage(true)
    console.log({conversation:conversationRef.current, message:{type, content:file_content}} )
    const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations/${configurationId}/try`, method:'post', auth,  getAccessTokenSilently,setWaiting:setWaitingMessage, requestForm:{conversation:conversationRef.current, message:{type, content:file_content}} })
    if (response?.status === 200) {
      conversationRef.current = response.data.conversation
      setMessages(prev => [...prev, ...response.data.messages.map((msg:any) => {return {...msg, sent_by:'business'}})])
    } 
   } 
   

  //SELECT A FILE
  const handleFileSelect = async (e: any) => {
    const files = e.target.files
    const maxFileSize = 2 * 1024 * 1024

     if (files) {
      const selectedFilesArray = Array.from(files)
      const file = selectedFilesArray[0] as File

      if (file.size > maxFileSize) return

      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      let messageType = 'file'

      if (fileExtension === 'pdf') messageType = 'pdf'
      else if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'gif') messageType = 'image'

      sendMessage(file, messageType)
    }
  }

   //TEXT AREA CONTAINER
   const TextAreaContainer = () => {
    const [inputValue, setInputValue] = useState<string>('')
    function resizeTextarea( e:any ) {
      setInputValue(e.target.value)
      e.target.style.height = 'auto'
      e.target.style.height = e.target.scrollHeight + 'px'
    }

     //Enviar el texto a través del input y resizear la text area
    const handleKeyDown = (event: any) => {
      if (event.key === 'Enter' && !waitingMessage) {
        event.preventDefault()
        if (inputValue.trim() !== '') {
          sendMessage(inputValue, 'plain')
        }
      }}

    return (      <>   
    <input id='selectFile' type="file" style={{display:'none'}}  onChange={(e)=>{handleFileSelect(e)}} accept=".pdf, .doc, .docx, image/*" />

    <div style={{height:'100px', padding:'10px 20px 10px 20px', gap:'10px', display:'flex', alignItems:'center'}}  >

        <div style={{display:'flex', position:'relative',flexGrow:'1', alignItems:'center', minHeight:'40px'}} > 
          <button   id="fileButton"  className="clip-btn"  onClick={() => {if (!waitingMessage) {const input = document.getElementById('selectFile'); if (input) input.click()}}}>
            <svg viewBox="0 0 24 24"   width="16" height="16" style={{fill: 'black'}}><path d="M19.187 3.588a2.75 2.75 0 0 0-3.889 0L5.575 13.31a4.5 4.5 0 0 0 6.364 6.364l8.662-8.662a.75.75 0 0 1 1.061 1.06L13 20.735a6 6 0 0 1-8.485-8.485l9.723-9.723a4.247 4.247 0 0 1 4.124-1.139 4.247 4.247 0 0 1 3.025 3.025 4.247 4.247 0 0 1-1.139 4.124l-9.193 9.193a2.64 2.64 0 0 1-1.858.779 2.626 2.626 0 0 1-1.854-.779c-.196-.196-.338-.47-.43-.726a2.822 2.822 0 0 1-.168-.946c0-.7.284-1.373.775-1.864l8.132-8.131a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734l-8.131 8.132a1.148 1.148 0 0 0-.336.803c.003.204.053.405.146.587.01.018.018.028.02.032.22.215.501.332.786.332.29 0 .58-.121.798-.34l9.192-9.192a2.75 2.75 0 0 0 0-3.89Z"></path></svg>
          </button> 
            <textarea maxLength={1000} ref={inputRef} disabled={waitingMessage} className="text-area"  id="autoresizingTextarea" placeholder="Escribe un mensaje..." onKeyDown={handleKeyDown}  rows={1} onChange={resizeTextarea}/>
            <button className="send-btn"  style={{padding:'4px', alignItems:'center', width:"22px", height:"22px", justifyContent:'center', background:inputValue === ''?'#A0AEC0':'black',position: 'absolute', right: '6px', top:'11px' }} disabled={waitingMessage || inputValue === ''} onClick={() => {sendMessage(inputValue, 'plain')}} >
                <svg viewBox="0 0 390 480" width="15" height="13" style={{fill: 'white'}}>
                    <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/>
                </svg>
            </button>
        </div>
      
      
      </div>
      </> )
  }

  
  const ShowMessage = ({type, content}:{type:string, content:any}) => {
 
    // Regular expressions for emails and URLs
    if (type === 'plain' ) {
        
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
      const urlRegex = /\[(.*?)\]\((https?:\/\/[^\s/$.?#].[^\s]*)\)/
      const boldRegex = /\*\*(.*?)\*\*/
      
      // Creamos una nueva expresión regular combinada
      const combinedRegex = new RegExp(`(${emailRegex.source}|${urlRegex.source}|${boldRegex.source})`, 'gi');
      
      // Dividimos el contenido del texto utilizando la expresión regular combinada
      const cleanedText = content.text.replace(/{>>\s*(.*?)\s*<<}/, '$1')
      let parts = cleanedText.split(combinedRegex)
  
      // Filtramos los elementos undefined de la lista resultante
      parts = parts.filter((part:any) => part !== undefined && part !== '')
      
      parts = parts.reduce((acc:any, part:string, index:number, array:any) => {
        if (boldRegex.test(part) && index < array.length - 1 && part.replace(/\*\*/g, '') === array[index + 1]) {
          acc.push(part)
          array.splice(index + 1, 1)
        } 
        else acc.push(part)
        return acc
      }, [])

      let skipCount = 0
        return (<> 
            <span style={{ wordBreak: 'break-word'}}>
                {parts.map((part:string, index:number) => {

                    if (skipCount > 0) {
                      skipCount--
                      return null
                    }

                    if (emailRegex.test(part)) {
                        return (
                            <a key={index} href={`mailto:${part}`} style={{ color: '#1a73e8', wordBreak: 'break-all', whiteSpace: 'pre-line' }}>{part}</a>)
                    } else if (urlRegex.test(part)) {
                        const match = part.match(/\[(.*?)\]\((https?:\/\/[^\s/$.?#].[^\s]*)\)/);
                        if (match) {
                          const displayText = match[1]
                          const url = match[2]
                          skipCount = 2
                          return (
                            <a key={index} href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#1a73e8', wordBreak: 'break-all', whiteSpace: 'pre-line' }}>
                              {displayText}
                            </a>
                          )
                        }
                    }
                     else if (boldRegex.test(part)) {
                      const boldText = part.replace(/\*\*/g, '')
                      return <span style={{fontWeight:500}} key={index}>{boldText}</span>
                    } else return <span key={index}>
                      {part.split('\n').map((line, i) => (
                          <Fragment key={i}>
                              {i > 0 && <br />}
                              {line.startsWith('#')?<><span style={{fontWeight:'500'}}>{line.replace(/^#+\s*/, '')}</span> <br /></>:line}
                          </Fragment>
                      ))}
                  </span>
              })}
            </span>
            {(content?.sources && content?.sources.length > 0) && 
            <div style={{marginTop:'10px'}}>
            <span style={{fontWeight:'500'}} >{t('Sources')}</span>
              {content.sources.map((source:{title:string, uuid:string, help_center_id:string}, index:number) => (
                  <Flex key={`source-${index}`} cursor={'pointer'} alignItems={'center'} justifyContent={'space-between'} p='5px' borderRadius={'.5rem'} _hover={{bg:'brand.gray_1'}} onClick={() => window.open(`https://www.help.matil.ai/${source.help_center_id}/article/${source.uuid}`, '_blank')} >
                      <span>{source.title}</span>
                      <svg viewBox="0 0 512 512"width="12"  height="12" style={{transform:'rotate(-90deg)'}}  fill="currentColor" ><path d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path></svg>
                  </Flex>
              ))}
            </div>}
        </>)
  }
    //DOC LINK (PDF, FILE, VIDEO)
    else if (type === 'pdf' || type === 'file' || type === 'video') {
        
      let path = 'M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V304H176c-35.3 0-64 28.7-64 64V512H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM176 352h32c30.9 0 56 25.1 56 56s-25.1 56-56 56H192v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V448 368c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24H192v48h16zm96-80h32c26.5 0 48 21.5 48 48v64c0 26.5-21.5 48-48 48H304c-8.8 0-16-7.2-16-16V368c0-8.8 7.2-16 16-16zm32 128c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H320v96h16zm80-112c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v32h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v48c0 8.8-7.2 16-16 16s-16-7.2-16-16V432 368z'
      if (type === 'file') path = 'M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z'
      if (type === 'video') path = 'M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM64 288c0-17.7 14.3-32 32-32h96c17.7 0 32 14.3 32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V288zM300.9 397.9L256 368V304l44.9-29.9c2-1.3 4.4-2.1 6.8-2.1c6.8 0 12.3 5.5 12.3 12.3V387.7c0 6.8-5.5 12.3-12.3 12.3c-2.4 0-4.8-.7-6.8-2.1z'

    return (
        <div onClick={() => downloadFile(content.url)}  style={{flexDirection:'row', display:'flex', gap:'10px', padding:'10px', borderColor:'white', borderWidth:'1px', borderRadius:'.5rem', color:'white',  cursor:'pointer'}}>
          <svg viewBox="0 0 512 512" width="20" height="20" style={{fill: 'white'}}>
              <path d={path}/>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop:'-4px' }}> 
            <span style={{ fontSize:'.95em'}}  >{content.file_name}</span>
            <span style={{ fontWeight:300, fontSize:'.85em'}} >{formatFileSize(content.file_size)}</span>
          </div>
        </div>
       )
    }
     else return null
  }

  

  return(<>  

   <Flex height='100%' borderRadius={'2rem'}  width='100%'  flexDir='column' >  
        <div style={{height:'10%', background:`linear-gradient(to right, #3399ff,#0066cc)`, display:'flex', alignItems:'center', padding:'0 4%', justifyContent:'space-between', zIndex:10}} > 
              <Text fontWeight={'medium'} color={'white'} fontSize={'1.2em'}>{configurationName}</Text>
          </div>    
        <Box ref={scrollRef} width={'100%'}overflow={'scroll'} flex='1'>
            <Box p='20px' > 
            {messages.map((message, index)=>{
    
              const isNextMessageBot = messages[index + 1] ? messages[index + 1].sent_by === 'business' : false 
              const isLastMessageBot = messages[index - 1] ? messages[index - 1].sent_by === 'business' : false 
              const isLastMessage = index === messages.length - 1 

              return(
              <div key={`message-${index}`}>
                <div style={{ marginTop: index === 0 ? '0px' : (message.sent_by === messages[index - 1].sent_by? '3px':'15px')}}> 
                  <div style={{gap:'10px', fontSize:'.9em', display:'flex', width:'100%', alignItems:'end', flexDirection:message.sent_by === 'business' ? 'row':'row-reverse'}}  key={`message-${index}`}  >
                      {(message.sent_by === 'business' && !isNextMessageBot)&& <div style={{marginBottom:'0'}}><img alt='chatLogo' src={'/images/matil.svg'} width='20px'/></div>}
                          <div style={{maxWidth:'82%',display:'flex',flexDirection:'column',alignItems:'end', animation:index > 1 ?message.sent_by === 'business'? 'expandFromLeft 0.5s ease-out' : 'expandFromRight 0.5s ease-out':'none'}}> 
                              <div style={{ marginLeft:(message.sent_by === 'business' && !isNextMessageBot)?'0':'30px', background:message.sent_by === 'business'?'#EDF2F7':'linear-gradient(to right, rgba(0, 102, 204, 1),rgba(51, 153, 255, 1))', color:message.sent_by === 'business'?'black':'white',  padding:'8px', borderRadius: message.sent_by === 'business'? (isNextMessageBot && isLastMessageBot)? '.2rem .7rem .7rem .2rem' : isNextMessageBot?'.7rem .7rem .7rem .2rem': isLastMessageBot ? '.2rem .7rem .7rem .7rem':'.7rem' : (!isNextMessageBot && !isLastMessageBot && !isLastMessage)? '.7rem .2rem .2rem .7rem' : (isNextMessageBot || isLastMessage)?'.7rem .2rem .7rem .7rem':'.7rem .7rem .2rem .7rem'}}>
                              <ShowMessage type={message.type} content={message.content}/>
                              </div>
                          </div>
                      </div>
                </div>
              </div>)
              })}
            {waitingMessage &&<div> 
              <div style={{display:'flex',  marginTop:'15px', gap:'10px',  width:'100%', alignItems:'end' }}>
                  <img alt='chatLogo' src={'/images/matil.svg'} width='20px'/>
                  <div style={{maxWidth:'82%', background:'#eeeeee', animation: 'expandFromLeft 0.5s ease-out',color:'black', padding:'8px', borderRadius:'.7rem'}} >
                      <div className="writing-animation">
                          <span className="bounce-dot"></span>
                          <span className="bounce-dot"></span>
                          <span className="bounce-dot"></span>
                      </div>
                    </div>
                  </div>
              </div>}
              </Box>
        </Box>

        <TextAreaContainer/>
     
      </Flex>

   </>)
}

export default TestChat

function downloadFile(url:string) {
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.download = ''
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}