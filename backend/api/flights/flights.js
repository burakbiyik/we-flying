process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  // Frontend'den gelen tüm parametreleri al
  const {
    source,
    destination,
    outboundDate,
    returnSource,
    returnDestination,
    returnDate,
    currency = 'TRY',
    locale = 'tr',
    adults = 1,
    children = 0,
    infants = 0,
    cabinClass = 'ECONOMY',
    allowReturnFromDifferentCity = true,
    allowChangeInboundDestination = true,
    allowChangeInboundSource = true,
    transportTypes = 'FLIGHT',
    limit = 20
  } = req.query;

  // Zorunlu alan kontrolü
  if (!source || !destination || !outboundDate) {
    return res.status(400).json({ error: 'Missing required query parameters: source, destination, outboundDateStart' });
  }

  
  const params = {
    source,
    destination,
    outboundDate,
    returnSource,
    returnDestination,
    returnDate,
    currency,
    locale,
    adults,
    children,
    infants,
    cabinClass,
    transportTypes,
    limit,
    allowReturnFromDifferentCity,
    allowChangeInboundDestination,
    allowChangeInboundSource
  };

  
  // Dönüş uçuşu bilgileri varsa ekle
  if (returnSource) params.returnSource = returnSource;
  if (returnDestination) params.returnDestination = returnDestination;
  if (returnDate) params.returnDate = returnDate;


  try {
    const response = await axios.get(`https://kiwi-com-cheap-flights.p.rapidapi.com/round-trip`, {
      headers: {
        'x-rapidapi-key': '0dc09bf1dfmsh90e4e7190baed6ep1199dajsn233ae4dea9fc',
        'x-rapidapi-host': 'kiwi-com-cheap-flights.p.rapidapi.com'
      },
      params
    });

    res.json(response.data);
  } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      res.status(500).json({ error: error.response?.data || error.message });
  }
});

module.exports = router;