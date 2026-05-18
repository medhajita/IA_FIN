import api from './api';

export function getSummary(month) {
  return api.get('/dashboard/summary', { params: month ? { month } : {} });
}

export function getByCategory(month, from, to) {
  const params = {};
  if (from && to) { params.from = from; params.to = to; }
  else if (month) { params.month = month; }
  return api.get('/dashboard/by-category', { params });
}

export function getMonthlyEvolution() {
  return api.get('/dashboard/monthly-evolution');
}
