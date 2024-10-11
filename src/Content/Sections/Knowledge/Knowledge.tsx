/*
    SETITNGS SECTION 
*/

//REACT
import  { Suspense, useEffect, useState, useRef, Fragment, lazy, useMemo, Dispatch, SetStateAction } from "react"
import { Routes, Route,  useNavigate, useLocation } from "react-router-dom" 
import { useAuth } from "../../../AuthContext"
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Box, Flex, Text, Icon, Skeleton, Button, Portal, chakra, shouldForwardProp } from '@chakra-ui/react'
import '../../Components/styles.css'
import { motion, isValidMotionProp } from 'framer-motion'
//COMPONENTS
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import { CreateFolder } from "./Utils"
//FUNCTIONS
import useOutsideClick from "../../Functions/clickOutside"
import parseMessageToBold from "../../Functions/parseToBold"
//ICONS
import { IoIosArrowDown } from "react-icons/io"
import { BsFillLayersFill, BsThreeDots, BsFillFolderSymlinkFill, BsTrash3Fill } from "react-icons/bs"
import { FaFolder, FaBox, FaPlus } from "react-icons/fa6"
import { FiEdit } from "react-icons/fi"
//TYPING
import { ContentData, Folder } from "../../Constants/typing"
//SECTIONS
const Content = lazy(() => import('./Content'))
const Fonts = lazy(() => import('./Fonts'))
const Article = lazy(() => import('./Article'))
const Website = lazy(() => import('./Website'))
const TextSection = lazy(() => import('./TextSection'))
const FoldeSection = lazy(() => import('./Folder'))
const Pdf = lazy(() => import('./Pdf'))


