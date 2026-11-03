// Verifica los estados de la interacción sin depender de un navegador instalado.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const elements = new Map();
function element(id) {
  return {value:'',type:'password',hidden:id==='#surprise'||id==='#stars-screen',textContent:'',attrs:{},events:{},children:[],paused:true,currentTime:0,
    classList:{add(){},remove(){}},style:{setProperty(){}},focus(){},remove(){},
    append(child){this.children.push(child);},replaceChildren(){this.children=[];},
    play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;},
    addEventListener(event, handler){this.events[event]=handler;},
    setAttribute(key,value){this.attrs[key]=value;},removeAttribute(key){delete this.attrs[key];},
    reset(){elements.get('#password').value='';}};
}
const context = {window:{matchMedia:()=>({matches:true})},document:{body:element('body'),
  querySelector(id){if(!elements.has(id))elements.set(id,element(id));return elements.get(id);},
  createElement:()=>element('piece')},Math};
vm.createContext(context);
for(const file of ['config.js','app.js'])vm.runInContext(fs.readFileSync(`${__dirname}/dist/${file}`,'utf8'),context);
const input=elements.get('#password'),form=elements.get('#unlock-form'),toggle=elements.get('#toggle-password');
const submit=()=>form.events.submit({preventDefault(){}});
input.value='123';submit();assert.equal(input.attrs['aria-invalid'],'true');
input.value='00000000';submit();assert.match(elements.get('#feedback').textContent,/Esa no es/);
input.value='Ratoncita';input.events.input();assert.equal(input.value,'Ratoncita');
toggle.events.click();assert.equal(input.type,'text');assert.equal(toggle.attrs['aria-pressed'],'true');
submit();assert.equal(elements.get('#entry').hidden,true);assert.equal(elements.get('#surprise').hidden,false);
const stars=elements.get('#stars-screen'),video=elements.get('#stars-video'),music=elements.get('#stars-music');
const next=elements.get('#stars-next'),lines=elements.get('#stars-lines');
elements.get('#more-surprises').events.click();
assert.equal(stars.hidden,false);assert.equal(elements.get('#surprise').hidden,true);
assert.equal(video.paused,false);assert.equal(music.paused,false);
assert.match(elements.get('#stars-title').textContent,/Ratoncita/);assert.equal(lines.children.length,0);
next.events.click();assert.equal(elements.get('#stars-intro').hidden,true);assert.equal(lines.children.length,0);
// El clic del botón no debe revelar dos líneas al propagarse a la pantalla.
assert.equal(stars.events.click,undefined);assert.equal(stars.events.keydown,undefined);
next.events.click();assert.equal(lines.children.length,1);
assert.equal(lines.children[0].className,'stars-line-reveal');
assert.equal(lines.children[0].children[0].textContent,context.window.BIRTHDAY_CONFIG.stars.lines[0]);
next.events.click();assert.equal(lines.children.length,2);
next.events.click();assert.equal(lines.children.length,3);
assert.equal(elements.get('#stars-more').hidden,false);
assert.equal(video.paused,false);assert.equal(music.paused,false);
next.events.click();assert.equal(lines.children.length,0);assert.equal(elements.get('#stars-intro').hidden,false);
assert.equal(elements.get('#stars-more').hidden,true);
elements.get('#toggle-music').events.click();assert.equal(music.paused,true);
elements.get('#toggle-music').events.click();assert.equal(music.paused,false);
elements.get('#close-stars').events.click();assert.equal(stars.hidden,true);
assert.equal(video.paused,true);assert.equal(music.paused,true);assert.equal(elements.get('#surprise').hidden,false);
elements.get('#more-surprises').events.click();assert.equal(lines.children.length,0);assert.equal(video.currentTime,0);
elements.get('#close-stars').events.click();
elements.get('#back').events.click();assert.equal(elements.get('#entry').hidden,false);assert.equal(input.value,'');assert.equal(input.type,'password');
console.log('OK: contraseña, navegación, video y música, líneas por clic/teclado, propagación, repetición y regreso.');
