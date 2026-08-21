export const FLOORS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export const FLOOR_LABELS = {
  0: 'Ground Floor',
  1: '1st Floor',
  2: '2nd Floor',
  3: '3rd Floor',
  4: '4th Floor',
  5: '5th Floor',
  6: '6th Floor (Faculty)',
  7: '7th Floor',
  8: '8th Floor (Seminar Hall)',
};

// Floors 0, 6, 7, 8 are under development
export const UNDER_DEV_FLOORS = new Set([0, 6, 7, 8]);

export const ROOM_TYPES = [
  { value: 'classroom',    label: 'Classroom',    color: 'var(--color-classroom)' },
  { value: 'lab',          label: 'Lab',          color: 'var(--color-lab)' },
  { value: 'seminar_hall', label: 'Seminar Hall', color: 'var(--color-seminar)' },
  { value: 'faculty_cabin',label: 'Faculty Cabin',color: 'var(--color-faculty)' },
];

export const ROOM_STATUSES = [
  { value: 'available',   label: 'Available',   color: 'var(--teal)' },
  { value: 'occupied',    label: 'Occupied',    color: 'var(--rose)' },
  { value: 'maintenance', label: 'Maintenance', color: 'var(--amber)' },
];

export const FACILITIES = [
  'Projector', 'Whiteboard', 'AC', 'Computers', 'Mic',
  'Smart Board', 'CCTV', 'Wi-Fi', 'Power Outlets',
];

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

export const DEPARTMENTS = [
  'Computer Science', 'Electronics', 'Mathematics',
  'Physics', 'Civil Engineering', 'Mechanical Engineering',
  'Electrical Engineering', 'Information Technology',
];

export const SEMESTERS = [
  'Odd 2026', 'Even 2026', 'Odd 2025', 'Even 2025',
];
