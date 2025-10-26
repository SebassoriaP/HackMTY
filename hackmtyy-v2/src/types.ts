export type AlcoholDecisionOption = "tirar" | "reusar" | "mezclar";

export type Role = "PICK" | "PACK";

export interface Item {
  sku: string;
  name: string;
  qty: number;
  alcohol: boolean;
}

export interface Trolley {
  id: string;
  mesa: string;
  items: Item[];
}

export interface Flight {
  trolleys: Trolley[];
}

export type FlightsDB = Record<string, Flight>;
