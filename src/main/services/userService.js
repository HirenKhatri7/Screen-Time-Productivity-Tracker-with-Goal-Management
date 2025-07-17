import { db } from '../database';

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

export{ setUserName,getUserName}