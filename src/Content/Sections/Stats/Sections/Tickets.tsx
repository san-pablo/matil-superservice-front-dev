//FRONT
import { Flex, Text, Box, Skeleton } from "@chakra-ui/react"
//CHARTS
import ColumnChart from "../Charts/ColumnChart"
import PieChartComponent from '../Charts/PieChart'
import CompareChart from "../Charts/CompareChart"
import GradientIconText from "../Charts/GradientIconText"

//TYOING
interface TicketsProps {
    waitingFilters:boolean
    data:any | null
}

//MAIN FUNCTION
function Tickets ({data, waitingFilters}:TicketsProps) {

    //PARSE DATA FOR HOURS CHART
    const allHours = []
    for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0') + ":00"
        allHours.push(hour)
    }  
    const hoursResult = allHours.map(hour => {
        const hourNumber = hour.split(':')[0]
        const index = data?.avg_conversations_per_hour_of_day.X.indexOf(hourNumber)
        return index !== -1 ? data?.avg_conversations_per_hour_of_day.Y[index] : 0
    })
    
    return(<>
    <Skeleton flex='1' isLoaded={data !== null && !waitingFilters}> 
        <Flex mt='2vw' width='100%' height={'40vh'} gap='1vw'>
            
            <Flex width={'5%'} overflow={'hidden'}  flex='1'  flexDir={'column'} gap='3vh' height={'40vh'}     justifyContent={'space-between'}  bg='white' p='1vw' borderRadius={'1rem'}  boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                <Box> 
                    <GradientIconText children={data?.total_conversations_maintained} />
                    <Text mb='1vh'  color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>Tickets Recibidos</Text>
                    <GradientIconText children={data?.total_conversations_closed || 0} />
                    <Text color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>Tickets Cerrados</Text>
                </Box> 
                <CompareChart totalValue={data?.total_conversations_maintained || 0} firstValue={data?.total_conversations_closed || 0} firstString="Cerrados"  secondString="Sin cerrar"/>
            </Flex>
        
            <Box width={'5%'} overflow={'hidden'} height={'40vh'}  bg='white' p='1vw' borderRadius={'1rem'} flex='1' boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} >
                <GradientIconText children={`${(data?.avg_initial_response_time ? parseFloat(data?.avg_initial_response_time) : 0).toLocaleString('es-ES', {minimumFractionDigits:0, maximumFractionDigits:2})} s`}/>
                <Text mb='1vh' color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>Primera Respuesta</Text>
                <GradientIconText children={`${(data?.avg_time_to_close_ticket ? parseFloat(data?.avg_time_to_close_ticket) : 0).toLocaleString('es-ES', {minimumFractionDigits:0, maximumFractionDigits:2})} s`}/>
                <Text mb='1vh'  color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>Cierre del Ticket</Text>
                <GradientIconText children={`${( (data?.avg_initial_response_time && data?.avg_time_to_close_ticket)?parseFloat(data?.avg_time_to_close_ticket) - parseFloat(data?.avg_initial_response_time):0).toLocaleString('es-ES', {maximumFractionDigits:2})} s`}/>
                <Text  color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>Duración de la Conversación</Text>
            </Box>
        
            <Box height={'40vh'}  width={'5%'} bg='white' p='1vw' borderRadius={'1rem'} flex='3'  boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                <Text whiteSpace={'nowrap'}  fontWeight={'medium'}>Media de tickets por hora</Text>
                <Box height={'calc(100% - 2vw)'}  >
                    <ColumnChart xaxis={allHours}  yaxis1={hoursResult} ytitle1={'Tickets'}/>
                </Box>
            </Box>

        </Flex>
    </Skeleton>

        <Skeleton isLoaded={data !== null && !waitingFilters}> 
             <Flex mt='2vw' flex='1' gap='1vw' height={'40vh'} >
                
                <Box bg='white' p='1vw' borderRadius={'1rem'} width={'5%'} flex='1'boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                    <Text whiteSpace={'nowrap'} fontWeight={'medium'}>Media de tickets por día de la semana</Text>
                    <Box height={'calc(100% - 2vw)'} >
                        <ColumnChart xaxis={data?.avg_conversations_per_day_of_week.X || []} type ={'weekdays'}  yaxis1={data?.avg_conversations_per_day_of_week.Y || []} ytitle1={'Tickets'}/>
                    </Box>
                </Box>
    
                <Box bg='white' p='1vw' borderRadius={'1rem'} width={'5%'} flex='1' boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                    <Text whiteSpace={'nowrap'} fontWeight={'medium'}>Tickets totales por mes</Text>
                    <Box height={'calc(100% - 2vw)'}  >
                        <ColumnChart xaxis={data?.conversations_per_month.X || []} yaxis1={data?.conversations_per_month.Y || []} ytitle1={'Tickets'}/>
                    </Box>
                </Box>

            </Flex>
        </Skeleton>

        <Skeleton isLoaded={data !== null && !waitingFilters}> 
            <Flex  height={'50vh'} mt='1vw' gap='1vw'>
                
                <Box bg='white' p='1vw' borderRadius={'1rem'} width={'5%'}  flex='1'  boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                    <Text whiteSpace={'nowrap'}  fontWeight={'medium'}>Tickets totales por canal</Text>
                    {data !== null && <Box   height={'calc(100% - 2vw)'}  >
                        <PieChartComponent mapData={{'email':'Mail', 'whatsapp':'Whastapp', 'instagram':'Instagram', 'webchat':'Chat Web', 'google_business':'Google Business'}} labels={data?.conversations_by_channel.X} data={data?.conversations_by_channel.Y} />
                    </Box>}
                </Box>

                <Box bg='white' p='1vw' borderRadius={'1rem'} width={'5%'}  flex='1'  boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                    <Text  whiteSpace={'nowrap'}  fontWeight={'medium'}>Tickets totales por tema</Text>
                    {data !== null && <Box height={'calc(100% - 2vw)'}  >
                        <PieChartComponent labels={data?.conversations_by_subject.X} data={data?.conversations_by_subject.Y} />
                    </Box>}
                </Box>

            </Flex>   
        </Skeleton>

    </>)
}

export default Tickets