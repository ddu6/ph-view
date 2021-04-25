import { SimpleTouch } from "../../funcs/touch"

export class LRStruct{
    readonly element=document.createElement('div')
    readonly side=document.createElement('div')
    readonly button=document.createElement('div')
    readonly sideContent=document.createElement('div')
    readonly main=document.createElement('div')
    readonly sash=document.createElement('div')
    readonly cover=document.createElement('div')
    sashing=false
    sashX=0
    sideWidth:number
    constructor(){
        this.side.append(this.sideContent)
        this.side.append(this.cover)
        this.side.append(this.sash)
        this.element.append(this.main)
        this.element.append(this.button)
        this.element.append(this.side)
        this.element.classList.add('lr-struct')
        this.main.classList.add('main')
        this.button.classList.add('button')
        this.side.classList.add('side')
        this.sideContent.classList.add('content')
        this.sash.classList.add('sash')
        this.cover.classList.add('cover')
        this.sideWidth=this.side.offsetWidth
        this.button.addEventListener('mousedown',e=>{
            e.preventDefault()
            this.side.classList.add('active')
        })
        this.main.addEventListener('mousedown',e=>{
            this.side.classList.remove('active')
        })
        this.sash.addEventListener('mousedown',e=>{
            e.preventDefault()
            this.sashing=true
            this.sashX=e.clientX
            this.sideWidth=this.side.offsetWidth
            this.element.classList.add('sashing')
        })
        this.sash.addEventListener('touchstart',e=>{
            this.sashing=true
            const touch=new SimpleTouch(e).targetTouch
            if(touch===undefined)return
            this.sashX=touch.clientX
            this.sideWidth=this.side.offsetWidth
            this.element.classList.add('sashing')
        })
        document.addEventListener('mousemove',e=>{
            if(!this.sashing)return
            e.preventDefault()
            const dx=e.clientX-this.sashX
            const newWidth=Math.min(Math.max(this.sideWidth+dx,30),this.element.offsetWidth)
            this.side.style.width=newWidth+'px'
            this.main.style.marginLeft=this.side.offsetWidth+'px'
            if(this.side.offsetWidth<=50)this.sideContent.classList.add('vanished')
            else this.sideContent.classList.remove('vanished')
        })
        this.sash.addEventListener('touchmove',e=>{
            if(e.cancelable)e.preventDefault()
            if(!this.sashing)return
            const touch=new SimpleTouch(e).targetTouch
            if(touch===undefined)return
            const dx=touch.clientX-this.sashX
            const newWidth=Math.min(Math.max(this.sideWidth+dx,30),this.element.offsetWidth)
            this.side.style.width=newWidth+'px'
            this.main.style.marginLeft=this.side.offsetWidth+'px'
            if(this.side.offsetWidth<=50)this.sideContent.classList.add('vanished')
            else this.sideContent.classList.remove('vanished')
        })
        document.addEventListener('mouseup',async e=>{
            if(this.sashing!==true)return
            this.sashing=false
            this.element.classList.remove('sashing')
            await this.handleSash()
        })
        document.addEventListener('touchend',async e=>{
            if(this.sashing!==true)return
            this.sashing=false
            this.element.classList.remove('sashing')
            await this.handleSash()
        })
    }
    async handleSash(){

    }
}