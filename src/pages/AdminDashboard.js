import React, { useEffect, useMemo, useState } from "react"
import "./AdminDashboard.css"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';
import * as XLSX from 'xlsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardTeacher, faUserFriends, faPlus, faChartLine, faSave, faCog, faEye, faCheckCircle, faSync, faExclamationTriangle, faLock, faUnlock, faFileAlt, faUser, faCalendarAlt, faGraduationCap, faHashtag, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { 
  faUsersCog, 
  faFileExport,
  faUserGraduate, 
  faBookOpen, 
  faBullhorn, 
  faChartBar,
  faChevronLeft,
  faChevronRight,
  faBars,
  faEllipsisV,
  faEdit,
  faTrashAlt,
  faFileImport,
  faDownload,
  faClock,
  faSyncAlt,
  faSpinner,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import AdminSidebar from "./AdminSidebar";
import AdminHelmet from "./AdminHelmet";
const API_BASE = process.env.REACT_APP_API_URL;
function AdminDashboard() {
//   const [viewPendingRequests, setViewPendingRequests] = useState(false);
//   const [activationRequests, setActivationRequests] = useState([]);
// const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("faculty")
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [facultyList, setFacultyList] = useState([]);

  const [addFacultyError, setAddFacultyError] = useState('');

  const [showAssignSupervisorModal, setShowAssignSupervisorModal] = useState(false);
const [selectedTeamForSupervisor, setSelectedTeamForSupervisor] = useState(null);
const [availableFaculty, setAvailableFaculty] = useState([]);
const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
const [supervisorSearchQuery, setSupervisorSearchQuery] = useState('');
const [isAssigningSupervisor, setIsAssigningSupervisor] = useState(false);

// Add these state variables for deliverables
const [deliverablesList, setDeliverablesList] = useState([]);
const [deliverableStats, setDeliverableStats] = useState({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  needsRevision: 0
});
const [deliverableStatusFilter, setDeliverableStatusFilter] = useState('all');
const [deliverablePhaseFilter, setDeliverablePhaseFilter] = useState('all');
const [deliverableTypeFilter, setDeliverableTypeFilter] = useState('all');
const [selectedDeliverable, setSelectedDeliverable] = useState(null);
const [showDeliverableModal, setShowDeliverableModal] = useState(false);
const [showFeedbackModal, setShowFeedbackModal] = useState(false);
const [feedbackText, setFeedbackText] = useState('');
const [feedbackStatus, setFeedbackStatus] = useState('needs_revision');
const [marks, setMarks] = useState('');
const [globalSettings, setGlobalSettings] = useState({
  allowResubmissions: true,
  autoNotifyFaculty: true
});


  const [studentProblems, setStudentProblems] = useState([]);
const [problemStats, setProblemStats] = useState({
  total: 0,
  pending: 0,
  inProgress: 0,
  resolved: 0
});
const [problemStatusFilter, setProblemStatusFilter] = useState('all');
const [problemTypeFilter, setProblemTypeFilter] = useState('all');
const [selectedProblem, setSelectedProblem] = useState(null);
const [showProblemModal, setShowProblemModal] = useState(false);
const [showResponseModal, setShowResponseModal] = useState(false);
const [responseMessage, setResponseMessage] = useState('');
const [responseStatus, setResponseStatus] = useState('pending');

// Add these state variables for faculty delete modal
const [facultyToDelete, setFacultyToDelete] = useState(null);
const [showFacultyDeleteModal, setShowFacultyDeleteModal] = useState(false);

  const [completedCreditsError, setCompletedCreditsError] = useState('');
  const [studentList, setStudentList] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [currentRequirement, setCurrentRequirement] = useState(null);

  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [showEditFacultyModal, setShowEditFacultyModal] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  

  const [showSpecialCaseModal, setShowSpecialCaseModal] = useState(false);
const [selectedTeamForSpecialCase, setSelectedTeamForSpecialCase] = useState(null);
const [specialCaseReason, setSpecialCaseReason] = useState('');

const [pendingEvaluations, setPendingEvaluations] = useState([]);
const [selectedEvaluation, setSelectedEvaluation] = useState(null);
const [showEvaluationReviewModal, setShowEvaluationReviewModal] = useState(false);
const [adminComments, setAdminComments] = useState('');
const [modifiedGrades, setModifiedGrades] = useState([]);
const [isFinalizingEvaluation, setIsFinalizingEvaluation] = useState(false);
// Add this with your other state variables in AdminDashboard.js
const [problemUserTypeFilter, setProblemUserTypeFilter] = useState('all');



const [isUpdatingSpecialCase, setIsUpdatingSpecialCase] = useState(false);
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/announcements`); // Replace with your actual API endpoint
        const data = await response.json();
        setAnnouncements(data); // Set the fetched announcements to state
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    // Conceptual example for AdminDashboard.js
useEffect(() => {
  const tables = document.querySelectorAll('.table-container'); // Be more specific if needed
  const handleResizeForTableCards = () => {
    if (window.innerWidth <= 576) {
      tables.forEach(table => table.classList.add('switch-to-cards'));
    } else {
      tables.forEach(table => table.classList.remove('switch-to-cards'));
    }
  };

  window.addEventListener('resize', handleResizeForTableCards);
  handleResizeForTableCards(); // Initial check

  return () => window.removeEventListener('resize', handleResizeForTableCards);
}, [activeTab]); // Re-run if activeTab changes, as tables might be different

    useEffect(() => {
      fetchAnnouncements(); // Fetch announcements when component mounts
    }, []);
  

 const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
const formatEnrollmentDate = (isoString) => {
  const date = new Date(isoString);
  return `${date.toISOString().split('T')[0]} ${date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })}`;
};

useEffect(() => {
  const loadConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/config`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (!res.ok) throw new Error('Config load failed');
      const cfg = await res.json();
      setCurrentRequirement(cfg.requiredCredits);
    } catch (err) {
      console.error(err);
      setCurrentRequirement('N/A');
    }
  };
  loadConfig();
  // Optional: refresh every 30s
  const interval = setInterval(loadConfig, 1000);
  return () => clearInterval(interval);
}, []);


const handleRefresh = async () => {
  try {
    setIsRefreshing(true);
    
    // Refresh students
    const response = await fetch(`${API_BASE}/api/students`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }

    const studentsData = await response.json();
    setStudentList(studentsData);
    setSelectedStudentIds([]);
    
  } catch (err) {
    console.error('Refresh failed:', err);
    alert('Refresh failed: ' + err.message);
  } finally {
    setIsRefreshing(false);
  }
};


const handleStatsCardClick = (status) => {
  setProblemStatusFilter(status);
  console.log(`Filtering problems by status: ${status}`);
};

// Add this helper function for display names
const getStatusDisplayName = (status) => {
  switch (status) {
    case 'Open': return 'Pending';
    case 'In Progress': return 'In Progress';
    case 'Resolved': return 'Resolved';
    case 'Closed': return 'Closed';
    default: return 'All';
  }
};

// Add this useEffect for fetching activation requests
  // useEffect(() => {
  //   const fetchActivationRequests = async () => {
  //     try {
  //       const response = await fetch(`${API_BASE}/api/activation-requests`, {
  //         headers: {
  //           'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  //         }
  //       });
  //       const data = await response.json();
  //       setActivationRequests(data);
  //     } catch (err) {
  //       console.error('Error fetching activation requests:', err);
  //     }
  //   };
    
  //   fetchActivationRequests();
  // }, []);

  
 

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Auto-collapse sidebar on mobile
      if (mobile && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarCollapsed]);
  
  // Add these handler functions
//   const handleApproveRequest = async (requestId) => {
//     try {
//       const response = await fetch(`${API_BASE}/api/activation-requests/${requestId}/approve`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
//         }
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to approve request');
//       }
  
//       // Optimistically update the request status
//       setActivationRequests(prev => 
//         prev.map(req => 
//           req._id === requestId ? { ...req, status: 'approved' } : req
//         )
//       );
  
//       // Refresh data from server
//       const [studentsRes, requestsRes] = await Promise.all([
//         fetch(`${API_BASE}/api/students`, {
//           headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
//         }),
//         fetch(`${API_BASE}/api/activation-requests`, {
//           headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
//         })
//       ]);
  
//       if (!studentsRes.ok || !requestsRes.ok) {
//         throw new Error('Failed to refresh data after approval');
//       }
  
//       const studentsData = await studentsRes.json();
//       const requestsData = await requestsRes.json();
  
//       setStudentList(studentsData);
//       setActivationRequests(requestsData);
  
//     } catch (err) {
//       console.error('Approval error:', err);
//       alert(`Approval failed: ${err.message}`);
//     }
//   };

//   // Update handleRejectRequest similarly
// const handleRejectRequest = async (requestId) => {
//   try {
//     const response = await fetch(`${API_BASE}/api/activation-requests/${requestId}/reject`, {
//       method: 'PUT',
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
//       }
//     });

//     if (response.ok) {
//       setActivationRequests(prev => 
//         prev.map(req => 
//           req._id === requestId ? { ...req, status: 'rejected' } : req
//         )
//       );
//     }
//   } catch (err) {
//     console.error('Error rejecting request:', err);
//   }
// };

// Add this useEffect for fetching students
useEffect(() => {
  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      setStudentList(data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };
  
  fetchStudents();
}, []);

useEffect(() => {
  // Fetch faculty data on component mount
  const fetchInitialData = async () => {
    try {
      await fetchFaculty(); // Fetch faculty data
      // Existing student and activation request fetches...
      const [studentsRes, requestsRes] = await Promise.all([
        fetch(`${API_BASE}/api/students`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }),
        fetch(`${API_BASE}/api/activation-requests`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        })
      ]);
      
      const studentsData = await studentsRes.json();
      const requestsData = await requestsRes.json();
      setStudentList(studentsData);
    } catch (err) {
      console.error('Initial data fetch error:', err);
    }
  };

  fetchInitialData();
}, []);

// In AdminDashboard.js
const fetchFaculty = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/faculty`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    const data = await response.json();
    setFacultyList(data); // Update faculty list state
  } catch (err) {
    console.error('Error fetching faculty:', err);
    alert('Error loading faculty data');
  }
};

const getProgramFromStudentId = (studentId) => {
  const parts = studentId?.split('-');
  if (!parts || parts.length < 4) return 'Undecided';
  const departmentCode = parts[2];
  switch(departmentCode) {
    case '60': return 'Computer Science';
    case '50': return 'Electrical Engineering';
    default: return 'Undecided';
  }
};

  const [message, setMessage] = useState('');

const [showAddAnnouncementModal, setShowAddAnnouncementModal] =
    useState(false);
  const [showEditAnnouncementModal, setShowEditAnnouncementModal] =
    useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    date: "",
    audience: "All Concerned",
    status: "Draft",
  });
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    useEffect(() => {
      fetchAnnouncements();
      const interval = setInterval(fetchAnnouncements, 15000); // 15s interval
      return () => clearInterval(interval);
    }, []);
    
    // Announcement Handlers
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
                author: "Admin", 
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
  
            // Re-fetch announcements after publishing
            fetchAnnouncements();
          } else {
            console.error("Failed to add announcement");
          }
        } catch (error) {
          console.error("Error adding announcement:", error);
        }
      }
    };
  

  const handleEditStudent = (student) => {
  console.log('Edit student clicked:', student); // Debug log
  setSelectedStudent(student);
  setEditedStudent({ ...student });
  setEditStudentMode(true);
  setShowAddStudentModal(true);
};

// Fix the Faculty Edit Button Click Handler  
const handleEditFaculty = (faculty) => {
  console.log('Edit faculty clicked:', faculty); // Debug log
  setSelectedFaculty(faculty);
  setEditedFaculty({ ...faculty });
  setEditMode(true);
};
  
    const handleUpdateAnnouncement = async () => {
      try {
        const updatedAnnouncement = {
          ...newAnnouncement,
          date: new Date().toLocaleString(),  // Set updated date
        };
    
        const response = await fetch(`${API_BASE}/api/announcements/${updatedAnnouncement._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedAnnouncement),
        });
    
        const data = await response.json();
    
        if (response.ok) {
          console.log('Announcement updated:', data.announcement);
    
          setAnnouncements((prev) =>
            prev.map((item) =>
              item._id === data.announcement._id ? data.announcement : item
            )
          );
    
          setShowEditAnnouncementModal(false);
          setEditMode(false);
          setNewAnnouncement({
            title: '',
            content: '',
            audience: '',
            status: '',
            author: '',
            date: '',
          });
  
          fetchAnnouncements();
  
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error('Error updating announcement:', error);
      }
    };
    
    
    
  
    const handleDeleteAnnouncement = async (id) => {
      try {
        const response = await fetch(`${API_BASE}/api/announcements/${id}`, {
          method: 'DELETE',
        });
    
        const data = await response.json();
    
        if (response.ok) {
          console.log(data.message);
    
          
          setAnnouncements((prev) =>
            prev.filter((announcement) => announcement._id !== id && announcement.id !== id)
          );
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    };

    const filteredAnnouncements = announcements.filter(
      (ann) =>
        ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.author.toLowerCase().includes(searchQuery.toLowerCase())
    );


    // Add these functions for deliverables management
const fetchDeliverables = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/deliverables`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      setDeliverablesList(data.submissions);
      
      // Calculate stats
      const stats = {
        total: data.submissions.length,
        pending: data.submissions.filter(d => d.status === 'pending').length,
        approved: data.submissions.filter(d => d.status === 'approved').length,
        rejected: data.submissions.filter(d => d.status === 'rejected').length,
        needsRevision: data.submissions.filter(d => d.status === 'needs_revision').length
      };
      setDeliverableStats(stats);
    }
  } catch (error) {
    console.error('Error fetching deliverables:', error);
  }
};

const updateDeliverableStatus = async (deliverableId, status) => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/deliverables/${deliverableId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ status })
    });

    if (response.ok) {
      fetchDeliverables(); // Refresh the list
      alert(`Deliverable ${status} successfully`);
    }
  } catch (error) {
    console.error('Error updating deliverable status:', error);
    alert('Failed to update deliverable status');
  }
};

const submitFeedback = async (deliverableId) => {
  if (!feedbackText.trim()) return;

  try {
    const response = await fetch(`${API_BASE}/api/admin/deliverables/${deliverableId}/feedback`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({
        status: feedbackStatus,
        feedback: feedbackText,
        marks: marks ? parseInt(marks) : null
      })
    });

    if (response.ok) {
      setShowFeedbackModal(false);
      setFeedbackText('');
      setFeedbackStatus('needs_revision');
      setMarks('');
      fetchDeliverables();
      alert('Feedback submitted successfully');
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    alert('Failed to submit feedback');
  }
};

const downloadDeliverable = async (deliverableId) => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/deliverables/${deliverableId}/download`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'deliverable.pdf'; // You might want to get the actual filename
      a.click();
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error downloading deliverable:', error);
    alert('Failed to download deliverable');
  }
};

const updateGlobalSetting = async (setting, value) => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/deliverables/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ [setting]: value })
    });

    if (response.ok) {
      setGlobalSettings(prev => ({ ...prev, [setting]: value }));
      console.log(`Setting ${setting} updated to ${value}`);
    } else {
      alert('Failed to update setting');
    }
  } catch (error) {
    console.error('Error updating global setting:', error);
    alert('Failed to update setting');
  }
};

// Filter deliverables based on current filters
const filteredDeliverables = deliverablesList.filter(deliverable => {
  const matchesSearch = deliverable.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deliverable.name.toLowerCase().includes(searchQuery.toLowerCase());
  
  const matchesStatus = deliverableStatusFilter === 'all' || deliverable.status === deliverableStatusFilter;
  const matchesPhase = deliverablePhaseFilter === 'all' || deliverable.phase === deliverablePhaseFilter;
  const matchesType = deliverableTypeFilter === 'all' || 
    deliverable.name.toLowerCase().includes(deliverableTypeFilter.replace('-', ' '));
  
  return matchesSearch && matchesStatus && matchesPhase && matchesType;
});


// Add this useEffect for deliverables
useEffect(() => {
  if (activeTab === "deliverables") {
    fetchDeliverables();
  }
}, [activeTab]);

    

  const fetchStudentProblems = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/support/tickets`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      setStudentProblems(data.tickets);
      
      // Calculate stats for both student and faculty tickets
      const stats = {
        total: data.tickets.length,
        pending: data.tickets.filter(p => p.status === 'Open').length,
        inProgress: data.tickets.filter(p => p.status === 'In Progress').length,
        resolved: data.tickets.filter(p => p.status === 'Resolved').length,
        students: data.tickets.filter(p => p.userType === 'Student').length,
        faculty: data.tickets.filter(p => p.userType === 'Faculty').length
      };
      setProblemStats(stats);
    }
  } catch (error) {
    console.error('Error fetching support tickets:', error);
  }
};

// In AdminDashboard.js - Update the updateProblemStatus function
const updateProblemStatus = async (problemId, newStatus) => {
  try {
    // ✅ Add confirmation for status-only updates
    const confirmUpdate = window.confirm(
      `Update ticket status to "${newStatus}" without sending a response message to the student?`
    );
    
    if (!confirmUpdate) {
      return;
    }

    console.log(`Updating problem ${problemId} to status: ${newStatus}`);
    
    const response = await fetch(`${API_BASE}/api/admin/support/tickets/${problemId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (response.ok) {
      console.log(`Problem status updated to ${newStatus}`);
      await fetchStudentProblems();
      
      // Show success message
      const result = await response.json();
      if (result.hasResponse) {
        alert('Ticket updated with response sent to student');
      } else {
        alert(`Ticket status updated to ${newStatus} (no message sent)`);
      }
      
      // Update UI elements
      if (selectedProblem && selectedProblem._id === problemId) {
        setSelectedProblem({ ...selectedProblem, status: newStatus });
      }

    } else {
      console.error('Failed to update problem status');
      alert('Failed to update problem status. Please try again.');
    }
  } catch (error) {
    console.error('Error updating problem status:', error);
    alert('Error updating problem status. Please try again.');
  }
};

const sendResponseToProblem = async (problemId) => {
  if (!responseMessage.trim()) return;

  try {
    const response = await fetch(`${API_BASE}/api/admin/support/tickets/${problemId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({
        adminResponse: responseMessage,
        status: responseStatus
      })
    });

    if (response.ok) {
      console.log(`Response sent to problem ${problemId} with status ${responseStatus}`);
      
      // Close modals and reset state
      setShowResponseModal(false);
      setResponseMessage('');
      setSelectedProblem(null);
      
      // Refresh problems list and stats
      await fetchStudentProblems();
      
      alert('Response sent successfully!');
    } else {
      alert('Failed to send response. Please try again.');
    }
  } catch (error) {
    console.error('Error sending response:', error);
    alert('Error sending response. Please try again.');
  }
};

// Filter problems based on search and filters
const filteredProblems = studentProblems.filter(problem => {
  const matchesSearch = problem.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    problem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    problem.userName.toLowerCase().includes(searchQuery.toLowerCase());
  
  const matchesStatus = problemStatusFilter === 'all' || problem.status === problemStatusFilter;
  const matchesType = problemTypeFilter === 'all' || problem.category === problemTypeFilter;
  const matchesUserType = problemUserTypeFilter === 'all' || problem.userType === problemUserTypeFilter;
  
  return matchesSearch && matchesStatus && matchesType && matchesUserType;
});


// Fetch problems when the tab becomes active
useEffect(() => {
  if (activeTab === "student-problems") {
    fetchStudentProblems();
  }
}, [activeTab]);

    // Add these state variables near the top of your AdminDashboard component
// Add these state variables in AdminDashboard.js
const [showAllStudents, setShowAllStudents] = useState(false);
const [forceAddIneligible, setForceAddIneligible] = useState(false);

const [memberSearchQuery, setMemberSearchQuery] = useState('');

const [teamsList, setTeamsList] = useState([]);
const [selectedTeam, setSelectedTeam] = useState(null);
const [showTeamModal, setShowTeamModal] = useState(false);
const [teamStats, setTeamStats] = useState({
  total: 0,
  active: 0,
  recruiting: 0,
  inactive: 0
});

// Add these functions to fetch teams data
const fetchTeams = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/teams`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch teams');
    const data = await response.json();
    setTeamsList(data);
    
    // Calculate stats
    const stats = {
      total: data.length,
      active: data.filter(team => team.status === 'active').length,
      recruiting: data.filter(team => team.status === 'recruiting').length,
      inactive: data.filter(team => team.status === 'inactive').length
    };
    setTeamStats(stats);
  } catch (err) {
    console.error('Error fetching teams:', err);
    alert('Error loading teams data');
  }
};

const handleDeleteTeam = async (teamId) => {
  if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/teams/${teamId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    
    if (response.ok) {
      await fetchTeams(); // Refresh teams list
      alert('Team deleted successfully');
    }
  } catch (err) {
    console.error('Delete error:', err);
    alert('Error deleting team');
  }
};

// Fetch teams when teams tab is active
useEffect(() => {
  if (activeTab === "teams") {
    fetchTeams();
  }
}, [activeTab]);

// Add this to your AdminDashboard.js state
const [showAddMemberModal, setShowAddMemberModal] = useState(false);
const [selectedTeamForMember, setSelectedTeamForMember] = useState(null);
const [allStudents, setAllStudents] = useState([]);
const [selectedStudentToAdd, setSelectedStudentToAdd] = useState('');

// In AdminDashboard.js, update the fetchAllStudents function
const fetchAllStudents = async () => {
  try {
    // ✅ Use the new endpoint for eligible students only
    const response = await fetch(`${API_BASE}/api/admin/students/eligible-for-capstone`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      setAllStudents(data.students);
      
      // ✅ Show eligibility info to admin
      console.log(`Loaded ${data.eligibleCount} Capstone-eligible students (≥${data.requiredCredits} credits)`);
    }
  } catch (error) {
    console.error('Error fetching eligible students:', error);
  }
};


// Update the handleAddMemberToTeam function in AdminDashboard.js
const handleAddMemberToTeam = async () => {
  if (!selectedStudentToAdd || !selectedTeamForMember) return;

  const selectedStudent = allStudents.find(s => s._id === selectedStudentToAdd);
  const forceAdd = selectedStudent && !selectedStudent.isEligible;

  try {
    const response = await fetch(`${API_BASE}/api/admin/teams/${selectedTeamForMember._id}/add-member`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({
        studentId: selectedStudentToAdd,
        forceAdd: forceAdd // Send forceAdd flag for ineligible students
      })
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      fetchTeams(); // Refresh teams list
      setShowAddMemberModal(false);
      setSelectedStudentToAdd('');
      setSelectedTeamForMember(null);
      setShowAllStudents(false);
    } else {
      if (result.requiresForceAdd) {
        // Show confirmation dialog for ineligible student
        const confirmAdd = window.confirm(
          `${result.message}\n\nThis will grant special login access to this student. Continue?`
        );
        if (confirmAdd) {
          // Retry with force add
          const forceResponse = await fetch(`${API_BASE}/api/admin/teams/${selectedTeamForMember._id}/add-member`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
              studentId: selectedStudentToAdd,
              forceAdd: true
            })
          });
          
          const forceResult = await forceResponse.json();
          if (forceResponse.ok) {
            alert(forceResult.message);
            fetchTeams();
            setShowAddMemberModal(false);
            setSelectedStudentToAdd('');
            setSelectedTeamForMember(null);
            setShowAllStudents(false);
          } else {
            alert(`Error: ${forceResult.message}`);
          }
        }
      } else {
        alert(`Error: ${result.message}`);
      }
    }
  } catch (error) {
    console.error('Add member error:', error);
    alert('Error adding member to team');
  }
};

