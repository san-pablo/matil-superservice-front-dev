import { Flex } from '@chakra-ui/react'
import '../styles.css'

const CustomCheckbox = ({onChange, isChecked}:{onChange:(e:any) => void, isChecked:boolean}) => {
    return (
        <Flex mt='4px'> 
        <div className="checkbox-wrapper-4">
            <input className="inp-cbx" id="morning" type="checkbox"  checked={isChecked} onChange={onChange}/>
            <label className="cbx" htmlFor="morning"><span>
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