(()=>{"use strict";async function e(e,t={},n=6e4){return await new Promise((async i=>{let s=new URLSearchParams(t).toString();s.length>0&&(s="?"+s),setTimeout((()=>{i(503)}),n);try{const t=await fetch(`https://ddu6.xyz/services/ph-get/${e}${s}`);if(200!==t.status)return void i(500);const{status:n,data:a}=await t.json();if(200===n)return void i({data:a});if("number"==typeof n)return void i(n)}catch(e){console.log(e)}i(500)}))}async function t(t,n,i){return await e(`h${t}`,{update:"",token:n,password:i})}async function n(n,i,s){if(0===i.length)return 401;const a=await async function(t,n){return await e(`local/h${t}`,{token:n})}(n,i);if(401===a)return 401;if(503===a)return 503;if(404===a){if(0===s.length)return 404;const e=await t(n,i,s);return 401===e?401:503===e?503:404===e?404:"number"==typeof e?500:e.data}if("number"==typeof a)return 500;const r=a.data;if(0===Number(r.timestamp))return 404;if(1===Number(r.hidden))return r;if(0===s.length)return r;const o=await t(n,i,s);return 401===o?401:503===o?503:404===o?r:"number"==typeof o?500:o.data}async function i(t,n){if(0===t.length||0===n.length)return 401;const i=await async function(t,n){return await e("s",{update:"",token:t,password:n})}(t,n);return 401===i?401:503===i?503:404===i?401:"number"==typeof i?500:i.data}async function s(t,n,i,s){if(0===i.length||0===s.length)return 401;const a=await e(`s${t}`,n?{starred:"",token:i,password:s}:{token:i,password:s});return"number"!=typeof a?200:401===a?401:503===a?503:404===a?404:500}async function a(t,n,i,s,a,r,o){if(0===r.length)return 401;if("id"===i&&o.length>0){const i=await async function(t,n,i,s){return await e(`p${n}`,{update:"",key:t,token:i,password:s})}(t,n,r,o);return 401===i?401:503===i?503:404===i?[]:"number"==typeof i?500:i.data}const A=await async function(t,n,i,s,a,r){return await e(`local/p${n}`,{key:t,order:i,s:s.toString(),e:a.toString(),token:r})}(t,n,i,s,a,r);return 401===A?401:503===A?503:"number"==typeof A?500:A.data}class r{constructor(){this.element=document.createElement("div"),this.index=document.createElement("div"),this.content=document.createElement("div"),this.text=document.createElement("div"),this.attachment=document.createElement("div"),this.comments=document.createElement("div"),this.starElement=document.createElement("div"),this.refreshElement=document.createElement("div"),this.restComments=[],this.commentLimit=50,this.isRef=!1,this.id=-1,this.element.append(this.index),this.element.append(this.content),this.content.append(this.text),this.content.append(this.attachment),this.content.append(this.comments),this.element.classList.add("hole"),this.index.classList.add("index"),this.content.classList.add("content"),this.text.classList.add("text"),this.attachment.classList.add("attachment"),this.comments.classList.add("comments"),this.starElement.classList.add("star"),this.starElement.classList.add("checkbox"),this.refreshElement.classList.add("refresh"),this.refreshElement.classList.add("checkbox")}render(e,t,n,i,s,a){this.isRef=n,n?this.element.classList.add("ref"):this.element.classList.remove("ref");let{text:o,tag:A,pid:l,timestamp:h,reply:c,likenum:d,type:p,url:u,etimestamp:m,hidden:g}=e;if(1===Number(g)?this.element.classList.add("hidden"):this.element.classList.remove("hidden"),"string"!=typeof o&&(o=""),"string"!=typeof A&&(A=""),this.id=Number(l),this.index.innerHTML=`${r.prettyText(A)}${A.length>0?"\n":""}<span class="id">${l}</span>\n${r.prettyDate(h)}\n${c}<a class="reply" href="https://pkuhelper.pku.edu.cn/hole/#%23${l}" target="_blank"></a> ${d}`,this.index.append(this.starElement),i?this.starElement.classList.add("checked"):this.starElement.classList.remove("checked"),this.starElement.onclick=async e=>{const{classList:t}=this.starElement;t.add("checking"),await this.handleStar(),t.remove("checking")},this.index.append(this.refreshElement),this.refreshElement.onclick=async e=>{const{classList:t}=this.refreshElement,{classList:n}=this.element;t.add("checking"),n.add("refreshing"),await this.handleRefresh(),n.remove("refreshing"),t.remove("checking")},this.text.innerHTML=r.prettyText(o),this.attachment.innerHTML="","string"==typeof u&&u.length>0)if("image"===p){const e=document.createElement("img");e.src=`https://${t?"ddu6.xyz/ph/imgs":"pkuhelper.pku.edu.cn/services/pkuhole/images"}/${u}`,this.attachment.append(e)}else if("audio"===p){const e=document.createElement("a");e.classList.add("audio"),e.href=`https://${t?"ddu6.xyz/ph/audios":"pkuhelper.pku.edu.cn/services/pkuhole/audios"}/${u}`,e.textContent="Audio",e.target="_blank",this.text.append(e)}const f=window.localStorage;"string"==typeof l&&(l=Number(l)),l>s&&this.element.classList.add("new-hole");const w=f.getItem("ph-max-id");if(null!==w?l>Number(w)&&f.setItem("ph-max-id",l.toString()):f.setItem("ph-max-id",l.toString()),"string"==typeof m&&(m=Number(m)),"number"==typeof m){m>a&&this.element.classList.add("new-comment");const e=f.getItem("ph-max-etimestamp");null!==e?m>Number(e)&&f.setItem("ph-max-etimestamp",m.toString()):f.setItem("ph-max-etimestamp",m.toString())}}appendComment(e){let{text:t,tag:n,timestamp:i}=e;"string"!=typeof t&&(t=""),"string"!=typeof n&&(n="");const s=document.createElement("div"),a=document.createElement("div"),o=document.createElement("div");s.append(a),s.append(o),s.classList.add("comment"),a.classList.add("index"),o.classList.add("content"),o.classList.add("text"),a.textContent=`${n}${n.length>0?"\n":""}${r.prettyDate(i)}`,o.innerHTML=r.prettyText(t),this.comments.append(s)}addMoreButton(){const e=document.createElement("div");this.comments.append(e),e.classList.add("more"),e.addEventListener("click",(t=>{e.remove(),this.renderRestComments()}))}renderComments(e,t=!1,n=!1){t?this.element.classList.add("updated"):this.element.classList.remove("updated"),this.comments.innerHTML="",this.restComments=[],e.length>=2&&(Number(e[0].cid)>Number(e[1].cid)?n||e.reverse():n&&e.reverse());const i=Math.min(e.length,this.commentLimit);for(let t=0;t<i;t++)this.appendComment(e[t]);i<e.length&&(this.restComments=e.slice(i),this.addMoreButton())}renderRestComments(){const e=this.restComments;this.restComments=[];for(let t=0;t<e.length;t++)this.appendComment(e[t])}static prettyText(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\'/g,"&#39;").replace(/\"/g,"&quot;").replace(/(^|[^.@a-z0-9_])((?:https?:\/\/)(?:(?:[\w-]+\.)+[a-z]{2,5}|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d{1,5})?(?:\/[\w~!@#$%^&*\-_=+[\]{};:,./?|]*)?)(?![.@a-z0-9_])(?=[^<>]*(<[^\/]|$))/gi,'$1<a href="$2" target="_blank">$2</a>').replace(/(^|[^.@a-z0-9_\/])((?:(?:[\w-]+\.)+[a-z]{2,5}|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d{1,5})?(?:\/[\w~!@#$%^&*\-_=+[\]{};:,./?|]*)?)(?![.@a-z0-9_])(?=[^<>]*(<[^\/]|$))/gi,'$1<a href="https://$2" target="_blank">$2</a>').replace(/(\b\d{5,7}\b)(?=[^<>]*(<[^\/]|$))/g,`<a href="${document.location.origin+document.location.pathname}?fillter=%23$1" target="_blank">$1</a>`)}static prettyDate(e){let t=new Date(Number(e+"000"));return t.getHours()+":"+t.getMinutes()+":"+t.getSeconds()+"\n"+t.getFullYear()+"/"+(t.getMonth()+1)+"/"+t.getDate()}async handleStar(){}async handleRefresh(){}}class o{constructor(){this.queue=[]}async get(e=1e4){return await new Promise((t=>{const n=Symbol(),i={symbol:n,listen:()=>{t(n)},failed:!1};e>0&&setTimeout((()=>{t(!1),i.failed=!0}),e),this.queue.push(i),this.queue[0].symbol===n&&t(n)}))}release(e){if(0!==this.queue.length&&this.queue[0].symbol===e){for(this.queue.shift();this.queue.length>0&&this.queue[0].failed;)this.queue.shift();this.queue.length>0&&this.queue[0].listen()}}}class A{constructor(){this.busy=!1,this.lock=new o,this.killLock=new o,this.killing=!1,this.killedListen=()=>{},this.killingListen=async()=>{},this.queue=[]}async get(e=1e4){return await new Promise((async t=>{const n=Symbol(),i={symbol:n,listen:e=>{e?t(!1):(t(n),this.busy=!0)},failed:!1};e>0&&setTimeout((()=>{t(!1),i.failed=!0}),e);const s=await this.lock.get(-1);if(this.killing)return t(!1),void this.lock.release(s);this.queue.push(i),this.queue[0].symbol===n&&(t(n),this.busy=!0),this.lock.release(s)}))}async release(e){const t=await this.lock.get(-1);if(0!==this.queue.length&&this.queue[0].symbol===e){for(this.queue.shift();this.queue.length>0&&this.queue[0].failed;)this.queue.shift();if(this.busy=!1,this.killing){for(let e=0;e<this.queue.length;e++)this.queue[e].listen(!0);this.queue=[],this.killedListen()}else this.queue.length>0&&this.queue[0].listen(!1);this.lock.release(t)}else this.lock.release(t)}async kill(e=1e4){const t=await this.killLock.get(-1),n=await new Promise((async t=>{const n=await this.lock.get(-1);this.killing=!0,this.killedListen=()=>{t(!0)},0===this.queue.length?t(!0):e>0&&setTimeout((()=>{t(!1)}),e);const i=this.killingListen;this.lock.release(n),await i()}));return this.killLock.release(t),n}async revive(){const e=await this.killLock.get(-1),t=await this.lock.get(-1);this.killing=!1,this.queue=[],this.lock.release(t),this.killLock.release(e)}async setKillingListen(e,t=(async()=>{})){const n=await this.lock.get(-1);if(0!==this.queue.length&&this.queue[0].symbol===e){if(this.killing)return this.lock.release(n),void await t();this.killingListen=t,this.lock.release(n)}else this.lock.release(n)}async sleep(e){await new Promise((async t=>{const n=await this.get(e);!1!==n?(await this.setKillingListen(n,(async()=>{await this.release(n),t(!0)})),setTimeout((async()=>{await this.release(n),t(!0)}),e)):t(!0)}))}}document.head.innerHTML="<meta charset='utf8'>\n<meta name='viewport' content='width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=0'>\n<title>PKU Hole</title>\n<link rel=\"icon\" href=\"https://cdn.jsdelivr.net/gh/ddu6/static@0.1.0/imgs/ph.png\" type=\"image/png\">",document.body.style.margin="0";const l=new class{constructor(){this.element=document.createElement("div"),this.panel=document.createElement("div"),this.orderSelect=document.createElement("select"),this.fillterInput=document.createElement("input"),this.pageInput=document.createElement("input"),this.starCheckbox=document.createElement("div"),this.autoCheckbox=document.createElement("div"),this.flow=document.createElement("div"),this.style=document.createElement("style"),this.fetchLock=new A,this.appendLock=new A,this.auto=!1,this.star=!1,this.order="id",this.fillter="",this.page=0,this.token="",this.password="",this.stars=[],this.s=0,this.e=0,this.ids=[],this.keys=[],this.key="",this.end=!1,this.appendedIds=[],this.lastAppend=Date.now(),this.inited=!1,this.errCount=0,this.maxId=-1,this.maxETimestamp=0,this.local=!1,this.refMode="direct",this.refLimit=3,this.scrollSpeed=500,this.appendThreshod=1e3,this.localCommentsThreshod=500,this.congestionSleep=5e3,this.unauthorizedSleep=36e5,this.errLimit=10,this.errSleep=5e3,this.dRegExp=/\.d\d{0,8}/g,this.idsRegExp=/#\d{1,7}-\d{1,7}|#\d{1,4}\*\*\*|#\d{1,5}\*\*|#\d{1,6}\*|#\d{1,7}/g,this.element.append(this.style),this.element.append(this.panel),this.element.append(this.flow),this.panel.append(this.starCheckbox),this.panel.append(this.orderSelect),this.panel.append(this.fillterInput),this.panel.append(this.pageInput),this.panel.append(this.autoCheckbox),this.element.classList.add("main"),this.panel.classList.add("panel"),this.flow.classList.add("flow"),this.orderSelect.classList.add("order"),this.fillterInput.classList.add("fillter"),this.pageInput.classList.add("page"),this.starCheckbox.classList.add("star"),this.autoCheckbox.classList.add("auto"),this.starCheckbox.classList.add("checkbox"),this.autoCheckbox.classList.add("checkbox"),this.orderSelect.innerHTML="<option>id</option><option>active</option><option>hot</option>",this.pageInput.type="number",this.pageInput.min="1",this.style.textContent='@font-face{font-family:"icomoon";src:url("data:font/woff;base64,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") format("woff");}body {\n    --color-text: #cccccc;\n    --color-light: #8f8f8f;\n    --color-string: #df9e61;\n    --color-number: #B5CEA8;\n    --color-keyword: #cc80c6;\n    --color-function: #DCDCAA;\n    --color-variable: #6ec0ec;\n    --color-modifier: #3074ac;\n    --color-class: #4EC9B0;\n    --color-warn: #F44747;\n    --color-comment: #6A9955;\n    --color-border: #2e3133;\n    --color-bg: #131313;\n    --color-area: #161616;\n    --color-pre: #191b1d;\n    --color-slice: rgba(88, 88, 88, 0.5);\n    --color-selection: rgba(95, 144, 163, 0.5);\n    --color-span: rgba(58, 61, 65, 0.5);\n    --font: icomoon, "Segoe UI", "Microsoft YaHei", "Hiragino Sans GB", "STHeiti Light", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";\n    --length-width-side: 280px;\n    --length-width-bar: 15px;\n    --length-padding: 2em;\n    --length-padding-pre: 1em;\n    --length-padding-cell: .5em;\n    --length-padding-span: .3em;\n    --length-padding-circle: .2em;\n    --length-margin-title: 1em;\n    --length-margin-heading: .5em;\n    --length-margin-display: .25em;\n    --length-radius-pre: .5em;\n    --length-radius-span: .3em;\n    --length-font-title: 1.8em;\n    --length-font-heading: 1.3em;\n    --length-font-span: .85em;\n    --length-font-log: .8em;\n    --length-font-circle: .7em;\n    --length-space: .25em;\n    --length-space-gap: .5em;\n    --length-space-tab: 2em;\n    --number-ratio-line: 1.5;\n    line-height: var(--number-ratio-line);\n    font-family: var(--font);\n    color: var(--color-text);\n    background-color: var(--color-bg) !important;\n    font-size: 16px;\n}\n\n@media screen and (max-width:650px) {\n    body {\n        font-size: 15.5px\n    }\n}\n\n@media screen and (max-width:600px) {\n    body {\n        font-size: 15px\n    }\n}\n\n@media screen and (max-width:550px) {\n    body {\n        font-size: 14.5px\n    }\n}\n\n@media screen and (max-width:500px) {\n    body {\n        font-size: 14px\n    }\n}\n\n@media screen and (max-width:450px) {\n    body {\n        font-size: 13.5px\n    }\n}\n\n@media screen and (max-width:400px) {\n    body {\n        font-size: 13px\n    }\n}\n\n::-webkit-scrollbar {\n    background-color: transparent;\n}\n\n::-webkit-scrollbar-corner {\n    background-color: transparent;\n}\n\n::-webkit-scrollbar-thumb {\n    background-color: var(--color-slice);\n}\n\na {\n    color: inherit;\n    text-decoration: none;\n}\n\na[href] {\n    color: var(--color-modifier);\n}\n\na[href]:hover {\n    text-decoration: underline;\n}\n\nimg {\n    max-width: 100%;\n    max-height: 280vh;\n    filter: grayscale(50%) brightness(50%);\n    display: block;\n}\n\ninput,\nselect,\ntextarea,\n.input,\n.select,\n.textarea {\n    font: inherit;\n    color: var(--color-text);\n    padding: 0 var(--length-padding-circle);\n    margin: 0;\n    background-color: transparent;\n    border: 1px solid var(--color-border);\n    outline: none;\n    border-radius: var(--length-radius-span);\n}\n\ninput:focus,\nselect:focus,\ntextarea:focus,\n.input:focus,\n.select:focus,\n.textarea:focus {\n    border-color: var(--color-variable);\n}\n\nselect,\n.select {\n    padding: 0;\n}\n\ntextarea {\n    resize: none;\n}\n\n.flow:empty::before {\n    content: "loading...";\n    color: var(--color-light);\n    font-size: var(--length-font-log);\n    padding: var(--length-padding-cell);\n    display: inline-block;\n}\n\n.hole {\n    background-color: var(--color-area);\n    margin-bottom: var(--length-margin-heading);\n}\n\n.hole.ref::before {\n    content: ">";\n    display: block;\n    font-size: var(--length-font-log);\n    color: var(--color-light);\n    padding: var(--length-padding-cell);\n}\n\n.hole.new-comment>.index>.id {\n    color: var(--color-variable);\n}\n\n.hole.new-hole>.index>.id {\n    color: var(--color-string);\n}\n\n.hole.updated>.index>.id {\n    text-decoration: underline;\n}\n\n.hole.hidden>.index>.id {\n    text-decoration: line-through;\n}\n\n.hole.refreshing {\n    filter: brightness(.5);\n}\n\n.index {\n    text-align: center;\n    white-space: pre;\n    font-size: var(--length-font-log);\n    color: var(--color-light);\n    padding: var(--length-padding-cell);\n    max-width: 30%;\n    overflow-x: auto;\n    flex-shrink: 0;\n}\n\n.content {\n    flex-grow: 1;\n    overflow-x: hidden;\n}\n\n.text {\n    white-space: pre-wrap;\n    word-break: break-all;\n    overflow-wrap: anywhere;\n    line-break: anywhere;\n    overflow-x: auto;\n}\n\n.text:not(:empty) {\n    padding: var(--length-padding-cell);\n}\n\n.audio {\n    display: inline-block;\n    margin: 0 var(--length-space-gap);\n}\n\n.comments {\n    max-height: 30em;\n    overflow-y: auto;\n    background-color: var(--color-pre);\n}\n\n.more {\n    cursor: pointer;\n    padding: var(--length-padding-cell);\n}\n\n.more::before {\n    content: "more";\n    text-align: center;\n    display: block;\n}\n\n.hole,\n.comment {\n    display: flex;\n}\n\n.hr {\n    height: 1em;\n}\n\n.hr+.hr{\n    height: 0;\n}\n\n.end::before {\n    content: "- end -";\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    padding: var(--length-padding-cell);\n    margin-bottom: 5em;\n    color: var(--color-light);\n    font-size: var(--length-font-log);\n}\n\n.panel {\n    display: flex;\n    position: sticky;\n    top: 0;\n    left: 0;\n    padding: var(--length-space) var(--length-padding-cell);\n    z-index: 1;\n    height: 1.5em;\n    background-color: var(--color-area);\n}\n\n.panel>input {\n    width: 5em;\n}\n\n.panel>:not(:first-child) {\n    margin-left: var(--length-space);\n}\n\n.fillter {\n    flex-grow: 1;\n}\n\n.checkbox {\n    color: var(--color-light);\n    cursor: pointer;\n}\n\n.checkbox.checked {\n    color: var(--color-text);\n}\n\n.checkbox.checking {\n    background-color: var(--color-slice);\n}\n\n.star::before {\n    content: "\\e9d7";\n}\n\n.refresh::before {\n    content: "\\e984";\n}\n\n.auto::before {\n    content: "\\ea1c";\n}\n\n.reply::before {\n    content: "\\e900";\n}\n\n.index>.star,\n.index>.reply {\n    display: inline;\n    margin-left: .1em;\n}\n\n.index>.refresh {\n    text-align: center;\n    font-size: .8em;\n}\n\n.index>a {\n    color: var(--color-light);\n}\n\n.index>a:hover {\n    text-decoration: none;\n}',this.fillterInput.addEventListener("keydown",(async e=>{"Enter"===e.key&&(this.pageInput.value="1",await this.refresh())})),this.pageInput.addEventListener("keydown",(async e=>{"Enter"===e.key&&await this.refresh()})),this.orderSelect.addEventListener("input",(async e=>{this.pageInput.value="1","hot"===this.orderSelect.value?this.fillterInput.value.startsWith(".d")||(this.fillterInput.value=".d "+this.fillterInput.value):this.fillterInput.value.startsWith(".d")&&(this.fillterInput.value=this.fillterInput.value.replace(/^\.d\d*\s*/,"")),"id"!==this.orderSelect.value&&this.starCheckbox.classList.remove("checked"),await this.refresh()})),this.starCheckbox.addEventListener("click",(async e=>{this.pageInput.value="1",this.fillterInput.value.startsWith(".d")&&(this.fillterInput.value=this.fillterInput.value.replace(/^\.d\d*\s*/,"")),this.starCheckbox.classList.toggle("checked"),await this.refresh()})),this.autoCheckbox.addEventListener("click",(async e=>{this.autoCheckbox.classList.toggle("checked"),this.auto=this.autoCheckbox.classList.contains("checked")})),document.addEventListener("scroll",(async e=>{await this.autoAppend()})),document.addEventListener("touchmove",(async e=>{await this.autoAppend()})),document.addEventListener("dblclick",(async e=>{await this.autoAppend()})),setInterval((async()=>{this.inited&&this.auto&&window.scrollBy({left:0,top:this.scrollSpeed,behavior:"smooth"})}),1e3),setInterval((async()=>{this.inited&&await this.autoAppend()}),500)}async getAndRenderComments(t,n,i,s){const a=await this.fetchLock.get();if(!1===a)return 500;const r=await async function(t,n,i,s,a,r){if(0===a.length)return 401;if(0===n)return{data:[],updated:!1};const o=await async function(t,n){return await e(`local/c${t}`,{token:n})}(t,a);if(401===o)return 401;if(503===o)return 503;if("number"==typeof o)return 500;const A=o.data;if(0===r.length||1===i)return{data:A,updated:!1};const l=A.length;if(l>=n||l>=s)return{data:A,updated:!1};const h=await async function(t,n,i){return await e(`c${t}`,{update:"",token:n,password:i})}(t,a,r);return 401===h?401:503===h?503:404===h?{data:A,updated:!1}:"number"==typeof h?500:{data:h.data,updated:!0}}(t,Number(i),Number(s),this.localCommentsThreshod,this.token,this.password);if(503===r||500===r||401===r)return await this.fetchLock.release(a),r;const{data:o,updated:A}=r;n.renderComments(o,A);for(let e=0;e<o.length;e++){const t=o[e],{text:i}=t;if("string"==typeof i&&i.startsWith("[Helper]"))return n.renderComments([t]),await this.fetchLock.release(a),423}return await this.fetchLock.release(a),o}parseFillter(){this.s=0,this.e=0,this.ids=[],this.keys=[],this.key="";let e=this.fillter.trim();if(0===e.length)return;const t=e.match(this.dRegExp);if(Array.isArray(t)&&t.length>0){let e=t[t.length-1].slice(2),n=e.slice(-2),i=e.slice(-4,-2),s=e.slice(-8,-4);if(s.length<4){const e=new Date;s=e.getFullYear().toString(),0===i.length&&(i=(e.getMonth()+1).toString(),0===n.length&&(n=e.getDate().toString()))}const a=new Date(`${s}/${i}/${n}`).getTime()/1e3;if(!isNaN(a)){const e=a+86400;this.s=a,this.e=e}}const n=e.match(this.idsRegExp);if(Array.isArray(n)&&n.length>0)for(let e=0;e<n.length;e++){const t=n[e].slice(1);if(t.includes("-")){const[e,n]=t.split("-").map((e=>Number(e)));if(isNaN(e)||isNaN(n))continue;if(e<=n)for(let t=e;t<=n;t++)this.ids.push(t);else for(let t=e;t>=n;t--)this.ids.push(t);continue}if(t.endsWith("***")){const e=Number(t.slice(0,-3));if(isNaN(e)||e<=0)continue;const n=1e3*e,i=n+999;for(let e=n;e<=i;e++)this.ids.push(e);continue}if(t.endsWith("**")){const e=Number(t.slice(0,-2));if(isNaN(e)||e<=0)continue;const n=100*e,i=n+99;for(let e=n;e<=i;e++)this.ids.push(e);continue}if(t.endsWith("*")){const e=Number(t.slice(0,-1));if(isNaN(e)||e<=0)continue;const n=10*e,i=n+9;for(let e=n;e<=i;e++)this.ids.push(e);continue}const i=Number(t);isNaN(i)||this.ids.push(i)}e=e.replace(this.dRegExp," ").replace(this.idsRegExp," ").trim(),this.keys=e.split(/\s+/),this.key=this.keys.join(" ")}async basicallyAppend(e){for(let t=0;t<e.length;t++){let i=e[t];const{isRef:a}=i;if(a&&"none"===this.refMode)continue;const o=Number(i.data.pid);if(this.appendedIds.includes(o))continue;let A;if(this.appendedIds.push(o),i.idOnly){const e=await n(o,this.token,this.password);if(404===e)continue;if(401===e)return 500;if(500===e){if(this.errCount++,this.errCount>this.errLimit)return 500;await this.fetchLock.sleep(this.errSleep),this.appendedIds.pop(),t--;continue}if(503===e){await this.fetchLock.sleep(this.congestionSleep),this.appendedIds.pop(),t--;continue}A=e}else A=i.data;const l=new r;let h;for(l.render(A,this.local,a,this.stars.includes(o),this.maxId,this.maxETimestamp),l.handleStar=async()=>{if(0===this.token.length)return;const e=await this.fetchLock.get();if(!1===e)return;const{classList:t}=l.starElement,n=t.contains("checked"),i=await s(o,n,this.token,this.password);if(503!==i&&500!==i){if(n)for(let e=0;e<this.stars.length;e++)this.stars[e]===o&&(this.stars[e]=-1);else this.stars.push(o);window.localStorage.setItem("ph-stars",this.stars.join(",")),t.toggle("checked"),await this.fetchLock.release(e)}else await this.fetchLock.release(e)},l.handleRefresh=async()=>{await this.refreshHole(l)},this.flow.append(l.element);;){const e=await this.getAndRenderComments(o,l,A.reply,A.hidden);if(500!==e){if(401===e)return 500;if(423!==e){if(503!==e){h=e;break}await this.fetchLock.sleep(this.congestionSleep)}else await this.fetchLock.sleep(this.unauthorizedSleep)}else{if(this.errCount++,this.errCount>this.errLimit)return 500;await this.fetchLock.sleep(this.errSleep)}}if("none"===this.refMode)continue;let c=A.text;"string"!=typeof c&&(c="");const d=c+"\n"+h.map((e=>{let t=e.text;return"string"!=typeof t&&(t=""),t})).join("\n");if(!a||"recur"===this.refMode){const n=d.match(/\b\d{6,7}\b|%23\d{3,7}\b/g);if(null!==n){const i=Math.min(n.length,this.refLimit);for(let s=0;s<i;s++){let i=n[s];i.startsWith("%23")&&(i=i.slice(3)),e.splice(t+s+1,0,{data:{pid:i},isRef:!0,idOnly:!0})}}}}return 200}fillterStars(e){const t=[];for(let n=0;n<e.length;n++){const i=e[n],s=Number(i.timestamp);if(s<this.s||this.e>0&&s>this.e)continue;let a=i.text;"string"!=typeof a&&(a="");let r=!0;for(let e=0;e<this.keys.length;e++)if(!a.includes(this.keys[e])){r=!1;break}r&&t.push(i)}return t}async append(){if(this.end||!this.inited)return;const e=await this.appendLock.get();if(!1===e)return;if(this.end)return void await this.appendLock.release(e);let t;if(this.star)for(this.end=!0,this.page=0;;){const e=await i(this.token,this.password);if(401===e){t=[];break}if(500!==e){if(503!==e){this.stars=e.map((e=>Number(e.pid))),window.localStorage.setItem("ph-stars",this.stars.join(",")),t=this.fillterStars(e).map((e=>({data:e,isRef:!1,idOnly:!1})));break}await this.fetchLock.sleep(this.congestionSleep)}else{if(this.errCount++,this.errCount>this.errLimit){t=e;break}await this.fetchLock.sleep(this.errSleep)}}else if(this.ids.length>0)t=this.ids.slice(this.page,this.page+1).map((e=>({data:{pid:e},isRef:!1,idOnly:!0}))),this.ids.length===this.page+1&&(this.end=!0);else for(;;){const e=await a(this.key,this.page+1,this.order,this.s,this.e,this.token,this.password);if(401===e){t=500;break}if(500!==e){if(503!==e){t=e.map((e=>({data:e,isRef:!1,idOnly:!1})));break}await this.fetchLock.sleep(this.congestionSleep)}else{if(this.errCount++,this.errCount>this.errLimit){t=e;break}await this.fetchLock.sleep(this.errSleep)}}if(500===t||0===t.length?this.end=!0:(this.page++,this.pageInput.value=this.page.toString(),500===await this.basicallyAppend(t)&&(this.end=!0)),this.end){const e=document.createElement("div");e.classList.add("end"),this.flow.append(e)}else{const e=document.createElement("div");e.classList.add("hr"),this.flow.append(e)}await this.appendLock.release(e)}async autoAppend(){Date.now()<this.lastAppend+250||window.pageYOffset+window.innerHeight<document.body.scrollHeight-this.appendThreshod||this.appendLock.busy||(this.lastAppend=Date.now(),await this.append())}async clear(){this.flow.innerHTML="",await this.fetchLock.kill(),await this.appendLock.kill(),this.parseFillter(),this.star&&(this.order="id"),this.flow.innerHTML="",this.orderSelect.value=this.order,this.fillterInput.value=this.fillter,this.pageInput.value=this.page.toString(),this.star?this.starCheckbox.classList.add("checked"):this.starCheckbox.classList.remove("checked"),this.auto?this.autoCheckbox.classList.add("checked"):this.autoCheckbox.classList.remove("checked"),this.end=!1,this.appendedIds=[],this.errCount=0;const e=window.localStorage,t=e.getItem("ph-max-id");if(null!==t){const e=Number(t);isNaN(e)||(this.maxId=e)}const n=e.getItem("ph-max-etimestamp");if(null!==n){const e=Number(n);isNaN(e)||(this.maxETimestamp=e)}await this.fetchLock.revive(),await this.appendLock.revive()}async refresh(){const e=this.fillterInput.value.trim().match(/^\w{32,}$/);if(null!==e&&e.length>0){const t=e[0];this.token=t.slice(-32),this.password=t.slice(0,-32),window.localStorage.setItem("ph-token",this.token),window.localStorage.setItem("ph-password",this.password),this.fillterInput.value=""}this.fillter=this.fillterInput.value.trim();const t=Number(this.pageInput.value);!isNaN(t)&&t>=1&&t%1==0&&(this.page=t-1);const n=this.orderSelect.value;"id"===n?this.order="id":"active"===n?this.order="active":"hot"===n&&(this.order="hot"),this.star=this.starCheckbox.classList.contains("checked"),await this.clear(),await this.append()}async init(){const e=new URLSearchParams(document.location.search);e.has("auto")&&(this.auto=!0),e.has("star")&&(this.star=!0);const t=e.get("order");"active"===t?this.order="active":"hot"===t&&(this.order="hot");const n=e.get("fillter");"string"==typeof n&&n.length>0&&(this.fillter=decodeURIComponent(n).trim());const i=e.get("page");if("string"==typeof i&&i.length>0){const e=Number(i);!isNaN(e)&&e>=1&&e%1==0&&(this.page=e)}const s=window.localStorage.getItem("ph-token");"string"==typeof s&&32===s.length&&(this.token=s);const a=window.localStorage.getItem("ph-password");"string"==typeof a&&a.length>0&&(this.password=a);const r=window.localStorage.getItem("ph-stars");null!==r&&(this.stars=r.split(",").map((e=>Number(e)))),e.has("local")&&(this.local=!0);const o=e.get("refMode");"recur"===o?this.refMode="recur":"none"===o&&(this.refMode="none");const A=e.get("refLimit");if(null!==A){const e=Number(A);!isNaN(e)&&e>=0&&e%1==0&&(this.refLimit=e)}const l=e.get("scrollSpeed");if(null!==l){const e=Number(l);!isNaN(e)&&e>0&&(this.scrollSpeed=e)}const h=e.get("appendThreshod");if(null!==h){const e=Number(h);!isNaN(e)&&e>=0&&(this.appendThreshod=e)}const c=e.get("localCommentsThreshod");if(null!==c){const e=Number(c);!isNaN(e)&&e>=0&&(this.localCommentsThreshod=e)}const d=e.get("congestionSleep");if(null!==d){const e=Number(d);!isNaN(e)&&e>=5e3&&(this.congestionSleep=e)}const p=e.get("unauthorizedSleep");if(null!==p){const e=Number(p);!isNaN(e)&&e>=3e5&&(this.unauthorizedSleep=e)}const u=e.get("errLimit");if(null!==u){const e=Number(u);!isNaN(e)&&e>=0&&e%1==0&&(this.errLimit=e)}const m=e.get("errSleep");if(null!==m){const e=Number(m);!isNaN(e)&&e>=5e3&&(this.errSleep=e)}await this.clear(),this.inited=!0,await this.append()}async refreshHole(e){const{id:t}=e;if(isNaN(t)||-1===t)return 500;const i=await this.fetchLock.get();if(!1===i)return 500;let s;for(;;){const e=await n(t,this.token,this.password);if(404===e){s=404;break}if(401===e){s=500;break}if(500!==e){if(503!==e){s=e;break}await this.fetchLock.sleep(this.congestionSleep)}else{if(this.errCount++,this.errCount>this.errLimit){s=500;break}await this.fetchLock.sleep(this.errSleep)}}if(await this.fetchLock.release(i),"number"==typeof s)return s;for(e.render(s,this.local,e.isRef,this.stars.includes(t),this.maxId,this.maxETimestamp);;){const n=await this.getAndRenderComments(t,e,s.reply,s.hidden);if(500!==n){if(401===n)return 500;if(423!==n){if(503!==n)break;await this.fetchLock.sleep(this.congestionSleep)}else await this.fetchLock.sleep(this.unauthorizedSleep)}else{if(this.errCount++,this.errCount>this.errLimit)return 500;await this.fetchLock.sleep(this.errSleep)}}return 200}};window.main=l,document.body.append(l.element),l.init()})();