import type { AerolineaExtendida } from '../types';

/**
 * Aerolíneas con políticas extendidas para manejo de botellas devueltas
 * Incluye reglas para REUTILIZAR, RELLENAR y DESECHAR botellas parcialmente llenas
 */

export const aerolineasConPoliticasBotellas: AerolineaExtendida[] = [
  {
    codigo: "AA",
    nombre: "American Airlines",
    politicasAlcohol: {
      maxVolumenPorPasajero: 5,
      requisitosEmpaque: "Envases originales sellados según FAA",
      destinosProhibidos: ["IR", "SA"],
      documentacionRequerida: [
        "Manifiesto de catering",
        "Licencia de exportación de alcohol",
        "Certificado de origen"
      ],
      protocolosInventario: "Conteo diario de stock, auditoría mensual, FIFO (First In First Out)",
      criteriosCalidad: {
        reutilizar: {
          fillLevelMin: 90,
          sealStatus: ["sellado"],
          cleanlinessScoreMin: 95,
          labelCondition: ["excelente"]
        },
        rellenar: {
          fillLevelMin: 60,
          fillLevelMax: 89,
          sealStatus: ["abierto"],
          cleanlinessScoreMin: 85,
          labelCondition: ["excelente", "bueno"],
          permitirAgregacion: true
        },
        descartarVinosCervezasAbiertas: true
      }
    },
    politicasBotellas: {
      allowRefill: true,
      allowReuse: true,
      allowRefillAggregation: true,
      maxRefillAggregationBottles: 3,
      minPercentForReuse: 90,
      minPercentForRefill: 80,
      discardTypes: ["wine", "beer"],
      requireSealIntact: true,
      requireGoodLabel: true
    },
    direccionOficinas: "4333 Amon Carter Blvd, Fort Worth, TX 76155, USA",
    tiposCabina: ["First Class", "Business", "Premium Economy", "Main Cabin"]
  },
  {
    codigo: "EK",
    nombre: "Emirates",
    politicasAlcohol: {
      maxVolumenPorPasajero: 5,
      requisitosEmpaque: "Envase original sin abrir, etiquetado claro",
      destinosProhibidos: ["IR", "SA", "PK"],
      documentacionRequerida: [
        "Manifiesto de catering",
        "Certificado sanitario",
        "Documentación de aduana",
        "Licencia de importación (según destino)"
      ],
      protocolosInventario: "Auditorías mensuales, sistema de rastreo digital, control de temperatura",
      criteriosCalidad: {
        reutilizar: {
          fillLevelMin: 95,
          sealStatus: ["sellado"],
          cleanlinessScoreMin: 98,
          labelCondition: ["excelente"]
        },
        rellenar: {
          fillLevelMin: 75,
          fillLevelMax: 94,
          sealStatus: ["sellado"],
          cleanlinessScoreMin: 95,
          labelCondition: ["excelente"],
          permitirAgregacion: false
        },
        descartarVinosCervezasAbiertas: true
      }
    },
    politicasBotellas: {
      allowRefill: false, // Emirates no permite rellenar
      allowReuse: true,
      allowRefillAggregation: false, // No permite agregación
      maxRefillAggregationBottles: 1,
      minPercentForReuse: 95, // Más estricto
      minPercentForRefill: 100, // No aplica porque allowRefill=false
      discardTypes: ["wine", "beer"],
      requireSealIntact: true,
      requireGoodLabel: false // No requiere etiqueta perfecta
    },
    direccionOficinas: "Emirates Group Headquarters, Dubai, UAE",
    tiposCabina: ["First Class", "Business Class", "Economy Class"]
  },
  {
    codigo: "DL",
    nombre: "Delta Air Lines",
    politicasAlcohol: {
      maxVolumenPorPasajero: 5,
      requisitosEmpaque: "Botellas selladas en empaque de venta al por menor",
      destinosProhibidos: ["IR", "SA", "LY"],
      documentacionRequerida: [
        "Manifiesto de catering",
        "Declaración de mercancías peligrosas (si aplica)",
        "Factura comercial"
      ],
      protocolosInventario: "Inventario semanal, sistema automatizado de reorden, verificación de sellos",
      criteriosCalidad: {
        reutilizar: {
          fillLevelMin: 85,
          sealStatus: ["sellado"],
          cleanlinessScoreMin: 90,
          labelCondition: ["excelente", "bueno"]
        },
        rellenar: {
          fillLevelMin: 55,
          fillLevelMax: 84,
          sealStatus: ["abierto"],
          cleanlinessScoreMin: 85,
          labelCondition: ["excelente", "bueno"],
          permitirAgregacion: true
        },
        descartarVinosCervezasAbiertas: true
      }
    },
    politicasBotellas: {
      allowRefill: true,
      allowReuse: true,
      allowRefillAggregation: true,
      maxRefillAggregationBottles: 4, // Delta permite hasta 4 botellas
      minPercentForReuse: 85, // Menos estricto
      minPercentForRefill: 75,
      discardTypes: ["wine", "beer"],
      requireSealIntact: true,
      requireGoodLabel: true
    },
    direccionOficinas: "1030 Delta Blvd, Atlanta, GA 30354, USA",
    tiposCabina: ["Delta One", "First Class", "Comfort+", "Main Cabin"]
  },
  {
    codigo: "LA",
    nombre: "LATAM Airlines",
    politicasAlcohol: {
      maxVolumenPorPasajero: 5,
      requisitosEmpaque: "Envases originales sellados y etiquetados",
      destinosProhibidos: ["IR", "SA"],
      documentacionRequerida: [
        "Manifiesto de catering",
        "Certificado de origen",
        "Documentación aduanera"
      ],
      protocolosInventario: "Control diario, rotación FIFO, inspección de calidad semanal",
      criteriosCalidad: {
        reutilizar: {
          fillLevelMin: 92,
          sealStatus: ["sellado"],
          cleanlinessScoreMin: 93,
          labelCondition: ["excelente"]
        },
        rellenar: {
          fillLevelMin: 65,
          fillLevelMax: 91,
          sealStatus: ["abierto"],
          cleanlinessScoreMin: 88,
          labelCondition: ["excelente", "bueno"],
          permitirAgregacion: true
        },
        descartarVinosCervezasAbiertas: true
      }
    },
    politicasBotellas: {
      allowRefill: true,
      allowReuse: true,
      allowRefillAggregation: true,
      maxRefillAggregationBottles: 2,
      minPercentForReuse: 92,
      minPercentForRefill: 85,
      discardTypes: ["wine", "beer"],
      requireSealIntact: true,
      requireGoodLabel: true
    },
    direccionOficinas: "Presidente Riesco 5711, Las Condes, Santiago, Chile",
    tiposCabina: ["Premium Business", "Premium Economy", "Economy"]
  }
];

