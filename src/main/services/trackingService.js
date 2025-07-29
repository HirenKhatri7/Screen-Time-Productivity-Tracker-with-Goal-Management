const activeWin = require('active-win')
import { logUsage } from './usageService';
import {logTimeForGoalApp} from './goalService';
import { db } from '../database';
import { updateCapsuleData } from '..';


let currentActiveGoalId = null


async function Track(){
    try{
        const win = await activeWin();
        if(win && win.owner && win.owner.name){
            const appName = win.owner.name
            logUsage(appName);
            

        if(currentActiveGoalId){
            logTimeForGoalApp(currentActiveGoalId,appName);
        }
        }
    }catch(err){
        console.log("err logging current window", err);
    }
}

function startTracking(){  
    setInterval(Track,1000);
}

function setCurrentActiveGoal(goalId){
    currentActiveGoalId = goalId;
    const todayDate = new Date().toLocaleDateString('en-CA', {
        timeZone: 'Asia/Kolkata'
        });

    if(currentActiveGoalId) {
            let currentActiveGoalTitle = db.prepare("SELECT title FROM goals WHERE id = ?").get(goalId).title;
            let time = db.prepare("SELECT sum(time) AS total_time FROM GoalAppTimeLog WHERE goal_id = ? AND date = ? GROUP BY goal_id").get(goalId,todayDate).total_time;
            updateCapsuleData(currentActiveGoalTitle,time);  
        }  
}
function getCurrentActiveGoal(){
    return currentActiveGoalId;
}
export{startTracking, setCurrentActiveGoal,getCurrentActiveGoal};