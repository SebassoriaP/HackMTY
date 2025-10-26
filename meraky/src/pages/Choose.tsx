
import './css/Chose.css'
import { Link } from "react-router-dom";

function Choose() {

  return (
    <>
      <img src="https://sccgltd.com/wp-content/uploads/2017/08/Gategroup-Logo.png"  className="center-image" />

      <div className="btn-row">
        <Link to="/bottles" className="btn-glow">Medición de Botellas</Link>
        <Link to="/products" className="btn-glow">Verificación de Productos</Link>
      </div>
    </>
  )
}


export default Choose
