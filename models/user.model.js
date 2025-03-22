const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
        len: [4, 255], // Adjusted to match SQL VARCHAR(255)
      },
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
      },
    },
    emailConfirmed: {
      field: 'email_confirmed', // Maps to the actual database column
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    emailToken: {
      field: 'email_token', // Maps to the actual database column
      type: DataTypes.UUID, // Matches `UUID` type in PostgreSQL
      allowNull: true,
    },
    passwordResetToken: {
      field: 'password_reset_token', // Maps to the actual database column
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    passwordResetProvisional: {
      field: 'password_reset_provisional', // Maps to the actual database column
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    passwordResetExpiry: {
      field: 'password_reset_expiry', // Maps to the actual database column
      type: DataTypes.DATE, // Matches `TIMESTAMP` in PostgreSQL
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'tb_users',
    schema: 'auth',
    timestamps: true, // Automatically handles `createdAt` and `updatedAt`
    createdAt: 'created_at', // Matches the PostgreSQL column name
    updatedAt: 'updated_at',
  }
);

module.exports = User;
