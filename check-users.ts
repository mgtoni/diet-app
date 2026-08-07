import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('apps/web/.env.local') });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkUsers() {
  const { data, error } = await supabaseAdmin.from('profiles').select('*').limit(1);
  console.log('Profiles:', data);
  if (error) console.error('Error:', error);
}

checkUsers();
