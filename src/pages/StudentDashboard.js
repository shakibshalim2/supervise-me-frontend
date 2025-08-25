import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaFilePdf, FaFileWord, FaFileAlt, FaDownload, FaEye, FaArrowRight,
  FaClipboardList, FaCogs, FaCode, FaPlay, FaRocket, FaCheck, FaUpload,
  FaMap, FaBoxOpen, FaLightbulb, FaFlag, FaArrowLeft, FaUser, FaCalendar,
  FaGraduationCap, FaFile, FaHome, FaUsersCog, FaUserPlus, FaChalkboardTeacher,
  FaBookOpen, FaComments, FaBell, FaTimes, FaChevronLeft, FaChevronRight,
  FaPaperclip, FaPaperPlane, FaExclamationTriangle, FaCheckCircle, FaInfoCircle,
  FaUsers, FaHandshake, FaBuilding, FaEnvelope, FaUserTie, FaComment, FaLinkedin,
  FaSearch, FaFilter, FaPlus, FaTrash, FaEdit, FaClock, FaChartLine, FaTasks,
  FaCalendarAlt, FaCog, FaSignOutAlt, FaRegFrown, FaBook, FaArchive,
  FaFilePowerpoint, FaSpinner, FaTimesCircle, FaBullhorn, FaBellSlash, FaSync,
  FaBars, // Added for mobile menu
  FaLock,
  FaUserMinus,
  FaCrown,
  FaVideo,
  FaPhoneSlash,
  FaPhone,
  FaSave,
  FaMapMarkerAlt,
  FaHistory,
  FaTrophy,
  FaDesktop,
  FaMicrophoneSlash,
  FaMicrophone,
  FaVideoSlash
} from "react-icons/fa";

import "./StudentDashboard.css";
import StudentDeliverables from './StudentDeliverables';
import { useNavigate } from "react-router-dom";
import FileUpload from './FileUpload';
import useFileUpload from '../hooks/useFileUpload';
import StudentProgress from "./StudentProgress";
import { v4 as uuidv4 } from 'uuid'; // You'll need to install: npm install uuid

import io from 'socket.io-client';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const SpecialAccessBanner = ({ student }) => {
  if (!student.hasSpecialAccess) return null;

  return (
    <div className="special-access-banner" style={{
      backgroundColor: '#fff3cd',
      border: '1px solid #ffc107',
      borderRadius: '4px',
      padding: '12px',
      margin: '16px 0',
      color: '#856404'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>⚠️</span>
        <div>
          <strong>Special Access Granted</strong>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
            You have been granted access to the Capstone project by an administrator,
            even though you haven't met the credit requirement. You're currently in team:
            <strong> {student.teamName}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};


const StudentProfile = ({ student }) => {
  // ✅ ADD NULL CHECK
  if (!student) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="student-profile">
      <div className="profile-section">
        <div className="profile-item">
          <span>
            {!student.isEligible && student.isInTeam && (
              <span className="special-access-note" style={{
                marginLeft: '8px',
                fontSize: '12px',
                color: '#856404',
                backgroundColor: '#fff3cd',
                padding: '2px 6px',
                borderRadius: '3px'
              }}>
                Special Access
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

// ✅ ADD: After the StudentProfile component
const TeamInfo = () => {
  const [teamData, setTeamData] = useState(null);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const currentStudent = JSON.parse(localStorage.getItem('currentStudent'));
    setStudent(currentStudent);

    // Load team data regardless of eligibility status
    if (currentStudent && currentStudent.isInTeam) {
      fetchTeamData();
    }
  }, []);

  const fetchTeamData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/teams/my-team`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('studentToken')}`
        }
      });

      if (response.ok) {
        const team = await response.json();
        setTeamData(team);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    }
  };

  // ✅ ADD NULL CHECK HERE
  if (!student) {
    return <div>Loading...</div>;
  }

  if (!student.isInTeam) {
    return <div>You are not currently in a team.</div>;
  }
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const avatarInputRef = useRef(null);
  const [pendingJoinRequests, setPendingJoinRequests] = useState({});

  // ===== CORE STATES =====
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [incomingJoinRequests, setIncomingJoinRequests] = useState([]);
  // Add this with your other state declarations
  const [sentSupervisionRequests, setSentSupervisionRequests] = useState(new Set());
  // Track which student's invitation is being sent
  const [sendingInvitationId, setSendingInvitationId] = useState(null);

  const [acceptingRequestId, setAcceptingRequestId] = useState(null);
  const [decliningRequestId, setDecliningRequestId] = useState(null);

  // Add these with your other state declarations
const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);
const [celebrationShown, setCelebrationShown] = useState(false);


// Add these states with your other state declarations
const [isInTeamMeeting, setIsInTeamMeeting] = useState(false);
const [currentMeetingId, setCurrentMeetingId] = useState(null);
const [meetingParticipants, setMeetingParticipants] = useState([]);
const [localStream, setLocalStream] = useState(null);
const [remoteStreams, setRemoteStreams] = useState(new Map());
const [isScreenSharing, setIsScreenSharing] = useState(false);
const [isMicMuted, setIsMicMuted] = useState(false);
const [isCameraOff, setIsCameraOff] = useState(false);
const [peerConnections, setPeerConnections] = useState(new Map());
const [meetingStartTime, setMeetingStartTime] = useState(null);
const [showMeetingInterface, setShowMeetingInterface] = useState(false);

// WebRTC configuration
const rtcConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

  // For invitation accept/decline loading
  const [acceptingInvitationId, setAcceptingInvitationId] = useState(null);
  const [decliningInvitationId, setDecliningInvitationId] = useState(null);

  // Below selectedMemberForLeader state
  const [isMakingLeader, setIsMakingLeader] = useState(false);

  // Add these with your other state declarations
  const [teamRejectionStatus, setTeamRejectionStatus] = useState({});
  const [joinRequestStatus, setJoinRequestStatus] = useState({});

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  // Add this with your other state declarations
  const [showDismissTeamModal, setShowDismissTeamModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    teamName: '',
    major: '',
    capstone: '',
    projectDescription: ''
  });
  const [editErrors, setEditErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  // ✅ SIMPLE: Track notification keys to prevent duplicates
  const [usedNotificationKeys, setUsedNotificationKeys] = useState(new Set());
  const [isExtendingSession, setIsExtendingSession] = useState(false);
  // Replace modal states with inline edit states
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  // Add this with your other state declarations
  const [isDismissingTeam, setIsDismissingTeam] = useState(false);

  // Add this with your other state declarations
  const [deletedNotificationIds, setDeletedNotificationIds] = useState(new Set());
  // Add this with your other state declarations in StudentDashboard.js
  const [currentRequirement, setCurrentRequirement] = useState(95); // Default fallback

  // Add this with your other state variables
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');


  // ✅ NEW: Add notification deduplication tracking
  const [shownNotifications, setShownNotifications] = useState(new Set());
  const [notificationCache, setNotificationCache] = useState(new Map());
  const [processedRequestIds, setProcessedRequestIds] = useState(new Set());

  // Add this with your other state declarations
  const [joiningTeamId, setJoiningTeamId] = useState(null);
// Add these with your other state declarations around line 100-200
const [approvingRequestId, setApprovingRequestId] = useState(null);
const [rejectingRequestId, setRejectingRequestId] = useState(null);


  const [supportTickets, setSupportTickets] = useState([]);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    description: '',
    category: 'Other',
    priority: 'Medium'
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  const [facultyData, setFacultyData] = useState([]);
  const [isLoadingFaculty, setIsLoadingFaculty] = useState(false);
  const [facultyError, setFacultyError] = useState(null);
  // Add this with your other state declarations
  const [showMemberDetailsModal, setShowMemberDetailsModal] = useState(false);

  // ===== ADD THESE STATES FOR JITSI MEET =====
  const [isInCall, setIsInCall] = useState(false);
  const [callParticipants, setCallParticipants] = useState([]);

  // ✅ FIXED: Replace state-based tracking with ref-based tracking
  const processedRequestIdsRef = useRef(new Set());
  const notificationCacheRef = useRef(new Map());
  const lastNotificationTimeRef = useRef(new Map());

  const [localNotifications, setLocalNotifications] = useState([]);
  const [serverNotifications, setServerNotifications] = useState([]);
  // Add these with your other state declarations
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [selectedMemberForRemoval, setSelectedMemberForRemoval] = useState(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  // Add these with your other state declarations
const [showSupervisionModal, setShowSupervisionModal] = useState(false);
const [selectedFacultyForSupervision, setSelectedFacultyForSupervision] = useState(null);
const [supervisionMessage, setSupervisionMessage] = useState('');
const [isSendingSupervisionRequest, setIsSendingSupervisionRequest] = useState(false);


// Add these with your other state declarations
const [showParticipants, setShowParticipants] = useState(false);
const [connectionQuality, setConnectionQuality] = useState('good');
const [isRecording, setIsRecording] = useState(false);

// Refs for video elements
const localVideoRef = useRef(null);
const localStreamRef = useRef(null);
const peerConnectionsRef = useRef(new Map());

  // Add this with your other state declarations
  const [showSessionTimeoutModal, setShowSessionTimeoutModal] = useState(false);
  // Computed property for all notifications
  // ✅ Filter out deleted notifications
  const notifications = [
    ...localNotifications.filter(n => !deletedNotificationIds.has(n.id || n._id)),
    ...serverNotifications.filter(n => !deletedNotificationIds.has(n._id))
  ].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date || a.timestamp || 0);
    const dateB = new Date(b.createdAt || b.date || b.timestamp || 0);
    return dateB - dateA; // Newest first
  });

  // Add these state variables with your other useState declarations
  const [selectedFile, setSelectedFile] = useState(null);
  const { uploadFile, uploading, uploadProgress } = useFileUpload();
  // Add this with your other state declarations
  // Add this debounce function at the top of your file
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  // ===== PROFILE STATE =====
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    name: "",
    cgpa: 0,
    major: "",
    gender: "",
    capstone: "CSE 400",
    avatar: "",
    email: "",
    phone: "",
    supervisorInterest: "",
    skills: [],
    bio: "",
    completed: false,
    studentId: "",
    program: "",
    completedCredits: 0,
    enrolled: "",
    address: "",
    avatarId: "",
    avatarUrl: ""
  });

  // Add this to your state declarations in StudentDashboard
  const [inlineNotification, setInlineNotification] = useState(null);

  // Replace your existing addNotification function with this one
  const showInlineNotification = (message, type = 'info') => {
    setInlineNotification({ message, type, id: Date.now() });

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setInlineNotification(null);
    }, 3000);
  };


  // Add session timeout management
  const [lastActivity, setLastActivity] = useState(Date.now());
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  useEffect(() => {
    const checkSession = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        // ✅ Show popup instead of direct logout
        setShowSessionTimeoutModal(true);
      }
    };

    // Track user activity
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity);
    });

    // Check session every minute
    const sessionInterval = setInterval(checkSession, 60000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(sessionInterval);
    };
  }, [lastActivity]);


  // Add this useEffect in StudentDashboard.js
  // ✅ FIXED: Fetch config periodically and when tab changes
// ✅ FIXED: Fetch config periodically and when tab changes
useEffect(() => {
  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      // ❗ FIX: Add the Authorization header to the fetch request
      const response = await fetch(`${API_BASE}/api/config`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const config = await response.json();
        setCurrentRequirement(config.requiredCredits || 95);
        console.log('Current credit requirement:', config.requiredCredits);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      setCurrentRequirement(95); // Fallback
    }
  };

  // Fetch immediately
  fetchConfig();

  // Fetch config every 30 seconds to catch admin updates
  const configInterval = setInterval(fetchConfig, 30000);

  return () => clearInterval(configInterval);
}, [API_BASE]);

  // ✅ NEW: Also fetch config when switching to create-team tab
  useEffect(() => {
    if (activeTab === "create-team") {
      const fetchConfig = async () => {
        try {
          const response = await fetch(`${API_BASE}/api/config`);
          if (response.ok) {
            const config = await response.json();
            setCurrentRequirement(config.requiredCredits || 95);
          }
        } catch (error) {
          console.error('Error fetching config:', error);
        }
      };

      fetchConfig().then(() => {
        // Fetch students AFTER config is updated
        fetchAvailableStudents();
      });
    }
  }, [activeTab]);




  // Add these functions in StudentDashboard.js
  const loadSupportTickets = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const response = await fetch(`${API_BASE}/api/support/my-tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSupportTickets(data.tickets);
      }
    } catch (error) {
      console.error('Error loading support tickets:', error);
    }
  };

  const handleSubmitSupport = async (e) => {
    e.preventDefault();

    if (!supportForm.subject.trim() || !supportForm.description.trim()) {
      showInlineNotification('Please fill in all required fields', 'error');
      return;
    }

    setIsSubmittingTicket(true);

    try {
      const token = localStorage.getItem('studentToken');
      const response = await fetch(`${API_BASE}/api/support/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(supportForm)
      });

      const data = await response.json();

      if (response.ok) {
        setSupportForm({
          subject: '',
          description: '',
          category: 'Other',
          priority: 'Medium'
        });
        setShowSupportForm(false);
        setSubmitSuccess(true);
        showInlineNotification('Support ticket submitted successfully!', 'success');
        loadSupportTickets(); // Refresh tickets list

        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        showInlineNotification(data.message || 'Failed to submit ticket', 'error');
      }
    } catch (error) {
      console.error('Submit support error:', error);
      showInlineNotification('Network error. Please try again.', 'error');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // Load support tickets when support tab is active
  useEffect(() => {
    if (activeTab === "support") {
      loadSupportTickets();
    }
  }, [activeTab]);


  // ===== TEAM CREATION STATES (Updated for CSE 400 only) =====
  const [newTeam, setNewTeam] = useState({
    name: "",
    major: "Computer Science",
    capstone: "CSE 400",
    semester: "",
    projectIdea: "",
    supervisorInterest: "",
    description: "",
  });


  // Load deleted notifications from localStorage on mount
  useEffect(() => {
    const deleted = localStorage.getItem('deletedNotifications');
    if (deleted) {
      try {
        const deletedArray = JSON.parse(deleted);
        setDeletedNotificationIds(new Set(deletedArray));
      } catch (error) {
        console.error('Error loading deleted notifications:', error);
      }
    }
  }, []);

  // Save deleted notifications to localStorage
  useEffect(() => {
    if (deletedNotificationIds.size > 0) {
      localStorage.setItem('deletedNotifications', JSON.stringify(Array.from(deletedNotificationIds)));
    }
  }, [deletedNotificationIds]);

  // ===== UTILITY FUNCTIONS FOR AUTOMATIC PHASE PROGRESSION =====
  // const getNextPhase = (currentPhase) => {
  //   const phases = { "A": "B", "B": "C", "C": "C" };
  //   return phases[currentPhase] || "A";
  // };

  // const getPhaseDescription = (phase) => {
  //   const descriptions = {
  //     "A": "Research & Planning Phase",
  //     "B": "Development & Implementation Phase",
  //     "C": "Testing & Final Presentation Phase"
  //   };
  //   return descriptions[phase] || "Unknown Phase";
  // };

  // const determineCurrentPhase = (createdDate, semester) => {
  //   const currentDate = new Date();
  //   const teamCreatedDate = new Date(createdDate);
  //   const monthsDiff = (currentDate.getFullYear() - teamCreatedDate.getFullYear()) * 12 +
  //     (currentDate.getMonth() - teamCreatedDate.getMonth());

  //   if (monthsDiff < 4) return "A";
  //   else if (monthsDiff < 8) return "B";
  //   else return "C";
  // };


  const getCourseDescription = () => {
    return "CSE 400 Capstone Project";
  };

  const [grades, setGrades] = useState([]);        // course-level grades
  const [gpa, setGpa] = useState(null);            // cumulative GPA

  // Fetch once on mount or whenever the tab becomes active
  useEffect(() => {
    if (activeTab === "grades" && grades.length === 0) loadGrades();
  }, [activeTab]);

  const loadGrades = async () => {
    try {
      const token = localStorage.getItem("studentToken");
      const res = await fetch(`${API_BASE}/api/students/my-grades`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGrades(data.courses);
        setGpa(data.gpa);
      }

    } catch (err) {
      console.error(err);
    }
  };
  // ===== MOBILE SIDEBAR FUNCTIONS =====
  const toggleMobileSidebar = () => {
    setSidebarMobileOpen(!sidebarMobileOpen);
  };

  const closeMobileSidebar = () => {
    setSidebarMobileOpen(false);
  };



  const [showMemberInvitation, setShowMemberInvitation] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberFilterMajor, setMemberFilterMajor] = useState("");
  const [showRequestStatus, setShowRequestStatus] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

  // ===== TEAM REQUEST STATES =====
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [myTeam, setMyTeam] = useState(null);

  // Add this with your other state declarations
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  // Add these with your other state declarations
  const [showLeaderConfirmModal, setShowLeaderConfirmModal] = useState(false);
  const [selectedMemberForLeader, setSelectedMemberForLeader] = useState(null);

  // ===== OTHER STATES =====
  const [credits] = useState(85);
  const [materialSearch, setMaterialSearch] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedCapstone, setSelectedCapstone] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("A");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [facultyRequests, setFacultyRequests] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [facultyAnnouncements, setFacultyAnnouncements] = useState([]);

  // Add these with your other state declarations in StudentDashboard
  const [showSkillsEdit, setShowSkillsEdit] = useState(false);
  const [editingSkills, setEditingSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isSavingSkills, setIsSavingSkills] = useState(false);


  const [teamProgress, setTeamProgress] = useState({
  milestones: [],
  completedMilestones: [],
  progressStatus: 'Not Set'
});

// Add these with your other state declarations
const [showTeamMembersModal, setShowTeamMembersModal] = useState(false);
const [selectedTeamForDetails, setSelectedTeamForDetails] = useState(null);

  const [showInlinePasswordForm, setShowInlinePasswordForm] = useState(false);
  const [inlinePasswordData, setInlinePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [inlinePasswordErrors, setInlinePasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  // Add this with your other state declarations
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState(new Set());
  const [dismissedNotificationsLoaded, setDismissedNotificationsLoaded] = useState(false);

  // Add these state declarations
const [teamRequests, setTeamRequests] = useState([]);
const [showTeamRequests, setShowTeamRequests] = useState(false);
const [sendingTeamRequestId, setSendingTeamRequestId] = useState(null);
const [pendingLeaderApprovals, setPendingLeaderApprovals] = useState([]);

// Add this with your other state declarations around line 100-200
  const [showSupervisionHistoryModal, setShowSupervisionHistoryModal] = useState(false);
  // Add these state variables
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [editTeamData, setEditTeamData] = useState({
    name: '',
    major: '',
    semester: '',
    projectIdea: '',
    description: ''
  });


  const [screenStream, setScreenStream] = useState(null);
const [originalVideoTrack, setOriginalVideoTrack] = useState(null);
const [isScreenShareActive, setIsScreenShareActive] = useState(false);
const [screenShareParticipant, setScreenShareParticipant] = useState(null);


  const loadTeamProgress = async () => {
  if (!myTeam || !myTeam.currentSupervisor) return;
  
  try {
    const token = localStorage.getItem('studentToken');
    const response = await fetch(`${API_BASE}/api/students/my-team-progress`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      setTeamProgress(data);
    }
  } catch (error) {
    console.error('Error loading team progress:', error);
  }
};

// Update useEffect to load progress when team changes
useEffect(() => {
  if (myTeam && myTeam.currentSupervisor) {
    loadTeamProgress();
  }
}, [myTeam]);

  // Team management functions
// Update handleRemoveMember function
const handleRemoveMember = async (memberStudentId, memberName) => {
  // Check for supervisor restriction first
  if (hasActiveSupervisor()) {
    showInlineNotification(
      `Cannot remove members. Your team is supervised by ${myTeam.currentSupervisor.facultyName}. Contact your supervisor for member management.`,
      'error'
    );
    return;
  }

  // Show custom confirmation modal instead of window.confirm
  setSelectedMemberForRemoval({ studentId: memberStudentId, name: memberName });
  setShowRemoveMemberModal(true);
};

// Update handleDismissTeam function
const handleDismissTeam = () => {
  // Check for supervisor restriction first
  if (hasActiveSupervisor()) {
    showInlineNotification(
      `Cannot dismiss team. Your team is supervised by ${myTeam.currentSupervisor.facultyName}. Contact your supervisor if you need to leave the team.`,
      'error'
    );
    return;
  }

  // Show the custom modal instead of window.confirm
  setShowDismissTeamModal(true);
};

// Update confirmRemoveMember to handle supervisor restriction errors
const confirmRemoveMember = async () => {
  if (!selectedMemberForRemoval) return;

  setIsRemovingMember(true);

  try {
    const token = localStorage.getItem('studentToken');
    const response = await fetch(`${API_BASE}/api/teams/${myTeam._id}/remove-member`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ memberStudentId: selectedMemberForRemoval.studentId })
    });

    const data = await response.json();

    if (response.ok) {
      setMyTeam(data.team);
      setShowRemoveMemberModal(false);
      setSelectedMemberForRemoval(null);
      showInlineNotification(`${selectedMemberForRemoval.name} has been removed from the team`, 'success');
    } else {
      // ✅ Handle supervisor restriction error
      if (data.action === 'supervisor_required') {
        showInlineNotification(
          `Your team is supervised by ${data.supervisorName}. Only the supervisor can remove members.`,
          'error'
        );
      } else {
        showInlineNotification(data.message || "Failed to remove member", 'error');
      }
      setShowRemoveMemberModal(false);
      setSelectedMemberForRemoval(null);
    }
  } catch (error) {
    console.error('Remove member error:', error);
    showInlineNotification("Network error: Failed to remove member", 'error');
  } finally {
    setShowRemoveMemberModal(false);
    setSelectedMemberForRemoval(null);
    setIsRemovingMember(false);
  }
};

  // Function to cancel the removal
  const cancelRemoveMember = () => {
    setShowRemoveMemberModal(false);
    setSelectedMemberForRemoval(null);
  };

  const handleMakeLeader = async (memberStudentId, memberName) => {
    // Show custom confirmation modal instead of window.confirm
    setSelectedMemberForLeader({ studentId: memberStudentId, name: memberName });
    setShowLeaderConfirmModal(true);
  };

  // New function to actually process the leader change
  const confirmMakeLeader = async () => {
    if (!selectedMemberForLeader) return;

    setIsMakingLeader(true);

    try {
      const token = localStorage.getItem('studentToken');
      const response = await fetch(`${API_BASE}/api/teams/${myTeam._id}/make-leader`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ memberStudentId: selectedMemberForLeader.studentId })
      });

      const data = await response.json();

      if (response.ok) {
        setMyTeam(data.team);
        setIsLeader(false);

        // Close modal and reset state
        setShowLeaderConfirmModal(false);
        setSelectedMemberForLeader(null);
      }
      else {
        setShowLeaderConfirmModal(false);
        setSelectedMemberForLeader(null);
      }
    } catch (error) {
      console.error('Error making leader:', error);
    } finally {
      // Always close modal after operation
      setShowLeaderConfirmModal(false);
      setSelectedMemberForLeader(null);
      setIsMakingLeader(false); // ✅ Stop loading
    }
  };



  const startScreenShare = async () => {
  try {
    // Get screen capture stream
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'always',
        displaySurface: 'monitor'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    });

    // Store the original video track and screen stream
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      setOriginalVideoTrack(videoTrack);
    }
    setScreenStream(screenStream);
    setIsScreenSharing(true);
    setIsScreenShareActive(true);
    setScreenShareParticipant({
      id: profile._id,
      name: profile.name,
      isLocal: true
    });

    // Replace video track in all peer connections
    const videoTrack = screenStream.getVideoTracks()[0];
    
    peerConnections.forEach(async (peerConnection, socketId) => {
      const sender = peerConnection.getSenders().find(
        s => s.track && s.track.kind === 'video'
      );
      
      if (sender) {
        try {
          await sender.replaceTrack(videoTrack);
          console.log(`Screen share started for peer: ${socketId}`);
        } catch (error) {
          console.error('Error replacing video track for screen share:', error);
        }
      }
    });

    // Update local video element
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = screenStream;
    }

    // Notify other participants via socket
    if (socket) {
      socket.emit('screen-share-started', {
        meetingId: currentMeetingId,
        userId: profile._id,
        userName: profile.name
      });
    }

    // Handle screen share end (when user stops sharing)
    videoTrack.onended = () => {
      stopScreenShare();
    };

    showInlineNotification('Screen sharing started', 'success');

  } catch (error) {
    console.error('Screen share failed:', error);
    showInlineNotification('Screen sharing failed. Please try again.', 'error');
    
    // Reset states on error
    setIsScreenSharing(false);
    setIsScreenShareActive(false);
    setScreenShareParticipant(null);
  }
};

const stopScreenShare = async () => {
  try {
    console.log('Stopping screen share...');

    // Stop screen stream
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }

    // Restore original camera stream
    let cameraStream = localStream;
    if (!localStream || !localStream.getVideoTracks().length) {
      // If no camera stream, get a new one
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setLocalStream(cameraStream);
      } catch (error) {
        console.error('Failed to restore camera:', error);
        // Create a black video track as fallback
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 640, 480);
        
        const blackStream = canvas.captureStream();
        cameraStream = blackStream;
        setLocalStream(blackStream);
      }
    }

    // Replace screen share track with camera track in all peer connections
    const videoTrack = cameraStream.getVideoTracks()[0];
    
    peerConnections.forEach(async (peerConnection, socketId) => {
      const sender = peerConnection.getSenders().find(
        s => s.track && s.track.kind === 'video'
      );
      
      if (sender && videoTrack) {
        try {
          await sender.replaceTrack(videoTrack);
          console.log(`Camera restored for peer: ${socketId}`);
        } catch (error) {
          console.error('Error restoring camera track:', error);
        }
      }
    });

    // Update local video element
    if (localVideoRef.current && cameraStream) {
      localVideoRef.current.srcObject = cameraStream;
    }

    // Reset screen sharing states
    setIsScreenSharing(false);
    setIsScreenShareActive(false);
    setScreenShareParticipant(null);
    setOriginalVideoTrack(null);

    // Notify other participants
    if (socket) {
      socket.emit('screen-share-stopped', {
        meetingId: currentMeetingId,
        userId: profile._id,
        userName: profile.name
      });
    }

    showInlineNotification('Screen sharing stopped', 'info');

  } catch (error) {
    console.error('Failed to stop screen share:', error);
    showInlineNotification('Error stopping screen share', 'error');
  }
};

  // Add this useEffect to check for project completion
// Enhanced completion detection - around line 800

// Add this useEffect in StudentDashboard.js around line 1000
// Replace the existing useEffects around line 800-1100 with this single, improved version
useEffect(() => {
  let completionCheckInterval;
  
  // Only check for completion updates if user is in a team and project isn't completed yet
  if (myTeam && !myTeam.projectCompleted) {
    console.log('🔄 Starting completion status monitoring for team:', myTeam.name);
    
    completionCheckInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const response = await fetch(`${API_BASE}/api/teams/my-team`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const updatedTeam = await response.json();
          
          // Check if project was just completed (compare with current state)
          if (updatedTeam.projectCompleted && !myTeam.projectCompleted) {
            console.log('🎉 PROJECT COMPLETION DETECTED!');
            
            // Update team data immediately
            setMyTeam(updatedTeam);
            
            // Clear any existing celebration flags for this team
            const celebrationKey = `completion_${updatedTeam._id}`;
            localStorage.removeItem(celebrationKey);
            
            // Trigger celebration after a short delay
            setTimeout(() => {
              setShowCompletionCelebration(true);
              setCelebrationShown(true);
              localStorage.setItem(celebrationKey, 'true');
              
              // Auto-hide after 15 seconds
              setTimeout(() => {
                setShowCompletionCelebration(false);
              }, 15000);
            }, 1000);
            
            // Show inline notification as well
            showInlineNotification(
              '🎉 Congratulations! Your project has been marked as completed by your supervisor!', 
              'success'
            );
          }
        }
      } catch (error) {
        console.error('Failed to check completion status:', error);
      }
    }, 5000); // Check every 5 seconds for more responsive updates
  }

  return () => {
    if (completionCheckInterval) {
      clearInterval(completionCheckInterval);
      console.log('🛑 Completion monitoring stopped');
    }
  };
}, [myTeam?._id, myTeam?.projectCompleted]); // Dependencies on team ID and completion status


// Add this function in your StudentDashboard component
const refreshTeamData = async () => {
  if (!myTeam) return;
  
  try {
    const token = localStorage.getItem('studentToken');
    const response = await fetch(`${API_BASE}/api/teams/my-team`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const updatedTeam = await response.json();
      const wasCompleted = myTeam.projectCompleted;
      
      setMyTeam(updatedTeam);
      
      // Check if project was just completed
      if (updatedTeam.projectCompleted && !wasCompleted) {
        showInlineNotification('🎉 Your project has been marked as completed by your supervisor!', 'success');
        
        // Trigger celebration
        const celebrationKey = `completion_${updatedTeam._id}`;
        const hasSeenCelebration = localStorage.getItem(celebrationKey);
        
        if (!hasSeenCelebration) {
          setTimeout(() => {
            setShowCompletionCelebration(true);
            setCelebrationShown(true);
            localStorage.setItem(celebrationKey, 'true');
          }, 1000);
        }
      }
      
      showInlineNotification('Team data refreshed successfully', 'success');
    }
  } catch (error) {
    console.error('Failed to refresh team data:', error);
    showInlineNotification('Failed to refresh team data', 'error');
  }
};

  // Add this function with your other handlers
const handleViewTeamMembers = (team) => {
  setSelectedTeamForDetails(team);
  setShowTeamMembersModal(true);
};

const handleCloseTeamMembersModal = () => {
  setShowTeamMembersModal(false);
  setSelectedTeamForDetails(null);
};

  
// Load team requests when component mounts or team changes
useEffect(() => {
  if (myTeam && activeTab === "join-team") {
    loadTeamRequests();
    fetchAvailableStudents();
  }
}, [myTeam, activeTab]);

