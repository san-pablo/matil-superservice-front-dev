//REACT
import { useState, useEffect, useRef, useMemo } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Skeleton, Flex, Button, Icon, Tooltip, IconButton } from "@chakra-ui/react"
//COMPONENTS
import CodeMirror from "@uiw/react-codemirror"
import { html } from "@codemirror/lang-html"
import { oneDark } from "@codemirror/theme-one-dark"
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
import EditText from "../../../Components/Reusable/EditText"
import showToast from "../../../Components/Reusable/ToastNotification"
import ConfirmBox from "../../../Components/Reusable/ConfirmBox"
import SaveChanges from "../../../Components/Reusable/SaveChanges"
//FUCNTIONS
import copyToClipboard from "../../../Functions/copyTextToClipboard"
import parseMessageToBold from "../../../Functions/parseToBold"
//ICONS
import { Bs1CircleFill, Bs2CircleFill, Bs3CircleFill,  BsClipboard2Check } from "react-icons/bs"
import { HiTrash } from "react-icons/hi2"
//TYPING
import { ConfigProps } from "../../../Constants/typing"
    
interface MailProps { 
  id:string
  name:string
  display_id:string
  external_id:string
  matilda_configuraion:any 
  configuration:{is_ses_verified:boolean, is_forward_verified:boolean, template:string  }
}
 
 
//MAIN FUNCTION
function Mail () {

    //AUTH CONSTANT
    const auth = useAuth()
    const { t } = useTranslation('settings')
    const explanationTemplateText = useRef<HTMLParagraphElement>(null)
    const { getAccessTokenSilently } = useAuth0()
    
    //LIST OF CHANNELS
    const [channelsList, setChannelsList] = useState<null | any[]>(null)
    const matildaScrollRef = useRef<HTMLDivElement>(null)

    //DELETE AN ACCOUNT
    const [showDelete, setShowDelete] = useState<boolean>(false)

    //WAITING BOOLEANS FOR CREATING AN ACCOUNT
    const [waitingSend, setWaitingSend] = useState<boolean>(false)
    const [waitignCreate, setWaitingCreate] = useState<boolean>(false)
    const [waitignSes, setWaitingSes] = useState<boolean>(false)
    const [waitignForward, setWaitingForward] = useState<boolean>(false)

    //DATA
    const [introducedName, setIntroducedName] = useState<boolean>(false)
    const [data, setData] = useState<MailProps | null>(null)
    const dataRef = useRef<any>(null)
    const location = useLocation().pathname
    const channelId = location.split('/')[location.split('/').length - 1]

    //MATILDA CONFIGURATION+
    const configIdRef = useRef<string>('')
    const [selectedConfigId, setSelectedConfigId] = useState<string>('')
    const [configData, setConfigData] = useState<ConfigProps[] | null>(null)

    //FETCH DATA
    useEffect(() => {
      document.title = `${t('Channels')} - ${t('Mail')} - ${auth.authData.organizationName} - Matil`

      const fetchInitialData = async() => {
        await fetchData({endpoint:`${auth.authData.organizationId}/settings/matilda_configurations`, setValue:setConfigData, auth, getAccessTokenSilently})

        const responseMail = await fetchData({endpoint:`${auth.authData.organizationId}/settings/channels/${channelId}`,  setValue: setData, auth, getAccessTokenSilently})
          if (responseMail?.status === 200) {
            setIntroducedName(true)
            dataRef.current = responseMail.data.configuration
            setSelectedConfigId(responseMail.data.matilda_configuration_id)
            configIdRef.current = responseMail.data.matilda_configuration_id
          }
        } 

      fetchInitialData()
    }, [])

    const sendFirstEmailVerification = async () => {
      const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/channels/email`, method:'post',setWaiting:setWaitingCreate,getAccessTokenSilently, requestForm:{name:data?.display_id,email_address:data?.display_id}, auth, toastMessages:{works:t('CorrectCreatedMail'), failed:t('FailedCreatedMail')}})
      if (response?.status === 200) setIntroducedName(true)
    }

    const sendEmailSes = async () => {
      const responseMail = await fetchData({endpoint:`${auth.authData.organizationId}/settings/channels/${data?.display_id}`, setWaiting:setWaitingSes,getAccessTokenSilently, setValue: setData, auth})
      if (responseMail?.status === 200) showToast({message:t('CorectSes')})
      else showToast({message:t('FailedtSes'), type:'failed'})
    }

    const sendEmailForward = async () => {
      const responseMail = await fetchData({endpoint:`${auth.authData.organizationId}/settings/channels/${data?.display_id}`,  setValue: setData, auth,getAccessTokenSilently,  requestForm:{...data, configuration:{...data.configuration, is_forward_verified:true}}, toastMessages:{works:t('CorrectCreatedMail'), failed:t('FailedCreatedMail')}})
      if (responseMail?.status === 200) {
        setIntroducedName(true)
        dataRef.current = responseMail.data
      }
    }

    const saveChanges = async () => {
      const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/channels/${dataRef.current.id}`, setValue:setWaitingSend, getAccessTokenSilently,setWaiting:setWaitingSend, auth, method:'put', requestForm:{...data, configuration:{...data.configuration, is_forward_verified:true, },  matilda_configuration_id:selectedConfigId}, toastMessages:{'works':t('CorrectUpdatedInfo'), 'failed':t('FailedUpdatedInfo')}})
      if (response?.status === 200) {
          configIdRef.current = selectedConfigId
          dataRef.current = data
      }
  }


    //FUNCTION FOR DELETING THE TRIGGER
    const DeleteComponent = () => {

      //WAITING DELETION
      const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

      //FUNCTION FOR DELETING AN AUTOMATION
      const deleteMail= async () => {
          const response = await fetchData({endpoint: `${auth.authData.organizationId}/settings/channels/${data?.id}`,getAccessTokenSilently,  method: 'delete', setWaiting: setWaitingDelete, auth, toastMessages: {works: t('CorrectDeletedmMail'), failed: t('FailedDeletedMail')}})
          setShowDelete(false)
        }

      //FRONT
      return(<>
          <Box p='20px' > 
              <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ConfirmDelete')}</Text>
              <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='border_color'/>
              <Text >{parseMessageToBold(t('ConfirmDeleteMail', {name:data?.display_id}))}</Text>
          </Box>
          <Flex bg='gray.50' p='20px' gap='10px' flexDir={'row-reverse'}>
              <Button  size='sm' variant={'delete'} onClick={deleteMail}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
              <Button  size='sm' variant={'common'}onClick={() => setShowDelete(false)}>{t('Cancel')}</Button>
          </Flex>
      </>)
  }


    //DELETE BOX
    const memoizedDeleteBox = useMemo(() => (
      <ConfirmBox setShowBox={setShowDelete}> 
          <DeleteComponent/>
      </ConfirmBox>
  ), [showDelete])

    
    //FRONT 
    return(
    <Box p='2vw'>
      
    {showDelete && memoizedDeleteBox}
      <Box> 
        <Flex justifyContent={'space-between'}> 
          <Flex gap='20px' alignItems={'center'}> 
            <Skeleton  isLoaded={data !== null}>

              <Text fontSize={'1.4em'} fontWeight={'medium'}>{data?.name}</Text>
            </Skeleton>
          </Flex>
          <Button variant={'delete_section'} leftIcon={<HiTrash/>} size='sm' onClick={() => setShowDelete(true)}>{t('DeleteAccount')}</Button>
        </Flex>       
        <Box height={'1px'} width={'100%'} bg='border_color' mt='1vh' />
      </Box>
  
   
        {(data === null || data?.display_id === '' || !data?.configuration.is_ses_verified || !data?.configuration.is_forward_verified) ? 
        <Box flex='1' mt='5vh'> 
  
            <Box >
              <Flex gap='15px'>
                  <Icon boxSize={'25px'} as={Bs1CircleFill}/>
                  <Box>
                    <Text fontWeight={'medium'}>{t('IntroduceMail')}</Text>
                    <Text mb='.5vh' color={'text_gray'} fontSize={'.8em'}>{t('IntroduceMailDes')}</Text>
                    <EditText isDisabled={introducedName} placeholder={'example@company.com'} regex={/^[\w\.-]+@[\w\.-]+\.\w+$/} value={data?.display_id} hideInput={false} setValue={(value) => setData(prev => ({...prev as MailProps, display_id:value}))}/>
                  </Box>
              </Flex>
              <Flex mt='2vh' flexDir={'row-reverse'}>
                <Button size='sm'  variant={'main'} onClick={sendFirstEmailVerification}>{waitignCreate?<LoadingIconButton/>:t('CreateMail')}</Button>
              </Flex>
            </Box>

            {introducedName && <>
            <Box width={'100%'} height={'1px'} bg='border_color' mt='3vh' mb='5vh'/>
            <Box >
            <Flex gap='15px'>
                <Icon boxSize={'25px'} as={Bs2CircleFill}/>
                <Box>
                  <Text fontWeight={'medium'}>{t('MailVerification')}</Text>
                  <Text mb='.5vh' color={'text_gray'} fontSize={'.8em'}>{t('MailVerificationDes')}</Text>
                  <Flex ml='20px' mt='10px' gap='5px'> 
                      <Icon color='blue.300' as={Bs1CircleFill}/>
                      <Text mb='.5vh' color={'text_gray'} fontSize={'.8em'}>{t('MailVerificationDes1')}</Text>
                  </Flex>
                  <Flex ml='20px' gap='5px'> 
                      <Icon color='blue.300' as={Bs2CircleFill}/>
                      <Text mb='.5vh' color={'text_gray'} fontSize={'.8em'}>{t('MailVerificationDes2')}</Text>
                  </Flex>
                </Box>
            </Flex>
            <Flex mt='2vh' flexDir={'row-reverse'}>
              <Button size='sm'  variant={'main'} onClick={sendEmailSes}>{waitignSes?<LoadingIconButton/>:t('VerifiedIdentity')}</Button>
            </Flex>
            </Box>
            </>}


            {(data?.configuration.is_ses_verified)  && <>
              <Box width={'100%'} height={'1px'} bg='border_color' mt='3vh' mb='5vh'/>
              <Box >
              <Flex gap='15px'>
                  <Icon boxSize={'25px'} as={Bs3CircleFill}/>
                  <Box>
                    <Text fontWeight={'medium'}>{t('ForwardConfig')}</Text>
                    <Text mb='.5vh' color={'text_gray'} fontSize={'.8em'}>{t('ForwardConfigDes')}</Text>
                    <Flex alignItems={'center'} gap='10px'> 
                        <Text  fontSize={'.9em'} fontWeight={'medium'}>{`${data.external_id}@parse.matil.es`}</Text>
                        <Tooltip label={t('CopyMail')}  placement='top' hasArrow bg='black' color='white'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                            <IconButton size='xs' onClick={() => copyToClipboard(`${data.external_id}@parse.matil.es`, t('CorrectCopiedMail'))}  aria-label={'copy-invitation-code'} icon={<BsClipboard2Check/>}/>
                        </Tooltip>
                      </Flex>
                      <Text mt='.5vh' color={'text_gray'} fontSize={'.8em'}>{t('ForwardConfigDes1')}</Text>
                  </Box>
              </Flex>
              <Flex mt='2vh' flexDir={'row-reverse'}>
                <Button size='sm'  variant={'main'}onClick={sendEmailForward}>{waitignForward?<LoadingIconButton/>:t('VerifyMail')}</Button>
              </Flex>
            </Box>
            </>}
 
        </Box>
        :<>

    <SaveChanges  onSaveFunc={saveChanges} data={selectedConfigId} dataRef={configIdRef} setData={setSelectedConfigId} areNullEnabled/>

        <Flex flex='1' overflow={'hidden'} width={'100%'} gap='5vw'> 
          <Box flex='1' pt='4vh' overflow={'scroll'}> 

            <Skeleton  isLoaded={data !== null}>
              
              <Text fontSize={'1.1em'} mb='.5vh' fontWeight={'medium'}>{t('Name')}</Text>
              <EditText value={data.display_id} setValue={(value) => setData(prev => ({...prev as MailProps, display_id:value}))} isDisabled/>
              <Text fontSize={'1.1em'} mt='3vh' fontWeight={'medium'}>{t('Template')}</Text>
              <Text ref={explanationTemplateText} mb='1vh' color='text_gray' fontSize={'.8em'}>{t('TemplateDes')}</Text>
              <Box width={'100%'} height={'100%'}> 
                <CodeMirror value={data.configuration.template}  extensions={[html()]} onChange={(value) => setData(prev => ({...prev as MailProps, configuration:{...(prev as MailProps)?.configuration, template:value}}))} theme={oneDark}/>
              </Box>
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
          
        </>}
 
 
    </Box>)
}

export default Mail
