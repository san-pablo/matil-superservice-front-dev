//REACT
import { useState, lazy, Suspense, useEffect } from "react"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
//FRONT
import { Flex, Box, Text, Tooltip,Icon, IconButton } from "@chakra-ui/react"
//ICONS
import { FaBuilding } from "react-icons/fa6"
import { IoPeopleSharp } from "react-icons/io5"
import { FaMagnifyingGlass } from "react-icons/fa6" 
import { BsFillBuildingsFill } from "react-icons/bs"
import { BiSolidBuildings } from "react-icons/bi";

//SECTIONS
const ClientsTable = lazy(() => import('./ClientsTable'))
const BusinessesTable = lazy(() => import('./BusinessesTable'))

const Contacts = ({socket}:{socket:any}) => {

    const { t } = useTranslation('main')
    const navigate = useNavigate()
    const location = useLocation().pathname
    const section = location.split('/')[2]
    const [selectedSection, setSelectedSection] = useState<'clients' | 'businesses'>(localStorage.getItem('contactsSection')?localStorage.getItem('contactsSection') as 'clients' | 'businesses':'clients')
    
    //CREATE BUSINESS
    const [hideViews, setHideViews] = useState<boolean>(false)
    const [showCreateBusiness, setShowCreateBusiness] = useState<boolean>(false)

 
    useEffect(() => {setSelectedSection(location.split('/')[2] as 'clients' | 'businesses')},[location])



    const tableWidthHideView =`calc(100vw - 45px)`  
    const tableWidthShowView =`calc(100vw - 45px - 220px)`  

 

     return (
        <Flex h='100vh' flexDir={'column'} w='calc(100vw - 45px)' bg='brand.hover_gray' >
            <Flex zIndex={10} h='100vh' overflow={'hidden'} width={hideViews ? 0:220}transition={'width ease-in-out .2s'}  gap='20px' py='2vh' flexDir={'column'} justifyContent={'space-between'} borderRightColor={'gray.200'} borderRightWidth={'1px'}>

                <Box px='1vw'> 
                <Flex  alignItems={'center'} justifyContent={'space-between'}> 
                        <Text  fontWeight={'semibold'} fontSize={'1.2em'}>{t('Contacts')}</Text>
                        <IconButton bg='transparent' _hover={{bg:'brand.gray_1', color:'brand.text_blue'}} borderColor={'gray.200'} borderWidth={'1px'} variant={'common'}  h='28px' w='28px' aria-label="create-function" size='xs'>
                        <Tooltip  label={t('Search') + '...'}  placement='right'  bg='white' color='black'  borderRadius='.5rem' fontSize='.7em' p='6px'> 
                            <Box display="flex" h='100%' w='100%' alignItems="center" justifyContent="center" transition="transform .5s ease-in-out"  _hover={{ transform: "rotate(90deg)" }} >
                                <FaMagnifyingGlass size="14px" />
                            </Box>
                        </Tooltip>

                        </IconButton>
                </Flex>
                <Box h='1px' w='100%' bg='gray.300' mt='2vh' mb='2vh'/>

                <Flex gap='10px' alignItems={'center'}  bg={section === 'clients'?'white':'transparent'}  transition={section === 'clients'?'box-shadow .2s ease-in-out, border-color .2s ease-in-out, background-color .2s ease-in-out':'box-shadow .2s ease-out, border-color .2s ease-out, background-color .2s ease-out'}    boxShadow={section === 'clients' ? '0 0 3px 0px rgba(0, 0, 0, 0.1)':''} borderWidth={'1px'} borderColor={section === 'clients' ? 'gray.200':'transparent'}  onClick={() => navigate('clients')} _hover={{bg:section === 'clients'?'white':'brand.gray_2'}}  fontWeight={section === 'clients'? 'medium':'normal'}fontSize={'.9em'} cursor={'pointer'} borderRadius={'.5rem'} p='6px'>
                    <Icon as={IoPeopleSharp} boxSize={'14px'}/>
                    <Text transition={'transform .1s ease-in-out'}   transformOrigin="left center" transform={section === 'clients'?'scale(1.02)':'scale(1)'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}   overflow={'hidden'}>{t('Clients')}</Text>
                    </Flex>
                <Flex gap='10px' alignItems={'center'}  bg={section === 'businesses'?'white':'transparent'}  transition={section === 'businesses'?'box-shadow .2s ease-in-out, border-color .2s ease-in-out, background-color .2s ease-in-out':'box-shadow .2s ease-out, border-color .2s ease-out, background-color .2s ease-out'}    boxShadow={section === 'businesses' ? '0 0 3px 0px rgba(0, 0, 0, 0.1)':''} borderWidth={'1px'} borderColor={section === 'businesses' ? 'gray.200':'transparent'}  onClick={() => navigate('businesses')} _hover={{bg:section === 'businesses'?'white':'brand.gray_2'}}  fontWeight={section === 'businesses'? 'medium':'normal'}fontSize={'.9em'} cursor={'pointer'} borderRadius={'.5rem'} p='6px'>
                    <Icon as={BiSolidBuildings} boxSize={'14px'}/>
                    <Text transition={'transform .1s ease-in-out'}   transformOrigin="left center" transform={section === 'businesses'?'scale(1.02)':'scale(1)'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}   overflow={'hidden'}>{t('Businesses')}</Text>
                    </Flex>
                </Box>
            </Flex>


            <Flex bg='brand.hover_gray' h='100vh' flexDir={'column'} px='2vw' py='2vh' width={hideViews ? tableWidthHideView:tableWidthShowView} transition={'width ease-in-out .2s'} right={0}   position="absolute" top={0} >
                <Suspense fallback={<></>}>    
                    <Routes >
                        <Route path="/clients/*" element={<ClientsTable socket={socket} setHideViews={setHideViews}/>}  />
                        <Route path="/businesses/*" element={<BusinessesTable setHideViews={setHideViews} showCreateBusiness={showCreateBusiness} setShowCreateBusiness={setShowCreateBusiness} socket={socket}/>}/>
                    </Routes>
                </Suspense>
            </Flex>
        </Flex>
    )
}

export default Contacts