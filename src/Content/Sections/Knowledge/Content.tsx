//REACT
import { useState, useEffect, Dispatch, SetStateAction, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../AuthContext"
import { useSession } from "../../../SessionContext"
import { useNavigate } from "react-router-dom"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Box, Text, Button, Icon, Skeleton, Tooltip } from '@chakra-ui/react'
//COMPONENTS
import EditText from "../../Components/Reusable/EditText"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import Table from "../../Components/Reusable/Table"
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import { CreateBox, CreateFolder } from "./Utils"
//FUNCTIONS
import timeStampToDate from "../../Functions/timeStampToString"
import timeAgo from "../../Functions/timeAgo"
import parseMessageToBold from "../../Functions/parseToBold"
//ICONS
import { FaFolder, FaPlus, FaLock, FaFilePdf, FaFileLines } from "react-icons/fa6"
import { IoBook } from "react-icons/io5"
import { RxCross2, RxCheck } from "react-icons/rx"
import { BiWorld } from "react-icons/bi"
//TYPING
import { ContentData, languagesFlags } from "../../Constants/typing"
  

const TypesComponent = ({t,  type }:{t:any, type:'internal_article' | 'public_article' | 'folder' | 'pdf' | 'text' | 'web'}) => {
    const getAlertDetails = (type:'internal_article' | 'public_article' | 'folder' | 'pdf' | 'text' | 'web') => {
        switch (type) {
            case 'internal_article':
                return { color1: 'yellow.100', color2:'yellow.200', icon: FaLock, label: t('InternalArticle') }
            case 'public_article':
                return { color1: 'blue.100', color2:'blue.200', icon: IoBook, label: t('PublicArticle')  }
            case 'folder':
                return { color1: 'brand.gray_1', color2:'gray.300', icon: FaFolder, label: t('Folder')  }
            case 'pdf':
                return { color1: 'brand.gray_1', color2:'gray.300', icon: FaFilePdf, label: t('Pdf')  }
            case 'text':
                return { color1: 'brand.gray_1', color2:'gray.300', icon: FaFileLines, label: t('Text')  }
            case 'web':
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
                    <Flex bg='gray.200' borderColor={'gray.300'} borderWidth={'1px'} p='4px' borderRadius={'.5rem'} fontSize={'.8em'} key={`client-label-${index}`}>
                        <Text>{label}</Text>
                    </Flex>
                ))}
            </Flex>:
            <Text>-</Text>
        }
        </Flex>
    </>)
    }
    else if (column === 'is_available_to_tilda') return <Icon boxSize={'25px'} color={element?'red.600':'green.600'} as={element?RxCheck:RxCross2}/>
    else if (column === 'language') {
        return(
        <Flex gap='5px' alignItems={'center'}>
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][0]:'No detectado'}</Text>
            <Text fontSize={'.8em'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][1]:'🏴󠁥󠁳󠁣󠁴󠁿'}</Text>
        </Flex>)
    }   
    else if (column === 'public_article_status') return(
        <Box boxShadow={`1px 1px 1px rgba(0, 0, 0, 0.15)`} display="inline-flex" fontSize='.9em' py='2px' px='8px' fontWeight={'medium'} color='white'  bg={element === 'draft'?'red.100':'green.100'} borderRadius={'.7rem'}> 
            <Text color={element === 'draft'?'red.600':'green.600'}>{t(element)}</Text>
        </Box>
    )
    else if (column === 'type') return <TypesComponent t={t} type={element}/>
    else if (column === 'created_by' || column === 'updated_by') return <Text fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element === -1 ?'Matilda':element === 0 ? t('NoAgent'):(auth?.authData?.users?.[element as string | number].name || '')}</Text>
    else return ( <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={column === 'title'?'medium':'normal'}  overflow={'hidden'} >{element === ''?'-':element}</Text>)
}

