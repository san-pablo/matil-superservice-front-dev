/*
    SETITNGS SECTION 
*/

//REACT
import  { Suspense, useEffect, lazy, useRef, Fragment } from "react"
import { Routes, Route,  useNavigate, useLocation } from "react-router-dom" 
import { useAuth } from "../../../AuthContext"
import { useTranslation } from 'react-i18next'
//FRONT
import { Box, Flex, Text, Icon } from '@chakra-ui/react'
import '../../Components/styles.css'
//ICONS
import { IconType } from "react-icons"
import { IoPerson } from "react-icons/io5"
import { BsLightningFill } from "react-icons/bs"
import { BiSolidBuildings } from "react-icons/bi"
import { FaDoorOpen, FaPlug, FaHeadset } from "react-icons/fa"
import { HiChatAlt2 } from "react-icons/hi"
import { PiDesktopTowerFill, PiChatsFill } from "react-icons/pi"


//TYPING
import { IconKey, SubSectionProps, SectionsListProps } from "../../Constants/typing"

//MAIN
const Main = lazy (() => import('./Main')) 
//ORGANIZATION
const Data = lazy(() => import('./Organization/Data'))
//const Payments = lazy(() => import('./Organization/Payments'))
//USERS
const User = lazy(() => import('./Users/User'))
const AdminUsers = lazy(() => import('./Users/AdminUsers'))
const Groups = lazy(() => import('./Users/Groups'))
//SUPPORT
const HelpCenter = lazy(() => import('./Support/HelpCenter'))
const Surveys = lazy(() => import('./Support/Surveys'))
//WORKFLOWS
const ViewsList = lazy(() => import('./Workflows/Views'))
const EditView = lazy(() => import('./Workflows/EditView'))
const Shortcuts = lazy(() => import('./Workflows/Shortcuts'))
const Fields = lazy(() => import('./Workflows/Fields'))
const TicketsData = lazy(() => import('./Workflows/TicketsData'))
//ACTIONS
const Triggers = lazy(() => import('./Actions/Triggers'))
const Automations = lazy(() => import('./Actions/Automations'))
//CHANNELS
const Chatbot = lazy(() => import('./Channels/Chatbot'))
const Google = lazy(() => import('./Channels/Google'))
const Mail = lazy(() => import('./Channels/Mail'))
const Instagram = lazy(() => import('./Channels/Instagram'))
const Whatsapp = lazy(() => import('./Channels/Whatsapp'))
const Phone = lazy(() => import('./Channels/Phone'))
//INTEGRATIOSN
const Shopify = lazy(() => import('./Integrations/Shopify'))


interface ExpandableSectionProps {
    section: IconKey
    subSections: SubSectionProps
  }
  
const Section = ({ section, subSections }: ExpandableSectionProps) => {
    
    //TRANSLATION
    const { t } = useTranslation('settings')

    //CONSTANTS
    const navigate = useNavigate()
    const selectedSection = useLocation().pathname.split('/')[2]
    const selectedSubSection = useLocation().pathname.split('/')[3]
    const sectionsList: SectionsListProps = {'organization':t('Organization'), 'users':t('Users'), 'support':t('Support'),  'workflows':t('BusinessRules'),  'actions':t('Actions'),  'channels': t('Channels'), 'integrations':t('Integrations'),'main':t('Main')}
    const iconsMap: Record<IconKey, IconType> = {organization: BiSolidBuildings, users: IoPerson, support:PiChatsFill, workflows:PiDesktopTowerFill, actions:BsLightningFill, channels: HiChatAlt2, integrations:FaPlug, main:FaDoorOpen}

    //NAVIGATE
    const navigateToSection = (section:string) => {
        navigate(section)
        localStorage.setItem('currentSettingsSection',section)
    }
    return(<> 
        {section === 'main' ? 
         <Flex gap='10px' p='5px' _hover={{ color:'black'}} color={selectedSection === 'main'?'black':'gray.600'}  fontWeight={selectedSection === 'main'?'medium':'normal'}  onClick={() => {navigateToSection('main')}}  bg={selectedSection === 'main'?'white':'transparent'} cursor={'pointer'} alignItems={'center'} borderRadius={'.5rem'}>
            <Icon boxSize={'15px'} as={iconsMap[section]}/>
            <Text >{sectionsList[section]}</Text>
        </Flex>:
       <Flex mt='1vh' gap='10px' p='5px' _hover={{ color:'black'}} color={selectedSection === section?'black':'gray.600'}  fontWeight={selectedSection === section?'medium':'normal'}  onClick={() => {navigateToSection(`${section}/${subSections[0][1]}`)}}  cursor={'pointer'}  alignItems={'center'} borderRadius={'.5rem'}>
            <Icon boxSize={'16px'} as={iconsMap[section]}/>
            <Text >{sectionsList[section]}</Text>
        </Flex>}
 
        {subSections.map((sec, index) => (
            <Flex  key={`${section}-${sec}-${index}`} p='4px'  color={selectedSubSection === sec[1]?'black':'gray.600'} fontWeight={selectedSubSection === sec[1]?'medium':'normal'}  bg={selectedSubSection === sec[1]?'white':'transparent'} _hover={{color:'black'}} onClick={() => navigateToSection(`${section}/${sec[1]}`)} alignItems={'center'} cursor={'pointer'} borderRadius='.3rem'fontSize={'.9em'}   justifyContent={'space-between'}    >
                <Text fontSize={'.95em'} ml='25px'  >{sec[0]}</Text>
            </Flex>  
        ))}
    </>)
    }


