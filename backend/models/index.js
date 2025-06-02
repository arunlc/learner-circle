const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite::memory:', {
  dialect: process.env.NODE_ENV === 'production' ? 'postgres' : 'sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

const User = require('./User')(sequelize);
const Course = require('./Course')(sequelize);
const Batch = require('./Batch')(sequelize);
const Session = require('./Session')(sequelize);
const Enrollment = require('./Enrollment')(sequelize);

// Define associations
User.hasMany(Batch, { as: 'TutoredBatches', foreignKey: 'tutorId' });
User.hasMany(Enrollment, { foreignKey: 'studentId' });

Course.hasMany(Batch, { foreignKey: 'courseId' });

Batch.belongsTo(User, { as: 'Tutor', foreignKey: 'tutorId' });
Batch.belongsTo(Course, { foreignKey: 'courseId' });
Batch.hasMany(Session, { foreignKey: 'batchId' });
Batch.hasMany(Enrollment, { foreignKey: 'batchId' });

Session.belongsTo(Batch, { foreignKey: 'batchId' });
Session.belongsTo(User, { as: 'Tutor', foreignKey: 'tutorId' });

Enrollment.belongsTo(User, { as: 'Student', foreignKey: 'studentId' });
Enrollment.belongsTo(Batch, { foreignKey: 'batchId' });

module.exports = {
  sequelize,
  User,
  Course,
  Batch,
  Session,
  Enrollment
};