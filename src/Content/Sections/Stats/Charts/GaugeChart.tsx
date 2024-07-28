//REACT
import { useRef, useState, RefObject } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
//MUI THEME
import { ThemeProvider, createTheme } from '@mui/material/styles'
//MUI CHARTS
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge'

//TYPING
interface GaugeChartProps {
    currentValue: number
    maxValue: number
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

//MAIN FUNCTION
const GaugeChartComponent = ({ currentValue, maxValue}: GaugeChartProps) => {
  
  //RESIZING
  const target = useRef(null)
  const size = useSize(target)

  //FRONT
  return (
    <ThemeProvider theme={muiTheme}>
      <div ref={target} style={{ width: '100%', height: '100%'}}>
        <svg width="0" height="0">
          <defs>
    
            <linearGradient id="gauge-chart-1" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="rgba(0, 102, 204, 1)" />
                <stop offset="100%" stopColor="rgba(51, 153, 255, 1)" />
            </linearGradient>

          </defs>
        </svg>
        {size && (
          <Gauge
            width={size.width}
            height={size.height}
            value={currentValue} 
            valueMax={maxValue}
            startAngle={-100} 
            endAngle={100} 
            margin={{
              left: 10,
              right: 10,
              top: 0,
              bottom: 20,
            }}
            slotProps={{
              legend: {
                labelStyle: {
                  fontSize: 12,
                  fontWeight:500,
                  fill: '#4A5568',
                },
                direction: 'column',
                position: { vertical: 'top', horizontal: 'right' },
                padding: 0,
                itemMarkWidth: 10,
                itemMarkHeight: 10,
                markGap: 4,
                itemGap: 10,
               },
            }}
            text={
                ({ value, valueMax }) => `${value}/${valueMax}`
             }
            sx={(theme) => ({
                [`& .${gaugeClasses.valueText}`]: {
                  fontSize: 20,
                  fontFamily:'Jost',
                  fontWeight:500,
                  transform: 'translateY(-10px)'
                },
                [`& .${gaugeClasses.valueArc}`]: {
                  fill: 'url(#gauge-chart-1)',
                },
                [`& .${gaugeClasses.referenceArc}`]: {
                  fill: theme.palette.text.disabled
                },
              })}
          />
        )}
      </div>
    </ThemeProvider>
  )
}

export default GaugeChartComponent
