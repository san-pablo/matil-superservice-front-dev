import  { useRef, useState, useEffect } from 'react';
import '../styles.css';
import { Box } from '@chakra-ui/react';
import Waves from './Waves';

const GradientBox = ({ children, scrollRef }:{ children:any, scrollRef:any }) => {
  
  const blurRef1 = useRef<HTMLDivElement>(null)
  const blurRef2 = useRef<HTMLDivElement>(null)
  const blurRef3 = useRef<HTMLDivElement>(null)
  const blurRef4 = useRef<HTMLDivElement>(null)


 

   return (
   <> 
      <Box position={'absolute'} flex='1'  top={'-120%'} left={'-120%'} height={'340%'} animation={'rotateGradient 3s linear infinite'} width={'340%'}  bg='conic-gradient(from 0deg, #5F83F6 0%, #5FBFFA 17%, #3D83FA 35%, #3D83FA 48%, #5FBFFA 62%, #3F5DD7 78%, #5F83F6 100%)' zIndex={10} />
    
      <Box bg='transparent' ref={blurRef1}  top={'25px'}  height={'calc(100% - 50px)'} left={'20px'}  width={'20px'} position={'absolute'} zIndex={11}  >
        <Waves position='right' boxRef={blurRef1}/>
      </Box>
      <Box bg='transparent' ref={blurRef2}  top={'15px'}  height={'25px'} left={'25px'}  width={'calc(100% - 50px)'} position={'absolute'} zIndex={11}  >
        <Waves position='bottom' boxRef={blurRef2}/>
      </Box>
      <Box bg='transparent' ref={blurRef3}  top={'25px'}  height={'calc(100% - 50px)'} right={'20px'}  width={'20px'}position={'absolute'} zIndex={11}  >
        <Waves position='left' boxRef={blurRef3}/>
      </Box>
      <Box bg='transparent' ref={blurRef4}  bottom={'15px'}  height={'25px'} left={'25px'}  width={'calc(100% - 50px)'} position={'absolute'} zIndex={11}  >
        <Waves position='top' boxRef={blurRef4}/>
      </Box>

      <Box ref={scrollRef} boxShadow='0 0 10px 20px rgba(255, 255, 255)'   bg='white' px='10px' overflow={'scroll'} position={'absolute'} top={'25px'} left={'25px'} height={'calc(100% - 50px)'} width={'calc(100% - 50px)'} zIndex={100}>
          {children}
      </Box>
    </>)
}

export default GradientBox;
