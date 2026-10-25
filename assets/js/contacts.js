import {getContacts,createContact,updateContact,deactivateContact} from './api.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const phone=s=>String(s||'').replace(/[^+\d]/g,'');
const normalize=c=>({id:c.id??c.ID??'',name:c.name??c.Nombre??c.nombre??'',role:c.role??c.Cargo??c.cargo??'',department:c.department??c.Departamento??c.departamento??'',email:c.email??c.Email??c.Correo??'',phone:c.phone??c.Telefono??c.Teléfono??c.telefono??'',whatsapp:c.whatsapp??c.WhatsApp??c.phone??c.Telefono??c.telefono??'',notes:c.notes??c.Notas??c.notas??''});
let contacts=[];

function ensureView(){
 if(document.querySelector('#view-contactos'))return;
 const main=document.querySelector('main.shell');if(!main)return;
 const section=document.createElement('section');section.id='view-contactos';section.className='view';
 section.innerHTML=`<div class="view-head"><button class="back" type="button">←</button><h2>Contactos</h2></div>
 <div class="panel"><button id="newContact" class="btn primary" type="button">+ Nuevo contacto</button><div class="field"><label>Buscar contacto</label><input id="contactSearch" type="search" autocomplete="off" placeholder="Nombre, cargo o departamento"></div><div id="contactStatus" class="status"></div></div>
 <div class="panel" id="contactList"><small>Cargando agenda…</small></div>`;
 main.appendChild(section);
 section.querySelector('.back').onclick=()=>{document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.querySelector('#view-home')?.classList.add('active');scrollTo(0,0)};
 section.querySelector('#contactSearch').addEventListener('input',render);
 section.querySelector('#newContact').onclick=()=>editContact(null);
}
function payload(c){return{id:c.id||'',name:c.name,role:c.role,department:c.department,email:c.email,phone:c.phone,whatsapp:c.whatsapp,notes:c.notes};}
async function reload(message=''){const status=document.querySelector('#contactStatus');try{if(status)status.textContent=message||'Actualizando agenda central…';const data=await getContacts();contacts=(Array.isArray(data.items)?data.items:[]).map(normalize);render();if(status)status.textContent=`${contacts.length} contacto${contacts.length===1?'':'s'} disponible${contacts.length===1?'':'s'}. Datos sincronizados con Google.`}catch(e){if(status)status.textContent=e.message||'No se pudo cargar la agenda.'}}
async function editContact(existing){
 const c=existing?{...existing}:{id:'',name:'',role:'',department:'',email:'',phone:'',whatsapp:'',notes:''};
 const name=prompt('Nombre y apellidos:',c.name);if(name===null)return;
 const role=prompt('Cargo:',c.role);if(role===null)return;
 const department=prompt('Departamento:',c.department);if(department===null)return;
 const phoneValue=prompt('Teléfono:',c.phone);if(phoneValue===null)return;
 const email=prompt('Correo electrónico:',c.email);if(email===null)return;
 const whatsapp=prompt('WhatsApp (vacío = mismo teléfono):',c.whatsapp||c.phone);if(whatsapp===null)return;
 const notes=prompt('Notas:',c.notes);if(notes===null)return;
 const n={...c,name:name.trim(),role:role.trim(),department:department.trim(),phone:phoneValue.trim(),email:email.trim(),whatsapp:(whatsapp.trim()||phoneValue.trim()),notes:notes.trim()};
 if(!n.name){alert('El nombre es obligatorio.');return}
 try{existing?await updateContact(payload(n)):await createContact(payload(n));await reload('Comprobando el contacto en Google…')}catch(e){alert(e.message||'Google no ha podido guardar el contacto.')}
}
async function removeContact(c){if(!c.id||!confirm(`¿Eliminar ${c.name} también de Google?`))return;try{await deactivateContact(c.id);await reload('Comprobando la eliminación en Google…')}catch(e){alert(e.message||'Google no ha podido eliminar el contacto.')}}
function render(){
 const box=document.querySelector('#contactList'),q=(document.querySelector('#contactSearch')?.value||'').trim().toLowerCase();if(!box)return;
 const list=contacts.filter(c=>!q||[c.name,c.role,c.department,c.email,c.phone].some(v=>String(v||'').toLowerCase().includes(q)));
 box.innerHTML=list.length?list.map(c=>{const tel=phone(c.phone),wa=phone(c.whatsapp||c.phone);return `<article class="list-item" data-contact-id="${esc(c.id)}"><strong>${esc(c.name)}</strong><small>${esc([c.role,c.department].filter(Boolean).join(' · '))}</small>${c.notes?`<div>${esc(c.notes)}</div>`:''}<div class="actions">${tel?`<a class="btn secondary" href="tel:${esc(tel)}">Llamar</a>`:''}${c.email?`<a class="btn secondary" href="mailto:${esc(c.email)}">Correo</a>`:''}${wa?`<a class="btn secondary" href="https://wa.me/${esc(wa.replace(/^\+/,''))}" target="_blank" rel="noopener">WhatsApp</a>`:''}<button type="button" data-contact-edit="${esc(c.id)}">Modificar</button><button type="button" data-contact-delete="${esc(c.id)}">Eliminar</button></div></article>`}).join(''):'<small>No hay contactos que coincidan.</small>';
}
ensureView();
document.addEventListener('click',e=>{const open=e.target.closest('[data-open="contactos"]');if(open)setTimeout(()=>reload(),0);const eb=e.target.closest('[data-contact-edit]');if(eb){const c=contacts.find(x=>String(x.id)===eb.dataset.contactEdit);if(c)editContact(c)}const db=e.target.closest('[data-contact-delete]');if(db){const c=contacts.find(x=>String(x.id)===db.dataset.contactDelete);if(c)removeContact(c)}},true);
