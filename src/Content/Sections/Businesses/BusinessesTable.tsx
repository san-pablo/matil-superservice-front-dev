//REACT
import { useState, useEffect, useRef, Fragment, useMemo } from "react"
import { useNavigate } from 'react-router-dom'
import { useAuth } from "../../../AuthContext" 
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Box, Text, Tooltip, Button, IconButton, Skeleton } from '@chakra-ui/react'
//COMPONENTS
import EditText from "../../Components/Reusable/EditText"
import ActionsButton from "../Conversations/ActionsButton"
import Table from "../../Components/Reusable/Table"
//FUNCTIONS
import timeAgo from "../../Functions/timeAgo"
import timeStampToDate from "../../Functions/timeStampToString"
//ICONS
import { FaMagnifyingGlass, FaPlus, FaFilter } from "react-icons/fa6" 
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io"

//TYPING
import { ContactBusinessesProps,  HeaderSectionType } from "../../Constants/typing"
import { useSession } from "../../../SessionContext"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import CreateBusiness from "./CreateBusiness"


    
//GET THE CELL STYLE
const CellStyle = ({ column, element }:{column:string, element:any}) => {
    
    const t_formats = useTranslation('formats').t

    if (column === 'created_at' || column === 'last_interaction_at' )  
    return(
        <Tooltip  label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    else if (column === 'labels') {
        return(<> 
            {(!element || element === '')?<Text>-</Text>:
            <Flex gap='5px' flexWrap={'wrap'}>
                {element.split(',').map((label:string, index:number) => (
                <Flex bg='gray.200' borderColor={'gray.300'} borderWidth={'1px'} p='4px' borderRadius={'.5rem'} fontSize={'.8em'} key={`client-label-${index}`}>
                    <Text>{label}</Text>
                </Flex>
                ))}
            </Flex>}
        </>)
    }
    else return ( <Text whiteSpace={'nowrap'} fontWeight={column === 'name'?'medium':'normal' } textOverflow={'ellipsis'} overflow={'hidden'}>{element === ''?'-':element}</Text>)
}

//MAIN FUNCTION
function ContactBusinessesTable ({addHeaderSection}:{addHeaderSection:HeaderSectionType}) {

    //AUTH CONSTANT
    const auth = useAuth()
    const session = useSession()
    const { t } = useTranslation('businesses')
    const navigate = useNavigate()

    //MAPPING CONSTANTS
    const columnsBusinessesMap:{[key:string]:[string, number]} = {name: [t('name'), 200], labels:  [t('labels'), 350], created_at:  [t('created_at'), 150], last_interaction_at:  [t('last_interaction_at'), 150], notes: [t('notes'), 350]}

    //CONTAINER REF
    const containerRef = useRef<HTMLDivElement>(null)
    const tableBoxRef = useRef<HTMLDivElement>(null)

    //BOOLEAN FOR WAIT THE INFO
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)

    //CREATE NEW BUSINESS
    const [showCreateBusiness, setShowCreateBusiness] = useState<boolean>(false)
    
    //SELECT DATA LOGIC
    const [businesses, setBusinesses] = useState<ContactBusinessesProps | null>(null)
    const [filters, setFilters] = useState<{page_index:number, search?:string, sort_by?:string, order?:'asc' | 'desc'}>({page_index:1})
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)


    //FETCH DATA ON FIRST RENDER
    useEffect(() => {
        document.title = `${t('ContactBusinesses')} - ${auth.authData.organizationName} - Matil`
        localStorage.setItem('currentSection', `contact-businesses`)

        const fetchBusinessessData = async() => {
            if (session.sessionData.contactBusinessesTable) {
                setBusinesses(session.sessionData.contactBusinessesTable.data)
                setFilters(session.sessionData.contactBusinessesTable.filters)
                setSelectedIndex(session.sessionData.contactBusinessesTable.selectedIndex)
                setWaitingInfo(false)
            }
            else {
                const businessResponse = await fetchData({endpoint:`${auth.authData.organizationId}/contact_businesses`, setValue:setBusinesses, setWaiting:setWaitingInfo, params:{page_index:1},auth:auth})
                if (businessResponse?.status === 200) session.dispatch({type:'UPDATE_BUSINESSES_TABLE',payload:{data:businessResponse?.data, filters, selectedIndex:-1}})
            }
        }    
        fetchBusinessessData()
    }, [])
 
  
      
    //FETCH NEW DATA ON FILTERS CHANGE
    const fetchBusinessDataWithFilter = async (new_filters:{page_index:number, sort_by?:string, search?:string, order?:'asc' | 'desc'} | null) => {
    
         const response = await fetchData({endpoint:`${auth.authData.organizationId}/contact_businesses`, setValue:setBusinesses, setWaiting:setWaitingInfo, params:new_filters?new_filters:filters, auth})
        if (response?.status === 200) {            
            session.dispatch({ type: 'UPDATE_BUSINESSES_TABLE', payload: {data:response.data, filters:filters} })
            if (new_filters) setFilters(new_filters)
         }
    }

    //SORT BY AND SHOW ICON LOGIC
    const requestSort = (key: string) => {
        const direction = (filters.sort_by === key && filters.order === 'asc') ? 'desc' : 'asc';
        fetchBusinessDataWithFilter({...filters, sort_by: key, order: direction as 'asc' | 'desc'})
     }
    const getSortIcon = (key: string) => {
        if (filters.sort_by === key) { 
            if (filters.order === 'asc') return true
            else return false
        }
        else return null    
    }

    const rowClick = (row:any, index:number) => {
        session.dispatch({type:'UPDATE_BUSINESSES_TABLE_SELECTED_ITEM', payload:{index}})
        navigate(`/contact-businesses/business/${row.id}`)
    }

    
    const memoizedCreateBusiness = useMemo(() => (
        <ConfirmBox setShowBox={setShowCreateBusiness}>
            <CreateBusiness setShowBox={setShowCreateBusiness} actionTrigger={(data:any) => fetchBusinessDataWithFilter(null)}/>
        </ConfirmBox>
    ), [showCreateBusiness])

    //FRONT
    return(<>
        {showCreateBusiness && memoizedCreateBusiness}

        <Box bg='white' height={'calc(100vh - 60px)'} width={'calc(100vw - 55px)'} overflowX={'scroll'} overflowY={'hidden'} p='2vw'>
    
            {/*FILTRAR LA TABLA*/}
            <Flex justifyContent={'space-between'}> 
                <Text fontWeight={'medium'} fontSize={'1.5em'}>{t('ContactBusinesses')}</Text>
                <Flex gap='15px'> 
                    <Button variant={'common'} whiteSpace='nowrap'  leftIcon={<FaPlus/>} size='sm' onClick={() =>setShowCreateBusiness(true)}>{t('CreateBusiness')}</Button>
                    <ActionsButton items={businesses ? businesses.page_data:[]} view={null} section={'clients'}/>
                 </Flex>
             </Flex>
        
            <Flex gap='15px' mt='2vh'> 
                <Box width={'350px'}> 
                    <EditText value={filters.search} setValue={(value) => setFilters(prev => ({...prev, search:value}))} searchInput={true}/>
                </Box>
                <Button  variant={'common'} leftIcon={<FaFilter/>} size='sm'  onClick={() => fetchBusinessDataWithFilter({...filters,page_index:1})}>{t('ApplyFilters')}</Button>
            </Flex>
        
            <Flex  mt='2vh' justifyContent={'space-between'} alignItems={'center'}> 
                <Skeleton isLoaded={!waitingInfo} >
                    <Text  fontWeight={'medium'} color='gray.600' fontSize={'1.2em'}> {t('BusinessesCount', {count:businesses?.total_contact_businesses})}</Text> 
                </Skeleton>
                <Flex alignItems={'center'} justifyContent={'end'} gap='10px' flexDir={'row-reverse'}>
                    <IconButton isRound size='xs' aria-label='next-page' icon={<IoIosArrowForward />} isDisabled={filters.page_index >= Math.floor((businesses?.total_contact_businesses || 0)/ 50)} onClick={() => fetchBusinessDataWithFilter({...filters,page_index:filters.page_index + 1})}/>
                        <Text fontWeight={'medium'} fontSize={'.9em'} color='gray.600'>{t('Page')} {filters.page_index}</Text>
                    <IconButton isRound size='xs' aria-label='next-page' icon={<IoIosArrowBack />} isDisabled={filters.page_index === 1} onClick={() => fetchBusinessDataWithFilter({...filters,page_index:filters.page_index - 1})}/>
                </Flex>
            </Flex>
            
            {/*TABLA*/}
            <Box>             
                <Skeleton isLoaded={!waitingInfo}> 
                    <Table data={businesses?.page_data || []} CellStyle={CellStyle} noDataMessage={t('NoBusinesses')} excludedKeys={['id']} columnsMap={columnsBusinessesMap} onClickRow={rowClick} requestSort={requestSort} getSortIcon={getSortIcon} currentIndex={selectedIndex}/>
                </Skeleton>
            </Box>
    
        </Box>
        </>)
}

export default ContactBusinessesTable

 