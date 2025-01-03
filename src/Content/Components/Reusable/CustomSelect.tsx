/* 
    CUSTOM SELECTOR
*/

//REACT
import { useState, useRef, RefObject, CSSProperties } from 'react'
//FRONT
import { Flex, Text, Box, Icon, Portal,  chakra, shouldForwardProp } from '@chakra-ui/react'
import { motion, AnimatePresence, isValidMotionProp  } from 'framer-motion'
import '../styles.css'
//FUNCTIONS
import determineBoxStyle from '../../Functions/determineBoxStyle'
import useOutsideClick from '../../Functions/clickOutside'
//ICONS
import { TiArrowSortedDown } from "react-icons/ti"
import { FaCheck } from 'react-icons/fa'
import { IconType } from 'react-icons'
import { useTranslation } from 'react-i18next'

//TYPING
interface CustomSelectProps<T extends string | number>  { 
    options: T[]
    selectedItem:  T | null | undefined 
    setSelectedItem: (key: T) => void
    hide:boolean
    updateData?: () => void
    labelsMap?: { [key in T]: string } | null
    iconsMap?: { [key in T]: [string, string | IconType] | [string, string | IconType, string]} | null
    containerRef?: RefObject<HTMLDivElement>
    isDisabled?:boolean
    disabledOptions?:T[]
    includeNull?:boolean
    variant?:'common' | 'styled' | 'title'
    fontSize?:string
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//MAIN FUNCTION
const CustomSelect = <T extends string | number>({options, selectedItem, setSelectedItem, hide, updateData=() => {},  labelsMap=null ,iconsMap=null, containerRef, isDisabled = false, disabledOptions, includeNull = false, variant = 'common', fontSize = '.8em'}: CustomSelectProps<T>) => {

    //REFS
    const { t } = useTranslation('stats')
    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)

    //BOOLEAN TO CONTROL THE VISIBILITY OF THE LIST AND CLOSE ON OUTSIDE CLICK
    const [showList, setShowList] = useState<boolean>(false)
    useOutsideClick({ref1:buttonRef, ref2:boxRef, containerRef, onOutsideClick:setShowList})

