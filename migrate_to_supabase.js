import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load env vars manually for node script
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function migrate() {
  console.log('Reading db.json...');
  const db = JSON.parse(fs.readFileSync('./db.json', 'utf8'));

  console.log(`Migrating ${db.rooms.length} rooms...`);
  const { error: roomErr } = await supabase.from('rooms').insert(db.rooms);
  if (roomErr) console.error('Rooms Error:', roomErr);

  console.log(`Migrating ${db.faculty.length} faculty...`);
  const { error: facErr } = await supabase.from('faculty').insert(db.faculty);
  if (facErr) console.error('Faculty Error:', facErr);

  console.log(`Migrating ${db.subjects.length} subjects...`);
  const { error: subErr } = await supabase.from('subjects').insert(db.subjects);
  if (subErr) console.error('Subjects Error:', subErr);

  console.log(`Migrating ${db.allotments.length} allotments...`);
  const { error: allotErr } = await supabase.from('allotments').insert(db.allotments);
  if (allotErr) console.error('Allotments Error:', allotErr);

  console.log('Migration Complete!');
}

migrate();
