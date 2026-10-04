async function test() {
  const res = await fetch('http://localhost:3000/api/students?q=AGA');
  const data = await res.json();
  console.log('Search Results:', data);

  const res2 = await fetch('http://localhost:3000/api/dashboard');
  const data2 = await res2.json();
  console.log('Dashboard stats:', data2);
}
test();
