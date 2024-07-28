import {useEffect, useState } from 'react'
import { Button } from '@chakra-ui/react'
import { FaShopify } from "react-icons/fa"
import LoadingIconButton from '../../../Components/LoadingIconButton'
import axios from 'axios';

declare global {
    interface Window {
      FB: any
      fbAsyncInit: () => void
    }
  }
  
  const ShopifyLoginButton = ({ shop }: { shop: string}) => {
   
     const [waitingInfo, setWaitingInfo] = useState<boolean>(false)

     const handleAuth = async () => {
        try {

          //const responseOrders = await axios.get(`https://beae-46-24-177-171.ngrok-free.app/orders`)
          //console.log(responseOrders.data)

          const response = await axios.post(`https://2900-46-24-177-171.ngrok-free.app/get_installation_url?shop=${shop}`)

          window.open(response.data.redirect_uri, '_blank')

        } catch (error) {
          console.error('Error initiating Shopify auth', error)
        }
      }
    
  
  return (
    <Button isDisabled={shop === ''} onClick={handleAuth} size='sm' bg='green' leftIcon={<FaShopify/>} _hover={{bg:'green.600'}} color='white'>
      {waitingInfo?<LoadingIconButton/>:'Registrarse con Shopify'}
    </Button>
    
      
  )
}

export default ShopifyLoginButton
