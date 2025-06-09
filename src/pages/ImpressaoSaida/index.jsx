import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ImpressaoSaida() {
  const [saidas, setSaidas] = useState([]);
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/saidas")
      .then(res => setSaidas(res.data));
    axios.get("http://localhost:3001/produtos")
      .then(res => setProdutos(res.data));
  }, []);

  function getNomeProduto(id) {
    const prod = produtos.find(p => p._id === id);
    return prod ? prod.nome : id;
  }

  function gerarPDF() {
    const doc = new jsPDF();
    doc.text("Relatório de Saída de Produtos", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Produto", "Quantidade", "Data"]],
      body: saidas.map(saida => [
        getNomeProduto(saida.produto),
        saida.quantidade,
        new Date(saida.data).toLocaleString()
      ])
    });

    doc.save("saida-produtos.pdf");
  }

  return (
    <div>
      <h1>Impressão de Saída</h1>
      <button onClick={gerarPDF}>Gerar PDF</button>
      <ul>
        {saidas.map(saida => (
          <li key={saida._id}>
            Produto: {getNomeProduto(saida.produto)} | Quantidade: {saida.quantidade} | Data: {new Date(saida.data).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}