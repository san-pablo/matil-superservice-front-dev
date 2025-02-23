import { useTranslation  } from "react-i18next"
import { useNavigate } from "react-router-dom"
import React, { Dispatch, SetStateAction, useRef, useState, ReactNode, Fragment, useMemo } from "react"
import { useAuth } from "../../../AuthContext"
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Text, Box, Icon, Flex,Skeleton, Tooltip, IconButton, Avatar, Switch } from "@chakra-ui/react"
import "../../Components/styles.css"
//COMPONENTS
import RenderIcon from "../../Components/Reusable/RenderIcon"
import CustomSelect from "../../Components/Reusable/CustomSelect"
import CollapsableSection from "../../Components/Reusable/CollapsableSection"
//FUNCTIONS
import timeAgo from "../../Functions/timeAgo"
import timeStampToDate from "../../Functions/timeStampToString"
//ICONS
import { IoBook } from "react-icons/io5"
import { BiWorld } from "react-icons/bi"
import { RxCross2, RxCheck } from "react-icons/rx"
import { FaFolder, FaLock, FaFileLines, FaFilePdf } from "react-icons/fa6"
//TYPING
import { ContentData, languagesFlags } from "../../Constants/typing" 
 

//SIDE BAR OF THE SOURCES
const TypesComponent = ({t,  type }:{t:any, type:'internal_article' | 'public_article' | 'folder' | 'pdf' | 'snippet' | 'subpage'  | 'website'}) => {
    
    const getAlertDetails = (type:'internal_article' | 'public_article' | 'folder' | 'pdf' | 'snippet' | 'subpage' | 'website') => {
        switch (type) {
            case 'internal_article':
                return { color1: 'yellow.100', color2:'yellow.200', icon: FaLock, label: t('InternalArticle') }
            case 'public_article':
                return { color1: 'blue.100', color2:'blue.200', icon: IoBook, label: t('PublicArticle')  }
            case 'folder':
                return { color1: 'gray_1', color2:'border_color', icon: FaFolder, label: t('Folder')  }
            case 'pdf':
                return { color1: 'gray_1', color2:'border_color', icon: FaFilePdf, label: t('Pdf')  }
            case 'snippet':
                return { color1: 'gray_1', color2:'border_color', icon: FaFileLines, label: t('Text')  }
            case 'subpage':
            case 'website':
                return { color1: 'gray_1', color2:'border_color', icon: BiWorld, label: t('Web')  }
            default:
                return { color1: 'gray_1', color2:'border_color', icon: BiWorld, label: t('Web')  }
        }
    }
    const { color1, color2, icon, label } = getAlertDetails(type)
    return (
        <Flex display={'inline-flex'}   gap='10px' alignItems="center" borderRadius={'1rem'} borderColor={color2} borderWidth={'1px'} py='2px' px='5px' bg={color1}>
            <Icon as={icon} />
            <Text fontSize={'.9em'} >{label}</Text>
        </Flex>
    )
} 

const MatildaSVG = React.memo(() => (
    <svg xmlns="http://www.w3.org/2000/svg" height={'14px'} width={'14px'} viewBox="0 0 300 300" shapeRendering="geometricPrecision" textRendering="geometricPrecision">
    <defs>
<linearGradient id="eTB19c3Dndv5-fill" x1="8.7868" y1="321.2132" x2="325.1695" y2="4.8305" spreadMethod="pad" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 0)"><stop id="eTB19c3Dndv5-fill-0" offset="0%" stop-color="#486cff"/>
<stop id="eTB19c3Dndv5-fill-1" offset="100%" stop-color="#05a6ff"/></linearGradient></defs><line x1="0" y1="0" x2="150" y2="29.8476" fill="none"/>
<line x1="300" y1="0" x2="150" y2="29.8476" fill="none"/><path d="M150,294.56691h-120c-16.5685,0-30-13.4315-30-30L0,23.98642c.00711.00133.01421.00266.02132.00398C0.56762,10.66654,11.54195,0.03246,25,0.03246c1.83337,0,3.62065.19735,5.34175.57197L144.26601,23.27354c1.84126.4321,3.76093.66067,5.73399.66067s3.89273-.22857,5.73399-.66067L268.79261,0.77668C270.7774,0.26958,272.85722,0,275,0c13.80712,0,25,11.19288,25,25c0,.04825-.00014.09646-.00041.14465.00014-.00003.00027-.00005.00041-.00008v239.42234c0,16.5685-13.4315,30-30,30h-120c0-1.83344,0-3.64446.00027-5.43335L150,289.13382l-.00027-.00004C150,290.9226,150,292.73355,150,294.56691ZM90,110L75.85786,135.85786L50,150l25.85786,14.14214L90,190l14.14214-25.85786L130,150l-25.85786-14.14214L90,110Zm120,0l-14.14214,25.85786L170,150l25.85786,14.14214L210,190l14.14214-25.85786L250,150l-25.85786-14.14214L210,110Z" fill="url(#eTB19c3Dndv5-fill)"/> </svg>
))

