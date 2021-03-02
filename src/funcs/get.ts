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
async function getResult(path:string,query:string[],local:boolean,update:boolean,token:string,empty=false,timeout=30000){
    const result=await new Promise(async(resolve:(val:{data:any}|number)=>void)=>{
        try{
            if(update&&!local)query.push('update')
            if(!local)query.push(`token=${token}`)
            setTimeout(()=>{
                resolve(503)
            },timeout)
            const res=await fetch(`https://${domain}/services/ph-get/${local?'local/':''}${path}${query.length>0?'?':''}${query.join('&')}`)
            const status=res.status
            if(status!==200){resolve(status);return}
            if(empty){resolve(200);return}
            const data=await res.json()
            resolve({data:data})
        }catch(err){
            resolve(500)
        }
    })
    return result
}
async function basicallyGetComments(id:number|string,local:boolean,update:boolean,token:string){
    const data:{data:CommentData[]}|number=await getResult(`c${id}`,[],local,update,token)
    return data
}
async function basicallyGetHole(id:number|string,local:boolean,update:boolean,token:string){
    const data:{data:HoleData}|number=await getResult(`h${id}`,[],local,update,token)
    return data
}
async function basicallyGetStars(update:boolean,token:string){
    const data:{data:HoleData[]}|number=await getResult('s',[],false,update,token)
    return data
}
async function basicallyGetPage(key:string,page:number|string,order:Order,s:number,e:number,local:boolean,update:boolean,token:string){
    const data:{data:HoleData[]}|number=await getResult(`p${page}`,[
        `key=${encodeURIComponent(key)}`,
        `order=${order}`,
        `s=${s}`,
        `e=${e}`
    ],local,update,token)
    return data
}
export async function getComments(id:number|string,token:string,reply:number,hidden:number,localCommentsThreshod:number){
    if(reply===0)return []
    const result0=await basicallyGetComments(id,true,false,token)
    if(result0===503)return 503
    if(typeof result0==='number')return 500
    const data0=result0.data
    if(token.length===0||hidden===1)return data0
    if(data0.length>=reply||data0.length>=localCommentsThreshod)return data0
    const result1=await basicallyGetComments(id,false,true,token)
    if(result1===503)return 503
    if(result1===404)return data0
    if(typeof result1==='number')return 500
    const data1=result1.data
    return data1
}
export async function getHole(id:number|string,token:string){
    const result0=await basicallyGetHole(id,true,false,token)
    if(result0===503)return 503
    if(result0===404){
        if(token.length===0)return 404
        const result1=await basicallyGetHole(id,false,true,token)
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
    if(token.length===0)return data0
    const result1=await basicallyGetHole(id,false,true,token)
    if(result1===503)return 503
    if(result1===404)return data0
    if(typeof result1==='number')return 500
    const data1=result1.data
    return data1
}
export async function getStars(token:string){
    if(token.length===0)return 401
    const result=await basicallyGetStars(true,token)
    if(result===503)return 503
    if(result===404)return 401
    if(typeof result==='number')return 500
    const data=result.data
    return data
}
export async function star(id:number|string,starred:boolean,token:string){
    if(token.length===0)return 401
    const result=await getResult(`s${id}`,starred?['starred']:[],false,false,token,true)
    if(result===200)return 200
    if(result===503)return 503
    if(result===404)return 404
    return 500
}
export async function getPage(key:string,page:number|string,order:Order,s:number,e:number,token:string){
    if(order==='id'&&token.length>0){
        const result=await basicallyGetPage(key,page,'id',0,0,false,true,token)
        if(result===503)return 503
        if(result===404)return []
        if(typeof result==='number')return 500
        const data=result.data
        return data
    }    
    const result=await basicallyGetPage(key,page,order,s,e,true,false,token)
    if(result===503)return 503
    if(typeof result==='number')return 500
    const data=result.data
    return data
}