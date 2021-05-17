import {Hole,prettyDate, prettyText} from '../pure/hole'
import {LRStruct} from '../pure/lrStruct'
import {KillableLock} from '../../wheels/lock'
import * as get from '../../funcs/get'
import * as css from '../../lib/css'
import * as fonts from '../../lib/fonts'
import { Button, Checkbox, CommonEle, Form, FormLine } from '../pure/common'
import { compress } from '../../funcs/img'
type AppendData={
    data:get.HoleData
    isRef:boolean
    idOnly:false
}|{
    data:{pid:number|string}
    isRef:boolean
    idOnly:true
    comment?:get.CommentData
}
export class Main extends LRStruct{
    flow=new CommonEle(['flow'])
    panel=new Form('panel')
    styleEle=document.createElement('style')
    fetchLock=new KillableLock()
    appendLock=new KillableLock()
    inputs={
        fillter:document.createElement('input'),
        page:document.createElement('input'),
        password:document.createElement('input'),
        token:document.createElement('input'),
        refLimit:document.createElement('input'),
        s:document.createElement('input'),
        e:document.createElement('input'),
        img:document.createElement('input')
    }
    selects={
        order:document.createElement('select'),
        colorScheme:document.createElement('select'),
        refMode:document.createElement('select'),
        foldText:document.createElement('select'),
        foldImg:document.createElement('select'),
        foldComments:document.createElement('select'),
        fontSize:document.createElement('select')
    }
    textareas={
        text:document.createElement('textarea'),
        view:document.createElement('textarea')
    }
    checkboxes={
        add:new Checkbox('add'),
        star:new Checkbox('star'),
        logout:new Checkbox('logout'),
        login:new Checkbox('login'),
        send:new Checkbox('send'),
        refresh:new Checkbox('refresh'),
        settings:new Checkbox('settings'),
        messages:new Checkbox('messages'),
        img:new Checkbox('img'),
        view:new Checkbox('view')
    }
    forms={
        add:new Form('add'),
        login:new Form('login'),
        settings:new Form('settings'),
        messages:new Form('messages'),
        view:new Form('view')
    }
    buttons={
        delete:new Button('delete')
    }
    auto=false
    star=false
    order:get.Order='id'
    fillter=''
    page=0
    token=''
    password=''
    colorScheme:'auto'|'dark'|'light'='auto'
    fontSize:'small'|'medium'|'large'='small'
    refMode:'direct'|'recur'='direct'
    foldText:'true'|'false'='false'
    foldImg:'true'|'false'='false'
    foldComments:'true'|'false'='true'
    refLimit=3
    
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
    scrollSpeed=500
    appendThreshod=1000
    congestionSleep=5000
    recaptchaSleep=1800000
    errLimit=10
    errSleep=5000
    dRegExp=/\.d\d{0,8}/g
    idsRegExp=/#\d{1,7}-\d{1,7}|#\d{1,4}\*\*\*|#\d{1,5}\*\*|#\d{1,6}\*|#\d{1,7}/g
    constructor(public parent:HTMLElement){
        super()
        parent.append(this.element)
        parent.append(this.styleEle)
        this.sideContent.append(this.panel
            .append(new CommonEle(['tools'])
                .append(this.checkboxes.add)
                .append(this.checkboxes.star)
                .append(this.checkboxes.refresh))
            .append(this.forms.add
                .append(this.textareas.text)
                .append(this.checkboxes.img
                    .append(this.inputs.img))
                .append(new CommonEle(['attachment'])
                    .append(this.buttons.delete))
                .append(this.checkboxes.send))
            .append(new FormLine('order')
                .append(this.selects.order))
            .append(new FormLine('fillter')
                .append(this.inputs.fillter))
            .append(new FormLine('start date')
                .append(this.inputs.s))
            .append(new FormLine('end date')
                .append(this.inputs.e))
            .append(new FormLine('page')
                .append(this.inputs.page))
            .append(this.checkboxes.messages)
            .append(this.forms.messages)
            .append(this.checkboxes.settings)
            .append(this.forms.settings
                .append(new FormLine('color scheme')
                    .append(this.selects.colorScheme))
                .append(new FormLine('font size')
                    .append(this.selects.fontSize))
                .append(new FormLine('ref mode')
                    .append(this.selects.refMode))
                .append(new FormLine('ref limit')
                    .append(this.inputs.refLimit))
                .append(new FormLine('fold long text')
                    .append(this.selects.foldText))
                .append(new FormLine('fold long image')
                    .append(this.selects.foldImg))
                .append(new FormLine('fold long comments')
                    .append(this.selects.foldComments))
                .append(this.checkboxes.view)
                .append(this.forms.view
                    .append(this.textareas.view))
                .append(this.checkboxes.logout)))
        this.main.append(this.flow)
        this.forms.login.append(new FormLine('token')
            .append(this.inputs.token))
        .append(new FormLine('password')
            .append(this.inputs.password))
        .append(this.checkboxes.login)

        this.styleEle.textContent=fonts.icomoon+css.main+css.dark
        this.selects.order.innerHTML='<option>id</option><option>active</option><option>hot</option>'
        this.selects.colorScheme.innerHTML='<option>auto</option><option>dark</option><option>light</option>'
        this.selects.fontSize.innerHTML='<option>small</option><option>medium</option><option>large</option>'
        this.selects.refMode.innerHTML='<option>direct</option><option>recur</option>'
        this.selects.foldText.innerHTML='<option>true</option><option>false</option>'
        this.selects.foldImg.innerHTML='<option>true</option><option>false</option>'
        this.selects.foldComments.innerHTML='<option>true</option><option>false</option>'
        this.inputs.page.type='number'
        this.inputs.page.min='1'
        this.inputs.refLimit.type='number'
        this.inputs.refLimit.min='0'
        this.inputs.token.type='password'
        this.inputs.password.type='password'
        this.inputs.s.type='date'
        this.inputs.e.type='date'
        this.inputs.img.type='file'
        this.inputs.img.accept='image/*'
        parent.classList.add('root')
        this.forms.add.classList.add('hide')
        this.forms.login.classList.add('hole')
        this.forms.messages.classList.add('hide')
        this.forms.settings.classList.add('hide')
        this.forms.view.classList.add('hide')

        const params=new URLSearchParams(document.location.search)
        const fillter=params.get('fillter')
        if(typeof fillter==='string'&&fillter.length>0){
            this.fillter=decodeURIComponent(fillter).trim()
        }
        if(params.has('local')){
            this.local=true
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
        const colorScheme=window.localStorage.getItem('ph-color-scheme')
        if(colorScheme==='auto'||colorScheme==='dark'||colorScheme==='light'){
            this.colorScheme=colorScheme
        }
        this.parent.dataset.colorScheme=this.colorScheme
        const fontSize=window.localStorage.getItem('ph-font-size')
        if(fontSize==='small'||fontSize==='medium'||fontSize==='large'){
            this.fontSize=fontSize
        }
        this.parent.dataset.fontSize=this.fontSize
        const refMode=window.localStorage.getItem('ph-ref-mode')
        if(refMode==='direct'||refMode==='recur'){
            this.refMode=refMode
        }
        const tmp=window.localStorage.getItem('ph-ref-limit')
        if(tmp!==null){
            const refLimit=Number(tmp)
            if(refLimit>=0){
                this.refLimit=refLimit
            }
        }
        const foldText=window.localStorage.getItem('ph-fold-text')
        if(foldText==='true'||foldText==='false'){
            this.foldText=foldText
        }
        this.parent.dataset.foldText=this.foldText
        const foldImg=window.localStorage.getItem('ph-fold-img')
        if(foldImg==='true'||foldImg==='false'){
            this.foldImg=foldImg
        }
        this.parent.dataset.foldImg=this.foldImg
        const foldComments=window.localStorage.getItem('ph-fold-comments')
        if(foldComments==='true'||foldComments==='false'){
            this.foldComments=foldComments
        }
        this.parent.dataset.foldComments=this.foldComments

        this.inputs.fillter.addEventListener('keydown',async e=>{
            if(e.key==='Enter'){
                this.inputs.page.value='1'
                await this.start()
            }
        })
        this.inputs.page.addEventListener('keydown',async e=>{
            if(e.key==='Enter'){
                await this.start()
            }
        })
        this.inputs.s.addEventListener('keydown',async e=>{
            if(e.key==='Enter'){
                this.inputs.page.value='1'
                await this.start()
            }
        })
        this.inputs.e.addEventListener('keydown',async e=>{
            if(e.key==='Enter'){
                this.inputs.page.value='1'
                await this.start()
            }
        })
        this.inputs.refLimit.addEventListener('blur',async e=>{
            const refLimit=Number(this.inputs.refLimit.value)
            if(refLimit>=0){
                this.refLimit=refLimit
                window.localStorage.setItem('ph-ref-limit',refLimit.toString())
            }
        })
        this.selects.refMode.addEventListener('input',async e=>{
            const refMode=this.selects.refMode.value
            if(refMode==='direct'||refMode==='recur'){
                this.refMode=refMode
                window.localStorage.setItem('ph-ref-mode',refMode)
            }
        })
        this.selects.colorScheme.addEventListener('input',e=>{
            const val=this.selects.colorScheme.value
            if(val==='auto'||val==='dark'||val==='light'){
                this.colorScheme=val
                window.localStorage.setItem('ph-color-scheme',val)
                this.parent.dataset.colorScheme=val
            }
        })
        this.selects.fontSize.addEventListener('input',e=>{
            const val=this.selects.fontSize.value
            if(val==='small'||val==='medium'||val==='large'){
                this.fontSize=val
                window.localStorage.setItem('ph-font-size',val)
                this.parent.dataset.fontSize=val
            }
        })
        this.selects.foldText.addEventListener('input',async e=>{
            const val=this.selects.foldText.value
            if(val==='true'||val==='false'){
                this.foldText=val
                window.localStorage.setItem('ph-fold-text',val)
                this.parent.dataset.foldText=val
            }
        })
        this.selects.foldImg.addEventListener('input',async e=>{
            const val=this.selects.foldImg.value
            if(val==='true'||val==='false'){
                this.foldImg=val
                window.localStorage.setItem('ph-fold-img',val)
                this.parent.dataset.foldImg=val
            }
        })
        this.selects.foldComments.addEventListener('input',async e=>{
            const val=this.selects.foldComments.value
            if(val==='true'||val==='false'){
                this.foldComments=val
                window.localStorage.setItem('ph-fold-comments',val)
                this.parent.dataset.foldComments=val
            }
        })
        this.selects.order.addEventListener('input',async e=>{
            this.inputs.page.value='1'
            if(this.selects.order.value==='hot'){
                this.inputs.fillter.value='.d '+this.inputs.fillter.value
            }
            if(this.selects.order.value!=='id'){
                this.checkboxes.star.classList.remove('checked')
            }
            await this.start()
        })
        this.checkboxes.star.addEventListener('click',async e=>{
            this.inputs.page.value='1'
            this.checkboxes.star.classList.toggle('checked')
            await this.start()
        })
        this.checkboxes.login.addEventListener('click',async e=>{
            if(this.inputs.token.value.length!==32){
                alert('Invalid token.')
                return
            }
            this.token=this.inputs.token.value
            this.password=this.inputs.password.value
            window.localStorage.setItem('ph-token',this.token)
            window.localStorage.setItem('ph-password',this.password)
            await this.start()
        })
        this.checkboxes.logout.addEventListener('click',async e=>{
            const {classList}=this.checkboxes.logout
            if(classList.contains('checking'))return
            classList.add('checking')
            await this.clear()
            this.inputs.token.value=this.token
            this.inputs.password.value=this.password
            this.token=''
            this.password=''
            this.stars=[]
            this.maxId=-1
            this.maxETimestamp=0
            window.localStorage.removeItem('ph-token')
            window.localStorage.removeItem('ph-password')
            window.localStorage.removeItem('ph-stars')
            window.localStorage.removeItem('ph-max-id')
            window.localStorage.removeItem('ph-max-etimestamp')
            this.inputs.page.value='1'
            await this.start()
            classList.remove('checking')
        })
        this.checkboxes.send.addEventListener('click',async e=>{
            const {classList}=this.checkboxes.send
            if(classList.contains('checking'))return
            if(this.token.length===0)return
            let src=''
            if(this.forms.add.classList.contains('img')){
                const img=this.buttons.delete.element.previousElementSibling
                if(img!==null&&img instanceof HTMLImageElement){
                    const tmp=img.src
                    if(tmp.startsWith('data:image/jpeg;base64,')){
                        src=tmp.slice(23)
                    }
                }
            }
            const text=this.textareas.text.value
            if(text.length===0&&src.length===0){
                alert('Empty.')
                return
            }
            classList.add('checking')
            const result0=await this.fetchLock.get()
            if(result0===false){
                classList.remove('checking')
                return
            }
            const result1=await get.add(text,src,this.token)
            await this.fetchLock.release(result0)
            if(result1===500||result1===503){
                classList.remove('checking')
                return
            }
            const {id}=result1
            this.textareas.text.value=''
            if(this.forms.add.classList.contains('img')){
                this.forms.add.classList.remove('img')
                const img=this.buttons.delete.element.previousElementSibling
                if(img!==null){
                    img.remove()
                }
            }
            this.forms.add.classList.add('hide')
            this.checkboxes.add.classList.remove('checked')
            this.checkboxes.star.classList.remove('checked')
            this.selects.order.value='id'
            this.inputs.fillter.value=''
            this.inputs.page.value='1'
            this.stars.push(id)
            window.localStorage.setItem('ph-stars',this.stars.join(','))
            classList.remove('checking')
            await this.start()
        })
        this.checkboxes.refresh.addEventListener('click',async e=>{
            this.inputs.page.value='1'
            await this.start()
        })
        this.checkboxes.add.addEventListener('click',async e=>{
            const {classList}=this.checkboxes.add
            if(classList.contains('checked')){
                this.forms.add.classList.add('hide')
                classList.remove('checked')
            }else{
                this.forms.add.classList.remove('hide')
                classList.add('checked')
            }
        })
        this.checkboxes.messages.addEventListener('click',async e=>{
            const {classList}=this.checkboxes.messages
            if(classList.contains('checked')){
                this.forms.messages.classList.add('hide')
                classList.remove('checked')
            }else{
                if(this.token.length===0)return
                classList.add('checking')
                this.forms.messages.element.innerHTML=''
                this.forms.messages.classList.remove('hide')
                const data=await get.getMsgs(this.token)
                if(typeof data==='number'){
                    classList.remove('checking')
                    return
                }
                for(let i=0;i<data.length;i++){
                    let {content,timestamp,title}=data[i]
                    let indStr=''
                    if(typeof title==='string'&&title.length>0){
                        indStr+=`${title} `
                    }
                    indStr+=prettyDate(timestamp)
                    if(typeof content!=='string'){
                        content=''
                    }
                    this.forms.messages.append(new CommonEle([])
                        .append(new CommonEle(['index']).setText(indStr))
                        .append(new CommonEle(['text']).setHTML(prettyText(content))))
                }
                if(data.length===0){
                    this.forms.messages.element.innerHTML='empty'
                }
                classList.add('checked')
                classList.remove('checking')
            }
        })
        this.checkboxes.settings.addEventListener('click',async e=>{
            const {classList}=this.checkboxes.settings
            if(classList.contains('checked')){
                this.forms.settings.classList.add('hide')
                classList.remove('checked')
            }else{
                this.forms.settings.classList.remove('hide')
                classList.add('checked')
            }
        })
        this.checkboxes.view.addEventListener('click',e=>{
            this.checkboxes.view.classList.toggle('checked')
            if(this.checkboxes.view.classList.contains('checked')){
                this.textareas.view.value=this.token
                this.forms.view.classList.remove('hide')
            }else{
                this.textareas.view.value=''
                this.forms.view.classList.add('hide')
            }
        })
        this.inputs.img.addEventListener('change',async e=>{
            const files=this.inputs.img.files
            if(files===null||files.length===0
                ||this.checkboxes.img.classList.contains('checking'))return
            this.checkboxes.img.classList.add('checking')
            const src=await compress(URL.createObjectURL(files[0]))
            this.inputs.img.value=''
            if(src.length===0){
                this.checkboxes.img.classList.remove('checking')
                return
            }
            const img=document.createElement('img')
            img.classList.add('dark')
            img.src=src
            this.buttons.delete.before(img)
            this.forms.add.classList.add('img')
            this.checkboxes.img.classList.remove('checking')
        })
        this.buttons.delete.addEventListener('click',e=>{
            this.forms.add.classList.remove('img')
            const img=this.buttons.delete.element.previousElementSibling
            if(img!==null){
                img.remove()
            }
        })
        setInterval(async()=>{
            if(!this.inited)return
            if(this.auto){
                window.scrollBy({left:0,top:this.scrollSpeed,behavior:"smooth"})
            }
        },1000)
        setInterval(async()=>{
            if(!this.inited)return
            await this.autoAppendHols()
        },500)
    }
    async getAndRenderComments(hole:Hole){
        const {id,commentNum}=hole
        if(isNaN(id)||id===-1)return 500
        const result0=await this.fetchLock.get()
        if(result0===false)return 500
        const result1=await get.getComments(id,commentNum,this.token,this.password)
        await this.fetchLock.release(result0)
        if(result1===503||result1===500){
            return result1
        }
        hole.renderComments(result1)
        for(let i=0;i<result1.length;i++){
            const item=result1[i]
            const {text}=item
            if(typeof text!=='string')continue
            if(text.startsWith('[Helper]')){
                hole.renderComments([item])
                return 423
            }
        }
        return result1
    }
    parseFillter(){
        this.ids=[]
        this.keys=[]
        this.key=''
        const fillter=this.fillter.trim()
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
            const s=new Date(`${y}/${m}/${d1} 00:00:00`).getTime()/1000
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
        this.fillter=fillter.replace(this.dRegExp,' ').trim()
        this.key=this.fillter.replace(this.idsRegExp,' ').trim()
        this.keys=this.key.split(/\s+/)
    }
    async basicallyAppendHoles(data0:AppendData[]){
        for(let i=0;i<data0.length;i++){
            let item=data0[i]
            const id=Number(item.data.pid)
            if(this.appendedIds.includes(id))continue
            this.appendedIds.push(id)
            let data1:get.HoleData
            if(item.idOnly){
                if(item.comment===undefined&&this.password.length>0){
                    const comment=await get.getComment(id,this.token,this.password)
                    if(comment===403){
                        this.password=''
                        window.localStorage.setItem('ph-password',this.password)
                        this.parent.classList.add('weak')
                    }else if(comment===503){
                        await this.fetchLock.sleep(this.congestionSleep)
                        this.appendedIds.pop()
                        i--
                        continue
                    }else if(comment===500){
                        this.errCount++
                        if(this.errCount>this.errLimit)return 500
                        await this.fetchLock.sleep(this.errSleep)
                        this.appendedIds.pop()
                        i--
                        continue
                    }else if(comment!==404){
                        const {pid}=comment
                        data0.splice(i+1,0,{data:{pid:pid},isRef:item.isRef,idOnly:true,comment:comment})
                    }
                }
                const data=await get.getHole(id,this.token,this.password)
                if(data===404)continue
                if(data===401){
                    return 401
                }
                if(data===403){
                    this.password=''
                    window.localStorage.setItem('ph-password',this.password)
                    this.parent.classList.add('weak')
                    continue
                }
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
            hole.render(data1,this.local,item.isRef,this.stars.includes(id),this.maxId,this.maxETimestamp)
            hole.handleStar=async ()=>{
                if(this.token.length===0)return
                const {classList}=hole.checkboxes.star
                const starrd=classList.contains('checked')
                const result0=await this.fetchLock.get()
                if(result0===false)return
                const result1=await get.star(id,starrd,this.token)
                await this.fetchLock.release(result0)
                if(result1===503||result1===500)return
                let likenum=Number(hole.checkboxes.star.element.textContent)
                if(starrd){
                    for(let i=0;i<this.stars.length;i++){
                        if(this.stars[i]===id)this.stars[i]=-1
                    }
                    likenum--
                }else{
                    this.stars.push(id)
                    likenum++
                }
                if(result1!==409){
                    if(likenum===0){
                        hole.checkboxes.star.element.textContent=''
                    }else{
                        hole.checkboxes.star.element.textContent=likenum.toString()+' '
                    }
                }
                window.localStorage.setItem('ph-stars',this.stars.join(','))
                classList.toggle('checked')
            }
            hole.handleRefresh=async ()=>{
                await this.refreshHole(hole)
            }
            hole.handleSend=async ()=>{
                if(this.token.length===0)return
                const text=hole.textareas.comment.value
                if(text.length===0||text.match(hole.toNameRegExp)!==null)return
                const result0=await this.fetchLock.get()
                if(result0===false)return
                const result1=await get.comment(id,text,this.token)
                await this.fetchLock.release(result0)
                if(result1!==200){
                    return
                }
                hole.textareas.comment.value=''
                hole.forms.comment.classList.add('hide')
                hole.checkboxes.comment.classList.remove('checked')
                hole.reverse=true
                this.stars.push(id)
                window.localStorage.setItem('ph-stars',this.stars.join(','))
                await this.refreshHole(hole)
            }
            this.flow.append(hole.element)
            let result0:get.CommentData[]
            if(item.idOnly&&item.comment!==undefined){
                result0=[item.comment]
                hole.renderComments(result0)
            }else while(true){
                const result1=await this.getAndRenderComments(hole)
                if(result1===500){
                    this.errCount++
                    if(this.errCount>this.errLimit)return 500
                    await this.fetchLock.sleep(this.errSleep)
                    continue
                }
                if(result1===423){
                    await this.fetchLock.sleep(this.recaptchaSleep)
                    continue
                }
                if(result1===503){
                    await this.fetchLock.sleep(this.congestionSleep)
                    continue
                }
                result0=result1
                break
            }
            if(this.refLimit<=0)continue
            let text=data1.text
            if(typeof text!=='string')text=''
            const fullText=text+'\n'+result0.map(val=>{
                let text=val.text
                if(typeof text!=='string')text=''
                return text
            }).join('\n')
            if(!item.isRef||this.refMode==='recur'){
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
    async appendHoles(){
        if(this.end||!this.inited)return
        const result=await this.appendLock.get()
        if(result===false)return
        if(this.token.length===0){
            this.flow.element.innerHTML=''
            this.flow.append(this.forms.login)
            this.parent.classList.add('login')
            this.end=true
        }else{
            this.parent.classList.remove('login')
        }
        if(this.end){
            await this.appendLock.release(result)
            return
        }
        let data0:AppendData[]|500|401|403
        if(this.star){
            this.end=true
            this.page=0
            while(true){
                const data1=await get.getStars(this.token)
                if(data1===401){
                    data0=data1
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
                    data0=data1
                    break
                }
                if(data1===403){
                    data0=data1
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
        if(data0===401){
            alert('Wrong token.')
            this.flow.element.innerHTML=''
            this.flow.append(this.forms.login)
            this.parent.classList.add('login')
            this.end=true
            await this.appendLock.release(result)
            return
        }else if(data0===403){
            alert('Permission denied.')
            this.password=''
            window.localStorage.setItem('ph-password',this.password)
            this.end=true
        }else if(data0===500){
            this.end=true
        }else{
            if(data0.length===0){
                this.end=true
            }else{
                this.page++
                this.inputs.page.value=this.page.toString()
                const result1=await this.basicallyAppendHoles(data0)
                if(result1===401){
                    alert('Wrong token.')
                    this.flow.element.innerHTML=''
                    this.flow.append(this.forms.login)
                    this.parent.classList.add('login')
                    this.end=true
                    await this.appendLock.release(result)
                    return
                }else if(result1===500){
                    this.end=true
                }
            }
        }
        if(this.end){
            const end=document.createElement('div')
            end.classList.add('end')
            this.flow.append(end)
        }else{
            const hr=document.createElement('div')
            hr.classList.add('hr')
            this.flow.append(hr)
        }
        await this.appendLock.release(result)
    }
    async autoAppendHols(){
        if(Date.now()<this.lastAppend+250
        ||window.pageYOffset+window.innerHeight<document.body.scrollHeight-this.appendThreshod
        ||this.appendLock.busy)return
        this.lastAppend=Date.now()
        await this.appendHoles()
    }
    async clear(){
        this.flow.element.innerHTML=''
        this.parseFillter()
        await this.fetchLock.kill()
        await this.appendLock.kill()
        if(this.password.length===0){
            this.order='id'
            this.parent.classList.add('weak')
        }else{
            this.parent.classList.remove('weak')
        }
        if(this.ids.length>0){
            this.order='id'
            this.parent.classList.add('ids')
        }else{
            this.parent.classList.remove('ids')
        }
        if(this.star){
            this.order='id'
            this.parent.classList.add('star')
        }else{
            this.parent.classList.remove('star')
        }
        this.parent.dataset.order=this.order

        if(this.order==='id'&&!this.star){
            this.s=0
            this.e=0
        }
        this.flow.element.innerHTML=''
        this.selects.order.value=this.order
        this.selects.colorScheme.value=this.colorScheme
        this.selects.fontSize.value=this.fontSize
        this.selects.refMode.value=this.refMode
        this.selects.foldText.value=this.foldText
        this.selects.foldImg.value=this.foldImg
        this.selects.foldComments.value=this.foldComments
        this.inputs.fillter.value=this.fillter
        this.inputs.page.value=this.page.toString()
        this.inputs.refLimit.value=this.refLimit.toString()
        if(this.s===0){
            this.inputs.s.value=''
        }else{
            const date=new Date(this.s*1000)
            this.inputs.s.value=`${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`
        }
        if(this.e===0){
            this.inputs.e.value=''
        }else{
            const date=new Date(this.e*1000-24*3600000)
            this.inputs.e.value=`${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`
        }
        if(this.star){
            this.checkboxes.star.classList.add('checked')
        }
        else{
            this.checkboxes.star.classList.remove('checked')
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
    async start(){
        this.fillter=this.inputs.fillter.value.trim()
        const p1=Number(this.inputs.page.value)
        if(!isNaN(p1)&&p1>=1&&p1%1===0){
            this.page=p1-1
        }
        const order=this.selects.order.value
        if(order==='id')this.order='id'
        else if(order==='active')this.order='active'
        else if(order==='hot')this.order='hot'
        this.star=this.checkboxes.star.classList.contains('checked')
        let dateStr=this.inputs.s.value
        if(dateStr===''){
            this.s=0
        }else{
            this.s=new Date(dateStr+' 00:00:00').getTime()/1000
        }
        dateStr=this.inputs.e.value
        if(dateStr===''){
            this.e=0
        }else{
            this.e=new Date(dateStr+' 00:00:00').getTime()/1000+24*3600
        }
        await this.clear()
        await this.appendHoles()
    }
    async init(){
        await this.clear()
        this.inited=true
        await this.appendHoles()
    }
    async refreshHole(hole:Hole){
        const {id}=hole
        if(isNaN(id)||id===-1)return 500
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
            if(data===403){
                this.password=''
                window.localStorage.setItem('ph-password',this.password)
                this.parent.classList.add('weak')
                data1=404
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
        if(typeof data1==='number')return data1
        hole.render(data1,this.local,hole.isRef,this.stars.includes(id),this.maxId,this.maxETimestamp)
        while(true){
            const result1=await this.getAndRenderComments(hole)
            if(result1===500){
                this.errCount++
                if(this.errCount>this.errLimit)return 500
                await this.fetchLock.sleep(this.errSleep)
                continue
            }
            if(result1===423){
                await this.fetchLock.sleep(this.recaptchaSleep)
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
    softPause(){
        if(!this.auto)return
        this.auto=false
    }
    softContinue(){
        if(this.auto)return
        this.auto=true
    }
    async wake(){
        if(this.fetchLock.sleepTime===0)return
        await this.fetchLock.wake()
    }
    async hardContinue(){
        this.softContinue()
        await this.start()
    }
}