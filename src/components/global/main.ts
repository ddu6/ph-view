import {Hole} from '../pure/hole'
import {KillableLock} from '../../wheels/lock'
import * as get from '../../funcs/get'
import * as css from '../../lib/css'
import * as fonts from '../../lib/fonts'
type AppendData={
    data:get.HoleData
    isRef:boolean
    idOnly:false
}|{
    data:{pid:number|string}
    isRef:boolean
    idOnly:true
}
export class Main{
    element=document.createElement('div')
    panel=document.createElement('div')
    orderSelect=document.createElement('select')
    fillterInput=document.createElement('input')
    pageInput=document.createElement('input')
    starCheckbox=document.createElement('div')
    autoCheckbox=document.createElement('div')
    flow=document.createElement('div')
    style=document.createElement('style')
    fetchLock=new KillableLock()
    appendLock=new KillableLock()

    auto=false
    star=false
    order:get.Order='id'
    fillter=''
    page=0
    token=''
    password=''
    stars:number[]=[]

    s=0
    e=0
    ids:number[]=[]
    keys:string[]=[]
    key=''
    end=false
    appendedIds:number[]=[]
    lastAppend=Date.now()
    inited=false
    errCount=0
    maxId=-1
    maxETimestamp=0
    
    local=false
    refMode:'direct'|'recur'|'none'='direct'
    refLimit=3
    scrollSpeed=500
    appendThreshod=1000
    localCommentsThreshod=500
    congestionSleep=5000
    unauthorizedSleep=3600000
    errLimit=10
    errSleep=5000
    dRegExp=/\.d\d{0,8}/g
    idsRegExp=/#\d{1,7}-\d{1,7}|#\d{1,4}\*\*\*|#\d{1,5}\*\*|#\d{1,6}\*|#\d{1,7}/g
    constructor(){
        this.element.append(this.style)
        this.element.append(this.panel)
        this.element.append(this.flow)
        this.panel.append(this.starCheckbox)
        this.panel.append(this.orderSelect)
        this.panel.append(this.fillterInput)
        this.panel.append(this.pageInput)
        this.panel.append(this.autoCheckbox)
        this.element.classList.add('main')
        this.panel.classList.add('panel')
        this.flow.classList.add('flow')
        this.orderSelect.classList.add('order')
        this.fillterInput.classList.add('fillter')
        this.pageInput.classList.add('page')
        this.starCheckbox.classList.add('star')
        this.autoCheckbox.classList.add('auto')
        this.starCheckbox.classList.add('checkbox')
        this.autoCheckbox.classList.add('checkbox')
        this.orderSelect.innerHTML='<option>id</option><option>active</option><option>hot</option>'
        this.pageInput.type='number'
        this.pageInput.min='1'
        this.style.textContent=fonts.icomoon+css.main
        this.fillterInput.addEventListener('keydown',async e=>{
            if(e.key==='Enter'){
                this.pageInput.value='1'
                await this.refresh()
            }
        })
        this.pageInput.addEventListener('keydown',async e=>{
            if(e.key==='Enter'){
                await this.refresh()
            }
        })
        this.orderSelect.addEventListener('input',async e=>{
            this.pageInput.value='1'
            if(this.orderSelect.value==='hot'){
                if(!this.fillterInput.value.startsWith('.d')){
                    this.fillterInput.value='.d '+this.fillterInput.value
                }
            }
            else{
                if(this.fillterInput.value.startsWith('.d')){
                    this.fillterInput.value=this.fillterInput.value.replace(/^\.d\d*\s*/,'')
                }
            }
            if(this.orderSelect.value!=='id'){
                this.starCheckbox.classList.remove('checked')
            }
            await this.refresh()
        })
        this.starCheckbox.addEventListener('click',async e=>{
            this.pageInput.value='1'
            if(this.fillterInput.value.startsWith('.d')){
                this.fillterInput.value=this.fillterInput.value.replace(/^\.d\d*\s*/,'')
            }
            this.starCheckbox.classList.toggle('checked')
            await this.refresh()
        })
        this.autoCheckbox.addEventListener('click',async e=>{
            this.autoCheckbox.classList.toggle('checked')
            this.auto=this.autoCheckbox.classList.contains('checked')
        })
        document.addEventListener('scroll',async e=>{
            await this.autoAppend()
        })
        document.addEventListener('touchmove',async e=>{
            await this.autoAppend()
        })
        document.addEventListener('dblclick',async e=>{
            await this.autoAppend()
        })
        setInterval(async()=>{
            if(!this.inited)return
            if(this.auto){
                window.scrollBy({left:0,top:this.scrollSpeed,behavior:"smooth"})
            }
        },1000)
        setInterval(async()=>{
            if(!this.inited)return
            await this.autoAppend()
        },500)
    }
    async getAndRenderComments(id:number|string,hole:Hole,reply:number|string,hidden:0|1|'0'|'1'|boolean){
        const result0=await this.fetchLock.get()
        if(result0===false)return 500
        const result1=await get.getComments(id,Number(reply),Number(hidden),this.localCommentsThreshod,this.token,this.password)
        if(result1===503||result1===500||result1===401){
            await this.fetchLock.release(result0)
            return result1
        }
        const {data,updated}=result1
        hole.renderComments(data,updated)
        for(let i=0;i<data.length;i++){
            const item=data[i]
            const {text}=item
            if(typeof text!=='string')continue
            if(text.startsWith('[Helper]')){
                hole.renderComments([item])
                await this.fetchLock.release(result0)
                return 401
            }
        }
        await this.fetchLock.release(result0)
        return data
    }
    parseFillter(){
        this.s=0
        this.e=0
        this.ids=[]
        this.keys=[]
        this.key=''
        let fillter=this.fillter.trim()
        if(fillter.length===0)return
        const array0=fillter.match(this.dRegExp)
        if(Array.isArray(array0)&&array0.length>0){
            let d0=array0[array0.length-1].slice(2)
            let d1=d0.slice(-2)
            let m=d0.slice(-4,-2)
            let y=d0.slice(-8,-4)
            if(y.length<4){
                const now=new Date()
                y=now.getFullYear().toString()
                if(m.length===0){
                    m=(now.getMonth()+1).toString()
                    if(d1.length===0){
                        d1=now.getDate().toString()
                    }
                }
            }
            const s=new Date(`${y}/${m}/${d1}`).getTime()/1000
            if(!isNaN(s)){
                const e=s+24*60*60
                this.s=s
                this.e=e
            }
        }
        const array1=fillter.match(this.idsRegExp)
        if(Array.isArray(array1)&&array1.length>0){
            for(let i=0;i<array1.length;i++){
                const item=array1[i].slice(1)
                if(item.includes('-')){
                    const [start,end]=item.split('-').map(val=>Number(val))
                    if(isNaN(start)||isNaN(end))continue
                    if(start<=end) for(let i=start;i<=end;i++){
                        this.ids.push(i)
                    }
                    else for(let i=start;i>=end;i--){
                        this.ids.push(i)
                    }
                    continue
                }
                if(item.endsWith('***')){
                    const main=Number(item.slice(0,-3))
                    if(isNaN(main)||main<=0)continue
                    const start=main*1000
                    const end=start+999
                    for(let i=start;i<=end;i++){
                        this.ids.push(i)
                    }
                    continue
                }
                if(item.endsWith('**')){
                    const main=Number(item.slice(0,-2))
                    if(isNaN(main)||main<=0)continue
                    const start=main*100
                    const end=start+99
                    for(let i=start;i<=end;i++){
                        this.ids.push(i)
                    }
                    continue
                }
                if(item.endsWith('*')){
                    const main=Number(item.slice(0,-1))
                    if(isNaN(main)||main<=0)continue
                    const start=main*10
                    const end=start+9
                    for(let i=start;i<=end;i++){
                        this.ids.push(i)
                    }
                    continue
                }
                const id=Number(item)
                if(isNaN(id))continue
                this.ids.push(id)
            }
        }
        fillter=fillter.replace(this.dRegExp,' ').replace(this.idsRegExp,' ').trim()
        this.keys=fillter.split(/\s+/)
        this.key=this.keys.join(' ')
    }
    async basicallyAppend(data0:AppendData[]){
        for(let i=0;i<data0.length;i++){
            let item=data0[i]
            const {isRef}=item
            if(isRef&&this.refMode==='none')continue
            const id=Number(item.data.pid)
            if(this.appendedIds.includes(id))continue
            this.appendedIds.push(id)
            let data1:get.HoleData
            if(item.idOnly){
                const data=await get.getHole(id,this.token,this.password)
                if(data===404)continue
                if(data===401)return 500
                if(data===500){
                    this.errCount++
                    if(this.errCount>this.errLimit)return 500
                    await this.fetchLock.sleep(this.errSleep)
                    this.appendedIds.pop()
                    i--
                    continue
                }
                if(data===503){
                    await this.fetchLock.sleep(this.congestionSleep)
                    this.appendedIds.pop()
                    i--
                    continue
                }
                data1=data
            }
            else data1=item.data
            const hole=new Hole()
            hole.render(data1,this.local,isRef,this.stars.includes(id),this.maxId,this.maxETimestamp)
            hole.handleStar=async ()=>{
                if(this.token.length===0)return
                const result0=await this.fetchLock.get()
                if(result0===false)return
                const {classList}=hole.starElement
                const starrd=classList.contains('checked')
                const result1=await get.star(id,starrd,this.token,this.password)
                if(result1===503||result1===500){
                    await this.fetchLock.release(result0)
                    return
                }
                if(starrd){
                    for(let i=0;i<this.stars.length;i++){
                        if(this.stars[i]===id)this.stars[i]=-1
                    }
                }
                else this.stars.push(id)
                window.localStorage.setItem('ph-stars',this.stars.join(','))
                classList.toggle('checked')
                await this.fetchLock.release(result0)
            }
            hole.handleRefresh=async ()=>{
                await this.refreshHole(hole)
            }
            this.flow.append(hole.element)
            let result0:get.CommentData[]
            while(true){
                const result1=await this.getAndRenderComments(id,hole,data1.reply,data1.hidden)
                if(result1===500){
                    this.errCount++
                    if(this.errCount>this.errLimit)return 500
                    await this.fetchLock.sleep(this.errSleep)
                    continue
                }
                if(result1===401){
                    await this.fetchLock.sleep(this.unauthorizedSleep)
                    continue
                }
                if(result1===503){
                    await this.fetchLock.sleep(this.congestionSleep)
                    continue
                }
                result0=result1
                break
            }
            if(this.refMode==='none')continue
            let text=data1.text
            if(typeof text!=='string')text=''
            const fullText=text+'\n'+result0.map(val=>{
                let text=val.text
                if(typeof text!=='string')text=''
                return text
            }).join('\n')
            if(!isRef||this.refMode==='recur'){
                const result=fullText.match(/\b\d{6,7}\b|%23\d{3,7}\b/g)
                if(result!==null){
                    const length=Math.min(result.length,this.refLimit)
                    for(let j=0;j<length;j++){
                        let id=result[j]
                        if(id.startsWith('%23'))id=id.slice(3)
                        data0.splice(i+j+1,0,{data:{pid:id},isRef:true,idOnly:true})
                    }
                }
            }
        }
        return 200
    }
    fillterStars(data:get.HoleData[]){
        const out:get.HoleData[]=[]
        for(let i=0;i<data.length;i++){
            const item=data[i]
            const timestamp=Number(item.timestamp)
            if(timestamp<this.s
            ||this.e>0&&timestamp>this.e)continue
            let text=item.text
            if(typeof text!=='string')text=''
            let ok=true
            for(let i=0;i<this.keys.length;i++){
                if(!text.includes(this.keys[i])){
                    ok=false
                    break
                }
            }
            if(!ok)continue
            out.push(item)
        }
        return out
    }
    async append(){
        if(this.end||!this.inited)return
        const result=await this.appendLock.get()
        if(result===false)return
        if(this.end){
            await this.appendLock.release(result)
            return
        }
        let data0:AppendData[]|500
        if(this.star){
            this.end=true
            this.page=0
            while(true){
                const data1=await get.getStars(this.token,this.password)
                if(data1===401){data0=[];break}
                if(data1===500){
                    this.errCount++
                    if(this.errCount>this.errLimit){data0=data1;break}
                    await this.fetchLock.sleep(this.errSleep)
                    continue
                }
                if(data1===503){
                    await this.fetchLock.sleep(this.congestionSleep)
                    continue
                }
                this.stars=data1.map(val=>Number(val.pid))
                window.localStorage.setItem('ph-stars',this.stars.join(','))
                data0=this.fillterStars(data1).map(data=>{return {data:data,isRef:false,idOnly:false}})
                break
            }
        }
        else if(this.ids.length>0){
            data0=this.ids.slice(this.page,this.page+1).map(id=>{return {data:{pid:id},isRef:false,idOnly:true}})
            if(this.ids.length===this.page+1)this.end=true
        }
        else{
            while(true){
                const data1=await get.getPage(this.key,this.page+1,this.order,this.s,this.e,this.token,this.password)
                if(data1===401){
                    data0=500
                    break
                }
                if(data1===500){
                    this.errCount++
                    if(this.errCount>this.errLimit){
                        data0=data1
                        break
                    }
                    await this.fetchLock.sleep(this.errSleep)
                    continue
                }
                if(data1===503){
                    await this.fetchLock.sleep(this.congestionSleep)
                    continue
                }
                data0=data1.map(data=>{return {data:data,isRef:false,idOnly:false}})
                break
            }
        }
        if(data0===500)this.end=true
        else{
            if(data0.length===0)this.end=true
            else{
                this.page++
                this.pageInput.value=this.page.toString()
                const result=await this.basicallyAppend(data0)
                if(result===500)this.end=true
            }
        }
        if(this.end){
            const end=document.createElement('div')
            end.classList.add('end')
            this.flow.append(end)
        }
        else{
            const hr=document.createElement('div')
            hr.classList.add('hr')
            this.flow.append(hr)
        }
        await this.appendLock.release(result)
    }
    async autoAppend(){
        if(Date.now()<this.lastAppend+250
        ||window.pageYOffset+window.innerHeight<document.body.scrollHeight-this.appendThreshod
        ||this.appendLock.busy)return
        this.lastAppend=Date.now()
        await this.append()
    }
    async clear(){
        this.flow.innerHTML=''
        await this.fetchLock.kill()
        await this.appendLock.kill()
        this.parseFillter()
        if(this.star){
            this.order='id'
        }
        this.flow.innerHTML=''
        this.orderSelect.value=this.order
        this.fillterInput.value=this.fillter
        this.pageInput.value=this.page.toString()
        if(this.star){
            this.starCheckbox.classList.add('checked')
        }
        else{
            this.starCheckbox.classList.remove('checked')
        }
        if(this.auto){
            this.autoCheckbox.classList.add('checked')
        }
        else{
            this.autoCheckbox.classList.remove('checked')
        }
        this.end=false
        this.appendedIds=[]
        this.errCount=0
        const storage=window.localStorage
        const oldIdStr=storage.getItem('ph-max-id')
        if(oldIdStr!==null){
            const oldId=Number(oldIdStr)
            if(!isNaN(oldId))this.maxId=oldId
        }
        const oldEStr=storage.getItem('ph-max-etimestamp')
        if(oldEStr!==null){
            const oldE=Number(oldEStr)
            if(!isNaN(oldE))this.maxETimestamp=oldE
        }
        await this.fetchLock.revive()
        await this.appendLock.revive()
    }
    async refresh(){
        const result=this.fillterInput.value.trim().match(/^\w{32,}$/)
        if(result!==null&&result.length>0){
            const tmp=result[0]
            this.token=tmp.slice(-32)
            this.password=tmp.slice(0,-32)
            window.localStorage.setItem('ph-token',this.token)
            window.localStorage.setItem('ph-password',this.password)
            this.fillterInput.value=''
        }
        this.fillter=this.fillterInput.value.trim()
        const p1=Number(this.pageInput.value)
        if(!isNaN(p1)&&p1>=1&&p1%1===0){
            this.page=p1-1
        }
        const order=this.orderSelect.value
        if(order==='id')this.order='id'
        else if(order==='active')this.order='active'
        else if(order==='hot')this.order='hot'
        this.star=this.starCheckbox.classList.contains('checked')
        await this.clear()
        await this.append()
    }
    async init(){
        const params=new URLSearchParams(document.location.search)
        if(params.has('auto')){
            this.auto=true
        }
        if(params.has('star')){
            this.star=true
        }
        const order=params.get('order')
        if(order==='active'){
            this.order='active'
        }
        else if(order==='hot'){
            this.order='hot'
        }
        const fillter=params.get('fillter')
        if(typeof fillter==='string'&&fillter.length>0){
            this.fillter=decodeURIComponent(fillter).trim()
        }
        const page0=params.get('page')
        if(typeof page0==='string'&&page0.length>0){
            const page1=Number(page0)
            if(!isNaN(page1)&&page1>=1&&page1%1===0){
                this.page=page1
            }
        }
        const token=window.localStorage.getItem('ph-token')
        if(typeof token==='string'&&token.length===32){
            this.token=token
        }
        const password=window.localStorage.getItem('ph-password')
        if(typeof password==='string'&&password.length>0){
            this.password=password
        }
        const stars=window.localStorage.getItem('ph-stars')
        if(stars!==null){
            this.stars=stars.split(',').map(val=>Number(val))
        }

        if(params.has('local')){
            this.local=true
        }
        const refMode=params.get('refMode')
        if(refMode==='recur'){
            this.refMode='recur'
        }
        else if(refMode==='none'){
            this.refMode='none'
        }
        const refLimit0=params.get('refLimit')
        if(refLimit0!==null){
            const refLimit1=Number(refLimit0)
            if(!isNaN(refLimit1)&&refLimit1>=0&&refLimit1%1===0){
                this.refLimit=refLimit1
            }
        }
        const scrollSpeed0=params.get('scrollSpeed')
        if(scrollSpeed0!==null){
            const scrollSpeed1=Number(scrollSpeed0)
            if(!isNaN(scrollSpeed1)&&scrollSpeed1>0){
                this.scrollSpeed=scrollSpeed1
            }
        }
        const appendThreshod0=params.get('appendThreshod')
        if(appendThreshod0!==null){
            const appendThreshod1=Number(appendThreshod0)
            if(!isNaN(appendThreshod1)&&appendThreshod1>=0){
                this.appendThreshod=appendThreshod1
            }
        }
        const localCommentsThreshod0=params.get('localCommentsThreshod')
        if(localCommentsThreshod0!==null){
            const localCommentsThreshod1=Number(localCommentsThreshod0)
            if(!isNaN(localCommentsThreshod1)&&localCommentsThreshod1>=0){
                this.localCommentsThreshod=localCommentsThreshod1
            }
        }
        const congestionSleep0=params.get('congestionSleep')
        if(congestionSleep0!==null){
            const congestionSleep1=Number(congestionSleep0)
            if(!isNaN(congestionSleep1)&&congestionSleep1>=5000){
                this.congestionSleep=congestionSleep1
            }
        }
        const unauthorizedSleep0=params.get('unauthorizedSleep')
        if(unauthorizedSleep0!==null){
            const unauthorizedSleep1=Number(unauthorizedSleep0)
            if(!isNaN(unauthorizedSleep1)&&unauthorizedSleep1>=300000){
                this.unauthorizedSleep=unauthorizedSleep1
            }
        }
        const errLimit0=params.get('errLimit')
        if(errLimit0!==null){
            const errLimit1=Number(errLimit0)
            if(!isNaN(errLimit1)&&errLimit1>=0&&errLimit1%1===0){
                this.errLimit=errLimit1
            }
        }
        const errSleep0=params.get('errSleep')
        if(errSleep0!==null){
            const errSleep1=Number(errSleep0)
            if(!isNaN(errSleep1)&&errSleep1>=5000){
                this.errSleep=errSleep1
            }
        }
        await this.clear()
        this.inited=true
        await this.append()
    }
    async refreshHole(hole:Hole){
        const {id}=hole
        if(isNaN(id)||id===-1)return 500
        const symbol=await this.fetchLock.get()
        if(symbol===false)return 500
        let data1:get.HoleData|404|500
        while(true){
            const data=await get.getHole(id,this.token,this.password)
            if(data===404){
                data1=404
                break
            }
            if(data===401){
                data1=500
                break
            }
            if(data===500){
                this.errCount++
                if(this.errCount>this.errLimit){
                    data1=500
                    break
                }
                await this.fetchLock.sleep(this.errSleep)
                continue
            }
            if(data===503){
                await this.fetchLock.sleep(this.congestionSleep)
                continue
            }
            data1=data
            break
        }
        await this.fetchLock.release(symbol)
        if(typeof data1==='number')return data1
        hole.render(data1,this.local,hole.isRef,this.stars.includes(id),this.maxId,this.maxETimestamp)
        while(true){
            const result1=await this.getAndRenderComments(id,hole,data1.reply,data1.hidden)
            if(result1===500){
                this.errCount++
                if(this.errCount>this.errLimit)return 500
                await this.fetchLock.sleep(this.errSleep)
                continue
            }
            if(result1===401){
                await this.fetchLock.sleep(this.unauthorizedSleep)
                continue
            }
            if(result1===503){
                await this.fetchLock.sleep(this.congestionSleep)
                continue
            }
            break
        }
        return 200
    }
}