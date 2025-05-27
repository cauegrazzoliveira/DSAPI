const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/', async (req, res, next) => {
  const { cliente_id, endereco, produtos_pedido } = req.body;

  if (!cliente_id || !endereco || !Array.isArray(produtos_pedido) || produtos_pedido.length === 0) {
    return res.status(400).json({ message: 'Dados do pedido incompletos ou inválidos.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const horario = new Date();
    const [pedidoResult] = await connection.execute(
      'INSERT INTO pedidos (cliente_id, horario, endereco) VALUES (?, ?, ?)',
      [cliente_id, horario, endereco]
    );
    const pedidoId = pedidoResult.insertId;

    let valorTotalPedido = 0;
    for (const item of produtos_pedido) {
      const { produto_id, quantidade: quantidadePedida } = item;


      const [produtoRows] = await connection.execute('SELECT preco, quantidade FROM produtos WHERE id = ? FOR UPDATE', [produto_id]); 
      if (produtoRows.length === 0) {
        await connection.rollback();
        return res.status(400).json({ message: `Produto com ID ${produto_id} não encontrado.` });
      }
      const produtoAtual = produtoRows[0];

      if (produtoAtual.quantidade < quantidadePedida) {
        await connection.rollback();
        return res.status(400).json({ message: `Estoque insuficiente para o produto ID ${produto_id}. Disponível: ${produtoAtual.quantidade}` });
      }

      const precoUnitario = produtoAtual.preco;
      valorTotalPedido += precoUnitario * quantidadePedida;

      await connection.execute(
        'INSERT INTO pedidos_produtos (pedido_id, produto_id, preco, quantidade) VALUES (?, ?, ?, ?)',
        [pedidoId, produto_id, precoUnitario, quantidadePedida]
      );

      const novoEstoque = produtoAtual.quantidade - quantidadePedida;
      await connection.execute(
        'UPDATE produtos SET quantidade = ? WHERE id = ?',
        [novoEstoque, produto_id]
      );
    }

    await connection.commit();
    res.status(201).json({
      message: 'Pedido realizado com sucesso!',
      pedidoId: pedidoId,
      cliente_id: cliente_id,
      endereco: endereco,
      horario: horario,
      valor_total_calculado: valorTotalPedido, 
      itens: produtos_pedido
    });

  } catch (error) {
    if (connection) await connection.rollback();
    if (error.code === 'ER_NO_REFERENCED_ROW_2' && error.message.includes('fk_pedidos_clientes')) {
        return res.status(400).json({ message: `Cliente com id ${cliente_id} não encontrado.` });
    }
    next(error);
  } finally {
    if (connection) connection.release();
  }
});


router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const [pedidoRows] = await pool.query(
            `SELECT p.id as pedido_id, p.horario, p.endereco, c.id as cliente_id, c.nome as cliente_nome
             FROM pedidos p
             JOIN clientes c ON p.cliente_id = c.id
             WHERE p.id = ?`,
            [id]
        );

        if (pedidoRows.length === 0) {
            return res.status(404).json({ message: 'Pedido não encontrado.' });
        }

        const [itensPedidoRows] = await pool.query(
            `SELECT pp.produto_id, pr.nome as produto_nome, pp.quantidade, pp.preco as preco_unitario_pedido
             FROM pedidos_produtos pp
             JOIN produtos pr ON pp.produto_id = pr.id
             WHERE pp.pedido_id = ?`,
            [id]
        );

        const pedidoDetalhado = {
            ...pedidoRows[0],
            itens: itensPedidoRows
        };

        res.json(pedidoDetalhado);
    } catch (error) {
        next(error);
    }
});


module.exports = router;