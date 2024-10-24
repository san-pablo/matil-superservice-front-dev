/* 
    BOX AND BACKGROUND ANIMATION FOR IMPORTANT ACTIONS
*/

//REACT
import { ReactNode, memo,  } from 'react'
//FRONT
import { motion, isValidMotionProp } from 'framer-motion'
import { Portal, chakra, shouldForwardProp } from '@chakra-ui/react'
  
//TYPING
interface ConfirmBoxProps {
    children: ReactNode
    setShowBox:(key:boolean) => void
    maxW?:null | string
    max?:boolean
    upPosition?:boolean
}

//MAIN FUNCTION
const ConfirmBox = memo(({ children, setShowBox,  maxW, max = false, upPosition = false }:ConfirmBoxProps) => {

    const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})
      
    return(
    <Portal> 
        <MotionBox initial={{opacity:0}}  animate={{opacity:1}} display={'flex'} exit={{opacity:0}} transition={{ duration: '.2' }} onMouseDown={() => setShowBox(false)} backdropFilter= 'blur(1px)' position='fixed' alignItems='center'justifyContent='center' top={0} left={0} width='100vw' height='100vh' bg='rgba(0, 0, 0, 0.3)' zIndex= {upPosition?10001:10000}>
            <MotionBox initial={{opacity:0, y:15}}  animate={{opacity:1, y:0}} transition={{ duration: '.2'}} minW='450px' maxW={maxW ?maxW :'600px'} width={max?'600px':'auto'} height={max?'90vh':'auto'} maxH={'90vh'} onMouseDown={(e) => e.stopPropagation()} bg='white' overflow={'hidden'} borderRadius={'.7rem'} shadow={'xl'} position={'absolute'}  borderColor='gray.200' borderWidth='1px' zIndex={upPosition?112:111}  >
                {children}
            </MotionBox>
        </MotionBox>
    </Portal>
    )
})

export default ConfirmBox