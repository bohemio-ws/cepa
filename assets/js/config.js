export const CONFIG = Object.freeze({
  appName:'CEPA Altomira', city:'Tarancón', worker:'Helena', version:'2.1.0',
  reportEndpoint:'https://script.google.com/macros/s/AKfycbxF0R-b3ARABEiaRa5eXNOcKt4FunzsOb_nTljRzKWH0Ipzj7CcNsHpR7VAP9i6fHAW/exec',
  storagePrefix:'cepa_v2_', maxPhotoMB:4,
  rooms:[['HALL','Hall Entrada'],['DESPACHOS','Despachos'],['SALA_PROFESORES','Sala Profesores'],['AULA_INFORMATICA','Aula Informática'],['BIBLIOTECA','Biblioteca'],['AULA_10','Aula 10'],['BANO_PROFESORES','Baño Profesores'],['BANO_ALUMNOS_PB','Baño Alumnos (PB)'],['AULA_5_COCINA','Aula 5 - Cocina'],['AULA_6','Aula 6'],['AULA_7','Aula 7'],['AULA_8','Aula 8'],['AULA_9','Aula 9'],['BANO_ALUMNOS_1P','Baño Alumnos (1ªP)'],['AULA_1','Aula 1'],['AULA_2','Aula 2'],['AULA_3','Aula 3'],['AULA_4','Aula 4'],['CRISTALES_COMUNES','Cristales Zonas Comunes'],['CRISTALES_AULAS','Cristales Aulas']],
  modules:[
    {id:'trabajo',icon:'✓',title:'Trabajo diario',subtitle:'Checklist y parte de jornada'},
    {id:'evidencias',icon:'▣',title:'Evidencias',subtitle:'Fotos vinculadas al trabajo'},
    {id:'incidencias',icon:'!',title:'Incidencias',subtitle:'Registrar y documentar'},
    {id:'almacen',icon:'▦',title:'Almacén y stock',subtitle:'Existencias y mínimos'},
    {id:'pedidos',icon:'↗',title:'Pedidos',subtitle:'WhatsApp o correo'},
    {id:'suministros',icon:'◉',title:'Suministros',subtitle:'Gasoil y entradas'},
    {id:'informes',icon:'▤',title:'Informes',subtitle:'Resumen completo'}
  ]
});