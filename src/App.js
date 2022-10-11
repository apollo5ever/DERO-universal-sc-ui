

import DeroBridgeApi from './api.js'
import React from 'react'
import ReactDOM from 'react-dom'
import to from 'await-to-js'
import './app.css'
import Accordion from './components/accordion.js'

const App = () => {


  const [scid,setSCID] = React.useState("")
  var SCID=""
  const [code,setCode]= React.useState("")
  const [functionArray,setFunctionArray] = React.useState([])  
var fA = []
  const deroBridgeApiRef = React.useRef()
  const [bridgeInitText, setBridgeInitText] = React.useState('Not connected to extension')
  const [vars,setVars]=React.useState(null)
  const [displayVars,setDisplayVars] = React.useState(false)
  const [balanceList,setBalanceList] = React.useState(null)
  const [displayBalance,setDisplayBalance] = React.useState(false)

  React.useEffect(() => {
    const load = async () => {
      deroBridgeApiRef.current = new DeroBridgeApi()
      const deroBridgeApi = deroBridgeApiRef.current
      const [err] = await to(deroBridgeApi.init())
      if (err) {
        setBridgeInitText('failed to connect to extension')
      } else {
        setBridgeInitText('connected to extension')
      }
    }

    window.addEventListener('load', load)
    return () => window.removeEventListener('load', load)
  }, [])






  
  



  const execute = React.useCallback(async (event) => {
    event.preventDefault();
    let F =event.target.getAttribute('id')
    console.log(F)
    console.log(scid)
    console.log(fA)
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
      "value": fA[F].name
    }]
    console.log("ID",event.target.getAttribute('id'))
 if(fA[F].ints) {  
    for(var i=0;i<fA[F].ints.length;i++){
      args.push(new Object({
        "name":fA[F].ints[i].match(/\w+/)[0],
        "datatype":"U",
        "value":parseInt(event.target[`int${i}`].value)
      }))
      }}
   if(fA[F].strs){   
    for(var s=0;s<fA[F].strs.length;s++){
        args.push(new Object({
          "name":fA[F].strs[s].match(/\w+/)[0],
          "datatype":"S",
          "value":event.target[`str${s}`].value
        }))
        }}
      console.log(args)
    
    console.log(F)
    console.log(functionArray)
    const deroBridgeApi = deroBridgeApiRef.current
    const [err, res] = await to(deroBridgeApi.wallet('start-transfer', {
    	"scid": SCID,
    	"ringsize": 2,
      "fees":parseInt(event.target.fee.value),
      "transfers":transfers,
    	"sc_rpc": 
        args
    }))

    console.log(err)
    console.log(res)
  }, [])





  





  //--------------------DAEMON FUNCTIONS----------------------------------
  

   const getContract = React.useCallback(async (event) => {
     event.preventDefault();
    const deroBridgeApi = deroBridgeApiRef.current
    const [err, res] = await to(deroBridgeApi.daemon('get-sc', {
    	    	scid:event.target.scid.value,
            code:true,
            variables:true
    }))
    console.log(res)
      setSCID(event.target.scid.value)
      SCID = event.target.scid.value

      let functionSearch = /Function(.{1,}\r*\n){1,}End Function/gm
      let argSearch = /\(.*\)/
      let intSearch = /\w{1,}\s{1}Uint64/gi
      let strSearch = /\w{1,}\s{1}String/gi
      let nameSearch = /\w+/g
    
let code = res.data.result.code
let funcArr=code.match(functionSearch).map(x=>new Object({"code":x}))
for (var f=0;f<funcArr.length;f++){
  funcArr[f].args = funcArr[f].code.match(argSearch)
  funcArr[f].ints = funcArr[f].args[0].match(intSearch)
  funcArr[f].strs = funcArr[f].args[0].match(strSearch)
  funcArr[f].name = funcArr[f].code.match(nameSearch)[1]
}
console.log(funcArr)
fA = funcArr
setFunctionArray(funcArr)

let variables = Object.keys(res.data.result.stringkeys)
.map(x=>new Object({"name":x,"value":res.data.result.stringkeys[x]}))
setVars(variables)

let bl= Object.keys(res.data.result.balances)
.map(x=><p>Balance of {x=="0000000000000000000000000000000000000000000000000000000000000000"?"Dero":x}: {res.data.result.balances[x]} (atomic units)</p>)
setBalanceList(bl)

console.log("vars",variables)
  }, []) 











  
//----------------------------USER INTERFACE-----------------------------------------------------------------------------------


  return <div>
    
    <div>{bridgeInitText}</div>
    <h1>Dero Universal Contract UI</h1>
            
            <form onSubmit={getContract}>
                <input id="scid" placeholder='Enter contract SCID here...' type="text"/>        
                <button type={"submit"}>Select</button>
            </form>
            {displayBalance?<div className="function"><div className="title">Balances <div className="toggle" onClick={()=>setDisplayBalance(!displayBalance)}>-</div></div>{balanceList}</div>:<div className="function"><div className="title">Balances <div className="toggle" onClick={()=>setDisplayBalance(!displayBalance)}>+</div></div></div>}
            {vars&&displayVars?<div className="function"><div className="title">Variables <div className="toggle" onClick={()=>setDisplayVars(!displayVars)}>-</div></div>{vars.map(x=><p>{x.name+": "+x.value}</p>)}</div>:<div className="function"><div className="title">Variables <div className="toggle" onClick={()=>setDisplayVars(!displayVars)}>+</div></div></div>}
            
            {/* {
            functionArray.map((x,j)=><div className="function"><pre>{x.code}</pre><form id={j} onSubmit={execute}><input placeholder="destination" id="destination" type="text"/><input placeholder="dero amount" id="burn" type="text"/><input placeholder="scid of asset to send if any" id="asset" type="text"/><input placeholder="asset amount if any" id="assetAmount" type="text"/> <input placeholder="fee" id="fee" type="text"/>{x.ints?x.ints.map((z,i)=><input placeholder={z} id={`int${i}`} type="text"/>):""}{x.strs?x.strs.map((z,i)=><input placeholder={z} id={`str${i}`} type="text"/>):""}<button type="submit">Execute</button></form></div>)
            
            } */}
            {functionArray.map(x=><Accordion code={x.code} ints={x.ints} strs={x.strs} name={x.name} deroBridgeApiRef={deroBridgeApiRef} scid={scid}/>)}

    

 



  
  

  <footer>Support by sending dero to "apollo"</footer>


  </div>
}



export default App;