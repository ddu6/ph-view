const fs=require('fs')
const path=require('path')
let css=''
const formats=['css']
for(const fileName of fs.readdirSync(path.join(__dirname,'../css'))){
    const array=fileName.split('.')
    const name=array[0].replace(/-/g,'_')
    const format=array[array.length-1]
    if(!formats.includes(format))continue
    css+=`export const ${name}=\`${fs.readFileSync(path.join(__dirname,'../css/'+fileName),{encoding:'utf8'}).replace(/\\/g,'\\\\').replace(/`/g,'\\`')}\`\n`
}
fs.writeFileSync(path.join(__dirname,'../src/lib/css.ts'),css)