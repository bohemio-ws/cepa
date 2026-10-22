import {Store} from './store.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let current=null;

function ensureDialog(){
  if(document.querySelector('#orderActionDialog')) return;
  document.body.insertAdjacentHTML('beforeend',`<dialog id="orderActionDialog" style="border:0;border-radius:18px;padding:0;max-width:92vw;width:430px;box-shadow:0 20px 60px #0005"><form method="dialog" id="orderActionForm" style="padding:20px;background:#fff"><h3 style="margin-top:0;color:#78301f">Pedido</h3><div id="orderActionView"></div><div id="orderEditFields" hidden><label style="display:block;margin:12px 0 5px;font-weight:700">Proveedor / destinatario</label><input name="supplier" style="width:100%;padding:12px;border:1px solid #d9c7c1;border-radius:10px"><label style="display:block;margin:12px 0 5px;font-weight:700">Productos y cantidades</label><textarea name="items" rows="5" style="width:100%;padding:12px;border:1px solid #d9c7c1;border-radius:10px"></textarea><label style="display:block;margin:12px 0 5px;font-weight:700">Observaciones</label><textarea name="notes" rows="3" style="width:100%;padding:12px;border:1px solid #d9c7c1;border-radius:10px"></textarea></div><div id="orderActionButtons" style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:18px"><button type="button" data-order-action="edit" style="padding:12px;border:0;border-radius:10px;background:#963b27;color:#fff;font-weight:700">Modificar</button><button type="button" data-order-action="delete" style="padding:12px;border:1px solid #b3261e;border-radius:10px;background:#fff;color:#b3261e;font-weight:700">Borrar</button><button type="button" data-order-action="close" style="grid-column:1/-1;padding:12px;border:0;border-radius:10px;background:#eee">Cerrar</button></div><div id="orderEditButtons" hidden style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:18px"><button type="button" data-order-action="save" style="padding:12px;border:0;border-radius:10px;background:#963b27;color:#fff;font-weight:700">Guardar cambios</button><button type="button" data-order-action="cancel" style="padding:12px;border:0;border-radius:10px;background:#eee">Cancelar</button></div></form></dialog>`);
  document.querySelector('#orderActionDialog').addEventListener('click',handleDialogClick);
}

function findFromReport(el){
  const text=(el.textContent||'').trim();
  if(!text.startsWith('Pedido ·')) return null;
  return Store.list('orders').find(o=>text.includes(`Pedido · ${o.supplier}`)&&text.includes(o.items))||null;
}

function findOrderFromClick(target){
  const listItem=target.closest('#orderList .list-item');
  if(listItem){const items=[...document.querySelectorAll('#orderList .list-item')];return Store.list('orders')[items.indexOf(listItem)]||null;}
  const reportLine=target.closest('#reportBody p');
  return reportLine?findFromReport(reportLine):null;
}

function openActions(order){
  current=order; ensureDialog();
  const d=document.querySelector('#orderActionDialog');
  d.querySelector('#orderActionView').innerHTML=`<p><b>${esc(order.supplier)}</b></p><p>${esc(order.items)}</p>${order.notes?`<small>${esc(order.notes)}</small>`:''}`;
  d.querySelector('#orderEditFields').hidden=true;d.querySelector('#orderActionButtons').hidden=false;d.querySelector('#orderEditButtons').hidden=true;
  d.showModal();
}

function startEdit(){
  const d=document.querySelector('#orderActionDialog'),f=d.querySelector('#orderActionForm');
  f.elements.supplier.value=current.supplier||'';f.elements.items.value=current.items||'';f.elements.notes.value=current.notes||'';
  d.querySelector('#orderActionView').hidden=true;d.querySelector('#orderEditFields').hidden=false;d.querySelector('#orderActionButtons').hidden=true;d.querySelector('#orderEditButtons').hidden=false;
}
function refresh(){location.reload();}
function handleDialogClick(e){
  const a=e.target.dataset.orderAction;if(!a)return;
  const d=document.querySelector('#orderActionDialog'),f=d.querySelector('#orderActionForm');
  if(a==='close'){d.close();return}
  if(a==='edit'){startEdit();return}
  if(a==='cancel'){d.close();return}
  if(a==='save'){
    const supplier=f.elements.supplier.value.trim(),items=f.elements.items.value.trim(),notes=f.elements.notes.value.trim();
    if(!supplier||!items){alert('Proveedor y productos son obligatorios.');return}
    Store.update('orders',current.id,{supplier,items,notes});d.close();refresh();return;
  }
  if(a==='delete'){
    if(!confirm(`¿Borrar definitivamente el pedido de ${current.supplier}?`))return;
    Store.remove('orders',current.id);Store.replace('evidence',Store.list('evidence').filter(x=>!(x.contextType==='order'&&x.contextId===current.id)));d.close();refresh();
  }
}

document.addEventListener('click',e=>{const order=findOrderFromClick(e.target);if(order){e.preventDefault();openActions(order)}});

const observer=new MutationObserver(()=>{
  document.querySelectorAll('#orderList .list-item').forEach(el=>{el.style.cursor='pointer';el.title='Pulsa para modificar o borrar';});
  document.querySelectorAll('#reportBody p').forEach(el=>{if((el.textContent||'').trim().startsWith('Pedido ·')){el.style.cursor='pointer';el.title='Pulsa para modificar o borrar';}});
});
observer.observe(document.documentElement,{subtree:true,childList:true});
