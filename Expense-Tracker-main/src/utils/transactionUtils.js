// utils/transactionUtils.js

// API base URL from environment variables
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('et_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// --- API-based Functions ---

export async function getTransactions() {
  const response = await fetch(`${API_BASE}/transactions`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
}

export async function getTransaction(id) {
  const response = await fetch(`${API_BASE}/transactions/${id}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch transaction');
  return response.json();
}

export async function saveTransaction(transactionData) {
  const hasId = !!transactionData.id;
  const url = hasId ? `${API_BASE}/transactions/${transactionData.id}` : `${API_BASE}/transactions`;
  const method = hasId ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method,
    headers: getAuthHeaders(),
    body: JSON.stringify(transactionData),
  });

  if (!response.ok) throw new Error('Failed to save transaction');
  return response.json();
}

export async function deleteTransaction(id) {
  const response = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete transaction');
  return { success: true };
}

export async function restoreTransaction(id) {
  const response = await fetch(`${API_BASE}/transactions/${id}/restore`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to restore transaction');
  return response.json();
}

export async function getCategories() {
  const response = await fetch(`${API_BASE}/categories`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
}

// --- Client-Side Utility Functions (Unchanged) ---

export function formatCurrency(amountMinor, currency = 'INR') {
  // ... same implementation ...
  const amount = amountMinor / 100;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${amount.toFixed(2)}`;
  }
}

export function calculateBalance(transactions) {
  // ... same implementation ...
  return transactions.reduce((balance, tx) => {
    if (tx.isDeleted) return balance;
    return tx.type === 'income' ? balance + tx.amountMinor : balance - tx.amountMinor;
  }, 0);
}

export function getRecentTransactions(transactions, limit = 5) {
  // ... same implementation ...
  return [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

export function filterTransactions(transactions, filters) {
  // ... same implementation ...
  return transactions.filter(tx => {
    if (filters.startDate && new Date(tx.date) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(tx.date) > new Date(filters.endDate)) return false;
    if (filters.categoryId && tx.categoryId !== filters.categoryId) return false;
    if (filters.type && tx.type !== filters.type) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return tx.note?.toLowerCase().includes(searchTerm);
    }
    return true;
  });
}

export function exportTransactionsToCSV(transactions, categories) {
  // ... same implementation ...
  try {
    const categoryMap = categories.reduce((map, cat) => ({ ...map, [cat.id]: cat.name }), {});
    const headers = ['Date', 'Type', 'Amount', 'Category', 'Note', 'Payment Method'];
    const csvData = [headers];

    transactions.forEach(tx => {
      csvData.push([
        new Date(tx.date).toLocaleDateString(),
        tx.type,
        (tx.amountMinor / 100).toFixed(2),
        categoryMap[tx.categoryId] || 'Unknown',
        tx.note || '',
        tx.paymentMethod || '',
      ]);
    });

    const csvContent = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return { success: false, error: error.message };
  }
}