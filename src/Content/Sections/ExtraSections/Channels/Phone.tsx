//REACT
import { useState, useEffect, useRef, useMemo } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Skeleton, Flex, Button } from "@chakra-ui/react"
//COMPONENTS
import ChannelInfo from "./Components/Channelnfo"
import FacebookLoginButton from "./SignUp-Buttons/FacebookLoginButton"
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
//ICONS
import { BsTrash3Fill } from "react-icons/bs"
//TYPING
import { ConfigProps } from '../../../Constants/typing'
import { useAuth0 } from "@auth0/auth0-react"

interface WhatsappProps { 
    id:string
    display_id:string
    credentials:{phone_number:string,   waba_id:string, access_token:string  }
}

//MAIN FUNCTION
function Phone () {
 
    //AUTH CONSTANT
    const auth = useAuth()
    const  { t } = useTranslation('settings')
    const { getAccessTokenSilently } = useAuth0()

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
        await fetchData({endpoint:`${auth.authData.organizationId}/settings/matilda_configurations`, setValue:setConfigData,getAccessTokenSilently, auth})
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/channels`,getAccessTokenSilently, auth})
        if (response?.status === 200){
          let wasChannel 
          response.data.map((cha:any) => {if (cha.channel_type === 'whatsapp')  wasChannel = cha.id})
          if (wasChannel) {
            const responseMail = await fetchData({endpoint:`${auth.authData.organizationId}/settings/channels/${wasChannel}`,  setValue: setData, getAccessTokenSilently,auth})
            if (responseMail?.status === 200) {
                    setData(responseMail.data.configuration)
                    dataRef.current = responseMail.data.configuration
                    setSelectedConfigId(responseMail.data.matilda_configuration_id)
                    configIdRef.current = responseMail.data.matilda_configuration_id
            }
          }
          else {
            setData({display_id:'', id:'', credentials:{phone_number:'', access_token:'', waba_id:''}})
          }
        }
    }
    useEffect(() => {
        document.title = `${t('Channels')} - Whatsapp - ${auth.authData.organizationName} - Matil`
        fetchInitialData()
      }, [])
  

    const saveChanges = async () => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/channels/${dataRef.current.id}`, setValue:setWaitingSend, setWaiting:setWaitingSend, getAccessTokenSilently, auth, method:'put', requestForm:{...data, matilda_configuration_id:selectedConfigId}, toastMessages:{'works':t('CorrectUpdatedInfo'), 'failed':t('FailedUpdatedInfo')}})
        if (response?.status === 200) {
            configIdRef.current = selectedConfigId
            dataRef.current = data
        }
    }
    return(<>

        <Box>
            <Flex justifyContent={'space-between'}> 
                <Text fontSize={'1.4em'} fontWeight={'medium'}>Whatsapp</Text>
                {!(data?.display_id === '') && <Button color='red'   variant={'delete_section'}leftIcon={<BsTrash3Fill/>} size='sm'>{t('DeleteAccount')}</Button>}
            </Flex>            
            <Box height={'1px'} width={'100%'} bg='border_color' mt='2vh' />
        </Box>
       
        {(data === null || data?.display_id === '') ?
            <Skeleton isLoaded={ data !== null}>
                <Flex height={'100%'} top={0} left={0} width={'100%'} position={'absolute'} alignItems={'center'} justifyContent={'center'}> 
                    <Box maxW={'580px'} textAlign={'center'}> 
                        <Text fontWeight={'medium'} fontSize={'2em'} mb='2vh'>{t('IntegrateWhatsapp')}</Text>               
                        <Text fontSize={'1em'} color={'text_gray'} mb='2vh'>{t('IntegrateWhatsappDes')}</Text>               
                        <FacebookLoginButton name={'whatsapp-account'} loadDataFunc={() => fetchInitialData()}/>
                    </Box>
                </Flex>
            </Skeleton>
        :
        <>
            <Flex flex='1' overflow={'hidden'} width={'100%'} gap='5vw'> 
                <Box flex='1' pt='4vh' overflow={'scroll'}> 
                    <Skeleton isLoaded={data !== null}> 
                        <ChannelInfo value={data?.credentials.phone_number || ''} title={t('Phone')} description={t('PhoneDes')}/>
                        <ChannelInfo value={data?.credentials.waba_id || ''} title={t('AccountId')} description={t('AccountIdDes')}/>
                        <ChannelInfo hide={true}  value={data?.credentials.access_token || ''} title={t('AccessToken')} description={t('AccessTokenDes')}/>
                    </Skeleton>
                </Box>
                <Box flex='1' pt='4vh' overflow={'scroll'}> 
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
                   <Button variant={'common'} isDisabled={(JSON.stringify(dataRef.current) === JSON.stringify(data))  && selectedConfigId !== configIdRef.current} onClick={saveChanges}>{waitingSend?<LoadingIconButton/>:t('SaveChanges')}</Button>
               </Flex>
           </Box>   
        </>}
    </>)
}

export default Phone