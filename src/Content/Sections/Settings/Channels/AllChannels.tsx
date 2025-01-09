

//REACT
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
//FECTH DATA
import fetchData from '../../../API/fetchData'
import axios from 'axios'
//FRONT
import { Flex, Text, Box, Icon, Button, Radio } from "@chakra-ui/react"
//COMPONENTS
import Table from '../../../Components/Reusable/Table'
import ConfirmBox from '../../../Components/Reusable/ConfirmBox'
import FacebookLoginButton from './SignUp-Buttons/FacebookLoginButton'
import GoogleLoginButton from './SignUp-Buttons/GoogleLoginButton'
import InstagramButton from './SignUp-Buttons/InstagramButton'
import EditText from '../../../Components/Reusable/EditText'
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
//ICONS
import { FaPlus, FaCloud, FaRobot } from 'react-icons/fa6'
import { FaInfoCircle, FaPhone } from 'react-icons/fa'
import { IoMdMail, IoLogoWhatsapp } from "react-icons/io"
import { IoChatboxEllipses, IoLogoGoogle } from "react-icons/io5"
import { AiFillInstagram } from "react-icons/ai"
//TYPING
import { IconType } from 'react-icons'
import { logosMap, Channels } from '../../../Constants/typing'
 
type ChannelsType = {
    id: string
    uuid: string
    display_id: string
    name: string
    channel_type: string
    is_active: boolean
}

const CellStyle = ({column, element}:{column:string, element:any}) => {

    const { t } = useTranslation('conversations')

    if (column === 'channel_type') {
        return(
        <Flex fontSize={'.9em'} gap='7px' alignItems={'center'}>
            <Icon color='gray.600' as={typeof element === 'string' && element in logosMap ?logosMap[element as Channels][0]:FaInfoCircle}/>
            <Text >{t(element as string)}</Text>
         </Flex>)
    }    
    else if (column === 'is_active') return(
        <Box boxShadow={`1px 1px 1px rgba(0, 0, 0, 0.15)`} display="inline-flex" fontSize='.9em' py='2px' px='8px' fontWeight={'medium'} color='white'  bg={!element?'red.100':'green.100'} borderRadius={'.7rem'}> 
            <Text  color={!element?'red.600':'green.600'}>{element?t('Active'):t('Inactive')}</Text>
        </Box>
    )

    else return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>
}

const defaultChatbotConfig = {
    welcome_message:{},
    chat_position:'right',
    mesh_colors: ['#3399ff', '#0066cc'],
    actions_color:'#0066cc',
    messages_opacity:0.5,
    ai_message:{},
    bot_name:'Tilda',
    header_background: ['#3399ff', '#0066cc'],
    header_color: '#FFFFFF',
    chat_avatar: '',
    client_background: ['#3399ff', '#0066cc'],
    client_color: '#FFFFFF',
    options: {},
    sections: []
}

