/*
    FUNCTION TO WRITE AND SEND THE MESSAGES WITH PURE HTML (conversations/conversation/{conversation_id})
 */

//REACT
import { useState, useRef, useCallback, useMemo, Fragment, useEffect } from 'react'
import { useAuth } from '../../../AuthContext'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../../SessionContext'
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from '../../API/fetchData'
//FRONT
import { Box, Flex, Button, IconButton, Icon, Text, Avatar, Image, Portal, chakra, shouldForwardProp, Progress } from '@chakra-ui/react'
import { AnimatePresence, motion, isValidMotionProp } from 'framer-motion'
import '../../Components/styles.css'
//EDIT PURE HTML COMPONENTS
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import '../../Components/styles.css'
//COMPONENTS
import LoadingIconButton from '../../Components/Reusable/LoadingIconButton'
import IconsPicker from '../../Components/Reusable/IconsPicker'
//FUNCTION
import useOutsideClick from '../../Functions/clickOutside'
import formatFileSize from '../../Functions/formatFileSize'
//ICONS
import { HiOutlinePaperClip, HiOutlineEmojiHappy } from "react-icons/hi"
import { IoArrowUndoSharp } from "react-icons/io5" 
import { IoIosArrowDown } from 'react-icons/io'
import { PiTextTBold } from "react-icons/pi"
import { FaPause, FaPlay, FaDownload, FaLink } from "react-icons/fa6"
import { FaRedo } from 'react-icons/fa'
import { RxCross2 } from "react-icons/rx"
import { MdNoteAlt } from "react-icons/md"
import { BsTypeItalic, BsTypeBold, BsTypeUnderline } from 'react-icons/bs'
//TYPING
import { ConversationsTableProps, statesMap,  ConversationsData } from '../../Constants/typing'
import downloadFile from '../../Functions/downloadFile'
import { useAuth0 } from '@auth0/auth0-react'
   
//TYPING
interface TextEditorProps {
    clientName:string | undefined
    conversationData:ConversationsData
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})


