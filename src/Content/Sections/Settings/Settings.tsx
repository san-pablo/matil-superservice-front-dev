/*
    SETITNGS SECTION 
*/

//REACT
import  { Suspense, useEffect, lazy, useRef, Fragment, useState, Dispatch, SetStateAction } from "react"
import { Routes, Route,  useNavigate, useLocation } from "react-router-dom" 
import { useAuth } from "../../../AuthContext"
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Box, Flex, Text, Icon } from '@chakra-ui/react'
import '../../Components/styles.css'
import { motion } from 'framer-motion'
//ICONS
import { IconType } from "react-icons"

import { IoLogoWhatsapp, IoIosArrowDown } from "react-icons/io"
import {  IoChatboxEllipses, IoMail } from "react-icons/io5";
import { RiInstagramFill } from "react-icons/ri";
import { FaHeadset, FaCartShopping, FaCreditCard,FaCloud,FaBookOpen, FaShopify, FaDatabase, FaBars, FaUserGroup,FaPhone,  FaPeopleGroup, FaUser, FaTicket, FaRectangleList, FaArrowsSplitUpAndLeft, FaShapes, FaBookmark, FaClock } from "react-icons/fa6"
import { HiViewColumns } from "react-icons/hi2"
import { MdKeyboardCommandKey, MdWebhook } from "react-icons/md"
import { SiGooglemybusiness } from "react-icons/si"

//TYPING
import { IconKey, SubSectionProps } from "../../Constants/typing"
import { useSession } from "../../../SessionContext"
import { useAuth0 } from "@auth0/auth0-react"
 
  
//MAIN
const Main = lazy (() => import('./Main')) 
//ORGANIZATION
const General = lazy(() => import('./Organization/General'))
const Data = lazy(() => import('./Organization/Data'))
const BussinessHours = lazy(() => import('./Organization/BussinessHours'))
//const Payments = lazy(() => import('./Organization/Payments'))
//USERS
const User = lazy(() => import('./Users/User'))
const AdminUsers = lazy(() => import('./Users/AdminUsers'))
const Groups = lazy(() => import('./Users/Groups'))
//SUPPORT
const HelpCenters = lazy(() => import('./Support/HelpCenter'))
const Surveys = lazy(() => import('./Support/Surveys'))
//WORKFLOWS
const ViewsList = lazy(() => import('./Workflows/Views'))
const EditView = lazy(() => import('./Workflows/EditView'))
const Shortcuts = lazy(() => import('./Workflows/Shortcuts'))
const Fields = lazy(() => import('./Workflows/Fields'))
const Themes = lazy(() => import('./Workflows/Themes'))
const ConversationsData = lazy(() => import('./Workflows/ConversationsData'))
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
const Voip = lazy(() => import('./Channels/Voip'))
//INTEGRATIOSN
const IntegrationsStore = lazy(() => import('./Integrations/IntegrationsStore'))
const Shopify = lazy(() => import('./Integrations/Shopify'))

//TYPING
interface ExpandableSectionProps {
    section: IconKey
    subSections: SubSectionProps
    expandedSections:IconKey[]
    setExpandedSections:Dispatch<SetStateAction<IconKey[]>>
    subSectionsMap:{[key:string]: [string, IconType]}
  }
  
  
   
