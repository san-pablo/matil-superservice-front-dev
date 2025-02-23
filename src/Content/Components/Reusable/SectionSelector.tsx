//REACT
import { useEffect, ReactElement, useState } from 'react'
// FRONT
import { Flex, Button, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'

//TYPING
interface SectionSelectorProps<T extends string | number>  { 
    selectedSection: T
    sections: T[]
    sectionsMap: { [key: string] : [string, ReactElement] }
    onChange: (section: T) => void 
    size?:string
    notSection?:boolean
    reverse?:boolean
}

//MAIN FUNCTION
const SectionSelector =  <T extends string | number>({ selectedSection, sections, sectionsMap, onChange, size = 'sm', notSection = false, reverse = false}: SectionSelectorProps<T>) => {

    //GET THE SIZE OF EACH COMPONENT
    const [indicatorStyle, setIndicatorStyle] = useState<{ width: number, left: number }>({ width: 0, left: 0 })
    useEffect(() => {
        const selectedButton = document.getElementById(`section-btn-${selectedSection}`)
        if (selectedButton) {
            const { offsetWidth, offsetLeft } = selectedButton
            setIndicatorStyle({ width: offsetWidth, left: offsetLeft })
        }
    }, [selectedSection])

    //FRONT
    return (<>

        {notSection ? 
            <Flex h='100%'  gap='25px' pos={'relative'}>
                <Flex position='absolute' height='3px' bg='text_blue' borderRadius={'10px'} bottom={0} transition={'all 0.3s ease'} style={{width: `${indicatorStyle.width}px`, left: `${indicatorStyle.left}px`}}/>
                {sections.map((section, index) => {
                    const isSelected = selectedSection === section;
                    return (
                        <Flex gap='5px' flexDir={reverse ? 'row-reverse':'row'} cursor={'pointer'} alignItems={'center'} color={isSelected?'text_blue':'black'} key={`secciones-${index}`} id={`section-btn-${section}`} onClick={() => { onChange(section) }}>
                            {sectionsMap[section][1]}
                            <Text fontWeight={'medium'} fontSize={'.9em'}>{sectionsMap[section][0]}</Text>
                        </Flex>
                    )
                })}
            </Flex>
        :
        <Flex  bg='gray_1' position='relative' display={'inline-flex'} p='4px' borderRadius={'.7rem'} fontWeight={'medium'}>    
            <motion.div style={{ height: "calc(100% - 8px)",  position:'absolute', background: "white", borderRadius: "calc(.7rem - 4px)"}} initial={false} animate={{ left: indicatorStyle.left, width: indicatorStyle.width }} transition={{ duration: 0.3, ease: "easeInOut" }}/>
            {sections.map((section, index) => {
                const isSelected = selectedSection === section;
                return (
                    <Flex alignItems={'center'} color={'black'} key={`secciones-${index}`} id={`section-btn-${section}`} onClick={() => { onChange(section) }}>
                        <Button size={size === 'xxs'?  'xs':size} h={size === 'xxs'?  '18px':undefined} border='none' fontWeight={'medium'} bg='transparent' color={isSelected ? 'text_blue' : 'text_gray'} _hover={{ color: 'text_blue' }} leftIcon={sectionsMap[section][1]}>
                            {sectionsMap[section][0]}
                        </Button>
                    </Flex>
                )
            })}
        </Flex>
    }
    </>)
}

export default SectionSelector
