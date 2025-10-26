import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase/config";
import "./css/BottleDetail.css";

type BottleDoc = {
  name: string;
  imageUrl?: string;
  min?: number;
  max?: number;
  // si quieres soportar compatibilidad por categoría, agrega:
  // category?: string;
};

type StackItem = {
  airlineId: string;   // IATA
  specId: string;      // id de especificación (== bottleId)
  name: string;
  measuredMl: number;
  weighId: string;     // id único por pesaje (instancia física)
  // opcional: category?: string;
};

// UUID sencillo para cada pesaje
const genWeighId = () =>
  (globalThis.crypto && "randomUUID" in globalThis.crypto)
    ? crypto.randomUUID()
    : `w_${Date.now()}_${Math.random().toString(16).slice(2)}`;

// Generadores de ml de prueba
const genBelow = (min?: number) => Math.max(0, (min ?? 0) - 1);
const genBetween = (min?: number, max?: number) => {
  const lo = (min ?? 0) + 1;
  const hi = Math.max(lo, (max ?? 0) - 1);
  return lo + Math.floor(Math.random() * Math.max(1, hi - lo + 1));
};
const genAbove = (max?: number) => (max ?? 0) + 1;

function BottleDetail() {
  const navigate = useNavigate();
  const { airlineId, bottleId } = useParams();
  const [bottle, setBottle] = useState<(BottleDoc & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [measuredMl, setMeasuredMl] = useState<number | null>(null);
  const [result, setResult] = useState<{
    status: "discard" | "keep" | "fill" | null;
    message: string;
    pair?: { a: StackItem; b: StackItem } | null;
  }>({ status: null, message: "", pair: null });

  // Clave para el stack por aerolínea
  const stackKey = useMemo(
    () => (airlineId ? `rellenoStack:${airlineId}` : "rellenoStack"),
    [airlineId]
  );

  // Helpers del stack en localStorage
  const loadStack = (): StackItem[] => {
    try {
      const raw = localStorage.getItem(stackKey);
      return raw ? (JSON.parse(raw) as StackItem[]) : [];
    } catch {
      return [];
    }
  };
  const saveStack = (items: StackItem[]) => {
    localStorage.setItem(stackKey, JSON.stringify(items));
    // Notifica a este mismo tab (evento storage no dispara en misma pestaña)
    window.dispatchEvent(new CustomEvent("stack-updated", { detail: { key: stackKey } }));
  };

  useEffect(() => {
    const fetchBottle = async () => {
      if (!airlineId || !bottleId) return;
      setLoading(true);
      try {
        const ref = doc(db, `aerolineas/${airlineId}/bottles/${bottleId}`);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setBottle({ id: snap.id, ...(snap.data() as BottleDoc) });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBottle();
  }, [airlineId, bottleId]);

  // Evalúa el valor en ml contra min/max y gestiona el stack
  const evaluateValue = (val: number) => {
    setMeasuredMl(val);

    const min = bottle?.min ?? 0;
    const max = bottle?.max ?? 0;

    if (val < min) {
      setResult({ status: "discard", message: "Desechar botella", pair: null });
      return;
    }

    if (val > max) {
      setResult({ status: "keep", message: "Reutilizar botella", pair: null });
      return;
    }

    // Caso RELLENAR (entre min y max): tratamos este pesaje como instancia única
    const current: StackItem = {
      airlineId: airlineId || "",
      specId: bottleId || "",          // id de especificación
      name: bottle?.name || "Botella",
      measuredMl: val,
      weighId: genWeighId(),           // id único por pesaje
      // category: bottle?.category,
    };

    const stack = loadStack();

    // Pair por MISMA ESPECIFICACIÓN (si quieres por categoría, cambia la condición)
    const idx = stack.findIndex(
      (x) => x.specId === current.specId && x.weighId !== current.weighId
    );

    if (idx >= 0) {
      const first = stack[idx];
      const pair = { a: first, b: current };
      const rest = [...stack.slice(0, idx), ...stack.slice(idx + 1)];
      saveStack(rest);
      setResult({
        status: "fill",
        message: `Rellenar: juntar "${first.name}" con "${current.name}"`,
        pair,
      });
    } else {
      saveStack([...stack, current]);
      setResult({
        status: "fill",
        message: `Pendiente de juntar: "${current.name}". Esperando otra botella compatible…`,
        pair: null,
      });
    }
  };



  // Pesajes mock dirigidos
  const handleMockBelow = () => {
    const val = genBelow(bottle?.min);
    console.log("[MOCK < min]", { val, min: bottle?.min, max: bottle?.max });
    
    evaluateValue(val);
  };
  const handleMockBetween = () => {
    const val = genBetween(bottle?.min, bottle?.max);
    console.log("[MOCK between]", { val, min: bottle?.min, max: bottle?.max });

    evaluateValue(val);
  };
  const handleMockAbove = () => {
    const val = genAbove(bottle?.max);
    console.log("[MOCK > max]", { val, min: bottle?.min, max: bottle?.max });
  
    evaluateValue(val);
  };

  // Botón que genera un valor aleatorio amplio (mock general)
  const handleWeighMock = () => {
    const max = bottle?.max ?? 0;
    const baseMax = Math.max(Math.floor(max * 1.6), (bottle?.min ?? 0) + 500, 800);
    const val = Math.floor(Math.random() * (baseMax + 1)); // 0..baseMax
    console.log("[MOCK random]", { val, min: bottle?.min, max: bottle?.max });

    evaluateValue(val);
  };

  // Limpiar stack manualmente
  const handleClearStack = () => {
    localStorage.removeItem(stackKey);
    window.dispatchEvent(new CustomEvent("stack-updated", { detail: { key: stackKey } }));
    console.log("[STACK] limpiado:", stackKey);
  };

  if (loading || !bottle) {
    return <div className="bdl-page"><p>Cargando…</p></div>;
  }

  return (
    <div className="bdl-page">
      <button className="backBtn" onClick={() => navigate(-1)}>← Volver</button>

      <div className="bdl-header">
        <div className="bdl-imageWrap">
          <img
            src={bottle.imageUrl || "https://via.placeholder.com/256x256?text=Bottle"}
            alt={bottle.name}
            loading="lazy"
          />
        </div>
        <div className="bdl-info">
          <h2 className="bdl-title">{bottle.name}</h2>
          <div className="bdl-meta">
            <div><span className="lbl">Min:</span> {bottle.min ?? "—"} ml</div>
            <div><span className="lbl">Max:</span> {bottle.max ?? "—"} ml</div>
            <div><span className="lbl">Aerolínea:</span> {airlineId}</div>
            <div><span className="lbl">ID espec.:</span> {bottleId}</div>
          </div>
        </div>
      </div>

      <div className="bdl-panel">
        <div className="bdl-inputRow">
         


          {/* Mocks dirigidos */}
          <button className="bdl-btn bdl-btn-mock" onClick={handleMockBelow}>Mock &lt; min</button>
          <button className="bdl-btn bdl-btn-mock" onClick={handleMockBetween}>Mock entre</button>
          <button className="bdl-btn bdl-btn-mock" onClick={handleMockAbove}>Mock &gt; max</button>

          {/* Mock aleatorio general */}
          <button className="bdl-btn bdl-btn-mock" onClick={handleWeighMock}>Pesar (mock)</button>
        </div>

        {measuredMl !== null && (
          <p className="bdl-note">Medición: <strong>{measuredMl} ml</strong></p>
        )}

        {result.status && (
          <div
            className={
              "bdl-result " +
              (result.status === "discard"
                ? "is-discard"
                : result.status === "keep"
                ? "is-keep"
                : "is-fill")
            }
          >
            {result.message}
            {result.pair && (
              <div className="bdl-pair">
                <div>• A: {result.pair.a.name} ({result.pair.a.measuredMl} ml)</div>
                <div>• B: {result.pair.b.name} ({result.pair.b.measuredMl} ml)</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bdl-actions">
        <button className="bdl-doneBtn" onClick={() => navigate("/")}>
          ✔︎ Verificación completada
        </button>
        <button className="bdl-clearBtn" onClick={handleClearStack}>
          Limpiar stack
        </button>
      </div>

      <div className="bdl-stack">
        <h3>Pendientes de juntar</h3>
        <StackList stackKey={stackKey} />
      </div>
    </div>
  );
}

function StackList({ stackKey }: { stackKey: string }) {
  const [items, setItems] = useState<StackItem[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(stackKey);
        setItems(raw ? (JSON.parse(raw) as StackItem[]) : []);
      } catch {
        setItems([]);
      }
    };
    load();

    // Escucha cambios de storage entre pestañas
    const onStorage = (e: StorageEvent) => {
      if (e.key === stackKey) load();
    };
    // Escucha evento custom en esta misma pestaña
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail.key === stackKey) load();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("stack-updated", onCustom as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("stack-updated", onCustom as EventListener);
    };
  }, [stackKey]);

  if (items.length === 0) {
    return <p className="bdl-empty">No hay botellas pendientes.</p>;
  }

  return (
    <ul className="bdl-list">
      {items.map((it) => (
        <li key={it.weighId} className="bdl-item">
          <span className="bdl-name">{it.name}</span>
          <span className="bdl-ml">{it.measuredMl} ml</span>
        </li>
      ))}
    </ul>
  );
}

export default BottleDetail;
