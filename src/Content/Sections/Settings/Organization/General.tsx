
//REACT
import  { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
import { useAuth0 } from '@auth0/auth0-react'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Skeleton, Textarea, Button, chakra, shouldForwardProp } from "@chakra-ui/react"
import { motion, isValidMotionProp  } from 'framer-motion'
//COMPONENTS
import SaveChanges from '../../../Components/Reusable/SaveChanges'
 
//TYPING
type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
type hourInterval = {end_hour:string, start_hour:string}
type BussinessHoursDays = {[key in DayOfWeek]: hourInterval[]}
type BussinessHoursType = BussinessHoursDays & {holidays: string[]}
interface OrganizationData  {
    description:string
    name: string
    business_hours:BussinessHoursType
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

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//MAIN FUNCTION
function General () {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('settings')
    const t_formats  = useTranslation('formats').t
    const {  getAccessTokenSilently } = useAuth0()

    //BOOLEAN FOR WAIT THE INFO
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    //ORGANIZATION DATA
    const orgDataRef = useRef<OrganizationData | null>(null)
    const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null)

    //FETCH NEW DATA WHEN THE VIEEW CHANGE
    useEffect(() => {
        const fetchInitialData = async () => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/organization`, setValue:setOrganizationData, setWaiting:setWaitingInfo, getAccessTokenSilently, auth})
            if (response?.status === 200 ) orgDataRef.current = response.data
        }
        document.title = `${t('Settings')} - ${t('Data')} - ${auth.authData.organizationName} - Matil`
        fetchInitialData()
    }, [])

    //SAVE CHANGES
    const saveChanges = async() => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/organization`, method:'put', requestForm:organizationData as OrganizationData, auth, getAccessTokenSilently, setWaiting:setWaitingSend, toastMessages:{works:t('CorrectUpdatedContext'), failed:t('FailedUpdatedContext')}})
        if (response?.status === 200) orgDataRef.current = organizationData
    }

 
    return(
    <>
    <SaveChanges data={organizationData} setData={setOrganizationData} dataRef={orgDataRef} onSaveFunc={saveChanges}/>
        <Box>
            <Flex alignItems={'end'} justifyContent={'space-between'}> 
                <Skeleton isLoaded={!waitingInfo}> 
                    <Text fontSize={'1.6em'} fontWeight={'medium'}>{t('General')}</Text>
                    <Text color='gray.600' fontSize={'.9em'}>{t('GeneralDes')}</Text>
                </Skeleton>
            </Flex>
            <Box width='100%' bg='gray.300' height='1px' mt='2vh'/>
        </Box>
        <Box flex='1' maxW={'1000px'}  overflow={'scroll'} pt='3vh'>
            <Text mb='.5vh'  fontSize={'1.2em'} fontWeight={'medium'}>{t('TildaContext')}</Text>
            <Textarea maxW={'700px'}  resize={'none'} maxLength={2000} height={'auto'} placeholder={`${t('TildaContexPlaceholder')}...`} maxH='300px' value={organizationData?.description} onChange={(e) => setOrganizationData((prev) => ({...prev as OrganizationData, description:e.target.value}))} p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "brand.text_blue", borderWidth: "2px"}}/>
        </Box>
    </>)
}

export default General

