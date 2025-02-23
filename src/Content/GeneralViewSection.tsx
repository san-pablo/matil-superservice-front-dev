//REACT
import { useState, useEffect, lazy, Dispatch, SetStateAction, useRef, useMemo, Fragment, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../AuthContext"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import fetchData from "./API/fetchData"
//FRONT
import { motion, isValidMotionProp, AnimatePresence } from 'framer-motion'
import { Flex, Box, Text, Button, IconButton, Skeleton, Tooltip, chakra, shouldForwardProp, Icon, Image, Avatar, Portal } from '@chakra-ui/react'
//COMPONENTS
import Table from "./Components/Reusable/Table"
import RenderIcon from "./Components/Reusable/RenderIcon"
import EditText from "./Components/Reusable/EditText"
import FilterButton from "./Components/Reusable/FilterButton"
import FilterManager from "./Components/Reusable/ManageFilters"
import LoadingIconButton from "./Components/Reusable/LoadingIconButton"
import ConfirmBox from "./Components/Reusable/ConfirmBox"
import SearchSection from "./Components/Reusable/SearchSection"
import CustomSelect from "./Components/Reusable/CustomSelect"
//FUNCTIONS
import timeStampToDate from "./Functions/timeStampToString"
import timeAgo from "./Functions/timeAgo"
import useOutsideClick from "./Functions/clickOutside"
//ICONS
import { RxCheck, RxCross2 } from "react-icons/rx"
import { FaInfoCircle } from "react-icons/fa"
import { FaFolder, FaLock, FaFileLines, FaFilePdf, FaPlus, FaMagnifyingGlass, FaFilter, FaEye, FaCheck, FaInbox } from "react-icons/fa6"
import { IoBook, IoFilter, IoChatbubbleEllipses, IoChatbubble } from "react-icons/io5"
import { BiWorld } from "react-icons/bi"
import { TbCsv } from "react-icons/tb";
import { FiCopy, FiEdit, FiTrash2 } from "react-icons/fi"
import { BsPersonFillUp } from "react-icons/bs"
import { TiArrowSortedDown } from "react-icons/ti"
import { EditViewBox } from "./Components/Reusable/AddView"
 //TYPING
import { languagesFlags, contactDicRegex, searchSectionType, ViewDefinitionType, typesMap, logosMap, Channels, sectionsType } from "./Constants/typing"
import ActionsBox from "./Components/Reusable/ActionsBox"
import IconsPicker from "./Components/Reusable/IconsPicker"
import { IconType } from "react-icons"
import { HiTrash } from "react-icons/hi2"
  
//SECTION
const ConversationResponse = lazy(() => import('./Sections/Conversations/ConversationResponse'))
const Person = lazy(() => import('./Sections/Contacts/Person'))
const Business = lazy(() => import('./Sections/Contacts/Business'))
const Flow = lazy(() => import('./Sections/Functions/Flow'))
const Report = lazy(() => import('./Sections/Stats/Report'))
const Source = lazy(() => import('./Sections/Knowledge/Source'))

  
//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)}) as any


const MatildaSVG = (() => (
    <svg xmlns="http://www.w3.org/2000/svg" height={'14px'} width={'14px'} viewBox="0 0 300 300" shapeRendering="geometricPrecision" textRendering="geometricPrecision">
    <defs>
<linearGradient id="eTB19c3Dndv5-fill" x1="8.7868" y1="321.2132" x2="325.1695" y2="4.8305" spreadMethod="pad" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 0)"><stop id="eTB19c3Dndv5-fill-0" offset="0%" stop-color="#486cff"/>
<stop id="eTB19c3Dndv5-fill-1" offset="100%" stop-color="#05a6ff"/></linearGradient></defs><line x1="0" y1="0" x2="150" y2="29.8476" fill="none"/>
<line x1="300" y1="0" x2="150" y2="29.8476" fill="none"/><path d="M150,294.56691h-120c-16.5685,0-30-13.4315-30-30L0,23.98642c.00711.00133.01421.00266.02132.00398C0.56762,10.66654,11.54195,0.03246,25,0.03246c1.83337,0,3.62065.19735,5.34175.57197L144.26601,23.27354c1.84126.4321,3.76093.66067,5.73399.66067s3.89273-.22857,5.73399-.66067L268.79261,0.77668C270.7774,0.26958,272.85722,0,275,0c13.80712,0,25,11.19288,25,25c0,.04825-.00014.09646-.00041.14465.00014-.00003.00027-.00005.00041-.00008v239.42234c0,16.5685-13.4315,30-30,30h-120c0-1.83344,0-3.64446.00027-5.43335L150,289.13382l-.00027-.00004C150,290.9226,150,292.73355,150,294.56691ZM90,110L75.85786,135.85786L50,150l25.85786,14.14214L90,190l14.14214-25.85786L130,150l-25.85786-14.14214L90,110Zm120,0l-14.14214,25.85786L170,150l25.85786,14.14214L210,190l14.14214-25.85786L250,150l-25.85786-14.14214L210,110Z" fill="url(#eTB19c3Dndv5-fill)"/> </svg>
))
const TypesComponent = ({t,  type }:{t:any, type:'internal_article' | 'public_article' | 'folder' | 'pdf' | 'snippet' | 'subpage'  | 'website'}) => {
    
    const getAlertDetails = (type:'internal_article' | 'public_article' | 'folder' | 'pdf' | 'snippet' | 'subpage' | 'website') => {
        switch (type) {
            case 'internal_article':
                return { color1: 'yellow.100', color2:'yellow.200', icon: <FaLock/>, label: t('InternalArticle') }
            case 'public_article':
                return { color1: 'blue.100', color2:'blue.200', icon: IoBook, label: t('PublicArticle')  }
            case 'folder':
                return { color1: 'gray_1', color2:'text_gray', icon: FaFolder, label: t('Folder')  }
            case 'pdf':
                return { color1: 'gray_1', color2:'text_gray', icon: FaFilePdf, label: t('Pdf')  }
            case 'snippet':
                return { color1: 'gray_1', color2:'text_gray', icon: FaFileLines, label: t('Text')  }
            case 'subpage':
            case 'website':
                return { color1: 'gray_1', color2:'text_gray', icon: BiWorld, label: t('Web')  }
            default:
                return { color1: 'gray_1', color2:'text_gray', icon: BiWorld, label: t('Web')  }
        }
    }
    const { color1, color2, icon, label } = getAlertDetails(type)
    return (
        <Flex display={'inline-flex'}   gap='10px' alignItems="center" borderRadius={'1rem'} borderColor={color2} borderWidth={'1px'} py='2px' px='5px' bg={color1}>
            <Icon as={icon as any} />
            <Text  >{label}</Text>
        </Flex>
    )
} 
//GET THE CELL STYLE
const ConversationsCellStyle = ({column, element, row}:{column:string, element:any, row?:any}) => {

    const auth = useAuth()
    const { t } = useTranslation('conversations')
    const t_formats = useTranslation('formats').t
  

    if (column === 'local_id') return  <Text color='text_gray' whiteSpace={'nowrap'} fontWeight={'medium'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>
    else if (column === 'user_id' || column === 'created_by')  {
        const selectedUser = useMemo(() => auth?.authData?.users?.find(user => user.id === element), [element, auth])
        return  (
            <Flex  alignItems={'center'} gap='5px'> 
                {row.is_matilda_engaged ? 
                    <MatildaSVG/>
                :<> 
                {selectedUser?.icon?.data ? <RenderIcon icon={selectedUser.icon} size={14}/> :<Avatar h='16px' w='16px' size={'xs'} name={selectedUser?.name || ''}/> }
                </>}
                <Text  fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} > {row?.is_matilda_engaged ? 'Tilda' : selectedUser?.name  ? selectedUser?.name: t('NoAgent')}</Text>
            </Flex>
        ) 
    }
 
    
    else if (column === 'created_at' || column === 'updated_at' || column === 'solved_at' || column === 'closed_at' || column === 'move_to_bin_at') {
        return(
        <Tooltip  label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.5rem' fontSize='.8em' p='6px'> 
            <Text  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    }
     
    else if (column === 'deletion_scheduled_at') return <Text   whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeStampToDate(element as string, t_formats)}</Text>
    else if (column === 'channel_id') {
        const selectedChannel = useMemo(() => auth?.authData?.channels?.find(cha => cha.display_id === element), [element, auth])


        return(
        <Flex  gap='4px' alignItems={'center'}>
            <Icon color='text_gray' as={selectedChannel.type in logosMap ?logosMap[element as Channels][0]:FaInfoCircle}/>
            <Text >{selectedChannel.name}</Text>
         </Flex>)
    }     
    else if (column === 'call_duration') return ( <Text  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element?t('Duration', {seconds:element}):''}</Text>)
    else if (column === 'team_id') {
        const selectedTeam = useMemo(() => auth.authData.teams.find((team) => team.id === element), [element, auth]);
        return ( <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{selectedTeam ? `${selectedTeam?.icon.data} ${selectedTeam?.name}` :t('NoTeam')}</Text>)
    }
    else if (column === 'theme_id') {
        const selectedTheme = useMemo(() => auth.authData.themes.find((themes) => themes.id === element), [element, auth])
        return ( <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{selectedTheme ? `${selectedTheme?.icon.data}  ${selectedTheme?.name}` :t('NoTheme')}</Text>)
    }
    else if (column === 'tags') {
        const tags = auth.authData.tags
        return (
            <Flex minH={'35px'} alignItems={'center'}> 
                {element.length === 0? <Text>-</Text>:
                    <Flex gap='5px' flexWrap={'wrap'}>
                        {element.map((label:string, index:number) => (
                            <Flex  bg='gray_1' borderWidth={'1px'} p='4px' borderRadius={'.5rem'} fontSize={'.9em'} key={`client-label-${index}`}>
                                <Text>{tags?.find(tag => tag.id === label)?.name}</Text>
                            </Flex>
                        ))}
                    </Flex>
                }
            </Flex>
        )
    }
    else if (column === 'title') return ( <Text  flex='1' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element ? element: t('NoTitle')}</Text>)
    else return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} >{element}</Text>
}
const ClientCellStyle = ({ column, element, row }:{column:string, element:any, row?:any}) => {
     
    //TRANSLATION
    const { t } = useTranslation('clients')
    const auth = useAuth()
    const t_formats = useTranslation('formats').t
 
    if (column === 'created_at' ||  column === 'last_interaction_at' || column === 'updated_at' )  
    return(
        <Tooltip label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='.8em' p='6px'> 
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)

    else if (column === 'contact') 
    return (
        <Flex gap='10px'>
            {['email_address', 'webchat_id', 'phone_number', 'instagram_username'].map((con, index) => (
            <Fragment key={`contact-${index}`}>
                {row[con] && 
                <Tooltip label={row[con]}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='.8em' p='6px'> 
                    <Box>
                        <Icon color='text_gray' as={(contactDicRegex as any)[con][3]}/>
                    </Box>
                </Tooltip>}
            </Fragment>))}
        </Flex>
    )
    else if (column === 'tags') {
        const tags = auth.authData.tags
        return (
            <Flex minH={'35px'} alignItems={'center'}> 
                {element.length === 0? <Text>-</Text>:
                    <Flex gap='5px' flexWrap={'wrap'}>
                        {element.map((label:string, index:number) => (
                            <Flex  bg='gray_1' borderWidth={'1px'} p='4px' borderRadius={'.5rem'} fontSize={'.9em'} key={`client-label-${index}`}>
                                <Text>{tags?.find(tag => tag.id === label)?.name}</Text>
                            </Flex>
                        ))}
                    </Flex>
                }
            </Flex>
        )
    }
    else if (column === 'language') {
        return(
        <Flex gap='5px'  alignItems={'center'}>
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][0]:'No detectado'}</Text>
            <Text fontSize={'.8em'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][1]:'🏴󠁥󠁳󠁣󠁴󠁿'}</Text>
        </Flex>)
    }   
    else if (column === 'is_blocked') return <Text color={element?'red':'black'}>{element?t('is_blocked'):t('Active')}</Text>  
    else return ( <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={column === 'name'?'medium':'normal'}  overflow={'hidden'} >{element?element:'-'}</Text>)
}
const BusinessCellStyle = ({ column, element }:{column:string, element:any}) => {
    
    const auth = useAuth()
    const t_formats = useTranslation('formats').t

    if (column === 'created_at' || column === 'last_interaction_at' )  
    return(
        <Tooltip  label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='.8em' p='6px'> 
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    else if (column === 'labels') {
        return(<> 
            {(!element || element === '')?<Text>-</Text>:
            <Flex gap='5px' flexWrap={'wrap'}>
                {element.split(',').map((label:string, index:number) => (
                <Flex bg='gray_2' borderColor={'border_gray'} borderWidth={'1px'} p='4px' borderRadius={'.5rem'} fontSize={'.9em'} key={`client-label-${index}`}>
                    <Text>{label}</Text>
                </Flex>
                ))}
            </Flex>}
        </>)
    }
    else if (column === 'tags') {
        const tags = auth.authData.tags
        return (
            <Flex minH={'35px'} alignItems={'center'}> 
                {element.length === 0? <Text>-</Text>:
                    <Flex gap='5px' flexWrap={'wrap'}>
                        {element.map((label:string, index:number) => (
                            <Flex  bg='gray_1' borderWidth={'1px'} p='4px' borderRadius={'.5rem'} fontSize={'.9em'} key={`client-label-${index}`}>
                                <Text>{tags?.find(tag => tag.id === label)?.name}</Text>
                            </Flex>
                        ))}
                    </Flex>
                }
            </Flex>
        )
    }

    else return ( <Text whiteSpace={'nowrap'} fontWeight={column === 'name'?'medium':'normal' } textOverflow={'ellipsis'} overflow={'hidden'}>{element === ''?'-':element}</Text>)
}
const FunctionsCellStyle = ({ column, element }:{column:string, element:any}) => {
     
    //TRANSLATION
    const { t } = useTranslation('functions')
    const t_formats = useTranslation('formats').t
    const auth = useAuth()

    if (column === 'is_active' )  
    return(
        <Flex display={'inline-flex'}   gap='10px' alignItems="center" borderRadius={'1rem'} borderColor={element ?'green.400':'red.400'} borderWidth={'1px'} py='2px' px='5px' bg={element ?'green.100':'red.100'}>
            <Text   >{element ? t('Active'):t('Inactive')}</Text>
        </Flex>)

    if (column === 'created_at' ||  column === 'updated_at' )  
    return(
        <Tooltip label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='.8em' p='6px'> 
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  >{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
  

    else if (column === 'created_by' || column === 'updated_by') {
        const selectedUser = useMemo(() => auth?.authData?.users?.find(user => user.id === element), [element, auth])
        return (
            <Flex  alignItems={'center'} gap='5px'> 
                {element === 'matilda' ? 
                    <MatildaSVG/>
                :<> 
                {selectedUser?.icon?.data ? <RenderIcon icon={selectedUser?.icon} size={14}/> :<Avatar h='16px' w='16px' size={'xs'} name={selectedUser?.name || ''}/> }
                </>}
                <Text  fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} >{element ? element === 'matilda' ?'Tilda':element === 'no_user' ? t('NoAgent'):selectedUser?.name:t('NoAgent')}</Text>
            </Flex>
            )
        }
 
    else return ( <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} fontWeight={column === 'name'?'medium':'normal'}  overflow={'hidden'} >{element === ''?'-':element}</Text>)
}
const ReportsCellStyle = ({ column, element }:{column:string, element:any}) => {
     
    //TRANSLATION
    const { t } = useTranslation('knowledge')
    const t_formats = useTranslation('formats').t
    const auth = useAuth()

    if (column === 'created_at' ||  column === 'updated_at' )  
    return(
        <Tooltip label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='.8em' p='6px'> 
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  >{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
  
     
    else if (column === 'created_by' || column === 'updated_by') {
        const selectedUser = useMemo(() => auth?.authData?.users?.find(user => user.id === element), [element, auth])
        return (
            <Flex  alignItems={'center'} gap='5px'> 
                {element === 'matilda' ? 
                    <MatildaSVG/>
                :<> 
                {selectedUser?.icon?.data ? <RenderIcon icon={selectedUser?.icon} size={14}/> :<Avatar h='16px' w='16px' size={'xs'} name={selectedUser?.name || ''}/> }
                </>}
                <Text  fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} >{element ? element === 'matilda' ?'Tilda':element === 'no_user' ? t('NoAgent'):selectedUser?.name:t('NoAgent')}</Text>
            </Flex>
            )
        }
    else return ( <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={column === 'title'?'medium':'normal'}  overflow={'hidden'} >{element === ''?'-':element}</Text>)
}
const SourcesCellStyle = ({ column, element }:{column:string, element:any}) => {
     
    //TRANSLATION
    const { t } = useTranslation('knowledge')
    const t_formats = useTranslation('formats').t
    const auth = useAuth()

    if (column === 'created_at' ||  column === 'updated_at' )  
    return(
        <Tooltip label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='.8em' p='6px'> 
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  >{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    else if (column === 'tags' || column === 'public_article_help_center_collections') {
        return(<> 
        <Flex minH={'35px'} alignItems={'center'}> 
        {element ? 
            <Flex gap='5px' flexWrap={'wrap'}>
                {element.map((label:string, index:number) => (
                    <Flex bg='gray_1' p='4px' borderRadius={'.5rem'} fontSize={'.8em'} key={`tags-label-${index}`}>
                        <Text>{label}</Text>
                    </Flex>
                ))}
            </Flex>:
            <Text>-</Text>
        }
        </Flex>
    </>)
    }
    else if (column === 'is_available_to_tilda') return <Icon boxSize={'25px'} color={element?'green.600':'red.600'} as={element?RxCheck:RxCross2}/>
    
    else if (column === 'public_article_status') return(
        <Box boxShadow={`1px 1px 1px rgba(0, 0, 0, 0.15)`} display="inline-flex"  py='2px' px='8px' fontWeight={'medium'} color='white'  bg={element === 'draft'?'red.100':'green.100'} borderRadius={'.7rem'}> 
            <Text  color={element === 'draft'?'red.600':'green.600'}>{t(element)}</Text>
        </Box>
    )
    else if (column === 'type') return <TypesComponent t={t} type={element}/>
    else if (column === 'language')  return(
        <Flex gap='5px'   alignItems={'center'}>
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][0]:'No detectado'}</Text>
            <Text>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][1]:'🏴󠁥󠁳󠁣󠁴󠁿'}</Text>
        </Flex>) 

    else if (column === 'created_by' || column === 'updated_by') {
        const selectedUser = useMemo(() => auth?.authData?.users?.find(user => user.id === element), [element, auth])

        return (
            
            <Flex alignItems={'center'} gap='5px'> 
                {element === 'matilda' ? 
                    <MatildaSVG/>
                :<> 
                {selectedUser?.icon?.data ? <RenderIcon icon={selectedUser?.icon} size={14}/> :<Avatar h='16px' w='16px' size={'xs'} name={selectedUser?.name || ''}/> }
                </>}
                <Text  fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} >{element ? element === 'matilda' ?'Tilda':element === 'no_user' ? t('NoAgent'):selectedUser?.name:t('NoAgent')}</Text>
            </Flex>
            )
        }
    else return ( <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} fontWeight={column === 'title'?'medium':'normal'}  overflow={'hidden'} >{element === ''?'-':element}</Text>)
}

