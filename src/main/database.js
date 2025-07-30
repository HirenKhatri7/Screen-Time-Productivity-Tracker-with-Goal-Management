const Database = require('better-sqlite3');
const db = new Database('usage-log.db');

function initializeDatabase(){
    
    
    db.exec(`
        CREATE TABLE IF NOT EXISTS usage( id INTEGER PRIMARY KEY AUTOINCREMENT, app_name TEXT, date TEXT, time INTEGER, UNIQUE(app_name,date));
        `
    );
    db.exec(`CREATE TABLE IF NOT EXISTS apps( app_name TEXT PRIMARY KEY, icon TEXT);`);
    
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
      created_at TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0);
        `
    );
    
    db.exec(`CREATE TABLE IF NOT EXISTS subgoals (
      id TEXT PRIMARY KEY ,
      goal_id TEXT NOT NULL,
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
        );`);

    db.exec(`CREATE TABLE IF NOT EXISTS GoalAppLinks(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id TEXT NOT NULL,
      app_name TEXT NOT NULL,
      FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
      UNIQUE(goal_id,app_name)
      );
      `)

    db.exec(`CREATE TABLE IF NOT EXISTS GoalAppTimeLog(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id TEXT NOT NULL,
      app_name TEXT NOT NULL,
      date TEXT NOT NULL,
      time INTEGER NOT NULL,
      FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
      UNIQUE(goal_id,app_name,date)
      );`)
    
}

export{db, initializeDatabase};