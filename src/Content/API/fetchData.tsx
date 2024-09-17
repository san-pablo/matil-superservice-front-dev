
/*
    FUNCTION TO MAKE ANY CALL TO THE API DINAMICALLY AND SHOW THE SUCCESS OR ERROR MESSAGE WITH A TOAST NOTIFICATION
*/

//AXIOS
import axios, { isAxiosError } from 'axios'
import qs from 'qs'
//TOAST NOTIFICATIONS
import showToast from "../Components/ToastNotification"

//TYPING
interface fetchDataProps {
    endpoint:string
    setValue?:(value:any) => void | null
    setWaiting?:(value:boolean) => void 
    auth:any
    requestForm?:Object
    params?:Object 
    method?: 'get' | 'post' | 'put' | 'delete'
    toastMessages?:{'works'?:string,'failed'?:string} | null
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
const fetchData = async ({endpoint, setValue, setWaiting, auth, requestForm = {}, params = {}, method = 'get', toastMessages=null}: fetchDataProps) => {
    
 
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
            return qs.stringify(params, { arrayFormat: 'repeat' });
        }
    }
   
    //START WAITING
    if (setWaiting) setWaiting(true)

    try {

        //CONFIG REQUEST
        if (['post', 'put', 'delete'].includes(method.toLowerCase())) config.data = requestForm
        else config.params = {...config.params, ...requestForm}

        //RESPONSE
        const response = await axios(config)

        //ACTIONS ON A SUCCESSFUL CALL
        if (setValue) setValue(response.data)
        if (setWaiting) setWaiting(false)
        if (toastMessages?.works) showToast({message:toastMessages.works})

        //RETURN THE RESPONSE
        return response
    } 
    //CATCH ERROR
    catch (error) {

        //HANDLE ACCESS TOKEN ERROR
        if (isAxiosError(error) && error.response && error.response.status === 403){
            try {
                //REQUEST AND CHANGE NEW ACCESS TOKEN
                const accessResponse = await axios.get(URL + 'user/refresh_token', {headers: {'Authorization': `Bearer ${auth.authData.refreshToken}`}})
                auth.setAuthData({ accessToken: accessResponse.data.access_token })
                config.headers =  {'Authorization': `Bearer ${accessResponse.data.access_token }`, 'Content-Type': 'application/json' }

                //NEW CALL
                const refreshedResponse = await axios(config)

                //ACTIONS ON A SUCCESSFUL CALL
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
