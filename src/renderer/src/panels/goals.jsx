import React, { useState,useEffect,useCallback } from "react";
import { Plus, Target, Award, TrendingUp, Clock, Calendar, Edit2, Trash2, Circle, CheckCircle,ChevronDown } from "lucide-react";
import { format, differenceInDays, isAfter, isBefore } from 'date-fns'
import Goal from "../components/goal";

export default function Goals({userName}) {
    const [goals, setGoals] = useState([])
    const [filter, setFilter] = useState("all")
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [editingGoal, setEditingGoal] = useState(null)
    const [showSubTask,setShowSubTask] = useState(false)

        const handleRefresh = useCallback(async () =>{
      const goalsData = await window.electron.ipcRenderer.invoke('get-goals');
      setGoals(goalsData);
    
      
    },[]);
    useEffect(() => {
    
    handleRefresh()
      }, [handleRefresh]);
    
    


    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'productivity',
        priority: 'medium',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        subtasks: []
    })

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: 'productivity',
            priority: 'low',
            startDate: format(new Date(), 'yyyy-MM-dd'),
            endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
            subtasks: []
        })
    }

    const handleCreateGoal = () => {
        if (!formData.title.trim()) return;

        const newGoal = {
            id: Date.now().toString(),
            title: formData.title,
            description: formData.description,
            category: formData.category,
            priority: formData.priority,
            startDate: formData.startDate,
            endDate: formData.endDate,
            subtasks: formData.subtasks.map(subtask => ({
                ...subtask,
                id: Date.now().toString() + Math.random(),
                createdAt: new Date().toISOString()
            })),
            createdAt: new Date().toISOString()
        };
        
        setGoals([...goals, newGoal]);
        resetForm();
        setShowCreateDialog(false);
        window.electron.ipcRenderer.send('add-goal',newGoal);
        
    };

    const handleUpdateGoal = () => {
        if (!editingGoal || !formData.title.trim()) return

        const updatedGoal = {
            ...editingGoal,
            title: formData.title,
            description: formData.description,
            category: formData.category,
            priority: formData.priority,
            startDate: formData.startDate,
            endDate: formData.endDate,
            subtasks: formData.subtasks.map(subtask => ({
                ...subtask,
                id: subtask.id || Date.now().toString() + Math.random(),
                createdAt: subtask.createdAt || new Date().toISOString()
            }))
        }

        setGoals(goals.map(goal => goal.id === editingGoal.id ? updatedGoal : goal))
        resetForm()
        setEditingGoal(null)
        setShowCreateDialog(false)
        window.electron.ipcRenderer.send('update-goal',updatedGoal);
    }
    const handleDeleteGoal = (goalId) => {
        if (confirm('Are you sure you want to delete this goal?')) {
            setGoals(goals.filter(goal => goal.id !== goalId))
        }
        window.electron.ipcRenderer.send('delete-goal',goalId)
    }

    const toggleSubtask = (goalId, subtaskId) => {
        setGoals(goals.map(goal => {
            if (goal.id === goalId) {
                return {
                    ...goal,
                    subtasks: goal.subtasks.map(subtask =>
                        subtask.id === subtaskId
                            ? { ...subtask, completed: !subtask.completed }
                            : subtask
                    )
                }
            }
            return goal
        }))
    }

    const addSubtask = () => {
        setFormData({
            ...formData,
            subtasks: [...formData.subtasks, { title: '', completed: false }]
        })
        
    }

    const updateSubtask = (index, title) => {
        const updatedSubtasks = [...formData.subtasks]
        updatedSubtasks[index] = { ...updatedSubtasks[index], title }
        setFormData({ ...formData, subtasks: updatedSubtasks })
        
    }

    const removeSubtask = (index) => {
        setFormData({
            ...formData,
            subtasks: formData.subtasks.filter((_, i) => i !== index)
        })
        
    }

    const startEdit = (goal) => {
        setEditingGoal(goal)
        setFormData({
            title: goal.title,
            description: goal.description,
            category: goal.category,
            priority: goal.priority,
            startDate: goal.startDate,
            endDate: goal.endDate,
            subtasks: goal.subtasks.map(({ title, completed, id, createdAt }) => ({ title, completed, id, createdAt }))
        })
        setShowCreateDialog(true)
    }

    const getProgress = (goal) => {
        if (goal.subtasks.length === 0) return 0
        const completed = goal.subtasks.filter(subtask => subtask.completed).length
        return Math.round((completed / goal.subtasks.length) * 100)
    }

    const getGoalStatus = (goal) => {
        const progress = getProgress(goal)
        const today = new Date()
        const endDate = new Date(goal.endDate)

        if (progress === 100) return 'completed'
        if (isAfter(today, endDate)) return 'overdue'
        return 'active'
    }

    const filteredGoals = goals.filter(goal => {
        if (filter === 'all') return true
        return getGoalStatus(goal) === filter
    })

    const categoryColors = {
        productivity: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
        health: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
        learning: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
        personal: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
        work: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
    }

    const priorityColors = {
        low: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
        medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
        high: { bg: 'bg-red-500/20', text: 'text-red-400' }
    }

    // Calculate stats
    const totalGoals = goals.length
    const completedGoals = goals.filter(goal => getGoalStatus(goal) === 'completed').length
    const activeGoals = goals.filter(goal => getGoalStatus(goal) === 'active').length
    const overdue = goals.filter(goal => getGoalStatus(goal) === 'overdue').length
    const averageProgress = goals.length > 0 ? Math.round(goals.reduce((sum, goal) => sum + getProgress(goal), 0) / goals.length) : 0

    return (
        <div className="space-y-8">
            <div>
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-white mb-2">{userName}'s Goals</h1>
                    <button className="bg-white/5 backdrop-blur-sm rounded-xl p-2" onClick={() => setShowCreateDialog(true)}>
                        <Plus className="text-white"></Plus>
                    </button>
                </div>
                <p className="text-gray-300">your goal analytics is displayed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 rounded-xl backdrop-blur-sm p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 bg-yellow-400/20 flex items-center justify-center rounded-xl">
                            <Target className=" w-6 h-6 text-yellow-400"></Target>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-white text-2xl">{totalGoals}</p>
                            <p className="text-gray-400">Total goals</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl backdrop-blur-sm p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 bg-green-400/20 flex items-center justify-center rounded-xl">
                            <Award className="text-green-400 w-6 h-6"></Award>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-white text-2xl">{completedGoals}</p>
                            <p className="text-gray-400">Completed</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl backdrop-blur-sm p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 bg-blue-400/20 flex items-center justify-center rounded-xl">
                            <TrendingUp className="text-blue-400 w-6 h-6"></TrendingUp>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-white text-2xl">{activeGoals}</p>
                            <p className="text-gray-400">Active</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl backdrop-blur-sm p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 bg-purple-400/20 flex items-center justify-center rounded-xl">
                            <Target className="text-purple-400 w-6 h-6"></Target>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-white text-2xl">{averageProgress}</p>
                            <p className="text-gray-400">Avg progress</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 w-fit">
                {[
                    { value: 'all', label: 'All Goals' },
                    { value: 'active', label: 'Active' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'overdue', label: 'Overdue' }
                ].map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => setFilter(value)}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${filter === value
                            ? 'bg-purple-500 text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}

                    >
                        {label}
                    </button>
                ))}
            </div>
            <div className="space-y-6">
                {filteredGoals.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
                        <Target className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {filter === 'all' ? 'No goals yet' : `No ${filter} goals`}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {filter === 'all'
                                ? 'Create your first goal to start tracking your progress'
                                : `You don't have any ${filter} goals at the moment`
                            }
                        </p>
                        {filter === 'all' && (
                            <button
                                onClick={() => {
                                    resetForm()
                                    setEditingGoal(null)
                                    setShowCreateDialog(true)
                                }}
                                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
                            >
                                Create Your First Goal
                            </button>
                        )}
                    </div>
                ) : (
                    filteredGoals.map(goal => {
                        const progress = getProgress(goal)
                        const status = getGoalStatus(goal)
                        const daysLeft = differenceInDays(new Date(goal.endDate), new Date())
                        const categoryColor = categoryColors[goal.category]
                        const priorityColor = priorityColors[goal.priority]


                        return (
                            <Goal goal={goal} status={status} progress={progress} daysLeft={daysLeft} categoryColor={categoryColor} priorityColor={priorityColor} startEdit={startEdit} handleDeleteGoal={handleDeleteGoal} toggleSubtask={toggleSubtask}/>
                        )
                    })
                )}
            </div>


            {showCreateDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-xl p-6 border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto ">
                        <h3 className="text-xl font-semibold text-white mb-6">Create New Goal</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">Goal Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                    placeholder="Enter your goal title"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                                <textarea
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full h-20 resize-none bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                    placeholder="Describe your goal (optional)"
                                />
                            </div>


                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">category</label>
                                    <select
                                        className="w-full bg-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400"
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        value={formData.category}
                                    >
                                        <option value="productivity" className="bg-white/10 text-black">Productivity</option>
                                        <option value="health" className="bg-white/10 text-black">Health</option>
                                        <option value="learning" className="bg-white/10 text-black">Learning</option>
                                        <option value="personal" className="bg-white/10 text-black">Personal</option>
                                        <option value="work" className="bg-white/10 text-black">Work</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">Priority</label>
                                    <select
                                        className="w-full bg-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400"
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        value={formData.priority}
                                    >
                                        <option value="low" className="bg-white/10 text-black">Low</option>
                                        <option value="medium" className="bg-white/10 text-black">Medium</option>
                                        <option value="high" className="bg-white/10 text-black">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full bg-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400"
                                    />
                                </div>

                                <div>
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">End Date</label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full bg-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-gray-300 text-sm font-medium">
                                        Subtasks
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addSubtask}
                                        className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Add Subtask</span>
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {formData.subtasks.map((subtask, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={subtask.title}
                                                onChange={(e) => updateSubtask(index, e.target.value)}
                                                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                                placeholder="Enter subtask"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeSubtask(index)}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowCreateDialog(false)
                                        setEditingGoal(null)
                                        resetForm()
                                    }}
                                    className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={editingGoal ? handleUpdateGoal : handleCreateGoal}


                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {editingGoal ? 'Update Goal' : 'Create Goal'}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )
            }


        </div >

    )
}