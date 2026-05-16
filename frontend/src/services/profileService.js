import api from './api';

export function getProfile() {
  return api.get('/auth/profile');
}

export function updateProfile(data) {
  return api.put('/auth/profile', data);
}
