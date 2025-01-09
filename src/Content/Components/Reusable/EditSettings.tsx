
//REACT
import  {useState, RefObject, SetStateAction, Dispatch } from 'react'
//FRONT
import { Flex, Text, Box, Icon, Switch, NumberInput, NumberInputField, Tooltip, NumberInputStepper, NumberDecrementStepper, NumberIncrementStepper } from "@chakra-ui/react"
//COMPONENTS
import EditText from './EditText'
import ImageUpload from './ImageUpload'
import ColorPicker from '../Once/ColorPicker'
//ICONS
import { IoMdArrowRoundForward, } from 'react-icons/io'
import { FaQuestionCircle } from "react-icons/fa"

export const EditStr = ({ title, value, setValue, description, placeholder}:{value:string, setValue:(value:string) => void, title:string, description?:string, placeholder?:string}) => {
        
    const [hoverDescription, setHoverDescription] = useState<boolean>(false)

    return (<> 
        <Flex  gap='5px'> 
            <Text fontWeight={'medium'} fontSize={'.9em'}>{title}</Text>
            {description && <Tooltip isOpen={hoverDescription} label={description} mt='-4px' placement='right' hasArrow bg='brand.black_button'  borderRadius='.4rem'  fontSize='.7em' color='white' p='6px' >
                <Box onMouseEnter={() => setHoverDescription(true)} onMouseLeave={() => setHoverDescription(false)}> 
                    <Icon as={FaQuestionCircle} mt='3px' color='#222'  />
                </Box>
            </Tooltip>}
        </Flex>
        <Box  mt='.5vh'> 
            <EditText placeholder={placeholder} hideInput={false} value={value} setValue={(val) => setValue(val)}/>
        </Box>
    </>)
}

export const EditBool = ({value, setValue, title, description}:{value:boolean, setValue:(value:boolean) => void,title:string, description?:string}) => {
    const [hoverDescription, setHoverDescription] = useState<boolean>(false)

    return (<>
      <Flex gap='8px' alignItems={'center'}>
            <Switch isChecked={value}  onChange={(e) => setValue(e.target.checked)} />
            <Flex mt='3px'  gap='5px'> 
                <Text fontWeight={'medium'} fontSize={'.9em'}>{title}</Text>
                {description && <Tooltip isOpen={hoverDescription} label={description} mt='-4px' placement='right' hasArrow bg='brand.black_button'  borderRadius='.4rem' fontSize='.7em' color='white' p='6px' >
                    <Box onMouseEnter={() => setHoverDescription(true)} onMouseLeave={() => setHoverDescription(false)}> 
                        <Icon as={FaQuestionCircle} mt='3px' color='#222'  />
                    </Box>
                </Tooltip>}
            </Flex>
        </Flex>
    </>)
}

 
export const EditColor = ({title, value, setValue,description, isGradient = false, containerRef}:{value:string[] | string, setValue:(value:string[] | string) => void, title:string, description?:string, isGradient?:boolean, containerRef:RefObject<HTMLDivElement>}) => {
    const [hoverDescription, setHoverDescription] = useState<boolean>(false)

    return(<>
        <Flex  gap='5px'> 
            <Text fontWeight={'medium'} fontSize={'.9em'}>{title}</Text>
            {description &&<Tooltip isOpen={hoverDescription} label={description} mt='-4px' placement='right' hasArrow bg='brand.black_button'  borderRadius='.4rem' fontSize='.7em' color='white' p='6px' >
                <Box onMouseEnter={() => setHoverDescription(true)} onMouseLeave={() => setHoverDescription(false)}> 
                    <Icon as={FaQuestionCircle} mt='3px' color='#222'  />
                </Box>
            </Tooltip>}
        </Flex>
        <Flex alignItems={'center'} gap='10px'> 
            <Box flex='1' > 
                <ColorPicker containerRef={containerRef} color={isGradient ? (value)[0]:value as string} 
                setColor={(val) => {setValue(isGradient ? [ val, value[1]]:val )}}/>
            </Box>
            <Icon boxSize={'25px'} color='gray.400' opacity={isGradient?1:0}  as={IoMdArrowRoundForward}/>

            <Flex flex='1' alignItems={'center'} gap='10px' opacity={isGradient?1:0} pointerEvents={isGradient?'auto':'none'}> 
                 <Box flex='1' > 
                    <ColorPicker containerRef={containerRef} color={value[1]} 
                    setColor={(val) => {setValue(isGradient ? [value[0],val]:val )}}/>
                </Box>
            </Flex>
        </Flex>
    </>)
}   
 
export const EditImage = ({title, value, setValue, description, maxImageSize = 2000}:{value:string, setValue:(value:string) => void,  title:string, description?:string, maxImageSize?:number }) => {
    const [hoverDescription, setHoverDescription] = useState<boolean>(false)

    return(<>
        <Flex  gap='5px'> 
            <Text fontWeight={'medium'}fontSize={'.9em'}>{title}</Text>
            {description && <Tooltip isOpen={hoverDescription} label={description} mt='-4px' placement='right' hasArrow bg='brand.black_button'  borderRadius='.4rem' fontSize='.7em' color='white' p='6px' >
                <Box onMouseEnter={() => setHoverDescription(true)} onMouseLeave={() => setHoverDescription(false)}> 
                    <Icon as={FaQuestionCircle} mt='3px' color='#222'  />
                </Box>
            </Tooltip>}
        </Flex>
        <Box width='300px' mt='.5vh'> 
            <ImageUpload maxImageSize={maxImageSize} id={title} initialImage={value} onImageUpdate={(file) => {setValue(file ? URL.createObjectURL(file) : '')}}/>
        </Box>
    </>)
}

 
export const EditInt = ({title,value, setValue, description, max, min, unit = 'px'}:{ value:string | number, setValue:(val:string | number) => void, title:string, description?:string, max:number, min:number, unit?:string}) => {
    const [hoverDescription, setHoverDescription] = useState<boolean>(false)

    return(<>
        <Flex  gap='5px'> 
            <Text fontWeight={'medium'} fontSize={'.9em'}>{title}</Text>
            {description && <Tooltip isOpen={hoverDescription} label={description} mt='-4px' placement='right' hasArrow bg='brand.black_button'  borderRadius='.4rem' fontSize='.7em' color='white' p='6px' >
                <Box onMouseEnter={() => setHoverDescription(true)} onMouseLeave={() => setHoverDescription(false)}> 
                    <Icon as={FaQuestionCircle} mt='3px' color='#222'  />
                </Box>
            </Tooltip>}
        </Flex>
        <Flex alignItems={'center'} fontWeight={'medium'} gap='10px'> 
            <NumberInput width={'200px'} size='sm' mt='.5vh'  value={String(value)} onChange={(val) => setValue(val)}  min={min} max={max}>
                <NumberInputField  fontSize={'.9em'} borderRadius='.5rem'   borderColor={'gray.300'} _hover={{ border: '1px solid #CBD5E0' }} _focus={{ borderColor: 'rgb(77, 144, 254)', borderWidth: '2px', px:'6px' }} px='7px' />
                    <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>
            <Text color='gray.600' >{unit}</Text>
        </Flex>
    </>)
}