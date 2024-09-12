//REACT
import { useState, useEffect, Suspense, lazy, ReactElement } from "react"
import { useAuth } from "../../../AuthContext"
import { useTranslation } from 'react-i18next'
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
//FRONT
import { Flex, Box, Button } from '@chakra-ui/react'
//ICONS
import { TiFlowMerge } from "react-icons/ti"
import { FaCode } from "react-icons/fa"
//COMPONENTS
const FlowsTable = lazy(() => import('./FlowsTable'))
const Functions = lazy(() => import('./Functions'))
const Flow = lazy(() => import('./Flow'))
 
//MAIN FUNCTION
function FlowsFunctions () {

    //CONSTANTS
    const navigate = useNavigate()
    const location = useLocation().pathname
    const auth = useAuth()
    const { t } = useTranslation('flows')
    const sectionsList:['flows' | 'functions', ReactElement][] = [['flows', <TiFlowMerge/>], ['functions',<FaCode/>]]

    //SEECTED SECTION AND NAVIGATION
    const [selectedSection, setSelectedSection] = useState<'flows' | 'functions'>(localStorage.getItem('currentSectionFunctionsFlows') as 'flows' | 'functions' || 'flows')
    useEffect(() => {
        document.title = `${t(selectedSection)} - ${auth.authData.organizationName} - Matil`
        localStorage.setItem('currentSection', 'flows-functions')
        localStorage.setItem('currentSectionFunctionsFlows', selectedSection)
        navigate(selectedSection)
    }, [selectedSection])

    //FRONT
    return(
        <Box> 
            {!location.startsWith('/flows-functions/flows/flow/') && <Flex gap='20px' height={'60px'} px='2vw' borderBottomWidth={'1px'} borderBottomColor={'gray.300'} bg='gray.50'>
                {sectionsList.map((section, index)=>{
                    const isSelected = selectedSection === section[0]
                    return(
                    <Flex alignItems={'center'} color={'black'} key={`secciones-${index}`}   onClick={() => {setSelectedSection(section[0])}} >
                        <Button size='sm' border='none' bg={isSelected?'blue.100':'transparent'}  color={isSelected?'black':'gray.600'}  _hover={{bg:isSelected?'blue.100':'transparent', color:'black'}} leftIcon={section[1]}> {t(section[0])}</Button>
                    </Flex>)
                    })}
            </Flex>}

            <Box bg='white' height={'calc(100vh - 60px)'}> 
                <Suspense fallback={<></>}>    
                    <Routes >
                        <Route path="/flows" element={<FlowsTable/>}  />
                        <Route path="/functions/*" element={<Functions/>}  />
                        <Route path="/flows/flow/:n" element={<Flow/>}/>
                    </Routes>
                </Suspense>
            </Box>
        </Box>)
}

export default FlowsFunctions

 