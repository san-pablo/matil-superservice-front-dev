//FRONT
import { Flex } from '@chakra-ui/react'
import '../styles.css'

//MAIN FUNCTION
const CustomCheckbox = ({id,  onChange, isChecked, isLine = false}:{id:string, onChange:() => void, isChecked:boolean, isLine?:boolean}) => {
    return (
        <Flex alignItems={'center'} h='100%' > 
            <div className="checkbox-wrapper-4" style={{marginTop:'2px'}}>
                <input 
                    onChange={onChange}  
                    onFocus={(e) => e.stopPropagation()} 
                    className="inp-cbx" 
                    id={id} 
                    type="checkbox" 
                    checked={isChecked} 
                />
                <label className="cbx" htmlFor={id}>
                    <span>
                        <svg width="12px" height="10px">
                            <use xlinkHref={isLine ? "#dash-4" : "#check-4"}></use>
                        </svg>
                    </span>
                </label>
                <svg className="inline-svg" style={{width:'100%'}}>
                    <symbol id="check-4" viewBox="0 0 12 10">
                        <polyline points="1.5 6 4.5 9 10 1"></polyline>
                    </symbol>
                    <symbol id="dash-4" viewBox="0 0 12 10">
                        <polyline points="1.5 5 10 5"></polyline>
                    </symbol>
                </svg>
            </div>
        </Flex>
    )
}

export default CustomCheckbox