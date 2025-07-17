const activeWin = require('active-win')
import { logUsage } from './usageService';

async function Track(){
    try{
        const win = await activeWin();
        if(win && win.owner && win.owner.name){
            logUsage(win.owner.name)
        }
    }catch(err){
        console.log("err logging current window")
    }
}

function startTracking(){  
    setInterval(Track,1000);
}

export{startTracking}