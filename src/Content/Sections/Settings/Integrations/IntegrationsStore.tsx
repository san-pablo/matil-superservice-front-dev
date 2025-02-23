
//REACT
import  { Fragment, useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom" 
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../../AuthContext'
//FRONT
import { Flex, Text, Box, Icon, Grid, Image } from "@chakra-ui/react"
//ICONS
import { IconType } from "react-icons"
   
 
interface CategoriesProps {[key:string]:{id:string, name:string, icon:string, description:string}[]}

 
//MAIN FUNCTION
function IntegrationsStore () {
   
    //TRANSLATION
    const { t } = useTranslation('settings')
    const  auth = useAuth()

    const categories:CategoriesProps = {
        'all':[{id:'shopify', name:'Shopify', description:t('ShopifyDes'), icon:'shopify_logo.svg'}, {id:'drive', name:'Google Drive', description:t('DriveDes'), icon:'drive_logo.png'}],
        'web':[{id:'shopify', name:'Shopify', description:t('ShopifyDes'), icon:'shopify_logo.svg'}],
        'data':[{id:'drive', name:'Google Drive', description:t('DriveDes'), icon:'drive_logo.png'}],
    
    }

    useEffect (() => {
        document.title = `${t('Settings')} - ${t('Main')} - ${auth.authData.organizationName} - Matil`
    }, [])

    const [selectedSection, setSelectedSection] = useState<string>('all') 
    const [search, setSearch] = useState<string>('')

  
    return(
    <Flex flex='1'> 
        <Box flex='1'>     
            <Text fontSize={'1.6em'} fontWeight={'semibold'} >{t('Store')}</Text>
            {Object.keys(categories).map((categorie, index) => (
                <Text mt='1vh' key={`categorie-${index}`} fontWeight={selectedSection === categorie?'medium':'normal'} _hover={{color:'text_blue'}} onClick={() => setSelectedSection(categorie)} cursor={'pointer'}>{t(categorie)}</Text>
            ))}
        </Box> 
                
        <Box  flex='3' p='2vw'>  
            <Text fontSize={'1.6em'} fontWeight={'semibold'} >{t(selectedSection)}</Text>

            <Flex  py='3vh' flexWrap={'wrap'}   gap='32px'> 
                {categories[selectedSection].map((section, index) => 
                    (<Box width={'300px'} key={`settings-section-${index}`} > 
                        <Flex gap='15px' p='20px' alignItems={'center'}transition={'box-shadow 0.3s ease-in-out'} _hover={{shadow:'lg'}} borderRadius={'.5rem'} key={`subsection-${section}-${index}`} shadow='sm' borderWidth={'1px'} borderColor={'gray.100'} cursor={'pointer'}  >
                                <Image  height={'40px'} w={'40px'} src={`/images/logos/${section.icon}`}/>
                                <Box> 
                                    <Text fontWeight={'medium'}  >{section.name}</Text>
                                    <Text color='text_gray' fontSize={'.8em'} >{section.description}</Text>
                                </Box>
                            </Flex>                
                    </Box>))}
            </Flex>
        </Box>
   
    </Flex>)
}

export default IntegrationsStore
