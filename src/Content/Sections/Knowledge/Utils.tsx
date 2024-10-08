import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { Dispatch, SetStateAction, useState } from "react"
import { useAuth } from "../../../AuthContext"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Text, Box, Icon, Flex, Button, Grid } from "@chakra-ui/react"
//COMPONENTS
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import EditText from "../../Components/Reusable/EditText"
//ICONS
import { IconType } from "react-icons"
import { IoBook } from "react-icons/io5"
import { FaFolder, FaLock, FaFileLines } from "react-icons/fa6"
  
interface Folder {
    name: string
    children: Folder[]
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
        if (type === 'text') navigate(`text/create`)
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
export const CreateFolder= ({currentFolder, setShowCreate}:{currentFolder:Folder | null,setShowCreate:Dispatch<SetStateAction<boolean>>}) => {

    const { t } = useTranslation('knowledge')
    const auth = useAuth()
    const [waitingCreate, setWaitingCreate] = useState<boolean>(false)
    const [folderName, setFolderName] = useState<string>(currentFolder?currentFolder.name:'')

    //FUNCTION FOR CREATE A NEW BUSINESS
    const createFolder= async () => {
        const businessData = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/knowledge/folders`, method:currentFolder?'put':'post', setWaiting:setWaitingCreate, requestForm:{name:folderName, parent_folders:[]}, auth, toastMessages:{'works': t('CorrectCreatedFolder'), 'failed':t('FailedtCreatedFolder')}})
        setShowCreate(false)
    }
    return(<> 
        <Box p='20px' maxW='450px'> 
            <Text fontWeight={'medium'} fontSize={'1.2em'}>{currentFolder?t('EditFolder'):t('CreateFolder')}</Text>
            <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
            <Flex alignItems={'center'} gap='10px'> 
                <Icon boxSize={'20px'} as={FaFolder}/>
                <EditText placeholder={t('FolderName')} hideInput={false} value={folderName} setValue={setFolderName}/>
            </Flex>
        </Box>
        <Flex  maxW='450px' p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
            <Button  size='sm' variant={'main'} isDisabled={folderName === ''} onClick={createFolder}>{waitingCreate?<LoadingIconButton/>:currentFolder?t('EditFolder'):t('CreateFolder')}</Button>
            <Button  size='sm' variant={'common'} onClick={() => {setShowCreate(false)}}>{t('Cancel')}</Button>
        </Flex>
    </>)
}
