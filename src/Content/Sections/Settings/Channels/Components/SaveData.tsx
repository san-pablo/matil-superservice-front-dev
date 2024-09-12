//REACT
import { Dispatch, RefObject, SetStateAction, useState } from 'react'
import { useAuth } from '../../../../../AuthContext'
//FRTCH DATA
import fetchData from '../../../../API/fetchData'
import showToast from '../../../../Components/ToastNotification'
//FRONT
import { motion, AnimatePresence } from 'framer-motion'
import { Flex, Button, Text  } from '@chakra-ui/react'
//COMPONENTS
import LoadingIconButton from '../../../../Components/Reusable/LoadingIconButton'
 
const SaveData = ({data, setData, dataRef, channel}:{data:any, setData:Dispatch<SetStateAction<any>>, dataRef:any, channel:string}) => {


    const auth = useAuth()
    const [waitingSend, setWaitingSend] = useState<boolean>(false)
    const sendAllChanges = async () => {
        
        setWaitingSend(true)
        for (let i = 0; i < data.length; i++) {
            if (JSON.stringify(data[i]) !== JSON.stringify(dataRef.current[i])) { 
                const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/${channel}`, method:'put', requestForm:data[i], auth})
                if (response?.status !== 200) {
                    setData(dataRef.current)
                    setWaitingSend(false)
                    showToast({type:'failed', message:`Hubo un error al actualizar las ${channel === 'phone'?'lineas':'cuentas'}`})
                    break
                }
                else if (i === data.length - 1) {
                    dataRef.current = data
                    setWaitingSend(false)
                    showToast({type:'works', message:`Información actualizada correctamente`})
                }
            }           
        }
        setWaitingSend(false)
    }
    return(

        <AnimatePresence> 
            {(data.length > 0 && dataRef.current.length > 0 && JSON.stringify(data) !== JSON.stringify(dataRef.current)) && 
            <motion.div key='save-data' initial={{ opacity:0, top:-60}} animate={{opacity:1, top:0}} exit={{opacity:0, top:-60}} transition={{ duration: .2,  ease: [0.0, 0.9, 0.9, 1.0] }}
             style={{backgroundColor:'RGBA(0, 0, 0, 0.8)',display:'flex', justifyContent:'space-between', alignItems:'center',padding:'0 10px 0 10px', height:'60px', gap:'20px',position:'fixed', borderTop:' 1px solid #E2E8F0', overflow:'scroll', width:`100vw`, left:-60, zIndex:10000}}>
                <Text ml='5vw' color={'white'} fontWeight={'medium'}>Cambios no guardados</Text>
                <Flex gap='15px'> 
                    <Button sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }} bg='transparent'borderWidth={'1px'} _hover={{bg:'RGBA(255, 255, 255, 0.22)'}} borderColor={'white'}  size='sm' color='white' onClick={() => {setData(dataRef.current)}} >Descartar</Button>
                    <Button size='sm' bg='brand.gradient_blue' borderColor={'transparent'} onClick={sendAllChanges} color='white' _hover={{bg:'brand.gradient_blue_hover'}}>{waitingSend?<LoadingIconButton/>:'Guardar cambios'}</Button> 
                </Flex>
            </motion.div>}
        </AnimatePresence>
    )
}

export default SaveData