//GET EACH SECTION STYLE
const sectionsMap:{[key:string]:{defaultSuperConditions:{col:string, op:string, val:any}[], pathSections:sectionsType[], allowedFilters:string[], count:string, excludedKeys:string[], CellStyle:React.FC<{  column: string, element: any, row?:any }> }} = {
    'conversations':{defaultSuperConditions:[{col:'is_closed', op:'eq', val:false}], pathSections:['conversations'], 
    allowedFilters:['person_id', 'user_id', 'theme_id',  'channel_id', 'updated_at', 'created_at', 'solved_at', 'tags', 'created_by', 'updated_by'],  count:'ConversationsCount', excludedKeys:['id', 'unseen_changes', 'conversation_id','solved_at', 'contact_id', 'state', 'status', 'call_status', 'is_matilda_engaged', 'organization_id',  'call_sid', 'call_url', 'channel_id', 'cdas', 'is_closed' ], CellStyle:ConversationsCellStyle},
    'persons':{defaultSuperConditions:[], pathSections:['persons', 'conversations'], 
    allowedFilters:['business_id', 'language', 'last_interaction_at', 'updated_at', 'created_at', 'tags', 'created_by', 'updated_by'],count:'ClientsCount', excludedKeys: ['id', 'contact_business_id', 'cdas', 'organization_id', 'phone_number', 'email_address', 'instagram_username', 'webchat_id', 'google_business_review_id'], CellStyle:ClientCellStyle},
    'businesses':{defaultSuperConditions:[],pathSections:['businesses', 'persons', 'conversations'], 
    allowedFilters:['last_interaction_at', 'updated_at', 'created_at', 'tags', 'created_by', 'updated_by'], count: 'BusinessesCount', excludedKeys: ['id', 'cdas', 'organization_id'], CellStyle:BusinessCellStyle},
    'functions':{defaultSuperConditions:[], pathSections:['functions'], 
    allowedFilters:[ 'updated_at', 'created_at', 'created_by', 'updated_by'],count: 'FunctionsCount',  excludedKeys: ['id',  'organization_id'], CellStyle:FunctionsCellStyle},
    'reports':{defaultSuperConditions:[], pathSections:['reports'], 
    allowedFilters:['updated_at', 'created_at', 'created_by', 'updated_by'],count: 'ReportsCount',  excludedKeys: ['id',  'organization_id', 'chart_positions'], CellStyle:ReportsCellStyle},
    'sources':{defaultSuperConditions:[], pathSections:['sources'], 
    allowedFilters:['language','updated_at', 'created_at', 'created_by', 'updated_by'], count: 'SourcesCount', excludedKeys: ['id',  'content','is_ingested' ], CellStyle:SourcesCellStyle},
}

