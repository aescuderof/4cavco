const { reservations, generateId } = require('../data/reservationsStore');

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function createReservation(payload) {
  const reservation = {
    id: generateId(),
    hotel: payload.hotel,
    nombreHuesped: payload.nombreHuesped || null,
    tipoHabitacion: payload.tipoHabitacion,
    numHuespedes: payload.numHuespedes,
    fechaInicio: payload.fechaInicio,
    fechaFin: payload.fechaFin,
    estado: payload.estado || 'pendiente',
    comentarios: payload.comentarios || null,
    creadaEn: new Date().toISOString(),
  };

  reservations.push(reservation);
  return reservation;
}

function getReservationById(id) {
  return reservations.find((reservation) => reservation.id === id) || null;
}

function getAllReservations(filters = {}) {
  return reservations.filter((reservation) => {
    if (filters.hotel && reservation.hotel.toLowerCase() !== filters.hotel.toLowerCase()) {
      return false;
    }

    if (filters.tipoHabitacion && reservation.tipoHabitacion.toLowerCase() !== filters.tipoHabitacion.toLowerCase()) {
      return false;
    }

    if (filters.estado && reservation.estado.toLowerCase() !== filters.estado.toLowerCase()) {
      return false;
    }

    if (
      typeof filters.numHuespedes === 'number' &&
      reservation.numHuespedes !== filters.numHuespedes
    ) {
      return false;
    }

    if (filters.fechaInicio || filters.fechaFin) {
      const reservaInicio = parseDate(reservation.fechaInicio);
      const reservaFin = parseDate(reservation.fechaFin);
      if (!reservaInicio || !reservaFin) {
        return false;
      }

      if (filters.fechaInicio) {
        const filtroInicio = parseDate(filters.fechaInicio);
        if (!filtroInicio || reservaFin < filtroInicio) {
          return false;
        }
      }

      if (filters.fechaFin) {
        const filtroFin = parseDate(filters.fechaFin);
        if (!filtroFin || reservaInicio > filtroFin) {
          return false;
        }
      }
    }

    return true;
  });
}

function updateReservation(id, updates) {
  const reservation = getReservationById(id);
  if (!reservation) {
    return null;
  }

  const allowedFields = [
    'hotel',
    'nombreHuesped',
    'tipoHabitacion',
    'numHuespedes',
    'fechaInicio',
    'fechaFin',
    'estado',
    'comentarios',
  ];

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      reservation[field] = updates[field];
    }
  });

  reservation.actualizadaEn = new Date().toISOString();
  return reservation;
}

function deleteReservation(id) {
  const index = reservations.findIndex((reservation) => reservation.id === id);
  if (index === -1) {
    return false;
  }

  reservations.splice(index, 1);
  return true;
}

module.exports = {
  createReservation,
  getReservationById,
  getAllReservations,
  updateReservation,
  deleteReservation,
  parseDate,
};
