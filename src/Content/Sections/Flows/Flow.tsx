//REACT
import { useState, useEffect, useRef, RefObject, useMemo, CSSProperties, Dispatch, SetStateAction, useLayoutEffect } from 'react'
import { useAuth } from '../../../AuthContext.js'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSession } from '../../../SessionContext.js'
//FETCH DATA
import fetchData from '../../API/fetchData'
//FRONT
import { Flex, Box, Button, IconButton, NumberInput, NumberInputField, Text, Textarea, Portal, Icon, Skeleton, Tooltip, chakra, shouldForwardProp } from '@chakra-ui/react'
import { motion, AnimatePresence, isValidMotionProp, cubicBezier } from 'framer-motion'
//FLOWS
import ReactFlow, { Controls, Background, useNodesState, useEdgesState, ControlButton, SelectionMode, useReactFlow } from 'reactflow'
import 'reactflow/dist/style.css'
import { FirstNode } from './CustomNodes'
import { AddNode } from './CustomNodes'
import { BrancherNode } from './CustomNodes'
import { ExtactorNode } from './CustomNodes'
import { TransferNode } from './CustomNodes'
import { ResetNode } from './CustomNodes'
import { FlowSwapNode } from './CustomNodes'
import { FunctionNode } from './CustomNodes'
import { MotherStructureUpdateNode } from './CustomNodes'
import { SenderNode } from './CustomNodes'
import { TerminatorNode } from './CustomNodes'
import { CustomEdge } from './CustomNodes'
//COMPONENTS
import TestChat from './TestChat.js'
import EditText from '../../Components/Reusable/EditText.js'
import CustomSelect from '../../Components/Reusable/CustomSelect.js'
import LoadingIconButton from '../../Components/Reusable/LoadingIconButton.js'
import ConfirmBox from '../../Components/Reusable/ConfirmBox.js'
import VariableTypeChanger from '../../Components/Reusable/VariableTypeChanger.js'
import '../../Components/styles.css'

//FUNCTIONS
import useOutsideClick from '../../Functions/clickOutside.js'
import determineBoxStyle from '../../Functions/determineBoxStyle.js'
//ICONS
import { RxCross2 } from 'react-icons/rx'
import { FaPlus } from 'react-icons/fa'
import { IoIosArrowDown, IoIosWarning, IoIosArrowBack } from 'react-icons/io'
import { BsTrash3Fill } from 'react-icons/bs'
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { FiHash } from 'react-icons/fi';
import { TbMathFunction } from 'react-icons/tb';
import { FiType } from 'react-icons/fi';
import { AiOutlineCalendar } from 'react-icons/ai';
import { MdOutlineFormatListBulleted } from 'react-icons/md';
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
//TYPING
import { languagesFlags, actionTypesDefinition, nodeTypesDefinition, DataTypes, Branch, FlowMessage, FieldAction, FunctionType } from '../../Constants/typing.js'
import { IconType } from 'react-icons'
  
//FLOWS AND NODES DEFINITIONS
const panOnDrag = [1, 2]
 
