import { useState } from "react";
import { useFlightContext } from "../context/FlightContext";
import { Item } from "../types";

interface AlcoholDecisionProps {
  trolleyId: string;
  items: Item[];
}

const options = [
  { value: "tirar", label: "Tirar" },
  { value: "reusar", label: "Reusar" },
  { value: "mezclar", label: "Mezclar" }
] as const;

const AlcoholDecision = ({ trolleyId, items }: AlcoholDecisionProps) => {
  const {
    alcoholDecisions,
    setAlcoholDecision,
    confirmAlcoholDecisions,
    alcoholConfirmed
  } = useFlightContext();
  const [message, setMessage] = useState<string | null>(null);

  const decisions = alcoholDecisions[trolleyId] ?? {};
  const allSelected = items.every((item) => decisions[item.sku]);
  const isConfirmed = alcoholConfirmed[trolleyId] ?? false;

  const handleSelect = (sku: string, value: string) => {
    setMessage(null);
    setAlcoholDecision(trolleyId, sku, value as typeof options[number]["value"]);
  };

  const handleConfirm = () => {
    if (!allSelected) {
      setMessage("Completa todas las decisiones antes de continuar");
      return;
    }
    const success = confirmAlcoholDecisions(trolleyId);
    if (success) {
      setMessage("Decisiones guardadas. Puedes iniciar el empaque.");
    } else {
      setMessage("Hubo un problema al confirmar. Intenta de nuevo.");
    }
  };

  return (
    <div className="alcohol-decision">
      <h3>Manejo de Alcohol</h3>
      <p className="alcohol-decision__hint">
        Define el destino de cada bebida alcohólica antes de continuar.
      </p>
      {items.map((item) => (
        <div key={item.sku} className="alcohol-item">
          <div className="alcohol-item__label">
            {item.name} ({item.qty} uds)
          </div>
          <div className="alcohol-item__options">
            {options.map((option) => (
              <label key={option.value} className="alcohol-item__option">
                <input
                  type="radio"
                  name={`${trolleyId}-${item.sku}`}
                  value={option.value}
                  checked={decisions[item.sku] === option.value}
                  onChange={(event) => handleSelect(item.sku, event.target.value)}
                  disabled={isConfirmed}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        className="primary-button"
        onClick={handleConfirm}
        disabled={isConfirmed}
      >
        {isConfirmed ? "Decisiones confirmadas" : "Confirmar decisiones"}
      </button>
      {message && <div className="status status--info">{message}</div>}
    </div>
  );
};

export default AlcoholDecision;
