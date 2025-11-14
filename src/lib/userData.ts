import { db } from "../firebase";
import {
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

export type SavedLine = {
  id: string;
  league: string;
  label: string;
  price?: string;
  createdAt?: number; // store ms epoch in the array item
};

// Idempotent add: uses savedLines array on the user doc, prevents duplicates
export async function addSavedLine(uid: string, line: SavedLine) {
  const ref = doc(db, "users", uid);

  const item = {
    ...line,
    createdAt: Date.now(),
  };

  const snap = await getDoc(ref);

  // If user doc doesn't exist yet, create it with the first saved line
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      createdAt: serverTimestamp(),
      savedLines: [item],
      lastSavedAt: serverTimestamp(),
    });
    return;
  }

  // If it exists, check for duplicate line.id
  const data = snap.data() as { savedLines?: SavedLine[] } | undefined;
  const existing = data?.savedLines || [];

  const alreadyThere = existing.some((l) => l.id === line.id);
  if (alreadyThere) {
    // Already saved – just bump lastSavedAt for analytics and bail
    await updateDoc(ref, {
      lastSavedAt: serverTimestamp(),
    });
    return;
  }

  // Push new item + update lastSavedAt
  await updateDoc(ref, {
    savedLines: arrayUnion(item),
    lastSavedAt: serverTimestamp(),
  });
}
