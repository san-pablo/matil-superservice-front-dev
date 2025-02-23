/* 
    MAIN COMPONENT. CONTAINS THE HEADER, THE SIDEBAR AND THEIR FUNCTIONALITITES
*/

//REACT
import { useRef, useState, useEffect, Suspense, lazy, useMemo } from 'react'
import { Routes, Route, useNavigate } from "react-router-dom"
import { useAuth } from '../AuthContext'
import { useTranslation } from 'react-i18next'
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import io from 'socket.io-client' 
//FRONT
import { Flex, Box } from '@chakra-ui/react'
import './Components/styles.css'
//COMPONENTS
import LoadingIcon from './Components/Once/LoadingIcon'
import showToast from './Components/Reusable/ToastNotification'
import CallWidget from './Components/Once/CallWidget'
import SearchSection from './Components/Reusable/SearchSection'
import SideBar from './SideBar'
 
//TYPING 
import { searchSectionType } from './Constants/typing'
//MAIN SECTIONS
const Business = lazy(() => import('./Sections/Contacts/Business'))

const Flow = lazy(() => import('./Sections/Functions/Flow'))
const Report = lazy(() => import('./Sections/Stats/Report'))
const Source = lazy(() => import('./Sections/Knowledge/Source'))
const HelpCenters = lazy(() => import('./Sections/ExtraSections/HelpCenters/HelpCenters'))
const Tilda = lazy(() => import('./Sections/ExtraSections/Tilda/Tilda'))
const Onboarding = lazy(() => import('./Onboarding'))
const HelpCenter = lazy(() => import('./Sections/ExtraSections/HelpCenters/HelpCenter'))
const TildaConfig = lazy(() => import('./Sections/ExtraSections/Tilda/TildaConfig'))
const Chatbot = lazy(() => import('./Sections/ExtraSections/Channels/Chatbot'))
const Google = lazy(() => import('./Sections/ExtraSections/Channels/Google'))
const Instagram = lazy(() => import('./Sections/ExtraSections/Channels/Instagram'))
const Mail = lazy(() => import('./Sections/ExtraSections/Channels/Mail'))
const Phone = lazy(() => import('./Sections/ExtraSections/Channels/Phone'))
const Voip = lazy(() => import('./Sections/ExtraSections/Channels/Voip'))
const Whatsapp = lazy(() => import('./Sections/ExtraSections/Channels/Chatbot'))



const Channels = lazy(() => import('./Sections/ExtraSections/Channels/AllChannels'))
const NotFound = lazy(() => import('./Components/Once/NotFound'))
const GeneralViewSection  = lazy(() => import('./GeneralViewSection'))

