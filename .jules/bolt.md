## 2024-05-15 - Fast ISO Date Filtering
**Learning:** Comparing ISO date strings directly (e.g., `str1 < str2`) is significantly faster than parsing them into `Date` objects inside array loops (`new Date(str1) < thirtyDaysAgo`). This avoids both object allocation and string parsing overhead in tight loops.
**Action:** When filtering arrays of objects by date where dates are stored as ISO strings, convert the threshold date to an ISO string outside the loop and use lexical string comparison inside the loop.

## 2025-03-03 - [Optimize Date Loop Parsing]

**Learning:** [Instantiating Date objects and calling methods inside an array `filter` loop on large datasets can cause performance issues. By evaluating loop invariants (like `thirtyDaysAgo`) outside of loops and comparing lexicographically sortable strings such as `toISOString()`, we save meaningful CPU time and GC overhead.]

**Action:** [Check all array iterating methods (filter, map, forEach) for operations that can be extracted to before the loop, especially operations related to object instantiation such as `new Date()`, and utilize ISO strings where possible for sortability and filtering.]
