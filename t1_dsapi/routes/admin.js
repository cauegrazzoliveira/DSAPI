const express = require('express');
const router = express.Router();
const pool = require('../config/db');
//essa parte do isAdmin foi o gemini que arrumou(ele praicamente fez) sor, então vou deixar com os comentários mesmo kkkkkkkkk
const isAdmin = (req, res, next) => {
  const expectedSecret = process.env.ADMIN_SECRET_KEY;
  const receivedSecret = req.headers['x-admin-secret']; // Express normaliza os nomes dos headers para minúsculas

  // ---- INÍCIO DO DEBUG DA AUTENTICAÇÃO ADMIN ----
  console.log('--- DEBUG AUTENTICAÇÃO ADMIN ---');
  console.log('Segredo Esperado (do .env):', expectedSecret);
  console.log('Segredo Recebido (do header X-Admin-Secret no Postman):', receivedSecret);
  // ---- FIM DO DEBUG DA AUTENTICAÇÃO ADMIN ----

  if (!expectedSecret) {
      console.warn("AVISO: ADMIN_SECRET_KEY não está definida ou está vazia no arquivo .env. Verificando fallback...");
      // O fallback era 'SENHA_SUPER_SECRETA_ADMIN_FALLBACK' no código do guia.
      // Se você removeu o fallback, esta parte pode ser simplificada.
      // Vamos assumir que o fallback ainda existe como no guia:
      if (receivedSecret === 'SENHA_SUPER_SECRETA_ADMIN_FALLBACK') { 
          console.log('Match com o segredo de fallback!');
          return next();
      } else {
          console.log('Segredo recebido NÃO BATEU com o segredo de fallback.');
      }
  } else if (receivedSecret === expectedSecret) {
      console.log('Segredo do .env e do header BATEM!');
      return next();
  } else {
      console.log('Segredo do .env e do header NÃO BATEM.');
  }

  res.status(403).json({ message: 'Acesso negado. Apenas administradores. Verifique o header X-Admin-Secret e o console da API para debug.' });
};

router.post('/produtos', isAdmin, async (req, res, next) => {
  const { nome, preco, quantidade, categoria_id } = req.body;
  if (!nome || preco === undefined || quantidade === undefined || categoria_id === undefined) {
    return res.status(400).json({ message: 'Nome, preço, quantidade e ID da categoria são obrigatórios.' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO produtos (nome, preco, quantidade, categoria_id) VALUES (?, ?, ?, ?)',
      [nome, preco, quantidade, categoria_id]
    );
    res.status(201).json({ id: result.insertId, nome, preco, quantidade, categoria_id });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ message: `Categoria com id ${categoria_id} não encontrada.` });
    }
    next(error);
  }
});

router.put('/produtos/:id', isAdmin, async (req, res, next) => {
  const { id } = req.params;
  const { nome, preco, quantidade, categoria_id } = req.body;

  if (!nome && preco === undefined && quantidade === undefined && categoria_id === undefined) {
    return res.status(400).json({ message: 'Forneça ao menos um campo para atualizar.' });
  }

  try {
    let fieldsToUpdate = [];
    let values = [];
    if (nome !== undefined) { fieldsToUpdate.push('nome = ?'); values.push(nome); }
    if (preco !== undefined) { fieldsToUpdate.push('preco = ?'); values.push(preco); }
    if (quantidade !== undefined) { fieldsToUpdate.push('quantidade = ?'); values.push(quantidade); }
    if (categoria_id !== undefined) { fieldsToUpdate.push('categoria_id = ?'); values.push(categoria_id); }
    values.push(id); 

    const sql = `UPDATE produtos SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    res.json({ message: 'Produto atualizado com sucesso.' });
  } catch (error) {
     if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ message: `Categoria com id ${categoria_id} não encontrada ao tentar atualizar.` });
    }
    next(error);
  }
});

router.delete('/produtos/:id', isAdmin, async (req, res, next) => {
  const { id } = req.params;
  try {

    const [result] = await pool.execute('DELETE FROM produtos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    res.status(200).json({ message: 'Produto excluído com sucesso.' });
  } catch (error)
    { 
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'Não é possível excluir o produto pois ele está referenciado em um ou mais pedidos.' });
    }
    next(error);
  }
});

router.get('/pedidos', isAdmin, async (req, res, next) => {
    try {
        const [pedidos] = await pool.query(
            `SELECT p.id as pedido_id, p.horario, p.endereco, c.nome as cliente_nome,
                    (SELECT SUM(pp.preco * pp.quantidade) FROM pedidos_produtos pp WHERE pp.pedido_id = p.id) as valor_total
             FROM pedidos p
             JOIN clientes c ON p.cliente_id = c.id
             ORDER BY p.horario DESC`
        );
        res.json(pedidos);
    } catch (error) {
        next(error);
    }
});


module.exports = router;