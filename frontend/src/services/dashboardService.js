import api from './api';

export function getSummary(month) {
  return api.get('/dashboard/summary', { params: month ? { month } : {} });
}

export function getByCategory(month) {
  return api.get('/dashboard/by-category', { params: month ? { month } : {} });
}

export function getMonthlyEvolution() {
  return api.get('/dashboard/monthly-evolution');
}
