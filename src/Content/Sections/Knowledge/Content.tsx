//REACT
import { useState, useEffect, Dispatch, SetStateAction, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../AuthContext"
import { useSession } from "../../../SessionContext"
import { useNavigate } from "react-router-dom"
import { useLocation } from "react-router-dom"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Box, Text, Button, Icon, Skeleton, Tooltip, IconButton } from '@chakra-ui/react'
//COMPONENTS
import EditText from "../../Components/Reusable/EditText"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import Table from "../../Components/Reusable/Table"
import FilterButton from "../../Components/Reusable/FilterButton"
import { CreateBox, CreateFolder } from "./Utils"
//FUNCTIONS
import timeStampToDate from "../../Functions/timeStampToString"
import timeAgo from "../../Functions/timeAgo"
//ICONS
import { IconType } from "react-icons"
import { FaFolder, FaPlus, FaLock, FaFilePdf, FaFileLines, FaFilter } from "react-icons/fa6"
import { IoBook } from "react-icons/io5"
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io"
import { RxCross2, RxCheck } from "react-icons/rx"
import { BiWorld } from "react-icons/bi"
import { PiDesktopTowerFill } from "react-icons/pi"
//TYPING
import { ContentData, languagesFlags, Folder } from "../../Constants/typing"
  
//TYPING
type sourcesType = 'internal_article' | 'public_article' | 'folder' | 'pdf' | 'snippet' |  'website'
interface ContentFilters {
    page_index:number
    type:sourcesType[]
    search?:string
    sort_by?:string
    order?:'asc' | 'desc'
}

