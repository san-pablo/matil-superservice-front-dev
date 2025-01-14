//REACT
import { useEffect, useRef, useState,Dispatch, SetStateAction, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../AuthContext"
import { useLocation, useNavigate } from "react-router-dom"
//FETCG DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Skeleton, Box, Text, chakra, Icon, Button, IconButton, shouldForwardProp } from "@chakra-ui/react"
import { motion, isValidMotionProp } from 'framer-motion'
import "../../Components/styles.css"
//COMPONENTS
import EditText from "../../Components/Reusable/EditText"
import Table from "../../Components/Reusable/Table"
import { SourceSideBar, CellStyle } from "./Utils"
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
//FUNCTIONS
import parseMessageToBold from "../../Functions/parseToBold"
//ICONS
import { RxCross2, RxCheck } from "react-icons/rx"
import { BiWorld } from "react-icons/bi"
import { HiTrash } from "react-icons/hi2"
import { PiSidebarSimpleBold } from "react-icons/pi"
//TYPING
import { ContentData, languagesFlags, Folder } from "../../Constants/typing"
import { useAuth0 } from "@auth0/auth0-react"

 
//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)}) 
 

const Website = ({folders,  setHideFunctions}:{folders:Folder[],setHideFunctions:Dispatch<SetStateAction<boolean>>}) => {

     //CONSTANTS
    const { t } = useTranslation('knowledge')
    const { getAccessTokenSilently } = useAuth0()
    const auth = useAuth()
    const location = useLocation().pathname
    const columnsContentMap:{ [key: string]: [string, number] } = {content:[t('Url'), 300],type: [t('type'), 150], language: [t('language'), 150], is_available_to_tilda:[t('is_available_to_tilda'), 150]}

    const webDataRef = useRef<any>(null)
    const [webData, setWebData] = useState<ContentData[] | null>(null)
    const [text, setText] = useState<string>('')
    
    const [selectedWebsite, setSelectedWebsite] = useState<ContentData | null>(null)
    useEffect(() => {        
        const webId = location.split('/')[3]
        
        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/sources`,getAccessTokenSilently, params:{page_index:1, website_uuid:webId}, auth})
            if (response?.status === 200) {
                setWebData(response?.data.page_data)
                webDataRef.current = response?.data.page_data
            }
        }

        fetchInitialData()
    }, [])


    return (<>
        {selectedWebsite ? <SubWebsite folders={folders} selectedWebsite={selectedWebsite}/> :
        <Box> 
            <Flex justifyContent={'space-between'} alignItems={'end'}> 
               
                <Flex  alignItems={'center'} gap='10px' >
                    <IconButton  aria-label="open-tab" variant={'common'} bg='transparent' size='sm' icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'18px'}/>}  h='28px' w='28px'  onClick={() =>setHideFunctions(prev => (!prev))}/>
                    <Text fontSize={'1.2em'} fontWeight={'medium'}>{(webData && webData.length > 0)? webData[0]?.title :''}</Text>
                </Flex>   

                 
            </Flex>
            <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='3vh'/>
            
            <Box width={'350px'}> 
                <EditText value={text} setValue={setText} searchInput={true}/>
            </Box>

            <Flex  mt='2vh' justifyContent={'space-between'} alignItems={'end'}>
                <Skeleton isLoaded={webData !== null}> 
                    <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ContentCount', {count:webData?.length})}</Text>
                </Skeleton>
                
            </Flex>
            <Skeleton isLoaded={webData !== null}> 
                <Table data={webData as ContentData[]} CellStyle={CellStyle} columnsMap={columnsContentMap}  excludedKeys={['uuid', 'created_at', 'created_by','description', 'folder_uuid', 'is_ingested', 'public_article_common_uuid','public_article_help_center_collections','public_article_status', 'title', 'updated_at', 'updated_by', 'public_article_uuid']} noDataMessage={t('NoContent')} onClickRow={(row, index) => setSelectedWebsite(row)} />  
            </Skeleton>
        </Box>
    }
    </>)
}

export default Website

const SubWebsite = ({folders, selectedWebsite}:{folders:Folder[], selectedWebsite:ContentData}) => {
 
     //CONSTANTS
     const { t } = useTranslation('knowledge')
     const { getAccessTokenSilently } = useAuth0()
     const auth = useAuth()
     const location = useLocation().pathname
     const navigate = useNavigate()
 
     //SECTIONS EXPANDED
     const firstSendedRef = useRef<boolean>(true)
     //ARTICLE DATA 
     const articleDataRef = useRef<ContentData | null>(null)
     const [articleData, setArticleData] = useState<ContentData | null>(selectedWebsite)
  
 
     const [waitingSave, setWaitingSave] = useState<boolean>(false)
     const saveChanges = async () => {
         const articleId = location.split('/')[3]
         let response
         if (articleId.startsWith('create') && firstSendedRef.current) response =  await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/sources`, method:'post',getAccessTokenSilently, setWaiting:setWaitingSave, requestForm:articleData  as ContentData, auth, toastMessages:{works:t('CorrectSavedInfo'), failed:t('FailedSavedInfo')} }) 
         else response = response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/sources/${articleData?.uuid}`, method:'put', setWaiting:setWaitingSave,getAccessTokenSilently, requestForm:articleData as ContentData, auth, toastMessages:{works:t('CorrectSavedInfo'), failed:t('FailedSavedInfo')} })
 
         if (response?.status === 200) articleDataRef.current = articleData
         firstSendedRef.current = false
 
     }
 
     //SHOW DELETE BOX
     const [showDeleteBox, setShowDeleteBox] = useState<boolean>(false)
 
     const [clientBoxWidth, setClientBoxWidth] = useState(400)
     const sendBoxWidth = `calc(100vw - 45px - ${clientBoxWidth}px)`
     
      //DELETE A FOLDER
      const DeleteArticle = () => {
         const [waitingDelete, setWaitingDelete] = useState<boolean>(false)
 
         //FUNCTION FOR CREATE A NEW BUSINESS
         const deleteArticle= async () => {
             const articleId = location.split('/')[3]
             const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/sources/${articleId}`, getAccessTokenSilently, method:'delete',  auth, toastMessages:{works:t('CorrectSavedInfo'), failed:t('FailedSavedInfo')} })
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
    
     <Flex flex='1'  width={'100%'} height={'100vh'} top={0} left={0} bg='white'>
         <MotionBox   initial={{ width: sendBoxWidth  }} animate={{ width: sendBoxWidth}} exit={{ width: sendBoxWidth }} transition={{ duration: '.2' }}  
         width={sendBoxWidth} overflowY={'hidden'}  borderRightWidth={'1px'} borderRightColor='gray.200' >
             <Flex px='1vw' height={'70px'} alignItems={'center'} justifyContent={'space-between'}  borderBottomWidth={'1px'} borderBottomColor={'gray.200'}>
                 <Skeleton isLoaded={articleData !== null}> 
                     <Text fontSize={'1.5em'} fontWeight={'medium'}>{t('subwebsite')}</Text>
                 </Skeleton>
                 <Flex gap='15px'>
                     <Button leftIcon={<HiTrash/>} variant={'delete'} isDisabled={location.split('/')[3].startsWith('create')} size='sm' onClick={() => setShowDeleteBox(true)}>{t('Delete')}</Button>
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
         <MotionBox display={'flex'} flexDir={'column'} h='100vh' width={clientBoxWidth + 'px'}  whiteSpace={'nowrap'} initial={{ width: clientBoxWidth + 'px' }} animate={{ width: clientBoxWidth + 'px' }} exit={{ width: clientBoxWidth + 'px' }} transition={{ duration: '.2'}}> 
             <SourceSideBar clientBoxWidth={clientBoxWidth} setClientBoxWidth={setClientBoxWidth} sourceData={articleData} setSourceData={setArticleData} folders={folders}/>
         </MotionBox>

     </Flex>
     </>)
 }
 
 
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
    <Flex flex='1' mt='30px' px='20px' overflow={'scroll'}  flexDir={'column'} position='relative' alignItems={'center'}> 
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