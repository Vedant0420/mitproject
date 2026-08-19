// ── API Base ──────────────────────────────────────────
const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  if (res.status === 204) return null;
  return res.json();
}

// ── Rooms ─────────────────────────────────────────────
export const api = {
  rooms: {
    getAll: (params = '') => request(`/rooms${params}`),
    get:    (id)          => request(`/rooms/${id}`),
    create: (data)        => request('/rooms', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data)    => request(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id)          => request(`/rooms/${id}`, { method: 'DELETE' }),
  },
  faculty: {
    getAll: ()         => request('/faculty'),
    get:    (id)       => request(`/faculty/${id}`),
    create: (data)     => request('/faculty', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/faculty/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id)       => request(`/faculty/${id}`, { method: 'DELETE' }),
  },
  subjects: {
    getAll: ()         => request('/subjects'),
    get:    (id)       => request(`/subjects/${id}`),
    create: (data)     => request('/subjects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id)       => request(`/subjects/${id}`, { method: 'DELETE' }),
  },
  allotments: {
    getAll: ()         => request('/allotments'),
    get:    (id)       => request(`/allotments/${id}`),
    create: (data)     => request('/allotments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/allotments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id)       => request(`/allotments/${id}`, { method: 'DELETE' }),
  },
};
