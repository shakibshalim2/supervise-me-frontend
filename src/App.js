import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"
import FacultyLogin from "./pages/FacultyLogin"
import StudentDashboard from "./pages/StudentDashboard"
import FacultyDashboard from "./pages/FacultyDashboard"
import ForgotPassword from "./pages/ForgotPassword"
import ActivateID from "./pages/ActivateID"
import ProtectedRoute from './pages/ProtectedRoute';
import ForgotPasswordFaculty from "./pages/ForgotPasswordFaculty"
import ResetPass from "./pages/ResetPass";
import ProfileSetting  from "./pages/FacultyDashboard";
import VideoCallPage from "./pages/VideoCallPage"
import FacultyAutoLogin from "./pages/FacultyAutoLogin"
import FacultyProtectedRoute from "./pages/FacultyProtectedRoute"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>
{/* Faculty Login with Auto-Login Check */}
        <Route 
          path="/faculty" 
          element={
            <FacultyAutoLogin>
              <FacultyLogin />
            </FacultyAutoLogin>
          } 
        />
        
        {/* Faculty Protected Routes */}
        <Route element={<FacultyProtectedRoute />}>
          <Route path="/faculty-dashboard" element={<FacultyDashboard/>}/>
          <Route path="/faculty-dashboard/profile" element={<ProfileSetting/>}/>
        </Route>        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route 
          path="/video-call/:teamId" 
          element={
          
              <VideoCallPage />
          
          } 
        />
        <Route path="/faculty-dashboard" element={<FacultyDashboard/>}/>
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/activate-id" element={<ActivateID/>}/>
        <Route path="/forgot-password/faculty" element={<ForgotPasswordFaculty/>}/>
        <Route path="/reset-pass/:token" element={<ResetPass/>}/>
        <Route path="/faculty-dashboard/profile" element={<ProfileSetting/>}/>

      </Routes>
    </BrowserRouter>
  )
}

export default App
