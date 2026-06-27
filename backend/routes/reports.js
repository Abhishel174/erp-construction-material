const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const DriverAdvance = require('../models/DriverAdvance');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');

router.use(authMiddleware);

// Daily report
router.get('/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(reportDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(reportDate.setHours(23, 59, 59, 999));

    const trips = await Trip.findAll({
      where: {
        date: { [Op.between]: [startOfDay, endOfDay] }
      },
      include: [Vehicle]
    });

    const totalWage = trips.reduce((sum, trip) => sum + parseFloat(trip.wage), 0);
    const totalTrips = trips.length;

    res.json({
      success: true,
      data: {
        date: reportDate.toISOString().split('T')[0],
        totalTrips,
        totalWage,
        trips
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch daily report' });
  }
});

// Monthly report
router.get('/monthly', async (req, res) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const reportYear = parseInt(year) || now.getFullYear();
    const reportMonth = parseInt(month) || now.getMonth();

    const startOfMonth = new Date(reportYear, reportMonth, 1);
    const endOfMonth = new Date(reportYear, reportMonth + 1, 0, 23, 59, 59, 999);

    const trips = await Trip.findAll({
      where: {
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      include: [Vehicle]
    });

    const totalWage = trips.reduce((sum, trip) => sum + parseFloat(trip.wage), 0);
    const totalTrips = trips.length;
    const vehicleCount = new Set(trips.map(t => t.vehicleId)).size;

    res.json({
      success: true,
      data: {
        year: reportYear,
        month: reportMonth + 1,
        totalTrips,
        totalWage,
        vehicleCount,
        trips
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch monthly report' });
  }
});

// Vehicle-wise report
router.get('/vehicle-wise', async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const where = {};

    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date[Op.gte] = new Date(fromDate);
      if (toDate) where.date[Op.lte] = new Date(toDate);
    }

    const trips = await Trip.findAll({
      where,
      include: [Vehicle],
      order: [['vehicleId', 'ASC']]
    });

    const vehicleReport = {};
    trips.forEach(trip => {
      const vehicleId = trip.vehicleId;
      if (!vehicleReport[vehicleId]) {
        vehicleReport[vehicleId] = {
          vehicle: trip.Vehicle,
          totalTrips: 0,
          totalWage: 0,
          trips: []
        };
      }
      vehicleReport[vehicleId].totalTrips++;
      vehicleReport[vehicleId].totalWage += parseFloat(trip.wage);
      vehicleReport[vehicleId].trips.push(trip);
    });

    res.json({ success: true, data: Object.values(vehicleReport) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch vehicle-wise report' });
  }
});

// Material-wise report
router.get('/material-wise', async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const where = {};

    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date[Op.gte] = new Date(fromDate);
      if (toDate) where.date[Op.lte] = new Date(toDate);
    }

    const trips = await Trip.findAll({ where });

    const materialReport = {};
    trips.forEach(trip => {
      const material = trip.material;
      if (!materialReport[material]) {
        materialReport[material] = {
          material,
          totalTrips: 0,
          totalWage: 0,
          trips: []
        };
      }
      materialReport[material].totalTrips++;
      materialReport[material].totalWage += parseFloat(trip.wage);
      materialReport[material].trips.push(trip);
    });

    res.json({ success: true, data: Object.values(materialReport) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch material-wise report' });
  }
});

// Driver advance report
router.get('/advances', async (req, res) => {
  try {
    const advances = await DriverAdvance.findAll({
      include: [Driver],
      order: [['date', 'DESC']]
    });

    const totalAdvance = advances.reduce((sum, adv) => sum + parseFloat(adv.advanceAmount), 0);

    res.json({
      success: true,
      data: {
        totalAdvance,
        advances
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch advance report' });
  }
});

module.exports = router;
