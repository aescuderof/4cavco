# API de gestión de reservas de hotel

Este proyecto implementa un servicio HTTP sencillo para crear y administrar reservas de hotel. La API expone operaciones CRUD completas y filtros adicionales para consultar la información almacenada en memoria.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior.

> **Nota:** Debido a las restricciones del entorno, no se utilizan dependencias externas.

## Configuración

1. Clona este repositorio y entra en el directorio del proyecto.
2. Copia el archivo `.env` de ejemplo (o crea uno nuevo) y define el puerto de ejecución.

```bash
PORT=3000
```

## Scripts disponibles

| Comando       | Descripción                               |
| ------------- | ------------------------------------------ |
| `npm start`   | Inicia el servidor HTTP.                   |

## Ejecución

```bash
npm start
```

Una vez iniciado, el servicio estará disponible en `http://localhost:PORT`.

## Endpoints principales

| Método | Endpoint                      | Descripción                                                      |
| ------ | ----------------------------- | ---------------------------------------------------------------- |
| POST   | `/api/reservas`               | Crea una reserva.                                                |
| GET    | `/api/reservas`               | Obtiene la lista de reservas (admite filtros por query string).  |
| GET    | `/api/reservas/:id`           | Obtiene los detalles de una reserva específica.                  |
| PUT    | `/api/reservas/:id`           | Actualiza los datos de una reserva.                              |
| DELETE | `/api/reservas/:id`           | Elimina una reserva.                                             |

### Filtros disponibles

Los siguientes parámetros opcionales pueden utilizarse en el endpoint `GET /api/reservas`:

- `hotel`: filtra por nombre de hotel.
- `fecha_inicio` y `fecha_fin`: filtra por rango de fechas.
- `tipo_habitacion`: filtra por tipo de habitación.
- `estado`: filtra por estado de la reserva.
- `num_huespedes`: filtra por número exacto de huéspedes.

## Ejemplo de petición

```bash
curl -X POST http://localhost:3000/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
        "hotel": "Hotel Paraíso",
        "nombreHuesped": "Ana Pérez",
        "tipoHabitacion": "suite familiar",
        "numHuespedes": 3,
        "fechaInicio": "2023-05-15",
        "fechaFin": "2023-05-20",
        "estado": "confirmada"
      }'
```

## Estructura del proyecto

```
.
├─ controllers/
│  └─ reservasController.js
├─ data/
│  └─ reservationsStore.js
├─ routes/
│  └─ reservas.js
├─ utils/
│  └─ env.js
├─ server.js
├─ .env
├─ .gitignore
├─ package.json
└─ README.md
```

## Consideraciones

- Los datos se almacenan en memoria y se perderán al reiniciar el servidor.
- Los endpoints responden en formato JSON utilizando mensajes en español.
