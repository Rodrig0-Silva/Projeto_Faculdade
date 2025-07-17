import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/produtos`);
        setProdutos(response.data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setError("Não foi possível carregar os produtos. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    }

    carregarProdutos();
  }, []);

  const produtosFiltrados = produtos.filter((produto) => {
    const termo = busca.trim().toLowerCase();
    const nome = produto.nome?.toLowerCase() || "";
    const tipo = produto.tipo?.toLowerCase() || "";
    const sku = produto.sku || "";

    return (
      nome.includes(termo) ||
      tipo.includes(termo) ||
      String(sku).toLowerCase().includes(termo)
    );
  });

  const listaExibida = busca
    ? produtosFiltrados
    : produtos.filter((p) => p.quantidade > 0);

  if (isLoading) return <p>Carregando produtos...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="home-page">
      <h2>Produtos em Estoque</h2>

      <input
        type="text"
        placeholder="Buscar por nome, tipo ou código..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="campo-busca"
      />

      <div className="lista-produtos">
        {listaExibida.length === 0 && !busca ? (
          <p style={{ marginTop: 20 }}>Nenhum produto em estoque. 😕</p>
        ) : listaExibida.length === 0 && busca ? (
          <p style={{ marginTop: 20 }}>Nenhum produto encontrado para "{busca}" 😕</p>
        ) : (
          listaExibida.map((produto) => (
            <div
              key={produto._id || produto.id}
              className={`card-produto ${produto.quantidade === 0 ? "esgotado" : ""}`}
            >
              <img src={produto.imagem} alt={produto.nome} />
              <h3>{produto.nome}</h3>
              <p>Cód. de Barras: {produto.sku}</p>
              <p>Tipo: {produto.tipo}</p>
              <p>Preço: R$ {Number(produto.preco).toFixed(2)}</p>
              {produto.quantidade === 0 ? (
                <p style={{ color: "red", fontWeight: "bold" }}>Produto esgotado</p>
              ) : (
                <p>Quantidade: {produto.quantidade}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
