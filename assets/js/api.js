import {CONFIG} from './config.js';

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