//MAIN FUNCTION
function TextEditor({clientName, conversationData}:TextEditorProps) {

    //TRANSLATION
    const { t } = useTranslation('conversations')
    const { getAccessTokenSilently } = useAuth0()

    //AUTH CONSTANT
    const auth = useAuth()
    const session = useSession()               
    const channels = session.sessionData.additionalData.channels
    const channel = (channels || []).find(ch => ch.id === conversationData?.channel_id)
    const navigate = useNavigate()

    //SEND PANEL REF, FOR HIDDING THE BOX ON SCROLL
    const sendPanelRef = useRef<HTMLDivElement>(null)

    //SEND LIKE BOX LOGIC
    const sendLikeButtonRef = useRef<HTMLDivElement>(null)
    const sendLikeBoxRef = useRef<HTMLDivElement>(null)
    const [showSendLike, setShowSendLike] = useState<boolean>(false)
    useOutsideClick({ref1:sendLikeButtonRef, ref2:sendLikeBoxRef,containerRef:sendPanelRef, onOutsideClick:setShowSendLike})

    //ACTION BOX LOGIC
    const actionNoteRef = useRef<HTMLDivElement>(null)
    const actionBoxRef = useRef<HTMLDivElement>(null)
    const [showChangeAction, setShowChangeAction] = useState<boolean>(false)
    const [sendAction, setSendAction] = useState<'next' | 'close' | 'mantain'>('mantain')
    
    useOutsideClick({ref1:actionNoteRef, ref2:actionBoxRef, containerRef:sendPanelRef, onOutsideClick:setShowChangeAction})

    //INTERNAL NOTES
    const noteRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const [isInternalNote, setIsInternalNote] = useState<boolean>(false)
    const [showSelector, setShowSelector] = useState<boolean>(false)
    useOutsideClick({ref1:noteRef, ref2:boxRef,  onOutsideClick:setShowSelector})

    //WAITING TO SEND A MESAGE
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    //ATTACHMENTS FILES
    const [attachmentsFiles, setAttachmentsFiles] = useState<File[]>([])

    //EDITING THE BOX HEIGHT WITH THE CURSOR
    const [height, setHeight] = useState<number>(channel?.channel_type === 'email' ? 300: 200)
    const handleMouseDown = useCallback((event:any) => {
        const startHeight = height
        const startY = event.pageY
        const handleMouseMove = (e:any) => {
            const newHeight = startHeight - (e.pageY - startY)
            setHeight(newHeight > 50 ? newHeight : 50)
        }
        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    },[height])

    //MESSAGE TO SEND (IT WILL BE HTML IF MAIL AND NORMAL TEXT IN THE OTHER CASES)
    const [htmlValue, setHtmlValue] = useState<string>('')
    const htmlValueRef = useRef<string>(htmlValue)
    useEffect(() => {htmlValueRef.current = htmlValue}, [htmlValue])
    const [textValue, setTextValue] = useState<string>('')
    const textValueRef = useRef<string>(textValue)
    useEffect(() => {textValueRef.current = textValue}, [textValue])

    //INPUTS REFS
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const quillRef = useRef<ReactQuill>(null)

    //SHORTCUTS LOGIC
    const [showShortcuts, setShowShortcuts] = useState<boolean>(false)
    const [filteredShortcuts, setFilteredShortcuts] = useState<string[]>([])
    const [cursorPosition, setCursorPosition] = useState<{bottom:number, left:number}>({ bottom: 0, left: 0 })

    //FOCUS BOX
    const [isFocused, setIsFocused] = useState(false);

    //SHOW THE SHORTCUTS BOX
    const handleShortcuts = (content:string, selection:{index:number}) => {
        
        const shortCutsList = auth.authData?.preferences?.shortcuts || []
        const cursorIndex = selection.index
        const textBeforeCursor = content.slice(0, cursorIndex) || ''
        const lastWord = textBeforeCursor.split(' ').pop() || ''
       
        const search = lastWord.slice(1).toLowerCase()
        const matches = shortCutsList.filter(s => s.toLowerCase().includes(search))
        
        setFilteredShortcuts(matches)
        setShowShortcuts(matches.length > 0 && lastWord.startsWith('/'))

        if (lastWord.startsWith('/') && textAreaRef.current && channel?.channel_type !== 'email') {
    
            const textArea = textAreaRef.current
            const start = textArea.selectionStart;

            const createMirrorDiv = () => {
                const div = document.createElement('div')
                const style = window.getComputedStyle(textArea)
                div.style.position = 'absolute'
                div.style.visibility = 'hidden'
                div.style.whiteSpace = 'pre-wrap'
                div.style.wordWrap = 'break-word'
                div.style.fontFamily = style.fontFamily
                div.style.fontSize = style.fontSize
                div.style.fontWeight = style.fontWeight
                div.style.fontStyle = style.fontStyle
                div.style.letterSpacing = style.letterSpacing
                div.style.padding = style.padding
                div.style.border = style.border
                div.style.width = `${textArea.clientWidth}px`
                div.style.lineHeight = style.lineHeight
                return div
            }

            const mirrorDiv = createMirrorDiv()
            mirrorDiv.textContent = textArea.value.substring(0, start)
            const span = document.createElement('span')
            span.textContent = textArea.value.substring(start) || '.'
            mirrorDiv.appendChild(span)
            document.body.appendChild(mirrorDiv)
            const textAreaBounds = textArea.getBoundingClientRect();
            const mirrorBounds = mirrorDiv.getBoundingClientRect();
            const spanBounds = span.getBoundingClientRect();
            const cursorTop = textAreaBounds.top + (spanBounds.top - mirrorBounds.top) - textArea.scrollTop;
            const cursorLeft = textAreaBounds.left + (spanBounds.left - mirrorBounds.left) - textArea.scrollLeft;
            document.body.removeChild(mirrorDiv);

            setCursorPosition({bottom: window.innerHeight - cursorTop, left: cursorLeft})
        }
        else if (lastWord.startsWith('/') && quillRef.current) {
            const editor = quillRef.current.getEditor()
            const bounds = editor.getBounds(cursorIndex)

            const quillContainer = editor.root;
            const containerBounds = quillContainer.getBoundingClientRect();

            const cursorTop = bounds.top + containerBounds.top + window.scrollY;
            const cursorLeft = bounds.left + containerBounds.left + window.scrollX;

            setCursorPosition({ bottom: window.innerHeight - cursorTop, left: cursorLeft })
        }
    }

    //WRITE THE SELECTED SHORTCUT
    const handleSelectShortcut = (text:string) => {
        if (quillRef.current && channel?.channel_type === 'email') {
          const editor = quillRef.current.getEditor()
          const cursorPosition = editor?.getSelection()?.index;
          const textBeforeCursor = htmlValue.slice(0, cursorPosition)
          const textAfterCursor = htmlValue.slice(cursorPosition);
          const textBeforeLastWord = textBeforeCursor.replace(/\/\S+$/, '')
          const newText = textBeforeLastWord + text + textAfterCursor
          setHtmlValue(newText)
          const newCursorPosition = (textBeforeLastWord.length || 0) + text.length
          editor.setSelection({ index: newCursorPosition, length: 0 })
        }
        else if (textAreaRef.current) {
          const cursorPosition = textAreaRef.current.selectionStart
          const textBeforeCursor = textValue.slice(0, cursorPosition)
          const textAfterCursor = textValue.slice(cursorPosition)
          const textBeforeLastWord = textBeforeCursor.replace(/\/\S*$/, '')
          const newText = textBeforeLastWord + text + textAfterCursor
          setTextValue(newText)
          textAreaRef.current.setSelectionRange(textBeforeLastWord.length + text.length, textBeforeLastWord.length + text.length)
        }
        setShowShortcuts(false)
    }

    //MAIL MESSAGES LOGIC 
     const handleEmojiClick = (emoji: string, event: any) => {
        if (channel?.channel_type  === 'email'  && quillRef.current) {
            const quill = quillRef.current.getEditor()
            const range = quill.getSelection(true)
            if (range) quill.insertText(range.index, emoji)
        }
        else if (channel?.channel_type !== 'email'  && textAreaRef.current) {
            const start = textAreaRef.current.selectionStart
            const end = textAreaRef.current.selectionEnd
            const text = htmlValue
            const before = text.substring(0, start)
            const after  = text.substring(end, text.length)
            setHtmlValue(before + emoji + after)
        }
    }

   
    const modules = {
        toolbar:  {
            container: "#toolbar"
          },
    }
    const icons = Quill.import('ui/icons') as any
    icons.bold = null
    icons.italic = null
    icons.underline = null
    icons['code-block'] = null
    icons.align = null
    icons.header = null
    icons.link = null

    //SEND A MESSAGE
    const sendMessage = async (type:string, content:any)=> {

        let messageContent:any = {type:type, content:content}
        if (type === 'plain') messageContent = {type, is_internal_note:false, content:{text:textValueRef.current}}
        else if (type === 'internal_note') messageContent = {type, is_internal_note:true, content:{text:textValueRef.current}}

        else if (type === 'email') {
            const sendAttachments = await Promise.all(
                attachmentsFiles.map(async (file) => {
                    const urlInfo = await getPreSignedUrl(file, true)
                    return urlInfo
                })
            )
            messageContent = {type, is_internal_note: false, content: {theme:'', html:htmlValueRef.current, text:textValueRef.current, attachments:sendAttachments} }
            setHtmlValue('') 
            setAttachmentsFiles([])
        }
        else {
            const fileContent = await getPreSignedUrl(content, true)
            messageContent = {type, content:fileContent}
        }
        setTextValue('')
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/${conversationData?.id}/messages`,getAccessTokenSilently, setWaiting:setWaitingSend, requestForm:messageContent, method:'post', auth, toastMessages:{'failed':t('MessageSentFailed'), 'works':t('MessageSent')}})
        
        if (response?.status === 200) {
            if (sendAction === 'close') {
                navigate('/conversations')
            }
            else if (sendAction === 'next') {
                const currentView =  JSON.parse(localStorage.getItem('currentView') || 'null')
                if (currentView) {
                    const currentTable = session.sessionData.conversationsTable.find((element) => (element.view.view_type === currentView.type && element.view.view_index === currentView.index ) )
                    if (currentTable) {
                        const findIndexConversationIndex =  currentTable.data.page_data.findIndex((con:ConversationsTableProps) => (conversationData?.id === con.id)) + 1
                        if (findIndexConversationIndex >= currentTable.data.page_data.length) navigate(`/conversations/conversation/${currentTable.data.page_data[0].id}`)
                        else navigate(`/conversations/conversation/${currentTable.data.page_data[findIndexConversationIndex].id}`)
                    }
                }
            }
        }   

    }
    
    //SELECT A FILE
    const handleFileSelect = async (e: any) => {

        const files = e.target.files
        const maxFileSize = 10 * 1024 * 1024
        if (files) {
            const selectedFilesArray = Array.from(files) as File[]
            if (channel?.channel_type === 'email') setAttachmentsFiles((prev: File[]) => [...prev, ...selectedFilesArray]);
            else {
                const file = selectedFilesArray[0] as File
                if (file.size > maxFileSize) return
                let fileType = 'file'
                if (file.type.startsWith('image/')) fileType = 'image'
                else if (file.type === 'application/pdf') fileType = 'pdf'
                else if (file.type.startsWith('video/')) fileType = 'video'
                sendMessage(fileType, file)
            }
         }
    }

    //PRE-SIGNED URSLS LOGIC
    const getPreSignedUrl = async (file:File, isMail:boolean) => {
        const response = await fetchData({endpoint: `${auth.authData.organizationId}/s3_pre_signed_url`, method:'post', getAccessTokenSilently, auth, requestForm: { file_name: file.name, channel_type:channel?.channel_type}})   
        if (response?.status === 200) {
            const responseUpload = await fetch(response.data.upload_url, {method: "PUT", headers: {}, body: file})
            if (responseUpload.ok) {
                if (isMail) return {url: response.data.access_url, file_name: file.name, size:file.size, type:file.type}       
                else return {url: response.data.access_url, object_id: response.data.object_id, file_name: file.name, file_size:file.size}
            }
            else  new Error('Failed to upload file.')
        }
    }

    //TOTAL SIZE OF THE ATTACHMENTS FILES
    const totalSize = attachmentsFiles.reduce((acc, file) => acc + file.size, 0)
    
    //COMPONENTS FOR EACH ATTACHMENT FILE
    const AttachmentFilesComponent =  useMemo(() =>  ({file, index}:{file:File, index:number}) => {

        //STYLES CONSTANTS
        const fileTypeColors:{[key: string]: string} = {'PDF':'red.500', 'DOCX':'blue.600', 'ZIP':'orange.500'}
        const fileType = (file?.name || '').split('.')[1].toUpperCase()
        const imageUrl = useMemo(() => URL.createObjectURL(file), [file])

        //IS HOVERING BOOLEAN
        const [isHovering, setIsHovering] = useState<boolean>(false)

        //REMOVE FILEW
        const removeFileAtIndex = () => {setAttachmentsFiles(currentFiles => currentFiles.filter((_, idx) => idx !== index));}

        return (

            <Flex  bg={fileTypeColors[fileType] || 'gray.100'} color={fileType in fileTypeColors?'white':'black'} position='relative' onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} key={`attachment-file-${index}`} cursor={'pointer'} height={'100px'} width={'140px'}  borderColor={'border_color'} borderWidth={'1px'} justifyContent={'center'} alignItems={'center'}>
                {file.type.startsWith('image/') ? 
                    <Image objectFit='cover' objectPosition='center' src={imageUrl} height={'100%'} width={'100%'} />
                    :
                    <Text fontWeight={'medium'} fontSize='1.2em'>{(file?.name || '').split('.')[1].toUpperCase()}</Text>
                }
                <AnimatePresence> 
                    {isHovering && 
                        <MotionBox p='5px'  overflow={'hidden'} alignItems={'center'} position='absolute' bottom={0} width={'100%'} display={'flex'} gap='5px' bg='blackAlpha.700' color='white' initial={{bottom:-50}} animate={{bottom:0}} exit={{bottom:-50}}  transition={{ duration: '0.2',  ease: 'easeOut'}} >
                            <Text fontWeight={'medium'} fontSize={'.8em'} flex='1' minW={0} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{file.name}</Text>
                            <Icon boxSize='16px' onClick={removeFileAtIndex} as={RxCross2} color='white' borderRadius={'.2rem'} p='2px' _hover={{bg:'text_gray'}}/>
                        </MotionBox>}
                </AnimatePresence>
            </Flex>
            )
    }, [])

    //HANDLE CHANGE OF TEXT AND HTML VALUE
    const handleChange = (content:any, delta:any, source:any, editor:any) => {
        const cursorIndex = editor.getSelection()?.index || 0
        const text = editor.getText() 
        handleShortcuts(text, {index: cursorIndex}) 
        setHtmlValue(content)
        setTextValue(text)
    }

    //HANDLE SEND A TEXT MESSAGE
    const handleButtonClick = (state:'new' | 'open' | 'pending' |  'solved' | 'closed') => {
        
        setShowSendLike(false)

        if (totalSize < 10 * 1024 * 1024 && (textValueRef.current.trim() !== '')) {
            if (channel?.channel_type !== 'email') sendMessage(isInternalNote ? 'internal_note':'plain', textValueRef.current)
            else  sendMessage(isInternalNote ? 'internal_note': 'email', htmlValueRef.current)
        }
    }
    
    // Efecto para escuchar los eventos del teclado
    useEffect(() => {
        const handleKeyPress = (event:KeyboardEvent) => {
             if (!showShortcuts) {
               if ((event.shiftKey  || event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                   
                    handleButtonClick('pending')
                    event.preventDefault()
                    event.stopPropagation()
                   
                }
                else if (event.metaKey || event.ctrlKey) {
                    if (event.code === 'KeyR'){
                        setIsInternalNote(false)
                        setShowSelector(false)
                    }
                    else if (event.code === 'KeyN'){
                        setIsInternalNote(true)
                        setShowSelector(false)
                    }
                    else if (event.code === 'KeyO') handleButtonClick('open')
                    else if (event.code === 'KeyP') handleButtonClick('pending')
                    else if (event.code === 'KeyS') handleButtonClick('solved')
                }

            }
        }
        document.addEventListener('keydown', handleKeyPress)
        return () => {document.removeEventListener('keydown', handleKeyPress)}
    }, [showShortcuts, isInternalNote, conversationData])
   
    const ShortCutsBox = ({ shortcuts, onSelect, position }:{shortcuts:string[], onSelect:any, position:any }) => {

        const selectedItemRef = useRef<number>(0)
        const [selectedItem, setSelectedItem] = useState<number>(0)
        useEffect(() => {selectedItemRef.current = selectedItem}, [selectedItem])

        useEffect(() => {
            
            const handleKeyDown = (event:KeyboardEvent) => {

                if (event.key === 'ArrowDown' ||event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Enter' ){
                    event.preventDefault()
                    event.stopPropagation()
                }
                if (event.key === 'ArrowDown') setSelectedItem((prev) => (prev + 1) % shortcuts.length)
                else if (event.key === 'ArrowUp') setSelectedItem((prev) => (prev - 1 + shortcuts.length) % shortcuts.length)
                else if (event.key === 'Enter') onSelect(shortcuts[selectedItemRef.current])  
            }
            window.addEventListener('keydown', handleKeyDown)
            return () => {window.removeEventListener('keydown', handleKeyDown)}
        }, [])

        return(
            <Box position={'fixed'}fontSize={'.85em'} left={position.left} bottom={position.bottom} maxH='40vh' maxW={'400px'} overflow={'scroll'}  boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'border_color'}>
                {shortcuts.length === 0 ? <Text color='text_gray'>No hay atajos definidos</Text>:<>
                {shortcuts.map((shorcut, index) => (
                    <Flex key={`shorcut-${index}`} bg={selectedItem === index?'hover_gray':'white'} cursor={'pointer'} p='5px' _hover={{bg:'hover_gray'}} onClick={() => onSelect(shorcut)} alignItems={'center'}>
                        {shorcut}
                    </Flex>
                ))}</>}
            </Box>
        )
    }
    
    const activeFormatsRef = useRef<any>({})
    const showBox = (conversationData?.is_matilda_engaged && conversationData?.status !== 'closed'  && conversationData?.call_status !== 'completed'  )
     
    


    //FRONT
    return (<> 
    {((conversationData?.status !== 'closed'  && !conversationData?.is_matilda_engaged)   || ( conversationData?.call_status === 'completed')) && 
        <Box   p={showBox ? '0':'0 15px 15px 15px'} > 
            {showShortcuts && (<ShortCutsBox shortcuts={filteredShortcuts} onSelect={handleSelectShortcut} position={cursorPosition}/>)}
            <input id='selectFile' type="file" multiple={channel?.channel_type === 'email'} style={{display:'none'}}   onChange={(e) =>  handleFileSelect(e)} accept=".pdf, .doc, .docx, image/*" />
            
            <Flex  flexDir={'column'}  borderRadius={showBox?'0':'1rem'} overflow={'hidden'} borderColor={showBox?'':'border_color'} borderWidth={showBox?'0':'1px'} transition={'box-shadow 0.2s ease-in-out'}  boxShadow={showBox?'':   isFocused ? '0 0 0 2px rgb(59, 90, 246, 0.6)' : '0 0 10px 0px rgba(0, 0, 0, 0.1)'}>    
                <> 
                {conversationData?.call_status === 'completed'  ? 
                    <Flex flexDir={'column'} alignItems={'center'} justifyContent={'center'} h='150px'> 
                    <AudioRecord url={conversationData?.call_url} />
                    </Flex>
                :
                <Flex  flexDir={'column'}  position={'relative'} transition={'background ease-in-out 0.1s'} bg={isInternalNote?'yellow.100':''} minH={'150px'} maxH={'600px'} height={`${height}px`} > 
                    {conversationData?.status === 'closed' && 
                        <Flex alignItems={'center'} justifyContent={'center'} position={'absolute'} zIndex={10000} height={'100%'} w='100%' bg='rgba(200, 200, 200, 0.4)' backdropFilter={'blur(0.8px)'}>
                            <Text fontSize={'1.2em'} fontWeight={'medium'} maxW={'60%'} textAlign={'center'}>{t('ClosedConversation')}</Text>
                        </Flex>}
                    
                        <Box height={'10px'}  onMouseDown={handleMouseDown} cursor='ns-resize'/>
                        <Flex pt='5px' gap='10px' pb='15px' px='15px' alignItems={'center'} justifyContent={'space-between'}> 
                            <Flex alignItems={'center'} gap='9px' maxW={'100%'}>
                                <Portal > 
                                    {showSelector &&
                                        <MotionBox ref={boxRef} id='custom-portal' initial={{ opacity: 0, marginBottom: -10}} animate={{ opacity: 1, marginBottom: 0 }}  exit={{ opacity: 0, marginBottom: -10}} transition={{ duration: '0.2',  ease: 'easeOut'}} 
                                        fontSize={'.8em'} overflow={'hidden'} bottom={window.innerHeight -  (noteRef.current?.getBoundingClientRect().top || 0) + 10}  left={noteRef.current?.getBoundingClientRect().left} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.1)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.5rem'} borderWidth={'1px'} borderColor={'border_color'}>
                                            <Flex p='10px' alignItems={'center'} gap='7px' cursor={'pointer'} _hover={{bg:'hover_gray'}} onClick={() => {setIsInternalNote(true);setShowSelector(false)}}>
                                                <Icon as={MdNoteAlt}/>
                                                <Text whiteSpace={'nowrap'}>{t('InternalNote')}</Text>
                                            </Flex>
                                            <Flex p='10px' alignItems={'center'} gap='7px' cursor={'pointer'} _hover={{bg:'hover_gray'}} onClick={() => {setIsInternalNote(false);setShowSelector(false)}}>
                                                <Icon as={IoArrowUndoSharp}/>
                                                <Text whiteSpace={'nowrap'}>{t('Public')}</Text>
                                            </Flex>
                                        </MotionBox>
                                    }
                                </Portal> 
                                <Flex ref={noteRef} cursor={'pointer'} gap='5px' alignItems={'center'} onClick={() => setShowSelector(!showSelector)}> 
                                    <Icon as={isInternalNote?MdNoteAlt:IoArrowUndoSharp} color='gray.400' boxSize={'16px'}/>
                                    <Text color='text_gray' fontSize={'.8em'} fontWeight={'medium'} whiteSpace={'nowrap'}>{isInternalNote?t('InternalNote'):t('Public')}</Text>
                                    <Icon  color='text_gray'className={ showSelector? "rotate-icon-up" : "rotate-icon-down"} as={IoIosArrowDown} boxSize={'14px'}/>
                                </Flex>
                            </Flex>
                        </Flex>
                        <Flex flex='1'> 
                            {channel?.channel_type === 'email' ? 
                            <> 
                            {attachmentsFiles.length > 0 && <>
                                <Box px='20px'  > 
                                    <Flex  overflowX={'scroll'} width={'100%'}> 
                                        <Flex  gap='10px' >
                                            {attachmentsFiles.map((file, index) => (<Fragment key={`attachment-${index}`}> <AttachmentFilesComponent file={file} index={index}/></Fragment>))}
                                        </Flex>
                                    </Flex>
                                    <Text mt='1vh' color={totalSize > 10 * 1024 * 1024 ? 'red':'black'} mb='1vh' fontSize={'.9em'}>Tamaño del correo: <span style={{fontWeight:'500'}}> {formatFileSize(totalSize)}</span> {totalSize > 10 * 1024 * 1024 && '(sólo se permite enviar un máximo de 10 MB)'}</Text>
                                </Box>
                                <Box height={'1px'} bg='border_color' width={'100%'}/>
                            </>}
                            <ReactQuill placeholder={t('PlaceholderShortcuts')} modules={modules} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} ref={quillRef} theme="snow" value={htmlValue} onChange={handleChange} className={''} style={{ height: '100%', width:'100%', display: 'flex', flexDirection: 'column-reverse'}} />
                            </>
                            :
                            <textarea ref={textAreaRef} placeholder={t('PlaceholderShortcuts')} value={textValue} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} onChange={(e) => {setTextValue(e.target.value); handleShortcuts(e.target.value, {index: e.target.selectionStart}) }}  style={{ width: '100%', padding:'15px', background:'transparent', outline: 'none', border:'none', resize:'none', fontSize:'.9em'}} />
                            }
                        </Flex>

                        <Flex ref={sendPanelRef} maxW={'100%'} justifyContent={'space-between'} px='15px' py='10px' gap='15px' alignItems={'center'}  width={'100%'}>
                            <Flex gap='10px'> 
                                {channel?.channel_type === 'email' && <CustomToolbar quillRef={quillRef} activeFormatsRef={activeFormatsRef}/>}
                                 <IconButton aria-label='edit-text' icon={<HiOutlinePaperClip/>} size='sm' bg='transparent' variant={'common'} onClick={() => document.getElementById('selectFile')?.click()}/>
                                
                                {/*<IconButton ref={emojiButtonRef} aria-label='edit-text' icon={<HiOutlineEmojiHappy/>} size='sm'  bg={emojiVisible ? 'gray_2':'transparent' } color={emojiVisible ? 'text_blue':black }  _hover={{color:'text_blue'}}  onClick={()=>{setToolbarVisible(false);setEmojiVisible(!emojiVisible)}}  />*/}
                            </Flex>
                            <Flex gap='10px' alignItems={'center'}  > 
                            

                                <Box position={'relative'} >  
                                
                                    <Flex cursor={'pointer'} gap='1px' >
                                        <Flex gap='10px'   alignItems={'center'} onClick={() => handleButtonClick('pending')} bg={'#222'} px='12px' py='5px' borderRadius={'.5em'} color='white' _hover={{bg:'blackAlpha.800'}}>
                                            {waitingSend?<LoadingIconButton/> :
                                            <Flex alignItems={'center'} gap='10px' >
                                                <Text whiteSpace={'nowrap'} fontWeight={'semibold'} >{t('Send')}</Text>
                                            </Flex>}
                                            <Flex bg='rgba(256, 256, 256, 0.03)' alignItems={'center'} h='18px' fontSize={'.8em'} px='5px' borderColor={'white'} borderWidth={'1px'} borderRadius={'.3rem'}>
                                                ⌘⏎
                                            </Flex>
                                        </Flex>
                                    </Flex>
                                </Box>
                                </Flex>
                        </Flex>
                </Flex>}
                </>
                
            </Flex>

             
        </Box>}
    </>)
}

export default TextEditor

const AudioRecord = ({url}:{url:string}) => {

    //REFS
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const progressBarRef = useRef<HTMLDivElement | null>(null); // Ref para la barra de progreso

    //VARIABLES
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [progress, setProgress] = useState<number>(0)
    const [currentTime, setCurrentTime] = useState<number>(0)
    const [duration, setDuration] = useState<number>(0)
    const [isDragging, setIsDragging] = useState<boolean>(false);

    //GET AUDIO CONFIGS
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
          const setAudioDuration = () => setDuration(audio.duration)
          audio.addEventListener('loadedmetadata', setAudioDuration)
          return () => audio.removeEventListener('loadedmetadata', setAudioDuration)
        }
      }, [url])

    //PLAY THE AUDIO
    const togglePlay = () => {
      const audio = audioRef.current
      if (audio) {
        if (isPlaying) audio.pause()
        else audio.play();
        setIsPlaying(!isPlaying)
      }
    }
  
    //UPDATE AUDIO
    const updateProgress = () => {
      const audio = audioRef.current
      if (audio) {
        const currentProgress = (audio.currentTime / audio.duration) * 100
        setProgress(currentProgress)
        setCurrentTime(audio.currentTime)
      }
    }
  
    //FORMAT TIME
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    //UPDATE AUDIO PROGRESS
    const updateAudioProgress = (offsetX: number) => {
        const audio = audioRef.current
        if (audio && progressBarRef.current) {
            const { clientWidth } = progressBarRef.current
            const newProgress = (offsetX / clientWidth) * 100
            audio.currentTime = (newProgress / 100) * duration
            setProgress(newProgress)
            setCurrentTime(audio.currentTime)
        }
    }

    //DRAG AUDIO BAR
    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true)
        updateAudioProgress(event.nativeEvent.offsetX)
    }
    const handleMouseMove = (event: MouseEvent) => {
        if (isDragging) {
            const progressBar = document.getElementById('progress-bar');
            if (progressBar) {
            const { left, width } = progressBar.getBoundingClientRect();
            const offsetX = event.clientX - left;
            if (offsetX >= 0 && offsetX <= width) {
                updateAudioProgress(offsetX);
            }
            }
        }
    }
    const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {updateAudioProgress(event.nativeEvent.offsetX)}
    const handleMouseUp = () => {setIsDragging(false)}
    useEffect(() => {
    if (isDragging) {
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
    }, [isDragging])

    return (
        <Box maxW="500px" width={'100%'} p="4" bg="gray_2" borderRadius="md" boxShadow="md" textAlign="center">
            <audio ref={audioRef} src={url} onTimeUpdate={updateProgress} />
            
            <Flex gap='10px' alignItems={'center'}>
                <Text fontWeight={'medium'} fontSize={'.9em'}>{formatTime(currentTime)}</Text>
                <Box cursor='pointer' ref={progressBarRef} id="progress-bar" flex="1" height="8px" borderRadius="md" bg="border_color" onClick={handleProgressClick} position="relative" onMouseDown={handleMouseDown}>
                    <Box position="absolute" height="8px"borderRadius="md"bg="text_blue"width={`${progress}%`}/>
                </Box>
                <Text fontWeight={'medium'} fontSize={'.9em'}>{formatTime(duration)}</Text>
            </Flex>
            <Flex gap='32px' justifyContent={'center'} mt='1vh' alignItems="center">
                <IconButton icon={<FaDownload />} onClick={() => downloadFile(url)} isRound aria-label="Descargar MP3"  bg="transparent"  variant={'common'}/>
                <IconButton icon={isPlaying ? <FaPause /> : <FaPlay />} onClick={togglePlay} aria-label="Reproducir/Pausar"  color='white' bg={'text_blue'} _hover={{bg:'text_blue'}} isRound size="lg"/>
                <IconButton icon={<FaRedo />} onClick={() => updateAudioProgress(0)} aria-label="Volver a reproducir" isRound bg="transparent"  variant={'common'}/>
            </Flex>
      </Box>
    )
}

const CustomToolbar = ({quillRef, activeFormatsRef}:{quillRef:any, activeFormatsRef:any}) => {
    
    const [activeFormats, setActiveFormats] = useState<any>(activeFormatsRef.current)
    useEffect(() => {activeFormatsRef.current = activeFormats},[activeFormats])

    useEffect(() => {

            const editor = quillRef.current.getEditor()
            const handleSelectionChange = () => {
                const selection = editor.getSelection()
                if (selection) {
                    const formats = editor.getFormat(selection)
                    setActiveFormats(formats)
                }
            }
            editor.on('selection-change', handleSelectionChange)
    
            return () => {editor.off('selection-change', handleSelectionChange)}
        
    }, [quillRef])

    const toolbarButtonRef = useRef<HTMLDivElement>(null)
    const toolbarBoxRef = useRef<HTMLDivElement>(null)
    const [toolbarVisible, setToolbarVisible] = useState<boolean>(false)
    useOutsideClick({ref1:toolbarButtonRef, ref2:toolbarBoxRef,  onOutsideClick:setToolbarVisible })

    const formatText = (format:string, value:any) => {
        const editor = quillRef.current.getEditor()
        editor.format(format, value)
        const formats = editor.getFormat(editor.getSelection())
        setActiveFormats(formats)
    }
    
    return (
    <Box position={'relative'} >
        <Box ref={toolbarButtonRef}> 
            <IconButton aria-label='edit-text' bg={toolbarVisible ? 'gray_1':'transparent' } color={toolbarVisible ? 'text_blue':'black' }   variant={'common'} icon={<PiTextTBold/>} size='sm' onClick={() => {setToolbarVisible(!toolbarVisible)}} />
        </Box>
        <Flex id="toolbar" ref={toolbarBoxRef} opacity={toolbarVisible ? 1:0} transform={`scale(${toolbarVisible ? 1: 0.95})`} pointerEvents={toolbarVisible?'auto':'none'} transition={'all .1s ease-in-out'}
            style={{ transformOrigin: 'bottom left' }}  position='fixed' bg='white'  left={toolbarButtonRef?.current?.getBoundingClientRect()?.left || 0} bottom={`${window.innerHeight - (toolbarButtonRef?.current?.getBoundingClientRect()?.top || 0)+ 5}px`} zIndex={100000} >
            
            <Flex zIndex={1000} bg='white' alignItems={'center'} borderRadius={'.5rem'} p='5px' boxShadow='0 2px 5px rgba(0, 0, 0, 0.2)' >
                <IconButton onClick={(e) => {e.stopPropagation() ;formatText('bold', !activeFormats.bold)}}  bg={activeFormats.bold ? 'gray_1' : 'transparent'} color={activeFormats.bold? 'rgba(59, 90, 246)' : 'black'}  
                className="ql-bold"  _hover={{bg:activeFormats.bold ? 'gray_1' :'gray_2'}}  icon={<BsTypeBold/>} size='sm' aria-label="bold" />
                <IconButton onClick={() => formatText('italic', !activeFormats.italic)} bg={activeFormats.italic ? 'gray_1' : 'transparent'} color={activeFormats.italic? 'rgba(59, 90, 246)' : 'black'}  
                className="ql-italic" _hover={{bg:activeFormats.italic ? 'gray_1' :'gray_2'}} ml='5px' variant={'common'} icon={<BsTypeItalic/>} size='sm' aria-label="italic" />
                <IconButton onClick={() => formatText('underline', !activeFormats.underline)}  bg={activeFormats.underline ? 'gray_1' : 'transparent'} color={activeFormats.underline? 'rgba(59, 90, 246)' : 'black'} 
                className="ql-underline" ml='5px' variant={'common'} _hover={{bg:activeFormats.underline ? 'gray_1' :'gray_2'}}  icon={<BsTypeUnderline/>} size='sm' aria-label="underline" />
                <IconButton  onClick={() => formatText('link', !activeFormats.link)}  bg={activeFormats.link ? 'gray_1' : 'transparent'} color={activeFormats.link? 'rgba(59, 90, 246)' : 'black'} 
                className="ql-link" ml='5px' variant={'common'}  _hover={{bg:activeFormats.link ? 'gray_1' :'gray_2'}} icon={<FaLink/>} size='sm' aria-label="link" />
            </Flex>
        </Flex>
        </Box>)
    }