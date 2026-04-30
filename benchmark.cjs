const { performance } = require('perf_hooks');

const categories = ['fruits', 'vegetables', 'herbs', 'trees', 'flowers', 'other'];
const locations = ['in-ground', 'container', 'greenhouse', 'indoor'];

const plants = Array.from({ length: 100000 }, (_, i) => ({
  id: i,
  category: categories[Math.floor(Math.random() * categories.length)],
  locationType: locations[Math.floor(Math.random() * locations.length)],
}));

function oldWay(filtered) {
  const byCategory = {
    fruits: [],
    vegetables: [],
    herbs: [],
    trees: [],
    flowers: [],
    other: [],
  };
  filtered.forEach(p => byCategory[p.category].push(p));

  const byLocation = {
    'in-ground': [],
    container: [],
    greenhouse: [],
    indoor: [],
  };
  filtered.forEach(p => byLocation[p.locationType].push(p));

  return { byCategory, byLocation };
}

function newWay(filtered) {
  const byCategory = {
    fruits: [],
    vegetables: [],
    herbs: [],
    trees: [],
    flowers: [],
    other: [],
  };
  const byLocation = {
    'in-ground': [],
    container: [],
    greenhouse: [],
    indoor: [],
  };

  filtered.forEach(p => {
    byCategory[p.category].push(p);
    byLocation[p.locationType].push(p);
  });

  return { byCategory, byLocation };
}

// Warmup
for (let i = 0; i < 10; i++) {
  oldWay(plants);
  newWay(plants);
}

const ITERATIONS = 100;

let start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  oldWay(plants);
}
const oldTime = performance.now() - start;

start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  newWay(plants);
}
const newTime = performance.now() - start;

console.log(`Old way: ${oldTime.toFixed(2)}ms`);
console.log(`New way: ${newTime.toFixed(2)}ms`);
console.log(`Improvement: ${((oldTime - newTime) / oldTime * 100).toFixed(2)}%`);