// Refresh team requests periodically
useEffect(() => {
  if (myTeam && activeTab === "join-team") {
    const interval = setInterval(loadTeamRequests, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }
}, [myTeam, activeTab]);
  // Function to cancel the confirmation
  const cancelMakeLeader = () => {
    setShowLeaderConfirmModal(false);
    setSelectedMemberForLeader(null);
  };


const getPhaseDescription = (phase) => {
  const descriptions = {
    "A": "Research & Planning Phase",
    "B": "Development & Implementation Phase", 
    "C": "Testing & Final Presentation Phase"
  };
  return descriptions[phase] || "Unknown Phase";
};

  // New function to actually dismiss the team after confirmation
  const confirmDismissTeam = async () => {
    setIsDismissingTeam(true);
    try {
      const token = localStorage.getItem('studentToken');
      const response = await fetch(`${API_BASE}/api/teams/${myTeam._id}/dismiss`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMyTeam(null);
        setIsLeader(false);
        // Refresh teams list
        loadAllTeams();
        // Close the modal
        setShowDismissTeamModal(false);
      }
      else {
        alert(data.message || "Failed to dismiss team");
        setShowDismissTeamModal(false);
      }
    } catch (error) {
      console.error('Dismiss team error:', error);
      showInlineNotification("Network error: Failed to dismiss team", 'error');
      setShowDismissTeamModal(false);
    } finally {
      setIsDismissingTeam(false); // ✅ Stop loading
    }
  };
  // Function to cancel dismiss team
  const cancelDismissTeam = () => {
    setShowDismissTeamModal(false);
  };




  // Handler for sending team member requests
// Handler for sending team member requests
const handleSendTeamMemberRequest = async (student) => {
  if (!myTeam) {
    showInlineNotification("You must be in a team to send member requests", "error");
    return;
  }

  if (myTeam.members.length >= 4) {
    showInlineNotification("Your team is already full (4/4 members)", "error");
    return;
  }

  setSendingTeamRequestId(student._id);

  try {
    const token = localStorage.getItem('studentToken');
    const response = await fetch(`${API_BASE}/api/teams/member-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        targetStudentId: student._id,
        targetStudentName: student.name,
        targetStudentEmail: student.email,
        message: `${profile.name} from team "${myTeam.name}" would like you to join their team.`
      })
    });

    const data = await response.json();

    if (response.ok) {
      showInlineNotification(
        data.requiresLeaderApproval 
          ? `Invitation sent to ${student.name}! If accepted, it will need leader approval.`
          : `Invitation sent to ${student.name} successfully!`,
        "success"
      );

      // Refresh team requests
      loadTeamRequests();
    } else {
      showInlineNotification(data.message || "Failed to send team invitation", "error");
    }
  } catch (error) {
    console.error('Team member request error:', error);
    showInlineNotification("Network error: Failed to send invitation", "error");
  } finally {
    setSendingTeamRequestId(null);
  }
};

// Load team requests
const loadTeamRequests = async () => {
  try {
    const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
    if (!token) return;

    // Load incoming requests (for users without teams or team leaders)
    if (!myTeam || isLeader) {
      const incomingResponse = await fetch(`${API_BASE}/api/teams/requests/incoming`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (incomingResponse.ok) {
        const newRequests = await incomingResponse.json();
        
        // Get current request IDs from state AND check processed refs immediately
        const currentRequestIds = incomingRequests.map(req => req._id);
        const actuallyNewRequests = newRequests.filter(req =>
          !currentRequestIds.includes(req._id) &&
          !processedRequestIdsRef.current.has(req._id) // ✅ IMMEDIATE check using ref
        );

        if (actuallyNewRequests.length > 0) {
          console.log('🔔 Processing genuinely new team requests:', actuallyNewRequests.length);

          actuallyNewRequests.forEach(request => {
            // ✅ IMMEDIATELY mark as processed using ref (no async delay)
            processedRequestIdsRef.current.add(request._id);

            // Create unique key for each team invitation
            const uniqueKey = `team_invite_${request._id}_${request.senderName}`;
            const notificationText = `🔔 ${request.senderName} sent you a team invitation for "${request.teamName}"!`;

            // Create notification with actual timestamp
            const newNotification = {
              id: `local_${request._id}_team_invite`,
              type: "info",
              text: notificationText,
              createdAt: request.sentDate || request.createdAt, // ✅ Use actual request date
              date: request.sentDate || request.createdAt,      // ✅ Use actual request date
              timestamp: request.sentDate || request.createdAt, // ✅ Use actual request date
              read: false,
              action: null,
              isLocal: true,
              notificationKey: uniqueKey
            };

            // Add directly to state instead of using addNotification
            setLocalNotifications(prev => {
              const exists = prev.some(n => n.notificationKey === uniqueKey);
              return exists ? prev : [...prev, newNotification];
            });
          });

          // Update state for cleanup (async is OK here)
          setProcessedRequestIds(prev => {
            const newSet = new Set(prev);
            actuallyNewRequests.forEach(req => newSet.add(req._id));
            return newSet;
          });
        }

        setIncomingRequests(newRequests);
      }
    }

    // Load team-sent requests (for users with teams)
    if (myTeam) {
      const teamRequestsResponse = await fetch(`${API_BASE}/api/teams/team-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (teamRequestsResponse.ok) {
        const teamData = await teamRequestsResponse.json();
       const validRequests = (teamData.requests || []).filter(request => 
    request && 
    request._id && 
    request.targetStudent && 
    request.targetStudent._id && 
    request.senderInfo && 
    request.senderInfo._id
  );
  
  setTeamRequests(validRequests);
}
    }

  } catch (error) {
    console.error('Failed to load team requests:', error);
  }
};

// Handle leader approval
const handleLeaderApproval = async (requestId, action) => {
 if (action === 'approve') {
    setApprovingRequestId(requestId);
  } else {
    setRejectingRequestId(requestId);
  }
  try {
    const token = localStorage.getItem('studentToken');
    const response = await fetch(`${API_BASE}/api/teams/approve-member-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ requestId, action })
    });

    const data = await response.json();

    if (response.ok) {
      showInlineNotification(
        action === 'approve' 
          ? "Member request approved! Student added to team."
          : "Member request rejected.",
        action === 'approve' ? "success" : "info"
      );

      // Refresh team data and requests
      loadTeamRequests();
      loadAllTeams(); // Refresh team data
    } else {
      showInlineNotification(data.message || "Failed to process request", "error");
    }
  } catch (error) {
    console.error('Leader approval error:', error);
    showInlineNotification("Network error: Failed to process request", "error");
  } finally {
    // Clear loading states
    setApprovingRequestId(null);
    setRejectingRequestId(null);
  }
};
  const handleEditTeam = () => {
    // ✅ FIX: Properly map team fields to form fields
    setEditFormData({
      teamName: myTeam.name || myTeam.teamName || '',
      major: myTeam.major || '',
      capstone: myTeam.capstone || 'CSE 400',
      projectDescription: myTeam.projectIdea || myTeam.projectDescription || ''
    });
    setEditErrors({});
    setIsEditingTeam(true);

    console.log('Edit form initialized with:', {
      teamName: myTeam.name || myTeam.teamName,
      major: myTeam.major,
      capstone: myTeam.capstone,
      projectDescription: myTeam.projectIdea || myTeam.projectDescription
    });
  };


  const handleCancelEdit = () => {
    setIsEditingTeam(false);
    setEditFormData({
      teamName: '',
      major: '',
      capstone: '',
      projectDescription: ''
    });
    setEditErrors({});
  };


  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = {};
    if (!editFormData.teamName.trim()) errors.teamName = 'Team name is required';
    if (!editFormData.major) errors.major = 'Major is required';
    if (!editFormData.capstone) errors.capstone = 'Capstone phase is required';

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setIsUpdating(true);

    try {
      const token = localStorage.getItem('studentToken');

      // ✅ FIX: Use the correct endpoint with /edit suffix
      const response = await fetch(`${API_BASE}/api/teams/${myTeam._id}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editFormData.teamName,        // Backend expects 'name'
          major: editFormData.major,
          semester: editFormData.semester,
          projectIdea: editFormData.projectDescription,
          description: editFormData.description
        })
      });

      console.log('Team update response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Team update successful:', data);

        // Update local team data
        setMyTeam({
          ...myTeam,
          name: editFormData.teamName,
          major: editFormData.major,
          capstone: editFormData.capstone,
          projectIdea: editFormData.projectDescription
        });

        // Return to team view
        setIsEditingTeam(false);
        setEditErrors({});

        // Show success message
        setSuccessMessage('Team updated successfully!');
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          setSuccessMessage('');
        }, 5000);

      } else {
        const errorData = await response.json();
        console.error('Team update failed:', errorData);
        setEditErrors({ general: errorData.message || 'Failed to update team' });
      }
    } catch (error) {
      console.error('Team update network error:', error);
      setEditErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };


  // Add these functions in your StudentDashboard component

  const handleAddSkill = () => {
    const trimmedSkill = newSkillInput.trim();

    if (!trimmedSkill) return;

    if (editingSkills.length >= 10) {
      showInlineNotification('Maximum 10 skills allowed', 'error');
      return;
    }

    if (editingSkills.some(skill => skill.toLowerCase() === trimmedSkill.toLowerCase())) {
      showInlineNotification('Skill already added', 'error');
      return;
    }

    setEditingSkills(prev => [...prev, trimmedSkill]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (indexToRemove) => {
    setEditingSkills(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveSkills = async () => {
    setIsSavingSkills(true);

    try {
      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/students/skills`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skills: editingSkills })
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({
          ...prev,
          skills: data.skills
        }));

        setShowSkillsEdit(false);
        showInlineNotification('Skills updated successfully!', 'success');
      } else {
        const errorData = await response.json();
        showInlineNotification(errorData.message || 'Failed to update skills', 'error');
      }
    } catch (error) {
      console.error('Save skills error:', error);
      showInlineNotification('Network error. Please try again.', 'error');
    } finally {
      setIsSavingSkills(false);
    }
  };

  const handleCancelSkillsEdit = () => {
    setShowSkillsEdit(false);
    setEditingSkills(profile.skills || []);
    setNewSkillInput('');
  };

  // Initialize skills when editing starts
  useEffect(() => {
    if (showSkillsEdit) {
      setEditingSkills(profile.skills || []);
    }
  }, [showSkillsEdit, profile.skills]);

useEffect(() => {
  if (profile.skills && !showSkillsEdit) {  // ✅ Only update when NOT editing
    setEditingSkills(profile.skills || []); // ✅ Ensure it's always an array
  }
}, [profile.skills, showSkillsEdit]);

// Add this useEffect to periodically refresh team data for non-leaders


  const fetchFaculty = async () => {
    setIsLoadingFaculty(true);
    setFacultyError(null);

    try {
      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
      // ✅ CHANGE: Use the new visibility-filtered endpoint
      const response = await fetch(`${API_BASE}/api/faculty/visible`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const faculty = await response.json();
        setFacultyData(faculty);
      } else {
        throw new Error('Failed to fetch faculty data');
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
      setFacultyError('Failed to load faculty information');
    } finally {
      setIsLoadingFaculty(false);
    }
  };


  // Add this function to handle supervision requests
// Replace the existing handleRequestSupervision function with this:
const handleRequestSupervision = async (faculty) => {
  if (!myTeam) {
    showInlineNotification("You must be in a team to request supervision", "error");
    return;
  }

  // ✅ NEW: Check if team has 4 members
  const currentMemberCount = myTeam.members?.length || 0;
  if (currentMemberCount < 4) {
    showInlineNotification(
      `You need 4 members to request a supervisor. Currently you have ${currentMemberCount}.`,
      "error"
    );
    return;
  }

  // Check if request already sent
  if (sentSupervisionRequests.has(faculty._id)) {
    showInlineNotification(`You have already sent a supervision request to ${faculty.name}`, "info");
    return;
  }

  // Open modal for message input
  setSelectedFacultyForSupervision(faculty);
  setSupervisionMessage(''); // Reset message
  setShowSupervisionModal(true);
};


// Add this new function to handle the actual request submission
const handleSubmitSupervisionRequest = async () => {
  if (!selectedFacultyForSupervision || !myTeam) return;

  setIsSendingSupervisionRequest(true);

  try {
    const token = localStorage.getItem('studentToken') || localStorage.getItem('token');

    // Use default message if no custom message provided
    const messageToSend = supervisionMessage.trim() || 
      `Team "${myTeam.name}" requests supervision for CSE 400 project`;

    const response = await fetch(`${API_BASE}/api/supervision/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        facultyId: selectedFacultyForSupervision._id,
        teamId: myTeam._id,
        message: messageToSend
      })
    });

    if (response.ok) {
      // Add faculty ID to sent requests
      setSentSupervisionRequests(prev => {
        const newSet = new Set(prev);
        newSet.add(selectedFacultyForSupervision._id);
        return newSet;
      });

      showInlineNotification(`Supervision request sent to ${selectedFacultyForSupervision.name}!`, "success");
      
      // Close modal
      setShowSupervisionModal(false);
      setSelectedFacultyForSupervision(null);
      setSupervisionMessage('');
      
      // Refresh team data to show the new supervision request
      setTimeout(async () => {
        try {
          const teamResponse = await fetch(`${API_BASE}/api/teams/my-team`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (teamResponse.ok) {
            const updatedTeam = await teamResponse.json();
            setMyTeam(updatedTeam);
            console.log('✅ Team data refreshed after supervision request');
          }
        } catch (refreshError) {
          console.error('Failed to refresh team data:', refreshError);
        }
      }, 1000);
      
    } else {
      const error = await response.json();
      showInlineNotification(error.message || "Failed to send supervision request", "error");
    }
  } catch (error) {
    console.error('Error sending supervision request:', error);
    showInlineNotification("Network error: Failed to send request", "error");
  } finally {
    setIsSendingSupervisionRequest(false);
  }
};

// Add function to close modal
const handleCloseSupervisionModal = () => {
  setShowSupervisionModal(false);
  setSelectedFacultyForSupervision(null);
  setSupervisionMessage('');
};


  const generateSemesterOptions = () => {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  return [
    { value: `Spring ${currentYear}`, label: `Spring ${currentYear}` },
    { value: `Summer ${currentYear}`, label: `Summer ${currentYear}` },
    { value: `Fall ${currentYear}`, label: `Fall ${currentYear}` },
    { value: `Spring ${nextYear}`, label: `Spring ${nextYear}` },
    { value: `Summer ${nextYear}`, label: `Summer ${nextYear}` },
    { value: `Fall ${nextYear}`, label: `Fall ${nextYear}` }
  ];
};

  // Load faculty data when faculty tab is activated
  useEffect(() => {
    if (activeTab === "faculty") {
      fetchFaculty();
    }
  }, [activeTab]);
  // ===== NOTIFICATIONS STATE =====
  // ✅ FIXED: Enhanced addNotification with complete deduplication
  // ✅ FIXED: Enhanced addNotification with immediate ref-based deduplication
  // ✅ FIXED: Simple key-based duplicate blocking
  // ✅ FIXED: Enhanced addNotification with proper date handling
  const addNotification = (type, text, action = null, customKey = null) => {
    // Create a unique key for this notification
    const notificationKey = customKey || `${type}:${text}:${Date.now()}`;

    // Check if we've already used this key
    if (usedNotificationKeys.has(notificationKey)) {
      console.log('🚫 Blocked duplicate notification with key:', notificationKey);
      return; // Block duplicate
    }

    console.log('✅ Adding notification with key:', notificationKey);

    // ✅ FIX: Create date once and store it as ISO string
    const creationTime = new Date().toISOString();

    const newNotification = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      text,
      createdAt: creationTime, // ✅ Store as ISO string, same as server notifications
      date: creationTime,      // ✅ Backup field for compatibility
      timestamp: creationTime, // ✅ Additional backup field
      read: false,
      action,
      isLocal: true,
      notificationKey // Store the key
    };

    // Add to notifications
    setLocalNotifications(prev => [...prev, newNotification]);

    // Mark this key as used
    setUsedNotificationKeys(prev => new Set([...prev, notificationKey]));

    // Clean up old keys after 10 minutes
    setTimeout(() => {
      setUsedNotificationKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationKey);
        return newSet;
      });
    }, 600000); // 10 minutes
  };

  // ✅ Reset keys when user joins/leaves team
  useEffect(() => {
    if (myTeam) {
      setUsedNotificationKeys(new Set());
    }
  }, [myTeam]);


  // Add this useEffect to sync localStorage with state changes
  useEffect(() => {
    // Only save non-empty local notifications
    if (localNotifications.length > 0) {
      localStorage.setItem('localNotifications', JSON.stringify(localNotifications));
    } else {
      localStorage.removeItem('localNotifications');
    }
  }, [localNotifications]);

  // Add cleanup on component unmount
  useEffect(() => {
    return () => {
      // Save current state to localStorage before unmounting
      if (localNotifications.length > 0) {
        localStorage.setItem('localNotifications', JSON.stringify(localNotifications));
      }
    };
  }, []);


  const [isLeader, setIsLeader] = useState(false);
  useEffect(() => {
    if (myTeam && profile.studentId) {
      const me = myTeam.members.find(m => m.studentId === profile.studentId);
      setIsLeader(me?.role === 'Leader' || me?.role === 'Team Lead');
    } else {
      setIsLeader(false);
    }
  }, [myTeam, profile.studentId]);
  // ===== TEAMS STATE =====

  useEffect(() => {
    localStorage.setItem('teamFormData', JSON.stringify(newTeam));
  }, [newTeam]);

  useEffect(() => {
    const savedTeamData = localStorage.getItem('teamFormData');
    if (savedTeamData) {
      try {
        const parsedData = JSON.parse(savedTeamData);
        setNewTeam(parsedData);
      } catch (error) {
        console.error('Error loading saved team data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (myTeam) {
      localStorage.removeItem('teamFormData');
      setNewTeam({
        name: "",
        major: "Computer Science",
        capstone: "A",
        semester: "",
        projectIdea: "",
        supervisorInterest: "",
        description: "",
      });
    }
  }, [myTeam]);

  const clearTeamForm = () => {
    const defaultTeamData = {
      name: "",
      major: "Computer Science",
      capstone: "A",
      semester: "",
      projectIdea: "",
      supervisorInterest: "",
      description: "",
    };
    setNewTeam(defaultTeamData);
    localStorage.removeItem('teamFormData');
  };

  // Update the pending requests state management
  useEffect(() => {
    // Load pending requests from localStorage on mount
    const savedRequests = localStorage.getItem('pendingTeamRequests');
    if (savedRequests) {
      try {
        const parsedRequests = JSON.parse(savedRequests);
        setPendingRequests(parsedRequests);
      } catch (error) {
        console.error('Error loading saved requests:', error);
      }
    }
  }, []);

  // Save pending requests to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pendingTeamRequests', JSON.stringify(pendingRequests));
  }, [pendingRequests]);

  // Clear pending requests when user joins a team
  useEffect(() => {
    if (myTeam) {
      localStorage.removeItem('pendingTeamRequests');
      setPendingRequests([]);
    }
  }, [myTeam]);

  const [teams, setTeams] = useState([]);



  // ✅ Save local notifications to localStorage whenever they change
  useEffect(() => {
    if (localNotifications.length > 0) {
      localStorage.setItem('localNotifications', JSON.stringify(localNotifications));
    }
  }, [localNotifications]);

  // ✅ Load local notifications from localStorage on component mount
  useEffect(() => {
    const savedLocalNotifications = localStorage.getItem('localNotifications');
    if (savedLocalNotifications) {
      try {
        const parsed = JSON.parse(savedLocalNotifications);
        setLocalNotifications(parsed);
      } catch (error) {
        console.error('Error loading local notifications:', error);
        localStorage.removeItem('localNotifications');
      }
    }
  }, []);


  // Add these functions with your other handlers
  const handleSessionTimeout = () => {
    // Clear all stored data
    localStorage.removeItem("studentToken");
    localStorage.removeItem("currentStudent");
    localStorage.removeItem("token");
    localStorage.removeItem("teamFormData");
    localStorage.removeItem("pendingTeamRequests");
    localStorage.removeItem("tutorialShown");

    // Clear component state
    setProfile({});
    setMyTeam(null);
    setShowSessionTimeoutModal(false);

    // Navigate to login
    navigate("/");
  };

  const handleExtendSession = async () => {
    setIsExtendingSession(true);
    try {
      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');

      if (!token) {
        console.error('No token found for session extension');
        handleSessionTimeout();
        return;
      }

      // Call the server to extend the session
      const response = await fetch(`${API_BASE}/api/refresh-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Update the token in localStorage
        localStorage.setItem('studentToken', data.token);

        // Reset local activity timer
        setLastActivity(Date.now());
        setShowSessionTimeoutModal(false);

        // Show success message
        setSuccessMessage('Session extended successfully!');
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          setSuccessMessage('');
        }, 3000);

        console.log('✅ Session extended successfully');

      } else {
        console.error('❌ Failed to extend session, logging out...');
        // If refresh fails, force logout
        handleSessionTimeout();
      }

    } catch (error) {
      console.error('❌ Network error during session extension:', error);

      // Show error message
      setSuccessMessage('Failed to extend session. Please login again.');
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        handleSessionTimeout();
      }, 2000);
    }
    finally {
      setIsExtendingSession(false);
    }
  };


  useEffect(() => {
  let teamDataInterval;
  
  // Only set up periodic refresh if user is in a team but not a leader
  if (myTeam && !isLeader && activeTab === "join-team") {
    console.log('🔄 Setting up team data refresh for non-leader');
    
    teamDataInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/teams/my-team`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const updatedTeam = await response.json();
          
          // Only update if there are actual changes to avoid unnecessary re-renders
          if (JSON.stringify(updatedTeam.supervisionRequests) !== JSON.stringify(myTeam.supervisionRequests) ||
              JSON.stringify(updatedTeam.currentSupervisor) !== JSON.stringify(myTeam.currentSupervisor)) {
            setMyTeam(updatedTeam);
            console.log('✅ Team data updated with new supervision info');
          }
        }
      } catch (error) {
        console.error('Failed to refresh team data:', error);
      }
    }, 10000); // Refresh every 10 seconds
  }

  return () => {
    if (teamDataInterval) {
      clearInterval(teamDataInterval);
      console.log('🛑 Team data refresh stopped');
    }
  };
}, [myTeam, isLeader, activeTab]);

  // Define the function BEFORE the useEffect that uses it
  const loadSentRequests = async () => {
    try {
      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/teams/requests/sent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const sentRequests = await response.json();
        setPendingRequests(sentRequests);
        localStorage.setItem('pendingTeamRequests', JSON.stringify(sentRequests));
        console.log('✅ Loaded sent requests from server:', sentRequests.length);
      } else {
        console.error('Failed to load sent requests from server');
        loadSentRequestsFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading sent requests from server:', error);
      loadSentRequestsFromLocalStorage();
    }
  };

  const loadSentRequestsFromLocalStorage = () => {
    try {
      const savedRequests = localStorage.getItem('pendingTeamRequests');
      if (savedRequests) {
        const parsedRequests = JSON.parse(savedRequests);
        setPendingRequests(parsedRequests);
        console.log('✅ Loaded sent requests from localStorage:', parsedRequests.length);
      }
    } catch (error) {
      console.error('Error loading sent requests from localStorage:', error);
      localStorage.removeItem('pendingTeamRequests');
    }
  };


  // Load pending requests from localStorage on component mount
  useEffect(() => {
    const loadSentRequests = async () => {
      try {
        const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/teams/requests/sent`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const sentRequests = await response.json();
          setPendingRequests(sentRequests);

          // Also update localStorage for offline cache
          localStorage.setItem('pendingTeamRequests', JSON.stringify(sentRequests));

          console.log('✅ Loaded sent requests from server:', sentRequests.length);
        } else {
          console.error('Failed to load sent requests from server');
          // Fallback to localStorage
          loadSentRequestsFromLocalStorage();
        }
      } catch (error) {
        console.error('Error loading sent requests from server:', error);
        // Fallback to localStorage
        loadSentRequestsFromLocalStorage();
      }
    };

    const loadSentRequestsFromLocalStorage = () => {
      try {
        const savedRequests = localStorage.getItem('pendingTeamRequests');
        if (savedRequests) {
          const parsedRequests = JSON.parse(savedRequests);
          setPendingRequests(parsedRequests);
          console.log('✅ Loaded sent requests from localStorage:', parsedRequests.length);
        }
      } catch (error) {
        console.error('Error loading sent requests from localStorage:', error);
        localStorage.removeItem('pendingTeamRequests');
      }
    };
    // Load immediately on mount
    loadSentRequests();

    // Also load when the activeTab changes to create-team
    if (activeTab === "create-team") {
      loadSentRequests();
    }
  }, [activeTab]);

  // Update the useEffect for activeTab to refresh rejection status
  useEffect(() => {
    if (activeTab === "join-team") {
      // Clear old pending statuses
loadJoinRequestStatuses();

    // ✅ ENHANCED: Always refresh rejection status when entering join-team tab
    loadTeamRejectionStatus().then(() => {
      console.log('🔄 Rejection status refreshed for join-team tab');
    });

    // Also refresh teams list to get latest data
    loadAllTeams();
  }
}, [activeTab]);

  // Save pending requests to localStorage whenever they change
  useEffect(() => {
    if (pendingRequests.length >= 0) {
      localStorage.setItem('pendingTeamRequests', JSON.stringify(pendingRequests));
      console.log('💾 Saved sent requests to localStorage:', pendingRequests.length);
    }
  }, [pendingRequests]);

// Add this useEffect in StudentDashboard.js around line 800
useEffect(() => {
  // Socket connection for real-time updates
  const token = localStorage.getItem('studentToken');
  if (token && profile._id) {
    // Note: You'll need to implement socket connection if not already done
    // This is a placeholder for the socket listener
    
    const handleRequestRejected = (data) => {
      console.log('🔄 Request rejected via socket:', data);
      
      // Clear the pending status for this team
      setJoinRequestStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[data.teamId];
        return newStatus;
      });
      
      // Update localStorage
      const currentStatuses = JSON.parse(localStorage.getItem('joinRequestStatuses') || '{}');
      delete currentStatuses[data.teamId];
      localStorage.setItem('joinRequestStatuses', JSON.stringify(currentStatuses));
      
      // Refresh rejection status
      loadTeamRejectionStatus();
      
      console.log(`✅ Cleared pending status for team ${data.teamId}, rejections: ${data.rejectionCount}/3`);
    };
    
    // If you have socket implementation, add listener here
    // socket.on('requestRejected', handleRequestRejected);
    
    return () => {
      // socket.off('requestRejected', handleRequestRejected);
    };
  }
}, [profile._id]);


  // Load pending requests from server and localStorage on component mount
  useEffect(() => {
    const loadSentRequestsOnMount = async () => {
      // Only load if user is not in a team
      if (!myTeam) {
        await loadSentRequests(); // Load from server first
      }
    };

    // Load immediately on mount
    loadSentRequestsOnMount();

    // Also load when the activeTab changes to create-team
    if (activeTab === "create-team" && !myTeam) {
      loadSentRequests();
    }
  }, [activeTab, myTeam]);


  // Add this function to load existing supervision requests
  const loadSupervisionRequests = async () => {
    try {
      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/api/supervision/my-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const formattedRequests = data.requests.map(req => ({
          id: req._id,
          facultyId: req.facultyId._id,
          facultyName: req.facultyId.name,
          status: req.status,
          requestDate: req.requestDate,
          message: req.message
        }));

        setFacultyRequests(formattedRequests);
      }
    } catch (error) {
      console.error('Error loading supervision requests:', error);
    }
  };

  // Call this function when the faculty tab is activated
  useEffect(() => {
    if (activeTab === "faculty" && myTeam && isLeader) {
      loadSupervisionRequests();
    }
  }, [activeTab, myTeam, isLeader]);


  // Add this function to fetch server notifications
  // Enhanced server notifications loading with deletion filtering
  const loadServerNotifications = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const response = await fetch(`${API_BASE}/api/notifications/my-notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const serverNotifs = data.notifications || [];

        // ✅ Filter out permanently deleted notifications
        const filteredNotifications = serverNotifs.filter(notif =>
          !deletedNotificationIds.has(notif._id)
        );

        // Preserve read state for notifications that were marked as read locally
        const existingReadIds = new Set(
          serverNotifications
            .filter(n => n.read)
            .map(n => n._id)
        );

        const updatedNotifications = filteredNotifications.map(notif => ({
          ...notif,
          read: existingReadIds.has(notif._id) || notif.read
        }));

        setServerNotifications(updatedNotifications);
      }
    } catch (error) {
      console.error('Failed to load server notifications:', error);
    }
  };


  // Add this useEffect to poll for notifications
  useEffect(() => {
    let notificationPolling;

    // Load notifications immediately when component mounts
    loadServerNotifications();

    // Poll for new notifications every 10 seconds
    notificationPolling = setInterval(() => {
      loadServerNotifications();
    }, 10000);

    return () => {
      if (notificationPolling) {
        clearInterval(notificationPolling);
      }
    };
  }, []);

  // ===== MESSAGES STATE =====
  // ===== ENHANCED CHAT STATE =====
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [chatError, setChatError] = useState(null);


  const [materials, setMaterials] = useState([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [materialsError, setMaterialsError] = useState(null);
  const [studentPhase, setStudentPhase] = useState('A');
  const [studentTeamName, setStudentTeamName] = useState(null);


  const [finalizedGrades, setFinalizedGrades] = useState([]);
const [isLoadingGrades, setIsLoadingGrades] = useState(false);

  const [historicalMaterials] = useState([
    {
      id: 1,
      title: "Capstone A Success Stories",
      type: "pdf",
      category: "Examples",
      description: "Successful CSE 400 A projects from previous semesters",
      author: "Multiple Teams",
      date: "2023-05-15",
      size: "3.1 MB",
      phase: "A",
      downloadUrl: "/examples/capstone-a-examples.pdf",
    },
    {
      id: 2,
      title: "Phase B Transition Guide",
      type: "pdf",
      category: "Guide",
      description: "How to transition from Phase A to Phase B",
      author: "Academic Committee",
      date: "2023-06-01",
      size: "2.5 MB",
      phase: "B",
      downloadUrl: "/guides/phase-b-transition.pdf",
    },
  ]);

  const loadMaterials = async () => {
  setIsLoadingMaterials(true);
  setMaterialsError(null);
  
  try {
    const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Loading materials from:', `${API_BASE}/api/students/materials`); // Debug log
    
    const response = await fetch(`${API_BASE}/api/students/materials`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Materials response status:', response.status); // Debug log

    if (response.ok) {
      const data = await response.json();
      console.log('Materials data:', data); // Debug log
      
      setMaterials(data.materials || []);
      setStudentPhase(data.studentPhase || 'A');
      setStudentTeamName(data.teamName);
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('Materials API error:', response.status, errorData);
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }
  } catch (error) {
    console.error('Load materials error:', error);
    setMaterialsError(error.message || 'Failed to load materials');
  } finally {
    setIsLoadingMaterials(false);
  }
};


// Add useEffect to load materials when materials tab is active
useEffect(() => {
  if (activeTab === "materials") {
    loadMaterials();
  }
}, [activeTab]);

  // ===== FACULTY DATA (Updated for Phase A focus) =====
  const faculties = [
    {
      id: 1,
      name: "Dr. Sarah Smith",
      major: "Computer Science",
      capstone: ["A"],
      email: "sarah@uni.edu",
      office: "Tech 203",
      linkedin: "linkedin.com/sarah",
      available: true,
      expertise: ["Machine Learning", "AI", "Research Methodology"],
      currentTeams: 2,
      maxTeams: 4,
      bio: "Specializes in CSE 400 research planning and methodology",
      officeHours: "Mon-Wed 2-4 PM",
      rating: 4.8,
      reviews: 42,
    },
    {
      id: 2,
      name: "Prof. John Doe",
      major: "Software Engineering",
      capstone: ["A", "B"],
      email: "john@uni.edu",
      office: "Eng 305",
      linkedin: "linkedin.com/john",
      available: true,
      expertise: ["Project Planning", "Software Architecture", "Team Management"],
      currentTeams: 3,
      maxTeams: 5,
      bio: "Expert in CSE 400 planning and transition to implementation",
      officeHours: "Thu-Fri 10-12 PM",
      rating: 4.5,
      reviews: 35,
    },
  ];

  // ===== INITIALIZATION EFFECTS =====
  useEffect(() => {
    const initializeProfile = async () => {
      try {
        const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
        const currentStudent = localStorage.getItem("currentStudent");

        if (!currentStudent) {
          navigate("/");
          return;
        }

        const studentData = JSON.parse(currentStudent);

        if (token) {
          try {
            const response = await fetch(`${API_BASE}/api/students/me`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
              const data = await response.json();
              setProfile({
                ...studentData,
                firstName: data.name?.split(' ')[0] || '',
                lastName: data.name?.split(' ').slice(1).join(' ') || '',
                name: data.name || '',
                cgpa: data.cgpa || 0,
                major: data.program || '',
                capstone: "CSE 400",
                email: data.email || '',
                studentId: data.studentId || '',
                completedCredits: data.completedCredits || 0,
                avatar: data.avatar,
                avatarUrl: data.avatar,
                hasSpecialAccess: data.hasSpecialAccess || false,
                isEligible: data.isEligible || false,
                isInTeam: data.isInTeam || false,
                skills: data.skills || []
              });
            } else {
              setProfile({ ...studentData, capstone: "CSE 400" });
            }
          } catch (error) {
            console.error('API fetch failed, using cached data:', error);
            setProfile({ ...studentData, capstone: "CSE 400" });
          }
        } else {
          setProfile({ ...studentData, capstone: "CSE 400" });
        }

        // ✅ NEW: Load join request statuses and rejection status
        loadJoinRequestStatuses();
        await loadTeamRejectionStatus();

        await loadTeamRequests();
        await loadAllTeams();

         await loadMyTeam();

      } catch (error) {
        console.error('Profile initialization error:', error);
        setFetchError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    initializeProfile();
  }, [navigate, API_BASE]);


  useEffect(() => {
    const tutorialShown = localStorage.getItem("tutorialShown");
    if (!tutorialShown) {
      setShowTutorial(true);
    }
  }, []);

  useEffect(() => {
    fetchFacultyAnnouncements();
    const interval = setInterval(fetchFacultyAnnouncements, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === "create-team") {
      fetchAvailableStudents();
    }
  }, [activeTab, currentRequirement]);


  // useEffect(() => {
  //   const requestPollingInterval = setInterval(() => {
  //     if (isLeader && myTeam?._id) {
  //       loadIncomingJoinRequests();
  //     }
  //   }, 5000);

  //   const handleVisibilityChange = () => {
  //     if (!document.hidden) {
  //       if (isLeader && myTeam?._id) loadIncomingJoinRequests();
  //     }
  //   };

  //   document.addEventListener('visibilitychange', handleVisibilityChange);

  //   return () => {
  //     clearInterval(requestPollingInterval);
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  // }, [isLeader, myTeam]);


  // Enhanced polling that responds to user presence
  // const useSmartPolling = () => {
  //   const [isPageVisible, setIsPageVisible] = useState(true);
  //   const [pollingInterval, setPollingInterval] = useState(2000); // 2 seconds when active

  //   useEffect(() => {
  //     const handleVisibilityChange = () => {
  //       const isVisible = !document.hidden;
  //       setIsPageVisible(isVisible);

  //       // Aggressive polling when dashboard is visible, slower when hidden
  //       setPollingInterval(isVisible ? 2000 : 30000); // 2s vs 30s
  //     };

  //     document.addEventListener('visibilitychange', handleVisibilityChange);
  //     return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   }, []);

  //   return { isPageVisible, pollingInterval };
  // };

  // const { isPageVisible, pollingInterval } = useSmartPolling();
  // // Replace your current useEffect with this enhanced version
  // useEffect(() => {
  //   const pollForUpdates = async () => {
  //     try {
  //       // Only poll if user is on dashboard tab and page is visible
  //       if (activeTab === "dashboard" && !document.hidden) {
  //         await loadTeamRequests(); // Your existing function

  //         // Check for any new requests and show immediate notification
  //         const newRequestCount = incomingRequests.length;
  //         if (newRequestCount > 0) {
  //           // Show immediate visual indicator
  //           addNotification("info", `${newRequestCount} new team request(s) received!`);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Polling error:', error);
  //     }
  //   };

  //   // Use dynamic interval based on page visibility
  //   const intervalId = setInterval(pollForUpdates, pollingInterval);

  //   // Also poll immediately when dashboard becomes visible
  //   const handleFocus = () => {
  //     if (activeTab === "dashboard") {
  //       pollForUpdates();
  //     }
  //   };

  //   window.addEventListener('focus', handleFocus);
  //   document.addEventListener('visibilitychange', handleFocus);

  //   return () => {
  //     clearInterval(intervalId);
  //     window.removeEventListener('focus', handleFocus);
  //     document.removeEventListener('visibilitychange', handleFocus);
  //   };
  // }, [activeTab, incomingRequests.length]);

  // ===== LOAD TEAM REQUESTS =====
  // Enhanced loadTeamRequests with immediate detection
  // ✅ FIXED: Enhanced loadTeamRequests with proper deduplication
  // ✅ FIXED: Enhanced loadTeamRequests with immediate ref-based tracking

  // Function to mark all notifications as read when opening panel

  const hasActiveSupervisor = () => {
  return myTeam && myTeam.currentSupervisor && myTeam.currentSupervisor.facultyId;
};

  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem('studentToken');

      // Mark all server notifications as read
      const unreadServerNotifications = serverNotifications.filter(n => !n.read);
      if (unreadServerNotifications.length > 0) {
        for (const notification of unreadServerNotifications) {
          try {
            await fetch(`${API_BASE}/api/notifications/${notification._id}/read`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${token}` }
            });
          } catch (error) {
            console.error('Failed to mark server notification as read:', error);
          }
        }
      }

      // Mark all local notifications as read
      const unreadLocalNotifications = localNotifications.filter(n => !n.read);
      if (unreadLocalNotifications.length > 0) {
        const updatedLocalNotifications = localNotifications.map(n => ({ ...n, read: true }));
        setLocalNotifications(updatedLocalNotifications);
        localStorage.setItem('localNotifications', JSON.stringify(updatedLocalNotifications));
      }

      // Update server notifications state
      setServerNotifications(prev => prev.map(n => ({ ...n, read: true })));

      // Reset notification count
      setNotificationCount(0);

    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };


  const [socket, setSocket] = useState(null);

// Initialize Socket.IO connection
useEffect(() => {
  if (profile._id && !socket) {
    const newSocket = io(API_BASE);
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('user-joined', {
        userId: profile._id,
        userName: profile.name,
        studentId: profile.studentId
      });
    });
    
    // Handle meeting invitation
   newSocket.on('meeting-invitation', (data) => {
      const { meetingId, teamName, startedBy } = data;
      
      if (window.confirm(`${startedBy} started a meeting for team "${teamName}". Do you want to join?`)) {
        joinTeamMeeting(meetingId);
      }
    });
    
    // FIXED: Handle when new user joins meeting
    newSocket.on('user-joined-meeting', async (data) => {
      console.log('New user joined meeting:', data);
      
      // Update participants list
      setMeetingParticipants(prev => {
        const exists = prev.find(p => p.id === data.userId);
        if (!exists) {
          return [...prev, {
            id: data.userId,
            name: data.userName,
            socketId: data.socketId,
            isHost: false,
            joinedAt: new Date()
          }];
        }
        return prev;
      });
      
      // Create peer connection for the new user
      await createPeerConnection(data.socketId, data.userName, true);
    });
    
newSocket.on('existing-participants', async (participants) => {
      console.log('Received existing participants:', participants);
      
      // Update participants list with existing users
      setMeetingParticipants(prev => {
        const newParticipants = [...prev];
        
        participants.forEach(participant => {
          const exists = newParticipants.find(p => p.id === participant.userId);
          if (!exists) {
            newParticipants.push({
              id: participant.userId,
              name: participant.userName,
              socketId: participant.socketId,
              isHost: false,
              joinedAt: new Date(participant.joinedAt)
            });
          }
        });
        
        return newParticipants;
      });
      
      // Create peer connections for all existing participants
      for (const participant of participants) {
        await createPeerConnection(participant.socketId, participant.userName, false);
      }
    });
    
    newSocket.on('offer', async (data) => {
      await handleOffer(data.offer, data.from);
    });
    
    newSocket.on('answer', async (data) => {
      await handleAnswer(data.answer, data.from);
    });
    
    newSocket.on('ice-candidate', async (data) => {
      await handleIceCandidate(data.candidate, data.from);
    });
    
      newSocket.on('user-left-meeting', (data) => {
      console.log('User left meeting:', data);
      
      // Remove from participants list
      setMeetingParticipants(prev => 
        prev.filter(p => p.id !== data.userId)
      );
      
      // Clean up peer connection
      handleUserLeftMeeting(data.userId);
    });
    

    newSocket.on('screen-share-started', (data) => {
      const { userId, userName } = data;
      if (userId !== profile._id) {
        setIsScreenShareActive(true);
        setScreenShareParticipant({
          id: userId,
          name: userName,
          isLocal: false
        });
        showInlineNotification(`${userName} is now sharing their screen`, 'info');
      }
    });

    newSocket.on('screen-share-stopped', (data) => {
      const { userId, userName } = data;
      if (userId !== profile._id) {
        setIsScreenShareActive(false);
        setScreenShareParticipant(null);
        showInlineNotification(`${userName} stopped sharing their screen`, 'info');
      }
    });

    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }
}, [profile._id]);

// WebRTC helper functions
const createPeerConnection = async (socketId, userName, isInitiator) => {
  try {
    const peerConnection = new RTCPeerConnection(rtcConfiguration);
    
    // Add local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }
    
    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => new Map(prev.set(socketId, remoteStream)));
    };
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          to: socketId
        });
      }
    };
    
    setPeerConnections(prev => new Map(prev.set(socketId, peerConnection)));
    
    // Create offer if initiator
    if (isInitiator) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      socket.emit('offer', {
        offer: offer,
        to: socketId
      });
    }
    
  } catch (error) {
    console.error('Error creating peer connection:', error);
  }
};

const handleOffer = async (offer, from) => {
  try {
    const peerConnection = peerConnections.get(from);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(offer);
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      socket.emit('answer', {
        answer: answer,
        to: from
      });
    }
  } catch (error) {
    console.error('Error handling offer:', error);
  }
};

const handleAnswer = async (answer, from) => {
  try {
    const peerConnection = peerConnections.get(from);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
    }
  } catch (error) {
    console.error('Error handling answer:', error);
  }
};

const handleIceCandidate = async (candidate, from) => {
  try {
    const peerConnection = peerConnections.get(from);
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
    }
  } catch (error) {
    console.error('Error handling ICE candidate:', error);
  }
};

const handleUserLeftMeeting = (userId) => {
  console.log('Cleaning up for user who left:', userId);
  
  // Remove from participants
  setMeetingParticipants(prev => prev.filter(p => p.id !== userId));
  
  // Remove remote stream
  setRemoteStreams(prev => {
    const newStreams = new Map(prev);
    // Find and remove stream by userId (you might need to track userId->socketId mapping)
    for (const [socketId, stream] of newStreams) {
      // You'll need to implement a way to map socketId back to userId
      // For now, we'll remove by socketId pattern
      newStreams.delete(socketId);
    }
    return newStreams;
  });
  
  // Close peer connection
  setPeerConnections(prev => {
    const newConnections = new Map(prev);
    // Similar cleanup for peer connections
    for (const [socketId, connection] of newConnections) {
      // Clean up based on your userId->socketId mapping
      connection.close();
      newConnections.delete(socketId);
    }
    return newConnections;
  });
};



// Updated joinTeamMeeting function
// Updated joinTeamMeeting function
const joinTeamMeeting = async (meetingId) => {
  try {
    console.log('Joining meeting:', meetingId);
    
    // Get user media
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    setLocalStream(stream);
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    setCurrentMeetingId(meetingId);
    setIsInTeamMeeting(true);
    setShowMeetingInterface(true);
    setMeetingStartTime(new Date());

    // FIXED: Add yourself to participants list immediately
    const selfParticipant = {
      id: profile._id,
      name: profile.name,
      socketId: socket?.id,
      isHost: false,
      joinedAt: new Date()
    };
    
    setMeetingParticipants([selfParticipant]);

    // Join meeting room via socket
    if (socket) {
      socket.emit('join-meeting', {
        meetingId,
        userId: profile._id,
        userName: profile.name,
        teamId: myTeam._id
      });
    }

    showInlineNotification('Joined team meeting successfully!', 'success');

  } catch (error) {
    console.error('Failed to join meeting:', error);
    showInlineNotification('Failed to join meeting. Please check camera/microphone permissions.', 'error');
  }
};

// Updated leaveTeamMeeting function
const leaveTeamMeeting = async () => {
  try {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Close all peer connections
    peerConnections.forEach(pc => pc.close());
    setPeerConnections(new Map());
    setRemoteStreams(new Map());

    // Leave meeting via socket
    if (socket && currentMeetingId) {
      socket.emit('leave-meeting', {
        meetingId: currentMeetingId,
        userId: profile._id
      });
    }

    // Calculate meeting duration
    const duration = meetingStartTime ? 
      Math.round((new Date() - meetingStartTime) / (1000 * 60)) : 0;

    // Log meeting end
    if (myTeam) {
      const token = localStorage.getItem('studentToken');
      await fetch(`${API_BASE}/api/teams/${myTeam._id}/end-meeting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          meetingId: currentMeetingId,
          duration: duration,
          participantCount: meetingParticipants.length,
          endedBy: profile.name
        })
      });
    }

    // Reset meeting states
    setIsInTeamMeeting(false);
    setCurrentMeetingId(null);
    setMeetingParticipants([]);
    setMeetingStartTime(null);
    setShowMeetingInterface(false);
    setIsScreenSharing(false);
    setIsMicMuted(false);
    setIsCameraOff(false);

    showInlineNotification(
      `Meeting ended. Duration: ${duration} minutes.`, 
      'info'
    );

  } catch (error) {
    console.error('Error leaving meeting:', error);
  }
};

  // const loadTeamRequests = async () => {
  //   try {
  //     const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
  //     if (!token) return;

  //     const response = await fetch(`${API_BASE}/api/teams/requests/incoming`, {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     });

  //     if (response.ok) {
  //       const newRequests = await response.json();

  //       // Get current request IDs from state AND check processed refs immediately
  //       const currentRequestIds = incomingRequests.map(req => req._id);
  //       const actuallyNewRequests = newRequests.filter(req =>
  //         !currentRequestIds.includes(req._id) &&
  //         !processedRequestIdsRef.current.has(req._id) // ✅ IMMEDIATE check using ref
  //       );

  //       if (actuallyNewRequests.length > 0) {
  //         console.log('🔔 Processing genuinely new team requests:', actuallyNewRequests.length);

  //         actuallyNewRequests.forEach(request => {
  //           // ✅ IMMEDIATELY mark as processed using ref (no async delay)
  //           processedRequestIdsRef.current.add(request._id);

  //           // Create unique key for each team invitation
  //           // ✅ CORRECT: Use actual request timestamp
  //           const requestDate = new Date(request.sentDate || request.createdAt || Date.now());
  //           const uniqueKey = `team_invite_${request._id}_${request.senderName}`;
  //           const notificationText = `🔔 ${request.senderName} sent you a team invitation for "${request.teamName}"!`;

  //           // Create notification with actual timestamp
  //           const newNotification = {
  //             id: `local_${request._id}_team_invite`,
  //             type: "info",
  //             text: notificationText,
  //             createdAt: request.sentDate || request.createdAt, // ✅ Use actual request date
  //             date: request.sentDate || request.createdAt,      // ✅ Use actual request date
  //             timestamp: request.sentDate || request.createdAt, // ✅ Use actual request date
  //             read: false,
  //             action: null,
  //             isLocal: true,
  //             notificationKey: uniqueKey
  //           };

  //           // Add directly to state instead of using addNotification
  //           setLocalNotifications(prev => {
  //             const exists = prev.some(n => n.notificationKey === uniqueKey);
  //             return exists ? prev : [...prev, newNotification];
  //           });

  //         });

  //         // Update state for cleanup (async is OK here)
  //         setProcessedRequestIds(prev => {
  //           const newSet = new Set(prev);
  //           actuallyNewRequests.forEach(req => newSet.add(req._id));
  //           return newSet;
  //         });
  //       }

  //       setIncomingRequests(newRequests);
  //     }
  //   } catch (error) {
  //     console.error('Failed to load team requests:', error);
  //   }
  // };



  // Add this to your dashboard tab logic
  // useEffect(() => {
  //   let fastPollingInterval;

  //   if (activeTab === "dashboard" && !document.hidden) {
  //     // Very frequent polling when actively viewing dashboard
  //     fastPollingInterval = setInterval(() => {
  //       loadTeamRequests();
  //     }, 1500); // Poll every 1.5 seconds on dashboard

  //     console.log('⚡ Fast polling enabled for dashboard');
  //   }

  //   return () => {
  //     if (fastPollingInterval) {
  //       clearInterval(fastPollingInterval);
  //       console.log('⏸ Fast polling disabled');
  //     }
  //   };
  // }, [activeTab]);

  // Add visual indicator for real-time updates
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

  useEffect(() => {
    setLastUpdateTime(new Date());
  }, [incomingRequests]);


  const loadMyTeam = async () => {
  try {
    const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/teams/my-team`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const team = await response.json();
      setMyTeam(team);
    } else if (response.status === 404) {
      // User is not in a team
      setMyTeam(null);
    }
  } catch (error) {
    console.error('Failed to load my team:', error);
    setMyTeam(null);
  }
};

  //team load
  const loadAllTeams = async () => {
    try {
      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/teams/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const teams = await response.json();

        // Fetch avatar data for each team member
        const teamsWithAvatars = await Promise.all(teams.map(async (team) => {
          const membersWithAvatars = await Promise.all(team.members.map(async (member) => {
            try {
              const studentResponse = await fetch(`${API_BASE}/api/students/profile/${member.studentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (studentResponse.ok) {
                const studentData = await studentResponse.json();
                return {
                  ...member,
                  avatar: studentData.avatar,
                  avatarUrl: studentData.avatar
                };
              }
            } catch (error) {
              console.log('Could not fetch avatar for', member.name);
            }
            return member;
          }));

          return {
            ...team,
            members: membersWithAvatars
          };
        }));

        setAllTeams(teamsWithAvatars);

      //   const currentStudentId = profile.studentId || JSON.parse(localStorage.getItem('currentStudent') || '{}').studentId;
      //   const studentTeam = teamsWithAvatars.find(team =>
      //     team.members.some(member => member.studentId === currentStudentId)
      //   );

      //   if (studentTeam) {
      //     setMyTeam(studentTeam);
      //   }
      // } else {
      //   // Your existing mock data logic
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  // ===== UTILITY FUNCTIONS =====
  // Enhanced logout function with confirmation
  // Show logout confirmation modal instead of immediate logout
  const handleLogout = () => {
    setShowLogoutConfirmModal(true);
  };

  // Actual logout function that executes after confirmation
  const confirmLogout = () => {
    // Clear all stored data
    localStorage.removeItem("studentToken");
    localStorage.removeItem("currentStudent");
    localStorage.removeItem("token");
    localStorage.removeItem("teamFormData");
    localStorage.removeItem("pendingTeamRequests");
    localStorage.removeItem("tutorialShown");

    // Clear component state
    setProfile({});
    setMyTeam(null);
    setShowLogoutConfirmModal(false);
    // Small delay to show the notification
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  // Cancel logout function
  const cancelLogout = () => {
    setShowLogoutConfirmModal(false);
  };

  // Alternative: Custom logout modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutWithModal = () => {
    setShowLogoutConfirm(true);
  };


  // Add this useEffect to clean up old dismissed notifications
  useEffect(() => {
    const cleanup = () => {
      const currentRequestIds = new Set(incomingJoinRequests.map(req => req._id));

      setDismissedNotificationIds(prev => {
        const filtered = new Set();
        for (const id of prev) {
          // Keep only dismissed IDs that still have corresponding requests
          if (currentRequestIds.has(id)) {
            filtered.add(id);
          }
        }
        return filtered;
      });
    };

    if (incomingJoinRequests.length > 0) {
      cleanup();
    }
  }, [incomingJoinRequests]);

  // Clean up join request statuses when user joins a team
  useEffect(() => {
    if (myTeam) {
      // Clear all join request statuses since user is now in a team
      localStorage.removeItem('joinRequestStatuses');
      setJoinRequestStatus({});
      setPendingJoinRequests({});
      console.log('✅ Cleared join request statuses - user joined team:', myTeam.name);
    }
  }, [myTeam]);


  useEffect(() => {
    if (myTeam) {
      // Don't clear rejection status when joining a team, 
      // but reload it to ensure fresh data
      loadTeamRejectionStatus();
    }
  }, [myTeam?._id]);

  // ✅ Enhanced notification count management
  useEffect(() => {
    // Filter out deleted notifications before counting
    const activeNotifications = [
      ...localNotifications.filter(n => !deletedNotificationIds.has(n.id || n._id)),
      ...serverNotifications.filter(n => !deletedNotificationIds.has(n._id))
    ];

    const unreadCount = activeNotifications.filter(n => !n.read).length;
    setNotificationCount(unreadCount);
  }, [localNotifications, serverNotifications, deletedNotificationIds]);


  // ✅ FIXED: Single consolidated polling system
  // ✅ Updated consolidated polling that waits for dismissed notifications to load
  useEffect(() => {
    let consolidatedPollingInterval;
    let isPolling = false;

    const consolidatedPoll = async () => {
      // Prevent overlapping polls
      if (isPolling) return;
      isPolling = true;

      try {
        // Only poll when page is visible and dismissed notifications are loaded
        if (!document.hidden && dismissedNotificationsLoaded) {
          if (activeTab === "dashboard" || activeTab === "create-team") {
            await loadTeamRequests();
          }

          // Poll for join requests if user is a team leader
          if (isLeader && myTeam?._id) {
            await loadIncomingJoinRequests();
          }
        }
      } catch (error) {
        console.error('Consolidated polling error:', error);
      } finally {
        isPolling = false;
      }
    };

    // ✅ Only start polling after dismissed notifications are loaded
    if (dismissedNotificationsLoaded && (!myTeam || (isLeader && myTeam?._id))) {
      console.log('📡 Starting consolidated polling (dismissed notifications loaded)...');

      // Initial load
      consolidatedPoll();

      // Set up interval
      consolidatedPollingInterval = setInterval(consolidatedPoll, 5000);
    }

    return () => {
      if (consolidatedPollingInterval) {
        clearInterval(consolidatedPollingInterval);
        console.log('⏸ Consolidated polling stopped');
      }
    };
  }, [activeTab, myTeam, isLeader, dismissedNotificationsLoaded]); // ✅ Add dismissedNotificationsLoaded dependency


  const [student, setStudent] = useState(null);

  useEffect(() => {
    const currentStudent = JSON.parse(localStorage.getItem('currentStudent'));
    setStudent(currentStudent);
  }, []);



  // Around line 1200, update the existing useEffect for activeTab:
