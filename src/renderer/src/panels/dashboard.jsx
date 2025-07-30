import React, { useState, useEffect, useCallback } from "react";
import { Clock, Activity, TrendingUp, Target, Eye, RotateCcwIcon, Delete, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format, startOfDay, subDays } from 'date-fns'
import ActiveGoalSelector from "../components/ActiveGoalSelector";


export default function Dashboard({ userName,activeGoalId, setActiveGoalId,goals,icons}) {

  const [usageData, setUsageData] = useState({})
  const [showDialog, setShowDialog] = useState(false)
  const [newAppName, setNewAppName] = useState('')
  const [newLimit, setNewLimit] = useState('')
  let recentApps;
  const [limits, setLimits] = useState({})

    const handleRefresh = useCallback(async () => {
    const data = await window.electron.ipcRenderer.invoke('get-usage');
    setUsageData(data);
  }, []);

      const getLimits = useCallback(async () => {
    const limitsArray = await window.electron.ipcRenderer.invoke('get-limits');
    const limitsObject = limitsArray.reduce((acc, item) => {
      acc[item.appName] = item.dailylimit;
      return acc;
    }, {});
    setLimits(limitsObject);
  }, []);

  useEffect(() => {

    handleRefresh()
    getLimits();

  }, [handleRefresh, getLimits]);


  const handleAddLimit = async () => {
    if (!newAppName || !newLimit) return;
    
    await window.electron.ipcRenderer.send('add-limit', { appName: newAppName, limit: newLimit });
    
    // Close dialog, reset form, and refetch limits
    setShowDialog(false);
    setNewAppName('');
    setNewLimit('');
    getLimits();
  }



  const handleDeleteLimit = async (appName) => {
    await window.electron.ipcRenderer.send('delete-limit', appName);
    // Refetch limits to ensure UI is in sync with the database
    getLimits();
  };


const categoryColors = {
        
        underLimit: { bg: 'bg-green-500/10', text: 'text-green-700', border: 'border-green-500/30' },
        overLimit: { bg: 'bg-red-500/10', text: 'text-red-700', border: 'border-red-500/30' }
    }

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayData = usageData[today] || {}
  const totalTimeToday = Object.values(todayData).reduce((sum, time) => sum + time, 0)
  recentApps = Object.keys(usageData[today] || {})


  const topAppsToday = Object.entries(todayData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([app, time]) => ({
      app,
      time: Math.round(time / 60), // Convert to minutes
      percentage: totalTimeToday > 0 ? Math.round((time / totalTimeToday) * 100) : 0
    }))


  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
    const dayData = usageData[date] || {}
    const totalTime = Object.values(dayData).reduce((sum, time) => sum + time, 0)
    return {
      date: format(subDays(new Date(), 6 - i), 'MMM dd'),
      time: Math.round(totalTime / 60 / 60 * 10) / 10 // Convert to hours with 1 decimal

    }
  })
  const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']
  const formatTime = (ms) => {
    const hours = Math.floor(ms / (60 * 60))
    const minutes = Math.floor((ms % (60 * 60)) / (60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

;
  return (
    <div className="space-y-8 ml-64">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 ">{userName}'s Dashboard</h1>
            <p className="text-gray-400">Your screen time overview for today</p>
          </div>
          <div className="flex items-center justify-center gap-1 bg-white border border-gray-300 rounded-lg p-2">
            
            <button
              onClick={() => setShowDialog(!showDialog)}
              className=" border border-gray-300 rounded-sm p-2 text-gray-700 hover:text-black"
            >Limits</button>
            <button onClick={handleRefresh} className="border border-gray-300 rounded-xl backdrop-blur-sm p-2 text-gray-700 hover:text-black">
              <RotateCcwIcon className=""></RotateCcwIcon>
            </button>



          </div>

        </div>


      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl backdrop-blur-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-400"></Clock>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 ">{formatTime(totalTimeToday)}</p>
              <p className="text-gray-400">total today</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl backdrop-blur-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-400"></Activity>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 ">{Object.keys(todayData).length}</p>
              <p className="text-gray-400">Apps Used</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl backdrop-blur-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400"></TrendingUp>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 ">{last7Days.length > 1 ?
                `${Math.round(((last7Days[6]?.time || 0) - (last7Days[5]?.time || 0)) * 10) / 10}h` : '0h'}</p>
              <p className="text-gray-400">change today</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl backdrop-blur-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-yellow-400"></Target>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 ">{Object.keys(limits || {}).length}</p>
              <p className="text-gray-400">active limits</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 rounded-xl backdrop-blur-sm p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last7Days}>
              <CartesianGrid  stroke="rgba(224,224,224,0.8)" />
              <XAxis dataKey="date" stroke="black" fontSize={12} />
              <YAxis stroke="black" fontSize={12}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.6)' } }} />

              <Tooltip
                contentStyle={{
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',


                }}
                formatter={(value) => [`${value}h`, 'Screen Time']}
              />
              <Bar dataKey="time" fill="url(#gradient)" border="rgba(59, 130, 246, 1)" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(59, 130, 246, 0.5)" />
                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0.5)" />
                </linearGradient>
              </defs>



            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl backdrop-blur-sm p-6 border border-gray-300">
          <h3 className="text-xl font-semibold black mb-6">Today's Top Apps</h3>
          {topAppsToday.length > 0 ? (
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="60%" height={300}>
                <PieChart>
                  <Pie
                    data={topAppsToday}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="time"
                  >
                    {topAppsToday.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      color: 'white',
                      backgroundColor: 'white',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',

                    }}
                    formatter={(value) => [`${value} minutes`, 'Time']}
                  />

                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 ml-6">
                <div className="space-y-3">
                  {topAppsToday.map((app, index) => (
                    <div key={app.app} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <span className="text-gray-700 text-sm font-medium truncate max-w-24">
                          {app.app}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-700 text-sm font-semibold">{app.time}m</p>
                        <p className="text-gray-400 text-xs">{app.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-700">
              <div className="text-center">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No app usage data for today</p>
              </div>
            </div>)}




        </div>

      </div>



      <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-gray-300">
        <h3 className="text-xl font-semibold text-gray-700 mb-6">Today's App Usage</h3>
        {topAppsToday.length > 0 ? (
          <div className="space-y-4">
            {Object.entries(todayData)
              .sort(([, a], [, b]) => b - a)
              .map(([app, time]) => {
                const minutes = Math.round(time / 60)
                const percentage = totalTimeToday > 0 ? (time / totalTimeToday) * 100 : 0
                const limit = limits?.[app]
                const isOverLimit = limit && minutes > limit
                const categoryColor = isOverLimit ? categoryColors.overLimit : categoryColors.underLimit

                return (
                  <div key={app} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-300">
                    <div className="flex items-center space-x-4">
                      
                        {(app in icons) ? 
                        <div className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center">
                        <img src={`data:image/png;base64,${icons[app]}`} alt="Icon" />
                        </div>
                        :
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-800 text-lg font-bold">
                          
                          {app.charAt(0).toUpperCase()}
                        </span> </div>}
                      
                      <div>
                        <p className="text-gray-700 font-medium">{app}</p>
                        {limit && (
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2 py-1 rounded-full flex items-center text-xs font-medium ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border} border group`}>
                              Limit: {limit} minutes
                              {isOverLimit && <span className="ml-2">• Over limit</span>}
                              <button className="ml-2 
                 w-0 opacity-0 overflow-hidden
                 transition-[width,opacity] duration-300 ease-in-out
                 group-hover:w-5 group-hover:opacity-100 text-inherit" onClick={() => handleDeleteLimit(app)}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                            </span>

                            
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${isOverLimit ? 'text-red-400' : 'text-gray-700'}`}>
                        {minutes}m
                      </p>
                      <p className="text-gray-400 text-sm">{Math.round(percentage)}%</p>
                    </div>
                  </div>
                )
              })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No app usage recorded for today</p>
            <p className="text-sm mt-2">Start using apps to see your screen time data</p>
          </div>
        )}
      </div>
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 border border-gray-300 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-black mb-4">Add Time Limit</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  App Name
                </label>
                <input
                  type="text"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="Enter app name"
                  list="recent-apps"
                />
                <datalist id="recent-apps">
                  {Array.from(recentApps).map(app => (
                    <option key={app} value={app} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Daily Limit (minutes)
                </label>
                <input
                  type="number"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="e.g., 60"
                  min="1"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowDialog(false)}
                className="flex-1 px-4 py-2 bg-white text-black rounded-lg border border-gray-300 hover:border-black"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLimit}
                disabled={!newAppName || !newLimit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Limit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}