//GET THE CELL STYLE
export const CellStyle = ({ column, element }:{column:string, element:any}) => {
     
    //TRANSLATION
    const { t } = useTranslation('knowledge')
    const t_formats = useTranslation('formats').t
    const auth = useAuth()

    if (column === 'created_at' ||  column === 'updated_at' )  
    return(
        <Tooltip label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='.8em' p='6px'> 
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} fontSize={'.9em'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    else if (column === 'tags' || column === 'public_article_help_center_collections') {
        return(<> 
        <Flex minH={'35px'} alignItems={'center'}> 
        {element ? 
            <Flex gap='5px' flexWrap={'wrap'}>
                {element.map((label:string, index:number) => (
                    <Flex bg='gray_1' p='4px' borderRadius={'.5rem'} fontSize={'.8em'} key={`tags-label-${index}`}>
                        <Text>{label}</Text>
                    </Flex>
                ))}
            </Flex>:
            <Text>-</Text>
        }
        </Flex>
    </>)
    }
    else if (column === 'is_available_to_tilda') return <Icon boxSize={'25px'} color={element?'green.600':'red.600'} as={element?RxCheck:RxCross2}/>
    
    else if (column === 'public_article_status') return(
        <Box boxShadow={`1px 1px 1px rgba(0, 0, 0, 0.15)`} display="inline-flex" fontSize='.9em' py='2px' px='8px' fontWeight={'medium'} color='white'  bg={element === 'draft'?'red.100':'green.100'} borderRadius={'.7rem'}> 
            <Text  color={element === 'draft'?'red.600':'green.600'}>{t(element)}</Text>
        </Box>
    )
    else if (column === 'type') return <TypesComponent t={t} type={element}/>
    else if (column === 'language')  return(
        <Flex gap='5px' fontSize={'.9em'}  alignItems={'center'}>
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][0]:'No detectado'}</Text>
            <Text fontSize={'.8em'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][1]:'🏴󠁥󠁳󠁣󠁴󠁿'}</Text>
        </Flex>) 

    else if (column === 'created_by' || column === 'updated_by') {
        const selectedUser = useMemo(() => auth?.authData?.users?.find(user => user.id === element), [element, auth])

        return (
            
            <Flex fontSize={'.9em'} alignItems={'center'} gap='5px'> 
                {element === 'matilda' ? 
                    <MatildaSVG/>
                :<> 
                {selectedUser?.icon?.data ? <RenderIcon icon={selectedUser?.icon} size={14}/> :<Avatar h='16px' w='16px' size={'xs'} name={selectedUser?.name || ''}/> }
                </>}
                <Text fontSize={'.9em'} fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} >{element ? element === 'matilda' ?'Tilda':element === 'no_user' ? t('NoAgent'):selectedUser?.name:t('NoAgent')}</Text>
            </Flex>
            )
        }
    else return ( <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} fontSize={'.9em'} fontWeight={column === 'title'?'medium':'normal'}  overflow={'hidden'} >{element === ''?'-':element}</Text>)
}

