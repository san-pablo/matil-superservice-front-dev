//REACT
import { useEffect, useRef, useState, RefObject, ReactElement } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Flex, Button, Switch, Skeleton, Tabs, Tab,TabList, chakra, shouldForwardProp, Icon } from "@chakra-ui/react"
import { motion,  isValidMotionProp }from 'framer-motion'
//COMPONENTS
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
import EditText from "../../../Components/Reusable/EditText"
import ColorPicker from "../../../Components/Once/ColorPicker"
import SectionSelector from "../../../Components/Reusable/SectionSelector"
//ICONS
import { IoMdArrowRoundForward } from 'react-icons/io'
import { FaStar, FaGaugeHigh } from "react-icons/fa6"

interface SurveysConfigProps {
    score_message:string
    ask_for_comments:boolean
    comment_message:string 
    comment_placeholder:string 
    thank_you_message:string
    background_color:[string, string] 
    text_color:string
    buttons_background_color:[string, string] 
    buttons_text_color:string
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//MAIN FUNCTION
const Surveys = ({scrollRef}:{scrollRef:RefObject<HTMLDivElement>}) => {

    //CONSTANTS
    const auth = useAuth()
    const  { t } = useTranslation('settings')
    const sectionsList = ['csat', 'nps']
    const sectionsMap:{[key:string]:[string, ReactElement]} = {'csat':[t('csat'), <FaStar/>], 'nps':[t('nps'), <FaGaugeHigh/>]}


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
        document.title = `${t('Settings')} - ${t('Surveys')} - ${auth.authData.organizationId} - Matil`
        const fetchInitialData = async() => {
            const response1 = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/surveys/csat`, setValue:setCsatData, auth})
            const response2 = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/surveys/nps`, setValue:setNpsData, auth})

