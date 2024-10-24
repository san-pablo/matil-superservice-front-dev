
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Box, Text, Icon, Flex, Grid} from "@chakra-ui/react"

//ICONS
import { 
    FaArrowRight, FaArrowLeft, FaArrowUp, FaArrowDown,  FaLongArrowAltRight, FaLongArrowAltLeft, FaLongArrowAltUp, FaLongArrowAltDown, FaCaretRight, FaCaretLeft, FaCaretUp,
    FaArrowCircleRight, FaArrowCircleLeft, FaArrowCircleUp, FaArrowCircleDown, FaCaretDown, FaChevronLeft, FaChevronRight,FaChevronDown,FaChevronUp,
    FaChartLine, FaMoneyBill, FaBriefcase, FaCreditCard, FaPiggyBank,FaFileContract, FaBriefcaseMedical,FaClipboardList,FaUserTie,FaHandHoldingUsd,FaMoneyCheck,FaStore,
    FaBusinessTime, FaDollarSign, FaFileInvoice, FaComments, FaVideo, FaVolumeUp,  FaVolumeMute, FaVolumeDown, FaHeadset,
    FaChartBar, FaChartPie, FaChartArea, FaPoll,  FaListUl, FaListOl, FaStrikethrough, FaTextHeight, FaFile, FaTextWidth,
    FaPhone, FaEnvelope, FaFax, FaCommentDots, FaPaperPlane, FaMobileAlt, FaFilePowerpoint, FaFileImage, FaFileVideo, FaFileAudio, FaFileCode, FaFileCsv, FaFileDownload,
    FaPen, FaAlignLeft, FaAlignRight, FaBold, FaItalic, FaQuoteLeft, FaClipboard, FaMouse,
    FaFileAlt, FaFolder, FaFileArchive, FaFilePdf, FaFileWord, FaFileExcel, FaWind, FaCloudRain, FaDog, FaCat, FaSnowflake,
    FaTree, FaLeaf, FaSun, FaCloud, FaMountain, FaWater, FaSeedling, FaGamepad, FaKeyboard, FaPrint, FaSatelliteDish, 
    FaDesktop, FaLaptop, FaTabletAlt, FaHeadphones, FaCamera, FaTv, FaFrown, FaGrin, FaFemale,FaMale, FaUserNinja, FaUserShield,
    FaUser, FaSmile, FaHandPaper, FaUserFriends, FaUsers, FaChild, FaEye, FaTrash, FaGlobe, FaQuestionCircle,
    FaTools, FaCogs, FaHeart, FaStar, FaExclamationTriangle, FaLightbulb, FaUnlock, FaShieldAlt
} from 'react-icons/fa'

import EditText from "../../../Components/Reusable/EditText"
import { IconType } from "react-icons"
  

