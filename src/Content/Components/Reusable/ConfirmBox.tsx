//REACT
import { ReactNode, memo, useRef,  } from 'react'
//FRONT
import { motion, isValidMotionProp } from 'framer-motion'
import { Portal, chakra, shouldForwardProp } from '@chakra-ui/react'
//FUNCTIONS
 
//TYPING
interface ConfirmBoxProps {
    children: ReactNode
    setShowBox:(key:boolean) => void
    maxW?:null | string
    max?:boolean
    upPosition?:boolean
    isCustomPortal?:boolean
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//MAIN FUNCTION
const ConfirmBox = memo(({ children, setShowBox,  maxW, max = false, upPosition = false, isCustomPortal = true }:ConfirmBoxProps) => {
   
    const boxRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = (event: React.MouseEvent) => {
        if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
            setShowBox(false)
        }
    }

   
    return(
    <Portal> 
        <MotionBox id={isCustomPortal ? 'custom-portal':''}  initial={{opacity:0}} onClick={handleClickOutside}  animate={{opacity:1}} display={'flex'} exit={{opacity:0}} transition={{ duration: '.2' }} position='fixed' alignItems='center'justifyContent='center' top={0} left={0} width='100vw' height='100vh' bg='rgba(0, 0, 0, 0.3)' backdropFilter={'blur(1px)'} zIndex= {upPosition?10001:10000}>
            <MotionBox  initial={{opacity:0, y:15}} ref={boxRef}  animate={{opacity:1, y:0}} transition={{ duration: '.2'}}  maxW={maxW ?maxW :'600px'} width={max?'600px':'auto'} height={max?'90vh':'auto'} maxH={'90vh'}  bg='white' overflow={'hidden'} borderRadius={'.7rem'} shadow={'xl'} position={'absolute'}  borderColor='border_color' borderWidth='1px' zIndex={upPosition?112:111}  >
                {children}
            </MotionBox>
        </MotionBox>
    </Portal>
    )
})

export default ConfirmBox