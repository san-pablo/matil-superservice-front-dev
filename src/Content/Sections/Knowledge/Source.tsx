//REACT
import { useState, useEffect, useRef, Dispatch, SetStateAction, useMemo, Fragment } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../AuthContext"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Box, Text, chakra, shouldForwardProp, Tooltip, Button, IconButton, Input, Portal, Stack, Skeleton } from "@chakra-ui/react"
import { motion, isValidMotionProp } from 'framer-motion'
import "../../Components/styles.css"
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import 'quill-divider'
import TurndownService from 'turndown';
//import QuillTable from 'quill-table'
//COMPONENTS
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import { SourceSideBar } from "./Utils"
import ActionsButton from "../../Components/Reusable/ActionsButton"
//FUNCTIONS
import parseMessageToBold from "../../Functions/parseToBold"
//ICONS
import { FaLink, FaCode, FaAlignCenter, FaAlignJustify, FaAlignLeft, FaAlignRight, FaImage, FaTable, FaListOl, FaListUl } from "react-icons/fa6"
import { RxCross2, } from "react-icons/rx"
import { BsTypeH1, BsTypeH2, BsTypeH3, BsTypeH4, BsTypeBold, BsTypeItalic,  BsTypeUnderline } from "react-icons/bs"
import { MdVideoLibrary } from "react-icons/md"
 import { PiCursorClickFill, PiSidebarSimpleBold } from "react-icons/pi"
 import { TfiLayoutLineSolid } from "react-icons/tfi";

//TYPING
import { ContentData, InternalArticleSource, PublicArticleSource, ViewDefinitionType } from "../../Constants/typing" 
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
 
//TYPING
interface SourceProps {
    sourceId?:string
    sideBarWidth:number
    sectionsPath:string[]
    sectionsPathMap:{[key:string]:{icon:{type:'image' | 'emoji' | 'icon', data:string}, name:string}}
    selectedView?:ViewDefinitionType
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)}) 



