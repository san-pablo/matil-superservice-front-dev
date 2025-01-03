/*
    FUNCTION TO WRITE AND SEND THE MESSAGES WITH PURE HTML (conversations/conversation/{conversation_id})
 */

//REACT
import { useState, useRef, useCallback, useMemo, Fragment, useEffect } from 'react'
import { useAuth } from '../../../AuthContext'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../../SessionContext'
import { useTranslation } from 'react-i18next'
//FRONT
import { Box, Flex, Button, IconButton, Icon, Text, Avatar, Image, Portal, chakra, shouldForwardProp, Progress } from '@chakra-ui/react'
import { AnimatePresence, motion, isValidMotionProp } from 'framer-motion'
import '../../Components/styles.css'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
//FETCH DATA
import fetchData from '../../API/fetchData'
import LoadingIconButton from '../../Components/Reusable/LoadingIconButton'
//EDIT PURE HTML COMPONENTS
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import '../../Components/styles.css'
//FUNCTION
import useOutsideClick from '../../Functions/clickOutside'
import formatFileSize from '../../Functions/formatFileSize'
//ICONS
import { HiOutlinePaperClip, HiOutlineEmojiHappy } from "react-icons/hi"
import { IoArrowUndoSharp } from "react-icons/io5" 
import { IoIosArrowDown } from 'react-icons/io'
import { PiTextTBold } from "react-icons/pi"
import { FaRegEdit } from "react-icons/fa"
import { FaLockOpen, FaPause, FaPlay, FaDownload,  } from "react-icons/fa6"
import { FaRedo } from 'react-icons/fa'
import { RxCross2 } from "react-icons/rx"
import { BsStars } from "react-icons/bs"
import { MdNoteAlt } from "react-icons/md"
//TYPING
import { DeleteHeaderSectionType, ConversationsTableProps, statesMap,  ConversationsData } from '../../Constants/typing'
import downloadFile from '../../Functions/downloadFile'
import { useAuth0 } from '@auth0/auth0-react'
   
//TYPING
interface TextEditorProps {
    clientName:string | undefined
    conversationData:ConversationsData
    updateData:(section:'conversation' | 'client', newData?:ConversationsData | null) => {}
    takeConversationControl:() => void
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})


