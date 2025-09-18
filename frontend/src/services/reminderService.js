import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('et_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const reminderService = {
  async createReminder(reminderData) {
    try {
      // Format the time in HH:MM format if it exists
      const formattedData = {
        ...reminderData,
        time: reminderData.time ? 
          reminderData.time.match(/^\d{1,2}:\d{2}$/) ? 
            reminderData.time.padStart(5, '0') : // Ensure HH:MM format
            undefined : undefined,
        // Ensure reminderTime is in ISO format for custom reminders
        reminderTime: reminderData.reminderTime ? 
          new Date(reminderData.reminderTime).toISOString() : undefined,
      };

      const response = await axios.post(`${API_URL}/reminders`, formattedData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create reminder';
      console.error('Reminder creation error:', errorMsg, reminderData);
      throw new Error(errorMsg);
    }
  },

  async getReminders() {
    try {
      const response = await axios.get(`${API_URL}/reminders`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reminders');
    }
  },

  async updateReminder(id, updates) {
    try {
      const response = await axios.put(`${API_URL}/reminders/${id}`, updates, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update reminder');
    }
  },

  async deleteReminder(id) {
    try {
      const response = await axios.delete(`${API_URL}/reminders/${id}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete reminder');
    }
  }
};