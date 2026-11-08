import { CONFIG } from './config.js';

// La copia del navegador es una caché; los registros confirmados viven en Google.
// Si localStorage se llena, conservar la sesión actual en memoria sin borrar históricos.
const memory=new Map();
const key=n=>CONFIG.storagePrefix+n;
const read=(n,fallback=[])=>{
  if(memory.has(n))return memory.get(n);
  try{
    const raw=localStorage.getItem(key(n));
    if(raw===null)return fallback;
    const parsed=JSON.parse(raw);
    return Array.isArray(parsed)?parsed:fallback;
  }catch(error){console.warn('CEPA: no se puede leer la caché local.',{bucket:n,error});return fallback}
};
const diskValue=(n,v)=>n==='evidence'?v.map(item=>({...item,url:typeof item.url==='string'&&item.url.startsWith('data:')?'':item.url})):v;
const write=(n,v)=>{
  memory.set(n,v);
  try{localStorage.setItem(key(n),JSON.stringify(diskValue(n,v)));return true}
  catch(error){
    console.warn('CEPA: caché persistente no disponible; datos de la sesión conservados en memoria.',{bucket:n,error});
    try{window.dispatchEvent(new CustomEvent('cepa:cache-write-failed',{detail:{bucket:n,reason:error?.name||'UNKNOWN',message:String(error?.message||'').slice(0,160)}}))}catch{}
    return false;
  }
};
const randomPart=()=>globalThis.crypto?.randomUUID?crypto.randomUUID().slice(0,8):`${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`;
export const uid=prefix=>`${prefix}-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${randomPart()}`;
export const Store={
 list:n=>read(n).slice(),
 add(n,item){const all=read(n).slice();all.unshift(item);write(n,all);return item},
 update(n,id,changes){const all=read(n).slice(),i=all.findIndex(x=>x.id===id);if(i<0)return null;all[i]={...all[i],...changes,updatedAt:new Date().toISOString()};write(n,all);return all[i]},
 remove(n,id){const all=read(n),next=all.filter(x=>x.id!==id);if(next.length===all.length)return false;write(n,next);return true},
 replace:(n,all)=>write(n,all.slice()),
 snapshot(){return {reports:read('reports'),roomEvents:read('roomEvents'),dailyGeneral:read('dailyGeneral'),evidence:read('evidence'),incidents:read('incidents'),stock:read('stock'),orders:read('orders'),supplies:read('supplies')}}
};
