// TRANSLATION
import { useTranslation } from 'react-i18next'
//FRONT
import { Flex, Text, Box, Skeleton } from "@chakra-ui/react"
//CHARTS
import ColumnChart from "../Charts/ColumnChart"
import CompareChart from '../Charts/CompareChart'
import GradientIconText from '../Charts/GradientIconText'

//TYPING
interface MatildaProps {
    data:any
    waitingFilters:boolean
}

//MAIN FUNCTION
function CSAT ({data, waitingFilters}:MatildaProps) {

    //TRANSLATION
    const { t } = useTranslation('stats')

    return(<> 
        <Skeleton flex='1' isLoaded={data !== null && !waitingFilters}> 
            <Flex mt='2vw' width='100%' height={'40vh'} gap='1vw'>

                <Flex width={'5%'} overflow={'hidden'}  flex='1'  flexDir={'column'} gap='3vh' height={'40vh'}     justifyContent={'space-between'}  bg='white' p='1vw' borderRadius={'1rem'}  boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                    <Box> 
                        <GradientIconText children={parseFloat(data?.total_csat_offered || 0)} />
                        <Text mb='1vh'  color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('OfferedSurveys')}</Text>
                        <GradientIconText children={parseFloat(data?.total_csat_responses || 0)} />
                        <Text color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('AnsweredSurveys')}</Text>
                    </Box> 
                    <CompareChart totalValue={data?.total_csat_offered || 0} firstValue={data?.total_csat_responses || 0} firstString={t('Offered')}  secondString={t('Answered')}/>
                </Flex>
            
                <Box width={'5%'} overflow={'hidden'} height={'40vh'}  bg='white' p='1vw' borderRadius={'1rem'} flex='1' boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} >
                    <GradientIconText children={parseFloat(data?.csat_with_comments || 0)} />
                    <Text mb='1vh'  color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('CommentedSurveys')}</Text>

                    <GradientIconText children={parseFloat(data?.avg_csat_score || 0)} />
                    <Text color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('AverageScoreCSAT')}</Text>
                </Box>

                <Box bg='white' p='1vw' borderRadius={'1rem'} width={'5%'} flex='3'boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                    <Text fontWeight={'medium'} >{t('ScoreDistribution')}</Text>
                    <Box height={'calc(100% - 2vw )'} >
                        <ColumnChart  xaxis={data?.csat_scores_distribution.X || []} yaxis1={data?.csat_scores_distribution.Y || []} ytitle1={t('Score')} />
                    </Box>
                </Box>

            </Flex>
        </Skeleton>

        <Skeleton flex='1' isLoaded={data !== null && !waitingFilters}> 
            <Flex height={'50vh'}  mt='2vw' bg='white' p='1vw' borderRadius={'1rem'} flex='1'boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                <Box width={'100%'}> 
                    <Text fontWeight={'medium'}>{t('ScoreOverTime')}</Text>
                    <Box  height={'calc(100% - 2vw)'}  >
                        <ColumnChart xaxis={data?.csat_scores_over_time.X || []} yaxis1={data?.csat_scores_over_time.y || []} ytitle1={t('Score')} />
                    </Box>
                </Box>
            </Flex>
            
        </Skeleton>
        </>
    )
}

export default CSAT