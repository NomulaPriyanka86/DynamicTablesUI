const { Sequelize } = require('sequelize');
const config = require('./config.json');

const sequelize = new Sequelize({
  username: config.username,
  password: config.password,
  database: config.database,
  host: config.host,
  port: config.port,
  dialect: 'postgres',
  logging: false // Disable logging; default: console.log
});

module.exports = sequelize;
