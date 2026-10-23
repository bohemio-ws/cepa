import {getContacts} from './api.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const phone=s=>String(s||'').replace(/[^+\d]/g,'');
const normalize=c=>({
  id:c.id||'',
  name:c.name??c.nombre??'',
  role:c.role??c.cargo??'',
  department:c.department??c.departamento??'',
  email:c.email??'',
  phone:c.phone??c.telefono??'',
  whatsapp:c.whatsapp??c.phone??c.telefono??'',
  notes:c.notes??c.notas??''
});
let contacts=[];

function ensureView(){
  if(document.querySelector('#view-contactos'))return;
  const main=document.querySelector('main.shell');
  if(!main)return;
  const section=document.createElement('section');section.id='view-contactos';section.className='view';
  section.innerHTML=`<div class="view-head"><button class="back" type="button">←</button><h2>Contactos</h2></div><div class="panel"><div class="field"><label>Buscar contacto</label><input id="contactSearch" type="search" autocomplete="off" placeholder="Nombre, cargo o departamento"></div><div id="contactStatus" class="status"></div></div><div class="panel" id="contactList"><small>Cargando agenda…</small></div>`;
  main.appendChild(section);
  section.querySelector('.back').onclick=()=>{document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.querySelector('#view-home')?.classList.add('active');scrollTo(0,0)};
  section.querySelector('#contactSearch').addEventListener('input',render);
}
function render(){
  const box=document.querySelector('#contactList'),q=(document.querySelector('#contactSearch')?.value||'').trim().toLowerCase();if(!box)return;
  const list=contacts.filter(c=>!q||[c.name,c.role,c.department,c.email,c.phone].some(v=>String(v||'').toLowerCase().includes(q)));
  box.innerHTML=list.length?list.map(c=>{const tel=phone(c.phone),wa=phone(c.whatsapp||c.phone);return `<article class="list-item"><strong>${esc(c.name)}</strong><small>${esc(c.role||c.department||'')}</small>${c.notes?`<div>${esc(c.notes)}</div>`:''}<div class="actions" style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">${tel?`<a class="btn secondary" href="tel:${esc(tel)}">Llamar</a>`:''}${c.email?`<a class="btn secondary" href="mailto:${esc(c.email)}">Correo</a>`:''}${wa?`<a class="btn secondary" href="https://wa.me/${esc(wa.replace(/^\+/,''))}" target="_blank" rel="noopener">WhatsApp</a>`:''}</div></article>`}).join(''):'<small>No hay contactos que coincidan.</small>';
}
async function load(){ensureView();const status=document.querySelector('#contactStatus');try{if(status)status.textContent='Actualizando agenda central…';const data=await getContacts();contacts=(Array.isArray(data.items)?data.items:[]).map(normalize);render();if(status)status.textContent=`${contacts.length} contacto${contacts.length===1?'':'s'} disponible${contacts.length===1?'':'s'}.`;}catch(e){if(status)status.textContent=e.message||'No se pudo cargar la agenda.'}}

ensureView();
document.addEventListener('click',e=>{const b=e.target.closest('[data-open="contactos"]');if(b)setTimeout(load,0)},true);
