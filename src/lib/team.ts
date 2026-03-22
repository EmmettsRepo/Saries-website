import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  order: number;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const snap = await getDocs(collection(db, "team_members"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as TeamMember))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}
