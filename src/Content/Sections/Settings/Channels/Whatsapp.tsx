//REACT
import { useState, useEffect, useRef, useMemo } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Skeleton, Flex, Button } from "@chakra-ui/react"
//COMPONENTS
import ChannelInfo from "./Components/Channelnfo"
import FacebookLoginButton from "./SignUp-Buttons/FacebookLoginButton"
import SaveChanges from "../../../Components/Reusable/SaveChanges"
//ICONS
import { HiTrash } from "react-icons/hi2"
//TYPING
import { ConfigProps } from '../../../Constants/typing'
import { useAuth0 } from "@auth0/auth0-react"

interface WhatsappProps { 
    id:string
    uuid:string
    display_id:string
    name:string
    credentials:{phone_number:string,   waba_id:string, access_token:string  }
}

//MAIN FUNCTION
function Whatsapp () {
 
    //AUTH CONSTANT
    const auth = useAuth()
    const  { t } = useTranslation('settings')
    const { getAccessTokenSilently } = useAuth0()

    //WAITING BOOLEANS FOR CREATING AN ACCOUNT
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    //DATA
    const [data, setData]  =useState<WhatsappProps | null>(null)
    const dataRef = useRef<WhatsappProps | null>(null)
    const location = useLocation().pathname
    const channelId = location.split('/')[location.split('/').length - 1]

    //MATILDA CONFIGURATION+
    const configIdRef = useRef<string>('')
    const [selectedConfigId, setSelectedConfigId] = useState<string>('')
    const [configData, setConfigData] = useState<ConfigProps[] | null>(null)

    //FETCH DATA
    const fetchInitialData = async() => {
        await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations`, getAccessTokenSilently,setValue:setConfigData, auth})
    
        const responseMail = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels/${channelId}`,getAccessTokenSilently,  setValue: setData, auth})
        if (responseMail?.status === 200) {
                dataRef.current = responseMail.data
                setSelectedConfigId(responseMail.data.matilda_configuration_uuid)
                configIdRef.current = responseMail.data.matilda_configuration_uuid
        }
          
         
    }
    useEffect(() => {
        document.title = `${t('Channels')} - Whatsapp - ${auth.authData.organizationName} - Matil`
        fetchInitialData()
      }, [])
  

    const saveChanges = async () => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels/${channelId}`, setValue:setWaitingSend, setWaiting:setWaitingSend,getAccessTokenSilently,  auth, method:'put', requestForm:{...data, matilda_configuration_uuid:selectedConfigId}, toastMessages:{'works':t('CorrectUpdatedInfo'), 'failed':t('FailedUpdatedInfo')}})
        if (response?.status === 200) {
            configIdRef.current = selectedConfigId
            dataRef.current = data
        }
    }
 
        return(<Box p='2vw'>
            <SaveChanges  onSaveFunc={saveChanges} data={selectedConfigId} dataRef={configIdRef} setData={setSelectedConfigId} areNullEnabled/>
            <Box>
                <Flex justifyContent={'space-between'}> 
                    <Skeleton  isLoaded={(data !== null)}> 
                        <Text fontSize={'1.4em'} fontWeight={'medium'}>{data?.name}</Text>
                    </Skeleton>
                    {!(data?.display_id === '') && <Button color='red'   variant={'delete_section'}leftIcon={<HiTrash/>} size='sm'>{t('DeleteAccount')}</Button>}
                </Flex>            
                <Box height={'1px'} width={'100%'} bg='gray.300' mt='2vh' />
            </Box>
        
        <Flex flex='1' overflow={'hidden'} width={'100%'} gap='5vw'> 
            <Box flex='1' pt='4vh' overflow={'scroll'}> 
                <Skeleton isLoaded={data !== null}> 
                    <ChannelInfo value={data?.credentials?.phone_number || ''} title={t('Phone')} description={t('PhoneDes')}/>
                    <ChannelInfo value={data?.credentials?.waba_id || ''} title={t('AccountId')} description={t('AccountIdDes')}/>
                    <ChannelInfo hide={true}  value={data?.credentials?.access_token || ''} title={t('AccessToken')} description={t('AccessTokenDes')}/>
                </Skeleton>
            </Box>
            <Box flex='1' pt='4vh' overflow={'scroll'}> 
                <Skeleton isLoaded={configData !== null}> 
                    <Text  fontWeight={'medium'}>{t('SelectedConfig')}</Text>
                    {configData?.map((config, index) => (
                        <Box transition={'box-shadow 0.3s ease-in-out'} _hover={{shadow:'md'}}  mt='2vh' key={`config-${index}`} bg={selectedConfigId === config.uuid?'rgba(59, 90, 246, 0.25)':'gray.50'} onClick={() => setSelectedConfigId(config.uuid)} borderColor={'gray.200'} borderWidth={'1px'} borderRadius={'.5rem'} p='15px' cursor={'pointer'}>
                            <Text fontSize={'.9em'} fontWeight={'medium'}>{config.name}</Text>
                            <Text fontSize={'.8em'} color='gray.600'>{config.description}</Text>
                        </Box> 
                    ))}
                </Skeleton>
            </Box>                        
        </Flex>  
             
 
    </Box>)
}

export default Whatsapp