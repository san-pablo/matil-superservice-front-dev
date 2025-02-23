//REACT
import { useTranslation } from "react-i18next"
import React, {MutableRefObject, useState, useMemo, useRef, useEffect, useLayoutEffect, Fragment, Dispatch, SetStateAction, useCallback, ReactElement } from "react"
//FRONT
import { motion, isValidMotionProp, AnimatePresence } from 'framer-motion'
import { Flex, Box, Text, Skeleton, Icon, chakra, shouldForwardProp } from '@chakra-ui/react'
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import AutoSizer from 'react-virtualized-auto-sizer'
import '../styles.css'
//COMPONENTS
import CustomCheckbox from "./CheckBox"
//ICONS
 import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io'
import { FaMagnifyingGlass } from "react-icons/fa6"
 
//TYPING
interface TableProps{
    data: any[] | null | undefined
    CellStyle:React.FC<{  column: string, element: any, row?:any }>
    noDataMessage:string 
    columnsMap:{[key:string]:[string, number]}
    requestSort?:(column: string) => void
    getSortIcon?:(column: string) => boolean | null
    excludedKeys?:string[]
    onClickRow?:(value:any, index:number) => void
    onlyOneSelect?:boolean
    selectedElements?:string[]
    setSelectedElements?:Dispatch<SetStateAction<string[]>>
    onSelectAllElements?:() =>void
    currentIndex?:number
    prevCurrentIndex?:MutableRefObject<number>
    height?:number 
    showAccRow?:boolean
    accMessage?:string
    prevSelectedElements?:MutableRefObject<string[]>
    accColumn?:string
    waitingInfo?:boolean
    onFinishScroll?:any
    numberOfItems?:any
    additionalComponents?:{width:number, component:any, shouldDisplayAfter:string, showOnlyOnHover:boolean}[]
}
 
 
//ROW STYLES
const RowComponent = ({row, lastClickedId, index, selectedIndex, prevSelectedIndex, selectedElements, prevSelectedElements, handleCheckboxChange, additionalComponents, columnsMap, columns, CellStyle, totalWidth, onClickRow, excludedKeys} : {row:any, prevSelectedIndex:MutableRefObject<number>,  lastClickedId:MutableRefObject<number>,prevSelectedElements:MutableRefObject<string[]>, index:number,selectedIndex:number, selectedElements:string[], handleCheckboxChange:any, columnsMap:any, columns:string[], additionalComponents?:{width:number, component:any, shouldDisplayAfter:string, showOnlyOnHover:boolean}[], CellStyle:any, totalWidth:number, onClickRow:any, excludedKeys:string[]} )  => {

    const shouldTiggerElementsAnimation = selectedElements && ((prevSelectedElements?.current || []).includes(row.id) && !(selectedElements || []).includes(row.id)) || (!(prevSelectedElements?.current || []).includes(row.id) && (selectedElements || []).includes(row.id))
    const shouldTiggerIndexAnimation = selectedIndex && (prevSelectedIndex?.current === row.id && selectedIndex !== row.id) || (prevSelectedIndex?.current !== row.id && selectedIndex === row.id)

    const [isSelected, setIsSelected] = useState((shouldTiggerElementsAnimation) ? !(selectedElements || []).includes(row.id): (selectedElements || []).includes(row.id))
    const [selectedInsideIndex, setSelectedInsideIndex] = useState((shouldTiggerIndexAnimation ) ? selectedIndex !== row.id:selectedIndex === row.id)
    
    useEffect(() => {
        if (shouldTiggerElementsAnimation) setIsSelected((selectedElements || []).includes(row.id))
        if (shouldTiggerIndexAnimation) setSelectedInsideIndex(selectedIndex === row.id)
    }, [])
   
 
    const rowRef = useRef<HTMLDivElement>(null)

    const handleClick = (e:any) => {
        if (onClickRow) {
            lastClickedId.current = row.id
            e.preventDefault()
            e.stopPropagation()
            if (prevSelectedElements) prevSelectedElements.current = selectedElements
            onClickRow(row, index)
        }
    }

     return (
        <Flex cursor={'pointer'} w='calc(100%)' color='black'   pl={selectedElements ? 'calc(2vw + 10px)':'' }  onClick={(e) => {e.stopPropagation(); handleCheckboxChange(row.id, !(selectedElements || []).includes(row.id))}} pos="relative"role="group">
       
            <Box bg='green' w={selectedElements?'auto':0} overflow={'hidden'} className="flex-container" > 
                
                <Flex  className={"motion-circle" + (isSelected || (shouldTiggerElementsAnimation && !(prevSelectedElements?.current || []).includes(row.id)) ? ' active' : '')} alignItems={'center'} justifyContent={'center'} position='absolute' ml='-14px' mt='16px'>
                    {row.unseen_changes &&  <Box h='6px' w='6px' bg='text_blue' borderRadius={'50%'} />}
                </Flex>

                 <Flex zIndex={1000} className={"motion-box" + (((isSelected) || (shouldTiggerElementsAnimation && !(prevSelectedElements?.current || []).includes(row.id))  ) ? ' active' : '')}  left={0} pos="absolute" alignItems="center" pl="calc(2vw - 10px)" w={selectedElements ? 'calc(2vw + 10px)' : ''} h="100%" justifyContent="center">
                    {selectedElements && <> 
                        <Box  w="24px" alignItems="center" h="100%" transition={{ duration: '.2' }}>
                            <CustomCheckbox id={`checkbox-${index}`} onChange={() => {}} isChecked={(selectedElements || []).includes(row.id,)}/>
                        </Box>
                    </>}
                </Flex>
            </Box>
          

            <Box w='100%' borderBottomColor={'border_color'} borderBottomWidth={'1px'}> 
                <Flex  height={'39px'}  ref={rowRef}  pl='10px' w='100%'  _hover={{bg:(selectedInsideIndex )?'white':'gray_2'}}   data-index={index}  borderRadius={'.5rem'} position={'relative'}  gap='20px' minWidth={`${totalWidth}px`}  cursor={onClickRow?'pointer':'normal'}  key={`row-${row.id}`}    
                backgroundColor={(selectedInsideIndex)?'white':'transparent'}  boxShadow={(selectedInsideIndex )? '0 0 3px 0px rgba(0, 0, 0, 0.1)':''}  alignItems={'center'}  fontSize={'.8em'} color='black'
                transition={(selectedInsideIndex && selectedElements) ? 'box-shadow .2s ease-in-out,  background-color .2s ease-in-out':'box-shadow .2s ease-out,  background-color .2s ease-out'} onClick={handleClick}  >


                    {columns.map((column:string, index2:number) => {
                        const foundAdditionalComponentWidth = additionalComponents?.find(com => com.shouldDisplayAfter === column)

                        const memoizedCellStyle = useMemo(() => (<CellStyle column={column} element={row?.[column] || null} row={row} />), [column])
                        
                        return (
                        <Fragment key={`header-${row.id}-${index2}`}>
                            {(!(excludedKeys.includes(column))) && 
                                <Flex minW={0}  justifyContent={'space-between'} alignItems={'center'}  flex={`${((columnsMap?.[column]?.[1] || 180)/10) + (foundAdditionalComponentWidth?.width || 0)} 0 ${((columnsMap?.[column]?.[1] || 180) + (foundAdditionalComponentWidth?.width || 0))}px`}> 
                                    {memoizedCellStyle}
                                    <Box className={foundAdditionalComponentWidth?.showOnlyOnHover ? "element-box":''}> 
                                        {foundAdditionalComponentWidth && <><foundAdditionalComponentWidth.component row={row} index={index}/></>}
                                    </Box>
                                </Flex>}
                        </Fragment>)
                    })}
            </Flex>
             </Box>
      </Flex>
 
    )
}

