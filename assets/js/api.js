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
const rows=data=>data?.items||data?.events||data?.evidence||[];
const value=(row,...names)=>{for(const name of names){if(row?.[name]!==undefined)return row[name]}return''};
const hasField=(row,...names)=>names.some(name=>row&&Object.prototype.hasOwnProperty.call(row,name));
const rowId=row=>String(value(row,'ID','id')||'');
const norm=v=>String(v??'').trim();
const canonicalEvent=e=>({id:e.id,date:e.date??e.fecha,time:e.time??e.hora,type:e.type??e.tipo,zone:e.zone??e.zona,status:e.status??e.estado,observation:e.observation??e.observacion,reference:e.reference??e.referencia,quantity:e.quantity??e.cantidad,unit:e.unit??e.unidad,priority:e.priority??e.prioridad,origin:e.origin??e.origen});
async function verifyEvent(event,shouldExist){
  const e=canonicalEvent(event);
  if(!e.date)throw new Error('No se puede verificar Google sin la fecha original del registro.');
  const data=await request('events',{date:e.date}),list=rows(data);
  if(!Array.isArray(list))throw new Error('Google no devolvió una lista verificable de registros.');
  const found=list.find(row=>rowId(row)===String(e.id));
  if(!shouldExist){if(found)throw new Error('Google sigue conservando el registro. No se ha borrado localmente.');return true}
  if(!found)throw new Error('Google no confirma el registro modificado. Se conserva la copia local anterior.');
  const checks=[['type','Tipo'],['zone','Zona'],['status','Estado'],['observation','Observación','Observacion'],['reference','Referencia'],['quantity','Cantidad'],['unit','Unidad']];
  for(const names of checks){const expected=e[names[0]];if(expected===undefined||expected===null)continue;const providerNames=names.slice(1);if(!hasField(found,...providerNames)&&!hasField(found,names[0]))continue;const actual=value(found,...providerNames,names[0]);if(norm(actual)!==norm(expected))throw new Error(`Google no confirma el cambio del campo ${names[0]}.`)}
  return true;
}
async function verifyEvidenceDeleted(id,date){
  if(!date)throw new Error('No se puede verificar Google sin la fecha original de la evidencia.');
  const data=await request('evidence_list',{date}),list=rows(data);
  if(!Array.isArray(list))throw new Error('Google no devolvió una lista verificable de evidencias.');
  if(list.some(row=>rowId(row)===String(id)))throw new Error('Google sigue conservando la evidencia. No se ha borrado localmente.');
  return true;
}
const reportPayload=(date,sections={})=>({date,sections:{work:sections.work!==false,incidents:sections.incidents!==false,orders:sections.orders===true,stock:sections.stock===true}});
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
export const updateEvent=async event=>{const e=canonicalEvent(event);const result=await request('update_event',e);await verifyEvent(e,true);return result};
export const deleteEvent=async(id,date)=>{const result=await request('delete_event',{id});await verifyEvent({id,date},false);return result};
export const createEvidence=evidence=>request('evidence',evidence);
export const deleteEvidence=async(id,date)=>{const result=await request('delete_evidence',{id});await verifyEvidenceDeleted(id,date);return result};
export const createOrder=order=>request('order',order);
export const generateReport=(date,sections)=>request('report',reportPayload(date,sections));
export const generateTestReport=(date,sections)=>request('test_report',reportPayload(date,sections));
export const generateIncidentPdf=id=>request('incident_pdf',{id});
export const emailIncident=(id,recipient='')=>request('incident_mail',{id,recipient});
export const generateOrderPdf=id=>request('order_pdf',{id});
export const emailOrder=(id,recipient='')=>request('order_mail',{id,recipient});
export const generateReportPdf=(date,sections)=>request('report_pdf',reportPayload(date,sections));
export const emailReport=(date,recipient='',sections)=>request('report_mail',{...reportPayload(date,sections),recipient});