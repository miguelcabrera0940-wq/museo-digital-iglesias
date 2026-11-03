"""Validación PostgreSQL local, sin dependencias Python ni conexiones remotas.

Ejecutar desde la raíz: python3 backend/test/validar_sql_local.py
PGBIN permite seleccionar los binarios PostgreSQL ya instalados.
--servidor usa socket Unix local para probar RLS real; sin él, modo single sin sockets.
No equivale a probar Neon remoto ni el driver pg real.
"""
import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

backend = Path(__file__).resolve().parents[1]
pgbin = Path(os.environ.get('PGBIN', '/usr/lib/postgresql/17/bin'))
opciones = argparse.ArgumentParser()
opciones.add_argument('--servidor', action='store_true')
args = opciones.parse_args()

def ejecutar(args, entrada=None):
    resultado = subprocess.run(args, input=entrada, text=True, capture_output=True)
    salida = resultado.stdout + resultado.stderr
    # El modo single puede devolver 0 aun con errores SQL: inspeccionar también diagnósticos.
    if resultado.returncode or re.search(r'\b(ERROR|FATAL|PANIC):', salida):
        raise SystemExit(salida)
    return salida

with tempfile.TemporaryDirectory(prefix='iglesias-sql-') as temporal:
    datos = str(Path(temporal) / 'datos')
    ejecutar([str(pgbin / 'initdb'), '-D', datos, '-U', 'postgres',
              '--auth-local=trust', '--auth-host=reject', '--no-locale', '--encoding=UTF8'])
    bootstrap = '''CREATE ROLE visitante_prueba NOLOGIN;
GRANT USAGE ON SCHEMA public TO visitante_prueba;
'''
    archivos = ['001_iglesias.sql', '002_modelo_completo.sql', '003_semillas_ejemplo.sql',
                '004_acceso_publico.sql', '005_login_backend.sql']
    comandos = [bootstrap] + [(backend / 'sql' / nombre).read_text() for nombre in archivos]
    comandos += [(backend / 'test/sql/validar_modelo.sql').read_text()]
    comandos += [(backend / 'sql' / nombre).read_text() for nombre in
                 ['006_auth_base.sql','007_limites_login.sql','008_roles_administrativos.sql']]
    comandos += [(backend / 'test/sql/validar_admin.sql').read_text()]
    comandos += [(backend / 'test/sql/preparar_fase2.sql').read_text()]
    comandos += [(backend / 'sql' / nombre).read_text() for nombre in
                 ['009_catalogo_estados.sql','010_iglesias_fase2.sql']]
    comandos += [(backend / 'test/sql/validar_fase2.sql').read_text()]
    comandos += [(backend / 'test/sql/preparar_ambitos.sql').read_text()]
    comandos += [(backend / 'sql' / nombre).read_text() for nombre in
                 ['011_administradores_por_iglesia.sql','012_login_fallos_consecutivos.sql','013_urnas_nichos.sql']]
    comandos += [(backend / 'sql/013_urnas_nichos.sql').read_text()]  # idempotencia de guías
    comandos += [(backend / 'test/sql/validar_ambitos.sql').read_text()]
    comandos += [(backend / 'sql/014_cuadernos_informativos.sql').read_text()]
    # Validar las consultas reales del adaptador en PostgreSQL, sin instalar pg.
    node = os.environ.get('IGLESIAS_NODE_BIN', '/home/miguel/.nvm/versions/node/v24.21.0/bin/node')
    # Validar preparación agrupada real: rol fresco, READ ONLY y vuelta al login tras COMMIT.
    prefijo = json.loads(ejecutar([node,'--input-type=module','-e',
        f"import {{prepararLecturaSql}} from '{(backend/'src/db.js').as_uri()}';process.stdout.write(JSON.stringify(prepararLecturaSql));"]))
    guardia = prefijo.split('BEGIN READ ONLY;',1)[1].rsplit('SET LOCAL ROLE iglesias_api;',1)[0].strip()
    guardia_literal="'"+guardia.replace("'","''")+"'"
    def denegacion(contexto,codigo):
        return contexto+f'''\nDO $prueba$ BEGIN
          BEGIN EXECUTE {guardia_literal}; RAISE EXCEPTION 'Guardia permitió acceso indebido';
          EXCEPTION WHEN SQLSTATE '{codigo}' THEN NULL; END;
        END $prueba$;\nRESET ROLE; RESET SESSION AUTHORIZATION;\n'''
    comandos += ['SET SESSION AUTHORIZATION iglesias_backend;\n'+prefijo+'''
DO $$ BEGIN
 IF current_user<>'iglesias_api' OR current_setting('transaction_read_only')<>'on'
 THEN RAISE EXCEPTION 'Preparación no aisló rol/lectura'; END IF;
END $$;
COMMIT;
DO $$ BEGIN IF current_user<>'iglesias_backend' THEN RAISE EXCEPTION 'Rol local persistente'; END IF; END $$;
RESET SESSION AUTHORIZATION;
''']
    comandos += [denegacion('','P1003'),
                 denegacion('SET SESSION AUTHORIZATION visitante_prueba;','P1002'),
                 denegacion('SET SESSION AUTHORIZATION iglesias_backend; SET ROLE iglesias_api;','P1001')]
    comandos += ['BEGIN; CREATE ROLE rendimiento_propietario NOLOGIN; GRANT iglesias_api TO rendimiento_propietario;\n'+
                 'ALTER TABLE public.categorias OWNER TO rendimiento_propietario;\n'+
                 denegacion('SET SESSION AUTHORIZATION rendimiento_propietario;','P1004')+'ROLLBACK;']
    consultas = json.loads(ejecutar([node, str(backend / 'scripts/exportar-consultas-prueba.js')]))
    consultas += json.loads(ejecutar([node, str(backend / 'scripts/exportar-consultas-admin-prueba.js')]))
    consultas += json.loads(ejecutar([node, str(backend / 'scripts/exportar-consultas-carga-prueba.js')]))
    def literal(valor):
        if valor is None: return 'NULL'
        if isinstance(valor, bool): return 'TRUE' if valor else 'FALSE'
        if isinstance(valor, (int, float)): return str(valor)
        if isinstance(valor, list): return 'ARRAY[' + ','.join(literal(v) for v in valor) + ']::text[]'
        return "'" + valor.replace("'", "''") + "'"
    preparadas = []
    for i, consulta in enumerate(consultas):
        valores = ','.join(literal(v) for v in consulta['parametros'])
        preparadas.append(f"PREPARE prueba_{i} AS {consulta['sql']};\nEXECUTE prueba_{i}" +
                          (f'({valores})' if valores else '') + f';\nDEALLOCATE prueba_{i};\n')
    comandos += ['BEGIN;\n'+'\n'.join(preparadas)+'\nROLLBACK;']
    # Capturar el cargador real con un cliente de prueba y ejecutar sus sentencias en PG local.
    captura = '''
import {readFile} from 'node:fs/promises';
import {prepararCuadernos,cargarCuadernos} from './src/carga-cuadernos.js';
import {memoriaCuadernos} from './test/fixtures/cuadernos.js';
const db=memoriaCuadernos(),lote=JSON.parse(await readFile('./data/cuadernos-informativos.json','utf8'));
const c=prepararCuadernos(lote);
await cargarCuadernos(db,c,{aplicar:true});
await cargarCuadernos(db,c,{aplicar:true});
process.stdout.write(JSON.stringify(db.llamadas.filter(c=>!c.sql.startsWith('BEGIN')&&!['COMMIT','ROLLBACK'].includes(c.sql))));
'''
    capturadas = subprocess.run([node,'--input-type=module','-e',captura],cwd=backend,text=True,capture_output=True)
    if capturadas.returncode:
        raise SystemExit('No se pudieron capturar las consultas locales del cargador de cuadernos.')
    carga_sql=[]
    for i, consulta in enumerate(json.loads(capturadas.stdout)):
        valores=', '.join(literal(v) for v in consulta['parametros'])
        carga_sql.append(f"PREPARE cuaderno_{i} AS {consulta['sql']};\nEXECUTE cuaderno_{i}"+
                         (f'({valores})' if valores else '')+f';\nDEALLOCATE cuaderno_{i};')
    contexto_rls="SET LOCAL iglesias.prueba_rls='servidor';\n" if args.servidor else ''
    comandos += ['BEGIN;\n'+contexto_rls+(backend/'test/sql/preparar_cuadernos.sql').read_text()+
                 '\n'.join(carga_sql)+'\n'+(backend/'test/sql/validar_cuadernos.sql').read_text()+'\nROLLBACK;']
    iniciado = False
    try:
        if args.servidor:
            log = str(Path(temporal) / 'postgres.log')
            arranque = subprocess.run([str(pgbin / 'pg_ctl'), '-D', datos, '-l', log,
                '-o', f"-h '' -k {temporal}", '-w', '-t', '5', 'start'], capture_output=True, text=True)
            if arranque.returncode:
                detalle = Path(log).read_text() if Path(log).exists() else arranque.stderr
                raise SystemExit('Servidor PostgreSQL local no disponible; RLS efectivo NO comprobado.\n' + detalle)
            iniciado = True
            comandos += [(backend / 'test/sql/validar_rls.sql').read_text()]
        for indice, comando in enumerate(comandos):
            programa = [str(pgbin / 'psql'), '-h', temporal, '-U', 'postgres', '-d', 'postgres',
                        '-X', '-v', 'ON_ERROR_STOP=1'] if args.servidor else [
                            str(pgbin / 'postgres'), '--single', '-j', '-D', datos, 'postgres']
            salida = ejecutar(programa, comando + '\n\n')
            if indice == len(archivos) + 1 and 'MODELO_LOCAL_OK' not in salida:
                raise SystemExit('Falta el resultado final de las aserciones SQL.\n' + salida)
            if args.servidor and indice == len(comandos)-1 and 'RLS_NORMAL_OK' not in salida:
                raise SystemExit('Falta el resultado final de RLS.\n' + salida)
        if args.servidor:
            entorno = dict(os.environ, IGLESIAS_TEST_PG_SOCKET=temporal)
            resultado = subprocess.run([node, '--test', '--test-isolation=none',
                str(backend / 'test/admin.integracion.test.js')], env=entorno, text=True, capture_output=True)
            print(resultado.stdout)
            if resultado.returncode:
                raise SystemExit('Integración administrativa local NO aprobada.\n' + resultado.stderr)
        print('PostgreSQL local: SQL 001–014 y carga/repetición de cuadernos, consultas, integridad, GRANT y metadatos RLS aprobados.')
        print('RLS efectivo aprobado en servidor local.' if args.servidor else
              'Modo single: filtrado efectivo RLS NO comprobado.')
        print('Neon remoto NO comprobado.' if args.servidor else
              'Neon remoto y driver pg real NO comprobados.')
    finally:
        if iniciado:
            subprocess.run([str(pgbin / 'pg_ctl'), '-D', datos, '-m', 'immediate', '-w', 'stop'], capture_output=True)
