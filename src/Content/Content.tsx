/* 
    MAIN COMPONENT. CONTAINS THE HEADER, THE SIDEBAR AND THEIR FUNCTIONALITITES
*/

//REACT
import { useRef, useState, useEffect, useLayoutEffect, ElementType, Suspense, lazy, SetStateAction, Dispatch, useMemo, forwardRef } from 'react'
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from '../AuthContext'
import { useSession } from '../SessionContext'
import { useTranslation } from 'react-i18next'
import { t } from 'i18next'
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import fetchData from './API/fetchData'
import io from 'socket.io-client' 
//FRONT
import { Flex, Box, Icon, Avatar, Text, Tooltip, Button, chakra, shouldForwardProp, Image, IconButton, Skeleton } from '@chakra-ui/react'
import './Components/styles.css'
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion' 
//COMPONENTS
import LoadingIconButton from './Components/Reusable/LoadingIconButton'
import LoadingIcon from './Components/Once/LoadingIcon'
import showToast from './Components/Reusable/ToastNotification'
import EditText from './Components/Reusable/EditText'
import ConfirmBox from './Components/Reusable/ConfirmBox'
import CallWidget from './Components/Once/CallWidget'
import ShortCutsList from './Components/Once/ShortCutsList'
import SendFeedBack from './Components/Once/SendFeedback'
//FUNCTIONS
import useOutsideClick from './Functions/clickOutside'
import DetermineConversationViews from './MangeData/DetermineConversationViews'
//ICONS
import { IconType } from 'react-icons'
import { IoFileTrayFull } from "react-icons/io5" 
import { BsFillPersonLinesFill, BsBarChartFill ,BsStars,  BsFillTelephoneInboundFill, BsFillTelephoneMinusFill, BsFillTelephoneXFill, BsFillLayersFill } from "react-icons/bs"
import { FaPlus, FaArrowRightToBracket, FaCheck } from "react-icons/fa6"
import { IoIosSettings, IoIosArrowDown, IoIosArrowForward } from "react-icons/io"
import { FiPlus } from "react-icons/fi"
import { BiSolidBuildings } from 'react-icons/bi'
import { PiKeyReturn } from "react-icons/pi"
import { TbArrowBack } from 'react-icons/tb'
import { VscFeedback } from "react-icons/vsc"
//TYPING 
import { Organization, ConversationsData, userInfo, Views } from './Constants/typing'
//MAIN SECTIONS
const ConversationsTable = lazy(() => import('./Sections/Conversations/ConversationsTable'))
const Contacts = lazy(() => import('./Sections/Contacts/Contacts'))
const FunctionsTable = lazy(() => import('./Sections/Functions/FunctionsTable'))
 
const ReportsTable = lazy(() => import('./Sections/Stats/ReportsTable'))
const Report = lazy(() => import('./Sections/Stats/Report'))
const Settings = lazy(() => import('./Sections/Settings/Settings'))
const Knowledge = lazy(() => import('./Sections/Knowledge/Knowledge'))
const NotFound = lazy(() => import('./Components/Once/NotFound'))

 
//TYPING
type SectionKey = 'conversations' | 'contacts' | 'functions'| 'knowledge' | 'stats' | 'settings'
interface NavBarItemProps {
    icon: ElementType
    section: SectionKey
  }
