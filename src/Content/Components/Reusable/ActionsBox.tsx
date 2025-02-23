
import { SetStateAction, useState, Dispatch, useMemo } from "react"
import { useTranslation } from "react-i18next"
//FORNT
import { Flex, Box, Button, Text } from "@chakra-ui/react"
//COMPONENTS
import ConfirmBox from "./ConfirmBox"
import LoadingIconButton from "./LoadingIconButton"
import EditText from "./EditText"
//FUNCTIONS
import useEnterListener from "../../Functions/clickEnter" 

interface ActionsBoxType {

    showBox:any
    setShowBox:Dispatch<SetStateAction<any>>
    title:string
    des?:string
    type:'action' | 'delete'
    actionFunction:any
    buttonTitle:string
    AddComponent?:any
    introduceAtt?:string[]

}


const ActionsBox = ({showBox, setShowBox, title, des, type, actionFunction, buttonTitle, AddComponent, introduceAtt}:ActionsBoxType) =>  {

    const { t } = useTranslation('settings')

    const MemoBox = () => {
 
        //WAIT AND CALL DATA
        const [waiting, setWaiting] = useState<boolean>(false)
        const fetchFunction = async () => {
            setWaiting(true)
            await actionFunction(name, value, domain)
            setWaiting(false)
            setShowBox(false)
        }

        //INTRODUCE VALUES
        const [name, setName] = useState<string>('')
        const [value, setValue] = useState<string>('')
        const [domain, setDomain] = useState<string>('')
        useEnterListener({onClickEnter:fetchFunction, actionDisabled:((introduceAtt || []).includes('name') && name === '' || (introduceAtt || []).includes('value') && value === '') || ((introduceAtt || []).includes('domain') && domain === '')})

        return (<> 
            <Flex  flexDir={'column'} alignItems={'center'} p='20px' minW={'250px'} maxW='350px'> 
         
                <Text textAlign={'center'} fontWeight={'medium'} fontSize={'1.4em'}>{title}</Text>
                {des && <Text  fontWeight={400}  fontSize={'.8em'} mt='2vh' color='text_gray'>{des}</Text>}

                {introduceAtt && introduceAtt?.includes('name') && 
                    <Box mt='2vh' w='100%'> 
                        <Text fontWeight={'medium'} mb='.5vh' fontSize={'.9em'}>{t('Name') + ' *'}</Text>
                        <EditText fontSize=".9em" focusOnOpen placeholder={t('Name') + '...'} value={name} hideInput={false} setValue={(value) => setName(value)}/>
                    </Box>
                }
                {introduceAtt && introduceAtt?.includes('value') && 
                    <Box mt='2vh' w='100%'> 
                        <Text fontWeight={'medium'} mb='.5vh' fontSize={'.9em'}>{t('Value') + ' *'}</Text>
                        <EditText focusOnOpen={introduceAtt.length === 1} fontSize=".9em" placeholder={t('Value') + '...'} value={value} hideInput={false} setValue={(value) => setValue(value)}/>
                    </Box>
                }
                {introduceAtt && introduceAtt?.includes('domain') && 
                    <Box mt='2vh' w='100%'> 
                        <Text fontWeight={'medium'} mb='.5vh' fontSize={'.9em'}>{t('Domain') + ' *'}</Text>
                        <EditText focusOnOpen={introduceAtt.length === 1} fontSize=".9em" placeholder={t('Domain') + '...'} value={domain} hideInput={false} setValue={(value) => setDomain(value)}/>
                    </Box>
                }

             
                <Button mt='3vh' size='sm' w='100%' variant={type === 'delete' ? 'delete':'main'} disabled={((introduceAtt || []).includes('name') && name === '' || (introduceAtt || []).includes('value') && value === '') || ((introduceAtt || []).includes('domain') && domain === '') } onClick={fetchFunction}>{waiting?<LoadingIconButton/>:buttonTitle}</Button>
                <Button mt='1vh' size='sm'  w='100%'  variant={'common'} onClick={() => setShowBox(false)}>{t('Cancel')}</Button>
            </Flex>            
            </>)
    }

    //MEMOIZED BOX
    const memoizedBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowBox}> 
            <MemoBox/>
        </ConfirmBox>
    ), [showBox])

    return (<>{showBox && memoizedBox}</>)
}

export default ActionsBox