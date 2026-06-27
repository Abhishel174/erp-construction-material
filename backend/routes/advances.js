const express = require('express');
const router = express.Router();
const DriverAdvance = require('../models/DriverAdvance');
const Driver = require('../models/Driver');
const ActivityLog = require('../models/ActivityLog');
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');

router.use(authMiddleware);

// Get all advances
router.get('/', async (req, res) => {
  try {
    const { driverId, status } = req.query;
    const where = {};

    if (driverId) {
      where.driverId = driverId;
    }

    if (status) {
      where.status = status;
    }

    const advances = await DriverAdvance.findAll({
      where,
      include: [Driver],
      order: [['date', 'DESC']]
    });

    res.json({ success: true, data: advances });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch advances' });
  }
});

// Get advance by ID
router.get('/:id', async (req, res) => {
  try {
    const advance = await DriverAdvance.findByPk(req.params.id, { include: [Driver] });

    if (!advance) {
      return res.status(404).json({ success: false, message: 'Advance not found' });
    }

    res.json({ success: true, data: advance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch advance' });
  }
});

// Create advance
router.post('/', async (req, res) => {
  try {
    const { driverId, advanceAmount, date, remarks } = req.body;

    if (!driverId || advanceAmount === undefined) {
      return res.status(400).json({ success: false, message: 'Driver and amount required' });
    }

    const driver = await Driver.findByPk(driverId);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const advance = await DriverAdvance.create({
      driverId,
      advanceAmount: parseFloat(advanceAmount),
      date: date ? new Date(date) : new Date(),
      remarks,
      status: 'pending'
    });

    await ActivityLog.create({
      userId: req.userId,
      action: 'CREATE',
      entityType: 'DriverAdvance',
      entityId: advance.id,
      description: `Created advance for driver ${driver.driverName}`
    });

    res.status(201).json({ success: true, data: advance, message: 'Advance created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create advance' });
  }
});

// Update advance
router.put('/:id', async (req, res) => {
  try {
    const advance = await DriverAdvance.findByPk(req.params.id);

    if (!advance) {
      return res.status(404).json({ success: false, message: 'Advance not found' });
    }

    const { advanceAmount, date, status, remarks } = req.body;
    
    Object.assign(advance, {
      advanceAmount: advanceAmount !== undefined ? parseFloat(advanceAmount) : advance.advanceAmount,
      date: date ? new Date(date) : advance.date,
      status: status || advance.status,
      remarks: remarks !== undefined ? remarks : advance.remarks
    });

    await advance.save();

    await ActivityLog.create({
      userId: req.userId,
      action: 'UPDATE',
      entityType: 'DriverAdvance',
      entityId: advance.id,
      description: `Updated advance ${advance.id}`
    });

    res.json({ success: true, data: advance, message: 'Advance updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update advance' });
  }
});

// Delete advance
router.delete('/:id', async (req, res) => {
  try {
    const advance = await DriverAdvance.findByPk(req.params.id);

    if (!advance) {
      return res.status(404).json({ success: false, message: 'Advance not found' });
    }

    await advance.destroy();

    await ActivityLog.create({
      userId: req.userId,
      action: 'DELETE',
      entityType: 'DriverAdvance',
      entityId: req.params.id,
      description: `Deleted advance`
    });

    res.json({ success: true, message: 'Advance deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete advance' });
  }
});

module.exports = router;
