const http = require('http');
const { loadEnv } = require('./utils/env');
const reservationsRouter = require('./routes/reservas');

loadEnv();

const PORT = Number.parseInt(process.env.PORT, 10) || 3000;

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/reservas')) {
    Promise.resolve(reservationsRouter(req, res)).catch((error) => {
      sendJson(res, 500, {
        mensaje: 'Error inesperado del servidor',
        detalle: error.message,
      });
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/') {
    sendJson(res, 200, {
      mensaje: 'Servicio de gestión de reservas funcionando',
      recursos: ['/api/reservas'],
    });
    return;
  }

  sendJson(res, 404, { mensaje: 'Ruta no encontrada' });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