//SECTION COMPONENT
const Section = ({ section, subSections, expandedSections, setExpandedSections, subSectionsMap }: ExpandableSectionProps) => {
    
    //TRANSLATION
    const { t } = useTranslation('settings')

    
    //CONSTANTS
    const isExpanded = expandedSections.includes(section)
    const navigate = useNavigate()
    const selectedSection = useLocation().pathname.split('/')[2]
    const selectedSubSection = useLocation().pathname.split('/')[3]
    //onst sectionsList: SectionsListProps = {'organization':t('Organization'), 'users':t('Users'), 'support':t('Support'),  'workflows':t('BusinessRules'),  'actions':t('Actions'),  'channels': t('Channels'), 'integrations':t('Integrations'),'main':t('Main')}
    
    const sectionsList: any = {'organization':t('Organization'), 'users':t('Users'), 'help-centers':t('HelpCenters'),  'workflows':t('BusinessRules'),  'actions':t('Actions'),  'channels': t('Channels'), 'main':t('Main')}
    const channelsDict = {
        'webchat':IoChatboxEllipses,
        'whatsapp':IoLogoWhatsapp,
        'instagram':RiInstagramFill,
        'google-business':SiGooglemybusiness,
        'mail':IoMail,
        'phone': FaPhone,
        'voip': FaCloud,
    }

    //NAVIGATE
    const navigateToSection = (sectionPath:string) => {
        navigate(sectionPath)
        localStorage.setItem('currentSettingsSection',sectionPath)
        setExpandedSections((prevSections) => {
            if (prevSections.includes(section)) return prevSections
            else return [...prevSections, section]
          })
    }

    //CHANGE SECTION EXPANDED
    const toggleSection = (e:any) => {
        e.stopPropagation()
        setExpandedSections((prevSections) => {
            if (prevSections.includes(section)) return prevSections.filter((s) => s !== section)
            else return [...prevSections, section]
          })
    }

   
    return(<> 
        {section === 'main' ? 
         <Flex gap='10px' p='5px' _hover={{ color:'black'}} transition={'box-shadow 0.3s ease-out'}  boxShadow={selectedSection === 'main'?'rgb(228, 229, 225) 0px 0px 0px 1px, rgba(20, 20, 20, 0.15) 0px 1px 4px 0px':''}  color={selectedSection === 'main'?'black':'gray.600'}  fontWeight={selectedSection === 'main'?'medium':'normal'}  onClick={() => {navigateToSection('main')}}  bg={selectedSection === 'main'?'white':'transparent'} cursor={'pointer'} alignItems={'center'} borderRadius={'.5rem'}>
             <Text >{sectionsList[section]}</Text>
        </Flex>:
       <Flex mt='1vh' justifyContent={'space-between'}  p='5px' _hover={{ color:'black'}} color={selectedSection === section?'black':'gray.600'}  fontWeight={selectedSection === section?'medium':'normal'}  onClick={() => {navigateToSection(`${section}/${subSections[0][1]}`)}}  cursor={'pointer'}  alignItems={'center'} borderRadius={'.5rem'}>
            <Flex gap='10px' alignItems={'center'}> 
                 <Text >{sectionsList[section]}</Text>
            </Flex>
            <IoIosArrowDown color={'gray.600'} onClick={toggleSection} className={expandedSections.includes(section) ? "rotate-icon-up" : "rotate-icon-down"}/>
        </Flex>}
 
        <motion.div initial={false} animate={{height:isExpanded?'auto':0, opacity:isExpanded?1:0 }} exit={{height:isExpanded?0:'auto',  opacity:isExpanded?0:1 }} transition={{duration:.2}} style={{overflow:isExpanded?'visible':'hidden'}}>           
            {subSections.map((sec:any, index:number) => {
                console.log(section)
                console.log(sec)

                return (<Flex ml='15px' gap='10px'   key={`${section}-${sec}-${index}`} mt='2px' py='4px' pl='8px' transition={'box-shadow 0.3s ease-out'}  boxShadow={selectedSubSection === sec[1]?'rgb(228, 229, 225) 0px 0px 0px 1px, rgba(20, 20, 20, 0.15) 0px 1px 4px 0px':''} color={selectedSubSection === sec[1]?'black':'gray.600'} fontWeight={selectedSubSection === sec[1]?'medium':'normal'}  bg={selectedSubSection === sec[1]?'white':'transparent'} _hover={{color:'black'}} onClick={() => navigateToSection(`${section}/${sec[1]}`)} alignItems={'center'} cursor={'pointer'} borderRadius='.3rem'fontSize={'.9em'}     >
                    <Icon as={((section === 'help-centers' && index !== 0)) ? FaBookOpen : ((section === 'channels' && index !== 0)) ?  (channelsDict as any)[sec.channel_type] : subSectionsMap[sec[1]][1]}/>
                    <Text fontSize={'.95em'} >{((section === 'help-centers' && index !== 0) || (section === 'channels' && index !== 0)) ?  sec.name :sec[0]}</Text>
                </Flex>)  
            })}
        </motion.div>
    </>)
    }

