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
        <Box p='20px' maxW='450px'> 
            <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('CreateBusiness')}</Text>
            <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.200'/>
            <Text fontWeight={'medium'} mb='.5vh' fontSize={'.9em'}>{t('Name')}</Text>
            <EditText value={businessName} setValue={setBusinessName} hideInput={false} placeholder='Ejemplo'/>
            <Text mt='2vh' fontWeight={'medium'} mb='.5vh' fontSize={'.9em'}>{t('Domain')}</Text>
            <EditText value={businessDomain} setValue={setBusinessDomain} hideInput={false} placeholder='ejemplo.com'/>
                        
        </Box>
        <Flex  maxW='450px' p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
            <Button  size='sm' variant={'main'} isDisabled={businessName === '' || businessDomain === ''} onClick={createBusiness}>{waitingCreate?<LoadingIconButton/>:t('CreateBusiness')}</Button>
            <Button  size='sm' variant={'common'} onClick={()=>setShowBox(false)}>{t('Cancel')}</Button>
        </Flex>
    </>)
}

export default CreateBusiness

