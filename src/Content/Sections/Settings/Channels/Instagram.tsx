//REACT
import { useState, useEffect, useRef, memo, useMemo } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../../API/fetchData"
import axios from 'axios'
//FRONT
import { Text, Box, Skeleton, Flex, Button, Radio } from "@chakra-ui/react"
//COMPONENTS
import ChannelInfo from "./Components/Channelnfo"
import ConfirmBox from "../../../Components/Reusable/ConfirmBox"
import InstagramButton from "./SignUp-Buttons/InstagramButton"
import GetMatildaConfig from "./GetMatildaConfig"
import EditText from "../../../Components/Reusable/EditText"
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
import SaveData from "./Components/SaveData"
//ICONS
import { FaPlus } from "react-icons/fa6"
//TYPING
import { configProps } from "../../../Constants/typing"
import { useLocation, useNavigate } from "react-router-dom"
 
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

//MAIN FUNCTION
const Instagram = memo(() => {

    //CONSTANTS
    const auth = useAuth()
    const navigate = useNavigate()
    const  { t } = useTranslation('settings')

    //NAME REF
    const newAccountNameRef = useRef<string>('')

    //BOOLEAN FOR CREATING AN ACCOUNT
    const [showCreateAccount, setShowCreateAccount] = useState<boolean>(false)

    //DATA
    const [data, setData]  =useState<any[]>([])
    const dataRef = useRef<any>(null)
      
    //FETCH DATA
    useEffect(() => {
        document.title = `${t('Channels')} - Instagram - ${auth.authData.organizationName} - Matil`
        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/instagram`,  setValue: setData, auth})   
            if (response?.status === 200) dataRef.current = response.data
        }
        fetchInitialData()
    }, [])

    //FETCH NEW DATA WHEN CREATING AN ACCOUNT
    const callNewWInstagram = async() => {
        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/instagram`,  setValue: setData, auth})
        setShowCreateAccount(false)
    }

    const CreateNewAccount = memo(() => {
        const [name, setName] = useState<string>('')
        return(
        <Box p='15px'> 
            <Text fontWeight={'medium'} >{t('AccountName')}</Text>
            <Box mb='2vh' mt='1vh'> 
                <EditText placeholder={t('Account')} value={name} setValue={(value:string) => {setName(value);newAccountNameRef.current = value}} hideInput={false}/>
            </Box>
            <Flex flexDir={'row-reverse'}> 
                <InstagramButton setShowBox={setShowCreateAccount}/>
            </Flex>
        </Box>)
     })
 

    const handleNameChange = (index:number, value:string) => {
        const updatedData = data.map((bot, i) =>i === index ? { ...bot, name: value } : bot)
        setData(updatedData)
    }
 
    const updateData = (newConfig:configProps, index:number) => {
        setData(prevData => {
            const newData = [...prevData]
            newData[index] = {...newData[index], matilda_configuration: newConfig}
            return newData}
        )
    }

    const returnToInsta = (key:boolean) => {
        localStorage.setItem('currentSettingsSection', 'channels/instagram')
        navigate('/settings/channels/instagram')
    }


    const memoizedCreateBox = useMemo(() => (
        <ConfirmBox setShowBox={returnToInsta} isSectionWithoutHeader={true}>
            <SuccessPage  name={newAccountNameRef.current}  callNewData={callNewWInstagram}/>
        </ConfirmBox>
    ), [location])

    return(<>
       
    {(location.pathname.split('/')[4] === 'success_auth') && memoizedCreateBox}

    {showCreateAccount && 
        <ConfirmBox setShowBox={setShowCreateAccount} isSectionWithoutHeader={true}>
           <CreateNewAccount/>
        </ConfirmBox>}

        <SaveData data={data} setData={setData} dataRef={dataRef} channel={'instagram'} />

        <Box> 
            <Flex justifyContent={'space-between'}> 
                <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('ActiveAccounts')} (Instagram)</Text>
                <Button whiteSpace='nowrap'  minWidth='auto'leftIcon={<FaPlus/>} size='sm'  onClick={() =>setShowCreateAccount(true)}>Crear Cuenta</Button>
            </Flex>            
            <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh' mb='4vh'/>
        </Box>
        <Skeleton isLoaded={dataRef.current !== null && data !== null}> 
                {data.length === 0 ? <Text mt='3vh'>{t('NoActiveAccounts', {name:'Instagram'})}</Text>:
                <> 
                {data.map((bot, index) => (
                <Box bg='white' p='1vw' key={`whatsapp-channel-${index}`} borderRadius={'.7rem'} mt={index === 0?'':'8vh'} boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.1)'} > 
                    <Flex justifyContent={'space-between'} > 
                        <Box width={'100%'} maxWidth={'600px'}> 
                            <EditText value={bot.name} maxLength={100} nameInput={true} size='md'fontSize='1.5em'  setValue={(value:string) => handleNameChange(index, value)}/>
                        </Box>
                    </Flex>
                    <Box height={'1px'} mt='2vh'mb='2vh' width={'100%'} bg='gray.300'/>
                    <Flex px='7px' key={`whatsapp-${index}`} width={'100%'} gap='5vw'> 
                        <Box flex='1'> 
                            <ChannelInfo value={bot.credentials.instagram_username} title={t('User')} description={t('UserDes')}/>
                            <ChannelInfo value={bot.credentials.page_id} title={t('PageId')} description="Identificador único de la página de Facebook"/>
                            <ChannelInfo value={bot.credentials.instagram_business_account_id} title={t('AccountId')} description={t('AccountIdDes')}/>
                            <ChannelInfo hide={true} value={bot.credentials.access_token} title={t('AccessToken')} description={t('AccessTokenDes')}/>
                        </Box>
                        <Box flex='1'> 
                            <GetMatildaConfig configDict={bot.matilda_configuration} updateData={updateData} configIndex={index}/>
                        </Box>                        
                    </Flex>
                    </Box>
                ))} 
                </>}
      
        </Skeleton>
       
    </>)
})

export default Instagram