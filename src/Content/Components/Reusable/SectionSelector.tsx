/*
    COMONENT FOR SELECTING BETWEEN A FEW OPTIONS
*/

//REACT
import { useEffect, ReactElement, useState } from 'react'
// FRONT
import { Flex, Button } from '@chakra-ui/react'

//TYPING
interface SectionSelectorProps<T extends string | number>  { 
    selectedSection: T
    sections: T[]
    sectionsMap: { [key: string] : [string, ReactElement] }
    onChange: (section: T) => void 
    size?:string
}

//MAIN FUNCTION
const SectionSelector =  <T extends string | number>({ selectedSection, sections, sectionsMap, onChange, size = 'sm' }: SectionSelectorProps<T>) => {

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
    return (
        <Flex  bg='brand.gray_1' position='relative' display={'inline-flex'} p='4px' borderRadius={'.7rem'} fontWeight={'medium'}>
            <Flex position='absolute' height='calc(100% - 8px)' bg='white' borderRadius={'calc(.7rem - 4px)'} transition={'all 0.3s ease'} style={{width: `${indicatorStyle.width}px`, left: `${indicatorStyle.left}px`}}/>
            {sections.map((section, index) => {
                const isSelected = selectedSection === section;
                return (
                    <Flex alignItems={'center'} color={'black'} key={`secciones-${index}`} id={`section-btn-${section}`} onClick={() => { onChange(section) }}>
                        <Button size={size} border='none' fontWeight={'medium'} bg='transparent' color={isSelected ? 'brand.text_blue' : 'gray.600'} _hover={{ color: 'brand.text_blue' }} leftIcon={sectionsMap[section][1]}>
                            {sectionsMap[section][0]}
                        </Button>
                    </Flex>
                )
            })}
        </Flex>
    );
}

export default SectionSelector;
