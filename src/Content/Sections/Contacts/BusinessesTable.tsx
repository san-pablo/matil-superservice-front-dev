//REACT
import { useState, useEffect, useMemo, Dispatch, SetStateAction, lazy, useRef, ReactElement } from "react"
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from "../../../AuthContext" 
import { useTranslation } from "react-i18next"
import { useAuth0 } from "@auth0/auth0-react"
import { useSession } from "../../../SessionContext"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { motion, isValidMotionProp } from 'framer-motion'
import { Flex, Box, Text, Tooltip, IconButton, Skeleton,Button, chakra, shouldForwardProp  } from '@chakra-ui/react'
 //COMPONENTS
import Table from "../../Components/Reusable/Table"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import CreateBusiness from "./CreateBusiness"
import ActionsButton from "../Conversations/ActionsButton"
import FilterButton from "../../Components/Reusable/FilterButton"
//FUNCTIONS
import timeAgo from "../../Functions/timeAgo"
import timeStampToDate from "../../Functions/timeStampToString"
import useOutsideClick from "../../Functions/clickOutside"
//ICONS
import { IoSend } from "react-icons/io5";
import { PiSidebarSimpleBold } from "react-icons/pi"
import { FaPlus } from "react-icons/fa6"
//TYPING
import { ContactBusinessesProps, FilterType } from "../../Constants/typing"
   //SECTION
const Business = lazy(() => import('./Business'))
  

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//GET THE CELL STYLE
const CellStyle = ({ column, element }:{column:string, element:any}) => {
    
    const auth = useAuth()
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
    else if (column === 'tags') {
        const tags = auth.authData.tags
        return (
            <Flex minH={'35px'} alignItems={'center'}> 
                {element.length === 0? <Text>-</Text>:
                    <Flex gap='5px' flexWrap={'wrap'}>
                        {element.map((label:string, index:number) => (
                            <Flex  bg='brand.gray_1' borderWidth={'1px'} p='4px' borderRadius={'.5rem'} fontSize={'.8em'} key={`client-label-${index}`}>
                                <Text>{tags?.find(tag => tag.uuid === label)?.name}</Text>
                            </Flex>
                        ))}
                    </Flex>
                }
            </Flex>
        )
    }

    else return ( <Text fontSize={'.9em'} whiteSpace={'nowrap'} fontWeight={column === 'name'?'medium':'normal' } textOverflow={'ellipsis'} overflow={'hidden'}>{element === ''?'-':element}</Text>)
}

