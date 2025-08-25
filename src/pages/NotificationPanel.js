import React, { useCallback, memo } from 'react';

const NotificationPanel = memo(({ showNotifications, setShowNotifications, notifications, markAsRead }) => {
  return (
    <>
      {showNotifications && (
        <div
          className="notification-panel-overlay"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Overlay clicked, closing notifications'); // Debug log
            setShowNotifications(false);
          }}
        >
          <div
            className="notification-panel"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              console.log('Panel clicked, staying open'); // Debug log
            }}
          >
            <h3>Notifications</h3>
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className={`notification ${n.read ? 'read' : 'unread'}`}>
                  <span>{n.message}</span>
                  {!n.read && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markAsRead(n.id);
                      }}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>No new notifications</p>
            )}
          </div>
        </div>
      )}
    </>
  );
});

export default NotificationPanel;
