/*
    MAKE A REUSABLE INPUT/TEXTAREA COMPONENT 
*/

//REACT
import { useRef, useEffect, ChangeEvent, KeyboardEvent, useState, RefObject } from 'react'
import DOMPurify from 'dompurify'
//FRONT
import { Box, Input, Icon, Spinner, Textarea, Flex } from '@chakra-ui/react'
import '../styles.css'
//ICONS
import { IconType } from 'react-icons'
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
    fontSize?:string
    searchInput?:boolean
    searchIcon?:IconType
    updateData?: (text?:string) => void 
    isDisabled?:boolean
    nameInput?:boolean
    waitingResult?:boolean
    focusOnOpen?:boolean
    borderRadius?:string
    className?:string | null
    filterData?:(text:string) => void
    isTextArea?:boolean
    showDeleteIcon?:boolean
    isCustomSelect?:boolean
    catchEnter?:boolean

}

//MAIN FUNCTION
const EditText  = ({ value = '', setValue, hideInput = true, maxLength, regex, type='text', placeholder='', size='md', searchInput=false, searchIcon, updateData=() => {}, isDisabled = false, nameInput=false, waitingResult = false, focusOnOpen = false, fontSize = '.8em', borderRadius = '.5rem', className = null, filterData, isTextArea, showDeleteIcon = false, isCustomSelect = false, catchEnter = false}: EditTextProps) => {
    
    //INPUT REF
    const searchTextAreaRef = useRef<HTMLTextAreaElement>(null)
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
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
    useEffect(() => {
         const focusTextarea = () => {
            if (searchTextAreaRef.current) {
                searchTextAreaRef.current.focus()
                searchTextAreaRef.current.setSelectionRange(value.length, value.length)
            }
            else if (inputRef.current) {
                inputRef.current.focus()
                inputRef.current.setSelectionRange(value.length, value.length)
            }
        }
        if (focusOnOpen) focusTextarea()
    }, [])
    
    //SANITIZE AND CHANGE THE INPUT
    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement> | ChangeEvent<HTMLInputElement> ) => {
        if (!isDisabled) {
            let inputValue = typeof(event) === 'string'?event: event.target.value
            inputValue = DOMPurify.sanitize(inputValue)
            if (maxLength && inputValue.length > maxLength) {inputValue = inputValue.substring(0, maxLength)}
            setTempValue(inputValue)
        }
    }

    //BLUR ON ENTER KEY PRESS
    const handleKeyPress = (event:KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        
        if (!searchInput) {
            if (catchEnter) event.stopPropagation()
            if (event.key === 'Enter' && inputRef.current) inputRef.current.blur()
        }
        else {
            if (event.key === 'Enter' && catchEnter) {event.preventDefault();event.stopPropagation()}
            else if (event.key === ' ') event.stopPropagation()
        }
    }

    //FRONT
    return (
    <>   

    {isTextArea ? 
        <Textarea
            ref={textareaNotasRef}
            height={'auto'}
            placeholder={placeholder}
            size={size}
            minH={'70px'}
            maxH={'300px'}
            rows={1}
            resize={'none'}
            borderColor={(regex && value !== undefined) && !regex.test(value) && value !== '' ? 'red':hideInput?'transparent':'border_color'}
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
            bg={isDisabled?'gray_1':'transparent'}
            onChange={handleInputChange}
            isDisabled={isDisabled}
            onKeyDown={handleKeyPress}
            />
    :
    <>
    {className ?  
        <textarea ref={searchTextAreaRef} value={tempValue}className={className} onChange={handleInputChange} placeholder={placeholder} rows={1} onBlur={() => {if ((regex && value) ? regex.test(value) : true) {updateData(tempValue as string)} }} style={{borderColor:(regex && value !== undefined) && !regex.test(value) && value !== '' ? 'red':''}}/>
    :<>   
        {searchInput ?    
        <Flex  position="relative" h={isCustomSelect?fontSize:'auto'} overflow={'auto'} width={'100%'}alignItems={'center'} >
            {searchIcon && <Box left="0" top="0%"  px='8px' h='60px'   zIndex={10000} color='text_gray'  position='absolute'>
                {waitingResult ?<Spinner mt='10px' size='xs'/> :<Icon  zIndex={10000} as={searchIcon} height='13px'  color='text_gray' cursor={'pointer'} />}
            </Box>}
            <textarea rows={1} ref={searchTextAreaRef} placeholder={placeholder}  onKeyDown={handleKeyPress} style={{display:'block',   marginLeft:searchIcon?'30px':'',   caretColor: 'black', resize:'none', padding:'0', lineHeight:2.5, fontSize, borderColor:'transparent', border:'none', outline:'none', background:'transparent' }} value={tempValue} onChange={handleInputChange}/>
            {showDeleteIcon && <Icon right={0}  opacity={(value && value !== '') ? 1:0} transform={`scale(${(value && value !== '') ?1:0.5})`} transition={'opacity .1s ease-in-out, transform .1s ease-in-out'} zIndex={100} as={RxCross2} position='absolute' color='text_gray' cursor={'pointer'} onClick={() => {if ((value && value !== '')) setValue('')}} />}
        </Flex> : 
        <Box width={'100%'}>
            
            <Input
                ref={inputRef as RefObject<HTMLInputElement>}
                placeholder={placeholder}
                type={type?type:'text'}
                size={size}
                height={size === 'sm' ? '24px':'28px'}
                borderColor={(regex && value !== undefined) && !regex.test(value) && value !== '' ? 'red':hideInput?'transparent':'border_color'}
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
                bg={isDisabled?'gray_1':'transparent'}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}/>
        </Box>}
            </>
    }
    </>}
    </>)
}

export default EditText
