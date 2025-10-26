import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import "./css/SearchAirline.css"; 


interface Airline {
  id: string;
  nombre: string;
  codigo: string;
  direccionOficinas?: string;
  politicasAlcohol?: Record<string, any>;
}

interface SearchAirlineProps {
  onSelect?: (airline: Airline) => void;
}

function SearchAirline({ onSelect }: SearchAirlineProps) {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [search, setSearch] = useState<string>("");

  // Cargar aerolíneas desde Firestore
  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        const snapshot = await getDocs(collection(db, "aerolineas"));
        const list: Airline[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Airline[];

        setAirlines(list);
      } catch (error) {
        console.error("Error al obtener aerolíneas:", error);
      }
    };

    fetchAirlines();
  }, []);

  // Filtrado dinámico
  const filtered = airlines.filter(
    (a) =>
      a.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      a.codigo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="search-airline">
      <h2 className="title">Buscar Aerolínea</h2>

      <input
        type="text"
        placeholder="Escribe el nombre o código..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <ul className="results">
        {filtered.map((a) => (
          <li
            key={a.id}
            className="result-item"
            onClick={() => onSelect?.(a)}
          >
            <strong>{a.codigo}</strong> — {a.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchAirline;
