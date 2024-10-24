/* 
    COPY SOME TEXT TO CLIPBOARD AND SHOW A NOTIFICATION
*/

import showToast from "../Components/Reusable/ToastNotification"

const copyToClipboard = (text:string, successMessage:string) => {

    navigator.clipboard.writeText(text).then(() => {
        showToast({message:successMessage})
    })
}

export default copyToClipboard
