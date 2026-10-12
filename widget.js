(function(){
'use strict';

var API='https://script.google.com/macros/s/AKfycbwqjj6hFQ3PGNNMeAXgLBWj5Nq6yAQh65XbR4JKlqV_7wuqPGtUIhJnavZAXv96rgyI0w/exec';
var PUBLIC_STATE='https://avkolobanov.github.io/rare-plants-public-state/state';
var PUBLIC_STATE_RAW='https://raw.githubusercontent.com/avkolobanov/rare-plants-public-state/main/state';
var BOT='plant_hunt_auction_bot';

var POLL=7000;
var REQ_TIMEOUT=18000;
var STATIC_TIMEOUT=5000;
var DETAIL_CACHE_MS=30000;
var CATALOG_CACHE_MS=300000;
var DETAIL_SLOW_DELAY=12000;
var DETAIL_RETRY_DELAY=3000;
var DETAIL_MAX_RETRIES=1;
var FRESHNESS_INTERVAL=30000;
var FRESHNESS_MIN_INTERVAL=30000;

var host=document.getElementById('plant-auction-universal');
if(!host)return;
host.innerHTML='<div id="pa-app"><div class="pa-load">Загружаем...</div></div>';

var app=document.getElementById('pa-app');
if(!app||app.dataset.init)return;
app.dataset.init='1';

var style=document.getElementById('plant-auction-full-styles');
if(!style){
  style=document.createElement('style');
  style.id='plant-auction-full-styles';
  style.textContent=`
#rec4227562401{display:none!important}
#plant-auction-universal{
  --pa-page-top:0px;
  --pa-content-offset:40px;
  --pa-footer-gap:0px;
  --pa-catalog-top-gap:0px;
  position:relative;overflow:visible;
  padding:0 20px 34px;
  background:transparent;
}
#plant-auction-universal:before,
#plant-auction-universal:after{
  content:"";position:absolute;left:50%;width:100vw;
  top:calc(-1 * var(--pa-page-top));bottom:calc(-1 * var(--pa-footer-gap));
  transform:translateX(-50%);pointer-events:none;z-index:0;
}
#plant-auction-universal:before{
  background:
    radial-gradient(68% 58% at 8% 4%,rgba(121,201,151,.36) 0%,rgba(121,201,151,0) 68%),
    radial-gradient(58% 56% at 94% 24%,rgba(56,150,137,.28) 0%,rgba(56,150,137,0) 70%),
    radial-gradient(62% 54% at 52% 102%,rgba(135,148,82,.24) 0%,rgba(135,148,82,0) 72%),
    linear-gradient(145deg,#183f31 0%,#0c3128 48%,#08251f 100%);
}
#plant-auction-universal:after{
  background:
    radial-gradient(ellipse at 23% 34%,rgba(218,255,228,.075),transparent 28%),
    radial-gradient(ellipse at 80% 73%,rgba(167,231,207,.06),transparent 31%),
    linear-gradient(118deg,transparent 20%,rgba(178,239,207,.045) 47%,transparent 74%);
  filter:blur(26px);
}
#pa-app,#pa-app *{box-sizing:border-box}
#pa-app{
  --pa-panel:rgba(7,45,33,.82);--pa-line:rgba(222,245,230,.42);--pa-line-soft:rgba(222,245,230,.18);
  --pa-text:#f4f7f5;--pa-muted:#d6ded9;--pa-muted2:#b8c7c0;--pa-green:#c8ffb8;--pa-gold:#f0cf43;
  --pa-button-h:60px;--pa-button-w:268px;
  position:relative;z-index:1;max-width:1320px;margin:auto;padding-top:var(--pa-content-offset);
  font-family:"Tilda Sans","TildaSans",Arial,sans-serif;color:var(--pa-text);line-height:1.4;
}
#pa-app a{color:inherit}
#pa-app button{font:inherit}
#pa-app .pa-action,#pa-app .pa-btn{font-weight:700}
.pa-load,.pa-err{text-align:center;padding:20px 0;background:transparent}.pa-err{color:#ffd0d0}
.pa-panel,.pa-box{
  background:linear-gradient(115deg,rgba(10,55,40,.88),rgba(9,46,35,.76));
  border:1px solid var(--pa-line);border-radius:18px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)
}

/* catalog */
.pa-catalog-view{padding-top:var(--pa-catalog-top-gap)}
.pa-sec{margin:0}.pa-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.pa-group-divider{width:calc((100% - 32px)/9);height:1px;margin:24px auto;background:linear-gradient(90deg,rgba(222,245,230,0),rgba(222,245,230,.42) 26%,rgba(222,245,230,.42) 74%,rgba(222,245,230,0))}
.pa-card{
  min-width:0;overflow:hidden;text-decoration:none!important;color:inherit!important;
  background:linear-gradient(135deg,rgba(18,66,49,.74),rgba(10,48,36,.62));
  border:1px solid var(--pa-line-soft);border-radius:18px;
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  display:flex;flex-direction:column;transition:transform .16s ease,border-color .16s ease,background .16s ease
}
.pa-card:hover{transform:translateY(-2px);border-color:rgba(222,245,230,.36);background:linear-gradient(135deg,rgba(20,72,53,.78),rgba(11,52,39,.66))}
.pa-card>.pa-img{border-bottom:1px solid var(--pa-line-soft)}
.pa-card-body{padding:18px;display:flex;flex-direction:column;flex:1;min-height:268px}
.pa-card-title{margin:0 0 5px;font-size:24px;line-height:1.15;font-weight:700;letter-spacing:-.25px}
.pa-card-id{font-size:15px;color:var(--pa-muted2);margin-bottom:13px}
.pa-card-description{font-size:16px;line-height:1.38;color:#e0e7e3;margin:0 0 17px;min-height:44px;white-space:pre-line}
.pa-card-meta{margin-top:auto;padding-top:14px;border-top:1px solid var(--pa-line-soft)}
.pa-card-row{display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;margin-bottom:14px;font-size:14px;color:var(--pa-muted)}
.pa-card-row b{justify-self:end;color:#f0f5f2;font-size:14px;font-weight:700;text-align:right}
.pa-card-action{display:flex;align-items:center;justify-content:flex-end;gap:8px;width:100%;text-align:right;color:var(--pa-green);font-size:17px;font-weight:700;line-height:1.25}
.pa-card-action-arrow{font-size:21px;line-height:1;font-weight:700;transform:translateY(-1px)}

/* common image + badges */
.pa-img{position:relative;aspect-ratio:1/1;background:rgba(5,31,24,.78);display:flex;align-items:center;justify-content:center;color:rgba(232,242,236,.56);overflow:hidden}
.pa-img img{width:100%;height:100%;object-fit:cover;display:block}
.pa-badge{display:inline-flex;align-items:center;gap:8px;padding:7px 13px;border-radius:999px;border:1px solid rgba(255,255,255,.24);background:rgba(7,40,31,.72);font-size:13px;font-weight:700;color:#eef5f1;backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px)}
.pa-badge:before{content:"";width:8px;height:8px;border-radius:50%;background:#aebdb6}
.pa-img>.pa-badge{position:absolute;left:14px;top:14px}
.pa-active:before{background:#00e94b;box-shadow:0 0 9px rgba(0,233,75,.58)}
.pa-upcoming:before{background:var(--pa-green);box-shadow:0 0 8px rgba(200,255,184,.36)}
.pa-reserve:before{background:#f0cf43;box-shadow:0 0 8px rgba(240,207,67,.38)}
.pa-ending:before{background:#e7b85b}.pa-archive{color:#e0e7e3;background:rgba(8,38,30,.76)}
.pa-gallery{min-width:0}.pa-gallery>.pa-img{border-radius:12px;border:1px solid rgba(255,255,255,.40);cursor:zoom-in}
.pa-gallery-thumbs{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}
.pa-thumb{aspect-ratio:1/1;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,.24);background:#11392a;padding:0;cursor:pointer}
.pa-thumb img{width:100%;height:100%;object-fit:cover;display:block}.pa-thumb.is-active{outline:2px solid var(--pa-green);outline-offset:1px}

/* detail */
.pa-detail{max-width:1320px;margin:auto}
.pa-back{display:inline-flex;align-items:center;margin:0 0 12px;text-decoration:none!important;color:var(--pa-muted)!important;font-size:15px;line-height:1.3;font-weight:700}
.pa-back:hover{color:var(--pa-green)!important}
.pa-hero{display:grid;grid-template-columns:312px minmax(0,1fr) 268px;gap:28px;padding:24px;align-items:start}
.pa-info{padding-top:2px;min-width:0}
.pa-title{font-size:42px;line-height:1.06;margin:20px 0 8px;letter-spacing:-.8px;color:var(--pa-text)}
.pa-auction-id{font-size:25px;color:#e1e7e3;margin-bottom:14px}
.pa-desc{font-size:21px;line-height:1.35;color:#e2e9e5;margin:0 0 28px;max-width:720px;white-space:pre-line}
.pa-dates{display:grid;gap:14px;font-size:19px;color:#e7ede9}
.pa-date-row{display:flex;gap:14px;align-items:center}
.pa-calendar{width:26px;height:26px;border:2px solid currentColor;border-radius:4px;position:relative;flex:0 0 auto}
.pa-calendar:before{content:"";position:absolute;left:3px;right:3px;top:6px;border-top:2px solid currentColor}
.pa-calendar:after{content:"";position:absolute;left:6px;right:6px;top:-5px;height:8px;border-left:2px solid currentColor;border-right:2px solid currentColor}
.pa-side{display:flex;flex-direction:column;align-items:stretch;gap:16px}
.pa-timer{height:106px;border:1px solid rgba(255,255,255,.18);border-radius:14px;background:rgba(6,38,29,.78);padding:14px 20px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.pa-timer-label{font-size:18px;color:#e4ebe7;margin-bottom:2px;text-align:center}
.pa-timer-value{font-size:46px;line-height:1;font-weight:700;color:var(--pa-green);letter-spacing:1px;font-variant-numeric:tabular-nums;text-align:center}
.pa-action,.pa-btn{width:100%;height:var(--pa-button-h);min-height:var(--pa-button-h);padding:0 22px;border-radius:32px;border:1.5px solid rgba(255,255,255,.72);background:transparent;color:var(--pa-text)!important;font-size:18px;font-weight:700;text-decoration:none!important;cursor:pointer;display:flex;align-items:center;justify-content:center;text-align:center}
.pa-action.primary,.pa-btn.primary{background:linear-gradient(100deg,var(--pa-green),#c8ffbd);border-color:transparent;color:#061d15!important;font-weight:700}
.pa-action.off,.pa-btn.off{opacity:.58;cursor:default;pointer-events:none}
.pa-notice{margin-top:16px;padding:12px 14px;border:1px solid var(--pa-line-soft);border-radius:12px;background:rgba(6,38,29,.54);color:#e7ede9}
.pa-ok{color:#dfffe7}.pa-warn{color:#ffe7a2}
.pa-blitz{display:grid;grid-template-columns:340px minmax(0,1fr) var(--pa-button-w);gap:34px;align-items:center;margin-top:16px;padding:20px 24px;border:1.5px solid var(--pa-gold);border-radius:18px;background:linear-gradient(90deg,rgba(20,63,44,.92),rgba(11,48,35,.80));backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.pa-blitz-left{display:flex;align-items:center;gap:22px;border-right:1px solid rgba(255,255,255,.36);padding-right:30px}
.pa-bolt{font-size:66px;line-height:1;color:#ffd037;filter:drop-shadow(0 0 7px rgba(255,208,55,.30))}
.pa-blitz-title{font-size:28px;font-weight:700}.pa-blitz-price{font-size:42px;font-weight:700;line-height:1.05}
.pa-blitz-copy{font-size:19px;color:#e3e9e5;display:grid;gap:12px}
.pa-payment{display:flex;align-items:center;gap:12px}.pa-clock{width:23px;height:23px;border:2px solid currentColor;border-radius:50%;position:relative;flex:0 0 auto}
.pa-clock:after{content:"";position:absolute;left:10px;top:4px;width:2px;height:8px;background:currentColor;transform-origin:bottom;transform:rotate(-20deg)}
.pa-cuttings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:16px}
.pa-cut{display:grid;grid-template-columns:minmax(220px,46%) minmax(0,1fr);gap:18px;padding:14px;border:1px solid var(--pa-line-soft);border-radius:16px;background:linear-gradient(135deg,rgba(18,66,49,.72),rgba(10,48,36,.58));min-width:0;align-items:stretch}
.pa-cut>.pa-gallery .pa-img{border-radius:12px}.pa-cut-body{min-width:0;display:flex;flex-direction:column;padding:0}
.pa-cut-title{font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:7px 14px;margin:0 0 12px;color:#eff4f1}
.pa-stats{display:grid;grid-template-columns:minmax(145px,1fr) minmax(92px,.72fr);column-gap:18px;row-gap:9px;font-size:17px;padding:0 0 0 14px;margin:0 0 14px}
.pa-stat-label{text-align:left;color:#eef2f0}.pa-stat-value{text-align:left;font-weight:700;border-left:1px solid rgba(255,255,255,.22);padding-left:18px;font-variant-numeric:tabular-nums}
.pa-cut .pa-action,.pa-cut .pa-btn{margin-top:auto;width:var(--pa-button-w);max-width:100%;align-self:center}
.pa-foot{text-align:center;color:rgba(221,234,226,.58);font-size:11px;margin-top:10px}

/* auction rules */
.pa-rules-modal{position:fixed;inset:0;z-index:2147482900;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.76);padding:28px;font-family:"Tilda Sans","TildaSans",Arial,sans-serif;color:#f4f7f5}
.pa-rules-modal.open{display:flex}
.pa-rules-panel{position:relative;width:min(760px,calc(100vw - 40px));max-height:min(84vh,900px);overflow:auto;padding:30px 34px 32px;border:1px solid rgba(222,245,230,.42);border-radius:18px;background:linear-gradient(135deg,rgba(13,61,45,.98),rgba(7,39,30,.98));box-shadow:0 22px 70px rgba(0,0,0,.42)}
.pa-rules-close{position:absolute;right:14px;top:14px;width:42px;height:42px;padding:0;border:0;background:transparent;cursor:pointer}
.pa-rules-close:before,.pa-rules-close:after{content:"";position:absolute;left:50%;top:50%;width:24px;height:3px;border-radius:3px;background:#fff;transform-origin:center}
.pa-rules-close:before{transform:translate(-50%,-50%) rotate(45deg)}.pa-rules-close:after{transform:translate(-50%,-50%) rotate(-45deg)}
.pa-rules-title{margin:0 54px 24px 0;font-size:30px;line-height:1.15;font-weight:700}
.pa-rules-section{margin:0 0 20px}.pa-rules-section:last-of-type{margin-bottom:24px}
.pa-rules-section h3{margin:0 0 6px;font-size:18px;line-height:1.25;font-weight:700;color:#f4f7f5}
.pa-rules-section p,.pa-rules-acceptance{margin:0;font-size:16px;line-height:1.55;color:#e3ebe6}
.pa-rules-acceptance{padding-top:20px;border-top:1px solid rgba(222,245,230,.18);font-weight:700}
.pa-rules-load,.pa-rules-error{padding:34px 0;text-align:center;font-size:16px;color:#e3ebe6}.pa-rules-error{color:#ffd0d0}

 /* lightbox */
.pa-lightbox{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.90);padding:28px}
.pa-lightbox.open{display:flex}.pa-lightbox-stage{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center}
.pa-lightbox-frame{position:relative;width:min(86vw,86vh,820px);aspect-ratio:1/1}
.pa-lightbox-img{display:block;width:100%;height:100%;object-fit:contain;background:#06140f;border-radius:14px;user-select:none;-webkit-user-select:none}
.pa-lightbox-close,.pa-lightbox-prev,.pa-lightbox-next{position:absolute;z-index:2;width:52px;height:52px;padding:0;border:0;background:transparent;color:#fff;cursor:pointer;display:grid;place-items:center;filter:drop-shadow(0 2px 3px rgba(0,0,0,.72));font-size:0}
.pa-lightbox-close{right:14px;top:14px}.pa-lightbox-close:before,.pa-lightbox-close:after{content:"";position:absolute;left:50%;top:50%;width:30px;height:4px;border-radius:4px;background:#fff;transform-origin:center}
.pa-lightbox-close:before{transform:translate(-50%,-50%) rotate(45deg)}.pa-lightbox-close:after{transform:translate(-50%,-50%) rotate(-45deg)}
.pa-lightbox-prev,.pa-lightbox-next{top:50%;transform:translateY(-50%)}.pa-lightbox-prev:before,.pa-lightbox-next:before{content:"";width:20px;height:20px;border-left:4px solid #fff;border-bottom:4px solid #fff}
.pa-lightbox-prev{left:14px}.pa-lightbox-prev:before{transform:rotate(45deg)}.pa-lightbox-next{right:14px}.pa-lightbox-next:before{transform:rotate(225deg)}

@media(max-width:1050px){
  .pa-hero{grid-template-columns:280px minmax(0,1fr)}.pa-side{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}.pa-side.pa-side-rules{grid-template-columns:1fr}
  .pa-timer{height:var(--pa-button-h)}.pa-timer-value{font-size:31px}.pa-timer-label{font-size:13px}
  .pa-blitz{grid-template-columns:300px minmax(0,1fr) 230px}.pa-cut{grid-template-columns:1fr}.pa-cut>.pa-gallery{width:100%}
}
@media(max-width:1000px){.pa-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.pa-group-divider{width:calc((100% - 16px)/6)}}
@media(max-width:850px) and (min-width:761px){.pa-blitz{grid-template-columns:250px minmax(0,1fr);gap:20px}.pa-blitz .pa-action{grid-column:1/-1;width:100%}}
@media(max-width:760px){
  #plant-auction-universal{padding:0 10px 28px}
  .pa-rules-modal{padding:12px}.pa-rules-panel{width:100%;max-height:calc(100vh - 24px);padding:24px 20px 26px;border-radius:16px}.pa-rules-title{font-size:25px;margin-right:48px}.pa-rules-section h3{font-size:17px}.pa-rules-section p,.pa-rules-acceptance{font-size:15px}

  .pa-hero{grid-template-columns:1fr;padding:14px;gap:18px}.pa-info{padding:0 2px}.pa-title{font-size:31px;margin-top:14px}.pa-auction-id{font-size:20px}.pa-desc{font-size:17px;margin-bottom:20px}.pa-dates{font-size:16px}
  .pa-side{grid-template-columns:1fr}.pa-timer{height:90px}.pa-timer-label{font-size:16px}.pa-timer-value{font-size:40px}.pa-action,.pa-btn{height:56px;min-height:56px}
  .pa-blitz{grid-template-columns:1fr;gap:16px;padding:18px}.pa-blitz-left{border-right:0;border-bottom:1px solid rgba(255,255,255,.26);padding:0 0 14px}.pa-blitz .pa-action{width:100%}
  .pa-cuttings{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.pa-cut{grid-template-columns:1fr;gap:10px;padding:10px}.pa-cut-title{white-space:normal;font-size:13px;line-height:1.25;padding:6px 8px;margin:0 0 8px}
  .pa-stats{grid-template-columns:minmax(0,1fr) 72px;column-gap:8px;row-gap:5px;font-size:13px;padding:0 0 0 8px;margin:0 0 10px}.pa-stat-value{padding-left:8px}.pa-cut .pa-action{font-size:14px}
}
@media(max-width:850px){
  .pa-rules-modal{
    align-items:flex-start;
    padding:calc(12px + env(safe-area-inset-top)) 12px calc(12px + env(safe-area-inset-bottom));
  }
  .pa-rules-panel{
    max-height:calc(100dvh - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  }
}
@media(max-width:640px){
  .pa-grid{grid-template-columns:1fr;gap:12px}.pa-group-divider{width:33.333%;margin:18px auto}
  .pa-card-body{padding:15px;min-height:0}.pa-card-title{font-size:22px}.pa-card-description{min-height:0;font-size:15px}.pa-card-action{font-size:16px}
}
@media(max-width:540px){
  #plant-auction-universal{padding-left:6px;padding-right:6px}.pa-hero{padding:10px}.pa-gallery-thumbs{gap:5px;margin-top:7px}
  .pa-cuttings{gap:8px}.pa-cut{padding:9px;border-radius:14px;gap:9px}.pa-cut-title{font-size:12px;margin-bottom:7px}
  .pa-stats{grid-template-columns:minmax(0,1fr) 64px;column-gap:6px;row-gap:4px;font-size:12px;margin-bottom:9px}.pa-stat-value{padding-left:6px}.pa-cut .pa-action{font-size:12px}
  .pa-lightbox{padding:12px}.pa-lightbox-frame{width:min(calc(100vw - 24px),calc(100vh - 24px))}.pa-lightbox-close,.pa-lightbox-prev,.pa-lightbox-next{width:46px;height:46px}.pa-lightbox-prev{left:8px}.pa-lightbox-next{right:8px}.pa-lightbox-close{right:8px;top:8px}
}
@media(max-width:350px){.pa-cuttings{grid-template-columns:1fr}.pa-cut-title{font-size:14px}.pa-stats{grid-template-columns:1fr 96px;font-size:14px}.pa-cut .pa-action{font-size:14px}}
`;
  document.head.appendChild(style);
}

var layoutRaf=0;
function syncAuctionLayout(){
  var rect=host.getBoundingClientRect();
  var scrollTop=window.pageYOffset||
    document.documentElement.scrollTop||
    document.body.scrollTop||0;
  var pageTop=Math.max(0,rect.top+scrollTop);
  var viewportWidth=Math.max(
    document.documentElement.clientWidth||0,
    window.innerWidth||0
  );
  var targetTop=viewportWidth<=760?
    Math.max(96,Math.min(108,viewportWidth*.27)):
    Math.max(100,Math.min(112,viewportWidth*.073));
  var contentOffset=Math.max(0,targetTop-pageTop);
  var footer=document.getElementById('t-footer');
  var footerGap=0;
  var catalogTopGap=0;

  if(footer){
    var footerRect=footer.getBoundingClientRect();
    var hostBottom=rect.bottom+scrollTop;
    var footerTop=footerRect.top+scrollTop;
    footerGap=Math.max(0,footerTop-hostBottom);

    var catalogView=app.querySelector('.pa-catalog-view');
    var header=document.getElementById('t-header');

    if(catalogView&&header){
      var cards=catalogView.querySelectorAll('.pa-card');

      if(cards.length){
        var firstRect=cards[0].getBoundingClientRect();
        var lastRect=cards[cards.length-1].getBoundingClientRect();
        var headerRect=header.getBoundingClientRect();
        var headerArtboard=header.querySelector('.t396__artboard');
        var headerHeight=Math.max(
          headerRect.height,
          headerArtboard?headerArtboard.getBoundingClientRect().height:0
        );
        var currentCatalogGap=parseFloat(
          getComputedStyle(host).getPropertyValue('--pa-catalog-top-gap')
        )||0;
        var lowerGap=Math.max(0,footerTop-(lastRect.bottom+scrollTop));
        var baseFirstTop=firstRect.top+scrollTop-currentCatalogGap;

        catalogTopGap=Math.max(0,headerHeight+(lowerGap*.5)-baseFirstTop);
      }
    }
  }

  host.style.setProperty('--pa-page-top',pageTop.toFixed(2)+'px');
  host.style.setProperty('--pa-content-offset',contentOffset.toFixed(2)+'px');
  host.style.setProperty('--pa-footer-gap',footerGap.toFixed(2)+'px');
  host.style.setProperty('--pa-catalog-top-gap',catalogTopGap.toFixed(2)+'px');
}

function scheduleAuctionLayoutSync(){
  if(layoutRaf)cancelAnimationFrame(layoutRaf);
  layoutRaf=requestAnimationFrame(function(){
    layoutRaf=0;
    syncAuctionLayout();
  });
}

syncAuctionLayout();
window.addEventListener('resize',scheduleAuctionLayoutSync,{passive:true});
window.addEventListener('orientationchange',scheduleAuctionLayoutSync,{passive:true});
window.addEventListener('load',scheduleAuctionLayoutSync,{once:true});

var qs=new URLSearchParams(location.search);
var aid=(qs.get('auction')||'').trim();
var mode=qs.has('auction')?'detail':'catalog';

var poll=null;
var countTimer=null;
var catalogTimer=null;
var catalogRefreshInFlight=false;
var cbn=0;
var last=null;
var lastCatalog=null;
var activeDetailRequests=0;
var detailRetryTimer=null;
var detailSlowTimer=null;
var detailRetryCount=0;
var expiredDetailTarget='';
var lightboxEl=null;
var lightboxItems=[];
var lightboxIndex=0;
var lightboxBodyOverflow='';
var lightboxTouchStartX=null;
var rulesEl=null;
var rulesData=null;
var rulesLoading=false;
var rulesBodyOverflow='';
var rulesReturnFocus=null;
var freshnessStartedAt=-FRESHNESS_MIN_INTERVAL;
var freshnessTimer=null;

function updateFreshnessNotice(){
  var node=document.getElementById('pa-freshness');
  if(node&&node.parentNode)node.parentNode.removeChild(node);
}

function checkFreshness(){
  if(Date.now()-freshnessStartedAt<FRESHNESS_MIN_INTERVAL)return;
  if(mode==='detail')requestDetail();
}

function startFreshnessChecks(){
  // Archived data still refreshes, without a separate Apps Script request.
  if(mode==='detail'&&!freshnessTimer){
    freshnessTimer=setInterval(checkFreshness,FRESHNESS_INTERVAL);
  }
}


function esc(v){
  return String(v==null?'':v)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

function dt(v,tz){
  if(!v)return'—';
  var d=new Date(v);
  if(isNaN(d.getTime()))return'—';
  try{
    return new Intl.DateTimeFormat('ru-RU',{
      timeZone:tz||'Europe/Moscow',
      day:'2-digit',
      month:'2-digit',
      year:'numeric',
      hour:'2-digit',
      minute:'2-digit'
    }).format(d);
  }catch(e){
    return d.toLocaleString('ru-RU');
  }
}

function money(v){
  return v==null||v===''?'—':new Intl.NumberFormat('ru-RU').format(Number(v))+' ₽';
}

function descriptionText(v){
  var s=String(v==null?'':v).trim();
  return /^без описания$/i.test(s)?'':s;
}

function publicImageUrl(photo){
  if(!photo)return'';
  var id=String(photo.id||'').trim();
  if(!id){
    var src=String(photo.url||'');
    var match=src.match(/[?&]id=([^&]+)/i);
    if(match){
      try{id=decodeURIComponent(match[1]);}catch(e){id=match[1];}
    }
  }
  if(id&&/^[A-Za-z0-9_-]+$/.test(id)){
    return'https://lh3.googleusercontent.com/d/'+id+'=w1600';
  }
  return String(photo.url||'');
}

function phase(a){
  a=a||{};
  var s=String(a.status||'').trim();
  var p=String(a.publicStatus||'').trim();
  var n=Date.now();
  var st=Date.parse(a.start);
  var en=Date.parse(a.end);

  if(s==='Черновик')return'draft';
  if(s==='Завершён')return'archive';
  if(s==='Блиц-резерв')return'reserve';
  if(isFinite(st)&&st>n)return'upcoming';

  if(
    s==='Активен'||
    s==='active'||
    p==='active'||
    p==='upcoming'||
    p==='ending'||
    (!s&&!p)
  ){
    if(isFinite(en)&&en<=n)return'ending';
    return'active';
  }

  if(p==='archive')return'archive';
  if(p==='reserve')return'reserve';
  return'ending';
}

function catalogPhase(a){
  a=a||{};
  var s=String(a.internalStatus||a.status||'').trim();
  var n=Date.now();
  var st=Date.parse(a.start);
  var en=Date.parse(a.end);

  if(s==='Черновик'||s==='draft')return'draft';
  if(s==='Завершён'||s==='archive')return'archive';
  if(s==='Блиц-резерв'||s==='reserve')return'reserve';
  if(isFinite(st)&&st>n)return'upcoming';

  if(s==='Активен'||s==='active'||s==='upcoming'||s==='ending'||!s){
    if(isFinite(en)&&en<=n)return'ending';
    return'active';
  }

  return'ending';
}

function label(p){
  return p==='active'?'Идёт сейчас':
    p==='upcoming'?'Скоро':
    p==='reserve'?'Блиц-резерв':
    p==='archive'?'Завершён':
    p==='draft'?'Готовится':
    'Завершается';
}

function cls(p){
  return p==='active'?'pa-active':
    p==='upcoming'?'pa-upcoming':
    p==='reserve'?'pa-reserve':
    p==='archive'?'pa-archive':
    p==='ending'?'pa-ending':'';
}

function questionAllowed(p){
  return p==='active'||p==='upcoming'||p==='reserve';
}

function tg(payload){
  if(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)){
    location.href='tg://resolve?domain='+BOT+'&start='+encodeURIComponent(payload);
    return;
  }
  window.open(
    'https://web.telegram.org/k/#?tgaddr='+
      encodeURIComponent('tg://resolve?domain='+BOT+'&start='+encodeURIComponent(payload)),
    '_blank',
    'noopener'
  );
}

function jsonp(params,ok,fail){
  var n='__pa'+Date.now()+'_'+(++cbn);
  var s=document.createElement('script');
  var done=false;
  var t=setTimeout(function(){
    finish();
    if(fail)fail({type:'transport',message:'Сервер отвечает слишком долго.'});
  },REQ_TIMEOUT);

  function releaseCallback(){
    window[n]=function(){};
    setTimeout(function(){
      try{delete window[n];}catch(e){window[n]=undefined;}
    },60000);
  }

  function finish(){
    if(done)return false;
    done=true;
    clearTimeout(t);
    releaseCallback();
    if(s.parentNode)s.parentNode.removeChild(s);
    return true;
  }

  window[n]=function(d){
    if(!finish())return;
    ok(d);
  };

  s.onerror=function(){
    if(!finish())return;
    if(fail)fail({type:'transport',message:'Не удалось загрузить данные.'});
  };

  params=params||{};
  params.callback=n;
  params._=Date.now();

  s.src=API+'?'+Object.keys(params).map(function(k){
    return encodeURIComponent(k)+'='+encodeURIComponent(params[k]);
  }).join('&');

  document.body.appendChild(s);
}

function fetchJson(url,ok,fail){
  if(typeof window.fetch!=='function'){
    fail(new Error('Fetch недоступен.'));
    return;
  }

  var done=false;
  var controller=typeof AbortController!=='undefined'?new AbortController():null;
  var timer=setTimeout(function(){
    if(done)return;
    done=true;
    if(controller)controller.abort();
    fail(new Error('Статический источник отвечает слишком долго.'));
  },STATIC_TIMEOUT);

  var options={cache:'no-store'};
  if(controller)options.signal=controller.signal;

  window.fetch(url,options)
    .then(function(response){
      if(!response.ok){
        var error=new Error('HTTP '+response.status);
        error.status=response.status;
        throw error;
      }
      return response.json();
    })
    .then(function(data){
      if(done)return;
      done=true;
      clearTimeout(timer);
      ok(data);
    })
    .catch(function(error){
      if(done)return;
      done=true;
      clearTimeout(timer);
      fail(error);
    });

  return function(){
    if(done)return;
    done=true;
    clearTimeout(timer);
    if(controller)controller.abort();
  };
}

function fetchState(path,validate,ok,fail){
  var done=false;
  var remaining=2;
  var errors=[];
  var cancel=[];
  var stamp=Date.now();
  var urls=[PUBLIC_STATE,PUBLIC_STATE_RAW];

  function rejected(error){
    if(done)return;
    errors.push(error);
    remaining--;
    if(remaining)return;
    done=true;
    fail({type:'transport',missing:errors.every(function(e){return e&&e.status===404;}),
      message:'Не удалось загрузить данные из статических источников.'});
  }

  urls.forEach(function(base){
    cancel.push(fetchJson(base+'/'+path+'?_='+stamp,function(data){
      if(done)return;
      try{
        var accepted=validate(data);
        if(!accepted.ok)throw new Error(accepted.error||'Некорректный снимок.');
        done=true;
        cancel.forEach(function(stop){if(stop)stop();});
        ok(accepted.data);
      }catch(error){
        if(!done)rejected(error);
        else throw error;
      }
    },rejected));
  });
}

function validateCatalogSnapshot(data){
  if(lastCatalog&&lastCatalog.updatedAt&&data&&data.updatedAt&&
    Date.parse(data.updatedAt)<Date.parse(lastCatalog.updatedAt))return{ok:false,error:'Получен более старый каталог.'};
  if(!data||data.ok!==true||!Array.isArray(data.auctions))return{ok:false,error:'Некорректный каталог.'};
  for(var i=0;i<data.auctions.length;i++){
    if(!data.auctions[i]||!String(data.auctions[i].id||'').trim())return{ok:false,error:'Некорректный аукцион каталога.'};
  }
  return{ok:true,data:data};
}

function validateDetailSnapshot(snapshot){
  if(!snapshot||typeof snapshot!=='object')return{ok:false,error:'Некорректный снимок.'};
  if(snapshot.schemaVersion!=null&&snapshot.schemaVersion!==1)return{ok:false,error:'Неизвестная версия снимка.'};
  if(snapshot.auctionId&&snapshot.auctionId!==aid)return{ok:false,error:'Снимок другого аукциона.'};
  var checked=validateDetail(snapshot.data);
  if(!checked.ok)return checked;
  if(snapshot.syncRevision!==snapshot.data.syncRevision)return{ok:false,error:'Версии снимка не совпадают.'};
  if(last&&last.updatedAt&&snapshot.data.updatedAt&&
    Date.parse(snapshot.data.updatedAt)<Date.parse(last.updatedAt))return{ok:false,error:'Получен более старый снимок.'};
  return{ok:true,data:snapshot.data};
}

function img(photo,alt,id,base,index){
  var url=publicImageUrl(photo);
  if(!url)return'<div class="pa-img">Фото пока нет</div>';
  return'<div class="pa-img"><img '+
    (id?'id="'+esc(id)+'" ':'')+
    'data-pa-img="1" '+
    (base?'data-lightbox-gallery="'+esc(base)+'" data-lightbox-index="'+esc(index||0)+'" ':'')+
    'src="'+esc(url)+'" alt="'+esc(alt||'')+'"></div>';
}

function gallery(main,photos,base,alt){
  var a=[];
  var seen={};

  [main].concat(Array.isArray(photos)?photos:[]).forEach(function(p){
    if(!p)return;
    var url=publicImageUrl(p);
    var key=p.id||url;
    if(url&&!seen[key]){
      seen[key]=1;
      a.push(p);
    }
  });

  if(!a.length)return img(null,alt);

  var h='<div class="pa-gallery" data-pa-gallery="'+esc(base)+'">'+
    img(a[0],alt,base+'-main',base,0);

  if(a.length>1){
    h+='<div class="pa-gallery-thumbs">'+a.map(function(p,i){
      var url=publicImageUrl(p);
      return'<button class="pa-thumb'+(i===0?' is-active':'')+'" '+
        'data-target="'+esc(base+'-main')+'" '+
        'data-index="'+i+'" data-src="'+esc(url)+'" aria-label="Фото '+(i+1)+'">'+
        '<img src="'+esc(url)+'" alt=""></button>';
    }).join('')+'</div>';
  }

  return h+'</div>';
}

function ensureLightbox(){
  if(lightboxEl&&lightboxEl.parentNode)return lightboxEl;

  lightboxEl=document.createElement('div');
  lightboxEl.className='pa-lightbox';
  lightboxEl.setAttribute('aria-hidden','true');
  lightboxEl.innerHTML=
    '<div class="pa-lightbox-stage" role="dialog" aria-modal="true" aria-label="Просмотр фотографии">'+
      '<div class="pa-lightbox-frame">'+
        '<button class="pa-lightbox-close" type="button" data-lightbox-close="1" aria-label="Закрыть"></button>'+
        '<button class="pa-lightbox-prev" type="button" data-lightbox-prev="1" aria-label="Предыдущее фото"></button>'+
        '<img class="pa-lightbox-img" alt="">'+
        '<button class="pa-lightbox-next" type="button" data-lightbox-next="1" aria-label="Следующее фото"></button>'+
      '</div>'+
    '</div>';

  document.body.appendChild(lightboxEl);
  return lightboxEl;
}

function lightboxSources(image){
  var root=image.closest('.pa-gallery');
  var thumbs=root?root.querySelectorAll('.pa-thumb[data-src]'):[];
  var items=[];

  if(thumbs&&thumbs.length){
    Array.prototype.forEach.call(thumbs,function(t){
      var src=t.getAttribute('data-src');
      if(src)items.push(src);
    });
  }

  if(!items.length&&image.src)items.push(image.src);
  return items;
}

function renderLightbox(){
  var lb=ensureLightbox();
  var im=lb.querySelector('.pa-lightbox-img');
  var prev=lb.querySelector('.pa-lightbox-prev');
  var next=lb.querySelector('.pa-lightbox-next');

  if(!lightboxItems.length)return;

  lightboxIndex=(lightboxIndex+lightboxItems.length)%lightboxItems.length;
  im.src=lightboxItems[lightboxIndex];
  prev.style.display=lightboxItems.length>1?'flex':'none';
  next.style.display=lightboxItems.length>1?'flex':'none';
}

function openLightbox(image){
  lightboxItems=lightboxSources(image);
  if(!lightboxItems.length)return;

  lightboxIndex=Number(image.getAttribute('data-lightbox-index')||0);
  if(!isFinite(lightboxIndex)||lightboxIndex<0||lightboxIndex>=lightboxItems.length){
    lightboxIndex=0;
  }

  var lb=ensureLightbox();
  renderLightbox();
  lightboxBodyOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  lb.classList.add('open');
  lb.setAttribute('aria-hidden','false');
}

function closeLightbox(){
  if(!lightboxEl||!lightboxEl.classList.contains('open'))return;
  lightboxEl.classList.remove('open');
  lightboxEl.setAttribute('aria-hidden','true');
  document.body.style.overflow=lightboxBodyOverflow;
  lightboxTouchStartX=null;
}

function stepLightbox(delta){
  if(lightboxItems.length<2)return;
  lightboxIndex+=delta;
  renderLightbox();
}

function normalizeCat(d){
  d=JSON.parse(JSON.stringify(d||{}));
  d.auctions=Array.isArray(d.auctions)?d.auctions:[];

  d.auctions=d.auctions.filter(function(x){
    x.status=catalogPhase(x);
    return x.status!=='draft';
  });

  d.auctions.sort(function(a,b){
    var r={active:0,ending:0,reserve:0,upcoming:1,archive:2};
    var ra=Object.prototype.hasOwnProperty.call(r,a.status)?r[a.status]:9;
    var rb=Object.prototype.hasOwnProperty.call(r,b.status)?r[b.status]:9;

    if(ra!==rb)return ra-rb;

    var ta=Date.parse(a.status==='archive'?a.end:a.start)||0;
    var tb=Date.parse(b.status==='archive'?b.end:b.start)||0;

    return a.status==='archive'?tb-ta:ta-tb;
  });

  return d;
}

function card(x){
  var photo=publicImageUrl(x.mainPhoto);
  var p=photo?'<img data-pa-img="1" src="'+esc(photo)+'" alt="'+esc(x.plant||'')+'">':'Фото пока нет';
  var dv=x.status==='archive'?x.end:x.status==='upcoming'?x.start:x.end;
  var dl=x.status==='archive'?'Завершён':x.status==='upcoming'?'Начало':'Окончание';
  var description=descriptionText(x.description);
  var action=x.status==='archive'?'Посмотреть результаты':'Открыть аукцион';

  return'<a class="pa-card" href="/auctions?auction='+encodeURIComponent(x.id)+'">'+
    '<div class="pa-img">'+p+'<span class="pa-badge '+cls(x.status)+'">'+label(x.status)+'</span></div>'+
    '<div class="pa-card-body">'+
      '<h3 class="pa-card-title">'+esc(x.plant||x.id)+'</h3>'+
      '<div class="pa-card-id">Аукцион '+esc(x.id)+'</div>'+
      '<div class="pa-card-description">'+esc(description)+'</div>'+
      '<div class="pa-card-meta">'+
        '<div class="pa-card-row"><span>'+dl+'</span><b>'+esc(dt(dv,x.timezone))+'</b></div>'+
        '<div class="pa-card-action">'+esc(action)+'<span class="pa-card-action-arrow" aria-hidden="true">→</span></div>'+
      '</div>'+
    '</div>'+
  '</a>';
}

function renderCatalog(d){
  d=normalizeCat(d);
  lastCatalog=d;

  var g={active:[],upcoming:[],archive:[]};

  d.auctions.forEach(function(x){
    if(x.status==='archive')g.archive.push(x);
    else if(x.status==='upcoming')g.upcoming.push(x);
    else g.active.push(x);
  });

  var sections=['active','upcoming','archive'].filter(function(k){
    return g[k].length;
  }).map(function(k){
    return'<section class="pa-sec"><div class="pa-grid">'+g[k].map(card).join('')+'</div></section>';
  });

  app.innerHTML='<div class="pa-catalog-view">'+sections.join('<div class="pa-group-divider" aria-hidden="true"></div>')+'</div>';
  scheduleAuctionLayoutSync();
  updateFreshnessNotice();
}

function readCat(){
  try{
    var x=JSON.parse(localStorage.getItem('paCatalogCurrent')||'null');
    return x&&x.d&&Date.now()-x.t<CATALOG_CACHE_MS&&Array.isArray(x.d.auctions)?x.d:null;
  }catch(e){
    return null;
  }
}

function saveCat(d){
  try{
    localStorage.setItem('paCatalogCurrent',JSON.stringify({t:Date.now(),d:d}));
  }catch(e){}
}

function refreshCatalog(){
  if(catalogRefreshInFlight)return;
  catalogRefreshInFlight=true;
  fetchState('catalog.json',validateCatalogSnapshot,function(d){
    catalogRefreshInFlight=false;
    renderCatalog(d);
    saveCat(d);
  },function(){
    catalogRefreshInFlight=false;
    if(!lastCatalog)app.innerHTML='<div class="pa-err">Не удалось загрузить список аукционов.</div>';
  });
}

function loadCatalog(){
  var cached=readCat();

  if(cached){
    renderCatalog(cached);
  }else{
    app.innerHTML='<div class="pa-load">Загружаем аукционы...</div>';
  }

  refreshCatalog();

  if(!catalogTimer){
    catalogTimer=setInterval(
      refreshCatalog,
      10000
    );
  }
}


function countText(target){
  var ms=Date.parse(target)-Date.now();
  if(!isFinite(ms)||ms<=0)return'00:00';

  var s=Math.floor(ms/1000);
  var d=Math.floor(s/86400);
  var h=Math.floor((s%86400)/3600);
  var m=Math.floor((s%3600)/60);
  var sec=s%60;

  return(d?d+' д. ':'')+
    String(h).padStart(2,'0')+':'+
    String(m).padStart(2,'0')+':'+
    String(sec).padStart(2,'0');
}

function countMarkup(labelText,target){
  return target?
    '<div class="pa-count" data-count="'+esc(target)+'" data-label="'+esc(labelText)+'">'+
      esc(labelText)+': <span>'+esc(countText(target))+'</span>'+
    '</div>':
    '';
}

function timerMarkup(a,p){
  var target=p==='upcoming'?a.start:(p==='active'?a.end:'');
  if(!target)return'';
  var text=p==='upcoming'?'До начала':'До завершения';
  return'<div class="pa-timer" data-count="'+esc(target)+'">'+
    '<div class="pa-timer-label">'+text+'</div>'+
    '<div class="pa-timer-value"><span>'+esc(countText(target))+'</span></div>'+
  '</div>';
}

function notice(a,p){
  if(p==='reserve'){
    return'<div class="pa-notice pa-warn">Всё растение временно зарезервировано по блиц-покупке. Обычные ставки приостановлены.</div>';
  }
  if(p==='ending'){
    return'<div class="pa-notice">Время аукциона закончилось. Фиксируем результаты...</div>';
  }
  if(p==='archive'){
    return'<div class="pa-notice">Аукцион завершён. Ниже показаны результаты.</div>';
  }
  return'';
}

function rulesButton(){
  return'<button class="pa-action" type="button" data-rules-open="1">Условия аукциона</button>';
}

function question(a,p){
  return questionAllowed(p)?
    '<button class="pa-action" data-tg="question_'+esc(a.id)+'">Задать вопрос</button>':
    '';
}

function validateRulesSnapshot(data){
  if(!data||typeof data!=='object')return{ok:false,error:'Пустой файл условий.'};
  if(data.schemaVersion!==1)return{ok:false,error:'Неизвестная версия условий.'};
  if(!String(data.title||'').trim()||!Array.isArray(data.sections)||!data.sections.length){
    return{ok:false,error:'Некорректная структура условий.'};
  }

  for(var i=0;i<data.sections.length;i++){
    var section=data.sections[i];
    if(!section||!String(section.title||'').trim()||!String(section.text||'').trim()){
      return{ok:false,error:'Некорректный раздел условий.'};
    }
  }

  if(!String(data.acceptance||'').trim())return{ok:false,error:'Отсутствует подтверждение условий.'};
  return{ok:true,data:data};
}

function ensureRulesModal(){
  if(rulesEl&&rulesEl.parentNode)return rulesEl;

  rulesEl=document.createElement('div');
  rulesEl.className='pa-rules-modal';
  rulesEl.setAttribute('aria-hidden','true');
  rulesEl.innerHTML=
    '<div class="pa-rules-panel" role="dialog" aria-modal="true" aria-labelledby="pa-rules-title">'+
      '<button class="pa-rules-close" type="button" data-rules-close="1" aria-label="Закрыть"></button>'+
      '<div class="pa-rules-content"><div class="pa-rules-load">Загружаем условия аукциона...</div></div>'+
    '</div>';

  document.body.appendChild(rulesEl);
  return rulesEl;
}

function renderRules(data){
  var el=ensureRulesModal();
  var content=el.querySelector('.pa-rules-content');
  if(!content)return;

  content.innerHTML=
    '<h2 class="pa-rules-title" id="pa-rules-title">'+esc(data.title)+'</h2>'+
    data.sections.map(function(section){
      return'<section class="pa-rules-section">'+
        '<h3>'+esc(section.title)+'</h3>'+
        '<p>'+esc(section.text)+'</p>'+
      '</section>';
    }).join('')+
    '<p class="pa-rules-acceptance">'+esc(data.acceptance)+'</p>';
}

function openRules(trigger){
  var el=ensureRulesModal();
  var content=el.querySelector('.pa-rules-content');

  rulesReturnFocus=trigger||document.activeElement;
  rulesBodyOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  el.classList.add('open');
  el.setAttribute('aria-hidden','false');

  var close=el.querySelector('[data-rules-close]');
  if(close)close.focus();

  if(rulesData){
    renderRules(rulesData);
    return;
  }

  if(rulesLoading)return;
  rulesLoading=true;

  if(content)content.innerHTML='<div class="pa-rules-load">Загружаем условия аукциона...</div>';

  fetchState('auction-rules.json',validateRulesSnapshot,function(data){
    rulesLoading=false;
    rulesData=data;
    renderRules(data);
  },function(){
    rulesLoading=false;
    if(content)content.innerHTML='<div class="pa-rules-error">Не удалось загрузить условия аукциона. Закройте окно и попробуйте ещё раз.</div>';
  });
}

function closeRules(){
  if(!rulesEl||!rulesEl.classList.contains('open'))return;
  rulesEl.classList.remove('open');
  rulesEl.setAttribute('aria-hidden','true');
  document.body.style.overflow=rulesBodyOverflow;

  if(rulesReturnFocus&&rulesReturnFocus.focus){
    try{rulesReturnFocus.focus();}catch(e){}
  }

  rulesReturnFocus=null;
}

function blitz(a,p){
  if(a.blitzSale&&a.blitzSale.sold===true){
    return'<section class="pa-blitz">'+
      '<div class="pa-blitz-left"><div class="pa-bolt">ϟ</div><div><div class="pa-blitz-title">Блиц</div><div class="pa-blitz-price">'+money(a.blitzSale.price)+'</div></div></div>'+
      '<div class="pa-blitz-copy"><div>Продано по блицу</div></div>'+
      '<div></div>'+
    '</section>';
  }

  if(p==='archive'||p==='ending')return'';
  if(!a.blitz||!a.blitz.enabled)return'';

  var act=p==='active'?
    '<button class="pa-action primary" data-tg="blitz_'+esc(a.id)+'">Купить</button>':
    '<div class="pa-action off">'+
      (p==='reserve'?'Растение зарезервировано':'Блиц недоступен')+
    '</div>';

  return'<section class="pa-blitz">'+
    '<div class="pa-blitz-left"><div class="pa-bolt">ϟ</div><div><div class="pa-blitz-title">Блиц</div><div class="pa-blitz-price">'+money(a.blitz.price)+'</div></div></div>'+
    '<div class="pa-blitz-copy"><div>Приобрести всё растение сразу</div><div class="pa-payment"><span class="pa-clock"></span><span>На оплату: <strong>'+esc(a.blitz.paymentMinutes)+' мин.</strong></span></div></div>'+
    act+
  '</section>';
}

function cut(x,p,wholeBlitzSold){
  var action=
    p==='active'?
      '<button class="pa-action primary" data-tg="bid_'+esc(x.id)+'">Сделать ставку</button>':
    p==='reserve'?
      '<div class="pa-action off">Ставки на паузе</div>':
    p==='upcoming'?
      '<div class="pa-action off">Аукцион ещё не начался</div>':
      '';

  var stats=
    '<span class="pa-stat-label">Старт</span><span class="pa-stat-value">'+money(x.startPrice)+'</span>'+
    '<span class="pa-stat-label">Шаг</span><span class="pa-stat-value">'+money(x.step)+'</span>'+
    '<span class="pa-stat-label">Ставок</span><span class="pa-stat-value">'+esc(x.bidCount||0)+'</span>';

  if(p==='archive'){
    stats+=wholeBlitzSold?
      '<span class="pa-stat-label">Результат</span><span class="pa-stat-value">Продан в составе растения</span>':
      '<span class="pa-stat-label">Результат</span><span class="pa-stat-value">'+
        (x.sold?'Продан за '+money(x.finalPrice):'Не продан')+
      '</span>';
  }else{
    stats+=
      '<span class="pa-stat-label">Текущая ставка</span><span class="pa-stat-value">'+
        (x.currentPrice==null?'нет':money(x.currentPrice))+
      '</span>'+
      '<span class="pa-stat-label">Следующая</span><span class="pa-stat-value">'+money(x.nextBid)+'</span>';
  }

  var type=String(x.type||'').trim();
  var suffix=type&&!/^№?\s*\d+$/i.test(type)?' — '+type:'';
  var title='Черенок №'+x.number+suffix;

  return'<article class="pa-cut">'+
    gallery(x.mainPhoto,x.photos,'cut-'+x.id,title)+
    '<div class="pa-cut-body">'+
      '<h3 class="pa-cut-title">'+esc(title)+'</h3>'+
      '<div class="pa-stats">'+stats+'</div>'+
      action+
    '</div>'+
  '</article>';
}

function buildDetailView(d){
  var a=d.auction;
  var p=phase(a);

  if(p==='draft'){
    return{
      phase:p,
      html:'<div class="pa-detail"><a class="pa-back" href="/auctions">← К списку аукционов</a><div class="pa-notice">Аукцион готовится к публикации.</div></div>'
    };
  }

  var wholeBlitzSold=!!(a.blitzSale&&a.blitzSale.sold===true);
  var description=descriptionText(a.description);

  var html=
    '<div class="pa-detail">'+
      '<a class="pa-back" href="/auctions">← К списку аукционов</a>'+
      '<section class="pa-panel pa-hero">'+
        '<div class="pa-hero-gallery">'+gallery(a.mainPhoto,a.photos,'auction',a.plant)+'</div>'+
        '<div class="pa-info">'+
          '<span class="pa-badge '+cls(p)+'">'+label(p)+'</span>'+
          '<h1 class="pa-title">'+esc(a.plant||a.id)+'</h1>'+
          '<div class="pa-auction-id">Аукцион '+esc(a.id)+'</div>'+
          (description?'<div class="pa-desc">'+esc(description)+'</div>':'')+
          '<div class="pa-dates">'+
            '<div class="pa-date-row"><span class="pa-calendar" aria-hidden="true"></span><span>Начало: '+esc(dt(a.start,a.timezone))+'</span></div>'+
            '<div class="pa-date-row"><span class="pa-calendar" aria-hidden="true"></span><span>Окончание: '+esc(dt(a.end,a.timezone))+'</span></div>'+
          '</div>'+
          notice(a,p)+
        '</div>'+
        '<aside class="pa-side pa-side-rules">'+timerMarkup(a,p)+rulesButton()+question(a,p)+'</aside>'+
      '</section>'+
      blitz(a,p)+
      (d.cuttings.length?
        '<div class="pa-cuttings">'+
          d.cuttings.map(function(x){return cut(x,p,wholeBlitzSold);}).join('')+
        '</div>':
        '')+
      '<div id="pa-detail-status" class="pa-foot">'+
        (p==='archive'?'':'Данные обновляются автоматически')+
      '</div>'+
    '</div>';

  return{phase:p,html:html};
}

function renderDetail(d){
  var view=buildDetailView(d);
  app.innerHTML=view.html;

  if(view.phase==='draft'){
    stopPoll();
    stopCount();
    return view.phase;
  }

  startCount();

  if(['active','upcoming','reserve','ending'].indexOf(view.phase)>=0)startPoll();
  else stopPoll();

  return view.phase;
}

function detailKey(){
  return'paDetailCurrent:'+aid;
}

function validateDetail(d){
  if(!d||typeof d!=='object')return{ok:false,error:'Пустой ответ API.'};
  if(d.ok!==true)return{ok:false,error:String(d.error||'API вернул ошибку.')};
  if(!d.auction||typeof d.auction!=='object')return{ok:false,error:'В ответе отсутствует объект auction.'};
  if(String(d.auction.id||'').trim()!==aid)return{ok:false,error:'Ответ относится к другому аукциону.'};
  if(!Array.isArray(d.cuttings))return{ok:false,error:'В ответе отсутствует массив cuttings.'};

  for(var i=0;i<d.cuttings.length;i++){
    var x=d.cuttings[i];
    if(!x||typeof x!=='object'||!String(x.id||'').trim()){
      return{ok:false,error:'Некорректный черенок №'+(i+1)+'.'};
    }
    if(!isFinite(Number(x.number))||!isFinite(Number(x.startPrice))||!isFinite(Number(x.step))){
      return{ok:false,error:'Некорректные данные черенка '+String(x.id||i+1)+'.'};
    }
  }

  return{ok:true};
}

function readDetail(){
  try{
    var x=JSON.parse(localStorage.getItem(detailKey())||'null');
    if(!x||Date.now()-x.t>=DETAIL_CACHE_MS)return null;
    var v=validateDetail(x.d);
    return v.ok?x.d:null;
  }catch(e){
    return null;
  }
}

function saveDetail(d){
  try{
    localStorage.setItem(detailKey(),JSON.stringify({t:Date.now(),d:d}));
  }catch(e){}
}

function catalogAuction(id){
  var d=lastCatalog||readCat();
  if(!d||!Array.isArray(d.auctions))return null;

  for(var i=0;i<d.auctions.length;i++){
    if(String(d.auctions[i].id||'').trim()===id)return d.auctions[i];
  }

  return null;
}

function renderDetailPreview(a){
  var p=catalogPhase(a);
  var description=descriptionText(a.description);

  app.innerHTML=
    '<div class="pa-detail">'+
      '<a class="pa-back" href="/auctions">← К списку аукционов</a>'+
      '<section class="pa-panel pa-hero">'+
        '<div class="pa-hero-gallery">'+gallery(a.mainPhoto,[],'auction-preview',a.plant)+'</div>'+
        '<div class="pa-info">'+
          '<span class="pa-badge '+cls(p)+'">'+label(p)+'</span>'+
          '<h1 class="pa-title">'+esc(a.plant||a.id)+'</h1>'+
          '<div class="pa-auction-id">Аукцион '+esc(a.id)+'</div>'+
          (description?'<div class="pa-desc">'+esc(description)+'</div>':'')+
          '<div class="pa-dates">'+
            '<div class="pa-date-row"><span class="pa-calendar" aria-hidden="true"></span><span>Начало: '+esc(dt(a.start,a.timezone))+'</span></div>'+
            '<div class="pa-date-row"><span class="pa-calendar" aria-hidden="true"></span><span>Окончание: '+esc(dt(a.end,a.timezone))+'</span></div>'+
          '</div>'+
          notice(a,p)+
        '</div>'+
        '<aside class="pa-side pa-side-rules">'+timerMarkup(a,p)+rulesButton()+question(a,p)+'</aside>'+
      '</section>'+
      '<div id="pa-detail-progress" class="pa-notice">Предварительные данные. Загружаем подтверждённые данные аукциона…</div>'+
    '</div>';

  startCount();
}

function detailProgress(text,isError){
  var n=document.getElementById('pa-detail-progress')||document.getElementById('pa-detail-status');

  if(n){
    n.className=isError?(last?'pa-notice pa-warn':'pa-err'):'pa-notice';
    n.textContent=text;
    return;
  }

  if(!last){
    app.innerHTML=(isError?'<div class="pa-err">':'<div class="pa-load">')+esc(text)+'</div>';
  }
}

function clearDetailLoadTimers(){
  if(detailRetryTimer){
    clearTimeout(detailRetryTimer);
    detailRetryTimer=null;
  }
  if(detailSlowTimer){
    clearTimeout(detailSlowTimer);
    detailSlowTimer=null;
  }
}

function acceptDetail(d){
  var v=validateDetail(d);
  if(!v.ok)return{ok:false,type:'validation',message:v.error};

  if(last&&last.updatedAt&&d.updatedAt){
    var oldTime=Date.parse(last.updatedAt);
    var newTime=Date.parse(d.updatedAt);

    if(isFinite(oldTime)&&isFinite(newTime)&&newTime<oldTime){
      return{ok:false,type:'stale',message:'Получен более старый ответ.'};
    }
  }

  try{
    renderDetail(d);
  }catch(e){
    return{ok:false,type:'render',message:e&&e.message?String(e.message):'Ошибка отображения.'};
  }

  last=d;
  clearDetailLoadTimers();
  saveDetail(d);

  return{ok:true};
}

function scheduleDetailRetry(){
  if(activeDetailRequests>0||detailRetryTimer)return;

  if(detailRetryCount>=DETAIL_MAX_RETRIES){
    detailProgress('Полные данные пока не получены. Обновите страницу или попробуйте ещё раз.',true);
    return;
  }

  detailRetryCount++;

  detailRetryTimer=setTimeout(function(){
    detailRetryTimer=null;
    requestDetail();
  },DETAIL_RETRY_DELAY);
}

function handleDetailSuccess(d){
  activeDetailRequests=0;
  clearDetailLoadTimers();

  if(!d||d.ok!==true){
    detailProgress('Ошибка сервера: '+String(d&&d.error?d.error:'неизвестная ошибка.'),true);
    scheduleDetailRetry();
    return;
  }

  var r=acceptDetail(d);

  if(!r.ok){
    if(r.type==='stale')return;
    detailProgress((r.type==='render'?'Ошибка отображения: ':'Ошибка данных: ')+r.message,true);
    scheduleDetailRetry();
    return;
  }

  detailRetryCount=0;
  updateFreshnessNotice();
  checkFreshness();
}

function requestDetailLegacy(){
  jsonp(
    {auction:aid},
    handleDetailSuccess,
    function(err){
      activeDetailRequests=0;
      clearDetailLoadTimers();
      detailProgress('Ошибка связи: '+String(err&&err.message?err.message:'не удалось получить данные.'),true);
      scheduleDetailRetry();
    }
  );
}

function requestDetail(){
  if(activeDetailRequests>0)return;
  activeDetailRequests=1;
  freshnessStartedAt=Date.now();
  clearDetailLoadTimers();
  fetchState(encodeURIComponent(aid)+'.json',validateDetailSnapshot,handleDetailSuccess,function(error){
    // Drafts have no published snapshot yet. Only two explicit 404s may use
    // the existing direct-link API; timeout/invalid data never starts JSONP.
    if(error.missing&&!last){requestDetailLegacy();return;}
    activeDetailRequests=0;
    detailProgress('Ошибка связи: '+error.message,true);
    scheduleDetailRetry();
  });
}

function startDetailLoadCycle(){
  clearDetailLoadTimers();
  detailRetryCount=0;
  requestDetail();
}

function startPoll(){
  if(!poll){
    poll=setInterval(function(){
      requestDetail();
    },POLL);
  }
}

function stopPoll(){
  if(poll){
    clearInterval(poll);
    poll=null;
  }
}

function updateCounts(){
  app.querySelectorAll('[data-count]').forEach(function(n){
    var s=n.querySelector('span');
    var target=n.getAttribute('data-count');

    if(s)s.textContent=countText(target);

    if(Date.parse(target)<=Date.now()&&expiredDetailTarget!==target){
      expiredDetailTarget=target;
      requestDetail();
    }
  });
}

function startCount(){
  stopCount();
  updateCounts();
  countTimer=setInterval(updateCounts,1000);
}

function stopCount(){
  if(countTimer){
    clearInterval(countTimer);
    countTimer=null;
  }
}

function loadDetail(){
  if(!/^[A-Za-z0-9_-]{1,64}$/.test(aid)){
    app.innerHTML='<div class="pa-err">Некорректная ссылка.</div>';
    return;
  }

  var c=readDetail();

  if(c){
    try{
      renderDetail(c);
      last=c;
      updateFreshnessNotice();
    }catch(e){
      try{localStorage.removeItem(detailKey());}catch(ignore){}
      last=null;
      detailProgress('Ошибка отображения сохранённых данных: '+String(e&&e.message?e.message:'неизвестная ошибка.'),true);
    }

    requestDetail();
    return;
  }

  var preview=catalogAuction(aid);

  if(preview)renderDetailPreview(preview);
  else app.innerHTML='<div class="pa-load">Загружаем аукцион...</div>';

  startDetailLoadCycle();
}

document.addEventListener('click',function(e){
  var rulesOpen=e.target.closest('[data-rules-open]');
  if(rulesOpen){
    e.preventDefault();
    openRules(rulesOpen);
    return;
  }

  var rulesClose=e.target.closest('[data-rules-close]');
  if(rulesClose){
    e.preventDefault();
    closeRules();
    return;
  }

  if(rulesEl&&rulesEl.classList.contains('open')&&e.target===rulesEl){
    closeRules();
    return;
  }

  var b=e.target.closest('[data-tg]');
  if(b){
    e.preventDefault();
    tg(b.getAttribute('data-tg'));
    return;
  }

  var close=e.target.closest('[data-lightbox-close]');
  if(close){
    e.preventDefault();
    closeLightbox();
    return;
  }

  var prev=e.target.closest('[data-lightbox-prev]');
  if(prev){
    e.preventDefault();
    stepLightbox(-1);
    return;
  }

  var next=e.target.closest('[data-lightbox-next]');
  if(next){
    e.preventDefault();
    stepLightbox(1);
    return;
  }

  var t=e.target.closest('.pa-thumb[data-target]');
  if(t){
    e.preventDefault();
    var m=document.getElementById(t.getAttribute('data-target'));
    if(m){
      m.src=t.getAttribute('data-src');
      m.setAttribute('data-lightbox-index',t.getAttribute('data-index')||'0');
    }

    var root=t.closest('.pa-gallery');
    if(root){
      Array.prototype.forEach.call(root.querySelectorAll('.pa-thumb'),function(x){
        x.classList.toggle('is-active',x===t);
      });
    }
    return;
  }

  var zoom=e.target.closest('.pa-gallery .pa-img img[data-lightbox-gallery]');
  if(zoom){
    e.preventDefault();
    openLightbox(zoom);
    return;
  }

  if(lightboxEl&&lightboxEl.classList.contains('open')&&
     (e.target===lightboxEl||e.target.classList.contains('pa-lightbox-stage'))){
    closeLightbox();
  }
});

document.addEventListener('keydown',function(e){
  if(rulesEl&&rulesEl.classList.contains('open')){
    if(e.key==='Escape'){
      e.preventDefault();
      closeRules();
    }
    return;
  }

  if(!lightboxEl||!lightboxEl.classList.contains('open'))return;

  if(e.key==='Escape'){
    e.preventDefault();
    closeLightbox();
  }else if(e.key==='ArrowLeft'){
    e.preventDefault();
    stepLightbox(-1);
  }else if(e.key==='ArrowRight'){
    e.preventDefault();
    stepLightbox(1);
  }
});

document.addEventListener('touchstart',function(e){
  if(!lightboxEl||!lightboxEl.classList.contains('open'))return;
  if(!e.touches||e.touches.length!==1)return;
  lightboxTouchStartX=e.touches[0].clientX;
},{passive:true});

document.addEventListener('touchend',function(e){
  if(lightboxTouchStartX==null||!lightboxEl||!lightboxEl.classList.contains('open'))return;
  if(!e.changedTouches||!e.changedTouches.length){
    lightboxTouchStartX=null;
    return;
  }

  var dx=e.changedTouches[0].clientX-lightboxTouchStartX;
  lightboxTouchStartX=null;

  if(Math.abs(dx)<50)return;
  stepLightbox(dx<0?1:-1);
},{passive:true});

document.addEventListener('error',function(e){
  var im=e.target;

  if(im&&im.matches&&im.matches('#pa-app img[data-pa-img="1"]')){
    im.style.display='none';
    var p=im.closest('.pa-img');
    if(p)p.textContent='Фото не загрузилось';
  }
},true);

if(mode==='catalog'){
  loadCatalog();
}else{
  var cachedCatalog=readCat();
  if(cachedCatalog)lastCatalog=cachedCatalog;
  loadDetail();
}

startFreshnessChecks();

})();