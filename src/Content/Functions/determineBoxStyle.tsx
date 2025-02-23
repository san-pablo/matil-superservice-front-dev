/* 
    DETERMINE IF THE BOX IS GOING TO SHOW DOWN OR UP OF THE MAIN COMPONENT
*/

//REACT
import { CSSProperties, Dispatch, RefObject, SetStateAction, useEffect } from "react"

//TYPING
interface determineBoxStyleProps {
    buttonRef:RefObject<HTMLDivElement | HTMLButtonElement>
    setBoxStyle?:Dispatch<SetStateAction<CSSProperties>>
    alwaysTop?:boolean
    changeVariable:any
    getValue?:boolean
}

//MAIN FUNCTION
const determineBoxStyle = ({buttonRef, setBoxStyle, alwaysTop = false, changeVariable, getValue = false}:determineBoxStyleProps) => {
 
    //UPDATE THE BOX POSTION BASED ON THEIR SCREEN POSITION
    const updateBoxPosition = () => {
        if (buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect()
            const halfScreenHeight = window.innerHeight / 2
            const halfScreenWidth = window.innerWidth / 2
            
            const newBoxStyle: CSSProperties = {
                top: alwaysTop?`${buttonRect.top + window.scrollY}px`: buttonRect.bottom > halfScreenHeight ? undefined : `${buttonRect.top + window.scrollY}px`,
                bottom: buttonRect.bottom > halfScreenHeight ? `${window.innerHeight - buttonRect.bottom - window.scrollY}px` : undefined,
                right: buttonRect.right < halfScreenWidth? undefined :`${window.innerWidth - buttonRect.right - window.scrollX}px`, 
                left: buttonRect.right < halfScreenWidth ? `${buttonRect.left}px`:undefined,
                width: `${buttonRect.width}px`
            }
            if (setBoxStyle && !getValue) setBoxStyle(newBoxStyle)
            return newBoxStyle
        }
    }

    if (!getValue) {
        useEffect(() => {
            window.addEventListener('scroll', updateBoxPosition)
            window.addEventListener('resize', updateBoxPosition)
            return () => {
                window.removeEventListener('scroll', updateBoxPosition)
                window.removeEventListener('resize', updateBoxPosition)
            }
        }, [])
        useEffect(() => {updateBoxPosition()}, [changeVariable])
    }

    if (getValue) return updateBoxPosition()
 
}

export default determineBoxStyle
