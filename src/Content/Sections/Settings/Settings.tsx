/*
    SETITNGS SECTION 
*/

//REACT
import  { Suspense, useEffect, lazy, useRef, Fragment, useState, Dispatch, SetStateAction } from "react"
import { Routes, Route,  useNavigate, useLocation } from "react-router-dom" 
import { useAuth } from "../../../AuthContext"
import { useTranslation } from 'react-i18next'
import { useSession } from "../../../SessionContext"
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Box, Flex, Text, Icon } from '@chakra-ui/react'
import '../../Components/styles.css'
import { motion } from 'framer-motion'
//ICONS
import { IconType } from "react-icons"
import { IoLogoWhatsapp, IoIosArrowDown } from "react-icons/io"
import { IoChatboxEllipses, IoMail } from "react-icons/io5"
import { RiInstagramFill } from "react-icons/ri";
import { FaHeadset, FaGear, FaCartShopping, FaCreditCard,FaCloud, FaRobot, FaBookOpen, FaShopify, FaDatabase, FaBars, FaUserGroup,FaPhone,  FaPeopleGroup, FaUser, FaTicket, FaRectangleList, FaArrowsSplitUpAndLeft, FaShapes, FaBookmark, FaClock } from "react-icons/fa6"
import { HiViewColumns } from "react-icons/hi2"
import { MdKeyboardCommandKey, MdWebhook } from "react-icons/md"
import { SiGooglemybusiness } from "react-icons/si"
//TYPING
import { IconKey, SubSectionProps, ConfigProps } from "../../Constants/typing" 
  
//MAIN
const Main = lazy (() => import('./Main')) 
//ORGANIZATION
const Data = lazy(() => import('./Organization/Data'))
const BussinessHours = lazy(() => import('./Organization/BussinessHours'))
const Surveys = lazy(() => import('./Organization/Surveys'))
//const Payments = lazy(() => import('./Organization/Payments'))
//USERS
const User = lazy(() => import('./Users/User'))
const AdminUsers = lazy(() => import('./Users/AdminUsers'))
const Groups = lazy(() => import('./Users/Groups'))
//SUPPORT
const HelpCenters = lazy(() => import('./HelpCenters/HelpCenters'))
const HelpCenter = lazy(() => import('./HelpCenters/HelpCenter'))

 //TILDA CONFIGS
