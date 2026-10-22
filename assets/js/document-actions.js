import {Store} from './store.js';
import {orderDocument,reportDocument,openPrintable,shareDocument,shareWhatsApp,shareMail,safeName} from './documents.js';

const $=s=>document.querySelector(s);
const latestOrder=()=>Store.list('orders')[0]||null;
const day=()=>new Date().toISOString().slice(0,10);

function orderData(){const order=latestOrder();if(!order)throw new Error('Primero crea un pedido.');return{order,html:orderDocument(order),name:safeName('Pedido',order.id)}}
function reportData(){const body=$('#reportBody')||$('#reportPreview');if(!body)throw new Error('No se encuentra el informe.');return{html:reportDocument(body.innerHTML),name:safeName('Informe_CEPA',day())}}
function fail(e){if(e?.name!=='AbortError')alert(e?.message||'No se pudo generar el documento.')}

$('#printOrder')?.addEventListener('click',()=>{try{openPrintable(orderData().html).print()}catch(e){fail(e)}});
$('#shareWa')?.addEventListener('click',async()=>{try{const d=orderData();await shareWhatsApp(d.html,d.name,`CEPA Altomira · Pedido ${d.order.id}`)}catch(e){fail(e)}});
$('#shareMail')?.addEventListener('click',async()=>{try{const d=orderData();await shareMail(d.html,d.name,`CEPA Altomira · Pedido ${d.order.id}`)}catch(e){fail(e)}});
$('#printReport')?.addEventListener('click',()=>{try{openPrintable(reportData().html).print()}catch(e){fail(e)}});
$('#shareReport')?.addEventListener('click',async()=>{try{const d=reportData();await shareDocument(d.html,d.name,'CEPA Altomira · Informe operativo')}catch(e){fail(e)}});
