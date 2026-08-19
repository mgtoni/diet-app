export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { FoodService } from '@diet-app/core';
import { supabaseAdmin } from '@/utils/supabase/admin';

function getLocaleFromRequest(request: Request, searchParams: URLSearchParams): string {
  // 1. Prefer client's navigator.language sent via query param
  const queryLocale = searchParams.get('locale');
  if (queryLocale) return queryLocale;

  // 2. Fallback to Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (!acceptLanguage) return 'en-US';

  // Parse the first preferred language
  const primaryLang = acceptLanguage.split(',')[0].trim().split(';')[0];

  // Map to one of the 4 supported indices: en-US, en-GB, fr, es
  if (['en-US', 'en-GB', 'fr', 'es'].includes(primaryLang)) {
    return primaryLang;
  }

  // European Fallback logic
  const euLocales = ['ro-RO', 'de-DE', 'it-IT', 'pl-PL', 'nl-NL']; // Add others as needed
  if (euLocales.includes(primaryLang) || primaryLang.startsWith('en-') || primaryLang === 'en') {
    return 'en-GB'; // Default to UK CoFID for Europe/English variants
  }

  // Global Fallback
  return 'en-US';
}

export async function GET(request: Request) {
  // Initialize FoodService with the Next.js Supabase client
  const foodService = new FoodService(supabaseAdmin as any);

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing search query' } }, { status: 400 });
    }

    const locale = getLocaleFromRequest(request, searchParams);

    // FoodService handles the "Quality Waterfall" (Supabase -> Meilisearch -> OFF)
    const results = await foodService.search(query, locale);

    return NextResponse.json({ success: true, locale, data: results });
  } catch (error) {
    console.error('Error in food search API:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to search foods' } }, { status: 500 });
  }
}
