import test from 'node:test';
import assert from 'node:assert/strict';
import lote from '../data/objetos-museo.json' with {type:'json'};
import libros from '../data/cuadernos-informativos.json' with {type:'json'};
import { prepararObjetos,revisarRecursosObjetos,cargarObjetos,muestrasObjetos } from '../src/carga-objetos.js';
import { prepararCuadernos,cargarCuadernos,idCuaderno } from '../src/carga-cuadernos.js';
import { crearLecturas } from '../src/lecturas.js';
import { memoriaCuadernos } from './fixtures/cuadernos.js';
const objetos=prepararObjetos(lote);
async function base() {
  const db=memoriaCuadernos();
  for(const s of muestrasObjetos())db.estado.materiales.find(m=>m.id===s.id).descripcion_publica='Historia de demostración de este objeto ficticio. No representa una pieza ni información histórica real.';
  await cargarCuadernos(db,prepararCuadernos(libros),{aplicar:true});db.llamadas.splice(0);return db;
}
test('diez claves estables, texto/fuentes íntegros, diez imágenes y créditos coincidentes',async()=>{
  assert.equal(new Set(objetos.map(o=>o.id)).size,10);
  assert.deepEqual(objetos.map(({id,...o})=>o),lote.objetos);
  assert.deepEqual(prepararObjetos(structuredClone(lote)),objetos);
  assert.equal(idCuaderno('catedral'),'ab6d29dd-a307-88f6-ab6b-dcf7d4f18c43');
  assert.equal((await revisarRecursosObjetos(objetos,new URL('../../frontend/public',import.meta.url).pathname)).length,10);
});
test('rechaza claves duplicadas, slugs cruzados, tipo/documento, flag y créditos sin fuente',()=>{
  for(const mutar of [x=>x.objetos[1].clave=x.objetos[0].clave,x=>x.objetos[0].slug_iglesia='santa-ana',
    x=>x.objetos[0].tipo='documento',x=>x.objetos[0].es_ejemplo=true,x=>x.objetos[0].imagen_publica='/imagenes/../x.pdf',
    x=>x.objetos[0].fuente='Sin crédito',x=>x.objetos[0].creditos_imagen.enlace_original='https://otro.invalid/archivo']) {
    const x=structuredClone(lote);mutar(x);assert.throws(()=>prepararObjetos(x));
  }
});
test('compara sin escribir, carga solo materiales y ocho retiradas, repite sin duplicar ni escribir',async()=>{
  const db=await base(),antes=structuredClone(db.estado);
  const comparar=await cargarObjetos(db,objetos);assert.equal(comparar.cambios.length,10);assert.equal(comparar.retiradas.length,8);
  assert.deepEqual(db.estado,antes);assert.ok(db.llamadas.every(c=>!/^\s*(INSERT|UPDATE|DELETE)/.test(c.sql)));
  await cargarObjetos(db,objetos,{aplicar:true});
  assert.equal(db.estado.materiales.length,54);assert.deepEqual(db.estado.documentos,antes.documentos);assert.deepEqual(db.estado.paginas,antes.paginas);
  const retirados=new Set(muestrasObjetos().map(s=>s.id));
  for(const m of antes.materiales)assert.deepEqual(db.estado.materiales.find(a=>a.id===m.id),retirados.has(m.id)?{...m,retirado_publico:true}:m);
  const n=db.llamadas.length,r=await cargarObjetos(db,objetos,{aplicar:true});
  assert.ok(r.cambios.every(c=>c.accion==='sin_cambios'));assert.equal(r.retiradas.length,0);
  assert.ok(db.llamadas.slice(n).every(c=>!/^\s*(INSERT|UPDATE|DELETE)/.test(c.sql)));
});
test('muestra editada causa rollback incluso después de altas; privado y cuadernos intactos',async()=>{
  const db=await base();db.estado.materiales.find(m=>m.id===muestrasObjetos()[0].id).titulo='Modificado por el operador';
  const antes=structuredClone(db.estado);
  await assert.rejects(cargarObjetos(db,objetos,{aplicar:true}),e=>e.codigo==='MUESTRA_MODIFICADA_CONFLICTO');
  assert.deepEqual(db.estado,antes);assert.equal(db.llamadas.at(-1).sql,'ROLLBACK');
});
test('colisión con privado/otra iglesia u objeto con documento aborta sin sobrescritura',async()=>{
  for(const caso of ['privado','iglesia','documento']) {
    const db=await base();const o=objetos[1];
    db.estado.materiales.push({id:o.id,iglesia_id:db.iglesias[caso==='iglesia'?1:0].id,tipo:'objeto',categoria_id:'objetos',visibilidad:caso==='privado'?'privado':'publico',es_ejemplo:false,retirado_publico:false});
    if(caso==='documento')db.estado.documentos.push({material_id:o.id,titulo:'Documento ajeno',es_ejemplo:false});
    const antes=structuredClone(db.estado);
    await assert.rejects(cargarObjetos(db,objetos,{aplicar:true}));assert.deepEqual(db.estado,antes);
  }
});
test('proyección pública: distribución2/1/0/0/2/1/2/2, sin documento, retiros404 y privados conservados',async()=>{
  const db=await base();await cargarObjetos(db,objetos,{aplicar:true});
  const lecturas=crearLecturas(async(sql,p)=>{
    if(sql.includes('LEFT JOIN public.materiales')) {
      const i=db.iglesias.find(i=>i.slug===p[0]);if(!i)return [];
      const lista=db.estado.materiales.filter(m=>!m.retirado_publico && m.iglesia_id===i.id && m.categoria_id===p[1]);
      return lista.length?lista:[{iglesia_encontrada:i.id,id:null}];
    }
    if(sql.includes('FROM public.iglesias'))return db.iglesias.filter(i=>i.slug===p[0]);
    assert.ok(sql.includes('NOT m.retirado_publico'));
    const visibles=db.estado.materiales.filter(m=>!m.retirado_publico);
    if(sql.includes('WHERE m.iglesia_id=$1'))return visibles.filter(m=>m.iglesia_id===p[0] && m.categoria_id===p[1]);
    const m=visibles.find(m=>m.id===p[0]);if(!m)return [];
    return sql.includes('GROUP BY')?[{visibilidad:m.visibilidad}]:[m];
  });
  const conteos={catedral:2,'tercera-orden':1,'santa-lucia':0,'santa-ana':0,'catedral-campeche':2,'dulce-nombre-jesus':1,'catedral-puebla':2,'la-compania':2};
  for(const [slug,n]of Object.entries(conteos)) {
    const lista=await lecturas.listarMateriales(slug,'objetos');
    assert.equal(lista.filter(m=>m.visibilidad==='publico').length,n);
    assert.ok(lista.every(m=>!m.tiene_documento && !Object.hasOwn(m,'descripcion_interna')));
  }
  for(const o of objetos) {
    const m=await lecturas.obtenerMaterial(o.id);assert.equal(m.es_ejemplo,false);assert.equal(m.imagen_publica,o.imagen_publica);assert.equal(m.fuente,o.fuente);
    await assert.rejects(lecturas.obtenerDocumento(o.id),{status:404});
  }
  for(const s of muestrasObjetos())await assert.rejects(lecturas.obtenerMaterial(s.id),{status:404});
});
