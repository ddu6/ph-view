import {HoleData,CommentData,domain} from '../../funcs/get'
import { Checkbox, Div, Form } from './common'
import {prettyDate,prettyText} from '../../funcs/pretty'
export class Hole extends Form{
    index=new Div(['index'])
    text=new Div(['text'])
    attachment=new Div(['attachment'])
    commentsEle=new Form('comments')
    checkboxes={
        comment:new Checkbox('comment'),
        star:new Checkbox('star'),
        refresh:new Checkbox('refresh'),
        send:new Checkbox('send',['show name'])
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
    toNameRegExp=/^Re [\w\s]*:\s*$/
    isRef=false
    id=-1
    commentNum=0
    reverse=false
    maxETime=0
    focusNames:string[]=[]
    constructor(){
        super('hole')
        this.append(this.index)
        .append(this.text)
        .append(this.attachment)
        .append(new Div(['tools'])
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
        this.maxETime=maxETimestamp
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
        this.commentNum=Number(reply)
        let indexStr=`<span class="id">${pid}</span> ${prettyDate(timestamp)}`
        if(tag.length>0){
            indexStr+=` ${prettyText(tag)}`
        }
        this.index.element.innerHTML=indexStr
        if(Number(reply)!==0){
            this.checkboxes.comment.element.textContent=reply.toString()+' '
        }
        if(Number(likenum)!==0){
            this.checkboxes.star.setText(likenum)
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
        let {pureText,tag,timestamp,cid,name,toName}=data
        pureText=pureText??''
        name=name??''
        toName=toName??''
        let indexStr=`${cid} ${prettyDate(timestamp)}`
        let nameStr=`${name}`
        if(typeof tag==='string'&&tag.length>0){
            indexStr+=` ${prettyText(tag)}`
        }
        if(typeof toName==='string'&&toName!==''){
            nameStr+=` to ${toName}`
        }
        nameStr+=': '
        const element=new Div()
        const index=new Div(['index'])
        const textEle=new Div(['text'])
        const nameEle=new Div(['name','checkbox'])
        this.commentsEle.append(element
            .append(index.setText(indexStr))
            .append(textEle.setHTML(prettyText(pureText))
                .prepend(nameEle.setText(nameStr))))
        
        if(this.focusNames.includes(name)||this.focusNames.includes(toName)){
            nameEle.classList.add('checked')
        }
        element.addEventListener('click',e=>{
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
        nameEle.addEventListener('click',e=>{
            if(nameEle.classList.contains('checking')
                ||typeof name!=='string'
                ||name.length===0)return
            nameEle.classList.add('checking')
            const delta=element.element.getBoundingClientRect().top
            if(nameEle.classList.contains('checked')){
                this.unfocus(Number(cid),delta)
            }else{
                const names=[name]
                if(typeof toName==='string'&&toName.length>0){
                    names.push(toName)
                }
                this.focus(names,Number(cid),delta)
            }
            nameEle.classList.remove('checking')
        })
        if(typeof timestamp==='string'){
            timestamp=Number(timestamp)
        }
        if(timestamp>this.maxETime){
            this.element.classList.add('new-comment')
        }
        return element
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
            this.checkboxes.comment.setText(data.length)
        }
        fixComments(data)
        if(data.length>=2&&this.reverse){
            data.reverse()
        }
        this.comments=data
        this.renderPartialComments(data)
    }
    renderPartialComments(data:CommentData[],fix=-1,delta=0){
        let limit=this.commentLimit
        if(fix!==-1){
            for(let i=0;i<data.length;i++){
                if(Number(data[i].cid)===fix){
                    if(i>=limit){
                        limit=i+1
                    }
                    break
                }
            }
        }
        let fixEle:Div|undefined
        this.commentsEle.element.innerHTML=''
        this.restComments=[]
        if(data.length<2*this.commentLimit){
            for(let i=0;i<data.length;i++){
                const tmp=this.appendComment(data[i])
                if(Number(data[i].cid)===fix){
                    fixEle=tmp
                }
            }
        }else{
            for(let i=0;i<limit;i++){
                const tmp=this.appendComment(data[i])
                if(Number(data[i].cid)===fix){
                    fixEle=tmp
                }
            }
            this.restComments=data.slice(limit)
            this.addMoreButton(this.restComments.length)
        }
        if(fixEle!==undefined){
            fixEle.scrollIntoView()
            window.scrollBy({top:-delta})
            const tmp=fixEle.element.getBoundingClientRect().top
            this.commentsEle.element.scrollBy({top:tmp-delta})
        }
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
    focus(names:string[],fix:number,delta:number){
        this.focusNames=names
        this.renderPartialComments(this.comments.filter(val=>names.includes(val.name??'')||names.includes(val.toName??'')),fix,delta)
    }
    unfocus(fix:number,delta:number){
        this.focusNames=[]
        this.renderPartialComments(this.comments,fix,delta)
    }
    async handleStar(){

    }
    async handleRefresh(){

    }
    async handleSend(){

    }
}
function fixComments(data:CommentData[]){
    if(data.length>=2){
        if(Number(data[0].cid)>Number(data[1].cid)){
            data.reverse()
        }
    }
    const cidToName:Record<number,string|undefined>={}
    for(let i=0;i<data.length;i++){
        const item=data[i]
        if(typeof item.toName==='string')continue
        item.toName=''
        let {text,cid}=item
        if(typeof text!=='string'){
            text=''
        }
        cid=Number(cid)
        const spt=text.indexOf(']')
        if(typeof item.name!=='string'||item.name.length===0){
            item.name=text.slice(1,spt)
        }
        cidToName[cid]=item.name
        text=text.slice(spt+1)
        if(text.startsWith(' ')){
            text=text.slice(1)
        }
        if(text.startsWith('Re ')){
            const spt=text.indexOf(':')
            if(spt!==-1&&spt<30){
                item.toName=text.slice(3,spt)
                text=text.slice(spt+1)
                if(text.startsWith(' ')){
                    text=text.slice(1)
                }
                if(item.toName.startsWith('#')){
                    item.toName=cidToName[Number(item.toName.slice(1))]??''
                }
                if(item.toName===item.name||item.toName==='洞主'){
                    item.toName=''
                }
            }
        }
        item.pureText=text
    }
}