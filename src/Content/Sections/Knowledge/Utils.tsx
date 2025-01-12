import { useTranslation  } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { Dispatch, SetStateAction, useRef, useState, ReactNode, Fragment, useMemo } from "react"
import { useAuth } from "../../../AuthContext"
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Text, Box, Icon, Flex,Skeleton, Button, Grid, Portal,  chakra, shouldForwardProp, Tooltip, IconButton, Switch } from "@chakra-ui/react"
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { motion, isValidMotionProp } from 'framer-motion'
import "../../Components/styles.css"
//COMPONENTS
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import EditText from "../../Components/Reusable/EditText"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import CustomSelect from "../../Components/Reusable/CustomSelect"
import CollapsableSection from "../../Components/Reusable/CollapsableSection"
//FUNCTIONS
import useOutsideClick from "../../Functions/clickOutside"
import timeAgo from "../../Functions/timeAgo"
import timeStampToDate from "../../Functions/timeStampToString"
//ICONS
import { IconType } from "react-icons"
import { IoBook } from "react-icons/io5"
import { BiWorld } from "react-icons/bi"
import { RxCross2, RxCheck } from "react-icons/rx"
import { FaFolder, FaLock, FaFileLines, FaFilePdf } from "react-icons/fa6"
//TYPING
import { Folder, ContentData, languagesFlags } from "../../Constants/typing" 
 
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
        if (type === 'text') navigate(`/knowledge/snippet/create`)
        else  navigate(`/knowledge/article/create-${type === 'internal_article'?'internal':'public'}`)
    }

    return (<>
        <Box p='15px' > 
            <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('AddContent')}</Text>
        </Box>
        <Box p='20px' bg='brand.gray_2'>
            <Grid  mt='1vh' width={'100%'} gap={'20px'} justifyContent={'space-between'} templateColumns='repeat(3, 1fr)'> 
                {contentList.map((con, index) => ( 
                    <Box onClick={() => onClickNewCreate(con.type)} transition={'box-shadow 0.3s ease-in-out'} key={`select-content-${index}`} _hover={{shadow:'lg'}} cursor={'pointer'} bg='white' p='15px' borderRadius={'.7rem'}>
                        <Box>
                            <Flex display={'inline-flex'} bg='brand.black_button' p='10px' borderRadius={'full'} >
                                <Icon boxSize={'17px'} color='white' as={con.icon}/>
                            </Flex>
                            <Text mt='1vh' fontSize={'1.2em'} fontWeight={'medium'}>{con.title}</Text>
                        </Box>
                        <Text fontSize={'.8em'} mt='1vh' color='gray.600'>{con.description}</Text>
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
    const { getAccessTokenSilently } = useAuth0()

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
        const folderData = await fetchData({endpoint:`${auth.authData.organizationId}/admin/knowledge/folders${currentFolder?`/${currentFolder.uuid}`:''}`,getAccessTokenSilently, method:currentFolder?'put':'post', setWaiting:setWaitingCreate, requestForm:{name:folderName, emoji:folderEmoji, parent_uuid:parentId}, auth, toastMessages:{'works': currentFolder?t('CorrectEditedFolder'): t('CorrectCreatedFolder'), 'failed': currentFolder?t('FailedEditedFolder'):t('FailedtCreatedFolder')}})
        if (folderData?.status === 200) {
            const updatedFolder:Folder = currentFolder
                ? { ...currentFolder, name: folderName, emoji: folderEmoji }
                : { uuid:folderData?.data.uuid || '', name: folderName, emoji: folderEmoji, children:[]}
            onFolderUpdate(type, updatedFolder, parentId)
        }
        setShowCreate(false)
        }

    return(<> 
        <Box p='15px' maxW='450px'> 
            <Text fontWeight={'medium'} fontSize={'1.2em'}>{currentFolder?t('EditFolder'):t('CreateFolder')}</Text>
             <Flex mt='2vh' alignItems={'center'} gap='10px'> 
                <Flex cursor={'pointer'} ref={emojiButtonRef} onClick={() => setEmojiVisible(true)} alignItems={'center'} justifyContent={'center'} width={'32px'} height={'32px'} borderWidth={'1px'} borderColor={'gray.200'} borderRadius={'.5rem'}> 
                    {folderEmoji ? <Text fontSize={'.9em'}>{folderEmoji}</Text>:<Icon boxSize={'.9em'} as={FaFolder}/>}
                </Flex>
                <EditText placeholder={t('FolderName')} hideInput={false} value={folderName} setValue={setFolderName}/>
            </Flex>
     
            <Flex  maxW='450px' mt='2vh' gap='15px' flexDir={'row-reverse'} >
                <Button  size='sm' variant={'main'} isDisabled={folderName === ''} onClick={createFolder}>{waitingCreate?<LoadingIconButton/>:currentFolder?t('EditFolder'):t('CreateFolder')}</Button>
                <Button  size='sm' variant={'common'} onClick={() => {setShowCreate(false)}}>{t('Cancel')}</Button>
            </Flex>
        </Box>
        {emojiVisible && 
        <Portal> 
            <Box position={'fixed'} zIndex={1000000} pointerEvents={emojiVisible?'auto':'none'} transition='opacity 0.2s ease-in-out' opacity={emojiVisible ? 1:0} top={`${(emojiButtonRef?.current?.getBoundingClientRect().top || 0)}px`} right={`${window.innerWidth - (emojiButtonRef?.current?.getBoundingClientRect().left || 0) + 5}px`}  ref={emojiBoxRef}> 
            <EmojiPicker open={emojiVisible}
             onEmojiClick={handleEmojiClick}  allowExpandReactions={false}/></Box>
        </Portal>}
    </>)
}

//SIDE BAR OF THE SOURCES
const TypesComponent = ({t,  type }:{t:any, type:'internal_article' | 'public_article' | 'folder' | 'pdf' | 'snippet' | 'subpage'  | 'website'}) => {
    
    const getAlertDetails = (type:'internal_article' | 'public_article' | 'folder' | 'pdf' | 'snippet' | 'subpage' | 'website') => {
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
            case 'subpage':
            case 'website':
                return { color1: 'brand.gray_1', color2:'gray.300', icon: BiWorld, label: t('Web')  }
        }
    }
    const { color1, color2, icon, label } = getAlertDetails(type)
    return (
        <Flex display={'inline-flex'}   gap='10px' alignItems="center" borderRadius={'1rem'} borderColor={color2} borderWidth={'1px'} py='2px' px='5px' bg={color1}>
            <Icon as={icon} />
            <Text  fontSize={'.9em'} >{label}</Text>
        </Flex>
    )
} 

