import { useTranslation  } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { Dispatch, SetStateAction, useRef, useState, ReactNode, KeyboardEvent } from "react"
import { useAuth } from "../../../AuthContext"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Text, Box, Icon, Flex,Skeleton, Button, Grid, Portal,  chakra, shouldForwardProp, Tooltip, IconButton, Switch, Textarea } from "@chakra-ui/react"
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { motion, isValidMotionProp } from 'framer-motion'
import "../../Components/styles.css"
//COMPONENTS
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import EditText from "../../Components/Reusable/EditText"
//FUNCTIONS
import useOutsideClick from "../../Functions/clickOutside"
import timeAgo from "../../Functions/timeAgo"
import timeStampToDate from "../../Functions/timeStampToString"
//ICONS
import { IconType } from "react-icons"
import { IoIosArrowDown } from "react-icons/io"
import { IoBook } from "react-icons/io5"
import { BiWorld } from "react-icons/bi"
import { RxCross2, RxCheck } from "react-icons/rx"
import { FaFolder, FaLock, FaFileLines, FaFilePdf,  } from "react-icons/fa6"
//TYPING
import { Folder } from "../../Constants/typing"
import { ContentData, languagesFlags } from "../../Constants/typing" 

interface CreateFolderData {
    currentFolder:Folder | null
    type:'edit' | 'add'
    parentId:string | null
    setShowCreate:Dispatch<SetStateAction<boolean>>
    onFolderUpdate:(type: 'edit' | 'add' | 'delete', newFolderData: Folder, parentId: string | null) => void
}

//CREATE A CONTENT TYPE (ARTICLE OR TEXT)
export const CreateBox = () => {

    const { t } = useTranslation('knowledge')
    const navigate = useNavigate()
    const contentList:{type:'internal_article' | 'public_article' | 'text', title:string, description:string, icon:IconType}[] = [
        {type:'public_article',title:t('PublicArticles'), description:t('PublicArticlesDes'), icon:IoBook},
        {type:'internal_article',title:t('PrivateArticles'), description:t('PrivateArticlesDes'), icon:FaLock},
        {type:'text',title:t('TextFragments'), description:t('TextFragmentsDes'), icon:FaFileLines},
    ]   
    const onClickNewCreate = (type:'internal_article' | 'public_article' | 'text' ) => {
        if (type === 'text') navigate(`/knowledge/text/create`)
        else  navigate(`/knowledge/article/create-${type === 'internal_article'?'internal':'public'}`)
    }

    return (<>
        <Box p='20px' > 
            <Text fontWeight={'medium'} fontSize={'1.3em'}>{t('AddContent')}</Text>
        </Box>
        <Box p='30px' bg='brand.gray_2'>
            <Grid  mt='1vh' width={'100%'} gap={'20px'} justifyContent={'space-between'} templateColumns='repeat(3, 1fr)'> 
                {contentList.map((con, index) => ( 
                    <Box onClick={() => onClickNewCreate(con.type)} transition={'box-shadow 0.3s ease-in-out'} key={`select-content-${index}`} _hover={{shadow:'lg'}} cursor={'pointer'} bg='white' p='15px' borderRadius={'.7rem'}>
                        <Box>
                            <Flex display={'inline-flex'} bg='brand.black_button' p='10px' borderRadius={'full'} >
                                <Icon boxSize={'17px'} color='white' as={con.icon}/>
                            </Flex>
                            <Text mt='1vh' fontSize={'1.2em'} fontWeight={'medium'}>{con.title}</Text>
                        </Box>
                        <Text fontSize={'.9em'} mt='1vh' color='gray.600'>{con.description}</Text>
                    </Box>
                ))}
            </Grid>
        </Box>
    </>)
}

