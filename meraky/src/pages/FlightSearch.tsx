import { useState } from 'react';
import './css/FlightSearch.css';
import { getVuelos } from '../services/vuelos';
import type { Vuelo } from '../types/vuelos';

const FlightSearch = () => {
  const [flightNumber, setFlightNumber] = useState<string>('');
  const [flightData, setFlightData] = useState<Vuelo | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [searchedFlight, setSearchedFlight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const buscarVuelo = async () => {
    const flightNum = flightNumber.trim().toUpperCase();
    setSearchedFlight(flightNum);
    setLoading(true);

    try {
      // Obtener todos los vuelos de Firebase
      const vuelos = await getVuelos();
      
      // Buscar el vuelo por número
      const vueloEncontrado = vuelos.find(vuelo => vuelo.numero_vuelo === flightNum);

      if (vueloEncontrado) {
        setFlightData(vueloEncontrado);
        setNotFound(false);
      } else {
        setFlightData(null);
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error al buscar vuelo:', error);
      setFlightData(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      buscarVuelo();
    }
  };

  return (
    <div className="flight-search-container">
      <h1>Escanear QR para pick carrito</h1>
      
      <div className="input-section">
        <label htmlFor="flightInput">Número de vuelo</label>
        <input
          type="text"
          id="flightInput"
          placeholder="Ejemplo: AM123, LH456, UA789"
          value={flightNumber}
          onChange={(e) => setFlightNumber(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={buscarVuelo} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar vuelo'}
        </button>
      </div>

      {(flightData || notFound) && (
        <div className="result">
          {flightData ? (
            <>
              <h2>Datos del vuelo {searchedFlight}</h2>
              <div className="data-item">
                <strong>Número de vuelo:</strong> {flightData.numero_vuelo}
              </div>
              <div className="data-item">
                <strong>QR ID:</strong> {flightData.qr_id}
              </div>
              <div className="data-item">
                <strong>Tipo:</strong> {flightData.tipo}
              </div>
              <div className="data-item">
                <strong>Artículos:</strong> {JSON.stringify(flightData.articulos)}
              </div>
            </>
          ) : (
            <h2>
              No se encontraron datos para el vuelo <strong>{searchedFlight}</strong>
            </h2>
          )}
        </div>
      )}
    </div>
  );
};

export default FlightSearch;
