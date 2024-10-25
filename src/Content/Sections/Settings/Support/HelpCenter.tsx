
//REACT
import  {useState, useEffect, RefObject, ReactElement, useRef, ReactNode, Dispatch, SetStateAction, useMemo, MutableRefObject } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Icon, Skeleton, Button, Switch, NumberInput, NumberInputField, Tooltip, IconButton,Textarea, NumberInputStepper, NumberDecrementStepper, NumberIncrementStepper, Portal, shouldForwardProp, chakra, HStack, Image, Heading, Link, Grid } from "@chakra-ui/react"
import { motion, isValidMotionProp, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
//COMPONENTS
import SectionSelector from '../../../Components/Reusable/SectionSelector'
import EditText from '../../../Components/Reusable/EditText'
import ImageUpload from '../../../Components/Reusable/ImageUpload'
import ColorPicker from '../../../Components/Once/ColorPicker'
import ConfirmBox from '../../../Components/Reusable/ConfirmBox'
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
import CustomCheckbox from '../../../Components/Reusable/CheckBox'
import IconsPicker from './IconsPicker'
//FUNCTIONS
import useOutsideClick from '../../../Functions/clickOutside'
import parseMessageToBold from '../../../Functions/parseToBold'
import showToast from '../../../Components/Reusable/ToastNotification'
//ICONS
import { IconType } from 'react-icons'
import { FaBookBookmark, FaPaintbrush, FaCircleDot } from "react-icons/fa6"

import { TbWorld } from 'react-icons/tb'
import { IoMdArrowRoundForward, IoIosArrowDown, IoIosArrowForward } from 'react-icons/io'
import { FaMagnifyingGlass }  from "react-icons/fa6"
import { FaPlus, FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaTiktok, FaPinterest, FaGithub, FaReddit, FaDiscord, FaTwitch, FaTelegram, FaSpotify } from "react-icons/fa"
import { TbBrandX } from "react-icons/tb"
import { RxHamburgerMenu, RxCross2 } from 'react-icons/rx'
import { useNavigate } from 'react-router-dom'
import { HiTrash } from "react-icons/hi2"
import { BsTrash3Fill, BsFillExclamationTriangleFill } from 'react-icons/bs'
import { 
    FaArrowRight, FaArrowLeft, FaArrowUp, FaArrowDown,  FaLongArrowAltRight, FaLongArrowAltLeft, FaLongArrowAltUp, FaLongArrowAltDown, FaCaretRight, FaCaretLeft, FaCaretUp,
    FaArrowCircleRight, FaArrowCircleLeft, FaArrowCircleUp, FaArrowCircleDown, FaCaretDown, FaChevronLeft, FaChevronRight,FaChevronDown,FaChevronUp,
    FaChartLine, FaMoneyBill, FaBriefcase, FaCreditCard, FaPiggyBank,FaFileContract, FaBriefcaseMedical,FaClipboardList,FaUserTie,FaHandHoldingUsd,FaMoneyCheck,FaStore,
    FaBusinessTime, FaDollarSign, FaFileInvoice, FaComments, FaVideo, FaVolumeUp,  FaVolumeMute, FaVolumeDown, FaHeadset,
    FaChartBar, FaChartPie, FaChartArea, FaPoll,  FaListUl, FaListOl, FaStrikethrough, FaTextHeight, FaFile, FaTextWidth,
    FaPhone, FaEnvelope, FaFax, FaCommentDots, FaPaperPlane, FaMobileAlt, FaFilePowerpoint, FaFileImage, FaFileVideo, FaFileAudio, FaFileCode, FaFileCsv, FaFileDownload,
    FaPen, FaAlignLeft, FaAlignRight, FaBold, FaItalic, FaQuoteLeft, FaClipboard, FaMouse,
    FaFileAlt, FaFolder, FaFileArchive, FaFilePdf, FaFileWord, FaFileExcel, FaWind, FaCloudRain, FaDog, FaCat, FaSnowflake,
    FaTree, FaLeaf, FaSun, FaCloud, FaMountain, FaWater, FaSeedling, FaGamepad, FaKeyboard, FaPrint, FaSatelliteDish, 
    FaDesktop, FaLaptop, FaTabletAlt, FaHeadphones, FaCamera, FaTv, FaFrown, FaGrin, FaFemale,FaMale, FaUserNinja, FaUserShield,
    FaUser, FaSmile, FaHandPaper, FaUserFriends, FaUsers, FaChild, FaEye, FaTrash, FaGlobe, FaQuestionCircle,
    FaTools, FaCogs, FaHeart, FaStar, FaExclamationTriangle, FaLightbulb, FaUnlock, FaShieldAlt
} from 'react-icons/fa'

const iconsMap = {FaArrowRight, FaArrowLeft, FaArrowUp, FaArrowDown,  FaLongArrowAltRight, FaLongArrowAltLeft, FaLongArrowAltUp, FaLongArrowAltDown, FaCaretRight, FaCaretLeft, FaCaretUp,
    FaArrowCircleRight, FaArrowCircleLeft, FaArrowCircleUp, FaArrowCircleDown, FaCaretDown, FaChevronLeft, FaChevronRight,FaChevronDown,FaChevronUp,
    FaChartLine, FaMoneyBill, FaBriefcase, FaCreditCard, FaPiggyBank,FaFileContract, FaBriefcaseMedical,FaClipboardList,FaUserTie,FaHandHoldingUsd,FaMoneyCheck,FaStore,
    FaBusinessTime, FaDollarSign, FaFileInvoice, FaComments, FaVideo, FaVolumeUp,  FaVolumeMute, FaVolumeDown, FaHeadset,
    FaChartBar, FaChartPie, FaChartArea, FaPoll,  FaListUl, FaListOl, FaStrikethrough, FaTextHeight, FaFile, FaTextWidth,
    FaPhone, FaEnvelope, FaFax, FaCommentDots, FaPaperPlane, FaMobileAlt, FaFilePowerpoint, FaFileImage, FaFileVideo, FaFileAudio, FaFileCode, FaFileCsv, FaFileDownload,
    FaPen, FaAlignLeft, FaAlignRight, FaBold, FaItalic, FaQuoteLeft, FaClipboard, FaMouse,
    FaFileAlt, FaFolder, FaFileArchive, FaFilePdf, FaFileWord, FaFileExcel, FaWind, FaCloudRain, FaDog, FaCat, FaSnowflake,
    FaTree, FaLeaf, FaSun, FaCloud, FaMountain, FaWater, FaSeedling, FaGamepad, FaKeyboard, FaPrint, FaSatelliteDish, 
    FaDesktop, FaLaptop, FaTabletAlt, FaHeadphones, FaCamera, FaTv, FaFrown, FaGrin, FaFemale,FaMale, FaUserNinja, FaUserShield,
    FaUser, FaSmile, FaHandPaper, FaUserFriends, FaUsers, FaChild, FaEye, FaTrash, FaGlobe, FaQuestionCircle,
    FaTools, FaCogs, FaHeart, FaStar, FaExclamationTriangle, FaLightbulb, FaUnlock, FaShieldAlt}

interface HelpCenterData  {
    id: string
    name: string
    is_live:boolean
    style: StylesConfig
    languages: string[]
    created_at: string
    updated_at: string
    created_by: number
    updated_by: number
}
interface CollectionsData {
    uuid:string
    help_center_uuid:string 
    data: {[key:string]:{name:string, description:string, icon:string}}
}

type ArticleData = {uuid:string, title:string, description:string, public_article_help_center_collections:string[], public_article_status:string, public_article_common_uuid:string }
type socialNetworks = 'facebook' | 'linkedin' | 'x' | 'instagram' | 'youtube' | 'pinterest' | 'github' |  'reddit' | 'discord' | 'tiktok' | 'twitch' | 'telegram' | 'spotify'
type sectionsTypes = '' | 'header' | 'common' | 'hero' | 'collections' | 'sections' | 'footer' | 'other'
interface StylesConfig {
    
    show_header:boolean
    logo:string 
    title:string 
    links:{tag:string, url:string}[]
    header_background:string
    header_color:string

    favicon:string
    text_background:string
    text_color:string
    actions_color:string
    floating_cards:boolean
    cards_borderradius:number
 
    welcome_message:string 
    hero_background:[string, string] 
    hero_color:string
    show_image:boolean
    hero_image: string 
    blurred_hero:boolean 
    search_placeholder:string

    show_collections:boolean
    collections_columns:number
    collections_icons_text_align:'column' | 'row'
    show_collections_description:boolean
    show_icons:boolean
    icons_color:string
    show_icons_background:boolean
    show_icons_background_image:boolean
    icons_background_color:[string, string]
    icons_background_image:string

    show_article_section:boolean 
    article_section_title:string,
    article_section_columns:number,
    article_section: {uuid:string, name:string, description:string}[]
    show_content_section:boolean 
    content_section_title:string
    content_section_description:string

    content_section_show_background_image:boolean
    content_section_background_image:string
    content_section_is_card:boolean,
    content_section_background:[string, string]
    content_section_text_color:string

    content_section_add_button:boolean
    content_section_button_title:string
    content_section_button_background:string
    content_section_button_color:string
    content_section_button_link:string
    content_section_button_borderradius:number
 
    footer_background:string
    footer_color:string
    social_networks:{[key:string]:string}
    footer_message:string
 }
const MatilStyles:StylesConfig = {
    show_header:false,
    logo:'',
    title:'',
    links:[],
    header_background:'#000000',
    header_color:'#FFFFFF',

    favicon:'',
    text_background:'#f1f1f1',
    text_color:'#000000',
    actions_color:'#0565ff',
    floating_cards:false,
    cards_borderradius:10,
 
    welcome_message:'',
    hero_background:['#0565ff', '#0565ff'],
    hero_color:'#FFFFFF',
    show_image:false,
    hero_image: '', 
    blurred_hero:true,
    search_placeholder:'',

    show_collections:true,
    collections_columns:2,
    collections_icons_text_align:'column',
    show_collections_description:true,
    show_icons:true,
    icons_color:'rgb(59, 90, 246)',
    show_icons_background:true,
    show_icons_background_image:false,
    icons_background_color:[ '#e0e0e0','#c0c0c0'],
    icons_background_image:'',

    show_article_section:false,
    article_section_title:'Algunos artículos que te pueden interesar',
    article_section_columns:1,
    article_section: [],

    show_content_section:false, 
    content_section_title:'',
    content_section_description:'',
    content_section_show_background_image:false,
    content_section_background_image:'',
    content_section_is_card:true,
    content_section_background:['#FFFFFF', '#232323'], 
    content_section_text_color:'#000000', 
    content_section_add_button:false, 
    content_section_button_title:'',
    content_section_button_background:'#0565ff', 
    content_section_button_color:'#FFFFFF', 
    content_section_button_link:'', 
    content_section_button_borderradius:10,

    footer_background:'#222',
    footer_color:'#FFFFFF',
    social_networks:{},
    footer_message:'',
 }

 const GetColumsIcon = ({ count, isVertical }: { count: number, isVertical?:boolean }) => {
    return (
      <Flex gap='2px' width='16px'  flexDir={isVertical?'column':'row'} height='16px' alignItems="center" justifyContent="center">
        {Array.from({ length: count }).map((_, index) => (
          <Flex key={`column-icon-${index}`} borderRadius={'2px'} height={isVertical?'100%':'12px'}  width={isVertical?'12px':'100%'} bg='black'  />
        ))}
      </Flex>
    )
  }
  


//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})
 
function HelpCenters ({scrollRef}:{scrollRef:RefObject<HTMLDivElement>}) {

    //CONSTANTS
    const { t } = useTranslation('settings')
    const auth = useAuth()
   
    //DATA
    const [helpCentersData, setHelpCentersData] = useState<{id: string, name: string, is_live: boolean}[] | null>(null)

    //CREATE HELP CENTER
    const [showCreate, setShowCreate] = useState<boolean>(false)
     
    //SELECTED HELP CENTER
    const [selectedHelpCenter, setSelectedHelpCenter] = useState<string | null>(null)

    useEffect(() => {
        document.title = `${t('Settings')} - ${t('HelpCenters')} - ${auth.authData.organizationName} - Matil`
        const fetchInitialData = async() => {
            const helpCentersData = await fetchData({endpoint:`${auth.authData.organizationId}/admin/help_centers`, auth, setValue:setHelpCentersData})
        }
        fetchInitialData()
    }, [])


     //FUNCTION FOR DELETING THE TRIGGER
     const AddComponent = () => {

        //NEW HELP CENTER
        const [waitingCreate, setWaitingCreate] = useState<boolean>(false)
        const [newHelpCenter, setNewHelpCenter] = useState<{name:string, id:string}>({name:'', id:''})

        //FUNCTION FOR DELETING AN AUTOMATION
        const createHelpCenter = async () => {
            const newData = {...newHelpCenter, is_live:false, style:MatilStyles, languages:[auth.authData.userData?.language], created_by:auth.authData.userId, updated_by:auth.authData.userId}
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/help_centers`, method:'post', setWaiting:setWaitingCreate, requestForm:newData,  auth, toastMessages:{works:t('CorrectCreatedHelpCenter'), failed:t('FailedCreatedHelpCenter')}})
            if (response?.status === 200) setHelpCentersData(prev => [...prev as {name: string, is_live: boolean, id: string}[], {name: newData.name, is_live: false, id: newData.id} ])
            setShowCreate(false)
        }
        //FRONT
        return(<>
            <Box p='20px' > 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('AddHelpCenter')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Text  mb='.5vh' fontWeight={'medium'}>{t('Name')}</Text>
                <EditText  maxLength={100} placeholder={t('NewHelpCenter')} hideInput={false} value={newHelpCenter.name} setValue={(value) => setNewHelpCenter((prev) => ({...prev, name:value}))}/>
                <Text mt='2vh' mb='.5vh' fontWeight={'medium'}>{t('UrlIdentifier')}</Text>
                <EditText regex={/^[a-zA-Z0-9-_\/]+$/} maxLength={100} placeholder={'matil'} hideInput={false} value={newHelpCenter.id} setValue={(value) => setNewHelpCenter((prev) => ({...prev, id:value}))}/>
            </Box>
            <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                <Button  size='sm' variant={'main'} isDisabled={newHelpCenter.name === '' || newHelpCenter.id === '' || !(/^[a-zA-Z0-9-_\/]+$/).test(newHelpCenter.id)} onClick={createHelpCenter}>{waitingCreate?<LoadingIconButton/>:t('AddHelpCenter')}</Button>
                <Button  size='sm' variant={'common'} onClick={()=> setShowCreate(false)}>{t('Cancel')}</Button>
            </Flex>
        </>)
    }

    //DELETE BOX
    const memoizedAddBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowCreate}> 
            <AddComponent/>
        </ConfirmBox>
    ), [showCreate])
     
    return(<>

    {selectedHelpCenter ?  <HelpCenter  scrollRef={scrollRef} helpCenterId={selectedHelpCenter} setHelpCenterId={setSelectedHelpCenter} setHelpCentersData={setHelpCentersData}/> :
    <>
    {showCreate && memoizedAddBox}
        <Box> 
            <Flex justifyContent={'space-between'} alignItems={'end'}> 
                <Box> 
                    <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('HelpCenters')}</Text>
                    <Text color='gray.600' fontSize={'.9em'}>{t('HelpCentersDes')}</Text>
                </Box>
                <Button  variant='main' size={'sm'} onClick={() => setShowCreate(true)} leftIcon={<FaPlus/>}>{t('CreateHelpCenter')}</Button>
            </Flex>
            <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='3vh'/>
        </Box>

        
        <Skeleton flex='1' style={{ overflow:'scroll'}} isLoaded={helpCentersData !== null}>
            {helpCentersData?.length === 0 ?   
            <Flex height={'100%'} top={0} left={0} width={'100%'} position={'absolute'} alignItems={'center'} justifyContent={'center'}> 
                <Box maxW={'580px'} textAlign={'center'}> 
                    <Text fontWeight={'medium'} fontSize={'2em'} mb='2vh'>{t('NoHelpCenters')}</Text>               
                    <Text fontSize={'1em'} color={'gray.600'} mb='2vh'>{t('NoHelpCentersDes')}</Text>               
                    <Button  variant='main'  onClick={() => setShowCreate(true)} leftIcon={<FaPlus/>}>{t('CreateHelpCenter')}</Button>
                </Box>
            </Flex> : 
            <Flex flexWrap={'wrap'} gap='32px'  >
                {helpCentersData?.map((center, index) => (
                    <Box overflow={'hidden'} onClick={() => setSelectedHelpCenter(center.id)} cursor={'pointer'} borderWidth={'1px'} key={`help-center-${index}`} transition={'box-shadow 0.3s ease-in-out'} _hover={{shadow:'lg'}} borderColor={'gray.300'} shadow={'sm'} borderRadius={'1rem'}>
                        <Box height={'200px'} width={'300px'} bg='brand.text_blue'>
                        </Box>
                        <Box p='20px'>
                            <Text fontWeight={'medium'} fontSize={'1.2em'}>{center.name}</Text>
                            <Flex mt='1vh' alignItems={'center'} gap='10px'>
                                <Icon color={center?.is_live?'#68D391':'#ECC94B'} as={FaCircleDot}/>
                                <Text>{center.is_live?t('Live'):t('NoLive')}</Text>
                            </Flex>
                        </Box>
                    </Box>
                ))}
            </Flex>}
        </Skeleton>
    </>}
</>
    )
}
export default HelpCenters

function HelpCenter ({scrollRef, helpCenterId, setHelpCenterId, setHelpCentersData}:{scrollRef:RefObject<HTMLDivElement>, helpCenterId:string | null, setHelpCenterId:Dispatch<SetStateAction<string | null>>, setHelpCentersData:Dispatch<SetStateAction<{ name: string, is_live: boolean, id: string}[] | null>>}) {

    //CONSTANTS
    const auth = useAuth()
    const navigate = useNavigate()
    const { t } = useTranslation('settings')
    const desiredKeys = ['uuid', 'title', 'description', 'public_article_help_center_collections', 'public_article_status', 'public_article_common_uuid']
    const headerRef = useRef<HTMLDivElement>(null)
    const availableLanguages = ['ES', 'EN', ]
    const getPreSignedUrl = async (blobUrl:string) => {
        if (!blobUrl) return ''
        else if (blobUrl.startsWith('https')) return blobUrl
        const responseBlob = await fetch(blobUrl);
        const blob = await responseBlob.blob();
        const file = new File([blob], 'uploaded_file', { type: blob.type })

        const response = await fetchData({endpoint: `${auth.authData.organizationId}/chatbot/s3_pre_signed_url`, method:'post', auth, requestForm: { file_name: file.name}})   
        if (response?.status === 200) {
            const responseUpload = await fetch(response.data.upload_url, {method: "PUT", headers: {}, body: file})
            if (responseUpload.ok) {
                return response.data.access_url as string
            }
            else return ''
        }
        else return ''
    }
    //SELECTED LANGUAGE
    const [selectedLanguage, setSelectedLanguage] = useState<string>(auth.authData.userData?.language || 'ES')

    //SECTION
    const sectionsList = ['collections', 'styles']
    const sectionsMap:{[key:string]:[string, ReactElement]}  = {'collections':[t('Collections'), <FaBookBookmark/>], 'styles':[t('Styles'), <FaPaintbrush/> ]}
    const [currentSection, setCurrentSection] = useState<'collections' | 'styles'>('collections')

    //EDIT STYLES 
    const stylesRef = useRef<StylesConfig | null>(null)
    const stylesHeaderRef = useRef<HTMLDivElement>(null)

    const [waitingStyles, setWaitingStyles] = useState<boolean>(false)

    //EDIT HELP CENTER
    const [showCreateCollection, setShowCreateCollection] = useState<boolean>(false)
    const [showDelete, setShowDelete] = useState<boolean>(false)
    const [showEdit, setShowEdit] = useState<boolean>(false)

    //ORGANIZATION DATA
    const expandedCollections = useRef<number[]>([])
    const helpCenterDataRef = useRef<HelpCenterData| null>(null)
    const [helpCenterData, setHelpCenterData] = useState<HelpCenterData | null>(null)
    const [collectionsData, setCollectionsData] = useState<CollectionsData[] | null>(null)
    const [publicArticlesData, setPublicArticlesData] = useState<ArticleData[] | null>(null)

    //FETCH NEW DATA WHEN THE VIEEW CHANGE
    useEffect(() => {
        document.title = `${t('Settings')} - ${t('HelpCenter')} - ${auth.authData.organizationName} - Matil`

        const fetchInitialData = async() => {
            const articlesData = await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/sources`, params:{page_index:1, type:['public_article']}, auth})
            
            console.log(articlesData?.data)
            if (articlesData?.status === 200) {
                const publicArticles = articlesData.data.page_data.filter((article:any) => article.type === 'public_article').map((article:any) => {
                    return desiredKeys.reduce((obj:any, key) => {
                        if (key in article) obj[key] = article[key]
                        return obj
                    }, {})
                })
                setPublicArticlesData(publicArticles)
            }
            const helpCenterResponse = await fetchData({endpoint:`${auth.authData.organizationId}/admin/help_centers/${helpCenterId}`, setValue:setHelpCenterData, auth})
            if (helpCenterResponse?.status === 200) helpCenterDataRef.current = helpCenterResponse?.data

            await fetchData({endpoint:`${auth.authData.organizationId}/admin/help_centers/${helpCenterId}/collections`, setValue:setCollectionsData, auth})
            
        }
        fetchInitialData()
    }, [])

    const updateHelpCenter = async (newData:HelpCenterData) => {
        if ( JSON.stringify(newData) === JSON.stringify(helpCenterDataRef.current)) return 
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/help_centers/${helpCenterId}`, method:'put', requestForm:newData, auth, toastMessages:{works:t('CorrectEditedHelpCenter'), failed:t('FailedEditedHelpCenter')}})
        if (response?.status === 200) helpCenterDataRef.current = newData
    }
    //COLLECTIONS TABLE HEIGHT
    const [boxHeight, setBoxHeight] = useState<number>(1000)
    useEffect(() => {
        const updateHeight = () => {
            if (headerRef.current) {
                const alturaCalculada =  ((window.innerHeight - headerRef.current?.getBoundingClientRect().bottom ) - window.innerWidth * 0.02)
                setBoxHeight(alturaCalculada)
            }
        } 
        updateHeight()
        window.addEventListener('resize', updateHeight)
        return () => {window.removeEventListener('resize', updateHeight)}
    }, [headerRef.current])

    const saveStyles = async (newStyles:StylesConfig) => {
       
        setWaitingStyles(true)
        const keysToUpload = [
            "logo",
            "favicion",
            "hero_image",
            "show_icons_background_image",
            "content_section_background_image"
        ]
        const uploadPromises = keysToUpload.map(async (key) => {
            const blobUrl = (newStyles as any)[key];
            if (blobUrl) {
                const preSignedUrl = await getPreSignedUrl(blobUrl) as string
                (newStyles as any)[key] = preSignedUrl
                return { key, preSignedUrl }
            }
            return null
        })
        await Promise.all(uploadPromises)

        
        const newHelpCenter = {...helpCenterData as HelpCenterData, style:newStyles}
        setHelpCenterData(newHelpCenter)
        const response = await fetchData({endpoint: `${auth.authData.organizationId}/admin/help_centers/${helpCenterData?.id}`, requestForm:newHelpCenter, method: 'put', auth, toastMessages:{works:t('CorrectEditedHelpCenter'), failed:t('FailedEditedHelpCenter')}})
        setWaitingStyles(false)

    }

    //COLLECTIONS COMPONENT
    const CollectionComponent = ({collection, index}:{collection:{uuid:string, data:{[key:string]:{name:string, icon:string, description:string}}}, index:number}) => {

        //COLLECTION ARTICLES
        const filteredArticles = publicArticlesData ? publicArticlesData.filter(article => article.public_article_help_center_collections.includes(collection.uuid)): []
        const remainingArticles = publicArticlesData ? publicArticlesData.filter(article => !article.public_article_help_center_collections.includes(collection.uuid)): []

        //ICON REF
        const iconsBoxRef = useRef<HTMLDivElement>(null)
        const iconsSelectorRef = useRef<HTMLDivElement>(null)
        const [settingsIconsBoxPosition, setSettingsIconsBoxPosition] = useState<{top?:number, bottom?:number, left:number} | null>(null)
        useOutsideClick({ref1:iconsBoxRef, ref2:iconsSelectorRef, onOutsideClick:(b:boolean) => setSettingsIconsBoxPosition(null), containerRef:scrollRef})
        const determineBoxPosition = () => {
            const boxLeft = (iconsBoxRef.current?.getBoundingClientRect().left || 0) 
            const isTop = (iconsBoxRef.current?.getBoundingClientRect().bottom || 0) > window.innerHeight/2 
            if (!isTop) setSettingsIconsBoxPosition({top:(iconsBoxRef.current?.getBoundingClientRect().bottom || 0) + 5, left:boxLeft})
            else setSettingsIconsBoxPosition({bottom:window.innerHeight - (iconsBoxRef.current?.getBoundingClientRect().top || 0) + 5, left:boxLeft})
        }

        //CURRENT COLLECTION
        const [currentCollection, setCurrentCollection] = useState<{name:string, description:string, icon:string}>({name:(collection.data as any)[selectedLanguage]?.name, description:(collection.data as any)[selectedLanguage]?.description, icon:(collection.data as any)?.[selectedLanguage].icon})
        
        //IS HOVERING A COLLECTION
        const [hoveringSection, setHoveringSection] = useState<string>('')

        //EXPAND COLLECTION
        const [expandCollection, setExpandCollection] = useState<boolean>(expandedCollections.current.includes(index))
        const handleExpand = () => {
            setExpandCollection((prevExpand) => {
                const isExpanded = expandedCollections.current.includes(index)
                if (isExpanded) expandedCollections.current = expandedCollections.current.filter(i => i !== index)
                else expandedCollections.current.push(index)
                return !prevExpand
            })
        }

        //ADD AND DELTE ELEMENT LOGIC
        const [showAddArticle, setShowAddArticle] = useState<boolean>(false)
        const [showDeleteElement, setShowDeleteElement] = useState<{type:'article' | 'collection', id:string} | null>(null)
        
        //UPDATE A COLLECTION ADATA
        const updateCollection = async (newData:{name:string, description:string, icon:string}) => {
            const newCollection = {data:{...collection.data, [selectedLanguage]:newData}}
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/admin/help_centers/${helpCenterData?.id}/collections/${collection.uuid}`, requestForm:newCollection, method: 'put', auth,})
        }

        //ADD A COLLECTION COMPONENT
        const AddBoxComponent = () => {
            const [waitingAdd, setWaitingAdd] = useState<boolean>(false)
            const [selectedArticles, setSelectedArticles] = useState<string[]>([])
            
            const createArticles = async () => {
                setWaitingAdd(true)
                try {
                    for (const articleId of selectedArticles) {
                        const response = await fetchData({endpoint: `${auth.authData.organizationId}/admin/help_centers/${helpCenterData?.id}/collections/${collection.uuid}/public_articles/${articleId}`, method: 'post', auth,})
                    }
                    showToast({message:t('CorrectAddedArticles'), type:'works'})

                    const updatedArticles = publicArticlesData?.map(article => {
                        if (selectedArticles.includes(article.public_article_common_uuid)) return {...article,public_article_help_center_collections: [...new Set([...article.public_article_help_center_collections, collection.uuid])],};
                        return article
                    }) || []
                    setPublicArticlesData(updatedArticles)        
                } 
                catch (error) {showToast({message:t('FailedAddedArticles'), type:'failed'})}
                finally {
                    setWaitingAdd(false)
                    setShowAddArticle(false)
                }
            }

            
            const handleCheckboxChange = (element:string, isChecked:boolean) => {
                if (isChecked) setSelectedArticles(prevElements=> [...prevElements, element])
                else setSelectedArticles(prevElements => prevElements.filter(el => el !== element))
            }

            return (<> 
                    <Box p='20px' > 
                        <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('AddArticles')}</Text>
                        <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                        {remainingArticles.length === 0 ?<Text>{t('NoArticlesToAdd')}</Text>:
                        <Box borderTopColor={'gay.300'} borderTopWidth={'1px'}> 
                            {remainingArticles.map((article, index) => (
                                <Flex key={`article-to-add-${index}`} p='10px' borderBottomWidth={'1px'} borderBottomColor='gray.200' alignItems={'center'}  gap='20px' bg={selectedArticles.includes(article.public_article_common_uuid)?'blue.100':''}>
                                    <Box flex='1'> 
                                        <CustomCheckbox id={`checkbox-${index}`}  onChange={() => handleCheckboxChange(article.public_article_common_uuid, !selectedArticles.includes(article.public_article_common_uuid))} isChecked={selectedArticles.includes(article.public_article_common_uuid)} />
                                    </Box>
                                    <Text flex='7' fontWeight={'medium'}_hover={{color:'brand.text_blue', textDecor:'underline'}} cursor={'pointer'} onClick={() => navigate(`/knowledge/article/${article.uuid}`)} >{article.title}</Text> 
                                    <Box flex='4'> 
                                        <Box boxShadow={`1px 1px 1px rgba(0, 0, 0, 0.15)`} display="inline-flex" fontSize='.9em' py='2px' px='8px' fontWeight={'medium'} color='white'  bg={article.public_article_status === 'draft'?'red.100':'green.100'} borderRadius={'.7rem'}> 
                                            <Text color={article.public_article_status === 'draft'?'red.600':'green.600'}>{t(article.public_article_status)}</Text>
                                        </Box>
                                    </Box>
                                </Flex>
                            ))}
                        </Box>}
                    </Box>
                    <Flex  p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='brand.gray_2' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                        <Button  size='sm' variant={'main'} isDisabled={selectedArticles.length === 0} onClick={createArticles}>{waitingAdd?<LoadingIconButton/>:t('AddArticles')}</Button>
                        <Button  size='sm' variant={'common'} onClick={() => {setShowAddArticle(false)}}>{t('Cancel')}</Button>
                    </Flex>
            </>)
        }

        //DELETE A COLLECTION COMPONENT
        const DeleteComponent = () => {
            const [waitingDelete, setWaitingDelete] = useState<boolean>(false)
            const createAticles = async() => {
                const endpoint = `${auth.authData.organizationId}/admin/help_centers/${helpCenterData?.id}/collections/${collection.uuid}${ showDeleteElement?.type === 'collection' ?'':`/public_articles/${showDeleteElement?.id}`}`
                const response = await fetchData({endpoint, method:'delete', setWaiting:setWaitingDelete, auth, toastMessages:{works:showDeleteElement?.type === 'collection'? t('CorrectDeletedCollection'):t('CorrectDeletedArticle'), failed:showDeleteElement?.type === 'collection'? t('FailedDeletedCollection'):t('FailedtDeletedArticle')}})
                if (response?.status === 200)  setCollectionsData(prevCollections => (prevCollections as CollectionsData[]).filter((_, i) => i !== index))
                setShowDeleteElement(null)
            }     
           
            return (<> 
                    <Box p='20px' maxW='450px'> 
                        <Text fontWeight={'medium'} fontSize={'1.2em'}>{showDeleteElement?.type === 'collection'?t('DeleteCollection'):t('DeleteArticle')}</Text>
                        <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                        <Text mt='2vh'>{showDeleteElement?.type === 'collection'?t('DeleteCollectionMessage'):t('DeleteArticleMessage')}</Text>
                    </Box>
                    <Flex  maxW='450px' p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                        <Button  size='sm' variant={'delete'} onClick={createAticles}>{waitingDelete?<LoadingIconButton/>:showDeleteElement?.type === 'collection'?t('DeleteCollection'):t('DeleteArticle')}</Button>
                        <Button  size='sm' variant={'common'} onClick={() => {setShowAddArticle(false)}}>{t('Cancel')}</Button>
                    </Flex>
            </>)
        }

        //MEMOIZED ADD COLLECTION
        const AddBox = useMemo(() => (
            <ConfirmBox maxW={'60vw'}  setShowBox={setShowAddArticle}> 
                <AddBoxComponent/>
            </ConfirmBox>
        ), [showAddArticle])

        //MEMOIZED DELETE COLLECTION
        const DeleteBox = useMemo(() => (
            <ConfirmBox  setShowBox={(b:boolean) => setShowDeleteElement(null)}> 
                <DeleteComponent/>
            </ConfirmBox>
        ), [showDeleteElement])

        return (<>
           {settingsIconsBoxPosition && 
            <Portal> 
                <MotionBox ref={iconsSelectorRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                    style={{ transformOrigin: settingsIconsBoxPosition.top ? 'top left':'bottom left' }} overflow={'scroll'} left={settingsIconsBoxPosition.left}  top={settingsIconsBoxPosition.top || undefined}  bottom={settingsIconsBoxPosition.bottom ||undefined} position='absolute' bg='white'  zIndex={1000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='gray.200' borderWidth='1px' borderRadius='.7rem'>
                    <IconsPicker selectedIcon={currentCollection.icon} setSelectedIcon={(icon:string) => {setSettingsIconsBoxPosition(null);updateCollection({...currentCollection, icon}); setCurrentCollection(prev => ({...prev, icon}))}}/>
                </MotionBox >
            </Portal>}
                
            {showAddArticle && AddBox} 
            {showDeleteElement && DeleteBox} 

            <Box overflow={'hidden'} width={'100%'}> 
                <Flex  position={'relative'} borderBottomColor={index === (collectionsData?.length || 0) - 1 ?'':'gray.200'}  borderBottomWidth={index === (collectionsData?.length || 0) - 1 ?'0':'1px'} gap='20px' alignItems={'center'}  p='20px'  _hover={{bg:'brand.gray_2'}} onMouseEnter={() => setHoveringSection('collection')} onMouseLeave={() => setHoveringSection('')}> 
                    <Flex flex='3' alignItems={'center'} gap={'20px'}>
                        {filteredArticles.length > 0 && <IoIosArrowDown size={'20px'} className={expandCollection ? "rotate-icon-up" : "rotate-icon-down"} onClick={handleExpand}/>}
                        <Flex onClick={determineBoxPosition} ref={iconsBoxRef} justifyContent={'center'} alignItems={'center'} p='15px' bg='brand.gray_1' borderRadius={'.5rem'}> 
                            <Icon boxSize={'20px'}  as={(iconsMap as any)[currentCollection?.icon]}/>
                        </Flex>
                        <Box>
                            <textarea maxLength={50} onBlur={() => updateCollection(currentCollection)} value={currentCollection?.name}  className="title-textarea-collections"  onChange={(e) => setCurrentCollection(prev => ({...prev, name:e.target.value}))}  placeholder={t('AddDescription')} rows={1}  />
                            <textarea maxLength={140} onBlur={() => updateCollection(currentCollection)} value={currentCollection?.description} className="description-textarea-functions"  onChange={(e) => setCurrentCollection(prev => ({...prev, description:e.target.value}))}  placeholder={t('AddDescription')} rows={1}  />
                        </Box>
                    </Flex>
                    
                    <Flex alignItems={'center'} gap='7px' flex='1' >
                        {filteredArticles.length === 0  && <Icon as={BsFillExclamationTriangleFill} color='red.600'/>}
                        <Text fontWeight={'semibold'} >{filteredArticles.length === 0 ?t('NoArticles'):filteredArticles.length}</Text>
                    </Flex>
                   
                    <Flex flex='1' justifyContent={'space-between'}  alignItems={'center'} > 
                        <Text  fontWeight={'semibold'}>-</Text>
                        <Flex mr='50px' display={'inline-flex'} flexDir={'column'} alignItems={'center'}  textAlign={'center'} color='brand.text_blue' p='8px' borderRadius={'.5rem'} cursor={'pointer'} _hover={{bg:'white'}} onClick={() => setShowAddArticle(true)}>
                            <Icon as={FaPlus}/>
                            <Text>{t('AddArticles')}</Text>
                        </Flex>
                    </Flex>
                    {hoveringSection === 'collection' && <IconButton aria-label='delete-collection' position={'absolute'} right={'20px'} bg='transparent' size='sm' variant={'delete'} icon={<HiTrash size='20px'/>} onClick={() => setShowDeleteElement({type:'collection', id:''})}/>}
                </Flex>                
                <motion.div initial={false} animate={{height:expandCollection?'auto':0,}} exit={{height:expandCollection?0:'auto',  }} transition={{duration:.2}} >           

                    {filteredArticles.map((article, index2) => (
                        <Flex  position={'relative'} key={`article-${index2}`} borderTopColor={index === (filteredArticles?.length || 0) - 1 ?'':'gray.200'}  borderTopWidth={index === (filteredArticles?.length || 0) - 1 ?'0':'1px'} gap='20px'  alignItems={'center'}  p='20px' _hover={{bg:'brand.gray_2'}}  onMouseEnter={() => setHoveringSection(article.uuid)} onMouseLeave={() => setHoveringSection('')}> 
                            <Flex flex='3' alignItems={'center'}   gap={'20px'}>
                                <Flex ml='70px' justifyContent={'center'} alignItems={'center'} p='15px' bg='brand.gray_1' borderRadius={'.5rem'}> 
                                    <Icon boxSize='25px' as={FaBookBookmark}/>
                                </Flex>
                                <Text fontWeight={'medium'}_hover={{color:'brand.text_blue', textDecor:'underline'}} cursor={'pointer'} onClick={() => navigate(`/knowledge/article/${article.uuid}`)} fontSize={'1.2em'}>{article.title}</Text>
                            </Flex>
                            <Text flex='1' fontWeight={'semibold'}>-</Text>
                            <Box flex={'1'}> 
                                <Box boxShadow={`1px 1px 1px rgba(0, 0, 0, 0.15)`} display="inline-flex" fontSize='.9em' py='2px' px='8px' fontWeight={'medium'} color='white'  bg={article.public_article_status === 'draft'?'red.100':'green.100'} borderRadius={'.7rem'}> 
                                    <Text color={article.public_article_status === 'draft'?'red.600':'green.600'}>{t(article.public_article_status)}</Text>
                                </Box>    
                            </Box>                        
                             {hoveringSection === article.uuid && <IconButton aria-label='delete-collection' position={'absolute'} right={'40px'} bg='transparent' size='sm' variant={'delete'} icon={<HiTrash size='20px'/>}  onClick={() => setShowDeleteElement({type:'article', id:article.uuid})}/>}
                        </Flex>
                    ))}
                </motion.div>
            </Box>
        
        </>)
    }
    

    //EDIT ACTIONS BUTTON
    const ActionsButton = ({isLanguage}:{isLanguage:boolean}) => {

        const [showList, setShowList] = useState<boolean>(false)
        const buttonRef = useRef<HTMLButtonElement>(null)
        const boxRef = useRef<HTMLDivElement>(null)
        useOutsideClick({ref1:buttonRef, ref2:boxRef, onOutsideClick:setShowList})
        return(
            <Flex position={'relative'} flexDir='column' alignItems={'end'}>  
            <Button size='sm'  ref={buttonRef} leftIcon={<IoIosArrowDown className={showList ? "rotate-icon-up" : "rotate-icon-down"}/>}variant='common' onClick={() => {setShowList(!showList)}} >
                {isLanguage?t(selectedLanguage):t('Actions')}
            </Button>
            <AnimatePresence> 
                {showList &&  
                    <Portal> 
                        <MotionBox ref={boxRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                            style={{ transformOrigin: 'top' }} minW={buttonRef.current?.getBoundingClientRect().width } left={isLanguage?buttonRef.current?.getBoundingClientRect().left:undefined} right={isLanguage ? undefined:window.innerWidth - (buttonRef.current?.getBoundingClientRect().right || 0)} mt='5px'  top={buttonRef.current?.getBoundingClientRect().bottom }  position='absolute' bg='white' p='8px'  zIndex={1000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='gray.200' borderWidth='1px' borderRadius='.7rem'>
                            
                            {isLanguage ? <> 
                                {availableLanguages.map((lan, index) => (
                                    <Flex px='10px' key={`language-${index}`} fontSize={'.9em'} borderRadius='.5rem'   onClick={() => {setSelectedLanguage(lan);setShowList(false)}} py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'brand.gray_2'}}>
                                        <Text whiteSpace={'nowrap'}>{t(lan)}</Text>
                                    </Flex>
                                ))}</>
                            :<> 
                         
                            <Flex  px='10px'   fontSize={'.9em'} borderRadius='.5rem'  color='red' py='10px'cursor={'pointer'} onClick={() => {setShowDelete(true);setShowList(false)}}gap='10px' alignItems={'center'} _hover={{bg:'red.50'}}>
                                <Icon as={BsTrash3Fill}/>
                                <Text whiteSpace={'nowrap'}>{t('DeletePermanently')}</Text>
                            </Flex></>}

                        </MotionBox >
                    </Portal>}
            </AnimatePresence>
        </Flex>
        )
    }

    //CREATE COLLECTION
    const CreateCollection = () => {

       //REFS
        const emojiButtonRef = useRef<HTMLDivElement>(null)
        const emojiBoxRef = useRef<HTMLDivElement>(null)
        const [emojiVisible, setEmojiVisible] = useState<boolean>(false)
        useOutsideClick({ref1:emojiButtonRef, ref2:emojiBoxRef, onOutsideClick:setEmojiVisible})
 
        const [waitingCreate, setWaitingCreate] = useState<boolean>(false)
        const [newCollection, setNewCollection] = useState<{name:string, icon:string, description:string}>({name:'', icon:'FaFolder', description:''})

        const createCollection = async () => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/help_centers/${helpCenterData?.id}/collections`, method:'post', setWaiting:setWaitingCreate, requestForm:{help_center_uuid:helpCenterData?.id, data:{[selectedLanguage]:newCollection}}, auth})
            if (response?.status === 200){
                setCollectionsData(prevCollections => {
                    if (prevCollections) {
                        const newUuid = response.data.uuid as string
                        const existingCollection = prevCollections.find(collection => collection.uuid === newUuid)
                        if (existingCollection) {
                            return prevCollections.map(collection => {
                                if (collection.uuid === newUuid) return {...collection, data: {...collection.data, [selectedLanguage]: newCollection}}
                                return collection
                            })
                        }
                        else return [...prevCollections,{data: {[selectedLanguage]: newCollection}, help_center_uuid: helpCenterData?.id || '', uuid: newUuid}]      
                    }
                    else return null
                })
            }
             setShowCreateCollection(false)
        }
        
        return(<>
            <Box p='20px' > 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('CreateCollection')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Flex alignItems={'center'} gap='10px'> 
                    <Flex cursor={'pointer'} ref={emojiButtonRef} onClick={() => setEmojiVisible(true)} alignItems={'center'} justifyContent={'center'} width={'40px'} height={'40px'} borderWidth={'1px'} borderColor={'gray.300'} borderRadius={'.5rem'}> 
                        <Icon boxSize={'20px'}  as={(iconsMap as any)[newCollection.icon]}/>
                    </Flex>
                    <EditText placeholder={t('CollectionName')} hideInput={false} value={newCollection.name} setValue={(value) => setNewCollection(prev => ({...prev, name:value}))}/>
                </Flex>
                <Text mt='2vh' mb='.5vh' fontWeight={'medium'}>{t('Description')}</Text>
                <Textarea maxW={'500px'} resize={'none'} maxLength={2000} height={'auto'} placeholder={`${t('Description')}...`} maxH='300px' value={newCollection.description} onChange={(e) => setNewCollection((prev) => ({...prev, description:e.target.value}))} p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "brand.text_blue", borderWidth: "2px"}}/>
            </Box>
            <Flex bg='brand.gray_2' p='20px' gap='10px' flexDir={'row-reverse'}>
                <Button size='sm' variant={'main'} onClick={createCollection}>{waitingCreate?<LoadingIconButton/>:t('CreateCollection')}</Button>
                <Button size='sm' variant={'common'} onClick={() => setShowCreateCollection(false)}>{t('Cancel')}</Button>
            </Flex>
            {emojiVisible && 
                <Portal> 
                <Box position={'fixed'} zIndex={1000000} pointerEvents={emojiVisible?'auto':'none'} transition='opacity 0.2s ease-in-out' opacity={emojiVisible ? 1:0} top={`${(emojiButtonRef?.current?.getBoundingClientRect().top || 0)}px`} right={`${window.innerWidth - (emojiButtonRef?.current?.getBoundingClientRect().left || 0) + 5}px`}  ref={emojiBoxRef}> 
                    <IconsPicker selectedIcon={newCollection.icon} setSelectedIcon={(value:string) => {setNewCollection(prev => ({...prev, icon:value}));setEmojiVisible(false)} } />
                </Box>
            </Portal>}
        </>)
    }

    //DELETE COMPONENT
    const DeleteComponent = () => {

        //WAITING DELETION
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

        //FUNCTION FOR DELETING AN AUTOMATION
        const deleteHelpCenter = async () => {
            setWaitingDelete(true)
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/admin/help_centers/${helpCenterData?.id}`, method: 'delete', setWaiting: setWaitingDelete, auth, toastMessages: {works: t('CorrectDeletedHelpCenter'), failed: t('FailedDeletedHelpCenter')}})
            if (response?.status === 200) {
                setHelpCentersData(prev => (prev || []).filter(helpCenter => helpCenter.id !== helpCenterData?.id))
                setHelpCenterId(null)
            }
            setShowDelete(false)
        }
        //FRONT
        return(<>
            <Box p='20px' > 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ConfirmDelete')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Text >{parseMessageToBold(t('ConfirmDeleteHelpCenter', {name:helpCenterData?.name}))}</Text>
            </Box>
            <Flex bg='brand.gray_2' p='20px' gap='10px' flexDir={'row-reverse'}>
                <Button  size='sm' variant={'delete'} onClick={deleteHelpCenter}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                <Button  size='sm' variant={'common'} onClick={() => setShowDelete(false)}>{t('Cancel')}</Button>
            </Flex>
        </>)
    }

    //EDIT COMPONENT
    const AddComponent = () => {

        //NEW HELP CENTER
        const [waitingCreate, setWaitingCreate] = useState<boolean>(false)
        const [newHelpCenter, setNewHelpCenter] = useState<{name:string, id:string}>({name:helpCenterData?.name || '', id:helpCenterData?.id || ''})

        //FUNCTION FOR DELETING AN AUTOMATION
        const createHelpCenter = async () => {
            const newData = {...helpCenterData as HelpCenterData, ...newHelpCenter}
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/help_centers/${newData.id}`, method:'put', setWaiting:setWaitingCreate, requestForm:newData,  auth, toastMessages:{works:t('CorrectEditedHelpCenter'), failed:t('FailedEditedHelpCenter')}})
            if (response?.status === 200) 
            {
                setHelpCentersData(prev => [...prev as {name: string, is_live: boolean, id: string}[], {name: newData?.name || '', is_live: newData?.is_live || false, id: newData?.id || ''} ])
                setHelpCenterData(newData)
            }
            setShowEdit(false)
        }
        //FRONT
        return(<>
            <Box p='20px' > 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('EditHelpCenter')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Text  mb='.5vh' fontWeight={'medium'}>{t('Name')}</Text>
                <EditText  maxLength={100} placeholder={t('NewHelpCenter')} hideInput={false} value={newHelpCenter.name} setValue={(value) => setNewHelpCenter((prev) => ({...prev, name:value}))}/>
                <Text mt='2vh' mb='.5vh' fontWeight={'medium'}>{t('UrlIdentifier')}</Text>
                <EditText regex={/^[a-zA-Z0-9-_\/]+$/} maxLength={100} placeholder={'matil'} hideInput={false} value={newHelpCenter.id} setValue={(value) => setNewHelpCenter((prev) => ({...prev, url_identifier:value}))}/>
            </Box>
            <Flex bg='brand.gray_2' p='20px' gap='10px' flexDir={'row-reverse'}>
                <Button  size='sm' variant={'main'} isDisabled={newHelpCenter.name === '' || newHelpCenter.id === '' || !(/^[a-zA-Z0-9-_\/]+$/).test(newHelpCenter.id)} onClick={createHelpCenter}>{waitingCreate?<LoadingIconButton/>:t('Edit')}</Button>
                <Button  size='sm' variant={'common'} onClick={()=> setShowEdit(false)}>{t('Cancel')}</Button>
            </Flex>
        </>)
    }

     //CREATE COLLECTION
     const memoizedCreateCollectionBox = useMemo(() => (
        <ConfirmBox  setShowBox={setShowCreateCollection}> 
            <CreateCollection/>
        </ConfirmBox>
    ), [showCreateCollection])

    //DELETE BOX
    const memoizedDeleteBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowDelete}> 
            <DeleteComponent/>
        </ConfirmBox>
    ), [showDelete])

    //EDIT BOX
    const memoizedEditBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowEdit}> 
            <AddComponent/>
        </ConfirmBox>
    ), [showEdit])

    const selectedCollectionsByLanguage = (collectionsData || []).filter(collection => collection.data[selectedLanguage]).map(col => col.data[selectedLanguage])

    return(<>
        {showCreateCollection && memoizedCreateCollectionBox}
        {showDelete && memoizedDeleteBox}
        {showEdit && memoizedEditBox}

        <Box> 
            <Flex justifyContent={'space-between'} alignItems={'end'}> 
                <Box> 
                    <EditText nameInput updateData={() => updateHelpCenter(helpCenterData as HelpCenterData)} fontSize={'1.5em'} size='md' value={helpCenterData?.name} setValue={(value) => setHelpCenterData(prev =>({...prev as HelpCenterData, name:value}))}/>
                </Box>
                <Flex gap='10px'> 
                    <ActionsButton isLanguage={false}/>
                    <Button  variant='common' size={'sm'} onClick={() => updateHelpCenter({...helpCenterData as HelpCenterData, is_live:!helpCenterData?.is_live })} leftIcon={<FaCircleDot color={helpCenterData?.is_live?'#68D391':'#ECC94B'}/>}>{helpCenterData?.is_live?t('IsLive'):t('NotIsLive')}</Button>
                </Flex>
            </Flex>
            <Flex mt='2vh' justifyContent={'space-between'} alignItems={'end'} mb='2vh'> 
                <Skeleton  isLoaded={(helpCenterData !== null && collectionsData !== null)}> 
                <SectionSelector selectedSection={currentSection} sections={sectionsList} sectionsMap={sectionsMap} onChange={() => setCurrentSection(prev => (prev === 'collections'?'styles':'collections'))}/>
                </Skeleton>
                {currentSection === 'styles' && <Button  variant='common' size={'sm'}  onClick={() => saveStyles(stylesRef.current as StylesConfig)}>{waitingStyles ? <LoadingIconButton/>: t('SaveChanges')}</Button>}
            </Flex>
            <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='3vh'/>
        </Box>
  
        <Box ref={stylesHeaderRef} flex='1' >
        {(currentSection === 'styles') ? 
        <Skeleton flex='1'  isLoaded={(helpCenterData !== null && collectionsData !== null)}>
            <EditStyles currentStyles={helpCenterData?.style as StylesConfig} currentCollections={selectedCollectionsByLanguage} publicArticlesData={publicArticlesData as ArticleData[]} stylesRef={stylesRef} stylesHeaderRef={stylesHeaderRef}/>
        </Skeleton>
        :
        <Box flex='1'>
            <Flex flexDir={'row-reverse'} justifyContent={'space-between'}>
                <Button leftIcon={<FaPlus/>} size='sm' onClick={() => setShowCreateCollection(true)} variant='common'>{t('AddCollection')}</Button>
                <ActionsButton isLanguage/>
            </Flex>
            <Skeleton isLoaded={collectionsData !== null && publicArticlesData !== null}>      
                {selectedCollectionsByLanguage?.length === 0 ?   
                    <Box bg='#f1f1f1' borderRadius={'.5rem'} mt='1vh' width='100%' borderColor={'gray.200'} borderWidth={'1px'} p='15px'>    
                        <Text fontWeight={'medium'} fontSize={'1.1em'}>{t('NoCollections')}</Text>
                    </Box>:<> 
                         <Box  mt='1vh'  >    
                            <Flex position={'sticky'}  borderTopRadius={'.5rem'} borderColor={'gray.200'} borderWidth={'1px'} gap='20px' ref={headerRef} alignItems={'center'}  color='gray.600' p='10px' fontSize={'1em'} bg='brand.gray_2' > 
                                <Text flex='3' color='gray.600' cursor='pointer'>{t('CollectionName')}</Text>
                                <Text flex='1' color='gray.600' cursor='pointer'>{t('NumberArticles')}</Text>
                                <Text flex='1' color='gray.600' cursor='pointer'>{t('Status')}</Text>
                            </Flex>
                        </Box>
                        <Box overflowX={'hidden'}  borderWidth={'1px'} borderRadius={'0 0 .5rem .5rem'} borderColor={'gray.200'} overflowY={'scroll'} maxH={boxHeight}> 
                            {collectionsData?.map((collection, index) => (
                                <CollectionComponent collection={collection} index={index} key={`collection-${index}`}/>
                            ))}
                        </Box>
                  
                </>}
            </Skeleton>
        </Box>
        }
        </Box>
    </>
    )
}

const EditStyles = ({currentStyles, currentCollections, stylesRef, publicArticlesData, stylesHeaderRef}:{currentStyles:StylesConfig,currentCollections:{name:string, icon:string, description:string}[], stylesRef:MutableRefObject<StylesConfig | null>, publicArticlesData:ArticleData[], stylesHeaderRef:RefObject<HTMLDivElement>}) => {

     //CONSTANTS
    const { t } = useTranslation('settings')
    const auth = useAuth()

    //SCROLL REF
    const containerRef = useRef<HTMLDivElement>(null)

    //STYLES DATA
    const [configStyles, setConfigStyles] = useState<StylesConfig>(Object.keys(currentStyles).length === 0?MatilStyles:currentStyles)
    useEffect(() => {stylesRef.current = configStyles},[configStyles])

    //CURRENT EXPANDED SECTION
    const [sectionExpanded, setSectionExpanded] = useState<sectionsTypes>('')

    return (
        <Flex height={window.innerHeight - window.innerWidth * 0.02 - (stylesHeaderRef.current?.getBoundingClientRect().top || 0)} flex='1' gap='30px' minHeight='0'>
             <Flex px='2px' minW={'450px'} flexDir={'column'} flex='3' maxH={'100%'}  overflow={'scroll'} ref={containerRef} >
                <CollapsableSection section={'common'} setSectionExpanded={setSectionExpanded} sectionExpanded={sectionExpanded}>
                    <Box mt='2vh'> 
                        <EditImage configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='favicon' title={t('FavIcon')} description={t('FavIconDes')} maxImageSize={150}  />
                    </Box>
                    
                    <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='gray.200'/>
                    <Text fontWeight={'medium'} mb='2vh'>{t('GlobalColors')}</Text>    
                    <EditColor configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='text_background' title={t('TextBackground')} description={t('TextBackgroundDes')} containerRef={containerRef}/>
                    <Box mt='2vh'> 
                        <EditColor configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='text_color' title={t('TextBackground')} description={t('TextBackgroundDes')} containerRef={containerRef}/>
                    </Box>
                    <Box mt='2vh'> 
                        <EditColor configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='actions_color' title={t('ActionsColor')} description={t('ActionsColorDes')} containerRef={containerRef}/>
                    </Box>
                    <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='gray.200'/>
                    <Text fontWeight={'medium'} mb='2vh'>{t('Cards')}</Text>    
                    <EditBool configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='floating_cards' title={t('CardsStyle')} description={t('CardsStyleDes')} />
                    {!configStyles.floating_cards && <Box mt='2vh'> 
                        <EditInt configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='cards_borderradius' title={t('BorderRadius')} min={0} max={24}/>
                    </Box>}
                </CollapsableSection>

                <CollapsableSection section={'header'} setSectionExpanded={setSectionExpanded} sectionExpanded={sectionExpanded} >
                    <Box mt='2vh'> 
                        <EditImage keyToEdit='logo' configStyles={configStyles} setConfigStyles={setConfigStyles} title={t('Logo')} description={t('LogoDes')} />
                    </Box>
                    <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='gray.200'/>
                    <EditStr keyToEdit='title' configStyles={configStyles} setConfigStyles={setConfigStyles} title={t('HeaderTitle')} description={t('HeaderTitleDes')} placeholder={t('HeaderTitlePlaceholder' ,{company:auth.authData.organizationName})}/>
                    
                    <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='gray.200'/>
                    
                    <Text  mb='2vh' fontWeight={'medium'}>{t('Background')}</Text>
                    <EditBool configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='show_header' title={t('ShowBackground')} />
                    {configStyles.show_header && <Box mt='2vh' maxW={'200px'}> 
                        <EditColor configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='header_background' title={t('BackgroundColor')} containerRef={containerRef}/>
                        <Box mt='2vh'> 
                            <EditColor configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='header_color' title={t('TextColor')} containerRef={containerRef}/>
                        </Box>                    
                    </Box>}

                    <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='gray.200'/>
                    <EditLinks configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='links' title={t('Links')} description={t('LinksDes')} />
                </CollapsableSection>

                <CollapsableSection section={'hero'} setSectionExpanded={setSectionExpanded} sectionExpanded={sectionExpanded}>
                    <Box mt='2vh'> 
                        <EditStr keyToEdit='welcome_message' configStyles={configStyles} setConfigStyles={setConfigStyles} title={t('WelcomeMessage')} placeholder={t('WelcomeMessagePlaceholder' ,{company:auth.authData.organizationName})}/>
                    </Box>
                    <Box mt='2vh'> 
                        <EditStr keyToEdit='search_placeholder' configStyles={configStyles} setConfigStyles={setConfigStyles} title={t('PlaceholderMessage')} placeholder={t('PlaceholderPlaceholderMessage' ,{company:auth.authData.organizationName})}/>
                    </Box>
                    <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='gray.200'/>
                    <Text  mb='2vh' fontWeight={'medium'}>{t('Background')}</Text>
                    <EditBool keyToEdit='show_image' configStyles={configStyles} setConfigStyles={setConfigStyles} title={t('ShowHeroImage')} />
                     <Box mt='2vh'>
                        {configStyles.show_image ? 
                        <EditImage keyToEdit='hero_image' configStyles={configStyles} setConfigStyles={setConfigStyles} title={t('HeroImage')} description={t('HeroImageDes')} />
                        :
                        <EditColor keyToEdit='hero_background' configStyles={configStyles} setConfigStyles={setConfigStyles} title={t('BackgroundColor')} isGradient containerRef={containerRef}/>
                        }
                    </Box>
                    <Box mt='2vh'>
                        <EditBool keyToEdit='blurred_hero' configStyles={configStyles} setConfigStyles={setConfigStyles} title={t('BlurredHero')}/>
                    </Box>

                    <Box height={'1px'} mt='2vh' width={'100%'} bg='gray.200'/>
                    <Box mt='2vh'>
                        <EditColor keyToEdit='hero_color' configStyles={configStyles} setConfigStyles={setConfigStyles} title={t('TextColor')} containerRef={containerRef}/>
                    </Box>
                 
                </CollapsableSection>

                <CollapsableSection section={'collections'} setSectionExpanded={setSectionExpanded} sectionExpanded={sectionExpanded}>
                    <EditCollections configStyles={configStyles} setConfigStyles={setConfigStyles}  containerRef={containerRef}/>
                </CollapsableSection>

                <CollapsableSection section={'sections'} setSectionExpanded={setSectionExpanded} sectionExpanded={sectionExpanded}>
                    <Text  fontSize={'1.2em'} fontWeight={'medium'} mt='2vh' mb='2vh'>{t('ArticlesSection')}</Text>
                    <EditBool configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='show_article_section' title={t('ShowArticles')} />
                    {configStyles.show_article_section && <EditArticles configStyles={configStyles} setConfigStyles={setConfigStyles}  containerRef={containerRef} publicArticlesData={publicArticlesData}/>}
                    <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='gray.200'/>
                    <Text  mb='2vh' fontSize={'1.2em'} fontWeight={'medium'}>{t('Content')}</Text>
                    <EditBool configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='show_content_section' title={t('ShowContent')} />
                    {configStyles.show_content_section && <>
                        <Box mt='2vh'> 
                            <EditStr configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='content_section_title' title={t('ContentTitle')} placeholder={t('ContentTitle')} />
                        </Box>
                        <Box mt='2vh'> 
                            <EditStr configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='content_section_description' title={t('Description')} placeholder={t('Description')}/>
                        </Box>

                        <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='gray.200'/>
                        <Text  mb='2vh' fontWeight={'medium'}>{t('Button')}</Text>
                        <EditBool configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='content_section_add_button' title={t('AddButton')} />
                
                        {configStyles.show_content_section && <>
                            <Box mt='2vh'> 
                                <EditStr configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='content_section_button_title' title={t('ButtonTitle')} placeholder={t('ButtonTitle')}/>
                            </Box>
                            <Box mt='2vh'> 
                                <EditStr configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='content_section_button_link' title={t('ButtonLink')} placeholder={'https://matil.ai'}/>
                            </Box>
                            <Box mt='2vh'> 
                                <EditColor configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='content_section_button_background' title={t('ButtonBackground')} containerRef={containerRef}/>
                            </Box>
                            <Box mt='2vh'> 
                                <EditColor configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='content_section_button_color' title={t('ButtonColor2')} containerRef={containerRef}/>
                            </Box>
                            <Box mt='2vh'> 
                                <EditInt configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='content_section_button_borderradius' title={t('ButtonBorderRadius')} min={0} max={24}/>
                            </Box>
                        </>}
                        <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='gray.200'/>
                        <Text  mb='2vh' fontWeight={'medium'}>{t('Styles')}</Text>
                        <EditBool configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='content_section_is_card' title={t('IsContentCard')} />
                        <Box mt='2vh'> 
                            <EditBool configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='content_section_show_background_image' title={t('ShowBackgroundImage')} />
                        </Box>
                        <Box mt='2vh'> 
                            {configStyles.content_section_show_background_image ? 
                                <EditImage configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='content_section_background_image' title={t('BackgroundImage')} maxImageSize={1000} />
                                :
                                <EditColor configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='content_section_background' title={t('BackgroundColor')}  containerRef={containerRef} isGradient/> 
                            }    
                        </Box>
                        <Box mt='2vh'> 
                            <EditColor configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='content_section_text_color' title={t('TextColor')}  containerRef={containerRef} /> 
                        </Box>

                    </>}
                </CollapsableSection>

                <CollapsableSection section={'footer'} setSectionExpanded={setSectionExpanded} sectionExpanded={sectionExpanded}>
                    <Box mt='2vh'> 
                        <EditStr configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='footer_message' title={t('FooterMessage')} />
                    </Box>
                    <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='gray.200'/>
                    <Text  mb='2vh' fontWeight={'medium'}>{t('Colors')}</Text>
                    <EditColor configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='footer_background' title={t('BackgroundColor')} containerRef={containerRef}/>
                    <Box mt='2vh'> 
                        <EditColor configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='footer_color' title={t('TextColor')} containerRef={containerRef}/>
                    </Box>  
                    <Box mt='2vh'> 
                        <EditSocialNetworks configStyles={configStyles} setConfigStyles={setConfigStyles}/>
                    </Box>  
                </CollapsableSection>
                
            </Flex>
            <Box flex='5' width={'calc(100% + 2vw)'}  height={'calc(100% + 2vw)'} bg='brand.gray_2' borderRadius={'.7rem 0 0 0'} p='15px'>
                <Box width={'100%'} height={'100%'} overflowY={'scroll'} borderRadius={'.5rem'} overflow={'hidden'}>
                    <GetHelpCenter configStyles={configStyles} currentCollections={currentCollections}/>
                </Box>
            </Box>
        </Flex>
    )
}

const CollapsableSection = ({section, sectionExpanded, setSectionExpanded, children}:{section:sectionsTypes, sectionExpanded:sectionsTypes, setSectionExpanded:Dispatch<SetStateAction<sectionsTypes>>, children:ReactNode}) => {

    const { t } = useTranslation('settings')
    const isExpanded = sectionExpanded === section
    const [isHovering, setIsHovering] = useState<boolean>(false)

    return (
        <Box p='20px'  bg={(isExpanded || isHovering) ?'white':'#FDFDFD'}  width={'100%'} mb='3vh'  borderWidth={'1px'} borderColor={(isExpanded || isHovering) ? 'brand.text_blue':'gray.300'} borderRadius={'.5rem'} shadow={(isExpanded || isHovering)?'md':'sm'} transition={'box-shadow 0.3s ease-in-out, background-color 0.3s ease-in-out,border-color 0.3s ease-in-out'} onMouseEnter={() => setIsHovering(true)}  onMouseLeave={() => setIsHovering(false)}  >
            <Flex cursor={'pointer'} alignItems={'center'} justifyContent={'space-between'} onClick={() => setSectionExpanded(isExpanded?'':section)}>
                <Text color={(isHovering && !isExpanded)?'brand.text_blue':'black'} fontWeight={'medium'} fontSize={'1.2em'}>{t(section)}</Text>
                <IoIosArrowDown color={(isExpanded || isHovering) ? 'rgb(59, 90, 246)':'gray.600'} className={isExpanded ? "rotate-icon-up" : "rotate-icon-down"}/>
            </Flex>
            <motion.div initial={false} animate={{height:isExpanded?'auto':0}} exit={{height:isExpanded?0:'auto'}} transition={{duration:.3}} style={{overflow:'hidden'}} >           
                {children}
            </motion.div>
        </Box>
    )
}

const EditStr = ({keyToEdit,  title, configStyles, setConfigStyles, description, placeholder}:{keyToEdit:keyof StylesConfig, configStyles:StylesConfig, setConfigStyles:Dispatch<SetStateAction<StylesConfig>>, title:string, description?:string, placeholder?:string}) => {
        
    const [hoverDescription, setHoverDescription] = useState<boolean>(false)

    return (<> 
        <Flex  gap='5px'> 
            <Text fontWeight={'medium'} fontSize={'.9em'}>{title}</Text>
            {description && <Tooltip isOpen={hoverDescription} label={description} mt='-4px' placement='right' hasArrow bg='brand.black_button'  borderRadius='.4rem'  fontSize='.7em' color='white' p='6px' >
                <Box onMouseEnter={() => setHoverDescription(true)} onMouseLeave={() => setHoverDescription(false)}> 
                    <Icon as={FaQuestionCircle} mt='3px' color='#222'  />
                </Box>
            </Tooltip>}
        </Flex>
        <Box width='300px' mt='.5vh'> 
            <EditText placeholder={placeholder} hideInput={false} value={configStyles[keyToEdit] as string} setValue={(val) => setConfigStyles(prev => ({...prev as StylesConfig, [keyToEdit]:val}))}/>
        </Box>
    </>)
}

const EditBool = ({keyToEdit, configStyles, setConfigStyles, title, description}:{keyToEdit:keyof StylesConfig, configStyles:StylesConfig, setConfigStyles:Dispatch<SetStateAction<StylesConfig>>,title:string, description?:string}) => {
    const [hoverDescription, setHoverDescription] = useState<boolean>(false)

    return (<>
      <Flex gap='8px' alignItems={'center'}>
            <Switch isChecked={configStyles[keyToEdit] as boolean}  onChange={(e) => setConfigStyles(prev => ({...prev as StylesConfig, [keyToEdit]:e.target.checked}))} />
            <Flex mt='3px'  gap='5px'> 
                <Text fontWeight={'medium'} fontSize={'.9em'}>{title}</Text>
                {description && <Tooltip isOpen={hoverDescription} label={description} mt='-4px' placement='right' hasArrow bg='brand.black_button'  borderRadius='.4rem' fontSize='.7em' color='white' p='6px' >
                    <Box onMouseEnter={() => setHoverDescription(true)} onMouseLeave={() => setHoverDescription(false)}> 
                        <Icon as={FaQuestionCircle} mt='3px' color='#222'  />
                    </Box>
                </Tooltip>}
            </Flex>
        </Flex>
    </>)
}

const EditInt = ({keyToEdit,  title,configStyles, setConfigStyles, description, max, min, unit = 'px'}:{keyToEdit:keyof StylesConfig, configStyles:StylesConfig, setConfigStyles:Dispatch<SetStateAction<StylesConfig>>, title:string, description?:string, max:number, min:number, unit?:string}) => {
    const [hoverDescription, setHoverDescription] = useState<boolean>(false)

    return(<>
        <Flex  gap='5px'> 
            <Text fontWeight={'medium'} fontSize={'.9em'}>{title}</Text>
            {description && <Tooltip isOpen={hoverDescription} label={description} mt='-4px' placement='right' hasArrow bg='brand.black_button'  borderRadius='.4rem' fontSize='.7em' color='white' p='6px' >
                <Box onMouseEnter={() => setHoverDescription(true)} onMouseLeave={() => setHoverDescription(false)}> 
                    <Icon as={FaQuestionCircle} mt='3px' color='#222'  />
                </Box>
            </Tooltip>}
        </Flex>
        <Flex alignItems={'center'} fontWeight={'medium'} gap='10px'> 
            <NumberInput width={50 + max/10 * 15} size='sm' mt='.5vh' value={String(configStyles[keyToEdit])} onChange={(val) => setConfigStyles(prev => ({...prev as StylesConfig, [keyToEdit]:val}))}  min={min} max={max}>
                <NumberInputField  fontSize={'.9em'} borderRadius='.5rem'   borderColor={'gray.300'} _hover={{ border: '1px solid #CBD5E0' }} _focus={{ borderColor: 'rgb(77, 144, 254)', borderWidth: '2px', px:'6px' }} px='7px' />
                    <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>
            <Text color='gray.600' >{unit}</Text>
        </Flex>
    </>)
}

const EditColor = ({keyToEdit, title,configStyles, setConfigStyles,description, isGradient = false, containerRef}:{keyToEdit:keyof StylesConfig, configStyles:StylesConfig, setConfigStyles:Dispatch<SetStateAction<StylesConfig>>, title:string, description?:string, isGradient?:boolean, containerRef:RefObject<HTMLDivElement>}) => {
    const [hoverDescription, setHoverDescription] = useState<boolean>(false)

    return(<>
        <Flex  gap='5px'> 
            <Text fontWeight={'medium'} fontSize={'.9em'}>{title}</Text>
            {description &&<Tooltip isOpen={hoverDescription} label={description} mt='-4px' placement='right' hasArrow bg='brand.black_button'  borderRadius='.4rem' fontSize='.7em' color='white' p='6px' >
                <Box onMouseEnter={() => setHoverDescription(true)} onMouseLeave={() => setHoverDescription(false)}> 
                    <Icon as={FaQuestionCircle} mt='3px' color='#222'  />
                </Box>
            </Tooltip>}
        </Flex>
        <Flex alignItems={'center'} gap='10px'> 
            <Box flex='1' > 
                <ColorPicker containerRef={containerRef} color={isGradient ? (configStyles[keyToEdit] as string[])[0]:configStyles[keyToEdit] as string} 
                setColor={(value) => {setConfigStyles(prev => ({ ...prev as StylesConfig, [keyToEdit]: isGradient ? [ value, (prev[keyToEdit] as string[])[1]]:value }))}}/>
            </Box>

            {isGradient && <> <Icon boxSize={'25px'} color='gray.400'  as={IoMdArrowRoundForward}/>
            <Box flex='1' > 
                <ColorPicker containerRef={containerRef} color={isGradient ? (configStyles[keyToEdit] as string[])[1]:configStyles[keyToEdit] as string} 
                setColor={(value) => {setConfigStyles(prev => ({ ...prev as StylesConfig, [keyToEdit]: [ (prev[keyToEdit] as string[])[0], value] }))}}/>
            </Box></>}
        </Flex>
    </>)
}   
 
const EditImage = ({keyToEdit,  title, configStyles, setConfigStyles, description, maxImageSize = 2000}:{keyToEdit:keyof StylesConfig,configStyles:StylesConfig, setConfigStyles:Dispatch<SetStateAction<StylesConfig>>,  title:string, description?:string, maxImageSize?:number }) => {
    const [hoverDescription, setHoverDescription] = useState<boolean>(false)

    return(<>
        <Flex  gap='5px'> 
            <Text fontWeight={'medium'}fontSize={'.9em'}>{title}</Text>
            {description && <Tooltip isOpen={hoverDescription} label={description} mt='-4px' placement='right' hasArrow bg='brand.black_button'  borderRadius='.4rem' fontSize='.7em' color='white' p='6px' >
                <Box onMouseEnter={() => setHoverDescription(true)} onMouseLeave={() => setHoverDescription(false)}> 
                    <Icon as={FaQuestionCircle} mt='3px' color='#222'  />
                </Box>
            </Tooltip>}
        </Flex>
        <Box width='300px' mt='.5vh'> 
            <ImageUpload maxImageSize={maxImageSize} id={title} initialImage={configStyles[keyToEdit] as string} onImageUpdate={(file) => {setConfigStyles((prev) => ({...prev as StylesConfig,[keyToEdit]: file ? URL.createObjectURL(file) : ''}))}}/>
        </Box>
    </>)
}

const EditLinks = ({keyToEdit,  title, configStyles, setConfigStyles, description}:{keyToEdit:keyof StylesConfig,configStyles:StylesConfig, setConfigStyles:Dispatch<SetStateAction<StylesConfig>>,  title:string, description?:string }) => {
    
    const { t } = useTranslation('settings')
    const [hoverDescription, setHoverDescription] = useState<boolean>(false)

    const handleEditTag = (index: number, newTag: string) => {
        const updatedLinks = [...configStyles[keyToEdit] as {tag:string, url:string}[]];
        updatedLinks[index].tag = newTag
        setConfigStyles(prev => ({ ...prev, [keyToEdit]: updatedLinks }))
    }
      const handleEditUrl = (index: number, newUrl: string) => {
        const updatedLinks = [...configStyles[keyToEdit] as {tag:string, url:string}[]]
        updatedLinks[index].url = newUrl
        setConfigStyles(prev => ({ ...prev, [keyToEdit]: updatedLinks }))
      }
      const handleDeleteLink = (index: number) => {
        const updatedLinks = [...configStyles[keyToEdit] as {tag:string, url:string}[]];
        updatedLinks.splice(index, 1)
        setConfigStyles(prev => ({ ...prev, [keyToEdit]: updatedLinks }))
      }
      const handleAddLink = () => {setConfigStyles(prev => ({ ...prev, [keyToEdit]: [...configStyles[keyToEdit] as {tag:string, url:string}[], { tag: '', url: '' }] }))}

    return(<>
        <Flex gap='5px'> 
            <Text fontWeight={'medium'} fontSize={'.9em'}>{title}</Text>
            {description && <Tooltip isOpen={hoverDescription} label={description} mt='-4px' placement='right' hasArrow bg='brand.black_button'  borderRadius='.4rem'  fontSize='.7em' color='white' p='6px' >
                <Box onMouseEnter={() => setHoverDescription(true)} onMouseLeave={() => setHoverDescription(false)}> 
                    <Icon as={FaQuestionCircle} mt='3px' color='#222'  />
                </Box>
            </Tooltip>}
        </Flex>
     
 
        {(configStyles[keyToEdit] as {tag:string, url:string}[]).map((link, index) => (
          <Flex mt='1vh' width={'100%'} alignItems={'end'} key={`links-${index}`} gap='10px'>
            <Box flex='1'>
                {index === 0 && <Text mb='1vh' color='gray.600' fontSize={'.9em'}>{t('Title')}</Text>}
                <EditText hideInput={false} value={link.tag} placeholder={'Tag'} setValue={(newValue: string) => handleEditTag(index, newValue)}/>
            </Box>
            <Box flex='1'>
                {index === 0 &&<Text  mb='1vh' color='gray.600' fontSize={'.9em'}>{t('URL')}</Text>}
                <EditText regex={/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/[^\s]*)?$/} hideInput={false}value={link.url}placeholder={'Link'} setValue={(newValue: string) => handleEditUrl(index, newValue)}/>
            </Box>
            <IconButton mt={index===0?'1vh':''} bg='transparent' border='none' size='sm' _hover={{ bg: 'gray.200' }} icon={<RxCross2 />} aria-label='delete-link' onClick={() => handleDeleteLink(index)}/>
          </Flex>
        ))}
        
        <Button mt='2vh' size='xs' variant={'common'} leftIcon={<FaPlus/>} isDisabled={Object.keys(configStyles[keyToEdit]).length === 3} onClick={handleAddLink}>{t('AddLink')}</Button>
        
    </>)
}

const EditSocialNetworks = ({configStyles, setConfigStyles}:{configStyles:StylesConfig, setConfigStyles:Dispatch<SetStateAction<StylesConfig>>}) => {
    
    const { t } = useTranslation('settings')
 
 
    const options: socialNetworks[] = ["facebook", "x", "instagram", "linkedin", "youtube", "tiktok", "pinterest", "github", "reddit", "discord", "twitch", "telegram", "spotify"]
    const socialIconsMap:{[key in socialNetworks]:[string, IconType]} = {facebook: ["Facebook", FaFacebook],x: ["X", TbBrandX], instagram: ["Instagram", FaInstagram],linkedin: ["LinkedIn", FaLinkedin],youtube: ["YouTube", FaYoutube], tiktok: ["TikTok", FaTiktok], pinterest: ["Pinterest", FaPinterest], github: ["GitHub", FaGithub], reddit: ["Reddit", FaReddit], discord: ["Discord", FaDiscord], twitch: ["Twitch", FaTwitch], telegram: ["Telegram", FaTelegram], spotify: ["Spotify", FaSpotify]}
 
    const boxRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)

    //DETERMINE THE TOOLS BOX POSOTION
    const [settingsBoxPosition, setSettingsBoxPosition] = useState<{top?:number, bottom?:number, left:number} | null>(null)
    useOutsideClick({ref1:boxRef, ref2:buttonRef, onOutsideClick:(b:boolean) => setSettingsBoxPosition(null)})
    const determineBoxPosition = () => {
        const boxLeft = (buttonRef.current?.getBoundingClientRect().left || 0) 
        const isTop = (buttonRef.current?.getBoundingClientRect().bottom || 0) > window.innerHeight/2 
        if (!isTop) setSettingsBoxPosition({top:(buttonRef.current?.getBoundingClientRect().bottom || 0) + 5, left:boxLeft})
        else setSettingsBoxPosition({bottom:window.innerHeight - (buttonRef.current?.getBoundingClientRect().top || 0) + 5, left:boxLeft})
    }

    const handleEditUrl = (key:socialNetworks, newValue: string) =>  {setConfigStyles(prev => ({ ...prev as StylesConfig, social_networks: {...prev.social_networks, [key]:newValue} }))}
    const handleDeleteLink = (key: socialNetworks) => {
        const updatedSocialNetworks = {...configStyles.social_networks}
        delete updatedSocialNetworks[key]
        setConfigStyles(prev => ({ ...prev, social_networks: updatedSocialNetworks }))
    }
    const handleAddLink = (key: socialNetworks) => {
        setConfigStyles(prev => ({ ...prev, social_networks: {...configStyles.social_networks, [key]:''} }))
        setSettingsBoxPosition(null)
    }

    return(<>
        <Flex gap='5px'> 
            <Text fontWeight={'medium'} fontSize={'.9em'}>{t('SocialNetworkButtons')}</Text>
        </Flex>
        {Object.keys(configStyles.social_networks).map((company, index) => (
        <Flex  width={'100%'} key={`link-edit-${index}`} alignItems={'center'} gap='10px' mt='1vh' >
            <Flex  >
                <Flex alignItems={'center'} px='5px' color='gray.600' borderRadius={'.5rem 0 0 .5rem'}  borderWidth={'1px 0px 1px 1px'} borderColor={'gray.300'} flex='4    ' bg='brand.gray_2'>
                    <Text fontSize={'.8em'}>{`https://${company}.com/`}</Text>
                </Flex>
                <Box flex='5'>
                    <EditText borderRadius={'0 .5rem .5rem 0'} hideInput={false} value={configStyles.social_networks[company]}  setValue={(newValue: string) => handleEditUrl(company as socialNetworks, newValue)}/>
                </Box>
            </Flex>
            <IconButton bg='transparent' border='none' size='sm' _hover={{ bg: 'gray.200' }} icon={<RxCross2 />} aria-label='delete-link' onClick={() => handleDeleteLink(company as socialNetworks)}/>

          </Flex>
        ))}
        <Button ref={buttonRef} mt='2vh' size='xs' variant={'common'} leftIcon={<FaPlus/>} onClick={determineBoxPosition}>{t('AddSocialNetwork')}</Button>
       {settingsBoxPosition && 
       <Portal> 
            <MotionBox ref={boxRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                style={{ transformOrigin: settingsBoxPosition.top ? 'top left':'bottom left' }} maxH={'45vh'} overflow={'scroll'} left={settingsBoxPosition.left}  top={settingsBoxPosition.top || undefined}  bottom={settingsBoxPosition.bottom ||undefined} position='absolute' bg='white' p='8px'  zIndex={1000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='gray.200' borderWidth='1px' borderRadius='.7rem'>

                {options.filter(option => !Object.keys(configStyles.social_networks).includes(option)).map((option, index) =>( 
                    <Flex px='15px' key={`social-network-edit-${index}`} borderRadius='.5rem' onClick={() => handleAddLink(option)} py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'brand.gray_2'}}>
                        <Icon as={socialIconsMap[option][1]}/>
                        <Text whiteSpace={'nowrap'}>{socialIconsMap[option][0]}</Text>
                    </Flex>
                ))}
                
            </MotionBox >
        </Portal>}
    </>)
}

