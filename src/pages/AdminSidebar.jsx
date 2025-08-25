import React, { useEffect, useState } from 'react';
import {
    faUsersCog,
    faUserGraduate,
    faBookOpen,
    faBullhorn,
    faChartBar,
    faChevronLeft,
    faChevronRight,
    faTachometerAlt,
    faChalkboardTeacher,
    faCog,
    faUsers,
    faBars,
    faTimes,
    faExclamationTriangle,
    faBell,
    faFileAlt, // Add this for deliverables icon
    faClipboardCheck // Add this as alternative
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const AdminSidebar = ({
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed
}) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [unreadProblemsCount, setUnreadProblemsCount] = useState(0);
    const [pendingDeliverablesCount, setPendingDeliverablesCount] = useState(0); // Add state for pending deliverables

    // Fetch unread problems count
    useEffect(() => {
        const fetchUnreadProblemsCount = async () => {
            try {
                const API_BASE = process.env.REACT_APP_API_URL;
                const response = await fetch(`${API_BASE}/api/admin/student-problems/unread-count`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUnreadProblemsCount(data.count);
                }
            } catch (error) {
                console.error('Error fetching unread problems count:', error);
            }
        };

        fetchUnreadProblemsCount();
        const interval = setInterval(fetchUnreadProblemsCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Fetch pending deliverables count
    useEffect(() => {
        const fetchPendingDeliverablesCount = async () => {
            try {
                const API_BASE = process.env.REACT_APP_API_URL;
                const response = await fetch(`${API_BASE}/api/admin/deliverables/pending-count`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setPendingDeliverablesCount(data.count);
                }
            } catch (error) {
                console.error('Error fetching pending deliverables count:', error);
            }
        };

        fetchPendingDeliverablesCount();
        const interval = setInterval(fetchPendingDeliverablesCount, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const mobileCheck = window.innerWidth <= 768;
            setIsMobile(mobileCheck);
            
            if (!mobileCheck) {
                setIsMobileSidebarOpen(false);
                document.body.classList.remove('sidebar-active-mobile');
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        if (isMobile) {
            setIsMobileSidebarOpen(prev => !prev);
        } else {
            setIsSidebarCollapsed(prev => !prev);
        }
    };

    const getSidebarClasses = () => {
        const classes = ['admin-sidebar'];
        if (isMobile) {
            if (isMobileSidebarOpen) {
                classes.push('mobile-open');
            }
        } else {
            if (isSidebarCollapsed) {
                classes.push('collapsed');
            }
        }
        return classes.join(' ');
    };

    useEffect(() => {
        if (isMobile && isMobileSidebarOpen) {
            document.body.classList.add('sidebar-active-mobile');
        } else {
            document.body.classList.remove('sidebar-active-mobile');
        }
        
        return () => {
            document.body.classList.remove('sidebar-active-mobile');
        };
    }, [isMobile, isMobileSidebarOpen]);

    const menuItems = [
        { id: 'faculty', label: 'Manage Faculty', icon: faUsersCog },
        { id: 'student', label: 'Manage Students', icon: faUserGraduate },
        { id: 'teams', label: 'Manage Teams', icon: faUsers },
        { id: 'boards', label: 'Manage Boards', icon: faChalkboardTeacher },
        { 
        id: 'evaluations', 
        label: 'Evaluation Boards', 
        icon: faClipboardCheck 
        }, 
        { 
            id: 'deliverables', 
            label: 'Deliverables & Evaluation', 
            icon: faFileAlt,
            badge: pendingDeliverablesCount // Add badge for pending deliverables
        },
        { 
            id: 'student-problems', 
            label: 'Problems', 
            icon: faExclamationTriangle,
            badge: unreadProblemsCount
        },
        { id: 'announcements', label: 'Announcements', icon: faBullhorn },
        { id: 'reports', label: 'Reports', icon: faChartBar },
        { id: 'settings', label: 'Settings', icon: faCog }
    ];

    const handleMenuItemClick = (itemId) => {
        setActiveTab(itemId);
        // Reset counts when admin opens respective sections
        if (itemId === 'student-problems') {
            setUnreadProblemsCount(0);
        }
        if (itemId === 'deliverables') {
            setPendingDeliverablesCount(0);
        }
        if (isMobile) {
            setIsMobileSidebarOpen(false);
        }
    };

    const handleBackdropClick = () => {
        if (isMobile && isMobileSidebarOpen) {
            setIsMobileSidebarOpen(false);
        }
    };

    return (
        <>
            {/* Mobile Menu Toggle Button */}
            {isMobile && (
                <button
                    className="mobile-menu-toggle"
                    onClick={toggleSidebar}
                    aria-label={isMobileSidebarOpen ? 'Close menu' : 'Open menu'}
                >
                    <FontAwesomeIcon 
                        icon={isMobileSidebarOpen ? faTimes : faBars} 
                    />
                </button>
            )}

            {/* Sidebar Backdrop for Mobile */}
            {isMobile && isMobileSidebarOpen && (
                <div 
                    className="sidebar-backdrop active"
                    onClick={handleBackdropClick}
                    aria-hidden="true"
                />
            )}

            <aside
                className={getSidebarClasses()}
                aria-expanded={isMobile ? isMobileSidebarOpen : !isSidebarCollapsed}
            >
                <div className="admin-title">
                    <span className="logo-icon" aria-hidden="true">
                        <FontAwesomeIcon icon={faTachometerAlt} />
                    </span>
                    <span className="title-text">Admin Panel</span>
                </div>

                <nav className="admin-menu" aria-label="Main navigation">
                    <ul>
                        {menuItems.map(item => (
                            <li key={item.id}>
                                <button
                                    onClick={() => handleMenuItemClick(item.id)}
                                    className={activeTab === item.id ? 'active' : ''}
                                    data-tooltip={item.label}
                                    aria-current={activeTab === item.id ? 'page' : undefined}
                                >
                                    <FontAwesomeIcon 
                                        icon={item.icon} 
                                        className="menu-icon" 
                                        aria-hidden="true" 
                                    />
                                    <span className="menu-text">{item.label}</span>
                                    {/* Add notification badge */}
                                    {item.badge && item.badge > 0 && (
                                        <span className="notification-badge-admin" aria-label={`${item.badge} items`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Desktop Collapse Toggle */}
                {!isMobile && (
                    <button
                        className="collapse-toggle"
                        onClick={toggleSidebar}
                        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <FontAwesomeIcon
                            icon={isSidebarCollapsed ? faChevronRight : faChevronLeft}
                            className="menu-icon"
                            aria-hidden="true"
                        />
                    </button>
                )}
            </aside>
        </>
    );
};

export default AdminSidebar;
