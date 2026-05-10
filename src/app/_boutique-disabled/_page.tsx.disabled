import { notFound } from "next/navigation";
import { FEATURES } from "@/lib/featureFlags";
import BoutiquePageContent from "./BoutiquePageContent";

export default function BoutiquePage() {
  if (!FEATURES.BOUTIQUE) {
    notFound();
  }
  return <BoutiquePageContent />;
}
