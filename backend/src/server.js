import app from './app.js';

const server = app.listen(3001, '127.0.0.1', () => {
  console.info('API en http://localhost:3001/api/iglesias');
});

server.on('error', () => {
  console.error('No se pudo iniciar la API en el puerto 3001.');
  process.exitCode = 1;
});
