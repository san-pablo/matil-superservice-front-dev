
//REACT
import  {useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'

//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Textarea, Skeleton,Button } from "@chakra-ui/react"
//ICONS
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
//TYPING
import { FunctionsData } from '../../../Constants/typing'
import { useSession } from '../../../../SessionContext'

//TYPING
interface OrganizationData  {
    name: string
    description: string
    timestamp_created: string
    is_active: boolean
    current_active_users:number
    max_users: number
    processed_conversations_this_month:number
    max_conversations_per_month: number
    data_storage_capacity: number
    data_storage_used: number
    file_storage_capacity: number
    file_storage_used: number
}

function Tilda () {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('settings')
    const session = useSession()
    const orgDataRef = useRef<OrganizationData | null>(null)
    const [orgData, setOrgData] = useState<OrganizationData | null>(null)
    const [functionsData, setFunctionsData] = useState<FunctionsData[] | null>(null)


    const [waitingSend, setWaitingSend] = useState<boolean>(false)
    //FETCH NEW DATA WHEN THE VIEEW CHANGE
    useEffect(() => {
        document.title = `${t('Settings')} - ${t('Tilda')} - ${auth.authData.organizationId} - Matil`
        const fetchInitialData = async() => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/organization`, setValue:setOrgData, auth})
        if (response?.status === 200 ) orgDataRef.current = response.data

        if (session.sessionData.flowsFunctions.functions) setFunctionsData(session.sessionData.flowsFunctions.functions)
        else {
            fetchData({endpoint:`${auth.authData.organizationId}/admin/functions`, setValue:setFunctionsData, auth})
        }

     }
        fetchInitialData()
     }, [])

    const saveChanges = async() => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/organization`, method:'put', requestForm:orgData as OrganizationData, auth, setWaiting:setWaitingSend, toastMessages:{works:t('CorrectUpdatedContext'), failed:t('FailedUpdatedContext')}})
        if (response?.status === 200) orgDataRef.current = orgData
    }

    return(
    <>
        <Flex justifyContent={'space-between'} alignItems={'end'}> 
            <Box> 
                <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('Tilda')}</Text>
                <Text color='gray.600' fontSize={'.9em'}>{t('TildaDes')}</Text>
            </Box>
        </Flex>
        <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='3vh'/>
        <Skeleton style={{flex:'1'}} isLoaded={orgData !== null && functionsData !== null}>
            <Flex gap='32px'>  
                <Box flex='1' maxW={'800px'}> 
                    <Text  mt='2vh' mb='.5vh'fontWeight={'medium'}>{t('TildaContext')}</Text>
                    <Textarea  resize={'none'} maxLength={2000} height={'auto'} placeholder={`${t('TildaContexPlaceholder')}...`} maxH='300px' value={orgData?.description} onChange={(e) => setOrgData((prev) => ({...prev as OrganizationData, description:e.target.value}))} p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "brand.text_blue", borderWidth: "2px"}}/>
                    <Flex flexDir={'row-reverse'} mt='2vh'>
                        <Button size='sm' variant={'common'} onClick={saveChanges} isDisabled={(JSON.stringify(orgDataRef.current) === JSON.stringify(orgData)) }>{waitingSend?<LoadingIconButton/>:t('SaveChanges')}</Button>
                    </Flex>
                    <Text  mt='2vh' mb='.5vh'fontWeight={'medium'}>{t('ActiveFunctions')}</Text>
                    {(functionsData || []).map((func, index) => (
                        <Box key={`function-${index}`}>
                            <Text  fontSize={'.9em'} mt='2vh' fontWeight={'medium'}>{func.name}</Text>
                            <Text fontSize={'.8em'} color={'gray.600'}>{func.description}</Text>
                        </Box>
                    ))}
                </Box>    
                <Box px='50px' > 
                    <Box bg='white' borderColor={'#eaebee'} borderWidth={'7px'} height={'590px'}  width={'310px'}   borderRadius={'2rem'}  overflow={'hidden'} boxShadow={'0 44px 89px -18px rgba(50,50,93,.35),0 26px 54px -26px rgba(0,0,0,.3),inset 0 -1px 3px 0 rgba(10,37,64,.35)'} >

                    </Box>
                </Box>
            </Flex>       
        </Skeleton>
          
    </>)
}

export default Tilda