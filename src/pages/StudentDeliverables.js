import React, { useState, useEffect } from 'react';
import { 
  FaUpload, 
  FaDownload, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaFileAlt,
  FaCalendarAlt,
  FaStar,
  FaComment,
  FaSpinner
} from 'react-icons/fa';
import './StudentDeliverables.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const StudentDeliverables = () => {
  const [deliverables, setDeliverables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [teamInfo, setTeamInfo] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [showInlineMessage, setShowInlineMessage] = useState(null);

  useEffect(() => {
    loadDeliverables();
  }, []);

  const showMessage = (message, type = 'info') => {
    setShowInlineMessage({ message, type });
    setTimeout(() => setShowInlineMessage(null), 5000);
  };

  const loadDeliverables = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('studentToken');
      const response = await fetch(`${API_BASE}/api/students/deliverables`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.hasTeam && data.hasSupervisor) {
          setDeliverables(data.deliverables || []);
          setTeamInfo(data.team);
          setIsLeader(data.isLeader);
        } else {
          setError(data.hasTeam ? 
            'Your team needs a supervisor to access deliverables' : 
            'You need to be in a supervised team to access deliverables'
          );
        }
      } else {
        setError(data.message || 'Failed to load deliverables');
      }
    } catch (error) {
      console.error('Load deliverables error:', error);
      setError('Network error while loading deliverables');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (deliverableId, file) => {
    if (!file) return;

    setUploading(deliverableId);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('studentToken');
      const response = await fetch(`${API_BASE}/api/students/deliverables/${deliverableId}/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Deliverable submitted successfully!', 'success');
        loadDeliverables();
      } else {
        showMessage(data.message || 'Upload failed', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('Network error during upload', 'error');
    } finally {
      setUploading(null);
    }
  };

  const getStatusIcon = (submission, isOverdue) => {
    if (!submission) {
      return isOverdue ? 
        <FaTimesCircle className="status-icon overdue" title="Overdue" /> :
        <FaClock className="status-icon pending" title="Not submitted" />;
    }

    switch (submission.status) {
      case 'approved':
        return <FaCheckCircle className="status-icon approved" title="Approved" />;
      case 'rejected':
        return <FaTimesCircle className="status-icon rejected" title="Rejected" />;
      case 'needs_revision':
        return <FaExclamationTriangle className="status-icon revision" title="Needs Revision" />;
      default:
        return <FaClock className="status-icon pending" title="Under Review" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="deliverables-loading">
        <FaSpinner className="spinning" />
        <p>Loading deliverables...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="deliverables-error">
        <FaExclamationTriangle className="error-icon" />
        <h3>Deliverables Not Available</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="student-deliverables-container">
      {showInlineMessage && (
        <div className={`inline-message ${showInlineMessage.type}`}>
          {showInlineMessage.message}
          <button onClick={() => setShowInlineMessage(null)}>×</button>
        </div>
      )}

      <div className="deliverables-header">
        <h2>Team Deliverables</h2>
        {teamInfo && (
          <div className="team-info-bar">
            <span className="team-name">Team: {teamInfo.name}</span>
            <span className="supervisor-name">Supervisor: {teamInfo.supervisor}</span>
            {!isLeader && (
              <span className="role-notice">Only team leaders can upload deliverables</span>
            )}
          </div>
        )}
      </div>

      {deliverables.length === 0 ? (
        <div className="no-deliverables">
          <FaFileAlt className="empty-icon" />
          <h3>No Deliverables Assigned</h3>
          <p>Your supervisor hasn't assigned any deliverables yet.</p>
        </div>
      ) : (
        <div className="deliverables-grid">
          {deliverables.map((deliverable) => (
            <div key={deliverable._id} className="deliverable-card">
              <div className="deliverable-header">
                <div className="deliverable-title">
                  <h3>{deliverable.name}</h3>
                  <div className="phase-badge">Phase {deliverable.phase}</div>
                </div>
                {getStatusIcon(deliverable.submission, deliverable.isOverdue)}
              </div>

              {deliverable.description && (
                <p className="deliverable-description">{deliverable.description}</p>
              )}

              <div className="deliverable-details">
                <div className="detail-row">
                  <FaCalendarAlt className="detail-icon" />
                  <span className="detail-label">Deadline:</span>
                  <span className={`deadline ${deliverable.isOverdue ? 'overdue' : ''}`}>
                    {formatDate(deliverable.deadline)}
                  </span>
                </div>

                <div className="detail-row">
                  <FaFileAlt className="detail-icon" />
                  <span className="detail-label">Allowed Types:</span>
                  <span>{deliverable.allowedFileTypes.join(', ').toUpperCase()}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Max Size:</span>
                  <span>{deliverable.maxFileSize} MB</span>
                </div>
              </div>

              {/* Submission Status */}
              {deliverable.submission && (
                <div className="submission-info">
                  <div className="submission-header">
                    <h4>Submission Status</h4>
                    <span className={`status-badge ${deliverable.submission.status}`}>
                      {deliverable.submission.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="submission-details">
                    <div className="submission-file">
                      <FaFileAlt className="file-icon" />
                      <div className="file-info">
                        <span className="file-name">{deliverable.submission.originalName}</span>
                        <span className="file-meta">
                          Version {deliverable.submission.version} • 
                          Submitted {formatDate(deliverable.submission.submittedAt)}
                        </span>
                      </div>
                      
                    </div>

                    {deliverable.submission.marks !== undefined && (
                      <div className="submission-marks">
                        <FaStar className="marks-icon" />
                        <span>Marks: {deliverable.submission.marks}/100</span>
                      </div>
                    )}

                    {deliverable.submission.feedback && (
                      <div className="submission-feedback">
                        <div className="feedback-header">
                          <FaComment className="feedback-icon" />
                          <span>Supervisor Feedback</span>
                        </div>
                        <div className="feedback-content">
                          {deliverable.submission.feedback}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upload Section */}
              {isLeader && deliverable.canUpload && (
                <div className="upload-section">
                  {deliverable.submission?.status === 'needs_revision' && (
                    <div className="revision-notice">
                      <FaExclamationTriangle />
                      <span>Revision required. Please upload a new version.</span>
                    </div>
                  )}

                  <div className="upload-controls">
                    <label 
                      className={`upload-btn ${uploading === deliverable._id ? 'uploading' : ''}`}
                    >
                      <input
                        type="file"
                        accept={deliverable.allowedFileTypes.map(type => `.${type}`).join(',')}
                        onChange={(e) => handleFileUpload(deliverable._id, e.target.files[0])}
                        disabled={uploading === deliverable._id}
                        style={{ display: 'none' }}
                      />
                      {uploading === deliverable._id ? (
                        <>
                          <FaSpinner className="spinning" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FaUpload />
                          {deliverable.submission ? 'Upload New Version' : 'Upload File'}
                        </>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {!isLeader && !deliverable.submission && (
                <div className="leader-only-notice">
                  <FaExclamationTriangle />
                  <span>Only the team leader can upload deliverables</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDeliverables;
