import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { FlightProvider } from "./context/FlightContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <FlightProvider>
      <App />
    </FlightProvider>
  </React.StrictMode>
);
