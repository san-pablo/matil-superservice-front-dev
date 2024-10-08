import { Flex } from '@chakra-ui/react'
import '../styles.css'

const CustomCheckbox = ({id,  onChange, isChecked}:{id:string, onChange:() => void, isChecked:boolean}) => {
    
    
    return (
        <Flex  mt='4px'  > 
            <div className="checkbox-wrapper-4">
                <input onChange={onChange} onFocus={(e) => e.stopPropagation()} className="inp-cbx" id={id} type="checkbox"  checked={isChecked} readOnly />
                <label className="cbx" htmlFor={id}><span>
                <svg width="12px" height="10px">
                    <use xlinkHref="#check-4"></use>
                </svg></span></label>
                <svg className="inline-svg">
                    <symbol id="check-4" viewBox="0 0 12 10">
                    <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                    </symbol>
                </svg>
            </div>
        </Flex>
    )
}

export default CustomCheckbox