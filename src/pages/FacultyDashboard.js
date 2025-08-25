import React, { useCallback, useEffect, useState } from "react";
import { FaBars, FaBell, FaCamera, FaChalkboardTeacher, FaCheck, FaClipboardList, FaComments, FaCrown, FaDownload, FaEnvelope, FaEye, FaEyeSlash, FaInfoCircle, FaPaperclip, FaPaperPlane, FaSignOutAlt, FaSpinner, FaTimes, FaTrashAlt, FaUserGraduate, FaUserPlus } from "react-icons/fa";
import "./FacultyDashboard.css";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClipboardList, faCrown, faEdit, faExclamationTriangle, faEye, faEyeSlash, faInfoCircle, faSpinner, faSync, faTimes, faTrashAlt, faUndo, faUserMinus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import FacultyDeliverables from './FacultyDeliverables';

 const API_BASE = process.env.REACT_APP_API_URL;
const groups = [
  {
    id: 1,
    name: "Group Alpha",
    course: "Capstone A",
    progress: 65,
    members: 4,
    lastActivity: "2d ago",
  },
  {
    id: 2,
    name: "Group Beta",
    course: "Capstone B",
    progress: 82,
    members: 3,
    lastActivity: "1d ago",
  },
  {
    id: 3,
    name: "Group Gamma",
    course: "Capstone C",
    progress: 45,
    members: 5,
    lastActivity: "4h ago",
  },
];

