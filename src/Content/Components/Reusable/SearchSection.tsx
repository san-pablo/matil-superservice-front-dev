//REACT
import { useState, useMemo, useEffect, Dispatch, SetStateAction, useRef, ReactElement, memo, Fragment } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../AuthContext"
import { useAuth0 } from "@auth0/auth0-react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
//IMPORT FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Tooltip, IconButton, Box, Text, Icon, Button, Portal, chakra, shouldForwardProp, Spinner, Image, Avatar } from "@chakra-ui/react"
import { motion, isValidMotionProp, AnimatePresence } from 'framer-motion'
//COMPONENTS
import EditText from "./EditText"
import FilterButton from "./FilterButton"
import SectionPathRender from "./SectionPath"
import IconsPicker from "./IconsPicker"
//FUNCTIONS
import timeAgo from "../../Functions/timeAgo"
import useOutsideClick from "../../Functions/clickOutside"
import timeStampToDate from "../../Functions/timeStampToString"
//ICONS
import { IoFileTrayFull } from "react-icons/io5" 
import { BsBarChartFill ,BsStars, BsFillLayersFill, BsPersonFillUp } from "react-icons/bs"
import { FaLongArrowAltRight } from "react-icons/fa"
import { FaCode, FaMagnifyingGlass, FaCircleDot, FaLock, FaFilePdf, FaFolder, FaFileLines } from "react-icons/fa6"
import { IoFilter, IoBook, IoPerson } from "react-icons/io5"
import { RxCross2 } from "react-icons/rx"
import { IoPeopleSharp } from "react-icons/io5"
import { BiSolidBuildings } from "react-icons/bi"
import { BiWorld } from "react-icons/bi"
//TYPING
import { searchSectionType, logosMap, languagesFlags, sectionPathType } from "../../Constants/typing"
 

//IMPORTANT FUNCTIONS
const generateFilter = (elements:{[key:string]:string[]}) => {
    const groups = Object.keys(elements).filter((col) => elements[col].length > 0).map((col) => {
      const conditions = elements[col].map((val) => ({ col: col, op: "eq", val: val}))
      return {logic: "OR", conditions: conditions}
    })
    return {logic: "OR", groups: groups}
  }
const highlightText = (text: string, search: string) => {
    if (!search) return text;
    
    const regex = new RegExp(`(${search})`, 'gi');
    const lines = text.split('\n');
    
    let matchIndex = lines.findIndex(line => regex.test(line));
    if (matchIndex === -1) return text; 
    
    const startLine = Math.max(0, matchIndex - 1);
    const selectedLines = lines.slice(startLine, startLine + 3).join('\n');
    
    const parts = selectedLines.split(regex);
    
    return parts.map((part, i) =>
        regex.test(part) ? (
            <Box as="span" borderRadius={'.3rem'} key={i} bg="yellow.200">
                {part}
            </Box>
        ) : (
            part
        )
    );
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})
const MatildaSVG = memo(() => (
    <svg xmlns="http://www.w3.org/2000/svg" height={'16px'} width={'16px'} viewBox="0 0 300 300" shapeRendering="geometricPrecision" textRendering="geometricPrecision">
    <defs>
    <linearGradient id="eTB19c3Dndv5-fill" x1="8.7868" y1="321.2132" x2="325.1695" y2="4.8305" spreadMethod="pad" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 0)"><stop id="eTB19c3Dndv5-fill-0" offset="0%" stop-color="#486cff"/>
    <stop id="eTB19c3Dndv5-fill-1" offset="100%" stop-color="#05a6ff"/></linearGradient></defs><line x1="0" y1="0" x2="150" y2="29.8476" fill="none"/>
    <line x1="300" y1="0" x2="150" y2="29.8476" fill="none"/><path d="M150,294.56691h-120c-16.5685,0-30-13.4315-30-30L0,23.98642c.00711.00133.01421.00266.02132.00398C0.56762,10.66654,11.54195,0.03246,25,0.03246c1.83337,0,3.62065.19735,5.34175.57197L144.26601,23.27354c1.84126.4321,3.76093.66067,5.73399.66067s3.89273-.22857,5.73399-.66067L268.79261,0.77668C270.7774,0.26958,272.85722,0,275,0c13.80712,0,25,11.19288,25,25c0,.04825-.00014.09646-.00041.14465.00014-.00003.00027-.00005.00041-.00008v239.42234c0,16.5685-13.4315,30-30,30h-120c0-1.83344,0-3.64446.00027-5.43335L150,289.13382l-.00027-.00004C150,290.9226,150,292.73355,150,294.56691ZM90,110L75.85786,135.85786L50,150l25.85786,14.14214L90,190l14.14214-25.85786L130,150l-25.85786-14.14214L90,110Zm120,0l-14.14214,25.85786L170,150l25.85786,14.14214L210,190l14.14214-25.85786L250,150l-25.85786-14.14214L210,110Z" fill="url(#eTB19c3Dndv5-fill)"/> </svg>
))

