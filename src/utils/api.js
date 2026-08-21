import { supabase } from './supabaseClient.js';

// Helper to handle Supabase responses
const handleResponse = ({ data, error }) => {
  if (error) {
    console.error('Supabase Error:', error);
    throw new Error(error.message);
  }
  return data;
};

// ── Rooms ─────────────────────────────────────────────
export const api = {
  rooms: {
    getAll: async () => {
      return handleResponse(await supabase.from('rooms').select('*').order('name'));
    },
    get: async (id) => {
      return handleResponse(await supabase.from('rooms').select('*').eq('id', id).single());
    },
    create: async (data) => {
      return handleResponse(await supabase.from('rooms').insert([data]).select().single());
    },
    bulkCreate: async (dataArray) => {
      return handleResponse(await supabase.from('rooms').insert(dataArray).select());
    },
    update: async (id, data) => {
      return handleResponse(await supabase.from('rooms').update(data).eq('id', id).select().single());
    },
    delete: async (id) => {
      return handleResponse(await supabase.from('rooms').delete().eq('id', id));
    },
  },
  faculty: {
    getAll: async () => {
      return handleResponse(await supabase.from('faculty').select('*').order('name'));
    },
    get: async (id) => {
      return handleResponse(await supabase.from('faculty').select('*').eq('id', id).single());
    },
    create: async (data) => {
      return handleResponse(await supabase.from('faculty').insert([data]).select().single());
    },
    bulkCreate: async (dataArray) => {
      return handleResponse(await supabase.from('faculty').insert(dataArray).select());
    },
    update: async (id, data) => {
      return handleResponse(await supabase.from('faculty').update(data).eq('id', id).select().single());
    },
    delete: async (id) => {
      return handleResponse(await supabase.from('faculty').delete().eq('id', id));
    },
  },
  subjects: {
    getAll: async () => {
      return handleResponse(await supabase.from('subjects').select('*').order('name'));
    },
    get: async (id) => {
      return handleResponse(await supabase.from('subjects').select('*').eq('id', id).single());
    },
    create: async (data) => {
      return handleResponse(await supabase.from('subjects').insert([data]).select().single());
    },
    bulkCreate: async (dataArray) => {
      return handleResponse(await supabase.from('subjects').insert(dataArray).select());
    },
    update: async (id, data) => {
      return handleResponse(await supabase.from('subjects').update(data).eq('id', id).select().single());
    },
    delete: async (id) => {
      return handleResponse(await supabase.from('subjects').delete().eq('id', id));
    },
  },
  allotments: {
    getAll: async () => {
      return handleResponse(await supabase.from('allotments').select('*'));
    },
    get: async (id) => {
      return handleResponse(await supabase.from('allotments').select('*').eq('id', id).single());
    },
    create: async (data) => {
      // In JS we used camelCase, in SQL we use snake_case for some columns if we created it that way. 
      // But let's check the AppContext. It expects JS objects. 
      // So if our DB uses camelCase (or if we just map it), we should be careful. 
      // Wait, in my proposed SQL schema I used `room_id`, `subject_id`, etc.
      // But our frontend uses `roomId`, `subjectId`, etc. 
      // It's MUCH easier to just make Supabase use camelCase columns to match our frontend perfectly!
      // I will update the SQL script to use double quotes around column names so they are camelCase in Postgres.
      return handleResponse(await supabase.from('allotments').insert([data]).select().single());
    },
    bulkCreate: async (dataArray) => {
      return handleResponse(await supabase.from('allotments').insert(dataArray).select());
    },
    update: async (id, data) => {
      return handleResponse(await supabase.from('allotments').update(data).eq('id', id).select().single());
    },
    delete: async (id) => {
      return handleResponse(await supabase.from('allotments').delete().eq('id', id));
    },
  },
};
