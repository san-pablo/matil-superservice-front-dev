const parseMessageToBold = (message:string, showLink?:boolean) => {
    const parts = message.split(/(\/{[^/]+}\/)/g)
    return parts.map((part, index) => {
      if (part.startsWith('/{') && part.endsWith('}/')) return <span key={index} style={{color:showLink?'blue':'black', textDecoration:showLink?'underline':'', fontWeight:500}} >{part.slice(2, -2)}</span>;
      return part
    })
  }

export default parseMessageToBold