//REACT
import { useEffect, useRef, useState } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
//FRONT
import { Text, Box, Flex, Button, Icon, Avatar, chakra, Switch } from "@chakra-ui/react"
import { motion, isValidMotionProp} from 'framer-motion'
//COMPONENTS
import EditText from "../../../Components/Reusable/EditText"
import CustomSelect from "../../../Components/Reusable/CustomSelect"
import RenderIcon from "../../../Components/Reusable/RenderIcon"
//ICONS
import { IconType } from "react-icons"
import {  BsFillTelephoneInboundFill, BsFillTelephoneMinusFill, BsFillTelephoneXFill } from "react-icons/bs"
import { IoPerson, IoMail } from "react-icons/io5"
import { FaLanguage, FaAt, FaPhone } from "react-icons/fa6"

//TYPING
import { languagesFlags } from "../../../Constants/typing"

//TYPING
interface UserData {id:string, name: string, surname: string, email: string, is_phone_available:boolean, language:string, icon:{type: 'image' | 'emoji' | 'icon', data:string}, color_theme:'light' | 'dark', created_at:string, organizations:{id:string, name:string}[], invitations:{id:string, organization_id:string, organization_name:string, role_name:string, status:string}[] }
 
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
                                        fontSize={'.8em'} overflow={'hidden'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={1000}   position={'absolute'} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'border_color'}>
                                        <Flex p='7px' alignItems={'center'} gap='7px' cursor={'pointer'} _hover={{bg:'hover_gray'}} onClick={() => {setShowChangeAction(false);setSendAction('close');localStorage.setItem('sendAction','close')}}>
                                            <Text whiteSpace={'nowrap'}>{t('CloseAction_1')}</Text>
                                        </Flex>
                                        <Flex p='7px' alignItems={'center'} gap='7px' cursor={'pointer'} _hover={{bg:'hover_gray'}} onClick={() => {setShowChangeAction(false);setSendAction('next');localStorage.setItem('sendAction','next')}}>
                                            <Text whiteSpace={'nowrap'}>{t('CloseAction_2')}</Text>
                                        </Flex>
                                        <Flex p='7px' alignItems={'center'} gap='7px' cursor={'pointer'} _hover={{bg:'hover_gray'}} onClick={() => {setShowChangeAction(false);setSendAction('mantain');localStorage.setItem('sendAction','mantain')}}>
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
         <Box p='2vw'> 
            <Box>
                <Flex alignItems={'end'} justifyContent={'space-between'}> 
                    <Box> 
                        <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('Profile')}</Text>
                        <Text color='text_gray' fontSize={'.8em'}>{t('ProfileDes')}</Text>
                    </Box>
                </Flex>
                <Box width='100%' bg='border_color' height='1px' mt='2vh' />
            </Box>
            <Box flex='1' py='2vh'> 
                <Flex alignItems={'center'} gap='15px'>

                    {userData?.icon?.data ? 
                        <RenderIcon size={55} icon={userData.icon} />
                        :
                        <Avatar h='55px' w='55px' size='lg'  name={userData.name + ' ' + userData.surname}/>
                    }

                    <Box alignItems={'center'} gap='10px'>
                        <Text mb='.5vh' fontSize={'1.2em'} color={'black'} fontWeight={'medium'}>{userData.name + ' ' + userData.surname}</Text>
                          <Flex alignItems={'center'} gap='10px'>
                                <Button size='xs' h='20px' fontSize={'.7em'} variant={'common'}>{t('AddNewPicture')}</Button>
                             </Flex>
                     </Box>
                </Flex>

                <Flex  mt='3vh' maxW={'1200px'}  gap='50px' > 
                    
            
                    <Box flex={'1'} bg='white'display={'inline-block'}  borderWidth={'1px'}  borderColor={'border_color'} borderRadius={'.7rem'} p='20px'  > 
                        <Text fontWeight={'medium'} fontSize={'1em'}>{t('GeneralInfo')}</Text>
                        <Text color='text_gray' fontSize={'.8em'}>{t('GeneralInfoDes')}</Text>
                    
                        <Flex mt='2vh' gap='15px' alignItems={'center'}>
                            <Icon color={'text_gray'} as={IoPerson}/>
                            <Box maxW={'400px'}> 
                                <EditText fontSize=".9em" hideInput={true} value={userData.name} setValue={(value) => handleEditKey('name', value)}/>
                            </Box>
                        </Flex>

                
                        <Flex mt='2vh' gap='15px' alignItems={'center'}>
                            <Icon color={'text_gray'} as={IoPerson}/>
                            <Box maxW={'400px'}> 
                                <EditText fontSize=".9em" hideInput={true} value={userData.surname} setValue={(value) => handleEditKey('surname', value)}/>
                            </Box>
                        </Flex>

                        <Flex mt='2vh' gap='15px' alignItems={'center'}>
                            <Icon color={'text_gray'} as={IoMail}/>
                            <Box maxW={'400px'}> 
                                <EditText  fontSize=".9em"  hideInput={true} regex={/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/} value={userData.email} setValue={(value) => handleEditKey('email', value)}/>
                            </Box>
                        </Flex>


                        <Flex mt='2vh' gap='15px' alignItems={'center'}>
                            <Icon color={'text_gray'} as={FaLanguage}/>
                            <Box w={'200px'}> 
                            <CustomSelect fontSize=".9em" labelsMap={languagesMap}  selectedItem={userData.language}  setSelectedItem={(value) => handleEditKey('language', value)} options={Object.keys(languagesMap)} hide={true} />
                            </Box>
                        </Flex>    
                    </Box>
                    <Box flex={'1'} bg='white'display={'inline-block'}  borderWidth={'1px'}  borderColor={'border_color'} borderRadius={'.7rem'} p='20px'  > 
                        <Text fontWeight={'medium'}  fontSize={'1em'}>{t('OrgInfo', {name:auth.authData.organizationName})}</Text>
                        <Text color='text_gray' fontSize={'.8em'}>{t('OrgInfoDes')}</Text>
 
                        <Flex mt='2vh' gap='15px' alignItems={'center'}>
                            <Icon color={'text_gray'} as={FaAt}/>
                            <Box maxW={'400px'}> 
                                <EditText fontSize=".9em" hideInput={true} value={userData.name} setValue={(value) => handleEditKey('name', value)}/>
                            </Box>
                        </Flex>
        
                        <Flex gap='22px' mt='2vh'  alignItems={'center'}>
                            <Icon color={'text_gray'} as={FaPhone}/>
                            <Flex alignItems={'center'} gap='7px'> 
                                <Text fontSize={'.9em'}>{t('IsPhoneAvailable')}</Text>
                                <Switch size='sm' isChecked={userData?.is_phone_available}  onChange={(e) => handleEditKey('is_phone_available', e.target.checked)} />
                            </Flex>
                         </Flex>

                    </Box>
        
        
                </Flex>
            </Box>
        </Box>
       
    </>)
}

export default User