interface Section {
    description: string
    code: number
    local_id?:number
    type: string
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//MAX WAIT TIME FOR PUSHING A HEADER SECTION
const MAX_WAIT_TIME = 3000

//MAIN FUNCTION
function Content ({userInfo}:{userInfo:userInfo}) {
 
    //SOCKET
    const socket = useRef<any>(null)
 
    //TRANSLATION
    const { t } = useTranslation('main')
    const { logout, getAccessTokenSilently } = useAuth0()

    //IMPORTANT REACT CONSTANTS
    const auth = useAuth()
    const session = useSession()
    const navigate = useNavigate()
    const location = useLocation().pathname

    //EDIT GLOBAL USER INFO (ONLY GONNA CHANGE WHEN ORGANIZATIONS CHANGE)
    const [userInfoApp, setUserInfoApp] = useState<userInfo>(userInfo)
    const isAdmin = userInfoApp.organizations.find(org => org.id === auth.authData?.organizationId)?.is_admin || false

    //REF FOR DETERMINIG IF A CONVERSATION IS BEING PROCESSED, AND WAIT FOR THE FINISH
    const isFirstSection = useRef<boolean>(true)
    const isProcessingConversation = useRef<boolean>(false)

    //VIEWS REF, FOR USING ALWAYS THE LAST VIEWS VERSION
    const authDataRef = useRef(auth.authData.views as Views)

    //UPDATE VIEWS WHEN A CONVERSATION EVENT
    const updateViews = (data:{new_data:ConversationsData, previous_data?:ConversationsData, is_new:boolean}, views:Views) => {
        
        isProcessingConversation.current = true
        
        //EDIT VIEWS LOGIC
        const previousViews = DetermineConversationViews(data?.previous_data, views, auth.authData?.userId || '')
        const newViews = DetermineConversationViews(data?.new_data, views, auth.authData?.userId || '')

        //VIEWS TO ADD AND REMOVE
        const viewsToRemove = previousViews.filter(pv => !newViews.some(nv => nv.view_index === pv.view_index && nv.view_type === pv.view_type))
        const viewsToAdd = newViews.filter(nv => !previousViews.some(pv => pv.view_index === nv.view_index && nv.view_type === pv.view_type))
        
        //NEW AUPDATED VIEWS NUMBER
        const updates:any = {}
        viewsToRemove.forEach(view => {
            const keyToUpdate = view.view_type === 'shared' ? 'number_of_conversations_per_shared_view' : 'number_of_conversations_per_private_view'
            if (!updates[keyToUpdate]) updates[keyToUpdate] = [...(views[keyToUpdate] || [])]
            updates[keyToUpdate][view.view_index] = (updates[keyToUpdate][view.view_index] || 0) - 1
        })
        viewsToAdd.forEach(view => {
            const keyToUpdate = view.view_type === 'shared' ? 'number_of_conversations_per_shared_view' : 'number_of_conversations_per_private_view'
            if (!updates[keyToUpdate]) updates[keyToUpdate] = [...(views[keyToUpdate] || [])]
            updates[keyToUpdate][view.view_index] = (updates[keyToUpdate][view.view_index] || 0) + 1
        }) 

        //NULLIFY ALL THE INVOLVED VIEWS
        const viewsToNullify = [...previousViews, ...newViews]
        const updatedConversationsTable = session.sessionData.conversationsTable.filter(conversationTable => {
            return !viewsToNullify.some(view => conversationTable.view.view_index === view.view_index && conversationTable.view.view_type === view.view_type)
        })

        //UPLPOAD THE VIEWS NUMBER 
        authDataRef.current = {...views, ...updates}

        auth.setAuthData({ views: {...views, ...updates}})
         session.dispatch({type: 'UPDATE_CONVERSATIONS_VIEWS', payload: updatedConversationsTable});
  
        isProcessingConversation.current = false
    }

    //INITIALIZE SOCKET
    useEffect(() => {
                    
        if (Notification.permission !== 'granted') Notification.requestPermission()

        const section = localStorage.getItem('currentSection')
        if (window.location.pathname === '/' && !window.location.hash) navigate(section !== null ? section : 'conversations')
        else navigate(window.location)

        socket.current = io('https://api.matil.ai/platform', {
            path: '/v1/socket.io/',
            transports:['websocket'],
            query: {
                access_token: auth.authData.accessToken,
                organization_id: auth.authData.organizationId
            }
        })
    
        //CONNECT TO THE WEBSOCKET
        socket.current.on('connect', () => {console.log('CONECTADO')})

        //RECEIVE A CONVERSATIONS
        socket.current.on('conversation', (data:any) => {
            session.dispatch({type: 'EDIT_HEADER_SECTION_CONVERSATION', payload: {...data, auth}})

            if (data?.is_new) showToast({message:t('NewConversationCreated', {id:data.new_data.local_id}), type:'conversation', id:data.new_data.id, linkPath:true, navigate, isDesktop:true})
            
            function waitForProcessing() {
                const startTime = Date.now()              
                const waitInterval = setInterval(() => {
                if (!isProcessingConversation.current) {
                    clearInterval(waitInterval)
                    updateViews(data, authDataRef.current)
                } else if (Date.now() - startTime > MAX_WAIT_TIME) {
                    clearInterval(waitInterval)
                    updateViews(data, authDataRef.current)
                }
                }, 100)
              }
              waitForProcessing()
        })

        //RECEIVE A NEW MESSAGE
        socket.current.on('conversation_messages', (data:any) => {
            if (data?.local_id && data?.conversation_id && (data.sender_type === 0) ) showToast({message: t('SendedMessage', {id:data.local_id}), type:'message', id:data.conversation_id, linkPath:true, navigate,  isDesktop:true})
            session.dispatch({type: 'EDIT_HEADER_SECTION_MESSAGES', payload: {data, type:'message'}})
        })  

        //RECEIVE A NEW SCHEDULED MESSAGE
        socket.current.on('conversation_scheduled_messages', (data:any) => {session.dispatch({type: 'EDIT_HEADER_SECTION_MESSAGES', payload: {data, type:'new_scheduled'}})})

        //SCHEDULED MESSAGE CANCELED
        socket.current.on('conversation_canceled_scheduled_messages', (data:any) => {session.dispatch({type: 'EDIT_HEADER_SECTION_MESSAGES', payload: {data, type:'canceled_scheduled'}})})

        //CLIENT UPDATE
        socket.current.on('client', (data:any) => {
            session.dispatch({type: 'EDIT_HEADER_SECTION_CLIENT', payload: data})
        })

        //BUSINESS UPDATE
        socket.current.on('contact_business', (data:any) => {
            session.dispatch({type: 'EDIT_HEADER_SECTION_BUSINESS', payload: data})
        })

        //REFRESH A CONVERSATION
        socket.current.on('refresh_conversation', (data:any) => {session.dispatch({type: 'EDIT_HEADER_SECTION_MESSAGES', payload: data})})

        //SEND PING EACHJ 120 SECONDS
        const sendPing = () => {socket.current.emit('ping', {})}
  
        const pingInterval = setInterval(sendPing, 120000)
        return () => {
            socket?.current.disconnect()
            clearInterval(pingInterval)
        }
    }, [auth.authData.organizationId])
  
    //HEADER SECTIONS
    const [headerSections, setHeaderSections] = useState<Section[]>([])
    const [visibleSectionsIndex, setVisibleSectionsIndex] = useState<number>(0)

    //MANAGE OVERFLOW AND RESIZING OF THE HEADER
    const containerRef = useRef<HTMLDivElement>(null)

    //SHOW MORE HEADER SECTIONS LOGIC
    const showMoreHeaderSectionsButtonRef = useRef<HTMLDivElement>(null)
    const showMoreHeaderSectionsBoxRef = useRef<HTMLDivElement>(null)
    const [showMoreHeaderSections, setShowMoreHeaderSections] = useState<boolean>(false)
    const [showMoreHeaderSectionsBox, setShowMoreHeaderSectionsBox] = useState<boolean>(false)
    useOutsideClick({ref1:showMoreHeaderSectionsButtonRef, ref2:showMoreHeaderSectionsBoxRef, onOutsideClick:setShowMoreHeaderSectionsBox})
    useLayoutEffect(() => {

        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth
        
                const maxWidth = 280
                const minWidth = 120
                let totalWidth = 0
                let sectionsToShow = 0
                let moreFlag = false
                const sectionCount = headerSections.length

                for (const section of headerSections) totalWidth += maxWidth
                let availableWidth = containerWidth - containerWidth * 0.5
        
                if (totalWidth > availableWidth) {
                    const perSectionWidth = availableWidth / sectionCount
                    const finalWidth = perSectionWidth < minWidth ? minWidth : perSectionWidth
                    if (finalWidth === minWidth && totalWidth > availableWidth) moreFlag = true
                        headerSections.forEach((section, index) => {if ((index + 1) * finalWidth <= availableWidth) sectionsToShow += 1 })

                } else sectionsToShow = headerSections.length
                setVisibleSectionsIndex(sectionsToShow)
                setShowMoreHeaderSections(moreFlag)
            }
        }

        const resizeObserver = new ResizeObserver(handleResize)
        if (containerRef.current) resizeObserver.observe(containerRef.current)
        handleResize()
        return () => {
            if (containerRef.current) resizeObserver.unobserve(containerRef.current)
        }
      }, [headerSections])
 
    //SHORTCUTS DEFINITION
    useEffect(() => {
        const handleKeyDown = (event:KeyboardEvent) => {
            if (event.ctrlKey && event.altKey) {
                let currentIndex = -1;
    
                if (event.code === 'KeyW' || event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
                  currentIndex = headerSections.findIndex(element => {
                    const sectionToSelect = element.type === 'conversation'
                      ? `conversations/conversation/${element.code}`
                      : element.type === 'client'
                      ? `clients/client/${element.code}`
                      : `contact-businesses/business/${element.code}`
                    return location.startsWith(`/${sectionToSelect}/`) || location === `/${sectionToSelect}`
                  })
                }

              switch (event.code) {           
                case 'KeyV':
                    navigate('conversations')
                    break
                case 'KeyC':
                    navigate('clients')
                    break
                case 'KeyB':
                    navigate('contact-businesses')
                    break
                case 'KeyT':
                    navigate('stats')
                    break
                case 'KeyA':
                    navigate('settings')
                    break
    
                case 'ArrowLeft': 
                    if (currentIndex > 0) {
                        const previousSection = headerSections[currentIndex - 1]
                        const previousPath = previousSection.type === 'conversation'
                        ? `conversations/conversation/${previousSection.code}`
                        : previousSection.type === 'client'
                        ? `clients/client/${previousSection.code}`
                        : `contact-businesses/business/${previousSection.code}`
                        navigate(`/${previousPath}`)
                    }
      
                    break
                  case 'ArrowRight': 
                    if (currentIndex < headerSections.length - 1) {
                        const nextSection = headerSections[currentIndex + 1];
                        const nextPath = nextSection.type === 'conversation'
                        ? `conversations/conversation/${nextSection.code}`
                        : nextSection.type === 'client'
                        ? `clients/client/${nextSection.code}`
                        : `contact-businesses/business/${nextSection.code}`;
                        navigate(`/${nextPath}`);
                    }
                    break
        
                default:
                  break
              }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    },[headerSections, location])
 
    //MEMOIZED CALL WIDGET
    const memoizedCallWidget = useMemo(() => <CallWidget />, [])
    const barRef = useRef<HTMLDivElement>(null)
    const barRef2 = useRef<HTMLDivElement>(null)


    //REFS
    const lastSection = useRef<string>(location.split('/')[1])

    const conversationsRef = useRef<HTMLDivElement>(null)
    const clientsRef = useRef<HTMLDivElement>(null)
    const flowsRef = useRef<HTMLDivElement>(null)
    const knowledgeRef = useRef<HTMLDivElement>(null)
    const statsRef = useRef<HTMLDivElement>(null)
    const settingsRef = useRef<HTMLDivElement>(null)
    const sectionsRefs = {conversations:conversationsRef, contacts:clientsRef, 'knowledge':knowledgeRef, 'functions':flowsRef, 'stats':statsRef, settings:settingsRef}

    useEffect(() => {
        const updateBarPosition = () => {
            const currentSection = location.split('/')[1] as 'conversations' | 'contacts' | 'knowledge' | 'functions' | 'stats' | 'settings'

            if (sectionsRefs[currentSection]?.current && barRef.current && barRef2.current) {

                 const sectionTop = sectionsRefs[currentSection]?.current?.getBoundingClientRect().top || 0
                 localStorage.setItem('currentSectionTop', String(sectionTop))
             
                if (currentSection === 'settings' || lastSection.current === 'settings') {
                    
                    if (lastSection.current === 'settings') {
                        barRef.current.style.transition = 'box-shadow .25s ease, background-color .25s ease'
                        barRef.current.style.backgroundColor = 'white'
                        barRef.current.style.boxShadow = '0 0 3px 0px rgba(0, 0, 0, 0.1)'  
                        barRef.current.style.borderColor = '#E2E8F0'  

                        barRef2.current.style.backgroundColor = ''
                        barRef2.current.style.boxShadow = ''
                        barRef.current.style.transform = `translateY(${sectionTop}px)` 

                    }
                    else {
                        barRef.current.style.transition = 'box-shadow .25s ease, background-color .25s ease'
                        barRef2.current.style.transition = 'box-shadow .25s ease, background-color .25s ease'
                        barRef2.current.style.backgroundColor = 'white'
                        barRef2.current.style.boxShadow = '0 0 3px 0px rgba(0, 0, 0, 0.1)'
                        barRef.current.style.borderColor = '#E2E8F0'  

                        barRef.current.style.backgroundColor = ''
                        barRef.current.style.boxShadow = ''
                        barRef.current.style.transform = `translateY(${(sectionsRefs as any)[lastSection.current]?.current?.getBoundingClientRect().top}px)` 
                    }
                }
                else {
                    barRef.current.style.transform = `translateY(${sectionTop}px)` 
                    if (!isFirstSection.current) barRef.current.style.transition = 'transform .25s ease, box-shadow .25s ease, background-color .25s ease'
                    barRef.current.style.backgroundColor = 'white'
                    barRef.current.style.boxShadow = '0 0 3px 0px rgba(0, 0, 0, 0.1)'
                    barRef.current.style.borderColor = '#E2E8F0'  

                    barRef2.current.style.backgroundColor = ''
                    barRef2.current.style.boxShadow = ''

                }
                isFirstSection.current = false
                lastSection.current = currentSection

                  
             }
        }    
        updateBarPosition()
        window.addEventListener('resize', updateBarPosition)
        return () => {window.removeEventListener('resize', updateBarPosition)}
    }, [location.split('/')[1].split('?')[0], barRef.current, barRef2.current])
    

    console.log(location.split('/')[1].split('?')[0])

    //JOIN TO AN ORGANIZATION FUNCTION
    const addOrganization = async ({invitationCode, setInvitationCode}:{invitationCode:string, setInvitationCode:Dispatch<SetStateAction<string>>}) => {
        setInvitationCode('')
 
        navigate('/conversations')

        const response = await fetchData({endpoint:`user/join/${invitationCode}`, method:'put', getAccessTokenSilently, auth:auth})

        if (response?.status === 200) {
            const response2 = await fetchData({endpoint:`user`, setValue:setUserInfoApp, getAccessTokenSilently, auth:auth})
            if (response2?.status === 200){
                changeOrganization(response2.data.organizations[response2.data.organizations.length - 1])
            }
            else {showToast({message:t('Join_Failed'), type:'failed'})}
        }
        else {showToast({message:t('Join_Failed'), type:'failed'})}
    }
    
    //CHANGE ORGANIZATION LOGIC
    const changeOrganization = async (org:Organization) => {

        localStorage.removeItem('currentView')
        localStorage.removeItem('currentSection')
        localStorage.removeItem('currentSectionTop')
        localStorage.setItem('currentOrganization', String(org.id))
        
        session.dispatch({type:'DELETE_ALL_SESSION'})
        setHeaderSections([])
        const responseOrg = await fetchData({endpoint:`${org.id}/user`, auth, getAccessTokenSilently})
        const responseChannels = await  fetchData({endpoint:`${org.id}/admin/settings/channels`, auth, getAccessTokenSilently})
        const responseThemes= await  fetchData({endpoint:`${org.id}/admin/settings/themes`, auth, getAccessTokenSilently})
        session.dispatch({type:'ADD_CHANNELS', payload:responseChannels?.data})
        if (responseOrg?.status === 200) {
            const viewsToAdd = {
            number_of_conversations_in_bin:responseOrg.data.number_of_conversations_in_bin, 
            private_views:responseOrg.data.private_views, 
            number_of_conversations_per_private_view:responseOrg.data.number_of_conversations_per_private_view,
            shared_views:responseOrg.data.shared_views, 
            number_of_conversations_per_shared_view:responseOrg.data.number_of_conversations_per_shared_view
          }
          authDataRef.current = viewsToAdd
          auth.setAuthData({views: viewsToAdd, users:responseOrg.data.users, shortcuts:responseOrg.data.shortcuts, conversation_themes:responseThemes?.data.map((theme:{name:string, description:string}) => theme.name), organizationId:org.id, organizationName:org.name})
        }
        
        navigate('/conversations')
     }

    const NavBar = () => {
 

        const MatilImage = useMemo(() => (<Image src='/images/matil-simple-2.svg' width={'18px'} height={'18px'} />), [])
        
        return (<>
            
 
            <Flex alignItems='center' flexDir='column' >
                <Box  width='100%'> 
                    <Flex width={'100%'} justifyContent={'center'} mb='4vh'> 
                        {MatilImage}
                    </Flex>
                    <NavBarItem ref={conversationsRef} icon={IoFileTrayFull} section={'conversations'}/>
                    <NavBarItem ref={clientsRef} icon={BsFillPersonLinesFill} section={'contacts'}/>
                    {isAdmin && <NavBarItem ref={flowsRef}  icon={BsStars} section={'functions'}/>}
                    {isAdmin && <NavBarItem  ref={statsRef} icon={BsBarChartFill} section={'stats'}/>}
                    {isAdmin && <NavBarItem ref={knowledgeRef}  icon={BsFillLayersFill} section={'knowledge'}/>}
                 </Box>
            </Flex>
            <Flex  alignItems='center' flexDir='column' position={'relative'}>
            {isAdmin && <NavBarItem ref={settingsRef} icon={IoIosSettings} section={'settings'}/>}

                <Flex width='31px' bg='gray.300' height='1px' mb='2vh' mt='2vh'/>
                <LogoutBox userInfoApp={userInfoApp} auth={auth} addOrganization={addOrganization} changeOrganization={changeOrganization}/>
            </Flex>
        </>
        )
    }
    const memoizedNavbar = useMemo(() => <NavBar />, [auth.authData.organizationId])

    // SHOW WHEN THERE IS NO ORGANIZATION
    const NoOrganizationBox = () => {

         const [firstInvitationCode, setFirstInvitationCode] = useState<string>('')
        
         const [waitingNewOrganization, setWaitingNewOrganization] = useState<boolean>(false)

        const addNewOrganization = async () => {
            setWaitingNewOrganization(true)
            await addOrganization({invitationCode:firstInvitationCode, setInvitationCode:setFirstInvitationCode})
            setWaitingNewOrganization(false)
        }
        return (
        <Flex width='100vw' bg='gray.100' height='100vh' alignItems={'center'} justifyContent={'center'}>
            <Box maxW={'650px'} rounded={'lg'} bg='white' boxShadow={'lg'} p={8} >
                <Text fontWeight='medium' fontSize={'1.2em'}>{t('NoOrganizationUser')}</Text>
                <Text fontWeight='medium' fontSize={'1em'} mt='2vh' mb='.5vh'>{t('GetInvitationCode')}</Text>
                <EditText value={firstInvitationCode} setValue={setFirstInvitationCode} placeholder='xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxx' hideInput={false}/>
                <Button variant={'main'} size='sm' leftIcon={waitingNewOrganization?<></>:<FaPlus />} mt='2vh' isDisabled={firstInvitationCode === ''} width='100%' onClick={addNewOrganization}>{waitingNewOrganization?<LoadingIconButton/>:t('Join')}</Button>
            </Box>
            <Button onClick={() => {logout({ logoutParams: { returnTo: window.location.origin } });auth.signOut()}} position='fixed' bottom='2vh' left='2vh' size='sm' variant={'main'} leftIcon={<TbArrowBack/>}>{t('Return')}</Button>
        </Flex>)
    }
    if (!auth.authData.organizationId) return (<NoOrganizationBox/>)

    //FRONT 
    return(<> 
        <Box  ref={barRef2} borderRadius={'.5rem'} transition={'box-shadow 0.25s ease, background-color 0.25s ease'} zIndex={1}  style={{position: 'absolute', left: '4px', top:settingsRef.current?.getBoundingClientRect().top,  width: '37px',   height:'37px'}}/>
        <Box ref={barRef} transition={isFirstSection.current ? 'none':'transform 0.25s ease'} borderRadius={'.5rem'}  zIndex={1}  transform={`translateY(${localStorage.getItem('currentSectionTop')})px)`} style={{position: 'absolute', left: '4px', width: '37px', top:0,  height:'37px'}}/>

        {socket.current ? 

        <Flex width={'100vw'} height={'100vh'} overflow={'hidden'}> 

            {memoizedCallWidget}
        
            {/*SIDEBAR*/}
            <Flex flexDir='column'  alignItems='center' justifyContent='space-between' height={'100vh'} width='45px' py='calc(2vh + 5px)' bg='brand.gray_1' >
                {memoizedNavbar}
            </Flex>

            {/*CONTENT OF THE SECTIONS*/}
            <Box  height={'100vh'} >
                <Box>
                    <Suspense fallback={<SuspenseSectionComponent/>}>    
                        <Routes >
                            <Route path="/conversations/*" element={<ConversationsTable socket={socket}/>}/>
                            <Route path="/contacts/*" element={<Contacts socket={socket}/>}/>
                            <Route path="/functions/*" element={<FunctionsTable/>}/>
 
                            <Route path="/knowledge/*" element={<Knowledge/>}/>
                            <Route path="/stats/*" element={<ReportsTable/>}/>

                            <Route path="/settings/*" element={<Settings />}/>
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </Box>
            </Box>
 
        </Flex>:
        <Flex height={'100vh'}  width={'100vw'} justifyContent={'center'} alignItems={'center'}> 
            <LoadingIcon/>
        </Flex>}
    </>)
}

export default Content

//SIDE BAR ITEM DEFINITION
const NavBarItem = forwardRef<HTMLDivElement, NavBarItemProps>(({icon, section }, ref) => {

    //NAVIGATE CONSTANT
    const navigate = useNavigate()
    const location = useLocation().pathname
    const sectionsMap = {conversations: t('Conversations'), contacts: t('Contacts'), stats: t('Stats'), 'functions':t('Tilda'),'knowledge':t('Knowledge'), settings: t('Settings')}
 
    //HOVER AND SELECT LOGIC
    const [isHovered, setIsHovered] = useState(false)
    const handleClick = () => {
        if (section === 'contacts') {
            navigate(`contacts/${localStorage.getItem('contactsSection')?localStorage.getItem('contactsSection') as 'clients' | 'businesses':'clients'}`)
        }
        else if (location.split('/')[1] !== section) {
            navigate(section)
        }
    }
    const isSelected = section === 'settings' ? location.split('/')[1] === 'settings': section === 'knowledge' ? location.split('/')[1] === 'knowledge' : section === 'stats' ? location.split('/')[1] === 'stats' : section === 'functions' ? location.split('/')[1] === 'functions' : section === 'contacts' ? location.split('/')[1] === 'contacts':location.split('/')[1] === 'conversations'

    //FRONT
    return (
        <Tooltip isOpen={isHovered} label={sectionsMap[section]} placement='right' color={'black'} bg='white' boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} borderWidth={'1px'} borderColor={'gray.200'} borderRadius='.4rem' fontSize='sm' fontWeight={'medium'} p='6px'>
            <Flex mt='.5vh' zIndex={10} position={'relative'} borderRadius={'.5rem'} ref={ref} justifyContent='center' alignItems='center' h='37px' width={'37px'} cursor='pointer'  bg={'transparent'} color={(isSelected) ? 'black' : 'gray.600'} _hover={{color:'rgba(59, 90, 246)'}} onClick={handleClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <Icon as={icon} boxSize='18px'/>
            </Flex>
        </Tooltip>
    )
})
   
//LOGOUT BOX 
const LogoutBox = ({ userInfoApp, auth, addOrganization, changeOrganization }:{userInfoApp:userInfo, auth:any, addOrganization:any, changeOrganization:any}) => {

    const { logout } = useAuth0()

    //SHOW AND HIDE LOGOUT ON HOVER LOGIC
    const [showLogout, setShowLogout] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setShowLogout(true)
    }
    const handleMouseLeave = () => {timeoutRef.current = setTimeout(() => {setShowLogout(false);setShowStatusList(false)}, 100)}

    //CHANGE USER STATUS
    const phoneMap:{[key:string]:[string, IconType, string]} = {'connected':[t('Connected'), BsFillTelephoneInboundFill, 'green.400'], 'out':[t('Out'), BsFillTelephoneMinusFill, 'orange.400'], 'disconnected':[t('Disconnected'), BsFillTelephoneXFill, 'gray.400']}
    const [userStatus, setUserStatus] = useState<string>('connected')
    const [showStatusList, setShowStatusList] = useState<boolean>(false)
     
    //VIEW SHORTCUTS
    const [showShortcuts, setShowShortcuts] = useState<boolean>(false)

    //VIEW FEEDBACK
    const [showFeedback, setShowFeedback] = useState<boolean>(false)

    //MEMOIZED BOXES
    const memoizedShortcutsBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowShortcuts} maxW={'60vw'}> 
            <ShortCutsList setShowShortcuts={setShowShortcuts}/>
        </ConfirmBox>
    ), [showShortcuts])
    const memoizedFeedbackBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowFeedback}> 
            <SendFeedBack setShowFeedback={setShowFeedback}/>
        </ConfirmBox>
    ), [showFeedback])

    const OrganizationComponent = () => {

        const [showOrganization, setShowOrganizations] = useState<boolean>(false)

        const OrganizationsBox = () => {

            const navigate = useNavigate()
            const [showAddOrganization, setShowAddOrganization] = useState<boolean>(false)
    
            
            const JoinOrganizationBox = () => {
                const [invitationCode, setInvitationCode] = useState<string>('')
                const [waitingNewOrganization, setWaitingNewOrganization] = useState<boolean>(false)

                const addNewOrganization = async () => {
                    setWaitingNewOrganization(true)
                    await addOrganization({invitationCode, setInvitationCode})
                    setWaitingNewOrganization(false)
                }
                
                return(<> 
                    <Box p='15px'> 
                        <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('InvitationCode')}</Text>
                        <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.200'/>
                        <Text mt='2vh' mb='.5vh' fontSize='.9em' fontWeight='medium' whiteSpace='nowrap'>{t('GetInvitationCode')}</Text>
                        <EditText value={invitationCode} setValue={setInvitationCode} hideInput={false} size='sm' placeholder='xxxx-xxxx-xxxx-xxxx' />
                    </Box>
                    <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                        <Button  size='sm' variant={'main'} isDisabled={invitationCode === ''} onClick={addNewOrganization}>{waitingNewOrganization?<LoadingIconButton/>:t('Join')}</Button>
                        <Button  size='sm' variant={'common'} onClick={()=>setShowAddOrganization(false)}>{t('Cancel')}</Button>
                    </Flex>
                </>)
            }

            return(<> 
                {showAddOrganization &&     
                <ConfirmBox setShowBox={setShowAddOrganization}> 
                    <JoinOrganizationBox/>
                </ConfirmBox>}
                <Box>
                    <Text fontSize='.9em' fontWeight='medium' whiteSpace='nowrap'>{t('Organizations')}</Text>
                    <Box bg='gray.200' height='1px' width='100%' mb='1vh' mt='1vh' />

                    {userInfoApp.organizations.length === 0 ? (
                        <Text fontSize='.8em' fontWeight='normal'>{t('NoOrganizations')}</Text>
                    ) : (
                        userInfoApp.organizations.map((org) => (
                        <Flex key={`organization-${org.id}`} justifyContent={'space-between'}  cursor={'pointer'} fontWeight={auth.authData.organizationId === org.id ? 'medium':'normal'} color={auth.authData.organizationId === org.id ?'brand.text_blue':'black'} alignItems='center' p='7px' fontSize='.9em' _hover={{ bg:'brand.gray_2' }} borderRadius='.4rem' onClick={() => {setShowLogout(false);changeOrganization(org)}}>
                            {org.name}
                            {auth.authData.organizationId === org.id && <Icon as={FaCheck} color='brand.text_blue'/>}
                        </Flex>
                        ))
                    )}
                </Box>
                <Box bg='gray.200' height='1px' width='100%' mb='1vh' mt='2vh' />

                <Flex justifyContent={'space-between'}gap='10px' alignItems={'center'} p='7px'  fontSize='.9em' borderRadius={'.5rem'} _hover={{bg:'brand.gray_2', color:'black'}} color='gray.600' cursor='pointer' onClick={() => {setShowOrganizations(false);setShowAddOrganization(true)}}>
                    <Text whiteSpace={'nowrap'}>{t('AddOrganization')}</Text>
                    <Icon as={FiPlus}/>
                </Flex>
                {auth.authData.organizationData.is_admin && <Flex justifyContent={'space-between'}gap='10px' alignItems={'center'} p='7px'  fontSize='.9em' borderRadius={'.5rem'} _hover={{bg:'brand.gray_2', color:'black'}} color='gray.600' cursor='pointer' onClick={() => {setShowLogout(false);navigate('/settings/organization/data')}}>
                    <Text whiteSpace={'nowrap'}>{t('SeeOrganization')}</Text>
                    <Icon as={BiSolidBuildings}/>
                </Flex>}
            </>)
        }

        return ( 
        <Box position='relative' px='15px' onMouseEnter={() => {setShowOrganizations(true)}} onMouseLeave={() => {setShowOrganizations(false)}}> 
            <Flex p='7px' gap='10px'  justifyContent={'space-between'} alignItems='center'  cursor='pointer' _hover={{ bg: 'brand.gray_2' }} borderRadius='.4rem'  >
                <Text fontSize='.9em' whiteSpace='nowrap'><span style={{fontWeight:500}}>{t('Organization')}: </span>{auth.authData.organizationName}</Text>
                <Icon as={IoIosArrowForward} />
            </Flex>
            {showOrganization && 
            <MotionBox initial={{ opacity: 0, left:-30}} animate={{ opacity: 1, left: -20 }}  exit={{ opacity: 0, left: -30}} transition={{ duration: '0.2', ease: 'easeOut'}} 
            overflow={'hidden'} p='15px' ml={'calc(100% + 5px)'} bottom={0} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={1000}   position={'absolute'} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.200'}>
                <OrganizationsBox/>
            </MotionBox>}
        </Box>

        )
    }

    const memoizedOrganizationComponent = useMemo(() => (<OrganizationComponent/>),[])

    //FRONT
    return (<> 

        {showShortcuts && memoizedShortcutsBox}
        {showFeedback && memoizedFeedbackBox}

        <Flex  alignItems='center' flexDir='column' position='relative' onMouseEnter={handleMouseEnter}  onMouseLeave={handleMouseLeave} >
           
            <Box position={'relative'}> 
                <Avatar name={userInfoApp.name} height={'25px'} width={'25px'} size='xs' />
                <Box bg={phoneMap[userStatus][2]} position={'absolute'} bottom={'-4px'} right={'-2px'} height={'10px'} width={'10px'} borderRadius={'full'}/>
            </Box>

            <AnimatePresence> 
            {showLogout && (
                <MotionBox initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                style={{ transformOrigin: 'bottom left' }}  minW='190px'  position='absolute' bg='white' py='15px' left='8px' bottom='30px' zIndex={10000000000000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='gray.200' borderWidth='1px' borderRadius='.5rem'>
                    
                    <Box  px='15px'>
                        <Text fontSize='.8em' fontWeight='medium' whiteSpace='nowrap'>{userInfoApp.name + ' ' + userInfoApp.surname}</Text>
                        <Text fontSize='.7em' color='gray.600' whiteSpace='nowrap'>{auth.authData.email}</Text>
                    </Box>

                    <Box px='15px' position='relative' mt='7px'> 

                        {showStatusList &&
                            <MotionBox initial={{ opacity: 0, top: -10}} animate={{ opacity: 1, top: 0 }}  exit={{ opacity: 0, top: -10}} transition={{ duration: '0.2', ease: 'easeOut'}} 
                            overflow={'hidden'} ml={'calc(100% + 5px)'} width={'100%'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={1000}   position={'absolute'} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.200'}>
                            {['connected', 'out', 'disconnected'].map((status, index) => (
                                <Flex key={`status-list-${index}`} bg={status === userStatus?'brand.blue_hover':''} color={phoneMap[status][2]} p='7px' gap='10px' alignItems='center' cursor='pointer' _hover={{ bg: status === userStatus?'brand.blue_hover':'brand.hover_gray' }} onClick={() => {setUserStatus(status);setShowStatusList(!showStatusList)}}>
                                    <Icon height={'12px'} width={'12px'} as={phoneMap[status][1]} />
                                    <Text fontWeight={'medium'} fontSize='.8em' whiteSpace='nowrap'>{phoneMap[status][0]}</Text>
                                </Flex>
                            ))}
                            </MotionBox>}
                        
                            <Flex borderColor={'gray.200'} borderWidth={'1px'}  color={phoneMap[userStatus][2]}  justifyContent={'space-between'}  px='7px' py='5px'  alignItems='center' cursor='pointer' _hover={{ bg: 'brand.hover_gray' }} borderRadius='.4rem' onClick={() => setShowStatusList(!showStatusList)}>
                                <Flex  alignItems={'center'} gap='10px'> 
                                    <Icon height={'12px'} width={'12px'} as={phoneMap[userStatus][1]} />
                                    <Text fontWeight={'medium'} fontSize='.8em' whiteSpace='nowrap'>{phoneMap[userStatus][0]}</Text>
                                </Flex>
                                <Box color='gray.600' > 
                                    <IoIosArrowDown className={showStatusList ? "rotate-icon-up" : "rotate-icon-down"}/>
                                </Box>
                            </Flex>
                            <Box bg='gray.200' height='1px' width='100%' mb='7px' mt='10px' />

                    </Box>

 
                    {memoizedOrganizationComponent}

                    <Box px='15px'> 
                        <Box bg='gray.200' height='1px' width='100%' mb='7px' mt='10px' />

                        <Flex p='7px' gap='10px'  justifyContent={'space-between'} alignItems='center' color='gray.600' cursor='pointer' _hover={{ bg: 'brand.gray_2', color:'black' }} borderRadius='.4rem' onClick={() => {setShowLogout(false);setShowShortcuts(true)}}>
                            <Text fontSize='.9em' whiteSpace='nowrap'>{t('Shortcuts')}</Text>
                            <Icon as={PiKeyReturn} />
                        </Flex>

                        <Flex p='7px' gap='10px'  justifyContent={'space-between'} alignItems='center' color='gray.600' cursor='pointer' _hover={{ bg: 'brand.gray_2', color:'black' }} borderRadius='.4rem' onClick={() => {setShowLogout(false);setShowFeedback(true)}}>
                            <Text fontSize='.9em' whiteSpace='nowrap'>{t('Feedback')}</Text>
                            <Icon as={VscFeedback} />
                        </Flex>
                            
                        <Box bg='gray.200' height='1px' width='100%' mb='7px' mt='10px' />

                        <Flex p='7px' gap='10px'  justifyContent={'space-between'} alignItems='center' color='red.500' cursor='pointer' _hover={{ bg: 'red.50', color:'red.600' }} borderRadius='.4rem' onClick={() =>{logout({ logoutParams: { returnTo: window.location.origin } });auth.signOut()}}>
                            <Text fontSize='.9em' whiteSpace='nowrap'>{t('SignOut')}</Text>
                            <Icon boxSize={'13px'} as={FaArrowRightToBracket} />
                        </Flex>
                    </Box>
                </MotionBox>
                )}
            </AnimatePresence>
        </Flex>
        </>)
}


const SuspenseSectionComponent = () => {
    return (
        <Flex position={'relative'} width={'calc(100vw - 45px)'} bg='brand.hover_gray' height={'100vh'}> 

        <Flex zIndex={10} h='100vh' overflow={'hidden'} w='220px'  gap='20px' py='2vh' flexDir={'column'} justifyContent={'space-between'} borderRightColor={'gray.200'} borderRightWidth={'1px'}>
            <Flex bg='brand.hover_gray' px='1vw' zIndex={100} h='100vh'  flexDir={'column'} justifyContent={'space-between'}  >
                    <Box> 
                        <Flex  alignItems={'center'} justifyContent={'space-between'}> 
                            <Skeleton> <Text  fontWeight={'semibold'} fontSize={'1.2em'}>{t('Functions')}</Text></Skeleton>
                            <Skeleton><IconButton bg='transparent' borderWidth={'1px'} borderColor={'gray.200'}  h='28px' w='28px'  _hover={{bg:'brand.gray_1', color:'brand.text_blue'}} variant={'common'} icon={<FaPlus size={'16px'}/>} aria-label="create-function" size='xs' /></Skeleton>
                        </Flex>
                        <Box h='1px' w='100%' bg='gray.300' mt='2vh' mb='2vh'/>

                    </Box>

                    <Box flex='1' > 
                        
                        {['Hola','Hola','Hola','Hola','Hola','Hola','Hola',]?.map((name, index) => {
                            return (
                            <Skeleton key={`function-${index}`} style={{borderRadius:'2rem', height:'20px', width:'100%', marginTop:'1vh'}}> 
                              
                            </Skeleton>)
                        })}
                    </Box>
                </Flex>
        </Flex>

        <Flex bg='brand.hover_gray' w='calc(100vw - 265px)' h='100vh' ></Flex>
    </Flex>

    )
}

 