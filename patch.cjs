const fs = require('fs');

// Patch useTasks.ts
let useTasksCode = fs.readFileSync('src/lib/useTasks.ts', 'utf8');
useTasksCode = useTasksCode.replace(
  `} as Category));`,
  `} as unknown as Category));`
);
fs.writeFileSync('src/lib/useTasks.ts', useTasksCode);

// Patch ErrorBoundary.tsx
let errorBoundaryCode = fs.readFileSync('src/components/ErrorBoundary.tsx', 'utf8');
errorBoundaryCode = errorBoundaryCode.replace(
  `export class ErrorBoundary extends Component<Props, State> {`,
  `export class ErrorBoundary extends React.Component<Props, State> {`
);
fs.writeFileSync('src/components/ErrorBoundary.tsx', errorBoundaryCode);