//MAIN FUNCTION
const Table = ({ data, CellStyle, noDataMessage, requestSort, getSortIcon,  columnsMap, excludedKeys = [], onClickRow, prevSelectedElements,selectedElements, setSelectedElements, onSelectAllElements, currentIndex = -1, prevCurrentIndex, additionalComponents, height, showAccRow, accMessage, accColumn, waitingInfo, onFinishScroll, numberOfItems }:TableProps ) =>{

    //CALCULATE DYNAMIC HEIGHT OF TABLE
    const { i18n } = useTranslation('settings')
    const tableBoxRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const dateRef = useRef<any>()
    const lastClickedId = useRef<number>(-1)

    const [boxHeight, setBoxHeight] = useState<number>(1000)
    useEffect(() => {
        const updateHeight = () => {
            if (headerRef.current) {
                const alturaCalculada =  ((window.innerHeight - headerRef.current?.getBoundingClientRect().top ) - window.innerWidth * 0.02 - 45)
                setBoxHeight(alturaCalculada)
            }
        } 
        updateHeight()
        window.addEventListener('resize', updateHeight)
        return () => {window.removeEventListener('resize', updateHeight)}
    }, [headerRef.current])

    console.log(data)
    //CALCULATE INTERNAL SORTING
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({key: '', direction: null})

    useEffect(() =>{dateRef.current = data},[data])
   
    //OBTAIN COLUMNS
    const columns = useMemo(() => {
        const keys = Object.keys(columnsMap).filter((key) => ![...excludedKeys].includes(key))
        const orderedColumns = keys
          .filter(key => key in columnsMap)
          .sort((a, b) => Object.keys(columnsMap).indexOf(a) - Object.keys(columnsMap).indexOf(b))
        const otherColumns = keys.filter(key => !(key in columnsMap))
        return [...orderedColumns, ...otherColumns]
      }, [data])


      const totalWidth = useMemo(() => {
        return (
          columns.reduce((acc, value) => {
            const columnWidth = columnsMap?.[value]?.[1] || 180;
            return acc + columnWidth + 20;
          }, 0) +
          20 +
          58 +
          (additionalComponents?.reduce((sum, component) => sum + (component.width || 0), 0) || 0)
        );
      }, [columns, additionalComponents, columnsMap])
  
 
    //CHECKBOXES LOGIC
    //useEffect(() => {prevSelectedElements.current = selectedElements}, [currentIndex])
    const handleCheckboxChange = useCallback((element:string, isChecked:boolean) => {
        prevCurrentIndex.current = currentIndex

        if (selectedElements && setSelectedElements) {
            if (isChecked) {
                setSelectedElements(prevElements=> {
                    prevSelectedElements.current = prevElements
                    return [...prevElements, element]
                })
            }
            else setSelectedElements(prevElements => {
                prevSelectedElements.current = prevElements
                return prevElements.filter(el => el !== element)
            })
        }
    }, [selectedElements, setSelectedElements, currentIndex])
    
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

     const loadMoreData = () => {setTimeout(() => {onFinishScroll()},0)}
      
    const dataToWork = (requestSort)? data : sortedData
    const itemCount = numberOfItems ? (data?.length || 0) < numberOfItems - 1 ? (data?.length || 0) + 4 : numberOfItems : data?.length || 0

    const isItemLoaded = (index:number) => !!dataToWork[index]; 

    //FRONT
    return(
        <>  
        
        <Box  ref={headerRef}  width={'100%'}  overflowX={'scroll'} >    

            {(data && dataToWork && !waitingInfo) ?  
                <>
                    {data.length === 0  ?
                    <Flex alignItems={'center'} justifyContent={'center'}  h={height?height:boxHeight}   color='text_gray' flexDir={'column'}> 
                        <Icon boxSize={'30px'} as={FaMagnifyingGlass}/>
                        <Text mt='1vh' fontSize={'1em'} fontWeight={'medium'} >{noDataMessage}</Text>
                    </Flex>
                    :        
                    <motion.div initial={{ opacity: 0 }}  animate={{ opacity: 1 }} transition={{ duration: 0.1, ease: "easeOut" }} style={{ minWidth: `${totalWidth}px` }}> 
      
                        <Flex  borderBottomColor={'border_color'} borderBottomWidth={'1px'}  ml={selectedElements ? 'calc(2vw + 10px)':''} pl='10px'  position={'sticky'} w={`${totalWidth}px`} minW={'100%'}  gap='20px' alignItems={'center'}   color='text_gray' h='40px' fontSize={'.9em'} > 
                            {columns.filter(column => column !== 'id').map((column) => {
                                
                                const foundAdditionalComponentWidth = additionalComponents?.find(com => com.shouldDisplayAfter === column)?.width || 0

                                return (
                                <Fragment key={`header-${column}`}>
                                    <Flex minW={0}  cursor='pointer' onClick={() => requestInternalSort(column)} alignItems={'center'} flex={`${(columnsMap?.[column]?.[1] || 180)/10  + foundAdditionalComponentWidth} 0 ${(columnsMap?.[column]?.[1] || 180) + foundAdditionalComponentWidth}px`}> 
                                        <Text fontWeight={'medium'} color='text_gray'  >{columnsMap?.[column]?.[0] || column}</Text>
                                         {getInternalSortIcon(column) === null ? null : getInternalSortIcon(column) ? <IoMdArrowDropup size='20px' /> : <IoMdArrowDropdown size='20px' />}
                                    </Flex>
                                </Fragment>)
                            })}
                             
                        </Flex>
                        <Box bg={'border_gray'} h='1px' ml={selectedElements ? 'calc(2vw + 10px)':''} w={'100%'}/>

                       
                        <Box position={'relative'}  minWidth={`${totalWidth}px`}   w={selectedElements ? 'calc(100% + 2vw + 10px)':'100%' } ref={tableBoxRef} overflowY={'hidden'} transition="max-height ease-in .15s" h={height?height:boxHeight} maxH={height?height:boxHeight}> 
                            
                            <AutoSizer>
                                {({height, width}:{height:any, width:any}) => (
                                
                                    <InfiniteLoader isItemLoaded={index => index < data.length}  itemCount={itemCount}  loadMoreItems={loadMoreData} >
                                        {({ onItemsRendered, ref }) => (
                                        <List onItemsRendered={onItemsRendered} ref={ref} overscanCount={30}  height={height?height:boxHeight} style={{overflow:'auto'}}itemCount={itemCount} itemSize={40} width={width}> 
                                            {({ index, style }) => 
                                                {
                                                    return (isItemLoaded(index) && index >= 0) ? 
                                                        ( 
                                                            <div  style={{...style}} id='custom-portal'> 
                                                                <RowComponent lastClickedId={lastClickedId} prevSelectedIndex={prevCurrentIndex} prevSelectedElements={prevSelectedElements} row={dataToWork[index]} index={index} selectedIndex={currentIndex} selectedElements={selectedElements} handleCheckboxChange={handleCheckboxChange} columnsMap={columnsMap} columns={columns} additionalComponents={additionalComponents} CellStyle={CellStyle} totalWidth={totalWidth} onClickRow={onClickRow} excludedKeys={excludedKeys}/>
                           

                                                            </div>
                                                        )

                                                        :
                                                            ( <> 
                                                                {Array.from({ length: 4 }).map((_, rowIndex) => (
                                                                <Flex ml='20px' style={style}key={`skeleton-row-${rowIndex}`} height="45px" gap="20px" minWidth={`${totalWidth}px`} alignItems="center"  >
                                                                        <Flex>
                                                                        <Skeleton height="20px" width="20px" borderRadius="4px" />
                                                                        </Flex>
                                                                    {columns.map((column, colIndex) => (
                                                                        <Flex key={`skeleton-cell-${rowIndex}-${colIndex}`} minW={0} alignItems="center" flex={`${(columnsMap?.[column]?.[1] || 180) / 10} 0 ${columnsMap?.[column]?.[1] || 180 }px`}>
                                                                            <Skeleton height="16px" width="70%" />
                                                                        </Flex>
                                                                    ))}
                                                                </Flex>
                                                            ))}
                                                        </>)
                                                    }
                                                } 
                                        </List>

                                    )}
                                    </InfiniteLoader>
                                )}
                            </AutoSizer> 

                            {showAccRow && 
                            <Flex height={'40px'}zIndex={1000} fontSize={'.9em'}  bottom={0} bg='gray_2' gap='20px'minWidth={`${totalWidth}px`}  borderRadius={'0 0 .5rem .5rem'} borderWidth={'0 1px 1px 1px'}  fontWeight={'medium'} alignItems={'center'} color='black' p='10px'>
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

                <Box  px={'2vw'}> 
                    <Flex  position="sticky" minWidth={`${totalWidth}px`} borderBottomWidth="1px"   gap="20px" alignItems="center" color="text_gray" p="10px" fontSize=".9em">
                    <Box><Skeleton height="20px" width="20px" borderRadius="4px" /></Box>
                    
                    {columns.filter((column) => column !== "id").map((column) => {
                        
                        const foundAdditionalComponentWidth = additionalComponents?.find(com => com.shouldDisplayAfter === column)?.width || 0

                        return (
                        <Flex key={`skeleton-header-${column}`} minW={0} alignItems="center" flex={`${(columnsMap?.[column]?.[1] || 180) / 10 + foundAdditionalComponentWidth} 0 ${columnsMap?.[column]?.[1] || 180 + foundAdditionalComponentWidth}px`}>
                        <Skeleton height="20px" width="80%" />
                        </Flex>)
                        })}
                     </Flex>
                </Box>
                <Box px={'2vw'}  position="relative" minWidth={`${totalWidth}px`} overflowX="hidden" overflowY="scroll" maxH={height || boxHeight} >
                    {Array.from({ length: 20 }).map((_, rowIndex) => (
                        <Flex key={`skeleton-row-${rowIndex}`} height="40px" borderBottomColor={'border_gray'} borderBottomWidth={'1px'}   gap="20px" minWidth={`${totalWidth}px`} alignItems="center" p="10px" bg={'transparent'}>
                            <Flex>
                                <Skeleton height="20px" width="20px" borderRadius="4px" />
                            </Flex>
                            {columns.map((column, colIndex) => {
                            const foundAdditionalComponentWidth = additionalComponents?.find(com => com.shouldDisplayAfter === column)?.width || 0

                                return(
                                <Flex key={`skeleton-cell-${rowIndex}-${colIndex}`} minW={0} alignItems="center" flex={`${(columnsMap?.[column]?.[1] || 180) / 10 + foundAdditionalComponentWidth} 0 ${columnsMap?.[column]?.[1] || 180 + foundAdditionalComponentWidth}px`}>
                                <Skeleton height="16px" width="70%" />
                                </Flex>
                            )})}
                        </Flex>
                    ))}
                </Box>
            </Box>
        
            }
        </Box>
    </> )
}
export default Table