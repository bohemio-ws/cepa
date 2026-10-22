import { CONFIG } from './config.js';
const key=n=>CONFIG.storagePrefix+n;
const read=(n,fallback=[])=>{try{const v=localStorage.getItem(key(n));return v===null?fallback:JSON.parse(v)}catch{return fallback}};
const write=(n,v)=>{try{localStorage.setItem(key(n),JSON.stringify(v));return true}catch(e){throw new Error('No hay espacio suficiente para guardar los datos.')}};
export const uid=prefix=>`${prefix}-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${crypto.randomUUID().slice(0,8)}`;
export const Store={
 list:n=>read(n), add(n,item){const all=read(n);all.unshift(item);write(n,all);return item},
 replace:(n,all)=>write(n,all), snapshot(){return {reports:read('reports'),evidence:read('evidence'),incidents:read('incidents'),stock:read('stock'),orders:read('orders'),supplies:read('supplies')}}
};