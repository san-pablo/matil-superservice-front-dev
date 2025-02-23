//REACT
import { useRef, useState, RefObject, useEffect} from 'react'
import { useTranslation } from 'react-i18next'
import useResizeObserver from '@react-hook/resize-observer'
//MUI THEME
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Flex, Box, Text } from '@chakra-ui/react'
//MUI CHARTS
import { LineChart } from '@mui/x-charts'
import { chartsTooltipClasses } from '@mui/x-charts'
//FUNCTIONS
import parseNumber from '../../../Functions/parseNumbers'
//TYPING
interface ColumnChartProps {
  segmentxAxis:string[]
  xaxis:string[]
  yaxis:number[][][]
  ytitle:string[]
  chartType:'line' | 'area'
  configuration:any
  yaxisSum:number[]
} 

//CREATE A MUI THEME
const muiTheme = createTheme({
  palette: { mode: 'light' },
  typography: { fontFamily: 'Poppins, sans-serif', fontSize: 12 }
})

//HOOK TO OBSERVE RESIZES
const useSize = (target: RefObject<HTMLElement>) => {
  const [size, setSize] = useState<DOMRectReadOnly>()
  useResizeObserver(target, (entry) => setSize(entry.contentRect))
  return size
}


//COLUMN CHART 
const LineChartComponent = ({ chartType,xaxis, yaxis, ytitle, segmentxAxis, configuration, yaxisSum }: ColumnChartProps) => {
  
  //TRANSLATION
  const { t, i18n } = useTranslation('stats')

  //RESIZING
  const target = useRef(null)
  const size = useSize(target)
 
  //GRADIENTS
  const colors = ['rgba(0, 51, 153, 1)','rgba(0, 102, 204, 1)',  'rgba(51, 153, 255, 1)',  'rgba(102, 204, 255, 1)', 'rgba(153, 204, 255, 1)', 'rgba(102, 153, 255, 1)']

  const highlightScope = {highlight: 'series', fade: 'global'} as const

  const parseYAxis = () => {
    let yaxisTrue:any[] = []
    yaxis.map((metric, metricIndex) => {
      if (segmentxAxis.length > 0) {
        segmentxAxis.map((_, segmentIndex) => { 
          yaxisTrue.push( {
            id: `segment-${metricIndex}-${segmentIndex}`,
            data: xaxis.map((_, categoryIndex) => metric[categoryIndex][segmentIndex] || 0),
            label: `${ytitle[metricIndex]} (${segmentxAxis[segmentIndex]})`,
            color: colors[segmentIndex % colors.length],
            type: 'line',
            stack: `stack-${metricIndex}`,
            area:chartType === 'area',
            valueFormatter:(value:any, {dataIndex}:any) =>  `${parseNumber(i18n, value)} ${configuration.show_percentage?` (${parseNumber(i18n, ((parseNumber(i18n, value, true) as number) / yaxisSum[dataIndex]) * 100)}%)`:''}`

          })
        })
      }
      else yaxisTrue.push({
        id: `segment-${metricIndex}-${0}`,
        data: xaxis.map((_, categoryIndex) => metric[categoryIndex][0] || 0),
        label: `${ytitle[metricIndex]}`,
        color: colors[metricIndex % colors.length],
        type: 'line',
        stack: `stack-${metricIndex}`,
        area:chartType === 'area',
        valueFormatter:(value:any, {dataIndex}:any) =>  `${parseNumber(i18n, value)} ${configuration.show_percentage?` (${parseNumber(i18n, ((parseNumber(i18n, value, true) as number) / yaxisSum[dataIndex]) * 100)}%)`:''}`
      })
    })
    return yaxisTrue.map((s) => ({ ...s, highlightScope }));
  }

  //FRONT
  return (
    <ThemeProvider theme={muiTheme}>
         
        <div ref={target} style={{  width: '100%', height: '100%' }}>
          {size  && 
          <>
          {yaxis.length === 0 ? 
          <span style={{color:'#4A5568'}}>{t('NoData')}</span>:
          (<>

              {configuration.show_legend && 
              <Flex gap='20px'  overflowX={'scroll'} height={size.height * 0.1} width={size.width}>
                {ytitle.map((label, index) => (
                    <Flex key={`label-${index}`} gap='5px' mt='10px' alignItems={'center'}>
                      <Box bg={colors[index % 6]} borderRadius={'3px'} minW={'10px'} height={'10px'} width={'10px'}/>
                      <Text whiteSpace={'nowrap'} fontSize={'.8em'} color='text_gray' fontWeight={'medium'}>{label}</Text>
                    </Flex>
                  ))}
                </Flex>}
            <LineChart
              width={size.width}
              height={size.height * (configuration.show_legend ? 0.9:1)}
              xAxis={[
                {
                  id: 'categories', 
                  data: xaxis,
                  scaleType: 'band',
                }
              ]}
            
              // Series de datos
              series={parseYAxis()}
            
              //HORIZONTAL GRID
              grid={{ horizontal: true }}

              //CUSTOM MARGINS
              margin={{
                left: 30,
                right: 20,
                top: 20,
                bottom: 20,
              }}

              //XAXIS CONFIGURATION
              bottomAxis={{
                disableTicks:true, 
                tickLabelStyle: {
                  fontFamily:'Poppins', 
                  fontSize:'.8em', 
                  fontWeight:500,
                  angle: 0,
                }
              }}

              //YAXIS CONFIGURATION
              leftAxis={{
                disableTicks:true, 
                tickLabelStyle:{fontFamily:'Poppins', fontSize:'.8em', fontWeight:500}
              }}
              slotProps={{ legend: { hidden: true }, 
              axisLine:{strokeOpacity:0}, 
              popper: {
                sx: {
                  [`& .${chartsTooltipClasses.mark}`]: {
                    display: 'none',
                    width:'0px !important',
                    color: 'black',
                  },
                  [`& .${chartsTooltipClasses.markCell}`]: {
                    width:'0px !important',
                  }
                },
              },}}
            />    
          </>)}
          </>}
        </div>
    </ThemeProvider>
  )
}

export default LineChartComponent
