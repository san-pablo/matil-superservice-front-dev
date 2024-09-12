
//REACT
import  { useState, useEffect, useRef, Dispatch, SetStateAction, Ref, RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Text, Box, Button, Skeleton, Tooltip, IconButton, Textarea, Avatar, } from "@chakra-ui/react"
import { motion} from 'framer-motion'
//COMPONENTS
import CustomSelect from './CustomSelect'
import VariableTypeChanger from './VariableTypeChanger'
//ICONS
import { BsTrash3Fill } from "react-icons/bs"
import { FaPlus } from 'react-icons/fa6'
import { IoIosArrowBack } from 'react-icons/io'
import { RxCross2 } from 'react-icons/rx'
//TYPING 
import { FieldAction, ActionsType } from '../../Constants/typing'



const EditStructure = ({data, setData, operationTypesDict, scrollRef}:{data:FieldAction, setData:(structure:'motherstructure' | 'is_customizable' | 'name' | 'op' | 'value', value:any) => void,operationTypesDict:{[key:string]:string[]}, scrollRef:RefObject<HTMLDivElement> }) => {

    //TRANSLATION
    const { t } = useTranslation('settings')
    const operationLabelsMap = {'set':t('set'), 'add':t('add'), 'substract':t('substract'), 'concatenate':t('concatenate'), 'append':t('append'), 'remove':t('remove'), 'eq':t('eq'), 'exists':t('exists'), 'neq':t('neq'), 'leq':t('leq'), 'geq':t('geq'), 'in':t('in'), 'nin':t('nin'), 'contains':t('contains'), 'ncontains':t('ncontains')}

    //MAPPING CONSTANTS
    const structureList:('ticket' | 'client' | 'contact_business')[] = ['ticket', 'client', 'contact_business']    
    const structureLabelsMap:{[key in 'ticket' | 'client' | 'contact_business']:string} = {'ticket':t('tickets'), 'client':t('clients'),'contact_business':t('contact_businesses')}
    const ticketsList = ['user_id', 'group_id', 'channel_type', 'title', 'subject', 'urgency_rating', 'status', 'unseen_changes', 'tags', 'is_matilda_engaged', 'is_satisfaction_offered', 'hours_since_created', 'hours_since_updated']
    const ticketsLabelsMap:{[key:string]:string} = {}
    ticketsList.forEach((structure, index) => {ticketsLabelsMap[structure] = t(structure)})
    const clientsList = ['contact_business_id', 'name', 'language', 'rating', 'notes', 'labels', 'hours_since_created', 'hours_since_updated']
    const structureClientsMap:{[key:string]:string} = {}
    clientsList.forEach((structure, index) => {structureClientsMap[structure] = t(structure)})
    const businessList = ['name', 'domain', 'notes', 'labels', 'hours_since_created', 'hours_since_updated']
    const structureBusinessMap:{[key:string]:string} = {}
    businessList.forEach((structure, index) => {structureBusinessMap[structure] = t(structure)})


    //NAMES TO SELECT ON CHANGE MOTHERSTRUCTURE
    const selectableNames = data.motherstructure === 'ticket' ? ticketsList : data.motherstructure === 'client' ? clientsList : businessList
    const selectableDict = data.motherstructure === 'ticket' ? ticketsLabelsMap : data.motherstructure === 'client' ? structureClientsMap : structureBusinessMap
    
    return(
        <>
            <Box maxW={'500px'}>
                <Text mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('Structure')}</Text>
                <CustomSelect containerRef={scrollRef} hide={false} selectedItem={data.motherstructure} setSelectedItem={(value) => setData('motherstructure', value)} options={structureList} labelsMap={structureLabelsMap} />
            </Box>
             <Text mt='1vh' mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('IsCustomizable')}</Text>
            <Flex gap='10px' mt='5px'>
                <Button bg={data.is_customizable?'brand.gradient_blue':'gray.200'} color={data.is_customizable?'white':'black'} size='sm' _hover={{bg:data.is_customizable?'brand.gradient_blue_hover':'gray.300'}} onClick={() => setData( 'is_customizable', true)}>{t('Yes')}</Button>
                <Button bg={!data.is_customizable?'brand.gradient_blue':'gray.200'} color={!data.is_customizable?'white':'black'} size='sm' _hover={{bg:!data.is_customizable?'brand.gradient_blue_hover':'gray.300'}} onClick={() => setData('is_customizable', false)}>{t('No')}</Button>
            </Flex> 
            <Text mt='1vh' mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('ConditionDefinition')}</Text>
            {data.is_customizable? <Text></Text>:
            
            <Flex alignItems={'center'} gap='10px'>
                 <Box flex='1'> 
                    <CustomSelect containerRef={scrollRef} hide={false} selectedItem={data.name} setSelectedItem={(value) => setData( 'name', value)} options={selectableNames} labelsMap={selectableDict} />
                </Box>
                <Box flex='1'> 
                    <CustomSelect containerRef={scrollRef} hide={false} selectedItem={data.op} setSelectedItem={(value) => setData('op', value)} options={(operationTypesDict[data.name as keyof typeof operationTypesDict] || [])} labelsMap={operationLabelsMap} />
                </Box>
                <Box flex='1'> 
                    <VariableTypeChanger inputType={data.name} value={data.value} setValue={(value) => setData( 'value', value)}/>
                </Box>
            </Flex>}
        </>)
}

export default EditStructure