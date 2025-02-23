//REACT
import { useRef, useState, RefObject, useEffect} from 'react'
import { useTranslation } from 'react-i18next'
import useResizeObserver from '@react-hook/resize-observer'
//FRONT
import { Text, Flex, Box } from '@chakra-ui/react'
//MUI THEME
import { ThemeProvider, createTheme } from '@mui/material/styles'
//MUI CHARTS
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart'
import { useAuth } from '../../../../AuthContext'

//TYPING
interface PieChartProps {
  xaxis:string[]
  values: number[]
  configuration:any
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

//COLORS FOR EACH PART
const colors = ['rgba(0, 51, 153, 1)','rgba(0, 102, 204, 1)',  'rgba(51, 153, 255, 1)',  'rgba(102, 204, 255, 1)', 'rgba(153, 204, 255, 1)', 'rgba(102, 153, 255, 1)']


//PIE CHART 
const PieChartComponent = ({ configuration, xaxis, values }: PieChartProps) => {
  
  //TRANSLATION
  const { t } = useTranslation('stats')
  const auth = useAuth()

  //RESIZING
  const target = useRef(null)
  const size = useSize(target)
 
  const parseData = () => {
    return  values?.map((value, index) => ({
      id: `id-${index}`,
      label: xaxis[index],
      value,
      color: colors[index%6]
    })).filter((data) => data.value > 0)
  }

  //CALCULATE TOTAL VALUE
  let valuesSum = 0
  valuesSum = values.reduce((acc:number, value:number) => acc + value, 1)

  //CUSTOM LEGEND COMPONENT
  const Legend = ({ labels, colors }:{labels:string[], colors:string[]}) => (
    <Flex flexDir={'column'} overflow={'scroll'}  w={'25%'}  h={(size?.height || 0) * 0.9} maxW='250px'  >
      {labels.map((label, index) => (
        <Flex key={`label-${index}`} gap='10px' mt='10px'>
          <Box borderRadius={'3px'}  mt='5px'bg={colors[index % 6]} minW={'10px'} height={'10px'} width={'10px'}/>
          <Text fontSize={'.8em'} color='text_gray' fontWeight={'medium'}>{label}</Text>
        </Flex>
      ))}
    </Flex>
  )
  
  //FRONT
  return (
    <ThemeProvider theme={muiTheme}>

      <div ref={target} style={{ display:'flex', overflow:'hidden', alignItems:'center', justifyContent:'center',  width: '100%', height: '100%'}}>

 
        {size && 
        <>
        {values.length === 0 ? 
        <span style={{color:'#4A5568'}}>{t('NoData')}</span>:
          (
          <>
            <PieChart
              width={size.width * 0.7}
              height={size.height * 0.9}
              series={[
                {
                  highlightScope: { faded: 'global', highlighted: 'item' },
                  arcLabel: (item) => `${configuration.show_percentage ? (item.value/valuesSum * 100).toLocaleString('es-ES',{minimumFractionDigits:0, maximumFractionDigits:2}):item.value} ${configuration.show_percentage ? '%':''}`,
                  id: 'pieSeries',
                  innerRadius: parseInt(configuration?.donut_radius) || 0,
                  cornerRadius: 5,
                  paddingAngle: 2,
                  data: parseData(),
                }
              ]}
              margin={{
                left: 30,
                right: 30,
                top: 30,
                bottom: 0,
              }}
              slotProps={{
                legend: {
                  hidden:true
                },
              }}
              sx={{
                [`& .${pieArcLabelClasses.root}`]: {
                  fill: 'white',
                  fontSize: 10,
                  fontWeight: 500,
                }
            }}
            />
            {configuration.show_legend &&<Legend labels={xaxis} colors={colors} />}
          </>)
        }
         </>}
      </div>

    </ThemeProvider>
  )
}

export default PieChartComponent
