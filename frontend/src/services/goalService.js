import api from './api';

export const createGoal      = (data)         => api.post('/goals', data);
export const getGoals        = ()              => api.get('/goals');
export const updateGoal      = (id, data)      => api.patch(`/goals/${id}`, data);
export const deleteGoal      = (id)            => api.delete(`/goals/${id}`);
export const contributeToGoal = (id, amount)   => api.post(`/goals/${id}/contribute`, { amount });
