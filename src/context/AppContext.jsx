import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { api } from '../utils/api.js';
import { supabase } from '../utils/supabaseClient.js';

const AppContext = createContext(null);

const initialState = {
  rooms:      [],
  faculty:    [],
  subjects:   [],
  allotments: [],
  loading:    false,
  error:      null,
  toasts:     [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':  return { ...state, loading: action.payload };
    case 'SET_ERROR':    return { ...state, error: action.payload, loading: false };
    case 'SET_ROOMS':    return { ...state, rooms: action.payload };
    case 'SET_FACULTY':  return { ...state, faculty: action.payload };
    case 'SET_SUBJECTS': return { ...state, subjects: action.payload };
    case 'SET_ALLOTMENTS': return { ...state, allotments: action.payload };
    case 'ADD_TOAST':    return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST': return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    default:             return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const toast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3500);
  }, []);

  const loadAll = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [rooms, faculty, subjects, allotments] = await Promise.all([
        api.rooms.getAll(),
        api.faculty.getAll(),
        api.subjects.getAll(),
        api.allotments.getAll(),
      ]);
      dispatch({ type: 'SET_ROOMS',      payload: rooms });
      dispatch({ type: 'SET_FACULTY',    payload: faculty });
      dispatch({ type: 'SET_SUBJECTS',   payload: subjects });
      dispatch({ type: 'SET_ALLOTMENTS', payload: allotments });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
      toast('Failed to connect to database.', 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [toast]);

  useEffect(() => {
    // Subscribe to all changes in the public schema
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('Real-time update received:', payload);
        loadAll();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAll]);

  // ── Rooms ──
  const createRoom = useCallback(async (data) => {
    const room = await api.rooms.create(data);
    dispatch({ type: 'SET_ROOMS', payload: [...state.rooms, room] });
    toast('Room added successfully!', 'success');
    return room;
  }, [state.rooms, toast]);

  const updateRoom = useCallback(async (id, data) => {
    const room = await api.rooms.update(id, data);
    dispatch({ type: 'SET_ROOMS', payload: state.rooms.map(r => r.id === id ? room : r) });
    toast('Room updated!', 'success');
    return room;
  }, [state.rooms, toast]);

  const deleteRoom = useCallback(async (id) => {
    await api.rooms.delete(id);
    dispatch({ type: 'SET_ROOMS', payload: state.rooms.filter(r => r.id !== id) });
    toast('Room deleted.', 'info');
  }, [state.rooms, toast]);

  // ── Faculty ──
  const createFaculty = useCallback(async (data) => {
    const fac = await api.faculty.create(data);
    dispatch({ type: 'SET_FACULTY', payload: [...state.faculty, fac] });
    toast('Faculty added!', 'success');
    return fac;
  }, [state.faculty, toast]);

  const updateFaculty = useCallback(async (id, data) => {
    const fac = await api.faculty.update(id, data);
    dispatch({ type: 'SET_FACULTY', payload: state.faculty.map(f => f.id === id ? fac : f) });
    toast('Faculty updated!', 'success');
  }, [state.faculty, toast]);

  const deleteFaculty = useCallback(async (id) => {
    await api.faculty.delete(id);
    dispatch({ type: 'SET_FACULTY', payload: state.faculty.filter(f => f.id !== id) });
    toast('Faculty removed.', 'info');
  }, [state.faculty, toast]);

  // ── Subjects ──
  const createSubject = useCallback(async (data) => {
    const sub = await api.subjects.create(data);
    dispatch({ type: 'SET_SUBJECTS', payload: [...state.subjects, sub] });
    toast('Subject added!', 'success');
    return sub;
  }, [state.subjects, toast]);

  const updateSubject = useCallback(async (id, data) => {
    const sub = await api.subjects.update(id, data);
    dispatch({ type: 'SET_SUBJECTS', payload: state.subjects.map(s => s.id === id ? sub : s) });
    toast('Subject updated!', 'success');
  }, [state.subjects, toast]);

  const deleteSubject = useCallback(async (id) => {
    await api.subjects.delete(id);
    dispatch({ type: 'SET_SUBJECTS', payload: state.subjects.filter(s => s.id !== id) });
    toast('Subject removed.', 'info');
  }, [state.subjects, toast]);

  // ── Allotments ──
  const createAllotment = useCallback(async (data) => {
    const allot = await api.allotments.create(data);
    dispatch({ type: 'SET_ALLOTMENTS', payload: [...state.allotments, allot] });
    toast('Allotment created!', 'success');
    return allot;
  }, [state.allotments, toast]);

  const updateAllotment = useCallback(async (id, data) => {
    const allot = await api.allotments.update(id, data);
    dispatch({ type: 'SET_ALLOTMENTS', payload: state.allotments.map(a => a.id === id ? allot : a) });
    toast('Allotment updated!', 'success');
  }, [state.allotments, toast]);

  const deleteAllotment = useCallback(async (id) => {
    await api.allotments.delete(id);
    dispatch({ type: 'SET_ALLOTMENTS', payload: state.allotments.filter(a => a.id !== id) });
    toast('Allotment removed.', 'info');
  }, [state.allotments, toast]);

  // ── Bulk Operations ──
  const bulkCreateRooms = useCallback(async (rooms) => {
    const created = await api.rooms.bulkCreate(rooms);
    dispatch({ type: 'SET_ROOMS', payload: [...state.rooms, ...created] });
    toast(`${created.length} rooms imported successfully!`, 'success');
  }, [state.rooms, toast]);

  const bulkCreateFaculty = useCallback(async (faculties) => {
    const created = await api.faculty.bulkCreate(faculties);
    dispatch({ type: 'SET_FACULTY', payload: [...state.faculty, ...created] });
    toast(`${created.length} faculty imported successfully!`, 'success');
  }, [state.faculty, toast]);

  const bulkCreateSubjects = useCallback(async (subs) => {
    const created = await api.subjects.bulkCreate(subs);
    dispatch({ type: 'SET_SUBJECTS', payload: [...state.subjects, ...created] });
    toast(`${created.length} subjects imported successfully!`, 'success');
  }, [state.subjects, toast]);

  const bulkCreateAllotments = useCallback(async (allots) => {
    const created = await api.allotments.bulkCreate(allots);
    dispatch({ type: 'SET_ALLOTMENTS', payload: [...state.allotments, ...created] });
    toast(`${created.length} allotments imported successfully!`, 'success');
  }, [state.allotments, toast]);

  return (
    <AppContext.Provider value={{
      ...state,
      loadAll,
      toast,
      createRoom, updateRoom, deleteRoom,
      createFaculty, updateFaculty, deleteFaculty,
      createSubject, updateSubject, deleteSubject,
      createAllotment, updateAllotment, deleteAllotment,
      bulkCreateRooms, bulkCreateFaculty, bulkCreateSubjects, bulkCreateAllotments
    }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
