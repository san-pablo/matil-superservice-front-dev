
/*
    FUNCTION TO MAKE ANY CALL TO THE API DINAMICALLY AND SHOW THE SUCCESS OR ERROR MESSAGE WITH A TOAST NOTIFICATION
*/

//REACT
import { MutableRefObject } from 'react'
//AXIOS
import axios, { isAxiosError } from 'axios'
//TOAST NOTIFICATIONS
import showToast from "../Components/Reusable/ToastNotification"
 
//SERIALIZE PARAMETERS
function paramsSerializer(params:string) {
    const str = [];
    for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
            value.forEach(v => {
                str.push(encodeURIComponent(key) + '=' + encodeURIComponent(v));
            });
        } else {
            str.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        }
    }
    return str.join('&')
}

//TYPING
interface fetchDataProps {
    endpoint:string
    setValue?:(value:any) => void | null
    setWaiting?:(value:boolean) => void 
    auth:any
    getAccessTokenSilently:any
    requestForm?:Object
    params?:Object 
    method?: 'get' | 'post' | 'put' | 'delete'
    toastMessages?:{'works'?:string,'failed'?:string} | null
    setRef?:MutableRefObject<any>
}
interface Config {
    method: 'get' | 'post' | 'put' | 'delete'
    url: string
    headers: {
        Authorization: string
        'Content-Type': string
    }
    params?: Object
    data?: Object
    paramsSerializer?: (params: any) => string
    
}

//MAIN FUNCTION
const fetchData = async ({endpoint, setValue, setWaiting, getAccessTokenSilently, auth, requestForm = {}, params = {}, method = 'get', toastMessages=null, setRef}: fetchDataProps) => {
 
    //API ENDPOINT AND CONFIGURATION
    const URL = import.meta.env.VITE_PUBLIC_API_URL
    const config: Config  = {
        method: method, 
        url: URL + endpoint,
        headers: {
            'Authorization': `Bearer ${auth.authData.accessToken} `,
            'Content-Type': 'application/json'
        },
        params: params,
        paramsSerializer: function(params) {
            return paramsSerializer(params)
        }
    }
   
    //START WAITING
    if (setWaiting) setWaiting(true)

    try {

        //CONFIG REQUEST
        if (['post', 'put', 'delete'].includes(method.toLowerCase())) config.data = requestForm
        else config.params = {...config.params, ...requestForm}
  

        console.log(requestForm)
        //RESPONSE  
        const response = await axios(config)

        console.log(response.data)
        //ACTIONS ON A SUCCESSFUL CALL
        if (setRef)  setRef.current = JSON.parse(JSON.stringify(response.data)) 
        if (setValue) setValue(response.data)
        if (setWaiting) setWaiting(false)
        if (toastMessages?.works) showToast({message:toastMessages.works})

        //RETURN THE RESPONSE
        return response
    } 
    //CATCH ERROR
    catch (error) {

        console.log(error)
        //HANDLE ACCESS TOKEN ERROR
        if (isAxiosError(error) && error.response && error.response.status === 403){
            try {
                //REQUEST AND CHANGE NEW ACCESS TOKEN
                const accessToken = await getAccessTokenSilently({authorizationParams: {audience: `https://api.matil/v2/`, scope: "read:current_user"}})

                auth.setAuthData({ accessToken: accessToken})
                config.headers =  {'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }

                //NEW CALL
                const refreshedResponse = await axios(config)

                //ACTIONS ON A SUCCESSFUL CALL
                if (setRef) setRef.current = refreshedResponse.data
                if (setValue) setValue(refreshedResponse.data)              
                if (setWaiting) setWaiting(false)
                if (toastMessages?.works) showToast({message:toastMessages.works})

                
                //RETURN THE RESPONSE
                return refreshedResponse
            } 
            //LOGOUT IF REFRESH TOKEN INVALID
            catch (error) {}
        }

        //HANDLE ANOTHER ERROR
        else {
            if (setWaiting) setWaiting(false)
            if (toastMessages?.failed) showToast({message:toastMessages.failed, type:'failed'})
        }

    }
}

export default fetchData
