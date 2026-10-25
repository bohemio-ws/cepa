export function pdfFile(data){
  if(!data?.pdfBase64||!data?.filename)throw new Error('El backend no ha devuelto el PDF.');
  const bytes=Uint8Array.from(atob(data.pdfBase64),c=>c.charCodeAt(0));
  return new File([bytes],data.filename,{type:'application/pdf'});
}
function openFallback(data,file){
  if(data?.pdfUrl){window.open(data.pdfUrl,'_blank');return false}
  const url=URL.createObjectURL(file);
  window.open(url,'_blank');
  setTimeout(()=>URL.revokeObjectURL(url),60000);
  return false;
}
export async function sharePdf(data,title){
  const file=pdfFile(data);
  if(navigator.share&&navigator.canShare?.({files:[file]})){
    try{
      await navigator.share({title,files:[file]});
      return true;
    }catch(e){
      if(e?.name==='AbortError')return false;
      if(e?.name!=='NotAllowedError'&&e?.name!=='SecurityError')throw e;
    }
  }
  return openFallback(data,file);
}
export function openPdf(data){
  if(data?.pdfUrl){window.open(data.pdfUrl,'_blank');return}
  const file=pdfFile(data),url=URL.createObjectURL(file);
  window.open(url,'_blank');
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
