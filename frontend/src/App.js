import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/login/LoginPage'
import Home from './pages/home/Home'
import Account from './pages/account/Account.jsx'
import Calendar from './pages/calendar/Calendar.jsx'
import ManagePeople from './pages/manage_members/Manage_Members.jsx'
import AssignTask from './pages/assign_task/Assign_Task.jsx'
import ScheduleMeeting from './pages/scheduling/ScheduleMeeting.jsx'
import GenerateSummary from './pages/summary/GenerateSummary.jsx'
import UnfinalisedMeetings from './pages/scheduling/Sub-pages/UnfinalisedMeetings.jsx'
import MemberDetails from "./pages/manage_members/Sub-Pages/ViewMember.jsx";
import Reminders from "./pages/reminders/Reminders.jsx";
import MeetingPoll from "./pages/poll/MeetingPoll.jsx";

import AutoLogout from './Components/AutoLogout.js';

import PrivateRoute from "./routeProtection/privateRoute.js";
import { auth } from "./firebase/firebase";

import './App.css';
// import Landing from './pages/LandingPage';
// import logo from './logo.svg';

function App() {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem("authToken", token);
      } else {
        localStorage.removeItem("authToken");
      }
    });

    return () => unsubscribe(); // Cleanup the listener
  }, []);

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
        <AutoLogout>
        <div>
          {/* Routes */}
          <Routes>
            {/* public pages */}
            <Route path="/" element={<Login />} />
            <Route path="/poll/:id" element={<MeetingPoll />} />

            {/* protected routes */}
            <Route path="/home" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />
            <Route path="/account" element={
              <PrivateRoute>
                <Account />
              </PrivateRoute>
            } />
            <Route path="/calendar" element={
              <PrivateRoute>
                <Calendar />
              </PrivateRoute>
            } />
            <Route path="/tools/manage-people" element={
              <PrivateRoute>
                <ManagePeople />
              </PrivateRoute>
            } />
            <Route path="/tools/manage-people/:id" element={
              <PrivateRoute>
                <MemberDetails />
              </PrivateRoute>
            } />
            <Route path="/tools/assign-task" element={
              <PrivateRoute>
                <AssignTask />
              </PrivateRoute>
            } />
            <Route path="/tools/schedule-meeting" element={
              <PrivateRoute>
                <ScheduleMeeting />
              </PrivateRoute>
            } />
            <Route path="/tools/reminders" element={
              <PrivateRoute>
                <Reminders />
              </PrivateRoute>
            } />
            <Route path="/tools/generate-summary" element={
              <PrivateRoute>
                <GenerateSummary />
              </PrivateRoute>
            } />
            <Route path="/tools/schedule-meeting/unfinalised-meetings" element={
              <PrivateRoute>
                <UnfinalisedMeetings />
              </PrivateRoute>
            } />

          </Routes>
        </div>
        </AutoLogout>
      </Router>

  );
}

export default App;
