//REACT
import { useEffect, useRef, useState, RefObject, ReactElement } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Flex, Switch, Skeleton, Icon } from "@chakra-ui/react"
//COMPONENTS
import SaveChanges from "../../../Components/Reusable/SaveChanges"
import EditText from "../../../Components/Reusable/EditText"
import ColorPicker from "../../../Components/Once/ColorPicker"
import SectionSelector from "../../../Components/Reusable/SectionSelector"
import CustomSelect from "../../../Components/Reusable/CustomSelect"
//ICONS
import { IoMdArrowRoundForward } from 'react-icons/io'
import { FaStar, FaComment, FaGaugeHigh, FaCircleExclamation } from "react-icons/fa6"
import { useAuth0 } from "@auth0/auth0-react"

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

 
//MAIN FUNCTION
const Surveys = ({scrollRef}:{scrollRef:RefObject<HTMLDivElement>}) => {

    //CONSTANTS
    const auth = useAuth()
    const  { t } = useTranslation('settings')
    const {  getAccessTokenSilently } = useAuth0()
    const sectionsList = ['csat', 'nps']
    const sectionsMap:{[key:string]:[string, ReactElement]} = {'csat':[t('csat'), <FaStar/>], 'nps':[t('nps'), <FaGaugeHigh/>]}

    //WAITING SEND
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    //CURENT SECTION
    const [viewType, setViewType] = useState<'stars' | 'comments' | 'thanks'>('stars')
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
            const response1 = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/surveys/csat`, setRef:csatDataRef,  getAccessTokenSilently, setValue:setCsatData, auth})
            const response2 = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/surveys/nps`, setRef:npsDataRef,setValue:setNpsData,  getAccessTokenSilently, auth})
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
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/surveys/csat`, requestForm:csatData as SurveysConfigProps, setWaiting:setWaitingSend, method:'put',  getAccessTokenSilently,auth,  toastMessages:{works:t('CorrectSurvey'), failed:t('FailedSurvey')}})
            if (response?.status === 200) csatDataRef.current = csatData
        }
        else {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/surveys/nps`, requestForm:npsData as SurveysConfigProps,method:'put', setWaiting:setWaitingSend,  getAccessTokenSilently,  auth, toastMessages:{works:t('CorrectSurvey'), failed:t('CorrectSurvey')}})
            if (response?.status === 200) npsDataRef.current = npsData
        }
    }
 
 
    const dataToWork = currentSection === 'csat' ? csatData:npsData

    //FRONT
    return(<>
        <SaveChanges data={currentSection === 'csat'?csatData:npsData} setData={currentSection === 'csat'?setCsatData:setNpsData} dataRef={currentSection === 'csat'?csatDataRef:npsDataRef} onSaveFunc={sendNewData}/>

        <Box> 
            <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('Surveys')}</Text>
            <Text color='gray.600' fontSize={'.9em'}>{t('SurveysDes')}</Text>

            <Flex justifyContent={'space-between'} mt='2vh' mb='2vh'> 
                <SectionSelector selectedSection={currentSection} sections={sectionsList} sectionsMap={sectionsMap}  onChange={() => setCurrentSection(prev => (prev === 'csat'?'nps':'csat'))}/>
            </Flex>
            <Box height={'1px'} width={'100%'} bg='gray.300' mt='2vh' />
        </Box>

        <Flex flex='1' pt='4vh' overflow={'hidden'}  gap='80px'position='relative'> 
 
            <Box flex='4' ref={scrollRef} overflow={'scroll'} height={'100%'}> 
                <Text fontWeight={'medium'}>{t('ScoreMessage')}</Text>
                    <Text mb='.5vh' fontSize={'.8em'} color='gray.600'>{t('ScoreMessageDes')}</Text>
                    <Skeleton  isLoaded={(csatData !== null && npsData !== null)} >
                        <EditText placeholder={t('ScorePlaceholder')} value={dataToWork?.score_message} setValue={(value) => handleEditKey('score_message', value) }  hideInput={false}/>
                    </Skeleton>
                    <Flex mt='3vh' gap='10px'alignItems={'center'}>
                        <Skeleton  isLoaded={(csatData !== null && npsData !== null)} >
                            <Switch isChecked={dataToWork?.ask_for_comments} onChange={(e) => handleEditKey('ask_for_comments', e.target.checked)}/>
                        </Skeleton>
                        <Text fontWeight={'medium'}>{t('AskForComments')}</Text>  
                    </Flex>  
                    <Text mt='.5vh' fontSize={'.8em'} color='gray.600'>{t('AskForCommentsDes')}</Text>
                    {dataToWork?.ask_for_comments && <>
                        <Text mt='2vh' fontWeight={'medium'}>{t('Comments')}</Text>
                        <Text mb='1vh' fontSize={'.8em'} color='gray.600'>{t('CommentsDes')}</Text>
                        <Skeleton  isLoaded={(csatData !== null && npsData !== null)} >
                            <EditText placeholder={t('CommentsSpacePlaceholder')} value={dataToWork?.comment_message} setValue={(value) => handleEditKey('comment_message', value) } hideInput={false}/>
                        </Skeleton>
                        <Text mt='2vh' fontWeight={'medium'}>{t('CommentsPlaceholder')}</Text>
                        <Text mb='1vh' fontSize={'.8em'} color='gray.600'>{t('CommentsPlaceholderDes')}</Text>
                        <Skeleton  isLoaded={(csatData !== null && npsData !== null)} >
                        <EditText placeholder={t('CommentsPlaceholderPlaceholder')} value={dataToWork?.comment_placeholder} setValue={(value) => handleEditKey('comment_placeholder', value) } hideInput={false}/>
                        </Skeleton>
                    </>}
                    <Text mt='2vh' fontWeight={'medium'}>{t('ThanksMessage')}</Text>
                    <Text mb='1vh' fontSize={'.8em'} color='gray.600'>{t('ThanksMessageDes')}</Text>
                    <Skeleton  isLoaded={(csatData !== null && npsData !== null)} >
                        <EditText  placeholder={t('ThanksMessagePlaceholder')} value={dataToWork?.thank_you_message} setValue={(value) => handleEditKey('thank_you_message', value) } hideInput={false}/>
                    </Skeleton>
                    <Text fontWeight={'medium'} mt='2vh'>{t('BackgroundColorSurvey')}</Text>
                    <Text fontSize={'.8em'} color='gray.600'>{t('BackgroundColorSurveyDes')}</Text>
                    
                    <Skeleton  isLoaded={(csatData !== null && npsData !== null)} >
                        <Flex  mt='.5vh'  alignItems={'center'} gap='10px'> 
                            <Box  w='300px' > 
                                <ColorPicker containerRef={scrollRef} color={dataToWork?.background_color[0]} 
                                setColor={(value) => {
                                    const newHeaderBackground = [...dataToWork?.background_color as [string, string]]
                                    newHeaderBackground[0] = value
                                    console.log(newHeaderBackground)
                                    handleEditKey('background_color', newHeaderBackground as [string, string])
                                }}/>
                            </Box>
                            <Icon boxSize={'25px'} color='gray.400'  as={IoMdArrowRoundForward}/>
                            <Box  w='300px' > 
                                <ColorPicker containerRef={scrollRef} color={dataToWork?.background_color[1]} 
                                setColor={(value) => {
                                    const newHeaderBackground = [...dataToWork?.background_color as [string, string]]
                                    newHeaderBackground[1] = value
                                    handleEditKey('background_color', newHeaderBackground as [string, string])
                                }}/>
                            </Box>
                        </Flex>
                    </Skeleton>
                    <Text fontWeight={'medium'} mt='2vh'>{t('TextColorSurvey')}</Text>
                    <Text fontSize={'.8em'} color='gray.600'>{t('TextColorSurveyDes')}</Text>
                    <Box mt='.5vh'  maxW={'300px'} flex='1' > 
                        <Skeleton  isLoaded={(csatData !== null && npsData !== null)} >
                            <ColorPicker containerRef={scrollRef} color={dataToWork?.text_color} setColor={(value) => {handleEditKey('text_color', value) }}/>
                        </Skeleton>
                    </Box>

                    <Text fontWeight={'medium'} mt='2vh'>{t('ButtonBackgroundColor')}</Text>
                    <Text fontSize={'.8em'} color='gray.600'>{t('ButtonBackgroundColorDes')}</Text>
                    <Skeleton  isLoaded={(csatData !== null && npsData !== null)}  >
                        <Flex  mt='.5vh'  alignItems={'center'} gap='10px'> 
                            <Box  w='300px'> 
                                <ColorPicker containerRef={scrollRef} color={dataToWork?.buttons_background_color[0]} 
                                setColor={(value) => {
                                    const newHeaderBackground = [...dataToWork?.buttons_background_color as [string, string]]
                                    newHeaderBackground[0] = value
                                    handleEditKey('buttons_background_color', newHeaderBackground as [string, string])
                                }}/>
                            </Box>
                            <Icon boxSize={'25px'} color='gray.400'  as={IoMdArrowRoundForward}/>
                            <Box  w='300px'> 
                                <ColorPicker containerRef={scrollRef} color={dataToWork?.buttons_background_color[1]} 
                                setColor={(value) => {
                                    const newHeaderBackground = [...dataToWork?.buttons_background_color as [string, string]]
                                    newHeaderBackground[1] = value
                                    handleEditKey('buttons_background_color', newHeaderBackground as [string, string])
                                }}/>
                            </Box>
                        </Flex>
                    </Skeleton>
                    <Text fontWeight={'medium'} mt='2vh'>{t('ButtonColor')}</Text>
                    <Text fontSize={'.8em'} color='gray.600'>{t('ButtonColorDes')}</Text>
                    <Box  mt='.5vh'  maxW={'300px'} flex='1' >
                        <Skeleton  isLoaded={(csatData !== null && npsData !== null)}  >
                            <ColorPicker containerRef={scrollRef} color={dataToWork?.buttons_text_color} setColor={(value) => {handleEditKey('buttons_text_color', value) }}/>
                        </Skeleton>
                    </Box>
            </Box>
 
            <Flex overflow={'hidden'} flexDir={'column'} alignItems={'center'} justifyContent={'center'} borderRadius={'.7rem'} flex='3' bg='brand.gray_2' position={'relative'} > 
                <Flex w='100%' borderBottomWidth={'1px'} justifyContent={'space-between'} borderBottomColor={'gray.300'} p='1vw' alignItems={'center'} gap='32px'> 
                    <Box w={'200px'}> 
                        <CustomSelect variant='title' hide={false} options={['stars', 'comments', 'thanks']} selectedItem={viewType} setSelectedItem={(value) => setViewType(value)} iconsMap={{'stars':[t('stars'),FaStar], 'comments':[t('comments'),FaComment], 'thanks':[t('thanks'),FaCircleExclamation]}}/>
                    </Box>
                    
                </Flex>
                <Main surveyConfig={dataToWork as SurveysConfigProps} viewType={viewType}/>
            </Flex>
        </Flex>

       
        </>)
    }

