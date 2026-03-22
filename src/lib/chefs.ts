import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface Chef {
  id: string;
  name: string;
  email: string;
  specialty: string;
  bio: string;
  imageUrl: string;
  price: number;
  cuisines: string[];
  rating: number;
  available: boolean;
}

export async function getChefs(): Promise<Chef[]> {
  const snap = await getDocs(collection(db, "chefs"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Chef))
    .filter((c) => c.available !== false);
}

export async function getChefById(id: string): Promise<Chef | null> {
  const chefs = await getChefs();
  return chefs.find((c) => c.id === id) || null;
}

export interface ChefBooking {
  userId: string;
  userEmail: string;
  userName: string;
  chefId: string;
  chefName: string;
  chefEmail: string;
  eventDate: string;
  guestCount: number;
  eventType: string;
  dietaryNotes: string;
  status: "pending" | "confirmed" | "completed";
}

export async function submitChefBooking(data: Omit<ChefBooking, "status">) {
  return addDoc(collection(db, "chef_bookings"), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export async function getUserChefBookings(userId: string) {
  const snap = await getDocs(collection(db, "chef_bookings"));
  return snap.docs
    .filter((d) => d.data().userId === userId)
    .map((d) => ({ id: d.id, ...d.data() }));
}
