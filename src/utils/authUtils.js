// Utility to refresh faculty session
export const refreshFacultySession = async () => {
  try {
    const token = localStorage.getItem('facultyToken');
    if (!token) return false;

    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/refresh-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('facultyToken', data.token);
      return true;
    } else {
      localStorage.removeItem('facultyToken');
      return false;
    }
  } catch (error) {
    console.error('Session refresh failed:', error);
    localStorage.removeItem('facultyToken');
    return false;
  }
};

// Auto-refresh token every 50 minutes
export const startTokenRefresh = () => {
  setInterval(() => {
    refreshFacultySession();
  }, 50 * 60 * 1000); // 50 minutes
};
