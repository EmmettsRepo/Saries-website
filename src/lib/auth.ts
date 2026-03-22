import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export type UserProfile = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: unknown;
};

export async function signUp(email: string, password: string, firstName: string, lastName: string, phone: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: `${firstName} ${lastName}` });

  await setDoc(doc(db, "users", cred.user.uid), {
    email,
    firstName,
    lastName,
    phone,
    createdAt: serverTimestamp(),
  });

  return cred.user;
}

export async function logIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logOut() {
  return signOut(auth);
}

export function onAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as UserProfile;
}

export async function updateUserProfile(uid: string, data: Partial<Omit<UserProfile, "uid" | "createdAt">>) {
  await updateDoc(doc(db, "users", uid), data);
}