//NAVIGATION DEFINITIONS
const navigateList:any[] = [
    '/conversations',
    '/contacts/clients',
    '/contacts/businesses',
    '/functions',
    '/functions/stats',
    '/functions/secrets',
    '/reports',
    '/knowledge',
    '/knowledge/fonts',
    '/knowledge/content',
    '/settings',
    '/settings/organization/data',
    '/settings/organization/hours',
    '/settings/organization/surveys',
    '/settings/tilda/all-configs',
    '/settings/users/user',
    '/settings/users/admin-users',
    '/settings/users/groups',
    '/settings/help-centers/all',
    '/settings/workflows/tags',
    '/settings/workflows/fields',
    '/settings/workflows/themes',
    '/settings/workflows/shortcuts',
    '/settings/workflows/conversations',
    '/settings/channels/all-channels'

]
const navigateData = {total_items:0, page_data: navigateList.map((nav) => {return {name:nav, coincidence:{}}})}

//MAIN FUNCTION
const SearchSection = ({selectedSection, setSearchSection, onSelectElement, selectAccessPath}:{selectedSection:searchSectionType, setSearchSection:Dispatch<SetStateAction<searchSectionType>>, onSelectElement?:any, selectAccessPath?:sectionPathType}) => {


    const auth = useAuth()
    const { t } = useTranslation('settings')
    const t_formats = useTranslation('formats').t
    const {getAccessTokenSilently} = useAuth0()
    const navigate = useNavigate()

    //ASSIGN TO A TEAM DATA
    const assignUsers = auth.authData.users.map(user => {return {id:user.id, type:'user', name:user.name, icon:user?.icon}})
    const assignTeam = auth.authData.teams.map(team => {return {id:team.id, type:'team', name:team.name, icon:team?.icon?.data}})
    const assignData = {total_items:0, page_data:[...[...assignUsers, {type:'user', id:'matilda', name:'Tilda', icon:''}, {type:'user', id:'no_user', name:t('NoAgent'), icon:''}], ...[...assignTeam, {type:'team', id:'', name:t('NoGroup'), icon:''}]]}

    //FILTER SECTION
    const ConversationCellStyle = ({data, index}:{data:any, index:number}) => {
     
        return (
            <Flex justifyContent={'space-between'}  _hover={{bg:'gray_2'}} borderRadius={'.5rem'}  cursor={'pointer'} p='10px'  onClick={() => selectElement(null, data.id)}>
                <Flex gap='15px' alignItems={'center'}>
                    <Flex borderRadius={'.5rem'} p='10px' justifyContent={'center'} bg='gray_1' alignItems={'center'}>
                        <Text fontWeight={'medium'}>#{data.local_id}</Text>
                    </Flex>
                    <Box> 
                        <Text fontSize={'.9em'} fontWeight={'medium'}>{data.title}</Text>
                        {data?.coincidence?.timestamp  &&<> 
                            <Text fontSize={'.7em'}><span style={{fontWeight:500}}> {t('From')}:</span>  {data.sender_type === 'matilda' ? 'Tilda' : Object.keys(auth?.authData?.users).includes(data.sender_type) ? auth?.authData?.users[data.sender_type].name : t('Client')},  <span style={{fontWeight:500}}> {t('Sent')}:</span>  {timeStampToDate(data?.coincidence?.timestamp, t_formats)}</Text>
                            <Text fontSize={'.7em'} maxW={'80%'} >{highlightText(data?.coincidence?.text, text)}</Text>
                        </>}

                    </Box>
                </Flex>
                <Flex justifyContent={'space-between'} flexDir={'column'} alignItems={'end'}> 
                    <Text fontSize={'.7em'} color='text_gray'>{t('Created')} {timeAgo(data.created_at, t_formats).toLocaleLowerCase()}</Text>

                    <Flex fontSize={'.7em'} alignItems={'center'} gap='5px'> 
                        <Text whiteSpace={'nowrap'} fontWeight={'medium'}>{t('Channel')}: {t(data?.channel_type)}</Text>
                        <Icon color='text_gray' as ={(logosMap as any)?.[data?.channel_type]?.[0]}/>
                    </Flex>
                    
                </Flex>
               
            </Flex>
        )
    } 
    const ContactCellStyle = ({data, index}:{data:any, index:number}) => {
     
        return (
            <Flex justifyContent={'space-between'}  _hover={{bg:'gray_2'}} gap='30px' borderRadius={'.5rem'}  cursor={'pointer'} p='10px'  onClick={() => selectElement(null, data.id)}>
                <Flex gap='15px' alignItems={'center'}>
                    <Avatar size='sm' name={data?.name}/>
                    <Box  > 
                        <Text fontSize={'.9em'} fontWeight={'medium'}>{Object.keys(data?.coincidence || {}).includes('name') ? highlightText(data?.coincidence?.name, text) : data.name}</Text>
                        {data?.coincidence && Object.keys(data?.coincidence || {}).filter(([key]) => key !== 'name').map((co, index) => (
                            <Text maxW={'80%'} fontSize={'.7em'} key={`coincidence-${index}`}><span style={{fontWeight:500}}>{t(co)}: </span> {highlightText(data?.coincidence?.[co], text)}</Text>
                        ))}
                    </Box>
                </Flex>
                <Flex  flex='1' minWidth="fit-content"  justifyContent={'space-between'} flexDir={'column'} alignItems={'end'}> 
                    <Text fontSize={'.7em'}  whiteSpace={'nowrap'} color='text_gray'>{t('LastInteractionAt')} {timeAgo(data?.last_interaction_at, t_formats).toLocaleLowerCase()}</Text>
                    <Flex fontSize={'.7em'} alignItems={'center'} gap='5px'> 
                        <Text whiteSpace={'nowrap'} ><span style={{fontWeight:500}}> {t('Language')}:</span> {languagesFlags?.[data?.language]?.[0]} {languagesFlags?.[data?.language]?.[1]} </Text>
                    </Flex>
                </Flex>               
            </Flex>
        )
    } 
    const BusinessCellStyle = ({data, index}:{data:any, index:number}) => {
     
        return (
            <Flex justifyContent={'space-between'}  _hover={{bg:'gray_2'}} gap='30px' borderRadius={'.5rem'}  cursor={'pointer'} p='10px' onClick={() => selectElement(null, data.id)}>
                <Flex gap='15px' alignItems={'center'}>
                    <Avatar size='sm' name={data.name}/>
                    <Box> 
                        <Text fontSize={'.9em'} fontWeight={'medium'}>{Object.keys(data?.coincidence || {}).includes('name') ? highlightText(data.coincidence.name, text) : data.name}</Text>
                        {Object.keys(data?.coincidence || {}).filter(([key]) => key !== 'name').map((co, index) => (
                            <Text  maxW={'80%'}  fontSize={'.7em'} key={`coincidence-${index}`}><span style={{fontWeight:500}}>{t(co)}: </span> {highlightText(data.coincidence[co], text)}</Text>
                        ))}
                    </Box>
                </Flex>
                <Flex  flex='1' minWidth="fit-content"  justifyContent={'space-between'} flexDir={'column'} alignItems={'end'}> 
                    <Text  fontSize={'.7em'} color='text_gray'>{t('LastInteractionAt')} {timeAgo(data.last_interaction_at, t_formats).toLocaleLowerCase()}</Text>
                    <Flex fontSize={'.7em'} alignItems={'center'} gap='5px'> 
                        <Text whiteSpace={'nowrap'} ><span style={{fontWeight:500}}> {t('Domain')}:</span> {data?.domain}</Text>
                     </Flex>
                </Flex>               
            </Flex>
        )
    } 
    const FunctionCellStyle = ({data, index}:{data:any, index:number}) => {
     
        return (
            <Flex justifyContent={'space-between'}  _hover={{bg:'gray_2'}} gap='30px' borderRadius={'.5rem'}  cursor={'pointer'} p='10px'  onClick={() => selectElement(null, data.id)}>
                <Flex gap='15px' alignItems={'center'}>
                        <Flex borderRadius={'.5rem'} p='10px' justifyContent={'center'} bg='gray_1' alignItems={'center'}>
                            <Icon as={FaCode}/>
                        </Flex>
                    <Box> 
                        <Text fontSize={'.9em'} fontWeight={'medium'}>{Object.keys(data?.coincidence || {}).includes('name') ? highlightText(data.coincidence.name, text) : data.name}</Text>
                        {Object.keys(data?.coincidence || {}).filter(([key]) => key !== 'name').map((co, index) => (
                            <Text  maxW={'80%'}  fontSize={'.7em'} key={`coincidence-${index}`}><span style={{fontWeight:500}}>{t(co)}: </span> {highlightText(data.coincidence[co], text)}</Text>
                        ))}
                    </Box>
                </Flex>
                <Flex  flex='1' minWidth="fit-content"  justifyContent={'space-between'} flexDir={'column'} alignItems={'end'}> 
                    <Flex gap='5px' alignItems={'center'}>
                        <Icon boxSize={'12px'} color={data?.is_active?'#68D391':'#ECC94B'} as={FaCircleDot}/>
                        <Text fontSize={'.7em'}>{data?.is_active?t('Active'):t('Inactive')}</Text>
                    </Flex>                    
                </Flex>               
            </Flex>
        )
    } 
    const ReportCellStyle = ({data, index}:{data:any, index:number}) => {
     
        const selectedUser = useMemo(() => auth?.authData?.users?.find(user => user.id === data.created_by), [data.created_by, auth])

        return (
            <Flex justifyContent={'space-between'}  _hover={{bg:'gray_2'}} gap='30px' borderRadius={'.5rem'}  cursor={'pointer'} p='10px'  onClick={() => selectElement(null, data.id)}>
                <Flex gap='15px' alignItems={'center'}>
                        <Flex borderRadius={'.5rem'} p='10px' justifyContent={'center'} bg='gray_1' alignItems={'center'}>
                            <Icon as={BsBarChartFill}/>
                        </Flex>
                    <Box> 
                        <Text fontSize={'.9em'} fontWeight={'medium'}>{Object.keys(data?.coincidence || {}).includes('name') ? highlightText(data.coincidence.name, text) : data.name}</Text>
                        {Object.keys(data?.coincidence || {}).filter(([key]) => key !== 'name').map((co, index) => (
                            <Text  maxW={'80%'}   fontSize={'.7em'} key={`coincidence-${index}`}><span style={{fontWeight:500}}>{t(co)}: </span> {highlightText(data.coincidence[co], text)}</Text>
                        ))}
                    </Box>
                </Flex>
                <Flex  flex='1' minWidth="fit-content"  justifyContent={'space-between'} flexDir={'column'} alignItems={'end'}> 
                    <Text fontSize={'.7em'} color='text_gray'>{t('Created')} {timeAgo(data.created_at, t_formats).toLocaleLowerCase()}</Text>

        
                    <Text fontSize={'.7em'} fontWeight={'medium'}><span style={{fontWeight:500}}> {t('CreatedBy')}:</span> {data.user_id ? data.user_id === 'matilda' ?'Tilda':data.user_id === 'no_user' ? t('NoAgent'):selectedUser?.name:t('NoAgent')}</Text>
                </Flex>               
            </Flex>
        )
    } 
    const KnowledgeCellStyle = ({data, index}:{data:any, index:number}) => {
     
        const selectedUser = useMemo(() => auth?.authData?.users?.find(user => user.id === data.created_by), [data.created_by, auth])


        const typesMap = {'internal_article':FaLock, 'public_article':IoBook, 'folder':FaFolder, 'pdf':FaFilePdf, 'snippet':FaFileLines, 'subpage':BiWorld, 'website':BiWorld}
       
        return (
            <Flex justifyContent={'space-between'}  _hover={{bg:'gray_2'}} gap='30px' borderRadius={'.5rem'}  cursor={'pointer'} p='10px' onClick={() => selectElement(null, data.id)}>
                <Flex gap='15px' alignItems={'center'}>
                        <Flex borderRadius={'.5rem'} p='10px' justifyContent={'center'} bg='gray_1' alignItems={'center'}>
                            <Icon as={(typesMap as any)[data.type]}/>
                        </Flex>
                    <Box> 
                        <Text fontSize={'.9em'} fontWeight={'medium'}>{Object.keys(data?.coincidence || {}).includes('title') ? highlightText(data.title, text) : data.title}</Text>
                        {Object.keys(data?.coincidence || {}).filter(([key]) => key !== 'title').map((co, index) => (
                            <Text  maxW={'80%'}   fontSize={'.7em'} key={`coincidence-${index}`}><span style={{fontWeight:500}}>{t(co)}: </span> {highlightText(data.coincidence[co], text)}</Text>
                        ))}
                    </Box>
                </Flex>
                <Flex  flex='1' minWidth="fit-content"  justifyContent={'space-between'} flexDir={'column'} alignItems={'end'}> 
                    <Text fontSize={'.7em'} color='text_gray'>{t('Created')} {timeAgo(data.created_at, t_formats).toLocaleLowerCase()}</Text>
                    <Text fontSize={'.7em'} whiteSpace={'nowrap'} fontWeight={'medium'}><span style={{fontWeight:500}}> {t('CreatedBy')}:</span> {data.created_by ? data.created_by === 'matilda' ?'Tilda':data.created_by === 'no_user' ? t('NoAgent'):selectedUser?.name:t('NoAgent')}</Text>
                </Flex>               
            </Flex>
        )
    } 
    const NavigateCellStyle = ({data, index}:{data:any, index:number}) => {    
        return (
            <Flex fontSize={'.9em'}  key={`section-${index}`} p='10px'  borderRadius={'.5rem'} cursor={'pointer'}gap='10px' alignItems={'center'} _hover={{bg:'gray_2'}} onClick={() => {setSearchSection(null);navigate(data.name)}}>
                <Text fontSize={'.9em'}>{highlightText(t(data.name), text)}</Text>
            </Flex>
        )
    }
    const AssignCellStyle = ({data, index}:{data:any, index:number}) => {    
        return (
            <Flex fontSize={'.9em'} p='10px'  borderRadius={'.5rem'} cursor={'pointer'}gap='15px' alignItems={'center'} _hover={{bg:'gray_2'}} onClick={() => { selectElement(data.type, data.id)}}>
                    <Icon color='text_gray' as={data.type !== 'team'  ? IoPerson:IoPeopleSharp}/>
                    <Text>{t('AssignTo')}</Text>
                    <Text>{'>'}</Text>
                <Flex alignItems={'center'} gap='10px'> 
                    {data.type === 'team' ? <>{data.id ? <Text>{data.icon}</Text> : <></>}</> 
                    : <> 
                        {data.id === 'matilda' ? 
                                <MatildaSVG/>
                        :<> 
                        {data?.icon ? <Image src={data?.icon } h='16px' w='16px' alt={data.name} /> :<Avatar h='16px' w='16px' size={'xs'} name={data.id === 'no_user' ? '':data?.name || ''}/> }
                        </>}
                    </>}
                    <Text >{highlightText(t(data.name), text)}</Text>
                </Flex>
            </Flex>
        )
    }
    
 
    //SECTION FILTERS DEFINITION
    const sectionFilters:{[key in 'conversations' | 'persons' | 'businesses' | 'reports' | 'functions' | 'sources' | 'navigate' | 'assign' ]:{icon:ReactElement, placeholder:string,  endpoint:string,sort:{column:string, order:'asc' | 'desc'}, options:string[], cell:React.FC<{  data: string, index:number}>, columns:string[] }} = {
        navigate:{icon:<FaLongArrowAltRight size='16px'/>,  placeholder:t('SearchNavigate'), endpoint:'', sort:{column:'local_id', order:'desc'}, columns:[] ,options:[], cell:NavigateCellStyle},
        assign:{icon:<BsPersonFillUp size='16px'/>,  placeholder:t('AssignTo'), endpoint:'', sort:{column:'title', order:'desc'}, columns:[] ,options:[], cell:AssignCellStyle},
        conversations:{icon:<IoFileTrayFull size='16px'/>, placeholder:t('SearchConversations'), endpoint:'conversations', sort:{column:'local_id', order:'desc'}, columns:['id', 'local_id', 'channel_type', 'status', 'created_at', 'title'] ,options:['status', 'channel_type', 'theme_id', 'team_id', 'user_id', 'created_at', 'updated_at', 'solved_at', 'closed_at', 'created_by',  'tags'], cell:ConversationCellStyle},
        persons:{icon:<IoPeopleSharp size='16px'/>, placeholder:t('SearchContacts'), endpoint:'contacts', sort:{column:'id', order:'desc'}, columns:['id','name', 'last_interaction_at', 'language'] ,options:['last_interaction_at', 'language', 'tags'], cell:ContactCellStyle},
        businesses:{icon: <BiSolidBuildings size='16px'/>,  placeholder:t('SearchBusiness'),endpoint:'contact_businesses', sort:{column:'id', order:'desc'}, columns:['id','name', 'last_interaction_at', 'domain'] ,options:['created_at', 'last_interaction_at', 'tags'], cell:BusinessCellStyle},
        functions:{icon:<BsStars size='16px'/>,  placeholder:t('SearchFunctions'),endpoint:'functions', sort:{column:'name', order:'desc'}, columns:['id', 'name', 'is_active'] ,options:[], cell:FunctionCellStyle},
        reports:{icon:<BsBarChartFill size='16px'/>,  placeholder:t('SearchReports'),endpoint:'reports', sort:{column:'name', order:'desc'}, columns:['id', 'created_at', 'user_id'] ,options:['created_at','user_id'], cell:ReportCellStyle},
        sources:{icon:<BsFillLayersFill size='16px'/>,  placeholder:t('SearchKnowledge'),endpoint:'knowledge/sources', sort:{column:'title', order:'desc'}, columns:['id','title', 'type', 'created_at', 'updated_at', 'created_by'] ,options:['type' ,'created_at','created_by', 'updated_by', 'tags'], cell:KnowledgeCellStyle},
    } 

    //CREATING AN ACCESS
    const [accessData, setAccessData] = useState<{name:string, icon:{type:'emoji' | 'icon' | 'image', data:string}}>({name:'', icon:{type:'emoji', data:'☺️'}})
    const selectElement = (type:'conversations' | 'persons' | 'businesses' | 'reports' | 'functions' | 'sources' | 'navigate' | 'assign', id:string) => {
        if (selectAccessPath) onSelectElement({type:'access', name:accessData.name, icon: accessData.icon, structure: selectAccessPath[0].id, source_id:id } )
        else {
            if (selectedSection === 'assign') onSelectElement(type, id)
            else navigate(`/${selectedSection}/${id}`)
        }
        setSearchSection(null)
    }

    //CHANGE SECTION
    const settingsButtonRef = useRef<HTMLButtonElement>(null)
    const settingsBoxRef = useRef<HTMLDivElement>(null)
    useOutsideClick({ref1:settingsButtonRef, ref2:settingsBoxRef, onOutsideClick:() => setShowChangeSection(false)})

    const [showChangeSection, setShowChangeSection] = useState<boolean>(false)

    //FILTER WITH TEXT
    const [text, setText] = useState<string>('')
    const editSearchTerm = (type:'delete' | 'add', term: string) => {
        if (type === 'add') setSearchHistory((prevHistory) => {
            const filteredHistory = prevHistory.filter((item) => item !== term)
            return [term, ...filteredHistory]
        })
        else setSearchHistory((prevHistory) => prevHistory.filter((item) => item !== term))
    }
    useEffect(() => {if(text !== '')editSearchTerm('add', text)},[text])

    //FILTER WITH FILTERS
    const [selectedFilters, setSelectedFilters] = useState<{[key:string]:string[]}>({})
    const handleFiltersChange = (element:string[], option:string ) => {
        setSelectedFilters(prev => ({...prev as any, [option]: element}))
    }

    //CHANGE SECTION
    useEffect(() => {
        setText('')
        let emptyFilters:{[key:string]:string[]} = {}
        sectionFilters[selectedSection].options.map((option) => {emptyFilters[option] = []})
        setSelectedFilters(emptyFilters)

        if (selectedSection === 'navigate') setFetchedData(navigateData)
        else setFetchedData(null)
    },[selectedSection])
    
    //SHOW FILTERS
    const [showFilters, setShowFilters] = useState<boolean>(localStorage?.getItem('showFilters') === 'true' || false)
    useEffect(() => {localStorage.setItem('showFilters', JSON.stringify(showFilters))},[showFilters])

    //WITIGN RESULTS
    const [waitingResults, setWaitingResults] = useState<boolean>(false)

    //SEARCH HISTORY
    const [searchHistory, setSearchHistory] = useState<string[]>(localStorage?.getItem('searchHistory')?JSON.parse(localStorage?.getItem('searchHistory')) :  [])
    useEffect(() => {localStorage.setItem('searchHistory',JSON.stringify(searchHistory))},[searchHistory])

    //FETCHED DATA
    const [fetchedData, setFetchedData] = useState<{total_items:number, page_data:any[] }| null>(null)   

    //SEARCH
    useEffect(() => {
        const fetchFilterData = async() => {
            
            if (selectedSection === 'navigate' || selectedSection === 'assign') {
                const normalizedText = text.trim().toLowerCase()
                const filtered = ( ((selectedSection === 'navigate' ? navigateData:assignData)?.page_data) ?? [] as any).filter((option:any) => {
                    const optionName = selectedSection === 'navigate' ? t(option.name) : option.name
                    return ((optionName || '').toLowerCase().includes(normalizedText)) 
                })
                setFetchedData(prev => ({...prev, page_data:filtered}))
            }
            
            else {
                if (text || Object.values(selectedFilters).some((filter) => filter.length > 0)) {
                    const filters = generateFilter(selectedFilters)
                    const response = await fetchData({ endpoint:`${auth.authData.organizationId}/${sectionFilters[selectedSection].endpoint}`, params:{query:text, sort:sectionFilters[selectedSection].sort, columns:sectionFilters[selectedSection].columns, filters, page_index:1}, getAccessTokenSilently, setValue:setFetchedData, setWaiting:setWaitingResults, auth})
                    if (response?.status === 200) editSearchTerm('add', text)
                }
                else setFetchedData(null)
            }
        } 
        fetchFilterData()
       
    },[text, selectedFilters])
 
     return (
        <Portal>
            <MotionBox   initial={{opacity:0}} onClick={() => setSearchSection(null)}  animate={{opacity:1}} display={'flex'} exit={{opacity:0}} transition={{ duration: '.2' }} position='fixed' justifyContent='center' top={0} left={0} width='100vw' height='100vh' bg='rgba(0, 0, 0, 0.3)' backdropFilter={'blur(1px)'} zIndex={100}>
                <MotionBox  initial={{opacity:0, y:15}}  maxH={'70vh'} h={'fit-content'} mt='15vh'  bg='white'   animate={{opacity:1, y:0}} exit={{opacity:0, y:15}}  transition={{ duration: '.2'}}  onClick={(e) => e.stopPropagation()}  borderRadius={'.5rem'} boxShadow={'rgba(20, 20, 20, 0.2) 0px 16px 32px 0px'}> 
                
                <Flex flexDir={'column'}minH="0" maxH={'70vh'} w='55vw' maxW={'1000px'} bg='white' p='15px' borderRadius={'.5rem'}>

                    {selectAccessPath && 
                    <Box mb='1vh'> 
                        <SectionPathRender type='access' pathList={selectAccessPath}/>
                        <Flex mt='1vh' alignItems={'center'} gap='10px'> 
                            <IconsPicker selectedEmoji={accessData?.icon} excludedSections={['upload']} onSelectEmoji={(value) => setAccessData(prev => ({...prev, icon:value}))}/>
                            <Box maxW='350px' > 
                                <EditText focusOnOpen placeholder={t('Name')} hideInput={false} value={accessData?.name} setValue={(value:string) => setAccessData(prev => ({...prev, name:value}))}/>
                            </Box>
                        </Flex>
                    </Box>}

                    <Flex gap='10px' justifyContent={'space-between'}> 
                        <Flex gap='10px' w='100%'  flex='1' alignItems={'center'}> 
                            {!selectAccessPath && <Box position={'relative'}> 

                                {(selectedSection === 'assign') ? 
                                    <IconButton ref={settingsButtonRef} aria-label='conver-assign' cursor={'default'} icon={sectionFilters[selectedSection].icon} size='sm'  variant={'common'}  color={'text_gray'} bg={'transparent' } _hover={{color:'text_gray', bg:'transparent'}}  onClick={() => {setShowChangeSection(prev => !prev)}}>
                                        {sectionFilters[selectedSection].icon}
                                    </IconButton>
                                :
                                <Tooltip  label={t('SearchOtherSection')} placement='left'  bg='white' color='black'  borderRadius='.5rem' fontSize='.7em' p='6px'> 
                                    <Box display="flex" h='100%' w='100%' alignItems="center" justifyContent="center" >
                                        <IconButton ref={settingsButtonRef} aria-label='conver-settings' icon={sectionFilters[selectedSection].icon} size='sm'  variant={'common'}  color={showChangeSection ? 'text_blue':'text_gray'} bg={showChangeSection ? 'gray_1':'transparent' }  onClick={() => {setShowChangeSection(prev => !prev)}}>
                                            {waitingResults ? <Spinner mt='10px' size='xs'/> :<>{sectionFilters[selectedSection].icon}</>}
                                        </IconButton>
                                    </Box>
                                </Tooltip>
                                }

                                    <AnimatePresence> 
                                    {(showChangeSection && selectedSection !== 'assign') && 
                                    <MotionBox initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '.1', ease: 'easeOut'}}
                                    maxH='40vh'p='8px'  style={{ transformOrigin: 'top left' }}  mt='5px' left={0} overflow={'scroll'} top='100%' gap='10px' ref={settingsBoxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.1)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.5rem'} borderWidth={'1px'} borderColor={'border_color'}>
                                        {Object.keys(sectionFilters || {}).filter(sec => sec!== 'assign').map((section, index) => (
                                            <Flex  color={section === selectedSection ? 'text_blue':'black'} key={`section-${index}`} px='7px' py='5px'  borderRadius={'.5rem'} cursor={'pointer'} fontSize={'.9em'} gap='10px' alignItems={'center'} _hover={{bg:'gray_2'}} onClick={() => {setShowChangeSection(false);setSearchSection(section as any)}}>
                                                <Box color={section === selectedSection ? 'text_blue':'text_gray'}> 
                                                {((sectionFilters as any)?.[section])?.icon}    
                                                </Box>
                                                <Text whiteSpace={'nowrap'}>{t(section)}</Text>
                                            </Flex>
                                        ))}
                                    </MotionBox>}   
                                </AnimatePresence>                 
                            </Box>} 
                            <EditText focusOnOpen placeholder={sectionFilters[selectedSection].placeholder} searchInput value={text} setValue={(value:string) => setText(value)}/>
                        </Flex>

                        <AnimatePresence> 
                            {(['navigate', 'functions', 'assign'].includes(selectedSection) ? text !== '':fetchedData)&& 
                            <MotionBox initial={{opacity:0, scale:0.95}} exit={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{duration:'0.2', ease:'easeOut'}}> 
                                <IconButton isRound bg='transparent' onClick={() => {setText(''); let emptyFilters:{[key:string]:string[]} = {};sectionFilters[selectedSection].options.map((option) => {emptyFilters[option] = []});setSelectedFilters(emptyFilters)}} variant={'common'}  h='28px' w='28px' aria-label="delete-filters" size='xs'>
                                    <Tooltip  label={t('Clear')}  placement='left'  bg='white' color='black'  borderRadius='.5rem' fontSize='.7em' p='6px'> 
                                        <Box display="flex" h='100%' w='100%' alignItems="center" justifyContent="center" >
                                            <RxCross2 size="16px" />
                                        </Box>
                                    </Tooltip>
                                </IconButton>
                            </MotionBox>}
                        </AnimatePresence>

                        {(!['navigate', 'functions', 'assign'].includes(selectedSection)) &&  <IconButton bg='transparent' color={showFilters ? 'text_blue':'black'}  onClick={() => setShowFilters(prev => !prev)} variant={'common'}  h='28px' w='28px' aria-label="toggle-filters" size='xs'>
                            <Tooltip  label={showFilters?t('HideFilters'):t('ShowFilters')}  placement='left'  bg='white' color='black'  borderRadius='.5rem' fontSize='.7em' p='6px'> 
                                <Box display="flex" h='100%' w='100%' alignItems="center" justifyContent="center" >
                                    <IoFilter size="16px" />
                                </Box>
                            </Tooltip>
                        </IconButton>}
                    </Flex>

                    <Flex flexDir={'column'} minH="0" flex='1' > 
                        {(selectedSection !== 'navigate' && selectedSection !== 'functions' && Object.keys(selectedFilters || {}).length > 0  ) &&
                        <Flex w='100%' mt='1vh' maxH={(showFilters)? '1000px':'0'}overflow={'hidden'} transition={showFilters? 'max-height .2s ease-in-out, opacity .2s ease-in-out':'max-height .2s ease-in-out, opacity .2s ease-in-out'}  flexWrap={'wrap'} gap='7px'>
                            {sectionFilters[selectedSection].options.map((filter, index) => {
                                return (
                                <Fragment key={`filter-${index}`}>
                                    {selectedFilters[filter] && 
                                        <FilterButton key={`filter-${index}`}  selectedElements={selectedFilters[filter]} setSelectedElements={(value: string[]) => handleFiltersChange(value, filter)} selectedSection={filter as any} />
                                    }
                                </Fragment>)
                                })}
                        </Flex>
                        }

                        <Flex flexDir={'column'} flex='1' minH="0" mt='1vh' >
                            {fetchedData ? <> 
                                {fetchedData.page_data.length === 0 ? 
                                <Flex h='200px' flexDir={'column'} justifyContent={'center'} alignItems={'center'}>
                                    <Text fontSize={'1.2em'}>{t('NoResultsFound')}</Text>
                                    <Text maxW={'70%'} textAlign={'center'} mt='1vh'fontSize={'.8em'} color='text_gray'>{t('NoResultsFoundWarning')}</Text>
                                    <Button mt='2vh' display={'inline-flex'} variant={'main'} size='sm' onClick={() => {setText(''); let emptyFilters:{[key:string]:string[]} = {};sectionFilters[selectedSection].options.map((option) => {emptyFilters[option] = []});setSelectedFilters(emptyFilters)}}>{t('CleanSearch')}</Button>
                                </Flex>
                                :<>
                                {(selectedSection !== 'navigate' && selectedSection !== 'assign') && <Text fontWeight={'medium'} fontSize={'.9em'}>{t('ResultsFoundCount', {count:fetchedData.total_items})}</Text>}
                                    <Box mt='1vh' overflowY={'scroll'} minH="0" flex='1' > 
                                        {fetchedData.page_data.map((data, index) => {
                                        const CellComponent = sectionFilters[selectedSection].cell
                                        return (<CellComponent key={`cell-${index}`} data={data} index={index}/>)})}
                                    </Box>
                                </>
                                }
                            
                            </>:
                            <> 
                                <Text mb='1vh' fontWeight={'medium'} color='text_gray' fontSize={'.8em'}>{t('RecentSearches')}</Text>
                                {searchHistory.length === 0 ? <Text fontSize={'.8em'} color='text_gray'>{t('NoRecentSearches')}</Text>
                                :<Box overflowY={'scroll'} minH="0" flex='1' >
                                    {searchHistory.map((item, index) => (
                                        <Fragment  key={`search-${index}`}> 
                                        {item !== '' &&  <SearchHistoryComponent  item={item} setText={setText} editSearchTerm={editSearchTerm}/>}
                                        </Fragment>
                                    ))}
                                </Box>}
                            </>}
                        </Flex>
                    </Flex>
                </Flex> 
                </MotionBox>
            </MotionBox>
        </Portal>    
        )
}

export default SearchSection

const SearchHistoryComponent = ({item, setText, editSearchTerm}:{item:string, setText:Dispatch<SetStateAction<string>>, editSearchTerm:(type:'add' | 'delete', text:string) => void }) => {
    
    const [isHovering, setIsHovering] = useState<boolean>(false)

    return (
        <Flex  position={'relative'} cursor={'pointer'}  p='6px' borderRadius={'.5rem'} alignItems={'center'}  justifyContent={'space-between'} _hover={{bg:'gray_2'}} onClick={() => setText(item)} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <Flex gap='10px' alignItems={'center'}>  
                <Icon color='text_gray'  boxSize={'14px'} as={FaMagnifyingGlass}/>
                <Text color='text_gray' fontWeight={'medium'} fontSize={'.8em'}>{item}</Text>
            </Flex>
            <Icon right={'10px'} opacity={isHovering ? 1:0} transform={`scale(${isHovering ?1:0.5})`} transition={'opacity .1s ease-in-out, transform .1s ease-in-out'} zIndex={100} as={RxCross2} position='absolute' color='text_gray' cursor={'pointer'} onClick={(e) => {if (isHovering) {e.stopPropagation(); editSearchTerm('delete', item) }}} />
        </Flex>
    )
}