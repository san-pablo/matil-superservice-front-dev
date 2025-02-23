
//REACT
import  {useState, useEffect, RefObject, ReactElement, useRef, ReactNode, Dispatch, SetStateAction, useMemo, MutableRefObject, CSSProperties, Fragment } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useAuth0 } from '@auth0/auth0-react'
import { useTranslation } from 'react-i18next'
import { useSession } from '../../../../SessionContext'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Icon, Skeleton, Button, Tooltip, IconButton,Textarea, Portal, shouldForwardProp, chakra, HStack, Image, Heading, Link, Grid } from "@chakra-ui/react"
import { motion, isValidMotionProp, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
//COMPONENTS
import SectionSelector from '../../../Components/Reusable/SectionSelector'
import EditText from '../../../Components/Reusable/EditText'
import ConfirmBox from '../../../Components/Reusable/ConfirmBox'
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
import CustomCheckbox from '../../../Components/Reusable/CheckBox'
import IconsPicker from '../../../Components/Reusable/IconsPicker'
import ActionsButton from '../../../Components/Reusable/ActionsButton'
import ActionsBox from '../../../Components/Reusable/ActionsBox'
import NoSavedWarning from '../../../Components/Reusable/NoSavedWarning'
import { EditInt, EditColor, EditStr, EditImage, EditBool } from '../../../Components/Reusable/EditSettings'
//FUNCTIONS
import useOutsideClick from '../../../Functions/clickOutside'
import showToast from '../../../Components/Reusable/ToastNotification'
import determineBoxStyle from '../../../Functions/determineBoxStyle'
//ICONS
import { IconType } from 'react-icons'
import { FaBookBookmark, FaPaintbrush, FaCircleDot } from "react-icons/fa6"
import { FaQuestionCircle } from 'react-icons/fa'
import { TbWorld } from 'react-icons/tb'
import { IoIosArrowDown, IoIosArrowForward, IoLogoWhatsapp, IoMdMail } from 'react-icons/io'
import { FaMagnifyingGlass }  from "react-icons/fa6"
import { FaPlus, FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaTiktok, FaPinterest, FaGithub, FaReddit, FaDiscord, FaTwitch, FaTelegram, FaSpotify } from "react-icons/fa"
import { TbBrandX } from "react-icons/tb"
import { RxHamburgerMenu, RxCross2 } from 'react-icons/rx'
import { useLocation, useNavigate } from 'react-router-dom'
import { HiTrash } from "react-icons/hi2"
import { BsFillExclamationTriangleFill } from 'react-icons/bs'
//TYPING
import { languagesFlags, ContentData } from '../../../Constants/typing'
  
//TYPING
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
    id:string
    help_center_id:string 
    language:string
    name:string 
    description:string
    icon:{type:'emoji' | 'image' | 'icon', data:string}
}
type socialNetworks = 'whatsapp' | 'mail' | 'facebook' | 'linkedin' | 'x' | 'instagram' | 'youtube' | 'pinterest' | 'github' |  'reddit' | 'discord' | 'tiktok' | 'twitch' | 'telegram' | 'spotify'
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
    article_section: {id:string, name:string, description:string}[]
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
    footer_message_2:string

    enable_chat:boolean
    chat_config:{org_id:string, chatbot_id:string}

 }
 

//GET A CUSTOM ICON FOR THE COLUMNS SELECTOR
const GetColumsIcon = ({ count, isVertical }: { count: number, isVertical?:boolean }) => {
    return (
        <Flex gap='2px' width='16px'  flexDir={isVertical?'column':'row'} height='16px' alignItems="center" justifyContent="center">
            {Array.from({ length: count }).map((_, index) => (
                <Flex key={`column-icon-${index}`} borderRadius={'2px'} height={isVertical?'100%':'12px'}  width={isVertical?'12px':'100%'} bg='black'  />
            ))}
        </Flex>
    )
}
 
//FIRST ICON (?)
const firstIcon:{type:'emoji' | 'image' | 'icon', data:string} = {type:'icon', data:'<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 64 64"><defs fill="#55534E" /><path  d="m26,46h12v10h-12v-10Zm6-38c-11.1,0-18,6.2-18,16h10c0-4.6,2.78-7,7.75-7s7.75,2.2,7.75,6c0,6.32-12.5,4.31-12.5,16v1h10c0-6.32,13-5.31,13-17,0-9-6.9-15-18-15Z" fill="#55534E" /></svg>'}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})
 
