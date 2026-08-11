require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('foods').select('*').ilike('name', '%chicken breast%').then(({data}) => {
    console.log('Supabase results:', data?.length);
    if(data) data.forEach(d => console.log(d.brand + ' - ' + d.name));
}).catch(console.error);
