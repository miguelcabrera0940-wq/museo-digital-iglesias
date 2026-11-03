import merida from '../../data/iglesias.json' with {type:'json'};
import nuevas from '../../data/iglesias-fase2.json' with {type:'json'};
import { materiales } from '../../data/materiales.js';
export function memoriaCuadernos() {
  const iglesias=[...merida,...nuevas];
  let estado={materiales:materiales.map(({documento,...m})=>({...m,retirado_publico:false})),
    documentos:materiales.filter(m=>m.documento).map(m=>{const {paginas,...d}=m.documento;return d;}),
    paginas:materiales.flatMap(m=>(m.documento?.paginas??[]).map(p=>({...p,material_id:m.id})))};
  let respaldo;
  const llamadas=[];
  return {iglesias,llamadas,get estado(){return estado;},query:async(sql,p=[])=>{
    llamadas.push({sql,parametros:p});
    if(sql.startsWith('BEGIN')){respaldo=structuredClone(estado);return {rows:[]};}
    if(sql==='ROLLBACK'){estado=respaldo;return {rows:[]};}
    if(sql==='COMMIT')return {rows:[]};
    if(sql.includes('FROM public.iglesias'))return {rows:structuredClone(iglesias)};
    const tabla=sql.match(/public\.(materiales|documentos|paginas)/)?.[1];
    if(sql.trim().startsWith('SELECT')) {
      const filas=estado[tabla].filter(m=>(m.id??m.material_id)===p[0]);
      const columnas=sql.slice(sql.indexOf('SELECT')+6,sql.indexOf('FROM')).trim().split(',').map(c=>c.trim());
      return {rows:filas.map(f=>Object.fromEntries(columnas.map(c=>[c,f[c]])))};
    }
    if(sql.startsWith('INSERT')) {
      let registro;
      if(tabla==='materiales') {
        const campos=sql.match(/\(([^)]+)\)/)[1].split(',');registro=Object.fromEntries(campos.map((k,n)=>[k,p[n]]));
      } else if(tabla==='documentos')registro={material_id:p[0],titulo:p[1],es_ejemplo:false};
      else registro={material_id:p[0],numero:p[1],texto:p[2],imagen_url:p[3]};
      const anterior=estado[tabla].find(m=>(m.id??m.material_id)===p[0] && (tabla!=='paginas'||m.numero===p[1]));
      if(anterior)Object.assign(anterior,registro);else estado[tabla].push(registro);
      return {rows:[]};
    }
    if(sql.startsWith('UPDATE public.materiales SET retirado_publico')) {
      estado.materiales.find(m=>m.id===p[0]).retirado_publico=true;return {rows:[]};
    }
    throw new Error('Consulta inesperada en doble SQL');
  }};
}
