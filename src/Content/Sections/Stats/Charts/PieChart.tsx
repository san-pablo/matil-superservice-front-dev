//REACT
import { useRef, useState, RefObject } from 'react';
import useResizeObserver from '@react-hook/resize-observer';
//MUI THEME
import { ThemeProvider, createTheme } from '@mui/material/styles';
//MUI CHARTS
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { Flex, Box, Text } from '@chakra-ui/react'

//TYPING
interface PieChartProps {
  labels: string[]
  data: number[]
  mapData?:{[key:string]:string}
}

//CREATE A MUI THEME
const muiTheme = createTheme({
  palette: { mode: 'light' },
  typography: { fontFamily: 'Jost, sans-serif', fontSize: 12 }
})

//HOOK TO OBSERVE RESIZES
const useSize = (target: RefObject<HTMLElement>) => {
  const [size, setSize] = useState<DOMRectReadOnly>()
  useResizeObserver(target, (entry) => setSize(entry.contentRect))
  return size
}

//COLORS FOR EACH PART
const gradients = [
  { start: 'rgba(0, 51, 153, 1)', end: 'rgba(0, 102, 204, 1)' },
  { start: 'rgba(0, 102, 204, 1)', end: 'rgba(51, 153, 255, 1)' },
  { start: 'rgba(51, 153, 255, 1)', end: 'rgba(102, 204, 255, 1)' },
  { start: 'rgba(102, 204, 255, 1)', end: 'rgba(153, 204, 255, 1)' },
  { start: 'rgba(153, 204, 255, 1)', end: 'rgba(102, 153, 255, 1)' },
  { start: 'rgba(102, 153, 255, 1)  ', end: 'rgba(153, 204, 255, 1)' }
]

//PIE CHART 
const PieChartComponent = ({ labels, data, mapData }: PieChartProps) => {
  
  //RESIZING
  const target = useRef(null)
  const size = useSize(target)

  //CALCULATE TOTAL VALUE
  let valuesSum = 0
  if (data) valuesSum = data.reduce((acc:number, value:number) => acc + value, 1)

  //CUSTOM LEGEND COMPONENT
  const Legend = ({ labels, gradients }:{labels:string[], gradients:{start:string, end:string}[]}) => (
    <Flex flexDir={'column'} overflow={'scroll'} width={'30%'} maxW='250px' height={'90%'} >
      {labels.map((label, index) => (
        <Flex key={`label-${index}`} gap='10px' mt='10px'>
          <Box  mt='5px'bg={`linear-gradient(to right, ${gradients[index % 6].start}, ${gradients[index % 6].end})`} minW={'10px'} height={'10px'} width={'10px'}/>
          <Text fontSize={'.8em'} color='gray.600' fontWeight={'medium'}>{label ? mapData ? mapData[label]:label : 'Otros'}</Text>
        </Flex>
      ))}
    </Flex>
  )
  
  //FRONT
  return (
    <ThemeProvider theme={muiTheme}>
    <div ref={target} style={{ display:'flex', alignItems:'center', justifyContent:'center', width: '100%', height: '100%' }}>
        <svg width="0" height="0">
          <defs>
            {gradients.map((gradient, index) => (
              <linearGradient id={`gradient-pie-${index}`} key={index} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={gradient.start} />
                <stop offset="100%" stopColor={gradient.end} />
              </linearGradient>
            ))}
          </defs>
        </svg>
        {size && 
        <>
        {data.length === 0 ? 
        <span style={{color:'#4A5568'}}>No hay datos para mostrar</span>:
          (<><PieChart
            width={size.width * 0.7}
            height={size.height * 0.9  }
            series={[
              {
                highlightScope: { faded: 'global', highlighted: 'item' },
                arcLabel: (item) => `${(item.value/valuesSum * 100).toLocaleString('es-ES',{minimumFractionDigits:0, maximumFractionDigits:2})} %`,
                id: 'pieSeries',
                innerRadius: 30,
                cornerRadius: 5,
                paddingAngle: 2,
                data: data?.map((value, index) => ({
                  id: labels[index],
                  label: labels[index]? mapData ? mapData[labels[index]]:labels[index] : 'Otros',
                  value,
                  color: `url(#gradient-pie-${index%6})`,
                })),
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
          <Legend labels={labels} gradients={gradients} />
          </>)
        }
         </>}
      </div>

    </ThemeProvider>
  )
}

export default PieChartComponent
