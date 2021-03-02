import {Main} from './components/global/main'
document.head.innerHTML=`<meta charset='utf8'>
<meta name='viewport' content='width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=0'>
<title>PKU Hole</title>
<link rel="icon" href="https://cdn.jsdelivr.net/gh/pkuhelper-web/webhole/public/static/favicon/256.png" type="image/png">`
document.body.style.margin='0'
const main=new Main()
window.main=main
document.body.append(main.element)
main.init()