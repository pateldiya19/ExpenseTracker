// Utility functions for triggering transaction-related notifications

export const dispatchTransactionEvent = (eventType, transactionData) => {
  const event = new CustomEvent(eventType, {
    detail: transactionData
  });
  window.dispatchEvent(event);
};

export const notifyTransactionAdded = (transaction) => {
  dispatchTransactionEvent('transactionAdded', transaction);
};

export const notifyTransactionUpdated = (transaction) => {
  dispatchTransactionEvent('transactionUpdated', transaction);
};

export const notifyTransactionDeleted = (transaction) => {
  dispatchTransactionEvent('transactionDeleted', transaction);
};

export const formatRupee = (amount) => {
  try {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR' 
    }).format(amount / 100);
  } catch { 
    return `₹${(amount / 100).toFixed(2)}`;
  }
};