//SOURCE TYOE COMPONENT
const TypesComponent = ({t,  type }:{t:any, type:sourcesType}) => {
    const getAlertDetails = (type:sourcesType) => {
        switch (type) {
            case 'internal_article':
                return { color1: 'yellow.100', color2:'yellow.200', icon: FaLock, label: t('InternalArticle') }
            case 'public_article':
                return { color1: 'blue.100', color2:'blue.200', icon: IoBook, label: t('PublicArticle')  }
            case 'folder':
                return { color1: 'brand.gray_1', color2:'gray.300', icon: FaFolder, label: t('Folder')  }
            case 'pdf':
                return { color1: 'brand.gray_1', color2:'gray.300', icon: FaFilePdf, label: t('Pdf')  }
            case 'snippet':
                return { color1: 'brand.gray_1', color2:'gray.300', icon: FaFileLines, label: t('Text')  }
            case 'website':
                return { color1: 'brand.gray_1', color2:'gray.300', icon: BiWorld, label: t('Web')  }
        }
    }
    const { color1, color2, icon, label } = getAlertDetails(type)
    return (
        <Flex   gap='10px' alignItems="center" borderRadius={'1rem'} borderColor={color2} borderWidth={'1px'} py='2px' px='5px' bg={color1}>
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
    else if (column === 'tags' || column === 'public_article_help_center_collections') {
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
    else if (column === 'public_article_status') return(<> 
        {!element?<Text>-</Text>:
        <Box boxShadow={`1px 1px 1px rgba(0, 0, 0, 0.15)`} display="inline-flex" fontSize='.9em' py='2px' px='8px' fontWeight={'medium'} color='white'  bg={element === 'draft'?'red.100':'green.100'} borderRadius={'.7rem'}> 
            <Text color={element === 'draft'?'red.600':'green.600'}>{t(element)}</Text>
        </Box>}
        </>)
    else if (column === 'type') return <TypesComponent t={t} type={element}/>
    else if (column === 'created_by' || column === 'updated_by') return <Text fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element === -1 ?'Matilda':element === 0 ? t('NoAgent'):(auth?.authData?.users?.[element as string | number].name || '')}</Text>
    else return ( <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={column === 'title'?'medium':'normal'}  overflow={'hidden'} >{element === ''?'-':element}</Text>)
}

//MAIN FUNCTION
function Content ({folders, handleFolderUpdate}:{folders:Folder[], handleFolderUpdate:(type: 'edit' | 'add' | 'delete' | 'move', newFolderData: Folder, parentId: string | null) => void}) {

    //AUTH CONSTANT
    const auth = useAuth()
    const session = useSession()
    const navigate = useNavigate()
    const { t } = useTranslation('knowledge')
    const columnsContentMap:{[key:string]:[string, number]} = {title: [t('title'), 200], type: [t('type'), 150], language: [t('language'), 150], is_available_to_tilda:[t('is_available_to_tilda'), 150], created_at: [t('created_at'), 180], updated_at: [t('updated_at'), 180], created_by:[t('created_by'), 150],updated_by:[t('updated_by'), 150], tags:[t('tags'), 300], public_article_help_center_collections:[t('public_article_help_center_collections'), 300], public_article_status:[t('public_article_status'), 150], description:[t('description'),200]}
    const logosMap:{[key in 'internal_article' | 'public_article' | 'folder' | 'pdf' | 'snippet' |  'website']: [string, IconType]} = { 
        'internal_article':[ t('internal_article'), FaLock],
        'public_article':[ t('public_article'), IoBook ], 
        'pdf':[ t('pdf'), FaFilePdf], 
        'snippet':[ t('snippet'), FaFileLines],
        'folder':[ t('folder'), FaFolder],
        'website':[ t('website'), BiWorld]
    }
    const folderUuid = useLocation().pathname.split('/')[3] || null


    //CREATE BOX AND FOLDER
    const [showCreate, setShowCreate] = useState<boolean>(false)
    const [showCreateFolder, setShowCreateFolder] = useState<boolean>(false)

    //CONTENT DATA
    const [waitingInfo, setWaitingInfo] = useState<boolean>(false)
    const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null)
    const [contentData, setContentData] = useState<{page_data:ContentData[], page_index:1, number_of_sources:number} | null>(null)

    //FETCH INITIAL DATA
    useEffect(() => {
        const findFolderByUuid = (folders: Folder[], folderUuid: string | null): Folder | null => {
            if (folderUuid === null) return null
            for (let folder of folders) {
                if (folder.uuid === folderUuid) return folder
                if (folder.children && folder.children.length > 0) {
                    const found = findFolderByUuid(folder.children, folderUuid)
                    if (found) return found
                }
            }
            return null
        }

        const fetchSourceData = async () => {
            const selectedFolder = findFolderByUuid(folders, folderUuid)
            if (selectedFolder) document.title = `${t('Folder')} - ${selectedFolder?.name} - ${auth.authData.organizationName} - Matil`
            else document.title = `${t('Content')} - ${auth.authData.organizationName} - Matil`
            const response  = await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/sources${folderUuid?`/${folderUuid}`:''}`, params:{page_index:1, type:[]}, setValue:setContentData, auth})
            if (response?.status === 200) {
                setSelectedFolder(selectedFolder)
            }
        }
        localStorage.setItem('currentSectionContent', 'content')
         fetchSourceData()
    }, [])

    //FILTER TRIGGER DATA
    const [filters, setFilters] = useState<ContentFilters>({page_index:1, type:[] })
    
    //FETCH NEW DATA ON FILTERS CHANGE
    const fetchClientDataWithFilter = async (filters:ContentFilters) => {
        setFilters(filters)
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/sources`, setValue:setContentData, setWaiting:setWaitingInfo, params:filters, auth})
        if (response?.status === 200) {            
            session.dispatch({ type: 'UPDATE_CONTENT_TABLE', payload: {data:response.data, filters:filters} })
        }
    }

   //SELECT CHANNELS LOGIC
    const toggleChannelsList = (element: 'internal_article' | 'public_article' | 'folder' | 'pdf' | 'snippet' |  'website') => {
        const sourcesList = filters?.type
        if (sourcesList.includes(element)) setFilters({...filters, type: sourcesList.filter(e => e !== element)})
        else setFilters({...filters, type: [...sourcesList, element]})
    }

    //SORT LOGIC
    const requestSort = (key: string) => {
        const direction = (filters?.sort_by === key && filters?.order === 'asc') ? 'desc' : 'asc';
        fetchClientDataWithFilter({...filters, sort_by: key, order: direction as 'asc' | 'desc'})
    }
    const getSortIcon = (key: string) => {
        if (filters?.sort_by === key) { 
            if (filters?.order === 'asc') return true
            else return false
        }
        else return null    
    }

    const navigateToContent = (row:ContentData) => {
        if (row.type === 'public_article' || row.type === 'internal_article') navigate(`/knowledge/article/${row.uuid}`)
        else if (row.type === 'snippet') navigate(`/knowledge/snippet/${row.uuid}`)
        else if (row.type === 'website') navigate(`/knowledge/website/${row.uuid}`)
        else if (row.type === 'pdf') navigate(`/knowledge/pdf/${row.uuid}`)
    }
    const memoizedCreateBox = useMemo(() => (
        <ConfirmBox maxW={'800px'}  setShowBox={setShowCreate}> 
            <CreateBox/>
        </ConfirmBox>
    ), [showCreate])

    const memoizedCreateFolderBox = useMemo(() => (
        <ConfirmBox maxW={'800px'}  setShowBox={setShowCreateFolder}> 
            <CreateFolder setShowCreate={setShowCreateFolder} type='add' parentId={null} currentFolder={null} onFolderUpdate={handleFolderUpdate}/>
        </ConfirmBox>
    ), [showCreateFolder])


     //FRONT
    return(<>
        {showCreate && memoizedCreateBox}
        {showCreateFolder && memoizedCreateFolderBox}

        <Box> 
            <Flex justifyContent={'space-between'} alignItems={'end'}> 
                <Box> 
                    <Text fontSize={'1.4em'} fontWeight={'medium'}>{selectedFolder ? selectedFolder.emoji + ' ' + selectedFolder.name :t('Content')}</Text>
                </Box>
                <Flex gap='10px'> 
                    <Button size={'sm'} variant={'common'} leftIcon={<FaFolder/>} onClick={() => setShowCreateFolder(true)}>{t('CreateFolder')}</Button>
                    <Button size={'sm'} variant={'main'} leftIcon={<FaPlus/>} onClick={() => setShowCreate(true)}>{t('CreateContent')}</Button>
                </Flex> 
            </Flex>
            
    
            <Flex gap='15px' mt='2vh' > 
                <Box width={'350px'}> 
                    <EditText value={filters?.search || ''} setValue={(value:string) => setFilters(prev => ({...prev, search:value}))} searchInput={true}/>
                </Box>
                <FilterButton selectList={Object.keys(logosMap)} itemsMap={logosMap} selectedElements={filters.type} setSelectedElements={(element) => toggleChannelsList(element as sourcesType)} icon={PiDesktopTowerFill} initialMessage={t('SourceFilterMessage')}/>
                <Button leftIcon={<FaFilter/>} size='sm' variant={'common'}  onClick={() => fetchClientDataWithFilter({...filters, page_index:1})}>{t('ApplyFilters')}</Button>
            </Flex>

            <Flex  mt='2vh' justifyContent={'space-between'} alignItems={'end'}>
                <Skeleton isLoaded={!waitingInfo && contentData !== null}> 
                    <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ContentCount', {count:contentData?.number_of_sources})}</Text>
                </Skeleton>
                <Flex  alignItems={'center'} justifyContent={'end'} gap='10px' flexDir={'row-reverse'}>
                    <IconButton isRound size='xs'  variant={'common'}  aria-label='next-page' icon={<IoIosArrowForward />} isDisabled={filters?.page_index >= Math.floor((contentData?.number_of_sources || 0)/ 50)} onClick={() => fetchClientDataWithFilter({...filters,page_index:filters?.page_index + 1})}/>
                    <Text fontWeight={'medium'} fontSize={'.9em'} color='gray.600'>{t('Page', {count:filters?.page_index})}</Text>
                    <IconButton isRound size='xs' variant={'common'} aria-label='next-page' icon={<IoIosArrowBack />} isDisabled={filters?.page_index === 1} onClick={() => fetchClientDataWithFilter({...filters,page_index:filters?.page_index - 1})}/>
                </Flex>
            </Flex>

            <Skeleton isLoaded={!waitingInfo && contentData !== null}> 
                <Table data={contentData?.page_data || []} CellStyle={CellStyle} columnsMap={columnsContentMap} requestSort={requestSort} getSortIcon={getSortIcon}  excludedKeys={['uuid', 'public_article_uuid', 'content','is_ingested', 'public_article_common_uuid', 'folder_uuid' ]} noDataMessage={t('NoContent')} onClickRow={(row, index) => navigateToContent(row)} />  
            </Skeleton>
        </Box>
    
    </>)
}

export default Content