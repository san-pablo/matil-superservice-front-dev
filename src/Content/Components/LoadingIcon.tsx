/* 
    DOMINO LOADING ICON (INITIAL CHARGE)
*/

//FRONT
import { Flex } from '@chakra-ui/react'

//MAIN FUNCTION
const LoadingIcon = () => {
    return (
        <>
            <style>
                {`
                @keyframes dominoes {
                    0% { opacity: 0; }
                    20% { opacity: 1; transform: rotate(0deg); }
                    60% { transform: rotate(calc(var(--rotation) * 0.7deg)); }
                    90%, 100% { opacity: 0; transform: rotate(calc(var(--rotation) * 1deg)); }
                }

                .dominoes {
                    display: grid;
                    grid-gap: 20px;
                    grid-template-columns: repeat(5, 10px);
                    height: 40px;
                }

                .dominoes div {
                    --rotation: 68;
                    background-color: var(--primary, black); /* Fallback to black */
                    opacity: 0;
                    transform-origin: bottom right;
                    animation-name: dominoes;
                    animation-duration: 1s;
                    animation-timing-function: ease;
                    animation-iteration-count: infinite;
                }

                .dominoes div:nth-child(1) { animation-delay: 0.2s; }
                .dominoes div:nth-child(2) { animation-delay: 0.4s; }
                .dominoes div:nth-child(3) { animation-delay: 0.6s; }
                .dominoes div:nth-child(4) { animation-delay: 0.8s; }
                .dominoes div:nth-child(5) { 
                    animation-delay: 1s; 
                    --rotation: 90; 
                }
                `}
            </style>
            <Flex width="100%" height="100%" justifyContent="center" alignItems="center" bg="gray.50">
                <div className="dominoes">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </Flex>
        </>
    )
}

export default LoadingIcon;
