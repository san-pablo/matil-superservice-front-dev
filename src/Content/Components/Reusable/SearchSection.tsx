//REACT
import { Dispatch, SetStateAction, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../AuthContext"
import { useAuth0 } from "@auth0/auth0-react"
import { useLocation, useNavigate } from "react-router-dom"
//IMPORT FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Tooltip, IconButton, Box, Text, Icon, Button } from "@chakra-ui/react"
//COMPONENTS
import EditText from "./EditText"
import FilterButton from "./FilterButton"
import Table from "./Table"
import StateMap from "./StateMap"
//FUNCTIONS
import timeStampToDate from "../../Functions/timeStampToString"
import timeAgo from "../../Functions/timeAgo"
//ICONS
import { FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa'
import { FaMagnifyingGlass, FaPlus, FaTable } from "react-icons/fa6"
import { PiSidebarSimpleBold } from "react-icons/pi"
//TYPING
import { ConversationColumn, logosMap, Channels, languagesFlags } from "../../Constants/typing"
 
//TYPING
type Status = 'new' | 'open' | 'solved' | 'pending' | 'closed'
const validStatuses: Status[] = ['new', 'open', 'solved', 'pending', 'closed']

//ALERT LEVEL COMPONENT
const AlertLevel = ({t,  rating }:{t:any, rating:number}) => {
    const getAlertDetails = (rating:number) => {
        switch (rating) {
            case 0:
                return { color: 'green.500', icon: FaCheckCircle, label: `${t('Priority_0')} (0)` }
            case 1:
                return { color: 'yellow.500', icon: FaInfoCircle, label: `${t('Priority_1')} (1)` }
            case 2:
                return { color: 'orange.500', icon: FaExclamationTriangle, label: `${t('Priority_2')} (2)` }
            case 3:
                return { color: 'red.500', icon: FaExclamationCircle, label: `${t('Priority_3')} (3)` }
            case 4:
                return { color: 'red.700', icon: FaExclamationCircle, label: `${t('Priority_4')} (4)` }
            default:
                return { color: 'green.500', icon: FaCheckCircle, label: `${t('Priority_0')} (0)` }
        }
    }
    const { color, icon, label } = getAlertDetails(rating)
    return (
        <Flex gap='10px' alignItems="center">
            <Icon as={icon} color={color}/>
            <Text color={color} fontWeight={'medium'}>
                {label}
            </Text>
        </Flex>
    )
} 
//GET THE CELL STYLE
const ConversationllStyle = ({column, element}:{column:string, element:any}) => {

    const auth = useAuth()
    const { t } = useTranslation('conversations')
    const t_formats = useTranslation('formats').t

    if (column === 'local_id') return  <Text fontSize={'.9em'} color='gray.600' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>#{element}</Text>
     else if (column === 'user_id')  return  <Text fontSize={'.9em'} fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element === 'matilda' ?'Matilda':element === 'no_user' ? t('NoAgent'):(auth?.authData?.users?.[element as string | number]?.name || t('NoAgent')) }</Text>
    else if (column === 'unseen_changes') 
        return(
        <Flex fontSize={'.9em'} color={element?'red':'green'} alignItems={'center'} gap='5px'> 
            <Icon as={element?FaExclamationCircle:FaCheckCircle} />
            <Text>{element?t('NotRead'):t('Any')}</Text>
        </Flex>)
    
    else if (column === 'status' && typeof element === 'string' && validStatuses.includes(element as Status)) return  <StateMap state={element as Status}/>
    else if (column === 'urgency_rating' && typeof element === 'number') {return <AlertLevel t={t} rating={element}/>}
    else if (column === 'created_at' || column === 'updated_at' || column === 'solved_at' || column === 'closed_at') {
        return(
        <Tooltip  label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.5rem' fontSize='.8em' p='6px'> 
            <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    }
    else if (column === 'deletion_date'  && typeof element === 'string' ) return <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeStampToDate(element, t_formats)}</Text>
    else if (column === 'channel_type') {
        return(
        <Flex fontSize={'.9em'} gap='7px' alignItems={'center'}>
            <Icon color='gray.600' as={typeof element === 'string' && element in logosMap ?logosMap[element as Channels][0]:FaInfoCircle}/>
            <Text >{t(element as string)}</Text>
         </Flex>)
    }     
    else if (column === 'call_duration') return ( <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element?t('Duration', {seconds:element}):''}</Text>)
    
    else return ( <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>)
}
const ClientCellStyle = ({ column, element }:{column:string, element:any}) => {
     
    //TRANSLATION
    const { t } = useTranslation('clients')
    const t_formats = useTranslation('formats').t

    if (column === 'created_at' ||  column === 'last_interaction_at' )  
    return(
        <Tooltip label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='.8em' p='6px'> 
            <Text whiteSpace={'nowrap'} fontSize={'.9em'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    else if (column === 'labels') {
        return(<> 
        <Flex minH={'35px'} alignItems={'center'}> 
        {element === ''? <Text>-</Text>:
            <Flex gap='5px' flexWrap={'wrap'}>
                {element.split(',').map((label:string, index:number) => (
                    <Flex  bg='brand.gray_2'borderColor={'gray.300'} borderWidth={'1px'} p='4px' borderRadius={'.5rem'} fontSize={'.8em'} key={`client-label-${index}`}>
                        <Text>{label}</Text>
                    </Flex>
                ))}
            </Flex>
        }
        </Flex>
    </>)
    }
    else if (column === 'language') {
        return(
        <Flex gap='5px' fontSize={'.9em'}  alignItems={'center'}>
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][0]:'No detectado'}</Text>
            <Text fontSize={'.8em'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][1]:'🏴󠁥󠁳󠁣󠁴󠁿'}</Text>
        </Flex>)
    }   
    else if (column === 'is_blocked') return <Text color={element?'red':'black'}>{element?t('is_blocked'):t('Active')}</Text>  
    else return ( <Text fontSize={'.9em'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={column === 'name'?'medium':'normal'}  overflow={'hidden'} >{element === ''?'-':element}</Text>)
}
const BusinessCellStyle = ({ column, element }:{column:string, element:any}) => {
    
    const t_formats = useTranslation('formats').t

    if (column === 'created_at' || column === 'last_interaction_at' )  
    return(
        <Tooltip  label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='.8em' p='6px'> 
            <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    else if (column === 'labels') {
        return(<> 
            {(!element || element === '')?<Text>-</Text>:
            <Flex gap='5px' flexWrap={'wrap'}>
                {element.split(',').map((label:string, index:number) => (
                <Flex bg='brand.gray_2' borderColor={'gray.300'} borderWidth={'1px'} p='4px' borderRadius={'.5rem'} fontSize={'.8em'} key={`client-label-${index}`}>
                    <Text>{label}</Text>
                </Flex>
                ))}
            </Flex>}
        </>)
    }
    else return ( <Text fontSize={'.9em'} whiteSpace={'nowrap'} fontWeight={column === 'name'?'medium':'normal' } textOverflow={'ellipsis'} overflow={'hidden'}>{element === ''?'-':element}</Text>)
}

//MAIN FUNCTION
const SearchSection = ({selectedSection, hideSideBar, setHideSideBar}:{selectedSection:'conversations' | 'clients' | 'businesses', hideSideBar:boolean, setHideSideBar:Dispatch<SetStateAction<boolean>>}) => {

    const auth = useAuth()
    const { t } = useTranslation('settings')
    const {getAccessTokenSilently} = useAuth0()
    const navigate = useNavigate()
    const location = useLocation()
    const currentSearch = location.search

    //COLUMNS MAP
    const conversationsColumnsMap:{[key in ConversationColumn]:[string, number]} = {local_id: [t('local_id'), 50], status:  [t('status'), 100], channel_type: [t('channel_type'), 100], theme_uuid:  [t('theme'), 200], team_uuid:[t('Team'), 150], tags:[t('tags'), 200], user_id: [t('user_id'), 200], created_at: [t('created_at'), 150],updated_at: [t('updated_at'), 180], solved_at: [t('solved_at'), 150],closed_at: [t('closed_at'), 150],title: [t('title'), 300], unseen_changes: [t('unseen_changes'), 200],  call_status: [t('call_status'), 150], call_duration: [t('call_duration'), 150], }
    const clientsColumnsMap:{[key:string]:[string, number]} = {name: [t('name'), 200], contact: [t('contact'), 150], labels: [t('labels'), 350], last_interaction_at: [t('last_interaction_at'), 180], created_at: [t('created_at'), 150], rating: [t('rating'), 60], language: [t('language'), 150], notes: [t('notes'), 350],  is_blocked: [t('is_blocked'), 150]}
    const businessColumnsMap:{[key:string]:[string, number]} = {name: [t('name'), 200], labels:  [t('labels'), 350], created_at:  [t('created_at'), 150], last_interaction_at:  [t('last_interaction_at'), 150], notes: [t('notes'), 350]}

    const [text, setText] = useState<string>('')
    const [waitingResults, setWaitingResults] = useState<boolean>(false)
    const [searchHistory, setSearchHistory] = useState<string[]>([])

    const [fetchedData, setFetchedData] = useState<any[] | null>(null)

    const sectionFilters:{[key in 'conversations' | 'clients' | 'businesses']:{options:string[], cell:React.FC<{  column: string, element: any }>, columnsMap:{[key:string]:[string, number]}, onClick: (value:any, index:number) => void}} = {
        'conversations':{options:['status', 'channel_type', 'theme', 'user_id','urgency_rating', 'created_at', 'updated_at'], cell:ConversationllStyle, columnsMap:conversationsColumnsMap, onClick:(row:any, index:number) => {navigate(`/conversations/conversation/${row.id}${currentSearch}`)}},
        'clients':{options:['languge', 'created_at', 'updated_at'],cell:ClientCellStyle, columnsMap:clientsColumnsMap,  onClick:(row:any, index:number) => {navigate(`/contacts/client/${row.id}`)}},
        'businesses':{options:['created_at', 'updated_at'], cell:BusinessCellStyle, columnsMap:businessColumnsMap,  onClick:(row:any, index:number) => {navigate(`/conversations/business/${row.id}`)}},
    }

    const fetchFilterData = async() => {
        const response1 = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/bin`, getAccessTokenSilently, setValue:setFetchedData, setWaiting:setWaitingResults, auth})

    }

    return (
        <Flex position={'absolute'} right={0} top={0} h='100vh'  width={hideSideBar ? 0:220}transition={'width ease-in-out .2s'}>

            <Flex justifyContent={'space-between'}> 
                <Flex gap='10px' alignItems={'center'}> 
                    <Tooltip  label={t('HideViews')}  placement='right'  bg='white' color='black'  borderRadius='.5rem' fontSize='.7em' p='6px'> 
                        <IconButton bg='transparent'  _hover={{bg:'brand.gray_1', color:'brand.text_blue'}} icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'18px'}/>} variant={'common'}  h='28px' w='28px' aria-label="create-function" size='xs' onClick={() => setHideSideBar(prev => (!prev))} />
                    </Tooltip>
                    <EditText placeholder={t('Search') + '...'} searchInput value={text} setValue={(value:string) => setText(value)}/>
                </Flex>
                <Text opacity={fetchedData ? 1:0} fontSize={'.9em'} fontWeight={'medium'} cursor={'pointer'} transition={'opacity .3s ease-in-out'} _hover={{color:'brand.text_blue'}} onClick={() => {setText('');setFetchedData(null)}}>{t('Delete')}</Text>
            </Flex>
            <Box h='1px' mt='2vh' mb='2vh' bg='gray.200'/>
            <Flex> 
                <Flex flexWrap={'wrap'}>
                    {sectionFilters[selectedSection].options.map((filter, index) => (
                        <FilterButton key={`filter-${index}`} selectedElements={[]} setSelectedElements={() => {}} selectedSection={filter as any}/>
                    ))}
                </Flex>
                <Box flex='1'>
                    {fetchedData ? <> 
                        {fetchedData.length === 0 ? 
                        <Flex justifyContent={'center'} alignItems={'center'}>
                            <Text fontSize={'1.2em'}>{t('NoResultsFound')}</Text>
                            <Text fontSize={'.8em'} color='gray.600'>{t('NoResultsFoundWarnning')}</Text>
                            <Button display={'inline-flex'} variant={'main'} size='sm'>{t('Delete')}</Button>
                        </Flex>
                        :<>
                        <Text>{t('')}</Text>
                        <Table waitingInfo={waitingResults} data={fetchedData} CellStyle={sectionFilters[selectedSection].cell} noDataMessage="" columnsMap={sectionFilters[selectedSection].columnsMap} onClickRow={sectionFilters[selectedSection].onClick}/>
                        </>
                        }
                    </>:
                    <> 
            
                    <Text  fontSize={'.8em'}>{t('RecentSearches')}</Text>
                    {searchHistory.map((item, index) => (
                        <Flex key={`search-${index}`} >
                            <Icon as={FaMagnifyingGlass}/>
                            <Text fontSize={'.8em'}>{item}</Text>
                        </Flex>
                    ))}
                    
                    </>}
                </Box>
            </Flex>
        </Flex>     
    )
}

export default SearchSection
