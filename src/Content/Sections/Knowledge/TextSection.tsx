 //REACT
import { useState, useEffect, useRef, Dispatch, SetStateAction, ReactNode, KeyboardEvent, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../AuthContext"
import { useLocation, useNavigate } from "react-router-dom"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Skeleton, Box, Text, Icon, chakra, shouldForwardProp, Tooltip, Button, IconButton, Input, Switch, Textarea } from "@chakra-ui/react"
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion'
import "../../Components/styles.css"
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import 'quill-divider'
//import QuillTable from 'quill-table'
//COMPONENTS
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
//FUNCTIONS
import parseMessageToBold from "../../Functions/parseToBold"
import timeStampToDate from "../../Functions/timeStampToString"
import timeAgo from "../../Functions/timeAgo"
//ICONS
import { FaFolder,FaLink, FaCode, FaLock, FaFilePdf, FaFileLines, FaAlignCenter, FaAlignJustify, FaAlignLeft, FaAlignRight, FaImage, FaTable, FaListOl, FaListUl } from "react-icons/fa6"
import { IoBook } from "react-icons/io5"
import { IoIosArrowDown } from "react-icons/io"
import { RxCross2, } from "react-icons/rx"
import { BsTypeH1, BsTypeH2, BsTypeH3, BsTypeH4, BsTypeBold, BsTypeItalic,  BsTypeUnderline } from "react-icons/bs";
import { MdVideoLibrary } from "react-icons/md"
import { TbLayoutDistributeVerticalFilled } from "react-icons/tb"
import { PiCursorClickFill, PiSidebarSimpleBold } from "react-icons/pi"
import { BiWorld } from "react-icons/bi"

//TYPING
import { ContentData, languagesFlags } from "../../Constants/typing" 
import { BsTrash3Fill } from "react-icons/bs"
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
 

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    })
}


const TypesComponent = ({t,  type }:{t:any, type:'internal_article' | 'public_article' | 'folder' | 'pdf' | 'text' | 'web'}) => {
    const getAlertDetails = (type:'internal_article' | 'public_article' | 'folder' | 'pdf' | 'text' | 'web') => {
        switch (type) {
            case 'internal_article':
                return { color1: 'yellow.100', color2:'yellow.200', icon: FaLock, label: t('InternalArticle') }
            case 'public_article':
                return { color1: 'blue.100', color2:'blue.200', icon: IoBook, label: t('PublicArticle')  }
            case 'folder':
                return { color1: 'brand.gray_1', color2:'gray.300', icon: FaFolder, label: t('Folder')  }
            case 'pdf':
                return { color1: 'brand.gray_1', color2:'gray.300', icon: FaFilePdf, label: t('Pdf')  }
            case 'text':
                return { color1: 'brand.gray_1', color2:'gray.300', icon: FaFileLines, label: t('Text')  }
            case 'web':
                return { color1: 'brand.gray_1', color2:'gray.300', icon: BiWorld, label: t('Web')  }
        }
    }
    const { color1, color2, icon, label } = getAlertDetails(type)
    return (
        <Flex  display={'inline-flex'}  gap='10px' alignItems="center" borderRadius={'1rem'} borderColor={color2} borderWidth={'1px'} py='2px' px='5px' bg={color1}>
            <Icon as={icon} />
            <Text >
                {label}
            </Text>
        </Flex>
    )
} 
//GET THE CELL STYLE
const CellStyle = ({ column, element }:{column:string, element:any}) => {
     
    //TRANSLATION
    const { t } = useTranslation('knowledge')
    const t_formats = useTranslation('formats').t
    const auth = useAuth()

    if (column === 'created_at' ||  column === 'updated_at' )  
    return(
        <Tooltip label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
     
    else if (column === 'language') {
        return(
        <Flex gap='5px' alignItems={'center'}>
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][0]:'No detectado'}</Text>
            <Text fontSize={'.8em'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][1]:'🏴󠁥󠁳󠁣󠁴󠁿'}</Text>
        </Flex>)
    }   
    else if (column === 'type') return <TypesComponent t={t} type={element}/>
    else if (column === 'created_by' || column === 'updated_by') return <Text fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element === -1 ?'Matilda':element === 0 ? t('NoAgent'):(auth?.authData?.users?.[element as string | number].name || '')}</Text>
    else return ( <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={column === 'title'?'medium':'normal'}  overflow={'hidden'} >{element === ''?'-':element}</Text>)

}



