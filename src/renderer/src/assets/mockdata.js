import { format, subDays } from 'date-fns';

// Generate mock screen time data for demonstration
function generateMockData() {
  const apps = [
    'Chrome', 'VS Code', 'Slack', 'Figma', 'Spotify', 
    'Discord', 'Notion', 'Terminal', 'Safari', 'Photoshop'
  ];
  
  const data = {};

  // Generate data for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    data[date] = {};

    // Random number of apps used per day (3-7)
    const numApps = Math.floor(Math.random() * 5) + 3;
    const selectedApps = apps.sort(() => 0.5 - Math.random()).slice(0, numApps);

    selectedApps.forEach(app => {
      const minTime = 5 * 60 * 1000; // 5 minutes
      const maxTime = 4 * 60 * 60 * 1000; // 4 hours
      data[date][app] = Math.floor(Math.random() * (maxTime - minTime)) + minTime;
    });
  }

  return data;
}

const defaultSettings = {
  timeLimits: {
    'Chrome': 120,
    'VS Code': 480,
    'Slack': 60
  },
  notifications: true,
  theme: 'dark',
  trackingEnabled: true,
  autoStart: false,
  dataRetention: '90',
  warningThreshold: '80',
  soundNotifications: true,
  animations: true,
  analytics: false,
  crashReports: false
};

// Export for use elsewhere if needed
export { generateMockData, defaultSettings };
