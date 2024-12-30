//FRONT
import { Box, Text } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import parseNumber from "../../../Functions/parseNumbers"
const KPI = ({ value, configuration }:{value:string | number, configuration:any }) => {
    const { t, i18n } = useTranslation('stats')

    return (
    <Box height={'100%'} width={'100%'} >
         <Text fontSize={'2.5rem'} fontWeight={'semibold'}>{parseNumber(i18n, value)} {configuration.show_unit && configuration.unit}</Text>
         {configuration.show_objective && <Text color='gray.600'>{t('ObjectiveValue')}: {configuration.objective_value} {configuration.show_unit && configuration.unit}</Text>}
    </Box>  
    )
}

export default KPI