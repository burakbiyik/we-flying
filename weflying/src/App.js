import './App.css';
import axios from 'axios';
import React, { useState } from 'react';
import { useEffect } from 'react';
import Select from 'react-select';
import { useMemo } from 'react';
import airportData from './airports.json'

function App() {

  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [flights, setFlights] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sourceOptions, setSourceOptions] = useState([]);
  const [destinationOptions, setDestinationOptions] = useState([]);

  const handleSearch = () => {
    if (!source || !destination || !date) {
      alert("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    axios.get('http://localhost:5000/api/flights', {
      params: {
        source: `iata:${source}`,
        destination: `iata:${destination}`,
        outboundDate: date
      }
    })
    .then(res => {
      /*
      console.log("API response:", res.data); // gelen veriyi kontrol et
      console.log("First flight:", res.data.itineraries[0]);
      console.log("Sector Segments:", res.data.itineraries[0]?.outbound?.sectorSegments);
      */
      setFlights(res.data.itineraries || []);
    })
    .catch(err => console.error(err))
    .finally(() => setIsLoading(false));
  };

  const fetchAirportDetails = (input, type) => {
    if (!input || input.trim().length < 2) return;

    const matches = airportData.filter(airport =>
      airport.city.toLowerCase().includes(input.toLowerCase()) ||
      airport.country.toLowerCase().includes(input.toLowerCase()) ||
      airport.iata.toLowerCase().includes(input.toLowerCase())
    );

    matches.forEach(airport => {
      const newOption = {
        name: airport.city,
        countryCode: airport.country,
        iataCode: airport.iata,
        airportName: airport.name
      };

      if (type === 'source') {
        setSourceOptions(prev => {
          const exists = prev.some(opt => opt.iataCode === newOption.iataCode);
          return exists ? prev : [...prev, newOption];
        });
      } else if (type === 'destination') {
        setDestinationOptions(prev => {
          const exists = prev.some(opt => opt.iataCode === newOption.iataCode);
          return exists ? prev : [...prev, newOption];
        });
      }
    });
  };

  const formattedSourceOptions = useMemo(() => (
    sourceOptions.map(city => ({
      value: city.iataCode,
      label: `${city.airportName} / ${city.name} / ${city.countryCode}`
    }))
  ), [sourceOptions]);

  const formattedDestinationOptions = useMemo(() => (
    destinationOptions.map(city => ({
      value: city.iataCode,
      label: `${city.airportName} / ${city.name} / ${city.countryCode}`
    }))
  ), [destinationOptions]);

  return (
    <div className="App">
      <h1>Search Flight</h1>
      <Select
        options={formattedSourceOptions}
        onChange={selected => setSource(selected.value)}
        onInputChange={input => fetchAirportDetails(input, 'source')}
        placeholder="From"
      />

      <Select
        options={formattedDestinationOptions}
        onChange={selected => setDestination(selected.value)}
        onInputChange={input => fetchAirportDetails(input, 'destination')}
        placeholder="To"
      />

      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
      />
      <button onClick={handleSearch}>Search Flight</button>
      {isLoading ? (
      <p>Loading...</p>
        ) : flights.length === 0 ? (
          <p>No flights found. Try a different date.</p>
        ) : (
        <ul>
          {flights.map((flight, index) => {
            const sectorSegments = flight.outbound?.sectorSegments;
            if (!Array.isArray(sectorSegments) || sectorSegments.length === 0) {
              return null; // veya alternatif bir mesaj dönebilirsin
            }

            const segment = sectorSegments[0]?.segment;
            const origin = segment?.source?.station?.code || '???';
            const destination = segment?.destination?.station?.code || '???';
            const departure = segment?.source?.utcTime ? new Date(segment.source.utcTime).toLocaleString('en-EN') : 'No date';
            const arrival = segment?.destination?.utcTime ? new Date(segment.destination.utcTime).toLocaleString('en-EN') : 'No date';
            const airline = segment?.carrier?.name || 'No airline';
            const flightCode = segment?.code || 'No code';
            const price = flight.price?.amount;
            const currency = flight.price?.currency;

            return (
              <div key={index}>
                ✈ {airline} {flightCode} | {origin} → {destination} | {departure} → {arrival} | {price} {currency} TL
              </div>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default App;