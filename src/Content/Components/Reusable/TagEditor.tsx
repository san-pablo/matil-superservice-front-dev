//REACT
import { Dispatch, SetStateAction, useState, useMemo, useEffect } from "react"
import { useAuth } from "../../../AuthContext"
import { useAuth0 } from "@auth0/auth0-react"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Text, Icon, IconButton, chakra, shouldForwardProp, Portal, Box } from "@chakra-ui/react"
import { motion, isValidMotionProp } from 'framer-motion'
//COMPONENTS
import EditText from "./EditText"
import CustomCheckbox from "./CheckBox"
//ICONS
import { RxCross2 } from "react-icons/rx"
import { FaPlus, FaTag } from "react-icons/fa6"
 //TYPING
import { TagsType } from "../../Constants/typing"
    
//TYPING
interface tagsDataType {id:number, tags:string[], [key:string]:any }

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//MAIN FUNCTION
const TagEditor = ({section, data, setData }:{section:'conversations' | 'contacts' | 'contact_business', data:tagsDataType | null, setData:Dispatch<SetStateAction<tagsDataType | null>> }) => {

    //CONSTANTS
    const auth = useAuth()
    const getAccessTokenSilently = useAuth0()
    const tags = auth.authData.tags as TagsType[]

    //SHOW ADD TAGS
    const [showAddTag, setshowAddTag] = useState<boolean>(false)

    //UPDATE TAGS DATA
    const updateTagsData = async (tagId:string, method:'post' | 'delete') => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/${section}/${data?.id}/tags/${tagId}`, method, getAccessTokenSilently,  auth})
        if (response?.status === 200) {
            if (method === 'post') setData(prev => ({...prev as tagsDataType, tags:[...(prev as tagsDataType).tags, tagId]}))
            else setData(prev => ({...prev as tagsDataType, tags:(prev?.tags || []).filter(tag => tag !== tagId)}))
        }
    }
    
    //MEMOIZED ADD TAG BOX
    const memoizedAddTagFunction = useMemo(() => (<> 
        <Portal>
            <Flex id='custom-portal' position='fixed' alignItems='center'justifyContent='center' top={0} left={0}zIndex={1000} width='100vw' height='100vh' onMouseDown={() => setshowAddTag(false)} > 
                <MotionBox initial={false}  animate={{opacity:1, y:0}} transition={{ duration: '.2'}}  onMouseDown={(e) => e.stopPropagation()}  borderRadius={'.3rem'} boxShadow={'rgba(20, 20, 20, 0.2) 0px 16px 32px 0px'}> 
                    <AddTagComponent selectedTags={data?.tags || []} updateTagsData={updateTagsData}/>
                </MotionBox>
            </Flex>
        </Portal>
    </>), [showAddTag, data?.tags])

    return (<> 
        {showAddTag && memoizedAddTagFunction}

        <Flex flexWrap={'wrap'} gap='10px'>
            {(data?.tags || []).map((tagId, index) => {
                return (<TagComponent key={`tag-${index}`} tagId={tagId} tags={tags} updateTagsData={updateTagsData}/>)
            })}
            <IconButton icon={<FaPlus/>} aria-label="add-tag" size={'xs'} isRound variant={'common'} onClick={() => setshowAddTag(true)}/>
        </Flex>
    </>)
}

export default TagEditor

//COMPONENT OF EACH TAG
const TagComponent = ({tagId, tags, updateTagsData}:{tagId:string, tags:TagsType[], updateTagsData:(tagId:string, method:'post' | 'delete') => void}) => {

    const tagName = tags.find(tag => tag.uuid === tagId)?.name || ''
    const [isHovering, setIsHovering] = useState<boolean>(false)

    return (<>  

        <Flex position={'relative'} alignItems={'center'} justifyContent={'center'} bg='brand.gray_2' py='5px' px='8px' borderRadius={'.5rem'} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <Text fontSize={'.7em'}>{tagName}</Text>
            {isHovering && 
                <Flex alignItems={'center'} cursor={'pointer'} justifyContent={'center'} bg={'brand.gray_2'} backdropFilter="blur(1px)"  px='3px' position={'absolute'} right={'4px'} > 
                    <Icon color='red' boxSize={'12px'} as={RxCross2} onClick={(e) => {updateTagsData(tagId, 'delete')}}/>
                </Flex>}
        </Flex>

    
        </>)
}

//ADD OR DELETE TAGS COMPONENT
const AddTagComponent = ({updateTagsData, selectedTags}:{updateTagsData:(tagId:string, method:'post' | 'delete') => void, selectedTags:string[]}) => {

    //CONSTANTS
    const { t } = useTranslation('settings')
    const auth = useAuth()
    const getAccessTokenSilently = useAuth0()

    //FILTER TAGS
    const [text, setText] = useState<string>('')
    const [filteredTags, setFilteredTags] = useState<TagsType[]>((auth.authData.tags || []))
    useEffect(() => {
        const filterUserData = () => {
            if (auth.authData.tags) {
                const filtered = auth.authData.tags.filter(tag => tag.name.toLowerCase().includes(text.toLowerCase()))
                setFilteredTags(filtered)
            }
        }
        filterUserData()
    }, [text, auth.authData.tags])
       

    //CREATE NEW TAG 
    const createTag = async () => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/tags`, method:'post', requestForm:{name:text, description:''}, getAccessTokenSilently,  auth})
        if (response?.status === 200) {
            updateTagsData(response.data.uuid, 'post')
            auth.setAuthData({tags: [...auth.authData.tags as TagsType[], {uuid:response.data.uuid, name:text, description:'', organization_id:auth.authData.organizationId || 0, conversations_affected:0, contacts_affected:0, contact_businesses_affected:0, created_by:auth.authData.userId || '', created_at:String(new Date()), archived_at:null, is_archived:false}]})
            setText('')
        }
        
    }
    return (
    <Flex flexDir={'column'} maxH={'70vh'} w='600px' bg='white' p='10px' borderRadius={'.5rem'}>
        <EditText searchIcon={FaTag} searchInput placeholder={t('Tag')}  value={text} setValue={(value) => setText(value)}/>
        <Box w='100%' flex='1' overflow={'scroll'}> 
            {filteredTags.map((tag, index) => {
                return (
                    <Flex key={`tag-${index}`} p='6px' borderRadius={'.5rem'} alignItems={'center'}  justifyContent={'space-between'} _hover={{bg:'brand.gray_2'}} onClick={() => updateTagsData(tag.uuid, selectedTags.includes(tag.uuid) ? 'delete':'post')}>
                        <Text fontSize={'.9em'}>{tag.name}</Text>
                        <CustomCheckbox id={`tag-${index}`}  onChange={() => {}} isChecked={selectedTags.includes(tag.uuid)}/>
                    </Flex>
                )
            })}
            {filteredTags.length === 0 &&
                <Flex alignItems={'center'} gap='10px' _hover={{bg:'brand.gray_2'}} onClick={createTag}>
                    <Icon as={FaPlus}/>
                    <Text fontSize={'.9em'}>{t('AddTag')}</Text>
                </Flex>
                }
        </Box>
    </Flex>)
}


