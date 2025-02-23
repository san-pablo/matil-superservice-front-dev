/*
    SETITNGS SECTION 
*/

//REACT
import  {useEffect, lazy, useRef, Fragment, useState, Dispatch, SetStateAction, Suspense } from "react"
import { Routes, Route,  useNavigate, useLocation } from "react-router-dom" 
import { useAuth } from "../../../AuthContext"
import { useTranslation } from 'react-i18next'
import { useSession } from "../../../SessionContext"
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Box, Flex, Text, Icon } from '@chakra-ui/react'
import '../../Components/styles.css'
import { motion } from 'framer-motion'
//ICONS
import { FaHeadset, FaGear, FaCartShopping,FaGoogle, FaCreditCard,FaCloud, FaRobot, FaBookOpen, FaShopify, FaDatabase, FaBars, FaUserGroup,FaPhone,  FaPeopleGroup, FaUser, FaTicket, FaRectangleList, FaArrowsSplitUpAndLeft, FaShapes, FaBookmark, FaClock, FaTag } from "react-icons/fa6"
import { MdKeyboardCommandKey, MdWebhook } from "react-icons/md"
//TYPING
import { IconKey, SubSectionProps, ConfigProps, ChannelsType } from "../../Constants/typing" 
  
//MAIN
const Main = lazy (() => import('./Main')) 
//ORGANIZATION
const Data = lazy(() => import('./Organization/Data'))
const BussinessHours = lazy(() => import('./Organization/BussinessHours'))
const Surveys = lazy(() => import('./Organization/Surveys'))
//const Payments = lazy(() => import('./Organization/Payments'))
//USERS
const User = lazy(() => import('./Users/User'))
const AdminUsers = lazy(() => import('./Organization/AdminUsers'))
const Groups = lazy(() => import('./Workflows/Groups'))
//WORKFLOWS
const Shortcuts = lazy(() => import('./Users/Shortcuts'))
const Fields = lazy(() => import('./Workflows/Fields'))
const Themes = lazy(() => import('./Workflows/Themes'))
//const ConversationsData = lazy(() => import('./Workflows/ConversationsData'))
const Tags = lazy(() => import('./Workflows/Tags'))
//ACTIONS
//const Triggers = lazy(() => import('./Actions/Triggers'))
//const Automations = lazy(() => import('./Actions/Automations'))
   
//MAIN FUNCTION
function Settings () {

    //TRANSLATION
    const { t } = useTranslation('settings')

    //SECTIONS
    const auth = useAuth()
   
    useEffect(() => {
        document.title = `${t('Settings')} - ${auth.authData.organizationName} - Matil`
    }, [])

    const [selectedSection, setSelectedSection] = useState<string>('data')
    const subSectionsMap: {[key:string]:any} = {

        organization : {
            'data':[t('Data'), FaDatabase],
            'hours':[t('Hours'), FaClock],
            'surveys':[t('Surveys'), FaRectangleList],
            //'payments':[t('PaymentsDes'), FaCreditCard],
            'admin-users':[t('Users'), FaUserGroup],
        },
        workspace:{
            'groups':[t('Groups'), FaPeopleGroup],
            'tags':[t('Tags'),  FaTag],
            'fields':[t('Fields'),  FaShapes],
            'themes':[t('Themes'),  FaBookmark],
        },
        personal:{
            'user':[t('User'), FaUser],
            'shortcuts':[t('Shortcuts'), MdKeyboardCommandKey],
        }
    }

    const RenderSection = () => {
        switch (selectedSection) {
            case 'data':
                return <Data/>
            case 'hours':
                return <BussinessHours/>
            case 'surveys':
                return<Surveys/>
            case 'admin-users':
                return <AdminUsers/>
            case 'groups':
                return <Groups/>
            case 'tags':
                return <Tags/>
            case 'fields':
                return <Fields/>
            case 'themes':
                return <Themes/>
            case 'user':
                return <User/>
            case 'shortcuts':
                return <Shortcuts/>
    }
    }

    return( 
    <Flex>  
        <Flex flexDir="column" height={'100vh'} py='2vw'   bg='hover_gray' width='200px'>
       
            <Box overflowY="auto" flex="1" px='15px'>
                {Object.keys(subSectionsMap).map((sec, index) => (
                    <Fragment key={`section-${index}`}>
                        <Text color='text_gray'  mb='1vh' mt={index !== 0 ? '3vh':'0'} fontSize={'.8em'} fontWeight={'medium'}>{t(sec)}</Text>
                        {Object.keys(subSectionsMap[sec]).map((subsection, index2) => (
                                <Flex alignItems={'center'} key={`section-${index}-${index2}`}  position={'relative'} gap='7px'  bg={selectedSection === subsection?'gray_2':'transparent'} _hover={{bg:'gray_2'}}  cursor={'pointer'} borderRadius={'.5rem'} p='5px' onClick={() => setSelectedSection(subsection)}>
                                    <Flex  alignItems={'center'}  justifyContent={'center'} position={'relative'} w='18px'>
                                        <Icon boxSize='12px' color={'text_gray'} as={subSectionsMap[sec][subsection][1]}/>
                                    </Flex>
                                    <Text flex='1'  fontSize={'.9em'} transition={'transform .1s ease-in-out'} fontWeight={selectedSection === subsection?'medium':'normal'} transformOrigin="left center" transform={selectedSection === subsection?'scale(1.02)':'scale(1)'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}   overflow={'hidden'}>
                                        {subSectionsMap[sec][subsection][0]}
                                    </Text>
                                </Flex>
                        ))}
                    </Fragment>
                ))}
            
            </Box>
        </Flex>
        <Suspense fallback={
        <Flex height={'90vh'} flexDir={'column'} justifyContent={'space-between'}  bg='white'width={'calc(70vw - 200px)'} ></Flex>}> 
            <Flex height={'90vh'} flexDir={'column'} justifyContent={'space-between'}  bg='white'  width={'calc(70vw - 200px)'} >
                <RenderSection/>
            </Flex>   
        </Suspense>     
    </Flex>)
}

export default Settings