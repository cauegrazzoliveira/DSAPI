const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
        `SELECT p.id, p.nome, p.preco, p.quantidade, c.nome as categoria_nome
         FROM produtos p
         LEFT JOIN categorias c ON p.categoria_id = c.id
         WHERE p.quantidade > 0` 
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
        `SELECT p.id, p.nome, p.preco, p.quantidade, c.nome as categoria_nome
         FROM produtos p
         LEFT JOIN categorias c ON p.categoria_id = c.id
         WHERE p.id = ?`, [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;