const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function register(req, res) {
  try {
    const { first_name, last_name, phone, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'First name, last name, email and password are required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ first_name, last_name, phone: phone || null, email, password_hash });

    return res.status(201).json({
      message: 'Account created successfully',
      data: { user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email } },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const name = `${user.first_name} ${user.last_name}`;
    const token = jwt.sign(
      { id: user.id, email: user.email, name, first_name: user.first_name, last_name: user.last_name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      data: { token, user: { id: user.id, name, first_name: user.first_name, last_name: user.last_name, email: user.email, phone: user.phone } },
      message: 'Login successful',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getProfile(req, res) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'first_name', 'last_name', 'phone', 'email', 'created_at'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ data: { user } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { phone, current_password, new_password } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updates = {};

    if (phone !== undefined) {
      updates.phone = phone || null;
    }

    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Current password is required to set a new password' });
      }
      const valid = await bcrypt.compare(current_password, user.password_hash);
      if (!valid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      updates.password_hash = await bcrypt.hash(new_password, 10);
    }

    await user.update(updates);

    return res.status(200).json({
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { register, login, getProfile, updateProfile };
