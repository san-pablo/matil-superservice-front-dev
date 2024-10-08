//REACT
import { useState, useRef, KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
//FRONT
import { Text, NumberInputField, NumberInput,  } from '@chakra-ui/react'
//COMPONENTS
import CustomSelect from './CustomSelect'
import EditText from './EditText'
//FUNCITONS
import timeAgo from '../../Functions/timeAgo'

const CustomAttributes = ({customAttributes, updateCustomAttributes}:{customAttributes:{name:string, type:string, value:any}[], updateCustomAttributes:(value:any, index:number) => void}) => {

    //CONSTANTS
    const { t } = useTranslation('tickets')
    const t_formats = useTranslation('formats').t

    const boolDict = {True:t('true'), False:t('false')}

    const EditCustomAttribute = ({att, index}:{att:{name:string, type:string, value:any}, index:number}) => {
        const inputRef = useRef<HTMLInputElement>(null);
        const [currentValue, setCurrentValue] = useState<number | string>(att.value);
        const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter' && inputRef.current) inputRef.current.blur();
        }

        return (
        <> 
            <Text mb='.5vh'fontWeight={'medium'} mt='2vh' fontSize='.9em'>{att.name}</Text>
            {(() => {switch(att.type) {
                case 'bool':
                    return <CustomSelect hide={false} selectedItem={att.value} setSelectedItem={(value) => updateCustomAttributes(value, index)}  options={Object.keys(boolDict)} labelsMap={boolDict}/>
                case 'int':
                case 'float':
                return (
                    <NumberInput   onKeyDown={handleKeyPress} value={currentValue} onChange={(value) => setCurrentValue(parseInt(value))} onBlur={() =>  updateCustomAttributes(currentValue, index)}                                        clampValueOnBlur={false} >
                        <NumberInputField borderRadius='.5rem'  fontSize={'.9em'} height={'37px'}  borderColor={'gray.300'} _hover={{ border:'1px solid #CBD5E0'}} _focus={{ px:'11px', borderColor: "rgb(77, 144, 254)", borderWidth: "2px" }} px='12px' />
                    </NumberInput>)    
                       
                case 'str':
                    return <EditText value={currentValue as string} setValue={(value) => setCurrentValue(value)} updateData={() => updateCustomAttributes(currentValue, index)} hideInput={false} />
                    
                case 'timestamp':
                    return <Text fontSize={'.9em'}>{timeAgo(att.value, t_formats)}</Text>
                }})()} 
        </>)
    }

    return (<> 
        {/*
        {Object.keys(customAttributes).map((att, index) => (
            <EditCustomAttribute key={`custom-attribute-${index}`} att={customAttributes[att]} index={index}/>
        ))}
        */}
    </>)
}

export default CustomAttributes