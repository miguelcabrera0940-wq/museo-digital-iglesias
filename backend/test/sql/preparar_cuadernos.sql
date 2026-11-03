CREATE TEMP TABLE protegidos_cuadernos AS SELECT id,to_jsonb(m) AS datos
FROM public.materiales m WHERE visibilidad='privado' OR categoria_id='objetos';
CREATE TEMP TABLE documentos_anteriores AS SELECT material_id,to_jsonb(d) AS datos FROM public.documentos d;
CREATE TEMP TABLE paginas_anteriores AS SELECT material_id,numero,to_jsonb(p) AS datos FROM public.paginas p;
CREATE TEMP TABLE administracion_anterior AS SELECT md5(string_agg(datos::text,',' ORDER BY datos::text)) AS huella FROM (
  SELECT to_jsonb(a) AS datos FROM public.administrador a UNION ALL
  SELECT to_jsonb(u) FROM public.auth_user u UNION ALL
  SELECT to_jsonb(c) FROM public.auth_account c UNION ALL
  SELECT to_jsonb(s) FROM public.auth_session s
) x;
