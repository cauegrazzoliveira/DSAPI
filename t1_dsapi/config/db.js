require('dotenv').config();
// ---- DEBUG .env ----
console.log('DEBUG .env no db.js -> DB_USER:', process.env.DB_USER, '| DB_HOST:', process.env.DB_HOST);
// ---- FIM DEBUG .env ----
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


pool.getConnection()
  .then(connection => {
    console.log('Conectado ao banco de dados MySQL com sucesso!');
    connection.release();
  })
  .catch(err => {
    console.error('Erro ao conectar ao banco de dados:', err.stack);
    process.exit(1);
  });

module.exports = pool;