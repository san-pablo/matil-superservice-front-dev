//REACT
import { useState, useRef, RefObject, CSSProperties, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../AuthContext'
//FRONT
import { Text, Box, Flex, Icon } from '@chakra-ui/react'
import CustomSelect from './CustomSelect'
//FUNCTIONS
import useOutsideClick from '../../Functions/clickOutside'
import determineBoxStyle from '../../Functions/determineBoxStyle'
//ICONS
import { IconType } from 'react-icons'
import { FaBookmark, FaFolder, FaLock, FaFilePdf, FaFileLines, FaPeopleLine, FaTag , FaBuilding,  FaBell, FaRobot} from "react-icons/fa6"
import { IoMdMail, IoLogoWhatsapp } from "react-icons/io"
import { IoChatboxEllipses, IoPerson, IoBook, IoChatbubbles, IoPeopleSharp } from "react-icons/io5"
import { AiFillInstagram } from "react-icons/ai"
import { FaPhone } from "react-icons/fa"
import { FaCalendar, FaLanguage } from "react-icons/fa6"
import { PiDesktopTowerFill } from 'react-icons/pi'
import { BiWorld } from "react-icons/bi"
import { RxCross2 } from 'react-icons/rx'
import { ImBlocked } from "react-icons/im"
//TYPING
import { languagesFlags } from '../../Constants/typing'

//TYPING
interface FilterButtonProps {
    selectedSection:string
    selectedElements: Array<string>
    setSelectedElements: (value:string[]) => void
    containerRef?: RefObject<HTMLDivElement>
    deleteFilter?:() => void
}

//MAIN FUNCTION
const FilterButton = ({selectedSection, selectedElements, setSelectedElements, containerRef, deleteFilter}: FilterButtonProps) =>{

    const { t } = useTranslation('settings')
    const auth = useAuth()

    let subjectsDict:{[key:number]:[string, null]} = {}
    if (auth.authData?.themes) auth.authData?.themes.map((theme:any) => {if (auth?.authData?.themes) subjectsDict[theme.id] = [theme.name, theme.emoji]})

    let teamsDict:{[key:number]:[string, null]} = {}
    if (auth.authData?.teams) auth.authData?.teams.map((team:any) => {if (auth?.authData?.teams) teamsDict[team.id] = [team.name, team.emoji]})

    let tagsDict:{[key:number]:string} = {}
    if (auth.authData?.tags) auth.authData?.tags.map((tag:any) => {if (auth?.authData?.tags) tagsDict[tag.id] = tag.name})


    let usersDict:{[key:string]:[string, null]} = {}
    if (auth.authData.users) Object.keys(auth.authData?.users).map((key:any) => {if (auth?.authData?.users) usersDict[key] = [auth?.authData?.users[key].name, null]})
    usersDict['no_user'] = [t('NoAgent'), null]
    usersDict['matilda'] = ['Matilda', null]

    const datesMap:{[key:string]: string} =  {'today':t('today'), 'yesterday':t('yesterday'), '7_days':t('weekAgo'), '30_days':t('monthAgo')}
    const articlesMap:{[key in 'internal_article' | 'public_article' | 'folder' | 'pdf' | 'snippet' |  'website']: [string, ReactElement]} = { 
        'internal_article':[ t('internal_article'), <FaLock size={'14px'}   color='text_gray'/>],
        'public_article':[ t('public_article'), <IoBook size={'14px'}   color='text_gray'/> ], 
        'pdf':[ t('pdf'), <FaFilePdf  size={'14px'}  color='text_gray'/>], 
        'snippet':[ t('snippet'), <FaFileLines  size={'14px'}   color='text_gray'/>],
        'folder':[ t('folder'), <FaFolder  size={'14px'}   color='text_gray'/>],
        'website':[ t('website'), <BiWorld  size={'14px'}  color='text_gray'/>]
    }


    const [customSectionsMap, setCustomSectionsMap] = useState<{[key:string]:string}>({})

    console.log(customSectionsMap)
    const sectionsToFetch = ['person_id', 'business_id']
    const selectorTypeDefinition:{[key:string]:{icon:IconType, message:string, labelsMap?:{[key:string | number]:string}, optionsMap?:{[key:string | number]:[string, ReactElement | string | null]}}} = {
        
        person_id:{icon:IoPeopleSharp, message:t('PersonMessage'), optionsMap:{}},
 
        theme_id:{icon:FaBookmark, message:t('ThemeMessage'), optionsMap:subjectsDict},
        team_id:{icon:FaPeopleLine, message:t('TeamMessage'), optionsMap:teamsDict},

        created_at:{icon:FaCalendar, message:t('CreatedMessage'), labelsMap:datesMap},
        updated_at:{icon:FaCalendar, message:t('UpdatedMessage'), labelsMap:datesMap},
        closed_at:{icon:FaCalendar, message:t('ClosedMessage'), labelsMap:datesMap},
        solved_at:{icon:FaCalendar, message:t('SolvedMessage'), labelsMap:datesMap},
        last_interaction_at:{icon:FaCalendar, message:t('LastInteractionMessage'), labelsMap:datesMap},
       
        user_id:{icon:IoPerson, message:t('UserMessage'), optionsMap:usersDict},
        unseen_changes:{icon:FaBell, message:t('UnseenChanges'), labelsMap:{true:t('true'), false:t('false')}},

        created_by:{icon:IoPerson, message:t('UserCreatedMessage'), optionsMap:usersDict},
        updated_by: {icon:IoPerson, message:t('CreatedByMessage'), optionsMap:usersDict},
        channel_type:{icon:PiDesktopTowerFill, message:t('ChannelTypeMessage'), optionsMap:{'email':[t('email'), <IoMdMail/>], 'whatsapp':[t('whatsapp'),<IoLogoWhatsapp/>], 'instagram':[t('instagram'),<AiFillInstagram/> ], 'webchat':[t('webchat'), <IoChatboxEllipses/>], 'phone':[t('phone'),<FaPhone/> ] }},
        channel_id:{icon:IoChatbubbles, message:t('ChannelMessage'), optionsMap:{}},
        tags:{icon:FaTag, message:t('TagMessage'), labelsMap:tagsDict},
        language:{icon:FaLanguage, message:t('LanguageMessage'), optionsMap:languagesFlags},
        
        type: {icon:PiDesktopTowerFill, message:t('SourceFilterMessage'), optionsMap:articlesMap},
        business_id: {icon:FaBuilding, message:t('ContactBusiness'), optionsMap:articlesMap},
        is_blocked: {icon:ImBlocked, message:t('Business'), optionsMap:{'true':[t('is_blocked'), <></>], 'false':[t('Active'), <></>],}},
    }

    //IS HOVERING
    const [isHovering, setIsHovering] = useState<boolean>(false)

    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const [showList, setShowList] = useState(false)
    useOutsideClick({ref1:buttonRef, ref2:boxRef,containerRef, onOutsideClick:setShowList})

    //BOX POSITION LOGIC, TO SHOW IT UP OR DOWN OF THE INPUT, DEPENDING ON THE POSITION
    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef:buttonRef, setBoxStyle,  changeVariable:selectedElements})

    console.log(selectedSection)
    console.log(selectedElements)

    //FRONT
    return (
        <Box> 
            <Flex pos='relative' onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} whiteSpace={'normal'} flexGrow={1}  ref={buttonRef} overflow={'hidden'} transition='width .1s ease-out'  h='24px'alignItems={'center'} cursor={'pointer'} bg='gray_2' fontWeight='medium' gap='7px' px='7px' borderRadius={'.5rem'}  onClick={() => {setShowList(!showList)}} color={showList?'text_blue':'text_gray'} _hover={{color:'text_blue'}}>
                <Icon boxSize='12px'as={selectorTypeDefinition[selectedSection].icon && selectorTypeDefinition[selectedSection].icon}/>
   
                    <Text fontSize={'.8em'} whiteSpace={'nowrap'}>
                    {selectorTypeDefinition[selectedSection].message + ' '} 
                    {
                        selectedElements.length > 0 ? (
                        selectedElements.length === 1 ?

                     
                            sectionsToFetch.includes(selectedSection) ? customSectionsMap?.[selectedElements[0]] || '' :   selectorTypeDefinition[selectedSection]?.optionsMap ? selectorTypeDefinition[selectedSection]?.optionsMap[selectedElements[0]][0] : selectorTypeDefinition[selectedSection]?.labelsMap[selectedElements[0]]
                            :
                            selectedElements.slice(0, -1).map(el => sectionsToFetch.includes(selectedSection) ? customSectionsMap?.[el] || ''  :  selectorTypeDefinition[selectedSection]?.optionsMap?.[el][0] || selectorTypeDefinition[selectedSection]?.labelsMap[el]).join(', ') + 

                            ` ${t('And')} ` +  (  sectionsToFetch.includes(selectedSection) ? customSectionsMap?.[selectedElements[selectedElements.length - 1]] || '' : (selectorTypeDefinition[selectedSection]?.optionsMap) ? selectorTypeDefinition[selectedSection]?.optionsMap?.[selectedElements[selectedElements.length - 1]][0] : selectorTypeDefinition[selectedSection].labelsMap[selectedElements[selectedElements.length - 1]])
                         ) : 
                        ' ' + t('any') 
                    }
                    </Text> 
        
                    <Flex alignItems={'center'} opacity={isHovering ? 1:0} transform={isHovering ? 'scale(1)':'scale(0.8)'} transition={'opacity .2s ease-in-out, transform .2s ease-in-out'} justifyContent={'center'}bg={'gray_2'} backdropFilter="blur(1px)"  px='5px' position={'absolute'} right={'0px'} > 
                        <Icon boxSize={'14px'} as={RxCross2} onClick={(e) => {e.stopPropagation(); if (deleteFilter) deleteFilter()}}/>
                    </Flex>

            </Flex>
        
                
            {showList &&  
            <Box ref={boxRef} >
                <CustomSelect onlyOneSelect={false} fontSize='.8em' setCustomSectionsMap={setCustomSectionsMap} options={Object.keys((selectorTypeDefinition[selectedSection]?.optionsMap || selectorTypeDefinition[selectedSection]?.labelsMap))} labelsMap={selectorTypeDefinition[selectedSection].labelsMap} iconsMap={selectorTypeDefinition[selectedSection].optionsMap}  customImport={sectionsToFetch.includes(selectedSection) ? selectedSection as any: null } selectedItem={selectedElements} setSelectedItem={setSelectedElements as any} alwaysExpanded/>
            </Box>}
        </Box>
    )
}

export default FilterButton