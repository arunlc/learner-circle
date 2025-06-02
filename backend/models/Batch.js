const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Batch = sequelize.define('Batch', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // TODO: Add specific fields for Batch
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  return Batch;
};