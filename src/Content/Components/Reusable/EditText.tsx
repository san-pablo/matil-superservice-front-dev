/*
    MAKE A REUSABLE INPUT/TEXTAREA COMPONENT 
*/

//REACT
import { useRef, useEffect, ChangeEvent, KeyboardEvent} from 'react'
import DOMPurify from 'dompurify'
//FRONT
import { Box, Input, Icon, Spinner } from '@chakra-ui/react'
//ICONS
import { FaMagnifyingGlass } from 'react-icons/fa6'
import { RxCross2 } from 'react-icons/rx'

//TYPING
interface EditTextProps {
    value: string | undefined
    setValue: (value: string) => void
    hideInput?: boolean
    maxLength?: number
    regex?: RegExp
    type?:string 
    placeholder?:string
    size?:string
    fontSize?:string | null
    searchInput?:boolean
    updateData?: () => void
    isDisabled?:boolean
    nameInput?:boolean
    waitingResult?:boolean
    focusOnOpen?:boolean
    borderRadius?:string
}

//MAIN FUNCTION
const EditText  = ({ value = '', setValue, hideInput = true, maxLength, regex, type='text', placeholder='', size='sm', searchInput=false, updateData=() => {}, isDisabled = false, nameInput=false, waitingResult = false, focusOnOpen = false, fontSize = null, borderRadius = '.5rem'}: EditTextProps) => {
    
    //INPUT REF
    const inputRef = useRef<HTMLInputElement>(null)

    //FOCUS ON OPEN IF ITS ENABLED
    useEffect(() => {if (focusOnOpen && inputRef.current) inputRef.current.focus()}, [])

    //SANITIZE AND CHANGE THE INPUT
    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement> | ChangeEvent<HTMLInputElement> ) => {
        let inputValue = typeof(event) === 'string'?event: event.target.value
        inputValue = DOMPurify.sanitize(inputValue)
        if (maxLength && inputValue.length > maxLength) {inputValue = inputValue.substring(0, maxLength)}
        setValue(inputValue)
    }

    //BLUR ON ENTER KEY PRESS
    const handleKeyPress = (event:KeyboardEvent<HTMLInputElement>) => {if (event.key === 'Enter' && inputRef.current) inputRef.current.blur()}

    //FRONT
    return (
    <>        
        {searchInput ?    
        <Box  position="relative" width={'100%'} alignItems={'center'} >
            <Box left="0" top="0" bottom="0" px='8px' borderLeftRadius={'.5rem'} color='gray.600'  position='absolute' bg='brand.gray_2'>
                {waitingResult ?<Spinner mt='10px' size='xs'/> :<Icon  as={FaMagnifyingGlass} height='13px' mt='9px' color='gray.600' cursor={'pointer'} />}
            </Box> 
            <Input pl='40px' placeholder='Buscar...' size='sm' _focus={{ borderColor: "brand.text_blue", borderWidth: "2px" }} borderRadius={'.5rem'} borderColor={'gray.300'} value={value} onChange={(e) => setValue(e.target.value)}/>
            {(value && value !== '') && <Icon mt='8px' ml='-22px' zIndex={100} as={RxCross2} position='absolute' color='gray.600' cursor={'pointer'} onClick={() => setValue('')} />}
        </Box> :
        <Box width={'100%'}>
            
            <Input
                ref={inputRef}
                placeholder={placeholder}
                type={type?type:'text'}
                size={size}
                borderColor={(regex && value !== undefined) && !regex.test(value) && value !== '' ? 'red':hideInput?'transparent':'gray.200'}
                _hover={{ border: ((regex && value) ? regex.test(value) : true)?'1px solid #CBD5E0':'2px solid red' }}
                _focus={{ px:'6px', borderColor: "brand.text_blue", borderWidth: "2px" }}
                px='7px'
                fontWeight={nameInput?'medium':'normal'}
                borderWidth={(regex && value !== undefined)  && !regex.test(value) && value !== '' ? '2px':'none'}
                value={value}
                onBlur={() => {if ((regex && value) ? regex.test(value) : true) updateData()}}
                borderRadius={borderRadius}
                fontSize={fontSize?fontSize:size}
                bg={isDisabled?'brand.gray_1':'transparent'}
                onChange={handleInputChange}
                isDisabled={isDisabled}
                onKeyDown={handleKeyPress}/>
        </Box>}
        </>)
}

export default EditText
