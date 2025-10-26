import type { Aerolinea } from '../types';

/**
 * Datos de ejemplo de aerolíneas con sus políticas de alcohol
 * Incluye criterios específicos de control de calidad para Alcohol Bottle Handling
 */

export const aerolineasData: Aerolinea[] = [
  {
    codigo: "AA",
    nombre: "American Airlines",
    politicasAlcohol: {
      maxVolumenPorPasajero: 5.0,
      requisitosEmpaque: "Envases originales sellados con etiqueta legible",
      destinosProhibidos: ["IR", "SA", "KW", "AE"],
      documentacionRequerida: [
        "manifiesto de catering",
        "factura de exportación",
        "certificado de origen para bebidas premium"
      ],
      protocolosInventario: "Conteo diario de stock, auditoría mensual, registro digital con fotos",
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
    direccionOficinas: "4333 Amon Carter Blvd, Fort Worth, TX 76155, USA",
    tiposCabina: ["First", "Business", "Premium Economy", "Economy"]
  },
  {
    codigo: "EK",
    nombre: "Emirates",
    politicasAlcohol: {
      maxVolumenPorPasajero: 5.0,
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
          cleanlinessScoreMin: 80,
          labelCondition: ["excelente", "bueno"],
          permitirAgregacion: true
        },
        descartarVinosCervezasAbiertas: true
      }
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
          fillLevelMin: 88,
          sealStatus: ["sellado"],
          cleanlinessScoreMin: 92,
          labelCondition: ["excelente"]
        },
        rellenar: {
          fillLevelMin: 50,
          fillLevelMax: 87,
          sealStatus: ["abierto"],
          cleanlinessScoreMin: 75,
          labelCondition: ["excelente", "bueno"],
          permitirAgregacion: true
        },
        descartarVinosCervezasAbiertas: true
      }
    },
    direccionOficinas: "Presidente Riesco 5711, Las Condes, Santiago, Chile",
    tiposCabina: ["Premium Business", "Premium Economy", "Economy"]
  },
  {
    codigo: "BA",
    nombre: "British Airways",
    politicasAlcohol: {
      maxVolumenPorPasajero: 5,
      requisitosEmpaque: "Sellado en envase comercial original, no exceder 70% alcohol por volumen",
      destinosProhibidos: ["IR", "SA", "KW"],
      documentacionRequerida: [
        "Manifiesto de catering",
        "Certificado de conformidad UK",
        "Licencia de exportación (si aplica)"
      ],
      protocolosInventario: "Auditoría quincenal, control de lotes, trazabilidad completa",
      criteriosCalidad: {
        reutilizar: {
          fillLevelMin: 92,
          sealStatus: ["sellado"],
          cleanlinessScoreMin: 96,
          labelCondition: ["excelente"]
        },
        rellenar: {
          fillLevelMin: 65,
          fillLevelMax: 91,
          sealStatus: ["abierto"],
          cleanlinessScoreMin: 88,
          labelCondition: ["excelente", "bueno"],
          permitirAgregacion: false
        },
        descartarVinosCervezasAbiertas: true
      }
    },
    direccionOficinas: "Waterside, Harmondsworth, UB7 0GB, United Kingdom",
    tiposCabina: ["First", "Club World", "World Traveller Plus", "World Traveller"]
  },
  {
    codigo: "LH",
    nombre: "Lufthansa",
    politicasAlcohol: {
      maxVolumenPorPasajero: 5,
      requisitosEmpaque: "Embalaje original sellado conforme a regulaciones EU",
      destinosProhibidos: ["IR", "SA", "AF"],
      documentacionRequerida: [
        "Manifiesto de catering",
        "Certificado sanitario EU",
        "Documentación de transporte de mercancías"
      ],
      protocolosInventario: "Sistema digital de gestión, inventario continuo, control de calidad semanal",
      criteriosCalidad: {
        reutilizar: {
          fillLevelMin: 87,
          sealStatus: ["sellado"],
          cleanlinessScoreMin: 93,
          labelCondition: ["excelente", "bueno"]
        },
        rellenar: {
          fillLevelMin: 58,
          fillLevelMax: 86,
          sealStatus: ["abierto"],
          cleanlinessScoreMin: 82,
          labelCondition: ["excelente", "bueno"],
          permitirAgregacion: true
        },
        descartarVinosCervezasAbiertas: true
      }
    },
    direccionOficinas: "Flughafen Frankfurt, 60546 Frankfurt am Main, Germany",
    tiposCabina: ["First Class", "Business Class", "Premium Economy", "Economy Class"]
  },
  {
    codigo: "AF",
    nombre: "Air France",
    politicasAlcohol: {
      maxVolumenPorPasajero: 5,
      requisitosEmpaque: "Bouteilles scellées dans leur emballage d'origine",
      destinosProhibidos: ["IR", "SA", "LY", "SO"],
      documentacionRequerida: [
        "Manifeste de restauration",
        "Certificat sanitaire",
        "Documentation douanière"
      ],
      protocolosInventario: "Inventaire hebdomadaire, rotation des stocks, traçabilité des lots",
      criteriosCalidad: {
        reutilizar: {
          fillLevelMin: 90,
          sealStatus: ["sellado"],
          cleanlinessScoreMin: 94,
          labelCondition: ["excelente"]
        },
        rellenar: {
          fillLevelMin: 62,
          fillLevelMax: 89,
          sealStatus: ["abierto"],
          cleanlinessScoreMin: 85,
          labelCondition: ["excelente", "bueno"],
          permitirAgregacion: true
        },
        descartarVinosCervezasAbiertas: true
      }
    },
    direccionOficinas: "45 Rue de Paris, 95747 Roissy CDG, France",
    tiposCabina: ["La Première", "Business", "Premium Economy", "Economy"]
  }
];

/**
 * Función helper para obtener una aerolínea por código
 */
export function getAerolineaByCode(codigo: string): Aerolinea | undefined {
  return aerolineasData.find(a => a.codigo === codigo);
}

/**
 * Función helper para verificar si un destino permite alcohol
 */
export function destinoPermiteAlcohol(codigoAerolinea: string, codigoDestino: string): boolean {
  const aerolinea = getAerolineaByCode(codigoAerolinea);
  if (!aerolinea) return false;
  
  return !aerolinea.politicasAlcohol.destinosProhibidos.includes(codigoDestino);
}

/**
 * Lista de códigos de países donde el alcohol está prohibido o restringido
 * Basado en Wikipedia y regulaciones internacionales
 */
export const PAISES_SIN_ALCOHOL = {
  IR: "Irán",
  SA: "Arabia Saudita",
  KW: "Kuwait",
  LY: "Libia",
  AF: "Afganistán",
  PK: "Pakistán (restricciones parciales)",
  BD: "Bangladesh (restricciones)",
  SO: "Somalia",
  YE: "Yemen",
  MV: "Maldivas"
};
