import type { Producto } from '../types';

/**
 * Catálogo de productos para catering aéreo
 * Incluye bebidas alcohólicas, no alcohólicas, snacks, duty-free, equipo de cabina y documentación
 */

export const productosData: Producto[] = [
  // ============================================
  // BEBIDAS ALCOHÓLICAS
  // ============================================
  {
    idProducto: "LIQU_1001",
    nombre: "Whisky Chivas Regal 12 años",
    marca: "Chivas",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 40,
    controlCalidad: {
      fillLevel: 100,
      sealStatus: "sellado",
      cleanlinessScore: 98,
      labelCondition: "excelente",
      inspectionDate: new Date().toISOString()
    },
    empaqueRequerido: "Caja de cartón reforzado",
    stockMinimo: 50,
    stockMaximo: 500,
    precio: 45.99,
    imagenUrl: "/images/chivas-12.jpg"
  },
  {
    idProducto: "LIQU_1002",
    nombre: "Vodka Absolut Original",
    marca: "Absolut",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 40,
    controlCalidad: {
      fillLevel: 100,
      sealStatus: "sellado",
      cleanlinessScore: 100,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja de cartón",
    stockMinimo: 60,
    stockMaximo: 600,
    precio: 28.99
  },
  {
    idProducto: "LIQU_1003",
    nombre: "Ron Bacardi Superior",
    marca: "Bacardi",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 37.5,
    controlCalidad: {
      fillLevel: 100,
      sealStatus: "sellado",
      cleanlinessScore: 97,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja de cartón",
    stockMinimo: 40,
    stockMaximo: 400,
    precio: 22.50
  },
  {
    idProducto: "LIQU_1004",
    nombre: "Gin Bombay Sapphire",
    marca: "Bombay",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 40,
    controlCalidad: {
      fillLevel: 100,
      sealStatus: "sellado",
      cleanlinessScore: 99,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja de cartón con divisores",
    stockMinimo: 30,
    stockMaximo: 300,
    precio: 35.99
  },
  {
    idProducto: "LIQU_1005",
    nombre: "Vino Tinto Cabernet Sauvignon",
    marca: "Concha y Toro",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 13.5,
    controlCalidad: {
      fillLevel: 100,
      sealStatus: "sellado",
      cleanlinessScore: 96,
      labelCondition: "bueno"
    },
    empaqueRequerido: "Caja especial para vinos",
    stockMinimo: 100,
    stockMaximo: 800,
    precio: 15.99
  },
  {
    idProducto: "LIQU_1006",
    nombre: "Champagne Moët & Chandon",
    marca: "Moët & Chandon",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 12,
    controlCalidad: {
      fillLevel: 100,
      sealStatus: "sellado",
      cleanlinessScore: 100,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja refrigerada con protección",
    stockMinimo: 20,
    stockMaximo: 200,
    precio: 65.00
  },
  {
    idProducto: "LIQU_1007",
    nombre: "Cerveza Heineken Premium Lager",
    marca: "Heineken",
    categoria: "BebidasAlcoholicas",
    tamano: 330,
    unidadMedida: "ml",
    gradosAlcohol: 5,
    controlCalidad: {
      fillLevel: 100,
      sealStatus: "sellado",
      cleanlinessScore: 100,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Paquete de 24 latas",
    stockMinimo: 500,
    stockMaximo: 3000,
    precio: 2.50
  },
  {
    idProducto: "LIQU_1008",
    nombre: "Tequila Jose Cuervo Especial",
    marca: "Jose Cuervo",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 38,
    controlCalidad: {
      fillLevel: 100,
      sealStatus: "sellado",
      cleanlinessScore: 98,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja de cartón",
    stockMinimo: 30,
    stockMaximo: 300,
    precio: 24.99
  },
  {
    idProducto: "LIQU_1009",
    nombre: "Whisky Jack Daniel's Tennessee",
    marca: "Jack Daniel's",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 40,
    controlCalidad: {
      fillLevel: 85,
      sealStatus: "abierto",
      cleanlinessScore: 92,
      labelCondition: "bueno"
    },
    empaqueRequerido: "Caja de cartón",
    stockMinimo: 40,
    stockMaximo: 400,
    precio: 38.99
  },
  {
    idProducto: "LIQU_1010",
    nombre: "Vodka Grey Goose",
    marca: "Grey Goose",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 40,
    controlCalidad: {
      fillLevel: 75,
      sealStatus: "abierto",
      cleanlinessScore: 88,
      labelCondition: "bueno"
    },
    empaqueRequerido: "Caja de cartón reforzado",
    stockMinimo: 35,
    stockMaximo: 350,
    precio: 42.99
  },
  {
    idProducto: "LIQU_1011",
    nombre: "Ron Zacapa Centenario 23",
    marca: "Zacapa",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 40,
    controlCalidad: {
      fillLevel: 60,
      sealStatus: "abierto",
      cleanlinessScore: 75,
      labelCondition: "deteriorado"
    },
    empaqueRequerido: "Caja especial premium",
    stockMinimo: 20,
    stockMaximo: 200,
    precio: 68.99
  },
  {
    idProducto: "LIQU_1012",
    nombre: "Gin Tanqueray London Dry",
    marca: "Tanqueray",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 43.1,
    controlCalidad: {
      fillLevel: 90,
      sealStatus: "sellado",
      cleanlinessScore: 95,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja de cartón con divisores",
    stockMinimo: 45,
    stockMaximo: 450,
    precio: 32.99
  },
  {
    idProducto: "LIQU_1013",
    nombre: "Vino Blanco Chardonnay",
    marca: "Casillero del Diablo",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 13,
    controlCalidad: {
      fillLevel: 55,
      sealStatus: "abierto",
      cleanlinessScore: 70,
      labelCondition: "bueno"
    },
    empaqueRequerido: "Caja para vinos con refrigeración",
    stockMinimo: 80,
    stockMaximo: 600,
    precio: 13.99
  },
  {
    idProducto: "LIQU_1014",
    nombre: "Prosecco Italiano",
    marca: "La Marca",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 11,
    controlCalidad: {
      fillLevel: 45,
      sealStatus: "abierto",
      cleanlinessScore: 65,
      labelCondition: "deteriorado"
    },
    empaqueRequerido: "Caja refrigerada",
    stockMinimo: 60,
    stockMaximo: 500,
    precio: 18.99
  },
  {
    idProducto: "LIQU_1015",
    nombre: "Cerveza Corona Extra",
    marca: "Corona",
    categoria: "BebidasAlcoholicas",
    tamano: 355,
    unidadMedida: "ml",
    gradosAlcohol: 4.6,
    controlCalidad: {
      fillLevel: 80,
      sealStatus: "abierto",
      cleanlinessScore: 85,
      labelCondition: "bueno"
    },
    empaqueRequerido: "Caja de 24 botellas",
    stockMinimo: 600,
    stockMaximo: 3500,
    precio: 2.75
  },
  {
    idProducto: "LIQU_1016",
    nombre: "Cerveza Stella Artois",
    marca: "Stella Artois",
    categoria: "BebidasAlcoholicas",
    tamano: 330,
    unidadMedida: "ml",
    gradosAlcohol: 5.2,
    controlCalidad: {
      fillLevel: 40,
      sealStatus: "abierto",
      cleanlinessScore: 60,
      labelCondition: "deteriorado"
    },
    empaqueRequerido: "Caja de 24 botellas",
    stockMinimo: 500,
    stockMaximo: 3000,
    precio: 2.90
  },
  {
    idProducto: "LIQU_1017",
    nombre: "Cognac Hennessy VS",
    marca: "Hennessy",
    categoria: "BebidasAlcoholicas",
    tamano: 700,
    unidadMedida: "ml",
    gradosAlcohol: 40,
    controlCalidad: {
      fillLevel: 95,
      sealStatus: "sellado",
      cleanlinessScore: 98,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja premium con protección",
    stockMinimo: 25,
    stockMaximo: 250,
    precio: 55.00
  },
  {
    idProducto: "LIQU_1018",
    nombre: "Brandy Carlos I",
    marca: "Carlos I",
    categoria: "BebidasAlcoholicas",
    tamano: 700,
    unidadMedida: "ml",
    gradosAlcohol: 36,
    controlCalidad: {
      fillLevel: 70,
      sealStatus: "abierto",
      cleanlinessScore: 80,
      labelCondition: "bueno"
    },
    empaqueRequerido: "Caja de cartón",
    stockMinimo: 30,
    stockMaximo: 300,
    precio: 28.50
  },
  {
    idProducto: "LIQU_1019",
    nombre: "Whisky Johnnie Walker Blue Label",
    marca: "Johnnie Walker",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 40,
    controlCalidad: {
      fillLevel: 100,
      sealStatus: "sellado",
      cleanlinessScore: 100,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja de lujo con certificado",
    stockMinimo: 10,
    stockMaximo: 100,
    precio: 195.00
  },
  {
    idProducto: "LIQU_1020",
    nombre: "Sake Dassai 50",
    marca: "Dassai",
    categoria: "BebidasAlcoholicas",
    tamano: 720,
    unidadMedida: "ml",
    gradosAlcohol: 15.5,
    controlCalidad: {
      fillLevel: 65,
      sealStatus: "abierto",
      cleanlinessScore: 78,
      labelCondition: "bueno"
    },
    empaqueRequerido: "Caja refrigerada especial",
    stockMinimo: 15,
    stockMaximo: 150,
    precio: 48.00
  },
  {
    idProducto: "LIQU_1021",
    nombre: "Whisky Glenfiddich 18 años",
    marca: "Glenfiddich",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 40,
    controlCalidad: {
      fillLevel: 100,
      sealStatus: "sellado",
      cleanlinessScore: 100,
      labelCondition: "excelente",
      inspectionDate: new Date().toISOString()
    },
    empaqueRequerido: "Caja de lujo con certificado",
    stockMinimo: 15,
    stockMaximo: 150,
    precio: 125.00
  },
  {
    idProducto: "LIQU_1022",
    nombre: "Vodka Belvedere Pure",
    marca: "Belvedere",
    categoria: "BebidasAlcoholicas",
    tamano: 700,
    unidadMedida: "ml",
    gradosAlcohol: 40,
    controlCalidad: {
      fillLevel: 92,
      sealStatus: "sellado",
      cleanlinessScore: 98,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja de cartón premium",
    stockMinimo: 25,
    stockMaximo: 250,
    precio: 47.50
  },
  {
    idProducto: "LIQU_1023",
    nombre: "Ron Diplomático Reserva",
    marca: "Diplomático",
    categoria: "BebidasAlcoholicas",
    tamano: 700,
    unidadMedida: "ml",
    gradosAlcohol: 40,
    controlCalidad: {
      fillLevel: 88,
      sealStatus: "sellado",
      cleanlinessScore: 95,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja premium",
    stockMinimo: 20,
    stockMaximo: 200,
    precio: 52.00
  },
  {
    idProducto: "LIQU_1024",
    nombre: "Gin Hendrick's",
    marca: "Hendrick's",
    categoria: "BebidasAlcoholicas",
    tamano: 700,
    unidadMedida: "ml",
    gradosAlcohol: 41.4,
    controlCalidad: {
      fillLevel: 78,
      sealStatus: "abierto",
      cleanlinessScore: 90,
      labelCondition: "bueno"
    },
    empaqueRequerido: "Caja con divisores",
    stockMinimo: 30,
    stockMaximo: 300,
    precio: 38.99
  },
  {
    idProducto: "LIQU_1025",
    nombre: "Tequila Patrón Silver",
    marca: "Patrón",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 40,
    controlCalidad: {
      fillLevel: 95,
      sealStatus: "sellado",
      cleanlinessScore: 99,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja de cartón reforzado",
    stockMinimo: 25,
    stockMaximo: 250,
    precio: 62.00
  },
  {
    idProducto: "LIQU_1026",
    nombre: "Vino Tinto Malbec Reserva",
    marca: "Catena Zapata",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 14,
    controlCalidad: {
      fillLevel: 100,
      sealStatus: "sellado",
      cleanlinessScore: 98,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja especial para vinos",
    stockMinimo: 70,
    stockMaximo: 500,
    precio: 28.50
  },
  {
    idProducto: "LIQU_1027",
    nombre: "Champagne Veuve Clicquot",
    marca: "Veuve Clicquot",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 12,
    controlCalidad: {
      fillLevel: 100,
      sealStatus: "sellado",
      cleanlinessScore: 100,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja refrigerada premium",
    stockMinimo: 15,
    stockMaximo: 150,
    precio: 78.00
  },
  {
    idProducto: "LIQU_1028",
    nombre: "Cerveza Guinness Draught",
    marca: "Guinness",
    categoria: "BebidasAlcoholicas",
    tamano: 440,
    unidadMedida: "ml",
    gradosAlcohol: 4.2,
    controlCalidad: {
      fillLevel: 100,
      sealStatus: "sellado",
      cleanlinessScore: 100,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja de 24 latas",
    stockMinimo: 400,
    stockMaximo: 2500,
    precio: 3.20
  },
  {
    idProducto: "LIQU_1029",
    nombre: "Whisky Macallan 12 años",
    marca: "Macallan",
    categoria: "BebidasAlcoholicas",
    tamano: 700,
    unidadMedida: "ml",
    gradosAlcohol: 40,
    controlCalidad: {
      fillLevel: 68,
      sealStatus: "abierto",
      cleanlinessScore: 82,
      labelCondition: "bueno"
    },
    empaqueRequerido: "Caja de lujo",
    stockMinimo: 20,
    stockMaximo: 200,
    precio: 89.00
  },
  {
    idProducto: "LIQU_1030",
    nombre: "Vodka Stolichnaya Premium",
    marca: "Stolichnaya",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 40,
    controlCalidad: {
      fillLevel: 55,
      sealStatus: "abierto",
      cleanlinessScore: 70,
      labelCondition: "deteriorado"
    },
    empaqueRequerido: "Caja de cartón",
    stockMinimo: 40,
    stockMaximo: 400,
    precio: 26.50
  },
  {
    idProducto: "LIQU_1031",
    nombre: "Ron Havana Club 7 años",
    marca: "Havana Club",
    categoria: "BebidasAlcoholicas",
    tamano: 700,
    unidadMedida: "ml",
    gradosAlcohol: 40,
    controlCalidad: {
      fillLevel: 82,
      sealStatus: "abierto",
      cleanlinessScore: 88,
      labelCondition: "bueno"
    },
    empaqueRequerido: "Caja de cartón",
    stockMinimo: 35,
    stockMaximo: 350,
    precio: 34.99
  },
  {
    idProducto: "LIQU_1032",
    nombre: "Gin Monkey 47",
    marca: "Monkey 47",
    categoria: "BebidasAlcoholicas",
    tamano: 500,
    unidadMedida: "ml",
    gradosAlcohol: 47,
    controlCalidad: {
      fillLevel: 100,
      sealStatus: "sellado",
      cleanlinessScore: 100,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja premium con certificado",
    stockMinimo: 10,
    stockMaximo: 100,
    precio: 72.00
  },
  {
    idProducto: "LIQU_1033",
    nombre: "Tequila Don Julio 1942",
    marca: "Don Julio",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 38,
    controlCalidad: {
      fillLevel: 58,
      sealStatus: "abierto",
      cleanlinessScore: 65,
      labelCondition: "deteriorado"
    },
    empaqueRequerido: "Caja de lujo",
    stockMinimo: 8,
    stockMaximo: 80,
    precio: 165.00
  },
  {
    idProducto: "LIQU_1034",
    nombre: "Vino Rosé Provence",
    marca: "Château d'Esclans",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 13,
    controlCalidad: {
      fillLevel: 72,
      sealStatus: "abierto",
      cleanlinessScore: 85,
      labelCondition: "bueno"
    },
    empaqueRequerido: "Caja refrigerada para vinos",
    stockMinimo: 50,
    stockMaximo: 400,
    precio: 22.50
  },
  {
    idProducto: "LIQU_1035",
    nombre: "Champagne Dom Pérignon",
    marca: "Dom Pérignon",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 12.5,
    controlCalidad: {
      fillLevel: 100,
      sealStatus: "sellado",
      cleanlinessScore: 100,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja de lujo refrigerada",
    stockMinimo: 5,
    stockMaximo: 50,
    precio: 195.00
  },
  {
    idProducto: "LIQU_1036",
    nombre: "Cerveza IPA Lagunitas",
    marca: "Lagunitas",
    categoria: "BebidasAlcoholicas",
    tamano: 355,
    unidadMedida: "ml",
    gradosAlcohol: 6.2,
    controlCalidad: {
      fillLevel: 90,
      sealStatus: "sellado",
      cleanlinessScore: 95,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja de 24 latas",
    stockMinimo: 300,
    stockMaximo: 2000,
    precio: 3.50
  },
  {
    idProducto: "LIQU_1037",
    nombre: "Whisky Jameson Irish",
    marca: "Jameson",
    categoria: "BebidasAlcoholicas",
    tamano: 700,
    unidadMedida: "ml",
    gradosAlcohol: 40,
    controlCalidad: {
      fillLevel: 48,
      sealStatus: "abierto",
      cleanlinessScore: 60,
      labelCondition: "deteriorado"
    },
    empaqueRequerido: "Caja de cartón",
    stockMinimo: 45,
    stockMaximo: 450,
    precio: 32.00
  },
  {
    idProducto: "LIQU_1038",
    nombre: "Vodka Ciroc Ultra Premium",
    marca: "Ciroc",
    categoria: "BebidasAlcoholicas",
    tamano: 750,
    unidadMedida: "ml",
    gradosAlcohol: 40,
    controlCalidad: {
      fillLevel: 100,
      sealStatus: "sellado",
      cleanlinessScore: 100,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja premium",
    stockMinimo: 20,
    stockMaximo: 200,
    precio: 45.00
  },
  {
    idProducto: "LIQU_1039",
    nombre: "Ron Appleton Estate 21 años",
    marca: "Appleton",
    categoria: "BebidasAlcoholicas",
    tamano: 700,
    unidadMedida: "ml",
    gradosAlcohol: 43,
    controlCalidad: {
      fillLevel: 64,
      sealStatus: "abierto",
      cleanlinessScore: 75,
      labelCondition: "bueno"
    },
    empaqueRequerido: "Caja de lujo",
    stockMinimo: 12,
    stockMaximo: 120,
    precio: 98.00
  },
  {
    idProducto: "LIQU_1040",
    nombre: "Gin Roku Japanese",
    marca: "Roku",
    categoria: "BebidasAlcoholicas",
    tamano: 700,
    unidadMedida: "ml",
    gradosAlcohol: 43,
    controlCalidad: {
      fillLevel: 96,
      sealStatus: "sellado",
      cleanlinessScore: 97,
      labelCondition: "excelente"
    },
    empaqueRequerido: "Caja premium japonesa",
    stockMinimo: 25,
    stockMaximo: 250,
    precio: 42.00
  },

  // ============================================
  // BEBIDAS NO ALCOHÓLICAS
  // ============================================
  {
    idProducto: "BEB_2001",
    nombre: "Agua Mineral Evian",
    marca: "Evian",
    categoria: "BebidasNoAlcoholicas",
    tamano: 500,
    unidadMedida: "ml",
    empaqueRequerido: "Paquete de 24 botellas",
    stockMinimo: 1000,
    stockMaximo: 5000,
    precio: 1.50
  },
  {
    idProducto: "BEB_2002",
    nombre: "Coca-Cola Regular",
    marca: "Coca-Cola",
    categoria: "BebidasNoAlcoholicas",
    tamano: 330,
    unidadMedida: "ml",
    empaqueRequerido: "Paquete de 24 latas",
    stockMinimo: 800,
    stockMaximo: 4000,
    precio: 1.25
  },
  {
    idProducto: "BEB_2003",
    nombre: "Jugo de Naranja Natural",
    marca: "Tropicana",
    categoria: "BebidasNoAlcoholicas",
    tamano: 200,
    unidadMedida: "ml",
    empaqueRequerido: "Caja con refrigeración",
    stockMinimo: 300,
    stockMaximo: 1500,
    precio: 2.00
  },
  {
    idProducto: "BEB_2004",
    nombre: "Café Espresso Nespresso",
    marca: "Nespresso",
    categoria: "BebidasNoAlcoholicas",
    tamano: 5,
    unidadMedida: "g",
    empaqueRequerido: "Caja de 50 cápsulas",
    stockMinimo: 200,
    stockMaximo: 1000,
    precio: 0.80
  },
  {
    idProducto: "BEB_2005",
    nombre: "Té Verde Lipton",
    marca: "Lipton",
    categoria: "BebidasNoAlcoholicas",
    tamano: 2,
    unidadMedida: "g",
    empaqueRequerido: "Caja de 100 bolsitas",
    stockMinimo: 150,
    stockMaximo: 800,
    precio: 0.50
  },

  // ============================================
  // SNACKS
  // ============================================
  {
    idProducto: "SNK_3001",
    nombre: "Mix de Nueces Premium",
    marca: "Planters",
    categoria: "Snacks",
    tamano: 50,
    unidadMedida: "g",
    empaqueRequerido: "Bolsa sellada individualmente",
    stockMinimo: 500,
    stockMaximo: 2500,
    precio: 3.50
  },
  {
    idProducto: "SNK_3002",
    nombre: "Pretzels Salados",
    marca: "Snyder's",
    categoria: "Snacks",
    tamano: 40,
    unidadMedida: "g",
    empaqueRequerido: "Bolsa sellada",
    stockMinimo: 600,
    stockMaximo: 3000,
    precio: 2.00
  },
  {
    idProducto: "SNK_3003",
    nombre: "Chocolate Lindt Excellence 70%",
    marca: "Lindt",
    categoria: "Snacks",
    tamano: 35,
    unidadMedida: "g",
    empaqueRequerido: "Empaque individual",
    stockMinimo: 400,
    stockMaximo: 2000,
    precio: 4.50
  },
  {
    idProducto: "SNK_3004",
    nombre: "Galletas Oreo Mini Pack",
    marca: "Oreo",
    categoria: "Snacks",
    tamano: 30,
    unidadMedida: "g",
    empaqueRequerido: "Paquete individual",
    stockMinimo: 700,
    stockMaximo: 3500,
    precio: 1.75
  },
  {
    idProducto: "SNK_3005",
    nombre: "Papas Fritas Pringles Original",
    marca: "Pringles",
    categoria: "Snacks",
    tamano: 40,
    unidadMedida: "g",
    empaqueRequerido: "Tubo individual",
    stockMinimo: 500,
    stockMaximo: 2500,
    precio: 2.50
  },

  // ============================================
  // DUTY-FREE (Artículos de venta)
  // ============================================
  {
    idProducto: "DTY_4001",
    nombre: "Perfume Chanel No. 5",
    marca: "Chanel",
    categoria: "DutyFree",
    tamano: 100,
    unidadMedida: "ml",
    empaqueRequerido: "Caja de lujo con seguridad",
    stockMinimo: 20,
    stockMaximo: 100,
    precio: 120.00
  },
  {
    idProducto: "DTY_4002",
    nombre: "Set de Cosméticos Estée Lauder",
    marca: "Estée Lauder",
    categoria: "DutyFree",
    tamano: 1,
    unidadMedida: "unidad",
    empaqueRequerido: "Caja sellada",
    stockMinimo: 15,
    stockMaximo: 75,
    precio: 85.00
  },
  {
    idProducto: "DTY_4003",
    nombre: "Reloj Casio G-Shock",
    marca: "Casio",
    categoria: "DutyFree",
    tamano: 1,
    unidadMedida: "unidad",
    empaqueRequerido: "Caja original con certificado",
    stockMinimo: 10,
    stockMaximo: 50,
    precio: 150.00
  },

  // ============================================
  // EQUIPO DE CABINA
  // ============================================
  {
    idProducto: "CAB_5001",
    nombre: "Set Cubiertos Plástico Biodegradable",
    marca: "EcoWare",
    categoria: "EquipoCabina",
    tamano: 1,
    unidadMedida: "unidad",
    empaqueRequerido: "Paquete sellado higiénico",
    stockMinimo: 2000,
    stockMaximo: 10000,
    precio: 0.50
  },
  {
    idProducto: "CAB_5002",
    nombre: "Servilletas de Papel Premium",
    marca: "Airways",
    categoria: "EquipoCabina",
    tamano: 1,
    unidadMedida: "unidad",
    empaqueRequerido: "Paquete de 100",
    stockMinimo: 1500,
    stockMaximo: 8000,
    precio: 0.15
  },
  {
    idProducto: "CAB_5003",
    nombre: "Vaso Plástico 250ml",
    marca: "AirSupply",
    categoria: "EquipoCabina",
    tamano: 250,
    unidadMedida: "ml",
    empaqueRequerido: "Paquete de 50",
    stockMinimo: 3000,
    stockMaximo: 15000,
    precio: 0.25
  },
  {
    idProducto: "CAB_5004",
    nombre: "Bandeja de Comida Desechable",
    marca: "SkyServe",
    categoria: "EquipoCabina",
    tamano: 1,
    unidadMedida: "unidad",
    empaqueRequerido: "Paquete de 25",
    stockMinimo: 1000,
    stockMaximo: 5000,
    precio: 1.20
  },
  {
    idProducto: "CAB_5005",
    nombre: "Audífonos Desechables",
    marca: "FlightAudio",
    categoria: "EquipoCabina",
    tamano: 1,
    unidadMedida: "unidad",
    empaqueRequerido: "Bolsa sellada individual",
    stockMinimo: 800,
    stockMaximo: 4000,
    precio: 2.00
  },
  {
    idProducto: "CAB_5006",
    nombre: "Kit de Higiene Personal",
    marca: "SkyComfort",
    categoria: "EquipoCabina",
    tamano: 1,
    unidadMedida: "unidad",
    empaqueRequerido: "Bolsa sellada",
    stockMinimo: 500,
    stockMaximo: 2500,
    precio: 3.50
  },
  {
    idProducto: "CAB_5007",
    nombre: "Manta de Viaje",
    marca: "CloudRest",
    categoria: "EquipoCabina",
    tamano: 1,
    unidadMedida: "unidad",
    empaqueRequerido: "Bolsa plástica sellada",
    stockMinimo: 300,
    stockMaximo: 1500,
    precio: 8.00
  },
  {
    idProducto: "CAB_5008",
    nombre: "Almohada de Cuello",
    marca: "TravelEase",
    categoria: "EquipoCabina",
    tamano: 1,
    unidadMedida: "unidad",
    empaqueRequerido: "Bolsa plástica sellada",
    stockMinimo: 200,
    stockMaximo: 1000,
    precio: 6.50
  }
];

/**
 * Función helper para obtener productos por categoría
 */
export function getProductosByCategoria(categoria: string): Producto[] {
  return productosData.filter(p => p.categoria === categoria);
}

/**
 * Función helper para obtener un producto por ID
 */
export function getProductoById(idProducto: string): Producto | undefined {
  return productosData.find(p => p.idProducto === idProducto);
}

/**
 * Función helper para obtener solo bebidas alcohólicas
 */
export function getBebidasAlcoholicas(): Producto[] {
  return productosData.filter(p => p.categoria === "BebidasAlcoholicas");
}

/**
 * Función para calcular el volumen total de alcohol en litros
 */
export function calcularVolumenTotalAlcohol(productos: Array<{ productoId: string; cantidad: number }>): number {
  let volumenTotal = 0;
  
  productos.forEach(({ productoId, cantidad }) => {
    const producto = getProductoById(productoId);
    if (producto?.categoria === "BebidasAlcoholicas") {
      const volumenEnLitros = producto.tamano / 1000; // Convertir ml a L
      volumenTotal += volumenEnLitros * cantidad;
    }
  });
  
  return Number(volumenTotal.toFixed(2));
}
