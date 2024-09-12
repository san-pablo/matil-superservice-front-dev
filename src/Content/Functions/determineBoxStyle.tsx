/* 
    DETERMINE IF THE BOX IS GOING TO SHOW DOWN OR UP OF THE MAIN COMPONENT
*/

//REACT
import { CSSProperties, Dispatch, RefObject, SetStateAction, useEffect } from "react"

//TYPING
interface determineBoxStyleProps {
    buttonRef:RefObject<HTMLDivElement | HTMLButtonElement>
    setBoxStyle:Dispatch<SetStateAction<CSSProperties>>
    changeVariable:boolean
    setBoxPosition?:Dispatch<SetStateAction<'top' | 'bottom'>>
}

//MAIN FUNCTION
const determineBoxStyle = ({buttonRef, setBoxStyle, setBoxPosition, changeVariable}:determineBoxStyleProps) => {
 
    //UPDATE THE BOX POSTION BASED ON THEIR SCREEN POSITION
    const updateBoxPosition = () => {
        if (buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect()
            const halfScreenHeight = window.innerHeight / 2
            if (setBoxPosition) setBoxPosition(buttonRect.bottom > halfScreenHeight ? 'top' : 'bottom')

            const newBoxStyle: CSSProperties = {
                top: buttonRect.bottom > halfScreenHeight ? 'auto' : `${buttonRect.bottom + window.scrollY}px`,
                bottom: buttonRect.bottom > halfScreenHeight ? `${window.innerHeight - buttonRect.top - window.scrollY}px` : 'auto',
                right: `${window.innerWidth - buttonRect.right}px`,
                width: `${buttonRect.width}px`
            }
            setBoxStyle(newBoxStyle)
        }
    }

    useEffect(() => {
        window.addEventListener('scroll', updateBoxPosition)
        window.addEventListener('resize', updateBoxPosition)
        return () => {
            window.removeEventListener('scroll', updateBoxPosition)
            window.removeEventListener('resize', updateBoxPosition)
        }
    }, [])
    useEffect(() => {if (changeVariable) updateBoxPosition()}, [changeVariable])
}

export default determineBoxStyle
