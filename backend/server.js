import express from 'express';
import axios from 'axios';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(express.json());
app.use(cors());

// --- CONEXÃO COM O BANCO DE DADOS ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado ao MongoDB.'))
    .catch(err => console.error('Erro ao conectar com o MongoDB:', err));

// --- DEFINIÇÃO DOS SCHEMAS E MODELS ---
const ProdutoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    descricao: String,
    preco: { type: Number, required: true },
    quantidade: { type: Number, default: 0 },
    imagem: String,
    tipo: String
}, { timestamps: true });
const Produto = mongoose.model('Produto', ProdutoSchema);

const FornecedorSchema = new mongoose.Schema({
    empresa: { type: String, required: true },
    cnpj: { type: String, required: true, unique: true },
    endereco: String,
    telefone: String,
    email: String,
    contato: String
}, { timestamps: true });
const Fornecedor = mongoose.model('Fornecedor', FornecedorSchema);

const SaidaSchema = new mongoose.Schema({
    produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true },
    quantidade: { type: Number, required: true }
}, { timestamps: true });
const Saida = mongoose.model('Saida', SaidaSchema);

// == ROTAS DE PRODUTOS ==
app.get('/produtos', async (req, res) => {
    try {
        const produtos = await Produto.find();
        res.json(produtos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/produtos/sku/:sku', async (req, res) => {
    try {
        const produto = await Produto.findOne({ sku: req.params.sku });
        res.json(produto);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/produtos/:id', async (req, res) => {
    try {
        const produto = await Produto.findById(req.params.id);
        if (!produto) return res.status(404).json({ message: 'Produto não encontrado' });
        res.json(produto);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/produtos', async (req, res) => {
    const novoProduto = new Produto(req.body);
    try {
        const produtoSalvo = await novoProduto.save();
        res.status(201).json(produtoSalvo);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "SKU já cadastrado." });
        }
        res.status(400).json({ message: err.message });
    }
});

app.put('/produtos/:id', async (req, res) => {
    try {
        const produtoAtualizado = await Produto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!produtoAtualizado) return res.status(404).json({ message: 'Produto não encontrado' });
        res.json(produtoAtualizado);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/produtos/:id', async (req, res) => {
    try {
        const produtoDeletado = await Produto.findByIdAndDelete(req.params.id);
        if (!produtoDeletado) return res.status(404).json({ message: 'Produto deletado com sucesso' });
        res.json({ message: 'Produto deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// NOVO ENDPOINT
// app.get('/produtos/tipo/:tipo', async (req, res) => {
//     try {
//         const produtos = await Produto.find({ tipo: req.params.tipo });
//         res.json(produtos);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// == ROTAS DE SAÍDAS ==
app.get('/saidas', async (req, res) => {
    try {
        const saidas = await Saida.find().populate('produto').sort({ createdAt: -1 });
        res.json(saidas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/registrar-saida', async (req, res) => {
    const { produto: produtoId, quantidade: quantidadeSaida } = req.body;
    if (!produtoId || !quantidadeSaida || quantidadeSaida <= 0) {
        return res.status(400).json({ message: "Dados da saída inválidos." });
    }
    try {
        const produto = await Produto.findById(produtoId);
        if (!produto) return res.status(404).json({ message: "Produto não encontrado." });
        if (produto.quantidade < quantidadeSaida) return res.status(400).json({ message: `Estoque insuficiente. Disponível: ${produto.quantidade}` });
        produto.quantidade -= quantidadeSaida;
        await produto.save();
        const novaSaida = new Saida({ produto: produtoId, quantidade: quantidadeSaida });
        await novaSaida.save();
        await novaSaida.populate('produto');
        res.status(201).json(novaSaida);
    } catch (error) {
        console.error("Erro ao registrar saída:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
});

// NOVO ENDPOINT
// app.get('/fornecedores', async (req, res) => {
//     try {
//         const fornecedores = await Fornecedor.find();
//         res.json(fornecedores);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// == ROTAS DE FORNECEDORES E SERVIÇOS ==
app.get('/api/consulta-cnpj/:cnpj', async (req, res) => {
    try {
        const cnpj = req.params.cnpj.replace(/\D/g, '');
        const { data } = await axios.get(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`);
        res.json(data);
    } catch (error) {
        console.error("Erro ao consultar ReceitaWS:", error.message);
        res.status(500).json({ message: "Erro ao consultar a API da Receita." });
    }
});

app.post('/fornecedores', async (req, res) => {
    const novoFornecedor = new Fornecedor(req.body);
    try {
        const fornecedorSalvo = await novoFornecedor.save();
        res.status(201).json(fornecedorSalvo);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Fornecedor com este CNPJ já cadastrado." });
        }
        res.status(400).json({ message: err.message });
    }
});

app.get('/api/fornecedores/cnpj/:cnpj', async (req, res) => {
    try {
        const fornecedor = await Fornecedor.findOne({ cnpj: req.params.cnpj });
        res.json(fornecedor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
    console.log(`Servidor completo rodando na porta ${PORT}`);
});