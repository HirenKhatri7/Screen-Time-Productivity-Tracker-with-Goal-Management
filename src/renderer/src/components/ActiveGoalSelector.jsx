import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';

export default function ActiveGoalSelector({activeGoalId, setActiveGoalId,goals}) {


  const handleGoalChange = (event) => {
    const selectedId = event.target.value;
    setActiveGoalId(selectedId);
    
    // Send the ID to the main process. If 'none' is selected, send null.
    const idToSend = selectedId === 'none' ? null : selectedId;
    window.electron.ipcRenderer.send('set-active-goal', idToSend);
  };

  return (
    <div className="flex items-center gap-2 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 px-3 py-2">
      <Target className="w-5 h-5 text-purple-400" />
      <select
        value={activeGoalId}
        onChange={handleGoalChange}
        className="bg-transparent text-white text-sm focus:outline-none"
      >
        <option value="none" className="bg-slate-800">No Active Goal</option>
        {goals.map((goal) => (
          <option key={goal.id} value={goal.id} className="bg-slate-800">
            {goal.title}
          </option>
        ))}
      </select>
    </div>
  );
}