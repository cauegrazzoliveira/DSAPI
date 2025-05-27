require('dotenv').config();
const express = require('express');
const pool = require('./config/db'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const clienteRoutes = require('./routes/clientes');
console.log('--- DEBUGGING clienteRoutes ---');
console.log('Tipo de clienteRoutes:', typeof clienteRoutes);
console.log('clienteRoutes é uma função?', clienteRoutes instanceof Function);
if (typeof clienteRoutes === 'object' && clienteRoutes !== null) {
    console.log('Chaves do objeto clienteRoutes:', Object.keys(clienteRoutes));
}
console.log('Conteúdo de clienteRoutes (parcial):', String(clienteRoutes).substring(0, 200)); 
console.log('--- FIM DO DEBUGGING clienteRoutes ---');
const produtoRoutes = require('./routes/produtos');
const pedidoRoutes = require('./routes/pedidos');
const adminRoutes = require('./routes/admin'); 

app.use('/api/clientes', clienteRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/admin', adminRoutes); 

app.get('/', (req, res) => {
  res.send('API Loja DSAPI está no ar!');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Ocorreu um erro interno no servidor.', error: err.message });
});

app.use((req, res, next) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  if (pool) {
    console.log('Pool de conexão com o banco de dados está pronta.');
  } else {
    console.error('Pool de conexão com o banco de dados NÃO está disponível.');
  }
});