const EditCollections = ({configStyles, setConfigStyles, containerRef}:{configStyles:StylesConfig, setConfigStyles:Dispatch<SetStateAction<StylesConfig>>, containerRef:RefObject<HTMLDivElement>}) => {
    
    const { t } = useTranslation('settings')
  
    return(<>
        <Box mt='2vh'> 
            <EditBool configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='show_collections' title={t('ShowCollections')} />
        </Box>

        {configStyles.show_collections && <>
            <Text mb='.5vh'  mt='2vh' fontSize={'.9em'} fontWeight={'medium'}>{t('Columns')}</Text>
            <SectionSelector selectedSection={configStyles.collections_columns} sections={[1,2,3]} sectionsMap={{'1':[t('Column', {count:1}),<GetColumsIcon count={1}/>], '2':[t('Column', {count:2}),<GetColumsIcon count={2}/>], '3':[t('Column', {count:3}),<GetColumsIcon count={3}/>]}} onChange={(value) => setConfigStyles(prev => ({...prev as StylesConfig, collections_columns:value} ))}/>
            <Box mt='2vh' mb='2vh'>
                <Text mb='.5vh' fontSize={'.9em'} fontWeight={'medium'}>{t('CollectionAlign')}</Text>
                <SectionSelector selectedSection={configStyles.collections_icons_text_align} sections={['row','column']} sectionsMap={{'row':[t('Horizontal', {count:1}),<GetColumsIcon count={2}  />], 'column':[t('Vertical', {count:2}),<GetColumsIcon count={2} isVertical/>]}} onChange={(value) => setConfigStyles(prev => ({...prev as StylesConfig, collections_icons_text_align:value} ))}/>
            </Box>
            <EditBool configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='show_collections_description' title={t('ShowDescriptions')} />

            <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='gray.200'/>
            <Text  mb='2vh' fontWeight={'medium'}>{t('Icons')}</Text>
            
            <EditBool configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='show_icons' title={t('ShowIcons')} />
            {configStyles.show_icons && <>
                <Box mt='2vh' > 
                    <EditColor configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='icons_color' title={t('IconsColor')} containerRef={containerRef}/>
                </Box>
                <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='gray.200'/>
                <Text  mb='2vh' fontWeight={'medium'}>{t('IconsBackground')}</Text>
            
                <Box mt='2vh'> 
                    <EditBool configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='show_icons_background' title={t('ShowIconsBackground')} />
                </Box>
            
                {configStyles.show_icons_background && <>
                    <Box mt='2vh'> 
                        <EditBool configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='show_icons_background_image' title={t('ShowIconsBackgroundImage')} />
                    </Box>
                    <Box mt='2vh'> 
                        {configStyles.show_icons_background_image ? 
                            <EditImage configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='icons_background_image' title={t('IconsBackgroundImage')} maxImageSize={1000} />
                            :
                            <EditColor configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='icons_background_color' title={t('IconsBackgroundColor')}  containerRef={containerRef} isGradient/> 
                        }    
                    </Box>
                </>}
            </>}
        </>}
    </>)
}

const EditArticles = ({configStyles, setConfigStyles, containerRef, publicArticlesData}:{configStyles:StylesConfig, setConfigStyles:Dispatch<SetStateAction<StylesConfig>>, containerRef:RefObject<HTMLDivElement>, publicArticlesData:ArticleData[]}) => {
    
    const { t } = useTranslation('settings')
  
    const filterdArticles = publicArticlesData.filter(art => art.public_article_status === "published")

     const boxRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [articlesBoxPosition, setArticlesBoxPosition] = useState<{top?:number, bottom?:number, left:number} | null>(null)
    useOutsideClick({ref1:boxRef, ref2:buttonRef, onOutsideClick:(b:boolean) => setArticlesBoxPosition(null), containerRef})
    const determineBoxPosition = () => {
        const boxLeft = (buttonRef.current?.getBoundingClientRect().left || 0) 
        const isTop = (buttonRef.current?.getBoundingClientRect().bottom || 0) > window.innerHeight/2 
        if (!isTop) setArticlesBoxPosition({top:(buttonRef.current?.getBoundingClientRect().bottom || 0) + 5, left:boxLeft})
        else setArticlesBoxPosition({bottom:window.innerHeight - (buttonRef.current?.getBoundingClientRect().top || 0) + 5, left:boxLeft})
    }   
    const addColumn = (art:{name:string, uuid:string, description:string}) => {
        setConfigStyles(prev => ({...prev, article_section:[...prev.article_section, art]}))
        setArticlesBoxPosition(null)
    }
    const removeColumn = (index: number) => {
        const newArticles = [...configStyles.article_section]
        newArticles.splice(index, 1);
        setConfigStyles(prev => ({...prev, article_section:newArticles}))
    }
    const onDragEnd = (result:any) => {
        if (!result.destination) return
        const items = [...configStyles.article_section]
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)
        setConfigStyles(prev => ({...prev, article_section:items}))
      }

    const selectableArticles = filterdArticles.filter(art => !configStyles.article_section.some(item => item.uuid === art.uuid))

    return(<>
        <Box mt='2vh'> 
            <EditStr configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='article_section_title' title={t('ArticleTitle')} />
        </Box>
        <Box mt='2vh' >
            <Text mb='.5vh' fontSize={'.9em'} fontWeight={'medium'}>{t('ArticleColumns')}</Text>
            <SectionSelector selectedSection={configStyles.article_section_columns} sections={[1,2,3]} sectionsMap={{'1':[t('Column', {count:1}),<GetColumsIcon count={1}/>], '2':[t('Column', {count:2}),<GetColumsIcon count={2}/>], '3':[t('Column', {count:3}),<GetColumsIcon count={3}/>]}} onChange={(value) => setConfigStyles(prev => ({...prev as StylesConfig, article_section_columns:value} ))}/>
        </Box>
        <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='gray.200'/>
        <Text  fontWeight={'medium'} >{t('Articles')}</Text>
        
         <DragDropContext onDragEnd={onDragEnd} autoScrollerOptions={{disabled:true}}>
            <Droppable droppableId="columns" direction="vertical">
                    {(provided) => (
                        <Box ref={provided.innerRef}  {...provided.droppableProps} >
                            {configStyles.article_section.map((art, index) => (
                                <Draggable  key={`column-view-${index}`} draggableId={`column-view-${index}`} index={index}>
                                    {(provided, snapshot) => (
                                        <Flex ref={provided.innerRef} alignItems="center" gap='20px' {...provided.draggableProps} {...provided.dragHandleProps}   boxShadow={snapshot.isDragging?'0 4px 8px rgba(0, 0, 0, 0.3)':'none'}  flex='1' minW='300px' justifyContent={'space-between'}  mt='.5vh' bg='brand.gray_2' borderRadius={'.5rem'} borderColor='gray.200' borderWidth={'1px'} p='5px'>
                                            <Flex gap='10px'> 
                                                <Text fontWeight={'medium'} fontSize={'.9em'}>{art.name}</Text>
                                            </Flex>
                                            <IconButton aria-label='delete-collection'  bg='transparent' size='xs' variant={'delete'} icon={<HiTrash size='16px'/>}onClick={() => removeColumn(index)}/>
                                        </Flex>)}
                                </Draggable>
                            ))}  
                        {provided.placeholder}
                        </Box>
                    )}
                </Droppable>
        </DragDropContext>
         
        <Button ref={buttonRef} onClick={determineBoxPosition} size='sm' variant={'common'} leftIcon={<FaPlus/>} mt='2vh'>{t('AddArticle')}</Button>
        {articlesBoxPosition && 
            <Portal> 
                <MotionBox ref={boxRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                    style={{ transformOrigin: articlesBoxPosition.top ? 'top left':'bottom left' }} maxH={'45vh'} minW={buttonRef.current?.getBoundingClientRect().width} overflow={'scroll'} left={articlesBoxPosition.left}  top={articlesBoxPosition.top || undefined}  bottom={articlesBoxPosition.bottom ||undefined} position='absolute' bg='white' p='8px'  zIndex={1000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='gray.200' borderWidth='1px' borderRadius='.7rem'>
                        {selectableArticles.length === 0 ?<Text>{t('NoMorePublishedArticles')}</Text>:<> 
                        {filterdArticles.filter(art => !configStyles.article_section.some(item => item.uuid === art.uuid)).map((art, index) => (
                            <Flex px='15px' key={`social-network-${index}`} borderRadius='.5rem' onClick={() => addColumn({name:art.title, uuid:art.uuid, description:art.description})} py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'brand.gray_2'}}>
                                <Text fontSize={'.9em'} whiteSpace={'nowrap'}>{art.title}</Text>
                            </Flex>
                            ))}        
                        </>}
                </MotionBox >
        </Portal>}
    </>)
}


