const fs=require('fs'),vm=require('vm'),assert=require('assert');

function load(path,ctx){vm.runInContext(fs.readFileSync(path,'utf8'),ctx,{filename:path})}

// M3U parser tests
const m3uCtx={window:{}};vm.createContext(m3uCtx);load('js/m3u.js',m3uCtx);
const playlist='#EXTM3U\n#EXTINF:-1 tvg-id="v1" tvg-name="VTV One" tvg-logo="https://img/logo.png" group-title="News",VTV1\nhttps://x/live.m3u8?token=abc\n#EXTINF:-1 group-title="Sports",Sport\nhttps://x/live.ts\n# comment\n#EXTINF:-1,Unknown\nhttps://x/video.mp4';
const out=m3uCtx.window.M3U.parse(playlist,'s1');
assert.equal(out.length,3);assert.equal(out[0].name,'VTV1');assert.equal(out[0].group,'News');assert.equal(out[0].logo,'https://img/logo.png');assert.equal(out[0].tvgId,'v1');assert.equal(out[0].url,'https://x/live.m3u8?token=abc');assert.equal(out[1].url,'https://x/live.ts');assert.equal(out[2].group,'Other');assert.equal(out[0].sourceId,'s1');assert.equal(out[0].id,'s1|https://x/live.m3u8?token=abc');
console.log('M3U parser OK:',out.length,'channels');

// Resolver tests usable on PC without a TV.
const resolverCtx={window:{},fetch:()=>Promise.reject(new Error('unexpected fetch'))};vm.createContext(resolverCtx);load('js/resolver.js',resolverCtx);const Resolver=resolverCtx.window.StreamResolver;
let r=new Resolver({endpoint:''});
assert.equal(r.kind('https://x/live.m3u8?token=1'),'hls');assert.equal(r.kind('https://x/live.MPD'),'dash');assert.equal(r.kind('https://x/live.ts'),'ts');assert.equal(r.kind('https://x/live'),'unknown');assert.equal(r.fallbackUrl({url:'https://x/live'},'remux'),'');
r=new Resolver({endpoint:'https://fallback.example/'});assert.equal(r.fallbackUrl({url:'https://x/live?a=1&b=2'},'remux'),'https://fallback.example/remux?url='+encodeURIComponent('https://x/live?a=1&b=2'));
console.log('Resolver classification/fallback URL OK');

// Player fallback state-machine tests with a fake HTML5 video element.
const status={textContent:''};
function FakeVideo(){this.listeners={};this.src='';this.playCalls=0}FakeVideo.prototype.addEventListener=function(n,f){this.listeners[n]=f};FakeVideo.prototype.removeEventListener=function(n,f){if(this.listeners[n]===f)delete this.listeners[n]};FakeVideo.prototype.load=function(){};FakeVideo.prototype.play=function(){this.playCalls++;return Promise.resolve()};FakeVideo.prototype.pause=function(){};FakeVideo.prototype.removeAttribute=function(){this.src=''};
const saved=[];const playerCtx={window:{},document:{getElementById:()=>status},Store:{save:s=>saved.push(s)},StreamResolver:function(){this.resolve=(ch,cb)=>cb(null,{url:ch.url,kind:'hls'});this.fallbackUrl=(ch,mode)=>'https://fallback/'+mode+'?url='+encodeURIComponent(ch.url)},setTimeout:(fn)=>{playerCtx.timerFn=fn;return 1},clearTimeout:()=>{},Date:Date,Promise:Promise};vm.createContext(playerCtx);load('js/player.js',playerCtx);
const video=new FakeVideo(),state={settings:{backend:'https://fallback'},playCache:{}};const player=new playerCtx.window.IPTVPlayer(video,state);const ch={id:'c1',url:'https://origin/live.m3u8'};
player.play(ch);assert.equal(video.src,ch.url);assert.ok(status.textContent.indexOf('DIRECT')===0);video.listeners.playing();assert.equal(state.playCache.c1.mode,'direct');assert.ok(status.textContent.indexOf('playing')>0);
const video2=new FakeVideo(),player2=new playerCtx.window.IPTVPlayer(video2,{settings:{backend:'https://fallback'},playCache:{}});player2.resolver.resolve=(c,cb)=>cb(new Error('resolve failed'));player2.play(ch);video2.listeners.error();assert.ok(video2.src.indexOf('https://fallback/remux?')===0);video2.listeners.error();assert.ok(video2.src.indexOf('https://fallback/transcode?')===0);video2.listeners.error();assert.ok(status.textContent.indexOf('FAILED')===0);
console.log('Player DIRECT -> REMUX -> TRANSCODE fallback state machine OK');
console.log('PC logic harness PASS');
