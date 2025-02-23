//FORNT
import { Icon } from "@chakra-ui/react" //ICONS
import { BsStars, BsBarChartFill, BsFillLayersFill } from "react-icons/bs"
import { IoFileTrayFull, IoPeopleSharp, IoPerson } from 'react-icons/io5'
import { BiSolidBuildings } from 'react-icons/bi'
 //TYPING
import { sectionsType } from "../../Constants/typing"

const RenderIcon = ({icon, size = 18, standardView}:{icon:{type:'emoji' | 'icon' | 'image', data:string}, size?:number, standardView?:string}) => {

    const modelsMap = {'conversations':IoFileTrayFull, 'persons':IoPeopleSharp, 'businesses':BiSolidBuildings, 'functions':BsStars, 'reports':BsBarChartFill, 'sources':BsFillLayersFill, 'me':IoPerson}
    if (standardView) return <Icon as={(modelsMap as any)[standardView]} color={'text_gray'} boxSize={`${size - (size > 20 ? 8:5)}px`}/>

    else if (!icon?.type) return <>👞</>

  
    return (

    <> 
        {icon?.type === 'emoji' ? <>
            {size > 25  ? 
                <div style={{fontSize:`${size * 0.9}px`}}>{icon.data}</div>
                :
                <>{icon.data}</>
            }
        </>
        :
        <>
            {icon.type === 'icon' ? 
            <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(icon.data)}`} alt={'selected-icon'} style={{ width: size, height: size }} /> 
            :    
            <img src={icon.data} alt={'selected-icon'} style={{ width: size, height: size }} /> 
            }
        </>

    }
    </>)
}

export default RenderIcon