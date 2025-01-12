import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login/LoginPage'
import Home from './pages/home/Home'
import Account from './pages/account/Account.jsx'
import Calendar from './pages/calendar/Calendar.jsx'
import ManagePeople from './pages/manage_members/Manage_Members.jsx'
import AssignTask from './pages/assign_task/Assign_Task.jsx'
import ScheduleMeeting from './pages/scheduling/ScheduleMeeting.jsx'
import GenerateSummary from './pages/summary/GenerateSummary.jsx'

// import Landing from './pages/LandingPage';
// import logo from './logo.svg';
// import './App.css';

function App() {
  return (
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //       Hi Guys this is pookie rookies :DDD
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
    <Router>
      <div>
        {/* Navigation */}
        {/* <nav>
          <a href="/">Home</a>
        </nav> */}

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/account" element={<Account />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/tools/manage-people" element={<ManagePeople />} />
          <Route path="/tools/assign-task" element={<AssignTask />} />
          <Route path="/tools/schedule-meeting" element={<ScheduleMeeting />} />
          <Route path="/tools/generate-summary" element={<GenerateSummary />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
