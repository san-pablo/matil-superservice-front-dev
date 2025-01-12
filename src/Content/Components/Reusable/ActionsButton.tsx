import { useState, useRef } from "react"
import { useTranslation } from "react-i18next"
//FRONT
import { Flex, IconButton, Icon, Text, chakra, shouldForwardProp, Portal  } from "@chakra-ui/react"
import { motion, isValidMotionProp, AnimatePresence } from 'framer-motion'
//FUNCTIONS
import useOutsideClick from "../../Functions/clickOutside"
//ICONS
import { BsThreeDots } from "react-icons/bs"
import { TbCopyPlusFilled } from "react-icons/tb"
import { HiTrash } from "react-icons/hi2"

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

 

const ActionsButton = ({copyAction, deleteAction, showCopy = true}:{copyAction:() => void, deleteAction:() => void, showCopy?:boolean}) => {

    const { t } = useTranslation('settings')
    const [showList, setShowList] = useState<boolean>(false)
      
    const buttonRef = useRef<HTMLButtonElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    useOutsideClick({ref1:buttonRef, ref2:boxRef, onOutsideClick:setShowList})

    return(
        <Flex position={'relative'} flexDir='column' alignItems={'end'}>  
            <IconButton ref={buttonRef}  aria-label="open-options" variant={'common'} size='sm' icon={<BsThreeDots size={'18px'}/>} onClick={() =>setShowList(true)}/>
            <AnimatePresence> 
                {showList &&  
                    <Portal> 
                        <MotionBox ref={boxRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                            style={{ transformOrigin: 'top' }} minW={buttonRef.current?.getBoundingClientRect().width } right={window.innerWidth - (buttonRef.current?.getBoundingClientRect().right || 0)} mt='5px'  top={buttonRef.current?.getBoundingClientRect().bottom }  position='absolute' bg='white' p='5px'  zIndex={1000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='gray.200' borderWidth='1px' borderRadius='.5rem'>
                        
                           <Flex fontSize={'.8em'} p='7px' gap='10px'  borderRadius='.5rem'  cursor={'pointer'} onClick={() => {setShowList(false);copyAction()}} alignItems={'center'} _hover={{bg:'brand.gray_2'}}>
                                <Icon color='gray.600' as={TbCopyPlusFilled}/>
                                <Text whiteSpace={'nowrap'}>{t('Double')}</Text>
                            </Flex>
                            <Flex  fontSize={'.8em'}  p='7px' gap='10px'  borderRadius='.5rem'  color='red' cursor={'pointer'} onClick={() => {setShowList(false);deleteAction()}} alignItems={'center'} _hover={{bg:'red.100'}}>
                                <Icon as={HiTrash}/>
                                <Text whiteSpace={'nowrap'}>{t('Delete')}</Text>
                            </Flex>
                        </MotionBox >
                    </Portal>}
            </AnimatePresence>
        </Flex>
    )
}

export default ActionsButton