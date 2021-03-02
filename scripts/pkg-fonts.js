const fs=require('fs')
const path=require('path')
let fonts=''
const formats=['woff2','woff']
for(const fileName of fs.readdirSync(path.join(__dirname,'../fonts'))){
    const array=fileName.split('.')
    const name=array[0].replace(/-/g,'_')
    const format=array[array.length-1]
    if(!formats.includes(format))continue
    fonts+=`export const ${name}=\`@font-face{font-family:"${name}";src:url("data:font/${format};base64,${fs.readFileSync(path.join(__dirname,'../fonts/'+fileName)).toString('base64')}") format("${format}");}\`\n`
}
fs.writeFileSync(path.join(__dirname,'../src/lib/fonts.ts'),fonts)