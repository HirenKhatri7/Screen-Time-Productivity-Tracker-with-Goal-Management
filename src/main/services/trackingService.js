const activeWin = require('active-win')
import { logUsage } from './usageService';
import {logTimeForGoalApp} from './goalService';

let currentActiveGoalId = null

async function Track(){
    try{
        const win = await activeWin();
        if(win && win.owner && win.owner.name){
            const appName = win.owner.name
            logUsage(appName);

        if(currentActiveGoalId){
            console.log("From trackingService: ",currentActiveGoalId);
            logTimeForGoalApp(currentActiveGoalId,appName);
        }
        }
    }catch(err){
        console.log("err logging current window")
    }
}

function startTracking(){  
    setInterval(Track,1000);
}

function setCurrentActiveGoal(goalId){
    currentActiveGoalId = goalId
}

export{startTracking, setCurrentActiveGoal};