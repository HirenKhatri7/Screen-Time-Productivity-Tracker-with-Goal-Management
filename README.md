# Screen Time & Productivity Tracker

A **cross-platform desktop application** built with **Electron.js** and **React.js** to help users **monitor screen time**, **track productivity**, and **manage personal or work goals**. Featuring detailed app usage insights, elegant visualizations, and robust goal-tracking.

---

## ✨ Features

### 📊 Weekly & Daily Visualizations
- Interactive dashboard with **bar graphs** and **doughnut charts**
- View **weekly screen time trends** and **daily app usage breakdowns**

### 🎯 Goal Management
- Create, edit, activate/deactivate, and complete productivity goals
- Each goal includes:
  - Title & description
  - Subtasks checklist
  - Linked apps (track usage per app)
  - Category & priority
  - Start and end date range
  - Productive vs. unproductive time tracking

### ⚙️ Real-Time Tracking
- Active goals track usage of linked apps
- Time spent on unlinked apps is marked as **unproductive**

### 🕓 Flexible Goal State
- No goal is active by default, allowing for a **“free time” mode**
- Users can activate or deactivate any goal at any time

### ⏳ Usage Limits
- Set **daily usage limits** for specific apps
- Get **visual warnings** when limits are exceeded

### 🧭 Modern Professional UI
- Responsive, clean **light-themed interface**
- Sidebar navigation with sections for:
  - Developer settings
  - User settings
- Accessible menus and **animated charts**

### 💾 Data Persistence
- All data is stored **locally** using Electron
- Ensures **privacy** and **offline access**—no backend required

### ♿ Accessibility
- Full **keyboard navigation**
- **ARIA-compliant** components for inclusive usability

---

## 🚀 Tech Stack

- **Electron.js** – Cross-platform desktop app framework
- **React.js** – Frontend UI
- **Tailwind CSS** – Styling
- **SQLite / LocalStorage** – Local data persistence
- **Chart.js** or **Recharts** – Visualizations

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/screen-time-tracker.git

# Navigate into the project directory
cd screen-time-tracker

# Install dependencies
npm install

# Start the development app
npm run dev