//MAIN FUNCTION
function GeneralViewSection({sideBarWidth, socket, setSearchSection}:{sideBarWidth:number, socket:any, setSearchSection:Dispatch<SetStateAction<searchSectionType>>}) {

     //AUTH CONSTANT
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()
    const location = useLocation()
    const navigate = useNavigate()
    const { t } = useTranslation('main')
    const scrollRef = useRef<HTMLDivElement>(null)
      
 
     //LOGIC FOR MANAGING THE VIEW OF THE SECTIONS
    const [searchParams] = useSearchParams()
    const layoutViewId = searchParams.get("view")
    const isExpanded = searchParams.get("v") === "expanded"
    const notPathOpenedSection = searchParams.get("s")
    const currentPath = searchParams.get("p") ? searchParams.get("p").split(',') : []
    const sectionsPathMapRef = useRef<{[key:string]:{icon:{type:'image' | 'emoji' | 'icon', data:string}, name:string}}>({'1':{name:'Empresa 1', icon:{type:'emoji', data:'👞'}}, '2':{name:'Cliente 1', icon:{type:'emoji', data:'📞'}}, '3':{name:'Empresa 1', icon:{type:'emoji', data:''}}})

    //FILTERS AND TABLE DATA OF EACH SECTION
    const columnsMap = {
        'conversations':{
            noDataMessage:t('NoConversations'), create:t('CreateConversation'), 
            columns:{local_id: [t('local_id'), 50],  user_id: [t('user_id'), 100], title: [t('title'), 250], theme_id:  [t('theme_id'), 200],  team_id:[t('Team'), 150], created_at: [t('created_at'), 150],updated_at: [t('updated_at'), 150], solved_at: [t('solved_at'), 150], channel_id: [t('channel_id'), 120], tags:[t('tags'), 200], unseen_changes: [t('unseen_changes'), 150],  call_status: [t('call_status'), 150], call_duration: [t('call_duration'), 150], created_by:[t('created_by'), 200]},
            sections: {name: {name: t('name'), type: 'string'}, language: {name: t('language'), type: 'boolean'}, tags: {name: t('tags'), type: 'boolean'}, last_interaction_at: {name: t('last_interaction_at'), type: 'timestamp'}, updated_at: {name: t('updated_at'), type: 'timestamp'}, created_at: {name: t('created_at'), type: 'timestamp'}, notes: {name: t('notes'), type: 'string'}, is_blocked: {name: t('is_blocked'), type: 'boolean'}, instagram_followers: {name: t('instagram_followers'), type: 'number'}}
        },

        'persons':{
            noDataMessage:t('NoClients'), create:t('CreateClient'), 
            columns:{name: [t('name'), 150], contact: [t('contact'), 120], language: [t('language'), 150], tags: [t('tags'), 350], last_interaction_at: [t('last_interaction_at'), 150], updated_at: [t('updated_at'), 150], created_at: [t('created_at'), 150], rating: [t('rating'), 60], notes: [t('notes'), 350],  is_blocked: [t('is_blocked'), 150], instagram_followers:[t('instagram_followers'), 150]},
            sections: {name: {name: t('name'), type: 'string'}, language: {name: t('language'), type: 'boolean'}, tags: {name: t('tags'), type: 'boolean'}, last_interaction_at: {name: t('last_interaction_at'), type: 'timestamp'}, updated_at: {name: t('updated_at'), type: 'timestamp'}, created_at: {name: t('created_at'), type: 'timestamp'}, notes: {name: t('notes'), type: 'string'}, is_blocked: {name: t('is_blocked'), type: 'boolean'}, instagram_followers: {name: t('instagram_followers'), type: 'number'}}
        },
        'businesses':{
            noDataMessage:t('NoBusinesses'),create:t('CreateBusiness'),  
            columns:{name: [t('name'), 200], domain:  [t('domain'), 150],tags:  [t('tags'), 350], created_at:  [t('created_at'), 180], last_interaction_at:  [t('last_interaction_at'), 180], notes: [t('notes'), 450]},
            sections: {name: {name: t('name'), type: 'string'}, domain: {name: t('domain'), type: 'string'}, tags: {name: t('tags'), type: 'boolean'}, created_at: {name: t('created_at'), type: 'timestamp'}, last_interaction_at: {name: t('last_interaction_at'), type: 'timestamp'}, notes: {name: t('notes'), type: 'string'}}
        },
        'functions':{
            noDataMessage:t('NoFunctions'),create:t('CreateFunction'), 
            columns:{name: [t('name'), 150], is_active: [t('is_active'), 120], updated_by: [t('updated_by'), 150], created_by: [t('created_by'), 150],  updated_at: [t('updated_at'), 150],created_at: [t('created_at'), 150], description: [t('description'), 200] },
            sections: {name: {name: t('name'), type: 'string'}, is_active: {name: t('is_active'), type: 'boolean'}, description: {name: t('description'), type: 'string'}}
        },

        'reports':{
            noDataMessage:t('NoReports'), create:t('CreateReport'), 
            columns:{name: [t('name'), 150], created_by: [t('created_by'), 150],  updated_at: [t('updated_at'), 150],created_at: [t('created_at'), 150], description: [t('description'), 300] },
            sections: {name: {name: t('name'), type: 'string'}, user_id: {name: t('user_id'), type: 'number'}, updated_at: {name: t('updated_at'), type: 'timestamp'}, created_at: {name: t('created_at'), type: 'timestamp'}, description: {name: t('description'), type: 'string'}}
        },
        'sources':{
            noDataMessage:t('NoSources'), create:t('CreateSource'), 
            columns:{title: [t('title'), 200], type: [t('type'), 150], language: [t('language'), 150], is_available_to_tilda:[t('is_available_to_tilda'), 150], created_at: [t('created_at'), 180], updated_at: [t('updated_at'), 180], created_by:[t('created_by'), 150],updated_by:[t('updated_by'), 150], tags:[t('tags'), 300], public_article_help_center_collections:[t('public_article_help_center_collections'), 300], public_article_status:[t('public_article_status'), 150], description:[t('description'),200]},
            sections: {title: {name: t('title'), type: 'string'}, type: {name: t('type'), type: 'boolean'}, language: {name: t('language'), type: 'boolean'}, is_available_to_tilda: {name: t('is_available_to_tilda'), type: 'boolean'}, created_at: {name: t('created_at'), type: 'timestamp'}, updated_at: {name: t('updated_at'), type: 'timestamp'}, created_by: {name: t('created_by'), type: 'boolean'}, updated_by: {name: t('updated_by'), type: 'boolean'}, tags: {name: t('tags'), type: 'boolean'}, public_article_help_center_collections: {name: t('public_article_help_center_collections'), type: 'boolean'}, public_article_status: {name: t('public_article_status'), type: 'boolean'}, description: {name: t('description'), type: 'string'}}
        },
    }

    //BOOLEAN FOR WAIT THE INFO
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)

    //SELECT DATA LOGIC
    const [data, setData] = useState<{page_data:any[], total_items:number} | null>(null)

    //EDIT VIEW DATA
    const [viewName, setViewName] = useState<string>('')
    const [viewIcon, setViewIcon] = useState<{type:'emoji' | 'image' | 'icon', data:string}>({type:'emoji', data:''})
    const updateBasicViewData = async (type:'icon' | 'name', newValue:any) => {
        let newData = selectedView
        if (type === 'icon') {
            newData = {...selectedView, icon:newValue}
            setViewIcon(newValue)
        }
        else {
            newData = {...selectedView, name:newValue}
            setViewName(newValue)
        }

        const response = await fetchData({endpoint:`${auth.authData.organizationId}/views/${selectedView.id}`,  method:'put', getAccessTokenSilently, requestForm:newData, auth})
        if (response?.status === 200) {
            const currentViews = auth.authData.views
            const updatedViews = currentViews.map(view =>view.id === selectedView.id ? newData: view)
            auth.setAuthData({ views: updatedViews })
        }
    }
 

    //VIEW DATA
    const [selectedView, setSelectedView] = useState<ViewDefinitionType | null>(null)
    const selectedViewRef = useRef<ViewDefinitionType | null>(null)
    useEffect(() => {selectedViewRef.current = selectedView}, [selectedView])
    const initialViewRef = useRef<ViewDefinitionType | null>(null)


    const previousViewIdRef = useRef<string | null>(null)
    useEffect (() => {
        const viewId = location.pathname.split('/')[2]
        if (viewId !== previousViewIdRef.current) {
            const selectedImportedView = (auth?.authData?.views || [])?.find(view => view.id === viewId) || null as ViewDefinitionType
            document.title = `${selectedImportedView?.icon?.type === 'emoji' ? selectedImportedView.icon.data:''} ${selectedImportedView.name} - ${auth.authData.organizationName} - Matil`
            previousViewIdRef.current = viewId
            initialViewRef.current = selectedImportedView
            setSelectedView(selectedImportedView)
            setViewName(selectedImportedView.name)
            setViewIcon(selectedImportedView.icon)
            setText('')
            setAddFilters([])
            setColToSort(null)
            setSuperConditions((sectionsMap as any)?.[selectedImportedView?.model]?.defaultSuperConditions)
         }

    },[location.pathname])
 
    //FETCH DATA ON SCROLLING
    const pageIndexRef = useRef<number>(1) 
    const fetchDataOnSroll = async () => {    
        if (selectedView) {     
           
            let newSort = selectedViewRef.current.sort
            if (colToSort) newSort = [colToSort, ...selectedViewRef.current.sort]

            let moreFilters:{col:string, op:'in', val:any[]}[] = []
            if (addFiltersRef.current.length > 0) moreFilters = addFiltersRef.current.map(fil => {return {col:fil.col, op:'in', val:fil.vals}})
           
             const response = await fetchData({endpoint:`${auth.authData.organizationId}/${selectedViewRef.current?.model || ''}`, setValue:setData, getAccessTokenSilently, setWaiting:setWaitingInfo, auth, params:{page_index:pageIndexRef.current, query:textRef.current, sort:newSort, filters:{...selectedViewRef.current.filters, superconditions:[...superConditionsRef.current, ...moreFilters]}} })
                        
            if (response?.status === 200) {
                pageIndexRef.current = pageIndexRef.current + 1
                setData(prev => ({...prev as any, page_data: [...prev?.page_data as any[], ...response.data.page_data]}) )
            }
        }
    }    
 
    //TABLE LOGIC
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    const prevCurrentIndex = useRef<number>(-1)
    const prevCopyIndex = useRef<number>(-1)
    useEffect(() => {prevCopyIndex.current = selectedIndex}, [selectedIndex])

    //SELECTED ELEMENTS
    const [selectedElements, setSelectedElements] = useState<string[]>([])
    const prevselectedElements= useRef<string[]>([])
    useEffect(() => {prevselectedElements.current = selectedElements}, [selectedIndex])
    
    //SHOW FILTERS
    const inputButton = useRef<HTMLButtonElement>(null)
    const inputBox = useRef<HTMLDivElement>(null)
    const [showSearch, setShowSearch] = useState<boolean>(false)
    const [showFilters, setShowFilters] = useState<boolean>(false)
    useOutsideClick({ref1:inputBox, ref2:inputButton, onOutsideClick:setShowSearch})

    //FILTERS THAT CAN CHANGE AN UPLOAD THE DATA
    const [text, setText] = useState<string>('')
    const textRef = useRef<string>('')
    useEffect(() => {textRef.current = text},[text])
    const [addFilters, setAddFilters] = useState<{col:string, vals:any[]}[]>([])
    const addFiltersRef = useRef<{col:string, vals:any[]}[]>([])
    useEffect(() => {addFiltersRef.current = addFilters},[addFilters])
    const [colToSort, setColToSort] = useState<{column: string, order:'asc' | 'desc'} | null>(null)
    const colToSortRef = useRef<{column: string, order:'asc' | 'desc'} | null>(null)
    useEffect(() => {colToSortRef.current = colToSort},[colToSort])
    const [superConditions, setSuperConditions] = useState<{col:string, op:string, val:any}[] | null>()
    const superConditionsRef = useRef<{col:string, op:string, val:any}[] | null>(null)
    useEffect(() => {superConditionsRef.current = superConditions},[superConditions])
 

    //FETCH DATA ON FIRST RENDER
    useEffect(() => {
         const fetchViewData = async() => {
            let newSort = selectedView.sort
            if (colToSort) newSort = [colToSort, ...selectedView.sort]

            let moreFilters:{col:string, op:'in', val:any[]}[] = []
            if (addFilters.length > 0) moreFilters = addFilters.map(fil => {return {col:fil.col, op:'in', val:fil.vals}})

            console.log({page_index:1, query:text, sort:newSort, filters:{...selectedView.filters, superconditions:[...superConditions, ...moreFilters]}})
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/${selectedView?.model || ''}`, setValue:setData, getAccessTokenSilently, setWaiting:setWaitingInfo, auth, params:{page_index:1, query:text, sort:newSort, filters:{...selectedView.filters, superconditions:[...superConditions, ...moreFilters]}} })
            
            if (response?.status === 200) pageIndexRef.current = 1
        }    
        if (selectedView) fetchViewData()
    }, [selectedView, addFilters, superConditions, colToSort, text])

    
    
    //HIDE CLIENTE LOGIC
    const mainContainerRef = useRef<HTMLDivElement>(null)
    useOutsideClick({ref1:mainContainerRef, onOutsideClick:() => handleClearPath()})


    const handleClearPath = () => {
        const searchParams = new URLSearchParams(location.search)
        const pathParam = searchParams.get("p")
            if (pathParam) {
            const pathArray = pathParam.split(",")
            pathArray.pop()
            if (pathArray.length > 0)   searchParams.set("p", pathArray.join(","))
            else searchParams.delete("p")
        }
        navigate(`?${searchParams.toString()}`, { replace: true });
    }
    
    useEffect(() => {
        const handleKeyDown = (event:KeyboardEvent) => {
              switch (event.code) {           
                case 'Escape':
                    if (!location.pathname.endsWith('clients')) navigate(-1)
                    break        
                default:
                  break
              }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => {window.removeEventListener('keydown', handleKeyDown)}
    },[location.pathname])


    //NAVIGATE TO A CLIENT
    const clickRow = (row:any, index:number) => {
        navigate(`/view/${selectedView.id}?view=${layoutViewId}&p=${row.id}&v=${['conversations', 'persons', 'businesses', 'sources'].includes(selectedView.model)?'side':'expanded' }`)
        setSelectedIndex(prev => {prevCurrentIndex.current = prev;return row.id})
    }

    //SORT LOGIC
    const requestSort = (key: string) => {
        const direction = (colToSort?.column === key && colToSort?.order === 'asc') ? 'desc' : 'asc'
        setColToSort({column:key, order:direction})
    }
    const getSortIcon = (key: string) => {
        if (colToSort?.column === key) { 
            if (colToSort?.order === 'asc') return true
            else return false
        }
        else return null    
    }

 
    const memoizedTableBox = useMemo(() => (
        <Table onFinishScroll={fetchDataOnSroll} prevCurrentIndex={prevCurrentIndex} prevSelectedElements={prevselectedElements} numberOfItems={data?.total_items} data={data?.page_data} CellStyle={(sectionsMap as any)?.[selectedView?.model]?.CellStyle || null}  noDataMessage={(columnsMap as any)[selectedView?.model]?.noDataMessage || ''}  requestSort={requestSort} getSortIcon={getSortIcon} columnsMap={(columnsMap as any)[selectedView?.model]?.columns || {}}
        excludedKeys={(sectionsMap as any)?.[selectedView?.model]?.excludedKeys || []} onClickRow={clickRow} selectedElements={selectedElements} setSelectedElements={setSelectedElements} onSelectAllElements={() => {}} currentIndex={selectedIndex} waitingInfo={waitingInfo}/>
    ), [data, selectedElements,  selectedIndex, waitingInfo])


    const sectionsToRender = notPathOpenedSection ? [notPathOpenedSection] : currentPath as string[]
    const renderSection = (sectionId:string, index:number) => {
        if (notPathOpenedSection) {
            return <Person sideBarWidth={sideBarWidth} personId={sectionId} socket={socket} sectionsPath={sectionsToRender} sectionsPathMap={sectionsPathMapRef.current} selectedView={selectedView} />
        }
        else {
            const foundSection = selectedView ? sectionsMap[selectedView.model].pathSections[index] : ''
            switch (foundSection) {
                case 'conversations':
                    return <ConversationResponse sideBarWidth={sideBarWidth} socket={socket} conId={sectionId} sectionsPath={sectionsToRender} sectionsPathMap={sectionsPathMapRef.current} selectedView={selectedView}  />
                case 'persons':
                    return <Person sideBarWidth={sideBarWidth} personId={sectionId} socket={socket} sectionsPath={sectionsToRender} sectionsPathMap={sectionsPathMapRef.current} selectedView={selectedView}/>
                case 'businesses':
                    return <Business sideBarWidth={sideBarWidth} businessId={sectionId} socket={socket} sectionsPath={sectionsToRender} sectionsPathMap={sectionsPathMapRef.current} selectedView={selectedView}/>
                case 'functions':
                    return <Flow flowId={sectionId} sideBarWidth={sideBarWidth} sectionsPath={sectionsToRender} sectionsPathMap={sectionsPathMapRef.current} selectedView={selectedView}/>
                case 'reports':
                    return <Report reportId={sectionId} sideBarWidth={sideBarWidth} sectionsPath={sectionsToRender} sectionsPathMap={sectionsPathMapRef.current} selectedView={selectedView}/>
                case 'sources':
                    return <Source sourceId={sectionId} sideBarWidth={sideBarWidth} sectionsPath={sectionsToRender} sectionsPathMap={sectionsPathMapRef.current} selectedView={selectedView}/>
            }
        } 
    }

    console.log(sectionsToRender)
    //FRONT
    return(
        <>  

            <AnimatePresence> 
                {sectionsToRender.length > 0 && (<> 
                    {isExpanded ? 
                            <MotionBox display='flex' justifyContent='center' key={sectionsToRender[sectionsToRender.length - 1]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} 
                                bg="white"  position="absolute"  top={0} right={0} width={`calc(100vw - ${sideBarWidth}px)`} height="100vh" zIndex={100} >
                                <Box w='100%' h='100%' > 
                                {renderSection(sectionsToRender[sectionsToRender.length - 1], sectionsToRender.length - 1)}
                                </Box>
                            </MotionBox>
                        
                        :
                        (<>
                            {sectionsToRender.map((sectionId, index) => (
                                <MotionBox key={sectionId} ref={index === sectionsToRender.length - 1 ?  mainContainerRef:null} initial={{ right: -45, opacity: 0 }} animate={{ right:0, opacity: 1 }}  exit={{ right: -45, opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} 
                                bg="white" position="absolute" top={0}   width={Math.min(window.innerWidth * 0.6, window.innerWidth - 500) - index*45} height="100vh" zIndex={100 + index} boxShadow="-4px 0 6px -2px rgba(0, 0, 0, 0.1)">
                                {renderSection(sectionId, index)}
                            </MotionBox>
                            ))}
                        </>)
                    }
                </>)       
                }
            </AnimatePresence>
    
            <Box  height={'100vh'} width={'100%'} overflowX={'scroll'} overflowY={'hidden'} >
        
                <Flex px='2vw' pt='1vw' ml='-10px' pos='relative' flex={1} gap='10px' justifyContent={'space-between'}> 
                    
                    <Flex gap='5px' alignItems={'center'}>
                        <Skeleton isLoaded={selectedView !== null}> 
                            <IconsPicker standardView={selectedView?.is_standard ? selectedView?.model : null } selectedEmoji={viewIcon} onSelectEmoji={(icon) => updateBasicViewData('icon', icon)} viewSelect/>
                        </Skeleton>
                        <Skeleton style={{width:'400px', display:'flex', fontSize:'1.2em',alignItems:'center'}} isLoaded={selectedView !== null}> 
                            {selectedView?.is_standard ? 
                                <Text fontWeight={'medium'}  >{viewName}</Text>
                                :
                                <EditText value={viewName} setValue={(value) => updateBasicViewData('name', value)} className="title-textarea"/>
                            }
                        </Skeleton>
                    </Flex>
                    <Skeleton isLoaded={selectedView !== null} style={{borderRadius:'.5rem', width:'28px', height:'28px'}}> 
                    {selectedView && <ActionsButton view={selectedView} items={data?.page_data || []} setView={setSelectedView}/>}
                    </Skeleton>
                </Flex>     
                
          
           
                
 
                 <Flex  pos='relative'  mt='1vh'   gap='20px' px='2vw' justifyContent={'space-between'} > 
               
                    <Flex gap='15px' pos={'relative'}> 
                        <Skeleton style={{width:'200px', height:'28px', borderRadius:'.5rem'}} isLoaded={superConditions !== null}> 
                            {superConditions  && <SuperConditionComponent  superConditions={superConditions} setSuperConditions={setSuperConditions}/>}
                        </Skeleton>
                        {(selectedView && selectedElements.length > 0) && 
                        <MotionBox  key='selecte-elements' bg='white' borderColor='border_color' borderWidth='1px'  boxShadow={'rgba(20, 20, 20, 0.2) 0px 16px 32px 0px'} borderRadius='.5rem'  top={0} left={0}  pos='absolute' initial={{ opacity: 0}} animate={{ opacity: 1 }} exit={{ opacity: 0 }}  transition={{ duration: '.2', ease: 'easeOut'}}> 
                            <MassiveActionsComponent sectionType={selectedView.model} selectedElements={selectedElements} setSelectedElements={setSelectedElements} totalItems={data?.total_items || 0}/>
                        </MotionBox>}
                    </Flex>

                  
                    <Flex  alignItems={'center'}   gap='5px'> 

                        <IconButton bg={'transparent'} _hover={{bg:'gray_1', color:'text_blue'}} onClick={() => setShowFilters(prev => !prev)} variant={'common'}  color={showFilters ? 'text_blue':'text_gray'}aria-label="create-function" size='sm'>
                            <Tooltip  label={t('Filter')}  placement='top'  bg='white' color='black'  borderRadius='.5rem' fontSize='.8em' p='6px'> 
                                <Box display="flex" h='100%' w='100%' alignItems="center" justifyContent="center" transition="transform .5s ease-in-out"  _hover={{}} >
                                    <FaFilter size="14px" />
                                </Box>
                            </Tooltip>
                        </IconButton>

                        <IconButton  ref={inputButton} bg={'transparent'} _hover={{bg:'gray_1', color:'text_blue'}} onClick={() => setShowSearch(prev => !prev)} variant={'common'} color={showSearch ? 'text_blue':'text_gray'} aria-label="create-function" size='sm'>
                            <Tooltip  label={t('Search')}  placement='top'  bg='white' color='black'  borderRadius='.5rem' fontSize='.8em' p='6px'> 
                                <Box display="flex" h='100%' w='100%' alignItems="center" justifyContent="center" transition="transform .5s ease-in-out"  _hover={{}} >
                                    <FaMagnifyingGlass size="14px" />
                                </Box>
                            </Tooltip>
                        </IconButton>
                        <AnimatePresence> 
                            {showSearch && 
                                <MotionBox ref={inputBox} initial={{width:0}} animate={{width:200}} exit={{width:0}} transition={{duration:'.2', ease:'easeOut'}}> 
                                    <EditText fontSize=".9em" placeholder={t('Search') + '...'} focusOnOpen={true} value={text} searchInput setValue={setText}/>
                                </MotionBox>}
                            </AnimatePresence>
                
                        <Skeleton isLoaded={selectedView !== null}> 
                            <Button size={'xs'} variant={'main'} leftIcon={<FaPlus/>}>{(columnsMap as any)[selectedView?.model]?.create}</Button>
                        </Skeleton>
                    </Flex>
                  </Flex>
                  <Box h='1px' mt='.5vh' ml='2vw' w='calc(100% - 4vw)' bg='border_color'/>

                <Flex w='100%'  alignItems={'center'} pt='1vh' px='2vw' pos='relative' justifyContent={'space-between'} ref={scrollRef} h={showFilters ? 'auto':'0'} minH={(showFilters)? 'calc(28px + 2vh)':'0'}overflow={'hidden'} transition={showFilters? 'height .2s ease-in-out, opacity .2s ease-in-out':'height .2s ease-in-out, opacity .2s ease-in-out'}  flexWrap={'wrap'} gap='15px'>
                    {selectedView && 
                    <Flex  flex='1'  flexWrap={'wrap'} gap='10px'>
                        <EditViewButton view={selectedView} setView={setSelectedView}/>
                        <FilterComponents addFilters={addFilters} setAddFilters={setAddFilters} allowedFilters={(sectionsMap as any)[selectedView?.model]?.allowedFilters || []} columnsMap={(columnsMap as any)[selectedView?.model]?.sections || {}}/>     
                    </Flex>}

                    <AnimatePresence> 
                        {(JSON.stringify(selectedView) !== JSON.stringify(initialViewRef.current) || addFilters.length > 0) && 
                            <MotionBox gap='10px' display={'flex'} key='save-changes'  initial={{ opacity: 0}} animate={{ opacity: 1 }} exit={{ opacity: 0 }}  transition={{ duration: '.2', ease: 'easeOut'}}>    
                                <Button fontWeight={'medium'} onClick={() => {setAddFilters([]); setSelectedView(initialViewRef.current)} }size='xs' borderColor={'transparent'}  variant={'common'}>{t('Discard')}</Button>
                            </MotionBox>
                        }
                    </AnimatePresence>

                </Flex>
                <Box> 
                    {memoizedTableBox}
                </Box>
            </Box>              
        </>)
}
 
export default GeneralViewSection
 
//FILTERS COMPONENTS
const FilterComponents = ({addFilters, setAddFilters, allowedFilters, columnsMap}:{addFilters:{col:string, vals:any[]}[], setAddFilters:Dispatch<SetStateAction<{col:string, vals:any[]}[]>>, allowedFilters:string[], columnsMap:any}) => {

     const { t } = useTranslation('main')
    
    const [showFilters, setShowFilters] = useState<boolean>(false)

    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    useOutsideClick({ref1:boxRef, ref2:buttonRef, onOutsideClick:setShowFilters})

    const usedColumns = new Set(addFilters.map(f => f.col));
    const options = allowedFilters.filter(filter => !usedColumns.has(filter));
    const labelsMap = Object.fromEntries(options.map(option => [option, t(option)]));

    const handleFiltersChange = (newVals: any[], filter: { col: string, vals: any[] }) => {
        setAddFilters(prevFilters => {
            return prevFilters.map(f => f.col === filter.col ? { ...f, vals: newVals }  : f)
        })
    }
    

    return (<> 
            {(addFilters || []).map((filter, index) => {
            return (
                <FilterButton key={`filter-${index}`}  deleteFilter={() =>     setAddFilters((prevFilters) => prevFilters.filter((_, i) => i !== index))} selectedElements={filter.vals} setSelectedElements={(value: string[]) => handleFiltersChange(value, filter)} selectedSection={filter.col} />
            )
            })}
            
            <Box pos='relative' ref={buttonRef}> 
                {options.length > 0 && 
                <Flex h='24px' alignItems={'center'} onClick={() => setShowFilters(true)} gap='5px'  cursor={'pointer'} color={'text_blue'} >
                    <Icon boxSize={'13px'} as={FaPlus}/>
                    <Text fontSize={'.9em'} fontWeight={'medium'}>{t('AddFilter')}</Text>
                </Flex>}
                {showFilters &&  
                <Box bg='green' top={'29px'} ref={boxRef} >
                    <CustomSelect onlyOneSelect={false} fontSize='.8em' options={options} labelsMap={labelsMap} selectedItem={''} setSelectedItem={(option) => {  setShowFilters(false);setAddFilters(prev => ([...prev, {col:option as string, vals:[]}])) }} alwaysExpanded/>
                </Box>}
            </Box>   
    </>)
}

//BUTTON FOR EDITING VIEWS
const EditViewButton = ({view, setView}:{view:ViewDefinitionType, setView:Dispatch<SetStateAction<ViewDefinitionType>>}) => {

    const { t } = useTranslation('main')

    function countConditions(view: ViewDefinitionType): number {
        let count = 0;
        for (const group of view.filters.groups) count += group.conditions.length;
        return count
    }
    
    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const [showList, setShowList] = useState(false)
    useOutsideClick({ref1:buttonRef, ref2:boxRef, onOutsideClick:setShowList,  nestedPortal:true})

    return (<>
    
 
        <Flex p='5px' h='24px' bg={showList ? 'gray_1':'gray_2'} color='text_blue' borderColor={'gray_1'} transition={'background-color .2s ease-in-out'} _hover={{bg:'gray_1'}} borderWidth={'1px'} borderRadius={'.5rem'} justifyContent={'space-between'} gap='10px' alignItems={'center'} ref={buttonRef} cursor={'pointer'} onClick={() => setShowList(true)}>
            <Flex alignItems={'center'} gap='7px'> 
                <Icon as={IoFilter}/>
                <Text fontWeight={'medium'} fontSize={'.9em'}>{t('ViewsRules', {count: countConditions(view)})}</Text>
            </Flex>
            <Icon as={TiArrowSortedDown}/>

        </Flex>
          {showList &&  
            <Portal> 
                <MotionBox   ref={boxRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} maxH={'50vh'} overflow={'scroll'} maxW={'50vw'}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                    style={{ transformOrigin: 'top left' }}  minW={buttonRef.current?.getBoundingClientRect().width }  left={(buttonRef.current?.getBoundingClientRect().left || 0)} mt='5px' top={(buttonRef.current?.getBoundingClientRect().bottom ) + 'px'}  position='fixed' bg='white' p='10px'  zIndex={10} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='border_gray' borderWidth='1px' borderRadius='.5rem'>
                    <FilterManager excludedColumns={['local_id', 'contact_id']} filters={view.filters} setFilters={(filters) => setView(prev => ({...prev, filters}))} excludedFields={['contacts', 'contact_businesses']} scrollRef={boxRef}/>
                </MotionBox >
            </Portal>}
    </>)
}

//SUPERCONDITIONS COMPONENT
const SuperConditionComponent = ({superConditions, setSuperConditions}:{superConditions:{col:string, op:string, val:any}[], setSuperConditions:Dispatch<SetStateAction<{col:string, op:string, val:any}[]>>}) => {

    const { t } = useTranslation('main')

    const statusButtonRef = useRef<HTMLDivElement>(null)
    const statusBoxRef = useRef<HTMLDivElement>(null)
    const [showStatus, setShowStatus] = useState<boolean>(false)
    useOutsideClick({ref1:statusBoxRef, ref2:statusButtonRef, onOutsideClick:() => setShowStatus(false)})

    const optionsMap = {
        'is_closed':[{name:'open', icon:IoChatbubbleEllipses}, {name:'closed', icon:IoChatbubble}],
    }


    const editSuperCondition = (idx:number, newVal:any) => {
        setSuperConditions(prev => {
            return prev.map((con, index) => {
                if (index === idx) return {...con, val:newVal}
                else return con
            })
        })
    }
    const SuperConditionComponent = ({col, index}:{col:string, index:number}) => {
        switch (col) {
            case 'is_closed':{
                return (
                    <Box position={'relative'} > 

                            <Flex gap='3px' cursor={'pointer'} ref={statusButtonRef} alignItems={'center'} borderRadius={'.5rem'} color={showStatus ? 'text_blue':'text_gray'} bg={showStatus ? 'gray_1':'gray_2' } _hover={{color:'text_blue', background:'gray_2'}} px='7px' h='26px' fontSize={'.9em'} onClick={() => {setShowStatus(prev => !prev)}}>
                            <Flex gap='5px' alignItems={'center'}>
                                <Icon as={FaInbox}/>
                                <Text fontWeight={'medium'}>{superConditions[index].val ? t('OnlyClosed'):t('OnlyOpened')}</Text>
                            </Flex>
                        </Flex>
                
            
                        <AnimatePresence> 
                            {showStatus && 
                            <MotionBox initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '.1', ease: 'easeOut'}}
                            maxH='40vh'p='8px'  style={{ transformOrigin: 'top left' }}   left={0} overflow={'scroll'} top='100%' gap='10px' ref={statusBoxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.1)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.5rem'} borderWidth={'1px'} borderColor={'border_color'}>
                                {(optionsMap as any)[col].map((status:{name:string, icon:IconType}, selectIndex:number) => {
                                    
                                    const isSelected = (superConditions[index].val && status.name === 'closed' || !superConditions[index].val && status.name !== 'closed')
                                    return (
                                    <Flex justifyContent={'space-between'} key={`status-${selectIndex}`} color={isSelected ? 'text_blue':'black'} px='7px' py='5px'  borderRadius={'.5rem'} cursor={'pointer'} gap='15px' alignItems={'center'} _hover={{bg:'gray_2'}} onClick={() => {setShowStatus(false); editSuperCondition(index, status.name === 'closed')}}>
                                        <Flex alignItems={'center'} gap='5px'>
                                            <Icon color={isSelected ? 'text_blue':'text_gray'} boxSize={'13px'} as={status.icon}/>
                                            <Text whiteSpace={'nowrap'}>{t(status.name)}</Text>
                                        </Flex>
                                        {isSelected && <Icon as={FaCheck}/>}
                                    </Flex>
                                )})}                                           
                            </MotionBox>}   
                        </AnimatePresence>                 
                    </Box> 
                )
        }
        }
               
    }

    return (
        <Flex>
            {superConditions.map((con, index) => (
                <SuperConditionComponent key={`super-condition-${index}`} col={con.col} index={index}/>
            ))}
        </Flex>      
    )
}

//MAIN FUNCTION
const ActionsButton = ({items, view, setView}:{items:any[], view:ViewDefinitionType, setView:Dispatch<SetStateAction<ViewDefinitionType>>}) =>{
    
    //TRANSLATION
    const { t } = useTranslation('main')

    //CONSTANTS
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()
    const navigate = useNavigate()
     
    //VIEW ACTIONS
    const [showEdit, setShowEdit] = useState<boolean>(false)
    const [waitingDuplicate, setWaitingDuplicate] = useState<boolean>(false)
    const [showDelete, setShowDelete] = useState<boolean>(false)


    //SHOW AND HIDE LIST LOGIC
    const buttonRef = useRef<HTMLButtonElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const [showList, setShowList] = useState(false)
    useOutsideClick({ref1:buttonRef, ref2:boxRef, onOutsideClick:setShowList})

    //FUNCTIONS
    const handleDownloadCSV = useCallback(() => {
        downloadCSV()
        setShowList(false)
    }, [items, view])
  
    function downloadCSV() {
        if (!items || items.length === 0) {return}
        const headers = Object.keys(items[0]);
        const csvRows = [headers]
        items.forEach(item => {
            const values = headers.map(header => {
                const escaped = ('' + item[header]).replace(/"/g, '\\"')
                return `"${escaped}"`
            })
            csvRows.push(values)
        })
        const csvString = csvRows.map(e => e.join(",")).join("\n")
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `${view.name}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
    
    const viewActions = async (action:'delete' | 'duplicate' | 'edit') => {

        if (action === 'delete') setShowDelete(true)
        else if (action === 'duplicate') {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/view`, requestForm:{...view, name:view.name + t('Copy')}, setWaiting:setWaitingDuplicate, method:'post', getAccessTokenSilently, auth, toastMessages:{failed:t('FailedCopiedView')}})
            if (response.status === 200) {
                const currentViews = auth.authData.views
                auth.setAuthData({views:[...currentViews, {...view, id:response.data.id}]})
                navigate(`view/${response.data.id}`)
            }
        }
        else setShowEdit(true)

        setShowList(false)
    }
    const deleteView = async () => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/view/${view.id}`, method:'delete', getAccessTokenSilently, auth})
    }

    const memoizedEditView = useMemo(() => (
        <ConfirmBox setShowBox={setShowEdit} upPosition isCustomPortal={false}> 
            <EditViewBox  section={view.model} setShowView={setShowEdit} viewId={view.id} onEditView={(view:ViewDefinitionType) => setView(view)}/>
        </ConfirmBox>
    ), [showEdit])

    //FRONT
    return (<> 
    {showEdit && memoizedEditView}
        <ActionsBox showBox={showDelete} setShowBox={setShowDelete} type="delete" des={t('DeleteViewDes')} title={t('DeleteViewName', {name:view.name})} buttonTitle={t('DeleteView')} actionFunction={deleteView} />

   
        <Button size='xs' pos='absolute' right={'2vw'} top='1vw'  onClick={() => setShowList(prev => !prev)} rightIcon={<TiArrowSortedDown/>} ref={buttonRef}  variant={'common'}>Acciones</Button>
 
        <AnimatePresence> 
        {showList &&  
            <Portal> 
                <MotionBox color='black'  ref={boxRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                    style={{ transformOrigin: 'top' }}  minW={buttonRef.current?.getBoundingClientRect().width } fontSize={'.9em'} right={'2vw'}  mt='5px'  top={(buttonRef.current?.getBoundingClientRect().bottom ) + 'px'}  position='fixed' bg='white' p='5px'  zIndex={10000000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='border_gray' borderWidth='1px' borderRadius='.5rem'>
                   
                        <Box p='4px'> 
                            {!view?.is_standard && <Flex gap='10px' alignItems={'center'} p='5px'  onClick={() => viewActions('edit')}  borderRadius={'.5rem'} _hover={{bg:'gray_2'}} cursor='pointer' >
                                <Icon color={'text_gray'} as={FiEdit}/>
                                <Text whiteSpace={'nowrap'}>{t('EditView')}</Text>
                            </Flex>}
                            <Flex gap='10px' alignItems={'center'} p='5px'  onClick={() => viewActions('duplicate')}  borderRadius={'.5rem'} _hover={{bg:'gray_2'}} cursor='pointer' >
                                <Icon color={'text_gray'} as={FiCopy}/>
                                <Text whiteSpace={'nowrap'}>{waitingDuplicate ? <LoadingIconButton/>:t('Duplicate')}</Text>
                            </Flex>
                        
                            <Flex gap='10px' alignItems={'center'} p='5px' onClick={() => viewActions('delete')} color='red' borderRadius={'.5rem'} _hover={{bg:'gray_2'}} cursor='pointer' >
                                <Icon  as={FiTrash2}/>
                                <Text whiteSpace={'nowrap'}>{t('Delete')}</Text>
                            </Flex>
                        </Box>
                        
                        <Box w='100%' h='1px' bg='border_color'/>
                        <Box p='4px'> 
                            <Flex gap='10px' alignItems={'center'} p='5px' onClick={handleDownloadCSV}  borderRadius={'.5rem'} _hover={{bg:'gray_2'}} cursor='pointer' >
                                <Icon color={'text_gray'} as={TbCsv}/>
                                <Text whiteSpace={'nowrap'}>{t('DownloadCsv')}</Text>
                            </Flex>
                        </Box>
             
                </MotionBox >
            </Portal>}
    </AnimatePresence>

    </>)
}

//COMPONENR FOR DOING MASSIVE ACTIONS
const MassiveActionsComponent = ({sectionType, selectedElements, setSelectedElements, totalItems}:{sectionType:sectionsType, selectedElements:string[], setSelectedElements:Dispatch<SetStateAction<string[]>>,totalItems:number}) => {
    
    
    const { t } = useTranslation('main')
    const  { getAccessTokenSilently } = useAuth0()
    const auth = useAuth()

    
    switch (sectionType) {
     case 'conversations': {

          //DELETE A CONVERSATIONS FUNCTION
            const [waitingRead, setWaitingRead] = useState<boolean>(false)
            const markAsRead = async() => {
                const response = await fetchData({endpoint:`${auth.authData.organizationId}/conversations`, method:'put',  requestForm:{unseen_changes:false},setWaiting:setWaitingRead, getAccessTokenSilently, auth,  params:{filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'id', op:'in', val:selectedElements}]}] }} })   
                setSelectedElements([])
            }

            //ASSIGN AN AGENT OR TEAM
            const [showAssign, setShowAssign] = useState<boolean>(false)
            const [waitingAssign, setWaitingAssign] = useState<boolean>(false)
            const assignConversations = async (type:string, keyToEdit:string) => {
                const backType =  type === 'team' ? 'team_id' : 'user_id'
                const response = await fetchData({endpoint:`${auth.authData.organizationId}/conversations`, method:'put',  requestForm:{[backType]:keyToEdit},setWaiting:setWaitingAssign, getAccessTokenSilently, auth,  params:{filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'id', op:'in', val:selectedElements}]}] }} })   
                setSelectedElements([])
            }
            const memoizedAssign = useMemo(() => (<SearchSection selectedSection="assign" setSearchSection={() => setShowAssign(false)} onSelectElement={assignConversations}/>), [showAssign])


            return (
    
                <Flex gap='10px' pl='10px' alignItems={'center'}>  
                    <Text whiteSpace={'nowrap'} cursor={'pointer'} fontWeight={'medium'} onClick={() => setSelectedElements([])} color={'text_gray'} fontSize={'.8em'}>{t('ConversationsSelectedCount', {count:selectedElements.length, total:totalItems})}</Text>
                        
                    <Flex alignItems={'center'} h='100%'> 
                        <Flex py='6px' cursor={'pointer'} color='text_blue'  transition={'background-color .2s ease-in-out'} _hover={{bg:'gray_2'}} alignItems={'center'} px='10px' borderLeftColor={'border_color'} gap='5px' onClick={() => setShowAssign(true)} borderLeftWidth={'1px'}>
                            <Icon as={BsPersonFillUp}/>
                            {waitingAssign ? <LoadingIconButton/>:<Text   fontSize={'.8em'} fontWeight={'medium'}>{t('Assign')}</Text>}
                        </Flex>
                        <Flex py='6px'cursor={'pointer'} color='text_blue' transition={'background-color .2s ease-in-out'} _hover={{bg:'gray_2'}}  alignItems={'center'} px='10px' borderLeftColor={'border_color'} gap='5px' onClick={() => markAsRead()}  borderLeftWidth={'1px'}>
                            <Icon as={FaEye} />
                            {waitingRead ? <LoadingIconButton/>:<Text fontSize={'.8em'} fontWeight={'medium'}>{t('MarkAsRead')}</Text>}
                        </Flex>
                        <Flex   py='6px' cursor={'pointer'} color='text_gray' transition={'background-color .2s ease-in-out, color .2s ease-in-out'} _hover={{bg:'gray_2',color:'red'}}  alignItems={'center'} px='10px' borderLeftColor={'border_color'} gap='5px' onClick={() => markAsRead()}  borderLeftWidth={'1px'}>
                            <Icon boxSize={'14px'} as={HiTrash} />
                       
                        </Flex>

                    </Flex>
                </Flex>
            )
        }
        }
}