const fs = require('fs');

// Re-apply to useTaskActions.ts
let useTaskActions = fs.readFileSync('src/lib/useTaskActions.ts', 'utf8');
useTaskActions = useTaskActions.replace(
  `const oldTaskIds = tasks.filter(t => t.completed && t.updatedAt && new Date(t.updatedAt) < thirtyDaysAgo).map(t => t.id);`,
  `const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();
      const oldTaskIds = tasks.filter(t => t.completed && t.updatedAt && t.updatedAt < thirtyDaysAgoIso).map(t => t.id);`
);
useTaskActions = useTaskActions.replace(
  `const oldTaskIds = tasks.filter(t => t.completed && t.updatedAt && new Date(t.updatedAt) < thirtyDaysAgo).map(t => t.id);`,
  `const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();
    const oldTaskIds = tasks.filter(t => t.completed && t.updatedAt && t.updatedAt < thirtyDaysAgoIso).map(t => t.id);`
);
fs.writeFileSync('src/lib/useTaskActions.ts', useTaskActions);

// Re-apply to SettingsModal.tsx
let settingsModal = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');
settingsModal = settingsModal.replace(
  `const oldTasks = tasks.filter(t => t.completed && t.updatedAt && new Date(t.updatedAt) < thirtyDaysAgo);`,
  `const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();
  const oldTasks = tasks.filter(t => t.completed && t.updatedAt && t.updatedAt < thirtyDaysAgoIso);`
);
fs.writeFileSync('src/components/SettingsModal.tsx', settingsModal);