useEffect(() => {
  if (activeTab === "join-team") {
    // ✅ ENHANCED: Always refresh both statuses when entering join-team tab
    loadJoinRequestStatuses();
    loadTeamRejectionStatus().then(() => {
      console.log('🔄 All request statuses refreshed for join-team tab');
    });
    loadAllTeams();
  }
}, [activeTab]);

  // ✅ Debug logging for dismissed notifications
  useEffect(() => {
    console.log('📋 Dismissed notifications state:', {
      loaded: dismissedNotificationsLoaded,
      dismissedIds: Array.from(dismissedNotificationIds),
      count: dismissedNotificationIds.size
    });
  }, [dismissedNotificationsLoaded, dismissedNotificationIds]);


  const removeNotification = async (indexOrId) => {
    try {
      let notificationToRemove = null;

      if (typeof indexOrId === 'number') {
        notificationToRemove = notifications[indexOrId];
      } else {
        notificationToRemove = notifications.find(n => n.id === indexOrId || n._id === indexOrId);
      }

      if (!notificationToRemove) return;

      // ✅ Add to deleted notifications set for permanent deletion
      const notificationId = notificationToRemove.id || notificationToRemove._id;
      setDeletedNotificationIds(prev => {
        const newSet = new Set(prev);
        newSet.add(notificationId);
        return newSet;
      });

      // Handle server notifications
      if (!notificationToRemove.isLocal && notificationToRemove._id) {
        try {
          const token = localStorage.getItem('studentToken');

          // Mark as read and delete on server
          await fetch(`${API_BASE}/api/notifications/${notificationToRemove._id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          // Remove from local state
          setServerNotifications(prev =>
            prev.filter(n => n._id !== notificationToRemove._id)
          );
        } catch (error) {
          console.error('Failed to delete server notification:', error);
          setServerNotifications(prev =>
            prev.filter(n => n._id !== notificationToRemove._id)
          );
        }
      } else {
        // Handle local notifications - ✅ ENHANCED for permanent deletion
        const updatedLocalNotifications = localNotifications.filter(n =>
          n.id !== notificationToRemove.id && n._id !== notificationToRemove._id
        );

        setLocalNotifications(updatedLocalNotifications);

        // ✅ If this is a team request notification, mark as dismissed
        if (notificationToRemove.relatedRequestId) {
          setDismissedNotificationIds(prev => {
            const newSet = new Set(prev);
            newSet.add(notificationToRemove.relatedRequestId);
            return newSet;
          });
        }

        // ✅ Update localStorage immediately
        if (updatedLocalNotifications.length > 0) {
          localStorage.setItem('localNotifications', JSON.stringify(updatedLocalNotifications));
        } else {
          localStorage.removeItem('localNotifications');
        }
      }

      // ✅ Update notification count immediately
      setTimeout(() => {
        const remainingUnreadCount = notifications.filter(n =>
          !n.read &&
          n.id !== notificationId &&
          n._id !== notificationId
        ).length;
        setNotificationCount(Math.max(0, remainingUnreadCount));
      }, 100);

    } catch (error) {
      console.error('Remove notification error:', error);
    }
  };

  const clearDismissedNotification = (requestId) => {
    setDismissedNotificationIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(requestId);
      return newSet;
    });
  };


  const fetchFinalizedGrades = async () => {
  setIsLoadingGrades(true);
  try {
    const token = localStorage.getItem('studentToken');
    const response = await fetch(`${API_BASE}/api/students/finalized-grades`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      setFinalizedGrades(data.grades || []);
    }
  } catch (error) {
    console.error('Error fetching finalized grades:', error);
  } finally {
    setIsLoadingGrades(false);
  }
};

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';

    try {
      let date;

      // ✅ Handle different date formats
      if (dateString instanceof Date) {
        date = dateString;
      } else if (typeof dateString === 'string') {
        // Try to parse ISO string first, then fallback to general parsing
        date = dateString.includes('T') ? new Date(dateString) : new Date(dateString);
      } else {
        return 'Just now';
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Just now';
      }

      // Calculate time difference
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

      // ✅ Enhanced time formatting
      if (diffInMinutes < 1) {
        return 'Just now';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
      } else if (diffInMinutes < 1440) { // less than 24 hours
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
      } else if (diffInMinutes < 10080) { // less than 7 days
        const days = Math.floor(diffInMinutes / 1440);
        return `${days} day${days === 1 ? '' : 's'} ago`;
      } else {
        // For older dates, show full date
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Just now';
    }
  };



  // ===== STUDENT FETCHING FUNCTIONS =====
  const fetchAvailableStudents = async () => {
    try {
      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
      const currentStudent = profile || JSON.parse(localStorage.getItem('currentStudent') || '{}');

      console.log('Fetching ONLY active students from database...');

      let response = await fetch(`${API_BASE}/api/students/available?status=Active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      let students = [];

      if (response.ok) {
        students = await response.json();
        console.log('Primary endpoint success - Active students only:', students.length);
      } else {
        console.log('Primary endpoint failed, trying fallback with Active filter...');

        response = await fetch(`${API_BASE}/api/students?status=Active&teamStatus=available`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const allStudents = await response.json();
          students = allStudents.filter(student =>
            student._id !== currentStudent._id &&
            student.studentId !== currentStudent.studentId &&
            student.status === 'Active' &&
            !student.teamId &&
            !student.hasTeam
          );
          console.log('Fallback success - Active students only:', students.length);
        } else {
          console.log('Fallback failed, trying admin endpoint with Active filter...');

          response = await fetch(`${API_BASE}/api/admin/students?status=Active`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const adminStudents = await response.json();
            students = adminStudents.filter(student =>
              student._id !== currentStudent._id &&
              student.status === 'Active' &&
              !student.teamId &&
              !student.hasTeam
            );
            console.log('Admin endpoint success - Active students only:', students.length);
          }
        }
      }

      // ✅ UPDATE: Replace hardcoded credit check
      // ✅ FIXED CODE
      const filteredStudents = students.filter(student => {
        const isNotCurrentStudent = student._id !== currentStudent._id &&
          student.studentId !== currentStudent.studentId &&
          student.email !== currentStudent.email;
        const isActiveStatus = student.status === 'Active';
        const isNotInTeam = !student.teamId && !student.hasTeam;
        // ✅ REMOVED: const isEligible = student.completedCredits >= currentRequirement;

        return isNotCurrentStudent && isActiveStatus && isNotInTeam; // ✅ No credit check
      });



      setAvailableStudents(filteredStudents);



    } catch (error) {
      console.error('Failed to fetch active students:', error);
      setAvailableStudents([]);
    }
  };

  // ✅ NEW: Enhanced refresh function that updates config first
  const refreshAvailableStudents = async () => {
    try {
      // First, fetch updated config
      const configResponse = await fetch(`${API_BASE}/api/config`);
      if (configResponse.ok) {
        const config = await configResponse.json();
        setCurrentRequirement(config.requiredCredits || 95);
        console.log('Updated credit requirement:', config.requiredCredits);
      }

      // Then fetch students with updated requirements
      await fetchAvailableStudents();
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  // ===== UPDATED TEAM REQUEST FUNCTIONS (Phase A Only) =====
  const handleSendGroupRequest = async (student) => {
    // Enhanced team membership check
    if (myTeam) {
      showInlineNotification("You cannot send team requests while in a team", "error");
      setActiveTab("join-team");
      return;
    }

    // ✅ NEW: Validate required form fields before sending invitation
    const requiredFields = {
      name: newTeam.name?.trim(),
      major: newTeam.major,
      semester: newTeam.semester,
      projectIdea: newTeam.projectIdea?.trim()
    };

    const missingFields = [];
    if (!requiredFields.name) missingFields.push("Team Name");
    if (!requiredFields.major) missingFields.push("Major");
    if (!requiredFields.semester) missingFields.push("Semester");
    if (!requiredFields.projectIdea) missingFields.push("Project Idea");

    // If any required fields are missing, show inline notification
    if (missingFields.length > 0) {
      const fieldText = missingFields.length === 1 ? "field" : "fields";
      const missingText = missingFields.join(", ");
      showInlineNotification(
        `Please complete the required ${fieldText}: ${missingText} before sending invitations`,
        "error"
      );
      return;
    }

    // ENHANCED: Check if request already sent to this student with popup
    const existingRequest = pendingRequests.find(req => req.studentId === student._id);
    if (existingRequest) {
      showInlineNotification(
        `You have already sent a team request to ${student.name}. Wait for their response or check pending requests.`,
        "info"
      );
      return;
    }

    setSendingInvitationId(student._id);
    try {
      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');

      const requestData = {
        teamName: newTeam.name.trim(),
        teamData: {
          name: newTeam.name.trim(),
          major: newTeam.major,
          semester: newTeam.semester,
          projectIdea: newTeam.projectIdea.trim(),
          capstone: "CSE 400",
          description: newTeam.description || "", // Optional field
          supervisorInterest: newTeam.supervisorInterest || "", // Optional field
          currentPhase: "CSE 400",
          phaseStartDate: new Date().toISOString(),
          maxMembers: 4
        },
        targetStudentId: student._id,
        targetStudentName: student.name,
        targetStudentEmail: student.email,
        senderName: profile.name || `${profile.firstName} ${profile.lastName}`,
        senderStudentId: profile.studentId,
        senderEmail: profile.email,
        message: `${profile.name || `${profile.firstName} ${profile.lastName}`} has invited you to join CSE 400 team "${newTeam.name.trim()}"`,
        requestType: 'team_invitation',
        status: 'pending',
        sentDate: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE}/api/teams/send-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const responseData = await response.json();

      if (response.ok) {
        // Create new request object with persistent data
        const newRequest = {
          id: responseData.requestId || Date.now(),
          studentId: student._id,
          studentName: student.name,
          studentIdNumber: student.studentId,
          teamName: newTeam.name.trim(),
          status: 'pending',
          sentDate: new Date().toISOString(),
          studentEmail: student.email,
          studentProgram: student.program,
          studentCredits: student.completedCredits,
          teamData: { ...newTeam }
        };

        // Update state and localStorage
        const updatedRequests = [...pendingRequests, newRequest];
        setPendingRequests(updatedRequests);
        localStorage.setItem('pendingTeamRequests', JSON.stringify(updatedRequests));

        showInlineNotification(
          `CSE 400 team invitation sent successfully to ${student.name}!`,
          "success"
        );

        // Refresh team requests after a short delay
        setTimeout(() => {
          loadTeamRequests();
        }, 1000);

      } else {
        // Handle backend duplicate detection
        if (responseData.action === 'duplicate_request') {
          showInlineNotification(
            `You have already sent a request to ${student.name}. Wait for their confirmation.`,
            "info"
          );
          return;
        }

        if (responseData.action === 'redirect_to_my_team') {
          setActiveTab("join-team");
          return;
        }

        showInlineNotification(
          responseData.message || "Failed to send invitation",
          "error"
        );
      }
    } catch (error) {
      console.error('Request error:', error);
      showInlineNotification(
        "Network error: Failed to send invitation. Please try again.",
        "error"
      );
    }
    finally {
      // Reset loading state
      setSendingInvitationId(null);
    }
  };


  const handleAcceptJoinRequest = async (requestId) => {
    setAcceptingRequestId(requestId); // start loading for this request

    try {
      const token = localStorage.getItem('studentToken');
      const res = await fetch(`${API_BASE}/api/teams/${myTeam._id}/handle-join-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ joinRequestId: requestId, status: 'accepted' })
      });
      if (res.ok) {
        const { team } = await res.json();
        setMyTeam(team);
        loadIncomingJoinRequests();
        clearDismissedNotification(requestId); // ✅ Clear from dismissed list
        addNotification('success', 'Member added to the team');
      } else {
        const err = await res.json();
        alert(err.message);
      }
    }
    catch (error) {
      console.error(error);
    } finally {
      setAcceptingRequestId(null); // stop loading
    }
  };



  // ✅ FIXED: Enhanced loadIncomingJoinRequests with deduplication
  // ✅ FIXED: Enhanced loadIncomingJoinRequests with immediate ref-based tracking
  const loadIncomingJoinRequests = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      if (!token || !myTeam?._id || !isLeader) {
        setIncomingJoinRequests([]);
        return;
      }

      // ✅ Don't proceed if dismissed notifications haven't been loaded yet
      if (!dismissedNotificationsLoaded) {
        console.log('⏳ Waiting for dismissed notifications to load...');
        return;
      }

      const res = await fetch(`${API_BASE}/api/teams/${myTeam._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error(`status ${res.status}`);
      const team = await res.json();

      const pending = (team.joinRequests || [])
        .filter(r => r.status === 'pending')
        .map(r => ({
          _id: r._id,
          id: r._id,
          studentId: r.studentId,
          studentName: r.studentName,
          studentIdNumber: r.studentIdNumber,
          completedCredits: r.completedCredits,
          program: r.program,
          avatar: r.avatar || null,
          message: r.message,
          requestDate: r.requestDate
        }));

      // ✅ Enhanced filtering with proper dismissed tracking
      const currentIds = incomingJoinRequests.map(req => req._id);
      const joinRequestKey = req => `join_${req._id}`;
      const newJoinRequests = pending.filter(req => {
        const isNotInCurrentList = !currentIds.includes(req._id);
        const isNotProcessed = !processedRequestIdsRef.current.has(joinRequestKey(req));
        const isNotDismissed = !dismissedNotificationIds.has(req._id);

        console.log(`Request ${req._id}: inList=${!isNotInCurrentList}, processed=${!isNotProcessed}, dismissed=${!isNotDismissed}`);

        return isNotInCurrentList && isNotProcessed && isNotDismissed;
      });

      if (newJoinRequests.length > 0) {
        console.log('🔔 Creating notifications for genuinely new requests:', newJoinRequests.length);

        newJoinRequests.forEach(request => {
          // ✅ IMMEDIATELY mark as processed using ref
          processedRequestIdsRef.current.add(joinRequestKey(request));

          // Create unique key for each join request
          const uniqueKey = `join_request_${request._id}_${request.studentName}_${myTeam._id}`;
          const notificationText = `🔔 ${request.studentName} wants to join your team "${myTeam.name}"!`;

          // Create notification with actual timestamp
          const newNotification = {
            id: `local_${request._id}_join_request`,
            type: "info",
            text: notificationText,
            createdAt: request.requestDate || request.createdAt,
            date: request.requestDate || request.createdAt,
            timestamp: request.requestDate || request.createdAt,
            read: false,
            action: null,
            isLocal: true,
            notificationKey: uniqueKey,
            relatedRequestId: request._id // ✅ Track which request this relates to
          };

          // Add directly to state
          setLocalNotifications(prev => {
            const exists = prev.some(n => n.notificationKey === uniqueKey);
            return exists ? prev : [...prev, newNotification];
          });
        });

        // Update state for cleanup
        setProcessedRequestIds(prev => {
          const newSet = new Set(prev);
          newJoinRequests.forEach(req => newSet.add(joinRequestKey(req)));
          return newSet;
        });
      } else {
        console.log('✅ No new join requests to notify about');
      }

      setIncomingJoinRequests(pending);
    } catch (err) {
      console.error('loadIncomingJoinRequests error:', err);
      setIncomingJoinRequests([]);
    }
  };



  // ✅ NEW: Clean up processed IDs when user context changes
  useEffect(() => {
    if (myTeam) {
      // Clear tracking when user joins a team
      setShownNotifications(new Set());
      setNotificationCache(new Map());
      setProcessedRequestIds(new Set());
    }
  }, [myTeam]);

  // ✅ NEW: Periodic cleanup of old tracking data
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const fiveMinutesAgo = Date.now() - 300000;

      // Clean up old cache entries
      setNotificationCache(prev => {
        const newMap = new Map();
        for (const [key, timestamp] of prev.entries()) {
          if (timestamp > fiveMinutesAgo) {
            newMap.set(key, timestamp);
          }
        }
        return newMap;
      });

      console.log('🧹 Cleaned up old notification tracking data');
    }, 300000); // Every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, []);



  const handleDeclineJoinRequest = async (requestId) => {
    setDecliningRequestId(requestId); // start loading for this request
    try {
      const token = localStorage.getItem('studentToken');
      await fetch(`${API_BASE}/api/teams/${myTeam._id}/handle-join-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ joinRequestId: requestId, status: 'rejected' })
      });
      loadIncomingJoinRequests();
      clearDismissedNotification(requestId); // ✅ Clear from dismissed list
    }
    catch (error) {
      console.error(error);
    } finally {
      setDecliningRequestId(null); // stop loading
    }
  };

  // Add this with your other state declarations
  const [notificationCount, setNotificationCount] = useState(0);

  // Add this useEffect to update count when notifications change
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    setNotificationCount(unreadCount);
  }, [notifications, localNotifications, serverNotifications]);

  // Add these state variables
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Add this with your other state declarations

  // Load dismissed notifications from localStorage on mount
  // Load dismissed notifications from localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissedNotifications');
    if (dismissed) {
      try {
        const dismissedArray = JSON.parse(dismissed);
        setDismissedNotificationIds(new Set(dismissedArray));
      } catch (error) {
        console.error('Error loading dismissed notifications:', error);
      }
    }
    // ✅ Mark as loaded regardless of whether data exists
    setDismissedNotificationsLoaded(true);
  }, []);


  // Save dismissed notifications to localStorage
  useEffect(() => {
    if (dismissedNotificationIds.size > 0) {
      localStorage.setItem('dismissedNotifications', JSON.stringify(Array.from(dismissedNotificationIds)));
    }
  }, [dismissedNotificationIds]);



  // Load sent supervision requests from localStorage
  useEffect(() => {
    const savedRequests = localStorage.getItem('sentSupervisionRequests');
    if (savedRequests) {
      try {
        const requestArray = JSON.parse(savedRequests);
        setSentSupervisionRequests(new Set(requestArray));
      } catch (error) {
        console.error('Error loading sent supervision requests:', error);
      }
    }
  }, []);

  // Save sent requests to localStorage when state changes
  useEffect(() => {
    if (sentSupervisionRequests.size > 0) {
      localStorage.setItem('sentSupervisionRequests',
        JSON.stringify(Array.from(sentSupervisionRequests)));
    }
  }, [sentSupervisionRequests]);

  const markNotificationAsRead = async (indexOrId) => {
    try {
      let notificationToMark = null;

      if (typeof indexOrId === 'number') {
        notificationToMark = notifications[indexOrId];
      } else {
        notificationToMark = notifications.find(n => n.id === indexOrId || n._id === indexOrId);
      }

      if (!notificationToMark || notificationToMark.read) return;

      // Handle server notifications
      if (!notificationToMark.isLocal && notificationToMark._id) {
        try {
          const token = localStorage.getItem('studentToken');

          const response = await fetch(`${API_BASE}/api/notifications/${notificationToMark._id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            setServerNotifications(prev =>
              prev.map(n =>
                n._id === notificationToMark._id
                  ? { ...n, read: true }
                  : n
              )
            );
          }
        } catch (error) {
          console.error('Failed to mark server notification as read:', error);
        }
      } else {
        // Handle local notifications
        const updatedLocalNotifications = localNotifications.map(n =>
          (n.id === notificationToMark.id || n._id === notificationToMark._id)
            ? { ...n, read: true }
            : n
        );

        setLocalNotifications(updatedLocalNotifications);
        localStorage.setItem('localNotifications', JSON.stringify(updatedLocalNotifications));
      }

      // ✅ Immediate count update
      setNotificationCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark notification as read error:', error);
    }
  };



  // Add this useEffect in StudentDashboard.js to listen for rejection updates
  useEffect(() => {
    // Load server notifications and check for rejections
    const checkForRejections = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const response = await fetch(`${API_BASE}/api/notifications/my-notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          const recentRejections = data.notifications.filter(notif =>
            notif.type === 'team_rejected' &&
            !notif.read &&
            (Date.now() - new Date(notif.createdAt).getTime()) < 300000 // Last 5 minutes
          );

          // Clear status for recently rejected teams
          recentRejections.forEach(rejection => {
            if (rejection.data?.teamId) {
              clearRejectedRequestStatus(rejection.data.teamId);
            }
          });
        }
      } catch (error) {
        console.error('Error checking rejections:', error);
      }
    };

    // Check when component mounts and when notifications change
    checkForRejections();
  }, [serverNotifications]);

  // Load notifications function

  // Mark notification as read
  // const markNotificationAsRead = async (notificationId) => {
  //   try {
  //     const token = localStorage.getItem('studentToken');
  //     await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
  //       method: 'PUT',
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     });

  //     // Update local state
  //     setNotifications(prev =>
  //       prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
  //     );
  //     setUnreadNotificationCount(prev => Math.max(0, prev - 1));
  //   } catch (error) {
  //     console.error('Mark notification read error:', error);
  //   }
  // };


  // In StudentDashboard.js, around line 3800, update the handleAcceptRequest function
  const handleAcceptRequest = async (requestId) => {
    setAcceptingInvitationId(requestId);
    try {
      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/api/teams/accept-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId })
      });

      const data = await response.json();

      if (response.ok) {

         if (!data.team) {
        return;
      }

        // Filter out the accepted request
        setIncomingRequests(prev => prev.filter(req => req._id !== requestId));

        // Set the team (either new or existing)
        setMyTeam(data.team);

        loadAllTeams();
  
  // Update user's team data
  loadMyTeam();
        // Update all teams list
       setAllTeams(prev => {
        // Filter out any undefined elements first
        const validTeams = prev.filter(t => t && t._id);
        
        const existingTeamIndex = validTeams.findIndex(t => 
          t._id === data.team._id
        );
        
        if (existingTeamIndex >= 0) {
          const updatedTeams = [...validTeams];
          updatedTeams[existingTeamIndex] = data.team;
          return updatedTeams;
        } else {
          return [...validTeams, data.team];
        }
      });

        // ✅ NEW: Clear all sent invitations when joining a team
        console.log('🧹 Clearing sent invitations - user joined a team');
        setPendingRequests([]);
        localStorage.removeItem('pendingTeamRequests');

        // ✅ NEW: Show notification about canceled invitations
        if (data.cancelledRequests && data.cancelledRequests > 0) {
          setTimeout(() => {
            addNotification(
              "info",
              `Your ${data.cancelledRequests} pending invitation${data.cancelledRequests > 1 ? 's have' : ' has'} been automatically canceled since you joined a team.`
            );
          }, 2000);
        }

        const teamName = data.team?.name || 'Unknown Team';
      const memberCount = data.memberCount || data.team?.members?.length || 0;
        // Enhanced success message with member count
        const successMessage = data.isTeamFull
          ? `Successfully joined team "${data.team.name}"! Team is now complete (4/4 members).`
          : `Successfully joined team "${data.team.name}"! (${data.memberCount}/4 members)`;

        addNotification("success", successMessage);
        setActiveTab("join-team");

      } else {
        // Handle team full scenario
        if (data.action === 'team_full') {
          addNotification("error", `❌ ${data.message}`);

          // Remove this request since team is full
          setIncomingRequests(prev => prev.filter(req => req._id !== requestId));

          // Show detailed error message
          setTimeout(() => {
            addNotification("info", `The team "${data.teamName}" has reached maximum capacity. Try joining other available teams.`);
          }, 2000);
        } else {
          addNotification("error", data.message || "Failed to accept request");
        }
      }
    } catch (error) {
      console.error('Accept request error:', error);
      addNotification("error", "Network error: Failed to accept request");
    } finally {
      setAcceptingInvitationId(null);
    }
  };


  const handleRejectRequest = async (requestId) => {
    setDecliningInvitationId(requestId);
    try {
      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/teams/reject-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId })
      });

      const data = await response.json();

      if (response.ok) {
        const request = incomingRequests.find(req => req._id === requestId);
        setIncomingRequests(prev => prev.filter(req => req._id !== requestId));
        addNotification("info", `Declined invitation to join "${request?.teamName || 'team'}"`);
      }
      else {
        alert("Failed to reject request");
      }
    } catch (error) {
      console.error('Reject request error:', error);
    } finally {
      setDecliningInvitationId(null); // stop loading
    }
  };
  const handleRefreshRequests = () => {
    console.log('Manually refreshing team requests...');
    loadTeamRequests();
  };


  // ===== JOIN REQUEST PERSISTENCE FUNCTIONS =====
  const saveJoinRequestStatus = (teamId, status, requestId = null) => {
    const statusData = {
      status: status, // 'pending', 'accepted', 'rejected'
      requestId: requestId,
      timestamp: Date.now()
    };

    const currentStatuses = JSON.parse(localStorage.getItem('joinRequestStatuses') || '{}');
    currentStatuses[teamId] = statusData;
    localStorage.setItem('joinRequestStatuses', JSON.stringify(currentStatuses));

    setJoinRequestStatus(prev => ({
      ...prev,
      [teamId]: statusData
    }));
  };

  const loadJoinRequestStatuses = () => {
    try {
      const saved = localStorage.getItem('joinRequestStatuses');
      if (saved) {
        const statuses = JSON.parse(saved);

        // ✅ Filter out rejected/old statuses
        const validStatuses = {};
        Object.keys(statuses).forEach(teamId => {
          const status = statuses[teamId];
          // Only keep pending statuses that are less than 24 hours old
          if (status.status === 'pending' && (Date.now() - status.timestamp) < 86400000) {
            validStatuses[teamId] = status;
          }
        });

        setJoinRequestStatus(validStatuses);
        // Update localStorage with cleaned data
        localStorage.setItem('joinRequestStatuses', JSON.stringify(validStatuses));
        return validStatuses;
      }
    } catch (error) {
      console.error('Error loading join request statuses:', error);
    }
    return {};
  };

  // Add this function in StudentDashboard.js
  const clearRejectedRequestStatus = (teamId) => {
    // Clear from joinRequestStatus
    setJoinRequestStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[teamId];
      return newStatus;
    });

    // Clear from pendingJoinRequests
    setPendingJoinRequests(prev => {
      const newStatus = { ...prev };
      delete newStatus[teamId];
      return newStatus;
    });

    // Update localStorage
    const currentStatuses = JSON.parse(localStorage.getItem('joinRequestStatuses') || '{}');
    delete currentStatuses[teamId];
    localStorage.setItem('joinRequestStatuses', JSON.stringify(currentStatuses));
  };

  // Around line 2100 in StudentDashboard.js, update this function:
const loadTeamRejectionStatus = async () => {
  try {
    const token = localStorage.getItem('studentToken');
    const response = await fetch(`${API_BASE}/api/teams/rejection-status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const rejectionData = await response.json();

      // ✅ NEW: Clear pending statuses for teams that have rejected the student
      const currentStatuses = JSON.parse(localStorage.getItem('joinRequestStatuses') || '{}');
      let statusesChanged = false;

      Object.keys(rejectionData).forEach(teamId => {
        if (currentStatuses[teamId]) {
          delete currentStatuses[teamId];
          statusesChanged = true;
          console.log(`🧹 Cleared conflicting pending status for team ${teamId}`);
        }
      });

      if (statusesChanged) {
        localStorage.setItem('joinRequestStatuses', JSON.stringify(currentStatuses));
        setJoinRequestStatus(currentStatuses);
      }

      // Process rejection data
      const processedRejectionData = {};
      Object.keys(rejectionData).forEach(teamId => {
        const data = rejectionData[teamId];
        processedRejectionData[teamId] = {
          ...data,
          isBlocked: data.rejectionCount >= 3,
          canRequest: data.rejectionCount < 3
        };
      });

      setTeamRejectionStatus(processedRejectionData);
      console.log('✅ Rejection status loaded and pending conflicts cleared:', processedRejectionData);
    }
  } catch (error) {
    console.error('Error loading rejection status:', error);
  }
};



  // ===== FACULTY AND ANNOUNCEMENTS =====
  const fetchFacultyAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/announcements/audience/Computer%20Science`);
      if (response.ok) {
        const data = await response.json();
        setFacultyAnnouncements(data);
      }
    } catch (error) {
      console.error("Failed to fetch faculty announcements:", error);
    }
  };

  const handleDismiss = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/announcements/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('studentToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: "Dismissed" }),
      });

      if (response.ok) {
        setFacultyAnnouncements(prev => prev.filter(item => item._id !== id));
      }
    }
    catch (error) {
      console.error("Error dismissing announcement:", error);
      setFacultyAnnouncements(prev => prev.filter(item => item._id !== id));
    }
  };

  // ===== UPDATED TEAM CREATION (Phase A Only) =====
  const handleCreateTeam = () => {
    if (!newTeam.name || newTeam.name.trim() === "") {
      return;
    }

    const team = {
      ...newTeam,
      id: teams.length + 1,
      name: newTeam.name.trim(),
      capstone: "CSE 400",
      currentPhase: "CSE 400",
      phaseStartDate: new Date().toISOString(),
      members: [{
        ...profile,
        name: profile.name || `${profile.firstName} ${profile.lastName}`,
        role: "Team Lead"
      }],
      supervisor: null,
      requests: [],
      chat: [],
      files: [],
      milestones: [],
    };

    setTeams(prev => [...prev, team]);
    setActiveTab("chat");
    setSelectedTeam(team);
  };

  const handleJoinTeam = async (team) => {
  setJoiningTeamId(team._id);
  try {
    // Check rejection status first
    const rejectionInfo = teamRejectionStatus[team._id];
    
    // Check if blocked due to 3 rejections
    if (rejectionInfo && rejectionInfo.rejectionCount >= 3) {
      addNotification("error", `You have been blocked from this team due to 3 rejections (${rejectionInfo.rejectionCount}/3)`);
      return;
    }

    // Check for existing pending request
    const localStatus = joinRequestStatus[team._id];
    if (localStatus && localStatus.status === 'pending') {
      addNotification("info", "Request already sent. Please wait for team leader's response.");
      return;
    }

    const res = await fetch(`${API_BASE}/api/teams/${team._id}/join-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('studentToken')}`
      },
      body: JSON.stringify({ message: `${profile.name} requests to join` })
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ FIXED: Save request status immediately
      const requestData = {
        status: 'pending',
        requestId: data.request._id,
        timestamp: Date.now(),
        teamName: team.name
      };

      // Update localStorage
      const currentStatuses = JSON.parse(localStorage.getItem('joinRequestStatuses') || '{}');
      currentStatuses[team._id] = requestData;
      localStorage.setItem('joinRequestStatuses', JSON.stringify(currentStatuses));

      // Update state immediately for UI
      setJoinRequestStatus(prev => ({
        ...prev,
        [team._id]: requestData
      }));

      addNotification("success", `Join request sent to team "${team.name}"!`);
      console.log(`✅ Join request sent to team ${team.name}, status saved locally`);

    } else {
      // Handle specific error responses
      if (data.action === 'rejection_limit_reached') {
        // Update rejection status immediately
        setTeamRejectionStatus(prev => ({
          ...prev,
          [team._id]: {
            rejectionCount: 3,
            canRequest: false,
            lastRejectedDate: new Date(),
            isBlocked: true
          }
        }));
        addNotification("error", data.message);
      } else {
        addNotification("error", data.message || "Failed to send join request");
      }
    }

  } catch (err) {
    console.error('Join team error:', err);
    addNotification("error", "Network error: Failed to send join request");
  } finally {
    setJoiningTeamId(null);
  }
};



  const handleCancelRequest = async (requestId, studentName) => {
    if (!window.confirm(`Are you sure you want to cancel the invitation sent to ${studentName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/api/teams/cancel-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId })
      });

      const data = await response.json();

      if (response.ok) {
        addNotification("success", `Invitation to ${studentName} cancelled successfully`);

        // ✅ NEW: Refresh from server instead of just removing from local state
        await loadSentRequests();
      } else {
        addNotification("error", data.message || "Failed to cancel request");
      }
    } catch (error) {
      console.error('Cancel request error:', error);
      addNotification("error", "Network error: Failed to cancel request");
    }
  };


  const sendFacultyRequest = (facultyId) => {
    if (facultyRequests.filter((r) => r.team === selectedTeam?.id).length < 3) {
      const request = {
        id: facultyRequests.length + 1,
        facultyId,
        date: new Date(),
        status: "pending",
        team: selectedTeam?.id,
      };
      setFacultyRequests([...facultyRequests, request]);
      addNotification(
        "info",
        `Supervision request sent to ${faculties.find((f) => f.id === facultyId).name}`
      );
    }
  };

  // ===== MATERIALS AND FILES =====
  // Replace the existing handleDownload function with this:
