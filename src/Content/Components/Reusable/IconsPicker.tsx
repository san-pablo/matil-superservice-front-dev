//REACT
import { useState, useRef, CSSProperties, useEffect, Fragment } from "react"
import { useTranslation } from "react-i18next"
//FRONT
import { Box, Flex, Portal, chakra, shouldForwardProp, Text } from "@chakra-ui/react"
import { FixedSizeGrid as Grid } from "react-window"
import { motion, AnimatePresence, isValidMotionProp  } from 'framer-motion'
//COMPONENTS
import SectionSelector from "./SectionSelector"
//COMPONENTS
import EditText from "./EditText"
import RenderIcon from "./RenderIcon"
import '../styles.css'
//FUNCTIONS
import useOutsideClick from "../../Functions/clickOutside"
import determineBoxStyle from "../../Functions/determineBoxStyle"
//ICONS AND EMOJIS
import data from "@emoji-mart/data"
import { init } from "emoji-mart"
init({ data })
import allIcons from './icons.json'
const categories:any[] = (data as any)?.categories.filter((ca:any) => ca.id !== 'frequent')
const allEmojis = Object.values((data as any)?.emojis).map(({ id, name, search, skins }:any) => ({id, name, search, emoji: skins[0].native}))
const emojisByCategory = categories.reduce((acc: any, category: any) => {
    acc[category.id] = category.emojis.map((emojiId: string) => {return allEmojis.find(emoji => emoji.id === emojiId) || null}).filter(Boolean) 
    return acc
}, {})
//TYPING

 
//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})


const IconsPicker = ({selectedEmoji, excludedSections, onSelectEmoji, size = 'md', viewSelect = false, standardView}:{selectedEmoji:any, excludedSections?:('emoji' | 'icon' | 'upload')[], onSelectEmoji:(elment:any) => void, size?:string, viewSelect?:boolean, standardView?:string}) => {

    //REFS
    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)

    //BOOLEAN TO CONTROL THE VISIBILITY OF THE LIST AND CLOSE ON OUTSIDE CLICK
    const [showList, setShowList] = useState<boolean>(false)
    useOutsideClick({ref1:buttonRef, ref2:boxRef, onOutsideClick:setShowList,})

    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef, setBoxStyle, alwaysTop:true, changeVariable:showList})

    return (
        <Box >

            <Flex ref={buttonRef}cursor={standardView ? 'auto':'pointer'} onClick={() => {if (!standardView) setShowList(prev => !prev)}}  justifyContent={'center'} alignItems={'center'}  transition={'background-color .2s ease-in-out'} _hover={{bg:(viewSelect && !standardView) ? 'gray_2':''}} w={viewSelect? '36px': size === 'sm' ?'24px' :'28px' }h={viewSelect? '36px':size === 'sm' ?'24px' :'28px'} borderRadius={'.5rem'} borderColor={viewSelect ? 'transparent':'border_color'} borderWidth={viewSelect ? '0px':'1px'}>
                <RenderIcon standardView={standardView} icon={selectedEmoji} size={viewSelect ? 25 :18}  />
            </Flex>
            <AnimatePresence> 
                {(showList) && 
                    <Portal>
                        <MotionBox onClick={(e) => e.stopPropagation()} id='custom-portal'  mt='37px' initial={{ opacity: 0, scale:0.95 }} animate={{ opacity: 1,scale:1 }}  exit={{ opacity: 0, scale:0.95 }} transition={{ duration: '.2', ease: 'easeOut'}}
                        style={{ transformOrigin: (boxStyle.top ? 'top ':'bottom ') + 'left' }} top={boxStyle.top}  right={boxStyle.right} left={boxStyle.left} minW={'250px'} maxH='60vh' overflow={'scroll'} gap='10px' ref={boxRef} boxShadow={'rgba(20, 20, 20, 0.2) 0px 16px 32px 0px'}bg='white' zIndex={100000}   position={'fixed'} borderRadius={'.5rem'} borderWidth={'1px'} borderColor={'border_color'}>
                           <IconSelector selectedEmoji={selectedEmoji} excludedSections={excludedSections} onSelectEmoji={(emoji) => {onSelectEmoji(emoji);setShowList(false)}}/>
                        </MotionBox>
                    </Portal>
                }
            </AnimatePresence>
        </Box>
    )
}
 
export default IconsPicker

  //ICON SELECTOR COMPONENT