const Source = ({sourceId, sideBarWidth, sectionsPath, sectionsPathMap, selectedView}:SourceProps) => {

    //CONSTANTS
    const { t } = useTranslation('knowledge')
    const { getAccessTokenSilently } = useAuth0()
    const auth = useAuth()
    const location = useLocation().pathname
    const navigate = useNavigate()
    const turndownService = new TurndownService()
    turndownService.addRule('removeImages', {filter: 'img', replacement: () => '' })

    const newArticle:ContentData = {
        id: '',
        common_id:'',
        type: 'internal_article',
        title: '',
        description: '',
        language: 'ES',
        is_available_to_tilda: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: auth.authData.userId || '',
        updated_by: auth.authData.userId || '',
        tags: [],
        data: {text:'', raw_text:''} as InternalArticleSource | PublicArticleSource
    }

    const firstSendedRef = useRef<boolean>(true)

  
    const articleDataRef = useRef<ContentData | null>(null)
    const [articleData, setArticleData] = useState<ContentData | null>(null)
    useEffect(() => {        
         
        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/sources/${sourceId}`, auth, getAccessTokenSilently,setValue:setArticleData})
            if (response?.status === 200) articleDataRef.current = response?.data
        }

       fetchInitialData()
    }, [])


    const [waitingSave, setWaitingSave] = useState<boolean>(false)
    const saveChanges = async () => {
  
        const markdownContent = turndownService.turndown((articleData?.data as any)?.text || '')
        let response
        
         response = await fetchData({endpoint:`${auth.authData.organizationId}/sources/${articleData?.id}`, method:'put',getAccessTokenSilently, setWaiting:setWaitingSave, requestForm:{...articleData, data: {...articleData.data, text:markdownContent}} as ContentData, auth, toastMessages:{works:t('CorrectSavedInfo'), failed:t('FailedSavedInfo')} })
        
        if (response?.status === 200) articleDataRef.current = articleData
        firstSendedRef.current === false

    }

    //SHOW DELETE BOX
    const [showDeleteBox, setShowDeleteBox] = useState<boolean>(false)

    const [clientBoxWidth, setClientBoxWidth] = useState(400)
     
    //DELETE A FOLDER
    const DeleteArticle = () => {
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

        //FUNCTION FOR CREATE A NEW BUSINESS
        const deleteArticle= async () => {
             const response = await fetchData({endpoint:`${auth.authData.organizationId}/sources/${sourceId}`, method:'delete', setWaiting:setWaitingDelete, getAccessTokenSilently, auth, toastMessages:{works:t('CorrectSavedInfo'), failed:t('FailedSavedInfo')} })
            if (response?.status === 200) navigate(-1)
        }
        return(<> 
              <Box p='15px'> 
                    <Text fontWeight={'medium'} fontSize={'1.2em'}>{parseMessageToBold(t('DeleteArticleAnswer', {name:articleData?.title}))}</Text>
                     <Text mt='2vh' fontSize={'.8em'} color='text_gray'>{t('DeleteFolderWarning')}</Text>
          
                    <Flex mt='2vh' gap='15px' flexDir={'row-reverse'} >
                        <Button  size='sm' variant='delete' onClick={deleteArticle}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                        <Button size='sm'  variant={'common'} onClick={() => setShowDeleteBox(false)}>{t('Cancel')}</Button>
                    </Flex>
                </Box>
        </>)
    }


    const DeleteBox = useMemo(() => (
        <ConfirmBox  setShowBox={setShowDeleteBox}> 
            <DeleteArticle/>
        </ConfirmBox>
    ), [showDeleteBox])

 
 
    const sendBoxWidth = `calc(100vw - 45px - ${clientBoxWidth}px)`
    const memoizedActionsButton = useMemo(() => (<ActionsButton copyAction={() => {}} deleteAction={() => setShowDeleteBox(true)} />), [])
  

    return (<>
    {showDeleteBox && DeleteBox}
 
    <Flex flex='1'  width={'100%'} height={'100vh'} top={0} left={0} bg='white' >
 
        <MotionBox  initial={{ width: sendBoxWidth  }} animate={{ width: sendBoxWidth}} exit={{ width: sendBoxWidth }} transition={{ duration: '.2' }}  
        width={sendBoxWidth} overflowY={'hidden'}  borderRightWidth={'1px'} borderRightColor='border_color' >
            <Flex px='1vw' height={'60px'} alignItems={'center'} justifyContent={'space-between'}  borderBottomWidth={'1px'} borderBottomColor={'border_color'}>
                    
                <Flex  alignItems={'center'} gap='10px' >
                    <Text fontSize={'1.2em'} fontWeight={'medium'}>{articleData?.type === 'public_article'?t('PublicArticle'):t('InternalArticle')}</Text>
                </Flex>               
                <Flex gap='15px'>
                    {memoizedActionsButton}
                    {articleData?.type === 'public_article' && <Button variant={'common'} size='sm' onClick={() => setArticleData(prev => ({...prev as ContentData, data:{...prev.data, status:'published'} }))}>{(articleData?.data as any)?.status === 'published'?t('Hide'):t('Publish')}</Button>}
                    <Button variant={'main'} size='sm' isDisabled={JSON.stringify(articleData) === JSON.stringify(articleDataRef.current)} onClick={saveChanges}>{waitingSave?<LoadingIconButton/>: t('SaveChanges')}</Button>
                    {clientBoxWidth === 0 && <IconButton aria-label="open-tab" variant={'common'} bg='transparent' size='sm' icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'20px'}/>} onClick={() =>setClientBoxWidth(400)}/>}
                </Flex>
            </Flex>
            <Flex width={'100%'} height={'100%'} justifyContent={'center'}  >
                <Box  maxW={'750px'} width={'100%'} height={'100%'}>
                    {articleData ? 
                        <RenderArticle articleData={articleData} setArticleData={setArticleData}/>
                        :
                        <Stack spacing={4} p={4} width="100%">
                        {Array.from({ length: 20 }).map((_, index) => (
                            <Flex gap="10px" key={`skeleton-message-${index}`}>
                                    <Box width="calc(100% )">
                                        <Box  mt="5px" borderRadius=".3rem" >
                                            <Skeleton borderRadius={'.5rem'}  height="13px" />
                                        </Box>
                                    </Box>
                                </Flex>
                        ))}
                        </Stack>
                    }
                 </Box>
            </Flex>
        </MotionBox>
        
        <MotionBox display={'flex'} flexDir={'column'} h='100vh' width={clientBoxWidth + 'px'}  whiteSpace={'nowrap'} initial={{ width: clientBoxWidth + 'px' }} animate={{ width: clientBoxWidth + 'px' }} exit={{ width: clientBoxWidth + 'px' }} transition={{ duration: '.2'}}> 
            <SourceSideBar clientBoxWidth={clientBoxWidth} setClientBoxWidth={setClientBoxWidth} sourceData={articleData as ContentData<'internal_article' | 'public_article'> } setSourceData={setArticleData as any}/>
        </MotionBox>
    </Flex>
    </>)
}

export default Source

const RenderArticle = ({articleData, setArticleData}:any) => {
    switch (articleData.type) {
        case 'public_article':
        case 'internal_article':
            return <EditorComponent  articleData={articleData as ContentData<'internal_article' | 'public_article'> }  setArticleData={setArticleData as any}/>
        case 'document':
            return <PdfEditorComponent  articleData={articleData as ContentData<'document'>}  setArticleData={setArticleData as any}/>
        case 'snippet':
            return <TextEditorComponent  articleData={articleData as ContentData<'snippet'>}  setArticleData={setArticleData as any}/>
        case 'webpage':
            return <WebsiteEditorComponent  articleData={articleData as ContentData<'webpage'>}  setArticleData={setArticleData as any}/>
    }
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
     <Flex  gap='10px' zIndex={1000} bg='white' alignItems={'center'} borderRadius={'.3rem'} p='5px' boxShadow='0 2px 5px rgba(0, 0, 0, 0.2)' display={toolbarPosition ? 'block' : 'none'} position='fixed' top={toolbarPosition?.top} left={toolbarPosition?.left} >
        
        <IconButton onClick={() => formatText('header', 1)} _hover={{bg:activeFormats.header === 1 ?'rgba(59, 90, 246, 0.25)':'gray_2'}} bg={activeFormats.header === 1 ? 'rgba(59, 90, 246, 0.15)' : 'transparent'} color={activeFormats.header === 1 ? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-header"  variant={'common'} icon={<BsTypeH1/>} size='sm' aria-label="h1" value="1" />
        <IconButton  onClick={() => formatText('header', 2)}bg={activeFormats.header === 2 ? 'rgba(59, 90, 246, 0.15)' : 'transparent'}  _hover={{bg:activeFormats.header === 2 ?'rgba(59, 90, 246, 0.25)':'gray_2'}} color={activeFormats.header === 2 ? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-header" ml='5px' variant={'common'} icon={<BsTypeH2/>} size='sm' aria-label="h2" value="2" />
        <IconButton  onClick={() => formatText('header', 3)} bg={activeFormats.header === 3 ? 'rgba(59, 90, 246, 0.15)' : 'transparent'}  _hover={{bg:activeFormats.header === 3 ?'rgba(59, 90, 246, 0.25)':'gray_2'}} color={activeFormats.header === 3 ? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-header" ml='5px' variant={'common'}   icon={<BsTypeH3/>} size='sm' aria-label="h3" value="3" />
        <IconButton  onClick={() => formatText('header', 4)} bg={activeFormats.header === 4 ? 'rgba(59, 90, 246, 0.15)' : 'transparent'} _hover={{bg:activeFormats.header === 4 ?'rgba(59, 90, 246, 0.25)':'gray_2'}} color={activeFormats.header === 4 ? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-header" ml='5px' variant={'common'}  icon={<BsTypeH4/>} size='sm' aria-label="h4" value="4" />

        <IconButton onClick={() => formatText('bold', !activeFormats.bold)}  bg={activeFormats.bold ? 'rgba(59, 90, 246, 0.15)' : 'transparent'}  _hover={{bg:activeFormats.bold?'rgba(59, 90, 246, 0.25)':'gray_2'}} color={activeFormats.bold? 'rgba(59, 90, 246)' : 'black'}  
        className="ql-bold"  ml='15px' variant={'common'}  icon={<BsTypeBold/>} size='sm' aria-label="bold" />
        <IconButton onClick={() => formatText('italic', !activeFormats.italic)} bg={activeFormats.italic? 'rgba(59, 90, 246, 0.15)' : 'transparent'} _hover={{bg:activeFormats.italic?'rgba(59, 90, 246, 0.25)':'gray_2'}} color={activeFormats.italic ? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-italic" ml='5px' variant={'common'} icon={<BsTypeItalic/>} size='sm' aria-label="italic" />
        <IconButton onClick={() => formatText('underline', !activeFormats.underline)}  bg={activeFormats.underline? 'rgba(59, 90, 246, 0.15)' : 'transparent'} _hover={{bg:activeFormats.underline?'rgba(59, 90, 246, 0.25)':'gray_2'}} color={activeFormats.underline ? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-underline" ml='5px' variant={'common'}   icon={<BsTypeUnderline/>} size='sm' aria-label="underline" />
        <IconButton onClick={() => formatText('code-block', !activeFormats['code-block'])} bg={activeFormats['code-block']? 'rgba(59, 90, 246, 0.15)' : 'transparent'} _hover={{bg:activeFormats['code-block']?'rgba(59, 90, 246, 0.25)':'gray_2'}} color={activeFormats['code-block']? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-code-block" ml='5px' variant={'common'}  icon={<FaCode/>} size='sm' aria-label="code-block" />
        <IconButton  onClick={() => formatText('link', !activeFormats.link)}  bg={activeFormats.link? 'rgba(59, 90, 246, 0.15)' : 'transparent'} _hover={{bg:activeFormats.link?'rgba(59, 90, 246, 0.25)':'gray_2'}} color={activeFormats.link? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-link" ml='5px' variant={'common'}  icon={<FaLink/>} size='sm' aria-label="link" />

        <IconButton onClick={() => formatText('align', '')} bg={activeFormats.align === undefined? 'rgba(59, 90, 246, 0.15)' : 'transparent'} _hover={{bg:activeFormats.align === undefined?'rgba(59, 90, 246, 0.25)':'gray_2'}} color={activeFormats.align === undefined? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-align"  ml='15px' variant={'common'}   icon={<FaAlignLeft/>} size='sm' aria-label="normal" value=""/>
        <IconButton   onClick={() => formatText('align', 'center')} bg={activeFormats.align === 'center'? 'rgba(59, 90, 246, 0.15)' : 'transparent'} _hover={{bg:activeFormats.align === 'center'?'rgba(59, 90, 246, 0.25)':'gray_2'}} color={activeFormats.align === 'center'? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-align" ml='5px'variant={'common'}  icon={<FaAlignCenter/>} size='sm' aria-label="center" value="center"/>
        <IconButton    onClick={() => formatText('align', 'right')} bg={activeFormats.align === 'right'? 'rgba(59, 90, 246, 0.15)' : 'transparent'} _hover={{bg:activeFormats.align === 'right'?'rgba(59, 90, 246, 0.25)':'gray_2'}} color={activeFormats.align === 'right'? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-align" ml='5px' variant={'common'}  icon={<FaAlignRight/>} size='sm' aria-label="right" value="right"/>
        <IconButton    onClick={() => formatText('align', 'justify')} bg={activeFormats.align === 'justify'? 'rgba(59, 90, 246, 0.15)' : 'transparent'} _hover={{bg:activeFormats.align === 'justify'?'rgba(59, 90, 246, 0.25)':'gray_2'}} color={activeFormats.align === 'justify'? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-align"ml='5px' variant={'common'}  icon={<FaAlignJustify/>} size='sm' aria-label="justify" value="justify" />

    </Flex>
  
    )}
const EditorComponent = ({articleData, setArticleData}:{articleData:ContentData<'internal_article' | 'public_article'>  | null, setArticleData:Dispatch<SetStateAction<ContentData<'internal_article' | 'public_article'>  | null>>}) => {
    
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
    
    {/*Quill.register({
        'modules/table': QuillTable.TableModule,
        'modules/table-cell': QuillTable.TableCell,
        'modules/table-row': QuillTable.TableRow,
      }, true);
    */}

    const modules = {
        //table: true,
        toolbar: {
          container: "#toolbar"
        },
        divider: { cssText: 'border: none; border-bottom: 2px solid green' }
      };
    

    //HTML TEXT
    const [htmlValue, setHtmlValue] = useState<string>(articleData?.data?.text || '')
    const handleChange = (value:string) => {setHtmlValue(value)}
    useEffect(() => {
        setArticleData((prev) => ({...prev as ContentData<'internal_article' | 'public_article'>, data: {...prev.data, raw_text:htmlValue}}))
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
        const editor = quillRef?.current?.getEditor()
        const editorElement = editor?.root
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

    //IS FOCUSING DESCRIPTION
    const [isFocusing, setIsFocusing] = useState<boolean>()

    //TEXTAREAS LOGIC
    const textAreaTitleRef = useRef<HTMLTextAreaElement>(null)
    const textAreaDescriptionRef = useRef<HTMLTextAreaElement>(null)
    const adjustTextareaHeight = (textarea:any) => {
        if (!textarea) return
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
    }
    
    useEffect(() =>{adjustTextareaHeight(textAreaTitleRef.current)}, [articleData?.title])
    useEffect(() =>{adjustTextareaHeight(textAreaDescriptionRef.current)}, [articleData?.description])

    //INSERT FUNCTIONS LOGIC
    const [showInsertVideo, setShowInsertVideo] = useState<boolean>(false)
    const [videoUrl, setVideoUrl] = useState<string>('')


    //INSERT IMAGE
    const insertImage = (event:any) => {
        const file = event.target.files[0]
        if (file && file.type.startsWith('image/')) {
            const editor = quillRef?.current?.getEditor()
            const reader = new FileReader()
            reader.onloadend = () => {
                const url = reader.result
                const selection = editor.getSelection()
                const index = selection ? selection.index : editor.getLength()
                editor.insertEmbed(index, 'image', url)
            }
            if (file) reader.readAsDataURL(file)
        }
    }

    //INSERT VIDEO
    const handleKeyDown = (event:any) => {
        if (event.key === 'Enter') {
            setShowInsertVideo(false)
          if (videoUrl) {
            const videoId = videoUrl.split('si=')[1]?.split('&')[0]
            let embedUrl:string = ''
            if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
            const editor = quillRef?.current.getEditor()
            const selection = editor?.getSelection();
            const index = selection ? selection.index : editor.getLength()
            editor.insertEmbed(index, 'video', embedUrl)
            setVideoUrl('')
          }
        }
    }

    //INSERT TABLE
    const insertTable = () => {
        const quillEditor = quillRef?.current?.getEditor()
        const tableModule = quillEditor.getModule('table')
        tableModule.insertTable(3, 3)
    }

    //INSERT DIVIDER
    const insertDivider = () => {
    const editor = quillRef?.current?.getEditor()
    const range = editor.getSelection();
    editor.insertEmbed(range.index, 'divider', true)
    const lastDivider = editor.container.querySelector('hr:last-child')
    if (lastDivider) {
        lastDivider.style.border = 'none'
        lastDivider.style.borderBottom = '2px solid #E2E8F0'
        lastDivider.style.height = '2px'
        lastDivider.style.margin = '10px 0'
    }
    }

    const insertButton = () => {
        const editor = quillRef?.current?.getEditor()
        const button = document.createElement('button')
        button.innerHTML = 'Nuevo botón'
        button.style.backgroundColor = '#4CAF50'
        button.style.color = 'white'
        button.style.border = 'none'
        button.style.padding = '10px 20px'
        button.style.cursor = 'pointer'
        editor.root.appendChild(button)
    }

    //INSERT LISTS
    const handleBulletList = () => {
        const editor = quillRef?.current?.getEditor()
        editor.format('list', 'bullet')
    }
    const handleNumberedList = () => {
        const editor = quillRef?.current?.getEditor()
        editor.format('list', 'ordered')
    }

    //AVAILABLE CHARACTERS
    const avaiableCharacters = 140 -  (articleData?.description || '').length 

     return (
        <Flex height={'calc(100vh)'} justifyContent={'start'} overflow={'scroll'}  py='2vw' flexDir={'column'}>
            <input type="file" accept="image/*" id={'uploadIcon'}    style={{ display: 'none' }} onChange={insertImage}/>
            <Box  px='20px' position={'relative'}> 
                <Skeleton isLoaded={articleData !== null}> 
                    <textarea ref={textAreaTitleRef} value={articleData?.title} className="title-textarea"  onChange={(e) => {setArticleData(prev => ({...prev, title:e.target.value}))}}  placeholder={t('NoTitle')} rows={1}  />
                </Skeleton>
                <Skeleton isLoaded={articleData !== null}> 
              
                    <textarea maxLength={140} onFocus={() => setIsFocusing(true)} onBlur={() => setIsFocusing(false)} ref={textAreaDescriptionRef} value={articleData?.description} className="description-textarea"  onChange={(e) => {setArticleData(prev => ({...prev, description:e.target.value}))}}  placeholder={t('AddDescription')} rows={1}  />
   
                    </Skeleton>
                
                {isFocusing && 
                <Portal> 
                    <Text position={'fixed'} zIndex={100} top={`${(textAreaDescriptionRef.current?.getBoundingClientRect().bottom || 0)}px`} right={window.innerWidth - (textAreaDescriptionRef.current?.getBoundingClientRect().right || 0)} fontSize={'1.1em'} fontWeight={500} color='text_gray'>{avaiableCharacters}</Text>
                </Portal>}
            </Box> 
            <Flex bg='green' flex='1' flexDir={'column'} position='relative' alignItems={'center'}> 
                
                <Box position={'fixed'} id="toolbar"> 
                    {(articleData) && 
                    <MotionBox initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}> 
                        <CustomToolbar quillRef={quillRef} toolbarPosition={toolbarPosition} />
                    </MotionBox>}
                </Box>

 
                     <ReactQuill
                        ref={quillRef}
                        className={toolbarPosition ? '' : 'hidden-toolbar'}
                        theme="snow"
                        value={htmlValue}
                        onChange={handleChange}
                        modules={modules}
                        style={{ height: '100%', width:'100%',  display: 'flex', padding:'0px', flexDirection: 'column-reverse' }}
                    />
             
        
                {showInsertVideo ?
                <Flex gap='20px' width={'700px'} zIndex={1000} bg='white' alignItems={'center'} borderRadius={'.3rem'} p='5px' boxShadow='0 2px 5px rgba(0, 0, 0, 0.2)' position='fixed' bottom={'2vw'}  >
                    <Input onKeyDown={handleKeyDown}  onChange={(e) => setVideoUrl(e.target.value)} outline={'none'}  placeholder={t('InsertVideoUrl')}/>
                    <IconButton  onClick={() => setShowInsertVideo(false)} color='red'  bg='transparent' _hover={{bg:'red.100'}} size='sm' aria-label="cancel-video" icon={<RxCross2 size={'20px'}/>}/>
                </Flex>
                
                :<Flex gap='10px' zIndex={1000} bg='black_button' alignItems={'center'} borderRadius={'.3rem'} p='5px' boxShadow='0 2px 5px rgba(0, 0, 0, 0.2)' position='fixed' bottom={'2vw'}  >
                    
                    <Tooltip label={t('InsertImage')}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                        <IconButton color='white' bg='transparent' variant={'common'} icon={<FaImage size={'18px'}/>}  aria-label="image" onClick={() => document.getElementById('uploadIcon')?.click()} />
                    </Tooltip>
                    <Tooltip label={t('InsertVideo')}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                        <IconButton color='white' bg='transparent' variant={'common'} icon={<MdVideoLibrary size={'18px'} />} aria-label="video" onClick={() => setShowInsertVideo(true)} />
                    </Tooltip>
                    <Tooltip label={t('InsertTable')}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                        <IconButton color='white' bg='transparent' variant={'common'} icon={<FaTable size={'18px'}/>} aria-label="table" onClick={insertTable} />
                    </Tooltip>
                    <Tooltip label={t('InsertDivider')}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                        <IconButton color='white' bg='transparent' variant={'common'} icon={<TfiLayoutLineSolid size={'20px'}  style={{transform:"rotate(90deg)"}}/>} aria-label="divider" onClick={insertDivider} />
                    </Tooltip>
                    <Tooltip label={t('InsertButton')}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                        <IconButton color='white' bg='transparent' variant={'common'} icon={<PiCursorClickFill size={'18px'} />} aria-label="button" onClick={insertButton} />
                    </Tooltip>
                    
                    <Tooltip label={t('InsertBullet')}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                        <IconButton color='white' bg='transparent' variant={'common'} icon={<FaListUl size={'18px'}/>}  aria-label="Bullet List" onClick={handleBulletList} />
                    </Tooltip>
                    <Tooltip label={t('InsertNumber')}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                        <IconButton color='white' variant='common' bg='transparent' icon={<FaListOl size={'18px'}/>} aria-label="Numbered List" onClick={handleNumberedList} />
                    </Tooltip>

                </Flex>}
            </Flex>
        </Flex>)
}

//PDF COMPONENT
const PdfEditorComponent = ({articleData, setArticleData}:{articleData:ContentData<'document'>  | null, setArticleData:Dispatch<SetStateAction<ContentData<'document'>  | null>>}) => {
 
    //CONSTANTS
    const  { t } = useTranslation('knowledge')

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
           <textarea ref={textAreaTitleRef} value={articleData?.title} className="title-textarea"  onChange={(e) => {setArticleData(prev => ({...prev, title:e.target.value}))}}  placeholder={t('NoTitleText')} rows={1}  />
       </Box>
       <Flex flex='1' mt='30px' px='20px' overflow={'scroll'}   flexDir={'column'} position='relative' alignItems={'center'}> 
           <Text>
               {(articleData?.data.text || '').split('\n').map((line:string, index:number) => (
                   <Text key={index}>
                   {line}
                   {'\n'}
                   </Text>
               ))}
               </Text>
         </Flex>
    </Flex>)
}

//TEXT SECTION COMPONENT
const TextCustomToolbar = ({ quillRef, toolbarPosition }:{quillRef:any, toolbarPosition:{top:number, left:number} | null}) => {
    
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
        
        <IconButton onClick={() => formatText('header', 1)} _hover={{bg:activeFormats.header === 1 ?'rgba(59, 90, 246, 0.25)':'gray_2'}} bg={activeFormats.header === 1 ? 'rgba(59, 90, 246, 0.15)' : 'transparent'} color={activeFormats.header === 1 ? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-header"  variant={'common'} icon={<BsTypeH1/>} size='sm' aria-label="h1" value="1" />
        <IconButton  onClick={() => formatText('header', 2)}bg={activeFormats.header === 2 ? 'rgba(59, 90, 246, 0.15)' : 'transparent'}  _hover={{bg:activeFormats.header === 2 ?'rgba(59, 90, 246, 0.25)':'gray_2'}} color={activeFormats.header === 2 ? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-header" ml='5px' variant={'common'} icon={<BsTypeH2/>} size='sm' aria-label="h2" value="2" />
       
        <IconButton onClick={() => formatText('bold', !activeFormats.bold)}  bg={activeFormats.bold ? 'rgba(59, 90, 246, 0.15)' : 'transparent'}  _hover={{bg:activeFormats.bold?'rgba(59, 90, 246, 0.25)':'gray_2'}} color={activeFormats.bold? 'rgba(59, 90, 246)' : 'black'}  
        className="ql-bold"  ml='15px' variant={'common'}  icon={<BsTypeBold/>} size='sm' aria-label="bold" />
        <IconButton onClick={() => formatText('italic', !activeFormats.italic)} bg={activeFormats.italic? 'rgba(59, 90, 246, 0.15)' : 'transparent'} _hover={{bg:activeFormats.italic?'rgba(59, 90, 246, 0.25)':'gray_2'}} color={activeFormats.italic ? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-italic" ml='5px' variant={'common'} icon={<BsTypeItalic/>} size='sm' aria-label="italic" />
        <IconButton onClick={() => formatText('underline', !activeFormats.underline)}  bg={activeFormats.underline? 'rgba(59, 90, 246, 0.15)' : 'transparent'} _hover={{bg:activeFormats.underline?'rgba(59, 90, 246, 0.25)':'gray_2'}} color={activeFormats.underline ? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-underline" ml='5px' variant={'common'}   icon={<BsTypeUnderline/>} size='sm' aria-label="underline" />
         <IconButton  onClick={() => formatText('link', !activeFormats.link)}  bg={activeFormats.link? 'rgba(59, 90, 246, 0.15)' : 'transparent'} _hover={{bg:activeFormats.link?'rgba(59, 90, 246, 0.25)':'gray_2'}} color={activeFormats.link? 'rgba(59, 90, 246)' : 'black'} 
        className="ql-link" ml='5px' variant={'common'}  icon={<FaLink/>} size='sm' aria-label="link" />
    </Flex>
  
    )}
const TextEditorComponent = ({articleData, setArticleData}:{articleData:ContentData<'snippet'> | null, setArticleData:Dispatch<SetStateAction<ContentData<'snippet'> | null>>}) => {

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
    const [htmlValue, setHtmlValue] = useState<string>(articleData?.data?.raw_text || '')
    const handleChange = (value:string) => {setHtmlValue(value)}
    useEffect(() => {
        setArticleData((prev) => ({...prev, data: {...prev.data, raw_text:htmlValue}}))
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
            <textarea ref={textAreaTitleRef} value={articleData?.title} className="title-textarea"  onChange={(e) => {setArticleData(prev => ({...prev, title:e.target.value}))}}  placeholder={t('NoTitleText')} rows={1}  />
        </Box>
        <Flex  flex='1' flexDir={'column'} position='relative' alignItems={'center'}> 
            <TextCustomToolbar quillRef={quillRef} toolbarPosition={toolbarPosition} />
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

//WEBSITE EDITOR COMPONENT
const WebsiteEditorComponent = ({articleData, setArticleData}:{articleData:ContentData<'webpage'> | null, setArticleData:Dispatch<SetStateAction<ContentData<'webpage'>  | null>>}) => {

    //CONSTANTS
    const  { t } = useTranslation('knowledge')

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
        <textarea ref={textAreaTitleRef} value={articleData?.title} className="title-textarea"  onChange={(e) => {setArticleData(prev => ({...prev as ContentData<'webpage'> , title:e.target.value}))}}  placeholder={t('NoTitleText')} rows={1}  />
    </Box>
    <Flex flex='1' mt='30px' px='20px' overflow={'scroll'}  flexDir={'column'} position='relative' alignItems={'center'}> 
        <Text>
            {(articleData?.data.text || '').split('\n').map((line:string, index:number) => (
                <Text key={index}>
                {line}
                {'\n'}
                </Text>
            ))}
            </Text>
        </Flex>
    </Flex>)
}