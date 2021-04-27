export const domain='ddu6.xyz'
const oldCommentsThreshold=32859
const timeout=60
const weakPasswords=['']
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
}
export type Order='id'|'active'|'hot'
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
    const headers:HeadersInit={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'
    }
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
        jsapiver:'201027113050-449842'
    })
    const result=await basicallyGet('https://pkuhelper.pku.edu.cn/services/pkuhole/api.php',params,form)
    if(typeof result==='number')return result
    const {status,body}=result
    if(status!==200)return status
    try{
        const {code,data,msg}=JSON.parse(body)
        if(code===0)return {data:data}
        if(msg==='没有这条树洞')return 404
        if(typeof msg==='string'&&msg.length>0){
            console.log(msg)
        }
    }catch(err){
        console.log(err)
    }
    return 500
}
async function remotelyGetResult(path:string,params:Record<string,string>={}){
    const result=await new Promise(async(resolve:(val:{data:any}|number)=>void)=>{
        let paramsStr=new URLSearchParams(params).toString()
        if(paramsStr.length>0)paramsStr='?'+paramsStr
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
    const data:{data:CommentData[]}|number=await remotelyGetResult(`c${id}`,{
        update:'',
        token:token,
        password:password
    })
    return data
}
async function remotelyGetLocalComments(id:number|string,token:string,password:string){
    const data:{data:CommentData[]}|number=await remotelyGetResult(`local/c${id}`,{
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
export async function getComments(id:number|string,token:string,password:string){
    let result:number|{
        data: CommentData[]
    }=404
    if(Number(id)>oldCommentsThreshold){
        result=await locallyGetComments(id,token)
    }
    if(result===404){
        if(password.length===0)return []
        result==await remotelyGetLocalComments(id,token,password)
    }else if(typeof result!=='number'&&password.length>0){
        const localResult=await remotelyGetLocalComments(id,token,password)
        if(typeof localResult!=='number'){
            const data=result.data
            const ids=data.map(val=>Number(val.cid))
            const localData=localResult.data
            for(let i=0;i<localData.length;i++){
                const item=localData[i]
                const id=Number(item.cid)
                if(ids.includes(id))continue
                ids.push(id)
                data.push(item)
            }
            data.sort((a,b)=>{
                return Number(a.cid)-Number(b.cid)
            })
        }
    }
    if(result===404)return []
    if(result===503)return 503
    if(typeof result==='number')return 500
    if(!weakPasswords.includes(password)){
        const result=await remotelyGetComments(id,token,password)
        if(result===401){
            weakPasswords.push(password)
        }
    }
    return result.data
}
export async function getHole(id:number|string,token:string,password:string){
    let result:number|{
        data: HoleData
    }=404
    if(Number(id)>oldCommentsThreshold){
        result=await locallyGetHole(id,token)
    }
    if(result===404){
        if(password.length===0)return 404
        result=await remotelyGetLocalHole(id,token,password)
    }
    if(result===401)return 401
    if(result===503)return 503
    if(result===404)return 404
    if(typeof result==='number')return 500
    if(Number(result.data.timestamp)===0)return 404
    if(!weakPasswords.includes(password)){
        const result=await remotelyGetHole(id,token,password)
        if(result===401){
            weakPasswords.push(password)
        }
    }
    return result.data
}
export async function getStars(token:string){
    const result:{data:HoleData[]}|number=await getResult({
        action:'getattention',
        user_token:token
    })
    if(result===401)return 401
    if(result===503)return 503
    if(result===404)return []
    if(typeof result==='number')return 500
    const data=result.data
    return data
}
export async function star(id:number|string,starred:boolean,token:string){
    if(Number(id)<=oldCommentsThreshold)return 500
    const result=await getResult({
        action:'attention',
        pid:id.toString(),
        switch:starred?'0':'1',
        user_token:token
    })
    if(typeof result!=='number')return 200
    if(result===503)return 503
    if(result===404)return 404
    return 500
}
export async function comment(id:number|string,text:string,token:string){
    if(Number(id)<=oldCommentsThreshold||text.length===0)return 500
    const result=await getResult({
        action:'docomment',
        user_token:token
    },{
        pid:id.toString(),
        text:text,
        user_token:token
    })
    if(typeof result!=='number')return 200
    if(result===503)return 503
    if(result===404)return 404
    return 500
}
export async function getPage(key:string,page:number|string,order:Order,s:number,e:number,token:string,password:string){
    if(order!=='id'){
        if(password.length===0)return 401
        const result=await remotelyGetLocalPage(key,page,order,s,e,token,password)
        if(result===401)return 401
        if(result===503)return 503
        if(typeof result==='number')return 500
        const data=result.data
        if(order==='active'&&data.length>0){
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
    if(result===401)return 401
    if(result===404)return []
    if(result===503)return 503
    if(typeof result==='number')return 500
    if(!weakPasswords.includes(password)){
        const result=await remotelyGetPage(key,page,token,password)
        if(result===401){
            weakPasswords.push(password)
        }
    }
    const data=result.data
    if(data.length>0){
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