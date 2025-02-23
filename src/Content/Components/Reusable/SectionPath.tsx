//FRONT
import { Flex, Text, Icon } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
//COMPONENTS
import RenderIcon from "./RenderIcon";
//ICONS
import { IconType } from 'react-icons'
import { FiChevronRight } from "react-icons/fi"
import { IoFileTrayFull, IoPeopleSharp, IoBook } from "react-icons/io5" 
import { BsBarChartFill, BsStars, BsFillLayersFill } from "react-icons/bs"
import { BiSolidBuildings } from 'react-icons/bi'
//TYPING
import { sectionPathType, sectionsType } from "../../Constants/typing"


const SectionPathRender = ({ pathList, type }: {type:'view' | 'access', pathList: sectionPathType }) => {
    
     const { t } = useTranslation('main')
     const sectionsMap:{[key in sectionsType]:[string, IconType]} = {conversations: [t('Conversations'), IoFileTrayFull], persons: [t('Contacts'), IoPeopleSharp], 'businesses':[t('ContactBusinesses'), BiSolidBuildings], 'reports':[ t('Stats'), BsBarChartFill], 'functions':[t('Tilda'), BsStars],'sources':[t('Knowledge'), BsFillLayersFill]}

    if (!pathList || pathList.length === 0) return null;

    return (
        <Flex alignItems="center" fontSize="0.9em" >
            {pathList.map((item, index) => (
                <Flex key={item.id} alignItems="center">
                    {index === 0 ? 
                        <Flex alignItems={'center'} gap='5px'>
                            <Icon boxSize='13px' color='text_gray' as={(sectionsMap as any)[item.id][1]}/>
                            <Text>{(sectionsMap as any)[item.id][0]}</Text>
                        </Flex> 
                    :
                        <Flex alignItems={'center'} gap='5px'>
                            <RenderIcon icon={item.icon}/>
                            <Text>{item.name}</Text>
                        </Flex> 
                    }
                    <Icon as={FiChevronRight} mx='4px' />
                </Flex>
            ))}
            <Text>
                {type === 'access' ? t('NewAccess'): t('NewView')}
            </Text>
        </Flex>
    );
}

export default SectionPathRender
