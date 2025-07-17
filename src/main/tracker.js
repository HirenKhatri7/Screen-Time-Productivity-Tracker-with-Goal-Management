const activeWin = require('active-win')
const fs = require('fs')
const path = require('path')
const Database = require('better-sqlite3');
const XLSX = require('xlsx');


// const dbPath = path.join(__dirname, '..', 'app-usage.db');

// // Create DB if not exists
// if (!fs.existsSync(dbPath)) {
//   fs.writeFileSync(dbPath, '');
// }



const db = new Database('usage-log.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS usage( id INTEGER PRIMARY KEY AUTOINCREMENT, app_name TEXT, date TEXT, time INTEGER, UNIQUE(app_name,date));
    `
);

db.exec(`CREATE TABLE IF NOT EXISTS username(id INTEGER PRIMARY KEY AUTOINCREMENT, userName TEXT);`)
db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY ,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK(category IN ('productivity', 'fitness', 'personal', 'learning','work')) DEFAULT 'productivity',
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  created_at TEXT NOT NULL);
    `
);

db.exec(`CREATE TABLE IF NOT EXISTS subgoals (
  id TEXT PRIMARY KEY ,
  goal_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  is_completed INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);`)

db.exec(`CREATE TABLE IF NOT EXISTS limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appName TEXT NOT NULL,
    dailylimit INTEGER NOT NULL,
    date TEXT NOT NULL,
    UNIQUE(appName,date)
    );`)

function logUsage(appName){
    const stmt = db.prepare(`
  INSERT INTO usage (app_name, date, time)
  VALUES (?, ?, 1)
  ON CONFLICT(app_name, date)
  DO UPDATE SET time = time + 1;
`);
const todayDate = new Date().toLocaleDateString('en-CA', {
  timeZone: 'Asia/Kolkata'
});
    const result = stmt.run(appName,todayDate);     
}

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

function getTodayUsage(){
    const todayDate = new Date().toLocaleDateString('en-CA', {
  timeZone: 'Asia/Kolkata'
});
    const stmt = db.prepare("SELECT * FROM usage");
    const rows = stmt.all();
  const data =  rows.reduce((acc, item) => {
    const { date, app_name, time} = item
    if(!acc[date]) acc[date] = {}
    acc[date][app_name] = time
    return acc
  },{});

  return data
}

function addLimit(appName,limit){
const stmt = db.prepare(`
  INSERT INTO limits (appName, date, dailylimit)
  VALUES (?, ?, ?)
  ON CONFLICT(appName, date)
  DO UPDATE SET dailylimit = ?;
`);
const todayDate = new Date().toLocaleDateString('en-CA', {
  timeZone: 'Asia/Kolkata'
});
    const result = stmt.run(appName,todayDate,limit,limit);

}
function getLimits(){
const todayDate = new Date().toLocaleDateString('en-CA', {
  timeZone: 'Asia/Kolkata'
});
const stmt = db.prepare("SELECT appName, dailylimit FROM limits WHERE date = ?");
const rows = stmt.all(todayDate);
return rows;
}
function deleteLimit(appName){
  const todayDate = new Date().toLocaleDateString('en-CA', {
  timeZone: 'Asia/Kolkata'
});

  const stmt = db.prepare("DELETE FROM limits WHERE date = ? AND appName = ?")
  try{
    stmt.run(todayDate,appName);
  }catch(error)
  {
    console.log(error);
  }

}
function addGoal(goal){

    const goalStmt = db.prepare("INSERT INTO goals (id, title, description, category, priority, start_date, end_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);");
    goalStmt.run(goal.id,goal.title,goal.description,goal.category,goal.priority,goal.startDate,goal.endDate,goal.createdAt);

    const subgoalsStmt = db.prepare("INSERT INTO subgoals (id, goal_id, title, is_completed, created_at) VALUES (?, ?, ?, ?, ?)")
    if(goal.subtasks.length > 0){
        goal.subtasks.forEach(subtask => {
            subgoalsStmt.run(subtask.id,goal.id,subtask.title,subtask.completed ? 1 : 0,subtask.createdAt)
        });
    }
}


