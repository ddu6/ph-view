import {HoleData,CommentData,domain} from '../../funcs/get'
import { Checkbox, CommonEle, Form } from './common'
export class Hole extends Form{
    index=new CommonEle(['index'])
    text=new CommonEle(['text'])
    attachment=new CommonEle(['attachment'])
    commentsEle=new Form('comments')
    checkboxes={
        comment:new Checkbox('comment'),
        star:new Checkbox('star'),
        refresh:new Checkbox('refresh'),
        send:new Checkbox('send')
    }
    textareas={
        comment:document.createElement('textarea')
    }
    forms={
        comment:new Form('comment')
    }

    restComments:CommentData[]=[]
    comments:CommentData[]=[]
    commentLimit=50
    toNameRegExp=/^Re [\w\s]*: $/
    isRef=false
    id=-1
    reverse=false
    maxETimestamp=0
    constructor(){
        super('hole')
        this.append(this.index)
        .append(this.text)
        .append(this.attachment)
        .append(new CommonEle(['menu'])
            .append(this.checkboxes.comment)
            .append(this.checkboxes.star)
            .append(this.checkboxes.refresh))
        .append(this.forms.comment
            .append(this.textareas.comment)
            .append(this.checkboxes.send))
        .append(this.commentsEle)

        this.forms.comment.classList.add('hide')
        
        this.checkboxes.comment.addEventListener('click',async e=>{
            const {classList}=this.checkboxes.comment
            if(classList.contains('checked')){
                this.forms.comment.classList.add('hide')
                classList.remove('checked')
            }else{
                this.forms.comment.classList.remove('hide')
                classList.add('checked')
            }
        })
        this.checkboxes.star.addEventListener('click',async e=>{
            const {classList}=this.checkboxes.star
            if(classList.contains('checking'))return
            classList.add('checking')
            await this.handleStar()
            classList.remove('checking')
        })
        this.checkboxes.refresh.addEventListener('click',async e=>{
            const {classList}=this.checkboxes.refresh
            if(classList.contains('checking'))return
            const {classList:bigClassList}=this.element
            this.reverse=!this.reverse
            classList.add('checking')
            bigClassList.add('refreshing')
            await this.handleRefresh()
            bigClassList.remove('refreshing')
            classList.remove('checking')
        })
        this.checkboxes.send.addEventListener('click',async e=>{
            const {classList}=this.checkboxes.send
            if(classList.contains('checking'))return
            const {classList:bigClassList}=this.element
            classList.add('checking')
            bigClassList.add('refreshing')
            await this.handleSend()
            bigClassList.remove('refreshing')
            classList.remove('checking')
        })
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
        let indexStr=`<span class="id">${pid}</span> ${prettyDate(timestamp)}`
        if(tag.length>0){
            indexStr+=` <span class="tag">${prettyText(tag)}</span>`
        }
        this.index.element.innerHTML=indexStr
        if(Number(reply)!==0){
            this.checkboxes.comment.element.textContent=reply.toString()+' '
        }
        if(Number(likenum)!==0){
            this.checkboxes.star.element.textContent=likenum.toString()+' '
        }
        if(starred){
            this.checkboxes.star.classList.add('checked')
        }else{
            this.checkboxes.star.classList.remove('checked')
        }
        this.text.element.innerHTML=prettyText(text)
        this.attachment.element.innerHTML=''
        if(typeof url==='string'&&url.length>0){
            if(type==='image'){
                const img=document.createElement('img')
                img.classList.add('dark')
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
        const spt=text.indexOf(']')
        const name=text.slice(1,spt)
        text=text.slice(spt+1)
        if(text.startsWith(' ')){
            text=text.slice(1)
        }
        let indexStr=`${name} ${prettyDate(timestamp)}`
        if(tag.length>0){
            indexStr+=` <span class="tag">${prettyText(tag)}</span>`
        }
        if(text.startsWith('Re ')){
            const spt=text.indexOf(':')
            if(spt!==-1){
                let toName=text.slice(3,spt)
                text=text.slice(spt+1)
                if(text.startsWith(' ')){
                    text=text.slice(1)
                }
                if(toName.startsWith('#')){
                    const id=toName.slice(1)
                    for(let i=0;i<this.comments.length;i++){
                        const {cid,text}=this.comments[i]
                        if(typeof text!=='string')continue
                        if(cid.toString()===id){
                            toName=text.slice(1,text.indexOf(']'))
                            break
                        }
                    }
                }
                if(toName!==''&&toName!=='洞主'&&toName!==name&&!toName.startsWith('#')){
                    indexStr+=` to ${toName}`
                }
            }
        }
        const element=document.createElement('div')
        const index=document.createElement('div')
        const content=document.createElement('div')
        element.append(index)
        element.append(content)
        index.classList.add('index')
        content.classList.add('text')
        index.addEventListener('click',e=>{
            if(!this.checkboxes.comment.classList.contains('checked'))return
            if(
                this.textareas.comment.value.length>0
                &&this.textareas.comment.value.match(this.toNameRegExp)===null
            )return
            if(name!==''&&name!=='洞主'){
                this.textareas.comment.value=`Re ${name}: `
            }else{
                this.textareas.comment.value=''
            }
        })
        index.textContent=indexStr
        content.innerHTML=prettyText(text)
        this.commentsEle.append(element)
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
        this.commentsEle.append(element)
        element.textContent=`${restLength} more`
        element.classList.add('more')
        element.addEventListener('click',e=>{
            element.remove()
            this.renderRestComments()
        })
    }
    renderComments(data:CommentData[]){
        if(data.length>Number(this.checkboxes.comment.element.textContent)){
            this.checkboxes.comment.element.textContent=data.length.toString()+' '
        }
        this.commentsEle.element.innerHTML=''
        this.restComments=[]
        if(data.length>=2){
            if(Number(data[0].cid)>Number(data[1].cid)){
                if(!this.reverse)data.reverse()
            }
            else{
                if(this.reverse)data.reverse()
            }
        }
        this.comments=data
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
export function prettyText(text:string){
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
export function prettyDate(stamp:string|number){
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