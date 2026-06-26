const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Roles', key: 'id' },
  },
  first_name: { type: DataTypes.STRING(50), allowNull: false },
  last_name: { type: DataTypes.STRING(50), allowNull: false },
  status: { type: DataTypes.ENUM('active', 'disabled'), defaultValue: 'active' },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Departments', key: 'id' },
  },
  phone: { type: DataTypes.STRING(20), allowNull: true },
}, {
  timestamps: true,
  tableName: 'users',
});

module.exports = User;
