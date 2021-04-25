import {HoleData,CommentData,domain} from '../../funcs/get'
export class Hole{
    element=document.createElement('div')
    index=document.createElement('div')
    content=document.createElement('div')
    text=document.createElement('div')
    attachment=document.createElement('div')
    comments=document.createElement('div')
    menu=document.createElement('div')
    replyElement=document.createElement('a')
    starElement=document.createElement('div')
    refreshElement=document.createElement('div')
    restComments:CommentData[]=[]
    commentLimit=50
    isRef=false
    id=-1
    constructor(){
        this.element.append(this.index)
        this.element.append(this.content)
        this.content.append(this.text)
        this.content.append(this.attachment)
        this.content.append(this.menu)
        this.menu.append(this.replyElement)
        this.menu.append(this.starElement)
        this.menu.append(this.refreshElement)
        this.content.append(this.comments)
        this.element.classList.add('hole')
        this.index.classList.add('index')
        this.content.classList.add('content')
        this.text.classList.add('text')
        this.attachment.classList.add('attachment')
        this.menu.classList.add('menu')
        this.comments.classList.add('comments')
        this.replyElement.classList.add('reply')
        this.starElement.classList.add('star')
        this.starElement.classList.add('checkbox')
        this.refreshElement.classList.add('refresh')
        this.refreshElement.classList.add('checkbox')
    }
    render(data:HoleData,local:boolean,isRef:boolean,starred:boolean,maxId:number,maxETimestamp:number){
        this.isRef=isRef
        if(isRef)this.element.classList.add('ref')
        else this.element.classList.remove('ref')
        let {text,tag,pid,timestamp,reply,likenum,type,url,etimestamp,hidden}=data
        if(Number(hidden)===1)this.element.classList.add('hidden')
        else this.element.classList.remove('hidden')
        if(typeof text!=='string')text=''
        if(typeof tag!=='string')tag=''
        this.id=Number(pid)
        this.index.innerHTML=`<span class="id">${pid}</span> ${prettyDate(timestamp)}${tag.length>0?` <span class="tag">${prettyText(tag)}</span>`:''}`
        this.replyElement.href=`https://pkuhelper.pku.edu.cn/hole/#%23${pid}`
        this.replyElement.target='_blank'
        this.replyElement.textContent=reply.toString()
        this.starElement.textContent=likenum.toString()
        if(starred)this.starElement.classList.add('checked')
        else this.starElement.classList.remove('checked')
        this.starElement.onclick=async e=>{
            const {classList}=this.starElement
            classList.add('checking')
            await this.handleStar()
            classList.remove('checking')
        }
        this.refreshElement.onclick=async e=>{
            const {classList}=this.refreshElement
            const {classList:bigClassList}=this.element
            classList.add('checking')
            bigClassList.add('refreshing')
            await this.handleRefresh()
            bigClassList.remove('refreshing')
            classList.remove('checking')
        }
        this.text.innerHTML=prettyText(text)
        this.attachment.innerHTML=''
        if(typeof url==='string'&&url.length>0){
            if(type==='image'){
                const img=document.createElement('img')
                img.src=`https://${local?`${domain}/ph/imgs`:'pkuhelper.pku.edu.cn/services/pkuhole/images'}/${url}`
                this.attachment.append(img)
            }
            else if(type==='audio'){
                const a=document.createElement('a')
                a.classList.add('audio')
                a.href=`https://${local?`${domain}/ph/audios`:'pkuhelper.pku.edu.cn/services/pkuhole/audios'}/${url}`
                a.textContent='Audio'
                a.target='_blank'
                this.text.append(a)
            }
        }
        const storage=window.localStorage
        if(typeof pid==='string')pid=Number(pid)
        if(pid>maxId)this.element.classList.add('new-hole')
        const oldIdStr=storage.getItem('ph-max-id')
        if(oldIdStr!==null){
            const oldId=Number(oldIdStr)
            if(pid>oldId){
                storage.setItem('ph-max-id',pid.toString())
            }
        }else{
            storage.setItem('ph-max-id',pid.toString())
        }
        if(typeof etimestamp==='string')etimestamp=Number(etimestamp)
        if(typeof etimestamp==='number'){
            if(etimestamp>maxETimestamp)this.element.classList.add('new-comment')
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
    private appendComment(data:CommentData){
        let {text,tag,timestamp}=data
        if(typeof text!=='string')text=''
        if(typeof tag!=='string')tag=''
        const spt=text.indexOf('] ')
        const name=text.slice(1,spt)
        text=text.slice(spt+2)
        const element=document.createElement('div')
        const index=document.createElement('div')
        const content=document.createElement('div')
        element.append(index)
        element.append(content)
        element.classList.add('comment')
        index.classList.add('index')
        content.classList.add('content')
        content.classList.add('text')
        index.textContent=`${name} ${prettyDate(timestamp)}${tag.length>0?` <span class="tag">${prettyText(tag)}</span>`:''}`
        content.innerHTML=prettyText(text)
        this.comments.append(element)
    }
    private addMoreButton(restLength:number){
        const element=document.createElement('div')
        this.comments.append(element)
        element.textContent=`${restLength} more`
        element.classList.add('more')
        element.addEventListener('click',e=>{
            element.remove()
            this.renderRestComments()
        })
    }
    renderComments(data:CommentData[],updated=false,reverse=false){
        if(updated)this.element.classList.add('updated')
        else this.element.classList.remove('updated')
        this.comments.innerHTML=''
        this.restComments=[]
        if(data.length>=2){
            if(Number(data[0].cid)>Number(data[1].cid)){
                if(!reverse)data.reverse()
            }
            else{
                if(reverse)data.reverse()
            }
        }
        if(data.length<2*this.commentLimit){
            for(let i=0;i<data.length;i++){
                this.appendComment(data[i])
            }
            return
        }
        for(let i=0;i<this.commentLimit;i++){
            this.appendComment(data[i])
        }
        this.restComments=data.slice(this.commentLimit)
        this.addMoreButton(this.restComments.length)
    }
    private renderRestComments(){
        if(this.restComments.length<20*this.commentLimit){
            for(let i=0;i<this.restComments.length;i++){
                this.appendComment(this.restComments[i])
            }
            this.restComments=[]
            return
        }
        const data=this.restComments.slice(0,this.commentLimit*10)
        this.restComments=this.restComments.slice(this.commentLimit*10)
        for(let i=0;i<data.length;i++){
            this.appendComment(data[i])
        }
        this.addMoreButton(this.restComments.length)
    }
    async handleStar(){

    }
    async handleRefresh(){

    }
}
function prettyText(text:string){
    text=text.replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/\'/g,"&#39;")
    .replace(/\"/g,"&quot;")
    .replace(/(^|[^.@a-z0-9_])((?:https?:\/\/)(?:(?:[\w-]+\.)+[a-z]{2,5}|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d{1,5})?(?:\/[\w~!@#$%^&*\-_=+[\]{};:,./?|]*)?)(?![.@a-z0-9_])(?=[^<>]*(<[^\/]|$))/gi,'$1<a href="$2" target="_blank">$2</a>')
    .replace(/(^|[^.@a-z0-9_\/])((?:(?:[\w-]+\.)+[a-z]{2,5}|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d{1,5})?(?:\/[\w~!@#$%^&*\-_=+[\]{};:,./?|]*)?)(?![.@a-z0-9_])(?=[^<>]*(<[^\/]|$))/gi,'$1<a href="https://$2" target="_blank">$2</a>')
    .replace(/(\b\d{5,7}\b)(?=[^<>]*(<[^\/]|$))/g,`<a href="${document.location.origin+document.location.pathname}?fillter=%23$1" target="_blank">$1</a>`)
    return text
}
function prettyDate(stamp:string|number){
    const date=new Date(Number(stamp+'000'))
    const now=new Date()
    const year=date.getFullYear()
    const nowYear=now.getFullYear()
    const md=(date.getMonth()+1)+'/'+
    date.getDate()
    const nowMD=(now.getMonth()+1)+'/'+
    now.getDate()
    const hms=date.getHours()+':'+
    date.getMinutes()+':'+
    date.getSeconds()
    if(year!==nowYear)return hms+' '+year+'/'+md
    if(nowMD!==md)return hms+' '+md
    return hms
}