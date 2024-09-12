//REACT
import { useState, useEffect, useRef, useMemo } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Skeleton, Flex, Button } from "@chakra-ui/react"
//COMPONENTS
import ChannelInfo from "./Components/Channelnfo"
import ConfirmBox from "../../../Components/Reusable/ConfirmBox"
import FacebookLoginButton from "./SignUp-Buttons/FacebookLoginButton"
import GetMatildaConfig from "./GetMatildaConfig"
import EditText from "../../../Components/Reusable/EditText"
import SaveData from "./Components/SaveData"
//ICONS
import { FaPlus } from "react-icons/fa6"
//TYPING
import { configProps } from "../../../Constants/typing"
 

const CreateNewAccount = ({callNewWhatsapp}:{callNewWhatsapp:() => void}) => {
    
    const  { t } = useTranslation('settings')
    const [name, setName] = useState<string>('')
    
    return(
        <Box p='15px'> 
            <Text fontWeight={'medium'} fontSize={'.9em'}>{t('AccountName')}</Text>
            <Box mb='2vh' mt='1vh'> 
                <EditText placeholder={t('Account')} value={name} setValue={setName} hideInput={false}/>
            </Box>
            <Flex flexDir={'row-reverse'}> 
                <FacebookLoginButton name={name} loadDataFunc={() => callNewWhatsapp()}/>
            </Flex>
        </Box>)
 }


//MAIN FUNCTION
function Whatsapp () {

    //AUTH CONSTANT
    const auth = useAuth()
    const  { t } = useTranslation('settings')

    //BOOLEAN FOR CREATING AN ACCOUNT
    const [showCreateAccount, setShowCreateAccount] = useState<boolean>(false)

    //DATA
    const [data, setData]  =useState<any[]>([])
    const dataRef = useRef<any>(null)
      
    //FETCH DATA
    useEffect(() => {
        document.title = `${t('Channels')} - Whatsapp - ${auth.authData.organizationName} - Matil`
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

    const memoizedCreateBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowCreateAccount} isSectionWithoutHeader={true}>
          <CreateNewAccount callNewWhatsapp={callNewWhatsapp} />
        </ConfirmBox>
    ), [showCreateAccount])
    

    return(<>
    
        {showCreateAccount && memoizedCreateBox}

        <Box> 
            <Flex justifyContent={'space-between'}> 
                <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('ActiveAcccounts')} (Whatsapp)</Text>
                <Button whiteSpace='nowrap'  minWidth='auto' size='sm' leftIcon={<FaPlus/>} onClick={() =>setShowCreateAccount(true)}>{t('CreateAccount')}</Button>
            </Flex>            
            <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh' mb='4vh'/>
        </Box>

        <SaveData data={data} setData={setData} dataRef={dataRef} channel="whatsapp"/>

        <Skeleton isLoaded={dataRef.current !== null && data !== null}> 
                {data.length === 0 ? <Text mt='3vh'>{t('NoActiveAcccounts', {name:'Whatsapp'})}</Text>:
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
                            <ChannelInfo value={bot.credentials.phone_number} title={t('Phone')} description={t('PhoneDes')}/>
                            <ChannelInfo value={bot.credentials.waba_id} title={t('AccountId')} description={t('AccountIdDes')}/>
                            <ChannelInfo hide={true}  value={bot.credentials.access_token} title={t('AccessToken')} description={t('AccessTokenDes')}/>
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
}

export default Whatsapp