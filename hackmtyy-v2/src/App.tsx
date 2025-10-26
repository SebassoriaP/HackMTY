import FlightSearchBar from "./components/FlightSearchBar";
import RoleSelector from "./components/RoleSelector";
import PickView from "./components/PickView";
import PackView from "./components/PackView";
import Dashboard from "./components/Dashboard";
import BottleHandlingStationV2 from "./components/BottleHandlingStationV2";
import { useFlightContext } from "./context/FlightContext";
import { useEffect, useState } from "react";

type View = "bottle-handling" | "pick-pack" | "dashboard";

const App = () => {
  const { selectedFlight, selectedPedido, role } = useFlightContext();
  const [currentView, setCurrentView] = useState<View>("pick-pack"); // HOME = Pick/Pack
  const [tieneAlcohol, setTieneAlcohol] = useState(false);

  // Auto-detectar alcohol y redirigir a bottle handling
  useEffect(() => {
    if (!selectedPedido) {
      setTieneAlcohol(false);
      setCurrentView("pick-pack"); // Volver al home
      return;
    }

    try {
      const alcohol = selectedPedido.items.some(
        (item) =>
          item.categoria === "BebidasAlcoholicas" ||
          (item.contenidoAlcohol !== undefined && item.contenidoAlcohol > 0)
      );

      setTieneAlcohol(alcohol);

      // Auto-redirigir SOLO si tiene alcohol
      if (alcohol) {
        console.log('🍾 Alcohol detectado → Redirigiendo a Bottle Handling');
        setCurrentView("bottle-handling");
      } else {
        console.log('✓ Sin alcohol → Pick/Pack directo');
        setCurrentView("pick-pack");
      }
    } catch (error) {
      console.error('Error al verificar alcohol en pedido:', error);
      setTieneAlcohol(false);
    }
  }, [selectedPedido]);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Centro de Catering Aéreo</h1>
        <p>
          {tieneAlcohol && currentView === "bottle-handling" 
            ? "🍾 Procesamiento de Alcohol → Pick & Pack" 
            : "📦 Sistema Pick & Pack"}
        </p>
      </header>
      <main className="app__main">
        {/* Barra de búsqueda de vuelos */}
        <FlightSearchBar />
        
        {/* Bottle Handling: Solo si hay alcohol (automático) */}
        {currentView === "bottle-handling" && tieneAlcohol && (
          <BottleHandlingStationV2 onVolverPickPack={() => setCurrentView("pick-pack")} />
        )}
        
        {/* Dashboard: Vista de configuración (botón de acceso en Pick/Pack) */}
        {currentView === "dashboard" && <Dashboard />}
        
        {/* Pick/Pack: HOME - Vista principal */}
        {currentView === "pick-pack" && (
          <>
            {/* Botón de acceso a Dashboard (pequeño, esquina) */}
            <div style={{ textAlign: 'right', marginBottom: '10px' }}>
              <button 
                onClick={() => setCurrentView("dashboard")}
                className="secondary-button"
                style={{ fontSize: '12px', padding: '5px 10px' }}
              >
                ⚙️ Dashboard / Configuración
              </button>
            </div>

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
          </>
        )}
      </main>
      <footer className="app__footer">
        Sistema conectado a Firebase Firestore - Datos en tiempo real
      </footer>
    </div>
  );
};

export default App;
