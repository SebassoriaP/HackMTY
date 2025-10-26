import { FlightsDB } from "../types";

export const flightsDB: FlightsDB = {
  AM123: {
    trolleys: [
      {
        id: "T1",
        mesa: "Mesa A",
        items: [
          { sku: "WATER_SM", name: "Agua 250ml", qty: 10, alcohol: false },
          { sku: "JUICE_ORANGE", name: "Jugo Naranja", qty: 8, alcohol: false },
          { sku: "WHISKY_BLUE", name: "Whisky Blue", qty: 2, alcohol: true }
        ]
      },
      {
        id: "T2",
        mesa: "Mesa B",
        items: [
          { sku: "WATER_SM", name: "Agua 250ml", qty: 12, alcohol: false },
          { sku: "SNACK_CHIPS", name: "Papas", qty: 6, alcohol: false }
        ]
      }
    ]
  },
  LH204: {
    trolleys: [
      {
        id: "L1",
        mesa: "Mesa Central",
        items: [
          { sku: "COFFEE_POD", name: "Cápsulas Café", qty: 15, alcohol: false },
          { sku: "TEA_CLASSIC", name: "Té Clásico", qty: 12, alcohol: false },
          { sku: "BRANDY_RES", name: "Brandy Reserva", qty: 4, alcohol: true }
        ]
      },
      {
        id: "L2",
        mesa: "Mesa Fría",
        items: [
          { sku: "SANDWICH_CLUB", name: "Sandwich Club", qty: 10, alcohol: false },
          { sku: "SALAD_QUINOA", name: "Ensalada Quinoa", qty: 6, alcohol: false }
        ]
      }
    ]
  },
  AA450: {
    trolleys: [
      {
        id: "A1",
        mesa: "Mesa Internacional",
        items: [
          { sku: "WATER_LG", name: "Agua 500ml", qty: 20, alcohol: false },
          { sku: "SODA_COLA", name: "Refresco Cola", qty: 18, alcohol: false },
          { sku: "NUTS_MIX", name: "Mix de Nueces", qty: 12, alcohol: false }
        ]
      }
    ]
  }
};
