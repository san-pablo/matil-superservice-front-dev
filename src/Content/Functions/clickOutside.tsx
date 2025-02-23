import { useEffect, RefObject, useRef } from 'react'

// TYPING
interface useOutsideClickProps {
    ref1: RefObject<HTMLDivElement | HTMLButtonElement>
    ref2?: RefObject<HTMLDivElement | HTMLButtonElement>
    ref3?: RefObject<HTMLDivElement | HTMLButtonElement>
    ref4?: RefObject<HTMLDivElement | HTMLButtonElement>
    containerRef?: RefObject<HTMLDivElement>
    onOutsideClick: (key: boolean) => void
    nestedPortal?:boolean
}

// HOOK
function useOutsideClick({ ref1, ref2, ref3, ref4, containerRef, onOutsideClick, nestedPortal }: useOutsideClickProps) {
    
 
    useEffect(() => {

        //CLICK OUTSIDE
        function handleClickOutside(event: MouseEvent) {
 
            const target = event.target as HTMLElement
            const isClickInsidePortal = target.closest('#custom-portal') !== null || document.getElementById('custom-portal')?.contains(target) || (target as Element).closest('.Toastify') !== null
            const isClickInsidePortal2 = (target.closest('#custom-portal-2') !== null || document.getElementById('custom-portal-2')?.contains(target) || (target as Element).closest('.Toastify') !== null) 
        
            if (    
                ref1.current && !ref1.current.contains(event.target as Node) &&
                (!ref2 || (ref2.current && !ref2.current.contains(event.target as Node))) &&
                (!ref3 || (ref3.current && !ref3.current.contains(event.target as Node))) &&
                (!ref4 || (ref4.current && !ref4.current.contains(event.target as Node))) && 
                (!isClickInsidePortal ) && !(nestedPortal && isClickInsidePortal2)
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
