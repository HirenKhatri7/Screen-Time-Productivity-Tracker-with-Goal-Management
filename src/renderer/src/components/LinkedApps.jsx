import React from "react";

export default function LinkedApps({ appLinks }) {
    if (appLinks.length == 0) {
        return (
            <div className="flex items-center justify-center">
                <p className="text-white ">There are no apps linked to this goal</p>
            </div>
        )
    }

        
    
    

    return (
        <div className="p-3 h-45 overflow-y-auto
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-track]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-gray-100
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-gray-300">
            {appLinks.map((app) => {
                return (
                    <div className="flex items-center justify-start border-b border-gray-700 p-2">
                        <span className="text-white">{app}</span>

                    </div>
                )
            })}
        </div>

    )
}