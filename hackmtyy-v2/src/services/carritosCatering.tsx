import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Project } from "../types/carritosCatering";

export async function getAllCarritosCatering(): Promise<Project[]> {
  const carritosRef = collection(db, "carritosCatering");
  const snapshot = await getDocs(carritosRef);
  return snapshot.docs.map((doc) => ({ idPedido: doc.id, ...doc.data() } as Project));
}