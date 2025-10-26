/**
 * Dashboard principal para visualizar datos de catering desde Firebase
 */

import { useState } from "react";
import { useCateringContext } from "../context/CateringContext";
import { initializeFirebaseData } from "../firebase/initializeData";
import "../styles.css";

const CateringDashboard = () => {
  const { 
    aerolineas, 
    productos, 
    pedidos, 
    inventario,
    botellas,
    loading, 
    error,
    reloadData 
  } = useCateringContext();

  const [isInitializing, setIsInitializing] = useState(false);
  const [initMessage, setInitMessage] = useState("");

  // Función para inicializar/cargar datos a Firebase
  const handleInitializeData = async () => {
    const message = 
      '¿Estás seguro de que deseas cargar TODOS los datos en Firebase?\n\n' +
      'Se cargarán:\n' +
      '✈️  4 Aerolíneas (con políticas de alcohol y botellas)\n' +
      '📦 Productos (bebidas alcohólicas, snacks, etc.)\n' +
      '📊 Inventario (múltiples ubicaciones)\n' +
      '🛫 Pedidos de catering (varios vuelos)\n' +
      '🍾 Botellas devueltas (ejemplos de análisis)\n\n' +
      'ADVERTENCIA: Esto sobrescribirá datos existentes en Firebase.';
    
    if (!confirm(message)) {
      return;
    }

    setIsInitializing(true);
    setInitMessage("⏳ Cargando datos a Firebase... (ver consola para detalles)");

    try {
      await initializeFirebaseData();
      setInitMessage("✅ ¡Todos los datos han sido cargados exitosamente a Firebase! Recargando...");
      setTimeout(() => {
        reloadData();
        setInitMessage("");
      }, 2000);
    } catch (error) {
      console.error('Error al inicializar datos:', error);
      setInitMessage("❌ Error al cargar datos. Revisa la consola del navegador para más detalles.");
    } finally {
      setIsInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>⏳ Cargando datos desde Firebase...</h2>
        <p>Por favor espera mientras se cargan los datos del sistema de catering.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>❌ Error al cargar datos</h2>
        <p>{error}</p>
        <button onClick={reloadData} className="primary-button">
          Reintentar
        </button>
      </div>
    );
  }

  // Estadísticas
  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente').length;
  const pedidosEnPreparacion = pedidos.filter(p => p.estado === 'en_preparacion').length;
  const pedidosListos = pedidos.filter(p => p.estado === 'listo').length;
  
  const botellasReutilizar = botellas.filter(b => b.accionRecomendada === 'REUTILIZAR').length;
  const botellasRellenar = botellas.filter(b => b.accionRecomendada === 'RELLENAR').length;
  const botellasDesechar = botellas.filter(b => b.accionRecomendada === 'DESECHAR').length;

  return (
    <div className="catering-dashboard">
      <header className="dashboard-header">
        <h1>📊 Dashboard de Catering Aéreo</h1>
        <div className="dashboard-actions">
          <button onClick={reloadData} className="secondary-button">
            🔄 Recargar Datos
          </button>
          <button 
            onClick={handleInitializeData} 
            className="primary-button"
            disabled={isInitializing}
          >
            {isInitializing ? "⏳ Cargando..." : "📥 Cargar Datos a Firebase"}
          </button>
        </div>
      </header>

      {initMessage && (
        <div className={`init-message ${initMessage.includes('✅') ? 'success' : initMessage.includes('❌') ? 'error' : 'info'}`}>
          {initMessage}
        </div>
      )}

      {/* Alerta si no hay datos */}
      {aerolineas.length === 0 && productos.length === 0 && (
        <div className="init-message info">
          ℹ️ No hay datos en Firebase. Haz clic en "📥 Cargar Datos a Firebase" para inicializar el sistema con datos de ejemplo.
        </div>
      )}

      {/* Estadísticas generales */}
      <section className="dashboard-stats">
        <div className="stat-card">
          <h3>✈️ Aerolíneas</h3>
          <p className="stat-number">{aerolineas.length}</p>
        </div>
        <div className="stat-card">
          <h3>📦 Productos</h3>
          <p className="stat-number">{productos.length}</p>
        </div>
        <div className="stat-card">
          <h3>🛫 Pedidos</h3>
          <p className="stat-number">{pedidos.length}</p>
        </div>
        <div className="stat-card">
          <h3>📊 Inventario</h3>
          <p className="stat-number">{inventario.length}</p>
        </div>
        <div className="stat-card">
          <h3>🍾 Botellas</h3>
          <p className="stat-number">{botellas.length}</p>
        </div>
      </section>

      {/* Estado de pedidos */}
      <section className="dashboard-section">
        <h2>📋 Estado de Pedidos</h2>
        <div className="pedidos-status">
          <div className="status-item status-pending">
            <span className="status-label">Pendientes</span>
            <span className="status-value">{pedidosPendientes}</span>
          </div>
          <div className="status-item status-progress">
            <span className="status-label">En Preparación</span>
            <span className="status-value">{pedidosEnPreparacion}</span>
          </div>
          <div className="status-item status-ready">
            <span className="status-label">Listos</span>
            <span className="status-value">{pedidosListos}</span>
          </div>
        </div>
      </section>

      {/* Decisiones de botellas */}
      {botellas.length > 0 && (
        <section className="dashboard-section">
          <h2>🍾 Decisiones de Botellas Devueltas</h2>
          <div className="botellas-status">
            <div className="status-item status-reuse">
              <span className="status-label">Reutilizar</span>
              <span className="status-value">{botellasReutilizar}</span>
            </div>
            <div className="status-item status-refill">
              <span className="status-label">Rellenar</span>
              <span className="status-value">{botellasRellenar}</span>
            </div>
            <div className="status-item status-discard">
              <span className="status-label">Desechar</span>
              <span className="status-value">{botellasDesechar}</span>
            </div>
          </div>
        </section>
      )}

      {/* Lista de aerolíneas */}
      <section className="dashboard-section">
        <h2>✈️ Aerolíneas Activas</h2>
        <div className="airlines-grid">
          {aerolineas.map(aerolinea => (
            <div key={aerolinea.codigo} className="airline-card">
              <h3>{aerolinea.nombre}</h3>
              <p className="airline-code">Código: {aerolinea.codigo}</p>
              {aerolinea.politicasAlcohol && (
                <div className="airline-policies">
                  <p><strong>Políticas de Alcohol:</strong></p>
                  <p>Límite: {aerolinea.politicasAlcohol.maxVolumenPorPasajero}L</p>
                  {aerolinea.politicasAlcohol.destinosProhibidos && 
                   aerolinea.politicasAlcohol.destinosProhibidos.length > 0 && (
                    <p className="warning">
                      {aerolinea.politicasAlcohol.destinosProhibidos.length} destinos prohibidos
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Últimos pedidos */}
      <section className="dashboard-section">
        <h2>🛫 Últimos Pedidos</h2>
        <div className="pedidos-list">
          {pedidos.slice(0, 5).map(pedido => (
            <div key={pedido.idPedido} className="pedido-card">
              <div className="pedido-header">
                <h3>Vuelo {pedido.vuelo}</h3>
                <span className={`badge badge-${pedido.estado || 'pendiente'}`}>
                  {(pedido.estado || 'pendiente').replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="pedido-info">
                <p><strong>Ruta:</strong> {pedido.origen} → {pedido.destino}</p>
                <p><strong>Aerolínea:</strong> {pedido.aerolinea}</p>
                <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleDateString()}</p>
                <p><strong>Items:</strong> {pedido.items.length} productos</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CateringDashboard;
