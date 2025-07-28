import { db } from '../database';

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

function logTimeForGoalApp(goalId, appName) {
  const todayDate = new Date().toLocaleDateString('en-CA', {
  timeZone: 'Asia/Kolkata'
});
  const stmt = db.prepare(`
    INSERT INTO GoalAppTimeLog (goal_id, app_name, date, time)
    VALUES (?, ?, ?, 1)
    ON CONFLICT(goal_id, app_name, date)
    DO UPDATE SET time = time + 1;
  `);
  stmt.run(goalId, appName, todayDate);
}

function updateGoalAppLinks(goalId, appNames = []) {
  // Use a transaction for efficiency
  const transaction = db.transaction(() => {
    // 1. Remove all existing links for this goal
    db.prepare('DELETE FROM GoalAppLinks WHERE goal_id = ?').run(goalId);

    // 2. Insert the new links
    const stmt = db.prepare('INSERT INTO GoalAppLinks (goal_id, app_name) VALUES (?, ?)');
    for (const appName of appNames) {
      stmt.run(goalId, appName);
    }
  });
  transaction();
}

function getGoals() {
  const goalsStmt = db.prepare("SELECT * FROM goals ORDER BY created_at DESC;");
  const goals = goalsStmt.all().map(g => ({
      id: g.id,
      title: g.title,
      description: g.description,
      category: g.category,
      priority: g.priority,
      startDate: g.start_date,
      endDate: g.end_date,
      createdAt: g.created_at,
      isCompleted:g.is_completed === 1,
      subtasks: [] 
  }));

  if (goals.length === 0) {
      return [];
  }

  const allSubtasksStmt = db.prepare("SELECT * FROM subgoals");
  const allSubtasks = allSubtasksStmt.all();


  const goalMap = new Map(goals.map(g => [g.id, g]));


  allSubtasks.forEach(s => {
      const parentGoal = goalMap.get(s.goal_id);
      if (parentGoal) {
          parentGoal.subtasks.push({
              id: s.id,
              createdAt: s.created_at,
              isCompleted: s.is_completed === 1,
              title: s.title
          });
      }
  });


  const appLinkStmt = db.prepare("SELECT goal_id,app_name FROM GoalAppLinks");
  const appLinks = appLinkStmt.all();

  const goalLinkedApps = new Map();
  appLinks.forEach(link => {
    if(!goalLinkedApps.has(link.goal_id)){
        goalLinkedApps.set(link.goal_id,new Set());
    }
    goalLinkedApps.get(link.goal_id).add(link.app_name);
  });
  goals.forEach(goal=>{
    if(goalLinkedApps.has(goal.id))
      goal.appLinks = [...goalLinkedApps.get(goal.id)];
    else
      goal.appLinks = []
  })

  const timeLogStmt = db.prepare("SELECT goal_id, app_name, SUM(time) as total_time FROM GoalAppTimeLog GROUP BY goal_id, app_name");
  const timeLog = timeLogStmt.all();

  goals.forEach(goal => {
    goal.timeBreakDown = [];
    goal.productiveTime = 0;
    goal.unProductiveTime = 0;

    const linkedApps = goalLinkedApps.get(goal.id) || new Set();

    timeLog
    .filter(log => log.goal_id === goal.id)
    .forEach(log => {
        const isProductive = linkedApps.has(log.app_name);
        
        goal.timeBreakDown.push({
          appName: log.app_name,
          time: log.total_time,
          isProductive: isProductive
        });

        if (isProductive) {
          goal.productiveTime += log.total_time;
        } else {
          goal.unProductiveTime += log.total_time;
        }
    });
  });


  return goals;
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
        end_date = ?,
        is_completed = ?
    WHERE id = ?
        `);
        
        updateGoalStmt.run(
  updatedGoal.title,
  updatedGoal.description,
  updatedGoal.category,
  updatedGoal.priority,
  updatedGoal.startDate,
  updatedGoal.endDate,
  updatedGoal.isCompleted ? 1 : 0,
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

function markGoalAsCompleted(goal){
  const updateGoalStmt = db.prepare(`
    UPDATE goals
    SET
        is_completed = 1
    WHERE id = ?
        `);
        updateGoalStmt.run(
  
  goal.id 
);



const deleteSubtasksStmt = db.prepare(`DELETE FROM subgoals WHERE goal_id = ?`);
deleteSubtasksStmt.run(goal.id);

const subgoalsStmt = db.prepare("INSERT INTO subgoals (id, goal_id, title, is_completed, created_at) VALUES (?, ?, ?, ?, ?)");
    if(goal.subtasks.length > 0){
        goal.subtasks.forEach(subtask => {
            subgoalsStmt.run(subtask.id,goal.id,subtask.title,1,subtask.createdAt)
        });
    }

}

function deleteGoalWithSubtasks(goalId) {
  
  const deleteGoalStmt = db.prepare(`DELETE FROM goals WHERE id = ?`);

    deleteGoalStmt.run(goalId);
    
}

function clearGoalData() {
    db.prepare('DELETE FROM goals;').run();
    
}

export{
    clearGoalData,
    update_goal,
    getGoals,
    addGoal,
    deleteGoalWithSubtasks,
    updateGoalAppLinks,
    logTimeForGoalApp,
    markGoalAsCompleted
}