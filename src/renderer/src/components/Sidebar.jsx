import React, { useState } from "react"
import '../assets/main.css'
import {
    Clock,
    BarChart3,
    Settings,
    Target,
    TrendingUp,
    Calendar,
    Download,
    Trash2,
    Bell,
    Eye,
    Timer,
    Activity,
    Pen
} from 'lucide-react'
export default function Sidebar({ setActiveTab, activeTab ,exportData,clearData,userName,setShowNameModal}) {

    const user = userName || 'Enter your Name'
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'goals', label: 'Goals', icon: TrendingUp },

    ]
    return (

        <div className='min-h-screen w-64 bg-black/20 backdrop-blur-sm border-r border-white/10 text-white'>
            <div className="p-6">
                <div className="mb-6 p-6 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-blue-300 text-sm">Developer</span>
                    </div>
                    <p className="text-blue-200">Hiren</p>
                </div>
                <div className="mb-6 p-6 bg-black-400/10 rounded-lg border border-black-500/20">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-white-300 text-sm">Welcome</span>
                    </div>
                    <div className="flex items-center justify-between">
                        { user === 'Enter your Name' ? <span className="text-gray-400 text-sm truncate">{user}</span> : <span className="text-white font-medium truncate">{user}</span>}
                        <button onClick={() => setShowNameModal(true)} className="text-gray-400 hover:text-white">
                            <Pen className="w-4 h-4"/>
                        </button>
                    </div>
                    
                </div>
                <nav className="space-y-2">
                    {
                        tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === tab.id ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                                    <Icon className="w-5 h-5"></Icon>
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            )
                        })
                    }

                </nav>
                <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-gray-400 text-sm font-medium mb-3">Quick Actions</p>
                    <div className="space-y-2">
                        <button
                            onClick={exportData}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span className="text-sm">Export Data</span>
                        </button>
                        <button
                            onClick={clearData}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm">Clear Data</span>
                        </button>
                    </div>
                </div>
            </div>






        </div>

    )
}