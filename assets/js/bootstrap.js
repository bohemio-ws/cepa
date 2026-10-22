import {requireAuth} from './auth.js';

await requireAuth();
await import('./app.js');
await import('./contacts.js');
