//REACT
import { MutableRefObject, SetStateAction, useState } from "react"
import { useTranslation } from "react-i18next"
//FRONT
import { chakra, shouldForwardProp, Flex, Button, Text, Portal, Box } from "@chakra-ui/react"
import { motion, isValidMotionProp, AnimatePresence } from 'framer-motion'
//COMPONENTS
import LoadingIconButton from "./LoadingIconButton"
//LODASH
import isEqual from 'lodash.isequal';

//TYPING
interface SaveChangesType {
    data:any
    setData:(data:any) => void 
    dataRef:MutableRefObject<any>
    onSaveFunc:() => void
    onDiscardFunc?:() => void
    disabled?:boolean
    data2?:any
    setData2?:(data:any) => void 
    dataRef2?:MutableRefObject<any>
    areNullEnabled?:boolean
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//MAIN FUNCTINO
const SaveChanges = ({data, setData, dataRef, onSaveFunc, onDiscardFunc, disabled = false, data2, setData2,dataRef2, areNullEnabled = false }:SaveChangesType) =>{

    //CONSTANTS
    const { t } = useTranslation('settings')

    //SAVE CHANGES LOGIC
    const [waiting, setWaiting] = useState<boolean>(false) 
    const saveChanges = async () => {
        setWaiting(true)
        await onSaveFunc()
        setWaiting(false)
    }

    return (
        <AnimatePresence>
            <Portal> 
            { (((!isEqual(data, dataRef.current) && ((data !== null && dataRef.current !== null) || areNullEnabled)) || ((data2 && dataRef2) ? (!isEqual(data2, dataRef2.current) && ((data2 !== null && dataRef2.current !== null) || areNullEnabled) ): false )) && !disabled) && 
                <MotionBox px='2vw' position={'fixed'} zIndex={10000} top={0} left={0} width={'100vw'} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} height={'60px'} display={'flex'} bg='RGBA(0, 0, 0, 0.80)' alignItems={'center'} justifyContent={'space-between'}>
                    <Box/>
                    <Text fontWeight={'medium'} color='white'>{t('UnSavedChanges')}</Text>
                    <Flex gap='15px'>
                        <Button variant={'delete'} size='sm' onClick={() => {if (onDiscardFunc) onDiscardFunc(); else setData(dataRef.current); }}>{t('Discard')}</Button>
                        <Button variant={'common'} size='sm' onClick={saveChanges}>{waiting ? <LoadingIconButton/>:t('SaveChanges')}</Button>
                    </Flex>

                </MotionBox>}
            </Portal>
        </AnimatePresence>
    )
}

export default SaveChanges