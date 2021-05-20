import {Main} from './components/global/main'
document.head.innerHTML+=`<meta charset='utf8'>
<meta name='viewport' content='width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=0'>
<title>PKU Hole</title>
<link rel="icon" href="https://cdn.jsdelivr.net/gh/ddu6/static@0.1.0/imgs/ph.png" type="image/png">`
document.body.style.margin='0'
window.main=new Main(document.body)
window.main.init()