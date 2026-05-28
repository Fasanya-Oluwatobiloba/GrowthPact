// lib/firestore.js
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, where, orderBy, limit,
  serverTimestamp, onSnapshot, increment, setDoc,
} from "firebase/firestore";
import { db, auth } from "./firebase";

const uid = () => auth.currentUser?.uid;

// ── USER ──────────────────────────────────────────────────────────
export const createUserDoc = async (userId, data) => {
  await setDoc(doc(db, "users", userId), {
    ...data,
    streak: 0,
    lastActive: null,
    level: 1,
    xp: 0,
    createdAt: serverTimestamp(),
  });
};

export const getUserDoc = async (userId) => {
  const snap = await getDoc(doc(db, "users", userId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateUserDoc = async (userId, data) => {
  await updateDoc(doc(db, "users", userId), data);
};

export const subscribeUser = (userId, callback) =>
  onSnapshot(doc(db, "users", userId), (snap) =>
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  );

// ── STREAK ───────────────────────────────────────────────────────
export const updateStreak = async (userId) => {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const now = new Date();
  const last = data.lastActive?.toDate?.();
  if (!last) {
    await updateDoc(userRef, { streak: 1, lastActive: serverTimestamp() });
    return;
  }
  const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) {
    await updateDoc(userRef, { streak: increment(1), lastActive: serverTimestamp() });
  } else if (diffDays > 1) {
    await updateDoc(userRef, { streak: 1, lastActive: serverTimestamp() });
  }
};

// ── TASKS (Today's Focus) ─────────────────────────────────────────
export const subscribeTodayTasks = (callback) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const q = query(
    collection(db, "users", uid(), "tasks"),
    where("date", ">=", today),
    orderBy("date", "asc")
  );
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};

export const addTask = async (label, category) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return addDoc(collection(db, "users", uid(), "tasks"), {
    label,
    category,
    done: false,
    date: today,
    createdAt: serverTimestamp(),
  });
};

export const toggleTask = async (taskId, done) => {
  await updateDoc(doc(db, "users", uid(), "tasks", taskId), { done: !done });
};

export const deleteTask = async (taskId) => {
  await deleteDoc(doc(db, "users", uid(), "tasks", taskId));
};

// ── GOALS ─────────────────────────────────────────────────────────
export const subscribeGoals = (callback) => {
  const q = query(
    collection(db, "users", uid(), "goals"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};

export const addGoal = async (data) => {
  return addDoc(collection(db, "users", uid(), "goals"), {
    ...data,
    progress: 0,
    createdAt: serverTimestamp(),
  });
};

export const updateGoal = async (goalId, data) => {
  await updateDoc(doc(db, "users", uid(), "goals", goalId), data);
};

export const deleteGoal = async (goalId) => {
  await deleteDoc(doc(db, "users", uid(), "goals", goalId));
};

// ── JOURNAL ENTRIES ───────────────────────────────────────────────
export const subscribeJournalEntries = (type, callback) => {
  const q = query(
    collection(db, "users", uid(), "journals"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) =>
    callback(
      snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((entry) => entry.type === type)
    )
  );
};

export const addJournalEntry = async (type, data) => {
  return addDoc(collection(db, "users", uid(), "journals"), {
    type,
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const updateJournalEntry = async (entryId, data) => {
  await updateDoc(doc(db, "users", uid(), "journals", entryId), data);
};

export const deleteJournalEntry = async (entryId) => {
  await deleteDoc(doc(db, "users", uid(), "journals", entryId));
};

// ── COMMUNITY POSTS ───────────────────────────────────────────────
export const subscribeCommunityPosts = (callback) => {
  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(30)
  );
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};

export const addPost = async (data) => {
  return addDoc(collection(db, "posts"), {
    ...data,
    authorId: uid(),
    likes: [],
    comments: [],
    createdAt: serverTimestamp(),
  });
};

export const toggleLike = async (postId, currentLikes) => {
  const u = uid();
  const liked = currentLikes.includes(u);
  await updateDoc(doc(db, "posts", postId), {
    likes: liked
      ? currentLikes.filter((id) => id !== u)
      : [...currentLikes, u],
  });
};

export const addComment = async (postId, text, authorName) => {
  const postRef = doc(db, "posts", postId);
  const snap = await getDoc(postRef);
  const comments = snap.data()?.comments || [];
  await updateDoc(postRef, {
    comments: [
      ...comments,
      { id: Date.now().toString(), text, authorId: uid(), authorName, createdAt: new Date().toISOString() },
    ],
  });
};

// ── BOOKS ─────────────────────────────────────────────────────────
export const subscribeBooks = (callback) => {
  const q = query(
    collection(db, "users", uid(), "books"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};

export const addBook = async (data) => {
  return addDoc(collection(db, "users", uid(), "books"), {
    ...data,
    currentChapter: 0,
    notes: [],
    createdAt: serverTimestamp(),
  });
};

export const updateBook = async (bookId, data) => {
  await updateDoc(doc(db, "users", uid(), "books", bookId), data);
};

// ── FINANCES ──────────────────────────────────────────────────────
export const subscribeExpenses = (callback) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const q = query(
    collection(db, "users", uid(), "expenses"),
    where("date", ">=", startOfMonth),
    orderBy("date", "desc")
  );
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
};

export const addExpense = async (data) => {
  return addDoc(collection(db, "users", uid(), "expenses"), {
    ...data,
    date: new Date(),
    createdAt: serverTimestamp(),
  });
};

export const getSavingsGoal = async () => {
  const snap = await getDoc(doc(db, "users", uid(), "settings", "finance"));
  return snap.exists() ? snap.data() : { monthlyGoal: 20000, saved: 0 };
};

export const updateSavingsGoal = async (data) => {
  await setDoc(doc(db, "users", uid(), "settings", "finance"), data, { merge: true });
};
