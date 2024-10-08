//REACT
import { useEffect, useState, useRef, MutableRefObject, Dispatch, SetStateAction } from 'react'
import { useAuth } from '../../../AuthContext'
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from '../../API/fetchData'
//FRONT
import { Flex, Box, Icon, Text, Tooltip, IconButton, Button } from '@chakra-ui/react'
//ICONS
import { IoIosArrowBack } from 'react-icons/io'
//TYPING
import { logosMap, Channels } from '../../Constants/typing'
 
interface TestFlowData {
  flowId:string
  channelIds:string[]
  flowName:string
  channelsList:{id:string, display_id:string, name:string, channel_type:string, is_active:boolean}[]
  currentChannelId:MutableRefObject<string | null>
  currentMessages:MutableRefObject<{type:string, content:any, sent_by:'business' | 'client'}[]>
  currentFlowIndex:MutableRefObject<number>
  setShowTest:Dispatch<SetStateAction<boolean>>
}


const TestChat = ({flowId, channelIds, flowName, channelsList, currentChannelId, currentMessages, currentFlowIndex, setShowTest }:TestFlowData) => {

  //CONSTANTS
  const auth = useAuth()
  const { t } = useTranslation('flows')
  //MESSAGES
  const [waitingMessage, setWaitingMessage] = useState<boolean>(false)
  const [messages, setMessages] = useState<{type:string, content:any, sent_by:'business' | 'client'}[]>(currentMessages.current ? currentMessages.current:[])
  useEffect(() => {currentMessages.current = messages},[messages])

  const [flowState, setFlowState] = useState<any>({})
  const [motherStructureUpdates, setMotherStructureUpdates] = useState<any>({})

  //SELECTED CHANNEL
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(currentChannelId.current ? currentChannelId.current:channelIds.length === 1 ?channelIds[0] :null)
  useEffect(() => {currentChannelId.current = selectedChannelId},[selectedChannelId])

  //EDIT TEXT
  const inputRef = useRef<HTMLTextAreaElement>(null)

  //SEND A MESSAGE
  const sendMessage = async (text:string, type:string) => {

    setMessages(prev => [...prev, {type:'plain', content:{text}, sent_by:'client' }])
    setWaitingMessage(true)
    const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/flows/${flowId}/test`, method:'post', auth, setWaiting:setWaitingMessage, requestForm:{channel_id:selectedChannelId, flow_state:flowState, conversation_messages:[{type, content:{text}, sent_by:'client' }] }})
    if (response?.status === 200) {
      console.log(response.data)
      currentFlowIndex.current = response.data.flow_state_data.node_index + 1 
      setMessages(prev => [...prev, ...response.data.messages])
      setFlowState(response.data.flow_state_data)
      setMotherStructureUpdates(response.data.motherstructure_updates)
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

    return (          
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
      
      
      </div>)
  }

  return(<>  

   <Flex height='90vh'  width='100%'  flexDir='column' >  
        {selectedChannelId ?<> 
        <Flex borderBottomWidth={'1px'} width={'100%'}  height={'80px'}  justifyContent={'space-between'} alignItems={'center'} borderBottomColor={'gray.300'} bg='brand.gray_2' p='10px 20px 10px 10px'> 
          <Flex fontSize={'.9em'} alignItems={'center'}  gap='10px'>
            <Tooltip label={t('GoBack')}  placement='bottom' hasArrow bg='white'  color='black'  borderRadius='.4rem' fontSize='.75em' p='4px'> 
                <IconButton aria-label='go-back' size='sm' bg='transparent' _hover={{bg:'brand.gray_1'}} border='none' onClick={() => setShowTest(false)} icon={<IoIosArrowBack size='20px'/>}/>
            </Tooltip>
            <Box> 
              <Text><span style={{fontWeight:500}}>{flowName}</span> {currentFlowIndex.current === -1 ?'':<span style={{fontSize:'.9em'}}> ({t('Node')} {currentFlowIndex.current})</span>}</Text>
              <Text mt='.5vh'><span style={{fontWeight:500}}> {t('Channel')}:</span> {selectedChannelId}</Text>
            </Box>
          </Flex>
          <Button  colorScheme='red' size='sm' onClick={() => {setMessages([]); setSelectedChannelId(null)} }>{t('ResetChat')}</Button>
        </Flex>
    
        <Box width={'100%'} p='20px' overflow={'scroll'} flex='1'>
            {messages.map((message, index)=>{
    
              const isNextMessageBot = messages[index + 1] ? messages[index + 1].sent_by === 'business' : false 
              const isLastMessageBot = messages[index - 1] ? messages[index - 1].sent_by === 'business' : false 
              const isLastMessage = index === messages.length - 1 
        
    
              return(<div key={`message-${index}`}>
                <div style={{ marginTop: index === 0 ? '0px' : (message.sent_by === messages[index - 1].sent_by? '3px':'15px')}}> 
                
                <div style={{gap:'10px', fontSize:'.9em', display:'flex', width:'100%', alignItems:'end', flexDirection:message.sent_by === 'business' ? 'row':'row-reverse'}}  key={`message-${index}`}  >
                    {(message.sent_by === 'business' && !isNextMessageBot)&& 
                    <div style={{marginBottom:index > 1?'18px':'0'}}><img alt='chatLogo' src={'/images/matil.svg'} width='20px'/></div>}
                          <div style={{maxWidth:'82%',display:'flex',flexDirection:'column',alignItems:'end', animation:index > 1 ?message.sent_by === 'business'? 'expandFromLeft 0.5s ease-out' : 'expandFromRight 0.5s ease-out':'none'}}> 
                              <div style={{ marginLeft:(message.sent_by === 'business' && !isNextMessageBot)?'0':'30px', background:message.sent_by === 'business'?'#EDF2F7':'linear-gradient(to right, rgba(0, 102, 204, 1),rgba(51, 153, 255, 1))', color:message.sent_by === 'business'?'black':'white',  padding:'8px', borderRadius: message.sent_by === 'business'? (isNextMessageBot && isLastMessageBot)? '.2rem .7rem .7rem .2rem' : isNextMessageBot?'.7rem .7rem .7rem .2rem': isLastMessageBot ? '.2rem .7rem .7rem .7rem':'.7rem' : (!isNextMessageBot && !isLastMessageBot && !isLastMessage)? '.7rem .2rem .2rem .7rem' : (isNextMessageBot || isLastMessage)?'.7rem .2rem .7rem .7rem':'.7rem .7rem .2rem .7rem'}}>
                                  {message.content.text}
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

        <TextAreaContainer/>
     
        </>:<Box p='20px'>
            <Text fontWeight={'medium'}>{t('SelectChannel')}</Text>
            <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='2vh'/>

            {channelsList.map((channel, index) => (<> 
              {channelIds.includes(channel.id) && 
                <Flex mt='.5vh' cursor={'pointer'} key={`channels-id-${index}`} p='7px' borderRadius={'.5em'} _hover={{bg:'brand.hover_gray'}} onClick={() => setSelectedChannelId(channel.id)}>
                  <Box mt='-2px'> 
                    <Flex gap='10px' alignItems={'center'}> 
                      <Text fontWeight={'medium'} key={`variable-${index}`} fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{channel.name}</Text>
                      <Icon boxSize={'14px'} as={logosMap[channel.channel_type as Channels][0]}/>
                    </Flex>
                    <Text color='gray.600' key={`variable-${index}`} fontSize={'.8em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{channel.id}</Text>
                  </Box>
                </Flex>
              } 
            </>))}
        </Box>}
      </Flex>

   </>)
}

export default TestChat
