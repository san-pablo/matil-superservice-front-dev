//REACT
import { useEffect, useState, useMemo } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Flex, Button, Image, Avatar, Skeleton, Tooltip } from "@chakra-ui/react"
//COMPONENTS
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
import EditText from "../../../Components/Reusable/EditText"
import ConfirmBox from "../../../Components/Reusable/ConfirmBox"
import Table from "../../../Components/Reusable/Table"
import SectionSelector from "../../../Components/Reusable/SectionSelector"
//FUNCTIONS
import parseMessageToBold from "../../../Functions/parseToBold"
import timeStampToDate from "../../../Functions/timeStampToString"
import timeAgo from "../../../Functions/timeAgo"
//ICONS
import { FaPlus, FaBolt, FaArrowRotateRight } from "react-icons/fa6"
import { IoMdArchive } from "react-icons/io"
//TYPING
import { TagsType } from "../../../Constants/typing"

//CELL STYLES
const CellStyle = ({column, element}:{column:string, element:any}) => {

    const auth = useAuth()
    const  { t } = useTranslation('settings')
    const t_formats = useTranslation('formats').t

    if (column === 'conversations_affected' || column === 'contacts_affected' || column === 'contact_businesses_affected') return <Text fontSize={'.9em'} fontWeight={'medium'}>{element}</Text>
    else if (column === 'created_by') {
        const selectedUser = auth?.authData?.users?.[element as string | number]

        return (
            <Flex fontSize={'.9em'} alignItems={'center'} gap='5px'> 
                {selectedUser?.profile_picture ? <Image src={selectedUser?.profile_picture } h='14px' w='14px' alt={selectedUser.name} /> :
                <Avatar h='16px' w='16px' size={'xs'} name={selectedUser?.name}/> }
                <Text fontSize={'.9em'} fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} >{element === 'matilda' ?'Matilda':element === 'no_user' ? t('NoAgent'):selectedUser?.name}</Text>
            </Flex>
        )
    }
    else if (column === 'created_at' || column === 'archived_at') {
        return(
        <Tooltip  label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.5rem' fontSize='.8em' p='6px'> 
            <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    }

    else return ( <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>)
}

