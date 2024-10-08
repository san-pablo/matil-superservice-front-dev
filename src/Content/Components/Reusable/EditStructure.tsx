/* 
    CUSTOM SELECTOR
*/

//REACT
import { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
//FRONT
import { Flex, Text, Box,} from '@chakra-ui/react'
//COMPONENTS
import CustomSelect from './CustomSelect.js'
import VariableTypeChanger from './VariableTypeChanger.js'
import FieldSelection from './FieldSelection.js'
//TYPING
import { FieldAction } from '../../Constants/typing'

 

 

const EditStructure = ({data, setData, operationTypesDict, typesMap, scrollRef, isAction}:{data:FieldAction, setData:(newData:FieldAction) => void, operationTypesDict:{[key:string]:string[]}, typesMap:{[key:string]:string[]}, scrollRef:RefObject<HTMLDivElement> , isAction?:boolean}) => {

    //TRANSLATION
    const { t } = useTranslation('settings')
    const operationLabelsMap = {'set':t('set'), 'add':t('add'), 'substract':t('substract'), 'concatenate':t('concatenate'), 'append':t('append'), 'remove':t('remove'), 'eq':t('eq'), 'exists':t('exists'), 'neq':t('neq'), 'leq':t('leq'), 'geq':t('geq'), 'in':t('in'), 'nin':t('nin'), 'contains':t('contains'), 'ncontains':t('ncontains')}

    //TYPES MAP
   const isCustom = (data.motherstructure !== 'ticket' && data.motherstructure !== 'client' && data.motherstructure !== 'contact_business' )
 
   return(
        <>
        {isAction ?   
            <Flex alignItems={'center'} gap='10px'>
                <Box flex='1'> 
                    <CustomSelect containerRef={scrollRef} hide={false} selectedItem={data.operation} setSelectedItem={(value) => setData({...data, 'operation':value})} options={isCustom ? typesMap[data.motherstructure]:(operationTypesDict[data.name as keyof typeof operationTypesDict] || [])} labelsMap={operationLabelsMap} />
                </Box>
                <Box flex='1'> 
                    <FieldSelection containerRef={scrollRef} selectedItem={data} setSelectedItem={setData}/>
                </Box>
                <Text>{data.operation ? t(`${data.operation}_2`):''}</Text>
                <Box flex='1'> 
                    <VariableTypeChanger inputType={data.name} value={data.value} setValue={(value) => setData({...data, 'value':value})} operation={data.operation}/>
                </Box>
            </Flex>
        :
            <Flex alignItems={'center'} gap='10px'>
                <Box flex='1'> 
                    <FieldSelection containerRef={scrollRef} selectedItem={data} setSelectedItem={setData}/>
                </Box>
                <Box flex='1'> 
                    <CustomSelect containerRef={scrollRef} hide={false} selectedItem={data.operation} setSelectedItem={(value) => setData({...data, 'operation':value})} options={isCustom ? typesMap[data.motherstructure]:(operationTypesDict[data.name as keyof typeof operationTypesDict] || [])} labelsMap={operationLabelsMap} />
                </Box>
                <Box flex='1'> 
                    <VariableTypeChanger inputType={data.name} value={data.value} setValue={(value) => setData({...data, 'value':value})} operation={data.operation}/>
                </Box>
            </Flex>
        }
        </>)
}

export default EditStructure