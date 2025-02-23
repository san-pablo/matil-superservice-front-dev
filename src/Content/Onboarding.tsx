 //REACT
import { useTranslation } from "react-i18next"
import { useState, useRef, useMemo } from "react"
import { useAuth } from "../AuthContext"
import { useAuth0 } from "@auth0/auth0-react"
import { useLocation, useNavigate } from "react-router-dom"
//FETCH DATA
import fetchData from "./API/fetchData"
//FRONT
import { Flex, Text, Box, Button, IconButton, Icon } from "@chakra-ui/react"
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion' 
//COMPONENTS
import EditText from "./Components/Reusable/EditText"
import CustomSelect from "./Components/Reusable/CustomSelect"
import LoadingIconButton from "./Components/Reusable/LoadingIconButton"
import ConfirmBox from "./Components/Reusable/ConfirmBox"
//FUNCTIONS
import useOutsideClick from "./Functions/clickOutside"
import parseMessageToBold from "./Functions/parseToBold"
//ICONS
import { IoIosArrowBack } from "react-icons/io"
import { FaEye } from "react-icons/fa"
//TYPING
import { languagesFlags } from "./Constants/typing"
  
const Onboarding = () => {

    //CONSTANTS
    const { t } = useTranslation('main')
    const navigate = useNavigate()
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()
    const location = useLocation().pathname

    //WAITIGN CREATE
    const [waiting, setWaiting] = useState<boolean>(false)

    //CREATE NEW VARIABLES
    const [name, setName] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [language, setLanguage] = useState<string>('ES')


    const createNewOrganization = async() => {

        setWaiting(true)
        const response = await fetchData({endpoint: `user/organizations`, method:'post', requestForm:{name, description, language}, getAccessTokenSilently, auth })
        if (response?.status === 200) {
            const responseOrg = await fetchData({endpoint:`${response.data.id}/user_access`,  getAccessTokenSilently, auth})
            localStorage.removeItem('lastView')
            localStorage.removeItem('lastSettingsSection')
            localStorage.removeItem('recentSearches')
            localStorage.setItem('currentOrganization', response.data.id)

            auth.setAuthData({views:null})
            auth.setAuthData({ organizationId: response.data.id,organizationName:name, users:responseOrg.data, views:null, userData:{...auth.authData.userData, organizations:[...auth.authData.userData.organizations,{id:response.data.id, name}]} })

            auth.setAuthData({...responseOrg.data})

        }
        navigate(-1)
        setWaiting(false)
    }
    return (<>
   

 
        <Flex flexDir={'column'} pos='fixed'  h='100vh' w='100vw' top={0} left={0} zIndex={1000000000000} bg='clear_white'  justifyContent={'center'} alignItems={'center'}>
            
            <IconButton aria-label="go-back" pos='absolute' bg='transparent' left={'2vw'} top='2vw' onClick={() => navigate(-1)} icon={<IoIosArrowBack size='20px'/>} variant={'common'}/>

            <Box  borderRadius={'1rem'} borderWidth={'1px'} borderColor={'border_color'} p='2vw' shadow={'lg'}> 
               
            {location.endsWith('create') ? <>
               <Text   fontWeight={'medium'} fontSize={'2em'}>{t('CreateNewOrganization')}</Text>
                <Text mt='2vh' color='text_gray' fontWeight={'medium'}>{t('CreateNewOrganizationDes')}</Text>

                <Box w='350px' mt='3vh'> 
                    <Text   mb='.5vh' fontWeight={'medium'} color='text_gray'>{t('Name')}</Text>
                    <EditText fontSize=".9em"  value={name} placeholder={t('Name') + '...'} setValue={setName} hideInput={false} />

                    <Text  mt='2vh' mb='.5vh' fontWeight={'medium'} color='text_gray'>{t('Description')}</Text>
                    <EditText isTextArea fontSize=".9em"  value={description} placeholder={t('Description') + '...'} setValue={setDescription} hideInput={false} />


                    <Text  mt='2vh' mb='.5vh' fontWeight={'medium'} color='text_gray'>{t('Language')}</Text>
                    <CustomSelect markSelect fontSize=".9em" selectedItem={language} setSelectedItem={setLanguage as any} hide={false} options={Object.keys(languagesFlags)} iconsMap={languagesFlags}/>
                
                 </Box>

                 <Button size='md' variant={'main'} mt='3vh' w='100%' isDisabled={name === ''} onClick={createNewOrganization}>{waiting? <LoadingIconButton/>:t('CreateOrganization')}</Button>
                </>
                :
                <InvitationsBox/>
    }
            </Box>
    
        </Flex>
        
    </>)
}