const handleRemoveMemberFromTeam = async (teamId, studentId, studentName) => {
  if (!window.confirm(`Are you sure you want to remove ${studentName} from this team?`)) return;

  try {
    const response = await fetch(`${API_BASE}/api/admin/teams/${teamId}/remove-member/${studentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      fetchTeams(); // Refresh teams list
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error('Remove member error:', error);
    alert('Error removing member from team');
  }
};


// Add this new function in AdminDashboard.js
const fetchAllStudentsForAdmin = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/students/all-students`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      setAllStudents(data.students);
      console.log(`Loaded ${data.totalStudents} total students (${data.eligibleCount} eligible, ${data.ineligibleCount} ineligible)`);
    }
  } catch (error) {
    console.error('Error fetching all students:', error);
  }
};

  // Reports State
  const [selectedReport, setSelectedReport] = useState("enrollment");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [generatedReport, setGeneratedReport] = useState(null);

  const [studentToDelete, setStudentToDelete] = useState(null);
const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Sample Report Data
  const reportData = {
    enrollment: {
      labels: ["Capstone A", "Capstone B", "Capstone C"],
      data: [120, 85, 65, 150],
      tableData: [
        { course: "Capstone A", students: 120, capacity: 150 },
        { course: "Capstone B", students: 85, capacity: 100 },
        { course: "Capstone C", students: 65, capacity: 80 }
      ]
    },
    faculty: {
      labels: ["Dr. Smith", "Dr. Johnson", "Prof. Lee"],
      data: [4, 5, 3],
      tableData: [
        { name: "Dr. Smith", courses: 4, students: 120 },
        { name: "Dr. Johnson", courses: 5, students: 150 },
        { name: "Prof. Lee", courses: 3, students: 90 }
      ]
    }
  };

  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    studentId: "",
    program: "",
    status: "Active",
    completedCredits: "",
    cgpa: 0.0,
    email: ""
  });
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudentMode, setEditStudentMode] = useState(false);
  const [editedStudent, setEditedStudent] = useState({});
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [newFaculty, setNewFaculty] = useState({
    name: "",
    email: "",
    department: "",
    role: ""
  })

  const [statusFilter, setStatusFilter] = useState('all');
const [programFilter, setProgramFilter] = useState('all');
const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
const [bulkStatus, setBulkStatus] = useState('');



  const [selectedFacultyIds, setSelectedFacultyIds] = useState([])
  const [isAllSelected, setIsAllSelected] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editedFaculty, setEditedFaculty] = useState({})

  // Add these state variables with your existing state in AdminDashboard.js
const [isGeneratingReport, setIsGeneratingReport] = useState(false);
const [reportError, setReportError] = useState('');

// Add these helper functions before the renderContent function
const generateReport = async () => {
  if (!selectedReport) return;
  
  setIsGeneratingReport(true);
  setReportError('');
  
  try {
    const API_BASE = process.env.REACT_APP_API_URL;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${API_BASE}/api/admin/reports/${selectedReport}?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to generate report');
    
    const data = await response.json();
    setGeneratedReport(data.data);
    
  } catch (error) {
    console.error('Report generation error:', error);
    setReportError('Failed to generate report. Please try again.');
  } finally {
    setIsGeneratingReport(false);
  }
};

const getReportTitle = () => {
  const titles = {
    enrollment: 'Enrollment Statistics Report',
    faculty: 'Faculty Workload Report', 
    projects: 'Project Progress Report',
    system: 'System Overview Report'
  };
  return titles[selectedReport] || 'Report';
};

const renderKeyMetrics = () => {
  if (!generatedReport) return null;
  
  const metrics = getMetricsForReport();
  
  return (
    <div className="metrics-grid">
      {metrics.map((metric, index) => (
        <div key={index} className="metric-card">
          <div className="metric-value">{metric.value}</div>
          <div className="metric-label">{metric.label}</div>
          {metric.change && (
            <div className={`metric-change ${metric.change > 0 ? 'positive' : 'negative'}`}>
              {metric.change > 0 ? '+' : ''}{metric.change}%
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const getMetricsForReport = () => {
  switch (selectedReport) {
    case 'enrollment':
      return [
        { label: 'Students in Teams', value: generatedReport.teamFormation?.studentsInTeams || 0 },
        { label: 'Students Not in Teams', value: generatedReport.teamFormation?.studentsNotInTeams || 0 },
        { label: 'Team Formation Rate', value: `${generatedReport.teamFormation?.teamFormationRate || 0}%` },
        { label: 'Total Active Students', value: generatedReport.teamFormation?.totalStudents || 0 }
      ];
    case 'faculty':
      const totalFaculty = generatedReport.departmentStats?.reduce((sum, dept) => sum + dept.facultyCount, 0) || 0;
      const totalSupervised = generatedReport.facultyWorkload?.reduce((sum, f) => sum + f.supervisedTeams, 0) || 0;
      return [
        { label: 'Total Faculty', value: totalFaculty },
        { label: 'Supervising Faculty', value: generatedReport.facultyWorkload?.filter(f => f.supervisedTeams > 0).length || 0 },
        { label: 'Teams Supervised', value: totalSupervised },
        { label: 'Avg Teams per Faculty', value: totalFaculty > 0 ? (totalSupervised / totalFaculty).toFixed(1) : 0 }
      ];
    case 'projects':
      return [
        { label: 'Total Teams', value: generatedReport.projectProgress?.totalTeams || 0 },
        { label: 'Completed Projects', value: generatedReport.projectProgress?.completedProjects || 0 },
        { label: 'Completion Rate', value: `${generatedReport.projectProgress?.completionRate || 0}%` },
        { label: 'Special Cases', value: generatedReport.projectProgress?.specialCaseTeams || 0 }
      ];
    case 'system':
      return [
        { label: 'Active Students', value: generatedReport.overview?.totalStudents || 0 },
        { label: 'Active Faculty', value: generatedReport.overview?.totalFaculty || 0 },
        { label: 'Total Teams', value: generatedReport.overview?.totalTeams || 0 },
        { label: 'Support Tickets', value: generatedReport.overview?.supportTickets || 0 }
      ];
    default:
      return [];
  }
};

const renderChart = () => {
  const chartData = getChartData();
  const ChartComponent = getChartComponent();
  
  return <ChartComponent data={chartData} {...getChartProps()} />;
};

const getChartData = () => {
  switch (selectedReport) {
    case 'enrollment':
      return generatedReport.studentsByProgram?.map(item => ({
        name: item.program,
        students: item.students,
        avgCGPA: item.avgCGPA,
        avgCredits: item.avgCredits
      })) || [];
    case 'faculty':
      return generatedReport.facultyWorkload?.slice(0, 10).map(faculty => ({
        name: faculty.name.length > 15 ? faculty.name.substring(0, 15) + '...' : faculty.name,
        teams: faculty.supervisedTeams,
        students: faculty.totalStudents,
        workload: faculty.workloadScore
      })) || [];
    case 'projects':
      return generatedReport.phaseDistribution?.map(phase => ({
        name: phase.phase,
        teams: phase.teams,
        avgMembers: phase.avgMemberCount
      })) || [];
    case 'system':
      return [
        { name: 'Students', value: generatedReport.overview?.totalStudents || 0 },
        { name: 'Faculty', value: generatedReport.overview?.totalFaculty || 0 },
        { name: 'Teams', value: generatedReport.overview?.totalTeams || 0 },
        { name: 'Boards', value: generatedReport.overview?.totalBoards || 0 }
      ];
    default:
      return [];
  }
};

const getChartComponent = () => {
  return selectedReport === 'system' ? PieChart : BarChart;
};

const getChartProps = () => {
  if (selectedReport === 'system') {
    return {
      children: [
        <Pie 
          key="pie"
          dataKey="value" 
          data={getChartData()}
          cx="50%" 
          cy="50%" 
          outerRadius={100}
          fill="var(--primary-color)"
          label={({name, value}) => `${name}: ${value}`}
        />
      ]
    };
  }
  
  const dataKeys = getDataKeys();
  return {
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
    children: [
      <CartesianGrid key="grid" strokeDasharray="3 3" />,
      <XAxis key="xaxis" dataKey="name" />,
      <YAxis key="yaxis" />,
      <Tooltip key="tooltip" />,
      ...dataKeys.map((key, index) => (
        <Bar 
          key={key} 
          dataKey={key} 
          fill={`hsl(${210 + index * 30}, 70%, 50%)`} 
        />
      ))
    ]
  };
};

const getDataKeys = () => {
  switch (selectedReport) {
    case 'enrollment':
      return ['students'];
    case 'faculty':
      return ['teams', 'students'];
    case 'projects':
      return ['teams'];
    default:
      return [];
  }
};

const getTableHeaders = () => {
  switch (selectedReport) {
    case 'enrollment':
      return ['Program', 'Students', 'Avg CGPA', 'Avg Credits'];
    case 'faculty':
      return ['Faculty Name', 'Department', 'Supervised Teams', 'Board Memberships', 'Total Students', 'Workload Score'];
    case 'projects':
      return ['Phase', 'Teams', 'Avg Members per Team'];
    case 'system':
      return ['Metric', 'Count', 'Recent Activity'];
    default:
      return [];
  }
};

const getTableData = () => {
  switch (selectedReport) {
    case 'enrollment':
      return generatedReport.studentsByProgram?.map(item => ({
        program: item.program,
        students: item.students,
        avgCGPA: item.avgCGPA.toFixed(2),
        avgCredits: item.avgCredits.toFixed(1)
      })) || [];
    case 'faculty':
      return generatedReport.facultyWorkload?.map(faculty => ({
        name: faculty.name,
        department: faculty.department,
        supervisedTeams: faculty.supervisedTeams,
        boardMemberships: faculty.boardMemberships,
        totalStudents: faculty.totalStudents,
        workloadScore: faculty.workloadScore
      })) || [];
    case 'projects':
      return generatedReport.phaseDistribution?.map(phase => ({
        phase: phase.phase,
        teams: phase.teams,
        avgMembers: phase.avgMemberCount.toFixed(1)
      })) || [];
    case 'system':
      return [
        { metric: 'Students', count: generatedReport.overview?.totalStudents || 0, activity: '-' },
        { metric: 'Faculty', count: generatedReport.overview?.totalFaculty || 0, activity: '-' },
        { metric: 'Teams', count: generatedReport.overview?.totalTeams || 0, activity: `${generatedReport.recentActivity?.newTeamsThisWeek || 0} new this week` },
        { metric: 'Support Tickets', count: generatedReport.overview?.supportTickets || 0, activity: `${generatedReport.recentActivity?.newTicketsThisWeek || 0} new this week` }
      ];
    default:
      return [];
  }
};

// Update the existing handleExportExcel function
const handleExportExcel = () => {
  if (!generatedReport) return;

  const data = getTableData();
  const headers = getTableHeaders();
  
  // Create workbook with headers
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, getReportTitle());
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${selectedReport}-report-${timestamp}.xlsx`;
  
  XLSX.writeFile(workbook, filename);
};

// Add PDF export function
const handleExportPDF = () => {
  window.print(); // Simple PDF export via browser print
};

  const toggleSelection = (id) => {
    setSelectedFacultyIds((prev) =>
      prev.includes(id)
        ? prev.filter((fId) => fId !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedFacultyIds([]);
    } else {
      setSelectedFacultyIds(filteredFaculty.map(f => f._id)); // Changed from .id to ._id
    }
    setIsAllSelected(!isAllSelected);
  };

  const handleBulkDelete = () => {
    setFacultyList(facultyList.filter((f) => !selectedFacultyIds.includes(f.id)))
    setSelectedFacultyIds([])
  }

  const [addFacultyStatus, setAddFacultyStatus] = useState({
    loading: false,
    error: null
  });

  // Bulk selection handlers
const toggleFacultySelection = (id) => {
  setSelectedFacultyIds(prev => 
    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  );
};

const toggleSelectAllFaculty = () => {
  if (isAllSelected) {
    setSelectedFacultyIds([]);
  } else {
    setSelectedFacultyIds(filteredFaculty.map(f => f._id));
  }
  setIsAllSelected(!isAllSelected);
};

// Add these functions in AdminDashboard.js
const handleMarkAsSpecialCase = async () => {
  if (!selectedTeamForSpecialCase || !specialCaseReason.trim()) return;

  setIsUpdatingSpecialCase(true);
  try {
    const response = await fetch(`${API_BASE}/api/admin/teams/${selectedTeamForSpecialCase._id}/special-case`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({
        specialCase: true,
        reason: specialCaseReason.trim()
      })
    });

    const result = await response.json();

    if (response.ok) {
      alert(`Team "${selectedTeamForSpecialCase.name}" has been marked as a special case.`);
      fetchTeams(); // Refresh teams list
      setShowSpecialCaseModal(false);
      setSelectedTeamForSpecialCase(null);
      setSpecialCaseReason('');
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error('Mark special case error:', error);
    alert('Error marking team as special case');
  } finally {
    setIsUpdatingSpecialCase(false);
  }
};

const handleUnlockSpecialCase = async (teamId) => {
  const team = teamsList.find(t => t._id === teamId);
  if (!team) return;

  const confirmUnlock = window.confirm(
    `Are you sure you want to remove special case status from team "${team.name}"? This will allow normal team operations to resume.`
  );

  if (!confirmUnlock) return;

  try {
    const response = await fetch(`${API_BASE}/api/admin/teams/${teamId}/unlock-special-case`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      fetchTeams(); // Refresh teams list
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error('Unlock special case error:', error);
    alert('Error unlocking special case status');
  }
};


// Faculty Export
const exportFacultyToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(facultyList.map(faculty => ({
    "Name": faculty.name,
    "Email": faculty.email,
    "Department": faculty.department,
    "Role": faculty.role,
    "Status": faculty.status,
    "Phone": faculty.phone,
    "Office": faculty.office,
    "Join Date": faculty.joined
  })));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Faculty");
  XLSX.writeFile(workbook, "faculty.xlsx");
};
  const openProfile = (faculty) => {
    setSelectedFaculty(faculty)
    setEditedFaculty({ ...faculty })
  }

  const handleEditChange = (e) => {
    setEditedFaculty({
      ...editedFaculty,
      [e.target.name]: e.target.value
    })
  }

// Load settings when component mounts
useEffect(() => {
  if (activeTab === "settings") {
    loadAutoGroupSettings(); // ✅ Add this line
  }
}, [activeTab]);

  

  const saveProfileChanges = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/faculty/${editedFaculty._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(editedFaculty)
      });
  
      if (!response.ok) throw new Error('Update failed');
  
      const updatedFaculty = await response.json();
      setFacultyList(prev => 
        prev.map(f => f._id === updatedFaculty._id ? updatedFaculty : f)
      );
      setEditMode(false);
      setSelectedFaculty(updatedFaculty);
  
    } catch (err) {
      alert(`Update error: ${err.message}`);
    }
  };

  const generateFacultyEmail = (name) => {
    return `${name.toLowerCase().replace(/\s+/g, '.')}@ewubd.edu`;
  };
  
  // Update email when name changes
  useEffect(() => {
    if (newFaculty.name && !editMode) {
      setNewFaculty(prev => ({
        ...prev,
        email: generateFacultyEmail(prev.name)
      }));
    }
  }, [newFaculty.name, editMode]);

  const handleAddFaculty = async () => {

    setAddFacultyError('');

 if (!newFaculty.name || !newFaculty.department) {
    setAddFacultyError('Please fill all required fields (Name and Department)');
    return;
  }
  
    try {
      setAddFacultyStatus({ loading: true, error: null });
      const response = await fetch(`${API_BASE}/api/faculty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...newFaculty,
          status: "Active"
        })
      });
  
      if (!response.ok) throw new Error('Failed to add faculty');
  
      // Refresh faculty list
      const facultyRes = await fetch(`${API_BASE}/api/faculty`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const facultyData = await facultyRes.json();
      setFacultyList(facultyData);
  
      setShowAddModal(false);
      setNewFaculty({ name: "", email: "", department: "", role: "" });
      setAddFacultyError('');
      setAddFacultyStatus({ loading: false, error: null });
  
    } catch (err) {
    setAddFacultyError(`Error: ${err.message}`);
    setAddFacultyStatus({ loading: false, error: err.message });    }
  };
  
  const handleDeleteFaculty = async (id) => {
  
    try {
      const response = await fetch(`${API_BASE}/api/faculty/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
  
      if (response.ok) {
        await fetchFaculty(); // Refresh faculty list from server
        alert('Faculty member deleted successfully');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting faculty member');
    }
  };


  // Bulk delete handler
  const handleBulkFacultyDelete = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/faculty/bulk`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ ids: selectedFacultyIds })
      });
  
      if (response.ok) {
        await fetchFaculty(); // Refresh faculty list from server
        setSelectedFacultyIds([]);
        setIsAllSelected(false);
      }
    } catch (err) {
      console.error('Bulk delete error:', err);
      alert('Error deleting faculty members');
    }
  };


// Bulk status update handler
const handleBulkStatusChangeFaculty = async (status) => {
  if (!status || !selectedFacultyIds.length) return;

  try {
    const response = await fetch(`${API_BASE}/api/faculty/bulk-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ 
        ids: selectedFacultyIds, 
        status 
      })
    });

    if (response.ok) {
      const updatedFaculty = await response.json();
      setFacultyList(updatedFaculty);
      setSelectedFacultyIds([]);
      setIsAllSelected(false);
    }
     else {
      const errorData = await response.json();
      //throw new Error(errorData.message || 'Failed to update status');
    }
  } 
  catch (err) {
    console.error('Bulk status update error:', err);
    alert(`Error: ${err.message}`);
  }
};



  const handleAddCourse = () => {
    if (newCourse.code && newCourse.title) {
      setCourseList([
        ...courseList,
        {
          ...newCourse,
          id: Date.now(),
          enrolledStudents: 0,
          capacity: 50
        }
      ]);
      setShowAddCourseModal(false);
      setNewCourse({
        code: "",
        title: "",
        credits: 3,
        department: "Computer Science",
        instructor: "",
        status: "Active"
      });
    }
  };

  const handleBulkCourseDelete = () => {
    setCourseList(courseList.filter(course => 
      !selectedCourseIds.includes(course.id)
    ));
    setSelectedCourseIds([]);
    setIsAllCoursesSelected(false);
  };

 // Courses Export
 const exportCoursesToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(courseList.map(course => ({
    "Code": course.code,
    "Title": course.title,
    "Credits": course.credits,
    "Department": course.department,
    "Instructor": course.instructor,
    "Status": course.status,
    "Schedule": course.schedule,
    "Enrolled": course.enrolledStudents,
    "Capacity": course.capacity
  })));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Courses");
  XLSX.writeFile(workbook, "courses.xlsx");
};

  const [courseList, setCourseList] = useState([
    {
      id: 1,
      code: "Capstone A",
      title: "Introduction to Computer Science",
      credits: 3,
      department: "Computer Science",
      instructor: "Dr. Sarah Johnson",
      status: "Active",
      schedule: "MWF 10:00-11:30",
      enrolledStudents: 45,
      capacity: 50
    }
  ]);
  const filteredCourses = courseList.filter(course =>
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    code: "",
    title: "",
    credits: 3,
    department: "Computer Science",
    instructor: "",
    status: "Active"
  });
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [isAllCoursesSelected, setIsAllCoursesSelected] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editCourseMode, setEditCourseMode] = useState(false);
  const [editedCourse, setEditedCourse] = useState({});
  const [showAssignTeamsModal, setShowAssignTeamsModal] = useState(false);
const [availableTeams, setAvailableTeams] = useState([]);
const [selectedTeamsForBoard, setSelectedTeamsForBoard] = useState([]);


const [isSaving, setIsSaving] = useState(false);

// Announcement Handlers
// const handleAddAnnouncement = () => {
//   if (newAnnouncement.title && newAnnouncement.content) {
//     setAnnouncements([
//       ...announcements,
//       {
//         ...newAnnouncement,
//         id: Date.now(),
//         date: new Date().toISOString().split('T')[0],
//         author: "Admin",
//         attachments: []
//       }
//     ]);
//     setShowAddAnnouncementModal(false);
//     setNewAnnouncement({ title: "", content: "", audience: "All Students", status: "Draft" });
//   }
// };


const filteredStudents = useMemo(() => {
  return studentList.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesProgram = programFilter === 'all' || student.program === programFilter;
    
    return matchesSearch && matchesStatus && matchesProgram;
  });
}, [studentList, searchQuery, statusFilter, programFilter]);



const fetchAvailableTeams = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/teams/for-evaluation`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      setAvailableTeams(data.teams);
    }
  } catch (error) {
    console.error('Error fetching available teams:', error);
  }
};

// Function to assign teams to board for evaluation
const handleAssignTeamsToBoard = async (boardId, teamIds, phase) => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/boards/${boardId}/assign-teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ teamIds, phase })
    });

    if (response.ok) {
      alert('Teams assigned to board successfully');
      fetchBoards(); // Refresh boards
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (error) {
    console.error('Error assigning teams to board:', error);
    alert('Error assigning teams to board');
  }
};


const handleAddStudent = async () => {
   if (!newStudent.studentId || !newStudent.name) {
    alert("Please fill in all required fields (Student ID and Name)");
    return;
  }
  try {
    const response = await fetch(`${API_BASE}/api/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(newStudent)
    });

    if (response.ok) {
      const studentsRes = await fetch(`${API_BASE}/api/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const studentsData = await studentsRes.json();
      setStudentList(studentsData);
      setShowAddStudentModal(false);
      setNewStudent({ 
        name: "", 
        email: "", 
        studentId: "", 
        program: "", 
        status: "Active" 
      });
    }
    // Add this validation check before submitting
if (newStudent.cgpa < 0 || newStudent.cgpa > 4.0) {
  alert("CGPA must be between 0 and 4.0");
  return;
}
  } catch (err) {
    console.error('Error adding student:', err);
  }
};



  
useEffect(() => {
  if (!editStudentMode && newStudent.studentId) {
    const generatedEmail = `${newStudent.studentId}@std.ewubd.edu`;
    setNewStudent(prev => ({
      ...prev,
      email: generatedEmail
    }));
  }
}, [newStudent.studentId, editStudentMode]);