//MAIN FUNCTION
function Content () {
 
    //SOCKET
    const URL = import.meta.env.VITE_PUBLIC_API_URL
    const VERSION = import.meta.env.VITE_VERSION

    const socket = useRef<any>(null)
 
    //TRANSLATION
    const { t } = useTranslation('main')
    const { logout, getAccessTokenSilently } = useAuth0()

    //IMPORTANT REACT CONSTANTS
    const auth = useAuth()
    const navigate = useNavigate()
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)

       if (location.pathname !== '/')localStorage.setItem('lastView', location.pathname + `?${searchParams}`)
    },[location.pathname, location.search])

    //SEARCH SECTION
    const [searchSection, setSearchSection] = useState<searchSectionType>(null)

    //RESIZE SIDEBAR LOGIC
    const [sideBarWidth, setSideBarWidth] = useState<number>(localStorage.getItem('sideBarWidth') ? parseInt(localStorage.getItem('sideBarWidth')) : 200)
    useEffect(() => {localStorage.setItem('sideBarWidth', String(sideBarWidth))},[sideBarWidth])
    
    const [isResizing, setIsResizing] = useState(false);
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsResizing(true);
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    }
    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing) return;
        const newWidth = Math.max(200, Math.min(400, e.clientX)); // Limitamos entre 150px y 400px
        setSideBarWidth(newWidth);
    }
    const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    }
    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        } else {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isResizing])
    

 
    const updateContext = (type:'') => {
        const userContextData = auth.authData

    }
    //INITIALIZE SOCKET AND NOTIFICATIONS
    useEffect(() => {
        let pingInterval:any;

        const initializeSocket = async () => {
            try {
                if (Notification.permission !== "granted") {
                    await Notification.requestPermission();
                }

                // Obtener accessToken según la versión
                // Inicializar socket
                socket.current = io("https://api.matil.ai/platform", {
                    path: URL.endsWith("v2/") ? "/v2/socket.io/" : "/v1/socket.io/",
                    transports: ["websocket"],
                    query: {
                        access_token: auth.authData.accessToken,
                        organization_id: auth.authData.organizationId,
                    },
                });

                // REGISTRAR EVENTOS SOLO DESPUÉS DE QUE EL SOCKET ESTÉ LISTO
                socket.current.on("connect", () => {
                    console.log("Connected to WebSocket");
                })

                socket.current.on("conversation", (data:any) => {
                    if (data?.is_new) {
                        showToast({
                            message: t("NewConversationCreated", {
                                id: data.new_data.local_id,
                            }),
                            type: "conversation",
                            id: data.new_data.id,
                            linkPath: true,
                            navigate,
                            isDesktop: true,
                        });
                    }
                });

                socket.current.on("conversation_messages", (data:any) => {
                    if (data?.local_id && data?.conversation_id && data.sender_type === 0) {
                        showToast({
                            message: t("SendedMessage", { id: data.local_id }),
                            type: "message",
                            id: data.conversation_id,
                            linkPath: true,
                            navigate,
                            isDesktop: true,
                        });
                    }
                })

                // Enviar ping cada 120 segundos
                pingInterval = setInterval(() => {
                    if (socket.current) {
                        socket.current.emit("ping", {});
                    }
                }, 120000);
            } catch (error) {
                console.error("Error initializing socket:", error);
            }
        };

        initializeSocket();

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
            clearInterval(pingInterval);
        };
    }, [auth.authData.organizationId, getAccessTokenSilently]);

    //MEMOIZED CALL WIDGET
    const memoizedCallWidget = useMemo(() => <CallWidget />, [])

    useEffect(() => {
        const handleKeyDown = (event:KeyboardEvent) => {
            if ((event.shiftKey  || event.metaKey || event.ctrlKey) && (event.key === 'K' ||event.key === 'k' )) setSearchSection('navigate')}
        window.addEventListener('keydown', handleKeyDown)
        return () => {window.removeEventListener('keydown', handleKeyDown)}
    },[])

    //DISPLAY NO ORGAINZATION VIEW IF THERE IS NO ORGANIZATIONS
    if (!auth.authData.organizationId) return (<Onboarding/>)

    const memoizedSearchSection = useMemo(() => (<SearchSection selectedSection={searchSection} setSearchSection={setSearchSection}/>), [searchSection])

    //FRONT 
    return(<> 

        {searchSection && memoizedSearchSection}
     
 

            <Flex width={'100vw'} bg='clear_white' userSelect={isResizing ? 'none':'auto'} height={'100vh'} overflow={'hidden'}> 

                {memoizedCallWidget}
            
                {/*SIDEBAR*/}
                <Flex flexDir='column' pos='relative' h='100vh'  userSelect={'none'} alignItems='center'  justifyContent='space-between' height={'100vh'} width={sideBarWidth} bg='hover_gray' >
                    <SideBar setSearchSection={setSearchSection}/>
                    <Box position="absolute" right="0" top="0" height="100vh" width="3px" cursor="ew-resize" transition={'background-color .2s ease-in-out'} bg={isResizing ? 'border_color':"transparent"} _hover={{ bg: "border_color" }} onMouseDown={handleMouseDown}/>
                </Flex>

                {/*CONTENT OF THE SECTIONS*/}
                <Flex flexDir='column' height={'100vh'}width={`calc(100vw - ${sideBarWidth}px)`}  bg='clear_white' >
                    {!auth.authData.views ? 
                        <LoadingIcon/>
                    :
                    <Suspense fallback={<></>}>    
                        <Routes>
                            <Route path="/onboarding" element={<Onboarding/>}/>

                            <Route path="/view/*" element={<GeneralViewSection sideBarWidth={sideBarWidth} socket={socket}  setSearchSection={setSearchSection}/>}/>
                            <Route path="/functions/*" element={<Flow  flowId={location.pathname.split('/')[2]} sideBarWidth={sideBarWidth} sectionsPath={[]} sectionsPathMap={{}}/>}/>
                            <Route path="/reports/*" element={<Report reportId={location.pathname.split('/')[2]} sideBarWidth={sideBarWidth} sectionsPath={[]} sectionsPathMap={{}}/>}/>
                            <Route path="/sources/*" element={<Source sourceId={location.pathname.split('/')[2]} sideBarWidth={sideBarWidth} sectionsPath={[]} sectionsPathMap={{}}/>}/>                            
                            <Route path="/businesses/*" element={<Business sideBarWidth={sideBarWidth} businessId={location.pathname.split('/')[2]} socket={socket}  sectionsPath={[]} sectionsPathMap={{}} selectedView={null}/>}/>

                            <Route path="/help-centers/*" element={<HelpCenters/>}/>
                            <Route path="/channels/*" element={<Channels/>}/>
                            <Route path="/tilda/*" element={<Tilda/>}/>

                            <Route path="/help-center/*" element={<HelpCenter/>}/>
                            <Route path="/tilda-config/*" element={<TildaConfig/>}/>

                            <Route path="/channel/webchat/*" element={<Chatbot/>}/>
                            <Route path="/channel/whastapp/*" element={<Whatsapp/>}/>
                            <Route path="/channel/email/*" element={<Mail/>}/>
                            <Route path="/channel/instagram/*" element={<Instagram/>}/>
                            <Route path="/channel/google-business/*" element={<Google/>}/>
                            <Route path="/channel/phone/*" element={<Phone/>}/>
                            <Route path="/channel/voip/*" element={<Voip/>}/>
                            
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>}
                </Flex>
    
            </Flex>:
            <Flex height={'100vh'} bg='clear_white' width={'100vw'} justifyContent={'center'} alignItems={'center'}> 
                <LoadingIcon/>
            </Flex>
    </>)
}

export default Content

 
 

 