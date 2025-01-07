//REACT
import { useState, lazy, Suspense, useEffect } from "react"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
//FRONT
import { Flex, Box, Text, Button } from "@chakra-ui/react"
//COMPONENTS
import SectionSelector from "../../Components/Reusable/SectionSelector"
import AccionesButton from "../Conversations/ActionsButton"
//ICONS
import { FaBuilding, FaPlus } from "react-icons/fa6"
import { IoPeopleSharp } from "react-icons/io5"
import { useSession } from "../../../SessionContext"
 
//SECTIONS
const ClientsTable = lazy(() => import('./ClientsTable'))
const BusinessesTable = lazy(() => import('./BusinessesTable'))

const Contacts = ({socket}:{socket:any}) => {

    const { t } = useTranslation('main')
    const session = useSession()
    const navigate = useNavigate()
    const location = useLocation().pathname
    const [selectedSection, setSelectedSection] = useState<'clients' | 'businesses'>(localStorage.getItem('contactsSection')?localStorage.getItem('contactsSection') as 'clients' | 'businesses':'clients')
    
    //CREATE BUSINESS
    const [showCreateBusiness, setShowCreateBusiness] = useState<boolean>(false)

 
    useEffect(() => {setSelectedSection(location.split('/')[2] as 'clients' | 'businesses')},[location])

     return (
        <Flex h='100vh' flexDir={'column'} w='calc(100vw - 55px)' bg='brand.hover_gray' py='1vw' >
            <Box  px='1vw'> 
                <Flex justifyContent={'space-between'} > 
                    <Text fontSize={'1.4em'} fontWeight={'medium'} >{t('Contacts')}</Text>
                    <Flex alignItems={'center'} gap='15px'>
                        {selectedSection === 'businesses' && <Button variant={'main'} size='sm' fontSize={'.9em'} leftIcon={<FaPlus/>} onClick={() => setShowCreateBusiness(true)}>{t('CreateBusiness')}</Button>}
                         <AccionesButton items={selectedSection === 'clients'? session.sessionData.clientsTable?.data.page_data : session.sessionData.contactBusinessesTable?.data.page_data} view={null} section={'contacts'}/>
                    </Flex>
                </Flex>
                <Box h='40px' mb='2vh' > 
                    
                    <SectionSelector notSection sections={['clients', 'businesses']} selectedSection={selectedSection} onChange={(section) => navigate(section)} sectionsMap={{'clients':[t('Clients'),<IoPeopleSharp/> ], 'businesses':[t('Businesses'),<FaBuilding/>]}}/>
                    <Box bg='gray.300' h='1px' w='100%'/>
                </Box>
            </Box>
            <Box px='1vw' flex='1' >
                <Suspense fallback={<></>}>    
                    <Routes >
                        <Route path="/clients/*" element={<ClientsTable socket={socket}/>}  />
                        <Route path="/businesses/*" element={<BusinessesTable showCreateBusiness={showCreateBusiness} setShowCreateBusiness={setShowCreateBusiness} socket={socket}/>}/>
                    </Routes>
                </Suspense>
            </Box>
        </Flex>
    )
}

export default Contacts