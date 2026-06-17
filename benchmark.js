const tasks = [];
for (let i = 0; i < 100000; i++) {
  tasks.push({
    id: i,
    completed: true,
    updatedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 60).toISOString()
  });
}

function runBenchmark(name, fn) {
  const start = performance.now();
  const res = fn();
  const end = performance.now();
  console.log(`${name}: ${end - start}ms (found ${res.length})`);
}

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

runBenchmark('Current', () => {
  return tasks.filter(t => t.completed && t.updatedAt && new Date(t.updatedAt) < thirtyDaysAgo).map(t => t.id);
});

const thirtyDaysAgoTime = thirtyDaysAgo.getTime();
runBenchmark('Optimized', () => {
  return tasks.filter(t => t.completed && t.updatedAt && Date.parse(t.updatedAt) < thirtyDaysAgoTime).map(t => t.id);
});

// String comparison logic: since ISO format strings are lexicographically sortable
const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();
runBenchmark('Optimized (String comparison)', () => {
  return tasks.filter(t => t.completed && t.updatedAt && t.updatedAt < thirtyDaysAgoIso).map(t => t.id);
});
