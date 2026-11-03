import { errorSeguro } from './diagnostico-neon.js';
import { slugsIglesias } from './catalogo.js';

// No imprime datos. Las dependencias se inyectan para probar los fallos sin red.
export async function verificarNeon(consultar, lecturas) {
  const iglesias = await lecturas.listarIglesias();
  if (iglesias.length !== slugsIglesias.length || !slugsIglesias.every(slug => iglesias.some(i => i.slug === slug))) throw errorSeguro('IGLESIAS_COUNT');
  const [filtrado] = await consultar(`SELECT
    (SELECT count(*) FROM public.documentos d JOIN public.materiales m ON m.id=d.material_id
      WHERE m.visibilidad='privado') AS documentos_privados,
    (SELECT count(*) FROM public.paginas p JOIN public.materiales m ON m.id=p.material_id
      WHERE m.visibilidad='privado') AS paginas_privadas,
    (SELECT count(*) FROM public.documentos) AS documentos_visibles,
    (SELECT count(*) FROM public.paginas) AS paginas_visibles`);
  const columnas = ['documentos_privados', 'paginas_privadas', 'documentos_visibles', 'paginas_visibles'];
  if (!filtrado || columnas.some((c) => !Number.isSafeInteger(Number(filtrado[c])) || Number(filtrado[c]) < 0)) {
    throw errorSeguro('RLS_RESULT_INVALID');
  }
  if (Number(filtrado.documentos_privados) !== 0 || Number(filtrado.paginas_privadas) !== 0) {
    throw errorSeguro('RLS_PRIVATE_VISIBLE');
  }
  if (Number(filtrado.documentos_visibles) <= 0 || Number(filtrado.paginas_visibles) <= 0) {
    throw errorSeguro('RLS_PUBLIC_EMPTY');
  }
  let columnaDenegada = false;
  try { await consultar('SELECT descripcion_interna FROM public.materiales LIMIT 1'); }
  catch (error) {
    if (error.code !== '42501') throw error;
    columnaDenegada = true;
  }
  if (!columnaDenegada) throw errorSeguro('INTERNAL_NOTES_VISIBLE');
  let privados = 0;
  for (const iglesia of iglesias) {
    for (const material of await lecturas.listarMateriales(iglesia.slug)) {
      if ('descripcion_interna' in material) throw errorSeguro('INTERNAL_NOTES_IN_PAYLOAD');
      if (material.visibilidad !== 'privado') continue;
      privados++;
      if (!material.bloqueado || material.tiene_documento) throw errorSeguro('PRIVATE_FLAGS_INVALID');
      let denegado = false;
      try { await lecturas.obtenerDocumento(material.id); }
      catch (error) {
        if (error.status !== 403 || error.code !== 'FORBIDDEN') throw error;
        denegado = true;
      }
      if (!denegado) throw errorSeguro('PRIVATE_DOCUMENT_ALLOWED');
    }
  }
  if (privados === 0) throw errorSeguro('PRIVATE_FIXTURES_EMPTY');
}
