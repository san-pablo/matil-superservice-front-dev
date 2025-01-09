//REACT
import { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../../AuthContext"
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Flex, Button, Skeleton } from "@chakra-ui/react"
//COMPONENTS
import ConfirmBox from "../../../Components/Reusable/ConfirmBox"
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
import IconsPicker from "../../../Components/Reusable/IconsPicker"
//FUNCTIONS
import parseMessageToBold from "../../../Functions/parseToBold"
//ICONS
import { FaPlus } from "react-icons/fa6"
import { PiChatsBold } from "react-icons/pi"
//TYPING
import { useNavigate } from "react-router-dom"
 
   
//TYPING
interface ConfigProps { 
    uuid:string 
    name:string 
    description:string 
    channels_ids:string[]
    icon:string
}
 
const tryData = {uuid:'', icon:'',name:'Hola', description:'Hola'}
 
//MAIN FUNCTION
function Tilda () {

    //AUTH CONSTANT
    const auth = useAuth()
    const navigate = useNavigate()
    const { t } = useTranslation('settings')
    const {  getAccessTokenSilently } = useAuth0()
    
    //TEST ID
     const [configData, setConfigData] = useState<ConfigProps[] | null>(null)

    //TRIGGER TO DELETE 
    const [configToDeleteIndex, setConfigToDeleteIndex] = useState<number | null>(null)
    
    //FETCH INITIAL DATA
    useEffect(() => {
        const fetchTriggerData = async () => {
            const response  = await fetchData({ getAccessTokenSilently, endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations`, setValue:setConfigData, auth})
        }
        document.title = `${t('Settings')} - ${t('MatildaConfigs')} - ${auth.authData.organizationName} - Matil`
        fetchTriggerData()
    }, [])

    //FUNCTION FOR DELETING THE TRIGGER
    const DeleteComponent = () => {

        //WAITING DELETION
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

        //FUNCTION FOR DELETING AN AUTOMATION
        const deleteTrigger= async () => {
            setWaitingDelete(true)
            const newData = configData?.filter((_, index) => index !== configToDeleteIndex) as ConfigProps[]
            
            const response = await fetchData({endpoint: `${auth.authData.organizationId}/admin/settings/matilda_configurations/${configData?.[configToDeleteIndex as number]?.uuid}`, method: 'delete', getAccessTokenSilently, setWaiting: setWaitingDelete, auth, toastMessages: {works: t('CorrectDeletedConfiguration'), failed: t('FailedDeletedConfiguration')}})
            if (response?.status === 200) {
                setConfigData(newData)
                setConfigToDeleteIndex(null)
            }
        }

        //FRONT
        return(<>
            <Box p='20px' > 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ConfirmDelete')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Text >{parseMessageToBold(t('ConfirmDeleteConfig', {name:configData?.[configToDeleteIndex as number].name}))}</Text>
            </Box>
            <Flex bg='gray.50' p='20px' gap='10px' flexDir={'row-reverse'}>
                <Button  size='sm' variant={'delete'} onClick={deleteTrigger}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                <Button  size='sm' variant={'common'}onClick={() => setConfigToDeleteIndex(null)}>{t('Cancel')}</Button>
            </Flex>
        </>)
    }

    //DELETE BOX
    const memoizedDeleteBox = useMemo(() => (
        <ConfirmBox setShowBox={(b:boolean) => setConfigToDeleteIndex(null)}> 
            <DeleteComponent/>
        </ConfirmBox>
    ), [configToDeleteIndex])

 

    //FRONT
    return(<>
        {configToDeleteIndex !== null && memoizedDeleteBox}
             
        {configData?.length === 0 ? 
            <Flex height={'100%'} top={0} left={0} width={'100%'} alignItems={'center'} justifyContent={'center'}> 
                <Box maxW={'580px'} textAlign={'center'}> 
                    <Text fontWeight={'medium'} fontSize={'2em'} mb='2vh'>{t('NoConfigs')}</Text>               
                    <Button variant={'main'} leftIcon={<FaPlus/>} onClick={() => {navigate('/setings/tilda/config/new')}}>{t('CreateConfig')}</Button>
                </Box>
            </Flex> 
            :
            <Flex flexWrap={'wrap'} gap='32px'  >
                {(configData ? configData: [tryData, tryData, tryData])?.map((conf, index) => (
                    <Skeleton isLoaded={configData !== null} style={{borderRadius:'1rem'}}> 
                        <Box p='20px' overflow={'hidden'}  width={'400px'}  onClick={() => navigate(`/setings/tilda/config/${conf.uuid}`)} cursor={'pointer'} borderWidth={'1px'} key={`help-center-${index}`} transition={'box-shadow 0.3s ease-in-out'} _hover={{shadow:'lg'}} shadow={'sm'} borderRadius={'1rem'}>
                            <Flex gap='15px'>
                                <IconsPicker disabled selectedIcon={conf?.icon || 'IoSettingsSharp'} setSelectedIcon={() => {}}/> 
                                <Box> 
                                    <Text fontWeight={'medium'}  w='295px' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} fontSize={'1.2em'}>{conf.name}</Text>
                                    <Text  w='295px' color='gray.600' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  fontSize={'.9em'}>{conf.description?conf.description:t('NoDescription')}</Text>
                                </Box>
                            </Flex>                       
                            <Button mt='2vh' leftIcon={<PiChatsBold/>}  onClick={(e) => {e.stopPropagation()}} size='xs' variant={'main'}>{t('TestChat')}</Button>  
                        </Box>
                    </Skeleton>
                ))}
            </Flex> 
            }  
    </>)
}

export default Tilda

