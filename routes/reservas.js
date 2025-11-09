const {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
} = require('../controllers/reservasController');

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';

    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        req.connection.destroy();
        reject(new Error('Payload demasiado grande'));
      }
    });

    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(new Error('JSON inválido'));
      }
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
}

function buildFilters(searchParams) {
  const filters = {};

  if (searchParams.get('hotel')) {
    filters.hotel = searchParams.get('hotel');
  }
  if (searchParams.get('tipo_habitacion')) {
    filters.tipoHabitacion = searchParams.get('tipo_habitacion');
  }
  if (searchParams.get('estado')) {
    filters.estado = searchParams.get('estado');
  }
  if (searchParams.get('num_huespedes')) {
    const parsed = Number.parseInt(searchParams.get('num_huespedes'), 10);
    if (!Number.isNaN(parsed)) {
      filters.numHuespedes = parsed;
    }
  }
  if (searchParams.get('fecha_inicio')) {
    filters.fechaInicio = searchParams.get('fecha_inicio');
  }
  if (searchParams.get('fecha_fin')) {
    filters.fechaFin = searchParams.get('fecha_fin');
  }

  return filters;
}

function validateReservationPayload(payload, requireAllFields = true) {
  const errors = [];
  const fields = {
    hotel: 'El hotel es obligatorio.',
    tipoHabitacion: 'El tipo de habitación es obligatorio.',
    numHuespedes: 'El número de huéspedes es obligatorio.',
    fechaInicio: 'La fecha de inicio es obligatoria.',
    fechaFin: 'La fecha de fin es obligatoria.',
  };

  if (requireAllFields) {
    Object.entries(fields).forEach(([field, message]) => {
      if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
        errors.push(message);
      }
    });
  }

  if (
    payload.numHuespedes !== undefined &&
    (typeof payload.numHuespedes !== 'number' || Number.isNaN(payload.numHuespedes) || payload.numHuespedes <= 0)
  ) {
    errors.push('El número de huéspedes debe ser un número positivo.');
  }

  if (payload.fechaInicio) {
    const inicio = new Date(payload.fechaInicio);
    if (Number.isNaN(inicio.getTime())) {
      errors.push('La fecha de inicio no es válida.');
    }
  }

  if (payload.fechaFin) {
    const fin = new Date(payload.fechaFin);
    if (Number.isNaN(fin.getTime())) {
      errors.push('La fecha de fin no es válida.');
    }
  }

  if (payload.fechaInicio && payload.fechaFin) {
    const inicio = new Date(payload.fechaInicio);
    const fin = new Date(payload.fechaFin);
    if (!Number.isNaN(inicio.getTime()) && !Number.isNaN(fin.getTime()) && fin < inicio) {
      errors.push('La fecha de fin debe ser posterior a la fecha de inicio.');
    }
  }

  return errors;
}

async function reservationsRouter(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathSegments = url.pathname.split('/').filter(Boolean);

  if (pathSegments[0] !== 'api' || pathSegments[1] !== 'reservas') {
    sendJson(res, 404, { mensaje: 'Recurso no encontrado' });
    return;
  }

  const idSegment = pathSegments[2];
  const hasId = Boolean(idSegment);

  try {
    if (req.method === 'POST' && !hasId) {
      const body = await parseRequestBody(req);
      const errors = validateReservationPayload(body, true);
      if (errors.length > 0) {
        sendJson(res, 400, { errores: errors });
        return;
      }

      const reservation = createReservation(body);
      sendJson(res, 201, { mensaje: 'Reserva creada con éxito', datos: reservation });
      return;
    }

    if (req.method === 'GET' && !hasId) {
      const filters = buildFilters(url.searchParams);
      const reservations = getAllReservations(filters);
      sendJson(res, 200, { datos: reservations });
      return;
    }

    if (hasId) {
      const reservationId = Number.parseInt(idSegment, 10);
      if (Number.isNaN(reservationId)) {
        sendJson(res, 400, { mensaje: 'El identificador proporcionado no es válido.' });
        return;
      }

      if (req.method === 'GET') {
        const reservation = getReservationById(reservationId);
        if (!reservation) {
          sendJson(res, 404, { mensaje: 'Reserva no encontrada' });
          return;
        }
        sendJson(res, 200, { datos: reservation });
        return;
      }

      if (req.method === 'PUT') {
        const body = await parseRequestBody(req);
        const errors = validateReservationPayload(body, false);
        if (errors.length > 0) {
          sendJson(res, 400, { errores: errors });
          return;
        }

        const updated = updateReservation(reservationId, body);
        if (!updated) {
          sendJson(res, 404, { mensaje: 'Reserva no encontrada' });
          return;
        }
        sendJson(res, 200, { mensaje: 'Reserva actualizada con éxito', datos: updated });
        return;
      }

      if (req.method === 'DELETE') {
        const deleted = deleteReservation(reservationId);
        if (!deleted) {
          sendJson(res, 404, { mensaje: 'Reserva no encontrada' });
          return;
        }
        sendJson(res, 200, { mensaje: 'Reserva eliminada con éxito' });
        return;
      }
    }

    sendJson(res, 405, { mensaje: 'Método no permitido' });
  } catch (error) {
    sendJson(res, 500, {
      mensaje: 'Se produjo un error al procesar la solicitud',
      detalle: error.message,
    });
  }
}

module.exports = reservationsRouter;
