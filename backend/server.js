import express from 'express';
import axios from 'axios';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado ao MongoDB.'))
    .catch(error => console.error('Erro ao conectar com o MongoDB:', error));

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
    contato: String,
    status: { type: String, default: 'ativo' } // Adicionado campo status
}, { timestamps: true });
const Fornecedor = mongoose.model('Fornecedor', FornecedorSchema);

const SaidaSchema = new mongoose.Schema({
    produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true },
    quantidade: { type: Number, required: true }
}, { timestamps: true });
const Saida = mongoose.model('Saida', SaidaSchema);

app.get('/produtos', async (req, res) => {
    try {
        const produtos = await Produto.find();
        res.json(produtos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/produtos/sku/:sku', async (req, res) => {
    try {
        const produto = await Produto.findOne({ sku: req.params.sku });
        res.json(produto);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/produtos/:id', async (req, res) => {
    try {
        const produto = await Produto.findById(req.params.id);
        if (!produto) return res.status(404).json({ message: 'Produto não encontrado' });
        res.json(produto);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/produtos', async (req, res) => {
    const novoProduto = new Produto(req.body);
    try {
        const produtoSalvo = await novoProduto.save();
        res.status(201).json(produtoSalvo);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "SKU já cadastrado." });
        }
        res.status(400).json({ message: error.message });
    }
});

app.put('/produtos/:id', async (req, res) => {
    try {
        const produtoAtualizado = await Produto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!produtoAtualizado) return res.status(404).json({ message: 'Produto não encontrado' });
        res.json(produtoAtualizado);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/produtos/:id', async (req, res) => {
    try {
        const produtoDeletado = await Produto.findByIdAndDelete(req.params.id);
        if (!produtoDeletado) return res.status(404).json({ message: 'Produto não encontrado' });
        res.json({ message: 'Produto deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/saidas', async (req, res) => {
    try {
        const saidas = await Saida.find().populate('produto').sort({ createdAt: -1 });
        res.json(saidas);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        if (produto.quantidade < quantidadeSaida) {
            return res.status(400).json({ message: `Estoque insuficiente. Disponível: ${produto.quantidade}` });
        }
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
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Fornecedor com este CNPJ já cadastrado." });
        }
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/fornecedores/cnpj/:cnpj', async (req, res) => {
    try {
        const fornecedor = await Fornecedor.findOne({ cnpj: req.params.cnpj });
        res.json(fornecedor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/produtos/estoque-baixo', async (req, res) => {
    try {
        const limite = parseInt(req.query.limite) || 5;
        const produtos = await Produto.find({ quantidade: { $lt: limite } });
        res.json(produtos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar produtos com estoque baixo.' });
    }
});

app.put('/fornecedores/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ message: 'Status não fornecido.' });

        const fornecedorAtualizado = await Fornecedor.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!fornecedorAtualizado) return res.status(404).json({ message: 'Fornecedor não encontrado.' });

        res.json(fornecedorAtualizado);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar status do fornecedor.' });
    }
});

//servidor
const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
    console.log(`Servidor completo rodando na porta ${PORT}`);
});