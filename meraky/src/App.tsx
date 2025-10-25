//Componente principal
import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import './App.css'

function App() {
  return (
      <Router>
        <AppRouter />
      </Router>
  )
}

export default App;
