import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./AddFornecedor.css"; // Certifique-se de que este arquivo contém o CSS abaixo

export default function AddFornecedor({ onFornecedorAdicionado }) {
  const [form, setForm] = useState({
    empresa: "", cnpj: "", endereco: "", telefone: "", email: "", contato: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });

    if (name === "cnpj" && value.replace(/\D/g, "").length === 14) {
      setIsLoadingCnpj(true);
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/consulta-cnpj/${value}`);
        if (data && data.status !== "ERROR") {
          toast.success("Dados do CNPJ preenchidos!");
          setForm(prev => ({
            ...prev,
            empresa: data.nome || "",
            endereco: `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.municipio}/${data.uf}`,
            telefone: data.telefone || "",
            email: data.email || ""
          }));
        } else {
          toast.warn(data.message || "CNPJ não encontrado ou inválido.");
        }
      } catch (error) {
        toast.error("Erro ao consultar CNPJ. Tente novamente.");
        console.error("Falha na consulta de CNPJ:", error);
      } finally {
        setIsLoadingCnpj(false);
      }
    }
  };

  const validarCampos = () => {
    const newErrors = {};
    if (!form.empresa) newErrors.empresa = "O nome da empresa é obrigatório";
    if (!form.cnpj) newErrors.cnpj = "O CNPJ é obrigatório";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validarCampos();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const { data: existente } = await axios.get(`${import.meta.env.VITE_API_URL}/api/fornecedores/cnpj/${form.cnpj}`);
      if (existente) {
        toast.error("Fornecedor com este CNPJ já está cadastrado!");
        return;
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/fornecedores`, form);
      toast.success("Fornecedor cadastrado com sucesso!");
      setForm({ empresa: "", cnpj: "", endereco: "", telefone: "", email: "", contato: "" });
      if (onFornecedorAdicionado) onFornecedorAdicionado();
    } catch (error) {
      toast.error("Erro ao cadastrar fornecedor.");
      console.error("Falha no cadastro:", error);
    }
  };

  return (
    <div className="fornecedor-page">
      <form className="fornecedor-form" onSubmit={handleSubmit}>
        <h2>Cadastro de Fornecedor</h2>
        <p>Digite o CNPJ para tentar o preenchimento automático.</p>

        <label>CNPJ {isLoadingCnpj && <small>(Buscando...)</small>}</label>
        <input name="cnpj" placeholder="00.000.000/0000-00" value={form.cnpj} onChange={handleChange} disabled={isLoadingCnpj} />
        {errors.cnpj && <span style={{ color: "red" }}>{errors.cnpj}</span>}

        <label>Nome da Empresa</label>
        <input name="empresa" placeholder="Nome da Empresa" value={form.empresa} onChange={handleChange} />
        {errors.empresa && <span style={{ color: "red" }}>{errors.empresa}</span>}

        <label>Endereço</label>
        <input name="endereco" placeholder="Endereço Completo" value={form.endereco} onChange={handleChange} />

        <label>Telefone</label>
        <input name="telefone" placeholder="(00) 00000-0000" value={form.telefone} onChange={handleChange} />

        <label>E-mail</label>
        <input name="email" type="email" placeholder="contato@empresa.com" value={form.email} onChange={handleChange} />

        <label>Nome do Contato</label>
        <input name="contato" placeholder="Pessoa de Contato" value={form.contato} onChange={handleChange} />

        <button type="submit" disabled={isLoadingCnpj}>
          {isLoadingCnpj ? "Aguarde..." : "Cadastrar Fornecedor"}
        </button>
      </form>
    </div>
  );
}
