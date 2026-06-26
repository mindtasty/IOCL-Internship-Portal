const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Departments', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM(
      'Draft',
      'Submitted',
      'Under HR Review',
      'Modification Requested',
      'Resubmitted',
      'Forwarded To HOD',
      'Under HOD Review',
      'HOD Approved',
      'Mentor Assigned',
      'Forwarded To L&D',
      'Under L&D Review',
      'L&D Approved',
      'Internship Active',
      'Internship Completed',
      'Rejected'
    ),
    defaultValue: 'Draft',
  },
  company_name: { type: DataTypes.STRING(150), allowNull: false },
  internship_title: { type: DataTypes.STRING(100), allowNull: false },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
  remarks: { type: DataTypes.TEXT, allowNull: true },
}, {
  timestamps: true,
  tableName: 'applications',
});

module.exports = Application;
