//REACT
import { useState,  useMemo, Dispatch, SetStateAction } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"

//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Box, Text, Button, Icon } from '@chakra-ui/react'
//COMPONENTS
import EditText from "../../Components/Reusable/EditText"
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
//ICONS
import { FaPlus } from "react-icons/fa6"
import { IoStatsChart } from "react-icons/io5";

//TYPING
import { ReportDataType } from "../../Constants/typing"

const CreateReport = ({setReports}:{setReports:Dispatch<SetStateAction<ReportDataType[] | null>>}) => {

      //AUTH CONSTANT
      const { getAccessTokenSilently } = useAuth0()
    
      const auth = useAuth()
      const navigate = useNavigate()
      const { t } = useTranslation('stats')
      const location = useLocation().pathname
   
      //CREATE BOX AND FOLDER
      const [showCreate, setShowCreate] = useState<boolean>(false)

    //CREATE BOX
    const CreateBox = () => {

        //NEW FIELD DATA
        const [newReportData, setNewReportData] = useState<{name:string, description:string}>({name:'', description:''})
    
        //BOOLEAN FOR WAITIGN THE EDIT
        const [waitingEdit, setWaitingEdit] = useState<boolean>(false)

        const createReport = async() => {
            const response  = await fetchData({endpoint:`${auth.authData.organizationId}/admin/reports`, method:'post', requestForm:newReportData, setWaiting:setWaitingEdit, getAccessTokenSilently,  auth, toastMessages:{works:t('CorrectCreatedReport'), failed:t('FailedCreatedReport')}})
            if (response?.status === 200) {
                setReports(prev => ([...prev as ReportDataType[], {uuid:response.data.uuid, icon:'', name:newReportData.name, description:newReportData.description, user_id:auth.authData.userId || '',organization_id:auth.authData.organizationId || -1, created_at: Date.now().toString(), updated_at: Date.now().toString() }]))
                navigate(`/stats/report/${response.data.uuid}`)
            }
            setShowCreate(false)
        }
        //FRONT
        return(<> 
            <Box p='15px'> 
                <Text  mb='.5vh' fontWeight={'medium'} fontSize={'.9em'}>{t('Name')}</Text>
                <EditText  maxLength={100} placeholder={`${t('Name')}...`} hideInput={false} value={newReportData.name} setValue={(value) => setNewReportData((prev) => ({...prev, name:value}))}/>
                <Text  mt='2vh' mb='.5vh'  fontWeight={'medium'}  fontSize={'.9em'}>{t('Description')}</Text>
                <EditText  maxLength={2000} placeholder={`${t('Description')}...`} hideInput={false} value={newReportData.description} setValue={(value) => setNewReportData((prev) => ({...prev, description:value}))}/>
            
            
                <Flex mt='2vh' gap='15px' flexDir={'row-reverse'}>
                    <Button isDisabled={newReportData.name === ''} size='sm' variant={'main'} onClick={createReport}>{waitingEdit?<LoadingIconButton/>:t('CreateReport')}</Button>
                    <Button  size='sm'variant={'common'} onClick={() => setShowCreate(false)}>{t('Cancel')}</Button>
                </Flex>
        </Box>
        </>)
    }   
    const memoizedDeleteBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowCreate}> 
            <CreateBox/>
        </ConfirmBox>
    ), [showCreate])


    return (<>
        {showCreate && memoizedDeleteBox}

        <Flex height={'100%'} top={0} left={0} width={'100%'}  alignItems={'center'} justifyContent={'center'}> 
        <Flex alignItems={'center'} flexDir={'column'} maxW={'580px'} textAlign={'center'}> 
                <Flex justifyContent={'center'} h='50px' w='50px' alignItems={'center'} borderRadius={'.5rem'} bg='brand.gray_1'>
                    <Icon as={IoStatsChart} boxSize={'25px'}/>
                </Flex>
                <Text fontWeight={'medium'} fontSize={'2em'} mt='2vh' mb='2vh'>{t('NoReports')}</Text>               
                <Button  display={'inline-flex'} variant='main'  onClick={() => setShowCreate(true)} leftIcon={<FaPlus/>}>{t('CreateReport')}</Button>
            </Flex>
        </Flex> 
    </>)
}

export default CreateReport