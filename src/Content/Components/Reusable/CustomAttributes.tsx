//REACT
import { useState, useEffect } from 'react'
import { useAuth } from '../../../AuthContext'
import { useTranslation } from 'react-i18next'
import { useAuth0 } from '@auth0/auth0-react'
//FETCH DATA
import fetchData from '../../API/fetchData'
//COMPONENTS
import CustomSelect from './CustomSelect'
import EditText from './EditText'
//FRONT
import { Text, Skeleton, Flex, NumberInput, NumberInputField, Switch } from '@chakra-ui/react'
//TYPING
import { CDAsType } from '../../Constants/typing'

const getFrontType = (backType:'boolean' | 'integer' | 'number' | 'string' | 'array', alloweValues:string[]) => {
    if (backType === 'string')
    {
        if (alloweValues.length === 0) return 'text'
        else if (alloweValues.length > 0) return 'select'
    } 
    else return backType
}

//MAIN FUNCION
const CustomAttributes = ({motherstructureType, motherstructureId , customAttributes, updateCustomAttributes, disabled = false}:{motherstructureType:'conversations' | 'persons' | 'businesses', motherstructureId:number, customAttributes:{[name:string]:any}, updateCustomAttributes:(attributeName:string, value:any) => void, disabled?:boolean}) => {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation(('settings')) 
    const { getAccessTokenSilently } = useAuth0()

    //GET ALL ATTRIBUTES
     const [allAtributtes, setAllAttributes] = useState<CDAsType[] | null>(null)
    useEffect(() => {        
        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/cdas`,getAccessTokenSilently, setValue:setAllAttributes, auth})
        }
        if (auth.authData.cdas) setAllAttributes(auth.authData.cdas)
        else fetchInitialData()
    }, [])

    //FRONT
    return (
    <Skeleton isLoaded={allAtributtes !== null} style={{width:'100%'}}> 
        {allAtributtes && <>

            {(allAtributtes?.filter(att => att.structure === motherstructureType) || []).length === 0 ? 
                <Text fontSize={'.8em'} color='text_gray'>{t('NoCdas')}</Text>
            :<>
                {(allAtributtes?.filter(att => att.structure === motherstructureType) || []).map((att, index) => {
                
                const frontType = getFrontType(att.type, att.allowed_values)
                return (<>
                    {!att.is_archived && 
                    <Flex key={`cusotm-attributre-${index}`}  mt='2vh' alignItems={'center'} gap='10px'>
                        <Text  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  flex='1' fontWeight={'medium'} fontSize='.8em' color='text_gray' >{att.name}</Text>
                        <Flex  flex='2' w='100%'> 
                            <InputType  allowedValues={att.allowed_values} motherstructureType={motherstructureType}motherstructureId={motherstructureId} id={att.id} key={`custom-attribute-${index}`} disabled={disabled} inputType={frontType} value={customAttributes?.[att.id] !== null?  customAttributes?.[att.id]:''} setValue={(value:any) => updateCustomAttributes(att.id, value)} />
                        </Flex>
                    </Flex>}
                </>) 
                })}
            </>}
        </>}
    </Skeleton>)
}

export default CustomAttributes

//INPUT TYPES
const InputType = ({allowedValues,  inputType, motherstructureId, value, setValue, disabled, motherstructureType, id}:{allowedValues:string[], inputType:string,value:any, motherstructureId:number, setValue:(value:any) => void, disabled:boolean, motherstructureType:'conversations' | 'persons' | 'businesses', id:string}, ) => {
    
    //USEFUL CONSTANTS
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()
    const { t } = useTranslation('settings')
    const datesMap = {'{today}':t('today'), '{yesterday}':t('yesterday'), '{start_of_week}':t('start_of_week'),'{start_of_month}':t('start_of_month')}

    const [showSelect, setShowSelect] = useState<boolean>(false)
    const changeAttribute = async(value:any) => {
        if (value) await fetchData({endpoint:`${auth.authData.organizationId}/${motherstructureType}/${motherstructureId}/cdas/${id}`, method:'put', requestForm:{value}, getAccessTokenSilently, auth})
    }
    useEffect(() => {
        changeAttribute(value)
    }, [value])
  
    let allowedValuesMap:{[key:string]:string} = {}
    allowedValues.map((val) => allowedValuesMap[val] = val)


     switch(inputType) {
   
        case 'integer': 
        return (<NumberInput value={value? value:''} w='100%'onChange={(valueString) => setValue(parseInt(valueString))} pattern={'(?:0|[1-9]\d*)'} >
                    <NumberInputField placeholder={'-'} px='7px'  height={'32px'}  border={'1px solid transparent'} bg={disabled ? 'gray_1':'transaprent'}  cursor={disabled ? 'not-allowed':'pointer'} transition={'border-color .2s ease-in-out, box-shadow .2s ease-in-out'}  borderRadius='.5rem'  fontSize={'.8em'} _focus={{  boxShadow:'0 0 0 2px rgb(59, 90, 246)', border: '1px solid rgb(59, 90, 246)'}} sx={{'&:focus:hover': {border: '1px solid rgb(59, 90, 246)'}}} _hover={{border:'1px solid #CBD5E0'}} />
                </NumberInput>)
        case 'number':
            return (
                <NumberInput  value={value? value:''} w='100%' onBlur={() => {if (typeof(value) === 'string') setValue(Number(value))}}  onChange={(valueString) => {
                    const parsedValue = Number(valueString)
                    if (valueString.endsWith('.')) setValue(valueString)
                    else if (!isNaN(parsedValue)) setValue(parsedValue)
                    else setValue('')
                    }}  pattern="^[+\-]?(?:\d+)(?:\.\d*)?$|^[+\-]?(?:\d*)(?:\.\d+)$">
                    <NumberInputField placeholder={'-'} px='7px'  height={'32px'}  border={'1px solid transparent'} bg={disabled ? 'gray_1':'transaprent'}  cursor={disabled ? 'not-allowed':'pointer'} transition={'border-color .2s ease-in-out, box-shadow .2s ease-in-out'}  borderRadius='.5rem'  fontSize={'.8em'} _focus={{  boxShadow:'0 0 0 2px rgb(59, 90, 246)', border: '1px solid rgb(59, 90, 246)'}} sx={{'&:focus:hover': {border: '1px solid rgb(59, 90, 246)'}}} _hover={{border:'1px solid #CBD5E0'}} />
                </NumberInput>) 

        
        case 'boolean':
            return  <Switch isChecked={value}  onChange={(e) => setValue(e.target.checked)} />
        case 'text':
            return <EditText placeholder={'-'} isDisabled={disabled} value={value} setValue={(value) => setValue(value)} hideInput={true} />

        case 'array':
        case 'select':    
        {
      
            return <CustomSelect onlyOneSelect={inputType === 'select'} isDisabled={disabled} selectedItem={value}  setSelectedItem={(value) => setValue(value)}  options={allowedValues} labelsMap={allowedValuesMap}/>
        }
        case 'timestamp':
            return <CustomSelect isDisabled={disabled} hide={false} selectedItem={value}  setSelectedItem={(value) => setValue(value)}  options={Object.keys(datesMap)} labelsMap={datesMap}/>
        default: 
            return null
    }
} 