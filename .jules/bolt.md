
## 2024-05-15 - Fast ISO Date Filtering
**Learning:** Comparing ISO date strings directly (e.g., `str1 < str2`) is significantly faster than parsing them into `Date` objects inside array loops (`new Date(str1) < thirtyDaysAgo`). This avoids both object allocation and string parsing overhead in tight loops.
**Action:** When filtering arrays of objects by date where dates are stored as ISO strings, convert the threshold date to an ISO string outside the loop and use lexical string comparison inside the loop.
