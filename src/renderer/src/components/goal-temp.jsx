import React, { useState } from "react";
import { Plus, Target, Award, TrendingUp, Clock, Calendar, Edit2, Trash2, Circle, CheckCircle, ChevronDown } from "lucide-react";
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';




export default function Goal({ goal, progress, status, daysLeft, categoryColor, priorityColor, startEdit, handleDeleteGoal, toggleSubtask }) {

    const [showSubTask, setShowSubTask] = useState(false)
    return (
        <div key={goal.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{goal.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border} border`}>
                            {goal.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor?.bg} ${priorityColor?.text}`}>
                            {goal.priority} priority
                        </span>
                    </div>
                    {goal.description && (
                        <p className="text-gray-400 mb-3">{goal.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(goal.startDate), 'MMM dd')} - {format(new Date(goal.endDate), 'MMM dd')}</span>
                        </span>
                        <span className={`font-medium ${status === 'completed' ? 'text-green-400' :
                            status === 'overdue' ? 'text-red-400' :
                                daysLeft <= 3 ? 'text-yellow-400' : 'text-gray-400'
                            }`}>
                            {status === 'completed' ? 'Completed' :
                                status === 'overdue' ? 'Overdue' :
                                    daysLeft === 0 ? 'Due today' :
                                        daysLeft === 1 ? '1 day left' :
                                            `${daysLeft} days left`}
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                        onClick={() => setShowSubTask(!showSubTask)}
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => startEdit(goal)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => { handleDeleteGoal(goal.id); }}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-sm font-medium text-white">{progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${progress === 100 ? 'bg-green-500' :
                            progress >= 75 ? 'bg-blue-500' :
                                progress >= 50 ? 'bg-yellow-500' :
                                    progress >= 25 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Subtasks */}
            {goal.subtasks.length > 0 && showSubTask && (
                <div className="space-y-2 ">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">
                        Subtasks ({goal.subtasks.filter(s => s.completed).length}/{goal.subtasks.length})
                    </h4>
                    {goal.subtasks.map(subtask => (
                        <div key={subtask.id} className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                            <button
                                onClick={() => toggleSubtask(goal.id, subtask.id)}
                                className={`flex-shrink-0 transition-colors ${subtask.completed ? 'text-green-400' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {subtask.completed ? (
                                    <CheckCircle className="w-5 h-5" />
                                ) : (
                                    <Circle className="w-5 h-5" />
                                )}
                            </button>
                            <span className={`flex-1 ${subtask.completed ? 'text-gray-400 line-through' : 'text-white'
                                }`}>
                                {subtask.title}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}