//MAN FUNCTION
const Tags = () => {

    //CONSTANTS
    const { t } = useTranslation('settings')
    const { getAccessTokenSilently } = useAuth0()
    const auth = useAuth()
    const columnsTagsMap:{[key:string]:[string, number]} = {'name':[t('Name'), 200], 'created_at':[t('created_at'), 150], 'archived_at':[t('archived_at'), 150], 'created_by':[t('created_by'), 150], 'conversations_affected':[t('conversations_affected'), 100], 'contacts_affected':[t('contacts_affected'), 100], 'contact_businesses_affected':[t('contact_businesses_affected'), 100], 'description':[t('description'), 350]  }

    //SECTION TO SEEE BETWEEN ACTIVE AND ARCHIVED TAGS
    const [currentSection, setCurrentSection] = useState<'active' | 'archived'>('active')

    //CREATE NEW TAG OR EDITING ONE 
    const [editTag, setEditTag] = useState<TagsType | null>(null)
 
    //ARCHIVE TAG
    const [tagToArchive, setTagToArchive] = useState<TagsType | null>(null)

    //TAGS DATA
    const [tagsData, setTagsData] = useState<TagsType[] | null>(null)

    //FETCH TAGS DATA
    useEffect(() => {        
        document.title = `${t('Settings')} - ${t('Tags')} - ${auth.authData.organizationId} - Matil`
        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/tags`, setValue:setTagsData, getAccessTokenSilently, auth})
            if (response?.status === 200 ) auth.setAuthData({tags:response.data})
        }
        fetchInitialData()
    }, [])
   

    //CREATE AND EDIT TAGS COMPONENT
    const EditFieldBox = () => {

        //NEW TAG INDEX
        const foundTagIndex = tagsData?.findIndex(item => item.uuid === editTag?.uuid)

        //NEW TAG DATA
        const [newTagData, setNewTagData] = useState<TagsType>(editTag as TagsType)
    
        //BOOLEAN FOR WAITING THE EDIT
        const [waitingEdit, setWaitingEdit] = useState<boolean>(false)

        //EDIT TAGS
        const handleEditTag = async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/tags${foundTagIndex === -1 ?'':`/${editTag?.uuid}`}`, method:foundTagIndex === -1 ? 'post':'put', getAccessTokenSilently, setWaiting:setWaitingEdit, requestForm:newTagData, auth, toastMessages:{'works':foundTagIndex === -1 ?t('CorrectCreatedTag'):t('CorrectUpdatedTag'), 'failed':foundTagIndex === -1 ?t('FailedCreatedTag'):t('FailedUpdatedTag')}})
            if (response?.status === 200) {
                let newTag:TagsType[] = []
                if (foundTagIndex === -1 ) newTag = [...tagsData as TagsType[], {...newTagData, uuid:response.data.uuid}]
                else { newTag = (tagsData as TagsType[]).map((item, index) => index === foundTagIndex? newTagData : item)}
                setTagsData(newTag)
            }
            setEditTag(null)
        }

        //FRONT
        return(<> 
            <Box p='15px'> 

                <Text fontSize={'1.2em'} fontWeight={'medium'}>{foundTagIndex === -1?t('CreateTag'):t('EditTag')}</Text>

                <Text  mt='2vh' fontSize={'.8em'} mb='.5vh' fontWeight={'medium'}>{t('Name')}</Text>
                <EditText  maxLength={100} placeholder={`${t('Name')}...`} hideInput={false} value={newTagData.name} setValue={(value) => setNewTagData((prev) => ({...prev, name:value}))}/>
               
                <Text  mb='.5vh'  mt='2vh' fontSize={'.8em'}  fontWeight={'medium'}>{t('Description')}</Text>
                <EditText  isTextArea maxLength={500} placeholder={`${t('Description')}...`} hideInput={false} value={newTagData.description} setValue={(value) => setNewTagData((prev) => ({...prev, description:value}))}/>
               
                <Flex  mt='3vh' gap='15px' flexDir={'row-reverse'} >
                    <Button isDisabled={newTagData.name === '' || (foundTagIndex !== -1 && (JSON.stringify(editTag) === JSON.stringify(newTagData)) )} size='sm' variant={'main'} onClick={handleEditTag}>{waitingEdit?<LoadingIconButton/>:foundTagIndex === -1 ?t('CreateTag'):t('SaveChanges')}</Button>
                    <Button  size='sm'variant={'common'} onClick={() => setEditTag(null)}>{t('Cancel')}</Button>
                </Flex>
            </Box>
      </>)
    }   

    //ARCHIVE A TAG BOX
    const ArchiveFiledBox = () => {

        //NEW ARCHIVED INDEX
        const foundTagIndex = tagsData?.findIndex(item => item.uuid === tagToArchive?.uuid) 

        //BOOLEAN FOR WAITIGN THE ARCHIVE
        const [waitingArchive, setWaitingArchive] = useState<boolean>(false)

        //ARCHIVE TAG
        const handleDeleteTag= async() => {
             const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/cdas/${tagToArchive?.uuid}`, method:'delete', setWaiting:setWaitingArchive, getAccessTokenSilently,auth, toastMessages:{'works':t('CorrectDeletedTags'), 'failed':t('FailedDeletedTags')}})
            if (response?.status === 200) {
                const newTags = (tagsData as TagsType[]).map((item, index) => index === foundTagIndex? {...tagToArchive as TagsType, is_archived:true, archived_at:String(new Date())} : item)
                setTagsData(newTags)
                setTagToArchive(null)
            }
        }

        //FRONT
        return (
            <Box p='15px'> 
                <Text width={'400px'}>{parseMessageToBold(t('ArchiveTag', {name:tagToArchive?.name }))}</Text>
        
                <Flex mt='2vh' gap='15px' flexDir={'row-reverse'} >
                    <Button  size='sm' variant={'delete'} onClick={handleDeleteTag}>{waitingArchive?<LoadingIconButton/>:t('Delete')}</Button>
                    <Button  size='sm' variant={'common'} onClick={()=> setTagToArchive(null)}>{t('Cancel')}</Button>
                </Flex>
            </Box>
        )
    }

    //RECOVER AN ARCHIVED TAG
    const recoverField = async (row:TagsType) => {

        //NEW ACTIVE TAG INDEX
        const foundTagIndex = tagsData?.findIndex(item => item.uuid === row.uuid) || 0
        
        //ACTIVE TAG
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/cdas/${tagsData?.[foundTagIndex].uuid}/restore`,getAccessTokenSilently, auth})
        if (response?.status === 200) {
            const newFields = (tagsData as TagsType[]).map((item, index) => index === foundTagIndex? {...tagsData?.[foundTagIndex as number] as TagsType, is_archived:false} : item)
            setTagsData(newFields)
            setCurrentSection('active')
        }
    } 

    //MEMOIZED CREATE AND EDIT TAG COMPONENT
    const memoizedEditFieldBox = useMemo(() => (
        <ConfirmBox setShowBox={() => setEditTag(null)}> 
            <EditFieldBox  />
        </ConfirmBox>
    ), [editTag])

    //MEMOIZED ARCHIVE A TAG BOX
    const memoizedArchiveBox = useMemo(() => (
        <ConfirmBox setShowBox={(b:boolean) => setTagToArchive(null)}> 
             <ArchiveFiledBox/>
        </ConfirmBox>
    ), [tagToArchive])

    //SHOW ARCHIVED OR ACTIVE TAGS
    const dataToWork = tagsData?.filter(item => currentSection === 'archived' ? item.is_archived === true: item.is_archived === false) || []
    
    return(<>
        {tagToArchive && memoizedArchiveBox}
        {editTag && memoizedEditFieldBox}
    
        <Box height={'100%'} width={'100%'} px='2vw' pt='2vh' > 
    
            <Flex justifyContent={'space-between'} alignItems={'start'}> 
                <Box w='100%'> 
                    <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('Tags')}</Text>
                    <Text color='gray.600' fontSize={'.8em'}>{t('TagsDes')}</Text>
                    <Box h='40px' w='100%' > 
                        <SectionSelector notSection selectedSection={currentSection} sections={['active', 'archived']} sectionsMap={{'active':[t('activetags'), <FaBolt/>], 'archived':[t('archivedtags'), <IoMdArchive/>]}}  onChange={(section) => setCurrentSection(section)}/>
                        <Box bg='gray.200' h='1px' w='100%'/>
                    </Box>
                </Box>
                <Button size='sm' variant={'main'} leftIcon={<FaPlus/>} onClick={() => setEditTag({uuid:'-1',organization_id:auth.authData.organizationId || 0, name:'', description:'', conversations_affected:0, contacts_affected:0, contact_businesses_affected:0,  created_by:auth.authData.userId as string, created_at:'', archived_at:'', is_archived:false})}>{t('CreateTag')}</Button>
            </Flex>
        
            <Flex  mt='2vh'justifyContent={'space-between'} alignItems={'end'}>
                <Skeleton isLoaded={tagsData !== null}> 
                    <Text  fontWeight={'medium'} color='gray.600'>{t('TagsCount', {count:dataToWork?.length})}</Text>
                </Skeleton>
            </Flex>

            <Skeleton isLoaded={tagsData !== null}> 
                <Table data={dataToWork} CellStyle={CellStyle} noDataMessage={ currentSection === 'active'?t('NoTags'):t('NoArchivedTags')} excludedKeys={['uuid', 'organization_id', 'is_archived', currentSection === 'active' ? 'archived_at':'created_at']}  columnsMap={columnsTagsMap} onClickRow={(row:any, index:number) => {if (currentSection === 'active') setEditTag(row)}} deletableIcon={<FaArrowRotateRight size='20px'/>} deletableFunction={(row,index) => {if (currentSection === 'archived') recoverField(row);else setTagToArchive(row)}}/>
            </Skeleton>
        </Box>
    </>)
}

export default Tags