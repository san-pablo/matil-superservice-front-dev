import {useEffect, useState } from 'react'
import { Button } from '@chakra-ui/react'

import { useAuth } from '../../../../../AuthContext'
import LoadingIconButton from '../../../../Components/Reusable/LoadingIconButton'
import { FaGoogle } from "react-icons/fa";


import axios from 'axios'
  
  
  const GoogleLoginButton = () => {
   
    const auth = useAuth()
    const [waitingInfo, setWaitingInfo] = useState<boolean>(false)

    const handleAuth = async () => {
      try {

        //const responseOrders = await axios.get(`https://beae-46-24-177-171.ngrok-free.app/orders`)
        //console.log(responseOrders.data)

        const response = await axios.get(`http://localhost:8080/authorize`)


      } catch (error) {
        console.error('Error initiating Shopify auth', error)
      }
    }

  return (
    <Button  onClick={handleAuth} size='md' bg='#1877f2' w='100%' leftIcon={<FaGoogle/>} _hover={{bg:'#0F6AE0'}} color='#fff'>
      {waitingInfo?<LoadingIconButton/>:'Registrarse con Google'}
    </Button>
  )
}

export default GoogleLoginButton
