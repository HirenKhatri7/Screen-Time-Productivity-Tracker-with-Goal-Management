const activeWin = require('active-win')
import { logUsage } from './usageService';
import {logTimeForGoalApp} from './goalService';
import { db } from '../database';
import { updateCapsuleData } from '..';
const fileIcon = require('extract-file-icon');


let currentActiveGoalId = null
let time = 0;
let apps = {};
const insertStmt = db.prepare('INSERT OR IGNORE INTO apps VALUES (?,?);');

async function Track(){
    try{
        const win = await activeWin();
        if(win && win.owner && win.owner.name){
            const appName = win.owner.name
            if(appName.trim())
            logUsage(appName);
            if(!(appName in apps)){
                const icon = fileIcon(win.owner.path,32);
                const baseString = icon.toString('base64');
                apps[appName] = baseString;
                insertStmt.run(appName,baseString); 
            }
            

        if(currentActiveGoalId){
            logTimeForGoalApp(currentActiveGoalId,appName);
        }
        }
    }catch(err){
        console.log("err logging current window", err);
    }
}

function startTracking(){
    getApps();  
    setInterval(Track,1000);
}
function getApps(){
    const appsDb = db.prepare('SELECT * FROM apps;').all();
    apps = appsDb.reduce((acc, curr) => {
                acc[curr.app_name] = curr.icon;
                return acc;
                }, {});
}

function setCurrentActiveGoal(goalId){
    currentActiveGoalId = goalId;
    const todayDate = new Date().toLocaleDateString('en-CA', {
        timeZone: 'Asia/Kolkata'
        });

    if(currentActiveGoalId) {
            let currentActiveGoalTitle = db.prepare("SELECT title FROM goals WHERE id = ?").get(goalId).title;
            let dbTime = db.prepare("SELECT sum(time) AS total_time FROM GoalAppTimeLog WHERE goal_id = ? AND date = ? GROUP BY goal_id").get(goalId,todayDate)?.total_time;
            if(dbTime) time = dbTime;
            updateCapsuleData(currentActiveGoalTitle,time);  
        }  
}
function getCurrentActiveGoal(){
    return currentActiveGoalId;
}

function getIcons(){
    return apps;
}
export{startTracking, setCurrentActiveGoal,getCurrentActiveGoal,getIcons};