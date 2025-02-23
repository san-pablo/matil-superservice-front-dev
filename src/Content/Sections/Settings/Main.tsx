
//REACT
import  { Fragment, useEffect } from 'react'
import { useNavigate } from "react-router-dom" 
import { useAuth } from '../../../AuthContext'
import { useTranslation } from 'react-i18next'
//FRONT
import { Flex, Text, Box, Icon, Grid } from "@chakra-ui/react"
//ICONS
import { IconType } from "react-icons"
import { IoLogoWhatsapp } from "react-icons/io"
import { IoChatboxEllipses, IoMail } from "react-icons/io5"
import { RiInstagramFill } from "react-icons/ri"
import { FaCloud, FaPhone, FaBookOpen, FaRobot } from "react-icons/fa6"
import { FaGoogle } from "react-icons/fa6";

//TYPING
import { IconKey, SubSectionProps } from "../../Constants/typing"
 
interface MainProps {
    subSections: SubSectionProps[]
    sectionsList: (IconKey | '')[] 
    subSectionsMap:{[key:string]: [string, IconType]}
}
interface SectionBoxProps {
    section: IconKey
    subSections: SubSectionProps
 }
export type SectionsListProps = {[key in IconKey]: [string, string]}

//MAIN FUNCTION
function Main ({subSections, sectionsList, subSectionsMap}:MainProps) {
   
    //TRANSLATION
    const { t } = useTranslation('settings')
    
    const auth = useAuth()
    useEffect (() => {
        document.title = `${t('Settings')} - ${t('Main')} - ${auth.authData.organizationName} - Matil`
    }, [])

    //COMPONENT FOR EACH BOX SECTION
    const SectionBox = ({section, subSections}:SectionBoxProps) => {

        //CONSTANTS
        const sectionsMap:SectionsListProps = {'organization':[t('Organization'),'blue.200' ], 'channels': [t('Channels'), 'purple.200'], 'tilda':[t('Tilda'), 'linear(to-tl, rgba(100, 202, 204), rgba(162, 151, 255))'], 'help-centers':[t('HelpCenters'), 'cyan.200'], 'user':[t('Personal'), 'green.200'],  'workflows':[t('Workflows'), 'orange.200'],  'actions':[t('Actions'), 'yellow.200'],'integrations':[t('Integrations'), 'red.200'], 'main':[t('Main'), '#FF69B4']}
        const navigate = useNavigate()
        const channelsDict = {
            'webchat':IoChatboxEllipses,
            'whatsapp':IoLogoWhatsapp,
            'instagram':RiInstagramFill,
            'google-business':FaGoogle,
            'email':IoMail,
            'phone': FaPhone,
            'voip': FaCloud,
        }

        return(
            <Box mt='3vh' width={'100%'}   maxW={'1100px'}> 
                <Text fontSize={'1.2em'} fontWeight={'medium'}>{sectionsMap[section][0]}</Text>
                <Grid  mt='1vh' width={'100%'} gap={'20px'} justifyContent={'space-between'} templateColumns='repeat(3, 1fr)'> 
                    {subSections.map((sec:any, index:number) => {

                        const navigatePath = `/settings/${section}${(section === 'help-centers' && index !== 0) ? '/help-center':(section === 'tilda' && index !== 0)?'/config' :(section === 'channels' && index !== 0) ?'/' + sec.channel_type:''}/${(section === 'help-centers' && index !== 0) ? sec.id:(section === 'tilda' && index !== 0)?sec.uuid:(section === 'channels' && index !== 0) ?sec.id:sec[1]}`

                         return (
                        <Flex gap='10px' p='20px' alignItems={'center'}transition={'box-shadow 0.3s ease-in-out'} _hover={{shadow:'lg'}} borderRadius={'.5rem'} key={`subsection-${section}-${index}`} shadow='sm' borderWidth={'1px'} borderColor={'gray.100'} cursor={'pointer'}  onClick={() => {navigate(navigatePath);localStorage.setItem('currentSettingsSection',navigatePath)}} >
                            <Flex height={'44px'}  bg={sectionsMap[section][1]} bgGradient={sectionsMap[section][1]} justifyContent={'center'} alignItems={'center'} borderRadius={'.7rem'} p='14px' >
                                <Icon  boxSize={'16px'} as={((section === 'help-centers' && index !== 0)) ? FaBookOpen :(section === 'tilda' && index !== 0)? FaRobot: ((section === 'channels' && index !== 0)) ?  (channelsDict as any)[sec.channel_type] : subSectionsMap[sec[1]][1]}/>
                            </Flex>
                            <Box> 
                                <Text fontWeight={'medium'}  >{((section === 'help-centers' || section === 'channels' || section === 'tilda' ) && index !== 0) ?  sec.name :sec[0]}</Text>
                                <Text color='text_gray' fontSize={'.8em'} >{((section === 'help-centers' && index !== 0)) ? t('HelpCenterEdit') : ((section === 'channels' && index !== 0)) ?  t('NewChannel'):((section === 'tilda' && index !== 0))?t('ConfigEdit') : subSectionsMap[sec[1]][0]}</Text>
                            </Box>
                        </Flex>)
                    })}
                </Grid>
                
            </Box>
        )
    }
  
    return(
    <Box flex='1' overflow={'scroll'} p='2vw'>       
        <Text  fontSize={'1.5em'} fontWeight={'semibold'} >{t('Main')}</Text>
        <Flex pb='5vh' flexDir={'column'}  > 
            {sectionsList.map((section, index) => 
                (<Fragment key={`settings-section-${index}`} > 
                    {section !== '' && <SectionBox  section={section} subSections={subSections[index]} />}
                </Fragment>))}
        </Flex>
    </Box>)
}

export default Main