function Content ({contentData, setContentData}:{contentData:ContentData[] | null, setContentData:Dispatch<SetStateAction<ContentData[] | null>>}) {

    //AUTH CONSTANT
    const auth = useAuth()
    const session = useSession()
    const { t } = useTranslation('knowledge')
    const columnsContentMap:{[key:string]:[string, number]} = {title: [t('title'), 200], type: [t('type'), 150], language: [t('language'), 150], is_available_to_tilda:[t('is_available_to_tilda'), 150], created_at: [t('created_at'), 180], updated_at: [t('updated_at'), 180], created_by:[t('created_by'), 150],updated_by:[t('updated_by'), 150], tags:[t('tags'), 300], public_article_help_center_collections:[t('public_article_help_center_collections'), 300], public_article_status:[t('public_article_status'), 150]}

    //CREATE BOX AND FOLDER
    const [showCreate, setShowCreate] = useState<boolean>(false)
    const [showCreateFolder, setShowCreateFolder] = useState<boolean>(false)


    //SELECTED GROUP
    const [selectedIndex, setSelectedIndex] = useState<number>(-2)

    //TRIGGER TO DELETE 
    const [selectedElements, setSelectedElements] = useState<number[]>([])
    const [automationToDeleteIndex, setAutomationToDeleteIndex] = useState<number | null>(null)
    
    //FETCH INITIAL DATA
    useEffect(() => {
        
        const fetchTriggerData = async () => {
            const contentDataList = session.sessionData.contentData
    
            if (contentDataList) setContentData(contentDataList)
            else {
                const response  = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/knowledge/content`, setValue:setContentData, auth})
                if (response?.status === 200) session.dispatch({ type: 'UPDATE_CONTENT_TABLE', payload: response.data })
                else setContentData([
                    {
                    "uuid": "string",
                    "type": "public_article",
                    "title": "string",
                    "language": "EN",
                    "is_available_to_tilda": true,
                    "created_at": "string",
                    "updated_at": "string",
                    "created_by": 0,
                    "updated_by": 0,
                    "tags": ["string"],
                    "public_article_help_center_collections": ["string"],
                    "public_article_uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                    "public_article_status": "draft"
                    },
                    {
                        "uuid": "string",
                        "type": "folder",
                        "title": "string",
                        "language": "EN",
                        "is_available_to_tilda": true,
                        "created_at": "string",
                        "updated_at": "string",
                        "created_by": 0,
                        "updated_by": 0,
                        "tags": ["string"],
                        "public_article_help_center_collections": ["string"],
                        "public_article_uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                        "public_article_status": "draft"
                    }
                ])
            }
        }
        localStorage.setItem('currentSectionContent', 'content')
        document.title = `${t('Content')} - ${auth.authData.organizationName} - Matil`
        fetchTriggerData()
    }, [])



    //FILTER TRIGGER DATA
    const [text, setText]  =useState<string>('')
    const [filteredContentData, setFilteredContentData] = useState<ContentData[]>([])
    useEffect(() => {
        const filterUserData = () => {
            if (contentData) {
                const filtered = contentData.filter(con => con.title.toLowerCase().includes(text.toLowerCase()))
                  setFilteredContentData(filtered)
            }
        }
        filterUserData()
    }, [text, contentData])

    //FUNCTION FOR DELETING THE TRIGGER
    const DeleteComponent = () => {

        //WAITING DELETION
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

        //FUNCTION FOR DELETING AN AUTOMATION
        const deleteTrigger= async () => {
           
        }

        //FRONT
        return(<>
            <Box p='20px' > 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ConfirmDelete')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Text >{parseMessageToBold(t('ConfirmDeleteTrigger', {name:contentData?.[automationToDeleteIndex as number].title}))}</Text>
            </Box>
            <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                <Button  size='sm' variant={'delete'} onClick={deleteTrigger}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                <Button  size='sm' variant={'common'}onClick={() => setAutomationToDeleteIndex(null)}>{t('Cancel')}</Button>
            </Flex>
        </>)
    }

    //DELETE BOX
    const memoizedDeleteBox = useMemo(() => (
        <ConfirmBox isSectionWithoutHeader setShowBox={(b:boolean) => setAutomationToDeleteIndex(null)}> 
            <DeleteComponent/>
        </ConfirmBox>
    ), [automationToDeleteIndex])

    const memoizedCreateBox = useMemo(() => (
        <ConfirmBox maxW={'800px'} isSectionWithoutHeader setShowBox={setShowCreate}> 
            <CreateBox/>
        </ConfirmBox>
    ), [showCreate])

    const memoizedCreateFolderBox = useMemo(() => (
        <ConfirmBox maxW={'800px'} isSectionWithoutHeader setShowBox={setShowCreateFolder}> 
            <CreateFolder setShowCreate={setShowCreateFolder} currentFolder={null}/>
        </ConfirmBox>
    ), [showCreateFolder])


    //FRONT
    return(<>
        {automationToDeleteIndex !== null && memoizedDeleteBox}
        {showCreate && memoizedCreateBox}
        {showCreateFolder && memoizedCreateFolderBox}

        <Box> 
            <Flex justifyContent={'space-between'} alignItems={'end'}> 
                <Box> 
                    <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('Content')}</Text>
                </Box>
                <Flex gap='10px'> 
                    <Button size={'sm'} variant={'common'} leftIcon={<FaFolder/>} onClick={() => setShowCreateFolder(true)}>{t('CreateFolder')}</Button>
                    <Button size={'sm'} variant={'main'} leftIcon={<FaPlus/>} onClick={() => setShowCreate(true)}>{t('CreateContent')}</Button>
                </Flex> 
            </Flex>
            
            <Box  mt='2vh' width={'350px'}> 
                <EditText value={text} setValue={setText} searchInput={true}/>
            </Box>

            <Flex  mt='2vh' justifyContent={'space-between'} alignItems={'end'}>
                <Skeleton isLoaded={contentData !== null}> 
                    <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ContentCount', {count:filteredContentData?.length})}</Text>
                </Skeleton>
                
            </Flex>
            <Skeleton isLoaded={contentData !== null}> 
                <Table data={filteredContentData} CellStyle={CellStyle} columnsMap={columnsContentMap}  excludedKeys={['uuid', 'public_article_uuid']} noDataMessage={t('NoContent')} onClickRow={(row, index) => setSelectedIndex(index)} selectedElements={selectedElements} setSelectedElements={setSelectedElements} currentIndex={selectedIndex}/>  
            </Skeleton>
        </Box>
    
    </>)
}

export default Content