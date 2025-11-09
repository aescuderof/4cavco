const reservations = [];
let nextId = 1;

function generateId() {
  return nextId++;
}

module.exports = {
  reservations,
  generateId,
};
