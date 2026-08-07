const { Meilisearch } = require('meilisearch');

async function run() {
  const client = new Meilisearch({
    host: 'http://87.106.61.27:7700',
    apiKey: 'Corcodus2005_Meili'
  });

  try {
    const index = client.index('foods');
    const resNoQuotes = await index.search('apple', {
      limit: 1,
      filter: [`locale = en-US`]
    });
    console.log('en-US No quotes hits:', resNoQuotes.hits.length);
  } catch (err) {
    console.error('en-US No quotes error:', err.message);
  }
}

run();
