//REACT
import { useEffect, useRef, useState } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Flex, Button, Switch, Skeleton, Tabs, Tab,TabList, chakra, shouldForwardProp } from "@chakra-ui/react"
import { motion,  isValidMotionProp }from 'framer-motion'
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

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

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
    
    //CALCULATE THE TAB SIZE
    const [tabSize, setTabSize] = useState({ width: 0, left: 0 });
    const csatTabRef = useRef<HTMLButtonElement>(null)
    const npsTabRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
      // Calcula el tamaño y la posición del tab activo
      if (currentSection === "csat" && csatTabRef.current) {
        const { width, left } = csatTabRef?.current?.getBoundingClientRect()
        setTabSize({ width, left })
      } else if (currentSection === "nps" && npsTabRef.current) {
        const { width, left } = npsTabRef?.current?.getBoundingClientRect()
        setTabSize({ width, left })
      }
    }, [currentSection])

    //FETCH NEW DATA WHEN THE VIEEW CHANGE
    useEffect(() => {        
        document.title = `${t('Settings')} - ${t('Surveys')} - ${auth.authData.organizationId} - Matil`
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
            const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/surveys/csat`, requestForm:csatData as SurveysConfigProps, setWaiting:setWaitingSend, method:'put', auth, toastMessages:{works:t('CorrectSurvey'), failed:t('FailedSurvey')}})
            if (response?.status === 200) csatDataRef.current = csatData
        }
        else {
            const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/surveys/nps`, requestForm:npsData as SurveysConfigProps,method:'put', setWaiting:setWaitingSend,  auth, toastMessages:{works:t('CorrectSurvey'), failed:t('CorrectSurvey')}})
            if (response?.status === 200) npsDataRef.current = npsData
        }
    }
 

    const dataToWork = currentSection === 'csat' ? csatData:npsData

    console.log(dataToWork)
    //FRONT
    return(<>

        <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('Surveys')}</Text>
        <Text color='gray.600' fontSize={'.9em'}>{t('SurveysDes')}</Text>

        <Tabs mt='2vh' mb='3vh' onChange={() => setCurrentSection(prev => (prev === 'csat'?'nps':'csat'))} variant="unstyled" position="relative">
            <TabList gap='10px' borderBottomWidth={'1px'} borderBottomColor={'gray.300'}>
                <Tab ref={csatTabRef} _selected={{ color: "blue.500", fontWeight: "bold" }}>{t('csat')}</Tab>
                <Tab ref={npsTabRef} _selected={{ color: "blue.500", fontWeight: "bold" }}>{t('nps')}</Tab>
            </TabList>
            <MotionBox position="absolute" bottom="0" left={currentSection === 'csat'?0:(csatTabRef.current?.getBoundingClientRect().width || 0) + 10} width={`${tabSize.width}px`} height="2px" bg="blue.500" layout transition={{ type: "spring", stiffness: '300', damping: '30' }}/>
        </Tabs>
    

        <Skeleton isLoaded={(csatData !== null && npsData !== null)}  width={'100%'} maxW={'1000px'} minW={'500px'}>
            <Text fontWeight={'medium'}>{t('ScoreMessage')}</Text>
                <Text mb='.5vh' fontSize={'.8em'} color='gray.600'>{t('ScoreMessageDes')}</Text>
                <EditText placeholder={t('ScorePlaceholder')} value={dataToWork?.score_message} setValue={(value) => handleEditKey('score_message', value) }  hideInput={false}/>

                <Flex mt='3vh' gap='10px'alignItems={'center'}>
                    <Switch isChecked={dataToWork?.ask_for_comments} onChange={(e) => handleEditKey('ask_for_comments', e.target.checked)}/>
                    <Text fontWeight={'medium'}>{t('AskForComments')}</Text>  
                </Flex>  
                <Text mt='.5vh' fontSize={'.8em'} color='gray.600'>{t('AskForCommentsDes')}</Text>
                {dataToWork?.ask_for_comments && <>
                    <Text mt='2vh' fontWeight={'medium'}>{t('Comments')}</Text>
                    <Text mb='1vh' fontSize={'.8em'} color='gray.600'>{t('CommentsDes')}</Text>
                    <EditText placeholder={t('CommentsSpacePlaceholder')} value={dataToWork?.comment_message} setValue={(value) => handleEditKey('comment_message', value) } hideInput={false}/>

                    <Text mt='2vh' fontWeight={'medium'}>{t('CommentsPlaceholder')}</Text>
                    <Text mb='1vh' fontSize={'.8em'} color='gray.600'>{t('CommentsPlaceholderDes')}</Text>
                    <EditText placeholder={t('CommentsPlaceholderePlaceholder')} value={dataToWork?.comment_placeholder} setValue={(value) => handleEditKey('comment_placeholder', value) } hideInput={false}/>
                </>}
                <Text mt='2vh' fontWeight={'medium'}>{t('ThanksMessage')}</Text>
                <Text mb='1vh' fontSize={'.8em'} color='gray.600'>{t('ThanksMessageDes')}</Text>
                <EditText  placeholder={t('ThanksMessagePlaceholder')} value={dataToWork?.thank_you_message} setValue={(value) => handleEditKey('thank_you_message', value) } hideInput={false}/>
                
                <Box width={'100%'} mt='3vh' mb='3vh' height={'1px'} bg='gray.300'/>
                <Flex flexDir={'row-reverse'}> 
                    <Button onClick={sendNewData} isDisabled={currentSection === 'csat'? JSON.stringify(csatData) === JSON.stringify(csatDataRef.current): JSON.stringify(npsData) === JSON.stringify(npsDataRef.current)}>{waitingSend?<LoadingIconButton/>:t('SaveChanges')}</Button>
                </Flex>
   
        </Skeleton>
        </>)
    }

export default Surveys