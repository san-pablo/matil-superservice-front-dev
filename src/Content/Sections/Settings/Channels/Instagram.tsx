//REACT
import { useState, useEffect, useRef, useMemo } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useLocation } from "react-router-dom"
//FETCH DATA
import fetchData from "../../../API/fetchData"
import axios from "axios"
//FRONT
import { Text, Box, Skeleton, Flex, Button, Radio, IconButton } from "@chakra-ui/react"
//COMPONENTS
import ChannelInfo from "./Components/Channelnfo"
import ConfirmBox from "../../../Components/Reusable/ConfirmBox"
import InstagramButton from "./SignUp-Buttons/InstagramButton"
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
import SaveChanges from "../../../Components/Reusable/SaveChanges"
//ICONS
import { HiTrash } from "react-icons/hi2"
import { RxCross2 } from "react-icons/rx"
//TYPING
import { ConfigProps } from "../../../Constants/typing"
import { useAuth0 } from "@auth0/auth0-react"

interface WhatsappProps { 
    id:string 
    uuid:string
    name:string
    display_id:string
    credentials:{instagram_username:string,   page_id:string, instagram_business_account_id:string, access_token:string }
}

//MAIN FUNCTION
function Instagram () {

    //AUTH CONSTANT
    const auth = useAuth()
    const  { t } = useTranslation('settings')
    const { getAccessTokenSilently } = useAuth0()
    const location = useLocation().pathname
    const channelId = location.split('/')[location.split('/').length - 1]

    //WAITING BOOLEANS FOR CREATING AN ACCOUNT
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    //DATA
    const [data, setData]  = useState<WhatsappProps | null>(null)
    const dataRef = useRef<any>(null)
    const idRef = useRef<any>(null)

      
    //MATILDA CONFIGURATION+
    const configIdRef = useRef<string>('')
    const [selectedConfigId, setSelectedConfigId] = useState<string  >('')
    const [configData, setConfigData] = useState<ConfigProps[] | null>(null)

 
    //FETCH DATA
    const fetchInitialData = async() => {
        await fetchData({getAccessTokenSilently, endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations`, setValue:setConfigData, auth})
        
        const responseMail = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels/${channelId}`,  setValue: setData, auth, getAccessTokenSilently})
        if (responseMail?.status === 200) {
            idRef.current = responseMail.data.id
            dataRef.current = responseMail.data.configuration
            setSelectedConfigId(responseMail.data.matilda_configuration_uuid)
            configIdRef.current = responseMail.data.matilda_configuration_uuid
        
        }
    }
    useEffect(() => {
        document.title = `${t('Channels')} - Instagram - ${auth.authData.organizationName} - Matil`
        fetchInitialData()
      }, [])

      const saveChanges = async () => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels/${channelId}`, setValue:setWaitingSend, setWaiting:setWaitingSend,getAccessTokenSilently, auth, method:'put', requestForm:{...data, matilda_configuration_uuid:selectedConfigId !== ''?selectedConfigId:null}, toastMessages:{'works':t('CorrectUpdatedInfo'), 'failed':t('FailedUpdatedInfo')}})
        if (response?.status === 200) {
            configIdRef.current = selectedConfigId
            dataRef.current = data
        }
    }
 
   

    return(<>

    <Box p='2vw'> 
        <SaveChanges  onSaveFunc={saveChanges} data={selectedConfigId} dataRef={configIdRef} setData={setSelectedConfigId} areNullEnabled/>
        <Box> 
            <Flex justifyContent={'space-between'}> 
                <Skeleton  isLoaded={(data !== null)}> 
                    <Text fontSize={'1.4em'} fontWeight={'medium'}>{data?.name}</Text>
                </Skeleton>
                {!(data?.display_id === '') && <Button variant={'delete_section'} leftIcon={<HiTrash/>} size='sm'>{t('DeleteAccount')}</Button>}
            </Flex>            
            <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh' />
        </Box>
        
        <Flex flex='1' overflow={'hidden'} width={'100%'} gap='5vw'> 
            <Box flex='1' pt='4vh' overflow={'scroll'}> 
                <Skeleton isLoaded={ data !== null}> 
                    <ChannelInfo value={data?.credentials.instagram_username || ''} title={t('User')} description={t('UserDes')}/>
                    <ChannelInfo value={data?.credentials.page_id || ''} title={t('PageId')} description="Identificador único de la página de Facebook"/>
                    <ChannelInfo value={data?.credentials.instagram_business_account_id || ''} title={t('AccountId')} description={t('AccountIdDes')}/>
                    <ChannelInfo hide={true} value={data?.credentials.access_token || ''} title={t('AccessToken')} description={t('AccessTokenDes')}/>
                </Skeleton>
            </Box>
            <Box flex='1' pt='4vh' overflow={'scroll'}> 
                <Skeleton isLoaded={configData !== null}> 
                    <Text  fontWeight={'medium'}>{t('SelectedConfig')}</Text>
                    {configData?.map((config, index) => (
                        <Box transition={'box-shadow 0.3s ease-in-out'} _hover={{shadow:'md'}}  mt='2vh' key={`config-${index}`} bg={selectedConfigId === config.uuid?'rgba(59, 90, 246, 0.25)':'gray.50'} onClick={() => setSelectedConfigId(config.uuid)} borderColor={'gray.200'} borderWidth={'1px'} borderRadius={'.5rem'} p='15px' cursor={'pointer'}>
                            <Flex justifyContent={'space-between'}> 
                                <Box> 
                                    <Text fontSize={'.9em'} fontWeight={'medium'}>{config.name}</Text>
                                    <Text fontSize={'.8em'} color='gray.600'>{config.description}</Text>
                                </Box>
                                {selectedConfigId === config.uuid && <IconButton size={'xs'} color={'red.600'} bg='transparent' variant={'delete'} _hover={{bg:'red.100'}} icon={<RxCross2 size={'16px'}/>} aria-label="delete-row" onClick={(e) => {e.stopPropagation();setSelectedConfigId('')}}/>}
                            </Flex>
                        </Box> 
                    ))}
                </Skeleton>           
            </Box>                        
        </Flex>
    </Box>

    </>)
}

export default Instagram

 