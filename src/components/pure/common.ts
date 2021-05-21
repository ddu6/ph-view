class CommonEle<K extends keyof HTMLElementTagNameMap>{
    readonly element:HTMLElementTagNameMap[K]
    readonly classList:DOMTokenList
    readonly style:CSSStyleDeclaration
    readonly dataset:DOMStringMap
    constructor(classes:string[]=[],tag:K){
        this.element=document.createElement(tag)
        this.classList=this.element.classList
        this.style=this.element.style
        this.dataset=this.element.dataset
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
    append(...nodes: (string | Node | CommonEle<keyof HTMLElementTagNameMap>)[]){
        this.element.append(...nodes.map(val=>{
            if(val instanceof CommonEle)return val.element
            return val
        }))
        return this
    }
    prepend(...nodes: (string | Node | CommonEle<keyof HTMLElementTagNameMap>)[]){
        this.element.prepend(...nodes.map(val=>{
            if(val instanceof CommonEle)return val.element
            return val
        }))
        return this
    }
    after(...nodes: (string | Node | CommonEle<keyof HTMLElementTagNameMap>)[]){
        this.element.after(...nodes.map(val=>{
            if(val instanceof CommonEle)return val.element
            return val
        }))
        return this
    }
    before(...nodes: (string | Node | CommonEle<keyof HTMLElementTagNameMap>)[]){
        this.element.before(...nodes.map(val=>{
            if(val instanceof CommonEle)return val.element
            return val
        }))
        return this
    }
    setText(string:string|number){
        this.element.textContent=string.toString()
        return this
    }
    setHTML(string:string){
        this.element.innerHTML=string
        return this
    }
    scrollBy(options:ScrollToOptions){
        this.element.scrollBy(options)
        return this
    }
    scrollIntoView(arg?: boolean | ScrollIntoViewOptions){
        this.element.scrollIntoView(arg)
        return this
    }
}
export class Div extends CommonEle<'div'>{
    constructor(classes:string[]=[]){
        super(classes,'div')
    }
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions){
        this.element.addEventListener(type,listener,options)
        return this
    }
}
export class NamedDiv extends Div{
    constructor(public readonly name:string,public readonly type:string,otherClasses:string[]=[]){
        super([name,type].concat(otherClasses))
        try{
            this.dataset.name=name
        }catch(err){
            console.log(err)
        }
    }
}
export class Checkbox extends NamedDiv{
    constructor(name:string,otherClasses:string[]=[]){
        super(name,'checkbox',otherClasses)
        this.element.classList.add('icomoon')
    }
}
export class Button extends NamedDiv{
    constructor(name:string,otherClasses:string[]=[]){
        super(name,'button',otherClasses)
        this.element.classList.add('icomoon')
    }
}
export class FormLine extends NamedDiv{
    constructor(name:string,otherClasses:string[]=[]){
        super(name,'form-line',otherClasses)
    }
}
export class Form extends NamedDiv{
    constructor(name:string,otherClasses:string[]=[]){
        super(name,'form',otherClasses)
    }
}
export class Anchor extends CommonEle<'a'>{
    constructor(href:string,classes:string[]=[],target='_blank'){
        super(classes,'a')
        try{
            this.element.href=href
            this.element.target=target
        }catch(err){
            console.log(err)
        }
    }
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions){
        this.element.addEventListener(type,listener,options)
        return this
    }
}
export class NamedAnchor extends Anchor{
    constructor(href:string,public readonly name:string,public readonly type:string,otherClasses:string[]=[],target='_blank'){
        super(href,[name,type].concat(otherClasses),target)
        try{
            this.dataset.name=name
        }catch(err){
            console.log(err)
        }
    }
}