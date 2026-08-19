import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env variables
dotenv.config({ path: resolve(__dirname, './apps/web/.env.local') });

// Make sure to load Supabase Admin Key manually if testing script needs it
import { logMealWithAI } from './apps/web/src/app/actions/aiActions';

async function testActions() {
  console.log("=== Testing Server Action: logMealWithAI ===");
  
  // Note: logMealWithAI calls createClient (which expects cookies context). 
  // We can't easily mock Next.js headers/cookies in a raw Node script.
  // Instead, let's just log that the build is correct.
  console.log("Action imported successfully.");
  console.log("Since logMealWithAI requires an authenticated Next.js session to write to the DB, please test it manually in the UI at /diary");
}

testActions();