//MOTION BOX
 const dataKeys:string[] = [ 'type', 'created_at', 'updated_at', 'created_by', 'updated_by']

export const SourceSideBar = ({clientBoxWidth, setClientBoxWidth, sourceData, setSourceData}:{clientBoxWidth:number, setClientBoxWidth:Dispatch<SetStateAction<number>>, sourceData:ContentData | null, setSourceData:Dispatch<SetStateAction<ContentData | null>>}) => {

    const { t } = useTranslation('knowledge')
    const [sectionsExpanded, setSectionsExpanded] = useState<string[]>(['Data', 'Tilda', 'HelpCenter', 'Folder' ])

    const onSectionExpand = (section: string) => {
        setSectionsExpanded((prevSections) => {
          if (prevSections.includes(section))return prevSections.filter((s) => s !== section)
          else return [...prevSections, section]
        })
      }
      

 
 
    return (
        <>
            <Box overflow={'hidden'} w='400px'> 
                <Flex p='2vh' height={'60px'} justifyContent={'space-between'} alignItems={'center'} borderBottomWidth={'1px'} borderBottomColor={'border_color'}>
                    <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('Information')}</Text>
                    <IconButton aria-label="close-tab" variant={'common'} bg='transparent' size='sm' icon={<RxCross2 size={'20px'}/>} onClick={() =>setClientBoxWidth(0)}/>
                </Flex>
                <Box p='2vh' height={'100%'} w='calc(400px)'> 

                    <CollapsableSection section={'Data'} sectionsMap={{'Data':t('Data'), 'Tilda':t('Tilda'), 'HelpCenter':t('HelpCenter'), 'Folder':t('Folder') }} isExpanded={sectionsExpanded.includes('Data')} onSectionExpand={onSectionExpand}> 
                            {dataKeys.map((showKey, index) => (
                                    <Flex mt='2vh' key={`article-data-${index}`}>
                                    <Text flex='1' fontWeight={'medium'} fontSize={'.8em'} color='text_gray'>{t(showKey)}</Text>
                                    <Box flex='1' maxW={'50%'}> 
                                            {showKey === 'language' ? 
                                            <Skeleton isLoaded={sourceData !== null}> 
                                                <CustomSelect hide={false} options={Object.keys(languagesFlags)} iconsMap={languagesFlags} selectedItem={sourceData?.[showKey as keyof ContentData] as string} setSelectedItem={(value) => setSourceData(prev => ({...prev as ContentData, language:value as string }) )}/>
                                            </Skeleton>
                                            : 
                                            <Skeleton isLoaded={sourceData !== null} style={{fontSize:'.89em'}}> 
                                                <CellStyle column={showKey} element={sourceData?.[showKey as keyof ContentData]}/>
                                            </Skeleton>
                                        }
                                    </Box>
                                </Flex>
                        
                            ))}
                    </CollapsableSection>

                    <CollapsableSection mt='3vh' section={'Tilda'} sectionsMap={{'Data':t('Data'), 'Tilda':t('Tilda'), 'HelpCenter':t('HelpCenter'), 'Folder':t('Folder') }}  isExpanded={sectionsExpanded.includes('Tilda')} onSectionExpand={onSectionExpand}> 
                        <Skeleton isLoaded={sourceData !== null}> 
                            <Flex gap='8px' mt='1vh'  alignItems={'center'}>
                                <Switch isChecked={sourceData?.is_available_to_tilda}  onChange={(e) => setSourceData(prev => ({...prev as ContentData, is_available_to_tilda:e.target.checked}))} />
                                <Text fontWeight={'medium'} fontSize={'.9em'}>{t('IsAvailableTilda')}</Text>
                            </Flex>
                            <Text mt='1vh' whiteSpace={'normal'} color={'text_gray'} fontSize={'.8em'}>{t('IsAvailableTildaDes')}</Text>
                        </Skeleton> 

                    </CollapsableSection>

                </Box>
            </Box>
        </>)
    }
 