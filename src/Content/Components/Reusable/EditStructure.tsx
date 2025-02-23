//REACT
import { RefObject, useEffect, useState, useRef, CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../AuthContext'
 //FRONT
import { Flex, Text, Box, chakra, shouldForwardProp, Icon, Portal, Radio } from '@chakra-ui/react'
import { motion, isValidMotionProp, AnimatePresence } from 'framer-motion' 
//COMPONENTS
import VariableTypeChanger from './VariableTypeChanger'
//FUCNTIONS
import useOutsideClick from '../../Functions/clickOutside'
import determineBoxStyle from '../../Functions/determineBoxStyle'
//ICONS
import { RxCross2 } from 'react-icons/rx'
import CustomSelect from './CustomSelect'

import { allowedContactsFilters, allowedConversationFilters, allowedBusinessFilters } from '../../Constants/typing.js'


//TYPING 
interface EditStructureProps {
    data:{col:string, op:string, val:any} 
    setData:(newData:{col:string | number, op:string, val:any}  ) => void
    operationTypesDict:{[key:string]:{name:string, type:'boolean' | 'integer' | 'number' | 'string' | 'array' | 'timestamp', is_custom?:boolean}}
    typesMap:{[key:string]:string[]}
    scrollRef:RefObject<HTMLDivElement>
    isAction?:boolean
    excludedFields?:('conversations' | 'contacts' | 'contact_businesses')[]
    deleteFunc?:() => void
    customOptions?:{[key:string | number]:string}
    excludedColumns?:string[], 
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)}) 