const sortedStudents = useMemo(() => {
  return [...filteredStudents].sort((a, b) => {
    const aValue = a[sortConfig.key]?.toLowerCase?.() || a[sortConfig.key];
    const bValue = b[sortConfig.key]?.toLowerCase?.() || b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
}, [filteredStudents, sortConfig]);

const handleSort = (key) => {
  setSortConfig(prev => ({
    key,
    direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
  }));
};

const handleBulkStatusChange = async (newStatus) => {
  if (!newStatus || selectedStudentIds.length === 0) return;

  const token = localStorage.getItem('adminToken');
  if (!token) {
    return alert('🚨 No admin token found – please log in again.');
  }

  try {
    const res = await fetch(`${API_BASE}/api/students/bulk-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ids: selectedStudentIds,
        status: newStatus,
      }),
    });

    // parse whatever the server gave you
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      console.error('Bulk update failed:', res.status, payload);
      return alert(
        `Error ${res.status}: ${payload?.message || res.statusText}`
      );
    }

    // success—merge statuses in
    setStudentList(prev =>
      prev.map(s => {
        const updated = payload.find(u => u._id === s._id);
        return updated ? { ...s, status: updated.status } : s;
      })
    );
    setSelectedStudentIds([]);
    setSelectedStudentIds([]);
    setBulkStatus('');
  } catch (err) {
    console.error('Network/server error:', err);
    alert(`Network error: ${err.message}`);
  }
};


const handleSaveStudent = async () => {
  try {
    setIsSaving(true);
    const isEdit = !!editedStudent._id;
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit 
      ? `${API_BASE}/api/students/${editedStudent._id}`
      : `${API_BASE}/api/students`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(editedStudent) // Send the edited student data
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save student');
    }

    const savedStudent = await response.json();
    
    // Update the student list state
    setStudentList(prev => isEdit
      ? prev.map(s => s._id === savedStudent._id ? savedStudent : s)
      : [...prev, savedStudent]
    );
    
    // Close modal and reset states
    setShowAddStudentModal(false);
    setEditStudentMode(false);
    setEditedStudent({});
    setCompletedCreditsError('');

  } catch (err) {
    console.error('Save error:', err);
    alert(err.message || 'Failed to save student');
  }
  finally {
    setIsSaving(false);
  }
};




// In AdminDashboard.js
// AdminDashboard.js - Update the bulk delete handler
const handleBulkStudentDelete = async () => {
  if (!selectedStudentIds.length) return;

  try {
    const response = await fetch(`${API_BASE}/api/students/bulk`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
      body: JSON.stringify({ ids: selectedStudentIds }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Bulk delete failed');
    }

    alert(`Deleted ${result.deletedCount} students.`);

    // Refresh list
    const studentsRes = await fetch(`${API_BASE}/api/students`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });

    const studentsData = await studentsRes.json();
    setStudentList(studentsData);
    setSelectedStudentIds([]);
    setIsAllStudentsSelected(false);

  } catch (err) {
    console.error('Bulk delete error:', err);
    alert(`Error: ${err.message}`);
  }
};


// Update handleDeleteStudent
const handleDeleteStudent = async (studentId) => {
  try {
    const response = await fetch(`${API_BASE}/api/students/${studentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete student');
    }

    setStudentList(prev => prev.filter(student => student._id !== studentId));
    setShowDeleteModal(false);
    setStudentToDelete(null);

  } catch (err) {
    console.error('Delete error:', err);
    alert(err.message || 'Failed to delete student');
  }
};

// Add this state to your AdminDashboard.js
const [autoGroupSettings, setAutoGroupSettings] = useState({
  enabled: false,
  minCreditsRequired: 95,
  allowSoloGroups: true,
  checkIntervalMinutes: 30,
  autoCreateThreshold: 4 // Max students for auto-creation
});


useEffect(() => {
  if (activeTab === "evaluations") {
    fetchPendingEvaluations();
  }
  if (activeTab === "boards") {
    fetchBoards();
    fetchAvailableFacultyForBoard();
  }
}, [activeTab]);


const fetchEvaluationStats = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/evaluations/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    
    if (response.ok) {
      const stats = await response.json();
      // Update your evaluation stats state here
      console.log('Evaluation stats:', stats);
    }
  } catch (error) {
    console.error('Error fetching evaluation stats:', error);
  }
};

// Add this function to AdminDashboard.js after your state declarations
const formatDate = (dateString) => {
  if (!dateString) return 'Not available';

  try {
    let date;

    // Handle different date formats
    if (dateString instanceof Date) {
      date = dateString;
    } else if (typeof dateString === 'string') {
      // Try to parse ISO string first, then fallback to general parsing
      date = dateString.includes('T') ? new Date(dateString) : new Date(dateString);
    } else {
      return 'Invalid date';
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    // Format as a readable date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

// Add this function to load settings
const loadAutoGroupSettings = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/auto-group-settings`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    });
    if (response.ok) {
      const settings = await response.json();
      setAutoGroupSettings(settings);
    }
  } catch (error) {
    console.error('Failed to load auto-group settings:', error);
  }
};

// Add this function to save settings
const saveAutoGroupSettings = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/auto-group-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(autoGroupSettings)
    });

    if (response.ok) {
      setMessage('Auto-group settings saved successfully!');
    }
  } catch (error) {
    console.error('Failed to save auto-group settings:', error);
  }
};

useEffect(() => {
  // Automatically uncheck "Select All" when selection changes
  setIsAllStudentsSelected(
    selectedStudentIds.length > 0 && 
    selectedStudentIds.length === filteredStudents.length
  );
}, [selectedStudentIds, filteredStudents]);

 // Students Export
 const exportStudentsToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(studentList.map(student => ({
    "Name": student.name,
    "Email": student.email,
    "Student ID": student.studentId,
    "Program": student.program,
    "Status": student.status,
    "Phone": student.phone || "N/A",
    "Address": student.address || "N/A",
     "CGPA": student.cgpa.toFixed(2),
    "Completed Credits": student.completedCredits || 0,
    "Enrollment Date": student.enrolled
  })));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
  XLSX.writeFile(workbook, "students.xlsx");
};


  // const filteredFaculty = facultyList.filter(
  //   (faculty) =>
  //     faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     faculty.email.toLowerCase().includes(searchQuery.toLowerCase())
  // )



const [importResults, setImportResults] = useState(null);
//import from excel
// Updated handleImportStudents function

const handleImportStudents = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Reset file input
  e.target.value = null;

  setImportResults({
    success: null,
    imported: 0,
    total: 0,
    errors: [],
    message: 'Processing file...'
  });

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let processedCount = 0;
      const errors = [];
      const students = [];
      const seenIds = new Set();

      const getProgramFromStudentId = (studentId) => {
        const parts = studentId?.split('-');
        if (!parts || parts.length < 4) return 'Undecided';
        const departmentCode = parts[2];
        switch(departmentCode) {
          case '60': return 'Computer Science';
          case '50': return 'Electrical Engineering';
          default: return 'Undecided';
        }
      };

      // Validation phase
            jsonData.forEach((row, index) => {
        try {
          // Check mandatory fields
          if (!row['Student ID'] || row['Completed Credits'] === undefined) {
            throw new Error('Missing required fields (Student ID, Completed Credits)');
          }

          // Validate Student ID format
          const studentId = row['Student ID'].toString().trim();
          if (!/^\d{4}-\d-\d{2}-\d{3}$/.test(studentId)) {
            throw new Error('Invalid Student ID format (XXXX-X-XX-XXX)');
          }

          // Check for duplicates in file
          if (seenIds.has(studentId)) {
            throw new Error('Duplicate Student ID in file');
          }
          seenIds.add(studentId);

          // Validate Completed Credits
          const completedCredits = parseInt(row['Completed Credits']);
          if (isNaN(completedCredits)) {
            throw new Error('Completed Credits must be a number');
          }
          if (completedCredits < 0 || completedCredits > 150) {
            throw new Error('Completed Credits must be between 0-150');
          }

          // Validate CGPA if present
          let cgpa = 0.0;
          if (row['CGPA'] !== undefined) {
            cgpa = parseFloat(row['CGPA']);
            if (isNaN(cgpa)) {
              throw new Error('CGPA must be a number');
            }
            if (cgpa < 0 || cgpa > 4) {
              throw new Error('CGPA must be between 0-4');
            }
          }

          students.push({
            name: row['Name'] || `Student ${studentId}`,
            email: row['Email'] || `${studentId}@std.ewubd.edu`,
            studentId: studentId,
            program: row['Program'] || getProgramFromStudentId(studentId),
            completedCredits: completedCredits,
            cgpa: cgpa,
            status: row['Status'] || 'Active',
            phone: row['Phone'] || '',
            address: row['Address'] || '',
            enrolled: row['Enrollment Date'] || new Date().toISOString()
          });

          processedCount++;
        } catch (err) {
          errors.push(`Row ${index + 2}: ${err.message}`);
        }
      });

      // Update results after validation
      setImportResults({
        success: processedCount > 0,
        imported: processedCount,
        total: jsonData.length,
        errors,
        message: students.length > 0 ? 'Uploading to server...' : 'No valid students found'
      });

      // Only make API call if we have valid students
      if (students.length > 0) {
        const response = await fetch(`${API_BASE}/api/students/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify({ students })
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || 'Server rejected import request');
        }

        // Update with final server results
        setImportResults(prev => ({
          success: result.importedCount > 0,
          imported: result.importedCount || 0,
          total: prev.total,
          errors: [...prev.errors, ...(result.errors || [])],
          message: result.message || 'Import completed with partial success'
        }));

        // Refresh student list
        const updatedRes = await fetch(`${API_BASE}/api/students`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const updatedData = await updatedRes.json();
        setStudentList(updatedData);
      }

    } catch (err) {
  setImportResults(prev => ({
    success: false,
    imported: prev?.imported || 0,
    total: prev?.total || 0,
    errors: [...(prev?.errors || []), err.message],
    message: 'Import failed completely'
  }));
    }
  };
  reader.readAsArrayBuffer(file);
};



const [boards, setBoards] = useState([
  {
    id: 1,
    name: "Board 1",
    faculty: [],
    students: [],
    description: "Final Year Project Review Board"
  }
]);
const [showBoardModal, setShowBoardModal] = useState(false);


const [boardsList, setBoardsList] = useState([]);
const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
const [showEditBoardModal, setShowEditBoardModal] = useState(false);
const [showBoardDetailModal, setShowBoardDetailModal] = useState(false);
const [selectedBoard, setSelectedBoard] = useState(null);
const [newBoard, setNewBoard] = useState({
  name: '',
  description: '',
  faculty: []
});
const [boardStats, setBoardStats] = useState({
  total: 0,
  totalFaculty: 0,
  totalTeams: 0
});
const [availableFacultyForBoard, setAvailableFacultyForBoard] = useState([]);
const [boardFacultySearch, setBoardFacultySearch] = useState('');

const handleImportFaculty = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const facultyMembers = jsonData.map((row) => ({
        name: row['Name'],
        email: row['Email'],
        department: row['Department'],
        role: row['Role'],
        status: row['Status'] || 'Active',
        phone: row['Phone'] || '',
        office: row['Office'] || '',
        joined: row['Join Date'] || new Date().toISOString()
      }));

      const response = await fetch(`${API_BASE}/api/faculty/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ faculty: facultyMembers })
      });

      const result = await response.json();

      if (response.ok) {
        setFacultyList(prev => [...prev, ...result.faculty]);
        alert(`Successfully imported ${result.imported} faculty members.\n
               ${result.skipped} entries skipped.`);
        if (result.skipped > 0) {
          console.log('Skipped entries:', result.details.skippedEntries);
          // You could also show these in the UI if needed
        }
      } else {
        throw new Error(result.message || 'Faculty import failed');
      }

    } catch (err) {
      alert(`Import Error: ${err.message}`);
      console.error('Import failed:', err);
    } finally {
      // Reset file input
      e.target.value = '';
    }
  };
  reader.readAsArrayBuffer(file);
};

const downloadFacultyTemplate = () => {
  const sampleData = [{
    "Name": "Dr. Sarah Johnson",
    "Email": "sarah.johnson@ewubd.edu",
    "Department": "Computer Science",
    "Role": "Professor",
    "Status": "Active",
    "Phone": "+880 1234 567890",
    "Office": "CS-502",
    "Join Date": "2020-03-15T00:00:00"
  }];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Faculty");
  XLSX.writeFile(workbook, "faculty_template.xlsx");
};


const downloadFaculty_Template = () => {
  const sampleData = [{
    "Name": "Dr. Sarah Johnson",
    "Email": "sarah.johnson@ewubd.edu",
    "Department": "Computer Science"
  }];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Faculty");
  XLSX.writeFile(workbook, "faculty_template.xlsx");
};

const downloadSampleTemplate = () => {
  const sampleData = [{
    "Name": "Md.Shakib Shalim",
    "Email": "2021-2-60-076@std.ewubd.edu",
    "Student ID": "2021-2-60-076",
    "Program": "Computer Science",
    "CGPA": 3.75,
    "Status": "Active",
    "Completed Credits": 95,
    "Phone": "+880 1234 567890",
    "Address": "Kushtia, Meherpur",
    "Enrollment Date": "2023-09-01T00:00:00"
  }];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
  XLSX.writeFile(workbook, "students_template.xlsx");
};

const downloadMinimalTemplate = () => {
  const sampleData = [{
    "Student ID": "2021-2-60-078",
    "Completed Credits": 95
  }];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
  XLSX.writeFile(workbook, "student_minimal_template.xlsx");
};


function CreditsConfig({ activeTab }) {
  const [config, setConfig] = useState({
    requiredCredits: '',
    maintenanceMode: false
  });


  // Fetch current config when settings tab is active
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/config`);
        const data = await response.json();
        setConfig({
          requiredCredits: data.requiredCredits,
          maintenanceMode: data.maintenanceMode
        });
        setMessage('');
      } catch (err) {
        setMessage('Error loading configuration');
      }
    };

    if (activeTab === "settings") {
      fetchConfig();
      const interval = setInterval(fetchConfig, 15000); // Refresh every 15 seconds
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleCreditsSubmit = async (e) => {
    e.preventDefault();
    try {
      const numericCredits = Number(config.requiredCredits);
      
      if (isNaN(numericCredits)) {
        setMessage('Please enter a valid number');
        return;
      }

      const response = await fetch(`${API_BASE}/api/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ requiredCredits: numericCredits })
      });

      const data = await response.json();
      
      if (response.ok) {
        setConfig(prev => ({ ...prev, requiredCredits: data.requiredCredits }));
        setMessage('Requirements updated successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Error updating requirements');
      }
    } catch (err) {
      setMessage('Server error');
    }
  };


  

// Add to useEffect for boards tab
useEffect(() => {
  if (activeTab === "boards") {
    fetchBoards();
    fetchAvailableFacultyForBoard();
  }
}, [activeTab]);

  // In CreditsConfig component
const handleMaintenanceToggle = async (e) => {
  const maintenanceMode = e.target.checked;
  try {
    const response = await fetch(`${API_BASE}/api/config/maintenance`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ maintenanceMode })
    });

    const data = await response.json();
    if (response.ok) {
      // Update local state with server response
      setConfig(prev => ({ 
        ...prev, 
        maintenanceMode: data.maintenanceMode 
      }));
    }
  } catch (err) {
    console.error('Error updating maintenance mode:', err);
  }
};

  return (
    <div className="config-panel">
      <div className="config-header">
        <h3>System Configuration</h3>
      </div>

      {/* Credits Configuration */}
      <div className="config-section">
        <h4>Capstone Eligibility Requirements</h4>
        <form onSubmit={handleCreditsSubmit}>
          <div className="admin-form-group">
            <label>Update Minimum Credits:</label>
            <input
              type="number"
              value={config.requiredCredits}
              onChange={(e) => {
                const value = e.target.value;
                const numericValue = value === '' ? 0 : Math.min(140, Math.max(0, Number(value)));
                setConfig(prev => ({ ...prev, requiredCredits: numericValue }));
              }}
              min="0"
              max="140"
              required
            />
          </div>
          <button type="submit" className="admin-action-button">
            <FontAwesomeIcon icon={faSave} /> Update Credits
          </button>
        </form>
      </div>

      {/* Maintenance Mode Section */}
      <div className="config-section maintenance-section">
        <h4>System Maintenance</h4>
        <div className="toggle-group">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={config.maintenanceMode}
              onChange={handleMaintenanceToggle}
            />
            <span className="slider round"></span>
          </label>
          <div className="toggle-labels">
            <span className={config.maintenanceMode ? 'active' : ''}>Maintenance Mode</span>
            <span className="status-indicator">
              {config.maintenanceMode ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <p className="warning-text">
          {config.maintenanceMode 
            ? '⚠️ Students will see a maintenance message and cannot login'
            : 'System is operational and accessible to students'}
        </p>
      </div>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

const fetchPendingEvaluations = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/evaluations/pending-review`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      setPendingEvaluations(data.evaluations || []);
    }
  } catch (error) {
    console.error('Error fetching pending evaluations:', error);
  }
};

// Add this function to handle evaluation review
// Enhanced evaluation review handler
const handleReviewEvaluation = async (evaluationId) => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/evaluations/${evaluationId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      setSelectedEvaluation(data.evaluation);
      setAdminComments(data.evaluation.adminReview?.adminComments || '');
      
      // Initialize modified grades with validation
      const initialModifiedGrades = data.evaluation.facultyResults?.individualResults?.map(result => ({
        studentId: result.studentId,
        studentName: result.studentName,
        originalMark: result.finalMark || 0,
        modifiedMark: result.finalMark || 0,
        modificationReason: '',
        isModified: false
      })) || [];
      
      setModifiedGrades(initialModifiedGrades);
      setShowEvaluationReviewModal(true);
    }
  } catch (error) {
    console.error('Error fetching evaluation details:', error);
    alert('Failed to load evaluation details');
  }
};

// Enhanced grade modification handler
const handleGradeChange = (index, field, value) => {
  const newGrades = [...modifiedGrades];
  newGrades[index][field] = value;
  
  // Auto-detect if grade was modified
  if (field === 'modifiedMark') {
    newGrades[index].isModified = parseFloat(value) !== parseFloat(newGrades[index].originalMark);
  }
  
  setModifiedGrades(newGrades);
};

// Add this function to submit admin review
const handleSubmitReview = async (action) => {
  if (!selectedEvaluation) return;
  
  setIsFinalizingEvaluation(true);
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/evaluations/${selectedEvaluation._id}/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({
        modifiedGrades: modifiedGrades,
        adminComments: adminComments,
        action: action // 'save_draft' or 'finalize'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      alert(data.message);
      setShowEvaluationReviewModal(false);
      fetchPendingEvaluations(); // Refresh the list
      
      // Clear form
      setSelectedEvaluation(null);
      setAdminComments('');
      setModifiedGrades([]);
    } else {
      const errorData = await response.json();
      alert(errorData.message || 'Failed to submit review');
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    alert('Network error while submitting review');
  } finally {
    setIsFinalizingEvaluation(false);
  }
};
  /*--------------------------Tasnuva-------------------*/
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/faculty`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('facultyToken')}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch faculty data');
        }

        const data = await res.json();
        setFacultyList(data); // Set fetched faculty data into state
      } 
      catch (err) {
        console.error('Error fetching faculty data:', err);
      }
    };

    fetchFaculty();
  }, []); 


  const fetchAvailableFaculty = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/faculty`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    if (response.ok) {
      const faculty = await response.json();
      // Filter only active faculty
      const activeFaculty = faculty.filter(f => f.status === 'Active');
      setAvailableFaculty(activeFaculty);
    }
  } catch (error) {
    console.error('Error fetching faculty:', error);
  }
};

// Assign supervisor to team
const handleAssignSupervisor = async () => {
  if (!selectedSupervisorId || !selectedTeamForSupervisor) return;

  setIsAssigningSupervisor(true);
  try {
    const response = await fetch(`${API_BASE}/api/admin/teams/${selectedTeamForSupervisor._id}/assign-supervisor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ facultyId: selectedSupervisorId })
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      fetchTeams(); // Refresh teams list
      setShowAssignSupervisorModal(false);
      setSelectedSupervisorId('');
      setSelectedTeamForSupervisor(null);
      setSupervisorSearchQuery('');
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error('Assign supervisor error:', error);
    alert('Error assigning supervisor to team');
  } finally {
    setIsAssigningSupervisor(false);
  }
};

// Remove supervisor from team
const handleRemoveSupervisor = async (team) => {
  if (!window.confirm(`Are you sure you want to remove ${team.currentSupervisor?.facultyName} as supervisor from team "${team.name}"?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/admin/teams/${team._id}/remove-supervisor`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      fetchTeams(); // Refresh teams list
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error('Remove supervisor error:', error);
    alert('Error removing supervisor from team');
  }
};
  /*--------------------------Tasnuva-------------------*/

// Update filteredFaculty calculation
// const filteredFaculty = facultyList.filter((faculty) => {
//   const matchesSearch = faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     faculty.email.toLowerCase().includes(searchQuery.toLowerCase());
  
//   const matchesStatus = statusFilterFaculty === 'all' || faculty.status === statusFilterFaculty;
//   const matchesDepartment = departmentFilter === 'all' || faculty.department === departmentFilter;
  
//   return matchesSearch && matchesStatus && matchesDepartment;
// });

const [statusFilterFaculty, setStatusFilterFaculty] = useState('all');
const [departmentFilter, setDepartmentFilter] = useState('all');

// Update filteredFaculty calculation
const filteredFaculty = useMemo(() => {
  return facultyList.filter(faculty => {
    const searchMatch = faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faculty.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const statusMatch = statusFilterFaculty === 'all' || 
      faculty.status.toLowerCase() === statusFilterFaculty.toLowerCase();
    
    const departmentMatch = departmentFilter === 'all' || 
      faculty.department === departmentFilter;

    return searchMatch && statusMatch && departmentMatch;
  });
}, [facultyList, searchQuery, statusFilterFaculty, departmentFilter]);



// Update the existing fetchBoards function in AdminDashboard.js
const fetchBoards = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/boards`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch boards');
    
    const data = await response.json();
    setBoardsList(data.boards || []);
    
    // Calculate stats from the response
    const stats = {
      total: data.boards?.length || 0,
      totalFaculty: data.boards?.reduce((sum, board) => sum + (board.faculty?.length || 0), 0) || 0,
      totalTeams: data.boards?.reduce((sum, board) => sum + (board.totalTeams || 0), 0) || 0
    };
    setBoardStats(stats);
    
  } catch (err) {
    console.error('Error fetching boards:', err);
    alert('Error loading boards data');
  }
};

const fetchAvailableFacultyForBoard = async (excludeBoardId = null) => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/faculty/available-for-board${excludeBoardId ? `?exclude=${excludeBoardId}` : ''}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      setAvailableFacultyForBoard(data.faculty);
    }
  } catch (error) {
    console.error('Error fetching available faculty:', error);
  }
};



