export function pdfFile(data){
  if(!data?.pdfBase64||!data?.filename)throw new Error('El backend no ha devuelto el PDF.');
  const bytes=Uint8Array.from(atob(data.pdfBase64),c=>c.charCodeAt(0));
  return new File([bytes],data.filename,{type:'application/pdf'});
}
function previewFile(file,data){
  if(data?.pdfUrl){window.open(data.pdfUrl,'_blank');return}
  const url=URL.createObjectURL(file);
  window.open(url,'_blank');
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function shareDialog(file,data,title){
  const old=document.querySelector('#cepaShareDialog');if(old)old.remove();
  const dialog=document.createElement('dialog');dialog.id='cepaShareDialog';
  dialog.style.cssText='max-width:420px;width:calc(100% - 32px);border:0;border-radius:18px;padding:22px;box-shadow:0 18px 60px #0008';
  dialog.innerHTML=`<strong style="display:block;font-size:1.15rem;margin-bottom:8px">Documento preparado</strong><p style="margin:0 0 18px">El PDF está listo. Pulsa <b>Compartir ahora</b> para abrir WhatsApp u otra aplicación.</p><div style="display:grid;gap:10px"><button id="cepaShareNow" class="btn primary" type="button">Compartir ahora</button><button id="cepaPreviewNow" class="btn secondary" type="button">Ver PDF</button><button id="cepaShareCancel" class="btn secondary" type="button">Cancelar</button></div>`;
  document.body.appendChild(dialog);
  dialog.querySelector('#cepaShareNow').onclick=async()=>{
    try{
      if(navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({title,files:[file]});dialog.close();dialog.remove();return}
      previewFile(file,data);dialog.close();dialog.remove();
    }catch(e){if(e?.name!=='AbortError')alert(e?.message||'No se pudo compartir el documento.')}
  };
  dialog.querySelector('#cepaPreviewNow').onclick=()=>previewFile(file,data);
  dialog.querySelector('#cepaShareCancel').onclick=()=>{dialog.close();dialog.remove()};
  dialog.showModal();
}
export async function sharePdf(data,title){
  const file=pdfFile(data);
  shareDialog(file,data,title);
  return true;
}
export function openPdf(data){
  const file=pdfFile(data);
  previewFile(file,data);
}
