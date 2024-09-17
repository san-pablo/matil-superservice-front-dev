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
function Matilda ({data, waitingFilters}:MatildaProps) {

    //TRANSLATION
    const { t } = useTranslation('stats')

    return(<> 
        <Skeleton flex='1' isLoaded={data !== null && !waitingFilters}> 
            <Flex mt='2vw' width='100%' height={'40vh'} gap='1vw'>

                <Flex width={'5%'} overflow={'hidden'}  flex='1'  flexDir={'column'} gap='3vh' height={'40vh'}     justifyContent={'space-between'}  bg='white' p='1vw' borderRadius={'1rem'}  boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                    <Box> 
                        <GradientIconText children={parseFloat(data?.total_tickets_participated || 0)} />
                        <Text mb='1vh'  color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('ParticipatedTickets')}</Text>
                        <GradientIconText children={parseFloat(data?.total_tickets_solved || 0)} />
                        <Text color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('SolvedTickets')}</Text>
                    </Box> 
                    <CompareChart totalValue={data?.total_tickets_participated || 0} firstValue={data?.total_tickets_solved || 0} firstString={t('Closed')}  secondString={t('NoClosed')}/>
                </Flex>
            
                <Box width={'5%'} overflow={'hidden'} height={'40vh'}  bg='white' p='1vw' borderRadius={'1rem'} flex='1' boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} >
                    <GradientIconText children={parseFloat(data?.average_matilda_rating_score || 0)} />
                    <Text mb='1vh'  color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('AverageScore')}</Text>
                    <GradientIconText children={parseFloat(data?.total_messages_sent || 0)} />
                    <Text mb='1vh'  color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('SendedMessages')}</Text>
                    <GradientIconText children={parseFloat(data?.total_words_generated || 0)} />
                    <Text color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('GeneratedWords')}</Text>
                </Box>

                <Box bg='white' p='1vw' borderRadius={'1rem'} width={'5%'} flex='3'boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                    <Text fontWeight={'medium'} >{t('ResponseTime')}</Text>
                    <Box  height={'calc(100% - 2vw )'} >
                    <ColumnChart  xaxis={data?.avg_response_time_comparison.X || []} yaxis1={data?.avg_response_time_comparison.Y_matilda || []} yaxis2={data?.avg_response_time_comparison.Y_team_users || []} ytitle1={'Matilda'} ytitle2={t('Users')}/>
                    </Box>
                </Box>

            </Flex>
        </Skeleton>

        <Skeleton flex='1' isLoaded={data !== null && !waitingFilters}> 
            <Flex mt='2vw' flex='1'  gap='1vw' height={'50vh'} >
                
                <Box bg='white' p='1vw' borderRadius={'1rem'} width={'5%'} flex='1'boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                    <Text fontWeight={'medium'}>{t('TotalChannelTickets')}</Text>
                    <Box height={'calc(100% - 2vw )'}  >
                        <ColumnChart  isChannels={true} xaxis={data?.solved_transfered_tickets_by_channel.map((element:any) => {return element.channel}) || []} yaxis1={data?.solved_transfered_tickets_by_channel.map((element:any) => {return element.transfered}) || []} yaxis2={data?.solved_transfered_tickets_by_channel.map((element:any) => {return element.solved}) || []} ytitle1={t('Transfered')} ytitle2={t('Solved')}/>
                    </Box>
                </Box>

                <Box bg='white' p='1vw' borderRadius={'1rem'} width={'5%'} flex='1'boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                    <Text fontWeight={'medium'}>{t('TotalSubjectTickets')}</Text>
                    <Box height={'calc(100% - 2vw )'}  >
                        <ColumnChart xaxis={data?.solved_transfered_tickets_by_subject.map((element:any) => {return element.subject}) || []} yaxis1={data?.solved_transfered_tickets_by_subject.map((element:any) => {return element.transfered}) || []} yaxis2={data?.solved_transfered_tickets_by_subject.map((element:any) => {return element.solved}) || []} ytitle1={t('Transfered')} ytitle2={t('Solved')}/>
                    </Box>
                </Box>
                
            </Flex>
        </Skeleton>
        </>
    )
}

export default Matilda