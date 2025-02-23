import { useState, useRef, useMemo,  Dispatch, SetStateAction, useEffect, CSSProperties, lazy, Suspense } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { useAuth } from "../AuthContext"
import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"
//FETCH DATA
import fetchData from "./API/fetchData"
import { v7 as uuidv7 } from 'uuid'
//FRONT
import { Flex, Box, Text, Icon, Button, chakra, shouldForwardProp, Skeleton,Image, Switch, Portal, Grid, VStack } from "@chakra-ui/react"
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion' 
import { Tree, getBackendOptions, MultiBackend,} from "@minoru/react-dnd-treeview"
import { DndProvider } from "react-dnd"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import './Components/styles.css'
//COMPONENTS
import ConfirmBox from "./Components/Reusable/ConfirmBox"
import LoadingIconButton from "./Components/Reusable/LoadingIconButton"
import EditText from "./Components/Reusable/EditText"
import ShortCutsList from './Components/Once/ShortCutsList'
import SendFeedBack from './Components/Once/SendFeedback'
import ColorModeSelector from "./Components/Once/ColorModeSelector"
import AddView from "./Components/Reusable/AddView"
import ActionsBox from "./Components/Reusable/ActionsBox"
import RenderIcon from "./Components/Reusable/RenderIcon"
import SearchSection from "./Components/Reusable/SearchSection"
//FUNCTIONS
import useOutsideClick from "./Functions/clickOutside"
import showToast from "./Components/Reusable/ToastNotification"
import determineBoxStyle from "./Functions/determineBoxStyle"
import useEnterListener from "./Functions/clickEnter"
//ICONS
import { IconType } from 'react-icons'
import { IoFileTrayFull, IoPeopleSharp, IoBook } from "react-icons/io5" 
import { BsBarChartFill, BsStars ,BsThreeDots,  BsFillTelephoneInboundFill, BsFillTelephoneMinusFill, BsFillTelephoneXFill, BsFillLayersFill } from "react-icons/bs"
import { FaPlus, FaArrowRightToBracket, FaCheck, FaMagnifyingGlass, FaGear, FaBookBookmark, FaArrowUp, FaLock, FaFileLines, FaRobot } from "react-icons/fa6"
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io"
import { BiSolidBuildings, BiWorld } from 'react-icons/bi'
import { FiArrowUpRight, FiFolder, FiLayout, FiCopy, FiEdit, FiTrash2  } from "react-icons/fi"
import { HiChatAlt2, HiTrash } from "react-icons/hi"
//TYPING
import { sectionsType, sectionPathType, searchSectionType, ViewDefinitionType } from "./Constants/typing"
import IconsPicker from "./Components/Reusable/IconsPicker"
import { FaEye } from "react-icons/fa"
import parseMessageToBold from "./Functions/parseToBold"
 
//SECTIONS
const Settings = lazy(() => import('./Sections/Settings/Settings'))

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})
interface FolderType {
    type:'folder'
    name:string 
    icon: {type:'emoji' | 'icon' | 'image', data:string}
    model:sectionsType
}
interface AccessType {
    type:'access'
    name:string 
    icon: {type:'emoji' | 'icon' | 'image', data:string}
    structure:sectionsType
    source_id:string
    model:sectionsType
}
interface ViewType {
    type:'view'
    view_id:string 
    model:sectionsType
}
interface SideBarType  {
    parent:string
    text:string
    droppable:boolean
    id:string
    data: FolderType | AccessType | ViewType
}

 

