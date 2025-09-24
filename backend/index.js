const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// CORS middleware → frontend'in backend'e erişebilmesi için şart
app.use(cors());

// flights route'u bağla
const flightsRoute = require('./api/flights/flights.js');
app.use('/api/flights', flightsRoute);

// Sunucuyu başlat
app.listen(5000, () => {
  console.log('Backend working: http://localhost:5000');
});