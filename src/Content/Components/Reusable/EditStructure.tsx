/* 
    CUSTOM SELECTOR
*/

//REACT
import { RefObject, useEffect, useState, useRef, CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../AuthContext'
import { useSession } from '../../../SessionContext'
//FRONT
import { Flex, Text, Box, chakra, shouldForwardProp, Icon, Portal, Radio } from '@chakra-ui/react'
import { motion, isValidMotionProp, AnimatePresence } from 'framer-motion' 
//COMPONENTS
import VariableTypeChanger from './VariableTypeChanger'
import FieldSelection from './FieldSelection'
//FUCNTIONS
import useOutsideClick from '../../Functions/clickOutside'
import determineBoxStyle from '../../Functions/determineBoxStyle'
//ICONS
import { RxCross2 } from 'react-icons/rx'
//TYPING
import { FieldAction } from '../../Constants/typing'
//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)}) 


const EditStructure = ({data, setData, operationTypesDict, typesMap, scrollRef, isAction, excludedFields, deleteFunc}:{data:FieldAction, setData:(newData:FieldAction) => void, operationTypesDict:{[key:string]:string[]}, typesMap:{[key:string]:string[]}, scrollRef:RefObject<HTMLDivElement> , isAction?:boolean,     excludedFields?:('conversation' | 'contact' | 'contact_business' | 'custom')[], deleteFunc?:() => void}) => {

    //TRANSLATION
    const auth = useAuth()
    const session = useSession()
    const t_con = useTranslation('conversations').t
   
    //TRANSLATION
    const isInitialRender = useRef<boolean>(true)
    const { t } = useTranslation('settings')
    const operationLabelsMap = {'set':t('set'), 'add':t('add'), 'substract':t('substract'), 'concatenate':t('concatenate'), 'append':t('append'), 'remove':t('remove'), 'eq':t('eq'), 'exists':t('exists'), 'neq':t('neq'), 'leq':t('leq'), 'geq':t('geq'), 'in':t('in'), 'nin':t('nin'), 'contains':t('contains'), 'ncontains':t('ncontains')}

    //TYPES MAP
    const isCustom = (data.motherstructure !== 'conversation' && data.motherstructure !== 'contact' && data.motherstructure !== 'contact_business' )
    const [customType, setCustomType] = useState<string>('') 

    //CHANGE DATA ON NAME CHANGE
    useEffect(() => {
        if (!isInitialRender.current) setData({...data, value:'', operation:isCustom ?typesMap[customType][0]:(operationTypesDict[data.name as keyof typeof operationTypesDict] || [])[0]})
        else isInitialRender.current = false
    },[data.name])


    //IS HOVERING
    const [isHovering, setIsHovering] = useState<boolean>(false)

    //BOOLEAN TO CONTROL THE VISIBILITY OF THE LIST AND CLOSE ON OUTSIDE CLICK
    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const [showList, setShowList] = useState<boolean>(false)
    useOutsideClick({ref1:buttonRef, ref2:boxRef, containerRef:scrollRef, onOutsideClick:setShowList})

    //BOX POSITION LOGIC, TO SHOW IT UP OR DOWN OF THE INPUT, DEPENDING ON THE POSITION
    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef, setBoxStyle, boxPosition:'none', changeVariable:showList})

     
 

    const getValue = (inputType:string, value:any) => {
        switch(inputType) {
            case 'user_id':
                {
                    let usersDict:{[key:string]:string} = {}
                    if (auth.authData.users) Object.keys(auth.authData?.users).map((key:any) => {if (auth?.authData?.users) usersDict[key] = auth?.authData?.users[key].name})
                    usersDict['no_user'] = t('NoAgent')
                    usersDict['matilda'] = 'Matilda'
                    return usersDict[value]
                }
            case 'channel_type':
                return t(value)
            case 'channel_id':
                const channels = session?.sessionData?.additionalData?.channels || []
                return channels?.find(channel => channel?.id === value)?.name || ''
    
            case 'urgency_rating':
                const ratingMapDic = {0:`${t('Priority_0')} (0)`, 1:`${t('Priority_1')} (1)`, 2:`${t('Priority_2')} (2)`, 3:`${t('Priority_3')} (3)`, 4:`${t('Priority_4')} (4)`}
                return (ratingMapDic as any)[value]
            
            case 'status':
                const statusMapDic = {'new':t_con('new'), 'open':t_con('open'), solved:t_con('solved'), 'pending':t_con('pending'), 'closed':t_con('closed')}
                return (statusMapDic as any)[value] 
            case 'is_transferred':
            case 'is_csat_opened':
            case 'is_nps_opened':
                return value?t('true'):t('false')

            case 'created_at':
            case 'updated_at':
            case 'solved_at':
            case 'closed_at':{
                const [startDate, endDate] = value.split(' to ')
            
                return (startDate && endDate) ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`:'-'
            }
            default: 
                return value
            }
        }

   return(
        <>
            <Flex display={'inline-flex'} position={'relative'} ref={buttonRef} p='7px' borderRadius={'.5rem'} bg='brand.gray_2' cursor={'pointer'} alignItems={'center'} justifyContent={'space-between'} _hover={{color:'brand.text_blue'}} onClick={()=> setShowList(true)} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                {isAction ?  
                    <Text fontWeight={'medium'} fontSize={'.9em'}>{(operationLabelsMap as any)[data.operation as string].toLocaleLowerCase()} {t(data?.name) || ''}  {getValue(data?.name, data?.value)}</Text>
                    :
                    <Text fontWeight={'medium'} fontSize={'.9em'}>{t(data?.name) || ''} {(operationLabelsMap as any)[data.operation as string]?.toLocaleLowerCase()} {getValue(data?.name, data?.value)}</Text>
                }   
                {isHovering && 
                <Flex alignItems={'center'} justifyContent={'center'} bg={'brand.gray_2'} backdropFilter="blur(1px)"  px='5px' position={'absolute'} right={'7px'} > 
                <Icon boxSize={'16px'} as={RxCross2} onClick={(e) => {e.stopPropagation(); if (deleteFunc) deleteFunc()}}/>
                </Flex>}

            </Flex>
            <AnimatePresence> 
                {showList && 
                    <Portal>
                        <MotionBox initial={{ opacity: 0, marginTop:-10, marginBottom:-10 }} animate={{ opacity: 1, marginTop: 0,marginBottom:0 }}  exit={{ opacity: 0,marginTop:-10,marginBottom:-10}} transition={{ duration: '.2', ease: 'easeOut'}}
                        top={boxStyle.top}  onClick={(e) => e.stopPropagation()}  bottom={boxStyle.bottom} marginTop='10px' marginBottom='10px' left={boxStyle.left} width={boxStyle.width} minW={'300px'} maxW={'500px'} maxH='40vh' overflow={'scroll'} gap='10px' ref={boxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.5rem'} >
                            <Box p='15px' alignItems={'center'} gap='10px' >
                                <Box mb='2vh' flex='1'> 
                                 <FieldSelection  excludedFields={excludedFields} containerRef={scrollRef} selectedItem={data} setSelectedItem={setData} setCustomType={setCustomType}/>
                                </Box>
                                {((operationTypesDict[data.name as keyof typeof operationTypesDict] || [])).map((op, opIndex) => (
                                    <Box mt='1vh' key={`operation-${opIndex}`}>
                                        <Flex mb='.5vh'   gap='10px' alignItems={'center'}>
                                            <Radio isChecked={data.operation === op}  onClick={() => setData({...data, 'operation':op})}/>
                                            <Text fontWeight={'medium'} color='gray.600' fontSize={'.9em'}>{(operationLabelsMap as any)[op as string]}</Text>
                                        </Flex>
                                        {data.operation === op && 
                                        <Box ml='30px'>
                                            <VariableTypeChanger customType={customType !== ''} inputType={customType !== ''?customType:data.name} value={data.value} setValue={(value) => setData({...data, 'value':value})} operation={data.operation}/>
                                        </Box>}
                                    </Box>
                                ))}
                            </Box>
                            <Flex py='10px' justifyContent={'center'} borderTopColor={'gray.200'} borderTopWidth={'1px'}>
                                <Text cursor={'pointer'} _hover={{color:'rgb(59, 90, 246, 0.9)'}} onClick={() => setShowList(false)} fontWeight={'medium'} color='brand.text_blue'>{t('Ready')}</Text>
                            </Flex>
                        </MotionBox>
                    </Portal>}
            </AnimatePresence> 
        </>)
}

export default EditStructure