const handleDownload = async (materialId, fileName) => {
  try {
    const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
    
    // Create a temporary link to trigger download
    const downloadUrl = `${API_BASE}/api/materials/${materialId}/download`;
    
    // Create a hidden link element and click it
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || 'download';
    
    // Add authorization header by opening in new tab if direct download fails
    try {
      const response = await fetch(downloadUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        // If we can fetch it, create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback: open in new tab
        window.open(downloadUrl, '_blank');
      }
    } catch (fetchError) {
      // Final fallback: direct link
      window.open(downloadUrl, '_blank');
    }
    
    showInlineNotification(`Downloading ${fileName}...`, 'success');
  } catch (error) {
    console.error('Download error:', error);
    showInlineNotification('Download failed. Please try again.', 'error');
  }
};


  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newFile = {
        id: files.length + 1,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        uploadedBy: profile,
        timestamp: new Date(),
      };
      setFiles([...files, newFile]);
    }
  };

  // ===== UPDATED AVATAR UPLOAD FUNCTION WITH BASE64 =====
  // Add this function to your StudentDashboard component
  // Add this function to your StudentDashboard component
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return;
    }

    try {
      // Convert file to base64
      const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });

      const base64Image = await toBase64(file);
      console.log('Uploading avatar...');

      const response = await fetch(`${API_BASE}/api/students/avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('studentToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ avatar: base64Image })
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed. Please try again.');
      }

      // Update profile state with new avatar
      setProfile(prev => ({
        ...prev,
        avatar: base64Image,
        avatarUrl: base64Image
      }));
    }
    catch (err) {
      console.error('Avatar upload error:', err);
    }
  };



  // Add these functions in your StudentDashboard component

// Start Team Meeting
// Updated startTeamMeeting function
const startTeamMeeting = async () => {
  if (!myTeam || !myTeam._id) {
    showInlineNotification('You must be in a team to start a meeting', 'error');
    return;
  }

  try {
    const meetingId = `team-${myTeam._id}-${uuidv4()}`;
    setCurrentMeetingId(meetingId);
    setMeetingStartTime(new Date());
    setIsInTeamMeeting(true);
    setShowMeetingInterface(true);

    // Get user media
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    setLocalStream(stream);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    // FIXED: Add yourself as host to participants
    const hostParticipant = {
      id: profile._id,
      name: profile.name,
      socketId: socket?.id,
      isHost: true,
      joinedAt: new Date()
    };
    
    setMeetingParticipants([hostParticipant]);

    // Join the meeting room first
    if (socket) {
      socket.emit('join-meeting', {
        meetingId,
        userId: profile._id,
        userName: profile.name,
        teamId: myTeam._id
      });
    }

    // Send meeting notification to all team members
    const token = localStorage.getItem('studentToken');
    await fetch(`${API_BASE}/api/teams/${myTeam._id}/start-meeting`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        meetingId,
        startedBy: profile.name,
        startedByStudentId: profile.studentId
      })
    });

    showInlineNotification('Team meeting started! Other members will be notified.', 'success');

  } catch (error) {
    console.error('Failed to start meeting:', error);
    showInlineNotification('Failed to start meeting. Please check camera/microphone permissions.', 'error');
  }
};


// Toggle Microphone
const toggleMicrophone = () => {
  if (localStream) {
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicMuted(!audioTrack.enabled);
    }
  }
};

// Toggle Camera
const toggleCamera = () => {
  if (localStream) {
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOff(!videoTrack.enabled);
    }
  }
};

  // ===== MESSAGING =====
  const loadChatMessages = async (isRefresh = false) => {
    if (!myTeam?._id) return;

    try {
      // Only show loading spinner on initial load, not on refresh
      if (!isRefresh) {
        setIsLoadingMessages(true);
      }
      setChatError(null);

      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/teams/${myTeam._id}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        // Mark initial load as complete
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      } else {
        const error = await response.json();
        setChatError(error.message || 'Failed to load messages');
      }
    } catch (error) {
      console.error('Load messages error:', error);
      setChatError('Network error: Failed to load messages');
    } finally {
      if (!isRefresh) {
        setIsLoadingMessages(false);
      }
    }
  };

  // Send a new message
  const handleSendMessage = async () => {
    if (!message.trim() && !selectedFile) return;
    if (!myTeam?._id || isSendingMessage) return;

    try {
      setIsSendingMessage(true);
      setChatError(null);

      let fileData = null;

      // Upload file if selected
      if (selectedFile) {
        fileData = await uploadFile(selectedFile, myTeam._id);
      }

      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/teams/${myTeam._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: message.trim(),
          messageType: fileData ? (fileData.resource_type === 'image' ? 'image' : 'file') : 'text',
          file: fileData
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setMessage(""); // Clear input
        setSelectedFile(null); // Clear selected file

        // Scroll to bottom after sending
        setTimeout(() => {
          const chatContainer = document.querySelector('.chat-messages');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
      } else {
        const error = await response.json();
        setChatError(error.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      setChatError('Network error: Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };



  // Add call state to main component


  // Modified polling with call-aware intervals
  // useEffect(() => {
  //   const requestPollingInterval = setInterval(() => {
  //     if (isLeader && myTeam?._id) {
  //       loadIncomingJoinRequests();
  //     }
  //   }, isInCall ? 30000 : 5000); // ✅ Slower polling during calls

  //   return () => clearInterval(requestPollingInterval);
  // }, [isLeader, myTeam, isInCall]); // ✅ Add isInCall dependency

  // Auto-refresh messages when in chat tab
  useEffect(() => {
    let chatInterval;

    if (activeTab === "chat" && myTeam?._id) {
      // Load messages immediately (initial load)
      loadChatMessages(false);

      // Poll for new messages every 3 seconds (refresh, no loading spinner)
      chatInterval = setInterval(() => {
        loadChatMessages(true); // Pass true to indicate this is a refresh
      }, 3000);
    }

    // Reset initial load state when switching teams or tabs
    if (activeTab !== "chat" || !myTeam?._id) {
      setIsInitialLoad(true);
    }

    return () => {
      if (chatInterval) {
        clearInterval(chatInterval);
      }
    };
  }, [activeTab, myTeam?._id]);

  // Helper function to format message timestamp
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Render avatar for messages
const renderMessageAvatar = (message, size = 40) => {
  // Handle faculty messages
  if (message.senderType === 'faculty') {
    return (
      <div className="message-avatar-wrapper faculty-avatar" style={{ width: size, height: size }}>
        {message.senderInfo?.profilePicture || message.senderInfo?.avatar ? (
          <img
            src={message.senderInfo.profilePicture || message.senderInfo.avatar}
            alt={`${message.senderName}'s avatar`}
            className="message-avatar-img faculty"
            style={{ width: size, height: size }}
            onError={e => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="message-avatar-fallback faculty"
          style={{
            display: (message.senderInfo?.profilePicture || message.senderInfo?.avatar) ? 'none' : 'flex',
            width: size,
            height: size,
            fontSize: size > 40 ? '1rem' : '0.875rem',
            backgroundColor: '#8b5a3c',
            color: 'white'
          }}
        >
          <FaChalkboardTeacher />
        </div>
      </div>
    );
  } else {
    // Enhanced student avatar logic
    let avatarSrc = null;
    
    // Try multiple sources for avatar
    if (message.senderId?.avatar) {
      avatarSrc = message.senderId.avatar;
    } else if (message.senderInfo?.avatar) {
      avatarSrc = message.senderInfo.avatar;
    } else if (message.senderInfo?.avatarUrl) {
      avatarSrc = message.senderInfo.avatarUrl;
    } else if (myTeam?.members) {
      // Find avatar from team members
      const teamMember = myTeam.members.find(member => 
        member.studentId === message.senderIdentifier || 
        member.name === message.senderName ||
        member._id === message.senderId
      );
      if (teamMember?.avatar || teamMember?.avatarUrl) {
        avatarSrc = teamMember.avatar || teamMember.avatarUrl;
      }
    }

    return (
      <div className="message-avatar-wrapper student" style={{ width: size, height: size }}>
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={`${message.senderName}'s avatar`}
            className="message-avatar-img"
            style={{ width: size, height: size }}
            onError={e => {
              console.log(`Failed to load avatar for ${message.senderName}`);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="message-avatar-fallback"
          style={{
            display: avatarSrc ? 'none' : 'flex',
            width: size,
            height: size,
            fontSize: size > 40 ? '1rem' : '0.875rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            fontWeight: '600'
          }}
        >
          {message.senderName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    );
  }
};

  // ===== TUTORIAL =====
  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem("tutorialShown", "true");
  };

  // ===== FILTERING FUNCTIONS =====
  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMajor = selectedMajor ? team.major === selectedMajor : true;
    const matchesCapstone = selectedCapstone ? team.capstone === selectedCapstone : true;

    return matchesSearch && matchesMajor && matchesCapstone;
  });

  // ===== MATERIALS FILTERING =====
// Replace the getFilteredMaterials function with this:
const getFilteredMaterials = () => {
  return materials.filter(material => {
    const matchesSearch = materialSearch === "" ||
      material.title.toLowerCase().includes(materialSearch.toLowerCase()) ||
      (material.description && material.description.toLowerCase().includes(materialSearch.toLowerCase()));
    
    const matchesCategory = materialFilter === "" || 
      (material.category && material.category === materialFilter);
    
    return matchesSearch && matchesCategory;
  });
};

