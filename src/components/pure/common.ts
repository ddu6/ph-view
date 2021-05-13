export class CommonEle{
    readonly element:HTMLElement
    readonly classList:DOMTokenList
    readonly style:CSSStyleDeclaration
    constructor(classes:string[]=[],tag:keyof HTMLElementTagNameMap='div'){
        this.element=document.createElement(tag)
        this.classList=this.element.classList
        this.style=this.element.style
        for(let i=0;i<classes.length;i++){
            const className=classes[i].replace(/\s/g,'-')
            if(className==='')continue
            try{
                this.element.classList.add(className)
            }catch(err){
                console.log(err)
            }
        }
    }
    append(...nodes: (string | Node | CommonEle)[]){
        this.element.append(...nodes.map(val=>{
            if(val instanceof CommonEle)return val.element
            return val
        }))
        return this
    }
    setText(string:string){
        this.element.textContent=string
        return this
    }
    setHTML(string:string){
        this.element.innerHTML=string
        return this
    }
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions){
        this.element.addEventListener(type,listener,options)
        return this
    }
}
export class NamedEle extends CommonEle{
    constructor(public readonly name:string,public readonly type:string,tag:keyof HTMLElementTagNameMap='div'){
        super([name,type],tag)
        try{
            this.element.dataset.name=name
        }catch(err){
            console.log(err)
        }
    }
}
export class Checkbox extends NamedEle{
    constructor(name:string){
        super(name,'checkbox')
    }
}
export class FormLine extends NamedEle{
    constructor(name:string){
        super(name,'form-line')
    }
}
export class Form extends NamedEle{
    constructor(name:string){
        super(name,'form')
    }
}