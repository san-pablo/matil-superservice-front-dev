//REACT
import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Skeleton, Flex, Button, Icon, Tooltip, IconButton } from "@chakra-ui/react"
//COMPONENTS
import ChannelInfo from "./Components/Channelnfo"
import GetMatildaConfig from "./GetMatildaConfig"
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
import EditText from "../../../Components/Reusable/EditText"
import SaveData from "./Components/SaveData"
import showToast from "../../../Components/ToastNotification"
//FUCNTIONS
import copyToClipboard from "../../../Functions/copyTextToClipboard"
//ICONS
import { Bs1CircleFill, Bs2CircleFill, Bs3CircleFill,  BsClipboard2Check } from "react-icons/bs"
//TYPING
import { configProps } from "../../../Constants/typing"
  
interface MailProps { 
  id:string
  uuid:string
  display_id:string
  matilda_configuraion:any 
  configuration:{is_ses_verified:boolean,   is_forward_verified:boolean, template:string  }
 }

//MAIN FUNCTION
function Mail () {

    //AUTH CONSTANT
    const auth = useAuth()
    const  { t } = useTranslation('settings')

    //WAITING BOOLEANS FOR CREATING AN ACCOUNT
    const [waitignCreate, setWaitingCreate] = useState<boolean>(false)
    const [waitignSes, setWaitingSes] = useState<boolean>(false)
    const [waitignForward, setWaitingForward] = useState<boolean>(false)


    //DATA
    const [selectedUuid, setSelectedUuid] = useState<string>('')
    const [introducedName, setIntroducedName] = useState<boolean>(true)
    const [data, setData] = useState<MailProps | null>(null)
    const dataRef = useRef<any>(null)

    //FETCH DATA
    useEffect(() => {
      document.title = `${t('Channels')} - ${t('Mail')} - ${auth.authData.organizationName} - Matil`

      const fetchInitialData = async() => {
          const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/all_channels_basic_data`, auth})
           if (response?.status === 200){
            let mailChannel 
            response.data.map((cha:any) => {if (cha.channel_type === 'email')  mailChannel = cha.id})
            if (mailChannel) {
              const responseMail = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/${mailChannel}`,  setValue: setData, auth})
              if (responseMail?.status === 200) {
                setIntroducedName(true)
                setSelectedUuid(responseMail.data.uuid)
                dataRef.current = responseMail.data
              }
            }
            else {
              setData({id:'', uuid:'', display_id:'', matilda_configuraion:{}, configuration:{is_ses_verified:false, is_forward_verified:false, template:''} })
              setIntroducedName(false)
            }
          }
      }
      fetchInitialData()
    }, [])


    const sendFirstEmailVerification = async () => {
      console.log({name:data?.display_id,email_address:data?.display_id})
      const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/email`, method:'post',setWaiting:setWaitingCreate, requestForm:{name:data?.display_id,email_address:data?.display_id}, auth, toastMessages:{works:t('CorrectCreatedMail'), failed:t('FailedCreatedMail')}})
      if (response?.status === 200) setIntroducedName(true)
    }

    const sendEmailSes = async () => {
      const responseMail = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/${data?.id}`, setWaiting:setWaitingSes, setValue: setData, auth})
      if (responseMail?.status === 200) showToast({message:t('CorectSes')})
      else showToast({message:t('FailedtSes'), type:'failed'})
    }

    const sendEmailForward = async () => {
      const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/email_ses_verification`,method:'post', setWaiting:setWaitingCreate, requestForm:{email_address:data?.display_id}, auth, toastMessages:{works:t('CorrectCreatedMail'), failed:t('FailedCreatedMail')}})
      if (response?.status === 200) setIntroducedName(true)
    }

    //FRONT 
    return(<> 
    <Box> 
      <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('Mail')}</Text>
      <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh' mb='5vh'/>
    </Box>

    <Skeleton maxW={'800px'} isLoaded={data !== null}>
      {(data?.display_id === '' || !data?.configuration.is_ses_verified || !data?.configuration.is_forward_verified) ? <>
        <Box >
          <Flex gap='15px'>
              <Icon boxSize={'25px'} as={Bs1CircleFill}/>
              <Box>
                <Text fontWeight={'medium'}>{t('IntroduceMail')}</Text>
                <Text mb='.5vh' color={'gray.600'} fontSize={'.8em'}>{t('IntroduceMailDes')}</Text>
                <EditText isDisabled={introducedName} placeholder={'example@company.com'} regex={/^[\w\.-]+@[\w\.-]+\.\w+$/} value={data?.display_id} hideInput={false} setValue={(value) => setData(prev => ({...prev as MailProps, display_id:value}))}/>
              </Box>
          </Flex>
          <Flex mt='2vh' flexDir={'row-reverse'}>
            <Button size='sm' bg='blackAlpha.800' color='white' _hover={{bg:'blackAlpha.900'}} onClick={sendFirstEmailVerification}>{waitignCreate?<LoadingIconButton/>:t('CreateMail')}</Button>
          </Flex>
        </Box>

        {introducedName && <>
        <Box width={'100%'} height={'1px'} bg='gray.300' mt='3vh' mb='5vh'/>
         <Box >
         <Flex gap='15px'>
             <Icon boxSize={'25px'} as={Bs2CircleFill}/>
             <Box>
               <Text fontWeight={'medium'}>{t('MailVerification')}</Text>
               <Text mb='.5vh' color={'gray.600'} fontSize={'.8em'}>{t('MailVerificationDes')}</Text>
               <Flex ml='20px' mt='10px' gap='5px'> 
                  <Icon color='blue.300' as={Bs1CircleFill}/>
                  <Text mb='.5vh' color={'gray.600'} fontSize={'.8em'}>{t('MailVerificationDes1')}</Text>
               </Flex>
               <Flex ml='20px' gap='5px'> 
                  <Icon color='blue.300' as={Bs2CircleFill}/>
                  <Text mb='.5vh' color={'gray.600'} fontSize={'.8em'}>{t('MailVerificationDes2')}</Text>
               </Flex>
             </Box>
         </Flex>
         <Flex mt='2vh' flexDir={'row-reverse'}>
           <Button size='sm' bg='blackAlpha.800' color='white' _hover={{bg:'blackAlpha.900'}} onClick={sendEmailSes}>{waitignSes?<LoadingIconButton/>:t('VerifiedIdentity')}</Button>
         </Flex>
       </Box>
       </>}

       {(data?.configuration.is_ses_verified)  && <>
        <Box width={'100%'} height={'1px'} bg='gray.300' mt='3vh' mb='5vh'/>
         <Box >
         <Flex gap='15px'>
             <Icon boxSize={'25px'} as={Bs3CircleFill}/>
             <Box>
               <Text fontWeight={'medium'}>{t('ForwardConfig')}</Text>
               <Text mb='.5vh' color={'gray.600'} fontSize={'.8em'}>{t('ForwardConfigDes')}</Text>
               <Flex alignItems={'center'} gap='10px'> 
                  <Text  fontSize={'.9em'} fontWeight={'medium'}>{`${selectedUuid}@parse.matil.es`}</Text>
                  <Tooltip label={t('CopyMail')}  placement='top' hasArrow bg='black' color='white'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                      <IconButton size='xs' onClick={() => copyToClipboard(`${selectedUuid}@parse.matil.es`)}  aria-label={'copy-invitation-code'} icon={<BsClipboard2Check/>}/>
                  </Tooltip>
                </Flex>
                <Text mt='.5vh' color={'gray.600'} fontSize={'.8em'}>{t('ForwardConfigDes1')}</Text>
             </Box>
         </Flex>
         <Flex mt='2vh' flexDir={'row-reverse'}>
           <Button size='sm' bg='blackAlpha.800' color='white' _hover={{bg:'blackAlpha.900'}} onClick={sendEmailForward}>{waitignForward?<LoadingIconButton/>:t('VerifyMail')}</Button>
         </Flex>
       </Box>
       </>}

      </>:
      <Box> 
        <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('ActiveAccounts')} ({t('Mail')})</Text>
        <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh' mb='2vh'/>
      </Box>}
    
    </Skeleton>
    </>)
}

const ChangeCode = ({codeValue, index, editCode}:{codeValue:string, index:number, editCode:(code:string, index:number) => void}) => {
  
  const  { t } = useTranslation('settings')


  return (
  <Box px='7px' mt='5vh'>
    <Text mt='1vh' fontWeight={'medium'}>{t('Template')}</Text>
    <Text mb='1vh' color='gray.600' fontSize={'.8em'}>{t('TemplateDes')}</Text>
    <Box flex='1'> 
      <Box flex='1' dangerouslySetInnerHTML={{ __html: codeValue}}/>
      <Box height={'500px'}  mt='3vh'   bg='black' color='white' p='10px' borderRadius={'.7em'}><textarea style={{outline:'none', background:'transparent', border:'none', width:'100%', height:'100%'}} value={codeValue} onChange={(e) => {editCode(e.target.value, index)}}/></Box>
    </Box>
  </Box>
  )
 }

export default Mail