const InvitationsBox = () => {

    const auth = useAuth()
    const { t } = useTranslation('main')
    const navigate = useNavigate()
    //CONTROL ORGANIZATION VISIBILITY
    const organizationButtonRef = useRef<HTMLDivElement>(null)
    const organizationBoxRef = useRef<HTMLDivElement>(null)
    const [showInvitations, setShowInvitations] = useState<boolean>(false)
    useOutsideClick({ref1:organizationButtonRef, ref2:organizationBoxRef, onOutsideClick:setShowInvitations})

    const { getAccessTokenSilently } = useAuth0()

    const InviteItem = ({inv}:{inv:any}) => {

        const [waitingAccept, setWaitingAccept] = useState<boolean>(false)
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

        const inviteAction = async (id:string, type:'accept' | 'reject', name:string, organization_id:string) => {
            if (type === 'accept') {
                const response = await fetchData({endpoint: `user/invitations/${id}`, method:'post', setWaiting:setWaitingAccept, getAccessTokenSilently, auth, toastMessages:{works:t('CorrectInvitation'), failed:t('FailedInvitation')} })
                if (response?.status === 200) {
 
                    const responseOrg = await fetchData({endpoint:`${organization_id}/user_access`,  getAccessTokenSilently, auth})

        
                    if (responseOrg.status === 200) {
                        localStorage.removeItem('lastView')
                        localStorage.removeItem('lastSettingsSection')
                        localStorage.removeItem('recentSearches')
                        localStorage.setItem('currentOrganization', organization_id)
                        auth.setAuthData({views:null})
                        auth.setAuthData({ organizationId: organization_id as any, organizationName:name, users:responseOrg.data, views:null, userData:{...auth.authData.userData, organizations:[...auth.authData.userData.organizations,{id:organization_id, name}]} })
                        auth.setAuthData({...responseOrg.data})
                    }                    
                    navigate(-1)
                }
            }
            else {
                const response = await fetchData({endpoint: `user/invitations/${id}`, method:'delete', setWaiting:setWaitingDelete, getAccessTokenSilently, auth })
                if (response?.status === 200) auth.setAuthData({userData:{...auth.authData.userData, invitations:auth.authData.userData.invitations.filter((invite:any) => invite.id !== id)}})
            }
         }
         return (
            <Box mt='2vh' fontSize={'.9em'} p='10px' key={`organization-${inv.id}`} borderColor={'border_color'} borderWidth={'1px'} alignItems={'center'}  position={'relative'} gap='7px' justifyContent={'space-between'}  cursor={'pointer'} borderRadius={'.5rem'}>                       
                <Text whiteSpace={'nowrap'} fontWeight={'medium'} fontSize={'1.2em'}> {inv.organization_name}</Text>
                <Text whiteSpace={'nowrap'} color={'text_gray'}>{parseMessageToBold(t('SelectedRol', {role:inv.role_name}))}</Text>
                <Flex mt={'2vh'} gap='7px' flexDir={'row-reverse'}>
                    <Button size='xs' fontSize={'.9em'} variant={'main'} onClick={() => {inviteAction(inv.id, 'accept', inv.organization_name, inv.organization_id)}}>{waitingAccept ? <LoadingIconButton/>:t('Accept')}</Button>
                    <Button size='xs'fontSize={'.9em'} variant={'delete'} onClick={() => {inviteAction(inv.id, 'reject', inv.organization_name,  inv.organization_id)}}>{waitingDelete ? <LoadingIconButton/>:t('Reject')}</Button>
                </Flex>
            </Box>
         )

    }
  
    console.log(auth.authData)
    return(<> 
     
        <Box p='20px' minW={'400px'}>
            <Text fontWeight={'medium'}  textAlign={'center'}  fontSize={'2em'} mb='1vh'>{t('PendingInvitations')}</Text>
            <Box maxH={'50vh'} overflow={'scroll'}> 
            {auth.authData.userData?.invitations.length > 0 ?<>
            {auth.authData.userData.invitations.map((inv:any, index:number) => (
                <InviteItem key={`invitation-${index}`} inv={inv}/>
            ))}
            </>:<> 
            <Text color='text_gray' fontSize={'1em'} >{t('NoInvitations')}</Text>
            <Button variant={'main'} mt='3vh' size={'sm'} onClick={() => navigate('create')}>{t('CreateOrganization')}</Button>
            </>
            }
            </Box>
               
        </Box>
      
    </>)
}
 

export default Onboarding