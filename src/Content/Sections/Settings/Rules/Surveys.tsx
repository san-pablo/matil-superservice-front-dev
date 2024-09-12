//REACT
import { useEffect, useRef, useState } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Flex, Button, NumberInput, NumberInputField, Skeleton } from "@chakra-ui/react"
//COMPONENTS
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
import EditText from "../../../Components/Reusable/EditText"
  
interface SurveysConfigProps {
    score_message:string
    ask_for_comments:boolean
    comment_message:string 
    comment_placeholder:string 
    thank_you_message:string
}

//MAIN FUNCTION
const Surveys = () => {

    //CONSTANTS
    const auth = useAuth()
    const  { t } = useTranslation('settings')

    //WAITING SEND
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    //CURENT SECTION
    const [currentSection, setCurrentSection] =  useState<'csat' | 'nps'>('csat')

    //DATA
    const csatDataRef = useRef<SurveysConfigProps | null>(null)
    const npsDataRef = useRef<SurveysConfigProps | null>(null)
    const [csatData, setCsatData] = useState<SurveysConfigProps | null>(null)
    const [npsData, setNpsData] = useState<SurveysConfigProps | null>(null)
    

    //FETCH NEW DATA WHEN THE VIEEW CHANGE
    useEffect(() => {        
        document.title = `${t('Surveys')} - ${auth.authData.organizationId} - Matil`
        const fetchInitialData = async() => {
            const response1 = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/surveys/csat`, setValue:setCsatData, auth})
            const response2 = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/surveys/nps`, setValue:setNpsData, auth})

            if (response1?.status === 200 && response2?.status) {
                csatDataRef.current = response1.data
                npsDataRef.current = response2.data
            }
        }
        fetchInitialData()
     }, [])

    //FUNCTION FOR EDITING EACH KEY
    const handleEditKey = (key:string, value:boolean | string) => {
        if (currentSection === 'csat' && csatData) setCsatData(prev => ({...prev as SurveysConfigProps, [key]:value}))
        else if (npsData) setNpsData(prev => ({...prev as SurveysConfigProps, [key]:value}))
        
    }   

    //FUNCTION FOR SEND A NEW CONFIGURATION
    const sendNewData = async() => {
        setWaitingSend(true)
        if (currentSection === 'csat') {
            const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/surveys/csat`, requestForm:csatData as SurveysConfigProps, setWaiting:setWaitingSend, method:'put', setValue:setCsatData, auth})
            if (response?.status === 200) csatDataRef.current = csatData
        }
        else {
            const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/surveys/nps`, requestForm:npsData as SurveysConfigProps,method:'put', setWaiting:setWaitingSend, setValue:setCsatData, auth})
            if (response?.status === 200) npsDataRef.current = npsData
        }
    }
 
    const dataToWork = currentSection === 'csat' ? csatData:npsData

    console.log(csatData)
    console.log(npsData)


    //FRONT
    return(<>

        <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('Surveys')}</Text>
        <Text color='gray.600' fontSize={'.9em'}>{t('SurveysDes')}</Text>

        <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='5vh'/>

        <Skeleton isLoaded={(csatData !== null && npsData !== null)}>
            <Box width={'60%'} minW={'500px'}> 

                <Text mt='2vh' fontWeight={'medium'}>{t('ScoreMessage')}</Text>
                <Text mb='1vh' fontSize={'.8em'} color='gray.600'>{t('ScoreMessage')}</Text>
                <EditText value={dataToWork?.score_message} setValue={(value) => handleEditKey('score_message', value) }  hideInput={false}/>


                <Text mt='2vh' fontWeight={'medium'}>{t('AskForComments')}</Text>
                <Text mb='1vh' fontSize={'.8em'} color='gray.600'>{t('AskForCommentsDes')}</Text>
                <Flex mt='1vh' gap='10px'>
                    <Button  size='sm' onClick={(e) => handleEditKey('ask_for_comments', true)} bg={dataToWork?.ask_for_comments?'brand.gradient_blue':'gray.100'} color={dataToWork?.ask_for_comments?'white':'black'} _hover={{bg:dataToWork?.ask_for_comments?'brand.gradient_blue_hover':'gray.200'}}>{t('Ask')}</Button>
                    <Button size='sm' onClick={(e) => handleEditKey('ask_for_comments', false)} bg={!dataToWork?.ask_for_comments?'brand.gradient_blue':'gray.100'} color={!dataToWork?.ask_for_comments?'white':'black'} _hover={{bg:!dataToWork?.ask_for_comments?'brand.gradient_blue_hover':'gray.200'}}>{t('NoAsk')}</Button>
                </Flex>

                {dataToWork?.ask_for_comments && <>
                    <Text mt='2vh' fontWeight={'medium'}>{t('Comments')}</Text>
                    <Text mb='1vh' fontSize={'.8em'} color='gray.600'>{t('CommentsDes')}</Text>
                    <EditText value={dataToWork?.comment_message} setValue={(value) => handleEditKey('comment_message', value) } hideInput={false}/>

                    <Text mt='2vh' fontWeight={'medium'}>{t('CommentsPlaceholder')}</Text>
                    <Text mb='1vh' fontSize={'.8em'} color='gray.600'>{t('CommentsDesPlaceholder')}</Text>
                    <EditText value={dataToWork?.comment_placeholder} setValue={(value) => handleEditKey('comment_placeholder', value) } hideInput={false}/>
        
                </>
                
                }
                <Text mt='2vh' fontWeight={'medium'}>{t('ThanksMessage')}</Text>
                <Text mb='1vh' fontSize={'.8em'} color='gray.600'>{t('ThanksMessageDes')}</Text>
                <EditText value={dataToWork?.thank_you_message} setValue={(value) => handleEditKey('thank_you_message', value) } hideInput={false}/>
        
            
        
                <Box width={'100%'} mt='2vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Flex flexDir={'row-reverse'}> 
                    <Button onClick={sendNewData} isDisabled={currentSection === 'csat'? JSON.stringify(csatData) === JSON.stringify(csatDataRef.current): JSON.stringify(npsData) === JSON.stringify(npsDataRef.current)}>{waitingSend?<LoadingIconButton/>:t('SaveChanges')}</Button>
                </Flex>
            </Box>
        </Skeleton>
        </>)
    }

export default Surveys