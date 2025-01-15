/*
    MAKE A FILTER BUTTON LIKE INTERCOM.
*/


//REACT
import { useState, useRef, useEffect, RefObject, CSSProperties, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../AuthContext'

//FRONT
import { motion, isValidMotionProp, AnimatePresence } from 'framer-motion'
import { Text, Box, Flex, Icon, Portal, chakra, shouldForwardProp } from '@chakra-ui/react'
//FUNCTIONS
import useOutsideClick from '../../Functions/clickOutside'
import determineBoxStyle from '../../Functions/determineBoxStyle'
//ICONS
import { IconType } from 'react-icons'
import { FaCheck } from "react-icons/fa"
import { IoMdAlert, IoIosCheckmarkCircle } from "react-icons/io"
import { FaBookmark } from "react-icons/fa6"
import { PiTrayArrowDownFill, PiTrayArrowUpFill } from "react-icons/pi"
import { HiMiniEllipsisHorizontalCircle } from "react-icons/hi2"
import { BiSolidPhoneCall } from "react-icons/bi"
import { IoMdMail, IoLogoWhatsapp } from "react-icons/io"
import { IoChatboxEllipses, IoLogoGoogle, IoPerson } from "react-icons/io5"
import { AiFillInstagram } from "react-icons/ai"
import { FaPhone } from "react-icons/fa"
import { FaStar, FaCalendar, FaLanguage } from "react-icons/fa6"
import { PiDesktopTowerFill } from 'react-icons/pi'
//TYPING
import { languagesFlags } from '../../Constants/typing'

//TYPING
interface FilterButtonProps {
    selectedSection:'theme' | 'urgency_rating' | 'status' | 'created_at' | 'updated_at' | 'user_id' | 'channel_type' | 'language'
    selectedElements: Array<string>
    setSelectedElements: (value:string) => void
    containerRef?: RefObject<HTMLDivElement>
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

 

//MAIN FUNCTION
const FilterButton = ({selectedSection, selectedElements, setSelectedElements, containerRef}: FilterButtonProps) =>{

    const { t } = useTranslation('settings')
    const auth = useAuth()

    let subjectsDict:{[key:number]:[string, null]} = {}
    if (auth.authData?.conversation_themes) auth.authData?.conversation_themes.map((theme:any) => {if (auth?.authData?.conversation_themes) subjectsDict[theme] = [theme, null]})

    let usersDict:{[key:string]:[string, null]} = {}
    if (auth.authData.users) Object.keys(auth.authData?.users).map((key:any) => {if (auth?.authData?.users) usersDict[key] = [auth?.authData?.users[key].name, null]})
    usersDict['no_user'] = [t('NoAgent'), null]
    usersDict['matilda'] = ['Matilda', null]

    const statesMap: Record<string, [string, ReactElement]> = {
        'open':[t('open'),<PiTrayArrowDownFill size={'16px'} color='#C53030'/>],
        'closed':[t('closed'),<PiTrayArrowUpFill size={'16px'} color='#4A5568'/>],
        'solved':[t('solved'),<IoIosCheckmarkCircle color='#2F855A' size='16px'/>],
        'new':[t('new'), <IoMdAlert color='#B7791F'  size='16px'/>],
        'pending':[t('pending'),<HiMiniEllipsisHorizontalCircle size='16px' color='#00A3C4' />],
        'completed':[t('completed'),<IoIosCheckmarkCircle color='#2F855A' size='16px'/>],
        'ongoing':[t('ongoing'),<BiSolidPhoneCall color='#00A3C4' size='16px'/>],
     }

    const selectorTypeDefinition:{[key:string]:{icon:IconType, message:string, optionsMap:{[key:string | number]:[string, ReactElement | string | null]}}} = {
        theme:{icon:FaBookmark, message:t('ThemeMessage'), optionsMap:subjectsDict},
        urgency_rating:{icon:FaStar, message:t('RatingMessage'), optionsMap:{0:[`${t('Priority_0')} (0)`, null], 1:[`${t('Priority_1')} (1)`, null], 2:[`${t('Priority_2')} (2)`, null], 3:[`${t('Priority_3')} (3)`, null], 4:[`${t('Priority_4')} (4)`, null]}} ,
        status:{icon:FaBookmark, message:t('StatusMessage'), optionsMap:statesMap},
        created_at:{icon:FaCalendar, message:t('CreatedMessage'), optionsMap:subjectsDict},
        updated_at:{icon:FaCalendar, message:t('UpdatedMessage'), optionsMap:subjectsDict},
        user_id:{icon:IoPerson, message:t('UserMessage'), optionsMap:usersDict},
        channel_type:{icon:PiDesktopTowerFill, message:t('ChannelMessage'), optionsMap:{'email':[t('email'), <IoMdMail/>], 'whatsapp':[t('whatsapp'),<IoLogoWhatsapp/>], 'instagram':[t('instagram'),<AiFillInstagram/> ], 'webchat':[t('webchat'), <IoChatboxEllipses/>], 'google_business':[t('google_business'), <IoLogoGoogle/>], 'phone':[t('phone'),<FaPhone/> ] }},
        language:{icon:FaLanguage, message:t('LanguageMessage'), optionsMap:languagesFlags},
    }


    //SHOW AND WIDTH LIST LOGIC
    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const [showList, setShowList] = useState(false)
    useOutsideClick({ref1:buttonRef, ref2:boxRef,containerRef, onOutsideClick:setShowList})

    //BOX POSITION LOGIC, TO SHOW IT UP OR DOWN OF THE INPUT, DEPENDING ON THE POSITION
    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef, setBoxStyle, boxPosition:'none', changeVariable:selectedElements})

 
    //FRONT
    return (
        <Box> 
            <Flex whiteSpace={'normal'} height={'33px'} alignItems={'center'} cursor={'pointer'} bg='brand.gray_2' fontWeight='medium' gap='7px' px='7px' borderRadius={'.5rem'} fontSize={'1em'} ref={buttonRef} onClick={() => {setShowList(!showList)}} _hover={{color:'brand.text_blue'}}>
                {selectorTypeDefinition[selectedSection].icon && <> {selectorTypeDefinition[selectedSection].icon}</>}
                <Text fontSize={'.9em'} whiteSpace={'nowrap'}>
                {selectorTypeDefinition[selectedSection].message + ' '} 
                {
                    selectedElements.length > 0 ? (
                    selectedElements.length === 1 ?
                        selectorTypeDefinition[selectedSection].optionsMap[selectedElements[0]][0]:
                        selectedElements.slice(0, -1).map(el => selectorTypeDefinition[selectedSection].optionsMap[el][0]).join(', ') + 
                        ` ${t('And')} ` + selectorTypeDefinition[selectedSection].optionsMap[selectedElements[selectedElements.length - 1]][0]
                    ) : 
                    ' ' + t('any') 
                }
                </Text>            
            </Flex>
            <AnimatePresence> 
                {showList &&  
                <Portal> 
                    <MotionBox ref={boxRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                        style={{ transformOrigin: boxStyle.top ? 'top':'bottom' }}  fontSize={'.8em'} width={boxStyle.width} left={boxStyle.left} marginTop={'5px'} marginBottom={'5px'}  top={boxStyle.top || undefined}  bottom={boxStyle.bottom ||undefined} position='absolute' bg='white' p='8px'  zIndex={1000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='gray.200' borderWidth='1px' borderRadius='.7rem'>

                        {Object.keys(selectorTypeDefinition[selectedSection]).map((element, index) => (
                            <Flex key={`select-list-${index}`} borderRadius={'.5rem'}color={selectedElements.includes(element)?'brand.text_blue':'black'} p='7px' cursor='pointer' onClick={()=>{setSelectedElements(element)}} gap='10px'  justifyContent={'space-between'} alignItems={'center'} _hover={{bg:'brand.gray_2'}}>
                                <Flex alignItems={'center'} gap='10px'> 
                                    {selectorTypeDefinition[selectedSection].optionsMap[element][1] && <> {selectorTypeDefinition[selectedSection].optionsMap[element][1]} </>}
                                    <Text> {selectorTypeDefinition[selectedSection].optionsMap[element][0]}</Text>
                                </Flex>
                                {selectedElements.includes(element) && <Icon as={FaCheck} color={'brand.text_blue'}/>}
                            </Flex>
                        ))}
                    </MotionBox>
                </Portal>}
            </AnimatePresence>
        </Box>
    )
}

export default FilterButton