import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useBlocker, useNavigate } from 'react-router-dom'
// FRONT
import { Flex, Button, Text } from "@chakra-ui/react"
// COMPONENTS
import LoadingIconButton from "./LoadingIconButton"
import ConfirmBox from "./ConfirmBox"

 

const NoSavedWarning = ({ data, dataRef, saveData }:{data:any, dataRef:any, saveData:() => void }) => {
    // CONSTANTS
    const { t } = useTranslation("settings")
    const navigate = useNavigate()

    // SHOW WARNING
    const [showNoSavedWarning, setShowNoSavedWarning] = useState<boolean>(false)
    const [prevPath, setPrevPath] = useState<string | null>(null)
    
    // NO SAVED BOX
    const NoSavedBox = () => {

        // WAIT AND CALL DATA
        const [waiting, setWaiting] = useState<boolean>(false);
        const fetchFunction = async () => {
            setWaiting(true)
            await saveData()
            setWaiting(false)
            setShowNoSavedWarning(false)
            navigate(prevPath)
        }

        return (
        <>
            <Flex flexDir={"column"} alignItems={"center"} p="20px" minW={"250px"} maxW="350px">
            <Text textAlign={"center"} fontWeight={"medium"} fontSize={"1.4em"}>
                {t("NoSavedWarning")}
            </Text>
            <Text fontWeight={400} fontSize={".8em"} mt="2vh" color="text_gray">
                {t("NoSavedWarningDes")}
            </Text>
            <Button mt="3vh" size="sm" w="100%" variant={"main"} onClick={fetchFunction}>
                {waiting ? <LoadingIconButton /> : t("SaveAndExit")}
            </Button>
            <Button mt="1vh" size="sm" w="100%" variant={"delete"} onClick={() => {setShowNoSavedWarning(false);navigate(prevPath)}}>
                {t("SaveWithoutExit")}
            </Button>
            </Flex>
        </>
        )
    }

  //BLOCK URL CHANGE
  useBlocker(
    ({ currentLocation, nextLocation, historyAction }) => {
      if ((data !== null && dataRef.current !== null) && (JSON.stringify(data) !== JSON.stringify(dataRef.current)) && currentLocation.pathname !== nextLocation.pathname && !prevPath) {
        setPrevPath(nextLocation.pathname)
        setShowNoSavedWarning(true)
        return true
      }
      return false
    }
  )

  
  // MEMOIZED BOX
  const memoizedBox = useMemo(
    () => (
      <ConfirmBox setShowBox={() => {}}>
        <NoSavedBox />
      </ConfirmBox>
    ),
    [showNoSavedWarning]
  )

  return <>{showNoSavedWarning && memoizedBox}</>
}

export default NoSavedWarning;