export default Surveys


const Stars = ({surveyConfig, viewType}:{surveyConfig:SurveysConfigProps,  viewType:'stars' | 'comments' | 'thanks'}) => {
  
    //STAR RATING
    const [stars, setStars] = useState<number>(0)
    const sended = useRef( viewType !== 'stars')
    const starClass = (num:number) => {
      if (num === stars && num === 1) return 'highlighted-one'
      if (stars === 5) return 'highlighted-five'
      return num <= stars ? 'highlighted' : ''
    }

   
    //SHOW COMMENTS
    const showComments = viewType !== 'stars' 

    //SHOW THANK YPU MESSAGE
    const showThankYou = viewType === 'thanks'
 
    //GP BACK AND FORWARD BUTTONS
    const GoButtons = () => {

        return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px'}}>
            <button   style={{ background: `linear-gradient(to right, ${surveyConfig.buttons_background_color[0]}, ${surveyConfig.buttons_background_color[1]})`, color:surveyConfig.buttons_text_color,
                display: 'flex', height:'28px', alignItems: 'center', justifyContent: 'center', padding: '5px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-left">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
            </button>
        
            <button  style={{ background:`linear-gradient(to right, ${surveyConfig.buttons_background_color[0]}, ${surveyConfig.buttons_background_color[1]})`, color:surveyConfig.buttons_text_color,
                 display: 'flex', height:'28px',  alignItems: 'center', justifyContent: 'center', padding: '5px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-right">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </button>
        </div>
        )
    }
    
    return (
      <div style={{display:'flex', alignItems:'center', position:'relative', justifyContent:'center'}} > 
        
        
        <div className={`${showComments ? 'animate-stars' : stars !==  0? 'animate-stars-inverse':''}`} style={{  width:'100%', position: 'absolute' }}> 
            <span style={{fontWeight:400, fontSize:'1.5em', color:surveyConfig.text_color}}>{surveyConfig.score_message}</span>
            <div className='stars'>
                {[5, 4, 3, 2, 1].map(num => (
                    <div key={`start-${num}`}>
                        <input className={`star star-${num}`}id={`star-${num}`} type="radio" name="star" />
                        <label className={`star star-${num} ${starClass(num)}`} htmlFor={`star-${num}`}>
                            <svg viewBox="0 0 576 512" width="50" height="50"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z "></path></svg>
                        </label>
                    </div>
                ))}
            </div>
            <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', marginTop:'1em'}}>
                <GoButtons/>
            </div>
        </div>


        <div className={`comment-box ${showThankYou?'animate-stars' :showComments ? 'animate-comments' : sended.current ?'animate-comments-inverse':''}`}  style={{width:'100%', position:'absolute'}}>
            <span style={{fontWeight:400, fontSize:'1.5em', color:surveyConfig.text_color}}>{surveyConfig.comment_message}</span>
            <input className="custom-textarea-stars" placeholder={surveyConfig.comment_placeholder}  value={''} />
            <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', marginTop:'1em'}}>
                <GoButtons/>
                <button style={{background:`linear-gradient(to right, ${surveyConfig.buttons_background_color[0]}, ${surveyConfig.buttons_background_color[1]})`, color:surveyConfig.buttons_text_color, padding:'.6em', fontSize:'1.1em', borderRadius:'.5em', border:'none'}}>Enviar</button>
            </div>
        </div>
 

        {showThankYou && (
            <div className={`comment-box ${showComments ? 'animate-comments' : ''}`} style={{textAlign:'center'}}>
                <span style={{fontWeight:400, fontSize:'2em', color:surveyConfig.text_color}}>{surveyConfig.thank_you_message}</span>
            </div>
        )}
     </div>
    )
}

const Main = ({surveyConfig, viewType}:{surveyConfig:SurveysConfigProps,  viewType:'stars' | 'comments' | 'thanks'}) => {

    //MODIFIED CONVERSATIONS
    return(<>
        {surveyConfig === null ? <></>:
            <div style={{display:'flex', overflow:'hidden', width:'100%', height:'100%', padding:'1vw', alignItems:'center', justifyContent:'center',background:`linear-gradient(to right, ${surveyConfig?.background_color[0]} , ${surveyConfig?.background_color[1]})`}}> 
                <div style={{width:window.innerWidth < 400 ? '90vw':'35vw', maxWidth:'500px',  minWidth:'320px'}}> 
                    <Stars surveyConfig={surveyConfig}viewType={viewType}/>
                </div>
            </div>
        }
    </>)
}