//MAIN FUNCTION
function Settings () {

    //TRANSLATION
    const { t } = useTranslation('settings')

    //SECTIONS
    const auth = useAuth()
    const session = useSession()
    const { getAccessTokenSilently } = useAuth0()
    const isAdmin = auth.authData.users?.[auth.authData?.userId || '']?.is_admin

    //const integrationsList = auth.authData.active_integrations.map((integration) => {return[t(integration), integration]})
    const channelsList = (session.sessionData.additionalData.channels || [])
    const [helpCentersList, setHelpCentersList] = useState<any[]>([])
    useEffect(() => {
        document.title = `${t('Settings')} - ${t('HelpCenters')} - ${auth.authData.organizationName} - Matil`
        const fetchInitialData = async() => {
            const helpCentersData = await fetchData({endpoint:`${auth.authData.organizationId}/admin/help_centers`, auth, getAccessTokenSilently})
            if (helpCentersData?.status === 200) setHelpCentersList(helpCentersData.data)
        }
        fetchInitialData()
    }, [])

    const subSectionsMap: {[key:string]:[string, IconType]} = {

        'general':[t('GeneralDes'), FaBars],
        'data':[t('DataDes'), FaDatabase],
        'hours':[t('HoursDes'), FaClock],
        'payments':[t('PaymentsDes'), FaCreditCard],
        'admin-users':[t('UsersDes'), FaUserGroup],
        'groups':[t('GroupsDes'), FaPeopleGroup],
        'user':[t('UserDes'), FaUser],
        'edit-views':[t('ViewsDes'), HiViewColumns],
        'help-center':[t('HelpCenterDes'), FaHeadset],
        'shortcuts':[t('ShortcutsDes'), MdKeyboardCommandKey],
        'conversations':[t('ConversationsDes'), FaTicket],
        'fields':[t('FieldsDes'),  FaShapes],
        'themes':[t('ThemesDes'),  FaBookmark],
        'surveys':[t('SurveysDes'), FaRectangleList],
        'automations':[t('AutomationsDes'), FaArrowsSplitUpAndLeft],
        'triggers':[t('TriggersDes'), MdWebhook],

        'all-channels':[t('AllChannels'), IoChatboxEllipses],
    
        'store':[t('StoreDes'), FaCartShopping],
        'shopify':[t('ShopifyDes'), FaShopify]
    }
    


    //SECTIONS MAP
    const [expandedSections, setExpandedSections] =  useState<IconKey[]>(localStorage.getItem('currentSettingsSection')?[localStorage.getItem('currentSettingsSection')?.split('/')[0] as IconKey] :[])

    //const sectionsList: (IconKey | '')[] = isAdmin ? ['organization', 'users', 'support', 'workflows', 'actions', 'channels', 'integrations'] : ['users']
    const sectionsList: (IconKey | '')[] = isAdmin ? ['organization','channels', 'help-centers', 'users', 'workflows', 'actions', ] : ['users']
    
    const subSections: SubSectionProps[] = [
        [[t('General'), 'general'],[t('Data'), 'data'], [t('Hours'), 'hours'], [t('Surveys'), 'surveys']],
        [[t('AllChannels'), 'all-channels'], ...channelsList as any],
        [[t('HelpCenter'), 'help-center'], ...helpCentersList],

        [[t('Profile'), 'user'], [t('Users'),'admin-users'], [t('Groups'),'groups']],
         [[t('Views'), 'edit-views'], [t('Themes'), 'themes'], [t('Fields'), 'fields'], [t('Shortcuts'), 'shortcuts'], [t('Conversations'), 'conversations']],
        [[t('Triggers'), 'triggers'], [t('Automations'), 'automations']],
         //[[t('Store'), 'store'], ...integrationsList]
    ] 
 
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
        <Flex flexDir="column" height={'100vh'} py="5vh"   bg='#f1f1f1' width='220px' borderRightWidth="1px" borderRightColor="gray.200">
            <Text px='15px' fontSize={'1.2em'} fontWeight={'medium'}>{t('Settings')}</Text>
            <Box height={'1px'} width={'100%'} bg='gray.300' mt='2vh' mb='2vh'/>
            <Box  px='15px'>
                <Section  section={'main'} expandedSections={expandedSections} setExpandedSections={setExpandedSections} subSections={[]} subSectionsMap={subSectionsMap}  />
            </Box>
            <Box overflowY="auto" flex="1" px='15px'>
                {sectionsList.map((section, index) => (
                <Fragment  key={`settings-section-${index}`} > 
                    {section !== '' &&<Section section={section} expandedSections={expandedSections} setExpandedSections={setExpandedSections}  subSections={subSections[index]} subSectionsMap={subSectionsMap}/>}
                </Fragment>))}
            </Box>
        </Flex>

        <Box width={'calc(100vw - 275px)'} position={'relative'} bg='white' px='2vw' height={'100vh'} ref={scrollRef}>
            <Flex height={'100vh'}flexDir={'column'} justifyContent={'space-between'} py='3vh'> 
                <Suspense fallback={<></>}>    
                    <Routes >
                        <Route path="/main" element={<Main subSections={subSections} sectionsList={sectionsList} subSectionsMap={subSectionsMap}/>} />
                        
                        <Route path="/organization/general" element={<General />} />
                        <Route path="/organization/data" element={<Data />} />
                        <Route path="/organization/hours" element={<BussinessHours  />} />
                        
                        <Route path="/users/user" element={<User />} />
                        <Route path="/users/admin-users" element={<AdminUsers />} />
                        <Route path="/users/groups" element={<Groups />} />
                       
                        <Route path="/support/help-center" element={<HelpCenters scrollRef={scrollRef}/>} />
                        <Route path="/support/surveys" element={<Surveys scrollRef={scrollRef}/>} />

                        <Route path="/workflows/edit-views" element={<ViewsList />} />
                        <Route path="/workflows/edit-views/edit/*" element={<EditView scrollRef={scrollRef}/>} />
                        <Route path="/workflows/fields" element={<Fields/>} />
                        <Route path="/workflows/themes" element={<Themes/>} />
                        <Route path="/workflows/shortcuts" element={<Shortcuts/>} />
                        <Route path="/workflows/conversations" element={<ConversationsData />} />
                      
                        <Route path="/actions/triggers" element={<Triggers scrollRef={scrollRef}/>} />
                        <Route path="/actions/automations" element={<Automations scrollRef={scrollRef}/>} />

                        <Route path="/channels/web" element={<Chatbot />} />
                        <Route path="/channels/whatsapp" element={<Whatsapp />} />
                        <Route path="/channels/phone" element={<Phone />} />
                        <Route path="/channels/instagram/*" element={<Instagram />} />
                        <Route path="/channels/google-business" element={<Google />} />
                        <Route path="/channels/mail" element={<Mail />} />
                        <Route path="/channels/voip" element={<Voip />} />

                        <Route path="/integrations/store" element={<IntegrationsStore />} />
                        <Route path="/integrations/shopify" element={<Shopify />} />

                    </Routes>
                </Suspense>
            </Flex>   
        </Box>
        
    </Flex>)
}

export default Settings