const IconSelector = ({selectedEmoji, excludedSections, onSelectEmoji}:{selectedEmoji:any, excludedSections?:('emoji' | 'icon' | 'upload')[], onSelectEmoji:(elment:any) => void }) => {
 
    const { t } = useTranslation('settings')

    const filteredSections:('emoji' | 'icon' | 'upload')[] = ['emoji', 'icon','upload'].filter((sec:any) => !(excludedSections || []).includes(sec)) as any

    const [text, setText] = useState<string>('')
    const [selectedSection, setSelectedSection] = useState<'emoji' | 'icon' | 'upload' >(filteredSections[0])
    
 
    return (
        <Box bg='white' p='15px'>
            
            {filteredSections.length > 1 && <Box   h='30px' fontSize={'.8em'} borderBottomWidth={'1px'} borderBottomColor={'border_color'}> 
                <SectionSelector  notSection selectedSection={selectedSection} sections={filteredSections} onChange={(section) => setSelectedSection(section)} sectionsMap={{'emoji':[t('Emoji'), <></>], 'icon':[t('Icon'), <></>], 'upload':[t('Upload'), <></>]}}/>
            </Box>}
            <Box mb='1vh' mt='2vh'> 
                <EditText focusOnOpen placeholder={t('Search') + '...'} fontSize=".8em" hideInput={false} value={text} setValue={setText}/>
            </Box>
    
            {selectedSection === 'emoji' ? 
            <EmojiSelector onSelectEmoji={onSelectEmoji} selectedEmoji={selectedEmoji} search={text} />
            :<>
            {selectedSection === 'icon' ? 
            
            <CustomIconSelector  onSelectEmoji={onSelectEmoji} selectedEmoji={selectedEmoji} search={text} /> 
         
                    :
                    <></>
                }
            </>
        }
        </Box>
    )
}

//ICONS SELECTOR
const CustomIconSelector = ({selectedEmoji, onSelectEmoji, search}:{selectedEmoji:any, onSelectEmoji:(elment:any) => void, search:string }) => {

    const icons:{[key:string]:{dark:{[key:string]:string}, light:{[key:string]:string}, tooltip:string, tags:string[]}} | null = allIcons as any
    const [filteredIcons, setFilteredIcons] = useState<string[]>([])    
    
    useEffect(() => {
        const result = Object.keys(icons).filter((key) => {
          const icon = icons[key]
          const tooltipMatch = icon.tooltip.toLowerCase().includes(search.toLowerCase());
          const tagsMatch = icon.tags.some((tag: string) =>
            tag.toLowerCase().includes(search.toLowerCase())
          )
          return tooltipMatch || tagsMatch;
        }).map((key) => key)
        
        setFilteredIcons(result)
    }, [search])
    
      
    return (
        <Grid columnCount={10} columnWidth={35}  height={window.innerHeight *0.35} rowCount={Math.ceil(filteredIcons.length / 10)} rowHeight={35} width={350}>
            {({ columnIndex, rowIndex, style }) => {
                const iconIndex = rowIndex * 6 + columnIndex;
                if (iconIndex >= Object.keys(filteredIcons).length) return null
                const iconImage = icons[filteredIcons[iconIndex]]
                return (
                    <IconItem key={`icon-${iconIndex}`} iconName={filteredIcons[iconIndex]} iconData={iconImage} style={style} onSelectEmoji={onSelectEmoji} selectedEmoji={selectedEmoji}/>
                )
            }}
        </Grid>
    )
}

