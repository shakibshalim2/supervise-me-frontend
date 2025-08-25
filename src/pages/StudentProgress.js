// Create components/StudentProgress.js
import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaCheckCircle, 
  FaClock, 
  FaCalendarAlt,
  FaUser,
  FaSync,
  FaTrophy,
  FaExclamationCircle
} from 'react-icons/fa';
import './StudentProgress.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const StudentProgress = ({ myTeam, teamProgress, onRefreshProgress }) => {
  const [milestones, setMilestones] = useState([]);
  const [completedMilestones, setCompletedMilestones] = useState([]);
  const [progressStatus, setProgressStatus] = useState('Not Set');
  const [isLoading, setIsLoading] = useState(false);
  const [supervisorInfo, setSupervisorInfo] = useState(null);

  useEffect(() => {
    if (teamProgress) {
      setMilestones(teamProgress.milestones || []);
      setCompletedMilestones(teamProgress.completedMilestones || []);
      setProgressStatus(teamProgress.progressStatus || 'Not Set');
      setSupervisorInfo(teamProgress.supervisorInfo);
    }
  }, [teamProgress]);

  const calculateProgress = () => {
    if (milestones.length === 0) return 0;
    return Math.round((completedMilestones.length / milestones.length) * 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'On Track': return '#10b981';
      case 'Needs Improvement': return '#f59e0b';
      case 'Delayed': return '#ef4444';
      case 'Completed': return '#6366f1';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRefresh = () => {
    setIsLoading(true);
    onRefreshProgress();
    setTimeout(() => setIsLoading(false), 1000);
  };

  if (!myTeam) {
    return (
      <div className="progress-container">
        <div className="progress-no-team">
          <FaExclamationCircle className="no-team-icon" />
          <h3>No Team Found</h3>
          <p>You need to be part of a team to view progress.</p>
        </div>
      </div>
    );
  }

  if (!myTeam.currentSupervisor) {
    return (
      <div className="progress-container">
        <div className="progress-no-supervisor">
          <FaUser className="no-supervisor-icon" />
          <h3>No Supervisor Assigned</h3>
          <p>Your team needs a supervisor to track progress and milestones.</p>
          <p>Please contact your instructor or wait for supervisor assignment.</p>
        </div>
      </div>
    );
  }

  const progressPercentage = calculateProgress();

  return (
    <div className="progress-container">
      {/* Header */}
      <div className="progress-header">
        <div className="progress-title-section">
          <h2>
            <FaChartLine className="progress-icon" />
            Team Progress
          </h2>
          <p>Track your team's milestones and progress</p>
        </div>
        
        <button 
          className="refresh-progress-btn"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <FaSync className={isLoading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {/* Team Overview */}
      <div className="progress-team-overview">
        <div className="team-overview-card">
          <h3>{myTeam.name}</h3>
          <div className="team-meta">
            <span>Phase {myTeam.currentPhase || myTeam.phase || 'A'}</span>
            <span>{myTeam.members?.length || 0}/4 Members</span>
          </div>
        </div>

        {supervisorInfo && (
          <div className="supervisor-info-card">
            <h4>Supervised by</h4>
            <div className="supervisor-details">
              <strong>{supervisorInfo.name}</strong>
              <span>{supervisorInfo.department}</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Overview */}
      <div className="progress-overview">
        <div className="progress-stats">
          <div className="progress-stat-card">
            <div className="stat-circle">
              <div 
                className="progress-circle"
                style={{
                  background: `conic-gradient(${getProgressColor(progressPercentage)} ${progressPercentage * 3.6}deg, #e5e7eb 0deg)`
                }}
              >
                <div className="progress-inner">
                  <span className="progress-percentage">{progressPercentage}%</span>
                  <span className="progress-label">Complete</span>
                </div>
              </div>
            </div>
            <h3>Overall Progress</h3>
          </div>

          <div className="status-card">
            <div 
              className="status-indicator"
              style={{ backgroundColor: getStatusColor(progressStatus) }}
            />
            <div className="status-info">
              <h4>Current Status</h4>
              <span className="status-text">{progressStatus}</span>
            </div>
          </div>

          <div className="milestones-summary-card">
            <FaTrophy className="summary-icon" />
            <div className="summary-info">
              <h4>Milestones</h4>
              <span>{completedMilestones.length} of {milestones.length} completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones List */}
      <div className="milestones-section">
        <h3>Project Milestones</h3>
        
        {milestones.length === 0 ? (
          <div className="no-milestones">
            <FaCalendarAlt className="no-milestones-icon" />
            <h4>No Milestones Set</h4>
            <p>Your supervisor hasn't set any milestones yet.</p>
          </div>
        ) : (
          <div className="milestones-list">
            {milestones.map((milestone, index) => {
              const isCompleted = completedMilestones.includes(milestone.id);
              const isOverdue = milestone.dueDate && new Date(milestone.dueDate) < new Date() && !isCompleted;

              return (
                <div 
                  key={milestone.id || index} 
                  className={`milestone-card ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
                >
                  <div className="milestone-status">
                    {isCompleted ? (
                      <FaCheckCircle className="milestone-completed-icon" />
                    ) : (
                      <FaClock className="milestone-pending-icon" />
                    )}
                  </div>

                  <div className="milestone-content">
                    <div className="milestone-header">
                      <h4>{milestone.name}</h4>
                      <div className="milestone-meta">
                        <span className="milestone-phase">Phase {milestone.phase}</span>
                        <span className="milestone-weight">{milestone.weight}%</span>
                      </div>
                    </div>

                    {milestone.description && (
                      <p className="milestone-description">{milestone.description}</p>
                    )}

                    <div className="milestone-footer">
                      <div className="milestone-type">
                        {milestone.isCustom ? (
                          <span className="custom-milestone">Custom</span>
                        ) : (
                          <span className="default-milestone">Standard</span>
                        )}
                      </div>

                      {milestone.dueDate && (
                        <div className="milestone-due-date">
                          <FaCalendarAlt className="date-icon" />
                          <span>Due: {formatDate(milestone.dueDate)}</span>
                          {isOverdue && <span className="overdue-label">Overdue</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="milestone-completion-status">
                    {isCompleted ? (
                      <span className="completed-label">✓ Completed</span>
                    ) : (
                      <span className="pending-label">Pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Progress Notes */}
      {myTeam.statusNotes && (
        <div className="progress-notes">
          <h4>Supervisor Notes</h4>
          <div className="notes-content">
            {myTeam.statusNotes}
          </div>
          <div className="notes-meta">
            Last updated: {myTeam.lastProgressUpdate ? 
              new Date(myTeam.lastProgressUpdate).toLocaleDateString() : 
              'Not available'
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProgress;
