//REACT
import { useState } from 'react'
import { useAuth } from '../../../AuthContext'
//FRONT
import { Flex, Box, Button, Text } from '@chakra-ui/react'
//COMPONENTS
import LoadingIconButton from '../../Components/LoadingIconButton'
import fetchData from '../../API/fetchData'
import EditText from '../../Components/EditText'


//MAIN FUNCTION
const CreateBusiness = ({setShowBox, actionTrigger}:{setShowBox:(key:boolean) => void, actionTrigger:any}) => {

    //CONSTANTS
    const auth = useAuth()

    //BOOLEAN FOR WAIT THE CREATION
    const [waitingCreate, setWaitingCreate] = useState<boolean>(false)

    //BUSINESS NAME
    const [businessName, setBusinessName] = useState<string>('')

    //BUSINESS DOMAINS
    const [businessDomain, setBusinessDomain] = useState<string>('')
   
    //FUNCTION FOR CREATE A NEW BUSINESS
    const createBusiness = async () => {
        const businessData = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/contact_businesses`, method:'post', setWaiting:setWaitingCreate, requestForm:{name:businessName, domain:businessDomain}, auth, toastMessages:{'works':'Empresa creada con éxito', 'failed':'Hubo un error al crear la empresa'}})
        setShowBox(false)
        if (businessData?.status === 200) actionTrigger( businessData?.data.contact_business)
    }

    return(<> 
        <Box p='15px' maxW='450px'> 
            <Text fontWeight={'medium'} fontSize={'1.2em'}>Crear Empresa de Contacto</Text>
            <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
            <Text fontWeight={'medium'} mb='.5vh'>Nombre</Text>
            <EditText value={businessName} setValue={setBusinessName} hideInput={false} placeholder='Ejemplo'/>
            <Text mt='2vh' fontWeight={'medium'} mb='.5vh'>Dominio</Text>
            <EditText value={businessDomain} setValue={setBusinessDomain} hideInput={false} placeholder='ejemplo.com'/>
                        
        </Box>
        <Flex  maxW='450px' p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
            <Button  size='sm' color='white' isDisabled={businessName === '' || businessDomain === ''} bg='brand.gradient_blue' _hover={{bg:'brand.gradient_blue_hover'}} onClick={createBusiness}>{waitingCreate?<LoadingIconButton/>:'Crear Empresa'}</Button>
            <Button  size='sm' onClick={()=>setShowBox(false)}>Cancelar</Button>
        </Flex>
    </>)
}

export default CreateBusiness

