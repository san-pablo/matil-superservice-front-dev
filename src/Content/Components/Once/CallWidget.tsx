import { useState, useEffect, useRef, Dispatch, SetStateAction, useCallback, memo } from "react"

import { Box, Text, Flex, Button, IconButton } from "@chakra-ui/react"
import { motion } from 'framer-motion'
import '../styles.css'

import { ImPhoneHangUp, ImPhone } from "react-icons/im"
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa6";
import { MdPhonePaused, MdPhoneForwarded, MdPhone } from "react-icons/md"


const Countdown = ({ time, onEnd, isPaused }: { time: number, onEnd?:() => void, isPaused?:boolean }) => {
    const [timeLeft, setTimeLeft] = useState<number>(time >= 0 ? time : 0)
    const isCountingDown = time >= 0

    
    useEffect(() => {
        if (isCountingDown && onEnd && timeLeft <= 0) {
            onEnd()
            return
        }
        if (isPaused) return

        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => isCountingDown ? prevTime - 1 : prevTime + 1)
        }, 1000)
        
        return () => clearInterval(intervalId)
    }, [timeLeft, isPaused])

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60)
        const seconds = time % 60
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      }

    return <span style={{fontWeight:500, color:'#4299E1' }}>{isCountingDown ? `${timeLeft} s` : formatTime(timeLeft)}</span>
}

const CallBox = memo(({inCall, setInCall, setEntryCall, handleMouseDown}:{inCall:boolean, setInCall:Dispatch<SetStateAction<boolean>>, setEntryCall:Dispatch<SetStateAction<boolean>>, handleMouseDown:any}) => {

    const [clientName, setClientName] = useState<string>('') 
    const [clientPhone, setClientPhone] = useState<string>('+34 656 30 63 61') 

    const [isMuted, setIsMuted] = useState<boolean>(false)
    const [isPaused, setIsPaused] = useState<boolean>(false)

 
    return (
        <Box  position={'relative'}  textAlign={'center'} overflow={'hidden'} minW='300px' boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white'  borderRadius={'.7rem'} borderWidth={'1px'} borderColor={'gray.300'}>            
            <Box userSelect={'none'} cursor={'move'}  paddingTop='20px' onMouseDown={handleMouseDown} >

                {inCall ? 
                <Flex alignItems={'center'} justifyContent={'center'} gap='10px'> 
                    <Flex alignItems={'center'} justifyContent={'center'} borderRadius={'full'} borderColor={isPaused?'orange':'red'} borderWidth={'1px'} height={'13px'} width={'13px'}>
                        <Box borderRadius={'full'} bg={isPaused?'orange':'red'} height={'7px'} width={'7px'} />
                    </Flex>
                    <Text fontSize={'.9em'} >Llamada {isPaused?'pausada':'en curso:'} <Countdown time={-1} isPaused={isPaused}/></Text>
                </Flex>
                :
                <Text fontSize={'.9em'} >Responder en: <Countdown time={30} onEnd={() => setEntryCall(false)}/></Text>
                }
                <Text mt='1vh' fontSize={'1.2em'} fontWeight={'medium'}>{clientName?clientName:'Nuevo cliente'}</Text>
                <Text color='gray.600' fontSize={'.75em'} fontWeight={'medium'} >{clientPhone}</Text>
            </Box>


            <Box   p='2vh 20px 20px 20px' > 
                {inCall ? 
                <Flex gap='10px'  justifyContent={'space-between'}>
                    <IconButton flex='1' size='sm' aria-label="mute" onClick={(e) => {e.stopPropagation(); setIsMuted(!isMuted)}} color={isMuted?'white':'black'} bg={isMuted?'brand.gradient_blue':'gray.100'} _hover={{bg:isMuted?'brand.gradient_blue_hover':'gray.200'}} icon={isMuted?<FaMicrophoneSlash/>:<FaMicrophone/>}/>
                    <IconButton flex='1' size='sm' aria-label="pause" color={isPaused?'white':'black'} bg={isPaused?'brand.gradient_blue':'gray.100'} _hover={{bg:isPaused?'brand.gradient_blue_hover':'gray.200'}} onClick={() => setIsPaused(!isPaused)} icon={<MdPhonePaused/>}/>
                    <IconButton flex='1' size='sm' aria-label="redirect" onClick={() => {}} icon={<MdPhoneForwarded/>}/>
                    <IconButton flex='1' size='sm' bg='red.600'  _hover={{bg:'red.700'}} color='white'aria-label="hang-up" onClick={(e) => {e.stopPropagation();setEntryCall(false)}} icon={<MdPhone/>}/>
                </Flex>
                :
                <Flex gap='10px'>
                    <Button flex='1' size='sm' bg='red.600' leftIcon={<ImPhoneHangUp/>} _hover={{bg:'red.700'}} color='white' onClick={(e) => {e.stopPropagation();setEntryCall(false)}}>Rechazar</Button>
                    <Button flex='1' size='sm' color='white' leftIcon={<ImPhone/>}  bg='brand.gradient_blue' onClick={(e) => {setInCall(true)}} _hover={{bg:'brand.gradient_blue_hover'}}>Aceptar</Button>
                </Flex>}
            </Box>
        </Box>
    )
})

const CallWidget = () => {
    
    const isInitialRender = useRef<boolean>(true)
    const [entryCall, setEntryCall] = useState<boolean>(false)
    const [inCall, setInCall] = useState<boolean>(false)

    const [dragging, setDragging] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth*0.98 - 300, y: window.innerWidth * 0.02  })
    const boxRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        isInitialRender.current = false
        const handleMouseMove = (event:any) => {
            if (dragging) {
                const boxWidth = boxRef.current ? boxRef.current.offsetWidth : 0;
                const boxHeight = boxRef.current ? boxRef.current.offsetHeight : 0;
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;

                let newX = event.clientX - boxWidth / 2;
                let newY = event.clientY - boxHeight / 2;

                // Ensure the new position is within the screen bounds
                if (newX < 0) newX = 0;
                if (newY < 0) newY = 0;
                if (newX + boxWidth > screenWidth) newX = screenWidth - boxWidth;
                if (newY + boxHeight > screenHeight) newY = screenHeight - boxHeight;

                setPosition({ x: newX, y: newY });
            }
        }
    
        const handleMouseUp = () => {setDragging(false)}
    
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [dragging])
    const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setDragging(true)
      }, [])
   
    return(<>

            {entryCall && 
            <motion.div initial={{marginTop:isInitialRender.current?'-5vh':0, opacity:isInitialRender.current?0:1}} animate={{marginTop:0, opacity:1}} exit={{marginTop:isInitialRender.current?'-5vh':0, opacity:isInitialRender.current?0:1}} 
             style={{ userSelect:'none',top:`${position.y}px`, left:`${position.x}px`, width:'300px',zIndex:100000, position:'fixed'   }}  ref={boxRef} className={inCall?'':"bouncing-box"}> 
                
                {!inCall && <> 
                <div className="wave-box box1"></div>
                <div className="wave-box box2"></div>
                </>}
                
                <CallBox inCall={inCall} setInCall={setInCall} setEntryCall={setEntryCall} handleMouseDown={handleMouseDown} />
             </motion.div>}
            

   </> )
}

export default CallWidget