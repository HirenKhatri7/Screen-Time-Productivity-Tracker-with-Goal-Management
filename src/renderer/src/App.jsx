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

      const handleRefresh = useCallback(async () => {
          const goalsData = await window.electron.ipcRenderer.invoke('get-goals');
          setGoals(goalsData);
      }, []);
  
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
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
      <div className='flex'>
        <Sidebar setActiveTab={setActiveTab} activeTab={activeTab} exportData={exportData} clearData={clearData} userName={user} setShowNameModal={setShowNameModal}></Sidebar>
        <div className='flex-1 min-h-screen'>
          <div className='p-8'>
            {activeTab === 'dashboard' && <Dashboard userName = {user} activeGoalId={activeGoalId} setActiveGoalId = {setActiveGoalId} goals={goals}/>}
            {activeTab === 'goals' && <Goals userName = {user} activeGoalId={activeGoalId} setActiveGoalId = {setActiveGoalId} preGoals={goals} apps={apps} handleRefresh = {handleRefresh} getApps = {getApps}/>} 
             {showNameModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-8 border border-white/10 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Screen Time Tracker</h2>
              <p className="text-gray-400">Let's personalize your experience</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  What's your name?
                </label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
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
                className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleNameSubmit}
                disabled={!tempName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
