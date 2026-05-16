/*
 * Auth Routes — POST /api/auth/register, POST /api/auth/login, GET /api/auth/profile
 *
 * POST /api/auth/register
 *   Body:    { "name": "Alice", "email": "alice@example.com", "password": "secret123" }
 *   201:     { "message": "Account created successfully", "data": { "user": { "id", "name", "email" } } }
 *   400:     { "error": "Email already in use" }
 *
 * POST /api/auth/login
 *   Body:    { "email": "alice@example.com", "password": "secret123" }
 *   200:     { "data": { "token": "<jwt>", "user": { "id", "name", "email" } }, "message": "Login successful" }
 *   401:     { "error": "Invalid email or password" }
 *
 * GET /api/auth/profile
 *   Header:  Authorization: Bearer <token>
 *   200:     { "data": { "user": { "id", "name", "email", "created_at" } } }
 *   401:     { "error": "Access token required" }
 */

const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/auth.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
