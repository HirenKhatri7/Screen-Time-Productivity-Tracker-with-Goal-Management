import { db } from '../database';
const XLSX = require('xlsx');

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

export{exportData}