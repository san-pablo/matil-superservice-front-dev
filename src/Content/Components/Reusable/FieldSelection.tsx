/* 
    CUSTOM SELECTOR
*/

//REACT
import { useState, useRef, RefObject, CSSProperties, useEffect, Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../AuthContext.js'
import { useAuth0 } from '@auth0/auth0-react'
//FETCH DATA
import fetchData from '../../API/fetchData'
//FRONT
import { Flex, Text, Box, Icon, Portal,  chakra, shouldForwardProp } from '@chakra-ui/react'
import { motion, AnimatePresence, isValidMotionProp  } from 'framer-motion'
import '../styles.css'
//FUNCTIONS
import determineBoxStyle from '../../Functions/determineBoxStyle'
import useOutsideClick from '../../Functions/clickOutside'
//ICONS
import { IconType } from "react-icons"
import { FaTicket, FaBuilding } from "react-icons/fa6"
import { IoPeopleSharp } from "react-icons/io5"
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io"
import { BiSolidCustomize } from "react-icons/bi"
//TYPING
import { CDAsType } from '../../Constants/typing.js'

//TYPING
type StructuresType = 'conversations' | 'contacts' | 'contact_businesses' 
interface FieldSelectiontProps { 
    selectedItem: {col:string, op:string, val:any}
    setSelectedItem: (newData:{col:string, op:string, val:any}) => void
    containerRef?: RefObject<HTMLDivElement>
    setCustomType:Dispatch<SetStateAction<string>>
    excludedFields?:(StructuresType | 'custom')[]
}
 
//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})


//MAIN FUNCTION
const FieldSelection = ({selectedItem, setSelectedItem, containerRef, setCustomType, excludedFields}: FieldSelectiontProps) => {

    //TRANSLATION
    const { t } = useTranslation('settings')
    const { getAccessTokenSilently } = useAuth0()
    const auth = useAuth()
    const structuresMap:{[key in StructuresType  | 'custom']:[string, IconType]} = {'conversations':[t('Conversations'), FaTicket],  'contacts':[t('Client'), IoPeopleSharp], 'contact_businesses':[t('Business'), FaBuilding], 'custom':[t('Customizable'), BiSolidCustomize]}

    //REFS
    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const structureRef = useRef<HTMLDivElement>(null)

    //SHOW THE SECTION HOVERED
    const [sectionHovered, setSectionHovered] = useState<StructuresType | 'custom' | ''>('')

    //FETCH CUSTOM FIELDS ATRIBUTES
    const [customFields, setCustomFields] = useState<CDAsType[]>([])
    useEffect(() => {        
        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/custom_attributes`, getAccessTokenSilently, auth})
            if (response?.status === 200) {
                setCustomFields(response.data)
                setCustomType((response?.data || []).find((element:any) => element?.name === selectedItem?.col)?.type || '')
            }
        }
        if (auth.authData.customAttributes) setCustomFields(auth.authData.customAttributes)
        else fetchInitialData()
    }, [])
 
    //BOOLEAN TO CONTROL THE VISIBILITY OF THE LIST AND CLOSE ON OUTSIDE CLICK
    const [showList, setShowList] = useState<boolean>(false)
    useOutsideClick({ref1:buttonRef, ref2:boxRef, containerRef, onOutsideClick:setShowList})

    //BOX POSITION LOGIC, TO SHOW IT UP OR DOWN OF THE INPUT, DEPENDING ON THE POSITION
    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef, setBoxStyle, boxPosition:'none', changeVariable:showList})

    //FIELDS CLASESS BOX
    const FieldBox = () => { 
        
        //MAPPING CONSTANTS
        const conversationsList = ['user_id', 'group_id', 'channel_type', 'title', 'theme_uuid', 'team_uuid', 'urgency_rating', 'status', 'unseen_changes', 'tags', 'is_matilda_engaged', 'is_csat_offered', 'hours_since_created', 'hours_since_updated']
        const clientsList = ['contact_business_id', 'name', 'language', 'rating', 'notes', 'labels', 'hours_since_created', 'hours_since_updated']
        const businessList = ['name', 'domain', 'notes', 'labels', 'hours_since_created', 'hours_since_updated']
        const listStructure = {'conversations':conversationsList, 'contacts':clientsList, 'contact_businesses':businessList, 'custom':customFields.filter(struct => !excludedFields?.includes(struct.structure))}

        return (<>
        {listStructure[sectionHovered as StructuresType | 'custom'].length === 0 ? 
        <Flex px='10px'  py='7px' > 
        <Text>{t('NoCustomAttributes')}</Text>
        </Flex>:
            <>{listStructure[sectionHovered as StructuresType | 'custom'].map((option:any, index:number) => (
                <Flex position={'relative'} key={`name-${index}`} px='10px'  py='7px' cursor={'pointer'} justifyContent={'space-between'} alignItems={'center'} _hover={{bg:'brand.hover_gray'}}
                    onClick={() => {setShowList(false);setCustomType(sectionHovered === 'custom'?option.type:'');setSelectedItem({...selectedItem, col:sectionHovered === 'custom'?option.uuid:option})}}>
                    <Flex gap='5px' alignItems={'end'}>
                        <Text >{t(sectionHovered === 'custom'?option.name:option)}</Text>
                        <Text color={'gray.600'} fontSize={'.7em'}>{sectionHovered === 'custom'?(t(option.motherstructure)):''}</Text>
                    </Flex>
                </Flex>
            ))}</>
        }
        </>)
    }

    //FRONT
    return(
        <Box position={'relative'}>
            <Flex bg={'transaprent'} cursor={'pointer'} alignItems={'center'} ref={buttonRef} height={'37px'} fontSize={'.9em'}  onClick={() => setShowList(!showList)} border={showList ? "3px solid rgb(77, 144, 254)": "1px solid #CBD5E0"} justifyContent={'space-between'} px={showList?'11px':'13px'} py={showList ? "5px" : "7px"} borderRadius='.5rem' _hover={{border:showList?'3px solid rgb(77, 144, 254)':'1px solid #CBD5E0'}}>
                <Text color={'black'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{t(selectedItem.col)}</Text>
                <IoIosArrowDown className={showList ? "rotate-icon-up" : "rotate-icon-down"}/>
            </Flex>
            <AnimatePresence> 
                {showList && 
                    <Portal>
                        <MotionBox id='custom-portal' initial={{ opacity: 0, marginTop: -10, marginBottom:-10}} animate={{ opacity: 1, marginTop: 0, marginBottom:0 }}  exit={{ opacity: 0,marginTop:-10, marginBottom:-10}} transition={{ duration: '.2', ease: 'easeOut'}}
                        top={boxStyle.top} bottom={boxStyle.bottom} left={boxStyle.left} minW={'200px'} width={boxStyle.width} maxH='40vh' gap='10px' ref={boxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.300'}>
                            {Object.keys(structuresMap).filter(key => !(excludedFields || []).includes(key as any)).map((option, index) => (
                                <Flex ref={structureRef} position={'relative'}  key={`${selectedItem}-option-${index}`} px='10px'  py='7px' cursor={'pointer'} justifyContent={'space-between'} alignItems={'center'} _hover={{bg:'brand.hover_gray'}}
                                    onMouseEnter={() => setSectionHovered(option as StructuresType | 'custom')} onMouseLeave={() => setSectionHovered('')}>
                                    <Flex gap='5px' alignItems={'center'}>
                                        <Icon as={structuresMap[option as StructuresType | 'custom'][1]}/>
                                        <Text>{structuresMap[option as StructuresType | 'custom'][0]}</Text>
                                    </Flex>
                                    <Icon as={IoIosArrowForward}/>
                                    {(sectionHovered === option) && 
                                        <MotionBox   initial={{ opacity: 0, marginLeft: -20 }} animate={{ opacity: 1, marginLeft:-10 }}  exit={{ opacity: 0, marginLeft:-20}} transition={{ duration: '.2', ease: 'easeOut'}}
                                            position='absolute' maxH={'30vh'} width='250px' overflow={'scroll'} top={boxStyle.top === 'auto'?'auto':0} bottom={boxStyle.top === 'auto'?0:'auto'} left={'100%'} gap='10px'fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.300'}>
                                            <FieldBox/>
                                        </MotionBox>
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

export default FieldSelection