//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)}) 
const dataKeys:string[] = [ 'type', 'language', 'created_at', 'updated_at', 'created_by', 'updated_by']

const TextSection = () => {

    //CONSTANTS
    const { t } = useTranslation('knowledge')
    const auth = useAuth()
    const location = useLocation().pathname
    const navigate = useNavigate()

    const newArticle:ContentData = {
        uuid: '',
        type: 'snippet',
        title: '',
        description: '',
        language: 'ES',
        is_available_to_tilda: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: auth.authData.userId || -1,
        updated_by: auth.authData.userId || -1,
        tags: [],
        public_article_help_center_collections:[],
        public_article_common_uuid: generateUUID(),
        public_article_status: 'draft'
    }

    //SECTIONS EXPANDED
    const [sectionsExpanded, setSectionsExpanded] = useState<string[]>(['Data', 'Tilda', 'HelpCenter', 'tags', 'Folder' ])
    const firstSendedRef = useRef<boolean>(true)

    const onSectionExpand = (section: string) => {
        setSectionsExpanded((prevSections) => {
          if (prevSections.includes(section))return prevSections.filter((s) => s !== section)
          else return [...prevSections, section]
        })
      }

    //ARTICLE DATA 
    const articleDataRef = useRef<ContentData | null>(null)
    const [articleData, setArticleData] = useState<ContentData | null>(null)
    useEffect(() => {        
        document.title = `${t('Knowledge')} - ${auth.authData.organizationName} - Matil`
        localStorage.setItem('currentSection', 'knowledge')
        const articleId = location.split('/')[3]
        
        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/knowledge/sources/${articleId}`, auth, setValue:setArticleData})
            if (response?.status === 200) articleDataRef.current = response?.data
        }

        if (articleId.startsWith('create')) {  
            setArticleData(newArticle)
            articleDataRef.current = newArticle
        }
        else fetchInitialData()
    }, [])


    const [waitingSave, setWaitingSave] = useState<boolean>(false)
    const saveChanges = async () => {
        const articleId = location.split('/')[3]
        let response
        if (articleId.startsWith('create') && firstSendedRef.current) response =  await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/knowledge/sources`, method:'post', setWaiting:setWaitingSave, requestForm:articleData  as ContentData, auth, toastMessages:{works:t('CorrectSavedInfo'), failed:t('FailedSavedInfo')} }) 
        else response = response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/knowledge/sources/${articleData?.uuid}`, method:'put', setWaiting:setWaitingSave, requestForm:articleData as ContentData, auth, toastMessages:{works:t('CorrectSavedInfo'), failed:t('FailedSavedInfo')} })

        if (response?.status === 200) articleDataRef.current = articleData
        firstSendedRef.current = false

    }


    //SHOW DELETE BOX
    const [showDeleteBox, setShowDeleteBox] = useState<boolean>(false)

    //TAGS LOGIC
    const [inputValue, setInputValue] = useState<string>('')
    const handleKeyDown = (event:KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          const newTag = inputValue.trim()
          if (newTag) {
            let newArticleData:ContentData | null = null
            const labelsArray = articleData?.tags || []
            labelsArray.push(newTag)
            newArticleData = { ...articleData as ContentData, tags: labelsArray }
            setArticleData(newArticleData)
            setInputValue('')
          }
        }
      } 
    const removeTag = (index: number) => {
        let newArticleData:ContentData | null = null
        const labelsArray = articleData?.tags || []
        labelsArray.splice(index, 1)
        newArticleData = { ...articleData as ContentData, tags: labelsArray}
        setArticleData(newArticleData)
    }

    const [clientBoxWidth, setClientBoxWidth] = useState(400)
    const sendBoxWidth = `calc(100vw - 335px - ${clientBoxWidth}px)`
    
     //DELETE A FOLDER
     const DeleteArticle = () => {
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

        //FUNCTION FOR CREATE A NEW BUSINESS
        const deleteArticle= async () => {
            const articleId = location.split('/')[3]
            const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/knowledge/sources/${articleId}`, method:'delete',  auth, toastMessages:{works:t('CorrectSavedInfo'), failed:t('FailedSavedInfo')} })
            if (response?.status === 200) navigate('/knowledge/content')
        }
        return(<> 
              <Box p='20px'> 
                    <Text fontWeight={'medium'} fontSize={'1.2em'}>{parseMessageToBold(t('DeleteArticleAnswer', {name:articleData?.title}))}</Text>
                    <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                    <Text >{parseMessageToBold(t('DeleteFolderWarning'))}</Text>
                </Box>
                <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                    <Button  size='sm' variant='delete' onClick={deleteArticle}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                    <Button size='sm'  variant={'common'} onClick={() => setShowDeleteBox(false)}>{t('Cancel')}</Button>
                </Flex>
        </>)
    }
    const DeleteBox = useMemo(() => (
        <ConfirmBox isSectionWithoutHeader setShowBox={setShowDeleteBox}> 
            <DeleteArticle/>
        </ConfirmBox>
    ), [showDeleteBox])

    return (<>
    {showDeleteBox && DeleteBox}
   
    <Flex flex='1' position='absolute' width={'calc(100vw - 335px)'} height={'100vh'} top={0} left={0} bg='white'>
        <MotionBox   initial={{ width: sendBoxWidth  }} animate={{ width: sendBoxWidth}} exit={{ width: sendBoxWidth }} transition={{ duration: '.2' }}  
        width={sendBoxWidth} overflowY={'hidden'}  borderRightWidth={'1px'} borderRightColor='gray.200' >
            <Flex px='2vw' height={'70px'} alignItems={'center'} justifyContent={'space-between'}  borderBottomWidth={'1px'} borderBottomColor={'gray.200'}>
                <Skeleton isLoaded={articleData !== null}> 
                    <Text fontSize={'1.5em'} fontWeight={'medium'}>{t('TextFragment')}</Text>
                </Skeleton>
                <Flex gap='15px'>
                    <Button leftIcon={<BsTrash3Fill/>} variant={'delete'} isDisabled={location.split('/')[3].startsWith('create')} size='sm' onClick={() => setShowDeleteBox(true)}>{t('Delete')}</Button>
                    <Button variant={'common'} size='sm'>{t('Publish')}</Button>
                    <Button variant={'main'} size='sm' isDisabled={JSON.stringify(articleData) === JSON.stringify(articleDataRef.current)} onClick={saveChanges}>{waitingSave?<LoadingIconButton/>:t('SaveChanges')}</Button>
                    {clientBoxWidth === 0 && <IconButton aria-label="open-tab" variant={'common'} bg='transparent' size='sm' icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'20px'}/>} onClick={() =>setClientBoxWidth(400)}/>}
                </Flex>
            </Flex>
            <Flex width={'100%'} height={'100%'} justifyContent={'center'}  >
                <Box  maxW={'750px'} width={'100%'} height={'100%'} py='5vh'>
                    <Skeleton isLoaded={articleData !== null}> 
                        {articleData !== null && <EditorComponent  articleData={articleData as ContentData}  setArticleData={setArticleData}/>}
                    </Skeleton>
                 </Box>
            </Flex>
        </MotionBox>
        <MotionBox width={clientBoxWidth + 'px'}  whiteSpace={'nowrap'} initial={{ width: clientBoxWidth + 'px' }} animate={{ width: clientBoxWidth + 'px' }} exit={{ width: clientBoxWidth + 'px' }} transition={{ duration: '.2'}}> 
            <Flex p='2vh' height={'70px'} justifyContent={'space-between'} alignItems={'center'} borderBottomWidth={'1px'} borderBottomColor={'gray.200'}>
                <Text fontSize={'1.5em'} fontWeight={'medium'}>{t('Information')}</Text>
                <IconButton aria-label="close-tab" variant={'common'} bg='transparent' size='sm' icon={<RxCross2 size={'20px'}/>} onClick={() =>setClientBoxWidth(0)}/>
            </Flex>
            <Box p='2vh' height={'100%'} > 

                <CollapsableSection section={'Data'} isExpanded={sectionsExpanded.includes('Data')} onSectionExpand={onSectionExpand}> 
                        {dataKeys.map((showKey, index) => (
                            <Skeleton key={`article-feature-${index}`} isLoaded={articleData !== null}> 
                                <Flex mt='2vh' key={`article-data-${index}`}>
                                    <Text flex='1' fontWeight={'medium'} color='gray.600'>{t(showKey)}</Text>
                                    <Box flex='1' maxW={'50%'}> 
                                        {(articleData !== null)&&  
                                            <Box fontSize={'.9em'}>
                                                <CellStyle column={showKey} element={articleData?.[showKey as keyof ContentData]}/>
                                            </Box>
                                        }
                                     </Box>
                                </Flex>
                            </Skeleton>
                        ))}
                </CollapsableSection>

                <CollapsableSection section={'Tilda'} isExpanded={sectionsExpanded.includes('Tilda')} onSectionExpand={onSectionExpand}> 
                    <Flex gap='8px' mt='1vh'  alignItems={'center'}>
                        <Switch isChecked={articleData?.is_available_to_tilda}  onChange={(e) => setArticleData(prev => ({...prev as ContentData, is_available_to_tilda:e.target.checked}))} />
                        <Text fontWeight={'medium'} fontSize={'.9em'}>{t('IsAvailableTilda')}</Text>
                    </Flex>
                    <Text mt='.5vh' whiteSpace={'normal'} color={'gray.600'} fontSize={'.8em'}>{t('IsAvailableTildaDesText')}</Text>

                </CollapsableSection>
     
                <CollapsableSection section={'tags'} isExpanded={sectionsExpanded.includes('tags')} onSectionExpand={onSectionExpand}> 
                    <Box mt='2vh'  minHeight="30px" maxH="300px" border="1px solid #CBD5E0"   p="5px" _focusWithin={{ borderColor:'transparent', boxShadow:'0 0 0 2px rgb(77, 144, 254)'}} borderRadius=".5rem" overflow="auto" display="flex" flexWrap="wrap" alignItems="center" onKeyDown={handleKeyDown}  tabIndex={0}>
                        {((articleData?.tags || [])).map((label, index) => (
                            <Flex key={`label-${index}`} borderRadius=".4rem" p='4px' fontSize={'.75em'} alignItems={'center'} m="1"bg='gray.200' gap='5px'>
                                <Text>{label}</Text>
                                <Icon as={RxCross2} onClick={() => removeTag(index)} cursor={'pointer'} />
                            </Flex>
                        ))}
                        <Textarea  maxLength={20} p='5px'  resize={'none'} borderRadius='.5rem' rows={1} fontSize={'.9em'}  borderColor='transparent' borderWidth='0px' _hover={{borderColor:'transparent',borderWidth:'0px'}} focusBorderColor={'transparent'}  value={inputValue}  onChange={(event) => {setInputValue(event.target.value)}}/>
                    </Box>  
                </CollapsableSection>
                <CollapsableSection section={'Folder'} isExpanded={sectionsExpanded.includes('Folder')} onSectionExpand={onSectionExpand}> 
                    <Flex mt='2vh' bg='brand.gray_2' alignItems={'center'} cursor={'pointer'} borderRadius={'.5rem'} p='10px' gap='10px'>
                        <Icon as={FaFolder}/>
                        <Text>{articleData?.folder_uuid?articleData?.folder_uuid:t('NoFolder')}</Text>
                    </Flex>
                </CollapsableSection>

            </Box>
        </MotionBox>

    </Flex>
    </>)
}

