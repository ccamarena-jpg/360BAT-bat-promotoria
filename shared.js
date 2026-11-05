/* BAT 360 Promotoría — utilidades compartidas por las vistas Padrón, Histórico y Radar:
   login Microsoft (Graph), lectura de Excel con caché local, y lectores del padrón e Información General. */
(function(){
  "use strict";
  var B = window.BAT = {};

  /* ───────── utilidades ───────── */
  var MON3 = {ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,set:8,oct:9,nov:10,dic:11};
  B.DIAS = ["lunes","martes","miercoles","jueves","viernes","sabado","domingo"];
  B.DIAS_T = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  B.clean = function(s){ return String(s==null?"":s).replace(/[   \s]+/g," ").trim(); };
  B.norm  = function(s){ return String(s==null?"":s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/\s+/g," ").trim(); };
  B.esc   = function(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
  B.pad2  = function(n){ return (n<10?"0":"")+n; };
  B.ymd   = function(d){ return d.getFullYear()+"-"+B.pad2(d.getMonth()+1)+"-"+B.pad2(d.getDate()); };
  B.addDays = function(d,n){ var x=new Date(d.getFullYear(),d.getMonth(),d.getDate()); x.setDate(x.getDate()+n); return x; };
  B.mondayOf = function(d){ var x=new Date(d.getFullYear(),d.getMonth(),d.getDate()); x.setDate(x.getDate()-((x.getDay()+6)%7)); return x; };
  B.parseDate = function(v){
    if(v instanceof Date && !isNaN(v)) return new Date(v.getFullYear(), v.getMonth(), v.getDate());
    if(typeof v==="number" && v>20000 && v<80000){ var d0=new Date(Math.round((v-25569)*864e5)); return new Date(d0.getUTCFullYear(), d0.getUTCMonth(), d0.getUTCDate()); }
    var s=B.clean(v); if(!s) return null;
    var m=/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/.exec(s);
    if(m){ var y=+m[3]; if(y<100) y+=2000; return new Date(y,+m[2]-1,+m[1]); }
    m=/^(\d{1,2})-([a-z]{3})[a-z]*-(\d{2,4})$/i.exec(s);
    if(m && MON3[m[2].toLowerCase()]!==undefined){ var y2=+m[3]; if(y2<100) y2+=2000; return new Date(y2,MON3[m[2].toLowerCase()],+m[1]); }
    m=/^(\d{4})-(\d{2})-(\d{2})/.exec(s); if(m) return new Date(+m[1],+m[2]-1,+m[3]);
    return null;
  };

  /* ───────── configuración que viene del sitio (site-config.js del padre) ───────── */
  var SITE=null; try{ if(window.parent!==window) SITE=window.parent.SITE; }catch(e){}
  B.SITE = SITE || {};
  B.links = (SITE && SITE.links) || {};
  B.histCut = null;
  var hm = SITE && +SITE.historialMeses; if(hm>0){ var t0=new Date(); B.histCut=new Date(t0.getFullYear(), t0.getMonth()-(hm-1), 1); }
  var refParts = ((SITE && SITE.refQ1) || "2026-10-26").split("-"), REF = new Date(+refParts[0],+refParts[1]-1,+refParts[2]);
  /* Quincena de una semana: Q1 y Q2 se alternan estrictamente a partir de la semana de referencia (verificado con Información General real). */
  B.weekQ = function(monday){ var n=Math.round((monday-REF)/(7*864e5)); return (((n%2)+2)%2===0)?"Q1":"Q2"; };

  /* ───────── lectura de Excel (solo la hoja necesaria) y caché local ───────── */
  var MESES_N=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","setiembre","octubre","noviembre","diciembre"];
  /* Pestaña del padrón: solo se usa la que se llama «BBDD <mes>». Si hubiera varias, la del mes más reciente. */
  B.pickBBDD = function(names){
    var c=names.filter(function(n){ return /^bbdd/i.test(B.clean(n)); }); if(!c.length) return null;
    function rank(n){ var s=B.norm(n), r=-1; MESES_N.forEach(function(m,i){ if(s.indexOf(m)!==-1) r=(i>=9? i-1 : i); }); return r; }   // setiembre = septiembre
    return c.slice().sort(function(a,b){ return rank(b)-rank(a); })[0];
  };
  B.readBook = function(buf, prefer){
    var opt={type:"array",cellDates:true,cellFormula:false,cellHTML:false,cellNF:false,cellStyles:false};
    if(prefer){ try{
      var nm=XLSX.read(buf,{type:"array",bookSheets:true}).SheetNames, pick=null;
      if(prefer instanceof RegExp){ var c=nm.filter(function(n){ return prefer.test(n); }); pick = c.length>1 && /bbdd/i.test(prefer.source) ? B.pickBBDD(c) : c[0]; }
      else if(nm.indexOf(prefer)!==-1) pick=prefer;
      if(pick) opt.sheets=[pick];
    }catch(e){} }
    return XLSX.read(buf,opt);
  };
  var PARSER_V="shared-3";
  function idb(){ return new Promise(function(res,rej){ try{ var rq=indexedDB.open("bat360cache",1); rq.onupgradeneeded=function(){ rq.result.createObjectStore("kv"); }; rq.onsuccess=function(){ res(rq.result); }; rq.onerror=function(){ rej(rq.error); }; }catch(e){ rej(e); } }); }
  B.cacheGet = function(k){ return idb().then(function(db){ return new Promise(function(res){ var r=db.transaction("kv").objectStore("kv").get(k); r.onsuccess=function(){ res(r.result||null); }; r.onerror=function(){ res(null); }; }); }).catch(function(){ return null; }); };
  B.cachePut = function(k,v){ return idb().then(function(db){ return new Promise(function(res){ var tx=db.transaction("kv","readwrite"); tx.objectStore("kv").put(v,k); tx.oncomplete=function(){ res(true); }; tx.onerror=function(){ res(false); }; }); }).catch(function(){ return false; }); };
  function b64url(s){ return btoa(unescape(encodeURIComponent(s))).replace(/=+$/,"").replace(/\+/g,"-").replace(/\//g,"_"); }
  /* Descarga un Excel compartido de SharePoint.
     opts: {prefer: hoja (texto o RegExp) a procesar, kind: clave de caché, parse: función wb→datos, knownMod: fecha ya cargada}
     Devuelve {data, mod, cached} o null si el archivo no cambió desde knownMod. Con caché, si SharePoint dice que no cambió
     desde la última vez, no se descarga ni se procesa nada. */
  B.fetchParsed = function(token, url, opts){
    var base="https://graph.microsoft.com/v1.0/shares/u!"+b64url(url)+"/driveItem", h={headers:{Authorization:"Bearer "+token}};
    return fetch(base+"?$select=lastModifiedDateTime",h).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }).then(function(m){
      var modIso = m && m.lastModifiedDateTime || null;
      if(opts.knownMod && modIso && new Date(modIso).getTime()===new Date(opts.knownMod).getTime()) return null;
      var ckey = opts.kind && modIso ? opts.kind+"|"+url+"|"+(B.histCut?B.ymd(B.histCut):"all")+"|"+PARSER_V : null;
      return (ckey? B.cacheGet(ckey) : Promise.resolve(null)).then(function(c){
        if(c && c.mod===modIso && c.data) return {data:c.data, mod:modIso?new Date(modIso):null, cached:true};
        return fetch(base+"/content",h).then(function(r){ if(!r.ok) throw new Error("Graph HTTP "+r.status); return r.arrayBuffer(); }).then(function(buf){
          var data=opts.parse(B.readBook(buf,opts.prefer));
          if(!data.error && ckey) B.cachePut(ckey,{mod:modIso,data:data});
          return {data:data, mod:modIso?new Date(modIso):null, cached:false};
        });
      });
    });
  };
  B.errorText = function(err, page){
    var m=(err&&err.message)||String(err);
    if(m.indexOf("interaction_in_progress")!==-1) return "Login en curso o interrumpido. Recarga la página (F5).";
    if(m.indexOf("popup")!==-1) return "El navegador bloqueó la ventana de inicio de sesión. Permite ventanas emergentes para este sitio.";
    if(m.indexOf("AADSTS50011")!==-1||m.indexOf("redirect_uri")!==-1) return "Falta registrar esta página como Redirect URI (SPA) en Entra: bat360 → Authentication → .../"+(page||"")+". Mientras tanto usa la carga manual.";
    if(m.indexOf("Graph HTTP 403")!==-1) return "Tu cuenta no tiene acceso al archivo (403). Pide que te lo compartan; mientras tanto usa la carga manual.";
    if(m.indexOf("Graph HTTP 404")!==-1) return "No se encontró el archivo compartido (404). El link pudo cambiar.";
    return "No se pudo cargar desde SharePoint: "+m;
  };

  /* ───────── login Microsoft (misma app "bat360" de Entra) ───────── */
  var MS = { clientId:"2dd44541-d3ac-459c-afa0-aa873590f7e0", tenant:"9d85a34e-57e5-4f82-9341-7dd9300077b7", scopes:["Files.Read.All"] };
  B.auth = { app:null, user:"",
    init:function(){
      if(typeof msal==="undefined") return Promise.resolve(null);
      var app=B.auth.app=new msal.PublicClientApplication({auth:{clientId:MS.clientId,authority:"https://login.microsoftonline.com/"+MS.tenant,redirectUri:location.origin+location.pathname},cache:{cacheLocation:"localStorage"}});
      return app.initialize().then(function(){ return app.handleRedirectPromise(); }).then(function(resp){
        if(resp&&resp.account) app.setActiveAccount(resp.account);
        var acc=app.getActiveAccount()||app.getAllAccounts()[0];
        if(acc){ app.setActiveAccount(acc); B.auth.user=acc.username; }
        return acc||null;
      }).catch(function(e){ console.warn("MSAL init:",e&&e.message); return null; });
    },
    token:function(interactive){
      var app=B.auth.app, req={scopes:MS.scopes}, acc=app.getAllAccounts()[0];
      if(acc){ req.account=acc;
        return app.acquireTokenSilent(req).then(function(r){return r.accessToken;}).catch(function(){
          if(!interactive) return Promise.reject(new Error("silent-failed"));
          return app.acquireTokenPopup(req).then(function(r){return r.accessToken;}); }); }
      if(!interactive) return Promise.reject(new Error("no-account"));
      return app.loginPopup(req).then(function(r){ if(r.account) B.auth.user=r.account.username; return r.accessToken; });
    }
  };

  /* ───────── lectores ───────── */
  function headerRow(ws){
    if(!ws) return [];
    var ref=ws["!ref"]; if(!ref) return [];
    var r=XLSX.utils.decode_range(ref);
    var rows=XLSX.utils.sheet_to_json(ws,{header:1,range:{s:{r:r.s.r,c:r.s.c},e:{r:r.s.r,c:r.e.c}},defval:"",raw:true});
    return rows[0]||[];
  }
  function coord(v){ var n=typeof v==="number"? v : parseFloat(String(v==null?"":v).replace(",",".")); return isFinite(n)? n : null; }
  /* Padrón: una fila por tienda, con todos los tríos promotor / día / frecuencia (por mes). */
  B.parsePadron = function(wb){
    // Solo la pestaña «BBDD <mes>» (las demás hojas del libro —TD, Hoja1…, CODIGOS— no son el padrón)
    var best=B.pickBBDD(wb.SheetNames.filter(function(sn){ return wb.Sheets[sn]; }));
    if(!best) return {error:"No encontré la pestaña «BBDD <mes>» del padrón (por ejemplo «BBDD NOVIEMBRE»)."};
    var hh=headerRow(wb.Sheets[best]).map(B.norm);
    if(!(hh.some(function(c){return c.indexOf("codigo tt audit")===0;}) && hh.some(function(c){return c.indexOf("frecuencia")===0;})))
      return {error:"La pestaña «"+best+"» no tiene las columnas CÓDIGO TT AUDIT y FRECUENCIA."};
    var rows=XLSX.utils.sheet_to_json(wb.Sheets[best],{header:1,defval:"",raw:true,blankrows:false});
    var head=rows[0].map(B.norm);
    function idx(f){ for(var i=0;i<head.length;i++) if(f(head[i])) return i; return -1; }
    var iCod=idx(function(c){return c.indexOf("codigo tt audit")===0;}), iEst=idx(function(c){return c.indexOf("estacion")===0;}),
        iNom=idx(function(c){return c==="nombre bat";}), iDir=idx(function(c){return c.indexOf("direccion")===0;}),
        iDis=idx(function(c){return c==="distrito";}), iPro=idx(function(c){return c==="provincia";}),
        iZon=idx(function(c){return c.indexOf("lima/kc")===0;}), iCad=idx(function(c){return c==="cadenas"||c==="cadena";}),
        iLat=idx(function(c){return c==="latitud";}), iLon=idx(function(c){return c==="longitud";}), iNue=idx(function(c){return c.indexOf("fecha nueva apertura")===0;});
    var triples=[];
    // Cada trío = columna «DIA DE VISITA …» con su PROMOTOR (la columna de promotor más cercana a su izquierda) y su FRECUENCIA (a su derecha).
    // Se arma por posición y no por nombre, porque a veces los títulos no coinciden (p. ej. «PROMOTOR JULIO» junto a «DIA DE VISITA OCTUBRE»).
    head.forEach(function(h,i){
      if(h.indexOf("dia de visita")!==0) return;
      var iP=-1, iF=-1, k;
      for(k=i-1;k>=0;k--){ if(head[k].indexOf("dia de visita")===0) break; if(head[k].indexOf("promotor")===0){ iP=k; break; } }
      for(k=i+1;k<head.length;k++){ if(head[k].indexOf("dia de visita")===0 || head[k].indexOf("promotor")===0) break; if(head[k].indexOf("frecuencia")===0){ iF=k; break; } }
      var suf=h.replace("dia de visita","").trim();
      if(iP>=0 && iF>=0) triples.push({label:suf?suf.toUpperCase():"BASE", iP:iP, iD:i, iF:iF});
    });
    if(!triples.length) return {error:"No encontré columnas PROMOTOR / DIA DE VISITA / FRECUENCIA en el padrón."};
    var out=[];
    for(var r=1;r<rows.length;r++){
      var row=rows[r], store=B.clean(row[iCod]); if(!store) continue;
      var lat=iLat>=0?coord(row[iLat]):null, lon=iLon>=0?coord(row[iLon]):null;
      if(lat==null||lon==null||lat<-19||lat>1||lon<-82||lon>-68){ lat=null; lon=null; }   // fuera de Perú o vacío
      var ap=iNue>=0?B.parseDate(row[iNue]):null;
      out.push({ store:store, estacion:B.clean(row[iEst]), nombre:iNom>=0?B.clean(row[iNom]):"", direccion:iDir>=0?B.clean(row[iDir]):"",
        distrito:B.clean(row[iDis]), provincia:B.clean(row[iPro]).toUpperCase(), zona:B.clean(row[iZon]).toUpperCase(), cadena:B.clean(row[iCad]).toUpperCase(),
        lat:lat, lon:lon, apertura:ap,
        t:triples.map(function(t){ return { promotor:B.clean(row[t.iP]), dia:B.norm(row[t.iD]), frec:B.clean(row[t.iF]).toUpperCase() }; }) });
    }
    // Tiendas nuevas del padrón a veces vienen sin cadena: se completa con la cadena de las demás tiendas del mismo nombre (TAMBO, OXXO, PRIMAX…)
    function prefixOf(s){ var m=/^\s*([A-Za-z0-9ÁÉÍÓÚÑ]+)/.exec(String(s||"")); return m? m[1].toUpperCase() : ""; }
    var pref={}; out.forEach(function(r){ if(r.cadena){ var k=prefixOf(r.estacion||r.nombre); if(k && !pref[k]) pref[k]=r.cadena; } });
    out.forEach(function(r){ if(!r.cadena){ r.cadena=pref[prefixOf(r.estacion||r.nombre)]||"(SIN CADENA)"; r.cadenaInferida=true; } });
    return { rows:out, labels:triples.map(function(t){return t.label;}), sheet:best };
  };
  /* Información General: una fila por visita; efectiva = local abierto y permitió la auditoría en counter. */
  B.parseInfo = function(wb){
    var best=null;
    for(var i=0;i<wb.SheetNames.length;i++){
      var h=headerRow(wb.Sheets[wb.SheetNames[i]]).map(String);
      if(h.indexOf("store_id")!==-1 && h.some(function(c){return /local-abierto/i.test(c);}) && h.indexOf("fecha")!==-1){ best=wb.SheetNames[i]; break; }
    }
    if(!best) return {error:"No encontré una hoja de Información General (con store_id, fecha y local-abierto)."};
    var rows=XLSX.utils.sheet_to_json(wb.Sheets[best],{header:1,defval:"",raw:true,blankrows:false});
    var head=rows[0].map(String);
    var iS=head.indexOf("store_id"), iF=head.indexOf("fecha"), iA=head.indexOf("auditor"),
        iAb=head.findIndex(function(c){return /^local-abierto$/i.test(c);}),
        iPer=head.findIndex(function(c){return /permiti/i.test(c) && !/-(OPCION|FOTO)$/i.test(c) && !/_comentario$/i.test(c);}),
        iOpAb=head.findIndex(function(c){return /^local-abierto-OPCION$/i.test(c);}),
        iOpPer=head.findIndex(function(c){return /permiti/i.test(c) && /-OPCION$/i.test(c);}),
        iComOp=head.findIndex(function(c){return /^COMENTARIO_OPCION$/i.test(c);}),
        iFCnt=head.findIndex(function(c){return /^Foto counter-FOTO$/i.test(c);});
    function txt(row,i){ var v=i>=0?B.clean(row[i]):""; return (v==="null"||v==="0"||/^https?:/i.test(v))?"":v; }
    var visits=[], by={};
    for(var r=1;r<rows.length;r++){
      var row=rows[r], f=B.parseDate(row[iF]); if(!f) continue;
      if(B.histCut && f<B.histCut) continue;
      var store=B.clean(row[iS]); if(!store) continue;
      var ab=B.clean(row[iAb]), per=iPer>=0?B.clean(row[iPer]):"1", efectiva=(ab==="1" && per!=="0"), motivo="";
      if(!efectiva){ motivo = ab==="0" ? txt(row,iOpAb) : txt(row,iOpPer); if(!motivo || /^otro/i.test(motivo)) motivo = txt(row,iComOp) || motivo; }
      var fc=iFCnt>=0?B.clean(row[iFCnt]):""; if(!/^https?:/i.test(fc)) fc="";
      var vis={store:store,fecha:f,promotor:B.clean(row[iA]),abierto:(ab==="1"),efectiva:efectiva,motivo:motivo,fotos:{counter:fc}};
      visits.push(vis); (by[store]||(by[store]=[])).push(vis);
    }
    return { visits:visits, byStore:by };
  };

  /* ───────── padrón de cada mes ───────── */
  /* Descarga los padrones configurados en site-config.js (links.padrones): cada archivo vale para SU mes (el de octubre es octubre,
     el de noviembre es noviembre). Devuelve {snaps:[{mes,nombre,data,mod,fallback}] ordenados por mes, errors:[texto]}. */
  B.padSnapshots = function(token){
    var cfg=(B.links.padrones||[]).filter(function(x){ return x && x.url && x.mes; });
    if(!cfg.length && B.links.padron){ var d=new Date(); cfg=[{mes:d.getFullYear()+"-"+B.pad2(d.getMonth()+1),nombre:"Padrón",url:B.links.padron}]; }
    return Promise.all(cfg.map(function(c){
      var base={prefer:/^BBDD/i,kind:"pad:"+c.mes,parse:B.parsePadron};
      return B.fetchParsed(token,c.url,base).catch(function(e){
        if(!c.alterno) throw e;
        return B.fetchParsed(token,c.alterno,{prefer:base.prefer,kind:base.kind+":alt",parse:base.parse}).then(function(r){ r.fallback=true; return r; });
      }).then(function(res){
        if(res.data.error) return {error:(c.nombre||c.mes)+": "+res.data.error};
        return {mes:c.mes,nombre:c.nombre||c.mes,data:res.data,mod:res.mod,fallback:!!res.fallback};
      }).catch(function(e){ return {error:(c.nombre||c.mes)+": "+B.errorText(e,"")}; });
    })).then(function(list){
      return { snaps:list.filter(function(s){return s.data;}).sort(function(a,b){ return a.mes.localeCompare(b.mes); }),
               errors:list.filter(function(s){return s.error;}).map(function(s){return s.error;}).concat(list.filter(function(s){return s.fallback;}).map(function(s){return s.nombre+" (se usó el archivo alterno)";})) };
    });
  };
  /* Padrón que corresponde a una semana: el del mes de su lunes (o el más reciente anterior; si no hay, el primero). */
  B.padFor = function(snaps, monday){
    var mes=monday.getFullYear()+"-"+B.pad2(monday.getMonth()+1), pick=null;
    snaps.forEach(function(s){ if(s.mes<=mes) pick=s; });
    return pick || snaps[0];
  };

  /* ───────── programación según el padrón ───────── */
  /* Tiendas que le tocan a cada promotor en la semana que empieza en `monday`, según día y frecuencia del trío `ti`. */
  B.programacion = function(padRows, ti, monday){
    var q=B.weekQ(monday), list=[];
    padRows.forEach(function(r){
      var t=r.t[ti]; if(!t || !t.promotor) return;
      var di=B.DIAS.indexOf(t.dia); if(di<0) return;
      var f=t.frec;
      var toca = f.indexOf("SEMANAL")===0 ? true : f==="QUINCENAL 1" ? q==="Q1" : f==="QUINCENAL 2" ? q==="Q2" : f.indexOf("MENSUAL")===0 ? (B.addDays(monday,di).getDate()<=7) : false;
      if(!toca) return;
      list.push({ r:r, promotor:t.promotor, di:di, fecha:B.addDays(monday,di), frec:f });
    });
    return list;
  };
})();