//GET THE CELL STYLE
export const CellStyle = ({ column, element }:{column:string, element:any}) => {
     
    //TRANSLATION
    const { t } = useTranslation('knowledge')
    const t_formats = useTranslation('formats').t
    const auth = useAuth()

    if (column === 'created_at' ||  column === 'updated_at' )  
    return(
        <Tooltip label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='.8em' p='6px'> 
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} fontSize={'.9em'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    else if (column === 'tags' || column === 'public_article_help_center_collections') {
        return(<> 
        <Flex minH={'35px'} alignItems={'center'}> 
        {element ? 
            <Flex gap='5px' flexWrap={'wrap'}>
                {element.map((label:string, index:number) => (
                    <Flex bg='brand.gray_1' p='4px' borderRadius={'.5rem'} fontSize={'.8em'} key={`tags-label-${index}`}>
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
            <Text   fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][0]:'No detectado'}</Text>
            <Text  fontSize={'.9em'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][1]:'🏴󠁥󠁳󠁣󠁴󠁿'}</Text>
        </Flex>)
    }   
    else if (column === 'public_article_status') return(
        <Box boxShadow={`1px 1px 1px rgba(0, 0, 0, 0.15)`} display="inline-flex" fontSize='.9em' py='2px' px='8px' fontWeight={'medium'} color='white'  bg={element === 'draft'?'red.100':'green.100'} borderRadius={'.7rem'}> 
            <Text  color={element === 'draft'?'red.600':'green.600'}>{t(element)}</Text>
        </Box>
    )
    else if (column === 'type') return <TypesComponent t={t} type={element}/>
    else if (column === 'created_by' || column === 'updated_by') return <Text   fontSize={'.9em'} fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element === -1 ?'Matilda':element === 0 ? t('NoAgent'):(auth?.authData?.users?.[element as string | number].name || '')}</Text>
    else return ( <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} fontSize={'.9em'} fontWeight={column === 'title'?'medium':'normal'}  overflow={'hidden'} >{element === ''?'-':element}</Text>)
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)}) 
const dataKeys:string[] = [ 'type', 'language', 'created_at', 'updated_at', 'created_by', 'updated_by']

