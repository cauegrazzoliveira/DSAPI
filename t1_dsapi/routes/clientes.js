const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/', async (req, res, next) => {
  const { nome, altura, nascimento, cidade_id } = req.body;

  if (!nome || !nascimento || !cidade_id) {
    return res.status(400).json({ message: 'Nome, data de nascimento e ID da cidade são obrigatórios.' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO clientes (nome, altura, nascimento, cidade_id) VALUES (?, ?, ?, ?)',
      [nome, altura, nascimento, cidade_id]
    );
    res.status(201).json({ id: result.insertId, nome, altura, nascimento, cidade_id });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ message: `Cidade com id ${cidade_id} não encontrada.` });
    }
    next(error); 
  }
});

router.get('/:clienteId/pedidos', async (req, res, next) => {
    const { clienteId } = req.params;
    try {
        const [pedidos] = await pool.query(
            `SELECT p.id, p.horario, p.endereco,
                    (SELECT SUM(pp.preco * pp.quantidade) FROM pedidos_produtos pp WHERE pp.pedido_id = p.id) as valor_total
             FROM pedidos p
             WHERE p.cliente_id = ?
             ORDER BY p.horario DESC`,
            [clienteId]
        );
        if (pedidos.length === 0) {
            return res.status(404).json({ message: 'Nenhum pedido encontrado para este cliente ou cliente não existe.' });
        }
        res.json(pedidos);
    } catch (error) {
        next(error);
    }
});

module.exports = router;