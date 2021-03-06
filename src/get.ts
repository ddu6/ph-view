export const domain='ddu6.xyz'
const oldCommentsThreshold=32859
const timeout=60
const weakPasswords=['']
const hiddenIds:number[]=[]
interface Res{
    body:string
    headers:Headers
    status:number
}
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
    toName:string|null|undefined
    pureText:string|null|undefined
}
export interface MsgData{
    content:string|null|undefined
    timestamp:number|string
    title:string|null|undefined
}
export type Order='id'|'liveness'|'heat'|'span'
async function basicallyGet(url:string,params:Record<string,string>={},form:Record<string,string>={},cookie='',referer=''){
    let paramsStr=new URL(url).searchParams.toString()
    if(paramsStr.length>0){
        paramsStr+='&'
    }
    paramsStr+=new URLSearchParams(params).toString()
    if(paramsStr.length>0){
        paramsStr='?'+paramsStr
    }
    url=new URL(paramsStr,url).href
    const formStr=new URLSearchParams(form).toString()
    const headers:HeadersInit={}
    if(cookie.length>0){
        headers.Cookie=cookie
    }
    if(referer.length>0){
        headers.Referer=referer
    }
    const options:RequestInit={
        method:formStr.length>0?'POST':'GET',
        headers:headers,
        referrerPolicy:'no-referrer'
    }
    if(formStr.length>0){
        Object.assign(headers,{
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        })
        Object.assign(options,{
            body:formStr
        })
    }
    const result=await new Promise(async(resolve:(val:number|Res)=>void)=>{
        setTimeout(()=>{
            resolve(500)
        },timeout*1000)
        const res=await fetch(url,options)
        const {headers,status}=res
        if(status!==200){
            resolve(status)
            return
        }
        try{
            const body=await res.text()
            resolve({
                status:status,
                body:body,
                headers:headers
            })
        }catch(err){
            console.log(err)
        }
        resolve(500)
    })
    return result
}
async function getResult(params:Record<string,string>={},form:Record<string,string>={}){
    Object.assign(params,{
        PKUHelperAPI:'3.0',
        jsapiver:`201027113050-${2*Math.floor(Date.now()/72e5)}`
    })
    const result=await basicallyGet('https://pkuhelper.pku.edu.cn/services/pkuhole/api.php',params,form)
    if(typeof result==='number'){
        return result
    }
    const {status,body}=result
    if(status!==200){
        return status
    }
    try{
        const {code,data,msg}=JSON.parse(body)
        if(code===0){
            return {data:data}
        }
        if(msg==='没有这条树洞'){
            return 404
        }
        if(msg==='已经关注过了'){
            return 409
        }
        if(typeof msg==='string'&&msg.length>0){
            if(msg.startsWith('你已被禁言')){
                alert(msg)
            }else{
                console.log(msg)
            }
        }
    }catch(err){
        console.log(err)
    }
    return 500
}
export async function getMsgs(token:string){
    const result=await basicallyGet('https://pkuhelper.pku.edu.cn/api_xmcp/hole/system_msg',{
        user_token:token,
        PKUHelperAPI:'3.0',
        jsapiver:`201027113050-${2*Math.floor(Date.now()/72e5)}`
    })
    if(result===503){
        return 503
    }
    if(typeof result==='number'){
        return 500
    }
    const {status,body}=result
    if(status===503){
        return 503
    }
    if(status!==200){
        return 500
    }
    try{
        const {result}=JSON.parse(body)
        if(!Array.isArray(result)){
            return 500
        }
        const data:MsgData[]=result
        return data
    }catch(err){
        console.log(err)
    }
    return 500
}
async function remotelyGetResult(path:string,params:Record<string,string>={}){
    const result=await new Promise(async(resolve:(val:{data:any}|number)=>void)=>{
        let paramsStr=new URLSearchParams(params).toString()
        if(paramsStr.length>0){
            paramsStr='?'+paramsStr
        }
        setTimeout(()=>{
            resolve(503)
        },timeout*1000)
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
async function remotelyGetComments(id:number|string,token:string,password:string){
    const data:{data:CommentData[]}|number=await remotelyGetResult(`cs${id}`,{
        update:'',
        token:token,
        password:password
    })
    return data
}
async function remotelyGetLocalComments(id:number|string,token:string,password:string){
    const data:{data:CommentData[]}|number=await remotelyGetResult(`local/cs${id}`,{
        token:token,
        password:password
    })
    return data
}
async function remotelyGetHole(id:number|string,token:string,password:string){
    const data:{data:HoleData}|number=await remotelyGetResult(`h${id}`,{
        update:'',
        token:token,
        password:password
    })
    return data
}
async function remotelyGetLocalHole(id:number|string,token:string,password:string){
    const data:{data:HoleData}|number=await remotelyGetResult(`local/h${id}`,{
        token:token,
        password:password
    })
    return data
}
async function remotelyGetPage(key:string,page:number|string,token:string,password:string){
    const data:{data:HoleData[]}|number=await remotelyGetResult(`p${page}`,{
        update:'',
        key:key,
        token:token,
        password:password
    })
    return data
}
async function remotelyGetLocalPage(key:string,page:number|string,order:Order,s:number,e:number,token:string,password:string){
    const data:{data:HoleData[]}|number=await remotelyGetResult(`local/p${page}`,{
        key:key,
        order:order,
        s:s.toString(),
        e:e.toString(),
        token:token,
        password:password
    })
    return data
}
async function locallyGetComments(id:number|string,token:string){
    const result:{data:CommentData[]}|number=await getResult({
        action:'getcomment',
        pid:id.toString(),
        user_token:token
    })
    return result
}
async function getList(page:number|string,token:string){
    const result:{data:HoleData[]}|number=await getResult({
        action:'getlist',
        p:page.toString(),
        user_token:token
    })
    return result
}
async function locallyGetHole(id:number|string,token:string){
    const result:{data:HoleData}|number=await getResult({
        action:'getone',
        pid:id.toString(),
        user_token:token
    })
    return result
}
async function getSearch(key:string,page:number|string,token:string){
    const result:{data:HoleData[]}|number=await getResult({
        action:'search',
        pagesize:'50',
        page:page.toString(),
        keywords:key,
        user_token:token
    })
    return result
}
async function locallyGetPage(key:string,page:number|string,token:string){
    if(key.length===0)return await getList(page,token)
    return await getSearch(key,page,token)
}
export async function getComment(cid:number|string,token:string,password:string){
    if(password.length===0){
        return 403
    }
    cid=Number(cid)
    const result:number|{
        data: CommentData
    }=await remotelyGetResult(`local/c${cid}`,{
        token:token,
        password:password
    })
    if(result===403){
        return 403
    }
    if(result===404){
        return 404
    }
    if(result===503){
        return 503
    }
    if(typeof result==='number'){
        return 500
    }
    return result.data
}
export async function getComments(id:number|string,commentNum:number,token:string,password:string){
    if(commentNum===0){
        return []
    }
    let result:number|{
        data: CommentData[]
    }=404
    id=Number(id)
    if(id>oldCommentsThreshold&&!hiddenIds.includes(id)){
        result=await locallyGetComments(id,token)
    }
    if(result===404){
        if(password.length===0){
            return []
        }
        result=await remotelyGetLocalComments(id,token,password)
    }else if(typeof result!=='number'&&password.length>0){
        const data=result.data
        if(!weakPasswords.includes(password)&&data.length>0){
            const result=await remotelyGetComments(id,token,password)
            if(result===403){
                weakPasswords.push(password)
            }
        }
        if(commentNum>data.length){
            const localResult=await remotelyGetLocalComments(id,token,password)
            if(typeof localResult!=='number'){
                const ids=data.map(val=>Number(val.cid))
                const localData=localResult.data
                for(let i=0;i<localData.length;i++){
                    const item=localData[i]
                    const id=Number(item.cid)
                    if(ids.includes(id)){
                        continue
                    }
                    data.push(item)
                }
                data.sort((a,b)=>Number(a.cid)-Number(b.cid))
            }
        }
    }
    if(result===404){
        return []
    }
    if(result===503){
        return 503
    }
    if(typeof result==='number'){
        return 500
    }
    return result.data
}
export async function getHole(id:number|string,token:string,password:string){
    let result:number|{
        data: HoleData
    }=404
    id=Number(id)
    if(id>oldCommentsThreshold&&!hiddenIds.includes(id)){
        result=await locallyGetHole(id,token)
        if(result===404){
            hiddenIds.push(id)
        }
    }
    if(result===404){
        if(password.length===0){
            return 404
        }
        result=await remotelyGetLocalHole(id,token,password)
        if(typeof result!=='number'){
            result.data.hidden=1
        }
        if(result===403){
            return 403
        }
    }
    if(result===401){
        return 401
    }
    if(result===503){
        return 503
    }
    if(result===404){
        return 404
    }
    if(typeof result==='number'){
        return 500
    }
    const data=result.data
    if(Number(data.timestamp)===0){
        return 404
    }
    if(!weakPasswords.includes(password)&&Number(data.hidden)!==1){
        const result=await remotelyGetHole(id,token,password)
        if(result===403){
            weakPasswords.push(password)
        }
    }
    return data
}
export async function getStars(token:string){
    const result:{data:HoleData[]}|number=await getResult({
        action:'getattention',
        user_token:token
    })
    if(result===401){
        return 401
    }
    if(result===503){
        return 503
    }
    if(result===404){
        return []
    }
    if(typeof result==='number'){
        return 500
    }
    const data=result.data
    return data
}
export async function star(id:number|string,starred:boolean,token:string){
    id=Number(id)
    if(id<=oldCommentsThreshold||hiddenIds.includes(id)){
        return 500
    }
    const result=await getResult({
        action:'attention',
        pid:id.toString(),
        switch:starred?'0':'1',
        user_token:token
    })
    if(typeof result!=='number'){
        return 200
    }
    if(result===503){
        return 503
    }
    if(result===409){
        return 409
    }
    return 500
}
export async function comment(id:number|string,text:string,token:string){
    id=Number(id)
    if(id<=oldCommentsThreshold||hiddenIds.includes(id)){
        return 500
    }
    const result=await getResult({
        action:'docomment',
        user_token:token
    },{
        pid:id.toString(),
        text:text,
        user_token:token
    })
    if(typeof result!=='number'){
        return 200
    }
    if(result===503){
        return 503
    }
    return 500
}
export async function add(text:string,src:string,token:string){
    let form:Record<string,string>
    if(src.length>0){
        form={
            text:text,
            type:'image',
            data:src,
            user_token:token
        }
    }else if(text.length>0){
        form={
            text:text,
            type:'text',
            user_token:token
        }
    }else{
        return 500
    }
    const result=await getResult({
        action:'dopost',
        user_token:token
    },form)
    if(result===503){
        return 503
    }
    if(typeof result==='number'){
        return 500
    }
    const {data}=result
    if(typeof data!=='string'&&typeof data!=='number'){
        return 500
    }
    const id=Number(data)
    if(isNaN(id)){
        return 500
    }
    return {id:id}
}
export async function getPage(key:string,page:number|string,order:Order,s:number,e:number,token:string,password:string){
    if(order!=='id'){
        if(password.length===0){
            return 403
        }
        const result=await remotelyGetLocalPage(key,page,order,s,e,token,password)
        if(result===401){
            return 401
        }
        if(result===403){
            return 403
        }
        if(result===503){
            return 503
        }
        if(typeof result==='number'){
            return 500
        }
        const data=result.data
        if(order==='liveness'&&data.length>0){
            let {etimestamp}=data[0]
            if(typeof etimestamp==='string'){
                etimestamp=Number(etimestamp)
            }
            if(typeof etimestamp==='number'){
                const storage=window.localStorage
                const oldEStr=storage.getItem('ph-max-etimestamp')
                if(oldEStr!==null){
                    const oldE=Number(oldEStr)
                    if(etimestamp>oldE){
                        storage.setItem('ph-max-etimestamp',etimestamp.toString())
                    }
                }else{
                    storage.setItem('ph-max-etimestamp',etimestamp.toString())
                }
            }

        }
        return data
    }
    const result=await locallyGetPage(key,page,token)
    if(result===401){
        return 401
    }
    if(result===404){
        return []
    }
    if(result===503){
        return 503
    }
    if(typeof result==='number'){
        return 500
    }
    const data=result.data
    if(data.length>0){
        if(!weakPasswords.includes(password)){
            const result=await remotelyGetPage(key,page,token,password)
            if(result===403){
                weakPasswords.push(password)
            }
        }
        let {pid,timestamp}=data[0]
        if(typeof pid==='string'){
            pid=Number(pid)
        }
        const storage=window.localStorage
        const oldIdStr=storage.getItem('ph-max-id')
        if(oldIdStr!==null){
            const oldId=Number(oldIdStr)
            if(pid>oldId){
                storage.setItem('ph-max-id',pid.toString())
            }
        }else{
            storage.setItem('ph-max-id',pid.toString())
        }
        if(typeof timestamp==='string'){
            timestamp=Number(timestamp)
        }
        const oldEStr=storage.getItem('ph-max-etimestamp')
        if(oldEStr!==null){
            const oldE=Number(oldEStr)
            if(timestamp>oldE){
                storage.setItem('ph-max-etimestamp',timestamp.toString())
            }
        }else{
            storage.setItem('ph-max-etimestamp',timestamp.toString())
        }
    }
    return data
}