export function getVersion(){
    let version='0.1.0'
    try{
        const url:string=new Function('return import.meta.url')()
        const tmp=url.match(/@\d+\.\d+\.\d+/)
        if(tmp!==null){
            version=tmp[0].slice(1)
        }
    }catch(err){
        const script=document.currentScript
        if(script instanceof HTMLScriptElement){
            const tmp=script.src.match(/@\d+\.\d+\.\d+/)
            if(tmp!==null){
                version=tmp[0].slice(1)
            }
        }
    }
    return version
}