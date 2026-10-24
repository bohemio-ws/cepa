import {CONFIG} from './config.js';
import {getCredential} from './auth.js';

async function request(action,payload={}){
  const credential=getCredential();
  if(!credential)throw new Error('Sesión de Google no válida. Vuelve a identificarte.');
  const response=await fetch(CONFIG.reportEndpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action,credential,...payload}),redirect:'follow',cache:'no-store'});
  if(!response.ok)throw new Error(`Backend CEPA no disponible (${response.status})`);
  const data=await response.json();
  if(!data?.ok){if(data?.error==='AUTH_REQUIRED'||data?.error==='AUTH_FORBIDDEN')throw new Error('Acceso no autorizado.');throw new Error(data?.error||'Respuesta inválida del backend CEPA')}
  return data;
}
const rows=data=>data?.items||data?.events||[];
const value=(row,...names)=>{for(const name of names){if(row?.[name]!==undefined)return row[name]}return''};
const rowId=row=>String(value(row,'ID','id')||'');
const norm=v=>String(v??'').trim();
async function verifyEvent(event,shouldExist){
  if(!event?.fecha)throw new Error('No se puede verificar Google: falta la fecha del registro.');
  const data=await request('events',{date:event.fecha});
  const list=rows(data);
  if(!Array.isArray(list))throw new Error('Google no devolvió una lista verificable de registros.');
  const found=list.find(row=>rowId(row)===String(event.id));
  if(!shouldExist){if(found)throw new Error('Google sigue conservando el registro. No se ha borrado localmente.');return true}
  if(!found)throw new Error('Google no confirma el registro modificado. Se conserva la copia local anterior.');
  const checks=[['tipo','Tipo'],['zona','Zona'],['estado','Estado'],['observacion','Observación','Observacion'],['referencia','Referencia'],['cantidad','Cantidad'],['unidad','Unidad'],['prioridad','Prioridad']];
  for(const names of checks){const expected=event[names[0]];if(expected===undefined||expected===null)continue;const actual=value(found,...names);if(norm(actual)!==norm(expected))throw new Error(`Google no confirma el cambio del campo ${names[0]}.`)}
  return true;
}
export const getSession=()=>request('session');
export const getHistory=date=>request('history',{date});
export const getEvents=date=>request('events',{date});
export const getEvidence=date=>request('evidence_list',{date});
export const getNextOrder=date=>request('nextorder',{date});
export const getContacts=()=>request('contacts');
export const createContact=contact=>request('contact',contact);
export const updateContact=contact=>request('update_contact',contact);
export const deactivateContact=id=>request('delete_contact',{id});
export const createEvent=event=>request('event',event);
export const updateEvent=async event=>{const result=await request('update_event',event);await verifyEvent(event,true);return result};
export const deleteEvent=async(id,date='')=>{const result=await request('delete_event',{id});if(date)await verifyEvent({id,fecha:date},false);return result};
export const createEvidence=evidence=>request('evidence',evidence);
export const deleteEvidence=id=>request('delete_evidence',{id});
export const createOrder=order=>request('order',order);
export const generateReport=date=>request('report',{date});
export const generateTestReport=date=>request('test_report',{date});
export const generateIncidentPdf=id=>request('incident_pdf',{id});
export const emailIncident=(id,recipient='')=>request('incident_mail',{id,recipient});
export const generateOrderPdf=id=>request('order_pdf',{id});
export const emailOrder=(id,recipient='')=>request('order_mail',{id,recipient});
export const generateReportPdf=date=>request('report_pdf',{date});
export const emailReport=(date,recipient='')=>request('report_mail',{date,recipient});