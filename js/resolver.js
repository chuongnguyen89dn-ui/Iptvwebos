(function(g){
function Resolver(opts){this.endpoint=(opts&&opts.endpoint)||''}
Resolver.prototype.kind=function(url){var u=(url||'').toLowerCase().split('?')[0];if(/\.m3u8$/.test(u))return'hls';if(/\.mpd$/.test(u))return'dash';if(/\.(ts|mpegts|m2ts|mts)$/.test(u))return'ts';if(/\.(mp4|m4v|mov)$/.test(u))return'mp4';if(/\.(mkv|webm)$/.test(u))return'matroska';if(/\.(aac|m4a|mp3|flac|ogg|opus)$/.test(u))return'audio';return'unknown'};
Resolver.prototype.resolve=function(ch,cb){var k=this.kind(ch.url);if(k!=='unknown')return cb(null,{url:ch.url,kind:k,mode:'detected'});if(!this.endpoint)return cb(null,{url:ch.url,kind:'unknown',mode:'direct-unknown'});var u=this.endpoint.replace(/\/$/,'')+'/resolve?url='+encodeURIComponent(ch.url);fetch(u).then(function(r){if(!r.ok)throw Error('resolver HTTP '+r.status);return r.json()}).then(function(x){cb(null,x)}).catch(function(e){cb(e)})};
Resolver.prototype.fallbackUrl=function(ch,mode){if(!this.endpoint)return'';return this.endpoint.replace(/\/$/,'')+'/'+mode+'?url='+encodeURIComponent(ch.url)};
g.StreamResolver=Resolver;
})(window);