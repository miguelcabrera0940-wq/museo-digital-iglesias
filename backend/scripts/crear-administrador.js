// Solo procedimiento local interactivo; jamás se importa desde la API.
import { privado } from './lib/prompt-privado.js';
import { opcionesConexion } from '../src/db.js';
import { configuracion } from '../src/admin/seguridad.js';
import { crearAdministrador, diagnosticoAlta } from '../src/admin/alta.js';
import { opcionesAuth } from '../src/admin/auth.js';

let pool;
try {
  if (!process.stdin.isTTY) throw new Error('TTY_REQUIRED');
  const config = configuracion();
  const { betterAuth } = await import('better-auth');
  const { Pool } = await import('pg');
  const rol=(await privado('Tipo de cuenta: general o parroquial (oculto): ')).trim().toLowerCase();
  const iglesia_slug=rol==='parroquial'?(await privado('Slug de la iglesia asignada (oculto): ')).trim():null;
  const url = await privado('Conexión del login operativo iglesias_alta_admin (oculta): ');
  const email = await privado('Correo de la cuenta (oculto): ');
  const password = await privado('Contraseña nueva, 12–128 caracteres (oculta): ');
  const confirmacion = await privado('Repetir contraseña (oculta): ');
  await crearAdministrador({email,password,confirmacion,rol,iglesia_slug},{
    origen:config.origen,
    obtenerPool:async()=>{
      pool=new Pool(opcionesConexion(url)); pool.on('error',()=>{});
      return pool;
    },
    crearAuth:database=>betterAuth(opcionesAuth(config,database,true)),
  });
  process.stdout.write('{"etapa":"provision","codigo":"OK"}\n');
} catch (error) {
  // Solo códigos/mensajes fijos de validación. Los demás fallos exigen revisar el estado.
  process.stderr.write(JSON.stringify(diagnosticoAlta(error))+'\n');
  process.exitCode=1;
} finally { if (pool) await pool.end().catch(()=>{}); }