export default TextSection

const CollapsableSection = ({ section, isExpanded, onSectionExpand, children}:{section:string, isExpanded:boolean, onSectionExpand:(key:string) => void ,children:ReactNode}) => {

    const { t } = useTranslation('knowledge')
 
    return (
        <Box py='3vh' borderBottomColor={'gray.200'} borderBottomWidth={'1px'}> 
            <Flex cursor={'pointer'} alignItems={'center'} justifyContent={'space-between'} onClick={() => onSectionExpand(section)}>
                <Text fontWeight={'semibold'}  fontSize={'.9em'}>{t(section).toLocaleUpperCase()}</Text>
                <IoIosArrowDown color={'gray.600'} className={isExpanded ? "rotate-icon-up" : "rotate-icon-down"}/>
            </Flex>
            <motion.div initial={{height:isExpanded?0:'auto', opacity:isExpanded?0:1}} animate={{height:isExpanded?'auto':0, opacity:isExpanded?1:0 }} exit={{height:isExpanded?0:'auto',  opacity:isExpanded?0:1 }} transition={{duration:.2}} style={{overflow:isExpanded?'visible':'hidden'}}>           
                {children}
            </motion.div>
        </Box>
    )
}

//CUSTOM TOOLBAR
const CustomToolbar = ({ quillRef, toolbarPosition }:{quillRef:any, toolbarPosition:{top:number, left:number} | null}) => {
    
    const [activeFormats, setActiveFormats] = useState<any>({});
    
    useEffect(() => {
        const editor = quillRef.current.getEditor()
        const handleSelectionChange = () => {
            const selection = editor.getSelection()
            if (selection) {
                const formats = editor.getFormat(selection)
                setActiveFormats(formats)
            }
        }
        editor.on('selection-change', handleSelectionChange);

        return () => {editor.off('selection-change', handleSelectionChange)}
    }, [quillRef])


    const formatText = (format:string, value:any) => {
        const editor = quillRef.current.getEditor()
        editor.format(format, value)
        const formats = editor.getFormat(editor.getSelection())
        setActiveFormats(formats)
    }

    return (
     <Flex id="toolbar" gap='10px' zIndex={1000} bg='white' alignItems={'center'} borderRadius={'.3rem'} p='5px' boxShadow='0 2px 5px rgba(0, 0, 0, 0.2)' display={toolbarPosition ? 'block' : 'none'} position='fixed' top={toolbarPosition?.top} left={toolbarPosition?.left} >
        
        <IconButton onClick={() => formatText('header', 1)} _hover={{bg:activeFormats.header === 1 ?'rgba(59, 90, 246, 0.25)':'brand.gray_2'}} bg={activeFormats.header === 1 ? 'rgba(59, 90, 246, 0.15)' : 'transparent'} color={activeFormats.header === 1 ? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-header"  variant={'common'} icon={<BsTypeH1/>} size='sm' aria-label="h1" value="1" />
        <IconButton  onClick={() => formatText('header', 2)}bg={activeFormats.header === 2 ? 'rgba(59, 90, 246, 0.15)' : 'transparent'}  _hover={{bg:activeFormats.header === 2 ?'rgba(59, 90, 246, 0.25)':'brand.gray_2'}} color={activeFormats.header === 2 ? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-header" ml='5px' variant={'common'} icon={<BsTypeH2/>} size='sm' aria-label="h2" value="2" />
       
        <IconButton onClick={() => formatText('bold', !activeFormats.bold)}  bg={activeFormats.bold ? 'rgba(59, 90, 246, 0.15)' : 'transparent'}  _hover={{bg:activeFormats.bold?'rgba(59, 90, 246, 0.25)':'brand.gray_2'}} color={activeFormats.bold? 'rgba(59, 90, 246)' : 'black'}  
        className="ql-bold"  ml='15px' variant={'common'}  icon={<BsTypeBold/>} size='sm' aria-label="bold" />
        <IconButton onClick={() => formatText('italic', !activeFormats.italic)} bg={activeFormats.italic? 'rgba(59, 90, 246, 0.15)' : 'transparent'} _hover={{bg:activeFormats.italic?'rgba(59, 90, 246, 0.25)':'brand.gray_2'}} color={activeFormats.italic ? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-italic" ml='5px' variant={'common'} icon={<BsTypeItalic/>} size='sm' aria-label="italic" />
        <IconButton onClick={() => formatText('underline', !activeFormats.underline)}  bg={activeFormats.underline? 'rgba(59, 90, 246, 0.15)' : 'transparent'} _hover={{bg:activeFormats.underline?'rgba(59, 90, 246, 0.25)':'brand.gray_2'}} color={activeFormats.underline ? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-underline" ml='5px' variant={'common'}   icon={<BsTypeUnderline/>} size='sm' aria-label="underline" />
         <IconButton  onClick={() => formatText('link', !activeFormats.link)}  bg={activeFormats.link? 'rgba(59, 90, 246, 0.15)' : 'transparent'} _hover={{bg:activeFormats.link?'rgba(59, 90, 246, 0.25)':'brand.gray_2'}} color={activeFormats.link? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-link" ml='5px' variant={'common'}  icon={<FaLink/>} size='sm' aria-label="link" />

      
    </Flex>
  
    )}

const EditorComponent = ({articleData, setArticleData}:{articleData:ContentData | null, setArticleData:Dispatch<SetStateAction<ContentData | null>>}) => {

    //CONSTANTS
    const  { t } = useTranslation('knowledge')

    //QUILL THINGS
    const quillRef = useRef<any>(null)
    const icons = Quill.import('ui/icons') as any
    icons.bold = null
    icons.italic = null
    icons.underline = null
    icons['code-block'] = null
    icons.align = null
    icons.header = null
    icons.link = null
 
    const modules = {
        toolbar: {container: "#toolbar" },
        divider: { cssText: 'border: none; border-bottom: 2px solid green' }
    }
    

    //HTML TEXT
    const [htmlValue, setHtmlValue] = useState<string>(articleData?.content?.text || '')
    const handleChange = (value:string) => {setHtmlValue(value)}
    useEffect(() => {
        setArticleData((prev) => ({...prev as ContentData, content: {text:htmlValue}}))
    }, [htmlValue])

    //TOOLBAR POSITION
    const [toolbarPosition, setToolbarPosition] = useState<{top:number, left:number} | null>(null)

    //TEXT SELECTION LOGIC
    const handleTextSelection = () => {
        const selection = window.getSelection()
        if (selection && selection.toString().length > 0) {
          const range = selection.getRangeAt(0)
          const rect = range.getBoundingClientRect()
          setToolbarPosition({top:rect.top - 60, left:rect.left - 55})
        } 
        else setToolbarPosition(null)
      }
    const handleMouseUp = () => {handleTextSelection()}
    useEffect(() => {
        const editor = quillRef.current.getEditor()
        const editorElement = editor.root
        if (editorElement) {
            editorElement.addEventListener('mouseup', handleMouseUp)
            editorElement.addEventListener('keyup', handleTextSelection)
        }
        return () => {
            if (editorElement) {
            editorElement.removeEventListener('mouseup', handleTextSelection)
            editorElement.removeEventListener('keyup', handleTextSelection)
            }
        }
    }, [])

    //TEXTAREAS LOGIC
    const textAreaTitleRef = useRef<HTMLTextAreaElement>(null)
    const adjustTextareaHeight = (textarea:any) => {
        if (!textarea) return
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
    }
    useEffect(() =>{adjustTextareaHeight(textAreaTitleRef.current)}, [articleData?.title])

    return (<>
         <Box  px='20px' position={'relative'}> 
            <textarea ref={textAreaTitleRef} value={articleData?.title} className="title-textarea"  onChange={(e) => {setArticleData(prev => ({...prev as ContentData, title:e.target.value}))}}  placeholder={t('NoTitleText')} rows={1}  />
        </Box>
        <Flex  height={window.innerHeight - (textAreaTitleRef.current?.getBoundingClientRect().bottom || 0) - window.innerWidth * 0.02}  flexDir={'column'} position='relative' alignItems={'center'}> 
            <CustomToolbar quillRef={quillRef} toolbarPosition={toolbarPosition} />
            <ReactQuill
                ref={quillRef}
                className={toolbarPosition ? '' : 'hidden-toolbar'}
                theme="snow"
                value={htmlValue}
                onChange={handleChange}
                modules={modules}
                style={{ height: '100%', width:'100%',  display: 'flex', padding:'0px', flexDirection: 'column-reverse' }}
             />
      
             
        </Flex>
    </>)
}