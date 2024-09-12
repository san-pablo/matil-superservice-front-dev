//REACT
import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Skeleton, Flex, Button } from "@chakra-ui/react"
//COMPONENTS
import ChannelInfo from "./Components/Channelnfo"
import GetMatildaConfig from "./GetMatildaConfig"
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
import EditText from "../../../Components/Reusable/EditText"
import SaveData from "./Components/SaveData"
//TYPING
import { configProps } from "../../../Constants/typing"
 
//MAIN FUNCTION
function Mail () {

    //AUTH CONSTANT
    const auth = useAuth()
    const  { t } = useTranslation('settings')

    //DATA
    const [data, setData] = useState<any[]>([])
    const dataRef = useRef<any>(null)

    //FETCH DATA
    useEffect(() => {
      document.title = `${t('Channels')} - ${t('Mail')} - ${auth.authData.organizationName} - Matil`

      const fetchInitialData = async() => {
          const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/email`,  setValue: setData,  auth:auth})
          if (response?.status === 200) dataRef.current = response.data
      }
      fetchInitialData()
    }, [])
 
     const handleNameChange = (index:number, value:string) => {
      const updatedData = data.map((bot, i) =>i === index ? { ...bot, name: value } : bot)
      setData(updatedData)
    }


    const editCode = (newCode:string, index:number) => {
      setData(prevData => {
        const newData = [...prevData]
        if (newData[index]) newData[index] = {...newData[index], configuration: {...newData[index].configuration, template: newCode}}
        return newData
      })
    }

 

    const updateData = (newConfig:configProps, index:number) => {
      setData(prevData => {
          const newData = [...prevData]
          newData[index] = {...newData[index], matilda_configuration: newConfig}
          return newData}
      )
    } 

    //FRONT 
    return(
    <>
      <SaveData data={data} setData={setData} dataRef={dataRef} channel={'email'} />

      <Box> 
        <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('ActiveAccounts')} ({t('Mail')})</Text>
        <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh' mb='2vh'/>
      </Box>
      <Skeleton isLoaded={dataRef.current !== null && data !== null}> 
             {data.length === 0 ? <Text mt='3vh'>{t('NoActiveAccounts', {name:t('Mail')})}</Text>:
            <> 
              {data.map((bot, index) => (
                <Box bg='white' p='1vw' key={`mail-channel-${index}`} borderRadius={'.7rem'} mt={index === 0?'':'8vh'} boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.1)'} > 
                    <Flex justifyContent={'space-between'} > 
                        <Box width={'100%'} maxWidth={'600px'}> 
                            <EditText value={bot.name} maxLength={100} nameInput={true} size='md'fontSize='1.5em'  setValue={(value:string) => handleNameChange(index, value)}/>
                        </Box>
                    </Flex>
                    <Box height={'1px'} mt='2vh'mb='2vh' width={'100%'} bg='gray.300'/>

                    <Flex px='7px' key={`whatsapp-${index}`} width={'100%'} gap='5vw'> 
                      <Box flex='1'> 
                        <ChannelInfo value={bot.display_id} title={t('Account')} description={t('Account')}/>
                        <ChangeCode  editCode={editCode} codeValue={bot.configuration.template} index={index}/>
                      </Box>
                        <Box flex='1'> 
                            <GetMatildaConfig configDict={bot.matilda_configuration} updateData={updateData} configIndex={index}/>
                        </Box>
                    </Flex>
                  </Box>
              ))} 
            </>}
       
      </Skeleton>
    </>)
}

const ChangeCode = ({codeValue, index, editCode}:{codeValue:string, index:number, editCode:(code:string, index:number) => void}) => {
  
  const  { t } = useTranslation('settings')


  return (
  <Box px='7px' mt='5vh'>
    <Text mt='1vh' fontWeight={'medium'}>{t('Template')}</Text>
    <Text mb='1vh' color='gray.600' fontSize={'.8em'}>{t('TemplateDes')}</Text>
    <Box flex='1'> 
      <Box flex='1' dangerouslySetInnerHTML={{ __html: codeValue}}/>
      <Box height={'500px'}  mt='3vh'   bg='black' color='white' p='10px' borderRadius={'.7em'}><textarea style={{outline:'none', background:'transparent', border:'none', width:'100%', height:'100%'}} value={codeValue} onChange={(e) => {editCode(e.target.value, index)}}/></Box>
    </Box>
  </Box>
  )
 }

export default Mail
