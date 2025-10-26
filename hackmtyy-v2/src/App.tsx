import FlightSearchBar from "./components/FlightSearchBar";
import RoleSelector from "./components/RoleSelector";
import PickView from "./components/PickView";
import PackView from "./components/PackView";
import { useFlightContext } from "./context/FlightContext";

const App = () => {
  const { selectedFlight, role } = useFlightContext();

  return (
    <div className="app">
      <header className="app__header">
        <h1>Centro de Catering Aéreo</h1>
        <p>Simulación de flujo PICK / PACK para trolleys de vuelo</p>
      </header>
      <main className="app__main">
        <FlightSearchBar />
        <RoleSelector />
        {!selectedFlight && (
          <div className="app__placeholder">
            Busca un vuelo para ver los trolleys y comenzar el proceso.
          </div>
        )}
        {selectedFlight && !role && (
          <div className="app__placeholder">
            Selecciona si trabajarás como PICK o PACK para continuar.
          </div>
        )}
        {selectedFlight && role === "PICK" && <PickView />}
        {selectedFlight && role === "PACK" && <PackView />}
      </main>
      <footer className="app__footer">
        Plataforma demo sin backend. Datos generados para fines de simulación.
      </footer>
    </div>
  );
};

export default App;
