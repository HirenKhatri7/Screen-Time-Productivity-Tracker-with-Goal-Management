import React,{useState,useEffect,useCallback} from 'react'
import Sidebar from './components/Sidebar'
import './assets/main.css'
import Dashboard from './panels/dashboard'
import Goals from './panels/goals'
import { Clock } from 'lucide-react'



function App() {
 

  const [activeTab,setActiveTab] = useState('dashboard')
  const [tempName, setTempName] = useState('')
  const [user,setUser] = useState('')  
  const [showNameModal,setShowNameModal] = useState(false)
  const [activeGoalId, setActiveGoalId] = useState('none');
  const [apps, setApps] = useState([])
  const [goals, setGoals] = useState([])
  const [productiveTime,setProductiveTime] = useState("")
  const [streak,setStreak] = useState(0)


          let goalsData;
          const formatTime = (totalSeconds) => {
          const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
          const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
  
          return `${hours}h ${minutes}m`
  
      }
      
      const getStreak = async () => {
        const streak =  await window.electron.ipcRenderer.invoke("get-global-log-streak",90);
        return streak
      }
      useEffect(() => {
        setStreak(getStreak);
      },[goals])
  
      const returnProductiveTime = async () => {
  const pTime = await window.electron.ipcRenderer.invoke("get-today-productive-time");
  
          return formatTime(pTime);
      }
      useEffect(() => {
      setProductiveTime(returnProductiveTime());
    }, [goals]); 

      const handleRefresh = useCallback(async () => {
           goalsData = await window.electron.ipcRenderer.invoke('get-goals');
          setGoals(goalsData);
      }, [goalsData]);
  
      const getApps = useCallback(async () => {
          const appsUsed = await window.electron.ipcRenderer.invoke('get-apps');
          let tempApps = []
          appsUsed.forEach(app => {
              tempApps.push(app.app_name);
          });
          setApps(tempApps);
      }, []);
  
      useEffect(() => {
          handleRefresh();
          getApps()
      }, [handleRefresh, getApps]);
  useEffect(() => {

    if(!checkUserName()){
      console.log(user)
      setShowNameModal(true)
    }

  }, []);


  const exportData = () => {
    window.electron.ipcRenderer.invoke('export-data')
  }
    
  const clearData = () => {
    if(confirm("You want to clear the data?")){
      window.electron.ipcRenderer.send('clear-data');
    }
  }
  const handleNameSubmit = () => {
    if (tempName.trim()) {
      setShowNameModal(false)
      window.electron.ipcRenderer.send('set-username',tempName.trim());
      setUser(tempName.trim());
      setTempName('')
      
    }
  }
  

  const checkUserName = async () => {
  const data = await window.electron.ipcRenderer.invoke('get-username');
  const userName = data?.userName || '';
  setUser(userName.charAt(0).toUpperCase() + userName.slice(1));
  return userName.trim().length > 0;
};


  
  return (
    <div className='min-h-screen bg-[var(--color-cream-50)]'>
      <div className='flex'>
        <Sidebar setActiveTab={setActiveTab} activeTab={activeTab} exportData={exportData} clearData={clearData} userName={user} setShowNameModal={setShowNameModal}></Sidebar>
        <div className='flex-1 min-h-screen'>
          <div className='p-8'>
            {activeTab === 'dashboard' && <Dashboard userName = {user} activeGoalId={activeGoalId} setActiveGoalId = {setActiveGoalId} goals={goals}/>}
            {activeTab === 'goals' && <Goals userName = {user} activeGoalId={activeGoalId} setActiveGoalId = {setActiveGoalId} preGoals={goals} apps={apps} handleRefresh = {handleRefresh} getApps = {getApps} preProductiveTime={productiveTime} streak = {streak}/>} 
             {showNameModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 border border-gray-300 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Welcome to Screen Time Tracker</h2>
              <p className="text-gray-400">Let's personalize your experience</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  What's your name?
                </label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:outline-none "
                  placeholder="Enter your name"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNameModal(false)
                  setTempName('')
                }}
                className="flex-1 px-4 py-3 bg-white text-gray-700 rounded-lg  border border-gray-300 hover:border-black"
              >
                Skip
              </button>
              <button
                onClick={handleNameSubmit}
                disabled={!tempName.trim()}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
                 
          </div>
        </div>
      </div>     
    </div>
  )
}

export default App
