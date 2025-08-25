import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEye, 
  FaDownload, 
  FaCheck, 
  FaTimes, 
  FaEdit, 
  FaTrash,
  FaFileAlt,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaSpinner,
  FaStar,
  FaComment,
  FaExclamationTriangle,
  FaArrowLeft,
  FaClipboardList
} from 'react-icons/fa';
import './FacultyDeliverables.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const FacultyDeliverables = () => {
  const [activeTab, setActiveTab] = useState('manage');
  const [deliverables, setDeliverables] = useState([]);
  const [supervisedTeams, setSupervisedTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showInlineMessage, setShowInlineMessage] = useState(null);

  const [createForm, setCreateForm] = useState({
    teamId: '',
    name: '',
    description: '',
    phase: 'A',
    deadline: '',
    allowedFileTypes: ['pdf', 'docx'],
    maxFileSize: 20
  });

  const [reviewForm, setReviewForm] = useState({
    status: 'pending',
    feedback: '',
    marks: ''
  });

  useEffect(() => {
    loadSupervisedTeams();
    if (activeTab === 'manage') {
      loadDeliverables();
    }
  }, [activeTab]);

  const showMessage = (message, type = 'info') => {
    setShowInlineMessage({ message, type });
    setTimeout(() => setShowInlineMessage(null), 5000);
  };

  const loadSupervisedTeams = async () => {
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/supervised-teams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSupervisedTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Load teams error:', error);
    }
  };

  const loadDeliverables = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/deliverables`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDeliverables(data.deliverables || []);
      } else {
        showMessage('Failed to load deliverables', 'error');
      }
    } catch (error) {
      console.error('Load deliverables error:', error);
      showMessage('Network error while loading deliverables', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDeliverable = async (e) => {
    e.preventDefault();
    
    if (!createForm.teamId || !createForm.name || !createForm.deadline) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/deliverables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createForm)
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Deliverable created successfully!', 'success');
        setShowCreateModal(false);
        setCreateForm({
          teamId: '',
          name: '',
          description: '',
          phase: 'A',
          deadline: '',
          allowedFileTypes: ['pdf', 'docx'],
          maxFileSize: 20
        });
        loadDeliverables();
      } else {
        showMessage(data.message || 'Failed to create deliverable', 'error');
      }
    } catch (error) {
      console.error('Create deliverable error:', error);
      showMessage('Network error while creating deliverable', 'error');
    }
  };

  const loadSubmissions = async (deliverableId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/deliverables/${deliverableId}/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedDeliverable(data.deliverable);
        setSubmissions(data.submissions || []);
      } else {
        showMessage('Failed to load submissions', 'error');
      }
    } catch (error) {
      console.error('Load submissions error:', error);
      showMessage('Network error while loading submissions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmission = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('facultyToken');
      const response = await fetch(`${API_BASE}/api/faculty/submissions/${selectedSubmission._id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: reviewForm.status,
          feedback: reviewForm.feedback,
          marks: reviewForm.marks ? parseInt(reviewForm.marks) : undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Submission reviewed successfully!', 'success');
        setShowReviewModal(false);
        setSelectedSubmission(null);
        setReviewForm({ status: 'pending', feedback: '', marks: '' });
        loadSubmissions(selectedDeliverable._id);
      } else {
        showMessage(data.message || 'Failed to review submission', 'error');
      }
    } catch (error) {
      console.error('Review submission error:', error);
      showMessage('Network error while reviewing submission', 'error');
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

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fbbf24',
      approved: '#10b981',
      rejected: '#ef4444',
      needs_revision: '#f97316'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="fac-deliverables-main-container">
      {showInlineMessage && (
        <div className={`fac-deliverables-notification ${showInlineMessage.type}`}>
          <div className="fac-deliverables-notification-content">
            <span className="fac-deliverables-notification-text">{showInlineMessage.message}</span>
            <button 
              className="fac-deliverables-notification-close"
              onClick={() => setShowInlineMessage(null)}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <div className="fac-deliverables-page-header">
        <div className="fac-deliverables-title-section">
          <div className="fac-deliverables-title-icon">
            <FaClipboardList />
          </div>
          <div className="fac-deliverables-title-content">
            <h1 className="fac-deliverables-main-title">Deliverables Management</h1>
            <p className="fac-deliverables-subtitle">Create and manage project deliverables for your supervised teams</p>
          </div>
        </div>
        
        <div className="fac-deliverables-tab-navigation">
          <button
            className={`fac-deliverables-tab-button ${activeTab === 'manage' ? 'fac-deliverables-tab-active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <FaClipboardList className="fac-deliverables-tab-icon" />
            <span>Manage Deliverables</span>
          </button>
          <button
            className={`fac-deliverables-tab-button ${activeTab === 'review' ? 'fac-deliverables-tab-active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            <FaEye className="fac-deliverables-tab-icon" />
            <span>Review Submissions</span>
          </button>
        </div>
      </div>

      {/* Manage Deliverables Tab */}
      {activeTab === 'manage' && (
        <div className="fac-deliverables-manage-section">
          <div className="fac-deliverables-section-header">
            <div className="fac-deliverables-section-info">
              <h2 className="fac-deliverables-section-title">Deliverable Management</h2>
              <p className="fac-deliverables-section-description">
                Create and track deliverables for your supervised teams
              </p>
            </div>
            <button
              className="fac-deliverables-create-button"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus className="fac-deliverables-button-icon" />
              <span>Create New Deliverable</span>
            </button>
          </div>

          {isLoading ? (
            <div className="fac-deliverables-loading-container">
              <div className="fac-deliverables-loading-content">
                <FaSpinner className="fac-deliverables-loading-spinner" />
                <h3>Loading Deliverables</h3>
                <p>Please wait while we fetch your deliverables...</p>
              </div>
            </div>
          ) : deliverables.length === 0 ? (
            <div className="fac-deliverables-empty-container">
              <div className="fac-deliverables-empty-content">
                <div className="fac-deliverables-empty-icon">
                  <FaFileAlt />
                </div>
                <h3 className="fac-deliverables-empty-title">No Deliverables Created</h3>
                <p className="fac-deliverables-empty-description">
                  Start by creating your first deliverable for your supervised teams to begin collecting submissions and tracking progress.
                </p>
                <button
                  className="fac-deliverables-empty-action"
                  onClick={() => setShowCreateModal(true)}
                >
                  <FaPlus /> Create Your First Deliverable
                </button>
              </div>
            </div>
          ) : (
            <div className="fac-deliverables-grid-container">
              {deliverables.map((deliverable) => (
                <div key={deliverable._id} className="fac-deliverables-card">
                  <div className="fac-deliverables-card-header">
                    <div className="fac-deliverables-card-title-section">
                      <h3 className="fac-deliverables-card-title">{deliverable.name}</h3>
                      <div className="fac-deliverables-phase-indicator">
                        <span className="fac-deliverables-phase-text">Phase {deliverable.phase}</span>
                      </div>
                    </div>
                    <div className="fac-deliverables-card-actions">
                      <button
                        className="fac-deliverables-action-view"
                        onClick={() => {
                          setActiveTab('review');
                          loadSubmissions(deliverable._id);
                        }}
                        title="View submissions"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>

                  <div className="fac-deliverables-card-body">
                    <div className="fac-deliverables-info-row">
                      <div className="fac-deliverables-info-item">
                        <FaUsers className="fac-deliverables-info-icon" />
<span className="fac-deliverables-info-text">
  {deliverable.teamId?.name || 'Team Not Found'}
</span>                      </div>
                    </div>

                    <div className="fac-deliverables-info-row">
                      <div className="fac-deliverables-info-item">
                        <FaCalendarAlt className="fac-deliverables-info-icon" />
                        <span className={`fac-deliverables-deadline ${deliverable.isOverdue ? 'fac-deliverables-overdue' : ''}`}>
                          {formatDate(deliverable.deadline)}
                          {deliverable.isOverdue && <span className="fac-deliverables-overdue-badge">Overdue</span>}
                        </span>
                      </div>
                    </div>

                    <div className="fac-deliverables-stats-section">
                      <div className="fac-deliverables-stat-item">
                        <span className="fac-deliverables-stat-label">Submissions</span>
                        <span className="fac-deliverables-stat-value">{deliverable.submissionCount}</span>
                      </div>
                      <div className="fac-deliverables-stat-item">
                        <span className="fac-deliverables-stat-label">Pending Review</span>
                        <span className="fac-deliverables-stat-value fac-deliverables-stat-pending">{deliverable.pendingCount}</span>
                      </div>
                    </div>

                    {deliverable.description && (
                      <div className="fac-deliverables-description-section">
                        <p className="fac-deliverables-description-text">{deliverable.description}</p>
                      </div>
                    )}

                    <div className="fac-deliverables-details-section">
                      <div className="fac-deliverables-detail-row">
                        <span className="fac-deliverables-detail-label">File Types:</span>
                        <span className="fac-deliverables-detail-value">{deliverable.allowedFileTypes.join(', ').toUpperCase()}</span>
                      </div>
                      <div className="fac-deliverables-detail-row">
                        <span className="fac-deliverables-detail-label">Max Size:</span>
                        <span className="fac-deliverables-detail-value">{deliverable.maxFileSize} MB</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Submissions Tab */}
      {activeTab === 'review' && (
        <div className="fac-deliverables-review-section">
          {selectedDeliverable ? (
            <div className="fac-deliverables-submissions-container">
              <div className="fac-deliverables-submissions-header">
                <button
                  className="fac-deliverables-back-button"
                  onClick={() => {
                    setSelectedDeliverable(null);
                    setSubmissions([]);
                  }}
                >
                  <FaArrowLeft className="fac-deliverables-back-icon" />
                  <span>Back to Deliverables</span>
                </button>
                <div className="fac-deliverables-deliverable-info">
                  <h3 className="fac-deliverables-deliverable-name">{selectedDeliverable.name}</h3>
                  <div className="fac-deliverables-deliverable-meta">
                    <span className="fac-deliverables-team-info">Team: {selectedDeliverable.teamId?.name || 'Team Not Found'}</span>
                    <span className="fac-deliverables-phase-info">Phase {selectedDeliverable.phase}</span>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="fac-deliverables-loading-container">
                  <div className="fac-deliverables-loading-content">
                    <FaSpinner className="fac-deliverables-loading-spinner" />
                    <h3>Loading Submissions</h3>
                    <p>Fetching submission details...</p>
                  </div>
                </div>
              ) : submissions.length === 0 ? (
                <div className="fac-deliverables-empty-container">
                  <div className="fac-deliverables-empty-content">
                    <div className="fac-deliverables-empty-icon">
                      <FaFileAlt />
                    </div>
                    <h3 className="fac-deliverables-empty-title">No Submissions Yet</h3>
                    <p className="fac-deliverables-empty-description">
                      The team hasn't submitted this deliverable yet. They will be notified about the new requirement.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="fac-deliverables-submissions-list">
                  {submissions.map((submission) => (
                    <div key={submission._id} className="fac-deliverables-submission-card">
                      <div className="fac-deliverables-submission-header">
                        <div className="fac-deliverables-file-section">
                          <div className="fac-deliverables-file-icon-container">
                            <FaFileAlt className="fac-deliverables-file-icon" />
                          </div>
                          <div className="fac-deliverables-file-details">
                            <h4 className="fac-deliverables-file-name">{submission.originalName}</h4>
                            <div className="fac-deliverables-file-meta">
                              <span>Version {submission.version}</span>
                              <span>•</span>
                              <span>Submitted by {submission.submitterName}</span>
                              <span>•</span>
                              <span>{formatDate(submission.submittedAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="fac-deliverables-submission-actions">
                          <a
                            href={`${API_BASE}/api/deliverables/submissions/${submission._id}/download`}
                            className="fac-deliverables-action-download"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Download file"
                          >
                            <FaDownload />
                          </a>
                          <button
                            className="fac-deliverables-action-review"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setReviewForm({
                                status: submission.status || 'pending',
                                feedback: submission.feedback || '',
                                marks: submission.marks || ''
                              });
                              setShowReviewModal(true);
                            }}
                            title="Review submission"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </div>

                      <div className="fac-deliverables-submission-status-section">
                        <span
                          className="fac-deliverables-status-badge"
                          style={{ backgroundColor: getStatusColor(submission.status) }}
                        >
                          {submission.status.replace('_', ' ').toUpperCase()}
                        </span>

                        {submission.marks !== undefined && (
                          <div className="fac-deliverables-marks-section">
                            <FaStar className="fac-deliverables-marks-icon" />
                            <span className="fac-deliverables-marks-text">{submission.marks}/100</span>
                          </div>
                        )}
                      </div>

                      {submission.feedback && (
                        <div className="fac-deliverables-feedback-section">
                          <div className="fac-deliverables-feedback-header">
                            <FaComment className="fac-deliverables-feedback-icon" />
                            <span className="fac-deliverables-feedback-title">Your Feedback</span>
                          </div>
                          <div className="fac-deliverables-feedback-content">
                            {submission.feedback}
                          </div>
                        </div>
                      )}

                      {submission.reviewedAt && (
                        <div className="fac-deliverables-review-timestamp">
                          <span>Reviewed: {formatDate(submission.reviewedAt)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="fac-deliverables-select-deliverable">
              <div className="fac-deliverables-selection-container">
                <div className="fac-deliverables-selection-header">
                  <h3 className="fac-deliverables-selection-title">Select a deliverable to review submissions</h3>
                  <p className="fac-deliverables-selection-description">
                    Choose from your created deliverables below to view and review team submissions
                  </p>
                </div>
                {deliverables.length === 0 ? (
                  <div className="fac-deliverables-empty-container">
                    <div className="fac-deliverables-empty-content">
                      <div className="fac-deliverables-empty-icon">
                        <FaFileAlt />
                      </div>
                      <h3 className="fac-deliverables-empty-title">No deliverables created yet</h3>
                      <p className="fac-deliverables-empty-description">
                        Create deliverables in the Manage tab to start receiving submissions
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="fac-deliverables-options-grid">
                    {deliverables.map((deliverable) => (
                      <div
                        key={deliverable._id}
                        className="fac-deliverables-option-card"
                        onClick={() => loadSubmissions(deliverable._id)}
                      >
                        <div className="fac-deliverables-option-header">
                          <h4 className="fac-deliverables-option-title">{deliverable.name}</h4>
                          <div className="fac-deliverables-option-phase">Phase {deliverable.phase}</div>
                        </div>
                        <div className="fac-deliverables-option-info">
<span className="fac-deliverables-option-team">
  {deliverable.teamId?.name || 'Team Not Found'}
</span>                          <span className="fac-deliverables-option-submissions">
                            {deliverable.submissionCount} submission{deliverable.submissionCount !== 1 ? 's' : ''}
                            {deliverable.pendingCount > 0 && (
                              <span className="fac-deliverables-option-pending">({deliverable.pendingCount} pending)</span>
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Deliverable Modal */}
      {showCreateModal && (
        <div className="fac-deliverables-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="fac-deliverables-modal-container fac-deliverables-create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fac-deliverables-modal-header">
              <div className="fac-deliverables-modal-title-section">
                <h3 className="fac-deliverables-modal-title">Create New Deliverable</h3>
                <p className="fac-deliverables-modal-subtitle">Set up a new deliverable for your supervised team</p>
              </div>
              <button 
                className="fac-deliverables-modal-close" 
                onClick={() => setShowCreateModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateDeliverable} className="fac-deliverables-create-form">
              <div className="fac-deliverables-form-section">
                <div className="fac-deliverables-form-group">
                  <label className="fac-deliverables-form-label">
                    Team <span className="fac-deliverables-required">*</span>
                  </label>
                  <select
                    className="fac-deliverables-form-select"
                    value={createForm.teamId}
                    onChange={(e) => setCreateForm({ ...createForm, teamId: e.target.value })}
                    required
                  >
                    <option value="">Select Team</option>
                    {supervisedTeams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name} ({team.members.length} members)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="fac-deliverables-form-row">
                  <div className="fac-deliverables-form-group">
                    <label className="fac-deliverables-form-label">
                      Deliverable Name <span className="fac-deliverables-required">*</span>
                    </label>
                    <input
                      type="text"
                      className="fac-deliverables-form-input"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="e.g., Project Proposal Document"
                      required
                    />
                  </div>

                  <div className="fac-deliverables-form-group">
                    <label className="fac-deliverables-form-label">
                      Phase <span className="fac-deliverables-required">*</span>
                    </label>
                    <select
                      className="fac-deliverables-form-select"
                      value={createForm.phase}
                      onChange={(e) => setCreateForm({ ...createForm, phase: e.target.value })}
                      required
                    >
                      <option value="A">Phase A - Research & Planning</option>
                      <option value="B">Phase B - Development & Implementation</option>
                      <option value="C">Phase C - Testing & Final Presentation</option>
                    </select>
                  </div>
                </div>

                <div className="fac-deliverables-form-group">
                  <label className="fac-deliverables-form-label">Description</label>
                  <textarea
                    className="fac-deliverables-form-textarea"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Provide detailed instructions for this deliverable..."
                    rows="4"
                  />
                </div>

                <div className="fac-deliverables-form-row">
                  <div className="fac-deliverables-form-group">
                    <label className="fac-deliverables-form-label">
                      Deadline <span className="fac-deliverables-required">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      className="fac-deliverables-form-input"
                      value={createForm.deadline}
                      onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                      required
                    />
                  </div>

                  <div className="fac-deliverables-form-group">
                    <label className="fac-deliverables-form-label">Max File Size (MB)</label>
                    <input
                      type="number"
                      className="fac-deliverables-form-input"
                      value={createForm.maxFileSize}
                      onChange={(e) => setCreateForm({ ...createForm, maxFileSize: parseInt(e.target.value) })}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>

                <div className="fac-deliverables-form-group">
                  <label className="fac-deliverables-form-label">Allowed File Types</label>
                  <div className="fac-deliverables-file-types-grid">
                    {['pdf', 'docx', 'doc', 'pptx', 'ppt', 'zip', 'txt', 'xlsx'].map((type) => (
                      <label key={type} className="fac-deliverables-checkbox-label">
                        <input
                          type="checkbox"
                          className="fac-deliverables-checkbox"
                          checked={createForm.allowedFileTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCreateForm({
                                ...createForm,
                                allowedFileTypes: [...createForm.allowedFileTypes, type]
                              });
                            } else {
                              setCreateForm({
                                ...createForm,
                                allowedFileTypes: createForm.allowedFileTypes.filter(t => t !== type)
                              });
                            }
                          }}
                        />
                        <span className="fac-deliverables-checkbox-text">{type.toUpperCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="fac-deliverables-form-actions">
                <button
                  type="button"
                  className="fac-deliverables-btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="fac-deliverables-btn-create">
                  <FaPlus className="fac-deliverables-btn-icon" />
                  Create Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {showReviewModal && selectedSubmission && (
        <div className="fac-deliverables-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="fac-deliverables-modal-container fac-deliverables-review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fac-deliverables-modal-header">
              <div className="fac-deliverables-modal-title-section">
                <h3 className="fac-deliverables-modal-title">Review Submission</h3>
                <p className="fac-deliverables-modal-subtitle">Provide feedback and marks for this submission</p>
              </div>
              <button 
                className="fac-deliverables-modal-close" 
                onClick={() => setShowReviewModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="fac-deliverables-submission-preview">
              <div className="fac-deliverables-file-preview">
                <div className="fac-deliverables-file-preview-icon">
                  <FaFileAlt />
                </div>
                <div className="fac-deliverables-file-preview-details">
                  <h4 className="fac-deliverables-file-preview-name">{selectedSubmission.originalName}</h4>
                  <p className="fac-deliverables-file-preview-meta">Submitted by {selectedSubmission.submitterName}</p>
                  <p className="fac-deliverables-file-preview-date">Version {selectedSubmission.version} • {formatDate(selectedSubmission.submittedAt)}</p>
                </div>
              </div>

              <a
                href={`${API_BASE}/api/deliverables/submissions/${selectedSubmission._id}/download`}
                className="fac-deliverables-download-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaDownload className="fac-deliverables-download-icon" />
                <span>Download File</span>
              </a>
            </div>

            <form onSubmit={handleReviewSubmission} className="fac-deliverables-review-form">
              <div className="fac-deliverables-form-section">
                <div className="fac-deliverables-form-group">
                  <label className="fac-deliverables-form-label">
                    Status <span className="fac-deliverables-required">*</span>
                  </label>
                  <select
                    className="fac-deliverables-form-select"
                    value={reviewForm.status}
                    onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                    required
                  >
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="needs_revision">Needs Revision</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="fac-deliverables-form-group">
                  <label className="fac-deliverables-form-label">Marks (Optional)</label>
                  <input
                    type="number"
                    className="fac-deliverables-form-input"
                    value={reviewForm.marks}
                    onChange={(e) => setReviewForm({ ...reviewForm, marks: e.target.value })}
                    min="0"
                    max="100"
                    placeholder="Enter marks out of 100"
                  />
                </div>

                <div className="fac-deliverables-form-group">
                  <label className="fac-deliverables-form-label">Feedback</label>
                  <textarea
                    className="fac-deliverables-form-textarea"
                    value={reviewForm.feedback}
                    onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                    placeholder="Provide detailed feedback to help the team improve..."
                    rows="5"
                  />
                </div>
              </div>

              <div className="fac-deliverables-form-actions">
                <button
                  type="button"
                  className="fac-deliverables-btn-cancel"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="fac-deliverables-btn-submit">
                  <FaCheck className="fac-deliverables-btn-icon" />
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDeliverables;
