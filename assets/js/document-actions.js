import {Store,uid} from './store.js';
import {createEvent,updateEvent,deleteEvent,deleteEvidence,generateIncidentPdf,emailIncident,generateOrderPdf,emailOrder,generateReportPdf,emailReport} from './api.js';
import {sharePdf,openPdf} from './documents.js';
const localDate=value=>{const d=value?new Date(value):new Date();if(Number.isNaN(d.getTime()))return'';const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),n=String(d.getDate()).padStart(2,'0');return`${y}-${m}-${n}`};
const day=()=>localDate();
const latestOrder=()=>Store.list('orders')[0]||null;
const reportSections=()=>({work:document.querySelector('#reportWork')?.checked!==false,incidents:document.querySelector('#reportIncidents')?.checked!==false,orders:document.querySelector('#reportOrders')?.checked===true,stock:document.querySelector('#reportStock')?.checked===true});
const eventPayload=x=>{const d=new Date(x.createdAt);return{id:x.id,fecha:localDate(d),hora:Number.isNaN(d.getTime())?'':d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}),tipo:'INCIDENCIA',zona:x.area,estado:x.status,observacion:x.description,referencia:x.type,cantidad:'',unidad:'',prioridad:x.priority||'Normal',origen:'CEPA_APP'}};
const lifecyclePayload=(x,tipo,estado)=>{const d=new Date();return{id:uid(tipo==='INCIDENCIA_RESUELTA'?'RES':'REA'),fecha:localDate(d),hora:d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}),tipo,zona:x.area,estado,observacion:x.description,referencia:x.id,cantidad:'',unidad:'',prioridad:x.priority||'Normal',origen:'CEPA_APP'}};
function order(){const x=latestOrder();if(!x)throw new Error('Primero crea un pedido.');return x}
function fail(e){if(e?.name!=='AbortError')alert(e?.message||'No se pudo completar la operación.')}
async function shareText(title,text){if(navigator.share){await navigator.share({title,text});return}window.open(`https://wa.me/?text=${encodeURIComponent(`${title}\n\n${text}`)}`,'_blank')}
const incidentText=x=>`PARTE DE INCIDENCIA · CEPA Altomira\nZona: ${x.area||'-'}\nTipo: ${x.type||'-'}\nPrioridad: ${x.priority||'Normal'}\nEstado: ${x.status||'Abierta'}\nDescripción: ${x.description||'-'}`;
const orderText=x=>`PEDIDO · CEPA Altomira\n${x.display||x.reference||''}\nProveedor: ${x.supplier||'-'}\n${x.items||''}\n${x.notes||''}`;
const reportText=()=>`INFORME OPERATIVO · CEPA Altomira\n${document.querySelector('#reportPreview')?.innerText?.trim()||'Informe del día '+day()}`;
async function changeIncident(id,mode){
  const x=Store.list('incidents').find(v=>v.id===id);if(!x)return;
  if(mode==='check'){
    const resolving=x.status!=='Resuelta',stamp=new Date().toISOString(),n={...x,status:resolving?'Resuelta':'Abierta',resolvedAt:resolving?stamp:null,reopenedAt:resolving?x.reopenedAt:stamp};
    await updateEvent(eventPayload(n));
    try{await createEvent(lifecyclePayload(n,resolving?'INCIDENCIA_RESUELTA':'INCIDENCIA_REABIERTA',n.status))}
    catch(e){try{await updateEvent(eventPayload(x))}catch{throw new Error('Google ha cambiado la incidencia pero no ha podido completar ni revertir el movimiento. No continúes con esta incidencia hasta revisar Google.')}throw e}
    Store.update('incidents',id,n);
  }else if(mode==='edit'){
    const area=prompt('Zona:',x.area);if(area===null)return;const type=prompt('Tipo:',x.type);if(type===null)return;const priority=prompt('Prioridad:',x.priority);if(priority===null)return;const description=prompt('Descripción:',x.description);if(description===null)return;const n={...x,area:area.trim(),type:type.trim(),priority:priority.trim(),description:description.trim()};await updateEvent(eventPayload(n));Store.update('incidents',id,n);
  }else if(mode==='delete'){
    if(!confirm('¿Eliminar esta incidencia también de Google?'))return;
    const photos=Store.list('evidence').filter(e=>e.contextId===id);
    for(const ev of photos){await deleteEvidence(ev.id,localDate(ev.createdAt));Store.remove('evidence',ev.id)}
    await deleteEvent(id,localDate(x.createdAt));
    Store.remove('incidents',id);
  }
  document.dispatchEvent(new CustomEvent('cepa:data-changed'));
}
async function orderPdf(){return generateOrderPdf(order().id)}
async function reportPdf(){return generateReportPdf(day(),reportSections())}
document.querySelector('#printOrder')?.addEventListener('click',async()=>{try{openPdf(await orderPdf())}catch(e){fail(e)}});
document.querySelector('#shareWa')?.addEventListener('click',async()=>{try{await sharePdf(await orderPdf(),'CEPA Altomira · Pedido')}catch(e){try{await shareText('CEPA Altomira · Pedido',orderText(order()))}catch(err){fail(err)}}});
document.querySelector('#shareMail')?.addEventListener('click',async()=>{try{const r=await emailOrder(order().id);alert(`Pedido enviado por correo a ${r.recipient}.`)}catch(e){fail(e)}});
document.querySelector('#printReport')?.addEventListener('click',async()=>{try{openPdf(await reportPdf())}catch(e){fail(e)}});
document.querySelector('#shareReportWa')?.addEventListener('click',async()=>{try{await sharePdf(await reportPdf(),'CEPA Altomira · Informe operativo')}catch(e){try{await shareText('CEPA Altomira · Informe operativo',reportText())}catch(err){fail(err)}}});
document.querySelector('#shareReportMail')?.addEventListener('click',async()=>{try{const r=await emailReport(day(),'',reportSections());alert(`Informe enviado por correo a ${r.recipient}.`)}catch(e){fail(e)}});
document.querySelector('#sendReportMail')?.addEventListener('click',async()=>{try{const r=await emailReport(day(),'',reportSections());alert(`Informe enviado por correo a ${r.recipient}.`)}catch(e){fail(e)}});
document.addEventListener('click',async e=>{const b=e.target.closest('[data-inc-check],[data-inc-edit],[data-inc-delete],[data-inc-pdf],[data-inc-wa],[data-inc-mail]');if(!b)return;try{if(b.dataset.incCheck)await changeIncident(b.dataset.incCheck,'check');else if(b.dataset.incEdit)await changeIncident(b.dataset.incEdit,'edit');else if(b.dataset.incDelete)await changeIncident(b.dataset.incDelete,'delete');else if(b.dataset.incPdf)openPdf(await generateIncidentPdf(b.dataset.incPdf));else if(b.dataset.incWa){const id=b.dataset.incWa,x=Store.list('incidents').find(v=>v.id===id);try{await sharePdf(await generateIncidentPdf(id),'CEPA Altomira · Parte de incidencia')}catch(e){if(x)await shareText('CEPA Altomira · Parte de incidencia',incidentText(x));else throw e}}else if(b.dataset.incMail){const r=await emailIncident(b.dataset.incMail);alert(`Parte enviado por correo a ${r.recipient}.`)}}catch(err){fail(err)}});