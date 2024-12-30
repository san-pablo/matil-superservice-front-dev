//REACT
import { useState, useEffect, useRef, Dispatch, SetStateAction, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../AuthContext"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"

//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Skeleton, Box, Text, chakra, shouldForwardProp, Button, IconButton } from "@chakra-ui/react"
import { motion, isValidMotionProp } from 'framer-motion'
import "../../Components/styles.css"
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
//COMPONENTS
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import { SourceSideBar } from "./Utils"
//FUNCTIONS
import parseMessageToBold from "../../Functions/parseToBold"
import generateUUID from "../../Functions/generateUuid"
//ICONS
import { PiSidebarSimpleBold } from "react-icons/pi"
import { HiTrash } from "react-icons/hi2"
//TYPING
import { ContentData, Folder } from "../../Constants/typing" 
    
 //MOTION BOX
 const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)}) 
 
 const Pdf = ({folders}:{folders:Folder[]}) => {
 
     //CONSTANTS
     const { t } = useTranslation('knowledge')
     const { getAccessTokenSilently } = useAuth0()
     const auth = useAuth()
     const location = useLocation().pathname
     const navigate = useNavigate()
 
     const newArticle:ContentData = {
         uuid: '',
         type: 'pdf',
         title: '',
         description: '',
         language: auth.authData.userData?.language || 'ES',
         is_available_to_tilda: false,
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString(),
         created_by: auth.authData.userId || '',
         updated_by: auth.authData.userId || '',
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
             const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/sources/${articleId}`, auth,getAccessTokenSilently, setValue:setArticleData})
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
         if (articleId.startsWith('create') && firstSendedRef.current) response =  await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/sources`, getAccessTokenSilently,method:'post', setWaiting:setWaitingSave, requestForm:articleData  as ContentData, auth, toastMessages:{works:t('CorrectSavedInfo'), failed:t('FailedSavedInfo')} }) 
         else response = response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/sources/${articleData?.uuid}`, method:'put', setWaiting:setWaitingSave, getAccessTokenSilently,requestForm:articleData as ContentData, auth, toastMessages:{works:t('CorrectSavedInfo'), failed:t('FailedSavedInfo')} })
 
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
             const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/sources/${articleId}`, method:'delete',  auth,getAccessTokenSilently, toastMessages:{works:t('CorrectSavedInfo'), failed:t('FailedSavedInfo')} })
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
    
     <Flex flex='1' position='absolute' width={'calc(100vw - 335px)'} height={'100vh'} top={0} left={0}>
         <MotionBox   initial={{ width: sendBoxWidth  }} animate={{ width: sendBoxWidth}} exit={{ width: sendBoxWidth }} transition={{ duration: '.2' }}  
         width={sendBoxWidth} overflowY={'hidden'} flex={'1'}  borderRightWidth={'1px'} borderRightColor='gray.200' >
             <Flex px='2vw' height={'70px'} alignItems={'center'} justifyContent={'space-between'}  borderBottomWidth={'1px'} borderBottomColor={'gray.200'}>
                 <Skeleton isLoaded={articleData !== null}> 
                     <Text fontSize={'1.5em'} fontWeight={'medium'}>{t('PDF')}</Text>
                 </Skeleton>
                 <Flex gap='15px'>
                     <Button leftIcon={<HiTrash/>} variant={'delete'} isDisabled={location.split('/')[3].startsWith('create')} size='sm' onClick={() => setShowDeleteBox(true)}>{t('Delete')}</Button>
                     <Button variant={'main'} size='sm' isDisabled={JSON.stringify(articleData) === JSON.stringify(articleDataRef.current)} onClick={saveChanges}>{waitingSave?<LoadingIconButton/>:t('SaveChanges')}</Button>
                     {clientBoxWidth === 0 && <IconButton aria-label="open-tab" variant={'common'} bg='transparent' size='sm' icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'20px'}/>} onClick={() =>setClientBoxWidth(400)}/>}
                 </Flex>
             </Flex>
             <Flex overflow={'scroll'} justifyContent={'center'}  >
                 <Box  maxW={'750px'} width={'100%'} height={'100%'} overflow={'hidden'}  flex='1' py='2vw'>
                     <Skeleton isLoaded={articleData !== null}> 
                         {articleData !== null && <EditorComponent  articleData={articleData as ContentData}  setArticleData={setArticleData}/>}
                     </Skeleton>
                  </Box>
             </Flex>
         </MotionBox>
         <SourceSideBar clientBoxWidth={clientBoxWidth} setClientBoxWidth={setClientBoxWidth} sourceData={articleData} setSourceData={setArticleData} folders={folders}/>
     </Flex>
     </>)
 }
 
 export default Pdf
 
 const EditorComponent = ({articleData, setArticleData}:{articleData:ContentData | null, setArticleData:Dispatch<SetStateAction<ContentData | null>>}) => {
 
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
            <textarea ref={textAreaTitleRef} value={articleData?.title} className="title-textarea"  onChange={(e) => {setArticleData(prev => ({...prev as ContentData, title:e.target.value}))}}  placeholder={t('NoTitleText')} rows={1}  />
        </Box>
        <Flex flex='1' mt='30px' px='20px' overflow={'scroll'}   flexDir={'column'} position='relative' alignItems={'center'}> 
            <Text>
                {(articleData?.content.text || '').split('\n').map((line:string, index:number) => (
                    <Text key={index}>
                    {line}
                    {'\n'}
                    </Text>
                ))}
                </Text>
          </Flex>
     </Flex>)
 }