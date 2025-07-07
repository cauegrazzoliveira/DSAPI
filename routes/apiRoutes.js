const router = require('express').Router();
const multer = require('multer');
const {
  analisarEArmazenar,
  listarArquivos,
  buscarAnalisePorId,
  atualizarNomeArquivo,
  deletarAnalise
} = require('../services/analysisService');

const isLoggedIn = (req, res, next) => {
  if (req.user) {
    return next(); 
  }
  res.status(401).json({ error: 'Não autorizado. Faça login primeiro em /auth/google' });
};

router.use(require('express').json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

router.get('/debug/session', (req, res) => {
  console.log('--- DEBUGGING SESSION ---');
  console.log('Objeto da Sessão (req.session):', req.session);
  console.log('Objeto de Usuário (req.user):', req.user);
  console.log('ID da Sessão (req.sessionID):', req.sessionID);
  console.log('-------------------------');

  res.json({
    message: 'Informações de debug impressas no console do servidor.',
    isUserLoggedIn: !!req.user,
    userObject: req.user || 'Nenhum usuário encontrado na sessão.',
    sessionID: req.sessionID
  });
});

router.post('/upload', isLoggedIn, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  try {
    const resultado = await analisarEArmazenar(req.file);
    res.status(201).json(resultado);
  } catch (error) {
    console.error('Erro no upload:', error.message);
    res.status(400).json({ error: error.message });
  }
});

router.get('/files', isLoggedIn, async (req, res) => {
  try {
    const arquivos = await listarArquivos();
    res.status(200).json({ user: req.user.displayName, files: arquivos });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar arquivos.' });
  }
});

router.get('/files/:id', isLoggedIn, async (req, res) => {
  try {
    const analise = await buscarAnalisePorId(req.params.id);
    if (!analise) {
      return res.status(404).json({ error: 'Análise não encontrada.' });
    }
    res.status(200).json(analise);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar análise.' });
  }
});

router.put('/files/:id', isLoggedIn, async (req, res) => {
    const { novoNome } = req.body;
    if (!novoNome) {
        return res.status(400).json({ error: 'O campo "novoNome" é obrigatório no corpo da requisição.' });
    }
    try {
        const resultado = await atualizarNomeArquivo(req.params.id, novoNome);
        if (!resultado) {
            return res.status(404).json({ error: 'Análise não encontrada.' });
        }
        res.status(200).json({ message: 'Nome do arquivo atualizado com sucesso.', upload: resultado });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar o nome do arquivo.' });
    }
});

router.delete('/files/:id', isLoggedIn, async (req, res) => {
    try {
        const resultado = await deletarAnalise(req.params.id);
        if (resultado === 0) {
            return res.status(404).json({ error: 'Análise não encontrada.' });
        }
        res.status(200).json({ message: 'Análise deletada com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar análise.' });
    }
});

module.exports = router;