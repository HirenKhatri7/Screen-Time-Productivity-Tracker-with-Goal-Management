import React, { useState } from "react";
import { Flag,Pause,Users,Play,Plus, Target, Award, TrendingUp, Clock, Calendar, Edit2, Trash2, Circle, CheckCircle, ChevronDown } from "lucide-react";
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import Subtaskspanel from "./SubtasksPanel";
import TimeBreakDownPanel from "./TimeBreakdownPanel";
import DetailsPanel from "./DetailsPanel";
import LinkedApps from "./LinkedApps";




export default function Goal({ goal, progress, status, daysLeft, categoryColor, priorityColor, startEdit, handleDeleteGoal, toggleSubtask, handleCompleteGoal, handleUncompleteGoal,activeGoalId,setActiveGoalId }) {

    const [ShowDeleteModal, setShowDeleteModal] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')

    const completedSubtasks = goal.subtasks.filter(subtask => subtask.isCompleted).length;
    const totalTime = goal.productiveTime + goal.unProductiveTime;
    const productivePercentage = totalTime > 0 ? (goal.productiveTime / totalTime) * 100 : 0;
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");

        return `${hours}h ${minutes}m`

    }

    const handleActivateGoal = () => {
    setActiveGoalId(goal.id);
    console.log(activeGoalId);
    window.electron.ipcRenderer.send('set-active-goal', goal.id);
  };
      const handleUnActivateGoal = () => {
    setActiveGoalId('none');
    console.log(activeGoalId);
    window.electron.ipcRenderer.send('set-active-goal', null);
  };
      


    return (
        <div className={`bg-white rounded-lg shadow-sm border-2 transition-all ${goal.id === activeGoalId ? 'border-blue-500 shadow-md' : 'border-gray-200'
            } ${goal.isCompleted ? 'opacity-75' : ''} `}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className={`text-lg font-semibold ${goal.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {goal.title}
                            </h3>
                            {goal.id === activeGoalId && !goal.isCompleted && (
                                <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                                    Active
                                </span>
                            )}
                            {goal.isCompleted && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryColor.text} ${categoryColor.bg}`}>
                                {goal.category}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColor.text} ${priorityColor.bg}`}>
                                {goal.priority} priority
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => startEdit(goal)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {!goal.isCompleted && (
                        <>
                            {goal.id === activeGoalId  ? (
                                <button
                                    onClick={handleUnActivateGoal}
                                    className="flex items-center px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
                                >
                                    <Pause className="h-4 w-4 mr-2" />
                                    Set Inactive
                                </button>
                            ) : (
                                <button
                                    onClick={handleActivateGoal}
                                    className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                >
                                    <Play className="h-4 w-4 mr-2" />
                                    Set Active
                                </button>
                            )}
                        </>
                    )}
                    <button
                        onClick={() => {goal.isCompleted ? handleUncompleteGoal(goal.id) : handleCompleteGoal(goal.id)}}
                        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${goal.isCompleted
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                    >
                        {goal.isCompleted ? (
                            <>
                                <Circle className="h-4 w-4 mr-2" />
                                Mark Incomplete
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Complete
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex">
                    {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'subtasks', label: 'Subtasks' },
                        { id: 'breakdown', label: 'Time' },
                        { id: 'apps', label: 'Apps' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6 max-h-60 overflow-y-auto
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300">
                {activeTab === 'overview' && (
                    <div className="space-y-4">
                        <p className="text-gray-600 text-sm leading-relaxed">{goal.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>{goal.startDate} - {goal.endDate}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Users className="h-4 w-4 mr-2" />
                                <span>{completedSubtasks}/{goal.subtasks.length} tasks done</span>
                            </div>
                        </div>

                        {totalTime > 0 && (
                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">Productivity</span>
                                    <span className="font-medium">{Math.round(productivePercentage)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full transition-all"
                                        style={{ width: `${productivePercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'subtasks' && (
                    <div className="space-y-3">
                        {goal.subtasks.length > 0 ? (
                            goal.subtasks.map((subtask) => (
                                <div key={subtask.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <button
                                        onClick={() => toggleSubtask(goal.id,subtask.id)}
                                        className="mr-3"
                                    >
                                        {subtask.isCompleted ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <Circle className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                    <span className={`flex-1 ${subtask.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                        {subtask.title}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">No subtasks added yet</p>
                        )}
                    </div>
                )}

                {activeTab === 'breakdown' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <Clock className="h-4 w-4 text-green-600 mr-2" />
                                    <span className="text-sm font-medium text-green-600">Productive Time</span>
                                </div>
                                <p className="text-2xl font-bold text-green-700">{formatTime(goal.productiveTime)}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <Clock className="h-4 w-4 text-red-600 mr-2" />
                                    <span className="text-sm font-medium text-red-600">Unproductive Time</span>
                                </div>
                                <p className="text-2xl font-bold text-red-700">{formatTime(goal.unProductiveTime)}</p>
                            </div>
                        </div>
                        {totalTime > 0 && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <Flag className="h-4 w-4 text-blue-600 mr-2" />
                                    <span className="text-sm font-medium text-blue-600">Total Tracked Time</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-700">{formatTime(totalTime)}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'apps' && (
                    <div className="space-y-3">
                        {goal.appLinks.length > 0 ? (
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Linked Apps</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {goal.appLinks.map((appId) => (
                                        <div key={appId} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-md text-sm">
                                            {appId}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No apps linked to this goal</p>
                        )}
                    </div>
                )}
            </div>
            {ShowDeleteModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-8 border border-white/10 w-full max-w-md mx-4">


                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    {` Do you want to delete the goal ${goal.title} ?`}
                                </label>
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false)
                                }}
                                className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                            >
                                No
                            </button>
                            <button
                                onClick={() => { handleDeleteGoal(goal.id); setShowDeleteModal(false); }}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    )
}