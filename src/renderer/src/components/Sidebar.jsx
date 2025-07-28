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

        <div className='min-h-screen w-64 bg-white border-r border-gray-300 text-gray-800 fixed'>
            <div >
                <div className=" p-6 border-b border-black/20">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-700 text-sm">Developer</span>
                    </div>
                    <p className="text-gray-800 font-semibold">Hiren</p>
                </div>
                <div className="space-y-2 mb-6 p-6 border-b border-black/20">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm">Welcome</span>
                    </div>
                    <div className="flex items-center justify-between">
                        { user === 'Enter your Name' ? <span className="text-gray-600 text-sm truncate">{user}</span> : <span className="text-gray-600 font-medium truncate">{user}</span>}
                        <button onClick={() => setShowNameModal(true)} className="text-gray-800 hover:text-black">
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
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === tab.id ? 'bg-blue-400 text-white' : 'text-gray-700 hover:text-black '}`}>
                                    <Icon className="w-5 h-5"></Icon>
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            )
                        })
                    }

                </nav>
                <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-gray-700 text-sm font-medium mb-3 ml-2">Quick Actions</p>
                    <div className="space-y-2">
                        <button
                            onClick={exportData}
                            className="w-full flex items-center font-medium space-x-3 px-4 py-2 text-gray-800 hover:text-black  rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span className="text-sm">Export Data</span>
                        </button>
                        <button
                            onClick={clearData}
                            className="w-full flex items-center space-x-3 px-4 py-2 font-medium text-gray-800 hover:text-red-400 rounded-lg transition-colors"
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