function FacultyDashboard() {
 
  const [subView, setSubView] = useState("progress");
  const [activeTab, setActiveTab] = useState("");
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New group request received.", read: false },
    { id: 2, message: "New material uploaded by student.", read: false },
    { id: 3, message: "Meeting request from student.", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
// Add these with your other state declarations
const [selectedMemberForRemoval, setSelectedMemberForRemoval] = useState(null);
const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
const [isRemovingMember, setIsRemovingMember] = useState(false);

const [supervisionRequests, setSupervisionRequests] = useState([]);
const [showTeamDetailsModal, setShowTeamDetailsModal] = useState(false);
const [selectedTeamDetails, setSelectedTeamDetails] = useState(null);
const [isLoadingTeamDetails, setIsLoadingTeamDetails] = useState(false);
// Add these state declarations at the top with other useState declarations

// Add these with your existing useState declarations
const [showPhaseModal, setShowPhaseModal] = useState(false);
const [selectedTeamForPhase, setSelectedTeamForPhase] = useState(null);
const [newPhase, setNewPhase] = useState('A');
const [isUpdatingPhase, setIsUpdatingPhase] = useState(false);


const [unreadCount, setUnreadCount] = useState(0);
const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

const formatDuration = (days) => {
  if (days === 0) return 'Started today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) !== 1 ? 's' : ''} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) !== 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) !== 1 ? 's' : ''} ago`;
};

const getPhaseColor = (phase) => {
  const colors = {
    'A': '#3b82f6', // blue
    'B': '#f59e0b', // amber  
    'C': '#10b981'  // emerald
  };
  return colors[phase] || '#6b7280';
};

// Simple HTML message function
const showMessage = (message, type = 'info') => {
  // Remove any existing message
  const existingMessage = document.querySelector('.simple-message-display');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create new message element
  const messageDiv = document.createElement('div');
  messageDiv.className = `simple-message-display ${type}`;
  messageDiv.innerHTML = `
    <div class="message-content">
      <span>${message}</span>
      <button class="message-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Style the message
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff'};
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    font-family: Arial, sans-serif;
    max-width: 300px;
    word-wrap: break-word;
  `;

  messageDiv.querySelector('.message-content').style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  `;

  messageDiv.querySelector('.message-close').style.cssText = `
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    margin-left: 10px;
  `;

  // Add to document
  document.body.appendChild(messageDiv);

  // Auto remove after 5-6 seconds
  setTimeout(() => {
    if (messageDiv && messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 5500);
};



  const [profileData, setProfileData] = useState({
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@ewu.edu",
    department: "Computer Science",
    phone: "+880 1234 567890",
    office: "Building C, Room 405",
    profilePicture: null,
  });

  // Add this function inside your FacultyDashboard component or as a utility function
const formatMessageTime = (timestamp) => {
  try {
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid time';
    }
    
    // Format time as "10:30 AM" or "2:45 PM"
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
};

// Enhanced mobile handling useEffects
useEffect(() => {
  const handleResize = () => {
    const isMobileView = window.innerWidth <= 768;
    setIsMobile(isMobileView);
    
    // Close mobile menu when switching to desktop
    if (!isMobileView) {
      setShowMobileMenu(false);
    }
    
    // Reset sidebar collapsed state on mobile
    if (isMobileView) {
      setIsSidebarCollapsed(false);
    }
  };
  
  handleResize();
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

// Handle click outside to close mobile menu
useEffect(() => {
  const handleClickOutside = (event) => {
    if (isMobile && showMobileMenu) {
      const sidebar = document.querySelector('.faculty-sidebar');
      const toggle = document.querySelector('.mobile-menu-toggle');
      
      if (sidebar && toggle && 
          !sidebar.contains(event.target) && 
          !toggle.contains(event.target)) {
        setShowMobileMenu(false);
      }
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [isMobile, showMobileMenu]);

// Prevent body scroll when mobile menu is open
useEffect(() => {
  if (isMobile && showMobileMenu) {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  } else {
    document.body.style.overflow = 'unset';
    document.body.style.position = 'unset';
    document.body.style.width = 'unset';
  }

  return () => {
    document.body.style.overflow = 'unset';
    document.body.style.position = 'unset';
    document.body.style.width = 'unset';
  };
}, [isMobile, showMobileMenu]);


const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('facultyToken'); // Remove token
    navigate('/faculty'); // Redirect to login page
  };

// Update the mobile menu toggle click handler
const handleMobileMenuToggle = () => {
  setShowMobileMenu(!showMobileMenu);
};


const fetchNotifications = async () => {
  try {
    setIsLoadingNotifications(true);
    const token = localStorage.getItem('facultyToken');
    const response = await fetch(`${API_BASE}/api/faculty/notifications?limit=20`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
  } finally {
    setIsLoadingNotifications(false);
  }
};

const fetchUnreadCount = async () => {
  try {
    const token = localStorage.getItem('facultyToken');
    const response = await fetch(`${API_BASE}/api/faculty/notifications/unread-count`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      setUnreadCount(data.count || 0);
    }
  } catch (error) {
    console.error('Error fetching unread count:', error);
  }
};

const markAsRead = async (notificationId) => {
  try {
    const token = localStorage.getItem('facultyToken');
    const response = await fetch(`${API_BASE}/api/faculty/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

const markAllAsRead = async () => {
  try {
    const token = localStorage.getItem('facultyToken');
    const response = await fetch(`${API_BASE}/api/faculty/notifications/mark-all-read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

const toggleNotificationPanel = useCallback((e) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  setShowNotifications(prev => {
    if (!prev) {
      fetchNotifications(); // Fetch when opening
    }
    return !prev;
  });
}, []);

const formatNotificationTime = (timestamp) => {
  const now = new Date();
  const notifTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - notifTime) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return notifTime.toLocaleDateString();
};


// Add this to your FacultyDashboard.js file after the imports

const GRADING_SCALE = [
  { min: 80, max: 100, letter: 'A+', gpa: 4.00 },
  { min: 75, max: 79.99, letter: 'A', gpa: 3.75 },
  { min: 70, max: 74.99, letter: 'A-', gpa: 3.50 },
  { min: 65, max: 69.99, letter: 'B+', gpa: 3.25 },
  { min: 60, max: 64.99, letter: 'B', gpa: 3.00 },
  { min: 55, max: 59.99, letter: 'B-', gpa: 2.75 },
  { min: 50, max: 54.99, letter: 'C+', gpa: 2.50 },
  { min: 45, max: 49.99, letter: 'C', gpa: 2.25 },
  { min: 40, max: 44.99, letter: 'D', gpa: 2.00 },
  { min: 0, max: 39.99, letter: 'F', gpa: 0.00 }
];

// Utility function to convert percentage to grade
const convertPercentageToGrade = (percentage) => {
  if (percentage < 0 || percentage > 100) {
    return { letter: 'Invalid', gpa: 0.00, valid: false };
  }
  
  const grade = GRADING_SCALE.find(scale => 
    percentage >= scale.min && percentage <= scale.max
  );
  
  return {
    percentage: parseFloat(percentage).toFixed(2),
    letter: grade.letter,
    gpa: grade.gpa,
    valid: true
  };
};

// Utility function to get grade color for UI
const getGradeColor = (letter) => {
  const colors = {
    'A+': '#10b981', // green
    'A': '#059669',
    'A-': '#047857',
    'B+': '#3b82f6', // blue
    'B': '#2563eb',
    'B-': '#1d4ed8',
    'C+': '#f59e0b', // amber
    'C': '#d97706',
    'D': '#dc2626', // red
    'F': '#991b1b'
  };
  return colors[letter] || '#6b7280';
};


useEffect(() => {
  fetchUnreadCount();
  // Set up interval to check for new notifications every 30 seconds
  const interval = setInterval(fetchUnreadCount, 30000);
  return () => clearInterval(interval);
}, []);

const fetchSupervisionRequests = async () => {
  try {
    const token = localStorage.getItem('facultyToken');
    const response = await fetch(`${API_BASE}/api/faculty/supervision-requests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.requests) {
        setSupervisionRequests(data.requests);
      } else {
        console.error('Invalid response format:', data);
        setSupervisionRequests([]);
      }
    } else {
      console.error('Failed to fetch supervision requests:', response.status);
      setSupervisionRequests([]);
    }
  } catch (error) {
    console.error('Error fetching supervision requests:', error);
    setSupervisionRequests([]);
  }
};

// Add this function to fetch detailed team information
const fetchTeamDetails = async (teamId) => {
  setIsLoadingTeamDetails(true);
  try {
    const token = localStorage.getItem('facultyToken');
    console.log('Fetching team details for teamId:', teamId); // Debug log
    
    const response = await fetch(`${API_BASE}/api/faculty/team-details/${teamId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Team details response status:', response.status); // Debug log
    
    if (response.ok) {
      const data = await response.json();
      console.log('Team details data:', data); // Debug log
      
      if (data.success && data.team) {
        setSelectedTeamDetails(data.team);
        setShowTeamDetailsModal(true);
      } else {
        console.error('Invalid team details response:', data);
        alert('Failed to load team details: Invalid response format');
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('Team details API error:', response.status, errorData);
      alert(`Failed to load team details: ${errorData.message || 'Server error'}`);
    }
  } catch (error) {
    console.error('Error fetching team details:', error);
    alert('Network error: Failed to load team details');
  } finally {
    setIsLoadingTeamDetails(false);
  }
};


// Add this function to handle supervision request response
const handleSupervisionResponse = async (requestId, status) => {
  try {
    const token = localStorage.getItem('facultyToken');
    const response = await fetch(`${API_BASE}/api/faculty/supervision-requests/${requestId}/respond`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (response.ok) {
      // Refresh the requests list
      fetchSupervisionRequests();
      alert(`Supervision request ${status} successfully`);
    } else {
      alert('Failed to respond to supervision request');
    }
  } catch (error) {
    console.error('Error responding to supervision request:', error);
    alert('Network error: Failed to respond to request');
  }
};



// Add this useEffect to load supervision requests
useEffect(() => {
  fetchSupervisionRequests();
  // const interval = setInterval(fetchSupervisionRequests, 30000); // Refresh every 30 seconds
  // return () => clearInterval(interval);
}, []);

// Add this component to your FacultyDashboard.js

function GradeInputComponent({ 
  currentGrade, 
  onGradeChange, 
  disabled = false, 
  label = "Grade (0-100%)",
  showPreview = true 
}) {
  const [inputValue, setInputValue] = useState(currentGrade || '');
  const [gradeInfo, setGradeInfo] = useState(null);

  useEffect(() => {
    if (inputValue !== '') {
      const grade = convertPercentageToGrade(parseFloat(inputValue));
      setGradeInfo(grade);
    } else {
      setGradeInfo(null);
    }
  }, [inputValue]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
      onGradeChange(value);
    }
  };

  return (
    <div className="grade-input-container">
      <div className="grade-input-wrapper">
        <label className="grade-input-label">{label}</label>
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          className={`grade-input ${gradeInfo && !gradeInfo.valid ? 'error' : ''}`}
          placeholder="Enter percentage (0-100)"
        />
      </div>
      
      {showPreview && gradeInfo && gradeInfo.valid && (
        <div className="grade-preview">
          <div className="grade-display">
            <span className="percentage-display">{gradeInfo.percentage}%</span>
            <span 
              className="letter-grade"
              style={{ 
                backgroundColor: getGradeColor(gradeInfo.letter),
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              {gradeInfo.letter}
            </span>
            <span className="gpa-display">GPA: {gradeInfo.gpa.toFixed(2)}</span>
          </div>
        </div>
      )}
      
      {gradeInfo && !gradeInfo.valid && (
        <div className="grade-error">
          Please enter a valid percentage between 0 and 100
        </div>
      )}
    </div>
  );
}


// Add this to your faculty dashboard or create a separate component
const FacultyChatInterface = () => {
  const [supervisedTeams, setSupervisedTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [teamsWithUnreadMessages, setTeamsWithUnreadMessages] = useState(0); // NEW

  useEffect(() => {
    loadSupervisedTeams();
  }, []);

  const loadSupervisedTeams = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/supervised-teams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSupervisedTeams(data.teams || []);
                setTeamsWithUnreadMessages(data.teamsWithUnreadMessages || 0); // NEW

      } else {
        throw new Error('Failed to load supervised teams');
      }
    } catch (error) {
      console.error('Error loading supervised teams:', error);
      setError('Failed to load teams. Please try again.');
      setSupervisedTeams([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamMessages = async (teamId) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/teams/${teamId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        
        // Auto-scroll to bottom
         setTimeout(() => {
          loadSupervisedTeams();
        }, 1000);
        
        setTimeout(() => {
          const chatContainer = document.querySelector('.faculty-team-chat-messages');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
      }
    }  
    catch (error) {
      console.error('Error loading messages:', error);
      showMessage('Failed to load messages', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedTeam || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      const token = localStorage.getItem('facultyToken');
      let messageData = {
        message: newMessage.trim(),
        messageType: 'text'
      };

      // Handle file upload if there's a selected file
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('teamId', selectedTeam._id);

        const uploadResponse = await fetch(`${API_BASE}/api/files/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          messageData = {
            message: newMessage.trim() || `Shared a file: ${selectedFile.name}`,
            messageType: 'file',
            file: uploadData.file
          };
        }
      }

      const response = await fetch(`${API_BASE}/api/teams/${selectedTeam._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        setSelectedFile(null);
        
        // Scroll to bottom
        setTimeout(() => {
          const chatContainer = document.querySelector('.faculty-team-chat-messages');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
        
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      showMessage('Failed to send message', 'error');
    } finally {
      setIsSendingMessage(false);
    }
  };

const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    e.stopPropagation();
    // Don't call sendMessage directly, let the form handle it
    const form = e.target.closest('form');
    if (form) {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
    }
  }
};


  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showMessage('File size must be less than 10MB', 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const openChatModal = (team) => {
    setSelectedTeam(team);
    setShowChatModal(true);
    loadTeamMessages(team._id);
  };

  const closeChatModal = () => {
    setShowChatModal(false);
    setSelectedTeam(null);
    setMessages([]);
    setNewMessage('');
    setSelectedFile(null);
  };

  if (isLoading && supervisedTeams.length === 0) {
    return (
      <div className="faculty-team-chat-container">
        <div className="faculty-loading-messages">
          <FaSpinner className="spinning" />
          <span>Loading your supervised teams...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="faculty-team-chat-container">
        <div className="faculty-error-message">
          <h3>Unable to Load Teams</h3>
          <p>{error}</p>
          <button onClick={loadSupervisedTeams} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-team-chat-container">
      <div className="faculty-team-chat-header">
        <h2>Team Communications</h2>
        <p className="faculty-team-chat-subtitle">Chat with your supervised teams</p>
        {teamsWithUnreadMessages > 0 && (
            <div className="unread-teams-indicator">
              <span className="unread-badge">{teamsWithUnreadMessages}</span>
              <span>team{teamsWithUnreadMessages !== 1 ? 's' : ''} with new messages</span>
            </div>
          )}
        </div>
      

      <div className="faculty-supervised-teams-grid">
        {supervisedTeams.length === 0 ? (
          <div className="faculty-no-teams-message">
            <div className="faculty-no-teams-icon">💬</div>
            <h3>No Supervised Teams</h3>
            <p>You don't have any supervised teams to chat with yet.</p>
            <p>Accept team supervision requests to start communicating with teams.</p>
          </div>
        ) : (
 supervisedTeams.map(team => (
            <div key={team._id} className={`faculty-team-chat-card ${team.hasUnreadMessages ? 'has-unread' : ''}`}>
              <div className="faculty-team-card-header">
                <div className="team-header-left">
                  <h3>{team.name}</h3>
                  {/* NEW: Show unread count on team card */}
                  {team.unreadCount > 0 && (
                    <div className="team-unread-count">
                      <span className="unread-count-badge">{team.unreadCount}</span>
                    </div>
                  )}
                </div>
                <span className={`faculty-team-status-badge status-${team.status}`}>
                  {team.status}
                </span>
              </div>
              
              <div className="faculty-team-info">
                <div className="faculty-team-meta">
                  <span>👥 {team.members?.length || 0} members</span>
                  <span>📚 {team.major}</span>
                  <span className="faculty-team-phase">Phase {team.currentPhase || 'A'}</span>
                </div>
                

                {team.latestMessage && (
                  <div className="latest-message-preview">
                    <div className="message-preview-content">
                      <span className="message-sender">{team.latestMessage.senderName}:</span>
                      <span className="message-text">
                        {team.latestMessage.text.length > 30 
                          ? `${team.latestMessage.text.substring(0, 30)}...` 
                          : team.latestMessage.text}
                      </span>
                    </div>
                    <div className="message-time">
                      {formatMessageTime(team.latestMessage.timestamp)}
                    </div>
                  </div>
                )}

               <div className="faculty-team-members-preview">
                  {team.members?.slice(0, 3).map((member, index) => (
                    <div key={index} className="faculty-member-avatar-small">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} />
                      ) : (
                        <div className="faculty-avatar-fallback-small">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  ))}
                  {team.members?.length > 3 && (
                    <div className="faculty-more-members">+{team.members.length - 3}</div>
                  )}
                </div>
              </div>

              <button 
                className={`faculty-open-chat-btn ${team.hasUnreadMessages ? 'has-unread-btn' : ''}`}
                onClick={() => openChatModal(team)}
              >
                <FaComments />
                {team.hasUnreadMessages ? `Open Chat (${team.unreadCount})` : 'Open Chat'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Chat Modal - keep your existing modal code here */}
      {showChatModal && selectedTeam && (
<div 
  className="faculty-team-chat-modal-overlay" 
  onMouseDown={(e) => {
    // Only close if the actual overlay was clicked, not a child element
    if (e.target === e.currentTarget) {
      e.preventDefault();
      closeChatModal();
    }
  }}
  onClick={(e) => e.stopPropagation()}
>
<div 
  className="faculty-team-chat-modal" 
  onClick={(e) => e.stopPropagation()}
  onMouseDown={(e) => e.stopPropagation()}
  onSubmit={(e) => e.stopPropagation()}
>
            {/* Your existing modal content */}
            {/* Modal Header */}
            <div className="faculty-team-chat-modal-header">
              <div className="faculty-modal-header-info">
                <h3>Team: {selectedTeam.name}</h3>
                <div className="faculty-modal-header-meta">
                  <span className="faculty-member-count">👥 {selectedTeam.members?.length || 0} members</span>
                  <span className="faculty-team-phase-badge">Phase {selectedTeam.currentPhase || 'A'}</span>
                  <span className={`faculty-status-indicator status-${selectedTeam.status}`}>
                    {selectedTeam.status}
                  </span>
                </div>
              </div>
              <button className="faculty-close-modal-btn" onClick={closeChatModal}>
                <FaTimes />
              </button>
            </div>

            {/* Team Members Info */}
            <div className="faculty-team-members-bar">
              {selectedTeam.members?.map((member, index) => (
                <div key={index} className="faculty-member-chip">
                  <div className="faculty-member-avatar-tiny">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} />
                    ) : (
                      <div className="faculty-avatar-tiny-fallback">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="faculty-member-name-tiny">{member.name}</span>
                  {member.role === 'Leader' && (
                    <FaCrown className="faculty-leader-crown-tiny" />
                  )}
                </div>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="faculty-team-chat-messages">
              {isLoading ? (
                <div className="faculty-loading-messages">
                  <FaSpinner className="spinning" />
                  <span>Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="faculty-no-messages-yet">
                  <FaComments className="faculty-empty-chat-icon" />
                  <h4>Start the conversation</h4>
                  <p>Send your first message to begin chatting with your team!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div 
                    key={msg._id || index} 
                    className={`faculty-chat-message ${msg.senderType === 'faculty' ? 'faculty-message-sent' : 'faculty-message-received'}`}
                  >
                    <div className="faculty-message-avatar">
                      {msg.senderType === 'faculty' ? (
                        <div className="faculty-supervisor-avatar">
                          <FaChalkboardTeacher />
                        </div>
                      ) : (
                        <div className="faculty-student-avatar">
                          {msg.senderName?.charAt(0) || 'S'}
                        </div>
                      )}
                    </div>
                    
                    <div className="faculty-message-content">
                      <div className="faculty-message-header">
                        <span className="faculty-sender-name">{msg.senderName}</span>
                        <span className={`faculty-sender-role ${msg.senderType}`}>
                          {msg.senderType === 'faculty' ? '👨‍🏫 Supervisor' : '👨‍🎓 Student'}
                        </span>
                        <span className="faculty-message-time">
                          {formatMessageTime(msg.timestamp)}
                        </span>
                      </div>
                      
                      <div className="faculty-message-body">
                        {msg.messageType === 'file' && msg.file ? (
                          <div className="faculty-file-message">
                            <div className="faculty-file-icon">
                              📎
                            </div>
                            <div className="faculty-file-info">
                              <a 
                                href={msg.file.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="faculty-file-link"
                              >
                                {msg.file.originalName}
                              </a>
                              <span className="faculty-file-size">
                                ({(msg.file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="faculty-message-text">{msg.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
<form 
  onSubmit={(e) => {
    e.preventDefault();
    e.stopPropagation();
    sendMessage();
  }}
  className="faculty-team-chat-input-area"
>
              {selectedFile && (
                <div className="faculty-selected-file-preview">
                  <div className="faculty-file-preview-info">
                    <span className="faculty-file-icon">📎</span>
                    <span className="faculty-file-name">{selectedFile.name}</span>
                    <span className="faculty-file-size">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button 
                    className="faculty-remove-file-btn"
                    onClick={removeSelectedFile}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
              
              <div className="faculty-chat-input-container">
                <div className="faculty-input-tools">
                  <label className="faculty-file-upload-btn" title="Attach File">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    />
                    <FaPaperclip />
                  </label>
                </div>
                
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message to the team..."
                  className="faculty-message-input"
                  rows="2"
                  disabled={isSendingMessage}
                />
                
<button 
  type="submit"
  disabled={(!newMessage.trim() && !selectedFile) || isSendingMessage}
  className="faculty-send-message-btn"
>


                  {isSendingMessage ? (
                    <FaSpinner className="spinning" />
                  ) : (
                    <FaPaperPlane />
                  )}
                </button>
              </div>
            </form> 
          </div>
        </div>
      )}
    </div>
  );
};




function SupervisionRequests() {
  return (
    <div className="supervision-requests-container">
      <div className="supervision-header">
        <h2>Team Supervision Requests</h2>
        <button 
          className="refresh-button"
          onClick={fetchSupervisionRequests}
        >
          <FontAwesomeIcon icon={faSync} />
          Refresh
        </button>
      </div>

      <div className="requests-grid">
        {supervisionRequests.length === 0 ? (
          <div className="no-requests">
            <p>No supervision requests received yet.</p>
          </div>
        ) : (
          supervisionRequests.map((request) => (
            <div key={request._id} className="request-card">
              <div className="request-header">
                <h3>{request.teamName}</h3>
                <span className={`status-badge ${request.status.toLowerCase()}`}>
                  {request.status}
                </span>
              </div>

              <div className="request-info">
                <div className="team-info">
                  <p><strong>Major:</strong> {request.teamMajor}</p>
                  <p><strong>Semester:</strong> {request.teamSemester}</p>
                  <p><strong>Members:</strong> {request.memberCount}/4</p>
                </div>
                
                <div className="project-info">
                  <p><strong>Project:</strong> {request.projectIdea}</p>
                </div>

                <div className="requester-info">
                  <p><strong>Requested by:</strong> {request.requesterName} ({request.requesterStudentId})</p>
                  <p><strong>Message:</strong> {request.message}</p>
                </div>

                <div className="request-date">
                  <small>Received: {new Date(request.requestDate).toLocaleDateString()}</small>
                </div>
              </div>

              <div className="request-actions">
                <button 
                  className="view-details-btn"
                  onClick={() => fetchTeamDetails(request.teamId)}
                  disabled={isLoadingTeamDetails}
                >
                  <FontAwesomeIcon icon={faEye} />
                  {isLoadingTeamDetails ? 'Loading...' : 'View Team Details'}
                </button>

                {request.status === 'pending' && (
                  <div className="response-actions">
                    <button 
                      className="accept-btn"
                      onClick={() => handleSupervisionResponse(request._id, 'accepted')}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                      Accept
                    </button>
                    <button 
                      className="decline-btn"
                      onClick={() => handleSupervisionResponse(request._id, 'rejected')}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


function TeamDetailsModal() {
  if (!showTeamDetailsModal || !selectedTeamDetails) {
    console.log('Modal not showing:', { showTeamDetailsModal, selectedTeamDetails }); // Debug log
    return null;
  }

  console.log('Rendering team details modal for:', selectedTeamDetails.name); // Debug log

  const handleRemoveMember = async (teamId, memberStudentId, memberName) => {
    setSelectedMemberForRemoval({ teamId, studentId: memberStudentId, name: memberName });
    setShowRemoveMemberModal(true);
  };

  const confirmRemoveMember = async () => {
    if (!selectedMemberForRemoval) return;

    setIsRemovingMember(true);

    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/teams/${selectedMemberForRemoval.teamId}/remove-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          memberStudentId: selectedMemberForRemoval.studentId,
          reason: 'Removed by supervisor'
        })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(`${selectedMemberForRemoval.name} has been removed from the team`, 'success');
        setShowRemoveMemberModal(false);
        setSelectedMemberForRemoval(null);
        // Refresh team details
        fetchTeamDetails(selectedTeamDetails._id);
      } else {
        showMessage(data.message || "Failed to remove member", 'error');
      }
    } catch (error) {
      console.error('Remove member error:', error);
      showMessage("Network error: Failed to remove member", 'error');
    } finally {
      setIsRemovingMember(false);
      setShowRemoveMemberModal(false);
      setSelectedMemberForRemoval(null);
    }
  };

  const cancelRemoveMember = () => {
    setShowRemoveMemberModal(false);
    setSelectedMemberForRemoval(null);
  };


return (
    <div className="team-details-overlay" onClick={() => setShowTeamDetailsModal(false)}>
      <div className="team-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Team Details</h2>
          <button 
            className="close-button"
            onClick={() => setShowTeamDetailsModal(false)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-content">
          {/* Team Information Section */}
          <div className="team-info-section">
            <h3>Team Information</h3>
            <div className="team-info-grid">
              <div className="info-item">
                <strong>Team Name:</strong>
                <span>{selectedTeamDetails.name || 'N/A'}</span>
              </div>
              <div className="info-item">
                <strong>Major:</strong>
                <span>{selectedTeamDetails.major || 'N/A'}</span>
              </div>
              <div className="info-item">
                <strong>Semester:</strong>
                <span>{selectedTeamDetails.semester || 'N/A'}</span>
              </div>
              <div className="info-item">
                <strong>Course:</strong>
                <span>{selectedTeamDetails.capstone || 'CSE 400'}</span>
              </div>
              <div className="info-item">
                <strong>Members:</strong>
                <span>{selectedTeamDetails.memberCount || selectedTeamDetails.members?.length || 0}/4</span>
              </div>
              <div className="info-item">
                <strong>Status:</strong>
                <span className={`status ${selectedTeamDetails.status}`}>
                  {selectedTeamDetails.status || 'active'}
                </span>
              </div>
            </div>

            <div className="project-description">
              <h4>Project Description</h4>
              <p>{selectedTeamDetails.projectIdea || 'No project description provided.'}</p>
            </div>

            {selectedTeamDetails.description && (
              <div className="team-description">
                <h4>Additional Details</h4>
                <p>{selectedTeamDetails.description}</p>
              </div>
            )}

            {/* Team Statistics */}
            <div className="team-statistics">
              <h4>Team Statistics</h4>
              <div className="stats-grid">
                <div className="stat-item-faculty">
                  <strong>Average CGPA:</strong>
                  <span>{(selectedTeamDetails.averageCGPA || 0).toFixed(2)}</span>
                </div>
              
                <div className="stat-item-faculty">
                  <strong>Created:</strong>
                  <span>{new Date(selectedTeamDetails.createdDate || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members Section */}
          <div className="team-members-section">
            <h3>Team Members ({selectedTeamDetails.members?.length || 0})</h3>
            <div className="members-list-faculty">
              {selectedTeamDetails.members?.map((member, index) => (
                <div key={index} className="member-card">
                  <div className="member-avatar">
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={`${member.name}'s avatar`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="avatar-fallback"
                      style={{display: member.avatar ? 'none' : 'flex'}}
                    >
                      {(member.name || 'Unknown').charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="member-info">
                    <div className="member-header">
                      <h4>{member.name || 'Unknown'}</h4>
                      <span className={`role-badge ${(member.role || 'member').toLowerCase()}`}>
                        {member.role || 'Member'}
                        {member.role === 'Leader' && <FontAwesomeIcon icon={faCrown} />}
                      </span>
                    </div>

                    <div className="member-details">
                      <div className="detail-row">
                        <strong>Student ID:</strong>
                        <span>{member.studentId || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <strong>Email:</strong>
                        <span>{member.email || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <strong>Program:</strong>
                        <span>{member.program || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <strong>Completed Credits:</strong>
                        <span>{member.completedCredits || 0}</span>
                      </div>
                      <div className="detail-row">
                        <strong>CGPA:</strong>
                        <span>{(member.cgpa || 0).toFixed(2)}</span>
                      </div>
                      {member.phone && member.phone !== 'Not available' && (
                        <div className="detail-row">
                          <strong>Phone:</strong>
                          <span>{member.phone}</span>
                        </div>
                      )}
                      <div className="detail-row">
                        <strong>Joined Team:</strong>
                        <span>{new Date(member.joinedDate || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="member-actions">
                      <button
                        className="remove-member-btn-faculty"
                        onClick={() => handleRemoveMember(selectedTeamDetails._id, member.studentId, member.name)}
                        title="Remove this member from team"
                      >
                        <FontAwesomeIcon icon={faUserMinus} />
                        Remove Member
                      </button>
                    </div>
                  </div>
                </div>
              )) || <p>No members found</p>}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="close-modal-btn-faculty"
            onClick={() => setShowTeamDetailsModal(false)}
          >
            Close
          </button>
        </div>

        {/* Remove Member Confirmation Modal */}
        {showRemoveMemberModal && selectedMemberForRemoval && (
          <div className="remove-member-modal-overlay" onClick={cancelRemoveMember}>
            <div className="remove-member-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="warning-icon">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                </div>
                <h3>Remove Team Member</h3>
                <button 
                  className="close-button"
                  onClick={cancelRemoveMember}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="modal-body">
                <div className="member-info-display">
                  <div className="member-details-display">
                    <h4>{selectedMemberForRemoval.name}</h4>
                    <p>will be removed from the team permanently</p>
                  </div>
                </div>

                <div className="warning-message">
                  <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
                  <div className="message-content-f">
                    <p><strong>Are you sure you want to remove {selectedMemberForRemoval.name}?</strong></p>
                    <p>This action will:</p>
                    <ul>
                      <li>Remove them from all team activities</li>
                      <li>Remove their access to team resources</li>
                      <li>Allow them to join other teams</li>
                      <li>Notify them of the removal</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-remove-btn"
                  onClick={cancelRemoveMember}
                  disabled={isRemovingMember}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Cancel
                </button>
                <button
                  className="confirm-remove-btn"
                  onClick={confirmRemoveMember}
                  disabled={isRemovingMember}
                >
                  {isRemovingMember ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="spinning-student" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUserMinus} />
                      Remove Member
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

  // Add to FacultyDashboard.js
// Enhanced ViewGroupInvitations component with inline team member details
function ViewGroupInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [expandedTeams, setExpandedTeams] = useState(new Set()); // Track expanded teams
  const [teamDetails, setTeamDetails] = useState(new Map()); // Cache team details

  // Fetch supervision requests (team invitations)
  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/supervision-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.requests) {
          setInvitations(data.requests);
        } else {
          console.error('Invalid response format:', data);
          setInvitations([]);
        }
      } else {
        console.error('Failed to fetch team invitations:', response.status);
        setInvitations([]);
      }
    } catch (error) {
      console.error('Error fetching team invitations:', error);
      setInvitations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch detailed team information for inline display
  const fetchAndCacheTeamDetails = async (teamId) => {
    if (teamDetails.has(teamId)) {
      return teamDetails.get(teamId); // Return cached data
    }

    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/team-details/${teamId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.team) {
          setTeamDetails(prev => new Map(prev.set(teamId, data.team)));
          return data.team;
        }
      }
    } catch (error) {
      console.error('Error fetching team details:', error);
    }
    return null;
  };

  // Toggle team member details expansion
  const toggleTeamExpansion = async (teamId) => {
    const newExpanded = new Set(expandedTeams);
    
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
      // Fetch team details if not already cached
      if (!teamDetails.has(teamId)) {
        await fetchAndCacheTeamDetails(teamId);
      }
    }
    
    setExpandedTeams(newExpanded);
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  // Handle invitation response
  const handleInvitationResponse = async (invitationId, response) => {
    try {
      const token = localStorage.getItem('facultyToken');
      const apiResponse = await fetch(`${API_BASE}/api/faculty/supervision-requests/${invitationId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: response })
      });

      if (apiResponse.ok) {
        fetchInvitations();
        alert(`Supervision request ${response} successfully`);
      } else {
        alert('Failed to respond to supervision request');
      }
    } catch (error) {
      console.error('Error responding to supervision request:', error);
      alert('Network error: Failed to respond to request');
    }
  };

  // Filter invitations
  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = invitation.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invitation.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invitation.projectIdea.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || invitation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const refreshInvitations = () => {
    console.log('Manual refresh triggered');
    fetchInvitations();
  };

  if (isLoading) {
    return (
      <div className="faculty-invitations-loading-state">
        <p>Loading team invitations...</p>
      </div>
    );
  }

  return (
    <div className="faculty-invitations-container">
      <div className="faculty-invitations-section-header">
        <h2>Team Supervision Invitations</h2>
        <div className="faculty-invitations-controls">
          <select 
            className="faculty-invitations-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="text"
            placeholder="Search teams..."
            className="faculty-invitations-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            className="faculty-invitations-refresh-button"
            onClick={refreshInvitations}
          >
            <FontAwesomeIcon icon={faSync} />
            Refresh
          </button>
        </div>
      </div>

      <div className="faculty-invitations-list">
        {filteredInvitations.length === 0 ? (
          <div className="faculty-invitations-no-invitations">
            <p>No team supervision invitations found.</p>
          </div>
        ) : (
          filteredInvitations.map((invitation) => {
            const isExpanded = expandedTeams.has(invitation.teamId);
            const teamDetail = teamDetails.get(invitation.teamId);

            return (
              <div key={invitation._id} className="faculty-invitations-team-invitation">
                <div className="faculty-invitations-invite-content">
                  <div className="faculty-invitations-invite-header">
                    <h3>{invitation.teamName}</h3>
                    <div className="invitation-header-actions">
                      <span className={`faculty-invitations-status-badge ${invitation.status}`}>
                        {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                      </span>
                      <button 
                        className="team-expand-toggle"
                        onClick={() => toggleTeamExpansion(invitation.teamId)}
                        title={isExpanded ? "Hide team member details" : "Show team member details"}
                      >
                        <FontAwesomeIcon icon={isExpanded ? faTimes : faEye} />
                        {isExpanded ? "Hide Details" : "Show Team Details"}
                      </button>
                    </div>
                  </div>
                  
                  <div className="faculty-invitations-team-basic-info">
                    <p><strong>Major:</strong> {invitation.teamMajor || 'Not specified'}</p>
                    <p><strong>Semester:</strong> {invitation.teamSemester || 'Not specified'}</p>
                    <p><strong>Team Members:</strong> {invitation.memberCount}/4</p>
                    <p><strong>Requested By:</strong> {invitation.requesterName} ({invitation.requesterStudentId})</p>
                  </div>

                  <div className="faculty-invitations-project-info">
                    <p><strong>Project Description:</strong></p>
                    <p>{invitation.projectIdea || 'No project description provided.'}</p>
                  </div>

                  <div className="faculty-invitations-request-info">
                    <p><strong>Message from Team:</strong></p>
                    <p>{invitation.message || 'No additional message provided.'}</p>
                  </div>

                  {/* Enhanced Team Member Details Section */}
                  {isExpanded && teamDetail && (
                    <div className="team-members-detailed-view">
                      <div className="team-stats-summary">
                        <h4>Team Statistics</h4>
                        <div className="stats-grid-inline">
                          <div className="stat-item-inline">
                            <strong>Average CGPA:</strong>
                            <span>{(teamDetail.averageCGPA || 0).toFixed(2)}</span>
                          </div>
                          
                          <div className="stat-item-inline">
                            <strong>Created:</strong>
                            <span>{new Date(teamDetail.createdDate || Date.now()).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="team-members-detailed-section">
                        <h4>Team Members ({teamDetail.members?.length || 0})</h4>
                        <div className="members-grid-inline">
                          {teamDetail.members?.map((member, index) => (
                            <div key={index} className="member-card-inline">
                              <div className="member-header-inline">
                                <div className="member-avatar-inline">
                                  {member.avatar ? (
                                    <img 
                                      src={member.avatar} 
                                      alt={`${member.name}'s avatar`}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div 
                                    className="avatar-fallback-inline"
                                    style={{display: member.avatar ? 'none' : 'flex'}}
                                  >
                                    {(member.name || 'Unknown').charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                <div className="member-basic-info">
                                  <h5>{member.name || 'Unknown'}</h5>
                                  <span className={`role-badge-inline ${(member.role || 'member').toLowerCase()}`}>
                                    {member.role || 'Member'}
                                    {member.role === 'Leader' && <FontAwesomeIcon icon={faCrown} />}
                                  </span>
                                </div>
                              </div>

                              <div className="member-details-grid">
                                <div className="detail-row-inline">
                                  <strong>Student ID:</strong>
                                  <span>{member.studentId || 'N/A'}</span>
                                </div>
                                <div className="detail-row-inline">
                                  <strong>Email:</strong>
                                  <span>{member.email || 'N/A'}</span>
                                </div>
                                <div className="detail-row-inline">
                                  <strong>Program:</strong>
                                  <span>{member.program || 'N/A'}</span>
                                </div>
                                <div className="detail-row-inline">
                                  <strong>Completed Credits:</strong>
                                  <span className={member.completedCredits >= 95 ? 'credits-sufficient' : 'credits-insufficient'}>
                                    {member.completedCredits || 0}
                                  </span>
                                </div>
                                <div className="detail-row-inline">
                                  <strong>CGPA:</strong>
                                  <span className={`cgpa-${member.cgpa >= 3.0 ? 'good' : member.cgpa >= 2.5 ? 'average' : 'low'}`}>
                                    {(member.cgpa || 0).toFixed(2)}
                                  </span>
                                </div>
                                {member.phone && member.phone !== 'Not available' && (
                                  <div className="detail-row-inline">
                                    <strong>Phone:</strong>
                                    <span>{member.phone}</span>
                                  </div>
                                )}
                                <div className="detail-row-inline">
                                  <strong>Joined Team:</strong>
                                  <span>{new Date(member.joinedDate || Date.now()).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          )) || <p>No members found</p>}

                        
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="faculty-invitations-request-date">
                    <p><strong>Request Date:</strong> {new Date(invitation.requestDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="faculty-invitations-invite-actions">
                  {invitation.status === 'pending' && (
                    <>
                      <button 
                        className="faculty-invitations-action-button faculty-invitations-accept"
                        onClick={() => handleInvitationResponse(invitation._id, 'accepted')}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                        Accept Supervision
                      </button>
                      <button 
                        className="faculty-invitations-action-button faculty-invitations-decline"
                        onClick={() => handleInvitationResponse(invitation._id, 'rejected')}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        Decline
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}



  function MaterialsUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    targetType: 'all', // 'all', 'phase', 'teams', 'students'
    targetPhase: '',
    targetTeams: [],
    targetStudents: []
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMaterials, setUploadedMaterials] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [errors, setErrors] = useState({});

    const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Fetch available teams and students on component mount
  useEffect(() => {
    fetchAvailableTeams();
    fetchAvailableStudents();
    fetchUploadedMaterials();
  }, []);


  
const filteredStudents = availableStudents.filter(student => {
    if (!studentSearchQuery.trim()) return true;
    
    const query = studentSearchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.studentId.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.program.toLowerCase().includes(query)
    );
  });


  const fetchAvailableTeams = async () => {
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/supervised-teams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      showMessage('Failed to load teams', 'error');
    }
  };

  const fetchAvailableStudents = async () => {
  try {
    const token = localStorage.getItem('facultyToken');
    // Use a different endpoint that returns all active students for materials upload
    const response = await fetch(`${API_BASE}/api/faculty/all-active-students`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      setAvailableStudents(data.students || []);
    } else {
      throw new Error('Failed to fetch students');
    }
  } catch (error) {
    console.error('Error fetching students:', error);
    showMessage('Failed to load students', 'error');
  }
};

  const fetchUploadedMaterials = async () => {
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/materials`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUploadedMaterials(data.materials || []);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      showMessage('Failed to load materials', 'error');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setErrors({ file: 'File size must be less than 50MB' });
        return;
      }
      
      // Validate file type
      const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint', 
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',  // ✅ For .pptx files
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-zip-compressed',
      'text/plain', 'text/csv'
    ];

      if (!allowedTypes.includes(file.type)) {
        setErrors({ file: 'File type not supported. Please use PDF, PPT, DOC, XLS, ZIP, TXT, CSV, or image files.' });
        return;
      }
      
      setSelectedFile(file);
      setErrors({});
      
      // Auto-generate title from filename if not set
      if (!uploadData.title) {
        const fileName = file.name.split('.')[0];
        setUploadData(prev => ({
          ...prev,
          title: fileName.charAt(0).toUpperCase() + fileName.slice(1)
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedFile) {
      newErrors.file = 'Please select a file to upload';
    }
    
    if (!uploadData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (uploadData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }
    
    if (uploadData.targetType === 'phase' && !uploadData.targetPhase) {
      newErrors.targetPhase = 'Please select a phase';
    }
    
    if (uploadData.targetType === 'teams' && uploadData.targetTeams.length === 0) {
      newErrors.targetTeams = 'Please select at least one team';
    }
    
    if (uploadData.targetType === 'students' && uploadData.targetStudents.length === 0) {
      newErrors.targetStudents = 'Please select at least one student';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadData.title.trim());
      formData.append('description', uploadData.description.trim());
      formData.append('targetType', uploadData.targetType);
      
      if (uploadData.targetType === 'phase') {
        formData.append('targetPhase', uploadData.targetPhase);
      } else if (uploadData.targetType === 'teams') {
        formData.append('targetTeams', JSON.stringify(uploadData.targetTeams));
      } else if (uploadData.targetType === 'students') {
        formData.append('targetStudents', JSON.stringify(uploadData.targetStudents));
      }
      
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/materials/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        showMessage('Material uploaded successfully!', 'success');
        
        // Reset form
        setSelectedFile(null);
        setUploadData({
          title: '',
          description: '',
          targetType: 'all',
          targetPhase: '',
          targetTeams: [],
          targetStudents: []
        });
        
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
        // Refresh materials list
        fetchUploadedMaterials();
      } else {
        showMessage(result.message || 'Upload failed', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('Upload failed. Please check your connection and try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId, materialTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${materialTitle}"?`)) return;
    
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/materials/${materialId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        showMessage('Material deleted successfully', 'success');
        fetchUploadedMaterials();
      } else {
        const error = await response.json();
        showMessage(error.message || 'Failed to delete material', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showMessage('Failed to delete material', 'error');
    }
  };

  const getTargetDisplay = (material) => {
    switch (material.targetType) {
      case 'all':
        return 'All Students';
      case 'phase':
        return `Phase ${material.targetPhase} Students`;
      case 'teams':
        const teamCount = material.targetTeams?.length || 0;
        return `Selected Teams (${teamCount})`;
      case 'students':
        const studentCount = material.targetStudents?.length || 0;
        return `Selected Students (${studentCount})`;
      default:
        return 'Unknown';
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📊';
    if (fileType.includes('document') || fileType.includes('word')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📈';
    if (fileType.includes('zip')) return '📦';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('text')) return '📄';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="materials-upload-container">
      {/* Upload Section */}
      <div className="upload-section">
        <h2>Upload Learning Materials</h2>
        
        <div className="upload-form">
          {/* File Selection */}
          <div className="form-group">
            <label>Select File *</label>
            <div className="file-input-container">
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.zip,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp"
                className={errors.file ? 'error' : ''}
              />
              {selectedFile && (
                <div className="selected-file-info">
                  <span className="file-icon">{getFileIcon(selectedFile.type)}</span>
                  <div className="file-details">
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size">({formatFileSize(selectedFile.size)})</span>
                  </div>
                  <button 
                    type="button"
                    className="remove-file-btn"
                    onClick={() => {
                      setSelectedFile(null);
                      const fileInput = document.querySelector('input[type="file"]');
                      if (fileInput) fileInput.value = '';
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
            {errors.file && <span className="error-message">{errors.file}</span>}
          </div>

          {/* Title */}
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={uploadData.title}
              onChange={(e) => {
                setUploadData(prev => ({ ...prev, title: e.target.value }));
                if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
              }}
              placeholder="Enter material title"
              className={errors.title ? 'error' : ''}
              maxLength="100"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description/Notes (Optional)</label>
            <textarea
              value={uploadData.description}
              onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add instructions or notes about this material"
              rows="3"
              maxLength="500"
            />
            <small className="char-count">
              {uploadData.description.length}/500 characters
            </small>
          </div>

          {/* Target Audience */}
          <div className="form-group">
            <label>Target Audience *</label>
            <select
              value={uploadData.targetType}
              onChange={(e) => setUploadData(prev => ({ 
                ...prev, 
                targetType: e.target.value,
                targetPhase: '',
                targetTeams: [],
                targetStudents: []
              }))}
            >
              <option value="all">All Students</option>
              <option value="phase">Specific Phase</option>
              <option value="teams">Specific Teams</option>
              <option value="students">Specific Students</option>
            </select>
          </div>

          {/* Phase Selection */}
          {uploadData.targetType === 'phase' && (
            <div className="form-group">
              <label>Select Phase *</label>
              <select
                value={uploadData.targetPhase}
                onChange={(e) => {
                  setUploadData(prev => ({ ...prev, targetPhase: e.target.value }));
                  if (errors.targetPhase) setErrors(prev => ({ ...prev, targetPhase: '' }));
                }}
                className={errors.targetPhase ? 'error' : ''}
              >
                <option value="">Select Phase</option>
                <option value="A">Phase A (Research & Planning)</option>
                <option value="B">Phase B (Development & Implementation)</option>
                <option value="C">Phase C (Testing & Final Presentation)</option>
              </select>
              {errors.targetPhase && <span className="error-message">{errors.targetPhase}</span>}
            </div>
          )}

          {/* Team Selection */}
          {uploadData.targetType === 'teams' && (
            <div className="form-group">
              <label>Select Teams *</label>
              <div className="checkbox-group">
                {availableTeams.length === 0 ? (
                  <p className="no-options">No supervised teams available</p>
                ) : (
                  availableTeams.map(team => (
                    <label key={team._id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={uploadData.targetTeams.includes(team._id)}
                        onChange={(e) => {
                          const teamId = team._id;
                          setUploadData(prev => ({
                            ...prev,
                            targetTeams: e.target.checked
                              ? [...prev.targetTeams, teamId]
                              : prev.targetTeams.filter(id => id !== teamId)
                          }));
                          if (errors.targetTeams) setErrors(prev => ({ ...prev, targetTeams: '' }));
                        }}
                      />
                      <span>{team.name} ({team.members?.length || 0} members)</span>
                    </label>
                  ))
                )}
              </div>
              {errors.targetTeams && <span className="error-message">{errors.targetTeams}</span>}
            </div>
          )}

          {/* Student Selection */}
          {uploadData.targetType === 'students' && (
            <div className="form-group">
              <label>Select Students *</label>
              <div className="student-search-container" style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Search students by name, ID, email, or program..."
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              className="student-search-input"
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px',
                marginBottom: '10px'
              }}
            />
            {studentSearchQuery && (
              <div className="search-results-info" style={{ 
                fontSize: '13px', 
                color: '#666', 
                marginBottom: '10px' 
              }}>
                Showing {filteredStudents.length} of {availableStudents.length} students
                <button 
                  type="button"
                  onClick={() => setStudentSearchQuery('')}
                  style={{
                    marginLeft: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#007bff',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
          
             <div className="student-search-container" style={{ marginBottom: '15px' }}>

            {studentSearchQuery && (
              <div className="search-results-info" style={{ 
                fontSize: '13px', 
                color: '#666', 
                marginBottom: '10px' 
              }}>
                Showing {filteredStudents.length} of {availableStudents.length} students
                <button 
                  type="button"
                  onClick={() => setStudentSearchQuery('')}
                  style={{
                    marginLeft: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#007bff',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          {/* ✅ UPDATED: Use filtered students instead of all students */}
          <div className="checkbox-group student-selection">
            {filteredStudents.length === 0 ? (
              studentSearchQuery ? (
                <p className="no-results">
                  No students found matching "{studentSearchQuery}". 
                  <button 
                    type="button"
                    onClick={() => setStudentSearchQuery('')}
                    style={{
                      marginLeft: '5px',
                      background: 'none',
                      border: 'none',
                      color: '#007bff',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Show all students
                  </button>
                </p>
              ) : (
                <p className="no-options">No students available</p>
              )
            ) : (
              filteredStudents.map(student => (
                <label key={student._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={uploadData.targetStudents.includes(student._id)}
                    onChange={(e) => {
                      const studentId = student._id;
                      setUploadData(prev => ({
                        ...prev,
                        targetStudents: e.target.checked
                          ? [...prev.targetStudents, studentId]
                          : prev.targetStudents.filter(id => id !== studentId)
                      }));
                      if (errors.targetStudents) setErrors(prev => ({ ...prev, targetStudents: '' }));
                    }}
                  />
                  <span className="student-info">
                    <strong>{student.name}</strong> ({student.studentId})
                    <br />
                    <small style={{ color: '#666' }}>
                      {student.email} • {student.program}
                    </small>
                  </span>
                </label>
              ))
            )}
          </div>
          {errors.targetStudents && <span className="error-message">{errors.targetStudents}</span>}
        </div>
      )}

          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? (
              <>
                <FaSpinner className="spinning" />
                Uploading...
              </>
            ) : (
              <>
                <FaPaperclip />
                Upload Material
              </>
            )}
          </button>
        </div>
      </div>

      {/* Materials List */}
      <div className="materials-list-section">
        <h3>Uploaded Materials ({uploadedMaterials.length})</h3>
        
        {uploadedMaterials.length === 0 ? (
          <div className="no-materials">
            <div className="empty-state">
              <FaPaperclip className="empty-icon" />
              <p>No materials uploaded yet.</p>
              <p>Upload your first material to share with students.</p>
            </div>
          </div>
        ) : (
          <div className="materials-grid">
            {uploadedMaterials.map(material => (
              <div key={material._id} className="material-card">
                <div className="material-header">
                  <div className="material-icon">
                    {getFileIcon(material.fileType)}
                  </div>
                  <div className="material-info">
                    <h4 title={material.title}>{material.title}</h4>
                    <p className="material-target">{getTargetDisplay(material)}</p>
                  </div>
                </div>
                
                {material.description && (
                  <p className="material-description" title={material.description}>
                    {material.description.length > 100 
                      ? `${material.description.substring(0, 100)}...` 
                      : material.description
                    }
                  </p>
                )}
                
                <div className="material-meta">
                  <span className="material-size">{formatFileSize(material.fileSize)}</span>
                  <span className="material-date">
                    {new Date(material.uploadDate).toLocaleDateString()}
                  </span>
                  <span className="material-downloads">
                    {material.downloadCount || 0} downloads
                  </span>
                </div>
                
                <div className="material-actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => window.open(material.fileUrl, '_blank')}
                    title="View material"
                  >
                    <FaEye /> View
                  </button>
                  <button
                    className="action-btn download-btn"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = material.downloadUrl;
                      link.download = material.fileName;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    title="Download material"
                  >
                    <FaDownload /> Download
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteMaterial(material._id, material.title)}
                    title="Delete material"
                  >
                    <FaTrashAlt /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


  function ChangePasswordModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('facultyToken');
      if (!token) {
        alert('Please login again');
        return;
      }

      const response = await fetch(`${API_BASE}/api/faculty/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Password changed successfully!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        onClose();
      } else {
        if (data.field) {
          setErrors({ [data.field]: data.message });
        } else {
          alert(data.message || 'Failed to change password');
        }
      }
    } catch (error) {
      console.error('Change password error:', error);
      alert('Failed to change password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="change-password-overlay" onClick={handleClose}>
      <div className="change-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Change Password</h3>
          <button className="close-button" onClick={handleClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-group">
            <label>Current Password *</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className={errors.currentPassword ? 'error' : ''}
              placeholder="Enter current password"
            />
            {errors.currentPassword && (
              <span className="error-message">{errors.currentPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label>New Password *</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className={errors.newPassword ? 'error' : ''}
              placeholder="Enter new password"
            />
            {errors.newPassword && (
              <span className="error-message">{errors.newPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label>Confirm New Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Changing...' : 'Change Password'}
            </button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


const handleCollapseToggle = () => {
  setIsSidebarCollapsed(!isSidebarCollapsed);
  // Don't close mobile menu when collapsing, just toggle the collapse state
};


// ProfileSetting component


  // Replace the existing GroupProgress function with this comprehensive implementation

function GroupProgress() {
  const [supervisedTeams, setSupervisedTeams] = useState([]);
  const [isLoadingProgressData, setIsLoadingProgressData] = useState(false);
  const [selectedTeamForProgress, setSelectedTeamForProgress] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [teamStatusUpdate, setTeamStatusUpdate] = useState({
    teamId: '',
    status: '',
    notes: ''
  });
  const [progressFilter, setProgressFilter] = useState('all');
  const [phaseFilter, setPhaseFilter] = useState('all');

  const [showCreateMilestoneModal, setShowCreateMilestoneModal] = useState(false);
const [selectedTeamForMilestone, setSelectedTeamForMilestone] = useState(null);
const [customMilestoneForm, setCustomMilestoneForm] = useState({
  name: '',
  description: '',
  phase: 'A',
  weight: 10,
  dueDate: ''
});
const [isCreatingMilestone, setIsCreatingMilestone] = useState(false);
const [customMilestones, setCustomMilestones] = useState({}); // Store 

  // Define phase milestones
  // Define phase milestones - Updated with minimal predefined milestones
  const [showEditMilestoneModal, setShowEditMilestoneModal] = useState(false);
const [editingMilestone, setEditingMilestone] = useState(null);
const [editMilestoneForm, setEditMilestoneForm] = useState({
  name: '',
  description: '',
  phase: 'A',
  weight: 10,
  dueDate: ''
});
const [isUpdatingMilestone, setIsUpdatingMilestone] = useState(false);


const [customizedPredefinedMilestones, setCustomizedPredefinedMilestones] = useState({});
  const [showEditPredefinedModal, setShowEditPredefinedModal] = useState(false);
  const [editingPredefinedMilestone, setEditingPredefinedMilestone] = useState(null);
  const [predefinedMilestoneForm, setPredefinedMilestoneForm] = useState({
    name: '',
    weight: 0,
    description: ''
  });


  // Add this function after the handleDeleteCustomMilestone function
const handleEditCustomMilestone = (milestone) => {
  setEditingMilestone(milestone);
  setEditMilestoneForm({
    name: milestone.name,
    description: milestone.description || '',
    phase: milestone.phase,
    weight: milestone.weight,
    dueDate: milestone.dueDate ? new Date(milestone.dueDate).toISOString().split('T')[0] : ''
  });
  setShowEditMilestoneModal(true);
};


  const fetchCustomizedPredefinedMilestones = async () => {
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/predefined-milestones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomizedPredefinedMilestones(data.customizedMilestones || {});
      }
    } catch (error) {
      console.error('Error fetching customized predefined milestones:', error);
    }
  };

  // Get milestone data (customized or default)
  const getMilestone = (phase, milestoneId) => {
    const customized = customizedPredefinedMilestones[phase]?.find(m => m.id === milestoneId);
    if (customized) return customized;
    
    const defaultMilestone = phaseMilestones[phase]?.find(m => m.id === milestoneId);
    return defaultMilestone;
  };

  // Handle edit predefined milestone
  const handleEditPredefinedMilestone = (phase, milestone) => {
    const milestoneData = getMilestone(phase, milestone.id);
    setEditingPredefinedMilestone({ ...milestone, phase });
    setPredefinedMilestoneForm({
      name: milestoneData.name,
      weight: milestoneData.weight,
      description: milestoneData.description || ''
    });
    setShowEditPredefinedModal(true);
  };

  // Update predefined milestone
  const updatePredefinedMilestone = async () => {
    if (!editingPredefinedMilestone || !predefinedMilestoneForm.name.trim()) {
      showMessage('Please fill in the milestone name', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/predefined-milestones/${editingPredefinedMilestone.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: predefinedMilestoneForm.name.trim(),
          weight: parseInt(predefinedMilestoneForm.weight),
          description: predefinedMilestoneForm.description.trim(),
          phase: editingPredefinedMilestone.phase
        })
      });

      if (response.ok) {
        showMessage('Predefined milestone updated successfully!', 'success');
        setShowEditPredefinedModal(false);
        setEditingPredefinedMilestone(null);
        fetchCustomizedPredefinedMilestones();
        fetchSupervisedTeamsProgress();
      } else {
        const data = await response.json();
        showMessage(data.message || 'Failed to update milestone', 'error');
      }
    } catch (error) {
      console.error('Error updating predefined milestone:', error);
      showMessage('Network error: Failed to update milestone', 'error');
    }
  };

  // Reset predefined milestone to default
  const resetPredefinedMilestone = async (phase, milestoneId) => {
    if (!window.confirm('Reset this milestone to its default settings?')) return;

    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/predefined-milestones/${milestoneId}/${phase}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        showMessage('Milestone reset to default successfully!', 'success');
        fetchCustomizedPredefinedMilestones();
        fetchSupervisedTeamsProgress();
      }
    } catch (error) {
      console.error('Error resetting milestone:', error);
      showMessage('Failed to reset milestone', 'error');
    }
  };


const phaseMilestones = {
  'A': [
    { id: 'proposal', name: 'Project Proposal', weight: 40 },
    { id: 'phase_a_presentation', name: 'Capstone A Presentation', weight: 60 }
  ],
  'B': [
    // Keep B phase milestones minimal or remove as needed
    { id: 'mid_demo', name: 'Mid Development Demo', weight: 50 },
    { id: 'phase_b_presentation', name: 'Phase B Presentation', weight: 50 }
  ],
  'C': [
    // Keep C phase milestones minimal or remove as needed
    { id: 'final_implementation', name: 'Final Implementation', weight: 40 },
    { id: 'final_presentation', name: 'Final Presentation', weight: 60 }
  ]
};



const handleDeleteCustomMilestone = async (milestoneId, teamId) => {
  if (!window.confirm('Are you sure you want to delete this custom milestone?')) {
    return;
  }

  try {
    const token = localStorage.getItem('facultyToken');
    const response = await fetch(`${API_BASE}/api/faculty/custom-milestones/${milestoneId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('Custom milestone deleted successfully!', 'success');
      fetchSupervisedTeamsProgress();
      fetchCustomMilestones();
    } else {
      showMessage(data.message || 'Failed to delete milestone', 'error');
    }
  } catch (error) {
    console.error('Error deleting milestone:', error);
    showMessage('Network error: Failed to delete milestone', 'error');
  }
};

const updateCustomMilestone = async () => {
  if (!editingMilestone || !editMilestoneForm.name.trim()) {
    showMessage('Please fill in the milestone name', 'error');
    return;
  }

  setIsUpdatingMilestone(true);
  try {
    const token = localStorage.getItem('facultyToken');
    const response = await fetch(`${API_BASE}/api/faculty/custom-milestones/${editingMilestone.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: editMilestoneForm.name.trim(),
        description: editMilestoneForm.description.trim(),
        phase: editMilestoneForm.phase,
        weight: parseInt(editMilestoneForm.weight),
        dueDate: editMilestoneForm.dueDate || null
      })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('Custom milestone updated successfully!', 'success');
      setShowEditMilestoneModal(false);
      setEditingMilestone(null);
      setEditMilestoneForm({
        name: '',
        description: '',
        phase: 'A',
        weight: 10,
        dueDate: ''
      });
      
      fetchSupervisedTeamsProgress();
      fetchCustomMilestones();
    } else {
      showMessage(data.message || 'Failed to update milestone', 'error');
    }
  } catch (error) {
    console.error('Error updating milestone:', error);
    showMessage('Network error: Failed to update milestone', 'error');
  } finally {
    setIsUpdatingMilestone(false);
  }
};
  // Fetch supervised teams with progress data
  const fetchSupervisedTeamsProgress = async () => {
    setIsLoadingProgressData(true);
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/supervised-teams-progress`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSupervisedTeams(data.teams || []);
      } else {
        console.error('Failed to fetch supervised teams progress');
        setSupervisedTeams([]);
      }
    } catch (error) {
      console.error('Error fetching supervised teams progress:', error);
      setSupervisedTeams([]);
    } finally {
      setIsLoadingProgressData(false);
    }
  };


  const fetchCustomMilestones = async () => {
  try {
    const token = localStorage.getItem('facultyToken');
    const response = await fetch(`${API_BASE}/api/faculty/custom-milestones`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      setCustomMilestones(data.milestones || {});
    }
  } catch (error) {
    console.error('Error fetching custom milestones:', error);
  }
};

// Add this function to create a new milestone
const createCustomMilestone = async () => {
  if (!selectedTeamForMilestone || !customMilestoneForm.name.trim()) {
    showMessage('Please fill in the milestone name', 'error');
    return;
  }

  setIsCreatingMilestone(true);
  try {
    const token = localStorage.getItem('facultyToken');
    const response = await fetch(`${API_BASE}/api/faculty/teams/${selectedTeamForMilestone._id}/custom-milestone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: customMilestoneForm.name.trim(),
        description: customMilestoneForm.description.trim(),
        phase: customMilestoneForm.phase,
        weight: parseInt(customMilestoneForm.weight),
        dueDate: customMilestoneForm.dueDate || null
      })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('Custom milestone created successfully!', 'success');
      setShowCreateMilestoneModal(false);
      setSelectedTeamForMilestone(null);
      setCustomMilestoneForm({
        name: '',
        description: '',
        phase: 'A',
        weight: 10,
        dueDate: ''
      });
      
      // Refresh data
      fetchSupervisedTeamsProgress();
      fetchCustomMilestones();
    } else {
      showMessage(data.message || 'Failed to create milestone', 'error');
    }
  } catch (error) {
    console.error('Error creating milestone:', error);
    showMessage('Network error: Failed to create milestone', 'error');
  } finally {
    setIsCreatingMilestone(false);
  }
};

  // Calculate progress percentage based on completed milestones
  const calculateTeamProgress = (team) => {
  const currentPhase = team.currentPhase || team.phase || 'A';
  const predefinedMilestones = phaseMilestones[currentPhase] || [];
  const teamCustomMilestones = customMilestones[team._id] || [];
  
  // Combine predefined and custom milestones for current phase
  const allMilestones = [
    ...predefinedMilestones,
    ...teamCustomMilestones.filter(m => m.phase === currentPhase)
  ];
  
  const completedMilestones = team.completedMilestones || [];
  
  let totalWeight = allMilestones.reduce((sum, milestone) => sum + milestone.weight, 0);
  let completedWeight = 0;
  
  allMilestones.forEach(milestone => {
    if (completedMilestones.includes(milestone.id)) {
      completedWeight += milestone.weight;
    }
  });
  
  return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
};

  // Update milestone status
  const updateMilestoneStatus = async (teamId, milestoneId, isCompleted) => {
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/teams/${teamId}/milestone`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ milestoneId, isCompleted })
      });

      if (response.ok) {
        fetchSupervisedTeamsProgress(); // Refresh data
        showMessage('Milestone status updated successfully', 'success');
      } else {
        showMessage('Failed to update milestone status', 'error');
      }
    } catch (error) {
      console.error('Error updating milestone:', error);
      showMessage('Network error: Failed to update milestone', 'error');
    }
  };

  // Update team status
  const updateTeamStatus = async () => {
    if (!teamStatusUpdate.teamId || !teamStatusUpdate.status) {
      showMessage('Please select a status', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/teams/${teamStatusUpdate.teamId}/progress-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          progressStatus: teamStatusUpdate.status,
          statusNotes: teamStatusUpdate.notes
        })
      });

      if (response.ok) {
        showMessage('Team status updated successfully', 'success');
        setShowStatusUpdateModal(false);
        setTeamStatusUpdate({ teamId: '', status: '', notes: '' });
        fetchSupervisedTeamsProgress();
      } else {
        showMessage('Failed to update team status', 'error');
      }
    } catch (error) {
      console.error('Error updating team status:', error);
      showMessage('Network error: Failed to update team status', 'error');
    }
  };

  // Get status color class
  const getStatusColorClass = (status) => {
    switch (status) {
      case 'On Track': return 'progress-status-on-track';
      case 'Needs Improvement': return 'progress-status-needs-improvement';
      case 'Delayed': return 'progress-status-delayed';
      case 'Completed': return 'progress-status-completed';
      default: return 'progress-status-default';
    }
  };

  // Filter teams based on selected filters
  const filteredTeams = supervisedTeams.filter(team => {
    const progressPercent = calculateTeamProgress(team);
    const matchesProgressFilter = progressFilter === 'all' || 
      (progressFilter === 'high' && progressPercent >= 80) ||
      (progressFilter === 'medium' && progressPercent >= 50 && progressPercent < 80) ||
      (progressFilter === 'low' && progressPercent < 50);
    
    const matchesPhaseFilter = phaseFilter === 'all' || 
      (team.currentPhase || team.phase || 'A') === phaseFilter;
    
    return matchesProgressFilter && matchesPhaseFilter;
  });

  useEffect(() => {
    fetchSupervisedTeamsProgress();
     fetchCustomMilestones();
     fetchCustomizedPredefinedMilestones();
  }, []);

  if (isLoadingProgressData) {
    return (
      <div className="progress-dashboard-loading-wrapper">
        <div className="progress-dashboard-loading-content">
          <FaSpinner className="progress-dashboard-loading-spinner" />
          <p>Loading team progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-dashboard-main-container">
      {/* Header Section */}
      <div className="progress-dashboard-header-section">
        <div className="progress-dashboard-title-area">
          <h2 className="progress-dashboard-main-title">Team Progress Tracking Dashboard</h2>
          <p className="progress-dashboard-subtitle">Monitor and manage supervised team progress</p>
        </div>
        
        <div className="progress-dashboard-header-actions">
          <button 
            className="progress-dashboard-refresh-btn"
            onClick={fetchSupervisedTeamsProgress}
          >
            <FontAwesomeIcon icon={faSync} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="progress-dashboard-stats-overview">
        <div className="progress-stats-grid">
          <div className="progress-stat-card progress-stat-total">
            <div className="progress-stat-icon">👥</div>
            <div className="progress-stat-content">
              <h3 className="progress-stat-number">{supervisedTeams.length}</h3>
              <p className="progress-stat-label">Total Supervised Teams</p>
            </div>
          </div>
          
          <div className="progress-stat-card progress-stat-on-track">
            <div className="progress-stat-icon">✅</div>
            <div className="progress-stat-content">
              <h3 className="progress-stat-number">
                {supervisedTeams.filter(t => t.progressStatus === 'On Track').length}
              </h3>
              <p className="progress-stat-label">On Track</p>
            </div>
          </div>
          
          <div className="progress-stat-card progress-stat-needs-attention">
            <div className="progress-stat-icon">⚠️</div>
            <div className="progress-stat-content">
              <h3 className="progress-stat-number">
                {supervisedTeams.filter(t => ['Needs Improvement', 'Delayed'].includes(t.progressStatus)).length}
              </h3>
              <p className="progress-stat-label">Needs Attention</p>
            </div>
          </div>
          
          <div className="progress-stat-card progress-stat-average">
            <div className="progress-stat-icon">📊</div>
            <div className="progress-stat-content">
              <h3 className="progress-stat-number">
                {supervisedTeams.length > 0 ? 
                  Math.round(supervisedTeams.reduce((sum, team) => sum + calculateTeamProgress(team), 0) / supervisedTeams.length) : 0}%
              </h3>
              <p className="progress-stat-label">Average Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="progress-dashboard-filters-section">
        <div className="progress-filter-group">
          <label className="progress-filter-label">Progress Level:</label>
          <select 
            className="progress-filter-select"
            value={progressFilter}
            onChange={(e) => setProgressFilter(e.target.value)}
          >
            <option value="all">All Progress Levels</option>
            <option value="high">High Progress (80%+)</option>
            <option value="medium">Medium Progress (50-79%)</option>
            <option value="low">Low Progress (&lt;50%)</option>
          </select>
        </div>
        
        <div className="progress-filter-group">
          <label className="progress-filter-label">Phase:</label>
          <select 
            className="progress-filter-select"
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
          >
            <option value="all">All Phases</option>
            <option value="A">Phase A (Research & Planning)</option>
            <option value="B">Phase B (Development)</option>
            <option value="C">Phase C (Testing & Final)</option>
          </select>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="progress-dashboard-teams-section">
        {filteredTeams.length === 0 ? (
          <div className="progress-dashboard-no-teams">
            <div className="progress-no-teams-icon">📋</div>
            <h3>No Teams Found</h3>
            <p>No supervised teams match your current filters.</p>
          </div>
        ) : (
          <div className="progress-teams-grid">
            {filteredTeams.map((team) => {
              const currentPhase = team.currentPhase || team.phase || 'A';
              const milestones = phaseMilestones[currentPhase] || [];
              const completedMilestones = team.completedMilestones || [];
              const progressPercent = calculateTeamProgress(team);

              return (
                <div key={team._id} className="progress-team-card">
                  {/* Team Header */}
                  <div className="progress-team-header">
                    <div className="progress-team-title-section">
                      <h3 className="progress-team-name">{team.name}</h3>
                      <span className="progress-team-id">ID: {team._id.slice(-8)}</span>
                    </div>
                    
                    <div className="progress-team-badges">
                      <span className={`progress-phase-badge progress-phase-${currentPhase.toLowerCase()}`}>
                        Phase {currentPhase}
                      </span>
                      <span className={`progress-status-badge ${getStatusColorClass(team.progressStatus || 'Not Set')}`}>
                        {team.progressStatus || 'Not Set'}
                      </span>
                    </div>
                  </div>

                  {/* Overall Progress */}
                  <div className="progress-team-overall-section">
                    <div className="progress-overall-header">
                      <span className="progress-overall-label">Overall Progress</span>
                      <span className="progress-overall-percentage">{progressPercent}%</span>
                    </div>
                    <div className="progress-overall-bar">
                      <div 
                        className="progress-overall-fill"
                        style={{ 
                          width: `${progressPercent}%`,
                          backgroundColor: progressPercent >= 80 ? '#10b981' : 
                                         progressPercent >= 50 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="progress-team-members-section">
                    <h4 className="progress-members-title">Team Members ({team.members?.length || 0})</h4>
                    <div className="progress-members-list">
                      {team.members?.map((member, index) => (
                        <div key={index} className="progress-member-item">
                          <div className="progress-member-avatar">
                            {member.avatar ? (
                              <img src={member.avatar} alt={member.name} className="progress-member-img" />
                            ) : (
                              <div className="progress-member-fallback">
                                {member.name?.charAt(0) || 'M'}
                              </div>
                            )}
                          </div>
                          <div className="progress-member-info">
                            <div className="progress-member-name">{member.name}</div>
                            <div className="progress-member-details">
                              <span className="progress-member-id">{member.studentId}</span>
                              <span className="progress-member-cgpa">CGPA: {member.cgpa?.toFixed(2) || 'N/A'}</span>
                              <span className="progress-member-program">{member.program}</span>
                            </div>
                            {member.role === 'Leader' && (
                              <span className="progress-leader-badge">
                                <FontAwesomeIcon icon={faCrown} /> Leader
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                 {/* Milestone Progress - Enhanced with Custom Milestones */}
<div className="progress-milestones-section">
  <div className="progress-milestones-header">
    <h4 className="progress-milestones-title">
      Phase {currentPhase} Milestones ({completedMilestones.length}/{(milestones.length + (customMilestones[team._id]?.filter(m => m.phase === currentPhase).length || 0)) || "Not Defined"})
    </h4>
    <div className="milestones-actions">
      <button 
        className="progress-create-milestone-btn"
        onClick={() => {
          setSelectedTeamForMilestone(team);
          setCustomMilestoneForm({
            ...customMilestoneForm,
            phase: currentPhase
          });
          setShowCreateMilestoneModal(true);
        }}
        title="Create custom milestone"
      >
        <FontAwesomeIcon icon={faEdit} /> Add Milestone
      </button>
      <button 
        className="progress-view-details-btn"
        onClick={() => {
          setSelectedTeamForProgress(team);
          setShowProgressModal(true);
        }}
      >
        <FontAwesomeIcon icon={faEye} /> View Details
      </button>
    </div>
  </div>
  
  <div className="progress-milestones-list">
    {/* Show message if no predefined milestones */}
    {milestones.length === 0 && (!customMilestones[team._id] || customMilestones[team._id].filter(m => m.phase === currentPhase).length === 0) ? (
      <div className="no-milestones-message">
        <p>No milestones defined for Phase {currentPhase}</p>
        <p>Click "Add Milestone" to create custom milestones for this team.</p>
      </div>
    ) : (
      <>
        {/* Predefined Milestones */}
       {/* Predefined Milestones - Enhanced with Edit Capability */}
{milestones.map((milestone) => {
  const isCompleted = completedMilestones.includes(milestone.id);
  const milestoneData = getMilestone(currentPhase, milestone.id);
  const isCustomized = customizedPredefinedMilestones[currentPhase]?.some(m => m.id === milestone.id);
  
  return (
    <div key={milestone.id} className="progress-milestone-item predefined-milestone">
      <div className="progress-milestone-checkbox-wrapper">
        <input
          type="checkbox"
          className="progress-milestone-checkbox"
          checked={isCompleted}
          onChange={(e) => updateMilestoneStatus(team._id, milestone.id, e.target.checked)}
        />
      </div>
      
      <div className="progress-milestone-content">
        <div className="progress-milestone-header">
          <div className="progress-milestone-name">{milestoneData.name}</div>
          <div className="milestone-actions">
            <button
              className="edit-predefined-milestone-btn"
              onClick={() => handleEditPredefinedMilestone(currentPhase, milestone)}
              title="Edit milestone"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            {isCustomized && (
              <button
                className="reset-predefined-milestone-btn"
                onClick={() => resetPredefinedMilestone(currentPhase, milestone.id)}
                title="Reset to default"
              >
                <FontAwesomeIcon icon={faUndo} />
              </button>
            )}
          </div>
        </div>
        <div className="progress-milestone-weight">Weight: {milestoneData.weight}%</div>
        {milestoneData.description && (
          <div className="progress-milestone-description">{milestoneData.description}</div>
        )}
        <div className={`progress-milestone-type ${isCustomized ? 'customized' : 'default'}`}>
          {isCustomized ? 'Customized' : 'Default'}
        </div>
      </div>
      
      <div className={`progress-milestone-status ${isCompleted ? 'progress-milestone-completed' : 'progress-milestone-pending'}`}>
        {isCompleted ? (
          <FontAwesomeIcon icon={faCheck} className="progress-milestone-check-icon" />
        ) : (
          <div className="progress-milestone-pending-dot" />
        )}
      </div>
    </div>
  );
})}

        {/* Custom Milestones */}
        {/* Custom Milestones - UPDATE this section */}
{customMilestones[team._id]?.filter(m => m.phase === currentPhase).map((milestone) => {
  const isCompleted = completedMilestones.includes(milestone.id);
  return (
    <div key={milestone.id} className="progress-milestone-item custom-milestone">
      <div className="progress-milestone-checkbox-wrapper">
        <input
          type="checkbox"
          className="progress-milestone-checkbox"
          checked={isCompleted}
          onChange={(e) => updateMilestoneStatus(team._id, milestone.id, e.target.checked)}
        />
      </div>
      
      <div className="progress-milestone-content">
        <div className="progress-milestone-header">
          <div className="progress-milestone-name">{milestone.name}</div>
          <div className="milestone-actions">
            <button
              className="edit-custom-milestone-btn"
              onClick={() => handleEditCustomMilestone(milestone)}
              title="Edit milestone"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button
              className="delete-custom-milestone-btn"
              onClick={() => handleDeleteCustomMilestone(milestone.id, team._id)}
              title="Delete milestone"
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>
          </div>
        </div>
        
        {milestone.description && (
          <div className="progress-milestone-description">{milestone.description}</div>
        )}
        <div className="progress-milestone-weight">Weight: {milestone.weight}%</div>
        <div className="progress-milestone-type custom">Custom</div>
        {milestone.dueDate && (
          <div className="progress-milestone-due-date">
            Due: {new Date(milestone.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
      
      <div className={`progress-milestone-status ${isCompleted ? 'progress-milestone-completed' : 'progress-milestone-pending'}`}>
        {isCompleted ? (
          <FontAwesomeIcon icon={faCheck} className="progress-milestone-check-icon" />
        ) : (
          <div className="progress-milestone-pending-dot" />
        )}
      </div>
    </div>
  );
})}
      </>
    )}
  </div>
</div>


                  {/* Latest Submission */}
                  <div className="progress-latest-submission-section">
                    <h5 className="progress-submission-title">Latest Submission</h5>
                    {team.latestSubmission ? (
                      <div className="progress-submission-info">
                        <div className="progress-submission-name">{team.latestSubmission.title}</div>
                        <div className="progress-submission-date">
                          {new Date(team.latestSubmission.date).toLocaleDateString()}
                        </div>
                        <span className={`progress-submission-status progress-submission-${team.latestSubmission.status?.toLowerCase()}`}>
                          {team.latestSubmission.status}
                        </span>
                      </div>
                    ) : (
                      <div className="progress-no-submission">No submissions yet</div>
                    )}
                  </div>

                  {/* Team Actions */}
                  <div className="progress-team-actions">
                    <button 
                      className="progress-action-btn progress-update-status-btn"
                      onClick={() => {
                        setTeamStatusUpdate({ 
                          teamId: team._id, 
                          status: team.progressStatus || '', 
                          notes: team.statusNotes || '' 
                        });
                        setShowStatusUpdateModal(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      Update Status
                    </button>
                    
                    <button 
                      className="progress-action-btn progress-view-team-btn"
                      onClick={() => {
                        setSelectedTeamForProgress(team);
                        setShowProgressModal(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faEye} />
                      View Progress
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

{/* Create Custom Milestone Modal */}
{showCreateMilestoneModal && selectedTeamForMilestone && (
  <div className="progress-modal-overlay" onClick={() => setShowCreateMilestoneModal(false)}>
    <div className="progress-milestone-modal-container" onClick={(e) => e.stopPropagation()}>
      <div className="progress-modal-header">
        <h3 className="progress-modal-title">
          Create Custom Milestone for {selectedTeamForMilestone.name}
        </h3>
        <button 
          className="progress-modal-close-btn"
          onClick={() => setShowCreateMilestoneModal(false)}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <div className="progress-modal-content">
        <form onSubmit={(e) => { e.preventDefault(); createCustomMilestone(); }}>
          <div className="milestone-form-group">
            <label className="milestone-form-label">Milestone Name *</label>
            <input
              type="text"
              className="milestone-form-input"
              value={customMilestoneForm.name}
              onChange={(e) => setCustomMilestoneForm({
                ...customMilestoneForm,
                name: e.target.value
              })}
              placeholder="Enter milestone name"
              required
              maxLength="100"
            />
          </div>

          <div className="milestone-form-group">
            <label className="milestone-form-label">Description (Optional)</label>
            <textarea
              className="milestone-form-textarea"
              value={customMilestoneForm.description}
              onChange={(e) => setCustomMilestoneForm({
                ...customMilestoneForm,
                description: e.target.value
              })}
              placeholder="Describe what this milestone involves"
              rows="3"
              maxLength="500"
            />
          </div>

          <div className="milestone-form-row">
            <div className="milestone-form-group">
              <label className="milestone-form-label">Phase</label>
              <select
                className="milestone-form-select"
                value={customMilestoneForm.phase}
                onChange={(e) => setCustomMilestoneForm({
                  ...customMilestoneForm,
                  phase: e.target.value
                })}
              >
                <option value="A">Phase A (Research & Planning)</option>
                <option value="B">Phase B (Development)</option>
                <option value="C">Phase C (Testing & Final)</option>
              </select>
            </div>

            <div className="milestone-form-group">
              <label className="milestone-form-label">Weight (%)</label>
              <input
                type="number"
                className="milestone-form-input"
                value={customMilestoneForm.weight}
                onChange={(e) => setCustomMilestoneForm({
                  ...customMilestoneForm,
                  weight: Math.max(1, Math.min(100, parseInt(e.target.value) || 1))
                })}
                min="1"
                max="100"
                required
              />
            </div>
          </div>

          <div className="milestone-form-group">
            <label className="milestone-form-label">Due Date (Optional)</label>
            <input
              type="date"
              className="milestone-form-input"
              value={customMilestoneForm.dueDate}
              onChange={(e) => setCustomMilestoneForm({
                ...customMilestoneForm,
                dueDate: e.target.value
              })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="milestone-form-note">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span>Custom milestones help track team-specific goals and requirements beyond the standard project phases.</span>
          </div>
        </form>
      </div>

      <div className="progress-modal-footer">
        <button 
          className="progress-milestone-cancel-btn"
          onClick={() => setShowCreateMilestoneModal(false)}
          disabled={isCreatingMilestone}
        >
          Cancel
        </button>
        <button 
          className="progress-milestone-create-btn"
          onClick={createCustomMilestone}
          disabled={isCreatingMilestone || !customMilestoneForm.name.trim()}
        >
          {isCreatingMilestone ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="spinning" />
              Creating...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheck} />
              Create Milestone
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}

{/* Edit Custom Milestone Modal */}
{/* Edit Custom Milestone Modal */}
{showEditMilestoneModal && editingMilestone && (
  <div className="progress-modal-overlay" onClick={() => setShowEditMilestoneModal(false)}>
    <div className="progress-milestone-modal-container" onClick={(e) => e.stopPropagation()}>
      <div className="progress-modal-header">
        <h3 className="progress-modal-title">
          Edit Custom Milestone
        </h3>
        <button 
          className="progress-modal-close-btn"
          onClick={() => setShowEditMilestoneModal(false)}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <div className="progress-modal-content">
        <form onSubmit={(e) => { e.preventDefault(); updateCustomMilestone(); }}>
          <div className="milestone-form-group">
            <label className="milestone-form-label">Milestone Name *</label>
            <input
              type="text"
              className="milestone-form-input"
              value={editMilestoneForm.name}
              onChange={(e) => setEditMilestoneForm({
                ...editMilestoneForm,
                name: e.target.value
              })}
              placeholder="Enter milestone name"
              required
              maxLength="100"
            />
          </div>

          <div className="milestone-form-group">
            <label className="milestone-form-label">Description (Optional)</label>
            <textarea
              className="milestone-form-textarea"
              value={editMilestoneForm.description}
              onChange={(e) => setEditMilestoneForm({
                ...editMilestoneForm,
                description: e.target.value
              })}
              placeholder="Describe what this milestone involves"
              rows="3"
              maxLength="500"
            />
          </div>

          <div className="milestone-form-row">
            <div className="milestone-form-group">
              <label className="milestone-form-label">Phase</label>
              <select
                className="milestone-form-select"
                value={editMilestoneForm.phase}
                onChange={(e) => setEditMilestoneForm({
                  ...editMilestoneForm,
                  phase: e.target.value
                })}
              >
                <option value="A">Phase A (Research & Planning)</option>
                <option value="B">Phase B (Development)</option>
                <option value="C">Phase C (Testing & Final)</option>
              </select>
            </div>

            <div className="milestone-form-group">
              <label className="milestone-form-label">Weight (%)</label>
              <input
                type="number"
                className="milestone-form-input"
                value={editMilestoneForm.weight}
                onChange={(e) => setEditMilestoneForm({
                  ...editMilestoneForm,
                  weight: Math.max(1, Math.min(100, parseInt(e.target.value) || 1))
                })}
                min="1"
                max="100"
                required
              />
            </div>
          </div>

          <div className="milestone-form-group">
            <label className="milestone-form-label">Due Date (Optional)</label>
            <input
              type="date"
              className="milestone-form-input"
              value={editMilestoneForm.dueDate}
              onChange={(e) => setEditMilestoneForm({
                ...editMilestoneForm,
                dueDate: e.target.value
              })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </form>
      </div>

      <div className="progress-modal-footer">
        <button 
          className="progress-milestone-cancel-btn"
          onClick={() => setShowEditMilestoneModal(false)}
          disabled={isUpdatingMilestone}
        >
          Cancel
        </button>
        <button 
          className="progress-milestone-create-btn"
          onClick={updateCustomMilestone}
          disabled={isUpdatingMilestone || !editMilestoneForm.name.trim()}
        >
          {isUpdatingMilestone ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="spinning" />
              Updating...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheck} />
              Update Milestone
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}

{/* Edit Predefined Milestone Modal */}
{showEditPredefinedModal && editingPredefinedMilestone && (
  <div className="progress-modal-overlay" onClick={() => setShowEditPredefinedModal(false)}>
    <div className="progress-milestone-modal-container" onClick={(e) => e.stopPropagation()}>
      <div className="progress-modal-header">
        <h3 className="progress-modal-title">
          Edit Predefined Milestone
        </h3>
        <button 
          className="progress-modal-close-btn"
          onClick={() => setShowEditPredefinedModal(false)}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <div className="progress-modal-content">
        <div className="milestone-form-group">
          <label className="milestone-form-label">Milestone Name *</label>
          <input
            type="text"
            className="milestone-form-input"
            value={predefinedMilestoneForm.name}
            onChange={(e) => setPredefinedMilestoneForm({
              ...predefinedMilestoneForm,
              name: e.target.value
            })}
            required
          />
        </div>

        <div className="milestone-form-group">
          <label className="milestone-form-label">Weight (%)</label>
          <input
            type="number"
            className="milestone-form-input"
            value={predefinedMilestoneForm.weight}
            onChange={(e) => setPredefinedMilestoneForm({
              ...predefinedMilestoneForm,
              weight: parseInt(e.target.value) || 0
            })}
            min="1"
            max="100"
            required
          />
        </div>

        <div className="milestone-form-group">
          <label className="milestone-form-label">Description</label>
          <textarea
            className="milestone-form-textarea"
            value={predefinedMilestoneForm.description}
            onChange={(e) => setPredefinedMilestoneForm({
              ...predefinedMilestoneForm,
              description: e.target.value
            })}
            rows="3"
          />
        </div>
      </div>

      <div className="progress-modal-footer">
        <button 
          className="progress-milestone-cancel-btn"
          onClick={() => setShowEditPredefinedModal(false)}
        >
          Cancel
        </button>
        <button 
          className="progress-milestone-create-btn"
          onClick={updatePredefinedMilestone}
        >
          Update Milestone
        </button>
      </div>
    </div>
  </div>
)}





      {/* Progress Details Modal */}
      {showProgressModal && selectedTeamForProgress && (
        <div className="progress-modal-overlay" onClick={() => setShowProgressModal(false)}>
          <div className="progress-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="progress-modal-header">
              <h3 className="progress-modal-title">
                Progress Details: {selectedTeamForProgress.name}
              </h3>
              <button 
                className="progress-modal-close-btn"
                onClick={() => setShowProgressModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="progress-modal-content">
              {/* Team Overview */}
              <div className="progress-modal-overview">
                <div className="progress-modal-stats">
                  <div className="progress-modal-stat">
                    <span className="progress-modal-stat-label">Current Phase:</span>
                    <span className="progress-modal-stat-value">
                      Phase {selectedTeamForProgress.currentPhase || selectedTeamForProgress.phase || 'A'}
                    </span>
                  </div>
                  <div className="progress-modal-stat">
                    <span className="progress-modal-stat-label">Overall Progress:</span>
                    <span className="progress-modal-stat-value">
                      {calculateTeamProgress(selectedTeamForProgress)}%
                    </span>
                  </div>
                  <div className="progress-modal-stat">
                    <span className="progress-modal-stat-label">Status:</span>
                    <span className={`progress-modal-stat-value ${getStatusColorClass(selectedTeamForProgress.progressStatus || 'Not Set')}`}>
                      {selectedTeamForProgress.progressStatus || 'Not Set'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Milestone View */}
              <div className="progress-modal-milestones">
                <h4 className="progress-modal-section-title">Milestone Details</h4>
                {Object.entries(phaseMilestones).map(([phase, milestones]) => (
                  <div key={phase} className="progress-modal-phase-section">
                    <h5 className="progress-modal-phase-title">Phase {phase}</h5>
                    <div className="progress-modal-phase-milestones">
                      {milestones.map((milestone) => {
                        const isCompleted = selectedTeamForProgress.completedMilestones?.includes(milestone.id) || false;
                        return (
                          <div key={milestone.id} className={`progress-modal-milestone ${isCompleted ? 'progress-modal-milestone-completed' : 'progress-modal-milestone-pending'}`}>
                            <div className="progress-modal-milestone-status">
                              {isCompleted ? (
                                <FontAwesomeIcon icon={faCheck} className="progress-modal-milestone-check" />
                              ) : (
                                <div className="progress-modal-milestone-pending-indicator" />
                              )}
                            </div>
                            <div className="progress-modal-milestone-info">
                              <div className="progress-modal-milestone-name">{milestone.name}</div>
                              <div className="progress-modal-milestone-weight">Weight: {milestone.weight}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusUpdateModal && (
        <div className="progress-status-modal-overlay" onClick={() => setShowStatusUpdateModal(false)}>
          <div className="progress-status-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="progress-status-modal-header">
              <h3 className="progress-status-modal-title">Update Team Status</h3>
              <button 
                className="progress-status-modal-close-btn"
                onClick={() => setShowStatusUpdateModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="progress-status-modal-content">
              <div className="progress-status-form-group">
                <label className="progress-status-form-label">Team Status:</label>
                <select 
                  className="progress-status-form-select"
                  value={teamStatusUpdate.status}
                  onChange={(e) => setTeamStatusUpdate({...teamStatusUpdate, status: e.target.value})}
                >
                  <option value="">Select Status</option>
                  <option value="On Track">On Track</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="progress-status-form-group">
                <label className="progress-status-form-label">Notes (Optional):</label>
                <textarea 
                  className="progress-status-form-textarea"
                  value={teamStatusUpdate.notes}
                  onChange={(e) => setTeamStatusUpdate({...teamStatusUpdate, notes: e.target.value})}
                  placeholder="Add any notes or comments about the team's progress..."
                  rows="4"
                />
              </div>

              <div className="progress-status-descriptions">
                <h5 className="progress-status-descriptions-title">Status Descriptions:</h5>
                <ul className="progress-status-descriptions-list">
                  <li className="progress-status-description-item">
                    <strong>On Track:</strong> Team is meeting all milestones on schedule
                  </li>
                  <li className="progress-status-description-item">
                    <strong>Needs Improvement:</strong> Team needs some guidance or adjustments
                  </li>
                  <li className="progress-status-description-item">
                    <strong>Delayed:</strong> Team is behind schedule and needs attention
                  </li>
                  <li className="progress-status-description-item">
                    <strong>Completed:</strong> Team has successfully completed their project
                  </li>
                </ul>
              </div>
            </div>

            <div className="progress-status-modal-footer">
              <button 
                className="progress-status-cancel-btn"
                onClick={() => setShowStatusUpdateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="progress-status-update-btn"
                onClick={updateTeamStatus}
                disabled={!teamStatusUpdate.status}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


  function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageFilter, setMessageFilter] = useState("all");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
    fetchAvailableContacts();
    
    // Set up polling for new messages every 5 seconds
    const messagePolling = setInterval(() => {
      if (activeConversation) {
        fetchMessages(activeConversation);
      }
    }, 5000);

    return () => clearInterval(messagePolling);
  }, [activeConversation]);

  // Fetch all conversations for the faculty
  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        console.error('Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/conversations/${conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        
        // Auto-scroll to bottom
        setTimeout(() => {
          const messagesContainer = document.querySelector('.msg-messages-area');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Fetch available contacts for new conversations
  const fetchAvailableContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (conversation) => {
    setActiveConversation(conversation.id);
    fetchMessages(conversation.id);
    
    // Mark conversation as read
    markConversationAsRead(conversation.id);
  };

  // Mark conversation as read
  const markConversationAsRead = async (conversationId) => {
    try {
      const token = localStorage.getItem('facultyToken');
      await fetch(`${API_BASE}/api/conversations/${conversationId}/mark-read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread: 0 } 
            : conv
        )
      );
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // Remove file from selection
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Send message
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !activeConversation || isSendingMessage) {
      return;
    }

    setIsSendingMessage(true);
    const token = localStorage.getItem('facultyToken');

    try {
      // If there are files, upload them first
      let fileUrls = [];
      if (selectedFiles.length > 0) {
        for (let file of selectedFiles) {
          const formData = new FormData();
          formData.append('file', file);
          
          const uploadResponse = await fetch(`${API_BASE}/api/files/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            fileUrls.push({
              url: uploadData.file.url,
              name: file.name,
              size: file.size,
              type: file.type
            });
          }
        }
      }

      // Send message with files
      const messageData = {
        text: newMessage.trim(),
        files: fileUrls,
        messageType: fileUrls.length > 0 ? 'mixed' : 'text'
      };

      const response = await fetch(`${API_BASE}/api/conversations/${activeConversation}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add message to local state
        setMessages(prev => [...prev, data.message]);
        
        // Clear input and files
        setNewMessage("");
        setSelectedFiles([]);
        
        // Update conversation last message
        setConversations(prev => 
          prev.map(conv => 
            conv.id === activeConversation 
              ? { 
                  ...conv, 
                  lastMessage: newMessage.trim() || 'File attachment',
                  timestamp: 'Just now'
                } 
              : conv
          )
        );

        // Auto-scroll to bottom
        setTimeout(() => {
          const messagesContainer = document.querySelector('.msg-messages-area');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }, 100);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Start new conversation
  const startNewConversation = async (contact) => {
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/conversations/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          participantId: contact.id,
          participantType: contact.type
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(prev => [data.conversation, ...prev]);
        setActiveConversation(data.conversation.id);
        setShowNewChatModal(false);
        fetchMessages(data.conversation.id);
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to start new conversation.');
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = messageFilter === "all" || 
                         (messageFilter === "unread" && conv.unread > 0) ||
                         (messageFilter === "important" && conv.priority !== "normal");
    return matchesSearch && matchesFilter;
  });

  // Get current conversation details
  const currentConversation = conversations.find(conv => conv.id === activeConversation);

  if (isLoading) {
    return (
      <div className="msg-loading-state">
        <div className="msg-loading-spinner">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="msg-messages-wrapper">
      {/* Conversations Sidebar */}
      <div className="msg-conversations-panel">
        <div className="msg-header">
          <div className="msg-header-top">
            <h2>Messages</h2>
            <div className="msg-header-actions">
              <button className="msg-compose-button" onClick={() => setShowNewChatModal(true)}>
                <span className="msg-icon">✉️</span>
                Compose
              </button>
            </div>
          </div>
          
          <div className="msg-search-filter">
            <div className="msg-search-box">
              <span className="msg-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="msg-search-field"
              />
            </div>
            <div className="msg-filter-tabs">
              <button 
                className={`msg-filter-tab ${messageFilter === 'all' ? 'msg-active' : ''}`}
                onClick={() => setMessageFilter('all')}
              >
                All
              </button>
              <button 
                className={`msg-filter-tab ${messageFilter === 'unread' ? 'msg-active' : ''}`}
                onClick={() => setMessageFilter('unread')}
              >
                Unread ({conversations.filter(c => c.unread > 0).length})
              </button>
              <button 
                className={`msg-filter-tab ${messageFilter === 'important' ? 'msg-active' : ''}`}
                onClick={() => setMessageFilter('important')}
              >
                Important
              </button>
            </div>
          </div>
        </div>

        <div className="msg-conversations-list">
          {filteredConversations.length === 0 ? (
            <div className="msg-no-conversations">
              <p>No conversations found.</p>
            </div>
          ) : (
            filteredConversations.map((convo) => (
              <div
                key={convo.id}
                className={`msg-conversation-item ${activeConversation === convo.id ? "msg-active" : ""} msg-${convo.priority || 'normal'}`}
                onClick={() => handleConversationSelect(convo)}
              >
                <div className="msg-conversation-avatar">
                  <span className="msg-avatar-icon">{convo.avatar || "👤"}</span>
                  {convo.isOnline && <div className="msg-online-dot"></div>}
                  {convo.priority === 'urgent' && <div className="msg-priority-badge msg-urgent">!</div>}
                </div>
                
                <div className="msg-conversation-body">
                  <div className="msg-conversation-header">
                    <h4 className="msg-conversation-title">{convo.name || 'Unknown'}</h4>
                    <span className="msg-timestamp">{convo.timestamp || 'Now'}</span>
                  </div>
                  
                  <div className="msg-conversation-preview">
                    <p className="msg-last-message">{convo.lastMessage || 'No messages yet'}</p>
                    <div className="msg-conversation-meta">
                      {convo.type === 'group' && (
                        <span className="msg-participants-count">
                          👥 {convo.participants?.length || 0} members
                        </span>
                      )}
                      {convo.department && (
                        <span className="msg-department-tag">{convo.department}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="msg-conversation-indicators">
                  {convo.unread > 0 && (
                    <span className="msg-unread-count">{convo.unread}</span>
                  )}
                  <div className="msg-status-indicators">
                    {convo.priority === 'high' && <span className="msg-priority-dot msg-high">🔴</span>}
                    {convo.priority === 'urgent' && <span className="msg-priority-dot msg-urgent">🚨</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Container */}
      <div className="msg-chat-panel">
        {activeConversation && currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="msg-chat-header">
              <div className="msg-participant-info">
                <div className="msg-participant-avatar">
                  <span>{currentConversation.avatar || "👤"}</span>
                  <div className="msg-online-status"></div>
                </div>
                <div className="msg-participant-details">
                  <h3>{currentConversation.name}</h3>
                  <p className="msg-participant-status">
                    {currentConversation.type === 'group' 
                      ? `${currentConversation.participants?.length || 0} members`
                      : currentConversation.isOnline ? 'Online now' : 'Last seen recently'
                    }
                  </p>
                </div>
              </div>
              
              <div className="msg-chat-actions">
                <button className="msg-action-button" title="Video Call">📹</button>
                <button className="msg-action-button" title="Voice Call">📞</button>
                <button className="msg-action-button" title="Share Screen">🖥️</button>
                <button className="msg-action-button" title="More Options">⋯</button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="msg-messages-area">
              {messages.length === 0 ? (
                <div className="msg-no-messages">
                  <span className="msg-empty-icon">💬</span>
                  <h3>Start the conversation</h3>
                  <p>Send your first message to begin chatting!</p>
                </div>
              ) : (
                <>
                  <div className="msg-date-divider">
                    <span>Today</span>
                  </div>
                  
                  {messages.map((msg) => (
                    <div
                      key={msg._id || msg.id}
                      className={`msg-message-wrapper ${msg.senderType === "faculty" ? "msg-sent" : "msg-received"}`}
                    >
                      <div className="msg-message-bubble">
                        {msg.senderType !== "faculty" && (
                          <div className="msg-message-sender">
                            <span className="msg-sender-avatar">{msg.senderAvatar || "👤"}</span>
                            <span className="msg-sender-name">{msg.senderName || 'Unknown'}</span>
                          </div>
                        )}
                        
                        <div className="msg-message-content">
                          {msg.text && <p className="msg-message-text">{msg.text}</p>}
                          
                          {msg.files && msg.files.length > 0 && (
                            <div className="msg-attachments">
                              {msg.files.map((file, index) => (
                                <div key={index} className="msg-attachment">
                                  <span className="msg-file-icon">📎</span>
                                  <a 
                                    href={file.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="msg-file-link"
                                  >
                                    {file.name}
                                  </a>
                                  <span className="msg-file-size">
                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="msg-message-footer">
                            <span className="msg-message-time">
                              {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                            {msg.senderType === "faculty" && (
                              <span className={`msg-message-status msg-${msg.status || 'sent'}`}>
                                {msg.status === 'sent' && '✓'}
                                {msg.status === 'delivered' && '✓✓'}
                                {msg.status === 'read' && '✓✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
              
              {isTyping && (
                <div className="msg-typing-indicator">
                  <div className="msg-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="msg-typing-text">Someone is typing...</span>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="msg-input-container">
              {selectedFiles.length > 0 && (
                <div className="msg-selected-files">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="msg-selected-file">
                      <span className="msg-file-icon">📎</span>
                      <span className="msg-file-name">{file.name}</span>
                      <span className="msg-file-size">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                      <button className="msg-remove-file" onClick={() => removeFile(index)}>×</button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="msg-input-area">
                <div className="msg-input-tools">
                  <label className="msg-tool-button" title="Attach File">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip"
                    />
                    📎
                  </label>
                  <button className="msg-tool-button" title="Insert Emoji">😊</button>
                  <button className="msg-tool-button" title="Mention Someone">@</button>
                  <button className="msg-tool-button" title="Format Text">🎨</button>
                </div>
                
                <div className="msg-input-wrapper">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="msg-input-field"
                    rows="1"
                    disabled={isSendingMessage}
                  />
                  <button 
                    className={`msg-send-button ${newMessage.trim() || selectedFiles.length > 0 ? 'msg-active' : ''}`}
                    onClick={handleSendMessage}
                    disabled={(!newMessage.trim() && selectedFiles.length === 0) || isSendingMessage}
                  >
                    {isSendingMessage ? (
                      <div className="msg-loading-spinner-small">⏳</div>
                    ) : (
                      <span className="msg-send-icon">➤</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="msg-empty-state">
            <div className="msg-empty-content">
              <div className="msg-empty-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging, or create a new one.</p>
              <button className="msg-start-chat-button" onClick={() => setShowNewChatModal(true)}>
                Start New Conversation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div className="msg-new-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="msg-modal-header">
              <h3>Start New Conversation</h3>
              <button className="msg-close-button" onClick={() => setShowNewChatModal(false)}>×</button>
            </div>
            <div className="msg-modal-content">
              <div className="msg-contact-search">
                <input type="text" placeholder="Search faculty, students, or groups..." />
              </div>
              
              {isLoadingContacts ? (
                <div className="msg-loading-contacts">Loading contacts...</div>
              ) : (
                <div className="msg-contact-list">
                  {availableContacts.map((contact) => (
                    <div key={contact.id} className="msg-contact-item" onClick={() => startNewConversation(contact)}>
                      <span className="msg-contact-avatar">{contact.avatar || "👤"}</span>
                      <div className="msg-contact-info">
                        <h4>{contact.name}</h4>
                        <p>{contact.department || contact.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



  function MeetingsPage() {
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [formData, setFormData] = useState({
      title: "",
      date: "",
      time: "",
      participants: [],
      agenda: "",
    });

    const meetings = [
      {
        id: 1,
        title: "Project Review - Group Alpha",
        date: "2023-12-15",
        time: "2:00 PM",
        participants: 5,
        status: "upcoming",
      },
      {
        id: 2,
        title: "Department Meeting",
        date: "2023-12-18",
        time: "10:00 AM",
        participants: 12,
        status: "upcoming",
      },
    ];

    return (
      <div className="meetings-container">
        <div className="meetings-header">
          <h2>Meetings</h2>
          <button
            className="action-button schedule-button"
            onClick={() => setShowScheduleForm(true)}
          >
            Schedule New Meeting
          </button>
        </div>

        {showScheduleForm && (
          <div className="schedule-form">
            <h3>Schedule New Meeting</h3>
            <form>
              <div className="form-row">
                <div className="form-group">
                  <label>Meeting Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Participants</label>
                  <input
                    type="text"
                    placeholder="Enter emails separated by commas"
                    value={formData.participants.join(", ")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        participants: e.target.value.split(","),
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Agenda</label>
                <textarea
                  value={formData.agenda}
                  onChange={(e) =>
                    setFormData({ ...formData, agenda: e.target.value })
                  }
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="action-button">
                  Schedule
                </button>
                <button
                  type="button"
                  className="action-button cancel-button"
                  onClick={() => setShowScheduleForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="meetings-list">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="meeting-card">
              <div className="meeting-info">
                <h4>{meeting.title}</h4>
                <div className="meeting-meta">
                  <span>📅 {meeting.date}</span>
                  <span>🕒 {meeting.time}</span>
                  <span>👥 {meeting.participants} participants</span>
                </div>
              </div>
              <div className="meeting-actions">
                <span className={`status ${meeting.status}`}>
                  {meeting.status}
                </span>
                <button className="action-button">Details</button>
                <button className="action-button join-button">Join</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }




  /*-------------------------Tasnuva------------------------*/

const Profile = ({ setActiveTab }) => {

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('facultyToken');
      if (!token) return setError('No token found');

      try {
        const res = await fetch(`${API_BASE}/api/faculty/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to fetch profile');
      }
    };

    fetchProfile();
  }, []);

   const handleVisibilityToggle = async () => {
    if (isTogglingVisibility) return;
    
    setIsTogglingVisibility(true);
    const token = localStorage.getItem('facultyToken');
    
    try {
      const newVisibility = !profile.visibleToStudents;
      
      const response = await fetch(`${API_BASE}/api/faculty/toggle-visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          visibleToStudents: newVisibility
        })
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(prev => ({
          ...prev,
          visibleToStudents: data.visibleToStudents
        }));

      } else {
        alert(data.message || 'Failed to update visibility');
      }
    } catch (error) {
      console.error('Visibility toggle error:', error);
      alert('Failed to update visibility. Please try again.');
    } finally {
      setIsTogglingVisibility(false);
    }
  };


  //shakib

  const handleEdit = () => {
    setActiveTab("profile");
  };
  
  //shakib

  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>Loading...</div>;

return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-container">
          <img
            src={profile?.profilePicture || "/default-avatar.png"}
            className="profile-avatar"
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              e.target.src = "/default-avatar.png";
              setImageLoading(false);
            }}
            style={{
              opacity: imageLoading ? 0.7 : 1,
              transition: 'opacity 0.2s ease'
            }}
          />
          {imageLoading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#666',
              fontSize: '12px'
            }}>
              Loading...
            </div>
          )}
        </div>
        <div className="profile-titles">
          <h1 className="profile-name">{profile?.name}</h1>
          <p className="profile-title">{profile?.role}</p>
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span className="status-text">{profile?.status}</span>
          </div>
        </div>
      </div>
    <div className="profile-grid">
      <div className="info-card">
        <h3 className="info-title">Contact Information</h3>
        <div className="info-content">
          <p><span className="field-label">Email:</span> {profile.email}</p>
          <p><span className="field-label">Phone:</span> {profile.phone}</p>
          <p><span className="field-label">Office:</span> {profile.office}</p>
        </div>
      </div>
      <div className="info-card">
        <h3 className="info-title">Academic Details</h3>
        <div className="info-content">
          <p><span className="field-label">Department:</span> {profile.department}</p>
          <p><span className="field-label">Research Area:</span> {profile.research}</p>
          <p><span className="field-label">Courses:</span> CSE 401, CSE 505</p>
        </div>
      </div>


<div className="info-card">
          <h3 className="info-title">Student Directory</h3>
          <div className="info-content">
            <div className="visibility-simple">
              {profile.visibleToStudents ? (
                <div className="visibility-active">
                  <div className="active-status">
                    <span className="status-icon">✅</span>
                    <span className="status-text">Currently visible to students</span>
                  </div>
                  <p className="visibility-description">
                    Students can see your profile and request supervision.
                  </p>
                  <button 
                    className="visibility-action-btn hide-btn"
                    onClick={handleVisibilityToggle}
                    disabled={isTogglingVisibility}
                  >
                    {isTogglingVisibility ? 'Updating...' : 'Hide from Students'}
                  </button>
                </div>
              ) : (
                <div className="visibility-inactive">
                  <div className="inactive-status">
                    <span className="status-icon">👁️</span>
                    <span className="status-text">Show to Students</span>
                  </div>
                  <p className="visibility-description">
                    Click to make your profile visible in the student faculty directory.
                  </p>
                  <button 
                    className="visibility-action-btn show-btn"
                    onClick={handleVisibilityToggle}
                    disabled={isTogglingVisibility}
                  >
                    {isTogglingVisibility ? 'Updating...' : 'Show to Students'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        
      <div className="info-card">
        <h3 className="info-title">Security</h3>
        <div className="security-actions">
          <button 
              className="action-button"
              onClick={() => setShowChangePasswordModal(true)} // Add click handler
            >
              Change Password
            </button>
        </div>
      </div>
    </div>
    <button 
      className="edit-profile-btn"
      onClick={() => setActiveTab("profile")}
    >
      Edit Profile
    </button>
    <ChangePasswordModal 
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
  </div>
);
};


  const ProfileSetting = ({ setActiveTab }) => {
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    email: '',
    department: '',
    role: '',
    office: '',
    joined: '',
    profilePicture: null,
  });
  const [errors, setErrors] = useState({}); // ✅ ADD: Missing state declaration
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ ADD: Missing state declaration
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null); // Add preview state
  const [imageLoading, setImageLoading] = useState(false); // Add loading state

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("facultyToken");
      if (!token) {
        setError("No token found");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/faculty/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setProfileData(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchProfile();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!profileData.name || profileData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    } else if (profileData.name.trim().length > 50) {
      newErrors.name = "Name cannot exceed 50 characters";
    } else if (!/^[a-zA-Z\s.'-]+$/.test(profileData.name.trim())) {
      newErrors.name = "Name can only contain letters, spaces, periods, apostrophes, and hyphens";
    }

    // Phone validation
    if (profileData.phone && profileData.phone.trim()) {
      const cleanPhone = profileData.phone.replace(/[\s\-\(\)\.]/g, "");
      const validPatterns = [
        /^\+8801[3-9]\d{8}$/,
        /^8801[3-9]\d{8}$/,
        /^01[3-9]\d{8}$/,
      ];

      const isValidPhone = validPatterns.some((pattern) => pattern.test(cleanPhone));
      if (!isValidPhone) {
        newErrors.phone = "Please enter a valid Bangladeshi mobile number (e.g., +880 1712345678)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    setImageLoading(true); // Start loading

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setProfileData(prev => ({ 
        ...prev, 
        profilePicture: base64String 
      }));
      setImagePreview(base64String);
      setImageLoading(false); // End loading
    };
    reader.onerror = () => {
      alert('Error reading file');
      setImageLoading(false);
    };
    reader.readAsDataURL(file);
  };


  // Update handleProfileSubmit to include profilePicture
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const token = localStorage.getItem("facultyToken");
    if (!token) {
      alert("No authentication token found. Please login again.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Clean and normalize phone number
      let normalizedPhone = null;
      if (profileData.phone && profileData.phone.trim()) {
        const cleanedPhone = profileData.phone.replace(/[\s\-\(\)\.]/g, "");
        
        if (cleanedPhone.startsWith("01")) {
          normalizedPhone = `+880${cleanedPhone.substring(1)}`;
        } else if (cleanedPhone.startsWith("1")) {
          normalizedPhone = `+880${cleanedPhone}`;
        } else if (cleanedPhone.startsWith("880")) {
          normalizedPhone = `+${cleanedPhone}`;
        } else if (cleanedPhone.startsWith("+880")) {
          normalizedPhone = cleanedPhone;
        }
      }

      const res = await fetch(`${API_BASE}/api/faculty/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileData.name.trim(),
          phone: normalizedPhone,
          profilePicture: profileData.profilePicture // Include base64 image
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.errors) {
          const fieldErrors = {};
          data.errors.forEach(error => {
            if (error.field) {
              fieldErrors[error.field] = error.message;
            }
          });
          setErrors(fieldErrors);
          alert("Please fix the validation errors and try again.");
        } else {
          throw new Error(data.message || `Server error: ${res.status}`);
        }
        return;
      }

      // Success - update local state
      setProfileData(prev => ({ ...prev, ...data }));
      alert("Profile updated successfully!");
      setActiveTab("profileShow");

    } catch (err) {
      console.error("Profile update error:", err);
      alert(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (error) return <div>Error: {error}</div>;
  if (!profileData.name) return <div>Loading...</div>;

  return (
    <div className="content-box">
      <button
        className="action-button"
        onClick={() => setActiveTab("profileShow")}
      >
        Back to Profile
      </button>

      <h2>Profile Settings</h2>

<div className="profile-picture-section">
        <div className="avatar-container">
          <img
            src={imagePreview || profileData.profilePicture || "/default-avatar.png"}
            className="profile-avatar"
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              e.target.src = "/default-avatar.png";
              setImageLoading(false);
            }}
            style={{
              opacity: imageLoading ? 0.7 : 1,
              transition: 'opacity 0.3s ease'
            }}
          />
          
          {/* ✅ FIXED: Stable loading overlay */}
          {imageLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}

          <label className="upload-avatar-button">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            <div className="update-photo-content">
              <FaCamera className="camera-icon" />
              <span>Photo</span>
            </div>
          </label>
        </div>
      </div>

      <form onSubmit={handleProfileSubmit} className="profile-form">
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="name"
            value={profileData.name || ''}
            onChange={handleProfileChange}
            className={errors.name ? 'error' : ''}
            required
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={profileData.phone || ''}
            onChange={handleProfileChange}
            onFocus={() => {
              if (errors.phone) {
                setErrors(prev => ({ ...prev, phone: '' }));
              }
            }}
            className={errors.phone ? 'error' : ''}
            placeholder="+880 1712345678"
            autoComplete="tel"
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
          <small className="help-text">
            Valid formats: +880 1XXXXXXXX, 01XXXXXXXX, or 8801XXXXXXXX
          </small>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            disabled
            type="email"
            name="email"
            value={profileData.email || ''}
          />
        </div>

        <div className="form-group">
          <label>Department</label>
          <input
            disabled
            type="text"
            name="department"
            value={profileData.department || 'Not Added'}
          />
        </div>

        <div className="form-group">
          <label>Role</label>
          <input
            disabled
            type="text"
            name="role"
            value={profileData.role || 'Not Added'}
          />
        </div>

        <div className="form-group">
          <label>Office</label>
          <input
            disabled
            type="text"
            name="office"
            value={profileData.office || 'Not Assigned yet'}
          />
        </div>

        <div className="form-group">
          <label>Joined</label>
          <input
            disabled
            type="text"
            name="joined"
            value={profileData.joined || 'Not Added'}
          />
        </div>

        <button 
          type="submit" 
          className="action-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};


// Add this enhanced BoardMeetings function to replace the existing one in FacultyDashboard.js
// Updated BoardMeetings function with detailed member and faculty information
function BoardMeetings() {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState('A');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NEW: Additional state for detailed views
  const [showTeamDetailsModal, setShowTeamDetailsModal] = useState(false);
  const [selectedTeamForDetails, setSelectedTeamForDetails] = useState(null);
  const [showBoardDetailsModal, setShowBoardDetailsModal] = useState(false);
  const [selectedBoardForDetails, setSelectedBoardForDetails] = useState(null);
  const [expandedTeamCards, setExpandedTeamCards] = useState(new Set());

  // Supervisor evaluation view states
  const [supervisorTeams, setSupervisorTeams] = useState([]);
  const [showDetailedEvaluationModal, setShowDetailedEvaluationModal] = useState(false);
  const [selectedTeamEvaluation, setSelectedTeamEvaluation] = useState(null);
  const [detailedEvaluationData, setDetailedEvaluationData] = useState(null);
  const [isLoadingDetailedEvaluation, setIsLoadingDetailedEvaluation] = useState(false);

  // Evaluation form state
  const [evaluationType, setEvaluationType] = useState('team');
  const [teamMark, setTeamMark] = useState('');
  const [teamFeedback, setTeamFeedback] = useState('');
  const [individualMarks, setIndividualMarks] = useState({});
  const [individualFeedbacks, setIndividualFeedbacks] = useState({});

  // Toggle team card expansion
  const toggleTeamCardExpansion = (teamId) => {
    setExpandedTeamCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  // Load faculty boards with enhanced details
  const loadBoards = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/my-boards`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBoards(data.boards || []);
      }
    } catch (error) {
      console.error('Load boards error:', error);
      showMessage('Failed to load boards', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load supervisor teams with evaluation status
  const loadSupervisorTeams = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/supervisor-teams-evaluations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSupervisorTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Load supervisor teams error:', error);
      showMessage('Failed to load supervisor teams', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load teams for evaluation with enhanced member details
  const loadTeams = async (boardId, phase) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(
        `${API_BASE}/api/faculty/boards/${boardId}/teams/${phase}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Load teams error:', error);
      showMessage('Failed to load teams', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load detailed evaluation for supervisor
  const loadDetailedEvaluation = async (teamId, boardId, phase) => {
    setIsLoadingDetailedEvaluation(true);
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(
        `${API_BASE}/api/faculty/boards/${boardId}/teams/${teamId}/detailed-evaluation/${phase}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDetailedEvaluationData(data);
        setShowDetailedEvaluationModal(true);
      } else {
        const errorData = await response.json();
        showMessage(errorData.message || 'Failed to load detailed evaluation', 'error');
      }
    } catch (error) {
      console.error('Load detailed evaluation error:', error);
      showMessage('Failed to load detailed evaluation', 'error');
    } finally {
      setIsLoadingDetailedEvaluation(false);
    }
  };

  // Submit evaluation (existing logic)
  const submitEvaluation = async () => {
    if (!selectedTeam || !selectedBoard) return;

    // Validation logic
    if (evaluationType === 'team') {
      if (!teamMark || teamMark < 0 || teamMark > 100) {
        showMessage('Please enter a valid team mark (0-100)', 'error');
        return;
      }
    } else {
      const allMarksValid = selectedTeam.members.every(member => {
        const mark = individualMarks[member.studentId];
        return mark !== '' && mark >= 0 && mark <= 100;
      });
      
      if (!allMarksValid) {
        showMessage('Please enter valid marks (0-100) for all team members', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('facultyToken');
      
      const requestBody = {
        phase: selectedPhase,
        evaluationType: evaluationType
      };

      if (evaluationType === 'team') {
        requestBody.teamMark = parseFloat(teamMark);
        requestBody.teamFeedback = teamFeedback;
      } else {
        requestBody.individualMarks = selectedTeam.members.map(member => ({
          studentId: member.studentId,
          studentName: member.name,
          mark: parseFloat(individualMarks[member.studentId]),
          feedback: individualFeedbacks[member.studentId] || ''
        }));
      }

      const response = await fetch(
        `${API_BASE}/api/faculty/boards/${selectedBoard._id}/teams/${selectedTeam._id}/evaluate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (response.ok) {
        const data = await response.json();
        showMessage(
          data.isCompleted 
            ? 'Evaluation submitted! All board members have completed evaluation.' 
            : 'Evaluation submitted successfully!',
          'success'
        );
        setShowEvaluationModal(false);
        loadTeams(selectedBoard._id, selectedPhase);
        loadSupervisorTeams();
      } else {
        const errorData = await response.json();
        showMessage(errorData.message || 'Failed to submit evaluation', 'error');
      }
    } catch (error) {
      console.error('Submit evaluation error:', error);
      showMessage('Network error: Failed to submit evaluation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get CGPA color
  const getCGPAColor = (cgpa) => {
    if (cgpa >= 3.5) return '#10b981'; // green
    if (cgpa >= 3.0) return '#f59e0b'; // amber
    if (cgpa >= 2.5) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  // Helper function to get credit status
  const getCreditStatus = (credits) => {
    if (credits >= 95) return { status: 'Sufficient', color: '#10b981' };
    if (credits >= 85) return { status: 'Nearly There', color: '#f59e0b' };
    return { status: 'Insufficient', color: '#ef4444' };
  };

  // Load data on component mount
  useEffect(() => {
    loadBoards();
    loadSupervisorTeams();
  }, []);

  // Load teams when board or phase changes
  useEffect(() => {
    if (selectedBoard && selectedPhase) {
      loadTeams(selectedBoard._id, selectedPhase);
    }
  }, [selectedBoard, selectedPhase]);

  if (isLoading && boards.length === 0 && supervisorTeams.length === 0) {
    return (
      <div className="board-evaluation-main-loading">
        <FaSpinner className="board-evaluation-spinner" />
        <span className="board-evaluation-loading-text">Loading board information...</span>
      </div>
    );
  }

  return (
    <div className="board-evaluation-main-container">
      <div className="board-evaluation-page-header">
        <h2 className="board-evaluation-title">Board Meetings & Evaluations</h2>
        <p className="board-evaluation-subtitle">Evaluate team presentations and view evaluation results</p>
      </div>

      {/* Supervisor Teams Section */}
      {supervisorTeams.length > 0 && (
        <div className="board-evaluation-supervisor-teams-section">
          <h3 className="board-evaluation-section-title">Your Supervised Teams - Evaluation Status</h3>
          <div className="board-evaluation-supervisor-teams-grid">
            {supervisorTeams.map((team) => (
              <div key={team._id} className="board-evaluation-supervisor-team-card">
                <div className="board-evaluation-team-card-header">
                  <h4 className="board-evaluation-team-name">{team.name}</h4>
                  <span className={`board-evaluation-team-phase-badge board-evaluation-phase-${team.currentPhase || 'A'}`}>
                    Phase {team.currentPhase || 'A'}
                  </span>
                </div>
                
                <div className="board-evaluation-team-evaluation-phases">
                  {['A', 'B', 'C'].map((phase) => {
                    const phaseStatus = team.evaluationStatus[phase];
                    return (
                      <div key={phase} className={`board-evaluation-phase-evaluation-status ${phaseStatus.isCompleted ? 'board-evaluation-completed' : phaseStatus.exists ? 'board-evaluation-partial' : 'board-evaluation-not-started'}`}>
                        <div className="board-evaluation-phase-header">
                          <span className="board-evaluation-phase-name">Phase {phase}</span>
                          <span className="board-evaluation-evaluation-progress">
                            {phaseStatus.submittedEvaluations}/{phaseStatus.totalEvaluators}
                          </span>
                        </div>
                        
                        {phaseStatus.exists && (
                          <div className="board-evaluation-phase-actions">
                            <span className="board-evaluation-board-name">{phaseStatus.boardName}</span>
                            <button
                              className="board-evaluation-view-detailed-evaluation-btn"
                              onClick={() => loadDetailedEvaluation(team._id, phaseStatus.boardId, phase)}
                              disabled={!phaseStatus.exists}
                            >
                              {phaseStatus.isCompleted ? 'View Results' : 'View Progress'}
                            </button>
                          </div>
                        )}
                        
                        {!phaseStatus.exists && (
                          <div className="board-evaluation-no-evaluation">
                            <span>Not assigned to evaluation board</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Board Selection Section */}
      <div className="board-evaluation-selection-section">
        <h3 className="board-evaluation-section-title">Your Evaluation Boards ({boards.length})</h3>
        <div className="board-evaluation-boards-grid">
          {boards.map((board, index) => (
            <div key={board._id} className="board-evaluation-enhanced-board-card">
              <div 
                className={`board-evaluation-board-card ${selectedBoard?._id === board._id ? 'board-evaluation-selected' : ''}`}
                onClick={() => setSelectedBoard(board)}
              >
                <div className="board-evaluation-card-header">
                  <h4 className="board-evaluation-board-name">{board.name}</h4>
                  <div className="board-evaluation-board-number">Board {['I', 'II', 'III', 'IV', 'V', 'VI'][index] || (index + 1)}</div>
                </div>
                <div className="board-evaluation-board-stats">
                  <span className="board-evaluation-stat">Faculty: {board.faculty?.length || 0}</span>
                  <span className="board-evaluation-stat">Pending: {board.pendingEvaluations || 0}</span>
                </div>
                <div className="board-evaluation-board-role">
                  Role: {board.facultyRole || 'Member'}
                </div>
              </div>

              {/* NEW: Faculty Details Section */}
              <div className="board-evaluation-faculty-details-section">
                <div className="board-evaluation-faculty-header">
                  <h5 className="board-evaluation-faculty-title">Board Faculty Members</h5>
                  <button 
                    className="board-evaluation-view-faculty-btn"
                    onClick={() => {
                      setSelectedBoardForDetails(board);
                      setShowBoardDetailsModal(true);
                    }}
                  >
                    <FaEye /> View All Faculty
                  </button>
                </div>
                <div className="board-evaluation-faculty-preview">
                  {board.faculty?.slice(0, 3).map((faculty, idx) => (
                    <div key={idx} className="board-evaluation-faculty-preview-item">
                      <div className="board-evaluation-faculty-avatar">
                        {faculty.name.charAt(0)}
                      </div>
                      <div className="board-evaluation-faculty-info">
                        <span className="board-evaluation-faculty-name">{faculty.name}</span>
                        <span className="board-evaluation-faculty-dept">{faculty.department}</span>
                      </div>
                    </div>
                  ))}
                  {board.faculty?.length > 3 && (
                    <div className="board-evaluation-more-faculty">
                      +{board.faculty.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {boards.length === 0 && (
          <div className="board-evaluation-no-boards-message">
            <div className="board-evaluation-empty-state">
              <p>You are not assigned to any evaluation boards yet.</p>
              <p>Contact administration if you believe this is an error.</p>
            </div>
          </div>
        )}
      </div>

      {/* Phase Selection & Teams */}
      {selectedBoard && (
        <>
          <div className="board-evaluation-phase-selection">
            <h3 className="board-evaluation-section-title">Select Phase for Evaluation</h3>
            <div className="board-evaluation-phase-selector">
              {['A', 'B', 'C'].map(phase => (
                <button
                  key={phase}
                  className={`board-evaluation-phase-btn ${selectedPhase === phase ? 'board-evaluation-active' : ''}`}
                  onClick={() => setSelectedPhase(phase)}
                >
                  Phase {phase}
                </button>
              ))}
            </div>
          </div>

          <div className="board-evaluation-teams-section">
            <h3 className="board-evaluation-section-title">Teams for Phase {selectedPhase} Evaluation</h3>
            {isLoading ? (
              <div className="board-evaluation-loading-teams">
                <FaSpinner className="board-evaluation-spinner" />
                <span className="board-evaluation-loading-text">Loading teams...</span>
              </div>
            ) : teams.length === 0 ? (
              <div className="board-evaluation-no-teams-message">
                <p>No teams available for Phase {selectedPhase} evaluation.</p>
              </div>
            ) : (
              <div className="board-evaluation-teams-grid">
                {teams.map(team => {
                  const isExpanded = expandedTeamCards.has(team._id);
                  return (
                    <div key={team._id} className={`board-evaluation-enhanced-team-card ${team.evaluationStatus === 'completed' ? 'board-evaluation-evaluated' : ''}`}>
                      <div className="board-evaluation-team-card-header">
                        <h4 className="board-evaluation-team-name">{team.name}</h4>
                        <div className="board-evaluation-team-status">
                          <span className={`board-evaluation-evaluation-status board-evaluation-${team.evaluationStatus}`}>
                            {team.evaluationStatus === 'completed' ? 'Evaluated' : 'Pending'}
                          </span>
                          {team.isSupervisor && <span className="board-evaluation-supervisor-badge">Your Team</span>}
                        </div>
                      </div>
                      
                      <div className="board-evaluation-team-info">
                        <p><strong>Members:</strong> {team.members?.length || 0}</p>
                        <p><strong>Phase:</strong> {team.currentPhase || 'A'}</p>
                        {team.projectIdea && (
                          <p><strong>Project:</strong> {team.projectIdea.substring(0, 60)}...</p>
                        )}
                      </div>

                      {/* NEW: Enhanced Team Members Section */}
                      <div className="board-evaluation-team-members-section">
                        <div className="board-evaluation-members-header">
                          <h5 className="board-evaluation-members-title">Team Members</h5>
                          <div className="board-evaluation-members-actions">
                            <button 
                              className="board-evaluation-toggle-members-btn"
                              onClick={() => toggleTeamCardExpansion(team._id)}
                            >
                              {isExpanded ? <FaEyeSlash /> : <FaEye />}
                              {isExpanded ? 'Hide Details' : 'Show Details'}
                            </button>
                          
                          </div>
                        </div>

                        {/* Basic Member List */}
                        <div className="board-evaluation-team-members-list">
                          {team.members?.slice(0, 3).map((member, idx) => (
                            <div key={idx} className="board-evaluation-member-chip">
                              <span>{member.name}</span>
                              {member.role === 'Leader' && <FaCrown className="board-evaluation-leader-icon" />}
                            </div>
                          ))}
                          {team.members?.length > 3 && (
                            <div className="board-evaluation-more-members">+{team.members.length - 3}</div>
                          )}
                        </div>

                        {/* NEW: Expanded Member Details */}
                        {isExpanded && (
  <div className="faculty-team-member-expansion-container">
    <div className="faculty-member-details-grid">
      {team.members?.map((member, idx) => (
        <div key={idx} className="faculty-individual-member-card">
          <div className="faculty-member-card-header">
            <div className="faculty-member-profile-image">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} />
              ) : (
                <div className="faculty-member-initials-circle">
                  {member.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="faculty-member-primary-info">
              <h6 className="faculty-member-full-name">{member.name}</h6>
              <span className={`faculty-member-position-tag ${member.role?.toLowerCase()}`}>
                {member.role === 'Leader' && <FaCrown />} {member.role}
              </span>
            </div>
          </div>
          
          <div className="faculty-member-academic-details">
            <div className="faculty-detail-information-row">
              <span className="faculty-detail-field-label">Student ID:</span>
              <span className="faculty-detail-field-content">{member.studentId}</span>
            </div>
            <div className="faculty-detail-information-row">
              <span className="faculty-detail-field-label">Email:</span>
              <span className="faculty-detail-field-content">{member.email}</span>
            </div>
            <div className="faculty-detail-information-row">
              <span className="faculty-detail-field-label">Program:</span>
              <span className="faculty-detail-field-content">{member.program}</span>
            </div>
            {member.completedCredits !== undefined && (
              <div className="faculty-detail-information-row">
                <span className="faculty-detail-field-label">Credits:</span>
                <span 
                  className="faculty-detail-field-content"
                  style={{ color: getCreditStatus(member.completedCredits).color }}
                >
                  {member.completedCredits} ({getCreditStatus(member.completedCredits).status})
                </span>
              </div>
            )}
            {member.cgpa !== undefined && (
              <div className="faculty-detail-information-row">
                <span className="faculty-detail-field-label">CGPA:</span>
                <span 
                  className="faculty-detail-field-content faculty-cgpa-display-value"
                  style={{ color: getCGPAColor(member.cgpa) }}
                >
                  {member.cgpa.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

                      </div>

                      <div className="board-evaluation-team-actions">
                        <button
                          className={`board-evaluation-evaluate-btn ${team.evaluationStatus === 'completed' ? 'board-evaluation-completed' : ''}`}
                          onClick={() => {
                            setSelectedTeam(team);
                            if (team.existingEvaluation) {
                              setEvaluationType(team.existingEvaluation.evaluationType);
                              if (team.existingEvaluation.evaluationType === 'team') {
                                setTeamMark(team.existingEvaluation.teamMark.toString());
                                setTeamFeedback(team.existingEvaluation.teamFeedback || '');
                              } else {
                                const marks = {};
                                const feedbacks = {};
                                team.existingEvaluation.individualMarks?.forEach(mark => {
                                  marks[mark.studentId] = mark.mark.toString();
                                  feedbacks[mark.studentId] = mark.feedback || '';
                                });
                                setIndividualMarks(marks);
                                setIndividualFeedbacks(feedbacks);
                              }
                            } else {
                              setEvaluationType('team');
                              setTeamMark('');
                              setTeamFeedback('');
                              setIndividualMarks({});
                              setIndividualFeedbacks({});
                            }
                            setShowEvaluationModal(true);
                          }}
                        >
                          {team.evaluationStatus === 'completed' ? 'Update Evaluation' : 'Start Evaluation'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* NEW: Board Faculty Details Modal */}
      {showBoardDetailsModal && selectedBoardForDetails && (
  <div className="faculty-board-member-modal-backdrop" onClick={() => setShowBoardDetailsModal(false)}>
    <div className="faculty-board-member-display-container" onClick={(e) => e.stopPropagation()}>
      <div className="faculty-board-member-header-section">
        <h3 className="faculty-board-member-modal-title">
          Board Faculty Members: {selectedBoardForDetails.name}
        </h3>
        <button 
          className="faculty-board-member-close-button"
          onClick={() => setShowBoardDetailsModal(false)}
        >
          <FaTimes />
        </button>
      </div>

      <div className="faculty-board-member-content-wrapper">
        <div className="faculty-board-member-summary-section">
          <div className="faculty-board-member-info-container">
            <h4>Board Information</h4>
            <p><strong>Board Name:</strong> {selectedBoardForDetails.name}</p>
            <p><strong>Total Faculty:</strong> {selectedBoardForDetails.faculty?.length || 0}</p>
            <p><strong>Your Role:</strong> {selectedBoardForDetails.facultyRole || 'Member'}</p>
            {selectedBoardForDetails.description && (
              <p><strong>Description:</strong> {selectedBoardForDetails.description}</p>
            )}
          </div>
        </div>

        <div className="faculty-board-member-listing-section">
          <h4>Faculty Members</h4>
          <div className="faculty-board-member-cards-grid">
            {selectedBoardForDetails.faculty?.map((faculty, index) => (
              <div key={index} className="faculty-board-member-individual-card">
                <div className="faculty-board-member-card-top">
                  <div className="faculty-board-member-profile-circle">
                    {faculty.name.charAt(0)}
                  </div>
                  <div className="faculty-board-member-basic-details">
                    <h5 className="faculty-board-member-full-name">{faculty.name}</h5>
                    <span className="faculty-board-member-position-tag">Board Member</span>
                  </div>
                </div>
                
                <div className="faculty-board-member-details-list">
                  <div className="faculty-board-member-detail-item">
                    <span className="faculty-board-member-label-text">Email:</span>
                    <span className="faculty-board-member-value-text">{faculty.email}</span>
                  </div>
                  <div className="faculty-board-member-detail-item">
                    <span className="faculty-board-member-label-text">Department:</span>
                    <span className="faculty-board-member-value-text">{faculty.department}</span>
                  </div>
                  <div className="faculty-board-member-detail-item">
                    <span className="faculty-board-member-label-text">Assigned:</span>
                    <span className="faculty-board-member-value-text">
                      {faculty.assignedDate ? new Date(faculty.assignedDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {faculty.role && (
                    <div className="faculty-board-member-detail-item">
                      <span className="faculty-board-member-label-text">Position:</span>
                      <span className="faculty-board-member-value-text">{faculty.role}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="faculty-board-member-footer-section">
        <button 
          className="faculty-board-member-close-action-btn"
          onClick={() => setShowBoardDetailsModal(false)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

      

      {/* Existing Evaluation Modal */}
      {showEvaluationModal && selectedTeam && (
        <div className="board-evaluation-modal-overlay" onClick={() => setShowEvaluationModal(false)}>
          <div className="board-evaluation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="board-evaluation-modal-header">
              <h3 className="board-evaluation-modal-title">Evaluate Team: {selectedTeam.name} - Phase {selectedPhase}</h3>
              <button className="board-evaluation-modal-close" onClick={() => setShowEvaluationModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="board-evaluation-modal-content">
              <div className="board-evaluation-type-selector">
                <h4 className="board-evaluation-selector-title">Evaluation Type</h4>
                <div className="board-evaluation-radio-group">
                  <label className="board-evaluation-radio-label">
                    <input
                      type="radio"
                      value="team"
                      checked={evaluationType === 'team'}
                      onChange={(e) => setEvaluationType(e.target.value)}
                      className="board-evaluation-radio-input"
                    />
                    <span className="board-evaluation-radio-text">Team-level Evaluation (Same mark for all members)</span>
                  </label>
                  <label className="board-evaluation-radio-label">
                    <input
                      type="radio"
                      value="individual"
                      checked={evaluationType === 'individual'}
                      onChange={(e) => setEvaluationType(e.target.value)}
                      className="board-evaluation-radio-input"
                    />
                    <span className="board-evaluation-radio-text">Individual Evaluation (Different marks per member)</span>
                  </label>
                </div>
              </div>

              {evaluationType === 'team' ? (
                <div className="board-evaluation-team-evaluation">
                  <h4 className="board-evaluation-form-title">Team Evaluation</h4>
                  <div className="board-evaluation-form-group">
                    <label className="board-evaluation-form-label">Team Mark (0-100):</label>
                    <GradeInputComponent 
                      currentGrade={teamMark}
                      onGradeChange={setTeamMark}
                      label="Team Mark (0-100%)"
                    />
                  </div>
                  <div className="board-evaluation-form-group">
                    <label className="board-evaluation-form-label">Team Feedback:</label>
                    <textarea
                      value={teamFeedback}
                      onChange={(e) => setTeamFeedback(e.target.value)}
                      rows="4"
                      placeholder="Provide feedback for the team's performance..."
                      className="board-evaluation-textarea"
                    />
                  </div>
                </div>
              ) : (
                <div className="board-evaluation-individual-evaluation">
                  <h4 className="board-evaluation-form-title">Individual Member Evaluation</h4>
                  {selectedTeam.members?.map((member, index) => (
                    <div key={member.studentId} className="board-evaluation-member-evaluation">
                      <div className="board-evaluation-member-header">
                        <div className="board-evaluation-member-info-header">
                          <h5 className="board-evaluation-member-name">{member.name} ({member.studentId})</h5>
                          {member.role === 'Leader' && <span className="board-evaluation-leader-badge">Leader</span>}
                        </div>
                        <div className="board-evaluation-member-academic-info">
                          <span className="board-evaluation-member-program">{member.program}</span>
                          {member.cgpa && (
                            <span 
                              className="board-evaluation-member-cgpa"
                              style={{ color: getCGPAColor(member.cgpa) }}
                            >
                              CGPA: {member.cgpa.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="board-evaluation-member-form">
                        <div className="board-evaluation-form-group">
                          <label className="board-evaluation-form-label">Mark (0-100):</label>
                          <GradeInputComponent 
                            currentGrade={individualMarks[member.studentId] || ''}
                            onGradeChange={(value) => setIndividualMarks(prev => ({
                              ...prev,
                              [member.studentId]: value
                            }))}
                            label="Individual Mark (0-100%)"
                          />
                        </div>
                        <div className="board-evaluation-form-group">
                          <label className="board-evaluation-form-label">Individual Feedback:</label>
                          <textarea
                            value={individualFeedbacks[member.studentId] || ''}
                            onChange={(e) => setIndividualFeedbacks(prev => ({
                              ...prev,
                              [member.studentId]: e.target.value
                            }))}
                            rows="2"
                            placeholder={`Feedback for ${member.name}...`}
                            className="board-evaluation-textarea"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="board-evaluation-modal-footer">
              <button 
                className="board-evaluation-cancel-btn" 
                onClick={() => setShowEvaluationModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="board-evaluation-submit-btn" 
                onClick={submitEvaluation}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="board-evaluation-spinner" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  'Submit Evaluation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Detailed Evaluation Modal for Supervisor */}
      {showDetailedEvaluationModal && detailedEvaluationData && (
        <div className="board-evaluation-detailed-modal-overlay" onClick={() => setShowDetailedEvaluationModal(false)}>
          <div className="board-evaluation-detailed-modal" onClick={(e) => e.stopPropagation()}>
            <div className="board-evaluation-detailed-header">
              <h3 className="board-evaluation-detailed-title">
                Detailed Evaluation Results: {detailedEvaluationData.team.name} - Phase {detailedEvaluationData.phase}
              </h3>
              <button 
                className="board-evaluation-detailed-close-btn"
                onClick={() => setShowDetailedEvaluationModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="board-evaluation-detailed-content">
              {/* Evaluation Progress Summary */}
              <div className="board-evaluation-progress-summary">
                <h4 className="board-evaluation-summary-title">Evaluation Progress</h4>
                <div className="board-evaluation-progress-stats">
                  <div className="board-evaluation-progress-stat">
                    <span className="board-evaluation-stat-label">Completed Evaluations:</span>
                    <span className="board-evaluation-stat-value">
                      {detailedEvaluationData.submittedEvaluations}/{detailedEvaluationData.totalEvaluators}
                    </span>
                  </div>
                  <div className="board-evaluation-progress-stat">
                    <span className="board-evaluation-stat-label">Board:</span>
                    <span className="board-evaluation-stat-value">{detailedEvaluationData.board.name}</span>
                  </div>
                  <div className="board-evaluation-progress-stat">
                    <span className="board-evaluation-stat-label">Status:</span>
                    <span className={`board-evaluation-stat-value ${detailedEvaluationData.isCompleted ? 'board-evaluation-completed' : 'board-evaluation-in-progress'}`}>
                      {detailedEvaluationData.isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Final Results (if evaluation is completed) */}
              {detailedEvaluationData.isCompleted && detailedEvaluationData.evaluation.finalResults && (
                <div className="board-evaluation-final-results-section">
                  <h4 className="board-evaluation-results-title">Final Results</h4>
                  <div className="board-evaluation-results-grid">
                    {detailedEvaluationData.evaluation.finalResults.individualResults.map((result, index) => (
                      <div key={index} className="board-evaluation-student-final-result">
                        <div className="board-evaluation-student-result-header">
                          <h5 className="board-evaluation-student-name">{result.studentName}</h5>
                          <div className="board-evaluation-grade-display">
                            <span className="board-evaluation-final-mark">{result.finalMark}%</span>
                            <span 
                              className="board-evaluation-letter-grade"
                              style={{ backgroundColor: getGradeColor(result.grade) }}
                            >
                              {result.grade}
                            </span>
                            <span className="board-evaluation-gpa">GPA: {result.gpa}</span>
                          </div>
                        </div>
                        <div className="board-evaluation-result-breakdown">
                          <p><strong>Board Average:</strong> {result.breakdown.boardAverage.toFixed(1)}%</p>
                          <p><strong>Supervisor Mark:</strong> {result.breakdown.supervisorMark}%</p>
                          <p><strong>Calculation:</strong> {result.breakdown.finalCalculation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual Faculty Evaluations */}
              <div className="board-evaluation-faculty-evaluations-section">
                <h4 className="board-evaluation-evaluations-title">Faculty Evaluations</h4>
                <div className="board-evaluation-evaluations-list">
                  {detailedEvaluationData.evaluation.evaluations.map((evaluation, index) => (
                    <div key={index} className="board-evaluation-faculty-evaluation-item">
                      <div className="board-evaluation-faculty-evaluation-header">
                        <h5 className="board-evaluation-faculty-name">{evaluation.facultyDetails.name}</h5>
                        <span className="board-evaluation-evaluation-type-badge">
                          {evaluation.evaluationType === 'team' ? 'Team Evaluation' : 'Individual Evaluation'}
                        </span>
                        <span className="board-evaluation-submission-date">
                          {new Date(evaluation.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="board-evaluation-evaluation-details">
                        {evaluation.evaluationType === 'team' ? (
                          <div className="board-evaluation-team-evaluation-details">
                            <p><strong>Team Mark:</strong> {evaluation.teamMark}%</p>
                            {evaluation.teamFeedback && (
                              <p><strong>Feedback:</strong> {evaluation.teamFeedback}</p>
                            )}
                          </div>
                        ) : (
                          <div className="board-evaluation-individual-evaluation-details">
                            <h6 className="board-evaluation-marks-title">Individual Marks:</h6>
                            {evaluation.individualMarks?.map((mark, idx) => (
                              <div key={idx} className="board-evaluation-individual-mark-item">
                                <span className="board-evaluation-student-name">{mark.studentName}:</span>
                                <span className="board-evaluation-mark">{mark.mark}%</span>
                                {mark.feedback && (
                                  <span className="board-evaluation-feedback">"{mark.feedback}"</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="board-evaluation-detailed-footer">
              <button 
                className="board-evaluation-close-detailed-modal-btn"
                onClick={() => setShowDetailedEvaluationModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





function SupervisedTeams() {
  const [supervisedTeams, setSupervisedTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: '',
    reason: ''
  });

const [isCompletingProject, setIsCompletingProject] = useState(false);
const [completingTeamId, setCompletingTeamId] = useState(null);


  // Add these functions inside the SupervisedTeams component
const getNextPhase = (currentPhase) => {
  switch(currentPhase) {
    case 'A': return 'B';
    case 'B': return 'C';
    case 'C': return null; // No next phase after C
    default: return 'B'; // Default to B if unknown
  }
};



// Add state for tracking phase update
const [isUpdatingPhase, setIsUpdatingPhase] = useState(false);
const [updatingTeamId, setUpdatingTeamId] = useState(null);

  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [selectedMemberForRemoval, setSelectedMemberForRemoval] = useState(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  const canAdvancePhase = (currentPhase) => {
  return getNextPhase(currentPhase) !== null;
};

// Add a helper function to get phase progression info
const getPhaseProgressionInfo = (currentPhase) => {
  const phases = ['A', 'B', 'C'];
  const currentIndex = phases.indexOf(currentPhase);
  const completed = phases.slice(0, currentIndex + 1);
  const remaining = phases.slice(currentIndex + 1);
  
  return {
    completed,
    current: currentPhase,
    remaining,
    isComplete: currentPhase === 'C'
  };
};

   const getPhaseDescription = (phase) => {
    const descriptions = {
      "A": "Research & Planning Phase",
      "B": "Development & Implementation Phase", 
      "C": "Testing & Final Presentation Phase"
    };
    return descriptions[phase] || "Unknown Phase";
  };


  const handlePhaseClick = async (team) => {
  if (isUpdatingPhase) return;
  
  const currentPhase = team.currentPhase || team.phase || 'A';
  const nextPhase = getNextPhase(currentPhase);
  
  // Check if phase can be advanced
  if (!nextPhase) {
    showMessage(
      `Team "${team.name}" is already at the final phase (${getPhaseDescription(currentPhase)})`, 
      'info'
    );
    return;
  }
  
  setIsUpdatingPhase(true);
  setUpdatingTeamId(team._id);
  
  try {
    const token = localStorage.getItem('facultyToken');
    const response = await fetch(`${API_BASE}/api/faculty/teams/${team._id}/phase`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ phase: nextPhase })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Update local state
      setSupervisedTeams(prevTeams => 
        prevTeams.map(t => 
          t._id === team._id 
            ? { ...t, currentPhase: nextPhase, phase: nextPhase }
            : t
        )
      );
      
      showMessage(
        `Team "${team.name}" advanced from Phase ${currentPhase} to Phase ${nextPhase} (${getPhaseDescription(nextPhase)})`, 
        'success'
      );
    } else {
      showMessage(
        data.message || 'Failed to advance phase', 
        'error'
      );
    }
  } catch (error) {
    console.error('Error advancing phase:', error);
    showMessage('Network error: Failed to advance phase', 'error');
  } finally {
    setIsUpdatingPhase(false);
    setUpdatingTeamId(null);
  }
};

const handleCompleteProject = async (team) => {
  if (isCompletingProject) return;
  
  const currentPhase = team.currentPhase || team.phase || 'A';
  
  if (currentPhase !== 'C') {
    showMessage(
      'Project can only be completed when team is in Phase C', 
      'error'
    );
    return;
  }

  // Show confirmation dialog
  const confirmed = window.confirm(
    `Are you sure you want to mark the project "${team.name}" as completed?\n\n` +
    'This action will:\n' +
    '• Mark Phase C as completed with duration\n' +
    '• Set team status to "completed"\n' +
    '• Notify all team members\n' +
    '• This action cannot be undone'
  );

  if (!confirmed) return;
  
  setIsCompletingProject(true);
  setCompletingTeamId(team._id);
  
  try {
    const token = localStorage.getItem('facultyToken');
    const response = await fetch(`${API_BASE}/api/faculty/teams/${team._id}/complete-project`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Update local state
      setSupervisedTeams(prevTeams => 
        prevTeams.map(t => 
          t._id === team._id 
            ? { 
                ...t, 
                status: 'completed',
                projectCompleted: true,
                projectCompletedDate: data.team.completionDate
              }
            : t
        )
      );
      
      showMessage(
        `Project "${team.name}" has been marked as completed! Team members have been notified.`, 
        'success'
      );
    } else {
      showMessage(
        data.message || 'Failed to complete project', 
        'error'
      );
    }
  } catch (error) {
    console.error('Error completing project:', error);
    showMessage('Network error: Failed to complete project', 'error');
  } finally {
    setIsCompletingProject(false);
    setCompletingTeamId(null);
  }
};

  const updateTeamPhase = async () => {
    if (!selectedTeamForPhase) return;

    setIsUpdatingPhase(true);
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/teams/${selectedTeamForPhase._id}/phase`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phase: newPhase })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(`Team phase updated to ${newPhase} successfully!`, 'success');
        setShowPhaseModal(false);
        setSelectedTeamForPhase(null);
        fetchSupervisedTeams(); // Refresh the list
      } else {
        showMessage(data.message || 'Failed to update phase', 'error');
      }
    } catch (error) {
      console.error('Error updating phase:', error);
      showMessage('Network error: Failed to update phase', 'error');
    } finally {
      setIsUpdatingPhase(false);
    }
  };

  // Fetch supervised teams
 // In FacultyDashboard.js, update the fetchSupervisedTeams function
const fetchSupervisedTeams = async () => {
  setIsLoading(true);
  try {
    const token = localStorage.getItem('facultyToken');
    const response = await fetch(`${API_BASE}/api/faculty/supervised-teams`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      // Faculty should see ALL their supervised teams, including special cases
      setSupervisedTeams(data.teams || []);
      console.log(`👨‍🏫 Loaded ${data.teams.length} supervised teams`);
    } else {
      console.error('Failed to fetch supervised teams');
      setSupervisedTeams([]);
    }
  } catch (error) {
    console.error('Error fetching supervised teams:', error);
    setSupervisedTeams([]);
  } finally {
    setIsLoading(false);
  }
};

  // Toggle team visibility
  const toggleTeamVisibility = async (teamId, currentVisibility) => {
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/teams/${teamId}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ visible: !currentVisibility })
      });

      const data = await response.json();

      if (response.ok) {
       const visibilityStatus = !currentVisibility ? 'enabled' : 'disabled';
      showMessage(
        `Team visibility ${visibilityStatus} successfully! ${!currentVisibility ? 'Students can now see and join this team.' : 'Team is now hidden from student join requests.'}`, 
        'success'
      );
      fetchSupervisedTeams(); // Refresh the list
    } else {
      // Show error notification
      showMessage(
        data.message || 'Failed to update team visibility. Please try again.', 
        'error'
      );
    }
  } catch (error) {
    console.error('Error updating team visibility:', error);
    showMessage(
      'Network error: Unable to update team visibility. Please check your connection and try again.', 
      'error'
    );
  }
};


const handleRemoveMember = async (teamId, memberStudentId, memberName) => {
  setSelectedMemberForRemoval({ teamId, studentId: memberStudentId, name: memberName });
  setShowRemoveMemberModal(true);
};

// Add this function to confirm member removal
const confirmRemoveMember = async () => {
  if (!selectedMemberForRemoval) return;

  setIsRemovingMember(true);

  try {
    const token = localStorage.getItem('facultyToken');
    const response = await fetch(`${API_BASE}/api/faculty/teams/${selectedMemberForRemoval.teamId}/remove-member`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        memberStudentId: selectedMemberForRemoval.studentId,
        reason: 'Removed by supervisor'
      })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(`${selectedMemberForRemoval.name} has been removed from the team`, 'success');
      setShowRemoveMemberModal(false);
      setSelectedMemberForRemoval(null);
      fetchSupervisedTeams(); // Refresh the teams list
    } else {
      showMessage(data.message || "Failed to remove member", 'error');
    }
  } catch (error) {
    console.error('Remove member error:', error);
    showMessage("Network error: Failed to remove member", 'error');
  } finally {
    setIsRemovingMember(false);
    setShowRemoveMemberModal(false);
    setSelectedMemberForRemoval(null);
  }
};

// Add this function to cancel removal
const cancelRemoveMember = () => {
  setShowRemoveMemberModal(false);
  setSelectedMemberForRemoval(null);
};

  // Update team status
  const updateTeamStatus = async () => {
    if (!selectedTeam || !statusForm.status) {
      alert('Please select a status');
      return;
    }

    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/teams/${selectedTeam._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(statusForm)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Team status updated successfully`);
        setShowStatusModal(false);
        setStatusForm({ status: '', reason: '' });
        setSelectedTeam(null);
        fetchSupervisedTeams(); // Refresh the list
      } else {
        alert(data.message || 'Failed to update team status');
      }
    } catch (error) {
      console.error('Error updating team status:', error);
      alert('Network error: Failed to update team status');
    }
  };

  useEffect(() => {
    fetchSupervisedTeams();
  }, []);

  if (isLoading) {
    return (
      <div className="supervised-teams-loading-wrapper">
        <p>Loading supervised teams...</p>
      </div>
    );
  }

  return (
    <div className="supervised-teams-main-container">
      <div className="supervised-teams-page-header">
        <h2>My Supervised Teams ({supervisedTeams.length})</h2>
        <div className="supervised-teams-header-actions">
          <button 
            className="supervised-teams-refresh-btn"
            onClick={fetchSupervisedTeams}
          >
            <FontAwesomeIcon icon={faSync} />
            Refresh
          </button>
        </div>
      </div>

      {supervisedTeams.length === 0 ? (
        <div className="supervised-teams-empty-state">
          <div className="supervised-teams-no-data">
            <h3>No Supervised Teams</h3>
            <p>You haven't accepted any team supervision requests yet.</p>
            <p>Check your supervision requests to start supervising teams.</p>
          </div>
        </div>
      ) : (
        <div className="supervised-teams-grid-layout">
{supervisedTeams.map((team) => (
        <div key={team._id} className="supervised-teams-card">
          <div className="supervised-teams-card-header">
            <div className="supervised-teams-title-section">
              <h3>{team.name}</h3>
              <div className="team-badges">
                <span className={`supervised-teams-status-badge supervised-teams-status-${team.status}`}>
                  {team.status}
                </span>
         {/* Enhanced Phase Information with Progression Indicator */}
{/* REPLACE the existing phase info container with this formal version */}
<div className="formal-phase-container">
  <div className="phase-progression-wrapper">
    <h5 className="phase-section-title">Project Phase Progress</h5>
    
    {/* Phase Timeline */}
    <div className="formal-phase-timeline">
      {['A', 'B', 'C'].map((phase, index) => {
        const currentPhase = team.currentPhase || team.phase || 'A';
        const isCompleted = ['A', 'B', 'C'].indexOf(currentPhase) > index;
        const isCurrent = currentPhase === phase;
        const isProjectCompleted = team.projectCompleted || team.status === 'completed';
        
        return (
          <div key={phase} className="formal-phase-step-container">
            <div 
              className={`formal-phase-step ${
                isCompleted ? 'completed' : 
                isCurrent ? 'current' : 'pending'
              } ${isProjectCompleted && phase === 'C' ? 'project-completed' : ''}`}
            >
              <span className="phase-number">{phase}</span>
              {isProjectCompleted && phase === 'C' && (
                <div className="completion-badge">✓</div>
              )}
            </div>
            
            <div className="formal-phase-info">
              <span className="phase-name">
                {phase === 'A' ? 'Research' : phase === 'B' ? 'Development' : 'Testing'}
              </span>
              <span className="phase-description">
                {phase === 'A' ? 'Planning & Research' : 
                 phase === 'B' ? 'Implementation' : 'Final Testing'}
              </span>
            </div>
            
            {index < 2 && (
              <div className={`formal-phase-connector ${
                ['A', 'B', 'C'].indexOf(currentPhase) > index ? 'completed' : ''
              }`} />
            )}
          </div>
        );
      })}
    </div>

    {/* Current Phase Action */}
    <div className="formal-phase-action-section">
      {(() => {
        const currentPhase = team.currentPhase || team.phase || 'A';
        const nextPhase = getNextPhase(currentPhase);
        const isProjectCompleted = team.projectCompleted || team.status === 'completed';
        
        return (
          <div className="current-phase-display">
            <div className="phase-status-card">
              <div className="phase-status-header">
                <div 
                  className={`formal-phase-badge phase-${currentPhase} ${
                    isUpdatingPhase && updatingTeamId === team._id 
                      ? 'updating' 
                      : nextPhase && !isProjectCompleted
                      ? 'actionable' 
                      : 'final'
                  }`}
                  onClick={() => nextPhase && !isProjectCompleted && handlePhaseClick(team)}
                  style={{ 
                    cursor: isUpdatingPhase && updatingTeamId === team._id 
                      ? 'wait' 
                      : nextPhase && !isProjectCompleted
                      ? 'pointer' 
                      : 'default'
                  }}
                >
                  <div className="badge-content">
                    <span className="badge-label">Current Phase</span>
                    <span className="badge-phase">Phase {currentPhase}</span>
                    <span className="badge-subtitle">
                      {getPhaseDescription(currentPhase)}
                    </span>
                  </div>
                  
                  {isUpdatingPhase && updatingTeamId === team._id ? (
                    <div className="updating-indicator">
                      <FontAwesomeIcon icon={faSpinner} className="spinning" />
                      <span>Advancing...</span>
                    </div>
                  ) : nextPhase && !isProjectCompleted ? (
                    <div className="advancement-indicator">
                      <span className="advance-text">Click to advance to Phase {nextPhase}</span>
                      <div className="advance-arrow">→</div>
                    </div>
                  ) : isProjectCompleted ? (
                    <div className="completion-indicator">
                      <span>✓ Project Completed</span>
                    </div>
                  ) : (
                    <div className="final-phase-indicator">
                      <span>Final Phase Reached</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Phase Actions */}
              <div className="phase-actions">
                {currentPhase === 'C' && !isProjectCompleted && (
                  <button
                    className={`formal-complete-project-btn ${
                      isCompletingProject && completingTeamId === team._id ? 'completing' : ''
                    }`}
                    onClick={() => handleCompleteProject(team)}
                    disabled={isCompletingProject && completingTeamId === team._id}
                  >
                    {isCompletingProject && completingTeamId === team._id ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="spinning" />
                        <span>Finalizing Project...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} />
                        <span>Complete Project</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {/* Phase Timing */}
              <div className="formal-phase-timing">
                <div className="timing-item">
                  <span className="timing-label">Phase Started:</span>
                  <span className="timing-value">
                    {team.currentPhaseStartDate 
                      ? new Date(team.currentPhaseStartDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'Not recorded'
                    }
                  </span>
                </div>
                {team.phaseHistory && team.phaseHistory.length > 0 && (
                  <div className="timing-item">
                    <span className="timing-label">Total Duration:</span>
                    <span className="timing-value">
                      {Math.floor((new Date() - new Date(team.createdDate)) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  </div>
</div>

        </div>
      </div>
    </div>

              <div className="supervised-teams-info-section">
                <div className="supervised-teams-info-row">
                   <span><strong>Phase:</strong> {getPhaseDescription(team.currentPhase || team.phase || 'A')}</span>
                  <span><strong>Major:</strong> {team.major}</span>
                  <span><strong>Members:</strong> {team.members.length}/4</span>
                </div>
{team.phaseHistory && team.phaseHistory.length > 0 && (
  <div className="phase-history-preview">
    <details className="phase-history-details">
      <summary>Phase History ({team.phaseHistory.length} changes)</summary>
      <div className="phase-history-list">
        {team.phaseHistory.slice(-3).reverse().map((phase, index) => {
          // Enhanced logic for determining phase status
          const isProjectCompleted = team.projectCompleted || team.status === 'completed';
          const isCurrentPhase = phase.phase === (team.currentPhase || team.phase) && !phase.endDate;
          
          let phaseStatus;
          if (phase.endDate) {
            // Phase has ended, show duration
            phaseStatus = `${phase.duration || 0} days`;
          } else if (phase.completed || (isProjectCompleted && phase.phase === 'C')) {
            // Phase is marked as completed (especially for Phase C)
            const duration = phase.duration || Math.floor((new Date() - new Date(phase.startDate)) / (1000 * 60 * 60 * 24));
            phaseStatus = `${duration} days (Completed)`;
          } else if (isCurrentPhase) {
            // Phase is currently ongoing
            phaseStatus = 'Ongoing';
          } else {
            // Fallback
            phaseStatus = 'Completed';
          }
          
          return (
            <div key={index} className="phase-history-item">
              <span className="phase-badge-small" style={{backgroundColor: getPhaseColor(phase.phase)}}>
                {phase.phase}
                {(phase.completed || (isProjectCompleted && phase.phase === 'C')) && (
                  <span className="completion-mark">✓</span>
                )}
              </span>
              <span className="phase-dates">
                {new Date(phase.startDate).toLocaleDateString()}
                {phase.endDate && ` - ${new Date(phase.endDate).toLocaleDateString()}`}
              </span>
              <span className={`phase-duration-small ${
                phase.completed || (isProjectCompleted && phase.phase === 'C') ? 'completed' : ''
              }`}>
                ({phaseStatus})
              </span>
            </div>
          );
        })}
      </div>
    </details>
  </div>
)}
                <div className="supervised-teams-info-row">
                  <span><strong>Average CGPA:</strong> {team.averageCGPA}</span>
                </div>
                {team.projectIdea && (
                  <div className="supervised-teams-project-info">
                    <strong>Project:</strong>
                    <p>{team.projectIdea.substring(0, 100)}...</p>
                  </div>
                )}
              </div>

              <div className="supervised-teams-members-preview">
                <h5>Team Members:</h5>
                <div className="supervised-teams-members-list">
                  {team.members.map((member, index) => (
                    <div key={index} className="supervised-teams-member-preview">
                      <div className="supervised-teams-member-avatar">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} />
                        ) : (
                          <div className="supervised-teams-avatar-fallback">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="supervised-teams-member-info">
                        <span className="supervised-teams-member-name">{member.name}</span>
                        <span className={`supervised-teams-member-role supervised-teams-role-${member.role.toLowerCase()}`}>
                          {member.role}
                          {member.role === 'Leader' && <FontAwesomeIcon icon={faCrown} />}
                        </span>
                        <small>{member.completedCredits} credits</small>
                      </div>
                      <button
    className="remove-member-btn-small"
    onClick={() => handleRemoveMember(team._id, member.studentId, member.name)}
    title="Remove member"
  >
    <FontAwesomeIcon icon={faUserMinus} />
  </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="supervised-teams-card-actions">

      

                <button
                  className="supervised-teams-action-btn supervised-teams-view-details"
                  onClick={() => {
                    setSelectedTeam(team);
                    setShowTeamModal(true);
                  }}
                >
                  <FontAwesomeIcon icon={faEye} />
                  View Details
                </button>
                <button
                  className="supervised-teams-action-btn supervised-teams-change-status"
                  onClick={() => {
                    setSelectedTeam(team);
                    setStatusForm({ status: team.status, reason: '' });
                    setShowStatusModal(true);
                  }}
                >
                  <FontAwesomeIcon icon={faEdit} />
                  Update Status
                </button>
              </div>

              <div className="supervised-teams-supervision-info">
                <small>
                  <strong>Supervised since:</strong> {' '}
                  {new Date(team.currentSupervisor?.acceptedDate).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))}

        </div>
      )}


      {/* Team Details Modal */}
      {showTeamModal && selectedTeam && (
        <div className="supervised-teams-modal-overlay" onClick={() => setShowTeamModal(false)}>
          <div className="supervised-teams-modal" onClick={(e) => e.stopPropagation()}>
            <div className="supervised-teams-modal-header">
              <h3>Team Details: {selectedTeam.name}</h3>
              <button 
                className="supervised-teams-modal-close-btn"
                onClick={() => setShowTeamModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="supervised-teams-modal-content">
              <div className="supervised-teams-overview">
                <div className="supervised-teams-overview-stats">
                  <div className="supervised-teams-stat-item">
                    <strong>Status:</strong>
                    <span className={`supervised-teams-status-badge supervised-teams-status-${selectedTeam.status}`}>
                      {selectedTeam.status}
                    </span>
                  </div>
                  <div className="supervised-teams-stat-item">
                    <strong>Members:</strong> {selectedTeam.members.length}/4
                  </div>
                  <div className="supervised-teams-stat-item">
                    <strong>Average CGPA:</strong> {selectedTeam.averageCGPA}
                  </div>
                </div>
              </div>

              <div className="supervised-teams-members-detailed">
                <h4>Team Members</h4>
                {selectedTeam.members.map((member, index) => (
                  <div key={index} className="supervised-teams-member-detailed-card">
                    <div className="supervised-teams-member-header">
                      <div className="supervised-teams-member-avatar">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} />
                        ) : (
                          <div className="supervised-teams-avatar-fallback">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="supervised-teams-member-title">
                        <h5>{member.name}</h5>
                        <span className={`supervised-teams-role-badge supervised-teams-role-${member.role.toLowerCase()}`}>
                          {member.role}
                          {member.role === 'Leader' && <FontAwesomeIcon icon={faCrown} />}
                        </span>
                      </div>
                    </div>
                    <div className="supervised-teams-member-details">
                      <div className="supervised-teams-detail-row">
                        <strong>Student ID:</strong> {member.studentId}
                      </div>
                      <div className="supervised-teams-detail-row">
                        <strong>Email:</strong> {member.email}
                      </div>
                      <div className="supervised-teams-detail-row">
                        <strong>Program:</strong> {member.program}
                      </div>
                      <div className="supervised-teams-detail-row">
                        <strong>Completed Credits:</strong> {member.completedCredits}
                      </div>
                      <div className="supervised-teams-detail-row">
                        <strong>CGPA:</strong> {member.cgpa.toFixed(2)}
                      </div>
                      {member.phone !== 'Not available' && (
                        <div className="supervised-teams-detail-row">
                          <strong>Phone:</strong> {member.phone}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedTeam.projectIdea && (
                <div className="supervised-teams-project-details">
                  <h4>Project Description</h4>
                  <p>{selectedTeam.projectIdea}</p>
                </div>
              )}
            </div>

            <div className="supervised-teams-modal-footer">
              <button 
                className="supervised-teams-close-modal-btn"
                onClick={() => setShowTeamModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedTeam && (
        <div className="supervised-teams-status-modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="supervised-teams-status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="supervised-teams-modal-header">
              <h3>Update Team Status: {selectedTeam.name}</h3>
              <button 
                className="supervised-teams-modal-close-btn"
                onClick={() => setShowStatusModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="supervised-teams-modal-content">
              <div className="supervised-teams-form-group">
                <label>Team Status:</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({...statusForm, status: e.target.value})}
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="recruiting">Recruiting</option>
                  <option value="inactive">Inactive</option>
                  <option value="hidden">Hidden</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="supervised-teams-form-group">
                <label>Reason (Optional):</label>
                <textarea
                  value={statusForm.reason}
                  onChange={(e) => setStatusForm({...statusForm, reason: e.target.value})}
                  placeholder="Provide a reason for the status change..."
                  rows="3"
                />
              </div>

              <div className="supervised-teams-status-descriptions">
                <h5>Status Descriptions:</h5>
                <ul>
                  <li><strong>Active:</strong> Team is working on their project</li>
                  <li><strong>Recruiting:</strong> Team can accept new join requests</li>
                  <li><strong>Inactive:</strong> Team is temporarily paused</li>
                  <li><strong>Hidden:</strong> Team is hidden from join requests</li>
                  <li><strong>Completed:</strong> Team has finished their project</li>
                </ul>
              </div>
            </div>

            <div className="supervised-teams-modal-footer">
              <button 
                className="supervised-teams-cancel-btn"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>
              <button 
                className="supervised-teams-update-btn"
                onClick={updateTeamStatus}
                disabled={!statusForm.status}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
{showRemoveMemberModal && selectedMemberForRemoval && (
  <div className="remove-member-modal-overlay" onClick={cancelRemoveMember}>
    <div className="remove-member-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <div className="warning-icon">
          <FontAwesomeIcon icon={faExclamationTriangle} />
        </div>
        <h3>Remove Team Member</h3>
        <button 
          className="close-button"
          onClick={cancelRemoveMember}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <div className="modal-body">
        <div className="member-info-display">
          <div className="member-details-display">
            <h4>{selectedMemberForRemoval.name}</h4>
            <p>will be removed from the team permanently</p>
          </div>
        </div>

        <div className="warning-message">
          <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
          <div className="message-content-f">
            <p><strong>Are you sure you want to remove {selectedMemberForRemoval.name}?</strong></p>
            <p>This action will:</p>
            <ul>
              <li>Remove them from all team activities</li>
              <li>Remove their access to team resources</li>
              <li>Allow them to join other teams</li>
              <li>Notify them of the removal</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="modal-actions">
        <button
          className="cancel-remove-btn"
          onClick={cancelRemoveMember}
          disabled={isRemovingMember}
        >
          <FontAwesomeIcon icon={faTimes} />
          Cancel
        </button>
        <button
          className="confirm-remove-btn"
          onClick={confirmRemoveMember}
          disabled={isRemovingMember}
        >
          {isRemovingMember ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="spinning-student" />
              Removing...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faUserMinus} />
              Remove Member
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );


}


// Add this component before the FacultyDashboard function in FacultyDashboard.js

function FacultySupport() {
  const [tickets, setTickets] = useState([]);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'Technical',
    priority: 'Medium'
  });
  const [errors, setErrors] = useState({});

  // Fetch faculty's support tickets
  // Enhanced fetchTickets function
const fetchTickets = async () => {
  setIsLoading(true);
  
  try {
    const token = localStorage.getItem('facultyToken');
    
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    // ADD: Debug token payload
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', tokenPayload);
      console.log('User ID from token:', tokenPayload.id);
      console.log('User role from token:', tokenPayload.role);
    } catch (e) {
      console.error('Invalid token format:', e);
    }

    console.log('Fetching faculty support tickets...');
    
    const response = await fetch(`${API_BASE}/api/faculty/support/my-tickets`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (response.ok) {
      const data = await response.json();
      console.log('Tickets data:', data);
      
      if (data.success) {
        setTickets(data.tickets || []);
      } else {
        throw new Error(data.message || 'Failed to load tickets');
      }
    } else {
      // Get response text for better debugging
      const responseText = await response.text();
      console.log('Error response:', responseText);
      
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (response.status === 403) {
        throw new Error('Access denied. Faculty access required.');
      } else if (response.status === 404) {
        throw new Error('Faculty profile not found.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('Error fetching tickets:', error);
    showMessage(error.message, 'error');
    setTickets([]);
  } finally {
    setIsLoading(false);
  }
};


  // Submit new support ticket
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/support/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: formData.subject.trim(),
          description: formData.description.trim(),
          category: formData.category,
          priority: formData.priority
        })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Support ticket submitted successfully!', 'success');
        setFormData({
          subject: '',
          description: '',
          category: 'Technical',
          priority: 'Medium'
        });
        setErrors({});
        setShowSubmitForm(false);
        fetchTickets(); // Refresh tickets list
      } else {
        showMessage(data.message || 'Failed to submit ticket', 'error');
      }
    } catch (error) {
      console.error('Submit ticket error:', error);
      showMessage('Network error while submitting ticket', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Get status color class
  const getStatusColor = (status) => {
    const colors = {
      'Open': 'status-open',
      'In Progress': 'status-in-progress', 
      'Resolved': 'status-resolved',
      'Closed': 'status-closed'
    };
    return colors[status] || 'status-default';
  };

  // Get priority color class
  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'priority-low',
      'Medium': 'priority-medium',
      'High': 'priority-high', 
      'Critical': 'priority-critical'
    };
    return colors[priority] || 'priority-default';
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="faculty-support-container">
      <div className="faculty-support-header">
        <h2>Faculty Support Center</h2>
        <p>Submit tickets for technical issues, account problems, or other concerns</p>
        <button
          className="submit-ticket-btn"
          onClick={() => setShowSubmitForm(true)}
        >
          <FaInfoCircle />
          Submit New Ticket
        </button>
      </div>

      {/* Submit Ticket Modal */}
      {showSubmitForm && (
        <div className="support-modal-overlay" onClick={() => setShowSubmitForm(false)}>
          <div className="support-modal" onClick={(e) => e.stopPropagation()}>
            <div className="support-modal-header">
              <h3>Submit Support Ticket</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowSubmitForm(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="support-form">
              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={errors.subject ? 'error' : ''}
                  placeholder="Brief description of the issue"
                  maxLength="100"
                />
                {errors.subject && <span className="error-message">{errors.subject}</span>}
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="Technical">Technical Issue</option>
                  <option value="Account">Account Problem</option>
                  <option value="Student">Student Related</option>
                  <option value="System">System Access</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={errors.description ? 'error' : ''}
                  placeholder="Detailed description of the problem..."
                  rows="6"
                  maxLength="1000"
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
                <small>{formData.description.length}/1000 characters</small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowSubmitForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="spinning" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Ticket'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tickets List */}
      <div className="tickets-section">
        <div className="tickets-header">
          <h3>Your Support Tickets ({tickets.length})</h3>
          <button 
            className="refresh-btn"
            onClick={fetchTickets}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faSync} className={isLoading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <FaSpinner className="spinning" />
            <span>Loading tickets...</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="no-tickets">
            <FaInfoCircle className="empty-icon" />
            <h4>No Support Tickets</h4>
            <p>You haven't submitted any support tickets yet.</p>
            <button
              className="submit-first-ticket-btn"
              onClick={() => setShowSubmitForm(true)}
            >
              Submit Your First Ticket
            </button>
          </div>
        ) : (
          <div className="tickets-list">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="ticket-card">
                <div className="ticket-header">
                  <div className="ticket-title">
                    <h4>{ticket.subject}</h4>
                    <small>#{ticket._id.slice(-8)}</small>
                  </div>
                  <div className="ticket-badges">
                    <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className={`priority-badge ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>

                <div className="ticket-content">
                  <div className="ticket-description">
                    {ticket.description.length > 150 
                      ? `${ticket.description.substring(0, 150)}...`
                      : ticket.description
                    }
                  </div>

                  {ticket.adminResponse && (
                    <div className="admin-response">
                      <h5>Admin Response:</h5>
                      <p>{ticket.adminResponse}</p>
                      {ticket.respondedAt && (
                        <small>Responded: {new Date(ticket.respondedAt).toLocaleString()}</small>
                      )}
                    </div>
                  )}
                </div>

                <div className="ticket-footer">
                  <div className="ticket-meta">
                    <span>Category: {ticket.category}</span>
                    <span>Submitted: {new Date(ticket.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


  /*-------------------------Tasnuva------------------------*/

  const renderContent = () => {
    if (!activeTab) {
      return (
        <div className="content-box welcome-message">
          <h2>Welcome to Faculty Dashboard!</h2>
          <p>Please select an option from the menu to get started.</p>
        </div>
      );
    }

    switch (activeTab) {
      case "group":
      return (
        <div className="content-box">
          <h2>Group Management</h2>
          <div className="group-management-options">
            <button
              className={`action-button ${subView === "progress" ? "active" : ""}`}
              onClick={() => setSubView("progress")}
            >
              View Group Progress
            </button>
            <button
              className={`action-button ${subView === "invitations" ? "active" : ""}`}
              onClick={() => setSubView("invitations")}
            >
              View Invitations
            </button>
            <button
              className={`action-button ${subView === "supervised" ? "active" : ""}`}
              onClick={() => setSubView("supervised")}
            >
              My Supervised Teams
            </button>
          </div>

          {subView === "progress" && <GroupProgress />}
          {subView === "invitations" && <ViewGroupInvitations />}
          {subView === "supervised" && <SupervisedTeams />}
        </div>
      );
      

      case "profile":
        return <ProfileSetting setActiveTab={setActiveTab} />;

      /*---------------------------Tasnuva ------------------------*/
      // case "profileShow":
      //   return <Profile setActiveTab={setActiveTab} />;

      //shakib
      case "profileShow":
        return <Profile setActiveTab={setActiveTab} />;
        //shakib


        case "support":
  return (
    <div className="content-box">
      <FacultySupport />
    </div>
  );
      /*--------------------------- Tasnuva-------------------------------------- */
      case "materials":
        return (
          <div className="content-box">
            <MaterialsUpload />
          </div>
        );

        case "deliverables":
  return (
    <div className="content-box">
      <FacultyDeliverables />
    </div>
  );

        case "messages":
  return (
    <div className="content-box">
      <FacultyChatInterface />
    </div>
  );
  
      case "messages":
        return (
          <div className="content-box">
            <MessagesPage />
          </div>
        );
      case "meeting":
        return (
          <div className="content-box">
            <MeetingsPage />
          </div>
        );

        case "boardMeetings":
  return (
    <div className="content-box">
      <BoardMeetings />
    </div>
  );

      case "annoucements":
        return (
          <div className="content-box">
            <Announcements />
          </div>
        );
      case "annoucementsHistory":
        return (
          <div className="content-box">
            <AnnouncementHistory />
          </div>
        );
      default:
        return null;
    }
  };

  return (
   <div className="faculty-dashboard">


    {isMobile && (
      <button
        className="mobile-menu-toggle"
        onClick={handleMobileMenuToggle}
        aria-label="Toggle menu"
      >
        <FaBars />
      </button>
    )}

    <aside
      className={`faculty-sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${
        showMobileMenu ? "mobile-visible" : ""
      }`}
    >
      <div className="sidebar-header-faculty">
        {/* Logo - show when collapsed on both desktop and mobile */}
        {isSidebarCollapsed && (
          <div className="sidebar-logo">FP</div>
        )}
        
        {/* Title - show when not collapsed */}
        {!isSidebarCollapsed && (
          <div className="faculty-title">Faculty Panel</div>
        )}
        
        {/* Collapse button - show on both desktop and mobile when menu is visible */}
        {(!isMobile || showMobileMenu) && (
          <button
            className="collapse-btn-faculty"
            onClick={handleCollapseToggle}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? "»" : "«"}
          </button>
        )}
      </div>

      <div className="faculty-menu">
  {[
    { key: "group", text: "Group Management", class: "group-management" },
    { key: "profileShow", text: "Profile", class: "profile" },
    { key: "materials", text: "Materials Upload", class: "materials" },
    { key: "deliverables", text: "Deliverables", class: "deliverables", icon: FaClipboardList }, 
   { key: "messages", text: "Messages", class: "messages" },    { key: "meeting", text: "Meetings", class: "meetings" },
    { key: "boardMeetings", text: "Board Meetings", class: "board-meetings" },
    { key: "support", text: "Support", class: "support", icon: FaInfoCircle }, 
    { key: "annoucements", text: "Announcements", class: "announcements" },
    { key: "annoucementsHistory", text: "History", class: "history" }
  ].map(item => (
    <button 
      key={item.key}
      onClick={() => {
        setActiveTab(item.key);
        if (isMobile && !isSidebarCollapsed) setShowMobileMenu(false);
      }}
      data-tooltip={item.text}
      className={`menu-item ${item.class} ${activeTab === item.key ? 'active' : ''}`}
    >
      {/* Add icon rendering */}
      {item.icon && (
        <item.icon 
          className={`menu-icon ${item.key === 'chat' ? 'message-icon' : ''}`} 
        />
      )}
      <span className="menu-text">{item.text}</span>
    </button>
  ))}
</div>

<button
    className={`logout-btn ${isSidebarCollapsed ? 'collapsed-logout' : 'expanded-logout'}`}
    onClick={handleLogout}
    title="Logout"
    aria-label="Logout"
  >
    <FaSignOutAlt />
    {!isSidebarCollapsed && <span className="logout-text">Logout</span>}
  </button>
    </aside>

<div className="top-bar">
  <div className="notification-container">
    <button 
      className={`notification-icon ${showNotifications ? 'active' : ''} ${unreadCount > 0 ? 'has-notifications' : ''}`}
      onClick={(e) => toggleNotificationPanel(e)}
      aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      title={`${unreadCount > 0 ? `${unreadCount} new notifications` : 'No new notifications'}`}
    >
      <div className="notification-icon-wrapper">
        <FaBell className="notification-bell" />
        {unreadCount > 0 && (
          <div className="notification-badge" aria-live="polite">
            <span className="badge-count">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
            <div className="badge-pulse"></div>
          </div>
        )}
      </div>
      <div className="ripple-effect"></div>
    </button>
  </div>
</div>



  {showNotifications && (
  <div 
    className="notification-panel-overlay"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      setShowNotifications(false);
    }}
  >
    <div 
      className="notification-panel faculty-notification-panel" 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="notification-header">
        <h3>Notifications</h3>
        <div className="notification-header-actions">
          {unreadCount > 0 && (
            <button 
              className="mark-all-read-btn"
              onClick={markAllAsRead}
              title="Mark all as read"
            >
              <FaCheck /> Mark all read
            </button>
          )}
          <button 
            className="close-notifications-btn"
            onClick={() => setShowNotifications(false)}
            title="Close"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      <div className="notification-content">
        {isLoadingNotifications ? (
          <div className="notification-loading">
            <FaSpinner className="spinning" />
            <span>Loading notifications...</span>
          </div>
        ) : notifications.length > 0 ? (
          <div className="notification-list">
            {notifications.map(notification => (
              <div 
                key={notification._id} 
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification._id);
                  }
                }}
              >
                <div className="notification-icon-wrapper">
                  {notification.type === 'supervision_request' && <FaUserGraduate />}
                  {notification.type === 'deliverable_submitted' && <FaClipboardList />}
                  {notification.type === 'team_message' && <FaComments />}
                  {notification.type === 'member_joined' && <FaUserPlus />}
                  {!['supervision_request', 'deliverable_submitted', 'team_message', 'member_joined'].includes(notification.type) && <FaBell />}
                </div>
                
                <div className="notification-content-wrapper">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  
                  {notification.data && (
                    <div className="notification-meta">
                      {notification.data.teamName && (
                        <span className="notification-team">Team: {notification.data.teamName}</span>
                      )}
                      {notification.data.senderName && (
                        <span className="notification-sender">From: {notification.data.senderName}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="notification-time">
                    {formatNotificationTime(notification.createdAt)}
                  </div>
                </div>

                {!notification.read && (
                  <div className="notification-unread-indicator"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-notifications">
            <FaBell className="no-notifications-icon" />
            <p>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  </div>
)}

      <main className="faculty-content">
        {/* <div className="notification-icon" onClick={toggleNotificationPanel}>
          <FaBell className="notification-bell" />
          {notifications.filter((notification) => !notification.read).length >
            0 && (
            <div className="notification-badge">
              {
                notifications.filter((notification) => !notification.read)
                  .length
              }
            </div>
          )}
        </div> */}

        {/* {showNotifications && (
          <div className="notification-panel">
            <h3>Notifications</h3>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification ${
                    notification.read ? "read" : "unread"
                  }`}
                >
                  <span>{notification.message}</span>
                  {!notification.read && (
                    <button onClick={() => markAsRead(notification.id)}>
                      Mark as Read
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>No new notifications</p>
            )}
          </div>
        )} */}

        {renderContent()}
      </main>
    </div>
  );
{showTeamDetailsModal && <TeamDetailsModal />}
}

function Announcements() {
  const [facultyAnnouncements, setFacultyAnnouncements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] =
    useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [showEditAnnouncementModal, setShowEditAnnouncementModal] =
    useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    date: "",
    audience: "All Concerned",
    status: "Draft",
  });

  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/announcements/author/Faculty`
      );
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredAnnouncements = announcements.filter(
    (ann) =>
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddAnnouncement = async () => {
    if (newAnnouncement.title && newAnnouncement.content) {
      try {
        const response = await fetch(
          `${API_BASE}/api/announcements`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: newAnnouncement.title,
              content: newAnnouncement.content,
              audience: newAnnouncement.audience,
              status: newAnnouncement.status,
              author: "Faculty",
              date: new Date().toLocaleString(),
            }),
          }
        );

        if (response.ok) {
          setShowAddAnnouncementModal(false);
          setNewAnnouncement({
            title: "",
            content: "",
            audience: "All Concerned",
            status: "Draft",
          });
          fetchAnnouncements();
        } else {
          console.error("Failed to add announcement");
        }
      } catch (error) {
        console.error("Error adding announcement:", error);
      }
    }
  };

  const handleUpdateAnnouncement = async () => {
    try {
      const updatedAnnouncement = {
        ...newAnnouncement,
        date: new Date().toLocaleString(),
      };

      const response = await fetch(
        `${API_BASE}/api/announcements/${updatedAnnouncement._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedAnnouncement),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Announcement updated:", data.announcement);

        setAnnouncements((prev) =>
          prev.map((item) =>
            item._id === data.announcement._id ? data.announcement : item
          )
        );

        setShowEditAnnouncementModal(false);
        setEditMode(false);
        setNewAnnouncement({
          title: "",
          content: "",
          audience: "",
          status: "",
          author: "",
          date: "",
        });

        fetchAnnouncements();
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error updating announcement:", error);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/announcements/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log(data.message);

        setAnnouncements((prev) =>
          prev.filter(
            (announcement) => announcement._id !== id && announcement.id !== id
          )
        );
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  return (
    <div className="faculty-announcements-main-container">
      <div className="faculty-announcements-header-section">
        <h2 className="faculty-announcements-page-title">Faculty Announcements Management</h2>
        <div className="faculty-announcements-controls-wrapper">
          <input
            type="text"
            placeholder="Search announcements by title, content or author..."
            className="faculty-announcements-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="faculty-announcements-create-button"
            onClick={() => setShowAddAnnouncementModal(true)}
          >
            <span className="faculty-announcements-button-icon">+</span>
            Create New Announcement
          </button>
        </div>
      </div>

      <div className="faculty-announcements-table-wrapper">
        <div className="faculty-announcements-table-container">
          <table className="faculty-announcements-data-table">
            <thead className="faculty-announcements-table-head">
              <tr className="faculty-announcements-header-row">
                <th className="faculty-announcements-header-cell title-column">Title</th>
                <th className="faculty-announcements-header-cell content-column">Content Preview</th>
                <th className="faculty-announcements-header-cell author-column">Author</th>
                <th className="faculty-announcements-header-cell date-column">Date</th>
                <th className="faculty-announcements-header-cell audience-column">Audience</th>
                <th className="faculty-announcements-header-cell status-column">Status</th>
                <th className="faculty-announcements-header-cell actions-column">Actions</th>
              </tr>
            </thead>
            <tbody className="faculty-announcements-table-body">
              {filteredAnnouncements.map((announcement) => (
                <tr
                  key={announcement.id}
                  onClick={() => setSelectedAnnouncement(announcement)}
                  className="faculty-announcements-data-row"
                >
                  <td className="faculty-announcements-data-cell title-cell">
                    <div className="faculty-announcements-title-wrapper">
                      {announcement.title}
                    </div>
                  </td>
                  <td className="faculty-announcements-data-cell content-cell">
                    <div className="faculty-announcements-content-preview">
                      {announcement.content.substring(0, 50)}...
                    </div>
                  </td>
                  <td className="faculty-announcements-data-cell author-cell">
                    <div className="faculty-announcements-author-info">
                      {announcement.author}
                    </div>
                  </td>
                  <td className="faculty-announcements-data-cell date-cell">
                    <div className="faculty-announcements-date-display">
                      {announcement.date}
                    </div>
                  </td>
                  <td className="faculty-announcements-data-cell audience-cell">
                    <span className="faculty-announcements-audience-tag">
                      {announcement.audience}
                    </span>
                  </td>
                  <td className="faculty-announcements-data-cell status-cell">
                    <span
                      className={`faculty-announcements-status-badge status-${announcement.status.toLowerCase()}`}
                    >
                      {announcement.status}
                    </span>
                  </td>
                  <td className="faculty-announcements-data-cell actions-cell">
                    <div className="faculty-announcements-action-buttons">
                      <button
                        className="faculty-announcements-edit-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAnnouncement(announcement);
                          setNewAnnouncement({
                            ...announcement,
                            _id: announcement._id || announcement.id,
                          });
                          setEditMode(true);
                          setShowEditAnnouncementModal(true);
                        }}
                        title="Edit Announcement"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="faculty-announcements-delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if(window.confirm('Are you sure you want to delete this announcement?')) {
                            handleDeleteAnnouncement(announcement._id);
                          }
                        }}
                        title="Delete Announcement"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAnnouncements.length === 0 && (
          <div className="faculty-announcements-empty-state">
            <div className="faculty-announcements-empty-icon">📢</div>
            <h3 className="faculty-announcements-empty-title">No Announcements Found</h3>
            <p className="faculty-announcements-empty-text">
              {searchQuery ? 'No announcements match your search criteria.' : 'You haven\'t created any announcements yet.'}
            </p>
            {!searchQuery && (
              <button
                className="faculty-announcements-empty-action-button"
                onClick={() => setShowAddAnnouncementModal(true)}
              >
                Create Your First Announcement
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit/Update Announcement Modal */}
      {showEditAnnouncementModal && (
        <div className="faculty-announcements-modal-overlay">
          <div className="faculty-announcements-modal-container">
            <div className="faculty-announcements-modal-header">
              <h3 className="faculty-announcements-modal-title">
                {editMode ? "Update Announcement" : "Create New Announcement"}
              </h3>
              <button
                className="faculty-announcements-modal-close-button"
                onClick={() => setShowEditAnnouncementModal(false)}
              >
                ×
              </button>
            </div>

            <div className="faculty-announcements-modal-content">
              <div className="faculty-announcements-form-group">
                <label className="faculty-announcements-form-label">
                  Announcement Title <span className="faculty-announcements-required">*</span>
                </label>
                <input
                  type="text"
                  className="faculty-announcements-form-input"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter announcement title..."
                  required
                />
              </div>

              <div className="faculty-announcements-form-group">
                <label className="faculty-announcements-form-label">
                  Content <span className="faculty-announcements-required">*</span>
                </label>
                <textarea
                  className="faculty-announcements-form-textarea"
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      content: e.target.value,
                    })
                  }
                  rows="5"
                  placeholder="Write your announcement content..."
                  required
                />
              </div>

              <div className="faculty-announcements-form-row">
                <div className="faculty-announcements-form-group half-width">
                  <label className="faculty-announcements-form-label">Target Audience</label>
                  <select
                    className="faculty-announcements-form-select"
                    value={newAnnouncement.audience}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        audience: e.target.value,
                      })
                    }
                  >
                    <option value="Computer Science">Computer Science Department</option>
                    <option value="EEE">Electrical & Electronic Engineering</option>
                    <option value="All Concerned">All Concerned</option>
                  </select>
                </div>

                <div className="faculty-announcements-form-group half-width">
                  <label className="faculty-announcements-form-label">Publication Status</label>
                  <select
                    className="faculty-announcements-form-select"
                    value={newAnnouncement.status}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="faculty-announcements-modal-footer">
              <button
                className="faculty-announcements-modal-cancel-button"
                onClick={() => setShowEditAnnouncementModal(false)}
              >
                Cancel
              </button>
              <button
                className="faculty-announcements-modal-submit-button"
                onClick={
                  editMode ? handleUpdateAnnouncement : handleAddAnnouncement
                }
              >
                {editMode ? "Update Announcement" : "Publish Announcement"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Announcement Modal */}
      {showAddAnnouncementModal && (
        <div className="faculty-announcements-modal-overlay">
          <div className="faculty-announcements-modal-container">
            <div className="faculty-announcements-modal-header">
              <h3 className="faculty-announcements-modal-title">Create New Announcement</h3>
              <button
                className="faculty-announcements-modal-close-button"
                onClick={() => setShowAddAnnouncementModal(false)}
              >
                ×
              </button>
            </div>

            <div className="faculty-announcements-modal-content">
              <div className="faculty-announcements-form-group">
                <label className="faculty-announcements-form-label">
                  Announcement Title <span className="faculty-announcements-required">*</span>
                </label>
                <input
                  type="text"
                  className="faculty-announcements-form-input"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter announcement title..."
                  required
                />
              </div>

              <div className="faculty-announcements-form-group">
                <label className="faculty-announcements-form-label">
                  Content <span className="faculty-announcements-required">*</span>
                </label>
                <textarea
                  className="faculty-announcements-form-textarea"
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      content: e.target.value,
                    })
                  }
                  rows="5"
                  placeholder="Write your announcement content..."
                  required
                />
              </div>

              <div className="faculty-announcements-form-row">
                <div className="faculty-announcements-form-group half-width">
                  <label className="faculty-announcements-form-label">Target Audience</label>
                  <select
                    className="faculty-announcements-form-select"
                    value={newAnnouncement.audience}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        audience: e.target.value,
                      })
                    }
                  >
                    <option value="Computer Science">Computer Science Department</option>
                    <option value="EEE">Electrical & Electronic Engineering</option>
                    <option value="All Concerned">All Concerned</option>
                  </select>
                </div>

                <div className="faculty-announcements-form-group half-width">
                  <label className="faculty-announcements-form-label">Publication Status</label>
                  <select
                    className="faculty-announcements-form-select"
                    value={newAnnouncement.status}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="faculty-announcements-modal-footer">
              <button
                className="faculty-announcements-modal-cancel-button"
                onClick={() => setShowAddAnnouncementModal(false)}
              >
                Cancel
              </button>
              <button
                className="faculty-announcements-modal-submit-button"
                onClick={handleAddAnnouncement}
              >
                Publish Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnnouncementHistory() {
  const [facultyAnnouncements, setFacultyAnnouncements] = useState([]);

  const fetchFacultyAnnouncements = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/announcements/audience/Faculty%20Only`
      );
      const data = await res.json();
      setFacultyAnnouncements(data);
    } catch (error) {
      console.error("Failed to fetch faculty announcements:", error);
    }
  };

  const handleDismiss = async (id) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/announcements/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "Dismissed" }),
        }
      );

      if (response.ok) {
        // Remove from UI
        setFacultyAnnouncements((prev) =>
          prev.filter((item) => item._id !== id)
        );
      } else {
        console.error("Failed to dismiss announcement");
      }
    } catch (error) {
      console.error("Error dismissing announcement:", error);
    }
  };

  useEffect(() => {
    fetchFacultyAnnouncements();

    const interval = setInterval(fetchFacultyAnnouncements, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="meetings-container">
      <div className="meetings-header">
        <h2>Announcements History</h2>
      </div>

      <div className=" annoucements">
        {facultyAnnouncements.map((announcement) => {
          const [datePart, timePart] = announcement.date
            ? announcement.date.split(",")
            : ["", ""];

          return (
            <div className=" card" key={announcement._id}>
              <div className="meeting-info card-details">
                <h3>{announcement.title}</h3>
                <p className="announement-content">{announcement.content}</p>
                <div className="meeting-meta">
                  <span>📅 {datePart.trim()}</span>
                  <span>🕒 {timePart?.trim()}</span>
                  <span>👥 {announcement.audience}</span>
                </div>
              </div>
              <div className="meeting-actions">
                <button
                  className="delBtn"
                  onClick={() => handleDismiss(announcement._id)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FacultyDashboard;
