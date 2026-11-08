import { CONFIG } from './config.js';
const key=n=>CONFIG.storagePrefix+n;
const read=(n,fallback=[])=>{try{const v=localStorage.getItem(key(n));return v===null?fallback:JSON.parse(v)}catch{return fallback}};
const write=(n,v)=>{try{localStorage.setItem(key(n),JSON.stringify(v));return true}catch(error){console.warn('CEPA: caché local no actualizada; el almacenamiento del navegador puede estar lleno o bloqueado.',{bucket:n,error});try{window.dispatchEvent(new CustomEvent('cepa:cache-write-failed',{detail:{bucket:n,reason:error?.name||'UNKNOWN'}}))}catch{}return false}};
const randomPart=()=>globalThis.crypto?.randomUUID?crypto.randomUUID().slice(0,8):`${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`;
export const uid=prefix=>`${prefix}-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${randomPart()}`;
export const Store={
 list:n=>read(n),
 add(n,item){const all=read(n);all.unshift(item);write(n,all);return item},
 update(n,id,changes){const all=read(n),i=all.findIndex(x=>x.id===id);if(i<0)return null;all[i]={...all[i],...changes,updatedAt:new Date().toISOString()};write(n,all);return all[i]},
 remove(n,id){const all=read(n),next=all.filter(x=>x.id!==id);if(next.length===all.length)return false;write(n,next);return true},
 replace:(n,all)=>write(n,all),
 snapshot(){return {reports:read('reports'),roomEvents:read('roomEvents'),dailyGeneral:read('dailyGeneral'),evidence:read('evidence'),incidents:read('incidents'),stock:read('stock'),orders:read('orders'),supplies:read('supplies')}}
};