
//REACT
import  { Fragment, useEffect } from 'react'
import { useNavigate } from "react-router-dom" 
import { useAuth } from '../../../AuthContext'
import { useTranslation } from 'react-i18next'
//FRONT
import { Flex, Text, Box, Icon, Grid } from "@chakra-ui/react"
//ICONS
import { IconType } from "react-icons"
import { IoPerson } from "react-icons/io5"
import { BsLightningFill } from "react-icons/bs"
import { BiSolidBuildings } from "react-icons/bi"
import { IoLogoWhatsapp } from "react-icons/io"
import { IoChatboxEllipses, IoMail } from "react-icons/io5";
import { RiInstagramFill } from "react-icons/ri";

import { FaDiagramProject, FaCreditCard, FaDatabase, FaShopify, FaUserGroup,FaPhone,  FaPeopleGroup, FaUser, FaTicket, FaRectangleList, FaArrowsSplitUpAndLeft, FaShapes } from "react-icons/fa6"
import { HiViewColumns } from "react-icons/hi2"
import { MdKeyboardCommandKey, MdWebhook } from "react-icons/md"
import { SiGooglemybusiness } from "react-icons/si";

//TYPING
import { IconKey, SubSectionProps } from "../../Constants/typing"
 
interface MainProps {
    subSections: SubSectionProps[]
    sectionsList: (IconKey | '')[] 
}
interface SectionBoxProps {
    section: IconKey
    subSections: SubSectionProps
}
export type SectionsListProps = {[key in IconKey]: [string, string]}

//MAIN FUNCTION
function Main ({subSections, sectionsList}:MainProps) {
   
    //TRANSLATION
    const { t } = useTranslation('settings')
    
    const subSectionsMap: {[key:string]:[string, IconType]} = {
        'data':[t('DataDes'), FaDatabase],
        'payments':[t('PaymentsDes'), FaCreditCard],
        'admin-users':[t('UsersDes'), FaUserGroup],
        'groups':[t('GroupsDes'), FaPeopleGroup],
        'user':[t('UserDes'), FaUser],
        'edit-views':[t('ViewsDes'), HiViewColumns],
        'shortcuts':[t('ShortcutsDes'), MdKeyboardCommandKey],
        'tickets':[t('TicketsDes'), FaTicket],
        'fields':[t('FieldsDes'),  FaShapes],
        'surveys':[t('SurveysDes'), FaRectangleList],
        'automations':[t('AutomationsDes'), FaArrowsSplitUpAndLeft],
        'triggers':[t('TriggersDes'), MdWebhook],
        'web':[t('WebDes'), IoChatboxEllipses],
        'whatsapp':[t('WhastappDes'), IoLogoWhatsapp],
        'instagram':[t('InstagramDes'), RiInstagramFill],
        'google-business':[t('GoogleDes'), SiGooglemybusiness],
        'mail':[t('MailDes'), IoMail],
        'phone':[t('PhoneDes'), FaPhone],
        'shopify':[t('ShopifyDes'), FaShopify]
    }
    

    const auth = useAuth()
    useEffect (() => {
        document.title = `${t('Settings')} - ${t('Main')} - ${auth.authData.organizationName} - Matil`
    }, [])

    //COMPONENT FOR EACH BOX SECTION
    const SectionBox = ({section, subSections}:SectionBoxProps) => {
        const sectionsMap:SectionsListProps = {'organization':[t('Organization'),'blue.200' ], 'user':[t('User'), 'green.200'], 'rules':[t('BusinessRules'), 'yellow.200'],  'actions':[t('Actions'), 'orange.200'], 'channels': [t('Channels'), 'purple.200'], 'integrations':[t('Integrations'), 'red.200'], 'main':[t('Main'), '#FF69B4']}

        const navigate = useNavigate()

        return(
            <Box mt='3vh' width={'100%'}   maxW={'1100px'}> 
                <Text fontSize={'1.4em'} fontWeight={'medium'}>{sectionsMap[section][0]}</Text>
                <Grid  mt='1vh' width={'100%'} gap={'20px'} justifyContent={'space-between'} templateColumns='repeat(3, 1fr)'> 
                    {subSections.map((sec, index) => {
                        return (
                        <Flex gap='10px' p='20px' transition={'box-shadow 0.3s ease-in-out'} alignItems={'center'} _hover={{shadow:'lg'}} borderRadius={'.5rem'} key={`subsection-${section}-${index}`} shadow='sm' borderWidth={'1px'} borderColor={'gray.100'} cursor={'pointer'}  onClick={() => {navigate(`/settings/${section}/${sec[1]}`);localStorage.setItem('currentSettingsSection',`${section}/${sec[1]}`)}} >
                            <Flex height={'44px'}  bg={sectionsMap[section][1]} justifyContent={'center'} alignItems={'center'} borderRadius={'.7rem'} p='14px' >
                                <Icon  boxSize={'16px'} as={subSectionsMap[sec[1]][1]}/>
                            </Flex>
                            <Box> 
                                <Text fontWeight={'medium'}  >{sec[0]}</Text>
                                <Text color='gray.600' fontSize={'.8em'} >{subSectionsMap[sec[1]][0]}</Text>
                            </Box>
                        </Flex>)
                    })}
                </Grid>
                
            </Box>
        )
    }
  
    return(<>       
        <Text fontSize={'1.6em'} fontWeight={'semibold'} >{t('Main')}</Text>
        <Flex alignItems={'center'} flexDir={'column'} > 
            {sectionsList.map((section, index) => 
                (<Fragment key={`settings-section-${index}`} > 
                    {section !== '' && <SectionBox  section={section} subSections={subSections[index]} />}
                </Fragment>))}
        </Flex>
    </>)
}

export default Main