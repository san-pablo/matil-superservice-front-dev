
import { Text } from '@chakra-ui/react'
import EditText from '../../../../Components/Reusable/EditText'

interface ChannelInfoProps {
    value:string
    title:string
    description:string
    hide?:boolean
}
const ChannelInfo = ({value, title, description, hide = false}:ChannelInfoProps) => {
    return(<> 
            <Text mt='2vh'  fontWeight={'medium'}>{title}</Text>
            <Text mb='1vh' color='gray.600' fontSize={'.9em'}>{description}</Text>
            <EditText value={value} hideInput={false} size='sm' setValue={(key:string) => {}} isDisabled={true} type={hide ? 'password':'text'}/>
        </>              
    )
}

export default ChannelInfo