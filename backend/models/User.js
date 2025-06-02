const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'tutor', 'student', 'parent'),
      allowNull: false,
      defaultValue: 'student'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [10, 20]
      }
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'Asia/Kolkata'
    },
    profile_data: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['email']
      },
      {
        fields: ['role']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  // Instance methods
  User.prototype.getSecureProfile = function(viewerRole = null) {
    const baseInfo = {
      id: this.id,
      first_name: this.first_name,
      role: this.role,
      is_active: this.is_active,
      timezone: this.timezone,
      created_at: this.created_at
    };

    // Only show full info to admin or self
    if (viewerRole === 'admin' || viewerRole === 'self') {
      return {
        ...baseInfo,
        email: this.email,
        last_name: this.last_name,
        phone: this.phone,
        profile_data: this.profile_data,
        last_login: this.last_login
      };
    }

    // Limited info for others (contact privacy)
    return {
      ...baseInfo,
      last_name: this.last_name ? this.last_name[0] + '.' : '',
      display_name: `${this.first_name} ${this.last_name ? this.last_name[0] + '.' : ''}`
    };
  };

  // Class methods
  User.associate = function(models) {
    // Tutor associations
    User.hasMany(models.Batch, { 
      as: 'TutoredBatches', 
      foreignKey: 'current_tutor_id' 
    });
    
    User.hasMany(models.Session, { 
      as: 'TutoredSessions', 
      foreignKey: 'assigned_tutor_id' 
    });

    // Student associations
    User.hasMany(models.Enrollment, { 
      as: 'Enrollments', 
      foreignKey: 'student_id' 
    });
  };

  return User;
};
