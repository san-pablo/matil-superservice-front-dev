import { useEffect } from 'react'

interface useEnterListenerProps {
    onClickEnter: () => void
    actionDisabled: boolean
}

function useEnterListener({ onClickEnter, actionDisabled }: useEnterListenerProps) {
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Enter') {
                event.stopPropagation()
                event.preventDefault()
                if (!actionDisabled)onClickEnter()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => {document.removeEventListener('keydown', handleKeyDown)}
    }, [onClickEnter, actionDisabled])
}

export default useEnterListener
