    /*
        MAKE A REUSABLE FORM INPUT/TEXTAREA COMPONENT 
    */

//REACT
import { ChangeEvent, useState } from 'react'
import DOMPurify from 'dompurify'
//FRONT
import { Box, Text, Icon } from '@chakra-ui/react'
//ICONS
import { IconType } from 'react-icons'
import { AiOutlineEye, AiOutlineEyeInvisible} from 'react-icons/ai'

//TYPING
interface FormInputProps {
    value: string 
    setValue: (value: string) => void
    leftIcon:IconType
    maxLength?: number
    regex?: RegExp | null
    isPassword?:boolean
    placeholder?:string
}

//MAIN FUNCTION
const FormInput  = ({ value, setValue, maxLength, leftIcon,  regex = null, isPassword=false, placeholder=''}: FormInputProps) => {
    
    //BOOLEAN FOR CONTROLLING THE FOCUS
    const [isFocused, setIsFocused] = useState<boolean>(false)

    //BOOLLEAN FOR CONTROL THE PASSWORD VISIBILITY
    const [showPassword, setShowPassword] = useState<boolean>(true)
    
    //SANITIZE AND CHANGE THE INPUT
    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement> | ChangeEvent<HTMLInputElement> ) => {
        let inputValue = typeof(event) === 'string'?event: event.target.value
        inputValue = DOMPurify.sanitize(inputValue)
        if (maxLength && inputValue.length > maxLength) {inputValue = inputValue.substring(0, maxLength)}
        setValue(inputValue)
    }


    //CHANGE TEXTSTYLES ON WRONG REGEX
    const textStyles = (isFocused || value !== '')? {top:'-55%', scale:'0.8', left:'-5px', color:(regex ===null || value ==='' || regex?.test(value))?'rgba(0, 102, 204, 1)':'red'}:{scale:'0.9', top:'20%', left:'25px', color:'#A0AEC0'}
    
    //FRONT
    return (       
        <Box width={'100%'} position={'relative'}>
            <Icon  position={'absolute'} left={0} bottom={'4px'} boxSize={'18px'} color={(isFocused || value !== '')?(regex ===null || value ==='' || regex?.test(value))?'rgba(0, 102, 204, 1)':'red':'gray.400'} as={leftIcon}/>
            <input type={(showPassword && isPassword)?'password':'text'} value={value} onChange={handleInputChange} style={{border:'none',outline: 'none', padding:'5px 0px 5px 30px', fontSize:'.9em', background:'transparent', width:'100%'}} onBlur={() => setIsFocused(false)} onFocus={() => setIsFocused(true)}/>
            <Text pointerEvents={'none'} fontWeight={'medium'} transition='0.2s cubic-bezier(0.0, 0.9, 0.9, 1.0)' position={'absolute'} style={textStyles}>{placeholder}</Text>
            <Box width={'100%'}   boxShadow={(isFocused || value !== '') ? (regex ===null || value ===''|| regex?.test(value))?'0 0 0 1px rgba(0, 102, 204, 1)':'0 0 0 1px red': '0 0 0 1px #CBD5E0'}/>
            {isPassword && <Icon  position={'absolute'}  boxSize={'18px'} color={(isFocused || value !== '')?(regex ===null || value ===''|| regex?.test(value))?'rgba(0, 102, 204, 1)':'red':'gray.400'} right={0} bottom={'4px'} as={showPassword? AiOutlineEye:AiOutlineEyeInvisible}  onClick={() => setShowPassword(!showPassword)} />}
        </Box>
        )
}

export default FormInput