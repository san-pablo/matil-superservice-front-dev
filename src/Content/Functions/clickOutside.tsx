import { useEffect, RefObject } from 'react'

// TYPING
interface useOutsideClickProps {
    ref1: RefObject<HTMLDivElement | HTMLButtonElement>
    ref2?: RefObject<HTMLDivElement | HTMLButtonElement>
    ref3?: RefObject<HTMLDivElement | HTMLButtonElement>
    ref4?: RefObject<HTMLDivElement | HTMLButtonElement>
    containerRef?: RefObject<HTMLDivElement>
    onOutsideClick: (key: boolean) => void
}

// HOOK
function useOutsideClick({ ref1, ref2, ref3, ref4, containerRef, onOutsideClick }: useOutsideClickProps) {
    
    useEffect(() => {

        //CLICK OUTSIDE
        function handleClickOutside(event: MouseEvent) {
            if (
                ref1.current && !ref1.current.contains(event.target as Node) &&
                (!ref2 || (ref2.current && !ref2.current.contains(event.target as Node))) &&
                (!ref3 || (ref3.current && !ref3.current.contains(event.target as Node))) &&
                (!ref4 || (ref4.current && !ref4.current.contains(event.target as Node)))
            ) onOutsideClick(false)
        }

        //SCROLL
        function handleScroll(event: Event) {
            if (containerRef?.current && containerRef.current.contains(event.target as Node)) onOutsideClick(false)
        }

        document.addEventListener('mousedown', handleClickOutside, true)
        containerRef?.current?.addEventListener('scroll', handleScroll, true)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true)
            containerRef?.current?.removeEventListener('scroll', handleScroll, true)
        }
    }, [ref1, ref2, ref3, ref4, containerRef, onOutsideClick])
}

export default useOutsideClick
