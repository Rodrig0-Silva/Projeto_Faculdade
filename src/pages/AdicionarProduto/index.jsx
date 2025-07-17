import React from "react";
import { useNavigate } from "react-router-dom";
import AddNewProd from "../../components/addNewProd";

export default function AdicionarProduto() {
  const navigate = useNavigate();

  const handleProdutoAdicionado = () => {
  
    navigate("/");
  };

  return (
    <div>
      <h1>Adicionar Produto</h1>
      {/*Passamos a nossa função como prop para o componente filho. */}
      <AddNewProd onProdutoAdicionado={handleProdutoAdicionado} />
    </div>
  );
}