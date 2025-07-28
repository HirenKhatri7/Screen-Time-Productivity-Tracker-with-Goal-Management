const {ipcMain,dialog} = require('electron')
import * as goalService from './services/goalService';
import * as usageService from './services/usageService';
import * as userService from './services/userService';
import * as exportService from './services/exportService';
import { setCurrentActiveGoal } from './services/trackingService'


function registerIpcHandlers() {
    //goal handlers
    ipcMain.handle('get-goals',async () => {
  return Promise.resolve(goalService.getGoals());});
    ipcMain.on('add-goal', (event,goal) => goalService.addGoal(goal));
    ipcMain.on('delete-goal', (event,goalId) => goalService.deleteGoalWithSubtasks(goalId));
    ipcMain.on('update-goal',(event,goal) => goalService.update_goal(goal));
    ipcMain.on('mark-goal-completed',(event,goal) => goalService.markGoalAsCompleted(goal));
    ipcMain.on('set-active-goal',(event,goalId) => setCurrentActiveGoal(goalId));
    ipcMain.on('update-app-link',(event,{apps,goal_id}) => goalService.updateGoalAppLinks(goal_id,apps));

    //usage handlers
    ipcMain.handle('get-usage', () => usageService.getTodayUsage());
    ipcMain.handle('get-limits',() => usageService.getLimits());
    ipcMain.handle('get-apps',() => usageService.getAppNames());
    ipcMain.on('add-limit',(event,{appName, limit}) => usageService.addLimit(appName,limit));
    ipcMain.on('delete-limit',(event,limit) => usageService.deleteLimit(limit)); 

    //user handlers
    ipcMain.handle('get-username', () => userService.getUserName());
    ipcMain.on('set-username',(event,userName) => userService.setUserName(userName));

    //data handlers
    ipcMain.on('clear-all-data', () => {
        usageService.clearUsageData();
        goalService.clearGoalData();
    });

    ipcMain.handle('export-data', async () => {
      const { filePath } = await dialog.showSaveDialog({
          title: 'Export Database to Excel',
          defaultPath: 'tracker-data.xlsx',
          filters: [{ name: 'Excel File', extensions: ['xlsx'] }]
        })
        if(filePath){
          exportService.exportData(filePath);
        }
    });
}

export{registerIpcHandlers}