import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./ImpressaoSaida.css"; // Certifique-se de ter um CSS para estilizar a página

export default function ImpressaoSaida() {
  const [saidas, setSaidas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Aqui Rodrigo: Agora fazemos apenas UMA chamada de API, já com os dados populados.
  useEffect(() => {
    async function carregarSaidas() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/saidas`);
        setSaidas(response.data);
      } catch (error) {
        console.error("Erro ao buscar saídas:", error);
        alert("Não foi possível carregar o histórico de saídas.");
      } finally {
        setIsLoading(false);
      }
    }

    carregarSaidas();
  }, []);

  function gerarPDF() {
    if (saidas.length === 0) {
      alert("Não há dados de saída para gerar o PDF.");
      return;
    }

    const doc = new jsPDF();
    doc.text("Relatório de Saída de Produtos", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Produto", "Quantidade", "Data da Saída"]],
      // Aqui Rodrigo: Acessamos o nome do produto diretamente. Não precisamos mais de getNomeProduto.
      body: saidas.map(saida => [
        saida.produto ? saida.produto.nome : 'Produto não encontrado', // Acessamos o nome diretamente
        saida.quantidade,
        new Date(saida.createdAt || saida.data).toLocaleString('pt-BR') // Usando o timestamp do Mongoose
      ])
    });

    doc.save("relatorio-saida-produtos.pdf");
  }

  if (isLoading) {
    return <p>Carregando dados...</p>;
  }

  return (
    <div>
      <h1>Impressão de Saída</h1>
      <button onClick={gerarPDF} disabled={saidas.length === 0}>
        Gerar PDF
      </button>

      {saidas.length === 0 ? (
        <p style={{marginTop: 20}}>Nenhum registro de saída encontrado.</p>
      ) : (
        <ul>
          {saidas.map(saida => (
            <li key={saida._id}>
              Produto: <strong>{saida.produto ? saida.produto.nome : 'N/A'}</strong> | 
              Quantidade: {saida.quantidade} | 
              Data: {new Date(saida.createdAt || saida.data).toLocaleString('pt-BR')}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}