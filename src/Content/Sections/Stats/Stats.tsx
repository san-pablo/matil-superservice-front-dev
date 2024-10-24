//REACT
import { useEffect, lazy, Suspense, useState, createElement, ReactElement } from 'react'
import { Routes, Route, useNavigate } from "react-router-dom"
import { useAuth } from '../../../AuthContext'
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from '../../API/fetchData'
//FRONT
import { Flex, Text, Box, IconButton } from "@chakra-ui/react"
import '../../Components/styles.css'
//COMPONENTS
import SectionSelector from '../../Components/Reusable/SectionSelector'
//FUNCTIONS
import obtainDates from '../../Functions/obtainDates'
//ICONS
import { FaRobot, FaTicket } from "react-icons/fa6"
import { IoPeople} from "react-icons/io5"
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io"
import { FaClipboardList } from "react-icons/fa"

//STATS SECTIONS
const Users = lazy(() => import('./Sections/Users'))
const Conversations = lazy(() => import('./Sections/Conversations'))
const Matilda = lazy(() => import('./Sections/Matilda'))
const CSAT = lazy(() => import('./Sections/CSAT'))

 
//TYPING
type IconKey = 'conversations' | 'matilda' | 'users' | 'csat'
type filter = {'initial_date':string, 'final_date':string, 'channel_types':string[]}


