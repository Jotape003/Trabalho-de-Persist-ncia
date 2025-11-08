import React, { useState, useEffect } from 'react';
import type { Produto, NovoProduto } from './types';
import * as api from './apiService'; // Importa nosso cliente de API
import './App.css'; 

function App() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [resultado, setResultado] = useState<string>("");
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<Produto | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novoPreco, setNovoPreco] = useState(0);

  const carregarProdutos = async () => {
    try {
      const data = await api.listarProdutos();
      setProdutos(data);
      if (!produtoEmEdicao) {
        setResultado(`Total de ${data.length} produtos carregados.`);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      setResultado("Erro ao carregar produtos.");
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const limparFormulario = () => {
    setNovoNome("");
    setNovaCategoria("");
    setNovoPreco(0);
    setProdutoEmEdicao(null);
  };

  const handleSubmitFormulario = async (e: React.FormEvent) => {
    e.preventDefault(); 
    
    const produtoPayload: NovoProduto = {
      nome: novoNome,
      categoria: novaCategoria,
      preco: novoPreco,
    };

    try {
      if (produtoEmEdicao) {
        const data = await api.atualizarProduto(produtoEmEdicao.id, produtoPayload);
        setResultado(data.mensagem);
      } else {
        const data = await api.criarProduto(produtoPayload);
        setResultado(`Produto "${data.produto.nome}" criado com sucesso!`);
      }
      
      limparFormulario();
      carregarProdutos();

    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      setResultado("Erro ao salvar produto.");
    }
  };
  
  const handleEditar = (produto: Produto) => {
    setProdutoEmEdicao(produto);
    setNovoNome(produto.nome);
    setNovaCategoria(produto.categoria);
    setNovoPreco(produto.preco);
    setResultado(`Editando: ${produto.nome}`);
  };


  const handleApagarProduto = async (id: number) => {
    if (window.confirm("Tem certeza que deseja apagar este produto?")) {
      try {
        const data = await api.apagarProduto(id);
        setResultado(data.mensagem);
        carregarProdutos();
      } catch (error) {
        console.error("Erro ao apagar produto:", error);
        setResultado("Erro ao apagar produto.");
      }
    }
  };

  const handleMaisCaro = async () => {
    try {
      const produto = await api.obterProdutoMaisCaro();
      setResultado(`Mais caro: ${produto.nome} (R$ ${produto.preco})`);
    } catch (error) {
      setResultado("Erro ao buscar produto.");
    }
  };

  const handleMaisBarato = async () => {
    try {
      const produto = await api.obterProdutoMaisBarato();
      setResultado(`Mais barato: ${produto.nome} (R$ ${produto.preco})`);
    } catch (error) {
      setResultado("Erro ao buscar produto.");
    }
  };
  
  const handleMedia = async () => {
    try {
      const data = await api.obterPrecoMedio();
      setResultado(`Preço médio: R$ ${data.preco_medio}`);
    } catch (error) {
      setResultado("Erro ao buscar média.");
    }
  };

  const handleProdutosAcimaDaMedia = async () => {
    try {
      const produtos = await api.obterProdutosAcimaDaMedia();
      setResultado(`Produtos acima da média: ${produtos.length}`);
      setProdutos(produtos);
    } catch (error) {
      setResultado("Erro ao buscar produtos.");
    }
  }

  const handleProdutosAbaixoDaMedia = async () => {
    try {
      const produtos = await api.obterProdutosAbaixoDaMedia();
      setResultado(`Produtos abaixo da média: ${produtos.length}`);
      setProdutos(produtos);
    } catch (error) {
      setResultado("Erro ao buscar produtos.");
    }
  }

  return (
    <div className="App">
      <h1>Gestão de Produtos</h1>

      <div className="botoes-acao">
        <button onClick={carregarProdutos}>Recarregar Lista</button>
        <button onClick={handleMaisCaro}>Ver Mais Caro</button>
        <button onClick={handleMaisBarato}>Ver Mais Barato</button>
        <button onClick={handleMedia}>Ver Média de Preço</button>
        <button onClick={handleProdutosAcimaDaMedia}>Produtos Acima da Média</button>
        <button onClick={handleProdutosAbaixoDaMedia}>Produtos Abaixo da Média</button>
      </div>

      <p className="resultado">{resultado}</p>

      <div className="container">
        <div className="form-container">
          <h2>{produtoEmEdicao ? 'Atualizar Produto' : 'Novo Produto'}</h2>
          
          <form onSubmit={handleSubmitFormulario}>
            <input
              type="text"
              placeholder="Nome"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Categoria"
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Preço"
              value={novoPreco}
              onChange={(e) => setNovoPreco(parseFloat(e.target.value))}
              required
            />

            <button type="submit">
              {produtoEmEdicao ? 'Atualizar' : 'Criar'}
            </button>

            {produtoEmEdicao && (
              <button type="button" onClick={limparFormulario} className="botao-cancelar">
                Cancelar Edição
              </button>
            )}
          </form>
        </div>

        <div className="lista-container">
          <h2>Lista de Produtos</h2>
          <ul>
            {produtos.map((produto) => (
              <li key={produto.id}>
                <span>
                  <strong>{produto.nome}</strong> ({produto.categoria}) - R$ {produto.preco.toFixed(2)}
                </span>
                <div className="botoes-item">
                  <button
                    className="botao-editar"
                    onClick={() => handleEditar(produto)}
                  >
                    Editar
                  </button>
                  <button
                    className="botao-apagar"
                    onClick={() => handleApagarProduto(produto.id)}
                  >
                    Apagar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;