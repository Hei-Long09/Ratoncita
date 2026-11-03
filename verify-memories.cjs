const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const elements = new Map();
let frames = new Map(), frameId = 0, now = 0;
function element(tag = 'div') {
  const classes = new Set();
  return {tag,children:[],attrs:{},events:{},hidden:false,paused:true,volume:0.65,currentTime:0,scrollTop:0,clientHeight:800,textContent:'',
    classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),toggle(x,on){if(on)classes.add(x);else classes.delete(x);}},
    append(...children){for(const child of children){child.parent=this;this.children.push(child);}},
    replaceChildren(){this.children=[];},focus(){},
    setAttribute(key,value){this.attrs[key]=value;},
    removeAttribute(key){delete this.attrs[key];},showModal(){this.open=true;},close(){this.open=false;},
    addEventListener(event,handler){this.events[event]=handler;},
    play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;},
    getBoundingClientRect(){return {top:this.tag==='section'?900:0,bottom:200};}
  };
}
const context={window:{matchMedia:()=>({matches:false})},document:{hidden:false,body:element(),
  querySelector(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);},createElement:element},
  requestAnimationFrame(callback){frames.set(++frameId,callback);return frameId;},
  cancelAnimationFrame(id){frames.delete(id);},console};
let audioContextCalls=0;
context.window.AudioContext=class {constructor(){audioContextCalls++;throw Error('AudioContext suspendido');}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(`${__dirname}/dist/config.js`,'utf8'),context);
const config=context.window.BIRTHDAY_CONFIG.memories;
assert.equal(config.photos.length,14);
assert.equal(config.letterHoldMs,3000);assert.equal(config.firstPhotoHoldMs,4000);assert.equal(config.photoHoldMs,4000);
for(const photo of config.photos)assert.ok(fs.existsSync(`${__dirname}/dist/${photo.src}`),photo.src);
config.typingMs=1;config.linePauseMs=10;config.scrollMs=100;
for(const file of ['app.js','memories.js'])vm.runInContext(fs.readFileSync(`${__dirname}/dist/${file}`,'utf8'),context);
async function tick(count=1){for(let i=0;i<count;i++){now+=100;const callbacks=[...frames.values()];frames.clear();for(const callback of callbacks)callback(now);await Promise.resolve();await Promise.resolve();}}
function walk(root){return [root,...root.children.flatMap(walk)];}
const oldMusic=element('audio'),oldVideo=element('video');oldMusic.paused=false;oldVideo.paused=false;
let closed=0;
const open=()=>context.window.BirthdayMemories.open({previousMusic:oldMusic,previousVideo:oldVideo,onClose(){closed++;}});
(async()=>{
  open();
  assert.equal(elements.get('#memories-screen').hidden,false);assert.equal(oldVideo.paused,true);
  assert.equal(elements.get('#memories-music').paused,false);
  const album=elements.get('#memory-album');
  assert.equal(walk(album).filter(x=>x.tag==='img').length,14);
  assert.equal(new Set(walk(album).filter(x=>x.tag==='img').map(x=>x.src)).size,14);
  await tick(5);
  assert.ok(oldMusic.volume<0.65);assert.ok(elements.get('#memories-music').volume>0);
  elements.get('#pause-memories').events.click();
  const before=walk(elements.get('#memory-letter-lines')).map(x=>x.textContent).join('');
  await tick(30);
  assert.equal(walk(elements.get('#memory-letter-lines')).map(x=>x.textContent).join(''),before);
  assert.equal(oldMusic.paused,true);assert.equal(elements.get('#memories-music').volume,0.65);
  elements.get('#pause-memories').events.click();
  context.document.hidden=true;
  const hiddenBefore=walk(elements.get('#memory-letter-lines')).map(x=>x.textContent).join('');
  await tick(20);
  assert.equal(walk(elements.get('#memory-letter-lines')).map(x=>x.textContent).join(''),hiddenBefore);
  context.document.hidden=false;
  await tick(1200);
  assert.equal(elements.get('#memory-letter-page').hidden,true);assert.equal(album.hidden,false);
  assert.equal(elements.get('#pause-memories').hidden,true);
  assert.match(elements.get('#memory-progress').textContent,/Todos nuestros recuerdos/);
  const written=walk(album).filter(x=>x.attrs['aria-label']&&x.tag==='p');
  assert.equal(written.length,config.photos.reduce((count,photo)=>count+photo.lines.length,0));
  for(const line of written)assert.equal(line.children[0].textContent,line.attrs['aria-label']);
  const giftButton=walk(album).find(x=>x.tag==='button'&&x.textContent==='Florecita hay un regalo más');
  assert.ok(giftButton);
  const giftVideo=elements.get('#gift-video'),giftBackground=elements.get('#gift-background');
  let fullscreenRequests=0,fullscreenExits=0;
  giftVideo.requestFullscreen=()=>{fullscreenRequests++;context.document.fullscreenElement=giftVideo;return Promise.resolve();};
  context.document.exitFullscreen=()=>{fullscreenExits++;context.document.fullscreenElement=null;return Promise.resolve();};
  giftButton.events.click();await tick(2);
  assert.equal(elements.get('#gift-screen').hidden,false);assert.equal(elements.get('#memories-screen').hidden,true);
  assert.equal(elements.get('#memories-music').paused,true);assert.equal(oldMusic.paused,true);
  assert.equal(giftBackground.paused,false);assert.equal(giftBackground.muted,true);
  assert.equal(giftVideo.paused,false);assert.equal(giftVideo.muted,false);assert.equal(fullscreenRequests,1);
  giftVideo.events.ended();assert.equal(fullscreenExits,1);assert.equal(elements.get('#gift-play').hidden,true);
  assert.equal(elements.get('#gift-gallery').hidden,false);
  const videoCards=elements.get('#gift-video-grid').children;
  assert.equal(videoCards.length,6);
  for(const index of [4,5])assert.equal(walk(videoCards[index]).filter(x=>x.tag==='video').length,0);
  videoCards[4].events.click();
  assert.equal(elements.get('#video-password-dialog').open,true);
  const passwordInput=elements.get('#video-password');
  passwordInput.value='incorrecta';
  elements.get('#video-password-form').events.submit({preventDefault(){}});
  assert.equal(elements.get('#video-password-dialog').open,true);
  assert.equal(giftVideo.hidden,true);assert.equal(giftVideo.src,'assets/by%20jhonatan.mp4');
  passwordInput.value='Ratoncita';
  elements.get('#video-password-form').events.submit({preventDefault(){}});await tick(2);
  assert.equal(elements.get('#video-password-dialog').open,false);
  assert.equal(giftVideo.src,'assets/video%205.mp4');assert.equal(giftVideo.paused,false);
  giftVideo.events.ended();
  videoCards[5].events.click();assert.equal(elements.get('#video-password-dialog').open,true);
  elements.get('#cancel-video-password').events.click();assert.equal(elements.get('#video-password-dialog').open,false);
  videoCards[0].events.click();await tick(2);
  assert.equal(giftVideo.src,'assets/video%201.mp4');assert.equal(giftVideo.paused,false);
  elements.get('#gallery-return').events.click();assert.equal(giftVideo.paused,true);
  elements.get('#close-gift').events.click();await tick(2);
  assert.equal(giftVideo.paused,true);assert.equal(giftBackground.paused,true);
  assert.equal(elements.get('#memories-screen').hidden,false);assert.equal(elements.get('#memories-music').paused,false);
  // Si pantalla completa se rechaza, el video continúa dentro de la página.
  giftVideo.requestFullscreen=()=>Promise.reject(Error('Fullscreen no permitido'));
  giftButton.events.click();await tick(2);
  assert.equal(giftVideo.paused,false);assert.match(elements.get('#gift-status').textContent,/disponible/);
  elements.get('#close-gift').events.click();await tick(2);
  elements.get('#close-memories').events.click();
  assert.equal(elements.get('#memories-screen').hidden,true);assert.equal(elements.get('#memories-music').paused,true);assert.equal(closed,1);
  open();await tick(3);elements.get('#close-memories').events.click();await tick(30);
  assert.equal(elements.get('#memories-screen').hidden,true);assert.equal(frames.size,0);assert.equal(closed,2);
  // Una carga lenta no debe apagar la canción anterior antes de arrancar la nueva.
  const memoryMusic=elements.get('#memories-music');
  const originalPlay=memoryMusic.play;
  let startAudio;
  memoryMusic.play=function(){this.paused=false;return new Promise(resolve=>{startAudio=resolve;});};
  oldMusic.paused=false;open();await tick(30);
  assert.equal(oldMusic.paused,false);assert.equal(oldMusic.volume,0.65);
  startAudio();await tick(30);assert.equal(oldMusic.paused,true);assert.equal(memoryMusic.volume,0.65);
  elements.get('#close-memories').events.click();
  // Un rechazo de reproducción debe permitir activar la canción con volumen audible.
  memoryMusic.play=function(){this.paused=true;return Promise.reject(Error('Autoplay bloqueado'));};
  open();await tick(2);assert.equal(memoryMusic.volume,0.65);
  assert.match(elements.get('#memory-media-status').textContent,/Activar/);
  memoryMusic.play=originalPlay;
  elements.get('#memories-sound').events.click();await tick(2);
  assert.equal(memoryMusic.paused,false);assert.equal(memoryMusic.volume,0.65);
  elements.get('#close-memories').events.click();
  // Navegación real: entrar, pausar, volver y entrar otra vez siempre inicia la canción de esa pantalla.
  const starsMusic=elements.get('#stars-music');
  starsMusic.muted=true;starsMusic.volume=0;
  elements.get('#more-surprises').events.click();await tick(2);
  assert.equal(starsMusic.paused,false);assert.equal(starsMusic.muted,false);assert.equal(starsMusic.volume,0.65);
  elements.get('#toggle-music').events.click();assert.equal(starsMusic.paused,true);
  elements.get('#stars-more').events.click();await tick(30);
  assert.equal(memoryMusic.paused,false);assert.equal(memoryMusic.muted,false);assert.equal(memoryMusic.volume,0.65);
  elements.get('#memories-sound').events.click();assert.equal(memoryMusic.paused,true);
  elements.get('#close-memories').events.click();await tick(2);
  assert.equal(memoryMusic.paused,true);assert.equal(starsMusic.paused,false);assert.equal(starsMusic.volume,0.65);
  elements.get('#stars-more').events.click();await tick(30);assert.equal(memoryMusic.paused,false);
  elements.get('#close-memories').events.click();
  elements.get('#close-stars').events.click();assert.equal(starsMusic.paused,true);
  elements.get('#more-surprises').events.click();assert.equal(starsMusic.paused,false);
  elements.get('#close-stars').events.click();await tick(30);
  assert.equal(audioContextCalls,0);assert.equal(frames.size,0);
  console.log('OK: 14 fotos, música y regreso, regalo con dos videos, fondo silenciado, solicitud de fullscreen y alternativa si se rechaza.');
})().catch(error=>{console.error(error);process.exitCode=1;});
