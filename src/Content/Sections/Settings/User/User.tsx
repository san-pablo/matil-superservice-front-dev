//REACT
import { useEffect, useRef, useState } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Flex, Button, Icon,Avatar } from "@chakra-ui/react"
import {motion} from 'framer-motion'
//COMPONENTS
import EditText from "../../../Components/Reusable/EditText"
import CustomSelect from "../../../Components/Reusable/CustomSelect"
//ICONS
import { IconType } from "react-icons"
import { IoIosArrowDown } from "react-icons/io"
import {  BsFillTelephoneInboundFill, BsFillTelephoneMinusFill, BsFillTelephoneXFill } from "react-icons/bs"
//TYPING
import { languagesFlags } from "../../../Constants/typing"

//TYPING
interface UserData {
    name: string
    surname: string
    email_address: string
    password: string
    language:string
    shortcuts_activated:boolean
    organizationData:{
        calls_status:'connected' | 'out' | 'disconnected', 
        avatar_image_url:string, 
        groups:{id:number, name:string}[]}
    }

//MOTION BOX
const MotionBox = motion(Box)

const availableLanguages = ['Español', 'English']

//MAIN FUNCTION
const User = () => {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('settings')

    //MAPPING CONSTATS
    let languagesMap:any = {}
    for (const key in languagesFlags) {
        if (languagesFlags.hasOwnProperty(key)) {
            const values = languagesFlags[key]
            if (availableLanguages.includes(values[0])) languagesMap[key] = values[0]
        }
    }   
    const phoneMap:{[key:string]:[string, IconType, string]} = {'connected':[t('Connected'), BsFillTelephoneInboundFill, 'green.400'], 'out':[t('Out'), BsFillTelephoneMinusFill, 'orange.400'], 'disconnected':[t('Disconnected'), BsFillTelephoneXFill, 'gray.400']}
  

    //BOOLEAN FOR WAITING THE UPLOAD
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    //TICKETS DATA
    const userDataRef = useRef<UserData>(auth?.authData?.userData as UserData)
    const [userData, setUserData] = useState<UserData>(auth?.authData?.userData as UserData)

    //SHOW STATUS LIST
    const [showStatusList, setShowStatusList] = useState<boolean>(false)

    //FETCH NEW DATA WHEN THE VIEEW CHANGE
    useEffect(() => {        
        document.title = `${t('User')} - ${t('Profile')} - ${auth.authData.organizationId} - Matil`
     }, [])

    //FUNCTION FOR EDITING EACH KEY
    const handleEditKey = (key:string, value:any) => {
        setUserData(prev => ({...prev, [key]:value}))
    }
 
    return(<>

    <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('Profile')}</Text>
    <Text color='gray.600' fontSize={'.9em'}>{t('Profile_Exp')}</Text>

    <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='5vh'/>

    <Flex alignItems={'center'} justifyContent={'space-between'}>
        <Flex alignItems={'center'} gap='10px'>
            <Avatar src={userData.organizationData.avatar_image_url}/>
            <Box alignItems={'center'} gap='10px'>
                <Text>{t('ProfilePicture')}</Text>
                <Text color={'gray.600'}>{t('ProfilePicture_Exp')}</Text>
            </Box>
        </Flex>

        <Flex alignItems={'center'} gap='10px'>
            <Button size='xs'>{t('AddNewPicture')}</Button>
            <Button size='xs' color='red'>{t('Delete')}</Button>
        </Flex>
    </Flex>
    
    <Flex mt='3vh' gap='30px'>
        <Box flex='1'>
            <Text fontWeight={'medium'}>{t('Name')}</Text>
            <EditText value={userData.name} setValue={(value) => handleEditKey('name', value)}/>
        </Box>
        <Box  flex='1'>
            <Text fontWeight={'medium'}> {t('Surname')}</Text>
            <EditText value={userData.name} setValue={(value) => handleEditKey('surname', value)}/>
        </Box>
    </Flex>

    <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='5vh'/>
    <Box>
        <Text fontWeight={'medium'}> {t('Mail')}</Text>
        <EditText value={userData.email_address} setValue={(value) => handleEditKey('email_address', value)}/>
    </Box>
 
    <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='5vh'/>
    <Box>
        <Text fontWeight={'medium'}> {t('Password')}</Text>
        <EditText value={userData.password} setValue={(value) => handleEditKey('password', value)}/>
    </Box>

    <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='5vh'/>
    <Box>
        <Text fontWeight={'medium'}> {t('Mail')}</Text>
        <EditText value={userData.email_address} setValue={(value) => handleEditKey('email_address', value)}/>
    </Box>
       
    <Flex mt='3vh' gap='30px'>
        <Box flex='1'>
            <Text fontWeight={'medium'}>{t('Language')}</Text>
            <CustomSelect labelsMap={languagesMap}  selectedItem={userData.language}  setSelectedItem={(value) => handleEditKey('language', value)} options={Object.keys(languagesMap)} hide={false} />
        </Box>
        <Box  flex='1'>
            <Text fontWeight={'medium'}> {t('CallStatus')}</Text>
            <Box position='relative' mt='7px'> 
                <Flex borderColor={'gray.200'} borderWidth={'1px'}  color={phoneMap[userData.organizationData.calls_status][2]}  justifyContent={'space-between'}  px='7px' py='5px'  alignItems='center' cursor='pointer' _hover={{ bg: 'brand.hover_gray' }} borderRadius='.4rem' onClick={() => setShowStatusList(!showStatusList)}>
                    <Flex  alignItems={'center'} gap='10px'> 
                        <Icon height={'12px'} width={'12px'} as={phoneMap[userData.organizationData.calls_status][1]} />
                        <Text fontWeight={'medium'} fontSize='.8em' whiteSpace='nowrap'>{phoneMap[userData.organizationData.calls_status][0]}</Text>
                    </Flex>
                    <Box color='gray.600' > 
                    <IoIosArrowDown className={showStatusList ? "rotate-icon-up" : "rotate-icon-down"}/>
                    </Box>
                </Flex>
                {showStatusList &&
                    <MotionBox initial={{ opacity: 0, top: 10}} animate={{ opacity: 1, top: 0 }}  exit={{ opacity: 0, top: -10}} transition={{ duration: 0.2,  ease: [0.0, 0.9, 0.9, 1.0]}} 
                    overflow={'hidden'} ml={'calc(100% + 5px)'} width={'100%'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={1000}   position={'absolute'} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.300'}>
                    {['connected', 'out', 'disconnected'].map((status, index) => (
                        <Flex key={`status-list-${index}`} bg={status === userData.organizationData.calls_status?'blue.50':''} color={phoneMap[status][2]} p='7px' gap='10px' alignItems='center' cursor='pointer' _hover={{ bg: status === userData.organizationData.calls_status?'blue.100':'brand.hover_gray' }} onClick={() => {setShowStatusList(!showStatusList)}}>
                            <Icon height={'12px'} width={'12px'} as={phoneMap[status][1]} />
                            <Text fontWeight={'medium'} fontSize='.8em' whiteSpace='nowrap'>{phoneMap[status][0]}</Text>
                        </Flex>
                    ))}
                    </MotionBox>}  
                </Box>        
            </Box>
    </Flex>

    </>)
}

export default User