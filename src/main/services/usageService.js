import { db } from '../database';

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

function clearUsageData() {
    db.prepare('DELETE FROM usage;').run();
    db.prepare('DELETE FROM limits;').run();
}

function getAppNames(){
  const stmt = db.prepare("SELECT DISTINCT app_name FROM usage;");
  const apps = stmt.all();

  return apps;
}

export{
    logUsage,
    getTodayUsage,
    addLimit,
    getLimits,
    deleteLimit,
    clearUsageData,
    getAppNames
}