const handleCreateBoard = async () => {
  if (!newBoard.name.trim()) {
    alert('Board name is required');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/admin/boards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({
        name: newBoard.name.trim(),
        description: newBoard.description.trim(),
        faculty: newBoard.faculty.map(f => f._id) // Send only faculty IDs
      })
    });

    const result = await response.json();

    if (response.ok) {
      alert('Board created successfully');
      fetchBoards(); // Refresh the boards list
      setShowCreateBoardModal(false);
      setNewBoard({ name: '', description: '', faculty: [] });
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error('Create board error:', error);
    alert('Error creating board');
  }
};


const handleUpdateBoard = async () => {
  if (!selectedBoard) return;

  try {
    const response = await fetch(`${API_BASE}/api/admin/boards/${selectedBoard._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({
        name: selectedBoard.name,
        description: selectedBoard.description,
        faculty: selectedBoard.faculty
      })
    });

    const result = await response.json();

    if (response.ok) {
      alert('Board updated successfully');
      fetchBoards();
      setShowEditBoardModal(false);
      setSelectedBoard(null);
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error('Update board error:', error);
    alert('Error updating board');
  }
};

const handleDeleteBoard = async (boardId) => {
  if (!window.confirm('Are you sure you want to delete this board? Faculty will be unassigned.')) return;
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/boards/${boardId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    
    if (response.ok) {
      await fetchBoards();
      alert('Board deleted successfully');
    }
  } catch (err) {
    console.error('Delete error:', err);
    alert('Error deleting board');
  }
};

const addFacultyToBoard = (facultyId) => {
  const faculty = availableFacultyForBoard.find(f => f._id === facultyId);
  if (faculty && !selectedBoard.faculty.find(f => f._id === facultyId)) {
    setSelectedBoard({
      ...selectedBoard,
      faculty: [...selectedBoard.faculty, faculty]
    });
  }
};

const removeFacultyFromBoard = (facultyId) => {
  setSelectedBoard({
    ...selectedBoard,
    faculty: selectedBoard.faculty.filter(f => f._id !== facultyId)
  });
};

  const renderContent = () => {
    switch (activeTab) {
      case "settings":
      return (
    <div className="content-box">
      <div className="management-header">
        <h2>System Settings</h2>
          <div className="current-credits-display">
    Minimum Credits Required:
    <span className="credits-value">
      {currentRequirement !== null
        ? `${currentRequirement} credits`
        : 'Loading...'}
    </span>
  </div>
      </div>
      <CreditsConfig />
      <div className="settings-section">
        <h3><FontAwesomeIcon icon={faCog} className="section-icon" />Automatic Group Creation</h3>
        <div className="settings-card">
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={autoGroupSettings.enabled}
                onChange={(e) => setAutoGroupSettings({
                  ...autoGroupSettings,
                  enabled: e.target.checked
                })}
              />
              <span>Enable Automatic Group Creation</span>
            </label>
            <small>Automatically create teams when student count falls below threshold</small>
          </div>

          {autoGroupSettings.enabled && (
            <>
              <div className="setting-item">
                <label>Minimum Credits Required:</label>
                <input
                  type="number"
                  value={autoGroupSettings.minCreditsRequired}
                  onChange={(e) => setAutoGroupSettings({
                    ...autoGroupSettings,
                    minCreditsRequired: parseInt(e.target.value)
                  })}
                  min="0"
                  max="150"
                />
                <small>Students need this many credits to be eligible for auto-grouping</small>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={autoGroupSettings.allowSoloGroups}
                    onChange={(e) => setAutoGroupSettings({
                      ...autoGroupSettings,
                      allowSoloGroups: e.target.checked
                    })}
                  />
                  <span>Allow Solo Groups (1 student)</span>
                </label>
                <small>Create single-member groups when only 1 eligible student remains</small>
              </div>

              <div className="setting-item">
                <label>Check Interval (minutes):</label>
                <select
                  value={autoGroupSettings.checkIntervalMinutes}
                  onChange={(e) => setAutoGroupSettings({
                    ...autoGroupSettings,
                    checkIntervalMinutes: parseInt(e.target.value)
                  })}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
                <small>How often to check for automatic group creation</small>
              </div>

              <div className="auto-group-rules">
                <h4>Automatic Group Creation Rules:</h4>
                <div className="rule-grid">
                  <div className="rule-item">
                    <FontAwesomeIcon icon={faUserFriends} className="rule-icon" />
                    <div>
                      <strong>4 Eligible Students</strong>
                      <span>Create 1 group of 4 members</span>
                    </div>
                  </div>
                  <div className="rule-item">
                    <FontAwesomeIcon icon={faUserFriends} className="rule-icon" />
                    <div>
                      <strong>3 Eligible Students</strong>
                      <span>Create 1 group of 3 members</span>
                    </div>
                  </div>
                  <div className="rule-item">
                    <FontAwesomeIcon icon={faUserFriends} className="rule-icon" />
                    <div>
                      <strong>2 Eligible Students</strong>
                      <span>Create 1 group of 2 members</span>
                    </div>
                  </div>
                  <div className="rule-item">
                    <FontAwesomeIcon icon={faUserGraduate} className="rule-icon" />
                    <div>
                      <strong>1 Eligible Student</strong>
                      <span>Create solo group (if enabled)</span>
                    </div>
                  </div>
                  <div className="rule-item">
                    <FontAwesomeIcon icon={faUsersCog} className="rule-icon" />
                    <div>
                      <strong>5+ Eligible Students</strong>
                      <span>No automatic creation - manual choice</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="setting-actions">
            <button 
              className="admin-action-button"
              onClick={saveAutoGroupSettings}
            >
              <FontAwesomeIcon icon={faSave} /> Save Auto-Group Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
      case "faculty":
        return (
          <div className="content-box">
            <div className="management-header">
              <h2>Manage Faculty</h2>
              <div className="controls">
              <div className="action-group">
              <input
    type="file"
    id="import-faculty-file"
    accept=".xlsx, .xls"
    style={{ display: 'none' }}
    onChange={handleImportFaculty}
  />
  <button
    className="admin-action-button primary"
    onClick={() => document.getElementById('import-faculty-file').click()}
  >
    <FontAwesomeIcon icon={faFileImport} /> Import Excel
  </button>
  <button
    className="admin-action-button"
    onClick={downloadFacultyTemplate}
  >
    <FontAwesomeIcon icon={faDownload} /> Full Template
  </button>
  <button
    className="admin-action-button"
    onClick={downloadFaculty_Template}
  >
    <FontAwesomeIcon icon={faDownload} /> Minimal Template
  </button>
  <button className="admin-action-button" onClick={exportFacultyToExcel}>
    <FontAwesomeIcon icon={faFileExport} /> Export Excel
  </button>
  </div>

  <div className="search-filter-group">
      <input
        type="text"
        placeholder="Search faculty..."
        className="search-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <select
        className="filter-select"
        value={statusFilterFaculty}
        onChange={(e) => setStatusFilterFaculty(e.target.value)}
      >
        <option value="all">All Statuses</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
        <option value="On Leave">On Leave</option>
      </select>
      <select
        className="filter-select"
        value={departmentFilter}
        onChange={(e) => setDepartmentFilter(e.target.value)}
      >
        <option value="all">All Departments</option>
        <option value="Computer Science">Computer Science</option>
        <option value="Electrical Engineering">Electrical Engineering</option>
        <option value="Physics">Physics</option>
        {/* Add more departments as needed */}
      </select>
    </div>

  <div className="search-add-group">
                <button
                  className="admin-action-button"
                  onClick={() => setShowAddModal(true)}
                >
                  + Add New Faculty
                </button>
              </div>
              </div>
{/* Update the existing bulk action group in the Faculty section */}
<div className="bulk-action-container">
  <div className="bulk-action-group">
    <div className="bulk-select-wrapper">
      <select
        className="bulk-action-select"
        onChange={(e) => handleBulkStatusChangeFaculty(e.target.value)}
        disabled={!selectedFacultyIds.length}
        value=""
      >
        <option value="" disabled>Bulk Actions</option>
        <option value="Active">Set Active</option>
        <option value="Inactive">Set Inactive</option>
        <option value="On Leave">Set On Leave</option>
      </select>
      <span className="custom-arrow"></span>
    </div>
    <button
      className="bulk-delete-button"
      onClick={handleBulkFacultyDelete}
      disabled={!selectedFacultyIds.length}
    >
      <FontAwesomeIcon icon={faTrashAlt} />
      Delete Selected
      <span className="badge">{selectedFacultyIds.length}</span>
    </button>
  </div>
</div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        disabled={filteredFaculty.length === 0}
                      />
                    </th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFaculty.map((faculty) => (
                    <tr
                      key={faculty._id}
                      onClick={() => openProfile(faculty)}
                      className="clickable-row"
                    >
                      <td
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFacultyIds.includes(faculty._id)}
                          onChange={() => toggleSelection(faculty._id)}
                        />
                      </td>
                      <td>{faculty.name}</td>
                      <td>{faculty.email}</td>
                      <td>{faculty.department}</td>
                      <td>
                        <span
                          className={`status-badge ${faculty.status.toLowerCase()}`}
                        >
                          {faculty.status}
                        </span>
                      </td>
                      <td>{formatEnrollmentDate(faculty.joined)}</td>
                      <td>
  <button
    className="action-btn delete-btn"
   onClick={(e) => {
      e.stopPropagation();
      setFacultyToDelete(faculty._id);
    setShowFacultyDeleteModal(true);
  }}
>
    <FontAwesomeIcon icon={faTrashAlt} className="menu-icon" />
    <span className="button-text-label">Delete</span> {/* Wrap text */}
  </button>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {showAddModal && (
  <div className="admin-modal-overlay" onClick={() => {
    setShowAddModal(false);
    setAddFacultyError(''); // Clear error when closing
  }}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <h3>Add New Faculty Member</h3>
      
      {/* Error Message Display */}
      {addFacultyError && (
        <div className="error-message-modal">
          {addFacultyError}
        </div>
      )}
      
      <div className="admin-form-group">
        <label>Full Name *</label>
        <input
          type="text"
          value={newFaculty.name}
          onChange={(e) =>
            setNewFaculty({ ...newFaculty, name: e.target.value })
          }
          required
        />
      </div>
      <div className="admin-form-group">
        <label>Email</label>
        <input
          type="email"
          value={newFaculty.email}
          readOnly
          className="readonly-input"
        />
      </div>
      <div className="admin-form-group">
        <label>Department *</label>
        <select
          value={newFaculty.department}
          onChange={(e) =>
            setNewFaculty({ ...newFaculty, department: e.target.value })
          }
          required
        >
          <option value="">Select Department</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Electrical Engineering">Electrical Engineering</option>
          <option value="Physics">Physics</option>
        </select>
      </div>
      <div className="admin-form-group">
        <label>Role</label>
        <select
          value={newFaculty.role}
          onChange={(e) =>
            setNewFaculty({ ...newFaculty, role: e.target.value })
          }
        >
          <option value="Professor">Professor</option>
          <option value="Associate Professor">Associate Professor</option>
          <option value="Assistant Professor">Assistant Professor</option>
          <option value="Lecturer">Lecturer</option>
          <option value="Adjunct">Adjunct</option>
        </select>
      </div>
      <div className="form-actions">
        <button
          className="admin-action-button"
          onClick={handleAddFaculty}
          disabled={addFacultyStatus.loading}
        >
          {addFacultyStatus.loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              Adding...
            </>
          ) : (
            'Save'
          )}
        </button>
        <button
          className="admin-action-button cancel"
          onClick={() => {
            setShowAddModal(false);
            setAddFacultyError(''); // Clear error when canceling
          }}
          disabled={addFacultyStatus.loading}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

            {/* Faculty Delete Confirmation Modal */}
{showFacultyDeleteModal && (
  <div 
    className="admin-modal-overlay" 
    onClick={() => {
      setShowFacultyDeleteModal(false);
      setFacultyToDelete(null);
    }}
  >
    <div className="modal confirmation-modal" onClick={(e) => e.stopPropagation()}>
      <h3>Confirm Deletion</h3>
      <p>Are you sure you want to delete this faculty member? This action cannot be undone.</p>
      <div className="form-actions">
        <button
          className="admin-action-button danger"
          onClick={() => handleDeleteFaculty(facultyToDelete)}
        >
          Confirm Delete
        </button>
        <button
          className="admin-action-button cancel"
          onClick={() => {
            setShowFacultyDeleteModal(false);
            setFacultyToDelete(null);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

            {selectedFaculty && (
              <div className="admin-modal-overlay" onClick={() => setSelectedFaculty(null)}>
                <div className="modal profile-modal" onClick={(e) => e.stopPropagation()}>
                  <h3>{selectedFaculty.name}'s Profile</h3>
                  {!editMode ? (
                    <div className="profile-details">
                      <div className="detail-item">
                    <label>Joined Date:</label>
                    <span>{formatEnrollmentDate(selectedFaculty.joined)}</span>
                  </div>
                      <div className="detail-item">
                        <label>Email:</label>
                        <span>{selectedFaculty.email}</span>
                      </div>
                      <div className="detail-item">
                        <label>Department:</label>
                        <span>{selectedFaculty.department}</span>
                      </div>
                      <div className="detail-item">
                        <label>Status:</label>
                        <span
                          className={`status-badge ${selectedFaculty.status.toLowerCase()}`}
                        >
                          {selectedFaculty.status}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>Phone:</label>
                        <span>{selectedFaculty.phone || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <label>Office:</label>
                        <span>{selectedFaculty.office || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <label>Role:</label>
                        <span>{selectedFaculty.role}</span>
                      </div>
                      <div className="profile-actions">
                        <button
                          className="admin-action-button edit"
                          onClick={() => setEditMode(true)}
                        >
                          Edit Profile
                        </button>
                        <button
                          className="admin-action-button cancel"
                          onClick={() => setSelectedFaculty(null)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="edit-form">
                      <div className="admin-form-group">
                        <label>Name:</label>
                        <input
                          name="name"
                          value={editedFaculty.name}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Email:</label>
                          <input
                            name="email"
                            value={editedFaculty.email}
                            readOnly
                            className="readonly-input"
                          />
                      </div>
                      <div className="admin-form-group">
                        <label>Department:</label>
                        <select
                          name="department"
                          value={editedFaculty.department}
                          onChange={handleEditChange}
                        >
                          <option value="Computer Science">Computer Science</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                          <option value="Physics">Physics</option>
                        </select>
                      </div>
                      <div className="admin-form-group">
                        <label>Status:</label>
                        <select
                          name="status"
                          value={editedFaculty.status}
                          onChange={handleEditChange}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="On Leave">On leave</option>
                        </select>
                      </div>
                      <div className="admin-form-group">
                        <label>Phone:</label>
                        <input
                          name="phone"
                          value={editedFaculty.phone}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Office:</label>
                        <input
                          name="office"
                          value={editedFaculty.office}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Role:</label>
                        <select
                          name="role"
                          value={editedFaculty.role}
                          onChange={handleEditChange}
                        >
                          <option value="Professor">Professor</option>
                          <option value="Associate Professor">Associate Professor</option>
                          <option value="Assistant Professor">Assistant Professor</option>
                          <option value="Lecturer">Lecturer</option>
                          <option value="Adjunct">Adjunct</option>
                        </select>
                      </div>
                      <div className="form-actions">
                        <button className="admin-action-button" onClick={saveProfileChanges}>
                          Save Changes
                        </button>
                        <button
                          className="admin-action-button cancel"
                          onClick={() => setEditMode(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
       case "student":
  return (
    <div className="student-content-box student-management-container">
      <div className="student-management-header">
        <h2>Student Management</h2>
        <div className="student-controls">
          <div className="student-action-group">
            <input
              type="file"
              id="import-file"
              accept=".xlsx, .xls"
              style={{ display: 'none' }}
              onChange={handleImportStudents}
            />
            <button
              className="student-action-button student-action-primary"
              onClick={() => document.getElementById('import-file').click()}
            >
              <FontAwesomeIcon icon={faFileImport} /> Import Excel
            </button>
            <button
              className="student-action-button"
              onClick={downloadSampleTemplate}
            >
              <FontAwesomeIcon icon={faDownload} /> Full Template
            </button>
            <button
              className="student-action-button"
              onClick={downloadMinimalTemplate}
            >
              <FontAwesomeIcon icon={faDownload} /> Minimal Template
            </button>
          </div>
          {importResults && (
  <div className="student-import-results-modal">
    <div className="student-modal-content">
      <h3>
        {importResults.success === true && '✅ Import Successful'}
        {importResults.success === false && '❌ Import Failed'}
        {importResults.success === null && '⏳ Import Progress'}
      </h3>
      
      <div className="student-import-summary">
        <p>{importResults.message || 'Processing...'}</p>
        <div className="student-import-stats">
          <div className="student-stat-item">
            <span className="student-stat-label">Total Records:</span>
            <span className="student-stat-value">{importResults.total || 0}</span>
          </div>
          <div className="student-stat-item">
            <span className="student-stat-label">Successfully Imported:</span>
            <span className="student-stat-value student-stat-success">{importResults?.imported || 0}</span>
          </div>
          <div className="student-stat-item">
            <span className="student-stat-label">Failed:</span>
            <span className="student-stat-value student-stat-error">
  {(importResults?.total || 0) - (importResults?.imported || 0)}
</span>
          </div>
        </div>

        {importResults.errors && importResults.errors.length > 0 && (
          <div className="student-import-errors">
            <h4>Errors ({importResults.errors.length}):</h4>
            <div className="student-scroll-container">
              <ul>
                {importResults.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <button 
        className="student-action-button"
        onClick={() => setImportResults(null)}
      >
        Close
      </button>
    </div>
  </div>
)}

          {/* Positioned refresh button on the right side */}
          <button
            className="student-action-button student-refresh-right"
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{ marginLeft: 'auto' }}
          >
            {isRefreshing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Refreshing...
              </>
            ) : (
              <>
                <i className="fas fa-sync-alt"></i>
                Refresh
              </>
            )}
          </button>
        
          <>
            <div className="student-search-filter-group">
              <input
                type="text"
                placeholder="Search students..."
                className="student-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="student-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Probation">Probation</option>
                <option value="Graduated">Graduated</option>
              </select>
              <select
                className="student-filter-select"
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
              >
                <option value="all">All Programs</option>
                <option value="Computer Science">Computer Science Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Business Administration">Business Administration</option>
              </select>
            </div>

            <div className="student-action-group">
              <div className="student-bulk-action-container">
                <div className="student-bulk-action-group">
                  <div className="student-bulk-select-wrapper">
                    <select
                      className="student-bulk-action-select"
                      value={bulkStatus}
                      onChange={(e) => {
                        const choice = e.target.value;
                        setBulkStatus(choice);
                        handleBulkStatusChange(choice);
                      }}
                      disabled={selectedStudentIds.length === 0}
                    >
                      <option value="" disabled>
                        Bulk Actions
                      </option>
                      <option value="Active">Mark Active</option>
                      <option value="Inactive">Mark Inactive</option>
                      <option value="Probation">Mark Probation</option>
                      <option value="Graduated">Mark Graduated</option>
                    </select>
                    <span className="student-custom-arrow"></span>
                  </div>
                  <button
                    className="student-bulk-delete-button"
                    onClick={handleBulkStudentDelete}
                    disabled={!selectedStudentIds.length}
                  >
                    <i className="fas fa-trash"></i>
                    Delete Selected
                    <span className="student-badge">{selectedStudentIds.length}</span>
                  </button>
                </div>
              </div>
              <button className="student-action-button student-export-btn" onClick={exportStudentsToExcel}>
                <i className="fas fa-file-excel"></i> Export Excel
              </button>
            </div>
          </>
        </div>
      </div>
        
      <>
        <div className="student-table-container">
          <table className="student-data-table">
            <thead>
              <tr>
                <th className="student-checkbox-cell">
                  <input
                    type="checkbox"
                    checked={isAllStudentsSelected}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsAllStudentsSelected(checked);
                      setSelectedStudentIds(
                        checked ? filteredStudents.map(s => s._id) : []
                      );
                    }}
                  />
                </th>
                <th>Name</th>
                <th onClick={() => handleSort('studentId')}>
                  Student ID {sortConfig.key === 'studentId' && (
                    <span className="student-sort-arrow">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th>Program</th>
                <th>Status</th>
                <th onClick={() => handleSort('cgpa')}>
                  CGPA {sortConfig.key === 'cgpa' && (
                    <span className="student-sort-arrow">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                
                <th onClick={() => handleSort('completedCredits')}>
                  Completed Credits {sortConfig.key === 'completedCredits' && (
                    <span className="student-sort-arrow">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th>Enrollment Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map(student => (
                <tr 
                  key={student._id}
                  className={`student-clickable-row student-status-${student.status.toLowerCase()}`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <td className="student-checkbox-cell" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(student._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        setSelectedStudentIds(prev =>
                          e.target.checked
                            ? [...prev, student._id]
                            : prev.filter(id => id !== student._id)
                        );
                      }}
                    />
                  </td>
                  <td>{student.name}</td>
                  <td className="student-id-cell">{student.studentId}</td>
                  <td>
                    <span className="student-program-badge">{student.program}</span>
                  </td>
                  <td>
                    <span className={`student-status-badge student-status-${student.status.toLowerCase()}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>{student.cgpa.toFixed(2)}</td>
                  <td>{student.completedCredits || 0}</td>
                  <td>{formatEnrollmentDate(student.enrolled)}</td>
                  
                  <td className="student-actions-cell">
                    <button 
                      className="student-icon-button student-edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStudent(student);
                        setEditedStudent({ ...student });
                        setEditStudentMode(true);
                        setShowAddStudentModal(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>
                    <button
                      className="student-icon-button student-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStudentToDelete(student._id);
                        setShowDeleteModal(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delete confirmation popup */}
        {showDeleteModal && (
          <div className="student-modal-overlay" onClick={() => {
            setShowDeleteModal(false);
            setStudentToDelete(null);
          }}>
            <div className="student-modal student-confirmation-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to delete this student? This action cannot be undone.</p>
              <div className="student-modal-actions">
                <button
                  className="student-action-button student-danger-btn"
                  onClick={() => handleDeleteStudent(studentToDelete)}
                >
                  Confirm Delete
                </button>
                <button
                  className="student-action-button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setStudentToDelete(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Add/Edit Student Modal */}
        {showAddStudentModal && (
          <div className="student-modal-overlay"onClick={() => {
    setShowAddStudentModal(false);
    setEditStudentMode(false);
    setEditedStudent({});
    setCompletedCreditsError('');
  }}>
            <div className="student-modal" onClick={(e) => e.stopPropagation()}>
              <h3>{editStudentMode ? 'Edit Student' : 'Add New Student'}</h3>
              <div className="student-form-grid">
                <div className="student-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editStudentMode ? editedStudent.name : newStudent.name}
                    onChange={(e) => editStudentMode 
                      ? setEditedStudent({...editedStudent, name: e.target.value})
                      : setNewStudent({...newStudent, name: e.target.value})}
                    required
                    className="student-form-input"
                  />
                </div>
                <div className="student-form-group">
                  <label>Student ID</label>
                  <input
                    type="text"
                    value={editStudentMode ? editedStudent.studentId : newStudent.studentId}
                    onChange={(e) => editStudentMode
                      ? setEditedStudent({ ...editedStudent, studentId: e.target.value })
                      : setNewStudent({ ...newStudent, studentId: e.target.value })}
                    required
                    className="student-form-input"
                  />
                </div>
                <div className="student-form-group">
                  <label>Completed Credits</label>
                  <input
                    type="number"
                    min="95"
                    max="140"
                    placeholder="Enter 95-140"
                    value={editStudentMode ? editedStudent.completedCredits : newStudent.completedCredits}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      let error = '';
                      if (editStudentMode) {
                        setEditedStudent({ ...editedStudent, completedCredits: inputValue });
                      } else {
                        setNewStudent({ ...newStudent, completedCredits: inputValue });
                      }
                      if (inputValue) {
                        const numericValue = Number(inputValue);
                        if (isNaN(numericValue)) {
                          error = 'Please enter a valid number';
                        } else if (numericValue < 95 || numericValue > 140) {
                          error = 'Completed credits must be between 95 and 140';
                        }
                      }
                      setCompletedCreditsError(error);
                    }}
                    required
                    className={`student-form-input ${completedCreditsError ? 'student-form-error' : ''}`}
                  />
                  {completedCreditsError && (
                    <div className="student-error-message">{completedCreditsError}</div>
                  )}
                </div>
                <div className="student-form-group">
                  <label>CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    value={editStudentMode ? editedStudent.cgpa : newStudent.cgpa}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (editStudentMode) {
                        setEditedStudent({ ...editedStudent, cgpa: value });
                      } else {
                        setNewStudent({ ...newStudent, cgpa: value });
                      }
                    }}
                    required
                    className="student-form-input"
                  />
                </div>
                <div className="student-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editStudentMode ? editedStudent.email : newStudent.email}
                    onChange={(e) => {
                      if (editStudentMode) {
                        setEditedStudent({...editedStudent, email: e.target.value});
                      } else {
                        setNewStudent({...newStudent, email: e.target.value});
                      }
                    }}
                    required
                    className="student-form-input"
                  />
                </div>
                <div className="student-form-group">
                  <label>Program</label>
                  <select
                    value={editStudentMode ? editedStudent.program : newStudent.program}
                    onChange={(e) => editStudentMode 
                      ? setEditedStudent({...editedStudent, program: e.target.value})
                      : setNewStudent({...newStudent, program: e.target.value})}
                    className="student-form-select"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Business Administration">Business Administration</option>
                  </select>
                </div>
                <div className="student-form-group">
                  <label>Status</label>
                  <select
                    value={editStudentMode ? editedStudent.status : newStudent.status}
                    onChange={(e) => editStudentMode 
                      ? setEditedStudent({...editedStudent, status: e.target.value})
                      : setNewStudent({...newStudent, status: e.target.value})}
                    className="student-form-select"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Probation">Probation</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
              </div>
              <div className="student-form-actions">
                <button
                  className="student-action-button"
                  onClick={handleSaveStudent}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Saving...
                    </>
                  ) : editStudentMode ? 'Save Changes' : 'Create Student'}
                </button>
                <button
                  className="student-action-button student-cancel-btn"
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setEditStudentMode(false);
                    setEditedStudent({});
                    setCompletedCreditsError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Profile Modal */}
        {selectedStudent && !showAddStudentModal && (
          <div className="student-modal-overlay" onClick={() => setSelectedStudent(null)}>
            <div className="student-modal student-profile-modal" onClick={(e) => e.stopPropagation()}>
              <h3>{selectedStudent.name}'s Profile</h3>
              <div className="student-profile-grid">
                <div className="student-detail-card">
                  <h4>Academic Information</h4>
                  <div className="student-detail-item">
                    <span className="student-label">Student ID:</span>
                    <span className="student-value">{selectedStudent.studentId}</span>
                  </div>
                  <div className="student-detail-item">
                    <span className="student-label">Program:</span>
                    <span className="student-value">{selectedStudent.program}</span>
                  </div>
                  <div className="student-detail-item">
                    <span className="student-label">Enrollment Date:</span>
                    <span className="student-value">{formatEnrollmentDate(selectedStudent.enrolled)}</span>
                  </div>
                  <div className="student-detail-item">
                    <span className="student-label">CGPA:</span>
                    <span className="student-value">{selectedStudent.cgpa.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="student-detail-card">
                  <h4>Contact Information</h4>
                  <div className="student-detail-item">
                    <span className="student-label">Email:</span>
                    <span className="student-value">{selectedStudent.email}</span>
                  </div>
                  <div className="student-detail-item">
                    <span className="student-label">Phone:</span>
                    <span className="student-value">{selectedStudent.phone || 'N/A'}</span>
                  </div>
                  <div className="student-detail-item">
                    <span className="student-label">Address:</span>
                    <span className="student-value">{selectedStudent.address || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="student-profile-actions">
                <button
                  className="student-action-button student-edit-profile-btn"
                  onClick={() => {
                    setEditedStudent(selectedStudent);
                    setShowAddStudentModal(true);
                    setEditStudentMode(true);
                  }}
                >
                  Edit Profile
                </button>
                <button
                  className="student-action-button student-cancel-btn"
                  onClick={() => setSelectedStudent(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );


case "teams":
  return (
    <div className="tm-container">
      <div className="tm-header">
        <div className="tm-header-content">
          <h1 className="tm-page-title">Team Management</h1>
          <p className="tm-page-subtitle">Monitor and manage project teams</p>
        </div>
        
        <div className="tm-header-controls">
          <div className="tm-search-container">
            <input
              type="text"
              placeholder="Search teams or members..."
              className="tm-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="tm-btn-refresh" onClick={fetchTeams}>
            <FontAwesomeIcon icon={faSyncAlt} />
            Refresh
          </button>
        </div>
      </div>

      {/* Enhanced Stats Overview with Special Case */}
      <div className="tm-stats-overview">
        <div className="tm-stat-grid">
          <div className="tm-stat-card">
            <div className="tm-stat-number">{teamStats.total}</div>
            <div className="tm-stat-label">Total Teams</div>
          </div>
          <div className="tm-stat-card tm-active">
            <div className="tm-stat-number">{teamStats.active}</div>
            <div className="tm-stat-label">Active</div>
          </div>
          <div className="tm-stat-card tm-recruiting">
            <div className="tm-stat-number">{teamStats.recruiting}</div>
            <div className="tm-stat-label">Recruiting</div>
          </div>
          <div className="tm-stat-card tm-special-case">
            <div className="tm-stat-number">
              {teamsList.filter(team => team.specialCase).length}
            </div>
            <div className="tm-stat-label">Special Cases</div>
          </div>
          <div className="tm-stat-card tm-inactive">
            <div className="tm-stat-number">{teamStats.inactive}</div>
            <div className="tm-stat-label">Inactive</div>
          </div>
        </div>
      </div>

      <div className="tm-teams-grid">
        {teamsList
          .filter(team => 
            team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.members.some(member => 
              member.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          )
          .map(team => (
            <div key={team._id} className={`tm-team-card ${team.specialCase ? 'tm-special-case-card' : ''}`}>
              <div className="tm-card-header">
                <div className="tm-team-title">
                  <h3>
                    {team.name}
                    {team.specialCase && (
                      <span className="tm-special-case-badge" title={team.specialCaseReason}>
                        <FontAwesomeIcon icon={faExclamationTriangle} /> Special Case
                      </span>
                    )}
                  </h3>
                  <span className={`tm-status-indicator tm-${team.status.toLowerCase()}`}>
                    {team.status}
                  </span>
                </div>
                <div className="tm-card-actions">
                  <button
                    className="tm-btn-icon tm-btn-view"
                    onClick={() => {
                      setSelectedTeam(team);
                      setShowTeamModal(true);
                    }}
                    title="View Details"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  
                  {/* Special Case Management Button */}
                  {team.specialCase ? (
                    <button
                      className="tm-btn-icon tm-btn-unlock"
                      onClick={() => handleUnlockSpecialCase(team._id)}
                      title="Remove Special Case Status"
                    >
                      <FontAwesomeIcon icon={faUnlock} />
                    </button>
                  ) : (
                    <button
                      className="tm-btn-icon tm-btn-lock"
                      onClick={() => {
                        setSelectedTeamForSpecialCase(team);
                        setShowSpecialCaseModal(true);
                      }}
                      title="Mark as Special Case"
                    >
                      <FontAwesomeIcon icon={faLock} />
                    </button>
                  )}
                  
                  <button
                    className="tm-btn-icon tm-btn-delete"
                    onClick={() => handleDeleteTeam(team._id)}
                    title="Delete Team"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
              </div>
              
              <div className="tm-card-content">
                {/* Special Case Information */}
                {team.specialCase && (
                  <div className="tm-special-case-info">
                    <div className="tm-special-case-header">
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      <span>Special Case Team</span>
                    </div>
                    {team.specialCaseReason && (
                      <div className="tm-special-case-reason">
                        <strong>Reason:</strong> {team.specialCaseReason}
                      </div>
                    )}
                  </div>
                )}

                {/* Supervisor section with special case handling */}
                <div className="tm-supervisor-info">
                  <div className="tm-supervisor-header">
                    <span className="tm-info-label">Supervisor:</span>
                    <div className="tm-supervisor-actions">
                      {team.currentSupervisor && team.currentSupervisor.facultyId ? (
                        <>
                          <span className="tm-supervisor-name">
                            👨‍🏫 {team.currentSupervisor.facultyName}
                          </span>
                          <button
                            className="tm-btn-icon tm-btn-remove-supervisor"
                            onClick={() => handleRemoveSupervisor(team)}
                            title="Remove Supervisor"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="tm-no-supervisor">No supervisor assigned</span>
                          <button
                            className="tm-btn-icon tm-btn-add-supervisor"
                            onClick={() => {
                              setSelectedTeamForSupervisor(team);
                              setShowAssignSupervisorModal(true);
                              setSupervisorSearchQuery('');
                              fetchAvailableFaculty();
                            }}
                            title="Assign Supervisor"
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rest of your existing team card content */}
                <div className="tm-project-info">
                  <div className="tm-info-item">
                    <span className="tm-info-label">Project:</span>
                    <span className="tm-info-value">{team.projectIdea || 'Not specified'}</span>
                  </div>
                  <div className="tm-info-item">
                    <span className="tm-info-label">Department:</span>
                    <span className="tm-info-value">{team.major || 'Not specified'}</span>
                  </div>
                  <div className="tm-info-item">
                    <span className="tm-info-label">Phase:</span>
                    <span className="tm-phase-badge">{team.currentPhase || 'A'}</span>
                  </div>
                </div>

                {/* Members section with special case indicator */}
                <div className="tm-members-preview">
                  <div className="tm-members-header">
                    <span className="tm-members-count">
                      {team.memberCount}/{team.maxMembers} Members
                      {team.memberCount > 4 && (
                        <span className="tm-over-capacity"> (Over Capacity)</span>
                      )}
                      {team.specialCase && team.memberCount < 4 && (
                        <span className="tm-special-case-indicator"> (Special Case)</span>
                      )}
                    </span>
                    <div className="tm-admin-controls">
                      <button
                        className="tm-btn-icon tm-btn-add"
                        onClick={() => {
                          setSelectedTeamForMember(team);
                          setShowAddMemberModal(true);
                          setMemberSearchQuery('');
                          fetchAllStudents();
                        }}
                        title="Add Member"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="tm-members-list">
                    {team.members.map((member, index) => (
                      <div key={index} className="tm-member-chip">
                        <div className="tm-member-avatar">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="tm-member-name">{member.name}</span>
                        <span className="tm-member-role">{member.role}</span>
                        <span className="tm-eligibility-badge">
                          ✓ Eligible
                        </span>
                        <button
                          className="tm-btn-remove-member"
                          onClick={() => handleRemoveMemberFromTeam(team._id, member.studentId, member.name)}
                          title="Remove Member"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="tm-card-footer">
                <span className="tm-creation-date">
                  Created {new Date(team.createdDate).toLocaleDateString()}
                </span>
                <button 
                  className="tm-btn-manage"
                  onClick={() => {
                    setSelectedTeam(team);
                    setShowTeamModal(true);
                  }}
                >
                  Manage
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Special Case Management Modal */}
      {showSpecialCaseModal && selectedTeamForSpecialCase && (
        <div className="tm-modal-overlay" onClick={() => {
          setShowSpecialCaseModal(false);
          setSelectedTeamForSpecialCase(null);
          setSpecialCaseReason('');
        }}>
          <div className="tm-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="tm-modal-header">
              <h2>Mark Team as Special Case</h2>
              <button
                className="tm-btn-close"
                onClick={() => {
                  setShowSpecialCaseModal(false);
                  setSelectedTeamForSpecialCase(null);
                  setSpecialCaseReason('');
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="tm-modal-body">
              <div className="tm-form-group">
                <label>Team: <strong>{selectedTeamForSpecialCase.name}</strong></label>
                <p>Current Members: {selectedTeamForSpecialCase.memberCount}/4</p>
              </div>
              
              <div className="tm-form-group">
                <label>Reason for Special Case:</label>
                <textarea
                  value={specialCaseReason}
                  onChange={(e) => setSpecialCaseReason(e.target.value)}
                  placeholder="Explain why this team should be marked as a special case..."
                  rows="4"
                  className="tm-form-textarea"
                  required
                />
              </div>
              
              <div className="tm-warning-box">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <p>Marking a team as special case will:</p>
                <ul>
                  <li>Lock the team from automatic member changes</li>
                  <li>Hide the team from public join requests</li>
                  <li>Require admin intervention for member management</li>
                </ul>
              </div>
            </div>
            
            <div className="tm-modal-footer">
              <button
                className="tm-btn-secondary"
                onClick={() => {
                  setShowSpecialCaseModal(false);
                  setSelectedTeamForSpecialCase(null);
                  setSpecialCaseReason('');
                }}
              >
                Cancel
              </button>
              <button
                className="tm-btn-danger"
                onClick={handleMarkAsSpecialCase}
                disabled={!specialCaseReason.trim() || isUpdatingSpecialCase}
              >
                {isUpdatingSpecialCase ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Updating...
                  </>
                ) : (
                  'Mark as Special Case'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

{/* Assign Supervisor Modal */}
{showAssignSupervisorModal && (
  <div className="tm-modal-overlay" onClick={() => {
    setShowAssignSupervisorModal(false);
    setSelectedSupervisorId('');
    setSelectedTeamForSupervisor(null);
    setSupervisorSearchQuery('');
  }}>
    <div className="tm-modal-container" onClick={(e) => e.stopPropagation()}>
      <div className="tm-modal-header">
        <h2>Assign Supervisor to {selectedTeamForSupervisor?.name}</h2>
        <button
          className="tm-btn-close"
          onClick={() => {
            setShowAssignSupervisorModal(false);
            setSelectedSupervisorId('');
            setSelectedTeamForSupervisor(null);
            setSupervisorSearchQuery('');
          }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      
      <div className="tm-modal-body">
        <div className="tm-form-group">
          <label>Search Faculty:</label>
          <input
            type="text"
            placeholder="Search by name or department..."
            value={supervisorSearchQuery}
            onChange={(e) => setSupervisorSearchQuery(e.target.value)}
            className="tm-form-input"
          />
          <small>Type faculty name or department to filter results</small>
        </div>

        <div className="tm-form-group">
          <label>Select Faculty Member:</label>
          <select
            value={selectedSupervisorId}
            onChange={(e) => setSelectedSupervisorId(e.target.value)}
            className="tm-form-select"
          >
            <option value="">Choose a faculty member...</option>
            {availableFaculty
              .filter(faculty => {
                const searchTerm = supervisorSearchQuery.toLowerCase();
                const nameMatch = faculty.name.toLowerCase().includes(searchTerm);
                const deptMatch = faculty.department.toLowerCase().includes(searchTerm);
                return nameMatch || deptMatch || supervisorSearchQuery === '';
              })
              .map(faculty => (
                <option key={faculty._id} value={faculty._id}>
                  {faculty.name} - {faculty.department}
                  {faculty.status !== 'Active' && ' [INACTIVE]'}
                </option>
              ))}
          </select>
          
          {supervisorSearchQuery && (
            <small>
              {availableFaculty.filter(faculty => {
                const searchTerm = supervisorSearchQuery.toLowerCase();
                const nameMatch = faculty.name.toLowerCase().includes(searchTerm);
                const deptMatch = faculty.department.toLowerCase().includes(searchTerm);
                return nameMatch || deptMatch;
              }).length} faculty member(s) found
            </small>
          )}
        </div>
        
        {selectedSupervisorId && (
          <div className="tm-faculty-info">
            {(() => {
              const faculty = availableFaculty.find(f => f._id === selectedSupervisorId);
              return faculty ? (
                <div className="tm-faculty-details">
                  <p><strong>Name:</strong> {faculty.name}</p>
                  <p><strong>Department:</strong> {faculty.department}</p>
                  <p><strong>Role:</strong> {faculty.role}</p>
                  <p><strong>Email:</strong> {faculty.email}</p>
                  {faculty.status !== 'Active' && (
                    <div className="tm-warning-box">
                      <strong>⚠️ Warning:</strong><br/>
                      This faculty member is not active. Please activate them first.
                    </div>
                  )}
                </div>
              ) : null;
            })()}
          </div>
        )}

        {supervisorSearchQuery && availableFaculty.filter(faculty => {
          const searchTerm = supervisorSearchQuery.toLowerCase();
          const nameMatch = faculty.name.toLowerCase().includes(searchTerm);
          const deptMatch = faculty.department.toLowerCase().includes(searchTerm);
          return nameMatch || deptMatch;
        }).length === 0 && (
          <div className="tm-no-faculty-notice">
            <p>🔍 No faculty found matching "{supervisorSearchQuery}"</p>
            <small>Try a different search term or clear the search</small>
          </div>
        )}

        {availableFaculty.length === 0 && (
          <div className="tm-no-faculty-notice">
            <p>📋 No active faculty available</p>
          </div>
        )}
      </div>
      
      <div className="tm-modal-footer">
        <button
          className="tm-btn-secondary"
          onClick={() => {
            setShowAssignSupervisorModal(false);
            setSelectedSupervisorId('');
            setSelectedTeamForSupervisor(null);
            setSupervisorSearchQuery('');
          }}
        >
          Cancel
        </button>
        <button
          className="tm-btn-manage"
          onClick={handleAssignSupervisor}
          disabled={!selectedSupervisorId || isAssigningSupervisor}
        >
          {isAssigningSupervisor ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              Assigning...
            </>
          ) : (
            'Assign Supervisor'
          )}
        </button>
      </div>
    </div>
  </div>
)}

      {/* Team Details Modal */}
     {/* Team Details Modal - Enhanced with Phase History */}
{showTeamModal && selectedTeam && (
  <div className="tm-modal-overlay" onClick={() => {
    setShowTeamModal(false);
    setSelectedTeam(null);
  }}>
    <div className="tm-modal-container tm-large-modal" onClick={(e) => e.stopPropagation()}>
      <div className="tm-modal-header">
        <div className="tm-modal-title">
          <h2>{selectedTeam.name}</h2>
          <span className={`tm-status-indicator tm-${selectedTeam.status.toLowerCase()}`}>
            {selectedTeam.status}
          </span>
        </div>
        <button
          className="tm-btn-close"
          onClick={() => {
            setShowTeamModal(false);
            setSelectedTeam(null);
          }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      
      <div className="tm-modal-body">
        <div className="tm-details-grid">
          {/* Existing Team Information Section */}
          <div className="tm-detail-section">
            <h3>Team Information</h3>
            <div className="tm-detail-list">
              <div className="tm-detail-row">
                <span className="tm-detail-label">Project Idea:</span>
                <span className="tm-detail-value">{selectedTeam.projectIdea || 'Not specified'}</span>
              </div>
              <div className="tm-detail-row">
                <span className="tm-detail-label">Department:</span>
                <span className="tm-detail-value">{selectedTeam.major || 'Not specified'}</span>
              </div>
              <div className="tm-detail-row">
                <span className="tm-detail-label">Current Phase:</span>
                <span className="tm-phase-badge">{selectedTeam.currentPhase || 'A'}</span>
              </div>
              <div className="tm-detail-row">
                <span className="tm-detail-label">Created Date:</span>
                <span className="tm-detail-value">{new Date(selectedTeam.createdDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* NEW: Phase History Section */}
          <div className="tm-detail-section tm-phase-history-section">
            <h3>
              <FontAwesomeIcon icon={faClock} className="section-icon" />
              Phase History & Timeline
            </h3>
            {selectedTeam.phaseHistory && selectedTeam.phaseHistory.length > 0 ? (
              <div className="tm-phase-timeline">
                {selectedTeam.phaseHistory.map((phase, index) => (
                  <div key={index} className={`tm-phase-item tm-phase-${phase.phase.toLowerCase()}`}>
                    <div className="tm-phase-header">
                      <div className="tm-phase-badge-large">
                        Phase {phase.phase}
                      </div>
                      <div className="tm-phase-status">
                        {phase.endDate ? (
                          <span className="tm-phase-completed">✅ Completed</span>
                        ) : (
                          <span className="tm-phase-ongoing">🔄 Current Phase</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="tm-phase-details">
                      <div className="tm-phase-dates">
                        <div className="tm-date-item">
                          <span className="tm-date-label">Start Date:</span>
                          <span className="tm-date-value">
                            {new Date(phase.startDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className="tm-date-item">
                          <span className="tm-date-label">End Date:</span>
                          <span className="tm-date-value">
                            {phase.endDate ? (
                              new Date(phase.endDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            ) : (
                              <span className="tm-ongoing">Ongoing</span>
                            )}
                          </span>
                        </div>
                        
                        <div className="tm-date-item">
                          <span className="tm-date-label">Duration:</span>
                          <span className="tm-date-value">
                            {phase.duration ? (
                              `${phase.duration} days`
                            ) : phase.endDate ? (
                              `${Math.floor((new Date(phase.endDate) - new Date(phase.startDate)) / (1000 * 60 * 60 * 24))} days`
                            ) : (
                              `${Math.floor((new Date() - new Date(phase.startDate)) / (1000 * 60 * 60 * 24))} days (ongoing)`
                            )}
                          </span>
                        </div>
                      </div>
                      
                      {phase.updatedBy && phase.updatedBy.facultyName && (
                        <div className="tm-phase-supervisor">
                          <span className="tm-supervisor-label">Updated by:</span>
                          <span className="tm-supervisor-name">
                            👨‍🏫 {phase.updatedBy.facultyName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Current Phase Duration Display */}
                <div className="tm-current-phase-summary">
                  <h4>Current Phase Summary</h4>
                  <div className="tm-current-stats">
                    <div className="tm-stat-item">
                      <span className="tm-stat-label">Current Phase:</span>
                      <span className="tm-stat-value">Phase {selectedTeam.currentPhase || 'A'}</span>
                    </div>
                    <div className="tm-stat-item">
                      <span className="tm-stat-label">Days in Current Phase:</span>
                      <span className="tm-stat-value">
                        {selectedTeam.currentPhaseStartDate ? (
                          Math.floor((new Date() - new Date(selectedTeam.currentPhaseStartDate)) / (1000 * 60 * 60 * 24))
                        ) : (
                          Math.floor((new Date() - new Date(selectedTeam.createdDate || Date.now())) / (1000 * 60 * 60 * 24))
                        )} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="tm-no-phase-history">
                <p>No phase history available. Team is in initial Phase A.</p>
                <div className="tm-default-phase-info">
                  <div className="tm-phase-item tm-phase-a">
                    <div className="tm-phase-header">
                      <div className="tm-phase-badge-large">Phase A</div>
                      <span className="tm-phase-ongoing">🔄 Current Phase</span>
                    </div>
                    <div className="tm-phase-details">
                      <div className="tm-phase-dates">
                        <div className="tm-date-item">
                          <span className="tm-date-label">Start Date:</span>
                          <span className="tm-date-value">
                            {new Date(selectedTeam.createdDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="tm-date-item">
                          <span className="tm-date-label">Duration:</span>
                          <span className="tm-date-value">
                            {Math.floor((new Date() - new Date(selectedTeam.createdDate)) / (1000 * 60 * 60 * 24))} days (ongoing)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Existing Members Section */}
          <div className="tm-members-section">
            <h3>Team Members</h3>
            <div className="tm-members-detailed-list">
              {selectedTeam.members.map((member, index) => (
                <div key={index} className="tm-member-card-detailed">
                  <div className="tm-member-avatar-large">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="tm-member-info-detailed">
                    <div className="tm-member-name-detailed">{member.name}</div>
                    <div className="tm-member-id">{member.studentId}</div>
                    <div className="tm-member-email">{member.email}</div>
                    <div className={`tm-member-role-badge tm-${member.role.toLowerCase()}`}>
                      {member.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Existing Join Requests Section */}
          {selectedTeam.joinRequests && selectedTeam.joinRequests.length > 0 && (
            <div className="tm-requests-section">
              <h3>Join Requests</h3>
              <div className="tm-requests-list">
                {selectedTeam.joinRequests
                  .filter(req => req.status === 'pending')
                  .map((request, index) => (
                    <div key={index} className="tm-request-card">
                      <div className="tm-request-info">
                        <div className="tm-request-name">{request.studentName}</div>
                        <div className="tm-request-details">
                          <span>ID: {request.studentIdNumber}</span>
                          <span>Credits: {request.completedCredits}</span>
                        </div>
                      </div>
                      <div className="tm-request-date">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}


      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="tm-modal-overlay" onClick={() => {
          setShowAddMemberModal(false);
          setSelectedStudentToAdd('');
          setShowAllStudents(false);
          setMemberSearchQuery('');
        }}>
          <div className="tm-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="tm-modal-header">
              <h2>Add Member to {selectedTeamForMember?.name}</h2>
              <button
                className="tm-btn-close"
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSelectedStudentToAdd('');
                  setShowAllStudents(false);
                  setMemberSearchQuery('');
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="tm-modal-body">
              <div className="tm-eligibility-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={showAllStudents}
                    onChange={(e) => {
                      setShowAllStudents(e.target.checked);
                      if (e.target.checked) {
                        fetchAllStudentsForAdmin();
                      } else {
                        fetchAllStudents();
                      }
                      setMemberSearchQuery('');
                    }}
                  />
                  <span>Show All Students (Including Ineligible)</span>
                </label>
                <small>
                  {showAllStudents 
                    ? '⚠️ Showing all students. Ineligible students will get special access if added.'
                    : `📚 Showing only students with ≥${currentRequirement || 95} completed credits`
                  }
                </small>
              </div>

              <div className="tm-form-group">
                <label>Search Students:</label>
                <input
                  type="text"
                  placeholder="Search by name or student ID..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="tm-form-input"
                />
                <small>Type student name or ID to filter results</small>
              </div>

              <div className="tm-form-group">
                <label>Select Student:</label>
                <select
                  value={selectedStudentToAdd}
                  onChange={(e) => setSelectedStudentToAdd(e.target.value)}
                  className="tm-form-select"
                >
                  <option value="">Choose a student...</option>
                  {allStudents
                    .filter(student => {
                      const searchTerm = memberSearchQuery.toLowerCase();
                      const nameMatch = student.name.toLowerCase().includes(searchTerm);
                      const idMatch = student.studentId.toLowerCase().includes(searchTerm);
                      return nameMatch || idMatch || memberSearchQuery === '';
                    })
                    .map(student => (
                      <option key={student._id} value={student._id}>
                        {student.name} ({student.studentId}) - {student.completedCredits} credits
                        {!student.isEligible && ' [INELIGIBLE]'}
                        {student.currentTeam && ` - Currently in: ${student.currentTeam.name}`}
                      </option>
                    ))}
                </select>
                
                {memberSearchQuery && (
                  <small>
                    {allStudents.filter(student => {
                      const searchTerm = memberSearchQuery.toLowerCase();
                      const nameMatch = student.name.toLowerCase().includes(searchTerm);
                      const idMatch = student.studentId.toLowerCase().includes(searchTerm);
                      return nameMatch || idMatch;
                    }).length} student(s) found
                  </small>
                )}
              </div>
              
              {selectedStudentToAdd && (
                <div className="tm-student-info">
                  {(() => {
                    const student = allStudents.find(s => s._id === selectedStudentToAdd);
                    return student ? (
                      <div className={`tm-student-details ${student.isEligible ? 'tm-eligible' : 'tm-ineligible'}`}>
                        <p><strong>Program:</strong> {student.program}</p>
                        <p><strong>Credits:</strong> {student.completedCredits} 
                          {student.isEligible 
                            ? ' ✅ Eligible' 
                            : ` ❌ Ineligible (needs ${student.creditsNeeded || 0} more)`
                          }
                        </p>
                        <p><strong>CGPA:</strong> {student.cgpa?.toFixed(2)}</p>
                        {!student.isEligible && (
                          <div className="tm-warning-box">
                            <strong>⚠️ Special Access Required:</strong><br/>
                            This student will be granted special login access to join the capstone project despite not meeting the credit requirement.
                          </div>
                        )}
                        {student.currentTeam && (
                          <p className="tm-warning">
                            <strong>⚠️ Note:</strong> This student will be moved from "{student.currentTeam.name}"
                          </p>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {memberSearchQuery && allStudents.filter(student => {
                const searchTerm = memberSearchQuery.toLowerCase();
                const nameMatch = student.name.toLowerCase().includes(searchTerm);
                const idMatch = student.studentId.toLowerCase().includes(searchTerm);
                return nameMatch || idMatch;
              }).length === 0 && (
                <div className="tm-no-students-notice">
                  <p>🔍 No students found matching "{memberSearchQuery}"</p>
                  <small>Try a different search term or clear the search</small>
                </div>
              )}

              {allStudents.length === 0 && (
                <div className="tm-no-students-notice">
                  <p>📋 No students available</p>
                </div>
              )}
            </div>
            
            <div className="tm-modal-footer">
              <button
                className="tm-btn-secondary"
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSelectedStudentToAdd('');
                  setShowAllStudents(false);
                  setMemberSearchQuery('');
                }}
              >
                Cancel
              </button>
              <button
                className="tm-btn-manage"
                onClick={handleAddMemberToTeam}
                disabled={!selectedStudentToAdd}
              >
                {(() => {
                  const student = allStudents.find(s => s._id === selectedStudentToAdd);
                  return student && !student.isEligible ? 'Force Add (Grant Access)' : 'Add Member';
                })()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
case "evaluations":
  return (
    <div className="eval-admin-content-box">
      <div className="eval-admin-management-header">
        <h2>Board Evaluation Reviews</h2>
        <div className="eval-admin-controls">
          <button 
            className="eval-admin-action-button eval-admin-primary"
            onClick={fetchPendingEvaluations}
          >
            <FontAwesomeIcon icon={faSync} /> Refresh
          </button>
        </div>
      </div>

      <div className="eval-admin-evaluations-overview">
        <div className="eval-admin-stats-grid">
          <div className="eval-admin-stat-card">
            <div className="eval-admin-stat-number">{pendingEvaluations.length}</div>
            <div className="eval-admin-stat-label">Pending Reviews</div>
          </div>
        </div>
      </div>

      <div className="eval-admin-evaluations-list">
        {pendingEvaluations.length === 0 ? (
          <div className="eval-admin-no-evaluations">
            <FontAwesomeIcon icon={faClipboardList} className="eval-admin-empty-icon" />
            <h3>No evaluations pending review</h3>
            <p>All board evaluations have been reviewed and finalized.</p>
          </div>
        ) : (
          <div className="eval-admin-evaluations-grid">
            {pendingEvaluations.map((evaluation) => (
              <div key={evaluation._id} className="eval-admin-evaluation-card">
                <div className="eval-admin-evaluation-header">
                  <h4>{evaluation.teamDetails.name}</h4>
                  <span className="eval-admin-phase-badge">Phase {evaluation.phase}</span>
                  <span className={`eval-admin-status-badge eval-admin-${evaluation.status}`}>
                    {evaluation.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="eval-admin-evaluation-info">
                  <div className="eval-admin-info-item">
                    <strong>Board:</strong> {evaluation.boardId.name}
                  </div>
                  <div className="eval-admin-info-item">
                    <strong>Team Members:</strong> {evaluation.teamDetails.members.length}
                  </div>
                  <div className="eval-admin-info-item">
                    <strong>Faculty Evaluations:</strong> {evaluation.submittedEvaluations}/{evaluation.totalEvaluators}
                  </div>
                  <div className="eval-admin-info-item">
                    <strong>Completed:</strong> {formatDate(evaluation.completedAt)}
                  </div>
                  
                  {evaluation.facultyResults && (
                    <div className="eval-admin-faculty-results-preview">
                      <strong>Faculty Calculated Average:</strong>
                      <span className="eval-admin-result-badge">
                        {evaluation.facultyResults.teamAverage?.toFixed(1)}% 
                        ({evaluation.facultyResults.teamGrade})
                      </span>
                    </div>
                  )}
                </div>

                <div className="eval-admin-evaluation-actions">
                  <button
                    className="eval-admin-review-btn"
                    onClick={() => handleReviewEvaluation(evaluation._id)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                    Review & Grade
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

{/* Assign Teams to Board Modal */}
{showAssignTeamsModal && selectedBoard && (
  <div className="eval-admin-modal-backdrop" onClick={() => setShowAssignTeamsModal(false)}>
    <div className="eval-admin-modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
      <div className="eval-admin-modal-header-area">
        <h2>Assign Teams to {selectedBoard.name}</h2>
        <button
          className="eval-admin-modal-close-btn"
          onClick={() => setShowAssignTeamsModal(false)}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      
      <div className="eval-admin-modal-body-content">
        <div className="eval-admin-form-input-group">
          <label>Evaluation Phase:</label>
          <select className="eval-admin-form-text-input">
            <option value="A">Phase A</option>
            <option value="B">Phase B</option>
            <option value="C">Phase C</option>
          </select>
        </div>
        
        <div className="eval-admin-form-input-group">
          <label>Available Teams:</label>
          <div className="eval-admin-teams-list">
            {availableTeams.map(team => (
              <div key={team._id} className="eval-admin-team-option">
                <input
                  type="checkbox"
                  id={`team-${team._id}`}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTeamsForBoard([...selectedTeamsForBoard, team._id]);
                    } else {
                      setSelectedTeamsForBoard(selectedTeamsForBoard.filter(id => id !== team._id));
                    }
                  }}
                />
                <label htmlFor={`team-${team._id}`}>
                  {team.name} ({team.members.length} members) - Phase {team.currentPhase}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="eval-admin-modal-footer-actions">
        <button
          className="eval-admin-modal-secondary-btn"
          onClick={() => setShowAssignTeamsModal(false)}
        >
          Cancel
        </button>
        <button
          className="eval-admin-modal-primary-btn"
          onClick={() => handleAssignTeamsToBoard(selectedBoard._id, selectedTeamsForBoard, 'A')}
        >
          Assign Teams
        </button>
      </div>
    </div>
  </div>
)}

      {/* Evaluation Review Modal */}
      {showEvaluationReviewModal && selectedEvaluation && (
        <div className="eval-admin-review-modal-overlay" onClick={() => setShowEvaluationReviewModal(false)}>
          <div className="eval-admin-review-modal eval-admin-evaluation-review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="eval-admin-modal-header">
              <h3>Review Evaluation - {selectedEvaluation.teamDetails?.name} (Phase {selectedEvaluation.phase})</h3>
              <button 
                className="eval-admin-close-button"
                onClick={() => setShowEvaluationReviewModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="eval-admin-modal-content">
              {/* Faculty Evaluations Summary */}
              <div className="eval-admin-faculty-evaluations-summary">
                <h4>Faculty Evaluations Summary</h4>
                <div className="eval-admin-evaluations-grid-summary">
                  {selectedEvaluation.evaluations.map((evaluation, index) => (
                    <div key={index} className="eval-admin-faculty-evaluation-item">
                      <div className="eval-admin-faculty-info">
                        <strong>{evaluation.facultyName}</strong>
                        {evaluation.isSupervisor && <span className="eval-admin-supervisor-badge">Supervisor</span>}
                      </div>
                      <div className="eval-admin-evaluation-details">
                        <span>Type: {evaluation.evaluationType}</span>
                        {evaluation.evaluationType === 'team' && (
                          <span>Team Mark: {evaluation.teamMark}%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Grades Review */}
              <div className="eval-admin-individual-grades-section">
                <h4>Individual Grades (Admin Review)</h4>
                <div className="eval-admin-grades-table">
                  <div className="eval-admin-table-header">
                    <span>Student</span>
                    <span>Faculty Result</span>
                    <span>Admin Grade</span>
                    <span>Reason for Change</span>
                  </div>
                  {modifiedGrades.map((grade, index) => (
                    <div key={grade.studentId} className="eval-admin-table-row">
                      <div className="eval-admin-student-info">
                        <strong>{grade.studentName}</strong>
                        <small>{grade.studentId}</small>
                      </div>
                      <div className="eval-admin-original-grade">
                        {grade.originalMark}%
                      </div>
                      <div className="eval-admin-modified-grade">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={grade.modifiedMark}
                          onChange={(e) => {
                            const newGrades = [...modifiedGrades];
                            newGrades[index].modifiedMark = parseFloat(e.target.value);
                            setModifiedGrades(newGrades);
                          }}
                          className="eval-admin-grade-input"
                        />
                      </div>
                      <div className="eval-admin-modification-reason">
                        <input
                          type="text"
                          placeholder="Reason for change (if any)"
                          value={grade.modificationReason}
                          onChange={(e) => {
                            const newGrades = [...modifiedGrades];
                            newGrades[index].modificationReason = e.target.value;
                            setModifiedGrades(newGrades);
                          }}
                          className="eval-admin-reason-input"
                          disabled={grade.modifiedMark === grade.originalMark}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Comments */}
              <div className="eval-admin-comments-section">
                <h4>Admin Comments</h4>
                <textarea
                  value={adminComments}
                  onChange={(e) => setAdminComments(e.target.value)}
                  placeholder="Add any comments about this evaluation..."
                  rows="3"
                  className="eval-admin-comments-textarea"
                />
              </div>
            </div>

            <div className="eval-admin-modal-actions">
              <button
                className="eval-admin-action-button eval-admin-secondary"
                onClick={() => handleSubmitReview('save_draft')}
                disabled={isFinalizingEvaluation}
              >
                {isFinalizingEvaluation ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Saving...
                  </>
                ) : (
                  'Save Draft'
                )}
              </button>
              <button
                className="eval-admin-action-button eval-admin-primary"
                onClick={() => handleSubmitReview('finalize')}
                disabled={isFinalizingEvaluation}
              >
                {isFinalizingEvaluation ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Finalizing...
                  </>
                ) : (
                  'Finalize & Send Grades'
                )}
              </button>
              <button
                className="eval-admin-action-button eval-admin-cancel"
                onClick={() => setShowEvaluationReviewModal(false)}
                disabled={isFinalizingEvaluation}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );


  case "boards":
  return (
    <div className="evaluation-boards-main-container">
      <div className="evaluation-boards-top-header">
        <div className="evaluation-boards-header-content-wrapper">
          <h1 className="evaluation-boards-main-title">Board Management</h1>
          <p className="evaluation-boards-subtitle-text">Manage evaluation boards and faculty assignments</p>
        </div>
        
        <div className="evaluation-boards-header-controls-panel">
          <div className="evaluation-boards-search-input-wrapper">
            <input
              type="text"
              placeholder="Search boards..."
              className="evaluation-boards-search-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="evaluation-boards-create-new-btn"
            onClick={() => {
              setNewBoard({ name: '', description: '', faculty: [] });
              setShowCreateBoardModal(true);
              fetchAvailableFacultyForBoard();
            }}
          >
            <FontAwesomeIcon icon={faPlus} />
            Create Board
          </button>
          <button className="evaluation-boards-refresh-data-btn" onClick={fetchBoards}>
            <FontAwesomeIcon icon={faSyncAlt} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="evaluation-boards-statistics-overview">
        <div className="evaluation-boards-stats-grid-layout">
          <div className="evaluation-boards-stat-card-item">
            <div className="evaluation-boards-stat-number-display">{boardStats.total}</div>
            <div className="evaluation-boards-stat-label-text">Total Boards</div>
            <div className="evaluation-boards-stat-icon-wrapper">
              <FontAwesomeIcon icon={faBars} />
            </div>
          </div>
          <div className="evaluation-boards-stat-card-item evaluation-boards-faculty-stat">
            <div className="evaluation-boards-stat-number-display">{boardStats.totalFaculty}</div>
            <div className="evaluation-boards-stat-label-text">Assigned Faculty</div>
            <div className="evaluation-boards-stat-icon-wrapper">
              <FontAwesomeIcon icon={faChalkboardTeacher} />
            </div>
          </div>
          <div className="evaluation-boards-stat-card-item evaluation-boards-teams-stat">
            <div className="evaluation-boards-stat-number-display">{boardStats.totalTeams}</div>
            <div className="evaluation-boards-stat-label-text">Total Teams</div>
            <div className="evaluation-boards-stat-icon-wrapper">
              <FontAwesomeIcon icon={faUserFriends} />
            </div>
          </div>
        </div>
      </div>

      {/* Boards Grid */}
      <div className="evaluation-boards-cards-grid-container">
        {boardsList
          .filter(board => 
            board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            board.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(board => (
            <div key={board._id} className="evaluation-boards-individual-card">
              <div className="evaluation-boards-card-header-section">
                <div className="evaluation-boards-card-title-wrapper">
                  <h3>{board.name}</h3>
                  <span className="evaluation-boards-member-count-badge">
                    {board.faculty.length} Faculty
                  </span>
                </div>
                <div className="evaluation-boards-card-actions-group">
                  <button
                    className="evaluation-boards-action-btn evaluation-boards-view-btn"
                    onClick={() => {
                      setSelectedBoard(board);
                      setShowBoardDetailModal(true);
                    }}
                    title="View Details"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    className="evaluation-boards-action-btn evaluation-boards-edit-btn"
                    onClick={() => {
                      setSelectedBoard({...board});
                      setShowEditBoardModal(true);
                      fetchAvailableFacultyForBoard(board._id);
                    }}
                    title="Edit Board"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="evaluation-boards-action-btn evaluation-boards-delete-btn"
                    onClick={() => handleDeleteBoard(board._id)}
                    title="Delete Board"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
              </div>
              
              <div className="evaluation-boards-card-content-area">
                {board.description && (
                  <p className="evaluation-boards-description-text">{board.description}</p>
                )}
                
                <div className="evaluation-boards-faculty-preview-section">
                  <h4>Faculty Members ({board.faculty.length})</h4>
                  {board.faculty.length > 0 ? (
                    <div className="evaluation-boards-faculty-members-list">
                      {board.faculty.slice(0, 3).map((faculty, index) => (
                        <div key={index} className="evaluation-boards-faculty-chip-item">
                          <div className="evaluation-boards-faculty-avatar-circle">
                            {faculty.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="evaluation-boards-faculty-name-text">{faculty.name}</span>
                          <span className="evaluation-boards-faculty-dept-text">{faculty.department}</span>
                        </div>
                      ))}
                      {board.faculty.length > 3 && (
                        <div className="evaluation-boards-faculty-more-indicator">
                          +{board.faculty.length - 3} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="evaluation-boards-no-faculty-message">No faculty assigned</p>
                  )}
                </div>

                <div className="evaluation-boards-teams-info-section">
                  <div className="evaluation-boards-info-item-wrapper">
                    <FontAwesomeIcon icon={faUserFriends} />
                    <span>Teams: {board.totalTeams || 0}</span>
                  </div>
                  <div className="evaluation-boards-info-item-wrapper">
                    <FontAwesomeIcon icon={faChalkboardTeacher} />
                    <span>Supervisors: {board.faculty.length}</span>
                  </div>
                </div>
              </div>

              <div className="evaluation-boards-card-footer-section">
                <span className="evaluation-boards-creation-date-text">
                  Created {new Date(board.createdAt).toLocaleDateString()}
                </span>
                <button 
                  className="evaluation-boards-manage-details-btn"
                  onClick={() => {
                    setSelectedBoard(board);
                    setShowBoardDetailModal(true);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Empty State */}
      {boardsList.length === 0 && (
        <div className="evaluation-boards-empty-state-container">
          <FontAwesomeIcon icon={faBars} className="evaluation-boards-empty-state-icon" />
          <h3>No Boards Created</h3>
          <p>Create your first evaluation board to get started.</p>
          <button
            className="evaluation-boards-create-first-board-btn"
            onClick={() => {
              setNewBoard({ name: '', description: '', faculty: [] });
              setShowCreateBoardModal(true);
              fetchAvailableFacultyForBoard();
            }}
          >
            <FontAwesomeIcon icon={faPlus} />
            Create First Board
          </button>
        </div>
      )}

      {/* Create Board Modal */}
      {showCreateBoardModal && (
        <div className="evaluation-boards-modal-backdrop" onClick={() => {
          setShowCreateBoardModal(false);
          setNewBoard({ name: '', description: '', faculty: [] });
        }}>
          <div className="evaluation-boards-modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="evaluation-boards-modal-header-area">
              <h2>Create New Board</h2>
              <button
                className="evaluation-boards-modal-close-btn"
                onClick={() => {
                  setShowCreateBoardModal(false);
                  setNewBoard({ name: '', description: '', faculty: [] });
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="evaluation-boards-modal-body-content">
              <div className="evaluation-boards-form-input-group">
                <label>Board Name *</label>
                <input
                  type="text"
                  value={newBoard.name}
                  onChange={(e) => setNewBoard({...newBoard, name: e.target.value})}
                  placeholder="e.g., Board I, Board II, etc."
                  className="evaluation-boards-form-text-input"
                  required
                />
              </div>
              
              <div className="evaluation-boards-form-input-group">
                <label>Description</label>
                <textarea
                  value={newBoard.description}
                  onChange={(e) => setNewBoard({...newBoard, description: e.target.value})}
                  placeholder="Brief description of the board..."
                  rows="3"
                  className="evaluation-boards-form-textarea-input"
                />
              </div>

              <div className="evaluation-boards-form-input-group">
                <label>Add Faculty Members</label>
                <div className="evaluation-boards-faculty-search-wrapper">
                  <input
                    type="text"
                    placeholder="Search faculty..."
                    value={boardFacultySearch}
                    onChange={(e) => setBoardFacultySearch(e.target.value)}
                    className="evaluation-boards-form-text-input"
                  />
                </div>
                
                <div className="evaluation-boards-faculty-selection-area">
                  {availableFacultyForBoard
                    .filter(faculty => 
                      faculty.name.toLowerCase().includes(boardFacultySearch.toLowerCase()) ||
                      faculty.department.toLowerCase().includes(boardFacultySearch.toLowerCase())
                    )
                    .slice(0, 5)
                    .map(faculty => (
                      <div key={faculty._id} className="evaluation-boards-faculty-option-item">
                        <div className="evaluation-boards-faculty-info-display">
                          <span className="evaluation-boards-faculty-name-text">{faculty.name}</span>
                          <span className="evaluation-boards-faculty-dept-text">{faculty.department}</span>
                        </div>
                        <button
                          type="button"
                          className="evaluation-boards-add-faculty-btn"
                          onClick={() => {
                            if (!newBoard.faculty.find(f => f._id === faculty._id)) {
                              setNewBoard({
                                ...newBoard,
                                faculty: [...newBoard.faculty, faculty]
                              });
                            }
                          }}
                          disabled={newBoard.faculty.find(f => f._id === faculty._id)}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                    ))}
                </div>

                {newBoard.faculty.length > 0 && (
                  <div className="evaluation-boards-selected-faculty-container">
                    <h4>Selected Faculty ({newBoard.faculty.length})</h4>
                    {newBoard.faculty.map(faculty => (
                      <div key={faculty._id} className="evaluation-boards-selected-faculty-item">
                        <span>{faculty.name} - {faculty.department}</span>
                        <button
                          type="button"
                          className="evaluation-boards-remove-faculty-btn"
                          onClick={() => {
                            setNewBoard({
                              ...newBoard,
                              faculty: newBoard.faculty.filter(f => f._id !== faculty._id)
                            });
                          }}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="evaluation-boards-modal-footer-actions">
              <button
                className="evaluation-boards-modal-secondary-btn"
                onClick={() => {
                  setShowCreateBoardModal(false);
                  setNewBoard({ name: '', description: '', faculty: [] });
                }}
              >
                Cancel
              </button>
              <button
                className="evaluation-boards-modal-primary-btn"
                onClick={handleCreateBoard}
                disabled={!newBoard.name.trim()}
              >
                Create Board
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Board Modal */}
      {showEditBoardModal && selectedBoard && (
        <div className="evaluation-boards-modal-backdrop" onClick={() => {
          setShowEditBoardModal(false);
          setSelectedBoard(null);
        }}>
          <div className="evaluation-boards-modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="evaluation-boards-modal-header-area">
              <h2>Edit {selectedBoard.name}</h2>
              <button
                className="evaluation-boards-modal-close-btn"
                onClick={() => {
                  setShowEditBoardModal(false);
                  setSelectedBoard(null);
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="evaluation-boards-modal-body-content">
              <div className="evaluation-boards-form-input-group">
                <label>Board Name *</label>
                <input
                  type="text"
                  value={selectedBoard.name}
                  onChange={(e) => setSelectedBoard({
                    ...selectedBoard, 
                    name: e.target.value
                  })}
                  className="evaluation-boards-form-text-input"
                  required
                />
              </div>
              
              <div className="evaluation-boards-form-input-group">
                <label>Description</label>
                <textarea
                  value={selectedBoard.description}
                  onChange={(e) => setSelectedBoard({
                    ...selectedBoard, 
                    description: e.target.value
                  })}
                  rows="3"
                  className="evaluation-boards-form-textarea-input"
                />
              </div>

              <div className="evaluation-boards-form-input-group">
                <label>Manage Faculty Members</label>
                
                {/* Current Faculty */}
                {selectedBoard.faculty.length > 0 && (
                  <div className="evaluation-boards-current-faculty-section">
                    <h4>Current Faculty ({selectedBoard.faculty.length})</h4>
                    {selectedBoard.faculty.map(faculty => (
                      <div key={faculty._id} className="evaluation-boards-current-faculty-item">
                        <div className="evaluation-boards-faculty-info-display">
                          <span className="evaluation-boards-faculty-name-text">{faculty.name}</span>
                          <span className="evaluation-boards-faculty-dept-text">{faculty.department}</span>
                        </div>
                        <button
                          type="button"
                          className="evaluation-boards-remove-faculty-btn"
                          onClick={() => removeFacultyFromBoard(faculty._id)}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Faculty */}
                <div className="evaluation-boards-add-faculty-section">
                  <h4>Add Faculty</h4>
                  <div className="evaluation-boards-faculty-search-wrapper">
                    <input
                      type="text"
                      placeholder="Search available faculty..."
                      value={boardFacultySearch}
                      onChange={(e) => setBoardFacultySearch(e.target.value)}
                      className="evaluation-boards-form-text-input"
                    />
                  </div>
                  
                  <div className="evaluation-boards-faculty-selection-area">
                    {availableFacultyForBoard
                      .filter(faculty => 
                        !selectedBoard.faculty.find(f => f._id === faculty._id) &&
                        (faculty.name.toLowerCase().includes(boardFacultySearch.toLowerCase()) ||
                         faculty.department.toLowerCase().includes(boardFacultySearch.toLowerCase()))
                      )
                      .slice(0, 5)
                      .map(faculty => (
                        <div key={faculty._id} className="evaluation-boards-faculty-option-item">
                          <div className="evaluation-boards-faculty-info-display">
                            <span className="evaluation-boards-faculty-name-text">{faculty.name}</span>
                            <span className="evaluation-boards-faculty-dept-text">{faculty.department}</span>
                          </div>
                          <button
                            type="button"
                            className="evaluation-boards-add-faculty-btn"
                            onClick={() => addFacultyToBoard(faculty._id)}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="evaluation-boards-modal-footer-actions">
              <button
                className="evaluation-boards-modal-secondary-btn"
                onClick={() => {
                  setShowEditBoardModal(false);
                  setSelectedBoard(null);
                }}
              >
                Cancel
              </button>
              <button
                className="evaluation-boards-modal-primary-btn"
                onClick={handleUpdateBoard}
              >
                Update Board
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Board Detail Modal */}
      {showBoardDetailModal && selectedBoard && (
        <div className="evaluation-boards-modal-backdrop" onClick={() => {
          setShowBoardDetailModal(false);
          setSelectedBoard(null);
        }}>
          <div className="evaluation-boards-modal-content-wrapper evaluation-boards-large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="evaluation-boards-modal-header-area">
              <div className="evaluation-boards-modal-title-section">
                <h2>{selectedBoard.name}</h2>
                <span className="evaluation-boards-faculty-count-badge">
                  {selectedBoard.faculty.length} Faculty Members
                </span>
              </div>
              <button
                className="evaluation-boards-modal-close-btn"
                onClick={() => {
                  setShowBoardDetailModal(false);
                  setSelectedBoard(null);
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="evaluation-boards-modal-body-content">
              <div className="evaluation-boards-details-grid-layout">
                {/* Board Information */}
                <div className="evaluation-boards-detail-info-section">
                  <h3>Board Information</h3>
                  <div className="evaluation-boards-detail-list-container">
                    <div className="evaluation-boards-detail-row-item">
                      <span className="evaluation-boards-detail-label-text">Description:</span>
                      <span className="evaluation-boards-detail-value-text">
                        {selectedBoard.description || 'No description provided'}
                      </span>
                    </div>
                    <div className="evaluation-boards-detail-row-item">
                      <span className="evaluation-boards-detail-label-text">Created:</span>
                      <span className="evaluation-boards-detail-value-text">
                        {new Date(selectedBoard.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="evaluation-boards-detail-row-item">
                      <span className="evaluation-boards-detail-label-text">Total Faculty:</span>
                      <span className="evaluation-boards-detail-value-text">{selectedBoard.faculty.length}</span>
                    </div>
                    <div className="evaluation-boards-detail-row-item">
                      <span className="evaluation-boards-detail-label-text">Total Teams:</span>
                      <span className="evaluation-boards-detail-value-text">{selectedBoard.totalTeams || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Faculty and Teams */}
                <div className="evaluation-boards-detail-info-section evaluation-boards-faculty-teams-section">
                  <h3>Faculty & Supervised Teams</h3>
                  {selectedBoard.faculty.length > 0 ? (
                    <div className="evaluation-boards-faculty-teams-list-container">
                      {selectedBoard.faculty.map((faculty, index) => (
                        <div key={index} className="evaluation-boards-faculty-team-card-item">
                          <div className="evaluation-boards-faculty-header-section">
                            <div className="evaluation-boards-faculty-info-display">
                              <div className="evaluation-boards-faculty-avatar-large-circle">
                                {faculty.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="evaluation-boards-faculty-details-wrapper">
                                <h4>{faculty.name}</h4>
                                <p className="evaluation-boards-faculty-dept-text">{faculty.department}</p>
                                <p className="evaluation-boards-faculty-email-text">{faculty.email}</p>
                              </div>
                            </div>
                            <div className="evaluation-boards-team-count-display">
                              <span className="evaluation-boards-team-number-text">{faculty.supervisedTeams?.length || 0}</span>
                              <span className="evaluation-boards-team-label-text">Teams</span>
                            </div>
                          </div>

                          {faculty.supervisedTeams && faculty.supervisedTeams.length > 0 ? (
                            <div className="evaluation-boards-teams-list-section">
                              <h5>Supervised Teams:</h5>
                              {faculty.supervisedTeams.map((team, teamIndex) => (
                                <div key={teamIndex} className="evaluation-boards-team-item-wrapper">
                                  <div className="evaluation-boards-team-info-display">
                                    <span className="evaluation-boards-team-name-text">{team.name}</span>
                                    <span className="evaluation-boards-team-members-text">
                                      {team.memberCount} members
                                    </span>
                                  </div>
                                  <div className="evaluation-boards-team-details-wrapper">
                                    <span className="evaluation-boards-team-phase-badge">Phase {team.currentPhase}</span>
                                    <span className={`evaluation-boards-team-status-badge evaluation-boards-team-${team.status}`}>
                                      {team.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="evaluation-boards-no-teams-message">
                              <p>No supervised teams</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="evaluation-boards-no-faculty-detail-message">
                      <p>No faculty members assigned to this board</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="evaluation-boards-modal-footer-actions">
              <button
                className="evaluation-boards-modal-secondary-btn"
                onClick={() => {
                  setShowBoardDetailModal(false);
                  setSelectedBoard(null);
                }}
              >
                Close
              </button>
              <button
                className="evaluation-boards-modal-primary-btn"
                onClick={() => {
                  setShowBoardDetailModal(false);
                  setShowEditBoardModal(true);
                  fetchAvailableFacultyForBoard(selectedBoard._id);
                }}
              >
                <FontAwesomeIcon icon={faEdit} />
                Edit Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );


  case "deliverables":
  return (
    <div className="admin-del-container">
      <div className="admin-del-header">
        <div className="admin-del-header-content">
          <h1 className="admin-del-page-title">Deliverables & Evaluation</h1>
          <p className="admin-del-page-subtitle">Manage team submissions and evaluation process</p>
        </div>
        
        <div className="admin-del-header-controls">
          <div className="admin-del-search-container">
            <input
              type="text"
              placeholder="Search teams, deliverables..."
              className="admin-del-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="admin-del-filter-group">
            <select
              className="admin-del-filter-select"
              value={deliverableStatusFilter}
              onChange={(e) => setDeliverableStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="needs_revision">Needs Revision</option>
            </select>

            <select
              className="admin-del-filter-select"
              value={deliverablePhaseFilter}
              onChange={(e) => setDeliverablePhaseFilter(e.target.value)}
            >
              <option value="all">All Phases</option>
              <option value="A">Phase A</option>
              <option value="B">Phase B</option>
              <option value="C">Phase C</option>
            </select>

          </div>
          <button className="admin-del-btn-refresh" onClick={fetchDeliverables}>
            <FontAwesomeIcon icon={faSyncAlt} />
            Refresh
          </button>
        </div>
      </div>

      {/* Global Settings */}
      <div className="admin-del-global-settings">
        <div className="admin-del-settings-card">
          <h3>Global Submission Settings</h3>
          <div className="admin-del-setting-controls">
            <label className="admin-del-setting-toggle">
              <input
                type="checkbox"
                checked={globalSettings.allowResubmissions}
                onChange={(e) => updateGlobalSetting('allowResubmissions', e.target.checked)}
              />
              <span className="admin-del-toggle-slider"></span>
              <span className="admin-del-setting-label">Allow Re-submissions Globally</span>
            </label>
            <label className="admin-del-setting-toggle">
              <input
                type="checkbox"
                checked={globalSettings.autoNotifyFaculty}
                onChange={(e) => updateGlobalSetting('autoNotifyFaculty', e.target.checked)}
              />
              <span className="admin-del-toggle-slider"></span>
              <span className="admin-del-setting-label">Auto-notify Faculty on New Submissions</span>
            </label>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="admin-del-stats-overview">
        <div className="admin-del-stat-grid">
          <div className="admin-del-stat-card">
            <div className="admin-del-stat-number">{deliverableStats.total}</div>
            <div className="admin-del-stat-label">Total Submissions</div>
            <div className="admin-del-stat-icon">
              <FontAwesomeIcon icon={faFileAlt} />
            </div>
          </div>
          
          <div 
            className={`admin-del-stat-card admin-del-pending admin-del-clickable ${deliverableStatusFilter === 'pending' ? 'admin-del-active' : ''}`}
            onClick={() => setDeliverableStatusFilter('pending')}
          >
            <div className="admin-del-stat-number">{deliverableStats.pending}</div>
            <div className="admin-del-stat-label">Pending Review</div>
            <div className="admin-del-stat-icon">
              <FontAwesomeIcon icon={faClock} />
            </div>
          </div>
          
          <div 
            className={`admin-del-stat-card admin-del-approved admin-del-clickable ${deliverableStatusFilter === 'approved' ? 'admin-del-active' : ''}`}
            onClick={() => setDeliverableStatusFilter('approved')}
          >
            <div className="admin-del-stat-number">{deliverableStats.approved}</div>
            <div className="admin-del-stat-label">Approved</div>
            <div className="admin-del-stat-icon">
              <FontAwesomeIcon icon={faCheck} />
            </div>
          </div>
          
          <div 
            className={`admin-del-stat-card admin-del-rejected admin-del-clickable ${deliverableStatusFilter === 'rejected' ? 'admin-del-active' : ''}`}
            onClick={() => setDeliverableStatusFilter('rejected')}
          >
            <div className="admin-del-stat-number">{deliverableStats.rejected}</div>
            <div className="admin-del-stat-label">Rejected</div>
            <div className="admin-del-stat-icon">
              <FontAwesomeIcon icon={faTimes} />
            </div>
          </div>

          <div 
            className={`admin-del-stat-card admin-del-revision admin-del-clickable ${deliverableStatusFilter === 'needs_revision' ? 'admin-del-active' : ''}`}
            onClick={() => setDeliverableStatusFilter('needs_revision')}
          >
            <div className="admin-del-stat-number">{deliverableStats.needsRevision}</div>
            <div className="admin-del-stat-label">Needs Revision</div>
            <div className="admin-del-stat-icon">
              <FontAwesomeIcon icon={faEdit} />
            </div>
          </div>
        </div>
      </div>

      {/* Deliverables List */}
      <div className="admin-del-list">
        {filteredDeliverables.length > 0 ? (
          filteredDeliverables.map(deliverable => (
            <div key={deliverable._id} className="admin-del-card">
              <div className="admin-del-card-header">
                <div className="admin-del-card-title-section">
                  <div className="admin-del-badges">
                    <span className={`admin-del-phase-badge admin-del-phase-${deliverable.phase}`}>
                      Phase {deliverable.phase}
                    </span>
                    <span className={`admin-del-type-badge admin-del-type-${deliverable.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      {deliverable.name}
                    </span>
                  </div>
                  <h3 className="admin-del-card-title">{deliverable.teamName}</h3>
                  <p className="admin-del-supervisor">Supervisor: {deliverable.supervisorName}</p>
                </div>
                <div className="admin-del-card-status">
                  <span className={`admin-del-status-indicator admin-del-status-${deliverable.status.replace('_', '-')}`}>
                    {deliverable.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="admin-del-card-content">
                <div className="admin-del-submission-info">
                  <div className="admin-del-meta-grid">
                    <div className="admin-del-meta-item">
                      <FontAwesomeIcon icon={faUser} />
                      <span>Submitted by: {deliverable.submitterName}</span>
                    </div>
                    <div className="admin-del-meta-item">
                      <FontAwesomeIcon icon={faClock} />
                      <span>Submitted: {new Date(deliverable.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="admin-del-meta-item">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>Deadline: {new Date(deliverable.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="admin-del-meta-item">
                      <FontAwesomeIcon icon={faFileAlt} />
                      <span>File: {deliverable.originalName}</span>
                    </div>
                    {deliverable.marks !== null && (
                      <div className="admin-del-meta-item">
                        <FontAwesomeIcon icon={faGraduationCap} />
                        <span>Marks: {deliverable.marks}/100</span>
                      </div>
                    )}
                    <div className="admin-del-meta-item">
                      <FontAwesomeIcon icon={faHashtag} />
                      <span>Version: {deliverable.version}</span>
                    </div>
                  </div>

                  {deliverable.feedback && (
                    <div className="admin-del-feedback-preview">
                      <h4>Supervisor Feedback:</h4>
                      <p>{deliverable.feedback.substring(0, 200)}...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-del-card-footer">
                <div className="admin-del-quick-actions">
                  <button
                    className="admin-del-btn-download"
                    onClick={() => downloadDeliverable(deliverable._id)}
                  >
                    <FontAwesomeIcon icon={faDownload} /> Download
                  </button>
                  
                  <button
                    className="admin-del-btn-view"
                    onClick={() => {
                      setSelectedDeliverable(deliverable);
                      setShowDeliverableModal(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faEye} /> View Details
                  </button>

                  {deliverable.status === 'pending' && (
                    <>
                      <button
                        className="admin-del-btn-approve"
                        onClick={() => updateDeliverableStatus(deliverable._id, 'approved')}
                      >
                        <FontAwesomeIcon icon={faCheck} /> Quick Approve
                      </button>
                      <button
                        className="admin-del-btn-reject"
                        onClick={() => {
                          setSelectedDeliverable(deliverable);
                          setShowFeedbackModal(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faTimes} /> Review
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="admin-del-empty-state">
            <FontAwesomeIcon icon={faFileAlt} className="admin-del-empty-icon" />
            <h3>No Deliverables Found</h3>
            <p>No submissions match your current filters.</p>
          </div>
        )}
      </div>

      {/* Deliverable Details Modal */}
      {showDeliverableModal && selectedDeliverable && (
        <div className="admin-del-modal-overlay" onClick={() => {
          setShowDeliverableModal(false);
          setSelectedDeliverable(null);
        }}>
          <div className="admin-del-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="admin-del-modal-header">
              <h2>{selectedDeliverable.teamName} - {selectedDeliverable.name}</h2>
              <button
                className="admin-del-btn-close"
                onClick={() => {
                  setShowDeliverableModal(false);
                  setSelectedDeliverable(null);
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="admin-del-modal-body">
              <div className="admin-del-details-grid">
                <div className="admin-del-detail-section">
                  <h4>Submission Details</h4>
                  <div className="admin-del-detail-list">
                    <div className="admin-del-detail-row">
                      <span className="admin-del-detail-label">Team:</span>
                      <span className="admin-del-detail-value">{selectedDeliverable.teamName}</span>
                    </div>
                    <div className="admin-del-detail-row">
                      <span className="admin-del-detail-label">Deliverable:</span>
                      <span className="admin-del-detail-value">{selectedDeliverable.name}</span>
                    </div>
                    <div className="admin-del-detail-row">
                      <span className="admin-del-detail-label">Phase:</span>
                      <span className="admin-del-phase-badge">Phase {selectedDeliverable.phase}</span>
                    </div>
                    <div className="admin-del-detail-row">
                      <span className="admin-del-detail-label">Submitted by:</span>
                      <span className="admin-del-detail-value">{selectedDeliverable.submitterName}</span>
                    </div>
                    <div className="admin-del-detail-row">
                      <span className="admin-del-detail-label">Submission Date:</span>
                      <span className="admin-del-detail-value">
                        {new Date(selectedDeliverable.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="admin-del-detail-row">
                      <span className="admin-del-detail-label">Deadline:</span>
                      <span className="admin-del-detail-value">
                        {new Date(selectedDeliverable.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="admin-del-detail-row">
                      <span className="admin-del-detail-label">File:</span>
                      <span className="admin-del-detail-value">{selectedDeliverable.originalName}</span>
                    </div>
                    <div className="admin-del-detail-row">
                      <span className="admin-del-detail-label">File Size:</span>
                      <span className="admin-del-detail-value">
                        {(selectedDeliverable.fileSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <div className="admin-del-detail-row">
                      <span className="admin-del-detail-label">Version:</span>
                      <span className="admin-del-detail-value">{selectedDeliverable.version}</span>
                    </div>
                    {selectedDeliverable.marks !== null && (
                      <div className="admin-del-detail-row">
                        <span className="admin-del-detail-label">Marks:</span>
                        <span className="admin-del-detail-value">{selectedDeliverable.marks}/100</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-del-detail-section">
                  <h4>Evaluation & Feedback</h4>
                  {selectedDeliverable.feedback ? (
                    <div className="admin-del-feedback-full">
                      <p>{selectedDeliverable.feedback}</p>
                      <div className="admin-del-feedback-meta">
                        <small>
                          Reviewed by: {selectedDeliverable.supervisorName} on{' '}
                          {selectedDeliverable.reviewedAt 
                            ? new Date(selectedDeliverable.reviewedAt).toLocaleDateString()
                            : 'Not reviewed'}
                        </small>
                      </div>
                    </div>
                  ) : (
                    <p className="admin-del-no-feedback">No feedback provided yet.</p>
                  )}

                  <div className="admin-del-status-history">
                    <h5>Status History</h5>
                    <div className="admin-del-status-timeline">
                      <div className="admin-del-timeline-item">
                        <span className="admin-del-timeline-status">Submitted</span>
                        <span className="admin-del-timeline-date">
                          {new Date(selectedDeliverable.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {selectedDeliverable.reviewedAt && (
                        <div className="admin-del-timeline-item">
                          <span className="admin-del-timeline-status">
                            {selectedDeliverable.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="admin-del-timeline-date">
                            {new Date(selectedDeliverable.reviewedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-del-modal-footer">
              <button
                className="admin-del-btn-download"
                onClick={() => downloadDeliverable(selectedDeliverable._id)}
              >
                <FontAwesomeIcon icon={faDownload} /> Download File
              </button>
              
              {selectedDeliverable.status === 'pending' && (
                <>
                  <button
                    className="admin-del-btn-approve"
                    onClick={() => {
                      updateDeliverableStatus(selectedDeliverable._id, 'approved');
                      setShowDeliverableModal(false);
                    }}
                  >
                    <FontAwesomeIcon icon={faCheck} /> Approve
                  </button>
                  <button
                    className="admin-del-btn-feedback"
                    onClick={() => {
                      setShowDeliverableModal(false);
                      setShowFeedbackModal(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} /> Provide Feedback
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedDeliverable && (
        <div className="admin-del-modal-overlay" onClick={() => {
          setShowFeedbackModal(false);
          setFeedbackText('');
          setFeedbackStatus('needs_revision');
          setMarks('');
        }}>
          <div className="admin-del-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="admin-del-modal-header">
              <h2>Provide Feedback - {selectedDeliverable.teamName}</h2>
              <button
                className="admin-del-btn-close"
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackText('');
                  setFeedbackStatus('needs_revision');
                  setMarks('');
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="admin-del-modal-body">
              <div className="admin-del-feedback-form">
                <div className="admin-del-form-group">
                  <label>Evaluation Status:</label>
                  <select
                    value={feedbackStatus}
                    onChange={(e) => setFeedbackStatus(e.target.value)}
                    className="admin-del-feedback-status-select"
                  >
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="needs_revision">Needs Revision</option>
                  </select>
                </div>
                
                <div className="admin-del-form-group">
                  <label>Marks (0-100):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    placeholder="Enter marks out of 100"
                    className="admin-del-marks-input"
                  />
                </div>

                <div className="admin-del-form-group">
                  <label>Feedback:</label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Provide detailed feedback for the team..."
                    rows="8"
                    className="admin-del-feedback-textarea"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="admin-del-modal-footer">
              <button
                className="admin-del-btn-secondary"
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackText('');
                  setFeedbackStatus('needs_revision');
                  setMarks('');
                }}
              >
                Cancel
              </button>
              <button
                className="admin-del-btn-primary"
                onClick={() => submitFeedback(selectedDeliverable._id)}
                disabled={!feedbackText.trim()}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );


case "student-problems":
  return (
    <div className="problems-container">
      <div className="problems-header">
        <div className="problems-header-content">
          <h1 className="problems-page-title">Student Problems & Support</h1>
          <p className="problems-page-subtitle">Manage student-reported issues and provide assistance</p>
        </div>
        
        <div className="problems-header-controls">
          <div className="problems-search-container">
            <input
              type="text"
              placeholder="Search problems..."
              className="problems-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
         <div className="problems-filter-group">
  <select
    className="problems-filter-select"
    value={problemStatusFilter}
    onChange={(e) => setProblemStatusFilter(e.target.value)}
  >
    <option value="all">All Status</option>
    <option value="Open">Open</option>
    <option value="In Progress">In Progress</option>
    <option value="Resolved">Resolved</option>
    <option value="Closed">Closed</option>
  </select>

  <select
    className="problems-filter-select"
    value={problemTypeFilter}
    onChange={(e) => setProblemTypeFilter(e.target.value)}
  >
    <option value="all">All Types</option>
    <option value="Technical">Technical</option>
    <option value="Academic">Academic</option>
    <option value="Team">Team</option>
    <option value="Account">Account</option>
    <option value="System">System</option>
    <option value="Other">Other</option>
  </select>

  {/* NEW: Add user type filter */}
  <select
    className="problems-filter-select"
    value={problemUserTypeFilter}
    onChange={(e) => setProblemUserTypeFilter(e.target.value)}
  >
    <option value="all">All Users</option>
    <option value="Student">Students Only</option>
    <option value="Faculty">Faculty Only</option>
  </select>
</div>

          <button className="problems-btn-refresh" onClick={fetchStudentProblems}>
            <FontAwesomeIcon icon={faSyncAlt} />
            Refresh
          </button>
        </div>
      </div>

      {/* Enhanced Interactive Stats Cards */}
      <div className="problems-stats-overview">
  <div className="problems-stat-grid">
    <div 
      className={`problems-stat-card clickable ${problemStatusFilter === 'all' ? 'active' : ''}`}
      onClick={() => handleStatsCardClick('all')}
    >
      <div className="problems-stat-number">{problemStats.total}</div>
      <div className="problems-stat-label">Total Tickets</div>
      <div className="problems-stat-icon">
        <FontAwesomeIcon icon={faChartBar} />
      </div>
    </div>
    
    <div 
      className={`problems-stat-card problems-pending clickable ${problemStatusFilter === 'Open' ? 'active' : ''}`}
      onClick={() => handleStatsCardClick('Open')}
    >
      <div className="problems-stat-number">{problemStats.pending}</div>
      <div className="problems-stat-label">Pending</div>
      <div className="problems-stat-icon">
        <FontAwesomeIcon icon={faClock} />
      </div>
    </div>
    
    <div 
      className={`problems-stat-card problems-in-progress clickable ${problemStatusFilter === 'In Progress' ? 'active' : ''}`}
      onClick={() => handleStatsCardClick('In Progress')}
    >
      <div className="problems-stat-number">{problemStats.inProgress}</div>
      <div className="problems-stat-label">In Progress</div>
      <div className="problems-stat-icon">
        <FontAwesomeIcon icon={faSpinner} />
      </div>
    </div>
    
    <div 
      className={`problems-stat-card problems-resolved clickable ${problemStatusFilter === 'Resolved' ? 'active' : ''}`}
      onClick={() => handleStatsCardClick('Resolved')}
    >
      <div className="problems-stat-number">{problemStats.resolved}</div>
      <div className="problems-stat-label">Resolved</div>
      <div className="problems-stat-icon">
        <FontAwesomeIcon icon={faCheck} />
      </div>
    </div>

    {/* NEW: Student tickets stat */}
    <div 
      className={`problems-stat-card problems-students clickable ${problemUserTypeFilter === 'Student' ? 'active' : ''}`}
      onClick={() => setProblemUserTypeFilter('Student')}
    >
      <div className="problems-stat-number">{problemStats.students || 0}</div>
      <div className="problems-stat-label">Student Tickets</div>
      <div className="problems-stat-icon">
        <FontAwesomeIcon icon={faUserGraduate} />
      </div>
    </div>

    {/* NEW: Faculty tickets stat */}
    <div 
      className={`problems-stat-card problems-faculty clickable ${problemUserTypeFilter === 'Faculty' ? 'active' : ''}`}
      onClick={() => setProblemUserTypeFilter('Faculty')}
    >
      <div className="problems-stat-number">{problemStats.faculty || 0}</div>
      <div className="problems-stat-label">Faculty Tickets</div>
      <div className="problems-stat-icon">
        <FontAwesomeIcon icon={faChalkboardTeacher} />
      </div>
    </div>
  </div>
</div>


      {/* Filter Status Indicator */}
      {problemStatusFilter !== 'all' && (
        <div className="problems-filter-indicator">
          <span className="filter-text">
            Showing: <strong>{getStatusDisplayName(problemStatusFilter)}</strong> problems
          </span>
          <button 
            className="clear-filter-btn"
            onClick={() => setProblemStatusFilter('all')}
          >
            <FontAwesomeIcon icon={faTimes} /> Clear Filter
          </button>
        </div>
      )}

      {/* Rest of your existing problems list code */}
      <div className="problems-list">
        {filteredProblems.length > 0 ? (
          filteredProblems.map(problem => (
            <div key={problem._id} className="problems-card">
              <div className="problems-card-header">
                <div className="problems-card-title-section">
                  <div className="problems-priority-indicator">
                    <span className={`problems-priority-badge problems-${problem.priority || 'medium'}`}>
                      {problem.priority || 'Medium'}
                    </span>
                    <span className={`problems-type-badge problems-${(problem.category || '').replace(/\s+/g, '-').toLowerCase()}`}>
                      {problem.category || 'Unknown'}
                    </span>
                  </div>
                  <h3 className="problems-card-title">{problem.subject}</h3>
                </div>
                <div className="problems-card-status">
                  <span className={`problems-status-indicator problems-${(problem.status || '').replace(/\s+/g, '-').toLowerCase()}`}>
                    {problem.status || 'Unknown'}
                  </span>
                </div>
              </div>
              
             <div className="problems-card-content">
  <div className="problems-user-info">


    <div className="problems-user-details">
<div className="problems-user-name">{problem.userName || 'Unknown User'}</div>
      {/* Different display based on user type */}
      {problem.userType === 'Student' ? (
        <>
          <div className="problems-user-id">ID: {problem.userIdentifier}</div>
          <div className="problems-user-email">{problem.userEmail}</div>
          <div className="problems-user-type-badge student">👨‍🎓 Student</div>
        </>
      ) : (
        <>
          <div className="problems-user-email">{problem.userEmail}</div>
          <div className="problems-user-id">Faculty</div>
          <div className="problems-user-type-badge faculty">👨‍🏫 Faculty</div>
        </>
      )}
    </div>
  </div>
  
  <div className="problems-description-preview">
    <p>{problem.description.substring(0, 150)}...</p>
  </div>

  <div className="problems-meta-info">
    <div className="problems-meta-item">
      <FontAwesomeIcon icon={faClock} />
      <span>Submitted {new Date(problem.createdAt).toLocaleDateString()}</span>
    </div>
    {problem.updatedAt && (
      <div className="problems-meta-item">
        <FontAwesomeIcon icon={faSync} />
        <span>Updated {new Date(problem.updatedAt).toLocaleDateString()}</span>
      </div>
    )}
  </div>
</div>


              <div className="problems-card-footer">
                <div className="problems-quick-actions">
                  {problem.status === 'Open' && (
                    <button
                      className="problems-btn-quick problems-btn-start"
                      onClick={() => updateProblemStatus(problem._id, 'In Progress')}
                    >
                      <FontAwesomeIcon icon={faSpinner} /> Start Working
                    </button>
                  )}
                  {problem.status === 'In Progress' && (
                    <button
                      className="problems-btn-quick problems-btn-resolve"
                      onClick={() => updateProblemStatus(problem._id, 'Resolved')}
                    >
                      <FontAwesomeIcon icon={faCheck} /> Mark Resolved
                    </button>
                  )}
                  <button
                    className="problems-btn-quick problems-btn-respond"
                    onClick={() => {
                      setSelectedProblem(problem);
                      setShowResponseModal(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} /> Send Response
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="problems-empty-state">
            <FontAwesomeIcon icon={faCheckCircle} className="problems-empty-icon" />
            <h3>No Problems Found</h3>
            <p>
              {problemStatusFilter === 'all' 
                ? 'All student issues have been resolved, or no problems match your current filters.'
                : `No ${getStatusDisplayName(problemStatusFilter).toLowerCase()} problems found.`
              }
            </p>
            {problemStatusFilter !== 'all' && (
              <button 
                className="problems-btn-primary"
                onClick={() => setProblemStatusFilter('all')}
              >
                View All Problems
              </button>
            )}
          </div>
        )}
      </div>

      {/* Your existing modals remain the same */}
      {/* Response Modal */}
      {showResponseModal && selectedProblem && (
        <div className="problems-modal-overlay" onClick={() => {
          setShowResponseModal(false);
          setResponseMessage('');
        }}>
          <div className="problems-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="problems-modal-header">
              <h2>Send Response to {selectedProblem.studentName}</h2>
              <button
                className="problems-btn-close"
                onClick={() => {
                  setShowResponseModal(false);
                  setResponseMessage('');
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="problems-modal-body">
              <div className="problems-response-form">
                <div className="problems-form-group">
                  <label>Response Message:</label>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Type your response to the student..."
                    rows="6"
                    className="problems-response-textarea"
                  />
                </div>
                
                <div className="problems-form-group">
                  <label>Update Status:</label>
                  <select
                    value={responseStatus}
                    onChange={(e) => setResponseStatus(e.target.value)}
                    className="problems-response-status-select"
                  >
                    <option value="Open">Keep as Open</option>
                    <option value="In Progress">Mark as In Progress</option>
                    <option value="Resolved">Mark as Resolved</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="problems-modal-footer">
              <button
                className="problems-btn-secondary"
                onClick={() => {
                  setShowResponseModal(false);
                  setResponseMessage('');
                }}
              >
                Cancel
              </button>
              <button
                className="problems-btn-primary"
                onClick={() => sendResponseToProblem(selectedProblem._id)}
                disabled={!responseMessage.trim()}
              >
                Send Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

      case "announcements":
              return (
                <div className="content-box announce">
                  <div className="management-header">
                    <h2>Announcements</h2>
                    <div className="controls">
                      <input
                        type="text"
                        placeholder="Search announcements..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button
                        className="admin-action-button"
                        onClick={() => setShowAddAnnouncementModal(true)}
                      >
                        + Create Announcement
                      </button>
                    </div>
                  </div>
      
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Content Preview</th>
                          <th>Author</th>
                          <th>Date</th>
                          <th>Audience</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAnnouncements.map((announcement) => (
                          <tr
                            key={announcement.id}
                            onClick={() => setSelectedAnnouncement(announcement)}
                            className="clickable-row"
                          >
                            <td>{announcement.title}</td>
                            <td className="content-preview">
                              {announcement.content.substring(0, 50)}...
                            </td>
                            <td>{announcement.author}</td>
                            <td className="date">{announcement.date}</td>
                            <td>
                              <span className="audience-tag">
                                {announcement.audience}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`status-badge ${announcement.status.toLowerCase()}`}
                              >
                                {announcement.status}
                              </span>
                            </td>
                            <td className="actions-cell">
                              <button
                                className="icon-button edit btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAnnouncement(announcement);
                                  setNewAnnouncement({ ...announcement, 
                                    _id: announcement._id || announcement.id });
      
                                  setEditMode(true);
                                  setShowEditAnnouncementModal(true); // show modal
                                }}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                className="icon-button delete btnDel"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAnnouncement(announcement._id);
                                }}
                              >
                                <FontAwesomeIcon icon={faTrashAlt} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
      
                  {/* Updated the Announcement */}
                  {showEditAnnouncementModal && (
                    <div className="admin-modal-overlay" onClick={() => setShowEditAnnouncementModal(false)}>
                      <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>
                          {editMode
                            ? "Update Announcement"
                            : "Create New Announcement"}
                        </h3>
      
                        <div className="admin-form-group">
                          <label>Title</label>
                          <input
                            type="text"
                            value={newAnnouncement.title}
                            onChange={(e) =>
                              setNewAnnouncement({
                                ...newAnnouncement,
                                title: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
      
                        <div className="admin-form-group">
                          <label>Content</label>
                          <textarea
                            value={newAnnouncement.content}
                            onChange={(e) =>
                              setNewAnnouncement({
                                ...newAnnouncement,
                                content: e.target.value,
                              })
                            }
                            rows="5"
                            required
                          />
                        </div>
      
                        <div className="admin-form-group">
                          <label>Audience</label>
                          <select
                            value={newAnnouncement.audience}
                            onChange={(e) =>
                              setNewAnnouncement({
                                ...newAnnouncement,
                                audience: e.target.value,
                              })
                            }
                          >
                            <option value="Faculty Only">Faculty Only</option>
                            <option value="Computer Science"> Computer Science Dept </option>
                            <option value="All Concerned">All Concerned</option>
                          </select>
                        </div>
      
                        <div className="admin-form-group">
                          <label>Status</label>
                          <select
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
      
                        <div className="form-actions">
                          <button
                            className="admin-action-button"
                            onClick={
                              editMode
                                ? handleUpdateAnnouncement
                                : handleAddAnnouncement
                            }
                          >
                            {editMode ? "Update" : "Publish"}
                          </button>
                          <button
                            className="admin-action-button cancel"
                            onClick={() => setShowEditAnnouncementModal(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
      
                  {/* Add Announcement Modal */}
                  {showAddAnnouncementModal && (
                    <div className="admin-modal-overlay" onClick={() => setShowAddAnnouncementModal(false)}>
                      <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Create New Announcement</h3>
                        <div className="admin-form-group">
                          <label>Title</label>
                          <input
                            type="text"
                            value={newAnnouncement.title}
                            onChange={(e) =>
                              setNewAnnouncement({
                                ...newAnnouncement,
                                title: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="admin-form-group">
                          <label>Content</label>
                          <textarea
                            value={newAnnouncement.content}
                            onChange={(e) =>
                              setNewAnnouncement({
                                ...newAnnouncement,
                                content: e.target.value,
                              })
                            }
                            rows="5"
                            required
                          />
                        </div>
                        <div className="admin-form-group">
                          <label>Audience</label>
                          <select
                            value={newAnnouncement.audience}
                            onChange={(e) =>
                              setNewAnnouncement({
                                ...newAnnouncement,
                                audience: e.target.value,
                              })
                            }
                          >
                            {/* <option value="All Students">All Students</option> */}
                            <option value="Faculty Only">Faculty Only</option>
                            <option value="Computer Science">
                              Computer Science Dept
                            </option>
                            <option value="All Concerned">All Concerned</option>
                          </select>
                        </div>
                        <div className="admin-form-group">
                          <label>Status</label>
                          <select
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
                        <div className="form-actions">
                          <button
                            className="admin-action-button"
                            onClick={handleAddAnnouncement}
                          >
                            Publish
                          </button>
                          <button
                            className="admin-action-button cancel"
                            onClick={() => setShowAddAnnouncementModal(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
      
                  {/* Announcement Detail Modal */}
                  {/* {selectedAnnouncement && (
                    <div className="admin-modal-overlay">
                      <div className="modal profile-modal">
                        <h3>{selectedAnnouncement.title}</h3>
                        {!editMode ? (
                          <div className="profile-details">
                            <div className="detail-item">
                              <label>Author:</label>
                              <span>{selectedAnnouncement.author}</span>
                            </div>
                            <div className="detail-item">
                              <label>Date:</label>
                              <span>{selectedAnnouncement.date}</span>
                            </div>
                            <div className="detail-item">
                              <label>Audience:</label>
                              <span className="audience-tag">
                                {selectedAnnouncement.audience}
                              </span>
                            </div>
                            <div className="detail-item">
                              <label>Status:</label>
                              <span className={`status-badge ${selectedAnnouncement.status.toLowerCase()}`}>
                                {selectedAnnouncement.status}
                              </span>
                            </div>
                            <div className="detail-item full-width">
                              <label>Content:</label>
                              <div className="announcement-content">
                                {selectedAnnouncement.content}
                              </div>
                            </div>
                            <div className="profile-actions">
                              <button
                                className="admin-action-button edit"
                                onClick={() => setEditMode(true)}
                              >
                                Edit
                              </button>
                              <button
                                className="admin-action-button cancel"
                                onClick={() => setSelectedAnnouncement(null)}
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="edit-form">
                            <div className="admin-form-group">
                              <label>Title</label>
                              <input
                                value={selectedAnnouncement.title}
                                onChange={(e) => setSelectedAnnouncement({ ...selectedAnnouncement, title: e.target.value })}
                              />
                            </div>
                            <div className="admin-form-group">
                              <label>Content</label>
                              <textarea
                                value={selectedAnnouncement.content}
                                onChange={(e) => setSelectedAnnouncement({ ...selectedAnnouncement, content: e.target.value })}
                                rows="5"
                              />
                            </div>
                            <div className="admin-form-group">
                              <label>Audience</label>
                              <select
                                value={selectedAnnouncement.audience}
                                onChange={(e) => setSelectedAnnouncement({ ...selectedAnnouncement, audience: e.target.value })}
                              >
                                <option value="All Students">All Students</option>
                                <option value="Faculty Only">Faculty Only</option>
                                <option value="Computer Science">Computer Science Dept</option>
                                <option value="Electrical Engineering">EE Dept</option>
                              </select>
                            </div>
                            <div className="admin-form-group">
                              <label>Status</label>
                              <select
                                value={selectedAnnouncement.status}
                                onChange={(e) => setSelectedAnnouncement({ ...selectedAnnouncement, status: e.target.value })}
                              >
                                <option value="Draft">Draft</option>
                                <option value="Published">Published</option>
                                <option value="Archived">Archived</option>
                              </select>
                            </div>
                            <div className="form-actions">
                              <button
                                className="admin-action-button"
                                onClick={() => {
                                  setAnnouncements(announcements.map(ann =>
                                    ann.id === selectedAnnouncement.id ? selectedAnnouncement : ann
                                  ));
                                  setEditMode(false);
                                }}
                              >
                                Save Changes
                              </button>
                              <button
                                className="admin-action-button cancel"
                                onClick={() => setEditMode(false)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )} */}
                </div>
              );
      
     // Replace the existing reports case in AdminDashboard.js with this enhanced version

case "reports":
  return (
    <div className="content-box">
      <div className="management-header">
        <h2>Reports & Analytics</h2>
        <div className="controls">
          <select
            className="report-select"
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
          >
            <option value="enrollment">Enrollment Statistics</option>
            <option value="faculty">Faculty Workload</option>
            <option value="projects">Project Progress</option>
            <option value="system">System Overview</option>
          </select>
          
          <div className="date-range">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>
          
          <button
            className="admin-action-button"
            onClick={generateReport}
            disabled={isGeneratingReport}
          >
            {isGeneratingReport ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {reportError && (
        <div className="error-message">
          {reportError}
        </div>
      )}

      {generatedReport && (
        <div className="report-content">
          {/* Report Title */}
          <div className="report-header">
            <h3>{getReportTitle()}</h3>
            <p className="report-subtitle">
              Generated on {new Date().toLocaleDateString()} 
              {startDate && endDate && ` • Period: ${startDate} to ${endDate}`}
            </p>
          </div>

          {/* Key Metrics Cards */}
          {renderKeyMetrics()}

          {/* Chart Section */}
          <div className="chart-container" style={{ width: '100%', height: 400, marginBottom: '30px' }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>

          {/* Data Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {getTableHeaders().map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getTableData().map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Export Controls */}
          <div className="export-controls">
            <button className="admin-action-button" onClick={handleExportExcel}>
              <i className="fas fa-file-excel"></i> Export Excel
            </button>
            <button className="admin-action-button" onClick={handleExportPDF}>
              <i className="fas fa-file-pdf"></i> Export PDF
            </button>
          </div>
        </div>
      )}

      {/* No Report Generated State */}
      {!generatedReport && !isGeneratingReport && (
        <div className="empty-state">
          <i className="fas fa-chart-bar empty-icon"></i>
          <h3>Generate Analytics Report</h3>
          <p>Select a report type and date range, then click "Generate Report" to view comprehensive analytics.</p>
        </div>
      )}
    </div>
  );


      default:
        return (
          <div className="content-box">
            <h2>Select an Option</h2>
          </div>
        )
    }

  //   default:
  //     return <div>Select a tab</div>;
  // }
  }

  return (
    <div className="admin-dashboard">
      <AdminHelmet />
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isMobile={isMobile}
      />

      <main className="admin-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard
