
//REACT
import  {useState, useEffect, RefObject, ReactElement, useRef, ReactNode, Dispatch, SetStateAction, useMemo } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Icon, Skeleton, Button, Switch, NumberInput, NumberInputField, Tooltip, IconButton, NumberInputStepper, NumberDecrementStepper, NumberIncrementStepper, Portal, shouldForwardProp, chakra, HStack, Stack, Heading, Link, Grid } from "@chakra-ui/react"
import { motion, isValidMotionProp } from 'framer-motion'
//COMPONENTS
import SectionSelector from '../../../Components/Reusable/SectionSelector'
import EditText from '../../../Components/Reusable/EditText'
import ImageUpload from '../../../Components/Once/ImageUpload'
import ColorPicker from '../../../Components/Once/ColorPicker'
import ConfirmBox from '../../../Components/Reusable/ConfirmBox'
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
import CustomCheckbox from '../../../Components/Reusable/CheckBox'
//FUNCTIONS
import useOutsideClick from '../../../Functions/clickOutside'
//ICONS
import { IconType } from 'react-icons'
import { FaBookBookmark, FaPaintbrush, FaCircleDot, FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdArrowRoundForward, IoIosArrowDown } from 'react-icons/io'
import { FaPlus,  FaQuestionCircle, FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaTiktok, FaPinterest, FaGithub, FaReddit, FaDiscord, FaTwitch, FaTelegram, FaSpotify } from "react-icons/fa";
import { TbBrandX } from "react-icons/tb"
import { RxCross2 } from 'react-icons/rx'
import { IoShieldCheckmarkSharp, IoFileTrayFull, IoChatboxEllipses } from "react-icons/io5";
import { useNavigate } from 'react-router-dom'
import { HiTrash } from "react-icons/hi2"

interface HelpCenterData  {
    uuid: string
    name: string
    is_live:boolean
    style: StylesConfig
    url_identifier: string
    languages: string[]
    created_at: string
    updated_at: string
    created_by: number
    updated_by: number
}
interface CollectionsData {
    uuid:string
    help_center_uuid:string 
    name:string
}

type socialNetworks = 'facebook' | 'linkedin' | 'x' | 'instagram' | 'youtube' | 'pinterest' | 'github' |  'reddit' | 'discord' | 'tiktok' | 'twitch' | 'telegram' | 'spotify'
type sectionsTypes = '' | 'header' | 'common' | 'hero' | 'collections' | 'sections' | 'footer' | 'other'
type boxPosition = {top?:number, bottom?:number, left:number, type:'collection' | 'article'} | null
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

    collections_columns:number
    show_icons:boolean
    icons_color:string
    show_icons_background:boolean
    show_icons_background_image:boolean
    icons_background_color:[string, string]
    icons_background_image:string

    show_article_section:boolean 
    article_section: {title:string, articles:{uuid:string, name:string, description:string}[], columns:number}[] 
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

    show_collections_description:string
}
const MatilStyles:StylesConfig = {
    show_header:false,
    logo:'',
    title:'',
    links:[],
    header_background:'#000000',
    header_color:'#FFFFFF',

    favicon:'',
    text_background:'#FFFFFF',
    text_color:'#000000',
    actions_color:'#FFFFFF',
    floating_cards:true,
    cards_borderradius:20,
 
    welcome_message:'',
    hero_background:['#000000', '#000000'],
    hero_color:'#FFFFFF',
    show_image:false,
    hero_image: '', 
    blurred_hero:true,
    search_placeholder:'Busca aquí...',

    collections_columns:1,
    show_icons:true,
    icons_color:'#EFEFEF',
    show_icons_background:false,
    show_icons_background_image:false,
    icons_background_color:['#EGEAF2', '#EGEAF2'],
    icons_background_image:'',

    show_article_section:false,
    article_section: [],
    show_content_section:false, 
    content_section_title:'',
    content_section_description:'',

    content_section_show_background_image:false,
    content_section_background_image:'',
    content_section_is_card:false,
    content_section_background:['#FFFFFF', '#FFFFFF'], 
    content_section_text_color:'#000000', 
    content_section_add_button:false, 
    content_section_button_title:'Hola',
    content_section_button_background:'#000000', 
    content_section_button_color:'#FFFFFF', 
    content_section_button_link:'', 
    content_section_button_borderradius:10,

    footer_background:'#000000',
    footer_color:'#FFFFFF',
    social_networks:{},
    footer_message:'este es el footer',

    show_collections_description:''
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

function HelpCenter ({scrollRef}:{scrollRef:RefObject<HTMLDivElement>}) {

    //CONSTANTS
    const auth = useAuth()
    const navigate = useNavigate()
    const { t } = useTranslation('settings')
    const t_formats  = useTranslation('formats').t
    const desiredKeys = ['uuid', 'title', 'public_article_help_center_collections', 'public_article_status', 'public_article_common_uuid']
    const headerRef = useRef<HTMLDivElement>(null)

    //SECTION
    const sectionsList = ['collections', 'styles']
    const sectionsMap:{[key:string]:[string, ReactElement]}  = {'collections':[t('Collections'), <FaBookBookmark/>], 'styles':[t('Styles'), <FaPaintbrush/> ]}
    const [currentSection, setCurrentSection] = useState<'collections' | 'styles'>('collections')

    //ORGANIZATION DATA
    const [helpCenterData, setHelpCenterData] = useState<HelpCenterData | null>(null)
    const [collectionsData, setCollectionsData] = useState<CollectionsData[] | null>(null)
    const [publicArticlesData, setPublicArticlesData] = useState<{uuid:string, title:string, public_article_help_center_collections:string[], public_article_status:string, public_article_common_uuid:string }[] | null>(null)

    //FETCH NEW DATA WHEN THE VIEEW CHANGE
    useEffect(() => {
        document.title = `${t('Settings')} - ${t('HelpCenter')} - ${auth.authData.organizationName} - Matil`

        const fetchInitialData = async() => {
            const helpCentersData = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/help_centers`, auth})
            const articlesData = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/knowledge/sources`, auth})
           
            if (articlesData?.status === 200) {
                const publicArticles = articlesData.data.filter((article:any) => article.type === 'public_article').map((article:any) => {
                    return desiredKeys.reduce((obj:any, key) => {
                        if (key in article) obj[key] = article[key]
                        return obj
                    }, {})
                })
                setPublicArticlesData(publicArticles)
            }
            if (helpCentersData?.status === 200 && helpCentersData?.data.length > 0) {
                await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/help_centers/${helpCentersData.data[0].uuid}`, setValue:setHelpCenterData, auth})
                await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/help_centers/${helpCentersData.data[0].uuid}/collections`, setValue:setCollectionsData, auth})
            }
        }
        fetchInitialData()
    }, [])

    console.log(helpCenterData)

    const createHelpCenter =async () => {
        const data = {
            "uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            "name": "MATIL",
            "is_live": false,
            "style": MatilStyles,
            "url_identifier": "string",
            "languages": ["ES"],
            "created_at": "",
            "updated_at": "",
            "created_by": auth.authData.userId,
            "updated_by": auth.authData.userId
          }

          const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/help_centers`, method:'post', requestForm:data, setValue:setHelpCenterData, auth})

    }

    const createCollection = async () => {
        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/help_centers/${helpCenterData?.uuid}/collections`, method:'post', requestForm:{name:'Colección 1'}, auth})

    }
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

    const saveStyles = (newStyles:StylesConfig) => {

    }


    console.log(publicArticlesData)
    const CollectionComponent = ({collection, index}:{collection:CollectionsData, index:number}) => {

        //COLLECTION ARTICLES
        const filteredArticles = publicArticlesData ? publicArticlesData.filter(article => article.public_article_help_center_collections.includes(collection.uuid)): []
        const remainingArticles = publicArticlesData ? publicArticlesData.filter(article => !article.public_article_help_center_collections.includes(collection.uuid)): []

        //IS HOVERING A COLLECTION
        const [hoveringSection, setHoveringSection] = useState<string>('')

        //EXPAND COLLECTION
        const [expandCollection, setExpandCollection] = useState<boolean>(false)

        //ADD AND DELTE ELEMENT LOGIC
        const [showAddArtcile, setShowAddArtcile] = useState<boolean>(false)
        const [showDeleteElement, setShowDeleteElement] = useState<{type:'article' | 'collection', id:string} | null>(null)
         const AddBoxComponent = () => {
            const [waitingAdd, setWaitingAdd] = useState<boolean>(false)
            const [selectedArticles, setSelectedArticles] = useState<string[]>([])
            const createAticles = async() => {
                const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/help_centers/${helpCenterData?.uuid}/collections/${collection.uuid}/public_articles/${selectedArticles}`, method:'post', setWaiting:setWaitingAdd, auth, toastMessages:{works:t('CorrectAddedArticle'), failed:t('FailedAddedArticle')}})
                setShowAddArtcile(false)
            }     
            const handleCheckboxChange = (element:string, isChecked:boolean) => {
                if (isChecked) setSelectedArticles(prevElements=> [...prevElements, element])
                else setSelectedArticles(prevElements => prevElements.filter(el => el !== element))
            }
            console.log(selectedArticles)

            return (<> 
                    <Box p='20px' maxW='450px'> 
                        <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('AddArticles')}</Text>
                        <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                        {remainingArticles.length === 0 ?<Text>{t('NoArticlesToAdd')}</Text>:
                        <Box borderTopColor={'gay.300'} borderTopWidth={'1px'}> 
                            {remainingArticles.map((article, index) => (
                                <Flex key={`article-to-add-${index}`} p='10px' borderBottomWidth={'1px'} borderBottomColor='gray.200' alignItems={'center'}  gap='20px' bg={selectedArticles.includes(article.public_article_common_uuid)?'blue.100':''}>
                                    <Box flex='1'> 
                                        <CustomCheckbox id={`checkbox-${index}`}  onChange={() => handleCheckboxChange(article.public_article_common_uuid, !selectedArticles.includes(article.public_article_common_uuid))} isChecked={selectedArticles.includes(article.public_article_common_uuid)} />
                                    </Box>
                                    <Text flex='7' fontWeight={'medium'}_hover={{color:'brand.text_blue', textDecor:'underline'}} cursor={'pointer'} onClick={() => navigate(`/knowledge/article/${article.uuid}`)} fontSize={'1.2em'}>{article.title}</Text> 
                                    <Text flex='4'  >{article.public_article_status}</Text>
                                </Flex>
                            ))}
                        </Box>}
                    </Box>
                    <Flex  maxW='450px' p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                        <Button  size='sm' variant={'main'} isDisabled={selectedArticles.length === 0} onClick={createAticles}>{waitingAdd?<LoadingIconButton/>:t('AddArticles')}</Button>
                        <Button  size='sm' variant={'common'} onClick={() => {setShowAddArtcile(false)}}>{t('Cancel')}</Button>
                    </Flex>
            </>)
        }

        const DeleteComponent = () => {
            const [waitingDelete, setWaitingDelete] = useState<boolean>(false)
            const createAticles = async() => {
                const endpoint = `superservice/${auth.authData.organizationId}/admin/help_centers/${helpCenterData?.uuid}/collections/${collection.uuid}${ showDeleteElement?.type === 'collection' ?'':`/public_articles/${showDeleteElement?.id}`}`
                const response = await fetchData({endpoint, method:'delete', setWaiting:setWaitingDelete, auth, toastMessages:{works:showDeleteElement?.type === 'collection'? t('CorrectDeletedCollection'):t('CorrectDeletedArticle'), failed:showDeleteElement?.type === 'collection'? t('FailedDeletedCollection'):t('FailedtDeletedArticle')}})
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
                        <Button  size='sm' variant={'common'} onClick={() => {setShowAddArtcile(false)}}>{t('Cancel')}</Button>
                    </Flex>
            </>)
        }
        const AddBox = useMemo(() => (
            <ConfirmBox isSectionWithoutHeader setShowBox={setShowAddArtcile}> 
                <AddBoxComponent/>
            </ConfirmBox>
        ), [showAddArtcile])

        const DeleteBox = useMemo(() => (
            <ConfirmBox isSectionWithoutHeader setShowBox={(b:boolean) => setShowDeleteElement(null)}> 
                <DeleteComponent/>
            </ConfirmBox>
        ), [showDeleteElement])

        return (<>
            {showAddArtcile && AddBox} 
            {showDeleteElement && DeleteBox} 

            <Box overflow={'hidden'} width={'100%'}> 
                <Flex  position={'relative'} borderBottomColor={index === (collectionsData?.length || 0) - 1 ?'':'gray.200'} borderWidth={'1px'} gap='20px' alignItems={'center'}  p='20px'  _hover={{bg:'brand.gray_2'}} onMouseEnter={() => setHoveringSection('collection')} onMouseLeave={() => setHoveringSection('')}> 
                    <Flex flex='3' alignItems={'center'} gap={'20px'}>
                        <IoIosArrowDown className={expandCollection ? "rotate-icon-up" : "rotate-icon-down"} onClick={() => setExpandCollection(!expandCollection) }/>
                        <Flex justifyContent={'center'} alignItems={'center'} p='15px' bg='brand.gray_1' borderRadius={'.5rem'}> 
                            <Icon boxSize='25px' as={FaBookBookmark}/>
                        </Flex>
                        <Box>
                            <Text fontSize={'1.2em'} fontWeight={'medium'}>{collection.name}</Text>
                        </Box>
                    </Flex>

                    <Text flex='1'>{'ESTADO'}</Text>
                    <Flex flex='1' alignItems={'center'} gap='20px'  > 
                        <Text fontWeight={'semibold'} >{filteredArticles.length}</Text>
                        <Flex flexDir={'column'} alignItems={'center'}  textAlign={'center'} color='brand.text_blue' p='8px' borderRadius={'.5rem'} cursor={'pointer'} _hover={{bg:'white'}} onClick={() => setShowAddArtcile(true)}>
                            <Icon as={FaPlus}/>
                            <Text>{t('AddArticles')}</Text>
                        </Flex>
                    </Flex>
                    {hoveringSection === 'collection' && <IconButton aria-label='delete-collection' position={'absolute'} right={'40px'} bg='transparent' size='sm' variant={'delete'} icon={<HiTrash size='20px'/>} onClick={() => setShowDeleteElement({type:'collection', id:''})}/>}
                </Flex>
                <motion.div initial={{height:expandCollection?0:'auto', opacity:expandCollection?0:1}} animate={{height:expandCollection?'auto':0, opacity:expandCollection?1:0 }} exit={{height:expandCollection?0:'auto',  opacity:expandCollection?0:1 }} transition={{duration:.2}} style={{overflow:expandCollection?'visible':'hidden'}}>           
                    {filteredArticles.map((article, index2) => (
                        <Flex  position={'relative'} borderBottomColor={(index === (collectionsData?.length || 0) - 1 && index2 === (filteredArticles?.length || 0) - 1 ) ?'':'gray.200'} borderWidth={'1px'} gap='20px'  alignItems={'center'}  p='20px' _hover={{bg:'brand.gray_2'}}  onMouseEnter={() => setHoveringSection(article.uuid)} onMouseLeave={() => setHoveringSection('')}> 
                            <Flex flex='3' alignItems={'center'}   gap={'20px'}>
                                <Flex ml='150px' justifyContent={'center'} alignItems={'center'} p='15px' bg='brand.gray_1' borderRadius={'.5rem'}> 
                                    <Icon boxSize='25px' as={FaBookBookmark}/>
                                </Flex>
                                <Text fontWeight={'medium'}_hover={{color:'brand.text_blue', textDecor:'underline'}} cursor={'pointer'} onClick={() => navigate(`/knowledge/article/${article.uuid}`)} fontSize={'1.2em'}>{article.title}</Text>
                            </Flex>
                            <Text flex='1'  >{article.public_article_status}</Text>
                            <Text flex='1'>-</Text>
                            {hoveringSection === article.uuid && <IconButton aria-label='delete-collection' position={'absolute'} right={'40px'} bg='transparent' size='sm' variant={'delete'} icon={<HiTrash size='20px'/>}  onClick={() => setShowDeleteElement({type:'article', id:article.public_article_common_uuid})}/>}
                        </Flex>
                    ))}
                </motion.div>
            </Box>
        
        </>)
    }

    return(<>
        <Box> 
            <Flex justifyContent={'space-between'} alignItems={'end'}> 
                <Box> 
                    <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('HelpCenter')}</Text>
                    <Text color='gray.600' fontSize={'.9em'}>{t('HelpCenterDes')}</Text>
                </Box>
                <Button  variant='common' size={'sm'} onClick={createHelpCenter} leftIcon={<FaCircleDot color={helpCenterData?.is_live?'#68D391':'#ECC94B'}/>}>{helpCenterData?.is_live?t('IsLive'):t('NotIsLive')}</Button>
            </Flex>
            <Box mt='2vh' mb='2vh'> 
                <SectionSelector selectedSection={currentSection} sections={sectionsList} sectionsMap={sectionsMap} onChange={() => setCurrentSection(prev => (prev === 'collections'?'styles':'collections'))}/>
            </Box>
            <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='3vh'/>
        </Box>

       
        {(currentSection === 'styles') ? 
        <Skeleton flex='1' isLoaded={!(helpCenterData !== null && collectionsData !== null)}>
            <EditStyles currentStyles={helpCenterData?.style as StylesConfig} onSaveFunction={saveStyles}/>
        </Skeleton>
        :
        <Box flex='1'>
              <Flex flexDir={'row-reverse'}>
                <Button size='sm' onClick={createCollection} variant='common'>{t('AddCollection')}</Button>
                </Flex>
            <Skeleton isLoaded={collectionsData !== null && publicArticlesData !== null}>
                <Box borderRadius={'.5em'}    >    
                    <Flex position={'sticky'}  borderTopRadius={'.5rem'} borderColor={'gray.200'} borderWidth={'1px'} gap='20px' ref={headerRef} alignItems={'center'}  color='gray.600' p='10px' fontSize={'1em'} bg='brand.gray_2' > 
                        <Text flex='3' color='gray.600' cursor='pointer'>{t('CollectionName')}</Text>
                        <Text flex='1'  color='gray.600' cursor='pointer'>{t('Status')}</Text>
                        <Text  flex='1'  color='gray.600' cursor='pointer'>{t('NumberArticles')}</Text>
                    </Flex>
                </Box>
               
                <Box  overflowX={'hidden'}  overflowY={'scroll'} maxH={boxHeight}> 
                    {collectionsData?.map((collection, index) => (
                        <CollectionComponent collection={collection} index={index} key={`collection-${index}`}/>
                    ))}
                </Box>
            </Skeleton>
        </Box>
        }

    </>
   
    )
}

export default HelpCenter


const EditStyles = ({currentStyles, onSaveFunction}:{currentStyles:StylesConfig, onSaveFunction:(styles:StylesConfig) => void}) => {

    //CONSTANTS
    const { t } = useTranslation('settings')
    const auth = useAuth()

    //SCROLL REF
    const containerRef = useRef<HTMLDivElement>(null)
    const stylesRef = useRef<HTMLDivElement>(null)


    //STYLES DATA
    const [configStyles, setConfigStyles] = useState<StylesConfig>(MatilStyles)


    //CURRENT EXPANDED SECTION
    const [sectionExpanded, setSectionExpanded] = useState<sectionsTypes>('')

    return (
        <Flex ref={stylesRef} height={window.innerHeight - window.innerWidth * 0.02 - (stylesRef.current?.getBoundingClientRect().top || 0)} flex='1' gap='30px' minHeight='0'>
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
                    <Text fontWeight={'medium'} mt='2vh' mb='2vh'>{t('Articles')}</Text>
                    <EditBool configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='show_article_section' title={t('ShowArticles')} />
                    <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='gray.200'/>
                    <Text  mb='2vh' fontWeight={'medium'}>{t('Content')}</Text>
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
                            {configStyles.show_icons_background_image ? 
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

                <CollapsableSection section={'other'} setSectionExpanded={setSectionExpanded} sectionExpanded={sectionExpanded}>
                    <EditStr configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='title' title={t('HeaderTitle')} description={t('HeaderTitleDes')}/>
                    <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='gray.200'/>
                    <Text  mb='2vh' fontWeight={'medium'}>{t('Styles')}</Text>
                    <EditColor configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='footer_background' title={t('BackgroundColor')} containerRef={containerRef}/>
                    <Box mt='2vh'> 
                        <EditColor configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='footer_color' title={t('TextColor')} containerRef={containerRef}/>
                    </Box>  
                </CollapsableSection>

            </Flex>
            <Box flex='5' width={'calc(100% + 2vw)'}  height={'calc(100% + 2vw)'} bg='brand.gray_2' borderRadius={'.7rem 0 0 0'} p='15px'>
                <Box width={'100%'} height={'100%'} overflowY={'scroll'} borderRadius={'.5rem'} overflow={'hidden'}>
                    <GetHelpCenter configStyles={configStyles}/>
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
            <motion.div initial={{height:isExpanded?0:'auto', opacity:isExpanded?0:1}} animate={{height:isExpanded?'auto':0, opacity:isExpanded?1:0 }} exit={{height:isExpanded?0:'auto',  opacity:isExpanded?0:1 }} transition={{duration:.2}} style={{overflow:isExpanded?'visible':'hidden'}}>           
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
        <Box width='300px' > 
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
        <Box width='300px' > 
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
          <Flex mt='1vh' width={'100%'} alignItems={'end'} key={`link-${index}`} gap='10px'>
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
    const iconsMap:{[key in socialNetworks]:[string, IconType]} = {facebook: ["Facebook", FaFacebook],x: ["X", TbBrandX], instagram: ["Instagram", FaInstagram],linkedin: ["LinkedIn", FaLinkedin],youtube: ["YouTube", FaYoutube], tiktok: ["TikTok", FaTiktok], pinterest: ["Pinterest", FaPinterest], github: ["GitHub", FaGithub], reddit: ["Reddit", FaReddit], discord: ["Discord", FaDiscord], twitch: ["Twitch", FaTwitch], telegram: ["Telegram", FaTelegram], spotify: ["Spotify", FaSpotify]}
 
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
        <Flex  width={'100%'} key={`link-${index}`} alignItems={'center'} gap='10px' mt='1vh' >
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
                    <Flex px='15px' key={`social-network-${index}`} borderRadius='.5rem' onClick={() => handleAddLink(option)} py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'brand.gray_2'}}>
                        <Icon as={iconsMap[option][1]}/>
                        <Text whiteSpace={'nowrap'}>{iconsMap[option][0]}</Text>
                    </Flex>
                ))}
                
            </MotionBox >
        </Portal>}
    </>)
}

const EditCollections = ({configStyles, setConfigStyles, containerRef}:{configStyles:StylesConfig, setConfigStyles:Dispatch<SetStateAction<StylesConfig>>, containerRef:RefObject<HTMLDivElement>}) => {
    
    const { t } = useTranslation('settings')
  
    const GetColumsIcon = ({ count }: { count: number }) => {
        return (
          <Flex gap='2px' width='16px'  height='100%' alignItems="center" justifyContent="center">
            {Array.from({ length: count }).map((_, index) => (
              <Flex borderRadius={'2px'} height='12px' width={'100%'} bg='black' key={`column-${index}`} />
            ))}
          </Flex>
        );
      };
      
    return(<>
        <Box mt='2vh'> 
            <Text fontSize={'.9em'} fontWeight={'medium'}>{t('Columns')}</Text>
            <SectionSelector selectedSection={configStyles.collections_columns} sections={[1,2,3]} sectionsMap={{'1':[t('Column', {count:1}),<GetColumsIcon count={1}/>], '2':[t('Column', {count:2}),<GetColumsIcon count={2}/>], '3':[t('Column', {count:3}),<GetColumsIcon count={3}/>]}} onChange={(value) => setConfigStyles(prev => ({...prev as StylesConfig, collections_columns:value} ))}/>

        </Box>

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
    </>)
}

const GetHelpCenter = ({configStyles}:{configStyles:StylesConfig}) => {

    const { t } = useTranslation('settings')
    const iconsList = [ IoShieldCheckmarkSharp, IoFileTrayFull, IoChatboxEllipses]
    const iconsMap:{[key in socialNetworks]:[string, IconType]} = {facebook: ["Facebook", FaFacebook],x: ["X", TbBrandX], instagram: ["Instagram", FaInstagram],linkedin: ["LinkedIn", FaLinkedin],youtube: ["YouTube", FaYoutube], tiktok: ["TikTok", FaTiktok], pinterest: ["Pinterest", FaPinterest], github: ["GitHub", FaGithub], reddit: ["Reddit", FaReddit], discord: ["Discord", FaDiscord], twitch: ["Twitch", FaTwitch], telegram: ["Telegram", FaTelegram], spotify: ["Spotify", FaSpotify]}

    //ADJUST COLLECTIONS ICONS LOGIC
    const textRef = useRef<HTMLDivElement>(null)
    const [flexDirection, setFlexDirection] = useState<'row' | 'column'>('row')
    useEffect(() => {
      const textElement = textRef.current
      if (textElement) {
        const lineHeight = parseInt(window.getComputedStyle(textElement).lineHeight, 10)
        const contentHeight = textElement.offsetHeight
        if (contentHeight > lineHeight * 1.5) setFlexDirection('column')
        else  setFlexDirection('row')
      }
    }, [configStyles.collections_columns])


    return (
        <Box  width={'100%'} height={'100%'} borderRadius={'.3rem'} position={'relative'}>
             <Flex backgroundColor={configStyles.text_background} flexDir={'column'}  minH={'100%'}>
                
                {/* Header */}
                <Box height={'60px'} zIndex={10} backgroundColor={configStyles.show_header ? configStyles.header_background:'transparent'} position={'absolute'} width={'100%'} color={configStyles.header_color} alignItems={'center'}  padding={4} >
                    <Flex align="center" justify="space-between">
                        <HStack spacing={4}>
                            {configStyles.logo !== '' ? <img src={configStyles.logo} alt="Logo" style={{ maxHeight: '30px' }} />
                            :
                            <Text fontSize={'16px'} fontWeight={'medium'}>{configStyles.title}</Text>
                            }
                        </HStack>
                        <HStack spacing={4}>
                            {configStyles.links.map(link => (
                                <Link href={link.url} key={link.tag} color={configStyles.header_color}>
                                    {link.tag}
                                </Link>
                            ))}
                        </HStack>
                    </Flex>
                </Box>
                
                {/* Hero Section */}
                <Flex  flexDir={'column'} alignItems={'center'} position="relative" backgroundSize="cover" backgroundPosition="center" backgroundRepeat="no-repeat" bg={(configStyles.show_image && configStyles.hero_image !== '') ? `url(${configStyles.hero_image})` : `linear-gradient(${configStyles.hero_background[0]}, ${configStyles.hero_background[1]})`} color={configStyles.hero_color} pt="75px" pb={configStyles.blurred_hero ? '75px':'30px'} textAlign="center" >
                    <Heading fontSize="20px">{configStyles.welcome_message}</Heading>
                    <Flex mt='10px' gap='10px' position="relative"width={'40%'} alignItems={'center'} py='10px' px='12px' borderRadius={'.9em'} bg='rgba(256, 256, 256, 0.4)' >
                        <Icon size={'30px'}  as={FaMagnifyingGlass}   cursor={'pointer'} />
                        <input placeholder='Buscar...' style={{background:'transparent', outline:'none', border:'none', fontSize:'12px'}} />
                    </Flex>  
                    {configStyles.blurred_hero &&  <Box position="absolute" top={0} left={0} right={0} bottom={0} bg={`linear-gradient(transparent 20%, ${configStyles.text_background})`} zIndex={0} />}
                 </Flex>

                {/* Hero Section */}
                <Flex flexDir={'column'} alignItems={'center'} flexGrow={1} mt={configStyles.blurred_hero?'-40px':'0'} bg={configStyles.text_background} color={configStyles.text_color}> 
                    
                    <Box width={'90%'} maxW={'760px'}  > 
                        <Grid mt='1vh' gap={'20px'}  width={'100%'} justifyContent={'space-between'} templateColumns={`repeat(${configStyles.collections_columns}, 1fr)`}> 
                            {Array.from({length:3}).map((_,index) => (
                                <Flex flexDirection={flexDirection}  bg={configStyles.floating_cards? 'transparent':configStyles.text_background}zIndex={10000}  p='20px' gap='15px' borderRadius={configStyles.cards_borderradius} width='100%'  boxShadow={configStyles.floating_cards?'':'0 0 10px 1px rgba(0, 0, 0, 0.15)'}>
                                    {configStyles.show_icons && 
                                    <Flex width={'42px'} borderRadius={'7px'} justifyContent={'center'} alignItems={'center'} p='10px' bg={configStyles.show_icons_background ? (configStyles.show_icons_background_image  && configStyles.icons_background_image !== '')? `url(${configStyles.hero_image})`: `linear-gradient(${configStyles.icons_background_color[0]}, ${configStyles.icons_background_color[1]})`:'transparent'}>
                                        <Icon color={configStyles.icons_color} boxSize={'22px'} as={iconsList[index]}/>
                                    </Flex>}
                                    <Box    fontSize={'14px'}>
                                        <Text ref={textRef} fontWeight={'medium'}>{t('SampleCollection', {count:index})}</Text>
                                        <Text fontSize={'12px'}>{t('SampleCollectionDes')}</Text>
                                    </Box>
                                </Flex>
                            ))}
                        </Grid>
                    </Box>
             
                {/* Article Section */}

                {configStyles.show_article_section && configStyles.article_section.map(section => (
                    <Box key={section.title} padding={5}>
                        <Heading as="h2" size="lg" marginBottom={4}>{section.title}</Heading>
                        <Stack spacing={4} direction={section.columns === 2 ? "row" : "column"}>
                            {section.articles.map(article => (
                                <Box key={article.uuid} borderWidth={1} borderRadius="md" padding={4} backgroundColor="#ffffff">
                                    <Heading as="h3" size="md">{article.name}</Heading>
                                    <Text>{article.description}</Text>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                ))}

                {/* Content Section */}
                {configStyles.show_content_section && (
                    <Box textAlign={'center'} padding={'35px'} mt='30px' color={configStyles.content_section_text_color} width={configStyles.content_section_is_card?'auto':'100%'} borderRadius={configStyles.content_section_is_card?configStyles.cards_borderradius:''}   bg={(configStyles.content_section_show_background_image && configStyles.content_section_background_image !== '') ? `url(${configStyles.content_section_background_image})` : `linear-gradient(${configStyles.content_section_background[0]}, ${configStyles.content_section_background[1]})`}>
                        
                        <Heading fontSize={'20px'} as="h2" size="lg">{configStyles.content_section_title}</Heading>
                        <Text mt='10px' mb='30px'>{configStyles.content_section_description}</Text>
                        {configStyles.content_section_add_button && (
                            <Link href={configStyles.content_section_button_link} isExternal>
                                <Button backgroundColor={configStyles.content_section_button_background} color={configStyles.content_section_button_color} borderRadius={configStyles.content_section_button_borderradius} size="md">
                                    {configStyles.content_section_button_title}
                                </Button>
                            </Link>
                        )}
                    </Box>
                )}
 
                </Flex>

                {/* Footer */}
                <Box backgroundColor={configStyles.footer_background} color={configStyles.footer_color} padding={'40px'} textAlign="center">
                    <Text fontSize={'12px'}>{configStyles.footer_message}</Text>
                    <Box marginY={2} />
                    <HStack justify="center"  mt='20px'>
                        {Object.entries(configStyles.social_networks).map(([key, value]) => (
                            <Icon cursor={'pointer'} boxSize={'20px'} as={iconsMap[key as socialNetworks][1]}/>
                        ))}
                    </HStack>
                </Box>
            </Flex>
        </Box>
    )
}