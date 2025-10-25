import { useState } from 'react';
import './css/FlightSearch.css';

interface FlightData {
  origen: string;
  destino: string;
  hora: string;
  trolloys: number;
}

interface FlightsDatabase {
  [key: string]: FlightData;
}

const FlightSearch = () => {
  const [flightNumber, setFlightNumber] = useState<string>('');
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [searchedFlight, setSearchedFlight] = useState<string>('');

  // Base de datos dummy de vuelos
  const vuelosDummy: FlightsDatabase = {
    "AM123": { origen: "Ciudad de México", destino: "Madrid", hora: "14:30", trolloys: 12 },
    "1": { origen: "Frankfurt", destino: "Toronto", hora: "09:45", trolloys: 8 },
    "UA789": { origen: "Chicago", destino: "Tokio", hora: "22:15", trolloys: 15 },
    "IB999": { origen: "Madrid", destino: "Nueva York", hora: "07:00", trolloys: 10 },
    "AF350": { origen: "París", destino: "Montreal", hora: "11:50", trolloys: 9 }
  };

  const buscarVuelo = () => {
    const flightNum = flightNumber.trim().toUpperCase();
    setSearchedFlight(flightNum);

    if (vuelosDummy[flightNum]) {
      setFlightData(vuelosDummy[flightNum]);
      setNotFound(false);
    } else {
      setFlightData(null);
      setNotFound(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      buscarVuelo();
    }
  };

  return (
    <div className="flight-search-container">
      <h1>Ingresar vuelo para registrar RFDI o QR</h1>
      
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
        <button onClick={buscarVuelo}>Buscar vuelo</button>
      </div>

      {(flightData || notFound) && (
        <div className="result">
          {flightData ? (
            <>
              <h2>Datos del vuelo {searchedFlight}</h2>
              <div className="data-item">
                <strong>Origen:</strong> {flightData.origen}
              </div>
              <div className="data-item">
                <strong>Destino:</strong> {flightData.destino}
              </div>
              <div className="data-item">
                <strong>Hora de salida:</strong> {flightData.hora}
              </div>
              <div className="trolloys">
                Debe preparar <strong>{flightData.trolloys}</strong> trolloys
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
