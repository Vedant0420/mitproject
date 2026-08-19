import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import './LiveDashboard.css';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export default function LiveDashboard() {
  const { rooms, allotments, subjects, faculty, updateAllotment } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update every min
    return () => clearInterval(timer);
  }, []);

  const currentDay = DAYS[currentTime.getDay()];
  const currentDateStr = currentTime.toLocaleDateString('en-CA'); // YYYY-MM-DD
  const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes();

  const handleCancel = async (allotment) => {
    if (confirm('Are you sure you want to cancel this class for today?')) {
      const canceledDates = allotment.canceledDates || [];
      if (!canceledDates.includes(currentDateStr)) {
        await updateAllotment(allotment.id, {
          ...allotment,
          canceledDates: [...canceledDates, currentDateStr]
        });
      }
    }
  };

  const getRoomLiveState = (room) => {
    // Find allotments for this room on the current day that are not canceled today
    const todaysAllotments = allotments.filter(a => 
      a.roomId === room.id && 
      a.day === currentDay && 
      !(a.canceledDates || []).includes(currentDateStr)
    );

    let activeAllotment = null;
    let state = 'Available'; // 'Available', 'Occupied', 'StartingSoon'

    for (const a of todaysAllotments) {
      const startMins = getMinutes(a.startTime);
      const endMins = getMinutes(a.endTime);

      if (currentMins >= startMins && currentMins < endMins) {
        state = 'Occupied';
        activeAllotment = a;
        break;
      } else if (currentMins >= startMins - 15 && currentMins < startMins) {
        state = 'StartingSoon';
        activeAllotment = a;
      }
    }

    return { state, activeAllotment };
  };

  return (
    <div className="fade-in live-dashboard">
      <div className="page-header">
        <h1>🔴 Live Dashboard</h1>
        <p>Real-time room occupancy & emergency management</p>
        <div className="live-clock">
          <Clock size={16} /> 
          {currentTime.toLocaleDateString()} — {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} ({currentDay})
        </div>
      </div>

      <div className="live-grid">
        {rooms.map(room => {
          const { state, activeAllotment } = getRoomLiveState(room);
          const sub = activeAllotment ? subjects.find(s => s.id === activeAllotment.subjectId) : null;
          const fac = activeAllotment ? faculty.find(f => f.id === activeAllotment.facultyId) : null;

          return (
            <div key={room.id} className={`card live-card state-${state.toLowerCase()}`}>
              <div className="live-card-header">
                <h3>{room.name}</h3>
                <span className={`live-badge badge-${state.toLowerCase()}`}>
                  {state === 'Available' && <CheckCircle size={14} />}
                  {state === 'Occupied' && <XCircle size={14} />}
                  {state === 'StartingSoon' && <AlertTriangle size={14} />}
                  {state.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              
              <div className="live-card-body">
                {activeAllotment ? (
                  <>
                    <div className="live-class-info">
                      <strong>{sub?.name || 'Unknown Subject'}</strong>
                      <div className="text-muted text-sm">{fac?.name || 'Unknown Faculty'}</div>
                      <div className="text-muted text-sm">{activeAllotment.startTime} - {activeAllotment.endTime}</div>
                      {activeAllotment.section && (
                        <div className="live-section">Section: {activeAllotment.section}</div>
                      )}
                    </div>
                    <button 
                      className="btn btn-danger btn-sm cancel-btn"
                      onClick={() => handleCancel(activeAllotment)}
                    >
                      Emergency Cancel
                    </button>
                  </>
                ) : (
                  <div className="live-free-state">
                    <p className="text-muted">Room is currently free.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
