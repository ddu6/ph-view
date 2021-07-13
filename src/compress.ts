const maxWidth=8e3
const maxArea=5e6
const maxLen=6e5
export async function compress(src:string){
    const img=document.createElement('img')
    img.src=src
    return await new Promise((resolve:(val:string)=>void)=>{
        img.addEventListener('load',()=>{
            const canvas=document.createElement('canvas')
            const ctx=canvas.getContext('2d')
            if(ctx===null){
                return
            }
            let w=img.width
            let h=img.height
            if(w>maxWidth){
                h=maxWidth*h/w
                w=maxWidth
            }
            if(h>maxWidth){
                w=maxWidth*w/h
                h=maxWidth
            }
            const s=w*h/maxArea
            if(s>1){
                const ss=Math.sqrt(s)
                w=w/ss
                h=h/ss
            }
            canvas.width=w
            canvas.height=h
            ctx.drawImage(img,0,0,w,h)
            for(let q=0.9;q>0;q-=0.1){
                const tmp=canvas.toDataURL('image/jpeg',q)
                if(tmp.length<maxLen){
                    resolve(tmp)
                    return
                }
            }
            resolve('')
        })
        setTimeout(()=>{
            resolve('')
        },10000)
    })
}