const GetHelpCenter = ({configStyles, currentCollections}:{configStyles:StylesConfig, currentCollections:{name:string, icon:string, description:string}[]}) => {

    const socialIconsMap:{[key in socialNetworks]:[string, IconType]} = {facebook: ["Facebook", FaFacebook],x: ["X", TbBrandX], instagram: ["Instagram", FaInstagram],linkedin: ["LinkedIn", FaLinkedin],youtube: ["YouTube", FaYoutube], tiktok: ["TikTok", FaTiktok], pinterest: ["Pinterest", FaPinterest], github: ["GitHub", FaGithub], reddit: ["Reddit", FaReddit], discord: ["Discord", FaDiscord], twitch: ["Twitch", FaTwitch], telegram: ["Telegram", FaTelegram], spotify: ["Spotify", FaSpotify]}

    const getHoverColor = (bgColor:string) => {
        if (bgColor === 'white' || bgColor === '#ffffff' || bgColor === 'rgba(255, 255, 255, 1)') return '#d3d3d3'
        else if (bgColor === 'black' || bgColor === '#000000' || bgColor === 'rgba(0, 0, 0, 1)') return 'rgba(255, 255, 255, 0.1)'
        return 'rgba(255, 255, 255, 0.5)'
    }

    //SHOW MENU ON MOBILE SCREEN
    const [showMenu, setShowMenu] = useState<boolean>(false)

    //AVAILABLE LANGUAGES
    const [availableLanguages, setAvailableLanguages] = useState<string[]>([])

    //IS COMPUTER WIDTH
    const [isComputerWidth, setIsComputerWidth] = useState(true)

    const LanguageSelector = ({availableLanguages, color}:{availableLanguages:string[], color:string}) => {
        const languagesDict = {'es':'Español', 'en':'English', 'fr':'François'}
        return (
            <Flex cursor={'pointer'}  position={'relative'} alignItems={'center'} gap='5px' color={color}>
                <Icon as={TbWorld}/>
                <Text>{(languagesDict as any)['es']}</Text>
                <IoIosArrowDown />
            </Flex>
        )
    }

    return (
    <Box width={'100%'} height={'100%'} overflow={'scroll'}> 
        <Box position="fixed" top={0} left={0} width="100vw" onClick={() => setShowMenu(false)} height="100vh" bg="rgba(0, 0, 0, 0.4)"  zIndex={99999} opacity={showMenu && !isComputerWidth ? 1 : 0}  pointerEvents={showMenu && !isComputerWidth ? 'auto' : 'none'} transition="opacity 0.3s ease"/>
        <Box p='25px' onClick={(e) => e.stopPropagation()} position='fixed' top={0} zIndex={100000} right={0} width={'100%'} opacity={(showMenu && !isComputerWidth)?1:0} bg={configStyles?.header_background} pointerEvents={showMenu && !isComputerWidth?'auto':'none'} >
            <Flex justifyContent={'end'}>
                <Icon aria-label='menu' as={RxCross2} color={configStyles?.header_color} boxSize={'25px'} cursor='pointer' onClick={()=>setShowMenu(false)}/>
            </Flex>
            <Box> 
            {configStyles?.links.map((link, index) => (
                <Link mb='10px' fontWeight={'600'} href={link.url} key={`link-2-${index}`} color={configStyles?.header_color}     display="block">
                    {link.tag}
                </Link>
            ))}
            <LanguageSelector availableLanguages={availableLanguages} color={configStyles?.header_color as string}/>
            </Box>
        </Box>

        <Box  width={'100%'} height={'100%'} borderRadius={'.3rem'} position={'relative'}>
            <Flex backgroundColor={configStyles?.text_background} flexDir={'column'}  minH={'100%'}>
                
                {/* Header */}
                <Flex justifyContent={'center'} height={'60px'} zIndex={10} backgroundColor={configStyles?.show_header ? configStyles.header_background:'transparent'} position={'absolute'} width={'100%'} color={configStyles?.header_color} alignItems={'center'}  px='20px' >
                    <Flex width={'100%'} maxW='960px'  align="center" justify="space-between">
                        <HStack spacing={4}>
                            {configStyles?.logo !== '' ? <img src={configStyles?.logo} alt="Logo" style={{ maxHeight: '30px' }} />
                            :
                            <Text fontSize={'20px'} fontWeight={'500'}>{configStyles.title}</Text>
                            }
                        </HStack>
                        {isComputerWidth ? 
                            <HStack spacing={4}>
                                {configStyles?.links.map((link, index) => (
                                    <Link  key={`link-${index}`} fontWeight={'500'} href={link.url}  color={configStyles?.header_color}>
                                        {link.tag}
                                    </Link>
                                ))}
                                <LanguageSelector availableLanguages={availableLanguages} color={configStyles?.header_color as string}/>
                            </HStack>:<>
                             <Icon aria-label='menu' as={RxHamburgerMenu} boxSize={8} cursor='pointer'  color={configStyles?.header_color} onClick={()=>setShowMenu(true)}/>
                        </>}
                    </Flex>
                </Flex>
                <style>{`
                input::placeholder {
                    color: ${configStyles.hero_color};
                    opacity: 0.6;
                }
                `}</style>

                {/* Hero Section */}
                <Flex  flexDir={'column'} alignItems={'center'} position="relative" backgroundSize="cover" backgroundPosition="center" backgroundRepeat="no-repeat" backgroundImage={(configStyles?.show_image && configStyles.hero_image !== '') ? `url(${configStyles.hero_image})` : `linear-gradient(${configStyles?.hero_background[0]}, ${configStyles?.hero_background[1]})`} color={configStyles?.hero_color} pt="105px" pb={configStyles?.blurred_hero ? '125px':'40px'}   px='20px' textAlign="center" >
                    <Heading zIndex={100} mb='10px' fontSize="28px">{configStyles?.welcome_message}</Heading>
                    <Flex zIndex={100} mt="10px" gap="10px" position="relative" width={isComputerWidth?"40%":'100%'} alignItems="center" py="15px" px="12px" borderRadius=".7em">
                        <Icon size="30px" as={FaMagnifyingGlass} cursor="pointer" />
                        <input placeholder={configStyles.search_placeholder}  style={{color:configStyles.hero_color, background: 'transparent', outline: 'none', border: 'none', fontSize: '16px', width: '100%'}}  />
                    </Flex>
                    {configStyles?.blurred_hero &&  <Box position="absolute" top={0} left={0} right={0} bottom={0} bg={`linear-gradient(transparent 20%, ${configStyles.text_background})`} zIndex={0} />}
                </Flex>

                <Flex flexDir={'column'} alignItems={'center'} flexGrow={1} mt={configStyles?.blurred_hero?'-60px':'30px'}  px='20px'  bg={configStyles?.text_background} color={configStyles?.text_color}> 
                    
                    {/* Collections Section */}
                    {configStyles.show_collections && <Box width={'100%'} maxW={'960px'}  > 
                        <Grid mt='15px' gap={'20px'}  width={'100%'} justifyContent={'space-between'} templateColumns={`repeat(${isComputerWidth ? configStyles?.collections_columns:1}, 1fr)`}> 
                            {currentCollections?.map((col, index) => (
                                <Flex key={`collection-styles-${index}`} flexDirection={configStyles?.collections_icons_text_align}   bg={configStyles?.floating_cards? 'transparent':configStyles?.text_background} zIndex={10000}   padding={configStyles?.floating_cards?'20px 0 20px 0':'20px'} gap='15px' borderRadius={configStyles?.cards_borderradius} width='100%'  boxShadow={configStyles?.floating_cards?'':'0 0 10px 1px rgba(0, 0, 0, 0.15)'} _hover={{transform:configStyles?.floating_cards?'scale(1)':'scale(1.03)'}} transition={'transform 0.3s ease'} cursor={configStyles?.floating_cards?'normal':'pointer'}>
                                    {configStyles?.show_icons && 
                                    <Flex width={'42px'} height={'42px'} borderRadius={'7px'} justifyContent={'center'} alignItems={'center'} p='10px'  backgroundSize="cover" backgroundPosition="center" backgroundRepeat="no-repeat" backgroundImage={configStyles.show_icons_background ? (configStyles.show_icons_background_image  && configStyles.icons_background_image !== '')? `url(${configStyles.icons_background_image})`: `linear-gradient(${configStyles.icons_background_color[0]}, ${configStyles.icons_background_color[1]})`:'transparent'}>
                                        <Icon color={configStyles.icons_color} boxSize={'22px'} as={(iconsMap as any)[col.icon]}/>
                                    </Flex>}
                                    <Box fontSize={'14px'}>
                                        <Text cursor={'pointer'} _hover={{textDecor:configStyles?.floating_cards?'underline':'normal', color:configStyles?.floating_cards?configStyles?.actions_color:''}}    fontSize={'16px'} fontWeight={'600'}>{col.name}</Text>
                                        {configStyles?.show_collections_description && <Text fontSize={'14px'}>{col.description}</Text>}
                                    </Box>
                                </Flex>
                            ))}
                        </Grid>
                    </Box>}

                    {/* Articles Section */}
                    {configStyles?.show_article_section && 
                        <Flex flexDir={'column'}  padding={configStyles?.floating_cards?'0':'35px'} mt='40px' maxW={configStyles.content_section_is_card?'960px':'100%'} width={'100%'}  bg={configStyles?.floating_cards? 'transparent':configStyles?.text_background} zIndex={10000}  p='20px' gap='15px' borderRadius={configStyles?.cards_borderradius}  boxShadow={configStyles?.floating_cards?'':'0 0 10px 1px rgba(0, 0, 0, 0.15)'} >
                            <Heading  as="h2" fontSize={'20px'}  fontWeight={'500'}>{configStyles.article_section_title}</Heading>
                    <Grid mt='15px' gap={(isComputerWidth || configStyles?.article_section_columns === 1)?'10px':'20px'}  width={'100%'} justifyContent={'space-between'} templateColumns={`repeat(${isComputerWidth ? configStyles?.article_section_columns:1}, 1fr)`}> 
                        {configStyles.article_section?.map((article, index) => (
                            <Flex justifyContent={'space-between'} alignItems={'center'} key={`article-styles-${index}`} fontSize={'14px'} p='7px' _hover={{bg:getHoverColor(configStyles?.text_background)}} borderRadius={'.5rem'} cursor={'pointer'} >
                                <Box> 
                                    <Text cursor={'pointer'} fontSize={'16px'} fontWeight={'600'}>{article.name}</Text>
                                    <Text maxW='100%' fontSize={'14px'} overflow={'hidden'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}>{article.description}</Text>
                                </Box>
                                <Icon as={IoIosArrowForward}/>
                            </Flex>
                        ))}
                    </Grid>
                </Flex>}
        </Flex>
            {/* Content Section */}
            {configStyles?.show_content_section && (
                <Flex flexDir={'column'} alignItems={'center'} textAlign={'center'} padding={'35px'} mt='40px' color={configStyles.content_section_text_color} maxW={configStyles.content_section_is_card?'960px':'100%'} width={'100%'} borderRadius={configStyles.content_section_is_card?configStyles.cards_borderradius:''}   bg={(configStyles.content_section_show_background_image && configStyles.content_section_background_image !== '') ? `url(${configStyles.content_section_background_image})` : `linear-gradient(${configStyles.content_section_background[0]}, ${configStyles.content_section_background[1]})`}>
                    <Heading  as="h2" fontSize={'28px'}  fontWeight={'500'}>{configStyles.content_section_title}</Heading>
                    <Text mt='10px' maxW={isComputerWidth?'60%':'100%'}  mb='30px'>{configStyles.content_section_description}</Text>
                    {configStyles.content_section_add_button && (
                        <Link href={configStyles.content_section_button_link} isExternal>
                            <Button backgroundColor={configStyles.content_section_button_background} color={configStyles.content_section_button_color} borderRadius={configStyles.content_section_button_borderradius} size="md">
                                {configStyles.content_section_button_title}
                            </Button>
                        </Link>
                    )}
                </Flex>
            )}
        {/* Footer */}
        <Box mt='40px' backgroundColor={configStyles?.footer_background} color={configStyles?.footer_color} padding={'30px'} textAlign="center">
            <Text fontSize={'16px'}>{configStyles?.footer_message}</Text>
            <Box marginY={2} />
            <HStack justify="center" gap='15px' mt='30px'>
                {Object.entries(configStyles?.social_networks || {}).map(([key, value], index) => (
                    <Icon key={`icons-${index}`} cursor={'pointer'} boxSize={'20px'} as={socialIconsMap[key as socialNetworks][1]}/>
                ))}
            </HStack>
            <Flex mt='30px' justifyContent={'center'} alignItems={'center'} gap={'5px'} color={configStyles?.footer_color} >
                <Image src={'/images/matil-simple.svg'} height="15px"/>
                <Text fontSize={'14px'}  fontWeight={'500'} onClick={() => window.open('https://www.matil.ai', '_blank')} mt='1px'>MATIL</Text>
            </Flex>
            
            </Box>
        </Flex>
    </Box>
    </Box>)
}

