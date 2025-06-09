import { useEffect, useState } from "react";
import axios from "axios";

export default function SaidaProdutos() {
  const [saidas, setSaidas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState({ produto: "", quantidade: 1 });

  useEffect(() => {
    axios.get("http://localhost:3001/saidas")
      .then(res => setSaidas(res.data));
    axios.get("http://localhost:3001/produtos")
      .then(res => setProdutos(res.data));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    axios.post("http://localhost:3001/saidas", form)
      .then(res => {
        setSaidas([...saidas, res.data]);
        setForm({ produto: "", quantidade: 1 });
      });
  }

  return (
    <div>
      <h1>Saída de Produtos</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <select
          name="produto"
          value={form.produto}
          onChange={handleChange}
          required
        >
          <option value="">Selecione o produto</option>
          {produtos.map(prod => (
            <option key={prod._id} value={prod._id}>
              {prod.nome} (Estoque: {prod.quantidade})
            </option>
          ))}
        </select>
        <input
          name="quantidade"
          type="number"
          min={1}
          placeholder="Quantidade"
          value={form.quantidade}
          onChange={handleChange}
          required
        />
        <button type="submit">Registrar Saída</button>
      </form>
      <ul>
        {saidas.map(saida => (
          <li key={saida._id}>
            Produto ID: {saida.produto} | Quantidade: {saida.quantidade}
          </li>
        ))}
      </ul>
    </div>
  );
}