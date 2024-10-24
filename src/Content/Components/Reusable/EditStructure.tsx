/* 
    CUSTOM SELECTOR
*/

//REACT
import { RefObject, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
//FRONT
import { Flex, Text, Box,} from '@chakra-ui/react'
//COMPONENTS
import CustomSelect from './CustomSelect'
import VariableTypeChanger from './VariableTypeChanger'
import FieldSelection from './FieldSelection'
//TYPING
import { FieldAction } from '../../Constants/typing'

 
//MAIN FUNCTION
const EditStructure = ({data, setData, operationTypesDict, typesMap, scrollRef, isAction, excludedFields}:{data:FieldAction, setData:(newData:FieldAction) => void, operationTypesDict:{[key:string]:string[]}, typesMap:{[key:string]:string[]}, scrollRef:RefObject<HTMLDivElement> , isAction?:boolean,     excludedFields?:('conversation' | 'contact' | 'contact_business' | 'custom')[]}) => {

    //TRANSLATION
    const { t } = useTranslation('settings')
    const operationLabelsMap = {'set':t('set'), 'add':t('add'), 'substract':t('substract'), 'concatenate':t('concatenate'), 'append':t('append'), 'remove':t('remove'), 'eq':t('eq'), 'exists':t('exists'), 'neq':t('neq'), 'leq':t('leq'), 'geq':t('geq'), 'in':t('in'), 'nin':t('nin'), 'contains':t('contains'), 'ncontains':t('ncontains')}

    //TYPES MAP
    const isCustom = (data.motherstructure !== 'conversation' && data.motherstructure !== 'contact' && data.motherstructure !== 'contact_business' )
    const [customType, setCustomType] = useState<string>('') 

    //CHANGE DATA ON NAME CHANGE
    useEffect(() => {
        setData({...data, value:'', operation:isCustom ?typesMap[data.motherstructure][0]:(operationTypesDict[data.name as keyof typeof operationTypesDict] || [])[0]})
    },[data.name])
    
   return(
        <>
        {isAction ?   
            <Flex alignItems={'center'} gap='10px'>
                <Box flex='1'> 
                    <CustomSelect containerRef={scrollRef} hide={false} selectedItem={data.operation} setSelectedItem={(value) => setData({...data, 'operation':value})} options={isCustom ? typesMap[data.motherstructure]:(operationTypesDict[data.name as keyof typeof operationTypesDict] || [])} labelsMap={operationLabelsMap} />
                </Box>
                <Box flex='1'> 
                    <FieldSelection excludedFields={excludedFields} containerRef={scrollRef} selectedItem={data} setSelectedItem={setData} setCustomType={setCustomType}/>
                </Box>
                <Text>{data.operation ? t(`${data.operation}_2`):''}</Text>
                <Box flex='1'> 
                    <VariableTypeChanger customType={customType !== ''}  inputType={customType !== ''?data.motherstructure:data.name} value={data.value} setValue={(value) => setData({...data, 'value':value})} operation={data.operation}/>
                </Box>
            </Flex>
        :
            <Flex alignItems={'center'} gap='10px'>
                <Box flex='1'> 
                    <FieldSelection  excludedFields={excludedFields} containerRef={scrollRef} selectedItem={data} setSelectedItem={setData} setCustomType={setCustomType}/>
                </Box>
                <Box flex='1'> 
                    <CustomSelect containerRef={scrollRef} hide={false} selectedItem={data.operation} setSelectedItem={(value) => setData({...data, 'operation':value})} options={isCustom ? typesMap[data.motherstructure]:(operationTypesDict[data.name as keyof typeof operationTypesDict] || [])} labelsMap={operationLabelsMap} />
                </Box>
                <Box flex='1'> 
                    <VariableTypeChanger customType={customType !== ''} inputType={customType !== ''?data.motherstructure:data.name} value={data.value} setValue={(value) => setData({...data, 'value':value})} operation={data.operation}/>
                </Box>
            </Flex>
        }
        </>)
}

export default EditStructure