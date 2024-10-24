/* 
    AI WRTTING GLOW EFFECT
*/

//FORNT
import '../styles.css'
import { Box } from '@chakra-ui/react'

//MAIN FUNCTION
const GradientBox = ({ children, scrollRef }:{ children:any, scrollRef:any }) => {
 
      
   return (
   <Box  width={'100%'} height={'100%'}> 
        <Box position={'absolute'}top={'-80%'}  zIndex={10} left={'-80%'}   height={'261%'} width={'261%'} className='gradient-box'/>
        <Box top='35px' left={'35px'} bg='white' opacity={0.98}  zIndex={11}  ref={scrollRef}  boxShadow='0 0 20px 30px rgba(255, 255, 255)' animation={'translate-animation-2 10s linear infinite'}   overflow={'scroll'}  position={'absolute'}  height={'calc(100% - 70px)'} width={'calc(100% - 70px)'}/>
        <Box top='35px' left={'35px'} zIndex={11}  ref={scrollRef}    overflow={'scroll'}  position={'absolute'}  height={'calc(100% - 70px)'} width={'calc(100% - 70px)'}>
              {children} 
        </Box>
    </Box>)
}

export default GradientBox
