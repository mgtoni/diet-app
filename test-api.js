async function test() {
  const query = 'apple';
  const url = `https://en.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'DietApp/1.0 (Integration)'
    }
  });
  console.log('Status en:', res.status);
}
test();