//MAIN FUNCTION
function Stats () {

    //CONSTANTS
    const { t } = useTranslation('stats')
    const auth = useAuth()
    const sectionsMap: Record<IconKey, [string, ReactElement]> = {conversations: [t('Conversations'),<FaTicket/>], matilda: ['Tilda',<FaRobot/>], users: [t('Users'),<IoPeople/>], csat:[t('CSAT'),<FaClipboardList/> ]}
    const sectionsList: IconKey[] = ['conversations', 'matilda', 'users', 'csat']
    const curentSection = localStorage.getItem('curentSectionStats') || 'conversations'

    //BOOLEAN FOR WAIT THE FILTERS
    const [waitingFilters, setWaitingFilters] = useState<boolean>(false)

    //NAVIGATE LOGIC
    const [selectedSection, setSelectedSection] =  useState<IconKey>(curentSection as IconKey)


    const navigate = useNavigate()
    useEffect(() => {

        document.title = `${t('Stats')} - ${sectionsMap[selectedSection][0]} - ${auth.authData.organizationName} - Matil`
        localStorage.setItem('currentSection', `stats`)

        navigate(selectedSection)
        if (selectedSection) {
            setSelectedYear(parseInt(sectionsFilters[selectedSection].initial_date.split('/')[2]))
            setSelectedMonthIndex(parseInt(sectionsFilters[selectedSection].initial_date.split('/')[1]) - 1)
        }

    }, [selectedSection])
 

    //GLOBAL INFO 
    const [sectionsData, setSectionsData] = useState<{[key in IconKey]:null | Object}>({
        'conversations':null,
        'matilda':null,
        'users':null,
        'csat':null,
    })

    //GLOBAL FILTERS
    const [sectionsFilters, setSectionFilters] = useState<{[key in IconKey]:filter}>({
        'conversations':{'initial_date':obtainDates().startDate,'final_date':obtainDates().endDate, 'channel_types':[]},
        'matilda':{'initial_date':obtainDates().startDate,'final_date':obtainDates().endDate,'channel_types':[]},
        'users':{'initial_date':obtainDates().startDate,'final_date':obtainDates().endDate, 'channel_types':[]},
        'csat':{'initial_date':obtainDates().startDate,'final_date':obtainDates().endDate, 'channel_types':[]}
    })

    //DATES LOGIC AND UPDATE FILTERS WITH MONTH CHANGE
    const months = [t('Month_1'), t('Month_2'), t('Month_3'), t('Month_4'), t('Month_5'), t('Month_6'), t('Month_7'), t('Month_8'), t('Month_9'), t('Month_10'), t('Month_11'), t('Month_12')]
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
    const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(new Date().getMonth())
    const handleMonthBack = () => {
        if (selectedMonthIndex === 0) {
          setSelectedMonthIndex(11)
          setSelectedYear(prevYear => prevYear - 1)
        } else setSelectedMonthIndex(prevIndex => prevIndex - 1) 
    }
    const handleMonthForward = () => {
        if (selectedMonthIndex === 11) {
          setSelectedMonthIndex(0)
          setSelectedYear(prevYear => prevYear + 1)
        } else setSelectedMonthIndex(prevIndex => prevIndex + 1)
        
    }
    useEffect(() => {
        const formatDate = (date:Date) => {return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`}
        const updateFilters = () => {

            const today = new Date();
            const currentDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);

            const currentYear = currentDate.getFullYear()
            const currentMonthIndex = currentDate.getMonth()
            const startDate = new Date(selectedYear, selectedMonthIndex, 1)
            let endDate = new Date(selectedYear, selectedMonthIndex + 1, 0)
            if (selectedYear === currentYear && selectedMonthIndex === currentMonthIndex) endDate = currentDate
            
            const isoStartDate = formatDate(startDate)
            const isoEndDate = formatDate(endDate)

            uploadFilters({...sectionsFilters[selectedSection],'initial_date': isoStartDate, 'final_date': isoEndDate})
        }
        if (sectionsData[selectedSection] !== null) updateFilters()
      }, [selectedMonthIndex, selectedYear])
    
    
  
    //FETCH DATA LOGIC ON SECTION CHANGE
    useEffect(() => {

        if (sectionsData[selectedSection] === null) {
            fetchData({auth:auth, endpoint:`${auth.authData.organizationId}/admin/statistics/${selectedSection}`, setValue:(data:any) => setSectionsData({...sectionsData, [selectedSection]:data}), params:sectionsFilters[selectedSection]})
        }
    },[selectedSection])

    //FECTCH DATA ON FILTER UPLOAD
    const uploadFilters = (newFilters:filter) => {
        if (JSON.stringify(newFilters) !== JSON.stringify(sectionsFilters[selectedSection])){
            fetchData({auth:auth, endpoint:`${auth.authData.organizationId}/admin/statistics/${selectedSection}`, setValue:(data:any) => setSectionsData({...sectionsData, [selectedSection]:data}), setWaiting:setWaitingFilters,params:newFilters})
            setSectionFilters(prevFilters => ({...prevFilters, [selectedSection]:newFilters}))
        }
    }
 
    return(<>
    <Box overflowY={'scroll'} height={'100vh'}> 
        <Box p='2vw' bg='white'  width={'calc(100vw - 55px)'}   >
            
            <Box> 
                <Flex justifyContent={'space-between'} alignItems={'end'}> 
                    <SectionSelector selectedSection={selectedSection} sections={sectionsList} sectionsMap={sectionsMap}  onChange={(section:string) => {setSelectedSection(section as IconKey)}} /> 
                    <Flex gap='20px'> 
                        
                        <Flex alignItems={'end'} gap='5px'> 
                             <Flex alignItems={'center'} gap='10px' display={'inline-flex'} height={'31px'}  px='5px' borderColor='gray.300' borderWidth={'1px'} borderRadius={'.7rem'}>
                                <IconButton size='10px' p='2px' color='gray.600' _hover={{color:'black', bg:'brand.hover_gray'}}  border='none' bg='transparent' aria-label='month-back' icon={<IoIosArrowBack/>} onClick={handleMonthBack}/>
                                <Text width={'100px'} textAlign={'center'}>{months[selectedMonthIndex]}</Text>
                                <IconButton isDisabled={selectedYear === new Date().getFullYear() && selectedMonthIndex === new Date().getMonth()}  size='10px' p='2px' color='gray.600' _hover={{color:'black', bg:'brand.hover_gray'}} border='none' bg='transparent' aria-label='month-forward' icon={<IoIosArrowForward/>} onClick={handleMonthForward}/>
                            </Flex>
                         
                            <Text fontWeight={'medium'} fontSize={'.6em'} color='gray.600'>{selectedYear}</Text>
                        </Flex>
                    </Flex>
                </Flex>
            </Box> 
            <Box height={'1px'} width={'100%'} bg='gray.300' mt='2vh' mb='2vh'/>

            <Box height={'100vh'} width={'calc(96vw - 55px)'}> 
                <Suspense fallback={<></>}>    
                    <Routes >
                        <Route path="/users" element={<Users waitingFilters={waitingFilters} data={sectionsData.users} />} />
                        <Route path="/conversations" element={<Conversations waitingFilters={waitingFilters}  data={sectionsData.conversations} />} />
                        <Route path="/matilda" element={<Matilda waitingFilters={waitingFilters} data={sectionsData.matilda} />} />
                        <Route path="/csat" element={<CSAT waitingFilters={waitingFilters} data={sectionsData.csat} />} />
                    </Routes>
                </Suspense>
            </Box>
        </Box>
    </Box>
    </>)
}

export default Stats