            if (response1?.status === 200 && response2?.status) {
                csatDataRef.current = response1.data
                npsDataRef.current = response2.data
            }
        }
        fetchInitialData()
     }, [])

    //FUNCTION FOR EDITING EACH KEY
    const handleEditKey = (key:string, value:boolean | string | [string, string]) => {
        if (currentSection === 'csat' && csatData) setCsatData(prev => ({...prev as SurveysConfigProps, [key]:value}))
        else if (npsData) setNpsData(prev => ({...prev as SurveysConfigProps, [key]:value}))
        
    }   

    //FUNCTION FOR SEND A NEW CONFIGURATION
    const sendNewData = async() => {
        setWaitingSend(true)
        if (currentSection === 'csat') {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/surveys/csat`, requestForm:csatData as SurveysConfigProps, setWaiting:setWaitingSend, method:'put', auth, toastMessages:{works:t('CorrectSurvey'), failed:t('FailedSurvey')}})
            if (response?.status === 200) csatDataRef.current = csatData
        }
        else {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/surveys/nps`, requestForm:npsData as SurveysConfigProps,method:'put', setWaiting:setWaitingSend,  auth, toastMessages:{works:t('CorrectSurvey'), failed:t('CorrectSurvey')}})
            if (response?.status === 200) npsDataRef.current = npsData
        }
    }
 

    const dataToWork = currentSection === 'csat' ? csatData:npsData

    //FRONT
    return(<>

        <Box> 
            <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('Surveys')}</Text>
            <Text color='gray.600' fontSize={'.9em'}>{t('SurveysDes')}</Text>

            <Box mt='2vh' mb='2vh'> 
                <SectionSelector selectedSection={currentSection} sections={sectionsList} sectionsMap={sectionsMap} onChange={() => setCurrentSection(prev => (prev === 'csat'?'nps':'csat'))}/>
            </Box>
            <Box height={'1px'} width={'100%'} bg='gray.300' mt='2vh' />
        </Box>

        <Box overflow={'scroll'} flex='1'  pt='3vh' > 
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
                        
                    <Text fontWeight={'medium'} mt='2vh'>{t('BackgroundColorSurvey')}</Text>
                    <Text fontSize={'.8em'} color='gray.600'>{t('BackgroundColorSurveyDes')}</Text>
                    <Flex  mt='.5vh'  alignItems={'center'} gap='10px'> 
                        <Box flex='1' > 
                            <ColorPicker containerRef={scrollRef} color={dataToWork?.background_color[0]} 
                            setColor={(value) => {
                                const newHeaderBackground = [...dataToWork?.background_color as [string, string]]
                                newHeaderBackground[0] = value
                                console.log(newHeaderBackground)
                                handleEditKey('background_color', newHeaderBackground as [string, string])
                            }}/>
                        </Box>
                        <Icon boxSize={'25px'} color='gray.400'  as={IoMdArrowRoundForward}/>
                        <Box flex='1' > 
                            <ColorPicker containerRef={scrollRef} color={dataToWork?.background_color[1]} 
                            setColor={(value) => {
                                const newHeaderBackground = [...dataToWork?.background_color as [string, string]]
                                newHeaderBackground[1] = value
                                handleEditKey('background_color', newHeaderBackground as [string, string])
                            }}/>
                        </Box>
                    </Flex>

                    <Text fontWeight={'medium'} mt='2vh'>{t('TextColorSurvey')}</Text>
                    <Text fontSize={'.8em'} color='gray.600'>{t('TextColorSurveyDes')}</Text>
                    <Box mt='.5vh'  maxW={'300px'} flex='1' > 
                        <ColorPicker containerRef={scrollRef} color={dataToWork?.text_color} setColor={(value) => {handleEditKey('text_color', value) }}/>
                    </Box>

                    <Text fontWeight={'medium'} mt='2vh'>{t('ButtonBackgroundColor')}</Text>
                    <Text fontSize={'.8em'} color='gray.600'>{t('ButtonBackgroundColorDes')}</Text>
                    <Flex  mt='.5vh'  alignItems={'center'} gap='10px'> 
                        <Box flex='1' > 
                            <ColorPicker containerRef={scrollRef} color={dataToWork?.buttons_background_color[0]} 
                            setColor={(value) => {
                                const newHeaderBackground = [...dataToWork?.buttons_background_color as [string, string]]
                                newHeaderBackground[0] = value
                                handleEditKey('buttons_background_color', newHeaderBackground as [string, string])
                            }}/>
                        </Box>
                        <Icon boxSize={'25px'} color='gray.400'  as={IoMdArrowRoundForward}/>
                        <Box flex='1' > 
                            <ColorPicker containerRef={scrollRef} color={dataToWork?.buttons_background_color[1]} 
                            setColor={(value) => {
                                const newHeaderBackground = [...dataToWork?.buttons_background_color as [string, string]]
                                newHeaderBackground[1] = value
                                handleEditKey('buttons_background_color', newHeaderBackground as [string, string])
                            }}/>
                        </Box>
                    </Flex>

                    <Text fontWeight={'medium'} mt='2vh'>{t('ButtonColor')}</Text>
                    <Text fontSize={'.8em'} color='gray.600'>{t('ButtonColorDes')}</Text>
                    <Box  mt='.5vh'  maxW={'300px'} flex='1' > 
                        <ColorPicker containerRef={scrollRef} color={dataToWork?.buttons_text_color} setColor={(value) => {handleEditKey('buttons_text_color', value) }}/>
                    </Box>
            </Skeleton>
        </Box>
        <Box>
            <Box width={'100%'} mt='2vh' mb='2vh' height={'1px'} bg='gray.300'/>
            <Flex flexDir={'row-reverse'}> 
                <Button variant={'common'} onClick={sendNewData} isDisabled={currentSection === 'csat'? JSON.stringify(csatData) === JSON.stringify(csatDataRef.current): JSON.stringify(npsData) === JSON.stringify(npsDataRef.current)}>{waitingSend?<LoadingIconButton/>:t('SaveChanges')}</Button>
            </Flex>
        </Box>
        </>)
    }

export default Surveys