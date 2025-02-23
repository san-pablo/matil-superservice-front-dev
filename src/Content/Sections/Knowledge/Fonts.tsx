//REACT
import { useState, useEffect, Dispatch, SetStateAction, ReactElement, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../AuthContext"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Text, Box, Icon, Flex, Button, Tooltip, Skeleton, IconButton, Spinner} from "@chakra-ui/react"
//COMPONENTS
import SectionSelector from "../../Components/Reusable/SectionSelector"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import EditText from "../../Components/Reusable/EditText"
//FUNCTIONS
import timeStampToDate from "../../Functions/timeStampToString"
import timeAgo from "../../Functions/timeAgo"
//ICONS
import { RxCross2 } from "react-icons/rx"
import { IoBook, IoHelpCircle } from "react-icons/io5"
import { FaPlus, FaLock, FaCloudArrowUp, FaFilePdf, FaFileLines } from "react-icons/fa6"
import { AiFillAppstore } from "react-icons/ai"
import { BiWorld } from "react-icons/bi"
import { FiEdit } from "react-icons/fi"
import { FaCloudUploadAlt } from "react-icons/fa"
import { PiSidebarSimpleBold } from "react-icons/pi"
//TYPING
import { ContentData, languagesFlags } from "../../Constants/typing"
import { useNavigate } from "react-router-dom"
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import { useAuth0 } from "@auth0/auth0-react"

//MAIN FUNCTION
function Fonts ({setHideFunctions}:{setHideFunctions:Dispatch<SetStateAction<boolean>>}) {

    //AUTH CONSTANT
    const  { t } = useTranslation('knowledge')
    const { getAccessTokenSilently } = useAuth0()
    const navigate = useNavigate()
    const t_formats = useTranslation('formats').t
    const auth = useAuth()
        const sectionsList = ['all', 'help-center']
    const sectionsMap:{[key in 'all' | 'help-center']:[string, ReactElement]} = {'all':[t('All'), <AiFillAppstore size={'20px'}/>], 'help-center':[t('HelpCenter'), <IoHelpCircle size={'20px'}/>]}

    //SELECTED SECTIONS
    const [selectedSection, setSelectedSection] = useState<'all' | 'help-center'>('all')
        
    //CREATE NEW CONTENT
    const [showCreate, setShowCreate] = useState<boolean>(false)

    //SYNCRONIZE A WEB
    const [showSyncronize, setShowSyncronize] = useState<boolean>(false)
    const [showAddPdf, setShowAddPdf] = useState<boolean>(false)

    //ALL DATA
    const [publicArticles, setPublicArticles] = useState<ContentData[] | null>(null)
    const [internalArticles, setInternalArticles] = useState<ContentData[] | null>(null)
    const [pdfsArticles, setPdfArticles] = useState<ContentData[] | null>(null)
    const [webArticles, setWebArticles] = useState<ContentData[] | null>(null)
    const [textArticles, setTextArticles] = useState<ContentData[] | null>(null)


    //FETCH INITIAL DATA
    useEffect(() => {
        
        const fetchTriggerData = async () => {
            const responseInternal  = await fetchData({endpoint:`${auth.authData.organizationId}/knowledge/sources`, getAccessTokenSilently, params:{page_index:1,filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'type', op:'eq', val:'internal_article'}]}]} }, auth})
            if (responseInternal?.status === 200) setInternalArticles(responseInternal.data.page_data)
            const responsePublic  = await fetchData({endpoint:`${auth.authData.organizationId}/knowledge/sources`, getAccessTokenSilently, params:{page_index:1, filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'type', op:'eq', val:'public_article'}]}]}  }, auth})
            if (responsePublic?.status === 200) setPublicArticles(responsePublic.data.page_data)
            const responsePdf  = await fetchData({endpoint:`${auth.authData.organizationId}/knowledge/sources`, getAccessTokenSilently, params:{page_index:1, filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'type', op:'eq', val:'pdf'}]}]} }, auth})
            if (responsePdf?.status === 200) setPdfArticles(responsePdf.data.page_data)
            const responseWeb = await fetchData({endpoint:`${auth.authData.organizationId}/knowledge/sources`, getAccessTokenSilently, params:{page_index:1, filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'type', op:'eq', val:'website'}]}]} }, auth})
            if (responseWeb?.status === 200) setWebArticles(responseWeb.data.page_data)
            const responseText  = await fetchData({endpoint:`${auth.authData.organizationId}/knowledge/sources`,getAccessTokenSilently, params:{page_index:1, filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'type', op:'eq', val:'snippet'}]}]}}, auth})
            if (responseText?.status === 200) setTextArticles(responseText.data.page_data)
        }
        localStorage.setItem('currentSectionContent', 'fonts')
        document.title = `${t('Fonts')} - ${auth.authData.organizationName} - Matil`
        fetchTriggerData()
    }, [])

 

      
    const memoizedSyncronizeBox = useMemo(() => (
        <ConfirmBox maxW={'800px'} setShowBox={setShowSyncronize}> 
            <SyncronizeWeb setShowSyncronize={setShowSyncronize} setContentData={setWebArticles}/>
        </ConfirmBox>
    ), [showSyncronize])

    const memoizedAddPdfBox = useMemo(() => (
        <ConfirmBox maxW={'800px'} setShowBox={setShowAddPdf}> 
            <CreatePdf setShowAddPdf={setShowAddPdf} setContentData={setTextArticles}/>
        </ConfirmBox>
    ), [showAddPdf])


    const isDataLoaded = (publicArticles !== null && internalArticles !== null &&  pdfsArticles !== null && webArticles !== null && textArticles !== null)
    return(
    <>
        {showSyncronize && memoizedSyncronizeBox}
        {showAddPdf && memoizedAddPdfBox}

        <Box px='2vw' pt='2vh'> 
            <Flex justifyContent={'space-between'} >   
                <Flex mb='2vh' alignItems={'center'} gap='10px' >
                    <IconButton  aria-label="open-tab" variant={'common'} bg='transparent' size='sm' icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'18px'}/>}  h='28px' w='28px'  onClick={() =>setHideFunctions(prev => (!prev))}/>
                    <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('Fonts')}</Text>
                </Flex>
                <Button size='sm' variant={'main'} leftIcon={<FaPlus/>} onClick={() => setShowCreate(true)}>{t('CreateContent')}</Button>
            </Flex>    

            <Flex justifyContent={'space-between'} >   
                <SectionSelector selectedSection={selectedSection} sections={sectionsList} sectionsMap={sectionsMap}  onChange={(section) => {setSelectedSection(section  as 'all' | 'help-center')}} /> 
             </Flex>    
            <Box height={'1px'} width={'100%'} bg='border_color' mt='2vh' />

        </Box>
        
        <Box px='2vw' py='5vh' flex='1' overflow={'scroll'}>
            <Skeleton isLoaded={isDataLoaded}> 
                <Box p='20px' borderRadius={'.7em'} borderColor={'border_color'} borderWidth={'1px'}>
                    <Flex justifyContent={'space-between'} > 
                        <Flex mb='2vh' alignItems={'center'} gap='10px'>
                            <Flex bg='black_button' p='10px' borderRadius={'full'} >
                                <Icon boxSize={'17px'} color='white' as={IoBook}/>
                            </Flex>
                            <Box>
                                <Text fontSize={'1.3em'} fontWeight={'medium'}>{t('PublicArticles')}</Text>
                                <Text color='text_gray'>{t('PublicArticlesDes')}</Text>
                            </Box>
                        </Flex>
                        <Button size='sm' variant={'common'} leftIcon={<FaPlus/>} onClick={() => navigate(`/knowledge/article/create-public`)} >{t('AddArticle')}</Button>
                    </Flex>

                     {publicArticles && <> 
                        {(publicArticles?.length === 0) &&  <Text>{t('NoPublicArticles')}</Text> }
                        <Box mt='2vh' borderColor={publicArticles.length >0 ?'border_color':'transparent'}  borderTopWidth={'1px'}> 
                            {publicArticles?.map((art, index) => (
                                    <Flex fontSize={'0.9em'} py='10px' alignItems={'center'} borderBottomWidth={'1px'} key={`public-article-${index}`} borderBottomColor={'border_color'}>
                                        <Text flex={2} whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={'medium'}  overflow={'hidden'} >{art.title}</Text>
                                        <Flex flex={1} gap='5px' alignItems={'center'}>
                                            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{typeof art.language === 'string' && art.language in languagesFlags ?languagesFlags[art.language][0]:t('NotDetected')}</Text>
                                            <Text fontSize={'.8em'}>{typeof art.language === 'string' && art.language in languagesFlags ?languagesFlags[art.language][1]:'🏴󠁥󠁳󠁣󠁴󠁿'}</Text>
                                        </Flex>
                                        <Box flex={1}> 
                                            <Box boxShadow={`1px 1px 1px rgba(0, 0, 0, 0.15)`} display="inline-flex" fontSize='.9em' py='2px' px='8px' fontWeight={'medium'} color='white'  bg={(art.data as any)?.status === 'draft'?'red.100':'green.100'} borderRadius={'.7rem'}> 
                                                <Text color={(art.data as any)?.status === 'draft'?'red.600':'green.600'}>{t((art.data as any)?.status)}</Text>
                                            </Box>
                                        </Box>
                                        <Flex justifyContent={'center'} flex={1}> 
                                            <Tooltip label={timeStampToDate(art.created_at as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                                                <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(art.created_at as string, t_formats)}</Text>
                                            </Tooltip>
                                        </Flex>
                                        <Button size='sm' variant={'common'} leftIcon={<FiEdit/>}  onClick={() => navigate(`/knowledge/article/${art.id}`)}>{t('Edit')}</Button>

                                    </Flex>
                                ))}
                        </Box>
                        </>}
       
                </Box>
            </Skeleton>

                {selectedSection === 'all' && <> 
                <Skeleton isLoaded={isDataLoaded}> 

                    <Box p='20px' mt='3vh' borderRadius={'.7em'} borderColor={'border_color'} borderWidth={'1px'}>
                        <Flex justifyContent={'space-between'} > 
                            <Flex mb='2vh' alignItems={'center'} gap='10px'>
                                <Flex bg='black_button' p='10px' borderRadius={'full'} >
                                    <Icon boxSize={'17px'} color='white' as={FaLock}/>
                                </Flex>
                                <Box>
                                    <Text fontSize={'1.3em'} fontWeight={'medium'}>{t('PrivateArticles')}</Text>
                                    <Text color='text_gray'>{t('PrivateArticlesDes')}</Text>
                                </Box>
                            </Flex>
                            <Button size='sm' variant={'common'} leftIcon={<FaPlus/>} onClick={() => navigate(`/knowledge/article/create-internal`)} >{t('AddArticle')}</Button>
                        </Flex>

                             {internalArticles && <> 
                                {internalArticles.length === 0 &&  <Text color='text_gray' fontSize={'1.1em'}>{t('NoInternalArticles')}</Text> }
                                <Box mt='2vh' borderColor={internalArticles.length >0 ?'border_color':'transparent'} borderTopWidth={'1px'}> 
                                    {internalArticles.map((art, index) => (
                                            <Flex fontSize={'0.9em'} py='10px' alignItems={'center'} borderBottomWidth={'1px'} key={`private-article-${index}`} borderBottomColor={'border_color'}>
                                                <Text flex={2} whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={'medium'}  overflow={'hidden'} >{art.title}</Text>
                                                <Flex flex={1} gap='5px' alignItems={'center'}>
                                                    <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{typeof art.language === 'string' && art.language in languagesFlags ?languagesFlags[art.language][0]:t('NotDetected')}</Text>
                                                    <Text fontSize={'.8em'}>{typeof art.language === 'string' && art.language in languagesFlags ?languagesFlags[art.language][1]:'🏴󠁥󠁳󠁣󠁴󠁿'}</Text>
                                                </Flex>
                                              

                                                <Flex justifyContent={'center'} flex={1}> 
                                                    <Tooltip label={timeStampToDate(art.created_at as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                                                        <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(art.created_at as string, t_formats)}</Text>
                                                    </Tooltip>
                                                </Flex>
                                               
                                                <Button size='sm' variant={'common'} leftIcon={<FiEdit/>} onClick={() => navigate(`/knowledge/article/${art.id}`)} >{t('Edit')}</Button>

                                            </Flex>
                                        ))}
                                </Box>
                                </>}
                   
                        </Box>
                </Skeleton>

                    <Skeleton isLoaded={isDataLoaded}> 
                    <Box p='20px' mt='3vh' borderRadius={'.7em'} borderColor={'border_color'} borderWidth={'1px'}>
                        <Flex justifyContent={'space-between'} > 
                            <Flex mb='2vh' alignItems={'center'} gap='10px'>
                                <Flex bg='black_button' p='10px' borderRadius={'full'} >
                                    <Icon boxSize={'17px'} color='white' as={BiWorld}/>
                                </Flex>
                                <Box>
                                    <Text fontSize={'1.3em'} fontWeight={'medium'}>{t('WebSites')}</Text>
                                    <Text color='text_gray'>{t('WebSitesDes')}</Text>
                                </Box>
                            </Flex>
                            <Button size='sm' variant={'common'} leftIcon={<FaCloudArrowUp/>} onClick={() => setShowSyncronize(true)} >{t('Sincronize')}</Button>
                        </Flex>

                             {webArticles && <> 
                                {webArticles.length === 0 &&  <Text color='text_gray' fontSize={'1.1em'}>{t('NoWebs')}</Text> }
                                <Box mt='2vh'  borderColor={webArticles.length >0 ?'border_color':'transparent'}borderTopWidth={'1px'}> 
                                    {webArticles.map((art, index) => (
                                            <Flex  fontSize={'0.9em'} py='10px' alignItems={'center'} borderBottomWidth={'1px'} key={`web-article-${index}`} borderBottomColor={'border_color'}>
                                                <Box flex={1}> 
                                                    {art.is_ingested ? <Box boxShadow={`1px 1px 1px rgba(0, 0, 0, 0.15)`} display="inline-flex" fontSize='.9em' py='2px' px='8px' fontWeight={'medium'} color='white'  bg={'green.100'} borderRadius={'.7rem'}> 
                                                        <Text color={'green.600'}>{t('Sync')}</Text>
                                                    </Box>:<Spinner speed="2s" color={'text_blue'}/>}
                                                </Box>
                                                <Text flex={4} whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={'medium'}  overflow={'hidden'} >{art.title}</Text>
                                                <Flex flex={2} gap='5px' alignItems={'center'}>
                                                    <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{typeof art.language === 'string' && art.language in languagesFlags ?languagesFlags[art.language][0]:t('NotDetected')}</Text>
                                                    <Text fontSize={'.8em'}>{typeof art.language === 'string' && art.language in languagesFlags ?languagesFlags[art.language][1]:'🏴󠁥󠁳󠁣󠁴󠁿'}</Text>
                                                </Flex>
                                            
                                                <Flex justifyContent={'center'} flex={2}> 
                                                    <Tooltip label={timeStampToDate(art.created_at as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                                                        <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(art.created_at as string, t_formats)}</Text>
                                                    </Tooltip>
                                                </Flex>

                                                <Button size='sm' variant={'common'} leftIcon={<FiEdit/>} onClick={() => navigate(`/knowledge/website/${art.id}`)} >{t('Edit')}</Button>
                                            </Flex>
                                        ))}
                                </Box>
                                </>}
                    
                    </Box>
                    </Skeleton>

                    <Skeleton isLoaded={isDataLoaded}> 
                    <Box p='20px' mt='3vh' borderRadius={'.7em'} borderColor={'border_color'} borderWidth={'1px'}>
                        <Flex justifyContent={'space-between'} > 
                            <Flex mb='2vh' alignItems={'center'} gap='10px'>
                                <Flex bg='black_button' p='10px' borderRadius={'full'} >
                                    <Icon boxSize={'17px'} color='white' as={FaFileLines}/>
                                </Flex>
                                <Box>
                                    <Text fontSize={'1.3em'} fontWeight={'medium'}>{t('TextFragments')}</Text>
                                    <Text color='text_gray'>{t('TextFragmentsDes')}</Text>
                                </Box>
                            </Flex>
                            <Button size='sm' variant={'common'} leftIcon={<FaPlus/>} onClick={() => navigate(`/knowledge/snippet/create`)} >{t('AddTextFragment')}</Button>
                        </Flex>

                             {textArticles && <> 
                            {textArticles.length === 0 &&  <Text color='text_gray' fontSize={'1.1em'}>{t('NoText')}</Text> }
                            <Box mt='2vh' borderColor={textArticles.length >0 ?'border_color':'transparent'} borderTopWidth={'1px'}> 
                                    {textArticles.map((art, index) => (
                                    <Flex   fontSize={'0.9em'}py='10px' alignItems={'center'} borderBottomWidth={'1px'} key={`text-article-${index}`} borderBottomColor={'border_color'}>
                                        <Text flex={2} whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={'medium'}  overflow={'hidden'} >{art.title}</Text>
                                        <Flex flex={1} gap='5px' alignItems={'center'}>
                                            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{typeof art.language === 'string' && art.language in languagesFlags ?languagesFlags[art.language][0]:t('NotDetected')}</Text>
                                            <Text fontSize={'.8em'}>{typeof art.language === 'string' && art.language in languagesFlags ?languagesFlags[art.language][1]:'🏴󠁥󠁳󠁣󠁴󠁿'}</Text>
                                        </Flex>
                                     

                                        <Flex justifyContent={'center'} flex={1}> 
                                                    <Tooltip label={timeStampToDate(art.created_at as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                                                        <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(art.created_at as string, t_formats)}</Text>
                                                    </Tooltip>
                                                </Flex>
                                    
                                        <Button size='sm' variant={'common'} leftIcon={<FiEdit/>} onClick={() => navigate(`/knowledge/snippet/${art.id}`)} >{t('Edit')}</Button>

                                    </Flex>
                                ))}
                            </Box>
                            </>}
                   
                    </Box>
                    </Skeleton>

                    <Skeleton isLoaded={isDataLoaded}> 
                    <Box p='20px' mt='3vh' borderRadius={'.7em'} borderColor={'border_color'} borderWidth={'1px'}>
                        <Flex justifyContent={'space-between'} > 
                            <Flex mb='2vh' alignItems={'center'} gap='10px'>
                                <Flex bg='black_button' p='10px' borderRadius={'full'} >
                                    <Icon boxSize={'17px'} color='white' as={FaFilePdf}/>
                                </Flex>
                                <Box>
                                    <Text fontSize={'1.3em'} fontWeight={'medium'}>{t('PdfDocs')}</Text>
                                    <Text color='text_gray'>{t('PdfDocsDes')}</Text>
                                </Box>
                            </Flex>
                            <Button size='sm' variant={'common'} leftIcon={<FaPlus/>} onClick={() => setShowAddPdf(true)} >{t('AddPdf')}</Button>
                        </Flex>

                             {pdfsArticles && <> 
                            {pdfsArticles.length === 0 &&  <Text color='text_gray' fontSize={'1.1em'}>{t('NoPdfs')}</Text> }
                            <Box mt='2vh'  borderColor={pdfsArticles.length >0 ?'border_color':'transparent'}  borderTopWidth={'1px'}> 
                                {pdfsArticles.map((art, index) => (
                                    <Flex  fontSize={'0.9em'} py='10px' alignItems={'center'} borderBottomWidth={'1px'} key={`pdf-article-${index}`} borderBottomColor={'border_color'}>
                                        <Box flex={1}> 
                                            {art.is_ingested ? <Box boxShadow={`1px 1px 1px rgba(0, 0, 0, 0.15)`} display="inline-flex" fontSize='.9em' py='2px' px='8px' fontWeight={'medium'} color='white'  bg={'green.100'} borderRadius={'.7rem'}> 
                                                <Text color={'green.600'}>{t('Processed')}</Text>
                                            </Box>:<Spinner speed="2s" color={'text_blue'}/>}
                                        </Box>
                                        <Text flex={4} whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={'medium'}  overflow={'hidden'} >{art.title}</Text>
                                        <Flex flex={2} gap='5px' alignItems={'center'}>
                                            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{typeof art.language === 'string' && art.language in languagesFlags ?languagesFlags[art.language][0]:t('NotDetected')}</Text>
                                            <Text fontSize={'.8em'}>{typeof art.language === 'string' && art.language in languagesFlags ?languagesFlags[art.language][1]:'🏴󠁥󠁳󠁣󠁴󠁿'}</Text>
                                        </Flex>
                                        
                                        <Flex justifyContent={'center'} flex={2}> 
                                            <Tooltip label={timeStampToDate(art.created_at as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                                                <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(art.created_at as string, t_formats)}</Text>
                                            </Tooltip>
                                        </Flex>
                                        <Button size='sm' variant={'common'} leftIcon={<FiEdit/>} onClick={() => navigate(`/knowledge/pdf/${art.id}`)} >{t('Edit')}</Button>

                                    </Flex>
                                ))}
                            </Box>
                            </>}
                    </Box>
                    </Skeleton>
                </>}
  
        </Box>
    </>)
    }
 
export default Fonts



const SyncronizeWeb = ({setShowSyncronize, setContentData}:{setShowSyncronize:Dispatch<SetStateAction<boolean>>,  setContentData:Dispatch<SetStateAction<ContentData[] | null>>}) => {

    const { t } = useTranslation('knowledge')
    const { getAccessTokenSilently }= useAuth0()
    const auth = useAuth()
    const [webUrl, setWebUrl] = useState<string>('')

    //FUNCTION FOR CREATE A NEW BUSINESS
    const createFolder= async () => {
        const newWeb:ContentData = {
            id: '',
            common_id: '',
            type: 'website',
            title: webUrl,
            description: '',
            language: 'ES',
            is_available_to_tilda: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: auth.authData.userId || '',
            updated_by: auth.authData.userId || '',
            tags: [],
            data:{url:webUrl, webpage_count:0},
            is_ingested:false,
         }
        console.log(newWeb)
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/knowledge/sources`,getAccessTokenSilently, method:'post', requestForm:newWeb, auth})
        if (response?.status === 200) setContentData(prev => ([...prev as ContentData[], newWeb]))
        setShowSyncronize(false)
     }
    return(<> 
        <Box p='20px' maxW='450px'> 
            <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('AddWeb')}</Text>
            <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='border_color'/>
            <Text fontWeight={'medium'}>{t('AddUrl')}</Text>
            <Text mt='1vh' mb='2vh'color='text_gray' fontSize={'.9em'}>{t('AddUrlDes')}</Text>
            <EditText placeholder={'https://matil.ai'} hideInput={false} value={webUrl} setValue={setWebUrl}/>
        </Box>
        <Flex  maxW='450px' p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'border_color'}>
            <Button  size='sm' variant={'main'} isDisabled={webUrl === ''} onClick={createFolder}>{t('Syncronize')}</Button>
            <Button  size='sm' variant={'common'} onClick={() => {setShowSyncronize(false)}}>{t('Cancel')}</Button>
        </Flex>
    </>)
}



const CreatePdf = ({setShowAddPdf, setContentData}:{setShowAddPdf:Dispatch<SetStateAction<boolean>>,  setContentData:Dispatch<SetStateAction<ContentData[] | null>>}) => {

    const { t } = useTranslation('knowledge')
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()

    const [waitingCreate, setWaitingCreate] = useState<boolean>(false)
    const [selectedDocument, setSelectedDocument] = useState<File | null>(null)

    const getPreSignedUrl = async (file:File) => {
        const response = await fetchData({endpoint: `${auth.authData.organizationId}/chatbot/s3_pre_signed_url`,getAccessTokenSilently, method:'post', auth:auth, requestForm: { file_name: file.name}})   
        if (response?.status === 200) {
            const responseUpload = await fetch(response.data.upload_url, {method: "PUT", headers: {}, body: file})
            if (responseUpload.ok) {
                console.log(response.data.access_url)
                return response.data.access_url as string
            }
            else return ''
        }
        else return ''
    }


    //FUNCTION FOR CREATE A NEW BUSINESS
    const createPdf= async () => {
        const newPdf:ContentData = {
            id: '',
            common_id: '',
            type: 'document',
            title: selectedDocument?.name || '',
            description: '',
            language: 'ES',
            is_available_to_tilda: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: auth.authData.userId || '',
            updated_by: auth.authData.userId || '',
            tags: [],
            data:{url:await getPreSignedUrl(selectedDocument as File), file_name:'', file_size:0, text:''},
            is_ingested:false,
         }
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/knowledge/sources`, getAccessTokenSilently,setWaiting:setWaitingCreate, method:'post', requestForm:newPdf, auth})
        if (response?.status === 200) setContentData(prev => ([...prev as ContentData[], newPdf]))
        setShowAddPdf(false)
     }

     const handleAddPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) setSelectedDocument(file)
    }

    return(<> 
        <input type="file" accept=".pdf" id={'uploadPdf'} style={{ display: 'none' }} onChange={handleAddPdf}/>
        <Box p='20px' maxW='450px'> 
            <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('AddPdf')}</Text>
            <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='border_color'/>
            <Text mt='1vh' mb='2vh'color='text_gray' fontSize={'.9em'}>{t('AddPdfDes')}</Text>
 
            <Button leftIcon={<FaCloudUploadAlt/>} onClick={() => document.getElementById('uploadPdf')?.click()} variant={'main'} size='sm'>{t('UploadPdf')}</Button>
            {selectedDocument && 
                <Flex mt='2vh' alignItems={'center'} gap='15px'>
                    <Text fontSize={'.9em'}>{selectedDocument.name}</Text>
                    <IconButton variant='delete' aria-label="Remove image" icon={<RxCross2  size='20px'/>} size="sm" border='none' bg='transparent' onClick={() => setSelectedDocument(null)} />
                </Flex>}
        </Box>
        <Flex  maxW='450px' p='20px' mt='4vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'border_color'}>
            <Button  size='sm' variant={'main'} isDisabled={selectedDocument === null} onClick={createPdf}>{waitingCreate?<LoadingIconButton/>:t('Upload')}</Button>
            <Button  size='sm' variant={'common'} onClick={() => {setShowAddPdf(false)}}>{t('Cancel')}</Button>
        </Flex>
    </>)
}