const IconItem = ({iconName, iconData, style, onSelectEmoji, selectedEmoji }:any) => {
    
    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconData.light.gray)}`

    //TOOLTIP LOGIC
    const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
    const buttonRef = useRef<HTMLDivElement>(null)
    const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);
    const handleMouseEnter = () => {
      tooltipTimeout.current = setTimeout(() => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect()
          setTooltip({ x: rect.x + 18, y: rect.y - 25 })
        }
      }, 600)
    }
  
    const handleMouseLeave = () => {
      if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current)
      setTooltip(null)
    }
    
     return (
      <Flex pos="relative" ref={buttonRef} style={style} borderRadius=".5rem"   bg={selectedEmoji.value === iconData.light.gray ? 'gray_2':'transparent'}  _hover={{ bg: "gray_2" }} onClick={() => onSelectEmoji({type:'icon', data:iconData.light.gray})} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} cursor="pointer" justifyContent="center" alignItems="center">
        <AnimatePresence> 
            {tooltip &&
            <Portal> 
                <MotionBox display={'flex'} initial={{opacity:0, scale:0.95,translateX:'-50%'}}  animate={{opacity:1, scale:1, translateX:'-50%'}}  exit={{opacity:0, scale:0.95, translateX:'-50%'}} transition={{duration:'.15', ease:'easeOut'}}  pos="fixed" left={`${tooltip.x}px`}  top={`${tooltip.y}px`} zIndex="99999999999999999"  pointerEvents="none"bg="black_button" p="4px" borderRadius=".3rem" >
                    <Text whiteSpace="nowrap" fontWeight="medium" color='white' fontSize=".7em">
                        {iconData.tooltip}
                    </Text>
                </MotionBox>
            </Portal>
            }
        </AnimatePresence>
        <img src={svgDataUrl} alt={iconData.tooltip} style={{ width: 20, height: 20 }} />
      </Flex>
      )
}
//EMOJI SELECTOR
const EmojiSelector = ({selectedEmoji, onSelectEmoji, search}:{selectedEmoji:any, onSelectEmoji:(elment:any) => void, search:string } ) => {

    const { t } = useTranslation('settings')
 
    const filterEmojis = (categoryId: string) => {
        const emojis = emojisByCategory[categoryId] || []
        if (!search) return emojis
        return emojis.filter((emoji: any) =>emoji.name.toLowerCase().includes(search.toLowerCase()) || emoji.search.toLowerCase().includes(search.toLowerCase()))
    }

    return (<>
       
        <Box maxH='35vh' overflow={'scroll'}> 
            {Object.values(categories).map((category, index) => {
                const categoryEmojis = filterEmojis(category.id) 
                
                return (
                <Fragment key={`categoty-${index}`}>
                    {categoryEmojis.length > 0 && 
                        <div key={category.id}>
                            <Text fontSize={'.7em'} mt='1vh' mb='.5vh' fontWeight={'medium'} color='text_gray'>{t(category.id)}</Text>
                            <Grid columnCount={10} columnWidth={35} height={Math.ceil(categoryEmojis.length / 10) * 35} rowCount={Math.ceil(categoryEmojis.length / 10)} rowHeight={35} width={350}>
                                {({ columnIndex, rowIndex, style }) => {
                                    const iconIndex = rowIndex * 10 + columnIndex;
                                    if (iconIndex >= categoryEmojis.length) return null
                                    return (
                                        <EmojiItem style={style} emojiData={categoryEmojis[iconIndex]} selectedEmoji={selectedEmoji} onSelectEmoji={onSelectEmoji} />
                                    )
                                }}
                            </Grid>
                        </div>
                    }
                    </Fragment>)
            })}
        </Box>

      
    </>)

}

//EMOJI ITEM
const EmojiItem = ({ emojiData, style, onSelectEmoji, selectedEmoji }:any) => {
    const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  
    const buttonRef = useRef<HTMLDivElement>(null)

    const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
      tooltipTimeout.current = setTimeout(() => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect()
          setTooltip({ x: rect.x + 18, y: rect.y - 25 })
        }
      }, 600)
    }
  
    const handleMouseLeave = () => {
      if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current)
      setTooltip(null)
    }
    
    return (
      <Flex pos="relative" ref={buttonRef} style={style} borderRadius=".5rem"  bg={selectedEmoji === emojiData.emoji ? 'gray_2':'transparent'}  _hover={{ bg: "gray_2" }} onClick={() => onSelectEmoji( {type:'emoji', data:emojiData.emoji})} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} cursor="pointer" justifyContent="center" alignItems="center">
        <AnimatePresence> 
            {tooltip &&
            <Portal> 
                <MotionBox display={'flex'} initial={{opacity:0, scale:0.95,translateX:'-50%'}}  animate={{opacity:1, scale:1, translateX:'-50%'}}  exit={{opacity:0, scale:0.95, translateX:'-50%'}} transition={{duration:'.15', ease:'easeOut'}}  pos="fixed" left={`${tooltip.x}px`}  top={`${tooltip.y}px`} zIndex="99999999999999999"  pointerEvents="none"bg="black_button" p="4px" borderRadius=".3rem" >
                    <Text whiteSpace="nowrap" fontWeight="medium" color='white' fontSize=".7em">
                        {emojiData.name}
                    </Text>
                </MotionBox>
            </Portal>
            }
        </AnimatePresence>
        {emojiData.emoji}
      </Flex>
    )
}