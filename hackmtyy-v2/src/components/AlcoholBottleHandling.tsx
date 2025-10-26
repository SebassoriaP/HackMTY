/**
 * Componente para el proceso de Alcohol Bottle Handling
 * Se ejecuta ANTES del proceso Pick para determinar qué hacer con cada botella de alcohol
 * basándose en los criterios de control de calidad de cada aerolínea
 */

import { useState, useEffect } from "react";
import { useCateringContext } from "../context/CateringContext";
import type { Producto, Aerolinea, AlcoholPolicy } from "../types";

type DecisionBotella = "REUTILIZAR" | "RELLENAR" | "DESECHAR" | "PENDIENTE";

interface BotellaAnalisis {
  producto: Producto;
  decision: DecisionBotella;
  razon: string;
  cumpleReutilizar: boolean;
  cumpleRellenar: boolean;
}

export default function AlcoholBottleHandling() {
  const { productos, aerolineas, loading } = useCateringContext();
  const [aerolineaSeleccionada, setAerolineaSeleccionada] = useState<string>("");
  const [botellasAnalisis, setBotellasAnalisis] = useState<BotellaAnalisis[]>([]);
  const [mostrarAprobadas, setMostrarAprobadas] = useState(true);

  const bebidasAlcoholicas = productos.filter(p => p.categoria === "BebidasAlcoholicas");

  useEffect(() => {
    if (aerolineaSeleccionada && aerolineas.length > 0) {
      analizarBotellas();
    }
  }, [aerolineaSeleccionada, productos, aerolineas]);

  const analizarBotellas = () => {
    const aerolinea = aerolineas.find(a => a.codigo === aerolineaSeleccionada);
    if (!aerolinea) return;

    const analisis = bebidasAlcoholicas.map(producto => 
      analizarBotella(producto, aerolinea.politicasAlcohol)
    );

    setBotellasAnalisis(analisis);
  };

  const analizarBotella = (producto: Producto, politica: AlcoholPolicy): BotellaAnalisis => {
    const qc = producto.controlCalidad;
    if (!qc) {
      return {
        producto,
        decision: "DESECHAR",
        razon: "Sin control de calidad registrado",
        cumpleReutilizar: false,
        cumpleRellenar: false
      };
    }

    const esVinoOCerveza = producto.nombre.toLowerCase().includes('vino') || 
                           producto.nombre.toLowerCase().includes('cerveza') ||
                           producto.nombre.toLowerCase().includes('prosecco') ||
                           producto.nombre.toLowerCase().includes('champagne');

    // Regla INAMOVIBLE: Vinos y cervezas abiertas se desechan
    if (esVinoOCerveza && qc.sealStatus === "abierto" && politica.criteriosCalidad.descartarVinosCervezasAbiertas) {
      return {
        producto,
        decision: "DESECHAR",
        razon: "⚠️ Política corporativa: Vinos/cervezas abiertas se desechan siempre",
        cumpleReutilizar: false,
        cumpleRellenar: false
      };
    }

    const criteriosReutilizar = politica.criteriosCalidad.reutilizar;
    const criteriosRellenar = politica.criteriosCalidad.rellenar;

    // Verificar si cumple criterios para REUTILIZAR
    const cumpleReutilizar = 
      (qc.fillLevel ?? 0) >= criteriosReutilizar.fillLevelMin &&
      criteriosReutilizar.sealStatus.includes(qc.sealStatus) &&
      (qc.cleanlinessScore ?? 0) >= criteriosReutilizar.cleanlinessScoreMin &&
      (qc.labelCondition ? criteriosReutilizar.labelCondition.includes(qc.labelCondition) : false);

    // Verificar si cumple criterios para RELLENAR
    const cumpleRellenar = 
      (qc.fillLevel ?? 0) >= criteriosRellenar.fillLevelMin &&
      (qc.fillLevel ?? 0) <= criteriosRellenar.fillLevelMax &&
      criteriosRellenar.sealStatus.includes(qc.sealStatus) &&
      (qc.cleanlinessScore ?? 0) >= criteriosRellenar.cleanlinessScoreMin &&
      (qc.labelCondition ? criteriosRellenar.labelCondition.includes(qc.labelCondition) : false);

    let decision: DecisionBotella = "DESECHAR";
    let razon = "";

    if (cumpleReutilizar) {
      decision = "REUTILIZAR";
      razon = `✅ Cumple todos los criterios de reutilización: Fill ${qc.fillLevel}% ≥ ${criteriosReutilizar.fillLevelMin}%, Limpieza ${qc.cleanlinessScore} ≥ ${criteriosReutilizar.cleanlinessScoreMin}`;
    } else if (cumpleRellenar) {
      decision = "RELLENAR";
      const metodo = criteriosRellenar.permitirAgregacion ? 
        "agregación de botellas o fuente externa" : 
        "fuente externa únicamente";
      razon = `🔄 Cumple criterios para rellenar (${metodo}): Fill ${qc.fillLevel}% en rango ${criteriosRellenar.fillLevelMin}-${criteriosRellenar.fillLevelMax}%`;
    } else {
      razon = `❌ No cumple criterios mínimos: Fill ${qc.fillLevel}% < ${criteriosReutilizar.fillLevelMin}% o Limpieza ${qc.cleanlinessScore} < ${criteriosRellenar.cleanlinessScoreMin}`;
    }

    return {
      producto,
      decision,
      razon,
      cumpleReutilizar,
      cumpleRellenar
    };
  };

  const estadisticas = {
    total: botellasAnalisis.length,
    reutilizar: botellasAnalisis.filter(b => b.decision === "REUTILIZAR").length,
    rellenar: botellasAnalisis.filter(b => b.decision === "RELLENAR").length,
    desechar: botellasAnalisis.filter(b => b.decision === "DESECHAR").length
  };

  const bottellasFiltradas = mostrarAprobadas 
    ? botellasAnalisis.filter(b => b.decision === "REUTILIZAR" || b.decision === "RELLENAR")
    : botellasAnalisis.filter(b => b.decision === "DESECHAR");

  if (loading) {
    return <div className="loading">⏳ Cargando datos...</div>;
  }

  return (
    <div className="alcohol-bottle-handling">
      <header className="handling-header">
        <h2>🍾 Alcohol Bottle Handling</h2>
        <p className="subtitle">Proceso de evaluación de botellas ANTES del Pick</p>
      </header>

      <section className="aerol inea-selector">
        <label htmlFor="aerolinea-select">Selecciona Aerolínea para aplicar sus criterios:</label>
        <select
          id="aerolinea-select"
          value={aerolineaSeleccionada}
          onChange={(e) => setAerolineaSeleccionada(e.target.value)}
          className="select-aerolinea"
        >
          <option value="">-- Selecciona una aerolínea --</option>
          {aerolineas.map(a => (
            <option key={a.codigo} value={a.codigo}>
              {a.nombre} ({a.codigo})
            </option>
          ))}
        </select>
      </section>

      {aerolineaSeleccionada && (
        <>
          <section className="criterios-display">
            <h3>📋 Criterios de {aerolineas.find(a => a.codigo === aerolineaSeleccionada)?.nombre}</h3>
            <div className="criterios-grid">
              <div className="criterio-card reutilizar">
                <h4>✅ REUTILIZAR</h4>
                <ul>
                  <li>Fill Level: ≥ {aerolineas.find(a => a.codigo === aerolineaSeleccionada)?.politicasAlcohol.criteriosCalidad.reutilizar.fillLevelMin}%</li>
                  <li>Sello: {aerolineas.find(a => a.codigo === aerolineaSeleccionada)?.politicasAlcohol.criteriosCalidad.reutilizar.sealStatus.join(", ")}</li>
                  <li>Limpieza: ≥ {aerolineas.find(a => a.codigo === aerolineaSeleccionada)?.politicasAlcohol.criteriosCalidad.reutilizar.cleanlinessScoreMin}</li>
                  <li>Etiqueta: {aerolineas.find(a => a.codigo === aerolineaSeleccionada)?.politicasAlcohol.criteriosCalidad.reutilizar.labelCondition.join(", ")}</li>
                </ul>
              </div>
              <div className="criterio-card rellenar">
                <h4>🔄 RELLENAR</h4>
                <ul>
                  <li>Fill Level: {aerolineas.find(a => a.codigo === aerolineaSeleccionada)?.politicasAlcohol.criteriosCalidad.rellenar.fillLevelMin}% - {aerolineas.find(a => a.codigo === aerolineaSeleccionada)?.politicasAlcohol.criteriosCalidad.rellenar.fillLevelMax}%</li>
                  <li>Sello: {aerolineas.find(a => a.codigo === aerolineaSeleccionada)?.politicasAlcohol.criteriosCalidad.rellenar.sealStatus.join(", ")}</li>
                  <li>Limpieza: ≥ {aerolineas.find(a => a.codigo === aerolineaSeleccionada)?.politicasAlcohol.criteriosCalidad.rellenar.cleanlinessScoreMin}</li>
                  <li>Agregación: {aerolineas.find(a => a.codigo === aerolineaSeleccionada)?.politicasAlcohol.criteriosCalidad.rellenar.permitirAgregacion ? "✅ Sí" : "❌ No"}</li>
                </ul>
              </div>
              <div className="criterio-card desechar">
                <h4>❌ DESECHAR</h4>
                <ul>
                  <li>No cumple criterios anteriores</li>
                  <li>⚠️ Vinos/Cervezas abiertas: SIEMPRE</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="estadisticas">
            <h3>📊 Resultado del Análisis</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-label">Total Analizado</span>
                <span className="stat-value">{estadisticas.total}</span>
              </div>
              <div className="stat-box aprobado">
                <span className="stat-label">✅ Reutilizar</span>
                <span className="stat-value">{estadisticas.reutilizar}</span>
              </div>
              <div className="stat-box rellenar">
                <span className="stat-label">🔄 Rellenar</span>
                <span className="stat-value">{estadisticas.rellenar}</span>
              </div>
              <div className="stat-box rechazado">
                <span className="stat-label">❌ Desechar</span>
                <span className="stat-value">{estadisticas.desechar}</span>
              </div>
            </div>
          </section>

          <section className="filtros">
            <button 
              className={`filter-btn ${mostrarAprobadas ? 'active' : ''}`}
              onClick={() => setMostrarAprobadas(true)}
            >
              ✅ Aprobadas ({estadisticas.reutilizar + estadisticas.rellenar})
            </button>
            <button 
              className={`filter-btn ${!mostrarAprobadas ? 'active' : ''}`}
              onClick={() => setMostrarAprobadas(false)}
            >
              ❌ Rechazadas ({estadisticas.desechar})
            </button>
          </section>

          <section className="botellas-list">
            <h3>{mostrarAprobadas ? "Botellas Aprobadas para Pick" : "Botellas Rechazadas"}</h3>
            <div className="botellas-grid">
              {bottellasFiltradas.map((analisis, index) => (
                <div key={index} className={`botella-card decision-${analisis.decision.toLowerCase()}`}>
                  <div className="botella-header">
                    <h4>{analisis.producto.nombre}</h4>
                    <span className={`badge-decision ${analisis.decision.toLowerCase()}`}>
                      {analisis.decision}
                    </span>
                  </div>
                  <div className="botella-details">
                    <p><strong>Marca:</strong> {analisis.producto.marca}</p>
                    <p><strong>Tamaño:</strong> {analisis.producto.tamano}{analisis.producto.unidadMedida}</p>
                    <p><strong>Alcohol:</strong> {analisis.producto.gradosAlcohol}%</p>
                  </div>
                  <div className="control-calidad">
                    <h5>Control de Calidad:</h5>
                    <ul>
                      <li>Fill Level: {analisis.producto.controlCalidad?.fillLevel}%</li>
                      <li>Sello: {analisis.producto.controlCalidad?.sealStatus}</li>
                      <li>Limpieza: {analisis.producto.controlCalidad?.cleanlinessScore}</li>
                      <li>Etiqueta: {analisis.producto.controlCalidad?.labelCondition}</li>
                    </ul>
                  </div>
                  <div className="razon">
                    <p>{analisis.razon}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