const IconsPicker = ({selectedIcon, setSelectedIcon}:{selectedIcon:string, setSelectedIcon:(value:string) => void}) => {

    const { t } = useTranslation('settings')

    const iconCategories: { [key: string]: { name: string, icon: IconType, description: string }[] } = {
        'ArrowIcons': [
            { name: 'FaArrowRight', icon: FaArrowRight, description: t('FaArrowRight') },
            { name: 'FaArrowLeft', icon: FaArrowLeft, description: t('FaArrowLeft') },
            { name: 'FaArrowUp', icon: FaArrowUp, description: t('FaArrowUp') },
            { name: 'FaArrowDown', icon: FaArrowDown, description: t('FaArrowDown') },
            { name: 'FaArrowCircleRight', icon: FaArrowCircleRight, description: t('FaArrowCircleRight') },
            { name: 'FaArrowCircleLeft', icon: FaArrowCircleLeft, description: t('FaArrowCircleLeft') },
            { name: 'FaArrowCircleUp', icon: FaArrowCircleUp, description: t('FaArrowCircleUp') },
            { name: 'FaArrowCircleDown', icon: FaArrowCircleDown, description: t('FaArrowCircleDown') },
            { name: 'FaLongArrowAltRight', icon: FaLongArrowAltRight, description: t('FaLongArrowAltRight') },
            { name: 'FaLongArrowAltLeft', icon: FaLongArrowAltLeft, description: t('FaLongArrowAltLeft') },
            { name: 'FaLongArrowAltUp', icon: FaLongArrowAltUp, description: t('FaLongArrowAltUp') },
            { name: 'FaLongArrowAltDown', icon: FaLongArrowAltDown, description: t('FaLongArrowAltDown') },
            { name: 'FaCaretRight', icon: FaCaretRight, description: t('FaCaretRight') },
            { name: 'FaCaretLeft', icon: FaCaretLeft, description: t('FaCaretLeft') },
            { name: 'FaCaretUp', icon: FaCaretUp, description: t('FaCaretUp') },
            { name: 'FaCaretDown', icon: FaCaretDown, description: t('FaCaretDown') },
            { name: 'FaChevronRight', icon: FaChevronRight, description: t('FaChevronRight') },
            { name: 'FaChevronLeft', icon: FaChevronLeft, description: t('FaChevronLeft') },
            { name: 'FaChevronUp', icon: FaChevronUp, description: t('FaChevronUp') },
            { name: 'FaChevronDown', icon: FaChevronDown, description: t('FaChevronDown') }
        ],
        'BusinessIcons': [
            { name: 'FaChartLine', icon: FaChartLine, description: t('FaChartLine') },
            { name: 'FaMoneyBill', icon: FaMoneyBill, description: t('FaMoneyBill') },
            { name: 'FaBriefcase', icon: FaBriefcase, description: t('FaBriefcase') },
            { name: 'FaCreditCard', icon: FaCreditCard, description: t('FaCreditCard') },
            { name: 'FaPiggyBank', icon: FaPiggyBank, description: t('FaPiggyBank') },
            { name: 'FaBusinessTime', icon: FaBusinessTime, description: t('FaBusinessTime') },
            { name: 'FaDollarSign', icon: FaDollarSign, description: t('FaDollarSign') },
            { name: 'FaFileInvoice', icon: FaFileInvoice, description: t('FaFileInvoice') },
            { name: 'FaFileContract', icon: FaFileContract, description: t('FaFileContract') },
            { name: 'FaBriefcaseMedical', icon: FaBriefcaseMedical, description: t('FaBriefcaseMedical') },
            { name: 'FaChartPie', icon: FaChartPie, description: t('FaChartPie') },
            { name: 'FaChartBar', icon: FaChartBar, description: t('FaChartBar') },
            { name: 'FaClipboardList', icon: FaClipboardList, description: t('FaClipboardList') },
            { name: 'FaLaptop', icon: FaLaptop, description: t('FaLaptop') },
            { name: 'FaUserTie', icon: FaUserTie, description: t('FaUserTie') },
            { name: 'FaHandHoldingUsd', icon: FaHandHoldingUsd, description: t('FaHandHoldingUsd') },
            { name: 'FaMoneyCheck', icon: FaMoneyCheck, description: t('FaMoneyCheck') },
            { name: 'FaStore', icon: FaStore, description: t('FaStore') }
        ],
        'ChartIcons': [
            { name: 'FaChartBar', icon: FaChartBar, description: t('FaChartBar') },
            { name: 'FaChartPie', icon: FaChartPie, description: t('FaChartPie') },
            { name: 'FaChartArea', icon: FaChartArea, description: t('FaChartArea') },
            { name: 'FaChartLine', icon: FaChartLine, description: t('FaChartLine') },
            { name: 'FaPoll', icon: FaPoll, description: t('FaPoll') },
        ],
        'CommunicationIcons': [
            { name: 'FaPhone', icon: FaPhone, description: t('FaPhone') },
            { name: 'FaEnvelope', icon: FaEnvelope, description: t('FaEnvelope') },
            { name: 'FaFax', icon: FaFax, description: t('FaFax') },
            { name: 'FaCommentDots', icon: FaCommentDots, description: t('FaCommentDots') },
            { name: 'FaPaperPlane', icon: FaPaperPlane, description: t('FaPaperPlane') },
            { name: 'FaMobileAlt', icon: FaMobileAlt, description: t('FaMobileAlt') },
            { name: 'FaComments', icon: FaComments, description: t('FaComments') },
            { name: 'FaVideo', icon: FaVideo, description: t('FaVideo') },
            { name: 'FaVolumeUp', icon: FaVolumeUp, description: t('FaVolumeUp') },
            { name: 'FaVolumeMute', icon: FaVolumeMute, description: t('FaVolumeMute') },
            { name: 'FaVolumeMute', icon: FaVolumeDown, description: t('FaVolumeDown') },
            { name: 'FaHeadset', icon: FaHeadset, description: t('FaHeadset') },
        ],  
        'ContentIcons': [
            { name: 'FaPen', icon: FaPen, description: t('FaPen') },
            { name: 'FaAlignLeft', icon: FaAlignLeft, description: t('FaAlignLeft') },
            { name: 'FaAlignRight', icon: FaAlignRight, description: t('FaAlignRight') },
            { name: 'FaBold', icon: FaBold, description: t('FaBold') },
            { name: 'FaItalic', icon: FaItalic, description: t('FaItalic') },
            { name: 'FaQuoteLeft', icon: FaQuoteLeft, description: t('FaQuoteLeft') },
            { name: 'FaClipboard', icon: FaClipboard, description: t('FaClipboard') },
            { name: 'FaListUl', icon: FaListUl, description: t('FaListUl') },
            { name: 'FaListOl', icon: FaListOl, description: t('FaListOl') },
            { name: 'FaStrikethrough', icon: FaStrikethrough, description: t('FaStrikethrough') },
            { name: 'FaTextHeight', icon: FaTextHeight, description: t('FaTextHeight') },
            { name: 'FaTextWidth', icon: FaTextWidth, description: t('FaTextWidth') },
            { name: 'FaFile', icon: FaFile, description: t('FaFile') }
        ],      
        'FolderIcons': [
            { name: 'FaFileAlt', icon: FaFileAlt, description: t('FaFileAlt') },
            { name: 'FaFolder', icon: FaFolder, description: t('FaFolder') },
            { name: 'FaFileArchive', icon: FaFileArchive, description: t('FaFileArchive') },
            { name: 'FaFilePdf', icon: FaFilePdf, description: t('FaFilePdf') },
            { name: 'FaFileWord', icon: FaFileWord, description: t('FaFileWord') },
            { name: 'FaFileExcel', icon: FaFileExcel, description: t('FaFileExcel') },
            { name: 'FaFilePowerpoint', icon: FaFilePowerpoint, description: t('FaFilePowerpoint') },
            { name: 'FaFileImage', icon: FaFileImage, description: t('FaFileImage') },
            { name: 'FaFileVideo', icon: FaFileVideo, description: t('FaFileVideo') },
            { name: 'FaFileAudio', icon: FaFileAudio, description: t('FaFileAudio') },
            { name: 'FaFileCode', icon: FaFileCode, description: t('FaFileCode') },
            { name: 'FaFileCsv', icon: FaFileCsv, description: t('FaFileCsv') },
            { name: 'FaFileDownload', icon: FaFileCsv, description: t('FaFileDownload') }
        ],
        'NatureIcons': [
            { name: 'FaTree', icon: FaTree, description: t('FaTree') },
            { name: 'FaLeaf', icon: FaLeaf, description: t('FaLeaf') },
            { name: 'FaSun', icon: FaSun, description: t('FaSun') },
            { name: 'FaCloud', icon: FaCloud, description: t('FaCloud') },
            { name: 'FaMountain', icon: FaMountain, description: t('FaMountain') },
            { name: 'FaWater', icon: FaWater, description: t('FaWater') },
            { name: 'FaSeedling', icon: FaSeedling, description: t('FaSeedling') },
             { name: 'FaWind', icon: FaWind, description: t('FaWind') },
            { name: 'FaRain', icon: FaCloudRain, description: t('FaCloudRain') },
            { name: 'FaSnowflake', icon: FaSnowflake, description: t('FaSnowflake') },
            { name: 'FaMountain', icon: FaMountain, description: t('FaMountain') },
            { name: 'FaDog', icon: FaDog, description: t('FaDog') },
            { name: 'FaTreeHouse', icon: FaCat, description: t('FaCat') }
        ],
        'DevicesIcons': [
            { name: 'FaMobileAlt', icon: FaMobileAlt, description: t('FaMobileAlt') },
            { name: 'FaTabletAlt', icon: FaTabletAlt, description: t('FaTabletAlt') },
            { name: 'FaLaptop', icon: FaLaptop, description: t('FaLaptop') },
            { name: 'FaDesktop', icon: FaDesktop, description: t('FaDesktop') },
            { name: 'FaHeadphones', icon: FaHeadphones, description: t('FaHeadphones') },
            { name: 'FaCamera', icon: FaCamera, description: t('FaCamera') },
            { name: 'FaTv', icon: FaTv, description: t('FaTv') },
            { name: 'FaGamepad', icon: FaGamepad, description: t('FaGamepad') },
            { name: 'FaKeyboard', icon: FaKeyboard, description: t('FaKeyboard') },
            { name: 'FaMouse', icon: FaMouse, description: t('FaMouse') },
            { name: 'FaPrinter', icon: FaPrint, description: t('FaPrinter') },
            { name: 'FaSatelliteDish', icon: FaSatelliteDish, description: t('FaSatelliteDish') },
        ],
        'PeopleIcons': [
            { name: 'FaUser', icon: FaUser, description: t('FaUser') },
            { name: 'FaSmile', icon: FaSmile, description: t('FaSmile') },
            { name: 'FaHandPaper', icon: FaHandPaper, description: t('FaHandPaper') },
            { name: 'FaCommentDots', icon: FaCommentDots, description: t('FaComments') },
            { name: 'FaUserFriends', icon: FaUserFriends, description: t('FaUserFriends') },
            { name: 'FaUsers', icon: FaUsers, description: t('FaUsers') },
            { name: 'FaChild', icon: FaChild, description: t('FaChild') },
            { name: 'FaFrown', icon: FaFrown, description: t('FaFrown') },
            { name: 'FaGrin', icon: FaGrin, description: t('FaGrin') },
            { name: 'FaFemale', icon: FaFemale, description: t('FaFemale') },
            { name: 'FaMale', icon: FaMale, description: t('FaMale') },
            { name: 'FaUserNinja', icon: FaUserNinja, description: t('FaUserNinja') },
            { name: 'FaUserShield', icon: FaUserShield, description: t('FaUserShield') },
        ],
        'Otros': [
            { name: 'FaTools', icon: FaTools, description: t('FaTools') },
            { name: 'FaCogs', icon: FaCogs, description: t('FaCogs') },
            { name: 'FaHeart', icon: FaHeart, description: t('FaHeart') },
            { name: 'FaStar', icon: FaStar, description: t('FaStar') },
            { name: 'FaExclamationTriangle', icon: FaExclamationTriangle, description: t('FaExclamationTriangle') },
            { name: 'FaLightbulb', icon: FaLightbulb, description: t('FaLightbulb') },
            { name: 'FaUnlock', icon: FaUnlock, description: t('FaUnlock') },
            { name: 'FaShieldAlt', icon: FaShieldAlt, description: t('FaShieldAlt') },
            { name: 'FaEye', icon: FaEye, description: t('FaEye') },
            { name: 'FaTrash', icon: FaTrash, description: t('FaTrash') },
            { name: 'FaGlobe', icon: FaGlobe, description: t('FaGlobe') },
            { name: 'FaQuestionCircle', icon: FaQuestionCircle, description: t('FaQuestionCircle') },
        ],
        
    }
 
    const [searchTerm, setSearchTerm] = useState('')
    const filteredIcons: [string, {name:string, icon:IconType, description:string}[]][] = 
    Object.entries(iconCategories).reduce(
        (acc, [category, icons]) => {
          const matchedIcons = icons.filter(icon => 
            icon.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
          if (matchedIcons.length > 0) {
            acc.push([category, matchedIcons]); // Mantener categoría e íconos filtrados
          }
          return acc;
        },
        [] as [string, {name:string, icon:IconType, description:string}[]][] 
      )

    return (
        <Box width={'350px'} p='20px' bg='white' borderRadius={'.7rem'} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' >
            <Text mb='.5vh' fontSize={'.9em'} color='gray.600' fontWeight={'medium'}>{t('Search')}</Text>
            <EditText value={searchTerm} setValue={setSearchTerm} searchInput placeholder={t('SearchIcons')}/>
            <Box mt='2vh' mb='2vh' width={'100%'} height={'1px'} bg='gray.300'/>
            <Box maxH='35vh' overflow={'scroll'}> 
                {filteredIcons.map(([category, icons]) => (
                    <Box key={`category-${category}`} mb={4}>
                    <Text fontWeight="medium" fontSize={'.9em'} color='gray.600' mb={'.5vh'}>{t(category)}</Text>
                    <Grid gap={'0'} templateColumns={'repeat(6, 1fr)'}>
                        {icons.map((icon:{name:string, icon:IconType, description:string}, index2) => (
                            <Box key={`icons-${category}-${index2}`}> 
                            <Flex onClick={() => setSelectedIcon(icon.name)} alignItems={'center'} justifyContent={'center'} key={icon.name} textAlign="center" bg={selectedIcon === icon.name?'rgba(59, 90, 246, 0.3)':'transparent'} cursor={'pointer'} p='10px' display={'inline-flex'} borderRadius={'.5rem'} _hover={{bg:selectedIcon === icon.name?'rgba(59, 90, 246, 0.3)':'brand.gray_1', color:'brand.text_blue'}}>
                                <Icon boxSize={'25px'} as={icon.icon}/>
                            </Flex>
                            </Box>
                        ))}
                    </Grid>
                    </Box>
                ))}
            </Box>
        </Box>
    )
}

export default IconsPicker