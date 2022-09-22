

import DeroBridgeApi from './api.js'
import React from 'react'
import ReactDOM from 'react-dom'
import to from 'await-to-js'
import './app.css'

const App = () => {


  const [scid,setSCID] = React.useState("")
  const [code,setCode]= React.useState("")
  const [functionArray,setFunctionArray] = React.useState([])  
var fA = []
  const deroBridgeApiRef = React.useRef()
  const [bridgeInitText, setBridgeInitText] = React.useState('Not connected to extension')

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
    let transfers= [{
      "destination":event.target.destination.value,
      "burn":parseInt(event.target.burn.value)
    }]
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
    	"scid": scid,
    	"ringsize": 2,
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
      setSCID(event.target.scid.value)

      let functionSearch = /Function(.{1,}\n){1,}End Function/gm
      let argSearch = /\(.*\)/
      let intSearch = /\w{1,}\s{1}Uint64/g
      let strSearch = /\w{1,}\s{1}String/g
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
  }, []) 











  
//----------------------------USER INTERFACE-----------------------------------------------------------------------------------


  return <div>
    
    <div>{bridgeInitText}</div>
    <h1>Dero Universal Contract UI</h1>
            
            <form onSubmit={getContract}>
                <input id="scid" placeholder='Enter contract SCID here...' type="text"/>        
                <button type={"submit"}>Select</button>
            </form>
            {functionArray.map((x,j)=><div className="function"><pre>{x.code}</pre><form id={j} onSubmit={execute}><input placeholder="destination" id="destination" type="text"/><input placeholder="burn" id="burn" type="text"/> {x.ints?x.ints.map((z,i)=><input placeholder={z} id={`int${i}`} type="text"/>):""}{x.strs?x.strs.map((z,i)=><input placeholder={z} id={`str${i}`} type="text"/>):""}<button type="submit">Execute</button></form></div>)}

    

 



  
  

  <footer>Support by sending dero to "apollo"</footer>


  </div>
}



export default App;