//CREATE AND EDIT FOLDERS
export const CreateFolder= ({currentFolder, type, setShowCreate, parentId, onFolderUpdate}:CreateFolderData) => {

    const { t } = useTranslation('knowledge')
    const auth = useAuth()

    //REFS
    const emojiButtonRef = useRef<HTMLDivElement>(null)
    const emojiBoxRef = useRef<HTMLDivElement>(null)
    const [emojiVisible, setEmojiVisible] = useState<boolean>(false)
    useOutsideClick({ref1:emojiButtonRef, ref2:emojiBoxRef, onOutsideClick:setEmojiVisible})
    const handleEmojiClick = (emojiObject: EmojiClickData) => {setFolderEmoji(emojiObject.emoji)}


    const [waitingCreate, setWaitingCreate] = useState<boolean>(false)
    const [folderEmoji, setFolderEmoji] = useState<string>(currentFolder?currentFolder.emoji:'')
    const [folderName, setFolderName] = useState<string>(currentFolder?currentFolder.name:'')

    //FUNCTION FOR CREATE A NEW BUSINESS
    const createFolder= async () => {
        const folderData = await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/folders${currentFolder?`/${currentFolder.uuid}`:''}`, method:currentFolder?'put':'post', setWaiting:setWaitingCreate, requestForm:{name:folderName, emoji:folderEmoji, parent_uuid:parentId}, auth, toastMessages:{'works': currentFolder?t('CorrectEditedFolder'): t('CorrectCreatedFolder'), 'failed': currentFolder?t('FailedEditedFolder'):t('FailedtCreatedFolder')}})
        console.log(folderData?.data)
        if (folderData?.status === 200) {
            const updatedFolder:Folder = currentFolder
                ? { ...currentFolder, name: folderName, emoji: folderEmoji }
                : { uuid:folderData?.data.uuid || '', name: folderName, emoji: folderEmoji, children:[]}
            onFolderUpdate(type, updatedFolder, parentId)
        }
        setShowCreate(false)
        }

    return(<> 
        <Box p='20px' maxW='450px'> 
            <Text fontWeight={'medium'} fontSize={'1.2em'}>{currentFolder?t('EditFolder'):t('CreateFolder')}</Text>
            <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
            <Flex alignItems={'center'} gap='10px'> 
                <Flex cursor={'pointer'} ref={emojiButtonRef} onClick={() => setEmojiVisible(true)} alignItems={'center'} justifyContent={'center'} width={'40px'} height={'40px'} borderWidth={'1px'} borderColor={'gray.300'} borderRadius={'.5rem'}> 
                    {folderEmoji ? <Text fontSize={'1.2em'}>{folderEmoji}</Text>:<Icon boxSize={'20px'} as={FaFolder}/>}
                </Flex>
                <EditText placeholder={t('FolderName')} hideInput={false} value={folderName} setValue={setFolderName}/>
            </Flex>
        </Box>
        <Flex  maxW='450px' p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
            <Button  size='sm' variant={'main'} isDisabled={folderName === ''} onClick={createFolder}>{waitingCreate?<LoadingIconButton/>:currentFolder?t('EditFolder'):t('CreateFolder')}</Button>
            <Button  size='sm' variant={'common'} onClick={() => {setShowCreate(false)}}>{t('Cancel')}</Button>
        </Flex>
        {emojiVisible && 
        <Portal> 
            <Box position={'fixed'} zIndex={1000000} pointerEvents={emojiVisible?'auto':'none'} transition='opacity 0.2s ease-in-out' opacity={emojiVisible ? 1:0} top={`${(emojiButtonRef?.current?.getBoundingClientRect().top || 0)}px`} right={`${window.innerWidth - (emojiButtonRef?.current?.getBoundingClientRect().left || 0) + 5}px`}  ref={emojiBoxRef}> 
            <EmojiPicker open={emojiVisible}
             onEmojiClick={handleEmojiClick}  allowExpandReactions={false}/></Box>
        </Portal>}
    </>)
}

//SIDE BAR OF THE SOURCES
const TypesComponent = ({t,  type }:{t:any, type:'internal_article' | 'public_article' | 'folder' | 'pdf' | 'snippet' | 'subwebsite'}) => {
    
    const getAlertDetails = (type:'internal_article' | 'public_article' | 'folder' | 'pdf' | 'snippet' | 'subwebsite') => {
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
            case 'subwebsite':
                return { color1: 'brand.gray_1', color2:'gray.300', icon: BiWorld, label: t('Web')  }
        }
    }
    const { color1, color2, icon, label } = getAlertDetails(type)
    return (
        <Flex display={'inline-flex'}   gap='10px' alignItems="center" borderRadius={'1rem'} borderColor={color2} borderWidth={'1px'} py='2px' px='5px' bg={color1}>
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
    else if (column === 'public_article_status') return(
        <Box boxShadow={`1px 1px 1px rgba(0, 0, 0, 0.15)`} display="inline-flex" fontSize='.9em' py='2px' px='8px' fontWeight={'medium'} color='white'  bg={element === 'draft'?'red.100':'green.100'} borderRadius={'.7rem'}> 
            <Text color={element === 'draft'?'red.600':'green.600'}>{t(element)}</Text>
        </Box>
    )
    else if (column === 'type') return <TypesComponent t={t} type={element}/>
    else if (column === 'created_by' || column === 'updated_by') return <Text fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element === -1 ?'Matilda':element === 0 ? t('NoAgent'):(auth?.authData?.users?.[element as string | number].name || '')}</Text>
    else return ( <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={column === 'title'?'medium':'normal'}  overflow={'hidden'} >{element === ''?'-':element}</Text>)
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)}) 
const dataKeys:string[] = [ 'type', 'language', 'created_at', 'updated_at', 'created_by', 'updated_by']

export const SourceSideBar = ({clientBoxWidth, setClientBoxWidth, sourceData, setSourceData}:{clientBoxWidth:number, setClientBoxWidth:Dispatch<SetStateAction<number>>, sourceData:ContentData | null, setSourceData:Dispatch<SetStateAction<ContentData | null>>}) => {

    const { t } = useTranslation('knowledge')
    const [sectionsExpanded, setSectionsExpanded] = useState<string[]>(['Data', 'Tilda', 'HelpCenter', 'Folder' ])

    const onSectionExpand = (section: string) => {
        setSectionsExpanded((prevSections) => {
          if (prevSections.includes(section))return prevSections.filter((s) => s !== section)
          else return [...prevSections, section]
        })
      }
      
    return (
        <MotionBox width={clientBoxWidth + 'px'}  whiteSpace={'nowrap'} initial={{ width: clientBoxWidth + 'px' }} animate={{ width: clientBoxWidth + 'px' }} exit={{ width: clientBoxWidth + 'px' }} style={{overflow:'hidden'}} transition={{ duration: '.2'}}> 
            <Flex p='2vh' height={'70px'} justifyContent={'space-between'} alignItems={'center'} borderBottomWidth={'1px'} borderBottomColor={'gray.200'}>
                <Text fontSize={'1.5em'} fontWeight={'medium'}>{t('Information')}</Text>
                <IconButton aria-label="close-tab" variant={'common'} bg='transparent' size='sm' icon={<RxCross2 size={'20px'}/>} onClick={() =>setClientBoxWidth(0)}/>
            </Flex>
            <Box p='2vh' height={'100%'} > 

            <CollapsableSection section={'Data'} isExpanded={sectionsExpanded.includes('Data')} onSectionExpand={onSectionExpand}> 
                    {dataKeys.map((showKey, index) => (
                        <Skeleton key={`article-feature-${index}`} isLoaded={sourceData !== null}> 
                            <Flex mt='2vh' key={`article-data-${index}`}>
                                <Text flex='1' fontWeight={'medium'} color='gray.600'>{t(showKey)}</Text>
                                <Box flex='1' maxW={'50%'}> 
                                    {(sourceData !== null)&&  
                                        <Box fontSize={'.9em'}>
                                            <CellStyle column={showKey} element={sourceData?.[showKey as keyof ContentData]}/>
                                        </Box>
                                    }
                                </Box>
                            </Flex>
                        </Skeleton>
                    ))}
            </CollapsableSection>

            <CollapsableSection section={'Tilda'} isExpanded={sectionsExpanded.includes('Tilda')} onSectionExpand={onSectionExpand}> 
                <Flex gap='8px' mt='1vh'  alignItems={'center'}>
                    <Switch isChecked={sourceData?.is_available_to_tilda}  onChange={(e) => setSourceData(prev => ({...prev as ContentData, is_available_to_tilda:e.target.checked}))} />
                    <Text fontWeight={'medium'} fontSize={'.9em'}>{t('IsAvailableTilda')}</Text>
                </Flex>
                <Text mt='.5vh' whiteSpace={'normal'} color={'gray.600'} fontSize={'.8em'}>{t('IsAvailableTildaDes')}</Text>

            </CollapsableSection>

            <CollapsableSection section={'Folder'} isExpanded={sectionsExpanded.includes('Folder')} onSectionExpand={onSectionExpand}> 
                <Flex mt='2vh' bg='brand.gray_2' alignItems={'center'} cursor={'pointer'} borderRadius={'.5rem'} p='10px' gap='10px'>
                    <Icon as={FaFolder}/>
                    <Text>{sourceData?.folder_uuid?sourceData?.folder_uuid:t('NoFolder')}</Text>
                </Flex>
            </CollapsableSection>

            </Box>
        </MotionBox>
)
}
const CollapsableSection = ({ section, isExpanded, onSectionExpand, children}:{section:string, isExpanded:boolean, onSectionExpand:(key:string) => void ,children:ReactNode}) => {

    const { t } = useTranslation('knowledge')
 
    return (
        <Box py='3vh' borderBottomColor={'gray.200'} borderBottomWidth={'1px'}> 
            <Flex cursor={'pointer'} alignItems={'center'} justifyContent={'space-between'} onClick={() => onSectionExpand(section)}>
                <Text fontWeight={'semibold'}  fontSize={'.9em'}>{t(section).toLocaleUpperCase()}</Text>
                <IoIosArrowDown color={'gray.600'} className={isExpanded ? "rotate-icon-up" : "rotate-icon-down"}/>
            </Flex>
            <motion.div initial={false} animate={{height:isExpanded?'auto':0, opacity:isExpanded?1:0 }} exit={{height:isExpanded?0:'auto',  opacity:isExpanded?0:1 }} transition={{duration:.2}} style={{overflow:isExpanded?'visible':'hidden'}}>           
                {children}
            </motion.div>
        </Box>
    )
}