type boxPosition = {top?:number, bottom?:number, left:number, id:string} | null

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})


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
const Section = ({ folder, level, onFolderUpdate, handleFoldersDisabled}: { folder: Folder; level: number, onFolderUpdate:(type: 'edit' | 'add' | 'delete' | 'move', newFolderData: Folder, parentId: string | null) => void, handleFoldersDisabled:(folder:Folder) => Folder[]}) => {
    
    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('knowledge')
    const navigate = useNavigate()
    const selectedSection = useLocation().pathname.split('/')[3]
    
    //SETTINGS BUTTON REF
    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null) 
    useOutsideClick({ref1:boxRef, onOutsideClick:(value:boolean) => {setSettingsBoxPosition(null)}})

    //IS HOVERING
    const [isHovering, setIsHovering] = useState<boolean>(false)
    const [settingsBoxPosition, setSettingsBoxPosition] = useState<boxPosition>(null)

    //ACTIONS LIST
    const [showCreate, setShowCreate] = useState<boolean>(false)
    const [showEdit, setShowEdit] = useState<boolean>(false)
    const [showMove, setShowMove] = useState<boolean>(false)
    const [showDelete, setShowDelete] = useState<boolean>(false)


    //SHOW FOLDERS
    const [showFolders, setShowFolders] = useState<boolean>(false)
    
    //NAVIGATE TO A FOLDER
    const navigateToSection = (section: string) => {
        navigate(`folder/${section}`)
        localStorage.setItem('currentSettingsSection', section)
    }

    //DETERMINE THE TOOLS BOX POSOTION
    const determineBoxPosition = (id:string) => {
        const boxLeft = (buttonRef.current?.getBoundingClientRect().left || 0) 
        const isTop = (buttonRef.current?.getBoundingClientRect().bottom || 0) > window.innerHeight/2 
        if (!isTop) setSettingsBoxPosition({top:(buttonRef.current?.getBoundingClientRect().bottom || 0) + 5, left:boxLeft, id})
        else setSettingsBoxPosition({bottom:window.innerHeight - (buttonRef.current?.getBoundingClientRect().top || 0) + 5, left:boxLeft, id})
    }

    //DELETE A FOLDER
    const DeleteFolder= () => {
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

        //FUNCTION FOR CREATE A NEW BUSINESS
        const deleteFolder= async () => {
            const businessData = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/knowledge/folders/${folder.uuid}`, method:'delete', setWaiting:setWaitingDelete, auth, toastMessages:{'works': t('CorrectDeletedFolder'), 'failed':t('FailedDeletedFolder')}})
            if (businessData?.status === 200) onFolderUpdate('delete', folder, null)
            setShowCreate(false)
        }
        return(<> 
              <Box p='20px'> 
                    <Text fontWeight={'medium'} fontSize={'1.2em'}>{parseMessageToBold(t('DeleteFolderAnswer', {name:folder.name}))}</Text>
                    <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                    <Text >{parseMessageToBold(t('DeleteFolderWarning'))}</Text>
                </Box>
                <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                    <Button  size='sm' variant='delete' onClick={deleteFolder}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                    <Button size='sm'  variant={'common'} onClick={() => setShowDelete(false)}>{t('Cancel')}</Button>
                </Flex>
        </>)
    }

    //CREATE AND EDIT FOLDERS
    const MoveFolder = () => {

        const [selectedFolder, setSelectedFolder] = useState<string>('')
        const [waitingCreate, setWaitingCreate] = useState<boolean>(false)

        //FUNCTION FOR CREATE A NEW BUSINESS
        const createFolder= async () => {
            const businessData = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/knowledge/folders`, method:'post', setWaiting:setWaitingCreate, requestForm:{name:folder.name, parent_folders:[]}, auth, toastMessages:{'works': t('CorrectMovedFolder'), 'failed':t('FailedMovedFolder')}})
            if (businessData?.status === 200) onFolderUpdate('move', folder,selectedFolder )
            setShowCreate(false)
        }
        return(<> 
            <Box p='20px' maxW='450px'> 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('MoveFolderName', {name:folder.name})}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                {handleFoldersDisabled(folder).map((folder, index) => (
                    <Fragment key={`settings-section-${folder.uuid}`}>
                        <MoveSection folder={folder}  level={0} selectedFolder={selectedFolder} setSelectedFolder={setSelectedFolder}/> 
                    </Fragment>
                ))}
            </Box>
            <Flex  maxW='450px' p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                <Button  size='sm' variant={'main'} isDisabled={selectedFolder === ''} onClick={createFolder}>{waitingCreate?<LoadingIconButton/>:t('MoveFolder')}</Button>
                <Button  size='sm' variant={'common'} onClick={() => {setShowCreate(false); setShowEdit(false)}}>{t('Cancel')}</Button>
            </Flex>
        </>)
    }

    //CREATE BOX
    const CreateBox = useMemo(() => (
        <ConfirmBox isSectionWithoutHeader setShowBox={setShowCreate}> 
            <CreateFolder currentFolder={null} type='add' parentId={folder.uuid} setShowCreate={setShowCreate} onFolderUpdate={onFolderUpdate}/>
        </ConfirmBox>
    ), [showCreate])

    //EDIT BOX
    const EditBox = useMemo(() => (
        <ConfirmBox isSectionWithoutHeader setShowBox={setShowEdit}> 
            <CreateFolder currentFolder={folder}  type='edit' parentId={folder.uuid}  setShowCreate={setShowEdit} onFolderUpdate={onFolderUpdate}/>
        </ConfirmBox>
    ), [showEdit])

    //EDIT BOX
    const DeleteBox = useMemo(() => (
        <ConfirmBox isSectionWithoutHeader setShowBox={setShowDelete}> 
            <DeleteFolder/>
        </ConfirmBox>
    ), [showDelete])

    //MOVE BOX
    const MoveBox = useMemo(() => (
        <ConfirmBox isSectionWithoutHeader setShowBox={setShowMove}> 
            <MoveFolder/>
        </ConfirmBox>
    ), [showMove])

    return (
      <>
      {showCreate && CreateBox }
      {showEdit && EditBox}
      {showDelete && DeleteBox}
      {showMove && MoveBox}

        <Flex  gap="10px" justifyContent={'space-between'} p="5px" pl={`${(level + 1) * 20}px`} _hover={{ color: "black" }} color={selectedSection === folder.uuid ? "black" : "gray.600"} bg={selectedSection === folder.uuid ?'white':'transparent'}  fontWeight={selectedSection === folder.uuid ? "medium" : "normal"} onClick={() => { navigateToSection(`${folder.uuid}`)}} cursor="pointer" alignItems="center" borderRadius=".5rem" onMouseLeave={() => setIsHovering(false)} onMouseEnter={() => setIsHovering(true)}>
            <Flex flex='1' gap="10px" alignContent={'center'}> 
                {folder.emoji ? <Text>{folder.emoji}</Text>:<Icon boxSize="16px" as={FaFolder} />}
                <Text  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{folder.name}</Text>
            </Flex>

       
            <Box width={'15px'} ref={buttonRef}> 
                {(isHovering || (settingsBoxPosition?.id === folder.uuid)) && <BsThreeDots size='15px' onClick={(e) => {e.stopPropagation();determineBoxPosition(folder.uuid) }}/>}
            </Box>
            {folder.children.length > 0 && 
            <Box width={'15px'}> 
                <IoIosArrowDown onClick={() => setShowFolders(!showFolders)} className={showFolders ? "rotate-icon-up" : "rotate-icon-down"}/>
            </Box>
            }
        </Flex>
        <motion.div initial={{height:showFolders?'auto':0}} animate={{height:showFolders?0:'auto' }} exit={{height:showFolders?'auto':0 }} transition={{duration:.2}} style={{overflow:'hidden', padding:'5px', maxHeight:1000}}>           
            {folder.children &&
            folder.children.map((childFolder) => (
                <Section key={childFolder.uuid} folder={childFolder} level={level + 1} onFolderUpdate={onFolderUpdate} handleFoldersDisabled={handleFoldersDisabled}/>
            ))}
        </motion.div>

        {settingsBoxPosition &&  
        <Portal> 
            <MotionBox ref={boxRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                style={{ transformOrigin: settingsBoxPosition.top ? 'top left':'bottom left' }} left={settingsBoxPosition.left}  top={settingsBoxPosition.top || undefined}  bottom={settingsBoxPosition.bottom ||undefined} position='absolute' bg='white' p='8px'  zIndex={1000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='gray.200' borderWidth='1px' borderRadius='.7rem'>

                <Flex px='15px' borderRadius='.5rem'  onClick={() => {setShowCreate(true); setSettingsBoxPosition(null)}} py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'brand.gray_2'}}>
                    <Icon as={FaPlus}/>
                    <Text whiteSpace={'nowrap'}>{t('CreateSubFolder')}</Text>
                </Flex>
                <Flex px='15px'  borderRadius='.5rem'   onClick={() => {setShowEdit(true); setSettingsBoxPosition(null)}} py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'brand.gray_2'}}>
                    <Icon as={FiEdit}/>
                    <Text whiteSpace={'nowrap'}>{t('EditFolder')}</Text>
                </Flex>
                <Flex px='15px' borderRadius='.5rem' onClick={() => {setShowMove(true);setSettingsBoxPosition(null)}} py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'brand.gray_2'}}>
                    <Icon as={BsFillFolderSymlinkFill}/>
                    <Text whiteSpace={'nowrap'}>{t('MoveFolder')}</Text>
                </Flex>
                <Flex  px='15px' borderRadius='.5rem'  color='red' py='10px'cursor={'pointer'} onClick={() => {setShowDelete(true);setSettingsBoxPosition(null)}}gap='10px' alignItems={'center'} _hover={{bg:'red.50'}}>
                    <Icon as={BsTrash3Fill}/>
                    <Text whiteSpace={'nowrap'}>{t('DeleteFolder')}</Text>
                </Flex>

            </MotionBox >
        </Portal>}
      </>
    )
  }

