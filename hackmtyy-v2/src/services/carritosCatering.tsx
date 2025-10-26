import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { Project } from "../types/carritosCatering";

// Obtener todos los carritos
export async function getAllCarritosCatering(): Promise<Project[]> {
  const carritosRef = collection(db, "carritosCatering");
  const snapshot = await getDocs(carritosRef);
  return snapshot.docs.map((doc) => ({ idPedido: doc.id, ...doc.data() } as Project));
}

// Buscar un carrito específico por su QR ID
export async function getCarritoByQRId(qrId: string): Promise<Project | null> {
  try {
    const carritosRef = collection(db, "carritosCatering");
    const q = query(carritosRef, where("qr_id", "==", qrId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    // Retornar el primer resultado
    const doc = snapshot.docs[0];
    return { idPedido: doc.id, ...doc.data() } as Project;
  } catch (error) {
    console.error("Error al buscar carrito por QR:", error);
    throw error;
  }
}