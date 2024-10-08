import { Box} from '@chakra-ui/react'
import { RefObject } from 'react'
import Wave from 'react-wavify'
import RandomWave from './Wave2'
import '../styles.css'


const Waves = ({position, boxRef}:{position:'left' | 'top' | 'right' | 'bottom', boxRef:RefObject<HTMLDivElement>}) => {
    
    const boxHeight = boxRef.current?.getBoundingClientRect().height || 0
    const boxWidth = boxRef.current?.getBoundingClientRect().width || 0
 
    const positionDict:{[key in 'left' | 'top' | 'right' | 'bottom']:{left?:number | string, top?:number | string, right?:number | string, bottom?:number | string, width?:string, height?:string, transform?:string, marginTop?:string, margiLeft?:string}} = {
        left:{top: `${-(boxWidth - boxHeight) / 2}px`, right: `${(boxWidth - boxHeight) / 2}px`, height:`${boxWidth}px`, width:`${boxHeight}px`,transform:'rotate(90deg)' },
        
        right:{top: `${-(boxWidth - boxHeight) / 2}px`, left: `${(boxWidth - boxHeight) / 2}px`, height:`${boxWidth}px`, width:`${boxHeight}px`, transform:'rotate(-90deg)'},
       
        top:{left:0, top:0, height:'250px', width:'100%', transform:'rotate(180deg)'},
        bottom:{left:0, bottom:0, height:'250px', width:'100%', }
    }
 
        return (<> 
  
    <Box position={'absolute'}  style={positionDict[position]}  >
        <Wave fill="white" paused={false} 
            style={{ height:'48px', width:'100%',  position:'absolute', opacity:0.8, bottom:0,}} 
            options={{ height: 25, amplitude: 5, speed: .5, points: 7}}/>
    </Box>
  
    </>)
}

export default Waves