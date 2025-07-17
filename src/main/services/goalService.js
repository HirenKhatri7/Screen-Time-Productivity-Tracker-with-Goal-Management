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

function clearGoalData() {
    db.prepare('DELETE FROM goals;').run();
    
}

export{
    clearGoalData,
    update_goal,
    getGoals,
    addGoal,
    deleteGoalWithSubtasks
}