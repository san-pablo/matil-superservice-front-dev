//REACT
import { useState, useEffect } from 'react'
import { useAuth } from '../../../AuthContext'
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from '../../API/fetchData'
//COMPONENTS
import CustomSelect from './CustomSelect'
import EditText from './EditText'
//FRONT
import { Text, Skeleton, Flex, NumberInput, NumberInputField } from '@chakra-ui/react'
import { useAuth0 } from '@auth0/auth0-react'
 
//TYPING
type variables = 'bool' | 'int' | 'float' | 'str' | 'timestamp'
type fieldConfigType = {name:string, type:variables, default:string}

//MAIN FUNCION
const CustomAttributes = ({motherstructureType, customAttributes, updateCustomAttributes, disabled = false}:{motherstructureType:'conversation' | 'contact' | 'contact_business', customAttributes:{[name:string]:any}, updateCustomAttributes:(attributeName:string, value:any) => void, disabled?:boolean}) => {

    //CONSTANTS
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()

    //GET ALL ATTRIBUTES
    const [allAtributtes, setAllAttributes] = useState<{conversation:fieldConfigType[], contact:fieldConfigType[], contact_business:fieldConfigType[]} | null>(null)
    useEffect(() => {        
        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/custom_attributes`,getAccessTokenSilently, setValue:setAllAttributes, auth})
        }
        if (auth.authData.customAttributes) setAllAttributes(auth.authData.customAttributes)
        else fetchInitialData()
    }, [])

    //FRONT
    return (
    <Skeleton isLoaded={allAtributtes !== null} style={{width:'100%'}}> 
        {allAtributtes && <>
            {(allAtributtes?.[motherstructureType] || []).map((att, index) => (
            <Flex  key={`cusotm-attributre-${index}`}  mt='2vh' alignItems={'center'} gap='10px'>
                <Text  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  flex='1' fontWeight={'medium'} fontSize='.8em' color='gray.600' >{att.name}</Text>
                <Flex  flex='2' w='100%'> 
                    <InputType key={`custom-attribute-${index}`} disabled={disabled} inputType={att.type} value={customAttributes?.[att.name] !== null?  customAttributes?.[att.name]:att.default} setValue={(value:any) => updateCustomAttributes(att.name, value)} />
                </Flex>
            </Flex>
            ))}
        </>}
    </Skeleton>)
}

export default CustomAttributes


const InputType = ({inputType, value, setValue, disabled}:{inputType:string,value:string, setValue:(value:any) => void, disabled:boolean}, ) => {
    
    //USEFUL CONSTANTS
    const { t } = useTranslation('settings')
    const boolDict = {true:t('True'), false:t('False')}
    const datesMap = {'{today}':t('today'), '{yesterday}':t('yesterday'), '{start_of_week}':t('start_of_week'),'{start_of_month}':t('start_of_month')}

    const [currentValue, setCurrentValue] = useState<string>((value && value !== undefined) ? typeof(value) === 'string'?value:String(value):'') 
 
    switch(inputType) {
   
        case 'int':
        case 'float':  {  
             const handleBlur = () => {

                const normalizedValueString = currentValue?.replace(',', '.')
                if (normalizedValueString) {
                    if (inputType === 'int') {
                        setValue(parseInt(normalizedValueString)) 
                        setCurrentValue(String(parseInt(normalizedValueString)))
                    }
                    else if (inputType === 'float') return setValue(parseInt(normalizedValueString))
                }
            } 
            return (
            <NumberInput value={currentValue || undefined} w='100%' onBlur={handleBlur} onChange={(value) => setCurrentValue(value) } clampValueOnBlur={false}  >
                <NumberInputField placeholder={'-'} px='7px'  height={'32px'}  border={'1px solid transparent'} bg={disabled ? 'brand.gray_1':'transaprent'}  cursor={disabled ? 'not-allowed':'pointer'} transition={'border-color .2s ease-in-out, box-shadow .2s ease-in-out'}  borderRadius='.5rem'  fontSize={'.8em'} _focus={{  boxShadow:'0 0 0 2px rgb(59, 90, 246)', border: '1px solid rgb(59, 90, 246)'}} sx={{'&:focus:hover': {border: '1px solid rgb(59, 90, 246)'}}} _hover={{border:'1px solid #CBD5E0'}} />
            </NumberInput>)
        } 
        case 'bool':
            return <CustomSelect hide isDisabled={disabled} selectedItem={value} setSelectedItem={(value) => setValue(value)}  options={Object.keys(boolDict)} labelsMap={boolDict}/>          
        case 'str':
        case 'list':
                return <EditText placeholder={'-'} isDisabled={disabled} value={value} setValue={(value) => setValue(value)} hideInput={true} />
        case 'timestamp':
            return <CustomSelect isDisabled={disabled} hide={false} selectedItem={value}  setSelectedItem={(value) => setValue(value)}  options={Object.keys(datesMap)} labelsMap={datesMap}/>
        default: 
            return null
    }
} 