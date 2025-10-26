import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { FlightProvider } from "./context/FlightContext";
import { CateringProvider } from "./context/CateringContext";
import { initializeIfEmpty } from "./firebase/initializeData";
import { initializeAllData } from "./initializeAllData";
import "./styles.css";

// Hacer disponible la función de inicialización globalmente
if (typeof window !== 'undefined') {
  (window as any).initializeAllData = initializeAllData;
}

// Inicializar datos en Firebase en segundo plano (no bloqueante)
initializeIfEmpty()
  .then(() => console.log('✅ Datos de Firebase inicializados'))
  .catch((error) => console.warn('⚠️ Error al inicializar Firebase (continuando de todos modos):', error));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <CateringProvider>
      <FlightProvider>
        <App />
      </FlightProvider>
    </CateringProvider>
  </React.StrictMode>
);
