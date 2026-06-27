const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const authMiddleware = require('../middleware/auth');
const { hashPassword } = require('../config/auth');

router.use(authMiddleware);

// Get settings
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        companyName: 'Ichhya Kamana Suppliers'
      });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// Update settings
router.put('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      await settings.update(req.body);
    }

    await ActivityLog.create({
      userId: req.userId,
      action: 'UPDATE',
      entityType: 'Settings',
      entityId: settings.id,
      description: 'Updated system settings'
    });

    res.json({ success: true, data: settings, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { comparePassword } = require('../config/auth');
    const isValid = await comparePassword(oldPassword, user.password);

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    await ActivityLog.create({
      userId: req.userId,
      action: 'CHANGE_PASSWORD',
      entityType: 'User',
      entityId: user.id,
      description: 'Changed password'
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

module.exports = router;
