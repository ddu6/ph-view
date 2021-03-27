export const domain='ddu6.xyz'
export interface HoleData{
    text:string|null|undefined
    tag:string|null|undefined
    pid:number|string
    timestamp:number|string
    reply:number|string
    likenum:number|string
    type:string|null|undefined
    url:string|null|undefined
    hidden:'1'|'0'|1|0|boolean
    etimestamp:number|string|undefined
}
export interface CommentData{
    text:string|null|undefined
    tag:string|null|undefined
    cid:number|string
    pid:number|string
    timestamp:number|string
    name:string|null|undefined
}
export type Order='id'|'active'|'hot'
async function getResult(path:string,params:Record<string,string>={},timeout=60000){
    const result=await new Promise(async(resolve:(val:{data:any}|number)=>void)=>{
        let paramsStr=new URLSearchParams(params).toString()
        if(paramsStr.length>0)paramsStr='?'+paramsStr
        setTimeout(()=>{
            resolve(503)
        },timeout)
        try{
            const res=await fetch(`https://${domain}/services/ph-get/${path}${paramsStr}`)
            if(res.status!==200){
                resolve(500)
                return
            }
            const {status,data}=await res.json()
            if(status===200){
                resolve({data:data})
                return
            }
            if(typeof status==='number'){
                resolve(status)
                return
            }
        }catch(err){
            console.log(err)
        }
        resolve(500)
    })
    return result
}
async function basicallyGetComments(id:number|string,token:string,password:string){
    const data:{data:CommentData[]}|number=await getResult(`c${id}`,{
        update:'',
        token:token,
        password:password
    })
    return data
}
async function basicallyGetLocalComments(id:number|string,token:string,password:string){
    const data:{data:CommentData[]}|number=await getResult(`local/c${id}`,{
        token:token,
        password:password
    })
    return data
}
async function basicallyGetHole(id:number|string,token:string,password:string){
    const data:{data:HoleData}|number=await getResult(`h${id}`,{
        update:'',
        token:token,
        password:password
    })
    return data
}
async function basicallyGetLocalHole(id:number|string,token:string,password:string){
    const data:{data:HoleData}|number=await getResult(`local/h${id}`,{
        token:token,
        password:password
    })
    return data
}
async function basicallyGetStars(token:string,password:string){
    const data:{data:HoleData[]}|number=await getResult('s',{
        update:'',
        token:token,
        password:password
    })
    return data
}
async function basicallyGetPage(key:string,page:number|string,token:string,password:string){
    const data:{data:HoleData[]}|number=await getResult(`p${page}`,{
        update:'',
        key:key,
        token:token,
        password:password
    })
    return data
}
async function basicallyGetLocalPage(key:string,page:number|string,order:Order,s:number,e:number,token:string,password:string){
    const data:{data:HoleData[]}|number=await getResult(`local/p${page}`,{
        key:key,
        order:order,
        s:s.toString(),
        e:e.toString(),
        token:token,
        password:password
    })
    return data
}
export async function getComments(id:number|string,reply:number,hidden:number,localCommentsThreshod:number,token:string,password:string){
    if(token.length===0||password.length===0)return 401
    if(reply===0)return {
        data:[],
        updated:false
    }
    const result0=await basicallyGetLocalComments(id,token,password)
    if(result0===401)return 401
    if(result0===503)return 503
    if(typeof result0==='number')return 500
    const data0=result0.data
    if(hidden===1)return {
        data:data0,
        updated:false
    }
    const length0=data0.length
    if(length0>=reply||length0>=localCommentsThreshod)return {
        data:data0,
        updated:false
    }
    const result1=await basicallyGetComments(id,token,password)
    if(result1===401)return {
        data:data0,
        updated:false
    }
    if(result1===503)return 503
    if(result1===404)return {
        data:data0,
        updated:false
    }
    if(typeof result1==='number')return 500
    const data1=result1.data
    return {
        data:data1,
        updated:true
    }
}
export async function getHole(id:number|string,token:string,password:string){
    if(token.length===0||password.length===0)return 401
    const result0=await basicallyGetLocalHole(id,token,password)
    if(result0===401)return 401
    if(result0===503)return 503
    if(result0===404){
        const result1=await basicallyGetHole(id,token,password)
        if(result1===401)return 404
        if(result1===503)return 503
        if(result1===404)return 404
        if(typeof result1==='number')return 500
        const data1=result1.data
        return data1
    }
    if(typeof result0==='number')return 500
    const data0=result0.data
    if(Number(data0.timestamp)===0)return 404
    if(Number(data0.hidden)===1)return data0
    const result1=await basicallyGetHole(id,token,password)
    if(result1===401)return data0
    if(result1===503)return 503
    if(result1===404)return data0
    if(typeof result1==='number')return 500
    const data1=result1.data
    return data1
}
export async function getStars(token:string,password:string){
    if(token.length===0||password.length===0)return 401
    const result=await basicallyGetStars(token,password)
    if(result===401)return 401
    if(result===503)return 503
    if(result===404)return 401
    if(typeof result==='number')return 500
    const data=result.data
    return data
}
export async function star(id:number|string,starred:boolean,token:string,password:string){
    if(token.length===0||password.length===0)return 401
    const result=await getResult(`s${id}`,starred?{'starred':'',token:token,password:password}:{token:token,password:password})
    if(typeof result!=='number')return 200
    if(result===401)return 401
    if(result===503)return 503
    if(result===404)return 404
    return 500
}
export async function getPage(key:string,page:number|string,order:Order,s:number,e:number,token:string,password:string){
    if(token.length===0||password.length===0)return 401
    if(order==='id'){
        const result=await basicallyGetPage(key,page,token,password)
        if(result!==401){
            if(result===503)return 503
            if(result===404)return []
            if(typeof result==='number')return 500
            const data=result.data
            return data
        }        
    }
    const result=await basicallyGetLocalPage(key,page,order,s,e,token,password)
    if(result===401)return 401
    if(result===503)return 503
    if(typeof result==='number')return 500
    const data=result.data
    return data
}