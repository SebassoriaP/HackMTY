import { useMemo } from "react";
import { useFlightContext } from "../context/FlightContext";
import { Item } from "../types";

interface PackChecklistProps {
  trolleyId: string;
  items: Item[];
}

const PackChecklist = ({ trolleyId, items }: PackChecklistProps) => {
  const { packProgress, adjustPackItem } = useFlightContext();

  const totals = useMemo(
    () =>
      items.map((item) => {
        const current = packProgress[trolleyId]?.[item.sku] ?? 0;
        const isComplete = current >= item.qty;
        return { item, current, isComplete };
      }),
    [items, packProgress, trolleyId]
  );

  return (
    <div className="pack-checklist">
      <h3>Checklist de contenido</h3>
      <div className="pack-checklist__table">
        <div className="pack-checklist__header">
          <span>Artículo</span>
          <span>Colocado</span>
          <span>Acciones</span>
          <span>Estatus</span>
        </div>
        {totals.map(({ item, current, isComplete }) => (
          <div key={item.sku} className="pack-checklist__row">
            <span className="pack-checklist__name">
              {item.name} ({item.sku})
            </span>
            <span className="pack-checklist__qty">
              {current} / {item.qty}
            </span>
            <span className="pack-checklist__actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => adjustPackItem(trolleyId, item.sku, -1)}
              >
                -
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => adjustPackItem(trolleyId, item.sku, 1)}
              >
                +
              </button>
            </span>
            <span className="pack-checklist__status">
              {isComplete ? "✅ Completo" : "⏳ Pendiente"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackChecklist;
