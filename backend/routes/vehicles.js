const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const ActivityLog = require('../models/ActivityLog');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = {};

    if (search) {
      where[require('sequelize').Op.or] = [
        { vehicleNumber: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { vehicleName: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const vehicles = await Vehicle.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
  }
});

// Get vehicle by ID with trips
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [{
        model: Trip,
        order: [['date', 'DESC']]
      }]
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch vehicle' });
  }
});

// Create vehicle
router.post('/', async (req, res) => {
  try {
    const { vehicleNumber, vehicleName, vehicleType, status, remarks } = req.body;

    if (!vehicleNumber || !vehicleName || !vehicleType) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const vehicle = await Vehicle.create({
      vehicleNumber,
      vehicleName,
      vehicleType,
      status: status || 'active',
      remarks
    });

    await ActivityLog.create({
      userId: req.userId,
      action: 'CREATE',
      entityType: 'Vehicle',
      entityId: vehicle.id,
      description: `Created vehicle ${vehicleNumber}`
    });

    res.status(201).json({ success: true, data: vehicle, message: 'Vehicle created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create vehicle' });
  }
});

// Update vehicle
router.put('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const { vehicleNumber, vehicleName, vehicleType, status, remarks } = req.body;
    
    Object.assign(vehicle, {
      vehicleNumber: vehicleNumber || vehicle.vehicleNumber,
      vehicleName: vehicleName || vehicle.vehicleName,
      vehicleType: vehicleType || vehicle.vehicleType,
      status: status || vehicle.status,
      remarks: remarks !== undefined ? remarks : vehicle.remarks
    });

    await vehicle.save();

    await ActivityLog.create({
      userId: req.userId,
      action: 'UPDATE',
      entityType: 'Vehicle',
      entityId: vehicle.id,
      description: `Updated vehicle ${vehicleNumber}`
    });

    res.json({ success: true, data: vehicle, message: 'Vehicle updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update vehicle' });
  }
});

// Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const vehicleNumber = vehicle.vehicleNumber;
    await vehicle.destroy();

    await ActivityLog.create({
      userId: req.userId,
      action: 'DELETE',
      entityType: 'Vehicle',
      entityId: req.params.id,
      description: `Deleted vehicle ${vehicleNumber}`
    });

    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete vehicle' });
  }
});

module.exports = router;
