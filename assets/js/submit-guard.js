// Protección de producción contra dobles pulsaciones / dobles envíos accidentales.
const LOCK_MS=2500;
const locks=new WeakMap();
function lock(el){
  if(!el||locks.has(el))return false;
  locks.set(el,true);
  const wasDisabled=el.disabled;
  el.disabled=true;
  el.setAttribute('aria-busy','true');
  setTimeout(()=>{
    locks.delete(el);
    el.disabled=wasDisabled;
    el.removeAttribute('aria-busy');
  },LOCK_MS);
  return true;
}

document.addEventListener('submit',event=>{
  const form=event.target;
  if(!(form instanceof HTMLFormElement))return;
  const submit=form.querySelector('button[type="submit"],button:not([type]),input[type="submit"]');
  if(submit&&!lock(submit)){
    event.preventDefault();
    event.stopImmediatePropagation();
  }
},true);

document.addEventListener('click',event=>{
  const button=event.target.closest('[data-save-room],#generalSave,#printReport,#shareReportWa,#shareReportMail,#printOrder,#shareWa,#shareMail');
  if(!button)return;
  if(!lock(button)){
    event.preventDefault();
    event.stopImmediatePropagation();
  }
},true);
