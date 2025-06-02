const { Sequelize } = require('sequelize');

// Use PostgreSQL for production, fallback for development
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://localhost:5432/learner_circle_dev',
  {
    dialect: 'postgres',
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {},
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Import models
const User = require('./User')(sequelize);
const Course = require('./Course')(sequelize);
const Batch = require('./Batch')(sequelize);
const Session = require('./Session')(sequelize);
const Enrollment = require('./Enrollment')(sequelize);

// Define associations
User.hasMany(Batch, { 
  as: 'TutoredBatches', 
  foreignKey: 'current_tutor_id' 
});

User.hasMany(Session, { 
  as: 'TutoredSessions', 
  foreignKey: 'assigned_tutor_id' 
});

User.hasMany(Enrollment, { 
  as: 'Enrollments', 
  foreignKey: 'student_id' 
});

Course.hasMany(Batch, { 
  foreignKey: 'course_id' 
});

Batch.belongsTo(User, { 
  as: 'Tutor', 
  foreignKey: 'current_tutor_id' 
});

Batch.belongsTo(Course, { 
  foreignKey: 'course_id' 
});

Batch.hasMany(Session, { 
  foreignKey: 'batch_id' 
});

Batch.hasMany(Enrollment, { 
  foreignKey: 'batch_id' 
});

Session.belongsTo(Batch, { 
  foreignKey: 'batch_id' 
});

Session.belongsTo(User, { 
  as: 'Tutor', 
  foreignKey: 'assigned_tutor_id' 
});

Enrollment.belongsTo(User, { 
  as: 'Student', 
  foreignKey: 'student_id' 
});

Enrollment.belongsTo(Batch, { 
  foreignKey: 'batch_id' 
});

module.exports = {
  sequelize,
  User,
  Course,
  Batch,
  Session,
  Enrollment
};
