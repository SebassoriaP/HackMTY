import { useMemo } from "react";
import { useFlightContext } from "../context/FlightContext";
import CameraPreview from "./CameraPreview";
import AlcoholDecision from "./AlcoholDecision";
import PackChecklist from "./PackChecklist";
import { Item, Trolley } from "../types";

const PackView = () => {
  const {
    selectedFlight,
    selectedPackTrolleyId,
    setSelectedPackTrolleyId,
    packProgress,
    alcoholConfirmed
  } = useFlightContext();

  const trolleys = selectedFlight?.trolleys ?? [];

  const selectedTrolley: Trolley | null = useMemo(
    () =>
      trolleys.find((candidate) => candidate.id === selectedPackTrolleyId) ?? null,
    [selectedPackTrolleyId, trolleys]
  );

  const alcoholItems: Item[] = useMemo(
    () => selectedTrolley?.items.filter((item) => item.alcohol) ?? [],
    [selectedTrolley]
  );

  const isAlcoholComplete =
    selectedTrolley && alcoholItems.length > 0
      ? alcoholConfirmed[selectedTrolley.id] ?? false
      : true;

  const isTrolleyComplete =
    selectedTrolley?.items.every((item) => {
      const current = packProgress[selectedTrolley.id]?.[item.sku] ?? 0;
      return current >= item.qty;
    }) ?? false;

  return (
    <div className="pack-view">
      <div className="pack-view__header">
        <h2>Empaque de trolley</h2>
        <label className="pack-view__selector">
          Selecciona trolley:
          <select
            value={selectedPackTrolleyId ?? ""}
            onChange={(event) =>
              setSelectedPackTrolleyId(
                event.target.value ? event.target.value : null
              )
            }
          >
            <option value="">-- elegir --</option>
            {trolleys.map((trolley) => (
              <option key={trolley.id} value={trolley.id}>
                {trolley.id} · {trolley.mesa}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!selectedTrolley ? (
        <div className="pack-view__empty">
          Elige un trolley para iniciar el empaque.
        </div>
      ) : (
        <div className="pack-view__content">
          <section className="pack-view__info">
            <h3>
              {selectedTrolley.id} · {selectedTrolley.mesa}
            </h3>
            <p>
              Verifica que el carrito está vacío y listo para recibir los artículos.
            </p>
            {!isAlcoholComplete && alcoholItems.length > 0 && (
              <AlcoholDecision trolleyId={selectedTrolley.id} items={alcoholItems} />
            )}
          </section>
          {isAlcoholComplete && (
            <div className="pack-view__workspace">
              <div className="pack-view__camera">
                <CameraPreview title="Vista de empaque" />
                {/* TODO: integrar modelo de visión para validar llenado automáticamente */}
              </div>
              <PackChecklist
                trolleyId={selectedTrolley.id}
                items={selectedTrolley.items}
              />
            </div>
          )}
          {isAlcoholComplete && isTrolleyComplete && (
            <div className="pack-view__done">
              TROLLEY COMPLETO ✅ LISTO PARA SELLAR
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PackView;
