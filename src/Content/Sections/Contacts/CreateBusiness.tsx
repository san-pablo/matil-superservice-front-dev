//REACT
import { useState } from 'react'
import { useAuth } from '../../../AuthContext'
//FRONT
import { Flex, Box, Button, Text } from '@chakra-ui/react'
//COMPONENTS
import LoadingIconButton from '../../Components/Reusable/LoadingIconButton'
import fetchData from '../../API/fetchData'
import EditText from '../../Components/Reusable/EditText'
import { useTranslation } from 'react-i18next'
import { useAuth0 } from '@auth0/auth0-react'


//MAIN FUNCTION
const CreateBusiness = ({setShowBox, actionTrigger}:{setShowBox:(key:boolean) => void, actionTrigger:any}) => {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('businesses')
    const { getAccessTokenSilently } = useAuth0()

    //BOOLEAN FOR WAIT THE CREATION
    const [waitingCreate, setWaitingCreate] = useState<boolean>(false)

    //BUSINESS NAME
    const [businessName, setBusinessName] = useState<string>('')

    //BUSINESS DOMAINS
    const [businessDomain, setBusinessDomain] = useState<string>('')
   
    //FUNCTION FOR CREATE A NEW BUSINESS
    const createBusiness = async () => {
        const businessData = await fetchData({endpoint:`${auth.authData.organizationId}/contact_businesses`, method:'post',getAccessTokenSilently, setWaiting:setWaitingCreate, requestForm:{name:businessName, domain:businessDomain}, auth, toastMessages:{'works': t('CorrectCreated'), 'failed':t('FailedtCreated')}})
        setShowBox(false)
        if (businessData?.status === 200) actionTrigger( businessData?.data.contact_business)
    }

    return(<> 
        <Box p='15px' maxW='450px'> 
            <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('CreateBusiness')}</Text>
 
            <Text mt='2vh' fontWeight={'medium'} mb='.5vh' fontSize={'.8em'}>{t('Name')}</Text>
            <EditText value={businessName} setValue={setBusinessName} hideInput={false} placeholder='Ejemplo'/>
            <Text mt='2vh' fontWeight={'medium'} mb='.5vh' fontSize={'.8em'}>{t('Domain')}</Text>
            <EditText value={businessDomain} setValue={setBusinessDomain} hideInput={false} placeholder='ejemplo.com'/>
                        
  
        <Flex  maxW='450px'  mt='2vh' gap='15px' flexDir={'row-reverse'}>
            <Button  size='sm' variant={'main'} isDisabled={businessName === '' || businessDomain === ''} onClick={createBusiness}>{waitingCreate?<LoadingIconButton/>:t('CreateBusiness')}</Button>
            <Button  size='sm' variant={'common'} onClick={()=>setShowBox(false)}>{t('Cancel')}</Button>
        </Flex>
        </Box>
    </>)
}

export default CreateBusiness