//VARIABLE TYPES
type VariableType = {name:string, type:DataTypes, description:string, examples:any[], values:any[], ask_for_confirmation:boolean}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//MAIN FUNCTION
const Flow = () => {

    //NODES CONSTANTS
    const nodeTypes = useMemo(() => ({
        trigger: FirstNode,
        add: AddNode,
        brancher: BrancherNode,
        extractor: ExtactorNode,
        sender: SenderNode,
        terminator: TerminatorNode,
        transfer: TransferNode,
        reset: ResetNode,
        flow_swap: FlowSwapNode,
        function: FunctionNode,
        motherstructure_updates: MotherStructureUpdateNode
    }), [])
    const edgeTypes = useMemo(() => ({custom: CustomEdge}), [])
    const { zoomIn, zoomOut, setCenter } = useReactFlow()


    //TRANSLATION
    const { t } = useTranslation('flows')
    
    //CONSTANTS
    const auth = useAuth()
    const location = useLocation().pathname
    const navigate = useNavigate()

    //MAPPING CONSTANTS
    const dataExtactionDict = {simple:t('simple'), comprehensive:t('comprehensive')}
    const classificationDict = {none:t('none'), simple:t('simple'), comprehensive:t('comprehensive')}

    //REFS AND BAR PROPS
    const flowBoxRef = useRef<HTMLDivElement>(null)
    const nameInputRef = useRef<HTMLDivElement>(null)

    //BOOLEAN FOR WAIT THE CHARGE
    const [waiting, setWaiting] = useState<boolean>(true)

    //SHOW THE TEST BOX
    const [showTest, setShowTest] = useState<boolean>(false)

    //SHOW NODES EDITOR
    const [showNodesAction, setShowNodesAction] = useState<null | {nodeId:string, actionType:actionTypesDefinition, actionData:any}>(null)

    //SHOW MORE INFO
    const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false)
    const [variableToEdit, setVariableToEdit] = useState<{data:VariableType, index:number} | -1| null>(null)

    //FLOW DATA
    const [sourceId, setSourceId] = useState<string | null>(null)
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [flowName, setFlowName] = useState<string>(t('NewFlow'))    
    const [flowDescription, setFlowDescription] = useState<string>('')    
    const [flowVariables, setFlowVariables] = useState<VariableType[]>([])  
    const initialNodesRef = useRef<any[]>([])
    const flowVariablesRef = useRef<VariableType[]>([])
    const flowsListRef = useRef<{uuid:string, name:string}[]>([])
    const groupsListRef = useRef<{id:string, name:string}[]>([])
    const channelsListRef = useRef<{id:string, display_id:string, name:string, channel_type:string, is_active:boolean}[]>([])
    const currentChannelIdRef = useRef<string | null>(null)
    const currentMessagesRef = useRef<{type:string, content:any, sent_by:'business' | 'client'}[]>([])
    const currentFlowIndexRef = useRef<number>(-1)
    const isActiveRef = useRef<boolean>(true)
    
    //SHOW NT SAVED CHANGES WARNING
    const [showNoSaveWarning, setShowNoSaveWarning] = useState<boolean>(false)
    
    //UPDATE VARIABLES FROM NODES
    useEffect(() => {
        setNodes((nds) => {
            const updatedNodes = nds.map((node) => {
                if (node.type === 'brancher' || node.type === 'extractor' || 'reset') return {...node, data:{...node.data, functions:{...node.data.functions, flowVariables:flowVariables}}}
                return node
            })
            return updatedNodes
        })
        flowVariablesRef.current = flowVariables
    },[flowVariables])

    useEffect(() => {
        setNodes((nds) =>nds.map((node) => ({...node, data: { ...node.data, functions:{...node.data.functions, currentIndex: currentFlowIndexRef.current}}})))
    }, [currentFlowIndexRef.current]);
    

    const [flowInterpreterConfig, setFlowInterpreterConfig] = useState<{data_extraction_model: 'simple' | 'comprehensive', response_classification_model:'none' | 'simple' | 'comprehensive'}>({data_extraction_model:'comprehensive', response_classification_model:'comprehensive'})    
    const [flowsFunctions, setFlowFunctions] = useState<string[]>([])
    const functionsNameMap = useRef<{[key:string]:string}>({})

    //PARSE NODES STRUCTURE TO SEND TO THE BACK
    const parseDataToBack = (nodes:{id:string, type?: string, data?:any}[]) => {
        
        const triggerNode = nodes.find(node => node.type === 'trigger')
        const filteredNodes = nodes.filter(node => node.type !== 'trigger')

        const finalNodes = filteredNodes.map(node => {
            const { functions, ...noFunctionsData } = node.data
                return {front:{x:parseInt(node.id.split('-')[0]), y:parseInt(node.id.split('-')[1])}, type: node.type, ...noFunctionsData}
        })
        return {nodes:finalNodes, channels:triggerNode?.data.channels}
    }

    //GET NODE FUNCTIONS
    const getNodeFunctions = (type:nodeTypesDefinition, index:number) => {
        switch (type) {
            case 'brancher': return  {index, currentIndex:currentFlowIndexRef.current, flowVariables:flowVariablesRef.current, setShowNodesAction, editBranch, addNewNode, deleteNode, getAvailableNodes}
            case 'extractor': return {index, currentIndex:currentFlowIndexRef.current, flowVariables:flowVariablesRef.current, setShowNodesAction, editBranch, editExtractor, addNewNode, deleteNode, getAvailableNodes}
            case 'sender': return {index, currentIndex:currentFlowIndexRef.current, setShowNodesAction, editMessage, addNewNode, deleteNode, getAvailableNodes}
            case 'terminator': return {index, currentIndex:currentFlowIndexRef.current, setShowNodesAction, editMessage, deleteNode}
            case 'transfer': return {index, currentIndex:currentFlowIndexRef.current, groupsList:groupsListRef.current, setShowNodesAction, editMessage, editSimpleFlowData, deleteNode}
            case 'reset': return {index, currentIndex:currentFlowIndexRef.current, flowVariables:flowVariablesRef.current, setShowNodesAction, editSimpleFlowData, editMessage, deleteNode, addNewNode, getAvailableNodes}
            case 'flow_swap': return {index, currentIndex:currentFlowIndexRef.current, flowsIds:flowsListRef.current, setShowNodesAction, editMessage, addNewNode, deleteNode, editSimpleFlowData} 
            case 'function': return {index, currentIndex:currentFlowIndexRef.current, flowId:location.split('/')[location.split('/').length - 1], functionsDict:functionsNameMap.current,  setShowNodesAction, editSimpleFlowData, addNewNode, deleteNode, getAvailableNodes, editFunctionError}
            case 'motherstructure_updates': return {currentIndex:currentFlowIndexRef.current, setShowNodesAction, editFieldAction, addNewNode, deleteNode, getAvailableNodes}
            default:{}
        }
    }
 
    //PARSE NODE DATA FROM BACK TO USE IN THE APP
    const parseNodesFromBack = (nodesBack: Array<{id:string, front:{x:number, y:number}, type: nodeTypesDefinition; [key: string]: any }>) => {
        

        const getNewNodeObject = (node: {id: string, type: nodeTypesDefinition, [key: string]: any }, index:number) => {
            const {x, y} = node.front
            const { type, ...variableData } = node
            const data = {...variableData as {[key: string]: any}, functions: getNodeFunctions(type, index + 1)}
            return {id: `${x}-${y}`, position:{x:x * 350, y: y* 350}, type, data}
        }

        const finalNodes = nodesBack.map((node, index) => {return getNewNodeObject(node, index)})

        let firstEdges:{ id: string, type: 'custom', source: string, target:string, sourceHandle:string }[] = []
        finalNodes.map((node:{id: string, type: nodeTypesDefinition, [key: string]: any }, index) => {
        
                const sourceId = node.id
                if (node.type === 'brancher' || node.type === 'extractor') {  
                    node.data?.branches.map((branch:Branch, index:number) => {
                        const targetId = finalNodes[branch.next_node_index].id
                        firstEdges.push({id: `${sourceId}->${targetId}(${index})`, sourceHandle:`handle-${index}`, type: 'custom', source: sourceId, target: targetId})
                    })
                }
                else {
                    const targetIndex = node.data?.next_node_index !== undefined && node.data?.next_node_index !== null ?node.data?.next_node_index: -1   
                    const targetId = targetIndex === -1 ? null:finalNodes[targetIndex].id
                    if (targetId) firstEdges.push({id: `${sourceId}->${targetId}-(-1)`, sourceHandle:'handle-(-1)', type: 'custom', source: sourceId, target: targetId})

                    if (node.type === 'function' && node.data.error_nodes_ids) {
                        Object.keys(node.data?.error_nodes_ids).map((errorKey:string, index:number) => {
                            const targetId = finalNodes[node.data?.error_nodes_ids[errorKey]].id
                            firstEdges.push({id: `${sourceId}->${targetId}(${index})`, sourceHandle:`handle-${index}`, type: 'custom', source: sourceId, target: targetId})
                        })
                    }
            }
        })
        setEdges([{ id: '0->1-0', type: 'custom', source: '0', target: '1-0' }, ...firstEdges])
        
        return finalNodes
    }

    //GET THE AVAILABLE NODES WHEN ADDING A NEW ONE
    const getAvailableNodes = (sourceData:{sourceId:string, sourceType:nodeTypesDefinition, branchIndex?:number}) => {

        let availableNodes:{id:string, index:number}[] = []

        setNodes((nds) => {
            const [sourceX] = sourceData.sourceId.split('-').map(Number)
            const nextColumnNodes = nds.filter(node => {
                const [x] = node.id.split('-').map(Number)
                return x === sourceX + 1
            }).map((node, index) => {return {id:node.id, index:node.data.functions.index}})

            if (sourceData.sourceType === 'reset') {
                const extractorNodes = nds.filter(node => node.type === 'extractor').map((node, index) => {return {id:node.id, index:node.data.functions.index}})
                availableNodes = [...nextColumnNodes, ...extractorNodes]
            }
            else availableNodes = nextColumnNodes
            return nds
        })

        return availableNodes
    }

    //RESIZE NDOES
    const resizeNodes = (nds:any[], sourceId:string) => {
        const [columnIndex] = sourceId.split('-').map(Number)
        let updatedNodes = nds.map((node) => {
            const [nodeColIndex] = node.id.split('-').map(Number)
            if (nodeColIndex === columnIndex) return { ...node, position: { ...node.position, y: 0 } }
            return node
        })

        let currentY = 0
        let acc = 0
        updatedNodes = updatedNodes.map((node, index) => {
            const [nodeColIndex, nodeRowIndex] = node.id.split('-').map(Number)
            if (nodeColIndex === columnIndex) {
                if (nodeRowIndex > acc) currentY += (380 * (nodeRowIndex - acc))
                const newPosition = { x: nodeColIndex * 350, y: currentY }
                currentY += (node?.height || 0) + 30
                acc ++
                return {...node, position: newPosition, functions:{...node.functions, index}}
            }
            return node
        })
        return updatedNodes
    }

    //RESIZE NODES ON EDITING ONE
    useEffect(() => {
        if (sourceId) {
            setNodes((prevNodes) => resizeNodes(prevNodes, sourceId))
            setSourceId(null)
        }
    }, [sourceId])

    //ADD AND DELETE NEW NODES FUNCTIONS
    const addNewNode = (sourceData:{sourceId:string, sourceType:nodeTypesDefinition, branchIndex?:number}, targetType:nodeTypesDefinition | '', nodeId?:string) => {
    
        const getNewNodeId = (id:string, nds:{id:string, type:nodeTypesDefinition, position:{x:number, y:number}, data:any}[]) => {
            const newNodeX = parseInt(id.split('-')[0]) + 1
            const previousColumnNodes = nds.filter((node) => node.id.startsWith(`${newNodeX - 1}-`))
            const restrictedRows = new Set(previousColumnNodes.filter((node) =>node.type === 'transfer' || node.type === 'terminator' || node.type === 'flow_swap').map((node) => parseInt(node.id.split('-')[1]) - 1))  

            const matchingNodes = nds.filter(node => node.id.startsWith(`${newNodeX}-`))

            if (matchingNodes.length > 0) {
                const occupiedRows = new Set(matchingNodes.map((node) => parseInt(node.id.split('-')[1])))
                let firstAvailableRow = 0
                while (occupiedRows.has(firstAvailableRow)) {firstAvailableRow++}
                return `${newNodeX}-${firstAvailableRow}}`
            } 
            else {
                let firstAvailableRow = 0
                while (restrictedRows.has(firstAvailableRow)) {firstAvailableRow++}
                return `${newNodeX}-${firstAvailableRow}`
            } 
        }

        const getNewNodeObject = (id:string, type:nodeTypesDefinition, nds:any) => {

            const [colIndex, rowIndex] = id.split('-').map(Number)
            const x = colIndex * 350
            const nodesInSameColumn = nds.filter((node:any) => parseInt(node.id.split('-')[0]) === colIndex)
          
            let y = 0

            if (nodesInSameColumn.length < rowIndex) y = (rowIndex - nodesInSameColumn.length) * 380
            else {
                for (const node of nodesInSameColumn) {
                    const nodeRowIndex = parseInt(node.id.split('-')[1])
                    if (nodeRowIndex < rowIndex) y += node.height + 30
                    else break
                }
            }
        
            const position = { x, y }
            
            let newNodeObjectData = {}
            if (type === 'brancher') newNodeObjectData = {branches:[{name:'',conditions:[], next_node_index:null}], functions:getNodeFunctions(targetType as nodeTypesDefinition, nds.length - 1)}
            else if (type === 'extractor') newNodeObjectData = {branches:[{name:'',conditions:[], next_node_index:null}], variables:[], functions:getNodeFunctions(targetType as nodeTypesDefinition, nds.length - 1)}
            else if (type === 'sender') newNodeObjectData =  {next_node_index:null, messages:[{type:'generative', generation_instructions:'', preespecified_messages:{}}], functions:getNodeFunctions(targetType as nodeTypesDefinition, nds.length - 1)}
            else if (type === 'terminator') newNodeObjectData = {flow_result:'', messages:[{type:'generative', generation_instructions:'', preespecified_messages:{}}], functions:getNodeFunctions(targetType as nodeTypesDefinition, nds.length - 1)}
            else if (type === 'transfer') newNodeObjectData = {user_id:0, group_id:0, messages:[{type:'generative', generation_instructions:'', preespecified_messages:{}}], functions:getNodeFunctions(targetType as nodeTypesDefinition, nds.length - 1)}
            else if (type === 'reset') newNodeObjectData = {variable_indices:[],next_node_index:null, messages:[{type:'generative', generation_instructions:'', preespecified_messages:{}}], functions:getNodeFunctions(targetType as nodeTypesDefinition, nds.length - 1)}
            else if (type === 'flow_swap') newNodeObjectData = {new_flow_uuid:'-1', messages:[{type:'generative', generation_instructions:'', preespecified_messages:{}}], functions:getNodeFunctions(targetType as nodeTypesDefinition, nds.length - 1)}
            else if (type === 'function') newNodeObjectData = {uuid:'', variable_args:{}, motherstructure_args:{}, hardcoded_args:{}, error_nodes_ids:{}, next_node_index:null, output_to_variables:{}, functions:getNodeFunctions(targetType as nodeTypesDefinition, nds.length - 1)}
            else if (type === 'motherstructure_updates') newNodeObjectData = {updates:[], next_node_index:null, functions:getNodeFunctions(sourceData.sourceType, nds.length - 1)}
            return {id, position, data: newNodeObjectData, type:targetType}
        }

        if (sourceData.sourceType === 'add') {
            setNodes((nds) => {
                    const newNodeObject = getNewNodeObject('1-0-1', targetType as nodeTypesDefinition, nds)
                    return nds.map((node) => {
                        if (node.id !== '1') return node
                        return newNodeObject
                    })
                }
            )
            setEdges([{id: '0->1-0-1', type: 'custom', source: '0', target: '1-0-1' }])
        }
        else {      
            let newNodeId:string
            setNodes((nds) => 
            {
                newNodeId = nodeId?nodeId:getNewNodeId(sourceData.sourceId, nds as {id:string, type:nodeTypesDefinition, position:{x:number, y:number}, data:any}[])
                if (sourceData.sourceType === 'brancher' || sourceData.sourceType === 'extractor' || sourceData.sourceType === 'function' ) {
                    const nodeIndex = nds.findIndex(node => node.id === sourceData.sourceId)
                    if (nodeIndex !== -1) {
                        const nodeToUpdate = { ...nds[nodeIndex] }
                        if (sourceData.sourceType === 'function') {
                            if (sourceData.branchIndex === undefined) nodeToUpdate.data = {...nodeToUpdate.data, next_node_index: parseInt(newNodeId.split('-')[2]) - 1}
                            else if (nodeToUpdate.data.error_nodes_ids) {
                                const updatedErrors = {...nodeToUpdate.data.error_nodes_ids}
                                const keyToUpdate = Object.keys(updatedErrors)[sourceData?.branchIndex as number]
                                if (keyToUpdate) {
                                    updatedErrors[keyToUpdate] =  parseInt(newNodeId.split('-')[2]) - 1
                                    nodeToUpdate.data = { ...nodeToUpdate.data, error_nodes_ids: updatedErrors }
                                }
                            }
                        }
                        else {
                            if (nodeToUpdate.data && Array.isArray(nodeToUpdate.data.branches)) {
                                const updatedBranches = nodeToUpdate.data.branches.map((branch:any, index:number) => {
                                    if (index === sourceData.branchIndex) return {...branch, next_node_index: parseInt(newNodeId.split('-')[2]) - 1}
                                    return branch
                                })
                                nodeToUpdate.data = {...nodeToUpdate.data, branches: updatedBranches}
                            }
                        }
                        const updatedNodes = nds.map((node, index) => index === nodeIndex ? nodeToUpdate : node)
                        
                        if (nodeId) return updatedNodes
                        else return [...updatedNodes, getNewNodeObject(newNodeId, targetType as nodeTypesDefinition, nds)]
                    }
                }
                else {
                    const nodeIndex = nds.findIndex(node => node.id === sourceData.sourceId)
                    if (nodeIndex !== -1) {
                        const nodeToUpdate = { ...nds[nodeIndex], data:{...nds[nodeIndex].data, next_node_index:parseInt(newNodeId.split('-')[2]) - 1} }
                        const updatedNodes = nds.map((node, index) => index === nodeIndex ? nodeToUpdate : node)
                        if (nodeId) return updatedNodes
                        return [...updatedNodes, getNewNodeObject(newNodeId, targetType as nodeTypesDefinition, nds)]
                    }
                }
                if (nodeId) return nds
                else return [...nds, getNewNodeObject(newNodeId, targetType as nodeTypesDefinition, nds)]
            })

            setEdges((edges) => [...edges,  {id:`${sourceData.sourceId}->${nodeId?nodeId:newNodeId}(${sourceData?.branchIndex === undefined?'-1':sourceData?.branchIndex})`,sourceHandle:(sourceData?.branchIndex !== undefined)?`handle-${sourceData.branchIndex}`:sourceData.sourceType === 'function'?'handle-(-1)':'', type:'custom', source:sourceData.sourceId, target:nodeId?nodeId:newNodeId}])
        }
    }

    //DELETE A NODE OR A BRANCH (THE LOGIC IS REUSED TO RESIZE NODES WHEN HIDING OR EXPANDING A NODE)
    const deleteNode = (sourceId:string, resize?:boolean, delete_branch?:boolean, isSource?:boolean) => {

        setNodes((nds) => 
            {   
                if (resize) return resizeNodes(nds, sourceId)
                            
                else {
                    let sourceNode:string = ''
                    let sourceHandle:number = -1

                    if (nds.length === 2) setEdges([{ id: '0->1', type: 'custom', source: '0', target: '1' }])
                    else {
                        setEdges((edg) => edg.filter((edge) => {
                            const edgeSource = edge.source
                            const edgeTarget = edge.target

                            //DELETE BRANCH
                            if ((sourceId === edgeSource) && isSource) {
                                sourceNode = edgeSource
                                return false
                            }

                             //DELETE NODE
                            else if ((sourceId === edgeTarget) && !isSource) {
                                sourceNode = edgeSource
                                if (edge.sourceHandle) {
                                    if (edge.sourceHandle.includes('(') && edge.sourceHandle.includes(')')) sourceHandle = parseInt(edge.sourceHandle.split('(')[1].split(')')[0], 10)
                                    else sourceHandle = parseInt(edge.sourceHandle.split('-')[1], 10)
                                    return sourceHandle !== -1
                                } 
                            }
                        
                            if (delete_branch)  return edgeSource !== sourceId
                            else return edgeSource !== sourceId && edgeTarget !== sourceId
                        }))
                    }

                    let updatedNodes = nds.map((node) => {
                        if (node.id === sourceNode) {
                            if (sourceHandle !== -1) {     
                                if (node.type === 'brancher' || node.type === 'extractor') {
                                    return {...node, data: {...node.data, branches: node.data.branches.map((branch: any, idx: number) => {
                                                if (idx === sourceHandle) return { ...branch, next_node_index: null }
                                                return branch
                                            })
                                        }
                                    } 
                                }
                                else if (node.type === 'function') {
                                    const errors = node.data.error_nodes_ids
                                    const ketToDelete = Object.keys(node.data.error_nodes_ids)[sourceHandle]
                                    errors[ketToDelete] = null
                                    return {...node, data: {...node.data, error_nodes_ids: errors}}
                                }
                            }
                            else return {...node, data: {...node.data, next_node_index: null}} 
                        }
                        return node
                    })
                 
                    if (!delete_branch) updatedNodes = updatedNodes.filter((node) => node.id !== sourceId)
                    if (nds.length === 2) updatedNodes.push({id:'1', position:{x:350, y:0}, data:{addNewNode}, type:'add'})

                    return updatedNodes
                }
            }
    )}

    //ADD OR DELETE BRANCHES
    const editBranch = (nodeId:string | undefined, index:number | undefined, type:'remove'| 'remove-branch' | 'add' | 'edit', newBranch?:Branch) => {
        setNodes((nds) => nds.map((node) => {
            
            if (node.id !== nodeId) return node
            let updatedBranches
            if (type === 'remove' || type === 'remove-branch') {

                setEdges((edges) => {
                    const filteredEdges = edges.filter((edge) => {
                        const edgeSource = edge.id.split('->')[0];
                        return edgeSource !== nodeId || edge.sourceHandle !== `handle-${index}`
                    })

                    let updatedEdges
                    if (type === 'remove') {
                        updatedEdges = filteredEdges.map((edge) => {
                            const edgeSource = edge.id.split('->')[0];
                            const edgeHandleIndex = edge.sourceHandle?parseInt(edge.sourceHandle.split('-')[1], 10):-1
                                if (edgeSource === nodeId && edgeHandleIndex > (index as number)) {
                                const newHandle = `handle-${edgeHandleIndex - 1}`
                                return {...edge,id: `${nodeId}->${newHandle}`, sourceHandle: newHandle}
                            }
                            return edge
                        })
                    }
                    else updatedEdges = filteredEdges
                
                    return updatedEdges
                })
                
                if (type === 'remove') updatedBranches = node.data.branches.filter((_:any, idx:number) => idx !== index)
                else {
                    updatedBranches = node.data.branches.map((branch: any, idx: number) => {
                        if (idx === index) return { ...branch, next_node_index: null }
                        return branch
                    })
                }
            }
            else if (type === 'add') updatedBranches = [...node.data.branches, { name: '', conditions: [], next_node_index: null }]
            else if (type === 'edit') {
                updatedBranches = node.data.branches.map((branch: any, idx: number) => {
                  if (idx === index) return newBranch
                  return branch
                })
            }
            return {...node,data: {...node.data,branches: updatedBranches}}  
        })
      )
      setTimeout(() => {setSourceId(nodeId as string)}, 0)
    }

    //ADD OR DELETE VARIABLE IN EXTRACTOR
    const editExtractor = (nodeId:string | undefined, index:number | undefined, type:'remove' | 'add' | 'edit', newMessage?:{index:number, message:FlowMessage} ) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id !== nodeId) return node
            let updatedVariables
            if (type === 'remove') updatedVariables = node.data.variables.filter((_:any, idx:number) => idx !== index)
            else if (type === 'add') updatedVariables = [...node.data.variables, { index: 0, message:{type:'generative', generation_instructions:'', preespecified_messages:{}}, require_confirmation:false, confirmation_message:{type:'generative', generation_instructions:'', preespecified_messages:{}}}]
            else if (type === 'edit') {
                updatedVariables = node.data.variables.map((message: any, idx: number) => {
                  if (idx === index) return newMessage
                  return message
                })
            }
            return {...node, data: { ...node.data, variables: updatedVariables}}
        })
      ) 
      setTimeout(() => {setSourceId(nodeId as string)}, 0)
    }
  
    //ADD OR DELETE A MESSAGE IN SENDER
    const editMessage = (nodeId:string | undefined, index:number | undefined, type:'remove' | 'add' | 'edit', newMessage?:FlowMessage) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id !== nodeId) return node
            let updatedMessages
            if (type === 'remove') updatedMessages = node.data.messages.filter((_:any, idx:number) => idx !== index)
            else if (type === 'add') updatedMessages = [...node.data.messages, {type:'generative', generation_instructions:'', preespecified_messages:{}}]
            else if (type === 'edit') {
                updatedMessages = node.data.messages.map((message: any, idx: number) => {
                  if (idx === index) return newMessage
                  return message
                })
            }
            return {...node, data: { ...node.data, messages: updatedMessages}}
        })
      )
      setTimeout(() => {setSourceId(nodeId as string)}, 0)
    }

    //ADD OR DELETE A MESSAGE IN SENDER
    const editFieldAction = (nodeId:string | undefined, index:number | undefined, type:'remove' | 'add' | 'edit', newAction?:FieldAction) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id !== nodeId) return node
            let updatedActions
            if (type === 'remove') updatedActions = node.data.updates.filter((_:any, idx:number) => idx !== index)
            else if (type === 'add') updatedActions = [...node.data.updates, {motherstructure:'tickets', is_customizable:false, name:'user_id', operation:'set', value:-1}]
            else if (type === 'edit') {
                updatedActions = node.data.updates.map((message: any, idx: number) => {
                  if (idx === index) return newAction
                  return message
                })
            }
            return {...node, data: { ...node.data, updates: updatedActions}}
        })
      ) 
    }

    //EDIT SIMPLE FLOW DATA
    const editSimpleFlowData = (nodeId:string | undefined, keyToEdit:string, newData:any ) => {
        
        setNodes((nds) => nds.map((node) => {
            if (node.id !== nodeId) return node
            return {...node, data: { ...node.data, [keyToEdit]: newData}}
        }))
    }

    //EDIT FUNCTION DATA 
    const editFunctionFlowData = (nodeId:string | undefined, newData:any ) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id !== nodeId) return node
            return {...node, data: { functions:node.data.functions, ...newData}}
        }))
    }

    //EDIT ERROS OF FUNCTIONS
    const editFunctionError = (nodeId:string | undefined, type:'add' | 'remove' | 'remove-branch', keyToEdit:number, index?:number) => {

        setNodes((nds) => nds.map((node) => {
            
            if (node.id !== nodeId) return node
            let updatedErrors
            if (type === 'remove' || type === 'remove-branch') {

                setEdges((edges) => {
                    const filteredEdges = edges.filter((edge) => {
                        const edgeSource = edge.id.split('->')[0];
                        return edgeSource !== nodeId || edge.sourceHandle !== `handle-${index}`
                    })

                    let updatedEdges
                    if (type === 'remove') {
                        updatedEdges = filteredEdges.map((edge) => {
                            const edgeSource = edge.id.split('->')[0];
                            const edgeHandleIndex = edge.sourceHandle?parseInt(edge.sourceHandle.split('-')[1], 10):-1
                                if (edgeSource === nodeId && edgeHandleIndex > (index as number)) {
                                const newHandle = `handle-${edgeHandleIndex - 1}`
                                return {...edge, id: `${nodeId}->${newHandle}`, sourceHandle: newHandle}
                            }
                            return edge
                        })
                    }
                    else updatedEdges = filteredEdges
                
                    return updatedEdges
                })
                
                if (type === 'remove')  {
                    const errors = node.data.error_nodes_ids
                    delete errors[keyToEdit]
                    updatedErrors = errors
                }
                else {
                    const errors = node.data.error_nodes_ids
                    errors[keyToEdit] = null
                    updatedErrors = errors
                }
            }
            else if (type === 'add') updatedErrors = {...node.data.error_nodes_ids, [keyToEdit]: null}
          
            return {...node,data: {...node.data,error_nodes_ids: updatedErrors}}  
        })
      )     
    }
    
    //FETCH INITIAL DATA
    useEffect(() => {
        const fetchInitialData = async () => {

            //GET FLOW ID
            const flowId = location.split('/')[location.split('/').length - 1]
 
            //RETRIEVE FUNCTIONS
            const responseFunctions = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/functions`, auth })
            if (responseFunctions?.status === 200) {
                const functionsList = responseFunctions.data
                const UUIDsList = functionsList.map((item:any) => item.uuid)
                const dictName = functionsList.reduce((acc:any, item:any) => {
                    acc[item.uuid] = item.name
                    return acc
                }, {})
                setFlowFunctions(UUIDsList)
                functionsNameMap.current = dictName
            }

            //RERTRIEVE FLOWS
            const responseFlows = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/flows`, auth })
            if (responseFlows?.status === 200) {
                const flowsList = responseFlows.data.map((item:any) => {return {uuid:item.uuid, name:item.name}}).filter((flow:{uuid:string, name:string}, idx: number) => flow.uuid !== flowId)
                flowsListRef.current = flowsList
            }

            //RETRIEVE CHANNEL IDS
            let channelsIds = []
            const responseChannelsIds = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/channels/all_channels_basic_data`, auth })
            if (responseChannelsIds?.status === 200) {
                channelsIds = responseChannelsIds.data.filter((cha:any) => cha.is_active !== false)
                channelsListRef.current = channelsIds
            }

            if (location.endsWith('create')) {
                setNodes([{id:'0', position:{x:0, y:0}, data:{channels:[], functions:{channelIds:channelsIds, editSimpleFlowData}}, type:'trigger'}, {id:'1', position:{x:300, y:0}, data:{addNewNode}, type:'add'}])
                setEdges([{ id: '0->1', type: 'custom', source: '0', target: '1' }])
                setWaiting(false)
            }
            else {
                 const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/flows/${flowId}`, setWaiting, auth})
                if (response?.status === 200){
                    flowVariablesRef.current = response.data.variables
                    setFlowName(response.data.name)
                    setFlowDescription(response.data.description)
                    setFlowVariables(response.data.variables)
                    setFlowInterpreterConfig(response.data.interpreter_configuration)
                    isActiveRef.current === response.data.is_active
                    const frontNodes = [{id:'0', position:{x:0, y:0}, data:{channels:response.data.channel_ids, functions:{channelIds:channelsIds, editSimpleFlowData}}, type:'trigger'},...parseNodesFromBack(response.data.nodes)]
                    initialNodesRef.current = frontNodes
                    setNodes(frontNodes)
                }
            }
        }
        fetchInitialData()
    }, [])

     //CUSTOM BOX FOR EDITING NODES
    const NodesEditBox = () => {

        const node = nodes.find(node => node.id === showNodesAction?.nodeId)
        const scrollRef = useRef<HTMLDivElement>(null)

        const structureList:('ticket' | 'client' | 'contact_business')[] = ['ticket', 'client', 'contact_business']    
        const structureLabelsMap:{[key in 'ticket' | 'client' | 'contact_business']:string} = {'ticket':t('tickets'), 'client':t('clients'),'contact_business':t('contact_businesses')}
        const ticketsList = ['user_id', 'group_id', 'channel_type', 'title', 'subject', 'urgency_rating', 'status', 'unseen_changes', 'tags', 'is_matilda_engaged', 'is_satisfaction_offered']
        const ticketsLabelsMap:{[key:string]:string} = {}
        ticketsList.forEach((structure, index) => {ticketsLabelsMap[structure] = t(structure)})
        const clientsList = ['contact_business_id', 'name', 'language', 'rating', 'notes', 'labels']
        const structureClientsMap:{[key:string]:string} = {}
        clientsList.forEach((structure, index) => {structureClientsMap[structure] = t(structure)})
        const businessList = ['name', 'domain', 'notes', 'labels']
        const structureBusinessMap:{[key:string]:string} = {}
        businessList.forEach((structure, index) => {structureBusinessMap[structure] = t(structure)})

        switch (showNodesAction?.actionType) {

            case 'condition':
                {
                const [branchData, setBranchData] = useState<Branch>(node?.data.branches[showNodesAction?.actionData.index])
                useEffect(()=> {
                    editBranch(showNodesAction?.nodeId, showNodesAction?.actionData.index, 'edit', branchData)
                },[branchData])
        
                const editBranchData = (index: number | undefined, type: 'add' | 'remove' | 'edit', newCondition?: { variable_index: number, operation: string, value: any }) => {
                    setBranchData((branch) => {
                        let updatedConditions
                        if (type === 'remove') updatedConditions = branch.conditions.filter((_, idx: number) => idx !== index)
                        else if (type === 'add') updatedConditions = [...branch.conditions, { variable_index: 0, operation: 'eq', value: null }]
                        else if (type === 'edit' && newCondition) {
                            updatedConditions = branch.conditions.map((con, idx) => {
                                if (idx === index) return newCondition
                                return con
                            })
                        } 
                        else updatedConditions = branch.conditions
                        return { ...branch, conditions: updatedConditions }
                    })
                }
                 
                const variablesLabelsMap:{[key:number]:string} = {}
                flowVariables.forEach((variable, index) => {variablesLabelsMap[index] = t(flowVariables[index].name)})
                
                const columnInequalities = {'bool':['eq', 'exists'], 'int':['leq', 'geq', 'eq', 'neq', 'in', 'nin', 'exists'], 'float':['leq', 'geq', 'eq', 'neq', 'in', 'nin', 'exists'], 'str':['eq', 'neq', 'in', 'nin', 'contains', 'ncontains', 'exists'], 'timestamp':['geq', 'leq', 'eq', 'neq', 'exists'], 'list':['contains', 'ncontains', 'exists'], 'json':['contains', 'ncontains', 'exists'] }
                const inequalitiesMap = {"eq":t('eq'), "neq": t('neq'), "leq": t('leq'), "geq": t('geq'), "in":t('in'), "nin":t('nin'), "contains": t('contains'), "ncontains": t('ncontains'), "exists":t('exists')}

                return (
                    <Box ref={scrollRef} overflow={'scroll'}  p='30px'>
                        <EditText value={branchData.name} setValue={(value:string) => setBranchData((prev) => ({...prev, name:value}))} placeholder={t('AddBranchName')}/>
                        <Box bg='gray.300' width={'100%'} height={'1px'} mt='2vh' mb='2vh'/>
                        {flowVariables.length === 0?<Text fontSize={'.9em'}>{t('NoVariablesSelected')}</Text>:<> 
                        
                        {branchData.conditions.map((condition:{variable_index:number, operation:string, value:any}, index:number) => (<> 

                            <Flex mt='.5vh'  key={`conditions-${index}`} alignItems='center' gap='20px'>
                                <Box flex='5'> 
                                    <CustomSelect containerRef={scrollRef} hide={false} selectedItem={condition.variable_index} setSelectedItem={(value) => editBranchData(index, 'edit',{...condition, variable_index:value, value:''})} options={Array.from({length: flowVariables.length}, (v, i) => i)} labelsMap={variablesLabelsMap} />
                                </Box>
                                <Box flex='4'>
                                    <CustomSelect containerRef={scrollRef} labelsMap={inequalitiesMap} hide={false} selectedItem={condition.operation} setSelectedItem={(value) => editBranchData(index, 'edit',{...condition, operation:value})} options={columnInequalities[flowVariables[condition.variable_index].type]}/>
                                </Box>
                                {condition.operation !== 'exists' && <Box flex='5'>
                                    <InputType inputType={flowVariables[condition.variable_index].type} value={condition.value} setValue={(value) => editBranchData(index, 'edit',{...condition, value})}/>
                                </Box>}
                                <IconButton bg='transaprent' border='none' size='sm' _hover={{bg:'gray.200'}} icon={<RxCross2/>} aria-label='delete-all-condition' onClick={() => editBranchData(index, 'remove')}/>
                            </Flex>
                            {index !== branchData.conditions.length - 1 && <Text mt='1vh' mb='1vh' fontWeight='medium' textAlign={'center'}>{t('And')}</Text>}
                        </>))}
                        <Button size='sm' mt='2vh' leftIcon={<FaPlus/>} onClick={() => editBranchData(0, 'add')}>{t('AddCondition')}</Button>
                        </>}
                    </Box>                    
                )
            }

            case 'extract': {
                const [messageData, setMessageData] = useState<{index:number, message:FlowMessage, require_confirmation:boolean, confirmation_message:FlowMessage}>(node?.data.variables[showNodesAction?.actionData.index])
                
                const [instructionMessage, setInstructionMessage] = useState<FlowMessage>(messageData.message)
                const [confirmationMessage, setConfirmationMessage] = useState<FlowMessage>(messageData.confirmation_message)

                useEffect(()=> {
                    setMessageData(prev => ({...prev, confirmation_message:confirmationMessage}))
                },[confirmationMessage])

                useEffect(()=> {
                    setMessageData(prev => ({...prev, message:instructionMessage}))
                },[instructionMessage])

                useEffect(()=> {
                    editExtractor(showNodesAction?.nodeId, showNodesAction?.actionData.index, 'edit', messageData)
                },[messageData])

                const variablesLabelsMap:{[key:number]:string} = {}
                flowVariables.forEach((variable, index) => {variablesLabelsMap[index] = t(flowVariables[index].name)})

                return (
                <Box ref={scrollRef} overflow={'scroll'}  p='30px'>
                    {flowVariables.length === 0?<Text fontSize={'.9em'}>{t('NoVariablesSelected')}</Text>:<> 
                    <Text mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('VariableType')}</Text>
                    <CustomSelect containerRef={scrollRef} hide={false} selectedItem={messageData.index} setSelectedItem={(value) => setMessageData((prev) => ({...prev, index: value}))} options={Array.from({length: flowVariables.length}, (v, i) => i)} labelsMap={variablesLabelsMap} />
                    <Box bg='gray.300' width={'100%'} height={'1px'} mt='2vh' mb='2vh'/>
                    
                    <Text color='black' fontWeight={'medium'}>{t('VariableInstructions')}</Text>        
                    <EditMessage scrollRef={scrollRef} messageData={instructionMessage} setMessageData={setInstructionMessage}/>
               
                    <Text color='black' mt='3vh' fontWeight={'medium'}>{t('AskConfirmation')}</Text>        
                    <Flex gap='10px' mt='5px'>
                        <Button bg={messageData.require_confirmation?'brand.gradient_blue':'gray.200'} color={messageData.require_confirmation?'white':'black'} size='sm' _hover={{bg:messageData.require_confirmation?'brand.gradient_blue_hover':'gray.300'}} onClick={() => setMessageData((prev) => ({...prev, require_confirmation:true}))}>{t('Yes')}</Button>
                        <Button bg={!messageData.require_confirmation?'brand.gradient_blue':'gray.200'} color={!messageData.require_confirmation?'white':'black'} size='sm' _hover={{bg:!messageData.require_confirmation?'brand.gradient_blue_hover':'gray.300'}} onClick={() => setMessageData((prev) => ({...prev, require_confirmation:false}))}>{t('No')}</Button>
                    </Flex> 
                     
                    {messageData.require_confirmation && <>
                        <Text  mt='3vh'  color='black'  fontWeight={'medium'}>{t('ConfirmationMessage')}</Text>
                        <EditMessage scrollRef={scrollRef} messageData={confirmationMessage} setMessageData={setConfirmationMessage}/>
                    </>}
                    </>}
                </Box>)
            }

            case 'message': {

                const [messageData, setMessageData] = useState<FlowMessage>(node?.data.messages[showNodesAction?.actionData.index])
                useEffect(()=> {
                    editMessage(showNodesAction?.nodeId, showNodesAction?.actionData.index, 'edit', messageData)
                },[messageData])
       
                return (
                <Box ref={scrollRef} overflow={'scroll'}  p='30px'>
                    <EditMessage scrollRef={scrollRef} messageData={messageData} setMessageData={setMessageData}/>
                </Box>)
            }

            case 'flow_result':
                const [flowResult, setFlowResult] = useState<string>(node?.data.flow_result)
                useEffect(()=> {
                    editSimpleFlowData(showNodesAction?.nodeId, 'flow_result', flowResult)
                },[flowResult])

                return(
                <Box ref={scrollRef} overflow={'scroll'}  p='30px'>
                    <Text mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('FlowResult')}</Text>
                    <Textarea mt='5px'  maxLength={2000} height={'auto'} placeholder={`${t('FlowResultPlaceholder')}...`} maxH='300px' value={flowResult} onChange={(e) => setFlowResult(e.target.value)} p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "rgb(77, 144, 254)", borderWidth: "2px"}}/>
                </Box>
                )

            case 'edit_fields':

                //BOOLEAN FOR NOT CHANGING THE VALUE ON FIRST RENDER
                const firstRender = useRef<boolean>(true)

                //MAPPING CONSTANTS
                const operationTypesDict = {'user_id':['set'], 'group_id':['set'], 'channel_type':['set'], 'title':['set', 'concatenate'], 'subject':['set'], 'urgency_rating':['set', 'add', 'substract'], 'status':['set'], 'unseen_changes':['set'], 'tags':['append', 'remove'], 'is_matilda_engaged':['set'],'is_satisfaction_offered':['set'],
                'contact_business_id':['set'], 'name':['set', 'concatenate'], 'language':['set'], 'rating':['set', 'add', 'substract'], 'notes':['set', 'concatenate'], 'labels':['append', 'remove'],
                'domain':['set', 'concatenate']
                }
                const operationLabelsMap = {'set':t('set'), 'add':t('add'), 'substract':t('substract'), 'concatenate':t('concatenate'), 'append':t('append'), 'remove':t('remove')}

                //FETCH DATA LOGIC
                const [fieldsData, setFieldsData] = useState<FieldAction>(node?.data.updates[showNodesAction?.actionData.index])
                useEffect(()=> {
                    editFieldAction(showNodesAction?.nodeId, showNodesAction?.actionData.index, 'edit', fieldsData)
                },[fieldsData])

                //NAMES TO SELECT ON CHANGE MOTHERSTRUCTURE
                const selectableNames = fieldsData.motherstructure === 'ticket' ? ticketsList : fieldsData.motherstructure === 'client' ? clientsList : businessList
                const selectableDict = fieldsData.motherstructure === 'ticket' ? ticketsLabelsMap : fieldsData.motherstructure === 'client' ? structureClientsMap : structureBusinessMap
                useEffect(()=> {
                    if (firstRender.current === false) setFieldsData((prev) => ({...prev, value:''}))
                    else firstRender.current = false 
                },[fieldsData.name])

                return(
                    <Box ref={scrollRef} overflow={'scroll'}  p='30px'>
         
                        <Text mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('StructureUpdate')}</Text>
                        <CustomSelect containerRef={scrollRef} hide={false} selectedItem={fieldsData.motherstructure} setSelectedItem={(value) => setFieldsData((prev) => ({...prev, motherstructure:value}))} options={structureList} labelsMap={structureLabelsMap} />
                        <Text mt='1vh' mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('IsCustomizable')}</Text>
                        <Flex gap='10px' mt='5px'>
                            <Button bg={fieldsData.is_customizable?'brand.gradient_blue':'gray.200'} color={fieldsData.is_customizable?'white':'black'} size='sm' _hover={{bg:fieldsData.is_customizable?'brand.gradient_blue_hover':'gray.300'}} onClick={() => setFieldsData((prev) => ({...prev, is_customizable:true}))}>{t('Yes')}</Button>
                            <Button bg={!fieldsData.is_customizable?'brand.gradient_blue':'gray.200'} color={!fieldsData.is_customizable?'white':'black'} size='sm' _hover={{bg:!fieldsData.is_customizable?'brand.gradient_blue_hover':'gray.300'}} onClick={() => setFieldsData((prev) => ({...prev, is_customizable:false}))}>{t('No')}</Button>
                        </Flex> 
                        <Text mt='1vh' mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('ActionDefinition')}</Text>
                        {fieldsData.is_customizable? <Text></Text>:
                        
                        <Flex alignItems={'center'} gap='10px'>
                            <Box flex='1'> 
                                <CustomSelect containerRef={scrollRef} hide={false} selectedItem={fieldsData.op} setSelectedItem={(value) => setFieldsData((prev) => ({...prev, op:value}))} options={(operationTypesDict[fieldsData.name as keyof typeof operationTypesDict] || [])} labelsMap={operationLabelsMap} />
                            </Box>
                            <Box flex='1'> 
                                <CustomSelect containerRef={scrollRef} hide={false} selectedItem={fieldsData.name} setSelectedItem={(value) => setFieldsData((prev) => ({...prev, name:value}))} options={selectableNames} labelsMap={selectableDict} />
                            </Box>
                            <Text>{t(`${fieldsData.op}_2`)}</Text>
                            <Box flex='1'> 
                                <VariableTypeChanger inputType={fieldsData.name} value={fieldsData.value} setValue={(value) => setFieldsData((prev) => ({...prev, value}))}/>
                            </Box>
                        </Flex>}
                    </Box>
                )

            case 'function':
   
                //BOOLEAN FOR NOT CHANGING THE VALUE ON FIRST RENDER
                const firstRender2 = useRef<boolean>(true)
                const auth = useAuth()

                //FLOW VARIABLES MAP
                const variablesLabelsMap:{[key:number]:string} = {}
                flowVariables.forEach((variable, index) => {variablesLabelsMap[index] = t(flowVariables[index].name)})
                const [waiting,setWaiting] = useState<boolean>(false)

                //CONVERTING THE NDOE DATA TO MANIPULATE IT
                const { functions, ...rest } = node?.data 
                const [functionData, setFunctionData] = useState<FunctionType>(rest)

                useEffect(()=> {editFunctionFlowData(showNodesAction?.nodeId, functionData)},[functionData])

                //SELECTABLE ARGS, BASED ON THE FUNCTGION UUID AND THE ARGS THAT ARE ALREADY SELECTED 
                const [argsToSelect, setArgsToSelect] = useState<string[]>([])
                const [outputsToSelect, setOutputsToSelect] = useState<string[]>([])

                useEffect(() => {        
                    const fetchInitialData = async() => {
 
                        const functionResponse = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/functions/${functionData.uuid}`, setWaiting, auth})
                        console.log(functionResponse)
                        if (functionResponse?.status === 200) {
                            const dictArgs = functionResponse.data.arguments.map((arg:any) => {return arg.name})
                            const dictOutputs = functionResponse.data.outputs.map((arg:any) => {return arg.name})

                            console.log(functionResponse)
                            setArgsToSelect(dictArgs)
                            setOutputsToSelect(dictOutputs)
                        }
                    }
                    if (functionData.uuid) fetchInitialData() 
                    if (!firstRender2.current) setFunctionData({uuid:functionData.uuid, variable_args:{}, motherstructure_args:{}, hardcoded_args:{}, error_nodes_ids:{}, next_node_index:null, output_to_variables:{}})
                    else firstRender2.current = false
                }, [functionData.uuid])

                //SELECTABLE ARGUMENTS AND OUTPUTS
                const selectedArgs = Object.keys((functionData?.variable_args || [])).concat(Object.keys((functionData?.motherstructure_args || []))).concat(Object.keys((functionData?.hardcoded_args || [])))
                let selectableArgs:string[]  = []
                if (functionData.uuid !== '' && argsToSelect !== undefined) selectableArgs = argsToSelect.filter(arg => !selectedArgs.includes(arg))
                const selectedOutputs = Object.keys((functionData.output_to_variables || []))
                let selectableOutputs:string[]  = []
                if (functionData.uuid !== '' && outputsToSelect !== undefined) selectableOutputs = outputsToSelect.filter(arg => !selectedOutputs.includes(arg))

                //FUNCTION FOR EDITING ARGS
                const editArg = (argType:'variable_args' | 'motherstructure_args' | 'hardcoded_args' | 'output_to_variables', type:'add' | 'edit' | 'remove', argKey?:string,  newValue?:any) => {
                    
                    if (type === 'add' && (argType === 'output_to_variables'?selectableOutputs:selectableArgs).length > 0) {
                        setFunctionData((prev) => ({...prev, [argType]: {...prev[argType], [(argType === 'output_to_variables'?selectableOutputs:selectableArgs)[0]]: argType === 'motherstructure_args' ? { motherstructure: 'ticket', is_customizable: false, name: 'user_id' }: -1 }}))
                    } 
                    else if (type === 'remove' && argKey !== undefined) {
                        setFunctionData((prev) => {
                            const updatedArgType = { ...prev[argType] }
                            delete updatedArgType[argKey]
                            return {...prev, [argType]: updatedArgType}
                        })
                    }
                    else if (type === 'edit'  && argKey !== undefined   && newValue !== undefined) {
                        setFunctionData((prev) => {
                            const updatedArgType = { ...prev[argType] }
                            updatedArgType[argKey] = newValue
                            return {...prev, [argType]: updatedArgType}
                        })
                    }

                }   

                //BUTTON FOR ADDING A NEW ARG
                const AddArgButton = ({argType}:{argType:'variable_args' | 'motherstructure_args' | 'hardcoded_args' | 'output_to_variables'}) => {

                    //SHOW AND HIDE BOX LOGIC
                    const boxRef = useRef<HTMLDivElement>(null)
                    const buttonRef = useRef<HTMLButtonElement>(null)
                    const [showAdd, setShowAdd] = useState<boolean>(false)
                    useOutsideClick({ref1:buttonRef, ref2:boxRef, containerRef:scrollRef, onOutsideClick:setShowAdd})
                    const [boxPosition, setBoxPosition] = useState<'top' | 'bottom'>('bottom')
                    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
                    determineBoxStyle({buttonRef, setBoxStyle, setBoxPosition, changeVariable:showAdd})
                    
                    //FRONT
                    return (
                        <Flex mt='2vh' flexDir={'row-reverse'}>
                            <Button ref={buttonRef} onClick={() => setShowAdd(true)} leftIcon={<FaPlus/>} size={'sm'}>{argType === 'output_to_variables' ? t('AddOutput'):t('AddArg')}</Button> 
                            <AnimatePresence> 
                                {showAdd && 
                                <Portal>
                                    <MotionBox initial={{ opacity: 0, marginTop: boxPosition === 'bottom'?-10:10 }} animate={{ opacity: 1, marginTop: 0 }}  exit={{ opacity: 0,marginTop: boxPosition === 'bottom'?-10:10}} transition={{ duration: '0.2',  ease: 'easeOut'}}
                                    top={boxStyle.top} bottom={boxStyle.bottom}right={boxStyle.right} width={boxStyle.width} maxH='40vh' overflow={'scroll'} gap='10px' ref={boxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000} position={'absolute'} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.300'}>
                                        {(argType === 'output_to_variables' ? selectableOutputs:selectableArgs).map((arg, index) => (
                                            <Flex p='5px' _hover={{bg:'brand.hover_gray'}} key={`arg-${index}`} onClick={() => {setShowAdd(false);editArg(argType, 'add')}}>
                                                <Text fontSize={'.9em'}>{arg}</Text>
                                            </Flex>
                                        ))}
                                    </MotionBox>
                                </Portal>
                            }
                        </AnimatePresence>
                        </Flex>

                    )
                }

                //COMPONENT FOR THE MOTHERSTRUCTURE ARGS
                const MotherStructureArg = ({selectedArg, keyToEdit}:{selectedArg:{motherstructure:'ticket' | 'client' | 'contact_business',is_customizable:boolean, name:string}, keyToEdit:string}) => {

                    const selectableNames2 = selectedArg.motherstructure === 'ticket' ? ticketsList : selectedArg.motherstructure === 'client' ? clientsList : businessList
                    const selectableDict2 = selectedArg.motherstructure === 'ticket' ? ticketsLabelsMap : selectedArg.motherstructure === 'client' ? structureClientsMap : structureBusinessMap
    
                
                    return (
                    <> 
                        <Text mb='.5vh' mt='1vh' color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('StructureUpdate')}</Text>
                        <CustomSelect containerRef={scrollRef} hide={false} selectedItem={selectedArg.motherstructure} setSelectedItem={(value) => editArg('motherstructure_args', 'edit', keyToEdit, {...functionData.motherstructure_args[keyToEdit], motherstructure:value})} options={structureList} labelsMap={structureLabelsMap} />

                        <Text mt='1vh'  mb='.5vh' color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('IsCustomizable')}</Text>
                        <Flex gap='10px' >
                            <Button bg={selectedArg.is_customizable?'brand.gradient_blue':'gray.200'} color={selectedArg.is_customizable?'white':'black'} size='xs' _hover={{bg:selectedArg.is_customizable?'brand.gradient_blue_hover':'gray.300'}} onClick={() => editArg('motherstructure_args', 'edit', keyToEdit, {...functionData.motherstructure_args[keyToEdit], is_customizable:true})} >{t('Yes')}</Button>
                            <Button bg={!selectedArg.is_customizable?'brand.gradient_blue':'gray.200'} color={!selectedArg.is_customizable?'white':'black'} size='xs' _hover={{bg:!selectedArg.is_customizable?'brand.gradient_blue_hover':'gray.300'}} onClick={() => editArg('motherstructure_args', 'edit', keyToEdit, {...functionData.motherstructure_args[keyToEdit], is_customizable:false})} >{t('No')}</Button>
                        </Flex>
                        
                        <Text mb='.5vh' mt='1vh' color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('StructureName')}</Text>
                        {selectedArg.is_customizable? <Text></Text>: 
                            <CustomSelect containerRef={scrollRef} hide={false} selectedItem={functionData.motherstructure_args[keyToEdit].name} setSelectedItem={(value) => editArg('motherstructure_args', 'edit', keyToEdit, {...functionData.motherstructure_args[keyToEdit], name:value})}  options={selectableNames2} labelsMap={selectableDict2} />
                        }
                    </>)

                }
                
                return (
                    <Box ref={scrollRef} overflowY={'scroll'} p='30px'>
                        <Text mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('FunctionToSelect')}</Text>
                        <CustomSelect containerRef={scrollRef} hide={false} selectedItem={functionData.uuid} setSelectedItem={(value) => setFunctionData((prev) => ({...prev, uuid:value}))} options={flowsFunctions} labelsMap={functionsNameMap.current} />
                        <Skeleton isLoaded={!waiting}> 
                            {functionData.uuid !== '' && <>
                                <Text mt='2vh' mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('VariableArgs')}</Text>
                                {Object.keys(functionData.variable_args).map((keyToEdit, index) => (
                                    <Flex mt='1vh' gap='20px' key={`variable-args-${index}`} alignItems={'center'}>
                                        <Text  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} flex='1' fontWeight={'medium'} >{keyToEdit}</Text>
                                        <Box flex='2'> 
                                            <CustomSelect containerRef={scrollRef} hide={false} selectedItem={functionData.variable_args[keyToEdit]} setSelectedItem={(value) => editArg('variable_args', 'edit', keyToEdit, value )} options={Array.from({length: flowVariables.length}, (v, i) => i)} labelsMap={variablesLabelsMap} />
                                        </Box>
                                        <IconButton bg='transaprent' border='none' size='sm' _hover={{bg:'gray.200'}} icon={<RxCross2/>} aria-label='delete-arg-1' onClick={() => editArg('variable_args', 'remove', keyToEdit)}/>
                                    </Flex>
                                    
                                ))}  
                                <AddArgButton argType={'variable_args'}/>

                                <Text mt='2vh' mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('StructureArgs')}</Text>
                                {Object.keys(functionData?.motherstructure_args || []).map((keyToEdit, index) => (
                                    <Box  mt='1vh'  key={`motherstructure-args-${index}`} bg='white' borderRadius={'.5em'}  p='15px' boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.15)'}> 
                                        <Flex justifyContent={'space-between'} alignItems={'center'}> 
                                            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} flex='1' fontWeight={'medium'} >{keyToEdit}</Text>
                                            <IconButton bg='transaprent' border='none' size='sm' _hover={{bg:'gray.200'}} icon={<RxCross2/>} aria-label='delete-arg-2' onClick={() => editArg('motherstructure_args', 'remove', keyToEdit)}/>
                                        </Flex>
                                        <MotherStructureArg selectedArg={functionData.motherstructure_args[keyToEdit]} keyToEdit={keyToEdit}/>
                                    </Box>
                                ))}  
                                <AddArgButton argType={'motherstructure_args'}/>

                                <Text  mt='2vh' mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('HarcodedArgs')}</Text>
                                {Object.keys(functionData?.hardcoded_args || []).map((keyToEdit, index) => (
                                    <Flex  mt='1vh'  gap='20px' key={`hardcoded-args-${index}`} alignItems={'center'}>
                                        <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} flex='1' fontWeight={'medium'} >{keyToEdit}</Text>
                                        <Box flex='2'> 
                                            <EditText hideInput={false} value={functionData.hardcoded_args[keyToEdit]} setValue={(value:string) => editArg('hardcoded_args', 'edit', keyToEdit, value )}/>
                                        </Box>
                                        <IconButton bg='transaprent' border='none' size='sm' _hover={{bg:'gray.200'}} icon={<RxCross2/>} aria-label='delete-arg-3' onClick={() => editArg('hardcoded_args', 'remove', keyToEdit)}/>
                                    </Flex>
                                ))}    
                                <AddArgButton argType={'hardcoded_args'}/>

                                <Text  mt='2vh' mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('OutputArgs')}</Text>
                                {Object.keys(functionData?.output_to_variables || []).map((keyToEdit, index) => (
                                    <Flex  mt='1vh'  gap='20px' key={`output-args-${index}`} alignItems={'center'}>
                                        <Text  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} flex='1' fontWeight={'medium'} >{keyToEdit}</Text>
                                        <Box flex='2'> 
                                            <CustomSelect containerRef={scrollRef} hide={false} selectedItem={functionData.output_to_variables[keyToEdit]} setSelectedItem={(value) => editArg('output_to_variables', 'edit', keyToEdit, value )} options={Array.from({length: flowVariables.length}, (v, i) => i)} labelsMap={variablesLabelsMap} />
                                        </Box>
                                        <IconButton bg='transaprent' border='none' size='sm' _hover={{bg:'gray.200'}} icon={<RxCross2/>} aria-label='delete-output' onClick={() => editArg('output_to_variables', 'remove', keyToEdit)}/>
                                    </Flex>
                                ))}    
                                <AddArgButton argType={'output_to_variables'}/>
                            </>}
                        </Skeleton>
                    </Box>)
                 
            default: return <></>
        
        }
    }

    //MEMOIZED NODE EDITOR
    const memoizedNodesEditor = useMemo(() => (
        <AnimatePresence> 
        {showNodesAction && <>
            <MotionBox initial={{right:-1000}} animate={{right:0}}  exit={{right:-1000}} transition={{ duration: '.2' }} position='fixed' top={0} width='700px' height='100vh'  backgroundColor='white' zIndex={201} display='flex' justifyContent='space-between' flexDirection='column'> 
                <NodesEditBox/>
            </MotionBox>
         </>}
    </AnimatePresence>
    ), [showNodesAction])

    //MEMOIZED CREATE VARIABLE BOX
    const memoizedCreateVariable = useMemo(() => (<> 
        {variableToEdit && 
            <ConfirmBox setShowBox={(b:boolean) => setVariableToEdit(null)} isSectionWithoutHeader={true}> 
                <CreateVariable variableData={variableToEdit} setFlowVariables={setFlowVariables} setVariableToEdit={setVariableToEdit}/>
            </ConfirmBox>
         }
     </>), [variableToEdit])

    //MEMOIZED TEST BOX COMPONENT
    const memoizedTestBox = useMemo(() => (<> 
        {showTest && 
            <ConfirmBox max maxW={'80vw'} setShowBox={setShowTest} isSectionWithoutHeader={true}> 
                <TestChat flowId={location.split('/')[location.split('/').length - 1]} channelIds={nodes[0].data.channels} flowName={flowName}  channelsList={channelsListRef.current} currentChannelId={currentChannelIdRef} currentMessages={currentMessagesRef} currentFlowIndex={currentFlowIndexRef} setShowTest={setShowTest}/>
            </ConfirmBox>
         }
     </>), [showTest, nodes, flowName])

    //WARNIGNS COMPONENT
    const WarningsComponent = () => {

        //ICON REF
        const iconRef = useRef<HTMLDivElement>(null)
        const session = useSession()

        //CONFORM DELETION BOOLEAN
        const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)

        //WAITING SAVE CHANGES
        const [waitingSave, setWaitingSave] = useState<boolean>(false)

        //SHOW WARNINGS BOX LOGIC
        const [showWarningBox, setShowWarningBox] = useState<boolean>(false)
        const timeoutRef = useRef<NodeJS.Timeout | null>(null)
        const handleMouseEnter = () => {if (timeoutRef.current) clearTimeout(timeoutRef.current);setShowWarningBox(true)}
        const handleMouseLeave = () => {timeoutRef.current = setTimeout(() => {setShowWarningBox(false)}, 100)}

        //WARNINGS TYPES
        const [endWarning, setEndWarning] = useState<{id:string, type:nodeTypesDefinition}[]>([])
        const [aloneWarning, setAloneWarning] = useState<string[]>([])
        const [nodeWarning, setNodeWarning] = useState<{id:string, type:nodeTypesDefinition, warningData?:{branchIndex:number, type:'condition' | 'next_node'}}[]>([])

        //UPDATE DIFFERENT TYPES OF WARNINGS
        useLayoutEffect(() => {
            if (nodes[1].type !== 'add') {
                const result = nodes.filter(node => (!['terminator', 'transfer', 'flow_swap', 'function', 'brancher', 'extractor'].includes(node.type as nodeTypesDefinition) && node.data.next_node_index === null)).map(node => ({ id: node.id, type: node.type as nodeTypesDefinition}))
                setEndWarning(result)
            }
        }, [nodes.length])
        useLayoutEffect(() => {
            if (nodes[1].type !== 'add') {
                const targetIds = new Set(edges.map(edge => edge.target))
                const isolatedNodes = nodes.filter(node => node.id !== '0' && !targetIds.has(node.id)).map(node => node.id)
                setAloneWarning(isolatedNodes)
            }
        }, [edges, nodes])
        useLayoutEffect(() => {
            let customNodesWarnings:{id:string, type:nodeTypesDefinition, warningData?:{branchIndex:number, type:'condition' | 'next_node'}}[] = []
            nodes.map((node) => {
                if (node.type === 'brancher' || node.type === 'extractor') {
                    if (flowVariables.length === 0) customNodesWarnings.push({id:node.id, type:node.type as nodeTypesDefinition})
                    node.data.branches.map((branch:Branch, index:number) => {
                        if (branch.conditions.length === 0) customNodesWarnings.push({id:node.id, type:node.type as nodeTypesDefinition, warningData:{branchIndex:index, type:'condition'}})
                        if (branch.next_node_index === null) customNodesWarnings.push({id:node.id, type:node.type as nodeTypesDefinition, warningData:{branchIndex:index, type:'next_node'}})
                    })
                }
                else if (node.type === 'reset' && flowVariables.length === 0) customNodesWarnings.push({id:node.id, type:node.type as nodeTypesDefinition})
                else if (node.type === 'flow_swap' && node.data.new_flow_uuid === null) customNodesWarnings.push({id:node.id, type:node.type as nodeTypesDefinition})
                else if (node.type === 'function' && node.data.uuid === null) customNodesWarnings.push({id:node.id, type:node.type as nodeTypesDefinition})
            })
            setNodeWarning(customNodesWarnings)
        }, [nodes, flowVariables.length])

        //ACTION ON CLICKNG A WARNING
        const clickWarning = (type:'navigate' | 'open-variables', nodeId?:string) => {
            if (type === 'navigate') {
                setShowWarningBox(false)
                if (nodes.length > 0) {
                    const node = nodes.find(node => node.id === nodeId)
                    if (node) {
                        const x = node.position.x + (node?.width || 0) / 2;
                        const y = node.position.y + (node?.height || 0) / 2;
                        setCenter(x, y, { zoom:1.5, duration: 500 })
                    }
                }
             }
            else if (type === 'open-variables') {setShowMoreInfo(true);setShowWarningBox(false)}

        }

        //OBTAIN THE TEXT MESSAGE OF EACH NODE WARNING
        const nodesWarningsTypes = (warningObject:{id:string, type:nodeTypesDefinition, warningData?:{branchIndex:number}}) => {

            const nodeId = warningObject.id.split('-')[2]
            switch (warningObject.type) {
                case 'brancher':
                case 'extractor': {
                    if (warningObject.warningData === undefined) return t('NoVariablesWarning', {id:nodeId})
                    else return t('BranchesWarning',  {id:nodeId, index:warningObject.warningData.branchIndex})
                }
                case 'transfer':
                    return t('NoTransferWarning', {id:nodeId})
                case 'reset':
                    return t('NoVariablesResetWarning', {id:nodeId})
                case 'flow_swap':
                    return t('NoFlowWarning', {id:nodeId})
                case 'transfer':
                    return t('NoTransferWarning', {id:nodeId})
                default: return ''
            }
        }

        //TOTAL NUMBER OF WARNINGS
        const numberOfWarnings = endWarning.length + aloneWarning.length + nodeWarning.length 

        //BOX FOR DELETE THE NODE
        const DeleteComponent = () => {

            //WAITING DELETION
            const [waitingDelete, setWaitingDelete] = useState<boolean>(false)
    
            //FUNCTION FOR DELETING AN AUTOMATION
            const deleteFlow = async () => {
                session.dispatch({type:'DELETE_FLOWS'})
                const flowId = location.split('/')[location.split('/').length - 1]
                const response = await fetchData({endpoint: `superservice/${auth.authData.organizationId}/admin/flows/${flowId}`, method: 'delete', setWaiting: setWaitingDelete, auth, toastMessages: {works: t('CorrectDeletedFlow'), failed: t('FailedDeletedFlow')}})
                if (response?.status === 200) {
                     navigate(-1)
                }
            }
    
            //FRONT
            return(<>
                <Box p='15px'> 
                    <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('ConfirmDelete')}</Text>
                    <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                    <Text >{t('ConfirmDeleteFlow')}</Text>
                </Box>
                <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                    <Button  size='sm' colorScheme='red' onClick={deleteFlow}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                    <Button  size='sm' onClick={()=>setShowConfirmDelete(false)}>{t('Cancel')}</Button>
                </Flex>
            </>)
        }
    
        //SAVE CHANGES
        const saveChanges = async () => {
            setWaitingSave(true)
            const flowId = location.split('/')[location.split('/').length - 1]
            const parsedNodes = parseDataToBack(nodes)
            const newFlow = {is_active:isActiveRef.current, name:flowName, description:flowDescription, variables:flowVariables, interpreter_configuration:flowInterpreterConfig, nodes:parsedNodes.nodes, channel_ids:parsedNodes.channels }
            if (location.endsWith('create')) {
                session.dispatch({type:'DELETE_FLOWS'})
                const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/flows`, auth, method:'post', setWaiting:setWaitingSave, requestForm:newFlow, toastMessages:{works:t('CorrectCreateFlow'), failed:t('FailedCreateFlow')}})
                if (response?.status === 200) {
                     navigate(-1)
                }
            }
            else {
                const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/flows/${flowId}`, auth, method:'put', setWaiting:setWaitingSave, requestForm:newFlow, toastMessages:{works:t('CorrectEditedFlow'), failed:t('FailedEditedFlow')}})
                initialNodesRef.current = nodes
            }   
        }

        //DELETE BOX
        const memoizedDeleteBox = useMemo(() => (
            <ConfirmBox setShowBox={setShowConfirmDelete} isSectionWithoutHeader> 
                <DeleteComponent/>
            </ConfirmBox>
        ), [showConfirmDelete])

        //MEMOIZED CREATE VARIABLE BOX
        const memoizedNoSavedWarning = useMemo(() => (<> 
        {showNoSaveWarning && 
                <ConfirmBox setShowBox={setShowNoSaveWarning} isSectionWithoutHeader> 
                    <Box p='15px' > 
                        <Text fontWeight={'medium'}>{t('NoSavedChanges')}</Text>
                        <Text mt={'.5vh'}>{t('NoSavedChangeAnswer')}</Text>
                    </Box>
                    <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                        <Button  size='sm' color={'white'} bg='brand.gradient_blue'  _hover={{bg:'brand.gradient_blue_hover'}}   onClick={() => {saveChanges();navigate('/flows-functions/flows')}}>{waitingSave?<LoadingIconButton/>:t('SaveAndExit')}</Button>
                        <Button  size='sm' colorScheme='red' onClick={() => navigate('/flows-functions/flows')}>{t('NoSave')}</Button>
                    </Flex>
                </ConfirmBox>
        
            }
        </>), [showNoSaveWarning])

        //FRONT
        return (
            <>
            {showConfirmDelete && memoizedDeleteBox}
            {memoizedNoSavedWarning}

            <Flex gap='15px'  position={'absolute'} right={'2vw'} top='2vw' zIndex={100}  > 
                {numberOfWarnings > 0 && 
                <Flex position={'relative'} onMouseEnter={handleMouseEnter}  onMouseLeave={handleMouseLeave}  >   
                    <Box p='2px' ref={iconRef} bg='gray.100' position='absolute' borderRadius={'13px'}   bottom={'-7px'} left={'17px'}> 
                        <Flex   justifyContent={'center'} alignItems={'center'} borderRadius={'11px'}  px='5px' height={'15px'}  color='white' bg='red'>
                            <Text fontSize={'.6em'} fontWeight={'bold'}>{numberOfWarnings}</Text>
                        </Flex>
                    </Box>
                    <Icon cursor={'pointer'} color='red' as={IoIosWarning} boxSize={'30px'}/>
                    
                    <AnimatePresence> 
                        {showWarningBox && (
                        <MotionBox initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}  transition={{ duration: '0.1', ease: 'easeIn'}}
                        style={{ transformOrigin: 'top' }} width={`${window.innerWidth * 0.98 - (iconRef.current?.getBoundingClientRect().left || 0)}px`} maxH={'calc(100vh - 4vw - 45px)'} overflow={'scroll'}  position='absolute' bg='transparent' left={0}  top='45px' zIndex={1000}  borderRadius='.5rem' >
                            {endWarning.map((war, index) => (
                                <Flex onClick={() => clickWarning('navigate', war.id)}  cursor={'pointer'} key={`end-warning-${index}`} mt='10px' bg='white' borderWidth={'0px 0px 0px 5px'} borderColor={'#E53E3E'} p='10px' borderRadius={'.5rem'} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' >
                                    <Text fontSize={'.8em'}>{t('EndWarning', {id:war.id.split('-')[2], type:war.type})}</Text>
                                </Flex>
                            ))} 
                            {aloneWarning.map((id, index) => (
                                <Flex onClick={() => clickWarning('navigate', id)}  cursor={'pointer'} key={`end-warning-${index}`} mt='10px' bg='white' borderWidth={'0px 0px 0px 5px'} borderColor={'#E53E3E'} p='10px' borderRadius={'.5rem'} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' >
                                    <Text fontSize={'.8em'}>{t('AloneWarning', {id:id.split('-')[2]})}</Text>
                                </Flex>
                            ))} 
                            {nodeWarning.map((war, index) => {
                                const shouldOpenVariables = ((war.type === 'brancher' || war.type === 'extractor') && war?.warningData === undefined)
                                return(
                                <Flex onClick={() => clickWarning(shouldOpenVariables?'open-variables':'navigate', war.id)}  cursor={'pointer'} key={`end-warning-${index}`} mt='10px' bg='white' borderWidth={'0px 0px 0px 5px'} borderColor={'#E53E3E'} p='10px' borderRadius={'.5rem'} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' >
                                    <Text fontSize={'.8em'}>{nodesWarningsTypes(war)}</Text>
                                </Flex>)
                            })} 
                        </MotionBox>)}
                    </AnimatePresence>
                </Flex>}
                <Button size='sm' bg='transparent' isDisabled={numberOfWarnings > 0} borderColor={'gray.300'} borderWidth={'1px'} onClick={() => setShowTest(true)}>{t('Test')}</Button>
                <Button size='sm' bg='red.400' _hover={{bg:'red.500'}}  color='white' onClick={() => setShowConfirmDelete(true)}>{t('Delete')}</Button>
                <Button size='sm' bg='brand.gradient_blue' isDisabled={numberOfWarnings > 0} _hover={{bg:'brand.gradient_blue_hover'}} color='white' onClick={saveChanges}>{waitingSave? <LoadingIconButton/>:t('SaveChanges')}</Button>
            </Flex>
            </>)
    }

    //FRONT
    return (
        <Flex height={'100vh'} justifyContent={'center'} alignItems={'center'} width={'calc(100vw - 60px)'} flexDir={'column'} bg='white' backdropFilter='blur(1px)' >

            {waiting ? <LoadingIconButton/> :
            <> 
            <Flex flexDir={'column'} left={'1vw'} top='1vw' zIndex={100} position={'absolute'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.1)'} overflow={'hidden'} maxH={'calc(100vh - 2vw)'} width='30vw' bg='white' borderRadius={'.5rem'} borderWidth={'1px'} borderColor={'gray.300'} > 
                <Flex  ref={nameInputRef}  gap='10px' alignItems={'center'} p='10px' justifyContent={'space-between'}> 
                    <Flex flex='1' gap='10px' alignItems={'center'}> 
                        <Tooltip label={t('GoBack')}  placement='bottom' hasArrow bg='black'  color='white'  borderRadius='.4rem' fontSize='.75em' p='4px'> 
                            <IconButton aria-label='go-back' size='sm' bg='transparent' border='none' onClick={() => {if (areArraysDifferent(nodes, initialNodesRef.current)) setShowNoSaveWarning(true);else navigate('/flows-functions/flows')}} icon={<IoIosArrowBack size='20px'/>}/>
                        </Tooltip>
                        <Box flex='1'> 
                            <EditText nameInput={true} hideInput={true} size='md' maxLength={70}  value={flowName} setValue={setFlowName}/>
                        </Box>
                    </Flex>
                    <Button leftIcon={<IoIosArrowDown className={!showMoreInfo ? "rotate-icon-up" : "rotate-icon-down"}/>} size='sm' bg='transparent' borderColor={'transparent'} borderWidth={'1px'} onClick={() => setShowMoreInfo(!showMoreInfo)}>{t('SeeMoreData')}</Button>
                </Flex>

                <AnimatePresence> 
                    {showMoreInfo &&  
                    <motion.div initial={{height:0}}  animate={{height:'auto'}}  exit={{height:0 }}  transition={{duration:'.3', ease:cubicBezier(0.0, 0.9, 0.9, 1.0)}}  style={{overflow:'scroll', maxHeight:`${window.innerHeight - (nameInputRef.current?.getBoundingClientRect().bottom || 0) - window.innerWidth * 0.02}px`}}> 
                        <Box p='15px'>
                            <Text fontSize={'.9em'} color='gray.600' fontWeight={'medium'}>{t('Description')}</Text>
                            <Textarea mt='5px'  maxLength={2000} height={'auto'} placeholder={`${t('Description')}...`} maxH='300px' value={flowDescription} onChange={(e) => setFlowDescription(e.target.value)} p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "rgb(77, 144, 254)", borderWidth: "2px"}}/>
                            <Text mt='2vh' fontSize={'.9em'} color='gray.600' fontWeight={'medium'}>{t('Variables')}</Text>

                            {flowVariables.length === 0 ? <Text mt='1vh' fontSize={'.9em'}>{t('NoVariables')}</Text>:
                                flowVariables.map((variable, index) => (
                                <VariableBox key={`variable-${index}`} variable={variable} index={index} setFlowVariables={setFlowVariables} setVariableToEdit={setVariableToEdit}/>
                            ))} 
                            <Flex flexDir={'row-reverse'} mt='1vh'> 
                                <Button size='sm' leftIcon={<FaPlus/>} mt='1vh'  onClick={() => setVariableToEdit(-1)}>{t('CreateVariable')}</Button>
                            </Flex>
                            <Text mt='2vh' fontSize={'.9em'} color='gray.600' fontWeight={'medium'}>{t('Interpreter_Config')}</Text>
                            <Flex gap='30px'>
                                <Box flex={1} mt='.5vh'>
                                    <Text mb='5px' fontSize={'.8em'} fontWeight={'medium'}>{t('Data_Extraction_Model')}</Text>
                                    <CustomSelect hide={false} selectedItem={flowInterpreterConfig.data_extraction_model} setSelectedItem={(value) => setFlowInterpreterConfig((prev) => ({...prev, data_extraction_model:value  as 'simple' | 'comprehensive'}))} options={Object.keys(dataExtactionDict)}  labelsMap={dataExtactionDict}/>
                                </Box>
                                <Box flex={1} mt='.5vh'>
                                    <Text mb='5px' fontSize={'.8em'} fontWeight={'medium'}>{t('Data_Classification_Model')}</Text>
                                    <CustomSelect hide={false} selectedItem={flowInterpreterConfig.response_classification_model} setSelectedItem={(value) => setFlowInterpreterConfig((prev) => ({...prev ,response_classification_model:value as  'none' | 'simple' | 'comprehensive'}))} options={Object.keys(classificationDict)}  labelsMap={classificationDict}/>
                                </Box>
                            </Flex>
                        </Box>
                        </motion.div>}
                </AnimatePresence>

            </Flex>

            <WarningsComponent/>

            <Box width={'100%'} height={'100%'}bg='gray.100' ref={flowBoxRef} >   
                <ReactFlow nodesDraggable={false} panOnScroll  panOnDrag={panOnDrag} selectionMode={SelectionMode.Partial} defaultViewport={{ x: 100, y: 200, zoom: 1 }}   nodes={nodes} nodeTypes={nodeTypes}  edgeTypes={edgeTypes} onNodesChange={onNodesChange} edges={edges} onEdgesChange={onEdgesChange}>
                    <Controls showFitView={false} showInteractive={false} position='bottom-right'>
                        <ControlButton onClick={() => alert('Something magical just happened. ✨')}>
                        </ControlButton>
                    </Controls>
                    <Background  gap={12} size={1} />
                </ReactFlow>
            </Box>

            {showNodesAction && <motion.div initial={{opacity:0}} onMouseDown={() => setShowNodesAction(null)} animate={{opacity:1}} exit={{opacity:0}}   transition={{ duration: .3 }} style={{backdropFilter: 'blur(1px)', WebkitBackdropFilter: 'blur(1px)',position: 'fixed',top: 0,left: 0,width: '100vw', marginLeft:'-60px',height: '100vh',backgroundColor: 'rgba(0, 0, 0, 0.3)',zIndex: 200}}/>}
            {memoizedNodesEditor}
            {memoizedCreateVariable}
            {memoizedTestBox}
            </>}
        </Flex>
    )
}

export default Flow

//BOX FOR SHOWING EACH VARIABLE
const VariableBox = ({ variable, index, setFlowVariables, setVariableToEdit }:{variable:VariableType,index:number, setFlowVariables:Dispatch<SetStateAction<VariableType[]>>,  setVariableToEdit:Dispatch<SetStateAction<{data:VariableType, index:number} | null | -1 >>}) => {
    
    //TRANSLATION
    const { t }  = useTranslation('flows')

    //MAPPING CONSTANTS
    const variablesMap:{[key in DataTypes]:[string, IconType]} = {'bool':[t('bool'),AiOutlineCheckCircle ], 'int':[t('int'), FiHash], 'float':[t('float'), TbMathFunction], 'str':[t('str'), FiType], 'timestamp':[t('timestamp'), AiOutlineCalendar], 'list':[t('list'), MdOutlineFormatListBulleted]}
    
    //HOVER BOOLEAN
    const [isHovering, setIsHovering] = useState<boolean>(false)

    return (
        <Box position={'relative'} cursor={'pointer'} mt='1vh'  p='10px' boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} borderRadius={'.5em'} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => setVariableToEdit({data:variable, index})}>
            <Flex  gap='5px' alignItems={'center'} >
                <Text fontWeight={'medium'}  fontSize={'1em'} >{variable.name} <span style={{fontSize:'.8em'}}>({variablesMap[variable.type][0]})</span></Text>
                -
                <Flex fontSize={'.8em'} gap='5px' justifyContent={'space-between'} alignItems={'center'}>
                     <Text color={variable.ask_for_confirmation?'green':'red'}  flex={1}>{variable.ask_for_confirmation?t('AskForConfirmation'):t('NoAskForConfirmation')}</Text>
                     <Icon as={variable.ask_for_confirmation?FaCheckCircle:FaTimesCircle} color={variable.ask_for_confirmation?'green':'red'}/>
                </Flex>
            </Flex>
            
            <Text flex={1} mt='.5vh' fontSize={'.8em'} color='gray.600'>{variable.description === ''?t('NoDescription'):variable.description }</Text>

         
            <Flex  mt='.5vh' gap='5px' justifyContent={'space-between'}>
                <Box flex='1'>
                    <Text fontSize={'.8em'} color={'gray.600'} fontWeight={'medium'} flex={1}>{t('Examples')}</Text>
                    <Text fontSize={'.8em'} flex={1}>{variable.examples.length === 0?t('NoDefinedExamples'):variable.examples.map((example, index) => (<span key={`example-${index}`}>{t(example)} {index < variable.examples.length - 1 && ' - '}</span>))}</Text>
                </Box>
                <Box flex='1'>
                    <Text fontSize={'.8em'} color={'gray.600'} fontWeight={'medium'} flex={1}>{t('Values')}</Text>
                    <Text fontSize={'.8em'} flex={1}>{variable.values.length === 0?t('NoValues'):variable.values.map((value, index) => (<span key={`value-${index}`}>{t(value)} {index < variable.examples.length - 1 && ' - '}</span>))}</Text>
                </Box>
            </Flex>
            {(isHovering) && 
            <MotionBox initial={{scale:.5}} animate={{scale:1}} transition={{ type: 'spring', stiffness: '200'  }} display={'flex'} alignItems={'center'}  onClick={(e) => {e.stopPropagation();setFlowVariables((prev) => (prev.filter((_, i) => i !== index)))}} position={'absolute'} borderRadius={'full'} p='5px' top={'-7px'} zIndex={100} bg='white' boxShadow={'0 0 5px 1px rgba(0, 0, 0, 0.15)'} right={'-7px'} justifyContent={'center'} cursor={'pointer'} >
                <Icon boxSize={'13px'} as={BsTrash3Fill} color='red'/>
            </MotionBox>}
        </Box>
        )
}
 //CREATING A VARIABLE
const CreateVariable = ({variableData, setFlowVariables, setVariableToEdit}:{variableData:{data:VariableType, index:number} | -1, setFlowVariables:Dispatch<SetStateAction<VariableType[]>>, setVariableToEdit:Dispatch<SetStateAction<{data:VariableType, index:number} | null | -1>>}) => {

    const { t } = useTranslation('flows')
    const variablesMap:{[key in DataTypes]:string} = {'bool':t('bool'), 'int':t('int'), 'float':t('float'), 'str':t('str'), 'timestamp':t('timestamp'), 'list':t('list')}


    const [currentVariable, setCurrentVariable] = useState<VariableType>(variableData === -1?{name:'', type:'bool', description:'', examples:[], values:[], ask_for_confirmation:false}:variableData.data)
    
    const [currentExample, setCurrentExample] = useState<string>('')
    const [currentValue, setCurrentValue] = useState<string>('')

    const editList = (keyToEdit:'examples' | 'values', action:'add' | 'delete', index?:number) => {
        if (action === 'add') {
            setCurrentVariable((prev) => ({...prev, [keyToEdit]:[...prev[keyToEdit], keyToEdit==='examples'?currentExample:currentValue]}))
            setCurrentExample('')
            setCurrentValue('')
        }
        else if (action === 'delete' && index !== undefined) setCurrentVariable((prev) => ({...prev, [keyToEdit]: prev[keyToEdit].filter((_, i) => i !== index)}))
        
    }

    const sendVariable = () => {
        if (variableData === -1) setFlowVariables((prev) => [...prev, currentVariable]);
        else setFlowVariables((prev) => prev.map((variable, index) => index === variableData.index ? currentVariable : variable))
        setVariableToEdit(null)
      }
      

    return (<> 
        <Box p='15px' minW={'600px'}>
            <Text fontSize={'.9em'} fontWeight={'medium'}>{t('Name')}</Text>
            <EditText  maxLength={70} hideInput={false}  value={currentVariable.name} placeholder={`${t('Name')}...`} setValue={(value) => setCurrentVariable((prev) => ({...prev, name:value})) }/>
            <Text fontSize={'.9em'} mt='1vh' fontWeight={'medium'}>{t('Description')}</Text>
            <Textarea maxLength={2000} height={'auto'} placeholder={`${t('Description')}...`} maxH='300px' value={currentVariable.description} onChange={(e) => setCurrentVariable((prev) => ({...prev, description:e.target.value}))} p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "rgb(77, 144, 254)", borderWidth: "2px"}}/>
            <Text fontSize={'.9em'} mt='1vh' fontWeight={'medium'}>{t('Type')}</Text>
            <CustomSelect hide={false} selectedItem={currentVariable.type} setSelectedItem={(value) => setCurrentVariable((prev) => ({...prev, type:value as DataTypes, examples:[], values:[]}))} options={Object.keys(variablesMap)} labelsMap={variablesMap}/>
            <Text fontSize={'.9em'} mt='2vh' fontWeight={'medium'}>{t('AskConfirmation')}</Text>
            <Flex gap='10px' mt='5px'>
                <Button bg={currentVariable.ask_for_confirmation?'brand.gradient_blue':'gray.200'} color={currentVariable.ask_for_confirmation?'white':'black'} size='sm' _hover={{bg:currentVariable.ask_for_confirmation?'brand.gradient_blue_hover':'gray.300'}} onClick={() => setCurrentVariable((prev) => ({...prev, ask_for_confirmation:true}))}>{t('Yes')}</Button>
                <Button bg={!currentVariable.ask_for_confirmation?'brand.gradient_blue':'gray.200'} color={!currentVariable.ask_for_confirmation?'white':'black'} size='sm' _hover={{bg:!currentVariable.ask_for_confirmation?'brand.gradient_blue_hover':'gray.300'}} onClick={() => setCurrentVariable((prev) => ({...prev, ask_for_confirmation:false}))}>{t('No')}</Button>
            </Flex> 

            <Text fontSize={'.9em'} mt='1vh' fontWeight={'medium'}>{t('Examples')}</Text>
            <Flex flexWrap="wrap" gap='5px' alignItems="center" >
                {currentVariable.examples.length === 0?<Text fontSize={'.9em'}> {t('NoExamples')}</Text>:currentVariable.examples.map((variable, index) => (
                    <Flex key={`example-${index}`} borderRadius=".4rem" p='4px' fontSize={'.75em'} alignItems={'center'} m="1"bg='gray.200' gap='5px'>
                        <Text>{t(variable)}</Text>
                        <Icon as={RxCross2} onClick={() => editList('examples', 'delete', index)} cursor={'pointer'} />
                    </Flex>
                ))}
            </Flex>
            <Flex mt='1vh' gap='20px' alignItems={'center'}> 
                <Box width={'70%'}> 
                    <InputType inputType={currentVariable.type} value={currentExample} setValue={(value) => setCurrentExample(value)}/>
                </Box>
                <Button isDisabled={currentExample === ''} leftIcon={<FaPlus/>} flex='1'  size='sm' onClick={() => editList('examples', 'add')}>{t('AddExample')}</Button>
            </Flex>

            <Text fontSize={'.9em'} mt='1vh' fontWeight={'medium'}>{t('Values')}</Text>
            <Flex flexWrap="wrap" gap='5px' alignItems="center" >
                {currentVariable.values.length === 0?<Text fontSize={'.9em'}>{t('NoValues')}</Text>:currentVariable.values.map((variable, index) => (
                    <Flex key={`value-${index}`} borderRadius=".4rem" p='4px' fontSize={'.75em'} alignItems={'center'} m="1"bg='gray.200' gap='5px'>
                        <Text>{t(variable)}</Text>
                        <Icon as={RxCross2} onClick={() => editList('values', 'delete', index)} cursor={'pointer'} />
                    </Flex>
                ))}
            </Flex>            <Flex mt='1vh' gap='20px' alignItems={'center'}> 
                <Box width={'70%'}> 
                    <InputType inputType={currentVariable.type} value={currentValue} setValue={(value) => setCurrentValue(value)}/>
                </Box>
                <Button  isDisabled={currentValue === ''}leftIcon={<FaPlus/>}  flex='1' size='sm' onClick={() => editList('values', 'add')}>{t('AddValue')}</Button>
            </Flex>        
        </Box>
 
        <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
            <Button  isDisabled={currentVariable.name === '' || (variableData !== -1 && JSON.stringify(variableData.data) === JSON.stringify(currentVariable))} size='sm' color='white' bg='brand.gradient_blue' _hover={{bg:'brand.gradient_blue_hover'}} onClick={sendVariable}>{variableData === -1 ? t('CreateVariable'): t('SaveVariable')}</Button>
            <Button  size='sm' onClick={() => setVariableToEdit(null)}>{t('Cancel')}</Button>
        </Flex>
        
    </>)
}
 
//INPUT DEPENDING ON THE VARIABLE TYPE
const InputType = ({inputType, value, setValue}:{inputType:DataTypes,value:string, setValue:(value:string) => void}) => {
    
    //USEFUL CONSTANTS
    const { t } = useTranslation('flows')
    const boolDict = {"True":t('true'), "False":t('false')}
    const datesMap = {'{today}':t('today'), '{yesterday}':t('yesterday'), '{start_of_week}':t('start_of_week'),'{start_of_month}':t('start_of_month')}

    switch(inputType) {
        case 'bool':
            return <CustomSelect hide={false} selectedItem={value} setSelectedItem={(value) => setValue(value) }  options={Object.keys(boolDict)} labelsMap={boolDict}/>
        case 'int':
        case 'float': return (
            <NumberInput value={value || undefined} onChange={(value) => setValue(inputType === 'float'?value:String(parseInt(value))) } clampValueOnBlur={false} >
                <NumberInputField borderRadius='.5rem'  fontSize={'.9em'} height={'37px'}  borderColor={'gray.300'} _hover={{ border:'1px solid #CBD5E0'}} _focus={{ px:'11px', borderColor: "rgb(77, 144, 254)", borderWidth: "2px" }} px='12px' />
            </NumberInput> )               
        case 'str':
        case 'list':
                return <EditText value={value} setValue={(value) => setValue(value) } hideInput={false} />
        case 'timestamp':
            return <CustomSelect hide={false} selectedItem={value}  setSelectedItem={(value) => setValue(value)}  options={Object.keys(datesMap)} labelsMap={datesMap}/>

        default: 
            return null
    }
} 

//COMPONENT FOR EDITING A MESSAGE
const EditMessage = ({scrollRef, messageData, setMessageData}:{scrollRef:RefObject<HTMLDivElement>, messageData:FlowMessage, setMessageData:Dispatch<SetStateAction<FlowMessage>>}) => {

    const  { t } = useTranslation('flows') 

    //PLACE LANGUAGES FLAG LOGIC
    const buttonRef = useRef<HTMLButtonElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const [showLanguagesBox, setShowLanguagesFlags] = useState<boolean>(false)
    useOutsideClick({ref1:buttonRef, ref2:boxRef, containerRef:scrollRef, onOutsideClick:setShowLanguagesFlags})
    const [boxPosition, setBoxPosition] = useState<'top' | 'bottom'>('bottom')
    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef, setBoxStyle, setBoxPosition, changeVariable:showLanguagesBox})

    const messagesTypeDict = {'generative':t('GeneratedByMatilda'), 'preespecified':t('Literal')}

    let languagesMap:any = {}
    for (const key in languagesFlags) {
        if (languagesFlags.hasOwnProperty(key)) {
            const values = languagesFlags[key]
            languagesMap[key] = values[0]
        }
    }

    const editMessagePreespecified = (lng: string, type: 'add' | 'remove' | 'edit' , newValue?: string) => {
        setMessageData((prev) => {
            let updatedMessages = { ...prev.preespecified_messages }
            if (type === 'edit' && newValue !== undefined) updatedMessages[lng] = newValue
            else if (type === 'remove') delete updatedMessages[lng]
            else if  (type === 'add') updatedMessages[lng] = ''
            return {...prev, preespecified_messages: updatedMessages}
        })
    }

          
    const availableLanguage = Object.keys(languagesMap).filter((lng) => !Object.keys(messageData?.preespecified_messages || []).includes(lng))

    return (
    <Box ref={scrollRef} overflow={'scroll'}>
        <Text mb='1vh'color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('MessageType')}</Text>
        <CustomSelect containerRef={scrollRef} hide={false} selectedItem={messageData.type} setSelectedItem={(value) => setMessageData((prev) => ({...prev, type: value}))} options={['generative', 'preespecified']} labelsMap={messagesTypeDict} />
        <Box bg='gray.300' width={'100%'} height={'1px'} mt='2vh' mb='2vh'/>

        {messageData.type === 'generative'? <>
        <Text color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('GenerationInstructions')}</Text>
        <Textarea mt='1vh'  maxLength={2000} height={'auto'} placeholder={`${t('VariableInstructionsPlaceholder')}...`} maxH='300px' value={messageData.generation_instructions} onChange={(e) => setMessageData((prev) => ({...prev, generation_instructions:e.target.value}))} p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "rgb(77, 144, 254)", borderWidth: "2px"}}/>
        </>:
            <Box>
            {Object.keys(messageData?.preespecified_messages || []).map((lng, index) => (
                <Box mt='15px' key={`message-${index}-${lng}`} gap='5px' alignItems={'center'}>
                    <Flex alignContent={'center'} justifyContent={'space-between'}> 
                        <Text color='gray.600' fontSize={'.8em'} mb='5px' fontWeight={'medium'}>{t('Language')}</Text>
                        <IconButton bg='transaprent' border='none' size='sm' _hover={{bg:'gray.200'}} icon={<RxCross2/>} aria-label='delete-all-condition' onClick={() => editMessagePreespecified(lng, 'remove')}/>
                    </Flex>
                    <Text fontSize={'.9em'} mb='5px' >{languagesFlags[lng][0]} {languagesFlags[lng][1]}</Text>
                    <Text color='gray.600'fontSize={'.8em'} mt='15px' fontWeight={'medium'}>{t('Message')}</Text>
                    <Textarea mt='5px'  maxLength={2000} height={'auto'} placeholder={`${t('WriteMessage')}...`} maxH='300px' value={messageData.preespecified_messages[lng]} onChange={(e) => editMessagePreespecified(lng, 'edit', e.target.value)} p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "rgb(77, 144, 254)", borderWidth: "2px"}}/>
                </Box>
            ))}
            <Button ref={buttonRef} size='sm' mt='2vh' onClick={() => setShowLanguagesFlags(!showLanguagesBox)} leftIcon={<FaPlus/>}>{t('AddLanguage')}</Button>
            <AnimatePresence> 
                {showLanguagesBox && 
                <Portal>
                    <MotionBox initial={{ opacity: 0, marginTop: boxPosition === 'bottom'?-10:10 }} animate={{ opacity: 1, marginTop: 0 }}  exit={{ opacity: 0,marginTop: boxPosition === 'bottom'?-10:10}} transition={{ duration: '0.2',  ease: 'easeOut'}}
                    top={boxStyle.top} bottom={boxStyle.bottom}right={boxStyle.right} width={boxStyle.width} maxH='40vh' overflow={'scroll'} gap='10px' ref={boxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000} position={'absolute'} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.300'}>
                        {availableLanguage.map((option:string, index:number) => (
                            <Flex key={`option-${index}`} px='10px'  py='7px' cursor={'pointer'} justifyContent={'space-between'} alignItems={'center'} _hover={{bg:'brand.hover_gray'}}
                            onClick={() => {setShowLanguagesFlags(false);editMessagePreespecified(option, 'add')}}>
                                <Flex gap='10px' alignItems={'center'} > 
                                    <Text>{languagesFlags[option][0]} {languagesFlags[option][1]}</Text>
                                </Flex>
                            </Flex>
                        ))}
                    </MotionBox>
                </Portal>
            }
        </AnimatePresence>
        </Box>}
    </Box>)
}
 
function areArraysDifferent(arr1:any[], arr2:any) {
    const cleanObject = (obj: any) => {
        const { position, height, width, id, type, data, ...rest } = obj
            const { functions, ...dataWithoutFunctions } = data
        return {id, type, data: dataWithoutFunctions}
    }
    if (arr1.length !== arr2.length) return true
    for (let i = 0; i < arr1.length; i++) {
        console.log(cleanObject(arr1[i]))
        console.log(cleanObject(arr2[i]))

      if (JSON.stringify(cleanObject(arr1[i])) !== JSON.stringify(cleanObject(arr2[i]))) return true
    }
    return false
  }
  