function HelpCenter () {

    //CONSTANTS
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()
    const navigate = useNavigate()
    const { t } = useTranslation('settings')
    const desiredKeys = ['id', 'title', 'description', '']
    const headerRef = useRef<HTMLDivElement>(null)
    const helpCenterId = useLocation().pathname.split('/')[useLocation().pathname.split('/').length - 1]
    const currentSearch = location.search

    //SELECTED LANGUAGE
    const [selectedLanguage, setSelectedLanguage] = useState<string>(auth.authData.userData?.language || 'ES')

    //SECTION
    const sectionsList = ['collections', 'styles']
    const sectionsMap:{[key:string]:[string, ReactElement]}  = {'collections':[t('Collections'), <FaBookBookmark/>], 'styles':[t('Styles'), <FaPaintbrush/> ]}
    const [currentSection, setCurrentSection] = useState<'collections' | 'styles'>('collections')

    //EDIT STYLES 
    const stylesRef = useRef<StylesConfig | null>(null)
    const stylesHeaderRef = useRef<HTMLDivElement>(null)

    //EDIT HELP CENTER
    const [showCreateCollection, setShowCreateCollection] = useState<boolean>(false)
    const [showDelete, setShowDelete] = useState<boolean>(false)

    //ORGANIZATION DATA
    const expandedCollections = useRef<number[]>([])
    const helpCenterDataRef = useRef<HelpCenterData| null>(null)
    const [helpCenterData, setHelpCenterData] = useState<HelpCenterData | null>(null)
    const [collectionsData, setCollectionsData] = useState<CollectionsData[] | null>(null)
    const [publicArticlesData, setPublicArticlesData] = useState<ContentData<'public_article'>[] | null>(null)

    //FETCH NEW DATA WHEN THE VIEEW CHANGE
    useEffect(() => {
        document.title = `${t('HelpCenter')} - ${auth.authData.organizationName} - Matil`

        const fetchInitialData = async() => {
            const articlesData = await fetchData({endpoint:`${auth.authData.organizationId}/knowledge/sources`, setValue:setPublicArticlesData, getAccessTokenSilently, params:{page_index:1,filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'type', op:'eq', val:'public_article'}]}]} }, auth})
            const helpCenterResponse = await fetchData({endpoint:`${auth.authData.organizationId}/help_centers/${helpCenterId}`, getAccessTokenSilently, setValue:setHelpCenterData, auth, setRef:helpCenterDataRef})
            await fetchData({endpoint:`${auth.authData.organizationId}/help_centers/${helpCenterId}/collections`, getAccessTokenSilently, setValue:setCollectionsData, auth})
            
        }
        fetchInitialData()
    }, [])

    //WAIRING SAVE CHANGES
    const [waitingSave, setWaitingSave] = useState<boolean>(false)
    const updateHelpCenter = async (newData:HelpCenterData) => {
        if ( JSON.stringify(newData) === JSON.stringify(helpCenterDataRef.current)) return 
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/help_centers/${helpCenterId}`, setWaiting:setWaitingSave, getAccessTokenSilently, method:'put', requestForm:{...newData, languages:['ES']}, auth, toastMessages:{works:t('CorrectEditedHelpCenter'), failed:t('FailedEditedHelpCenter')}})
        if (response?.status === 200) {
            helpCenterDataRef.current = newData
            setHelpCenterData(newData)
        }
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
    }, [collectionsData])

    //COLLECTIONS COMPONENT
    const CollectionComponent = ({collection, index}:{collection:CollectionsData, index:number}) => {

        //COLLECTION ARTICLES
        const filteredArticles = publicArticlesData ? publicArticlesData?.filter(article => (article?.common_id || []).includes(collection?.id)): []
        const remainingArticles = publicArticlesData ? publicArticlesData?.filter(article => !(article?.common_id || []).includes(collection?.id)): []
     
        //CURRENT COLLECTION
        const [currentCollection, setCurrentCollection] = useState<CollectionsData>(collection)
        useEffect(() => {updateCollection(currentCollection)},[currentCollection.name, currentCollection.description])

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
        const updateCollection = async (col:CollectionsData) => {
             const response = await fetchData({endpoint: `${auth.authData.organizationId}/help_centers/${helpCenterData?.id}/collections/${collection.id}`,  getAccessTokenSilently,requestForm:col, method: 'put', auth,})
        }

        //ADD A COLLECTION COMPONENT
        const AddBoxComponent = () => {
            const [waitingAdd, setWaitingAdd] = useState<boolean>(false)
            const [selectedArticles, setSelectedArticles] = useState<string[]>([])
            
            const createArticles = async () => {
                setWaitingAdd(true)
                try {
                    for (const articleId of selectedArticles) {
                        const response = await fetchData({endpoint: `${auth.authData.organizationId}/help_centers/${helpCenterData?.id}/collections/${collection.id}/public_articles/${articleId}`,  getAccessTokenSilently, method: 'post', auth})
                    }
                    {/*
                    const updatedArticles = publicArticlesData?.map(article => {
                        if (selectedArticles.includes(article.common_id)) return {...article, public_article_help_center_collections: [...new Set([...article.public_article_help_center_collections, collection.uuid])]}
                        return article
                    }) || []
                    setPublicArticlesData(updatedArticles)      
                */}  
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
                    <Flex flexDir={'column'}  maxH={'70vh'} p='20px' > 
                        <Text fontWeight={'medium'} fontSize={'1.4em'}>{t('AddArticles')}</Text>
                        <Box mt='1vh' flex='1' overflow={'scroll'}> 
                            {remainingArticles.length === 0 ?<Text>{t('NoArticlesToAdd')}</Text>:
                            <Flex flexDir={'column'}   flex='1' height={'100%'}  overflow={'scroll'}> 
                                {remainingArticles.map((article, index) => (
                                    <Flex key={`article-to-add-${index}`} p='10px' borderBottomWidth={'1px'} borderBottomColor='border_color' alignItems={'center'}  gap='20px' bg={selectedArticles.includes(article.common_id)?'hover_gray':''}>
                                        <Box flex='1'> 
                                            <CustomCheckbox id={`checkbox-${index}`}  onChange={() => handleCheckboxChange(article.common_id, !selectedArticles.includes(article.common_id))} isChecked={selectedArticles.includes(article.common_id)} />
                                        </Box>
                                        <Text flex='7' fontWeight={'medium'}_hover={{color:'text_blue'}} cursor={'pointer'} onClick={() => navigate(`/knowledge/article/${article.id}`)} >{article.title}</Text> 
                                        <Box flex='4'> 
                                            <Box boxShadow={`1px 1px 1px rgba(0, 0, 0, 0.15)`} display="inline-flex" fontSize='.9em' py='2px' px='8px' fontWeight={'medium'} color='white'  bg={article.common_id === 'draft'?'red.100':'green.100'} borderRadius={'.7rem'}> 
                                                <Text color={article.common_id === 'draft'?'red.600':'green.600'}>{t(article.common_id)}</Text>
                                            </Box>
                                        </Box>
                                    </Flex>
                                ))}
                            </Flex>}
                        </Box>
                   
                        <Flex mt='3vh'  gap='15px' flexDir={'row-reverse'} >
                            <Button  size='sm' variant={'main'} isDisabled={selectedArticles.length === 0} onClick={createArticles}>{waitingAdd?<LoadingIconButton/>:t('AddArticles')}</Button>
                            <Button  size='sm' variant={'common'} onClick={() => {setShowAddArticle(false)}}>{t('Cancel')}</Button>
                        </Flex>
                    </Flex>
            </>)
        }

        //DELETE A COLLECTION COMPONENT
        const deleteCollection = async() => {
            const endpoint = `${auth.authData.organizationId}/help_centers/${helpCenterData?.id}/collections/${collection.id}${ showDeleteElement?.type === 'collection' ?'':`/public_articles/${showDeleteElement?.id}`}`
            const response = await fetchData({endpoint, method:'delete', auth, getAccessTokenSilently })
            if (response?.status === 200)  setCollectionsData(prevCollections => (prevCollections as CollectionsData[]).filter((_, i) => i !== index))
            setShowDeleteElement(null)
        }  
    

        //MEMOIZED ADD COLLECTION
        const AddBox = useMemo(() => (
            <ConfirmBox maxW={'60vw'}  setShowBox={setShowAddArticle}> 
                <AddBoxComponent/>
            </ConfirmBox>
        ), [showAddArticle])

      

         return (<>
        
            {showAddArticle && AddBox} 
             <ActionsBox title={t('ConfirmDeleteCollectionName', {name:currentCollection?.name})} showBox={showDeleteElement}  setShowBox={() =>setShowDeleteElement(null)} des={t('ConfirmDeleteCollectionDes')} type='delete' buttonTitle={t('DeleteCollection')} actionFunction={deleteCollection}/>

            <Box overflow={'hidden'} width={'100%'}> 
                <Flex  position={'relative'} borderBottomColor={index === (collectionsData?.length || 0) - 1 ?'':'border_color'}  borderBottomWidth={index === (collectionsData?.length || 0) - 1 ?'0':'1px'} gap='20px' alignItems={'center'}  p='20px'  _hover={{bg:'hover_gray'}} onMouseEnter={() => setHoveringSection('collection')} onMouseLeave={() => setHoveringSection('')}> 
                    <Flex flex='3' alignItems={'center'} gap={'20px'}>
                        {filteredArticles.length > 0 && <IoIosArrowDown size={'20px'} className={expandCollection ? "rotate-icon-up" : "rotate-icon-down"} onClick={handleExpand}/>}    
                            <IconsPicker selectedEmoji={currentCollection.icon}  onSelectEmoji={(icon) => {updateCollection({...currentCollection, icon}); setCurrentCollection(prev => ({...prev, icon}))}} />
                        <Box>
                        <EditText placeholder={t('AddTitle')} value={currentCollection?.name} setValue={(value) => setCurrentCollection(prev => ({...prev, name:value})) } className={'title-textarea-collections'}/>
                        <EditText placeholder={t('AddDescription')}  value={currentCollection?.description} setValue={(value) => setCurrentCollection(prev => ({...prev, description:value}))} className={'description-textarea-functions'}/></Box>
                    </Flex>
                    
                    <Flex alignItems={'center'} gap='7px' flex='1' >
                        {filteredArticles.length === 0  && <Icon as={BsFillExclamationTriangleFill} color='red.600'/>}
                        <Text fontWeight={filteredArticles.length === 0 ? 'normal':'semibold'} fontSize={'.9em'} >{filteredArticles.length === 0 ?t('NoArticles'):filteredArticles.length}</Text>
                    </Flex>
                   
                    <Flex flex='1' justifyContent={'space-between'}  alignItems={'center'} > 
                        <Flex mr='50px' display={'inline-flex'} flexDir={'column'} alignItems={'center'} _hover={{bg:'gray_1'}} textAlign={'center'} color='text_blue' p='8px' borderRadius={'.5rem'} cursor={'pointer'}  onClick={() => setShowAddArticle(true)}>
                            <Icon as={FaPlus}/>
                            <Text>{t('AddArticles')}</Text>
                        </Flex>
                    </Flex>
                    {hoveringSection === 'collection' && <IconButton aria-label='delete-collection' position={'absolute'} right={'20px'} bg='transparent' size='sm' variant={'delete'} icon={<HiTrash size='20px'/>} onClick={() => setShowDeleteElement({type:'collection', id:''})}/>}
                </Flex>                
                <motion.div initial={false} animate={{height:expandCollection?'auto':0,}} exit={{height:expandCollection?0:'auto',  }} transition={{duration:.2}} >           

                    {filteredArticles.map((article, index2) => (
                        <Flex  position={'relative'} key={`article-${index2}`} borderTopColor={index === (filteredArticles?.length || 0) - 1 ?'':'border_color'}  borderTopWidth={index === (filteredArticles?.length || 0) - 1 ?'0':'1px'} gap='20px'  alignItems={'center'}  p='20px' _hover={{bg:'gray_2'}}  onMouseEnter={() => setHoveringSection(article.id)} onMouseLeave={() => setHoveringSection('')}> 
                            <Flex flex='3' alignItems={'center'}   gap={'20px'}>
                                <Flex ml='70px' justifyContent={'center'} alignItems={'center'} p='15px' bg='gray_1' borderRadius={'.5rem'}> 
                                    <Icon boxSize='25px' as={FaBookBookmark}/>
                                </Flex>
                                <Text fontWeight={'medium'}_hover={{color:'text_blue', textDecor:'underline'}} cursor={'pointer'} onClick={() => navigate(`/knowledge/article/${article.id}`)} fontSize={'1.2em'}>{article.title}</Text>
                            </Flex>
                            <Text flex='1' fontWeight={'semibold'}>-</Text>
                            <Box flex={'1'}> 
                                <Box boxShadow={`1px 1px 1px rgba(0, 0, 0, 0.15)`} display="inline-flex" fontSize='.9em' py='2px' px='8px' fontWeight={'medium'} color='white'  bg={article.data.status === 'draft'?'red.100':'green.100'} borderRadius={'.7rem'}> 
                                    <Text color={article.common_id === 'draft'?'red.600':'green.600'}>{t(article.common_id)}</Text>
                                </Box>    
                            </Box>                        
                             {hoveringSection === article.id && <IconButton aria-label='delete-collection' position={'absolute'} right={'40px'} bg='transparent' size='sm' variant={'delete'} icon={<HiTrash size='20px'/>}  onClick={() => setShowDeleteElement({type:'article', id:article.id})}/>}
                        </Flex>
                    ))}
                </motion.div>
            </Box>
        
        </>)
    }

    //CREATE COLLECTION FUNCTION
    const createCollection = async (name:string) => {

        const newCollection = {name, icon:firstIcon, description:''}

        const response = await fetchData({endpoint:`${auth.authData.organizationId}/help_centers/${helpCenterData?.id}/collections`,  getAccessTokenSilently,method:'post', requestForm:{help_center_id:helpCenterData?.id, data:{[selectedLanguage]:newCollection}}, auth})
        if (response?.status === 200){
            setCollectionsData(prevCollections => {
                if (prevCollections) {
                    const newId = response.data.id as string
                    return [...prevCollections,{...newCollection, language:selectedLanguage,  help_center_id: helpCenterData?.id || '', id: newId}]      
                }
                else return null
            })
        }
    }

    //DELETE FUNCTION
    const deleteHelpCenter = async () => {
        const response = await fetchData({endpoint: `${auth.authData.organizationId}/help_centers/${helpCenterData?.id}`, getAccessTokenSilently, method: 'delete',  auth })
        if (response?.status === 200) {
             navigate(`/help-centers${currentSearch}`)
        }
    }
 
    //CHANGE LANGUAGE
    const ChangeLanguage = () => {

        const { t } = useTranslation('settings')
     
        //SHOW LANGUAGES 
        const buttonRef2 = useRef<HTMLButtonElement>(null)
        const boxRef2 = useRef<HTMLDivElement>(null)
    
        //BOOLEAN TO CONTROL THE VISIBILITY OF THE LIST AND CLOSE ON OUTSIDE CLICK
        const [showList, setShowList] = useState<boolean>(false)
        useOutsideClick({ref1:buttonRef2, ref2:boxRef2, onOutsideClick:setShowList})

        const sectionsMap1 = {};
        ( helpCenterData?.languages || []).map((lang) => {(sectionsMap1 as any)[lang] = [languagesFlags[lang][0],<Box>{languagesFlags[lang][1]}</Box>]})

        //BOX POSITION LOGIC, TO SHOW IT UP OR DOWN OF THE INPUT, DEPENDING ON THE POSITION
        const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
        determineBoxStyle({buttonRef:buttonRef2, setBoxStyle, changeVariable:showList})
    
     
        const editLanguage = (lang:string) => {
            setHelpCenterData(prev => ({...prev as HelpCenterData, languages:[...(prev as HelpCenterData)?.languages, lang]}))
        }

        return (<>
            <Flex gap='12px' alignItems={'end'}> 
                <SectionSelector size='xs' selectedSection={selectedLanguage} sections={helpCenterData?.languages || []} sectionsMap={sectionsMap1} onChange={(lang:string) => setSelectedLanguage(lang)}/>  
                <Button ref={buttonRef2} variant='common' size='xs' color={showList? 'text_blue':'black'} bg={showList? 'gray_1':'gray_2'} leftIcon={<FaPlus/>} onClick={() => setShowList(true)}>{t('AddLanguage')}</Button>
            </Flex> 
            <AnimatePresence> 
              {showList && 
                <Portal> 
                    <MotionBox  ref={boxRef2} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                        style={{ transformOrigin:'top left'}} maxH={'40vh'} mt='29px' mb='29px' bg='white' boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} borderRadius={'.5rem'} zIndex={100000000} overflow={'scroll'} left={buttonRef2.current?.getBoundingClientRect().left  || undefined}  top={boxStyle.top || undefined}  bottom={boxStyle.bottom ||undefined} position='fixed' >
                        {Object.keys(languagesFlags).filter(item => !helpCenterData?.languages.includes(item)).map((lang, index) => (
                            <Flex key={`lang-${index}`} px='10px'  py='7px' cursor={'pointer'} justifyContent={'space-between'} alignItems={'center'} _hover={{bg:'hover_gray'}} onClick={() => {setShowList(false); editLanguage(lang)}}>
                                <Text>{languagesFlags[lang][1]} {languagesFlags[lang][0]}</Text>
                            </Flex>
                        ))}
                    </MotionBox>
                </Portal>}
            </AnimatePresence>
        </>)
    }

 
  
    //MEMOIZED ACTIONS BUTTON
    const memoizedActionsButton = useMemo(() => (<ActionsButton deleteAction={() => setShowDelete(true)} copyAction={() => {}} />), [])
    
    //MEMOIZED CHANGE LANGUAGE
    const memoizedChangeLanguage = useMemo(() => (<ChangeLanguage/>), [helpCenterData?.languages])

    return(<>
        <NoSavedWarning data={helpCenterData} dataRef={helpCenterDataRef}  saveData={() => updateHelpCenter(helpCenterData)}/>
        <ActionsBox title={t('CreateCollection')} showBox={showCreateCollection} introduceAtt={['name']} setShowBox={setShowCreateCollection} des={t('CreateCollectionDes')} type='action' buttonTitle={t('CreateCollection')} actionFunction={createCollection}/>
        <ActionsBox title={t('ConfirmDeleteHelpCenterName', {name:helpCenterData?.name})} showBox={showDelete}  setShowBox={setShowDelete} des={t('ConfirmDeleteHelpCenterDes')} type='delete' buttonTitle={t('DeleteHelpCenter')} actionFunction={deleteHelpCenter}/>

        <Box pt='2vh' px='2vw'> 
            <Flex justifyContent={'space-between'} alignItems={'end'}> 
                <Box> 
                    <EditText  value={helpCenterData?.name}  className={'title-textarea-collections'} setValue={(value) => setHelpCenterData(prev =>({...prev as HelpCenterData, name:value}))}/>
                </Box>
                <Flex gap='12px'>
                    {memoizedActionsButton}
                     <Skeleton isLoaded={helpCenterData !== null}> 
                        <Button  variant='common' size={'sm'} onClick={() => updateHelpCenter({...helpCenterData as HelpCenterData, is_live:!helpCenterData?.is_live })} leftIcon={<FaCircleDot color={helpCenterData?.is_live?'#68D391':'#ECC94B'}/>}>{helpCenterData ? helpCenterData?.is_live?t('IsLive'):t('NotIsLive'):t('IsLive')}</Button>
                    </Skeleton>
                    <Button size={'sm'} variant={'main'} isDisabled={JSON.stringify(helpCenterDataRef.current) === JSON.stringify(helpCenterData)} onClick={() => updateHelpCenter(helpCenterData as HelpCenterData)}>{waitingSave? <LoadingIconButton/>:t('SaveChanges')}</Button>
               </Flex>
            </Flex>

            <Flex justifyContent={'space-between'}> 
                <Box h='40px' > 
                    <SectionSelector notSection selectedSection={currentSection} sections={sectionsList} sectionsMap={sectionsMap} onChange={() => setCurrentSection(prev => (prev === 'collections'?'styles':'collections'))}/>
                </Box>
            </Flex>
            <Box bg='border_color' h='1px' w='100%'/>
 
        </Box>
  
        <Box ref={stylesHeaderRef} flex='1' >
        {(currentSection === 'styles') ? 
            <Flex flexDir={'column'} flex='1'  py='2vh'  px='2vw' >
                <EditStyles currentStyles={helpCenterData?.style as StylesConfig} currentCollections={collectionsData as any} publicArticlesData={publicArticlesData as ContentData<'public_article'>[]} setHelpCenterData={setHelpCenterData} stylesHeaderRef={stylesHeaderRef} />
            </Flex>
        :
        <Box flex='1' py='2vw' px='2vw'>
            <Flex flexDir={'row-reverse'} justifyContent={'space-between'}>
                <Button leftIcon={<FaPlus/>} size='sm' onClick={() => setShowCreateCollection(true)} variant='common'>{t('AddCollection')}</Button>
                {memoizedChangeLanguage}
            </Flex>
            <Skeleton isLoaded={collectionsData !== null && publicArticlesData !== null}>      
                {collectionsData?.length === 0 ?   
                    <Box bg='#f1f1f1' borderRadius={'.5rem'} mt='1vh' width='100%' borderColor={'border_color'} borderWidth={'1px'} p='15px'>    
                        <Text fontWeight={'medium'} fontSize={'1.1em'}>{t('NoCollections')}</Text>
                    </Box>:<> 
                         <Box  mt='1vh'  >    
                            <Flex position={'sticky'}  borderTopRadius={'.5rem'} borderColor={'border_color'} borderWidth={'1px'} gap='20px' ref={headerRef} alignItems={'center'}  color='text_gray' p='10px' fontSize={'1em'} bg='gray_2' > 
                                <Text flex='3' fontWeight={'medium'} color='text_gray' cursor='pointer'>{t('CollectionName')}</Text>
                                <Text flex='1'  fontWeight={'medium'} color='text_gray' cursor='pointer'>{t('NumberArticles')}</Text>
                                <Box flex='1'/>
                            </Flex>
                        </Box>
                        <Box overflowX={'hidden'}  borderWidth={'1px'} borderRadius={'0 0 .5rem .5rem'} borderColor={'border_color'} overflowY={'scroll'} maxH={boxHeight}> 
                            {collectionsData?.map((collection, index) => (
                            <Fragment key={`collection-${index}`}> 
                                <CollectionComponent collection={collection} index={index} key={`collection-${index}`}/>
                            </Fragment>))}
                        </Box>
                  
                </>}
            </Skeleton>
        </Box>
        }
        </Box>
    </>
    )
}
export default HelpCenter


const EditStyles = ({currentStyles, currentCollections, publicArticlesData, setHelpCenterData, stylesHeaderRef}:{currentStyles:StylesConfig,currentCollections:{name:string, icon:string, description:string}[], publicArticlesData:ContentData<'public_article'>[], setHelpCenterData:Dispatch<SetStateAction<HelpCenterData>>, stylesHeaderRef:RefObject<HTMLDivElement>}) => {

     //CONSTANTS
    const { t } = useTranslation('settings')
    const auth = useAuth()

    //SCROLL REF
    const containerRef = useRef<HTMLDivElement>(null)
    const session = useSession()
    const channels = session.sessionData.additionalData.channels?.filter(channel => channel.channel_type === 'webchat') || []
    const webchatChannel = channels?.length === 0 ?'':channels?.[0]?.id

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
        footer_message_2:'',
    
        enable_chat:false,
        chat_config:{org_id:String(auth.authData.organizationId), chatbot_id:webchatChannel || ''}
     }

 
    //STYLES DATA
    const [configStyles, setConfigStyles] = useState<StylesConfig>(Object.keys(currentStyles).length === 0?MatilStyles:currentStyles)
    useEffect(() => {setHelpCenterData(prev => ({...prev, style:configStyles}))},[configStyles])

    //CURRENT EXPANDED SECTION
    const [sectionExpanded, setSectionExpanded] = useState<sectionsTypes>('')

    return (
        <>  
        <Flex height={window.innerHeight - window.innerWidth * 0.02 - (stylesHeaderRef.current?.getBoundingClientRect().top || 0)} flex='1' gap='30px' minHeight='0'>
             <Flex px='2px' minW={'450px'} flexDir={'column'} flex='3' maxH={'100%'}  overflow={'scroll'} ref={containerRef} >
                <CollapsableSection section={'common'} setSectionExpanded={setSectionExpanded} sectionExpanded={sectionExpanded}>
                    <Box mt='2vh'> 
                        <EditImage value={configStyles.favicon} setValue={(value) => setConfigStyles(prev => ({...prev, favicon:value}))}  title={t('FavIcon')} description={t('FavIconDes')} maxImageSize={150}  />
                    </Box>
                    
                    <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='border_color'/>
                    <Text fontWeight={'medium'} mb='2vh'>{t('GlobalColors')}</Text>    
                    <EditColor value={configStyles.text_background} setValue={(value) => setConfigStyles(prev => ({...prev, text_background:value as any}))}   title={t('TextBackground')} description={t('TextBackgroundDes')} containerRef={containerRef}/>
                  
                    <Box mt='2vh'> 
                        <EditColor  value={configStyles.text_color} setValue={(value) => setConfigStyles(prev => ({...prev, text_color:value as any}))}  title={t('TextBackground')} description={t('TextBackgroundDes')} containerRef={containerRef}/>
                    </Box>
                    <Box mt='2vh'> 
                        <EditColor value={configStyles.actions_color} setValue={(value) => setConfigStyles(prev => ({...prev, actions_color:value as any}))}  title={t('ActionsColor')} description={t('ActionsColorDes')} containerRef={containerRef}/>
                    </Box>
                    <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='border_color'/>
                    <Text fontWeight={'medium'} mb='2vh'>{t('Cards')}</Text>    
                    <EditBool  value={configStyles.floating_cards} setValue={(value) => setConfigStyles(prev => ({...prev, floating_cards:value as any}))} title={t('CardsStyle')} description={t('CardsStyleDes')} />
                    
                    {!configStyles.floating_cards && <Box mt='2vh'> 
                        <EditInt value={configStyles.cards_borderradius} setValue={(value) => setConfigStyles(prev => ({...prev, cards_borderradius:value as any}))}  title={t('BorderRadius')} min={0} max={24}/>
                    </Box>}
                </CollapsableSection>

                <CollapsableSection section={'header'} setSectionExpanded={setSectionExpanded} sectionExpanded={sectionExpanded} >
                    <Box mt='2vh'> 
                        <EditImage value={configStyles.logo} setValue={(value) => setConfigStyles(prev => ({...prev, logo:value as any}))} title={t('Logo')} description={t('LogoDes')} />
                    </Box>
                    <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='border_color'/>
                    <EditStr value={configStyles.title} setValue={(value) => setConfigStyles(prev => ({...prev, title:value as any}))} title={t('HeaderTitle')} description={t('HeaderTitleDes')} placeholder={t('HeaderTitlePlaceholder' ,{company:auth.authData.organizationName})}/>
                    
                    <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='border_color'/>
                    
                    <Text  mb='2vh' fontWeight={'medium'}>{t('Background')}</Text>
                    <EditBool value={configStyles.show_header} setValue={(value) => setConfigStyles(prev => ({...prev, show_header:value as any}))}   title={t('ShowBackground')} />
                    {configStyles.show_header && 
                    <Box mt='2vh' maxW={'200px'}> 
                        <EditColor value={configStyles.header_background} setValue={(value) => setConfigStyles(prev => ({...prev, header_background:value as any}))}  title={t('BackgroundColor')} containerRef={containerRef}/>
                        <Box mt='2vh'> 
                            <EditColor value={configStyles.header_color} setValue={(value) => setConfigStyles(prev => ({...prev, header_color:value as any}))}  title={t('TextColor')} containerRef={containerRef}/>
                        </Box>                    
                    </Box>}

                    <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='border_color'/>
                    <EditLinks configStyles={configStyles} setConfigStyles={setConfigStyles} keyToEdit='links' title={t('Links')} description={t('LinksDes')} />
                </CollapsableSection>

                <CollapsableSection section={'hero'} setSectionExpanded={setSectionExpanded} sectionExpanded={sectionExpanded}>
                    <Box mt='2vh'> 
                        <EditStr  value={configStyles.welcome_message} setValue={(value) => setConfigStyles(prev => ({...prev, welcome_message:value as any}))}  title={t('WelcomeMessage')} placeholder={t('WelcomeMessagePlaceholder' ,{company:auth.authData.organizationName})}/>
                    </Box>
                    <Box mt='2vh'> 
                        <EditStr  value={configStyles.search_placeholder} setValue={(value) => setConfigStyles(prev => ({...prev, search_placeholder:value as any}))} title={t('PlaceholderMessage')} placeholder={t('PlaceholderPlaceholderMessage' ,{company:auth.authData.organizationName})}/>
                    </Box>
                    <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='border_color'/>
                    <Text  mb='2vh' fontWeight={'medium'}>{t('Background')}</Text>
                    <EditBool  value={configStyles.show_image} setValue={(value) => setConfigStyles(prev => ({...prev, show_image:value as any}))}  title={t('ShowHeroImage')} />
                     <Box mt='2vh'>
                        {configStyles.show_image ? 
                        <EditImage  value={configStyles.hero_image} setValue={(value) => setConfigStyles(prev => ({...prev, hero_image:value as any}))}  title={t('HeroImage')} description={t('HeroImageDes')} />
                        :
                        <EditColor value={configStyles.hero_background} setValue={(value) => setConfigStyles(prev => ({...prev, hero_background:value as any}))} title={t('BackgroundColor')} isGradient containerRef={containerRef}/>
                        }
                    </Box>
                    <Box mt='2vh'>
                        <EditBool value={configStyles.blurred_hero} setValue={(value) => setConfigStyles(prev => ({...prev, blurred_hero:value as any}))}  title={t('BlurredHero')}/>
                    </Box>

                    <Box height={'1px'} mt='2vh' width={'100%'} bg='border_color'/>
                    <Box mt='2vh'>
                        <EditColor value={configStyles.hero_color} setValue={(value) => setConfigStyles(prev => ({...prev, hero_color:value as any}))} title={t('TextColor')} containerRef={containerRef}/>
                    </Box>
                 
                </CollapsableSection>

                <CollapsableSection section={'collections'} setSectionExpanded={setSectionExpanded} sectionExpanded={sectionExpanded}>
                    <EditCollections configStyles={configStyles} setConfigStyles={setConfigStyles}  containerRef={containerRef}/>
                </CollapsableSection>

                <CollapsableSection section={'sections'} setSectionExpanded={setSectionExpanded} sectionExpanded={sectionExpanded}>
                    <Box mt='2vh'> 
                     <EditBool  value={configStyles.enable_chat} setValue={(value) => setConfigStyles(prev => ({...prev, enable_chat:value as any}))}  title={t('ShowChat')} />
                     </Box>
                     {configStyles.enable_chat && 
                        <Box>
                        {channels.map((cha, index) => (
                            <Flex mt='1vh' cursor={'pointer'} borderWidth={'1px'} transition={'box-shadow 0.2s ease-in-out, background  0.2s ease-in-out'} boxShadow={configStyles?.chat_config?.chatbot_id === cha.id ? '0 0 3px 0px rgba(0, 0, 0, 0.1)':''} bg={configStyles?.chat_config?.chatbot_id === cha.id ? 'blue_hover':'white'} borderColor={'border_color'} borderRadius={'.5rem'} flexDir={'column'} key={`channel-${index}`} p='8px' onClick={() => setConfigStyles(prev => ({...prev, chat_config:{org_id:String(auth.authData.organizationId), chatbot_id:cha.id}}))}>
                                <Text fontSize={'.9em'} fontWeight={'medium'}>{cha.name}</Text>
                                <Text  fontSize={'.8em'} color='text_gray'>{cha.id}</Text>

                            </Flex>
                        ))}
                        </Box>
                     }

                    <Text  fontSize={'1.2em'} fontWeight={'medium'} mt='2vh' mb='2vh'>{t('ArticlesSection')}</Text>
                    <EditBool value={configStyles.show_article_section} setValue={(value) => setConfigStyles(prev => ({...prev, show_article_section:value as any}))} title={t('ShowArticles')} />
                    {configStyles.show_article_section && <EditArticles configStyles={configStyles} setConfigStyles={setConfigStyles}  containerRef={containerRef} publicArticlesData={publicArticlesData}/>}
                    <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='border_color'/>
                    
                    <Text  mb='2vh' fontSize={'1.2em'} fontWeight={'medium'}>{t('Content')}</Text>
                    <EditBool value={configStyles.show_content_section} setValue={(value) => setConfigStyles(prev => ({...prev, show_content_section:value as any}))} title={t('ShowContent')} />
                    {configStyles.show_content_section && <>
                        <Box mt='2vh'> 
                            <EditStr value={configStyles.content_section_title} setValue={(value) => setConfigStyles(prev => ({...prev, content_section_title:value as any}))}  title={t('ContentTitle')} placeholder={t('ContentTitle')} />
                        </Box>
                        <Box mt='2vh'> 
                            <EditStr value={configStyles.content_section_description} setValue={(value) => setConfigStyles(prev => ({...prev, content_section_description:value as any}))}  title={t('Description')} placeholder={t('Description')}/>
                        </Box>

                        <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='border_color'/>
                        <Text  mb='2vh' fontWeight={'medium'}>{t('Button')}</Text>
                        <EditBool  value={configStyles.content_section_add_button} setValue={(value) => setConfigStyles(prev => ({...prev, content_section_add_button:value as any}))}   title={t('AddButton')} />
                
                        {configStyles.show_content_section && <>
                            <Box mt='2vh'> 
                                <EditStr value={configStyles.content_section_button_title} setValue={(value) => setConfigStyles(prev => ({...prev, content_section_button_title:value as any}))}  title={t('ButtonTitle')} placeholder={t('ButtonTitle')}/>
                            </Box>
                            <Box mt='2vh'> 
                                <EditStr value={configStyles.content_section_button_link} setValue={(value) => setConfigStyles(prev => ({...prev, content_section_button_link:value as any}))}  title={t('ButtonLink')} placeholder={'https://matil.ai'}/>
                            </Box>
                            <Box mt='2vh'> 
                                <EditColor value={configStyles.content_section_button_background} setValue={(value) => setConfigStyles(prev => ({...prev, content_section_button_background:value as any}))}  title={t('ButtonBackground')} containerRef={containerRef}/>
                            </Box>
                            <Box mt='2vh'> 
                                <EditColor value={configStyles.content_section_button_color} setValue={(value) => setConfigStyles(prev => ({...prev, content_section_button_color:value as any}))}  title={t('ButtonColor2')} containerRef={containerRef}/>
                            </Box>
                            <Box mt='2vh'> 
                                <EditInt value={configStyles.content_section_button_borderradius} setValue={(value) => setConfigStyles(prev => ({...prev, content_section_button_borderradius:value as any}))}  title={t('ButtonBorderRadius')} min={0} max={24}/>
                            </Box>
                        </>}
                        <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='border_color'/>
                        <Text  mb='2vh' fontWeight={'medium'}>{t('Styles')}</Text>
                        <EditBool value={configStyles.content_section_is_card} setValue={(value) => setConfigStyles(prev => ({...prev, content_section_is_card:value as any}))}  title={t('IsContentCard')} />
                        <Box mt='2vh'> 
                            <EditBool value={configStyles.content_section_show_background_image} setValue={(value) => setConfigStyles(prev => ({...prev, content_section_show_background_image:value as any}))}  title={t('ShowBackgroundImage')} />
                        </Box>
                        <Box mt='2vh'> 
                            {configStyles.content_section_show_background_image ? 
                                <EditImage value={configStyles.content_section_background_image} setValue={(value) => setConfigStyles(prev => ({...prev, content_section_background_image:value as any}))}  title={t('BackgroundImage')} maxImageSize={1000} />
                                :
                                <EditColor value={configStyles.content_section_background} setValue={(value) => setConfigStyles(prev => ({...prev, content_section_background:value as any}))} title={t('BackgroundColor')}  containerRef={containerRef} isGradient/> 
                            }    
                        </Box>
                        <Box mt='2vh'> 
                            <EditColor value={configStyles.content_section_text_color} setValue={(value) => setConfigStyles(prev => ({...prev, content_section_text_color:value as any}))}  title={t('TextColor')}  containerRef={containerRef} /> 
                        </Box>

                    </>}
                </CollapsableSection>

                <CollapsableSection section={'footer'} setSectionExpanded={setSectionExpanded} sectionExpanded={sectionExpanded}>
                    <Box mt='2vh'> 
                        <EditStr value={configStyles.footer_message} setValue={(value) => setConfigStyles(prev => ({...prev, footer_message:value as any}))} title={t('FooterHero')} />
                    </Box>
                    <Box mt='2vh'> 
                        <EditStr value={configStyles.footer_message_2} setValue={(value) => setConfigStyles(prev => ({...prev, footer_message_2:value as any}))} title={t('FooterSubHero')} />
                    </Box>
                    <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='border_color'/>
                    <Text  mb='2vh' fontWeight={'medium'}>{t('Colors')}</Text>
                    <EditColor value={configStyles.footer_background} setValue={(value) => setConfigStyles(prev => ({...prev, footer_background:value as any}))} title={t('BackgroundColor')} containerRef={containerRef}/>
                    <Box mt='2vh'> 
                        <EditColor value={configStyles.footer_color} setValue={(value) => setConfigStyles(prev => ({...prev, footer_color:value as any}))}  title={t('TextColor')} containerRef={containerRef}/>
                    </Box>  
                    <Box mt='2vh'> 
                        <EditSocialNetworks configStyles={configStyles} setConfigStyles={setConfigStyles}/>
                    </Box>  
                </CollapsableSection>
                
            </Flex>
            <Box flex='5' width={'calc(100% + 2vw)'}  height={'calc(100% + 2vw)'} bg='gray_2' borderRadius={'.7rem 0 0 0'} p='15px'>
                <Box width={'100%'} height={'100%'} overflowY={'scroll'} borderRadius={'.5rem'} overflow={'hidden'}>
                    <GetHelpCenter configStyles={configStyles} currentCollections={currentCollections}/>
                </Box>
            </Box>
        </Flex>
    </>)
}

const CollapsableSection = ({section, sectionExpanded, setSectionExpanded, children}:{section:sectionsTypes, sectionExpanded:sectionsTypes, setSectionExpanded:Dispatch<SetStateAction<sectionsTypes>>, children:ReactNode}) => {

    const { t } = useTranslation('settings')
    const isExpanded = sectionExpanded === section
    const [isHovering, setIsHovering] = useState<boolean>(false)

    return (
        <Box p='20px'  bg={(isExpanded || isHovering) ?'white':'#FDFDFD'}  width={'100%'} mb='3vh'  borderWidth={'1px'} borderColor={(isExpanded || isHovering) ? 'text_blue':'border_color'} borderRadius={'.5rem'} shadow={(isExpanded || isHovering)?'md':'sm'} transition={'box-shadow 0.3s ease-in-out, background-color 0.3s ease-in-out,border-color 0.3s ease-in-out'} onMouseEnter={() => setIsHovering(true)}  onMouseLeave={() => setIsHovering(false)}  >
            <Flex cursor={'pointer'} alignItems={'center'} justifyContent={'space-between'} onClick={() => setSectionExpanded(isExpanded?'':section)}>
                <Text color={(isHovering && !isExpanded)?'text_blue':'black'} fontWeight={'medium'} fontSize={'1.2em'}>{t(section)}</Text>
                <IoIosArrowDown color={(isExpanded || isHovering) ? 'rgb(59, 90, 246)':'text_gray'} className={isExpanded ? "rotate-icon-up" : "rotate-icon-down"}/>
            </Flex>
            <motion.div initial={false} animate={{height:isExpanded?'auto':0}} exit={{height:isExpanded?0:'auto'}} transition={{duration:.3}} style={{overflow:'hidden'}} >           
                {children}
            </motion.div>
        </Box>
    )
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
            {description && <Tooltip isOpen={hoverDescription} label={description} mt='-4px' placement='right' hasArrow bg='black_button'  borderRadius='.4rem'  fontSize='.7em' color='white' p='6px' >
                <Box onMouseEnter={() => setHoverDescription(true)} onMouseLeave={() => setHoverDescription(false)}> 
                    <Icon as={FaQuestionCircle} mt='3px' color='#222'  />
                </Box>
            </Tooltip>}
        </Flex>
     
 
        {(configStyles[keyToEdit] as {tag:string, url:string}[]).map((link, index) => (
          <Flex mt='1vh' width={'100%'} alignItems={'end'} key={`links-${index}`} gap='10px'>
            <Box flex='1'>
                {index === 0 && <Text mb='1vh' color='text_gray' fontSize={'.9em'}>{t('Title')}</Text>}
                <EditText hideInput={false} value={link.tag} placeholder={'Tag'} setValue={(newValue: string) => handleEditTag(index, newValue)}/>
            </Box>
            <Box flex='1'>
                {index === 0 &&<Text  mb='1vh' color='text_gray' fontSize={'.9em'}>{t('URL')}</Text>}
                <EditText regex={/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/[^\s]*)?$/} hideInput={false}value={link.url}placeholder={'Link'} setValue={(newValue: string) => handleEditUrl(index, newValue)}/>
            </Box>
            <IconButton mt={index===0?'1vh':''} bg='transparent' border='none' size='sm' _hover={{ bg: 'border_color' }} icon={<RxCross2 />} aria-label='delete-link' onClick={() => handleDeleteLink(index)}/>
          </Flex>
        ))}
        
        <Button mt='2vh' size='xs' variant={'common'} leftIcon={<FaPlus/>} isDisabled={Object.keys(configStyles[keyToEdit]).length === 3} onClick={handleAddLink}>{t('AddLink')}</Button>

    </>)
}

const EditSocialNetworks = ({configStyles, setConfigStyles}:{configStyles:StylesConfig, setConfigStyles:Dispatch<SetStateAction<StylesConfig>>}) => {
    
    const { t } = useTranslation('settings')
 
 
    const options: socialNetworks[] = ["whatsapp", "mail", "facebook", "x", "instagram", "linkedin", "youtube", "tiktok", "pinterest", "github", "reddit", "discord", "twitch", "telegram", "spotify"]
    const socialIconsMap:{[key in socialNetworks]:[string, IconType]} = {whatsapp:["Whatsapp", IoLogoWhatsapp], mail:["Email", IoMdMail], facebook: ["Facebook", FaFacebook],x: ["X", TbBrandX], instagram: ["Instagram", FaInstagram],linkedin: ["LinkedIn", FaLinkedin],youtube: ["YouTube", FaYoutube], tiktok: ["TikTok", FaTiktok], pinterest: ["Pinterest", FaPinterest], github: ["GitHub", FaGithub], reddit: ["Reddit", FaReddit], discord: ["Discord", FaDiscord], twitch: ["Twitch", FaTwitch], telegram: ["Telegram", FaTelegram], spotify: ["Spotify", FaSpotify]}
 
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
            <Flex flex='1' >
                <Flex alignItems={'center'} px='5px' color='text_gray' borderRadius={'.5rem 0 0 .5rem'}  borderWidth={'1px 0px 1px 1px'} borderColor={'border_color'} flex='4    ' bg='gray_2'>
                    <Text fontSize={'.8em'}>{company === 'whatsapp' ? `https://wa.me/` :  company === 'mail'? 'mailto:':`https://${company}.com/`}</Text>
                </Flex>
                <Box flex='5'>
                    <EditText borderRadius={'0 .5rem .5rem 0'} hideInput={false} value={configStyles.social_networks[company]}  setValue={(newValue: string) => handleEditUrl(company as socialNetworks, newValue)}/>
                </Box>
            </Flex>
            <IconButton bg='transparent' border='none' size='sm' _hover={{ bg: 'border_color' }} icon={<RxCross2 />} aria-label='delete-link' onClick={() => handleDeleteLink(company as socialNetworks)}/>

          </Flex>
        ))}
        <Button ref={buttonRef} mt='2vh' size='xs' variant={'common'} leftIcon={<FaPlus/>} onClick={determineBoxPosition}>{t('AddSocialNetwork')}</Button>
       {settingsBoxPosition && 
       <Portal> 
            <MotionBox ref={boxRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                style={{ transformOrigin: settingsBoxPosition.top ? 'top left':'bottom left' }} maxH={'45vh'} overflow={'scroll'} left={settingsBoxPosition.left}  top={settingsBoxPosition.top || undefined}  bottom={settingsBoxPosition.bottom ||undefined} position='absolute' bg='white' p='8px'  zIndex={1000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='border_color' borderWidth='1px' borderRadius='.7rem'>

                {options.filter(option => !Object.keys(configStyles.social_networks).includes(option)).map((option, index) =>( 
                    <Flex px='15px' key={`social-network-edit-${index}`} borderRadius='.5rem' onClick={() => handleAddLink(option)} py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'gray_2'}}>
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
            <EditBool value={configStyles.show_collections} setValue={(value) => setConfigStyles(prev => ({...prev, show_collections:value as any}))} title={t('ShowCollections')} />
        </Box>

        {configStyles.show_collections && <>
            <Text mb='.5vh'  mt='2vh' fontSize={'.9em'} fontWeight={'medium'}>{t('Columns')}</Text>
            <SectionSelector selectedSection={configStyles.collections_columns} sections={[1,2,3]} sectionsMap={{'1':[t('Column', {count:1}),<GetColumsIcon count={1}/>], '2':[t('Column', {count:2}),<GetColumsIcon count={2}/>], '3':[t('Column', {count:3}),<GetColumsIcon count={3}/>]}} onChange={(value) => setConfigStyles(prev => ({...prev as StylesConfig, collections_columns:value} ))}/>
            <Box mt='2vh' mb='2vh'>
                <Text mb='.5vh' fontSize={'.9em'} fontWeight={'medium'}>{t('CollectionAlign')}</Text>
                <SectionSelector selectedSection={configStyles.collections_icons_text_align} sections={['row','column']} sectionsMap={{'row':[t('Horizontal', {count:1}),<GetColumsIcon count={2}  />], 'column':[t('Vertical', {count:2}),<GetColumsIcon count={2} isVertical/>]}} onChange={(value) => setConfigStyles(prev => ({...prev as StylesConfig, collections_icons_text_align:value} ))}/>
            </Box>
            <EditBool value={configStyles.show_collections_description} setValue={(value) => setConfigStyles(prev => ({...prev, show_collections_description:value as any}))}  title={t('ShowDescriptions')} />

            <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='border_color'/>
            <Text  mb='2vh' fontWeight={'medium'}>{t('Icons')}</Text>
            
            <EditBool value={configStyles.show_icons} setValue={(value) => setConfigStyles(prev => ({...prev, show_icons:value as any}))}  title={t('ShowIcons')} />
            {configStyles.show_icons && <>
                <Box mt='2vh' > 
                    <EditColor value={configStyles.icons_color} setValue={(value) => setConfigStyles(prev => ({...prev, icons_color:value as any}))}   title={t('IconsColor')} containerRef={containerRef}/>
                </Box>
                <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='border_color'/>
                <Text  mb='2vh' fontWeight={'medium'}>{t('IconsBackground')}</Text>
            
                <Box mt='2vh'> 
                    <EditBool value={configStyles.show_icons_background} setValue={(value) => setConfigStyles(prev => ({...prev, show_icons_background:value as any}))}   title={t('ShowIconsBackground')} />
                </Box>
            
                {configStyles.show_icons_background && <>
                    <Box mt='2vh'> 
                        <EditBool value={configStyles.show_icons_background_image} setValue={(value) => setConfigStyles(prev => ({...prev, show_icons_background_image:value as any}))} title={t('ShowIconsBackgroundImage')} />
                    </Box>
                    <Box mt='2vh'> 
                        {configStyles.show_icons_background_image ? 
                            <EditImage value={configStyles.icons_background_image} setValue={(value) => setConfigStyles(prev => ({...prev, icons_background_image:value as any}))} title={t('IconsBackgroundImage')} maxImageSize={1000} />
                            :
                            <EditColor value={configStyles.icons_background_color} setValue={(value) => setConfigStyles(prev => ({...prev, icons_background_color:value as any}))} title={t('IconsBackgroundColor')}  containerRef={containerRef} isGradient/> 
                        }    
                    </Box>
                </>}
            </>}
        </>}
    </>)
}

const EditArticles = ({configStyles, setConfigStyles, containerRef, publicArticlesData}:{configStyles:StylesConfig, setConfigStyles:Dispatch<SetStateAction<StylesConfig>>, containerRef:RefObject<HTMLDivElement>, publicArticlesData:ContentData<'public_article'>[]}) => {
    
    const { t } = useTranslation('settings')
  
    const filterdArticles = publicArticlesData.filter(art => art.data.status === "published")

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
    const addColumn = (art:{name:string, id:string, description:string}) => {
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

    const selectableArticles = filterdArticles.filter(art => !configStyles.article_section.some(item => item.id === art.id))

    return(<>
    
        <Box mt='2vh'> 
            <EditStr value={configStyles.article_section_title} setValue={(value) => setConfigStyles(prev => ({...prev, article_section_title:value as any}))} title={t('ArticleTitle')} />
        </Box>
        <Box mt='2vh' >
            <Text mb='.5vh' fontSize={'.9em'} fontWeight={'medium'}>{t('ArticleColumns')}</Text>
            <SectionSelector selectedSection={configStyles.article_section_columns} sections={[1,2,3]} sectionsMap={{'1':[t('Column', {count:1}),<GetColumsIcon count={1}/>], '2':[t('Column', {count:2}),<GetColumsIcon count={2}/>], '3':[t('Column', {count:3}),<GetColumsIcon count={3}/>]}} onChange={(value) => setConfigStyles(prev => ({...prev as StylesConfig, article_section_columns:value} ))}/>
        </Box>
        <Box height={'1px'} mt='2vh' mb='2vh' width={'100%'} bg='border_color'/>
        <Text  fontWeight={'medium'} >{t('Articles')}</Text>
        
         <DragDropContext onDragEnd={onDragEnd} autoScrollerOptions={{disabled:true}}>
            <Droppable droppableId="columns" direction="vertical">
                    {(provided) => (
                        <Box ref={provided.innerRef}  {...provided.droppableProps} >
                            {configStyles.article_section.map((art, index) => (
                                <Draggable  key={`column-view-${index}`} draggableId={`column-view-${index}`} index={index}>
                                    {(provided, snapshot) => (
                                        <Flex ref={provided.innerRef} alignItems="center" gap='20px' {...provided.draggableProps} {...provided.dragHandleProps}   boxShadow={snapshot.isDragging?'0 4px 8px rgba(0, 0, 0, 0.3)':'none'}  flex='1' minW='300px' justifyContent={'space-between'}  mt='.5vh' bg='gray_2' borderRadius={'.5rem'} borderColor='border_color' borderWidth={'1px'} p='5px'>
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
                    style={{ transformOrigin: articlesBoxPosition.top ? 'top left':'bottom left' }} maxH={'45vh'} minW={buttonRef.current?.getBoundingClientRect().width} overflow={'scroll'} left={articlesBoxPosition.left}  top={articlesBoxPosition.top || undefined}  bottom={articlesBoxPosition.bottom ||undefined} position='absolute' bg='white' p='8px'  zIndex={1000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='border_color' borderWidth='1px' borderRadius='.7rem'>
                        {selectableArticles.length === 0 ?<Text>{t('NoMorePublishedArticles')}</Text>:<> 
                        {filterdArticles.filter(art => !configStyles.article_section.some(item => item.id === art.id)).map((art, index) => (
                            <Flex px='15px' key={`social-network-${index}`} borderRadius='.5rem' onClick={() => addColumn({name:art.title, id:art.id, description:art.description})} py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'gray_2'}}>
                                <Text fontSize={'.9em'} whiteSpace={'nowrap'}>{art.title}</Text>
                            </Flex>
                            ))}        
                        </>}
                </MotionBox >
        </Portal>}
    </>)
}

const GetHelpCenter = ({configStyles, currentCollections}:{configStyles:StylesConfig, currentCollections:{name:string, icon:string, description:string}[]}) => {

    const socialIconsMap:{[key in socialNetworks]:[string, IconType]} = {whatsapp:["Whatsapp", IoLogoWhatsapp], mail:["Email", IoMdMail], facebook: ["Facebook", FaFacebook],x: ["X", TbBrandX], instagram: ["Instagram", FaInstagram],linkedin: ["LinkedIn", FaLinkedin],youtube: ["YouTube", FaYoutube], tiktok: ["TikTok", FaTiktok], pinterest: ["Pinterest", FaPinterest], github: ["GitHub", FaGithub], reddit: ["Reddit", FaReddit], discord: ["Discord", FaDiscord], twitch: ["Twitch", FaTwitch], telegram: ["Telegram", FaTelegram], spotify: ["Spotify", FaSpotify]}

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
                    
                        {/* Articles Section */}
                        {configStyles?.show_article_section && 
                        <Flex flexDir={'column'}  padding={configStyles?.floating_cards?'0':'35px'} mt='40px' maxW={configStyles.content_section_is_card?'960px':'100%'} width={'100%'}  bg={configStyles?.floating_cards? 'transparent':configStyles?.text_background} zIndex={10000}  p='20px' gap='15px' borderRadius={configStyles?.cards_borderradius}  boxShadow={configStyles?.floating_cards?'':'0 0 10px 1px rgba(0, 0, 0, 0.15)'} >
                            <Heading  as="h2" fontSize={'20px'}  fontWeight={'500'}>{configStyles.article_section_title}</Heading>
                            <Grid mt='15px' gap={(isComputerWidth || configStyles?.article_section_columns === 1)?'10px':'20px'}  width={'100%'} justifyContent={'space-between'} templateColumns={`repeat(${isComputerWidth ? configStyles?.article_section_columns:1}, 1fr)`}> 
                                {configStyles.article_section?.map((article, index) => (
                                  
                                     <Flex minW={0} justifyContent={'space-between'} alignItems={'center'} key={`article-styles-${index}`} fontSize={'14px'} p='7px' gap='10px'  _hover={{bg:getHoverColor(configStyles?.text_background)}} borderRadius={'.5rem'} cursor={'pointer'} >
                                        <Box flex='1' minW={0}> 
                                            <Text cursor={'pointer'} fontSize={'16px'} fontWeight={'600'}>{article.name}</Text>
                                            <Text minW={0} fontSize={'14px'} overflow={'hidden'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}>{article.description}</Text>
                                        </Box>
                                        <Icon as={IoIosArrowForward}/>
                                    </Flex>
                                ))}
                            </Grid>
                        </Flex>}

                    {/* Collections Section */}
                    {configStyles.show_collections && <Box width={'100%'} maxW={'960px'}  > 
                        <Grid mt='15px' gap={'20px'}  width={'100%'} justifyContent={'space-between'} templateColumns={`repeat(${isComputerWidth ? configStyles?.collections_columns:1}, 1fr)`}> 
                            {currentCollections?.map((col, index) => (
                                <Flex key={`collection-styles-${index}`} flexDirection={configStyles?.collections_icons_text_align}   bg={configStyles?.floating_cards? 'transparent':configStyles?.text_background} zIndex={10000}   padding={configStyles?.floating_cards?'20px 0 20px 0':'20px'} gap='15px' borderRadius={configStyles?.cards_borderradius} width='100%'  boxShadow={configStyles?.floating_cards?'':'0 0 10px 1px rgba(0, 0, 0, 0.15)'} _hover={{transform:configStyles?.floating_cards?'scale(1)':'scale(1.03)'}} transition={'transform 0.3s ease'} cursor={configStyles?.floating_cards?'normal':'pointer'}>
                                    {configStyles?.show_icons && 
                                    <Flex width={'42px'} height={'42px'} borderRadius={'7px'} justifyContent={'center'} alignItems={'center'} p='10px'  backgroundSize="cover" backgroundPosition="center" backgroundRepeat="no-repeat" backgroundImage={configStyles.show_icons_background ? (configStyles.show_icons_background_image  && configStyles.icons_background_image !== '')? `url(${configStyles.icons_background_image})`: `linear-gradient(${configStyles.icons_background_color[0]}, ${configStyles.icons_background_color[1]})`:'transparent'}>
                                        {col.icon.startsWith('icon:') ? <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(col.icon.split('icon:')[1])}`} alt={'selected-icon'} style={{ width: 20, height: 20 }} /> :col.icon}
                                    </Flex>}
                                    <Box fontSize={'14px'}>
                                        <Text cursor={'pointer'} _hover={{textDecor:configStyles?.floating_cards?'underline':'normal', color:configStyles?.floating_cards?configStyles?.actions_color:''}}    fontSize={'16px'} fontWeight={'600'}>{col.name}</Text>
                                        {configStyles?.show_collections_description && <Text fontSize={'14px'}>{col.description}</Text>}
                                    </Box>
                                </Flex>
                            ))}
                        </Grid>
                    </Box>}

                 
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
            <Text fontSize={'24px'} fontWeight={500}>{configStyles?.footer_message}</Text>
            <Text  mt='15px' fontSize={'16px'}>{configStyles?.footer_message_2}</Text>
            <HStack justify="center" gap='15px' mt='30px'>
                {Object.entries(configStyles?.social_networks || {}).map(([key, value], index) => (
                    <Icon cursor={'pointer'}   onClick={() => {if (key === "whatsapp") window.open(`https://wa.me/${value}`, '_blank'); else if (key === "mail") window.open(`mailto:${value}`, '_self'); else window.open(`https://www.${key}.com/${value}`, '_blank') }} boxSize={'20px'} as={socialIconsMap[key as socialNetworks][1]}/>
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

