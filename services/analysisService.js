const xlsx = require('xlsx');
const Papa = require('papaparse');
const path = require('path');
const sequelize = require('../db/database');
const Upload = require('../models/Upload');
const AnalysisResult = require('../models/AnalysisResult');

function lerArquivo(fileBuffer, originalName) {
  const fileExtension = path.extname(originalName).toLowerCase();
  
  if (fileExtension === '.csv') {
    const csvData = fileBuffer.toString('utf8');
    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
    return parsed.data;
  } else if (fileExtension === '.xls' || fileExtension === '.xlsx') {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet);
  } else {
    throw new Error('Formato de arquivo não suportado. Use CSV ou Excel.');
  }
}

function calcularEstatisticas(data) {
  const colunasObrigatorias = ['quantidade', 'preco_unitario', 'valor_total'];
  const stats = {};

  for (const col of colunasObrigatorias) {
    if (!data[0] || !data[0].hasOwnProperty(col)) {
      throw new Error(`Coluna obrigatória ausente no arquivo: '${col}'`);
    }
  }

  colunasObrigatorias.forEach(col => {
    const valores = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
    if (valores.length === 0) {
      stats[col] = { count: 0, min: 0, max: 0, sum: 0, mean: 0, median: 0, std: 0 };
      return;
    }

    const sum = valores.reduce((a, b) => a + b, 0);
    const mean = sum / valores.length;
    
    const sorted = [...valores].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    
    const std = Math.sqrt(valores.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / valores.length);

    stats[col] = {
      count: valores.length,
      min: Math.min(...valores),
      max: Math.max(...valores),
      sum: parseFloat(sum.toFixed(2)),
      mean: parseFloat(mean.toFixed(2)),
      median: parseFloat(median.toFixed(2)),
      std: parseFloat(std.toFixed(2))
    };
  });

  return stats;
}

async function analisarEArmazenar(file) {
  const transaction = await sequelize.transaction();
  try {
    const data = lerArquivo(file.buffer, file.originalname);
    if (data.length === 0) throw new Error('O arquivo está vazio ou em formato incorreto.');
    
    const stats = calcularEstatisticas(data);

    const upload = await Upload.create({
      fileName: file.originalname,
    }, { transaction });

    const resultsParaSalvar = Object.keys(stats).map(col => ({
      ...stats[col],
      columnName: col,
      UploadId: upload.id
    }));
    
    await AnalysisResult.bulkCreate(resultsParaSalvar, { transaction });

    await transaction.commit();
    return { uploadId: upload.id, fileName: upload.fileName, stats };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function listarArquivos() {
  return await Upload.findAll({
    attributes: ['id', 'fileName', 'createdAt'],
    order: [['createdAt', 'DESC']]
  });
}

async function buscarAnalisePorId(id) {
  return await Upload.findByPk(id, {
    include: {
      model: AnalysisResult,
      attributes: { exclude: ['id', 'UploadId', 'createdAt', 'updatedAt'] }
    }
  });
}

async function atualizarNomeArquivo(id, novoNome) {
    const upload = await Upload.findByPk(id);
    if (!upload) return null;
    
    upload.fileName = novoNome;
    await upload.save();
    return upload;
}

async function deletarAnalise(id) {
    const upload = await Upload.findByPk(id);
    if (!upload) return 0;
    
    await upload.destroy();
    return 1;
}

module.exports = {
  analisarEArmazenar,
  listarArquivos,
  buscarAnalisePorId,
  atualizarNomeArquivo,
  deletarAnalise
};