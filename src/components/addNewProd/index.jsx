import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Scanner } from "@yudiel/react-qr-scanner";
import "./AddNewProd.css";

const formStyles = { display: "flex", flexDirection: "column", gap: 10 };

export default function AddNewProd({ onProdutoAdicionado }) {
  const [form, setForm] =useState({
    nome: "",
    sku: "",
    descricao: "",
    quantidade: 1,
    preco: "",
    imagem: "",
    tipo: ""
  });

  const [exibirScanner, setExibirScanner] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sku = form.sku.trim().toUpperCase();
    if (!sku) return toast.warn("Informe ou escaneie um código de barras válido.");

    try {
      const { data: existente } = await axios.get(`${import.meta.env.VITE_API_URL}/produtos/sku/${sku}`);

      if (existente) {
     
        const novaQuantidade = Number(existente.quantidade) + Number(form.quantidade);
        await axios.put(`${import.meta.env.VITE_API_URL}/produtos/${existente._id}`, {
          quantidade: novaQuantidade
        });
        toast.info(`Quantidade do produto "${existente.nome}" atualizada para ${novaQuantidade}.`);
      } else {

        await axios.post(`${import.meta.env.VITE_API_URL}/produtos`, { ...form, sku });
        toast.success("Produto adicionado com sucesso!");
      }

      setForm({
        nome: "",
        sku: "",
        descricao: "",
        quantidade: 1,
        preco: "",
        imagem: "",
        tipo: ""
      });

      if (onProdutoAdicionado) onProdutoAdicionado();
      setExibirScanner(false);

    } catch (error) {
      toast.error("Erro ao processar o produto. Verifique o console.");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-prod-form">
  <h2>Cadastro de Produto</h2>


      <button type="button" onClick={() => setExibirScanner(!exibirScanner)}>
        {exibirScanner ? "Fechar Scanner" : "Abrir Leitor de Código de Barras"}
      </button>

      {exibirScanner && (
        <div style={{ margin: "10px 0", maxWidth: "400px" }}>
          <Scanner
            onResult={(text) => {
              if (text) {
                setForm((prev) => ({ ...prev, sku: text }));
                toast.info("Código detectado!");
                setExibirScanner(false);
              }
            }}
            onError={(err) => console.warn("Scanner error", err)}
            constraints={{ facingMode: "environment" }}
            
          />
          
        </div>
        
      )}

      <input name="nome" placeholder="Nome do Produto" value={form.nome} onChange={handleChange} required />
      <input name="sku" placeholder="Código de Barras (SKU)" value={form.sku} onChange={handleChange} required />
      <input name="descricao" placeholder="Descrição" value={form.descricao} onChange={handleChange} />
      <input name="quantidade" type="number" min="1" placeholder="Quantidade" value={form.quantidade} onChange={handleChange} required />
      <input name="preco" type="number" step="0.01" placeholder="Preço" value={form.preco} onChange={handleChange} required />
      <input name="tipo" placeholder="Tipo ou Categoria" value={form.tipo} onChange={handleChange} />
      <input name="imagem" placeholder="URL da Imagem" value={form.imagem} onChange={handleChange} />
      <button type="submit">Salvar Produto</button>
    </form>
  );
}