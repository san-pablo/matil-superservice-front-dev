//REACT
import { useState, useEffect, Fragment } from 'react'
import { useAuth } from '../../../AuthContext'
//FETCH DATA
import fetchData from '../../API/fetchData'
//COMPONENTS
import VariableTypeChanger from './VariableTypeChanger'
//FRONT
import { Text, Skeleton } from '@chakra-ui/react'
 
//TYPING
type variables = 'bool' | 'int' | 'float' | 'str' | 'timestamp'
type fieldConfigType = {name:string, type:variables, default:string}

//MAIN FUNCION
const CustomAttributes = ({motherstructureType, customAttributes, updateCustomAttributes, disabled = false}:{motherstructureType:'conversation' | 'contact' | 'contact_business', customAttributes:{[name:string]:any}, updateCustomAttributes:(attributeName:string, value:any) => void, disabled?:boolean}) => {

    //CONSTANTS
    const auth = useAuth()

    //GET ALL ATTRIBUTES
    const [allAtributtes, setAllAttributes] = useState<{conversation:fieldConfigType[], contact:fieldConfigType[], contact_business:fieldConfigType[]} | null>(null)
    useEffect(() => {        
        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/custom_attributes`, setValue:setAllAttributes, auth})
        }
        if (auth.authData.customAttributes) setAllAttributes(auth.authData.customAttributes)
        else fetchInitialData()
    }, [])

    //FRONT
    return (
    <Skeleton isLoaded={allAtributtes !== null}> 
        {allAtributtes && <>
            {(allAtributtes?.[motherstructureType] || []).map((att, index) => (
            <Fragment key={`cusotm-attributre-${index}`}>
                <Text mb='.5vh'fontWeight={'medium'} mt='2vh' fontSize='.9em'>{att.name}</Text>
                <VariableTypeChanger key={`custom-attribute-${index}`} disabled={disabled} inputType={att.type} value={customAttributes?.[att.name] !== null?  customAttributes?.[att.name]:att.default} setValue={(value:any) => updateCustomAttributes(att.name, value)} customType />
            </Fragment>))}
        </>}
    </Skeleton>)
}

export default CustomAttributes