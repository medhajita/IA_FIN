import api from './api';

export const askQuestion = (question) => api.post('/chatbot/ask', { question });
