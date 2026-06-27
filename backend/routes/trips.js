const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const ActivityLog = require('../models/ActivityLog');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get all trips
router.get('/', async (req, res) => {
  try {
    const { vehicleId, fromDate, toDate } = req.query;
    const where = {};

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date[require('sequelize').Op.gte] = new Date(fromDate);
      if (toDate) where.date[require('sequelize').Op.lte] = new Date(toDate);
    }

    const trips = await Trip.findAll({
      where,
      include: [Vehicle],
      order: [['date', 'DESC']]
    });

    res.json({ success: true, data: trips });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch trips' });
  }
});

// Get trip by ID
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, { include: [Vehicle] });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    res.json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch trip' });
  }
});

// Get trips for a vehicle
router.get('/vehicle/:vehicleId', async (req, res) => {
  try {
    const trips = await Trip.findAll({
      where: { vehicleId: req.params.vehicleId },
      order: [['date', 'DESC']]
    });

    res.json({ success: true, data: trips });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch trips' });
  }
});

// Create trip
router.post('/', async (req, res) => {
  try {
    const { vehicleId, date, from, to, material, wage, remarks } = req.body;

    if (!vehicleId || !date || !from || !to || !material || wage === undefined) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const trip = await Trip.create({
      vehicleId,
      date: new Date(date),
      from,
      to,
      material,
      wage: parseFloat(wage),
      remarks
    });

    await ActivityLog.create({
      userId: req.userId,
      action: 'CREATE',
      entityType: 'Trip',
      entityId: trip.id,
      description: `Created trip for vehicle ${vehicle.vehicleNumber}`
    });

    res.status(201).json({ success: true, data: trip, message: 'Trip created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create trip' });
  }
});

// Update trip
router.put('/:id', async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const { date, from, to, material, wage, remarks } = req.body;
    
    Object.assign(trip, {
      date: date ? new Date(date) : trip.date,
      from: from || trip.from,
      to: to || trip.to,
      material: material || trip.material,
      wage: wage !== undefined ? parseFloat(wage) : trip.wage,
      remarks: remarks !== undefined ? remarks : trip.remarks
    });

    await trip.save();

    await ActivityLog.create({
      userId: req.userId,
      action: 'UPDATE',
      entityType: 'Trip',
      entityId: trip.id,
      description: `Updated trip ${trip.id}`
    });

    res.json({ success: true, data: trip, message: 'Trip updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update trip' });
  }
});

// Delete trip
router.delete('/:id', async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    await trip.destroy();

    await ActivityLog.create({
      userId: req.userId,
      action: 'DELETE',
      entityType: 'Trip',
      entityId: req.params.id,
      description: `Deleted trip`
    });

    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete trip' });
  }
});

module.exports = router;
