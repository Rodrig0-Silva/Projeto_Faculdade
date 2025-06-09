import { useEffect, useState } from "react";
import axios from "axios";

export default function ListaProdutos() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/produtos")
      .then(res => setProdutos(res.data));
  }, []);

  // Função para redirecionar para detalhes (exemplo: alert, pode ser navegação)
  function verDetalhes(produto) {
    alert(`Informações do produto:\nMarca: ${produto.marca}\nID: ${produto._id}\nTipo: ${produto.tipo}`);
    // Aqui você pode usar navegação se quiser, ex: useNavigate do react-router-dom
  }

  return (
    <div>
      <h2>Produtos em Estoque</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {produtos.map(produto => (
          <li
            key={produto._id}
            style={{
              border: "1px solid #ccc",
              margin: "10px 0",
              padding: 10,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 20
            }}
          >
            {produto.imagem && (
              <img
                src={produto.imagem}
                alt={produto.marca}
                style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }}
              />
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button
                style={{
                  background: "#1976d2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "4px 12px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  width: "fit-content"
                }}
                onClick={() => verDetalhes(produto)}
              >
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