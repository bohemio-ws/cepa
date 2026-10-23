import {CONFIG} from './config.js';
const SESSION_KEY='cepa_google_credential';

function decodeJwt(token){
  try{
    const part=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
    return JSON.parse(decodeURIComponent(atob(part).split('').map(c=>'%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join('')));
  }catch{return null;}
}
function validCredential(token){
  const p=decodeJwt(token);if(!p)return false;
  const now=Math.floor(Date.now()/1000);
  return p.aud===CONFIG.oauthClientId&&String(p.email||'').toLowerCase()===CONFIG.authorizedEmail.toLowerCase()&&(p.email_verified===true||p.email_verified==='true')&&Number(p.exp)>now+30;
}
function readCredential(){
  const token=localStorage.getItem(SESSION_KEY)||sessionStorage.getItem(SESSION_KEY)||'';
  if(validCredential(token)){
    localStorage.setItem(SESSION_KEY,token);
    sessionStorage.removeItem(SESSION_KEY);
    return token;
  }
  localStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(SESSION_KEY);return'';
}
function loadGoogleIdentity(){
  if(window.google?.accounts?.id)return Promise.resolve();
  return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.defer=true;s.onload=resolve;s.onerror=()=>reject(new Error('No se pudo cargar el acceso seguro de Google.'));document.head.appendChild(s)});
}
function loginScreen(message='Acceso exclusivo para Helena Buitrago Vara'){
  document.body.innerHTML=`<main style="min-height:100vh;display:grid;place-items:center;background:#f7f3f2;font-family:Arial,sans-serif;padding:24px"><section style="width:min(440px,100%);background:#fff;border-radius:20px;padding:30px;box-shadow:0 12px 36px #57271920;text-align:center"><div style="font-size:12px;letter-spacing:.12em;font-weight:700;color:#963b27">AYUNTAMIENTO DE TARANCÓN</div><h1 style="margin:10px 0 4px;color:#2b2525">CEPA Altomira</h1><p style="margin:0 0 22px;color:#6b6060">Control operativo municipal</p><div style="border-top:3px solid #963b27;padding-top:22px"><h2 style="font-size:18px;margin:0 0 8px">Acceso protegido</h2><p id="auth-message" style="font-size:14px;line-height:1.5;color:#625858">${message}</p><div id="google-login" style="display:flex;justify-content:center;margin-top:18px"></div></div></section></main>`;
}
export function getCredential(){return readCredential()}
export function logout(){localStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(SESSION_KEY);try{google.accounts.id.disableAutoSelect()}catch{}location.reload()}
export async function requireAuth(){
  const existing=getCredential();if(existing)return existing;
  loginScreen();await loadGoogleIdentity();
  return new Promise(resolve=>{google.accounts.id.initialize({client_id:CONFIG.oauthClientId,auto_select:true,cancel_on_tap_outside:false,callback:response=>{if(validCredential(response.credential)){localStorage.setItem(SESSION_KEY,response.credential);sessionStorage.removeItem(SESSION_KEY);resolve(response.credential);location.reload();return}localStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(SESSION_KEY);const m=document.getElementById('auth-message');if(m)m.textContent='Cuenta no autorizada. Esta aplicación está reservada a Helena Buitrago Vara.'}});google.accounts.id.renderButton(document.getElementById('google-login'),{theme:'outline',size:'large',text:'signin_with',shape:'pill'});google.accounts.id.prompt()});
}