function getGoals(){

    const goalStmt = db.prepare("SELECT * FROM goals;")
    const new_rows = goalStmt.all();
    const rows = new_rows.map(r => ({
        id: r.id,
        title:r.title,
        description: r.description,
        category: r.category,
        priority: r.priority,
        startDate: r.start_date,
        endDate: r.end_date,
        createdAt: r.created_at

    }))
    

    const subGoalStmt = db.prepare("SELECT * FROM subgoals WHERE goal_id = ?");
    
    rows.forEach(row => {
        const subgoalsRows = subGoalStmt.all(row.id);
        if(subgoalsRows.length > 0) row.subtasks = subgoalsRows.map(r => 
            ({id: r.id, 
            createdAt : r.created_at,
            isCompleted: r.is_completed === 1? true: false,
            title: r.title
        }));
        else row.subtasks = []
    })

    
    return rows;

}

function update_goal(updatedGoal){
    
    const updateGoalStmt = db.prepare(`
    UPDATE goals
    SET
        title = ?,
        description = ?,
        category = ?,
        priority = ?,
        start_date = ?,
        end_date = ?
    WHERE id = ?
        `);
        updateGoalStmt.run(
  updatedGoal.title,
  updatedGoal.description,
  updatedGoal.category,
  updatedGoal.priority,
  updatedGoal.startDate,
  updatedGoal.endDate,
  updatedGoal.id 
);
const goal = updatedGoal


const deleteSubtasksStmt = db.prepare(`DELETE FROM subgoals WHERE goal_id = ?`);
deleteSubtasksStmt.run(goal.id);

const subgoalsStmt = db.prepare("INSERT INTO subgoals (id, goal_id, title, is_completed, created_at) VALUES (?, ?, ?, ?, ?)");
    if(goal.subtasks.length > 0){
        goal.subtasks.forEach(subtask => {
            subgoalsStmt.run(subtask.id,goal.id,subtask.title,subtask.completed ? 1 : 0,subtask.createdAt)
        });
    }
}

function deleteGoalWithSubtasks(goalId) {
  const deleteSubtasksStmt = db.prepare(`DELETE FROM subgoals WHERE goal_id = ?`);
  const deleteGoalStmt = db.prepare(`DELETE FROM goals WHERE id = ?`);


  const transaction = db.transaction((goalId) => {
    deleteSubtasksStmt.run(goalId);
    deleteGoalStmt.run(goalId);
  });

  try {
    transaction(goalId);
    
  } catch (error) {
    console.error('Failed to delete goal:', error);
  }
}

function deleteSubtask(subtaskId) {
  const deleteStmt = db.prepare(`DELETE FROM subgoals WHERE id = ?`);
  
  try {
    deleteStmt.run(subtaskId);
    
  } catch (error) {
    console.error('Failed to delete subtask:', error);
  }
}
function clearData(){
  const goalstable = db.prepare('DELETE FROM goals;');
  const usagetable = db.prepare('DELETE FROM usage;');
  const subgoalstable = db.prepare('DELETE FROM subgoals;');
  const limitstable = db.prepare('DELETE FROM limits;');

  try{
    goalstable.run();
    usagetable.run();
    subgoalstable.run();
    limitstable.run();
  }catch (error){
    console.log("Error deleting form table: ",error);
  }
}

function exportData(filepath){
  
  try{
    const goals = db.prepare('SELECT * FROM goals').all();
    const subgoals = db.prepare('SELECT * FROM subgoals').all();
    const usage = db.prepare('SELECT * FROM usage').all();
    const limits = db.prepare('SELECT * FROM limits').all();
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(goals), 'Goals');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(subgoals), 'Subgoals');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(usage), 'Usage');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(limits), 'Limits');

    if (filepath) {
      
      XLSX.writeFile(workbook, filepath);
      return { success: true };
    }
    return { success: false, error: 'User cancelled' };
  }catch (err) {
    console.error('Export failed:', err);
    return { success: false, error: err.message };
  }
}

function setUserName(userName){
  const deleteQuery = db.prepare('DELETE FROM username;');
  const insertQuery = db.prepare('INSERT INTO username (userName) VALUES (?)');

  try{
    deleteQuery.run();
    insertQuery.run(userName);
  }catch (error)
  {
    console.log("Username setup failed due to: ",error);
  }

}

function getUserName(){
  const selectQueryUsername = db.prepare('SELECT userName FROM username;')
  try{
    const userName = selectQueryUsername.all();
    if(userName.length == 1){
      return userName[0]
    }
    return ''
  } catch(error){
    console.log(error);
  }
}


module.exports = {
    startTracking,
    getTodayUsage,
    addGoal,
    getGoals,
    update_goal,
    deleteGoalWithSubtasks,
    deleteSubtask,
    addLimit,
    getLimits,
    clearData,
    exportData,
    setUserName,
    getUserName,
    deleteLimit

};
