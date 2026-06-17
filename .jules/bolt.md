## 2024-06-17 - [Optimized re-renders in large list with React.memo()]
**Learning:** `TaskItem` is rendered numerous times as it represents the fundamental list item for tasks. If the parent view component changes state (like filter, search, etc), all lists are re-rendered.
**Action:** Always consider memoizing complex leaf/list node components like `TaskItem` where appropriate since they typically only need to re-render when their individual props have actually changed. This reduces unnecessary re-renders when parent states change.
