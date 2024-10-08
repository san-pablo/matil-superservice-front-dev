// TRANSLATION
import { useTranslation } from 'react-i18next'
//FRONT
import { Flex, Text, Box, Skeleton, Icon } from "@chakra-ui/react"
//CHARTS
import ColumnChart from "../Charts/ColumnChart"
import PieChartComponent from '../Charts/PieChart'
import CompareChart from "../Charts/CompareChart"
import GradientIconText from "../Charts/GradientIconText"
import { IconType } from 'react-icons'
import { FaTicket } from 'react-icons/fa6'

//TYOING
interface TicketsProps {
    waitingFilters:boolean
    data:any | null
}

const gradients = [
    { start: 'rgba(0, 51, 153, 1)', end: 'rgba(0, 102, 204, 1)' },
    { start: 'rgba(0, 102, 204, 1)', end: 'rgba(51, 153, 255, 1)' },
    { start: 'rgba(51, 153, 255, 1)', end: 'rgba(102, 204, 255, 1)' },
    { start: 'rgba(102, 204, 255, 1)', end: 'rgba(153, 204, 255, 1)' },
    { start: 'rgba(153, 204, 255, 1)', end: 'rgba(102, 153, 255, 1)' },
    { start: 'rgba(102, 153, 255, 1)', end: 'rgba(153, 204, 255, 1)' }
  ]

const StatSection = ({dataNumber, unit, description, icon}:{dataNumber:number | string, unit:string, description:string, icon:IconType}) => {
    return (
        <Box flex='1' p='20px' bg='linear-gradient(to right, rgba(102, 153, 255, 1),rgba(153, 204, 255, 1))' textAlign={'center'} boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'}  borderRadius={'.7em'}> 
            <Text mb='.5vh' color='white' fontWeight={'bold'} fontSize={'2.5em'}>{dataNumber} <span style={{fontSize:'.4em', fontWeight:500}}>{unit}</span></Text>
            <Text color='gray.100' fontSize={'.9em'} fontWeight={'medium'}>{description}</Text>
        </Box>
    )
}


//MAIN FUNCTION
function Tickets ({data, waitingFilters}:TicketsProps) {

    //TRANSLATION
    const { t } = useTranslation('stats')

    //PARSE DATA FOR HOURS CHART
    const allHours = []
    for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0') + "h"
        allHours.push(hour)
    }  
    const hoursResult = allHours.map(hour => {
        const hourNumber = hour.split('h')[0]
        const index = data?.avg_conversations_per_hour_of_day.X.indexOf(hourNumber)
        return index !== -1 ? data?.avg_conversations_per_hour_of_day.Y[index] : 0
    })
    
    return(<>
    <Skeleton flex='1' isLoaded={data !== null && !waitingFilters}> 
        <Flex mt='2vw' width='100%' gap='1vw' justifyContent={'space-between'}>
            <StatSection dataNumber={data?.total_conversations_maintained} unit={t('tickets')} description={t('ReceivedTickets')} icon={FaTicket}/>
            <StatSection dataNumber={data?.total_conversations_closed} unit={t('tickets')} description={t('ClosedTickets')} icon={FaTicket}/>
            <StatSection dataNumber={parseFloat(data?.avg_initial_response_time || 0).toLocaleString('es-ES', {minimumFractionDigits:0, maximumFractionDigits:2})} unit={t('seconds')} description={t('FirstResponse')} icon={FaTicket}/>
            <StatSection dataNumber={parseFloat(data?.avg_time_to_close_ticket || 0).toLocaleString('es-ES', {minimumFractionDigits:0, maximumFractionDigits:2})} unit={t('seconds')} description={t('ClosedTicket')} icon={FaTicket}/>
            <StatSection dataNumber={( (data?.avg_initial_response_time && data?.avg_time_to_close_ticket)?parseFloat(data?.avg_time_to_close_ticket) - parseFloat(data?.avg_initial_response_time):0).toLocaleString('es-ES', {maximumFractionDigits:2})} unit={t('seconds')} description={t('Duration')} icon={FaTicket}/>
        </Flex>
    </Skeleton>

    <Box height={'50vh'} width={'100%'} mt='3vh'> 
        <Text whiteSpace={'nowrap'} fontWeight={'medium'} fontSize={'1.1em'}>{t('TotalTicketsMonth')}</Text>
        <ColumnChart xaxis={data?.conversations_per_month.X || []} yaxis1={data?.conversations_per_month.Y || []} ytitle1={t('Ticktets')}/>
    </Box>

    <Skeleton isLoaded={data !== null && !waitingFilters}> 
        <Flex mt='8vh' flex='1' gap='1vw' height={'40vh'} >
            <Box bg='white' width={'5%'} flex='4'> 
                <Text  fontSize={'1.1em'} whiteSpace={'nowrap'}  fontWeight={'medium'}>{t('AverageTicketsHour')}</Text>
                <ColumnChart xaxis={allHours}  yaxis1={hoursResult} ytitle1={t('Tickets')}/>
            </Box>
            <Box bg='white' width={'5%'} flex='3'> 
                <Text  fontSize={'1.1em'} whiteSpace={'nowrap'} fontWeight={'medium'}>{t('AverageTicketsWeek')}</Text>
                <ColumnChart xaxis={data?.avg_conversations_per_day_of_week.X || []} type ={'weekdays'}  yaxis1={data?.avg_conversations_per_day_of_week.Y || []} ytitle1={t('Ticktets')}/>
            </Box>
        </Flex>
    </Skeleton>

    <Skeleton isLoaded={data !== null && !waitingFilters}> 
        <Flex  height={'50vh'} mt='8vh' gap='1vw'>
            
            <Box bg='white' width={'5%'} flex='1'> 
                <Text  fontSize={'1.1em'} whiteSpace={'nowrap'}  fontWeight={'medium'}>{t('TotalChannelTickets')}</Text>
                {data !== null && <Box   height={'calc(100% - 2vw)'}  >
                    <PieChartComponent mapData={{'email':t('Mail'), 'whatsapp':'Whastapp', 'instagram':'Instagram', 'webchat':t('Web'), 'google_business':'Google Business'}} labels={data?.conversations_by_channel.X} data={data?.conversations_by_channel.Y} />
                </Box>}
            </Box>

            <Box bg='white' width={'5%'} flex='1'> 
                <Text  fontSize={'1.1em'}  whiteSpace={'nowrap'}  fontWeight={'medium'}>{t('TotalSubjectTickets')}</Text>
                {data !== null && <Box height={'calc(100% - 2vw)'}  >
                    <PieChartComponent labels={data?.conversations_by_subject.X} data={data?.conversations_by_subject.Y} />
                </Box>}
            </Box>

        </Flex>   
    </Skeleton>

    </>)
}

export default Tickets