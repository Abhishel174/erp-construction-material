const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Driver = require('./Driver');

const DriverAdvance = sequelize.define('DriverAdvance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  driverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Driver,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  advanceAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pending', 'settled', 'partial'),
    defaultValue: 'pending'
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
  tableName: 'DriverAdvances',
  timestamps: true
});

Driver.hasMany(DriverAdvance, { foreignKey: 'driverId', onDelete: 'CASCADE' });
DriverAdvance.belongsTo(Driver, { foreignKey: 'driverId' });

module.exports = DriverAdvance;
