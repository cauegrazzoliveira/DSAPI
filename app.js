const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
require('dotenv').config(); 

require('./config/passport-setup'); 

const sequelize = require('./db/database');

const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');

const Upload = require('./models/Upload');
const AnalysisResult = require('./models/AnalysisResult');

const app = express();
const PORT = 3000;

Upload.hasMany(AnalysisResult, { onDelete: 'CASCADE' });
AnalysisResult.belongsTo(Upload);

app.use(cookieParser()); 
app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.send('<h1>API de Análise de Vendas</h1><a href="/auth/google">Fazer Login com Google</a>');
});


app.use('/auth', authRoutes); 
app.use('/api', apiRoutes);   

sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Servidor rodando na porta ${PORT}`);
        console.log(`➡️  Acesse http://localhost:${PORT} para começar.`);
    });
}).catch(err => {
    console.error('❌ Erro ao sincronizar com o banco de dados:', err);
});