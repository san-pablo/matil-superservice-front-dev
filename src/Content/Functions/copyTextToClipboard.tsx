/* 
    COPY SOME TEXT TO CLIPBOARD AND SHOW A NOTIFICATION
*/

import showToast from "../Components/ToastNotification"

const copyToClipboard = (text:string) => {
    navigator.clipboard.writeText(text).then(() => {
        showToast({message:'Texto copiado en portapapeles'})
    })
}

export default copyToClipboard
