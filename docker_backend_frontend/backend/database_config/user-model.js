const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  business_sphere: {
    type: DataTypes.STRING,
    allowNull: true
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true
  },
  desc: {
    type: DataTypes.STRING,
    allowNull: true
  },
  watchedOnboarding: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: false
  },

},
{
  tableName: 'users', 
  timestamps: true    
});

module.exports = User;