const Tilda = lazy(() => import('./Tilda/Tilda'))
const TildaConfig = lazy(() => import('./Tilda/TildaConfig'))
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
const AllChannels = lazy(() => import('./Channels/AllChannels'))
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
    
    const sectionsList: any = {'organization':t('Organization'), 'users':t('Users'), 'help-centers':t('HelpCenters'), 'tilda':t('Tilda'),  'workflows':t('BusinessRules'),  'actions':t('Actions'),  'channels': t('Channels'), 'main':t('Main')}
    const channelsDict = {
        'webchat':IoChatboxEllipses,
        'whatsapp':IoLogoWhatsapp,
        'instagram':RiInstagramFill,
        'google-business':SiGooglemybusiness,
        'email':IoMail,
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
         <Flex gap='10px' p='5px' onClick={() => {navigateToSection('main')}}     borderColor={selectedSection === section ? 'gray.200':'transparent'}  fontWeight={selectedSection === section? 'medium':'normal'} bg={selectedSection === section?'white':'transparent'}  transition={selectedSection === section?'box-shadow .2s ease-in-out, border-color .2s ease-in-out, background-color .2s ease-in-out':'box-shadow .2s ease-out, border-color .2s ease-out, background-color .2s ease-out'}    boxShadow={selectedSection === section ? '0 0 3px 0px rgba(0, 0, 0, 0.1)':''}  _hover={{bg:selectedSection === section?'white':'brand.gray_2'}} cursor={'pointer'} alignItems={'center'} borderRadius={'.5rem'}>
             <Text  transition={'transform .1s ease-in-out'}   transformOrigin="left center" transform={selectedSection === section?'scale(1.02)':'scale(1)'} >{sectionsList[section]}</Text>
        </Flex>:

       <Flex mt='1vh' justifyContent={'space-between'}  p='5px' _hover={{ color:'black'}} color={selectedSection === section?'black':'gray.600'}  fontWeight={selectedSection === section?'medium':'normal'}  onClick={() => {navigateToSection(`${section}/${subSections[0][1]}`)}}  cursor={'pointer'}  alignItems={'center'} borderRadius={'.5rem'}>
            <Flex gap='10px' alignItems={'center'}> 
                 <Text >{sectionsList[section]}</Text>
            </Flex>
            <IoIosArrowDown color={'gray.600'} onClick={toggleSection} className={expandedSections.includes(section) ? "rotate-icon-up" : "rotate-icon-down"}/>
        </Flex>}
 
        <motion.div initial={false} animate={{height:isExpanded?'auto':0, opacity:isExpanded?1:0 }} exit={{height:isExpanded?0:'auto',  opacity:isExpanded?0:1 }} transition={{duration:.2}} style={{overflow:isExpanded?'visible':'hidden'}}>           
            {subSections.map((sec:any, index:number) => {
              

                const navigatePath = `${section}${(section === 'help-centers' && index !== 0) ? '/help-center':(section === 'tilda' && index !== 0)?'/config' :(section === 'channels' && index !== 0) ?'/' + sec.channel_type:''}/${(section === 'help-centers' && index !== 0) ? sec.id:(section === 'tilda' && index !== 0)?sec.uuid:(section === 'channels' && index !== 0) ?sec.id:sec[1]}`
                const isSelected = (section === 'help-centers' && index !== 0) || (section === 'channels' && index !== 0) ? useLocation().pathname.split('/')[useLocation().pathname.split('/').length - 1] === sec.id :(section === 'tilda' && index !== 0)?useLocation().pathname.split('/')[useLocation().pathname.split('/').length - 1] === sec.uuid:selectedSubSection === sec[1]
                
                return (
                <Flex ml='15px' gap='10px'   key={`${section}-${sec}-${index}`} mt='2px' py='4px' pl='8px'  borderColor={isSelected ? 'gray.200':'transparent'}  fontWeight={isSelected? 'medium':'normal'} bg={isSelected?'white':'transparent'}  transition={isSelected?'box-shadow .2s ease-in-out, border-color .2s ease-in-out, background-color .2s ease-in-out':'box-shadow .2s ease-out, border-color .2s ease-out, background-color .2s ease-out'}    boxShadow={isSelected ? '0 0 3px 0px rgba(0, 0, 0, 0.1)':''}  _hover={{bg:isSelected?'white':'brand.gray_2'}} onClick={() => navigateToSection(navigatePath)} alignItems={'center'} cursor={'pointer'} borderRadius='.3rem'fontSize={'.9em'}     >
                    <Icon as={((section === 'help-centers' && index !== 0)) ? FaBookOpen : ((section === 'tilda' && index !== 0))?FaRobot:((section === 'channels' && index !== 0)) ?  (channelsDict as any)[sec.channel_type] : subSectionsMap[sec[1]][1]}/>
                    <Text  transition={'transform .1s ease-in-out'}   transformOrigin="left center" transform={isSelected?'scale(1.02)':'scale(1)'}  fontSize={'.95em'} >{(((section === 'help-centers' || section === 'channels' || section === 'tilda') && index !== 0)) ?  sec.name :sec[0]}</Text>
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
    const [configsList, setConfigsList] = useState<ConfigProps[]>([])

    useEffect(() => {
        document.title = `${t('Settings')} - ${t('HelpCenters')} - ${auth.authData.organizationName} - Matil`
        const fetchInitialData = async() => {
            const helpCentersData = await fetchData({endpoint:`${auth.authData.organizationId}/admin/help_centers`, auth, getAccessTokenSilently})
            const configsData = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations`, auth, getAccessTokenSilently})

            if (helpCentersData?.status === 200 && configsData?.status === 200) {
                setHelpCentersList(helpCentersData.data)
                setConfigsList(configsData.data)
            }
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

        'all':[t('HelpCenterDes'), FaHeadset],

        'shortcuts':[t('ShortcutsDes'), MdKeyboardCommandKey],
        'conversations':[t('ConversationsDes'), FaTicket],
        'fields':[t('FieldsDes'),  FaShapes],
        'themes':[t('ThemesDes'),  FaBookmark],
        'surveys':[t('SurveysDes'), FaRectangleList],
        'automations':[t('AutomationsDes'), FaArrowsSplitUpAndLeft],
        'triggers':[t('TriggersDes'), MdWebhook],

        'all-channels':[t('AllChannelsDes'), IoChatboxEllipses],

        'all-configs':[t('AllConfigsDes'), FaGear],

        'store':[t('StoreDes'), FaCartShopping],
        'shopify':[t('ShopifyDes'), FaShopify]
    }
    


    //SECTIONS MAP
    const [expandedSections, setExpandedSections] =  useState<IconKey[]>(localStorage.getItem('currentSettingsSection')?[localStorage.getItem('currentSettingsSection')?.split('/')[0] as IconKey] :[])

    //const sectionsList: (IconKey | '')[] = isAdmin ? ['organization', 'users', 'support', 'workflows', 'actions', 'channels', 'integrations'] : ['users']
    const sectionsList: (IconKey | '')[] = isAdmin ? ['organization','channels', 'tilda', 'help-centers', 'users', 'workflows', 'actions', ] : ['users']
    
    const subSections: SubSectionProps[] = [
        [[t('Data'), 'data'], [t('Hours'), 'hours'], [t('Surveys'), 'surveys']],
        [[t('AllChannels'), 'all-channels'], ...channelsList as any],
        [[t('AllConfigs'), 'all-configs'], ...configsList as any],
        [[t('HelpCenters'), 'all'], ...helpCentersList],
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
        <Flex flexDir="column" height={'100vh'} py='1vw'   bg='brand.hover_gray' width='220px' borderRightWidth="1px" borderRightColor="gray.200">
            <Box px='1vw'> 
                <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('Settings')}</Text>
                <Box height={'1px'} width={'100%'} bg='gray.300' mt='2vh' mb='2vh'/>
                <Box>
                    <Section  section={'main'} expandedSections={expandedSections} setExpandedSections={setExpandedSections} subSections={[]} subSectionsMap={subSectionsMap}  />
                </Box>
            </Box>
            <Box overflowY="auto" flex="1" px='15px'>
                {sectionsList.map((section, index) => (
                <Fragment  key={`settings-section-${index}`} > 
                    {section !== '' &&<Section section={section} expandedSections={expandedSections} setExpandedSections={setExpandedSections}  subSections={subSections[index]} subSectionsMap={subSectionsMap}/>}
                </Fragment>))}
            </Box>
        </Flex>

 
            <Flex height={'100vh'} flexDir={'column'} justifyContent={'space-between'} ref={scrollRef}  bg='white'  width={'calc(100vw - 275px)'} > 
                <Suspense fallback={<></>}>    
                    <Routes >
                        <Route path="/main" element={<Main subSections={subSections} sectionsList={sectionsList} subSectionsMap={subSectionsMap}/>} />
                        
                        <Route path="/organization/data" element={<Data />} />
                        <Route path="/organization/hours" element={<BussinessHours  />} />
                        <Route path="/organization/surveys" element={<Surveys/>} />

                        <Route path="/tilda/all-configs" element={<Tilda />} />
                        <Route path="/tilda/config/*" element={<TildaConfig scrollRef={scrollRef}/>} />

                        <Route path="/users/user" element={<User />} />
                        <Route path="/users/admin-users" element={<AdminUsers />} />
                        <Route path="/users/groups" element={<Groups />} />
                       
                        <Route path="/help-centers/all" element={<HelpCenters helpCentersData={helpCentersList} setHelpCentersData={setHelpCentersList}/>} />
                        <Route path="/help-centers/help-center/*" element={<HelpCenter scrollRef={scrollRef} setHelpCentersData={setHelpCentersList}/>} />

                        <Route path="/workflows/edit-views" element={<ViewsList />} />
                        <Route path="/workflows/edit-views/edit/*" element={<EditView scrollRef={scrollRef}/>} />
                        <Route path="/workflows/fields" element={<Fields/>} />
                        <Route path="/workflows/themes" element={<Themes/>} />
                        <Route path="/workflows/shortcuts" element={<Shortcuts/>} />
                        <Route path="/workflows/conversations" element={<ConversationsData />} />
                      
                        <Route path="/actions/triggers" element={<Triggers scrollRef={scrollRef}/>} />
                        <Route path="/actions/automations" element={<Automations scrollRef={scrollRef}/>} />

                        <Route path="/channels/all-channels/*" element={<AllChannels channelsData={channelsList}/>} />
                        <Route path="/channels/webchat/*" element={<Chatbot />} />
                        <Route path="/channels/whatsapp/*" element={<Whatsapp />} />
                        <Route path="/channels/phone/*" element={<Phone />} />
                        <Route path="/channels/instagram/*" element={<Instagram />} />
                        <Route path="/channels/google-business/*" element={<Google />} />
                        <Route path="/channels/email/*" element={<Mail />} />
                        <Route path="/channels/voip/*" element={<Voip />} />

                        <Route path="/integrations/store" element={<IntegrationsStore />} />
                        <Route path="/integrations/shopify" element={<Shopify />} />

                    </Routes>
                </Suspense>
            </Flex>   
 
        
    </Flex>)
}

export default Settings