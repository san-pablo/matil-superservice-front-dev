//REACT
import { useRef, useState, RefObject} from 'react'
import { useTranslation } from 'react-i18next'
import useResizeObserver from '@react-hook/resize-observer'
//MUI THEME
import { ThemeProvider, createTheme } from '@mui/material/styles'
//MUI CHARTS
import { BarChart } from '@mui/x-charts/BarChart'
import { axisClasses } from '@mui/x-charts/ChartsAxis'
import { chartsGridClasses } from '@mui/x-charts/ChartsGrid'
import { chartsTooltipClasses } from '@mui/x-charts'
//TYPING
interface ColumnChartProps {
  xaxis: string[]
  yaxis1: number[]
  yaxis2?: number[]
  ytitle1: string
  ytitle2?: string
  type?:string
  isChannels?:boolean
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

import React from 'react';
import { Paper } from '@mui/material';

const CustomItemTooltipContent = ({ itemData, series }:{ itemData:any, series:any }) => {
  const item = series.data[itemData.dataIndex]; // Access all item properties here
  
  return (
    <Paper sx={{ padding: 2, backgroundColor: series.color }}>
      <p>{series.label}</p>
      <p>x: {item.x}</p>
      <p>y: {item.y}</p>
      <p>Additional value: {item.other}</p>
      <p>Another value: {item.other2}</p>
    </Paper>
  );
};



//COLUMN CHART 
const ColumnChart = ({ xaxis, yaxis1, yaxis2 = [], ytitle1, ytitle2 = '', type = '', isChannels = false}: ColumnChartProps) => {
  
  //TRANSLATION
  const { t } = useTranslation('stats')

  //RESIZING
  const target = useRef(null)
  const size = useSize(target)
 
  //MAP WEEKDAYS
  const WeekDaysList = [t('Day_1'), t('Day_2'), t('Day_3'), t('Day_4'), t('Day_5'), t('Day_6'), t('Day_7')]
 
  const colors = ['rgba(0, 102, 204, 1)', '']
  //FRONT
  return (
    <ThemeProvider theme={muiTheme}>
         <svg width="0" height="0">
          <defs>
            <linearGradient id="gradient-column-1" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="rgba(0, 102, 204, 1)" />
              <stop offset="100%" stopColor="rgba(51, 153, 255, 1)" />
            </linearGradient>
            <linearGradient id="gradient-column-2" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="rgba(102, 204, 255, 1)" />
              <stop offset="100%" stopColor="rgba(153, 204, 255, 1" />
            </linearGradient>
          </defs>
        </svg>
      <div ref={target} style={{ display:'flex', alignItems:'center', justifyContent:'center', width: '100%', height: '100%' }}>
        {size  && 
        <>
        {yaxis1.length === 0 ? 
        <span style={{color:'#4A5568'}}>{t('NoData')}</span>:
        (
          <BarChart
            width={size.width}
            height={size.height}
            //XAXIS DATA
            xAxis={[
              {
                id: 'categories',
                data: (type && type === 'weekdays' )? WeekDaysList.slice(0, xaxis.length): isChannels? xaxis.map(channel => t(channel)): xaxis,
                scaleType: 'band',
              }
            ]}
            //YAXIS DATA
            series={
              [
              {
                id: 'values',
                data: yaxis1,
                label: ytitle1,
                 type: 'bar', 
                 color: 'url(#gradient-column-1)'
              },
              ...(ytitle2 !== '' ? [{
                id: 'values2',
                data: yaxis2,
                label: ytitle2,
                color: 'url(#gradient-column-2)',
                type: 'bar' as const
              }] : [])
            ]}
            //BORDER-RADIUS OF BARS
            borderRadius={4}
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
              tickSize: 0,
              tickLabelStyle: {
                angle: 0,
                fontSize: 12,
              }
            }}
             //YAXIS CONFIGURATION
            leftAxis={{
              tickSize: 0,
            }}
            tooltip={{itemContent: (params) => <CustomItemTooltipContent {...params} />}}            
            slotProps={{ legend: { hidden: true },  popper: {
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
        )}
        </>}
      </div>
    </ThemeProvider>
  )
}

export default ColumnChart
