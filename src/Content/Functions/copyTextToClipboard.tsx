/* 
    COPY SOME TEXT TO CLIPBOARD AND SHOW A NOTIFICATION
*/

import { useTranslation } from "react-i18next"
import showToast from "../Components/Reusable/ToastNotification"

const copyToClipboard = (text:string) => {
    const { t } = useTranslation('settings')

    navigator.clipboard.writeText(text).then(() => {
        showToast({message:t('CopyText')})
    })
}

export default copyToClipboard
