import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import type { Vuelo } from "../types/vuelos";

export async function getVuelos(): Promise<Vuelo[]> {
  const vuelosCol = collection(db, "vuelos");
  const vuelosSnapshot = await getDocs(vuelosCol);
  const vuelos: Vuelo[] = vuelosSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      numero_vuelo: data.numero_vuelo ?? '',
      qr_id: data.qr_id ?? '',
      tipo: data.tipo ?? 0,
      articulos: data.articulos ?? null
    };
  });
  return vuelos;
}