    //BOX POSITION LOGIC, TO SHOW IT UP OR DOWN OF THE INPUT, DEPENDING ON THE POSITION
    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef, setBoxStyle, boxPosition:'none', changeVariable:showList})

    //FRONT
    return(
        <Box position={'relative'} w='100%' fontSize={fontSize}>
          
            {variant === 'common' ? 
            <Flex  bg={isDisabled ? 'brand.gray_1':'transaprent'} transition={'border-color .2s ease-in-out, box-shadow .2s ease-in-out'} cursor={isDisabled ? 'not-allowed':'pointer'} alignItems={'center'} ref={buttonRef}  onClick={()=>{if (!isDisabled) setShowList(!showList)}} justifyContent={'space-between'} p={'7px'} borderRadius='.5rem'   boxShadow={ showList ? '0 0 0 2px rgb(59, 90, 246)' : ''} border={showList ? '1px solid rgb(59, 90, 246)':hide ? '1px solid transparent' : '1px solid #CBD5E0'} _hover={{border:showList ? '1px solid rgb(59, 90, 246)':'1px solid #CBD5E0'}}>
                <Text color={isDisabled ? 'gray.600':'black'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{(selectedItem === null ? t('Any'):(labelsMap && selectedItem !== undefined)?labelsMap[selectedItem]:iconsMap?.[selectedItem as T]?iconsMap[selectedItem][0]:selectedItem) || '-'}</Text>
                <Icon boxSize='14px' className={showList ? "rotate-icon-up" : "rotate-icon-down"} as={TiArrowSortedDown}/>
            </Flex>: 
            variant === 'title' ? 
            <Flex bg={showList?'brand.gray_1':'brand.gray_2' } _hover={{color:'brand.text_blue', bg:'brand.gray_1'}} cursor={isDisabled ? 'not-allowed':'pointer'} alignItems={'center'} ref={buttonRef} height={'37px'}   onClick={()=>{if (!isDisabled) setShowList(!showList)}} justifyContent={'space-between'} px={'11px'} py={ "5px" } borderRadius='.5rem' >
                <Flex gap='10px' alignItems={'center'} > 
                    {iconsMap && <>{(typeof(iconsMap[selectedItem][1]) === 'string') ? <Text>{iconsMap[selectedItem]?.[1] as string}</Text>:<Icon boxSize={'16px'} color={iconsMap?.[selectedItem]?.[2]?iconsMap?.[selectedItem]?.[2]:'currentColor'} as={iconsMap?.[selectedItem]?.[1] as IconType}/>}</>}
                    <Text fontWeight={'medium'} color={showList?'brand.text_blue':''}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{ selectedItem=== null ? t('Any'):(labelsMap && selectedItem !== undefined)?labelsMap[selectedItem]:iconsMap?.[selectedItem as T]?iconsMap[selectedItem][0]:selectedItem}</Text>
                </Flex>
             </Flex>
            :
            <Flex  bg={showList?'brand.gray_1':'brand.gray_2' }  transition={'border-color .2s ease-in-out, box-shadow .2s ease-in-out'}  cursor={isDisabled ? 'not-allowed':'pointer'} alignItems={'center'} ref={buttonRef}  onClick={()=>{if (!isDisabled) setShowList(!showList)}} justifyContent={'space-between'} p={'7px'} borderRadius='.5rem'   boxShadow={ showList ? '0 0 0 2px rgb(59, 90, 246)' : ''} border={showList ? '1px solid rgb(59, 90, 246)':hide ? '1px solid transparent' : '1px solid #CBD5E0'} _hover={{color:'brand.text_blue', bg:'brand.gray_1', border:showList ? '1px solid rgb(59, 90, 246)':'1px solid #CBD5E0'}}>
                 <Text color={showList?'brand.text_blue':''}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{selectedItem === null ? t('Any'):(labelsMap && selectedItem !== undefined)?labelsMap[selectedItem]:iconsMap?.[selectedItem as T]?iconsMap[selectedItem][0]:selectedItem}</Text>
                <Icon boxSize='14px' className={showList ? "rotate-icon-up" : "rotate-icon-down"} as={TiArrowSortedDown}/>
            </Flex>
            }
                
            <AnimatePresence> 
                {showList && 
                    <Portal>
                        <MotionBox  id="custom-portal"  initial={{ opacity: 0, marginTop:-10, marginBottom:-10 }} animate={{ opacity: 1, marginTop: 2,marginBottom:0 }}  exit={{ opacity: 0,marginTop:-10,marginBottom:-10}} transition={{ duration: '.2', ease: 'easeOut'}}
                        top={boxStyle.top} fontSize={fontSize} bottom={boxStyle.bottom}left={boxStyle.left} width={boxStyle.width} maxH='40vh' overflow={'scroll'} gap='10px' ref={boxRef} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.300'}>
                            
                            {includeNull && 
                             <Flex px='10px'    py='7px' cursor={'pointer'} justifyContent={'space-between'} alignItems={'center'} color={selectedItem === null?'brand.text_blue':'black'} _hover={{bg:selectedItem === null?'gray.200':'brand.hover_gray'}}
                                onClick={(e) => {if (includeNull) {e.stopPropagation();setSelectedItem(null as any);setShowList(false);setTimeout( () => updateData(), 0)} }}>
                                <Flex gap='10px' alignItems={'center'} > 
                                    <Text>{t('Any')}</Text>
                                </Flex>
                                {selectedItem === null && <Icon as={FaCheck}/>}
                            </Flex>}
                            {options.map((option:T, index:number) => (
                                <Flex key={`${selectedItem}-option-${index}`} px='10px' bg={disabledOptions?.includes(option)?'gray.200':'transparent'}   py='7px' cursor={disabledOptions?.includes(option)?'not-allowed':'pointer'} justifyContent={'space-between'} alignItems={'center'} color={selectedItem === option?'brand.text_blue':'black'} _hover={{bg:disabledOptions?.includes(option)?'gray.200':'brand.hover_gray'}}
                                    onClick={(e) => {if (!disabledOptions?.includes(option)) {e.stopPropagation();setSelectedItem(option as T); setShowList(false); setTimeout( () => updateData(), 0)} }}>
                                    <Flex gap='10px' alignItems={'center'} > 
                                        {iconsMap && <>{(typeof(iconsMap[option][1]) === 'string') ? <Text>{iconsMap[option]?.[1] as string}</Text>:<Icon  color={iconsMap?.[option]?.[2]?iconsMap?.[option]?.[2]:'black'} as={iconsMap?.[option]?.[1] as IconType}/>}</>}
                                        <Text>{iconsMap?iconsMap[option][0]:labelsMap?labelsMap[option]:option}</Text>
                                    </Flex>
                                    {selectedItem === option && <Icon as={FaCheck}/>}
                                </Flex>
                            ))}
                        </MotionBox>
                    </Portal>
                }
            </AnimatePresence>
        </Box>
    )
}

export default CustomSelect