function Settings () {

    //TRANSLATION
    const { t } = useTranslation('settings')

    //SECTIONS
    const auth = useAuth()
    const isAdmin = auth.authData.users?.[auth.authData?.userId || '']?.is_admin

    //SUBSECTINOS
    const subSections: SubSectionProps[] = [
        [[t('Data'), 'data']],
        [[t('Profile'), 'user'], [t('Users'),'admin-users'], [t('Groups'),'groups']],
        [[t('HelpCenter'), 'help-center'], [t('Surveys'), 'surveys']],
        [[t('Views'), 'edit-views'], [t('Shortcuts'), 'shortcuts'], [t('Tickets'), 'tickets'], [t('Fields'), 'fields']],
        [[t('Triggers'), 'triggers'], [t('Automations'), 'automations']],
        [[t('Web'),'web'], ['Whatsapp','whatsapp'],['Instagram','instagram'], ['Google Business','google-business'], [t('Mail'),'mail']],
        [['Shopify','shopify']]
    ] 
    
    const sectionsList: (IconKey | '')[] = isAdmin ? ['organization', 'users', 'support', 'workflows', 'actions', 'channels', 'integrations'] : ['users']

    //CONSTANTS
    const navigate = useNavigate()
    const location = useLocation().pathname
 
    //SCROLL REF 
    const scrollRef = useRef<HTMLDivElement>(null)

    //NAVUGATE TO CURRENT SECTION
    useEffect(() => {
        const section = localStorage.getItem('currentSettingsSection')
        localStorage.setItem('currentSection', 'settings')
        if (location.split('/')[location.split('/').length - 1] === 'settings' && !window.location.hash.substring(1)) navigate(section !== null ? section : 'main')
    }, [])
   
    return( 
    <Flex>  
        <Flex flexDir="column" height={'100vh'} py="5vh" px='15px'  bg='#f1f1f1' width='220px' borderRightWidth="1px" borderRightColor="gray.200">
            <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('Settings')}</Text>
            <Box height={'1px'} width={'100%'} bg='gray.300' mt='2vh' mb='2vh'/>
            <Section  section={'main'} subSections={[]}  />
            <Box overflowY="auto" flex="1">
                {sectionsList.map((section, index) => (<Fragment  key={`settings-section-${index}`} > 
                    {section !== '' &&<Section section={section} subSections={subSections[index]}/>}
                </Fragment>))}
            </Box>
        </Flex>

        <Box width={'calc(100vw - 275px)'} position={'relative'} bg='white' px='2vw' height={'100vh'} ref={scrollRef}>
            <Flex height={'100vh'}flexDir={'column'} justifyContent={'space-between'} py='3vh'> 
                <Suspense fallback={<></>}>    
                    <Routes >
                        <Route path="/main" element={<Main subSections={subSections} sectionsList={sectionsList}/>} />
                        
                        <Route path="/organization/data" element={<Data />} />
                        
                        <Route path="/users/user" element={<User />} />
                        <Route path="/users/admin-users" element={<AdminUsers />} />
                        <Route path="/users/groups" element={<Groups />} />
                       
                        <Route path="/support/help-center" element={<HelpCenter scrollRef={scrollRef}/>} />
                        <Route path="/support/surveys" element={<Surveys scrollRef={scrollRef}/>} />

                        <Route path="/workflows/edit-views" element={<ViewsList />} />
                        <Route path="/workflows/edit-views/edit/*" element={<EditView scrollRef={scrollRef}/>} />
                        <Route path="/workflows/shortcuts" element={<Shortcuts/>} />
                        <Route path="/workflows/tickets" element={<TicketsData />} />
                        <Route path="/workflows/fields" element={<Fields/>} />
                      
                        <Route path="/actions/triggers" element={<Triggers scrollRef={scrollRef}/>} />
                        <Route path="/actions/automations" element={<Automations scrollRef={scrollRef}/>} />

                        <Route path="/channels/web" element={<Chatbot />} />
                        <Route path="/channels/whatsapp" element={<Whatsapp />} />
                        <Route path="/channels/phone" element={<Phone />} />
                        <Route path="/channels/instagram/*" element={<Instagram />} />
                        <Route path="/channels/google-business" element={<Google />} />
                        <Route path="/channels/mail" element={<Mail />} />

                        <Route path="/integrations/shopify" element={<Shopify />} />

                    </Routes>
                </Suspense>
            </Flex>   
        </Box>
        
    </Flex>)
}

export default Settings