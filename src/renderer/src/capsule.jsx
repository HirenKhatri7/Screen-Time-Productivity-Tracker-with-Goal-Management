import React, { useState, useEffect,useRef } from 'react';
import { X } from 'lucide-react'; // For the close button

export default function Capsule() {
  const [goalName, setGoalName] = useState('No Active Goal');
  const [timeSpent, setTimeSpent] = useState(0);
  

  const [displayTime, setDisplayTime] = useState(0);
  const lastUpdateRef = useRef(Date.now());

  // On main process update, sync timeSpent, displayTime, and time-of-last-update
  useEffect(() => {
    const removeListener = window.electron.ipcRenderer.on(
      'update-capsule-data',
      (event, { goalName, timeSpent }) => {
        setGoalName(goalName);
        setTimeSpent(timeSpent);
        setDisplayTime(timeSpent);      // reset interpolated timer
        lastUpdateRef.current = Date.now();
      }
    );
    return () => removeListener();
  }, []);

  // Interpolated ticking every second
  useEffect(() => {

    const interval = setInterval(() => {
      setDisplayTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeSpent, goalName]);

  const handleQuit = () => {
    // Send a message to the main process to quit the app
    window.electron.ipcRenderer.send('quit-app');
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="bg-[var(--color-capsule)] text-white rounded-full w-full h-full flex items-center justify-between px-6 " style={{ WebkitAppRegion: 'drag' }}>
      <div className="flex flex-col">
        <span className="text-sm text-white font-bold truncate max-w-40">{goalName}</span>
        <span className="text-xl text-white font-mono tracking-wider">{formatTime(displayTime)}</span>
      </div>
      <button onClick={handleQuit} className="bg-red-500/50 hover:bg-red-500 rounded-full p-2 transition-colors" style={{ WebkitAppRegion: 'no-drag' }}>
        <X size={16} />
      </button>
    </div>
  );
}