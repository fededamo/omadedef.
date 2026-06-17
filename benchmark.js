const tasks = [];
const now = new Date();
for (let i = 0; i < 100000; i++) {
  const d = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000);
  tasks.push({
    id: i.toString(),
    completed: Math.random() > 0.5,
    updatedAt: d.toISOString()
  });
}

function original() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return tasks.filter(t => t.completed && t.updatedAt && new Date(t.updatedAt) < thirtyDaysAgo).map(t => t.id);
}

function optimized() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoMs = thirtyDaysAgo.getTime();
  return tasks.filter(t => t.completed && t.updatedAt && Date.parse(t.updatedAt) < thirtyDaysAgoMs).map(t => t.id);
}

function optimizedStringComp() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();
  return tasks.filter(t => t.completed && t.updatedAt && t.updatedAt < thirtyDaysAgoIso).map(t => t.id);
}

console.log("Warming up...");
original();
optimized();
optimizedStringComp();

console.log("Benchmarking original...");
const start1 = performance.now();
for (let i = 0; i < 50; i++) original();
const end1 = performance.now();
console.log("Original:", end1 - start1, "ms");

console.log("Benchmarking optimized (Date.parse)...");
const start2 = performance.now();
for (let i = 0; i < 50; i++) optimized();
const end2 = performance.now();
console.log("Optimized (Date.parse):", end2 - start2, "ms");

console.log("Benchmarking optimized (String comp)...");
const start3 = performance.now();
for (let i = 0; i < 50; i++) optimizedStringComp();
const end3 = performance.now();
console.log("Optimized (String comp):", end3 - start3, "ms");
