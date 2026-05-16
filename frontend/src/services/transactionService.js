import api from './api';

export function uploadCSV(file) {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/transactions/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function getTransactions(filters = {}) {
  return api.get('/transactions', { params: filters });
}

export function updateCategory(id, categoryId) {
  return api.patch(`/transactions/${id}/category`, { category_id: categoryId });
}

export function createTransaction(data) {
  return api.post('/transactions', data);
}

export function updateTransaction(id, data) {
  return api.put(`/transactions/${id}`, data);
}

export function deleteTransaction(id) {
  return api.delete(`/transactions/${id}`);
}
