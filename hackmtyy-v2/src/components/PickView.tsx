import { FormEvent, useMemo, useState, useEffect, useRef } from "react";
import { useFlightContext } from "../context/FlightContext";
import CameraPreview from "./CameraPreview";
import { Trolley } from "../types";
import { generatePickMusic, playAudio } from "../services/musicService";

const PickView = () => {
  const {
    selectedFlight,
    pickProgress,
    activePickTrolleyId,
    setActivePickTrolleyId,
    scanItem
  } = useFlightContext();
  const [scanValue, setScanValue] = useState<string>("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [musicLoading, setMusicLoading] = useState<boolean>(false);
  const [musicPlaying, setMusicPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🎵 Generar música al iniciar el proceso de PICK (automáticamente al entrar a esta vista)
  useEffect(() => {
    const initMusic = async () => {
      if (musicPlaying || musicLoading) {
        console.log("🎵 [PickView] Música ya está en proceso o reproduciéndose");
        return;
      }
      
      console.log("🎵 [PickView] Iniciando generación de música...");
      setMusicLoading(true);
      
      try {
        const audioUrl = await generatePickMusic();
        
        if (audioUrl) {
          console.log("🎵 [PickView] URL de audio recibida, reproduciendo...");
          audioRef.current = playAudio(audioUrl);
          setMusicPlaying(true);
          setFeedback("🎵 Música de trabajo iniciada");
          
          // Limpiar el feedback después de 3 segundos
          setTimeout(() => setFeedback(null), 3000);
        } else {
          console.warn("⚠️ [PickView] No se pudo generar música");
          setFeedback("⚠️ No se pudo generar música de fondo");
          setTimeout(() => setFeedback(null), 3000);
        }
      } catch (error) {
        console.error("❌ [PickView] Error al inicializar música:", error);
      } finally {
        setMusicLoading(false);
      }
    };

    // Iniciar música automáticamente al montar el componente
    console.log("🚀 [PickView] Componente montado - Iniciando música automáticamente");
    initMusic();

    // Cleanup: detener música al desmontar
    return () => {
      console.log("🛑 [PickView] Componente desmontado - Deteniendo música");
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []); // Solo se ejecuta al montar el componente

  const trolleys = selectedFlight?.trolleys ?? [];
  const activeTrolley = useMemo(
    () => trolleys.find((trolley) => trolley.id === activePickTrolleyId) ?? null,
    [activePickTrolleyId, trolleys]
  );

  const handleScan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeTrolley) {
      setFeedback("Selecciona un trolley primero");
      return;
    }
    const normalized = scanValue.trim().toUpperCase();
    if (!normalized) {
      setFeedback("Ingresa un SKU para escanear");
      return;
    }
    const success = scanItem(activeTrolley.id, normalized);
    if (success) {
      setFeedback(`SKU ${normalized} registrado`);
      setScanValue("");
    } else {
      setFeedback(`SKU ${normalized} no corresponde o ya está completo`);
    }
  };

  const renderItem = (trolley: Trolley) =>
    trolley.items.map((item) => {
      const remaining =
        pickProgress[trolley.id]?.[item.sku] ?? item.qty;
      const isComplete = remaining === 0;
      return (
        <div key={item.sku} className="item-row">
          <div className="item-row__name">
            {item.name} ({item.sku})
          </div>
          <div className="item-row__qty">
            Pendiente: {remaining} / {item.qty}
          </div>
          <div className="item-row__status">
            {isComplete ? "✅ Completo" : "⏳ En progreso"}
          </div>
        </div>
      );
    });

  return (
    <div className="pick-view">
      <div className="pick-view__camera">
        <CameraPreview title="Lector de código de barras" />
        {/* TODO: integrar lector de código de barras físico */}
      </div>
      <div className="pick-view__details">
        <h2>Recogida de artículos por trolley</h2>
        
        {/* 🎵 Indicador de música */}
        {musicPlaying && (
          <div className="status status--success">
            🎵 Música de trabajo activada
          </div>
        )}
        {musicLoading && (
          <div className="status status--info">
            🎶 Cargando música...
          </div>
        )}
        
        <p className="pick-view__hint">
          Selecciona un trolley para registrar escaneos. Asegúrate de llevarlo a
          su mesa asignada.
        </p>
        <div className="trolley-selector">
          {trolleys.map((trolley) => (
            <button
              key={trolley.id}
              type="button"
              className={[
                "trolley-selector__button",
                activePickTrolleyId === trolley.id
                  ? "trolley-selector__button--active"
                  : ""
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setActivePickTrolleyId(trolley.id)}
            >
              {trolley.id} · {trolley.mesa}
            </button>
          ))}
        </div>
        <form onSubmit={handleScan} className="picker-scan">
          <label htmlFor="scanInput" className="picker-scan__label">
            Simulación de escaneo SKU:
          </label>
          <div className="picker-scan__input-group">
            <input
              id="scanInput"
              value={scanValue}
              onChange={(event) => setScanValue(event.target.value.toUpperCase())}
              className="picker-scan__input"
              placeholder="Ej. WATER_SM"
            />
            <button type="submit" className="primary-button">
              Registrar
            </button>
          </div>
          {feedback && <div className="status status--info">{feedback}</div>}
        </form>
        <div className="pick-view__trolleys">
          {trolleys.map((trolley) => (
            <div key={trolley.id} className="trolley-card">
              <header className="trolley-card__header">
                <h3>{trolley.id}</h3>
                <span className="trolley-card__mesa">Destino: {trolley.mesa}</span>
              </header>
              <div className="trolley-card__items">{renderItem(trolley)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PickView;
