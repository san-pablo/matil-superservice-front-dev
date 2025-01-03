/*
    MAKE A REUSABLE INPUT/TEXTAREA COMPONENT 
*/

//REACT
import { useRef, useEffect, ChangeEvent, KeyboardEvent, useState } from 'react'
import DOMPurify from 'dompurify'
//FRONT
import { Box, Input, Icon, Spinner, Textarea } from '@chakra-ui/react'
//ICONS
import { FaMagnifyingGlass } from 'react-icons/fa6'
import { RxCross2 } from 'react-icons/rx'
import '../styles.css'

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
    fontSize?:string
    searchInput?:boolean
    updateData?: (text?:string) => void 
    isDisabled?:boolean
    nameInput?:boolean
    waitingResult?:boolean
    focusOnOpen?:boolean
    borderRadius?:string
    className?:string | null
    filterData?:(text:string) => void
    isTextArea?:boolean
}

//MAIN FUNCTION
const EditText  = ({ value = '', setValue, hideInput = true, maxLength, regex, type='text', placeholder='', size='sm', searchInput=false, updateData=() => {}, isDisabled = false, nameInput=false, waitingResult = false, focusOnOpen = false, fontSize = '.8em', borderRadius = '.5rem', className = null, filterData, isTextArea}: EditTextProps) => {
    
    //INPUT REF
    const inputRef = useRef<HTMLInputElement>(null)
    const [tempValue, setTempValue] = useState<string>(value || '');
    useEffect(() => {setTempValue(value || '')}, [value])

    //TEXT AREA REF 
    const textareaNotasRef = useRef<HTMLTextAreaElement>(null)
    const adjustTextareaHeight = (textarea:any) => {
        if (!textarea) return
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
    }
    useEffect(() =>{adjustTextareaHeight(textareaNotasRef.current)}, [tempValue])



    // Trigger update only when user stops typing (debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (tempValue !== value) {
                setValue(tempValue)
                if (filterData) filterData(tempValue)
            }
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [tempValue])
    //FOCUS ON OPEN IF ITS ENABLED
    useEffect(() => {if (focusOnOpen && inputRef.current) inputRef.current.focus()}, [])

    //SANITIZE AND CHANGE THE INPUT
    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement> | ChangeEvent<HTMLInputElement> ) => {
        let inputValue = typeof(event) === 'string'?event: event.target.value
        inputValue = DOMPurify.sanitize(inputValue)
        if (maxLength && inputValue.length > maxLength) {inputValue = inputValue.substring(0, maxLength)}
        setTempValue(inputValue)
    }

    //BLUR ON ENTER KEY PRESS
    const handleKeyPress = (event:KeyboardEvent<HTMLInputElement>) => {if (event.key === 'Enter' && inputRef.current) inputRef.current.blur()}

    //FRONT
    return (
    <>   

    {isTextArea ? 
        <Textarea
            ref={textareaNotasRef}
            height={'auto'}
            placeholder={placeholder}
            size={size}
            minH={'32px'}
            maxH={'300px'}
            rows={1}
            resize={'none'}
            borderColor={(regex && value !== undefined) && !regex.test(value) && value !== '' ? 'red':hideInput?'transparent':'gray.200'}
            _hover={{ border: ((regex && value) ? regex.test(value) : true)?'1px solid #CBD5E0':'2px solid red' }}
            px='7px'
            fontWeight={nameInput?'medium':'normal'}
            borderWidth={(regex && value !== undefined)  && !regex.test(value) && value !== '' ? '2px':'none'}
            value={tempValue}
            onBlur={() => {if ((regex && value) ? regex.test(value) : true) {updateData(tempValue as string)} }}
            transition={'border-color .2s ease-in-out, box-shadow .2s ease-in-out'}
            _focus={{  boxShadow:'0 0 0 2px rgb(59, 90, 246)', border: '1px solid rgb(59, 90, 246)'}} 
            sx={{'&:focus:hover': {border: '1px solid rgb(59, 90, 246)'}}} 
            borderRadius={borderRadius}
            fontSize={fontSize}
            bg={isDisabled?'brand.gray_1':'transparent'}
            onChange={handleInputChange}
            isDisabled={isDisabled}/>
    :
    <>
    {className ?  
        <textarea value={tempValue}className={className} onChange={handleInputChange} placeholder={placeholder} rows={1} onBlur={() => {if ((regex && value) ? regex.test(value) : true) {console.log(tempValue);updateData(tempValue as string)} }} style={{borderColor:(regex && value !== undefined) && !regex.test(value) && value !== '' ? 'red':''}}/>

    :<>   
        {searchInput ?    
        <Box  position="relative" width={'100%'} alignItems={'center'} >
            <Box left="0" top="0" bottom="0" px='8px' borderLeftRadius={'.5rem'} color='gray.600'  position='absolute' bg='brand.gray_2'>
                {waitingResult ?<Spinner mt='10px' size='xs'/> :<Icon  as={FaMagnifyingGlass} height='13px' mt='9px' color='gray.600' cursor={'pointer'} />}
            </Box> 
            <Input pl='40px' placeholder='Buscar...' size='sm' _focus={{ borderColor: "brand.text_blue", borderWidth: "2px" }} borderRadius={'.5rem'} borderColor={'gray.300'} value={tempValue} onChange={handleInputChange}/>
            {(value && value !== '') && <Icon mt='8px' ml='-22px' zIndex={100} as={RxCross2} position='absolute' color='gray.600' cursor={'pointer'} onClick={() => setTempValue('')} />}
        </Box> :
        <Box width={'100%'}>
            
            <Input
                ref={inputRef}
                placeholder={placeholder}
                type={type?type:'text'}
                size={size}
                height={'32px'}
                borderColor={(regex && value !== undefined) && !regex.test(value) && value !== '' ? 'red':hideInput?'transparent':'gray.200'}
                _hover={{ border: ((regex && value) ? regex.test(value) : true)?'1px solid #CBD5E0':'2px solid red' }}
                px='7px'
                fontWeight={nameInput?'medium':'normal'}
                borderWidth={(regex && value !== undefined)  && !regex.test(value) && value !== '' ? '2px':'none'}
                value={tempValue}
                onBlur={() => {if ((regex && value) ? regex.test(value) : true) {updateData(tempValue as string)} }}
                transition={'border-color .2s ease-in-out, box-shadow .2s ease-in-out'}
                _focus={{  boxShadow:'0 0 0 2px rgb(59, 90, 246)', border: '1px solid rgb(59, 90, 246)'}} 
                sx={{'&:focus:hover': {border: '1px solid rgb(59, 90, 246)'}}} 
                borderRadius={borderRadius}
                fontSize={fontSize}
                bg={isDisabled?'brand.gray_1':'transparent'}
                onChange={handleInputChange}
                isDisabled={isDisabled}
                onKeyDown={handleKeyPress}/>
        </Box>}
            </>
    }
    </>}
    </>)
}

export default EditText
