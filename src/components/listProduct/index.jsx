
import { useEffect, useState } from "react";
import axios from "axios";
import "./ListaProdutos.css";

export default function ListaProdutos() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/produtos")
      .then(res => setProdutos(res.data));
  }, []);

  function verDetalhes(produto) {
    alert(`Informações do produto:\nMarca: ${produto.marca}\nID: ${produto._id}\nTipo: ${produto.tipo}`);
  }

  return (
    <div>
      <h2>Produtos em Estoque</h2>
      <ul className="lista-produtos-container">
        {produtos.map(produto => (
          <li key={produto._id} className="item-produto">
            {produto.imagem && (
              <img
                src={produto.imagem}
                alt={produto.marca}
                className="item-produto-imagem"
              />
            )}
            <div className="item-produto-detalhes">
              <button onClick={() => verDetalhes(produto)}>
                {produto.nome}
              </button>
              <span><b>Código de Barras:</b> {produto.sku}</span>
              <span><b>Quantidade:</b> {produto.quantidade}</span>
              <span><b>Preço:</b> R$ {produto.preco}</span>
              <span><b>Tipo:</b> {produto.tipo}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}