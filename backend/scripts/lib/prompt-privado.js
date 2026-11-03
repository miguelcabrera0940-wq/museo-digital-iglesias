import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';

export async function privado(pregunta) {
  process.stdout.write(pregunta);
  const salida=new Writable({write(_trozo,_encoding,done){done();}});
  const rl=createInterface({input:process.stdin,output:salida,terminal:true});
  try{return await new Promise(resolve=>rl.question('',resolve));}
  finally{rl.close();process.stdout.write('\n');}
}
