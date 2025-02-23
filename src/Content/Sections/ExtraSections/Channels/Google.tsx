//REACT
import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Skeleton, Flex, Button } from "@chakra-ui/react"
//COMPONENTS
import ChannelInfo from "./Components/Channelnfo"
import GoogleLoginButton from "./SignUp-Buttons/GoogleLoginButton"
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton" 
import SaveChanges from "../../../Components/Reusable/SaveChanges"
//ICONS
import { HiTrash } from "react-icons/hi2"
//TYPING
import { ConfigProps } from "../../../Constants/typing"
import { useAuth0 } from "@auth0/auth0-react"

interface WhatsappProps { 
    id:string
    display_id:string
    credentials:{google_business_account_id:string,  access_token:string  }
}

//MAIN FUNCTION
function Google () {

    //AUTH CONSTANT
    const { getAccessTokenSilently } = useAuth0()
    const auth = useAuth()
    const  { t } = useTranslation('settings')

    const matildaScrollRef = useRef<HTMLDivElement>(null)

    //WAITING BOOLEANS FOR CREATING AN ACCOUNT
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    //DATA
    const [data, setData]  =useState<WhatsappProps | null>(null)
    const dataRef = useRef<any>(null)
      
    //MATILDA CONFIGURATION+
    const configIdRef = useRef<string>('')
    const [selectedConfigId, setSelectedConfigId] = useState<string>('')
    const [configData, setConfigData] = useState<ConfigProps[] | null>(null)


    //FETCH DATA
    const fetchInitialData = async() => {
        await fetchData({endpoint:`${auth.authData.organizationId}/settings/matilda_configurations`,getAccessTokenSilently, setValue:setConfigData, auth})
        const response = await fetchData({getAccessTokenSilently, endpoint:`${auth.authData.organizationId}/settings/channels`, auth})
         if (response?.status === 200){
          let googleChannel 
          response.data.map((cha:any) => {if (cha.channel_type === 'google_business')  googleChannel = cha.id})
          if (googleChannel) {
            const responseMail = await fetchData({getAccessTokenSilently, endpoint:`${auth.authData.organizationId}/settings/channels/${googleChannel}`,  setValue: setData, auth})
            if (responseMail?.status === 200) {
                setData(responseMail.data.configuration)
                dataRef.current = responseMail.data.configuration
                setSelectedConfigId(responseMail.data.matilda_configuration_id)
                configIdRef.current = responseMail.data.matilda_configuration_id
            }
          }
          else {
            setData({display_id:'',  id:'', credentials:{ access_token:'', google_business_account_id:''}})
          }
        }
    }
    useEffect(() => {
        document.title = `${t('Channels')} - Google Business - ${auth.authData.organizationName} - Matil`
        fetchInitialData()
      }, [])
  

      const saveChanges = async () => {
        const response = await fetchData({getAccessTokenSilently, endpoint:`${auth.authData.organizationId}/settings/channels/${dataRef.current.id}`, setValue:setWaitingSend, setWaiting:setWaitingSend, auth, method:'put', requestForm:{...data, matilda_configuration_id:selectedConfigId}, toastMessages:{'works':t('CorrectUpdatedInfo'), 'failed':t('FailedUpdatedInfo')}})
        if (response?.status === 200) {
            configIdRef.current = selectedConfigId
            dataRef.current = data
        }
    }
    return(
        <>
    <SaveChanges  onSaveFunc={saveChanges} data={selectedConfigId} dataRef={configIdRef} setData={setSelectedConfigId} areNullEnabled/>

 
    <Skeleton isLoaded={ data !== null}>
        {data?.display_id === '' ?
            <Flex height={'100%'} top={0} left={0} width={'100%'} position={'absolute'} alignItems={'center'} justifyContent={'center'}> 
                <Box maxW={'580px'} textAlign={'center'}> 
                    <Text fontWeight={'medium'} fontSize={'2em'} mb='2vh'>{t('IntegrateGoogle')}</Text>               
                    <Text fontSize={'1em'} color={'text_gray'} mb='2vh'>{t('IntegrateGoogleDes')}</Text>               
                    <GoogleLoginButton/>
                </Box>
            </Flex>
        :
        <>
           <Box> 
                <Flex justifyContent={'space-between'}> 
                    <Text fontSize={'1.4em'} fontWeight={'medium'}>Google Business</Text>
                    {!(data?.display_id === '') && <Button variant={'delete_section'} leftIcon={<HiTrash/>} size='sm'>{t('DeleteAccount')}</Button>}
                </Flex>            
                <Box height={'1px'} width={'100%'} bg='border_color' mt='1vh'/>
            </Box>

            <Flex flex='1' overflow={'hidden'} width={'100%'} gap='5vw'> 
                <Box flex='1' pt='4vh' overflow={'scroll'}> 
                    <Skeleton isLoaded={ data !== null}> 
                        <ChannelInfo value={data?.credentials.google_business_account_id || ''} title={t('AccountId')} description={t('AccountIdDes')}/>
                        <ChannelInfo hide={true}  value={data?.credentials.access_token || ''} title={t('AccessToken')} description={t('AccessTokenDes')}/>
                    </Skeleton>
                </Box>
                <Box flex='1'> 
                    <Skeleton isLoaded={configData !== null}> 
                        <Text  fontWeight={'medium'}>{t('SelectedConfig')}</Text>
                        {configData?.map((config, index) => (
                            <Box transition={'box-shadow 0.3s ease-in-out'} _hover={{shadow:'md'}}  mt='2vh' key={`config-${index}`} bg={selectedConfigId === config.id?'rgba(59, 90, 246, 0.25)':'gray.50'} onClick={() => setSelectedConfigId(config.id)} borderColor={'border_color'} borderWidth={'1px'} borderRadius={'.5rem'} p='15px' cursor={'pointer'}>
                                <Text fontSize={'.9em'} fontWeight={'medium'}>{config.name}</Text>
                                <Text fontSize={'.8em'} color='text_gray'>{config.description}</Text>
                            </Box> 
                        ))}
                    </Skeleton>
                </Box>                        
            </Flex>
            <Box> 
                <Box width='100%' bg='border_color' height='1px' mt='2vh' mb='2vh'/>
                <Flex flexDir={'row-reverse'}> 
                    <Button  variant={'common'}size='sm'  isDisabled={(JSON.stringify(dataRef.current) === JSON.stringify(data)) && selectedConfigId !== configIdRef.current} onClick={saveChanges}>{waitingSend?<LoadingIconButton/>:t('SaveChanges')}</Button>
                </Flex>
            </Box>
        </>} 
    </Skeleton>
    </>)
    }
 
export default Google
