/* 
    CUSTOM SELECTOR
 


//REACT
import { RefObject, useEffect, useState, useRef, CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
//FRONT
import { Flex, Text, Box, Icon, shouldForwardProp, chakra, Portal, Radio } from '@chakra-ui/react'
//COMPONENTS
import CustomSelect from './CustomSelect'
import VariableTypeChanger from './VariableTypeChanger'
import FieldSelection from './FieldSelection'
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion'
//FIELD SECTION
import useOutsideClick from '../../Functions/clickOutside'
import determineBoxStyle from '../../Functions/determineBoxStyle'
//ICONS
import { RxCross2 } from 'react-icons/rx'
//TYPING
import { FieldAction } from '../../Constants/typing'
import { useAuth } from '../../../AuthContext'

 //MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})


//MAIN FUNCTION
const DefaultFieldChanger = ({data, setData, operationTypesDict, typesMap, scrollRef, isAction, excludedFields}:{data:FieldAction, setData:(newData:FieldAction) => void, operationTypesDict:{[key:string]:string[]}, typesMap:{[key:string]:string[]}, scrollRef:RefObject<HTMLDivElement> , isAction?:boolean,     excludedFields?:('conversation' | 'contact' | 'contact_business' | 'custom')[]}) => {

    //TRANSLATION
    const auth = useAuth()
    const { t } = useTranslation('settings')
    const t_con = useTranslation('conversations').t

    const operationLabelsMap = {'set':t('set'), 'add':t('add'), 'substract':t('substract'), 'concatenate':t('concatenate'), 'append':t('append'), 'remove':t('remove'), 'eq':t('eq'), 'exists':t('exists'), 'neq':t('neq'), 'leq':t('leq'), 'geq':t('geq'), 'in':t('in'), 'nin':t('nin'), 'between':t('between'), 'contains':t('contains'), 'ncontains':t('ncontains')}

    //TYPES MAP
    const isCustom = (data.motherstructure !== 'conversation' && data.motherstructure !== 'contact' && data.motherstructure !== 'contact_business' )
    const [customType, setCustomType] = useState<string>('') 

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


    //CHANGE DATA ON NAME CHANGE
    useEffect(() => {
        setData({...data, value:'', operation:isCustom ?typesMap[data.motherstructure][0]:(operationTypesDict[data.name as keyof typeof operationTypesDict] || [])[0]})
    },[data.name])
    
    const getValue = (inputType:string, value:any) => {
        switch(inputType) {
            case 'user_id':
                {
                    let usersDict:{[key:number]:string} = {}
                    if (auth.authData.users) Object.keys(auth.authData?.users).map((key:any) => {if (auth?.authData?.users) usersDict[key] = auth?.authData?.users[key].name})
                    usersDict[0] = t('NoAgent')
                    usersDict[-1] = 'Matilda'
                    return usersDict[value]
                }
            case 'channel_type':
                return t(value)
            case 'theme':
                let subjectsDict:{[key:number]:string} = {}
                if (auth.authData?.conversation_themes) Object.keys(auth.authData?.conversation_themes).map((key:any) => {if (auth?.authData?.conversation_themes) subjectsDict[key] = auth?.authData?.conversation_themes[key]})
                return subjectsDict[value]
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
            case 'is_transferred':
            case 'is_csat_opened':
            case 'is_nps_offered':
                    return value?t('true'):t('false')
            default: 
                return null
                }
    }

   return(
        <>
           <Flex flex='1' position={'relative'} ref={buttonRef} p='7px' borderRadius={'.5rem'} bg='brand.gray_1' cursor={'pointer'} alignItems={'center'} justifyContent={'space-between'} _hover={{color:'brand.text_blue'}} onClick={()=> setShowList(true)} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                {isAction ? 
                    <Text fontWeight={'medium'} fontSize={'.9em'}>{t(data?.name)} {(operationLabelsMap as any)[data?.operation || ''].toLocaleLowerCase()} {getValue(data?.name, data?.value)}</Text>
                    :
                    <Text fontWeight={'medium'} fontSize={'.9em'}>{t(data?.name)} {(operationLabelsMap as any)[data?.operation || ''].toLocaleLowerCase()} {getValue(data?.name, data?.value)}</Text>
                }
                {isHovering && <Icon position={'absolute'} right={'7px'} boxSize={'16px'} as={RxCross2} onClick={(e) => {e.stopPropagation(); editFilter('delete', index)}}/>}
            </Flex>
            <AnimatePresence> 
                {showList && 
                    <Portal>
                        <MotionBox initial={{ opacity: 0, marginTop:-10, marginBottom:-10 }} animate={{ opacity: 1, marginTop: 0,marginBottom:0 }}  exit={{ opacity: 0,marginTop:-10,marginBottom:-10}} transition={{ duration: '.2', ease: 'easeOut'}}
                        top={boxStyle.top}  onClick={(e) => e.stopPropagation()}  bottom={boxStyle.bottom} marginTop='10px' marginBottom='10px' left={boxStyle.left} width={boxStyle.width} maxH='40vh' overflow={'scroll'} gap='10px' ref={boxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.5rem'} >
                            <Box p='15px' alignItems={'center'} gap='10px' >
                                <Box mb='2vh' flex='1'> 
                                    <FieldSelection excludedFields={excludedFields} containerRef={scrollRef} selectedItem={data} setSelectedItem={setData} setCustomType={setCustomType}/>
                                </Box>
                                {(operationTypesDict[data.operation as keyof typeof operationTypesDict] || []).map((op, opIndex) => (
                                    <Box mt='1vh' key={`operation-${opIndex}`}>
                                        <Flex mb='.5vh'   gap='10px' alignItems={'center'}>
                                            <Radio isChecked={data.operation === op}  onClick={() => editFilter('edit', index, {...data, 'operator':op})}/>
                                            <Text fontWeight={'medium'} color='gray.600' fontSize={'.9em'}>{(operationLabelsMap  as any)[op]}</Text>
                                        </Flex>
                                        {data.operation === op && 
                                        <Box ml='30px'>
                                            <VariableTypeChanger variant='styled' customType={customType !== ''}  inputType={customType !== ''?data.motherstructure:data.name} value={data.value} setValue={(value) => setData({...data, 'value':value})} operation={data.operation}/>
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

export default DefaultFieldChanger
*/