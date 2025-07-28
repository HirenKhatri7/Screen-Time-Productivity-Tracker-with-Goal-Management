import React from "react";
import { Dot } from "lucide-react";
export default function TimeBreakDownPanel({appsUsed}) {
    
    if (appsUsed.length == 0) {
        return <div className="flex items-center justify-center"> 
            <p className="text-white ">There are no apps used</p>
        </div>
    }
    const totalTime = appsUsed.reduce((sum, appUsed) => sum + appUsed.time, 0);
    const convertInHHMM = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");

        return `${hours}h ${minutes}m`

    }
    
    return (
        <div>
            <div className="flex items-center justify-between py-1">
                <span className="text-gray-300 text-sm">Total</span>
                <span className="text-gray-300 text-sm">{convertInHHMM(totalTime)}</span>
            </div>
            <div className="p-3 h-45 overflow-y-auto
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300">
                {appsUsed.map((app) => {
                    return (
                        <div className="flex items-center justify-between border-b border-gray-700 p-2">
                            <span className="text-white">{app.appName}</span>
                            <div className="flex items-center justify-center">
                                <div className={`w-2 h-2 rounded-full mr-1 ${app.isProductive ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                <span className="text-white">{convertInHHMM(app.time)}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}