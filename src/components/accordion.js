import React from "react";
import to from "await-to-js";

export default function Accordion(props){
    const [isOpen,setIsOpen] = React.useState(false)

    const execute = React.useCallback(async (event) => {
        event.preventDefault();
        
        let transfers=[]
        if(event.target.asset.value){
          transfers.push({
            "scid":event.target.asset.value,
            "burn":parseInt(event.target.assetAmount.value)
          })
        }if(event.target.destination.value){
          transfers.push({
          "destination":event.target.destination.value,
          "burn":parseInt(event.target.burn.value)
        })}
        let args = [{
          "name": "entrypoint",
          "datatype": "S",
          "value": props.name
        }]
        console.log("ID",event.target.getAttribute('id'))
     if(props.ints) {  
        for(var i=0;i<props.ints.length;i++){
          args.push(new Object({
            "name":props.ints[i].match(/\w+/)[0],
            "datatype":"U",
            "value":parseInt(event.target[`int${i}`].value)
          }))
          }}
       if(props.strs){   
        for(var s=0;s<props.strs.length;s++){
            args.push(new Object({
              "name":props.strs[s].match(/\w+/)[0],
              "datatype":"S",
              "value":event.target[`str${s}`].value
            }))
            }}
          console.log(args)
        
        
        const deroBridgeApi = props.deroBridgeApiRef.current
        const [err, res] = await to(deroBridgeApi.wallet('start-transfer', {
            "scid": props.scid,
            "ringsize": 2,
          "fees":parseInt(event.target.fee.value),
          "transfers":transfers,
            "sc_rpc": 
            args
        }))
    
        console.log(err)
        console.log(res)
      }, [])


return(
    <div className="function"><div className="title">{props.name}<div className="toggle" onClick={()=>setIsOpen(!isOpen)}>{isOpen?"-":"+"}</div></div>{isOpen&&<><pre>{props.code}</pre><form onSubmit={execute}><input placeholder="destination" id="destination" type="text"/><input placeholder="dero amount" id="burn" type="text"/><input placeholder="scid of asset to send if any" id="asset" type="text"/><input placeholder="asset amount if any" id="assetAmount" type="text"/> <input placeholder="fee" id="fee" type="text"/>{props.ints?props.ints.map((z,i)=><input placeholder={z} id={`int${i}`} type="text"/>):""}{props.strs?props.strs.map((z,i)=><input placeholder={z} id={`str${i}`} type="text"/>):""}<button type="submit">Execute</button></form></>}</div>
)
}