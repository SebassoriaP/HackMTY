import { Item } from "../types";

interface AlcoholDecisionProps {
  trolleyId: string;
  items: Item[];
}

/**
 * Muestra las decisiones automáticas de bottle handling para bebidas alcohólicas
 * Las decisiones se toman automáticamente al crear el pedido según criterios de la aerolínea
 */
const AlcoholDecision = ({ items }: AlcoholDecisionProps) => {
  // Filtrar solo items alcohólicos que tienen decisión automática
  const alcoholItems = items.filter(item => item.alcohol && item.bottleDecision);

  if (alcoholItems.length === 0) {
    return null;
  }

  return (
    <div className="alcohol-decision">
      <h3>Control de Calidad - Bebidas Alcohólicas</h3>
      <p className="alcohol-decision__hint">
        Decisiones automáticas basadas en criterios de calidad de la aerolínea
      </p>
      
      {alcoholItems.map((item) => {
        const decisionClass = `decision-badge decision-badge--${item.bottleDecision}`;
        const decisionLabel = {
          reutilizar: "✓ REUTILIZAR",
          rellenar: "↻ RELLENAR", 
          desechar: "✗ DESECHAR"
        }[item.bottleDecision || 'desechar'];

        return (
          <div key={item.sku} className="alcohol-item">
            <div className="alcohol-item__header">
              <div className="alcohol-item__label">
                {item.name} ({item.qty} uds)
              </div>
              <span className={decisionClass}>
                {decisionLabel}
              </span>
            </div>
            {item.bottleReason && (
              <div className="alcohol-item__reason">
                <small>{item.bottleReason}</small>
              </div>
            )}
          </div>
        );
      })}
      
      <div className="alcohol-decision__summary">
        <p>
          ✓ Todas las decisiones han sido evaluadas automáticamente.
          Puedes proceder con el proceso de Pick.
        </p>
      </div>
    </div>
  );
};

export default AlcoholDecision;
