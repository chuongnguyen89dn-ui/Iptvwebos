(function(g){
function Player(video,state){this.video=video;this.state=state;this.timer=null;this.resolver=new StreamResolver({endpoint:(state.settings&&state.settings.backend)||''});this.trace=[];this.attempt=0}
Player.prototype.log=function(s){this.trace.push(s);if(this.trace.length>6)this.trace.shift();this.onState(this.trace.join(' > '))};
Player.prototype.play=function(ch){this.stop();this.trace=[];this.attempt++;this.log('NATIVE opening');this.tryNative(ch)};
Player.prototype.mediaError=function(){var e=this.video.error;if(!e)return'unknown';return'code '+e.code+(e.message?' '+e.message:'')};
Player.prototype.tryNative=function(ch){var self=this,start=Date.now(),done=false,attempt=this.attempt,v=this.video;v.preload='auto';v.autoplay=false;v.controls=true;v.playsInline=true;try{v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','')}catch(e){}
function clean(){clearTimeout(self.timer);['loadedmetadata','canplay','playing','error','stalled','waiting'].forEach(function(n){v.removeEventListener(n,handlers[n])})}
function fail(reason){if(done||attempt!==self.attempt)return;done=true;clean();self.log('NATIVE FAIL '+reason+' '+(Date.now()-start)+'ms');self.log('FAILED native-only')}
var handlers={loadedmetadata:function(){self.log('NATIVE metadata')},canplay:function(){self.log('NATIVE canplay')},playing:function(){if(done||attempt!==self.attempt)return;done=true;clean();self.state.playCache[ch.id]={mode:'direct',at:Date.now()};Store.save(self.state);self.log('NATIVE PLAY '+(Date.now()-start)+'ms')},error:function(){fail(self.mediaError())},stalled:function(){self.log('NATIVE stalled')},waiting:function(){self.log('NATIVE waiting')}};
Object.keys(handlers).forEach(function(n){v.addEventListener(n,handlers[n])});
try{v.pause();v.removeAttribute('src');v.load();v.src=ch.url;v.load();var p=v.play();if(p&&p.catch)p.catch(function(e){self.log('NATIVE play() '+(e&&e.name?e.name:'reject'))})}catch(e){fail('exception '+e.message);return}
this.timer=setTimeout(function(){fail('timeout')},15000)};
Player.prototype.stop=function(){this.attempt++;clearTimeout(this.timer);try{this.video.pause();this.video.removeAttribute('src');this.video.load()}catch(e){}};
Player.prototype.onState=function(t){var el=document.getElementById('playState');if(el)el.textContent=t};
g.IPTVPlayer=Player;
})(window);