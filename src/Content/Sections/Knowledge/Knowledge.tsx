/*
    SETITNGS SECTION 
*/

//REACT
import  { Suspense, useEffect, useState, useRef, Fragment, lazy, useMemo } from "react"
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
import { ContentData } from "../../Constants/typing"
import EditText from "../../Components/Reusable/EditText"

//SECTIONS
const Content = lazy(() => import('./Content'))
const Fonts = lazy(() => import('./Fonts'))
const Article = lazy(() => import('./Article'))
const Website = lazy(() => import('./Website'))
const TextSection = lazy(() => import('./TextSection'))
const Folder = lazy(() => import('./Folder'))



 
type boxPosition = {top?:number, bottom?:number, left:number, id:number} | null
interface Folder {
    id: number
    name: string
    children: Folder[]
}


//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})


const Section = ({ folder, level }: { folder: Folder; level: number }) => {
    
    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('knowledge')
    const navigate = useNavigate()
    const selectedSection = parseInt(useLocation().pathname.split('/')[3])
    
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
    const determineBoxPosition = (id:number) => {
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
            const businessData = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/knowledge/folders`, method:'post', setWaiting:setWaitingDelete, requestForm:{folder  :[]}, auth, toastMessages:{'works': t('CorrectCreatedFolder'), 'failed':t('FailedtCreatedFolder')}})
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
        const [waitingCreate, setWaitingCreate] = useState<boolean>(false)

        //FUNCTION FOR CREATE A NEW BUSINESS
        const createFolder= async () => {
            const businessData = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/knowledge/folders`, method:'post', setWaiting:setWaitingCreate, requestForm:{name:folder.name, parent_folders:[]}, auth, toastMessages:{'works': t('CorrectCreatedFolder'), 'failed':t('FailedtCreatedFolder')}})
            setShowCreate(false)
        }
        return(<> 
            <Box p='20px' maxW='450px'> 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('MoveFolder')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Flex alignItems={'center'} gap='10px'> 
                    <Icon boxSize={'20px'} as={FaFolder}/>
                </Flex>
            </Box>
            <Flex  maxW='450px' p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                <Button  size='sm' variant={'main'}  onClick={createFolder}>{waitingCreate?<LoadingIconButton/>:t('MoveFolder')}</Button>
                <Button  size='sm' variant={'common'} onClick={() => {setShowCreate(false); setShowEdit(false)}}>{t('Cancel')}</Button>
            </Flex>
        </>)
    }
    
    //CREATE BOX
    const CreateBox = useMemo(() => (
        <ConfirmBox isSectionWithoutHeader setShowBox={setShowCreate}> 
            <CreateFolder currentFolder={null} setShowCreate={setShowCreate}/>
        </ConfirmBox>
    ), [showCreate])

    //EDIT BOX
    const EditBox = useMemo(() => (
        <ConfirmBox isSectionWithoutHeader setShowBox={setShowEdit}> 
            <CreateFolder currentFolder={folder} setShowCreate={setShowCreate}/>
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


        <Flex  gap="10px" justifyContent={'space-between'} p="5px" pl={`${(level + 1) * 20}px`} _hover={{ color: "black" }} color={selectedSection === folder.id ? "black" : "gray.600"} bg={selectedSection === folder.id ?'white':'transparent'}  fontWeight={selectedSection === folder.id ? "medium" : "normal"} onClick={() => { navigateToSection(`${folder.id}`)}} cursor="pointer" alignItems="center" borderRadius=".5rem" onMouseLeave={() => setIsHovering(false)} onMouseEnter={() => setIsHovering(true)}>
            <Flex flex='1' gap="10px" alignContent={'center'}> 
                <Icon boxSize="16px" as={FaFolder} />
                <Text  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{folder.name}</Text>
            </Flex>

            <Box width={'15px'} ref={buttonRef}> 
                {(isHovering || (settingsBoxPosition?.id === folder.id)) && <BsThreeDots size='15px' onClick={(e) => {e.stopPropagation();determineBoxPosition(folder.id) }}/>}
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
                <Section key={childFolder.id} folder={childFolder} level={level + 1} />
            ))}
        </motion.div>

        {settingsBoxPosition &&  
        <Portal> 
            <MotionBox ref={boxRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                style={{ transformOrigin: settingsBoxPosition.top ? 'top left':'bottom left' }} left={settingsBoxPosition.left}  top={settingsBoxPosition.top || undefined}  bottom={settingsBoxPosition.bottom ||undefined} position='absolute' bg='white' p='8px'  zIndex={1000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='gray.200' borderWidth='1px' borderRadius='.7rem'>

                <Flex px='15px' borderRadius='.5rem'  onClick={() => setShowCreate(true)} py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'brand.gray_2'}}>
                    <Icon as={FaPlus}/>
                    <Text whiteSpace={'nowrap'}>{t('CreateSubFolder')}</Text>
                </Flex>
                <Flex px='15px'  borderRadius='.5rem'   onClick={() => setShowEdit(true)} py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'brand.gray_2'}}>
                    <Icon as={FiEdit}/>
                    <Text whiteSpace={'nowrap'}>{t('EditFolder')}</Text>
                </Flex>
                <Flex px='15px' borderRadius='.5rem' onClick={() => setShowMove(true)} py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'brand.gray_2'}}>
                    <Icon as={BsFillFolderSymlinkFill}/>
                    <Text whiteSpace={'nowrap'}>{t('MoveFolder')}</Text>
                </Flex>
                <Flex  px='15px' borderRadius='.5rem'  color='red' py='10px'cursor={'pointer'} onClick={() => setShowDelete(true)}gap='10px' alignItems={'center'} _hover={{bg:'red.50'}}>
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
            const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/knowledge`, auth, setValue:setFolders})
            if (response?.status === 200 ) console.log('iebf')
            else setFolders([
                {
                  "id":0,
                  "name":"Carpeta 1",
                  "children":[
                    { 
                    "id":1,
                    "name":"Carpeta 1.1",
                    "children":[]}
                  ]
                },
                {
                  "id":2,
                  "name":"Carpeta 2",
                  "children":[
                    { 
                      "id":3,
                      "name":"Carpeta 2.1",
                      "children":[]
                    },
                    { 
                      "id":4,
                      "name":"Carpeta 2.2",
                      "children":[
                        { 
                          "id":5,
                          "name":"Carpeta 2.1.1",
                          "children":[]
                        },
                      ]
                    },
                  ]
                },
              ])   
        }
        fetchInitialData()
    }, [])
   
 

    //CREATE BOX
    const CreateBox = useMemo(() => (
        <ConfirmBox isSectionWithoutHeader setShowBox={setShowCreate}> 
            <CreateFolder setShowCreate={setShowCreate} currentFolder={null}/>
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
                    <Fragment key={`settings-section-${folder.id}`}>
                        <Section folder={folder} level={0} /> 
                    </Fragment>
                    ))}
                </Skeleton>
            </motion.div>
        </Flex>

        <Box width={'calc(100vw - 335px)'} position={'relative'} bg='white' px='2vw' height={'100vh'} ref={scrollRef}>
            <Flex height={'100vh'}flexDir={'column'} justifyContent={'space-between'} py='3vh'> 
                <Suspense fallback={<></>}>    
                    <Routes >
                        <Route path="/content" element={<Content contentData={contentData} setContentData={setContentData}/>} />
                        <Route path="/fonts" element={<Fonts contentData={contentData} setContentData={setContentData}/>} />
                        <Route path="/article/*" element={<Article />} />
                        <Route path="/folder/*" element={<Folder/>} />
                        <Route path="/website" element={<Website/>} />
                        <Route path="/text/*" element={<TextSection/>} />
                    </Routes>
                </Suspense>
            </Flex>   
        </Box>
        
    </Flex>
    </>)
}

export default Knowledege