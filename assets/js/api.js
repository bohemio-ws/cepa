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
export const updateEvent=event=>request('update_event',event);
export const deleteEvent=id=>request('delete_event',{id});
export const createEvidence=evidence=>request('evidence',evidence);
export const deleteEvidence=id=>request('delete_evidence',{id});
export const createOrder=order=>request('order',order);
export const generateReport=date=>request('report',{date});
export const generateTestReport=date=>request('test_report',{date});
