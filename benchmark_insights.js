const tasks = [];
for (let i = 0; i < 100000; i++) {
  tasks.push({
    id: i,
    completed: true,
    updatedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7).toISOString()
  });
}

const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
}
const date = new Date();

function runBenchmark(name, fn) {
  const start = performance.now();
  const res = fn();
  const end = performance.now();
  console.log(`${name}: ${end - start}ms (found ${res.length})`);
}


runBenchmark('Current Insights', () => {
  return tasks.filter(t => t.completed && t.updatedAt && isSameDay(new Date(t.updatedAt), date));
});

const datePrefix = date.toISOString().split('T')[0];
runBenchmark('Optimized Insights (String match)', () => {
  return tasks.filter(t => t.completed && t.updatedAt && t.updatedAt.startsWith(datePrefix));
});
