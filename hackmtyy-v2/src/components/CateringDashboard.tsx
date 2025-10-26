import React, { useEffect, useState } from 'react';
import type { Aerolinea, PedidoCatering, Producto } from '../types';
import { 
  getAllAerolineas, 
  getAllPedidosCatering, 
  validarPoliticasAlcohol,
  getProducto 
} from '../firebase/utils';

/**
 * Dashboard de gestión de pedidos de catering
 * Muestra aerolíneas, pedidos y valida políticas de alcohol
 */
export const CateringDashboard: React.FC = () => {
  const [aerolineas, setAerolineas] = useState<Aerolinea[]>([]);
  const [pedidos, setPedidos] = useState<PedidoCatering[]>([]);
  const [selectedPedido, setSelectedPedido] = useState<PedidoCatering | null>(null);
  const [validacion, setValidacion] = useState<{ valido: boolean; errores: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [aerolineasData, pedidosData] = await Promise.all([
        getAllAerolineas(),
        getAllPedidosCatering()
      ]);
      setAerolineas(aerolineasData);
      setPedidos(pedidosData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidarPedido = async (pedido: PedidoCatering) => {
    setSelectedPedido(pedido);
    const result = await validarPoliticasAlcohol(pedido);
    setValidacion(result);
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Cargando datos de Firebase...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🛫 Dashboard de Catering Aéreo</h1>

      {/* Sección de Aerolíneas */}
      <section style={{ marginBottom: '30px' }}>
        <h2>✈️ Aerolíneas Configuradas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
          {aerolineas.map(aerolinea => (
            <div key={aerolinea.codigo} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3>{aerolinea.nombre} ({aerolinea.codigo})</h3>
              <div style={{ fontSize: '14px' }}>
                <p><strong>Límite de alcohol:</strong> {aerolinea.politicasAlcohol.maxVolumenPorPasajero}L por pasajero</p>
                <p><strong>Empaque:</strong> {aerolinea.politicasAlcohol.requisitosEmpaque}</p>
                <p><strong>Destinos prohibidos:</strong> {aerolinea.politicasAlcohol.destinosProhibidos.join(', ') || 'Ninguno'}</p>
                <details style={{ marginTop: '10px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Documentación requerida</summary>
                  <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                    {aerolinea.politicasAlcohol.documentacionRequerida.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </details>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sección de Pedidos */}
      <section>
        <h2>📦 Pedidos de Catering</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {pedidos.map(pedido => {
            const aerolinea = aerolineas.find(a => a.codigo === pedido.aerolinea);
            const estadoColor = {
              'pendiente': '#ff9800',
              'en_preparacion': '#2196f3',
              'listo': '#4caf50',
              'despachado': '#9e9e9e'
            }[pedido.estado || 'pendiente'];

            return (
              <div key={pedido.idPedido} style={{
                border: '2px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#fff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>
                      Vuelo {pedido.vuelo} - {aerolinea?.nombre}
                    </h3>
                    <p style={{ margin: 0, color: '#666' }}>
                      {pedido.origen} → {pedido.destino} | {new Date(pedido.fecha).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    backgroundColor: estadoColor,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    {pedido.estado?.toUpperCase()}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <p><strong>Total ítems:</strong> {pedido.items.length}</p>
                    <p><strong>Volumen alcohol:</strong> {pedido.volumenTotalAlcohol}L</p>
                  </div>
                  <div>
                    <p><strong>Bebidas alcohólicas:</strong> {pedido.items.filter(i => i.categoria === 'BebidasAlcoholicas').length}</p>
                    <p><strong>Documentos:</strong> {pedido.documentosAdjuntos?.length || 0}</p>
                  </div>
                </div>

                <details style={{ marginTop: '10px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
                    Ver detalles de ítems ({pedido.items.length})
                  </summary>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f0f0f0' }}>
                        <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Producto</th>
                        <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Categoría</th>
                        <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>Cantidad</th>
                        <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>Alcohol</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedido.items.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.nombre}</td>
                          <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.categoria}</td>
                          <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>{item.cantidad}</td>
                          <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>
                            {item.contenidoAlcohol ? `${item.contenidoAlcohol}%` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>

                <button
                  onClick={() => handleValidarPedido(pedido)}
                  style={{
                    marginTop: '15px',
                    padding: '10px 20px',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🔍 Validar Políticas de Alcohol
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal de Validación */}
      {selectedPedido && validacion && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>
              {validacion.valido ? '✅ Validación Exitosa' : '❌ Validación Fallida'}
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Vuelo:</strong> {selectedPedido.vuelo}</p>
              <p><strong>Ruta:</strong> {selectedPedido.origen} → {selectedPedido.destino}</p>
              <p><strong>Volumen total de alcohol:</strong> {selectedPedido.volumenTotalAlcohol}L</p>
            </div>

            {validacion.valido ? (
              <div style={{
                padding: '15px',
                backgroundColor: '#e8f5e9',
                borderRadius: '4px',
                border: '1px solid #4caf50'
              }}>
                <p style={{ margin: 0, color: '#2e7d32' }}>
                  ✅ El pedido cumple con todas las políticas de alcohol de la aerolínea.
                </p>
              </div>
            ) : (
              <div style={{
                padding: '15px',
                backgroundColor: '#ffebee',
                borderRadius: '4px',
                border: '1px solid #f44336'
              }}>
                <p style={{ margin: '0 0 10px 0', color: '#c62828', fontWeight: 'bold' }}>
                  ⚠️ Se encontraron los siguientes problemas:
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#c62828' }}>
                  {validacion.errores.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedPedido(null);
                setValidacion(null);
              }}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CateringDashboard;
