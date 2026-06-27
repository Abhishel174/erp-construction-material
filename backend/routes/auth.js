const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { hashPassword, comparePassword, generateToken } = require('../config/auth');
const ActivityLog = require('../models/ActivityLog');

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    await ActivityLog.create({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      description: `User ${username} logged in`
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Verify token
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const { verifyToken } = require('../config/auth');
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const user = await User.findByPk(decoded.userId);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const { userId } = req.body;
    const { oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isValidPassword = await comparePassword(oldPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Old password incorrect' });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    await ActivityLog.create({
      userId: user.id,
      action: 'CHANGE_PASSWORD',
      entityType: 'User',
      entityId: user.id,
      description: 'User changed password'
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Password change failed' });
  }
});

module.exports = router;
