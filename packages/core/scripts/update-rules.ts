import { Meilisearch } from 'meilisearch';

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://87.106.61.27:7700';

async function run() {
  const client = new Meilisearch({ host: MEILISEARCH_HOST });
  const index = client.index('foods');

  console.log('Updating ranking rules...');
  await index.updateSettings({
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'isOfficial:desc',
      'attribute',
      'completeness:desc',
      'exactness'
    ]
  });

  console.log('Settings updated!');
}
run().catch(console.error);
