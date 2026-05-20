/**
 * One-off cleanup script: wipe test/dev bookings from Firestore so the
 * production environment starts clean. Run AFTER switching to live Stripe keys.
 *
 *   cd timberline-estate/functions
 *   npx ts-node scripts/clear-test-data.ts --dry-run   # preview
 *   npx ts-node scripts/clear-test-data.ts --confirm   # actually delete
 *
 * Default mode is dry-run. The --confirm flag is required for deletion.
 *
 * Requires:
 *   - gcloud auth application-default login   (or GOOGLE_APPLICATION_CREDENTIALS pointing at a service account JSON)
 *   - GOOGLE_CLOUD_PROJECT=bakkers-website-847ba
 */
import * as admin from "firebase-admin";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "bakkers-website-847ba";
const COLLECTIONS = ["booking_inquiries", "tour_requests", "external_bookings", "chef_bookings"];

const args = new Set(process.argv.slice(2));
const dryRun = !args.has("--confirm");

async function main(): Promise<void> {
  admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();

  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Mode: ${dryRun ? "DRY RUN (no deletions)" : "DELETE"}`);
  console.log("");

  let grandTotal = 0;
  for (const col of COLLECTIONS) {
    const snap = await db.collection(col).get();
    console.log(`${col}: ${snap.size} document(s)`);
    grandTotal += snap.size;
    if (dryRun) {
      snap.docs.slice(0, 5).forEach((doc) => {
        const d = doc.data() as Record<string, unknown>;
        const summary = {
          id: doc.id,
          email: d.email,
          paymentStatus: d.paymentStatus,
          status: d.status,
          createdAt: d.createdAt,
        };
        console.log("  preview:", JSON.stringify(summary));
      });
      if (snap.size > 5) console.log(`  ... and ${snap.size - 5} more`);
    } else {
      // Batched delete (500 max per batch).
      const docs = snap.docs;
      for (let i = 0; i < docs.length; i += 400) {
        const batch = db.batch();
        docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      console.log(`  ✔ deleted ${snap.size}`);
    }
  }

  console.log("");
  console.log(`Total: ${grandTotal} document(s) ${dryRun ? "would be deleted" : "deleted"}`);
  if (dryRun) console.log("Run again with --confirm to actually delete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