//MAIN FUNCTION
function TextEditor({clientName, conversationData, updateData, takeConversationControl }:TextEditorProps) {

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
        
        const shortCutsList = auth.authData.shortcuts
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
     const handleEmojiClick = (emojiObject: EmojiClickData, event: any) => {
        if (channel?.channel_type  === 'email'  && quillRef.current) {
            const quill = quillRef.current.getEditor()
            const range = quill.getSelection(true)
            if (range) quill.insertText(range.index, emojiObject.emoji)
        }
        else if (channel?.channel_type !== 'email'  && textAreaRef.current) {
            const start = textAreaRef.current.selectionStart
            const end = textAreaRef.current.selectionEnd
            const text = htmlValue
            const before = text.substring(0, start)
            const after  = text.substring(end, text.length)
            setHtmlValue(before + emojiObject.emoji + after)
        }
    }

    //SHOW AND HIDE TOOLBARS    
    const emojiBoxRef = useRef<HTMLDivElement>(null)
    const emojiButtonRef = useRef<HTMLButtonElement>(null)
    const [toolbarVisible, setToolbarVisible] = useState<boolean>(false)
    const [emojiVisible, setEmojiVisible] = useState<boolean>(false)
    useOutsideClick({ref1:emojiBoxRef, ref2:emojiButtonRef,onOutsideClick:setEmojiVisible })

    const fontSizeArr = ['8px','9px','10px','12px','14px','16px','20px','24px','32px','42px','54px','68px','84px','98px']
    var Size = Quill.import('attributors/style/size')
    Size.whitelist = fontSizeArr;
    Quill.register(Size, true)
    const modules = {
        toolbar: [
        [{ 'size': fontSizeArr}],  
        ['bold', 'italic', 'underline'], 
        ['blockquote', 'code-block'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        ['link']
        ]
    }

    //SEND A MESSAGE
    const sendMessage = async (type:string, content:any)=> {

        let messageContent = {type:type, content:content}
        if (type === 'plain') messageContent = {type, content:{text:textValueRef.current}}
        else if (type === 'internal_note') messageContent = {type, content:{text:textValueRef.current}}

        else if (type === 'email') {
            const sendAttachments = await Promise.all(
                attachmentsFiles.map(async (file) => {
                    const urlInfo = await getPreSignedUrl(file, true)
                    return urlInfo
                })
            )
            messageContent = {type, content: {theme:conversationData?.theme, html:htmlValueRef.current, text:textValueRef.current, attachments:sendAttachments} }
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
                //deleteHeaderSection({description:'', code:conversationData?.id || -1, local_id:conversationData?.local_id, type:'conversation' })
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
                else return {url: response.data.access_url, object_uuid: response.data.object_uuid, file_name: file.name, file_size:file.size}
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
        const fileType = file.name.split('.')[1].toUpperCase()
        const imageUrl = useMemo(() => URL.createObjectURL(file), [file])

        //IS HOVERING BOOLEAN
        const [isHovering, setIsHovering] = useState<boolean>(false)

        //REMOVE FILEW
        const removeFileAtIndex = () => {setAttachmentsFiles(currentFiles => currentFiles.filter((_, idx) => idx !== index));}

        return (

            <Flex  bg={fileTypeColors[fileType] || 'gray.100'} color={fileType in fileTypeColors?'white':'black'} position='relative' onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} key={`attachment-file-${index}`} cursor={'pointer'} height={'100px'} width={'140px'}  borderColor={'gray.200'} borderWidth={'1px'} justifyContent={'center'} alignItems={'center'}>
                {file.type.startsWith('image/') ? 
                    <Image objectFit='cover' objectPosition='center' src={imageUrl} height={'100%'} width={'100%'} />
                    :
                    <Text fontWeight={'medium'} fontSize='1.2em'>{file.name.split('.')[1].toUpperCase()}</Text>
                }
                <AnimatePresence> 
                    {isHovering && 
                        <MotionBox p='5px'  overflow={'hidden'} alignItems={'center'} position='absolute' bottom={0} width={'100%'} display={'flex'} gap='5px' bg='blackAlpha.700' color='white' initial={{bottom:-50}} animate={{bottom:0}} exit={{bottom:-50}}  transition={{ duration: '0.2',  ease: 'easeOut'}} >
                            <Text fontWeight={'medium'} fontSize={'.8em'} flex='1' minW={0} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{file.name}</Text>
                            <Icon boxSize='16px' onClick={removeFileAtIndex} as={RxCross2} color='white' borderRadius={'.2rem'} p='2px' _hover={{bg:'gray.600'}}/>
                        </MotionBox>}
                </AnimatePresence>
            </Flex>
            )
    }, [])

    //HANDLE CHANGE OF TEXT AND HTML VALUE
    const handleChange = (content:any, delta:any, source:any, editor:any) => {
        const cursorIndex = editor.getSelection().index
        const text = editor.getText()

        handleShortcuts(text, {index: cursorIndex}) 
        setHtmlValue(content)

        setTextValue(text)
    }

    //HANDLE SEND A TEXT MESSAGE
    const handleButtonClick = (state:'new' | 'open' | 'pending' |  'solved' | 'closed') => {
        
        setShowSendLike(false)
        updateData('conversation', {...conversationData as ConversationsData, 'status':state})

        if (totalSize < 10 * 1024 * 1024 && (textValueRef.current.trim() !== '')) {
            if (channel?.channel_type !== 'email') sendMessage(isInternalNote ? 'internal_note':'plain', textValueRef.current)
            else  sendMessage(isInternalNote ? 'internal_note': 'email', htmlValueRef.current)
        }
    }
    
    // Efecto para escuchar los eventos del teclado
    useEffect(() => {
        const handleKeyPress = (event:KeyboardEvent) => {
             if (!showShortcuts) {
                if (event.key === 'Enter' && !(event.metaKey || event.ctrlKey)) {
                    handleButtonClick('pending')
                    event.preventDefault()
                    event.stopPropagation()
                } 
                else if (event.shiftKey  && event.key === 'Enter') {
                 
                    event.preventDefault()
                    event.stopPropagation()
                    if (channel?.channel_type !== 'email' && textAreaRef.current) {
                        const start = textAreaRef.current.selectionStart
                        const end = textAreaRef.current.selectionEnd
                        const text = textValueRef.current
                        const before = text.substring(0, start)
                        const after = text.substring(end, text.length)
                        setTextValue(before + '\n' + after)
                        setTimeout(() => {
                            if (textAreaRef.current) {
                                textAreaRef.current.selectionStart = start + 1;
                                textAreaRef.current.selectionEnd = start + 1;
                            }
                        }, 0)
                    } else if (channel?.channel_type === 'email' && quillRef.current) {
                        const quill = quillRef.current.getEditor();
                        const range = quill.getSelection(true);
                        if (range) {
                            quill.insertText(range.index, '\n');
                        }
                    }
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
            <Box position={'fixed'}fontSize={'.85em'} left={position.left} bottom={position.bottom} maxH='40vh' maxW={'400px'} overflow={'scroll'}  boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.300'}>
                {shortcuts.length === 0 ? <Text color='gray.600'>No hay atajos definidos</Text>:<>
                {shortcuts.map((shorcut, index) => (
                    <Flex key={`shorcut-${index}`} bg={selectedItem === index?'brand.hover_gray':'white'} cursor={'pointer'} p='5px' _hover={{bg:'brand.hover_gray'}} onClick={() => onSelect(shorcut)} alignItems={'center'}>
                        {shorcut}
                    </Flex>
                ))}</>}
            </Box>
        )
    }
    

    const showBox = (conversationData?.user_id === 'matilda' && conversationData?.status !== 'closed'  && conversationData?.call_status !== 'completed'  )
    
    //FRONT
    return (<> 
    <Box p={showBox ? '0':'0 15px 15px 15px'} > 
        {showShortcuts && (<ShortCutsBox shortcuts={filteredShortcuts} onSelect={handleSelectShortcut} position={cursorPosition}/>)}
        <input id='selectFile' type="file" multiple={channel?.channel_type === 'email'} style={{display:'none'}}   onChange={(e) =>  handleFileSelect(e)} accept=".pdf, .doc, .docx, image/*" />
        <svg width="0" height="0">
            <defs>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'rgba(0, 102, 204, 0.8)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'rgba(102, 51, 255, 0.7)', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
        </svg>

        <Box borderRadius={showBox?'0':'1rem'} overflow={'hidden'} borderColor={showBox?'':'gray.200'} borderWidth={showBox?'0':'1px'} transition={'box-shadow 0.2s ease-in-out'}  boxShadow={showBox?'':   isFocused ? '0 0 0 2px rgb(59, 90, 246, 0.6)' : '0 0 10px 0px rgba(0, 0, 0, 0.1)'}> 
            {showBox ?
            <Flex flexDir={'column'} alignItems={'center'} justifyContent={'center'} h='150px'> 
                <Flex mb='1vh' gap='10px' alignItems={'end'}> 
                    <Icon fill="url(#gradient2)" as={BsStars} boxSize={'22px'}/>
                    <Text bgGradient={"linear(to-r, rgba(0, 102, 204, 0.8), rgba(102, 51, 255, 0.7))"} bgClip="text"  color={'transparent'} fontWeight={'medium'} fontSize={'1.2em'} >{t('ConversationByMatilda')}</Text>
                </Flex>
                <Button  leftIcon={<FaLockOpen/>} onClick={takeConversationControl} variant={'main'} size='sm'>{t('TakeControl')}</Button>
            </Flex>
            :
            <> 
            {conversationData?.call_status === 'completed'  ? 
                <Flex flexDir={'column'} alignItems={'center'} justifyContent={'center'} h='150px'> 
                <AudioRecord url={conversationData?.call_url} />
                </Flex>
            :
            <Box position={'relative'} transition={'background ease-in-out 0.1s'} bg={isInternalNote?'yellow.100':''} minH={'150px'} maxH={'600px'} height={`${height}px`} > 
                {conversationData?.status === 'closed' && 
                    <Flex alignItems={'center'} justifyContent={'center'} position={'absolute'} zIndex={10000} height={'100%'} w='100%' bg='rgba(200, 200, 200, 0.4)' backdropFilter={'blur(0.8px)'}>
                        <Text fontSize={'1.2em'} fontWeight={'medium'} maxW={'60%'} textAlign={'center'}>{t('ClosedConversation')}</Text>
                    </Flex>}
                <Box height={'10px'}  onMouseDown={handleMouseDown} cursor='ns-resize'/>
                    <Flex pt='5px' gap='10px' pb='15px' px='15px' alignItems={'center'} justifyContent={'space-between'}> 
                        <Flex alignItems={'center'} gap='9px' maxW={'100%'}>
                            <Portal > 
                                {showSelector &&
                                    <MotionBox ref={boxRef} initial={{ opacity: 0, marginBottom: -10}} animate={{ opacity: 1, marginBottom: 0 }}  exit={{ opacity: 0, marginBottom: -10}} transition={{ duration: '0.2',  ease: 'easeOut'}} 
                                    fontSize={'.8em'} overflow={'hidden'} bottom={window.innerHeight -  (noteRef.current?.getBoundingClientRect().top || 0) + 10}  left={noteRef.current?.getBoundingClientRect().left} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.1)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.5rem'} borderWidth={'1px'} borderColor={'gray.200'}>
                                        <Flex p='10px' alignItems={'center'} gap='7px' cursor={'pointer'} _hover={{bg:'brand.hover_gray'}} onClick={() => {setIsInternalNote(true);setShowSelector(false)}}>
                                            <Icon as={MdNoteAlt}/>
                                            <Text whiteSpace={'nowrap'}>{t('InternalNote')}</Text>
                                        </Flex>
                                        <Flex p='10px' alignItems={'center'} gap='7px' cursor={'pointer'} _hover={{bg:'brand.hover_gray'}} onClick={() => {setIsInternalNote(false);setShowSelector(false)}}>
                                            <Icon as={IoArrowUndoSharp}/>
                                            <Text whiteSpace={'nowrap'}>{t('Public')}</Text>
                                        </Flex>
                                    </MotionBox>
                                }
                            </Portal> 
                            <Flex ref={noteRef} cursor={'pointer'} gap='5px' alignItems={'center'} onClick={() => setShowSelector(!showSelector)}> 
                                <Icon as={isInternalNote?MdNoteAlt:IoArrowUndoSharp} color='gray.400' boxSize={'16px'}/>
                                <Text color='gray.600' fontSize={'.8em'} fontWeight={'medium'} whiteSpace={'nowrap'}>{isInternalNote?t('InternalNote'):t('Public')}</Text>
                                <Icon  color='gray.600'className={ showSelector? "rotate-icon-up" : "rotate-icon-down"} as={IoIosArrowDown} boxSize={'14px'}/>
                            </Flex>
                        </Flex>
                    </Flex>
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
                        <Box height={'1px'} bg='gray.300' width={'100%'}/>
                    </>}
                    <ReactQuill modules={modules} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} ref={quillRef} theme="snow" value={htmlValue} onChange={handleChange} className={toolbarVisible ? '' : 'hidden-toolbar'} style={{ height: '100%', display: 'flex', flexDirection: 'column-reverse'}} />
                    </>
                    :
                    <textarea ref={textAreaRef} placeholder={t('PlaceholderShortcuts')} value={textValue} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} onChange={(e) => {setTextValue(e.target.value); handleShortcuts(e.target.value, {index: e.target.selectionStart}) }}  style={{ height: '100%', width: '100%', padding:'20px', background:'transparent', outline: 'none', border:'none', resize:'none', fontSize:'.9em'}} />
                    }

                    <Flex overflowX={'scroll'}  ref={sendPanelRef} maxW={'100%'} justifyContent={'space-between'} position={'absolute'} bottom={0} px='15px' py='10px' gap='15px' alignItems={'center'}  width={'100%'}>
                        <Flex gap='10px'> 
                            {channel?.channel_type === 'email' && <IconButton aria-label='edit-text' bg='transparent' icon={<PiTextTBold/>} size='sm' onClick={() => {setEmojiVisible(false);setToolbarVisible(!toolbarVisible)}} />}
                            <IconButton aria-label='edit-text' icon={<HiOutlinePaperClip/>} size='sm' bg='transparent' variant={'common'} onClick={() => document.getElementById('selectFile')?.click()}/>
                            <IconButton ref={emojiButtonRef} aria-label='edit-text' icon={<HiOutlineEmojiHappy/>} size='sm'  bg='transparent'  variant={'common'} onClick={()=>{setToolbarVisible(false);setEmojiVisible(!emojiVisible)}}  />
                        </Flex>
                        <Flex gap='10px' alignItems={'center'}  > 
                          

                            <Box position={'relative'} >  
                                {showSendLike &&  
                                    <Portal > 
                                        <MotionBox bottom={window.innerHeight - (sendLikeButtonRef.current?.getBoundingClientRect().top || 0) + 10}  right={window.innerWidth - (sendLikeButtonRef.current?.getBoundingClientRect().right || 0)} ref={sendLikeBoxRef} initial={{ opacity: 0, marginBottom: -10}} animate={{ opacity: 1, marginBottom: 0 }}  exit={{ opacity: 0, marginBottom: -10}} transition={{ duration: '0.2',  ease: 'easeOut'}} 
                                            fontSize={'.8em'} overflow={'hidden'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={1000}   position={'absolute'} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.300'}>
                                        {Object.keys(statesMap).filter((state) => {if (channel?.channel_type !== 'voip') return state !== 'completed' && state !== 'ongoing';return true}).map((state, index) => (
                                            (state !== 'closed' && state !== 'new') && 
                                                <Flex alignItems='center' key={`state-${index}`}  onClick={() => handleButtonClick(state as 'new' | 'open' | 'pending' | 'solved' | 'closed')} py='7px' px='20px' gap='10px' cursor={'pointer'} _hover={{bg:'brand.hover_gray'}} >
                                                    <Box height={'10px'} width={'10px'} borderRadius={'.1rem'} bg={statesMap[state as 'new' | 'open' | 'pending' | 'solved' | 'closed'][1]}/>
                                                    <Text fontWeight={'medium'} whiteSpace={'nowrap'}>{t(state)}</Text>
                                                </Flex>
                                            ))}
                                        </MotionBox>
                                    </Portal > }

                                <Flex cursor={'pointer'} gap='1px' >
                                    <Flex  onClick={() => handleButtonClick('pending')} bg={'#222'} px='10px' py='5px' borderRadius={'.5em 0 0 .5em'} color='white' _hover={{bg:'blackAlpha.800'}}>
                                        {waitingSend?<LoadingIconButton/> :
                                        <Flex alignItems={'center'} gap='10px'>
                                            <Text whiteSpace={'nowrap'}  fontWeight={'medium'} fontSize={'.9em'} color='gray.200'>{t('SendLike')} <span style={{fontWeight:'500', color:'white'}}>{t(conversationData.status)}</span></Text>
                                        </Flex>}
                                    </Flex>
                                    <Flex ref={sendLikeButtonRef} onClick={() => {setShowSendLike(!showSendLike)}}bg={'#222'} justifyContent={'center'} px='7px'  borderRadius={'0 .5rem .5rem 0'} alignItems={'center'} color='white' _hover={{bg:'blackAlpha.800'}}>
                                        <Icon className={ showSendLike? "rotate-icon-up" : "rotate-icon-down"} as={IoIosArrowDown} boxSize={'13px'}/>
                                    </Flex>         
                                </Flex>

                            </Box>
                            </Flex>
                    </Flex>
            </Box>}
            </>
            }
        </Box>

        <Portal> 
            <Box position={'fixed'} pointerEvents={emojiVisible?'auto':'none'} transition='opacity 0.2s ease-in-out' opacity={emojiVisible ? 1:0} bottom={`${window.innerHeight - (emojiButtonRef?.current?.getBoundingClientRect().top || 0) + 5}px`} left={`${emojiButtonRef?.current?.getBoundingClientRect().left}px`} zIndex={1000} ref={emojiBoxRef}> 
                <EmojiPicker onEmojiClick={handleEmojiClick} open={emojiVisible} allowExpandReactions={false}/>
            </Box>
        </Portal>
    </Box>
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
        <Box maxW="500px" width={'100%'} p="4" bg="brand.gray_2" borderRadius="md" boxShadow="md" textAlign="center">
            <audio ref={audioRef} src={url} onTimeUpdate={updateProgress} />
            
            <Flex gap='10px' alignItems={'center'}>
                <Text fontWeight={'medium'} fontSize={'.9em'}>{formatTime(currentTime)}</Text>
                <Box cursor='pointer' ref={progressBarRef} id="progress-bar" flex="1" height="8px" borderRadius="md" bg="gray.300" onClick={handleProgressClick} position="relative" onMouseDown={handleMouseDown}>
                    <Box position="absolute" height="8px"borderRadius="md"bg="brand.text_blue"width={`${progress}%`}/>
                </Box>
                <Text fontWeight={'medium'} fontSize={'.9em'}>{formatTime(duration)}</Text>
            </Flex>
            <Flex gap='32px' justifyContent={'center'} mt='1vh' alignItems="center">
                <IconButton icon={<FaDownload />} onClick={() => downloadFile(url)} isRound aria-label="Descargar MP3"  bg="transparent"  variant={'common'}/>
                <IconButton icon={isPlaying ? <FaPause /> : <FaPlay />} onClick={togglePlay} aria-label="Reproducir/Pausar"  color='white' bg={'brand.text_blue'} _hover={{bg:'brand.text_blue'}} isRound size="lg"/>
                <IconButton icon={<FaRedo />} onClick={() => updateAudioProgress(0)} aria-label="Volver a reproducir" isRound bg="transparent"  variant={'common'}/>
            </Flex>
      </Box>
    )
}