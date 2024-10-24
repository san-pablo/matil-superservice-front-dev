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
import GetMatildaConfig from "./GetMatildaConfig"
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
//ICONS
import { BsTrash3Fill } from "react-icons/bs"
//TYPING
import { configProps } from "../../../Constants/typing"

interface WhatsappProps { 
    id:string
    uuid:string
    display_id:string
    credentials:{phone_number:string,   waba_id:string, access_token:string  }
}

//MAIN FUNCTION
function Whatsapp () {

    //AUTH CONSTANT
    const auth = useAuth()
    const  { t } = useTranslation('settings')

    const matildaScrollRef = useRef<HTMLDivElement>(null)

    //WAITING BOOLEANS FOR CREATING AN ACCOUNT
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    //DATA
    const [data, setData]  =useState<WhatsappProps | null>(null)
    const dataRef = useRef<any>(null)
      
    //MATILDA CONFIG 
    const [matildaConfig, setMatildaConfig] = useState<configProps | null>(null)
    const matildaConfigRef = useRef<configProps| null>(null)

    //FETCH DATA
    const fetchInitialData = async() => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels/all_channels_basic_data`, auth})
         if (response?.status === 200){
          let wasChannel 
          response.data.map((cha:any) => {if (cha.channel_type === 'whatsapp')  wasChannel = cha.id})
          if (wasChannel) {
            const responseMail = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels/${wasChannel}`,  setValue: setData, auth})
            if (responseMail?.status === 200) {
              setMatildaConfig(responseMail.data.matilda_configuration)
              matildaConfigRef.current = responseMail.data.matilda_configuration
              dataRef.current = responseMail.data
            }
          }
          else {
            setData({display_id:'', uuid:'', id:'', credentials:{phone_number:'', access_token:'', waba_id:''}})
          }
        }
    }
    useEffect(() => {
        document.title = `${t('Channels')} - Whatsapp - ${auth.authData.organizationName} - Matil`
        fetchInitialData()
      }, [])
  

      const saveChanges = async () => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels/${dataRef.current.id}`, setValue:setWaitingSend, setWaiting:setWaitingSend, auth, method:'put', requestForm:{...data, matilda_configuration:matildaConfig}, toastMessages:{'works':t('CorrectUpdatedInfo'), 'failed':t('FailedUpdatedInfo')}})
            if (response?.status === 200) {
            dataRef.current = data
            matildaConfigRef.current = matildaConfig
            }
        }
    return(<>

        <Box>
            <Flex justifyContent={'space-between'}> 
                <Text fontSize={'1.4em'} fontWeight={'medium'}>Whatsapp</Text>
                {!(data?.display_id === '') && <Button color='red'   variant={'delete_section'}leftIcon={<BsTrash3Fill/>} size='sm'>{t('DeleteAccount')}</Button>}
            </Flex>            
            <Box height={'1px'} width={'100%'} bg='gray.300' mt='2vh' />
        </Box>
       
        {(data === null || data?.display_id === '') ?
            <Skeleton isLoaded={ data !== null}>
                <Flex height={'100%'} top={0} left={0} width={'100%'} position={'absolute'} alignItems={'center'} justifyContent={'center'}> 
                    <Box maxW={'580px'} textAlign={'center'}> 
                        <Text fontWeight={'medium'} fontSize={'2em'} mb='2vh'>{t('IntegrateWhatsapp')}</Text>               
                        <Text fontSize={'1em'} color={'gray.600'} mb='2vh'>{t('IntegrateWhatsappDes')}</Text>               
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
                    <Skeleton isLoaded={matildaConfig !== null}> 
                        <GetMatildaConfig configDict={matildaConfig} setConfigDict={setMatildaConfig} scrollRef={matildaScrollRef} />
                    </Skeleton>
                </Box>                        
            </Flex>  
            <Box> 
               <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='2vh'/>
               <Flex flexDir={'row-reverse'}> 
                   <Button variant={'common'} isDisabled={(JSON.stringify(dataRef.current) === JSON.stringify(data)) && (JSON.stringify(matildaConfigRef.current) === JSON.stringify(matildaConfig))} onClick={saveChanges}>{waitingSend?<LoadingIconButton/>:t('SaveChanges')}</Button>
               </Flex>
           </Box>   
        </>}
    </>)
}

export default Whatsapp