function Knowledege () {

    //CONSTANTS
    const { t } = useTranslation('knowledge')
    const auth = useAuth()
    const navigate = useNavigate()
    const location = useLocation().pathname

    //SCROLL REF 
    const scrollRef = useRef<HTMLDivElement>(null)

    //SHOW FOLDERS
    const [hoverMain, setHoverMain] = useState<boolean>(false)
    const [showCreate, setShowCreate] = useState<boolean>(false)
    const [showFolders, setShowFolders] = useState<boolean>(false)
    
    //FOLDERS STRUCTURE
    const [folders, setFolders] = useState<Folder[]>([])
    

    //FOLDERS STRUCTURE
    const [contentData, setContentData] = useState<ContentData[] | null>([])

    useEffect(() => {        
        document.title = `${t('Knowledge')} - ${auth.authData.organizationId} - Matil`
        localStorage.setItem('currentSection', 'knowledge')
        navigate(localStorage.getItem('currentSectionContent') || 'fonts')

        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/knowledge/folders`, auth, setValue:setFolders})

        }
        fetchInitialData()
    }, [])

      
    const updateFolders = (type: 'edit' | 'add' | 'delete' | 'move', folders: Folder[], updatedFolder: Folder, parentId: string | null  ): Folder[] => { 
        // Caso 1: Si estamos añadiendo una nueva carpeta
        if (type === 'add') {
            if (parentId !== null) {
            return folders.map(folder => {
                if (folder.uuid === parentId) return {...folder, children: [...folder.children, updatedFolder]} 
                return {...folder, children: updateFolders(type, folder.children, updatedFolder, parentId)}
            })
            }
            return [...folders, updatedFolder]
        }

        // Caso 2: Si estamos editando una carpeta existente
        if (type === 'edit') {
            return folders.map(folder => {
            if (folder.uuid === updatedFolder.uuid) return { ...updatedFolder }
            return {...folder,children: updateFolders(type, folder.children, updatedFolder, parentId)}
            })
        }

        // Caso 3: Eliminar carpeta
        if (type === 'delete') return folders.filter(folder => folder.uuid !== updatedFolder.uuid).map(folder => ({...folder,children: updateFolders(type, folder.children, updatedFolder, parentId)}))    
        
        
        if (type === 'move') {
            let updatedFolders = folders
            updatedFolders = updatedFolders.map(folder => {
              if (folder.children) {
                const hasChild = folder.children.some(child => child.uuid === updatedFolder.uuid)
                if (hasChild) return { ...folder,  children: folder.children.filter(child => child.uuid !== updatedFolder.uuid) }
              }
              return folder
            })
        
            // 2. Añadir la carpeta a su nueva ubicación
            if (parentId !== null) {
              return updatedFolders.map(folder => {
                if (folder.uuid === parentId) return { ...folder, children: [...folder.children, updatedFolder] }
                return { ...folder, children: updateFolders(type, folder.children, updatedFolder, parentId) }
              })
            }
            return [...updatedFolders, updatedFolder]
          }

          
        return folders
    }
    const handleFolderUpdate = (type: 'edit' | 'add' | 'delete' | 'move', newFolderData: Folder, parentId: string | null) => {setFolders(prevFolders => updateFolders(type, prevFolders, newFolderData, parentId))}

    const getFoldersWithDisabled = (folders: Folder[], folderToMove: Folder): Folder[] => {
        const markDisabledFolders = (foldersList: Folder[], folderToExclude: Folder): Folder[] => {
          return foldersList.map(folder => {
            const isDisabled = folder.uuid === folderToExclude.uuid || folder.children.some(child => child.uuid === folderToExclude.uuid);
            return {...folder, disabled: isDisabled, children: markDisabledFolders(folder.children, folderToExclude)}
          })
        }
        return markDisabledFolders(folders, folderToMove);
      }
    const handleFoldersDisabled = (folderToMove: Folder) => {return getFoldersWithDisabled(folders, folderToMove)}

    //CREATE BOX
    const CreateBox = useMemo(() => (
        <ConfirmBox isSectionWithoutHeader setShowBox={setShowCreate}> 
            <CreateFolder currentFolder={null} setShowCreate={setShowCreate} type={'add'} parentId={null} onFolderUpdate={handleFolderUpdate}/>
        </ConfirmBox>
    ), [showCreate])

    return( <>
    {showCreate && CreateBox}
 
    <Flex>  
        <Flex flexDir="column" height={'100vh'} py="5vh" px='15px'  bg='#f1f1f1' width='280px' borderRightWidth="1px" borderRightColor="gray.200">
            <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('Knowledge')}</Text>
            <Box height={'1px'} width={'100%'} bg='gray.300' mt='2vh' mb='2vh'/>

            <Flex mt="1vh" gap="10px" p="5px"  _hover={{ color: "black" }} color={location.split('/')[2] === 'fonts' ? "black" : "gray.600"}  bg={location.split('/')[2] === 'fonts' ?'white':'transparent'} fontWeight={location.split('/')[2] === 'fonts'? "medium" : "normal"} onClick={() => navigate('fonts')} cursor="pointer" alignItems="center" borderRadius=".5rem">
                <Icon boxSize="16px" as={FaBox} />
                <Text>{t('Fonts')}</Text>
            </Flex>
            <Flex onMouseEnter={() => setHoverMain(true)}  onMouseLeave={() => setHoverMain(false)} mt="1vh"  p="5px"  cursor="pointer" alignItems="center" borderRadius=".5rem" justifyContent={'space-between'}   _hover={{ color: "black" }} bg={location.split('/')[2] === 'content' ?'white':'transparent'} color={location.split('/')[2] === 'content' ? "black" : "gray.600"} fontWeight={location.split('/')[2] === 'fonts'? "medium" : "normal"} onClick={() => navigate('content')}>
                <Flex gap="10px" alignItems={'center'}> 
                    <Icon boxSize="16px" as={BsFillLayersFill} />
                    <Text>{t('Content')}</Text>
                </Flex>
                <Flex gap="10px" alignContent={'center'}> 
                    {hoverMain && <FaPlus onClick={() => setShowCreate(true)} />}
                    <IoIosArrowDown onClick={() => setShowFolders(!showFolders)} className={showFolders ? "rotate-icon-up" : "rotate-icon-down"}/>
                </Flex>

            </Flex>

            <motion.div initial={{height:showFolders?'auto':0}} animate={{height:showFolders?0:'auto' }} exit={{height:showFolders?'auto':0 }} transition={{duration:.2}} style={{overflow:'hidden', maxHeight:1000}}>           
                <Skeleton isLoaded={folders !== null}>
                    {folders.map((folder, index) => (
                    <Fragment key={`settings-section-${folder.uuid}`}>
                        <Section folder={folder} level={0} onFolderUpdate={handleFolderUpdate} handleFoldersDisabled={handleFoldersDisabled}/> 
                    </Fragment>
                    ))}
                </Skeleton>
            </motion.div>
        </Flex>

        <Box width={'calc(100vw - 335px)'} position={'relative'} bg='white' px='2vw' height={'100vh'} ref={scrollRef}>
            <Flex height={'100vh'}flexDir={'column'} justifyContent={'space-between'} py='3vh'> 
                <Suspense fallback={<></>}>    
                    <Routes >
                        <Route path="/content" element={<Content handleFolderUpdate={handleFolderUpdate} contentData={contentData} setContentData={setContentData}/>} />
                        <Route path="/fonts" element={<Fonts contentData={contentData} setContentData={setContentData}/>} />
                        <Route path="/article/*" element={<Article />} />
                        <Route path="/folder/*" element={<FoldeSection handleFolderUpdate={handleFolderUpdate} />}  />
                        <Route path="/website/*" element={<Website/>} />
                        <Route path="/pdf/*" element={<Pdf/>} />
                        <Route path="/text/*" element={<TextSection/>} />
                    </Routes>
                </Suspense>
            </Flex>   
        </Box>
        
    </Flex>
    </>)
}

export default Knowledege