
import './css/Chose.css'
import { Link } from "react-router-dom";

function Choose() {

  return (
    <>
      <h1 className='bienvenida'>Bienvenido</h1>

      <div className="btn-row">
        <Link to="/pick" className="btn-glow">PICK</Link>
        <Link to="/pack" className="btn-glow">PACK</Link>
      </div>
    </>
  )
}


export default Choose
