## 2025-03-09 - Batch Writing for Firebase Firestore Tasks

**Learning:** When creating multiple elements in Firestore within loops, sequential `setDoc` or `addDoc` awaits create significant network and performance bottlenecks (N+1 issue).
**Action:** Use Firestore `writeBatch` combined with array map/reduce logic instead of loops to drastically speed up sequential writes, being sure to limit chunking to 500 documents per batch due to Firestore limits.
