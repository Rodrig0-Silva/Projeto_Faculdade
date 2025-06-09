import React, { useState } from "react";
import axios from "axios";

export default function AddNewProd({ onProdutoAdicionado }) {
  const [form, setForm] = useState({
    nome: "",
    sku: "",
    descricao: "",
    quantidade: 0,
    marca: "",
    preco: "",
    cor: "",
    imagem: "",
    tipo: ""
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/produtos", form);
      setForm({
        nome: "",
        sku: "",
        descricao: "",
        quantidade: 0,
        marca: "",
        preco: "",
        cor: "",
        imagem: "",
        tipo: ""
      });
      if (onProdutoAdicionado) onProdutoAdicionado();
      alert("Produto adicionado!");
    } catch (error) {
      alert("Erro ao adicionar produto. Tente novamente");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required />
      <input name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} />
      <input name="descricao" placeholder="Descrição" value={form.descricao} onChange={handleChange} />
      <input name="quantidade" type="number" placeholder="Quantidade" value={form.quantidade} onChange={handleChange} required />
      <input name="marca" placeholder="Marca" value={form.marca} onChange={handleChange} />
      <input name="preco" type="number" placeholder="Preço" value={form.preco} onChange={handleChange} />
      <input name="cor" placeholder="Cor" value={form.cor} onChange={handleChange} />
      <input name="tipo" placeholder="Tipo" value={form.tipo} onChange={handleChange} />
      <input name="imagem" placeholder="URL da Imagem" value={form.imagem} onChange={handleChange} />
      <button type="submit">Adicionar Produto</button>
    </form>
  );
}