//USER CONFIGS BOX
const UserBox = () => {

    //CONSTANTS
    const navigate = useNavigate()
    const { logout, getAccessTokenSilently } = useAuth0()
    const { t } = useTranslation('main')
    const auth = useAuth()
    const userInfo = auth.authData.userData

    //SHOW AND HIDE LOGOUT ON HOVER LOGIC
    const [showLogout, setShowLogout] = useState(false)
    const userRef = useRef<HTMLDivElement>(null)
    const userBoxRef = useRef<HTMLDivElement>(null)

    useOutsideClick({ref1:userRef, ref2:userBoxRef, onOutsideClick:setShowLogout})
  
    //CHANGE USER STATUS
    const [userStatus, setUserStatus] = useState<string>('connected')
     
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

 

    //ACTIVE INVVITATIONS COMPONETE
    const InvitationsComponent = () => {

        //CONTROL ORGANIZATION VISIBILITY
        const organizationButtonRef = useRef<HTMLDivElement>(null)
        const organizationBoxRef = useRef<HTMLDivElement>(null)
        const [showInvitations, setShowInvitations] = useState<boolean>(false)
        useOutsideClick({ref1:organizationButtonRef, ref2:organizationBoxRef, onOutsideClick:setShowInvitations})

        //CURRENT INVITATIONS BOX
        const InvitationsBox = () => {

            const InviteItem = ({inv}:{inv:any}) => {

                const [waitingAccept, setWaitingAccept] = useState<boolean>(false)
                const [waitingDelete, setWaitingDelete] = useState<boolean>(false)
    
                const inviteAction = async (id:string, type:'accept' | 'reject') => {
                    if (type === 'accept') {
                        const response = await fetchData({endpoint: `user/invitations/${id}`, method:'post', setWaiting:setWaitingAccept, getAccessTokenSilently, auth, toastMessages:{works:t('CorrectInvitation'), failed:t('FailedInvitation')} })
                        if (response?.status === 200) {
                            auth.setAuthData({userData:{...auth.authData.userData, organizations:[...auth.authData.userData.organizations, {id, name:inv.organization_name}], invitations:auth.authData.userData.invitations.filter((invite:any) => invite.id !== id)}})
                        }
                    }
                    else {
                        const response = await fetchData({endpoint: `user/invitations/${id}`, method:'delete', setWaiting:setWaitingDelete, getAccessTokenSilently, auth })
                        if (response?.status === 200) auth.setAuthData({userData:{...auth.authData.userData, invitations:auth.authData.userData.invitations.filter((invite:any) => invite.id !== id)}})
                    }
                 }
                 return (
                    <Box mt='2vh' fontSize={'.9em'} p='10px' key={`organization-${inv.id}`} borderColor={'border_color'} borderWidth={'1px'} alignItems={'center'}  position={'relative'} gap='7px' justifyContent={'space-between'}  cursor={'pointer'} borderRadius={'.5rem'}>                       
                        <Text whiteSpace={'nowrap'} fontWeight={'medium'} fontSize={'1.2em'}> {inv.organization_name}</Text>
                        <Text whiteSpace={'nowrap'} color={'text_gray'}>{parseMessageToBold(t('SelectedRol', {role:inv.role_name}))}</Text>
                        <Flex mt={'2vh'} gap='7px' flexDir={'row-reverse'}>
                            <Button size='xs' fontSize={'.9em'} variant={'main'} onClick={() => {inviteAction(inv.id, 'accept')}}>{waitingAccept ? <LoadingIconButton/>:t('Accept')}</Button>
                            <Button size='xs'fontSize={'.9em'} variant={'delete'} onClick={() => {inviteAction(inv.id, 'reject')}}>{waitingDelete ? <LoadingIconButton/>:t('Reject')}</Button>
                        </Flex>
                    </Box>
                 )

            }
          
            return(<> 
             
                <Box p='20px' minW={'400px'}>
                    <Text fontWeight={'medium'} fontSize={'1.4em'} mb='1vh'>{t('PendingInvitations')}</Text>
                    <Box maxH={'50vh'} overflow={'scroll'}> 
                    {auth.authData.userData.invitations.map((inv:any, index:number) => (
                        <InviteItem key={`invitation-${index}`} inv={inv}/>
                    ))}
                    </Box>
                       
                </Box>
              
            </>)
        }
        const memoizedInvitations = useMemo(() => (
            <ConfirmBox setShowBox={setShowInvitations} upPosition> 
                <InvitationsBox/>
            </ConfirmBox>
        ), [showInvitations])


        return ( 
        <Box position={'relative'} > 
            <Flex alignItems={'center'} ref={organizationButtonRef} position={'relative'} gap='7px' onClick={() => {setShowInvitations(true);}} _hover={{bg:'gray_2'}}  cursor={'pointer'} borderRadius={'.5rem'} p='5px'>                       
                <Icon as={FaEye} color='text_gray'/>
                <Text fontSize='.9em' whiteSpace='nowrap' fontWeight={'medium'}>{ t('InvitationsCount', {count:auth.authData.userData.invitations.length})}</Text>
            </Flex>
                <AnimatePresence> 
                    {showInvitations && memoizedInvitations}
                </AnimatePresence>
        </Box>

        )
    }
 

    const memoizedOrganizationComponent = useMemo(() => (<OrganizationComponent/>),[auth.authData.organizationId])
    const memoizedInvitationsComponent = useMemo(() => (<InvitationsComponent/>),[])

    //FRONT
    return (<> 

        {showShortcuts && memoizedShortcutsBox}
        {showFeedback && memoizedFeedbackBox}

        <Flex flexDir='column' position='relative' >
           
            <Flex ref={userRef} alignItems={'center'} onClick={() => setShowLogout(true)} position={'relative'} gap='7px'  _hover={{bg:'gray_2'}}  cursor={'pointer'} borderRadius={'.5rem'} p='5px'>

                <Flex gap='7px' alignItems={'center'}> 
                    <Box position={'relative'}> 
                        <Flex bg='gray_1' w='18px' h='18px' alignItems={'center'} justifyContent={'center'} borderRadius={'.3rem'} p='5px'>
                            <Text fontWeight={'semibold'} color='text_gray' fontSize={'.9em'}>{userInfo?.name[0]}</Text>
                        </Flex>
                         <Box pos='absolute' bg='green' h='6px' w='6px' zIndex={100} top={'-2px'} right={'-2px'} borderRadius={'full'}/>
                     </Box>
                    <Text fontWeight={'medium'} fontSize={'.9em'}>{userInfo.name + ' ' + userInfo.surname}</Text>
                    
                    <Box color='text_gray'> 
                        <IoIosArrowDown   size={'12px'} className={"rotate-icon-up" }/>
                    </Box>
                </Flex>

            </Flex>
            <AnimatePresence> 
                {showLogout && (
                <MotionBox ref={userBoxRef}  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                    style={{ transformOrigin: 'top left' }}  minW='190px'  position='absolute' bg='white'  left='0' top='30px' zIndex={10} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='border_color' borderWidth='1px' borderRadius='.5rem'>
                    
                    <Flex gap='10px' alignItems={'center'}  p='7px'> 
                        <Flex bg='gray_1' w='25px' h='25px' alignItems={'center'} justifyContent={'center'} borderRadius={'.3rem'} p='5px'>
                            <Text fontWeight={'semibold'} color='text_gray' fontSize={'1.1em'}>{userInfo?.name[0]}</Text>
                        </Flex>
                        <Box >
                            <Text fontSize='.9em' fontWeight='medium' whiteSpace='nowrap'>{userInfo.name + ' ' + userInfo.surname}</Text>
                            <Text fontSize='.7em' color='text_gray' whiteSpace='nowrap'>{auth.authData.email}</Text>
                        </Box>
                    </Flex>

                    <Box bg='border_color' height='1px' width='100%' mb='7px' mt='7px' />

                    <Box px='7px'> 
                        <Flex alignItems={'center'}  position={'relative'} gap='7px' justifyContent={'space-between'} onClick={() => setUserStatus(prev => prev === 'out' ? 'connected':'out')} _hover={{bg:'gray_2'}}  cursor={'pointer'} borderRadius={'.5rem'} p='5px'>                       
                            <Text  fontSize={'.9em'}>{t('ModeStatus')}</Text>
                            <Switch size='sm' checked={userStatus === 'out'}   />
                        </Flex>
                    </Box>
                    <Box bg='border_color' height='1px' width='100%' mb='7px' mt='7px' />
                    <Box px='7px'> 
                        <ColorModeSelector/>
                    </Box>
                    <Box bg='border_color' height='1px' width='100%' mb='7px' mt='7px' />

                    <Box px='7px'> 
                        {memoizedOrganizationComponent}
                    </Box>
                    
                    {(auth.authData.userData?.invitations || []).length > 0 && <>
                        <Box bg='border_color' height='1px' width='100%' mb='7px' mt='7px' />
                        <Box px='7px'> 
                            {memoizedInvitationsComponent}
                        </Box>
                    </>}


                    <Box bg='border_color' height='1px' width='100%' mb='7px' mt='7px' />

                    <Box px='7px' pb='7px'> 
                        <Flex alignItems={'center'} color='red'  position={'relative'} gap='7px' justifyContent={'space-between'} onClick={() =>{logout({ logoutParams: { returnTo: window.location.origin } });auth.signOut()}} _hover={{bg:'red.100'}}  cursor={'pointer'} borderRadius={'.5rem'} p='5px'>                       
                            <Text fontSize='.9em' whiteSpace='nowrap'>{t('SignOut')}</Text>
                            <Icon boxSize={'12px'} as={FaArrowRightToBracket} />
                        </Flex>
                    </Box>
                </MotionBox>
                )}
            </AnimatePresence>
        </Flex>
        </>)
}
 
const mainSections:sectionsType[] = ['conversations', 'persons', 'businesses', 'functions', 'reports', 'sources']

//ORGANIZATION BOX
const OrganizationComponent = () => {

    const { logout, getAccessTokenSilently } = useAuth0()
    const { t } = useTranslation('main')
    const auth = useAuth()
    const navigate = useNavigate()
 
    //JOIN TO AN ORGANIZATION FUNCTION
    const addOrganization = async ({invitationCode, setInvitationCode}:{invitationCode:string, setInvitationCode:Dispatch<SetStateAction<string>>}) => {
        setInvitationCode('')
        const response = await fetchData({endpoint:`user/join/${invitationCode}`, method:'put', getAccessTokenSilently, auth:auth})
        if (response?.status === 200) {
            const response2 = await fetchData({endpoint:`user`,  getAccessTokenSilently, auth:auth})
            if (response2?.status === 200){
                changeOrganization(response2.data.organizations[response2.data.organizations.length - 1])
            }
            else {showToast({message:t('Join_Failed'), type:'failed'})}
        }
        else {showToast({message:t('Join_Failed'), type:'failed'})}
    }

    //CHANGE ORGANIZATION LOGIC
    const changeOrganization = async (org:any) => {

        localStorage.removeItem('lastView')
        localStorage.removeItem('lastSettingsSection')
        localStorage.removeItem('recentSearches')
        localStorage.setItem('currentOrganization', String(org.id))
        const responseOrg = await fetchData({endpoint:`${org.id}/user_access`, auth, getAccessTokenSilently}) 
        if (responseOrg?.status === 200){
            auth.setAuthData({views:null})
            auth.setAuthData({ organizationId: org.id,organizationName:org.name, users:responseOrg.data, views:null})
            auth.setAuthData({...responseOrg.data})
        }
        navigate(-1)
    }

    //CONTROL ORGANIZATION VISIBILITY
    const organizationButtonRef = useRef<HTMLDivElement>(null)
    const organizationBoxRef = useRef<HTMLDivElement>(null)
    const [showOrganization, setShowOrganizations] = useState<boolean>(false)
    useOutsideClick({ref1:organizationButtonRef, ref2:organizationBoxRef, onOutsideClick:setShowOrganizations})

    const OrganizationsBox = () => {   

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
                    <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='border_color'/>
                    <Text mt='2vh' mb='.5vh' fontSize='.9em' fontWeight='medium' whiteSpace='nowrap'>{t('GetInvitationCode')}</Text>
                    <EditText value={invitationCode} setValue={setInvitationCode} hideInput={false} size='sm' placeholder='xxxx-xxxx-xxxx-xxxx' />
                </Box>
                <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'border_color'}>
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
                <Text fontSize='.9em' mb='1vh' fontWeight='medium' whiteSpace='nowrap'>{t('Organizations')}</Text>

                {auth.authData.userData.organizations.length === 0 ? (
                    <Text fontSize='.8em' fontWeight='normal'>{t('NoOrganizations')}</Text>
                ) : (
                    auth.authData.userData.organizations.map((org:any) => (
                        <Flex fontSize={'.9em'} key={`organization-${org.id}`} alignItems={'center'}  position={'relative'} gap='7px' justifyContent={'space-between'}  onClick={() => {if (org.id !== auth.authData.organizationId) {changeOrganization(org)} }} _hover={{bg:'gray_2'}}  cursor={'pointer'} borderRadius={'.5rem'} p='5px'>                       
                        {org.name}
                        {auth.authData.organizationId === org.id && <Icon as={FaCheck} color='text_blue'/>}
                    </Flex>
                    ))
                )}
            </Box>
            <Box bg='border_color' height='1px' width='100%' mb='1vh' mt='1vh' />

            <Flex fontSize={'.9em'} color='text_gray'  alignItems={'center'}  position={'relative'} gap='7px'  onClick={() => navigate('/onboarding')} _hover={{bg:'gray_2'}}  cursor={'pointer'} borderRadius={'.5rem'} p='5px'>                       
                <Icon as={FaPlus}/>
                <Text whiteSpace={'nowrap'}>{t('CreateOrganization')}</Text>
                </Flex>
            
                <Flex fontSize={'.9em'} color='text_gray'  alignItems={'center'}  position={'relative'} gap='7px'  onClick={() => {setShowOrganizations(false);setShowAddOrganization(true)}} _hover={{bg:'gray_2'}}  cursor={'pointer'} borderRadius={'.5rem'} p='5px'>                       
                <Icon as={FaPlus}/>
                <Text whiteSpace={'nowrap'}>{t('AddOrganization')}</Text>
                </Flex>
            
        </>)
    }

    return ( 
    <Box position={'relative'} > 
    <Flex alignItems={'center'} ref={organizationButtonRef} position={'relative'} gap='7px'  onClick={() => setShowOrganizations(true)} _hover={{bg:'gray_2'}}  cursor={'pointer'} borderRadius={'.5rem'} p='5px'>                       
        <Flex bg='gray_1' w='18px' h='18px' alignItems={'center'} justifyContent={'center'} borderRadius={'.3rem'} p='5px'>
            <Text fontWeight={'semibold'} color='text_gray' fontSize={'.9em'}>{auth.authData.organizationName[0]}</Text>
        </Flex>
        <Text fontSize='.9em' whiteSpace='nowrap'>{auth.authData.organizationName}</Text>
    </Flex>
        <AnimatePresence> 
            {showOrganization && 
            <MotionBox ref={organizationBoxRef} initial={{ opacity: 0, left:-30}} animate={{ opacity: 1, left: -20 }}  exit={{ opacity: 0, left: -30}} transition={{ duration: '0.2', ease: 'easeOut'}} 
            overflow={'hidden'} p='15px' ml={'calc(100% + 30px)'} top={0} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={1000}   position={'absolute'} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'border_color'}>
                <OrganizationsBox/>
            </MotionBox>}
        </AnimatePresence>
    </Box>

    )
}

