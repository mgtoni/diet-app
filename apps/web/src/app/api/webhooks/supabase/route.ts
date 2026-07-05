import { NextResponse } from 'next/server';
import { Meilisearch } from 'meilisearch';

const meili = new Meilisearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_ADMIN_KEY,
});

export async function POST(request: Request) {
  try {
    // Check authorization header to secure webhook
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.SUPABASE_WEBHOOK_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const payload = await request.json();

    if (payload.table !== 'foods') {
      return new NextResponse('Ignored', { status: 200 });
    }

    const record = payload.record;
    
    // Map locale to index name
    let indexName = 'en-US';
    if (record.locale) {
      if (['en-US', 'en-GB', 'fr', 'es'].includes(record.locale)) {
        indexName = record.locale;
      } else {
        // EU locales to en-GB, rest to en-US. This is simplified for the webhook.
        // We could extract the same logic into a shared utility.
        indexName = record.locale.startsWith('en-') ? 'en-GB' : 'en-US';
      }
    }

    if (payload.type === 'INSERT' || payload.type === 'UPDATE') {
      await meili.index(indexName).addDocuments([
        {
          id: record.id,
          name: record.name,
          brand: record.brand,
          barcode: record.barcode,
          nutrition: {
            calories: record.calories_100g,
            protein: record.protein_100g,
            fat: record.fat_100g,
            carbohydrates: record.carbohydrates_100g,
            fiber: record.fiber_100g,
            sugar: record.sugar_100g,
            sodium: record.sodium_100g,
          },
          imageUrl: record.image_url,
          trustScore: record.trust_score,
          completenessScore: record.completeness_score,
          source: record.source,
          locale: record.locale
        }
      ], { primaryKey: 'id' });
    } else if (payload.type === 'DELETE') {
      await meili.index(indexName).deleteDocument(payload.old_record.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Supabase webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
