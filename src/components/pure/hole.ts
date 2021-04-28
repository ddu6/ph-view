import {HoleData,CommentData,domain} from '../../funcs/get'
export class Hole{
    element=document.createElement('div')
    index=document.createElement('div')
    content=document.createElement('div')
    text=document.createElement('div')
    attachment=document.createElement('div')
    comments=document.createElement('div')
    menu=document.createElement('div')
    replyArea=document.createElement('div')
    replyCheckbox=document.createElement('div')
    starCheckbox=document.createElement('div')
    refreshCheckbox=document.createElement('div')
    textarea=document.createElement('textarea')
    sendCheckbox=document.createElement('div')
    restComments:CommentData[]=[]
    commentLimit=50
    isRef=false
    id=-1
    reverse=false
    maxETimestamp=0
    constructor(){
        this.element.append(this.index)
        this.element.append(this.content)
        this.content.append(this.text)
        this.content.append(this.attachment)
        this.content.append(this.menu)
        this.menu.append(this.replyCheckbox)
        this.menu.append(this.starCheckbox)
        this.menu.append(this.refreshCheckbox)
        this.content.append(this.replyArea)
        this.replyArea.append(this.textarea)
        this.replyArea.append(this.sendCheckbox)
        this.content.append(this.comments)
        this.element.classList.add('hole')
        this.index.classList.add('index')
        this.content.classList.add('content')
        this.text.classList.add('text')
        this.attachment.classList.add('attachment')
        this.menu.classList.add('menu')
        this.replyArea.classList.add('reply-area')
        this.replyArea.classList.add('hide')
        this.comments.classList.add('comments')
        this.replyCheckbox.classList.add('reply')
        this.replyCheckbox.classList.add('checkbox')
        this.starCheckbox.classList.add('star')
        this.starCheckbox.classList.add('checkbox')
        this.refreshCheckbox.classList.add('refresh')
        this.refreshCheckbox.classList.add('checkbox')
        this.sendCheckbox.classList.add('send')
        this.sendCheckbox.classList.add('checkbox')
    }
    render(data:HoleData,local:boolean,isRef:boolean,starred:boolean,maxId:number,maxETimestamp:number){
        this.isRef=isRef
        this.maxETimestamp=maxETimestamp
        if(isRef){
            this.element.classList.add('ref')
        }else{
            this.element.classList.remove('ref')
        }
        let {text,tag,pid,timestamp,reply,likenum,type,url,etimestamp,hidden}=data
        if(Number(hidden)===1){
            this.element.classList.add('hidden')
        }else{
            this.element.classList.remove('hidden')
        }
        if(typeof text!=='string'){
            text=''
        }
        if(typeof tag!=='string'){
            tag=''
        }
        this.id=Number(pid)
        this.index.innerHTML=`<span class="id">${pid}</span> ${prettyDate(timestamp)}${tag.length>0?` <span class="tag">${prettyText(tag)}</span>`:''}`
        if(Number(reply)!==0){
            this.replyCheckbox.textContent=reply.toString()+' '
        }
        if(Number(likenum)!==0){
            this.starCheckbox.textContent=likenum.toString()+' '
        }
        if(starred){
            this.starCheckbox.classList.add('checked')
        }else{
            this.starCheckbox.classList.remove('checked')
        }
        this.replyCheckbox.onclick=async e=>{
            const {classList}=this.replyCheckbox
            classList.add('checking')
            if(classList.contains('checked')){
                this.replyArea.classList.add('hide')
                classList.remove('checked')
            }else{
                this.replyArea.classList.remove('hide')
                classList.add('checked')
            }
            classList.remove('checking')
        }
        this.starCheckbox.onclick=async e=>{
            const {classList}=this.starCheckbox
            classList.add('checking')
            await this.handleStar()
            classList.remove('checking')
        }
        this.refreshCheckbox.onclick=async e=>{
            const {classList}=this.refreshCheckbox
            const {classList:bigClassList}=this.element
            this.reverse=!this.reverse
            classList.add('checking')
            bigClassList.add('refreshing')
            await this.handleRefresh()
            bigClassList.remove('refreshing')
            classList.remove('checking')
        }
        this.sendCheckbox.onclick=async e=>{
            const {classList}=this.sendCheckbox
            const {classList:bigClassList}=this.element
            classList.add('checking')
            bigClassList.add('refreshing')
            await this.handleSend()
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
        if(typeof pid==='string')pid=Number(pid)
        if(pid>maxId)this.element.classList.add('new-hole')
        if(typeof etimestamp==='string'){
            etimestamp=Number(etimestamp)
        }
        if(typeof etimestamp==='number'){
            if(etimestamp>maxETimestamp){
                this.element.classList.add('new-comment')
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
        if(typeof timestamp==='string'){
            timestamp=Number(timestamp)
        }
        if(typeof timestamp==='number'){
            if(timestamp>this.maxETimestamp){
                this.element.classList.add('new-comment')
            }
        }
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
    renderComments(data:CommentData[]){
        if(data.length>Number(this.replyCheckbox.textContent)){
            this.replyCheckbox.textContent=data.length.toString()+' '
        }
        this.comments.innerHTML=''
        this.restComments=[]
        if(data.length>=2){
            if(Number(data[0].cid)>Number(data[1].cid)){
                if(!this.reverse)data.reverse()
            }
            else{
                if(this.reverse)data.reverse()
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
    async handleSend(){

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