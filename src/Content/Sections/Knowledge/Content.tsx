//REACT
import { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../AuthContext"
import { useSession } from "../../../SessionContext"
import { useNavigate } from "react-router-dom"
import { useLocation } from "react-router-dom"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Box, Text, Button, Skeleton, IconButton } from '@chakra-ui/react'
//COMPONENTS
import EditText from "../../Components/Reusable/EditText"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import Table from "../../Components/Reusable/Table"
import FilterButton from "../../Components/Reusable/FilterButton"
import { CreateBox, CreateFolder, CellStyle } from "./Utils"
//ICONS
import { FaFolder, FaPlus } from "react-icons/fa6"
import { PiSidebarSimpleBold } from "react-icons/pi"
 //TYPING
import { ContentData, Folder } from "../../Constants/typing"
import { useAuth0 } from "@auth0/auth0-react"
  
//TYPING
type sourcesType = 'internal_article' | 'public_article' | 'folder' | 'pdf' | 'snippet' |  'website'
interface ContentFilters {
    page_index:number
    type:sourcesType[]
    search?:string
    sort?:{column:string, order:'asc' | 'desc'}
}

 
 
//MAIN FUNCTION
function Content ({folders, handleFolderUpdate, setHideFunctions}:{folders:Folder[], handleFolderUpdate:(type: 'edit' | 'add' | 'delete' | 'move', newFolderData: Folder, parentId: string | null) => void, setHideFunctions:Dispatch<SetStateAction<boolean>>}) {

    //AUTH CONSTANT
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0() 
    const session = useSession()
    const navigate = useNavigate()
    const { t } = useTranslation('knowledge')
    const columnsContentMap:{[key:string]:[string, number]} = {title: [t('title'), 200], type: [t('type'), 150], language: [t('language'), 150], is_available_to_tilda:[t('is_available_to_tilda'), 150], created_at: [t('created_at'), 180], updated_at: [t('updated_at'), 180], created_by:[t('created_by'), 150],updated_by:[t('updated_by'), 150], tags:[t('tags'), 300], public_article_help_center_collections:[t('public_article_help_center_collections'), 300], public_article_status:[t('public_article_status'), 150], description:[t('description'),200]}
   
    const folderUuid = useLocation().pathname.split('/')[3] || null
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


    //CREATE BOX AND FOLDER
    const [showCreate, setShowCreate] = useState<boolean>(false)
    const [showCreateFolder, setShowCreateFolder] = useState<boolean>(false)

    //CONTENT DATA
    const [waitingInfo, setWaitingInfo] = useState<boolean>(false)
    const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null)
    const [contentData, setContentData] = useState<{page_data:ContentData[], page_index:1, number_of_sources:number} | null>(null)


    //FETCH INITIAL DATA
    useEffect(() => {
        
        const fetchSourceData = async () => {
            const selectedFolder = findFolderByUuid(folders, folderUuid)
            if (selectedFolder) document.title = `${t('Folder')} - ${selectedFolder?.name} - ${auth.authData.organizationName} - Matil`
            else document.title = `${t('Content')} - ${auth.authData.organizationName} - Matil`
            const response  = await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/sources`,getAccessTokenSilently, params:folderUuid?{page_index:1, type:[], folder_uuid:folderUuid }:{page_index:1, type:[]}, setValue:setContentData, auth})
            if (response?.status === 200) {
                setSelectedFolder(selectedFolder)
            }
        }
        localStorage.setItem('currentSectionContent', 'content')
        fetchSourceData()
    }, [folderUuid])

    //FILTER TRIGGER DATA
    const [filters, setFilters] = useState<ContentFilters>({page_index:1, type:[] })
    
    //FETCH NEW DATA ON FILTERS CHANGE
    const fetchClientDataWithFilter = async (filters:ContentFilters) => {
        setFilters(filters)
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/sources`, setValue:setContentData, getAccessTokenSilently,setWaiting:setWaitingInfo, params:filters, auth})
    }

   //SELECT CHANNELS LOGIC
    const toggleChannelsList = (element: 'internal_article' | 'public_article' | 'folder' | 'pdf' | 'snippet' |  'website') => {
        const sourcesList = filters?.type
        if (sourcesList.includes(element)) setFilters({...filters, type: sourcesList.filter(e => e !== element)})
        else setFilters({...filters, type: [...sourcesList, element]})
    }

    //SORT LOGIC
    const requestSort = (key: string) => {
        const direction = (filters?.sort?.column === key && filters?.sort.order === 'asc') ? 'desc' : 'asc';
        fetchClientDataWithFilter({...filters, sort: {column: key, order: direction as 'asc' | 'desc'}})
    }
    const getSortIcon = (key: string) => {
        if (filters?.sort?.column === key) { 
            if (filters?.sort.order === 'asc') return true
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
            <CreateFolder setShowCreate={setShowCreateFolder} type='add' parentId={folderUuid} currentFolder={null} onFolderUpdate={handleFolderUpdate}/>
        </ConfirmBox>
    ), [showCreateFolder])


    //FRONT
    return(<>
        {showCreate && memoizedCreateBox}
        {showCreateFolder && memoizedCreateFolderBox}

        <Box px='2vw' py='2vh'> 
            <Flex justifyContent={'space-between'} alignItems={'end'}> 
                <Flex  alignItems={'center'} gap='10px' >
                    <IconButton  aria-label="open-tab" variant={'common'} bg='transparent' size='sm' icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'18px'}/>}  h='28px' w='28px'  onClick={() =>setHideFunctions(prev => (!prev))}/>
                    <Text fontWeight={'medium'} fontSize={'1.2em'}>{selectedFolder ? selectedFolder.emoji + ' ' + selectedFolder.name :t('Content')}</Text>
                </Flex>

               
                <Flex gap='10px'> 
                    <Button size={'sm'} variant={'common'} leftIcon={<FaFolder/>} onClick={() => setShowCreateFolder(true)}>{folderUuid ? t('CreateSubFolder'):t('CreateFolder')}</Button>
                    <Button size={'sm'} variant={'main'} leftIcon={<FaPlus/>} onClick={() => setShowCreate(true)}>{t('CreateContent')}</Button>
                </Flex> 
            </Flex>
            
            <Flex gap='15px' mt='2vh' > 
                <Box width={'350px'}> 
                    <EditText  filterData={(text:string) => {fetchClientDataWithFilter({...filters, search:text})}}  value={filters?.search || ''} setValue={(value:string) => setFilters(prev => ({...prev, search:value}))} searchInput={true}/>
                </Box>
                <FilterButton selectedSection='article_status' selectedElements={filters.type} setSelectedElements={(element) => toggleChannelsList(element as sourcesType)}/>
             </Flex>

            <Flex  mt='2vh' mb='2vh' justifyContent={'space-between'} alignItems={'end'}>
                <Skeleton isLoaded={!waitingInfo && contentData !== null}> 
                    <Text fontWeight={'medium'} >{t('ContentCount', {count:contentData?.number_of_sources})}</Text>
                </Skeleton>
              
            </Flex>

            <Skeleton isLoaded={!waitingInfo && contentData !== null}> 
                <Table data={contentData?.page_data || []} CellStyle={CellStyle} columnsMap={columnsContentMap} requestSort={requestSort} getSortIcon={getSortIcon}  excludedKeys={['uuid', 'public_article_uuid', 'content','is_ingested', 'public_article_common_uuid', 'folder_uuid' ]} noDataMessage={t('NoContent')} onClickRow={(row, index) => navigateToContent(row)} />  
            </Skeleton>
        </Box>
    
    </>)
}

export default Content