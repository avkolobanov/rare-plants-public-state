(function(){
'use strict';

var API='https://script.google.com/macros/s/AKfycbwqjj6hFQ3PGNNMeAXgLBWj5Nq6yAQh65XbR4JKlqV_7wuqPGtUIhJnavZAXv96rgyI0w/exec';
var PUBLIC_STATE='https://avkolobanov.github.io/rare-plants-public-state/state';
var BOT='plant_hunt_auction_bot';

var POLL=7000;
var REQ_TIMEOUT=18000;
var STATIC_TIMEOUT=5000;
var DETAIL_CACHE_MS=30000;
var CATALOG_CACHE_MS=300000;
var DETAIL_SLOW_DELAY=12000;
var DETAIL_RETRY_DELAY=3000;
var DETAIL_MAX_RETRIES=1;

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
  style.textContent=[
    '#rec4227562401{display:none!important}',
    '#pa-app,#pa-app *{box-sizing:border-box}',
    '#pa-app{max-width:1120px;margin:auto;font-family:Arial,sans-serif;color:#222;line-height:1.4}',
    '#pa-app a{color:inherit}',
    '.pa-load,.pa-err{text-align:center;padding:20px 0;background:transparent}.pa-err{color:#8c1f1f}',
    '.pa-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.pa-sec{margin:0 0 30px}.pa-sec h2{font-size:26px;margin:0 0 14px}',
    '.pa-card,.pa-box,.pa-cut{background:#fff;border:1px solid #ddd;border-radius:16px;overflow:hidden}.pa-card{display:flex;flex-direction:column;text-decoration:none!important}',
    '.pa-img{position:relative;aspect-ratio:4/3;background:#f1f1f1;display:flex;align-items:center;justify-content:center;color:#888;overflow:hidden}.pa-img img{width:100%;height:100%;object-fit:cover;display:block}',
    '.pa-badge{display:inline-block;padding:6px 10px;border-radius:999px;background:#eee;font-size:12px;font-weight:700}.pa-img .pa-badge{position:absolute;left:10px;top:10px;background:rgba(255,255,255,.94)}',
    '.pa-active{background:#dff3e4;color:#17662c}.pa-upcoming{background:#e7efff;color:#274f93}.pa-reserve{background:#fff0c7;color:#735200}',
    '.pa-card-body,.pa-box-body,.pa-cut-body{padding:16px}.pa-card h3,.pa-cut h3{margin:0 0 6px}.pa-muted{color:#777;font-size:13px}.pa-meta{margin-top:12px;padding-top:10px;border-top:1px solid #eee;font-size:13px}.pa-row{display:flex;justify-content:space-between;gap:12px;padding:3px 0}.pa-row b{text-align:right}',
    '.pa-detail{max-width:900px;margin:auto}.pa-back{display:inline-block;margin-bottom:14px;font-weight:700;text-decoration:none!important}.pa-box{margin-bottom:16px}.pa-main{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:20px;padding:18px}.pa-title{margin:8px 0;font-size:30px}.pa-desc{white-space:pre-line;color:#444;margin:10px 0}',
    '.pa-notice{margin-top:12px;padding:12px;border-radius:10px;background:#f4f4f4}.pa-ok{background:#e7f6eb;color:#17662c}.pa-warn{background:#fff4d9;color:#674d00}.pa-count{margin-top:8px;font-weight:700}',
    '.pa-btn{display:flex;width:100%;min-height:44px;margin-top:12px;padding:11px 14px;border:0;border-radius:10px;align-items:center;justify-content:center;background:#217a3c;color:#fff!important;font:inherit;font-weight:700;text-decoration:none!important;cursor:pointer}.pa-btn.dark{background:#222}.pa-btn.secondary{background:#edf0ed;color:#222!important}.pa-btn.off{background:#ddd;color:#777!important;pointer-events:none}',
    '.pa-cuttings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.pa-cut{display:grid;grid-template-columns:minmax(160px,.75fr) minmax(0,1.25fr)}.pa-cut .pa-img{border-radius:0}.pa-gallery-thumbs{display:flex;gap:6px;overflow:auto;padding-top:6px}.pa-thumb{width:70px;height:54px;border:1px solid #ddd;border-radius:8px;padding:0;overflow:hidden;background:#eee}.pa-thumb img{width:100%;height:100%;object-fit:cover}.pa-foot{text-align:center;color:#999;font-size:11px;margin-top:10px}',
    '@media(max-width:900px){.pa-grid{grid-template-columns:repeat(2,1fr)}.pa-main,.pa-cut{grid-template-columns:1fr}}',
    '@media(max-width:640px){.pa-grid,.pa-cuttings{grid-template-columns:1fr}.pa-title{font-size:25px}.pa-sec h2{font-size:22px}}'
  ].join('');
  document.head.appendChild(style);
}

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
    p==='reserve'?'pa-reserve':'';
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
      if(!response.ok)throw new Error('HTTP '+response.status);
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
}

