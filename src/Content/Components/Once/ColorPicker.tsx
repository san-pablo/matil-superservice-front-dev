/* 
    COLOR PICKER COMPONENT
*/

//REACT
import { useState, useRef, RefObject, CSSProperties } from 'react'
//FRONT
import { Box, Flex, Portal, chakra, shouldForwardProp } from '@chakra-ui/react'
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion'
import '../styles.css'
//COMPONENTS
import Chrome, { ChromeInputType } from '@uiw/react-color-chrome'
import EditText from '../Reusable/EditText'
//FUNCTIONS
import determineBoxStyle from '../../Functions/determineBoxStyle'
import useOutsideClick from '../../Functions/clickOutside'
//ICONS
import { IoIosArrowDown } from 'react-icons/io'
 
//TYPING
interface ColorPickerProps {
    color: string | undefined
    setColor: (value: string) => void
    containerRef?: RefObject<HTMLDivElement>
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})
 

//MAIN FUNCTION
const ColorPicker = ({ color, setColor,containerRef }: ColorPickerProps) => {

    //REFS
    const colorBoxRef = useRef<HTMLDivElement>(null)
    const colorButtonRef = useRef<HTMLDivElement>(null)
    const colorInputRef = useRef<HTMLDivElement>(null)

    //BOOLEAN TO CONTROL THE VISIBILITY AND CLOSE ON OUTSIDE CLICK
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false)
    useOutsideClick({ ref1: colorBoxRef, ref2: colorButtonRef, ref3: colorInputRef, containerRef, onOutsideClick: setShowColorPicker })

    //COLOR CHANGE LOGIC
    const handleInputChange = (value: string) => {
        const hexPattern = /^#[a-fA-F0-9]{0,6}$/
        if (hexPattern.test(value)) {
            setColor(value.startsWith('#') ? value : `#${value}`)
        }
    }

    //UPDATE POSITION
    const [pickerStyle, setPickerStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef:colorButtonRef, setBoxStyle:setPickerStyle, boxPosition:'right', changeVariable:showColorPicker})
  
    //FRONT
    return (
        <Flex gap='5px'>
            <Box ref={colorInputRef} flex={'1'}>
                <EditText value={color} setValue={handleInputChange} hideInput={false} />
            </Box>
            <Box position={'relative'}>
                <Flex ref={colorButtonRef} cursor={'pointer'} borderRadius={'.5rem'} height={'100%'} gap='7px' justifyContent={'center'} alignItems={'center'} borderColor={'gray.200'}  _hover={{borderColor:'gray.300'}} borderWidth={'1px'} px='5px' onClick={() => setShowColorPicker(!showColorPicker)}>
                    <Box height={'20px'} width='20px' borderRadius={'.3rem'} bg={color} />
                    <IoIosArrowDown className={showColorPicker ? "rotate-icon-up" : "rotate-icon-down"} />
                </Flex>
                <AnimatePresence>
                {showColorPicker && 
                <Portal> 
                <MotionBox ref={colorBoxRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                    style={{ transformOrigin: pickerStyle.top ? 'top right':'bottom right' }} mt={pickerStyle.top ?'5px':''} mb={'5px'}  right={pickerStyle.right}  top={pickerStyle.top || undefined}  bottom={pickerStyle.bottom ||undefined} position='absolute' bg='white'  zIndex={1000} >
                                <Chrome
                                    color={color}
                                    inputType={ChromeInputType.HEXA}
                                    showEditableInput={true}
                                    showEyeDropper={true}
                                    showColorPreview={true}
                                    showHue={true}
                                    showAlpha={true}
                                    onChange={(newColor) => setColor(newColor.hex)} />
                            </MotionBox>
                        </Portal>
                    }
                </AnimatePresence>
            </Box>
        </Flex>
    )
}

export default ColorPicker
