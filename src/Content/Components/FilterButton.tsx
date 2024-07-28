/*
    MAKE A FILTER BUTTON LIKE INTERCOM.
*/


//REACT
import { useState, useRef, useEffect, RefObject, CSSProperties } from 'react'
//FRONT
import { Text, Box, Flex, Icon } from '@chakra-ui/react'
//FUNCTIONS
import useOutsideClick from '../Functions/clickOutside'
//ICONS
import { IconType } from 'react-icons'
import { FaCheck } from "react-icons/fa"
//TYPING
import { logosMap, Channels } from '../Constants/typing' 

//TYPING
interface FilterButtonProps {
    selectList: Array<string>
    selectedElements: Array<string>
    setSelectedElements: (value:string) => void
    icon: IconType
    filter:'state' | 'channels' | 'employees'
    containerRef?: RefObject<HTMLDivElement>
}

//MAIN FUNCTION
const FilterButton = ({selectList, selectedElements, setSelectedElements, icon, filter, containerRef}: FilterButtonProps) =>{

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
            <Flex whiteSpace={'normal'} height={'33px'} alignItems={'center'} cursor={'pointer'}  border='1px solid' borderColor='gray.300' bg='gray.200' fontWeight='medium' gap='10px' px='7px' borderRadius={'.5rem'} fontSize={'1em'} ref={buttonRef} onClick={() => {setShowList(!showList)}} _hover={{color:'blue.500'}}>
                <Icon as={icon}/>
                <Text fontSize={'.9em'} whiteSpace={'nowrap'}>
                {mapDic[filter]} 
                {
                    selectedElements.length > 0 ? (
                    selectedElements.length === 1 ?
                        logosMap[selectedElements[0] as Channels][0] :
                        selectedElements.slice(0, -1).map(el => logosMap[el as Channels][0]).join(', ') + 
                        ' y ' + logosMap[selectedElements[selectedElements.length - 1] as Channels][0]
                    ) : 
                    'cualquiera'
                }
                </Text>            
            </Flex>
            {showList && 
                <Box p='15px' mt='5px' top={boxStyle.top} width={width} bottom={boxStyle.bottom} left={boxStyle.left}  maxH='40vh' overflow={'scroll'} gap='10px' ref={boxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100} position={'absolute'} borderRadius={'.5rem'} borderWidth={'1px'} borderColor={'gray.300'}>
                 {selectList.map((element, index) => (
                    <Flex key={`select-list-${index}`} borderRadius={'.5rem'} p='7px' cursor={'pointer'} onClick={()=>{setSelectedElements(element)}} justifyContent={'space-between'} alignItems={'center'} color={selectedElements.includes(element)?'blue.500':'black'} _hover={{bg:'brand.hover_gray'}}>
                        {logosMap[element as Channels][0]}
                        {selectedElements.includes(element) && <Icon as={FaCheck} color={'blue.500'}/>}
                    </Flex>
                ))}
            </Box>}
        </Box>
    )
}

export default FilterButton