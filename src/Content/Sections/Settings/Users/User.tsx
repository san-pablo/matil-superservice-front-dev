//REACT
import { useEffect, useRef, useState } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
//FRONT
import { Text, Box, Flex, Button, Icon, Avatar, chakra } from "@chakra-ui/react"
import { motion, isValidMotionProp} from 'framer-motion'
//COMPONENTS
import EditText from "../../../Components/Reusable/EditText"
import CustomSelect from "../../../Components/Reusable/CustomSelect"
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
import SaveChanges from "../../../Components/Reusable/SaveChanges"
//ICONS
import { IconType } from "react-icons"
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
    }
interface OrganizationData {
    alias:string
    is_admin:boolean, 
    calls_status:'connected' | 'out' | 'disconnected', 
    avatar_image_url:string, 
    groups:{id:number, name:string}[]
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: isValidMotionProp})

const availableLanguages = ['Español', 'English']

{/* 
     <Flex ref={actionNoteRef} fontSize={'.7em'}  cursor={'pointer'} gap='5px' alignItems={'center'} onClick={() => setShowChangeAction(!showChangeAction)}> 
        <Text  whiteSpace={'nowrap'}>{sendAction === 'close'?t('CloseAction_1'):sendAction === 'next'?t('CloseAction_2'):t('CloseAction_3')}</Text>
        <Icon className={ showChangeAction? "rotate-icon-up" : "rotate-icon-down"} as={IoIosArrowDown} boxSize={'13px'}/>
        </Flex>

           <Box position={'relative'}>  
                                {showChangeAction &&  
                                <Portal > 
                                    <MotionBox  bottom={window.innerHeight -  (actionNoteRef.current?.getBoundingClientRect().top || 0) + 10}  right={window.innerWidth - (actionNoteRef.current?.getBoundingClientRect().right || 0)}  ref={actionBoxRef} initial={{ opacity: 0, marginBottom: -10}} animate={{ opacity: 1, marginBottom: 0 }}  exit={{ opacity: 0, marginBottom: -10}} transition={{ duration: '0.2', ease: 'easeOut'}} 
                                        fontSize={'.8em'} overflow={'hidden'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={1000}   position={'absolute'} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.300'}>
                                        <Flex p='7px' alignItems={'center'} gap='7px' cursor={'pointer'} _hover={{bg:'brand.hover_gray'}} onClick={() => {setShowChangeAction(false);setSendAction('close');localStorage.setItem('sendAction','close')}}>
                                            <Text whiteSpace={'nowrap'}>{t('CloseAction_1')}</Text>
                                        </Flex>
                                        <Flex p='7px' alignItems={'center'} gap='7px' cursor={'pointer'} _hover={{bg:'brand.hover_gray'}} onClick={() => {setShowChangeAction(false);setSendAction('next');localStorage.setItem('sendAction','next')}}>
                                            <Text whiteSpace={'nowrap'}>{t('CloseAction_2')}</Text>
                                        </Flex>
                                        <Flex p='7px' alignItems={'center'} gap='7px' cursor={'pointer'} _hover={{bg:'brand.hover_gray'}} onClick={() => {setShowChangeAction(false);setSendAction('mantain');localStorage.setItem('sendAction','mantain')}}>
                                            <Text whiteSpace={'nowrap'}>{t('CloseAction_3')}</Text>
                                        </Flex>
                                    </MotionBox>
                                </Portal>}
                            </Box>
*/}
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

    //USER DATA
    const userDataRef = useRef<UserData>(auth?.authData?.userData as UserData)
    const organizationDataRef = useRef<OrganizationData>(auth?.authData?.organizationData as OrganizationData)
    const [userData, setUserData] = useState<UserData>(auth?.authData?.userData as UserData)
    const [organizationData, setOrganizationData] = useState<OrganizationData>(auth?.authData?.organizationData as OrganizationData)

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
        <SaveChanges data={organizationData} setData={setOrganizationData} dataRef={organizationDataRef} onSaveFunc={() => {}}/>
        <Box px='2vw' py='2vh'> 
            <Box>
                <Flex alignItems={'end'} justifyContent={'space-between'}> 
                    <Box> 
                        <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('Profile')}</Text>
                        <Text color='gray.600' fontSize={'.8em'}>{t('ProfileDes')}</Text>
                    </Box>
                </Flex>
                <Box width='100%' bg='gray.200' height='1px' mt='2vh' />
            </Box>
            <Box flex='1' py='2vh'> 
                <Flex  maxW={'1200px'}  gap='50px' > 
                    
            
                    <Box flex={'1'} bg='white'display={'inline-block'}  borderWidth={'1px'}  borderColor={'gray.200'} borderRadius={'.7rem'} p='20px'  > 
                        <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('GeneralInfo')}</Text>
                        <Text color='gray.600' fontSize={'.9em'}>{t('GeneralInfoDes')}</Text>
                    
                    <Flex mt='3vh' gap='15px' alignItems={'center'}>
                            <Text fontWeight={'medium'}>{t('Name')}</Text>
                            <Box maxW={'400px'}> 
                                <EditText hideInput={true} value={userData.name} setValue={(value) => handleEditKey('name', value)}/>
                            </Box>
                    </Flex>
            
                    <Flex mt='1vh' gap='15px' alignItems={'center'}>
                            <Text fontWeight={'medium'}>{t('Surname')}</Text>
                            <Box maxW={'400px'}> 
                                <EditText hideInput={true} value={userData.surname} setValue={(value) => handleEditKey('surname', value)}/>
                            </Box>
                    </Flex>

                    <Box bg='gray.200' height={'1px'} mt='2vh' mb='2vh' width={'100%'}/>

                    <Flex gap='15px' alignItems={'center'}>
                            <Text fontWeight={'medium'}>{t('Mail')}</Text>
                            <Box maxW={'400px'}> 
                                <EditText hideInput={true} regex={/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/} value={userData.email_address} setValue={(value) => handleEditKey('email_address', value)}/>
                            </Box>
                    </Flex>

                    <Flex mt='1vh' gap='15px' alignItems={'center'}>
                            <Text fontWeight={'medium'}>{t('Password')}</Text>
                            <Box maxW={'400px'}> 
                                <EditText hideInput={true} value={userData.password} setValue={(value) => handleEditKey('password', value)}/>
                            </Box>
                    </Flex>


                    <Box bg='gray.200' height={'1px'} mt='2vh' mb='2vh' width={'100%'}/>

                    <Flex mt='1vh' gap='15px' alignItems={'center'}>
                    <Text fontWeight={'medium'}>{t('Language')}</Text>
                            <Box w={'250px'}> 
                                <CustomSelect labelsMap={languagesMap}  selectedItem={userData.language}  setSelectedItem={(value) => handleEditKey('language', value)} options={Object.keys(languagesMap)} hide={true} />
                            </Box>
                    </Flex>
                    </Box>
                    <Box flex={'1'} bg='white'display={'inline-block'}  borderWidth={'1px'}  borderColor={'gray.200'} borderRadius={'.7rem'} p='20px'  > 
                        <Text fontWeight={'medium'}  fontSize={'1.2em'}>{t('OrgInfo', {name:auth.authData.organizationName})}</Text>
                        <Text color='gray.600' fontSize={'.9em'}>{t('OrgInfoDes')}</Text>

                        <Flex alignItems={'center'} justifyContent={'space-between'} mt='3vh'>
                            <Flex alignItems={'center'} gap='10px'>
                                <Avatar src={organizationData.avatar_image_url}/>
                                <Box alignItems={'center'} gap='10px'>
                                    <Text fontWeight={'medium'}>{t('ProfilePicture')}</Text>
                                    <Text color={'gray.600'} fontSize={'.9em'}>{t('ProfilePicture_Exp')}</Text>
                                </Box>
                            </Flex>
                            <Flex alignItems={'center'} gap='10px'>
                                <Button size='xs' variant={'common'}>{t('AddNewPicture')}</Button>
                                <Button size='xs' variant={'delete'} >{t('Delete')}</Button>
                            </Flex>
                        </Flex>
        
                    </Box>
        
        
                </Flex>
            </Box>
        </Box>
       
    </>)
}

export default User