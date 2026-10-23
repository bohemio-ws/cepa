export function pdfFile(data){
  if(!data?.pdfBase64||!data?.filename)throw new Error('El backend no ha devuelto el PDF.');
  const bytes=Uint8Array.from(atob(data.pdfBase64),c=>c.charCodeAt(0));
  return new File([bytes],data.filename,{type:'application/pdf'});
}
export async function sharePdf(data,title){
  const file=pdfFile(data);
  if(navigator.canShare?.({files:[file]})&&navigator.share){await navigator.share({title,files:[file]});return true}
  if(data.pdfUrl){window.open(data.pdfUrl,'_blank');return false}
  throw new Error('Este dispositivo no permite compartir el PDF.');
}
export function openPdf(data){
  if(!data?.pdfUrl)throw new Error('El backend no ha devuelto la dirección del PDF.');
  window.open(data.pdfUrl,'_blank');
}