//MAKE THE PATH OF A GIVEN NODE
const findPathToItem = (itemId: string, sideBarData: SideBarType[], mainSections: string[]): sectionPathType=> {
    let path = [];
    let currentItem = sideBarData.find(item => item.id === itemId)

    while (currentItem) {
        if (mainSections.includes(currentItem.id)) {
            path.unshift({ id: currentItem.id });
            break
        }
        if (currentItem.data.type === 'folder') {
            path.unshift({ id: currentItem.id, name: currentItem.data.name, icon: currentItem.data.icon });
        }
        currentItem = sideBarData.find(item => item.id === currentItem.parent);
    }

    return path
}

const openedSec:{model:sectionsType, expanded:true}[] = [{model:'conversations', expanded:true}, {model:'persons', expanded:true},{model:'businesses', expanded:true},{model:'functions', expanded:true}, {model:'sources', expanded:true},{model:'reports', expanded:true}]

//MAIN SIDEBAR SECTION
const SideBar = ({setSearchSection}:{setSearchSection:Dispatch<SetStateAction<searchSectionType>>}) => {

    //CONSTANTS
    const { t } = useTranslation('main')
    const auth = useAuth()
    const navigate = useNavigate()
    const { getAccessTokenSilently } = useAuth0()
    const sectionsMap:{[key in sectionsType]:[string, IconType]} = {conversations: [t('Conversations'), IoFileTrayFull], persons: [t('Contacts'), IoPeopleSharp], 'businesses':[t('ContactBusinesses'), BiSolidBuildings], 'reports':[ t('Stats'), BsBarChartFill], 'functions':[t('Flows'), BsStars],'sources':[t('Knowledge'), BsFillLayersFill]}
    const [searchParams] = useSearchParams()
    const viewParam = searchParams.get('view')
 
    const isDraggable = useRef<boolean>(false)
    //LAYOUT DATA
    const [openedSections, setOpenedSections] = useState<{model:sectionsType, expanded:true}[]>(openedSec)
    const initialOpenedRef = useRef<string[]>([])
    const [sideBarData, setSideBarData] = useState<{[key in sectionsType]:any[]} | null>(null)
    const [extraDataMap, setExtraDataMap] = useState<Record<string, any>>({})

    //SHOW SETTINGS
    const [showSettings, setShowSettings] = useState<boolean>(false)
    
    //BORDER COLORS ON SCROLL LOGIC
    const boxRef = useRef(null)
    const [hasScrolledTop, setHasScrolledTop] = useState(false)
    const [hasScrolledBottom, setHasScrolledBottom] = useState(false)

    useEffect(() => {
      const handleScroll = () => {
      
        if (boxRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = boxRef.current;  
          setHasScrolledTop(scrollTop > window.innerHeight * 0.01);
          setHasScrolledBottom(scrollTop + clientHeight < scrollHeight -  window.innerHeight * 0.01)
        }
      }
  
      const box = boxRef.current;
      box?.addEventListener("scroll", handleScroll);
      handleScroll()
  
      return () => box?.removeEventListener("scroll", handleScroll);
    }, [])

    //CONVERT LAYOUT STRUCTURE TO RENDER ON FRONT
    const transformSidebarData = async (data: any[]) => {

        //ITERAR SOBRE TODA LA LISTA PARA OBTENER EL MAP Y EXTRAER LA POSICIÓN DE LAS SECCIONES PRINCIPALES
         const initalOpened:string[] = []

        const groupedIds:any = {'reports':[], functions:[], sources:[], views:[]}

        const sideBarDict:{[key in sectionsType]:any[]} = {conversations:[], persons:[], businesses:[], reports:[], functions:[], sources:[]}

        //PARSE THE DATA
        data.forEach(item => {
            
            if (item.data?.is_expanded) initalOpened.push(item.id)
            let transformedItem: SideBarType = {
                id: item.id,
                parent:item?.parent_id || 0 ,
                text:item.id,
                droppable: item.type === 'folder' || mainSections.includes(item.id),
                data: {} as FolderType | AccessType | ViewType,
            }
    
            if (item.type === 'folder') transformedItem.data = {type: 'folder', model:item.model,name: item.data.name, icon: item.data.icon || { type: 'icon', value: '📁'}}
            else if (item.type === 'access') {
                transformedItem.data = {type: 'access', model:item.model, name: item.data.name, icon: item.data.icon || { type: 'icon', value: '🔗' }, structure: item.data.structure, source_id:item.data.source_id }
                if ((['functions', 'reports', 'sources'] as any).includes(item.data.structure)) groupedIds[item.data.structure].push(item.data.source_id )
            }
            else if (item.type === 'view') transformedItem.data = {model:item.model, view_id:item.data.view_id, type: 'view'};
    
            (sideBarDict as any)[item.model].push(transformedItem)
        })
        initialOpenedRef.current = initalOpened

  
        //LLAMAR A LA API Y OBTENER LOS DATOS NECESARIOS
         const fetchPromises = Object.entries(groupedIds).filter(([_, ids]) => (ids as string[]).length > 0)
            .map(([structure, ids]) => 
            
            fetchData({endpoint: `${auth.authData.organizationId}/${structure}`, getAccessTokenSilently, auth, params: {page_index: 1, filters: {logic: 'AND', groups: { logic: 'AND', conditions: [{ col: 'id', op: 'eq', val: ids }]}}
                }
            }).then(res => ({ structure, data: res.data })))

        const resolvedData = await Promise.all(fetchPromises);
        const newExtraDataMap = resolvedData.reduce((acc, { structure, data }) => {
            data.forEach((item:any) => { acc[item.uuid] = item; });
            return acc;
        }, {} as Record<string, any>)
 
        setExtraDataMap(prev => ({ ...prev, ...newExtraDataMap }))

 
        return sideBarDict
    }
    
    //FETCH AND CONVERT DATA
    useEffect(() => {
        setSideBarData(null)
        const fetchSideBar = async () => {
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/user_access/layout`, getAccessTokenSilently, auth })
            const responseViews = await fetchData({endpoint: `${auth.authData.organizationId}/views`, getAccessTokenSilently, auth })

            if (response?.status === 200 && responseViews.status === 200) {

                auth.setAuthData({views:responseViews.data})
                const currentSection = localStorage.getItem('lastView')
                if (currentSection) navigate(currentSection)
                
                else {
                    const firstItem = response.data.layout.find((item:any) => item.type !== 'folder')

                    if (firstItem.type === 'view') navigate(`/view/${firstItem.data.view_id}?view=${firstItem.id}`)
                    else if (firstItem.type === 'access') navigate(`/${firstItem.data.type}/${firstItem.data.source_id}?view=${firstItem.id}`)
                }
            
                const transformedData = await transformSidebarData(response.data.layout)
                setSideBarData(transformedData)
            
            }
          
        }
        fetchSideBar()
    },[auth.authData.organizationId])


    //EDIT SIDEBAR ITEMS
    const handleEditSidebar = (action: 'delete' | 'rename' | 'duplicate' | 'create' , itemId: string, newDefinition?:any ) => {
      

        setSideBarData(prevData => {
            let foundModel: sectionsType | null = null
            let updatedModelList: any[] = []
    
            Object.keys(prevData).forEach((key) => {
                const sectionKey = key as sectionsType
                const items = prevData[sectionKey]
                if (items.some(item => item.id === itemId)) {
                    foundModel = sectionKey
                    updatedModelList = [...items]
                }
            })
    
            if (!foundModel) return prevData

            if (action === 'delete') {
                fetchData({endpoint: `${auth.authData.organizationId}/user_access/layout/${itemId}`, method:'delete',  getAccessTokenSilently, auth })
                updatedModelList = updatedModelList.filter(item => item.id !== itemId);
            }
            
            else if (action === 'rename' && newDefinition) {
                updatedModelList = updatedModelList.map(item => {
                    if (item.id === itemId) {
                        fetchData({endpoint: `${auth.authData.organizationId}/user_access/layout/${itemId}`, method:'put',  requestForm:{ ...item.data, icon: newDefinition.icon, name: newDefinition.name }, getAccessTokenSilently, auth })
                        return { ...item, text: newDefinition.name, data: { ...item.data, icon: newDefinition.icon, name: newDefinition.name } }
                    }
                    return item
                })
            }
    
            else if (action === 'duplicate') {
                const itemIndex = updatedModelList.findIndex(item => item.id === itemId)
                if (itemIndex === -1) return prevData
    
                const itemToDuplicate = updatedModelList[itemIndex]
                const newId = uuidv7()
    
                let duplicatedItem = JSON.parse(JSON.stringify(itemToDuplicate))
    
                if (itemToDuplicate.data.type === 'view') duplicatedItem = {  ...duplicatedItem, id: newId,  text: `${itemToDuplicate.text} (copy)`,  data: { ...duplicatedItem.data, name: duplicatedItem.data.name + ` ${t('Copy')}`}}
                else  duplicatedItem = {  ...duplicatedItem,  id: newId,  text: `${itemToDuplicate.text} (copy)`,  data: { ...duplicatedItem.data, name: duplicatedItem.data.name + ` ${t('Copy')}` }}

    
     
                if (itemToDuplicate.data.type === 'folder') {
                    const children = updatedModelList.filter(child => child.parent === itemId)
                    const duplicatedChildren = children.map(child => {
                        const newChildId = uuidv7()
                        fetchData({endpoint: `${auth.authData.organizationId}/user_access/layout`, method:'post',  requestForm:{ data:duplicatedItem, type:duplicatedItem.type, parent_id:newId}, getAccessTokenSilently, auth })
                        return { ...child, id: newChildId, parent: newId, text: `${child.text} (copy)`, data: { ...child.data}}
                    })
    
                    updatedModelList.splice(itemIndex + 2, 0, ...duplicatedChildren)
                }
                else {
                    updatedModelList.splice(itemIndex + 1, 0, duplicatedItem)
                    fetchData({endpoint: `${auth.authData.organizationId}/user_access/layout`, method:'post',  requestForm:{ data:duplicatedItem, type:duplicatedItem.type, parent_id:itemId}, getAccessTokenSilently, auth })

                }
    
            }

            else if (action === 'create' && newDefinition) {
                const newId = uuidv7()
                const newItem = {id: newId, parent: itemId, text: newDefinition.name, data: newDefinition}
                fetchData({endpoint: `${auth.authData.organizationId}/user_access/layout`, method:'post',  requestForm:{ data:newItem, type:newDefinition.type, parent_id:itemId}, getAccessTokenSilently, auth })

                return { ...prevData, [foundModel]: updatedModelList}
            }

        })
    }

     
    //MEMOIZED SETTINGS BOX
    const memoizedSettings = useMemo(() => (
        <Portal> 
            <MotionBox initial={{opacity:0}} onClick={() => setShowSettings(false)}  animate={{opacity:1}} display={'flex'} exit={{opacity:0}} transition={{ duration: '.2' }} position='fixed' alignItems='center'justifyContent='center' top={0} left={0} width='100vw' height='100vh' bg='rgba(0, 0, 0, 0.3)' backdropFilter={'blur(1px)'} zIndex= {10000}>
                <MotionBox onClick={(e) => e.stopPropagation()} initial={{opacity:0, scale:0.95}}  animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} transition={{ duration: '.2', ease:'easeOut'}} width={'70vw'} height={'90vh'}  bg='white' overflow={'hidden'} borderRadius={'.7rem'} shadow={'xl'} position={'absolute'}  borderColor='border_color' borderWidth='1px' zIndex={111}  >
                    <Suspense fallback={<></>}> 
                    <Settings/>
                    </Suspense>
                </MotionBox>
            </MotionBox>
        </Portal>
   ), [showSettings])

    const onDragEnd = (result:any) => {
    isDraggable.current = false
    if (!result.destination) return
    const items = [...openedSections]
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    setOpenedSections(items)
  }

   const editSections = (section:sectionsType ) => {
        setOpenedSections((prev:any) => {
        return prev.map((sec:any) => {
            if (sec.model === section) return {...sec, expanded:!sec.expanded}
            else return sec
        })})
        
   }

    return (<>
        <AnimatePresence>
            {showSettings && memoizedSettings}
        </AnimatePresence>

        <Flex w='100%' flexDir={'column'} h='100vh' >

                <Box px='10px' pt='10px'> 
                    <Skeleton isLoaded={sideBarData !== null && extraDataMap !== null}> 
                        <UserBox/> 
                    </Skeleton>

                    <OrganizationComponent/>
                    <Skeleton isLoaded={sideBarData !== null && extraDataMap !== null}> 
                        <Flex mt='1vh' onClick={() => setSearchSection('navigate')} alignItems={'center'}  position={'relative'} gap='7px'  _hover={{bg:'gray_2'}}  cursor={'pointer'} borderRadius={'.5rem'} p='5px'>
                            <Flex  alignItems={'center'}  justifyContent={'center'} position={'relative'} w='18px'>
                                <Icon boxSize='11px' color={'text_gray'} as={FaMagnifyingGlass}/>
                            </Flex>
                            <Text  fontSize={'.9em'}>{t('Search')}</Text>
                        </Flex>
                    </Skeleton>
                </Box>

 
                <Box ref={boxRef} borderBottomWidth={'1px'} transition={'border-color .2s ease-in-out'} borderTopWidth={'1px'} borderBottomColor={hasScrolledBottom ? "border_gray" : "transparent"}  borderTopColor={hasScrolledTop ? "border_gray" : "transparent"} flex='1' pb='3vh' pt='1vh' overflow={'scroll'} px='10px'>
                    {(sideBarData && extraDataMap) ?
                        <> 
                        <DragDropContext onDragEnd={onDragEnd} autoScrollerOptions={{disabled:true}}>
                                    <Droppable droppableId="columns" direction="vertical">
                                            {(provided) => (
                                                <Box ref={provided.innerRef}  {...provided.droppableProps} >
                                                    {openedSections.map((sec, index) => (
                                                        <Draggable  key={`column-view-${index}`} isDragDisabled={!isDraggable.current} draggableId={`column-view-${index}`} index={index}>
                                                            {(provided, snapshot) => (
                                                                <Box ref={provided.innerRef} alignItems="center" {...provided.draggableProps} {...(provided.dragHandleProps)}  mt='.5vh'>
                                                                    
                                                                    <Box onMouseDown={() => isDraggable.current = true}> 
                                                                    <MainSection section={sec.model} sectionsMap={sectionsMap} onToggle={() => editSections(sec.model)} handleEditSidebar={handleEditSidebar}/>
                                                                    </Box>
                                                                    <div   className={`expandable-container ${sec.expanded ? 'expanded' : 'collapsed'}`} style={{ overflow: sec.expanded  ? 'visible' : 'hidden',   transition: sec.expanded  ?'max-height .2s ease-in-out, opacity 0.2s ease-in-out': 'max-height .2s ease-out, opacity 0.2s ease-out'}}>      

                                                                        <DndProvider backend={MultiBackend} options={getBackendOptions()}>
                                                                            <Tree tree={sideBarData[sec.model]} rootId={0} render={(node, { depth, isOpen, draggable, onToggle }) => {
                                                                                    return (
                                                                                        <ItemBox itemsMap={extraDataMap} sideBarData={sideBarData[sec.model]} handleEditSidebar={handleEditSidebar} node={node} depth={depth} expandSection={onToggle} isOpen={isOpen} />
                                                                                    )}}
                                                                                    onDrop={(newTree, { dragSource, dropTargetId }) => {
                                                                                        setSideBarData(prev => ({...prev, [sec.model]:newTree}) )
                                                                                    
                                                                                    }}
                                                                                    canDrop={(tree, { dragSource, dropTargetId }) => {
                                                                                         if (dragSource?.parent === dropTargetId) return true
                                                                                    }}
                                                                                    sort={false}
                                                                                    insertDroppableFirst={false}
                                                                                    enableAnimateExpand={true}
                                                                                    dropTargetOffset={10}
                                                                                    placeholderRender={(node, { depth }) => (<div/>)}
                                                                                    classes={{ dropTarget:"target-drop", placeholder: "tree-placeholder"}}
                                                                                    initialOpen={initialOpenedRef.current}
                                                                                />
                                                                        </DndProvider>
                                                                    </div>
                                                                </Box>)}
                                                        </Draggable>
                                                    ))}  
                                                {provided.placeholder}
                                                </Box>
                                            )}
                                        </Droppable>
                                </DragDropContext>
                                

              

                        <Box >           
                            <Flex mt='1vh'  alignItems={'center'}  position={'relative'} gap='7px' bg={viewParam === 'tilda' ? 'gray_2':'transparent'} _hover={{bg:'gray_2'}}  cursor={'pointer'} borderRadius={'.5rem'} p='5px' onClick={() => navigate('/tilda?view=tilda')}>
                                <Flex  alignItems={'center'}  justifyContent={'center'} position={'relative'} w='18px'>
                                    <Icon boxSize='13px' color={'text_gray'} as={FaRobot}/>
                                </Flex>
                                <Text flex='1'  fontSize={'.9em'} transition={'transform .1s ease-in-out'} fontWeight={viewParam === 'tilda'?'medium':'normal'} transformOrigin="left center" transform={viewParam === 'tilda'?'scale(1.02)':'scale(1)'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}   overflow={'hidden'}>
                                    {t('MatildaConfigs')}
                                </Text>
                            </Flex>
                            <Flex alignItems={'center'}  position={'relative'} gap='7px' bg={viewParam === 'help-centers' ? 'gray_2':'transparent'} _hover={{bg:'gray_2'}}  cursor={'pointer'} borderRadius={'.5rem'} p='5px' onClick={() => navigate('/help-centers?view=help-centers')}>
                                <Flex  alignItems={'center'}  justifyContent={'center'} position={'relative'} w='18px'>
                                    <Icon boxSize='11px' color={'text_gray'} as={FaBookBookmark}/>
                                </Flex>
                                <Text flex='1'  fontSize={'.9em'} transition={'transform .1s ease-in-out'} fontWeight={viewParam === 'help-centers'?'medium':'normal'} transformOrigin="left center" transform={viewParam === 'help-centers'?'scale(1.02)':'scale(1)'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}   overflow={'hidden'}>
                                    {t('HelpCenters')}
                                </Text>
                            </Flex>

                            <Flex alignItems={'center'}  position={'relative'} gap='7px' bg={viewParam === 'channels' ? 'gray_2':'transparent'}  _hover={{bg:'gray_2'}}  cursor={'pointer'} borderRadius={'.5rem'} p='5px' onClick={() => navigate('/channels?view=channels')}>
                                <Flex  alignItems={'center'}  justifyContent={'center'} position={'relative'} w='18px'>
                                    <Icon boxSize='13px' color={'text_gray'} as={HiChatAlt2}/>
                                </Flex>
                                <Text flex='1'  fontSize={'.9em'} transition={'transform .1s ease-in-out'} fontWeight={viewParam === 'channels'?'medium':'normal'} transformOrigin="left center" transform={viewParam === 'channels'?'scale(1.02)':'scale(1)'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}   overflow={'hidden'}>
                                    {t('Channels')}
                                </Text>
                             </Flex>
                            <Flex  alignItems={'center'}  position={'relative'} gap='7px'  _hover={{bg:'gray_2'}}  cursor={'pointer'} borderRadius={'.5rem'} p='5px' onClick={() => setShowSettings(true)}>
                                <Flex  alignItems={'center'}  justifyContent={'center'} position={'relative'} w='18px'>
                                    <Icon boxSize='11px' color={'text_gray'} as={FaGear}/>
                                </Flex>
                                <Text  fontSize={'.9em'}>{t('Settings')}</Text>
                            </Flex>
                        </Box>
                        </>
                        :
                        <>
                       {Array.from({ length: 15 }).map((_, index) => (
                            <Skeleton key={`skeleton-${index}`} mt='5px' height="25px" borderRadius="5px" />
                               
                        ))}
                    </>}
                    </Box>
                <Flex py='1.5vh' px='10px' alignItems={'center'} >
                    <Image h='14px' src={'/images/logo-word-gray.svg'}/>
                </Flex>
        </Flex>
        </>)
}

export default SideBar
 
//MAIN BOX
const MainSection = ({section, sectionsMap, onToggle, handleEditSidebar}:{section:sectionsType, sectionsMap:any, onToggle:any, handleEditSidebar:(action: 'delete' | 'rename' | 'create' | 'duplicate' , itemId: string, newDefinition?:{name:string, icon:{type:'emoji' | 'icon' | 'image', value:string}}) => void}) => {
    
    const [opened, setIsOpened] = useState<boolean>(false)
    
    return (<> 
        
        <Flex className='sidebar-section'  alignItems={'center'}  position={'relative'} gap='7px'  _hover={{bg:'gray_2'}}  cursor={'pointer'} borderRadius={'.5rem'} p='5px' onClick={() => {onToggle()}}>
                <Text flex='1' fontWeight={'medium'} color={'text_gray'} fontSize={'.8em'}>{sectionsMap[section as sectionsType][0]}</Text>
                <Box className={opened ? 'motion-icon-selected':'motion-icon'} color={'text_gray'} onClick={(e) => {e.stopPropagation() }}> 
                    <AddSectionButton node={{id:section}} sectionPath={[{id:section}]} setIsOpened={setIsOpened} handleEditSidebar={handleEditSidebar}/>
                </Box>
        </Flex>
    </>)
}

//NON FOLDER ITEM BOX
const ItemBox = ({node, itemsMap, depth, isOpen, expandSection, handleEditSidebar, sideBarData}:{node:any, itemsMap:any, depth:number, isOpen:boolean, expandSection:any, handleEditSidebar:(action: 'delete' | 'rename' | 'create' | 'duplicate' , itemId: string, newDefinition?:{name:string, icon:{type:'emoji' | 'icon' | 'image', value:string}}) => void, sideBarData:SideBarType[]}) => {


    //CONSTANTS
    const auth = useAuth()
    const navigate = useNavigate()
    const itemData = node.data
    const sectionPath = findPathToItem(node.id, sideBarData, mainSections)
    const [searchParams] = useSearchParams()
    const viewParam = searchParams.get('view')
    const isSelected = viewParam === node.id

    let foundView = null
    if (itemData.type === 'view') foundView = (auth?.authData?.views || [])?.find(view => view.id === itemData.view_id) || null as ViewDefinitionType

    //MENU OPENED
    const [opened, setIsOpened] = useState<boolean>(false)

    //ON CLICK ACTION
    const getActionType = ( data:any) => {
        if (data.type === 'folder') {
            expandSection()
            handleEditSidebar('rename', node.id, {...node.data, is_expanded:!node.data.is_expanded})
        }
        else if (data.type === 'view') navigate(`/view/${data.view_id}?view=${node.id}`)
        else if (data.type === 'access') navigate(`/${data.structure}/${data.source_id}?view=${node.id}`)            
    }

    //FRONT    
    return (
        <Flex  alignItems={'center'} className='sidebar-section' position={'relative'} gap='7px' bg={isSelected ? 'gray_1':'transparent'}  _hover={{bg:isSelected ? 'gray_1':'gray_2'}}  cursor={'pointer'} onClick={() => getActionType(itemData) }borderRadius={'.5rem'} p={`5px 5px 5px ${6 + (depth || 0) * 10}px`}>
                
                {itemData.type !== 'folder'  ?
                <Flex  alignItems={'center'} fontSize={'.8em'}  justifyContent={'center'} position={'relative'} w='18px'>
                    <RenderIcon standardView={foundView?.is_standard ? foundView?.model : null } icon={foundView ? foundView?.icon : itemData.icon }/>
                 </Flex>
                :
                <Flex  alignItems={'center'} fontSize={'.9em'} justifyContent={'center'} transition={'background-color .2s ease-in-out'} position={'relative'} borderRadius={'.3rem'} h='18px' w='18px'>
                    <Box position='relative' fontSize={'.9em'} justifyContent={'center'} > 
                        <Flex pos='absolute' bg='gray_1' className={'motion-icon'} h='18px' w='18px' borderRadius={'.3rem'} alignItems={'center'} justifyContent={'center'} >
                            <IoIosArrowDown  className={isOpen? "rotate-icon-up" : "rotate-icon-down"}/>
                        </Flex>
                        <Box>
                             <RenderIcon icon={itemData?.icon}/>
                        </Box>
                    </Box>
                </Flex>
                }   
                <Text flex='1'  fontSize={'.9em'} transition={'transform .1s ease-in-out'} fontWeight={isSelected?'medium':'normal'} transformOrigin="left center" transform={isSelected?'scale(1.02)':'scale(1)'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}   overflow={'hidden'}>
                    {foundView ? 
                        <> {foundView?.name}</>
                        :
                        <>{itemData.name}</>
                    }
                </Text>
                
                <Flex  gap='5px' justifyContent={'center'}>   
                    <Box className={opened ? 'motion-icon-selected':'motion-icon'} transition={'opacity .2s ease-in-out'}  color={'text_gray'} onClick={(e) => {e.stopPropagation() }}> 
                        <EditBox node={node} setIsOpened={setIsOpened} handleEditSidebar={handleEditSidebar}/>
                    </Box>
                    {itemData.type === 'view' ? 
                        <Text fontSize={'.8em'} fontWeight={'medium'}  color='text_gray' >{itemsMap?.[itemData?.view_id]?.count}</Text>
                        :<>
                            {itemData.type === 'folder' ? 
                                <AddSectionButton sectionPath={sectionPath} node={node} handleEditSidebar={handleEditSidebar}/>
                            :
                            <Icon boxSize={'12px'} color='text_gray' as={itemData.type === 'folder' ? FaPlus : FiArrowUpRight }/>
                            }
                        </>
                     }
                </Flex>
        </Flex>
    )
}

//COMPONENT FOR ADDING SECTIONS
const AddSectionButton = ({node, sectionPath, setIsOpened, handleEditSidebar}:{node:any, sectionPath:sectionPathType, setIsOpened?:Dispatch<SetStateAction<boolean>>, handleEditSidebar:(action: 'delete' | 'rename' | 'create' | 'duplicate' , itemId: string, newDefinition?:any) => void}) => {

    //CONSTANTS
    const { t } = useTranslation('main')

    //SHOW A CREATE BOX
    const [showCreate, setShowCreate] = useState<string | null>(null)

    //SHOW CRATE TYPES
    const [showAccess, setShowAccess] =  useState<sectionsType | null>(null)
    const [showView, setShowView] = useState<boolean>(false)
    const [createFolder, setCreateFolder] = useState<boolean>(false)

    //SETTINGS BUTTON REF
    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null) 
    useOutsideClick({ref1:boxRef, onOutsideClick:(value:boolean) => {setBoxStyle(null);if(setIsOpened) setIsOpened(false)}})
    const [boxStyle, setBoxStyle] = useState<CSSProperties | null>(null)

    const createAction = (e:any, type:'create' | 'view' | 'folder' | 'access') => {
        e.stopPropagation()
        if (setIsOpened) setIsOpened(false)
        setBoxStyle(null)
        if (type === 'create') {
            if (node.id === 'conversations' ||node.id === 'persons') showToast({message:t('DisabledFunction'), type:'failed'})
            else setShowCreate(node.id)
        }
        else if (type === 'view') setShowView(node)
        else if (type === 'folder') setCreateFolder(true)
        else if (type === 'access') setShowAccess(sectionPath[0].id as sectionsType)

    }

    //ADD BOX COMPONENT
    const AddBox = ( ) => {
        return (
            <AnimatePresence> 
            <Portal>
                <MotionBox  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                    style={{ transformOrigin: boxStyle.top ? 'top left':'bottom left' }}  color='black' top={boxStyle.top} mt='20px' mb='20px' bottom={boxStyle.bottom} left={boxStyle?.left} width={'200px'} maxH='40vh' overflow={'scroll'} gap='10px' ref={boxRef} fontSize={'.9em'} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)'  bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.5rem'} borderWidth={'1px'} borderColor={'border_color'}>
                        {mainSections.includes(node.id) && <> 
                            <Box p='4px'> 
                                <Flex gap='10px' alignItems={'center'} p='5px' onClick={(e) => createAction(e, 'create')}  borderRadius={'.5rem'} _hover={{bg:'gray_2'}} cursor='pointer' >
                                    <Icon color={'text_gray'} as={FaPlus}/>
                                    <Text whiteSpace={'nowrap'}>{t('Add') + ' ' + t(node.id)}</Text>
                                </Flex>
                            </Box>
                            <Box w='100%' h='1px' bg='border_color'/>
                            </>
                        }
                        <Box p='4px'> 
                            <Flex gap='10px' alignItems={'center'} p='5px' onClick={(e) => createAction(e, 'view')}   borderRadius={'.5rem'} _hover={{bg:'gray_2'}} cursor='pointer' >
                                <Icon color={'text_gray'} as={FiLayout}/>
                                <Text whiteSpace={'nowrap'}>{t('AddView')}</Text>
                            </Flex>
                            <Flex gap='10px' alignItems={'center'} p='5px' onClick={(e) => createAction(e, 'folder')}   borderRadius={'.5rem'} _hover={{bg:'gray_2'}} cursor='pointer' >
                                <Icon color={'text_gray'} as={FiFolder}/>
                                <Text whiteSpace={'nowrap'}>{t('AddFolder')}</Text>
                            </Flex>
                            <Flex gap='10px' alignItems={'center'} p='5px' onClick={(e) => createAction(e, 'access')}   borderRadius={'.5rem'} _hover={{bg:'gray_2'}} cursor='pointer' >
                                <Icon color={'text_gray'} as={FiArrowUpRight}/>
                                <Text whiteSpace={'nowrap'}>{t('AddDirect')}</Text>
                            </Flex>
                        </Box>               
                </MotionBox>
            </Portal>
        </AnimatePresence>)
    }

    //ADD A FOLDER
    const AddFolderBox = ( ) => {

        const [newName, setNewName] = useState<string>('') 
        const [newIcon, setNewIcon] = useState<{type:'emoji' | 'icon' | 'image', data:string}>({type:'emoji', data:'📁'}) 
 
        const boxRef = useRef<HTMLDivElement>(null) 
        useOutsideClick({ref1:boxRef, onOutsideClick:(value:boolean) => {setBoxStyle(null);setCreateFolder(false); handleEditSidebar('create', node.id, {type:'folder' ,icon:newIcon, name:newName}) }})
        useEnterListener({actionDisabled:false, onClickEnter:() => {setBoxStyle(null);setCreateFolder(false); handleEditSidebar('create', node.id, {type:'folder' ,icon:newIcon, name:newName}) } })
        return (
            <Portal>
                <MotionBox display={'flex'} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.8 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                    style={{ transformOrigin: 'center' }} color='black' top={buttonRef.current.getBoundingClientRect().top} mt='20px' mb='30px' p='5px'  left={'20px'} width={'250px'} maxH='40vh' overflow={'scroll'} gap='7px' ref={boxRef}  boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)'  bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.5rem'} borderWidth={'1px'} borderColor={'border_color'}>            
                        <Box fontSize={'.9em'}> 
                        <IconsPicker size='sm' selectedEmoji={newIcon} onSelectEmoji={(value) => setNewIcon(value)}/>
                        </Box>
                        <EditText focusOnOpen value={newName} setValue={setNewName} hideInput={false}/>
                </MotionBox>
            </Portal>
        )
    }

    //MEMOIZED CREATE NEW VIEWS FOLDER
    const memoizedAddBox = useMemo(() => (<AddBox/>), [boxStyle])
    const memoizedAddFolderBox = useMemo(() => (<AddFolderBox/>), [createFolder])
    const memoizedViewBox = useMemo(() => ( <AddView showBox={showView} setShowBox={setShowView} sectionPath={sectionPath} onSelectAction={(newView:any) => {setShowView(null); handleEditSidebar('create', node.id, newView)}}/> ), [showView])

    return (
    <>
        <CreateBox sectionPath={sectionPath} showBox={showCreate !== null} setShowBox={() => setShowCreate(null)} />
        <Flex alignItems={'center'} ref={buttonRef} onClick={(e) => {e.stopPropagation(); setBoxStyle(determineBoxStyle({buttonRef, changeVariable:node, getValue:true})); if (setIsOpened) setIsOpened(true)}}> 
            <Icon as={FaPlus} boxSize='10px' color='text_gray'/>
        </Flex>
        {boxStyle && memoizedAddBox}
        {memoizedViewBox}
        {createFolder && memoizedAddFolderBox}
        {showAccess && <SearchSection selectedSection={showAccess} setSearchSection={setShowAccess as any} onSelectElement={(newAccess:any) => {setShowView(null); handleEditSidebar('create', node.id, newAccess)}} selectAccessPath={sectionPath}/>}
        </>
    )
}

//COMPONEN FOR EDITING SECTIONS
const EditBox = ({node, setIsOpened, handleEditSidebar}:{node:any, setIsOpened?:Dispatch<SetStateAction<boolean>>, handleEditSidebar:(action: 'delete' | 'rename' | 'create' | 'duplicate' , itemId: string, newDefinition?:any) => void}) => {

    //CONSTANTS
    const { t } = useTranslation('main')
    const itemData = node.data
    const auth = useAuth()
    const [searchParams] = useSearchParams()

    let foundView:any = null
    if (node.data.type === 'view') foundView = (auth?.authData?.views || [])?.find(view => view.id === itemData.view_id) || null as ViewDefinitionType
 

    //SHOW EDIT NAME
    const [showEditName, setShowEditName] = useState<boolean>(false)
    
    //SETTINGS BUTTON REF
    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null) 
    useOutsideClick({ref1:boxRef, onOutsideClick:(value:boolean) => {setBoxStyle(null);setIsOpened(false)}})
    const [boxStyle, setBoxStyle] = useState<CSSProperties | null>(null)
 
    //OPEN IN A NEEW TAB
    const openSectionInNewTab = () => {
         const viewId = searchParams.get("view")

        if (itemData.type === 'view') window.open(`/view/${itemData.view_id}?view=${viewId}`, '_blank')
        else if (itemData.type === 'access') window.open(`/${itemData.structure}/${itemData.source_id}?${viewId}`, '_blank')
        setIsOpened(false)
        setBoxStyle(null)
    }

    //EDIT A NAME LOGIC
    const editName = () => {
        if (itemData.type === 'view') console.log('EDITAR VISTA')
        else setShowEditName(true)
        setIsOpened(false)
        setBoxStyle(null)

    }

    //EDIT THE NAME AND ICON
    const EditNameBox = ( ) => {

        const [newName, setNewName] = useState<string>(node.data.name) 
        const [newIcon, setNewIcon] = useState<{type:'emoji' | 'icon' | 'image', data:string}>(node.data.icon) 
 
        const boxRef = useRef<HTMLDivElement>(null) 
        useOutsideClick({ref1:boxRef, onOutsideClick:(value:boolean) => {setShowEditName(false);handleEditSidebar('rename', node.id, {icon:newIcon, name:newName})} })
        useEnterListener({actionDisabled:false, onClickEnter:() => {setShowEditName(false);handleEditSidebar('rename', node.id, {icon:newIcon, name:newName})}  })


        return (
            <Portal>
                <MotionBox display={'flex'} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.8 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                    style={{ transformOrigin: 'center' }} color='black' top={buttonRef.current.getBoundingClientRect().top} mt='20px' mb='30px' p='5px'  left={'20px'} width={'250px'} maxH='40vh' overflow={'scroll'} gap='7px' ref={boxRef}  boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)'  bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.5rem'} borderWidth={'1px'} borderColor={'border_color'}>            
                        <Box fontSize={'.9em'}> 
                        <IconsPicker size='sm' selectedEmoji={newIcon} onSelectEmoji={(value) => setNewIcon(value)}/>
                        </Box>
                        <EditText focusOnOpen value={newName} setValue={setNewName} hideInput={false}/>
                </MotionBox>
            </Portal>
        )
    }

    //ADD BOX COMPONENT
    const EditBox = ( ) => {
        return (
            <AnimatePresence> 
            <Portal>
                <MotionBox  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                    style={{ transformOrigin: boxStyle.top ? 'top left':'bottom left' }} color='black' top={boxStyle.top} mt='20px' mb='20px' bottom={boxStyle.bottom} left={boxStyle?.left} width={'200px'} maxH='40vh' overflow={'scroll'} gap='10px' ref={boxRef} fontSize={'.9em'} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)'  bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.5rem'} borderWidth={'1px'} borderColor={'border_color'}>            
                        <Box p='4px'> 
                            <Flex gap='10px' alignItems={'center'} p='5px'  onClick={() => {handleEditSidebar('duplicate', node.id);setBoxStyle(null);setIsOpened(false)}}  borderRadius={'.5rem'} _hover={{bg:'gray_2'}} cursor='pointer' >
                                <Icon color={'text_gray'} as={FiCopy}/>
                                <Text whiteSpace={'nowrap'}>{t('Duplicate')}</Text>
                            </Flex>
                            {node.data.type === 'view' ? <>
                                {!foundView?.is_standard &&     
                                <Flex gap='10px' alignItems={'center'} p='5px'  onClick={editName}  borderRadius={'.5rem'} _hover={{bg:'gray_2'}} cursor='pointer' >
                                    <Icon color={'text_gray'} as={FiEdit}/>
                                    <Text whiteSpace={'nowrap'}>{t('EditView')}</Text>
                                </Flex>}
                            </>
                            :
                            <Flex gap='10px' alignItems={'center'} p='5px'  onClick={editName}  borderRadius={'.5rem'} _hover={{bg:'gray_2'}} cursor='pointer' >
                                <Icon color={'text_gray'} as={FiEdit}/>
                                <Text whiteSpace={'nowrap'}>{t('EditName')}</Text>
                            </Flex>}
                            <Flex gap='10px' alignItems={'center'} p='5px' onClick={() => handleEditSidebar('delete', node.id)} color='red' borderRadius={'.5rem'} _hover={{bg:'gray_2'}} cursor='pointer' >
                                <Icon  as={FiTrash2}/>
                                <Text whiteSpace={'nowrap'}>{t('Delete')}</Text>
                            </Flex>
                        </Box>
                        {itemData.type !== 'folder'  && <>
                        
                        <Box w='100%' h='1px' bg='border_color'/>
                        <Box p='4px'> 
                            <Flex gap='10px' alignItems={'center'} p='5px' onClick={openSectionInNewTab}  borderRadius={'.5rem'} _hover={{bg:'gray_2'}} cursor='pointer' >
                                <Icon color={'text_gray'} as={FiArrowUpRight}/>
                                <Text whiteSpace={'nowrap'}>{t('OpenNew')}</Text>
                            </Flex>
                        </Box>
                        </>}
               
                </MotionBox>
            </Portal>
        </AnimatePresence>)
    }

    //MEMOIZED CREATE NEW VIEWS FOLDER
    const memoizedEditBox = useMemo(() => (<EditBox/>), [boxStyle])
    const memoizedEditNameBox = useMemo(() => (<EditNameBox/>), [boxStyle])

    return (<>
            <Flex alignItems={'center'} ref={buttonRef} onClick={(e) => {e.stopPropagation(); setBoxStyle(determineBoxStyle({buttonRef, changeVariable:node, getValue:true})); if (setIsOpened) setIsOpened(true)}}> 
                <BsThreeDots color='border_color' size='12px'/> 
            </Flex>
            {boxStyle && memoizedEditBox}
            <AnimatePresence> 
                {showEditName && memoizedEditNameBox}
            </AnimatePresence> 
        </>
    )
}

//CREATING A NEW OBJECT
const CreateBox = ({showBox, setShowBox, sectionPath}:{showBox:boolean, setShowBox:Dispatch<SetStateAction<boolean>>, sectionPath:sectionPathType}) => {

    const { t } = useTranslation('main')
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()
    const navigate = useNavigate()

    const createFunction = async (name:string, value:string, domain:string) => {
        if (sectionPath[0].id === 'businesses') {
                const response = await fetchData({endpoint:`${auth.authData.organizationId}/businesses`, method:'post',getAccessTokenSilently, requestForm:{name, domain}, auth })
                if (response?.status === 200) {
                    navigate(`/businesses/${response.data.id}`)
                    setShowBox(false)
                 }
        }
        else if (sectionPath[0].id  === 'functions') {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/functions`, getAccessTokenSilently, auth, method:'post', requestForm:{name ,description:''}})
            if (response?.status === 200) {
                navigate(`/functions/${response.data.id}`)
                setShowBox(false)
            }
        }
        else if (sectionPath[0].id  === 'reports') {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/reports`, getAccessTokenSilently, auth, method:'post', requestForm:{name ,description:''}})
            if (response?.status === 200) {
                navigate(`/reports/${response.data.id}`)
                setShowBox(false)
            }
        }

    }
    const BoxToRender = () => {
        switch(sectionPath[0].id ) {
            case 'businesses':
                return <ActionsBox showBox={showBox} setShowBox={setShowBox} buttonTitle={t('CreateBusiness')} des={t('CreateBusinessDes')} title={t('CreateNewBusiness')} type='action' actionFunction={createFunction} introduceAtt={['name', 'domain']}/>

            case 'functions':
                return <ActionsBox showBox={showBox} setShowBox={setShowBox} buttonTitle={t('CreateFunction')} des={t('CreateFunctionDes')} title={t('CreateNewFunction')} type='action' actionFunction={createFunction} introduceAtt={['name']}/>
            
            case 'reports':
                return <ActionsBox showBox={showBox} setShowBox={setShowBox} buttonTitle={t('CreateReport')} des={t('CreateReportDes')} title={t('CreateNewReport')} type='action' actionFunction={createFunction} introduceAtt={['name']}/>

            case 'sources':
                {
                    const SourceBox = () => {

                        const { t } = useTranslation('knowledge')

                        const [name, setName] = useState<string>('')
                        const contentList:{type:'internal_article' | 'public_article' | 'snippet' , title:string, description:string, icon:IconType}[] = [
                            {type:'public_article',title:t('PublicArticles'), description:t('PublicArticlesDes'), icon:IoBook},
                            {type:'internal_article',title:t('PrivateArticles'), description:t('PrivateArticlesDes'), icon:FaLock},
                            {type:'snippet',title:t('TextFragments'), description:t('TextFragmentsDes'), icon:FaFileLines},
                        ] 
                        const uploadDict = {
                            'website': {title:t('Website'), des:t('WebsiteDes'), icon:BiWorld},
                            'pdf': {title:t('PDF'), des:t('PdfDes'), icon:BiWorld},

                        }  
                    
                        const onClickNewCreate = async (type:'internal_article' | 'public_article' | 'snippet' |  'website' | 'pdf' ) => {
                            const response = await fetchData({endpoint:`${auth.authData.organizationId}/sources`, getAccessTokenSilently, auth, method:'post', requestForm:{title:name, type, language:'ES'}})
                            if (response?.status === 200) {
                                navigate(`/functions/${response.data.id}`)
                                setShowBox(false)
                            }
                        }
                
                        return (<>
                            <Box p='20px'  > 
                                <Text textAlign={'center'} fontWeight={'medium'} fontSize={'1.4em'}>{t('AddContent')}</Text>
                                <Text  fontWeight={400}  fontSize={'.8em'} mt='2vh' color='text_gray'>{t('AddContentDes')}</Text>
                            </Box>
        
                            <EditText value={name} setValue={setName} hideInput={false}/>
                            <Grid   p='20px'  mt='1vh' bg='hover_gray' width={'100%'} gap={'20px'} justifyContent={'space-between'} templateColumns='repeat(3, 1fr)'> 
                                {contentList.map((con, index) => ( 
                                    <Box onClick={() => onClickNewCreate(con.type)} transition={'box-shadow 0.3s ease-in-out'} key={`select-content-${index}`} _hover={{shadow:'lg'}} cursor={'pointer'} bg='white' p='10px' borderRadius={'.7rem'}>
                                        <Box>
                                            <Flex display={'inline-flex'} bg='black_button' p='7px' borderRadius={'full'} >
                                                <Icon boxSize={'13px'} color='white' as={con.icon}/>
                                            </Flex>
                                            <Text mt='1vh' fontWeight={'medium'}>{con.title}</Text>
                                        </Box>
                                        <Text fontSize={'.8em'} mt='1vh' color='text_gray'>{con.description}</Text>
                                    </Box>
                                ))}
                            </Grid>

                            <Flex p='20px' gap='20px'>
                                {['website', 'pdf'].map((con, index) => ( 

                                    <Box onClick={() => onClickNewCreate(con as any)}  borderWidth={'1px'} borderColor={'gray_1'}  transition={'box-shadow 0.3s ease-in-out'} key={`select-content-2-${index}`} _hover={{shadow:'lg'}} cursor={'pointer'} bg='white' p='10px' borderRadius={'.7rem'}>
                                        
                                        <Flex w={'fit-content'} borderRadius={'.5rem'} gap='7px' bg='gray_2' p='2px' borderWidth={'1px'} borderColor={'gray_1'}>
                                            <Icon boxSize={'13px'} color='black' as={(uploadDict as any)[con].icon}/>
                                            <Text fontSize={'.8em'} color='text_gray'>{(uploadDict as any)[con].title}</Text>
                                        </Flex>
                                        <Text mt='1vh' fontWeight={'medium'}>{(uploadDict as any)[con].des}</Text>
                                    </Box>
                                    ))}
                            </Flex>
                      
                            </>
                        )
                    }

                    const memoizedBox = useMemo(() => (
                        <ConfirmBox setShowBox={setShowBox}> 
                            <SourceBox/>
                        </ConfirmBox>
                    ), [showBox])
                
                    return (<>{showBox && memoizedBox}</>)

            }
        }
    }
    return (<BoxToRender/>)
}
 