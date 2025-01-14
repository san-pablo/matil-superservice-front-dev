//REACT
import { useTranslation } from "react-i18next"
import { useSession } from "../../../SessionContext"
//FRONT
import { Box, Text, Flex } from "@chakra-ui/react"

import { ChartType} from "../../Constants/typing" 
import { useAuth } from "../../../AuthContext"
//CHARTS
import KPI from "./Charts/KPI"
import ColumnChart from "./Charts/ColumnChart"
import PieChartComponent from "./Charts/PieChart"
import LineChartComponent from "./Charts/LineChart"
import Table from "../../Components/Reusable/Table"
//TYPING
import { logosMap, statesMap } from "../../Constants/typing"
import { useRef } from "react"
import parseNumber from "../../Functions/parseNumbers"

//MAIN FUCNTION
const ChartComponent = ({chartData}:{chartData:ChartType}) => {

    const { t, i18n } = useTranslation('stats')
    const t_formats = useTranslation('formats').t
    const t_con = useTranslation('conversations').t
    const session = useSession()

    //TRANSLATION
    const channels:any[] = session.sessionData?.additionalData?.channels || []

    const auth = useAuth()

    const parseXAxis = (type:null | 'time' | 'channel_type' |  'theme' | 'user_id' | 'channel_id' | 'status' | 'urgency_rating' | 'is_transferred'):[Array<any>,Array<any>] => {
        
        switch (type) {
            case 'time':

                const timestamps = chartData.data.map(element => element.view_by)
                const uniqueTimestamps:string[] = [...new Set(timestamps)].sort()
                let mapTime:string[]
                if (chartData.view_by.configuration.granularity === 'hour') mapTime = uniqueTimestamps.map((ts) => {const date = new Date(ts);return `${String(date.getHours()).padStart(2, '0')}h`})
                else if (chartData.view_by.configuration.granularity === 'day') mapTime = uniqueTimestamps.map((ts) => {const date = new Date(ts);return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`})
                else if (chartData.view_by.configuration.granularity === 'week') {
                    mapTime = uniqueTimestamps.map((ts) => {
                    const date = new Date(ts)
                    const firstDayOfWeek = new Date(date)
                    const day = firstDayOfWeek.getUTCDay()
                    const diff = firstDayOfWeek.getDate() - day + (day === 0 ? -6 : 1)
                    firstDayOfWeek.setDate(diff)
                    return `${String(firstDayOfWeek.getDate()).padStart(2, '0')}/${String(firstDayOfWeek.getMonth() + 1).padStart(2, '0')}`
                })}

                else mapTime = uniqueTimestamps.map((ts) => {const date = new Date(ts); return t_formats(`months.${date.getMonth()}`)})
                return [mapTime, uniqueTimestamps]
        
            case 'channel_type':
                return [(Object.keys(logosMap)).map(channel => t(channel)), Object.keys(logosMap)]
            case 'theme':
              return [[...auth.authData.conversation_themes, t('NoTheme')], [...auth.authData.conversation_themes, null]]
            case 'channel_id': 
                return [channels.map((channel:any) => channel.name), channels.map((channel:any) => t(channel.id))]
            case 'status':
                return [ Object.keys(statesMap).map(status => t_con(status)), Object.keys(statesMap).map(status => status)]
            case 'urgency_rating':
                return [Array.from({length:5}).map((value, index) => t_con(`Priority_${index}`)), Array.from({length:5})]
            case 'is_transferred':
                return [[t('Transfered'), t('NoTransfered')], ['transferred', 'notransferred']]
            case 'user_id':
                return [[...Object.keys(auth?.authData?.users || []).map(user => auth?.authData?.users?.[user]?.name), 'Tilda'], [...Object.keys(auth?.authData?.users || []), 'matilda']]
            case null:
                return [[],[]]
        }
    }
    const xAxis = parseXAxis(chartData?.view_by?.type || null)[0] 
    const xFindAxis = parseXAxis(chartData?.view_by?.type || null)[1] 

    const boxRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
   switch(chartData.type)  {
    case 'KPI':
        const metricName = chartData.metrics[0]?.metric_name
        const metricAgregation = chartData.metrics[0]?.aggregation_type

        let value = 0
 
        if (metricAgregation === 'avg') {
            let count = 0;
            const sum = chartData.data.reduce((sum, element) => {
                const val = typeof(element[metricName]) === 'string' ? parseInt(element[metricName], 10) : element[metricName]
                if (element[metricName]) {
                    count += 1
                    return sum + val
                }
                return sum
            }, 0)
            value = count > 0 ? sum / count : 0
        }
        
        else if (metricAgregation === 'min') {
            value = chartData.data.reduce((min, element) => {
                const val = typeof(element[metricName]) === 'string' ? parseInt(element[metricName], 10) : element[metricName]
                return Math.min(min, val || Infinity)
            }, Infinity);
        }
        else if (metricAgregation === 'max') {
            value = chartData.data.reduce((max, element) => {
                const val = typeof(element[metricName]) === 'string' ? parseInt(element[metricName], 10) : element[metricName]
                return Math.max(max, val || -Infinity)
            }, -Infinity)
        }
        else {
            value = chartData.data.reduce((sum, element) => {
                return sum + ( typeof(element[metricName]) === 'string' ? parseInt(element[metricName]): element[metricName] ) 
            }, 0)
        }

        return (
            <Flex   alignItems="start" flexDir={'column'} justifyContent={'center'} minW={0} width={'100%'} height={'100%'} borderRadius={'.5rem'} p='20px' boxShadow={'0 0 10px rgba(0, 0, 0, 0.2)'}> 
                
                <Text whiteSpace={'nowrap'}  minW="0" textOverflow={'ellipsis'} overflow={'hidden'} fontSize={'1.2rem'} fontWeight={'medium'}>{t(chartData.metrics[0].legend_label)}</Text>
                <Box  width={'100%'} > 
                    <KPI configuration={chartData.configuration} value={value}/>
                </Box>
            </Flex>
        )
    case 'column':
    case 'bar':
         
        const segmentxAxis = parseXAxis(chartData?.segment_by?.type || null)[0]
        const segmentxFindAxis = parseXAxis(chartData?.segment_by?.type || null)[1]

        const uniqueKeys = new Set<string>()
        const metricsNameArray:string[] = chartData.metrics.map((metric) => {return metric.legend_label})
        chartData.data.forEach(item => {Object.keys(item).forEach(key => {if (key !== "view_by" && key !== 'segment') uniqueKeys.add(key)})})
        const uniqueKeysArray:string[] = Array.from(uniqueKeys)

        const valuesList = uniqueKeysArray.map((metric) => {
            return xFindAxis.map((x:string) => {
                let barList:number[] = []
 
                if (segmentxFindAxis.length !== 0) {
                    segmentxFindAxis.map((segment:string) => {
                        const foundElement = chartData.data.find((item) => item.view_by === x && item.segment === segment)
                        if (foundElement) barList.push(foundElement[metric] || 0)
                        else barList.push(0)

                    })
                }
                else {
                    const foundElement = chartData.data.find((item) => item.view_by === x)
                    if (foundElement) barList.push(foundElement[metric] || 0)
                    else barList.push(0)
                }
                return barList
            })
        })

         const totalPerXAxis = xFindAxis.map((x, xIndex) => {
            return valuesList.reduce((acc, metricValues) => {
              const sumForXAxis = metricValues[xIndex].reduce((sum, value) => sum + (parseNumber(i18n, value, true) as number), 0)
              return acc + sumForXAxis;
            }, 0)
          })

        const yaxis = uniqueKeysArray.map((key:string, index:number) => {return metricsNameArray[index] || t(key.replace(/_\d+$/, ''))})

        return (
        <Flex flexDir={'column'} width={'100%'} height={'100%'} borderRadius={'.5rem'} p='20px' boxShadow={'0 0 10px rgba(0, 0, 0, 0.2)'}> 
            <Text fontSize={'1.2rem'} fontWeight={'medium'}>{chartData.title}</Text>
            <Box height={'calc(100% - 20px)'}  width={'100%'} > 
                <ColumnChart  segmentxAxis={segmentxAxis} key={chartData.type} xaxis={xAxis} yaxis={valuesList} ytitle={yaxis} yaxisSum={totalPerXAxis} chartType={chartData.type} configuration={chartData.configuration}/>
            </Box>
        </Flex>) 
    case 'donut':
        {
        const valuesList = xFindAxis.map((x:string) => {
            const foundElment = chartData.data.find((item) => item.view_by === x)
            return foundElment?.[chartData.metrics[0].metric_name] || 0
        })

        return (
        <Flex flexDir={'column'} width={'100%'} height={'100%'}  borderRadius={'.5rem'} p='20px' boxShadow={'0 0 10px rgba(0, 0, 0, 0.2)'}> 
            <Text fontSize={'1.2rem'} fontWeight={'medium'}>{chartData.title}</Text>
            <Box height={'calc(100% - 20px)'} width={'100%'} > 
                <PieChartComponent configuration={chartData.configuration}  xaxis={xAxis} values={valuesList} />
            </Box>
        </Flex>)
        }

    case 'line':
    case 'area':
        {
     
            const segmentxAxis = parseXAxis(chartData?.segment_by?.type || null)[0]
            const segmentxFindAxis = parseXAxis(chartData?.segment_by?.type || null)[1]

            const valuesList = chartData.metrics.map((metric) => {
                return xFindAxis.map((x:string) => {
                    let barList:number[] = []

                    if (segmentxFindAxis.length !== 0) {
                        segmentxFindAxis.map((segment:string) => {
                            const foundElement = chartData.data.find((item) => item.view_by === x && item.segment === segment)
                            if (foundElement) barList.push(foundElement[metric.metric_name] || 0)
                            else barList.push(0)

                        })
                    }
                    else {
                        const foundElement = chartData.data.find((item) => item.view_by === x)
                        if (foundElement) barList.push(foundElement[metric.metric_name] || 0)
                        else barList.push(0)
                    }
                    return barList
                })
            })

            const totalPerXAxis = xFindAxis.map((x, xIndex) => {
                return valuesList.reduce((acc, metricValues) => {
                  const sumForXAxis = metricValues[xIndex].reduce((sum, value) => sum + (parseNumber(i18n, value, true) as number), 0)
                  return acc + sumForXAxis;
                }, 0)
              })
              
            const uniqueKeys = new Set<string>()
            const metricsNameArray:string[] = chartData.metrics.map((metric) => {return metric.legend_label})
            chartData.data.forEach(item => {Object.keys(item).forEach(key => {if (key !== "view_by") uniqueKeys.add(key)})})
            const uniqueKeysArray:string[] = Array.from(uniqueKeys)
            const yaxis = uniqueKeysArray.map((key:string, index:number) => {return metricsNameArray[index] || t(key.replace(/_\d+$/, ''))})
 

        return (
            <Flex flexDir={'column'} width={'100%'} height={'100%'} borderRadius={'.5rem'} p='20px' boxShadow={'0 0 10px rgba(0, 0, 0, 0.2)'}> 
                <Text fontSize={'1.2rem'} fontWeight={'medium'}>{chartData.title}</Text>
                <Box height={'calc(100% - 20px)'} width={'100%'} > 
                    <LineChartComponent chartType={chartData.type}  xaxis={xAxis} segmentxAxis={segmentxAxis} yaxis={valuesList} ytitle={yaxis} configuration={chartData.configuration} yaxisSum={totalPerXAxis}/>
                </Box>
            </Flex>)
        }
    case 'table':
        {
            const CellStyle = ({column, element}:{column:string, element:any}) => {
                if (column === 'view_by') {
                    switch (chartData.view_by.type) {
                        case 'time':
                            if (chartData.view_by.configuration.granularity === 'hour') return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>  {`${String((new Date(element)).getHours()).padStart(2, '0')}h`}</Text>
                            else if (chartData.view_by.configuration.granularity === 'day') return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>  {`${String((new Date(element)).getDate()).padStart(2, '0')}/${String((new Date(element)).getMonth() + 1).padStart(2, '0')}`}</Text>
                            else if (chartData.view_by.configuration.granularity === 'week') {
                                const date = new Date(element)
                                const firstDayOfWeek = new Date(date)
                                const day = firstDayOfWeek.getUTCDay()
                                const diff = firstDayOfWeek.getDate() - day + (day === 0 ? -6 : 1)
                                firstDayOfWeek.setDate(diff)
                                return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>  {`${String(firstDayOfWeek.getDate()).padStart(2, '0')}/${String(firstDayOfWeek.getMonth() + 1).padStart(2, '0')}`}</Text>
                            }
                            else return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{t_formats(`months.${(new Date(element)).getMonth()}`)}</Text>                   
                        case 'channel_type':
                        case 'status':
                            return  <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{t(element)}</Text>
                        case 'theme':
                          return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}> {element}</Text>
                        case 'channel_id': 
                            return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{channels.find((channel: any) => channel.id === element).name}</Text>
                        case 'urgency_rating':
                            return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}> {t_con(`Priority_${element}`)}</Text>
                        case 'is_transferred':
                            return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element ? t('Transfered'):t('NoTransfered')}</Text>
                        case 'user_id': 
                            return  <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element === 'matilda' ? 'Tilda': element === 'no_user' ? t('NoAgent'): auth?.authData?.users?.[element].name || ''}</Text>
                        default:
                            return <></>
                    }
                }
                else return element
            }
            const getFirstRow = (type:null | 'time' | 'channel_type' |  'theme' | 'user_id' | 'channel_id' | 'status' | 'urgency_rating' | 'is_transferred') => {
                switch (type) {
                    case 'time':
                        return t(chartData.view_by.configuration.granularity)
                    default:
                        return type ? t(type) : ''
                }
            }
            const uniqueKeys = new Set<string>()
            chartData.data.sort((a, b) => {
                const aViewBy = a.view_by;
                const bViewBy = b.view_by;
                if (aViewBy < bViewBy) return -1
                if (aViewBy > bViewBy) return 1
                return 0
            })
              
            chartData.data.forEach(item => {
                Object.keys(item).forEach(key => {if (key !== "view_by") uniqueKeys.add(key)})
            })
            const uniqueKeysArray:string[] = Array.from(uniqueKeys)
            const metricsNameArray:string[] = chartData.metrics.map((metric) => {return metric.legend_label})

            const columnsMap:{[key:string]:[string, number]} = {'view_by':[getFirstRow(chartData.view_by.type) as string, 200]}
            const keyWidth = 900 / uniqueKeysArray.length

            uniqueKeysArray.forEach((key:string, index:number) => {columnsMap[key] = [metricsNameArray[index] || t(key.replace(/_\d+$/, '')), keyWidth]})
        
            const boxHeight = (boxRef.current?.getBoundingClientRect().height || 0) - (textRef.current?.getBoundingClientRect().height || 0) - 30

            return(
                <Flex flexDir={'column'} width={'100%'} height={'100%'}  borderRadius={'.5rem'} p='20px' boxShadow={'0 0 10px rgba(0, 0, 0, 0.2)'}> 
                    <Box ref={textRef}> 
                        <Text fontSize={'1.2rem'} fontWeight={'medium'}>{chartData.title}</Text>
                    </Box>
                    <Box height={'calc(100% - 20px)'} ref={boxRef} width={'100%'} > 
                        <Table noDataMessage={t('NoData')} CellStyle={CellStyle} height={boxHeight} data={chartData.data} columnsMap={columnsMap} excludedKeys={[]} showAccRow={chartData.configuration.show_acc_row} accMessage={t('Total')} accColumn={'view_by'}/>
                    </Box>
                </Flex>
            )
        }

   }
}

export default ChartComponent