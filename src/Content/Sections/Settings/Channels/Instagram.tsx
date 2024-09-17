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
import GetMatildaConfig from "./GetMatildaConfig"
import EditText from "../../../Components/Reusable/EditText"
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
//TYPING
import { configProps } from "../../../Constants/typing"

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

    //WAITING BOOLEANS FOR CREATING AN ACCOUNT
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    //DATA
    const [data, setData]  = useState<WhatsappProps | null>(null)
    const dataRef = useRef<any>(null)
      
    //MATILDA CONFIG 
    const [matildaConfig, setMatildaConfig] = useState<configProps | null>(null)
    const matildaConfigRef = useRef<configProps| null>(null)

    //CREATE ACCOUNT 
    const [name, setName] = useState<string>('')


    //FETCH DATA
    const fetchInitialData = async() => {
        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/all_channels_basic_data`, auth})
         if (response?.status === 200){
          let instaChannel 
          response.data.map((cha:any) => {if (cha.channel_type === 'instagram')  instaChannel = cha.id})
          if (instaChannel) {
            const responseMail = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/${instaChannel}`,  setValue: setData, auth})
            if (responseMail?.status === 200) {
              setMatildaConfig(responseMail.data.matilda_configuraion)
              matildaConfigRef.current = responseMail.data.matilda_configuraion
              dataRef.current = responseMail.data
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
            const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/${dataRef.current.id}`, setValue:setWaitingSend, setWaiting:setWaitingSend, auth, method:'put', requestForm:{...data, matilda_configuration:matildaConfig}, toastMessages:{'works':t('CorrectUpdatedInfo'), 'failed':t('FailedUpdatedInfo')}})
            if (response?.status === 200) {
            dataRef.current = data
            matildaConfigRef.current = matildaConfig
            }
        }

    
    const callNewWInstagram = async() => {
        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/instagram`,  setValue: setData, auth})
    }

    const returnToInsta = (key:boolean) => {
        localStorage.setItem('currentSettingsSection', 'channels/instagram')
        navigate('/settings/channels/instagram')
    }

     const memoizedCreateBox = useMemo(() => (
        <ConfirmBox setShowBox={returnToInsta} isSectionWithoutHeader={true}>
            <SuccessPage  name={'instagram'}  callNewData={callNewWInstagram}/>
        </ConfirmBox>
    ), [location])

    return(<>
        {(location.pathname.split('/')[4] === 'success_auth') && memoizedCreateBox}

        <Flex justifyContent={'space-between'}> 
            <Text fontSize={'1.4em'} fontWeight={'medium'}>Instagram</Text>
            {!(data?.display_id === '') && <Button size='sm'  isDisabled={(JSON.stringify(dataRef.current) === JSON.stringify(data)) && (JSON.stringify(matildaConfigRef.current) === JSON.stringify(matildaConfig))} onClick={saveChanges}>{waitingSend?<LoadingIconButton/>:t('SaveChanges')}</Button>}
        </Flex>            
        <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh' mb='5vh'/>
    

        <Skeleton isLoaded={ data !== null}> 

        {data?.display_id === '' ?


        <Flex height={'100%'} top={0} left={0} width={'100%'} position={'absolute'} alignItems={'center'} justifyContent={'center'}> 
            <Box maxW={'580px'} textAlign={'center'}> 
                <Text fontWeight={'medium'} fontSize={'2em'} mb='2vh'>{t('IntegrateInstagram')}</Text>               
                <Text fontSize={'1em'} color={'gray.600'} mb='2vh'>{t('IntegrateInstagramDes')}</Text>               
                <InstagramButton />
            </Box>
        </Flex>
        :
        <>
            <Box bg='white' p='1vw' borderRadius={'.7rem'}  boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.1)'} > 
                <Flex justifyContent={'space-between'} > 
                    <Box width={'100%'} maxWidth={'600px'}> 
                        <EditText value={data?.display_id} maxLength={100} nameInput={true} size='md'fontSize='1.5em'  setValue={(value:string) => setData(prev => ({...prev as WhatsappProps, display_id:value}))}/>
                    </Box>
                </Flex>
                <Box height={'1px'} mt='2vh'mb='2vh' width={'100%'} bg='gray.300'/>
                <Flex px='7px'  width={'100%'} gap='5vw'> 
                    <Box flex='1'> 
                        <ChannelInfo value={data?.credentials.instagram_username || ''} title={t('User')} description={t('UserDes')}/>
                        <ChannelInfo value={data?.credentials.page_id || ''} title={t('PageId')} description="Identificador único de la página de Facebook"/>
                        <ChannelInfo value={data?.credentials.instagram_business_account_id || ''} title={t('AccountId')} description={t('AccountIdDes')}/>
                        <ChannelInfo hide={true} value={data?.credentials.access_token || ''} title={t('AccessToken')} description={t('AccessTokenDes')}/>
                    </Box>
                    <Box flex='1'> 
                        <GetMatildaConfig configDict={matildaConfig} updateData={setMatildaConfig} />
                    </Box>                        
                </Flex>
            </Box>
        </>}
    </Skeleton>
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
        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/instagram`, setWaiting:setWaitingSend, method:'post', requestForm:{name:name === ''?pages[selectedPage].name:name, instagram_username:pages[selectedPage].name, page_id:pages[selectedPage].id,access_token:pages[selectedPage].access_token, instagram_business_account_id:pages[selectedPage].instagram_business_account.id}, auth, toastMessages:{'works':'Nueva cuenta añadida con éxito', 'failed':'Hubo un error al añadir las cuentas'}})
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
              <Button onClick={sendData} size='sm' bg='brand.gradient_blue' _hover={{bg:'brand.gradient_blue_hover'}} color='white'>{waitingSend?<LoadingIconButton/>:t('Confirm')}</Button>
          </Flex>
      </Box>
  )
}