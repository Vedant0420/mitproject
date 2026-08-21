import { nanoid } from './nanoid.js';

export function genId(prefix = 'id') {
  return `${prefix}-${nanoid(8)}`;
}

export function formatTime(time) {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12  = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function formatTimeRange(start, end) {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function checkConflict(allotments, roomId, facultyId, day, startTime, endTime, excludeId = null) {
  const overlap = allotments.find(a => {
    if (a.id === excludeId) return false;
    if (a.day !== day) return false;
    
    // Check if times overlap
    const timeOverlap = startTime < a.endTime && endTime > a.startTime;
    if (!timeOverlap) return false;

    // Check if same room or same faculty
    if (a.roomId === roomId) return true;
    if (a.facultyId === facultyId) return true;

    return false;
  });

  if (!overlap) return null;

  if (overlap.roomId === roomId) {
    return { type: 'room', message: 'Room is already occupied during this time.' };
  }
  if (overlap.facultyId === facultyId) {
    return { type: 'faculty', message: 'Faculty is already scheduled for another class at this time.' };
  }
  
  return { type: 'unknown', message: 'Time conflict detected.' };
}

export function getRoomTypeLabel(type) {
  const map = {
    classroom:    'Classroom',
    lab:          'Lab',
    seminar_hall: 'Seminar Hall',
    faculty_cabin:'Faculty Cabin',
  };
  return map[type] || type;
}

export function getRoomTypeColor(type) {
  const map = {
    classroom:    'var(--color-classroom)',
    lab:          'var(--color-lab)',
    seminar_hall: 'var(--color-seminar)',
    faculty_cabin:'var(--color-faculty)',
  };
  return map[type] || 'var(--text-muted)';
}

export function getStatusColor(status) {
  const map = {
    available:   'var(--teal)',
    occupied:    'var(--rose)',
    maintenance: 'var(--amber)',
  };
  return map[status] || 'var(--text-muted)';
}

export function dayShort(day) {
  return day.slice(0, 3);
}
