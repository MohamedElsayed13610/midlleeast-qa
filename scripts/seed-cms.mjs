// Server-side setup only. Never ship the service-role key to a browser.
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for this setup command only.');
const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const marker=await client.from('cms_setup').select('seeded_at').eq('id',true).single();
if(marker.error) throw new Error('Apply db/cms-schema.sql first.');
if(marker.data.seeded_at) throw new Error('Already initialized. Refusing to restore deleted content or overwrite edits.');
const seed=JSON.parse(await readFile(new URL('./cms-seed.json',import.meta.url),'utf8'));
// Retry-safe during initial provisioning; existing rows are never overwritten.
for(const [table,rows] of [['cms_team',seed.team],['cms_news',seed.news]]) {
  const {error}=await client.from(table).upsert(rows,{onConflict:'slug',ignoreDuplicates:true});
  if(error) throw new Error(`Initial ${table} seed failed (${error.code}).`);
}
const {error}=await client.from('cms_setup').update({seeded_at:new Date().toISOString()}).eq('id',true);
if(error) throw new Error(`Setup marker failed (${error.code}).`);
console.log(`Initialized ${seed.team.length} team members and ${seed.news.length} articles.`);
