import React from "react";
import { format } from "date-fns";

export default function DetailsPanel({category,priority,startDate,endDate,description}){
    


    return (
        <div className="p-2">
            <div className=" text-white ">
                <div className="grid grid-cols-1 gap-1">
                    <div className="grid grid-cols-2  gap-8">
                        <span>Category</span>
                        <span>{category}</span>
                    </div>
                    <div className="grid grid-cols-2  gap-8">
                        <span>priority</span>
                        <span>{priority}</span>
                    </div>
                
                    <div className="grid grid-cols-1 gap-3">
                        <span>{format(new Date(startDate), 'MMM dd')} - {format(new Date(endDate), 'MMM dd')}</span>
                    </div>
                </div>
            </div>
            {description.length == 0 ? "" 
            :<div className="text-white mt-2 text-sm bg-gray-900 p-1 rounded-xl h-26 overflow-y-scroll
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300">
                Description:
                <p>{description}</p>
            </div>  }
        </div>
    )
}