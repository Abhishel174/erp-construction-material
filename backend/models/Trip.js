const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Vehicle = require('./Vehicle');

const Trip = sequelize.define('Trip', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Vehicle,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  from: {
    type: DataTypes.STRING,
    allowNull: false
  },
  to: {
    type: DataTypes.STRING,
    allowNull: false
  },
  material: {
    type: DataTypes.STRING,
    allowNull: false
  },
  wage: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Trips',
  timestamps: true
});

Vehicle.hasMany(Trip, { foreignKey: 'vehicleId', onDelete: 'CASCADE' });
Trip.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

module.exports = Trip;
