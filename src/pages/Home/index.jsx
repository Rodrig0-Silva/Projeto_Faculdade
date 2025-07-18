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
    const sku = produto.sku?.toLowerCase() || "";
    return nome.includes(termo) || tipo.includes(termo) || sku.includes(termo);
  });
  const listaExibida = busca ? produtosFiltrados : produtos;

  if (isLoading) return <p className="mensagem-feedback">Carregando produtos...</p>;
  if (error) return <p className="mensagem-feedback" style={{ color: "var(--danger-color)" }}>{error}</p>;

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
        {listaExibida.length > 0 ? (
          listaExibida.map((produto) => (
            <div key={produto._id} className="card-produto">
              <img src={produto.imagem || 'https://via.placeholder.com/300x200.png?text=Sem+Imagem'} alt={produto.nome} />
              <div className="card-produto-info">
                <h3>{produto.nome}</h3>
                <p>SKU: {produto.sku}</p>
                <p>Categoria: {produto.tipo}</p>
                <p className="preco">Preço: R$ {Number(produto.preco).toFixed(2)}</p>
                {produto.quantidade === 0 ? (
                  <p className="esgotado">PRODUTO ESGOTADO</p>
                ) : (
                  <p>Estoque: {produto.quantidade} unidades</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="mensagem-feedback">
            {busca ? `Nenhum produto encontrado para "${busca}" 😕` : "Nenhum produto cadastrado. 😕"}
          </p>
        )}
      </div>
    </div>
  );
}