//MAIN FUNCTION
function BusinessesTable ({showCreateBusiness, setShowCreateBusiness, socket, setHideViews}:{showCreateBusiness:boolean, setShowCreateBusiness:Dispatch<SetStateAction<boolean>>,  setHideViews:Dispatch<SetStateAction<boolean>>, socket:any}) {

    //AUTH CONSTANT
    const auth = useAuth()
    const session = useSession()
    const location = useLocation().pathname
    const { t } = useTranslation('businesses')
    const navigate = useNavigate()
    const { getAccessTokenSilently } = useAuth0()

    //MAPPING CONSTANTS
    const columnsBusinessesMap:{[key:string]:[string, number]} = {name: [t('name'), 200], domain:  [t('domain'), 150],tags:  [t('tags'), 350], created_at:  [t('created_at'), 180], last_interaction_at:  [t('last_interaction_at'), 180], notes: [t('notes'), 450]}
 

    //EXPAND CLIENT
    const [expandClient, setExpandClient] = useState<boolean>(false)
    useEffect(() => {setExpandClient(location.split('/')[location.split('/').length - 1] === 'businesses')},[location])

    //BOOLEAN FOR WAIT THE INFO
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)

    
    //SELECT DATA LOGIC
    const [businesses, setBusinesses] = useState<ContactBusinessesProps | null>(null)
    const [tableFilters, setTableFilters] = useState<{page_index: number, sort?:{column:string, order:'asc' | 'desc'}}>({page_index:1})
    const [filters, setFilters] = useState<FilterType>({logic:'AND', groups:[]})
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)


    //FETCH DATA ON FIRST RENDER
    useEffect(() => {document.title = `${t('ContactBusinesses')} - ${auth.authData.organizationName} - Matil`},[location]) 
    useEffect(() => {
        localStorage.setItem('currentSection', `contact-businesses`)

        const fetchBusinessessData = async() => {
            const businessResponse = await fetchData({endpoint:`${auth.authData.organizationId}/contact_businesses`, setValue:setBusinesses, setWaiting:setWaitingInfo,getAccessTokenSilently, params:{page_index:1, filters}, auth})
            if (businessResponse?.status === 200) session.dispatch({type:'UPDATE_BUSINESSES_TABLE',payload:{data:businessResponse?.data, filters, selectedIndex:-1}})
        }    
        fetchBusinessessData()
    }, [])
 
    
    //NAVIGATE TO A BUSINESS
    const rowClick = (row:any, index:number) => {
        session.dispatch({type:'UPDATE_BUSINESSES_TABLE_SELECTED_ITEM', payload:{index}})
        navigate(`${row.id}`)
        setSelectedIndex(index)
    }

    //HIDE BUSINESS LOGIC
    const conversationContainerRef = useRef<HTMLDivElement>(null)
    const tableContainerRef = useRef<HTMLDivElement>(null)
    useOutsideClick({ref1:conversationContainerRef,  ref2:tableContainerRef,  onOutsideClick:() => navigate(`/contacts/businesses`)})
    useEffect(() => {
        const handleKeyDown = (event:KeyboardEvent) => {
              switch (event.code) {           
                case 'Escape':
                    if (!location.endsWith('clients')) navigate(`/contacts/businesses`)
                    break        
                default:
                  break
              }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => {window.removeEventListener('keydown', handleKeyDown)}
    },[location])

      
    //SORT LOGIC
    const requestSort = (key: string) => {
        const direction = (tableFilters?.sort?.column === key && tableFilters?.sort.order === 'asc') ? 'desc' : 'asc'
        fetchBusinessDataWithFilter(null, {...tableFilters, sort:{column:key, order:direction} })
    }
    const getSortIcon = (key: string) => {
        if (tableFilters?.sort?.column === key) { 
            if (tableFilters?.sort.order === 'asc') return true
            else return false
        }
        else return null    
    }
 
    //FETCH NEW DATA ON FILTERS CHANGE
    const fetchBusinessDataWithFilter = async (selectedFilters:FilterType | null, selectedTableFilters:{page_index: number, sort?:{column:string, order:'asc' | 'desc'}} | null, callMoreElements = false) => {
        let currentTableFilters
        let currentFilters
        if (selectedFilters) {
            currentFilters = selectedFilters
            setFilters(selectedFilters)
        }
        else currentFilters = filters
        if (selectedTableFilters) {
            currentTableFilters = selectedTableFilters
            setTableFilters(selectedTableFilters)
        }
        else currentTableFilters = tableFilters

        const callDict:any = {endpoint:`${auth.authData.organizationId}/contact_business`, getAccessTokenSilently,setValue:setBusinesses, params:{filters:currentFilters, ...currentTableFilters}, auth}
        if (!callMoreElements) callDict.setWaiting = setWaitingInfo
        await fetchData(callDict)
    }

   
    
    const memoizedCreateBusiness = useMemo(() => (
        <ConfirmBox setShowBox={setShowCreateBusiness}>
            <CreateBusiness setShowBox={setShowCreateBusiness} actionTrigger={(data:any) => fetchBusinessDataWithFilter(null, null)}/>
        </ConfirmBox>
    ), [showCreateBusiness])

    const clientBoxWidth = expandClient ? Math.min(window.innerWidth * 0.6, window.innerWidth - 500) - 200 : Math.min(window.innerWidth * 0.6, window.innerWidth - 500)


    //FRONT
    return(<>
        {showCreateBusiness && memoizedCreateBusiness}
 
        <MotionBox width={clientBoxWidth + 'px'}  ref={conversationContainerRef} overflowY={'scroll'} initial={{ width: clientBoxWidth + 'px', opacity: expandClient?1:0}} animate={{ width: clientBoxWidth + 'px',  opacity: expandClient?0:1  }} exit={{ width: clientBoxWidth + 'px',  opacity: expandClient?1:0}} transition={{ duration: '.2'}} 
        bg='white' boxShadow="-4px 0 6px -2px rgba(0, 0, 0, 0.1)" top={0} right={0} pointerEvents={expandClient ?'none':'auto'} height={'100vh'}  p={expandClient ?'1vw':'0'} overflowX={'hidden'} position='absolute' zIndex={100} overflow={'hidden'} >
            <Business socket={socket}/> 
        </MotionBox>

        <Box height={'100%'} width={'100%'} overflowX={'scroll'} overflowY={'hidden'} >
    
            <Flex alignItems={'center'} justifyContent={'space-between'}> 
                <Flex flex={1} gap='10px' alignItems={'center'}> 
                    <Tooltip  label={t('HideSidebar')}  placement='right'  bg='white' color='black'  borderRadius='.5rem' fontSize='.7em' p='6px'> 
                        <IconButton bg='transparent' _hover={{bg:'brand.gray_1', color:'brand.text_blue'}} icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'18px'}/>} variant={'common'}  h='28px' w='28px' aria-label="hide-sidebar" size='xs' onClick={() => setHideViews(prev => (!prev))} />
                    </Tooltip>
                    <Text flex='1' minW={0} fontWeight={'medium'} fontSize={'1.2em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{t('Businesses')}</Text>
                </Flex>
                <Button variant='main' size={'sm'} leftIcon={<FaPlus/>} onClick={() => setShowCreateBusiness(true)}>{t('CreateBusiness')}</Button> 
            </Flex>   

            <Flex mt='2vh'> 
             </Flex>

            <Flex gap='20px' mt='2vh' alignItems={'center'} > 
                <Skeleton  isLoaded={!waitingInfo} >
                    <Text fontWeight={'medium'} color='gray.600' > {t('BusinessesCount', {count:businesses?.total_items})}</Text> 
                </Skeleton>
                <Button leftIcon={<IoSend/>} size='sm' variant={'common'} >{t('NewMessage')}</Button>
                <ActionsButton items={businesses?.page_data} section={'contacts'} view={null}/>
            </Flex>

 
            <Box ref={tableContainerRef} mt='2vh'> 
                <Table data={businesses?.page_data || []} CellStyle={CellStyle} noDataMessage={t('NoBusinesses')} excludedKeys={['id', 'cdas', 'organization_id']} columnsMap={columnsBusinessesMap} onClickRow={rowClick} requestSort={requestSort} getSortIcon={getSortIcon} currentIndex={selectedIndex} onFinishScroll={() => fetchBusinessDataWithFilter(null, {...tableFilters, page_index:tableFilters.page_index + 1}, true)}/>
            </Box>
        </Box>
        </>)
}

export default BusinessesTable

 