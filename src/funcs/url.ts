export function getVersion(){
    let version='0.1.0'
    try{
        const tmp=import.meta.url.match(/\d+\.\d+\.\d+/)
        if(tmp!==null){
            version=tmp[0]
        }
    }catch(err){
        const script=document.currentScript
        if(script instanceof HTMLScriptElement){
            const tmp=script.src.match(/\d+\.\d+\.\d+/)
            if(tmp!==null){
                version=tmp[0]
            }
        }else{
            const script=document.querySelector('script[src]')
            if(script instanceof HTMLScriptElement){
                const tmp=script.src.match(/\d+\.\d+\.\d+/)
                if(tmp!==null){
                    version=tmp[0]
                }
            }
        }
    }
    return version
}