/* 
    TABLE FOR SHOW TICKETS DATA
*/

//REACT
import { useState, useMemo, useRef, useEffect, Fragment, Dispatch, SetStateAction } from "react"
import { useAuth } from "../../../AuthContext"
//FRONT
import { Flex, Box, Text, Checkbox, Tooltip } from '@chakra-ui/react'
import '../styles.css'
//ICONS
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io'
//TYPING
import { columnsTicketsMap, TicketColumn,  TicketsTableProps } from "../../Constants/typing" 

//TYPING
interface TableProps{
    data: any[]
    CellStyle:React.FC<{  column: string, element: any }>
    noDataMessage:string 
    columnsMap:{[key:string]:[string, number]}
    requestSort?:(column: string) => void
    excludedKeys?:string[]
    onClickRow?:(value:any, index:number) => void
    onlyOneSelect?:boolean
    selectedElements?:number[]
    setSelectedElements?:Dispatch<SetStateAction<number[]>>
    onSelectAllElements?:(isSeleceted:boolean) =>void
    currentIndex?:number
}
    
//MAIN FUNCTION
const Table = ({ data, CellStyle, noDataMessage, requestSort,  columnsMap, excludedKeys = [], onClickRow, selectedElements, onlyOneSelect = false, setSelectedElements, onSelectAllElements, currentIndex = -1 }:TableProps ) =>{

    //CALCULATE DYNAMIC HEIGHT OF TABLE
    const tableBoxRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const [selectedIndex, setSelectedIndex] = useState<number>(currentIndex)
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
    }, [selectedElements])

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
            if (itemTop < containerTop) tableBoxRef.current.scrollTop = itemTop
            else if (itemBottom > containerBottom) tableBoxRef.current.scrollTop = itemBottom - tableBoxRef.current.offsetHeight
        }
      }}
    
    //SHORTCUTS
    useEffect(() => {
        const handleKeyDown = (event:KeyboardEvent) => {
            if (event.code === 'ArrowUp') {
                setSelectedIndex(prev => {
                    const newIndex = Math.max(prev - 1, 0)
                    scrollIntoView(newIndex)
                    return newIndex
                  })
            }
            else if (event.code === 'ArrowDown') 
             setSelectedIndex(prev => {
                const newIndex = Math.min(prev + 1, (data?.length || 0) - 1);
                scrollIntoView(newIndex)
                return newIndex
              })
            else if (event.code === 'Space' && data && 0 <= selectedIndex && selectedIndex   <= data.length - 1 && selectedElements) {
                handleCheckboxChange(selectedIndex, !selectedElements.includes(selectedIndex))
            }
            else if (event.code === 'Enter' && data && onClickRow) onClickRow(data[selectedIndex], selectedIndex)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => {window.removeEventListener('keydown', handleKeyDown)}
    }, [selectedElements, selectedIndex, data])


    //OBTAIN COLUMNS
    const columns = useMemo(() => {
        return data?.length
          ? Object.keys(data[0]).filter((key) => ![...excludedKeys].includes(key))
          : []
      }, [data])
    const totalWidth = useMemo(() => {return columns.reduce((acc, value) => acc + columnsTicketsMap[value as TicketColumn] + 20, 0) + 20}, [columns])

    //SELECT ROWS
    const onInternalSelectAllElements = (isSelected:boolean) => {
        if (onSelectAllElements) onSelectAllElements(isSelected)
        else {
            if (setSelectedElements &&  (!isSelected || onlyOneSelect)) setSelectedElements([])
            else if (isSelected && setSelectedElements) setSelectedElements(Array.from(Array(data.length).keys()))
        }
    }
    const handleCheckboxChange = (element:number, isChecked:boolean) => {
        if (selectedElements && setSelectedElements) {
            if (isChecked) {
                if (onlyOneSelect) setSelectedElements([element])
                else setSelectedElements(prevElements=> [...prevElements, element])
            }
            else setSelectedElements(prevElements => prevElements.filter(el => el !== element))
        }
    }

    //SORT LOGIC FOR TABLES THAT HAVE ALL THE AVAILABLE DATA
    const requestInternalSort = (column: string) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig.key === column && sortConfig.direction === 'asc') direction = 'desc'
        setSortConfig({ key: column, direction })

        if (requestSort) requestSort(column)
     }
    const getSortIcon = (column: string) => {
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
       
        <Box overflow={'scroll'} maxW={'calc(100% + 20px)'} ml='-10px' p='10px' >    
        {(!data || dataToWork.length === 0) ? 
            <Box borderRadius={'.5rem'} width='100%' bg='gray.50' borderColor={'gray.200'} borderWidth={'1px'} p='15px'>    
                <Text fontWeight={'medium'} fontSize={'1.1em'}>{noDataMessage}</Text>
            </Box>: 
            <Box borderRadius={'.5em'} bg='gray.50'  overflow={'hidden'}   minWidth={`${totalWidth}px`}   >    
                <Flex  position={'sticky'}  borderTopRadius={'.5rem'} minWidth={`${totalWidth}px`}  borderColor={'gray.200'} borderWidth={'1px'} gap='20px' ref={headerRef} alignItems={'center'}  color='gray.600' p='10px' fontSize={'1em'} bg='gray.100' > 
                    {selectedElements && 
                    <Flex alignItems={'center'} > 
                        <input type="checkbox" className="custom-checkbox"  checked={selectedElements.length >= data.length} onChange={(e) => onInternalSelectAllElements(e?.target?.checked)}/>  
                    </Flex>}
                    {Object.keys(columnsMap).filter(column => column !== 'id').map((column) => (
                        <Fragment key={`header-${column}`}>
                            {column in data[0] &&
                                <Flex alignItems={'center'} flex={`${columnsMap[column][1]/10} 0 ${columnsMap[column][1]}px`}> 
                                <Text cursor='pointer' onClick={() => requestInternalSort(column)}>{columnsMap[column][0]}</Text>
                                {getSortIcon(column) === null ? null : getSortIcon(column) ? <IoMdArrowDropup size='20px' /> : <IoMdArrowDropdown size='20px' />}
                            </Flex>}
                        </Fragment>))
                    }
                </Flex>
                <Box minWidth={`${totalWidth}px`} overflowX={'hidden'} ref={tableBoxRef} overflowY={'scroll'} maxH={boxHeight}> 
                    {dataToWork.map((row:any, index:number) => {  
                        
                        return (
                            <Flex data-index={index}  position={'relative'} overflow={'hidden'} gap='20px' minWidth={`${totalWidth}px`} borderRadius={index === data.length - 1?'0 0 .5rem .5rem':'0'} borderWidth={'0 1px 1px 1px'}  cursor={onClickRow?'pointer':'not-allowed'} onClick={() => {if (onClickRow) onClickRow(row, index)}} key={`row-${index}`}  bg={selectedIndex === index ? 'blue.50':(selectedElements || []).includes(row.id)?'blue.100':index%2 === 1?'#FFFDFA':'white'} alignItems={'center'}  fontSize={'.9em'} color='black' p='10px' borderColor={'gray.200'} _hover={{bg:(selectedElements || [] ).includes(row.id)?'blue.100':'blue.50'}}  > 
                                {selectedIndex === index && <Box position='absolute' left={0} top={0} height={'100%'} width={'2px'} bg='blue.400'/>}
                                {selectedElements &&
                                <Flex alignItems={'center'} onClick={(e) => e.stopPropagation()}> 
                                    <input type="checkbox" className="custom-checkbox" onChange={(e) => handleCheckboxChange(index, e.target.checked)} checked={selectedElements.includes(index)}/>
                                </Flex>}
                                {Object.keys(columnsMap).map((column:string, index:number) => (
                                    <Fragment key={`header-${index}`}>
                                        {(!(excludedKeys.includes(column)) && column in row) && 
                                        <Flex minW={0} alignItems={'center'} flex={`${(columnsMap?.[column][1] || 0)/10} 0 ${(columnsMap?.[column][1] || 0)}px`}> 
                                            <CellStyle column={column} element={row[column]}/>
                                        </Flex>}
                                    </Fragment>))}
                            </Flex>)
                        })}
                </Box>
            </Box>
            }
        </Box>
    
    </> )
}

export default Table
 