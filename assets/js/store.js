import { CONFIG } from './config.js';
const key = n => CONFIG.storagePrefix + n;
const read = (n, fallback=[]) => { try { return JSON.parse(localStorage.getItem(key(n))) ?? fallback; } catch { return fallback; } };
const write = (n,v) => localStorage.setItem(key(n), JSON.stringify(v));
export const uid = prefix => `${prefix}-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${crypto.randomUUID().slice(0,8)}`;
export const Store = {
  list: n => read(n),
  add(n, item){ const all=read(n); all.unshift(item); write(n,all); return item; },
  replace(n, all){ write(n,all); },
  getDraft(){ return read('draft',{}); },
  saveDraft(v){ write('draft',v); },
  clearDraft(){ localStorage.removeItem(key('draft')); },
  snapshot(){ return {reports:read('reports'), incidents:read('incidents'), stock:read('stock'), orders:read('orders'), supplies:read('supplies')}; }
};