// Get unique categories for filter dropdown
const getAvailableCategories = () => {
  const categories = [...new Set(materials.map(m => m.category).filter(Boolean))];
  return categories.sort();
};


  // ✅ UPDATE: Replace hardcoded credit check in filtering
  // ✅ FIXED CODE
  const filteredAvailableStudents = availableStudents.filter(student => {
    const matchesSearch = memberSearchQuery === "" ||
      student.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(memberSearchQuery.toLowerCase());
    const matchesMajor = memberFilterMajor === "" || student.program === memberFilterMajor;
    const isActiveStatus = student.status === 'Active';
    const isAvailableForTeam = !student.teamId && !student.hasTeam;
    // ✅ REMOVED: const isEligibleForCapstone = student.completedCredits >= currentRequirement;

    return matchesSearch && matchesMajor && isActiveStatus && isAvailableForTeam; // ✅ No credit check
  });



  const filteredAllTeams = allTeams.filter(team => {
    const matchesSearch = searchQuery === "" ||
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.projectIdea?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMajor = selectedMajor === "" || team.major === selectedMajor;

    // Show all teams, but we'll handle join logic in the UI
    return matchesSearch && matchesMajor;
  });

  // ===== LOADING SCREEN =====
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <span style={{ marginLeft: "1rem" }}>Loading dashboard...</span>
      </div>
    );
  }



  const handleShowInlinePasswordForm = () => {
    setShowInlinePasswordForm(true);
    setInlinePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setInlinePasswordErrors({});
  };

  const handleCancelInlinePasswordChange = () => {
    setShowInlinePasswordForm(false);
    setInlinePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setInlinePasswordErrors({});
  };

  const validateInlinePassword = () => {
    const errors = {};

    if (!inlinePasswordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!inlinePasswordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (inlinePasswordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(inlinePasswordData.newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!inlinePasswordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (inlinePasswordData.newPassword !== inlinePasswordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setInlinePasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInlinePasswordChange = async () => {
    if (!validateInlinePassword()) {
      return;
    }

    setIsChangingPassword(true);

    try {
      const token = localStorage.getItem('studentToken') || localStorage.getItem('token');


      const response = await fetch(`${API_BASE}/api/students/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: inlinePasswordData.currentPassword,
          newPassword: inlinePasswordData.newPassword
        })
      });

      console.log('Password change response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Password change successful:', data);

        // Clear form and close
        setShowInlinePasswordForm(false);
        setInlinePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setInlinePasswordErrors({});

        setSuccessMessage('Password changed successfully!');
        setShowSuccessMessage(true);

        // ✅ Hide message after 5 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
          setSuccessMessage('');
        }, 5000);

      }
      else {
        let errorMessage = 'Failed to change password';

        try {
          const errorData = await response.json();
          console.log('Password change error:', errorData);

          if (errorData.message) {
            errorMessage = errorData.message;
          }

          // Handle specific field errors
          if (errorData.field) {
            setInlinePasswordErrors({ [errorData.field]: errorData.message });
          } else {
            addNotification('error', errorMessage);
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          addNotification('error', `Server error (${response.status}). Please try again.`);
        }
      }
    } catch (error) {
      console.error('Password change network error:', error);
      addNotification('error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ===== COMPONENT DEFINITIONS =====


  // Helper: Renders an avatar image or initials
  // Inside StudentDashboard component (or a utilities file)
  const renderAvatar = (user, size = 50) => (
    <div className="avatar-wrapper" style={{ width: size, height: size }}>
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={`${user.name}'s profile`}
          className="student-avatar-img"
          style={{ width: size, height: size }}
          onError={e => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div
        className="student-avatar"
        style={{
          display: user.avatar ? 'none' : 'flex',
          width: size,
          height: size,
          fontSize: size > 60 ? '2rem' : '1.5rem'
        }}
      >
        {(user.name || `${user.firstName} ${user.lastName}`)
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()}
      </div>
    </div>
  );

  // Updated file message rendering
  const renderFileMessage = (msg) => {
    if (msg.messageType === 'image') {
      return (
        <div className="image-message">
          <img
            src={msg.file.url}
            alt={msg.file.originalName}
            className="message-image"
            onClick={() => window.open(msg.file.url, '_blank')}
          />
          <div className="image-info">
            <span className="image-name">{msg.file.originalName}</span>
            <button
              className="download-btn"
              onClick={() => downloadFile(msg.file.public_id, msg.file.originalName)}
              title="Download file"
            >
              <FaDownload />
            </button>
          </div>
        </div>
      );
    }

    if (msg.messageType === 'file') {
      return (
        <div className="file-message">
          <div className="file-icon-container">
            <FaFile className="file-icon" />
          </div>
          <div className="file-details">
            <span className="file-name">{msg.file.originalName}</span>
            <span className="file-size">{formatFileSize(msg.file.size)}</span>
          </div>
          <button
            className="download-btn"
            onClick={() => downloadFile(msg.file.url, msg.file.originalName)}
            title="Download file"
          >
            <FaDownload />
          </button>
        </div>
      );
    }
  };

  const downloadFile = (publicId, filename) => {
    const url = `${API_BASE}/api/files/download/${publicId}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };


  // ===== MAIN RENDER =====
  return (
    <div className="dashboard-container">
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarUpload}
        style={{ display: 'none' }}
        accept="image/*"
      />

      {inlineNotification && (
        <div className={`inline-notification ${inlineNotification.type}`}>
          <div className="notification-content">
            <span className="notification-message">{inlineNotification.message}</span>
          </div>
        </div>
      )}

      {showSuccessMessage && (
        <div className="temporary-success-message">
          <div className="success-content">
            <FaCheckCircle className="success-icon" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Add this right after the success message */}
      {showNotificationPanel && (
        <div className="notif-overlay" onClick={() => setShowNotificationPanel(false)}>
          <div className="notif-container" onClick={(e) => e.stopPropagation()}>
            <div className="notif-top-bar">
              <h3>Notifications</h3>
              <div className="notif-controls">
                {notifications.length > 0 && (
                  <span className="read-status-badge">
                    ✓ All marked as read
                  </span>
                )}
                <button
                  className="panel-close-btn"
                  onClick={() => setShowNotificationPanel(false)}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="notif-content-area">
              {notifications.length === 0 ? (
                <div className="empty-state">
                  <FaBellSlash className="empty-icon" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <div
                    key={notification.id || notification._id || index}
                    className="notif-card"
                  >
                    <div className="notif-main-content">
                      <div className={`notif-icon-wrapper ${notification.type}`}>
                        {notification.type === 'success' && <FaCheckCircle />}
                        {notification.type === 'error' && <FaExclamationTriangle />}
                        {notification.type === 'info' && <FaInfoCircle />}
                        {notification.type === 'warning' && <FaExclamationTriangle />}
                        {notification.type === 'support_response' && <FaComments />}
                        {notification.type === 'support_resolved' && <FaCheckCircle />}
                        {notification.type === 'support_closed' && <FaTimesCircle />}
                        {notification.type === 'support_update' && <FaClock />}
                      </div>

                      <div className="notif-message-area">
                        <p>{notification.text || notification.message}</p>
                        {notification.data?.adminResponse && (
                          <div className="admin-response-preview">
                            <small><strong>Admin Response:</strong> {notification.data.adminResponse}</small>
                          </div>
                        )}
                        <small>{formatDate(notification.date || notification.createdAt || notification.timestamp)}</small>
                      </div>
                    </div>

                    <button
                      className="notif-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(index);
                      }}
                      title="Delete notification permanently"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="notif-bottom-actions">
                <button
                  className="delete-all-btn"
                  onClick={() => {
                    // Mark all notifications as deleted
                    notifications.forEach(notification => {
                      const id = notification.id || notification._id;
                      setDeletedNotificationIds(prev => {
                        const newSet = new Set(prev);
                        newSet.add(id);
                        return newSet;
                      });
                    });

                    // Clear from state
                    setLocalNotifications([]);
                    setServerNotifications([]);
                    localStorage.removeItem('localNotifications');
                    setNotificationCount(0);
                  }}
                >
                  <FaTrash />
                  Delete All
                </button>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={toggleMobileSidebar}>
        <FaBars />
      </button>

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${sidebarMobileOpen ? 'active' : ''}`}
        onClick={closeMobileSidebar}
      ></div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""} ${sidebarMobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <h1
            className={sidebarCollapsed ? "collapsed-logo" : ""}
            onClick={sidebarCollapsed ? () => setSidebarCollapsed(false) : undefined}
            style={{
              cursor: sidebarCollapsed ? 'pointer' : 'default',
              userSelect: 'none'
            }}
            title={sidebarCollapsed ? "Click to expand sidebar" : ""}
          >
            <FaGraduationCap />
            Supervise Me
          </h1>
          <button
            className="sidebar-collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
          {/* Add this button to re-open the sidebar when collapsed */}
          {sidebarCollapsed && (
            <button className="sidebar-expand-btn" onClick={() => setSidebarCollapsed(false)}>
              <FaChevronRight />
            </button>
          )}
        </div>

        <nav className="navigation">
          <button
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => {
              setActiveTab("dashboard");
              closeMobileSidebar();
            }}
          >
            <FaHome />
            <span>Dashboard</span>
          </button>

          <button
  className={activeTab === "join-team" ? "active" : ""}
  onClick={() => {
    setActiveTab("join-team");
    closeMobileSidebar();
  }}
>
  {myTeam ? (
    <>
      <FaUsersCog />
      <span>My Team</span>
    </>
  ) : (
    <>
      <FaUsers />
      <span>Join Team</span>
    </>
  )}
</button>


          <button
            className={activeTab === "create-team" ? "active" : ""}
            onClick={() => {
              setActiveTab("create-team");
              closeMobileSidebar();
            }}
          >
            <FaUserPlus />
            <span>Create Team</span>
            {incomingRequests.length > 0 && (
              <span className="request-count">{incomingRequests.length}</span>
            )}
          </button>

          <button
            className={activeTab === "chat" ? "active" : ""}
            onClick={() => {
              setActiveTab("chat");
              closeMobileSidebar();
            }}
          >
            <FaComments />
            <span>Team Chat</span>
          </button>

          <button
            className={activeTab === "materials" ? "active" : ""}
            onClick={() => {
              setActiveTab("materials");
              closeMobileSidebar();
            }}
          >
            <FaBookOpen />
            <span>Materials</span>
          </button>

{/* Add this after the existing navigation buttons */}
{myTeam && myTeam.currentSupervisor && (
  <button
    className={activeTab === "progress" ? "active" : ""}
    onClick={() => {
      setActiveTab("progress");
      closeMobileSidebar();
    }}
  >
    <FaChartLine />
    <span>My Progress</span>
  </button>
)}


<button
  className={activeTab === "deliverables" ? "active" : ""}
  onClick={() => {
    setActiveTab("deliverables");
    closeMobileSidebar();
  }}
>
  <FaClipboardList />
  <span>Deliverables</span>
</button>

          <button
            className={activeTab === "grades" ? "active" : ""}
            onClick={() => {
              setActiveTab("grades");
              closeMobileSidebar();
            }}
          >
            <FaClipboardList />
            <span>Grades</span>
          </button>


          <button
            className={activeTab === "faculty" ? "active" : ""}
            onClick={() => {
              setActiveTab("faculty");
              closeMobileSidebar();
            }}
          >
            <FaChalkboardTeacher />
            <span>Faculty</span>
          </button>

          <button
            className={activeTab === "announcements" ? "active" : ""}
            onClick={() => {
              setActiveTab("announcements");
              closeMobileSidebar();
            }}
          >
            <FaBullhorn />
            <span>Announcements</span>
          </button>

          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => {
              setActiveTab("profile");
              closeMobileSidebar();
            }}
          >
            <FaUser />
            <span>Profile</span>
          </button>

          <button
            className={activeTab === "support" ? "active" : ""}
            onClick={() => {
              setActiveTab("support");
              closeMobileSidebar();
            }}
          >
            <FaComments />
            <span>Support</span>
          </button>

        </nav>

        <div className="sidebar-footer">
          <button
            className="notification-btn"
            onClick={() => {
              setShowNotificationPanel(!showNotificationPanel);
              closeMobileSidebar();

              // ✅ Auto-mark all notifications as read when opening
              if (!showNotificationPanel && notifications.length > 0) {
                markAllNotificationsAsRead();
              }
            }}
          >
            <FaBell />
            <span>Notifications</span>
            {notificationCount > 0 && (
              <span className="notification-count">
                {notificationCount}
              </span>
            )}
          </button>


          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        {/* Dashboard View */}
        {activeTab === "dashboard" && (
          <div className="dashboard-view">
            <div className="header">
              <h2>Welcome back, {profile.name || `${profile.firstName} ${profile.lastName}`}!</h2>

              <div className="stats">
                <div className="stat-card">
                  <h3>Team Status</h3>
                  <p>
                    {myTeam
                      ? (isLeader
                        ? (
                          <>
                            <FaCrown className="leader-icon" style={{ color: '#f59e0b', marginRight: '0.5rem' }} />
                            Leader of {myTeam.name}
                          </>
                        )
                        : (
                          <>
                            <FaUser className="member-icon" style={{ color: '#6b7280', marginRight: '0.5rem' }} />
                            Member of {myTeam.name}
                          </>
                        ))
                      : "Not in Team"
                    }
                  </p>
                </div>

                <div className="stat-card">
                  <h3>Pending Invitations</h3>
                  <p>{incomingRequests.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Credits Completed</h3>
                  <p>{profile.completedCredits}</p>
                </div>
                <div className="stat-card">
                  <h3>Current Course</h3>
                  <p>{myTeam ? "CSE 400" : "Not Enrolled"}</p>
                </div>
              </div>

              {myTeam && (
                <div className="team-card">
                  <h3>My Team: {myTeam.name}</h3>
                  <p><strong>Major:</strong> {myTeam.major}</p>
                  <p><strong>Course:</strong>{getCourseDescription()}</p>                  <p><strong>Project:</strong> {myTeam.projectIdea}</p>
                  <div className="team-actions">
                    <button
                      className="primary-btn"
                      onClick={() => setActiveTab("chat")}
                    >
                      <FaComments />
                      Open Chat
                    </button>
                  </div>
                </div>
              )}

              {!myTeam && incomingRequests.length > 0 && (
                <div className="incoming-requests">
                  <h3>Pending CSE 400 Capstone Project Team Invitations</h3>
                  <button className="refresh-btn" onClick={handleRefreshRequests}>
                    <FaSync />
                    Refresh
                  </button>
                  {incomingRequests.map((request) => (
                    <div key={request._id} className="request-card">
                      <div className="request-info">
                        <h4>{request.senderName} invited you to join CSE 400 team "{request.teamName}"</h4>
                        <p><strong>Major:</strong> {request.teamData?.major}</p>
                        {request.teamData?.projectIdea && (
                          <p><strong>Project:</strong> {request.teamData.projectIdea}</p>
                        )}
                        {request.teamData?.semester && (
                          <p><strong>Semester:</strong> {request.teamData.semester}</p>
                        )}

{request.senderSkills && request.senderSkills.length > 0 && (
            <div className="sender-skills-section">
              <div className="skills-label">
                <FaCode className="skills-icon" />
                <strong>Inviter's Skills:</strong>
              </div>
              <div className="skills-tags">
                {request.senderSkills.slice(0, 5).map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
                {request.senderSkills.length > 5 && (
                  <span className="skill-tag more">+{request.senderSkills.length - 5} more</span>
                )}
              </div>
            </div>
          )}
                      </div>
                      <div className="request-actions">
                        <button
                          className="primary-btn"
                          onClick={() => handleAcceptRequest(request._id)}
                          disabled={acceptingInvitationId === request._id || decliningInvitationId === request._id}
                        >
                          {acceptingInvitationId === request._id ? (
                            <>
                              <FaSpinner className="spinning-student" /> Joining Team...
                            </>
                          ) : (
                            <>
                              <FaCheck /> Accept & Join Team
                            </>
                          )}
                        </button>

                        <button
                          className="secondary-btn"
                          onClick={() => handleRejectRequest(request._id)}
                          disabled={acceptingInvitationId === request._id || decliningInvitationId === request._id}
                        >
                          {decliningInvitationId === request._id ? (
                            <>
                              <FaSpinner className="spinning-student" /> Declining...
                            </>
                          ) : (
                            <>
                              <FaTimes /> Decline
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}


              {!myTeam && incomingRequests.length === 0 && (
                <div className="no-team-info">
                  <h3>Start Your CSE 400 Journey</h3>
                  <p>Find active teammates to form your CSE 400 team and begin your CSE400 Capstone Project</p>
                  <div className="action-buttons">
                    <button
                      className="primary-btn"
                      onClick={() => setActiveTab("join-team")}
                    >
                      <FaUsers />
                      Browse CSE 400 Teams
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => setActiveTab("create-team")}
                    >
                      <FaUserPlus />
                      Create CSE 400 Capstone project Team
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Join Team View - Updated to show user's team and other teams */}
        {activeTab === "join-team" && (
          <div className="join-team-container">
            <div className="join-team-header">
              <h1>Join a CSE 400 Team</h1>
              <p>Connect with existing CSE 400 teams looking for members</p>
            </div>

            <div className="search-filter-container">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search CSE 400 teams by name or project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-controls">
                <div className="filter-group">
                  <label>
                    <FaFilter />
                    Major
                  </label>
                  <select
                    className="filter-select"
                    value={selectedMajor}
                    onChange={(e) => setSelectedMajor(e.target.value)}
                  >
                    <option value="">All Majors</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Hardware Engineering">Hardware Engineering</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>
                <button
      className="refresh-rejection-btn"
      onClick={() => {
        loadTeamRejectionStatus();
        showInlineNotification('status refreshed', 'success');
      }}
      title="Refresh rejection status"
    >
      <FaSync />
      Refresh Status
    </button>
    

              </div>
            </div>


            {myTeam && isLeader && (
              <section className="incoming-requests-section">
                <h3><FaUserPlus /> Incoming Join Requests ({incomingJoinRequests.length})</h3>

                {incomingJoinRequests.length === 0 && <p>No pending requests</p>}

{incomingJoinRequests.map(req => (
  <div key={req.id} className="join-request-card">
    <div className="request-info">
      {renderAvatar({ name: req.studentName, avatar: req.avatar }, 45)}
      <div className="details">
        <strong>{req.studentName}</strong>
        <small>Student ID: {req.studentIdNumber}</small>

        {/* UPDATED: Enhanced academic info with skills */}
        <div className="student-academic-info">
          <span className="academic-detail">
            <FaTasks className="detail-icon" />
            Credits: {req.completedCredits}
          </span>
          <span className="academic-detail">
            <FaGraduationCap className="detail-icon" />
            Program: {req.program}
          </span>
        </div>

        {/* ✅ NEW: Add skills section */}
{req.senderSkills && req.senderSkills.length > 0 && (
  <div className="request-skills-section">
    <div className="skills-label">
      <FaCode className="skills-icon" />
      Sender Skills:
    </div>
    <div className="skills-tags">
      {req.senderSkills.slice(0, 4).map((skill, index) => (
        <span key={index} className="skill-tag">{skill}</span>
      ))}
      {req.senderSkills.length > 4 && (
        <span className="skill-tag more">+{req.senderSkills.length - 4} more</span>
      )}
    </div>
  </div>
)}

        <p>{req.message}</p>
        <small>Requested {formatDate(req.requestDate)}</small>
      </div>
    </div>
                    <div className="actions">
                      <button
                        className="accept-btn"
                        onClick={() => handleAcceptJoinRequest(req.id)}
                        disabled={acceptingRequestId === req.id || decliningRequestId === req.id} // disable during loading
                      >
                        {acceptingRequestId === req.id ? (
                          <>
                            <FaSpinner className="spinning-student" /> Accepting...
                          </>
                        ) : (
                          <>
                            <FaCheck /> Accept
                          </>
                        )}
                      </button>

                      <button
                        className="decline-btn"
                        onClick={() => handleDeclineJoinRequest(req.id)}
                        disabled={acceptingRequestId === req.id || decliningRequestId === req.id} // disable during loading
                      >
                        {decliningRequestId === req.id ? (
                          <>
                            <FaSpinner className="spinning-student" /> Declining...
                          </>
                        ) : (
                          <>
                            <FaTimes /> Decline
                          </>
                        )}
                      </button>

                    </div>
                  </div>
                ))}
              </section>
            )}


{/* Enhanced Project Completion Celebration Modal */}
{showCompletionCelebration && myTeam && myTeam.projectCompleted && (
  <div className="completion-celebration-overlay">
    {/* Animated Background */}
    <div className="celebration-background">
      {/* Multiple Confetti Layers */}
      {Array.from({ length: 100 }).map((_, i) => (
        <div 
          key={i} 
          className={`confetti confetti-${i % 8}`}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${4 + Math.random() * 3}s`,
            '--random-x': `${(Math.random() - 0.5) * 200}px`
          }}
        />
      ))}
      
      {/* Floating Success Icons */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div 
          key={`icon-${i}`} 
          className="floating-success-icon"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        >
          {i % 4 === 0 ? '🎉' : i % 4 === 1 ? '🎊' : i % 4 === 2 ? '✨' : '🏆'}
        </div>
      ))}
    </div>
    
    <div className="completion-celebration-modal">
      {/* Pulsing Success Ring */}
      <div className="success-ring-container">
        <div className="success-ring success-ring-1"></div>
        <div className="success-ring success-ring-2"></div>
        <div className="success-ring success-ring-3"></div>
      </div>
      
      {/* Main Celebration Content */}
      <div className="celebration-main-content">
        {/* Animated Trophy */}
        <div className="trophy-container">
          <div className="trophy-glow"></div>
          <div className="trophy-icon">
            <FaTrophy />
          </div>
          <div className="trophy-sparkles">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`sparkle sparkle-${i}`}>✨</div>
            ))}
          </div>
        </div>
        
        {/* Animated Text */}
        <div className="celebration-text-container">
          <h1 className="celebration-title">
            <span className="title-word title-word-1">CONGRATULATIONS!</span>
            <span className="title-word title-word-2">PROJECT</span>
            <span className="title-word title-word-3">COMPLETED!</span>
          </h1>
          
          <div className="celebration-subtitle">
            <div className="completed-badge-animated">
              <FaCheckCircle className="check-icon" />
              <span>SUCCESSFULLY COMPLETED</span>
            </div>
          </div>
        </div>
        
        {/* Team Achievement Card */}
        <div className="team-achievement-card">
          <div className="achievement-header">
            <div className="team-icon-container">
              <FaUsers className="team-icon" />
              <div className="icon-glow"></div>
            </div>
            <h2>Team "{myTeam.name}"</h2>
          </div>
          
          {/* Project Details with Animation */}
          <div className="project-details-animated">
            <div className="detail-item detail-item-1">
              <div className="detail-icon">
                <FaLightbulb />
              </div>
              <div className="detail-content">
                <span className="detail-label">Project</span>
                <span className="detail-value">{myTeam.projectIdea}</span>
              </div>
            </div>
            
            <div className="detail-item detail-item-2">
              <div className="detail-icon">
                <FaGraduationCap />
              </div>
              <div className="detail-content">
                <span className="detail-label">Program</span>
                <span className="detail-value">{myTeam.major}</span>
              </div>
            </div>
            
            <div className="detail-item detail-item-3">
              <div className="detail-icon">
                <FaCalendar />
              </div>
              <div className="detail-content">
                <span className="detail-label">Completed</span>
                <span className="detail-value">{formatDate(myTeam.projectCompletedDate)}</span>
              </div>
            </div>
            
            <div className="detail-item detail-item-4">
              <div className="detail-icon">
                <FaChalkboardTeacher />
              </div>
              <div className="detail-content">
                <span className="detail-label">Supervisor</span>
                <span className="detail-value">{myTeam.currentSupervisor?.facultyName || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          {/* Animated Team Members */}
          <div className="team-members-celebration">
            <h3>🌟 Team Members</h3>
            <div className="members-celebration-grid">
              {myTeam.members?.map((member, index) => (
                <div 
                  key={index} 
                  className="member-celebration-card"
                  style={{ animationDelay: `${0.5 + index * 0.2}s` }}
                >
                  <div className="member-avatar-celebration">
                    {member.avatarUrl || member.avatar ? (
                      <img
                        src={member.avatarUrl || member.avatar}
                        alt={member.name}
                        className="member-pic-celebration"
                      />
                    ) : (
                      <div className="member-fallback-celebration">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {member.role === 'Leader' && (
                      <div className="leader-crown">
                        <FaCrown />
                      </div>
                    )}
                    <div className="member-glow"></div>
                  </div>
                  <div className="member-info-celebration">
                    <span className="member-name-celebration">{member.name}</span>
                    <span className="member-role-celebration">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Achievement Stats */}
          <div className="achievement-stats">
            <div className="stat-celebration stat-1">
              <div className="stat-number">{myTeam.members?.length || 0}</div>
              <div className="stat-label">Team Members</div>
            </div>
            <div className="stat-celebration stat-2">
              <div className="stat-number">100%</div>
              <div className="stat-label">Project Complete</div>
            </div>
            <div className="stat-celebration stat-3">
              <div className="stat-number">CSE 400</div>
              <div className="stat-label">Capstone</div>
            </div>
          </div>
        </div>
        
        {/* Success Message */}
        <div className="success-message-container">
          <div className="success-message">
            <FaCheckCircle className="success-icon" />
            <p>
              <strong>Outstanding Achievement!</strong> Your team has successfully completed 
              all phases of the CSE 400 Capstone Project. This marks the culmination of 
              months of hard work, dedication, and collaboration.
            </p>
          </div>
        </div>
        
        {/* Auto-dismiss Timer */}
        <div className="auto-dismiss-timer">
          <div className="timer-bar"></div>
          <small>This celebration will close automatically</small>
        </div>
        
        {/* Action Button */}
        <div className="celebration-actions">
          <button
            className="celebration-continue-btn"
            onClick={() => setShowCompletionCelebration(false)}
          >
            <FaRocket />
            Continue to Team Dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
)}



{myTeam && (
  <div className="supervision-status-section">
    <div className="supervision-header">
      <h4>
        <FaChalkboardTeacher />
        Faculty Supervision Status
      </h4>
      <div className="supervision-actions">
        <button 
          className="refresh-supervision-btn"
          onClick={async () => {
            try {
              const token = localStorage.getItem('studentToken') || localStorage.getItem('token');
              const response = await fetch(`${API_BASE}/api/teams/my-team`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              if (response.ok) {
                const updatedTeam = await response.json();
                setMyTeam(updatedTeam);
                showInlineNotification('Team supervision status refreshed', 'success');
              }
            } catch (error) {
              console.error('Failed to refresh:', error);
              showInlineNotification('Failed to refresh status', 'error');
            }
          }}
          title="Refresh supervision status"
        >
          <FaSync />
          Refresh Status
        </button>
        
        {/* NEW: Show History Button */}
        {myTeam.supervisionRequests && myTeam.supervisionRequests.length > 0 && (
          <button 
            className="show-history-btn"
            onClick={() => setShowSupervisionHistoryModal(true)}
            title="View supervision requests history"
          >
            <FaHistory />
            View History ({myTeam.supervisionRequests.length})
          </button>
        )}
      </div>
    </div>
    
    {/* Current Supervisor */}
    {myTeam.currentSupervisor && (
      <div className="current-supervisor">
        <div className="supervisor-card accepted">
          <div className="supervisor-header">
            <FaCheckCircle className="status-icon accepted" />
            <h5>Current Supervisor</h5>
          </div>
          <div className="supervisor-info">
            <h6>{myTeam.currentSupervisor.facultyName}</h6>
            <p><FaBuilding /> {myTeam.currentSupervisor.facultyDepartment}</p>
            <small>Accepted: {formatDate(myTeam.currentSupervisor.acceptedDate)}</small>
          </div>
        </div>
      </div>
    )}
    
    {/* No supervision message */}
    {(!myTeam.supervisionRequests || myTeam.supervisionRequests.length === 0) && !myTeam.currentSupervisor && (
      <div className="no-supervision">
        <FaChalkboardTeacher className="empty-icon" />
        <p>No supervision requests sent yet</p>
        {isLeader && (
          <small>As team leader, you can request supervision from the Faculty page</small>
        )}
      </div>
    )}
  </div>
)}


{/* Supervision History Modal */}
{showSupervisionHistoryModal && (
  <div className="supervision-history-overlay" onClick={() => setShowSupervisionHistoryModal(false)}>
    <div className="supervision-history-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>
          <FaHistory />
          Supervision Requests History - {myTeam?.name}
        </h3>
        <button
          className="close-modal-btn"
          onClick={() => setShowSupervisionHistoryModal(false)}
        >
          <FaTimes />
        </button>
      </div>

      <div className="modal-body">
        {myTeam?.currentSupervisor && (
          <div className="current-supervisor-summary">
            <div className="supervisor-card active">
              <FaCheckCircle className="status-icon accepted" />
              <div className="supervisor-details">
                <h4>Current Supervisor: {myTeam.currentSupervisor.facultyName}</h4>
                <p><FaBuilding /> {myTeam.currentSupervisor.facultyDepartment}</p>
                <small>Supervising since: {formatDate(myTeam.currentSupervisor.acceptedDate)}</small>
              </div>
            </div>
          </div>
        )}

        {myTeam?.supervisionRequests && myTeam.supervisionRequests.length > 0 ? (
          <div className="supervision-requests-history">
            <h5>All Supervision Requests ({myTeam.supervisionRequests.length})</h5>
            <div className="requests-timeline">
              {myTeam.supervisionRequests
                .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))
                .map((request, index) => (
                <div key={index} className={`request-timeline-item ${request.status}`}>
                  <div className="timeline-marker">
                    {request.status === 'pending' && <FaClock className="status-icon pending" />}
                    {request.status === 'accepted' && <FaCheckCircle className="status-icon accepted" />}
                    {request.status === 'rejected' && <FaTimesCircle className="status-icon rejected" />}
                  </div>
                  
                  <div className="timeline-content">
                    <div className="request-header">
                      <h6>{request.facultyName}</h6>
                      <div className={`status-badge ${request.status}`}>
                        {request.status === 'pending' && (
                          <>
                            <FaClock className="status-icon" />
                            Processing
                          </>
                        )}
                        {request.status === 'accepted' && (
                          <>
                            <FaCheckCircle className="status-icon" />
                            Accepted
                          </>
                        )}
                        {request.status === 'rejected' && (
                          <>
                            <FaTimesCircle className="status-icon" />
                            Rejected
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="request-details">
                      <p><FaBuilding /> {request.facultyDepartment}</p>
                      <p><FaEnvelope /> {request.facultyEmail}</p>
                      <p><strong>Requested by:</strong> {request.requestedByName}</p>
                      <p><strong>Request Date:</strong> {formatDate(request.requestDate)}</p>
                      {request.responseDate && (
                        <p><strong>Response Date:</strong> {formatDate(request.responseDate)}</p>
                      )}
                      <div className="request-message">
                        <strong>Message:</strong>
                        <p className="message-text">{request.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-requests">
            <FaChalkboardTeacher className="empty-icon" />
            <h4>No supervision requests sent yet</h4>
            <p>Your team hasn't sent any supervision requests to faculty members.</p>
            {isLeader && (
              <p><small>As team leader, you can send supervision requests from the Faculty page.</small></p>
            )}
          </div>
        )}
      </div>

      <div className="modal-footer">
        <div className="history-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <FaClipboardList className="stat-icon" />
              <span>Total Requests: {myTeam?.supervisionRequests?.length || 0}</span>
            </div>
            {myTeam?.supervisionRequests && (
              <>
                <div className="stat-item accepted">
                  <FaCheckCircle className="stat-icon" />
                  <span>Accepted: {myTeam.supervisionRequests.filter(r => r.status === 'accepted').length}</span>
                </div>
                <div className="stat-item rejected">
                  <FaTimesCircle className="stat-icon" />
                  <span>Rejected: {myTeam.supervisionRequests.filter(r => r.status === 'rejected').length}</span>
                </div>
                <div className="stat-item pending">
                  <FaClock className="stat-icon" />
                  <span>Pending: {myTeam.supervisionRequests.filter(r => r.status === 'pending').length}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)}


            {myTeam ? (
              <div className="my-team-section">
                <h2>
                  <FaUsers className="section-icon" />
                  My Team
                </h2>
                {!isEditingTeam ? (
                  <div className="team-card my-team-card">
                    <div className="card-header">
{/* Enhanced completion banner in team card */}
{myTeam.projectCompleted && (
  <div className="completed-team-banner enhanced" style={{
    backgroundColor: '#f0fdf4',
    border: '2px solid #22c55e',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
    animation: 'completionGlow 2s ease-in-out infinite alternate'
  }}>
    <div className="completed-banner-content" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <FaTrophy className="completed-trophy" style={{
        color: '#fbbf24',
        fontSize: '2rem',
        animation: 'bounce 1s ease-in-out infinite'
      }} />
      <div className="completed-text">
        <div className="completed-title" style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#15803d',
          marginBottom: '4px'
        }}>
          🏆 PROJECT COMPLETED! 🏆
        </div>
        <div className="completed-date" style={{
          fontSize: '0.9rem',
          color: '#16a34a'
        }}>
          Completed on {formatDate(myTeam.projectCompletedDate)}
        </div>
        {myTeam.currentSupervisor && (
          <div className="completed-supervisor" style={{
            fontSize: '0.85rem',
            color: '#16a34a',
            marginTop: '4px'
          }}>
            Marked complete by: {myTeam.currentSupervisor.facultyName}
          </div>
        )}
      </div>
    </div>
  </div>
)}


                      <div className="team-header">

                        <div className="team-info">
                          <h3>{myTeam.name}</h3>
                          {myTeam.projectCompleted ? (
    <div className="completed-team-badge">
      <FaTrophy />
      PROJECT COMPLETED
    </div>
  ) : (
    <span className={`phase-badge phase-${myTeam.currentPhase || myTeam.phase || 'A'}`}>
      Phase {myTeam.currentPhase || myTeam.phase || 'A'}
    </span>
  )}
</div>
                        </div>
                      
                      <div className="team-meta">
                        <span className="major-badge">{myTeam.major}</span>
                        <span className="capstone-tag">CSE 400</span>
                        <span className="member-count">{myTeam.members?.length}/4 members</span>
                        <span className="phase-description">
          {getPhaseDescription(myTeam.currentPhase || myTeam.phase || 'A')}
        </span>
                      </div>
                    </div>

                    <div className="card-body">
                      <p className="team-description">{myTeam.projectIdea}</p>

                      {/* Enhanced Team Members Section with Management */}
                     <div className="team-members">
  <div className="members-header">
    <h4>Team Members:</h4>
    {isLeader && !hasActiveSupervisor() && (
      <div className="leader-actions">
        <button
          className="edit-team-btn"
          onClick={() => handleEditTeam()}
        >
          <FaEdit />
          Edit Team
        </button>
        <button
          className="manage-team-btn"
          onClick={() => setShowTeamManagement(!showTeamManagement)}
          title="Manage team members"
        >
          <FaCog /> Manage
        </button>
      </div>
    )}
    
    {/* ✅ NEW: Show supervisor info when team is supervised */}
    {hasActiveSupervisor() && (
      <div className="supervisor-info">
        <div className="supervisor-badge">
          <FaUserTie className="supervisor-icon" />
          <span>Supervised by {myTeam.currentSupervisor.facultyName}</span>
        </div>
        <small className="supervisor-note">
          Only your supervisor can manage team members
        </small>
      </div>
    )}
  </div>
                      

                        <div className="members-list">
                          {myTeam.members?.map((member, index) => (
                            <div key={index} className="member-item-enhanced">
                              <div className="member-avatar-container">
                                {member.avatarUrl || member.avatar ? (
                                  <img
                                    src={member.avatarUrl || member.avatar}
                                    alt={member.name}
                                    className="member-profile-pic"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div
                                  className="member-avatar-fallback"
                                  style={{
                                    display: (member.avatarUrl || member.avatar) ? 'none' : 'flex'
                                  }}
                                >
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                              </div>

                              <div className="member-info">
                                <span className="member-name">{member.name}</span>
                                <span className="member-role">
                                  ({member.role})
                                  {member.role === 'Leader' && <FaCrown className="crown-icon" />}
                                </span>
                                <span className="member-id">{member.studentId}</span>
                              </div>

                              {/* Leader Management Actions */}
                           {isLeader && showTeamManagement && member.studentId !== profile.studentId && !hasActiveSupervisor() && (
          <div className="member-actions">
            <button
              className="make-leader-btn"
              onClick={() => handleMakeLeader(member.studentId, member.name)}
              title="Make this member the team leader"
            >
              <FaCrown /> Make Leader
            </button>

            {myTeam.members.length > 2 && (
              <button
                className="remove-member-btn"
                onClick={() => handleRemoveMember(member.studentId, member.name)}
                title="Remove this member from team"
              >
                <FaUserMinus /> Remove
              </button>
            )}
          </div>
        )}

        {/* ✅ NEW: Show supervised team message */}
        {isLeader && showTeamManagement && member.studentId !== profile.studentId && hasActiveSupervisor() && (
          <div className="supervised-team-notice">
            <small className="supervisor-restriction">
              <FaLock className="lock-icon" />
              Member management restricted to supervisor
            </small>
          </div>
        )}
                              {/* Current User Self-Management */}
                               {isLeader && showTeamManagement && member.studentId === profile.studentId && !hasActiveSupervisor() && (
          <div className="self-actions">
            <span className="self-label">You (Leader)</span>
            {myTeam.members.length <= 2 && (
              <button
                className="dismiss-team-btn"
                onClick={handleDismissTeam}
                title="Dismiss the entire team"
              >
                <FaTrash /> Dismiss Team
              </button>
            )}
          </div>
        )}

        {/* ✅ NEW: Supervised team leader self-display */}
        {isLeader && showTeamManagement && member.studentId === profile.studentId && hasActiveSupervisor() && (
          <div className="supervised-leader-display">
            <span className="supervised-leader-label">
              You (Leader) - Supervised by {myTeam.currentSupervisor.facultyName}
            </span>
          </div>
        )}
      </div>
    ))}
  </div>

                       {isLeader && showTeamManagement && (
    <div className="management-rules">
      <h5><FaInfoCircle /> Team Management Rules:</h5>
      {hasActiveSupervisor() ? (
        <ul>
          <li>• Your team is supervised by {myTeam.currentSupervisor.facultyName}</li>
          <li>• Only your supervisor can add or remove team members</li>
          <li>• You can still edit team information and manage project details</li>
          <li>• Contact your supervisor for any member management needs</li>
        </ul>
      ) : (
        <ul>
          <li>• You can make any member a team leader</li>
          <li>• You can remove members only if team has 3+ members</li>
          <li>• With 2 members, you can only dismiss the entire team</li>
          <li>• You can edit team information at any time</li>
        </ul>
      )}
    </div>
  )}
</div>

                      <div className="team-stats">
                        <div className="stat-item">
                          <FaCalendar className="stat-icon" />
                          <span>{myTeam.semester}</span>
                        </div>
                        <div className="stat-item">
                          <FaClock className="stat-icon" />
                          <span>Created {formatDate(myTeam.createdDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="card-footer">
                      <button
                        className="primary-btn"
                        onClick={() => setActiveTab("chat")}
                      >
                        <FaComments />
                        Open Team Chat
                      </button>
                      <button
                        className="secondary-btn"
                        onClick={() => setActiveTab("dashboard")}
                      >
                        <FaHome />
                        Go to Dashboard
                      </button>
                    </div>
                  </div>
                ) : (
                  // ✅ NEW INLINE EDIT FORM (Shows instead of team card)
                  <div className="team-card my-team-card">
                    <div className="card-header">
                      <div className="team-header">
                        <div className="team-avatar">
                          <FaEdit />
                        </div>
                        <div className="team-info">
                          <h3>Edit Team Details</h3>
                          <div className="team-status">
                            <span className="status-badge editing">Editing Mode</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-body">
                      {editErrors.general && (
                        <div className="error-message general-error">
                          <FaExclamationTriangle />
                          {editErrors.general}
                        </div>
                      )}

                      <form onSubmit={handleSubmitEdit} className="edit-team-form">
                        <div className="form-group">
                          <label htmlFor="teamName">
                            <FaUsers className="label-icon" />
                            Team Name
                          </label>
                          <input
                            type="text"
                            id="teamName"
                            value={editFormData.teamName}
                            onChange={(e) => setEditFormData({ ...editFormData, teamName: e.target.value })}
                            className={editErrors.teamName ? 'error' : ''}
                            placeholder="Enter team name"
                            disabled={isUpdating}
                            required
                          />
                          {editErrors.teamName && (
                            <div className="error-message">{editErrors.teamName}</div>
                          )}
                        </div>

                        <div className="form-group">
                          <label htmlFor="major">
                            <FaGraduationCap className="label-icon" />
                            Major
                          </label>
                          <select
                            id="major"
                            value={editFormData.major}
                            onChange={(e) => setEditFormData({ ...editFormData, major: e.target.value })}
                            className={editErrors.major ? 'error' : ''}
                            disabled={isUpdating}
                            required
                          >
                            <option value="">Select Major</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Software Engineering">Software Engineering</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Cybersecurity">Cybersecurity</option>
                          </select>
                          {editErrors.major && (
                            <div className="error-message">{editErrors.major}</div>
                          )}
                        </div>

                        <div className="form-group">
                          <label>
                            <FaCog className="label-icon" />
                            Course
                          </label>
                          <div className="course-display" style={{
                            padding: "0.75rem 1rem",
                            background: "rgba(56, 161, 105, 0.1)",
                            border: "1px solid rgba(56, 161, 105, 0.2)",
                            borderRadius: "var(--radius-lg)",
                            color: "#38a169",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                          }}>
                            <FaCheckCircle />
                            CSE400 Capstone Project
                          </div>
                        </div>


                        <div className="form-group">
                          <label htmlFor="projectDescription">
                            <FaFileAlt className="label-icon" />
                            Project Description
                          </label>
                          <textarea
                            id="projectDescription"
                            value={editFormData.projectDescription}
                            onChange={(e) => setEditFormData({ ...editFormData, projectDescription: e.target.value })}
                            className={editErrors.projectDescription ? 'error' : ''}
                            placeholder="Describe your team's project..."
                            rows="4"
                            disabled={isUpdating}
                          />
                          {editErrors.projectDescription && (
                            <div className="error-message">{editErrors.projectDescription}</div>
                          )}
                        </div>

                        <div className="form-actions">
                          <button
                            type="button"
                            className="secondary-btn"
                            onClick={handleCancelEdit}
                            disabled={isUpdating}
                          >
                            <FaTimes />
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className={`primary-btn ${isUpdating ? 'loading' : ''}`}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <>
                                <FaSpinner className="spinning-student" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <FaSave />
                                Update Team
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="available-teams-section">
                <h3>Available Teams Looking for Members</h3>
                <div className="team-grid">
                  {filteredAllTeams.length > 0 ? (
                    filteredAllTeams.map((team) => (
                      <div key={team.id} className="team-card">
                        <div className="card-header">
                          <div className="team-header">
                            <div className="team-info">
                              <h3>{team.name}</h3>
                            </div>
                          </div>
                          <div className="team-meta">
                            <span className="major-badge">{team.major}</span>
                            <span className="capstone-tag">CSE 400</span>
                            <span className="member-count">{team.members?.length || 1}/4 members</span>
                          </div>
                        </div>

                        <div className="card-body">
                          <p className="team-description">{team.projectIdea}</p>

                          {/* Updated Team Members Preview with Profile Pictures */}
                          {team.members && team.members.length > 0 && (
                            <div className="team-preview-members">
                              <h5>Team Members:</h5>
                              <div className="members-preview-grid">
                                {team.members.slice(0, 4).map((member, index) => (
                                  <div key={index} className="member-preview-card">
                                    <div className="member-preview-avatar">
                                      {member.avatarUrl || member.avatar ? (
                                        <img
                                          src={member.avatarUrl || member.avatar}
                                          alt={member.name}
                                          className="member-preview-pic"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <div
                                        className="member-preview-fallback"
                                        style={{
                                          display: (member.avatarUrl || member.avatar) ? 'none' : 'flex'
                                        }}
                                      >
                                        {member.name.charAt(0).toUpperCase()}
                                      </div>
                                    </div>
                                    <div className="member-preview-info">
                                      <span className="member-preview-name">{member.name}</span>
                                      <span className="member-preview-role">{member.role}</span>
                                    </div>
                                  </div>
                                ))}

                                {/* Show empty slots for remaining positions */}
                                {Array.from({ length: 4 - team.members.length }).map((_, index) => (
                                  <div key={`empty-${index}`} className="member-preview-card empty">
                                    <div className="member-preview-avatar empty">
                                      <FaUserPlus className="empty-slot-icon" />
                                    </div>
                                    <div className="member-preview-info">
                                      <span className="member-preview-name">Open Slot</span>
                                      <span className="member-preview-role">Available</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="team-stats">
                            <div className="stat-item">
                              <FaUsers className="stat-icon" />
                              <span>{team.members?.length || 1} of 4 members</span>
                            </div>
                            <div className="stat-item">
                              <FaCalendar className="stat-icon" />
                              <span>{team.semester}</span>
                            </div>
                          </div>
                        </div>

<div className="card-footer">
  {myTeam ? (
    <button className="disabled-btn" disabled>
      <FaCheckCircle />
      You're in "{myTeam.name}"
    </button>
  ) : team.members?.length >= 4 ? (
    <button className="team-full-btn" disabled>
      <FaLock />
      Team Full (4/4) - Locked
    </button>
  ) : (() => {
    const localStatus = joinRequestStatus[team._id];
    const rejectionInfo = teamRejectionStatus[team._id];

    // ✅ PRIORITY 1: Check rejection status FIRST
    if (rejectionInfo && rejectionInfo.rejectionCount >= 3) {
      return (
        <button className="blocked-btn" disabled>
          <FaTimesCircle />
          Blocked - 3 Rejections ({rejectionInfo.rejectionCount}/3)
        </button>
      );
    }

    // ✅ PRIORITY 2: Check pending status
    if (localStatus && localStatus.status === 'pending') {
      return (
        <button className="request-sent-button" disabled>
          <FaCheckCircle />
          Request Sent - Waiting for Response
        </button>
      );
    }

    // ✅ PRIORITY 3: Show retry option if rejected but under limit
    if (rejectionInfo && rejectionInfo.rejectionCount > 0 && rejectionInfo.rejectionCount < 3) {
      return (
        <div className="join-button-container">
          <button
            className="join-button"
            onClick={() => handleJoinTeam(team)}
            disabled={joiningTeamId !== null}
          >
            <FaHandshake />
            Request to Join ({team.members?.length || 1}/4)
          </button>
          <div className="rejection-status-display">
            <small className="rejection-count">
              <FaExclamationTriangle className="warning-icon" />
              Rejections: {rejectionInfo.rejectionCount}/3
              {rejectionInfo.rejectionCount >= 2 && (
                <span className="warning-text"> - {3 - rejectionInfo.rejectionCount} attempts left</span>
              )}
            </small>
          </div>
        </div>
      );
    }

    // ✅ PRIORITY 4: Loading state
    if (joiningTeamId === team._id) {
      return (
        <button className="join-button loading" disabled>
          <FaSpinner className="spinning-student" />
          Sending Request...
        </button>
      );
    }

    // ✅ PRIORITY 5: Default join button
    return (
      <button
        className="join-button"
        onClick={() => handleJoinTeam(team)}
        disabled={joiningTeamId !== null}
      >
        <FaHandshake />
        Request to Join ({team.members?.length || 1}/4)
      </button>
    );
  })()}

   {/* NEW: Add View Members Button */}
  <button
    className="view-members-btn"
    onClick={() => handleViewTeamMembers(team)}
    title="View team member details"
  >
    <FaUsers />
    View Members ({team.members?.length || 0})
  </button>
</div>



                      </div>
                    ))
                  ) : (
                    <div className="no-results">
                      <FaRegFrown className="sad-icon" />
                      <h3>No teams found</h3>
                      <p>Try adjusting your search criteria or create your own team!</p>
                      {!myTeam && (
                        <button
                          className="primary-btn"
                          onClick={() => setActiveTab("create-team")}
                        >
                          <FaUserPlus />
                          Create New Team
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
{myTeam && (
  <div className="team-member-recruitment-section">
    <h3>
      <FaUserPlus />
      Invite More Members to Your Team
    </h3>
    
    {/* Check if team has active supervisor */}
    {hasActiveSupervisor() ? (
      // Show supervisor restriction message
      <div className="supervisor-restriction-notice">
        <div className="restriction-card">
          <div className="restriction-header">
            <FaUserTie className="supervisor-icon" />
            <h4>Team Supervision Active</h4>
          </div>
          <div className="restriction-content">
            <p>
              Your team is currently supervised by <strong>{myTeam.currentSupervisor.facultyName}</strong>. 
              Only your supervisor can manage team membership and invite new members.
            </p>
            <div className="supervisor-info">
              <p><strong>Supervisor:</strong> {myTeam.currentSupervisor.facultyName}</p>
              <p><strong>Department:</strong> {myTeam.currentSupervisor.facultyDepartment || 'Not specified'}</p>
              <p><strong>Assigned:</strong> {formatDate(myTeam.currentSupervisor.acceptedDate)}</p>
            </div>
            <div className="restriction-note">
              <FaInfoCircle className="info-icon" />
              <small>
                Contact your supervisor if you need to add or remove team members.
              </small>
            </div>
          </div>
        </div>
        
        {/* Still show view requests button but with limited functionality */}
        <div className="team-requests-actions disabled-section">
          <button
            className="view-team-requests-btn"
            onClick={() => setShowTeamRequests(true)}
          >
            <FaEnvelope />
            View Team Requests ({teamRequests.length})
          </button>
          <small className="disabled-note">
            <FaLock /> New invitations disabled while supervised
          </small>
        </div>
      </div>
    ) : (
      // Show normal invitation functionality
      <>
        <p>All team members can invite active students to join the team.</p>
        
        <div className="team-requests-actions">
          <button
            className="view-team-requests-btn"
            onClick={() => setShowTeamRequests(true)}
          >
            <FaEnvelope />
            View Team Requests ({teamRequests.length})
          </button>
        </div>

        {/* Show available students for team members */}
        <div className="available-students-for-team">
          <h4>Invite Active Students</h4>
          
          <div className="search-controls">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search students..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="students-grid">
            {filteredAvailableStudents.map((student) => {
              const requestSent = teamRequests.some(req => 
                req && req.targetStudentId && req.targetStudentId._id === student._id && 
                ['pending', 'awaiting_leader'].includes(req.status)
              );

              return (
                <div key={student._id} className="student-card">
                  <div className="student-header">
                    <div className="avatar-wrapper">
                      {renderAvatar(student, 50)}
                    </div>
                    <div className="student-info">
                      <h5>{student.name}</h5>
                      <div className="student-id">{student.studentId}</div>
                      <div className="student-major">{student.program}</div>
                    </div>
                  </div>

                  <div className="student-stats">
                    <div className="stat-item">
                      <FaTasks className="stat-icon" />
                      <span>{student.completedCredits} credits</span>
                    </div>
                  </div>

                  <div className="student-skills">
                    <div className="skills-label">
                      <FaCode className="skills-icon" />
                      Skills:
                    </div>
                    <div className="skills-tags">
                      {student.skills && student.skills.length > 0 ? (
                        <>
                          {student.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="skill-tag">{skill}</span>
                          ))}
                          {student.skills.length > 3 && (
                            <span className="skill-tag more">+{student.skills.length - 3} more</span>
                          )}
                        </>
                      ) : (
                        <span className="no-skills-text">No skills added</span>
                      )}
                    </div>
                  </div>

                  <div className="student-actions">
                    {requestSent ? (
                      <button className="request-sent-button" disabled>
                        <FaCheckCircle />
                        Request Sent
                      </button>
                    ) : (
                      <button
                        className="send-team-request-btn"
                        onClick={() => handleSendTeamMemberRequest(student)}
                        disabled={sendingTeamRequestId === student._id}
                      >
                        {sendingTeamRequestId === student._id ? (
                          <>
                            <FaSpinner className="spinning-student" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <FaUserPlus />
                            Invite to Team
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    )}
  </div>
)}


          </div>
        )}

        {/* Create Team View - Updated for Phase A Only */}
        {activeTab === "create-team" && (
          <div className="create-team-container">
            {/* Team Membership Check - Prevents users already in teams from creating new requests */}
            {myTeam ? (
              <div className="already-in-team-notice">
                <div className="notice-card">
                  <div className="notice-header">
                    <FaInfoCircle className="notice-icon" />
                    <h2>You're Already in a Team</h2>
                  </div>
                  <div className="notice-content">
                    <p>You cannot create new team requests while you're already a member of <strong>{myTeam.name}</strong>.</p>
                    <div className="team-current-info">
                      <div className="current-team-stats">
                        <span className="stat-item">
                          <FaUsers /> {myTeam.members?.length || 0}/4 Members
                        </span>
                        <span className="stat-item">
                          <FaBookOpen /> {'CSE 400'}
                        </span>
                        <span className="stat-item">
                          <FaGraduationCap /> {myTeam.major}
                        </span>
                      </div>
                    </div>
                    <div className="notice-actions">
                      <button
                        className="primary-btn"
                        onClick={() => setActiveTab("join-team")}
                      >
                        <FaUsers />
                        View My Team
                      </button>
                      <button
                        className="secondary-btn"
                        onClick={() => setActiveTab("dashboard")}
                      >
                        <FaHome />
                        Go to Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="create-team-header">
                  <div className="header-content">
                    <h1 className="main-title">
                      <FaUserPlus className="title-icon" />
                      Create Your CSE 400 Team
                    </h1>
                    <p className="subtitle">
                      Form a team for CSE 400 Capstone Project
                    </p>
                  </div>

                  <div className="team-requirements">
                    <div className="requirement-card">
                      <div className="req-header">
                        <FaInfoCircle className="req-icon" />
                        <div className="req-content">
                          <h3>CSE 400 Team Requirements</h3>
                          <ul>
                            <li>• Teams work on <strong>CSE 400 </strong>Capstone Project</li>
                            <li>• Complete project planning, development, and implementation</li>
                            <li>• Final presentation and project submission</li>
                            <li>• Teams can have up to <strong>4 members</strong> from the same major</li>
                            <li>• Team leader manages invitations and member acceptance</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="create-team-content">
                  <div className="form-section">
                    <div className="team-creation-card">
                      <form className="creation-form">
                        <div className="form-grid">

                          <div className="form-group full-width">
                            <label>
                              <FaFlag className="label-icon" />
                              Team Name *
                              <span className="required-indicator">Required</span>
                            </label>
                            <input
                              type="text"
                              className={`form-input ${!newTeam.name.trim() ? 'error' : ''}`}
                              placeholder="Enter your CSE 400 team name"
                              value={newTeam.name}
                              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label>
                              <FaGraduationCap className="label-icon" />
                              Major *
                              <span className="required-indicator">Required</span>
                            </label>
                            <select
                              className="form-select"
                              value={newTeam.major}
                              onChange={(e) => setNewTeam({ ...newTeam, major: e.target.value })}
                              required
                            >
                              <option value="">Select Major</option>
    <option value="Software Engineer">Software Engineer</option>
    <option value="Data Science">Data Science</option>
    <option value="Hardware Engineer">Hardware Engineer</option>
                        <option value="Networking">Networking</option>
                            </select>
                          </div>

<div className="form-group">
  <label>
    <FaCalendar className="label-icon" />
    Semester *
    <span className="required-indicator">Required</span>
  </label>
  <select
    className="form-select"
    value={newTeam.semester}
    onChange={(e) => setNewTeam({ ...newTeam, semester: e.target.value })}
    required
  >
    <option value="">Select Semester</option>
    {generateSemesterOptions().map((semester) => (
      <option key={semester.value} value={semester.value}>
        {semester.label}
      </option>
    ))}
  </select>
</div>


                          <div className="form-group full-width">
                            <label>
                              <FaLightbulb className="label-icon" />
                              Project Idea *
                              <span className="required-indicator">Required</span>
                            </label>
                            <textarea
                              className="form-textarea"
                              placeholder="Describe your project concept for CSE 400..."
                              value={newTeam.projectIdea}
                              onChange={(e) => setNewTeam({ ...newTeam, projectIdea: e.target.value })}
                              rows="3"
                              required
                            />
                          </div>

                          <div className="form-group full-width">
                            <label>
                              <FaUser className="label-icon" />
                              Supervisor Interests
                              <span className="optional-indicator">Optional</span>
                            </label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="What expertise are you looking for in a supervisor?"
                              value={newTeam.supervisorInterest}
                              onChange={(e) => setNewTeam({ ...newTeam, supervisorInterest: e.target.value })}
                            />
                          </div>

                          <div className="form-group full-width">
                            <label>
                              <FaFileAlt className="label-icon" />
                              Team Description
                              <span className="optional-indicator">Optional</span>
                            </label>
                            <textarea
                              className="form-textarea"
                              placeholder="Additional details about your CSE 400 team..."
                              value={newTeam.description}
                              onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                              rows="2"
                            />
                          </div>
                        </div>

                        {/* Updated Sent Requests Button with new classname */}
                        <div className="team-invitations-section">
                          <button
                            type="button"
                            className="team-invitations-btn"
                            onClick={() => setShowRequestStatus(true)}
                          >
                            <FaEnvelope className="invitation-icon" />
                            <span className="invitation-text">View Sent Invitations</span>
                            {pendingRequests.length > 0 && (
                              <span className="invitation-badge">{pendingRequests.length}</span>
                            )}
                          </button>
                        </div>

                      </form>

                      <div className="partner-search-section">
                        <h4>
                          <FaUsers />
                          Find your CSE 400 teammates - Search active students for your team
                        </h4>

                        <div className="search-section">
                          <div className="search-controls">
                            <div className="search-input-wrapper">
                              <FaSearch className="search-icon" />
                              <input
                                type="text"
                                className="member-search-input"
                                placeholder="Search by name or student ID..."
                                value={memberSearchQuery}
                                onChange={(e) => setMemberSearchQuery(e.target.value)}
                              />
                            </div>
                            <select
                              className="filter-select"
                              value={memberFilterMajor}
                              onChange={(e) => setMemberFilterMajor(e.target.value)}
                            >
                              <option value="">All Programs</option>
                              <option value="Computer Science">Computer Science</option>
                            </select>
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={refreshAvailableStudents}
                              title="Refresh student list"
                            >
                              <FaSync />
                              Refresh
                            </button>
                          </div>
                        </div>

                        {/* Available Students Section */}
                        <div className="available-students">
                          <h4>
                            <FaUserPlus />
                            Students Available for CSE 400: {availableStudents.length}
                          </h4>

                          {filteredAvailableStudents.length > 0 ? (
                            <div className="students-grid">
                              {filteredAvailableStudents.map((student) => {
const requestSent = pendingRequests.some(req => 
  req && student && req.studentId === student._id
);
                                return (
                                  <div key={student._id} className="student-card">
                                    <div className="student-header">
                                      <div className="avatar-wrapper">
                                        {student.avatar ? (
                                          <img
                                            src={student.avatar}
                                            alt={`${student.name}'s profile`}
                                            className="student-avatar-img"
                                            onError={(e) => {
                                              console.log('Student avatar load error, showing fallback');
                                              e.target.style.display = 'none';
                                              e.target.nextSibling.style.display = 'flex';
                                            }}
                                          />
                                        ) : null}
                                        <div
                                          className="student-avatar"
                                          style={{
                                            display: student.avatar ? 'none' : 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'var(--primary-color)',
                                            color: 'white',
                                            fontSize: '1.5rem',
                                            fontWeight: '600',
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%'
                                          }}
                                        >
                                          {student.name.charAt(0).toUpperCase()}
                                        </div>
                                      </div>
                                      <div className="student-info">
                                        <h5>{student.name}</h5>
                                        <div className="student-id">{student.studentId}</div>
                                        <div className="student-major">{student.program}</div>
                                      </div>
                                    </div>

                                    <div className="student-stats">
                                      <div className="stat-item">
                                        <FaTasks className="stat-icon" />
                                        <span>{student.completedCredits} credits</span>
                                      </div>
                                    </div>

                                    {/* Updated skills section */}
                                    <div className="student-skills">
                                      <div className="skills-label">
                                        <FaCode className="skills-icon" />
                                        Skills:
                                      </div>
                                      <div className="skills-tags">
                                        {student.skills && student.skills.length > 0 ? (
                                          student.skills.map((skill, index) => (  // ✅ Show all skills (no slice)
                                            <span key={index} className="skill-tag">{skill}</span>
                                          ))
                                        ) : (
                                          <span className="no-skills-text">No skills listed</span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="student-actions">
                                      {requestSent ? (
                                        <button className="request-sent-button" disabled>
                                          <FaCheckCircle />
                                          Request Sent
                                        </button>
                                      ) : (
                                        <button
                                          className="send-request-btn"
                                          onClick={() => handleSendGroupRequest(student)}
                                          disabled={sendingInvitationId === student._id} // disable while loading for this student
                                        >
                                          {sendingInvitationId === student._id ? (
                                            <>
                                              <FaSpinner className="spinning-student" />
                                              Sending...
                                            </>
                                          ) : (
                                            <>
                                              <FaUserPlus />
                                              Send CSE 400 Project Invitation
                                            </>
                                          )}
                                        </button>

                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="no-students">
                              <FaUser className="no-students-icon" />
                              <p>
                                {availableStudents.length === 0
                                  ? "No ACTIVE students available for CSE 400 Project team formation"
                                  : "No ACTIVE students match your search criteria"
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Preview Section */}
                  <div className="preview-section">
                    <div className="team-preview-card">
                      <div className="preview-header">
                        <h3>
                          <FaEye />
                          CSE 400 Team Preview
                        </h3>
                      </div>
                      <div className="preview-content">
                        <div className="team-card-preview">
                          <div className="team-header-preview">
                            <div className="team-avatar-preview">
                              {newTeam.name ? newTeam.name.charAt(0).toUpperCase() : "?"}
                            </div>
                            <div className="team-info-preview">
                              <h4>{newTeam.name || "Team Name"}</h4>
                              <div className="badges-preview">
                                <span className="major-badge-preview">{newTeam.major}</span>
                                <span className="phase-badge-preview">CSE 400</span>
                              </div>
                            </div>
                          </div>

                          <div className="phase-progression">
                            <h5>Phase Progression</h5>
                            <div className="progression-steps">
                              <div className="step active">
                                <FaCheckCircle className="step-icon" />
                                <span>CSE 400A - Current</span>
                              </div>
                              <div className="step upcoming">
                                <FaClock className="step-icon" />
                                <span>CSE 400B - Next Semester</span>
                              </div>
                              <div className="step upcoming">
                                <FaClock className="step-icon" />
                                <span>CSE 400C - Final Semester</span>
                              </div>
                            </div>
                          </div>

                          {/* Updated Team Composition for 4 Members */}
                          <div className="team-composition">
                            <h5>Team Composition (Maximum 4 Members)</h5>
                            <div className="member-slots">
                              <div className="member-slot filled">
                                <FaUser className="slot-icon" />
                                <span>You (Leader)</span>
                              </div>
                              <div className="member-slot empty">
                                <FaUserPlus className="slot-icon" />
                                <span>Invite Member 2</span>
                              </div>
                              <div className="member-slot empty">
                                <FaUserPlus className="slot-icon" />
                                <span>Invite Member 3</span>
                              </div>
                              <div className="member-slot empty">
                                <FaUserPlus className="slot-icon" />
                                <span>Invite Member 4</span>
                              </div>
                            </div>
                            <div className="composition-note">
                              <small>
                                <FaInfoCircle />
                                Send invitations to up to 3 more students to complete your team
                              </small>
                            </div>
                          </div>
                          {newTeam.projectIdea && (
                            <div className="project-preview">
                              <h5>Project Idea</h5>
                              <p>{newTeam.projectIdea}</p>
                            </div>
                          )}

                          {newTeam.semester && (
                            <div className="semester-preview">
                              <h5>Target Semester</h5>
                              <p>{newTeam.semester}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rules-card">
                      <div className="rules-header">
                        <h3>
                          <FaCheckCircle />
                          Team Formation Rules
                        </h3>
                      </div>
                      <div className="rules-list">
                        <div className="rule-item">
                          <FaCheck className="rule-icon" />
                          <div>
                            <strong>CSE400 Capstone Project</strong>
                            <span>Complete project planning, development, and implementation</span>
                          </div>
                        </div>
                        <div className="rule-item">
                          <FaCheck className="rule-icon" />
                          <div>
                            <strong>Maximum Team Size: 4 Members</strong>
                            <span>Teams can have 1-4 members from the same major</span>
                          </div>
                        </div>
                        <div className="rule-item">
                          <FaCheck className="rule-icon" />
                          <div>
                            <strong>Team Leader Responsibilities</strong>
                            <span>Manage invitations, accept new members, and coordinate project activities</span>
                          </div>
                        </div>
                        <div className="rule-item">
                          <FaCheck className="rule-icon" />
                          <div>
                            <strong>Project Development Timeline</strong>
                            <span>Teams work through planning, development, testing, and final presentation</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </>
            )}
          </div>
        )}


        {/* Dismiss Team Confirmation Modal */}
        {showDismissTeamModal && (
          <div className="dismiss-team-modal-overlay" onClick={cancelDismissTeam}>
            <div className="dismiss-team-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="dismiss-icon">
                  <FaExclamationTriangle />
                </div>
                <h3>Dismiss Team</h3>
              </div>

              <div className="modal-body">
                <div className="warning-message">
                  <FaExclamationTriangle className="warning-icon" />
                  <div className="message-content">
                    <p><strong>Are you sure you want to dismiss the entire team "{myTeam?.name}"?</strong></p>
                    <p>This action cannot be undone and will:</p>
                    <ul>
                      <p>• Remove all team members from the team</p>
                      <p>• Delete all team data and chat history</p>
                      <p>• Cancel any pending team requests</p>
                      <p>• Allow members to join or create new teams</p>
                    </ul>
                  </div>
                </div>

                {myTeam && (
                  <div className="team-info-summary">
                    <div className="team-details">
                      <h4>Team Details:</h4>
                      <div className="team-stats-row">
                        <span><FaUsers /> {myTeam.members?.length} members</span>
                        <span><FaGraduationCap /> {myTeam.major}</span>
                        <span><FaBookOpen /> CSE 400</span>
                      </div>
                      {myTeam.projectIdea && (
                        <div className="project-info">
                          <strong>Project:</strong> {myTeam.projectIdea}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-dismiss-btn"
                  onClick={cancelDismissTeam}
                  disabled={isDismissingTeam} // ✅ Disable during operation
                >
                  <FaTimes />
                  Cancel
                </button>
                <button
                  className="confirm-dismiss-btn"
                  onClick={confirmDismissTeam}
                  disabled={isDismissingTeam} // ✅ Disable during operation
                >
                  {isDismissingTeam ? (
                    <>
                      <FaSpinner className="spinning-student" />
                      Dismissing Team...
                    </>
                  ) : (
                    <>
                      <FaTrash />
                      Yes, Dismiss Team
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Session Timeout Modal */}
        {showSessionTimeoutModal && (
          <div className="session-expired-backdrop">
            <div className="session-expired-dialog">
              <div className="session-header">
                <div className="session-clock-icon">
                  <FaClock />
                </div>
                <h3>Session Expired</h3>
              </div>

              <div className="session-content">
                <div className="session-warning-box">
                  <FaExclamationTriangle className="alert-icon" />
                  <div className="warning-text">
                    <p><strong>Your session has expired due to inactivity.</strong></p>
                    <p>For your security, you've been automatically logged out after 30 minutes of inactivity.</p>
                    <p>You can either login again or extend your current session.</p>
                  </div>
                </div>

                <div className="session-choice-container">
                  <div className="choice-option">
                    <FaSignOutAlt className="choice-icon" />
                    <div className="choice-details">
                      <h4>Login Again</h4>
                      <p>You will be redirected to the login page</p>
                    </div>
                  </div>
                  <div className="choice-separator">or</div>
                  <div className="choice-option">
                    <FaSync className="choice-icon" />
                    <div className="choice-details">
                      <h4>Extend Session</h4>
                      <p>Continue with your current session</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="session-buttons">
                <button
                  className="continue-session-button"
                  onClick={handleExtendSession}
                  disabled={isExtendingSession}
                >
                  {isExtendingSession ? (
                    <>
                      <FaSpinner className="spinning-student" />
                      Extending...
                    </>
                  ) : (
                    <>
                      <FaSync />
                      Extend Session
                    </>
                  )}
                </button>
                <button
                  className="relogin-button"
                  onClick={handleSessionTimeout}
                >
                  <FaSignOutAlt />
                  Login Again
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Logout Confirmation Modal */}
        {showLogoutConfirmModal && (
          <div className="logout-confirmation-overlay" onClick={cancelLogout}>
            <div className="logout-confirmation-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="logout-icon">
                  <FaSignOutAlt />
                </div>
                <h3>Confirm Logout</h3>
              </div>

              <div className="modal-body">
                <div className="confirmation-message">
                  <FaInfoCircle className="info-icon" />
                  <div className="message-content">
                    <p><strong>Are you sure you want to logout?</strong></p>
                    <p>You will be redirected to the login page and any unsaved work may be lost.</p>
                  </div>
                </div>

                <div className="user-info">
                  <div className="current-user">
                    <div className="user-avatar">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Profile" />
                      ) : (
                        <div className="avatar-fallback">
                          {profile.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="user-details">
                      <span className="user-name">{profile.name}</span>
                      <span className="user-id">{profile.studentId}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-logout-btn"
                  onClick={cancelLogout}
                >
                  <FaTimes />
                  Cancel
                </button>
                <button
                  className="confirm-logout-btn"
                  onClick={confirmLogout}
                >
                  <FaSignOutAlt />
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat View */}
        {/* Enhanced Chat View */}
     {activeTab === "chat" && (
  <div className="chat-view">
    {myTeam ? (
      <>
        {/* Enhanced Chat Header with Call Button */}
        {/* Enhanced Chat Header with Member Details Button */}
        <div className="chat-header">
          <div className="chat-team-info">
            <h3>Team Chat - {myTeam.name}</h3>
            <div className="team-info">
              <span className="major">{myTeam.major}</span>
              <span className="capstone">{"CSE 400"}</span>
              <span className="member-count">{myTeam.members?.length} members</span>
            </div>
          </div>
          <div className="chat-actions">
            {/* NEW: Member Details Button */}
          
            {/* Meeting Controls */}
            {!isInTeamMeeting ? (
              <button
                className="start-meeting-btn"
                onClick={startTeamMeeting}
                title="Start team meeting with video/audio"
              >
                <FaVideo />
                Start Team Meeting
              </button>
            ) : (
              <button
                className="leave-meeting-btn"
                onClick={leaveTeamMeeting}
                title="Leave current meeting"
              >
                <FaPhoneSlash />
                Leave Meeting
              </button>
            )}

            <button
              className="member-details-btn"
              onClick={() => setShowMemberDetailsModal(true)}
              title="View team member details"
            >
              <FaUsers />
              Member Details
            </button>

      

            <button
              className="refresh-chat-btn"
              onClick={loadChatMessages}
              disabled={isLoadingMessages}
              title="Refresh messages"
            >
              <FaSync className={isLoadingMessages ? 'spinning-student' : ''} />
              Refresh
            </button>
          </div>
        </div>

{isInTeamMeeting && (
          <div className="meeting-status-bar">
            <div className="meeting-info">
              <FaUsers className="meeting-icon" />
              <span>Meeting in progress - {meetingParticipants.length} participant{meetingParticipants.length !== 1 ? 's' : ''}</span>
              {meetingStartTime && (
                <span className="meeting-duration">
                  Duration: {Math.round((new Date() - meetingStartTime) / (1000 * 60))} min
                </span>
              )}
            </div>
          </div>
        )}

        {/* Meeting Interface */}
       {/* Meeting Interface */}
{/* Enhanced Meeting Interface */}
{/* Professional Meeting Interface with Enhanced Screen Share Support */}
{showMeetingInterface && isInTeamMeeting && (
  <div className="professionalMeetingInterfaceOverlay">
    <div className="meetingInterfaceContainer">
      {/* Meeting Header with Screen Share Status */}
      <div className="meetingInterfaceHeader">
        <h3>Team Meeting - {myTeam?.name}</h3>
        {isScreenShareActive && screenShareParticipant && (
          <div className="screenShareStatusIndicator">
            <div className="screenShareStatusBadge">
              <FaDesktop />
              <span>
                {screenShareParticipant.isLocal 
                  ? 'You are sharing your screen' 
                  : `${screenShareParticipant.name} is sharing screen`
                }
              </span>
            </div>
          </div>
        )}
        <div className="meetingDurationDisplay">
          {meetingStartTime && (
            <span>{Math.floor((Date.now() - meetingStartTime) / 60000)} min</span>
          )}
        </div>
      </div>

      {/* Connection Quality Indicator */}
      <div className="connectionQualityIndicator connectionStatusGood">
        <div className="connectionStatusDot"></div>
        <span>Excellent Connection</span>
      </div>

      {/* Professional Video Grid Layout with Screen Share Support */}
      <div className={`professionalVideoGridLayout ${isScreenShareActive ? 'screenShareLayoutMode' : 'standardLayoutMode'}`}>
        {/* Primary Video Display Area */}
        {isScreenShareActive ? (
          <div className="primaryVideoDisplayContainer screenShareActiveContainer">
            {screenShareParticipant?.isLocal ? (
              // Local Screen Share Display
              <div className="screenShareVideoContainer localScreenShare">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="participantVideoStream screenShareStream"
                />
                <div className="videoOverlayControlsPanel screenShareOverlay">
                  <div className="participantIdentificationLabel">Your Screen</div>
                  <div className="screenShareControlsPanel">
                    <button
                      className="stopScreenSharingButton"
                      onClick={stopScreenShare}
                      title="Stop sharing screen"
                    >
                      <FaDesktop />
                      Stop Sharing
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Remote Screen Share Display
              <div className="screenShareVideoContainer remoteScreenShare">
                <div className="videoOverlayControlsPanel screenShareOverlay">
                  <div className="participantIdentificationLabel">
                    {screenShareParticipant?.name}'s Screen
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Standard Local Video Display
          <div className="participantVideoContainer localParticipantVideoContainer">
            {localStream ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="participantVideoStream localVideoStream"
              />
            ) : (
              <div className="noVideoDisplayPlaceholder">
                <div className="participantAvatarPlaceholder">
                  {profile.name?.charAt(0)?.toUpperCase() || 'Y'}
                </div>
                <div className="participantNamePlaceholder">You</div>
                <div className="participantConnectionStatus">
                  {isCameraOff ? 'Camera Disabled' : 'Connecting...'}
                </div>
              </div>
            )}
            
            <div className="videoOverlayControlsPanel">
              <div className="participantIdentificationLabel">You (Meeting Host)</div>
              <div className="participantStatusIndicatorsGroup">
                {isMicMuted && (
                  <div className="participantStatusBadge microphoneMutedBadge">
                    <FaMicrophoneSlash />
                    <span>Muted</span>
                  </div>
                )}
                {isCameraOff && (
                  <div className="participantStatusBadge cameraDisabledBadge">
                    <FaVideoSlash />
                    <span>Camera Off</span>
                  </div>
                )}
                <div className="participantStatusBadge meetingHostBadge">
                  <FaCrown />
                  <span>Host</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Participants Display Area */}
        <div className={`participantsDisplayArea ${isScreenShareActive ? 'sidebarParticipantsLayout' : 'gridParticipantsLayout'}`}>
          {/* Local Video in Sidebar During Screen Share */}
          {isScreenShareActive && !screenShareParticipant?.isLocal && (
            <div className="participantVideoContainer localParticipantVideoContainer sidebarVideoSize">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="participantVideoStream compactVideoStream"
              />
              <div className="videoOverlayControlsPanel compactOverlay">
                <div className="participantIdentificationLabel">You</div>
              </div>
            </div>
          )}

          {/* Remote Participants Video Displays */}
          {Array.from(remoteStreams.entries()).map(([socketId, stream]) => {
            const participant = meetingParticipants.find(p => p.socketId === socketId);
            return (
              <div key={socketId} className={`participantVideoContainer remoteParticipantVideoContainer ${isScreenShareActive ? 'sidebarVideoSize' : 'standardVideoSize'}`}>
                {stream ? (
                  <video
                    ref={el => {
                      if (el && stream) {
                        el.srcObject = stream;
                      }
                    }}
                    autoPlay
                    playsInline
                    className={`participantVideoStream ${isScreenShareActive ? 'compactVideoStream' : 'standardVideoStream'}`}
                  />
                ) : (
                  <div className="noVideoDisplayPlaceholder">
                    <div className="participantAvatarPlaceholder">
                      {participant?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="participantNamePlaceholder">
                      {participant?.name || 'Unknown Participant'}
                    </div>
                    <div className="participantConnectionStatus">Connecting...</div>
                  </div>
                )}
                
                <div className="videoOverlayControlsPanel">
                  <div className="participantIdentificationLabel">
                    {participant?.name || 'Unknown Participant'}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Available Participant Slots */}
          {!isScreenShareActive && Array.from({ length: Math.max(0, 4 - 1 - remoteStreams.size) }).map((_, index) => (
            <div key={`availableSlot-${index}`} className="participantVideoContainer availableParticipantSlot">
              <div className="noVideoDisplayPlaceholder">
                <div className="participantAvatarPlaceholder availableSlotIcon">
                  <FaUserPlus />
                </div>
                <div className="participantNamePlaceholder">Waiting for participants...</div>
                <div className="participantConnectionStatus">Available Slot</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Meeting Controls Panel */}
      <div className="professionalMeetingControlsPanel">
        <button
          className={`meetingControlButton microphoneControlButton ${isMicMuted ? 'controlButtonMuted' : 'controlButtonActive'}`}
          onClick={toggleMicrophone}
          title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMicMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>

        <button
          className={`meetingControlButton cameraControlButton ${isCameraOff ? 'controlButtonDisabled' : 'controlButtonActive'}`}
          onClick={toggleCamera}
          title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isCameraOff ? <FaVideoSlash /> : <FaVideo />}
        </button>

        {/* Professional Screen Share Control */}
        <button
          className={`meetingControlButton screenShareControlButton ${isScreenSharing ? 'controlButtonSharing' : 'controlButtonInactive'}`}
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
          disabled={isScreenShareActive && !screenShareParticipant?.isLocal}
        >
          <FaDesktop />
          <span className="controlButtonLabel">
            {isScreenSharing ? 'Stop Share' : 'Share Screen'}
          </span>
        </button>

        <button
          className="meetingControlButton settingsControlButton"
          title="Meeting settings"
        >
          <FaCog />
        </button>

        <button
          className="meetingControlButton leaveMeetingButton"
          onClick={leaveTeamMeeting}
          title="Leave meeting"
        >
          <FaPhoneSlash />
        </button>
      </div>

      {/* Participants Panel Toggle */}
      <button
        className="participantsPanelToggleButton"
        onClick={() => setShowParticipants(!showParticipants)}
        title="Show participants"
      >
        <FaUsers />
        {meetingParticipants.length > 0 && (
          <span className="participantCountIndicator">{meetingParticipants.length + 1}</span>
        )}
      </button>
    </div>
  </div>
)}



        {/* Error Display */}
        {chatError && (
          <div className="chat-error">
            <FaExclamationTriangle />
            <span>{chatError}</span>
            <button onClick={() => setChatError(null)}>
              <FaTimes />
            </button>
          </div>
        )}

        {/* Messages Container */}
         <div className={`chat-messages ${showMeetingInterface ? 'with-meeting' : ''}`}>
          {isLoadingMessages && messages.length === 0 && isInitialLoad ? (
            <div className="loading-messages">
              <FaSpinner className="spinning-student" />
              <span>Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="no-messages">
              <FaComments className="chat-icon" />
              <h4>No messages yet</h4>
              <p>Start the conversation with your team!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMyMessage = msg.senderType === 'student' 
                ? (msg.senderId === profile._id || msg.senderIdentifier === profile.studentId)
                : false;
                
              const showAvatar = index === 0 ||
                messages[index - 1].senderId !== msg.senderId ||
                messages[index - 1].senderType !== msg.senderType;

              return (
                <div
                  key={msg._id || index}
                  className={`message ${isMyMessage ? "sent" : "received"} ${msg.senderType === 'faculty' ? 'faculty-message' : ''}`}
                >
                  {!isMyMessage && showAvatar && (
                    <div className="message-avatar">
                      {renderMessageAvatar(msg)}
                    </div>
                  )}

                  <div className="message-content">
                    {!isMyMessage && showAvatar && (
                      <div className="message-sender">
                        <span className="sender-name">
                          {msg.senderType === 'faculty' && <FaChalkboardTeacher className="faculty-icon" />}
                          {msg.senderName}
                          {msg.senderType === 'faculty' && <span className="faculty-badge">Supervisor</span>}
                        </span>
                        <span className="sender-id">
                          {msg.senderType === 'faculty' ? 'Faculty' : `(${msg.senderIdentifier})`}
                        </span>
                      </div>
                    )}

                    <div className="message-bubble">
                      {msg.messageType === "file" || msg.messageType === "image" ? (
                        renderFileMessage(msg)
                      ) : (
                        <div className="text-message">
                          {msg.message}
                          {msg.isEdited && (
                            <span className="edited-indicator">(edited)</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="message-timestamp">
                      {formatMessageTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Enhanced Message Input with File Upload */}
        <div className="chat-input">
          <div className="input-group">
            <FileUpload
              onFileSelect={setSelectedFile}
              uploading={uploading}
              uploadProgress={uploadProgress}
              selectedFile={selectedFile}
              onRemoveFile={() => setSelectedFile(null)}
            />

            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={uploading}
            />

            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={uploading || (!message.trim() && !selectedFile)}
            >
              {uploading ? (
                <FaSpinner className="spinning-student" />
              ) : (
                <FaPaperPlane />
              )}
            </button>
          </div>

          {/* Typing indicator area */}
          <div className="typing-indicator">
            {/* Future: Add typing indicators here */}
          </div>
        </div>
      </>
    ) : (
      <div className="no-team-chat">
        <FaComments className="chat-icon" />
        <h3>No Team Assigned</h3>
        <p>Join or create a CSE 400 Capstone Project team to start chatting with your teammates</p>
        <div className="action-buttons">
          <button
            className="primary-btn"
            onClick={() => setActiveTab("join-team")}
          >
            <FaUsers />
            Join CSE 400 Project Team
          </button>
          <button
            className="secondary-btn"
            onClick={() => setActiveTab("create-team")}
          >
            <FaUserPlus />
            Create CSE 400 Project Team
          </button>
        </div>
      </div>
    )}
  </div>
)}

        {/* Leader Confirmation Modal */}
        {showLeaderConfirmModal && selectedMemberForLeader && (
          <div className="leader-confirmation-overlay" onClick={cancelMakeLeader}>
            <div className="leader-confirmation-modal" onClick={(e) => e.stopPropagation()}>
              <div className="confirmation-header">
                <div className="confirmation-icon">
                  <FaCrown />
                </div>
                <h3>Transfer Team Leadership</h3>
              </div>

              <div className="confirmation-body">
                <div className="member-info">
                  <div className="member-avatar-large">
                    {selectedMemberForLeader.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-details">
                    <h4>{selectedMemberForLeader.name}</h4>
                    <p>will become the new team leader</p>
                  </div>
                </div>

                <div className="confirmation-message">
                  <FaInfoCircle className="info-icon" />
                  <div className="message-content">
                    <p><strong>Are you sure you want to make {selectedMemberForLeader.name} the team leader?</strong></p>
                    <p>You will become a regular team member and lose leadership privileges.</p>
                  </div>
                </div>

                <div className="leadership-changes">
                  <h5>What will happen:</h5>
                  <ul>
                    <li>• {selectedMemberForLeader.name} will gain full team management rights</li>
                    <li>• You will become a regular team member</li>
                    <li>• Leadership transfer cannot be undone by you</li>
                    <li>• The new leader can manage team settings and members</li>
                  </ul>
                </div>
              </div>

              <div className="confirmation-actions">
                <button
                  className="cancel-leader-btn"
                  onClick={cancelMakeLeader}
                >
                  <FaTimes />
                  Cancel
                </button>
                <button
                  className="confirm-leader-btn"
                  onClick={confirmMakeLeader}
                  disabled={isMakingLeader} // ✅ Disable while loading
                >
                  {isMakingLeader ? (
                    <>
                      <FaSpinner className="spinning-student" /> Making Leader...
                    </>
                  ) : (
                    <>
                      <FaCrown /> Make Leader
                    </>
                  )}
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
                  <FaExclamationTriangle />
                </div>
                <h3>Remove Team Member</h3>
              </div>

              <div className="modal-body">
                <div className="member-info-display">
                  <div className="member-avatar-display">
                    {selectedMemberForRemoval.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-details-display">
                    <h4>{selectedMemberForRemoval.name}</h4>
                    <p>will be removed from the team</p>
                  </div>
                </div>

                <div className="warning-message">
                  <FaInfoCircle className="info-icon" />
                  <div className="message-content">
                    <p><strong>Are you sure you want to remove {selectedMemberForRemoval.name} from the team?</strong></p>
                    <p>This action cannot be undone and will:</p>
                  </div>
                </div>

                <div className="removal-consequences">
                  <ul>
                    <li>• Remove them from all team activities</li>
                    <li>• Remove their access to team chat</li>
                    <li>• Allow them to join other teams</li>
                    <li>• Notify them of the removal</li>
                  </ul>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-remove-btn"
                  onClick={cancelRemoveMember}
                  disabled={isRemovingMember}
                >
                  <FaTimes />
                  Cancel
                </button>
                <button
                  className="confirm-remove-btn"
                  onClick={confirmRemoveMember}
                  disabled={isRemovingMember}
                >
                  {isRemovingMember ? (
                    <>
                      <FaSpinner className="spinning-student" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <FaUserMinus />
                      Remove Member
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

       {activeTab === "grades" && (
  <div className="grades-container">
    <div className="grades-header">
      <h2>My Capstone Grades</h2>
      <button className="refresh-btn" onClick={fetchFinalizedGrades}>
        <FaSync />
        Refresh
      </button>
    </div>

    {isLoadingGrades ? (
      <div className="loading-grades">
        <FaSpinner className="spinning" />
        Loading grades...
      </div>
    ) : finalizedGrades.length > 0 ? (
      <div className="grades-list">
        {finalizedGrades.map((gradeRecord) => (
          <div key={`${gradeRecord.phase}-${gradeRecord.teamId}`} className="grade-card">
            <div className="grade-header">
              <h3>Phase {gradeRecord.phase} - {gradeRecord.teamName}</h3>
              <div className="grade-badges">
                <span className={`grade-badge ${gradeRecord.grade.toLowerCase()}`}>
                  {gradeRecord.grade}
                </span>
                <span className="mark-badge">
                  {gradeRecord.finalMark}%
                </span>
              </div>
            </div>
            
            <div className="grade-details">
              <div className="detail-item">
                <strong>Board:</strong> {gradeRecord.boardName}
              </div>
              <div className="detail-item">
                <strong>GPA:</strong> {gradeRecord.gpa}
              </div>
              <div className="detail-item">
                <strong>Finalized:</strong> {formatDate(gradeRecord.finalizedAt)}
              </div>
              
              {gradeRecord.isModified && (
                <div className="modification-notice">
                  <FaInfoCircle className="info-icon" />
                  <div>
                    <strong>Grade Modified by Admin</strong>
                    {gradeRecord.modificationReason && (
                      <p>Reason: {gradeRecord.modificationReason}</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grade-breakdown">
                <h5>Grade Breakdown:</h5>
                <p>{gradeRecord.breakdown.finalCalculation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="no-grades">
        <FaTrophy className="empty-icon" />
        <h3>No Grades Available</h3>
        <p>Your capstone grades will appear here once evaluations are completed and finalized by administration.</p>
      </div>
    )}
  </div>
)}
        {/* Materials View */}
       {/* Materials View - Updated with Real Data */}
{/* Materials View - Formal Design */}
{activeTab === "materials" && (
  <div className="materials-page">
    {/* Page Header */}
    <div className="materials-page-header">
      <div className="header-content">
        <div className="header-text">
          <h1 className="page-title">
            <FaBookOpen className="title-icon" />
            Learning Materials
          </h1>
          <p className="page-subtitle">
            Access course materials, resources, and documentation for your academic journey
          </p>
        </div>
        
      </div>
    </div>

    {/* Search and Filter Section */}
    <div className="materials-controls-section">
      <div className="controls-container">
        <div className="search-section">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search materials by title or description..."
              value={materialSearch}
              onChange={(e) => setMaterialSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="filter-section">
          <div className="filter-group">
            <label className="filter-label">
              <FaFilter className="filter-icon" />
              Category
            </label>
            <select
              className="filter-select"
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {getAvailableCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <button 
            className="refresh-btn"
            onClick={loadMaterials}
            title="Refresh materials"
          >
            <FaSync className="refresh-icon" />
            Refresh
          </button>
        </div>
      </div>
    </div>

    {/* Content Area */}
    <div className="materials-content-area">
      {isLoadingMaterials ? (
        <div className="materials-loading-state">
          <div className="loading-content">
            <FaSpinner className="loading-spinner" />
            <h3>Loading Materials</h3>
            <p>Please wait while we fetch your learning materials...</p>
          </div>
        </div>
      ) : materialsError ? (
        <div className="materials-error-state">
          <div className="error-content">
            <FaExclamationTriangle className="error-icon" />
            <h3>Unable to Load Materials</h3>
            <p className="error-message">{materialsError}</p>
            <button className="retry-button" onClick={loadMaterials}>
              <FaSync className="retry-icon" />
              Try Again
            </button>
          </div>
        </div>
      ) : getFilteredMaterials().length > 0 ? (
        <div className="materials-grid">
          {getFilteredMaterials().map((material) => (
            <div key={material._id} className="material-card">
              {/* Card Header */}
              <div className="material-card-header">
                <div className="file-type-indicator">
                  <div className="file-icon-container">
                    {material.fileType?.includes('pdf') && (
                      <FaFilePdf className="file-icon pdf" />
                    )}
                    {material.fileType?.includes('word') && (
                      <FaFileWord className="file-icon word" />
                    )}
                    {material.fileType?.includes('powerpoint') && (
                      <FaFilePowerpoint className="file-icon powerpoint" />
                    )}
                    {material.fileType?.includes('image') && (
                      <FaFileAlt className="file-icon image" />
                    )}
                    {!['pdf', 'word', 'powerpoint', 'image'].some(type => 
                      material.fileType?.includes(type)) && (
                      <FaFileAlt className="file-icon default" />
                    )}
                  </div>
                </div>
                
                <div className="material-meta">
                  {material.category && (
                    <span className="category-badge">{material.category}</span>
                  )}
                  <span className="upload-date">{formatDate(material.uploadDate)}</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="material-card-content">
                <h3 className="material-title">{material.title}</h3>
                
                {material.description && (
                  <p className="material-description">{material.description}</p>
                )}

                {/* Material Details */}
                <div className="material-details-grid">
                  <div className="detail-row">
                    <div className="detail-item">
                      <FaChalkboardTeacher className="detail-icon" />
                      <span className="detail-label">Instructor:</span>
                      <span className="detail-value">{material.uploadedByName}</span>
                    </div>
                  </div>
                  
                  <div className="detail-row">
                    <div className="detail-item">
                      <FaFile className="detail-icon" />
                      <span className="detail-label">File:</span>
                      <span className="detail-value">{material.fileName}</span>
                    </div>
                  </div>
                  
                  <div className="detail-row">
                    <div className="detail-item">
                      <FaCalendar className="detail-icon" />
                      <span className="detail-label">Published:</span>
                      <span className="detail-value">{formatDate(material.uploadDate)}</span>
                    </div>
                  </div>
                  
                  {material.fileSize && (
                    <div className="detail-row">
                      <div className="detail-item">
                        <FaArchive className="detail-icon" />
                        <span className="detail-label">Size:</span>
                        <span className="detail-value">{formatFileSize(material.fileSize)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Target Audience */}
                {material.targetType && (
                  <div className="target-audience-section">
                    <div className="audience-label">
                      <FaUsers className="audience-icon" />
                      <span>Target Audience:</span>
                    </div>
                    <div className="audience-badges">
                      <span className="audience-badge">
                        {material.targetType === 'all' && 'All Students'}
                        {material.targetType === 'phase' && `Phase ${material.targetPhase} Students`}
                        {material.targetType === 'teams' && 'Selected Teams'}
                        {material.targetType === 'students' && 'Individual Students'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="material-card-actions">
                <div className="download-info">
                  {material.downloadCount > 0 && (
                    <div className="download-stats">
                      <FaDownload className="download-stat-icon" />
                      <span>{material.downloadCount} downloads</span>
                    </div>
                  )}
                </div>
                
                <button
                  className="download-button"
                  onClick={() => handleDownload(material._id, material.fileName)}
                  title={`Download ${material.fileName}`}
                >
                  <FaDownload className="download-btn-icon" />
                  <span>Download Material</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="materials-empty-state">
          <div className="empty-content">
            <FaBookOpen className="empty-icon" />
            <h3>No Materials Available</h3>
            <p className="empty-message">
              {materials.length === 0 
                ? "No learning materials have been shared with you yet. Check back later for updates from your instructors." 
                : "No materials match your current search criteria. Try adjusting your filters or search terms."}
            </p>
            
            {(materialSearch || materialFilter) && (
              <button 
                className="clear-filters-button"
                onClick={() => {
                  setMaterialSearch("");
                  setMaterialFilter("");
                }}
              >
                <FaTimes className="clear-icon" />
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
)}


{activeTab === "deliverables" && (
  <div className="content-box">
    <StudentDeliverables />
  </div>
)}


{activeTab === "progress" && (
  <StudentProgress 
    myTeam={myTeam}
    teamProgress={teamProgress}
    onRefreshProgress={loadTeamProgress}
  />
)}

        {/* Faculty View */}
        {/* Faculty View - Updated with Real Data */}
        {activeTab === "faculty" && (
          <div className="fpage-container">
            <div className="fpage-header">
              <h1>
                <FaChalkboardTeacher className="section-icon" />
                Available Faculty for Supervision
              </h1>
              <p>Connect with faculty members for your CSE 400 Capstone Project supervision</p>
            </div>

            <div className="fpage-search-filter">
              <div className="fpage-search-box">
                <FaSearch className="fpage-search-icon" />
                <input
                  type="text"
                  placeholder="Search faculty by name, department, or expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="fpage-refresh-container">
                <button
                  className="fpage-refresh-btn"
                  onClick={fetchFaculty}
                  disabled={isLoadingFaculty}
                >
                  <FaSync className={isLoadingFaculty ? 'spinning-student' : ''} />
                  Refresh Faculty List
                </button>
              </div>

              <div className="fpage-filter-controls">
                <div className="fpage-filter-group">
                  <label>
                    <FaFilter />
                    Department
                  </label>
                  <select
                    className="fpage-filter-select"
                    value={selectedMajor}
                    onChange={(e) => setSelectedMajor(e.target.value)}
                  >
                    <option value="">All Department</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>
              </div>
            </div>

            {isLoadingFaculty ? (
              <div className="fpage-loading-state">
                <FaSpinner className="spinning-student" />
                <p>Loading faculty information...</p>
              </div>
            ) : facultyError ? (
              <div className="fpage-error-state">
                <FaExclamationTriangle />
                <p>{facultyError}</p>
                <button className="retry-btn" onClick={fetchFaculty}>
                  Try Again
                </button>
              </div>
            ) : (
              <div className="fpage-grid">
                {facultyData
                  .filter((faculty) => {
                    const matchesSearch = faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      faculty.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      faculty.email.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesDepartment = selectedMajor ? faculty.department === selectedMajor : true;
                    return matchesSearch && matchesDepartment;
                  })
                  .map((faculty) => (
                    <div key={faculty._id} className="fpage-card">
                      <div className="fpage-card-header">
                        <div className="fpage-avatar-container">
                          {(faculty.avatar || faculty.profilePicture) ? (
                            <img
                              src={faculty.avatar || faculty.profilePicture}
                              alt={`${faculty.name}'s profile photo`}
                              className="fpage-avatar-img"
                              onError={(e) => {
                                console.log(`Failed to load avatar for ${faculty.name}`);
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                              onLoad={(e) => {
                                console.log(`Successfully loaded avatar for ${faculty.name}`);
                                e.target.nextElementSibling.style.display = 'none';
                              }}
                            />
                          ) : null}

                          {/* ✅ IMPROVED: Enhanced fallback avatar */}
                          <div
                            className="fpage-avatar-fallback"
                            style={{
                              display: (faculty.avatar || faculty.profilePicture) ? 'none' : 'flex'
                            }}
                          >
                            {faculty.name
                              .split(" ")
                              .map(n => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2) // Limit to 2 characters max
                            }
                          </div>
                        </div>

                        <div className="fpage-info">
                          <h3>{faculty.name}</h3>
                          <div className="fpage-role">{faculty.role || faculty.position || 'Professor'}</div>
                          <div className="fpage-availability">
                            <span className="available">
                              <FaCheckCircle />
                              Available for Supervision
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="fpage-details">
                        <div className="fpage-detail-item">
                          <FaEnvelope className="fpage-detail-icon" />
                          <span className="fpage-detail-label">Email:</span>
                          <span className="fpage-detail-value">{faculty.email}</span>
                        </div>

                        <div className="fpage-detail-item">
                          <FaBuilding className="fpage-detail-icon" />
                          <span className="fpage-detail-label">Department:</span>
                          <span className="fpage-detail-value">{faculty.department}</span>
                        </div>

                        <div className="fpage-detail-item">
                          <FaMapMarkerAlt className="fpage-detail-icon" />
                          <span className="fpage-detail-label">Office:</span>
                          <span className="fpage-detail-value">{faculty.office || 'Not specified'}</span>
                        </div>

                        <div className="fpage-detail-item">
                          <FaPhone className="fpage-detail-icon" />
                          <span className="fpage-detail-label">Phone:</span>
                          <span className="fpage-detail-value">{faculty.phone || 'Not available'}</span>
                        </div>
                      </div>

                      {faculty.expertise && faculty.expertise.length > 0 && (
                        <div className="fpage-expertise-section">
                          <h5>Areas of Expertise:</h5>
                          <div className="fpage-expertise-tags">
                            {faculty.expertise.slice(0, 3).map((skill, index) => (
                              <span key={index} className="fpage-expertise-tag">{skill}</span>
                            ))}
                            {faculty.expertise.length > 3 && (
                              <span className="fpage-expertise-tag more">+{faculty.expertise.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}
                      {/* Replace the existing Request Supervision button with this */}
<div className="fpage-card-actions">
  {!myTeam ? (
    <button className="fpage-btn disabled" disabled>
      <FaUserTie />
      Join Team First
    </button>
  ) : myTeam.currentSupervisor ? (
    <button className="fpage-btn disabled" disabled>
      <FaCheckCircle />
      Team Has Supervisor
    </button>
  ) : !isLeader ? (
    <button 
      className="fpage-btn disabled" 
      disabled
      title="Only team leaders can request supervision"
    >
      <FaLock />
      Leader Only
    </button>
  ) : myTeam.members?.length < 4 ? (
    <button 
      className="fpage-btn disabled" 
      disabled
      title={`You need 4 members to request supervision. Currently you have ${myTeam.members?.length || 0}.`}
    >
      <FaUsers />
      Need 4 Members ({myTeam.members?.length || 0}/4)
    </button>
  ) : sentSupervisionRequests.has(faculty._id) || 
       myTeam.supervisionRequests?.some(req => 
         req.facultyId === faculty._id && req.status === 'pending'
       ) ? (
    <button className="fpage-btn sent" disabled>
      <FaCheckCircle />
      Request Sent
    </button>
  ) : (
    <button
      className="fpage-btn primary"
      onClick={() => handleRequestSupervision(faculty)}
      title="Request supervision from this faculty member"
    >
      <FaUserTie />
      Request Supervision
    </button>
  )}
</div>

      </div>
                  ))}
              </div>
            )}

            {facultyData.length === 0 && !isLoadingFaculty && !facultyError && (
              <div className="fpage-no-faculty">
                <FaChalkboardTeacher className="no-faculty-icon" />
                <h3>No Faculty Available</h3>
                <p>There are currently no faculty members available for supervision.</p>
              </div>
            )}

            {!myTeam && (
              <div className="fpage-team-notice">
                <FaInfoCircle className="fpage-notice-icon" />
                <div className="fpage-notice-content">
                  <h4>Team Required for Supervision Request</h4>
                  <p>You need to be part of a CSE 400 team before requesting faculty supervision.</p>
                  <div className="fpage-notice-actions">
                    <button
                      className="primary-btn"
                      onClick={() => setActiveTab("join-team")}
                    >
                      <FaUsers />
                      Join a Team
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => setActiveTab("create-team")}
                    >
                      <FaUserPlus />
                      Create a Team
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* Announcements View */}
        {activeTab === "announcements" && (
          <div className="meetings-container">
            <div className="meetings-header">
              <h2>Faculty Announcements</h2>
              <div className="refresh-controls">
                <button className="refresh-btn" onClick={handleRefreshRequests}>
                  <FaSync />
                  Refresh
                </button>
              </div>
            </div>

            <div className="announcements-list">
              {facultyAnnouncements.length > 0 ? (
                facultyAnnouncements.map((announcement) => (
                  <div key={announcement._id} className="announcement-card">
                    <div className="announcement-content">
                      <h3 className="announcement-title">
                        <FaBullhorn className="title-icon" />
                        {announcement.title}
                      </h3>
                      <p className="announcement-text">{announcement.content}</p>
                      <div className="announcement-meta">
                        <div className="meta-item">
                          <FaUser className="meta-icon" />
                          <span>{announcement.author}</span>
                        </div>
                        <div className="meta-item">
                          <FaBuilding className="meta-icon" />
                          <span>{announcement.department}</span>
                        </div>
                        <div className="meta-item">
                          <FaCalendar className="meta-icon" />
                          <span>{formatDate(announcement.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="announcement-actions">
                      <button
                        className="dismiss-btn"
                        onClick={() => handleDismiss(announcement._id)}
                        title="Dismiss announcement"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-announcements">
                  <FaBellSlash className="empty-icon" />
                  <h3>No announcements</h3>
                  <p>Check back later for updates from faculty</p>
                </div>
              )}
            </div>
          </div>
        )}


        {/* Support View */}
        {activeTab === "support" && (
          <div className="support-container">
            <div className="support-header">
              <h1>Support & Help</h1>
              <p>Submit technical issues, questions, or feedback</p>
              <button
                className="primary-btn"
                onClick={() => setShowSupportForm(true)}
              >
                <FaPlus />
                Submit New Ticket
              </button>
            </div>

            {submitSuccess && (
              <div className="success-banner">
                <FaCheckCircle />
                <span>Your support ticket has been submitted successfully!</span>
              </div>
            )}

            <div className="tickets-section">
              <h3>Your Support Tickets</h3>

              {supportTickets.length === 0 ? (
                <div className="no-tickets">
                  <FaComments className="no-tickets-icon" />
                  <p>No support tickets submitted yet</p>
                  <small>Click "Submit New Ticket" to get help with any issues</small>
                </div>
              ) : (
                <div className="tickets-list">
                  {supportTickets.map(ticket => (
                    <div key={ticket._id} className="ticket-card">
                      <div className="ticket-header">
                        <h4>{ticket.subject}</h4>
                        <div className="ticket-badges">
                          <span className={`status-badge ${ticket.status.toLowerCase().replace(' ', '-')}`}>
                            {ticket.status}
                          </span>
                          <span className={`priority-badge ${ticket.priority.toLowerCase()}`}>
                            {ticket.priority}
                          </span>
                          <span className="category-badge">{ticket.category}</span>
                        </div>
                      </div>

                      <p className="ticket-description">{ticket.description}</p>

                      {ticket.adminResponse && (
                        <div className="admin-response">
                          <h5>Admin Response:</h5>
                          <p>{ticket.adminResponse}</p>
                          <small>Responded: {formatDate(ticket.respondedAt)}</small>
                        </div>
                      )}

                      <div className="ticket-footer">
                        <small>Submitted: {formatDate(ticket.submittedAt)}</small>
                        {ticket.resolvedAt && (
                          <small>Resolved: {formatDate(ticket.resolvedAt)}</small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Support Form Modal */}
            {showSupportForm && (
              <div className="support-modal-overlay" onClick={() => setShowSupportForm(false)}>
                <div className="support-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Submit Support Ticket</h3>
                    <button
                      className="close-btn"
                      onClick={() => setShowSupportForm(false)}
                    >
                      <FaTimes />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitSupport} className="support-form">
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        value={supportForm.category}
                        onChange={(e) => setSupportForm({ ...supportForm, category: e.target.value })}
                        required
                      >
                        <option value="Technical">Technical Issue</option>
                        <option value="Academic">Academic Question</option>
                        <option value="Team">Team Management</option>
                        <option value="Account">Account Issue</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        value={supportForm.priority}
                        onChange={(e) => setSupportForm({ ...supportForm, priority: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Subject *</label>
                      <input
                        type="text"
                        value={supportForm.subject}
                        onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                        placeholder="Brief description of your issue"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Description *</label>
                      <textarea
                        value={supportForm.description}
                        onChange={(e) => setSupportForm({ ...supportForm, description: e.target.value })}
                        placeholder="Provide detailed information about your issue..."
                        rows="5"
                        required
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => setShowSupportForm(false)}
                        disabled={isSubmittingTicket}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="primary-btn"
                        disabled={isSubmittingTicket}
                      >
                        {isSubmittingTicket ? (
                          <>
                            <FaSpinner className="spinning-student" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <FaPaperPlane />
                            Submit Ticket
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile View */}
        {activeTab === "profile" && (
          <div className="profile-content">
            <div className="profile-header">
              <div className="avatar-container">
                <div className="avatar-wrapper">
                  {(profile.avatar || profile.avatarUrl) ? (
                    <img
                      src={profile.avatar || profile.avatarUrl}
                      alt="Profile"
                      className="profile-avatar"
                      onError={(e) => {
                        console.log('Avatar load error, showing fallback');
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="profile-avatar"
                    style={{
                      display: (profile.avatar || profile.avatarUrl) ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--gray-400)',
                      color: 'white',
                      fontSize: '3rem',
                      fontWeight: '600',
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%'
                    }}
                  >
                    {(profile.name || `${profile.firstName} ${profile.lastName}`)
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <button
                    className="edit-btn"
                    onClick={() => avatarInputRef.current.click()}
                    title="Change profile photo"
                  >
                    <FaEdit />
                  </button>
                </div>
                <div className="avatar-info">
                  <h2>{profile.name || `${profile.firstName} ${profile.lastName}`}</h2>
                  <div className="student-id">{profile.studentId}</div>
                  <div className="student-program">{profile.program || profile.major}</div>
                </div>
              </div>
            </div>

            {student && <StudentProfile student={student} />}

            <div className="profile-details-grid">
              <div className="detail-card">
                <h3>Academic Information</h3>
                <div className="detail-item">
                  <span>Student ID</span>
                  <span>{profile.studentId}</span>
                </div>
                <div className="detail-item">
                  <span>Program</span>
                  <span>{profile.program || profile.major}</span>
                </div>
                <div className="detail-item">
                  <span>CGPA</span>
                  <span>{profile.cgpa}</span>
                </div>
                <div className="detail-item">
                  <span>Completed Credits</span>
                  <span>{profile.completedCredits}</span>
                </div>
                <div className="detail-item">
                  <span>Current Phase</span>
                  <span>{myTeam ? "Capstone CSE 400" : "Not Enrolled"}</span>
                </div>
              </div>

              <div className="detail-card">
                <h3>Contact Information</h3>
                <div className="detail-item">
                  <span>Email</span>
                  <span>{profile.email}</span>
                </div>
                <div className="detail-item">
                  <span>Phone</span>
                  <span>{profile.phone}</span>
                </div>
                <div className="detail-item">
                  <span>Address</span>
                  <span>{profile.address}</span>
                </div>
              </div>

              <div className="detail-card">
                <h3>Additional Information</h3>
                <div className="detail-item">
  <span>Enrolled Semester</span>
  <span>{profile.enrolled ? new Date(profile.enrolled).toISOString().split('T')[0] : 'Not specified'}</span>
</div>

              </div>

              <div className="detail-card">
                <h3>Security</h3>
                <div className="security-card">
                  <div className="security-item">
                    <div className="security-info">
                      <h4>Password</h4>
                      <p>Change your account password</p>
                    </div>

                    {!showInlinePasswordForm ? (
                      <button
                        className="change-password-btn"
                        onClick={handleShowInlinePasswordForm}
                      >
                        <FaLock />
                        Change Password
                      </button>
                    ) : (
                      <div className="inline-password-form">
                        <div className="inline-form-group">
                          <label htmlFor="inlineCurrentPassword">Current Password</label>
                          <input
                            type="password"
                            id="inlineCurrentPassword"
                            value={inlinePasswordData.currentPassword}
                            onChange={(e) => setInlinePasswordData(prev => ({
                              ...prev,
                              currentPassword: e.target.value
                            }))}
                            className={inlinePasswordErrors.currentPassword ? 'error' : ''}
                            placeholder="Enter your current password"
                            disabled={isChangingPassword}
                          />
                          {inlinePasswordErrors.currentPassword && (
                            <span className="inline-error-message">{inlinePasswordErrors.currentPassword}</span>
                          )}
                        </div>

                        <div className="inline-form-group">
                          <label htmlFor="inlineNewPassword">New Password</label>
                          <input
                            type="password"
                            id="inlineNewPassword"
                            value={inlinePasswordData.newPassword}
                            onChange={(e) => setInlinePasswordData(prev => ({
                              ...prev,
                              newPassword: e.target.value
                            }))}
                            className={inlinePasswordErrors.newPassword ? 'error' : ''}
                            placeholder="Enter your new password"
                            disabled={isChangingPassword}
                          />
                          {inlinePasswordErrors.newPassword && (
                            <span className="inline-error-message">{inlinePasswordErrors.newPassword}</span>
                          )}
                        </div>

                        <div className="inline-form-group">
                          <label htmlFor="inlineConfirmPassword">Confirm New Password</label>
                          <input
                            type="password"
                            id="inlineConfirmPassword"
                            value={inlinePasswordData.confirmPassword}
                            onChange={(e) => setInlinePasswordData(prev => ({
                              ...prev,
                              confirmPassword: e.target.value
                            }))}
                            className={inlinePasswordErrors.confirmPassword ? 'error' : ''}
                            placeholder="Confirm your new password"
                            disabled={isChangingPassword}
                          />
                          {inlinePasswordErrors.confirmPassword && (
                            <span className="inline-error-message">{inlinePasswordErrors.confirmPassword}</span>
                          )}
                        </div>

                        <div className="inline-password-requirements">
                          <small>
                            Password must be at least 8 characters and contain:
                            <br />• At least one uppercase letter
                            <br />• At least one lowercase letter
                            <br />• At least one number
                          </small>
                        </div>

                        <div className="inline-form-actions">
                          <button
                            className="inline-cancel-btn"
                            onClick={handleCancelInlinePasswordChange}
                            disabled={isChangingPassword}
                          >
                            Cancel
                          </button>
                          <button
                            className="inline-ok-btn"
                            onClick={handleInlinePasswordChange}
                            disabled={isChangingPassword}
                          >
                            {isChangingPassword ? 'Changing...' : 'OK'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="detail-card">
                <h3>Skills & Expertise</h3>
                {!showSkillsEdit ? (
                  <div className="skills-display">
                    <div className="current-skills">
                      {(profile.skills && profile.skills.length > 0) ? (
                        <div className="skills-list">
                          {profile.skills.map((skill, index) => (
                            <span key={index} className="skill-tag">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="no-skills">No skills added yet</p>
                      )}
                    </div>

                    <button
                      className="edit-skills-btn"
                      onClick={() => setShowSkillsEdit(true)}
                    >
                      <FaPlus />
                      {profile.skills && profile.skills.length > 0 ? 'Edit Skills' : 'Add Skills'}
                    </button>
                  </div>
                ) : (
                  <div className="skills-edit-form">
                    <div className="skills-input-section">
                      <div className="skills-input-wrapper">
                        <input
                          type="text"
                          placeholder="Add a skill (e.g., JavaScript, Python, React)"
                          value={newSkillInput}
                          onChange={(e) => setNewSkillInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddSkill();
                            }
                          }}
                          maxLength="50"
                        />
                        <button
                          className="add-skill-btn"
                          onClick={handleAddSkill}
                          disabled={!newSkillInput.trim()}
                        >
                          <FaPlus />
                          Add
                        </button>
                      </div>
                      <small>Press Enter or click Add to add a skill (max 10 skills)</small>
                    </div>

                    <div className="editing-skills-list">
                      {editingSkills.map((skill, index) => (
                        <div key={index} className="editing-skill-item">
                          <span className="skill-text">{skill}</span>
                          <button
                            className="remove-skill-btn"
                            onClick={() => handleRemoveSkill(index)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="skills-form-actions">
                      <button
                        className="cancel-skills-btn"
                        onClick={handleCancelSkillsEdit}
                      >
                        Cancel
                      </button>
                      <button
                        className="save-skills-btn"
                        onClick={handleSaveSkills}
                        disabled={isSavingSkills}
                      >
                        {isSavingSkills ? (
                          <>
                            <FaSpinner className="spinning-student" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaSave />
                            Save Skills
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
            {student && student.isInTeam && <TeamInfo />}
          </div>
        )}

      </main>

      {/* Notification Panel */}

      {/* Enhanced Sent Invitations Modal */}
      {showRequestStatus && (
        <div className="sent-invitations-overlay" onClick={() => setShowRequestStatus(false)}>
          <div className="sent-invitations-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-section">
              <div className="header-content">
                <h3 className="modal-title">
                  <FaEnvelope className="title-icon" />
                  Sent Team Invitations
                </h3>
                <div className="invitation-summary">
                  {pendingRequests.length} pending invitation{pendingRequests.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="header-actions">
                <button
                  className="refresh-sent-requests-btn"
                  onClick={loadSentRequests}
                  title="Refresh sent requests"
                >
                  <FaSync />
                  Refresh
                </button>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowRequestStatus(false)}
                  aria-label="Close modal"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="modal-body-section">
              {pendingRequests.length > 0 ? (
                <div className="invitations-list">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="invitation-item">
                      <div className="invitation-header">
                        <div className="student-avatar">
                          {request.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div className="invitation-details">
                          <h5 className="student-name">{request.studentName}</h5>
                          <div className="student-info">
                            <span className="student-id">ID: {request.studentIdNumber}</span>
                            <span className="team-name">Team: {request.teamName}</span>
                          </div>
                        </div>
                        <div className="invitation-status">
                          <span className="status-badge pending">
                            <FaClock className="status-icon" />
                            Pending
                          </span>
                        </div>
                      </div>

                      <div className="invitation-meta">
                        <div className="sent-date">
                          <FaCalendar className="date-icon" />
                          Sent: {formatDate(request.sentDate)}
                        </div>
                        <div className="project-preview">
                          <strong>Project:</strong> {request.teamData?.projectIdea || 'No description'}
                        </div>
                      </div>

                      <div className="invitation-actions">
                        <button
                          className="cancel-invitation-btn"
                          onClick={() => handleCancelRequest(request.id, request.studentName)}
                          title="Cancel this invitation"
                        >
                          <FaTimes className="cancel-icon" />
                          Cancel Invitation
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-invitations">
                  <div className="empty-state">
                    <FaEnvelope className="empty-icon" />
                    <h4>No invitations sent</h4>
                    <p>Send invitations to students to see them here</p>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer-section">
              <div className="invitation-legend">
                <h5>Invitation Status Guide:</h5>
                <div className="legend-items">
                  <div className="legend-item">
                    <FaClock className="legend-icon pending" />
                    <span>Pending - Waiting for student response</span>
                  </div>
                  <div className="legend-item">
                    <FaTimes className="legend-icon cancelled" />
                    <span>You can cancel pending invitations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Member Details Modal */}
      {showMemberDetailsModal && (
        <div className="member-details-overlay" onClick={() => setShowMemberDetailsModal(false)}>
          <div className="member-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FaUsers />
                Team Members - {myTeam.name}
              </h3>
              <button
                className="close-modal-btn"
                onClick={() => setShowMemberDetailsModal(false)}
                title="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="team-info-summary">
                <div className="team-stats-row">
                  <span><FaGraduationCap /> {myTeam.major}</span>
                  <span><FaBookOpen /> {"CSE 400"}</span>
                  <span><FaUsers /> {myTeam.members?.length}/4 Members</span>
                </div>
              </div>

              <div className="members-list-modal">
                {myTeam.members?.map((member, index) => (
                  <div key={index} className="member-item-modal">
                    <div className="member-avatar-container">
                      {member.avatarUrl || member.avatar ? (
                        <img
                          src={member.avatarUrl || member.avatar}
                          alt={member.name}
                          className="member-profile-pic"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="member-avatar-fallback"
                        style={{
                          display: (member.avatarUrl || member.avatar) ? 'none' : 'flex'
                        }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <div className="member-info-modal">
                      <div className="member-name-role">
                        <span className="member-name">{member.name}</span>
                        <span className="member-role">
                          {member.role}
                          {member.role === 'Leader' && <FaCrown className="crown-icon" />}
                        </span>
                      </div>
                      <span className="member-id">ID: {member.studentId}</span>
                    </div>

                    {/* Leader Management Actions */}
                    {isLeader && member.studentId !== profile.studentId && (
                      <div className="member-actions-modal">
                        <button
                          className="make-leader-btn-modal"
                          onClick={() => {
                            handleMakeLeader(member.studentId, member.name);
                            setShowMemberDetailsModal(false);
                          }}
                          title="Make this member the team leader"
                        >
                          <FaCrown />
                          Make Leader
                        </button>

                        {myTeam.members.length > 2 && (
                          <button
                            className="remove-member-btn-modal"
                            onClick={() => {
                              handleRemoveMember(member.studentId, member.name);
                              setShowMemberDetailsModal(false);
                            }}
                            title="Remove this member from team"
                          >
                            <FaUserMinus />
                            Remove
                          </button>
                        )}
                      </div>
                    )}

                    {/* Current User Indicator */}
                    {member.studentId === profile.studentId && (
                      <div className="current-user-indicator">
                        <span className="you-label">
                          {isLeader ? 'You (Leader)' : 'You'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Dismiss Team Button (only for leaders with 2 members) */}
              {isLeader && myTeam.members.length <= 2 && (
                <div className="modal-footer">
                  <button
                    className="dismiss-team-btn-modal"
                    onClick={() => {
                      handleDismissTeam();
                      setShowMemberDetailsModal(false);
                    }}
                    title="Dismiss the entire team"
                  >
                    <FaTrash />
                    Dismiss Team
                  </button>
                </div>
              )}

              {/* Management Rules for Leaders */}
              {isLeader && (
                <div className="management-rules-modal">
                  <h5><FaInfoCircle /> Management Options:</h5>
                  <ul>
                    <li>• Tap any member to make them team leader</li>
                    <li>• Remove members only if team has 3+ members</li>
                    {myTeam.members.length <= 2 && <li>• With 2 members, you can dismiss the entire team</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

{/* Team Requests Modal */}
{showTeamRequests && (
  <div className="team-requests-overlay" onClick={() => setShowTeamRequests(false)}>
    <div className="team-requests-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>
          <FaEnvelope />
          Team Sent Invitations - {myTeam?.name}
        </h3>
        <button
          className="close-modal-btn"
          onClick={() => setShowTeamRequests(false)}
        >
          <FaTimes />
        </button>
      </div>

      <div className="modal-body">
        {teamRequests.length === 0 ? (
          <div className="no-requests">
            <FaEnvelope className="empty-icon" />
            <p>No team invitations sent yet</p>
            <small>Team members can invite active students to join</small>
          </div>
        ) : (
          <div className="requests-list">
{teamRequests
  .filter(request => request && request.targetStudent && request.senderInfo) // ✅ Extra safety
  .map((request) => (
              <div key={request._id} className="request-item">
                <div className="request-header">
                  <div className="student-avatar">
                    {request.targetStudent.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="request-details">
                    <h5>{request.targetStudent.name}</h5>
                    <span className="student-id">ID: {request.targetStudent.studentId}</span>
                    <span className="program">{request.targetStudent.program}</span>
                  </div>
                  <div className="request-status">
                    <span className={`status-badge ${request.status}`}>
                      {request.status === 'pending' ? (
                        <>
                          <FaClock className="status-icon" />
                          {request.requiresLeaderApproval ? 'Pending Student Response' : 'Pending Response'}
                        </>
                      ) : request.status === 'awaiting_leader' ? (
                        <>
                          <FaUserTie className="status-icon" />
                          Awaiting Leader Approval
                        </>
                      ) : request.status === 'accepted' ? (
                        <>
                          <FaCheckCircle className="status-icon" />
                          Accepted & Joined
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="status-icon" />
                          Declined
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="request-meta">
                  <div className="sent-by">
                    <FaUser className="icon" />
                    Sent by: <strong>{request.senderInfo.name}</strong>
                  </div>
                  <div className="sent-date">
                    <FaCalendar className="icon" />
                    {formatDate(request.sentDate)}
                  </div>
                  {request.requiresLeaderApproval && (
                    <div className="approval-note">
                      <FaInfoCircle className="icon" />
                      {request.status === 'awaiting_leader' 
                        ? 'Student accepted - needs leader approval'
                        : 'Will need leader approval if accepted'
                      }
                    </div>
                  )}
                </div>


                {/* Leader approval section */}

  {isLeader && request.status === 'awaiting_leader' && (
  <div className="leader-approval-section">
    <h6>
      <FaUserTie />
      {request.targetStudent.name} wants to join your team
    </h6>
    <div className="approval-actions">
      <button
        className="approve-btn"
        onClick={() => handleLeaderApproval(request._id, 'approve')}
        disabled={approvingRequestId === request._id || rejectingRequestId === request._id}
      >
        {approvingRequestId === request._id ? (
          <>
            <FaSpinner className="spinning-student" />
            Approving...
          </>
        ) : (
          <>
            <FaCheck />
            Approve & Add to Team
          </>
        )}
      </button>
      <button
        className="reject-btn"
        onClick={() => handleLeaderApproval(request._id, 'reject')}
        disabled={approvingRequestId === request._id || rejectingRequestId === request._id}
      >
        {rejectingRequestId === request._id ? (
          <>
            <FaSpinner className="spinning-student" />
            Rejecting...
          </>
        ) : (
          <>
            <FaTimes />
            Reject
          </>
        )}
      </button>
    </div>
  </div>
)}



              </div>
            ))}
          </div>
        )}
      </div>

      <div className="modal-footer">
        <div className="requests-legend">
          <h5>Request Status Guide:</h5>
          <div className="legend-items">
            <div className="legend-item">
              <FaClock className="legend-icon pending" />
              <span>Pending - Waiting for student response</span>
            </div>
            <div className="legend-item">
              <FaUserTie className="legend-icon awaiting" />
              <span>Awaiting Leader - Student accepted, needs leader approval</span>
            </div>
            <div className="legend-item">
              <FaCheckCircle className="legend-icon accepted" />
              <span>Accepted - Student joined the team</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}


{/* Supervision Request Modal */}
{showSupervisionModal && selectedFacultyForSupervision && (
  <div className="supervision-modal-overlay" onClick={handleCloseSupervisionModal}>
    <div className="supervision-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>
          <FaUserTie />
          Request Supervision from {selectedFacultyForSupervision.name}
        </h3>
        <button
          className="close-modal-btn"
          onClick={handleCloseSupervisionModal}
          disabled={isSendingSupervisionRequest}
        >
          <FaTimes />
        </button>
      </div>

      <div className="modal-body">
        <div className="faculty-info-summary">
          <div className="faculty-avatar">
            {(selectedFacultyForSupervision.avatar || selectedFacultyForSupervision.profilePicture) ? (
              <img
                src={selectedFacultyForSupervision.avatar || selectedFacultyForSupervision.profilePicture}
                alt={selectedFacultyForSupervision.name}
                className="faculty-avatar-img"
              />
            ) : (
              <div className="faculty-avatar-fallback">
                {selectedFacultyForSupervision.name
                  .split(" ")
                  .map(n => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
          </div>
          <div className="faculty-details">
            <h4>{selectedFacultyForSupervision.name}</h4>
            <p>{selectedFacultyForSupervision.department}</p>
            <p>{selectedFacultyForSupervision.email}</p>
          </div>
        </div>

        <div className="team-info-summary">
          <h5>Your Team: {myTeam?.name}</h5>
          <div className="team-stats">
            <span><FaUsers /> {myTeam?.members?.length} members</span>
            <span><FaGraduationCap /> {myTeam?.major}</span>
            <span><FaBookOpen /> CSE 400</span>
          </div>
        </div>

        <div className="message-section">
          <label htmlFor="supervisionMessage">
            <FaComment />
            Message to Faculty (Optional)
          </label>
          <textarea
            id="supervisionMessage"
            value={supervisionMessage}
            onChange={(e) => setSupervisionMessage(e.target.value)}
            placeholder={`Leave blank for default message: "Team "${myTeam?.name}" requests supervision for CSE 400 project"`}
            rows="4"
            disabled={isSendingSupervisionRequest}
            maxLength="500"
          />
          <small className="character-count">
            {supervisionMessage.length}/500 characters
          </small>
        </div>

        <div className="message-preview">
          <h6>Message Preview:</h6>
          <div className="preview-box">
            {supervisionMessage.trim() || `Team "${myTeam?.name}" requests supervision for CSE 400 project`}
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button
          className="cancel-btn"
          onClick={handleCloseSupervisionModal}
          disabled={isSendingSupervisionRequest}
        >
          <FaTimes />
          Cancel
        </button>
        <button
          className="send-request-btn"
          onClick={handleSubmitSupervisionRequest}
          disabled={isSendingSupervisionRequest}
        >
          {isSendingSupervisionRequest ? (
            <>
              <FaSpinner className="spinning-student" />
              Sending...
            </>
          ) : (
            <>
              <FaUserTie />
              Send Request
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}

{/* Team Members Details Modal */}
{showTeamMembersModal && selectedTeamForDetails && (
  <div className="team-members-modal-overlay" onClick={handleCloseTeamMembersModal}>
    <div className="team-members-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <div className="modal-title-section">
          <h3>
            <FaUsers className="modal-icon" />
            Team "{selectedTeamForDetails.name}" Members
          </h3>
          <div className="team-summary">
            <span className="team-major">{selectedTeamForDetails.major}</span>
            <span className="member-count">{selectedTeamForDetails.members?.length || 0}/4 Members</span>
          </div>
        </div>
        <button
          className="close-modal-btn"
          onClick={handleCloseTeamMembersModal}
          title="Close"
        >
          <FaTimes />
        </button>
      </div>

      <div className="modal-body">
        {/* Team Information */}
        <div className="team-info-section">
          <h4>Team Information</h4>
          <div className="team-details-grid">
            <div className="detail-item">
              <span className="label">Team Name:</span>
              <span className="value">{selectedTeamForDetails.name}</span>
            </div>
            <div className="detail-item">
              <span className="label">Major:</span>
              <span className="value">{selectedTeamForDetails.major}</span>
            </div>
            <div className="detail-item">
              <span className="label">Course:</span>
              <span className="value">CSE 400</span>
            </div>
            <div className="detail-item">
              <span className="label">Semester:</span>
              <span className="value">{selectedTeamForDetails.semester || 'Not specified'}</span>
            </div>
            {selectedTeamForDetails.projectIdea && (
              <div className="detail-item full-width">
                <span className="label">Project:</span>
                <span className="value">{selectedTeamForDetails.projectIdea}</span>
              </div>
            )}
          </div>
        </div>

        {/* Team Members List */}
        <div className="members-details-section">
          <h4>Team Members ({selectedTeamForDetails.members?.length || 0}/4)</h4>
          
          {selectedTeamForDetails.members && selectedTeamForDetails.members.length > 0 ? (
            <div className="members-details-list">
              {selectedTeamForDetails.members.map((member, index) => (
                <div key={index} className="member-detail-card">
                  <div className="member-header">
                    <div className="member-avatar-section">
                      {member.avatar || member.avatarUrl ? (
                        <img
                          src={member.avatar || member.avatarUrl}
                          alt={`${member.name}'s avatar`}
                          className="member-detail-avatar"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="member-detail-avatar-fallback"
                        style={{
                          display: (member.avatar || member.avatarUrl) ? 'none' : 'flex'
                        }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="member-basic-info">
                      <h5 className="member-name">
                        {member.name}
                        {member.role === 'Leader' && <FaCrown className="leader-crown" />}
                      </h5>
                      <span className="member-role">{member.role}</span>
                    </div>
                  </div>

                  <div className="member-details-info">
                    <div className="info-row">
                      <div className="info-item">
                        <FaUser className="info-icon" />
                        <span className="info-label">Student ID:</span>
                        <span className="info-value">{member.studentId}</span>
                      </div>
                      
                      <div className="info-item">
                        <FaGraduationCap className="info-icon" />
                        <span className="info-label">Program:</span>
                        <span className="info-value">{member.program || 'Not specified'}</span>
                      </div>
                    </div>
                    
                    <div className="info-row">
                      <div className="info-item">
                        <FaEnvelope className="info-icon" />
                        <span className="info-label">Email:</span>
                        <span className="info-value">{member.email || 'Not available'}</span>
                      </div>
                      
                      <div className="info-item">
                        <FaCalendar className="info-icon" />
                        <span className="info-label">Joined:</span>
                        <span className="info-value">
                          {member.joinedDate ? formatDate(member.joinedDate) : 'Not specified'}
                        </span>
                      </div>
                    </div>
                    
                    {/* ✅ NEW: Skills Section */}
                    <div className="member-skills-section">
                      <div className="skills-header">
                        <FaCode className="skills-icon" />
                        <span className="skills-label">Skills:</span>
                      </div>
                      <div className="member-skills-display">
                        {member.skills && member.skills.length > 0 ? (
                          <div className="skills-tags">
                            {member.skills.map((skill, skillIndex) => (
                              <span key={skillIndex} className="skill-tag modal-skill-tag">
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="no-skills-text">No skills listed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-members">
              <FaUser className="empty-icon" />
              <p>No member information available</p>
            </div>
          )}
        </div>
      </div>

      <div className="modal-footer">
        <div className="modal-actions">
          <button
            className="close-btn"
            onClick={handleCloseTeamMembersModal}
          >
            <FaTimes />
            Close
          </button>
          
          {!myTeam && selectedTeamForDetails.members?.length < 4 && (
            <button
              className="join-from-modal-btn"
              onClick={() => {
                handleCloseTeamMembersModal();
                handleJoinTeam(selectedTeamForDetails);
              }}
            >
              <FaHandshake />
              Request to Join Team
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
)}



      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="tutorial-overlay" onClick={closeTutorial}>
          <div className="tutorial-content" onClick={(e) => e.stopPropagation()}>
            <h2>Welcome to Supervise Me!</h2>
            <div className="tutorial-steps">
              <div className="step">
                <div className="icon">
                  <FaUsers />
                </div>
                <h4>Form partnerships with active students for your capstone journey</h4>
                <p>Create or join teams with exactly 2 members from the same major</p>
              </div>
              <div className="step">
                <div className="icon">
                  <FaChalkboardTeacher />
                </div>
                <h4>Connect with faculty for guidance</h4>
                <p>Browse faculty profiles and request supervision for your capstone project</p>
              </div>
              <div className="step">
                <div className="icon">
                  <FaComments />
                </div>
                <h4>Track progress and collaborate effectively</h4>
                <p>Use team chat, access materials, and stay updated with announcements</p>
              </div>
            </div>
            <button className="close-tutorial" onClick={closeTutorial}>
              Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );


};

export default StudentDashboard;
