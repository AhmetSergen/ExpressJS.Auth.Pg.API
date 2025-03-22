require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  database: 'AuthDB',
  schema: 'auth',
  logging: console.log, // Enable logging to debug SQL queries
});

sequelize
  .authenticate()
  .then(() => console.log('Connected to PostgreSQL using Sequelize'))
  .catch((err) => console.error('Unable to connect:', err));

module.exports = sequelize;
