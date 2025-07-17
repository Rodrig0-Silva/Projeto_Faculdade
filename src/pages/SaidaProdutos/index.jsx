import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function SaidaProdutos() {
  const [saidas, setSaidas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState({ produto: "", quantidade: 1 });
  const [isLoading, setIsLoading] = useState(false);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      const [resSaidas, resProdutos] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/saidas`),
        axios.get(`${import.meta.env.VITE_API_URL}/produtos`)
      ]);
      setSaidas(resSaidas.data);
      setProdutos(resProdutos.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Não foi possível carregar os dados da página.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.produto) {
      return toast.warn("Por favor, selecione um produto.");
    }

    const produtoSelecionado = produtos.find(p => p._id === form.produto);
    if (produtoSelecionado && Number(form.quantidade) > produtoSelecionado.quantidade) {
      return toast.error(`Estoque insuficiente. Apenas ${produtoSelecionado.quantidade} unidades disponíveis.`);
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/registrar-saida`, {
        produto: form.produto,
        quantidade: Number(form.quantidade)
      });

      toast.success("Saída registrada com sucesso!");
      setForm({ produto: "", quantidade: 1 });

      setSaidas(prevSaidas => [response.data, ...prevSaidas]);
      setProdutos(prevProdutos =>
        prevProdutos.map(p =>
          p._id === response.data.produto._id ? response.data.produto : p
        )
      );
    } catch (error) {
      console.error("Erro ao registrar saída:", error);
      const errorMessage = error.response?.data?.message || "Não foi possível registrar a saída.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="saida-produtos-page">
      <style>{`
        .saida-produtos-page {
          max-width: 960px;
          margin: auto;
          padding: 24px;
        }

        .saida-produtos-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
          background: #fdfdfd;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        .saida-produtos-form select,
        .saida-produtos-form input {
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 14px;
        }

        .saida-produtos-form button {
          background-color: #007bff;
          color: white;
          font-weight: bold;
          padding: 12px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
        }

        .saida-produtos-form button:hover {
          background-color: #0056b3;
        }

        .saida-produtos-lista {
          list-style: none;
          padding-left: 0;
        }

        .saida-produtos-lista li {
          padding: 12px;
          background-color: #fff;
          border: 1px solid #ccc;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        @media (max-width: 600px) {
          .saida-produtos-form {
            padding: 16px;
          }

          .saida-produtos-form select,
          .saida-produtos-form input,
          .saida-produtos-form button {
            font-size: 13px;
            padding: 10px;
          }

          .saida-produtos-lista li {
            font-size: 14px;
          }
        }
      `}</style>

      <h1>Registrar Saída de Produtos</h1>
      <form className="saida-produtos-form" onSubmit={handleSubmit}>
        <select name="produto" value={form.produto} onChange={handleChange} required>
          <option value="">Selecione o produto</option>
          {produtos
            .filter(p => p.quantidade > 0)
            .map(prod => (
              <option key={prod._id} value={prod._id}>
                {prod.nome} (Estoque: {prod.quantidade})
              </option>
            ))}
        </select>
        <input
          name="quantidade"
          type="number"
          min="1"
          placeholder="Quantidade"
          value={form.quantidade}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Registrando..." : "Registrar Saída"}
        </button>
      </form>

      <h2>Histórico de Saídas Recentes</h2>
      <ul className="saida-produtos-lista">
        {saidas.map(saida => (
          <li key={saida._id}>
            <strong>{saida.produto?.nome || 'Produto não encontrado'}</strong> | 
            Quantidade: {saida.quantidade} |
            Data: {new Date(saida.createdAt).toLocaleString('pt-BR')}
          </li>
        ))}
      </ul>
    </div>
  );
}
