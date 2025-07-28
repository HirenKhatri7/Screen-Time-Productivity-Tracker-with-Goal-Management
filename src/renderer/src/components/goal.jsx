import React, { useState } from "react";
import { Plus, Target, Award, TrendingUp, Clock, Calendar, Edit2, Trash2, Circle, CheckCircle, ChevronDown } from "lucide-react";
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import Subtaskspanel from "./SubtasksPanel";
import TimeBreakDownPanel from "./TimeBreakdownPanel";
import DetailsPanel from "./DetailsPanel";
import LinkedApps from "./LinkedApps";




export default function Goal({ goal, progress, status, daysLeft, categoryColor, priorityColor, startEdit, handleDeleteGoal, toggleSubtask, handleCompleteGoal,handleUncompleteGoal }) {

    const [showSubTask, setShowSubTask] = useState(false)
    const [ShowDeleteModal,setShowDeleteModal] = useState(false)
    const [activeTab, setActiveTab] = useState('subtasks')
    const tabs = [
        { id: 'subtasks', label: 'Subtasks' },
        { id: 'timeBreakdown', label: 'Time Breakdown' },
        { id: 'details', label: 'Details' },
        { id: 'appLink', label: 'Linked Apps' }
    ];
    const convertInHHMM = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");

        return `${hours}h ${minutes}m`

    }

    return (
        <div className="p-5 bg-[#171B26] border border-[rgba(255,255,255,0.2)] rounded-xl w-full">

            <div className="flex items-center justify-between">
                <div className=" text-white flex items-center gap-2">
                    <button
                        onClick={() => {goal.isCompleted ? handleUncompleteGoal(goal.id) :  handleCompleteGoal(goal.id)}}
                        className={`flex-shrink-0 transition-colors ${goal.isCompleted ? 'text-green-400' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        {goal.isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <Circle className="w-5 h-5" />
                        )}
                    </button>
                    <span className="font-semibold">{goal.title}</span>
                </div>
                <div className="flex items-center space-x-2 top-0">
                    <button
                        onClick={() => startEdit(goal)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => {  setShowDeleteModal(true); }}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>




            <div className="flex items-center justify-center gap-6 text-gray-300 mb-2">
                <div className="text-center">
                    <p>Productive Time</p>
                    {goal.productiveTime > 0 ? <p>{convertInHHMM(goal.productiveTime)}</p> : <p>-</p>}
                </div>
                <div className="w-px h-10 bg-white/20"></div>
                <div className="text-center">
                    <p>focus Score</p>
                    {(goal.productiveTime + goal.unProductiveTime) > 0 ? <p >{Math.floor(((goal.productiveTime - goal.unProductiveTime) / (goal.productiveTime + goal.unProductiveTime)) * 100)}%</p> : <p>-</p>}
                </div>
            </div>

            <div className="mt-3 rounded-lg w-full">

                <div className="flex items-center justify-center rounded-lg  w-fit ">
                    {tabs.map((tab) => {
                        return (
                            <div className={`px-1 rounded-lg
                                    ${activeTab === tab.id ?
                                    '' :
                                    'border-0'
                                }`}>
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`  py-2 px-1 whitespace-nowrap font-medium text-sm
                                ${activeTab === tab.id ?
                                            'font-semibold border-b-2 text-white' :
                                            'border-0 text-gray-400'
                                        }
                                
                                `}>{tab.label}</button> </div>)
                    })}
                </div>
                <div className="mt-3 p-3 bg-[#23232A] rounded-lg min-h-58">
                    {activeTab === 'subtasks' && <Subtaskspanel subtasks={goal.subtasks} goalId={goal.id} toggleSubtask={toggleSubtask} />}
                    {activeTab === 'timeBreakdown' && <TimeBreakDownPanel appsUsed={goal.timeBreakDown} />}
                    {activeTab === 'details' && <DetailsPanel category={goal.category} priority={goal.priority} startDate={goal.startDate} endDate={goal.endDate} description={goal.description} />}
                    {activeTab === 'appLink' && <LinkedApps appLinks={goal.appLinks} />}

                </div>


            </div>
            {ShowDeleteModal &&  (
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
                onClick={() => {handleDeleteGoal(goal.id); setShowDeleteModal(false);}}
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