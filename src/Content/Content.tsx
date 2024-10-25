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
//FETCH DATA
import fetchData from './API/fetchData'
import io from 'socket.io-client' 
//FRONT
import { Flex, Box, Icon, Avatar, Text, Tooltip, Button, chakra, shouldForwardProp, Image, Portal, useColorMode } from '@chakra-ui/react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
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
import determineBoxStyle from './Functions/determineBoxStyle'
//ICONS
import { IconType } from 'react-icons'
import { IoFileTrayFull, IoChatboxOutline, IoPersonOutline } from "react-icons/io5" 
import { BsFillPersonLinesFill, BsBarChartFill, BsBuildings,BsStars,  BsFillTelephoneInboundFill, BsFillTelephoneMinusFill, BsFillTelephoneXFill, BsFillLayersFill } from "react-icons/bs"
import { FaPlus, FaArrowRightToBracket } from "react-icons/fa6"
import { IoIosSettings, IoIosArrowDown } from "react-icons/io"
import { RxCross2 } from "react-icons/rx"
import { FiPlus } from "react-icons/fi"
import { BiSolidBuildings } from 'react-icons/bi'
import { PiBuildingApartmentFill, PiKeyReturn } from "react-icons/pi"
import { TbArrowBack } from 'react-icons/tb'
import { VscFeedback } from "react-icons/vsc"
//TYPING 
import { Organization, ConversationsData, userInfo, Views } from './Constants/typing'
//MAIN SECTIONS
const ConversationsTable = lazy(() => import('./Sections/Conversations/ConversationsTable'))
const ClientsTable = lazy(() => import('./Sections/Clients/ClientsTable'))
const Functions = lazy(() => import('./Sections/Flows/Functions'))
const ContactBusinessesTable = lazy(() => import('./Sections/Businesses/BusinessesTable'))
const Conversation = lazy(() => import('./Sections/Conversations/Conversation'))
const Client = lazy(() => import('./Sections/Clients/Client'))
const Business = lazy(() => import('./Sections/Businesses/Business'))
const Stats = lazy(() => import('./Sections/Stats/Stats'))
const Settings = lazy(() => import('./Sections/Settings/Settings'))
const Knowledge = lazy(() => import('./Sections/Knowledge/Knowledge'))
const NotFound = lazy(() => import('./Components/Once/NotFound'))

 
//TYPING
type SectionKey = 'conversations' | 'clients' | 'contact-businesses' | 'functions'| 'knowledge' | 'stats' | 'settings'
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
        const previousViews = DetermineConversationViews(data?.previous_data, views, auth.authData?.userId || -1)
        const newViews = DetermineConversationViews(data?.new_data, views, auth.authData?.userId || -1)

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
        if (!window.location.hash.substring(1)) navigate(section !== null ? section : 'conversations')
        else navigate(window.location)

        socket.current = io('https://api.matil.ai/platform', {
            path: '/v2/socket.io/',
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
            if (data?.is_new) showToast({message:t('NewConversationCreated',{id:data.new_data.local_id}), type:'conversation', id:data.new_data.id, linkPath:true, navigate, isDesktop:true})
            
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
                case 'KeyW':    
                    if (currentIndex !== -1) deleteHeaderSection(headerSections[currentIndex],currentIndex)
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

    //DRAGGING VISIBLE HEADER COMPONENTS
    const onDragEnd = (result:any) => {
      if (!result.destination) return
      const items = Array.from(headerSections)
      const [reorderedItem] = items.splice(result.source.index, 1)
      items.splice(result.destination.index, 0, reorderedItem)
      setHeaderSections(items)
    }
  
    //ADD HEADER SECTION LOGIC
    const addHeaderSection = (description:string, code:number, section:'conversation' | 'client' | 'contact-business', local_id?:number) => {
        if (!headerSections.some(value => value.code === code && value.type === section)) {
            setHeaderSections(prev => [...prev, {'description':description, 'code': code, local_id, 'type':section}])
            if (section ===  'conversation') navigate(`conversations/conversation/${code}`)
            else if (section === 'client')  navigate(`clients/client/${code}`)
            else if (section === 'contact-business')  navigate(`contact-businesses/business/${code}`)
        }
    }
   
    //DELETE HEADER SECTION LOGIC
    const deleteHeaderSection = (element: Section, indexToDelete?: number) => {
        setHeaderSections((prevHeaderSections) => {
            const index = indexToDelete !== undefined ? indexToDelete : prevHeaderSections.findIndex(e => e.code === element.code && e.type === element.type)
            const filteredHeaderSections = prevHeaderSections.filter((e, idx) => idx !== index)
            const currentLocation = location
    
            const isUserInSection = (prevHeaderSections[index].type === 'conversation' && location === `/conversations/conversation/${prevHeaderSections[index].code}`) || 
                (prevHeaderSections[index].type === 'client' && location === `/clients/client/${prevHeaderSections[index].code}`) || 
                (prevHeaderSections[index].type === 'contact-business' && location === `/contact-businesses/business/${prevHeaderSections[index].code}`)
    
            if (isUserInSection) {
                if (filteredHeaderSections.length > 0) {
                    const targetIndex = Math.max(index - 1, 0)
                    if (prevHeaderSections[targetIndex].type === 'client') navigate(`/clients/client/${filteredHeaderSections[targetIndex].code}`)
                    else if (prevHeaderSections[targetIndex].type === 'contact-business') navigate(`/contact-businesses/business/${filteredHeaderSections[targetIndex].code}`)
                    else navigate(`/conversations/conversation/${filteredHeaderSections[targetIndex].code}`)
                } else {
                    if (currentLocation.startsWith('/clients')) navigate('/clients')
                    else if (currentLocation.startsWith('/contact-businesses')) navigate('/contact-businesses')
                    else navigate('/conversations')
                }
            }
    
            session.dispatch({type: 'UPDATE_HEADER_SECTIONS', payload: {action: 'remove', index}})
            setVisibleSectionsIndex(prev => prev - 1)
            return filteredHeaderSections
        })
    }

    //SHOW INTRODUCE CODE BOX WHEN THERE IS NO ORGANIZATION
    if (!auth.authData.organizationId) return (<OrganizationsBox userInfoApp={userInfoApp} isAdmin={false}  setUserInfoApp={setUserInfoApp} auth={auth}  session={session} setHeaderSections={setHeaderSections}/>)
    
    //MEMOIZED CALL WIDGET
    const memoizedCallWidget = useMemo(() => <CallWidget />, [])

    //SECTIONS WITH HEADER
    const isHeaderSection =  location.startsWith('/conversation') || location.startsWith('/client') || location.startsWith('/contact-businesses')
    
    const barRef = useRef<HTMLDivElement>(null)

    const NavBar = () => {

        //REFS
        const conversationsRef = useRef<HTMLDivElement>(null)
        const clientsRef = useRef<HTMLDivElement>(null)
        const businessesRef = useRef<HTMLDivElement>(null)
        const flowsRef = useRef<HTMLDivElement>(null)
        const knowledgeRef = useRef<HTMLDivElement>(null)
        const statsRef = useRef<HTMLDivElement>(null)
        const settingsRef = useRef<HTMLDivElement>(null)
        const sectionsRefs = {conversations:conversationsRef, clients:clientsRef, 'contact-businesses':businessesRef, 'knowledge':knowledgeRef, 'functions':flowsRef, 'stats':statsRef, 'settings':settingsRef}
 
        useEffect(() => {
            const updateBarPosition = () => {
                const currentSection = location.split('/')[1] as 'conversations' | 'clients' | 'contact-businesses' | 'knowledge' | 'functions' | 'stats' | 'settings';
                if (sectionsRefs[currentSection].current && barRef.current) {
                    isFirstSection.current = false
                    const sectionTop = sectionsRefs[currentSection]?.current?.getBoundingClientRect().top || 0
                    localStorage.setItem('currentSectionTop', String(sectionTop))
                    barRef.current.style.transform = `translateY(${sectionTop}px)`
                }
            }    
            updateBarPosition()
            window.addEventListener('resize', updateBarPosition)
            return () => {window.removeEventListener('resize', updateBarPosition)}
        }, [location, sectionsRefs, barRef])
        
         return (<>
        
            <Flex alignItems='center' flexDir='column' >
                <Box  width='100%'> 
                    <Flex width={'100%'} justifyContent={'center'} mb='5vh'> 
                        <Image src='/images/matil-simple-2.svg' width={'22px'} height={'22px'} />
                    </Flex>
                    <NavBarItem ref={conversationsRef} icon={IoFileTrayFull} section={'conversations'}/>
                    <NavBarItem ref={clientsRef} icon={BsFillPersonLinesFill} section={'clients'}/>
                    <NavBarItem ref={businessesRef} icon={PiBuildingApartmentFill} section={'contact-businesses'}/>
                  
                </Box>
            </Flex>
            <Flex  alignItems='center' flexDir='column' position={'relative'}>
                {isAdmin && <NavBarItem ref={flowsRef}  icon={BsStars} section={'functions'}/>}
                {isAdmin && <NavBarItem  ref={statsRef} icon={BsBarChartFill} section={'stats'}/>}
                {isAdmin && <NavBarItem ref={knowledgeRef}  icon={BsFillLayersFill} section={'knowledge'}/>}
                {isAdmin && <NavBarItem ref={settingsRef} icon={IoIosSettings} section={'settings'}/>}
                <Flex width='40px' bg='gray.300' height='1px' mb='2vh' mt='2vh'/>
                <LogoutBox userInfoApp={userInfoApp} auth={auth} />
            </Flex>
        </>
        )
    }
    const memoizedNavbar = useMemo(() => <NavBar />, [location])

    //FRONT 
    return(<> 
        
        <Box ref={barRef} transform={`translateY(${localStorage.getItem('currentSectionTop')})px)`} style={{position: 'absolute', zIndex:100, left: 0, width: '3px', top:0, backgroundColor: 'rgba(59, 90, 246)', height:'51px'}}   transition={isFirstSection.current ? 'none':'transform 0.25s ease'} />
        {socket.current ? 

        <Flex width={'100vw'} height={'100vh'} overflow={'hidden'}> 

            {memoizedCallWidget}
        
            {/*SIDEBAR*/}
            <Flex flexDir='column'  alignItems='center'  borderRightColor={'gray.300'} borderRightWidth={'1px'} justifyContent='space-between' height={'100vh'} width='55px' py='3vh' bg='#e8e8e8' >
                {memoizedNavbar}
            </Flex>

            {/*CONTENT OF THE SECTIONS*/}
            <Box  height={'calc(100vh + 60px)'}>
 
                {/*HEADER ELEMENTS*/}
                <motion.div initial={{ y: !isHeaderSection ? -60 : 0 }} animate={{ y: !isHeaderSection ? -60 : 0 }} exit={{ y: !isHeaderSection ? -60 : 0 }} transition={{ duration: 0.2 }}
                    style={{  height: '60px', display: 'flex', width:'calc(100vw - 55px)', alignItems: 'center', justifyContent: 'space-between', zIndex:1000, background:'#f1f1f1'}}>
                    <Flex height='100%' minW={0} flex='1' overflow={'scroll'} ref={containerRef} > 
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="sections" direction="horizontal">
                                {(provided) => (
                                <Flex width='100%' ref={provided.innerRef} {...provided.droppableProps} height="100%">
                                    {headerSections.length === 0?
                                        <Flex height="100%" bg='#f1f1f1' justifyContent={'space-between'} alignItems='center' minW='120px' maxW='280px'  borderColor='gray.200' borderBottomWidth={'1px'}  px='15px'cursor='pointer' >
                                            <Text fontSize={'.8em'} fontWeight={'medium'}>{t('NoSections')}</Text>
                                        </Flex>
                                        :
                                    <>
                                        {headerSections.slice(0, visibleSectionsIndex).map((element, index) => {
                                            const sectionToSelect = element.type === 'conversation' ? 'conversations/conversation/' + element.code :  element.type === 'client' ? 'clients/client/' + element.code:'contact-businesses/business/' + element.code
                                            const isSectionSelected = location.startsWith(`/${sectionToSelect}/`) || location === `/${sectionToSelect}`;
                                            const width = `calc(${(containerRef.current?.getBoundingClientRect().width || 0) / visibleSectionsIndex}% - 10px)`;
                                            return (
                                                <Draggable  key={`section-${element.type}-${element.code}`} draggableId={`${element.type}-${element.code}`} index={index}>
                                                {(provided, snapshot) => (
                                                    <Flex  boxShadow={snapshot.isDragging?'0 4px 8px rgba(0, 0, 0, 0.3)':'none'}  height="100%" ref={provided.innerRef}  {...provided.draggableProps} {...provided.dragHandleProps} justifyContent={'space-between'} alignItems='center' w={width} minW='120px' maxW='280px' bg={isSectionSelected ? '#e8e8e8' :'#f1f1f1'} _hover={{ bg: isSectionSelected ? '#e8e8e8' : 'brand.hover_gray' }} borderColor='gray.200' borderBottomWidth={isSectionSelected?'0':'1px'} borderRightWidth='1px' px='15px'cursor='pointer' onClick={() => {navigate(sectionToSelect)}}>
                                                        <Flex flex='1' minW='0' gap='10px' alignItems={'center'}>
                                                            <Icon as={element.type === 'conversation' ? IoChatboxOutline : element.type === 'client' ? IoPersonOutline:BsBuildings } />
                                                            <Box flex='1' minW='0'>
                                                                <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} fontSize='xs' >{element.description}</Text>
                                                                <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} fontSize='2xs'>#{element.local_id?element.local_id:element.code}</Text>
                                                            </Box>
                                                        </Flex>
                                                        <Flex width={'20px'} justifyContent='center' alignItems='center' p='2px' borderRadius='.4rem' color={'gray.500'} _hover={{ bg: 'gray.200', color: 'black' }} cursor='pointer' onClick={(e) => {e.stopPropagation();deleteHeaderSection(element, index) }}>
                                                            <Icon as={RxCross2} boxSize='15px' />
                                                        </Flex>
                                                    </Flex>
                                                )}
                                                </Draggable>
                                            )
                                        })}
                                            {showMoreHeaderSections && (
                                                <Box height='100%'  px='10px' borderColor='gray.200' borderBottomWidth='1px'>
                                                    <Flex height='100%' alignItems='center' >
                                                        <Flex ref={showMoreHeaderSectionsButtonRef} justifyContent='center' onClick={() => setShowMoreHeaderSectionsBox(!showMoreHeaderSectionsBox)} alignItems='center' gap='5px' p='4px' fontSize='sm' borderRadius='.4rem' _hover={{ bg: 'gray.200' }} cursor='pointer'>
                                                            <Text fontSize={'sm'}>{t('More')}</Text>
                                                            <Icon as={IoIosArrowDown} className={showMoreHeaderSectionsBox ? "rotate-icon-up" : "rotate-icon-down"}/>
                                                        </Flex>
                                                    </Flex>
                                                    <AnimatePresence> 

                                                    {showMoreHeaderSectionsBox &&
                                                    <Portal> 
                                                        <MotionBox transition={{ duration: '0.2',  ease: 'easeOut'}} initial={{ opacity: 0, marginTop: 0 }} animate={{ opacity: 1, marginTop: 10 }} exit={{opacity: 0, marginTop: 0 }} right={window.innerWidth - (showMoreHeaderSectionsButtonRef.current?.getBoundingClientRect()?.right || 0)} top={`${showMoreHeaderSectionsButtonRef.current?.getBoundingClientRect().bottom}px`}  mt='3px' maxH='80vh' overflowY='scroll'  ref={showMoreHeaderSectionsBoxRef}  position='fixed'  bg='white' zIndex={1000} boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'}  borderColor={'gray.300'} borderWidth={'1px'} borderRadius={'.5rem'}> 
                                                        {headerSections.slice(visibleSectionsIndex).map((element, index) => {
                                                            const sectionToSelect = element.type === 'conversation' ? 'conversations/conversation/' + element.code :  element.type === 'client' ? 'clients/client/' + element.code:'contact-businesses/business/' + element.code
                                                            const isSectionSelected = location.startsWith(`/${sectionToSelect}/`) || location ===  `/${sectionToSelect}`
                                                                            
                                                            return(
                                                                <Flex height='100%' key={`visible-header-${index}`}  justifyContent={'space-between'} alignItems='center' width={'200px'} bg={isSectionSelected?'#e8e8e8':'transparent'} gap='10px' p='15px' cursor='pointer' _hover={{bg:isSectionSelected?'#e8e8e8':'brand.hover_gray'}}  onClick={()=>{navigate(sectionToSelect)}}> 
                                                                    <Flex flex='1'minW='0'  gap='10px' alignItems={'center'} >
                                                                    <Icon as={element.type === 'conversation' ? IoChatboxOutline : element.type === 'client' ? IoPersonOutline:BsBuildings } />
                                                                        <Box  flex='1' minW='0'   > 
                                                                            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  fontSize='xs' fontWeight={'medium'}>{element.description}</Text>
                                                                            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} fontSize='2xs'>#{element.local_id?element.local_id:element.code}</Text>
                                                                        </Box>
                                                                    </Flex>
                                                                    <Flex width={'20px'} justifyContent='center' alignItems='center' p='2px' borderRadius='.4rem' color={'gray.500'} _hover={{bg:'gray.200', color:'black'}} cursor='pointer' onClick={(e) => {e.stopPropagation();deleteHeaderSection(element, visibleSectionsIndex + index)}}>
                                                                        <Icon as={RxCross2} boxSize='15px'/>
                                                                    </Flex>
                                                                </Flex>
                                                            )
                                                        })}
                                                        </MotionBox>
                                                        </Portal>
                                                    }
                                                   </AnimatePresence> 

                                                </Box>
                                        )}
                                            {provided.placeholder}
                                    </>}
                                    <Box height='100%' flex='1' px='10px' borderColor='gray.200' borderBottomWidth='1px'/> 
                                </Flex>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </Flex>
                    <OrganizationsBox userInfoApp={userInfoApp} isAdmin={isAdmin}  setUserInfoApp={setUserInfoApp} auth={auth} session={session} setHeaderSections={setHeaderSections}/>
                </motion.div>
            
                {/*SECTIONS*/}
                <motion.div initial={{ y: !isHeaderSection ? -60 : 0 }} animate={{ y: !isHeaderSection ? -60 : 0 }} exit={{ y: !isHeaderSection ? -60 : 0 }} transition={{ duration: 0.2 }}>
                    <Suspense fallback={<></>}>    
                        <Routes >
                            <Route path="/conversations" element={<ConversationsTable socket={socket}/>}/>
                            <Route path="/conversations/conversation/:n/*" element={<Conversation socket={socket} addHeaderSection={addHeaderSection} deleteHeaderSection={deleteHeaderSection} />} />
                            <Route path="/clients" element={<ClientsTable/>}  />
                            <Route path="/clients/client/:n" element={<Client socket={socket} comesFromConversation={false}  addHeaderSection={addHeaderSection} deleteHeaderSection={deleteHeaderSection}/>}/>
                            <Route path="/contact-businesses" element={<ContactBusinessesTable  addHeaderSection={addHeaderSection}/>}/>
                            <Route path="/contact-businesses/business/:n" element={<Business socket={socket} comesFromConversation={false} addHeaderSection={addHeaderSection}/>}/>
                            <Route path="/functions/*" element={<Functions/>}/>
                            <Route path="/knowledge/*" element={<Knowledge/>}/>
                            <Route path="/stats/*" element={<Stats/>}/>
                            <Route path="/settings/*" element={<Settings />}/>
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </motion.div>
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
    const sectionsMap = {conversations: t('Conversations'), clients: t('Clients'), stats: t('Stats'), 'functions':t('FlowsFunctions'),'knowledge':t('Knowledge'), 'contact-businesses':t('Businesses'), settings: t('Settings')}
 
    //HOVER AND SELECT LOGIC
    const [isHovered, setIsHovered] = useState(false)
    const handleClick = () => {
        if (section === 'conversations' || section === 'clients' || location.split('/')[1] !== section) {
            navigate(section)
         }
    }
    const isSelected = section === 'settings' ? location.split('/')[1] === 'settings': section === 'knowledge' ? location.split('/')[1] === 'knowledge' : section === 'stats' ? location.split('/')[1] === 'stats' : section === 'functions' ? location.split('/')[1] === 'functions' : location === `/${section}` 

    //FRONT
    return (
        <Tooltip isOpen={isHovered} label={sectionsMap[section]} placement='right' color={'black'} bg='white' boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} borderWidth={'1px'} borderColor={'gray.200'} borderRadius='.4rem' fontSize='sm' fontWeight={'medium'} p='6px'>
            <Flex ref={ref} justifyContent='center' alignItems='center' py='15px' width={'55px'} cursor='pointer'  bg={(isSelected) ? '#f1f1f1': isHovered ? '#f1f1f1':'transparent'} color={(isSelected) ? 'rgba(59, 90, 246)' : 'gray.600'} onClick={handleClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <Icon as={icon} boxSize='21px'/>
            </Flex>
        </Tooltip>
    )
})
  
//LOGOUT BOX 
const LogoutBox = ({ userInfoApp, auth }:{userInfoApp:userInfo, auth:any}) => {

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
                style={{ transformOrigin: 'bottom left' }}  minW='190px'  position='absolute' bg='white' p='15px' left='8px' bottom='30px' zIndex={1000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='gray.300' borderWidth='1px' borderRadius='.5rem'>
                    <Box>
                        <Text fontSize='.8em' fontWeight='medium' whiteSpace='nowrap'>{userInfoApp.name + ' ' + userInfoApp.surname}</Text>
                        <Text fontSize='.7em' color='gray.600' whiteSpace='nowrap'>{auth.authData.email}</Text>
                    </Box>

                    <Box position='relative' mt='7px'> 

                        {showStatusList &&
                            <MotionBox initial={{ opacity: 0, top: -10}} animate={{ opacity: 1, top: 0 }}  exit={{ opacity: 0, top: -10}} transition={{ duration: '0.2', ease: 'easeOut'}} 
                            overflow={'hidden'} ml={'calc(100% + 5px)'} width={'100%'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={1000}   position={'absolute'} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.300'}>
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
                    </Box>

                    <Box bg='gray.200' height='1px' width='100%' mb='7px' mt='10px' />

                    <Flex p='7px' gap='10px'  justifyContent={'space-between'} alignItems='center' color='gray.600' cursor='pointer' _hover={{ bg: 'brand.hover_gray', color:'black' }} borderRadius='.4rem' onClick={() => {setShowLogout(false);setShowShortcuts(true)}}>
                         <Text fontSize='.9em' whiteSpace='nowrap'>{t('Shortcuts')}</Text>
                         <Icon as={PiKeyReturn} />
                    </Flex>

                    <Flex p='7px' gap='10px'  justifyContent={'space-between'} alignItems='center' color='gray.600' cursor='pointer' _hover={{ bg: 'brand.hover_gray', color:'black' }} borderRadius='.4rem' onClick={() => {setShowLogout(false);setShowFeedback(true)}}>
                         <Text fontSize='.9em' whiteSpace='nowrap'>{t('Feedback')}</Text>
                         <Icon as={VscFeedback} />
                    </Flex>
                           
                    <Box bg='gray.200' height='1px' width='100%' mb='7px' mt='10px' />

                    <Flex p='7px' gap='10px'  justifyContent={'space-between'} alignItems='center' color='red.500' cursor='pointer' _hover={{ bg: 'red.50', color:'red.600' }} borderRadius='.4rem' onClick={() => auth.signOut()}>
                         <Text fontSize='.9em' whiteSpace='nowrap'>{t('SignOut')}</Text>
                         <Icon boxSize={'13px'} as={FaArrowRightToBracket} />
                    </Flex>
                </MotionBox>
                )}
            </AnimatePresence>
        </Flex>
        </>)
}

interface OrganizationsBoxProps {
    userInfoApp:userInfo
    isAdmin:boolean
    setUserInfoApp:Dispatch<SetStateAction<userInfo>>
    auth:any
    session:any
    setHeaderSections:Dispatch<SetStateAction<Section[]>>
}
//CHANGE AND ACCESS TO AN ORGANIZATION BOX. IT RENDERS THE JOIN ORGANIZATION FULL SCREEN, WHERE THERE IS NOT ORGANIZATION
const OrganizationsBox = ({ userInfoApp, isAdmin, setUserInfoApp, auth, session, setHeaderSections }:OrganizationsBoxProps) => {    

    //JOIN ORGANIZATION WHEN THERE IS MORE ORGANIZATIONS
    const JoinOrganizationBox = () => {
        const [invitationCode, setInvitationCode] = useState<string>('')
        return(<> 
            <Box p='15px'> 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('InvitationCode')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Text mt='2vh' mb='.5vh' fontSize='.9em' fontWeight='medium' whiteSpace='nowrap'>{t('GetInvitationCode')}</Text>
                <EditText value={invitationCode} setValue={setInvitationCode} hideInput={false} size='sm' placeholder='xxxx-xxxx-xxxx-xxxx' />
            </Box>
            <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                <Button  size='sm' variant={'main'} isDisabled={invitationCode === ''} onClick={() => addOrganization({invitationCode, setInvitationCode})}>{waitingNewOrganization?<LoadingIconButton/>:t('Join')}</Button>
                <Button  size='sm' variant={'common'} onClick={()=>setShowAddOrganization(false)}>{t('Cancel')}</Button>
            </Flex>
        </>)
    }
    //NAVIGATE CONSTANT
    const navigate = useNavigate()
 

    //SHOW AND HIDE ORGANIZATIONS BOX ON HOVER LOGIC
    const [showOrganizations, setShowOrganizations] = useState<boolean>(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setShowOrganizations(true)
    }
    const handleMouseLeave = () => {timeoutRef.current = setTimeout(() => {setShowOrganizations(false)}, 100)}

    //SHOW JOIN ORGANIZTION BOX
    const [showAddOrganization, setShowAddOrganization] = useState<boolean>(false)

    //BOOLEAN FOR SHOW THE LOADING ICON IN THE BUTTON
    const [waitingNewOrganization, setWaitingOrganization] = useState<boolean>(false)

    //INVITATION CODE, WHEN THERE IS NO ORGANIZATION
    const [firstInvitationCode, setFirstInvitationCode] = useState<string>('')

    //JOIN TO AN ORGANIZATION FUNCTION
    const addOrganization = async ({invitationCode, setInvitationCode}:{invitationCode:string, setInvitationCode:Dispatch<SetStateAction<string>>}) => {
        setInvitationCode('')
        setShowOrganizations(false)
        setWaitingOrganization(true)
        navigate('/conversations')

        const response = await fetchData({endpoint:`user/join/${invitationCode}`, method:'put', auth:auth})

        if (response?.status === 200) {
            const response2 = await fetchData({endpoint:`user`, setValue:setUserInfoApp, auth:auth})
            if (response2?.status === 200){
                const response3 = await fetchData({endpoint:`${response2.data.organizations[response2.data.organizations.length - 1].id}/user`,  auth:auth})
                    
                    if (response3?.status === 200){
                        auth.setAuthData({views:response3.data, organizationId:response2.data.organizations[response2.data.organizations.length - 1].id})
                        setWaitingOrganization(false)
                    }
                    else {setWaitingOrganization(false);showToast({message:t('Join_Failed'), type:'failed'})}
            }
            else {setWaitingOrganization(false);showToast({message:t('Join_Failed'), type:'failed'})}
        }
        else {setWaitingOrganization(false);showToast({message:t('Join_Failed'), type:'failed'})}
    }

    //CHANGE ORGANIZATION LOGIC
    const changeOrganization = async (org:Organization) => {

        localStorage.removeItem('currentView')
        localStorage.removeItem('currentSection')
        localStorage.removeItem('currentSectionTop')
       

        console.log(localStorage)
        localStorage.setItem('currentOrganization', String(org.id))
        console.log(localStorage.getItem('currentOrganization'))

        
        session.dispatch({type:'DELETE_ALL_SESSION'})
        setHeaderSections([])
        const responseOrg = await fetchData({endpoint:`${org.id}/user`, auth})
        if (responseOrg?.status === 200) {
            const viewsToAdd = {
            number_of_conversations_in_bin:responseOrg.data.number_of_conversations_in_bin, 
            private_views:responseOrg.data.private_views, 
            number_of_conversations_per_private_view:responseOrg.data.number_of_conversations_per_private_view,
            shared_views:responseOrg.data.shared_views, 
            number_of_conversations_per_shared_view:responseOrg.data.number_of_conversations_per_shared_view
          }
          auth.setAuthData({views: viewsToAdd, users:responseOrg.data.users, shortcuts:responseOrg.data.shortcuts, conversation_themes:responseOrg.data.conversation_themes, organizationId:org.id, organizationName:org.name})
        }
        navigate('/conversations')
     }

    //FRONT
    return (
        <> 
        {showAddOrganization &&     
        <ConfirmBox setShowBox={setShowAddOrganization}> 
            <JoinOrganizationBox/>
        </ConfirmBox>}

      {auth.authData.organizationId ?
      <Flex zIndex={1000} height='100%'gap='1vw' width={'250px'} justifyContent='end' alignItems='center' borderColor='gray.200' borderBottomWidth='1px' > 
        <Flex  zIndex={1000}  paddingLeft='20px'  onMouseEnter={handleMouseEnter}  onMouseLeave={handleMouseLeave} height={'100%'} alignItems={'center'}> 
            <Text cursor={'pointer'} onClick={() => setShowOrganizations(!showAddOrganization)} _hover={{color:'gray.600'}} whiteSpace={'nowrap'}  mr='2vw' fontWeight='medium'>
                {auth.authData.organizationName}
            </Text>
            <Portal> 
            <AnimatePresence>     
            {showOrganizations && (
                
                <MotionBox initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.9 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                style={{ transformOrigin: 'top' }} position='fixed' bg='white' p='15px' right='2vw' top='50px' boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='gray.300' borderWidth='1px' borderRadius='.5rem' >
                    <Box>
                    <Text fontSize='.9em' fontWeight='medium' whiteSpace='nowrap' mb='1vh'>{t('Organizations')}</Text>
                    {userInfoApp.organizations.length === 0 ? (
                        <Text fontSize='.8em' fontWeight='normal'>{t('NoOrganizations')}</Text>
                    ) : (
                        userInfoApp.organizations.map((org) => (
                        <Flex key={`organization-${org.id}`} cursor={'pointer'} bg={auth.authData.organizationId === org.id ? 'brand.blue_hover':'transparent'} alignItems='center' p='7px' fontSize='.8em' _hover={{ bg:auth.authData.organizationId === org.id ?'brand.blue_hover': 'brand.hover_gray' }} borderRadius='.7rem' onClick={() => changeOrganization(org)}>
                            {org.name}
                        </Flex>
                        ))
                    )}
                    </Box>
                    <Box bg='gray.300' height='1px' width='100%' mb='1vh' mt='2vh' />

                    <Flex justifyContent={'space-between'}gap='10px' alignItems={'center'} p='7px'  fontSize='.9em' borderRadius={'.5rem'} _hover={{bg:'brand.hover_gray', color:'black'}} color='gray.600' cursor='pointer' onClick={() => {setShowOrganizations(false);setShowAddOrganization(true)}}>
                        <Text>{t('AddOrganization')}</Text>
                        <Icon as={FiPlus}/>
                    </Flex>
                    {isAdmin && <Flex justifyContent={'space-between'}gap='10px' alignItems={'center'} p='7px'  fontSize='.9em' borderRadius={'.5rem'} _hover={{bg:'brand.hover_gray', color:'black'}} color='gray.600' cursor='pointer' onClick={() => {setShowOrganizations(false);navigate('/settings/organization/data')}}>
                        <Text>{t('SeeOrganization')}</Text>
                        <Icon as={BiSolidBuildings}/>
                    </Flex>}
                </MotionBox>
            )}
            </AnimatePresence>
            </Portal>
        </Flex>
      </Flex>: 
      
        <Flex width='100vw' bg='gray.100' height='100vh' alignItems={'center'} justifyContent={'center'}>
            <Box maxW={'650px'} rounded={'lg'} bg='white' boxShadow={'lg'} p={8} >
                <Text fontWeight='medium' fontSize={'1.2em'}>{t('NoOrganizationUser')}</Text>
                <Text fontWeight='medium' fontSize={'1em'} mt='2vh' mb='.5vh'>{t('GetInvitationCode')}</Text>
                <EditText value={firstInvitationCode} setValue={setFirstInvitationCode} placeholder='xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxx' hideInput={false}/>
                <Button variant={'main'} size='sm' leftIcon={waitingNewOrganization?<></>:<FaPlus />} mt='2vh' isDisabled={firstInvitationCode === ''} width='100%' onClick={() => addOrganization({invitationCode:firstInvitationCode, setInvitationCode:setFirstInvitationCode})}>{waitingNewOrganization?<LoadingIconButton/>:t('Join')}</Button>
            </Box>
            <Button onClick={() => auth.signOut()} position='fixed' bottom='2vh' left='2vh' size='sm' variant={'main'} leftIcon={<TbArrowBack/>}>{t('Return')}</Button>
        </Flex>}
        </>
    )
}
  
