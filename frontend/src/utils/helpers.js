export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount) => {
  return `Rs. ${parseFloat(amount).toFixed(2)}`;
};

export const downloadPDF = (content, filename) => {
  const link = document.createElement('a');
  link.href = content;
  link.download = filename;
  link.click();
};
