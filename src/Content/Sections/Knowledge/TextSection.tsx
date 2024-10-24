 //REACT
import { useState, useEffect, useRef, Dispatch, SetStateAction, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../AuthContext"
import { useLocation, useNavigate } from "react-router-dom"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Skeleton, Box, Text, chakra, shouldForwardProp, Button, IconButton } from "@chakra-ui/react"
import { motion, isValidMotionProp } from 'framer-motion'
import "../../Components/styles.css"
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import 'quill-divider'
//COMPONENTS
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import { SourceSideBar } from "./Utils"
//FUNCTIONS
import parseMessageToBold from "../../Functions/parseToBold"
import generateUUID from "../../Functions/generateUuid"
//ICONS
import { FaLink } from "react-icons/fa6"
import { BsTypeH1, BsTypeH2, BsTypeBold, BsTypeItalic,  BsTypeUnderline } from "react-icons/bs";
import { PiSidebarSimpleBold } from "react-icons/pi"
//TYPING
import { ContentData } from "../../Constants/typing" 
import { BsTrash3Fill } from "react-icons/bs"
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)}) 

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
        language: auth.authData.userData?.language || 'ES',
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
    const firstSendedRef = useRef<boolean>(true)

     
    //ARTICLE DATA 
    const articleDataRef = useRef<ContentData | null>(null)
    const [articleData, setArticleData] = useState<ContentData | null>(null)
    useEffect(() => {        
        document.title = `${t('Knowledge')} - ${auth.authData.organizationName} - Matil`
        localStorage.setItem('currentSection', 'knowledge')
        const articleId = location.split('/')[3]
        
        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/sources/${articleId}`, auth, setValue:setArticleData})
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
        if (articleId.startsWith('create') && firstSendedRef.current) response =  await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/sources`, method:'post', setWaiting:setWaitingSave, requestForm:articleData  as ContentData, auth, toastMessages:{works:t('CorrectSavedInfo'), failed:t('FailedSavedInfo')} }) 
        else response = response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/sources/${articleData?.uuid}`, method:'put', setWaiting:setWaitingSave, requestForm:articleData as ContentData, auth, toastMessages:{works:t('CorrectSavedInfo'), failed:t('FailedSavedInfo')} })

        if (response?.status === 200) articleDataRef.current = articleData
        firstSendedRef.current = false

    }


    //SHOW DELETE BOX
    const [showDeleteBox, setShowDeleteBox] = useState<boolean>(false)

    const [clientBoxWidth, setClientBoxWidth] = useState(400)
    const sendBoxWidth = `calc(100vw - 335px - ${clientBoxWidth}px)`
    
     //DELETE A FOLDER
     const DeleteArticle = () => {
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

        //FUNCTION FOR CREATE A NEW BUSINESS
        const deleteArticle= async () => {
            const articleId = location.split('/')[3]
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/sources/${articleId}`, method:'delete',  auth, toastMessages:{works:t('CorrectSavedInfo'), failed:t('FailedSavedInfo')} })
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
        <ConfirmBox setShowBox={setShowDeleteBox}> 
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
                    <Button variant={'main'} size='sm' isDisabled={JSON.stringify(articleData) === JSON.stringify(articleDataRef.current)} onClick={saveChanges}>{waitingSave?<LoadingIconButton/>:t('SaveChanges')}</Button>
                    {clientBoxWidth === 0 && <IconButton aria-label="open-tab" variant={'common'} bg='transparent' size='sm' icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'20px'}/>} onClick={() =>setClientBoxWidth(400)}/>}
                </Flex>
            </Flex>
            <Flex width={'100%'} height={'100%'} justifyContent={'center'}  >
                <Box  maxW={'750px'} width={'100%'} height={'100%'} py='2vw'>
                    <Skeleton isLoaded={articleData !== null}> 
                        {articleData !== null && <EditorComponent  articleData={articleData as ContentData}  setArticleData={setArticleData}/>}
                    </Skeleton>
                 </Box>
            </Flex>
        </MotionBox>
        <SourceSideBar clientBoxWidth={clientBoxWidth} setClientBoxWidth={setClientBoxWidth} sourceData={articleData} setSourceData={setArticleData}/>

    </Flex>
    </>)
}

export default TextSection
 
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

    return (
        <Flex height={'calc(100vh - 70px - 4vw)'}   flexDir={'column'}>

         <Box  px='20px' position={'relative'}> 
            <textarea ref={textAreaTitleRef} value={articleData?.title} className="title-textarea"  onChange={(e) => {setArticleData(prev => ({...prev as ContentData, title:e.target.value}))}}  placeholder={t('NoTitleText')} rows={1}  />
        </Box>
        <Flex  flex='1' flexDir={'column'} position='relative' alignItems={'center'}> 
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
    </Flex>)
}