/* 
    NOT FOUND PAGE
*/


import { useNavigate } from 'react-router-dom' 
import { Flex, Text, Box, Button } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { BsArrowReturnLeft } from "react-icons/bs";


const NotFound = () => {

  const { t } = useTranslation('main')
  const navigate = useNavigate()
  return (
    <Flex justifyContent={'center'} alignItems={'center'} height={'100vh'} width={'100vw'}  top={0} left={'-55px'} bg='white' position='fixed' zIndex={100000} >
      <Box textAlign={'center'} maxW={'40vw'}> 
        <Text fontSize={'2.5em'} fontWeight={'medium'}>{t('NotFoundError')}</Text>
        <Button leftIcon={<BsArrowReturnLeft/>} bg='rgba(59, 90, 246)' _hover={{bg:'rgba(59, 60, 246)'}} size={'lg'}  mt='4vh' color={'white'} onClick={() => navigate('/conversations')} >{t('GoBack')}</Button>
      </Box>
    </Flex>
  )
}

export default NotFound
