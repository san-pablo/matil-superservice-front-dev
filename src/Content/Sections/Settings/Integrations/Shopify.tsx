//REACT
import { useState, useEffect, useRef, memo } from "react"
import { useAuth } from "../../../../AuthContext"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Skeleton, Flex, Button } from "@chakra-ui/react"
//COMPONENTS
import ConfirmBox from "../../../Components/Reusable/ConfirmBox"
import ShopifyLoginButton from "./ShopifyLoginButton"
import EditText from "../../../Components/Reusable/EditText"
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
import ChannelInfo from "../Channels/Components/Channelnfo"
//ICONS
import { FaPlus } from "react-icons/fa6"
//TYPING
import { configProps } from "../../../Constants/typing"
 
//MAIN FUNCTION
function Whatsapp () {

    //AUTH CONSTANT
    const auth = useAuth()

    //WAIT INFO BOOLEAN
    const [waitingIndex, setWaitingIndex] = useState<number | null>(null)

    //BOOLEAN FOR CREATING AN ACCOUNT
    const [showCreateAccount, setShowCreateAccount] = useState<boolean>(false)

    //DATA
    const [data, setData]  =useState<any[]>([{id:0, name:'Coolway', access_token:'4irguyrfv43uib43eriuyu3fu4eygv3r4uv3r4'}])
    const dataRef = useRef<any>([{id:0, name:'Coolway', access_token:'4irguyrfv43uib43eriuyu3fu4eygv3r4uv3r4'}])
      
    //FETCH DATA
    useEffect(() => {
        document.title = `Integraciones - Shopify - ${auth.authData.organizationName} - Matil`
        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/whatsapp`,  setValue: setData, auth})   
            if (response?.status === 200) dataRef.current = response.data
        }
        fetchInitialData()
    }, [])

    const callNewWhatsapp = async() => {
        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/whatsapp`,  setValue: setData, auth})
        setShowCreateAccount(false)
    }

     const CreateNewAccount = () => {
        const [shop, setShop] = useState<string>('')
       
        return(
        <Box p='15px'> 
            <Text fontWeight={'medium'} fontSize={'.9em'}>Nombre de la cuenta</Text>
            <Box mb='2vh' mt='1vh'> 
                <EditText placeholder="Cuenta de Shopify" value={shop} setValue={setShop} hideInput={false}/>
            </Box>
            <ShopifyLoginButton shop={shop}/>
        </Box>)
     }
 
    const sendConfigDict = async (index:number) => {
        setWaitingIndex(index)
        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/whatsapp`, method:'put', requestForm:data[index], auth, toastMessages:{'works':'Configuración actualizado con éxito', 'failed':'Hubo un error al actualizar la información'}})
        if (response?.status === 200) dataRef.current = data
        setWaitingIndex(null)
    }

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


    return(<>
    {showCreateAccount && 
        <ConfirmBox setShowBox={setShowCreateAccount} isSectionWithoutHeader={true}>
           <CreateNewAccount/>
        </ConfirmBox>}
        <Box> 
            <Flex justifyContent={'space-between'}> 
                <Text fontSize={'1.4em'} fontWeight={'medium'}>Cuentas activas (Shopify)</Text>
                <Button whiteSpace='nowrap'  minWidth='auto'leftIcon={<FaPlus/>} onClick={() =>setShowCreateAccount(true)}>Crear Cuenta</Button>
            </Flex>            
            <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh' mb='4vh'/>
        </Box>
        <Skeleton isLoaded={dataRef.current !== null && data !== null}> 
                {data.length === 0 ? <Text mt='3vh'>{auth.authData.organizationName} no tiene cuentas activas de Shopify</Text>:
                <> 
                {data.map((bot, index) => (
                <Box bg='white' p='1vw' key={`whatsapp-channel-${index}`} borderRadius={'.7rem'} mt={index === 0?'':'8vh'} boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.1)'} > 
                    <Flex justifyContent={'space-between'} > 
                        <Box width={'100%'} maxWidth={'600px'}> 
                            <EditText value={bot.name} maxLength={100} nameInput={true} size='md'fontSize='1.5em'  setValue={(value:string) => handleNameChange(index, value)}/>
                        </Box>
                     
                        <Button isDisabled={JSON.stringify(dataRef.current[index]) === JSON.stringify(data[index]) } onClick={() => sendConfigDict(index)} whiteSpace='nowrap'>{waitingIndex === index?<LoadingIconButton/>:'Guardar cambios'}</Button>
                    </Flex>
                    <Box height={'1px'} mt='2vh'mb='2vh' width={'100%'} bg='gray.300'/>
                    <Flex px='7px' key={`whatsapp-${index}`} width={'100%'} gap='5vw'> 
                    <Box flex='1'> 
                            <ChannelInfo value={bot.access_token} title="Token de acceso" description="Clave de seguridad para la API"/>
                        </Box>            
                    </Flex>
                    </Box>
                ))} 
                </>}
      
        </Skeleton>
       
    </>)
}

export default Whatsapp