export const SourceSideBar = ({clientBoxWidth, setClientBoxWidth, sourceData, setSourceData, folders}:{clientBoxWidth:number, setClientBoxWidth:Dispatch<SetStateAction<number>>, sourceData:ContentData | null, setSourceData:Dispatch<SetStateAction<ContentData | null>>, folders:Folder[] }) => {


    const [showEditFolder, setShowEditFolder] = useState<boolean>(false)


    const MoveSection = ({folder, level, selectedFolder, setSelectedFolder}:{folder:Folder, level:number, selectedFolder:string, setSelectedFolder:Dispatch<SetStateAction<string>>,  }) => {

        return (<> 
            <Flex  gap="10px" justifyContent={'space-between'} p="10px" pl={`${(level + 1) * 20}px`} bg={selectedFolder === folder.uuid ?'blue.100':''} cursor={folder.disabled?'not-allowed':'pointer'}  color={folder.disabled?'gray.300':"black" } onClick={() => {if (!folder.disabled) setSelectedFolder(folder.uuid)}}  alignItems="center" borderRadius=".5rem" _hover={{bg:selectedFolder === folder.uuid ?'blue.100':'brand.gray_2'}} >
                <Flex flex='1' gap="10px" alignContent={'center'}> 
                    {folder.emoji ? <Text>{folder.emoji}</Text>:<Icon boxSize="16px" as={FaFolder} />}
                    <Text  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{folder.name}</Text>
                </Flex>
            </Flex>
               {folder.children &&
                folder.children.map((childFolder) => (
                    <MoveSection key={childFolder.uuid} folder={childFolder} selectedFolder={selectedFolder} setSelectedFolder={setSelectedFolder} level={level + 1}  />
                ))}
             </>
        )
    }

    const { t } = useTranslation('knowledge')
    const [sectionsExpanded, setSectionsExpanded] = useState<string[]>(['Data', 'Tilda', 'HelpCenter', 'Folder' ])

    const onSectionExpand = (section: string) => {
        setSectionsExpanded((prevSections) => {
          if (prevSections.includes(section))return prevSections.filter((s) => s !== section)
          else return [...prevSections, section]
        })
      }
      

    //CREATE AND EDIT FOLDERS
    const MoveFolder = () => {

        const [selectedFolder, setSelectedFolder] = useState<string>(sourceData?.folder_uuid || '')
      
        return(<> 
            <Box p='15px' maxW='450px'> 
                <Text mb='2vh' fontWeight={'medium'} fontSize={'1.2em'}>{t('MoveFolder')}</Text>
                 {folders.map((folder, index) => (
                    <Fragment key={`settings-section-${folder.uuid}`}>
                        <MoveSection folder={folder}  level={0} selectedFolder={selectedFolder} setSelectedFolder={setSelectedFolder}/> 
                    </Fragment>
                ))}
          
                <Flex  maxW='450px'  mt='2vh' gap='15px' flexDir={'row-reverse'} >
                    <Button  size='sm' variant={'main'} isDisabled={selectedFolder === ''} onClick={() => {setShowEditFolder(false);setSourceData(prev => ({...prev as ContentData, folder_uuid:selectedFolder}))}}>{t('MoveToFolder')}</Button>
                    <Button  size='sm' variant={'common'} onClick={() => {setShowEditFolder(false)}}>{t('Cancel')}</Button>
                </Flex>
            </Box>
        </>)
    }
     //MOVE BOX
     const MoveBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowEditFolder}> 
            <MoveFolder/>
        </ConfirmBox>
    ), [showEditFolder])

    return (
        <>
            {showEditFolder && MoveBox}

            <MotionBox overflowX={'hidden'} width={clientBoxWidth + 'px'}  whiteSpace={'nowrap'} initial={{ width: clientBoxWidth + 'px' }} animate={{ width: clientBoxWidth + 'px' }} exit={{ width: clientBoxWidth + 'px' }} style={{overflow:'hidden'}} transition={{ duration: '.2'}}> 
                <Flex p='2vh' height={'60px'} justifyContent={'space-between'} alignItems={'center'} borderBottomWidth={'1px'} borderBottomColor={'gray.200'}>
                    <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('Information')}</Text>
                    <IconButton aria-label="close-tab" variant={'common'} bg='transparent' size='sm' icon={<RxCross2 size={'20px'}/>} onClick={() =>setClientBoxWidth(0)}/>
                </Flex>
                <Box p='2vh' height={'100%'} w='calc(400px)'> 

                    <CollapsableSection section={'Data'} sectionsMap={{'Data':t('Data'), 'Tilda':t('Tilda'), 'HelpCenter':t('HelpCenter'), 'Folder':t('Folder') }} isExpanded={sectionsExpanded.includes('Data')} onSectionExpand={onSectionExpand}> 
                            {dataKeys.map((showKey, index) => (
                                <Skeleton key={`article-feature-${index}`} isLoaded={sourceData !== null}> 
                                    <Flex mt='2vh' key={`article-data-${index}`}>
                                        <Text flex='1' fontWeight={'medium'} fontSize={'.8em'} color='gray.600'>{t(showKey)}</Text>
                                        <Box flex='1' maxW={'50%'}> 
                                            {(sourceData !== null)&& <> 
                                                {showKey === 'language' ? 
                                                <CustomSelect hide={false} options={Object.keys(languagesFlags)} iconsMap={languagesFlags} selectedItem={sourceData?.[showKey as keyof ContentData]} setSelectedItem={(value) => setSourceData(prev => ({...prev as ContentData, language:value }) )}/>
                                                : 
                                                <Box >
                                                    <CellStyle column={showKey} element={sourceData?.[showKey as keyof ContentData]}/>
                                                </Box>
                                                }</>
                                            }
                                        </Box>
                                    </Flex>
                                </Skeleton>
                            ))}
                    </CollapsableSection>

                    <CollapsableSection mt='3vh' section={'Tilda'} sectionsMap={{'Data':t('Data'), 'Tilda':t('Tilda'), 'HelpCenter':t('HelpCenter'), 'Folder':t('Folder') }}  isExpanded={sectionsExpanded.includes('Tilda')} onSectionExpand={onSectionExpand}> 
                        <Flex gap='8px' mt='1vh'  alignItems={'center'}>
                            <Switch isChecked={sourceData?.is_available_to_tilda}  onChange={(e) => setSourceData(prev => ({...prev as ContentData, is_available_to_tilda:e.target.checked}))} />
                            <Text fontWeight={'medium'} fontSize={'.9em'}>{t('IsAvailableTilda')}</Text>
                        </Flex>
                        <Text mt='.5vh' whiteSpace={'normal'} color={'gray.600'} fontSize={'.8em'}>{t('IsAvailableTildaDes')}</Text>

                    </CollapsableSection>

                    <CollapsableSection  mt='3vh'  sectionsMap={{'Data':t('Data'), 'Tilda':t('Tilda'), 'HelpCenter':t('HelpCenter'), 'Folder':t('Folder') }}  section={'Folder'} isExpanded={sectionsExpanded.includes('Folder')} onSectionExpand={onSectionExpand}> 
                        <Flex mt='2vh' bg='brand.gray_2'_hover={{color:'brand.text_blue', bg:'brand.gray'}}  alignItems={'center'} cursor={'pointer'} borderRadius={'.5rem'} p='10px' gap='10px' onClick={() => setShowEditFolder(true)}>
                            <Icon as={FaFolder}/>
                            <Text fontSize={'.9em'} fontWeight={'medium'}>{sourceData?.folder_uuid?sourceData?.folder_uuid:t('NoFolder')}</Text>
                        </Flex>
                    </CollapsableSection>

                </Box>
            </MotionBox>
        </>)
    }
 