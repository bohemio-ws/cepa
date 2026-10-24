export const CONFIG = Object.freeze({
  appName:'CEPA Altomira', city:'Tarancón', worker:'Helena Buitrago Vara', version:'3.3.1-TEST',
  testMode:true,
  testRecipient:'kennyclm@gmail.com',
  productionRecipient:'rbenavente@tarancon.es',
  reportEndpoint:'https://script.google.com/macros/s/AKfycbxF0R-b3ARABEiaRa5eXNOcKt4FunzsOb_nTljRzKWH0Ipzj7CcNsHpR7VAP9i6fHAW/exec',
  oauthClientId:'172079845887-7uj01u2ptksn62l6cc8bjn1e0qi8akv7.apps.googleusercontent.com',
  authorizedEmail:'helenabuitragoclm@gmail.com',
  storagePrefix:'cepa_v2_', maxPhotoMB:4,
  rooms:[
    ['HALL','Hall Entrada','HALL'],['DESPACHOS','Despachos','DESPACHOS'],['SALA_PROFESORES','Sala Profesores','SALA_PROFESORES'],['AULA_INFORMATICA','Aula Informática','AULA_INFORMATICA'],['BIBLIOTECA','Biblioteca','BIBLIOTECA'],['AULA_10','Aula 10','AULA_10'],
    ['BANO_PROFESORES','Baño Profesores','BAÑO_PROFESORES'],['BANO_ALUMNOS_PB','Baño Alumnos (PB)','BAÑO_ALUMNOS_PB'],['AULA_5_COCINA','Aula 5 - Cocina','AULA_5_COCINA'],['AULA_6','Aula 6','AULA_6'],['AULA_7','Aula 7','AULA_7'],['AULA_8','Aula 8','AULA_8'],['AULA_9','Aula 9','AULA_9'],['BANO_ALUMNOS_1P','Baño Alumnos (1ªP)','BAÑO_ALUMNOS_1P'],
    ['AULA_1','Aula 1','AULA_1'],['AULA_2','Aula 2','AULA_2'],['AULA_3','Aula 3','AULA_3'],['AULA_4','Aula 4','AULA_4'],['CRISTALES_COMUNES','Cristales Zonas Comunes','CRISTALES_COMUNES'],['CRISTALES_AULAS','Cristales Aulas','CRISTALES_AULAS']
  ],
  modules:[
    {id:'trabajo',icon:'✓',title:'Trabajo diario',subtitle:'Checklist y parte de jornada'},
    {id:'historico',icon:'▣',title:'Calendario e informes',subtitle:'Consultar partes anteriores'},
    {id:'evidencias',icon:'▧',title:'Evidencias',subtitle:'Fotos vinculadas al trabajo'},
    {id:'incidencias',icon:'!',title:'Incidencias',subtitle:'Registrar, resolver y documentar'},
    {id:'almacen',icon:'▦',title:'Almacén y stock',subtitle:'Existencias y mínimos'},
    {id:'pedidos',icon:'↗',title:'Pedidos',subtitle:'Generar y compartir documento'},
    {id:'suministros',icon:'◉',title:'Suministros',subtitle:'Gasoil y entradas'},
    {id:'contactos',icon:'☎',title:'Contactos',subtitle:'Agenda de trabajo centralizada'},
    {id:'informes',icon:'▤',title:'Informe actual',subtitle:'Resumen completo de la jornada'}
  ]
});