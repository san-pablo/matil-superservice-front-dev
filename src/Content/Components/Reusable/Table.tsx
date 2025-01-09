/* 
    TABLE FOR SHOW  DATA
*/

//REACT
import { useTranslation } from "react-i18next"
import { useState, useMemo, useRef, useEffect, Fragment, Dispatch, SetStateAction, useCallback } from "react"
//FRONT
import { motion } from "framer-motion";
import { Flex, Box, Text, IconButton, Skeleton, Icon } from '@chakra-ui/react'
import '../styles.css'
//COMPONENTS
import CustomCheckbox from "./CheckBox"
//ICONS
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io'
import { HiTrash } from "react-icons/hi2" 
import { FaMagnifyingGlass } from "react-icons/fa6"

//TYPING
interface TableProps{
    data: any[] | null | undefined
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
    showAccRow?:boolean
    accMessage?:string
    accColumn?:string
    waitingInfo?:boolean
}
    
//MAIN FUNCTION
const Table = ({ data, CellStyle, noDataMessage, requestSort, getSortIcon,  columnsMap, excludedKeys = [], onClickRow, selectedElements, onlyOneSelect = false, setSelectedElements, onSelectAllElements, currentIndex = -1, deletableFunction, height, showAccRow, accMessage, accColumn, waitingInfo }:TableProps ) =>{

    //CALCULATE DYNAMIC HEIGHT OF TABLE
    const { i18n } = useTranslation('settings')
    const tableBoxRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const [selectedIndex, setSelectedIndex] = useState<number>(currentIndex)
    useEffect(()=>{setSelectedIndex(currentIndex)} ,[currentIndex])
    const [boxHeight, setBoxHeight] = useState<number>(1000)
    useEffect(() => {
        const updateHeight = () => {
            if (headerRef.current) {
                const alturaCalculada =  ((window.innerHeight - headerRef.current?.getBoundingClientRect().top ) - window.innerWidth * 0.01 - 45)
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
                const container = tableBoxRef.current
                const itemTop = (item as HTMLElement).offsetTop - container.getBoundingClientRect().top + container.scrollTop
                const itemBottom = itemTop + (item as HTMLElement).offsetHeight
                const containerTop = container.scrollTop
                const containerBottom = containerTop + container.offsetHeight
                if (itemTop < containerTop) container.scrollTop = itemTop
                else if (itemBottom > containerBottom) container.scrollTop = Math.min(itemBottom - container.offsetHeight, container.scrollHeight - container.offsetHeight)
            }
        }
    }
    
    
    
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
            else if (event.code === 'Space' && data && 0 <= selectedIndex && selectedIndex   <= data.length - 1 && selectedElements) {
                event.preventDefault()
                handleCheckboxChange(selectedIndex, !selectedElements.includes(selectedIndex))
            }
            else if (event.code === 'Enter' && data && onClickRow) onClickRow(data[selectedIndex], selectedIndex)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => {window.removeEventListener('keydown', handleKeyDown)}
    }, [selectedIndex, selectedElements, data])


    //OBTAIN COLUMNS
    const columns = useMemo(() => {

        let columnsToWork:any
        if (!data) columnsToWork =  columnsMap
        else {
            if (data.length > 0) columnsToWork = data[0]
            else return []
        }

        const keys = Object.keys(columnsToWork).filter((key) => ![...excludedKeys].includes(key))
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
        if (sortConfig.key && data) {
          return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0
          })
        }
        return data
    }, [data, sortConfig])

    const dataToWork = (requestSort)? data : sortedData

    console.log(columns)
    console.log(dataToWork)

    //FRONT
    return(
        <>  
       
        <Box   ref={headerRef}  width={'100%'}  overflowX={'scroll'}>    

            {(data && dataToWork && !waitingInfo) ?  
                <>
                    {data.length === 0  ?
                    <Flex alignItems={'center'} justifyContent={'center'}  h={height?height:boxHeight}   color='gray.600' flexDir={'column'}> 
                        <Icon boxSize={'30px'} as={FaMagnifyingGlass}/>
                        <Text mt='1vh' fontSize={'1em'} fontWeight={'medium'} >{noDataMessage}</Text>
                    </Flex>
                    :        
                    <motion.div initial={{ opacity: 0 }}  animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: "easeInOut" }} style={{ minWidth: `${totalWidth}px` }}> 
                        <Flex position={'sticky'}minWidth={`${totalWidth}px`}  borderBottomWidth={'1px'} gap='20px' alignItems={'center'}  color='gray.600' p='10px' fontSize={'.9em'} > 
                            {selectedElements && 
                            <Box onClick={(e) => e.stopPropagation()}> 
                                <CustomCheckbox  id={`checkbox-${-1}`} isChecked={dataToWork.length > 0 && selectedElements.length >= dataToWork.length} onChange={() =>  {if (onSelectAllElements) (onSelectAllElements)()}}/>
                            </Box>}
                            {columns.filter(column => column !== 'id').map((column) => (
                                <Fragment key={`header-${column}`}>
                                    {column in data[0] &&
                                    <Flex minW={0}  alignItems={'center'} flex={`${(columnsMap?.[column]?.[1] || 180)/10} 0 ${(columnsMap?.[column]?.[1] || 180)}px`}> 
                                        <Text fontWeight={'medium'} color='gray.600' cursor='pointer' onClick={() => requestInternalSort(column)}>{columnsMap?.[column]?.[0] || column}</Text>
                                        {getInternalSortIcon(column) === null ? null : getInternalSortIcon(column) ? <IoMdArrowDropup size='20px' /> : <IoMdArrowDropdown size='20px' />}
                                    </Flex>}
                                </Fragment>
                            ))}
                            {deletableFunction && <Flex width={'60px'}/>}
                        </Flex>
                        <Box position={'relative'} minWidth={`${totalWidth}px`} ref={tableBoxRef} overflowY={'scroll'} maxH={height?height:boxHeight}> 
                            {dataToWork.map((row:any, index:number) => {  
                                
                                return (<> 
                                    <Flex height={'45px'} px='10px' data-index={index}  position={'relative'}  gap='20px' minWidth={`${totalWidth}px`}  cursor={onClickRow?'pointer':'normal'} onClick={() => {if (onClickRow) onClickRow(row, index)}} key={`row-${index}`}   bg={(selectedElements || []).includes(index)?'brand.gray_2':'transparent'} alignItems={'center'}  fontSize={'.9em'} color='black'   _hover={{bg:'brand.gray_2'}}  > 
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
                                                <IconButton size={'sm'} color={'red.600'} bg='transparent' variant={'delete'} _hover={{bg:'red.100'}} icon={<HiTrash size={'20px'}/>} aria-label="delete-row" onClick={() => deletableFunction(row, index)}/>
                                            </Flex>
                                        }
                                    </Flex>
                                    <Box bg='gray.200' h='1px' w='100%'/>
                                    </>)
                                })}
                                
                                {showAccRow && 
                                    <Flex height={'45px'}zIndex={1000} fontSize={'.9em'}  bottom={0} bg='brand.gray_2' gap='20px'minWidth={`${totalWidth}px`}  borderRadius={'0 0 .5rem .5rem'} borderWidth={'0 1px 1px 1px'}  fontWeight={'medium'} alignItems={'center'} color='black' p='10px'>
                                        <Text flex={`${(columnsMap?.[accColumn || '']?.[1] || 180) / 10} 0 ${(columnsMap?.[accColumn || '']?.[1] || 180)}px`}>{accMessage}</Text>
                                        {columns.filter(column => column !== accColumn).map((column: string, index: number) => {
                                            const sum = dataToWork.reduce((acc: number, row: any) => {
                                                const value = row[column]
                                                return typeof value === 'number' ? acc + value : acc;
                                            }, 0)
                                            return (
                                                <Flex key={`sum-${index}`} minW={0} alignItems={'center'} flex={`${(columnsMap?.[column]?.[1] || 180) / 10} 0 ${(columnsMap?.[column]?.[1] || 180)}px`}>
                                                    <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>
                                                        {sum.toLocaleString(`${i18n.language}-${i18n.language.toLocaleUpperCase()}`, {minimumFractionDigits:0, maximumFractionDigits:2})}
                                                    </Text>
                                                </Flex>
                                            )
                                        })}
                                    </Flex>}
                        </Box>
                    </motion.div>
                }
                </>
            :
            <Box minWidth={`${totalWidth}px`}>
                <Flex position="sticky" minWidth={`${totalWidth}px`} borderBottomWidth="1px" gap="20px" alignItems="center" color="gray.600" p="10px" fontSize=".9em" bg="#f8f8f8">
                {selectedElements && (<Box><Skeleton height="20px" width="20px" borderRadius="4px" /></Box>)}
                
                {columns.filter((column) => column !== "id").map((column) => (
                    <Flex key={`skeleton-header-${column}`} minW={0} alignItems="center" flex={`${(columnsMap?.[column]?.[1] || 180) / 10} 0 ${columnsMap?.[column]?.[1] || 180}px`}>
                    <Skeleton height="20px" width="80%" />
                    </Flex>
                ))}
                {deletableFunction && <Flex width="60px" />}
                </Flex>
            
                <Box position="relative" minWidth={`${totalWidth}px`} overflowX="hidden" overflowY="scroll" maxH={height || boxHeight} >
                {Array.from({ length: 20 }).map((_, rowIndex) => (
                    <Flex key={`skeleton-row-${rowIndex}`} height="45px" gap="20px" minWidth={`${totalWidth}px`} borderWidth="0 0px 1px 0px" alignItems="center" p="10px" borderColor="gray.200" bg={'transparent'}>
                    {selectedElements && (
                        <Flex>
                        <Skeleton height="20px" width="20px" borderRadius="4px" />
                        </Flex>
                    )}
                    {columns.map((column, colIndex) => (
                        <Flex key={`skeleton-cell-${rowIndex}-${colIndex}`} minW={0} alignItems="center" flex={`${(columnsMap?.[column]?.[1] || 180) / 10} 0 ${columnsMap?.[column]?.[1] || 180 }px`}>
                        <Skeleton height="16px" width="70%" />
                        </Flex>
                    ))}
                    {deletableFunction && (
                        <Flex width="60px">
                        <Skeleton height="20px" width="20px" borderRadius="4px" />
                        </Flex>
                    )}
                    </Flex>
                ))}
                </Box>
            </Box>
        
            }
            
        </Box>
    
    </> )
}

export default Table
 