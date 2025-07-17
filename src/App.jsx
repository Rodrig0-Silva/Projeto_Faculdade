import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { FaHome, FaPlus, FaArrowCircleDown, FaPrint } from "react-icons/fa";
import Home from "./pages/Home";
import AdicionarProduto from "./pages/AdicionarProduto";
import SaidaProdutos from "./pages/SaidaProdutos";
import ImpressaoSaida from "./pages/ImpressaoSaida";
import AddFornecedor from "./pages/Fornecedor/AddFornecedor";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./components/MenuButtons.css";
import './App.css';


export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      <nav className="menu-nav">
        <Link to="/" className="App-button">
          <FaHome /> Início
        </Link>
        <Link to="/adicionar" className="App-button">
          <FaPlus /> Adicionar Produto
        </Link>
        <Link to="/saida" className="App-button">
          <FaArrowCircleDown /> Saída de Produtos
        </Link>
        <Link to="/impressao" className="App-button">
          <FaPrint /> Impressão de Saída
        </Link>
        <Link to="/fornecedor" className="App-button">
          <FaPlus /> Adicionar Fornecedor
        </Link>
      </nav>

      
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/adicionar" element={<AdicionarProduto />} />
          <Route path="/saida" element={<SaidaProdutos />} />
          <Route path="/impressao" element={<ImpressaoSaida />} />
          <Route path="/fornecedor" element={<AddFornecedor />} />
      </Routes>

    </BrowserRouter>
  );
}