const AllChannels = ({channelsData}:{channelsData:ChannelsType[]}) => {
    
    const auth = useAuth()
    const { t } = useTranslation('settings')
    const { getAccessTokenSilently } = useAuth0()
    const navigate = useNavigate()

    const [showCreateChannel, setShowCreateChannel] = useState<boolean>(false)

    const CreateChannel = () => {

        const channelsDict:{[key in Channels]:[string, IconType]} = {'webchat':[t('webchat'),IoChatboxEllipses], 'email':[ t('email'), IoMdMail], 'whatsapp':[t('whatsapp'),IoLogoWhatsapp], 'google_business':[ t('google_business'),IoLogoGoogle], 'instagram': [t('instagram'), AiFillInstagram],  'phone':[ t('phone'),FaPhone ], 'voip':[t('voip'), FaCloud]}
        const [name, setName] = useState<string>('')
        const [waitingCreate, setWaitingCreate] = useState<boolean>(false)
        const [channelType, setChannelType] = useState<Channels>('webchat')
        const [email, setEmail] = useState<string>('')


        const createChannel = async (channelConfig?:any) => {
            const endpoint = `${auth.authData.organizationId}/admin/settings/channels/${channelType}`
            let chanelConfig: {}
            if (channelType === 'webchat')  chanelConfig = {name, configuration:defaultChatbotConfig}
            if (channelType === 'email')  chanelConfig = {name, email_address:email}
            if (channelType === 'instagram')  chanelConfig = {name, ...channelConfig}
            if (channelType === 'google_business')  chanelConfig = {name, ...channelConfig}
            if (channelType === 'whatsapp')  chanelConfig = {name, ...channelConfig}

            const response = await fetchData({endpoint, setWaiting:setWaitingCreate, getAccessTokenSilently, auth, method:'post', requestForm:{name:t('NewChat'),  configuration:defaultChatbotConfig}, toastMessages:{'works':t('CorrectUpdatedInfo'), 'failed':t('FailedUpdatedInfo')}})
        }   

        const CreateComponent = () => {

             switch (channelType) {
                case 'webchat':
                   return  <Button w='100%' disabled={name === ''} onClick={createChannel} size='md' leftIcon={<FaRobot/>} bg={'linear-gradient(to right, #3399ff,#0066cc)'} _hover={{bg:'linear-gradient(to right, #3399ff,#0066cc)', opacity:name !== ''?1:''}} opacity={'.8'}  color='#fff'>
                   {waitingCreate? <LoadingIconButton/>:t('CreateChatbotButton')}
                   </Button>
                case 'whatsapp':
                    return <FacebookLoginButton name={name} loadDataFunc={createChannel}/>
                case 'google_business':
                    return <GoogleLoginButton/>
                case 'instagram':
                    return <InstagramButton/>
                case 'email':
                    return (<> 
                    <Text  mb='.5vh' mt='2vh' fontWeight={'medium'} fontSize={'.9em'}>{t('Email')}</Text>
                    <EditText  maxLength={100} placeholder={t('Mail') + '...'} hideInput={false} value={email} setValue={(value) => setEmail(value)}/>
                    <Button disabled={name === ''  || email === ''} w='100%' size='md' onClick={createChannel} leftIcon={<IoMdMail/>} mt='2vh'>{waitingCreate? <LoadingIconButton/>:t('CreateMail')}</Button>
                </>)
                default:
                    return <></>
            }
        }

 
        const memoizedCreateBox = useMemo(() => (
            <ConfirmBox setShowBox={() =>  navigate('/settings/channels/all-channels')} >
                <SuccessPage callNewData={createChannel}/>
            </ConfirmBox>
        ), [location])
        return (
            <>
             {(location.pathname.split('/')[location.pathname.split('/').length - 1] === 'success_auth') && memoizedCreateBox}    

            <Box p='15px'>
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('CreateChannel')}</Text>
                <Text  mb='.5vh' mt='2vh' fontSize={'.9em'} fontWeight={'medium'}>{t('Name')}</Text>
                <EditText  maxLength={100} placeholder={t('NewChannelPlaceholder')} hideInput={false} value={name} setValue={(value) => setName(value)}/>
                <Text  mb='.5vh' mt='2vh' fontSize={'.9em'} fontWeight={'medium'}>{t('ChannelType')}</Text>
               
                <Flex mt='.5vh' mb='5vh' flexWrap={'wrap'} gap='10px'>

                    {Object.keys(channelsDict).map((cha, index) => (
                        <Flex key={`channel-${index}`} transition={'background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out'} _hover={{shadow:'md'}} bg={channelType === cha ? 'brand.gray_2':''} onClick={() => setChannelType(cha as Channels)} p='10px' borderRadius={'.5rem'} gap='10px' cursor={'ponter'} alignItems={'center'} borderColor={'gray.200'} borderWidth={'1px'}>
                            <Icon as={channelsDict[cha as Channels][1]}/>
                            <Text fontSize={'.9em'}>{channelsDict[cha as Channels][0]}</Text>
                        </Flex>
                    ))}
                 </Flex>
                <CreateComponent/>
             </Box>
        </>)
    }
    const memoizedCreateChannel = useMemo(() => (
        <ConfirmBox setShowBox={setShowCreateChannel}> 
            < CreateChannel/>
        </ConfirmBox>
    ), [showCreateChannel])

    return (<> 
        {showCreateChannel && memoizedCreateChannel}
 
        <Box p='2vw' > 
            <Flex alignItems={'end'} justifyContent={'space-between'}> 
                <Box> 
                    <Text fontSize={'1.5em'} fontWeight={'medium'}>{t('Channels')}</Text>
                    <Text color='gray.600' fontSize={'.9em'}>{t('AllChannelsDes')}</Text>
                </Box>
                <Button size='sm' leftIcon={<FaPlus/>} variant={'main'} onClick={() => setShowCreateChannel(true)}>{t('CreateChannel')}</Button>
            </Flex>
             
            <Box bg='gray.300' h='1px' mt='2vh' mb='2vh' w='100%'/>

            <Box width={'calc(96vw - 275px)'}> 
                <Table data={channelsData} CellStyle={CellStyle} excludedKeys={['uuid','id']} onClickRow={(row) => navigate(`/settings/channels/${row.channel_type}/${row.id}`)} columnsMap={{ 'name':[t('Name'), 300], 'channel_type':[t('ChannelType'), 200],  'display_id':[t('Account'), 300], 'is_active':[t('Status'), 200]}} noDataMessage={t('NoChannels')} />
            </Box>
        </Box>
    </>)
}

export default AllChannels

//LIST OF ACCOUNTS THAT WILL BE SHOWED AFETR SUCESS AUTH
const SuccessPage = ({ callNewData}:{callNewData:(data:any) => void}) => {

    
    //CONSTANTS
    const  { t } = useTranslation('settings')
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()
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
        setWaitingSend(true)
        await callNewData({instagram_username:pages[selectedPage].name, page_id:pages[selectedPage].id,access_token:pages[selectedPage].access_token, instagram_business_account_id:pages[selectedPage].instagram_business_account.id})
        setWaitingSend(false)
        
        navigate('/settings/channels/all-channels')
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
