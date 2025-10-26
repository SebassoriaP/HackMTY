import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import "./css/Bottle.css";

type Bottle = {
  id: string;
  name: string;
  imageUrl?: string;
};

function Bottle() {
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const colRef = collection(db, `aerolineas/${id}/bottles`);
        const snap = await getDocs(colRef);
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Bottle, "id">),
        })) as Bottle[];
        setBottles(list);
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar las botellas.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const filtered = bottles
    .filter((b) => b.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!id) return <div className="page"><p>No se recibió ID de aerolínea.</p></div>;

  // 👇 Función que redirige al detalle de botella
  const handleClick = (bottleId: string) => {
    navigate(`/bottle/${id}/${bottleId}`); // /bottle/AA/123
  };

  return (
    <div className="page">
      <header className="header">
        <h2>Catálogo de botellas — {id}</h2>
        <input
          className="searchInput"
          placeholder="Buscar por nombre…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

      {loading && <p>Cargando botellas…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        filtered.length === 0 ? (
          <p>No hay botellas para mostrar.</p>
        ) : (
          <div className="grid">
            {filtered.map((b) => (
              <article
                key={b.id}
                className="card clickable" // 👈 clase nueva
                onClick={() => handleClick(b.id)} // 👈 redirige
              >
                <div className="thumb">
                  <img
                    src={b.imageUrl || "https://via.placeholder.com/256x256?text=Bottle"}
                    alt={b.name}
                    loading="lazy"
                    width={160}
                    height={160}
                  />
                </div>
                <h3 className="bottleName">{b.name}</h3>
              </article>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default Bottle;
