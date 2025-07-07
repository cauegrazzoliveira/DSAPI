const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,      
  process.env.DB_USER,      
  process.env.DB_PASSWORD,  
  {
    host: process.env.DB_HOST, 
    dialect: 'mysql'         
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexão com o banco de dados MySQL estabelecida com sucesso.');
  })
  .catch(err => {
    console.error('❌ Não foi possível conectar ao banco de dados:', err);
  });

module.exports = sequelize;