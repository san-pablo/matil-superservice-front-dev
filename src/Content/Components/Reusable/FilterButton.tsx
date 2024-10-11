/*
    MAKE A FILTER BUTTON LIKE INTERCOM.
*/


//REACT
import { useState, useRef, useEffect, RefObject, CSSProperties } from 'react'
//FRONT
import { motion, isValidMotionProp } from 'framer-motion'
import { Text, Box, Flex, Icon, Portal, chakra, shouldForwardProp } from '@chakra-ui/react'
//FUNCTIONS
import useOutsideClick from '../../Functions/clickOutside'
//ICONS
import { IconType } from 'react-icons'
import { FaCheck } from "react-icons/fa"
//TYPING
import { logosMap, Channels } from '../../Constants/typing' 
import { useTranslation } from 'react-i18next'

//TYPING
interface FilterButtonProps {
    selectList: Array<string>
    selectedElements: Array<string>
    setSelectedElements: (value:string) => void
    icon: IconType
    filter:'state' | 'channels' | 'employees'
    containerRef?: RefObject<HTMLDivElement>
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//MAIN FUNCTION
const FilterButton = ({selectList, selectedElements, setSelectedElements, icon, filter, containerRef}: FilterButtonProps) =>{

    const { t } = useTranslation('tickets')

    //DIC FOR MAPPING THE TYPE OF FILTER
    const mapDic = {'state': 'El estado es ', 'channels': 'Los canales son ', 'employees':'Los empleados son '}
   
    //SHOW AND WIDTH LIST LOGIC
    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const [showList, setShowList] = useState(false)
    const [width, setWidth] = useState('auto')
    useEffect(() => {setWidth(buttonRef.current ? `${buttonRef.current.offsetWidth}px` : 'auto')}, [selectedElements])    
    useOutsideClick({ref1:buttonRef, ref2:boxRef,containerRef, onOutsideClick:setShowList})

    //BOX POSITION LOGIC, TO SHOW IT UP OR DOWN OF THE INPUT, DEPENDING ON THE POSITION
    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
    const updateBoxPosition = () => {
        if (buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect()
            const halfScreenHeight = window.innerHeight / 2

            const newBoxStyle: CSSProperties = {
                top: buttonRect.bottom > halfScreenHeight ? 'auto' : `${buttonRect.bottom + window.scrollY}px`,
                bottom: buttonRect.bottom > halfScreenHeight ? `${window.innerHeight - buttonRect.top - window.scrollY}px` : 'auto',
                left: `${buttonRect.left}px`,
                width: `${buttonRect.width}px`
            }
            setBoxStyle(newBoxStyle)
        }
    }
    useEffect(() => {
        window.addEventListener('scroll', updateBoxPosition)
        window.addEventListener('resize', updateBoxPosition)
        return () => {
            window.removeEventListener('scroll', updateBoxPosition)
            window.removeEventListener('resize', updateBoxPosition)
        }
    }, [])
    useEffect(() => {if (showList) updateBoxPosition()}, [showList, selectedElements])

    //FRONT
    return (
        <Box> 
            <Flex whiteSpace={'normal'} height={'33px'} alignItems={'center'} cursor={'pointer'} bg='brand.gray_2' fontWeight='medium' gap='10px' px='7px' borderRadius={'.5rem'} fontSize={'1em'} ref={buttonRef} onClick={() => {setShowList(!showList)}} _hover={{color:'brand.text_blue'}}>
                <Icon as={icon}/>
                <Text fontSize={'.9em'} whiteSpace={'nowrap'}>
                {mapDic[filter]} 
                {
                    selectedElements.length > 0 ? (
                    selectedElements.length === 1 ?
                        t(selectedElements[0]):
                        selectedElements.slice(0, -1).map(el => t(el)).join(', ') + 
                        ' y ' + t(selectedElements[selectedElements.length - 1])
                    ) : 
                    'cualquiera'
                }
                </Text>            
            </Flex>
            
            {showList &&  
            <Portal> 
                <MotionBox ref={boxRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                    style={{ transformOrigin: boxStyle.top ? 'top':'bottom' }}  fontSize={'.8em'} width={boxStyle.width} left={boxStyle.left} marginTop={boxStyle.top ?'5px':'-5px'}  top={boxStyle.top || undefined}  bottom={boxStyle.bottom ||undefined} position='absolute' bg='white' p='8px'  zIndex={1000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='gray.200' borderWidth='1px' borderRadius='.7rem'>

                     {selectList.map((element, index) => (
                        <Flex key={`select-list-${index}`} borderRadius={'.5rem'} p='7px' cursor={'pointer'} onClick={()=>{setSelectedElements(element)}} justifyContent={'space-between'} alignItems={'center'} color={selectedElements.includes(element)?'brand.text_blue':'black'} _hover={{bg:'brand.hover_gray'}}>
                            <Text> {t(element)}</Text>
                            {selectedElements.includes(element) && <Icon as={FaCheck} color={'brand.text_blue'}/>}
                        </Flex>
                    ))}
                </MotionBox>
            </Portal>}
        </Box>
    )
}

export default FilterButton