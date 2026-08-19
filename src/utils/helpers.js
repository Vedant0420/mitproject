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

export function checkConflict(allotments, roomId, day, startTime, endTime, excludeId = null) {
  return allotments.some(a => {
    if (a.id === excludeId) return false;
    if (a.roomId !== roomId || a.day !== day) return false;
    // overlap check
    return startTime < a.endTime && endTime > a.startTime;
  });
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
