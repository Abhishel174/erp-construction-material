const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const ActivityLog = require('../models/ActivityLog');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get all drivers
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = {};

    if (search) {
      where[require('sequelize').Op.or] = [
        { driverName: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { phoneNumber: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const drivers = await Driver.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch drivers' });
  }
});

// Get driver by ID
router.get('/:id', async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch driver' });
  }
});

// Create driver
router.post('/', async (req, res) => {
  try {
    const { driverName, phoneNumber, address, citizenshipNumber, licenseNumber, joiningDate, status, notes } = req.body;

    if (!driverName || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'Name and phone number required' });
    }

    const driver = await Driver.create({
      driverName,
      phoneNumber,
      address,
      citizenshipNumber,
      licenseNumber,
      joiningDate,
      status: status || 'active',
      notes
    });

    await ActivityLog.create({
      userId: req.userId,
      action: 'CREATE',
      entityType: 'Driver',
      entityId: driver.id,
      description: `Created driver ${driverName}`
    });

    res.status(201).json({ success: true, data: driver, message: 'Driver created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create driver' });
  }
});

// Update driver
router.put('/:id', async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const { driverName, phoneNumber, address, citizenshipNumber, licenseNumber, joiningDate, status, notes } = req.body;
    
    Object.assign(driver, {
      driverName: driverName || driver.driverName,
      phoneNumber: phoneNumber || driver.phoneNumber,
      address: address !== undefined ? address : driver.address,
      citizenshipNumber: citizenshipNumber !== undefined ? citizenshipNumber : driver.citizenshipNumber,
      licenseNumber: licenseNumber !== undefined ? licenseNumber : driver.licenseNumber,
      joiningDate: joiningDate || driver.joiningDate,
      status: status || driver.status,
      notes: notes !== undefined ? notes : driver.notes
    });

    await driver.save();

    await ActivityLog.create({
      userId: req.userId,
      action: 'UPDATE',
      entityType: 'Driver',
      entityId: driver.id,
      description: `Updated driver ${driverName}`
    });

    res.json({ success: true, data: driver, message: 'Driver updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update driver' });
  }
});

// Delete driver
router.delete('/:id', async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const driverName = driver.driverName;
    await driver.destroy();

    await ActivityLog.create({
      userId: req.userId,
      action: 'DELETE',
      entityType: 'Driver',
      entityId: req.params.id,
      description: `Deleted driver ${driverName}`
    });

    res.json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete driver' });
  }
});

module.exports = router;