/**
 * Obtener aerolínea por código con políticas de botellas
 */
export function getAerolineaConPoliticasBotellas(codigo: string): AerolineaExtendida | undefined {
  return aerolineasConPoliticasBotellas.find(a => a.codigo === codigo);
}

/**
 * Validar si una aerolínea permite reutilización
 */
export function permiteReutilizar(codigoAerolinea: string): boolean {
  const aerolinea = getAerolineaConPoliticasBotellas(codigoAerolinea);
  return aerolinea?.politicasBotellas?.allowReuse ?? false;
}

/**
 * Validar si una aerolínea permite rellenar
 */
export function permiteRellenar(codigoAerolinea: string): boolean {
  const aerolinea = getAerolineaConPoliticasBotellas(codigoAerolinea);
  return aerolinea?.politicasBotellas?.allowRefill ?? false;
}

/**
 * Validar si una aerolínea permite agregación
 */
export function permiteAgregacion(codigoAerolinea: string): boolean {
  const aerolinea = getAerolineaConPoliticasBotellas(codigoAerolinea);
  return aerolinea?.politicasBotellas?.allowRefillAggregation ?? false;
}

/**
 * Obtener tipos de bebida que siempre se desechan
 */
export function getTiposADesechar(codigoAerolinea: string): string[] {
  const aerolinea = getAerolineaConPoliticasBotellas(codigoAerolinea);
  return aerolinea?.politicasBotellas?.discardTypes ?? ["wine", "beer"];
}

/**
 * Regla corporativa fija: vino y cerveza SIEMPRE se desechan
 */
export const TIPOS_DESECHAR_SIEMPRE = ["wine", "beer"];

/**
 * Descripción de políticas
 */
export const DESCRIPCIONES_POLITICAS = {
  allowRefill: "Permite rellenar botellas desde lote externo",
  allowReuse: "Permite reutilizar botellas sin rellenar",
  allowRefillAggregation: "Permite combinar botellas parciales para completar una botella",
  maxRefillAggregationBottles: "Número máximo de botellas que se pueden combinar",
  minPercentForReuse: "Porcentaje mínimo de contenido para reutilizar sin rellenar",
  minPercentForRefill: "Porcentaje mínimo de contenido para rellenar",
  discardTypes: "Tipos de bebida que SIEMPRE se desechan (wine, beer obligatorios)",
  requireSealIntact: "Requiere que el sello esté intacto",
  requireGoodLabel: "Requiere que la etiqueta esté en buen estado"
};
