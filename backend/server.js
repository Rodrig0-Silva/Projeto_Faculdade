const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/estoque', {
  // useNewUrlParser e useUnifiedTopology não são mais necessários nas versões recentes
});

const Produto = mongoose.model('Produto', new mongoose.Schema({
  nome: String,
  sku: String,
  descricao: String,
  quantidade: Number,
  marca: String,
  preco: Number,
  cor: String,
  imagem: String, // URL ou base64
  tipo: String    // novo campo para tipo
}));

const Saida = mongoose.model('Saida', new mongoose.Schema({
  produto: String, // pode ser ObjectId se quiser referenciar Produto
  quantidade: Number,
  data: { type: Date, default: Date.now }
}));

// Rota para registrar uma saída
app.post('/saidas', async (req, res) => {
  try {
    const { produto, quantidade } = req.body;
    // Registra a saída normalmente
    const saida = new Saida({ produto, quantidade });
    await saida.save();

    // Reduz o estoque do produto
    const prod = await Produto.findById(produto);
    if (!prod) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    if (prod.quantidade < quantidade) {
      return res.status(400).json({ error: 'Estoque insuficiente' });
    }
    prod.quantidade -= quantidade;
    await prod.save();

    res.json(saida);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar saída' });
  }
});


app.get('/', (req, res) => {
  res.send('API do Estoque funcionando!');
});

// Rota para listar todas as saídas
app.get('/saidas', async (req, res) => {
  try {
    const saidas = await Saida.find();
    res.json(saidas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar saídas' });
  }
});

app.get('/produtos', async (req, res) => {
  const produtos = await Produto.find();
  res.json(produtos);
});

app.post('/produtos', async (req, res) => {
  try {
    const produto = new Produto(req.body);
    await produto.save();
    res.json(produto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar produto' });
  }
});

app.listen(3001, () => {
  console.log('Servidor rodando em http://localhost:3001');
});