import React, { useState, useEffect, useRef } from 'react';
import { X, MinusIcon } from 'lucide-react'; // For the close button

export default function Capsule() {
  const [goalName, setGoalName] = useState('No Active Goal');
  const [timeSpent, setTimeSpent] = useState(0);
  const [minimize, setMinimize] = useState(false)
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
    console.log(seconds);
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <>
      <div className='w-full h-6 bg-blue-500 flex items-center justify-between text-white' style={{ WebkitAppRegion: 'drag', userSelect: 'none' }}>
        <span className='ml-2 flex items-center  font-semibold text-xl'>{goalName}</span>
        <div className='flex items-center justify-center'>
          <button className='bg-transparent ' onClick={() => setMinimize(!minimize)} style={{ WebkitAppRegion: 'no-drag' }}><MinusIcon /></button>
          <button className='bg-transparent' onClick={handleQuit} style={{ WebkitAppRegion: 'no-drag' }}><X/></button>
        </div>
      </div>
      {minimize && <div className="bg-[var(--color-capsule)] text-white w-full h-auto flex items-center justify-center px-auto " style={{ WebkitAppRegion: 'drag', userSelect: 'none' }}>
        
          
          <span className="text-xl text-white font-mono tracking-wider">{formatTime(displayTime)}</span>
        
        
      </div>}
    </>

  );
}