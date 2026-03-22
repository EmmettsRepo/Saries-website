import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function submitBookingInquiry(data: Record<string, unknown>) {
  return addDoc(collection(db, "booking_inquiries"), {
    ...data,
    status: "new",
    createdAt: serverTimestamp(),
  });
}

export async function submitTourRequest(data: Record<string, unknown>) {
  return addDoc(collection(db, "tour_requests"), {
    ...data,
    status: "new",
    createdAt: serverTimestamp(),
  });
}
