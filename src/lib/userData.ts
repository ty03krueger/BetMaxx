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

export async function addSavedLine(uid: string, line: SavedLine) {
  const ref = doc(db, "users", uid);

  // The item we store in the array: NO serverTimestamp() here
  const item = {
    ...line,
    createdAt: Date.now(),
  };

  // Ensure doc exists, then push the item and set a top-level server timestamp
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      createdAt: serverTimestamp(),
      savedLines: [item],
      lastSavedAt: serverTimestamp(),
    });
    return;
  }

  // For existing docs, arrayUnion + top-level server timestamp
  await updateDoc(ref, {
    savedLines: arrayUnion(item),
    lastSavedAt: serverTimestamp(),
  });
}
