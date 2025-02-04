//REACT
import { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
//FRONT
import { Box, Button, Flex, IconButton } from '@chakra-ui/react'
//COMPONENTS
import EditStructure from './EditStructure'
//ICONS
import { FaPlus } from 'react-icons/fa6'
//TYPING
import { FilterType } from '../../Constants/typing'
  
//MAIN FUNCTION
const FilterManager = ({filters, setFilters, operationTypesDict, typesMap, excludedFields, scrollRef }: {filters: FilterType; setFilters: (newFilters: FilterType) => void;operationTypesDict: { [key: string]: string[] }; typesMap: { [key: string]: string[] }; excludedFields?: ('conversations' | 'contacts' | 'contact_businesses' | 'custom')[], scrollRef:RefObject<HTMLDivElement> ,}) => {
 
    const { t } = useTranslation('settings')
    const addGroup = () => {
        const newGroup:any = { logic: 'AND', conditions: [{col:'status', op:'eq',val:'open'}] }
        setFilters({ ...filters, groups: [...filters.groups, newGroup] })
    }

    const updateCondition = (groupIndex: number, conditionIndex: number, newCondition: { col: string; op: string; val: any }) => {
        const newGroups = [...filters.groups]
        newGroups[groupIndex].conditions[conditionIndex] = newCondition
        setFilters({ ...filters, groups: newGroups })
    }

    const addCondition = (groupIndex: number) => {
        const newGroups = [...filters.groups];
        newGroups[groupIndex].conditions.push({col:'status', op:'eq',val:'open'});
        setFilters({ ...filters, groups: newGroups });
    }

    const removeCondition = (groupIndex: number, conditionIndex: number) => {
        const newGroups = [...filters.groups];
        newGroups[groupIndex].conditions = newGroups[groupIndex].conditions.filter((_, index) => index !== conditionIndex);
        if (newGroups[groupIndex].conditions.length === 0) newGroups.splice(groupIndex, 1)
        setFilters({ ...filters, groups: newGroups });
    }
    
    const updateGroupLogic = (groupIndex: number, logic: 'AND' | 'OR') => {
        const newGroups = [...filters.groups];
        newGroups[groupIndex].logic = logic;
        setFilters({ ...filters, groups: newGroups });
    }

    const updateFilterLogic = (logic: 'AND' | 'OR') => {
        setFilters({ ...filters, logic });
    }
    
  return (
    <Box > 
        <Box  gap='10px'>
    
            {filters.groups.map((group, groupIndex) => (<> 
                
                <Flex flexWrap={'wrap'} key={`group-${groupIndex}`} gap='10px'>
                
                    {group.conditions.map((condition, conditionIndex) => (
                        <>
                            <EditStructure data={condition} setData={(newCondition) => updateCondition(groupIndex, conditionIndex, newCondition) } operationTypesDict={operationTypesDict} typesMap={typesMap} excludedFields={excludedFields} deleteFunc={() => removeCondition(groupIndex, conditionIndex)} scrollRef={scrollRef}/>
                            {group.conditions.length -1 === conditionIndex ?
                             <IconButton icon={<FaPlus/>} aria-label='add-condition' variant='common' size='sm' onClick={() => addCondition(groupIndex)}/>
                            :
                            <Button variant={'common'}  size='sm' onClick={() => updateGroupLogic(groupIndex, group.logic === 'AND' ? 'OR' : 'AND')}>
                                {t(group.logic)}
                            </Button>
                            }
                        </>
                    ))}

                </Flex>
                {groupIndex < filters.groups.length - 1 && 
                <Button mt='1vh' mb='1vh' variant={'common'} size='sm' onClick={() => updateFilterLogic(filters.logic === 'AND' ? 'OR' : 'AND')}>
                    {t(filters.logic)}
                </Button>}

            </>))}
        </Box>

        <Button mt='2vh' bg='transparent' cursor={'pointer'} leftIcon={<FaPlus/>} size={'sm'}  onClick={addGroup} _hover={{bg:'transparent', color:'brand.text_blue'}}>{t('AddFilter')}</Button>
    </Box>
  )
}

export default FilterManager
