const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model'); // Import User model for the association

class UserToken extends Model {}

UserToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      field: 'user_id', // Maps to the actual database column
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User, // Foreign key references `auth.tb_users`
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    refreshToken: {
      field: 'refresh_token', // Maps to the actual database column
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'UserToken',
    tableName: 'tb_users_tokens',
    schema: 'auth',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // `updatedAt` is not needed as per your SQL schema
  }
);

// Define association
User.hasMany(UserToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserToken.belongsTo(User, { foreignKey: 'userId' });

module.exports = UserToken;
