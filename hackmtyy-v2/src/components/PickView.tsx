import { FormEvent, useMemo, useState, useEffect, useRef } from "react";
import { useFlightContext } from "../context/FlightContext";
import CameraPreview from "./CameraPreview";
import { Trolley } from "../types";
import { generatePickMusic, playAudio } from "../services/musicService";
import { cleanupAudio } from "../utils/audioCleanup";

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
  const musicInitializedRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  // 🎵 Generar música al iniciar el proceso de PICK (automáticamente al entrar a esta vista)
  useEffect(() => {
    isMountedRef.current = true;
    
    const initMusic = async () => {
      // Evitar inicialización múltiple
      if (musicInitializedRef.current || musicPlaying || musicLoading || !isMountedRef.current) {
        console.log("🎵 [PickView] Música ya está en proceso o reproduciéndose");
        return;
      }
      
      musicInitializedRef.current = true;
      console.log("🎵 [PickView] Iniciando generación de música...");
      setMusicLoading(true);
      
      try {
        const audioUrl = await generatePickMusic();
        
        // Verificar si el componente sigue montado antes de continuar
        if (!isMountedRef.current) {
          console.log("🛑 [PickView] Componente desmontado antes de reproducir música");
          return;
        }
        
        if (audioUrl) {
          console.log("🎵 [PickView] URL de audio recibida, reproduciendo...");
          audioRef.current = playAudio(audioUrl);
          setMusicPlaying(true);
          setFeedback("🎵 Música de trabajo iniciada");
          
          // Limpiar el feedback después de 3 segundos
          setTimeout(() => {
            if (isMountedRef.current) {
              setFeedback(null);
            }
          }, 3000);
        } else {
          console.warn("⚠️ [PickView] No se pudo generar música");
          setFeedback("⚠️ No se pudo generar música de fondo");
          setTimeout(() => {
            if (isMountedRef.current) {
              setFeedback(null);
            }
          }, 3000);
        }
      } catch (error) {
        console.error("❌ [PickView] Error al inicializar música:", error);
        if (isMountedRef.current) {
          setFeedback("❌ Error al generar música");
          setTimeout(() => {
            if (isMountedRef.current) {
              setFeedback(null);
            }
          }, 3000);
        }
      } finally {
        if (isMountedRef.current) {
          setMusicLoading(false);
        }
      }
    };

    // Iniciar música automáticamente al montar el componente
    console.log("🚀 [PickView] Componente montado - Iniciando música automáticamente");
    initMusic();

    // Cleanup: detener música al desmontar
    return () => {
      console.log("🛑🛑🛑 [PickView] DESMONTANDO COMPONENTE - DETENIENDO MÚSICA 🛑🛑🛑");
      isMountedRef.current = false;
      
      // Detener y limpiar audio completamente usando la utilidad
      if (audioRef.current) {
        console.log("🔇 [PickView] Deteniendo música");
        cleanupAudio(audioRef.current);
        audioRef.current = null;
      }
      
      // Resetear estados
      musicInitializedRef.current = false;
      
      console.log("✅ [PickView] Cleanup completado - Música detenida");
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
      const progress = ((item.qty - remaining) / item.qty) * 100;
      
      return (
        <div key={item.sku} className={`item-row ${isComplete ? 'item-row--complete' : ''}`}>
          <div className="item-row__header">
            <div className="item-row__name">
              {isComplete && <span className="item-row__check">✓</span>}
              {item.name}
            </div>
            <div className="item-row__sku">{item.sku}</div>
          </div>
          <div className="item-row__progress-section">
            <div className="item-row__qty">
              <span className="item-row__qty-picked">{item.qty - remaining}</span>
              <span className="item-row__qty-separator">/</span>
              <span className="item-row__qty-total">{item.qty}</span>
            </div>
            <div className="item-row__progress-bar">
              <div 
                className="item-row__progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      );
    });

  return (
    <div className="pick-view">
      <div className="pick-view__camera">
        <CameraPreview title="Escáner de Código de Barras" />
        {/* TODO: integrar lector de código de barras físico */}
      </div>
      <div className="pick-view__details">
        <div className="pick-view__header-section">
          <h2 className="pick-view__title">Recogida de Artículos</h2>
          
          {/* Indicador de música */}
          {musicPlaying && (
            <div className="status-badge status-badge--music">
              <span className="status-badge__icon">♪</span>
              <span className="status-badge__text">Música activada</span>
            </div>
          )}
          {musicLoading && (
            <div className="status-badge status-badge--loading">
              <span className="status-badge__icon">♪</span>
              <span className="status-badge__text">Cargando música...</span>
            </div>
          )}
        </div>
        
        <div className="pick-view__instructions">
          <div className="instruction-card">
            <span className="instruction-card__number">1</span>
            <p className="instruction-card__text">Selecciona un trolley abajo</p>
          </div>
          <div className="instruction-card">
            <span className="instruction-card__number">2</span>
            <p className="instruction-card__text">Escanea o ingresa el SKU</p>
          </div>
          <div className="instruction-card">
            <span className="instruction-card__number">3</span>
            <p className="instruction-card__text">Lleva a la mesa asignada</p>
          </div>
        </div>
        
        <div className="trolley-selector-section">
          <h3 className="section-title">
            <span className="section-title__icon">■</span>
            Seleccionar Trolley
          </h3>
          <div className="trolley-selector">
            {trolleys.map((trolley) => {
              const totalItems = trolley.items.reduce((sum, item) => sum + item.qty, 0);
              const completedItems = trolley.items.reduce((sum, item) => {
                const remaining = pickProgress[trolley.id]?.[item.sku] ?? item.qty;
                return sum + (item.qty - remaining);
              }, 0);
              const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
              
              return (
                <button
                  key={trolley.id}
                  type="button"
                  className={`trolley-selector__button ${
                    activePickTrolleyId === trolley.id
                      ? "trolley-selector__button--active"
                      : ""
                  }`}
                  onClick={() => setActivePickTrolleyId(trolley.id)}
                >
                  <div className="trolley-selector__button-content">
                    <span className="trolley-selector__id">{trolley.id}</span>
                    <span className="trolley-selector__mesa">{trolley.mesa}</span>
                    <div className="trolley-selector__progress">
                      <div 
                        className="trolley-selector__progress-bar"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        <form onSubmit={handleScan} className="picker-scan">
          <label htmlFor="scanInput" className="picker-scan__label">
            <span className="picker-scan__label-icon">▸</span>
            Escanear o Ingresar SKU
          </label>
          <div className="picker-scan__input-group">
            <input
              id="scanInput"
              value={scanValue}
              onChange={(event) => setScanValue(event.target.value.toUpperCase())}
              className="picker-scan__input"
              placeholder="Ej. WATER_SM, JUICE_ORG..."
              autoComplete="off"
            />
            <button type="submit" className="primary-button">
              <span className="button-icon">✓</span>
              Registrar
            </button>
          </div>
          {feedback && (
            <div className="picker-scan__feedback">
              {feedback}
            </div>
          )}
        </form>
        
        <div className="pick-view__trolleys-section">
          <h3 className="section-title">
            <span className="section-title__icon">■</span>
            Lista de Trolleys
          </h3>
          <div className="pick-view__trolleys">
            {trolleys.map((trolley) => {
              const totalItems = trolley.items.reduce((sum, item) => sum + item.qty, 0);
              const completedItems = trolley.items.reduce((sum, item) => {
                const remaining = pickProgress[trolley.id]?.[item.sku] ?? item.qty;
                return sum + (item.qty - remaining);
              }, 0);
              const isComplete = completedItems === totalItems;
              
              return (
                <div key={trolley.id} className={`trolley-card ${isComplete ? 'trolley-card--complete' : ''}`}>
                  <header className="trolley-card__header">
                    <div className="trolley-card__title-section">
                      <h3 className="trolley-card__id">{trolley.id}</h3>
                      <span className="trolley-card__mesa">
                        <span className="trolley-card__mesa-icon">►</span>
                        {trolley.mesa}
                      </span>
                    </div>
                    <div className="trolley-card__progress-info">
                      <span className="trolley-card__count">
                        {completedItems}/{totalItems}
                      </span>
                      {isComplete && <span className="trolley-card__complete-badge">✓</span>}
                    </div>
                  </header>
                  <div className="trolley-card__items">{renderItem(trolley)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickView;
