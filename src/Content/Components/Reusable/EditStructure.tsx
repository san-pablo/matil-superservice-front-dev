/* 
    CUSTOM SELECTOR
*/

//REACT
import { useState, useRef, RefObject, CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
//FRONT
import { Flex, Text, Box, Icon, Portal,  chakra, shouldForwardProp } from '@chakra-ui/react'
import { motion, AnimatePresence, isValidMotionProp  } from 'framer-motion'
import '../styles.css'
//COMPONENTS
import CustomSelect from './CustomSelect'
import VariableTypeChanger from './VariableTypeChanger'
//FUNCTIONS
import determineBoxStyle from '../../Functions/determineBoxStyle'
import useOutsideClick from '../../Functions/clickOutside'
//ICONS
import { FaTicket, FaBuilding } from "react-icons/fa6"
import { IoPeopleSharp } from "react-icons/io5"
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io"
import { BiSolidCustomize } from "react-icons/bi"
import { IconType } from "react-icons"
//TYPING
import { FieldAction } from '../../Constants/typing'

//TYPING
interface FieldSelectiontProps { 
    selectedItem: FieldAction
    setSelectedItem: (newData:FieldAction) => void
    containerRef?: RefObject<HTMLDivElement>
}
type FieldType = 'ticket' | 'client' | 'contact_business' | 'custom'

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//MAIN FUNCTION
const FieldSelection = ({selectedItem, setSelectedItem,  containerRef}: FieldSelectiontProps) => {

    //TRANSLATION
    const { t } = useTranslation('settings')
    const structuresMap:{[key in FieldType]:[string, IconType]} = {'ticket':[t('Tickets'), FaTicket],  'client':[t('Client'), IoPeopleSharp], 'contact_business':[t('Business'), FaBuilding], 'custom':[t('Customizable'), BiSolidCustomize]}

    //REFS
    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)

    //SHOW THE SECTION HOVERED
    const [sectionHovered, setSectionHovered] = useState<FieldType | ''>('')

    //BOOLEAN TO CONTROL THE VISIBILITY OF THE LIST AND CLOSE ON OUTSIDE CLICK
    const [showList, setShowList] = useState<boolean>(false)
    useOutsideClick({ref1:buttonRef, ref2:boxRef, containerRef, onOutsideClick:setShowList})

    //BOX POSITION LOGIC, TO SHOW IT UP OR DOWN OF THE INPUT, DEPENDING ON THE POSITION
    const [boxPosition, setBoxPosition] = useState<'top' | 'bottom'>('bottom')
    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef, setBoxStyle, setBoxPosition, changeVariable:showList})


    console.log(sectionHovered)
    const FieldBox = () => {
        
        //MAPPING CONSTANTS
        const ticketsList = ['user_id', 'group_id', 'channel_type', 'title', 'subject', 'urgency_rating', 'status', 'unseen_changes', 'tags', 'is_matilda_engaged', 'is_satisfaction_offered', 'hours_since_created', 'hours_since_updated']
        const clientsList = ['contact_business_id', 'name', 'language', 'rating', 'notes', 'labels', 'hours_since_created', 'hours_since_updated']
        const businessList = ['name', 'domain', 'notes', 'labels', 'hours_since_created', 'hours_since_updated']
        
        const listStructure = {'ticket':ticketsList, 'client':clientsList, 'contact_business':businessList, 'custom':businessList}

        return (<>
             {listStructure[sectionHovered as FieldType].map((option, index) => (
                <Flex position={'relative'} key={`name-${index}`} px='10px'  py='7px' cursor={'pointer'} justifyContent={'space-between'} alignItems={'center'} _hover={{bg:'brand.hover_gray'}}
                    onClick={() => setSelectedItem({...selectedItem, name:option, is_customizable:sectionHovered === 'custom', motherstructure:(sectionHovered === 'custom' || sectionHovered === '' )?'ticket':sectionHovered})}>
                    <Flex gap='5px' alignItems={'center'}>
                        <Text>{t(option)}</Text>
                    </Flex>
                </Flex>

            ))}
        </>)
    }

    //FRONT
    return(
        <Box position={'relative'}>
            <Flex bg={'transaprent'} cursor={'pointer'} alignItems={'center'} ref={buttonRef} height={'37px'} fontSize={'.9em'}  onClick={() => setShowList(!showList)} border={showList ? "3px solid rgb(77, 144, 254)": "1px solid #CBD5E0"} justifyContent={'space-between'} px={showList?'11px':'13px'} py={showList ? "5px" : "7px"} borderRadius='.5rem' _hover={{border:showList?'3px solid rgb(77, 144, 254)':'1px solid #CBD5E0'}}>
                <Text color={'black'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{t(selectedItem.name)}</Text>
                <IoIosArrowDown className={showList ? "rotate-icon-up" : "rotate-icon-down"}/>
            </Flex>
            <AnimatePresence> 
                {showList && 
                    <Portal>
                        <MotionBox initial={{ opacity: 0, marginTop: boxPosition === 'bottom'?-10:10 }} animate={{ opacity: 1, marginTop: 0 }}  exit={{ opacity: 0,marginTop: boxPosition === 'bottom'?-10:10}} transition={{ duration: '.2', ease: 'easeOut'}}
                        top={boxStyle.top} bottom={boxStyle.bottom} right={boxStyle.right} width={boxStyle.width} maxH='40vh' overflow={'scroll'} gap='10px' ref={boxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.300'}>
                            {Object.keys(structuresMap).map((option, index) => (
                                <Flex position={'relative'}  key={`${selectedItem}-option-${index}`} px='10px'  py='7px' cursor={'pointer'} justifyContent={'space-between'} alignItems={'center'} _hover={{bg:'brand.hover_gray'}}
                                    onMouseEnter={() => setSectionHovered(option as FieldType)} onMouseLeave={() => setSectionHovered('')}>
                                    <Flex gap='5px' alignItems={'center'}>
                                        <Icon as={structuresMap[option as FieldType][1]}/>
                                        <Text>{structuresMap[option as FieldType][0]}</Text>
                                    </Flex>
                                    <Icon as={IoIosArrowForward}/>
                                    {sectionHovered && 
                                    <Portal>
                                        <MotionBox initial={{ opacity: 0, marginLeft: -10 }} animate={{ opacity: 1, marginLeft:10 }}  exit={{ opacity: 0, marginLeft:-10}} transition={{ duration: '.2', ease: 'easeOut'}}
                                        position='absolute' top={boxRef.current?.getBoundingClientRect().top} left={boxRef.current?.getBoundingClientRect().right} gap='10px'fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.300'}>
                                            <FieldBox/>
                                        </MotionBox>
                                    </Portal>
                                    }
                                </Flex> 
                            ))}
                        </MotionBox>
                    </Portal>
                }
            </AnimatePresence>
        </Box>
    )
}


const EditStructure = ({data, setData, operationTypesDict, scrollRef}:{data:FieldAction, setData:(newData:FieldAction) => void, operationTypesDict:{[key:string]:string[]}, scrollRef:RefObject<HTMLDivElement> }) => {

    //TRANSLATION
    const { t } = useTranslation('settings')
    const operationLabelsMap = {'set':t('set'), 'add':t('add'), 'substract':t('substract'), 'concatenate':t('concatenate'), 'append':t('append'), 'remove':t('remove'), 'eq':t('eq'), 'exists':t('exists'), 'neq':t('neq'), 'leq':t('leq'), 'geq':t('geq'), 'in':t('in'), 'nin':t('nin'), 'contains':t('contains'), 'ncontains':t('ncontains')}

    return(
        <>
            
            <Flex alignItems={'center'} gap='10px'>
                <Box flex='1'> 
                    <FieldSelection selectedItem={data} setSelectedItem={setData}/>
                </Box>
                <Box flex='1'> 
                    <CustomSelect containerRef={scrollRef} hide={false} selectedItem={data.operation} setSelectedItem={(value) => setData({...data, 'operation':value})} options={(operationTypesDict[data.name as keyof typeof operationTypesDict] || [])} labelsMap={operationLabelsMap} />
                </Box>
                <Box flex='1'> 
                    <VariableTypeChanger inputType={data.name} value={data.value} setValue={(value) => setData({...data, 'value':value})}/>
                </Box>
            </Flex>
        </>)
}

export default EditStructure