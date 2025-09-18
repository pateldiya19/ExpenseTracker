const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('et_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const notificationService = {
  async fetchNotifications() {
    const resp = await fetch(`${API_BASE}/notifications`, { headers: getAuthHeaders() });
    if (!resp.ok) throw new Error('Failed to fetch notifications');
    return resp.json();
  },

  async markRead(ids = []) {
    const resp = await fetch(`${API_BASE}/notifications/mark-read`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids })
    });
    if (!resp.ok) throw new Error('Failed to mark notifications as read');
    return resp.json();
  }
};
