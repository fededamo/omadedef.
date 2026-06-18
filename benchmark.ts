import { performance } from 'perf_hooks';

// Mocking firestore logic
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function setDoc(id: string, data: any) {
  // Simulate network latency for single write
  await sleep(20);
}

async function writeBatchCommit(size: number) {
  // Simulate network latency for batched write
  await sleep(30);
}

async function benchmark() {
  const NUM_TASKS = 50;

  // Baseline: N+1
  const startBaseline = performance.now();
  for (let i = 0; i < NUM_TASKS; i++) {
    await setDoc(`id-${i}`, { val: i });
  }
  const endBaseline = performance.now();
  const baselineTime = endBaseline - startBaseline;

  // Optimized: Batched
  const startBatched = performance.now();
  await writeBatchCommit(NUM_TASKS);
  const endBatched = performance.now();
  const batchedTime = endBatched - startBatched;

  console.log(`Baseline (N+1 writes): ${baselineTime.toFixed(2)}ms`);
  console.log(`Optimized (Batch write): ${batchedTime.toFixed(2)}ms`);
  console.log(`Improvement: ${(baselineTime / batchedTime).toFixed(2)}x faster`);
}

benchmark();