function img(photo,alt,id){
  var url=publicImageUrl(photo);
  if(!url)return'<div class="pa-img">Фото пока нет</div>';
  return'<div class="pa-img"><img '+
    (id?'id="'+esc(id)+'" ':'')+
    'data-pa-img="1" src="'+esc(url)+'" alt="'+esc(alt||'')+'"></div>';
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

  var h=img(a[0],alt,base+'-main');

  if(a.length>1){
    h+='<div class="pa-gallery-thumbs">'+a.map(function(p){
      var url=publicImageUrl(p);
      return'<button class="pa-thumb" data-target="'+esc(base+'-main')+
        '" data-src="'+esc(url)+'"><img src="'+esc(url)+'" alt=""></button>';
    }).join('')+'</div>';
  }

  return h;
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

  return'<a class="pa-card" href="/auctions?auction='+encodeURIComponent(x.id)+'">'+
    '<div class="pa-img">'+p+'<span class="pa-badge '+cls(x.status)+'">'+label(x.status)+'</span></div>'+
    '<div class="pa-card-body">'+
      '<h3>'+esc(x.plant||x.id)+'</h3>'+
      '<div class="pa-muted">Аукцион '+esc(x.id)+'</div>'+
      (x.description?'<div>'+esc(x.description)+'</div>':'')+
      '<div class="pa-meta">'+
        '<div class="pa-row"><span>'+dl+'</span><b>'+esc(dt(dv,x.timezone))+'</b></div>'+
        '<div class="pa-row"><span>Черенков</span><b>'+esc(x.cuttingCount||0)+'</b></div>'+
        '<div style="margin-top:8px;font-weight:700">'+
          (x.status==='archive'?'Посмотреть результаты →':'Открыть аукцион →')+
        '</div>'+
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

  function sec(k,t){
    return g[k].length?
      '<section class="pa-sec"><h2>'+t+'</h2><div class="pa-grid">'+g[k].map(card).join('')+'</div></section>':
      '';
  }

  app.innerHTML=
    '<div class="pa-muted" style="margin-bottom:16px">Опубликованных аукционов: '+d.auctions.length+'</div>'+
    sec('active','Идёт сейчас')+
    sec('upcoming','Скоро')+
    sec('archive','Архив');
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
  if(lastCatalog){
    renderCatalog(lastCatalog);
  }

  if(catalogRefreshInFlight)return;

  catalogRefreshInFlight=true;

  fetchJson(
    PUBLIC_STATE+'/catalog.json?_='+Date.now(),
    function(d){
      if(d&&d.ok===true&&Array.isArray(d.auctions)){
        catalogRefreshInFlight=false;
        saveCat(d);
        renderCatalog(d);
        return;
      }

      loadCatalogLegacy();
    },
    function(){
      loadCatalogLegacy();
    }
  );
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

function loadCatalogLegacy(){
  jsonp(
    {action:'auctions'},
    function(d){
      catalogRefreshInFlight=false;

      if(d&&d.ok===true&&Array.isArray(d.auctions)){
        saveCat(d);
        renderCatalog(d);
      }else if(!lastCatalog){
        app.innerHTML='<div class="pa-err">Не удалось загрузить список аукционов.</div>';
      }
    },
    function(){
      catalogRefreshInFlight=false;

      if(!lastCatalog){
        app.innerHTML='<div class="pa-err">Не удалось загрузить список аукционов.</div>';
      }
    }
  );
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

function notice(a,p){
  if(p==='upcoming'){
    return'<div class="pa-notice">Аукцион ещё не начался.'+countMarkup('До начала',a.start)+'</div>';
  }
  if(p==='active'){
    return'<div class="pa-notice pa-ok">Аукцион открыт. Ставки принимаются в Telegram.'+countMarkup('До окончания',a.end)+'</div>';
  }
  if(p==='reserve'){
    return'<div class="pa-notice pa-warn">⚡ Всё растение временно зарезервировано по блиц-покупке. Обычные ставки приостановлены.</div>';
  }
  if(p==='ending'){
    return'<div class="pa-notice">Время аукциона закончилось. Фиксируем результаты...</div>';
  }
  if(p==='archive'){
    return'<div class="pa-notice">Аукцион завершён. Ниже показаны результаты.</div>';
  }
  return'';
}

function question(a,p){
  return questionAllowed(p)?
    '<button class="pa-btn secondary" data-tg="question_'+esc(a.id)+'">Задать вопрос</button>':
    '';
}

function blitz(a,p){
  if(a.blitzSale&&a.blitzSale.sold===true){
    return'<div class="pa-box"><div class="pa-box-body">'+
      '<b>⚡ Продано по блицу</b>'+
      '<div style="font-size:26px;font-weight:700">'+money(a.blitzSale.price)+'</div>'+
    '</div></div>';
  }

  if(p==='archive'||p==='ending')return'';
  if(!a.blitz||!a.blitz.enabled)return'';

  var act=p==='active'?
    '<button class="pa-btn dark" data-tg="blitz_'+esc(a.id)+'">Купить всё растение</button>':
    '<div class="pa-btn off">'+
      (p==='reserve'?'Растение зарезервировано':'Блиц недоступен')+
    '</div>';

  return'<div class="pa-box"><div class="pa-box-body">'+
    '<b>⚡ Купить всё растение</b>'+
    '<div style="font-size:26px;font-weight:700">'+money(a.blitz.price)+'</div>'+
    '<div class="pa-muted">На оплату: '+esc(a.blitz.paymentMinutes)+' мин.</div>'+
    act+
  '</div></div>';
}

function cut(x,p,wholeBlitzSold){
  var action=
    p==='active'?
      '<button class="pa-btn" data-tg="bid_'+esc(x.id)+'">Сделать ставку</button>':
    p==='reserve'?
      '<div class="pa-btn off">Ставки на паузе</div>':
    p==='upcoming'?
      '<div class="pa-btn off">Аукцион ещё не начался</div>':
      '';

  var result='';

  if(p==='archive'){
    if(wholeBlitzSold){
      result='<div class="pa-row"><span>Результат</span><b>Продан в составе растения</b></div>';
    }else{
      result='<div class="pa-row"><span>Результат</span><b>'+
        (x.sold?'Продан за '+money(x.finalPrice):'Не продан')+
      '</b></div>';
    }
  }else{
    result=
      '<div class="pa-row"><span>Текущая ставка</span><b>'+
        (x.currentPrice==null?'нет':money(x.currentPrice))+
      '</b></div>'+
      '<div class="pa-row"><span>Следующая</span><b>'+money(x.nextBid)+'</b></div>';
  }

  return'<article class="pa-cut">'+
    gallery(x.mainPhoto,x.photos,'cut-'+x.id,'Черенок №'+x.number)+
    '<div class="pa-cut-body">'+
      '<h3>№'+esc(x.number)+' — '+esc(x.type||'Черенок')+'</h3>'+
      (x.description?'<div class="pa-muted">'+esc(x.description)+'</div>':'')+
      '<div class="pa-row"><span>Старт</span><b>'+money(x.startPrice)+'</b></div>'+
      '<div class="pa-row"><span>Шаг</span><b>'+money(x.step)+'</b></div>'+
      '<div class="pa-row"><span>Ставок</span><b>'+esc(x.bidCount||0)+'</b></div>'+
      result+
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
      html:'<div class="pa-detail"><div class="pa-notice">Аукцион готовится к публикации.</div><a class="pa-btn" href="/auctions">Все аукционы</a></div>'
    };
  }

  var wholeBlitzSold=!!(a.blitzSale&&a.blitzSale.sold===true);

  var html=
    '<div class="pa-detail">'+
      '<a class="pa-back" href="/auctions">← Все аукционы</a>'+
      '<div class="pa-box">'+
        '<div class="pa-main">'+
          '<div>'+gallery(a.mainPhoto,a.photos,'auction',a.plant)+'</div>'+
          '<div>'+
            '<span class="pa-badge '+cls(p)+'">'+label(p)+'</span>'+
            '<h1 class="pa-title">'+esc(a.plant||a.id)+'</h1>'+
            '<div class="pa-muted">Аукцион '+esc(a.id)+(a.mode?' · '+esc(a.mode):'')+'</div>'+
            (a.description?'<div class="pa-desc">'+esc(a.description)+'</div>':'')+
            '<div>Начало: '+esc(dt(a.start,a.timezone))+'</div>'+
            '<div>Окончание: '+esc(dt(a.end,a.timezone))+'</div>'+
            notice(a,p)+
            question(a,p)+
          '</div>'+
        '</div>'+
      '</div>'+
      blitz(a,p)+
      (d.cuttings.length?
        '<div class="pa-cuttings">'+
          d.cuttings.map(function(x){return cut(x,p,wholeBlitzSold);}).join('')+
        '</div>':
        '')+
      '<div id="pa-detail-status" class="pa-foot">'+
        (p==='archive'?'Итоговые данные аукциона':'Данные обновляются автоматически')+
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

  app.innerHTML=
    '<div class="pa-detail">'+
      '<a class="pa-back" href="/auctions">← Все аукционы</a>'+
      '<div class="pa-box">'+
        '<div class="pa-main">'+
          '<div>'+gallery(a.mainPhoto,[],'auction-preview',a.plant)+'</div>'+
          '<div>'+
            '<span class="pa-badge '+cls(p)+'">'+label(p)+'</span>'+
            '<h1 class="pa-title">'+esc(a.plant||a.id)+'</h1>'+
            '<div class="pa-muted">Аукцион '+esc(a.id)+(a.mode?' · '+esc(a.mode):'')+'</div>'+
            (a.description?'<div class="pa-desc">'+esc(a.description)+'</div>':'')+
            '<div>Начало: '+esc(dt(a.start,a.timezone))+'</div>'+
            '<div>Окончание: '+esc(dt(a.end,a.timezone))+'</div>'+
            notice(a,p)+
            question(a,p)+
          '</div>'+
        '</div>'+
      '</div>'+
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
  clearDetailLoadTimers();

  detailSlowTimer=setTimeout(function(){
    detailProgress('Данные обновляются медленнее обычного. Продолжаем ждать…',false);
  },DETAIL_SLOW_DELAY);

  fetchJson(
    PUBLIC_STATE+'/'+encodeURIComponent(aid)+'.json?_='+Date.now(),
    function(snapshot){
      if(snapshot&&snapshot.data){
        handleDetailSuccess(snapshot.data);
        return;
      }
      requestDetailLegacy();
    },
    function(){
      requestDetailLegacy();
    }
  );
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
  var b=e.target.closest('[data-tg]');
  if(b){
    e.preventDefault();
    tg(b.getAttribute('data-tg'));
    return;
  }

  var t=e.target.closest('[data-target]');
  if(t){
    e.preventDefault();
    var m=document.getElementById(t.getAttribute('data-target'));
    if(m)m.src=t.getAttribute('data-src');
  }
});

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

})();
