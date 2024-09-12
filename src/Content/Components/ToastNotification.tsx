/* 
    RENDER A TOAST NOTIFICATION
*/

//REACT
import { useState } from 'react'
//DESKTOP NOTIFICATIONS
import showNotification from './Once/DesktopNotification'
//FRONT
import { toast, ToastPosition } from 'react-toastify'
import { Text, Flex } from '@chakra-ui/react'
import 'react-toastify/dist/ReactToastify.css'
//ICONS
import { FaCheckCircle , FaTimesCircle} from 'react-icons/fa'
import { IoChatboxOutline } from 'react-icons/io5'
import { PiTicketLight } from "react-icons/pi";
import { IconType } from 'react-icons'

//TYPING
interface ShowToastOptions {
    message: string
    type?: 'failed' | 'works' | 'ticket' | 'message'
    duration?: number
    position?: ToastPosition
    linkPath?: boolean
    id?:number
    navigate?:any
    isDesktop?:boolean
  }

 
//PARSE A MESSAGE TO SHOW BOLD TEXT
const parseMessageToBold = (message:string, showLink:boolean) => {
  const parts = message.split(/(\/{[^/]+}\/)/g)
  return parts.map((part, index) => {
    if (part.startsWith('/{') && part.endsWith('}/')) return <b key={index} style={{color:showLink?'blue':'black', textDecoration:showLink?'underline':''}} >{part.slice(2, -2)}</b>;
    return part
  })
}

//MAIN FUNCTION
const showToast = ({message, duration = 3000, position = 'top-right', type = 'works', linkPath=false, id, navigate, isDesktop = false}: ShowToastOptions) => {
  
  //ICONS MAP
  const iconsMap:{[key in 'failed' | 'works' | 'ticket' | 'message']:[IconType, string]} = {'works':[FaCheckCircle, '#48BB78'], 'failed':[FaTimesCircle, '#E53E3E'], 'ticket':[PiTicketLight,'#2D3748'], 'message':[IoChatboxOutline,'#A0AEC0']}


  //STYLING THE TOAST
  const toastStyles = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    color: 'white',
    padding: '10px',
    borderRadius: '.7rem',
    borderWidth:'1px 1px 1px 7px',
    borderColor:`#CBD5E0 #CBD5E0 #CBD5E0 ${iconsMap[type][1]}`,
    cursor:'pointer'
  }


 
  //SHOW DESKTOP NOPTIFICATION
  if (isDesktop) showNotification(message, {icon: iconsMap[type][0]})
 
  //TOAST CONTENT
  const ToastContent = ({ message }:{ message:string }) => {

      const [showLink, setShowLink] = useState(false)
      return(
        <Flex gap='20px' alignItems="center" cursor={linkPath ? 'pointer':'normal'}  onMouseOver={() => setShowLink(true)}  onMouseLeave={() => setShowLink(false)} onClick={() => {if (linkPath) {navigate(`/tickets/ticket/${id}`)}}}>
          <Text fontWeight={'medium'} fontSize={'.9em'} color='black'>{parseMessageToBold(message, linkPath && showLink)}</Text>
        </Flex>
    )}

  toast(<ToastContent message={message} />, {
      position: position,
      autoClose: duration,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      style: toastStyles, 
    })
}

export default showToast
