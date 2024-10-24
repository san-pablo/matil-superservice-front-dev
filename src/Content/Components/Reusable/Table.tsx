/* 
    TABLE FOR SHOW  DATA
*/

//REACT
import { useState, useMemo, useRef, useEffect, Fragment, Dispatch, SetStateAction, useCallback } from "react"
//FRONT
import { Flex, Box, Text, IconButton } from '@chakra-ui/react'
import '../styles.css'
//COMPONENTS
import CustomCheckbox from "./CheckBox"
//ICONS
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io'
import { BsTrash3Fill } from "react-icons/bs"
 
//TYPING
interface TableProps{
    data: any[]
    CellStyle:React.FC<{  column: string, element: any }>
    noDataMessage:string 
    columnsMap:{[key:string]:[string, number]}
    requestSort?:(column: string) => void
    getSortIcon?:(column: string) => boolean | null
    excludedKeys?:string[]
    onClickRow?:(value:any, index:number) => void
    onlyOneSelect?:boolean
    selectedElements?:number[]
    setSelectedElements?:Dispatch<SetStateAction<number[]>>
    onSelectAllElements?:() =>void
    currentIndex?:number
    deletableFunction?:(value:any, index:number) => void
    height?:number 
}
    
//MAIN FUNCTION
const Table = ({ data, CellStyle, noDataMessage, requestSort, getSortIcon,  columnsMap, excludedKeys = [], onClickRow, selectedElements, onlyOneSelect = false, setSelectedElements, onSelectAllElements, currentIndex = -1, deletableFunction, height }:TableProps ) =>{

    //CALCULATE DYNAMIC HEIGHT OF TABLE
    const tableBoxRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const [selectedIndex, setSelectedIndex] = useState<number>(currentIndex)
    useEffect(()=>{setSelectedIndex(currentIndex)} ,[currentIndex])
    const [boxHeight, setBoxHeight] = useState<number>(1000)
    useEffect(() => {
        const updateHeight = () => {
            if (headerRef.current) {
                const alturaCalculada =  ((window.innerHeight - headerRef.current?.getBoundingClientRect().bottom ) - window.innerWidth * 0.02)
                setBoxHeight(alturaCalculada)
            }
        } 
        updateHeight()
        window.addEventListener('resize', updateHeight)
        return () => {window.removeEventListener('resize', updateHeight)}
    }, [selectedElements, headerRef.current])

    //CALCULATE INTERNAL SORTING
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({key: '', direction: null})

    //SCROLL ON CHANGING TO AN ELEMENT OUT OF THE SCROLL VIEW
    const scrollIntoView = (index: number) => {
        if (tableBoxRef.current) {
          const item = tableBoxRef.current.querySelector(`[data-index="${index}"]`)
          if (item) {
            const itemTop = (item as HTMLElement).offsetTop - tableBoxRef.current.getBoundingClientRect().top
            const itemBottom = itemTop + (item as HTMLElement).offsetHeight
            const containerTop = tableBoxRef.current.scrollTop
            const containerBottom = containerTop + tableBoxRef.current.offsetHeight
            const buffer = 90
            if (tableBoxRef.current.scrollHeight > tableBoxRef.current.offsetHeight) {
                if (itemTop < containerTop) tableBoxRef.current.scrollTop = itemTop 
                else if (itemBottom > containerBottom) tableBoxRef.current.scrollTop = itemBottom - tableBoxRef.current.offsetHeight + buffer
            }
        }
      }}
    
    //SHORTCUTS
    useEffect(() => {
        const handleKeyDown = (event:KeyboardEvent) => {
            if (event.code === 'ArrowUp') {
                event.preventDefault()
                setSelectedIndex(prev => {
                    const newIndex = Math.max(prev - 1, 0)
                    scrollIntoView(newIndex)
                    return newIndex
                  })
            }
            else if (event.code === 'ArrowDown') {
                event.preventDefault()
                setSelectedIndex(prev => {
                    const newIndex = Math.min(prev + 1, (data?.length || 0) - 1);
                    scrollIntoView(newIndex)
                    return newIndex
                })
            }
            else if (event.code === 'Space' && data && 0 <= selectedIndex && selectedIndex   <= data.length - 1 && selectedElements) handleCheckboxChange(selectedIndex, !selectedElements.includes(selectedIndex))
            else if (event.code === 'Enter' && data && onClickRow) onClickRow(data[selectedIndex], selectedIndex)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => {window.removeEventListener('keydown', handleKeyDown)}
    }, [selectedIndex, selectedElements, data])


    //OBTAIN COLUMNS
    const columns = useMemo(() => {
        if (!data?.length) return []
        const keys = Object.keys(data[0]).filter((key) => ![...excludedKeys].includes(key))
        const orderedColumns = keys
          .filter(key => key in columnsMap)
          .sort((a, b) => Object.keys(columnsMap).indexOf(a) - Object.keys(columnsMap).indexOf(b))
        const otherColumns = keys.filter(key => !(key in columnsMap))
        return [...orderedColumns, ...otherColumns]
      }, [data])

    const totalWidth = useMemo(() => {
        return columns.reduce((acc, value) => {
            const columnWidth = columnsMap?.[value]?.[1] || 180
          return acc + columnWidth + 20
        }, 0) + 20 + (selectedElements ? 58 : 0) + (deletableFunction ? 100 : 0)
      }, [columns])
      
    const handleCheckboxChange = useCallback((element:number, isChecked:boolean) => {
        if (selectedElements && setSelectedElements) {
            if (isChecked) {
                if (onlyOneSelect) setSelectedElements([element])
                else setSelectedElements(prevElements=> [...prevElements, element])
            }
            else setSelectedElements(prevElements => prevElements.filter(el => el !== element))
        }
    }, [selectedElements, setSelectedElements, onlyOneSelect])
    
    //SORT LOGIC FOR TABLES THAT HAVE ALL THE AVAILABLE DATA
    const requestInternalSort = (column: string) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig.key === column && sortConfig.direction === 'asc') direction = 'desc'
        if (requestSort) requestSort(column)
        else setSortConfig({ key: column, direction })

     }
    const getInternalSortIcon = (column: string) => {
        if (getSortIcon) return getSortIcon(column)
        if (sortConfig.key === column) {
            if (sortConfig.direction === 'asc') return true
            else if (sortConfig.direction === 'desc') return false
        }
        else return null    
    }

    //SORTED DATA
    const sortedData = useMemo(() => {
        if (sortConfig.key) {
          return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0
          })
        }
        return data
    }, [data, sortConfig])

    const dataToWork = (requestSort)? data : sortedData
 
    //FRONT
    return(
        <>  
       
        <Box  width={'100%'} mt='15px' overflowX={'scroll'}>    
        {(!data || dataToWork.length === 0) ? 
            <Box bg='#f1f1f1' borderRadius={'.5rem'} width='100%' borderColor={'gray.200'} borderWidth={'1px'} p='15px'>    
                <Text fontWeight={'medium'} fontSize={'1.1em'}>{noDataMessage}</Text>
            </Box>: 
            <Box borderRadius={'.5em'}  minWidth={`${totalWidth}px`}   >    
                <Flex position={'sticky'}  borderTopRadius={'.5rem'} minWidth={`${totalWidth}px`}  borderColor={'gray.200'} borderWidth={'1px'} gap='20px' ref={headerRef} alignItems={'center'}  color='gray.600' p='10px' fontSize={'1em'} bg='brand.gray_2' > 
                    
                    {selectedElements && 
                    <Box onClick={(e) => e.stopPropagation()}> 
                     <CustomCheckbox  id={`checkbox-${-1}`} isChecked={selectedElements.length >= dataToWork.length} onChange={() =>  {if (onSelectAllElements) (onSelectAllElements)()}}/>
                    </Box>}
                    {columns.filter(column => column !== 'id').map((column) => (
                        <Fragment key={`header-${column}`}>
                            {column in data[0] &&
                            <Flex minW={0}  alignItems={'center'} flex={`${(columnsMap?.[column]?.[1] || 180)/10} 0 ${(columnsMap?.[column]?.[1] || 180)}px`}> 
                                <Text color='gray.600' cursor='pointer' onClick={() => requestInternalSort(column)}>{columnsMap?.[column]?.[0] || column}</Text>
                                {getInternalSortIcon(column) === null ? null : getInternalSortIcon(column) ? <IoMdArrowDropup size='20px' /> : <IoMdArrowDropdown size='20px' />}
                            </Flex>}
                        </Fragment>
                    ))}
                    {deletableFunction && <Flex width={'60px'}/>}
                </Flex>
                 <Box minWidth={`${totalWidth}px`} overflowX={'hidden'} ref={tableBoxRef} overflowY={'scroll'} maxH={height?height:boxHeight}> 
                    {dataToWork.map((row:any, index:number) => {  
                        
                        return (
                            <Flex height={'50px'} data-index={index}  position={'relative'} overflow={'hidden'} gap='20px' minWidth={`${totalWidth}px`} borderRadius={index === data.length - 1?'0 0 .5rem .5rem':'0'} borderWidth={'0 1px 1px 1px'}  cursor={onClickRow?'pointer':'normal'} onClick={() => {if (onClickRow) onClickRow(row, index)}} key={`row-${index}`}  bg={selectedIndex === index ? 'brand.blue_hover':(selectedElements || []).includes(index)?'brand.blue_hover':index%2 === 1?'#FCFCFC':'white'} alignItems={'center'}  fontSize={'.9em'} color='black' p='10px' borderColor={'gray.200'} _hover={{bg:(selectedElements || [] ).includes(index)?'brand.blue_hover':'brand.blue_hover'}}  > 
                                {selectedIndex === index && <Box position='absolute' left={0} top={0} height={'100%'} width={'2px'} bg='brand.text_blue'/>}
                                {selectedElements &&
                                    <Flex onClick={(e) => e.stopPropagation()}> 
                                        <CustomCheckbox id={`checkbox-${index}`}  onChange={() => handleCheckboxChange(index, !selectedElements.includes(index))} isChecked={selectedElements.includes(index)} />
                                    </Flex>}
                                    {columns.map((column:string, index2:number) => (
                                        <Fragment key={`header-${index}-${index2}`}>
                                            {(!(excludedKeys.includes(column)) && column in row) && 
                                                <Flex minW={0}  alignItems={'center'}  flex={`${(columnsMap?.[column]?.[1] || 180)/10} 0 ${(columnsMap?.[column]?.[1] || 180)}px`}> 
                                                    {(columnsMap?.[column] !== undefined) ?
                                                    <CellStyle column={column} element={row[column]}/>
                                                    :
                                                    <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{String(row[column])}</Text>
                                                    }
                                             </Flex>}
                                        </Fragment>))}
                                {deletableFunction && 
                                    <Flex width={'60px'}  onClick={(e) => e.stopPropagation()}>
                                        <IconButton size={'sm'} color={'red.600'} bg='transparent' _hover={{bg:'red.100'}} icon={<BsTrash3Fill/>} aria-label="delete-row" onClick={() => deletableFunction(row, index)}/>
                                    </Flex>
                                }
                            </Flex>)
                        })}
                </Box>
            </Box>
            }
        </Box>
    
    </> )
}

export default Table
 