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
import { Text, Box, Skeleton, Flex, Button, Radio } from "@chakra-ui/react"
//COMPONENTS
import ChannelInfo from "./Components/Channelnfo"
import ConfirmBox from "../../../Components/Reusable/ConfirmBox"
import InstagramButton from "./SignUp-Buttons/InstagramButton"
import GetMatildaConfig from "./Configurations"
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
//ICONS
import { BsTrash3Fill } from "react-icons/bs"
//TYPING
import { ConfigProps } from "../../../Constants/typing"

interface WhatsappProps { 
    id:string 
    uuid:string
    display_id:string
    credentials:{instagram_username:string,   page_id:string, instagram_business_account_id:string, access_token:string }
}

//MAIN FUNCTION
function Instagram () {

    //AUTH CONSTANT
    const auth = useAuth()
    const  { t } = useTranslation('settings')
    const navigate = useNavigate()

    const matildaScrollRef = useRef<HTMLDivElement>(null)


    //WAITING BOOLEANS FOR CREATING AN ACCOUNT
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    //DATA
    const [data, setData]  = useState<WhatsappProps | null>(null)
    const dataRef = useRef<any>(null)
      
    //MATILDA CONFIGURATION+
    const configIdRef = useRef<string>('')
    const [selectedConfigId, setSelectedConfigId] = useState<string>('')
    const [configData, setConfigData] = useState<ConfigProps[] | null>(null)

 

    //FETCH DATA
    const fetchInitialData = async() => {
        await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/matilda_configurations`, setValue:setConfigData, auth})
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels`, auth})
         if (response?.status === 200){
          let instaChannel 
          response.data.map((cha:any) => {if (cha.channel_type === 'instagram')  instaChannel = cha.id})
          if (instaChannel) {
            const responseMail = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels/${instaChannel}`,  setValue: setData, auth})
            if (responseMail?.status === 200) {
                setData(responseMail.data.configuration)
                dataRef.current = responseMail.data.configuration
                setSelectedConfigId(responseMail.data.matilda_configuration_uuid)
                configIdRef.current = responseMail.data.matilda_configuration_uuid
            }
          }
          else {
            setData({display_id:'', uuid:'', id:'', credentials:{instagram_username:'',   page_id:'', instagram_business_account_id:'', access_token:'' }})
          }
        }
    }
    useEffect(() => {
        document.title = `${t('Channels')} - Instagram - ${auth.authData.organizationName} - Matil`
        fetchInitialData()
      }, [])

      const saveChanges = async () => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels/${dataRef.current.id}`, setValue:setWaitingSend, setWaiting:setWaitingSend, auth, method:'put', requestForm:{...data, matilda_configuration_uuid:selectedConfigId}, toastMessages:{'works':t('CorrectUpdatedInfo'), 'failed':t('FailedUpdatedInfo')}})
        if (response?.status === 200) {
            configIdRef.current = selectedConfigId
            dataRef.current = data
        }
    }
    
    const callNewWInstagram = async() => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels/instagram`,  setValue: setData, auth})
    }

    const returnToInsta = (key:boolean) => {
        localStorage.setItem('currentSettingsSection', 'channels/instagram')
        navigate('/settings/channels/instagram')
    }

     const memoizedCreateBox = useMemo(() => (
        <ConfirmBox setShowBox={returnToInsta} >
            <SuccessPage  name={'instagram'}  callNewData={callNewWInstagram}/>
        </ConfirmBox>
    ), [location])

    return(<>
        {(location.pathname.split('/')[4] === 'success_auth') && memoizedCreateBox}
            <Box> 
                <Flex justifyContent={'space-between'}> 
                    <Text fontSize={'1.4em'} fontWeight={'medium'}>Instagram</Text>
                    {!(data?.display_id === '') && <Button variant={'delete_section'} leftIcon={<BsTrash3Fill/>} size='sm'>{t('DeleteAccount')}</Button>}
                </Flex>            
                <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh' />
            </Box>

            {(data === null || data?.display_id === '') ?
                <Skeleton isLoaded={ data !== null}>
                    <Flex height={'100%'} top={0} left={0} width={'100%'} position={'absolute'} alignItems={'center'} justifyContent={'center'}> 
                        <Box maxW={'580px'} textAlign={'center'}> 
                            <Text fontWeight={'medium'} fontSize={'2em'} mb='2vh'>{t('IntegrateInstagram')}</Text>               
                            <Text fontSize={'1em'} color={'gray.600'} mb='2vh'>{t('IntegrateInstagramDes')}</Text>               
                            <InstagramButton />
                        </Box>
                    </Flex>
                </Skeleton>
            :
            <>
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
                                    <Text fontSize={'.9em'} fontWeight={'medium'}>{config.name}</Text>
                                    <Text fontSize={'.8em'} color='gray.600'>{config.description}</Text>
                                </Box> 
                            ))}
                        </Skeleton>           
                    </Box>                        
                </Flex>
                <Box> 
                    <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='2vh'/>
                    <Flex flexDir={'row-reverse'}> 
                        <Button variant={'common'} isDisabled={(JSON.stringify(dataRef.current) === JSON.stringify(data))  && selectedConfigId !== configIdRef.current} onClick={saveChanges}>{waitingSend?<LoadingIconButton/>:t('SaveChanges')}</Button>
                    </Flex>
                </Box>
            </>} 
    </>)
}

export default Instagram


//LIST OF ACCOUNTS THAT WILL BE SHOWED AFETR SUCESS AUTH
const SuccessPage = ({name, callNewData}:{name:string, callNewData:() => void}) => {

    //CONSTANTS
    const  { t } = useTranslation('settings')
    const auth = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    //LIST OF PAGES
    const [pages, setPages] = useState<{name:string, id:number, access_token:string, instagram_business_account:{id:number}}[]>([])
  
    //SELECTED PAGE
    const [selectedPage, setSelectedPage] = useState<number>(0)
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    useEffect(() => {

        //FETCH PAGES
        const fetchData = async () => {

            const hash = location.hash
            const accessToken = hash.split('#access_token=')[1]?.split('&')[0]
            try {
                const response = await axios.get('https://graph.facebook.com/v20.0/me/accounts', {params: {fields: 'id,name,access_token,instagram_business_account', access_token: accessToken}})
            setPages(response.data.data)
        } catch (error) {console.error('Error fetching pages:', error)}
        }
        fetchData()
    }, [])

    //SEND NEW ACCOUNT
    const sendData = async () => {     
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/channels/instagram`, setWaiting:setWaitingSend, method:'post', requestForm:{name:name === ''?pages[selectedPage].name:name, instagram_username:pages[selectedPage].name, page_id:pages[selectedPage].id,access_token:pages[selectedPage].access_token, instagram_business_account_id:pages[selectedPage].instagram_business_account.id}, auth, toastMessages:{'works':'Nueva cuenta añadida con éxito', 'failed':'Hubo un error al añadir las cuentas'}})
        if (response?.status == 200) callNewData()
        localStorage.setItem('currentSettingsSection', 'channels/instagram')
        navigate('/settings/channels/instagram')
    }

  return (
      <Box p='15px'>
          <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ChoosePage')}</Text>
          <Box height={'1px'} mt='2vh'mb='2vh' width={'100%'} bg='gray.300'/>
          <Box overflow={'scroll'} maxH='60vh'> 
              {pages.length === 0 ? <Text>{t('NoPages')}</Text>:<> 
                {pages.map((page, index) => (
                    <Box cursor={'pointer'} mt={index === 0?'':'1vh'} key={`instagram-page-${index}`} p='15px' bg={selectedPage === index?'blue.100':'gray.100'}borderRadius={'.7em'} onClick={() => setSelectedPage(index)}>
                        <Flex justifyContent={'space-between'}> 
                            <Text><span style={{fontWeight:500}}>{t('Name')}:</span> {page.name}</Text>
                            <Radio isChecked={selectedPage === index}/>
                        </Flex>
                        <Text><span style={{fontWeight:500}}>Page ID:</span> {page.id}</Text>
                        <Text wordBreak={'break-all'}><span style={{fontWeight:500}}>Page Access Token:</span> {page.access_token.replace(/./g, '*')}</Text>
                        <Text><span style={{fontWeight:500}}>Instagram Business Account ID:</span> {page.instagram_business_account ? page.instagram_business_account.id : 'Not connected'}</Text>
                    </Box>
                ))}
              </>}
          </Box>
            <Box height={'1px'} mt='2vh'mb='2vh' width={'100%'} bg='gray.300'/>
            <Flex flexDir={'row-reverse'}> 
                <Button onClick={sendData} size='sm' variant={'main'} color='white'>{waitingSend?<LoadingIconButton/>:t('Confirm')}</Button>
            </Flex>
        </Box>
  )
}