//REACT
import { Fragment, RefObject, useState} from 'react'
import { useTranslation } from 'react-i18next'
//FRONT
import { Box, Button, Flex, IconButton, Icon, Text } from '@chakra-ui/react'
//COMPONENTS
import EditStructure from './EditStructure'
//ICONS
import { FaPlus } from 'react-icons/fa6'
//TYPING
import { FilterType, typesMap } from '../../Constants/typing'
import { useAuth } from '../../../AuthContext'
  
//MAIN FUNCTION
const FilterManager = ({filters, setFilters, excludedFields, scrollRef, excludedColumns }: {filters: FilterType; setFilters: (newFilters: FilterType) => void; excludedFields?: ('conversations' | 'contacts' | 'contact_businesses')[], excludedColumns?:string[], scrollRef:RefObject<HTMLDivElement> ,}) => {
 
    const { t } = useTranslation('settings')
    const auth = useAuth()

    const allowedConditionsByColumn:{[key:string]:{name:string, type:'boolean' | 'integer' | 'number' | 'string' | 'array' | 'timestamp', is_custom?:boolean}} = {
        
        'id': {name:t('id'), type:'integer'},
        'local_id': {name:t('local_id'), type:'integer'},
        'user_id': {name:t('user_id'), type:'boolean'},
        'contact_id': {name:t('contact_id'), type:'boolean'},
        'theme_id': {name:t('theme_id'), type:'boolean'},
        'team_id': {name:t('team_id'), type:'boolean'},
        'created_at': {name:t('created_at'), type:'timestamp'},
        'updated_at': {name:t('updated_at'), type:'timestamp'},
        'solved_at': {name:t('solved_at'), type:'timestamp'},
        'closed_at': {name:t('closed_at'), type:'timestamp'},
        'created_by': {name:t('created_by'), type:'boolean'},
        'channel_type': {name:t('channel_type'), type:'boolean'},
        'channel_id': {name:t('channel_id'), type:'boolean'},
        'title': {name:t('title'), type:'string'},
        'status': {name:t('status'), type:'boolean'},
        'tags': {name:t('tags'), type:'boolean'},
        'unseen_changes': {name:t('unseen_changes'), type:'boolean'},
        'is_matilda_engaged': {name:t('is_matilda_engaged'), type:'boolean'},
        'is_csat_offered': {name:t('is_csat_offered'), type:'boolean'},
        'contact_business_id': {name:t('contact_business_id'), type:'boolean'},
        'last_interaction_at': {name:t('last_interaction_at'), type:'timestamp'},
        'name': {name:t('name'), type:'string'},
        'language': {name:t('language'), type:'boolean'},
        'phone_number': {name:t('phone_number'), type:'boolean'},
        'email_address': {name:t('email_address'), type:'string'},
        'instagram_username': {name:t('instagram_username'), type:'string'},
        'instagram_followers': {name:t('instagram_followers'), type:'number'},
        'webchat_id': {name:t('webchat_id'), type:'boolean'},
        'notes': {name:t('notes'), type:'string'},
        'is_blocked': {name:t('is_blocked'), type:'boolean'},
        'domain': {name:t('domain'), type:'string'},
    }
    auth.authData.cdas.map((cda) => (allowedConditionsByColumn[cda.id] = {name:cda.name, type:cda.type, is_custom:true}))

    const newKey = excludedFields.includes('conversations') ? excludedFields.includes('contacts') ?'language' : 'created_at'  :'user_id' 
 
    const addGroup = () => {
        const newGroup:any = { logic: 'AND', conditions: [{col:newKey, op:'eq',val:''}] }
        setFilters({ ...filters, groups: [...filters.groups, newGroup] })
    }

    const updateCondition = (groupIndex: number, conditionIndex: number, newCondition: { col: string; op: string; val: any }) => {
        const newGroups = [...filters.groups]
        newGroups[groupIndex].conditions[conditionIndex] = newCondition
        setFilters({ ...filters, groups: newGroups })
    }

    const addCondition = (groupIndex: number) => {
        const newGroups = [...filters.groups];
        newGroups[groupIndex].conditions.push({col:newKey, op:'eq',val:''})
        setFilters({ ...filters, groups: newGroups })
    }

    const removeCondition = (groupIndex: number, conditionIndex: number) => {
        const newGroups = [...filters.groups];
        newGroups[groupIndex].conditions = newGroups[groupIndex].conditions.filter((_, index) => index !== conditionIndex)
        if (newGroups[groupIndex].conditions.length === 0) newGroups.splice(groupIndex, 1)
        setFilters({ ...filters, groups: newGroups })
    }
    
    const updateGroupLogic = (groupIndex: number, logic: 'AND' | 'OR') => {
        const newGroups = [...filters.groups];
        newGroups[groupIndex].logic = logic;
        setFilters({ ...filters, groups: newGroups });
    }

    const updateFilterLogic = (logic: 'AND' | 'OR') => {setFilters({ ...filters, logic })}
    
    const [hoveredGroup, setHoveredGroup] = useState<number | null>(null);
    const [hoveredGeneral, setHoveredGeneral] = useState<boolean>(false)

  return (
    <Box > 
        <Box gap='10px'>
    
            {filters.groups.length === 0 ? 
                <Text color='text_gray' fontSize={'.8em'}>{t('NoFilterGroups')}</Text>
                :<>
            {filters.groups.map((group, groupIndex) => (<> 
                
                {group.conditions.length === 0 ? 
                <Text color='text_gray' fontSize={'.8em'}>{t('NoConditions')}</Text>
                :<>
                <Flex flexWrap={'wrap'} overflow={'hidden'} key={`group-${groupIndex}`} gap='10px'>

                    <Flex flexWrap={'wrap'} overflow={'hidden'} h='28px' bg='transparent' borderWidth={'1px'} borderColor={'border_color'} w='fit-content' borderRadius={'.5rem'}>
                    
                        {group.conditions.map((condition, conditionIndex) => (
                            <Fragment key={`condition-${conditionIndex}-${groupIndex}`}>
                                <EditStructure excludedColumns={excludedColumns} typesMap={typesMap} data={condition} setData={(newCondition) => updateCondition(groupIndex, conditionIndex, newCondition as { col: string; op: string; val: any })} operationTypesDict={allowedConditionsByColumn} excludedFields={excludedFields} deleteFunc={() => removeCondition(groupIndex, conditionIndex)} scrollRef={scrollRef}/>
                                {group.conditions.length -1 === conditionIndex ?
                                    <IconButton icon={<FaPlus/>} borderLeftWidth={'1px'}  borderLeftColor={'border_color'} borderRadius={'0'}  bg='transparent' aria-label='add-condition' _hover={{bg:'gray_2'}} variant='common' size='sm' onClick={() => addCondition(groupIndex)}/>
                                :
                                <Button variant={'common'}borderRadius={'0'} _hover={{bg:'gray_2'}} onMouseEnter={() => setHoveredGroup(groupIndex)} onMouseLeave={() => setHoveredGroup(null)} w='28px' bg={hoveredGroup === groupIndex ? 'gray_2':'transparent'} color={hoveredGroup === groupIndex ? 'text_blue':'black'} fontSize={'.8em'}    borderWidth={'0 1px 0 1px'} borderColor={'border_color'}  size='sm' onClick={() => updateGroupLogic(groupIndex, group.logic === 'AND' ? 'OR' : 'AND')}>
                                    {t(group.logic)}
                                </Button>
                                }
                            </Fragment>
                        ))}

                    </Flex>
                    {groupIndex < filters.groups.length - 1 && 
                    <Button  mb='1vh' w='28px' borderWidth={'1px'} fontSize={'.8em'} borderColor={'border_color'} _hover={{bg:'gray_2'}} onMouseEnter={() => setHoveredGeneral(true)} onMouseLeave={() => setHoveredGeneral(false)} bg={hoveredGeneral ? 'gray_2':'transparent'} color={hoveredGeneral ? 'text_blue':'black'}  variant={'common'} size='sm' onClick={() => updateFilterLogic(filters.logic === 'AND' ? 'OR' : 'AND')}>
                        {t(filters.logic)}
                    </Button>}
                </Flex>
            
                </>}

            </>))} 
            </>}
        </Box>

        <Flex mt='1vh' alignItems={'center'}  onClick={addGroup} gap='5px'  cursor={'pointer'} color={'text_blue'} >
            <Icon boxSize={'13px'} as={FaPlus}/>
            <Text fontSize={'.8em'} fontWeight={'medium'}>{t('AddFilter')}</Text>
        </Flex>
    </Box>
  )
}

export default FilterManager
