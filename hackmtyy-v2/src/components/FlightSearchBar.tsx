import { FormEvent, useState } from "react";
import { useFlightContext } from "../context/FlightContext";

const FlightSearchBar = () => {
  const {
    selectFlight,
    selectedFlightId,
    flightError,
    setRole,
    setSelectedPackTrolleyId
  } = useFlightContext();
  const [inputValue, setInputValue] = useState<string>("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    const success = await selectFlight(inputValue);
    if (success) {
      setRole(null);
      setSelectedPackTrolleyId(null);
      setFeedback(`Vuelo ${inputValue.trim().toUpperCase()} cargado`);
    }
  };

  return (
    <div className="flight-search">
      <form onSubmit={handleSubmit} className="flight-search__form">
        <input
          id="flight-search-input"
          name="flightNumber"
          className="flight-search__input"
          placeholder="Ingresa número de vuelo (ej. AM123)"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value.toUpperCase())}
          aria-label="Buscar vuelo"
        />
        <button type="submit" className="primary-button">
          Cargar vuelo
        </button>
      </form>
      <div className="flight-search__status">
        {flightError && <span className="status status--error">{flightError}</span>}
        {!flightError && feedback && (
          <span className="status status--success">{feedback}</span>
        )}
        {!flightError && !feedback && selectedFlightId && (
          <span className="status status--info">
            Vuelo activo: {selectedFlightId}
          </span>
        )}
      </div>
    </div>
  );
};

export default FlightSearchBar;
