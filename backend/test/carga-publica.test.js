import test from 'node:test';
import assert from 'node:assert/strict';
import { prepararCarga, huellaCarga, vistaPrevia, ejecutarCarga } from '../src/carga-publica.js';
// Fixture estable: el archivo editable del usuario ya contiene cambios reales.
const plantilla={version:1,iglesias:['catedral','tercera-orden','santa-lucia','santa-ana'].map(slug=>({
  slug,informacion:{},materiales:[],horarios:[],tramites:[],
}))};
const id='20000000-0000-4000-8000-000000000003';
const copia=()=>structuredClone(plantilla);
function clientePrueba({privado=false}={}) {
  const iglesias=plantilla.iglesias.map((i,n)=>({id:`00000000-0000-4000-8000-00000000000${n+1}`,slug:i.slug,nombre:'Ejemplo de prueba',historia:'Ejemplo anterior'}));
  let estado={iglesias,materiales:[{id,iglesia_id:iglesias[0].id,titulo:'Ejemplo anterior',visibilidad:privado?'privado':'publico',categoria_id:'libros-documentos',tipo:'libro'}],horarios:[],tramites:[]},backup;
  const consultas=[];
  return {consultas,get estado(){return estado;},query:async(sql,p=[])=>{
    consultas.push({sql,p});
    if(sql.startsWith('BEGIN')){backup=structuredClone(estado);return {rows:[]};}
    if(sql==='ROLLBACK'){estado=backup;return {rows:[]};}
    if(sql==='COMMIT')return {rows:[]};
    if(sql.startsWith('SELECT id,slug FROM public.iglesias'))return {rows:estado.iglesias.map(({id,slug})=>({id,slug}))};
    const tabla=sql.match(/(?:FROM|UPDATE) public\.(\w+)/)?.[1];
    if(sql.startsWith('SELECT'))return {rows:estado[tabla].filter(r=>r[tabla==='tramites'?'tipo':'id']===p[0]&&(p.length===1||r.iglesia_id===p[1])).map(r=>({...r}))};
    if(sql.startsWith('UPDATE')) {
      const campos=sql.match(/ SET (.*?) WHERE/)[1].split(',').map(c=>c.split('=')[0]);
      const row=estado[tabla].find(r=>r[tabla==='tramites'?'tipo':'id']===p[campos.length]&&(tabla==='iglesias'||r.iglesia_id===p[campos.length+1]));
      if(row)campos.forEach((c,n)=>{row[c]=p[n];});
      return {rows:[],rowCount:row?1:0};
    }
    throw new Error('SQL no previsto en prueba');
  }};
}
function loteMaterial(patch={titulo:'Ejemplo actualizado'}) {const d=copia();d.iglesias[0].materiales=[{id,cambios:patch}];return d;}
test('plantilla sin datos nuevos produce vista previa vacía sin conexión',()=>{
  const ops=prepararCarga(copia());assert.equal(ops.length,0);
  const preview=vistaPrevia(ops,huellaCarga('prueba'));
  assert.equal(preview.registros_propuestos,0);assert.equal(preview.iglesias.length,0);
});
test('rechaza slugs/UUID duplicados, entradas inválidas y campos ajenos al contenido público',()=>{
  for(const cambiar of [
    d=>{d.iglesias[1].slug='catedral';},
    d=>{d.iglesias[0].informacion={auth_user_id:'identidad'};},
    d=>{d.iglesias[0].informacion={latitud:91};},
    d=>{d.iglesias[0].informacion={telefono:123};},
    d=>{d.iglesias[0].horarios=[{id,cambios:{hora:'24:00'}}];},
    d=>{d.iglesias[0].materiales=[{id:'invalido',cambios:{titulo:'Ejemplo'}}];},
    d=>{d.iglesias[0].tramites=[{tipo:'otros',cambios:{requisitos:[null]}}];},
  ]) {const d=copia();cambiar(d);assert.throws(()=>prepararCarga(d));}
  const duplicado=loteMaterial();duplicado.iglesias[1].materiales=structuredClone(duplicado.iglesias[0].materiales);
  assert.throws(()=>prepararCarga(duplicado),{codigo:'REGISTRO_DUPLICADO'});
  for(const campo of ['descripcion_interna','visibilidad','documentos','paginas','iglesia_id'])assert.throws(()=>prepararCarga(loteMaterial({[campo]:'no permitido'})),{codigo:'CAMPO_NO_ADMITIDO'});
});
test('no promueve ejemplos a verificados y rechaza referencias de archivos/documentos',()=>{
  assert.throws(()=>prepararCarga(loteMaterial({es_ejemplo:false})),{codigo:'PROMOCION_NO_PERMITIDA'});
  const d=copia();d.iglesias[0].tramites=[{tipo:'otros',cambios:{estado_verificacion:'verificado'}}];
  assert.throws(()=>prepararCarga(d),{codigo:'PROMOCION_NO_PERMITIDA'});
  for(const imagen_publica of ['data:image/png;base64,...','/api/admin/materiales/privado','https://example.invalid/archivo.pdf','https://usuario:clave@example.invalid/foto.jpg']) {
    assert.throws(()=>prepararCarga(loteMaterial({imagen_publica})),{codigo:'IMAGEN_NO_ADMITIDA'});
  }
});
test('comparación usa transacción de solo lectura y devuelve diferencias sin UPDATE',async()=>{
  const cliente=clientePrueba(),ops=prepararCarga(loteMaterial());
  const resultado=await ejecutarCarga(cliente,ops);
  assert.equal(resultado.registros_modificados,0);assert.equal(resultado.cambios[0].antes.titulo,'Ejemplo anterior');
  assert.ok(cliente.consultas[0].sql.endsWith('READ ONLY'));
  assert.equal(cliente.consultas.at(-1).sql,'ROLLBACK');
  assert.ok(!cliente.consultas.some(c=>c.sql.startsWith('UPDATE')));
});
test('actualiza con parámetros, mantiene UUID/iglesia y repetir el lote no vuelve a modificar',async()=>{
  const cliente=clientePrueba(),titulo="Ejemplo ' ; DROP TABLE auth_user; --",ops=prepararCarga(loteMaterial({titulo}));
  const primera=await ejecutarCarga(cliente,ops,{aplicar:true});assert.equal(primera.registros_modificados,1);
  const update=cliente.consultas.find(c=>c.sql.startsWith('UPDATE'));
  assert.ok(!update.sql.includes(titulo));assert.equal(update.p[0],titulo);
  assert.equal(cliente.estado.materiales[0].id,id);
  const segunda=await ejecutarCarga(cliente,ops,{aplicar:true});assert.equal(segunda.registros_modificados,0);
  assert.ok(cliente.consultas.every(c=>!/^\s*(INSERT|DELETE|ALTER|CREATE|GRANT|REVOKE)/i.test(c.sql)));
  assert.ok(cliente.consultas.every(c=>!/(public\.(auth_|administrador|documentos|paginas)|descripcion_interna)/.test(c.sql)));
});
test('un material privado aborta todo el lote y revierte cambios anteriores',async()=>{
  const cliente=clientePrueba({privado:true}),datos=loteMaterial();datos.iglesias[0].informacion={historia:'Ejemplo nuevo'};
  await assert.rejects(ejecutarCarga(cliente,prepararCarga(datos),{aplicar:true}),{codigo:'MATERIAL_PRIVADO_PROTEGIDO'});
  assert.equal(cliente.estado.iglesias[0].historia,'Ejemplo anterior');assert.equal(cliente.estado.materiales[0].visibilidad,'privado');
  assert.equal(cliente.consultas.at(-1).sql,'ROLLBACK');
});
test('rechaza referencia de otra iglesia o inexistente sin crear registros',async()=>{
  const cliente=clientePrueba(),d=copia();d.iglesias[1].materiales=[{id,cambios:{titulo:'Ejemplo'}}];
  await assert.rejects(ejecutarCarga(cliente,prepararCarga(d),{aplicar:true}),{codigo:'REGISTRO_NO_EXISTE_EN_IGLESIA'});
  assert.equal(cliente.estado.materiales.length,1);
});
test('categoría parcial incompatible y error SQL causan rollback con diagnóstico cerrado',async()=>{
  const cliente=clientePrueba();
  await assert.rejects(ejecutarCarga(cliente,prepararCarga(loteMaterial({categoria_id:'objetos'})),{aplicar:true}),{codigo:'CATEGORIA_INCOMPATIBLE'});
  let revertido=false;
  const roto={query:async sql=>{if(sql==='ROLLBACK'){revertido=true;return{};}if(sql.startsWith('BEGIN'))return{};throw Object.assign(new Error('datos que no se deben mostrar'),{code:'42501'});}};
  await assert.rejects(ejecutarCarga(roto,[],{aplicar:true}),e=>e.codigo==='42501'&&!e.message.includes('datos que'));
  assert.equal(revertido,true);
});
