import { nanoid } from './nanoid.js';
import { DAYS, TIME_SLOTS } from './constants.js';
import { checkConflict } from './helpers.js';

/**
 * Basic Greedy Scheduler
 * 
 * Given a set of requirements (Subject, Faculty, Batch/Section, Hours per week),
 * it tries to allocate them to available rooms without conflicts.
 */
export function autoGenerateTimetable(requirements, rooms, existingAllotments = []) {
  const newAllotments = [];
  const allotments = [...existingAllotments];
  
  // A simple representation of what we need to schedule
  // requirements = [{ subjectId, facultyId, section, semester, hoursNeeded }, ...]

  for (const req of requirements) {
    let hoursScheduled = 0;
    
    // Try to schedule each hour required for this subject/faculty combo
    while (hoursScheduled < req.hoursNeeded) {
      let scheduled = false;

      // Try every day, every time slot
      for (const day of DAYS) {
        if (scheduled) break;
        
        for (let i = 0; i < TIME_SLOTS.length - 1; i++) {
          if (scheduled) break;
          
          const startTime = TIME_SLOTS[i];
          const endTime = TIME_SLOTS[i + 1];

          // Check if faculty is already busy at this time
          const facultyBusy = allotments.some(a => 
            a.facultyId === req.facultyId && 
            a.day === day && 
            a.startTime === startTime
          );

          // Check if batch (section + semester) is already busy
          const batchBusy = allotments.some(a => 
            a.section === req.section && 
            a.semester === req.semester &&
            a.day === day && 
            a.startTime === startTime
          );

          if (facultyBusy || batchBusy) continue;

          // Find an available room
          const availableRoom = rooms.find(room => {
            return !checkConflict(allotments, room.id, day, startTime, endTime, null);
          });

          if (availableRoom) {
            const newAllotment = {
              id: `allot-${nanoid(6)}`,
              roomId: availableRoom.id,
              subjectId: req.subjectId,
              facultyId: req.facultyId,
              day,
              startTime,
              endTime,
              semester: req.semester,
              section: req.section,
              canceledDates: []
            };

            newAllotments.push(newAllotment);
            allotments.push(newAllotment);
            hoursScheduled++;
            scheduled = true;
          }
        }
      }

      if (!scheduled) {
        console.warn(`Could not find a slot for requirement:`, req);
        break; // Can't schedule any more hours for this requirement
      }
    }
  }

  return newAllotments;
}
