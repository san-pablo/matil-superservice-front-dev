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
import { SourceSideBar } from "./Utils"
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
//FUNCTIONS
import parseMessageToBold from "../../Functions/parseToBold"
//ICONS
import { RxCross2, RxCheck } from "react-icons/rx"
import { BiWorld } from "react-icons/bi"
import { BsTrash3Fill } from "react-icons/bs"
import { PiSidebarSimpleBold } from "react-icons/pi"
//TYPING
import { ContentData, languagesFlags } from "../../Constants/typing"

//GET THE CELL STYLES
const CellStyle = ({ column, element }:{column:string, element:any}) => {
     
    //TRANSLATION
    const { t } = useTranslation('knowledge')

    if (column === 'tags' || column === 'public_article_help_center_collections') {
        return(<> 
        <Flex minH={'35px'} alignItems={'center'}> 
        {element ? 
            <Flex gap='5px' flexWrap={'wrap'}>
                {element.map((label:string, index:number) => (
                    <Flex bg='gray.200' borderColor={'gray.300'} borderWidth={'1px'} p='4px' borderRadius={'.5rem'} fontSize={'.8em'} key={`tags-label-${index}`}>
                        <Text>{label}</Text>
                    </Flex>
                ))}
            </Flex>:
            <Text>-</Text>
        }
        </Flex>
    </>)
    }
    else if (column === 'is_available_to_tilda') return <Icon boxSize={'25px'} color={element?'green.600':'red.600'} as={element?RxCheck:RxCross2}/>
    else if (column === 'language') {
        return(
        <Flex gap='5px' alignItems={'center'}>
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][0]:'No detectado'}</Text>
            <Text fontSize={'.8em'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][1]:'🏴󠁥󠁳󠁣󠁴󠁿'}</Text>
        </Flex>)
    }   

    else if (column === 'content') {
        return <Text flex='1' whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={'medium'}  overflow={'hidden'} >{element.url}</Text>
    }
   
    else if (column === 'type') return (
        <Flex   gap='10px' alignItems="center" borderRadius={'1rem'} borderColor={'gray.300'} borderWidth={'1px'} py='2px' px='5px' bg={'brand.gray_1'}>
            <Icon as={BiWorld} />
            <Text >
                {t(element)}
            </Text>
        </Flex>)
    else return ( <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={column === 'title'?'medium':'normal'}  overflow={'hidden'} >{element === ''?'-':element}</Text>)
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)}) 
 

const Website = () => {

     //CONSTANTS
    const { t } = useTranslation('knowledge')
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
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/sources`, params:{page_index:1, website_uuid:webId}, auth, setValue:setWebData})
            if (response?.status === 200) webDataRef.current = response?.data
        }

        fetchInitialData()
    }, [])


    return (<>
        {selectedWebsite ? <SubWebsite selectedWebsite={selectedWebsite}/> :
        <Box> 
            <Flex justifyContent={'space-between'} alignItems={'end'}> 
                <Skeleton isLoaded={webData !== null}> 
                    <Text fontSize={'1.4em'} fontWeight={'medium'}>{(webData && webData.length > 0)? webData[0]?.title :''}</Text>
                </Skeleton>
                 
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


 
const SubWebsite = ({selectedWebsite}:{selectedWebsite:ContentData}) => {
 
     //CONSTANTS
     const { t } = useTranslation('knowledge')
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
                     <Text fontSize={'1.5em'} fontWeight={'medium'}>{t('subwebsite')}</Text>
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