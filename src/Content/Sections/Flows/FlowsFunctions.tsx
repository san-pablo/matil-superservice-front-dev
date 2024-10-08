//REACT
import { useState, useEffect, Suspense, lazy, ReactElement } from "react"
import { useAuth } from "../../../AuthContext"
import { useTranslation } from 'react-i18next'
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
//FRONT
import { Flex, Box, Button } from '@chakra-ui/react'
//COMPONENTS
import SectionSelector from "../../Components/Reusable/SectionSelector"
//ICONS
import { FaCodeBranch } from "react-icons/fa6"
import { TbMathFunction } from "react-icons/tb"

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
    const sectionsList:('flows' | 'functions')[] = ['flows', 'functions']
    const sectionsMap:{[key:string]:[string, ReactElement]} = {'flows':[t('Flows'), <FaCodeBranch style={{ transform: 'rotate(90deg)' }}/>], 'functions':[t('functions'), <TbMathFunction/>]}

    //SEECTED SECTION AND NAVIGATION
    const [selectedSection, setSelectedSection] = useState<'flows' | 'functions'>(localStorage.getItem('currentSectionFunctionsFlows') as 'flows' | 'functions' || 'flows')
    useEffect(() => {
        document.title = `${t(selectedSection)} - ${auth.authData.organizationName} - Matil`
        localStorage.setItem('currentSection', 'flows-functions')
        localStorage.setItem('currentSectionFunctionsFlows', selectedSection)

        let section = '/flows-functions/flows'
        if (selectedSection === 'functions') section = '/flows-functions/functions'
        navigate(section)
    }, [selectedSection])

    //FRONT
    return(
        <Flex height={'100vh'} flexDir={'column'}> 
            {!location.startsWith('/flows-functions/flows/flow/') && <> 
                <Box bg='white' p='2vw'>
                    <SectionSelector selectedSection={location.split('/')[2]} sections={sectionsList} sectionsMap={sectionsMap}  onChange={(section:string) => {setSelectedSection(section as 'flows' | 'functions')}} />
                    <Box height={'1px'} width={'100%'} bg='gray.300' mt='2vh' />

                </Box>
             </>}

            <Box bg='white' flex={1} width={'calc(100vw - 55px)'}> 
                <Suspense fallback={<></>}>    
                    <Routes >
                        <Route path="/flows" element={<FlowsTable/>}  />
                        <Route path="/functions/*" element={<Functions/>}  />
                        <Route path="/flows/flow/:n" element={<Flow/>}/>
                    </Routes>
                </Suspense>
            </Box>
        </Flex>)
}

export default FlowsFunctions

 