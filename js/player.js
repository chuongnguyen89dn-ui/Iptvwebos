(function(g){
function Player(video,state){this.video=video;this.state=state;this.timer=null;this.trace=[];this.attempt=0}
Player.prototype.log=function(s){this.trace.push(s);if(this.trace.length>7)this.trace.shift();this.onState(this.trace.join(' > '))};
Player.prototype.mediaError=function(){var e=this.video.error;if(!e)return'unknown';return'code '+e.code+(e.message?' '+e.message:'')};
Player.prototype.play=function(ch){var self=this,v=this.video,start=Date.now();this.attempt++;var attempt=this.attempt;clearTimeout(this.timer);this.trace=[];this.log('NATIVE opening');
var events=['loadstart','loadedmetadata','loadeddata','canplay','playing','waiting','stalled','error'];
function clean(){clearTimeout(self.timer);events.forEach(function(n){v.removeEventListener(n,handlers[n])})}
function fail(reason){if(attempt!==self.attempt)return;clean();self.log('NATIVE FAIL '+reason+' '+(Date.now()-start)+'ms')}
var handlers={
loadstart:function(){self.log('NATIVE loadstart')},
loadedmetadata:function(){self.log('NATIVE metadata')},
loadeddata:function(){self.log('NATIVE data')},
canplay:function(){self.log('NATIVE canplay')},
playing:function(){if(attempt!==self.attempt)return;clean();self.log('NATIVE PLAY '+(Date.now()-start)+'ms')},
waiting:function(){self.log('NATIVE waiting')},
stalled:function(){self.log('NATIVE stalled')},
error:function(){fail(self.mediaError())}
};
events.forEach(function(n){v.addEventListener(n,handlers[n])});
try{
v.preload='auto';v.controls=true;v.autoplay=true;v.setAttribute('playsinline','');
/* Do not pause/remove-src/load before assigning a new URL. On webOS this can race the media pipeline and surface DEMUXER_ERROR_COULD_NOT_OPEN. */
v.src=ch.url;
var p=v.play();if(p&&p.catch)p.catch(function(e){if(attempt===self.attempt)self.log('NATIVE play() '+(e&&e.name?e.name:'reject'))});
}catch(e){fail('exception '+e.message);return}
this.timer=setTimeout(function(){if(attempt===self.attempt)fail('timeout')},20000)
};
Player.prototype.stop=function(){this.attempt++;clearTimeout(this.timer);try{this.video.pause()}catch(e){}};
Player.prototype.onState=function(t){var el=document.getElementById('playState');if(el)el.textContent=t};
g.IPTVPlayer=Player;
})(window);