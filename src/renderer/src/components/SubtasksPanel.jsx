import React from "react";
import { CheckCircle,Circle } from "lucide-react";

export default function Subtaskspanel({ subtasks,goalId,toggleSubtask }) {

    if (subtasks.length == 0) {
        return <div className="flex items-center justify-center"> 
            <p className="text-white ">There are no subtasks</p>
        </div>
    }

    return (
        <div className="space-y-3 ">
            {subtasks.map((subtask) => {
                return (

                    <div key={subtask.id} className="flex items-center justify-start gap-3 py-2">
                        <button
                                onClick={() => toggleSubtask(goalId, subtask.id)}
                                className={`flex-shrink-0 transition-colors ${subtask.isCompleted ?'text-teal-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {subtask.isCompleted ? (
                                    <CheckCircle className="w-5 h-5" />
                                ) : (
                                    <Circle className="w-5 h-5" />
                                )}
                            </button>
                        <span className={`text-sm ${
                            subtask.completed 
                              ? 'text-gray-500 line-through' 
                              : 'text-gray-900'
                          }`}>
                            {subtask.title}
                          </span>
                    </div>

                )
            })}
        </div>
    )
}