//MAIN FUNCTION
const EditStructure = ({data, setData, operationTypesDict, typesMap, scrollRef, isAction, excludedFields, deleteFunc, customOptions, excludedColumns}:EditStructureProps) => {

    //TRANSLATION
    const auth = useAuth()
    
    //TRANSLATION
    const { t } = useTranslation('settings')
    const initialRender = useRef<boolean>(true)
    const customFields = auth.authData.cdas || []
    const operationLabelsMap = {'between':t('between'), 'gt':t('gt'), 'lt':t('lt'), 'set':t('set'), 'add':t('add'), 'substract':t('substract'), 'concatenate':t('concatenate'), 'append':t('append'), 'remove':t('remove'), 'eq':t('eq'), 'exists':t('exists'), 'neq':t('neq'), 'leq':t('leq'), 'geq':t('geq'), 'in':t('in'), 'nin':t('nin'), 'contains':t('contains'), 'ncontains':t('ncontains')}
    const listStructure = {
        'conversations':[...allowedConversationFilters.filter(st => !(excludedColumns || []).includes(st)), ...customFields.filter(struct => struct.structure === 'conversations').map(struct => (struct.id))],
        'contacts':[...allowedContactsFilters, ...customFields.filter(struct => struct.structure === 'persons').map(struct => (struct.id))],
        'contact_businesses':[...allowedBusinessFilters, ...customFields.filter(struct => struct.structure === 'businesses').map(struct => (struct.id))]
    }

    let labelsMap:{[key:string | number]:string} = {}

    if (customOptions) labelsMap = customOptions
    else Object.keys(operationTypesDict).map(label => {labelsMap[label] = operationTypesDict[label].name} )
    
    const availableSections = ['conversations', 'contacts', 'contact_businesses'].filter(section => !excludedFields.includes(section as any)) as any
    const [selectedSection, setSelectedSection] = useState<'conversations' | 'contacts' | 'contact_businesses'>(availableSections?.length === 1 ? availableSections[0] : 'conversations')

    //CHANGE DATA ON NAME CHANGE
    useEffect(() => {
      
        if (!initialRender.current) {
            setData({...data, val:'', op:typesMap[(operationTypesDict as any)[data.col].type][0]})
            initialRender.current = false
        }
    },[data.col])
 
    //IS HOVERING
    const [isHovering, setIsHovering] = useState<boolean>(false)

    //BOOLEAN TO CONTROL THE VISIBILITY OF THE LIST AND CLOSE ON OUTSIDE CLICK
    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const [showList, setShowList] = useState<boolean>(false)
    useOutsideClick({ref1:buttonRef, ref2:boxRef, containerRef:scrollRef, onOutsideClick:setShowList})

    //BOX POSITION LOGIC, TO SHOW IT UP OR DOWN OF THE INPUT, DEPENDING ON THE POSITION
    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef, setBoxStyle, changeVariable:showList})

    
    const getValue = (inputType:string, value:any) => {

        switch(inputType) {
            case 'user_id':
                {
                    let usersDict:{[key:string]:string} = {}
                    if (auth.authData.users) Object.keys(auth.authData?.users).map((key:any) => {if (auth?.authData?.users) usersDict[key] = auth?.authData?.users[key].name})
                    usersDict['no_user'] = t('NoAgent')
                    usersDict['matilda'] = 'Matilda'
                    return usersDict?.[value] || ''
                }
            case 'theme_id':
                    {
                        let themesDict:{[key:string]:string} = {}
                        auth.authData?.themes.map((theme:any) => {themesDict[theme.id] =  theme.name })
                
                        return themesDict?.[value] || ''
                    }
            case 'channel_type':
                return t(value)
            case 'channel_id':
                const channels = auth.authData?.channels || []
                return channels?.find(channel => channel?.id === value)?.name || ''        
 
            case 'is_transferred':
            case 'is_csat_opened':
            case 'is_nps_opened':
                return value?t('true'):t('false')

            case 'created_at':
            case 'updated_at':
            case 'solved_at':
            case 'closed_at':{

                const datesMap =  {'Today':t('Today'), 'Yesterday':t('Yesterday'), 'Past 1 week':t('1Week'), 'Past 1 month':t('1Month'), 'Past 3 months':t('3Month'), 'Past 6 months':t('6Month'), 'Past 1 year':t('1Year')}

                return (datesMap as any)?.[value] || ''
            }
            default: 
                return value
            }
        }

   return(
        <>
            <Flex display={'inline-flex'} h='28px' position={'relative'} ref={buttonRef} p='7px'  color={showList ? 'text_blue':'black'} bg={showList ? 'gray_2':'transparent'} cursor={'pointer'} alignItems={'center'} justifyContent={'space-between'} _hover={{color:'text_blue'}} onClick={()=> setShowList(true)} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                {isAction ?  
                    <Text fontWeight={'medium'} fontSize={'.8em'}>{(operationLabelsMap as any)[data.op as string].toLocaleLowerCase()} {operationTypesDict[data?.col].name}  {typeof(getValue(data?.col, data?.val)) === 'string' ? getValue(data?.col, data?.val).toLocaleLowerCase():data?.val}</Text>
                    :
                    <Text fontWeight={'medium'} fontSize={'.8em'}>{operationTypesDict[data?.col].name} {(operationLabelsMap as any)[data.op as string]?.toLocaleLowerCase()} {typeof(getValue(data?.col, data?.val)) === 'string' ? getValue(data?.col, data?.val).toLocaleLowerCase():data?.val}</Text>
                }   

                <Flex alignItems={'center'} opacity={isHovering ? 1:0} transform={isHovering ? 'scale(1)':'scale(0.8)'} transition={'opacity .2s ease-in-out, transform .2s ease-in-out'} justifyContent={'center'}bg={showList ? 'gray_2':'white'}  backdropFilter="blur(1px)"  px='5px' position={'absolute'} right={'0px'} > 
                    <Icon boxSize={'14px'} as={RxCross2} onClick={(e) => {e.stopPropagation(); if (deleteFunc) deleteFunc()}}/>
                </Flex>
            </Flex>
            <AnimatePresence> 
                {showList && 
                    <Portal>
                        <MotionBox id='custom-portal-2'  initial={{ opacity: 0, marginTop:-10, marginBottom:-10 }} animate={{ opacity: 1, marginTop: 0,marginBottom:0 }}  exit={{ opacity: 0,marginTop:-10,marginBottom:-10}} transition={{ duration: '.2', ease: 'easeOut'}}
                        top={boxStyle.top}  onClick={(e) => e.stopPropagation()}  bottom={boxStyle.bottom}transform={`translateY(${boxStyle.top ? '35px' : '-35px'})`} marginTop='10px' marginBottom='10px' left={boxStyle.left} width={boxStyle.width} right={boxStyle.right} minW={'300px'} maxW={'500px'}  overflow={'hidden'} gap='10px' ref={boxRef} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.5rem'} >
                            <Box p='15px' alignItems={'center'} gap='10px' >
                                <Box mb='2vh' flex='1'> 
                                    <CustomSelect fontSize={'.8em'} onlyOneSelect markSelect options={customOptions?  Object.keys(labelsMap) :listStructure[selectedSection] } selectedItem={data.col as any} labelsMap={labelsMap} setSelectedItem={(value) => setData({...data, col:value as string})}/>
                                </Box>
                                {(( typesMap[operationTypesDict[data.col].type] || [])).map((op, opIndex) => (
                                    <Box mt='1vh' key={`operation-${opIndex}`}>
                                        <Flex mb='.5vh'   gap='10px' alignItems={'center'}>
                                            <Radio isChecked={data.op === op} onClick={() => setData({...data, 'op':op})}/>
                                            <Text fontWeight={'medium'}  color={'text_gray'} fontSize={'.8em'}>{(operationLabelsMap as any)[op as string]}</Text>
                                        </Flex>
                                        {data.op === op && 
                                        <Box ml='27px' mt='10px'>
                                            <VariableTypeChanger fontSize={'.8em'} customType={operationTypesDict[data.col].is_custom} inputType={operationTypesDict[data.col].is_custom ? operationTypesDict[data.col].type : data.col as string} value={data.val} setValue={(value) => setData({...data, 'val':value})} operation={data.op}/>
                                        </Box>}
                                    </Box>
                                ))}
                            </Box>
                            <Flex py='10px' justifyContent={'center'} borderTopColor={'border_color'} borderTopWidth={'1px'}>
                                <Text cursor={'pointer'} _hover={{color:'rgb(59, 90, 246, 0.9)'}} onClick={() => setShowList(false)} fontWeight={'medium'} color='text_blue'>{t('Ready')}</Text>
                            </Flex>
                        </MotionBox>
                    </Portal>}
            </AnimatePresence> 
        </>)
}

export default EditStructure
