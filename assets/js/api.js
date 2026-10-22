import {CONFIG} from './config.js';

async function getJson(params={}){
  const url=new URL(CONFIG.reportEndpoint);
  Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
  const response=await fetch(url.toString(),{method:'GET',cache:'no-store'});
  if(!response.ok)throw new Error(`Backend CEPA no disponible (${response.status})`);
  const data=await response.json();
  if(!data?.ok)throw new Error(data?.error||'Respuesta inválida del backend CEPA');
  return data;
}

export function getHistory(date){
  return getJson({action:'history',date});
}

export function toLegacyDailyPayload(report){
  const payload={estado_general:report.status,Observaciones_Centro:report.notes||'',GooglePhotos_Link:''};
  for(const task of report.tasks){
    const key=task.legacyId||task.id;
    payload[`${key}_Obs`]=task.obs||'';
    payload[`${key}_Check`]=Boolean(task.done);
  }
  return payload;
}

export async function postLegacyDaily(report){
  const payload=toLegacyDailyPayload(report);
  await fetch(CONFIG.reportEndpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
  return payload;
}
